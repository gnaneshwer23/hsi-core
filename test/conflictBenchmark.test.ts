import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {classifyWithHsi,cohensKappa,exampleHarnessRows,parseConflictCase,referenceLabel,renderConflictReport,renderExampleHarnessReport,runConflictBenchmark,EXAMPLE_HARNESS_FOCI,type ConflictCase} from "../src/evidence/conflictBenchmark";

const fixtures=(JSON.parse(readFileSync("evaluation/conflict-benchmark/fixtures/synthetic-cases.v1.json","utf8")) as unknown[]).map(parseConflictCase);
const predictions=JSON.parse(readFileSync("evaluation/conflict-benchmark/fixtures/synthetic-predictions.v1.json","utf8"));
const H={sourceId:"a",citation:"c",model:"human_in_vivo" as const,tissue:"serum",population:"adults",design:"cohort",negated:false};
const expertCase=(id:string,labels:[string,string],adjudicated:string|null=null):ConflictCase=>parseConflictCase({id,question:"q",provenance:"expert_curated",
 records:[H,{...H,sourceId:"b",negated:true}],labels:[{raterId:"R1",label:labels[0]},{raterId:"R2",label:labels[1]}],adjudicated});

describe("conflict benchmark: case parsing",()=>{
 test("accepts the fixtures",()=>expect(fixtures.length).toBe(6));
 test("rejects unknown fields, bad labels and duplicate raters",()=>{
  expect(()=>parseConflictCase({...fixtures[0],extra:1})).toThrow();
  expect(()=>parseConflictCase({...fixtures[0],labels:[{raterId:"R1",label:"maybe"}]})).toThrow();
  expect(()=>parseConflictCase({...fixtures[0],labels:[{raterId:"R1",label:"no_disagreement"},{raterId:"R1",label:"no_disagreement"}]})).toThrow();
 });
 test("an expert case needs two blind labels or an adjudicated label",()=>{
  expect(()=>parseConflictCase({id:"E1",question:"q",provenance:"expert_curated",records:[H],labels:[{raterId:"R1",label:"no_disagreement"}],adjudicated:null})).toThrow(/two blind labels/);
 });
});

describe("conflict benchmark: reference labels and agreement",()=>{
 test("adjudicated wins, unanimous counts, split without adjudication has no reference",()=>{
  expect(referenceLabel(fixtures[4]!)).toBe("true_contradiction");
  expect(referenceLabel(fixtures[0]!)).toBe("true_contradiction");
  expect(referenceLabel(fixtures[5]!)).toBeNull();
 });
 test("kappa is 1 for perfect agreement and undefined without pairs",()=>{
  expect(cohensKappa([expertCase("A",["true_contradiction","true_contradiction"]),expertCase("B",["no_disagreement","no_disagreement"])]).kappa).toBe(1);
  expect(cohensKappa([]).kappa).toBeNull();
 });
});

describe("conflict benchmark: HSI classifier mapping",()=>{
 test("maps each classifier class onto the expert label it claims",()=>{
  expect(fixtures.slice(0,5).map(classifyWithHsi)).toEqual(["true_contradiction","context_dependent","insufficient_context","no_disagreement","true_contradiction"]);
 });
});

describe("conflict benchmark: report",()=>{
 const r=runConflictBenchmark(fixtures,[predictions]);
 test("synthetic fixtures are harness-only and never publishable",()=>{
  expect(r.status).toBe("harness_only");expect(r.publishable).toBe(false);
  expect(r.notes[0]).toContain("says nothing about scientific accuracy");
 });
 test("excludes cases awaiting adjudication and scores the rest",()=>{
  expect(r.cases).toEqual({total:6,withReference:5,awaitingAdjudication:["SYN-06"]});
  expect(r.systems[0]!.accuracy).toBe(1);
 });
 test("scores comparators, counting no_answer as unanswered and wrong",()=>{
  const c=r.systems[1]!;
  expect(c.answered).toBe(4);expect(c.accuracy).toBeCloseTo(2/5);
  expect(c.recall.context_dependent).toBe(0);expect(c.confusion.true_contradiction.no_answer).toBe(1);
 });
 test("refuses to mix synthetic and expert cases, or score predictions for unknown cases",()=>{
  expect(()=>runConflictBenchmark([...fixtures,expertCase("E1",["true_contradiction","true_contradiction"])])).toThrow(/cannot be scored together/);
  expect(()=>runConflictBenchmark(fixtures,[{system:"x",method:"m",predictions:[{caseId:"NOPE",label:"no_disagreement"}]}])).toThrow(/unknown case/);
 });
 test("expert runs below 50 reference cases are not publishable",()=>{
  const e=runConflictBenchmark([expertCase("E1",["true_contradiction","true_contradiction"])]);
  expect(e.status).toBe("insufficient_reference_cases");expect(e.publishable).toBe(false);
 });
 test("low rater agreement blocks a run even with enough cases",()=>{
  const many=Array.from({length:60},(_,i)=>expertCase(`E${i}`,i%2?["true_contradiction","no_disagreement"]:["no_disagreement","true_contradiction"],"true_contradiction"));
  expect(runConflictBenchmark(many).status).toBe("rater_agreement_too_low");
 });
 test("enough agreed cases are ready but stay unpublishable until floors are approved",()=>{
  const many=Array.from({length:60},(_,i)=>expertCase(`E${i}`,i%2?["true_contradiction","true_contradiction"]:["no_disagreement","no_disagreement"]));
  const e=runConflictBenchmark(many);
  expect(e.status).toBe("ready");expect(e.publishable).toBe(false);expect(e.floors.ownerApproved).toBe(false);
 });
 test("example cases cover each harness focus and stay labelled Example",()=>{
  const cases=(JSON.parse(readFileSync("evaluation/conflict-benchmark/fixtures/example-cases.v1.json","utf8")) as unknown[]).map(parseConflictCase);
  const focus=JSON.parse(readFileSync("evaluation/conflict-benchmark/fixtures/example-case-focus.v1.json","utf8")) as {label:string;harnessOnly:boolean;provenance:string;focus:Record<string,string>};
  expect(focus.label).toBe("Example");expect(focus.harnessOnly).toBe(true);expect(focus.provenance).toBe("synthetic_fixture");
  const rows=exampleHarnessRows(cases,focus.focus);
  expect(rows.length).toBeGreaterThan(6);
  expect(new Set(rows.map(r=>r.focus))).toEqual(new Set(EXAMPLE_HARNESS_FOCI));
  expect(rows.every(r=>r.match)).toBe(true);
  expect(cases.every(c=>c.provenance==="synthetic_fixture"&&c.question.includes("EXAMPLE")&&c.question.includes("harness_only"))).toBe(true);
  const md=renderExampleHarnessReport(rows);
  expect(md).toContain("harness_only");expect(md).toContain("Example");expect(md).not.toContain("%");expect(md.toLowerCase()).not.toContain("accuracy");
 });
 test("the rendered report carries no case content",()=>{
  const md=renderConflictReport(r);
  expect(md).toContain("harness_only");expect(md).not.toContain("Synthetic record A");expect(md).not.toContain("fixture-rater");
 });
});
