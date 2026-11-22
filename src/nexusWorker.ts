/** NEXUS worker: drains the durable job journal. `runDurable` runs one job at a time safely; this decides which jobs are due
 * and runs them with bounded concurrency. It claims nothing itself. Every claim, lease and attempt limit stays in `runDurable`,
 * so two workers (or two processes) draining the same journal cannot run one attempt twice.
 *
 * Policy, all explicit:
 * - Completed jobs, jobs whose lease is still live, and jobs at `maxAttempts` are skipped.
 * - A failed job is not retried unless `retryFailed` is set, because a refusal such as a budget stop would burn attempts.
 * - `dailyCap` is checked against durable state (`runsToday`) before every start, so a restart cannot reset the cap.
 * - An aborted signal stops new starts. Jobs already running are not killed; the work function receives the signal and must
 *   stop cooperatively.
 */
import {runWithCorrelation} from "./observability";
import {runDurable,type DurableOutcome,type JobJournal,type JobState} from "./nexusJobs";

export type DrainOptions={
 concurrency?:number;maxJobs?:number;dailyCap?:number;retryFailed?:boolean;
 leaseMs?:number;maxAttempts?:number;now?:()=>number;signal?:AbortSignal;
 /** Called before a due job is claimed. A refusal means the job is NOT claimed: no attempt is consumed, nothing runs, and it stays queued
  * and is reported in `refused` on every pass. A throw is treated as a refusal (fail closed). */
 admit?:(jobId:string)=>Promise<{ok:true}|{ok:false;code:string}>;
 /** How often a running job is checked for a cancel request (default 250 ms). The job's `signal` aborts when one is seen. */
 cancelPollMs?:number;
};
/** `deadLettered`: jobs this pass moved to the terminal dead-letter state because they have no attempts left. */
export type DrainResult={ran:{jobId:string;outcome:DurableOutcome}[];refused:{jobId:string;code:string}[];deadLettered:string[];skipped:number;stoppedBy:"empty"|"max_jobs"|"daily_cap"|"aborted"};

export function dueJobs(journal:JobJournal,opts:Pick<DrainOptions,"retryFailed"|"leaseMs"|"maxAttempts"|"now"> ={}):JobState[]{
 const leaseMs=opts.leaseMs??10*60_000,maxAttempts=opts.maxAttempts??3,now=(opts.now??Date.now)();
 return journal.list().filter(j=>{
  if(j.status==="completed"||j.status==="cancelled"||j.status==="dead_lettered"||j.attempts>=maxAttempts)return false;
  if(j.status==="running")return now-Date.parse(j.lastAt)>=leaseMs;
  if(j.status==="failed")return opts.retryFailed===true;
  return true;
 });
}

/** Moves jobs that can never run again to the dead-letter state: all attempts used and the last one failed, or died with its lease.
 * Idempotent. A job with a live lease is never touched. */
export function sweepDeadLetters(journal:JobJournal,opts:Pick<DrainOptions,"leaseMs"|"maxAttempts"|"now"> ={}):string[]{
 const leaseMs=opts.leaseMs??10*60_000,maxAttempts=opts.maxAttempts??3,now=(opts.now??Date.now)(),out:string[]=[];
 for(const j of journal.list()){
  if(j.attempts<maxAttempts)continue;
  const dead=j.status==="failed"||(j.status==="running"&&now-Date.parse(j.lastAt)>=leaseMs);
  if(dead&&journal.deadLetter(j.jobId,j.lastErrorCode??(j.status==="running"?"lease_expired":"attempts_exhausted")))out.push(j.jobId);
 }
 return out;
}

/** What the work function receives: a signal that aborts on drain shutdown OR when this job is cancelled, and a progress reporter for
 * the running attempt (a stage code and step counts, never content; false when not recorded). */
export type JobWorkContext={signal:AbortSignal;progress:(stage:string,step:number,of:number)=>boolean};

export async function drainJobs(journal:JobJournal,work:(jobId:string,ctx:JobWorkContext)=>Promise<{auditHash:string}>,opts:DrainOptions={}):Promise<DrainResult>{
 const concurrency=Math.max(1,Math.min(opts.concurrency??1,16)),maxJobs=opts.maxJobs??Infinity;
 const signal=opts.signal??new AbortController().signal;
 const pollMs=Math.max(10,opts.cancelPollMs??250);
 const deadLettered=sweepDeadLetters(journal,opts);
 const queue=dueJobs(journal,opts).map(j=>j.jobId);
 const ran:DrainResult["ran"]=[],refused:DrainResult["refused"]=[];let next=0,started=0,stoppedBy:DrainResult["stoppedBy"]="empty";
 const worker=async()=>{
  for(;;){
   if(signal.aborted){stoppedBy="aborted";return}
   if(started>=maxJobs){stoppedBy="max_jobs";return}
   if(opts.dailyCap!==undefined&&journal.runsToday()>=opts.dailyCap){stoppedBy="daily_cap";return}
   const jobId=queue[next++];if(jobId===undefined)return;
   if(opts.admit){
    let verdict:{ok:true}|{ok:false;code:string};
    try{verdict=await opts.admit(jobId)}catch{verdict={ok:false,code:"admit_error"}}
    if(verdict?.ok!==true){refused.push({jobId,code:verdict&&verdict.ok===false&&/^[a-z0-9_]{1,40}$/.test(verdict.code)?verdict.code:"admit_error"});continue}
   }
   started++;
   const outcome=await runDurable(journal,jobId,({attempt})=>{
    // The job's own signal: aborts when the drain is stopped or when a cancel is requested for THIS job.
    const own=new AbortController(),onDrainAbort=()=>own.abort();
    signal.addEventListener("abort",onDrainAbort,{once:true});if(signal.aborted)own.abort();
    const timer=setInterval(()=>{try{if(journal.isCancelRequested(jobId))own.abort()}catch{/* a journal read error must not kill the run */}},pollMs);
    return runWithCorrelation({requestId:`job:${jobId}`},()=>work(jobId,{signal:own.signal,progress:(stage,step,of)=>{try{return journal.progress(jobId,attempt,stage,step,of)}catch{return false}}})).finally(()=>{clearInterval(timer);signal.removeEventListener("abort",onDrainAbort)});
   },{leaseMs:opts.leaseMs,maxAttempts:opts.maxAttempts,now:opts.now});
   ran.push({jobId,outcome});
  }
 };
 await Promise.all(Array.from({length:concurrency},worker));
 return {ran,refused,deadLettered,skipped:Math.max(0,queue.length-next),stoppedBy};
}
