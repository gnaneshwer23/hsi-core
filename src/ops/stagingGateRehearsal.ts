/** An in-process rehearsal environment for the P0.6 gate: the REAL authority, grants, NEXUS worker, authenticated gateway and HTTP handler,
 * with in-memory accounts, so the gate itself can be exercised and proven sensitive.
 *
 * It exists for two reasons. First, to show the gate PASSES against a correct implementation (so a pass means something). Second, to show it
 * FAILS, naming the right check, when isolation is deliberately broken (`fault`), so a pass is not vacuous. Faults are injected at the HTTP and
 * hook layers, never by editing product code.
 *
 * Evidence produced here is `mode: "rehearsal"`. It says nothing about any staging environment. */
import {existsSync,mkdtempSync,readFileSync,readdirSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createGatewayCallerAuthority,type VerifiedPrincipal} from "../gatewayCallerAuthority";
import {createFileGrantStore} from "../jobDelegationGrants";
import {createJobJournal} from "../nexusJobs";
import {runWorkerOnce} from "../nexusRunCommand";
import {handleNexusFixtureApi} from "../server/nexusFixtureApi";
import type {GateActor,GateConfig,GateHooks} from "./stagingGate";

export type GateFault=null|"leak_read"|"leak_export"|"distinguishable_denial"|"revocation_ignored"|"duplicate_rows"|"audit_wrong_owner"|"cross_origin_accepted"|"anonymous_allowed"|"health_leaks_counts"|"retry_not_idempotent"|"distinguishable_body"|"retry_reports_created"|"missing_origin_accepted"|"refs_not_distinct"|"anonymous_403"|"owner_export_broken";
export const REHEARSAL_ORIGIN="https://rehearsal.hsi.invalid";
const TOKEN:Record<Exclude<GateActor,"anonymous">,string>={
 researcher_a:"token-rehearsal-a-0123456789",researcher_a_second_session:"token-rehearsal-a2-0123456789",
 researcher_b:"token-rehearsal-b-0123456789",researcher_c_other_org:"token-rehearsal-c-0123456789",
};
const cookie=(t:string)=>`session=${t}`;

