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
 it("separates adjudication, inference, false discovery and false positive denominators",()=>{
  const cases:BenchmarkCase[]=[
   {...sample,id:"1",gold:"supports",prediction:"supports"},
   {...sample,id:"2",gold:"contradicts",prediction:"supports"},
   {...sample,id:"3",gold:"insufficient",prediction:"insufficient"},
   {...sample,id:"4",gold:"insufficient",prediction:"not_assessed"},
   {...sample,id:"5",goldAdjudicated:false,goldReviewerIds:[],prediction:"not_assessed"},
  ];
  const r=evaluateScientificReliability(cases,20);
  expect(r.schemaVersion).toBe("hsi-reliability-report-2");expect(r.adjudicationCoverage).toBe(4/5);expect(r.inferenceCoverage).toBe(3/4);
  expect(r.falseDiscoveryRate).toBe(1/2);expect(r.falsePositiveRate).toBe(1/3);
  expect(r.technicalAbstentionRate).toBe(1/4);expect(r.insufficientEvidenceRate).toBe(1/4);
  expect(r.denominators).toEqual({total:5,adjudicated:4,predictedSupport:2,goldNonSupport:3});expect(r.releaseEligible).toBe(false);
 });
 it("fails closed for missing licence and unknown retraction",()=>{
  const result=assessSourceClearance({sourceId:"s1",pmid:"123",pmcid:"PMC123",rights:{status:"unknown",licenceId:null,verifiedBy:null},retraction:{status:"unknown",checkedBy:null},identity:{status:"matched",checkedBy:"source"}});
  expect(result.usableForPassageVerification).toBe(false);expect(result.requiresException).toBe(true);
 });
 it("rejects insecure provider endpoints",()=>{
  expect(()=>validateProviderConfig({providerId:"p1",modelId:"m1",endpoint:"http://localhost:1234",timeoutMs:5000,maxResponseBytes:1000})).toThrow();
 });
});
