/** Fail-closed Neon live-evidence adapter. No migrations or production writes here.
 * A separately provisioned least-privilege runtime DB user and approved RLS
 * policy are prerequisites. The owner context is transaction-local.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import {authenticateHsiNeonIdentity} from "./neonAuthResearchActor";
import type {LiveApiDependencies,LiveSession} from "../liveEvidenceApi";
import type {LiveSql} from "../liveEvidenceRepository";

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
 return {
  writesEnabled:allowed,
  authenticate:async token=>{
   const actor=await authenticateHsiNeonIdentity({...config,sessionToken:token});
   return actor?.authenticated?actor as LiveSession:null;
  },
  database:async actor=>{
   if(!allowed)throw Error("Live persistence disabled");
   if(!actor.authenticated||!actor.roles.some(r=>r==="researcher"||r==="research_admin"))throw Error("Research access denied");
   const guard=assertHsiNeonDatabaseUrl(config.runtimeDatabaseUrl,{neonProjectId:config.neonProjectId});
   if(!guard.ok)throw Error("HSI live database guard rejected runtime target");
   const sql=new SQL(config.runtimeDatabaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
   try{
    const role=await sql.unsafe("SELECT current_user AS name, rolbypassrls AS bypass, rolsuper AS superuser FROM pg_roles WHERE rolname=current_user");
    if(role.length!==1||role[0]?.bypass!==false||role[0]?.superuser!==false)throw Error("RLS-bypassing runtime role denied");
    const policy=await sql.unsafe("SELECT relrowsecurity AS enabled, relforcerowsecurity AS forced FROM pg_class WHERE oid=to_regclass('public.hsi_live_investigations')");
    if(policy.length!==1||policy[0]?.enabled!==true||policy[0]?.forced!==true)throw Error("Live table RLS not ready");
   }catch(e){await sql.close();throw e}
   // Every operation executes inside a transaction, with a local, server-derived
   // identity. Never use session-wide SET on pooled connections.
   const db:LiveSql={
    query:async(statement,params)=>sql.begin(async tx=>{
     await tx.unsafe("SELECT set_config('hsi.live_owner_id', $1, true)",[actor.principalId]);
     return tx.unsafe(statement,params);
    }),
    transaction:async work=>sql.begin(async tx=>{
     await tx.unsafe("SELECT set_config('hsi.live_owner_id', $1, true)",[actor.principalId]);
     return work(queryable(tx));
    })
   };
   return {sql:db,close:()=>sql.close()};
  }
 };
}
