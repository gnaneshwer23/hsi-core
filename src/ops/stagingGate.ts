/** P0.6 staging gate: a scripted, repeatable, STATEFUL cross-tenant scenario, and the evidence it leaves behind.
 *
 * What it adds to the existing two-account probe runner (`db/stagingIsolationRunner.ts`): that runner sends independent single requests and
 * compares digests. P0.6 is a story: researcher A creates a run, then B cannot read, modify or export it, a revoked session is refused,
 * retries do not duplicate, and the audit trail still names A. That needs ordered steps that depend on each other, controls that prove a
 * denial is a denial of something that works for the owner, and server-side inspection that no outside request can provide.
 *
 * Every dependency that touches a real environment is INJECTED: the transport, the session minting and revocation, and an optional
 * inspector for the store. The module itself holds no secret, opens no connection and knows no environment.
 *
 * Verdicts, and what they are not:
 * - `BLOCKED`: a prerequisite is missing (approved origin, accounts, revocation hook, ids, ...). NOTHING is sent. This is the expected state
 *   until staging accounts and an isolated database exist.
 * - `FAILED`: at least one isolation check failed. Treat as a defect.
 * - `INCONCLUSIVE`: nothing failed, but a required check could not be established (for example no inspector, or the job never completed).
 * - `PASSED_PENDING_SIGNOFF`: every required check in this profile passed with its controls. It is evidence for a named independent signer.
 *   It is never acceptance: `accepted` is always false, only a human signer can accept, and `mandateComplete` stays false while any mandate
 *   item (here: graph and evidence access) is outside the profile.
 * - `mode: "rehearsal"` evidence comes from an in-process fake and can never stand in for `mode: "staging"`.
 *
 * Evidence holds step ids, actor labels, method, a path TEMPLATE (ids replaced), status, a digest of the response body and, for JSON objects,
 * its top-level key names. It never holds cookies, tokens, request or response bodies. Before returning, the runner refuses to emit evidence
 * that contains any session string the hooks produced. */
import {createHash} from "node:crypto";
import {hashHsiCheckpointInput} from "../hsiAgentDurableCheckpoint";

export type GateActor="researcher_a"|"researcher_a_second_session"|"researcher_b"|"researcher_c_other_org"|"anonymous";
export const GATE_ACTORS:readonly GateActor[]=["researcher_a","researcher_a_second_session","researcher_b","researcher_c_other_org","anonymous"];

export interface GateInspector{
 /** Jobs that exist for this investigation, counted from the store itself (not through the API under test). */
 countJobs(investigationId:string):Promise<number>;
 /** The tenant and principal references recorded in the gateway audit log for this job (one entry per record). */
 auditRefs(jobId:string):Promise<{tenantRef:string;principalRef:string}[]>;
 /** The references the system derives for this actor (tenant = organisation, principal = researcher). */
 refsOf(actor:GateActor):Promise<{tenantRef:string;principalRef:string}>;
}
export interface GateHooks{
 /** A complete `Cookie` header value for the actor, or null for anonymous. Minted by the owner's real session provider. */
 session(actor:GateActor):Promise<string|null>;
 /** Revokes the actor's session on the server, the way a sign-out or an administrator would. */
 revoke?(actor:GateActor):Promise<void>;
 /** Lets the system make progress between steps (rehearsal: run the worker; staging: usually nothing). */
 advance?():Promise<void>;
 inspector?:GateInspector;
}
export type GateConfig={
 mode:"rehearsal"|"staging";
 origin:string;approvedOrigin:string;productionOrigins:readonly string[];
 /** Identifies the isolated database/branch under test (a hash, not a connection string) and the deployed commit. */
 targetHash:string;commitSha:string;
 /** An investigation owned by researcher A, created beforehand through the real product flow, and one id that exists nowhere. */
 investigations:{a:string;unknown:string};
 /** Search terms the run is started with. */
 terms:readonly string[];
 /** Staging runs create jobs; this must be set explicitly. */
 allowMutations:boolean;
 transport:(request:Request)=>Promise<Response>;
 hooks:GateHooks;
 timeoutMs?:number;maxResponseBytes?:number;
 /** How long to wait for the run to complete so export and audit checks can be established. 0 = do not wait. */
 waitForCompletionMs?:number;pollMs?:number;
};

