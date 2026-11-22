import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createJobJournal} from "../src/nexusJobs";
import {drainJobs,dueJobs} from "../src/nexusWorker";

const dirs:string[]=[];const mkd=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-worker-"));dirs.push(d);return d};const mk=(now?:()=>number)=>createJobJournal(mkd(),{now});
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const H="b".repeat(64);const ok=async()=>({auditHash:H});

test("drains queued jobs once each and then has nothing due",async()=>{
 const j=mk();for(const id of ["job-a","job-b","job-c"])j.create(id);
 const seen:string[]=[];
 const r=await drainJobs(j,async id=>{seen.push(id);return {auditHash:H}});
 expect(seen.sort()).toEqual(["job-a","job-b","job-c"]);
 expect(r.ran.every(x=>x.outcome.status==="completed")).toBe(true);expect(r.stoppedBy).toBe("empty");
 expect(dueJobs(j)).toEqual([]);
 expect((await drainJobs(j,ok)).ran).toEqual([]);
});
test("concurrency is bounded and two drains over one journal never run a job twice",async()=>{
 const j=mk();for(let i=0;i<8;i++)j.create(`job-${i}`);
 let live=0,peak=0;const runs=new Map<string,number>();
 const work=async(id:string)=>{runs.set(id,(runs.get(id)??0)+1);live++;peak=Math.max(peak,live);await new Promise(r=>setTimeout(r,10));live--;return {auditHash:H}};
 await Promise.all([drainJobs(j,work,{concurrency:2}),drainJobs(j,work,{concurrency:2})]);
 expect([...runs.values()].every(n=>n===1)).toBe(true);expect(runs.size).toBe(8);expect(peak).toBeLessThanOrEqual(4);
});
test("failed jobs are not retried unless asked; a live lease is skipped, an expired one is taken over",async()=>{
 let t=1_000_000;const j=mk(()=>t);
 j.create("job-fail");j.create("job-crash");j.claim("job-crash",1);
 await drainJobs(j,async id=>{if(id==="job-fail")throw Error("WARDEN refused: model_budget");return {auditHash:H}},{now:()=>t,leaseMs:60_000});
 expect(j.state("job-fail")?.status).toBe("failed");expect(j.state("job-crash")?.status).toBe("running");
 expect(dueJobs(j,{now:()=>t,leaseMs:60_000})).toEqual([]);
 expect(dueJobs(j,{now:()=>t,leaseMs:60_000,retryFailed:true}).map(x=>x.jobId)).toEqual(["job-fail"]);
 t+=61_000;
 const r=await drainJobs(j,ok,{now:()=>t,leaseMs:60_000});
 expect(r.ran.map(x=>x.jobId)).toEqual(["job-crash"]);expect(j.state("job-crash")?.attempts).toBe(2);
});
test("the daily cap uses durable state, so a restarted worker cannot reset it",async()=>{
 const d=mkd();const j=createJobJournal(d);for(const id of ["job-1","job-2","job-3"])j.create(id);
 const first=await drainJobs(j,ok,{dailyCap:2});
 expect(first.ran).toHaveLength(2);expect(first.stoppedBy).toBe("daily_cap");expect(first.skipped).toBe(1);
 const restarted=await drainJobs(createJobJournal(d),ok,{dailyCap:2}); // a new process reads the same journal
 expect(restarted.ran).toEqual([]);expect(restarted.stoppedBy).toBe("daily_cap");
});
test("abort stops new starts, lets the running job finish, and maxJobs bounds a pass",async()=>{
 const j=mk();for(const id of ["job-x","job-y","job-z"])j.create(id);
 const ctl=new AbortController();
 const r=await drainJobs(j,async()=>{ctl.abort();return {auditHash:H}},{signal:ctl.signal});
 expect(r.ran).toHaveLength(1);expect(r.stoppedBy).toBe("aborted");expect(r.skipped).toBe(2);
 const m=await drainJobs(j,ok,{maxJobs:1});expect(m.ran).toHaveLength(1);expect(m.stoppedBy).toBe("max_jobs");
});
