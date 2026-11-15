import {describe,expect,test} from "bun:test";
import {classify,neighbourTerms,planCounts,recordedGapsFor} from "../site/src/lib/gapFinder";
import {cooccurrence,validTerm} from "../src/investigation/cooccurrence";
import {handleCooccurrence,resetCooccurrenceLimiter} from "../src/server/cooccurrenceHandler";

const node=(id:string,name:string,aliases:string[]=[])=>({id,name,kind:"biological concept",aliases,domains:["immune"]});
const edge=(id:string,s:string,o:string)=>({id,subjectId:s,objectId:o,predicate:"associated_with",kind:"source_candidate" as const,negated:false,sourceId:null,assertion:"",domains:[],conditions:[]});
const bundle:any={nodes:[node("a","IL-21"),node("b","T follicular helper (Tfh) cells"),node("c","Fibroblast activation / fibrosis"),node("d","Systemic sclerosis"),node("e","A very long concept name that should be skipped because it exceeds the limit set")],
 edges:[edge("1","a","b"),edge("2","a","c"),edge("3","d","a"),edge("4","a","e")],
 gaps:[{id:"g1",subjectId:"a",objectId:"d",question:"Does IL-21 drive fibrosis in SSc?",missing:"No human tissue study.",domains:[],conditions:[],nextStudy:"Skin biopsy staining."},{id:"g2",subjectId:"c",objectId:"e",question:"Unrelated",missing:"x",domains:[],conditions:[],nextStudy:"y"}]};
const ok=(b:unknown)=>new Response(JSON.stringify(b),{status:200});

