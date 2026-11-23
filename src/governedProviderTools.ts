/** Governed provider tools: OpenAlex, Crossref, ClinicalTrials.gov and Open Targets behind `governedToolGateway`.
 *
 * Each tool is metadata only (`passageAccess: "metadata_only"`): no full text, no passages, no licence is asserted. Request and
 * response shapes were checked against the providers' current public documentation and a small live read on 22 Nov 2026 (see
 * docs/audits/HSI_PROVIDER_CONTRACTS_2026-11-22.md). Providers change; the output schemas below reject drift rather than guess.
 *
 * Credentials and contact details come only from the caller (see `providerConfigFromEnv`): never a default, never logged, never
 * placed in a URL when a header is supported. Nothing here provisions a key or an account.
 *
 * Only an allowlist of fields is copied from each response. Everything else, including any free-text notices a provider adds to
 * `meta`, is dropped before data reaches an agent. (OpenAlex currently returns a `meta.notice` that addresses AI agents; it is
 * discarded here and covered by a test.)
 */
import {europePmcLiteratureSearchTool,type ToolDefinition} from "./governedToolGateway";
import {openTargetsAdapter,type SourceFetcher} from "./researchV2/sourceAdapters";

export type GovernedSourceKind="publication"|"trial"|"target_disease";
export type GovernedSourceRecord={
 sourceId:string;kind:GovernedSourceKind;canonicalId:string;sourceUrl:string;retrievedAt:string;sourceVersion:string;
 licenceId:null;passageUsePermitted:false;accessClass:"public";metadata:Record<string,unknown>;
};
export type ProviderConfig={
 /** OpenAlex API key. Absent means keyless, which the provider limits to a small shared daily budget per network address. */
 openAlexApiKey?:string;
 /** Contact address for Crossref's polite pool. Absent means the public pool. Use a project mailbox, never a personal address. */
 crossrefContact?:string;
};
const KEY=/^[A-Za-z0-9._~+-]{16,200}$/;
const MAIL=/^[^\s@<>"']{1,64}@[A-Za-z0-9.-]{1,120}\.[A-Za-z]{2,}$/;
/** Reads optional configuration from an environment object. Invalid values are ignored, not echoed. */
export function providerConfigFromEnv(env:Record<string,string|undefined>):ProviderConfig{
 const k=env.HSI_OPENALEX_API_KEY?.trim(),c=env.HSI_CROSSREF_CONTACT?.trim();
 return {...(k&&KEY.test(k)?{openAlexApiKey:k}:{}),...(c&&MAIL.test(c)?{crossrefContact:c}:{})};
}

const str=(v:unknown,max=500):string|null=>typeof v==="string"&&v.trim()?v.trim().slice(0,max):null;
const stripDoi=(v:unknown)=>str(v)?.replace(/^https?:\/\/(dx\.)?doi\.org\//i,"")??null;
const year=(v:unknown)=>typeof v==="number"&&Number.isInteger(v)&&v>1000&&v<3000?v:null;
async function getJson(f:SourceFetcher,url:URL,provider:string,headers:Record<string,string>={}):Promise<any>{
 const res=await f(url.toString(),{headers:{Accept:"application/json",...headers}});
 if(!res.ok)throw Error(`${provider} HTTP ${res.status}`); // the gateway retries 429 and 5xx only
 try{return await res.json()}catch{throw Error(`${provider} returned invalid JSON`)}
}
const terms=(v:unknown,field:string,max:number)=>{
 const o=v as Record<string,unknown>;const a=o&&typeof o==="object"?o[field]:undefined;
 if(!Array.isArray(a)||a.length<1||a.length>max||a.some(t=>typeof t!=="string"||!t.trim()||t.length>160))throw Error(`Invalid ${field}`);
 return a.map(t=>(t as string).trim());
};
const limit=(v:unknown,max:number)=>{
 const l=(v as {limit?:unknown})?.limit===undefined?20:(v as {limit:unknown}).limit;
 if(typeof l!=="number"||!Number.isInteger(l)||l<1||l>max)throw Error("Invalid limit");return l;
};
const base=(over:Partial<ToolDefinition>):Pick<ToolDefinition,"dataClass"|"passageAccess"|"timeoutMs"|"maxAttempts"|"maxResponseBytes"|"ratePerMinute"|"version">=>({
 dataClass:"public_biomedical",passageAccess:"metadata_only",timeoutMs:15_000,maxAttempts:2,maxResponseBytes:2_000_000,ratePerMinute:30,version:"1.0.0",...over});

/** Strict, shared output check. Rebuilds each record from an allowlist, so unknown upstream fields cannot pass through. */
export function parseGovernedRecords(opts:{idPrefix:string;kind:GovernedSourceKind;urlPrefixes:readonly string[];meta:(m:Record<string,unknown>)=>Record<string,unknown>;max?:number}){
 return (v:unknown):GovernedSourceRecord[]=>{
  if(!Array.isArray(v)||v.length>(opts.max??50))throw Error("Invalid output");
  return v.map(r=>{
   const x=r as GovernedSourceRecord;
   if(!x||typeof x.sourceId!=="string"||!x.sourceId.startsWith(opts.idPrefix)||x.sourceId.length>200||x.kind!==opts.kind||typeof x.canonicalId!=="string"||!x.canonicalId||x.canonicalId.length>200||typeof x.sourceUrl!=="string"||!opts.urlPrefixes.some(p=>x.sourceUrl.startsWith(p))||!Number.isFinite(Date.parse(x.retrievedAt))||x.passageUsePermitted!==false||x.licenceId!==null||x.accessClass!=="public")throw Error("Invalid record");
   return {sourceId:x.sourceId,kind:x.kind,canonicalId:x.canonicalId,sourceUrl:x.sourceUrl,retrievedAt:x.retrievedAt,sourceVersion:String(x.sourceVersion??"").slice(0,80),licenceId:null,passageUsePermitted:false as const,accessClass:"public" as const,metadata:opts.meta(x.metadata??{})};
  });
 };
}
const pubMeta=(m:Record<string,unknown>)=>({title:str(m.title),doi:str(m.doi,200),pmid:str(m.pmid,20),publicationYear:year(m.publicationYear),venue:str(m.venue,300),workType:str(m.workType,60)});

/* ---------- OpenAlex (literature.search) ---------- */
export function openAlexLiteratureSearchTool(cfg:ProviderConfig={}):ToolDefinition<{terms:string[];limit:number},GovernedSourceRecord[]>{
 return {
  id:"literature.search",providerId:"openalex",hosts:["api.openalex.org"],...base({ratePerMinute:20}),
  parseInput:v=>({terms:terms(v,"terms",8),limit:limit(v,25)}),
  parseOutput:parseGovernedRecords({idPrefix:"openalex:W",kind:"publication",urlPrefixes:["https://openalex.org/W"],meta:pubMeta}),
  async execute(input,ctx){
   const u=new URL("https://api.openalex.org/works");
   u.searchParams.set("search",input.terms.join(" "));u.searchParams.set("per_page",String(input.limit));
   u.searchParams.set("select","id,doi,title,publication_year,ids,type");
   // Header, not query string, so the key never lands in a URL, a proxy log or a stored request.
   const body=await getJson(ctx.fetch,u,"OpenAlex",cfg.openAlexApiKey?{Authorization:`Bearer ${cfg.openAlexApiKey}`}:{});
   if(!Array.isArray(body?.results))throw Error("Unexpected OpenAlex response");
   const at=new Date().toISOString();
   return body.results.flatMap((w:any)=>{
    const id=typeof w?.id==="string"?/^https:\/\/openalex\.org\/(W\d{1,15})$/.exec(w.id)?.[1]:undefined;
    if(!id)return [];
    const pmid=str(w.ids?.pmid)?.replace(/^https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//,"").replace(/\/$/,"")??null,doi=stripDoi(w.doi);
    return [{sourceId:`openalex:${id}`,kind:"publication" as const,canonicalId:pmid&&/^\d+$/.test(pmid)?`PMID:${pmid}`:doi?`DOI:${doi}`:`OPENALEX:${id}`,sourceUrl:`https://openalex.org/${id}`,retrievedAt:at,sourceVersion:"openalex-works-v1",licenceId:null,passageUsePermitted:false as const,accessClass:"public" as const,
     metadata:{title:str(w.title),doi,pmid:pmid&&/^\d+$/.test(pmid)?pmid:null,publicationYear:year(w.publication_year),workType:str(w.type,60)}}];
   });
  },
 };
}

/* ---------- Crossref (literature.search) ---------- */
export function crossrefLiteratureSearchTool(cfg:ProviderConfig={}):ToolDefinition<{terms:string[];limit:number},GovernedSourceRecord[]>{
 return {
  id:"literature.search",providerId:"crossref",hosts:["api.crossref.org"],...base({ratePerMinute:30}),
  parseInput:v=>({terms:terms(v,"terms",8),limit:limit(v,25)}),
  parseOutput:parseGovernedRecords({idPrefix:"crossref:10.",kind:"publication",urlPrefixes:["https://doi.org/10."],meta:pubMeta}),
  async execute(input,ctx){
   const u=new URL("https://api.crossref.org/works");
   u.searchParams.set("query.bibliographic",input.terms.join(" "));u.searchParams.set("rows",String(input.limit));
   u.searchParams.set("select","DOI,title,issued,type,container-title");
   if(cfg.crossrefContact)u.searchParams.set("mailto",cfg.crossrefContact); // polite pool: Crossref's documented way to identify a client
   const body=await getJson(ctx.fetch,u,"Crossref");
   if(!Array.isArray(body?.message?.items))throw Error("Unexpected Crossref response");
   const at=new Date().toISOString();
   return body.message.items.flatMap((w:any)=>{
    const doi=str(w?.DOI,200);if(!doi||!/^10\.\d{4,9}\/\S+$/.test(doi))return [];
    return [{sourceId:`crossref:${doi}`,kind:"publication" as const,canonicalId:`DOI:${doi}`,sourceUrl:`https://doi.org/${doi}`,retrievedAt:at,sourceVersion:"crossref-works-v1",licenceId:null,passageUsePermitted:false as const,accessClass:"public" as const,
     metadata:{title:str(Array.isArray(w.title)?w.title[0]:null),doi,pmid:null,publicationYear:year(w.issued?.["date-parts"]?.[0]?.[0]),venue:str(Array.isArray(w["container-title"])?w["container-title"][0]:null,300),workType:str(w.type,60)}}];
   });
  },
 };
}

/* ---------- ClinicalTrials.gov v2 (trial.search) ---------- */
export function clinicalTrialsSearchTool():ToolDefinition<{conditions:string[];limit:number},GovernedSourceRecord[]>{
 return {
  id:"trial.search",providerId:"clinicaltrials-gov",hosts:["clinicaltrials.gov"],...base({ratePerMinute:20}),
  parseInput:v=>({conditions:terms(v,"conditions",4),limit:limit(v,25)}),
  parseOutput:parseGovernedRecords({idPrefix:"ctgov:NCT",kind:"trial",urlPrefixes:["https://clinicaltrials.gov/study/NCT"],max:25,meta:m=>({title:str(m.title),status:str(m.status,40),conditions:Array.isArray(m.conditions)?m.conditions.slice(0,20).map(c=>str(c,200)).filter((c):c is string=>c!==null):[]})}),
  async execute(input,ctx){
   const u=new URL("https://clinicaltrials.gov/api/v2/studies");
   u.searchParams.set("query.cond",input.conditions.join(" OR "));u.searchParams.set("pageSize",String(input.limit));
   u.searchParams.set("fields","NCTId,BriefTitle,OverallStatus,Condition");u.searchParams.set("format","json");
   const body=await getJson(ctx.fetch,u,"ClinicalTrials.gov");
   if(!Array.isArray(body?.studies))throw Error("Unexpected ClinicalTrials.gov response");
   const at=new Date().toISOString();
   return body.studies.flatMap((s:any)=>{
    const p=s?.protocolSection,id=str(p?.identificationModule?.nctId,20);
    if(!id||!/^NCT\d{8}$/.test(id))return [];
    return [{sourceId:`ctgov:${id}`,kind:"trial" as const,canonicalId:id,sourceUrl:`https://clinicaltrials.gov/study/${id}`,retrievedAt:at,sourceVersion:"clinicaltrials-gov-api-v2",licenceId:null,passageUsePermitted:false as const,accessClass:"public" as const,
     metadata:{title:str(p.identificationModule?.briefTitle),status:str(p.statusModule?.overallStatus,40),conditions:p.conditionsModule?.conditions}}];
   });
  },
 };
}

/* ---------- Open Targets (evidence.get): target-disease associations ---------- */
export function openTargetsEvidenceTool():ToolDefinition<{diseaseIds:string[];limit:number},GovernedSourceRecord[]>{
 return {
  id:"evidence.get",providerId:"open-targets",hosts:["api.platform.opentargets.org"],...base({ratePerMinute:20}),
  parseInput:v=>{
   const ids=terms(v,"diseaseIds",4);
   if(ids.some(i=>!/^(EFO|MONDO|Orphanet|HP)_[0-9]+$/.test(i)))throw Error("Canonical disease identifier required");
   return {diseaseIds:ids,limit:limit(v,25)};
  },
  parseOutput:parseGovernedRecords({idPrefix:"opentargets:",kind:"target_disease",urlPrefixes:["https://platform.opentargets.org/disease/"],max:100,meta:m=>({diseaseId:str(m.diseaseId,40),diseaseName:str(m.diseaseName),targetSymbol:str(m.targetSymbol,40),associationScore:typeof m.associationScore==="number"&&Number.isFinite(m.associationScore)?m.associationScore:null,associationNotCausality:true})}),
  // Reuses the existing adapter; the guarded fetch limits it to this one host.
  execute:(input,ctx)=>openTargetsAdapter(ctx.fetch).search(input.diseaseIds,input.limit),
 };
}

/** Every governed provider. `literature.search` has three providers, so callers must name one. */
export function governedProviderCatalogue(cfg:ProviderConfig={}):ToolDefinition[]{
 return [europePmcLiteratureSearchTool(),openAlexLiteratureSearchTool(cfg),crossrefLiteratureSearchTool(cfg),clinicalTrialsSearchTool(),openTargetsEvidenceTool()] as unknown as ToolDefinition[];
}
