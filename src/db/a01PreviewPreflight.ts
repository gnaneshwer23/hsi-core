import {assertVerifiedLiveOwnerPolicy} from "./liveEvidencePolicyGate";
/** A-01 read-only, fail-closed preview readiness assessment. No DDL or write enablement. */
export interface A01PreflightQuery {
 query(sql:string,params?:unknown[]):Promise<Array<Record<string,unknown>>>;
}
export interface A01PreflightReport {
 readyForIndependentReview:boolean;
 readyForLiveWrites:false;
 checks:{id:string;pass:boolean;detail:string}[];
}
export async function inspectA01Preview(db:A01PreflightQuery):Promise<A01PreflightReport>{
 const checks:A01PreflightReport["checks"]=[];
 async function check(id:string,sql:string,validate:(rows:Record<string,unknown>[])=>boolean){
  try{
   const rows=await db.query(sql);
   const pass=validate(rows);
   checks.push({id,pass,detail:pass?"Verified by read-only query":"Missing or unsafe; do not apply migration or enable writes"});
  }catch{
   checks.push({id,pass:false,detail:"Inspection failed; do not apply migration or enable writes"});
  }
 }
 await check("runtime-role","SELECT rolname, rolcanlogin, rolinherit, rolbypassrls, rolsuper, rolcreaterole, rolcreatedb FROM pg_roles WHERE rolname='hsi_live_runtime'",r=>r.length===1&&r[0]!==undefined&&r[0].rolcanlogin===true&&r[0].rolinherit===false&&r[0].rolbypassrls===false&&r[0].rolsuper===false&&r[0].rolcreaterole===false&&r[0].rolcreatedb===false);
 await check("live-table-rls","SELECT relrowsecurity,relforcerowsecurity FROM pg_class WHERE oid=to_regclass('public.hsi_live_investigations')",r=>r.length===1&&r[0]!==undefined&&r[0].relrowsecurity===true&&r[0].relforcerowsecurity===true);
 await check("exact-rls-policy","SELECT policyname, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname='public' AND tablename='hsi_live_investigations'",r=>{try{assertVerifiedLiveOwnerPolicy(r);return true;}catch{return false;}});
 await check("definer-function","SELECT p.prosecdef, p.provolatile, pg_get_userbyid(p.proowner) AS owner, p.proconfig FROM pg_proc p WHERE p.oid=to_regprocedure('public.hsi_live_verified_owner()')",r=>r.length===1&&r[0]!==undefined&&r[0].prosecdef===true&&r[0].provolatile==="s"&&typeof r[0].owner==="string"&&r[0].owner!=="hsi_live_runtime"&&Array.isArray(r[0].proconfig)&&(r[0].proconfig as string[]).some(x=>x.startsWith("search_path=")));
 await check("no-runtime-table-ownership","SELECT pg_get_userbyid(c.relowner) AS owner FROM pg_class c WHERE c.oid=to_regclass('public.hsi_live_investigations')",r=>r.length===1&&r[0]!==undefined&&r[0].owner!=="hsi_live_runtime");
 await check("no-runtime-schema-create","SELECT has_schema_privilege('hsi_live_runtime','public','CREATE') AS can_create",r=>r.length===1&&r[0]!==undefined&&r[0].can_create===false);
 await check("no-runtime-auth-table-read","SELECT has_table_privilege('hsi_live_runtime','neon_auth.session','SELECT') AS can_read",r=>r.length===1&&r[0]!==undefined&&r[0].can_read===false);
 await check("no-runtime-delete","SELECT has_table_privilege('hsi_live_runtime','public.hsi_live_investigations','DELETE') AS can_delete",r=>r.length===1&&r[0]!==undefined&&r[0].can_delete===false);
 await check("no-runtime-truncate","SELECT has_table_privilege('hsi_live_runtime','public.hsi_live_investigations','TRUNCATE') AS can_truncate",r=>r.length===1&&r[0]!==undefined&&r[0].can_truncate===false);
 return {readyForIndependentReview:checks.every(c=>c.pass),readyForLiveWrites:false,checks};
}
