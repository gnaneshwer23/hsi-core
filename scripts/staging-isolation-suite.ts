#!/usr/bin/env bun
/**
 * A3.2 — two-account isolation suite CLI.
 * --check / --fixture are CI-safe. Live mode requires owner env and never lifts holds.
 */
import {execSync} from "node:child_process";
import {createStagingIsolationSuite,type IsolationSuiteMode} from "../src/db/stagingIsolationSuite";
import {assertCatalogComplete,catalogCoverage} from "../src/db/isolationProbeCatalog";
import {HELD_MIGRATION_IDS} from "../src/db/migrationHolds";
import type {PersistenceScope} from "../src/db/migrationRehearsal";
import {PERSISTENCE_SCOPE_MIGRATIONS} from "../src/db/migrationRehearsal";

function arg(name:string):string|undefined{
 const i=process.argv.indexOf(name);
 return i>=0?process.argv[i+1]:undefined;
}

function requireEnv(name:string):string{
 const v=process.env[name];
 if(!v){
  console.error(JSON.stringify({error:`Missing required env ${name}`}));
  process.exit(1);
 }
 return v;
}

const check=process.argv.includes("--check");
const fixture=process.argv.includes("--fixture");
const live=process.argv.includes("--live");
const scopeRaw=arg("--scope")??"interrogative_workspace";

if(!Object.hasOwn(PERSISTENCE_SCOPE_MIGRATIONS,scopeRaw)){
 console.error(JSON.stringify({error:"Unknown --scope",allowed:Object.keys(PERSISTENCE_SCOPE_MIGRATIONS)}));
 process.exit(1);
}
const scope=scopeRaw as PersistenceScope;

let mode:IsolationSuiteMode="check";
if(live)mode="live";
else if(fixture)mode="fixture";
else if(check)mode="check";
else mode="check";

if(live&&process.env.HSI_ISOLATION_SUITE_ENABLED!=="1"){
 console.error(JSON.stringify({
  error:"Live isolation refused",
  hint:"Set HSI_ISOLATION_SUITE_ENABLED=1 only on a disposable HSI Neon branch with owner sessions. Production untouched.",
 }));
 process.exit(1);
}

assertCatalogComplete();
const commitSha=(process.env.HSI_ISOLATION_COMMIT_SHA
 ??execSync("git rev-parse HEAD",{encoding:"utf8"}).trim()).slice(0,40);
if(!/^[a-f0-9]{40}$/.test(commitSha)){
 console.error(JSON.stringify({error:"Could not resolve 40-char commit SHA"}));
 process.exit(1);
}

const liveOrigin=live?requireEnv("HSI_ISOLATION_ORIGIN"):process.env.HSI_ISOLATION_ORIGIN;
const liveApproved=live?requireEnv("HSI_ISOLATION_APPROVED_ORIGIN"):process.env.HSI_ISOLATION_APPROVED_ORIGIN;
if(live&&liveOrigin!==liveApproved){
 console.error(JSON.stringify({
  error:"Origin/approvedOrigin mismatch",
  hint:"Set HSI_ISOLATION_ORIGIN and HSI_ISOLATION_APPROVED_ORIGIN independently to the same reviewed staging HTTPS host.",
 }));
 process.exit(1);
}

const suite=createStagingIsolationSuite({
 mode,
 scope,
 commitSha,
 enabled:live?true:undefined,
 origin:liveOrigin,
 approvedOrigin:live?liveApproved:liveApproved??liveOrigin,
 productionOrigins:["https://www.humansuperintelligence.tech","https://humansuperintelligence.tech"],
 ...(live?{
  target:{
   projectId:requireEnv("HSI_ISOLATION_PROJECT_ID"),
   branchId:requireEnv("HSI_ISOLATION_DISPOSABLE_BRANCH_ID"),
   parentId:requireEnv("HSI_ISOLATION_PRODUCTION_BRANCH_ID"),
   isDefault:false,
   isPrimary:false,
   expiresAt:requireEnv("HSI_ISOLATION_TARGET_EXPIRES_AT"),
  },
  pins:{
   projectId:requireEnv("HSI_ISOLATION_PROJECT_ID"),
   productionBranchId:requireEnv("HSI_ISOLATION_PRODUCTION_BRANCH_ID"),
   disposableBranchId:requireEnv("HSI_ISOLATION_DISPOSABLE_BRANCH_ID"),
  },
  routeSchemaHash:requireEnv("HSI_ISOLATION_ROUTE_SCHEMA_HASH"),
  runtimeConfigHash:requireEnv("HSI_ISOLATION_RUNTIME_CONFIG_HASH"),
  authorize:async()=>process.env.HSI_ISOLATION_LIVE_AUTHORIZED==="1",
  session:async(actor)=>{
   if(actor==="anonymous")return null;
   if(actor==="revoked_session")return process.env.HSI_ISOLATION_SESSION_REVOKED??null;
   if(actor==="researcher_a")return process.env.HSI_ISOLATION_SESSION_RESEARCHER_A??null;
   if(actor==="researcher_b")return process.env.HSI_ISOLATION_SESSION_RESEARCHER_B??null;
   if(actor==="reviewer")return process.env.HSI_ISOLATION_SESSION_REVIEWER??null;
   const _exhaustive:never=actor;
   void _exhaustive;
   return null;
  },
  transport:async(request)=>{
   // Trusted owner CLI transport: refuse redirects; never accept client-supplied transport.
   return fetch(request.url,{
    method:request.method,
    headers:request.headers,
    body:request.method==="GET"||request.method==="HEAD"?undefined:await request.arrayBuffer(),
    redirect:"error",
    signal:request.signal,
   });
  },
 }:{}),
});

const result=await suite.run();
const coverage=catalogCoverage();

console.log(JSON.stringify({
 ...result,
 heldMigrationIds:HELD_MIGRATION_IDS.length,
 catalogChecks:coverage.checks.length,
 catalogCovered:coverage.covered.length,
},null,2));

if(coverage.missing.length)process.exit(1);
if(mode==="fixture"&&(!result.httpObservations.length||result.httpObservations.some(o=>o.outcome!=="matched")))process.exit(1);
if(mode==="live"&&(!result.httpObservations.length||result.httpObservations.some(o=>o.outcome!=="matched")||result.unexecutedProbeIds.length))process.exit(1);
process.exit(0);
