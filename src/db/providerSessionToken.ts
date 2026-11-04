/** Resolve only a provider-verified session identity to its database token.
 * Resolving by immutable session/user IDs avoids assuming a signed cookie equals the stored token.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
export async function resolveProviderSessionToken(input:{databaseUrl:string;neonProjectId?:string|null;sessionId:string;userId:string}):Promise<string|null>{
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});if(!guard.ok)throw Error("HSI database target rejected");
 if(!input.sessionId.trim()||input.sessionId.length>256||!input.userId.trim()||input.userId.length>256)return null;
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:5});
 try{
  const rows=await sql`SELECT s.token FROM neon_auth.session s JOIN neon_auth."user" u ON u.id=s."userId"
   WHERE s.id=${input.sessionId} AND s."userId"=${input.userId} AND s."expiresAt">now()
    AND s."impersonatedBy" IS NULL AND u."emailVerified"=true AND COALESCE(u.banned,false)=false LIMIT 1`;
  const token=rows[0]?.token;
  return rows.length===1&&typeof token==="string"&&token.length>=16&&token.length<=4096&&!/\s/.test(token)?token:null;
 }finally{await sql.close()}
}
