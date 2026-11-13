/** Runs one SENTINEL re-evaluation through the real source integrity service. Usage:
 *   bun scripts/sentinel-tick.ts --config live.json --integrity-config integrity.json --sentinel-dir <dir> [--interval-minutes 60]
 * Re-checks every live clearance receipt against current evidence and the signed policy and revokes what no longer holds.
 * The outcome (ok, failed or skipped by the kill switch) is journaled with ids, counts and reason codes only. A live
 * --execute run needs a successful tick within two intervals. Run it on a schedule you own (cron, a job runner).
 */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {loadFileDeps} from "../src/liveExecute";
import {createSentinel} from "../src/sentinel";
import {createHash} from "node:crypto";
import type {LiveRunConfig} from "../src/liveReadiness";
const args=process.argv.slice(2),flag=(n:string)=>{const i=args.indexOf(n);return i>=0?args[i+1]:undefined};
const need=(n:string)=>{const v=flag(n);if(!v){console.error(`Missing ${n}`);process.exit(2)}return v};
const config=JSON.parse(readFileSync(resolve(need("--config")),"utf8")) as LiveRunConfig,integrityConfig=JSON.parse(readFileSync(resolve(need("--integrity-config")),"utf8"));
const minutes=Number(flag("--interval-minutes")??60);
const loaded=await loadFileDeps({config,integrityConfig,env:process.env,auditDirectory:resolve(".sentinel-unused"),runsToday:()=>0,
 target:{investigationId:"sentinel-tick",diseaseScope:"gut-immune-metabolic",question:"sentinel re-evaluation",release:{id:"sentinel",version:"1",manifestHash:createHash("sha256").update("sentinel").digest("hex")}}});
try{
 const kill=config.limits.killSwitchEnv;
 const result=await createSentinel({service:loaded.service!,directory:resolve(need("--sentinel-dir")),intervalMs:minutes*60_000,killed:()=>!!process.env[kill]?.trim()}).tick();
 console.log(JSON.stringify(result,null,2));process.exit(result.ran&&result.record.outcome==="ok"?0:3);
}finally{await loaded.close()}
export {};
