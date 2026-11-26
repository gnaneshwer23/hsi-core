import {useState} from "react";
import {STATUS_META} from "../components/atlas/atlasData";
import {Status} from "../onboarding/ui";
import {EvidenceTag,WorkspaceFrame} from "./Frame";
import {
 CONTEXT_FIELDS,EMPTY_DRAFT,LIFECYCLE,MIN_RATIONALE,QUEUE,blockers,claimById,completeness,contextGaps,decided,disagreementCount,hasDisagreement,pendingCount,record,sourceCheckCount,
 type Decision,type Draft,type LogEntry,type ReviewClaim,
} from "./reviewLogic";

const DECISIONS:{id:Decision;label:string}[]=[{id:"approve",label:"Approve"},{id:"revise",label:"Request revision"},{id:"reject",label:"Reject"},{id:"abstain",label:"Abstain"}];
const VERDICT:Record<string,string>={supports:"Supports",disagrees:"Disagrees",insufficient:"Insufficient evidence"};

export default function Reviewer(){
 const [sel,setSel]=useState<string>(QUEUE[0]!.id);
 const [draft,setDraft]=useState<Draft>(EMPTY_DRAFT);
 const [log,setLog]=useState<readonly LogEntry[]>([]);
 const [shown,setShown]=useState(false);
 const c:ReviewClaim=claimById[sel]!;
 const gaps=contextGaps(c),comp=completeness(c),dis=hasDisagreement(c);
 const stop=blockers(c,draft);
 const pick=(id:string)=>{setSel(id);setDraft(EMPTY_DRAFT);setShown(false)};
 const submit=()=>{const next=record(log,c,draft);if(next!==log){setLog(next);setDraft(EMPTY_DRAFT)}};

 return (
  <WorkspaceFrame persona={null} profile={null} panels={[]}>
   <p className="ws-eyebrow">Scientific governance</p>
   <h1 className="ws-title">Evidence review workspace</h1>
   <p className="ws-lede">Reviewers are assigned by an organisation; choosing a role during setup never grants this view. Everything below is a synthetic queue, and no decision here is recorded on a server or promotes anything.</p>

   <ul className="rv-stats" aria-label="Queue summary (synthetic)">
    <li><b>{pendingCount(log)}</b><span>Pending review</span></li>
    <li><b>{disagreementCount()}</b><span>Disagreements</span></li>
    <li><b>{sourceCheckCount()}</b><span>Source checks not connected</span></li>
   </ul>

   <div className="rv-grid">
    <section className="ws-panel" aria-labelledby="rv-q"><header><h2 id="rv-q">Review queue</h2></header>
     <ul className="ws-rows rv-queue">{QUEUE.map(q=>{const d=decided(log,q.id);return (
      <li key={q.id}><button type="button" aria-pressed={sel===q.id} onClick={()=>pick(q.id)}><b>{q.id}</b> {q.statement.split(":")[0]}</button>
       <span className="rv-meta"><EvidenceTag s={q.status}/>{hasDisagreement(q)&&<span className="ws-pill">disagreement</span>}{d&&<span className="ws-pill">decided: {d}</span>}</span></li>);})}
     </ul>
    </section>

    <section className="ws-panel" aria-labelledby="rv-claim"><header><h2 id="rv-claim">Claim under review</h2></header>
     <p className="ws-badge">Synthetic claim from the illustrative atlas · review required before promotion</p>
     <p className="rv-statement">{c.statement}</p>
     <dl className="ws-dl">
      <div><dt>Current status</dt><dd><EvidenceTag s={c.status}/> {STATUS_META[c.status].gloss}</dd></div>
      <div><dt>Source provenance</dt><dd>No passage was retrieved in this sample. <button type="button" className="ob-link" aria-expanded={shown} onClick={()=>setShown(!shown)}>{shown?"Hide":"Inspect"} evidence slot</button>
       {shown&&<span className="rv-slot">A real review shows the study, the exact passage and how the direction was checked. This sample has none, so nothing can be approved on it as evidence.</span>}</dd></div>
      <div><dt>Corrections and retractions</dt><dd>Check not connected <Status s="Planned"/></dd></div>
     </dl>

     <h3 className="ws-h3">Experimental context · {comp.have} of {comp.of} fields</h3>
     <div className="rv-meter" role="meter" aria-valuemin={0} aria-valuemax={comp.of} aria-valuenow={comp.have} aria-label={`Context completeness: ${comp.have} of ${comp.of}`}><i style={{width:`${(comp.have/comp.of)*100}%`}}/></div>
     <ul className="ws-rows">{CONTEXT_FIELDS.map(f=><li key={f}><strong>{f}</strong><span>{c.context[f]??"Not stated in the source. Not filled in."}</span></li>)}</ul>

     <h3 className="ws-h3">Independent assessments (illustrative)</h3>
     <ul className="ws-rows">{c.assessments.map(a=><li key={a.assessor} data-verdict={a.verdict}><strong>{a.assessor}: {VERDICT[a.verdict]}</strong><span>{a.note}</span></li>)}</ul>
     {dis&&<p className="ws-note">The assessments disagree. This is shown, not averaged away.</p>}

     <h3 className="ws-h3">Version history</h3>
     <ol className="ws-plain">{c.versions.map(v=><li key={v.v}>v{v.v}: {v.change}</li>)}</ol>
    </section>

    <section className="ws-panel" aria-labelledby="rv-dec"><header><h2 id="rv-dec">Decision</h2></header>
     <div role="radiogroup" aria-label="Decision" className="ws-seg">{DECISIONS.map(d=><button key={d.id} type="button" role="radio" aria-checked={draft.decision===d.id} onClick={()=>setDraft({...draft,decision:d.id})}>{d.label}</button>)}</div>
     <label className="ws-field rv-field"><span>Rationale {draft.decision==="abstain"?"(optional)":`(at least ${MIN_RATIONALE} characters)`}</span>
      <textarea rows={4} value={draft.rationale} maxLength={600} onChange={e=>setDraft({...draft,rationale:e.target.value})} aria-describedby="rv-help"/></label>
     {draft.decision==="approve"&&(gaps.length>0||dis)&&<fieldset className="rv-ack"><legend>To approve, acknowledge:</legend>
      {gaps.length>0&&<label><input type="checkbox" checked={draft.ackGaps} onChange={e=>setDraft({...draft,ackGaps:e.target.checked})}/> Context is incomplete: {gaps.join(", ")}</label>}
      {dis&&<label><input type="checkbox" checked={draft.ackDisagreement} onChange={e=>setDraft({...draft,ackDisagreement:e.target.checked})}/> Independent assessments disagree</label>}
     </fieldset>}
     <p id="rv-help" className="ws-sub" role="status">{stop.length?stop.join(" "):"Ready to record locally."}</p>
     <button type="button" className="ws-btn ws-btn-primary" disabled={stop.length>0} onClick={submit}>Record decision locally</button>

     <h3 className="ws-h3">Lifecycle</h3>
     <ol className="rv-life">{LIFECYCLE.map(l=><li key={l.id} data-off={l.id==="promoted"}><b>{l.label}</b><span>{l.note}</span></li>)}</ol>
    </section>

    <section className="ws-panel" aria-labelledby="rv-log"><header><h2 id="rv-log">Audit log (this page only)</h2></header>
     <p className="ws-sub">Append-only: entries can be added, never edited or removed. Not stored on a server.</p>
     {log.length?<ol className="ws-rows" aria-label="Decisions">{log.map(l=><li key={l.n}><strong>#{l.n} · {l.claimId} · {l.decision} · v{l.version}</strong><span>{l.rationale||"No rationale (abstained)."}{l.gaps.length?` Context gaps at decision: ${l.gaps.join(", ")}.`:""}{l.disagreement?" Assessments disagreed.":""}</span></li>)}</ol>:<p className="ws-sub">No decisions yet.</p>}
    </section>
   </div>
  </WorkspaceFrame>
 );
}
