/** ARCH-009 Phase 2: deterministic, bounded, in-process orchestration.
 * No external tools, network calls, DB writes, LLM calls or scientific approvals.
 */
import {assertHsiToolPermission,validateHsiAgentManifest,validateHsiAgentRunEnvelope,HSI_TOOL_IDS,type HsiAgentManifest,type HsiAgentRole,type HsiAgentRunEnvelope,type HsiToolId} from "./hsiAgentIntelligenceContracts";
import {createHsiOrchestrationDeadline} from "./hsiAgentOrchestrationBudget";
import {hashHsiCheckpointInput} from "./hsiAgentDurableCheckpoint";
import type {ToolGateway,ToolResult} from "./governedToolGateway";
import {
  classifyHsiOrchestrationCancel,
  type HsiOrchestrationCancelRecord,
} from "./hsiAgentOrchestrationCancel";
export type HsiAgentTask={id:string;manifest:HsiAgentManifest;dependsOn:readonly string[]};
export type HsiAgentStepResult={status:"completed"|"blocked";outputRef:string|null;reason:string|null};
export type HsiAgentExecutor=(context:{investigationId:string;taskId:string;role:HsiAgentRole;assertTool:(tool:HsiToolId)=>void;/** Calls an external tool through the governed gateway only. Always supplied by the orchestrator; it throws when no gateway was configured. Optional in the type so hand-built test contexts still compile. */callTool?:(tool:HsiToolId,input:unknown,provider?:string)=>Promise<ToolResult>;signal:AbortSignal;dependencies:Readonly<Record<string,HsiAgentStepResult>>})=>Promise<HsiAgentStepResult>;
export type HsiOrchestrationResult={
  schemaVersion:"hsi-agent-orchestration-1";
  investigationId:string;
  status:"completed"|"blocked"|"failed"|"cancelled";
  runs:readonly HsiAgentRunEnvelope[];
  results:Readonly<Record<string,HsiAgentStepResult>>;
  limitations:readonly string[];
  /** Structured stop taxonomy when cancelled or classified failure (U30). */
  termination:HsiOrchestrationCancelRecord|null;
  /** Present only when a gateway was configured. One entry per gateway call; full detail is in the gateway audit log. */
  gatewayCalls?:readonly HsiGatewayCallReceipt[];
};
export type HsiGatewayCallReceipt={taskId:string;tool:HsiToolId;invocationId:string;ok:boolean;code:string|null;replayed:boolean;auditSeq:number;responseHash:string|null};
const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;
export async function runHsiAgentOrchestration(input:{
 investigationId:string;tasks:readonly HsiAgentTask[];executors:Partial<Record<HsiAgentRole,HsiAgentExecutor>>;
 graphRelease:{id:string;version:string;manifestHash:string};
 dataClass:"public_biomedical"|"licensed_partner"|"synthetic_demo";
 now?:()=>string;signal?:AbortSignal;
 /** Optional governed tool gateway. Without it, `callTool` refuses. Executors never receive a raw fetch. */
 toolGateway?:ToolGateway;
 /** Required for a gateway in authenticated mode: yields the verified authorisation for one task (see `authoriseCallsFor`). The task's own manifest is not what the gateway trusts. */
 authoriseCall?:(task:{taskId:string;role:HsiAgentRole})=>Promise<unknown>;
 /** Optional wall-clock bound across all tasks (distinct from per-task timeoutMs). */
 maxOrchestrationMs?:number;
}):Promise<HsiOrchestrationResult>{
 // Executor code cannot widen permissions, alter dependencies or change release provenance through caller-owned objects.
 input={...input,tasks:structuredClone(input.tasks),graphRelease:structuredClone(input.graphRelease),executors:{...input.executors}};
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
 const gatewayCalls:HsiGatewayCallReceipt[]=[];
 const results:Record<string,HsiAgentStepResult>=Object.create(null);
 const runs:HsiAgentRunEnvelope[]=[];
 let status:HsiOrchestrationResult["status"]="completed";
 // Boxed so nested assignments remain visible to TypeScript control-flow analysis.
 const terminationBox:{current:HsiOrchestrationCancelRecord|null}={current:null};
 let lastAttemptedTaskId:string|null=null;
 let taskTimedOut=false;
 let policyDenied=false;
 const deadline=input.maxOrchestrationMs===undefined
  ? null
  : createHsiOrchestrationDeadline({maxOrchestrationMs:input.maxOrchestrationMs,parent:input.signal});
 const signal=deadline?.signal??input.signal;
 const markTermination=(taskId:string|null)=>{
  terminationBox.current=classifyHsiOrchestrationCancel({
   budgetExceeded:deadline?.budgetExceeded()??false,
   parentAborted:input.signal?.aborted===true,
   taskTimedOut,
   policyDenied,
   taskId,
  });
 };
 try{
 for(const task of order){
  if(signal?.aborted){status="cancelled";markTermination(lastAttemptedTaskId);break}
  lastAttemptedTaskId=task.id;
  const startedAt=now();
  const blockedDependency=task.dependsOn.some(d=>results[d]?.status!=="completed");
  const executor=input.executors[task.manifest.role];
  const calls:{tool:HsiToolId;invocationId:string;status:"authorized"|"denied"|"failed"}[]=[];
  let result:HsiAgentStepResult;
  let runStatus:HsiAgentRunEnvelope["status"];
  if(blockedDependency){result={status:"blocked",outputRef:null,reason:"Dependency did not complete"};runStatus="blocked"}
  else if(!executor){result={status:"blocked",outputRef:null,reason:"No registered executor for role"};runStatus="blocked"}
  else{
   const controller=new AbortController();
   let rejectCancellation:((reason:Error)=>void)|undefined;
   const onAbort=()=>{controller.abort();rejectCancellation?.(Error("Cancelled"))};
   let acceptingCalls=true,policyViolation=false;
   let timeout:ReturnType<typeof setTimeout>|undefined;
   try{
    result=await Promise.race([
     Promise.resolve().then(()=>{
      if(signal?.aborted)throw Error("Cancelled before dispatch");
      const ctxBase={investigationId:input.investigationId,taskId:task.id,role:task.manifest.role,signal:controller.signal,dependencies:structuredClone(Object.fromEntries(task.dependsOn.map(d=>[d,results[d]!]))),assertTool:(tool:HsiToolId)=>{
      if(!acceptingCalls||controller.signal.aborted)throw Error("Agent invocation already closed");
      const invocationId=task.id+"-tool-"+(calls.length+1);
      if(calls.length>=task.manifest.maxToolCalls||!HSI_TOOL_IDS.includes(tool)){policyViolation=true;policyDenied=true;controller.abort();rejectCancellation?.(Error("Agent policy denied"));throw Error("Agent tool budget exceeded or unknown tool")}
      try{assertHsiToolPermission(task.manifest,tool,input.dataClass);calls.push({tool,invocationId,status:"authorized"})}
      catch(e){policyViolation=true;policyDenied=true;controller.abort();rejectCancellation?.(Error("Agent policy denied"));calls.push({tool,invocationId,status:"denied"});throw e}
     }};
      const callTool=async(tool:HsiToolId,toolInput:unknown,provider?:string):Promise<ToolResult>=>{
       if(!input.toolGateway)throw Error("No governed tool gateway configured");
       ctxBase.assertTool(tool); // same permission, budget and denial semantics as before; a denial aborts the run
       // Content-derived id: the same logical call in a recovered attempt replays instead of repeating its side effect.
       const invocationId="h-"+hashHsiCheckpointInput({investigationId:input.investigationId,taskId:task.id,tool,provider:provider??null,input:toolInput}).slice(0,40);
       const authorisation=input.authoriseCall?await input.authoriseCall({taskId:task.id,role:task.manifest.role}):undefined;
       const r=await input.toolGateway.call({authorisation,manifest:task.manifest,investigationId:input.investigationId,taskId:task.id,invocationId,tool,provider,input:toolInput,signal:controller.signal});
       gatewayCalls.push({taskId:task.id,tool,invocationId,ok:r.ok,code:r.ok?null:r.code,replayed:r.ok?r.replayed:false,auditSeq:r.auditSeq,responseHash:r.ok?r.provenance.responseHash:null});
       return structuredClone(r);
      };
      return executor({...ctxBase,callTool});}),
     new Promise<never>((_,reject)=>{
      rejectCancellation=reject;
      signal?.addEventListener("abort",onAbort,{once:true});
      if(signal?.aborted)onAbort();
      timeout=setTimeout(()=>{taskTimedOut=true;controller.abort();reject(Error("Agent timeout"))},task.manifest.timeoutMs);timeout.unref?.();
     })
    ]);
    if(controller.signal.aborted||policyViolation)throw Error("Cancelled or policy violation");
    result=structuredClone(result);
    if(!result||!["completed","blocked"].includes(result.status)|| (result.status==="completed"&&!result.outputRef?.trim()))throw Error("Invalid executor result");
    runStatus=result.status;
   }catch{controller.abort();result={status:"blocked",outputRef:null,reason:"Executor failed, cancelled or tool permission denied"};runStatus=signal?.aborted?"cancelled":"failed"}
   finally{acceptingCalls=false;if(timeout)clearTimeout(timeout);signal?.removeEventListener("abort",onAbort)}
  }
  results[task.id]=result;
  const run:HsiAgentRunEnvelope={schemaVersion:"hsi-agent-run-1",investigationId:input.investigationId,runId:input.investigationId+":"+task.id,manifest:task.manifest,graphRelease:input.graphRelease,dataClass:input.dataClass,status:runStatus,toolCallEvidence:"authorization_checks_only",toolCalls:structuredClone(calls),startedAt,completedAt:now()};
  validateHsiAgentRunEnvelope(run);runs.push(run);
  if(runStatus==="failed"){
   status="failed";
   if(taskTimedOut||policyDenied)markTermination(task.id);
  }else if(runStatus==="blocked"&&status==="completed")status="blocked";
  if(signal?.aborted){status="cancelled";markTermination(task.id);break}
 }
 }finally{
  deadline?.dispose();
 }
 const limitations=[
  "In-process deterministic orchestration only; no persisted trace or live agent execution guarantee",
  "Tool receipts record authorization checks only, not external dispatch or completion",
  "Cancellation signals do not undo external side effects; hosts must provide cooperative tools and durable execution fences",
  "No scientific approval, graph publication or patient-level reasoning",
 ];
 if(deadline?.budgetExceeded()){
  limitations.push("Orchestration wall-clock budget exceeded; remaining tasks were not started or were cancelled cooperatively");
 }
 const stop=terminationBox.current;
 if(stop!==null){
  limitations.push(`Orchestration termination classified as ${stop.reason} (no scientific approval; side effects not undone)`);
 }
 if(input.toolGateway)limitations.push("Tool dispatch is recorded by the gateway audit log; run envelopes still record authorization checks only");
 return {schemaVersion:"hsi-agent-orchestration-1",investigationId:input.investigationId,status,runs,results,limitations,termination:stop,...(input.toolGateway?{gatewayCalls}:{})};
}
