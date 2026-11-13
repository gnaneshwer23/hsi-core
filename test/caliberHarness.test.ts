import {expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {runFixtureInvestigation} from "../src/investigationRunner";
import {pairKey,scoreCaliber,validateAdjudication,type CaliberCase} from "../src/caliberHarness";

const fx=JSON.parse(readFileSync(new URL("../research/runner-fixtures/gut-immune-metabolic-crossdomain.v1.json",import.meta.url),"utf8"));
const tranche=JSON.parse(readFileSync(new URL("../research/caliber/cross-domain-tranche.v1.json",import.meta.url),"utf8"));
const run=async()=>{const a=await runFixtureInvestigation({fixture:fx}),b=await runFixtureInvestigation({fixture:fx});return {first:a.audit,second:b.audit}};
const human=[{principal:"user:expert-1",conflictDeclared:true as const},{principal:"user:expert-2",conflictDeclared:true as const}];

test("the tranche file is 20 unlabelled slots: no passages, no labels, awaiting a scientist",()=>{
 expect(tranche.cases.length).toBe(20);expect(tranche.status).toBe("awaiting_scientist");
 for(const c of tranche.cases){expect(c.kind).toBe("awaiting_scientist");expect(c.passages).toBeNull();expect(c.adjudication.status).toBe("unadjudicated");expect(JSON.stringify(c)).not.toContain("expected")}
 expect(new Set(tranche.cases.map((c:{scope:string})=>c.scope)).size).toBe(3);
});
test("with no adjudicated cases no accuracy is reported, and the engineering regression is checked for reproducibility only",async()=>{
 const c:CaliberCase={id:"eng-1",kind:"engineering_regression",scope:"gut-immune-metabolic",adjudication:{status:"unadjudicated"}};
 const r=scoreCaliber([c],[{caseId:"eng-1",...await run()}]);
 expect(r.accuracy).toEqual({correct:0,of:0,rate:null});expect(r.reproducibility).toEqual({identical:1,of:1,rate:1});
 expect(r.note).toContain("no accuracy");expect(r.excluded[0]!.reason).toContain("reproducibility only");expect(r.safety.approvedOrPromotable).toBe(0);
});
test("adjudication needs two distinct human adjudicators with declared conflicts and a review reference",()=>{
 const ok={status:"adjudicated" as const,adjudicators:human,reviewRef:"review:panel-1",expected:[{pairKey:"a|b",classification:"consistent" as const}]};
 expect(validateAdjudication(ok)).toEqual([]);
 expect(validateAdjudication({...ok,adjudicators:[human[0]!]})).not.toEqual([]);
 expect(validateAdjudication({...ok,adjudicators:[human[0]!,human[0]!]})).not.toEqual([]);
 expect(validateAdjudication({...ok,adjudicators:[human[0]!,{principal:"model:judge",conflictDeclared:true}]})).not.toEqual([]);
 expect(validateAdjudication({...ok,reviewRef:""})).not.toEqual([]);
});
test("a valid adjudicated case is scored with denominators; an invalid one is excluded, not counted",async()=>{
 const r1=await run(),cmp=r1.first.comparisons[0]!,key=pairKey(cmp.left.id,cmp.right.id);
 expect(key).not.toContain("undefined");
 const actual=r1.first.report.find(r=>r.comparisonId===cmp.id)!.classification;
 const good:CaliberCase={id:"b1",kind:"adjudicated_benchmark",scope:"gut-immune-metabolic",adjudication:{status:"adjudicated",adjudicators:human,reviewRef:"review:panel-1",expected:[{pairKey:key,classification:actual}]}};
 const bad:CaliberCase={...good,id:"b2",adjudication:{...(good.adjudication as object),adjudicators:[human[0]!]} as never};
 const r=scoreCaliber([good,bad],[{caseId:"b1",...r1},{caseId:"b2",...r1}]);
 expect(r.adjudicatedCases).toBe(1);expect(r.accuracy).toEqual({correct:1,of:1,rate:1});expect(r.excluded.map(e=>e.caseId)).toEqual(["b2"]);
});
test("a run that approves or promotes anything is counted as a safety failure",async()=>{
 const r1=await run();const c:CaliberCase={id:"e",kind:"engineering_regression",scope:"x",adjudication:{status:"unadjudicated"}};
 const r=scoreCaliber([c],[{caseId:"e",first:{...r1.first,graphPromotable:true as never}}]);expect(r.safety.approvedOrPromotable).toBe(1);
});
