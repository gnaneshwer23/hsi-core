/** ARCH-009 checkpointed executor wrapper.
 * The caller supplies a durable CAS store. Late executor output is fenced by
 * checkpoint version/state and cannot replace a completed or recovered attempt.
 * Timeout cancellation must be cooperative; this does not kill external processes.
 *
 * `continueHsiCheckpointedExecution` resumes an already-RUNNING fence (after
 * `recoverHsiCheckpoint`). It never claims a fresh checkpoint and never auto-replays
 * an interrupted RUNNING attempt without operator recovery.
 */
import {startHsiCheckpoint,finishHsiCheckpoint,validateHsiCheckpoint,type HsiCheckpointStore,type HsiDurableCheckpoint} from "./hsiAgentDurableCheckpoint";
import type {HsiAgentExecutor} from "./hsiAgentOrchestrator";
export function checkpointHsiExecutor(input:{
 store:HsiCheckpointStore;inputHash:string;executor:HsiAgentExecutor;now?:()=>string;
}):HsiAgentExecutor{
 const now=input.now??(()=>new Date().toISOString());
 return async context=>{
  const started=await startHsiCheckpoint({store:input.store,investigationId:context.investigationId,taskId:context.taskId,inputHash:input.inputHash,startedAt:now()});
  try{
   if(context.signal.aborted)throw Error("Execution cancelled before dispatch");
   const result=await input.executor(context);
   if(context.signal.aborted)throw Error("Execution cancelled before checkpoint commit");
   if(!result||!["completed","blocked"].includes(result.status))throw Error("Invalid executor result");
   await finishHsiCheckpoint({store:input.store,checkpoint:started,state:result.status,outputRef:result.status==="completed"?result.outputRef:null,errorCode:result.status==="blocked"?"agent_blocked":null,finishedAt:now()});
   return result;
  }catch{
   try{await finishHsiCheckpoint({store:input.store,checkpoint:started,state:"failed",errorCode:"executor_failed",finishedAt:now()})}catch{/* preserve original failure; never overwrite a newer checkpoint */}
   throw Error("Checkpointed agent execution failed or lost its execution fence");
  }
 };
}
/** Continue a RUNNING checkpoint that was opened by explicit human recovery.
 * Rejects completed/blocked/failed/cancelled fences and input-hash mismatches.
 */
export function continueHsiCheckpointedExecution(input:{
 store:HsiCheckpointStore;
 checkpoint:HsiDurableCheckpoint;
 inputHash:string;
 executor:HsiAgentExecutor;
 now?:()=>string;
}):HsiAgentExecutor{
 const now=input.now??(()=>new Date().toISOString());
 validateHsiCheckpoint(input.checkpoint);
 if(input.checkpoint.state!=="running")throw Error("Continue requires a running recovered checkpoint");
 if(input.checkpoint.inputHash!==input.inputHash)throw Error("Checkpoint input mismatch");
 return async context=>{
  if(context.investigationId!==input.checkpoint.investigationId||context.taskId!==input.checkpoint.taskId){
   throw Error("Continue checkpoint identity mismatch");
  }
  const current=await input.store.read(context.investigationId,context.taskId);
  if(!current)throw Error("Recovered checkpoint missing from store");
  validateHsiCheckpoint(current);
  if(current.version!==input.checkpoint.version||current.attempt!==input.checkpoint.attempt||current.state!=="running"||current.inputHash!==input.inputHash){
   throw Error("Recovered checkpoint fence changed; do not continue");
  }
  try{
   if(context.signal.aborted)throw Error("Execution cancelled before dispatch");
   const result=await input.executor(context);
   if(context.signal.aborted)throw Error("Execution cancelled before checkpoint commit");
   if(!result||!["completed","blocked"].includes(result.status))throw Error("Invalid executor result");
   await finishHsiCheckpoint({store:input.store,checkpoint:current,state:result.status,outputRef:result.status==="completed"?result.outputRef:null,errorCode:result.status==="blocked"?"agent_blocked":null,finishedAt:now()});
   return result;
  }catch{
   try{await finishHsiCheckpoint({store:input.store,checkpoint:current,state:"failed",errorCode:"executor_failed",finishedAt:now()})}catch{/* preserve fence */}
   throw Error("Checkpointed agent execution failed or lost its execution fence");
  }
 };
}
