import {useEffect,useMemo,useState} from "react";
import {Link,useSearchParams} from "react-router-dom";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {appendAudit,emptyAudit,verifyAudit,type AuditLog} from "../../../src/clinicalPlane/auditChain";
import {evaluateCohort,labelOf,validateDefinition,type CohortAggregate,type PhenotypeDefinition,type PlanePatient} from "../../../src/clinicalPlane/phenotype";
import {release,type Approval,type RefusalReason,type ReleaseRequest,type ReleasedFinding} from "../../../src/clinicalPlane/releaseGate";
import {DEFINITION_REGISTRY} from "../../../src/clinicalPlane/definitions";
import {addCohortObservation} from "../../../src/investigation/hypothesisLedger";
import {useLedger} from "../lib/useLedger";
import {loadDomainGraph} from "../lib/claimGraphClient";
import {loadSyntheticCohort} from "../lib/syntheticCohortClient";
import {SOURCES,generatedCohort,type CohortSource} from "../lib/cohortSource";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {Icon} from "../components/home/AppIcons";
import "../styles/research-home.css";

const WHY:Record<RefusalReason,string>={
 invalid_request:"The request was incomplete or did not match the definition.",real_data_not_enabled:"Only synthetic data can be released until real data is enabled.",
 row_level_payload:"The payload contained an identifier or a record. Only aggregates may leave.",phi_marker:"The payload contained a protected-information marker.",
 approval_required:"A release reviewer must approve before anything leaves.",approval_rejected:"The reviewer declined.",same_person:"The requester cannot approve their own release.",role_not_authorised:"That role cannot approve releases.",
};
const cell=(v:number|null|undefined)=>v===null||v===undefined?<span className="co-sup" title="Suppressed to protect small groups">suppressed</span>:v;
const REQUESTER="researcher-demo",REVIEWER:Approval={approverId:"reviewer-demo",role:"release_reviewer",decision:"approve",at:""};

