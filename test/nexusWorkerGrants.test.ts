/** The NEXUS worker with grant-carrying jobs: submission needs a live owning session, the worker refuses what it cannot verify,
 * and a refused job is never claimed. Fixture jobs, in-memory directories and temp folders only: not a staging run. */
import {afterAll,expect,test} from "bun:test";
import {existsSync,mkdtempSync,readFileSync,readdirSync,rmSync,statSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createGatewayCallerAuthority,type GatewayCallerAuthority,type VerifiedPrincipal} from "../src/gatewayCallerAuthority";
import {createFileGrantStore} from "../src/jobDelegationGrants";
import {jobStatus,runWorkerOnce,submitAuthenticatedFixture,submitFixture,type JobAuthority} from "../src/nexusRunCommand";

const dirs:string[]=[];const mkd=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-nxg-"));dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const fixture=JSON.parse(readFileSync(join(import.meta.dir,"../research/runner-fixtures/ssc-regression.v1.json"),"utf8"));
const H="c".repeat(64);
const TA="token-researcher-a-0123456789",TB="token-researcher-b-0123456789";

const world=()=>{
 const sessions=new Map<string,VerifiedPrincipal>(),owners=new Map<string,{ownerSubjectId:string;organizationId:string}>(),standing=new Map<string,{roles:string[]}>();
 let clock=1_000_000;
 sessions.set(TA,{subjectId:"subject-a",organizationId:"org-1",sessionId:"sess-a",roles:["researcher"]});
 sessions.set(TB,{subjectId:"subject-b",organizationId:"org-2",sessionId:"sess-b",roles:["researcher"]});
 owners.set("inv-a",{ownerSubjectId:"subject-a",organizationId:"org-1"});owners.set("inv-a2",{ownerSubjectId:"subject-a",organizationId:"org-1"});owners.set("inv-b",{ownerSubjectId:"subject-b",organizationId:"org-2"});
 standing.set("subject-a|org-1",{roles:["researcher"]});standing.set("subject-b|org-2",{roles:["researcher"]});
 const grantsDir=mkd(),store=createFileGrantStore(grantsDir,{signingKey:"k".repeat(40),now:()=>clock});
 const mk=():GatewayCallerAuthority=>createGatewayCallerAuthority({verifySession:async t=>sessions.get(t)??null,resolveInvestigation:async i=>owners.get(i)??null,resolveStanding:async(s,o)=>standing.get(`${s}|${o}`)??null,grants:store,now:()=>clock,ttlMs:60_000});
 return {sessions,owners,standing,store,grantsDir,authority:mk(),mk,advance:(ms:number)=>{clock+=ms}};
};
const submit=(w:ReturnType<typeof world>,out:string,over:Record<string,unknown>={})=>submitAuthenticatedFixture({out,fixture,authority:w.authority,sessionToken:TA,investigationId:"inv-a",...over} as never);
const stub=(calls:{n:number;ctx:(JobAuthority|undefined)[]})=>async(_f:unknown,_d:string,ctx?:JobAuthority)=>{calls.n++;calls.ctx.push(ctx);return {auditHash:H}};
const mkCalls=()=>({n:0,ctx:[] as (JobAuthority|undefined)[]});
const allFiles=(d:string):string[]=>readdirSync(d).flatMap(f=>{const p=join(d,f);return statSync(p).isDirectory()?allFiles(p):[p]});

