import {describe,it,expect} from "bun:test";
import {europePmcAdapter,openTargetsAdapter} from "../src/researchV2/sourceAdapters";
describe("B-04.2 public adapters",()=>{
 it("normalizes Europe PMC metadata without granting text reuse",async()=>{
  const fake=(async()=>new Response(JSON.stringify({resultList:{result:[{source:"MED",id:"123",pmid:"123",title:"Study"}]}}),{status:200}));
  const rows=await europePmcAdapter(fake).search(["rheumatoid arthritis","lupus"]);
  expect(rows[0]?.canonicalId).toBe("PMID:123");
  expect(rows[0]?.passageUsePermitted).toBe(false);
 });
 it("rejects unnormalized Open Targets disease names",async()=>{
  await expect(openTargetsAdapter().search(["lupus"])).rejects.toThrow();
 });
 it("normalizes Open Targets associations without claiming causality",async()=>{
  const fake=(async()=>new Response(JSON.stringify({data:{disease:{name:"Example",associatedTargets:{rows:[{target:{id:"ENSG0001",approvedSymbol:"GENE"},score:0.8}]}}}}),{status:200}));
  const rows=await openTargetsAdapter(fake).search(["EFO_0001"]);
  expect(rows[0]?.metadata.associationNotCausality).toBe(true);
  expect(rows[0]?.passageUsePermitted).toBe(false);
 });
});