describe("gap finder logic",()=>{
 test("recorded gaps are only those touching a concept that matches the researcher's topic, and keep their wording",()=>{
  const g=recordedGapsFor(bundle,["IL-21"]);expect(g.map(x=>x.id)).toEqual(["g1"]);expect(g[0]).toMatchObject({subject:"IL-21",object:"Systemic sclerosis",touches:"IL-21"});
  expect(recordedGapsFor(bundle,["zzz"])).toEqual([]);
 });
 test("neighbour terms are short, query-safe, de-duplicated and most connected first",()=>{
  expect(neighbourTerms(bundle,"IL-21",4).sort()).toEqual(["Systemic sclerosis","T follicular helper cells"]);
  const n=neighbourTerms(bundle,"IL-21",5);expect(n).not.toContain("IL-21");expect(n.every(t=>!/[()"]/.test(t)&&t.length<=50)).toBe(true);expect(n.length).toBe(2);
  expect(neighbourTerms(bundle,"nothing here")).toEqual([]);
 });
 test("the plan caps terms at 8 and pairs at 12, pairs topics with each other and with neighbours, and never pairs a term with itself",()=>{
  const p=planCounts(bundle,["IL-21","systemic sclerosis","Tfh cells"]);
  expect(p.terms.length).toBeLessThanOrEqual(8);expect(p.pairs.length).toBeLessThanOrEqual(12);
  expect(p.pairs.every(([i,j])=>i!==j&&i<p.terms.length&&j<p.terms.length)).toBe(true);
  expect(p.pairs.some(([i,j])=>p.terms[i]==="IL-21"&&p.terms[j]==="systemic sclerosis")).toBe(true);
  expect(planCounts(null,['bad"quote',"x"])).toEqual({terms:[],pairs:[]});
  expect(planCounts(null,["IL-21"]).pairs).toEqual([]);
 });
 test("classification needs volume on both sides; low shares are under-explored; failures stay unavailable",()=>{
  const res:any={terms:[{term:"A",count:5000,error:null},{term:"B",count:4000,error:null},{term:"C",count:90,error:null},{term:"D",count:null,error:"HTTP 503"}],
   pairs:[{a:"A",b:"B",joint:10,error:null,queryUrl:"u1"},{a:"A",b:"C",joint:0,error:null,queryUrl:"u2"},{a:"A",b:"D",joint:null,error:"HTTP 503",queryUrl:"u3"},{a:"B",b:"A",joint:2000,error:null,queryUrl:"u4"}]};
  const rows=classify(res),by=Object.fromEntries(rows.map(r=>[r.queryUrl,r]));
  expect(by.u1).toMatchObject({signal:"under_explored"});expect(by.u1!.share).toBeCloseTo(0.0025);
  expect(by.u2!.signal).toBe("low_volume");expect(by.u3!.signal).toBe("unavailable");expect(by.u3!.error).toContain("503");expect(by.u4!.signal).toBe("well_covered");
  expect(rows[0]!.signal).toBe("under_explored");expect(rows[rows.length-1]!.signal).toBe("unavailable");
 });
});

describe("co-mention counts",()=>{
 const fetchCounts=(fail?:string)=>(async(u:any)=>{const q=decodeURIComponent(new URL(String(u)).searchParams.get("query")!);if(fail&&q.includes(fail))return new Response("x",{status:503});return ok({hitCount:q.includes(" AND ")?7:1000})}) as any;
 test("counts terms and pairs with title/abstract phrase queries and links to the same search",async()=>{
  const r=await cooccurrence(["IL-21","fibrosis"],[[0,1]],fetchCounts(),()=>new Date("2026-11-15T10:00:00Z"));
  expect(r.terms.map(t=>t.count)).toEqual([1000,1000]);expect(r.pairs[0]).toMatchObject({joint:7,error:null});
  expect(decodeURIComponent(r.pairs[0]!.queryUrl)).toContain('TITLE_ABS:"IL-21" AND TITLE_ABS:"fibrosis"');expect(r.note).toContain("attention");
 });
 test("a failed query is null with an error, never zero",async()=>{
  const r=await cooccurrence(["IL-21","fibrosis"],[[0,1]],fetchCounts("fibrosis"));
  expect(r.terms[1]).toMatchObject({count:null});expect(r.terms[1]!.error).toContain("503");expect(r.pairs[0]!.joint).toBeNull();
 });
 test("term validation",()=>{expect(validTerm("IL-21")).toBe(true);for(const t of ["a",'x"y',"a(b)","a:b","x".repeat(61),5])expect(validTerm(t as any)).toBe(false)});
 test("the endpoint validates strictly, rate limits and ignores foreign origins when configured",async()=>{
  resetCooccurrenceLimiter();const f=fetchCounts();
  const post=(b:unknown,h:Record<string,string>={})=>new Request("https://x.test/api/research/cooccurrence",{method:"POST",headers:{"content-type":"application/json","x-forwarded-for":"7.7.7.7",...h},body:typeof b==="string"?b:JSON.stringify(b)});
  const st=async(b:unknown)=>(await handleCooccurrence(post(b),{},{fetcher:f})).status;
  expect(await st({terms:["IL-21","fibrosis"],pairs:[[0,1]]})).toBe(200);
  expect(await st({terms:["IL-21"],pairs:[[0,0]]})).toBe(400);expect(await st({terms:["IL-21","il-21"],pairs:[[0,1]]})).toBe(400);
  expect(await st({terms:["IL-21","fibrosis"],pairs:[[0,5]]})).toBe(400);expect(await st({terms:["IL-21","fibrosis"],pairs:[[0,0]]})).toBe(400);
  expect(await st({terms:["IL-21","fibrosis"],pairs:Array(13).fill([0,1])})).toBe(400);expect(await st({terms:Array.from({length:9},(_,i)=>"term"+i),pairs:[[0,1]]})).toBe(400);
  expect(await st("{bad")).toBe(400);
  expect((await handleCooccurrence(post({terms:["IL-21","fibrosis"],pairs:[[0,1]]},{origin:"https://evil.test"}),{HSI_PUBLIC_ORIGIN:"https://x.test"},{fetcher:f})).status).toBe(403);
  resetCooccurrenceLimiter();let last=200;for(let i=0;i<11;i++)last=(await handleCooccurrence(post({terms:["IL-21","fibrosis"],pairs:[[0,1]]}),{},{fetcher:f})).status;expect(last).toBe(429);
 });
});
