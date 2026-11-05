import {useEffect,useRef,useState,type FormEvent} from "react";
import {useSearchParams,Link} from "react-router-dom";
import {IndependentReviewQueue} from "../components/IndependentReviewQueue";
import {InvestigationEvidenceGraph} from "../components/InvestigationEvidenceGraph";
import {BriefDownloads} from "../components/InvestigationDelivery";
import {fetchDeliveryView} from "../lib/investigationDeliveryClient";
import {packageClaimIds,type DeliveryView,type ReviewDecisionRequest,type ReviewOutcome} from "../../../src/investigationDelivery";
import "../styles/investigation-delivery.css";
function ReviewForm({id}:{id:string}){
 const [view,setView]=useState<DeliveryView|null>(null),[message,setMessage]=useState("Loading verified evidence package…"),[attempt,setAttempt]=useState(0),[busy,setBusy]=useState(false);
 const [outcome,setOutcome]=useState<ReviewOutcome>("request_revision"),[rationale,setRationale]=useState(""),[limitations,setLimitations]=useState(""),[coi,setCoi]=useState(false),[claims,setClaims]=useState<string[]>([]);
 const limitLines=limitations.split("\n").map(s=>s.trim()).filter(Boolean),limitsValid=limitLines.length<=8&&limitLines.every(s=>s.length<=250);
 const request=useRef<{key:string;id:string}|null>(null),pending=useRef(false);
 useEffect(()=>{const c=new AbortController(),timer=setTimeout(()=>c.abort(),20000);setView(null);setMessage("Loading verified evidence package…");fetchDeliveryView(id,c.signal).then(v=>{if(!c.signal.aborted){setView(v);setMessage("")}}).catch(()=>{if(!c.signal.aborted)setMessage("The submitted package could not be verified. Check reviewer authority, source permissions and research access.")}).finally(()=>clearTimeout(timer));const timeout=()=>setMessage("The submitted package request timed out. Refresh to retry.");c.signal.addEventListener("abort",timeout,{once:true});return()=>{c.signal.removeEventListener("abort",timeout);c.abort();clearTimeout(timer)}},[id,attempt]);
 async function submit(e:FormEvent){e.preventDefault();if(pending.current||!view?.capabilities.canDecide||!view.package||!view.submission)return;
  const limits=limitations.split("\n").map(s=>s.trim()).filter(Boolean);if(!coi||rationale.trim().length<30||limits.length>8||limits.some(s=>s.length>250)||(outcome==="approve_with_limitations"&&(!claims.length||!limits.length)))return;
  pending.current=true;setBusy(true);setMessage("");try{
   const values={schemaVersion:"hsi-review-request-2" as const,investigationId:id,submissionId:view.submission.id,packageHash:view.package.packageHash,outcome,rationale:rationale.trim(),reviewedClaimIds:[...claims].sort(),limitations:limits,conflictOfInterestDeclared:true as const};
   const key=JSON.stringify(values);if(!request.current||request.current.key!==key)request.current={key,id:crypto.randomUUID()};const decision:ReviewDecisionRequest={...values,requestId:request.current.id};
   const response=await fetch("/api/research/interrogative/"+encodeURIComponent(id)+"/decision",{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(decision),signal:AbortSignal.timeout(20000)});
   const result=await response.json();if(!response.ok||result.packageHash!==view.package.packageHash||result.outcome!==outcome||typeof result.id!=="string"||!/^review-[a-f0-9]{32}$/.test(result.id))throw Error();setAttempt(n=>n+1);
  }catch{setMessage("The decision could not be confirmed. Your input is retained. Retry the same request or refresh to check whether it was recorded.")}finally{pending.current=false;setBusy(false)}
 }
 return <main className="delivery-review"><p>HSI / ACCOUNTABLE SCIENTIFIC REVIEW</p><h1>Review the submitted evidence brief</h1><p><Link to="/research/scientific-review">← Reviewer queue</Link> · <Link to={"/research/decision-workbench?investigation="+id}>Investigation workbench</Link></p><p>Acceptance concerns this fixed evidence brief. It does not validate candidate mechanisms, authorise clinical decisions or approve graph publication.</p><button type="button" disabled={busy} onClick={()=>setAttempt(n=>n+1)}>Refresh submitted package</button>
  {message&&<p role="status">{message}</p>}
  {view?.package&&<><h2>{view.package.investigation.question}</h2><p>Package <code>{view.package.packageHash}</code></p><p>Evidence context <code>{view.package.context.contentHash}</code></p><BriefDownloads id={id} packageHash={view.package.packageHash}/><InvestigationEvidenceGraph investigation={view.package.investigation}/>
   {view.decision?<article aria-label="Recorded independent decision"><h2>{view.decision.outcome.replaceAll("_"," ")}</h2><p>{view.decision.rationale}</p><ul>{view.decision.limitations.map((s,i)=><li key={i}>{s}</li>)}</ul><p>Decision <code>{view.decision.decisionHash}</code></p><p>The decision and submitted package are immutable. Further changes require a linked revision.</p></article>:view.capabilities.canDecide&&view.submission?<form onSubmit={submit}>
   <label htmlFor="brief-review-outcome">Review outcome</label><select id="brief-review-outcome" disabled={busy} value={outcome} onChange={e=>setOutcome(e.target.value as ReviewOutcome)}><option value="request_revision">Request revision</option><option value="reject">Reject brief</option><option value="approve_with_limitations">Accept evidence brief with limitations</option></select>
   <fieldset><legend>Primary-release claims independently examined</legend>{packageClaimIds(view.package).map(id=><label key={id}><input type="checkbox" disabled={busy} checked={claims.includes(id)} onChange={e=>setClaims(old=>e.target.checked?[...old,id]:old.filter(x=>x!==id))}/>{id}</label>)}</fieldset>
   <label htmlFor="brief-review-rationale">Scientific rationale</label><textarea id="brief-review-rationale" required minLength={30} maxLength={4000} rows={5} disabled={busy} value={rationale} onChange={e=>setRationale(e.target.value)}/>
   <label htmlFor="brief-review-limitations">Limitations (up to eight lines, 250 characters each)</label><textarea id="brief-review-limitations" maxLength={2007} rows={4} disabled={busy} value={limitations} onChange={e=>setLimitations(e.target.value)}/>
   {!limitsValid&&<p role="alert">Use up to eight limitation lines, with no more than 250 characters per line.</p>}
   <label><input type="checkbox" disabled={busy} checked={coi} onChange={e=>setCoi(e.target.checked)}/>I have disclosed conflicts of interest and am independent of the investigation author.</label><p>No patient-identifying information. The backend verifies reviewer identity and authority independently.</p>
   <button type="submit" disabled={busy||!coi||!limitsValid||rationale.trim().length<30||(outcome==="approve_with_limitations"&&(!claims.length||!limitations.trim()))}>Record independent brief decision</button></form>:<p>Recording a decision is not available for this identity or deployment. Authors cannot review their own investigations.</p>}
  </>}
 </main>;
}
export function ScientificReviewerDecision(){const [params]=useSearchParams();const id=params.get("investigation");return !id?<IndependentReviewQueue/>:/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/.test(id)?<ReviewForm key={id} id={id}/>:<main className="delivery-review"><h1>Valid investigation required</h1><Link to="/research/scientific-review">Open reviewer queue</Link></main>}
