/**
 * Live public literature sources for P1: Europe PMC (core, with abstracts) and OpenAlex. Records keep provenance and
 * stay "metadata_retrieved_not_claim_verified". No full text is copied; abstracts are shown only as retrieved, with
 * a licence status of "not_assessed". A failed search throws so the caller can show it as failed, never as empty.
 */
import type {FetchLike} from "../fetchLike";
export type LiveEvidenceRecord={
 provider:"europe-pmc"|"openalex";sourceId:string;title:string;abstract:string|null;doi:string|null;pmid:string|null;
 publicationDate:string|null;sourceUrl:string;retrievedAt:string;licenceStatus:"not_assessed";
 retraction:"flagged"|"not_flagged_by_provider"|"unknown";studyTypes:string[];
 verificationState:"metadata_retrieved_not_claim_verified";reviewState:"unreviewed";
};
const clean=(s:unknown,max=4000):string|null=>typeof s==="string"&&s.trim()?s.replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim().slice(0,max):null;
const tidyDoi=(d:unknown)=>typeof d==="string"?d.replace(/^https?:\/\/doi\.org\//i,""):null;
function guard(terms:string[],limit:number){if(!terms.length||terms.length>8||terms.some(t=>!t.trim()||t.length>160)||!Number.isInteger(limit)||limit<1||limit>25)throw Error("Invalid literature search")}
async function getJson(url:string,f:FetchLike,timeoutMs:number){
 const r=await f(url,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(timeoutMs)});
 if(!r.ok)throw Error("HTTP "+r.status);return r.json() as Promise<any>;
}
export async function searchEuropePmc(query:string,limit:number,f:FetchLike=fetch,now=()=>new Date().toISOString(),timeoutMs=15000):Promise<LiveEvidenceRecord[]>{
 guard([query],limit);
 const u=new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
 u.searchParams.set("query",query);u.searchParams.set("format","json");u.searchParams.set("resultType","core");u.searchParams.set("pageSize",String(limit));
 const b=await getJson(u.toString(),f,timeoutMs);
 if(!Array.isArray(b?.resultList?.result))throw Error("Unexpected Europe PMC response");
 const at=now();
 return b.resultList.result.filter((r:any)=>typeof r?.id==="string"&&typeof r?.source==="string"&&clean(r.title)).map((r:any):LiveEvidenceRecord=>{
  const types:string[]=Array.isArray(r.pubTypeList?.pubType)?r.pubTypeList.pubType.filter((x:unknown)=>typeof x==="string"):[];
  return {provider:"europe-pmc",sourceId:"europepmc:"+r.source+":"+r.id,title:clean(r.title,500)!,abstract:clean(r.abstractText),doi:tidyDoi(r.doi),pmid:typeof r.pmid==="string"?r.pmid:null,
   publicationDate:typeof r.firstPublicationDate==="string"?r.firstPublicationDate:null,sourceUrl:"https://europepmc.org/article/"+encodeURIComponent(r.source)+"/"+encodeURIComponent(r.id),
   retrievedAt:at,licenceStatus:"not_assessed",retraction:types.some(t=>/retract/i.test(t))?"flagged":"not_flagged_by_provider",studyTypes:types.slice(0,6),
   verificationState:"metadata_retrieved_not_claim_verified",reviewState:"unreviewed"};
 });
}
function abstractFromIndex(ix:unknown):string|null{
 if(!ix||typeof ix!=="object")return null;
 const slots:string[]=[];
 for(const [w,pos] of Object.entries(ix as Record<string,unknown>))if(Array.isArray(pos))for(const p of pos)if(Number.isInteger(p)&&p>=0&&p<5000)slots[p as number]=w;
 return clean(slots.filter(Boolean).join(" "));
}
export async function searchOpenAlex(query:string,limit:number,f:FetchLike=fetch,now=()=>new Date().toISOString(),opts:{mailto?:string;timeoutMs?:number}={}):Promise<LiveEvidenceRecord[]>{
 guard([query],limit);
 const u=new URL("https://api.openalex.org/works");
 u.searchParams.set("search",query);u.searchParams.set("per-page",String(limit));
 u.searchParams.set("select","id,doi,title,publication_date,ids,is_retracted,abstract_inverted_index,type");
 if(opts.mailto&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.mailto))u.searchParams.set("mailto",opts.mailto);
 const b=await getJson(u.toString(),f,opts.timeoutMs??15000);
 if(!Array.isArray(b?.results))throw Error("Unexpected OpenAlex response");
 const at=now();
 return b.results.filter((r:any)=>typeof r?.id==="string"&&clean(r.title)).map((r:any):LiveEvidenceRecord=>{
  const pm=typeof r.ids?.pmid==="string"?r.ids.pmid.replace(/^.*\//,""):null;
  return {provider:"openalex",sourceId:"openalex:"+r.id.replace(/^.*\//,""),title:clean(r.title,500)!,abstract:abstractFromIndex(r.abstract_inverted_index),doi:tidyDoi(r.doi),pmid:pm&&/^[0-9]+$/.test(pm)?pm:null,
   publicationDate:typeof r.publication_date==="string"?r.publication_date:null,sourceUrl:r.id,retrievedAt:at,licenceStatus:"not_assessed",
   retraction:r.is_retracted===true?"flagged":r.is_retracted===false?"not_flagged_by_provider":"unknown",studyTypes:typeof r.type==="string"?[r.type]:[],
   verificationState:"metadata_retrieved_not_claim_verified",reviewState:"unreviewed"};
 });
}
