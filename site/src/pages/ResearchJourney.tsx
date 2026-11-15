import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {STEPS,progressFor,readBrowserRecord,type BrowserRecord,type StatusKind} from "../lib/journey";
import {useGraphSnapshot} from "../components/home/useGraphSnapshot";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {Icon} from "../components/home/AppIcons";
import "../styles/research-home.css";

const EMPTY:BrowserRecord={savedRun:false,gapStatuses:0,ledgerEntries:0,withCohortObservation:0,withTargets:0,linkedToGaps:0,loopClosed:0};
const KIND:Record<StatusKind,string>={live:"Live public source",published:"Published, unreviewed",synthetic:"Synthetic data",derived:"Derived from records",manual:"Written by you",local:"This browser only"};
const GATES=["Approval of the two-plane architecture decision","An independent security review of the account-storage design","A named clinical safety officer and a clinical safety case","A data protection impact assessment and a lawful basis","A data-sharing agreement with a data controller"];

export function ResearchJourneyPage(){
 const [rec,setRec]=useState<BrowserRecord>(EMPTY),{snapshot:snap,failed}=useGraphSnapshot();
 useEffect(()=>{try{setRec(readBrowserRecord(localStorage))}catch{setRec(EMPTY)}},[]);
 const prog=progressFor(rec),done=Object.values(prog).filter(p=>p.state==="done").length,tracked=Object.values(prog).filter(p=>p.state!=="untracked").length;
 return (
  <ResearchAppShell where="Guided walkthrough" whereIcon="spark" active="journey">
   <main className="rh-main" id="rh-main" tabIndex={-1}>
    <p className="co-banner" role="note"><b>Prototype.</b> Public-source evidence is live. Patient data is synthetic. Model checks are off. Everything you save stays in this browser. Nothing here is clinical advice or an eligibility decision.</p>
    <section className="rh-card" aria-labelledby="jr-h">
     <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="spark" size={22}/></span><div><h1 id="jr-h">From a research question to patient-relevant opportunities</h1><p className="rh-sub">Eight connected steps, each a working screen. Follow them in order, or start from a hypothesis and carry it through the cohort, target and trial steps. Each step says what it shows and what it does not.</p></div></header>
     <p className="rh-note" role="status">{done} of {tracked} trackable steps have a record in this browser. Steps 2 and 7 store nothing, so they are not counted.</p>
    </section>

    <section className="rh-card" aria-labelledby="jr-real-h">
     <h2 id="jr-real-h">What is real, and what is not</h2>
     <div className="co-tablewrap"><table className="co-table"><caption>Status of each part of the prototype</caption><thead><tr><th scope="col">Part</th><th scope="col">Status</th></tr></thead><tbody>
      <tr><th scope="row">Literature and target evidence</th><td>Real and live: Europe PMC, OpenAlex and Open Targets are queried when you ask.</td></tr>
      <tr><th scope="row">Knowledge graph</th><td>Real and published{snap?`: ${snap.concepts.toLocaleString("en-GB")} concepts and ${snap.relationships.toLocaleString("en-GB")} candidate relationships`:failed?" (snapshot unavailable, no figures shown)":""}. Every relationship is a candidate and unreviewed.</td></tr>
      <tr><th scope="row">Patients and trials</th><td>Synthetic. Generated profiles and illustrative trials, not people or real studies.</td></tr>
      <tr><th scope="row">Model checks and model-proposed hypotheses</th><td>Off in this prototype. Features that need them say so.</td></tr>
      <tr><th scope="row">Saved work</th><td>In this browser only. Nothing is stored on a server yet.</td></tr>
      <tr><th scope="row">Clinical use and regulation</th><td>None claimed. No clinical validation, clearance or approval.</td></tr>
     </tbody></table></div>
    </section>

    <ol className="jr-steps" aria-label="Walkthrough steps">
     {STEPS.map(s=>{const p=prog[s.n]!;return (
      <li key={s.id} className="rh-card jr-step" data-state={p.state}>
       <header><span className="jr-n" aria-hidden="true">{s.n}</span><div><h2>{s.title}</h2><p className="rh-sub">{s.question}</p></div><span className="jr-kind" data-k={s.status.kind}>{KIND[s.status.kind]}</span></header>
       <p className="rh-note">{s.status.label}</p>
       <dl className="hl-dl"><dt>What it shows</dt><dd>{s.proves}</dd><dt>What it does not</dt><dd>{s.doesNot}</dd></dl>
       <p className="jr-prog" data-state={p.state}><span className="jr-state">{p.state==="done"?"Done":p.state==="todo"?"Not yet":"Not tracked"}</span> {p.text}</p>
       <div className="rh-row"><Link className="rh-primary" to={s.to}>{s.cta} <Icon name="arrow" size={16}/></Link></div>
      </li>);})}
    </ol>

    <section className="rh-card" aria-labelledby="jr-gate-h">
     <h2 id="jr-gate-h">Before any real patient data</h2>
     <p className="rh-note">None of these is in place yet. Until they are, the patient steps stay synthetic and the gate refuses anything else.</p>
     <ul>{GATES.map(g=><li key={g}>{g}</li>)}</ul>
    </section>
   </main>
  </ResearchAppShell>
 );
}
