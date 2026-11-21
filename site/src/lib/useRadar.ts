import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import type {RadarResult} from "../../../src/investigation/radar";
import {departments} from "./departments";
import type {Profile} from "./researchHome";
import {rateLimitedMessage} from "./retryAfter";

export const RADAR_KEY="hsi-radar-v1",RADAR_TTL_MS=6*3600_000;
/** Free-text topics only: broad department names would match half of biology. */
export const radarTopics=(p:Profile)=>p.interests.filter(i=>!departments.some(d=>d.slug===i)).slice(0,5);
export const defaultDays=(p:Profile):1|2|7|30=>p.cadence==="daily"?2:7;
const keyOf=(topics:string[],p:Profile,days:number)=>JSON.stringify([topics,p.orcid,p.papers,days]);
export type RadarState={status:"idle"|"loading"|"ready"|"error";data:RadarResult|null;error:string;days:1|2|7|30;fromCache:boolean};
/** Builds the radar from the profile. Cached on this device for six hours so opening HSI does not re-query every time. */
export function useRadar(profile:Profile,ready:boolean){
 const topics=useMemo(()=>radarTopics(profile),[profile]);
 const [days,setDays]=useState<1|2|7|30>(7),[st,setSt]=useState<RadarState>({status:"idle",data:null,error:"",days:7,fromCache:false});
 const want=ready&&(topics.length>0||!!profile.orcid||profile.papers.length>0);
 const seq=useRef(0);
 const run=useCallback(async(force:boolean,d:1|2|7|30)=>{
  const key=keyOf(topics,profile,d),id=++seq.current;
  if(!force){try{const c=JSON.parse(localStorage.getItem(RADAR_KEY)??"null")?.entries?.[key];if(c&&Date.now()-c.at<RADAR_TTL_MS&&c.data?.schemaVersion==="hsi-radar-1"){setSt({status:"ready",data:c.data,error:"",days:d,fromCache:true});return}}catch{/* no cache */}}
  setSt(s=>({...s,status:"loading",error:"",days:d}));
  try{
   const res=await fetch("/api/research/radar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topics,days:d,orcid:profile.orcid,papers:profile.papers})});
   if(!res.ok){
    const b=await res.json().catch(()=>null) as {error?:string}|null;
    const fallback="The radar could not be built (HTTP "+res.status+").";
    throw Error(res.status===429?rateLimitedMessage(res,b?.error,fallback):(b?.error??fallback));
   }
   const data=await res.json() as RadarResult;if(id!==seq.current)return;
   try{const prev=JSON.parse(localStorage.getItem(RADAR_KEY)??"null")?.entries??{};const entries:Record<string,unknown>={...prev,[key]:{at:Date.now(),data}};const keep=Object.entries(entries as Record<string,{at:number}>).sort((a,b)=>b[1].at-a[1].at).slice(0,4);localStorage.setItem(RADAR_KEY,JSON.stringify({entries:Object.fromEntries(keep)}))}catch{/* cache is optional */}
   setSt({status:"ready",data,error:"",days:d,fromCache:false});
  }catch(e){if(id===seq.current)setSt(s=>({...s,status:"error",error:e instanceof Error?e.message:"The radar could not be built."}))}
 },[topics,profile]);
 useEffect(()=>{if(want){const d=defaultDays(profile);setDays(d);void run(false,d)}},[want,topics.join("|"),profile.orcid,profile.papers.join("|"),profile.cadence]); // eslint-disable-line react-hooks/exhaustive-deps
 return {state:st,topics,want,days,setWindow:(d:1|2|7|30)=>{setDays(d);void run(false,d)},refresh:()=>void run(true,days)};
}