export function createGateRehearsal(opts:{fault?:GateFault;inspector?:boolean;revoke?:boolean;dirs?:string[]}={}){
 const fault=opts.fault??null;
 const root=mkdtempSync(join(tmpdir(),"hsi-gate-"));opts.dirs?.push(root);
 const out=join(root,"out");
 const sessions=new Map<string,VerifiedPrincipal>([
  [TOKEN.researcher_a,{subjectId:"subject-a",organizationId:"org-1",sessionId:"sess-a",roles:["researcher"]}],
  [TOKEN.researcher_a_second_session,{subjectId:"subject-a",organizationId:"org-1",sessionId:"sess-a2",roles:["researcher"]}],
  [TOKEN.researcher_b,{subjectId:"subject-b",organizationId:"org-1",sessionId:"sess-b",roles:["researcher"]}],   // same organisation as A, a different researcher
  [TOKEN.researcher_c_other_org,{subjectId:"subject-c",organizationId:"org-2",sessionId:"sess-c",roles:["researcher"]}],
 ]);
 const owners=new Map([["inv-a",{ownerSubjectId:"subject-a",organizationId:"org-1"}],["inv-b",{ownerSubjectId:"subject-b",organizationId:"org-1"}],["inv-c",{ownerSubjectId:"subject-c",organizationId:"org-2"}]]);
 const standing=new Map([["subject-a|org-1",{roles:["researcher"]}],["subject-b|org-1",{roles:["researcher"]}],["subject-c|org-2",{roles:["researcher"]}]]);
 const authority=createGatewayCallerAuthority({verifySession:async t=>sessions.get(t)??null,resolveInvestigation:async i=>owners.get(i)??null,resolveStanding:async(s,o)=>standing.get(`${s}|${o}`)??null,
  grants:createFileGrantStore(join(root,"grants"),{signingKey:"k".repeat(40)}),ttlMs:60_000});
 const deps={out,authority,sessionToken:(r:Request)=>/(?:^|;\s*)session=([^;]+)/.exec(r.headers.get("cookie")??"")?.[1]??null,authenticate:async(t:string)=>sessions.has(t),publicOrigin:REHEARSAL_ORIGIN,writesEnabled:true};
 const isB=(r:Request)=>(r.headers.get("cookie")??"").includes(TOKEN.researcher_b),isC=(r:Request)=>(r.headers.get("cookie")??"").includes(TOKEN.researcher_c_other_org);
 const handle=async(r:Request):Promise<Response>=>(await handleNexusFixtureApi(r,deps))??new Response("{}",{status:404});
 const withHeaders=(r:Request,h:Record<string,string|null>)=>{const headers=new Headers(r.headers);for(const [k,v] of Object.entries(h)){if(v===null)headers.delete(k);else headers.set(k,v)}return new Request(r.url,{method:r.method,headers,body:r.method==="POST"?r.clone().body:undefined,redirect:r.redirect,...(r.method==="POST"?{duplex:"half"} as object:{})})};
 let aPosts=0;

 const transport=async(req:Request):Promise<Response>=>{
  const path=new URL(req.url).pathname;
  let r=req;
  // The distinguishing faults apply only to attempts on A's resources (A's job, or a start on A's investigation), as a real "not yours" answer would.
  const onA=/\/jobs\/fl-(?!0{16})[a-f0-9]{16}/.test(path)||(req.method==="POST"&&(await req.clone().json().catch(()=>null) as {investigationId?:string}|null)?.investigationId==="inv-a");
  if(fault==="anonymous_allowed"&&!req.headers.get("cookie"))r=withHeaders(r,{cookie:cookie(TOKEN.researcher_a)});
  if(fault==="cross_origin_accepted"&&req.method==="POST")r=withHeaders(r,{origin:REHEARSAL_ORIGIN});
  if(fault==="missing_origin_accepted"&&req.method==="POST"&&!req.headers.get("origin"))r=withHeaders(r,{origin:REHEARSAL_ORIGIN});
  if(fault==="retry_not_idempotent"&&req.method==="POST"&&(req.headers.get("cookie")??"").includes(TOKEN.researcher_a)&&req.headers.get("origin")===REHEARSAL_ORIGIN){
   aPosts++;
   // every start after the first is treated as a new run (terms get a nonce), the way a server without idempotency would
   if(aPosts>1)r=new Request(req.url,{method:"POST",headers:req.headers,body:JSON.stringify({investigationId:"inv-a",terms:[`retry-${aPosts}`]})});
  }
  const brief=/\/brief$/.test(path),jobRead=/\/jobs\/fl-[a-f0-9]{16}$/.test(path);
  if((fault==="leak_read"&&jobRead||fault==="leak_export"&&brief)&&isB(r))r=withHeaders(r,{cookie:cookie(TOKEN.researcher_a)});
  if(fault==="duplicate_rows"&&req.method==="POST"&&(req.headers.get("cookie")??"").includes(TOKEN.researcher_a)&&!req.headers.get("origin")?.includes("evil")){
   aPosts++;
   if(aPosts>1)await handle(new Request(req.url,{method:"POST",headers:req.headers,body:JSON.stringify({investigationId:"inv-a",terms:["duplicate-write"]})}));
  }
  if(fault==="owner_export_broken"&&brief&&(req.headers.get("cookie")??"").includes(TOKEN.researcher_a)&&req.method==="GET")return new Response("{}",{status:500});
  const res=await handle(r);
  if(fault==="anonymous_403"&&!req.headers.get("cookie")&&res.status===401)return new Response(JSON.stringify({code:"FORBIDDEN"}),{status:403,headers:{"content-type":"application/json"}});
  if(fault==="retry_reports_created"&&req.method==="POST"&&(req.headers.get("cookie")??"").includes(TOKEN.researcher_a)&&res.status===200){const j=await res.json();return new Response(JSON.stringify({...j,created:true}),{status:200,headers:{"content-type":"application/json"}})}
  if(fault==="distinguishable_body"&&onA&&res.status===404&&(isB(req)||isC(req)))return new Response(JSON.stringify({code:"NOT_YOURS",error:"This belongs to someone else"}),{status:404,headers:{"content-type":"application/json"}});
  if(fault==="distinguishable_denial"&&onA&&res.status===404&&(isB(req)||isC(req)))return new Response(JSON.stringify({code:"FORBIDDEN",error:"Forbidden"}),{status:403,headers:{"content-type":"application/json"}});
  if(fault==="health_leaks_counts"&&path.endsWith("/health")&&res.status===200){const j=await res.json();return new Response(JSON.stringify({...j,queue:{queued:1}}),{status:200,headers:{"content-type":"application/json"}})}
  return res;
 };

 const refsOf=async(actor:GateActor):Promise<{tenantRef:string;principalRef:string}>=>{
  if(fault==="refs_not_distinct"&&actor!=="researcher_a"&&actor!=="researcher_a_second_session")return refsOf("researcher_a");
  const inv=actor==="researcher_b"?"inv-b":actor==="researcher_c_other_org"?"inv-c":"inv-a";
  const r=await authority.authorise({sessionToken:TOKEN[actor as Exclude<GateActor,"anonymous">],investigationId:inv,taskId:"refs",role:"question_planner"});
  if(!r.ok)throw Error("refs unavailable");return {tenantRef:r.authorisation.tenantRef,principalRef:r.authorisation.principalRef};
 };
 const inspector=opts.inspector===false?undefined:{
  async countJobs(investigationId:string){
   const jd=join(out,"jobs");if(!existsSync(jd))return 0;
   let n=0;for(const j of createJobJournal(jd).list()){
    const f=join(out,"queue",`${j.jobId}.grant.json`);if(!existsSync(f))continue;
    const ref=JSON.parse(readFileSync(f,"utf8")) as {grantId:string};
    const inv=await authority.grantInvestigation({grantId:ref.grantId,jobId:j.jobId});if(inv.ok&&inv.investigationId===investigationId)n++;
   }
   return n;
  },
  async auditRefs(jobId:string){
   const f=join(out,"audit",jobId,"tool-audit.jsonl");if(!existsSync(f))return [];
   const recs=readFileSync(f,"utf8").trim().split("\n").filter(Boolean).map(l=>JSON.parse(l) as {tenantRef:string;principalRef:string});
   if(fault==="audit_wrong_owner"){const b=await refsOf("researcher_b");return recs.map(()=>b)}
   return recs.map(r=>({tenantRef:r.tenantRef,principalRef:r.principalRef}));
  },
  refsOf,
 };
 const hooks:GateHooks={
  async session(actor){return actor==="anonymous"?null:cookie(TOKEN[actor])},
  ...(opts.revoke===false?{}:{async revoke(actor){if(fault==="revocation_ignored")return;sessions.delete(TOKEN[actor as Exclude<GateActor,"anonymous">])}}),
  async advance(){await runWorkerOnce({out,authority})},
  ...(inspector?{inspector}:{}),
 };
 const config=(over:Partial<GateConfig>={}):GateConfig=>({
  mode:"rehearsal",origin:REHEARSAL_ORIGIN,approvedOrigin:REHEARSAL_ORIGIN,productionOrigins:["https://humansuperintelligence.tech"],
  targetHash:"a".repeat(64),commitSha:"b".repeat(40),investigations:{a:"inv-a",unknown:"inv-does-not-exist"},terms:["IL-21","fibrosis"],
  allowMutations:true,transport,hooks,waitForCompletionMs:5000,pollMs:20,...over,
 });
 return {config,out,sessions,hooks,transport,readdir:()=>existsSync(out)?readdirSync(out):[]};
}
