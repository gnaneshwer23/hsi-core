/**
 * P0.2.2 authenticated contradiction service contract.
 * Deliberately deny-by-default until tenant grants, DB RLS and migration 024
 * have passed staging acceptance. No public route or write is exposed.
 */
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import {verifyHsiReviewerAuthority} from "./reviewerAuthority";
import {prepareContradictionSnapshot,validateIndependentContradictionReview} from "./scientificContradictionLedger";
import type {EvidenceInput} from "../evidence/canonicalEvidenceWorkflow";
export type AuthenticatedContradictionConfig = {
 databaseUrl:string;neonProjectId?:string|null;serverSessionToken:string|null|undefined;
};
export type VerifiedContradictionActor = {
 principalId:string;roles:readonly string[];authenticated:true;
};
export async function verifyContradictionActor(
 input:AuthenticatedContradictionConfig,requiredRole:"researcher"|"scientific_reviewer"
):Promise<VerifiedContradictionActor>{
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 const actor=await authenticateHsiNeonSession({sessionToken:input.serverSessionToken,
  databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId});
 if(!actor?.authenticated||!actor.principalId?.trim())throw Error("Verified HSI session required");
 if(requiredRole==="researcher"?
   !actor.roles.some(r=>r==="researcher"||r==="research_admin"):
   !actor.roles.includes("scientific_reviewer"))
  throw Error("Required research role missing");
 return {principalId:actor.principalId,roles:actor.roles,authenticated:true};
}
export async function prepareAuthenticatedContradiction(input:AuthenticatedContradictionConfig&{
 id:string;tenantId:string;left:EvidenceInput;right:EvidenceInput
}){
 const actor=await verifyContradictionActor(input,"researcher");
 // Tenant membership cannot be inferred from a client-provided tenantId.
 // Snapshot preparation is NOT authorization to persist it.
 return prepareContradictionSnapshot({id:input.id,tenantId:input.tenantId,
  submittedBy:actor.principalId,left:input.left,right:input.right});
}
export async function verifyAuthenticatedIndependentReview(input:AuthenticatedContradictionConfig&{
 submittedBy:string;tenantId:string;decision:"approved"|"rejected"|"needs_evidence";
 rationale:string;sourceLocator:string;reviewedAt:string;scope:"ssc"|"ra"
}){
 const actor=await verifyContradictionActor(input,"scientific_reviewer");
 validateIndependentContradictionReview({submittedBy:input.submittedBy,
  reviewerPrincipal:actor.principalId,decision:input.decision,
  rationale:input.rationale,sourceLocator:input.sourceLocator});
 if(!await verifyHsiReviewerAuthority({principal:actor.principalId,reviewedAt:input.reviewedAt,
  databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId,scope:input.scope}))
  throw Error("Independent reviewer authority not verified");
 // No DB write: trusted tenant membership and transaction-bound RLS are not implemented.
 return {reviewerPrincipal:actor.principalId,verified:true as const,persisted:false as const};
}
/** Hard stop: no caller can activate persistence by passing client-side flags. */
export async function persistAuthenticatedContradiction():Promise<never>{
 throw Error("P0.2.2 persistence held: database tenant RLS and staging acceptance incomplete");
}
