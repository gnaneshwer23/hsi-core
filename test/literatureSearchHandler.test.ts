import {beforeEach,describe,expect,test} from "bun:test";
import {buildSscLiteratureQuery,handleLiteratureSearch,resetLiteratureSearchLimiter,SSC_LITERATURE_SCOPE} from "../src/server/literatureSearchHandler";

const epmc=(over:{status?:number;body?:unknown}={})=>new Response(JSON.stringify(over.body??{
 hitCount:1,nextCursorMark:"*",
 resultList:{result:[{id:"111",source:"MED",pmid:"111",doi:"10.1/abc",title:"IL-21 in systemic sclerosis",authorString:"A",journalTitle:"J",pubYear:"2020",isRetracted:"N"}]},
}),{status:over.status??200,headers:{"content-type":"application/json"}});

beforeEach(()=>resetLiteratureSearchLimiter());

describe("literature search handler",()=>{
 test("builds the SSc scope query and optional refine term",()=>{
  expect(buildSscLiteratureQuery("")).toBe(SSC_LITERATURE_SCOPE);
  expect(buildSscLiteratureQuery(" plasmablast ")).toContain("plasmablast");
  expect(buildSscLiteratureQuery("bad(quote)")).toContain("AND (bad quote )");
  expect(buildSscLiteratureQuery("bad(quote)")).not.toContain("bad(quote)");
 });

 test("proxies Europe PMC through the server and never trusts a foreign origin",async()=>{
  let seen="";
  const fetcher=(async(u:any)=>{seen=String(u);return epmc()}) as any;
  const r=await handleLiteratureSearch(new Request("https://hsi.example/api/research/literature-search"),{},{fetcher});
  const b:any=await r.json();
  expect(r.status).toBe(200);expect(b.records[0].title).toContain("IL-21");expect(b.records[0].url).toContain("europepmc.org");
  expect(seen).toContain("ebi.ac.uk/europepmc");expect(seen).toContain("cursorMark");
  const forbidden=await handleLiteratureSearch(new Request("https://hsi.example/api/research/literature-search",{headers:{origin:"https://evil.example"}}),{HSI_PUBLIC_ORIGIN:"https://hsi.example"},{fetcher});
  expect(forbidden.status).toBe(403);
  expect(await forbidden.json()).toMatchObject({code:"ORIGIN_NOT_ALLOWED"});
 });

 test("provider failures stay 502 and do not look like zero hits",async()=>{
  const fetcher=(async()=>epmc({status:503,body:{}})) as any;
  const r=await handleLiteratureSearch(new Request("https://hsi.example/api/research/literature-search"),{},{fetcher});
  expect(r.status).toBe(502);expect(await r.json()).toMatchObject({code:"RETRIEVAL_UNAVAILABLE",error:expect.stringContaining("unavailable")});
 });

 test("rejects control characters in the refine term before provider work",async()=>{
  let calls=0;const fetcher=(async()=>{calls++;return epmc()}) as any;
  const r=await handleLiteratureSearch(new Request("https://hsi.example/api/research/literature-search?term=foo%0Abar"),{},{fetcher});
  expect(r.status).toBe(400);expect(await r.json()).toMatchObject({code:"INVALID_SEARCH_TERM",error:"Invalid search term"});expect(calls).toBe(0);
 });
});
