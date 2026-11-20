import {useCallback,useState} from "react";
import {LIVE_RUN_KEY} from "./researchHome";
import {
  migrateLegacyLiveRunIntoLibrary,
  reopenLiveRunFromLibrary,
  saveLiveRunToLibrary,
  type LiveRunLibrary,
  type LiveRunLibraryEntry,
} from "../../../src/investigation/liveRunLibrary";
import {LIVE_SCENARIOS} from "../../../src/investigation/scenarios";
import {recordActivation} from "../../../src/investigation/activationMilestone";
import {recordRepeatUsageReopen} from "../../../src/investigation/repeatUsageMilestone";
import type {Run} from "./workspaceView";

export const LIVE_SCENARIO_ID="il21-autoimmune";
export type RunState="idle"|"running"|"error";

/** Curated scenarioId only — unknown values fall back to the default IL-21 scenario. */
export function resolveLiveScenarioId(raw:string|null|undefined):string{
  if(typeof raw==="string"&&LIVE_SCENARIOS[raw.trim()])return raw.trim();
  return LIVE_SCENARIO_ID;
}

function browserStore():Storage|null{
  try{return typeof localStorage==="undefined"?null:localStorage}catch{return null}
}

/** One run, started only by an explicit call. Save and reopen use this browser's storage only. */
export function useLiveRun(){
 const [run,setRun]=useState<Run|null>(null),[state,setState]=useState<RunState>("idle"),[error,setError]=useState(""),[note,setNote]=useState("");
 const [library,setLibrary]=useState<LiveRunLibrary>(()=>emptyLib());
 const [savedThisSession,setSavedThisSession]=useState(false);
 const [reopenedThisSession,setReopenedThisSession]=useState(false);
 const [lastSavedEntry,setLastSavedEntry]=useState<LiveRunLibraryEntry|null>(null);
 const [activeScenarioId,setActiveScenarioId]=useState(LIVE_SCENARIO_ID);

 const refreshLibrary=useCallback(()=>{
  const store=browserStore();
  setLibrary(migrateLegacyLiveRunIntoLibrary(store));
 },[]);

 const start=useCallback(async(scenarioId?:string|null)=>{
  const id=resolveLiveScenarioId(scenarioId);
  setActiveScenarioId(id);
  setState("running");setError("");setNote("");setSavedThisSession(false);setReopenedThisSession(false);
  try{
   const res=await fetch("/api/research/live-investigation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({scenarioId:id})});
   if(!res.ok){const b=await res.json().catch(()=>null) as {error?:string}|null;throw Error(b?.error??"The investigation could not run (HTTP "+res.status+").")}
   const run=await res.json() as Run;
   setRun(run);setState("idle");
   recordActivation(browserStore(),{
    briefHash:run.briefHash??"",
    question:run.question??"",
   });
  }catch(e){setError(e instanceof Error?e.message:"The investigation could not run.");setState("error")}
 },[]);

 const save=useCallback(()=>{
  if(!run)return;
  const result=saveLiveRunToLibrary(browserStore(),run);
  setLibrary(result.library);
  if(!result.ok){setNote(result.error??"This browser blocked local saving.");setSavedThisSession(false);return}
  setLastSavedEntry(result.entry);
  setSavedThisSession(true);
  setNote("Saved in this browser library only. It is not stored on a server, and org sharing is blocked.");
 },[run]);

 const reopen=useCallback(()=>{
  try{
   const t=localStorage.getItem(LIVE_RUN_KEY);
   if(t){
    const run=JSON.parse(t) as Run;
    setRun(run);
    setNote("Reopened the current browser-saved run.");
    setReopenedThisSession(true);
    recordRepeatUsageReopen(browserStore(),{
     briefHash:run.briefHash??"",
     question:run.question??"",
    });
    refreshLibrary();
    return true;
   }
  }catch{setNote("Could not reopen the saved run.")}
  return false;
 },[refreshLibrary]);

 const reopenFromLibrary=useCallback((id:string)=>{
  const result=reopenLiveRunFromLibrary(browserStore(),id);
  if(!result.ok||!result.run){setNote(result.error??"Could not reopen that saved run.");return false}
  const run=result.run as Run;
  setRun(run);
  setReopenedThisSession(true);
  setNote("Reopened the same version from this browser’s library.");
  recordRepeatUsageReopen(browserStore(),{
   briefHash:run.briefHash??"",
   question:run.question??"",
  });
  refreshLibrary();
  return true;
 },[refreshLibrary]);

 const hasSaved=()=>{try{return !!localStorage.getItem(LIVE_RUN_KEY)}catch{return false}};

 return {
  run,state,error,note,start,save,reopen,reopenFromLibrary,hasSaved,
  library,refreshLibrary,savedThisSession,reopenedThisSession,lastSavedEntry,
  activeScenarioId,
 };
}

function emptyLib():LiveRunLibrary{
 return {schemaVersion:"hsi-live-run-library-1",honesty:{browserSaveOnly:true,productionWritesEnabled:false,orgSharingBlocked:true,scientificApproval:false},entries:[]};
}
