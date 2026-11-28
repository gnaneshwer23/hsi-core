import {describe,expect,it} from "bun:test";
import {readFileSync} from "node:fs";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {
 BAND_HEIGHT,BIO_LEVELS,EMPTY_FILTERS,KIND_TO_SCALE,SCALE_BANDS,SCALE_MAP_VERSION,applyFilters,bandOf,buildGraphModel,crossDomainSlice,crossScaleLinks,facets,isLevel,placedShare,scaleCoverage,scaleOfKind,
} from "../src/graphWorkspace";
import {layoutGraph} from "../src/graphWorkspace/layout";
import {layout3D} from "../src/graphWorkspace/scale";

const bundle=parseDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")));
const model=buildGraphModel(bundle);
const slice=crossDomainSlice(model,"immunology","microbiome");

describe("scale map",()=>{
 it("is stated and versioned, and the generic type is never given a level",()=>{
  expect(SCALE_MAP_VERSION).toBe("1.1.0");
  expect(KIND_TO_SCALE["biological concept"]).toBe("not_recorded");
  expect(scaleOfKind("biological concept").band).toBe("not_recorded");
 });
 it("a type missing from the map is reported as not recorded, not guessed",()=>{
  const p=scaleOfKind("a type nobody has seen");
  expect(p.band).toBe("not_recorded");expect(p.basis).toBe("type_not_in_map");
 });
 it("every concept type in the published graph is in the map, so 'type not in map' never hides a new type",()=>{
  for(const n of bundle.nodes)expect(n.kind in KIND_TO_SCALE).toBe(true);
 });
 it("interventions and research processes are not given a biological level",()=>{
  for(const k of ["intervention","medication","research process"])expect(isLevel(bandOf(k))).toBe(false);
 });
});

describe("scale coverage over the published graph",()=>{
 it("reports how much of the graph has no recorded scale, instead of hiding it",()=>{
  const share=placedShare(model.assertions);
  expect(share.total).toBe(116);
  expect(share.nonePlaced).toBe(62);
  expect(share.bothPlaced+share.onePlaced+share.nonePlaced).toBe(116);
  const cov=scaleCoverage(model.assertions);
  expect(cov.map(c=>c.band)).toEqual(SCALE_BANDS.map(b=>b.key));
  expect(cov.find(c=>c.band==="not_recorded")!.concepts).toBeGreaterThan(cov.find(c=>c.band==="molecule")!.concepts);
 });
 it("crossing links only join two placed levels, ordered from organism down",()=>{
  const rows=crossScaleLinks(model.assertions);
  expect(rows.length).toBeGreaterThan(0);
  const order=BIO_LEVELS.map(l=>l.key);
  for(const r of rows){
   expect(r.from).not.toBe(r.to);
   expect(order.indexOf(r.from)).toBeLessThan(order.indexOf(r.to));
   expect(r.assertionIds.length).toBe(r.relationships);
   for(const id of r.assertionIds){const a=model.assertions.find(x=>x.id===id)!;expect(isLevel(bandOf(a.subject.kind))&&isLevel(bandOf(a.object.kind))).toBe(true)}
  }
 });
});

describe("scale filter and facet",()=>{
 it("filters by band without changing any status, and 'Scale not recorded' is a facet value",()=>{
  const f=facets(slice.assertions);
  expect(f.scales.some(x=>x.value==="not_recorded")).toBe(true);
  const kept=applyFilters(slice.assertions,{...EMPTY_FILTERS,scales:["molecule"]});
  expect(kept.length).toBeGreaterThan(0);expect(kept.length).toBeLessThan(slice.assertions.length);
  for(const a of kept){
   expect(bandOf(a.subject.kind)==="molecule"||bandOf(a.object.kind)==="molecule").toBe(true);
   expect(a.status.approved).toBe(false);
  }
 });
 it("an empty scale filter keeps everything",()=>{
  expect(applyFilters(slice.assertions,EMPTY_FILTERS).length).toBe(slice.assertions.length);
 });
});

describe("3D layout",()=>{
 const ids=[...new Set(slice.assertions.flatMap(a=>[a.subject.id,a.object.id]))];
 const pos2=layoutGraph(ids.map(id=>({id,group:"g"})),slice.assertions.map(a=>({s:a.subject.id,o:a.object.id})));
 const kind=(id:string)=>model.nodes.get(id)?.kind??"unknown";
 it("keeps the 2D plane position and sets height by band, deterministically",()=>{
  const a=layout3D(pos2,id=>bandOf(kind(id))),b=layout3D(pos2,id=>bandOf(kind(id)));
  expect([...a]).toEqual([...b]);
  for(const id of ids){
   const [x,y,z]=a.get(id)!,[px,py]=pos2.get(id)!;
   expect(y).toBe(BAND_HEIGHT[bandOf(kind(id))]);
   expect(x).toBeCloseTo((px-0.5)*6,9);expect(z).toBeCloseTo((py-0.5)*6*0.7,9);
  }
 });
 it("stacks levels organism above molecule and keeps unplaced bands below every level",()=>{
  const lv=BIO_LEVELS.map(l=>BAND_HEIGHT[l.key]);
  for(let i=1;i<lv.length;i++)expect(lv[i]!).toBeLessThan(lv[i-1]!);
  expect(BAND_HEIGHT.not_biological).toBeLessThan(BAND_HEIGHT.molecule);
  expect(BAND_HEIGHT.not_recorded).toBeLessThan(BAND_HEIGHT.molecule);
 });
});
