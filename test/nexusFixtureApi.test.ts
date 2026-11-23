/** The recorded-fixture literature run, end to end through the HTTP handler: submit -> authenticated worker -> gateway -> brief -> status,
 * health and verified brief. Real authority, grants, worker, gateway, executor and brief; the only fixtures are the recorded provider
 * responses, an in-memory session directory and temp folders. Not a staging run, and not wired to any deployment. */
import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,readFileSync,readdirSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createGatewayCallerAuthority,type VerifiedPrincipal} from "../src/gatewayCallerAuthority";
import {recordedLiteratureFetcher,runLiteratureFixtureJob,type LiteratureJob,type LiteratureJobEnv} from "../src/literatureFixtureJob";
import {verifyLiteratureBrief} from "../src/literatureBrief";
import {createFileGrantStore} from "../src/jobDelegationGrants";
import {createJobJournal} from "../src/nexusJobs";
import {cancelAuthenticatedJob,jobStatus,runWorkerOnce,submitAuthenticatedFixture} from "../src/nexusRunCommand";
import {createWorkerHeartbeat} from "../src/nexusWorkerHealth";
import {handleNexusFixtureApi} from "../src/server/nexusFixtureApi";

const dirs:string[]=[];const mkd=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-napi-"));dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const ORIGIN="https://hsi.test";
const TA="token-researcher-a-0123456789",TB="token-researcher-b-0123456789",TC="token-researcher-a-second-0123456789";

const setup=(over:{writesEnabled?:boolean}={})=>{
 const sessions=new Map<string,VerifiedPrincipal>([[TA,{subjectId:"subject-a",organizationId:"org-1",sessionId:"sess-a",roles:["researcher"]}],[TC,{subjectId:"subject-a",organizationId:"org-1",sessionId:"sess-a2",roles:["researcher"]}],[TB,{subjectId:"subject-b",organizationId:"org-2",sessionId:"sess-b",roles:["researcher"]}]]);
 const owners=new Map([["inv-a",{ownerSubjectId:"subject-a",organizationId:"org-1"}],["inv-a2",{ownerSubjectId:"subject-a",organizationId:"org-1"}],["inv-b",{ownerSubjectId:"subject-b",organizationId:"org-2"}]]);
 const standing=new Map([["subject-a|org-1",{roles:["researcher"]}],["subject-b|org-2",{roles:["researcher"]}]]);
 const store=createFileGrantStore(mkd(),{signingKey:"k".repeat(40)});
 const authority=createGatewayCallerAuthority({verifySession:async t=>sessions.get(t)??null,resolveInvestigation:async i=>owners.get(i)??null,resolveStanding:async(s,o)=>standing.get(`${s}|${o}`)??null,grants:store,ttlMs:60_000});
 const out=mkd();
 const deps={out,authority,sessionToken:(r:Request)=>/(?:^|;\s*)session=([^;]+)/.exec(r.headers.get("cookie")??"")?.[1]??null,authenticate:async(t:string)=>sessions.has(t),publicOrigin:ORIGIN,writesEnabled:over.writesEnabled??true};
 const call=(method:string,path:string,o:{token?:string|null;body?:unknown;raw?:string;origin?:string|null;ct?:string|null}={})=>{
  const h:Record<string,string>={};
  if(o.token!==null&&o.token!==undefined)h.cookie=`session=${o.token}`;
  if(o.origin!==null)h.origin=o.origin??ORIGIN;
  if(o.ct!==null&&(o.body!==undefined||o.raw!==undefined))h["content-type"]=o.ct??"application/json";
  return handleNexusFixtureApi(new Request("https://hsi.test"+path,{method,headers:h,body:o.raw??(o.body===undefined?undefined:JSON.stringify(o.body))}),deps) as Promise<Response>;
 };
 return {sessions,owners,standing,store,authority,out,deps,call};
};
const submit=async(s:ReturnType<typeof setup>,over:{token?:string|null;inv?:string;terms?:unknown}={})=>{const r=await s.call("POST","/api/research/nexus/jobs",{token:over.token===undefined?TA:over.token,body:{investigationId:over.inv??"inv-a",terms:over.terms??["IL-21","fibrosis"]}});return r};
const body=async(r:Response)=>JSON.parse(await r.text());

