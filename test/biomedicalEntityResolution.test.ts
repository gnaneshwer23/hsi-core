import {describe,expect,test} from "bun:test";
import {resolveBibliographicEntities} from "../src/biomedicalEntityResolution";
import type {ResearchSource} from "../src/researchContracts";
const source=(title:string,id="pmid-123"):ResearchSource=>({id,title,kind:"publication",dataClass:"public_real",pmid:"123",doi:null,url:"https://pubmed.ncbi.nlm.nih.gov/123/",licence:{status:"unknown",identifier:null,passageUsePermitted:false},provenance:{product:"hsi",datasetId:"pubmed-pmid-123",version:"bibliography-metadata-v1",retrievedAt:"2026-11-11T00:00:00.000Z"}});
describe("B-02 title mention resolution",()=>{
 test("finds curated aliases with provenance offsets",()=>{
  const s=source("Tfh cells and IL-21 in systemic sclerosis");
  const result=resolveBibliographicEntities([s]);
  expect(result.map(x=>x.termId)).toEqual(["HSI:Tfh","HSI:IL21","HSI:SSc"]);
  for(const m of result)expect(s.title.slice(m.start,m.end)).toBe(m.matchedText);
 });
 test("does not match partial biological tokens",()=>{
  expect(resolveBibliographicEntities([source("Non-B cellular changes in IL-210")])).toEqual([]);
 });
 test("does not infer entities absent from title",()=>{
  expect(resolveBibliographicEntities([source("Immune signatures in fibrosis")])).toEqual([]);
 });
 test("rejects private or non-public source data",()=>{
  expect(()=>resolveBibliographicEntities([{...source("IL-21"),dataClass:"synthetic"} as ResearchSource])).toThrow();
 });
});
