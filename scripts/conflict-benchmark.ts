/**
 * Runs HSI-BENCH-CONFLICT.
 *
 *   bun run conflict:bench:fixture   synthetic fixtures only (CI / harness)
 *   bun run conflict:bench:check     fixture assertions for `bun run check`
 *   bun run conflict:bench:report    local Example harness listing (no accuracy figure)
 *   bun run conflict:bench:expert    private vault only (A4.2)
 *   bun run conflict:bench           same as :expert (default is private vault)
 *
 * Expert reports never leave `.hsi-private-benchmark/`. Fixture paths are unchanged.
 */
import {existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {
  exampleHarnessRows,
  parseConflictCase,
  renderConflictReport,
  renderExampleHarnessReport,
  runConflictBenchmark,
  type ConflictCase,
  type SystemPredictions,
} from "../src/evidence/conflictBenchmark";
import {
  assertExpertCases,
  expertPathBlockedPayload,
  resolveConflictBenchPaths,
  type ConflictBenchMode,
} from "../src/evidence/conflictBenchmarkExpertPath";

const root=resolve(import.meta.dir,"..");
const args=process.argv.slice(2);
const flag=(name:string)=>args.includes(name);
const values=(name:string)=>args.flatMap((a,i)=>a===name&&args[i+1]?[args[i+1]!]:[]);
const EXAMPLE_CASES=join(root,"evaluation/conflict-benchmark/fixtures/example-cases.v1.json");
const EXAMPLE_FOCUS=join(root,"evaluation/conflict-benchmark/fixtures/example-case-focus.v1.json");
const EXAMPLE_REPORTS=join(root,"evaluation/conflict-benchmark/reports/example");

function loadExampleHarness(){
  const focusFile=JSON.parse(readFileSync(EXAMPLE_FOCUS,"utf8")) as {label?:string;harnessOnly?:boolean;provenance?:string;focus?:Record<string,string>};
  if(focusFile.label!=="Example"||focusFile.harnessOnly!==true||focusFile.provenance!=="synthetic_fixture"||!focusFile.focus){
    throw Error("Example focus file must stay labelled Example, harness_only, synthetic_fixture");
  }
  const cases=(JSON.parse(readFileSync(EXAMPLE_CASES,"utf8")) as unknown[]).map(parseConflictCase);
  return exampleHarnessRows(cases,focusFile.focus);
}

if(flag("--example-report")){
  if(flag("--check")||flag("--fixture")||flag("--expert"))throw Error("--example-report cannot be combined with fixture, check, or expert mode");
  const rows=loadExampleHarness();
  const missed=rows.filter(r=>!r.match).map(r=>r.id);
  if(missed.length)throw Error(`Example harness label mismatch: ${missed.join(", ")}`);
  mkdirSync(EXAMPLE_REPORTS,{recursive:true});
  const stamp=new Date().toISOString().replaceAll(":","-");
  const base=join(EXAMPLE_REPORTS,`${stamp}-example-harness`);
  const markdown=renderExampleHarnessReport(rows);
  writeFileSync(`${base}.md`,markdown);
  writeFileSync(`${base}.json`,`${JSON.stringify({
    benchmark:"HSI-BENCH-CONFLICT",
    status:"harness_only",
    publishable:false,
    label:"Example",
    provenance:"synthetic_fixture",
    scientificApproval:false,
    statesAccuracy:false,
    cases:rows,
  },null,2)}\n`);
  console.log(markdown);
  console.log(JSON.stringify({
    written:`${base.replace(`${root}/`,"")}.md`,
    status:"harness_only",
    publishable:false,
    label:"Example",
    cases:rows.length,
    statesAccuracy:false,
    scientificApproval:false,
  },null,2));
  process.exit(0);
}

const fixtureMode=flag("--fixture")||flag("--check");
const mode:ConflictBenchMode=fixtureMode?"fixture":"expert";
if(fixtureMode&&flag("--expert"))throw Error("Cannot combine --fixture/--check with --expert");

const paths=resolveConflictBenchPaths({
  repoRoot:root,
  mode,
  casesOverride:values("--cases")[0],
  predictionOverrides:values("--predictions"),
  outOverride:values("--out")[0],
});

if(!existsSync(paths.casesPath)){
  if(mode==="expert"){
    console.log(JSON.stringify(expertPathBlockedPayload(paths.casesPath.replace(`${root}/`,"")),null,2));
    process.exit(0);
  }
  throw Error(`Missing fixture cases: ${paths.casesPath}`);
}

const load=(p:string):unknown=>JSON.parse(readFileSync(p,"utf8"));
const raw=load(paths.casesPath);
const caseList=Array.isArray(raw)?raw:(raw==null?[]:[raw]);
if(mode==="expert"&&caseList.length===0){
  console.log(JSON.stringify(expertPathBlockedPayload(paths.casesPath.replace(`${root}/`,"")),null,2));
  process.exit(0);
}
const cases:ConflictCase[]=caseList.map(parseConflictCase);
if(mode==="expert")assertExpertCases(cases);

const external=paths.predictionPaths.filter(existsSync).map(p=>load(p) as SystemPredictions);
const report=runConflictBenchmark(cases,external);

if(flag("--check")){
  const hsi=report.systems[0]!;
  if(paths.mode!=="fixture")throw Error("conflict:bench:check must use the fixture path");
  if(report.status!=="harness_only"||report.publishable)throw Error("Fixture run must be harness_only and unpublishable");
  if(hsi.accuracy!==1)throw Error(`Classifier no longer matches its fixture labels (accuracy ${hsi.accuracy})`);
  const examples=loadExampleHarness();
  if(examples.some(r=>!r.match))throw Error("Example harness cases no longer match their expected labels");
  console.log(JSON.stringify({
    benchmark:report.benchmark,
    status:report.status,
    mode:"fixture",
    fixtureCases:report.cases.total,
    hsiFixtureAccuracy:hsi.accuracy,
    comparators:report.systems.length-1,
    fixturePathUnchanged:true,
    exampleCases:examples.length,
    exampleHarnessOnly:true,
    exampleStatesAccuracy:false,
  }));
  process.exit(0);
}

if(paths.outDir.startsWith(join(root,"site")))throw Error("Benchmark reports are never written into the public site");
if(mode==="expert"&&paths.outDir.startsWith(join(root,"evaluation"))){
  throw Error("Expert reports cannot be written under evaluation/; use the private vault");
}

mkdirSync(paths.outDir,{recursive:true});
const stamp=new Date().toISOString().slice(0,10);
const n=readdirSync(paths.outDir).filter(f=>f.startsWith(stamp)).length/2+1;
const base=join(paths.outDir,`${stamp}-${String(n).padStart(2,"0")}`);
const publicReport={
  ...report,
  mode,
  // Aggregate metrics and case ids only — already true of renderConflictReport / runConflictBenchmark.
};
writeFileSync(`${base}.json`,`${JSON.stringify(publicReport,null,2)}\n`);
writeFileSync(`${base}.md`,renderConflictReport(report)+(mode==="expert"?"\n\nMode: expert (private vault). Fixture harness unchanged.\n":"\n\nMode: fixture (harness only).\n"));
console.log(renderConflictReport(report));
console.log(JSON.stringify({
  written:`${base.replace(`${root}/`,"")}.json`,
  mode,
  cases:report.cases.total,
  withReference:report.cases.withReference,
  status:report.status,
  publishable:report.publishable,
  scientificApproval:false,
  fixturePathUnchanged:mode==="fixture",
  expertMode:mode==="expert",
},null,2));
