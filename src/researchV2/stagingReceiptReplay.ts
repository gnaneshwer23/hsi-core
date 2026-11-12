/** Offline audit/recovery view. Never retries a request or upgrades scientific acceptance. */
import type {StagingOperationStore} from "./stagingOperationStore";
export function replayStagingReceipts(store:StagingOperationStore){
 const events=store.read(),starts=events.filter(e=>e.type==="provider_run_start"),finishes=events.filter(e=>e.type==="provider_run_finish"),reservations=events.filter(e=>e.type==="budget_reservation");
 if(new Set(starts.map(e=>e.runId)).size!==starts.length||new Set(finishes.map(e=>e.runId)).size!==finishes.length)throw Error("Duplicate staging lifecycle receipt");
 for(const finish of finishes){
  const start=starts.find(s=>s.runId===finish.runId);
  if(!start||["deploymentId","configurationHash","sourceId","sourceVersion","inputHash","wireHash","instructionHash","requestedModelId","clearanceReceiptId","reservedUnits"].some(key=>start[key]!==finish[key])||finish.scientificApproval!==false||finish.graphPromotable!==false)throw Error("Unbound staging completion receipt");
 }
 const runs=starts.map(start=>{
  const finish=finishes.find(f=>f.runId===start.runId);
  return {approvalReceiptIds:[...new Set(events.filter(e=>e.type==="deployment_approval_receipt"&&(e.receipt as Record<string,unknown>)?.configurationHash===start.configurationHash).map(e=>(e.receipt as Record<string,unknown>).id))],runId:start.runId,deploymentId:start.deploymentId,configurationHash:start.configurationHash,sourceId:start.sourceId,sourceVersion:start.sourceVersion,clearanceReceiptId:start.clearanceReceiptId,inputHash:start.inputHash,wireHash:start.wireHash,instructionHash:start.instructionHash,requestedModelId:start.requestedModelId,passageSha256:start.passageSha256,reservedUnits:start.reservedUnits,status:finish?.status??"completion_unknown",providerRequestId:finish?.providerRequestId??null,responseId:finish?.responseId??null,resolvedModelId:finish?.resolvedModelId??null,usage:finish?.usage??null,outputHash:finish?.outputHash??null,scientificApproval:false as const,graphPromotable:false as const};
 });
 return {runs,reservationsWithoutStart:reservations.filter(r=>!starts.some(s=>s.runId===r.runId)).map(r=>({runId:r.runId,scope:r.scope,reservedUnits:r.units})),automaticRetryPermitted:false as const,liveSmokeAccepted:false as const,scientificAccuracyEstablished:false as const};
}
