/** POST /api/research/cooccurrence {terms, pairs}. Stateless, public source only, nothing stored or logged. */
import {cooccurrence,validTerm} from "../investigation/cooccurrence";
import type {FetchLike} from "../fetchLike";
type Env=Readonly<Record<string,string|undefined>>;
const hits=new Map<string,number[]>();
export const resetCooccurrenceLimiter=()=>hits.clear();
const json=(b:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(b),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});
export async function handleCooccurrence(request:Request,env:Env,deps:{fetcher?:FetchLike;now?:()=>Date}={}):Promise<Response>{
 if(request.method!=="POST")return json({code:"METHOD_NOT_ALLOWED",error:"Method not allowed"},405,{Allow:"POST"});
 const origin=request.headers.get("origin"),pub=env.HSI_PUBLIC_ORIGIN;
 if(pub&&origin&&origin!==pub)return json({code:"ORIGIN_NOT_ALLOWED",error:"Origin not allowed"},403);
 if(!/^application\/json/i.test(request.headers.get("content-type")??""))return json({code:"JSON_REQUIRED",error:"JSON body required"},415);
 const raw=await request.text();if(raw.length>4000)return json({code:"PAYLOAD_TOO_LARGE",error:"Request too large"},413);
 let b:any;try{b=JSON.parse(raw)}catch{return json({code:"INVALID_JSON",error:"Invalid JSON"},400)}
 const terms=b?.terms,pairs=b?.pairs;
 if(!Array.isArray(terms)||terms.length<2||terms.length>8||!terms.every(validTerm)||new Set(terms.map((t:string)=>t.trim().toLowerCase())).size!==terms.length)return json({code:"INVALID_TERMS",error:"Provide 2 to 8 distinct terms of 2 to 60 characters."},400);
 if(!Array.isArray(pairs)||pairs.length<1||pairs.length>12||!pairs.every((p:unknown)=>Array.isArray(p)&&p.length===2&&p.every(i=>Number.isInteger(i)&&i>=0&&i<terms.length)&&p[0]!==p[1]))return json({code:"INVALID_PAIRS",error:"Provide 1 to 12 pairs of term positions."},400);
 const now=deps.now??(()=>new Date()),ip=(request.headers.get("x-forwarded-for")??"unknown").split(",")[0]!.trim().slice(0,64);
 const recent=(hits.get(ip)??[]).filter(t=>now().getTime()-t<600_000);
 if(recent.length>=10)return json({code:"RATE_LIMITED",error:"Rate limit reached. Try again later."},429,{"Retry-After":"600"});
 hits.set(ip,[...recent,now().getTime()]);if(hits.size>2000)hits.clear();
 try{return json(await cooccurrence(terms.map((t:string)=>t.trim()),pairs as [number,number][],deps.fetcher,now))}
 catch{return json({code:"RUN_FAILED",error:"The counts could not be built. Nothing was generated."},502)}
}
