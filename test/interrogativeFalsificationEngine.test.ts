import {test,expect} from "bun:test";
import {planSscInterrogation} from "../src/interrogativeQuestionEngine";
import {evaluateSscFalsification} from "../src/interrogativeFalsificationEngine";
import type {EvidenceTrace} from "../src/interrogativeContracts";
const base=planSscInterrogation({question:"What drives SSc fibrosis?",actorPrincipal:"researcher",createdAt:"2026-11-04T12:00:00Z",dataClass:"public_biomedical",focus:"systemic_sclerosis",release:{id:"HSI-GR-SSC",version:"1.0.0",manifestHash:"a".repeat(64)}});
const trace=(claimId:string,predicate:string,context:Record<string,unknown>,polarity:"supports"|"contradicts"="supports"):EvidenceTrace=>({claimId,sourceIds:["pmid:"+claimId],reviewDecisionId:"review:"+claimId,polarity,evidenceKind:"association",context,graphPath:["cell:1",predicate,"disease:ssc"]});
test("empty approved evidence is a gap, never negative evidence",()=>{
 const r=evaluateSscFalsification(base);
 expect(r.signals.every(s=>s.kind==="evidence_gap")).toBe(true);
 expect(r.branches.every(b=>b.assessment==="insufficient_evidence")).toBe(true);
});
test("opposite reviewed predicates in identical context are only candidate contradictions",()=>{
 const b=base.branches[0]!;
 const x={...base,branches:[{...b,supporting:[trace("a","promotes",{tissue:"skin"}),trace("b","inhibits",{tissue:"skin"})]}]};
 const r=evaluateSscFalsification(x);
 expect(r.signals[0]?.kind).toBe("opposing_reviewed_claims");
 expect(r.signals[0]?.status).toBe("candidate_requires_scientific_review");
 expect(r.branches[0]?.assessment).toBe("contested");
});
test("different tissue context is not asserted as a contradiction",()=>{
 const b=base.branches[0]!;
 const x={...base,branches:[{...b,supporting:[trace("a","promotes",{tissue:"skin"}),trace("b","inhibits",{tissue:"lung"})]}]};
 const r=evaluateSscFalsification(x);
 expect(r.signals[0]?.kind).toBe("context_divergence");
 expect(r.branches[0]?.assessment).toBe("context_limited");
});
test("no reviewer approval is created by falsification engine",()=>{
 const r=evaluateSscFalsification(base);
 expect(base.review).toBeNull();
 expect(r).not.toHaveProperty("review");
});
