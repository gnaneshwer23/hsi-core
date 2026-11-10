import {describe,expect,test} from "bun:test";
import {CROSS_IMMUNOLOGY_BENCHMARK,assessCrossImmunologyBenchmark} from "../src/evidence/crossImmunologyBenchmark";
const pass=(caseId:string)=>({
  caseId,sourceProvenanceVerified:true,biologicalContextSeparated:true,
  uncertaintyDisclosed:true,reviewGateEnforced:true,hypothesisFalsifiable:true,
});
describe("Phase 9.4 cross-immunology benchmark",()=>{
  test("covers three distinct immunology domains",()=>{
    expect(new Set(CROSS_IMMUNOLOGY_BENCHMARK.map(c=>c.domain)).size).toBe(3);
    expect(CROSS_IMMUNOLOGY_BENCHMARK.every(c=>c.scientificGoldStandard==="pending_independent_expert_review")).toBe(true);
  });
  test("does not claim scientific validation from technical checks",()=>{
    const result=assessCrossImmunologyBenchmark(CROSS_IMMUNOLOGY_BENCHMARK.map(c=>pass(c.id)));
    expect(result.readyForExpertReview).toBe(true);
    expect(result.scientificallyValidated).toBe(false);
  });
  test("rejects missing case coverage",()=>{
    const result=assessCrossImmunologyBenchmark([pass(CROSS_IMMUNOLOGY_BENCHMARK[0]!.id)]);
    expect(result.readyForExpertReview).toBe(false);
    expect(result.missingCaseIds).toHaveLength(2);
  });
  test("rejects unsupported evidence provenance",()=>{
    const result=assessCrossImmunologyBenchmark(CROSS_IMMUNOLOGY_BENCHMARK.map((c,i)=>({
      ...pass(c.id),sourceProvenanceVerified:i!==1,
    })));
    expect(result.readyForExpertReview).toBe(false);
    expect(result.failedCaseIds).toContain(CROSS_IMMUNOLOGY_BENCHMARK[1]!.id);
  });
  test("does not accept self-declared reviewer approval",()=>{
    const result=assessCrossImmunologyBenchmark(CROSS_IMMUNOLOGY_BENCHMARK.map(c=>({
      ...pass(c.id),independentReviewerId:"expert-reviewer-1",
      independentReviewerDecision:"accepted" as const,reviewerNotes:"Evidence reviewed independently",
    })));
    expect(result.scientificallyValidated).toBe(false);
  });
  test("rejects duplicate assessments",()=>{
    expect(()=>assessCrossImmunologyBenchmark([
      pass(CROSS_IMMUNOLOGY_BENCHMARK[0]!.id),pass(CROSS_IMMUNOLOGY_BENCHMARK[0]!.id),
    ])).toThrow();
  });
});
