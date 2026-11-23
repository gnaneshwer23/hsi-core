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

export type JobEvent={jobId:string;type:"created"|"started"|"completed"|"failed"|"cancel_requested"|"cancelled"|"dead_lettered"|"progress";attempt:number;at:string;auditHash?:string;errorCode?:string;stage?:string;step?:number;of?:number};
/** `cancelled` and `dead_lettered` are terminal: nothing after them changes a job's status, and a completed job can be neither.
 * `dead_lettered` means the job used all its attempts (or its last attempt died with the lease): it will not run again and needs a human. */
export type JobState={jobId:string;status:"queued"|"running"|"completed"|"failed"|"cancelled"|"dead_lettered";attempts:number;lastAt:string;auditHash:string|null;
 /** A cancel was asked for while an attempt was running; the attempt is expected to stop, and a failure afterwards ends as `cancelled`. */
 cancelRequested:boolean;
 /** Last reported progress of the CURRENT attempt: a stage code and step counts only, never content. */
 progress:{stage:string;step:number;of:number;at:string}|null;
 /** The code recorded by the last failure, cancellation or dead-lettering. */
 lastErrorCode:string|null};
const ID=/^[a-z0-9][a-z0-9._-]{2,80}$/;
const CODE=/^[a-z_]{1,40}$/;

export function createJobJournal(dir:string,opts:{now?:()=>number}={}){
 const now=opts.now??Date.now;mkdirSync(dir,{recursive:true});
 const file=join(dir,"jobs.jsonl");
 const read=():JobEvent[]=>existsSync(file)?readFileSync(file,"utf8").split("\n").filter(Boolean).map(l=>JSON.parse(l) as JobEvent):[];
 const write=(e:Omit<JobEvent,"at">)=>{appendFileSync(file,JSON.stringify({...e,at:new Date(now()).toISOString()})+"\n",{flag:"a"})};
 const foldEvents=(jobId:string,events:JobEvent[]):JobState|null=>{
  if(!events.length)return null;
  let status:JobState["status"]="queued",attempts=0,auditHash:string|null=null,cancelRequested=false,progress:JobState["progress"]=null,lastErrorCode:string|null=null;
  const sticky=()=>status==="completed"||status==="cancelled"||status==="dead_lettered";
  for(const e of events){
   if(e.type==="started"){attempts=Math.max(attempts,e.attempt);if(!sticky()){status="running";progress=null}}
   else if(sticky())continue; // terminal states never change
   else if(e.type==="completed"){status="completed";auditHash=e.auditHash??null}
   else if(e.type==="failed"){status="failed";lastErrorCode=e.errorCode??null}
   else if(e.type==="cancel_requested")cancelRequested=true;
   else if(e.type==="cancelled"){status="cancelled";lastErrorCode=e.errorCode??null}
   else if(e.type==="dead_lettered"){status="dead_lettered";lastErrorCode=e.errorCode??null}
   else if(e.type==="progress"&&status==="running"&&e.attempt===attempts&&typeof e.stage==="string"&&Number.isInteger(e.step)&&Number.isInteger(e.of))progress={stage:e.stage,step:e.step!,of:e.of!,at:e.at};
  }
  // A cancel was requested and the attempt then failed: the job is cancelled, not retried.
  if(cancelRequested&&status==="failed")status="cancelled";
  if(status!=="running")progress=null; // progress describes an attempt in flight, nothing else
  return {jobId,status,attempts,lastAt:events[events.length-1]!.at,auditHash,cancelRequested,progress,lastErrorCode};
 };
 const fold=(jobId:string):JobState|null=>foldEvents(jobId,read().filter(e=>e.jobId===jobId));
 /** Every known job with its folded state, from one read of the journal, in order of first appearance. */
 const list=():JobState[]=>{
  const by=new Map<string,JobEvent[]>();
  for(const e of read()){const a=by.get(e.jobId);if(a)a.push(e);else by.set(e.jobId,[e])}
  return [...by].map(([id,ev])=>foldEvents(id,ev)!);
 };
 return {
  state:fold,
  list,
  create(jobId:string){if(!ID.test(jobId))throw Error("Invalid job id");if(fold(jobId))return false;write({jobId,type:"created",attempt:0});return true},
  /** Exclusive claim of the next attempt. Returns the attempt number, or null if another worker holds it. */
  claim(jobId:string,expectedAttempt:number){
   try{closeSync(openSync(join(dir,`${jobId}.attempt-${expectedAttempt}.lock`),"wx"))}catch{return null}
   write({jobId,type:"started",attempt:expectedAttempt});return expectedAttempt;
  },
  complete(jobId:string,attempt:number,auditHash:string){if(!/^[a-f0-9]{64}$/.test(auditHash))throw Error("Invalid audit hash");write({jobId,type:"completed",attempt,auditHash})},
  fail(jobId:string,attempt:number,errorCode:string){write({jobId,type:"failed",attempt,errorCode:CODE.test(errorCode)?errorCode:"error"})},
  /** Stops a job. Queued or failed: cancelled at once. Running: a cancel is REQUESTED (the attempt must stop cooperatively; see
   * `isCancelRequested`). Completed, cancelled or dead-lettered jobs are left alone. Idempotent. */
  cancel(jobId:string,reason="user_cancelled"):"cancelled"|"cancel_requested"|"already_terminal"|"unknown"{
   const code=CODE.test(reason)?reason:"error",s=fold(jobId);
   if(!s)return "unknown";
   if(s.status==="completed"||s.status==="cancelled"||s.status==="dead_lettered")return "already_terminal";
   if(s.status==="running"){if(!s.cancelRequested)write({jobId,type:"cancel_requested",attempt:s.attempts,errorCode:code});return "cancel_requested"}
   write({jobId,type:"cancelled",attempt:s.attempts,errorCode:code});return "cancelled";
  },
  /** Ends a job that was asked to stop but whose attempt is gone (or never started): writes the terminal event unconditionally, unless the
   * job is already completed or terminal. Used by `runDurable` when it holds the claim or the lease has expired. */
  finishCancel(jobId:string,reason="user_cancelled"){
   const s=fold(jobId);if(!s||s.status==="completed"||s.status==="cancelled"||s.status==="dead_lettered")return false;
   write({jobId,type:"cancelled",attempt:s.attempts,errorCode:CODE.test(reason)?reason:"error"});return true;
  },
  isCancelRequested:(jobId:string)=>{const s=fold(jobId);return !!s&&(s.cancelRequested||s.status==="cancelled")},
  /** Terminal: the job has no attempts left (or its final attempt died). Never applied to a completed or cancelled job. */
  deadLetter(jobId:string,reason:string){
   const s=fold(jobId);if(!s||s.status==="completed"||s.status==="cancelled"||s.status==="dead_lettered")return false;
   write({jobId,type:"dead_lettered",attempt:s.attempts,errorCode:CODE.test(reason)?reason:"error"});return true;
  },
  /** Progress of the running attempt: a stage code and counts. Ignored (returns false) unless `attempt` is the job's current running attempt. */
  progress(jobId:string,attempt:number,stage:string,step:number,of:number):boolean{
   if(!CODE.test(stage)||!Number.isInteger(step)||!Number.isInteger(of)||step<0||of<1||of>1000||step>of)return false;
   const s=fold(jobId);if(!s||s.status!=="running"||s.attempts!==attempt)return false;
   write({jobId,type:"progress",attempt,stage,step,of});return true;
  },
  /** Runs begun in the last 24 hours (started events): feeds the WARDEN daily cap from durable state. */
  runsToday:()=>read().filter(e=>e.type==="started"&&now()-Date.parse(e.at)<86_400_000).length,
  events:read,
 };
}
export type JobJournal=ReturnType<typeof createJobJournal>;