/* ---------- the whole flow ---------- */
test("END TO END: submit, authenticated worker runs it, status shows completion, and the served brief verifies and says it is recorded fixture data",async()=>{
 const s=setup();
 const r=await submit(s);expect(r.status).toBe(202);const {jobId,created,dataMode}=await body(r);
 expect([created,dataMode]).toEqual([true,"fixture_recorded"]);expect(jobId).toMatch(/^fl-[a-f0-9]{16}$/);
 const queued=await body(await s.call("GET",`/api/research/nexus/jobs/${jobId}`,{token:TA}));
 expect(queued).toMatchObject({jobId,status:"queued",briefAvailable:false,progress:null,dataMode:"fixture_recorded"});
 expect((await s.call("GET",`/api/research/nexus/jobs/${jobId}/brief`,{token:TA})).status).toBe(409);
 s.sessions.delete(TA); // the researcher logs out; the job carries its own grant
 const run=await runWorkerOnce({out:s.out,authority:s.authority});
 expect(run.ran[0]!.outcome.status).toBe("completed");expect(run.refused).toEqual([]);
 const done=await body(await s.call("GET",`/api/research/nexus/jobs/${jobId}`,{token:TC}));
 expect(done).toMatchObject({status:"completed",briefAvailable:true,errorCode:null,cancelRequested:false});
 const br=await s.call("GET",`/api/research/nexus/jobs/${jobId}/brief`,{token:TC});expect(br.status).toBe(200);
 const text=await br.text();const brief=verifyLiteratureBrief(JSON.parse(text));
 expect(br.headers.get("x-hsi-brief-sha256")).toBe(brief.contentHash);expect(br.headers.get("cache-control")).toBe("no-store");
 expect(brief).toMatchObject({dataMode:"fixture_recorded",investigationId:"inv-a",scope:"research_only",claims:[]});
 expect(brief.sources.map(x=>x.title).every(t=>t!.startsWith("[FIXTURE]"))).toBe(true);expect(brief.sources.length).toBe(3);
 expect(brief.provenance.audit.status).toBe("verified");expect(brief.provenance.receipts.every(x=>x.ok)).toBe(true);
 const md=await (await s.call("GET",`/api/research/nexus/jobs/${jobId}/brief?format=markdown`,{token:TC})).text();
 expect(md).toContain("RECORDED FIXTURE DATA");expect(md).toContain("Search hits, not evidence");
 // nothing identifying or internal leaves the server
 for(const secret of ["subject-a","org-1","sess-a",TA,TC,"g-"+"",s.out])expect(text+md+JSON.stringify(done)).not.toContain(secret);
 expect(text+JSON.stringify(done)).not.toMatch(/g-[a-f0-9]{32}|tenantRef|principalRef/);
});
test("the authenticated gateway really ran: its audit log carries the tenant reference and verifies, and no raw identity is in it",async()=>{
 const s=setup();const {jobId}=await body(await submit(s));await runWorkerOnce({out:s.out,authority:s.authority});
 const lines=readFileSync(join(s.out,"audit",jobId,"tool-audit.jsonl"),"utf8").trim().split("\n").map(l=>JSON.parse(l));
 expect(lines).toHaveLength(3);expect(lines.every(l=>/^[a-f0-9]{24}$/.test(l.tenantRef)&&l.outcome==="success"&&l.investigationId==="inv-a")).toBe(true);
 expect(JSON.stringify(lines)).not.toMatch(/subject-a|org-1|sess-a/);
});
test("a repeat submit is a no-op (200, created false) and mints no second grant",async()=>{
 const s=setup();const a=await body(await submit(s));const again=await submit(s);
 expect(again.status).toBe(200);expect(await body(again)).toMatchObject({jobId:a.jobId,created:false});
 expect(jobStatus(s.out)).toHaveLength(1);
});
test("progress is visible while the job runs",async()=>{
 const s=setup();const {jobId}=await body(await submit(s));
 let release!:()=>void;const gate=new Promise<void>(r=>{release=r});let mid:unknown=null;
 const run=runWorkerOnce({out:s.out,authority:s.authority,literatureRunner:async(job,env)=>{env.progress("retrieve",1,3);const r=await body(await s.call("GET",`/api/research/nexus/jobs/${jobId}`,{token:TA}));mid=r;await gate;return runLiteratureFixtureJob(job,env)}});
 await new Promise(r=>setTimeout(r,50));release();await run;
 expect(mid).toMatchObject({status:"running",progress:{stage:"retrieve",step:1,of:3}});
});

