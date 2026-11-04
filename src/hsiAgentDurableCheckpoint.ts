/** ARCH-009 Phase 2 durable checkpoint contract.
 * A host-provided store must implement atomic compare-and-swap and durable writes.
 * This module does not imply a Neon deployment or permit automatic replay.
 */
import {createHash} from "node:crypto";
export type HsiCheckpointState="created"|"running"|"completed"|"blocked"|"failed"|"cancelled";
export type HsiDurableCheckpoint={
 schemaVersion:"hsi-agent-checkpoint-1";investigationId:string;taskId:string;
 attempt:number;state:HsiCheckpointState;version:number;
 inputHash:string;outputRef:string|null;errorCode:string|null;
 startedAt:string;finishedAt:string|null;
};
export interface HsiCheckpointStore{
 read(investigationId:string,taskId:string):Promise<HsiDurableCheckpoint|null>;
 /** Must atomically write only if the stored version equals expectedVersion; null requires absence. */
 compareAndSwap(expectedVersion:number|null,next:HsiDurableCheckpoint):Promise<boolean>;
}
const hex=/^[a-f0-9]{64}$/;
export function hashHsiCheckpointInput(value:unknown):string{
 const canonical=(x:unknown):string=>Array.isArray(x)?"["+x.map(canonical).join(",")+"]":x&&typeof x==="object"?"{"+Object.entries(x as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+":"+canonical(v)).join(",")+"}":JSON.stringify(x)??"null";
 return createHash("sha256").update(canonical(value)).digest("hex");
}
export function validateHsiCheckpoint(c:HsiDurableCheckpoint):void{
 if(c.schemaVersion!=="hsi-agent-checkpoint-1"||!c.investigationId.trim()||!c.taskId.trim()||!hex.test(c.inputHash))throw Error("Invalid checkpoint identity");
 if(!Number.isInteger(c.version)||c.version<1||!Number.isInteger(c.attempt)||c.attempt<1||c.attempt>3)throw Error("Invalid checkpoint version or attempt");
 if(!["created","running","completed","blocked","failed","cancelled"].includes(c.state)||!Number.isFinite(Date.parse(c.startedAt))||(c.finishedAt!==null&&!Number.isFinite(Date.parse(c.finishedAt))))throw Error("Invalid checkpoint state or timestamp");
 if(c.state==="completed"&&!c.outputRef?.trim())throw Error("Completed checkpoint requires output reference");
 if(c.state!=="completed"&&c.outputRef!==null)throw Error("Unapproved output in non-completed checkpoint");
}
export async function startHsiCheckpoint(input:{store:HsiCheckpointStore;investigationId:string;taskId:string;inputHash:string;startedAt:string}):Promise<HsiDurableCheckpoint>{
 const existing=await input.store.read(input.investigationId,input.taskId);
 if(existing){validateHsiCheckpoint(existing);if(existing.inputHash!==input.inputHash)throw Error("Checkpoint input mismatch");throw Error("Existing checkpoint requires explicit recovery decision")}
 const next:HsiDurableCheckpoint={schemaVersion:"hsi-agent-checkpoint-1",investigationId:input.investigationId,taskId:input.taskId,attempt:1,state:"running",version:1,inputHash:input.inputHash,outputRef:null,errorCode:null,startedAt:input.startedAt,finishedAt:null};
 validateHsiCheckpoint(next);
 if(!await input.store.compareAndSwap(null,next))throw Error("Concurrent checkpoint claim");
 return next;
}
export async function finishHsiCheckpoint(input:{store:HsiCheckpointStore;checkpoint:HsiDurableCheckpoint;state:"completed"|"blocked"|"failed"|"cancelled";outputRef?:string|null;errorCode?:string|null;finishedAt:string}):Promise<HsiDurableCheckpoint>{
 const c=input.checkpoint;validateHsiCheckpoint(c);
 if(c.state!=="running")throw Error("Only running checkpoint may finish");
 const next:HsiDurableCheckpoint={...c,version:c.version+1,state:input.state,outputRef:input.state==="completed"?(input.outputRef??null):null,errorCode:input.state==="completed"?null:(input.errorCode??"unspecified"),finishedAt:input.finishedAt};
 validateHsiCheckpoint(next);
 if(!await input.store.compareAndSwap(c.version,next))throw Error("Checkpoint completion conflict");
 return next;
}
/** Recovery is an explicit operator decision; completed tasks are never replayed. */
export async function recoverHsiCheckpoint(input:{store:HsiCheckpointStore;investigationId:string;taskId:string;inputHash:string;approvedBy:string;recoveryReason:string;startedAt:string}):Promise<HsiDurableCheckpoint>{
 if(!input.approvedBy.trim()||!input.recoveryReason.trim())throw Error("Human recovery authorisation and reason required");
 const prior=await input.store.read(input.investigationId,input.taskId);
 if(!prior)throw Error("No checkpoint to recover");
 validateHsiCheckpoint(prior);
 if(prior.inputHash!==input.inputHash||prior.state==="completed"||prior.state==="running"||prior.attempt>=3)throw Error("Checkpoint cannot be retried");
 const next:HsiDurableCheckpoint={...prior,version:prior.version+1,attempt:prior.attempt+1,state:"running",outputRef:null,errorCode:null,startedAt:input.startedAt,finishedAt:null};
 validateHsiCheckpoint(next);
 if(!await input.store.compareAndSwap(prior.version,next))throw Error("Concurrent recovery conflict");
 return next;
}