export type DurableOutcome={status:"completed";attempt:number;auditHash:string;resumed:boolean}|{status:"already_completed";auditHash:string}|{status:"held_by_other"}|{status:"failed";attempt:number;errorCode:string;/** The attempt was the last one allowed: the job is now dead-lettered. */deadLettered?:true}|{status:"attempts_exhausted"}|{status:"cancelled"};

/** Runs `work` for a job exactly once at a time. `leaseMs` is how long a started attempt is presumed alive.
 * `work` receives the attempt number so it can report progress for exactly that attempt. */
export async function runDurable(journal:JobJournal,jobId:string,work:(ctx:{attempt:number})=>Promise<{auditHash:string}>,opts:{leaseMs?:number;maxAttempts?:number;now?:()=>number}={}):Promise<DurableOutcome>{
 const leaseMs=opts.leaseMs??10*60_000,maxAttempts=opts.maxAttempts??3,now=opts.now??Date.now;
 journal.create(jobId);
 const s=journal.state(jobId)!;
 if(s.status==="completed"&&s.auditHash)return {status:"already_completed",auditHash:s.auditHash};
 if(s.status==="cancelled")return {status:"cancelled"};
 if(s.status==="dead_lettered")return {status:"attempts_exhausted"};
 if(s.status==="running"&&now()-Date.parse(s.lastAt)<leaseMs)return {status:"held_by_other"};
 // A cancel was requested and the attempt that should have honoured it is gone (lease expired): finish the cancellation, do not rerun.
 if(s.cancelRequested){journal.finishCancel(jobId);return {status:"cancelled"}}
 if(s.attempts>=maxAttempts){journal.deadLetter(jobId,s.lastErrorCode??"attempts_exhausted");return {status:"attempts_exhausted"}}
 const attempt=journal.claim(jobId,s.attempts+1);
 if(attempt===null)return {status:"held_by_other"};
 // A cancel that landed between the read above and the claim must win: the claim holder does not start the work.
 const after=journal.state(jobId)!;
 if(after.status==="cancelled"||after.cancelRequested){journal.fail(jobId,attempt,"cancelled");journal.finishCancel(jobId);return {status:"cancelled"}}
 try{
  const out=await work({attempt});journal.complete(jobId,attempt,out.auditHash);
  return {status:"completed",attempt,auditHash:out.auditHash,resumed:attempt>1};
 }catch(e){
  const code=e instanceof Error&&/^WARDEN refused: ([a-z_]+)/.exec(e.message)?.[1]||"error";
  journal.fail(jobId,attempt,code);
  if(attempt>=maxAttempts&&!journal.isCancelRequested(jobId)){journal.deadLetter(jobId,code);return {status:"failed",attempt,errorCode:code,deadLettered:true}}
  return {status:"failed",attempt,errorCode:code};
 }
}
