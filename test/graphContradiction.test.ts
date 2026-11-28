import {describe,expect,it} from "bun:test";
import {readFileSync} from "node:fs";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {breakdownForConcept,breakdownForPair} from "../src/knowledgeGraph/contextBreakdown";
import {assessConflict} from "../src/knowledgeGraph/contextConflict";
import {buildGraphModel,candidateChecks,compareAssertions,comparisonUnits,crossDomainSlice,disagreements,READING_LABEL} from "../src/graphWorkspace";

const bundle=parseDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")));
const model=buildGraphModel(bundle);
const all=comparisonUnits(model,model.assertions);
const dis=disagreements(all);

describe("contradiction units over the published graph",()=>{
 it("uses the existing classifier: every unit's class equals assessConflict over the full records",()=>{
  expect(all.length).toBeGreaterThan(0);
  for(const u of all){
   const b=u.kind==="pair"?breakdownForPair(bundle,u.subjectId,u.objectId!):breakdownForConcept(bundle,u.subjectId);
   expect(u.conflict).toBe(assessConflict(b).classification);
   expect(u.adjudication).toBe("not_performed");
   expect(u.limits.join(" ")).toContain("does not decide which finding is correct");
  }
 });
 it("finds the real disagreements and keeps the distinctions apart",()=>{
  const readings=new Set(dis.map(u=>u.reading));
  expect(readings.has("context_dependence")).toBe(true);
  expect(readings.has("potential_contradiction")).toBe(true);
  expect(readings.has("insufficient_context")).toBe(true);
  for(const u of dis)expect(u.statement.toLowerCase()).not.toMatch(/\bresolved\b|\bconfirmed\b|\bcorrect finding\b/);
 });
 it("orders potential contradictions first and never reports a pair with fewer than two records",()=>{
  const rank=dis.map(u=>u.reading);
  expect(rank.indexOf("potential_contradiction")).toBeLessThan(rank.lastIndexOf("insufficient_context"));
  for(const u of all.filter(x=>x.kind==="pair"))expect(u.assertionIds.length).toBeGreaterThan(1);
 });
 it("the immunology–microbiome slice records no disagreement, and says so rather than inventing one",()=>{
  const slice=crossDomainSlice(model,"immunology","microbiome");
  expect(disagreements(comparisonUnits(model,slice.assertions))).toEqual([]);
 });
 it("a unit is never understated: its records come from the whole graph, not only the view",()=>{
  const u=dis.find(x=>x.kind==="pair")!;
  const narrow=model.assertions.filter(a=>a.id===u.assertionIds[0]);
  const again=comparisonUnits(model,narrow).find(x=>x.id===u.id)!;
  expect(again.assertionIds).toEqual(u.assertionIds);
 });
 it("labels read plainly",()=>{
  expect(READING_LABEL.potential_contradiction).toBe("Potential contradiction");
  expect(Object.values(READING_LABEL).join(" ")).not.toMatch(/resolved|confirmed|proven/i);
 });
});

describe("side-by-side comparison",()=>{
 const unit=dis.find(u=>u.kind==="pair")!;
 const recs=unit.assertionIds.map(id=>model.assertions.find(a=>a.id===id)!);
 const cmp=compareAssertions(recs);
 it("compares direction and each recorded context variable, and never decides",()=>{
  expect(cmp.adjudication).toBe("not_performed");
  expect(cmp.rows[0]!.key).toBe("direction");
  expect(cmp.rows).toHaveLength(9);
  expect(cmp.rows.every(r=>r.cells.length===recs.length)).toBe(true);
  expect(cmp.rows[0]!.status).toBe("differs"); // a disagreement pair differs in direction
 });
 it("a variable missing on one side is 'cannot tell', never 'differs'",()=>{
  const a=model.assertions.find(x=>x.context.tissue.state==="stated")!;
  const b=model.assertions.find(x=>x.context.tissue.state==="not_stated")!;
  const row=compareAssertions([a,b]).rows.find(r=>r.key==="tissue")!;
  expect(row.status).toBe("cannot_tell");
  expect(compareAssertions([b,b]).rows.find(r=>r.key==="tissue")!.status).toBe("not_stated_by_any");
  expect(compareAssertions([a,a]).rows.find(r=>r.key==="tissue")!.status).toBe("same");
 });
 it("a stated difference is 'differs', case-insensitively equal values are 'same'",()=>{
  const mouse=model.assertions.find(x=>x.context.species.state==="stated"&&x.context.species.value==="Mouse")!;
  const human=model.assertions.find(x=>x.context.species.state==="stated"&&x.context.species.value==="Human")!;
  expect(compareAssertions([mouse,human]).rows.find(r=>r.key==="species")!.status).toBe("differs");
  expect(compareAssertions([mouse,{...mouse,id:"x",context:{...mouse.context,species:{state:"stated",value:"  MOUSE "}}}]).rows.find(r=>r.key==="species")!.status).toBe("same");
 });
 it("caps a comparison at six findings",()=>{
  expect(compareAssertions(model.assertions.slice(0,10)).assertionIds).toHaveLength(6);
 });
 it("candidate checks follow the differing and unknown variables and are never protocols",()=>{
  const checks=candidateChecks(cmp,model,[unit.subjectId,unit.objectId!]);
  expect(checks.length).toBeGreaterThan(0);
  for(const c of checks){expect(["differs","cannot_tell","recorded_gap"]).toContain(c.basis);expect(c.text).not.toMatch(/should win|is correct|proves/i)}
  expect(checks.every(c=>c.text.length>20)).toBe(true);
  expect(checks.length).toBeLessThanOrEqual(8);
 });
});
