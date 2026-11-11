import {describe,expect,test} from "bun:test";
import {discoverContextCandidates} from "../src/discoverEvidenceContext";
import {selectPublicEvidenceExcerpt} from "../src/contextualEvidenceExtraction";
import type {ResearchSource,ResearchPassage} from "../src/researchContracts";
const source:ResearchSource={id:"pmid-3",title:"Study",kind:"publication",dataClass:"public_real",pmid:"3",doi:null,url:null,licence:{status:"permitted",identifier:"reviewed",passageUsePermitted:true},provenance:{product:"hsi",datasetId:"dataset-3",version:"v1",retrievedAt:"2026-11-11T00:00:00.000Z"}};
function excerpt(text:string){
 const passage:ResearchPassage={id:"p3",sourceId:source.id,sourceVersion:"v1",text,locator:"abstract:0",dataClass:"public_real",sha256:null};
 return selectPublicEvidenceExcerpt(source,passage,0,text.length);
}
describe("B-03.2 deterministic candidate extraction",()=>{
 test("discovers exact biological context phrases, preserving provenance",()=>{
  const e=excerpt("Flow cytometry in systemic sclerosis skin.");
  const result=discoverContextCandidates(e);
  expect(result.map(x=>x.field)).toEqual(["method","disease","tissue"]);
  expect(result.every(x=>x.status==="candidate"&&x.sourceId===e.sourceId)).toBe(true);
  expect(result.every(x=>e.exactText.slice(x.start,x.end)===x.exactText)).toBe(true);
 });
 test("does not infer causal or negative findings",()=>{
  const result=discoverContextCandidates(excerpt("IL-21 blockade did not improve outcomes."));
  expect(result.map(x=>x.field)).toEqual(["intervention"]);
  expect(result.some(x=>(x as any).causality||(x as any).approved)).toBe(false);
 });
 test("rejects partial words and duplicates",()=>{
  expect(discoverContextCandidates(excerpt("skinny lungs")).length).toBe(0);
  expect(discoverContextCandidates(excerpt("skin"),[{field:"tissue",phrase:"skin"},{field:"tissue",phrase:"skin"}]).length).toBe(1);
 });
 test("rejects invalid dictionary entries",()=>{
  expect(()=>discoverContextCandidates(excerpt("skin"),[{field:"tissue",phrase:" "}])).toThrow();
 });
});
