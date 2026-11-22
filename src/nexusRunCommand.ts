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
import {hashHsiCheckpointInput} from "./hsiAgentDurableCheckpoint";
import {runFixtureInvestigation,validateRunnerFixture,FIXTURE_NOTICE} from "./investigationRunner";
import {createJobJournal,type JobState} from "./nexusJobs";
import {drainJobs,type DrainOptions,type DrainResult} from "./nexusWorker";

export {FIXTURE_NOTICE};
const jobDir=(out:string)=>join(resolve(out),"jobs");
const queueFile=(out:string,jobId:string)=>join(resolve(out),"queue",`${jobId}.fixture.json`);
export type FixtureRunner=(fixture:unknown,auditDirectory:string)=>Promise<{auditHash:string}>;
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

export function jobStatus(out:string):JobState[]{return createJobJournal(jobDir(out)).list()}

/** One pass over every job that is due. */
export async function runWorkerOnce(opts:{out:string;runner?:FixtureRunner}&DrainOptions):Promise<DrainResult>{
 const journal=createJobJournal(jobDir(opts.out),{now:opts.now});
 const run=opts.runner??defaultRunner;
 return drainJobs(journal,async(jobId,{signal})=>{
  if(signal.aborted)throw Error("aborted before start");
  const fixture=JSON.parse(readFileSync(queueFile(opts.out,jobId),"utf8"));
  return run(fixture,join(resolve(opts.out),"audit",jobId));
 },opts);
}

/** Repeated passes until the signal aborts. `sleep` is injectable so tests do not wait. */
export async function runWorkerLoop(opts:{out:string;runner?:FixtureRunner;intervalMs:number;sleep?:(ms:number,signal:AbortSignal)=>Promise<void>;onPass?:(r:DrainResult)=>void;signal:AbortSignal}&DrainOptions):Promise<void>{
 const sleep=opts.sleep??((ms,signal)=>new Promise<void>(res=>{const t=setTimeout(res,ms);signal.addEventListener("abort",()=>{clearTimeout(t);res()},{once:true})}));
 while(!opts.signal.aborted){
  opts.onPass?.(await runWorkerOnce(opts));
  if(opts.signal.aborted)break;
  await sleep(opts.intervalMs,opts.signal);
 }
}
