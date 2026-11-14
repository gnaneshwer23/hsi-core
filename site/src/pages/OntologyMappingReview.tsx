import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import mappingsJson from "../../../research/ontology/candidate-mappings.v1.json";
import {browserStore,exportDecisions,history,latestDecisions,recordDecision,verifyDecisions,REASON_LIMITS,type CandidateMappingsFile,type CuratorDecision,type ReviewDecision} from "../../../src/ontology/mappingReview";
import type {ConceptMapping} from "../../../src/ontology/conceptMapping";
import "../styles/ontology-review.css";

const file=mappingsJson as unknown as CandidateMappingsFile;
const LICENCE:Record<string,string>={MONDO:"CC BY 4.0",UBERON:"CC BY 3.0",CL:"CC BY 4.0",GO:"CC BY 4.0",ECO:"CC0 1.0"};
const LABEL:Record<ReviewDecision,string>={accept_candidate:"Recommend accepting",reject_candidate:"Recommend rejecting",defer:"Defer"};
const DONE:Record<ReviewDecision,string>={accept_candidate:"Recommended for acceptance",reject_candidate:"Recommended for rejection",defer:"Deferred"};
const release=(p:string)=>file.ontologies.find(o=>o.prefix===p)?.release??"";
function download(value:unknown,name:string){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+"\n"],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

function Card({m,latest,count,reviewer,onSave}:{m:ConceptMapping;latest:CuratorDecision|undefined;count:number;reviewer:string;onSave:(m:ConceptMapping,decision:ReviewDecision,ontologyId:string|null,reason:string)=>Promise<string>}){
 const [pick,setPick]=useState<string>(m.candidates[0]!.id),[reason,setReason]=useState(""),[msg,setMsg]=useState("");
 const headingId="mr-"+m.conceptId.replace(/[^a-z0-9]/gi,"-");
 async function go(d:ReviewDecision){setMsg(await onSave(m,d,d==="defer"?null:pick,reason));}
 return <article className="mr-card" aria-labelledby={headingId}>
  <header><h3 id={headingId}>{m.conceptName}</h3>
   {latest?<span className={"mr-chip "+(latest.decision==="accept_candidate"?"mr-ok":latest.decision==="reject_candidate"?"mr-no":"mr-wait")}>{DONE[latest.decision]}</span>:<span className="mr-chip">Awaiting review</span>}</header>
  <fieldset className="mr-candidates"><legend>{m.candidates.length>1?"Candidate terms (choose one)":"Candidate term"}</legend>
   {m.candidates.map(c=><label key={c.id} className="mr-cand">
    <input type="radio" name={"cand-"+m.conceptId} value={c.id} checked={pick===c.id} onChange={()=>setPick(c.id)}/>
    <span><strong>{c.label}</strong> <code>{c.id}</code><br/><small>{c.ontology} {release(c.ontology)} · {LICENCE[c.ontology]??"licence in audit"} · matched on {c.matchedOn==="label"?"label":"exact synonym"} “{c.matchedText}”</small></span>
   </label>)}
  </fieldset>
  <label className="mr-field">Reason for your recommendation<textarea rows={2} maxLength={REASON_LIMITS.max} value={reason} onChange={e=>setReason(e.target.value)} aria-describedby={headingId+"-hint"}/></label>
  <p id={headingId+"-hint"} className="mr-hint">{REASON_LIMITS.min}–{REASON_LIMITS.max} characters. Describe the terms only; do not enter personal or patient information.</p>
  <div className="mr-actions" role="group" aria-label={"Decision for "+m.conceptName}>
   {(Object.keys(LABEL) as ReviewDecision[]).map(d=><button key={d} type="button" className={d==="accept_candidate"?"mr-btn mr-btn-primary":"mr-btn"} disabled={!reviewer.trim()} onClick={()=>go(d)}>{LABEL[d]}</button>)}
  </div>
  {!reviewer.trim()&&<p className="mr-hint">Enter a reviewer label above to record a decision.</p>}
  {msg&&<p className="mr-error" role="alert">{msg}</p>}
  {latest&&<p className="mr-hint">Latest: {DONE[latest.decision]}{latest.ontologyId?` (${latest.ontologyId})`:""} by {latest.reviewerLabel} (unverified), revision {latest.revision} of {count}. “{latest.reason}”</p>}
 </article>;
}

