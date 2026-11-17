import {describe,expect,test} from "bun:test";
import {
 fetchOpenAlexRelatedWorks,
 parseRelatedWorkSeed,
} from "../src/evidence/openAlexRelatedWorks";
import {handleRelatedWorks,resetRelatedWorksLimiter} from "../src/server/relatedWorksHandler";

const ok=(b:unknown)=>new Response(JSON.stringify(b),{status:200});

const seedWork={
 id:"https://openalex.org/W111",
 doi:"https://doi.org/10.1000/seed",
 title:"<b>Seed</b> paper on IL-21",
 publication_date:"2020-01-01",
 ids:{pmid:"https://pubmed.ncbi.nlm.nih.gov/12345"},
 primary_location:{source:{display_name:"Autoimmunity"}},
 cited_by_count:9,
 is_retracted:false,
 type:"article",
 related_works:[
  "https://openalex.org/W222",
  "https://openalex.org/W333",
  "https://evil.test/W999",
 ],
};
const relatedBatch={
 results:[
  {id:"https://openalex.org/W222",doi:"https://doi.org/10.1000/r1",title:"Related one",publication_date:"2019-06-01",ids:{},primary_location:{source:{display_name:"Nature"}},cited_by_count:3,is_retracted:false,type:"article"},
  {id:"https://openalex.org/W333",title:"Related two",publication_date:"2018-01-01",ids:{pmid:"https://pubmed.ncbi.nlm.nih.gov/99"},primary_location:null,cited_by_count:1,is_retracted:true,type:"preprint"},
  {id:"https://evil.test/W444",title:"Dropped"},
 ],
};

function fakeFetch(opts:{seedFail?:boolean;relatedFail?:boolean;emptySeed?:boolean}={}){
 const calls:string[]=[];
 const f=(async(u:any)=>{
  const url=String(u);calls.push(url);
  if(!url.includes("openalex.org"))return new Response("?",{status:404});
  // Related batch omits related_works from select and asks for W222/W333.
  const decoded=decodeURIComponent(url);
  if(decoded.includes("W222")&&!decoded.includes("related_works")){
   if(opts.relatedFail)return new Response("x",{status:500});
   return ok(relatedBatch);
  }
  if(opts.seedFail)return new Response("x",{status:503});
  if(opts.emptySeed)return ok({results:[]});
  return ok({results:[seedWork]});
 }) as any;
 return{f,calls};
}

describe("parseRelatedWorkSeed",()=>{
 test("accepts doi, pmid, openalex forms and rejects junk",()=>{
  expect(parseRelatedWorkSeed("doi:10.1000/xyz")).toEqual({kind:"doi",value:"10.1000/xyz"});
  expect(parseRelatedWorkSeed("10.1000/xyz")).toEqual({kind:"doi",value:"10.1000/xyz"});
  expect(parseRelatedWorkSeed("pmid:12345")).toEqual({kind:"pmid",value:"12345"});
  expect(parseRelatedWorkSeed("12345")).toEqual({kind:"pmid",value:"12345"});
  expect(parseRelatedWorkSeed("openalex:W123")).toEqual({kind:"openalex",value:"W123"});
  expect(parseRelatedWorkSeed("https://openalex.org/W123")).toEqual({kind:"openalex",value:"W123"});
  for(const bad of["",null,"doi:bad","pmid:12ab","openalex:X1","javascript:alert(1)","a".repeat(221)]){
   expect(parseRelatedWorkSeed(bad as any)).toBeNull();
  }
 });
});

