import type {FetchLike} from "../fetchLike";
/** Trusted service composition. No environment activation, invitation issuance or production routes by default. */
import {randomUUID} from "node:crypto";
import type {PilotOperationsStore,OpsActor,OpsPlan,OpsReceipt,OpsStep} from "./pilotOperationsStore";
import type {SharedResearchAdmission,ResearchRouteGroup} from "../server/researchRequestControls";
const exact=(v:unknown,keys:string[])=>{if(!v||typeof v!=="object"||Array.isArray(v)||Object.keys(v).sort().join()!==keys.sort().join())throw Error("Unexpected job request fields")};
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{"Cache-Control":"no-store"}});
async function boundedJson(request:Request,max:number){
 if(Number(request.headers.get("content-length")??0)>max)throw Error("Request overflow");const reader=request.body?.getReader();if(!reader)throw Error("JSON body required");let timer:ReturnType<typeof setTimeout>|undefined;
 const read=async()=>{const parts:Uint8Array[]=[];let bytes=0;for(;;){const {value,done}=await reader.read();if(done)break;bytes+=value.length;if(bytes>max){void reader.cancel();throw Error("Request overflow")}parts.push(value)}return JSON.parse(new TextDecoder().decode(Buffer.concat(parts)))};
 try{return await Promise.race([read(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{void reader.cancel();reject(Error("Body deadline"))},1000)})])}finally{if(timer)clearTimeout(timer);reader.releaseLock()}
}
export function createPilotJobApi(deps:{enabled?:boolean;publicOrigin:string;store:PilotOperationsStore;
 /** Resolve principal, organization membership and active invitation from trusted session storage. Never body/headers claiming identity. */
 authenticate:(request:Request)=>Promise<OpsActor|null>;
 loadPlan:(actor:Readonly<OpsActor>,investigationId:string,planRef:string)=>Promise<OpsPlan>;
 authorizeEnqueue:(actor:Readonly<OpsActor>,plan:Readonly<OpsPlan>)=>Promise<boolean>;
}){
 const {store,authenticate,loadPlan,authorizeEnqueue}=deps,enabled=deps.enabled===true,publicOrigin=new URL(deps.publicOrigin);
 if(publicOrigin.protocol!=="https:"||publicOrigin.username||publicOrigin.password||publicOrigin.pathname!=="/"||publicOrigin.search||publicOrigin.hash)throw Error("Pinned HTTPS pilot origin required");
 return async(request:Request):Promise<Response|null>=>{
  const url=new URL(request.url),match=url.pathname.match(/^\/api\/research\/jobs(?:\/(job-[a-f0-9-]{36}))?$/);if(!match)return null;
  if(!enabled)return json({code:"PILOT_JOBS_DISABLED"},503);
  if(url.origin!==publicOrigin.origin||request.method==="POST"&&(request.headers.get("origin")!==publicOrigin.origin||request.headers.get("sec-fetch-site")==="cross-site"))return json({code:"TRUSTED_SAME_ORIGIN_REQUIRED"},403);
  if(request.method!=="GET"&&request.method!=="POST"||request.method==="POST"&&match[1]||request.method==="GET"&&!match[1])return json({code:"METHOD_NOT_ALLOWED"},405);
  try{if(url.search)throw Error();const actor=await authenticate(request);if(!actor)return json({code:"AUTHENTICATED_INVITATION_REQUIRED"},401);
   if(request.method==="GET"){const job=store.get(actor,match[1]!);return json({id:job.id,investigationId:job.plan.investigationId,state:job.state,reservedTokens:job.reservedTokens,reservedCostMicros:job.reservedCostMicros,createdAt:job.createdAt,updatedAt:job.updatedAt,humanReviewRequired:job.state!=="completed",graphPromotionApproved:false})}
   if(request.headers.get("content-type")?.split(";")[0]!=="application/json"||Number(request.headers.get("content-length")??0)>2048)return json({code:"BOUNDED_JSON_REQUIRED"},400);
   const body=await boundedJson(request,2048);exact(body,["investigationId","planRef","idempotencyKey"]);
   if(![body.investigationId,body.planRef,body.idempotencyKey].every(s=>typeof s==="string"&&/^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,255}$/.test(s)))throw Error();
   const plan=structuredClone(await loadPlan(structuredClone(actor),body.investigationId,body.planRef));
   if(plan.investigationId!==body.investigationId||plan.planRef!==body.planRef||await authorizeEnqueue(structuredClone(actor),structuredClone(plan))!==true)return json({code:"SIGNED_RELEASE_OR_SCOPE_REQUIRED"},403);
   const {job,created}=store.enqueue(actor,body.idempotencyKey,plan);
   return json({id:job.id,state:job.state,created,execution:"resumable_worker_only",scientificApproval:false,graphPromotionApproved:false},202);
  }catch{return json({code:"JOB_UNAVAILABLE_OR_DENIED"},403)}
 };
}
/** Shared route admission over ONE coordinator backend; close/error/timeout propagates to existing fail-closed HTTP controls. */
export function coordinatorSharedAdmission(store:Pick<PilotOperationsStore,"admitRoute">):SharedResearchAdmission{return async(group,signal)=>{if(signal.aborted)throw Error("Admission cancelled");const decision=store.admitRoute(group);if(signal.aborted)throw Error("Admission cancelled");return decision}}
/** Private service-to-service adapter. Authentication must be independently verified; no user quota identity is accepted here. */
export function createSharedAdmissionHandler(store:Pick<PilotOperationsStore,"admitRoute">,authenticateService:(r:Request)=>Promise<boolean>){return async(request:Request)=>{
 if(new URL(request.url).pathname!=="/internal/admission"||request.method!=="POST")return json({code:"NOT_FOUND"},404);
 try{if(await authenticateService(request)!==true)return json({code:"SERVICE_AUTH_REQUIRED"},401);const value=await boundedJson(request,128);exact(value,["group"]);if(!["health","auth","diagnostics","research_read","research_write","other"].includes(value.group))throw Error();return json(store.admitRoute(value.group))}catch{return json({code:"SHARED_ADMISSION_UNAVAILABLE"},503)}
}}
export function createSharedAdmissionClient(config:{endpoint:string;serviceCredential:()=>string;transport?:FetchLike}):SharedResearchAdmission{
 const url=new URL(config.endpoint);if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash||url.pathname!=="/internal/admission")throw Error("Pinned HTTPS coordinator endpoint required");
 const endpoint=url.href,transport=config.transport??fetch,credential=config.serviceCredential;
 return async(group:ResearchRouteGroup,signal)=>{const key=credential();if(!key||/[\r\n]/.test(key))throw Error("Service credential unavailable");const response=await transport(endpoint,{method:"POST",redirect:"error",signal,headers:{authorization:"Bearer "+key,"content-type":"application/json"},body:JSON.stringify({group})});if(!response.ok||Number(response.headers.get("content-length")??0)>512)throw Error("Shared admission unavailable");const reader=response.body?.getReader();if(!reader)throw Error("Shared response unavailable");let text="",bytes=0;try{for(;;){const r=await reader.read();if(r.done)break;bytes+=r.value.length;if(bytes>512){await reader.cancel();throw Error("Shared response overflow")}text+=new TextDecoder().decode(r.value)}}finally{reader.releaseLock()}const value=JSON.parse(text);exact(value,["allowed","retryAfterSeconds"]);if(typeof value.allowed!=="boolean"||!Number.isSafeInteger(value.retryAfterSeconds)||value.retryAfterSeconds<0||value.retryAfterSeconds>86400)throw Error("Invalid shared admission response");return value};
}
export function createPilotWorker(deps:{enabled?:boolean;store:PilotOperationsStore;workerRef?:string;leaseMs?:number;stepTimeoutMs?:number;
 authorizeStep:(context:Readonly<{actor:OpsActor;plan:OpsPlan;step:OpsStep;operationId:string}>)=>Promise<boolean>;
 execute:(task:Readonly<{jobId:string;investigationId:string;artifactSha:string;configurationHash:string;step:OpsStep;operationId:string;attempt:number}>,signal:AbortSignal)=>Promise<OpsReceipt>;
 /** Verifies actual external completion/usage, clearance, model and operation bindings, including documented zero-charge safe retry. */
 verifyReceipt:(receipt:Readonly<OpsReceipt>,binding:Readonly<{jobId:string;step:OpsStep;operationId:string}>)=>Promise<boolean>;
}){
 const {store,authorizeStep,execute,verifyReceipt}=deps,enabled=deps.enabled===true,workerRef=deps.workerRef??"worker-"+randomUUID(),leaseMs=deps.leaseMs??60000,timeoutMs=deps.stepTimeoutMs??30000;
 if(!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>=leaseMs||leaseMs>300000)throw Error("Step deadline must be shorter than lease");
 return {async tick(signal?:AbortSignal){
  if(!enabled)throw Error("Pilot worker disabled");if(signal?.aborted)throw Error("Worker cancelled");const lease=store.claim(workerRef,leaseMs);if(!lease)return {status:"idle"};
  // Reservation/start is durable BEFORE any callback. Unknown starts are never automatically replayed.
  const action=store.begin(lease);if(!action)return {status:"checkpointed"};
  const {step,position,operationId,attempt}=action,controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener("abort",abort,{once:true});let timer:ReturnType<typeof setTimeout>|undefined;
  const started=performance.now(),killPoll=setInterval(()=>{try{const switches=store.switches();if(!switches.jobsEnabled||step.kind==="model"&&!switches.providersEnabled)controller.abort()}catch{controller.abort()}},100);
  let dispatched=false,authorizationUnavailable=false;
  const operation=async()=>{
   let authorized:boolean;try{authorized=await authorizeStep({actor:{userRef:lease.job.userRef,organizationRef:lease.job.organizationRef},plan:structuredClone(lease.job.plan),step:structuredClone(step),operationId});}catch{authorizationUnavailable=true;throw Error("Step authorization unavailable")}
   if(authorized!==true||controller.signal.aborted||!store.switches().jobsEnabled||step.kind==="model"&&!store.switches().providersEnabled)throw Error("Execution not authorized");
   dispatched=true;const receipt=structuredClone(await execute({jobId:lease.job.id,investigationId:lease.job.plan.investigationId,artifactSha:lease.job.plan.artifactSha,configurationHash:lease.job.plan.configurationHash,step:structuredClone(step),operationId,attempt},controller.signal));
   if(controller.signal.aborted||await verifyReceipt(structuredClone(receipt),{jobId:lease.job.id,step:structuredClone(step),operationId})!==true)throw Error("Execution receipt unverified");return receipt;
  };
  try{const receipt=await Promise.race([operation(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error("Worker deadline"))},timeoutMs);controller.signal.addEventListener("abort",()=>reject(Error("Worker cancelled")),{once:true})})]);
   return {status:store.settle(lease,position,receipt)};
  }catch{
   // No provider error text, response, question, credentials or payload enters operational storage.
   if(!dispatched&&authorizationUnavailable&&!controller.signal.aborted){const safe:OpsReceipt={receiptRef:"authorization-unavailable-"+operationId,operationId,outcome:"retry_safe",outputRef:null,outputHash:null,inputTokens:0,outputTokens:0,costMicros:0,latencyMs:Math.max(0,Math.round(performance.now()-started)),decisionRef:null,errorCode:"clearance_failed",retryDelayMs:1000};try{return {status:store.settle(lease,position,safe)}}catch{/* Persisted start remains fenced if storage/lease is unavailable. */}}
   const unknown:OpsReceipt={receiptRef:"unknown-"+operationId,operationId,outcome:dispatched?"unknown":"failed",outputRef:null,outputHash:null,inputTokens:dispatched?null:0,outputTokens:dispatched?null:0,costMicros:dispatched?null:0,latencyMs:Math.max(0,Math.round(performance.now()-started)),decisionRef:null,errorCode:dispatched?"execution_unknown":"authorization_denied",retryDelayMs:0};
   try{store.settle(lease,position,unknown)}catch{/* Lease loss leaves a durable started record for recovery. */}
   return {status:dispatched?"blocked_completion_unknown":"dead_letter_authorization_denied",automaticRetryPermitted:false};
  }finally{clearInterval(killPoll);if(timer)clearTimeout(timer);signal?.removeEventListener("abort",abort);controller.abort()}
 }};
}
export async function recordVerifiedPilotReview(store:PilotOperationsStore,input:{actor:OpsActor;jobId:string;artifactHash:string;decisionId:string;receiptRef:string},verify:(binding:Readonly<typeof input>)=>Promise<boolean>){const captured=structuredClone(input);if(await verify(structuredClone(captured))!==true)throw Error("Independent scoped non-self review required");store.recordDecision(captured.actor,captured.jobId,captured.artifactHash,captured.decisionId,captured.receiptRef)}
export async function reconcileVerifiedPilotCompletion(store:PilotOperationsStore,input:{jobId:string;position:number;receipt:OpsReceipt;authorityReceipt:string},verify:(binding:Readonly<typeof input>)=>Promise<boolean>){const captured=structuredClone(input);if(await verify(structuredClone(captured))!==true)throw Error("Independent provider reconciliation required");store.reconcile(captured.jobId,captured.position,captured.receipt,captured.authorityReceipt)}

