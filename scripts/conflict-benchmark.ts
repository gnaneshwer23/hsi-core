/**
 * Runs HSI-BENCH-CONFLICT.
 *
 *   bun run conflict:bench:fixture   synthetic fixtures only (CI / harness)
 *   bun run conflict:bench:check     fixture assertions for `bun run check`
 *   bun run conflict:bench:expert    private vault only (A4.2)
 *   bun run conflict:bench           same as :expert (default is private vault)
 *
 * Expert reports never leave `.hsi-private-benchmark/`. Fixture paths are unchanged.
 */
import {existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {
  parseConflictCase,
  renderConflictReport,
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
  console.log(JSON.stringify({
    benchmark:report.benchmark,
    status:report.status,
    mode:"fixture",
    fixtureCases:report.cases.total,
    hsiFixtureAccuracy:hsi.accuracy,
    comparators:report.systems.length-1,
    fixturePathUnchanged:true,
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
