/** P1.12.5 read-only staging evidence security inspection.
 * Does not change database schema, roles, grants, policies or data.
 * Run with an explicitly pinned non-production HSI Neon connection.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl,stagingHostPin,stagingBranchPin} from "../src/db/neonGuard";

export type EvidenceStagingGate={
  stagingPinned:boolean;
  rolePresent:boolean;
  roleNonPrivileged:boolean;
  roleLoginReady:boolean;
  snapshotsRlsForced:boolean;
  reviewsRlsForced:boolean;
  policyCount:number;
  readyForLiveTests:boolean;
};
export function evaluateEvidenceStagingGate(input:{
  stagingPinned:boolean;role?:{rolsuper:boolean;rolbypassrls:boolean;rolcanlogin:boolean};
  tables:readonly {name:string;rls:boolean;force:boolean}[];
  policyCount:number;
}):EvidenceStagingGate{
 const rolePresent=!!input.role;
 const roleNonPrivileged=!!input.role&&!input.role.rolsuper&&!input.role.rolbypassrls;
 const roleLoginReady=roleNonPrivileged&&!!input.role?.rolcanlogin;
 const snapshots=input.tables.find(t=>t.name==="hsi_research_evidence_snapshots");
 const reviews=input.tables.find(t=>t.name==="hsi_research_evidence_review_events");
 const snapshotsRlsForced=!!snapshots?.rls&&!!snapshots.force;
 const reviewsRlsForced=!!reviews?.rls&&!!reviews.force;
 return {stagingPinned:input.stagingPinned,rolePresent,roleNonPrivileged,
  roleLoginReady,snapshotsRlsForced,reviewsRlsForced,policyCount:input.policyCount,
  readyForLiveTests:input.stagingPinned&&roleLoginReady&&snapshotsRlsForced&&
   reviewsRlsForced&&input.policyCount>=5};
}
export async function inspectEvidenceStaging(input:{
 databaseUrl:string;neonProjectId?:string;branchId:string;expectedRole:string;
}):Promise<EvidenceStagingGate>{
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 const host=guard.ok?new URL(input.databaseUrl).hostname.split(".")[0]?.replace(/-pooler$/,""):null;
 const pinned=guard.ok&&input.branchId===stagingBranchPin()&&host===stagingHostPin();
 if(!pinned)throw new Error("Staging evidence inspection requires pinned HSI branch and host");
 if(input.expectedRole!=="hsi_evidence_app")throw new Error("Unexpected evidence role");
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  const roles=await sql`SELECT rolsuper,rolbypassrls,rolcanlogin FROM pg_roles WHERE rolname=${input.expectedRole}`;
  const tables=await sql`SELECT c.relname AS name,c.relrowsecurity AS rls,
    c.relforcerowsecurity AS force FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname IN
    ('hsi_research_evidence_snapshots','hsi_research_evidence_review_events')`;
  const policies=await sql`SELECT count(*)::int AS count FROM pg_policies
    WHERE schemaname='public' AND tablename IN
    ('hsi_research_evidence_snapshots','hsi_research_evidence_review_events')`;
  return evaluateEvidenceStagingGate({stagingPinned:true,
   role:roles[0] as {rolsuper:boolean;rolbypassrls:boolean;rolcanlogin:boolean}|undefined,
   tables:tables as {name:string;rls:boolean;force:boolean}[],
   policyCount:Number(policies[0]?.count??0)});
 }finally{await sql.close();}
}
