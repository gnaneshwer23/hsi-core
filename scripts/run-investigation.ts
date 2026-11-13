/** Local investigation runner. Usage: bun scripts/run-investigation.ts --fixture <name|path> [--out <dir>] [--json]
 * Fixture mode only: replays recorded synthetic inputs, makes no network or model call, and writes an append-only,
 * hash-chained audit under --out (default out/investigations, which is git-ignored).
 * Live mode (--mode live, optional --config file, --dry-run with --question) reports readiness and the planned requests only; it cannot execute yet.
 */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {runFixtureInvestigation} from "../src/investigationRunner";
import {assessLiveReadiness,renderReadiness} from "../src/liveReadiness";
import {planLiveRequests} from "../src/liveSearch";

const args=process.argv.slice(2);
const flag=(name:string)=>{const i=args.indexOf(name);return i>=0?args[i+1]:undefined};
if(flag("--mode")==="live"||args.includes("--live")){
 // Live mode is not executable yet. This path only reports readiness and, with --dry-run, the exact requests a run would make.
 const configPath=flag("--config");
 let config:unknown;
 if(configPath){try{config=JSON.parse(readFileSync(resolve(configPath),"utf8"))}catch{console.error(`Cannot read a JSON configuration at ${configPath}`);process.exit(2)}}
 if(args.includes("--preflight")){
  const icPath=flag("--integrity-config");let integrityConfig:unknown;
  if(icPath){try{integrityConfig=JSON.parse(readFileSync(resolve(icPath),"utf8"))}catch{console.error(`Cannot read a JSON integrity configuration at ${icPath}`);process.exit(2)}}
  const {runLivePreflight,renderPreflight}=await import("../src/livePreflight");
  const report=await runLivePreflight({config,integrityConfig,env:process.env});
  console.log(renderPreflight(report));process.exit(report.ready?0:3);
 }
 if(args.includes("--execute")){
  const {runLiveExecute,loadFileDeps}=await import("../src/liveExecute");
  const need=(n:string)=>{const v=flag(n);if(!v){console.error(`--execute needs ${n}`);process.exit(2)}return v};
  const readline=await import("node:readline/promises");
  const outcome=await runLiveExecute({configPath:resolve(need("--config")),integrityConfigPath:resolve(need("--integrity-config")),question:need("--question"),scope:need("--scope"),reviewer:need("--reviewer"),outDir:resolve(flag("--out")??"out/live"),sentinel:{directory:resolve(need("--sentinel-dir")),intervalMs:Number(flag("--sentinel-interval-minutes")??60)*60_000}},{
   env:process.env,readJson:p=>JSON.parse(readFileSync(p,"utf8")),loadDeps:loadFileDeps,
   confirm:async prompt=>{if(!process.stdin.isTTY)return null;const rl=readline.createInterface({input:process.stdin,output:process.stdout});try{return await rl.question(prompt+"\n> ")}finally{rl.close()}},
  });
  console.log(JSON.stringify(outcome,null,2));process.exit(outcome.ok?0:3);
 }
 const readiness=assessLiveReadiness(config,process.env);
 console.log(renderReadiness(readiness));
 if(args.includes("--dry-run")){
  const question=flag("--question");
  if(!question){console.error("--dry-run needs --question and optionally --terms with comma separated pathway terms");process.exit(2)}
  const plan=planLiveRequests(question,{extraTerms:(flag("--terms")??"").split(",").map(t=>t.trim()).filter(Boolean)});
  console.log("## Planned requests (nothing was sent)");
  for(const r of plan.requests)console.log(`- ${r.method} ${r.purpose}: ${r.url}`);
  console.log(`- GET up to ${plan.fullTextFetches.maxTotal} full texts: ${plan.fullTextFetches.urlPattern}`);
  console.log(`- Hosts: ${plan.hosts.join(", ")}; at most ${plan.maxRequests} requests; search terms: ${plan.terms.join(", ")}; ranking terms: ${plan.rankingTerms.join(", ")}; passages go to a model only after a signed clearance permits it`);
  process.exit(0);
 }
 console.error("Live execution needs --execute with --integrity-config, --question, --scope and --reviewer user:<name>; see docs/LIVE_RUN_RUNBOOK.md.");
 process.exit(2);
}
const fixtureArg=flag("--fixture");
if(!fixtureArg){console.error("Usage: bun scripts/run-investigation.ts --fixture <name|path> [--out <dir>] [--json]");process.exit(2)}
const path=/[\\/]/.test(fixtureArg)?resolve(fixtureArg):resolve(import.meta.dir,"..","research","runner-fixtures",`${fixtureArg}.v1.json`);
let fixture:unknown;
try{fixture=JSON.parse(readFileSync(path,"utf8"))}catch{console.error(`Cannot read a JSON fixture at ${path}`);process.exit(2)}
if(args.includes("--pipeline")){
 try{
  const {runCollectivePipeline}=await import("../src/collectivePipeline");
  const out=resolve(flag("--out")??"out/investigations");
  const r=await runCollectivePipeline({fixture,storeDirectory:out,jobDirectory:resolve(out,"jobs")});
  console.log(JSON.stringify({notice:r.notice,job:r.job,auditHash:r.run?.audit.auditHash??null,packetFlags:r.packet?.flags.map(f=>f.code)??[],proposals:r.proposals?.proposals.length??0,refused:r.proposals?.refused.length??0,gaps:r.vantage?.gaps.length??0,followUps:r.vantage?.followUps.length??0},null,2));
  process.exit(0);
 }catch(error){console.error(`Pipeline refused: ${error instanceof Error?error.message:"unknown error"}`);process.exit(1)}
}
try{
 const result=await runFixtureInvestigation({fixture,storeDirectory:resolve(flag("--out")??"out/investigations")});
 console.log(args.includes("--json")?JSON.stringify({notice:result.notice,auditHash:result.audit.auditHash,version:result.audit.version,scope:result.audit.diseaseScope,verifier:result.audit.verifier,report:result.audit.report,rejections:result.rejections,orientation:result.orientation?{entities:result.orientation.entities,searchTerms:result.orientation.searchTerms,navigationOnly:true}:null},null,1):result.brief);
}catch(error){console.error(`Run failed: ${error instanceof Error?error.message:"unknown error"}`);process.exit(1)}
