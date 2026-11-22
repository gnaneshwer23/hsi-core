/** NEXUS terminal states and operations: cancellation, dead-lettering, progress, worker health, authenticated cancel.
 * Temp directories, fake clocks and recorded fixtures only: this proves control logic, not a staging run. */
import {afterAll,expect,test} from "bun:test";
import {appendFileSync,existsSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createGatewayCallerAuthority,type VerifiedPrincipal} from "../src/gatewayCallerAuthority";
import {createFileGrantStore} from "../src/jobDelegationGrants";
import {createJobJournal,runDurable} from "../src/nexusJobs";
import {cancelAuthenticatedJob,cancelJob,jobStatus,runWorkerLoop,runWorkerOnce,submitAuthenticatedFixture,submitFixture} from "../src/nexusRunCommand";
import {drainJobs,dueJobs,sweepDeadLetters} from "../src/nexusWorker";
import {createWorkerHeartbeat,nexusHealth} from "../src/nexusWorkerHealth";

const dirs:string[]=[];const mkd=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-term-"));dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const H="d".repeat(64);const ok=async()=>({auditHash:H});
let clock=1_000_000;const now=()=>clock;
const journal=()=>createJobJournal(mkd(),{now});
const fixture=JSON.parse(readFileSync(join(import.meta.dir,"../research/runner-fixtures/ssc-regression.v1.json"),"utf8"));
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));

