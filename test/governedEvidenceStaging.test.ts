import {describe,expect,test} from "bun:test";
import {retrieveBiomedicalSourceBundle} from "../src/evidence/biomedicalSourceBundle";
import {stageBiomedicalEvidenceBundle} from "../src/evidence/governedEvidenceStaging";
import type {FetchLike} from "../src/fetchLike";
const fetcher:FetchLike=async input=>String(input).includes("uniprot")
 ?new Response(JSON.stringify({primaryAccession:"P01375",
  proteinDescription:{recommendedName:{fullName:{value:"Tumor necrosis factor"}}}}),{status:200})
 :new Response(JSON.stringify({stId:"R-HSA-199420",displayName:"TNF signaling",
  schemaClass:"Pathway"}),{status:200});
describe("P1.3 governed evidence staging",()=>{
 test("creates deterministic draft snapshot with review pending",async()=>{
  const bundle=await retrieveBiomedicalSourceBundle({
    proteinAccession:"P01375",reactomeStableId:"R-HSA-199420",fetcher});
  const a=stageBiomedicalEvidenceBundle(bundle);
  const b=stageBiomedicalEvidenceBundle(bundle);
  expect(a.ok).toBe(true);
  expect(b.ok).toBe(true);
  if(!a.ok||!b.ok)return;
  expect(a.snapshot.contentSha256).toMatch(/^[a-f0-9]{64}$/);
  expect(a.snapshot.snapshotId).toBe(b.snapshot.snapshotId);
  expect(a.snapshot.persisted).toBe(false);
  expect(a.snapshot.scientificApproval).toBe(false);
  expect(a.reviewQueueItem.authenticatedReviewerId).toBeNull();
 });
 test("rejects missing source provenance",async()=>{
  const bundle=await retrieveBiomedicalSourceBundle({
    proteinAccession:"P01375",reactomeStableId:"R-HSA-199420",fetcher});
  expect(bundle.ok).toBe(true);
  if(!bundle.ok)return;
  const bad={...bundle,sourceUrls:["not-a-url",bundle.sourceUrls[1]!]};
  const result=stageBiomedicalEvidenceBundle(bad);
  expect(result.ok).toBe(false);
  if(!result.ok)expect(result.reason).toBe("invalid_provenance");
 });
 test("rejects failed bundles",()=>{
  const result=stageBiomedicalEvidenceBundle({ok:false,stage:"uniprot",detail:"down"});
  expect(result.ok).toBe(false);
 });
});
