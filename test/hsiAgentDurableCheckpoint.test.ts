import {test,expect} from "bun:test";
import {hashHsiCheckpointInput,startHsiCheckpoint,finishHsiCheckpoint,recoverHsiCheckpoint,type HsiCheckpointStore,type HsiDurableCheckpoint} from "../src/hsiAgentDurableCheckpoint";
function memoryStore():HsiCheckpointStore{
 const rows=new Map<string,HsiDurableCheckpoint>();
 return {read:async(i,t)=>rows.get(i+":"+t)??null,compareAndSwap:async(expected,next)=>{const key=next.investigationId+":"+next.taskId;const old=rows.get(key);if((old?.version??null)!==expected)return false;rows.set(key,structuredClone(next));return true}};
}
const base={investigationId:"inv-1",taskId:"planner",inputHash:hashHsiCheckpointInput({question:"SSc"}),startedAt:"2026-11-04T12:00:00Z"};
test("checkpoint completion is atomic and never replayed",async()=>{
 const store=memoryStore();const running=await startHsiCheckpoint({...base,store});
 const done=await finishHsiCheckpoint({store,checkpoint:running,state:"completed",outputRef:"artifact-1",finishedAt:"2026-11-04T12:00:01Z"});
 expect(done.state).toBe("completed");
 await expect(startHsiCheckpoint({...base,store})).rejects.toThrow("explicit recovery");
 await expect(recoverHsiCheckpoint({...base,store,approvedBy:"reviewer",recoveryReason:"retry"})).rejects.toThrow("cannot be retried");
});
test("failed checkpoint requires explicit recovery authorisation",async()=>{
 const store=memoryStore();const running=await startHsiCheckpoint({...base,store});
 await finishHsiCheckpoint({store,checkpoint:running,state:"failed",errorCode:"tool_timeout",finishedAt:"2026-11-04T12:00:01Z"});
 await expect(recoverHsiCheckpoint({...base,store,approvedBy:"",recoveryReason:"retry"})).rejects.toThrow("authorisation");
 const resumed=await recoverHsiCheckpoint({...base,store,approvedBy:"operator-1",recoveryReason:"verified transient failure"});
 expect(resumed.attempt).toBe(2);expect(resumed.state).toBe("running");
});
test("competing checkpoint claims are denied",async()=>{
 const store=memoryStore();await startHsiCheckpoint({...base,store});
 await expect(startHsiCheckpoint({...base,store})).rejects.toThrow("explicit recovery");
});
test("canonical checkpoint hash ignores JSON key ordering",()=>expect(hashHsiCheckpointInput({a:1,b:2})).toBe(hashHsiCheckpointInput({b:2,a:1})));
