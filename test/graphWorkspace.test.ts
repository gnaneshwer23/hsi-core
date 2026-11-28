import {describe,expect,it} from "bun:test";
import {readFileSync} from "node:fs";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {
 CONTEXT_KEYS,EMPTY_FILTERS,HSI_DOMAINS,MODES,RECORDABLE,applyFilters,buildGraphModel,coverageLevel,crossDomainSlice,domainCoverage,domainsOf,expand,facets,isFiltered,isOpenable,modeById,unmappedTags,
} from "../src/graphWorkspace";

const bundle=parseDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")));
const model=buildGraphModel(bundle);
/** The previous published version (044eb4d6) had no genomics or organ coverage; it stays the fixture for "nothing recorded" behaviour. */
const model0=buildGraphModel(parseDomainBundle(JSON.parse(readFileSync("research/domain-graph/versions/044eb4d6309c4e395e038f687007e9277638779369ef3af105297676baeca6d1.json","utf8"))));
const candidates=bundle.edges.filter(e=>e.kind==="source_candidate");

describe("graph workspace model over the published graph",()=>{
 it("builds one assertion per candidate relationship and keeps gaps apart from findings",()=>{
  expect(model.assertions).toHaveLength(candidates.length);
  expect(model.gaps.length).toBe(bundle.gaps.length);
  expect(new Set(model.assertions.map(a=>a.id)).size).toBe(model.assertions.length);
  for(const a of model.assertions)expect(bundle.edges.find(e=>e.id===a.id)!.kind).toBe("source_candidate");
 });
 it("keeps the recorded statement for each relationship",()=>{
  for(const e of candidates)expect(model.assertions.find(a=>a.id===e.id)!.statement).toBe(e.assertion);
 });
 it("every assertion is a candidate: nothing is reviewed, calibrated, verified or approved",()=>{
  for(const a of model.assertions){
   expect(a.status).toEqual({level:"candidate",review:"unreviewed",confidence:"not_calibrated",verification:"source_not_verified",approved:false});
   expect(a.graphVersion).toBe(bundle.version);
  }
 });
 it("represents missing context explicitly and distinguishes why it is missing",()=>{
  for(const a of model.assertions){
   for(const k of CONTEXT_KEYS){const v=a.context[k];expect(v.state==="stated"||v.state==="not_stated").toBe(true)}
   for(const k of ["cellType","diseaseState","dose","duration"] as const)expect(a.context[k]).toEqual({state:"not_stated",reason:"not_recorded_in_graph_schema"});
   expect(RECORDABLE.every(k=>!CONTEXT_KEYS.slice(8).includes(k as never))).toBe(true);
  }
  const noTissue=model.assertions.find(a=>a.context.tissue.state==="not_stated")!;
  expect(noTissue.context.tissue).toEqual({state:"not_stated",reason:"not_stated_in_source"});
  const stated=model.assertions.filter(a=>a.context.tissue.state==="stated").length;
  expect(stated).toBe(candidates.filter(e=>e.tissue&&e.tissue.trim()).length);
 });
 it("never infers context: species and model system come only from the recorded model",()=>{
  for(const e of candidates){
   const a=model.assertions.find(x=>x.id===e.id)!;
   if(e.model==="unspecified"){expect(a.context.species.state).toBe("not_stated");expect(a.context.modelSystem.state).toBe("not_stated")}
   if(e.model==="mouse")expect(a.context.species).toEqual({state:"stated",value:"Mouse"});
   if(e.model==="rodent"){expect(a.context.species.state==="stated"&&a.context.species.value).toContain("not specified")}
  }
 });
 it("completeness counts only stated recordable fields",()=>{
  for(const a of model.assertions){
   const n=RECORDABLE.filter(k=>a.context[k].state==="stated").length;
   expect(a.contextCompleteness).toEqual({stated:n,recordable:RECORDABLE.length});
  }
 });
 it("evidence keeps rights and identity as recorded and never promises a passage",()=>{
  for(const a of model.assertions){
   const src=a.evidence.sourceId?bundle.sources.find(s=>s.id===a.evidence.sourceId):undefined;
   expect(a.evidence.doi).toBe(src?.doi??null);
   if(a.evidence.passage==="text_recorded")expect(src!.passages.some(p=>p.text)).toBe(true);
   if(!src)expect(a.evidence.passage).toBe("not_available");
  }
  expect(model.assertions.filter(a=>a.evidence.passage==="text_recorded").length).toBeLessThan(model.assertions.length);
 });
});

