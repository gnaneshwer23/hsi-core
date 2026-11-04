import {test,expect} from "bun:test";
import {checkpointHsiExecutor} from "../src/hsiCheckpointedExecutor";
import {hashHsiCheckpointInput,type HsiCheckpointStore,type HsiDurableCheckpoint} from "../src/hsiAgentDurableCheckpoint";
test("checkpointed executor records completion and refuses replay",async()=>{
 const rows=new Map<string,HsiDurableCheckpoint>();
 const store:HsiCheckpointStore={read:async(i,t)=>rows.get(i+":"+t)??null,compareAndSwap:async(expected,next)=>{const key=next.investigationId+":"+next.taskId;if((rows.get(key)?.version??null)!==expected)return false;rows.set(key,structuredClone(next));return true}};
 let calls=0;
 const executor=checkpointHsiExecutor({store,inputHash:hashHsiCheckpointInput({question:"SSc"}),now:()=>"2026-11-04T12:00:00Z",executor:async()=>{calls++;return {status:"completed",outputRef:"artifact-1",reason:null}}});
 const context={investigationId:"inv-1",taskId:"plan",role:"question_planner" as const,signal:new AbortController().signal,assertTool:()=>{},dependencies:{}};
 expect((await executor(context)).status).toBe("completed");
 await expect(executor(context)).rejects.toThrow("explicit recovery");
 expect(calls).toBe(1);expect((await store.read("inv-1","plan"))?.state).toBe("completed");
});
test("failed executor leaves a recoverable failed checkpoint, not a completed one",async()=>{
 const rows=new Map<string,HsiDurableCheckpoint>();
 const store:HsiCheckpointStore={read:async(i,t)=>rows.get(i+":"+t)??null,compareAndSwap:async(expected,next)=>{const key=next.investigationId+":"+next.taskId;if((rows.get(key)?.version??null)!==expected)return false;rows.set(key,structuredClone(next));return true}};
 const executor=checkpointHsiExecutor({store,inputHash:hashHsiCheckpointInput({q:"SSc"}),executor:async()=>{throw Error("secret provider exception")}});
 await expect(executor({investigationId:"inv-2",taskId:"plan",role:"question_planner",signal:new AbortController().signal,assertTool:()=>{},dependencies:{}})).rejects.toThrow("Checkpointed agent execution failed");
 expect((await store.read("inv-2","plan"))?.state).toBe("failed");
});
