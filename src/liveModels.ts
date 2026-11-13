/**
 * Provider-backed model runners for the investigation pipeline. Thin adapters only: every call goes through
 * createStagingProviderOperations, which already enforces deployment approval, independent source clearance that
 * permits model transmission, a PHI boundary, budget reservation, pinned transport and protected receipts. Nothing here
 * holds a credential, reaches a provider directly, or decides anything about rights. A run-wide call budget is checked
 * BEFORE any call is made, so exhausting it cannot cost money or send text.
 */
import type {createStagingProviderOperations} from "./researchV2/stagingProviderOperations";
import type {ExtractionModelRunner} from "./evidence/modelEvidenceExtraction";
import type {EntailmentModelRunner} from "./researchV2/modelEntailment";

export type ProviderOperations=Pick<ReturnType<typeof createStagingProviderOperations>,"run">;
export type VerifierDeployment={verifierId:string;deploymentId:string};
const ID=/^[A-Za-z0-9][A-Za-z0-9:_./-]{0,255}$/;

export function createProviderBackedRunners(config:{
 ops:ProviderOperations;extractorDeploymentId:string;verifierDeployments:readonly VerifierDeployment[];maxModelCalls:number;signal?:AbortSignal;
}){
 const {ops,extractorDeploymentId,verifierDeployments,maxModelCalls,signal}=config;
 if(!ops||typeof ops.run!=="function"||!ID.test(extractorDeploymentId)||!Number.isInteger(maxModelCalls)||maxModelCalls<1||maxModelCalls>1000)throw Error("Invalid provider runner configuration");
 const verifierIds=verifierDeployments.map(v=>v.verifierId);
 if(verifierDeployments.length<1||new Set(verifierIds).size!==verifierIds.length||verifierDeployments.some(v=>!ID.test(v.verifierId)||!ID.test(v.deploymentId)))throw Error("Distinct, valid verifier deployments required");
 let calls=0;
 const spend=()=>{if(calls>=maxModelCalls)throw Error("Model call budget exhausted");calls++};
 const extraction:ExtractionModelRunner=async request=>{
  const source=request.source;
  if(!source?.sourceId||!source.sourceVersion)throw Error("Source identity required for a model call");
  spend();
  const out=await ops.run({deploymentId:extractorDeploymentId,task:"extraction",source:{receipt:null,sourceId:source.sourceId,sourceVersion:source.sourceVersion,passage:request.passage},
   payload:{instruction:request.instruction,claim:request.question,passage:request.passage},signal});
  return out.result;
 };
 const entailment=(verifierId:string):EntailmentModelRunner=>{
  const deployment=verifierDeployments.find(v=>v.verifierId===verifierId);
  if(!deployment)throw Error("Unknown verifier");
  return async request=>{
   if(!request.sourceId||!request.sourceVersion)throw Error("Source identity required for a model call");
   spend();
   const out=await ops.run({deploymentId:deployment.deploymentId,source:{receipt:null,sourceId:request.sourceId,sourceVersion:request.sourceVersion,passage:request.passage},
    payload:{instruction:request.instruction,claim:request.claim,passage:request.passage},signal});
   return out.result;
  };
 };
 return {extraction,entailment,calls:()=>calls,remaining:()=>maxModelCalls-calls};
}