describe("domain mapping and coverage",()=>{
 it("maps published tags to the six domains and leaves unmapped tags unmapped",()=>{
  expect(domainsOf(["immune"]).domains).toEqual(["immunology"]);
  expect(domainsOf(["gut","metabolic"]).domains).toEqual(["microbiome"]);
  expect(domainsOf(["brain","immune"]).domains.sort()).toEqual(["immunology","neuroscience"]);
  expect(domainsOf(["lifestyle"])).toEqual({domains:[],unmappedTags:["lifestyle"]});
  expect(domainsOf([],"disease").domains).toEqual(["disease"]);
  expect(domainsOf(["never-seen"]).unmappedTags).toEqual(["never-seen"]);
 });
 it("reports coverage from counts: genomics has none, and unmapped tags are listed",()=>{
  const cov=domainCoverage(model,HSI_DOMAINS.map(d=>d.key));
  expect(cov).toHaveLength(6);
  expect(domainCoverage(model0,HSI_DOMAINS.map(d=>d.key)).find(c=>c.domain==="genomics")).toMatchObject({relationships:0,level:"none"});
  expect(cov.find(c=>c.domain==="genomics")).toMatchObject({relationships:14,level:"partial"});
  expect(cov.find(c=>c.domain==="immunology")!.relationships).toBeGreaterThan(cov.find(c=>c.domain==="organ")!.relationships);
  const tags=unmappedTags(model).map(t=>t.tag);
  expect(tags).toContain("lifestyle");expect(tags).toContain("trials");
  expect([coverageLevel(0),coverageLevel(1),coverageLevel(5),coverageLevel(30)]).toEqual(["none","minimal","partial","substantial"]);
 });
});

describe("modes",()=>{
 it("defines the twelve modes over one engine with honest readiness",()=>{
  expect(MODES).toHaveLength(12);
  expect(new Set(MODES.map(m=>m.id)).size).toBe(12);
  expect(modeById.multiomics.readiness).toBe("partial");expect(modeById.multiomics.readinessNote).toContain("No proteomic");expect(modeById.translational.readinessNote).toContain("Not treatment advice");
  expect(modeById.collaboration.readiness).toBe("partial");expect(modeById.collaboration.needs).toContain("034");expect(modeById.memory.readinessNote).toContain("this browser");
  for(const m of MODES.filter(m=>!isOpenable(m)||m.readiness!=="ready"))expect(m.needs||m.readinessNote).toBeTruthy();
  expect(isOpenable(modeById.contradiction)).toBe(true);
 });
});

describe("filters and facets",()=>{
 it("filters by domain, species and context without changing any status",()=>{
  const imm=applyFilters(model.assertions,{...EMPTY_FILTERS,domains:["immunology"]});
  expect(imm.length).toBeGreaterThan(0);expect(imm.every(a=>a.domains.includes("immunology"))).toBe(true);
  const mouse=applyFilters(model.assertions,{...EMPTY_FILTERS,species:["Mouse"]});
  expect(mouse.every(a=>a.context.species.state==="stated"&&a.context.species.value==="Mouse")).toBe(true);
  const unknown=applyFilters(model.assertions,{...EMPTY_FILTERS,species:["Not stated"]});
  expect(unknown.every(a=>a.context.species.state==="not_stated")).toBe(true);
  expect(applyFilters(model.assertions,{...EMPTY_FILTERS,minContext:8}).length).toBeLessThanOrEqual(applyFilters(model.assertions,{...EMPTY_FILTERS,minContext:1}).length);
  for(const a of imm)expect(a.status.approved).toBe(false);
 });
 it("negated filter and search work, and an empty filter keeps everything",()=>{
  expect(applyFilters(model.assertions,EMPTY_FILTERS)).toHaveLength(model.assertions.length);
  expect(isFiltered(EMPTY_FILTERS)).toBe(false);
  const only=applyFilters(model.assertions,{...EMPTY_FILTERS,negated:"only"});
  expect(only.every(a=>a.negated)).toBe(true);
  expect(only.length+applyFilters(model.assertions,{...EMPTY_FILTERS,negated:"exclude"}).length).toBe(model.assertions.length);
  const first=model.assertions[0]!;
  expect(applyFilters(model.assertions,{...EMPTY_FILTERS,query:first.subject.name.slice(0,6).toUpperCase()}).length).toBeGreaterThan(0);
 });
 it("facets count a 'Not stated' bucket and total the assertions",()=>{
  const f=facets(model.assertions);
  expect(f.species.reduce((a,b)=>a+b.count,0)).toBe(model.assertions.length);
  expect(f.species.some(x=>x.value==="Not stated")).toBe(true);
  expect(f.predicates.reduce((a,b)=>a+b.count,0)).toBe(model.assertions.length);
 });
});

