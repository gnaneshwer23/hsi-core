import {test,expect} from "bun:test";
import {buildImmunoProtocol,assertImmunoSplits,contaminationFindings,prepareImmunoFreeze,benchmarkDigest,validatePrivateGold,assertNoStructuredBenchmarkGold} from "../src/evidence/immunoBenchmark";
import {fixtureCases,TEST_GOLD,fixturePolicy,hash} from "./fixtures/immunoBenchmark";
const inputs=()=>({cases:fixtureCases(),protocolHash:buildImmunoProtocol().protocolHash,rubricHash:hash("rubric"),thresholdPolicyHash:benchmarkDigest(fixturePolicy(fixtureCases())),disputeRuleHash:hash("dispute"),contaminationReceiptHash:hash("contamination")});
const authority={loadGold:async()=>TEST_GOLD,expertReview:async()=>true,sourceUse:async()=>true,approveProtocol:async()=>true};
test("120 public authoring slots preserve 50/30/20/20 and disease allocation without gold or invented reviews",()=>{
 const p=buildImmunoProtocol();expect(p.slots).toHaveLength(120);expect(p.adjudicatedCaseCount).toBe(0);expect(p.numericFloors).toBeNull();for(const [layer,n] of [["core",50],["disease",30],["cross_domain",20],["governance",20]] as const)expect(p.slots.filter(s=>s.layer===layer)).toHaveLength(n);expect(p.slots.filter(s=>s.domain==="ssc")).toHaveLength(6);expect(p.slots.filter(s=>s.domain==="ra")).toHaveLength(5);expect(JSON.stringify(p)).not.toContain("TEST_ONLY_A");expect(p.protocolHash).toBe(buildImmunoProtocol().protocolHash);
});
test("family and near-duplicate leakage is denied regardless of JSON IDs",()=>{
 for(const key of ["studyFamilies","claimFamilies","questionFamilies"] as const){const c=fixtureCases();c.at(-1)![key]=[...c[0]![key]];expect(()=>assertImmunoSplits(c)).toThrow("contamination")}
 const c=fixtureCases();c.at(-1)!.researchQuestion=c[0]!.researchQuestion.toUpperCase()+"?";expect(()=>assertImmunoSplits(c)).toThrow("contamination");
 const a=fixtureCases();a[0]!.aliases=[{namespace:"R2",id:"same"}];a[1]!.aliases=[{namespace:"R2",id:"same"}];expect(()=>assertImmunoSplits(a)).toThrow("Alias");
});
test("public/prompt/index/tuning contamination audit returns case IDs without copying gold answers",()=>{
 const c=fixtureCases()[0]!,phrase="TEST ONLY substantial heldout answer fingerprint never public";
 const found=contaminationFindings([c],[{surface:"agent_prompt",id:"p1",text:c.researchQuestion},{surface:"retrieval_index",id:"i1",text:phrase}],[{caseId:c.caseId,phrase}]);expect(found.map(f=>f.kind)).toEqual(["question","gold"]);expect(JSON.stringify(found)).not.toContain(phrase);
});
test("freeze requires exactly 120 slots and development; validates every expert and source binding",async()=>{
 const f=await prepareImmunoFreeze(inputs(),authority);expect(f.finalCaseCount).toBe(120);expect(f.developmentCaseCount).toBe(1);expect(f.scientificApproval).toBe(false);expect(JSON.stringify(f)).not.toContain(TEST_GOLD.rationale);
 await expect(prepareImmunoFreeze({...inputs(),cases:fixtureCases().slice(0,120)},authority)).rejects.toThrow("development");
 await expect(prepareImmunoFreeze(inputs(),{...authority,expertReview:async()=>false})).rejects.toThrow("Untrusted");
 await expect(prepareImmunoFreeze(inputs(),{...authority,sourceUse:async()=>false})).rejects.toThrow("Untrusted");
 await expect(prepareImmunoFreeze(inputs(),{...authority,approveProtocol:async()=>false})).rejects.toThrow("scientific approval");
 await expect(prepareImmunoFreeze(inputs(),{...authority,loadGold:async()=>({...TEST_GOLD,rationale:"altered"})})).rejects.toThrow("Untrusted");
});
test("unresolved labels, reused identities/receipts and missing conflicts/expertise cannot substitute for expert adjudication",()=>{
 for(const mutate of [(g:typeof TEST_GOLD)=>{g.assessments[1].reviewerRef=g.assessments[0].reviewerRef},(g:typeof TEST_GOLD)=>{g.assessments[1].receiptId=g.assessments[0].receiptId},(g:typeof TEST_GOLD)=>{g.adjudication.decision="disputed" as never},(g:typeof TEST_GOLD)=>{g.assessments[0].conflictsDeclared=false as never}]){const g=structuredClone(TEST_GOLD);mutate(g);expect(()=>validatePrivateGold(g)).toThrow()}
});

test("public structured-gold tripwire rejects nested payloads but permits empty legacy slots",()=>{
 expect(()=>assertNoStructuredBenchmarkGold({legacy:{expertReferenceAssessment:{payload:null}}})).not.toThrow();
 for(const payload of [{goldRationale:"private"},{nested:[{acceptableAnswer:"heldout"}]},{expertReferenceAssessment:{payload:{answer:"sealed"}}}])expect(()=>assertNoStructuredBenchmarkGold(payload)).toThrow("public artifact");
});

test("legacy intake preserves its question and single alias but never imports a prior score or gold payload",async()=>{
 const {adaptLegacyImmunoCase}=await import("../src/evidence/immunoBenchmark"),{REPRESENTATIVE_WALKTHROUGH_QUESTIONS}=await import("../src/evidence/independentEvaluationSuites");
 const c=fixtureCases()[0]!,{researchQuestion,aliases,...enrichment}=c,legacy=REPRESENTATIVE_WALKTHROUGH_QUESTIONS[0]!;
 const adapted=adaptLegacyImmunoCase({namespace:"independent_evaluation",row:legacy},enrichment);expect(adapted.researchQuestion).toBe(legacy.question);expect(adapted.aliases).toEqual([{namespace:"independent_evaluation",id:legacy.questionId}]);expect(adapted.gold).toEqual(enrichment.gold);
});
