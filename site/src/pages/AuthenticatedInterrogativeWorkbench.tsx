import {useEffect,useState} from "react";
import {useSearchParams} from "react-router-dom";
import {InterrogativeWorkbench} from "../components/InterrogativeWorkbench";
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "../../../src/interrogativeContracts";
/** This page never accepts an investigation from URL JSON or local storage.
 * It loads only from a same-origin, session-authenticated server endpoint.
 * The endpoint must be implemented by the trusted HSI backend before deployment.
 */
export function AuthenticatedInterrogativeWorkbench(){
 const [params]=useSearchParams();
 const id=params.get("investigation");
 const [submitting,setSubmitting]=useState(false);
 const [submissionStatus,setSubmissionStatus]=useState("");
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
 async function submitReview(){
  if(!record||record.state!=="draft"||submitting)return;
  setSubmitting(true);setSubmissionStatus("");
  try{
   const response=await fetch("/api/research/interrogative/"+encodeURIComponent(record.id)+"/submit-review",{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json","Accept":"application/json"},body:"{}"});
   if(!response.ok)throw Error("Submission denied or unavailable. Check session, researcher grant and trusted API deployment.");
   const result=await response.json() as {state?:string};
   if(result.state!=="awaiting_scientific_review")throw Error("Unexpected server response; submission not confirmed.");
   setRecord({...record,state:"awaiting_scientific_review"});
   setSubmissionStatus("Submitted for independent review. No evidence has been approved or published.");
  }catch(e){setSubmissionStatus(e instanceof Error?e.message:"Submission failed")}
  finally{setSubmitting(false)}
 }
 return <><InterrogativeWorkbench investigation={record} falsification={null}/><section style={{maxWidth:920,margin:"1rem auto",padding:"1rem"}}>
 {record&&<><h2>Governed scientific review</h2><p>State: {record.state.replaceAll("_"," ")}</p>
 <p>Submission requires verified researcher access to the trusted HSI backend. An independent authorised scientist must make any review decision.</p>
 {record.state==="draft"&&<button type="button" disabled={submitting} onClick={submitReview}>{submitting?"Submitting…":"Submit for independent review"}</button>}
 {record.state==="awaiting_scientific_review"&&<p>Awaiting independent review; no graph publication.</p>}
 {record.state==="reviewed"&&<p>Human reviewed; graph publication remains a separate gate.</p>}
 {record.state==="rejected"&&<p>Rejected; no graph publication.</p>}</>}
 {submissionStatus&&<p role="status">{submissionStatus}</p>}</section>{status&&<p role="status" style={{maxWidth:920,margin:"1rem auto",padding:"0 1rem"}}>{status}</p>}</>;
}
