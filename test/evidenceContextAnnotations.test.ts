import {describe,expect,test} from "bun:test";
import {annotateEvidenceContext} from "../src/evidenceContextAnnotations";
import {selectPublicEvidenceExcerpt} from "../src/contextualEvidenceExtraction";
import type {ResearchPassage,ResearchSource} from "../src/researchContracts";
const s:ResearchSource={id:"pmid-1",title:"Example",kind:"publication",dataClass:"public_real",pmid:"1",doi:null,url:null,licence:{status:"permitted",identifier:"example",passageUsePermitted:true},provenance:{product:"hsi",datasetId:"dataset-1",version:"v1",retrievedAt:"2026-11-11T00:00:00.000Z"}};
const p:ResearchPassage={id:"passage-1",sourceId:"pmid-1",sourceVersion:"v1",text:"human fibroblasts measured IL-21",locator:"abstract:0",dataClass:"public_real",sha256:null};
const e=selectPublicEvidenceExcerpt(s,p,0,p.text.length);
describe("B-03.2 candidate context annotations",()=>{
 test("retains exact evidence offsets and candidate status",()=>{
  const a=annotateEvidenceContext(e,"tissue","fibroblasts",6,17);
  expect(a.exactText).toBe("fibroblasts");
  expect(a.status).toBe("candidate");
  expect(a.sourceId).toBe(p.sourceId);
 });
 test("rejects unsupported inference and mismatched spans",()=>{
  expect(()=>annotateEvidenceContext(e,"outcome","reduced inflammation",0,5)).toThrow();
  expect(()=>annotateEvidenceContext(e,"tissue","fibroblasts",-1,17)).toThrow();
  expect(()=>annotateEvidenceContext(e,"species","human",0,5)).not.toThrow();
  expect(()=>annotateEvidenceContext(e,"species","mouse",0,5)).toThrow();
 });
});
