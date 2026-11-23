import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,rmSync,existsSync,mkdirSync,utimesSync,readdirSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createFileCheckpointStore} from "../src/fileCheckpointStore";
import {startHsiCheckpoint,finishHsiCheckpoint,recoverHsiCheckpoint,hashHsiCheckpointInput} from "../src/hsiAgentDurableCheckpoint";

const dirs:string[]=[];const mk=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-ckpt-"));dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const H=hashHsiCheckpointInput({q:"x"});const T0="2026-11-22T10:00:00.000Z";

test("a checkpoint written by one store instance is read by a new one (restart survival)",async()=>{
 const d=mk();
 const a=createFileCheckpointStore(d);
 const c=await startHsiCheckpoint({store:a,investigationId:"inv-1",taskId:"plan",inputHash:H,startedAt:T0});
 const b=createFileCheckpointStore(d); // a restarted process
 expect(await b.read("inv-1","plan")).toEqual(c);
 const done=await finishHsiCheckpoint({store:b,checkpoint:c,state:"completed",outputRef:"out://1",finishedAt:T0});
 expect((await createFileCheckpointStore(d).read("inv-1","plan"))?.state).toBe("completed");
 expect(done.version).toBe(2);
});
test("compare-and-swap rejects a stale version and a second claim; a late writer cannot overwrite",async()=>{
 const s=createFileCheckpointStore(mk());
 const c=await startHsiCheckpoint({store:s,investigationId:"inv-2",taskId:"t1",inputHash:H,startedAt:T0});
 await expect(startHsiCheckpoint({store:s,investigationId:"inv-2",taskId:"t1",inputHash:H,startedAt:T0})).rejects.toThrow("explicit recovery");
 await finishHsiCheckpoint({store:s,checkpoint:c,state:"failed",errorCode:"executor_failed",finishedAt:T0});
 await expect(finishHsiCheckpoint({store:s,checkpoint:c,state:"completed",outputRef:"late",finishedAt:T0})).rejects.toThrow("conflict");
 expect((await s.read("inv-2","t1"))?.state).toBe("failed");
});
test("recovery after a failure opens attempt 2 durably and stops at three attempts",async()=>{
 const s=createFileCheckpointStore(mk());
 let c=await startHsiCheckpoint({store:s,investigationId:"inv-3",taskId:"t",inputHash:H,startedAt:T0});
 for(let i=1;i<3;i++){
  await finishHsiCheckpoint({store:s,checkpoint:c,state:"failed",errorCode:"x",finishedAt:T0});
  c=await recoverHsiCheckpoint({store:s,investigationId:"inv-3",taskId:"t",inputHash:H,approvedBy:"reviewer-1",recoveryReason:"retry",startedAt:T0});
  expect(c.attempt).toBe(i+1);
 }
 await finishHsiCheckpoint({store:s,checkpoint:c,state:"failed",errorCode:"x",finishedAt:T0});
 await expect(recoverHsiCheckpoint({store:s,investigationId:"inv-3",taskId:"t",inputHash:H,approvedBy:"reviewer-1",recoveryReason:"again",startedAt:T0})).rejects.toThrow("cannot be retried");
});
test("the store refuses to skip versions and rejects path-traversal ids",async()=>{
 const s=createFileCheckpointStore(mk());
 const c=await startHsiCheckpoint({store:s,investigationId:"inv-4",taskId:"t",inputHash:H,startedAt:T0});
 await expect(s.compareAndSwap(1,{...c,version:3,state:"failed",errorCode:"x",finishedAt:T0})).rejects.toThrow("advance by one");
 await expect(s.read("../etc","t")).rejects.toThrow("Invalid");
 await expect(s.read("inv-4","a/b")).rejects.toThrow("Invalid");
 await expect(s.read("inv..4","t")).rejects.toThrow("Invalid");
});
test("a lock left by a crashed process is reclaimed once stale; a live lock times out",async()=>{
 const d=mk();
 const s=createFileCheckpointStore(d,{lockTimeoutMs:60,staleLockMs:1_000});
 const c=await startHsiCheckpoint({store:s,investigationId:"inv-5",taskId:"t",inputHash:H,startedAt:T0});
 const lock=join(d,"inv-5","t.lock");mkdirSync(lock);
 await expect(s.compareAndSwap(1,{...c,version:2,state:"failed",errorCode:"x",finishedAt:T0})).rejects.toThrow("lock timeout");
 const old=new Date(Date.now()-5_000);utimesSync(lock,old,old);
 expect(await s.compareAndSwap(1,{...c,version:2,state:"failed",errorCode:"x",finishedAt:T0})).toBe(true);
 expect(existsSync(lock)).toBe(false);
 expect(readdirSync(join(d,"inv-5")).filter(f=>f.endsWith(".tmp"))).toEqual([]);
});
test("separate processes racing the same first claim: exactly one wins",async()=>{
 const d=mk();
 const script=`import {createFileCheckpointStore} from ${JSON.stringify(join(import.meta.dir,"../src/fileCheckpointStore"))};
  const s=createFileCheckpointStore(process.argv[2]!);
  const c={schemaVersion:"hsi-agent-checkpoint-1",investigationId:"inv-race",taskId:"t",attempt:1,state:"running",version:1,inputHash:${JSON.stringify(H)},outputRef:null,errorCode:null,startedAt:${JSON.stringify(T0)},finishedAt:null};
  console.log(String(await s.compareAndSwap(null,c as never)));`;
 const f=join(d,"race.ts");await Bun.write(f,script);
 const run=()=>Bun.spawn(["bun",f,d],{stdout:"pipe",stderr:"pipe"});
 const procs=Array.from({length:6},run);
 const outs=await Promise.all(procs.map(async p=>{const o=await new Response(p.stdout).text();await p.exited;return o.trim()}));
 expect(outs.filter(o=>o==="true")).toHaveLength(1);
 expect(outs.filter(o=>o==="false")).toHaveLength(5);
},30_000);
