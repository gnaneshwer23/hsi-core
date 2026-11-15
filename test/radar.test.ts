import {describe,expect,test} from "bun:test";
import {buildRadar,ownPapers,renderDigestMarkdown,topicRadar,validTopic} from "../src/investigation/radar";
import {handleRadar,resetRadarLimiter} from "../src/server/radarHandler";

const ok=(b:unknown)=>new Response(JSON.stringify(b),{status:200});
const epmc={hitCount:42,resultList:{result:[{id:"1",source:"MED",pmid:"1",doi:"10.1/a",title:"<i>IL-21</i> in lupus",firstPublicationDate:"2026-11-09",journalTitle:"Autoimmunity",pubTypeList:{pubType:["Journal Article"]},citedByCount:7},{id:"2",source:"PPR",title:"Preprint on IL-21",firstPublicationDate:"2026-11-08",pubTypeList:{pubType:["Retracted Publication"]}},{id:3}]}};
const oaTrend={group_by:[{key:"2024",count:400},{key:"2026",count:120},{key:"bad",count:9}]};
const oaWorks={results:[{id:"https://openalex.org/W1",doi:"https://doi.org/10.1/own",title:"My paper",publication_date:"2025-01-01",ids:{pmid:"https://pubmed.ncbi.nlm.nih.gov/55"},primary_location:{source:{display_name:"Nature"}},cited_by_count:12,is_retracted:false,type:"article"},{id:"https://evil.test/W2",title:"x"}]};
function fakeFetch(o:{epmcFail?:boolean;oaFail?:boolean}={}){
 const calls:string[]=[];
 const f=(async(u:any)=>{const url=String(u);calls.push(url);
  if(url.includes("europepmc"))return o.epmcFail?new Response("x",{status:503}):ok(url.includes("EXT_ID")||url.includes("DOI")?{resultList:{result:[{id:"9",source:"MED",pmid:"9",doi:"10.1/p",title:"Pasted paper",firstPublicationDate:"2020-02-02",citedByCount:3}]}}:epmc);
  if(url.includes("openalex")&&url.includes("group_by"))return o.oaFail?new Response("x",{status:500}):ok(oaTrend);
  if(url.includes("openalex"))return o.oaFail?new Response("x",{status:500}):ok(oaWorks);
  return new Response("?",{status:404});}) as any;
 return {f,calls};
}
const window={from:"2026-11-08",to:"2026-11-15"};

