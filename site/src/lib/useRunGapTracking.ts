import {useCallback,useEffect,useState} from "react";
import {parseTracking,recordTracked,type GapStatus,type GapTracking} from "../../../src/knowledgeGraph/gapRegister";
import {RUN_GAPS_KEY} from "./storageKeys";
export {RUN_GAPS_KEY};
/** Status and notes for gaps derived from live runs. This browser only; keyed by scenario and gap kind so it survives a re-run. */
export function useRunGapTracking(version:string){
 const [track,setTrack]=useState<GapTracking>({}),[blocked,setBlocked]=useState(false);
 useEffect(()=>{try{setTrack(parseTracking(localStorage.getItem(RUN_GAPS_KEY)))}catch{setTrack({})}},[]);
 const set=useCallback((id:string,s:GapStatus,note:string,count=0)=>{
  setTrack(prev=>{const next=recordTracked(prev,id,version,count,s,new Date().toISOString(),note);try{localStorage.setItem(RUN_GAPS_KEY,JSON.stringify(next));setBlocked(false)}catch{setBlocked(true)}return next});
 },[version]);
 return {track,set,blocked};
}
