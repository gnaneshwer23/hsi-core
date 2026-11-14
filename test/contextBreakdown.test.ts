import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {parseDomainBundle,type DomainBundle,type DomainEdge} from "../src/knowledgeGraph/domainGraph";
import {breakdownForConcept,breakdownForPair,NOT_ASSESSED} from "../src/knowledgeGraph/contextBreakdown";

const g=parseDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")));
const cand=g.edges.filter(e=>e.kind==="source_candidate");
const clone=(edges:Partial<DomainEdge>[]):DomainBundle=>{
 const base=cand[0]!,a=g.nodes[0]!,b=g.nodes[1]!;
 return {...g,edges:edges.map((p,i)=>({...base,id:"X-"+i,subjectId:a.id,objectId:b.id,kind:"source_candidate" as const,sourceId:"s"+i,negated:false,model:"unspecified" as const,design:"d",tissue:null,population:null,...p}))};
};
const ids=(g2:DomainBundle)=>[g2.nodes[0]!.id,g2.nodes[1]!.id] as const;

describe("context breakdown",()=>{
 test("splits a pooled set into strata by system, tissue, population and design",()=>{
  const g2=clone([{model:"human_in_vivo",tissue:"synovium",design:"cohort",sourceId:"a"},{model:"human_in_vivo",tissue:"synovium",design:"cohort",sourceId:"b"},{model:"mouse",design:"CIA",sourceId:"c"},{model:"human_in_vivo",tissue:"blood",population:"ACPA-positive",design:"cohort",sourceId:"d"}]);
  const [a,b]=ids(g2),r=breakdownForPair(g2,a,b);
  expect(r.totals).toMatchObject({records:4,studies:4,strata:3});
  expect(r.strata[0]!.studyCount).toBe(2);expect(r.strata[0]!.key).toMatchObject({model:"human_in_vivo",tissue:"synovium"});
  expect(r.summary).toBe("4 sources in 3 contexts: 3 human in vivo, 1 mouse.");
 });
 test("counts distinct sources, not records, and records without a source are separate",()=>{
  const g2=clone([{sourceId:"same",model:"mouse"},{sourceId:"same",model:"mouse"},{sourceId:null,model:"mouse"}]);
  const [a,b]=ids(g2),r=breakdownForPair(g2,a,b);
  expect(r.strata[0]).toMatchObject({studyCount:1,recordsWithoutSource:1});expect(r.strata[0]!.recordIds.length).toBe(3);expect(r.totals.recordsWithoutSource).toBe(1);
 });
 test("direction is reported, negative or mixed, never 'supports'; negative findings are counted",()=>{
  const g2=clone([{model:"mouse",negated:true,sourceId:"a"},{model:"mouse",negated:false,sourceId:"b"},{model:"human_in_vivo",negated:true,sourceId:"c"}]);
  const [a,b]=ids(g2),r=breakdownForPair(g2,a,b);
  expect(r.totals.negativeFindings).toBe(2);
  expect(r.strata.map(s=>s.direction).sort()).toEqual(["mixed","negative"]);
  expect(JSON.stringify(r)).not.toContain('"supports"');
 });
 test("missing context is counted per field and said plainly when nothing states the system",()=>{
  const g2=clone([{sourceId:"a"},{sourceId:"b"}]);
  const [a,b]=ids(g2),r=breakdownForPair(g2,a,b);
  expect(r.missing).toMatchObject({model:2,tissue:2,population:2});expect(r.completeContextShare).toBe(0);
  expect(r.caveats.join(" ")).toContain("No record states its study system");
 });
 test("complete records raise the complete-context share; one context is flagged",()=>{
  const g2=clone([{model:"mouse",tissue:"colon",population:"C57BL/6",design:"x",sourceId:"a"},{model:"mouse",tissue:"colon",population:"C57BL/6",design:"x",sourceId:"b"}]);
  const [a,b]=ids(g2),r=breakdownForPair(g2,a,b);
  expect(r.completeContextShare).toBe(1);expect(r.caveats.join(" ")).toContain("one context");
 });
 test("research gaps are not evidence: counted as open questions only",()=>{
  const g2=clone([{model:"mouse",sourceId:"a"},{kind:"research_gap",sourceId:null}]);
  const [a,b]=ids(g2),r=breakdownForPair(g2,a,b);
  expect(r.totals).toMatchObject({records:1,openQuestions:1});
 });
 test("states what it cannot assess and never approves or concludes causation",()=>{
  const g2=clone([{sourceId:"a"}]),[a,b]=ids(g2),r=breakdownForPair(g2,a,b);
  expect(r.notAssessed).toEqual(NOT_ASSESSED);expect(r.notAssessed).toContain("retraction_status");
  expect(r.scientificApproval).toBe(false);expect(r.causalConclusionAllowed).toBe(false);expect(r.caveats.join(" ")).toContain("independent replication is not established");
 });
 test("an empty scope says so and returns null share",()=>{
  const g2=clone([]),[a,b]=ids(g2),r=breakdownForPair(g2,a,b);
  expect(r.summary).toBe("No source-linked candidate records for this scope.");expect(r.completeContextShare).toBeNull();expect(r.strata).toEqual([]);
 });
 test("rejects unknown concepts and is deterministic",()=>{
  expect(()=>breakdownForPair(g,"concept:nope",g.nodes[0]!.id)).toThrow("Unknown concept");expect(()=>breakdownForConcept(g,"concept:nope")).toThrow("Unknown concept");
  const n=cand[0]!.subjectId;expect(JSON.stringify(breakdownForConcept(g,n))).toBe(JSON.stringify(breakdownForConcept(g,n)));
 });
 test("on the real graph, the concept view reflects that most records state no study system",()=>{
  const n=g.nodes.find(x=>x.name==="Butyrate")!,r=breakdownForConcept(g,n.id);
  expect(r.totals.records).toBeGreaterThan(3);expect(r.graphVersion).toBe(g.version);
  expect(r.strata.reduce((s,x)=>s+x.recordIds.length,0)).toBe(r.totals.records);
  expect(r.missing.model+r.missing.tissue+r.missing.population).toBeGreaterThan(0);
 });
});
