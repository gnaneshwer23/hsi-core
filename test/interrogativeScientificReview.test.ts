import {test,expect} from "bun:test";
import {planSscInterrogation} from "../src/interrogativeQuestionEngine";
import {fingerprintInterrogativeInvestigation} from "../src/interrogativeContracts";
import {validateHsiScientificReview,prepareHumanReviewedInvestigation,type HsiScientificReviewDecision} from "../src/interrogativeScientificReview";
const base=planSscInterrogation({question:"What mechanisms should be investigated in SSc?",actorPrincipal:"researcher-1",createdAt:"2026-11-04T12:00:00Z",dataClass:"public_biomedical",focus:"systemic_sclerosis",release:{id:"HSI-GR-SSC",version:"1.0.0",manifestHash:"a".repeat(64)}});
const investigation={...base,state:"awaiting_scientific_review" as const};
const reviewer={principalId:"reviewer-2",authenticated:true as const,scope:"ssc" as const,role:"scientific_reviewer" as const,authorityVerifiedAt:"2026-11-04T13:00:00Z"};
const decision:HsiScientificReviewDecision={schemaVersion:"hsi-interrogative-scientific-review-1",decisionId:"review-1",investigationId:investigation.id,investigationHash:fingerprintInterrogativeInvestigation(investigation),releaseId:investigation.release.id,releaseManifestHash:investigation.release.manifestHash,reviewerPrincipal:"reviewer-2",reviewedAt:"2026-11-04T13:00:00Z",outcome:"request_revision",rationale:"Evidence has not been curated",reviewedClaimIds:[],limitations:["No eligible graph release"],conflictOfInterestDeclared:true};
test("independent reviewer may request revision without publication",()=>{
 expect(()=>validateHsiScientificReview({investigation,reviewer,decision})).not.toThrow();
 const next=prepareHumanReviewedInvestigation({investigation,reviewer,decision});
 expect(next.state).toBe("draft");expect(next.review).toBeNull();
});
test("agent or unverified principal cannot approve",()=>{
 expect(()=>validateHsiScientificReview({investigation,reviewer:null,decision})).toThrow();
 expect(()=>validateHsiScientificReview({investigation,reviewer:{...reviewer,principalId:investigation.actorPrincipal},decision:{...decision,reviewerPrincipal:investigation.actorPrincipal}})).toThrow();
});
test("tampered investigation hash is rejected",()=>{
 expect(()=>validateHsiScientificReview({investigation,reviewer,decision:{...decision,investigationHash:"b".repeat(64)}})).toThrow();
});
test("approval without reviewed evidence is rejected",()=>{
 expect(()=>validateHsiScientificReview({investigation,reviewer,decision:{...decision,outcome:"approve_with_limitations"}})).toThrow();
});
test("missing COI declaration is rejected",()=>{
 expect(()=>validateHsiScientificReview({investigation,reviewer,decision:{...decision,conflictOfInterestDeclared:false}})).toThrow();
});
