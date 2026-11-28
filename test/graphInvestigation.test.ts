import {describe,expect,it} from "bun:test";
import {readFileSync} from "node:fs";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {
 CANDIDATE_DESIGN_NOTE,buildGraphModel,crossDomainSlice,experimentBrief,gapView,modeById,questionPathAssertions,questionView,questionsInView,
} from "../src/graphWorkspace";

const bundle=parseDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")));
const model=buildGraphModel(bundle);
const slice=crossDomainSlice(model,"immunology","microbiome");

describe("recorded questions as candidate hypotheses",()=>{
 it("every question is a candidate, never validated, and its experiment is never a protocol",()=>{
  expect(model.questions.length).toBe(4);
  for(const q of model.questions){
   const v=questionView(model,q);
   expect(v.hypothesis).toMatchObject({status:"candidate_question",validated:false});
   expect(v.experiment).toMatchObject({status:"candidate_design",protocol:false});
   expect(v.hypothesis.falsifier.length).toBeGreaterThan(10);
   expect(v.experiment.controls.length).toBeGreaterThan(0);
  }
 });
 it("links each question to its recorded gaps, and each gap back to its questions",()=>{
  for(const q of model.questions){
   const v=questionView(model,q);
   expect(v.gaps.map(g=>g.id)).toEqual(q.gapIds);
   for(const g of v.gaps)expect(g.questionIds).toContain(q.id);
  }
 });
 it("reports when no association chain connects a question's concepts instead of inventing one",()=>{
  const chains=model.questions.map(q=>questionView(model,q).chains.length);
  expect(chains.filter(n=>n===0).length).toBe(2);
  expect(chains.filter(n=>n>0).length).toBe(2);
  for(const q of model.questions)for(const c of questionView(model,q).chains){
   expect(c.kind).toBe("association_chain");
   expect(c.nodeIds[0]).toBe(q.fromId);expect(c.nodeIds.at(-1)).toBe(q.toId);
  }
 });
});

describe("gaps",()=>{
 it("keep the suggested next study a candidate, not a protocol",()=>{
  for(const g of model.gaps){const v=gapView(model,g);expect(v.nextStudy).toMatchObject({status:"candidate",protocol:false})}
 });
});

describe("selection for the hypothesis and experimental modes",()=>{
 it("keeps only relationships on a question's chains or touching its concepts, within the view",()=>{
  const sel=questionPathAssertions(model,slice.assertions);
  expect(sel.length).toBeGreaterThan(0);expect(sel.length).toBeLessThan(slice.assertions.length);
  const ids=new Set(slice.assertions.map(a=>a.id));
  for(const a of sel)expect(ids.has(a.id)).toBe(true);
 });
 it("finds the questions relevant to the immunology–microbiome slice",()=>{
  expect(questionsInView(model,slice.assertions).length).toBeGreaterThan(0);
 });
 it("the modes say they are candidate questions and candidate designs",()=>{
  expect(modeById.hypothesis.readinessNote).toContain("not validated");
  expect(modeById.experimental.readinessNote).toContain("never validated protocols");
 });
});

describe("experiment brief",()=>{
 it("carries the candidate status, the falsifier, the controls and the graph version",()=>{
  const v=questionView(model,model.questions[0]!);
  const md=experimentBrief(model,v);
  expect(md).toContain(CANDIDATE_DESIGN_NOTE);
  expect(md).toContain(v.hypothesis.falsifier);
  for(const c of v.experiment.controls)expect(md).toContain(c);
  expect(md).toContain(model.version);
  expect(md.toLowerCase()).not.toMatch(/\bvalidated protocol\b(?! *\.)|\bproven\b|\bconfirmed\b/);
 });
});
