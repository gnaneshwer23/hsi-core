import type {FetchLike} from "../src/fetchLike";
import {describe,expect,test} from "bun:test";
import {verifyLiveBiomedicalProviders} from "../src/evidence/liveProviderVerification";
const response=(data:unknown)=>new Response(JSON.stringify(data),{status:200});
const fetcher:FetchLike=async(input)=>{
  const url=String(input);
  if(url.includes("uniprotkb"))return response({
    primaryAccession:"P01375",proteinDescription:{recommendedName:{fullName:{value:"Tumor necrosis factor"}}},
    organism:{scientificName:"Homo sapiens",taxonId:9606},
  });
  return response({stId:"R-HSA-199420",displayName:"Example pathway",
    schemaClass:"Pathway",species:[{displayName:"Homo sapiens"}]});
};
describe("Phase 9.2 provider verification contracts",()=>{
  test("accepts both draft-only provider records",async()=>{
    const result=await verifyLiveBiomedicalProviders({
      proteinAccession:"P01375",reactomeStableId:"R-HSA-199420",fetcher,
    });
    expect(result.allPassed).toBe(true);
    expect(result.scientificValidationComplete).toBe(false);
    expect(result.checks).toHaveLength(2);
    expect(result.checks.every(c=>c.draftOnly&&!c.scientificClaimVerified)).toBe(true);
  });
  test("fails closed on provider outage",async()=>{
    const result=await verifyLiveBiomedicalProviders({
      proteinAccession:"P01375",reactomeStableId:"R-HSA-199420",
      fetcher:async()=>new Response("upstream failure",{status:503}),
    });
    expect(result.allPassed).toBe(false);
    expect(result.checks.every(c=>!c.ok)).toBe(true);
  });
  test("rejects source identity mismatch",async()=>{
    const result=await verifyLiveBiomedicalProviders({
      proteinAccession:"P01375",reactomeStableId:"R-HSA-199420",
      fetcher:async(input)=>{
        if(String(input).includes("uniprotkb"))return response({
          primaryAccession:"P99999",proteinDescription:{recommendedName:{fullName:{value:"Other protein"}}},
        });
        return response({stId:"R-HSA-199420",displayName:"Example pathway",schemaClass:"Pathway"});
      },
    });
    expect(result.allPassed).toBe(false);
    expect(result.checks.find(c=>c.provider==="uniprotkb")?.ok).toBe(false);
  });
});
