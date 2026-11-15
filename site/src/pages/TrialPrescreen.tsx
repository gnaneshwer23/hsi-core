import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {appendAudit,emptyAudit,verifyAudit,type AuditLog} from "../../../src/clinicalPlane/auditChain";
import {evaluateCohort,validateDefinition,type CohortAggregate,type PlanePatient} from "../../../src/clinicalPlane/phenotype";
import {release,type Approval,type RefusalReason,type ReleaseRequest} from "../../../src/clinicalPlane/releaseGate";
import {TRIALS,criterionLabel,summarisePrescreen,trialDefinition,type PrescreenSummary} from "../../../src/clinicalPlane/trials";
import {loadDomainGraph} from "../lib/claimGraphClient";
import {loadSyntheticCohort} from "../lib/syntheticCohortClient";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {Icon} from "../components/home/AppIcons";
import "../styles/research-home.css";

const WHY:Record<RefusalReason,string>={invalid_request:"The request was incomplete.",real_data_not_enabled:"Only synthetic data can be released.",row_level_payload:"The payload contained an identifier or a record.",phi_marker:"The payload contained a protected-information marker.",approval_required:"A release reviewer must approve before anything leaves.",approval_rejected:"The reviewer declined.",same_person:"The requester cannot approve their own release.",role_not_authorised:"That role cannot approve releases."};
const cell=(v:number|null)=>v===null?<span className="co-sup" title="Hidden to protect small groups">hidden</span>:v;
const REQUESTER="coordinator-demo",REVIEWER:Approval={approverId:"reviewer-demo",role:"release_reviewer",decision:"approve",at:""};

