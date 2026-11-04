import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import "../styles/science-body.css";
type Claim={id:string;pmid:string;support:string;locator:string;claimType:string;limitation:string};
type Verification={scope:string;reviewStatus:string;reviewedByHuman:boolean;graphPromotable:boolean;claims:Claim[]};
type Draft={claimId:string;sourcePmid:string;assessment:"unassessed"|"supports"|"partial"|"contradicts"|"insufficient";rationale:string;methodologyNotes:string;limitations:string;preparedAt:string};
export function ScienceReviewPreparation(){
 const [data,setData]=useState<Verification|null>(null);
 const [error,setError]=useState("");
 const [active,setActive]=useState("");
 const [assessment,setAssessment]=useState<Draft["assessment"]>("unassessed");
 const [rationale,setRationale]=useState("");
 const [methods,setMethods]=useState("");
 const [limitations,setLimitations]=useState("");
 const [drafts,setDrafts]=useState<Draft[]>([]);
 const [message,setMessage]=useState("");
 useEffect(()=>{const controller=new AbortController();
  fetch("/research/ssc-tfh-il21-abstract-verification.v1.json",{signal:controller.signal})
  .then(r=>{if(!r.ok)throw Error("Verification pack unavailable");return r.json() as Promise<Verification>})
  .then(d=>{if(!Array.isArray(d.claims)||d.graphPromotable!==false||d.reviewedByHuman!==false)throw Error("Invalid review boundary");setData(d);setActive(d.claims[0]?.id??"")})
  .catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:"Unable to load claim pack")});
  return()=>controller.abort();
 },[]);
 const claim=data?.claims.find(c=>c.id===active);
 const select=(id:string)=>{setActive(id);const d=drafts.find(d=>d.claimId===id);setAssessment(d?.assessment??"unassessed");setRationale(d?.rationale??"");setMethods(d?.methodologyNotes??"");setLimitations(d?.limitations??"");setMessage("")};
 const save=()=>{if(!claim)return;const next:Draft={claimId:claim.id,sourcePmid:claim.pmid,assessment,rationale:rationale.trim(),methodologyNotes:methods.trim(),limitations:limitations.trim(),preparedAt:new Date().toISOString()};
  setDrafts(old=>[...old.filter(d=>d.claimId!==claim.id),next]);setMessage("Prepared locally in this tab only. Not submitted, reviewed, approved or stored on the server.");
 };
 const exportDraft=()=>{const packet={schemaVersion:"hsi-ssc-review-preparation-1",scope:data?.scope,classification:"untrusted_browser_draft_not_a_review_decision",serverPersisted:false,scientificReviewStatus:"pending",graphPromotable:false,drafts};
  void navigator.clipboard.writeText(JSON.stringify(packet,null,2)).then(()=>setMessage("Draft packet copied. It is not an authenticated review submission."),()=>setMessage("Clipboard unavailable; drafts remain in this tab only."));
 };
 return <main className="science-body"><header className="science-body-hero"><div className="science-body-wrap">
  <p className="science-body-kicker">HSI / ISI / INVESTIGATION 01 / SCIENTIFIC REVIEW PREPARATION</p>
  <h1>Examine every claim.<br/><em>Keep review independent.</em></h1>
  <p>Prepare structured scientific assessments of the SSc Tfh–IL-21–B-cell evidence. This public workspace does not authenticate reviewers, submit decisions, approve evidence or modify the knowledge graph.</p>
  <div className="science-body-actions"><Link to="/science/study-comparison">Compare studies ↗</Link><Link to="/science/literature">Explore literature ↗</Link></div>
 </div></header><section className="science-body-wrap" style={{paddingBlock:"3rem"}}>
  <p className="science-body-review"><strong>Review gate closed:</strong> sign-in and verified reviewer authority are not yet integrated with this interface. All inputs are local, untrusted preparation notes and disappear on reload. Do not enter patient data.</p>
  {error&&<p role="alert">{error}</p>}
  {!data&&!error&&<p role="status">Loading scientific claims…</p>}
  {data&&<div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,2fr)",gap:"1.5rem"}}>
   <nav aria-label="Scientific claims" style={{display:"grid",alignContent:"start",gap:"0.6rem"}}>
    <h2>Claim queue ({data.claims.length})</h2>
    {data.claims.map(c=><button type="button" key={c.id} aria-pressed={active===c.id} onClick={()=>select(c.id)} style={{padding:"0.9rem",textAlign:"left",border:"1px solid #9ba5b2",borderRadius:"0.5rem"}}>
     <strong>{c.id}</strong><span style={{display:"block"}}>PMID {c.pmid} · {drafts.some(d=>d.claimId===c.id)?"Local notes prepared":"Pending assessment"}</span>
    </button>)}
   </nav>
   {claim&&<article style={{border:"1px solid #9ba5b2",borderRadius:"0.75rem",padding:"1.5rem"}}>
    <p className="science-body-kicker">CLAIM / {claim.id} / UNREVIEWED</p>
    <h2>{claim.claimType.replaceAll("_"," ")}</h2>
    <p>Source: <a href={`https://pubmed.ncbi.nlm.nih.gov/${claim.pmid}/`} target="_blank" rel="noreferrer">PubMed {claim.pmid}</a> · Locator: {claim.locator}</p>
    <p><strong>Current source assessment:</strong> {claim.support.replaceAll("_"," ")} (not independent scientific approval)</p>
    <p><strong>Known limitation:</strong> {claim.limitation}</p>
    <form onSubmit={e=>{e.preventDefault();save()}} style={{display:"grid",gap:"1rem"}}>
     <label>Evidence stance (preliminary)
      <select value={assessment} onChange={e=>setAssessment(e.target.value as Draft["assessment"])} style={{display:"block",padding:"0.65rem",width:"100%"}}>
       <option value="unassessed">Unassessed</option><option value="supports">Potentially supports</option><option value="partial">Partial / qualified</option><option value="contradicts">Potentially contradicts</option><option value="insufficient">Insufficient evidence</option>
      </select></label>
     <label>Source-grounded rationale<textarea required value={rationale} onChange={e=>setRationale(e.target.value)} rows={4} style={{display:"block",width:"100%"}} placeholder="Quote-free summary of the precise finding and source locator"/></label>
     <label>Population, assay and experimental model<textarea value={methods} onChange={e=>setMethods(e.target.value)} rows={3} style={{display:"block",width:"100%"}}/></label>
     <label>Limitations and unresolved questions<textarea value={limitations} onChange={e=>setLimitations(e.target.value)} rows={3} style={{display:"block",width:"100%"}}/></label>
     <button type="submit" disabled={!rationale.trim()}>Save preparation notes in this tab</button>
    </form>
   </article>}
  </div>}
  {drafts.length>0&&<section style={{marginTop:"2rem"}}><h2>Prepared notes: {drafts.length}</h2>
   <p>These are not signed review decisions and cannot be used to grant scientific approval.</p>
   <button type="button" onClick={exportDraft}>Copy untrusted draft packet</button>
  </section>}
  {message&&<p role="status">{message}</p>}
 </section></main>;
}
