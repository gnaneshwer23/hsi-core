import {describe,expect,it} from "bun:test";
import {searchSscLiterature} from "../src/evidence/europePmcSscDiscovery";

describe("ISI SSc literature discovery",()=>{
 const fixed = () => new Date("2026-11-04T19:00:00.000Z");
 it("retrieves metadata with provenance but never marks claims as supported",async()=>{
  let requested="";
  const fetcher=async(input:RequestInfo|URL)=>{
   requested=String(input);
   return new Response(JSON.stringify({
    hitCount:1,nextCursorMark:"next",
    resultList:{result:[{id:"30760472",source:"MED",pmid:"30760472",doi:"10.1136/annrheumdis-2018-214382",title:"Study of Tfh cells",pubYear:"2019",abstractText:"An observational study."}]}
   }),{status:200,headers:{"content-type":"application/json"}});
  };
  const result=await searchSscLiterature({fetcher:fetcher as typeof fetch,now:fixed});
  expect(requested).toContain("europepmc");
  expect(new URL(requested).searchParams.get("resultType")).toBe("core");
  expect(result.totalHits).toBe(1);
  expect(result.records[0]).toMatchObject({
   pmid:"30760472",reviewState:"unreviewed",
   verificationState:"metadata_retrieved_not_claim_verified",
   publicationYear:2019,retrievedAt:"2026-11-04T19:00:00.000Z"
  });
  expect(result.records[0]?.url).toBe("https://europepmc.org/article/MED/30760472");
 });
 it("rejects invalid page size before network access",async()=>{
  expect(searchSscLiterature({pageSize:1001})).rejects.toThrow("Invalid literature page size");
 });
 it("fails closed on upstream errors",async()=>{
  const fetcher=async()=>new Response("failure",{status:503});
  expect(searchSscLiterature({fetcher:fetcher as typeof fetch})).rejects.toThrow("HTTP 503");
 });
 it("rejects malformed API responses",async()=>{
  const fetcher=async()=>new Response(JSON.stringify({hitCount:1}),{status:200});
  expect(searchSscLiterature({fetcher:fetcher as typeof fetch})).rejects.toThrow("result list missing");
 });
});