/* ---------- submit refusals ---------- */
test("submit refuses every request that is not a same-origin JSON post from a verified, owning researcher with writes enabled",async()=>{
 const s=setup();const P="/api/research/nexus/jobs";const ok={investigationId:"inv-a",terms:["x"]};
 const codes=async(r:Promise<Response>)=>{const x=await r;return [x.status,(await x.json()).code]};
 expect(await codes(s.call("POST",P,{token:TA,body:ok,origin:null}))).toEqual([403,"ORIGIN_REFUSED"]);
 expect(await codes(s.call("POST",P,{token:TA,body:ok,origin:"https://evil.example"}))).toEqual([403,"ORIGIN_REFUSED"]);
 expect(await codes(s.call("POST",P,{token:TA,body:ok,ct:"text/plain"}))).toEqual([415,"INVALID_REQUEST"]);
 expect(await codes(s.call("POST",P,{token:TA,body:ok,ct:"application/x-www-form-urlencoded"}))).toEqual([415,"INVALID_REQUEST"]);
 expect(await codes(s.call("POST",P,{token:null,body:ok}))).toEqual([401,"AUTH_REQUIRED"]);
 expect(await codes(s.call("POST",P,{token:"token-not-a-real-session-0123456789",body:ok}))).toEqual([401,"AUTH_REQUIRED"]);
 expect(await codes(s.call("POST",P,{token:TB,body:ok}))).toEqual([404,"NOT_FOUND"]);                       // someone else's investigation
 expect(await codes(s.call("POST",P,{token:TA,body:{...ok,investigationId:"inv-b"}}))).toEqual([404,"NOT_FOUND"]);
 expect(await codes(s.call("POST",P,{token:TA,body:{...ok,investigationId:"inv-none"}}))).toEqual([404,"NOT_FOUND"]); // identical to "not yours"
 const off=setup({writesEnabled:false});
 expect(await codes(off.call("POST",P,{token:TA,body:ok}))).toEqual([403,"RESEARCH_WRITES_DISABLED"]);
 expect(jobStatus(s.out)).toEqual([]);expect(jobStatus(off.out)).toEqual([]);
 expect(readdirSync(s.out).includes("queue")).toBe(false); // nothing was written for any refused request
});
test("the browser cannot set identity, tenant, roles, grants, job kind or fixture: any key beyond investigationId and terms is refused, and bad terms never queue",async()=>{
 const s=setup();const P="/api/research/nexus/jobs";
 const bad:unknown[]=[
  {investigationId:"inv-a",terms:["x"],tenantId:"org-9"},{investigationId:"inv-a",terms:["x"],roles:["research_admin"]},{investigationId:"inv-a",terms:["x"],grantId:"g-"+"1".repeat(32)},
  {investigationId:"inv-a",terms:["x"],kind:"fixture"},{investigationId:"inv-a",terms:["x"],fixture:"ssc-regression"},{investigationId:"inv-a",terms:["x"],subject:"subject-b"},
  {investigationId:"inv-a"},{terms:["x"]},{investigationId:"inv-a",terms:[]},{investigationId:"inv-a",terms:"x"},{investigationId:"inv-a",terms:Array(9).fill("x")},
  {investigationId:"inv-a",terms:["x".repeat(161)]},{investigationId:"inv-a",terms:["bad\u0000term"]},{investigationId:"inv-a",terms:[""]},{investigationId:"inv-a",terms:[1]},
  {investigationId:"../x",terms:["x"]},{investigationId:"inv a",terms:["x"]},{investigationId:7,terms:["x"]},{investigationId:"inv-a",terms:["NHS number 123 for this patient"]},
  [],"text",null,
 ];
 for(const b of bad){const r=await s.call("POST",P,{token:TA,body:b});expect([b,r.status===400||r.status===404]).toEqual([b,true]);expect(r.status).not.toBe(202)}
 expect((await s.call("POST",P,{token:TA,raw:"{not json"})).status).toBe(400);
 expect((await s.call("POST",P,{token:TA,raw:JSON.stringify({investigationId:"inv-a",terms:["x".repeat(5000)]})})).status).toBe(413);
 expect(jobStatus(s.out)).toEqual([]);
});

