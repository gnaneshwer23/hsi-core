import {describe,expect,it} from "bun:test";
import {triageResearchQuestion} from "../src/scientificDiscoveryQuestionTriage";
describe("scientific discovery v2 question triage",()=>{
 it("never treats a new SSc question as an executed investigation",()=>{
  const result=triageResearchQuestion("How do Tfh cells and IL-21 affect B cells in systemic sclerosis fibrosis?");
  expect(result.state).toBe("evidence_not_retrieved");
  expect(result.domain).toBe("systemic_sclerosis");
  expect(result.concepts).toContain("IL-21");
  expect(result.eligibleFixture).toBeNull();
  expect(result.researchSubquestions.length).toBeGreaterThan(0);
 });
 it("only enables the exact curated question",()=>{
  const exact=triageResearchQuestion("How might gut microbial metabolites influence neuroinflammation?");
  expect(exact.state).toBe("curated_demo");
  expect(exact.eligibleFixture).toBe("gut-neuro");
  const changed=triageResearchQuestion("Do gut microbial metabolites cure neuroinflammation?");
  expect(changed.state).toBe("evidence_not_retrieved");
  expect(changed.eligibleFixture).toBeNull();
 });
 it("handles blank and unknown questions without inventing evidence",()=>{
  expect(triageResearchQuestion("   ").state).toBe("needs_question");
  const result=triageResearchQuestion("Which unexplored pathway should we test?");
  expect(result.domain).toBe("unclassified");
  expect(result.state).toBe("evidence_not_retrieved");
 });
});
