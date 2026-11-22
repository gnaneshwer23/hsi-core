import {test,expect} from "bun:test";
import {checkpointHsiExecutor,continueHsiCheckpointedExecution} from "../src/hsiCheckpointedExecutor";
import {hashHsiCheckpointInput,recoverHsiCheckpoint,type HsiCheckpointStore,type HsiDurableCheckpoint} from "../src/hsiAgentDurableCheckpoint";
function memoryStore(){
 const rows=new Map<string,HsiDurableCheckpoint>();
 const store:HsiCheckpointStore={
  read:async(i,t)=>rows.get(i+":"+t)??null,
  compareAndSwap:async(expected,next)=>{
   const key=next.investigationId+":"+next.taskId;
   if((rows.get(key)?.version??null)!==expected)return false;
   rows.set(key,structuredClone(next));
   return true;
  },
 };
 return {rows,store};
}
test("checkpointed executor records completion and refuses replay",async()=>{
 const {store}=memoryStore();
 let calls=0;
 const executor=checkpointHsiExecutor({store,inputHash:hashHsiCheckpointInput({question:"SSc"}),now:()=>"2026-11-04T12:00:00Z",executor:async()=>{calls++;return {status:"completed",outputRef:"artifact-1",reason:null}}});
 const context={investigationId:"inv-1",taskId:"plan",role:"question_planner" as const,signal:new AbortController().signal,assertTool:()=>{},dependencies:{}};
 expect((await executor(context)).status).toBe("completed");
 await expect(executor(context)).rejects.toThrow("explicit recovery");
 expect(calls).toBe(1);expect((await store.read("inv-1","plan"))?.state).toBe("completed");
});
test("failed executor leaves a recoverable failed checkpoint, not a completed one",async()=>{
 const {store}=memoryStore();
 const executor=checkpointHsiExecutor({store,inputHash:hashHsiCheckpointInput({q:"SSc"}),executor:async()=>{throw Error("secret provider exception")}});
 await expect(executor({investigationId:"inv-2",taskId:"plan",role:"question_planner",signal:new AbortController().signal,assertTool:()=>{},dependencies:{}})).rejects.toThrow("Checkpointed agent execution failed");
 expect((await store.read("inv-2","plan"))?.state).toBe("failed");
});
test("continue resumes an explicitly recovered checkpoint without a fresh claim",async()=>{
 const {store}=memoryStore();
 const inputHash=hashHsiCheckpointInput({q:"resume"});
 const first=checkpointHsiExecutor({store,inputHash,now:()=>"2026-11-04T12:00:00Z",executor:async()=>{throw Error("boom")}});
 await expect(first({investigationId:"inv-3",taskId:"plan",role:"question_planner",signal:new AbortController().signal,assertTool:()=>{},dependencies:{}})).rejects.toThrow("Checkpointed agent execution failed");
 const recovered=await recoverHsiCheckpoint({
  store,
  investigationId:"inv-3",
  taskId:"plan",
  inputHash,
  approvedBy:"research_admin_fixture",
  recoveryReason:"Unit test resume after failed attempt",
  startedAt:"2026-11-04T12:05:00Z",
 });
 expect(recovered.state).toBe("running");
 expect(recovered.attempt).toBe(2);
 let calls=0;
 const resumed=continueHsiCheckpointedExecution({
  store,
  checkpoint:recovered,
  inputHash,
  now:()=>"2026-11-04T12:06:00Z",
  executor:async()=>{calls++;return {status:"completed",outputRef:"artifact-resume",reason:null}},
 });
 expect((await resumed({investigationId:"inv-3",taskId:"plan",role:"question_planner",signal:new AbortController().signal,assertTool:()=>{},dependencies:{}})).outputRef).toBe("artifact-resume");
 expect(calls).toBe(1);
 expect((await store.read("inv-3","plan"))?.state).toBe("completed");
 expect((await store.read("inv-3","plan"))?.attempt).toBe(2);
});
test("continue rejects a non-running checkpoint",()=>{
 expect(()=>continueHsiCheckpointedExecution({
  store:memoryStore().store,
  checkpoint:{schemaVersion:"hsi-agent-checkpoint-1",investigationId:"inv-4",taskId:"plan",attempt:1,state:"failed",version:2,inputHash:"a".repeat(64),outputRef:null,errorCode:"executor_failed",startedAt:"2026-11-04T12:00:00Z",finishedAt:"2026-11-04T12:00:01Z"},
  inputHash:"a".repeat(64),
  executor:async()=>({status:"completed",outputRef:"x",reason:null}),
 })).toThrow("running recovered checkpoint");
});