/* ---------- ownership on reads ---------- */
test("another researcher, an unauthenticated caller and an unknown job all get the same answer; nothing about someone else's job is revealed",async()=>{
 const s=setup();const {jobId}=await body(await submit(s));await runWorkerOnce({out:s.out,authority:s.authority});
 const paths=[`/api/research/nexus/jobs/${jobId}`,`/api/research/nexus/jobs/${jobId}/brief`];
 const unknown=await s.call("GET","/api/research/nexus/jobs/fl-0000000000000000",{token:TB});
 for(const p of paths){
  const other=await s.call("GET",p,{token:TB});expect(other.status).toBe(404);expect(await other.text()).toBe(await unknown.clone().text());
  expect((await s.call("GET",p,{token:null})).status).toBe(401);
  expect((await s.call("GET",p,{token:"token-not-a-real-session-0123456789"})).status).toBe(401);
  expect((await s.call("GET",p,{token:TA})).status).toBe(200);
 }
 for(const bad of ["fl-short","fl-ZZZZZZZZZZZZZZZZ","fj-"+"a".repeat(16),"fl-"+"a".repeat(16)+"%2F..%2Fx"])expect((await s.call("GET",`/api/research/nexus/jobs/${bad}`,{token:TA})).status).toBe(404);
 // a traversal that URL parsing resolves outside the prefix is not ours to answer at all
 expect(await s.call("GET","/api/research/nexus/jobs/../../etc/passwd",{token:TA})).toBeNull();
 expect(await (await s.call("GET",`/api/research/nexus/jobs/${jobId}/brief?format=pdf`,{token:TA})).json()).toMatchObject({code:"INVALID_REQUEST"});
});
test("ownership of reads follows the CURRENT owner of the investigation named by the signed grant; the job itself stops running when ownership moves",async()=>{
 const s=setup();const {jobId}=await body(await submit(s));
 s.owners.set("inv-a",{ownerSubjectId:"subject-b",organizationId:"org-2"});
 expect((await s.call("GET",`/api/research/nexus/jobs/${jobId}`,{token:TA})).status).toBe(404); // the previous owner loses access at once
 expect((await s.call("GET",`/api/research/nexus/jobs/${jobId}`,{token:TB})).status).toBe(200); // the investigation's data belongs to its current owner
 let ran=0;const r=await runWorkerOnce({out:s.out,authority:s.authority,literatureRunner:async()=>{ran++;return {auditHash:"a".repeat(64)}}});
 expect(ran).toBe(0);expect(r.refused.map(x=>x.code)).toEqual(["grant_forbidden"]); // the grant was made by the previous owner and is dead
});