export type CheckOutcome="passed"|"failed"|"inconclusive"|"blocked"|"not_covered";
export type GateCheckSpec={id:string;title:string;/** The P0.6 mandate item this check evidences, or null for an additional hardening check beyond the list. */mandate:string|null;control:boolean;needsInspector:boolean;needsRevoke:boolean;needsCompletion:boolean;requires:readonly string[]};
/** The plan. Every id here is produced by the runner, and `docs/engineering/STAGING_GATE_P06.md` lists them (a test enforces both). */
export const GATE_PLAN:readonly GateCheckSpec[]=[
 {id:"a_creates",title:"Researcher A starts a run on their own investigation",mandate:"Researcher A creates an investigation",control:true,needsInspector:false,needsRevoke:false,needsCompletion:false,requires:[]},
 {id:"a_reopens_before",title:"Researcher A can read the run's status",mandate:"Researcher A can reopen it",control:true,needsInspector:false,needsRevoke:false,needsCompletion:false,requires:["a_creates"]},
 {id:"b_cannot_read",title:"Researcher B cannot read it, and the refusal is indistinguishable from an unknown run",mandate:"Researcher B cannot read it",control:false,needsInspector:false,needsRevoke:false,needsCompletion:false,requires:["a_creates","a_reopens_before"]},
 {id:"b_cannot_export",title:"Researcher B cannot export the brief, and the refusal is indistinguishable from an unknown run",mandate:"Researcher B cannot export it",control:false,needsInspector:false,needsRevoke:false,needsCompletion:false,requires:["a_creates","a_reopens_before"]},
 {id:"b_cannot_modify",title:"Researcher B cannot start a run on A's investigation, and the refusal is indistinguishable from an unknown investigation",mandate:"Researcher B cannot modify it",control:false,needsInspector:false,needsRevoke:false,needsCompletion:false,requires:["a_creates"]},
 {id:"b_wrote_nothing",title:"B's attempts left no job behind (counted in the store)",mandate:"Researcher B cannot modify it",control:false,needsInspector:true,needsRevoke:false,needsCompletion:false,requires:["b_cannot_modify"]},
 {id:"c_cross_org_denied",title:"A researcher from another organisation is denied read, export and start, identically to an unknown run",mandate:"Cross-organisation access is denied",control:false,needsInspector:false,needsRevoke:false,needsCompletion:false,requires:["a_creates","a_reopens_before"]},
 {id:"anonymous_denied",title:"A request with no session is refused everywhere (401)",mandate:null,control:false,needsInspector:false,needsRevoke:false,needsCompletion:false,requires:["a_creates"]},
 {id:"cross_origin_post_refused",title:"A start request from another origin is refused and creates nothing",mandate:null,control:false,needsInspector:false,needsRevoke:false,needsCompletion:false,requires:["a_creates"]},
 {id:"revoked_session_denied",title:"A revoked session is refused at its next request, while A's other session still works",mandate:"Revoked sessions cannot access it",control:false,needsInspector:false,needsRevoke:true,needsCompletion:false,requires:["a_creates","a_reopens_before"]},
 {id:"retry_idempotent",title:"Retried and concurrent identical starts return the same run and create it once",mandate:"Retried requests cannot duplicate writes",control:false,needsInspector:false,needsRevoke:false,needsCompletion:false,requires:["a_creates"]},
 {id:"retry_no_duplicate_rows",title:"The store holds exactly one job for the investigation after the retries",mandate:"Retried requests cannot duplicate writes",control:false,needsInspector:true,needsRevoke:false,needsCompletion:false,requires:["retry_idempotent"]},
 {id:"audit_preserves_ownership",title:"Every audit record for the run carries A's tenant and principal references and no one else's",mandate:"Audit events preserve ownership",control:false,needsInspector:true,needsRevoke:false,needsCompletion:true,requires:["a_creates"]},
 {id:"health_is_coarse",title:"Another researcher's health view shows status and reasons only, no counts, ids or activity",mandate:null,control:false,needsInspector:false,needsRevoke:false,needsCompletion:false,requires:[]},
 {id:"a_reopens_after",title:"After every attempt above, A can still read the run and (once complete) export a verified brief",mandate:"Researcher A can reopen it",control:true,needsInspector:false,needsRevoke:false,needsCompletion:false,requires:["a_creates"]},
 {id:"unauthorised_graph_or_evidence_access",title:"Unauthorised graph and evidence access is denied",mandate:"Unauthorised graph or evidence access is denied",control:false,needsInspector:false,needsRevoke:false,needsCompletion:false,requires:[]},
];
/** The mandate items P0.6 lists, so evidence can say which are covered by this profile. */
export const MANDATE_ITEMS=[
 "Researcher A creates an investigation","Researcher B cannot read it","Researcher B cannot modify it","Researcher B cannot export it","Researcher A can reopen it",
 "Revoked sessions cannot access it","Retried requests cannot duplicate writes","Audit events preserve ownership","Cross-organisation access is denied","Unauthorised graph or evidence access is denied",
] as const;

