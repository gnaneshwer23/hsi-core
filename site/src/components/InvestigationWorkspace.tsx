import {useEffect,useRef,useState,type FormEvent} from "react";
import {Link,useNavigate} from "react-router-dom";
import {parseInvestigationWorkspace,type InvestigationWorkspace as Workspace,type InvestigationCursor,type InvestigationSummary} from "../../../src/interrogativeWorkspace";
import "../styles/investigation-workspace.css";

class WorkspaceUiError extends Error{}

export type WorkspaceSnapshot={workspace:Workspace|null;items:InvestigationSummary[];loading:boolean;error:string};
export function InvestigationWorkspace({onSnapshot}:{onSnapshot?:(value:WorkspaceSnapshot)=>void}={}){
 const navigate=useNavigate();
 const [workspace,setWorkspace]=useState<Workspace|null>(null),[items,setItems]=useState<InvestigationSummary[]>([]);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState("");
 const [question,setQuestion]=useState(""),[releaseId,setReleaseId]=useState("");
 const [saveError,setSaveError]=useState("");
 const requestKey=useRef<{question:string;releaseId:string;id:string}|null>(null);
 const controller=useRef<AbortController|null>(null),saveController=useRef<AbortController|null>(null);
 const savingRef=useRef(false);
 useEffect(()=>{onSnapshot?.({workspace,items,loading,error})},[workspace,items,loading,error,onSnapshot]);
 async function load(cursor:InvestigationCursor|null=null){
  controller.current?.abort();const c=new AbortController();controller.current=c;
  setLoading(true);setError("");
  const timer=setTimeout(()=>c.abort(),10000);
  try{
   const suffix=cursor?"?"+new URLSearchParams({cursor:JSON.stringify(cursor)}):"";
   const response=await fetch("/api/research/investigations"+suffix,{credentials:"same-origin",cache:"no-store",redirect:"error",signal:c.signal,headers:{Accept:"application/json"}});
   if(!response.ok)throw new WorkspaceUiError(response.status===401?"Sign in with a verified research account to open your investigations.":response.status===403?"Research access has not been confirmed. Check your research account or contact the research administrator.":"Your investigations could not be loaded. Please retry.");
   const value=parseInvestigationWorkspace(await response.json());
   if(c.signal.aborted)return;
   setWorkspace(value);setItems(previous=>cursor?[...previous,...value.items.filter(i=>!previous.some(p=>p.id===i.id))]:value.items);
   setReleaseId(previous=>value.releases.some(r=>r.id===previous)?previous:value.releases[0]?.id??"");
  }catch(e){if(controller.current===c){if(!cursor){setWorkspace(null);setItems([])}setError(c.signal.aborted?"The investigation request timed out. Please retry.":e instanceof WorkspaceUiError?e.message:"Your investigations could not be loaded. Please retry.")}}
  finally{clearTimeout(timer);if(controller.current===c)setLoading(false)}
 }
 useEffect(()=>{void load();return()=>{controller.current?.abort();controller.current=null;saveController.current?.abort();saveController.current=null}},[]);
 async function create(event:FormEvent){
  event.preventDefault();
  if(savingRef.current||!workspace?.canCreate||!question.trim()||!releaseId)return;
  savingRef.current=true;setSaving(true);setSaveError("");
  const c=new AbortController();saveController.current=c;const timer=setTimeout(()=>c.abort(),15000);
  try{
   const trimmed=question.trim();
   if(!requestKey.current||requestKey.current.question!==trimmed||requestKey.current.releaseId!==releaseId)requestKey.current={question:trimmed,releaseId,id:crypto.randomUUID()};
   const response=await fetch("/api/research/investigations",{method:"POST",credentials:"same-origin",cache:"no-store",redirect:"error",signal:c.signal,headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({question:trimmed,releaseId,requestId:requestKey.current.id})});
   if(!response.ok)throw new WorkspaceUiError(response.status===401?"Your session needs attention. Sign in again before saving.":response.status===403?"Saving is not available for your account on this deployment. Your question has been kept here.":response.status===409?"The selected release or save request is no longer available. Refresh the workspace before trying again.":response.status===400?"Use a non-identifying research question of up to 500 characters. Patient information is not permitted.":"Save could not be confirmed. Retry to check the same request without creating a duplicate.");
   const result=await response.json();
   if(!result||typeof result.id!=="string"||!/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/.test(result.id)||typeof result.created!=="boolean")throw new WorkspaceUiError("Save could not be confirmed. Retry the same request.");
   if(c.signal.aborted)return;
   navigate("/research/decision-workbench?investigation="+encodeURIComponent(result.id));
  }catch(e){if(saveController.current===c)setSaveError(c.signal.aborted?"Save confirmation timed out. Retry the same question to check whether it was saved; a duplicate will not be created.":e instanceof WorkspaceUiError?e.message:"Save could not be confirmed. Retry the same question to check the existing request.")}
  finally{clearTimeout(timer);savingRef.current=false;if(saveController.current===c)setSaving(false)}
 }
 return <section className="research-workspace" aria-labelledby="investigation-workspace-heading">
  <div className="research-workspace-heading"><div><p className="research-workspace-eyebrow">Your research</p><h2 id="investigation-workspace-heading">Start a question. Keep the evidence in view.</h2></div><Link to="/research/account">Research account →</Link></div>
  <p>Save a systemic sclerosis research question against a published evidence release. Reopen the same investigation to inspect its candidate explanations, evidence gaps and review status.</p>
  {loading&&!workspace&&<p role="status">Loading your research workspace…</p>}
  {error&&<div role="alert"><p>{error}</p><button type="button" onClick={()=>void load()} disabled={loading||saving}>Retry workspace</button></div>}
  {workspace&&<div className="research-workspace-grid"><section aria-labelledby="new-investigation-heading"><h3 id="new-investigation-heading">New investigation</h3>
   {!workspace.writesEnabled&&<p className="research-workspace-notice">New investigations are not enabled on this deployment. You can reopen your existing investigations.</p>}
   {workspace.writesEnabled&&!workspace.releases.length&&<p className="research-workspace-notice">No published SSc evidence release is available for new investigations. Existing investigations can still be reopened.</p>}
   {workspace.writesEnabled&&workspace.releases.length>0&&!workspace.canCreate&&<p className="research-workspace-notice">Creating an investigation requires researcher access. Reviewer permissions alone do not grant this access.</p>}
   <form onSubmit={create}>
    <label htmlFor="research-question">Research question</label>
    <textarea id="research-question" rows={4} required maxLength={500} value={question} disabled={!workspace.canCreate||saving} onChange={e=>{setQuestion(e.target.value);setSaveError("")}} placeholder="Which mechanisms may contribute to fibrosis in systemic sclerosis?" aria-describedby="research-question-guidance"/>
    <p id="research-question-guidance" className="research-workspace-hint">Research questions only. Do not enter patient names, identifiers or clinical records. {question.length}/500 characters.</p>
    <label htmlFor="research-release">Evidence release</label>
    <select id="research-release" value={releaseId} required disabled={!workspace.canCreate||saving} onChange={e=>{setReleaseId(e.target.value);setSaveError("")}}>
     {!workspace.releases.length&&<option value="">No published SSc release available</option>}
     {workspace.releases.map(r=><option key={r.id} value={r.id}>{r.id} · v{r.version}</option>)}
    </select>
    <p className="research-workspace-hint">The draft records the release version. Candidate mechanisms remain unvalidated until evidence retrieval and independent review.</p>
    <button type="submit" className="research-workspace-primary" disabled={!workspace.canCreate||saving||!question.trim()||!releaseId}>{saving?"Saving investigation…":"Create and save investigation"}</button>
    {saveError&&<p role="alert">{saveError}</p>}
   </form>
  </section><section aria-labelledby="saved-investigations-heading"><div className="research-workspace-heading"><h3 id="saved-investigations-heading">Your saved investigations</h3><button type="button" disabled={loading||saving} onClick={()=>void load()}>{loading?"Loading…":"Refresh list"}</button></div>
   {!items.length?<p>No saved investigations yet. Start with a bounded research question when a published release and researcher access are available.</p>:<ul className="research-workspace-list">{items.map(i=><li key={i.id}><span className="research-workspace-state">{i.state.replaceAll("_"," ")}</span><h4><Link to={"/research/decision-workbench?investigation="+encodeURIComponent(i.id)}>{i.question}</Link></h4><p>{i.release.id} · v{i.release.version}</p><time dateTime={i.createdAt}>{new Date(i.createdAt).toLocaleDateString("en-GB")}</time></li>)}</ul>}
   {workspace.nextCursor&&<button type="button" disabled={loading||saving} onClick={()=>void load(workspace.nextCursor)}>Load more investigations</button>}
  </section></div>}
 </section>;
}