/* ---------- failure, refusal and tamper ---------- */
test("a failed job reports a code only; a revoked grant means the job is refused and never claimed; a cancelled one says so",async()=>{
 const s=setup();const {jobId}=await body(await submit(s));
 const failing=await runWorkerOnce({out:s.out,authority:s.authority,literatureRunner:async()=>{throw Error("provider said: secret detail")}});
 expect(failing.ran[0]!.outcome.status).toBe("failed");
 const st=await body(await s.call("GET",`/api/research/nexus/jobs/${jobId}`,{token:TA}));
 expect(st).toMatchObject({status:"failed",errorCode:"error",briefAvailable:false});expect(JSON.stringify(st)).not.toContain("secret detail");
 expect((await s.call("GET",`/api/research/nexus/jobs/${jobId}/brief`,{token:TA})).status).toBe(409);
 const c=await cancelAuthenticatedJob({out:s.out,authority:s.authority,sessionToken:TA,jobId});expect(c).toMatchObject({ok:true});
 expect(await body(await s.call("GET",`/api/research/nexus/jobs/${jobId}`,{token:TA}))).toMatchObject({status:"cancelled"});
 let ran=0;const after=await runWorkerOnce({out:s.out,authority:s.authority,retryFailed:true,literatureRunner:async()=>{ran++;return {auditHash:"a".repeat(64)}}});
 expect(ran).toBe(0);expect(after.ran).toEqual([]);
});
test("an unauthenticated worker refuses a granted literature job: it stays queued and nothing runs",async()=>{
 const s=setup();const {jobId}=await body(await submit(s));
 let ran=0;const r=await runWorkerOnce({out:s.out,literatureRunner:async()=>{ran++;return {auditHash:"a".repeat(64)}}});
 expect(ran).toBe(0);expect(r.refused).toEqual([{jobId,code:"grant_unverifiable"}]);
 expect((await body(await s.call("GET",`/api/research/nexus/jobs/${jobId}`,{token:TA}))).status).toBe("queued");
});
test("a stored brief that was edited on disk is never served",async()=>{
 const s=setup();const {jobId}=await body(await submit(s));await runWorkerOnce({out:s.out,authority:s.authority});
 const dir=join(s.out,"briefs");const f=join(dir,readdirSync(dir).find(x=>x.endsWith(".json"))!);
 const b=JSON.parse(readFileSync(f,"utf8"));b.sources[0].reviewStatus="approved";writeFileSync(f,JSON.stringify(b));
 const r=await s.call("GET",`/api/research/nexus/jobs/${jobId}/brief`,{token:TA});
 expect(r.status).toBe(502);const t=await r.text();expect(t).toContain("BRIEF_UNVERIFIED");expect(t).not.toContain("approved");
});
test("least privilege: a literature job whose grant lacks the retrieval role fails closed",async()=>{
 const s=setup();
 const g=await submitAuthenticatedFixture({out:s.out,fixture:JSON.parse(readFileSync(join(import.meta.dir,"../research/runner-fixtures/ssc-regression.v1.json"),"utf8")),authority:s.authority,sessionToken:TA,investigationId:"inv-a"});
 if(!g.ok)throw Error("x");
 // an attacker with write access to the queue folder dresses a planner-only job as a literature job
 writeFileSync(join(s.out,"queue",`${g.jobId}.job.json`),JSON.stringify({schemaVersion:"hsi-nexus-job-1",kind:"literature_fixture",terms:["x"]}));
 const r=await runWorkerOnce({out:s.out,authority:s.authority});
 expect(r.ran[0]!.outcome.status).toBe("failed");expect(readdirSync(s.out).includes("briefs")).toBe(false);
});
test("recovery: a run that dies after retrieval is retried by a new worker with no duplicate provider call, and still produces one verified brief",async()=>{
 const s=setup();const {jobId}=await body(await submit(s));s.sessions.delete(TA);
 let fetches=0;const real=recordedLiteratureFetcher();const counting:typeof real=((i:Parameters<typeof real>[0],init?:Parameters<typeof real>[1])=>{fetches++;return real(i,init)}) as typeof real;
 let crashed=false;
 const runner=(job:LiteratureJob,env:LiteratureJobEnv)=>runLiteratureFixtureJob(job,{...env,fetcher:counting,progress:(st,a,b)=>{if(st==="build_brief"&&!crashed){crashed=true;throw Error("worker died")}return env.progress(st,a,b)}});
 expect((await runWorkerOnce({out:s.out,authority:s.authority,literatureRunner:runner})).ran[0]!.outcome.status).toBe("failed");
 expect(fetches).toBe(3);
 const second=await runWorkerOnce({out:s.out,authority:s.authority,retryFailed:true,literatureRunner:runner});
 expect(second.ran[0]!.outcome.status).toBe("completed");expect(fetches).toBe(3); // replayed from the durable idempotency store
 expect(jobStatus(s.out)[0]).toMatchObject({status:"completed",attempts:2});
 const r=await s.call("GET",`/api/research/nexus/jobs/${jobId}/brief`,{token:TC});expect(r.status).toBe(200);
 const b=verifyLiteratureBrief(JSON.parse(await r.text()));expect(b.provenance.receipts.every(x=>x.replayed)).toBe(true);
});

