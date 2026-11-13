/**
 * Source evidence for integrity decisions: resolves identity (DOI, PMID, PMCID) and gathers licence, retraction, correction and
 * expression-of-concern evidence from authoritative metadata providers, reusing the existing Europe PMC lookups and the Crossref
 * licence parser. Evidence is OBSERVATION, never clearance: a provider outage stays a typed "unavailable", an absent licence stays
 * "missing", and nothing is inferred (an unversioned Europe PMC label is never promoted to a versioned licence).
 */
import {createHash} from "node:crypto";
import type {FetchLike} from "../fetchLike";
import {lookupEuropePmcByDoi,lookupEuropePmcByPmid,searchEuropePmcByQuery,type BibliographicRecord} from "../evidence/europePmcBibliographicLookup";
import {CROSSREF_WORKS_ENDPOINT,parseCrossrefWorksLicencePayload} from "../evidence/crossrefWorksLicenceLookup";
import type {LicenceFamily,ProviderName} from "./clearancePolicy";

/** Hosts the integrity service may contact. Separate from the retrieval list so widening one never widens the other. */
export const INTEGRITY_ALLOWED_HOSTS:readonly string[]=Object.freeze(["www.ebi.ac.uk","api.crossref.org"]);
export type SourceRef={doi?:string|null;pmid?:string|null;pmcid?:string|null};
export type ProviderStatus="ok"|"unavailable"|"not_found"|"not_applicable";
export type NoticeType="retraction"|"correction"|"expression_of_concern";
export type LicenceEvidence={status:"ok"|"missing"|"conflict"|"label_only"|"tdm_only";family:LicenceFamily;version:string|null;urls:string[];label:string|null;providers:ProviderName[]};
export type SourceEvidence={
 schemaVersion:"hsi-source-evidence-1";requested:{doi:string|null;pmid:string|null;pmcid:string|null};
 identity:{status:"matched"|"unresolved"|"conflict";doi:string|null;pmid:string|null;pmcid:string|null;title:string|null;detail:string};
 licence:LicenceEvidence;
 integrity:{retraction:"clear"|"retracted"|"unknown";correction:"none"|"corrected"|"unknown";expressionOfConcern:"none"|"flagged"|"unknown";notices:{type:NoticeType;provider:ProviderName}[]};
 providers:{europe_pmc:ProviderStatus;crossref:ProviderStatus};
 retrievedAt:string;evidenceHash:string;
};

