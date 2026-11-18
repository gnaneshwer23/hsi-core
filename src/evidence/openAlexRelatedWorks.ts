/**
 * Seed-paper → related works via OpenAlex `related_works` (bibliographic relatives).
 * Metadata only — no abstracts, no invented text, not claim support or graph promotion.
 * Connected Papers–style neighbour list; algorithm is OpenAlex’s, not an HSI co-citation graph.
 */
import type {FetchLike} from "../fetchLike";

export type RelatedWorkSeedKind="doi"|"pmid"|"openalex";
export type RelatedWorkSeed={kind:RelatedWorkSeedKind;value:string};
export type RelatedWorkRetraction="flagged"|"not_flagged_by_provider"|"unknown";
export type RelatedWorkRecord={
 title:string;
 sourceId:string;
 url:string;
 doi:string|null;
 pmid:string|null;
 date:string|null;
 journal:string|null;
 citedBy:number|null;
 retraction:RelatedWorkRetraction;
 preprint:boolean;
 relation:"openalex_related_works";
};
export type RelatedWorksSeedMeta={
 sourceId:string;
 title:string;
 url:string;
 doi:string|null;
 pmid:string|null;
 date:string|null;
 journal:string|null;
 citedBy:number|null;
 retraction:RelatedWorkRetraction;
 preprint:boolean;
 relatedWorkIds:readonly string[];
};
export type RelatedWorksResult={
 schemaVersion:"hsi-related-works-1";
 status:"ok"|"seed_not_found"|"failed";
 error:string|null;
 seed:RelatedWorksSeedMeta|null;
 related:RelatedWorkRecord[];
 unresolvedRelatedIds:string[];
 note:string;
};

const OPENALEX_WORK=/^https:\/\/openalex\.org\/W\d{1,15}$/;
const OPENALEX_ID=/^W\d{1,15}$/;
const DOI=/^10\.\d{4,9}\/\S{1,180}$/;
const PMID=/^\d{1,9}$/;
const SELECT_SEED="id,doi,title,publication_date,ids,primary_location,cited_by_count,is_retracted,type,related_works";
const SELECT_RELATED="id,doi,title,publication_date,ids,primary_location,cited_by_count,is_retracted,type";
const NOTE="OpenAlex related_works metadata only. Neighbours are bibliographic relatives as defined by OpenAlex, not an HSI co-citation graph, claim support, rights clearance, or scientific approval. Bibliographic fields only — full text is not proxied.";

const clean=(s:unknown,n=400):string=>typeof s==="string"?s.replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim().slice(0,n):"";
const tidyDoi=(d:unknown)=>typeof d==="string"?d.replace(/^https?:\/\/doi\.org\//i,""):null;
const safeErr=(e:unknown)=>(e instanceof Error?e.message:"failed").replace(/https?:\/\/\S+/g,"[url]").slice(0,100);

async function getJson(url:string,f:FetchLike,timeoutMs:number):Promise<any>{
 const r=await f(url,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(timeoutMs)});
 if(!r.ok)throw Error("HTTP "+r.status);
 return r.json();
}

function withMailto(u:URL,mailto?:string):void{
 if(mailto&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailto))u.searchParams.set("mailto",mailto);
}

function retractionOf(v:unknown):RelatedWorkRetraction{
 if(v===true)return"flagged";
 if(v===false)return"not_flagged_by_provider";
 return"unknown";
}

