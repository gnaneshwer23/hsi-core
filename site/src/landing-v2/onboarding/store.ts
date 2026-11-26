import {useSyncExternalStore} from "react";
import {EMPTY_STATE,ONBOARDING_KEY,parseState,reduce,serializeState,type Action,type OnboardingState} from "../../../../src/onboarding/scientificOnboarding";

/**
 * A module-level store, so the answers survive moving between the onboarding routes.
 * Device-local only: nothing here is sent anywhere. Reads and writes are guarded, because
 * storage can be unavailable (private windows, blocked site data).
 */
let state:OnboardingState=EMPTY_STATE;
let loaded=false;
const listeners=new Set<()=>void>();

function read():string|null{try{return window.localStorage.getItem(ONBOARDING_KEY)}catch{return null}}
function write(s:OnboardingState){try{window.localStorage.setItem(ONBOARDING_KEY,serializeState(s))}catch{/* storage unavailable: progress lasts for this visit only */}}

function ensureLoaded(){
 if(loaded||typeof window==="undefined")return;
 loaded=true;state=parseState(read());
}
export function getOnboarding():OnboardingState{ensureLoaded();return state}
export function dispatchOnboarding(a:Action){
 ensureLoaded();
 const next=reduce(state,a);
 if(next===state)return;
 state=next;
 if(a.type==="reset"){try{window.localStorage.removeItem(ONBOARDING_KEY)}catch{/* ignore */}}else write(state);
 listeners.forEach(l=>l());
}
export function useOnboarding():[OnboardingState,(a:Action)=>void]{
 const s=useSyncExternalStore(
  cb=>{listeners.add(cb);return()=>{listeners.delete(cb)}},
  getOnboarding,
  ()=>EMPTY_STATE,
 );
 return [s,dispatchOnboarding];
}
