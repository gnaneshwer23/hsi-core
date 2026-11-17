#!/usr/bin/env bun
/**
 * Runs HSI-BENCH-CONFLICT.
 *   bun run conflict:bench                      expert cases from the private vault (.hsi-private-benchmark/conflict/)
 *   bun run conflict:bench -- --predictions a.json --predictions b.json   add hand-run comparator answers
 *   bun run conflict:bench:fixture              synthetic fixtures only; tests the harness, never a result
 *   bun run conflict:bench:check                fixture run with assertions, used by `bun run check`
 * Reports hold aggregate metrics and case ids only. Expert cases and labels never leave the private vault.
 */
import {existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {parseConflictCase,renderConflictReport,runConflictBenchmark,type ConflictCase,type SystemPredictions} from "../src/evidence/conflictBenchmark";

const root=resolve(import.meta.dir,"..");
const args=process.argv.slice(2);
const flag=(name:string)=>args.includes(name);
const values=(name:string)=>args.flatMap((a,i)=>a===name&&args[i+1]?[args[i+1]!]:[]);
const fixtureMode=flag("--fixture")||flag("--check");
const fixtureDir=join(root,"evaluation/conflict-benchmark/fixtures");
const casesPath=values("--cases")[0]??(fixtureMode?join(fixtureDir,"synthetic-cases.v1.json"):join(root,".hsi-private-benchmark/conflict/cases.json"));
const predictionPaths=values("--predictions").length?values("--predictions"):fixtureMode?[join(fixtureDir,"synthetic-predictions.v1.json")]:[];

if(!existsSync(casesPath)){
 console.log(JSON.stringify({benchmark:"HSI-BENCH-CONFLICT",status:"BLOCKED",reason:"No expert-curated cases in the private vault yet",expected:casesPath.replace(`${root}/`,"")},null,2));
 process.exit(0);
}
const load=(p:string):unknown=>JSON.parse(readFileSync(p,"utf8"));
const raw=load(casesPath);
const cases:ConflictCase[]=(Array.isArray(raw)?raw:[raw]).map(parseConflictCase);
const external=predictionPaths.map(p=>load(p) as SystemPredictions);
const report=runConflictBenchmark(cases,external);

if(flag("--check")){
 const hsi=report.systems[0]!;
 if(report.status!=="harness_only"||report.publishable)throw Error("Fixture run must be harness_only and unpublishable");
 if(hsi.accuracy!==1)throw Error(`Classifier no longer matches its fixture labels (accuracy ${hsi.accuracy})`);
 console.log(JSON.stringify({benchmark:report.benchmark,status:report.status,fixtureCases:report.cases.total,hsiFixtureAccuracy:hsi.accuracy,comparators:report.systems.length-1}));
 process.exit(0);
}

const outDir=resolve(values("--out")[0]??join(root,fixtureMode?"evaluation/conflict-benchmark/reports/fixture":".hsi-private-benchmark/conflict/reports"));
if(outDir.startsWith(join(root,"site")))throw Error("Benchmark reports are never written into the public site");
mkdirSync(outDir,{recursive:true});
const stamp=new Date().toISOString().slice(0,10);
const n=readdirSync(outDir).filter(f=>f.startsWith(stamp)).length/2+1;
const base=join(outDir,`${stamp}-${String(n).padStart(2,"0")}`);
writeFileSync(`${base}.json`,`${JSON.stringify(report,null,2)}\n`);
writeFileSync(`${base}.md`,renderConflictReport(report));
console.log(renderConflictReport(report));
console.log(`Written: ${base.replace(`${root}/`,"")}.json and .md`);
