import { expect, test } from "bun:test";
import { validateScientificReview, type ReviewRequest } from "../src/scientificReview";
const principal = { principalId:"oidc:researcher-123",roles:["scientific_reviewer"],authenticated:true } as const;
const request:ReviewRequest = {claimId:"HSI-C-SSC-001",decision:"approve",rationale:"I reviewed the source context, methods, limitations, and supporting evidence.",evidenceReviewed:["pmid:30760472"],conflictOfInterestDeclared:true};
test("validated review retains provenance but does not publish",()=>{
 const review=validateScientificReview(principal,request);
 expect(review.decision).toBe("approve");
 expect(review.reviewerPrincipal).toBe("oidc:researcher-123");
 expect(review.evidenceReviewed).toEqual(["pmid:30760472"]);
});
test("anonymous or unauthorised caller cannot review",()=>{
 expect(()=>validateScientificReview(null,request)).toThrow("authentication");
 expect(()=>validateScientificReview({...principal,roles:["reader"]},request)).toThrow("authentication");
});
test("no source, insufficient rationale, or missing conflict declaration is rejected",()=>{
 expect(()=>validateScientificReview(principal,{...request,evidenceReviewed:[]})).toThrow("Evidence");
 expect(()=>validateScientificReview(principal,{...request,rationale:"looks fine"})).toThrow("rationale");
 expect(()=>validateScientificReview(principal,{...request,conflictOfInterestDeclared:false})).toThrow("Conflict");
});
test("rejects invalid decision and claim ID",()=>{
 expect(()=>validateScientificReview(principal,{...request,decision:"publish" as "approve"})).toThrow("decision");
 expect(()=>validateScientificReview(principal,{...request,claimId:"../../../etc"})).toThrow("identifier");
});