type MappedSeed=Omit<RelatedWorkRecord,"relation">&{relatedWorkIds:string[]};
function mapSeedWork(r:any):MappedSeed|null{
 if(typeof r?.id!=="string"||!OPENALEX_WORK.test(r.id)||!clean(r.title))return null;
 const pm=typeof r.ids?.pmid==="string"?r.ids.pmid.replace(/^.*\//,""):null;
 const relatedWorkIds=Array.isArray(r.related_works)
  ?r.related_works.filter((x:unknown):x is string=>typeof x==="string"&&OPENALEX_WORK.test(x)).slice(0,25)
  :[];
 return{
  title:clean(r.title,300),
  sourceId:"openalex:"+r.id.replace(/^.*\//,""),
  url:r.id as string,
  doi:tidyDoi(r.doi),
  pmid:pm&&PMID.test(pm)?pm:null,
  date:typeof r.publication_date==="string"?r.publication_date:null,
  journal:clean(r.primary_location?.source?.display_name,120)||null,
  citedBy:Number.isFinite(r.cited_by_count)?Number(r.cited_by_count):null,
  retraction:retractionOf(r.is_retracted),
  preprint:r.type==="preprint",
  relatedWorkIds,
 };
}
function mapRelatedWork(r:any):RelatedWorkRecord|null{
 const seed=mapSeedWork(r);
 if(!seed)return null;
 const{relatedWorkIds:_ids,...meta}=seed;
 return{...meta,relation:"openalex_related_works"};
}

/** Parse `doi:…`, `pmid:…`, `openalex:W…`, bare DOI, bare PMID, or OpenAlex URL/id. */
export function parseRelatedWorkSeed(raw:unknown):RelatedWorkSeed|null{
 if(typeof raw!=="string")return null;
 const s=raw.trim();
 if(!s||s.length>220)return null;
 const prefixed=s.match(/^(doi|pmid|openalex)\s*:\s*(.+)$/i);
 if(prefixed){
  const kind=prefixed[1]!.toLowerCase() as RelatedWorkSeedKind;
  const value=prefixed[2]!.trim();
  if(kind==="doi"&&DOI.test(value))return{kind,value};
  if(kind==="pmid"&&PMID.test(value))return{kind,value};
  if(kind==="openalex"){
   const id=value.replace(/^https:\/\/openalex\.org\//i,"");
   if(OPENALEX_ID.test(id))return{kind,value:id};
  }
  return null;
 }
 if(DOI.test(s))return{kind:"doi",value:s};
 if(PMID.test(s))return{kind:"pmid",value:s};
 const oa=s.replace(/^https:\/\/openalex\.org\//i,"");
 if(OPENALEX_ID.test(oa))return{kind:"openalex",value:oa};
 return null;
}

function seedFilter(seed:RelatedWorkSeed):string{
 switch(seed.kind){
  case"doi":return`doi:https://doi.org/${seed.value}`;
  case"pmid":return`pmid:${seed.value}`;
  case"openalex":return`openalex_id:${seed.value}`;
  default:{const _x:never=seed.kind;throw Error(String(_x))}
 }
}

async function fetchSeedWork(seed:RelatedWorkSeed,f:FetchLike,opts:{mailto?:string;timeoutMs?:number}):Promise<RelatedWorksSeedMeta|null>{
 const u=new URL("https://api.openalex.org/works");
 u.searchParams.set("filter",seedFilter(seed));
 u.searchParams.set("per-page","1");
 u.searchParams.set("select",SELECT_SEED);
 withMailto(u,opts.mailto);
 const b=await getJson(u.toString(),f,opts.timeoutMs??12_000);
 const row=Array.isArray(b?.results)?b.results[0]:null;
 const mapped=mapSeedWork(row);
 if(!mapped)return null;
 const{relatedWorkIds,...meta}=mapped;
 return{...meta,relatedWorkIds};
}

async function fetchRelatedBatch(ids:readonly string[],f:FetchLike,opts:{mailto?:string;timeoutMs?:number}):Promise<{works:RelatedWorkRecord[];unresolved:string[]}>{
 if(!ids.length)return{works:[],unresolved:[]};
 const u=new URL("https://api.openalex.org/works");
 // OpenAlex accepts pipe-separated openalex_id filters for a small batch.
 u.searchParams.set("filter",`openalex_id:${ids.map(id=>id.replace(/^https:\/\/openalex\.org\//,"")).join("|")}`);
 u.searchParams.set("per-page",String(Math.min(ids.length,25)));
 u.searchParams.set("select",SELECT_RELATED);
 withMailto(u,opts.mailto);
 const b=await getJson(u.toString(),f,opts.timeoutMs??12_000);
 if(!Array.isArray(b?.results))throw Error("Unexpected OpenAlex response");
 const works:RelatedWorkRecord[]=[];
 const seen=new Set<string>();
 for(const r of b.results){
  const m=mapRelatedWork(r);
  if(!m||seen.has(m.sourceId))continue;
  seen.add(m.sourceId);
  works.push(m);
 }
 const unresolved=ids
  .map(id=>"openalex:"+id.replace(/^https:\/\/openalex\.org\//,""))
  .filter(sid=>!seen.has(sid));
 return{works,unresolved};
}

export async function fetchOpenAlexRelatedWorks(
 seedInput:RelatedWorkSeed|string,
 f:FetchLike=fetch,
 opts:{mailto?:string;timeoutMs?:number;limit?:number}={},
):Promise<RelatedWorksResult>{
 const seed=typeof seedInput==="string"?parseRelatedWorkSeed(seedInput):seedInput;
 if(!seed)return{schemaVersion:"hsi-related-works-1",status:"failed",error:"Invalid seed (use doi:, pmid:, or openalex:W…)",seed:null,related:[],unresolvedRelatedIds:[],note:NOTE};
 const limit=Math.max(1,Math.min(opts.limit??12,25));
 try{
  const seedMeta=await fetchSeedWork(seed,f,opts);
  if(!seedMeta)return{schemaVersion:"hsi-related-works-1",status:"seed_not_found",error:"Seed work not found in OpenAlex",seed:null,related:[],unresolvedRelatedIds:[],note:NOTE};
  const ids=seedMeta.relatedWorkIds.slice(0,limit);
  if(!ids.length)return{schemaVersion:"hsi-related-works-1",status:"ok",error:null,seed:seedMeta,related:[],unresolvedRelatedIds:[],note:NOTE};
  try{
   const{works,unresolved}=await fetchRelatedBatch(ids,f,opts);
   return{schemaVersion:"hsi-related-works-1",status:"ok",error:null,seed:seedMeta,related:works,unresolvedRelatedIds:unresolved,note:NOTE};
  }catch(e){
   return{schemaVersion:"hsi-related-works-1",status:"ok",error:"Related works lookup failed: "+safeErr(e),seed:seedMeta,related:[],unresolvedRelatedIds:ids.map(id=>"openalex:"+id.replace(/^https:\/\/openalex\.org\//,"")),note:NOTE};
  }
 }catch(e){
  return{schemaVersion:"hsi-related-works-1",status:"failed",error:safeErr(e),seed:null,related:[],unresolvedRelatedIds:[],note:NOTE};
 }
}