export type GateObservation={stepId:string;actor:GateActor;method:"GET"|"POST";pathTemplate:string;status:number|null;bodySha256:string|null;keys:string[]|null;note?:string};
export type GateCheckResult={id:string;outcome:CheckOutcome;reason:string};
export type GateBlocker={code:string;detail:string};
export type GateVerdict="BLOCKED"|"FAILED"|"INCONCLUSIVE"|"PASSED_PENDING_SIGNOFF";
export type GateEvidence={
 schemaVersion:"hsi-staging-gate-p06-1";profile:"nexus_fixture_api";mode:"rehearsal"|"staging";
 originHost:string;targetHash:string;commitSha:string;
 verdict:GateVerdict;blockers:GateBlocker[];checks:GateCheckResult[];observations:GateObservation[];
 mandateCoverage:{covered:string[];notCovered:string[]};mandateComplete:false;
 accepted:false;productionUntouched:true;securitySignoffRequired:true;scientificApproval:false;
 note:string;contentHash:string;
};

const HEX64=/^[a-f0-9]{64}$/,SHA40=/^[a-f0-9]{40}$/;
const digest=(v:unknown)=>hashHsiCheckpointInput(v);

/** Pure: which prerequisites are missing. Never sends a request. */
export async function gatePreflight(c:GateConfig):Promise<GateBlocker[]>{
 const b:GateBlocker[]=[];
 const need=(ok:boolean,code:string,detail:string)=>{if(!ok)b.push({code,detail})};
 let url:URL|null=null;try{url=new URL(c.origin)}catch{/* reported below */}
 need(!!url&&url.origin===c.origin,"origin_invalid","The target origin is not a bare origin.");
 if(c.mode==="staging"){
  need(!!url&&url.protocol==="https:","origin_not_https","Staging runs need an https origin.");
  need(c.origin===c.approvedOrigin,"staging_origin_not_approved","The target origin is not the owner-approved staging origin.");
  need(!c.productionOrigins.includes(c.origin)&&c.productionOrigins.length>0,"origin_is_production_or_unlisted","The target is a production origin, or no production origins were listed to check against.");
 }
 need(HEX64.test(c.targetHash),"target_hash_missing","A target hash identifying the isolated database branch is required.");
 need(SHA40.test(c.commitSha),"commit_sha_missing","The deployed commit SHA is required.");
 need(c.allowMutations===true,"mutations_not_allowed","The run creates jobs in the target; allowMutations must be set explicitly.");
 need(typeof c.investigations?.a==="string"&&!!c.investigations.a&&typeof c.investigations?.unknown==="string"&&!!c.investigations.unknown&&c.investigations.a!==c.investigations.unknown,"investigation_ids_missing","An investigation owned by researcher A, and an id that exists nowhere, are required.");
 need(Array.isArray(c.terms)&&c.terms.length>=1&&c.terms.length<=8,"terms_invalid","One to eight search terms are required.");
 need(typeof c.transport==="function","transport_missing","No transport was supplied.");
 need(typeof c.hooks?.session==="function","session_provider_missing","No session provider was supplied.");
 if(typeof c.hooks?.session==="function"){
  const seen=new Map<string,GateActor>();
  for(const actor of GATE_ACTORS){
   let s:string|null|undefined;try{s=await c.hooks.session(actor)}catch{s=undefined}
   if(actor==="anonymous"){need(s===null,"anonymous_not_null","The anonymous actor must have no session.");continue}
   if(typeof s!=="string"||!s||/[\r\n]/.test(s)){need(false,`session_unavailable_${actor}`,`No usable session for ${actor}.`);continue}
   const prior=seen.get(s);need(!prior,`session_reused_${actor}`,`${actor} reuses ${prior}'s session: the accounts must be distinct.`);seen.set(s,actor);
  }
 }
 return b;
}

