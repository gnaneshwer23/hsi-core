import {test,expect} from "bun:test";
import {applyHsiCommittedArtifactReconciliation,inspectHsiInterruptedExecution} from "../src/hsiAgentRecoveryReconciliation";
import type {HsiCheckpointStore,HsiDurableCheckpoint} from "../src/hsiAgentDurableCheckpoint";
const checkpoint:HsiDurableCheckpoint={schemaVersion:"hsi-agent-checkpoint-1",investigationId:"inv-1",taskId:"planner",attempt:1,state:"running",version:1,inputHash:"a".repeat(64),outputRef:null,errorCode:null,startedAt:"2026-11-04T12:00:00Z",finishedAt:null};
const store:HsiCheckpointStore={read:async()=>checkpoint,compareAndSwap:async()=>false};
test("interrupted run with one matching artifact reconciles without executor replay",async()=>{
 const decision=await inspectHsiInterruptedExecution({store,investigationId:"inv-1",taskId:"planner",expectedInputHash:checkpoint.inputHash,artifacts:{findCurrent:async()=>[{artifactId:"a1",outputRef:"hsi-artifact:a1",attempt:1,checkpointVersion:1,inputHash:checkpoint.inputHash}]}});
 expect(decision.action).toBe("reconcile_committed_artifact");
});
test("missing or multiple artifacts require manual review",async()=>{
 for(const n of [0,2]){
  const artifacts=Array.from({length:n},(_,i)=>({artifactId:"a"+i,outputRef:"ref"+i,attempt:1,checkpointVersion:1,inputHash:checkpoint.inputHash}));
  const decision=await inspectHsiInterruptedExecution({store,investigationId:"inv-1",taskId:"planner",expectedInputHash:checkpoint.inputHash,artifacts:{findCurrent:async()=>artifacts}});
  expect(decision.action).toBe("manual_recovery_required");
 }
});
test("changed investigation fingerprint fails closed",async()=>{
 await expect(inspectHsiInterruptedExecution({store,investigationId:"inv-1",taskId:"planner",expectedInputHash:"b".repeat(64),artifacts:{findCurrent:async()=>[]}})).rejects.toThrow("fingerprint");
});
test("apply committed-artifact reconciliation completes without executor replay",async()=>{
 const rows=new Map<string,HsiDurableCheckpoint>();
 const key="inv-1:planner";
 rows.set(key,structuredClone(checkpoint));
 const casStore:HsiCheckpointStore={
  read:async(i,t)=>rows.get(i+":"+t)??null,
  compareAndSwap:async(expected,next)=>{
   if((rows.get(key)?.version??null)!==expected)return false;
   rows.set(key,structuredClone(next));
   return true;
  },
 };
 const decision=await inspectHsiInterruptedExecution({
  store:casStore,
  investigationId:"inv-1",
  taskId:"planner",
  expectedInputHash:checkpoint.inputHash,
  artifacts:{findCurrent:async()=>[{artifactId:"a1",outputRef:"hsi-artifact:a1",attempt:1,checkpointVersion:1,inputHash:checkpoint.inputHash}]},
 });
 if(decision.action!=="reconcile_committed_artifact")throw Error("expected reconcile");
 const completed=await applyHsiCommittedArtifactReconciliation({
  store:casStore,
  decision,
  finishedAt:"2026-11-04T12:01:00Z",
 });
 expect(completed.state).toBe("completed");
 expect(completed.outputRef).toBe("hsi-artifact:a1");
 expect(completed.version).toBe(2);
 expect((await casStore.read("inv-1","planner"))?.state).toBe("completed");
});
