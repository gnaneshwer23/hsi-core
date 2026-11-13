/** Reviewer authorisation is a separate, deny-by-default server-side check.
 * A role string in a review row does not grant authority.
 * Authentication must independently verify the principal through Neon Auth.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import {reviewerScopeFor,scopeIdForDisease} from "../investigationScope";
export const HSI_REVIEWER_SCOPES=Object.freeze(["ssc","ra"] as const);
export type HsiReviewerScope=typeof HSI_REVIEWER_SCOPES[number];
/** No default disease-to-authority mapping; unsupported domains require separate acceptance. */
export function reviewerScopeForDisease(disease:unknown):HsiReviewerScope|null{
 const scope=scopeIdForDisease(disease);
 return scope===null?null:reviewerScopeFor(scope);
}
export async function verifyHsiReviewerAuthority(input:{
 principal:string;reviewedAt:string;databaseUrl:string;neonProjectId?:string|null;scope:HsiReviewerScope;
}):Promise<boolean>{
 if(!input||typeof input.principal!=="string"||!input.principal.trim()||!Number.isFinite(Date.parse(input.reviewedAt))||Date.parse(input.reviewedAt)>Date.now()||!HSI_REVIEWER_SCOPES.includes(input.scope))return false;
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  const rows=await sql`SELECT 1 FROM hsi_reviewer_authority a
    JOIN neon_auth."user" u ON u.id::text=a.principal_id
    WHERE a.principal_id=${input.principal}
      AND a.reviewer_role='scientific_reviewer'
      AND a.scope=${input.scope}
      AND u."emailVerified"=true AND COALESCE(u.banned,false)=false
      AND a.granted_at<=${input.reviewedAt}::timestamptz
      AND (a.revoked_at IS NULL OR a.revoked_at>${input.reviewedAt}::timestamptz)
      AND a.revoked_at IS NULL LIMIT 1`;
  return rows.length===1;
 }finally{await sql.close();}
}