/** Use only on the persistent coordinator/server; HTTP telemetry loss cannot rewrite a committed scientific decision. */
export function durableResearchHttpEmitter(store:Pick<PilotOperationsStore,"recordHttp">){return (event:import("../server/researchRequestControls").ResearchOperationalEvent)=>store.recordHttp(event)}

/** Run under a long-lived process supervisor on the durable coordinator, never in a request handler. */
export async function runPilotWorkerLoop(worker:ReturnType<typeof createPilotWorker>,signal:AbortSignal,idleMs=250){
 if(!Number.isSafeInteger(idleMs)||idleMs<100||idleMs>1000)throw Error("Bounded worker idle interval required");
 while(!signal.aborted){const result=await worker.tick(signal);if(signal.aborted)break;if(result.status==="idle"||result.status==="blocked_completion_unknown"||result.status==="dead_letter_authorization_denied")await new Promise<void>(resolve=>{let timer:ReturnType<typeof setTimeout>;const abort=()=>{clearTimeout(timer);signal.removeEventListener("abort",abort);resolve()};timer=setTimeout(abort,idleMs);signal.addEventListener("abort",abort,{once:true});if(signal.aborted)abort()})}
}

/** Must reconcile external provider/decision journals and accepted recovery point before clearing a restored snapshot. */
export async function completeVerifiedPilotRestore(store:PilotOperationsStore,authorityReceipt:string,verify:(receipt:string)=>Promise<boolean>){if(await verify(authorityReceipt)!==true)throw Error("Independent restore reconciliation required");store.completeRecovery(authorityReceipt)}
