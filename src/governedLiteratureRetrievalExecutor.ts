/** Literature retrieval executor: the first agent step that reaches an external provider, and only through the governed gateway.
 *
 * It is an `evidence_retriever` executor. It receives `ctx.callTool` (the gateway) and nothing else that can reach the network;
 * a source scan in the tests enforces that this file never calls `fetch`. For each configured provider it asks for literature
 * search hits, merges them by canonical id, and saves ONE artifact: a candidate set.
 *
 * What the artifact is and is not:
 * - It is a set of search hits with metadata (title, DOI, PMID, year) and a per-provider receipt tying each result to the
 *   gateway audit record (`auditSeq`, request and response hashes). `evidenceStatus` is always `candidate_only` and every
 *   candidate is `unreviewed`.
 * - It is not evidence. Relevance, study design, species, tissue, cell state and assay are unassessed. No passage, abstract or
 *   full text is retrieved (the tools are metadata only). Nothing is reviewed, approved or promoted to the graph.
 * - A hit from a response the gateway flagged for possible prompt injection is quarantined (excluded and counted), not passed on.
 *
 * Search terms come from the caller (`terms`); this module does not derive scientific queries. Not wired into
 * `hsiResearchAgentRuntime`: nothing in production selects it yet. */
import {existsSync,mkdirSync,readFileSync} from "node:fs";
import {join} from "node:path";
import {writeFileAtomic} from "./fileLock";
import {hashHsiCheckpointInput} from "./hsiAgentDurableCheckpoint";
import type {HsiAgentExecutor,HsiAgentStepResult} from "./hsiAgentOrchestrator";

export type LiteratureCandidate={canonicalId:string;sourceUrl:string;title:string|null;doi:string|null;pmid:string|null;publicationYear:number|string|null;providers:string[];sourceIds:string[];reviewStatus:"unreviewed"};
export type LiteratureCallReceipt={provider:string;ok:boolean;code:string|null;replayed:boolean;auditSeq:number;requestHash:string|null;responseHash:string|null;records:number;flagged:number};
export type LiteratureCandidateSet={
 schemaVersion:"hsi-literature-candidates-1";investigationId:string;taskId:string;terms:string[];
 evidenceStatus:"candidate_only";candidates:LiteratureCandidate[];calls:LiteratureCallReceipt[];quarantined:number;limitations:string[];
};
/** `load` returns a saved set only if it still hashes to its reference, so a reopened set cannot have been edited. */
export type LiteratureCandidateSink={save(set:LiteratureCandidateSet):Promise<string>;load?(ref:string):Promise<LiteratureCandidateSet>};
const SET_REF=/^lit:\/\/([a-f0-9]{40})$/;

export const DEFAULT_LITERATURE_PROVIDERS=["europe-pmc","openalex","crossref"] as const;
const MAX_CANDIDATES=100;
const LIMITATIONS=[
 "Metadata only: no passage, abstract or full text was retrieved",
 "Candidates are search hits, not evidence: relevance, study design, species, tissue, cell state and assay are unassessed",
 "Nothing here is reviewed, approved or promoted to the graph",
];

export function createMemoryLiteratureSink():LiteratureCandidateSink&{load(ref:string):Promise<LiteratureCandidateSet>;sets:()=>readonly LiteratureCandidateSet[]}{
 const saved:LiteratureCandidateSet[]=[];
 return {
  async save(set){saved.push(structuredClone(set));return `lit://${hashHsiCheckpointInput(set).slice(0,40)}`},
  async load(ref){const m=SET_REF.exec(ref);const s=m&&saved.find(x=>hashHsiCheckpointInput(x).startsWith(m[1]!));if(!s)throw Error("Unknown candidate set");return structuredClone(s)},
  sets:()=>saved.map(s=>structuredClone(s)),
 };
}
/** Atomic, content-addressed files: the same set always lands at the same path, so a repeated save is harmless. */
export function createFileLiteratureSink(dir:string):LiteratureCandidateSink&{load(ref:string):Promise<LiteratureCandidateSet>}{
 mkdirSync(dir,{recursive:true});
 return {
  async save(set){const h=hashHsiCheckpointInput(set).slice(0,40);writeFileAtomic(join(dir,`${h}.json`),JSON.stringify(set));return `lit://${h}`},
  async load(ref){
   const m=SET_REF.exec(ref);if(!m)throw Error("Invalid candidate set reference");
   const f=join(dir,`${m[1]}.json`);if(!existsSync(f))throw Error("Unknown candidate set");
   const set=JSON.parse(readFileSync(f,"utf8")) as LiteratureCandidateSet;
   if(!hashHsiCheckpointInput(set).startsWith(m[1]!))throw Error("Candidate set does not match its reference");
   return set;
  },
 };
}

type Rec={canonicalId:unknown;sourceUrl:unknown;sourceId:unknown;metadata?:{title?:unknown;doi?:unknown;pmid?:unknown;publicationYear?:unknown}};
const str=(v:unknown,max=500):string|null=>typeof v==="string"&&v.trim()?v.trim().slice(0,max):null;
/** Indexes of records the gateway flagged, from paths like `data[3].metadata.title`. A flag that names no index quarantines the whole response. */
function flaggedIndexes(flags:readonly {path:string}[],length:number):Set<number>{
 const out=new Set<number>();
 for(const f of flags){const m=/^data\[(\d+)\]/.exec(f.path);if(m)out.add(Number(m[1]));else for(let i=0;i<length;i++)out.add(i)}
 return out;
}

