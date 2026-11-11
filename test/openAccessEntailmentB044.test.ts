import {describe,it,expect} from "bun:test";
import {retrieveOpenAccessExcerpt} from "../src/researchV2/openAccessPassages";
import {runModelEntailment} from "../src/researchV2/modelEntailment";
import type {EvidenceClaim} from "../src/researchV2/passageVerification";
const xml='<article><front><article-meta><permissions><license>https://creativecommons.org/licenses/by/4.0/</license></permissions><abstract><p>Human cells expressed the marker in the sampled tissue.</p></abstract></article-meta></front></article>';
const fetcher=async()=>new Response(xml,{headers:{"content-type":"application/xml"}});
const claim:EvidenceClaim={id:"claim1",sourceId:"europepmc:MED:123",exactQuote:"Human cells expressed the marker in the sampled tissue.",subjectId:"CL:1",predicate:"expressed_in",objectId:"UBERON:1",context:{diseaseIds:["EFO_1"],species:"human",tissueId:"UBERON:1",cellId:"CL:1",method:null}};
describe("B-04.4 OA passage and model execution gates",()=>{
 it("retrieves bounded open access excerpt but never self-certifies reuse rights",async()=>{
  const x=await retrieveOpenAccessExcerpt("PMC123",fetcher);
  expect(x.passage).toContain("Human cells");expect(x.licenceUrl).toContain("creativecommons.org");
  expect(x.reuseRightsVerified).toBe(false);expect(x.correctionStatusVerified).toBe(false);
 });
 it("rejects entity-bearing XML",async()=>{
  const bad=async()=>new Response('<!DOCTYPE foo><article/>',{headers:{"content-type":"application/xml"}});
  expect(retrieveOpenAccessExcerpt("PMC123",bad)).rejects.toThrow();
 });
 it("executes an injected entailment model but rejects invented quote support",async()=>{
  const input={claim,passage:claim.exactQuote,sourceId:claim.sourceId};
  const a=await runModelEntailment(input,"critic1","modelA",async()=>({verdict:"supports",evidenceSpan:"invented",reason:"bad"}));
  expect(a.verdict).toBe("insufficient");
  const b=await runModelEntailment(input,"critic2","modelB",async()=>({verdict:"supports",evidenceSpan:"Human cells expressed",reason:"supported"}));
  expect(b.verdict).toBe("supports");
 });
});