/* ---------- cancellation ---------- */
test("cancel: a queued job is cancelled at once, never runs, is never due, and is idempotent; unknown and finished jobs are reported, not changed",async()=>{
 const j=journal();j.create("job-q");
 expect(j.cancel("job-q")).toBe("cancelled");expect(j.cancel("job-q")).toBe("already_terminal");
 expect(j.state("job-q")).toMatchObject({status:"cancelled",lastErrorCode:"user_cancelled"});
 let ran=0;expect(await runDurable(j,"job-q",async()=>{ran++;return {auditHash:H}})).toEqual({status:"cancelled"});expect(ran).toBe(0);
 expect(dueJobs(j,{now})).toEqual([]);
 expect(j.cancel("job-none")).toBe("unknown");
 j.create("job-done");await runDurable(j,"job-done",ok);
 expect(j.cancel("job-done")).toBe("already_terminal");expect(j.state("job-done")!.status).toBe("completed");
 expect(j.cancel("job-q","free text with spaces!")).toBe("already_terminal"); // codes only
});
test("cancel: a running job is asked to stop; a completed attempt still completes; a failed one ends cancelled and is never retried",async()=>{
 const a=journal();a.create("job-a");const att=a.claim("job-a",1)!;
 expect(a.cancel("job-a")).toBe("cancel_requested");expect(a.cancel("job-a")).toBe("cancel_requested");
 expect(a.events().filter(e=>e.type==="cancel_requested")).toHaveLength(1);
 expect(a.state("job-a")).toMatchObject({status:"running",cancelRequested:true});expect(a.isCancelRequested("job-a")).toBe(true);
 a.complete("job-a",att,H);expect(a.state("job-a")!.status).toBe("completed"); // finished work is not thrown away
 const b=journal();b.create("job-b");const att2=b.claim("job-b",1)!;b.cancel("job-b");b.fail("job-b",att2,"error");
 expect(b.state("job-b")!.status).toBe("cancelled");expect(dueJobs(b,{now,retryFailed:true})).toEqual([]);
});
test("cancel through a drain: the running job's own signal aborts promptly, it ends cancelled, and a retry pass leaves it alone",async()=>{
 const j=journal();j.create("job-r");let sawAbort=false;
 const drain=drainJobs(j,async(_id,{signal})=>{await new Promise<void>((res,rej)=>{signal.addEventListener("abort",()=>{sawAbort=true;rej(Error("stopped"))});setTimeout(res,5_000)});return {auditHash:H}},{cancelPollMs:20,now:()=>Date.now()});
 await sleep(60);expect(j.cancel("job-r")).toBe("cancel_requested");
 const r=await drain;
 expect(sawAbort).toBe(true);expect(r.ran[0]!.outcome.status).toBe("failed");expect(j.state("job-r")!.status).toBe("cancelled");
 expect((await drainJobs(j,ok,{retryFailed:true})).ran).toEqual([]);
});
test("cancel: one job's cancel does not abort another running job",async()=>{
 const j=journal();j.create("job-x");j.create("job-y");const aborted=new Set<string>();
 const drain=drainJobs(j,async(id,{signal})=>{signal.addEventListener("abort",()=>aborted.add(id));await sleep(250);return {auditHash:H}},{cancelPollMs:20,concurrency:2,now:()=>Date.now()});
 await sleep(60);j.cancel("job-x");await drain;
 expect([...aborted]).toEqual(["job-x"]);expect(j.state("job-y")!.status).toBe("completed");
});
test("cancel: a request left behind by a dead worker is finished by the next pass without rerunning the job",async()=>{
 const j=journal();j.create("job-d");j.claim("job-d",1);j.cancel("job-d");clock+=11*60_000; // lease expired, worker gone
 let ran=0;const r=await drainJobs(j,async()=>{ran++;return {auditHash:H}},{now});
 expect(ran).toBe(0);expect(r.ran[0]!.outcome).toEqual({status:"cancelled"});expect(j.state("job-d")!.status).toBe("cancelled");
 expect(j.state("job-d")!.attempts).toBe(1);expect(j.events().filter(e=>e.type==="started")).toHaveLength(1); // finished the cancel without consuming another attempt
});
test("cancel race: a cancel that lands between the due check and the claim wins; the work never starts",async()=>{
 const j=journal();j.create("job-c");
 const racing={...j,claim:(id:string,n:number)=>{const r=j.claim(id,n);j.cancel(id);return r}} as typeof j;
 let ran=0;const out=await runDurable(racing,"job-c",async()=>{ran++;return {auditHash:H}});
 expect(out).toEqual({status:"cancelled"});expect(ran).toBe(0);expect(j.state("job-c")!.status).toBe("cancelled");
});
test("terminal states are sticky: later started, completed or failed events cannot change cancelled or dead-lettered jobs",()=>{
 const dir=mkd();const j=createJobJournal(dir,{now});j.create("job-s");j.cancel("job-s");
 const at=new Date(now()).toISOString();
 for(const type of ["started","completed","failed","dead_lettered"])appendFileSync(join(dir,"jobs.jsonl"),JSON.stringify({jobId:"job-s",type,attempt:1,at,auditHash:H,errorCode:"error"})+"\n");
 expect(createJobJournal(dir,{now}).state("job-s")!.status).toBe("cancelled");
 const dir2=mkd();const j2=createJobJournal(dir2,{now});j2.create("job-t");j2.claim("job-t",1);j2.fail("job-t",1,"error");j2.deadLetter("job-t","error");
 for(const type of ["started","completed","failed","cancelled"])appendFileSync(join(dir2,"jobs.jsonl"),JSON.stringify({jobId:"job-t",type,attempt:2,at,auditHash:H,errorCode:"error"})+"\n");
 expect(createJobJournal(dir2,{now}).state("job-t")!.status).toBe("dead_lettered");
});

