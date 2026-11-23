import {useCallback,useEffect,useRef,useState} from "react";
import {Link} from "react-router-dom";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {Icon} from "../components/home/AppIcons";
import {DATA_MODE_BANNER,EVIDENCE_STATE_LADDER,type LiteratureBrief} from "../../../src/literatureBriefCore";
import {checkRuns,downloadBrief,fetchRun,fetchVerifiedBrief,isSourceLink,RunError,startRun,type RunJob,type RunsAvailability} from "../lib/nexusFixtureClient";
import "../styles/research-home.css";
import "../styles/fixture-run.css";

const LADDER_LABEL:Record<string,string>={retrieved:"Retrieved",extracted:"Extracted",candidate:"Candidate",model_assessed:"Model-assessed",independently_reviewed:"Independently reviewed",approved:"Approved"};
const TERMINAL=new Set(["completed","failed","cancelled","dead_lettered"]);
const STATUS_TEXT:Record<RunJob["status"],string>={queued:"Queued, waiting for a worker",running:"Running",completed:"Completed",failed:"Failed",cancelled:"Cancelled",dead_lettered:"Stopped after repeated failures"};
const INVESTIGATION=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const msg=(e:unknown)=>e instanceof RunError?e.message:"Something went wrong. Nothing was changed.";

export function BriefView({brief}:{brief:LiteratureBrief}){
 return (
  <section className="rh-card" aria-labelledby="fr-brief-h" data-testid="brief-view">
   <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="layers" size={22}/></span><div><h2 id="fr-brief-h">Literature brief</h2><p className="rh-sub">Investigation {brief.investigationId}</p></div></header>
   <p className="fr-banner" role="note">{DATA_MODE_BANNER[brief.dataMode]}</p>
   <ul className="fr-chips" aria-label="Status labels">
    <li className="fr-chip">Research preview</li><li className="fr-chip">Search hits, not evidence</li><li className="fr-chip">All sources unreviewed</li><li className="fr-chip">No clinical use</li><li className="fr-chip">Not eligible for publication or the graph</li>
   </ul>
   <p className="fr-verify" role="status">Verified in your browser: the content hash matches and every state rule holds. Hash <span className="fr-mono">{brief.contentHash}</span></p>
   <h3>Where this brief sits on the evidence ladder</h3>
   <ol className="fr-ladder" aria-label="Evidence ladder">
    {EVIDENCE_STATE_LADDER.map(s=><li key={s} aria-current={s==="retrieved"?"step":undefined}>{LADDER_LABEL[s]}<small>{s==="retrieved"?"Every source here is at this state":s==="extracted"||s==="candidate"||s==="model_assessed"?(brief.claims.some(c=>c.state===s)?"Some claims reached this state":"No claim has reached this state"):"Needs a named human reviewer; cannot happen in this brief"}</small></li>)}
   </ol>
   <h3>Sources ({brief.sources.length})</h3>
   <ul className="fr-list" aria-label="Sources">
    {brief.sources.map(s=>(
     <li key={s.canonicalId} className="fr-item">
      <h4>{s.title??"Title not supplied"}</h4>
      <p className="fr-meta">{s.canonicalId} · DOI {s.doi??"not supplied"} · PMID {s.pmid??"not supplied"} · {s.publicationYear??"year not supplied"}</p>
      <p className="fr-meta">State: retrieved · Review status: unreviewed · Found by {s.providers.join(", ")}</p>
      {isSourceLink(s.sourceUrl)&&<p className="fr-meta"><a href={s.sourceUrl} target="_blank" rel="noopener noreferrer">Open the source record (external)</a></p>}
     </li>
    ))}
   </ul>
   <h3>Claims ({brief.claims.length})</h3>
   {brief.claims.length===0?<p className="rh-empty">No claims. No extraction has run, so this brief lists sources only.</p>:(
    <ul className="fr-list" aria-label="Claims">
     {brief.claims.map(c=>(
      <li key={c.claimId} className="fr-item"><h4>{c.statement}</h4>
       <p className="fr-meta">{c.claimId} · State: {LADDER_LABEL[c.state]} · Independently verified: no · Promotable: no · Source {c.sourceCanonicalId}</p>
       <p className="fr-meta">Context as supplied, not normalised: species {c.context.species??"not supplied"}; tissue {c.context.tissue??"not supplied"}; cell type {c.context.cellType??"not supplied"}; method {c.context.method??"not supplied"}</p></li>
     ))}
    </ul>
   )}
   <h3>Provenance</h3>
   <p className="rh-note">Audit log check: {brief.provenance.audit.status==="verified"?"verified against the gateway audit log":"not supplied"}. {brief.provenance.incomplete?"Incomplete: at least one provider did not answer.":"All providers answered."} Quarantined hits: {brief.provenance.quarantined}. Dropped hits: {brief.provenance.rejectedSources}.</p>
   <ul className="fr-list" aria-label="Provider receipts">
    {brief.provenance.receipts.map(r=><li key={r.provider} className="fr-item"><p className="fr-meta"><b>{r.provider}</b>: {r.ok?"answered":`did not answer (${r.code})`} · audit record {r.auditSeq}{r.replayed?" · replayed":""}</p>{r.responseHash&&<p className="fr-meta fr-mono">response {r.responseHash}</p>}</li>)}
   </ul>
   <h3>Limitations</h3>
   <ul>{brief.limitations.map(l=><li key={l}>{l}</li>)}</ul>
   <p><button type="button" className="rh-ghost" onClick={()=>downloadBrief(brief)}>Download verified brief (JSON)</button></p>
  </section>
 );
}

