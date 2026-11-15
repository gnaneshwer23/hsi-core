import {useCallback,useState} from "react";
import {LIVE_RUN_KEY} from "./researchHome";
import type {Run} from "./workspaceView";
export const LIVE_SCENARIO_ID="il21-autoimmune";
export type RunState="idle"|"running"|"error";
/** One run, started only by an explicit call. Save and reopen use this browser's storage only. */
export function useLiveRun(){
 const [run,setRun]=useState<Run|null>(null),[state,setState]=useState<RunState>("idle"),[error,setError]=useState(""),[note,setNote]=useState("");
 const start=useCallback(async()=>{
  setState("running");setError("");setNote("");
  try{
   const res=await fetch("/api/research/live-investigation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({scenarioId:LIVE_SCENARIO_ID})});
   if(!res.ok){const b=await res.json().catch(()=>null) as {error?:string}|null;throw Error(b?.error??"The investigation could not run (HTTP "+res.status+").")}
   setRun(await res.json() as Run);setState("idle");
  }catch(e){setError(e instanceof Error?e.message:"The investigation could not run.");setState("error")}
 },[]);
 const save=useCallback(()=>{if(!run)return;try{localStorage.setItem(LIVE_RUN_KEY,JSON.stringify(run));setNote("Saved in this browser only. It is not stored on a server.")}catch{setNote("This browser blocked local saving.")}},[run]);
 const reopen=useCallback(()=>{try{const t=localStorage.getItem(LIVE_RUN_KEY);if(t){setRun(JSON.parse(t) as Run);setNote("Reopened the run saved in this browser.");return true}}catch{setNote("Could not reopen the saved run.")}return false},[]);
 const hasSaved=()=>{try{return !!localStorage.getItem(LIVE_RUN_KEY)}catch{return false}};
 return {run,state,error,note,start,save,reopen,hasSaved};
}
