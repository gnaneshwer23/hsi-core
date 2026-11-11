/** P1.4: fail-closed application-layer authorization and review transitions.
 * Authentication must be verified by the caller's trusted server-side gateway.
 * This module never accepts user-supplied identity as proof of authentication.
 */
import type {StagedEvidenceSnapshot} from "./governedEvidenceStaging";

export type VerifiedResearchPrincipal={
  subjectId:string;
  organizationId:string;
  roles:readonly ("researcher"|"scientific_reviewer"|"research_admin")[];
  authenticatedBy:"trusted_server_gateway";
  authSessionId:string;
};
export type EvidenceReviewRecord={
  snapshotId:string;organizationId:string;submittedBy:string;
  status:"pending_review"|"accepted"|"rejected"|"needs_revision";
  reviewerId:string|null;reviewDecisionId:string|null;
  reviewerNotes:string|null;
};
export function authorizeEvidenceSubmission(
 principal:VerifiedResearchPrincipal,snapshot:StagedEvidenceSnapshot,
):EvidenceReviewRecord{
 if(principal.authenticatedBy!=="trusted_server_gateway"||
   !principal.subjectId.trim()||!principal.organizationId.trim()||
   !principal.authSessionId.trim()||
   !principal.roles.includes("researcher"))
   throw new Error("Authenticated research submission required");
 if(snapshot.state!=="pending_independent_review"||snapshot.persisted!==false||
   snapshot.scientificApproval!==false||snapshot.visibility!=="governed_research"||
   !/^evidence\.sha256\.[a-f0-9]{64}$/.test(snapshot.snapshotId)||
   snapshot.snapshotId!==`evidence.sha256.${snapshot.contentSha256}`)
   throw new Error("Invalid staged evidence snapshot");
 return {snapshotId:snapshot.snapshotId,organizationId:principal.organizationId,
   submittedBy:principal.subjectId,status:"pending_review",
   reviewerId:null,reviewDecisionId:null,reviewerNotes:null};
}
export function authorizeReviewDecision(input:{
 principal:VerifiedResearchPrincipal;
 record:EvidenceReviewRecord;
 decision:"accepted"|"rejected"|"needs_revision";
 decisionId:string;notes:string;
}):EvidenceReviewRecord{
 const {principal,record,decision,decisionId,notes}=input;
 if(principal.authenticatedBy!=="trusted_server_gateway"||
   !principal.subjectId.trim()||!principal.authSessionId.trim()||
   !principal.roles.includes("scientific_reviewer")||
   principal.organizationId!==record.organizationId||
   principal.subjectId===record.submittedBy)
   throw new Error("Independent authenticated reviewer required");
 if(record.status!=="pending_review"||record.reviewerId!==null||
   record.reviewDecisionId!==null)
   throw new Error("Review already decided");
 if(!decisionId.trim()||!notes.trim())
   throw new Error("Review decision requires audit ID and notes");
 return {...record,status:decision,reviewerId:principal.subjectId,
   reviewDecisionId:decisionId,reviewerNotes:notes};
}
