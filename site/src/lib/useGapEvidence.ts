import {useState} from "react";
import type {CooccurrenceResult} from "../../../src/investigation/cooccurrence";
import {classify,type GapRow} from "./gapFinder";

export type GapEvidence={status:"idle"|"loading"|"ready"|"error"|"unsearchable";row:GapRow|null;message:string;at:string};
/** A name usable as one Europe PMC phrase: parenthetical text removed, no brackets, slashes or quotes. */
export function searchTerm(name:string):string|null{
 const t=name.replace(/\s*\([^)]*\)/g,"").replace(/\s+/g," ").trim();
 return t.length>=2&&t.length<=60&&!/[\u0000-\u001f"\\()\[\]{}:/]/.test(t)?t:null;
}
/** One bounded check: three Europe PMC counts (each concept, and both together). Measures attention, not truth. */
export function useGapEvidence(){
 const [st,setSt]=useState<GapEvidence>({status:"idle",row:null,message:"",at:""});
 async function check(a:string,b:string){
  const ta=searchTerm(a),tb=searchTerm(b);
  if(!ta||!tb||ta.toLowerCase()===tb.toLowerCase()){setSt({status:"unsearchable",row:null,message:"One of these concept names cannot be searched as a single phrase (for example it contains a slash or is a compound name), so no count was run.",at:""});return}
  setSt({status:"loading",row:null,message:"",at:""});
  try{
   const res=await fetch("/api/research/cooccurrence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({terms:[ta,tb],pairs:[[0,1]]})});
   if(!res.ok){const b=await res.json().catch(()=>null) as {error?:string}|null;throw Error(b?.error??"The count could not be run (HTTP "+res.status+").")}
   const data=await res.json() as CooccurrenceResult,row=classify(data)[0]??null;
   setSt({status:"ready",row,message:"",at:data.generatedAt});
  }catch(e){setSt({status:"error",row:null,message:e instanceof Error?e.message:"The count could not be run.",at:""})}
 }
 return {state:st,check};
}
