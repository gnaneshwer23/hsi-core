import {Link} from "react-router-dom";
import {useSaveInvestigation} from "../lib/useSaveInvestigation";

/** Save the question behind a selection or a gap as a research investigation. Only the question is stored; the selection and counts stay in this browser. */
export function SaveInvestigation({question,disabled=false}:{question:string;disabled?:boolean}){
 const {state,save}=useSaveInvestigation();
 return (
  <div className="si">
   <button type="button" disabled={disabled||state.status==="working"} onClick={()=>void save(question)}>{state.status==="working"?"Saving…":"Save as investigation"}</button>
   <span {...(state.message?{role:"status"}:{})} className={state.status==="error"||state.status==="blocked"?"si-bad":"si-ok"}>
    {state.message}{state.id&&<> <Link to={"/research/decision-workbench?investigation="+encodeURIComponent(state.id)}>Open in the workbench</Link></>}
   </span>
   <small>Stores the question only, under the approved release. Evidence is not attached or approved by saving.</small>
  </div>
 );
}
