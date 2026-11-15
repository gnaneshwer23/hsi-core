import {useRef,useState} from "react";
import {parseInvestigationWorkspace} from "@hsi/interrogativeWorkspace";

export type SaveState={status:"idle"|"working"|"saved"|"blocked"|"error";message:string;id:string|null};
const SAFE=/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/;
/** Saves a question through HSI's existing authenticated investigation endpoint, under the server-approved release. Nothing is sent except the question. */
export function useSaveInvestigation(){
 const [st,setSt]=useState<SaveState>({status:"idle",message:"",id:null});
 const key=useRef<{q:string;release:string;id:string}|null>(null);
 async function save(question:string){
  const q=question.trim();
  if(q.length<5||q.length>500){setSt({status:"error",message:"A saved question must be 5 to 500 characters.",id:null});return}
  setSt({status:"working",message:"Saving…",id:null});
  try{
   const get=await fetch("/api/research/investigations",{credentials:"same-origin",headers:{Accept:"application/json"},cache:"no-store"});
   if(get.status===401){setSt({status:"blocked",message:"Sign in with a verified research account to save an investigation.",id:null});return}
   if(get.status===403){setSt({status:"blocked",message:"Research access has not been confirmed for this account.",id:null});return}
   if(!get.ok)throw Error("unavailable");
   const ws=parseInvestigationWorkspace(await get.json()),release=ws.releases[0];
   if(!ws.canCreate||!ws.writesEnabled){setSt({status:"blocked",message:"Saving is not enabled for this account or deployment. Your selection is kept here and can be exported as a brief.",id:null});return}
   if(!release){setSt({status:"blocked",message:"No published research release is available to save under.",id:null});return}
   if(!key.current||key.current.q!==q||key.current.release!==release.id)key.current={q,release:release.id,id:crypto.randomUUID()};
   const post=await fetch("/api/research/investigations",{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({question:q,releaseId:release.id,requestId:key.current.id})});
   if(!post.ok){setSt({status:post.status===400?"error":"blocked",message:post.status===400?"Use a non-identifying research question.":post.status===409?"The release or save request is no longer available. Try again.":"Saving is not available for this account on this deployment.",id:null});return}
   const r=await post.json() as {id?:string;created?:boolean};
   if(!r.id||!SAFE.test(r.id)){setSt({status:"error",message:"Save could not be confirmed. Retry the same request.",id:null});return}
   setSt({status:"saved",message:r.created===false?"Already saved (the same request was repeated).":"Saved under the server-approved release.",id:r.id});
  }catch{setSt({status:"error",message:"Saving is temporarily unavailable. Nothing was saved.",id:null})}
 }
 return {state:st,save};
}