export function createLiteratureRetrievalExecutor(cfg:{
 terms:()=>readonly string[]|Promise<readonly string[]>;
 sink:LiteratureCandidateSink;
 providers?:readonly string[];
 limit?:number;
}):HsiAgentExecutor{
 const providers=[...(cfg.providers??DEFAULT_LITERATURE_PROVIDERS)];
 if(!providers.length||providers.length>3||new Set(providers).size!==providers.length||providers.some(p=>!/^[a-z0-9-]{2,40}$/.test(p)))throw Error("Invalid literature providers");
 const limit=cfg.limit??20;
 if(!Number.isInteger(limit)||limit<1||limit>25)throw Error("Invalid literature limit");
 return async ctx=>{
  if(ctx.role!=="evidence_retriever")throw Error("Wrong agent role");
  // No separate `assertTool`: each `callTool` runs the manifest permission check itself, and an extra assertion would spend a slot of the task's call budget.
  if(!ctx.callTool)throw Error("No governed tool gateway configured");
  const raw=await cfg.terms();
  const terms=Array.isArray(raw)?raw.map(t=>typeof t==="string"?t.trim():""):[];
  if(terms.length<1||terms.length>8||terms.some(t=>!t||t.length>160))return {status:"blocked",outputRef:null,reason:"No usable search terms"} satisfies HsiAgentStepResult;

  const byId=new Map<string,LiteratureCandidate>(),calls:LiteratureCallReceipt[]=[];let quarantined=0;
  for(const provider of providers){
   if(ctx.signal.aborted)break;
   const r=await ctx.callTool("literature.search",{terms,limit},provider);
   if(!r.ok){calls.push({provider,ok:false,code:r.code,replayed:false,auditSeq:r.auditSeq,requestHash:null,responseHash:null,records:0,flagged:0});continue}
   const data=Array.isArray(r.data)?r.data as Rec[]:[];
   const bad=flaggedIndexes(r.flags,data.length);
   calls.push({provider,ok:true,code:null,replayed:r.replayed,auditSeq:r.auditSeq,requestHash:r.provenance.requestHash,responseHash:r.provenance.responseHash,records:data.length,flagged:bad.size});
   data.forEach((x,i)=>{
    if(bad.has(i)){quarantined++;return}
    const canonicalId=str(x?.canonicalId,200),sourceUrl=str(x?.sourceUrl,300),sourceId=str(x?.sourceId,200);
    if(!canonicalId||!sourceUrl||!sourceId)return;
    const key=canonicalId.toLowerCase(),m=x.metadata??{};
    const year=typeof m.publicationYear==="number"&&Number.isInteger(m.publicationYear)?m.publicationYear:str(m.publicationYear,10);
    const prior=byId.get(key);
    if(prior){
     if(!prior.providers.includes(provider))prior.providers.push(provider);
     if(!prior.sourceIds.includes(sourceId))prior.sourceIds.push(sourceId);
     prior.title??=str(m.title);prior.doi??=str(m.doi,200);prior.pmid??=str(m.pmid,20);prior.publicationYear??=year;
    }else if(byId.size<MAX_CANDIDATES){
     byId.set(key,{canonicalId,sourceUrl,title:str(m.title),doi:str(m.doi,200),pmid:str(m.pmid,20),publicationYear:year,providers:[provider],sourceIds:[sourceId],reviewStatus:"unreviewed"});
    }
   });
  }
  if(!calls.some(c=>c.ok)){
   // Codes only: provider names and refusal codes, never upstream text.
   return {status:"blocked",outputRef:null,reason:`No provider returned results: ${calls.map(c=>`${c.provider}:${c.code}`).join(", ")||"no call made"}`};
  }
  const candidates=[...byId.values()].map(c=>({...c,providers:[...c.providers].sort(),sourceIds:[...c.sourceIds].sort()})).sort((a,b)=>a.canonicalId.localeCompare(b.canonicalId));
  const limitations=[...LIMITATIONS];
  for(const c of calls)if(!c.ok)limitations.push(`${c.provider} did not answer (${c.code}); this set is incomplete`);
  if(quarantined)limitations.push(`${quarantined} hit(s) were quarantined because the gateway flagged possible prompt injection`);
  if(byId.size>=MAX_CANDIDATES)limitations.push(`Capped at ${MAX_CANDIDATES} candidates`);
  const set:LiteratureCandidateSet={schemaVersion:"hsi-literature-candidates-1",investigationId:ctx.investigationId,taskId:ctx.taskId,terms,evidenceStatus:"candidate_only",candidates,calls,quarantined,limitations};
  const ref=await cfg.sink.save(set);
  if(typeof ref!=="string"||!ref.trim())throw Error("Literature candidate persistence failed");
  return {status:"completed",outputRef:ref,reason:null};
 };
}
