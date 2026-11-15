/** POST /api/research/target-evidence {diseaseId}. Stateless, public Open Targets metadata only, nothing stored. Returns a candidate target profile with its caveats. */
import {assertValidOpenTargetsDiseaseId,lookupOpenTargetsDiseaseAssociations} from "../evidence/openTargetsLookup";
import {profileTargets,TARGET_CAVEAT} from "../investigation/targetProfile";
import type {FetchLike} from "../fetchLike";
type Env=Readonly<Record<string,string|undefined>>;
const hits=new Map<string,number[]>();
export const resetTargetEvidenceLimiter=()=>hits.clear();
const json=(b:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(b),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});
export async function handleTargetEvidence(request:Request,env:Env,deps:{fetcher?:FetchLike;now?:()=>Date}={}):Promise<Response>{
 if(request.method!=="POST")return json({error:"Method not allowed"},405,{Allow:"POST"});
 const origin=request.headers.get("origin"),pub=env.HSI_PUBLIC_ORIGIN;
 if(pub&&origin&&origin!==pub)return json({error:"Origin not allowed"},403);
 if(!/^application\/json/i.test(request.headers.get("content-type")??""))return json({error:"JSON body required"},415);
 const raw=await request.text();if(raw.length>500)return json({error:"Request too large"},413);
 let b:any;try{b=JSON.parse(raw)}catch{return json({error:"Invalid JSON"},400)}
 let diseaseId:string;try{diseaseId=assertValidOpenTargetsDiseaseId(String(b?.diseaseId??""))}catch{return json({error:"Provide a disease id such as MONDO_0005100 or EFO_0000384."},400)}
 const now=deps.now??(()=>new Date()),ip=(request.headers.get("x-forwarded-for")??"unknown").split(",")[0]!.trim().slice(0,64);
 const recent=(hits.get(ip)??[]).filter(t=>now().getTime()-t<600_000);
 if(recent.length>=10)return json({error:"Rate limit reached. Try again later."},429,{"Retry-After":"600"});
 hits.set(ip,[...recent,now().getTime()]);if(hits.size>2000)hits.clear();
 const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),12_000);
 try{
  const r=await lookupOpenTargetsDiseaseAssociations({diseaseId,pageSize:25,enableIndirect:false,fetcher:deps.fetcher,now,signal:ac.signal});
  if(!r.ok)return json({error:r.outcome==="disease_not_found"?"Open Targets does not recognise that disease id.":"Open Targets could not be reached. No targets are shown."},r.outcome==="disease_not_found"?404:502);
  return json({profile:profileTargets(r.record),caveat:TARGET_CAVEAT,source:"Open Targets Platform (public association metadata)"});
 }catch{return json({error:"The target profile could not be built. Nothing was generated."},502)}
 finally{clearTimeout(timer)}
}
