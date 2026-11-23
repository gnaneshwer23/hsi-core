/** Browser client for recorded-fixture literature runs (`/api/research/nexus/*`). Fixture mode only: see src/server/nexusFixtureApi.ts.
 * The browser sends an investigation id and search terms and nothing else; identity and ownership are decided on the server. A brief is shown
 * only after THIS browser has re-verified it (invariants plus content hash) with the same core code the server uses. */
import {BRIEF_SOURCE_URL,renderBriefJson,verifyBriefWith,type LiteratureBrief} from "../../../src/literatureBriefCore";

export const sha256Hex=async(text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text))),x=>x.toString(16).padStart(2,"0")).join("");
export const isSourceLink=(url:string)=>BRIEF_SOURCE_URL.test(url);

export type RunsAvailability={state:"unavailable"|"signin"|"error"}|{state:"ready";health:{status:"ok"|"degraded"|"down";reasons:string[]}};
export type RunJob={jobId:string;status:"queued"|"running"|"completed"|"failed"|"cancelled"|"dead_lettered";attempts:number;cancelRequested:boolean;progress:{stage:string;step:number;of:number}|null;errorCode:string|null;briefAvailable:boolean;dataMode:"fixture_recorded"};
export class RunError extends Error{constructor(public kind:"signin"|"forbidden"|"notfound"|"invalid"|"unavailable"|"unverified"|"toolarge",message:string){super(message)}}

const MAX_BYTES=2_100_000;
const init=(signal:AbortSignal,extra:RequestInit={}):RequestInit=>({credentials:"same-origin",cache:"no-store",redirect:"error",signal,...extra,headers:{Accept:"application/json",...(extra.headers??{})}});
async function readJson(res:Response):Promise<unknown>{
 const text=await res.text();if(text.length>MAX_BYTES)throw new RunError("toolarge","The response was too large to trust.");
 try{return JSON.parse(text)}catch{throw new RunError("unavailable","The service returned something unreadable.")}
}
const fromStatus=(status:number):RunError=>
 status===401?new RunError("signin","Sign in with verified research access to use recorded runs.")
 :status===403?new RunError("forbidden","This action is not permitted. Research writes may be disabled in this deployment.")
 :status===404?new RunError("notfound","That run or investigation was not found, or it is not yours.")
 :status===400||status===413||status===415?new RunError("invalid","The request was not valid. Check the investigation id and search terms.")
 :new RunError("unavailable","The recorded-run service is not available right now.");

export async function checkRuns(signal:AbortSignal):Promise<RunsAvailability>{
 try{
  const res=await fetch("/api/research/nexus/health",init(signal));
  if(res.status===401)return {state:"signin"};
  if(!res.ok)return {state:res.status===404?"unavailable":"error"};
  const j=await readJson(res) as {status?:string;reasons?:unknown};
  if(!["ok","degraded","down"].includes(String(j?.status))||!Array.isArray(j.reasons))return {state:"unavailable"}; // e.g. an HTML fallback page
  return {state:"ready",health:{status:j.status as "ok"|"degraded"|"down",reasons:(j.reasons as unknown[]).filter((x):x is string=>typeof x==="string").slice(0,8)}};
 }catch{return {state:"unavailable"}}
}
export async function startRun(input:{investigationId:string;terms:string[]},signal:AbortSignal):Promise<{jobId:string;created:boolean}>{
 const res=await fetch("/api/research/nexus/jobs",init(signal,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({investigationId:input.investigationId,terms:input.terms})}));
 if(!res.ok)throw fromStatus(res.status);
 const j=await readJson(res) as {jobId?:unknown;created?:unknown};
 if(typeof j?.jobId!=="string"||!/^fl-[a-f0-9]{16}$/.test(j.jobId))throw new RunError("unavailable","The service returned an unexpected answer.");
 return {jobId:j.jobId,created:j.created===true};
}
export async function fetchRun(jobId:string,signal:AbortSignal):Promise<RunJob>{
 const res=await fetch("/api/research/nexus/jobs/"+encodeURIComponent(jobId),init(signal));
 if(!res.ok)throw fromStatus(res.status);
 const j=await readJson(res) as RunJob;
 if(j?.jobId!==jobId||typeof j.status!=="string"||j.dataMode!=="fixture_recorded")throw new RunError("unavailable","The service returned an unexpected answer.");
 return j;
}
/** Fetches the brief and re-verifies it here. A brief that fails verification, belongs to another investigation, or does not match the hash the
 * server announced is refused: the page shows nothing from it. */
export async function fetchVerifiedBrief(jobId:string,expectedInvestigationId:string,signal:AbortSignal):Promise<LiteratureBrief>{
 const res=await fetch("/api/research/nexus/jobs/"+encodeURIComponent(jobId)+"/brief",init(signal));
 if(!res.ok)throw res.status===502?new RunError("unverified","The stored brief failed verification on the server and was not served."):fromStatus(res.status);
 const raw=await readJson(res);
 let brief:LiteratureBrief;
 try{brief=await verifyBriefWith(raw,sha256Hex)}catch{throw new RunError("unverified","This brief could not be verified in your browser, so it is not shown.")}
 const announced=res.headers.get("x-hsi-brief-sha256");
 if(brief.investigationId!==expectedInvestigationId||(announced!==null&&announced!==brief.contentHash))throw new RunError("unverified","This brief does not match the run you asked for, so it is not shown.");
 return brief;
}
export function downloadBrief(brief:LiteratureBrief):string{
 const text=renderBriefJson(brief),filename=`${brief.investigationId}-literature-brief-${brief.contentHash.slice(0,12)}.json`;
 const url=URL.createObjectURL(new Blob([text],{type:"application/json"}));
 const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 return filename;
}
