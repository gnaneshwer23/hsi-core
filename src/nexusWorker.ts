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
};
export type DrainResult={ran:{jobId:string;outcome:DurableOutcome}[];refused:{jobId:string;code:string}[];skipped:number;stoppedBy:"empty"|"max_jobs"|"daily_cap"|"aborted"};

export function dueJobs(journal:JobJournal,opts:Pick<DrainOptions,"retryFailed"|"leaseMs"|"maxAttempts"|"now"> ={}):JobState[]{
 const leaseMs=opts.leaseMs??10*60_000,maxAttempts=opts.maxAttempts??3,now=(opts.now??Date.now)();
 return journal.list().filter(j=>{
  if(j.status==="completed"||j.attempts>=maxAttempts)return false;
  if(j.status==="running")return now-Date.parse(j.lastAt)>=leaseMs;
  if(j.status==="failed")return opts.retryFailed===true;
  return true;
 });
}

export async function drainJobs(journal:JobJournal,work:(jobId:string,ctx:{signal:AbortSignal})=>Promise<{auditHash:string}>,opts:DrainOptions={}):Promise<DrainResult>{
 const concurrency=Math.max(1,Math.min(opts.concurrency??1,16)),maxJobs=opts.maxJobs??Infinity;
 const signal=opts.signal??new AbortController().signal;
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
   const outcome=await runDurable(journal,jobId,()=>runWithCorrelation({requestId:`job:${jobId}`},()=>work(jobId,{signal})),{leaseMs:opts.leaseMs,maxAttempts:opts.maxAttempts,now:opts.now});
   ran.push({jobId,outcome});
  }
 };
 await Promise.all(Array.from({length:concurrency},worker));
 return {ran,refused,skipped:Math.max(0,queue.length-next),stoppedBy};
}