/* ---------- health, methods, headers ---------- */
test("health needs a verified session, is coarse (no counts, ids or workers), and reflects the worker",async()=>{
 const s=setup();const H="/api/research/nexus/health";
 expect((await s.call("GET",H,{token:null})).status).toBe(401);expect((await s.call("GET",H,{token:"token-not-a-real-session-0123456789"})).status).toBe(401);
 expect(await body(await s.call("GET",H,{token:TA}))).toMatchObject({status:"ok",reasons:[]});
 await submit(s);
 const down=await body(await s.call("GET",H,{token:TB}));
 expect(down).toMatchObject({status:"down",reasons:["no_live_worker"]});expect(Object.keys(down).sort()).toEqual(["at","dataMode","reasons","status"]); // another tenant sees status, not activity
 createWorkerHeartbeat({out:s.out,workerId:"w-aabbccdd"}).start();
 expect((await body(await s.call("GET",H,{token:TA}))).status).toBe("ok");
});
test("methods, unknown routes and foreign paths: 405 with Allow, 404, and null for paths outside the prefix; every answer is no-store",async()=>{
 const s=setup();
 for(const [m,p,allow] of [["GET","/api/research/nexus/jobs","POST"],["PUT","/api/research/nexus/jobs","POST"],["DELETE","/api/research/nexus/health","GET"],["POST","/api/research/nexus/health","GET"],["POST","/api/research/nexus/jobs/fl-0000000000000000","GET"]] as const){
  const r=await s.call(m,p,{token:TA,origin:ORIGIN});expect([m,p,r.status,r.headers.get("allow")]).toEqual([m,p,405,allow]);expect(r.headers.get("cache-control")).toBe("no-store");expect(r.headers.get("x-content-type-options")).toBe("nosniff");
 }
 for(const p of ["/api/research/nexus/nope","/api/research/nexus/jobs/fl-0000000000000000/other","/api/research/nexus/"]){const r=await s.call("GET",p,{token:TA});expect([p,r.status]).toEqual([p,404])}
 expect(await handleNexusFixtureApi(new Request("https://hsi.test/api/research/other"),s.deps)).toBeNull();
 expect(await handleNexusFixtureApi(new Request("https://hsi.test/api/research/nexusx/jobs"),s.deps)).toBeNull();
});
test("source scan: the handler takes identity only from the host's session function and never from the body, and does no network or model work",()=>{
 const src=readFileSync("src/server/nexusFixtureApi.ts","utf8");
 expect(/(^|[^.\w])fetch\s*\(/.test(src)).toBe(false);expect(/node:https?|undici|anthropic|openai/i.test(src.replace(/\/\*\*[\s\S]*?\*\//g,""))).toBe(false);
 expect(/\bb\.(tenant|roles|grant|subject|kind)/.test(src)).toBe(false);
});

/* ---------- guards that must hold on their own ---------- */
test("the investigation a job's owner is checked against comes from the signed grant: researcher A cannot read or cancel researcher B's job, whichever investigation A owns",async()=>{
 const s=setup();const b=await body(await submit(s,{token:TB,inv:"inv-b"}));const a=await body(await submit(s));
 expect(b.jobId).not.toBe(a.jobId);
 for(const p of [`/api/research/nexus/jobs/${b.jobId}`,`/api/research/nexus/jobs/${b.jobId}/brief`])expect((await s.call("GET",p,{token:TA})).status).toBe(404);
 expect((await s.call("GET",`/api/research/nexus/jobs/${b.jobId}`,{token:TB})).status).toBe(200);
 expect(await cancelAuthenticatedJob({out:s.out,authority:s.authority,sessionToken:TA,jobId:b.jobId})).toEqual({ok:false,code:"forbidden"});
 expect(jobStatus(s.out).find(j=>j.jobId===b.jobId)!.status).toBe("queued");
});
test("a brief is served only for a COMPLETED job: a result file left beside a failed or queued job is ignored",async()=>{
 const s=setup();const first=await body(await submit(s));await runWorkerOnce({out:s.out,authority:s.authority});
 const second=await body(await submit(s,{terms:["a different search"]}));
 writeFileSync(join(s.out,"results",`${second.jobId}.json`),readFileSync(join(s.out,"results",`${first.jobId}.json`),"utf8")); // a stray result for a job that has not completed
 const r=await s.call("GET",`/api/research/nexus/jobs/${second.jobId}/brief`,{token:TA});expect(r.status).toBe(409);
 expect((await body(await s.call("GET",`/api/research/nexus/jobs/${second.jobId}`,{token:TA})))).toMatchObject({status:"queued",briefAvailable:false});
});
test("the runner enforces least privilege itself: a grant without the retrieval role is refused before any gateway is built",async()=>{
 const out=mkd();let touched=0;
 const env={out,jobId:"fl-0000000000000000",grant:{grantId:"g-"+"1".repeat(32),investigationId:"inv-a",roles:["question_planner"]},authoriseCall:async()=>{touched++;throw Error("must not be reached")},callerAuthority:{} as never,signal:new AbortController().signal,progress:()=>true,fetcher:(async()=>{touched++;throw Error("no network")}) as never};
 await expect(runLiteratureFixtureJob({schemaVersion:"hsi-nexus-job-1",kind:"literature_fixture",terms:["x"]},env)).rejects.toThrow("Grant does not allow retrieval");
 expect(touched).toBe(0);expect(readdirSync(out)).toEqual([]);
});
test("a literature job with no grant cannot run on ANY worker: an unauthenticated worker fails it without calling the runner",async()=>{
 const out=mkd();const id="fl-aaaaaaaaaaaaaaaa";
 const {mkdirSync}=await import("node:fs");mkdirSync(join(out,"queue"),{recursive:true});
 writeFileSync(join(out,"queue",`${id}.job.json`),JSON.stringify({schemaVersion:"hsi-nexus-job-1",kind:"literature_fixture",terms:["x"]}));
 createJobJournal(join(out,"jobs")).create(id);
 let ran=0;const r=await runWorkerOnce({out,literatureRunner:async()=>{ran++;return {auditHash:"a".repeat(64)}}});
 expect(ran).toBe(0);expect(r.ran[0]!.outcome.status).toBe("failed");
});
