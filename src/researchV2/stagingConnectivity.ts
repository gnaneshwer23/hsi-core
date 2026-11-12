/** Server-only Next-A transaction coordinator. Authorities remain independently operated. */
import type {ClearanceBinding} from "./sourceClearanceReceipt";
import type {ProviderPayload} from "./providerReliability";
import type {createOperationalSourceClearance} from "./operationalSourceClearance";
import type {createStagingProviderOperations} from "./stagingProviderOperations";
import {rejectPhiPayload} from "../cdsPhiBoundary";

export type ConnectivityRequest = {deploymentId:string;source:ClearanceBinding;payload:ProviderPayload};
/** No implicit retry: a failed/uncertain operation must be reconciled in the protected journal. */
export function createStagingConnectivity(options:{
 enabled?:boolean;
 sources:Pick<ReturnType<typeof createOperationalSourceClearance>,"decide">;
 providers:Pick<ReturnType<typeof createStagingProviderOperations>,"run">;
}) {
 const enabled=options.enabled===true,decide=options.sources.decide.bind(options.sources),run=options.providers.run.bind(options.providers);
 let running=false;
 return {async execute(input:readonly ConnectivityRequest[],signal?:AbortSignal){
  if(!enabled)throw Error("Staging connectivity disabled");
  if(running)throw Error("Staging connectivity already running");
  const batch=structuredClone(input);
  if(!Array.isArray(batch)||batch.length!==2||new Set(batch.map(r=>r?.deploymentId)).size!==2)throw Error("Two distinct approved deployment requests required");
  // Validate the entire batch before even contacting a source authority.
  for(const r of batch){
   if(!r||typeof r.deploymentId!=="string"||!r.deploymentId.trim()||!r.source||!r.payload||typeof r.source.sourceId!=="string"||!r.source.sourceId.trim()||typeof r.source.sourceVersion!=="string"||!r.source.sourceVersion.trim()||r.source.passage!==r.payload.passage||[r.payload.instruction,r.payload.claim,r.payload.passage].some(x=>typeof x!=="string"||!x.trim())||r.payload.instruction.length>2000||r.payload.claim.length>2000||r.payload.passage.length>3000||!rejectPhiPayload({textBlobs:[r.payload.instruction,r.payload.claim,r.payload.passage]}).ok)throw Error("Invalid staging connectivity batch");
  }
  const checkpoint=()=>{if(signal?.aborted)throw Error("Staging connectivity cancelled");};
  running=true;
  try{
   for(const r of batch){
    checkpoint();
    const d=await decide({...r.source,requiredActions:[...new Set([...(r.source.requiredActions??[]),"model_transmission" as const])]});
    checkpoint();
    if(d.state!=="cleared"||!d.receipt?.permittedActions.includes("model_transmission"))throw Error("Connectivity batch source clearance denied");
   }
   const receipts=[];
   for(const r of batch){
    checkpoint();
    // The provider service independently rechecks approval, source freshness and budget.
    const result=await run({...r,signal});
    receipts.push({deploymentId:r.deploymentId,runId:result.runId,providerRequestId:result.providerRequestId,responseId:result.responseId,usage:result.usage});
   }
   return {receipts,liveAcceptance:false as const,scientificApproval:false as const,graphPromotable:false as const};
  }finally{running=false;}
 }};
}
