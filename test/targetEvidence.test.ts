import {beforeEach,describe,expect,test} from "bun:test";
import {handleTargetEvidence,resetTargetEvidenceLimiter} from "../src/server/targetEvidenceHandler";
import {DATATYPES,profileTargets} from "../src/investigation/targetProfile";
import {parseOpenTargetsDiseasePayload} from "../src/evidence/openTargetsLookup";

const row=(id:string,sym:string,score:number,dt:Record<string,number>)=>({score,target:{id,approvedSymbol:sym},datatypeScores:Object.entries(dt).map(([id,score])=>({id,score})),datasourceScores:[]});
const body=(rows:unknown[])=>JSON.stringify({data:{disease:{id:"MONDO_0005100",name:"systemic sclerosis",associatedTargets:{count:rows.length,rows}}}});
const rows=[row("ENSG00000000001","TARGA",0.8,{genetic_association:0.5,clinical:0.6,literature:0.7}),row("ENSG00000000002","TARGB",0.9,{literature:0.9}),row("ENSG00000000003","TARGC",0.4,{animal_model:0.4,literature:0.2}),row("ENSG00000000004","TARGD",0.3,{rna_expression:0.3,weird_new_type:0.2})];
const fetcher=(async()=>new Response(body(rows),{status:200})) as any;
const post=(b:unknown,h:Record<string,string>={})=>new Request("https://hsi.example/api/research/target-evidence",{method:"POST",headers:{"content-type":"application/json",...h},body:typeof b==="string"?b:JSON.stringify(b)});
const env={HSI_PUBLIC_ORIGIN:"https://hsi.example"};
beforeEach(resetTargetEvidenceLimiter);

describe("targetProfile",()=>{
 const rec=(parseOpenTargetsDiseasePayload({diseaseId:"MONDO_0005100",bodyText:body(rows),httpStatus:200,retrievedAt:"2026-11-15T00:00:00Z",pageSize:25}) as any).record;
 const p=profileTargets(rec);
 test("ranks by score and states missing evidence types instead of hiding them",()=>{
  expect(p.candidates.map(c=>c.symbol)).toEqual(["TARGB","TARGA","TARGC","TARGD"]);expect(p.candidates.map(c=>c.rank)).toEqual([1,2,3,4]);
  const b=p.candidates[0]!;expect(b.present).toEqual(["literature"]);expect(b.absent).toContain("genetic_association");
  expect(b.observations.join(" ")).toContain("No human genetic association evidence");expect(b.observations.join(" ")).toContain("All recorded evidence is one type");
  expect(p.candidates[1]!.observations.join(" ")).not.toContain("No human genetic");
  expect(p.candidates[2]!.observations.join(" ")).toContain("limited to literature and animal models");
 });
 test("keeps unknown provider evidence types, labelled as returned",()=>{
  const d=p.candidates[3]!;expect(d.evidence.find(e=>e.id==="weird_new_type")).toEqual({id:"weird_new_type",label:"weird new type",score:0.2});
  expect(p.candidates[0]!.evidence.filter(e=>DATATYPES.some(x=>x.id===e.id))).toHaveLength(DATATYPES.length);
 });
 test("always carries the honesty flags",()=>{expect(p.honesty).toEqual({scoreIsNotCausation:true,scoreIsNotEfficacy:true,scoreIsNotTargetValidation:true,notARecommendation:true,noClinicalAdvice:true})});
});

describe("handler",()=>{
 test("returns a profile with the caveat and the source",async()=>{
  const r=await handleTargetEvidence(post({diseaseId:"MONDO_0005100"},{origin:"https://hsi.example"}),env,{fetcher});const b:any=await r.json();
  expect(r.status).toBe(200);expect(b.profile.diseaseName).toBe("systemic sclerosis");expect(b.caveat).toContain("not a recommendation");expect(b.profile.candidates[0].symbol).toBe("TARGB");
 });
 test("normalises id style and rejects bad input without calling the provider",async()=>{
  let calls=0;const f=(async()=>{calls++;return new Response(body(rows))}) as any;
  expect((await handleTargetEvidence(post({diseaseId:"mondo:0005100"}),env,{fetcher:f})).status).toBe(200);const before=calls;
  for(const bad of [{diseaseId:"drop table"},{diseaseId:"MONDO_5"},{},{diseaseId:"EFO_0000384; x"},"{bad"])expect((await handleTargetEvidence(post(bad as never),env,{fetcher:f})).status).toBe(400);
  expect(calls).toBe(before);
 });
 test("origin, content type, size and method are enforced",async()=>{
  expect((await handleTargetEvidence(post({diseaseId:"MONDO_0005100"},{origin:"https://evil.example"}),env,{fetcher})).status).toBe(403);
  expect((await handleTargetEvidence(new Request("https://x.test/a",{method:"POST",body:"x"}),env)).status).toBe(415);
  expect((await handleTargetEvidence(post({diseaseId:"MONDO_0005100",pad:"x".repeat(600)}),env)).status).toBe(413);
  expect((await handleTargetEvidence(new Request("https://x.test/a"),env)).status).toBe(405);
 });
 test("provider failure says nothing is shown; unknown disease is a 404; no model is involved",async()=>{
  const down=(async()=>new Response("no",{status:500})) as any;const r=await handleTargetEvidence(post({diseaseId:"MONDO_0005100"}),env,{fetcher:down});
  expect(r.status).toBe(502);expect(((await r.json()) as any).error).toContain("No targets are shown");
  const none=(async()=>new Response(JSON.stringify({data:{disease:null}}))) as any;expect((await handleTargetEvidence(post({diseaseId:"MONDO_0999999"}),env,{fetcher:none})).status).toBe(404);
 });
 test("rate limits per IP",async()=>{
  for(let i=0;i<10;i++)expect((await handleTargetEvidence(post({diseaseId:"MONDO_0005100"}),env,{fetcher})).status).toBe(200);
  expect((await handleTargetEvidence(post({diseaseId:"MONDO_0005100"}),env,{fetcher})).status).toBe(429);
 });
});
