import {describe,expect,test} from "bun:test";
import {existsSync,readFileSync} from "node:fs";
import {resolve} from "node:path";
import {capabilityLevel,renderCollectiveSection,renderStatusMarkdown,type CapabilityRow,type CollectiveMap} from "../scripts/generate-status";
import {HSI_AGENT_ROLES} from "../src/hsiAgentIntelligenceContracts";

const register=JSON.parse(readFileSync(resolve("operations/capability-register/capability-register.v1.json"),"utf8")) as {capabilities:CapabilityRow[];collective:CollectiveMap;registerId:string;asOf:string;honesty:Record<string,unknown>};
const agents=register.collective.agents,byName=new Map(agents.map(a=>[a.name,a]));
const NAMES=["NEXUS","AEGIS","SCOUT","LANTERN","ATLAS","HELIX","PARALLAX","VANTAGE","VERITAS","ARBITER","SENTINEL","CALIBER","WARDEN"];

describe("collective map (names mapped onto existing modules, not deployment status)",()=>{
 test("all thirteen names are present exactly once, with a purpose and explicit non-responsibilities",()=>{
  expect(agents.map(a=>a.name).sort()).toEqual([...NAMES].sort());
  for(const a of agents){expect(a.purpose.length).toBeGreaterThan(20);expect(a.nonResponsibilities.length).toBeGreaterThanOrEqual(2);expect(a.humanApproval.length).toBeGreaterThan(10);expect(["P0","P1","P2","P3","P4"]).toContain(a.priority)}
 });
 test("every referenced register row and source module exists, so the map cannot drift from the code",()=>{
  const ids=new Set(register.capabilities.map(c=>c.id));
  for(const a of agents){
   for(const id of a.registerIds)expect(ids.has(id),`${a.name} -> ${id}`).toBe(true);
   expect(a.modules.length,a.name).toBeGreaterThan(0);
   for(const m of a.modules)expect(existsSync(resolve(m)),`${a.name} -> ${m}`).toBe(true);
  }
 });
 test("agent role contracts, when named, are real roles; the roles without a collective name are visible",()=>{
  for(const a of agents)if(a.manifestRole!==null)expect((HSI_AGENT_ROLES as readonly string[]).includes(a.manifestRole),a.name).toBe(true);
  const named=new Set(agents.map(a=>a.manifestRole).filter(Boolean));
  expect([...named].sort()).toEqual(["claim_verifier","contradiction_analyst","entity_resolver","evidence_retriever","hypothesis_generator","interrogator"]);
 });
 test("bounded authority: no agent may approve science or promote to the graph; publication goes only through ARBITER",()=>{
  for(const a of agents){expect(a.mayApproveScience).toBe(false);expect(a.mayPromoteGraph).toBe(false)}
  expect(byName.get("ATLAS")!.governedPublicationBy).toEqual(["ARBITER"]);
  expect(byName.get("ARBITER")!.nonResponsibilities.join(" ")).toContain("self-authorise");
  expect(byName.get("AEGIS")!.nonResponsibilities.join(" ")).toContain("hold a private key");
  expect(byName.get("SCOUT")!.nonResponsibilities.join(" ")).toContain("declare a source cleared");
 });
 test("only the capabilities that need a model are model-backed; verification is separate from investigation",()=>{
  expect(agents.filter(a=>a.modelBacked).map(a=>a.name).sort()).toEqual(["HELIX","LANTERN","VERITAS"]);
  for(const a of agents.filter(x=>x.modelBacked))expect(a.humanApproval.toLowerCase()).toMatch(/model|verifier/);
  expect(byName.get("VERITAS")!.dependsOn).toContain("LANTERN");
 });
 test("the dependency graph is acyclic and references only known names",()=>{
  const state=new Map<string,0|1|2>();
  const visit=(n:string,path:string[]=[])=>{
   if(state.get(n)===1)throw Error("cycle: "+[...path,n].join(" -> "));if(state.get(n)===2)return;
   state.set(n,1);for(const d of byName.get(n)!.dependsOn){expect(byName.has(d),`${n} -> ${d}`).toBe(true);visit(d,[...path,n])}state.set(n,2);
  };
  for(const a of agents)visit(a.name);
  expect(byName.get("NEXUS")!.dependsOn).toEqual([]);
 });
 test("the renamed agents use names that exist nowhere in the Aksh catalogue",()=>{
  const aksh=readFileSync(resolve("docs/AKSH_AGENTS_IN_HSI.md"),"utf8");
  for(const n of ["LANTERN","VANTAGE"]){expect(byName.has(n)).toBe(true);expect(new RegExp(`\\b${n}\\b`,"i").test(aksh)).toBe(false);expect(byName.get(n)!.nameCollision).toBeNull()}
  expect(byName.has("PRISM")).toBe(false);expect(byName.has("HORIZON")).toBe(false);
  expect(agents.filter(a=>a.nameCollision!==null).map(a=>a.name).sort()).toEqual(["ATLAS","NEXUS"]);
 });
 test("names that already belong to Aksh Health agents are flagged and namespaced so the four-product boundary stays clear",()=>{
  const aksh=readFileSync(resolve("docs/AKSH_AGENTS_IN_HSI.md"),"utf8");
  for(const a of agents){
   const collides=new RegExp(`\\b${a.name}\\b`).test(aksh);
   expect(a.nameCollision!==null,a.name).toBe(collides);
   if(collides)expect(a.displayName).toBe("HSI "+a.name);else expect(a.displayName).toBe(a.name);
  }
 });
 test("maturity is read from the register rows, and the rows added for the new capabilities are honest (partial, not implemented)",()=>{
  const row=(id:string)=>register.capabilities.find(c=>c.id===id)!;
  for(const id of ["F-11","F-12","F-13"]){expect(capabilityLevel(row(id).status)).toBe("partial");expect(row(id).gap.length).toBeGreaterThan(40)}
  expect(row("F-11").status).toContain("blocked");expect(row("F-13").status).toContain("synthetic_only");
 });
 test("the section renders into the status page only when a collective map exists",()=>{
  expect(renderCollectiveSection({capabilities:register.capabilities})).toBe("");
  const text=renderCollectiveSection(register);
  expect(text).toContain("## Collective map");expect(text).toContain("HSI NEXUS");expect(text).toContain("F-11: partial");expect(text).not.toContain("no register row yet");
  const bare:CollectiveMap={...register.collective,agents:[{...agents[0]!,registerIds:[]}]};expect(renderCollectiveSection({capabilities:register.capabilities,collective:bare})).toContain("no register row yet");
  expect(renderStatusMarkdown(register)).toContain("## Collective map");
 });
});
