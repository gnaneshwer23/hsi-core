import {describe,expect,it} from "bun:test";
import {readFileSync} from "node:fs";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {EMPTY_TREE_FILTERS,HSI_DOMAINS,buildDomainTree,buildGraphModel,type ConceptTypeProposalsFile} from "../src/graphWorkspace";

const read=(p:string)=>JSON.parse(readFileSync(p,"utf8"));
const model=buildGraphModel(parseDomainBundle(read("research/domain-graph/graph.v1.json")));
const typesFile=read("research/ontology/concept-types.v1.json") as ConceptTypeProposalsFile;
const proposals=new Map(typesFile.proposals.map(p=>[p.conceptId,p.proposedType]));

describe("domain tree",()=>{
 const t=buildDomainTree(model);
 it("always lists all six domains, including those with nothing recorded yet",()=>{
  expect(t.domains.slice(0,6).map(d=>d.key)).toEqual(HSI_DOMAINS.map(d=>d.key));
  expect(t.domains.find(d=>d.key==="genomics")!.concepts).toBe(0);
 });
 it("covers every candidate relationship and every connected concept once in the totals",()=>{
  expect(t.totals).toEqual({concepts:111,relationships:95});
  expect(t.filtered).toBe(false);
 });
 it("keeps every relationship a candidate, with its study identifiers as recorded",()=>{
  for(const d of t.domains)for(const ty of d.types)for(const c of ty.concepts)for(const r of c.relationships){
   expect(r.status).toBe("candidate_unreviewed");
   const a=model.assertions.find(x=>x.id===r.id)!;
   expect(r.pmid).toBe(a.evidence.pmid);
   expect([a.subject.id,a.object.id]).toContain(r.otherId);
  }
 });
 it("puts a concept that sits in several domains under each, and says how many",()=>{
  const multi=t.domains.flatMap(d=>d.types.flatMap(ty=>ty.concepts)).find(c=>c.domainCount>1)!;
  const where=t.domains.filter(d=>d.types.some(ty=>ty.concepts.some(c=>c.id===multi.id))).length;
  expect(where).toBe(multi.domainCount);
 });
});

describe("filters",()=>{
 it("search keeps concepts that match and relationships that reach a match",()=>{
  const t=buildDomainTree(model,{...EMPTY_TREE_FILTERS,query:"butyrate"});
  expect(t.filtered).toBe(true);
  expect(t.totals.concepts).toBeGreaterThan(1);
  for(const d of t.domains)for(const ty of d.types)for(const c of ty.concepts){
   expect(c.matched||c.relationships.every(r=>/butyrate/i.test(r.otherName)||model.nodes.get(r.otherId)!.aliases.some(x=>/butyrate/i.test(x)))).toBe(true);
  }
 });
 it("a domain filter keeps only that domain",()=>{
  const t=buildDomainTree(model,{...EMPTY_TREE_FILTERS,domains:["neuroscience"]});
  expect(t.domains.filter(d=>d.concepts>0).map(d=>d.key)).toEqual(["neuroscience"]);
 });
 it("human-only and hide-negated narrow the relationships without inventing any",()=>{
  const t=buildDomainTree(model,{...EMPTY_TREE_FILTERS,humanOnly:true,hideNegated:true});
  expect(t.totals.relationships).toBeGreaterThan(0);expect(t.totals.relationships).toBeLessThan(95);
  for(const d of t.domains)for(const ty of d.types)for(const c of ty.concepts)for(const r of c.relationships){expect(r.negated).toBe(false);expect(r.species).toMatch(/human/i)}
 });
 it("a search with no match gives an empty tree, not a substitute",()=>{
  expect(buildDomainTree(model,{...EMPTY_TREE_FILTERS,query:"zzzz-no-such-concept"}).totals).toEqual({concepts:0,relationships:0});
 });
});

describe("proposed grouping",()=>{
 it("groups generic concepts by unreviewed proposals made against this graph version, and marks them proposed",()=>{
  expect(typesFile.mappedAgainst).toBe(model.version);
  const t=buildDomainTree(model,EMPTY_TREE_FILTERS,proposals);
  const imm=t.domains.find(d=>d.key==="immunology")!;
  const proposed=imm.types.filter(ty=>ty.proposed);
  expect(proposed.length).toBeGreaterThan(3);
  for(const ty of proposed)for(const c of ty.concepts)expect(c.kind).toBe("biological concept");
  for(const ty of imm.types.filter(x=>!x.proposed&&x.kind!=="biological concept"))for(const c of ty.concepts)expect(c.kind).toBe(ty.kind);
  expect(buildDomainTree(model,EMPTY_TREE_FILTERS,proposals).totals).toEqual(buildDomainTree(model).totals);
 });
});
