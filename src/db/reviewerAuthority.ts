/** Reviewer authorisation is a separate, deny-by-default server-side check.
 * A role string in a review row does not grant authority.
 * Authentication must independently verify the principal through Neon Auth.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
export async function verifyHsiReviewerAuthority(input:{
 principal:string;reviewedAt:string;databaseUrl:string;neonProjectId?:string|null;scope?:"ssc"|"ra";
}):Promise<boolean>{
 if(!input.principal.trim()||!Number.isFinite(Date.parse(input.reviewedAt))||Date.parse(input.reviewedAt)>Date.now()||!["ssc","ra"].includes(input.scope??"ssc"))return false;
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  const rows=await sql`SELECT 1 FROM hsi_reviewer_authority a
    JOIN neon_auth."user" u ON u.id=a.principal_id
    WHERE a.principal_id=${input.principal}
      AND a.reviewer_role='scientific_reviewer'
      AND a.scope=${input.scope??"ssc"}
      AND u."emailVerified"=true AND COALESCE(u.banned,false)=false
      AND a.granted_at<=${input.reviewedAt}::timestamptz
      AND (a.revoked_at IS NULL OR a.revoked_at>${input.reviewedAt}::timestamptz)
      AND a.revoked_at IS NULL LIMIT 1`;
  return rows.length===1;
 }finally{await sql.close();}
}
