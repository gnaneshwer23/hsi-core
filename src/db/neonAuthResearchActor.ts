/** Trusted server-side session verification against the HSI Neon Auth database.
 * Caller extracts the Better Auth session token from a secure request cookie.
 * Never accept a principal ID or role from client JSON, and never log tokens.
 * Session tokens must only be handled on a trusted backend over TLS.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import type {TrustedResearchActor} from "./researchInvestigationStore";
/** Verified provider identity; an empty roles array is not a research grant. */
export async function authenticateHsiNeonIdentity(input:{
 sessionToken:string|null|undefined;databaseUrl:string;neonProjectId?:string|null;
}):Promise<TrustedResearchActor|null>{
 const token=input.sessionToken;
 if(typeof token!=="string"||token.length<16||token.length>4096||/\s/.test(token))return null;
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  const rows=await sql`SELECT u.id::text AS principal_id,
   a.access_role AS research_role,
   EXISTS(SELECT 1 FROM hsi_reviewer_authority r
    WHERE r.principal_id=u.id::text AND r.revoked_at IS NULL AND r.scope='ssc'
      AND r.reviewer_role='scientific_reviewer' AND r.granted_at<=now()) AS reviewer
   FROM neon_auth.session s
   JOIN neon_auth."user" u ON u.id=s."userId"
   LEFT JOIN hsi_research_access a ON a.principal_id=u.id::text
     AND a.revoked_at IS NULL AND a.granted_at<=now()
   WHERE s.token=${token} AND s."expiresAt">now()
     AND s."impersonatedBy" IS NULL
     AND u."emailVerified"=true AND COALESCE(u.banned,false)=false
   LIMIT 1`;
  if(rows.length!==1)return null;
  const r=rows[0]!;
  const roles:string[]=[];
  if(r.research_role==="researcher"||r.research_role==="research_admin")roles.push(String(r.research_role));
  if(r.reviewer===true)roles.push("scientific_reviewer");
  return {principalId:String(r.principal_id),authenticated:true,roles};
 }finally{await sql.close();}
}
export async function authenticateHsiNeonSession(input:Parameters<typeof authenticateHsiNeonIdentity>[0]):Promise<TrustedResearchActor|null>{
 const identity=await authenticateHsiNeonIdentity(input);
 return identity?.roles.length?identity:null;
}