export function FixtureRunPage(){
 const [avail,setAvail]=useState<RunsAvailability|{state:"checking"}>({state:"checking"});
 const [investigationId,setInvestigationId]=useState(""),[termsText,setTermsText]=useState("");
 const [submitting,setSubmitting]=useState(false),[error,setError]=useState<string|null>(null);
 const [run,setRun]=useState<{jobId:string;investigationId:string}|null>(null),[job,setJob]=useState<RunJob|null>(null);
 const [brief,setBrief]=useState<LiteratureBrief|null>(null),[briefError,setBriefError]=useState<string|null>(null);
 const abort=useRef(new AbortController());
 useEffect(()=>{const c=new AbortController();abort.current=c;checkRuns(c.signal).then(a=>{if(!c.signal.aborted)setAvail(a)});return()=>c.abort()},[]);

 const terms=termsText.split("\n").map(t=>t.trim()).filter(Boolean);
 const termsOk=terms.length>=1&&terms.length<=8&&terms.every(t=>t.length<=160);
 const idOk=INVESTIGATION.test(investigationId.trim());

 const submit=useCallback(async(e:React.FormEvent)=>{
  e.preventDefault();if(submitting||!idOk||!termsOk)return;
  setSubmitting(true);setError(null);setBrief(null);setBriefError(null);setJob(null);
  try{const r=await startRun({investigationId:investigationId.trim(),terms},abort.current.signal);setRun({jobId:r.jobId,investigationId:investigationId.trim()})}
  catch(err){setError(msg(err))}finally{setSubmitting(false)}
 },[submitting,idOk,termsOk,investigationId,terms]);

 // Poll until the run is finished, then fetch and verify the brief. Everything is cancelled on unmount or a new run.
 useEffect(()=>{
  if(!run)return;const c=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  const tick=async()=>{
   try{
    const j=await fetchRun(run.jobId,c.signal);if(c.signal.aborted)return;setJob(j);
    if(j.status==="completed"&&j.briefAvailable){
     try{const b=await fetchVerifiedBrief(run.jobId,run.investigationId,c.signal);if(!c.signal.aborted)setBrief(b)}
     catch(err){if(!c.signal.aborted)setBriefError(msg(err))}
     return;
    }
    if(!TERMINAL.has(j.status))timer=setTimeout(tick,1500);
   }catch(err){if(!c.signal.aborted)setError(msg(err))}
  };
  tick();return()=>{c.abort();if(timer)clearTimeout(timer)};
 },[run]);

 const ready=avail.state==="ready";
 return (
  <ResearchAppShell where="Recorded fixture run" whereIcon="flask" active="investigations">
   <main className="rh-main" id="rh-main" tabIndex={-1}>
    <section className="rh-card" aria-labelledby="fr-h">
     <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="flask" size={22}/></span><div><h1 id="fr-h">Recorded fixture run</h1><p className="rh-sub">Runs the retrieval-to-brief path on recorded, synthetic responses.</p></div></header>
     <p className="fr-banner" role="note">No live provider is contacted. The records below are placeholders, not research findings, and nothing here is reviewed, approved or clinical advice.</p>
     {avail.state==="checking"&&<div className="rh-skel" aria-hidden="true"/>}
     {avail.state==="unavailable"&&<p className="rh-empty" role="status">Recorded runs are not available in this deployment. They need a worker host that is not part of the public site, and research writes must be enabled.</p>}
     {avail.state==="signin"&&<p className="rh-empty" role="status">Recorded runs need verified research access. <Link to="/research/account">Sign in or set up your research home</Link>.</p>}
     {avail.state==="error"&&<p className="rh-err" role="alert">The recorded-run service could not be checked. Nothing was changed.</p>}
     {ready&&<p className="rh-note fr-health rh-card" data-s={avail.health.status} role="status" style={{padding:"8px 12px"}}>Worker status: {avail.health.status}{avail.health.reasons.length>0&&` (${avail.health.reasons.join(", ").replace(/_/g," ")})`}. {avail.health.status==="down"&&"No worker is running, so a started run will wait in the queue."}</p>}
    </section>
    {ready&&<section className="rh-card" aria-labelledby="fr-start-h">
     <header className="rh-card-top"><div><h2 id="fr-start-h">Start a run</h2><p className="rh-sub">Use an investigation you own. Search terms are sent as written; the recorded results ignore them.</p></div></header>
     <form className="hl-form" onSubmit={submit} noValidate>
      <div className="hl-field"><label htmlFor="fr-inv">Investigation id</label><input id="fr-inv" type="text" autoComplete="off" value={investigationId} onChange={e=>setInvestigationId(e.target.value)} aria-invalid={investigationId!==""&&!idOk} aria-describedby="fr-inv-help"/><p id="fr-inv-help" className="rh-note">Letters, numbers, dots, colons, underscores and hyphens.</p></div>
      <div className="hl-field"><label htmlFor="fr-terms">Search terms, one per line (1 to 8)</label><textarea id="fr-terms" className="fr-textarea" value={termsText} onChange={e=>setTermsText(e.target.value)} aria-invalid={termsText!==""&&!termsOk}/></div>
      <p><button type="submit" className="rh-primary" disabled={submitting||!idOk||!termsOk}>{submitting?"Starting…":"Start recorded run"}</button></p>
     </form>
     {error&&<p className="rh-err" role="alert">{error}</p>}
    </section>}
    {run&&<section className="rh-card" aria-labelledby="fr-job-h" aria-live="polite">
     <header className="rh-card-top"><div><h2 id="fr-job-h">Run status</h2><p className="rh-sub fr-mono">{run.jobId}</p></div></header>
     {!job&&!error&&<div className="rh-skel" aria-hidden="true"/>}
     {job&&<>
      <p><b data-testid="run-status">{STATUS_TEXT[job.status]}</b>{job.attempts>1&&` · attempt ${job.attempts}`}{job.cancelRequested&&" · cancel requested"}</p>
      {job.status==="running"&&job.progress&&<p><progress className="fr-progress" max={job.progress.of} value={job.progress.step} aria-label="Run progress"/> Step {job.progress.step} of {job.progress.of}: {job.progress.stage.replace(/_/g," ")}</p>}
      {job.status==="failed"&&<p className="rh-err" role="alert">The run failed{job.errorCode?` (${job.errorCode})`:""}. It may be retried by the worker.</p>}
      {job.status==="dead_lettered"&&<p className="rh-err" role="alert">The run used all its attempts and will not run again. Start a new run.</p>}
      {job.status==="cancelled"&&<p className="rh-empty">This run was cancelled.</p>}
      {job.status==="completed"&&!job.briefAvailable&&<p className="rh-err" role="alert">The run completed but no brief is available. Nothing is shown.</p>}
     </>}
     {briefError&&<p className="rh-err" role="alert">{briefError}</p>}
    </section>}
    {brief&&<BriefView brief={brief}/>}
   </main>
  </ResearchAppShell>
 );
}
