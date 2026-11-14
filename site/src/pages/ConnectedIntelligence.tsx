import {Link} from "react-router-dom";
import {connectedCapabilities,GOVERNANCE_PRINCIPLES,STATUS_TEXT,type CapabilityStatus} from "../lib/connectedIntelligence";
import "../styles/departments.css";
import "../styles/connected-intelligence.css";

function Arrow(){return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="18" height="18"><path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
const badgeClass:Record<CapabilityStatus,string>={research_preview:"dept-status",in_development:"dept-status dept-status-dev",planned:"dept-status ci-planned"};

export function ConnectedIntelligence(){
 return <div className="dept-page ci-page">
  <section className="dept-hero"><div className="dept-shell">
   <h1>One foundation. Connected intelligence.</h1>
   <p className="dept-lead">HSI is built around a shared, evidence-linked scientific foundation. Over time the same foundation is intended to support clinical context, patient-reported health and translational study questions, each under its own governance. This page describes that direction and, for each capability, what exists today.</p>
   <p className="dept-coverage">Everything below other than scientific discovery is not available. Labels show maturity: <strong>Research preview</strong>, <strong>In development</strong> or <strong>Planned</strong>.</p>
   <div className="dept-actions"><Link className="dept-button" to="/departments">Explore the science<Arrow/></Link><Link className="dept-link" to="/contact">Research access options<Arrow/></Link></div>
  </div></section>

  <section className="dept-shell dept-section" aria-labelledby="ci-caps"><h2 id="ci-caps">Four capabilities, one platform</h2>
   <ul className="ci-grid">{connectedCapabilities.map(c=><li key={c.id} className="ci-card">
    <div className="ci-card-head"><h3>{c.title}</h3><span className={badgeClass[c.status]}>{STATUS_TEXT[c.status]}</span></div>
    <p>{c.summary}</p>
    <ul className="ci-connects" aria-label={`${c.title} connects`}>{c.connects.map(t=><li key={t}>{t}</li>)}</ul>
    <dl className="ci-facts"><div><dt>Today</dt><dd>{c.today}</dd></div><div><dt>What it is not</dt><dd>{c.isNot}</dd></div><div><dt>Governance</dt><dd>{c.governance}</dd></div></dl>
   </li>)}</ul></section>

  <section className="dept-shell dept-section" aria-labelledby="ci-flow"><h2 id="ci-flow">How the capabilities are intended to connect</h2>
   <p className="dept-aside">Intended direction, not a description of a running system. Each step needs its own authorisation, and only the first exists as a research preview.</p>
   <ol className="ci-flow">
    <li><strong>Scientific evidence</strong><span>Sourced passages, biological context and uncertainty.</span></li>
    <li><strong>Biological mechanisms</strong><span>Candidate relationships and research gaps.</span></li>
    <li><strong>Authorised context</strong><span>With consent and governance, clinical and patient-reported information for the people entitled to see it.</span></li>
    <li><strong>Study questions</strong><span>Exploratory links between mechanisms and published study criteria.</span></li>
   </ol></section>

  <section className="dept-shell dept-section dept-integrity" aria-labelledby="ci-gov"><h2 id="ci-gov">The boundaries that stay in place</h2>
   <ul className="ci-principles">{GOVERNANCE_PRINCIPLES.map(p=><li key={p.title}><strong>{p.title}</strong><span>{p.text}</span></li>)}</ul>
   <p>See how evidence, review and publication are kept separate on the <Link to="/trust">trust page</Link>.</p></section>

  <section className="dept-shell dept-next"><Link to="/intelligence">Meet the capabilities that investigate and verify the science<Arrow/></Link></section>
 </div>;
}
