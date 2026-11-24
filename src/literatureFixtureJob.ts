/** The recorded-fixture literature job: what an authenticated NEXUS worker runs for a `literature_fixture` job.
 *
 * It drives the REAL path end to end: the worker's grant becomes gateway authorisations (`authoriseCall`), the orchestrator runs the
 * retrieval executor, the executor calls three providers through the authenticated gateway, the candidate set is saved, a brief is built
 * against the gateway's own audit records and saved. The ONLY fixture is the network: provider responses are recorded, synthetic and
 * labelled, served by an injected fetcher. So it shows the control flow, permissions, limits, audit and brief logic working together; it
 * says nothing about live providers, and every brief it produces is stamped `fixture_recorded` and cannot be relabelled.
 *
 * Recorded records are placeholders ("[FIXTURE] Synthetic record ..."), not scientific content: no finding, claim or citation is invented. */
import {existsSync,mkdirSync,readFileSync} from "node:fs";
import {join} from "node:path";
import {writeFileAtomic} from "./fileLock";
import {createFileLimitStore} from "./gatewayLimitStore";
import {canonicalHsiManifest,type GatewayCallerAuthority,type GatewayAuthorisation} from "./gatewayCallerAuthority";
import {createLiteratureRetrievalExecutor,createFileLiteratureSink} from "./governedLiteratureRetrievalExecutor";
import {createFileIdempotencyStore,createToolAuditLog,createToolGateway} from "./governedToolGateway";
import {governedProviderCatalogue} from "./governedProviderTools";
import {runHsiAgentOrchestration} from "./hsiAgentOrchestrator";
import type {HsiAgentRole} from "./hsiAgentIntelligenceContracts";
import {buildLiteratureBrief,createFileBriefStore,verifyLiteratureBrief,type LiteratureBrief} from "./literatureBrief";
import type {SourceFetcher} from "./researchV2/sourceAdapters";

export type LiteratureJob={schemaVersion:"hsi-nexus-job-1";kind:"literature_fixture";terms:string[]};
export function parseLiteratureJob(v:unknown):LiteratureJob{
 const o=v as LiteratureJob;
 if(!o||typeof o!=="object"||o.schemaVersion!=="hsi-nexus-job-1"||o.kind!=="literature_fixture"||Object.keys(o).length!==3)throw Error("Invalid literature job");
 if(!Array.isArray(o.terms)||o.terms.length<1||o.terms.length>8||o.terms.some(t=>typeof t!=="string"||!t.trim()||t.length>160||/[\u0000-\u001f\u007f]/.test(t)))throw Error("Invalid search terms");
 return {schemaVersion:"hsi-nexus-job-1",kind:"literature_fixture",terms:o.terms.map(t=>t.trim())};
}

const json=(b:unknown)=>new Response(JSON.stringify(b),{status:200,headers:{"content-type":"application/json"}});
/** Recorded, synthetic responses in the three providers' real response shapes. Ignores the query: it is a recording. */
export function recordedLiteratureFetcher():SourceFetcher{
 return (async input=>{
  const host=new URL(typeof input==="string"||input instanceof URL?String(input):input.url).hostname;
  if(host==="www.ebi.ac.uk")return json({resultList:{result:[
   {id:"90000001",source:"MED",pmid:"90000001",title:"[FIXTURE] Synthetic literature record A",doi:"10.5555/fixture.a",pubYear:"2020"},
   {id:"90000002",source:"MED",pmid:"90000002",title:"[FIXTURE] Synthetic literature record B",doi:"10.5555/fixture.b",pubYear:"2021"}]}});
  if(host==="api.openalex.org")return json({results:[{id:"https://openalex.org/W9000001",title:"[FIXTURE] Synthetic literature record A (second provider)",doi:"https://doi.org/10.5555/fixture.a",publication_year:2020,type:"article",ids:{pmid:"https://pubmed.ncbi.nlm.nih.gov/90000001/"}}]});
  if(host==="api.crossref.org")return json({message:{items:[{DOI:"10.5555/fixture.c",title:["[FIXTURE] Synthetic literature record C"],issued:{"date-parts":[[2022]]},type:"journal-article","container-title":["Fixture Journal"]}]}});
  throw Error("Recorded fetcher has no recording for this host");
 }) as SourceFetcher;
}

