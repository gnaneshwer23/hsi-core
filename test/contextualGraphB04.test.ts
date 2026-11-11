import {describe,it,expect} from "bun:test";
import {buildCandidateGraph,sharedTargetCandidates} from "../src/researchV2/contextualGraph";
import type {PublicSourceRecord} from "../src/researchV2/sourceAdapters";
const record=(disease:string,target:string,score=0.8):PublicSourceRecord=>({
 sourceId:"opentargets:"+disease+":"+target,kind:"target_disease",canonicalId:target,
 sourceUrl:"https://platform.opentargets.org/disease/"+disease,
 retrievedAt:"2026-11-11T00:00:00Z",sourceVersion:"open-targets-graphql-v4",licenceId:null,
 passageUsePermitted:false,accessClass:"public",metadata:{diseaseId:disease,diseaseName:disease,targetSymbol:target,associationScore:score,associationNotCausality:true}
});
describe("B-04.3 candidate graph boundaries",()=>{
 it("compares RA/SLE/SSc associations without claiming a shared mechanism",()=>{
  const g=buildCandidateGraph([record("EFO_0000685","ENSG0001"),record("EFO_0002690","ENSG0001"),record("EFO_0000702","ENSG0001")]);
  expect(g.graphPromotable).toBe(false);
  expect(g.edges.every(e=>e.state==="extracted_candidate"&&e.context.tissueId===null&&e.review===null)).toBe(true);
  expect(sharedTargetCandidates(g,["EFO_0000685","EFO_0002690","EFO_0000702"])[0]?.interpretation).toBe("shared_association_candidate_not_mechanism");
 });
 it("rejects attempts to infer tissue or pathway mechanisms from metadata",()=>{
  const r=record("EFO_1","ENSG1");
  expect(()=>buildCandidateGraph([r],[{sourceId:r.sourceId,diseaseIds:["EFO_1"],tissueId:"UBERON:1",cellId:"CL:1",pathwayId:"R-HSA:1",species:"human",method:null,cohortId:null,timepoint:null,relationship:{subjectId:"CL:1",objectId:"R-HSA:1",predicate:"associated_with",note:"unsupported"}}])).toThrow("verified passage-level");
 });
 it("rejects duplicates and unbounded scores",()=>{
  const r=record("EFO_1","ENSG1");
  expect(()=>buildCandidateGraph([r,r])).toThrow();
  expect(()=>buildCandidateGraph([record("EFO_1","ENSG1",1.2)])).toThrow();
 });
 it("keeps public source and patient access boundaries separate",()=>{
  const r={...record("EFO_1","ENSG1"),accessClass:"restricted" as any};
  expect(()=>buildCandidateGraph([r])).toThrow();
 });
});
