import {test,expect} from "bun:test";
import {fixtureCases,observation} from "./fixtures/immunoBenchmark";
import {reportImmunoEvaluation,conflictStats,interRaterAgreement,wilson95,zeroFailureUpper95,IMMUNO_CONFIGURATIONS} from "../src/evidence/immunoBenchmarkScoring";
const cases=()=>fixtureCases().slice(0,2),authority={verifyAssessment:async()=>true};
test("keeps eight scores separate from hard gates; publishes all failure cases and denominators",async()=>{
 const c=cases(),a=observation(c[0]!),b=observation(c[1]!);b.claims=[{id:"false",predictedSupport:true,goldSupport:false,traceable:false,permitted:false},{id:"negative",predictedSupport:false,goldSupport:false,traceable:true,permitted:true}];b.failures=[{kind:"promotion",critical:true,code:"TEST_ONLY_PROMOTION"}];b.scores.mechanism_accuracy=null;
 const r=await reportImmunoEvaluation(c,[a,b],authority),arm=r.configurations[1]!;
 expect(arm.overall.scores.mechanism_accuracy).toMatchObject({n:1,missing:1,mean:4});expect(arm.overall.supportPrecision).toMatchObject({numerator:1,denominator:2,value:0.5});expect(arm.overall.falsePositiveRateAmongGoldUnsupported).toMatchObject({numerator:1,denominator:2,value:0.5});expect(arm.overall.retrievalRecall).toMatchObject({numerator:2,denominator:4,value:0.5});
 expect(arm.diagnosticFailures.some(f=>f.caseId===b.caseId&&f.metric==="false_support")).toBe(true);expect(arm.diagnosticFailures.some(f=>f.metric==="retrieval_miss")).toBe(true);expect(arm.hardGateFailures.provenance).toHaveLength(1);expect(arm.hardGateFailures.sourceRights).toHaveLength(1);expect(arm.hardGateFailures.criticalSafetyIsolationPromotion[0]!.caseId).toBe(b.caseId);expect(r.scientificApproval).toBe(false);expect(r.qualityScoresMultipliedBySafety).toBe(false);expect(arm.overall.uncertainty.independentClusters).toBe(2);expect(arm.subgroups["domain:"+c[0]!.domain]).toBeDefined();
});
test("conflict macro F1 has fixed five-class denominator and abstentions remain false negatives",()=>{
 const c=cases()[0]!,a=observation(c),b=observation(c);a.conflict={gold:"consistent",predicted:"consistent"};b.conflict={gold:"potential_conflict",predicted:null};const r=conflictStats([a,b]);expect(r.matrix[0]![0]).toBe(1);expect(r.unclassified).toBe(1);expect(r.perClass[1]!.fn).toBe(1);expect(r.macroF1).toBe(0.2);
 a.raters=["consistent","consistent"];b.raters=["potential_conflict","potential_conflict"];expect(interRaterAgreement([a,b]).kappa).toBe(1);expect(interRaterAgreement([a]).kappa).toBeNull();
});
test("zero/undefined denominators and rare-failure bounds cannot imply perfect safety",()=>{
 expect(wilson95(0,0)).toBeNull();expect(wilson95(0,120)![1]).toBeGreaterThan(0);expect(zeroFailureUpper95(120)).toBeCloseTo(0.0246554,5);expect(()=>wilson95(2,1)).toThrow();
});
test("independent receipts, duplicate rows, non-finite metrics and unequal budgets/retrieval fail closed",async()=>{
 const c=cases(),a=observation(c[0]!);await expect(reportImmunoEvaluation(c,[a],{verifyAssessment:async()=>false})).rejects.toThrow("Independent");await expect(reportImmunoEvaluation(c,[a,a],authority)).rejects.toThrow("duplicate");
 for(const field of ["budgetPolicyHash","retrievalSnapshotHash"] as const){const b=observation(c[0]!,"dual_verifier");b[field]="f".repeat(64);await expect(reportImmunoEvaluation(c,[a,b],authority)).rejects.toThrow("Unequal")}
 await expect(reportImmunoEvaluation(c,[{...a,latencyMs:Infinity}],authority)).rejects.toThrow("Invalid");
});
test("all three arms preserve matching retrieval and budget conditions without an averaged safety multiplier",async()=>{
 const c=cases(),rows=IMMUNO_CONFIGURATIONS.flatMap(config=>c.map(caseValue=>observation(caseValue,config))),r=await reportImmunoEvaluation(c,rows,authority);expect(r.configurations).toHaveLength(3);for(const arm of r.configurations){expect(arm.overall.caseCount).toBe(2);expect(arm.missingCaseIds).toEqual([]);expect(arm.overall.latencyMs.mean).toBe(20);expect(arm.overall.costUsd.total).toBe(0.02)}
});
test("context-field missingness and ordinal agreement stay separate from aggregate accuracy",async()=>{
 const c=cases()[0]!,a=observation(c);a.contextFields=[{contextId:"x",field:"species",goldStatus:"not_reported",predictedStatus:"reported",valueCorrect:null},{contextId:"x",field:"dose",goldStatus:"reported",predictedStatus:"not_extracted",valueCorrect:null}];a.scoreRaters.retrieval=[2,2];const r=await reportImmunoEvaluation([c],[a],authority),m=r.configurations[1]!.overall;
 expect(m.contextByField.species!.missingFN).toBe(1);expect(m.contextByField.dose!.missingFP).toBe(1);expect(m.ordinalAgreement.retrieval!.exactAgreement).toBe(1);expect(m.ordinalAgreement.retrieval!.quadraticWeightedKappa).toBeNull();expect(m.uncertainty.intervals["contextAccuracy.species"]).toBeNull();
 const b=observation(c);b.contextFields[0]!.valueCorrect=null;await expect(reportImmunoEvaluation([c],[b],authority)).rejects.toThrow("annotation");
});