type Ctx={c:GateConfig;obs:GateObservation[];sessions:Map<GateActor,string|null>;secrets:string[]};
const MAX_BODY=65_536;
function template(path:string,jobs:Map<string,string>):string{let p=path;for(const [id,label] of jobs)p=p.split(id).join(label);return p}

async function send(x:Ctx,jobs:Map<string,string>,stepId:string,actor:GateActor,method:"GET"|"POST",path:string,o:{body?:unknown;origin?:string|null;sessionOverride?:string|null}={}):Promise<{status:number|null;json:unknown;bodySha256:string|null}>{
 const c=x.c,timeout=c.timeoutMs??8000;
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),timeout);
 let status:number|null=null,bodySha256:string|null=null,json:unknown=null,keys:string[]|null=null;
 try{
  const headers=new Headers({accept:"application/json"});
  const session=o.sessionOverride!==undefined?o.sessionOverride:x.sessions.get(actor)??null;
  if(session)headers.set("cookie",session);
  if(method==="POST"){headers.set("content-type","application/json");const origin=o.origin===undefined?c.origin:o.origin;if(origin)headers.set("origin",origin)}
  // Raced against the deadline: a transport that ignores the abort signal must not be able to hang the gate.
  const gone=new Promise<never>((_,rej)=>ctl.signal.addEventListener("abort",()=>rej(Error("Deadline")),{once:true}));
  const res=await Promise.race([c.transport(new Request(c.origin+path,{method,headers,body:method==="POST"?JSON.stringify(o.body??{}):undefined,redirect:"error",signal:ctl.signal})),gone]);
  if(res.redirected||(res.url&&new URL(res.url).origin!==c.origin))throw Error("Redirect refused");
  status=res.status;
  const text=await res.text();
  if(text.length>(c.maxResponseBytes??MAX_BODY))throw Error("Overflow");
  try{json=JSON.parse(text)}catch{json=null}
  bodySha256=digest(json!==null?json:{nonJson:text.length>0});
  if(json&&typeof json==="object"&&!Array.isArray(json))keys=Object.keys(json as object).sort();
 }catch{status=null;bodySha256=null}
 finally{clearTimeout(timer)}
 x.obs.push({stepId,actor,method,pathTemplate:template(path,jobs),status,bodySha256,keys});
 return {status,json,bodySha256};
}

