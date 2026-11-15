import {useCallback,useEffect,useState} from "react";
import {hsiAuth} from "./hsiAuth";
import {askQuestion,type AskOutcome} from "./askClient";
import {LIVE_RUN_KEY} from "./researchHome";
export type AskAccess="checking"|"signed-out"|"unverified"|"ready";
/** Reads the session to choose what to show; the server re-checks everything on every question. */
export function useAsk(){
 const [access,setAccess]=useState<AskAccess>("checking"),[busy,setBusy]=useState(false),[outcome,setOutcome]=useState<AskOutcome|null>(null),[saveNote,setSaveNote]=useState("");
 useEffect(()=>{let live=true;
  hsiAuth.session().then(r=>{if(!live)return;setAccess(!r.data?"signed-out":r.data.user.emailVerified?"ready":"unverified")}).catch(()=>{if(live)setAccess("signed-out")});
  return()=>{live=false};
 },[]);
 const submit=useCallback(async(q:string)=>{setBusy(true);setOutcome(null);setSaveNote("");const o=await askQuestion(q);if(o.kind==="signed-out")setAccess("signed-out");if(o.kind==="unverified")setAccess("unverified");setOutcome(o);setBusy(false)},[]);
 const saveRun=useCallback(()=>{
  if(outcome?.kind!=="routed")return false;
  try{localStorage.setItem(LIVE_RUN_KEY,JSON.stringify(outcome.run));return true}catch{setSaveNote("This browser blocked local storage, so the run could not be opened in the workspace.");return false}
 },[outcome]);
 return {access,busy,outcome,saveNote,submit,saveRun};
}
