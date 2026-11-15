import {useCallback,useEffect,useRef,useState} from "react";
import {addEntry,parseLedger,type Ledger,type LedgerEntry} from "../../../src/investigation/hypothesisLedger";
import {LEDGER_KEY} from "./storageKeys";
export {LEDGER_KEY};
/** The hypothesis ledger for this browser. Not stored on a server. The ref mirrors state so add() can answer synchronously. */
export function useLedger(){
 const [ledger,setLedger]=useState<Ledger>({}),[blocked,setBlocked]=useState(false),[ready,setReady]=useState(false),ref=useRef<Ledger>({});
 const commit=useCallback((next:Ledger)=>{ref.current=next;setLedger(next);try{localStorage.setItem(LEDGER_KEY,JSON.stringify(next));setBlocked(false)}catch{setBlocked(true)}},[]);
 useEffect(()=>{let l:Ledger={};try{l=parseLedger(localStorage.getItem(LEDGER_KEY))}catch{l={}}ref.current=l;setLedger(l);setReady(true)},[]);
 const update=useCallback((id:string,fn:(e:LedgerEntry)=>LedgerEntry)=>{const e=ref.current[id];if(e)commit({...ref.current,[id]:fn(e)})},[commit]);
 const add=useCallback((e:LedgerEntry):{added:boolean;error?:string}=>{
  // Re-read storage so an entry added from another tab or page is not overwritten.
  try{const fresh=parseLedger(localStorage.getItem(LEDGER_KEY));if(Object.keys(fresh).length>=Object.keys(ref.current).length)ref.current=fresh}catch{/* keep in-memory */}
  const r=addEntry(ref.current,e);
  if(r.added)commit(r.ledger);
  return {added:r.added,error:r.error};
 },[commit]);
 return {ledger,ready,blocked,add,update};
}
