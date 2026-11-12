/** Versioned dependent-artifact invalidation over the existing durable operations coordinator.
 * Clearing a source later never silently reapproves an old artifact or transfers a review.
 */
import {opsHash,type PilotOperationsStore} from "../operations/pilotOperationsStore";
import type {SourceDecisionState} from "../researchV2/operationalSourceClearance";
export type SourceDependency={sourceId:string;sourceVersion:string;artifactHash:string;artifactVersion:string;investigationId:string;organizationRef:string;domain:string;clearanceRef:string};
export type SourceChange={sourceId:string;affectedVersions:string[];state:Exclude<SourceDecisionState,"cleared">;authorityDecisionRef:string;authorityRevision:string;evidenceHash:string};
export type SourceRereviewDecision={taskId:string;reviewerRef:string;receiptRef:string;decision:"reviewed_with_limitations"|"superseded";replacementArtifactHash:string|null};
export function createVersionedSourceRereview(store:PilotOperationsStore,authority:{
 /** Verifies the archived artifact/source/clearance binding, not a new grant of current reuse rights. */
 verifyDependency:(binding:Readonly<SourceDependency>)=>Promise<boolean>;
 verifySourceChange:(change:Readonly<SourceChange>)=>Promise<boolean>;
 /** Must verify active exact domain/tenant, non-self review, immutable artifact version, and any replacement pack clearance. */
 verifyArtifactUse:(binding:Readonly<{artifactHash:string;organizationRef:string;actions:readonly import("../researchV2/sourceClearanceReceipt").SourceUseAction[]}>)=>Promise<boolean>;
 verifyDecision:(binding:Readonly<{task:ReturnType<PilotOperationsStore["rereviewTasks"]>[number];decision:SourceRereviewDecision}>)=>Promise<boolean>;
}){
 return {
 async register(input:SourceDependency){const dependency=structuredClone(input);if(await authority.verifyDependency(structuredClone(dependency))!==true)throw Error("Independent same-investigation/version/source clearance required");return store.registerSourceDependency(dependency)},
 async apply(input:SourceChange){const change=structuredClone(input);if(await authority.verifySourceChange(structuredClone(change))!==true)throw Error("Trusted source revision/rights/retraction evidence required");return store.applySourceChange(change)},
 async review(input:SourceRereviewDecision){const decision=structuredClone(input),task=store.rereviewTasks().find(t=>t.taskId===decision.taskId);if(!task||await authority.verifyDecision({task:structuredClone(task),decision:structuredClone(decision)})!==true)throw Error("Independent active domain/tenant scoped re-review required");return store.resolveRereviewTask(decision)},
 async authorizeCurrentArtifactUse(input:{artifactHash:string;organizationRef:string;actions:readonly import("../researchV2/sourceClearanceReceipt").SourceUseAction[]}){
  const binding=structuredClone(input);if(!/^[a-f0-9]{64}$/.test(binding.artifactHash)||!binding.organizationRef?.trim()||!Array.isArray(binding.actions)||!binding.actions.length||new Set(binding.actions).size!==binding.actions.length||binding.actions.some(a=>!["model_transmission","storage","display","comparison","export"].includes(a)))throw Error("Bounded current artifact/action scope required");
  // Any historical invalidation keeps the original artifact stale, even after acknowledgement/supersession.
  if(store.rereviewTasks().some(t=>t.dependency.artifactHash===binding.artifactHash&&t.dependency.organizationRef===binding.organizationRef))return false;
  return await authority.verifyArtifactUse(structuredClone(binding))===true;
 },
 taskManifest(){const rows=store.rereviewTasks();return {taskIds:rows.map(r=>r.taskId),pending:rows.filter(r=>r.status==="pending").length,manifestHash:opsHash(rows),sourceUseReauthorized:false,graphPromotable:false}},
 };
}
