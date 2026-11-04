/** ARCH-009: atomic fencing for multi-worker artifact writes.
 * Backing store MUST implement transactional compare-and-swap and durable storage.
 */
import {createHash} from "node:crypto";
export type HsiExecutionFence={investigationId:string;taskId:string;attempt:number;checkpointVersion:number;inputHash:string};
export type HsiFencedArtifact={artifactId:string;contentHash:string;outputRef:string;fence:HsiExecutionFence};
export interface HsiFencedArtifactStore{
 /** Atomic: verify checkpoint still RUNNING with same attempt/version/hash,
  * then insert artifact by idempotency key or return identical existing artifact.
  * Reject same key with different content, or stale/finished checkpoint.
  */
 commitIfCurrent(input:{fence:HsiExecutionFence;idempotencyKey:string;contentHash:string;payload:string}):Promise<HsiFencedArtifact>;
}
const hex=/^[a-f0-9]{64}$/;
export function hsiArtifactHash(payload:string):string{return createHash("sha256").update(payload).digest("hex")}
export function hsiIdempotencyKey(fence:HsiExecutionFence,logicalOutputId:string):string{
 if(!fence.investigationId.trim()||!fence.taskId.trim()||!logicalOutputId.trim()||!hex.test(fence.inputHash))throw Error("Invalid idempotency identity");
 return createHash("sha256").update(JSON.stringify([fence.investigationId,fence.taskId,fence.inputHash,logicalOutputId])).digest("hex");
}
export async function commitHsiFencedArtifact(input:{store:HsiFencedArtifactStore;fence:HsiExecutionFence;logicalOutputId:string;payload:string}):Promise<HsiFencedArtifact>{
 if(!Number.isInteger(input.fence.attempt)||input.fence.attempt<1||!Number.isInteger(input.fence.checkpointVersion)||input.fence.checkpointVersion<1||!hex.test(input.fence.inputHash))throw Error("Invalid execution fence");
 if(input.payload.length>1_000_000)throw Error("Artifact exceeds size limit");
 return input.store.commitIfCurrent({fence:input.fence,idempotencyKey:hsiIdempotencyKey(input.fence,input.logicalOutputId),contentHash:hsiArtifactHash(input.payload),payload:input.payload});
}