export function OntologyMappingReview(){
 const store=useMemo(()=>browserStore(),[]),[tick,setTick]=useState(0),[reviewer,setReviewer]=useState(""),[filter,setFilter]=useState<"pending"|"decided"|"all">("pending"),[problems,setProblems]=useState<string[]>([]),[exportMsg,setExportMsg]=useState(""),[notice,setNotice]=useState("");
 const reviewable=useMemo(()=>file.mappings.filter(m=>m.candidates.length>0),[]),unmapped=useMemo(()=>file.mappings.filter(m=>m.candidates.length===0),[]);
 const latest=useMemo(()=>store?latestDecisions(file,store):new Map<string,CuratorDecision>(),[store,tick]);
 useEffect(()=>{if(store)verifyDecisions(file,store).then(setProblems)},[store,tick]);
 const shown=reviewable.filter(m=>filter==="all"||(filter==="decided")===latest.has(m.conceptId));
 async function save(m:ConceptMapping,decision:ReviewDecision,ontologyId:string|null,reason:string){
  if(!store)return "This browser is blocking local storage, so decisions cannot be recorded here.";
  try{const r=await recordDecision(file,store,{conceptId:m.conceptId,decision,ontologyId,reason,reviewerLabel:reviewer});setTick(t=>t+1);setNotice(`${m.conceptName}: ${r.status==="unchanged"?"already recorded, no change":DONE[decision].toLowerCase()+", recorded on this device as an unreviewed recommendation"}.`);return ""}
  catch(e){return e instanceof Error?e.message:"Could not record the decision"}
 }
 async function exportAll(){
  if(!store)return;
  try{const out=await exportDecisions(file,store);download(out,"hsi-curator-decisions.json");setExportMsg(`Exported ${out.decisions.length} recorded decisions (${out.counts.decided} concepts).`)}
  catch(e){setExportMsg(e instanceof Error?e.message:"Export failed")}
 }
 return <div className="mr-page"><header className="mr-hero"><p className="mr-kicker">HUMAN SUPER INTELLIGENCE / CURATOR WORKSPACE</p><h1>Ontology mapping review</h1>
  <p>Suggested matches between graph concepts and ontology terms, found by exact label or exact synonym. {reviewable.length} of {file.conceptCount} concepts have a candidate; the rest have no exact match, which is not evidence that no term exists.</p>
  <p className="mr-banner" role="note"><strong>These are recommendations, not approvals.</strong> They are stored on this device only, the reviewer label is self-declared and unverified, and the graph does not change. Exported recommendations still need independent human review before any exact mapping is used.</p></header>
  <div className="mr-wrap">
   <section aria-label="Reviewer and progress" className="mr-bar">
    <label className="mr-field">Reviewer label<input value={reviewer} maxLength={60} onChange={e=>setReviewer(e.target.value)} autoComplete="off"/></label>
    <p className="mr-progress" aria-live="polite"><strong>{latest.size}</strong> of {reviewable.length} reviewed · {reviewable.length-latest.size} pending</p>
    <div role="group" aria-label="Filter concepts" className="mr-filters">{(["pending","decided","all"] as const).map(f=><button key={f} type="button" className="mr-btn" aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f==="pending"?"Pending":f==="decided"?"Reviewed":"All"}</button>)}</div>
    <button type="button" className="mr-btn" onClick={exportAll} disabled={!store||latest.size===0}>Export recommendations</button>
   </section>
   {!store&&<p className="mr-error" role="alert">Local storage is not available in this browser, so recommendations cannot be recorded.</p>}
   {problems.length>0&&<p className="mr-error" role="alert">Stored decisions failed verification: {problems.join("; ")}</p>}
   <div aria-live="polite">{notice&&<p className="mr-msg" role="status">{notice}</p>}{exportMsg&&<p className="mr-msg" role="status">{exportMsg}</p>}</div>
   <p className="mr-hint">Ontologies: {file.ontologies.map(o=>`${o.prefix} ${o.release}`).join(" · ")}. Terms are used unaltered; see the attribution note in the repository.</p>
   {shown.length===0?<p className="mr-empty">Nothing in this view.</p>:shown.map(m=><Card key={m.conceptId} m={m} latest={latest.get(m.conceptId)} count={store?history(store,m.conceptId).length:0} reviewer={reviewer} onSave={save}/>)}
   <details className="mr-unmapped"><summary>{unmapped.length} concepts with no exact match</summary><p className="mr-hint">Mostly composite or study-specific concepts. No match is not evidence that no ontology term exists; a curator may map them by hand.</p><ul>{unmapped.map(m=><li key={m.conceptId}>{m.conceptName}</li>)}</ul></details>
   <p className="mr-foot"><Link to="/research/knowledge-graph">Back to the knowledge graph</Link></p>
  </div></div>;
}
