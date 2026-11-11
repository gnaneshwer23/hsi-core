import {describe,expect,test} from "bun:test";
import {authorizeEvidenceSubmission,authorizeReviewDecision}
 from "../src/evidence/authenticatedEvidenceReview";
import type {StagedEvidenceSnapshot} from "../src/evidence/governedEvidenceStaging";
const hash="a".repeat(64);
const snapshot={snapshotId:`evidence.sha256.${hash}`,contentSha256:hash,
  state:"pending_independent_review",persisted:false,scientificApproval:false,
  visibility:"governed_research"} as StagedEvidenceSnapshot;
const researcher={subjectId:"researcher-1",organizationId:"org-1",
  roles:["researcher"] as const,authenticatedBy:"trusted_server_gateway" as const,
  authSessionId:"session-1"};
const reviewer={subjectId:"reviewer-2",organizationId:"org-1",
  roles:["scientific_reviewer"] as const,
  authenticatedBy:"trusted_server_gateway" as const,authSessionId:"session-2"};
describe("P1.4 evidence review authorization policy",()=>{
 test("creates pending submission only",()=>{
  const record=authorizeEvidenceSubmission(researcher,snapshot);
  expect(record.status).toBe("pending_review");
  expect(record.reviewDecisionId).toBeNull();
 });
 test("prevents submitting researcher from approving own work",()=>{
  const record=authorizeEvidenceSubmission(researcher,snapshot);
  expect(()=>authorizeReviewDecision({principal:{...reviewer,subjectId:"researcher-1"},
    record,decision:"accepted",decisionId:"decision-1",notes:"reviewed"})).toThrow();
 });
 test("prevents cross-organization reviewer",()=>{
  const record=authorizeEvidenceSubmission(researcher,snapshot);
  expect(()=>authorizeReviewDecision({principal:{...reviewer,organizationId:"org-2"},
    record,decision:"accepted",decisionId:"decision-1",notes:"reviewed"})).toThrow();
 });
 test("permits one independent review transition",()=>{
  const record=authorizeEvidenceSubmission(researcher,snapshot);
  const decided=authorizeReviewDecision({principal:reviewer,record,
    decision:"accepted",decisionId:"decision-1",notes:"Evidence checked"});
  expect(decided.reviewerId).toBe("reviewer-2");
  expect(()=>authorizeReviewDecision({principal:reviewer,record:decided,
    decision:"rejected",decisionId:"decision-2",notes:"changed"})).toThrow();
 });
 test("rejects missing authenticated session",()=>{
  expect(()=>authorizeEvidenceSubmission({...researcher,authSessionId:""},snapshot)).toThrow();
 });
});