/* ---------- dead letter ---------- */
test("dead letter: the last allowed failure dead-letters the job; it never runs again, even with retryFailed; completed jobs are never dead-lettered",async()=>{
 const j=journal();j.create("job-f");const boom=async()=>{throw Error("WARDEN refused: model_budget; secret passage")};
 expect(await runDurable(j,"job-f",boom,{maxAttempts:2})).toEqual({status:"failed",attempt:1,errorCode:"model_budget"});
 expect(await runDurable(j,"job-f",boom,{maxAttempts:2})).toEqual({status:"failed",attempt:2,errorCode:"model_budget",deadLettered:true});
 expect(j.state("job-f")).toMatchObject({status:"dead_lettered",attempts:2,lastErrorCode:"model_budget"});
 expect(await runDurable(j,"job-f",ok,{maxAttempts:2})).toEqual({status:"attempts_exhausted"});
 expect(dueJobs(j,{now,maxAttempts:2,retryFailed:true})).toEqual([]);
 j.create("job-ok");await runDurable(j,"job-ok",ok);expect(j.deadLetter("job-ok","error")).toBe(false);expect(j.state("job-ok")!.status).toBe("completed");
 expect(j.deadLetter("job-f","error")).toBe(false);
});
test("dead letter sweep: legacy exhausted jobs and a final attempt that died with its lease are dead-lettered; a live lease is untouched",()=>{
 const dir=mkd();const j=createJobJournal(dir,{now});
 j.create("job-failed");for(const n of [1,2,3]){j.claim("job-failed",n);j.fail("job-failed",n,"error")} // pre-existing journals have no dead_lettered event
 j.create("job-died");for(const n of [1,2,3])j.claim("job-died",n);
 j.create("job-live");for(const n of [1,2,3])j.claim("job-live",n);
 clock+=5*60_000; // 5 minutes into a 10 minute lease
 expect(sweepDeadLetters(j,{now,maxAttempts:3}).sort()).toEqual(["job-failed"]);
 clock+=6*60_000; // now every started attempt is past a 10 minute lease
 expect(sweepDeadLetters(j,{now,maxAttempts:3}).sort()).toEqual(["job-died","job-live"]);
 expect(j.state("job-died")).toMatchObject({status:"dead_lettered",lastErrorCode:"lease_expired"});
 expect(j.state("job-failed")!.lastErrorCode).toBe("error");
 expect(sweepDeadLetters(j,{now,maxAttempts:3})).toEqual([]);
});
test("a drain reports the jobs it dead-lettered and skips them",async()=>{
 const j=journal();j.create("job-e");for(const n of [1,2,3]){j.claim("job-e",n);j.fail("job-e",n,"error")}j.create("job-n");
 const r=await drainJobs(j,ok,{now});
 expect(r.deadLettered).toEqual(["job-e"]);expect(r.ran.map(x=>x.jobId)).toEqual(["job-n"]);
});

/* ---------- progress ---------- */
test("progress: recorded only for the current running attempt, as codes and counts; resets on a new attempt; bad input is ignored",async()=>{
 const j=journal();j.create("job-p");const a1=j.claim("job-p",1)!;
 expect(j.progress("job-p",a1,"extract_context",1,4)).toBe(true);
 expect(j.state("job-p")!.progress).toMatchObject({stage:"extract_context",step:1,of:4});
 for(const bad of [["Bad Stage!",1,4],["ok_stage",5,4],["ok_stage",-1,4],["ok_stage",1,0],["ok_stage",1,5000],["ok_stage",1.5,4]] as [string,number,number][])expect(j.progress("job-p",a1,...bad)).toBe(false);
 expect(j.progress("job-p",a1+1,"ok_stage",1,2)).toBe(false);expect(j.progress("job-none",1,"ok_stage",1,2)).toBe(false);
 j.fail("job-p",a1,"error");expect(j.progress("job-p",a1,"ok_stage",2,4)).toBe(false); // not running any more
 const a2=j.claim("job-p",2)!;expect(j.state("job-p")!.progress).toBeNull();
 expect(j.progress("job-p",a1,"ok_stage",3,4)).toBe(false); // a stale attempt cannot write
 expect(j.progress("job-p",a2,"verify_claims",2,4)).toBe(true);expect(j.state("job-p")!.progress!.stage).toBe("verify_claims");
});
test("progress through a drain: the worker's context reports it and it is visible while the job runs",async()=>{
 const j=journal();j.create("job-w");let during:unknown=null;
 await drainJobs(j,async(id,{progress})=>{progress("retrieve_evidence",1,3);progress("verify_claims",2,3);during=j.state(id)!.progress;return {auditHash:H}},{now});
 expect(during).toMatchObject({stage:"verify_claims",step:2,of:3});expect(j.state("job-w")!.progress).toBeNull(); // completed: nothing in flight
});

