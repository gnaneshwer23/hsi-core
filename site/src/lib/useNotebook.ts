import {useCallback,useEffect,useRef,useState} from "react";
import {addRecord,mergeImport,parseNotebook,removeRecord,type MethodRecord,type Notebook} from "../../../src/methods/notebook";
import {NOTEBOOK_KEY} from "./storageKeys";
/** The methods notebook for this browser. Private; never uploaded. */
export function useNotebook(){
 const [notebook,setNotebook]=useState<Notebook>({}),[blocked,setBlocked]=useState(false),[ready,setReady]=useState(false),ref=useRef<Notebook>({});
 const commit=useCallback((n:Notebook)=>{ref.current=n;setNotebook(n);try{localStorage.setItem(NOTEBOOK_KEY,JSON.stringify(n));setBlocked(false)}catch{setBlocked(true)}},[]);
 useEffect(()=>{let n:Notebook={};try{n=parseNotebook(localStorage.getItem(NOTEBOOK_KEY))}catch{n={}}ref.current=n;setNotebook(n);setReady(true)},[]);
 const add=useCallback((r:MethodRecord)=>{const a=addRecord(ref.current,r);if(a.added)commit(a.notebook);return {added:a.added,error:a.error}},[commit]);
 const remove=useCallback((id:string)=>commit(removeRecord(ref.current,id)),[commit]);
 const importFrom=useCallback((text:string)=>{const m=mergeImport(ref.current,parseNotebook(text));if(m.added>0)commit(m.notebook);return {added:m.added,skipped:m.skipped}},[commit]);
 return {notebook,ready,blocked,add,remove,importFrom};
}
