/** Fail-closed Neon live-evidence adapter. No migrations or production writes here.
 * A separately provisioned least-privilege runtime DB user and approved RLS
 * policy are prerequisites. The owner context is transaction-local.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl,stagingHostPin} from "./neonGuard";
import {authenticateHsiNeonIdentity} from "./neonAuthResearchActor";
import type {LiveApiDependencies,LiveSession} from "../liveEvidenceApi";
import type {LiveSql} from "../liveEvidenceRepository";
import {assertVerifiedLiveOwnerPolicy,assertRestrictedLiveRuntime,assertAlignedLiveStagingHosts} from "./liveEvidencePolicyGate";

type Queryable={unsafe:(statement:string,params?:unknown[])=>Promise<Array<Record<string,unknown>>>};
function queryable(tx:Queryable):LiveSql{
 return {
  query:(statement,params)=>tx.unsafe(statement,params),
  transaction:async work=>work(queryable(tx))
 };
}
export function createNeonLiveEvidenceDependencies(config:{
 databaseUrl:string;
 runtimeDatabaseUrl:string;
 neonProjectId?:string|null;
 writesEnabled?:boolean;
}):LiveApiDependencies{
 config=Object.freeze({...config});
 const allowed=config.writesEnabled===true;
 const pin=stagingHostPin();
 function verifyTargets(){
  const identity=assertHsiNeonDatabaseUrl(config.databaseUrl,{neonProjectId:config.neonProjectId});
  const runtime=assertHsiNeonDatabaseUrl(config.runtimeDatabaseUrl,{neonProjectId:config.neonProjectId});
  if(!identity.ok||!runtime.ok)throw Error("A-01 denied: invalid HSI staging identity/runtime target");
  assertAlignedLiveStagingHosts(identity.host,runtime.host,pin);
 }
 const verifiedSessions=new WeakMap<LiveSession,string>();
 return {
  writesEnabled:allowed,
  authenticate:async token=>{
   if(!allowed)return null;
   verifyTargets();
   const actor=await authenticateHsiNeonIdentity({...config,sessionToken:token});
   if(!actor?.authenticated)return null;
   const session=actor as LiveSession;
   verifiedSessions.set(session,token);
   return session;
  },
  database:async actor=>{
   if(!allowed)throw Error("Live persistence disabled");
   const verifiedToken=verifiedSessions.get(actor);
   if(!verifiedToken)throw Error("A-01 denied: unverified actor object");
   verifiedSessions.delete(actor);
   if(!actor.authenticated||!actor.roles.some(r=>r==="researcher"||r==="research_admin"))throw Error("Research access denied");
   const guard=assertHsiNeonDatabaseUrl(config.runtimeDatabaseUrl,{neonProjectId:config.neonProjectId});
   if(!guard.ok)throw Error("HSI live database guard rejected runtime target");
   // A-01 is preview/staging only. Never permit the canonical production host.
   verifyTargets();
   const sql=new SQL(config.runtimeDatabaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
   try{
    const role=await sql.unsafe(`SELECT current_user AS name,session_user AS login,rolcanlogin AS canlogin,rolinherit AS inherit,rolbypassrls AS bypass,rolsuper AS superuser,rolcreaterole AS createrole,rolcreatedb AS createdb,
     to_regclass('public.hsi_live_investigations') IS NOT NULL AS table_exists,
     EXISTS(SELECT 1 FROM pg_class c WHERE c.oid=to_regclass('public.hsi_live_investigations') AND c.relowner=r.oid) AS table_owner,
     has_table_privilege(current_user,'neon_auth.session','SELECT') AS auth_session_read,
     has_table_privilege(current_user,'neon_auth."user"','SELECT') AS auth_user_read,
     has_schema_privilege(current_user,'public','CREATE') AS schema_create,
     has_table_privilege(current_user,'public.hsi_live_investigations','DELETE') AS can_delete,
     has_table_privilege(current_user,'public.hsi_live_investigations','TRUNCATE') AS can_truncate
     FROM pg_roles r WHERE rolname=current_user`);
    const memberships=await sql.unsafe(`SELECT r.rolname FROM pg_roles r
     WHERE r.rolname<>current_user AND pg_has_role(current_user,r.oid,'MEMBER') AND
      (r.rolsuper OR r.rolbypassrls OR r.rolcreaterole OR r.rolcreatedb
       OR has_table_privilege(r.oid,'neon_auth.session','SELECT')
       OR has_table_privilege(r.oid,'neon_auth."user"','SELECT')
       OR EXISTS(SELECT 1 FROM pg_class c WHERE c.oid=to_regclass('public.hsi_live_investigations') AND c.relowner=r.oid)
       OR EXISTS(SELECT 1 FROM pg_proc p WHERE p.oid=to_regprocedure('public.hsi_live_verified_owner()') AND p.proowner=r.oid))`);
    assertRestrictedLiveRuntime(role,memberships);
    const policy=await sql.unsafe("SELECT relrowsecurity AS enabled, relforcerowsecurity AS forced FROM pg_class WHERE oid=to_regclass('public.hsi_live_investigations')");
    if(policy.length!==1||policy[0]?.enabled!==true||policy[0]?.forced!==true)throw Error("Live table RLS not ready");
    const policies=await sql.unsafe("SELECT policyname,roles,cmd,qual,with_check FROM pg_policies WHERE schemaname=$1 AND tablename=$2",["public","hsi_live_investigations"]);
    assertVerifiedLiveOwnerPolicy(policies);
   }catch(e){await sql.close();throw e}
   // Every operation executes inside a transaction, with a local, server-derived
   // identity. Never use session-wide SET on pooled connections.
   const db:LiveSql={
    query:async(statement,params)=>sql.begin(async tx=>{
     await tx.unsafe("SELECT set_config('hsi.live_session_token', $1, true)",[verifiedToken]);
     return tx.unsafe(statement,params);
    }),
    transaction:async work=>sql.begin(async tx=>{
     await tx.unsafe("SELECT set_config('hsi.live_session_token', $1, true)",[verifiedToken]);
     return work(queryable(tx));
    })
   };
   return {sql:db,close:()=>sql.close()};
  }
 };
}
