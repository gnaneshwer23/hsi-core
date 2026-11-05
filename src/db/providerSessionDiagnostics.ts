/** Self-only read diagnostics for a provider-verified identity. No secrets or row data leave this module. */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
export type ProviderSessionChecks={userVisible:boolean;emailVerified:boolean;userNotBanned:boolean;sessionVisible:boolean;sessionActive:boolean;sessionNotImpersonated:boolean;tokenUsable:boolean};
export function summariseProviderSessionChecks(value:unknown):{status:string;checks:ProviderSessionChecks}{
 const row=value&&typeof value==="object"?value as Record<string,unknown>:{};
 const checks:ProviderSessionChecks={userVisible:row.user_visible===true,emailVerified:row.email_verified===true,userNotBanned:row.user_not_banned===true,sessionVisible:row.session_visible===true,sessionActive:row.session_active===true,sessionNotImpersonated:row.session_not_impersonated===true,tokenUsable:row.token_usable===true};
 const status=!checks.userVisible?"database_user_not_visible":!checks.emailVerified?"database_email_not_verified":!checks.userNotBanned?"database_user_disabled":!checks.sessionVisible?"database_session_not_visible":!checks.sessionActive?"database_session_expired":!checks.sessionNotImpersonated?"database_session_impersonated":!checks.tokenUsable?"database_session_token_unusable":"session_eligible";
 return {status,checks};
}
export async function inspectProviderDatabaseSession(input:{databaseUrl:string;neonProjectId?:string|null;sessionId:string;userId:string}):Promise<ReturnType<typeof summariseProviderSessionChecks>>{
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});if(!guard.ok)throw Error("HSI database target rejected");
 if(!input.sessionId.trim()||input.sessionId.length>256||!input.userId.trim()||input.userId.length>256)throw Error("Verified session identity required");
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:5});
 try{
  const rows=await sql`SELECT
   EXISTS(SELECT 1 FROM neon_auth."user" u WHERE u.id=${input.userId}) AS user_visible,
   EXISTS(SELECT 1 FROM neon_auth."user" u WHERE u.id=${input.userId} AND u."emailVerified"=true) AS email_verified,
   EXISTS(SELECT 1 FROM neon_auth."user" u WHERE u.id=${input.userId} AND COALESCE(u.banned,false)=false) AS user_not_banned,
   EXISTS(SELECT 1 FROM neon_auth.session s WHERE s.id=${input.sessionId} AND s."userId"=${input.userId}) AS session_visible,
   EXISTS(SELECT 1 FROM neon_auth.session s WHERE s.id=${input.sessionId} AND s."userId"=${input.userId} AND s."expiresAt">now()) AS session_active,
   EXISTS(SELECT 1 FROM neon_auth.session s WHERE s.id=${input.sessionId} AND s."userId"=${input.userId} AND s."impersonatedBy" IS NULL) AS session_not_impersonated,
   EXISTS(SELECT 1 FROM neon_auth.session s WHERE s.id=${input.sessionId} AND s."userId"=${input.userId} AND char_length(s.token) BETWEEN 16 AND 4096 AND s.token !~ '[[:space:]]') AS token_usable`;
  if(rows.length!==1)throw Error("Diagnostic result unavailable");
  return summariseProviderSessionChecks(rows[0]);
 }finally{await sql.close()}
}
