/** Opt-in isolated-staging provider smoke service. No HTTP route, credentials or approval defaults. */
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {createHash,randomUUID} from "node:crypto";
import {createProviderRunner,validateProviderConfig,type ProviderConfig,type ProviderPayload,type ProviderTransport} from "./providerReliability";
import {createPinnedProviderTransport,type ProviderWireEncoder} from "./pinnedProviderTransport";
import type {ClearanceBinding} from "./sourceClearanceReceipt";
import type {createOperationalSourceClearance} from "./operationalSourceClearance";
import type {StagingOperationStore} from "./stagingOperationStore";
export type StagingDeployment={id:string;config:ProviderConfig;termsRef:string;sourcePolicyRef:string;maxOutputTokens:number;inputUnitPrice:number;outputUnitPrice:number;budgetUnits:number;anthropicVersion?:string};
const hash=(s:string)=>createHash("sha256").update(s).digest("hex");
const identifier=(v:unknown):v is string=>typeof v==="string"&&/^[A-Za-z0-9][A-Za-z0-9:_.\/-]{0,255}$/.test(v);
const schema={type:"object",properties:{verdict:{type:"string",enum:["supports","contradicts","insufficient"]},evidenceSpan:{type:["string","null"]},reason:{type:"string"}},required:["verdict","evidenceSpan","reason"],additionalProperties:false};
export function providerWireBody(deployment:StagingDeployment,payload:ProviderPayload):string{
 if(!["openai","anthropic"].includes(deployment.config.providerId))throw Error("Unsupported staging provider");
 const evidence=JSON.stringify({claim:payload.claim,passage:payload.passage});
 if(deployment.config.providerId==="openai")return JSON.stringify({model:deployment.config.modelId,instructions:payload.instruction,input:evidence,max_output_tokens:deployment.maxOutputTokens,store:false,text:{format:{type:"json_schema",name:"hsi_entailment",strict:true,schema}}});
 return JSON.stringify({model:deployment.config.modelId,system:payload.instruction,messages:[{role:"user",content:evidence}],max_tokens:deployment.maxOutputTokens});
}
export function decodeProviderResult(provider:string,raw:unknown){
 if(!["openai","anthropic"].includes(provider))throw Error("provider_schema");
 const x=raw as Record<string,any>;
 if(!x||!identifier(x.id)||!identifier(x.model)||!x.usage||![x.usage.input_tokens,x.usage.output_tokens].every(n=>Number.isSafeInteger(n)&&n>=0))throw Error("provider_schema");
 let text:string;
 const cacheCreation=x.usage.cache_creation_input_tokens??0,cacheRead=x.usage.cache_read_input_tokens??0;
 if(![cacheCreation,cacheRead].every(n=>Number.isSafeInteger(n)&&n>=0))throw Error("provider_schema");
 if(provider==="openai"){
  if(x.status!=="completed"||x.error||x.incomplete_details||!Array.isArray(x.output))throw Error("provider_incomplete");
  const messages=x.output.filter((m:any)=>m.type==="message");
  if(messages.length!==1||messages[0].status!=="completed"||!Array.isArray(messages[0].content)||messages[0].content.length!==1||messages[0].content[0].type!=="output_text")throw Error("provider_schema");
  text=messages[0].content[0].text;
 }else{
  if(x.stop_reason!=="end_turn"||!Array.isArray(x.content)||x.content.length!==1||x.content[0].type!=="text")throw Error("provider_incomplete");
  text=x.content[0].text;
 }
 if(typeof text!=="string"||text.length>6000)throw Error("provider_schema");
 const result=JSON.parse(text);
 if(!result||typeof result!=="object"||Object.keys(result).sort().join(",")!=="evidenceSpan,reason,verdict"||!["supports","contradicts","insufficient"].includes(result.verdict)||typeof result.reason!=="string"||!result.reason.trim()||result.reason.length>1000||(result.evidenceSpan!==null&&(typeof result.evidenceSpan!=="string"||result.evidenceSpan.length>1000)))throw Error("provider_schema");
 return {result,responseId:x.id as string,resolvedModelId:x.model as string,inputTokens:x.usage.input_tokens+cacheCreation+cacheRead as number,outputTokens:x.usage.output_tokens as number};
}
export function createStagingProviderOperations(options:{
 enabled?:boolean;deployments:readonly StagingDeployment[];store:StagingOperationStore;
 sources:ReturnType<typeof createOperationalSourceClearance>;
 approve:(binding:{deploymentId:string;configurationHash:string;termsRef:string;sourcePolicyRef:string})=>Promise<boolean>;
 credential:(providerId:string)=>string;
 /** Test-only dependency injection. Omit for the native pinned transport. */
 transportFactory?:(encode:ProviderWireEncoder)=>ProviderTransport;
}){
 const enabled=options.enabled===true,deployments=structuredClone(options.deployments),{approve,credential}=options;
 const store={append:options.store.append.bind(options.store),reserve:options.store.reserve.bind(options.store)};
 const decide=options.sources.decide.bind(options.sources),factory=options.transportFactory??createPinnedProviderTransport;
 if(!deployments.length||new Set(deployments.map(d=>d.id)).size!==deployments.length)throw Error("Invalid staging deployments");
 for(const d of deployments){
  d.config={...validateProviderConfig(d.config)};
  if(![d.id,d.termsRef,d.sourcePolicyRef].every(identifier)||![d.maxOutputTokens,d.inputUnitPrice,d.outputUnitPrice,d.budgetUnits].every(n=>Number.isSafeInteger(n)&&n>0&&n<=1e12)||d.maxOutputTokens>4096||d.config.providerId==="openai"&&d.config.endpoint!=="https://api.openai.com/v1/responses"||d.config.providerId==="anthropic"&&!/^\d{4}-\d{2}-\d{2}$/.test(d.anthropicVersion??""))throw Error("Invalid staging deployment policy");
 }
 return {async run(input:{deploymentId:string;source:ClearanceBinding;payload:ProviderPayload;signal?:AbortSignal}){
  if(!enabled)throw Error("Staging provider execution disabled");
  const {deploymentId,source,payload}=structuredClone({deploymentId:input.deploymentId,source:input.source,payload:input.payload}),signal=input.signal;
  const d=deployments.find(d=>d.id===deploymentId);if(!d||signal?.aborted)throw Error("Staging deployment unavailable");
  if(!payload||payload.passage!==source.passage||[payload.instruction,payload.claim,payload.passage].some(s=>typeof s!=="string"||!s.trim())||payload.instruction.length>2000||payload.claim.length>2000||payload.passage.length>3000)throw Error("Invalid staging payload");
  if(!rejectPhiPayload({textBlobs:[payload.instruction,payload.claim,payload.passage]}).ok)throw Error("Prohibited staging data boundary");
  const configurationHash=hash(canonicalEvidenceJson(d));
  let approved=false;
  try{approved=await approve({deploymentId,configurationHash,termsRef:d.termsRef,sourcePolicyRef:d.sourcePolicyRef})===true;}catch{/* fail closed without copying authority errors */}
  if(!approved)throw Error("Staging deployment not approved");
  let decision:Awaited<ReturnType<typeof decide>>;
  try{decision=await decide(source);}catch{throw Error("Staging source authority unavailable");}
  if(decision.state!=="cleared"||decision.policyRef!==d.sourcePolicyRef||signal?.aborted)throw Error("Source not cleared for deployment");
  const wire=providerWireBody(d,payload),inputBound=Buffer.byteLength(wire)+4096,reservation=inputBound*d.inputUnitPrice+d.maxOutputTokens*d.outputUnitPrice;
  if(!Number.isSafeInteger(reservation)||reservation>1e12)throw Error("Invalid staging budget");
  const runId=randomUUID();
  let reserved=false;
  try{reserved=await store.reserve(d.id,runId,reservation,d.budgetUnits);}catch{throw Error("Staging budget store unavailable");}
  if(!reserved)throw Error("Staging budget exhausted");
  const base={runId,deploymentId,configurationHash,termsRef:d.termsRef,sourcePolicyRef:d.sourcePolicyRef,sourceId:source.sourceId,sourceVersion:source.sourceVersion,requestedModelId:d.config.modelId,wireHash:hash(wire),instructionHash:hash(payload.instruction),clearanceReceiptId:decision.receipt!.id,inputHash:hash(canonicalEvidenceJson(payload)),passageSha256:hash(source.passage),reservedUnits:reservation,scientificApproval:false,graphPromotable:false};
  try{await store.append({type:"provider_run_start",...base,at:new Date().toISOString()});}catch{throw Error("Staging start receipt unavailable");}
  let status="failed",httpStatus:number|null=null,providerRequestId:string|null=null,responseId:string|null=null;
  let usage:{inputTokens:number;outputTokens:number}|null=null,outputHash:string|null=null,resolvedModelId:string|null=null;
  const started=Date.now();let dispatchAttempted=false;
  try{
   // Revalidate after durable reservation/start; revoked or withdrawn clearance prevents dispatch.
   const current=await decide({...source,receipt:decision.receipt});
   if(current.state!=="cleared"||current.policyRef!==d.sourcePolicyRef||signal?.aborted)throw Error("clearance_changed");
   let stillApproved=false;
   try{stillApproved=await approve({deploymentId,configurationHash,termsRef:d.termsRef,sourcePolicyRef:d.sourcePolicyRef})===true;}catch{/* fail closed */}
   if(!stillApproved||signal?.aborted)throw Error("deployment_approval_changed");
   const encode:ProviderWireEncoder=()=>{
    const key=credential(d.config.providerId);if(typeof key!=="string"||!key.trim()||/[\r\n]/.test(key))throw Error("credential_unavailable");
    return {body:wire,headers:{"content-type":"application/json",...(d.config.providerId==="openai"?{authorization:"Bearer "+key}:{"x-api-key":key,"anthropic-version":d.anthropicVersion!})}};
   };
   const native=factory(encode);
   const runner=createProviderRunner(d.config,async(c,p,transportOptions)=>{
    if(signal?.aborted)throw Error("cancelled");
    const combined=signal?AbortSignal.any([signal,transportOptions.signal]):transportOptions.signal;
    dispatchAttempted=true;const response=await native(c,p,{...transportOptions,signal:combined});
    httpStatus=response.status;const requestId=response.headers.get("x-request-id")??response.headers.get("request-id");
    if(identifier(requestId))providerRequestId=requestId;
    return response;
   },{signal});
   const raw=await runner(payload);
   if((providerRequestId as string|null)===null)throw Error("provider_schema");
   const decoded=decodeProviderResult(d.config.providerId,raw);responseId=decoded.responseId;resolvedModelId=decoded.resolvedModelId;
   if(resolvedModelId!==d.config.modelId)throw Error("provider_schema");
   usage={inputTokens:decoded.inputTokens,outputTokens:decoded.outputTokens};
   if(decoded.inputTokens>inputBound||decoded.outputTokens>d.maxOutputTokens)throw Error("budget_usage_exceeded");
   if(signal?.aborted)throw Error("cancelled");
   // The schema adapter does not establish entailment; exact-span failure downgrades to insufficiency.
   if(decoded.result.verdict!=="insufficient"&&(!decoded.result.evidenceSpan?.trim()||!payload.passage.includes(decoded.result.evidenceSpan))){decoded.result.verdict="insufficient";decoded.result.evidenceSpan=null;}
   outputHash=hash(canonicalEvidenceJson(decoded.result));status="completed";
   return {runId,result:decoded.result,providerRequestId:providerRequestId as string|null,responseId,usage,scientificApproval:false as const,graphPromotable:false as const};
  }catch(error){
   const message=error instanceof Error?error.message:"";
   status=signal?.aborted?"cancelled":httpStatus===429?"rate_limited":httpStatus!==null&&httpStatus>=500?"provider_unavailable":message==="Provider deadline exceeded"?"timeout":message==="Provider response exceeds byte limit"?"response_overflow":message==="budget_usage_exceeded"?"budget_usage_exceeded":message==="provider_schema"||message==="provider_incomplete"||error instanceof SyntaxError?"invalid_response":"failed";
   throw Error("Staging provider run "+status+"; inspect protected receipt "+runId);
  }finally{
   try{await store.append({type:"provider_run_finish",...base,status,httpStatus,providerRequestId,responseId,usage,outputHash,resolvedModelId,dispatchAttempted,durationMs:Date.now()-started,at:new Date().toISOString()});}catch{throw Error("Staging terminal receipt unavailable; "+runId);}
  }
 }};
}
