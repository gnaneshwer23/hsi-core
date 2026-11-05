import {useState} from "react";
import type {InterrogativeInvestigation} from "../../../src/interrogativeContracts";
import type {FalsificationReport} from "../../../src/interrogativeFalsificationEngine";
import "../styles/interrogative-workbench.css";

type View="conclusion"|"decision-tree"|"evidence-trace";
export type InterrogativeWorkbenchProps={
 investigation:InterrogativeInvestigation|null;
 falsification: FalsificationReport|null;
 sourceUrl?: (sourceId:string)=>string|null;
};
export function InterrogativeWorkbench({investigation,falsification,sourceUrl}:InterrogativeWorkbenchProps){
 const [view,setView]=useState<View>("decision-tree");
 const [selected,setSelected]=useState<string|null>(null);
 if(!investigation)return <section className="iw-shell" aria-label="HSI interrogative research workbench">
  <p className="iw-kicker">HSI RESEARCH / ARCH-003</p><h1>Explainable research decisions</h1>
  <p>Inspect the questions, evidence paths, uncertainty and falsification tests behind each investigation.</p>
  <div className="iw-empty" role="status"><h2>No authorised investigation loaded</h2><p>This workbench does not create evidence or display synthetic research conclusions. A verified researcher session, published HSI graph release and persisted investigation are required.</p><p>Scientific findings remain unavailable until evidence ingestion and accountable review are complete.</p></div>
 </section>;
 const branches=investigation.branches;
 const current=branches.find(b=>b.id===selected)??branches[0];
 const issues=falsification?.investigationId===investigation.id&&falsification.releaseManifestHash===investigation.release.manifestHash?falsification:null;
 const signals=issues?.signals.filter(s=>s.branchId===current?.id)??[];
 return <section className="iw-shell" aria-label="HSI interrogative research workbench">
  <p className="iw-kicker">HSI RESEARCH / ARCH-003 · {investigation.state.replaceAll("_"," ")}</p>
  <h1>Explainable research decisions</h1><p className="iw-question">{investigation.question}</p>
  <p className="iw-meta">Graph release: {investigation.release.id} · v{investigation.release.version} · Investigation: {investigation.id}</p>
  <details className="iw-meta"><summary>Release provenance</summary><p>Manifest SHA-256: {investigation.release.manifestHash}</p><p>Draft created: {investigation.createdAt} · Data class: {investigation.dataClass.replaceAll("_"," ")}</p></details>
  <p className="iw-notice">Research-only. Branches are candidate mechanisms, not clinical conclusions. Review status: {investigation.review?"Human review recorded":"Not scientifically reviewed"}.</p>
  <div className="iw-tabs" role="tablist" aria-label="Investigation views">
   {(["conclusion","decision-tree","evidence-trace"] as const).map(v=><button key={v} role="tab" aria-selected={view===v} onClick={()=>setView(v)}>{v==="decision-tree"?"Decision tree":v==="evidence-trace"?"Evidence trace":"Conclusion"}</button>)}
  </div>
  {view==="conclusion"&&<article className="iw-panel"><h2>Evidence-based assessment</h2><p>{investigation.conclusion.text}</p><p>Assessment: <strong>{investigation.conclusion.assessment.replaceAll("_"," ")}</strong></p><h3>Limitations</h3><ul>{investigation.conclusion.limitations.map((x,i)=><li key={i}>{x}</li>)}</ul></article>}
  {view==="decision-tree"&&<div className="iw-grid"><nav className="iw-panel" aria-label="Candidate mechanisms"><h2>Competing explanations</h2>{branches.length===0?<p>No branches available.</p>:branches.map(b=><button className="iw-branch" aria-current={current?.id===b.id?"true":undefined} key={b.id} onClick={()=>setSelected(b.id)}><strong>{b.statement}</strong><span>{b.assessment.replaceAll("_"," ")} · {b.supporting.length} supporting traces · {b.opposing.length} opposing traces</span></button>)}</nav><article className="iw-panel">{current?<><h2>{current.statement}</h2><p>Classification: {current.classification.replaceAll("_"," ")}</p><h3>Discriminating question</h3><p>{investigation.questions.find(q=>q.id===current.questionId)?.text??"No linked question"}</p><h3>Falsification test</h3><p>{current.falsificationTest}</p><h3>Missing evidence</h3><ul>{current.missingEvidence.map((x,i)=><li key={i}>{x}</li>)}</ul><h3>Uncertainty</h3><ul>{[...new Set([...current.uncertainty,...(issues?.branches.find(b=>b.branchId===current.id)?.uncertainties??[])])].map((x,i)=><li key={i}>{x}</li>)}</ul>{signals.length>0&&<><h3>Review signals</h3>{signals.map((s,i)=><p key={i}>{s.kind.replaceAll("_"," ")}: {s.rationale}</p>)}</>}</>:<p>Select a branch.</p>}</article></div>}
  {view==="evidence-trace"&&<div className="iw-panel"><h2>Source-linked evidence</h2>{branches.every(b=>!b.supporting.length&&!b.opposing.length)?<p>No approved evidence traces available. Absence of evidence is not evidence against a mechanism.</p>:branches.map(b=><section key={b.id} className="iw-trace"><h3>{b.statement}</h3>{([...b.supporting,...b.opposing]).map((e,i)=><article key={e.claimId+":"+i}><p><strong>{e.polarity}</strong> · {e.evidenceKind.replaceAll("_"," ")} · Claim {e.claimId}</p><p>Graph path: {e.graphPath.join(" → ")}</p><p>Scientific review: {e.reviewDecisionId}</p><p>Context: {JSON.stringify(e.context)}</p><p>Sources: {e.sourceIds.map((s,j)=>{const url=sourceUrl?.(s);return <span key={s}>{j>0?", ":""}{url?<a href={url} target="_blank" rel="noopener noreferrer">{s}</a>:s}</span>})}</p></article>)}</section>)}</div>}
 </section>;
}