/** Runs the scenario. Sends nothing when a prerequisite is missing. */
export async function runStagingGate(config:GateConfig):Promise<GateEvidence>{
 const blockers=await gatePreflight(config);
 const base={schemaVersion:"hsi-staging-gate-p06-1" as const,profile:"nexus_fixture_api" as const,mode:config.mode,originHost:safeHost(config.origin),targetHash:String(config.targetHash??""),commitSha:String(config.commitSha??"")};
 if(blockers.length){
  const checks=GATE_PLAN.map(s=>({id:s.id,outcome:"blocked" as CheckOutcome,reason:"Not run: a prerequisite is missing."}));
  return finish(base,"BLOCKED",blockers,checks,[],config,[]);
 }
 const c=config,x:Ctx={c,obs:[],sessions:new Map(),secrets:[]};
 for(const a of GATE_ACTORS){const s=await c.hooks.session(a);x.sessions.set(a,s);if(s){x.secrets.push(s);for(const part of s.split(/[;=\s]+/))if(part.length>=12)x.secrets.push(part)}}
 const results=new Map<string,GateCheckResult>();
 const jobs=new Map<string,string>();
 const A=c.investigations.a,U=c.investigations.unknown;
 const P={jobs:"/api/research/nexus/jobs",job:(id:string)=>`/api/research/nexus/jobs/${id}`,brief:(id:string)=>`/api/research/nexus/jobs/${id}/brief`,health:"/api/research/nexus/health"};
 const UNKNOWN_JOB="fl-0000000000000000";
 const set=(id:string,outcome:CheckOutcome,reason:string)=>{results.set(id,{id,outcome,reason})};
 const spec=(id:string)=>GATE_PLAN.find(s=>s.id===id)!;
 /** A check runs only if its controls passed; a denial without a working control proves nothing. */
 const ready=(id:string):boolean=>{
  const s=spec(id);
  for(const r of s.requires){const o=results.get(r)?.outcome;if(o!=="passed"){set(id,"inconclusive",`Control or prerequisite "${r}" did not pass, so this result would prove nothing.`);return false}}
  if(s.needsInspector&&!c.hooks.inspector){set(id,"blocked","No inspector was supplied, so this cannot be established from outside the API.");return false}
  if(s.needsRevoke&&!c.hooks.revoke){set(id,"blocked","No revocation hook was supplied.");return false}
  return true;
 };
 const body=(terms=c.terms)=>({investigationId:A,terms:[...terms]});
 const denied=(r:{status:number|null;bodySha256:string|null},ref:{status:number|null;bodySha256:string|null})=>r.status===404&&ref.status===404&&r.bodySha256!==null&&r.bodySha256===ref.bodySha256;

 // ----- a_creates
 const create=await send(x,jobs,"a_creates","researcher_a","POST",P.jobs,{body:body()});
 const cj=create.json as {jobId?:unknown;created?:unknown}|null;
 const jobId=typeof cj?.jobId==="string"&&/^fl-[a-f0-9]{16}$/.test(cj.jobId)?cj.jobId:null;
 if(jobId)jobs.set(jobId,"<job-a>");
 set("a_creates",(create.status===202||create.status===200)&&jobId?"passed":"failed",jobId?`status ${create.status}`:`status ${create.status}, no valid job id`);
 const J=jobId??"fl-ffffffffffffffff";
 // let the system progress (rehearsal runs the worker) so export and audit can be established
 const waitMs=c.waitForCompletionMs??0;
 const status=async(actor:GateActor,step:string)=>send(x,jobs,step,actor,"GET",P.job(J));
 // ----- a_reopens_before
 const before=await status("researcher_a","a_reopens_before");
 set("a_reopens_before",before.status===200&&(before.json as {jobId?:string})?.jobId===J?"passed":"failed",`status ${before.status}`);
 // completion (for export and audit)
 let completed=false;
 if(jobId&&results.get("a_creates")!.outcome==="passed"){
  const end=Date.now()+waitMs;
  for(;;){
   try{await c.hooks.advance?.()}catch{/* an advance failure is not an isolation result */}
   const s=await status("researcher_a","a_completion_poll");
   if((s.json as {status?:string})?.status==="completed"&&(s.json as {briefAvailable?:boolean})?.briefAvailable===true){completed=true;break}
   if(Date.now()>=end)break;await new Promise(r=>setTimeout(r,c.pollMs??250));
  }
  // keep one poll observation, not one per poll
  const polls=x.obs.map((o,i)=>o.stepId==="a_completion_poll"?i:-1).filter(i=>i>=0);
  for(const i of polls.slice(0,-1).reverse())x.obs.splice(i,1);
 }
 // references for indistinguishability: the same operation on a run that exists nowhere, by the owner
 const unkRead=await send(x,jobs,"ref_unknown_read","researcher_a","GET",P.job(UNKNOWN_JOB));
 const unkBrief=await send(x,jobs,"ref_unknown_export","researcher_a","GET",P.brief(UNKNOWN_JOB));
 const unkStart=await send(x,jobs,"ref_unknown_start","researcher_b","POST",P.jobs,{body:{investigationId:U,terms:[...c.terms]}});

 // ----- B
 if(ready("b_cannot_read")){const r=await status("researcher_b","b_read");set("b_cannot_read",denied(r,unkRead)?"passed":"failed",`B got ${r.status}; unknown run got ${unkRead.status}; ${r.bodySha256===unkRead.bodySha256?"bodies identical":"bodies differ or B was not refused"}`)}
 if(ready("b_cannot_export")){const r=await send(x,jobs,"b_export","researcher_b","GET",P.brief(J));set("b_cannot_export",denied(r,unkBrief)?"passed":"failed",`B got ${r.status}; unknown run got ${unkBrief.status}; ${r.bodySha256===unkBrief.bodySha256?"bodies identical":"bodies differ or B was not refused"}`)}
 let jobsBefore:number|null=null;
 if(c.hooks.inspector){try{jobsBefore=await c.hooks.inspector.countJobs(A)}catch{jobsBefore=null}}
 if(ready("b_cannot_modify")){const r=await send(x,jobs,"b_start_on_a","researcher_b","POST",P.jobs,{body:body(["b-attempt"])});set("b_cannot_modify",denied(r,unkStart)?"passed":"failed",`B got ${r.status}; unknown investigation got ${unkStart.status}; ${r.bodySha256===unkStart.bodySha256?"bodies identical":"bodies differ or B was not refused"}`)}
 // ----- C
 if(ready("c_cross_org_denied")){
  const r1=await send(x,jobs,"c_read","researcher_c_other_org","GET",P.job(J)),r2=await send(x,jobs,"c_export","researcher_c_other_org","GET",P.brief(J)),r3=await send(x,jobs,"c_start_on_a","researcher_c_other_org","POST",P.jobs,{body:body(["c-attempt"])});
  const unkC=await send(x,jobs,"ref_unknown_start_c","researcher_c_other_org","POST",P.jobs,{body:{investigationId:U,terms:[...c.terms]}});
  const ok=denied(r1,unkRead)&&denied(r2,unkBrief)&&denied(r3,unkC);
  set("c_cross_org_denied",ok?"passed":"failed",`read ${r1.status}, export ${r2.status}, start ${r3.status}; ${ok?"all indistinguishable from unknown":"at least one was not refused or was distinguishable"}`);
 }
 // ----- anonymous
 if(ready("anonymous_denied")){
  const rs=[await status("anonymous","anon_read"),await send(x,jobs,"anon_export","anonymous","GET",P.brief(J)),await send(x,jobs,"anon_start","anonymous","POST",P.jobs,{body:body(["anon"])}),await send(x,jobs,"anon_health","anonymous","GET",P.health)];
  set("anonymous_denied",rs.every(r=>r.status===401)?"passed":"failed",`statuses ${rs.map(r=>r.status).join(", ")}`);
 }
 // ----- cross-origin
 if(ready("cross_origin_post_refused")){
  const r=await send(x,jobs,"cross_origin_start","researcher_a","POST",P.jobs,{body:body(["cross-origin"]),origin:"https://evil.invalid"});
  const r2=await send(x,jobs,"no_origin_start","researcher_a","POST",P.jobs,{body:body(["no-origin"]),origin:null});
  set("cross_origin_post_refused",r.status===403&&r2.status===403?"passed":"failed",`cross-origin ${r.status}, no origin ${r2.status}`);
 }
 // ----- health
 {
  const r=await send(x,jobs,"b_health","researcher_b","GET",P.health);
  const allowed=["at","dataMode","reasons","status"];
  set("health_is_coarse",r.status===200&&JSON.stringify(r.json&&typeof r.json==="object"?Object.keys(r.json as object).sort():null)===JSON.stringify(allowed)?"passed":"failed",`status ${r.status}, keys ${(r as {json:unknown}).json&&typeof r.json==="object"?Object.keys(r.json as object).sort().join(","):"none"}`);
 }
 // ----- retries
 if(ready("retry_idempotent")){
  const rs=[await send(x,jobs,"retry_1","researcher_a","POST",P.jobs,{body:body()}),...await Promise.all(Array.from({length:5},(_,i)=>send(x,jobs,`retry_concurrent_${i+1}`,"researcher_a","POST",P.jobs,{body:body()})))];
  const same=rs.every(r=>r.status===200&&(r.json as {jobId?:string})?.jobId===J&&(r.json as {created?:boolean})?.created===false);
  set("retry_idempotent",same?"passed":"failed",`${rs.length} retries: statuses ${[...new Set(rs.map(r=>r.status))].join(",")}; ${same?"all returned the same run with created=false":"a retry returned another run, created again or failed"}`);
 }
 if(ready("b_wrote_nothing")&&c.hooks.inspector){
  let after:number|null=null;try{after=await c.hooks.inspector.countJobs(A)}catch{/* inconclusive */}
  // A created exactly one job; B, C, anonymous and cross-origin attempts must not have added another.
  set("b_wrote_nothing",after===null||jobsBefore!==1?"inconclusive":after===1?"passed":"failed",after===null?"Could not count jobs.":jobsBefore!==1?`The control failed: ${jobsBefore} job(s) existed right after A's start (expected 1).`:`${after} job(s) for A's investigation after the other actors' attempts (expected exactly 1)`);
 }
 if(ready("retry_no_duplicate_rows")){
  let n:number|null=null;try{n=await c.hooks.inspector!.countJobs(A)}catch{/* inconclusive */}
  set("retry_no_duplicate_rows",n===null?"inconclusive":n===1?"passed":"failed",n===null?"Could not count jobs.":`${n} job(s) in the store for A's investigation after retries and attacks (expected exactly 1)`);
 }
 // ----- revoked session
 if(ready("revoked_session_denied")){
  const pre=await status("researcher_a_second_session","a2_before_revoke");
  let revoked=true;try{await c.hooks.revoke!("researcher_a_second_session")}catch{revoked=false}
  const post=await status("researcher_a_second_session","a2_after_revoke");
  const other=await status("researcher_a","a_after_a2_revoke");
  const postStart=await send(x,jobs,"a2_start_after_revoke","researcher_a_second_session","POST",P.jobs,{body:body(["after-revoke"])});
  if(!revoked)set("revoked_session_denied","inconclusive","The revocation hook failed.");
  else if(pre.status!==200)set("revoked_session_denied","inconclusive",`The control failed: the second session got ${pre.status} before revocation.`);
  else set("revoked_session_denied",post.status===401&&postStart.status===401&&other.status===200?"passed":"failed",`after revocation: read ${post.status}, start ${postStart.status}; A's other session ${other.status}`);
 }
 // ----- audit
 if(ready("audit_preserves_ownership")){
  if(!completed)set("audit_preserves_ownership","inconclusive","The run did not complete within the wait, so there is no audit trail to inspect.");
  else try{
   const ins=c.hooks.inspector!;const recs=await ins.auditRefs(J);const a=await ins.refsOf("researcher_a"),b=await ins.refsOf("researcher_b"),cc=await ins.refsOf("researcher_c_other_org");
   // B shares A's organisation in the usual two-account setup, so only the principal must differ from B's; the tenant must differ from C's.
   const distinct=a.principalRef!==b.principalRef&&a.principalRef!==cc.principalRef&&a.tenantRef!==cc.tenantRef;
   const ok=recs.length>0&&recs.every(r=>r.tenantRef===a.tenantRef&&r.principalRef===a.principalRef)&&distinct;
   set("audit_preserves_ownership",ok?"passed":"failed",recs.length===0?"No audit records for the run.":ok?`${recs.length} audit record(s), all carrying A's tenant and principal references, which differ from B's and C's`:!distinct?"The references derived for the accounts are not distinct, so the audit trail cannot tell them apart":"An audit record carries another researcher's or tenant's reference");
  }catch{set("audit_preserves_ownership","inconclusive","The inspector could not read the audit trail.")}
 }
 // ----- A reopens after
 if(ready("a_reopens_after")){
  const s=await status("researcher_a","a_reopen_after");
  let exportOk:boolean|null=null,note="";
  if(completed){const e=await send(x,jobs,"a_export_after","researcher_a","GET",P.brief(J));exportOk=e.status===200&&typeof (e.json as {contentHash?:string})?.contentHash==="string";note=`; export ${e.status}`}
  else note="; export not established (the run had not completed)";
  const statusOk=s.status===200&&(s.json as {jobId?:string})?.jobId===J;
  set("a_reopens_after",!statusOk||exportOk===false?"failed":exportOk===null?"inconclusive":"passed",`status ${s.status}${note}`);
 }
 // ----- profile boundary
 set("unauthorised_graph_or_evidence_access","not_covered","Graph and evidence endpoints are outside this profile; they need their own scenario against the research API with real accounts.");

 const checks=GATE_PLAN.map(s=>results.get(s.id)??{id:s.id,outcome:"inconclusive" as CheckOutcome,reason:"Not evaluated."});
 const failed=checks.some(r=>r.outcome==="failed");
 const unresolved=checks.some(r=>r.outcome==="inconclusive"||r.outcome==="blocked");
 const verdict:GateVerdict=failed?"FAILED":unresolved?"INCONCLUSIVE":"PASSED_PENDING_SIGNOFF";
 return finish(base,verdict,[],checks,x.obs,config,x.secrets);
}
function safeHost(origin:string){try{return new URL(origin).host}catch{return "invalid"}}

