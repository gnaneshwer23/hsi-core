import {describe,it,expect} from "bun:test";
import {evaluateWithTwoModels} from "../src/researchV2/reliabilityEvaluationHarness";
import type {EvaluationExample} from "../src/researchV2/reliabilityEvaluationHarness";
const example:EvaluationExample={id:"e1",claim:{id:"c1",sourceId:"s1",exactQuote:"Human cells express a marker.",subjectId:"CL:1",predicate:"associated_with",objectId:"GO:1",context:{diseaseIds:["EFO_1"],species:"human",tissueId:null,cellId:null,method:null}},passage:"Human cells express a marker.",receipt:{claimId:"c1",sourceId:"s1",disposition:"grounded_candidate",checks:{sourceIdentity:true,sourceStatus:true,rights:true,passageHash:true,exactSpan:true,biologicalContext:true},findings:[],scientificTruthEstablished:false,graphPromotable:false,humanApproval:false},gold:"insufficient",goldReviewerIds:["reviewer1","reviewer2"],goldAdjudicated:true,sourceIdentityVerified:false,rightsVerified:false,retractionCleared:false};
describe("B-04.4 operational evaluation harness",()=>{
 it("never sends unlicensed passages to models",async()=>{
  let called=0;const runner=async()=>{called++;return {verdict:"supports",evidenceSpan:"Human cells",reason:"synthetic"}};
  const result=await evaluateWithTwoModels([example],{verifierId:"v1",modelId:"m1",runner},{verifierId:"v2",modelId:"m2",runner:async()=>runner()});
  expect(called).toBe(0);expect(result.cases[0]?.prediction).toBe("not_assessed");expect(result.releaseEligible).toBe(false);
 });
 it("counts model errors as abstentions on cleared synthetic input",async()=>{
  const cleared={...example,sourceIdentityVerified:true,rightsVerified:true,retractionCleared:true};
  const result=await evaluateWithTwoModels([cleared],{verifierId:"v1",modelId:"m1",runner:async()=>{throw Error("offline")}},{verifierId:"v2",modelId:"m2",runner:async()=>({verdict:"supports",evidenceSpan:"Human cells",reason:"synthetic"})});
  expect(result.modelFailures).toBe(1);expect(result.cases[0]?.prediction).toBe("not_assessed");
 });
});
