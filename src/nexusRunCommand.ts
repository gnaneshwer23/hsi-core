/** The operator-facing side of the NEXUS worker: submit recorded fixtures, drain the queue, read the journal.
 * Fixture mode only. It replays recorded, synthetic inputs, makes no network or model call and promotes nothing.
 * Live investigations are deliberately NOT reachable from here: the guarded live path needs a named human to type a
 * confirmation that names the job (`scripts/run-investigation.ts --mode live --execute`), and a background worker must not
 * be able to bypass that.
 *
 * Layout under `out`: `jobs/` the durable journal, `queue/<jobId>.fixture.json` the submitted fixture, and
 * `audit/<jobId>/` one hash-chained audit store per job, so concurrent jobs can never fork one chain.
 */
import {existsSync,mkdirSync,readFileSync,renameSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {authoriseJobCallsFor,type GatewayAuthorisation,type GatewayCallerAuthority} from "./gatewayCallerAuthority";
import {hashHsiCheckpointInput} from "./hsiAgentDurableCheckpoint";
import type {HsiAgentRole} from "./hsiAgentIntelligenceContracts";
import {isGrantId} from "./jobDelegationGrants";
import {writeFileAtomic} from "./fileLock";
import {runFixtureInvestigation,validateRunnerFixture,FIXTURE_NOTICE} from "./investigationRunner";
import {createJobJournal,type JobState} from "./nexusJobs";
import {drainJobs,type DrainOptions,type DrainResult} from "./nexusWorker";
import {createWorkerHeartbeat} from "./nexusWorkerHealth";

export {FIXTURE_NOTICE};
const jobDir=(out:string)=>join(resolve(out),"jobs");
const queueFile=(out:string,jobId:string)=>join(resolve(out),"queue",`${jobId}.fixture.json`);
/** What a runner learns about the authority a job carries. `authoriseCall` is for a live runner that calls tools through the gateway;
 * the fixture runner makes no tool calls and ignores it. Both are null for a job submitted without a grant. */
export type JobAuthority={grant:{grantId:string;investigationId:string;roles:readonly string[]}|null;authoriseCall:((task:{taskId:string;role:HsiAgentRole})=>Promise<GatewayAuthorisation>)|null};
export type FixtureRunner=(fixture:unknown,auditDirectory:string,authority?:JobAuthority)=>Promise<{auditHash:string}>;
const defaultRunner:FixtureRunner=async(fixture,auditDirectory)=>{
 const r=await runFixtureInvestigation({fixture,storeDirectory:auditDirectory});return {auditHash:r.audit.auditHash};
};

/** Validates the fixture, stores it, and queues a job named by its content. Submitting the same fixture again is a no-op. */
export function submitFixture(opts:{out:string;fixture:unknown;now?:()=>number}):{jobId:string;created:boolean}{
 const fixture=validateRunnerFixture(opts.fixture);
 const jobId="fx-"+hashHsiCheckpointInput(fixture).slice(0,16);
 const file=queueFile(opts.out,jobId);mkdirSync(join(resolve(opts.out),"queue"),{recursive:true});
 if(!existsSync(file)){const tmp=`${file}.${process.pid}.tmp`;writeFileSync(tmp,JSON.stringify(fixture));renameSync(tmp,file)}
 return {jobId,created:createJobJournal(jobDir(opts.out),{now:opts.now}).create(jobId)};
}

const grantFile=(out:string,jobId:string)=>join(resolve(out),"queue",`${jobId}.grant.json`);
type GrantRef={state:"none"}|{state:"ok";grantId:string}|{state:"corrupt"};
/** The grant id a job was submitted with. A file that exists but does not parse is `corrupt`, never treated as "no grant". */
function readGrantRef(out:string,jobId:string):GrantRef{
 const f=grantFile(out,jobId);if(!existsSync(f))return {state:"none"};
 try{const v=JSON.parse(readFileSync(f,"utf8")) as {schemaVersion?:unknown;grantId?:unknown};
  return v?.schemaVersion==="hsi-job-grant-ref-1"&&isGrantId(v.grantId)?{state:"ok",grantId:v.grantId}:{state:"corrupt"}}catch{return {state:"corrupt"}}
}

/** Submits a fixture job that carries its own authority. Needs a LIVE verified session that owns `investigationId`; the session is used
 * once, to mint a grant bound to this job, and is not stored. The job is queued only after the grant and the fixture are in place
 * (the journal entry is the commit point), so a failure part-way leaves nothing runnable. Job ids include the investigation id, so
 * two investigations never share a job and a job always has exactly one owner. Roles default to `question_planner` (no tools): the
 * least a fixture needs. Resubmitting the same fixture for the same investigation is a no-op and mints no second grant. */
export async function submitAuthenticatedFixture(opts:{out:string;fixture:unknown;authority:GatewayCallerAuthority;sessionToken:string;investigationId:string;roles?:readonly HsiAgentRole[];lifetimeMs?:number;now?:()=>number}):Promise<{ok:true;jobId:string;created:boolean}|{ok:false;code:string}>{
 const fixture=validateRunnerFixture(opts.fixture);
 if(typeof opts.investigationId!=="string")return {ok:false,code:"invalid_request"};
 const jobId="fj-"+hashHsiCheckpointInput({fixture,investigationId:opts.investigationId}).slice(0,16);
 // Prove the caller owns the investigation before revealing anything about the queue.
 const who=await opts.authority.authorise({sessionToken:opts.sessionToken,investigationId:opts.investigationId,taskId:"submit",role:"question_planner"});
 if(!who.ok)return {ok:false,code:who.code};
 const journal=createJobJournal(jobDir(opts.out),{now:opts.now});
 if(journal.list().some(j=>j.jobId===jobId))return {ok:true,jobId,created:false};
 const d=await opts.authority.delegate({sessionToken:opts.sessionToken,investigationId:opts.investigationId,jobId,roles:[...(opts.roles??["question_planner"])],lifetimeMs:opts.lifetimeMs});
 if(!d.ok)return {ok:false,code:d.code};
 mkdirSync(join(resolve(opts.out),"queue"),{recursive:true});
 const fx=queueFile(opts.out,jobId);if(!existsSync(fx))writeFileAtomic(fx,JSON.stringify(fixture));
 writeFileAtomic(grantFile(opts.out,jobId),JSON.stringify({schemaVersion:"hsi-job-grant-ref-1",grantId:d.grantId}));
 return {ok:true,jobId,created:journal.create(jobId)};
}

/** Operator cancel (no session): for a person with access to the queue directory. Queued or failed jobs are cancelled at once; a running job
 * is asked to stop (its signal aborts) and ends as cancelled. It does NOT revoke a grant: use `cancelAuthenticatedJob` for that. */
export function cancelJob(opts:{out:string;jobId:string;reason?:string;now?:()=>number}):ReturnType<ReturnType<typeof createJobJournal>["cancel"]>{
 return createJobJournal(jobDir(opts.out),{now:opts.now}).cancel(opts.jobId,opts.reason??"admin_revoked");
}
/** Cancel by the researcher who owns the job. Needs a LIVE verified session that owns the job's investigation (taken from the signed grant,
 * not from the queue files). It revokes the grant first, so in-flight gateway calls stop at their next check, then cancels the job. */
export async function cancelAuthenticatedJob(opts:{out:string;authority:GatewayCallerAuthority;sessionToken:string;jobId:string;now?:()=>number}):Promise<{ok:true;result:string}|{ok:false;code:string}>{
 if(typeof opts.jobId!=="string")return {ok:false,code:"invalid_request"};
 const g=readGrantRef(opts.out,opts.jobId);
 if(g.state!=="ok")return {ok:false,code:g.state==="none"?"no_grant":"grant_unreadable"};
 const inv=await opts.authority.grantInvestigation({grantId:g.grantId,jobId:opts.jobId});
 if(!inv.ok)return {ok:false,code:inv.code};
 const who=await opts.authority.authorise({sessionToken:opts.sessionToken,investigationId:inv.investigationId,taskId:"cancel",role:"question_planner"});
 if(!who.ok)return {ok:false,code:who.code};
 const rv=await opts.authority.revokeJobGrant({grantId:g.grantId,jobId:opts.jobId,reason:"user_cancelled"});
 if(!rv.ok)return {ok:false,code:rv.code};
 return {ok:true,result:createJobJournal(jobDir(opts.out),{now:opts.now}).cancel(opts.jobId,"user_cancelled")};
}

export function jobStatus(out:string):JobState[]{return createJobJournal(jobDir(out)).list()}

/** One pass over every job that is due. */
export async function runWorkerOnce(opts:{out:string;runner?:FixtureRunner;
 /** Supplying an authority makes this an AUTHENTICATED worker: every job must carry a grant that still verifies, or it is not claimed.
  * Without one the worker is unauthenticated (fixtures only) and refuses any job that carries a grant, so it can never run an
  * authenticated job while ignoring its authority. */
 authority?:GatewayCallerAuthority}&DrainOptions):Promise<DrainResult>{
 const journal=createJobJournal(jobDir(opts.out),{now:opts.now});
 const run=opts.runner??defaultRunner,authority=opts.authority;
 const verify=async(jobId:string):Promise<{ok:true;grantId:string|null}|{ok:false;code:string}>=>{
  const g=readGrantRef(opts.out,jobId);
  if(g.state==="corrupt")return {ok:false,code:"grant_unreadable"};
  if(!authority)return g.state==="ok"?{ok:false,code:"grant_unverifiable"}:{ok:true,grantId:null};
  if(g.state==="none")return {ok:false,code:"no_grant"};
  const v=await authority.verifyJobGrant({grantId:g.grantId,jobId});
  return v.ok?{ok:true,grantId:g.grantId}:{ok:false,code:`grant_${v.code}`};
 };
 const theirs=opts.admit;
 const admit:NonNullable<DrainOptions["admit"]>=async jobId=>{
  const v=await verify(jobId);if(!v.ok)return v;
  return theirs?theirs(jobId):{ok:true};
 };
 return drainJobs(journal,async(jobId,{signal})=>{
  if(signal.aborted)throw Error("aborted before start");
  // Re-verified at the moment of running: a grant revoked between admission and claim must not start.
  const v=await verify(jobId);if(!v.ok)throw Error(`Job authority refused: ${v.code}`);
  const fixture=JSON.parse(readFileSync(queueFile(opts.out,jobId),"utf8"));
  let ctx:JobAuthority={grant:null,authoriseCall:null};
  if(authority&&v.grantId){
   const info=await authority.verifyJobGrant({grantId:v.grantId,jobId});
   if(!info.ok)throw Error(`Job authority refused: grant_${info.code}`);
   ctx={grant:{grantId:v.grantId,investigationId:info.investigationId,roles:info.roles},authoriseCall:authoriseJobCallsFor(authority,{grantId:v.grantId,jobId})};
  }
  return run(fixture,join(resolve(opts.out),"audit",jobId),ctx);
 },{...opts,admit});
}

/** Repeated passes until the signal aborts. `sleep` is injectable so tests do not wait. */
export async function runWorkerLoop(opts:{out:string;runner?:FixtureRunner;authority?:GatewayCallerAuthority;intervalMs:number;sleep?:(ms:number,signal:AbortSignal)=>Promise<void>;onPass?:(r:DrainResult)=>void;signal:AbortSignal;/** Optional worker id (`w-` plus hex) for the heartbeat file; random when absent. */workerId?:string}&DrainOptions):Promise<void>{
 const sleep=opts.sleep??((ms,signal)=>new Promise<void>(res=>{const t=setTimeout(res,ms);signal.addEventListener("abort",()=>{clearTimeout(t);res()},{once:true})}));
 const hb=createWorkerHeartbeat({out:opts.out,workerId:opts.workerId,now:opts.now});
 hb.start();
 try{
  while(!opts.signal.aborted){
   hb.beat("running");
   const r=await runWorkerOnce(opts);
   hb.pass(r);opts.onPass?.(r);
   if(opts.signal.aborted)break;
   await sleep(opts.intervalMs,opts.signal);
  }
 }finally{hb.stop()}
}
