/** NEXUS worker heartbeats and a health summary, built from files: no network, no job content.
 *
 * A worker loop writes `health/<workerId>.json` (atomically) at start, after every pass and when it stops. `nexusHealth` combines those
 * files with the job journal into one verdict an operator or a monitor can poll: are workers alive, is work waiting or stuck, is
 * anything dead-lettered. Reasons are fixed codes, never text from jobs or errors.
 *
 * What it is not: it does not page anyone, expose an HTTP endpoint, export metrics or measure latency, and a heartbeat file proves a
 * process wrote a file, not that its work is correct. Clock skew between hosts sharing a volume can make a live worker look stale
 * (or a dead one look live) by the skew. Alerting thresholds here are defaults, not measured service levels. */
import {existsSync,mkdirSync,readFileSync,readdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {randomBytes} from "node:crypto";
import {writeFileAtomic} from "./fileLock";
import {createJobJournal} from "./nexusJobs";

export type WorkerState="idle"|"running"|"stopped";
export type WorkerRecord={schemaVersion:"hsi-nexus-worker-1";workerId:string;startedAt:string;lastBeatAt:string;state:WorkerState;passes:number;totals:{ran:number;completed:number;failed:number;refused:number;deadLettered:number};lastStoppedBy:string|null};
export type PassSummary={ran:readonly {outcome:{status:string}}[];refused:readonly unknown[];deadLettered:readonly unknown[];stoppedBy:string};
const WORKER_ID=/^w-[a-f0-9]{8,32}$/;
const healthDir=(out:string)=>join(resolve(out),"health");

export function createWorkerHeartbeat(opts:{out:string;workerId?:string;now?:()=>number}){
 const now=opts.now??Date.now,workerId=opts.workerId??"w-"+randomBytes(6).toString("hex");
 if(!WORKER_ID.test(workerId))throw Error("Invalid worker id");
 mkdirSync(healthDir(opts.out),{recursive:true});
 const startedAt=new Date(now()).toISOString();
 const totals={ran:0,completed:0,failed:0,refused:0,deadLettered:0};let passes=0,lastStoppedBy:string|null=null;
 const write=(state:WorkerState)=>{
  const rec:WorkerRecord={schemaVersion:"hsi-nexus-worker-1",workerId,startedAt,lastBeatAt:new Date(now()).toISOString(),state,passes,totals:{...totals},lastStoppedBy};
  writeFileAtomic(join(healthDir(opts.out),`${workerId}.json`),JSON.stringify(rec));
 };
 return {
  workerId,
  start(){write("idle")},
  /** Call after each pass. A write failure is swallowed: monitoring must never stop the work it watches. */
  pass(r:PassSummary){
   passes++;totals.ran+=r.ran.length;totals.refused+=r.refused.length;totals.deadLettered+=r.deadLettered.length;
   for(const x of r.ran){if(x.outcome.status==="completed")totals.completed++;else if(x.outcome.status==="failed")totals.failed++}
   lastStoppedBy=/^[a-z_]{1,24}$/.test(r.stoppedBy)?r.stoppedBy:null;
   try{write("idle")}catch{/* ignore */}
  },
  beat(state:WorkerState="running"){try{write(state)}catch{/* ignore */}},
  stop(){try{write("stopped")}catch{/* ignore */}},
 };
}

export type HealthReason="no_live_worker"|"worker_stale"|"stuck_running"|"dead_lettered_present"|"old_queued_work"|"unreadable_worker_record"|"cancel_pending";
export type NexusHealth={
 status:"ok"|"degraded"|"down";reasons:HealthReason[];at:string;
 workers:{workerId:string;state:WorkerState;lastBeatAgeMs:number;live:boolean;passes:number}[];
 queue:{queued:number;running:number;failed:number;completed:number;cancelled:number;deadLettered:number;stuckRunning:number;cancelPending:number;oldestQueuedAgeMs:number|null};
};
export function nexusHealth(opts:{out:string;now?:()=>number;staleAfterMs?:number;leaseMs?:number;oldQueuedMs?:number}):NexusHealth{
 const now=(opts.now??Date.now)(),stale=opts.staleAfterMs??60_000,lease=opts.leaseMs??600_000,oldMs=opts.oldQueuedMs??900_000;
 const reasons=new Set<HealthReason>();
 const workers:NexusHealth["workers"]=[];
 const dir=healthDir(opts.out);
 for(const f of existsSync(dir)?readdirSync(dir).filter(x=>x.endsWith(".json")):[]){
  try{
   const r=JSON.parse(readFileSync(join(dir,f),"utf8")) as WorkerRecord;
   if(r.schemaVersion!=="hsi-nexus-worker-1"||!WORKER_ID.test(r.workerId)||!["idle","running","stopped"].includes(r.state)||!Number.isFinite(Date.parse(r.lastBeatAt)))throw Error("bad");
   const age=Math.max(0,now-Date.parse(r.lastBeatAt));
   workers.push({workerId:r.workerId,state:r.state,lastBeatAgeMs:age,live:r.state!=="stopped"&&age<stale,passes:r.passes});
  }catch{reasons.add("unreadable_worker_record")}
 }
 const q:NexusHealth["queue"]={queued:0,running:0,failed:0,completed:0,cancelled:0,deadLettered:0,stuckRunning:0,cancelPending:0,oldestQueuedAgeMs:null};
 const jobsDir=join(resolve(opts.out),"jobs");
 for(const j of existsSync(jobsDir)?createJobJournal(jobsDir,{now:()=>now}).list():[]){
  const age=Math.max(0,now-Date.parse(j.lastAt));
  if(j.status==="queued"){q.queued++;q.oldestQueuedAgeMs=Math.max(q.oldestQueuedAgeMs??0,age)}
  else if(j.status==="running"){q.running++;if(age>=lease)q.stuckRunning++;if(j.cancelRequested)q.cancelPending++}
  else if(j.status==="failed")q.failed++;
  else if(j.status==="completed")q.completed++;
  else if(j.status==="cancelled")q.cancelled++;
  else if(j.status==="dead_lettered")q.deadLettered++;
 }
 const anyLive=workers.some(w=>w.live);
 const pending=q.queued+q.stuckRunning+q.failed>0;
 if(!anyLive&&pending)reasons.add("no_live_worker");
 else if(workers.some(w=>!w.live&&w.state!=="stopped"))reasons.add("worker_stale");
 if(q.stuckRunning>0)reasons.add("stuck_running");
 if(q.deadLettered>0)reasons.add("dead_lettered_present");
 if(q.cancelPending>0)reasons.add("cancel_pending");
 if(q.oldestQueuedAgeMs!==null&&q.oldestQueuedAgeMs>=oldMs)reasons.add("old_queued_work");
 const status:NexusHealth["status"]=reasons.has("no_live_worker")?"down":reasons.size?"degraded":"ok";
 return {status,reasons:[...reasons].sort(),at:new Date(now).toISOString(),workers:workers.sort((a,b)=>a.workerId.localeCompare(b.workerId)),queue:q};
}