export type LiteratureJobEnv={
 out:string;jobId:string;
 /** The job's scope, from its verified grant. */
 grant:{grantId:string;investigationId:string;roles:readonly string[]};
 authoriseCall:(task:{taskId:string;role:HsiAgentRole})=>Promise<GatewayAuthorisation>;
 callerAuthority:GatewayCallerAuthority;
 signal:AbortSignal;progress:(stage:string,step:number,of:number)=>boolean;
 fetcher?:SourceFetcher;
};
export const resultFile=(out:string,jobId:string)=>join(out,"results",`${jobId}.json`);

/** Runs one recorded-fixture literature job. Throws (codes only) on any failure, which the worker records as a failed attempt. */
export async function runLiteratureFixtureJob(job:LiteratureJob,env:LiteratureJobEnv):Promise<{auditHash:string}>{
 if(!env.grant.roles.includes("evidence_retriever"))throw Error("Grant does not allow retrieval");
 const audit=createToolAuditLog({directory:join(env.out,"audit",env.jobId)});
 const gateway=createToolGateway({tools:governedProviderCatalogue({}),audit,callerAuthority:env.callerAuthority,fetcher:env.fetcher??recordedLiteratureFetcher(),
  idempotency:createFileIdempotencyStore(join(env.out,"idempotency")),limits:createFileLimitStore(join(env.out,"limits")),sleep:async()=>{}});
 if(gateway.mode!=="authenticated")throw Error("Gateway is not authenticated");
 const sink=createFileLiteratureSink(join(env.out,"candidates"));
 env.progress("retrieve",1,3);
 const run=await runHsiAgentOrchestration({
  investigationId:env.grant.investigationId,tasks:[{id:"retrieve",manifest:canonicalHsiManifest("evidence_retriever"),dependsOn:[]}],
  graphRelease:{id:"fixture-release",version:"1.0.0",manifestHash:"0".repeat(64)},dataClass:"public_biomedical",toolGateway:gateway,authoriseCall:env.authoriseCall,signal:env.signal,
  executors:{evidence_retriever:createLiteratureRetrievalExecutor({terms:()=>job.terms,sink})},
 });
 const ref=run.results.retrieve?.outputRef;
 if(run.status!=="completed"||!ref)throw Error(`Retrieval step ${run.status}`);
 env.progress("build_brief",2,3);
 const set=await sink.load(ref);
 const brief=buildLiteratureBrief({dataMode:"fixture_recorded",set,ref,audit:audit.records() as never});
 env.progress("save_brief",3,3);
 const briefRef=await createFileBriefStore(join(env.out,"briefs")).save(brief);
 mkdirSync(join(env.out,"results"),{recursive:true});
 writeFileAtomic(resultFile(env.out,env.jobId),JSON.stringify({schemaVersion:"hsi-nexus-result-1",kind:"literature_fixture",briefRef}));
 return {auditHash:brief.contentHash};
}

/** The saved brief of a finished job, verified on load. Null when the job has no result yet. Throws if the stored brief fails verification. */
export async function loadJobBrief(out:string,jobId:string):Promise<{briefRef:string;brief:LiteratureBrief}|null>{
 const f=resultFile(out,jobId);if(!existsSync(f))return null;
 const r=JSON.parse(readFileSync(f,"utf8")) as {schemaVersion?:string;briefRef?:string};
 if(r.schemaVersion!=="hsi-nexus-result-1"||typeof r.briefRef!=="string")throw Error("Corrupt job result");
 const brief=await createFileBriefStore(join(out,"briefs")).load(r.briefRef);
 return {briefRef:r.briefRef,brief:verifyLiteratureBrief(brief)};
}
