/**
 * GET /api/research/literature-search?term=&cursor=
 * Server-side Europe PMC bibliographic search for the public SSc literature page.
 * Browser must not call Europe PMC directly (ING-01). Metadata only — not claim support.
 */
import type {FetchLike} from "../fetchLike";
import {
  EUROPE_PMC_CURSOR_MARK_START,
  searchEuropePmcByQuery,
  assertValidEuropePmcCursorMark,
} from "../evidence/europePmcBibliographicLookup";

type Env=Readonly<Record<string,string|undefined>>;
const hits=new Map<string,number[]>();
export const resetLiteratureSearchLimiter=()=>hits.clear();
export const SSC_LITERATURE_SCOPE='("systemic sclerosis" OR scleroderma) AND ("T follicular helper" OR Tfh OR "IL-21" OR "B cell" OR fibrosis)';
const json=(b:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(b),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});

function refineTerm(raw:string|null):{ok:true;term:string}|{ok:false}{
 const term=(raw??"").trim().slice(0,120).replace(/[()]/g," ");
 if(/[\x00-\x1f]/.test(term))return{ok:false};
 return{ok:true,term};
}

function rememberHit(ip:string,at:number):void{
 hits.set(ip,[...(hits.get(ip)??[]).filter(t=>at-t<600_000),at]);
 if(hits.size<=2000)return;
 const oldest=hits.keys().next().value;
 if(oldest!==undefined)hits.delete(oldest);
}

export function buildSscLiteratureQuery(term:string):string{
 const refined=refineTerm(term);
 if(!refined.ok||!refined.term)return SSC_LITERATURE_SCOPE;
 return`(${SSC_LITERATURE_SCOPE}) AND (${refined.term})`;
}

export async function handleLiteratureSearch(request:Request,env:Env,deps:{fetcher?:FetchLike;now?:()=>Date}={}):Promise<Response>{
 if(request.method!=="GET")return json({error:"Method not allowed"},405,{Allow:"GET"});
 const origin=request.headers.get("origin"),pub=env.HSI_PUBLIC_ORIGIN;
 if(pub&&origin&&origin!==pub)return json({error:"Origin not allowed"},403);
 const url=new URL(request.url);
 const refined=refineTerm(url.searchParams.get("term"));
 if(!refined.ok)return json({error:"Invalid search term"},400);
 const term=refined.term;
 let cursorMark:string;
 try{cursorMark=assertValidEuropePmcCursorMark(url.searchParams.get("cursor")??EUROPE_PMC_CURSOR_MARK_START)}
 catch{return json({error:"Invalid cursor"},400)}
 const now=deps.now??(()=>new Date()),ip=(request.headers.get("x-forwarded-for")??"unknown").split(",")[0]!.trim().slice(0,64);
 const recent=(hits.get(ip)??[]).filter(t=>now().getTime()-t<600_000);
 if(recent.length>=20)return json({error:"Rate limit reached. Try again later."},429,{"Retry-After":"600"});
 rememberHit(ip,now().getTime());
 const query=buildSscLiteratureQuery(term);
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10_000);
 try{
  const result=await searchEuropePmcByQuery({query,pageSize:20,cursorMark,fetcher:deps.fetcher,now,signal:controller.signal});
  if(!result.ok)return json({error:"Literature retrieval unavailable. No claims can be verified while retrieval is unavailable."},502);
  return json({
   schemaVersion:"hsi-literature-search-1",
   hitCount:result.hitCount,
   nextCursorMark:result.nextCursorMark,
   cursorMark:result.cursorMark,
   note:"Bibliographic metadata only. Not claim support, rights clearance, or scientific approval. Abstracts are not proxied; open the publication record for full text.",
   records:result.records.map(r=>({
    id:r.sourceId,
    source:r.sourceType,
    pmid:r.pmid,
    doi:r.doi,
    title:r.title,
    authorString:r.authors,
    journalTitle:r.journal,
    pubYear:r.publicationYear===null?null:String(r.publicationYear),
    url:r.url,
    isRetracted:r.isRetracted,
   })),
  });
 }finally{clearTimeout(timer)}
}
