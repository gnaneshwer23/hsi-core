import {expect,test} from "bun:test";
import {assessStep6Readiness,checkRepositoryEvidence,NO_VERIFIED_RUNTIME_EVIDENCE} from "../src/step6Readiness";
test("repository SSc candidates are not human reviewed or graph promotable",()=>{
 const evidence=checkRepositoryEvidence();
 expect(evidence.corpusCandidates).toBeGreaterThan(0);
 expect(evidence.reviewedByHuman).toBe(false);
 expect(evidence.graphPromotable).toBe(false);
});
test("all unverified live pipeline gates fail closed",()=>{
 const report=assessStep6Readiness(NO_VERIFIED_RUNTIME_EVIDENCE);
 expect(report.productionReady).toBe(false);
 expect(report.blockedCount).toBe(11);
});
test("even self-attested flags cannot grant production readiness",()=>{
 const all=Object.fromEntries(Object.keys(NO_VERIFIED_RUNTIME_EVIDENCE).map(key=>[key,true])) as unknown as typeof NO_VERIFIED_RUNTIME_EVIDENCE;
 const report=assessStep6Readiness(all);
 expect(report.productionReady).toBe(false);
 expect(report.blockedCount).toBe(0);
});
