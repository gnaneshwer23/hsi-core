import {useCallback,useMemo,useState} from "react";
import type {CooccurrenceResult} from "../../../src/investigation/cooccurrence";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {classify,planCounts,recordedGapsFor,type GapRow,type RecordedGap} from "./gapFinder";
import type {Profile} from "./researchHome";
import {rateLimitedMessage} from "./retryAfter";
import {radarTopics} from "./useRadar";

export const GAPS_KEY="hsi-gaps-v1",GAPS_TTL_MS=24*3600_000;
export type GapsState={status:"idle"|"loading"|"ready"|"error";rows:GapRow[];at:string|null;error:string;fromCache:boolean;note:string};
/** Recorded gaps come straight from the published graph. Intersection counts are fetched only when asked, and cached for a day on this device. */
export function useGaps(profile:Profile,bundle:DomainBundle|null){
 const topics=useMemo(()=>radarTopics(profile).slice(0,3),[profile]);
 const recorded:RecordedGap[]=useMemo(()=>bundle?recordedGapsFor(bundle,topics):[],[bundle,topics]);
 const plan=useMemo(()=>planCounts(bundle,topics),[bundle,topics]);
 const [st,setSt]=useState<GapsState>({status:"idle",rows:[],at:null,error:"",fromCache:false,note:""});
 const key=JSON.stringify(plan);
 const find=useCallback(async(force:boolean)=>{
  if(!plan.pairs.length)return;
  if(!force){try{const c=JSON.parse(localStorage.getItem(GAPS_KEY)??"null")?.entries?.[key];if(c&&Date.now()-c.at<GAPS_TTL_MS&&c.data?.schemaVersion==="hsi-cooccurrence-1"){setSt({status:"ready",rows:classify(c.data),at:c.data.generatedAt,error:"",fromCache:true,note:c.data.note});return}}catch{/* no cache */}}
  setSt(s=>({...s,status:"loading",error:""}));
  try{
   const res=await fetch("/api/research/cooccurrence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(plan)});
   if(!res.ok){
    const b=await res.json().catch(()=>null) as {error?:string}|null;
    const fallback="The counts could not be built (HTTP "+res.status+").";
    throw Error(res.status===429?rateLimitedMessage(res,b?.error,fallback):(b?.error??fallback));
   }
   const data=await res.json() as CooccurrenceResult;
   try{const prev=JSON.parse(localStorage.getItem(GAPS_KEY)??"null")?.entries??{};const keep=Object.entries({...prev,[key]:{at:Date.now(),data}} as Record<string,{at:number}>).sort((a,b)=>b[1].at-a[1].at).slice(0,3);localStorage.setItem(GAPS_KEY,JSON.stringify({entries:Object.fromEntries(keep)}))}catch{/* cache optional */}
   setSt({status:"ready",rows:classify(data),at:data.generatedAt,error:"",fromCache:false,note:data.note});
  }catch(e){setSt(s=>({...s,status:"error",error:e instanceof Error?e.message:"The counts could not be built."}))}
 },[plan,key]);
 return {topics,recorded,plan,state:st,find};
}