describe("research radar",()=>{
 test("a topic returns new papers with provenance, strips markup, flags retractions and builds a 10-year trend with zeros filled",async()=>{
  const {f,calls}=fakeFetch();const r=await topicRadar("IL-21",window,f);
  expect(r).toMatchObject({status:"ok",newCount:42,error:null});expect(r.papers.length).toBe(2);
  expect(r.papers[0]).toMatchObject({title:"IL-21 in lupus",doi:"10.1/a",journal:"Autoimmunity",retraction:"not_flagged_by_provider",preprint:false});
  expect(r.papers[1]).toMatchObject({preprint:true,retraction:"flagged"});
  expect(r.trend!.length).toBe(10);expect(r.trend!.find(x=>x.year===2024)!.count).toBe(400);expect(r.trend!.find(x=>x.year===2025)!.count).toBe(0);
  expect(calls.some(c=>c.includes("title_and_abstract.search"))).toBe(true);           // phrase match, not a tokenised search
  expect(calls.find(c=>c.includes("europepmc"))!).toContain("FIRST_PDATE");
 });
 test("a failed source is reported as failed, never as nothing new; a failed trend does not hide the papers",async()=>{
  const bad=await topicRadar("IL-21",window,fakeFetch({epmcFail:true}).f);
  expect(bad.status).toBe("failed");expect(bad.error).toContain("503");expect(bad.papers).toEqual([]);expect(bad.newCount).toBe(0);
  const half=await topicRadar("IL-21",window,fakeFetch({oaFail:true}).f);
  expect(half.status).toBe("ok");expect(half.papers.length).toBe(2);expect(half.trend).toBeNull();expect(half.trendError).toContain("500");
 });
 test("own papers: ORCID through OpenAlex (foreign ids dropped), pasted ids through Europe PMC, junk and misses reported",async()=>{
  const {f}=fakeFetch();
  const r=await ownPapers({orcid:"0000-0002-1825-0097",ids:["doi:10.1234/p","pmid:9","pmid:12abc","garbage"]},f);
  expect(r.status).toBe("ok");expect(r.papers.map(p=>p.title)).toEqual(["My paper","Pasted paper"]);   // pmid:9 duplicates the DOI paper
  expect(r.papers[0]).toMatchObject({citedBy:12,journal:"Nature",pmid:"55"});expect(r.unresolved).toEqual(["pmid:12abc","garbage"]);
  expect((await ownPapers({orcid:null,ids:[]},f)).status).toBe("not_requested");
 });
 test("the digest is Markdown with escaped titles, the partial-year note and the limits",async()=>{
  const r=await buildRadar({topics:["IL-21"],days:7,orcid:null,paperIds:[]},fakeFetch().f,()=>new Date("2026-11-15T10:00:00Z"));
  expect(r.window).toEqual({days:7,from:"2026-11-08",to:"2026-11-15"});
  const md=renderDigestMarkdown({...r,topics:[{...r.topics[0]!,papers:[{...r.topics[0]!.papers[0]!,title:"Bad [x](http://evil) <script>"}]}]});
  expect(md).toContain("latest year is partial");expect(md).toContain("not clinical advice");expect(md).not.toContain("<script>");expect(md).not.toContain("](http://evil)");
 });
 test("topic validation",()=>{expect(validTopic("IL-21")).toBe(true);for(const t of ["","a","x".repeat(81),'say "hi"',"a\nb",5,null])expect(validTopic(t as any)).toBe(false)});
});

describe("radar endpoint",()=>{
 const post=(b:unknown,h:Record<string,string>={})=>new Request("https://x.test/api/research/radar",{method:"POST",headers:{"content-type":"application/json","x-forwarded-for":"9.9.9.9",...h},body:typeof b==="string"?b:JSON.stringify(b)});
 test("validates input strictly",async()=>{
  resetRadarLimiter();const f=fakeFetch().f;
  const st=async(b:unknown,h?:any)=>(await handleRadar(post(b,h),{},{fetcher:f})).status;
  expect(await st({topics:["IL-21"],days:7})).toBe(200);
  expect(await st({topics:[],days:7})).toBe(400);expect(await st({topics:Array(6).fill("ab").map((x,i)=>x+i),days:7})).toBe(400);
  expect(await st({topics:["IL-21","il-21"],days:7})).toBe(400);expect(await st({topics:["IL-21"],days:5})).toBe(400);
  expect(await st({topics:[],days:7,orcid:"nope"})).toBe(400);expect(await st({topics:["IL-21"],days:7,papers:Array(21).fill("pmid:1")})).toBe(400);
  expect(await st("{bad")).toBe(400);expect(await st({topics:["x".repeat(81)],days:7})).toBe(400);
  expect((await handleRadar(new Request("https://x.test/a"),{})).status).toBe(405);
  expect((await handleRadar(new Request("https://x.test/a",{method:"POST",body:"x"}),{})).status).toBe(415);
  expect(await st({topics:["IL-21"],days:7},{origin:"https://evil.test"})).toBe(200);
  expect((await handleRadar(post({topics:["IL-21"],days:7},{origin:"https://evil.test"}),{HSI_PUBLIC_ORIGIN:"https://x.test"},{fetcher:f})).status).toBe(403);
 });
 test("rate limits and never echoes the ORCID back in errors",async()=>{
  resetRadarLimiter();const f=fakeFetch().f;let last=200;
  for(let i=0;i<21;i++)last=(await handleRadar(post({topics:["IL-21"],days:7}),{},{fetcher:f})).status;
  expect(last).toBe(429);
  resetRadarLimiter();
  const r=await handleRadar(post({topics:[],days:7,orcid:"0000-0002-1825-0097"}),{},{fetcher:fakeFetch({oaFail:true}).f});
  const body=await r.text();expect(body).not.toContain("0000-0002-1825-0097");
 });
});
