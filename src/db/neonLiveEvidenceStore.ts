/** Fail-closed Neon live-evidence adapter. No migrations or production writes here.
 * A separately provisioned least-privilege runtime DB user and approved RLS
 * policy are prerequisites. The owner context is transaction-local.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl,stagingHostPin} from "./neonGuard";
import {authenticateHsiNeonIdentity} from "./neonAuthResearchActor";
import type {LiveApiDependencies,LiveSession} from "../liveEvidenceApi";
import type {LiveSql} from "../liveEvidenceRepository";
import {assertNoForgeableOwnerPolicy} from "./liveEvidencePolicyGate";

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
 const allowed=config.writesEnabled===true;
 const verifiedSessions=new WeakMap<LiveSession,string>();
 return {
  writesEnabled:allowed,
  authenticate:async token=>{
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
   const pin=stagingHostPin();
   if(!pin||pin==="hsi-staging-host"||!guard.host?.startsWith(pin+"."))throw Error("A-01 requires an explicitly pinned staging host");
   const sql=new SQL(config.runtimeDatabaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
   try{
    const role=await sql.unsafe("SELECT current_user AS name, rolbypassrls AS bypass, rolsuper AS superuser FROM pg_roles WHERE rolname=current_user");
    if(role.length!==1||role[0]?.name!=="hsi_live_runtime"||role[0]?.bypass!==false||role[0]?.superuser!==false)throw Error("RLS-bypassing runtime role denied");
    const policy=await sql.unsafe("SELECT relrowsecurity AS enabled, relforcerowsecurity AS forced FROM pg_class WHERE oid=to_regclass('public.hsi_live_investigations')");
    if(policy.length!==1||policy[0]?.enabled!==true||policy[0]?.forced!==true)throw Error("Live table RLS not ready");
    const policies=await sql.unsafe("SELECT policyname,qual,with_check FROM pg_policies WHERE schemaname=$1 AND tablename=$2",["public","hsi_live_investigations"]);
    assertNoForgeableOwnerPolicy(policies);
    const approved=policies.filter((p:Record<string,unknown>)=>p.policyname==="hsi_live_verified_session_isolation");
    if(approved.length!==1||policies.length!==1||!String(approved[0]?.qual??"").includes("hsi_live_verified_owner()")||!String(approved[0]?.with_check??"").includes("hsi_live_verified_owner()"))throw Error("A-01 denied: unapproved RLS policy");
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
