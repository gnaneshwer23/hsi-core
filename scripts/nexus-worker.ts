/** NEXUS durable worker. Fixture mode only: synthetic recorded inputs, no network, no model, nothing promoted.
 *   bun scripts/nexus-worker.ts submit --fixture <name|path> [--out <dir>]
 *   bun scripts/nexus-worker.ts work   [--out <dir>] [--concurrency <n>] [--max-jobs <n>] [--daily-cap <n>] [--retry-failed] [--loop [--interval-ms <n>]]
 *   bun scripts/nexus-worker.ts status [--out <dir>]
 *   bun scripts/nexus-worker.ts health [--out <dir>] [--stale-ms <n>]   (exit 0 ok, 1 degraded, 2 down)
 *   bun scripts/nexus-worker.ts cancel --job <jobId> [--out <dir>]      (operator cancel; a running job is asked to stop)
 * Default --out is out/nexus (git-ignored). Ctrl-C or SIGTERM stops new starts and lets a running job finish.
 * Live investigations are not available here; see docs/LIVE_RUN_RUNBOOK.md for the guarded human-confirmed path.
 */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {FIXTURE_NOTICE,cancelJob,jobStatus,runWorkerLoop,runWorkerOnce,submitFixture} from "../src/nexusRunCommand";
import {nexusHealth} from "../src/nexusWorkerHealth";

const [command,...args]=process.argv.slice(2);
const VALUE=new Set(["--fixture","--out","--concurrency","--max-jobs","--daily-cap","--interval-ms","--job","--stale-ms"]),BOOL=new Set(["--retry-failed","--loop"]);
const flags=new Map<string,string|true>();
for(let i=0;i<args.length;i++){
 const a=args[i]!;
 if(VALUE.has(a)){const v=args[++i];if(v===undefined||v.startsWith("--")){console.error(`${a} needs a value`);process.exit(2)}flags.set(a,v)}
 else if(BOOL.has(a))flags.set(a,true);
 else{console.error(a.includes("live")?"Live mode is not available in the worker. Use scripts/run-investigation.ts --mode live --execute, which needs a human confirmation.":`Unknown option ${a}`);process.exit(2)}
}
const str=(n:string)=>{const v=flags.get(n);return typeof v==="string"?v:undefined};
const int=(n:string)=>{const v=str(n);if(v===undefined)return undefined;const x=Number(v);if(!Number.isInteger(x)||x<1){console.error(`${n} must be a positive integer`);process.exit(2)}return x};
const out=str("--out")??"out/nexus";

if(command==="submit"){
 const f=str("--fixture");if(!f){console.error("submit needs --fixture <name|path>");process.exit(2)}
 const path=/[\\/]/.test(f)?resolve(f):resolve(import.meta.dir,"..","research","runner-fixtures",`${f}.v1.json`);
 let fixture:unknown;try{fixture=JSON.parse(readFileSync(path,"utf8"))}catch{console.error(`Cannot read a JSON fixture at ${path}`);process.exit(2)}
 try{console.log(JSON.stringify({notice:FIXTURE_NOTICE,...submitFixture({out,fixture})}))}catch(e){console.error(`Refused: ${e instanceof Error?e.message:"invalid fixture"}`);process.exit(1)}
}else if(command==="work"){
 const ctl=new AbortController();for(const s of ["SIGINT","SIGTERM"] as const)process.on(s,()=>ctl.abort());
 const opts={out,concurrency:int("--concurrency"),maxJobs:int("--max-jobs"),dailyCap:int("--daily-cap"),retryFailed:flags.get("--retry-failed")===true,signal:ctl.signal};
 const show=(r:Awaited<ReturnType<typeof runWorkerOnce>>)=>console.log(JSON.stringify({notice:FIXTURE_NOTICE,...r}));
 if(flags.get("--loop")===true)await runWorkerLoop({...opts,intervalMs:int("--interval-ms")??5000,onPass:r=>{if(r.ran.length||r.stoppedBy!=="empty")show(r)}});
 else show(await runWorkerOnce(opts));
}else if(command==="status"){
 console.log(JSON.stringify({notice:FIXTURE_NOTICE,jobs:jobStatus(out)},null,2));
}else if(command==="health"){
 const h=nexusHealth({out,staleAfterMs:int("--stale-ms")});
 console.log(JSON.stringify(h,null,2));process.exit(h.status==="ok"?0:h.status==="degraded"?1:2);
}else if(command==="cancel"){
 const id=str("--job");if(!id){console.error("cancel needs --job <jobId>");process.exit(2)}
 const r=cancelJob({out,jobId:id});console.log(JSON.stringify({jobId:id,result:r}));process.exit(r==="unknown"?1:0);
}else{
 console.error("Usage: bun scripts/nexus-worker.ts <submit|work|status|health|cancel> [options]; see the file header.");process.exit(2);
}
