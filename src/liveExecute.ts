/**
 * Guarded live execution. This is the only path that can start a real live investigation, and it refuses unless every
 * guard passes: a named human reviewer, a valid scope, a passing offline preflight, a first-run budget cap, and a typed
 * confirmation that names the job. The run itself is a durable NEXUS job (one at a time, never re-run once complete) and
 * goes through runLiveInvestigation, which re-checks both readiness gates, the kill switch and the daily cap.
 * Output is a brief and a review packet: both unapproved and non-promotable. Nothing is promoted or written to a graph.
 */
import {createHash,createPublicKey} from "node:crypto";
import {existsSync,mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {readFile} from "node:fs/promises";
import {dirname,join,resolve} from "node:path";
import {runLivePreflight,type PreflightReport} from "./livePreflight";
import {runLiveInvestigation,type LiveRunDeps,type LiveRunResult,type LiveRunRefusal} from "./liveRun";
import {buildLiveRunDeps} from "./liveWiring";
import {createJobJournal,runDurable} from "./nexusJobs";
import {buildReviewPacket} from "./reviewPacket";
import {assertProposalOnly,proposeEdgesFromAudit} from "./atlasProposals";
import {proposeGaps} from "./vantageGaps";
import {isInvestigationScopeId} from "./investigationScope";
import type {LiveRunConfig} from "./liveReadiness";
import type {SourceIntegrityConfig} from "./sourceIntegrityReadiness";
import {createManagedSigner} from "./researchV2/managedSigner";
import {createCloudKmsSignMessage,loadCloudKmsClient,type CloudKmsClient} from "./researchV2/cloudKmsSigner";
import {openStagingOperationStore} from "./researchV2/stagingOperationStore";
import {createFileReceiptPublisher} from "./researchV2/clearanceAuthority";

export const FIRST_RUN_LIMITS=Object.freeze({maxModelCallsPerRun:40,maxArticlesPerIntent:3});
export type ExecuteOptions={configPath:string;integrityConfigPath:string;question:string;scope:string;reviewer:string;outDir:string};
export type LoadedDeps={deps:LiveRunDeps;close:()=>Promise<void>};
export type ExecuteIo={
 env:Record<string,string|undefined>;now?:()=>number;
 readJson:(path:string)=>unknown;
 /** Returns what the human typed, or null when there is no interactive terminal. */
 confirm:(prompt:string)=>Promise<string|null>;
 loadDeps:(ctx:{config:LiveRunConfig;integrityConfig:unknown;env:Record<string,string|undefined>;target:LiveRunDeps["target"];auditDirectory:string;runsToday:()=>number}) =>Promise<LoadedDeps>;
};
export type ExecuteOutcome={ok:true;jobId:string;job:string;outputDir:string|null;auditHash:string|null}|{ok:false;refusals:string[];preflight?:PreflightReport};
const REVIEWER=/^user:[A-Za-z0-9][A-Za-z0-9._@-]{2,100}$/;
const sha=(t:string)=>createHash("sha256").update(t).digest("hex");

export async function runLiveExecute(opts:ExecuteOptions,io:ExecuteIo):Promise<ExecuteOutcome>{
 const refusals:string[]=[];
 if(!REVIEWER.test(opts.reviewer))refusals.push("a named human reviewer (user:<name>) is required");
 if(!isInvestigationScopeId(opts.scope))refusals.push("unknown investigation scope");
 if(typeof opts.question!=="string"||opts.question.trim().length<5||opts.question.length>500)refusals.push("question must be 5-500 characters");
 if(refusals.length)return {ok:false,refusals};
 let config:unknown,integrityConfig:unknown;
 try{config=io.readJson(opts.configPath);integrityConfig=io.readJson(opts.integrityConfigPath)}catch{return {ok:false,refusals:["configuration files could not be read"]}}
 const preflight=await runLivePreflight({config,integrityConfig,env:io.env,now:io.now});
 if(!preflight.ready)return {ok:false,refusals:["preflight is not ready: "+preflight.blocking.map(c=>c.id).join(", ")],preflight};
 const c=config as LiveRunConfig;
 if(c.limits.maxModelCallsPerRun>FIRST_RUN_LIMITS.maxModelCallsPerRun||c.limits.maxArticlesPerIntent>FIRST_RUN_LIMITS.maxArticlesPerIntent)
  return {ok:false,refusals:[`first-run caps: maxModelCallsPerRun <= ${FIRST_RUN_LIMITS.maxModelCallsPerRun} and maxArticlesPerIntent <= ${FIRST_RUN_LIMITS.maxArticlesPerIntent}`],preflight};
 const jobId="live-"+sha([opts.scope,opts.question,opts.reviewer].join("|")).slice(0,16);
 const typed=await io.confirm(`This will contact Europe PMC and Crossref and send cleared passages to the configured models, spending up to ${c.limits.maxModelCallsPerRun} model calls. Type: EXECUTE ${jobId}`);
 if(typed===null)return {ok:false,refusals:["no interactive terminal: execution needs a human to type the confirmation"],preflight};
 if(typed.trim()!==`EXECUTE ${jobId}`)return {ok:false,refusals:["confirmation did not match; nothing was run"],preflight};

 const journal=createJobJournal(join(resolve(opts.outDir),"jobs"),{now:io.now});
 const target:LiveRunDeps["target"]={investigationId:jobId,diseaseScope:opts.scope as LiveRunDeps["target"]["diseaseScope"],question:opts.question.trim(),release:{id:"live-"+jobId,version:"1",manifestHash:sha(jobId)}};
 const loaded=await io.loadDeps({config:c,integrityConfig,env:io.env,target,auditDirectory:join(resolve(opts.outDir),"audit"),runsToday:()=>journal.runsToday()});
 const box:{result:LiveRunResult|null;refusal:LiveRunRefusal|null}={result:null,refusal:null};
 try{
  const job=await runDurable(journal,jobId,async()=>{
   const out=await runLiveInvestigation(loaded.deps);
   if("refused" in out){box.refusal=out;throw Error("WARDEN refused: "+(out.reasons[0]??"gate").replace(/[^a-z_ ]/gi,"").slice(0,30).replace(/ /g,"_").toLowerCase())}
   box.result=out;return {auditHash:out.audit.auditHash};
  },{now:io.now});
  if(box.refusal)return {ok:false,refusals:box.refusal.reasons,preflight};
  if(job.status==="already_completed")return {ok:true,jobId,job:job.status,outputDir:null,auditHash:job.auditHash};
  if(job.status!=="completed"||!box.result)return {ok:false,refusals:[`job ${job.status}${"errorCode" in job?`: ${job.errorCode}`:""}`],preflight};
  const dir=join(resolve(opts.outDir),jobId);mkdirSync(dir,{recursive:true});
  const packet=buildReviewPacket({audit:box.result.audit,entailments:box.result.entailments,rejections:box.result.rejections});
  writeFileSync(join(dir,"brief.md"),box.result.brief+`\n\nExecuted under named reviewer: ${opts.reviewer}\n`);
  writeFileSync(join(dir,"review-packet.json"),JSON.stringify(packet,null,2));
  // ATLAS: draft edge proposals only (never approved, never promotable); VANTAGE: unvalidated gaps and falsifiable follow-ups.
  const sourceUrls=Object.fromEntries(box.result.audit.units.flatMap(u=>u.evidenceSourceIds).flatMap(id=>{const m=/^europepmc:(PMC[1-9]\d{0,11})$/.exec(id);return m?[[id,`https://europepmc.org/article/PMC/${m[1]}`]]:[]}));
  const proposals=proposeEdgesFromAudit({audit:box.result.audit,submitterId:"atlas:proposer",sourceUrls});
  for(const p of proposals.proposals)assertProposalOnly(p);
  writeFileSync(join(dir,"atlas-proposals.json"),JSON.stringify(proposals,null,2));
  writeFileSync(join(dir,"vantage.json"),JSON.stringify(proposeGaps(box.result.audit),null,2));
  return {ok:true,jobId,job:job.status,outputDir:dir,auditHash:job.auditHash};
 }finally{await loaded.close()}
}

/** Production loader: reads the signed policy, pinned public keys (from the environment), approvals and store from disk, and signs through Cloud KMS. */
export const loadFileDeps:ExecuteIo["loadDeps"]=ctx=>makeFileDepsLoader()(ctx);

/** Test and rehearsal seams: a KMS client, a fetcher and a provider transport can be injected. Production passes none. */
export function makeFileDepsLoader(seams:{kmsClient?:CloudKmsClient;fetcher?:LiveRunDeps["fetcher"];transportFactory?:Parameters<typeof buildLiveRunDeps>[0]["transportFactory"]}={}):ExecuteIo["loadDeps"]{
 return ctx=>loadFromFiles(ctx,seams);
}
async function loadFromFiles(ctx:Parameters<ExecuteIo["loadDeps"]>[0],seams:Parameters<typeof makeFileDepsLoader>[0]={}):Promise<LoadedDeps>{
 const c=ctx.config,ic=ctx.integrityConfig as SourceIntegrityConfig&{signer:{keyVersionName?:string;publicKeyEnv?:string}};
 const pem=(name:string|undefined,what:string)=>{const v=name?ctx.env[name]:undefined;if(!v?.trim())throw Error(`${what} is not in the environment`);return createPublicKey(v)};
 const policy=JSON.parse(readFileSync(ic.policyFile,"utf8"));
 const signerPublicKey=pem(ic.signer.publicKeyEnv,"signer public key");
 if(!ic.signer.keyVersionName)throw Error("signer.keyVersionName is required");
 const signer=createManagedSigner({serviceRef:ic.signer.serviceRef,issuer:ic.signer.issuer,keyId:ic.signer.keyId,publicKey:signerPublicKey,
  signMessage:createCloudKmsSignMessage({keyVersionName:ic.signer.keyVersionName,client:seams.kmsClient??await loadCloudKmsClient()})});
 const root=dirname(resolve(c.operationStore.path)),approvalsDir=join(root,"approvals");
 const safe=/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
 const store=await openStagingOperationStore(c.operationStore.path);
 try{
  const built=buildLiveRunDeps({config:c,integrityConfig:ic as unknown as {requestedUses:readonly string[]}&Record<string,unknown>,env:ctx.env,
   policy,policyAuthorities:[{issuer:ic.policyApprover.issuer,keyId:ic.policyApprover.keyId,publicKey:pem(ic.policyApprover.publicKeyEnv,"policy approver public key")}],
   signer,signerPublicKey,
   approvalAuthorities:[{issuer:c.deploymentApproval.issuer,keyId:c.deploymentApproval.keyId,publicKey:pem(c.deploymentApproval.publicKeyEnv,"deployment approval public key")}],
   resolveApproval:async b=>{if(!safe.test(b.deploymentId))throw Error("invalid deployment id");return JSON.parse(await readFile(join(approvalsDir,`${b.deploymentId}.json`),"utf8"))},
   isApprovalRevoked:async(id,issuer)=>{const f=join(approvalsDir,"revocations.jsonl");if(!existsSync(f))return false;return readFileSync(f,"utf8").split("\n").filter(Boolean).some(l=>{try{const r=JSON.parse(l);return r.id===id&&r.issuer===issuer}catch{return true}})},
   fetcher:seams.fetcher??fetch,transportFactory:seams.transportFactory,store,publisher:createFileReceiptPublisher(join(root,"published")),auditDirectory:ctx.auditDirectory,target:ctx.target,runsToday:ctx.runsToday});
  return {deps:built.deps,close:()=>store.close()};
 }catch(error){await store.close();throw error}
}
