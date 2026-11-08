import {InvestigationProgress} from "../components/InvestigationProgress";
import {useEffect,useState} from "react";
import {Link,useSearchParams} from "react-router-dom";
import {InvestigationDelivery} from "../components/InvestigationDelivery";
import {InvestigationEvidenceGraph} from "../components/InvestigationEvidenceGraph";
import {InterrogativeWorkbench} from "../components/InterrogativeWorkbench";
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "../../../src/interrogativeValidation";
/** This page never accepts an investigation from URL JSON or local storage.
 * It loads only from a same-origin, session-authenticated server endpoint.
 * The endpoint must be implemented by the trusted HSI backend before deployment.
 */
export function AuthenticatedInterrogativeWorkbench(){
 const [params]=useSearchParams();
 const id=params.get("investigation");
 const [record,setRecord]=useState<InterrogativeInvestigation|null>(null);
 const [status,setStatus]=useState("Provide an authorised investigation ID to load research evidence.");
 useEffect(()=>{
  setRecord(null);
  if(!id||!/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/.test(id)){setStatus("Valid investigation ID required.");return}
  const controller=new AbortController();
  setStatus("Loading authorised investigation…");
  fetch("/api/research/interrogative/"+encodeURIComponent(id),{credentials:"same-origin",cache:"no-store",signal:controller.signal,headers:{"Accept":"application/json"}})
   .then(async response=>{if(!response.ok)throw Error("Research investigation unavailable or access denied");return response.json() as Promise<unknown>})
   .then(value=>{
    if(controller.signal.aborted)return;
    const i=value as InterrogativeInvestigation;
    validateInterrogativeInvestigation(i);
    if(i.id!==id)throw Error("Investigation identity mismatch");
    setRecord(i);setStatus("");
   })
   .catch(()=>{if(!controller.signal.aborted){setRecord(null);setStatus("Unable to load an authorised investigation. Sign in with a verified research account or contact the research administrator.")}});
  return ()=>controller.abort();
 },[id]);
 return <><nav aria-label="Investigation navigation" style={{maxWidth:1180,margin:"1rem auto",padding:"0 1.5rem"}}><Link to="/research/scientific-workbench">← Your saved investigations</Link>{" · "}<Link to="/research/mechanism-workflow">Connected Ask → export path</Link>{" · "}<Link to="/research/dashboard">Research workspace</Link></nav><InvestigationProgress record={record} investigationId={id}/><InterrogativeWorkbench investigation={record} falsification={null}/>{record&&<InvestigationEvidenceGraph key={record.id} investigation={record}/>}{record&&<InvestigationDelivery key={record.id} investigation={record} onRecordChange={setRecord} onSubmitted={()=>setRecord({...record,state:"awaiting_scientific_review"})}/>} {status&&<p role="status" style={{maxWidth:920,margin:"1rem auto",padding:"0 1rem"}}>{status}</p>}</>;
}
