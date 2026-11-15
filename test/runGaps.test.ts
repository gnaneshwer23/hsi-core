import {describe,expect,test} from "bun:test";
import {deriveRunGaps} from "../src/investigation/runGaps";

const cand=(id:string,over:Record<string,unknown>={})=>({id,contexts:["ra"],species:"human",sourceId:"s-"+id,verification:"agree_directional",polarity:"supporting",...over});
const ctx=(label:string,o:Partial<{records:number;supporting:string[];opposing:string[];uncertain:string[]}>={})=>({label,records:3,supporting:[],opposing:[],uncertain:[],...o});
const run=(over:Record<string,unknown>={})=>({scenarioId:"sc",
 byContext:{ra:ctx("Rheumatoid arthritis",{supporting:["a"]}),ssc:ctx("Systemic sclerosis",{opposing:["b"]})},
 candidates:[cand("a"),cand("b",{contexts:["ssc"],polarity:"opposing"})],searches:[],
 verification:{status:"completed",reason:null,checked:2,independence:"independent_execution_only"},...over}) as any;
const kinds=(r:any)=>deriveRunGaps(r).map(g=>g.kind);

describe("run gaps",()=>{
 test("opposite directions in different contexts become one conflict gap with the cited candidates and sources",()=>{
  const g=deriveRunGaps(run()).find(x=>x.kind==="context_direction_conflict")!;
  expect(g.scope).toBe("scientific");expect(g.candidateIds.sort()).toEqual(["a","b"]);expect(g.sourceIds.sort()).toEqual(["s-a","s-b"]);
  expect(g.detail).toContain("rather than disagreement");expect(g.contexts).toEqual(["ra","ssc"]);
 });
 test("a context with both directions is not a conflict between contexts",()=>{
  expect(kinds(run({byContext:{ra:ctx("RA",{supporting:["a"],opposing:["b"]}),ssc:ctx("SSc",{supporting:["a"]})}}))).not.toContain("context_direction_conflict");
 });
 test("disputed claims are grouped and say disagreement is not evidence",()=>{
  const r=run({candidates:[cand("a",{verification:"disputed"}),cand("b",{verification:"disputed"}),cand("c")]});
  const g=deriveRunGaps(r).find(x=>x.kind==="disputed_claims")!;expect(g.candidateIds).toEqual(["a","b"]);expect(g.detail).toContain("not evidence for either");
 });
 test("no human source is flagged per context and labelled a pattern read",()=>{
  const g=deriveRunGaps(run({candidates:[cand("a",{species:"mouse"}),cand("b",{contexts:["ssc"],species:null,polarity:"opposing"})]})).filter(x=>x.kind==="no_human_source");
  expect(g).toHaveLength(2);expect(g[0]!.detail).toContain("by pattern");
 });
 test("empty context is a retrieval gap, not a scientific one",()=>{
  const g=deriveRunGaps(run({byContext:{ra:ctx("RA",{supporting:["a"]}),x:ctx("Empty")}})).find(x=>x.kind==="no_candidates")!;
  expect(g.scope).toBe("retrieval");expect(g.detail).toContain("not a finding");
 });
 test("failed search is a retrieval gap and names the provider",()=>{
  const g=deriveRunGaps(run({searches:[{provider:"OpenAlex",context:"ra",status:"failed",count:0,error:"timeout",query:"q"}]})).find(x=>x.kind==="search_failed")!;
  expect(g.scope).toBe("retrieval");expect(g.title).toContain("OpenAlex");expect(g.detail).toContain("not evidence of absence");
 });
 test("when the model check did not run: no direction-based gaps, one assessment gap",()=>{
  const r=run({verification:{status:"not_configured",reason:"The model step is disabled.",checked:0,independence:null}});
  const k=kinds(r);expect(k).toContain("assessment_not_run");expect(k).not.toContain("context_direction_conflict");expect(k).not.toContain("disputed_claims");expect(k).not.toContain("no_opposing_found");
  expect(deriveRunGaps(r).find(x=>x.kind==="assessment_not_run")!.scope).toBe("assessment");
 });
 test("scientific gaps sort before retrieval and assessment; ids are stable across calls",()=>{
  const r=run({byContext:{ra:ctx("RA",{supporting:["a"]}),ssc:ctx("SSc",{opposing:["b"]}),x:ctx("Empty")}});
  const a=deriveRunGaps(r),b=deriveRunGaps(r);expect(a.map(g=>g.id)).toEqual(b.map(g=>g.id));
  const scopes=a.map(g=>g.scope),last=scopes.lastIndexOf("scientific"),firstOther=scopes.findIndex(s=>s!=="scientific");
  expect(firstOther===-1||firstOther>last).toBe(true);
  expect(new Set(a.map(g=>g.id)).size).toBe(a.length);
 });
});