export function TrialPrescreenPage(){
 const [patients,setPatients]=useState<PlanePatient[]|null>(null),[bundle,setBundle]=useState<DomainBundle|null>(null),[err,setErr]=useState(""),[trialId,setTrialId]=useState(TRIALS[0]!.id),
  [audit,setAudit]=useState<AuditLog>(emptyAudit()),[agg,setAgg]=useState<CohortAggregate|null>(null),[summary,setSummary]=useState<PrescreenSummary|null>(null),[msg,setMsg]=useState<{ok:boolean;text:string}|null>(null);
 useEffect(()=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),15000);
  loadSyntheticCohort(c.signal).then(setPatients).catch(()=>{if(!c.signal.aborted)setErr("The synthetic cohort could not be loaded or verified. Nothing is shown.")});
  loadDomainGraph(null,c.signal).then(setBundle).catch(()=>{}).finally(()=>clearTimeout(t));return()=>{c.abort();clearTimeout(t)}},[]);
 const trial=TRIALS.find(t=>t.id===trialId)!;
 const def=useMemo(()=>{if(!bundle)return null;const v=validateDefinition(trialDefinition(trial,bundle.version));return v.ok?v.def:null},[bundle,trial]);
 const reset=()=>{setAgg(null);setSummary(null);setMsg(null)};
 const run=()=>{if(!def||!patients)return;const r=evaluateCohort(def,patients);setAgg(r.aggregate);setSummary(null);setMsg(null);
  setAudit(a=>appendAudit(a,{at:new Date().toISOString(),actor:REQUESTER,action:"prescreen_evaluated",subject:def.id,detail:"Computable criteria evaluated inside the plane; counts held, nothing released"}))};
 const attempt=(approved:boolean)=>{
  if(!def||!agg||!bundle)return;const now=new Date().toISOString();
  const request:ReleaseRequest={definitionId:def.id,requestedBy:REQUESTER,purpose:"Illustrative synthetic trial pre-screening feasibility",dataClass:"synthetic"};
  const r=release({request,graphVersion:bundle.version,aggregate:agg,approval:approved?{...REVIEWER,at:now}:null,audit,now});
  setAudit(r.audit);
  if(r.ok){setSummary(summarisePrescreen(r.finding.aggregate,trial));setMsg({ok:true,text:"Released. A reviewer approved the aggregate; no individual record left the plane."})}
  else setMsg({ok:false,text:"Refused: "+WHY[r.reason]});
 };
 const broken=verifyAudit(audit);
 return (
  <ResearchAppShell where="Trial pre-screening (synthetic)" whereIcon="shield" active="prescreen">
   <main className="rh-main" id="rh-main" tabIndex={-1}>
    <p className="co-banner" role="note"><b>Synthetic data and illustrative trials only.</b> This is pre-screening support for a clinical research team, not an eligibility decision. It uses no AI model. A person must review every candidate and the full record, and the clinical team, not this tool, approaches any patient.</p>
    <section className="rh-card" aria-labelledby="ps-h">
     <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="shield" size={22}/></span><div><h1 id="ps-h">Trial pre-screening</h1><p className="rh-sub">Compare a trial’s criteria with synthetic profiles. Criteria a computer can read are checked; criteria that need judgement are listed for a person. “Not enough information” is a result, and a count is only released through the gate.</p></div></header>
     {err&&<p className="rh-err" role="alert">{err}</p>}
     {!patients&&!err&&<div className="rh-skel" aria-hidden="true"/>}
    </section>

    <section className="rh-card" aria-labelledby="ps-t-h">
     <h2 id="ps-t-h">1. Trial</h2>
     <div className="rh-choices co-defs" role="group" aria-label="Choose a trial">{TRIALS.map(t=><button key={t.id} type="button" aria-pressed={trialId===t.id} onClick={()=>{setTrialId(t.id);reset()}}>{t.area}: {t.title.replace(/^Illustrative phase \d: /,"").slice(0,48)}</button>)}</div>
     <p><b>{trial.title}</b></p>
     <p className="rh-note">{trial.phase} · target enrolment {trial.targetEnrollment} · {trial.note}</p>
     <div className="co-crit">
      <div><h3>Checked by computer (include all)</h3><ul>{trial.include.map(c=><li key={criterionLabel(c)}>{criterionLabel(c)}</li>)}</ul></div>
      <div><h3>Checked by computer (exclude any)</h3><ul>{trial.exclude.map(c=><li key={criterionLabel(c)}>{criterionLabel(c)}</li>)}</ul></div>
      <div><h3>Needs a person</h3><ul>{trial.humanReview.map(t=><li key={t}>{t}</li>)}</ul></div>
     </div>
    </section>

    <section className="rh-card" aria-labelledby="ps-e-h">
     <h2 id="ps-e-h">2. Pre-screen inside the plane</h2>
     <p className="rh-note">Individual profiles are checked here and never shown. Nothing is counted for you until it passes the release gate.</p>
     <div className="rh-row"><button type="button" className="rh-primary" disabled={!def||!patients} onClick={run}>Pre-screen{patients?` ${patients.length} synthetic profiles`:""}</button></div>
     {agg&&<p className="rh-note" role="status">Done. The counts are held inside the plane until a reviewer approves their release.</p>}
    </section>

    <section className="rh-card" aria-labelledby="ps-g-h">
     <h2 id="ps-g-h">3. Release gate</h2>
     <div className="rh-row co-actions">
      <button type="button" className="rh-ghost" disabled={!agg} onClick={()=>attempt(false)}>Request counts without approval</button>
      <button type="button" className="rh-primary" disabled={!agg} onClick={()=>attempt(true)}>Release with reviewer approval (simulated)</button>
     </div>
     <div role="status" aria-live="polite">{msg&&<p className={msg.ok?"co-ok":"rh-err"}>{msg.text}</p>}</div>
     {summary&&<div className="co-released">
      <h3>Pre-screening result</h3>
      <dl className="co-counts">{summary.categories.map(c=><div key={c.key}><dt>{c.label}</dt><dd>{cell(c.count)}</dd></div>)}</dl>
      <p className="rh-note">{summary.evaluated===null?"The number evaluated is hidden.":`${summary.evaluated} synthetic profiles evaluated.`} {summary.feasibility.text}</p>
      <ul className="tw-obs">{summary.notes.map(n=><li key={n}>{n}</li>)}</ul>
      <h3>What is excluding most profiles</h3>
      {summary.blockers.length===0?<p className="rh-note">No criterion count is available to show.</p>:<div className="co-tablewrap"><table className="co-table"><caption>Criteria that exclude the most profiles</caption><thead><tr><th scope="col">Criterion</th><th scope="col">Profiles it excludes</th></tr></thead><tbody>{summary.blockers.map(b=><tr key={b.label}><th scope="row">{b.kind==="exclude"?"Exclusion: ":""}{b.label}</th><td>{b.count}</td></tr>)}</tbody></table></div>}
      {summary.blockersWithheld>0&&<p className="rh-note">{summary.blockersWithheld} criterion counts are hidden to protect small groups.</p>}
      <h3>Still needs a person</h3>
      <ul>{summary.humanReview.map(h=><li key={h}>{h}</li>)}</ul>
     </div>}
    </section>

    <section className="rh-card" aria-labelledby="ps-a-h">
     <h2 id="ps-a-h">4. Audit trail</h2>
     <p role="status" className={broken===null?"co-ok":"rh-err"}>{audit.entries.length===0?"No entries yet.":broken===null?"Chain verifies.":`Chain broken at entry ${broken}.`}</p>
     {audit.entries.length>0&&<div className="co-tablewrap"><table className="co-table"><caption>Audit entries</caption><thead><tr><th scope="col">#</th><th scope="col">Action</th><th scope="col">Actor</th><th scope="col">Detail</th><th scope="col">Hash</th></tr></thead><tbody>{audit.entries.map(e=><tr key={e.seq}><td>{e.seq}</td><td>{e.action}</td><td>{e.actor}</td><td>{e.detail}</td><td><code>{e.hash.slice(0,10)}</code></td></tr>)}</tbody></table></div>}
    </section>
    <p className="rh-note">Related: <Link to="/research/cohort">Synthetic cohort</Link> · <Link to="/research/targets">Candidate targets</Link> · <Link to="/research/ledger">Hypothesis Ledger</Link>. Real patient data stays out until governance approvals exist.</p>
   </main>
  </ResearchAppShell>
 );
}
