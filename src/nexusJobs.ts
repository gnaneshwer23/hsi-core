/**
 * NEXUS durability: a local append-only job journal and a durable wrapper around the live composition. A crash leaves a
 * started job with an expiring lease; another process may take it over as a new attempt, bounded by maxAttempts. Each
 * attempt is claimed with an exclusive file create, so two workers can never run the same attempt. A completed job is never
 * re-run. The audit chain already continues from the latest stored audit, so a resumed attempt appends rather than restarts.
 * This is a file store on purpose: a database job table needs a migration, and migrations 022-030 stay held until approved.
 * The journal stores identifiers, states and hashes only: never passages, questions' answers, prompts or credentials.
 */
import {appendFileSync,existsSync,mkdirSync,openSync,closeSync,readFileSync} from "node:fs";
import {join} from "node:path";

export type JobEvent={jobId:string;type:"created"|"started"|"completed"|"failed";attempt:number;at:string;auditHash?:string;errorCode?:string};
export type JobState={jobId:string;status:"queued"|"running"|"completed"|"failed";attempts:number;lastAt:string;auditHash:string|null};
const ID=/^[a-z0-9][a-z0-9._-]{2,80}$/;
const CODE=/^[a-z_]{1,40}$/;

export function createJobJournal(dir:string,opts:{now?:()=>number}={}){
 const now=opts.now??Date.now;mkdirSync(dir,{recursive:true});
 const file=join(dir,"jobs.jsonl");
 const read=():JobEvent[]=>existsSync(file)?readFileSync(file,"utf8").split("\n").filter(Boolean).map(l=>JSON.parse(l) as JobEvent):[];
 const write=(e:Omit<JobEvent,"at">)=>{appendFileSync(file,JSON.stringify({...e,at:new Date(now()).toISOString()})+"\n",{flag:"a"})};
 const fold=(jobId:string):JobState|null=>{
  const events=read().filter(e=>e.jobId===jobId);if(!events.length)return null;
  let status:JobState["status"]="queued",attempts=0,auditHash:string|null=null;
  for(const e of events){
   if(e.type==="started"){status="running";attempts=Math.max(attempts,e.attempt)}
   else if(e.type==="completed"){status="completed";auditHash=e.auditHash??null}
   else if(e.type==="failed")status="failed";
  }
  return {jobId,status,attempts,lastAt:events[events.length-1]!.at,auditHash};
 };
 return {
  state:fold,
  create(jobId:string){if(!ID.test(jobId))throw Error("Invalid job id");if(fold(jobId))return false;write({jobId,type:"created",attempt:0});return true},
  /** Exclusive claim of the next attempt. Returns the attempt number, or null if another worker holds it. */
  claim(jobId:string,expectedAttempt:number){
   try{closeSync(openSync(join(dir,`${jobId}.attempt-${expectedAttempt}.lock`),"wx"))}catch{return null}
   write({jobId,type:"started",attempt:expectedAttempt});return expectedAttempt;
  },
  complete(jobId:string,attempt:number,auditHash:string){if(!/^[a-f0-9]{64}$/.test(auditHash))throw Error("Invalid audit hash");write({jobId,type:"completed",attempt,auditHash})},
  fail(jobId:string,attempt:number,errorCode:string){write({jobId,type:"failed",attempt,errorCode:CODE.test(errorCode)?errorCode:"error"})},
  /** Runs begun in the last 24 hours (started events): feeds the WARDEN daily cap from durable state. */
  runsToday:()=>read().filter(e=>e.type==="started"&&now()-Date.parse(e.at)<86_400_000).length,
  events:read,
 };
}
export type JobJournal=ReturnType<typeof createJobJournal>;

export type DurableOutcome={status:"completed";attempt:number;auditHash:string;resumed:boolean}|{status:"already_completed";auditHash:string}|{status:"held_by_other"}|{status:"failed";attempt:number;errorCode:string}|{status:"attempts_exhausted"};

/** Runs `work` for a job exactly once at a time. `leaseMs` is how long a started attempt is presumed alive. */
export async function runDurable(journal:JobJournal,jobId:string,work:()=>Promise<{auditHash:string}>,opts:{leaseMs?:number;maxAttempts?:number;now?:()=>number}={}):Promise<DurableOutcome>{
 const leaseMs=opts.leaseMs??10*60_000,maxAttempts=opts.maxAttempts??3,now=opts.now??Date.now;
 journal.create(jobId);
 const s=journal.state(jobId)!;
 if(s.status==="completed"&&s.auditHash)return {status:"already_completed",auditHash:s.auditHash};
 if(s.status==="running"&&now()-Date.parse(s.lastAt)<leaseMs)return {status:"held_by_other"};
 if(s.attempts>=maxAttempts)return {status:"attempts_exhausted"};
 const attempt=journal.claim(jobId,s.attempts+1);
 if(attempt===null)return {status:"held_by_other"};
 try{
  const out=await work();journal.complete(jobId,attempt,out.auditHash);
  return {status:"completed",attempt,auditHash:out.auditHash,resumed:attempt>1};
 }catch(e){
  const code=e instanceof Error&&/^WARDEN refused: ([a-z_]+)/.exec(e.message)?.[1]||"error";
  journal.fail(jobId,attempt,code);return {status:"failed",attempt,errorCode:code};
 }
}
