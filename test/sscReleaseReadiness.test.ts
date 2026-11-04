import {test,expect} from "bun:test";
import {assessSscReleaseReadiness,type SscReadinessEvidence} from "../src/sscReleaseReadiness";
const empty:SscReadinessEvidence={migrationsApplied:["001","002","003","004","005","006","007"],authenticatedResearcherCount:0,authorisedReviewerCount:0,evidenceSourceCount:0,approvedClaimCount:0,publishedReleaseCount:0,persistedInvestigationCount:0,reviewedInvestigationCount:0,ciPassed:true,integrationTestsPassed:false,scientificValidationPassed:false,safetyReviewPassed:false};
test("schema and CI alone never establish scientific readiness",()=>{
 const r=assessSscReleaseReadiness(empty);
 expect(r.decision).toBe("BLOCKED");
 expect(r.gates.find(g=>g.id==="schema")?.passed).toBe(true);
 expect(r.gates.find(g=>g.id==="scientific_validation")?.passed).toBe(false);
});
test("missing a single scientific signoff blocks release",()=>{
 const full={...empty,authenticatedResearcherCount:1,authorisedReviewerCount:1,evidenceSourceCount:3,approvedClaimCount:2,publishedReleaseCount:1,persistedInvestigationCount:1,reviewedInvestigationCount:1,integrationTestsPassed:true,scientificValidationPassed:true,safetyReviewPassed:false};
 expect(assessSscReleaseReadiness(full).decision).toBe("BLOCKED");
 expect(assessSscReleaseReadiness({...full,safetyReviewPassed:true}).decision).toBe("READY_FOR_HUMAN_RELEASE_REVIEW");
});
test("even passing all gates does not automatically publish",()=>{
 const r=assessSscReleaseReadiness({...empty,authenticatedResearcherCount:1,authorisedReviewerCount:1,evidenceSourceCount:1,approvedClaimCount:1,publishedReleaseCount:1,persistedInvestigationCount:1,reviewedInvestigationCount:1,integrationTestsPassed:true,scientificValidationPassed:true,safetyReviewPassed:true});
 expect(r.decision).toBe("READY_FOR_HUMAN_RELEASE_REVIEW");
 expect(r).not.toHaveProperty("published");
});