describe("bounded slices",()=>{
 it("the immunology–microbiome slice connects the two domains and is smaller than the graph",()=>{
  const s=crossDomainSlice(model,"immunology","microbiome");
  expect(s.assertions.length).toBeGreaterThan(10);
  expect(s.assertions.length).toBeLessThan(model.assertions.length);
  for(const a of s.assertions){
   const both=a.domains.includes("immunology")&&a.domains.includes("microbiome");
   const ends=[a.subject.id,a.object.id].map(id=>model.nodeDomains.get(id)!.domains);
   const split=(ends[0]!.includes("immunology")&&ends[1]!.includes("microbiome"))||(ends[0]!.includes("microbiome")&&ends[1]!.includes("immunology"));
   expect(both||split).toBe(true);
  }
  for(const id of s.sourceIds)expect(model.sources.has(id)).toBe(true);
  expect(s.gapIds.length).toBeGreaterThan(0);
 });
 it("expansion is bounded by depth and size and never duplicates",()=>{
  const s=crossDomainSlice(model,"immunology","microbiome");
  const one=expand(model,s.nodeIds,1,10_000,s.assertions);
  expect(new Set(one.assertions.map(a=>a.id)).size).toBe(one.assertions.length);
  expect(one.assertions.length).toBeGreaterThanOrEqual(s.assertions.length);
  const cap=s.assertions.length+3;
  const capped=expand(model,s.nodeIds,4,cap,s.assertions);
  expect(capped.assertions.length).toBeLessThanOrEqual(cap);
  expect(expand(model,s.nodeIds,0,10_000,s.assertions).added).toBe(0);
  expect(expand(model,s.nodeIds,99,10_000,s.assertions).assertions.length).toBeLessThanOrEqual(model.assertions.length);
 });
});

import {layoutGraph} from "../src/graphWorkspace/layout";
import {comparablePairs,tracePaths} from "../src/graphWorkspace";

describe("layout, paths and comparable pairs",()=>{
 const slice=crossDomainSlice(model,"immunology","microbiome");
 const nodes=[...slice.nodeIds].map(id=>({id,group:model.nodeDomains.get(id)?.domains[0]??"unmapped"}));
 const edges=slice.assertions.map(a=>({s:a.subject.id,o:a.object.id}));
 it("lays out a slice deterministically, inside bounds, quickly, with linked concepts nearer than unlinked",()=>{
  const t0=performance.now();
  const a=layoutGraph(nodes,edges),b=layoutGraph(nodes,edges);
  expect(performance.now()-t0).toBeLessThan(1500);
  expect([...a]).toEqual([...b]);
  for(const [,[x,y]] of a){expect(x).toBeGreaterThanOrEqual(0.06-1e-9);expect(x).toBeLessThanOrEqual(0.94+1e-9);expect(y).toBeGreaterThanOrEqual(0.06-1e-9);expect(y).toBeLessThanOrEqual(0.94+1e-9)}
  const d=(p:string,q:string)=>Math.hypot(a.get(p)![0]-a.get(q)![0],a.get(p)![1]-a.get(q)![1]);
  const linked=new Set(edges.map(e=>[e.s,e.o].sort().join("|")));
  let li=0,ln=0,ui=0,un=0;
  const ids=[...a.keys()];
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const k=[ids[i]!,ids[j]!].sort().join("|");if(linked.has(k)){li+=d(ids[i]!,ids[j]!);ln++}else{ui+=d(ids[i]!,ids[j]!);un++}}
  expect(li/ln).toBeLessThan(ui/un);
 });
 it("handles empty, single and disconnected input",()=>{
  expect(layoutGraph([],[]).size).toBe(0);
  expect(layoutGraph([{id:"a",group:"g"}],[]).get("a")).toEqual([0.5,0.5]);
  expect(layoutGraph([{id:"a",group:"g"},{id:"b",group:"h"}],[]).size).toBe(2);
  expect(layoutGraph([{id:"a",group:"g"},{id:"b",group:"g"}],[{s:"a",o:"missing"}]).size).toBe(2);
 });
 it("the layout of the whole published graph stays fast",()=>{
  const all=[...model.nodes.keys()].map(id=>({id,group:model.nodeDomains.get(id)?.domains[0]??"unmapped"}));
  const t0=performance.now();layoutGraph(all,model.assertions.map(a=>({s:a.subject.id,o:a.object.id})));
  expect(performance.now()-t0).toBeLessThan(2500);
 });
 it("traces association chains, bounded and deterministic, and never labels them a mechanism",()=>{
  const first=slice.assertions[0]!;
  const direct=tracePaths(slice.assertions,first.subject.id,first.object.id,3,3);
  expect(direct[0]!.hops).toBe(1);expect(direct[0]!.kind).toBe("association_chain");
  expect(tracePaths(slice.assertions,first.subject.id,first.object.id,3,3)).toEqual(direct);
  expect(tracePaths(slice.assertions,"x","x")).toEqual([]);
  expect(tracePaths(slice.assertions,first.subject.id,"no-such-concept")).toEqual([]);
  for(const p of direct)expect(p.assertionIds).toHaveLength(p.hops);
  expect(tracePaths(slice.assertions,first.subject.id,first.object.id,5,2).length).toBeLessThanOrEqual(2);
 });
 it("finds pairs of concepts with more than one relationship, without calling them contradictions",()=>{
  const pairs=comparablePairs(model.assertions);
  for(const p of pairs){expect(p.assertionIds.length).toBeGreaterThan(1);expect(Object.keys(p)).not.toContain("contradiction")}
  const manual=new Map<string,number>();for(const a of model.assertions){const k=[a.subject.id,a.object.id].sort().join("|");manual.set(k,(manual.get(k)??0)+1)}
  expect(pairs.length).toBe([...manual.values()].filter(v=>v>1).length);
 });
});
