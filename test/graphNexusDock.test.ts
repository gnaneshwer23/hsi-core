import {describe,expect,it} from "bun:test";
import {readFileSync} from "node:fs";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {SELECTION_LIMITS,buildInvestigationRecord,buildSelectionContext,investigateSelection,verifyInvestigationRecord} from "../src/knowledgeGraph/graphAgents";
import {EMPTY_DOCK,MODEL_INTERPRETATION,addToDock,agentReadiness,buildGraphModel,comparisonUnits,disagreements,dockInvestigationId,removeFromDock,suggestedQuestion} from "../src/graphWorkspace";

const bundle=parseDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")));
const model=buildGraphModel(bundle);

describe("dock selection",()=>{
 it("adds within the agents' limits and refuses, with the reason, what would exceed them",()=>{
  const ids=model.assertions.slice(0,SELECTION_LIMITS.maxEdges+2).map(a=>a.id);
  const ok=addToDock(EMPTY_DOCK,{edgeIds:ids.slice(0,SELECTION_LIMITS.maxEdges)});
  expect(ok.refused).toBeNull();expect(ok.selection.edgeIds.length).toBe(SELECTION_LIMITS.maxEdges);
  const over=addToDock(ok.selection,{edgeIds:ids.slice(SELECTION_LIMITS.maxEdges)});
  expect(over.selection).toBe(ok.selection);
  expect(over.refused).toContain("exceed the selection limit by 2 relationships");
 });
 it("de-duplicates and removes",()=>{
  const a=model.assertions[0]!;
  const s=addToDock(addToDock(EMPTY_DOCK,{edgeIds:[a.id],nodeIds:[a.subject.id]}).selection,{edgeIds:[a.id]}).selection;
  expect(s.edgeIds).toEqual([a.id]);
  expect(removeFromDock(s,a.id).edgeIds).toEqual([]);
 });
 it("says what each agent needs before it runs",()=>{
  expect(agentReadiness(EMPTY_DOCK).every(r=>!r.ready)).toBe(true);
  const two=agentReadiness({nodeIds:["a","b"],edgeIds:[]});
  expect(two.find(r=>r.agent==="HELIX")!.ready).toBe(true);
  expect(two.find(r=>r.agent==="PARALLAX")!.why).toContain("at least two relationships");
 });
 it("gives the same investigation id for the same selection in any order, valid for the agents' schema",()=>{
  const a=dockInvestigationId(model.version,{nodeIds:["x","y"],edgeIds:["e1"]}),b=dockInvestigationId(model.version,{nodeIds:["y","x"],edgeIds:["e1"]});
  expect(a).toBe(b);expect(a).toMatch(/^[A-Za-z0-9][A-Za-z0-9:_-]{2,80}$/);
 });
});

describe("agents over a dock selection, on the real graph",()=>{
 const unit=disagreements(comparisonUnits(model,model.assertions)).find(u=>u.kind==="pair")!;
 const sel={nodeIds:[] as string[],edgeIds:unit.assertionIds.slice(0,4)};
 const ctx=buildSelectionContext(bundle,{investigationId:dockInvestigationId(model.version,sel),graphVersion:model.version,question:suggestedQuestion("contradiction",sel,model),nodeIds:sel.nodeIds,edgeIds:sel.edgeIds});
 it("every answer is a deterministic candidate that cannot change the graph",()=>{
  for(const agent of ["PARALLAX","VANTAGE","HELIX"] as const){
   const r=investigateSelection(bundle,ctx,agent);
   expect(r).toMatchObject({deterministic:true,modelBacked:false,reviewState:"candidate_finding",scientificApproval:false,graphPromotable:false,proposedGraphChange:null});
   expect(investigateSelection(bundle,ctx,agent)).toEqual(r);
  }
 });
 it("PARALLAX on a recorded disagreement never confirms a contradiction",()=>{
  const r=investigateSelection(bundle,ctx,"PARALLAX");
  expect(r.findings.length).toBeGreaterThan(0);
  for(const f of r.findings)expect(`${f.title} ${f.detail}`.toLowerCase()).not.toMatch(/\bconfirmed contradiction\b(?!.*not)|\bresolved\b/);
 });
 it("the record built from a dock selection verifies as reproducible",()=>{
  expect(verifyInvestigationRecord(bundle,buildInvestigationRecord(bundle,ctx))).toEqual([]);
 });
 it("model-backed interpretation is off, with the reason",()=>{
  expect(MODEL_INTERPRETATION.enabled).toBe(false);
  expect(MODEL_INTERPRETATION.reason).toContain("not enabled");
 });
});