function finish(base:{schemaVersion:"hsi-staging-gate-p06-1";profile:"nexus_fixture_api";mode:"rehearsal"|"staging";originHost:string;targetHash:string;commitSha:string},verdict:GateVerdict,blockers:GateBlocker[],checks:GateCheckResult[],observations:GateObservation[],config:GateConfig,secrets:string[]):GateEvidence{
 const coveredIds=new Set(checks.filter(c=>c.outcome!=="not_covered").map(c=>c.id));
 const mandates=new Map<string,boolean>();for(const m of MANDATE_ITEMS)mandates.set(m,false);
 for(const s of GATE_PLAN)if(s.mandate&&coveredIds.has(s.id)&&s.id!=="unauthorised_graph_or_evidence_access")mandates.set(s.mandate,true);
 const covered=[...mandates].filter(([,v])=>v).map(([k])=>k),notCovered=[...mandates].filter(([,v])=>!v).map(([k])=>k);
 const note=config.mode==="rehearsal"
  ?"REHEARSAL: produced against an in-process fake. It shows the gate works; it is not evidence about any staging environment."
  :"Staging run. This is evidence for a named independent security signer; it is not acceptance, and it covers only the checks listed.";
 const body={...base,verdict,blockers,checks,observations,mandateCoverage:{covered,notCovered},mandateComplete:false as const,accepted:false as const,productionUntouched:true as const,securitySignoffRequired:true as const,scientificApproval:false as const,note};
 const ev:GateEvidence={...body,contentHash:digest(body)};
 const text=JSON.stringify(ev);
 for(const s of secrets)if(s&&text.includes(s))throw Error("Refusing to emit evidence that contains a session value");
 return ev;
}

