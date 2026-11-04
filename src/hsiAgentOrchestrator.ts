/** ARCH-009 Phase 2: deterministic, bounded, in-process orchestration.
 * No external tools, network calls, DB writes, LLM calls or scientific approvals.
 */
import {assertHsiToolPermission,validateHsiAgentManifest,validateHsiAgentRunEnvelope,type HsiAgentManifest,type HsiAgentRole,type HsiAgentRunEnvelope,type HsiToolId} from "./hsiAgentIntelligenceContracts";
export type HsiAgentTask={id:string;manifest:HsiAgentManifest;dependsOn:readonly string[]};
export type HsiAgentStepResult={status:"completed"|"blocked";outputRef:string|null;reason:string|null};
export type HsiAgentExecutor=(context:{investigationId:string;taskId:string;role:HsiAgentRole;assertTool:(tool:HsiToolId)=>void;signal:AbortSignal;dependencies:Readonly<Record<string,HsiAgentStepResult>>})=>Promise<HsiAgentStepResult>;
export type HsiOrchestrationResult={schemaVersion:"hsi-agent-orchestration-1";investigationId:string;status:"completed"|"blocked"|"failed"|"cancelled";runs:readonly HsiAgentRunEnvelope[];results:Readonly<Record<string,HsiAgentStepResult>>;limitations:readonly string[]};
const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;
export async function runHsiAgentOrchestration(input:{
 investigationId:string;tasks:readonly HsiAgentTask[];executors:Partial<Record<HsiAgentRole,HsiAgentExecutor>>;
 graphRelease:{id:string;version:string;manifestHash:string};
 dataClass:"public_biomedical"|"licensed_partner"|"synthetic_demo";
 now?:()=>string;signal?:AbortSignal;
}):Promise<HsiOrchestrationResult>{
 if(!ID.test(input.investigationId)||!input.tasks.length||input.tasks.length>24)throw Error("Invalid investigation or task count");
 if(new Set(input.tasks.map(t=>t.id)).size!==input.tasks.length||input.tasks.some(t=>!ID.test(t.id)))throw Error("Duplicate or invalid task identity");
 for(const task of input.tasks)validateHsiAgentManifest(task.manifest);
 const taskIds=new Set(input.tasks.map(t=>t.id));
 if(input.tasks.some(t=>new Set(t.dependsOn).size!==t.dependsOn.length||t.dependsOn.some(d=>!taskIds.has(d)||d===t.id)))throw Error("Invalid task dependencies");
 const order:HsiAgentTask[]=[];const visited=new Set<string>();const active=new Set<string>();
 function visit(t:HsiAgentTask):void{
  if(active.has(t.id))throw Error("Cyclic agent dependency");
  if(visited.has(t.id))return;
  active.add(t.id);
  for(const d of t.dependsOn)visit(input.tasks.find(x=>x.id===d)!);
  active.delete(t.id);visited.add(t.id);order.push(t);
 }
 for(const task of input.tasks)visit(task);
 const now=input.now??(()=>new Date().toISOString());
 const results:Record<string,HsiAgentStepResult>={};
 const runs:HsiAgentRunEnvelope[]=[];
 let status:HsiOrchestrationResult["status"]="completed";
 for(const task of order){
  if(input.signal?.aborted){status="cancelled";break}
  const startedAt=now();
  const blockedDependency=task.dependsOn.some(d=>results[d]?.status!=="completed");
  const executor=input.executors[task.manifest.role];
  const calls:{tool:HsiToolId;invocationId:string;status:"success"|"denied"|"failed"}[]=[];
  let result:HsiAgentStepResult;
  let runStatus:HsiAgentRunEnvelope["status"];
  if(blockedDependency){result={status:"blocked",outputRef:null,reason:"Dependency did not complete"};runStatus="blocked"}
  else if(!executor){result={status:"blocked",outputRef:null,reason:"No registered executor for role"};runStatus="blocked"}
  else{
   try{
    result=await Promise.race([
     executor({investigationId:input.investigationId,taskId:task.id,role:task.manifest.role,signal:controller.signal,dependencies:Object.fromEntries(task.dependsOn.map(d=>[d,results[d]!])),assertTool:(tool)=>{
      const invocationId=task.id+"-tool-"+(calls.length+1);
      if(calls.length>=task.manifest.maxToolCalls)throw Error("Agent tool budget exceeded");
      try{assertHsiToolPermission(task.manifest,tool,input.dataClass);calls.push({tool,invocationId,status:"success"})}
      catch(e){calls.push({tool,invocationId,status:"denied"});throw e}
     }}),
     new Promise<never>((_,reject)=>{timeout=setTimeout(()=>{controller.abort();reject(Error("Agent timeout"))},task.manifest.timeoutMs);timeout.unref?.();if(input.signal?.aborted){controller.abort();reject(Error("Cancelled"))}})
    ]);
    if(!result||!["completed","blocked"].includes(result.status)|| (result.status==="completed"&&!result.outputRef?.trim()))throw Error("Invalid executor result");
    runStatus=result.status;
   }catch{controller.abort();result={status:"blocked",outputRef:null,reason:"Executor failed, cancelled or tool permission denied"};runStatus="failed"}
   finally{if(timeout)clearTimeout(timeout);input.signal?.removeEventListener("abort",onAbort)}
  }
  results[task.id]=result;
  const run:HsiAgentRunEnvelope={schemaVersion:"hsi-agent-run-1",investigationId:input.investigationId,runId:input.investigationId+":"+task.id,manifest:task.manifest,graphRelease:input.graphRelease,dataClass:input.dataClass,status:runStatus,toolCalls:calls,startedAt,completedAt:now()};
  validateHsiAgentRunEnvelope(run);runs.push(run);
  if(runStatus==="failed")status="failed";else if(runStatus==="blocked"&&status==="completed")status="blocked";
  if(input.signal?.aborted){status="cancelled";break}
 }
 return {schemaVersion:"hsi-agent-orchestration-1",investigationId:input.investigationId,status,runs,results,limitations:["In-process deterministic orchestration only; no persisted trace or live agent execution guarantee","No scientific approval, graph publication or patient-level reasoning"]};
}
