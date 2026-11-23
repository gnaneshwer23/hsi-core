#!/usr/bin/env bun
/** P0.6 staging gate CLI. See docs/engineering/STAGING_GATE_P06.md.
 *
 *   bun scripts/staging-gate-p06.ts --plan                         print the checks and the mandate items
 *   bun scripts/staging-gate-p06.ts --preflight                    list missing prerequisites; sends nothing (exit 3 = BLOCKED)
 *   bun scripts/staging-gate-p06.ts --rehearse [--fault <name>]    run against the in-process rehearsal (mode "rehearsal", not staging evidence)
 *   bun scripts/staging-gate-p06.ts --staging [--out <file>]       run against the approved staging origin (needs the env below)
 *
 * Exit codes: 0 PASSED_PENDING_SIGNOFF, 1 FAILED, 2 INCONCLUSIVE, 3 BLOCKED, 64 bad usage.
 * Staging env (all required; any missing one makes the run BLOCKED and nothing is sent):
 *   HSI_GATE_ORIGIN, HSI_GATE_APPROVED_ORIGIN, HSI_GATE_PRODUCTION_ORIGINS (comma list), HSI_GATE_TARGET_HASH (64 hex), HSI_GATE_COMMIT_SHA (40 hex),
 *   HSI_GATE_INVESTIGATION_A, HSI_GATE_INVESTIGATION_UNKNOWN, HSI_GATE_TERMS (comma list), HSI_GATE_ALLOW_MUTATIONS=1,
 *   HSI_GATE_HOOKS_MODULE (absolute path to YOUR module, kept outside this repo, exporting `hooks`: session(actor), revoke(actor), advance?(), inspector?).
 * The CLI holds no credential and prints none; evidence has no cookies, tokens or bodies. */
import {existsSync,writeFileSync} from "node:fs";
import {isAbsolute} from "node:path";
import {GATE_PLAN,MANDATE_ITEMS,runStagingGate,verifyGateEvidence,type GateConfig,type GateHooks} from "../src/ops/stagingGate";
import {createGateRehearsal,type GateFault} from "../src/ops/stagingGateRehearsal";

const args=process.argv.slice(2);
const flag=(n:string)=>args.includes(n),opt=(n:string)=>{const i=args.indexOf(n);return i>=0?args[i+1]:undefined};
const EXIT={PASSED_PENDING_SIGNOFF:0,FAILED:1,INCONCLUSIVE:2,BLOCKED:3} as const;
const FAULTS:readonly string[]=["leak_read","leak_export","distinguishable_denial","revocation_ignored","duplicate_rows","audit_wrong_owner","cross_origin_accepted","anonymous_allowed","health_leaks_counts","retry_not_idempotent","distinguishable_body","retry_reports_created","missing_origin_accepted","refs_not_distinct","anonymous_403","owner_export_broken"];
const env=process.env;
const list=(v?:string)=>(v??"").split(",").map(s=>s.trim()).filter(Boolean);

async function loadHooks():Promise<GateHooks|null>{
 const p=env.HSI_GATE_HOOKS_MODULE;
 if(!p||!isAbsolute(p)||p.includes("..")||!existsSync(p))return null;
 try{const m=await import(p) as {hooks?:GateHooks};return m.hooks&&typeof m.hooks.session==="function"?m.hooks:null}catch{return null}
}

async function stagingConfig():Promise<GateConfig>{
 const hooks=await loadHooks();
 return {
  mode:"staging",origin:env.HSI_GATE_ORIGIN??"",approvedOrigin:env.HSI_GATE_APPROVED_ORIGIN??"",productionOrigins:list(env.HSI_GATE_PRODUCTION_ORIGINS),
  targetHash:env.HSI_GATE_TARGET_HASH??"",commitSha:env.HSI_GATE_COMMIT_SHA??"",
  investigations:{a:env.HSI_GATE_INVESTIGATION_A??"",unknown:env.HSI_GATE_INVESTIGATION_UNKNOWN??""},terms:list(env.HSI_GATE_TERMS),
  allowMutations:env.HSI_GATE_ALLOW_MUTATIONS==="1",
  transport:req=>fetch(req),
  hooks:hooks??({} as GateHooks), // no hooks module: the preflight reports session_provider_missing and nothing is sent
  waitForCompletionMs:Number(env.HSI_GATE_WAIT_MS??"0")||0,
 };
}

async function main():Promise<number>{
 if(flag("--plan")){
  console.log(JSON.stringify({plan:GATE_PLAN.map(s=>({id:s.id,title:s.title,mandate:s.mandate,control:s.control,needsInspector:s.needsInspector,needsRevoke:s.needsRevoke,requires:s.requires})),mandateItems:MANDATE_ITEMS},null,2));
  return 0;
 }
 let evidence;
 if(flag("--rehearse")){
  const fault=opt("--fault")??null;
  if(fault!==null&&!FAULTS.includes(fault)){console.error(JSON.stringify({error:"Unknown --fault",allowed:FAULTS}));return 64}
  const g=createGateRehearsal({fault:fault as GateFault});
  evidence=await runStagingGate(g.config());
 }else if(flag("--staging")||flag("--preflight")){
  const config=await stagingConfig();
  if(flag("--preflight")){
   // A preflight run is a real run with nothing to send when blocked; when NOT blocked it must not mutate, so it stops here.
   const {gatePreflight}=await import("../src/ops/stagingGate");
   const blockers=await gatePreflight(config);
   console.log(JSON.stringify({verdict:blockers.length?"BLOCKED":"READY",blockers,sent:0},null,2));
   return blockers.length?3:0;
  }
  evidence=await runStagingGate(config);
 }else{console.error("Usage: --plan | --preflight | --rehearse [--fault <name>] | --staging [--out <file>]; see the file header.");return 64}
 verifyGateEvidence(evidence);
 const text=JSON.stringify(evidence,null,2)+"\n";
 const out=opt("--out");
 if(out){writeFileSync(out,text,{flag:"wx"})}else console.log(text);
 return EXIT[evidence.verdict];
}
process.exit(await main());
