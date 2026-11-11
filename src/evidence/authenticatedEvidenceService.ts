/** P1.8 trusted server boundary. A caller cannot supply its own principal.
 * The injected gateway must verify a signed, unexpired session server-side,
 * resolve the subject and tenant membership, and enforce revocation.
 */
import type {StagedEvidenceSnapshot} from "./governedEvidenceStaging";
import type {VerifiedResearchPrincipal} from "./authenticatedEvidenceReview";
import type {EvidenceDatabase} from "./transactionalEvidenceReview";
import {persistDraftEvidence,persistIndependentReview} from "./transactionalEvidenceReview";

export interface TrustedSessionGateway {
 verifySession(sessionToken:string):Promise<{
   subjectId:string;organizationId:string;sessionId:string;
   roles:readonly ("researcher"|"scientific_reviewer"|"research_admin")[];
 }|null>;
}
export interface AuthenticatedEvidenceService{
 submit(input:{sessionToken:string;snapshot:StagedEvidenceSnapshot;idempotencyKey:string}):
   ReturnType<typeof persistDraftEvidence>;
 review(input:{sessionToken:string;snapshotId:string;decision:"accepted"|"rejected"|"needs_revision";
   decisionId:string;notes:string}):ReturnType<typeof persistIndependentReview>;
}
export function createAuthenticatedEvidenceService(input:{
 gateway:TrustedSessionGateway;database:EvidenceDatabase;
}):AuthenticatedEvidenceService{
 async function principal(token:string):Promise<VerifiedResearchPrincipal>{
  if(typeof token!=="string"||!token.trim())throw new Error("Authentication required");
  const verified=await input.gateway.verifySession(token);
  if(!verified||!verified.subjectId.trim()||!verified.organizationId.trim()||
     !verified.sessionId.trim()||verified.roles.length===0)
    throw new Error("Authentication required");
  return {subjectId:verified.subjectId,organizationId:verified.organizationId,
    authSessionId:verified.sessionId,authenticatedBy:"trusted_server_gateway",
    roles:verified.roles};
 }
 return {
  async submit(request){
   const authenticated=await principal(request.sessionToken);
   return persistDraftEvidence({db:input.database,principal:authenticated,
     snapshot:request.snapshot,idempotencyKey:request.idempotencyKey});
  },
  async review(request){
   const authenticated=await principal(request.sessionToken);
   return persistIndependentReview({db:input.database,principal:authenticated,
     snapshotId:request.snapshotId,decision:request.decision,
     decisionId:request.decisionId,notes:request.notes});
  },
 };
}
