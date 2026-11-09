import type { FetchLike } from "../src/fetchLike";
import { test, expect } from "bun:test";
import { fetchEuropePmcMetadata, parseEuropePmcMetadata } from "../src/evidenceIngestion";
const record = {resultList:{result:[{id:"30760472",source:"MED",title:"Tfh and systemic sclerosis",doi:"10.1136/example",journalTitle:"Journal",firstPublicationDate:"2019-01-01"}]}};
test("parses public metadata without asserting claim support",()=>{
 const result=parseEuropePmcMetadata("30760472",record,"2026-11-04T12:00:00.000Z");
 expect(result.licence_status).toBe("metadata_only");
 expect(result.retraction_status).toBe("unknown");
 expect(result.metadata.recordHash).toHaveLength(64);
});
test("rejects provider PMID mismatch",()=>{
 expect(()=>parseEuropePmcMetadata("123",record,"2026-11-04T12:00:00.000Z")).toThrow("identity mismatch");
});
test("rejects invalid PMID before network",async()=>{
 await expect(fetchEuropePmcMetadata("123;DROP")).rejects.toThrow("Invalid PMID");
});
test("handles provider HTTP failures",async()=>{
 const mock = (async()=>new Response("",{status:503})) as FetchLike;
 await expect(fetchEuropePmcMetadata("30760472",mock)).rejects.toThrow("HTTP 503");
});
