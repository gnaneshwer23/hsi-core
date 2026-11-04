/** ARCH-009 recovery reconciliation: inspect durable artifact for an interrupted
 * RUNNING checkpoint. Never rerun the executor merely because the process died.
 * This module is read-only; reconciliation completion is a separate CAS transition.
 */
import type {HsiCheckpointStore,HsiDurableCheckpoint} from "./hsiAgentDurableCheckpoint";
export interface HsiReconciliationArtifact{artifactId:string;outputRef:string;attempt:number;checkpointVersion:number;inputHash:string}
export interface HsiReconciliationArtifactReader{
 findCurrent(investigationId:string,taskId:string,attempt:number,version:number,inputHash:string):Promise<readonly HsiReconciliationArtifact[]>;
}
export type HsiReconciliationDecision=
 | {action:"already_completed";checkpoint:HsiDurableCheckpoint}
 | {action:"reconcile_committed_artifact";checkpoint:HsiDurableCheckpoint;artifact:HsiReconciliationArtifact}
 | {action:"manual_recovery_required";checkpoint:HsiDurableCheckpoint;reason:string}
 | {action:"no_checkpoint"};
export async function inspectHsiInterruptedExecution(input:{store:HsiCheckpointStore;artifacts:HsiReconciliationArtifactReader;investigationId:string;taskId:string;expectedInputHash:string}):Promise<HsiReconciliationDecision>{
 const checkpoint=await input.store.read(input.investigationId,input.taskId);
 if(!checkpoint)return {action:"no_checkpoint"};
 if(checkpoint.inputHash!==input.expectedInputHash)throw Error("Input fingerprint changed; cannot reconcile");
 if(checkpoint.state==="completed")return {action:"already_completed",checkpoint};
 if(checkpoint.state!=="running")return {action:"manual_recovery_required",checkpoint,reason:"Execution not running; operator review required"};
 const found=await input.artifacts.findCurrent(checkpoint.investigationId,checkpoint.taskId,checkpoint.attempt,checkpoint.version,checkpoint.inputHash);
 if(found.length!==1)return {action:"manual_recovery_required",checkpoint,reason:found.length===0?"No committed artifact; do not automatically replay":"Ambiguous artifacts; operator review required"};
 const artifact=found[0]!;
 if(artifact.attempt!==checkpoint.attempt||artifact.checkpointVersion!==checkpoint.version||artifact.inputHash!==checkpoint.inputHash||!artifact.outputRef.trim())throw Error("Artifact fence mismatch");
 return {action:"reconcile_committed_artifact",checkpoint,artifact};
}
