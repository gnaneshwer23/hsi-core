import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {parseDomainBundle,type DomainBundle,type DomainEdge} from "../src/knowledgeGraph/domainGraph";
import {breakdownForPair} from "../src/knowledgeGraph/contextBreakdown";
import {assessConflict} from "../src/knowledgeGraph/contextConflict";

const g=parseDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")));
const cand=g.edges.filter(e=>e.kind==="source_candidate");
const rig=(edges:Partial<DomainEdge>[]):{g2:DomainBundle;a:string;b:string}=>{
 const base=cand[0]!,a=g.nodes[0]!,b=g.nodes[1]!;
 return {a:a.id,b:b.id,g2:{...g,edges:edges.map((p,i)=>({...base,id:"X-"+i,subjectId:a.id,objectId:b.id,kind:"source_candidate" as const,sourceId:"s"+i,negated:false,model:"unspecified" as const,tissue:null,population:null,design:"unspecified design",...p}))}};
};
const run=(edges:Partial<DomainEdge>[])=>{const {g2,a,b}=rig(edges);return assessConflict(breakdownForPair(g2,a,b))};
const H={model:"human_in_vivo" as const,design:"cohort",tissue:"serum"},M={model:"mouse" as const,design:"knockout",tissue:"spleen"};

describe("context conflict classification",()=>{
 test("a single record, or records in one direction, is no disagreement and not confirmation",()=>{
  expect(run([{...H}]).classification).toBe("no_disagreement");
  const r=run([{...H,sourceId:"a"},{...M,sourceId:"b"}]);expect(r.classification).toBe("no_disagreement");expect(r.statement).toContain("not confirmation");
 });
 test("no records compares nothing",()=>expect(run([]).statement).toContain("nothing can be compared"));
 test("both directions inside one context is a candidate genuine conflict",()=>{
  const r=run([{...H,negated:false,sourceId:"a"},{...H,negated:true,sourceId:"b"}]);
  expect(r.classification).toBe("same_context_disagreement");expect(r.sides.mixed).toEqual([0]);
 });
 test("directions that differ only across fully stated contexts are context-separated, never resolved",()=>{
  const r=run([{...H,negated:false,sourceId:"a"},{...M,negated:true,sourceId:"b"}]);
  expect(r.classification).toBe("context_separated_disagreement");expect(r.statement).toContain("has not been explained or resolved");
 });
 test("a disagreeing record without a stated system or design is context unknown",()=>{
  const r=run([{...H,negated:false,sourceId:"a"},{negated:true,sourceId:"b"}]);
  expect(r.classification).toBe("disagreement_context_unknown");
 });
 test("same-context disagreement outranks everything else",()=>{
  const r=run([{...H,negated:false,sourceId:"a"},{...H,negated:true,sourceId:"b"},{negated:true,sourceId:"c"}]);
  expect(r.classification).toBe("same_context_disagreement");
 });
 test("never adjudicates, approves or asserts cause",()=>{
  for(const e of [[{...H}],[{...H,negated:true,sourceId:"a"},{...M,sourceId:"b"}]]){const r=run(e);expect(r).toMatchObject({adjudication:"not_performed",scientificApproval:false,causalConclusionAllowed:false});expect(r.limits.length).toBeGreaterThan(0)}
 });
 test("on the published graph, the two recorded disagreements differ by design between human contexts, unexplained",()=>{
  const res=new Map<string,number>();
  const seen=new Set<string>();
  for(const e of cand){const k=[e.subjectId,e.objectId].sort().join("|");if(seen.has(k))continue;seen.add(k);const c=assessConflict(breakdownForPair(g,e.subjectId,e.objectId)).classification;res.set(c,(res.get(c)??0)+1)}
  expect(res.get("context_separated_disagreement")).toBe(2);expect(res.get("disagreement_context_unknown")??0).toBe(0);
  expect(res.get("same_context_disagreement")??0).toBe(0);
 });
});