/* ---------- health ---------- */
const out0=()=>{const d=mkd();return d};
test("health: an empty system is ok; queued work with no live worker is down; a live worker makes it ok; a stale one degrades",()=>{
 clock=5_000_000;const out=out0();
 expect(nexusHealth({out,now}).status).toBe("ok");
 submitFixture({out,fixture,now});
 expect(nexusHealth({out,now})).toMatchObject({status:"down",reasons:["no_live_worker"],queue:{queued:1}});
 const hb=createWorkerHeartbeat({out,workerId:"w-aabbccdd",now});hb.start();
 expect(nexusHealth({out,now})).toMatchObject({status:"ok",workers:[{workerId:"w-aabbccdd",live:true}]});
 clock+=61_000;
 expect(nexusHealth({out,now}).status).toBe("down"); // heartbeat stale and work waiting
 hb.stop();clock+=1;
});
test("health: stuck, dead-lettered, old and cancel-pending work degrade the verdict with fixed reason codes and no job content",()=>{
 clock=6_000_000;const out=out0();const jd=join(out,"jobs");const j=createJobJournal(jd,{now});
 const hb=createWorkerHeartbeat({out,workerId:"w-00112233",now});hb.start();
 j.create("job-stuck");j.claim("job-stuck",1);j.create("job-cancelling");j.claim("job-cancelling",1);j.cancel("job-cancelling");
 j.create("job-dead");for(const n of [1,2,3]){j.claim("job-dead",n);j.fail("job-dead",n,"error")}j.deadLetter("job-dead","error");
 j.create("job-old");
 clock+=20*60_000;hb.beat("running");
 const h=nexusHealth({out,now});
 expect(h.status).toBe("degraded");expect(h.reasons).toEqual(["cancel_pending","dead_lettered_present","old_queued_work","stuck_running"]);
 expect(h.queue).toMatchObject({queued:1,running:2,stuckRunning:2,deadLettered:1,cancelPending:1});
 expect(JSON.stringify(h)).not.toMatch(/job-stuck|job-dead|job-old|job-cancelling/);
});
test("health: a stopped worker with an empty queue is ok; a half-written or foreign worker file is flagged, never trusted",()=>{
 clock=7_000_000;const out=out0();const hb=createWorkerHeartbeat({out,workerId:"w-deadbeef",now});hb.start();hb.stop();clock+=10*60_000;
 expect(nexusHealth({out,now}).status).toBe("ok");
 writeFileSync(join(out,"health","w-0badbad0.json"),"{not json");
 writeFileSync(join(out,"health","w-0badbad1.json"),JSON.stringify({schemaVersion:"x",workerId:"w-0badbad1",state:"idle",lastBeatAt:new Date(now()).toISOString()}));
 const h=nexusHealth({out,now});
 expect(h).toMatchObject({status:"degraded",reasons:["unreadable_worker_record"]});
 expect(h.workers.map(w=>w.workerId)).toEqual(["w-deadbeef"]); // the foreign record is not counted as a worker
 expect(()=>createWorkerHeartbeat({out,workerId:"../x"})).toThrow();
});
test("the worker loop writes a heartbeat at start, after each pass and when it stops, and a broken health directory never stops the work",async()=>{
 const out=mkd();submitFixture({out,fixture});const ctl=new AbortController();let passes=0;
 await runWorkerLoop({out,workerId:"w-11223344",runner:ok,intervalMs:10,signal:ctl.signal,sleep:async()=>{await sleep(5)},
  onPass:()=>{passes++;if(passes===1){const f=join(out,"health","w-11223344.json");expect(JSON.parse(readFileSync(f,"utf8")).totals.completed).toBe(1);rmSync(join(out,"health"),{recursive:true})}if(passes===3)ctl.abort()}});
 expect(passes).toBeGreaterThanOrEqual(3); // pass 2 and 3 ran with the health directory gone
 expect(jobStatus(out)[0]!.status).toBe("completed");
 const out2=mkd();submitFixture({out:out2,fixture});const c2=new AbortController();
 await runWorkerLoop({out:out2,workerId:"w-55667788",runner:ok,intervalMs:10,signal:c2.signal,sleep:async()=>{},onPass:()=>c2.abort()});
 const rec=JSON.parse(readFileSync(join(out2,"health","w-55667788.json"),"utf8"));
 expect(rec).toMatchObject({state:"stopped",passes:1,totals:{ran:1,completed:1}});
});

