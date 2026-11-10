import {describe,expect,test} from "bun:test";
import {retrieveBiomedicalSourceBundle} from "../src/evidence/biomedicalSourceBundle";
import type {FetchLike} from "../src/fetchLike";
const fetcher:FetchLike=async input=>{
 const url=String(input);
 return url.includes("uniprot")
 ?new Response(JSON.stringify({primaryAccession:"P01375",
    proteinDescription:{recommendedName:{fullName:{value:"Tumor necrosis factor"}}},
    organism:{scientificName:"Homo sapiens",taxonId:9606}}),{status:200})
 :new Response(JSON.stringify({stId:"R-HSA-199420",displayName:"TNF signaling",
    schemaClass:"Pathway",species:{displayName:"Homo sapiens"}}),{status:200});
};
describe("P1.2 biomedical source bundle",()=>{
 test("returns two unreviewed metadata nodes without inferred relationships",async()=>{
  const r=await retrieveBiomedicalSourceBundle({
    proteinAccession:"P01375",reactomeStableId:"R-HSA-199420",fetcher});
  expect(r.ok).toBe(true);
  if(!r.ok)return;
  expect(r.nodes).toHaveLength(2);
  expect(r.nodes.every(n=>n.reviewState==="draft")).toBe(true);
  expect(r.graphPersisted).toBe(false);
  expect(r.relationshipVerified).toBe(false);
  expect(r.scientificallyValidated).toBe(false);
 });
 test("fails closed if provider identifier does not match",async()=>{
  const bad:FetchLike=async input=>String(input).includes("uniprot")
    ?new Response(JSON.stringify({primaryAccession:"P00000",
      proteinDescription:{recommendedName:{fullName:{value:"Incorrect"}}}}),{status:200})
    :fetcher(input);
  const r=await retrieveBiomedicalSourceBundle({
    proteinAccession:"P01375",reactomeStableId:"R-HSA-199420",fetcher:bad});
  expect(r.ok).toBe(false);
  if(!r.ok)expect(r.stage).toBe("uniprot");
 });
});
