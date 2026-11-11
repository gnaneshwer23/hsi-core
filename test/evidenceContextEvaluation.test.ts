import {describe,expect,test} from "bun:test";
import {evaluateContextCandidates,type GoldContextSpan} from "../src/evidenceContextEvaluation";
import type {CandidateContextAnnotation} from "../src/evidenceContextAnnotations";
const gold:GoldContextSpan={sourceId:"pmid-1",passageId:"p-1",sourceVersion:"v1",field:"disease",start:0,end:18,exactText:"systemic sclerosis"};
const candidate:CandidateContextAnnotation={...gold,value:"systemic sclerosis",status:"candidate",method:"exact_span"};
describe("B-03.3 evidence context benchmark evaluator",()=>{
 test("perfect agreement",()=>{const r=evaluateContextCandidates([candidate],[gold]);expect([r.precision,r.recall,r.f1]).toEqual([1,1,1]);});
 test("counts false positives and missed annotations",()=>{
  const r=evaluateContextCandidates([{...candidate,field:"tissue"}],[gold]);
  expect([r.truePositives,r.falsePositives,r.falseNegatives,r.f1]).toEqual([0,1,1,0]);
 });
 test("rejects duplicates and invalid offsets",()=>{
  expect(()=>evaluateContextCandidates([candidate,candidate],[gold])).toThrow();
  expect(()=>evaluateContextCandidates([candidate],[gold,gold])).toThrow();
  expect(()=>evaluateContextCandidates([{...candidate,end:999}],[gold])).toThrow();
 });
 test("no predictions against a nonempty gold set has zero recall",()=>{
  const r=evaluateContextCandidates([],[gold]);
  expect(r.recall).toBe(0);expect(r.falseNegatives).toBe(1);
 });
});
