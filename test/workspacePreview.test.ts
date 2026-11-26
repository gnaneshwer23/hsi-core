import {describe,expect,it} from "bun:test";
import {EMPTY_STATE,ROLES,deriveWorkspacePlan,type PersonaId} from "../src/onboarding/scientificOnboarding";
import {PANELS,PREVIEW_PERSONAS,isPersona,orderPanels,panelsFor,previewPath,profileFor,researcherVariant} from "../src/onboarding/workspacePreview";

describe("workspace preview contract",()=>{
 it("has eight personas with their own panel sets, and no two share a layout",()=>{
  expect(PREVIEW_PERSONAS).toHaveLength(8);
  const layouts=PREVIEW_PERSONAS.map(p=>PANELS[p].map(x=>x.key).join(","));
  expect(new Set(layouts).size).toBe(8);
  const keys=PREVIEW_PERSONAS.flatMap(p=>PANELS[p].map(x=>x.key));
  expect(new Set(keys).size).toBe(keys.length); // every panel belongs to exactly one persona
 });
 it("shows PhD and postdoctoral researchers different panels",()=>{
  const phd=panelsFor("researcher","phd").map(p=>p.key),post=panelsFor("researcher","postdoc").map(p=>p.key);
  expect(phd).toContain("thesis");expect(phd).not.toContain("mechanism");
  expect(post).toContain("mechanism");expect(post).toContain("experiments");expect(post).not.toContain("thesis");
  expect(researcherVariant("independent")).toBe("general");
 });
 it("orders panels by the chosen objectives, stably, and marks what matched",()=>{
  expect(orderPanels("student",null,[]).map(p=>p.key)).toEqual(["pathway","concepts","literacy","explain"]);
  const o=orderPanels("researcher","postdoc",["plan","methods"]);
  expect(o[0]!.key).toBe("experiments");expect(o[0]!.emphasised).toBe(true);expect(o[0]!.matched).toEqual(["plan","methods"]);
  expect(o.filter(p=>!p.emphasised).map(p=>p.key)).toEqual(["mechanism","conflicts","gaps","memory"]);
  const withGaps=orderPanels("researcher","phd",["gaps"]);
  expect(withGaps[0]!.key).toBe("thesis");// thesis also lists gaps, so ties keep catalogue order
 });
 it("changes the leading panel when the objectives change",()=>{
  const lead=(obj:any)=>orderPanels("biotech",null,obj)[0]!.key;
  expect(lead(["targets"])).toBe("target");
  expect(lead(["conflicts"])).toBe("tconflicts");
  expect(lead(["coordinate"])).toBe("portfolio");
 });
 it("never loses a panel when ordering",()=>{
  for(const p of PREVIEW_PERSONAS)for(const r of ROLES.filter(r=>r.persona===p)){
   const base=panelsFor(p,r.id).map(x=>x.key).sort(),ordered=orderPanels(p,r.id,["gaps","plan"]).map(x=>x.key).sort();
   expect(ordered).toEqual(base);
  }
 });
 it("personalises only when the visitor's own role matches, and says otherwise",()=>{
  const mine={...EMPTY_STATE,primaryRole:"pi" as const,question:" Does X affect Y? "};
  const own=profileFor("professor",mine,{domains:["Organ & Tissue Biology"],objectives:["Coordinate research projects"]});
  expect(own.personalised).toBe(true);expect(own.question).toBe("Does X affect Y?");
  const other=profileFor("student",mine,{domains:["x"],objectives:["y"]});
  expect(other.personalised).toBe(false);expect(other.domains).toEqual([]);expect(other.question).toBe("");expect(other.note).toContain("different role");
  expect(profileFor("student",EMPTY_STATE,{domains:[],objectives:[]}).note).toContain("sample profile");
 });
 it("routes: every persona has a preview path and the onboarding plan lands on it",()=>{
  expect(previewPath()).toBe("/workspace/preview");
  for(const p of PREVIEW_PERSONAS){expect(previewPath(p)).toBe(`/workspace/preview/${p}`);expect(isPersona(p)).toBe(true)}
  expect(isPersona("admin")).toBe(false);
  for(const r of ROLES){
   const plan=deriveWorkspacePlan({...EMPTY_STATE,primaryRole:r.id,primaryDomain:"disease",objectives:["mechanisms"]})!;
   expect(plan.firstAction.to).toBe(previewPath(r.persona as PersonaId));
  }
 });
});
