import {describe,it,expect} from "bun:test";
import {evaluateScientificReliability,type BenchmarkCase} from "../src/researchV2/scientificReliabilityGate";
import {assessSourceClearance} from "../src/researchV2/sourceClearance";
import {validateProviderConfig} from "../src/researchV2/providerReliability";
describe("B-04.4 scientific reliability release boundaries",()=>{
 const sample:BenchmarkCase={id:"case1",sourceId:"s1",gold:"contradicts",goldReviewerIds:["r1","r2"],goldAdjudicated:true,prediction:"supports",sourceIdentityVerified:true,rightsVerified:true,retractionCleared:true,modelRunIds:["run1","run2"]};
 it("counts false support and never self-certifies release",()=>{
  const report=evaluateScientificReliability([sample],20);
  expect(report.falseSupportRate).toBe(1);expect(report.supportPrecision).toBe(0);expect(report.releaseEligible).toBe(false);
 });
 it("rejects duplicate benchmark cases",()=>expect(()=>evaluateScientificReliability([sample,sample])).toThrow());
 it("fails closed for missing licence and unknown retraction",()=>{
  const result=assessSourceClearance({sourceId:"s1",pmid:"123",pmcid:"PMC123",rights:{status:"unknown",licenceId:null,verifiedBy:null},retraction:{status:"unknown",checkedBy:null},identity:{status:"matched",checkedBy:"source"}});
  expect(result.usableForPassageVerification).toBe(false);expect(result.requiresException).toBe(true);
 });
 it("rejects insecure provider endpoints",()=>{
  expect(()=>validateProviderConfig({providerId:"p1",modelId:"m1",endpoint:"http://localhost:1234",timeoutMs:5000,maxResponseBytes:1000})).toThrow();
 });
});
