import {describe,expect,it} from "bun:test";
import {readFileSync} from "node:fs";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import type {CandidateMappingsFile} from "../src/ontology/mappingReview";
import {buildGraphModel,conceptEvidence,conceptIdentifiers,passageView,rightsAllowDisplay,sourceEvidence,typeProposal,type ConceptTypeProposalsFile} from "../src/graphWorkspace";

const read=(p:string)=>JSON.parse(readFileSync(p,"utf8"));
const bundle=parseDomainBundle(read("research/domain-graph/graph.v1.json"));
const model=buildGraphModel(bundle);
const mappings=read("research/ontology/candidate-mappings.v1.json") as CandidateMappingsFile;
const types=read("research/ontology/concept-types.v1.json") as ConceptTypeProposalsFile;

describe("passages are shown only where rights allow",()=>{
 it("only a licence reported in an import receipt allows text; unverified rights never do",()=>{
  expect(rightsAllowDisplay("import_receipt_only")).toBe(true);
  expect(rightsAllowDisplay("unverified")).toBe(false);
 });
 it("a recorded passage under unverified rights is withheld, not shown",()=>{
  const src={...bundle.sources[0]!,rights:"unverified" as const,passages:[{locator:"abstract p1",text:"Some recorded text"}]};
  expect(passageView(src)).toEqual([{locator:"abstract p1",display:"withheld_rights",text:null}]);
 });
 it("over the published graph, every shown passage has recorded text and import-receipt rights, and none is invented",()=>{
  let shown=0,total=0;
  for(const s of model.sources.values()){
   const v=sourceEvidence(s);total+=v.passages.length;
   v.passages.forEach((p,i)=>{
    const raw=s.passages[i]!;
    if(p.display==="shown"){shown++;expect(p.text).toBe(raw.text);expect(s.rights).toBe("import_receipt_only")}
    else expect(p.text).toBeNull();
    if(!raw.text)expect(p.display).toBe("locator_only");
   });
   expect(v.correction).toBe("not_checked");
  }
  expect(shown).toBe(8);expect(total).toBe(25);
 });
});

describe("concept evidence summary",()=>{
 const busiest=[...model.nodes.keys()].map(id=>conceptEvidence(model,id)).sort((a,b)=>b.relationships-a.relationships)[0]!;
 it("counts over the whole graph and keeps every relationship a candidate",()=>{
  const rel=model.assertions.filter(a=>a.subject.id===busiest.conceptId||a.object.id===busiest.conceptId);
  expect(busiest.relationships).toBe(rel.length);
  expect(busiest.status).toBe("all_candidate_unreviewed");
  expect(busiest.species.reduce((s,x)=>s+x.count,0)).toBe(rel.length);
  expect(busiest.sources.length+0).toBe(new Set(rel.map(a=>a.evidence.sourceId).filter(Boolean)).size);
  expect(busiest.meanContextStated).toBeGreaterThanOrEqual(0);expect(busiest.meanContextStated).toBeLessThanOrEqual(busiest.recordable);
 });
 it("counts 'Not stated' as a species value rather than leaving it out",()=>{
  const any=[...model.nodes.keys()].map(id=>conceptEvidence(model,id)).find(e=>e.species.some(s=>s.value==="Not stated"));
  expect(any).toBeDefined();
 });
});

describe("candidate identifiers",()=>{
 it("are candidates, unreviewed and never approved, with the ontology release attached",()=>{
  const ad=[...model.nodes.values()].find(n=>n.name==="Alzheimer's disease")!;
  const r=conceptIdentifiers(mappings,ad.id);
  expect(r.state).toBe("candidate");
  if(r.state!=="candidate")return;
  expect(r.approved).toBe(false);expect(r.review).toBe("unreviewed");
  expect(r.candidates[0]).toMatchObject({ontology:"MONDO",id:"MONDO:0004975",release:"v2026-11-03"});
 });
 it("report unmapped concepts and concepts the mapping run never saw separately",()=>{
  const states=new Map<string,number>();
  for(const id of model.nodes.keys()){const s=conceptIdentifiers(mappings,id).state;states.set(s,(states.get(s)??0)+1)}
  expect(states.get("candidate")).toBe(26);
  expect(states.get("unmapped")).toBe(127);
  expect(states.get("not_in_mapping_run")).toBe(4);
 });
});

describe("type proposals",()=>{
 it("are shown as proposals for this graph version only",()=>{
  const p=types.proposals.find(x=>x.proposedType==="cell_type")!;
  const r=typeProposal(types,p.conceptId,model.version);
  expect(r.state).toBe("proposed");
  if(r.state==="proposed"){expect(r.proposedType).toBe("cell type");expect(r.confidence).toBe("uncalibrated")}
 });
 it("are withheld when made against another graph version",()=>{
  expect(typeProposal(types,types.proposals[0]!.conceptId,"0".repeat(64)).state).toBe("stale");
 });
 it("never propose for a concept that already has a specific type",()=>{
  const disease=[...model.nodes.values()].find(n=>n.kind==="disease")!;
  expect(typeProposal(types,disease.id,model.version).state).toBe("none");
 });
});
