import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,rmSync,readFileSync,existsSync,readdirSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {jobStatus,runWorkerLoop,runWorkerOnce,submitFixture} from "../src/nexusRunCommand";

const dirs:string[]=[];const mk=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-nxcmd-"));dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const fixture=JSON.parse(readFileSync(join(import.meta.dir,"../research/runner-fixtures/ssc-regression.v1.json"),"utf8"));
const H="c".repeat(64);

test("submit then work runs a recorded fixture durably, with its own audit store, and a second pass does nothing",async()=>{
 const out=mk();
 const s=submitFixture({out,fixture});expect(s.created).toBe(true);
 expect(submitFixture({out,fixture})).toEqual({jobId:s.jobId,created:false});
 const r=await runWorkerOnce({out});
 expect(r.ran).toHaveLength(1);expect(r.ran[0]!.outcome.status).toBe("completed");
 expect(existsSync(join(out,"audit",s.jobId))).toBe(true);
 expect(jobStatus(out)[0]).toMatchObject({jobId:s.jobId,status:"completed",attempts:1});
 expect((await runWorkerOnce({out})).ran).toEqual([]);
});
test("an invalid fixture is refused at submit and nothing is queued",()=>{
 const out=mk();
 expect(()=>submitFixture({out,fixture:{schemaVersion:"x"}})).toThrow();
 expect(jobStatus(out)).toEqual([]);
});
test("a failing run is recorded as failed, not retried by default, and retried only on request",async()=>{
 const out=mk();submitFixture({out,fixture});let calls=0;
 const runner=async()=>{calls++;if(calls===1)throw Error("boom with private detail");return {auditHash:H}};
 expect((await runWorkerOnce({out,runner})).ran[0]!.outcome.status).toBe("failed");
 expect((await runWorkerOnce({out,runner})).ran).toEqual([]);expect(calls).toBe(1);
 expect((await runWorkerOnce({out,runner,retryFailed:true})).ran[0]!.outcome.status).toBe("completed");
 expect(readFileSync(join(out,"jobs","jobs.jsonl"),"utf8")).not.toContain("private detail");
});
test("each job gets its own audit directory, so concurrent jobs cannot fork one chain",async()=>{
 const out=mk();const second={...fixture,id:fixture.id+"-b",question:fixture.question+" (variant)"};
 submitFixture({out,fixture});submitFixture({out,fixture:second});
 const seen:string[]=[];
 await runWorkerOnce({out,concurrency:2,runner:async(_f,dir)=>{seen.push(dir);return {auditHash:H}}});
 expect(new Set(seen).size).toBe(2);
});
test("the loop runs repeated passes and stops when aborted",async()=>{
 const out=mk();submitFixture({out,fixture});const ctl=new AbortController();let passes=0;
 await runWorkerLoop({out,runner:async()=>({auditHash:H}),intervalMs:1,signal:ctl.signal,sleep:async()=>{},onPass:()=>{if(++passes===3)ctl.abort()}});
 expect(passes).toBe(3);expect(jobStatus(out)[0]!.status).toBe("completed");
});
test("the script submits, works and reports status; live mode and unknown options are refused",async()=>{
 const out=mk();const run=async(...a:string[])=>{const p=Bun.spawn(["bun","scripts/nexus-worker.ts",...a],{cwd:join(import.meta.dir,".."),stdout:"pipe",stderr:"pipe"});const [so,se]=await Promise.all([new Response(p.stdout).text(),new Response(p.stderr).text()]);return {code:await p.exited,so,se}};
 const sub=await run("submit","--fixture","ssc-regression","--out",out);expect(sub.code).toBe(0);
 const work=await run("work","--out",out);expect(work.code).toBe(0);expect(JSON.parse(work.so).ran[0].outcome.status).toBe("completed");
 expect(JSON.parse(work.so).notice).toContain("FIXTURE RUN");
 expect(JSON.parse((await run("status","--out",out)).so).jobs[0].status).toBe("completed");
 const live=await run("work","--live","--out",out);expect(live.code).toBe(2);expect(live.se).toContain("Live mode is not available");
 expect((await run("work","--bogus")).code).toBe(2);
 expect((await run("submit","--fixture","does-not-exist","--out",out)).code).toBe(2);
 expect(readdirSync(out).sort()).toEqual(["audit","jobs","queue"]);
},60_000);