describe("fetchOpenAlexRelatedWorks",()=>{
 test("resolves seed, strips markup, drops foreign ids, maps related metadata without abstracts",async()=>{
  const{f,calls}=fakeFetch();
  const r=await fetchOpenAlexRelatedWorks("doi:10.1000/seed",f,{limit:12});
  expect(r.status).toBe("ok");
  expect(r.seed).toMatchObject({title:"Seed paper on IL-21",doi:"10.1000/seed",pmid:"12345",sourceId:"openalex:W111"});
  expect(r.related.map(x=>x.sourceId)).toEqual(["openalex:W222","openalex:W333"]);
  expect(r.related[0]).toMatchObject({relation:"openalex_related_works",journal:"Nature",citedBy:3,preprint:false});
  expect(r.related[1]).toMatchObject({preprint:true,retraction:"flagged",pmid:"99"});
  expect(JSON.stringify(r)).not.toContain("abstract");
  expect(r.note).toMatch(/not an HSI co-citation graph/i);
  expect(calls.some(c=>c.includes("related_works")||c.includes("select="))).toBe(true);
  expect(calls.every(c=>!c.includes("abstract_inverted_index"))).toBe(true);
 });
 test("seed miss and provider failure stay honest",async()=>{
  expect((await fetchOpenAlexRelatedWorks("pmid:1",fakeFetch({emptySeed:true}).f)).status).toBe("seed_not_found");
  const failed=await fetchOpenAlexRelatedWorks("openalex:W1",fakeFetch({seedFail:true}).f);
  expect(failed.status).toBe("failed");
  expect(failed.error).toContain("503");
  const partial=await fetchOpenAlexRelatedWorks("doi:10.1000/seed",fakeFetch({relatedFail:true}).f);
  expect(partial.status).toBe("ok");
  expect(partial.seed?.sourceId).toBe("openalex:W111");
  expect(partial.related).toEqual([]);
  expect(partial.error).toMatch(/Related works lookup failed/);
 });
 test("invalid seed fails closed",async()=>{
  const r=await fetchOpenAlexRelatedWorks("nope",fakeFetch().f);
  expect(r.status).toBe("failed");
  expect(r.error).toMatch(/Invalid seed/);
 });
});

describe("related-works endpoint",()=>{
 const post=(b:unknown,h:Record<string,string>={})=>new Request("https://x.test/api/research/related-works",{
  method:"POST",
  headers:{"content-type":"application/json","x-forwarded-for":"8.8.8.8",...h},
  body:typeof b==="string"?b:JSON.stringify(b),
 });
 test("validates input, origin, and rate limit",async()=>{
  resetRelatedWorksLimiter();
  const f=fakeFetch().f;
  expect((await handleRelatedWorks(post({seed:"doi:10.1000/seed"}),{},{fetcher:f})).status).toBe(200);
  expect((await handleRelatedWorks(post({seed:"bad"}),{},{fetcher:f})).status).toBe(400);
  expect((await handleRelatedWorks(post("{"),{},{fetcher:f})).status).toBe(400);
  expect((await handleRelatedWorks(new Request("https://x.test/a"),{})).status).toBe(405);
  expect((await handleRelatedWorks(new Request("https://x.test/a",{method:"POST",body:"x"}),{})).status).toBe(415);
  expect((await handleRelatedWorks(post({seed:"doi:10.1000/seed"},{origin:"https://evil.test"}),{HSI_PUBLIC_ORIGIN:"https://x.test"},{fetcher:f})).status).toBe(403);
  expect((await handleRelatedWorks(post({seed:"pmid:1"}),{},{fetcher:fakeFetch({emptySeed:true}).f})).status).toBe(404);
  resetRelatedWorksLimiter();
  let last=200;
  for(let i=0;i<21;i++)last=(await handleRelatedWorks(post({seed:"doi:10.1000/seed"}),{},{fetcher:f})).status;
  expect(last).toBe(429);
 });
 test("response never includes abstract fields",async()=>{
  resetRelatedWorksLimiter();
  const r=await handleRelatedWorks(post({seed:"openalex:W111"}),{},{fetcher:fakeFetch().f});
  const text=await r.text();
  expect(r.status).toBe(200);
  expect(text).not.toMatch(/abstract/i);
  expect(text).toContain("hsi-related-works-1");
 });
});
