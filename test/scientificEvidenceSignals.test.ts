import {describe,it,expect} from "bun:test";
import {extractAbstractEvidenceSignals} from "../src/scientificEvidenceSignals";
describe("v2.4 disease-agnostic evidence signal triage",()=>{
 it("preserves exact sentences and original source offsets",()=>{
  const abstract="We measured expression using RNA-seq in human patients. Results showed increased expression in the cohort.";
  const result=extractAbstractEvidenceSignals("12345",abstract);
  expect(result.length).toBe(2);
  for(const x of result){
   expect(abstract.slice(x.start,x.end)).toBe(x.sentence);
   expect(x.reviewStatus).toBe("candidate_unreviewed");
   expect(x.interpretation).toBe("author_text_not_independently_verified");
  }
  expect(result[0]?.context.methods).toContain("rna-seq");
  expect(result[1]?.signal).toBe("reported_result");
 });
 it("works for unrelated biological questions without disease-specific terms",()=>{
  const r=extractAbstractEvidenceSignals("22","The prospective cohort of patients showed improved survival.");
  expect(r[0]?.context.studyDesign).toContain("prospective");
  expect(r[0]?.context.outcomes).toContain("survival");
 });
 it("does not fabricate evidence for empty or unclassifiable abstracts",()=>{
  expect(extractAbstractEvidenceSignals("22",null)).toEqual([]);
  expect(extractAbstractEvidenceSignals("22","A neutral background statement about biology.")).toEqual([]);
 });
 it("rejects invalid identifiers",()=>{
  expect(()=>extractAbstractEvidenceSignals("bad","Patients showed increased risk.")).toThrow();
 });
});