/** Re-derives the hash and the invariants of a gate evidence document. Throws on any violation. */
export function verifyGateEvidence(value:unknown):GateEvidence{
 const e=value as GateEvidence;
 if(!e||e.schemaVersion!=="hsi-staging-gate-p06-1"||e.profile!=="nexus_fixture_api")throw Error("Not gate evidence");
 if(e.accepted!==false||e.productionUntouched!==true||e.securitySignoffRequired!==true||e.scientificApproval!==false||e.mandateComplete!==false)throw Error("Evidence flags were altered");
 if(!["BLOCKED","FAILED","INCONCLUSIVE","PASSED_PENDING_SIGNOFF"].includes(e.verdict)||!["rehearsal","staging"].includes(e.mode))throw Error("Malformed verdict");
 if(!Array.isArray(e.checks)||e.checks.length!==GATE_PLAN.length||GATE_PLAN.some((s,i)=>e.checks[i]?.id!==s.id))throw Error("Checks do not match the plan");
 const {contentHash,...body}=e;
 if(digest(body)!==contentHash)throw Error("Evidence does not match its hash");
 const failed=e.checks.some(c=>c.outcome==="failed"),unresolved=e.checks.some(c=>c.outcome==="inconclusive"||c.outcome==="blocked");
 const expect:GateVerdict=e.blockers.length?"BLOCKED":failed?"FAILED":unresolved?"INCONCLUSIVE":"PASSED_PENDING_SIGNOFF";
 if(e.verdict!==expect)throw Error("Verdict does not follow from the checks");
 if(e.verdict==="PASSED_PENDING_SIGNOFF"&&e.checks.some(c=>c.outcome!=="passed"&&c.outcome!=="not_covered"))throw Error("A pass with an unresolved check");
 if(e.blockers.length&&e.observations.length)throw Error("A blocked run must not have sent requests");
 return e;
}
export const sha256=(t:string)=>createHash("sha256").update(t).digest("hex");
