/** ARCH-009 checkpointed executor wrapper.
 * The caller supplies a durable CAS store. Late executor output is fenced by
 * checkpoint version/state and cannot replace a completed or recovered attempt.
 * Timeout cancellation must be cooperative; this does not kill external processes.
 */
import {startHsiCheckpoint,finishHsiCheckpoint,type HsiCheckpointStore} from "./hsiAgentDurableCheckpoint";
import type {HsiAgentExecutor} from "./hsiAgentOrchestrator";
export function checkpointHsiExecutor(input:{
 store:HsiCheckpointStore;inputHash:string;executor:HsiAgentExecutor;now?:()=>string;
}):HsiAgentExecutor{
 const now=input.now??(()=>new Date().toISOString());
 return async context=>{
  const started=await startHsiCheckpoint({store:input.store,investigationId:context.investigationId,taskId:context.taskId,inputHash:input.inputHash,startedAt:now()});
  try{
   const result=await input.executor(context);
   if(!result||!["completed","blocked"].includes(result.status))throw Error("Invalid executor result");
   await finishHsiCheckpoint({store:input.store,checkpoint:started,state:result.status,outputRef:result.status==="completed"?result.outputRef:null,errorCode:result.status==="blocked"?"agent_blocked":null,finishedAt:now()});
   return result;
  }catch{
   try{await finishHsiCheckpoint({store:input.store,checkpoint:started,state:"failed",errorCode:"executor_failed",finishedAt:now()})}catch{/* preserve original failure; never overwrite a newer checkpoint */}
   throw Error("Checkpointed agent execution failed or lost its execution fence");
  }
 };
}
