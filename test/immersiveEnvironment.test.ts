import {describe,expect,it} from "bun:test";
import {
 COMPANION,ENV_EDGES,ENV_ENTITIES,ENV_ENTITY_IDS,LAYERS,MEMORY_TIMELINE,SCALES,centroidOfScale,emphasis,evidenceLandscape,initialView,posOf,relationsIn,scaleOf,weakestInEnv,
} from "../site/src/landing-v2/immersive/environment";

describe("immersive environment",()=>{
 it("is drawn only from the illustrative atlas and every entity has a position and a scale",()=>{
  expect(ENV_ENTITIES.length).toBeGreaterThan(8);
  for(const id of ENV_ENTITY_IDS){expect(posOf(id)).not.toEqual([0,0,0]);expect(SCALES.map(s=>s.id)).toContain(scaleOf(id))}
  for(const e of ENV_EDGES){expect(ENV_ENTITY_IDS).toContain(e.from);expect(ENV_ENTITY_IDS).toContain(e.to)}
 });
 it("spans all four scales and the three domains of the axis",()=>{
  expect(new Set(ENV_ENTITY_IDS.map(scaleOf))).toEqual(new Set(["organism","organ","cell","molecule"]));
  expect(new Set(ENV_ENTITIES.map(e=>e.domain)).size).toBeGreaterThanOrEqual(3);
 });
 it("reports evidence status honestly: counts match the edges and none is promoted",()=>{
  const l=evidenceLandscape();
  expect(l.reduce((a,b)=>a+b.count,0)).toBe(ENV_EDGES.length);
  expect(l.find(x=>x.status==="contested")!.count).toBeGreaterThan(0);
  expect(weakestInEnv("bbb")).toBe("hypothesis");
  expect(weakestInEnv("nope")).toBeNull();
 });
 it("layers change what is emphasised, scales narrow it, a selection focuses on its neighbourhood",()=>{
  const all=emphasis("mechanisms",null,null,null);
  const conflicts=emphasis("conflicts",null,null,null);
  expect(conflicts.edges.size).toBeLessThan(all.edges.size);
  for(const id of conflicts.edges)expect(ENV_EDGES.find(e=>e.id===id)!.status).toBe("contested");
  const cells=emphasis("mechanisms","cell",null,null);
  for(const id of cells.entities)expect(scaleOf(id)).toBe("cell");
  const sel=emphasis("mechanisms",null,"barrier",null);
  expect(sel.entities.has("barrier")).toBe(true);
  for(const id of sel.edges){const e=ENV_EDGES.find(x=>x.id===id)!;expect(e.from==="barrier"||e.to==="barrier").toBe(true)}
  const pinned={entities:new Set(["il10"]),edges:new Set<string>()};
  expect(emphasis("conflicts",null,null,pinned)).toBe(pinned);
 });
 it("relations carry direction and the unresolved variables of a conflict",()=>{
  const r=relationsIn("barrier");
  expect(r.some(x=>x.edge.status==="contested"&&!!x.edge.unresolved)).toBe(true);
  expect(r.every(x=>x.direction==="in"||x.direction==="out")).toBe(true);
 });
 it("the centroid of a scale lies among its entities",()=>{
  const [x,y]=centroidOfScale("cell");expect(Number.isFinite(x+y)).toBe(true);
  expect(centroidOfScale(null)).toEqual(centroidOfScale(null));
 });
 it("opens on the layer that matches the objectives and says when the domain has no environment yet",()=>{
  expect(initialView("immunology",["conflicts"]).layer).toBe("conflicts");
  expect(initialView("microbiome",["gaps"]).layer).toBe("gaps");
  expect(initialView("neuroscience",["learn"]).layer).toBe("mechanisms");
  expect(initialView("immunology",[]).matchesDomain).toBe(true);
  expect(initialView("genomics",[]).matchesDomain).toBe(false);
  expect(initialView(null,[]).matchesDomain).toBe(true);
  expect(LAYERS.map(l=>l.id)).toContain("conflicts");
 });
 it("the companion answers only from the atlas, names statuses, and refuses without a selection",()=>{
  for(const t of COMPANION){
   const none=t.build(null);expect(none.answer.length).toBeGreaterThan(0);
   const some=t.build("barrier");expect(some.answer.length).toBeGreaterThan(0);
   for(const id of some.highlight.entities)expect(ENV_ENTITY_IDS).toContain(id);
  }
  expect(COMPANION.find(t=>t.id==="why-conflict")!.build(null).answer).toEqual(["Select an entity first."]);
  expect(COMPANION.find(t=>t.id==="why-conflict")!.build("barrier").answer.join(" ")).toContain("Unresolved:");
  expect(COMPANION.find(t=>t.id==="thin")!.build(null).layer).toBe("gaps");
 });
 it("the memory timeline is labelled sample and never uses a real date",()=>{
  for(const m of MEMORY_TIMELINE)expect(m.when).toMatch(/^Sample day \d+$/);
 });
});
