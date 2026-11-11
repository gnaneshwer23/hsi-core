import {describe,it,expect} from "bun:test";
import {annotateAbstract,retrieveAbstractContext} from "../src/scientificAbstractContext";
describe("v2.3 source-bound abstract context",()=>{
 it("labels mentions as unreviewed and does not assert causal findings",()=>{
  const terms=annotateAbstract("In systemic sclerosis, Tfh cells and IL-21 were studied alongside B cells and fibrosis.");
  expect(terms.map(x=>x.label)).toContain("IL-21");
  expect(terms.every(x=>x.status==="lexical_mention_only")).toBe(true);
 });
 it("binds annotations to a specific PubMed source and original abstract",async()=>{
  const mock=(async()=>new Response(JSON.stringify({resultList:{result:[{id:"12345",source:"MED",title:"A study",abstractText:"Tfh cells and IL-21 were measured in systemic sclerosis."}]}}))) as unknown as typeof fetch;
  const result=await retrieveAbstractContext("12345",mock);
  expect(result.reviewStatus).toBe("unreviewed");
  expect(result.pmid).toBe("12345");
  expect(result.candidates.some(x=>x.label==="IL-21")).toBe(true);
  expect(result.abstractText).toContain("measured");
 });
 it("does not invent findings when an abstract is absent",async()=>{
  const mock=(async()=>new Response(JSON.stringify({resultList:{result:[{id:"12345",source:"MED",title:"A study"}]}}))) as unknown as typeof fetch;
  const result=await retrieveAbstractContext("12345",mock);
  expect(result.availability).toBe("abstract_unavailable");
  expect(result.candidates).toEqual([]);
 });
 it("rejects malformed identifiers and upstream failures",async()=>{
  await expect(retrieveAbstractContext("123x")).rejects.toThrow();
  const mock=(async()=>new Response("error",{status:503})) as unknown as typeof fetch;
  await expect(retrieveAbstractContext("12345",mock)).rejects.toThrow("503");
 });
});
