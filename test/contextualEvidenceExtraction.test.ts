import {describe,expect,test} from "bun:test";
import {selectPublicEvidenceExcerpt} from "../src/contextualEvidenceExtraction";
import type {ResearchSource,ResearchPassage} from "../src/researchContracts";
const source:ResearchSource={
 id:"pmid-123",title:"Tfh cells and systemic sclerosis",kind:"publication",
 dataClass:"public_real",pmid:"123",doi:null,url:"https://pubmed.ncbi.nlm.nih.gov/123/",
 licence:{status:"permitted",identifier:"test-permission",passageUsePermitted:true},
 provenance:{product:"hsi",datasetId:"pubmed-pmid-123",version:"abstract-v1",retrievedAt:"2026-11-11T00:00:00.000Z"}
};
const passage:ResearchPassage={id:"passage-1",sourceId:"pmid-123",sourceVersion:"abstract-v1",
 text:"IL-21 was measured; causality was not established.",locator:"abstract:0",dataClass:"public_real",sha256:null};
describe("B-03 evidence excerpt safety boundary",()=>{
 test("returns exact source span without interpreting the claim",()=>{
  const item=selectPublicEvidenceExcerpt(source,passage,0,18);
  expect(item.exactText).toBe(passage.text.slice(0,18));
  expect(item.interpretation).toBe("unassessed");
  expect(item.reviewStatus).toBe("unreviewed");
  expect(item.context.species).toBe("unknown");
  expect(item.context.outcome).toBeNull();
 });
 test("rejects unlicensed passage reuse",()=>{
  expect(()=>selectPublicEvidenceExcerpt({...source,licence:{...source.licence,passageUsePermitted:false}},passage,0,5)).toThrow();
 });
 test("rejects mismatched provenance and private data",()=>{
  expect(()=>selectPublicEvidenceExcerpt(source,{...passage,sourceVersion:"other"},0,5)).toThrow();
  expect(()=>selectPublicEvidenceExcerpt(source,{...passage,dataClass:"licensed_real"},0,5)).toThrow();
 });
 test("rejects invalid and empty offsets",()=>{
  for(const [start,end] of [[-1,2],[0,999],[4,4],[1.5,3],[18,19]])
   if(start<0||end>passage.text.length||end<=start||!Number.isInteger(start))
    expect(()=>selectPublicEvidenceExcerpt(source,passage,start,end)).toThrow();
  expect(()=>selectPublicEvidenceExcerpt(source,{...passage,text:"   "},0,3)).toThrow();
 });
});
