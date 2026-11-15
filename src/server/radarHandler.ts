/** POST /api/research/radar {topics, days?, orcid?, papers?}. Stateless: nothing is stored or logged. Public sources only. Rate limited per instance (best effort). */
import {buildRadar,validTopic} from "../investigation/radar";
import type {FetchLike} from "../fetchLike";
type Env=Readonly<Record<string,string|undefined>>;
const hits=new Map<string,number[]>();
export const resetRadarLimiter=()=>hits.clear();
const json=(b:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(b),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});
const ORCID=/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
export async function handleRadar(request:Request,env:Env,deps:{fetcher?:FetchLike;now?:()=>Date}={}):Promise<Response>{
 if(request.method!=="POST")return json({error:"Method not allowed"},405,{Allow:"POST"});
 const origin=request.headers.get("origin"),pub=env.HSI_PUBLIC_ORIGIN;
 if(pub&&origin&&origin!==pub)return json({error:"Origin not allowed"},403);
 if(!/^application\/json/i.test(request.headers.get("content-type")??""))return json({error:"JSON body required"},415);
 const raw=await request.text();if(raw.length>6000)return json({error:"Request too large"},413);
 let b:any;try{b=JSON.parse(raw)}catch{return json({error:"Invalid JSON"},400)}
 const topics:unknown=b?.topics,days=b?.days;
 if(!Array.isArray(topics)||topics.length>5||!topics.every(validTopic)||new Set(topics.map((t:string)=>t.trim().toLowerCase())).size!==topics.length)return json({error:"Provide 0 to 5 distinct topics of 2 to 80 characters."},400);
 if(![1,2,7,30].includes(days))return json({error:"days must be 1, 2, 7 or 30"},400);
 const orcid=b?.orcid===undefined||b?.orcid===null?null:b.orcid;
 if(orcid!==null&&(typeof orcid!=="string"||!ORCID.test(orcid)))return json({error:"Invalid ORCID iD"},400);
 const papers=b?.papers===undefined?[]:b.papers;
 if(!Array.isArray(papers)||papers.length>20||papers.some((p:unknown)=>typeof p!=="string"||p.length>200))return json({error:"papers must be a list of up to 20 DOI or PMID ids"},400);
 if(!topics.length&&!orcid&&!papers.length)return json({error:"Provide topics, an ORCID iD or papers."},400);
 const now=deps.now??(()=>new Date()),ip=(request.headers.get("x-forwarded-for")??"unknown").split(",")[0]!.trim().slice(0,64);
 const recent=(hits.get(ip)??[]).filter(t=>now().getTime()-t<600_000);
 if(recent.length>=20)return json({error:"Rate limit reached. Try again later."},429,{"Retry-After":"600"});
 hits.set(ip,[...recent,now().getTime()]);if(hits.size>2000)hits.clear();
 try{return json(await buildRadar({topics:topics.map((t:string)=>t.trim()),days,orcid,paperIds:papers},deps.fetcher,now))}
 catch{return json({error:"The radar could not be built. Nothing was generated."},502)}
}