export function CohortPlanePage(){
 const [dataset,setPatients]=useState<PlanePatient[]|null>(null),[source,setSource]=useState<CohortSource>("dataset"),[bundle,setBundle]=useState<DomainBundle|null>(null),[err,setErr]=useState(""),[params]=useSearchParams(),[defId,setDefId]=useState(()=>DEFINITION_REGISTRY.find(d=>d.id===params.get("definition"))?.id??DEFINITION_REGISTRY[0]!.id),ledger=useLedger(),[recorded,setRecorded]=useState(""),[audit,setAudit]=useState<AuditLog>(emptyAudit()),
  [agg,setAgg]=useState<CohortAggregate|null>(null),[finding,setFinding]=useState<ReleasedFinding|null>(null),[msg,setMsg]=useState<{ok:boolean;text:string}|null>(null),[tamper,setTamper]=useState(false);
 useEffect(()=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),15000);
  loadSyntheticCohort(c.signal).then(setPatients).catch(()=>{if(!c.signal.aborted)setErr("The synthetic cohort could not be loaded or verified. Nothing is shown.")});
  loadDomainGraph(null,c.signal).then(setBundle).catch(()=>{}).finally(()=>clearTimeout(t));return()=>{c.abort();clearTimeout(t)}},[]);
 const patients=source==="generated"?generatedCohort():dataset,srcNote=SOURCES.find(x=>x.id===source)!;
 const def=useMemo<PhenotypeDefinition|null>(()=>{if(!bundle)return null;const d=(DEFINITION_REGISTRY.find(x=>x.id===defId)??DEFINITION_REGISTRY[0]!).build(bundle.version);const v=validateDefinition(d);return v.ok?v.def:null},[bundle,defId]);
 const gap=def&&bundle?bundle.gaps.find(g=>g.id===def.origin.ref):null;
 const ids=useMemo(()=>({matched:[] as string[]}),[]);
 const reset=()=>{setAgg(null);setFinding(null);setMsg(null);setRecorded("")};
 const hyp=ledger.ledger[params.get("hypothesis")??""]??null;
 const record=()=>{if(!hyp||!finding||!def)return;const r=addCohortObservation(hyp,{definitionId:def.id,definitionTitle:def.title,graphVersion:finding.graphVersion,aggregateDigest:finding.aggregateDigest,evaluated:finding.aggregate.counts.evaluated,matched:finding.aggregate.counts.matched,suppressedCells:finding.aggregate.suppression.cellsSuppressed,dataClass:finding.dataClass},new Date().toISOString());if(!r.ok){setRecorded(r.error);return}ledger.update(hyp.id,()=>r.entry);setRecorded("Attached to your hypothesis as a synthetic observation. It is not evidence and did not change the hypothesis status.")};
 const evaluate=()=>{if(!def||!patients)return;const r=evaluateCohort(def,patients);ids.matched=r.matchedIds;setAgg(r.aggregate);setFinding(null);setMsg(null);
  setAudit(a=>appendAudit(a,{at:new Date().toISOString(),actor:REQUESTER,action:"cohort_evaluated",subject:def.id,detail:`${r.aggregate.counts.matched} matched of ${r.aggregate.counts.evaluated} (${srcNote.label}); aggregate only held`}))};
 const attempt=(kind:"noapproval"|"approved"|"rowlevel")=>{
  if(!def||!agg)return;const now=new Date().toISOString();
  const request:ReleaseRequest={definitionId:def.id,requestedBy:REQUESTER,purpose:"Illustrative synthetic cohort exploration",dataClass:"synthetic"};
  const payload=kind==="rowlevel"?({...agg,matchedIds:ids.matched.slice(0,3)} as unknown as CohortAggregate):agg;
  const r=release({request,graphVersion:bundle!.version,aggregate:payload,approval:kind==="noapproval"?null:{...REVIEWER,at:now},audit,now});
  setAudit(r.audit);setTamper(false);
  if(r.ok){setFinding(r.finding);setMsg({ok:true,text:"Released. The reviewer approved and the aggregate crossed the gate."})}
  else{setMsg({ok:false,text:"Refused: "+WHY[r.reason]});if(kind==="rowlevel")setFinding(null)}
 };
 const shown:AuditLog=tamper&&audit.entries.length>0?{entries:audit.entries.map((e,i)=>i===0?{...e,detail:e.detail+" (edited)"}:e)}:audit;
 const broken=verifyAudit(shown);
 const rel=finding?.aggregate;
 return (
  <ResearchAppShell where="Cohort (synthetic)" whereIcon="shield" active="cohort">
   <main className="rh-main" id="rh-main" tabIndex={-1}>
    <p className="co-banner" role="note"><b>Synthetic data only.</b> These are generated profiles, not patients. Definitions are illustrative and not clinically validated. Reviewer and requester are simulated in your browser, and nothing is stored or sent.</p>
    <section className="rh-card" aria-labelledby="co-h">
     <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="shield" size={22}/></span><div><h1 id="co-h">Cohort exploration through a governed release gate</h1><p className="rh-sub">A definition from the scientific side is evaluated inside a separate plane over synthetic profiles. Only a small-group-protected aggregate can come back, and only after a different person approves.</p></div></header>
     {err&&<p className="rh-err" role="alert">{err}</p>}
     {!patients&&!err&&<div className="rh-skel" aria-hidden="true"/>}
    </section>

    {hyp&&<p className="co-ctx" role="note">Exploring for your hypothesis: <b>{hyp.statement}</b> · <Link to="/research/ledger">back to the ledger</Link>{hyp.cohortDefinitionId&&hyp.cohortDefinitionId!==defId&&<> · This hypothesis is linked to a different definition, so a result from this one cannot be attached.</>}</p>}
    <section className="rh-card" aria-labelledby="co-src-h">
     <h2 id="co-src-h">Synthetic cohort</h2>
     <div className="rh-choices co-defs" role="group" aria-label="Choose a synthetic cohort">{SOURCES.map(s=><button key={s.id} type="button" aria-pressed={source===s.id} onClick={()=>{setSource(s.id);reset()}}>{s.label}</button>)}</div>
     <p className="rh-note">{srcNote.note}</p>
    </section>
    <section className="rh-card" aria-labelledby="co-def-h">
     <h2 id="co-def-h">1. Definition</h2>
     <div className="rh-choices co-defs" role="group" aria-label="Choose a definition">
      {DEFINITION_REGISTRY.map(d=><button key={d.id} type="button" aria-pressed={defId===d.id} onClick={()=>{setDefId(d.id);reset()}}>{d.label}</button>)}
     </div>
     {def?<>
      <p><b>{def.title}</b></p>
      <p className="rh-note">Linked to graph gap {gap?<>“{gap.question}”</>:def.origin.ref} · graph {def.origin.graphVersion.slice(0,8)} · {def.note}</p>
      <div className="co-crit"><div><h3>Include all of</h3><ul>{def.include.map(c=><li key={labelOf(c)}>{labelOf(c)}</li>)}</ul></div><div><h3>Exclude any of</h3><ul>{def.exclude.map(c=><li key={labelOf(c)}>{labelOf(c)}</li>)}</ul></div></div>
     </>:<p className="rh-note">{bundle?"The definition could not be validated.":"Loading the published graph…"}</p>}
    </section>

    <section className="rh-card" aria-labelledby="co-ev-h">
     <h2 id="co-ev-h">2. Inside the plane</h2>
     <p className="rh-note">Patient-level records are used here and never displayed. Each criterion is met, not met or unknown; people who might still qualify are counted as indeterminate, not dropped.</p>
     <div className="rh-row"><button type="button" className="rh-primary" disabled={!def||!patients} onClick={evaluate}>Evaluate cohort{patients?` (${patients.length} synthetic profiles)`:""}</button></div>
     {agg&&<div role="status" aria-live="polite">
      <p className="rh-note">Held inside the plane, not released: matched {agg.counts.matched}, excluded {agg.counts.excluded}, indeterminate {agg.counts.indeterminate}, of {agg.counts.evaluated}.</p>
      <div className="co-tablewrap"><table className="co-table"><caption>Criterion attrition (inside the plane)</caption><thead><tr><th scope="col">Criterion</th><th scope="col">Met</th><th scope="col">Not met</th><th scope="col">Unknown</th></tr></thead><tbody>{agg.attrition.map(r=><tr key={r.kind+r.label}><th scope="row">{r.kind==="exclude"?"Exclude: ":""}{r.label}</th><td>{r.counts.met}</td><td>{r.counts.notMet}</td><td>{r.counts.unknown}</td></tr>)}</tbody></table></div>
     </div>}
    </section>

    <section className="rh-card" aria-labelledby="co-gate-h">
     <h2 id="co-gate-h">3. Release gate</h2>
     <p className="rh-note">Nothing leaves except through the gate. It refuses identifiers and records, non-synthetic data, a missing approval, self-approval and unauthorised roles, hides small groups, and records every outcome.</p>
     <div className="rh-row co-actions">
      <button type="button" className="rh-ghost" disabled={!agg} onClick={()=>attempt("noapproval")}>Request release without approval</button>
      <button type="button" className="rh-ghost" disabled={!agg} onClick={()=>attempt("rowlevel")}>Attempt to release patient ids</button>
      <button type="button" className="rh-primary" disabled={!agg} onClick={()=>attempt("approved")}>Release with reviewer approval (simulated)</button>
     </div>
     <div role="status" aria-live="polite">{msg&&<p className={msg.ok?"co-ok":"rh-err"}>{msg.text}</p>}</div>
     {rel&&finding&&<div className="co-released">
      <h3>Released aggregate</h3>
      <p className="rh-note">Groups smaller than {rel.smallCellThreshold} are shown as suppressed; {rel.suppression.complementary>0?`${rel.suppression.complementary} further cells were also hidden so none can be worked out by subtraction. `:""}Digest {finding.aggregateDigest.slice(0,16)}. Synthetic, not reviewed, no clinical advice.</p>
      <dl className="co-counts"><div><dt>Evaluated</dt><dd>{cell(rel.counts.evaluated)}</dd></div><div><dt>Matched</dt><dd>{cell(rel.counts.matched)}</dd></div><div><dt>Excluded</dt><dd>{cell(rel.counts.excluded)}</dd></div><div><dt>Indeterminate</dt><dd>{cell(rel.counts.indeterminate)}</dd></div></dl>
      <div className="co-tablewrap"><table className="co-table"><caption>Matched by sex and by condition</caption><thead><tr><th scope="col">Group</th><th scope="col">Matched</th></tr></thead><tbody>{Object.entries(rel.matchedBySex).map(([k,v])=><tr key={"s"+k}><th scope="row">Sex: {k}</th><td>{cell(v)}</td></tr>)}{Object.entries(rel.matchedByCondition).map(([k,v])=><tr key={"c"+k}><th scope="row">{k}</th><td>{cell(v)}</td></tr>)}</tbody></table></div>
      <div className="co-tablewrap"><table className="co-table"><caption>Laboratory summary of matched profiles</caption><thead><tr><th scope="col">Test</th><th scope="col">n</th><th scope="col">Median</th><th scope="col">IQR</th></tr></thead><tbody>{rel.labSummary.map(l=><tr key={l.test}><th scope="row">{l.test}</th><td>{cell(l.n)}</td><td>{cell(l.median)}</td><td>{l.p25===null||l.p75===null?cell(null):`${l.p25} to ${l.p75}`}</td></tr>)}</tbody></table></div>
     </div>}
     {finding&&<div className="co-attach"><h3>Use this result</h3>
      {hyp?<><p className="rh-note">Attach the released aggregate to your hypothesis as an illustration. It does not change the hypothesis status or set an outcome, and synthetic data is not evidence.</p><div className="rh-row"><button type="button" className="rh-ghost" onClick={record} disabled={hyp.cohortDefinitionId!==defId}>Attach to “{hyp.statement.slice(0,60)}{hyp.statement.length>60?"…":""}”</button></div></>:<p className="rh-note">Open this page from a hypothesis in <Link to="/research/ledger">your ledger</Link> to attach a released result to it.</p>}
      <div role="status" aria-live="polite">{recorded&&<p className="rh-note">{recorded}</p>}</div></div>}
    </section>

    <section className="rh-card" aria-labelledby="co-au-h">
     <h2 id="co-au-h">4. Audit trail</h2>
     <p className="rh-note">Append-only and hash-chained. Each entry includes the previous entry’s hash, so any edit, deletion or reordering breaks the chain.</p>
     <p role="status" className={broken===null?"co-ok":"rh-err"}>{audit.entries.length===0?"No entries yet.":broken===null?"Chain verifies.":`Chain broken at entry ${broken}.`}</p>
     <div className="rh-row"><button type="button" className="rh-ghost" disabled={audit.entries.length===0} aria-pressed={tamper} onClick={()=>setTamper(t=>!t)}>{tamper?"Undo simulated tampering":"Simulate tampering with entry 1"}</button></div>
     {audit.entries.length>0&&<div className="co-tablewrap"><table className="co-table"><caption>Audit entries</caption><thead><tr><th scope="col">#</th><th scope="col">Action</th><th scope="col">Actor</th><th scope="col">Detail</th><th scope="col">Hash</th></tr></thead><tbody>{shown.entries.map(e=><tr key={e.seq}><td>{e.seq}</td><td>{e.action}</td><td>{e.actor}</td><td>{e.detail}</td><td><code>{e.hash.slice(0,10)}</code></td></tr>)}</tbody></table></div>}
    </section>
    <p className="rh-note">How this connects to the research side: <Link to="/research/gaps">the Gap Register</Link>. Real patient data stays out until governance approvals exist.</p>
   </main>
  </ResearchAppShell>
 );
}