/* ---------- submission ---------- */
test("submit: a live owning session queues a job with a grant bound to it; no session token is written anywhere",async()=>{
 const w=world(),out=mkd();
 const r=await submit(w,out);expect(r).toMatchObject({ok:true,created:true});if(!r.ok)return;
 expect(r.jobId).toMatch(/^fj-[a-f0-9]{16}$/);
 const ref=JSON.parse(readFileSync(join(out,"queue",`${r.jobId}.grant.json`),"utf8"));
 const st=(await w.store.get(ref.grantId))!;
 expect(st.grant).toMatchObject({jobId:r.jobId,investigationId:"inv-a",subjectId:"subject-a",organizationId:"org-1",roles:["question_planner"]});
 expect(jobStatus(out)).toHaveLength(1);
 for(const f of [...allFiles(out),...allFiles(w.grantsDir)])expect(readFileSync(f,"utf8")).not.toContain(TA);
});
test("submit: another tenant, a non-owner, an unknown investigation, a bad session or bad roles are refused and nothing at all is created",async()=>{
 const w=world();
 for(const over of [{sessionToken:TB},{investigationId:"inv-b"},{investigationId:"inv-none"},{sessionToken:"short"},{sessionToken:"token-not-a-session-0123456789"},{roles:["root"]},{roles:[]},{investigationId:42}]){
  const out=mkd();const r=await submit(w,out,over);expect(r.ok).toBe(false);
  expect(jobStatus(out)).toEqual([]);expect(existsSync(join(out,"queue"))?readdirSync(join(out,"queue")):[]).toEqual([]);
 }
 expect(readdirSync(join(w.grantsDir,"grants"))).toHaveLength(0);
 expect(()=>submitAuthenticatedFixture({out:mkd(),fixture:{schemaVersion:"x"},authority:w.authority,sessionToken:TA,investigationId:"inv-a"})).toThrow();
});
test("submit: the same fixture for the same investigation is a no-op that mints no second grant; another investigation gets its own job",async()=>{
 const w=world(),out=mkd();
 const a=await submit(w,out),again=await submit(w,out),other=await submit(w,out,{investigationId:"inv-a2"});
 expect(a.ok&&again.ok&&other.ok).toBe(true);if(!(a.ok&&again.ok&&other.ok))return;
 expect(again).toEqual({ok:true,jobId:a.jobId,created:false});expect(other.jobId).not.toBe(a.jobId);
 expect(readdirSync(join(w.grantsDir,"grants"))).toHaveLength(2);
 // a stranger learns nothing about the queue: refused before the existence check
 expect((await submit(w,out,{sessionToken:TB})).ok).toBe(false);
});