/* ---------- authenticated cancel ---------- */
const TA="token-researcher-a-0123456789",TB="token-researcher-b-0123456789";
const world=()=>{
 const sessions=new Map<string,VerifiedPrincipal>([[TA,{subjectId:"subject-a",organizationId:"org-1",sessionId:"sess-a",roles:["researcher"]}],[TB,{subjectId:"subject-b",organizationId:"org-2",sessionId:"sess-b",roles:["researcher"]}]]);
 const owners=new Map([["inv-a",{ownerSubjectId:"subject-a",organizationId:"org-1"}],["inv-a2",{ownerSubjectId:"subject-a",organizationId:"org-1"}],["inv-b",{ownerSubjectId:"subject-b",organizationId:"org-2"}]]);
 const standing=new Map([["subject-a|org-1",{roles:["researcher"]}],["subject-b|org-2",{roles:["researcher"]}]]);
 const store=createFileGrantStore(mkd(),{signingKey:"k".repeat(40)});
 const authority=createGatewayCallerAuthority({verifySession:async t=>sessions.get(t)??null,resolveInvestigation:async i=>owners.get(i)??null,resolveStanding:async(s,o)=>standing.get(`${s}|${o}`)??null,grants:store,ttlMs:60_000});
 return {sessions,authority,store};
};
const sub=async(w:ReturnType<typeof world>,out:string,inv="inv-a",token=TA)=>{const r=await submitAuthenticatedFixture({out,fixture,authority:w.authority,sessionToken:token,investigationId:inv});if(!r.ok)throw Error("x");return r.jobId};
test("authenticated cancel: the owner cancels a queued job; its grant is revoked first and a worker never runs it",async()=>{
 const w=world(),out=mkd();const id=await sub(w,out);
 expect(await cancelAuthenticatedJob({out,authority:w.authority,sessionToken:TA,jobId:id})).toEqual({ok:true,result:"cancelled"});
 const ref=JSON.parse(readFileSync(join(out,"queue",`${id}.grant.json`),"utf8"));
 expect((await w.store.get(ref.grantId))!.revoked).toMatchObject({reason:"user_cancelled"});
 expect(await w.authority.verifyJobGrant({grantId:ref.grantId,jobId:id})).toEqual({ok:false,code:"forbidden"});
 let ran=0;const r=await runWorkerOnce({out,authority:w.authority,runner:async()=>{ran++;return {auditHash:H}}});
 expect(ran).toBe(0);expect(r.ran).toEqual([]);expect(jobStatus(out)[0]!.status).toBe("cancelled");
 expect(await cancelAuthenticatedJob({out,authority:w.authority,sessionToken:TA,jobId:id})).toEqual({ok:true,result:"already_terminal"});
});
test("authenticated cancel refuses everyone else and changes nothing: other tenant, bad session, no grant, corrupt reference, a grant bound to another job",async()=>{
 const w=world(),out=mkd();const mine=await sub(w,out),other=await sub(w,out,"inv-a2");
 const status=()=>JSON.stringify(jobStatus(out).map(j=>[j.jobId,j.status]));const before=status();
 expect(await cancelAuthenticatedJob({out,authority:w.authority,sessionToken:TB,jobId:mine})).toEqual({ok:false,code:"forbidden"});
 expect(await cancelAuthenticatedJob({out,authority:w.authority,sessionToken:"short",jobId:mine})).toEqual({ok:false,code:"unauthenticated"});
 expect(await cancelAuthenticatedJob({out,authority:w.authority,sessionToken:TA,jobId:"fj-0000000000000000"})).toEqual({ok:false,code:"no_grant"});
 // An attacker who owns ANOTHER investigation and can edit the queue folder points the victim's job at the attacker's own grant,
 // then cancels with their own valid session. Only the signed job binding stops this: the session is genuine and owns that investigation.
 const attackerJob=await sub(w,out,"inv-b",TB);
 writeFileSync(join(out,"queue",`${mine}.grant.json`),readFileSync(join(out,"queue",`${attackerJob}.grant.json`),"utf8"));
 expect(await cancelAuthenticatedJob({out,authority:w.authority,sessionToken:TB,jobId:mine})).toEqual({ok:false,code:"forbidden"});
 expect(jobStatus(out).find(j=>j.jobId===mine)!.status).toBe("queued");
 writeFileSync(join(out,"queue",`${mine}.grant.json`),readFileSync(join(out,"queue",`${other}.grant.json`),"utf8"));
 expect(await cancelAuthenticatedJob({out,authority:w.authority,sessionToken:TB,jobId:mine})).toEqual({ok:false,code:"forbidden"});
 writeFileSync(join(out,"queue",`${mine}.grant.json`),"{broken");
 expect(await cancelAuthenticatedJob({out,authority:w.authority,sessionToken:TA,jobId:mine})).toEqual({ok:false,code:"grant_unreadable"});
 expect(status().includes("cancelled")).toBe(false);
 expect(await cancelAuthenticatedJob({out,authority:w.authority,sessionToken:TA,jobId:42 as never})).toEqual({ok:false,code:"invalid_request"});
});
test("grant helpers enforce the signed job binding directly: another job's grant can neither reveal an investigation nor be revoked",async()=>{
 const w=world(),out=mkd();const a=await sub(w,out),b=await sub(w,out,"inv-a2");
 const refA=JSON.parse(readFileSync(join(out,"queue",`${a}.grant.json`),"utf8"));
 expect(await w.authority.grantInvestigation({grantId:refA.grantId,jobId:b})).toEqual({ok:false,code:"forbidden"});
 expect(await w.authority.revokeJobGrant({grantId:refA.grantId,jobId:b,reason:"user_cancelled"})).toEqual({ok:false,code:"forbidden"});
 expect((await w.store.get(refA.grantId))!.revoked).toBeNull();
 expect(await w.authority.grantInvestigation({grantId:refA.grantId,jobId:a})).toEqual({ok:true,investigationId:"inv-a"});
 expect(await w.authority.grantInvestigation({grantId:"nope",jobId:a})).toEqual({ok:false,code:"invalid_request"});
 expect(await w.authority.revokeJobGrant({grantId:refA.grantId,jobId:a,reason:"user_cancelled"})).toEqual({ok:true});
});
test("authenticated cancel of a RUNNING job: its signal aborts, and its next authorisation is refused because the grant is gone",async()=>{
 const w=world(),out=mkd();const id=await sub(w,out);
 let refusedAfter=false,aborted=false;
 const run=runWorkerOnce({out,authority:w.authority,cancelPollMs:20,runner:async(_f,_d,ctx)=>{
  await ctx!.authoriseCall!({taskId:"t-1",role:"question_planner"}); // allowed while the grant stands
  for(let i=0;i<100;i++){await sleep(20);if(!(await w.authority.verifyJobGrant({grantId:ctx!.grant!.grantId,jobId:id})).ok){refusedAfter=true;break}}
  await expect(ctx!.authoriseCall!({taskId:"t-1",role:"question_planner"})).rejects.toThrow();
  throw Error("stopped");
 }});
 await sleep(80);
 expect(await cancelAuthenticatedJob({out,authority:w.authority,sessionToken:TA,jobId:id})).toEqual({ok:true,result:"cancel_requested"});
 await run;aborted=jobStatus(out)[0]!.status==="cancelled";
 expect(refusedAfter).toBe(true);expect(aborted).toBe(true);
});
test("operator cancel: works without a session, reports unknown ids, and the CLI exposes health and cancel with usable exit codes",()=>{
 const out=mkd();const s=submitFixture({out,fixture});
 expect(cancelJob({out,jobId:s.jobId})).toBe("cancelled");expect(cancelJob({out,jobId:"fx-0000000000000000"})).toBe("unknown");
 const run=(...a:string[])=>Bun.spawnSync(["bun","scripts/nexus-worker.ts",...a],{cwd:join(import.meta.dir,".."),stdout:"pipe",stderr:"pipe"});
 const empty=mkd();expect(run("health","--out",empty).exitCode).toBe(0);
 const q=mkd();submitFixture({out:q,fixture});
 const down=run("health","--out",q);expect(down.exitCode).toBe(2);expect(JSON.parse(down.stdout.toString()).reasons).toEqual(["no_live_worker"]);
 const id=submitFixture({out:q,fixture:{...fixture}}).jobId;
 const c=run("cancel","--job",id,"--out",q);expect(c.exitCode).toBe(0);expect(JSON.parse(c.stdout.toString()).result).toBe("cancelled");
 expect(run("cancel","--job","fx-0000000000000000","--out",q).exitCode).toBe(1);expect(run("cancel","--out",q).exitCode).toBe(2);
 expect(existsSync(join(q,"jobs"))).toBe(true);
});
