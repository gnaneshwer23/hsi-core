import {beforeEach,describe,expect,test} from "bun:test";
import {handleMethodsCompare,resetMethodsCompareLimiter} from "../src/server/methodsCompareHandler";
import {methodsText,parseSearch,OPEN_LICENCE} from "../src/methods/openAccess";

const xml=(m:string)=>`<article><body><sec sec-type="intro"><title>Introduction</title><p>Background text.</p></sec><sec sec-type="materials|methods"><title>Materials and methods</title><p>${m}</p></sec><sec sec-type="results"><title>Results</title><p>Cells were incubated for 99 h at 99 °C.</p></sec></body></article>`;
const A="Cells were cultured at 37 &#xb0;C. PBMCs were stimulated with anti-CD3 at 1 &#xb5;g/mL and IL-21 at 50 ng/mL for 72 h in complete medium with supplements and standard handling procedures. Reagents were purchased from standard suppliers and prepared fresh before each experiment according to the manufacturer instructions.";
const B="Cells were cultured at 37 °C. PBMCs were stimulated with anti-CD3 at 5 µg/mL and IL-21 at 50 ng/mL for 5 days in complete medium with supplements and standard handling procedures. Reagents were purchased from standard suppliers and prepared fresh before each experiment according to the manufacturer instructions.";
const search=(rs:unknown[])=>({resultList:{result:rs}});
const rec=(n:number,lic:string|undefined)=>({pmcid:"PMC"+(1000000+n),title:"Paper <i>"+n+"</i>",license:lic});
function fetcher(over:{rs?:unknown[];xml?:Record<string,string>;fail?:boolean}={}){
 const rs=over.rs??[rec(1,"cc by"),rec(2,"cc by"),rec(3,"cc by-nc"),rec(4,undefined)];
 return (async(u:any)=>{const url=String(u);
  if(over.fail)return new Response("no",{status:500});
  if(url.includes("/search"))return new Response(JSON.stringify(search(rs)),{status:200});
  const id=/PMC\d+/.exec(url)![0];const t=over.xml?.[id]??(id==="PMC1000001"?xml(A):id==="PMC1000002"?xml(B):"<article/>");return new Response(t,{status:200});
 }) as any;
}
const post=(b:unknown,h:Record<string,string>={})=>new Request("https://hsi.example/api/research/methods-compare",{method:"POST",headers:{"content-type":"application/json",...h},body:typeof b==="string"?b:JSON.stringify(b)});
const env={HSI_PUBLIC_ORIGIN:"https://hsi.example"};
beforeEach(resetMethodsCompareLimiter);

describe("openAccess",()=>{
 test("only CC BY and CC0 licences are accepted; non-commercial, no-derivatives and unknown are dropped",()=>{
  for(const ok of ["cc by","CC BY","cc by 4.0","cc0","CC0 1.0"])expect(OPEN_LICENCE.test(ok)).toBe(true);
  for(const bad of ["cc by-nc","cc by-nd","cc by nc","cc by-nc-nd","","all rights reserved","other"])expect(OPEN_LICENCE.test(bad)).toBe(false);
  expect(parseSearch(search([rec(1,"cc by"),rec(2,"cc by-nc"),rec(3,undefined),{pmcid:"nope",license:"cc by",title:"x"}]),6).map(p=>p.pmcid)).toEqual(["PMC1000001"]);
 });
 test("extracts the methods section only, decodes entities, stops before results",()=>{
  const t=methodsText(xml(A))!;expect(t).toContain("37 °C");expect(t).toContain("1 µg/mL");expect(t).not.toContain("99 h");expect(t).not.toContain("Background text");
  expect(methodsText("<article><p>short</p></article>")).toBeNull();
 });
});

describe("handler",()=>{
 test("compares papers, keeps quotes, flags the difference and names the licence filter",async()=>{
  const r=await handleMethodsCompare(post({query:"IL-21 stimulation of PBMC"}),env,{fetcher:fetcher()});const b:any=await r.json();
  expect(r.status).toBe(200);expect(b.papers.map((p:any)=>p.id)).toEqual(["PMC1000001","PMC1000002"]);expect(b.source).toContain("CC BY or CC0 only");
  const anti=b.rows.find((x:any)=>x.kind==="concentration"&&x.agent.includes("anti-cd3"));expect(anti.differs).toBe(true);expect(anti.byPaper[0].values[0].quote.length).toBeGreaterThan(5);
  expect(b.rows.find((x:any)=>x.kind==="temperature").differs).toBe(false);
  expect(b.notes[0]).toContain("not by a model");expect(JSON.stringify(b)).not.toMatch(/\bbest\b|recommended|optimal/i);
 });
 test("a paper with no readable methods is reported and not compared; no matches says nothing is shown",async()=>{
  const r1:any=await (await handleMethodsCompare(post({query:"IL-21 stimulation"}),env,{fetcher:fetcher({rs:[rec(1,"cc by"),rec(2,"cc by"),rec(5,"cc by")]})})).json();
  expect(r1.papers.find((p:any)=>p.id==="PMC1000005").methodsFound).toBe(false);expect(r1.notes.join(" ")).toContain("no readable methods section");
  const r2:any=await (await handleMethodsCompare(post({query:"nothing matches"}),env,{fetcher:fetcher({rs:[rec(3,"cc by-nc")]})})).json();
  expect(r2.rows).toEqual([]);expect(r2.notes.join(" ")).toContain("Nothing is shown");
 });
 test("validates input before any request; enforces origin, type, size, method and rate",async()=>{
  let calls=0;const f=(async()=>{calls++;return new Response("{}")}) as any;
  for(const bad of [{query:"x"},{query:"a\"quoted\" OR (x)"},{query:"x".repeat(200)},{},"{bad"])expect((await handleMethodsCompare(post(bad as never),env,{fetcher:f})).status).toBe(400);
  expect(calls).toBe(0);
  expect((await handleMethodsCompare(post({query:"IL-21 stimulation"},{origin:"https://evil.example"}),env,{fetcher:fetcher()})).status).toBe(403);
  expect((await handleMethodsCompare(new Request("https://x.test/a",{method:"POST",body:"x"}),env)).status).toBe(415);
  expect((await handleMethodsCompare(post({query:"IL-21 stimulation",pad:"x".repeat(700)}),env)).status).toBe(413);
  expect((await handleMethodsCompare(new Request("https://x.test/a"),env)).status).toBe(405);
  for(let i=0;i<6;i++)expect((await handleMethodsCompare(post({query:"IL-21 stimulation"}),env,{fetcher:fetcher()})).status).toBe(200);
  expect((await handleMethodsCompare(post({query:"IL-21 stimulation"}),env,{fetcher:fetcher()})).status).toBe(429);
 });
 test("provider failure shows nothing",async()=>{
  const r=await handleMethodsCompare(post({query:"IL-21 stimulation"}),env,{fetcher:fetcher({fail:true})});expect(r.status).toBe(502);expect(((await r.json()) as any).error).toContain("Nothing was generated");
 });
});
