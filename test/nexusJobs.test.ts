import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,rmSync,readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createJobJournal,runDurable} from "../src/nexusJobs";

const dirs:string[]=[];const mk=(now?:()=>number)=>{const d=mkdtempSync(join(tmpdir(),"hsi-jobs-"));dirs.push(d);return {d,j:createJobJournal(d,{now})}};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const H="a".repeat(64);

test("a job runs once; a completed job is never re-run",async()=>{
 const {j}=mk();let runs=0;const work=async()=>{runs++;return {auditHash:H}};
 expect((await runDurable(j,"job-one",work)).status).toBe("completed");
 expect(await runDurable(j,"job-one",work)).toEqual({status:"already_completed",auditHash:H});expect(runs).toBe(1);
});
test("two workers racing the same job: exactly one runs",async()=>{
 const {j}=mk();let runs=0;const work=async()=>{runs++;await new Promise(r=>setTimeout(r,20));return {auditHash:H}};
 const [a,b]=await Promise.all([runDurable(j,"job-race",work),runDurable(j,"job-race",work)]);
 expect([a.status,b.status].sort()).toEqual(["completed","held_by_other"]);expect(runs).toBe(1);
});
test("a crashed attempt is held while its lease is live, then taken over as attempt 2",async()=>{
 let t=1_000_000;const {j}=mk(()=>t);
 j.create("job-crash");expect(j.claim("job-crash",1)).toBe(1); // worker died after starting
 expect((await runDurable(j,"job-crash",async()=>({auditHash:H}),{now:()=>t,leaseMs:60_000})).status).toBe("held_by_other");
 t+=61_000;const r=await runDurable(j,"job-crash",async()=>({auditHash:H}),{now:()=>t,leaseMs:60_000});
 expect(r).toEqual({status:"completed",attempt:2,auditHash:H,resumed:true});
});
test("failures record a code only, and attempts are bounded",async()=>{
 const {d,j}=mk();
 const boom=async()=>{throw new Error("WARDEN refused: model_budget; secret passage text")};
 expect(await runDurable(j,"job-fail",boom,{maxAttempts:2})).toEqual({status:"failed",attempt:1,errorCode:"model_budget"});
 expect((await runDurable(j,"job-fail",boom,{maxAttempts:2})).status).toBe("failed");
 expect(await runDurable(j,"job-fail",boom,{maxAttempts:2})).toEqual({status:"attempts_exhausted"});
 expect(readFileSync(join(d,"jobs.jsonl"),"utf8")).not.toContain("secret passage");
});
test("invalid ids and hashes are rejected; runsToday counts started attempts",async()=>{
 const {j}=mk();expect(()=>j.create("../x")).toThrow();
 await runDurable(j,"job-count",async()=>({auditHash:H}));expect(j.runsToday()).toBe(1);
 j.create("job-bad");const a=j.claim("job-bad",1)!;expect(()=>j.complete("job-bad",a,"nothex")).toThrow();
});
