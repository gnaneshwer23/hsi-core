/** POST /api/research/methods-compare {query}. Stateless, public open-access text only (CC BY or CC0), no model, nothing stored. Returns parameters with quoted passages and where papers differ. */
import {compareMethods,extractParameters,type PaperParams} from "../methods/extract";
import {fetchMethods,searchOpenAccess} from "../methods/openAccess";
import type {FetchLike} from "../fetchLike";
type Env=Readonly<Record<string,string|undefined>>;
const hits=new Map<string,number[]>();
export const resetMethodsCompareLimiter=()=>hits.clear();
export const QUERY=/^[\p{L}\p{N} _.,+/\-']{3,120}$/u;
export const MAX_PAPERS=6,CANDIDATES=10,PER_PAPER_MS=11_000;
const json=(b:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(b),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});
export const CAVEAT="Values are read from the text by patterns, not by a model, and accuracy has not been measured. Each value shows the sentence it came from; read it before relying on it. A difference between papers is not a judgement that one is better.";
export async function handleMethodsCompare(request:Request,env:Env,deps:{fetcher?:FetchLike;now?:()=>Date}={}):Promise<Response>{
 if(request.method!=="POST")return json({code:"METHOD_NOT_ALLOWED",error:"Method not allowed"},405,{Allow:"POST"});
 const origin=request.headers.get("origin"),pub=env.HSI_PUBLIC_ORIGIN;
 if(pub&&origin&&origin!==pub)return json({code:"ORIGIN_NOT_ALLOWED",error:"Origin not allowed"},403);
 if(!/^application\/json/i.test(request.headers.get("content-type")??""))return json({code:"JSON_REQUIRED",error:"JSON body required"},415);
 const raw=await request.text();if(raw.length>600)return json({code:"PAYLOAD_TOO_LARGE",error:"Request too large"},413);
 let b:any;try{b=JSON.parse(raw)}catch{return json({code:"INVALID_JSON",error:"Invalid JSON"},400)}
 const query=typeof b?.query==="string"?b.query.trim().replace(/\s+/g," "):"";
 if(!QUERY.test(query))return json({code:"INVALID_QUERY",error:"Describe the technique in 3 to 120 characters using letters, numbers and simple punctuation."},400);
 const now=deps.now??(()=>new Date()),ip=(request.headers.get("x-forwarded-for")??"unknown").split(",")[0]!.trim().slice(0,64);
 const recent=(hits.get(ip)??[]).filter(t=>now().getTime()-t<600_000);
 if(recent.length>=6)return json({code:"RATE_LIMITED",error:"Rate limit reached. Try again later."},429,{"Retry-After":"600"});
 hits.set(ip,[...recent,now().getTime()]);if(hits.size>2000)hits.clear();
 const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),22_000);
 try{
  const found=await searchOpenAccess(query,CANDIDATES,deps.fetcher,ac.signal);
  const all:(PaperParams&{methodsFound:boolean;timedOut:boolean})[]=await Promise.all(found.map(async p=>{
   // Europe PMC full text is sometimes slow; each paper gets its own limit so one slow paper cannot sink the rest.
   const c=new AbortController(),t=setTimeout(()=>c.abort(),PER_PAPER_MS),onAbort=()=>c.abort();ac.signal.addEventListener("abort",onAbort,{once:true});
   try{const text=await fetchMethods(p.pmcid,deps.fetcher,c.signal);return {id:p.pmcid,title:p.title,url:p.url,licence:p.licence,params:text?extractParameters(text):[],methodsFound:!!text,timedOut:false}}
   catch{return {id:p.pmcid,title:p.title,url:p.url,licence:p.licence,params:[],methodsFound:false,timedOut:c.signal.aborted}}
   finally{clearTimeout(t);ac.signal.removeEventListener("abort",onAbort)}
  }));
  const readable=all.filter(p=>p.methodsFound).slice(0,MAX_PAPERS),papers=[...readable,...all.filter(p=>!p.methodsFound)].slice(0,MAX_PAPERS+4);
  const timedOut=all.filter(p=>p.timedOut).length,unread=all.filter(p=>!p.methodsFound).length;
  const rows=compareMethods(readable);
  return json({query,retrievedAt:now().toISOString(),source:"Europe PMC open-access full text (CC BY or CC0 only)",papers:papers.map(p=>({id:p.id,title:p.title,url:p.url,licence:p.licence,methodsFound:p.methodsFound,parameters:p.params.length})),rows,
   notes:[CAVEAT,...(found.length===0?["No open-access paper with a CC BY or CC0 licence matched. Nothing is shown."]:[]),...(unread>0?[`${unread} candidate paper(s) had no readable methods section${timedOut>0?` or were too slow to read (${timedOut})`:""} and were not compared.`]:[])]});
 }catch{return json({code:"RETRIEVAL_UNAVAILABLE",error:"Open-access text could not be read. Nothing was generated."},502)}
 finally{clearTimeout(timer)}
}
