import {useEffect,useState} from "react";
import {useSearchParams,Link} from "react-router-dom";
import {hsiAuth} from "../lib/hsiAuth";
import type {InterrogativeInvestigation} from "../../../src/interrogativeContracts";
import type {HsiScientificReviewDecision} from "../../../src/interrogativeScientificReview";
const validId=/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/;
function canonical(value:unknown):string{
 if(Array.isArray(value))return "["+value.map(canonical).join(",")+"]";
 if(value&&typeof value==="object")return "{"+Object.entries(value as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+":"+canonical(v)).join(",")+"}";
 return JSON.stringify(value)??"null";
}
async function digest(value:unknown){const bytes=new TextEncoder().encode(canonical(value));const hash=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("")}
export function ScientificReviewerDecision(){
 const [params]=useSearchParams();const id=params.get("investigation")??"";
 const [record,setRecord]=useState<InterrogativeInvestigation|null>(null);
 const [principal,setPrincipal]=useState("");
 const [status,setStatus]=useState("Enter a valid investigation ID in the URL query to begin.");
 const [outcome,setOutcome]=useState<HsiScientificReviewDecision["outcome"]>("request_revision");
 const [rationale,setRationale]=useState("");const [limitations,setLimitations]=useState("");
 const [coi,setCoi]=useState(false);const [claims,setClaims]=useState<string[]>([]);
 const [submitting,setSubmitting]=useState(false);const [complete,setComplete]=useState(false);
 useEffect(()=>{if(!validId.test(id)){setRecord(null);setStatus("A valid investigation ID is required.");return}
  const controller=new AbortController();setRecord(null);setStatus("Verifying account and loading investigation…");
  Promise.all([hsiAuth.session(),fetch("/api/research/interrogative/"+encodeURIComponent(id),{credentials:"same-origin",cache:"no-store",signal:controller.signal})])
   .then(async ([session,response])=>{if(session.error||!session.data?.user.id)throw Error("Verified Neon Auth session required");if(!response.ok)throw Error("Access denied or trusted research API unavailable");const i=await response.json() as InterrogativeInvestigation;
    if(i.id!==id||i.state!=="awaiting_scientific_review")throw Error("Investigation is not awaiting scientific review");if(i.actorPrincipal===session.data.user.id)throw Error("Authors cannot review their own investigations");
    if(!controller.signal.aborted){setPrincipal(session.data.user.id);setRecord(i);setStatus("")}})
   .catch(e=>{if(!controller.signal.aborted){setRecord(null);setStatus(e instanceof Error?e.message:"Unable to load review")}});return()=>controller.abort();
 },[id]);
 const eligible=record?[...new Set(record.branches.flatMap(b=>[...b.supporting,...b.opposing].map(e=>e.claimId)))]:[];
 async function submit(){
  if(!record||!principal||submitting||!coi||!rationale.trim()||complete)return;
  if(outcome==="approve_with_limitations"&&(!claims.length||!limitations.split("\n").some(s=>s.trim())))return;
  setSubmitting(true);setStatus("");
  try{
   const decision:HsiScientificReviewDecision={
    schemaVersion:"hsi-interrogative-scientific-review-1",decisionId:crypto.randomUUID(),investigationId:record.id,
    investigationHash:await digest(record),releaseId:record.release.id,releaseManifestHash:record.release.manifestHash,
    reviewerPrincipal:principal,reviewedAt:new Date().toISOString(),outcome,rationale:rationale.trim(),
    reviewedClaimIds:claims,limitations:limitations.split("\n").map(s=>s.trim()).filter(Boolean),conflictOfInterestDeclared:coi
   };
   const response=await fetch("/api/research/interrogative/"+encodeURIComponent(record.id)+"/decision",{
    method:"POST",credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(decision)});
   if(!response.ok)throw Error("Decision rejected. Verify reviewer authority, independent identity, investigation hash and trusted API availability.");
   const result=await response.json() as {decisionId?:string;outcome?:string};
   if(result.decisionId!==decision.decisionId||result.outcome!==decision.outcome)throw Error("Unexpected server acknowledgement");
   setComplete(true);setStatus("Decision recorded by trusted backend. Graph promotion remains blocked pending a separate release gate.");
  }catch(e){setStatus(e instanceof Error?e.message:"Decision submission failed")}
  finally{setSubmitting(false)}
 }
 return <main style={{maxWidth:960,margin:"3rem auto",padding:"0 1.25rem"}}>
 <p>HSI / ISI / INDEPENDENT SCIENTIFIC GOVERNANCE</p><h1>Scientific reviewer decision</h1>
 <p>For qualified, independently authorised reviewers only. This form cannot grant reviewer roles, approve draft literature claims, or publish knowledge-graph relationships.</p>
 <p><Link to="/science/review-preparation">Review preparation</Link> · <Link to="/science/study-comparison">SSc evidence comparison</Link></p>
 {record&&!complete&&<section style={{display:"grid",gap:"1rem",padding:"1.5rem",border:"1px solid #64748b",borderRadius:12}}>
 <h2>Investigation {record.id}</h2><p><Link to={"/research/decision-workbench?investigation="+encodeURIComponent(record.id)}>Inspect saved evidence graph and sources →</Link></p><p><strong>Research question:</strong> {record.question}</p>
 <p><strong>Original researcher:</strong> {record.actorPrincipal} · <strong>Release:</strong> {record.release.id} ({record.release.version})</p>
 <p><strong>Conclusion under review:</strong> {record.conclusion.text}</p>
 <p><strong>Limitations:</strong> {record.conclusion.limitations.join("; ")||"None recorded"}</p>
 <label>Review outcome <select value={outcome} onChange={e=>setOutcome(e.target.value as HsiScientificReviewDecision["outcome"])} style={{display:"block",padding:10,width:"100%"}}>
 <option value="request_revision">Request revision</option><option value="reject">Reject</option><option value="approve_with_limitations">Approve investigation with limitations</option>
 </select></label>
 <fieldset><legend>Claims examined (select only claims independently assessed)</legend>{eligible.length?eligible.map(c=><label key={c} style={{display:"block",margin:8}}>
 <input type="checkbox" checked={claims.includes(c)} onChange={e=>setClaims(old=>e.target.checked?[...old,c]:old.filter(x=>x!==c))}/> {c}</label>):<p>No eligible evidence claims. Approval is not permitted.</p>}</fieldset>
 <label>Scientific rationale <textarea required maxLength={4000} value={rationale} onChange={e=>setRationale(e.target.value)} rows={5} style={{display:"block",width:"100%"}}/></label>
 <label>Limitations (one per line) <textarea value={limitations} onChange={e=>setLimitations(e.target.value)} rows={4} style={{display:"block",width:"100%"}}/></label>
 <label><input type="checkbox" checked={coi} onChange={e=>setCoi(e.target.checked)}/> I declare that I have disclosed any conflicts of interest and am independent of the investigation author.</label>
 <button type="button" disabled={submitting||!coi||!rationale.trim()||(outcome==="approve_with_limitations"&&(!claims.length||!limitations.trim()))} onClick={submit}>{submitting?"Submitting…":"Record independent scientific decision"}</button>
 </section>}
 {status&&<p role="status">{status}</p>}
 </main>;
}