/* ---------- authenticated worker ---------- */
test("an authenticated worker runs a granted job after the session is gone, and hands the runner its scope and an authoriser",async()=>{
 const w=world(),out=mkd();const s=await submit(w,out);if(!s.ok)throw Error("x");
 w.sessions.delete(TA); // logout
 const calls=mkCalls();
 const r=await runWorkerOnce({out,authority:w.mk(),runner:stub(calls)});
 expect(r.refused).toEqual([]);expect(r.ran[0]!.outcome.status).toBe("completed");
 const ctx=calls.ctx[0]!;expect(ctx.grant).toMatchObject({investigationId:"inv-a",roles:["question_planner"]});
 const a=await ctx.authoriseCall!({taskId:"t-1",role:"question_planner"});expect(a.investigationId).toBe("inv-a");
 await expect(ctx.authoriseCall!({taskId:"t-1",role:"evidence_retriever"})).rejects.toThrow(); // outside the grant's roles
 expect(jobStatus(out)[0]).toMatchObject({status:"completed",attempts:1});
});
test("every way a grant can stop being valid leaves the job unclaimed: no attempt consumed, runner never called, still queued, reported with a code",async()=>{
 const cases:[string,(w:ReturnType<typeof world>,out:string,jobId:string,grantId:string)=>Promise<void>|void,RegExp][]=[
  ["revoked",async(w,_o,_j,g)=>{await w.store.revoke(g,"user_cancelled")},/^grant_forbidden$/],
  ["expired",w=>w.advance(86_400_001),/^grant_forbidden$/],
  ["account disabled",w=>{w.standing.delete("subject-a|org-1")},/^grant_forbidden$/],
  ["role removed",w=>{w.standing.set("subject-a|org-1",{roles:["scientific_reviewer"]})},/^grant_forbidden$/],
  ["investigation transferred",w=>{w.owners.set("inv-a",{ownerSubjectId:"subject-b",organizationId:"org-2"})},/^grant_forbidden$/],
  ["investigation deleted",w=>{w.owners.delete("inv-a")},/^grant_forbidden$/],
  ["grant reference missing",(_w,out,j)=>{rmSync(join(out,"queue",`${j}.grant.json`))},/^no_grant$/],
  ["grant reference corrupt",(_w,out,j)=>{writeFileSync(join(out,"queue",`${j}.grant.json`),"{not json")},/^grant_unreadable$/],
  ["grant reference points at an unknown grant",(_w,out,j)=>{writeFileSync(join(out,"queue",`${j}.grant.json`),JSON.stringify({schemaVersion:"hsi-job-grant-ref-1",grantId:"g-"+"7".repeat(32)}))},/^grant_forbidden$/],
  ["grant record tampered",(w,_o,_j,g)=>{const f=join(w.grantsDir,"grants",`${g}.json`);const r=JSON.parse(readFileSync(f,"utf8"));r.body.expiresAtMs+=9e6;writeFileSync(f,JSON.stringify(r))},/^grant_unavailable$/],
 ];
 for(const [name,change,code] of cases){
  const w=world(),out=mkd();const s=await submit(w,out);if(!s.ok)throw Error("x");
  const ref=JSON.parse(readFileSync(join(out,"queue",`${s.jobId}.grant.json`),"utf8"));
  await change(w,out,s.jobId,ref.grantId);
  const calls=mkCalls();const r=await runWorkerOnce({out,authority:w.mk(),runner:stub(calls)});
  expect([name,calls.n,r.ran.length,r.refused.map(x=>x.jobId)]).toEqual([name,0,0,[s.jobId]]);
  expect(r.refused[0]!.code).toMatch(code);
  expect(jobStatus(out)[0]).toMatchObject({status:"queued",attempts:0});
 }
});
test("a grant minted for another job cannot be swapped in",async()=>{
 const w=world(),out=mkd();
 const a=await submit(w,out),b=await submit(w,out,{investigationId:"inv-a2"});if(!(a.ok&&b.ok))throw Error("x");
 const refB=readFileSync(join(out,"queue",`${b.jobId}.grant.json`),"utf8");
 writeFileSync(join(out,"queue",`${a.jobId}.grant.json`),refB); // job A now presents job B's valid grant
 const calls=mkCalls();const r=await runWorkerOnce({out,authority:w.mk(),runner:stub(calls)});
 expect(r.refused.find(x=>x.jobId===a.jobId)?.code).toBe("grant_forbidden");
 expect(r.ran.map(x=>x.jobId)).toEqual([b.jobId]);
});
test("a grant revoked between admission and the start of the run does not start (re-verified at run time)",async()=>{
 const w=world(),out=mkd();const s=await submit(w,out);if(!s.ok)throw Error("x");
 const ref=JSON.parse(readFileSync(join(out,"queue",`${s.jobId}.grant.json`),"utf8"));
 const real=w.mk();let seen=0;
 const racing:GatewayCallerAuthority={...real,verifyJobGrant:async i=>{const r=await real.verifyJobGrant(i);if(++seen===1)await w.store.revoke(ref.grantId,"suspected_compromise");return r}};
 const calls=mkCalls();const r=await runWorkerOnce({out,authority:racing,runner:stub(calls)});
 expect(calls.n).toBe(0);expect(r.ran[0]!.outcome.status).toBe("failed");
});
test("mixed modes fail closed: an unauthenticated worker refuses granted jobs, an authenticated worker refuses grant-less jobs, and plain fixture jobs still run as before",async()=>{
 const w=world(),out=mkd();
 const granted=await submit(w,out);const plain=submitFixture({out,fixture});if(!granted.ok)throw Error("x");
 const c1=mkCalls();const un=await runWorkerOnce({out,runner:stub(c1)});
 expect(un.refused).toEqual([{jobId:granted.jobId,code:"grant_unverifiable"}]);expect(un.ran.map(x=>x.jobId)).toEqual([plain.jobId]);expect(c1.ctx[0]).toMatchObject({grant:null,authoriseCall:null});
 const out2=mkd();submitFixture({out:out2,fixture});
 const c2=mkCalls();const au=await runWorkerOnce({out:out2,authority:w.mk(),runner:stub(c2)});
 expect(au.refused.map(x=>x.code)).toEqual(["no_grant"]);expect(c2.n).toBe(0);
});
test("refused jobs do not use up maxJobs or the daily cap, and a refused job never blocks a good one",async()=>{
 const w=world(),out=mkd();
 const bad=await submit(w,out,{investigationId:"inv-a"}),good=await submit(w,out,{investigationId:"inv-a2"});if(!(bad.ok&&good.ok))throw Error("x");
 w.owners.set("inv-a",{ownerSubjectId:"subject-b",organizationId:"org-2"});
 const calls=mkCalls();const r=await runWorkerOnce({out,authority:w.mk(),runner:stub(calls),maxJobs:1,dailyCap:1});
 expect(r.ran.map(x=>x.jobId)).toEqual([good.jobId]);expect(r.refused.map(x=>x.jobId)).toEqual([bad.jobId]);
});
test("a custom admit hook composes with the grant check; a throwing or ill-formed hook refuses (fail closed) with a sanitised code",async()=>{
 const w=world();
 for(const [admit,code] of [[async()=>({ok:false as const,code:"quota_hold"}),"quota_hold"],[async()=>{throw Error("secret detail")},"admit_error"],[async()=>({ok:false as const,code:"BAD CODE!!"}),"admit_error"],[async()=>undefined as never,"admit_error"]] as [()=>Promise<never>,string][]){
  const out=mkd();const s=await submit(w,out);if(!s.ok)throw Error("x");
  const calls=mkCalls();const r=await runWorkerOnce({out,authority:w.mk(),runner:stub(calls),admit});
  expect(r.refused).toEqual([{jobId:s.jobId,code}]);expect(calls.n).toBe(0);expect(JSON.stringify(r)).not.toContain("secret detail");
 }
});
test("recovery: a run that fails mid-way is retried by a NEW authenticated worker with no session, and completes on its second attempt",async()=>{
 const w=world(),out=mkd();const s=await submit(w,out);if(!s.ok)throw Error("x");w.sessions.delete(TA);
 let n=0;const runner=async()=>{if(++n===1)throw Error("worker died");return {auditHash:H}};
 expect((await runWorkerOnce({out,authority:w.mk(),runner})).ran[0]!.outcome.status).toBe("failed");
 const r2=await runWorkerOnce({out,authority:w.mk(),runner,retryFailed:true});
 expect(r2.ran[0]!.outcome.status).toBe("completed");expect(jobStatus(out)[0]).toMatchObject({status:"completed",attempts:2});
});
test("recovery stops if authority is withdrawn in between: a failed job whose grant is revoked is not retried",async()=>{
 const w=world(),out=mkd();const s=await submit(w,out);if(!s.ok)throw Error("x");
 const ref=JSON.parse(readFileSync(join(out,"queue",`${s.jobId}.grant.json`),"utf8"));
 let n=0;const runner=async()=>{n++;throw Error("boom")};
 await runWorkerOnce({out,authority:w.mk(),runner});
 await w.store.revoke(ref.grantId,"admin_revoked");
 const r=await runWorkerOnce({out,authority:w.mk(),runner,retryFailed:true});
 expect(n).toBe(1);expect(r.refused.map(x=>x.code)).toEqual(["grant_forbidden"]);
});
test("two authenticated workers draining one queue at once run a granted job exactly once",async()=>{
 const w=world(),out=mkd();const s=await submit(w,out);if(!s.ok)throw Error("x");
 const calls=mkCalls();const runner=async(f:unknown,d:string,c?:JobAuthority)=>{await new Promise(r=>setTimeout(r,20));return stub(calls)(f,d,c)};
 await Promise.all([runWorkerOnce({out,authority:w.mk(),runner}),runWorkerOnce({out,authority:w.mk(),runner})]);
 expect(calls.n).toBe(1);expect(jobStatus(out)[0]).toMatchObject({status:"completed",attempts:1});
});
test("the real fixture runner still runs an authenticated job end to end and writes its audit store",async()=>{
 const w=world(),out=mkd();const s=await submit(w,out);if(!s.ok)throw Error("x");w.sessions.delete(TA);
 const r=await runWorkerOnce({out,authority:w.mk()});
 expect(r.ran[0]!.outcome.status).toBe("completed");expect(existsSync(join(out,"audit",s.jobId))).toBe(true);
});