const CC_FAMILY:Record<string,LicenceFamily>={"licenses/by":"cc-by","licenses/by-sa":"cc-by-sa","licenses/by-nc":"cc-by-nc","licenses/by-nd":"cc-by-nd","licenses/by-nc-sa":"cc-by-nc-sa","licenses/by-nc-nd":"cc-by-nc-nd","publicdomain/zero":"cc0","publicdomain/mark":"public-domain"};
export function parseLicenceUrl(url:string):{family:LicenceFamily;version:string|null}{
 const m=/^https:\/\/creativecommons\.org\/(licenses|publicdomain)\/([a-z-]+)\/(\d\.\d)\/?/i.exec(url.trim().replace(/^http:\/\//i,"https://"));
 if(!m)return {family:"publisher-specific",version:null};
 return {family:CC_FAMILY[(`${m[1]}/${m[2]}`).toLowerCase()]??"unknown",version:m[3]!};
}
export function parseLicenceLabel(label:string|null):LicenceFamily|null{
 if(!label)return null;
 const l=label.trim().toLowerCase().replace(/[\s_]+/g," ");
 const m=/^cc(?: |-)?(by(?:(?: |-)?(?:nc|sa|nd))*|0)$/.exec(l);
 if(!m)return null;
 if(m[1]==="0")return "cc0";
 const parts=m[1]!.replace(/[ ]/g,"-").replace(/-+/g,"-"),key=`cc-${parts}`;
 return (Object.values(CC_FAMILY) as string[]).includes(key)?key as LicenceFamily:null;
}

export function parseCrossrefNotices(bodyText:string):{type:NoticeType}[]|null{
 let root:unknown;try{root=JSON.parse(bodyText)}catch{return null}
 const message=(root as {message?:Record<string,unknown>})?.message;
 if(!message||typeof message!=="object")return null;
 const list=message["updated-by"];
 if(list===undefined)return [];
 if(!Array.isArray(list))return null;
 const out:{type:NoticeType}[]=[];
 for(const item of list){
  const t=typeof (item as {type?:unknown})?.type==="string"?((item as {type:string}).type).toLowerCase():"";
  if(["retraction","withdrawal","removal"].includes(t))out.push({type:"retraction"});
  else if(["correction","erratum","corrigendum"].includes(t))out.push({type:"correction"});
  else if(["expression_of_concern","expression-of-concern"].includes(t))out.push({type:"expression_of_concern"});
 }
 return out;
}

async function crossrefBody(doi:string,fetcher:FetchLike,signal?:AbortSignal):Promise<{status:"ok";body:string}|{status:"not_found"|"unavailable"}>{
 try{
  const r=await fetcher(`${CROSSREF_WORKS_ENDPOINT}/${encodeURIComponent(doi)}`,{headers:{Accept:"application/json"},signal});
  if(r.status===404)return {status:"not_found"};
  if(!r.ok)return {status:"unavailable"};
  const body=await r.text();return body.length>2_000_000?{status:"unavailable"}:{status:"ok",body};
 }catch{return {status:"unavailable"}}
}
const normDoi=(d:string|null|undefined)=>d?d.trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//,""):null;

export async function resolveSourceEvidence(ref:SourceRef,deps:{fetcher:FetchLike;now?:()=>Date;signal?:AbortSignal}):Promise<SourceEvidence>{
 const now=deps.now??(()=>new Date()),retrievedAt=now().toISOString();
 const requested={doi:normDoi(ref.doi),pmid:ref.pmid??null,pmcid:ref.pmcid??null};
 const io={fetcher:deps.fetcher,now,signal:deps.signal};
 let epmc:ProviderStatus="not_applicable",records:BibliographicRecord[]=[];
 try{
  const look=requested.pmid?await lookupEuropePmcByPmid({pmid:requested.pmid,...io}):requested.doi?await lookupEuropePmcByDoi({doi:requested.doi,...io}):requested.pmcid?await searchEuropePmcByQuery({query:`PMCID:${requested.pmcid}`,pageSize:2,...io}):null;
  if(look===null)epmc="not_applicable";else if(!look.ok)epmc="unavailable";else{records=look.records;epmc=records.length?"ok":"not_found"}
 }catch{epmc="unavailable"}
 // Identity: every identifier the caller supplied must agree with the single provider record.
 let identity:SourceEvidence["identity"];
 const distinct=new Set(records.map(r=>`${r.sourceType}:${r.sourceId}`));
 if(epmc==="ok"&&distinct.size===1){
  const r=records[0]!;
  const disagrees=(requested.pmid&&r.pmid&&requested.pmid!==r.pmid)||(requested.doi&&r.doi&&requested.doi!==normDoi(r.doi))||(requested.pmcid&&r.pmcid&&requested.pmcid.toLowerCase()!==r.pmcid.toLowerCase());
  identity=disagrees?{status:"conflict",doi:null,pmid:null,pmcid:null,title:null,detail:"Supplied identifiers disagree with the provider record"}:{status:"matched",doi:normDoi(r.doi),pmid:r.pmid,pmcid:r.pmcid,title:r.title,detail:"Matched one provider record"};
 }else if(epmc==="ok")identity={status:"conflict",doi:null,pmid:null,pmcid:null,title:null,detail:"More than one provider record matched"};
 else identity={status:"unresolved",doi:null,pmid:null,pmcid:null,title:null,detail:epmc==="unavailable"?"Provider unavailable":"No provider record found"};
 const doi=identity.doi??(identity.status==="unresolved"?requested.doi:null);
 let crossref:ProviderStatus=doi?"unavailable":"not_applicable";
 let crossrefUrls:{url:string;contentVersion:string}[]=[],notices:{type:NoticeType}[]|null=null,crossrefConflict=false;
 if(doi){
  const got=await crossrefBody(doi,deps.fetcher,deps.signal);
  if(got.status!=="ok")crossref=got.status;
  else{
   const parsed=parseCrossrefWorksLicencePayload({requestedDoi:doi,bodyText:got.body,retrievedAt});
   if(!parsed.ok){crossref=parsed.outcome==="doi_mismatch"?"ok":"unavailable";crossrefConflict=parsed.outcome==="doi_mismatch"}
   else{crossref="ok";crossrefUrls=parsed.licenses.map(l=>({url:l.url,contentVersion:l.contentVersion}));notices=parseCrossrefNotices(got.body)}
  }
 }
 if(crossrefConflict)identity={status:"conflict",doi:null,pmid:null,pmcid:null,title:null,detail:"Crossref resolved a different DOI"};
 // Licence: versioned URLs outrank a label; a label alone is never promoted; disagreement between providers is a conflict.
 const label=records[0]?.rightsSignals.providerLicenseLabel??null,labelFamily=parseLicenceLabel(label);
 const text=crossrefUrls.filter(u=>u.contentVersion!=="tdm"),tdm=crossrefUrls.filter(u=>u.contentVersion==="tdm");
 const parsed=text.map(u=>({...parseLicenceUrl(u.url),url:u.url}));
 const families=new Set(parsed.map(p=>p.family));
 const providers:ProviderName[]=[...(crossref==="ok"&&crossrefUrls.length?["crossref" as const]:[]),...(label?["europe_pmc" as const]:[])];
 let licence:LicenceEvidence;
 if(families.size>1||(families.size===1&&labelFamily&&!families.has(labelFamily)))licence={status:"conflict",family:"unknown",version:null,urls:parsed.map(p=>p.url),label,providers};
 else if(families.size===1)licence={status:"ok",family:[...families][0]!,version:parsed[0]!.version,urls:parsed.map(p=>p.url),label,providers};
 else if(tdm.length&&!labelFamily)licence={status:"tdm_only",family:"unknown",version:null,urls:tdm.map(u=>u.url),label,providers};
 else if(labelFamily)licence={status:"label_only",family:labelFamily,version:null,urls:[],label,providers};
 else licence={status:"missing",family:"unknown",version:null,urls:[],label,providers};
 // Integrity: a status is "clear" only when both providers answered affirmatively; silence or an outage is "unknown".
 const epmcRec=records[0],found:{type:NoticeType;provider:ProviderName}[]=(notices??[]).map(n=>({type:n.type,provider:"crossref" as const}));
 if(epmc==="ok"&&epmcRec){
  if(epmcRec.isRetracted===true||epmcRec.publicationTypes.some(t=>/^retracted publication$/i.test(t)))found.push({type:"retraction",provider:"europe_pmc"});
  if(epmcRec.publicationTypes.some(t=>/erratum|correction/i.test(t)&&!/^retraction/i.test(t)))found.push({type:"correction",provider:"europe_pmc"});
  if(epmcRec.publicationTypes.some(t=>/expression of concern/i.test(t)))found.push({type:"expression_of_concern",provider:"europe_pmc"});
 }
 const answered=epmc==="ok"&&crossref==="ok"&&notices!==null&&epmcRec?.isRetracted!==null&&epmcRec?.isRetracted!==undefined;
 const has=(t:NoticeType)=>found.some(n=>n.type===t);
 const integrity={retraction:has("retraction")?"retracted" as const:answered?"clear" as const:"unknown" as const,correction:has("correction")?"corrected" as const:answered?"none" as const:"unknown" as const,expressionOfConcern:has("expression_of_concern")?"flagged" as const:answered?"none" as const:"unknown" as const,notices:found};
 const body={schemaVersion:"hsi-source-evidence-1" as const,requested,identity,licence,integrity,providers:{europe_pmc:epmc,crossref}};
 return {...body,retrievedAt,evidenceHash:createHash("sha256").update(JSON.stringify(body)).digest("hex")};
}
