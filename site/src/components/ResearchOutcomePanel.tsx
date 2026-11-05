import {printResearchDocument} from "../lib/printResearchDocument";
import {renderResearchOutcome} from "../../../src/researchOutcome";
import {useEffect,useState} from "react";
import type {EvidenceBrief} from "../../../src/investigationDelivery";
import type {ResearchOutcome} from "../../../src/researchOutcome";
import {fetchResearchOutcome,downloadResearchOutcome} from "../lib/researchOutcomeClient";
import "../styles/research-outcome.css";
function sourceUrl(value:string|null){try{const u=new URL(value??"");return u.protocol==="https:"&&!u.username&&!u.password?u.href:null}catch{return null}}
const human=(value:string)=>value.replaceAll("_"," ");
const tabs=["Overview","Mechanism & evidence","Questions & hypotheses","Next research & trials","Review & provenance"] as const;
export function ResearchOutcomePanel({brief}:{brief:EvidenceBrief}){
 const [outcome,setOutcome]=useState<ResearchOutcome|null>(null),[tab,setTab]=useState<typeof tabs[number]>("Overview"),[edgeId,setEdgeId]=useState(""),[message,setMessage]=useState(""),[attempt,setAttempt]=useState(0),[busy,setBusy]=useState(false);
 const key=brief.package.packageHash+":"+(brief.decision?.decisionHash??"");
 useEffect(()=>{
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);setOutcome(null);setMessage("Loading and verifying the saved research outcome…");
  fetchResearchOutcome(brief,controller.signal).then(o=>{if(!controller.signal.aborted){setOutcome(o);setEdgeId(o.mechanismMap.edges[0]?.id??"");setMessage("")}}).catch(()=>{if(!controller.signal.aborted)setMessage("The research outcome could not be verified. Refresh to check current evidence and access.")}).finally(()=>clearTimeout(timeout));
  const abort=()=>setMessage("The outcome request timed out. Refresh to retry.");controller.signal.addEventListener("abort",abort,{once:true});
  return()=>{controller.signal.removeEventListener("abort",abort);controller.abort();clearTimeout(timeout)};
 },[key,attempt]);
 async function download(format:"json"|"markdown"){if(!outcome||busy)return;setBusy(true);setMessage("");try{await downloadResearchOutcome(brief,outcome,format);setMessage("Verified research outcome downloaded.")}catch{setMessage("The download could not be verified. Refresh the outcome before retrying.")}finally{setBusy(false)}}
 async function print(){if(!outcome||busy)return;setBusy(true);setMessage("");try{const current=await fetchResearchOutcome(brief,AbortSignal.timeout(20000));if(current.outcomeHash!==outcome.outcomeHash)throw Error();printResearchDocument("Human Super Intelligence — research brief",renderResearchOutcome(current,"markdown"))}catch{setMessage("The current brief could not be verified for printing. Refresh and check access.")}finally{setBusy(false)}}
 const edge=outcome?.mechanismMap.edges.find(e=>e.id===edgeId);
 return <section className="research-outcome" aria-labelledby="outcome-heading">
  <div className="outcome-top"><div><p className="outcome-eyebrow">HUMAN SUPER INTELLIGENCE / RESEARCH</p><h3 id="outcome-heading">Unified research outcome</h3><p>One question. Connected evidence. Visible limits.</p></div><button type="button" onClick={()=>setAttempt(n=>n+1)} disabled={busy}>Refresh outcome</button></div>
  {message&&<p role="status">{message}</p>}
  {outcome&&<>
   <nav aria-label="Research outcome sections" className="outcome-navigation">{tabs.map(t=><button type="button" key={t} aria-pressed={t===tab} onClick={()=>setTab(t)}>{t}</button>)}</nav>
   <div className="outcome-content">
   {tab==="Overview"&&<><p className="outcome-eyebrow">{human(outcome.answer.evidenceStatus)}</p><h4>{outcome.question}</h4><p className="outcome-answer">{outcome.answer.summary}</p>
    <div className="outcome-facts"><article><h4>Confidence</h4><p>Not calibrated</p></article><article><h4>Data context</h4><p>{human(outcome.scope.sourceDisease)} research sources</p></article><article><h4>Human review</h4><p>{human(outcome.review.status)}</p></article></div>
    {outcome.scope.questionFit==="scope_review_required"&&<p role="note">This question needs scope review. The saved release cannot establish a patient-specific or cross-disease answer.</p>}
    <h4>What has been recorded</h4><ol className="outcome-stages">{outcome.stages.map(s=><li key={s.id}><strong>{human(s.id)} · {human(s.status)}</strong><p>{s.detail}</p></li>)}</ol>
    <details><summary>Answer limitations</summary><ul>{outcome.answer.limitations.map((l,i)=><li key={i}>{l}</li>)}</ul></details></>}
   {tab==="Mechanism & evidence"&&<><h4>Explore the source mechanism map</h4><p>Relationships from the primary release retain their biological context. They do not establish a causal chain or automatically support a candidate hypothesis.</p>
    <label htmlFor="outcome-edge">Select a relationship</label><select id="outcome-edge" value={edgeId} onChange={e=>setEdgeId(e.target.value)}>{outcome.mechanismMap.edges.map(e=><option key={e.id} value={e.id}>{outcome.mechanismMap.nodes.find(n=>n.id===e.subjectId)?.label??e.subjectId} → {e.predicate} → {outcome.mechanismMap.nodes.find(n=>n.id===e.objectId)?.label??e.objectId}</option>)}</select>
    {edge&&<><div className="outcome-mechanism" role="img" aria-label="Selected source relationship"><strong>{outcome.mechanismMap.nodes.find(n=>n.id===edge.subjectId)?.label??edge.subjectId}</strong><span>→ {human(edge.predicate)} →</span><strong>{outcome.mechanismMap.nodes.find(n=>n.id===edge.objectId)?.label??edge.objectId}</strong></div><p>Evidence type: {human(edge.epistemicType)}</p>
     {outcome.evidence.filter(c=>c.relationshipId===edge.id).map(c=><article className="outcome-evidence" key={c.claimId}><h4>{c.statement}</h4><p>Source review: {human(c.sourceHumanReview.status)} · {c.sourceHumanReview.reviewedAt}</p><p>Supports: {c.supportingBranchIds.join(", ")||"no branch assigned"}. Opposes: {c.opposingBranchIds.join(", ")||"no branch assigned"}. Semantic support requires expert assessment.</p>
      <dl className="outcome-context">{Object.entries(c.context).map(([k,v])=><div key={k}><dt>{human(k)}</dt><dd>{v??"Not recorded"}</dd></div>)}</dl>
      {c.passageIds.map(id=>{const p=outcome.passages.find(p=>p.id===id)!,s=outcome.sources.find(s=>s.id===p.sourceId)!;return <div key={id}><h5>{sourceUrl(s.url)?<a href={sourceUrl(s.url)!} target="_blank" rel="noopener noreferrer">{s.title} ↗</a>:s.title}</h5><blockquote>{p.text}</blockquote><p>{p.locator} · Source version {p.sourceVersion}</p><p>PMID: {s.pmid??"not recorded"} · DOI: {s.doi??"not recorded"}</p><p>Passage SHA-256: <code>{p.sha256}</code></p></div>})}</article>)}</>}
    <h4>Conflicting evidence</h4><p>{outcome.contradictions.note}</p><ul>{outcome.contradictions.recordedOpposingClaimIds.map(id=><li key={id}>{id}</li>)}</ul></>}
   {tab==="Questions & hypotheses"&&<><h4>Investigation question tree</h4><p>Recorded research questions, separate from clinical decision support.</p><ul>{outcome.decisionTree.questions.map(q=><li key={q.id}><strong>{q.text}</strong><p>{q.parentId?"Follow-up to "+outcome.decisionTree.questions.find(p=>p.id===q.parentId)?.text:"Root question"} · {q.purpose} · {q.status}</p></li>)}</ul>
    <h4>Testable candidate directions</h4>{outcome.hypotheses.map(b=><details key={b.id}><summary>{b.statement}</summary><p>{human(b.classification)} · {human(b.assessment)}</p><p>Falsification question: {b.falsificationCriteria}</p><p>Predicted observation, experiment and required controls: not specified in the saved record.</p><ul>{b.uncertainty.map((s,i)=><li key={i}>{s}</li>)}</ul></details>)}</>}
   {tab==="Next research & trials"&&<><h4>Missing evidence</h4><ul>{outcome.missingData.map((s,i)=><li key={i}>{s}</li>)}</ul><h4>Next research work</h4><p>These are research-planning tasks, not patient measurement orders.</p>{outcome.nextResearchSteps.map(s=><article key={s.branchId}><p>{s.falsificationQuestion}</p><p>{s.action}</p></article>)}<h4>Relevant clinical trials</h4><p>{outcome.trials.note}</p><p>No participant eligibility has been assessed.</p></>}
   {tab==="Review & provenance"&&<><h4>Independent human review</h4><p>{human(outcome.review.status)} · Evidence brief only</p><p>{outcome.review.rationale??"No independent brief decision is recorded."}</p><ul>{outcome.review.limitations.map((s,i)=><li key={i}>{s}</li>)}</ul><p>Review does not transfer approval to a hypothesis, graph publication or clinical use.</p>
    <h4>Reproducible source binding</h4><p>Release: {outcome.binding.releaseId} v{outcome.binding.releaseVersion}</p><p>Package SHA-256: <code>{outcome.binding.packageHash}</code></p><p>Outcome SHA-256: <code>{outcome.outcomeHash}</code></p><p>Method: {outcome.method}</p><ul>{outcome.provenance.methods.map((m,i)=><li key={i}>{m.agentId} v{m.version} · {m.modelVersion} · prompt {m.promptVersion} · {m.toolCallCount} recorded tool calls</li>)}</ul><p>This projection invokes no model and performs no new external search. A matching hash verifies the saved content, not scientific truth.</p></>}
   </div><div className="outcome-downloads"><button type="button" disabled={busy} onClick={()=>void print()}>Print / Save PDF</button><button type="button" disabled={busy} onClick={()=>void download("markdown")}>Download research outcome</button><button type="button" disabled={busy} onClick={()=>void download("json")}>Download outcome JSON</button></div><p className="outcome-disclaimer">{outcome.disclaimer}</p>
  </>}
 </section>;
}
