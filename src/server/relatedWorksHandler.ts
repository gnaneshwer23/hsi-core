/**
 * POST /api/research/related-works { seed: "doi:…" | "pmid:…" | "openalex:W…" }
 * Server-only OpenAlex related_works expansion (ING-01). Metadata only — no abstracts.
 */
import type {FetchLike} from "../fetchLike";
import {fetchOpenAlexRelatedWorks,parseRelatedWorkSeed} from "../evidence/openAlexRelatedWorks";

type Env=Readonly<Record<string,string|undefined>>;
const hits=new Map<string,number[]>();
export const resetRelatedWorksLimiter=()=>hits.clear();
const json=(b:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(b),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});

function rememberHit(ip:string,at:number):void{
 hits.set(ip,[...(hits.get(ip)??[]).filter(t=>at-t<600_000),at]);
 if(hits.size<=2000)return;
 const oldest=hits.keys().next().value;
 if(oldest!==undefined)hits.delete(oldest);
}

export async function handleRelatedWorks(request:Request,env:Env,deps:{fetcher?:FetchLike;now?:()=>Date}={}):Promise<Response>{
 if(request.method!=="POST")return json({code:"METHOD_NOT_ALLOWED",error:"Method not allowed"},405,{Allow:"POST"});
 const origin=request.headers.get("origin"),pub=env.HSI_PUBLIC_ORIGIN;
 if(pub&&origin&&origin!==pub)return json({code:"ORIGIN_NOT_ALLOWED",error:"Origin not allowed"},403);
 if(!/^application\/json/i.test(request.headers.get("content-type")??""))return json({code:"JSON_REQUIRED",error:"JSON body required"},415);
 const raw=await request.text();
 if(raw.length>800)return json({code:"PAYLOAD_TOO_LARGE",error:"Request too large"},413);
 let body:unknown;
 try{body=JSON.parse(raw)}catch{return json({code:"INVALID_JSON",error:"Invalid JSON"},400)}
 const seedRaw=body&&typeof body==="object"&&"seed" in body?(body as{seed:unknown}).seed:undefined;
 const seed=parseRelatedWorkSeed(seedRaw);
 if(!seed)return json({code:"INVALID_SEED",error:"Provide seed as doi:, pmid:, or openalex:W…"},400);
 const limitRaw=body&&typeof body==="object"&&"limit" in body?(body as{limit:unknown}).limit:undefined;
 const limit=limitRaw===undefined?12:limitRaw;
 if(!Number.isInteger(limit)||(limit as number)<1||(limit as number)>25)return json({code:"INVALID_LIMIT",error:"limit must be an integer from 1 to 25"},400);
 const now=deps.now??(()=>new Date());
 const ip=(request.headers.get("x-forwarded-for")??"unknown").split(",")[0]!.trim().slice(0,64);
 const recent=(hits.get(ip)??[]).filter(t=>now().getTime()-t<600_000);
 if(recent.length>=20)return json({code:"RATE_LIMITED",error:"Rate limit reached. Try again later."},429,{"Retry-After":"600"});
 rememberHit(ip,now().getTime());
 const result=await fetchOpenAlexRelatedWorks(seed,deps.fetcher??fetch,{mailto:env.HSI_OPENALEX_CONTACT,limit:limit as number});
 if(result.status==="failed")return json({...result,code:"RETRIEVAL_UNAVAILABLE",error:result.error??"Related works lookup failed"},502);
 if(result.status==="seed_not_found")return json(result,404);
 return json(result);
}
