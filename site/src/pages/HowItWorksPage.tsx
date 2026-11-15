import {Link} from "react-router-dom";
import {JourneySteps} from "../components/home/JourneySteps";
import "../styles/scientific-public.css";
import "../styles/home-story.css";
import "../styles/research-home.css";

const RUNS:[string,string][]=[
 ["Evidence services","Europe PMC, OpenAlex and Open Targets are queried when you ask. Nothing is stored or logged with your question."],
 ["Knowledge graph","A published, digest-verified snapshot. Every relationship is a candidate with its source, context and review status."],
 ["Your records","Gaps, hypotheses, methods and saved runs are kept in this browser. Server storage is designed and not enabled."],
 ["Clinical plane","A separate, governed environment. In this preview it holds synthetic patients only, and a release gate controls what comes back."],
 ["Model checks","Off in this preview. Features that need them say so, and nothing pretends a check ran."],
 ["Accounts","Sign-in and email verification work. Creating an account does not grant research or reviewer permissions."],
];
const GATES=["Approval of the two-plane architecture decision (done)","An independent security review of the account-storage design","A named clinical safety officer and a clinical safety case","A data protection impact assessment and a lawful basis","A data-sharing agreement with a data controller"];

export function HowItWorksPage(){
 return (
  <div className="sp-page fg-page hl-page">
   <header className="fg-hook"><h1>How HSI works: one loop, eight steps.</h1><div><p className="fg-lead">Each step is a working screen. Each says what it shows, what it does not, and whether it uses live public sources, published graph data, synthetic data or your own records.</p>
    <div className="sp-actions"><Link className="sp-button" to="/welcome">Set up your research home <span aria-hidden="true">→</span></Link><Link to="/research/journey">Open the guided walkthrough in the app →</Link></div></div></header>

   <section className="hl-section" aria-labelledby="hw-steps-h"><div className="hl-inner">
    <h2 id="hw-steps-h" className="vh">The eight steps</h2>
    <JourneySteps headingLevel={3}/>
   </div></section>

   <section className="hl-section" aria-labelledby="hw-runs-h"><div className="hl-inner">
    <h2 id="hw-runs-h">What runs where.</h2>
    <div className="ps-tablewrap" tabIndex={0} role="region" aria-label="What runs where, scrollable"><table className="hl-table"><caption className="vh">What each part of HSI does and its status</caption><thead><tr><th scope="col">Part</th><th scope="col">Today</th></tr></thead><tbody>{RUNS.map(([a,b])=><tr key={a}><th scope="row">{a}</th><td>{b}</td></tr>)}</tbody></table></div>
   </div></section>

   <section className="hl-section" aria-labelledby="hw-gate-h"><div className="hl-inner">
    <h2 id="hw-gate-h">Before any real patient data.</h2>
    <p className="ps-sub">These are not all in place. Until they are, patient steps stay synthetic and the gate refuses anything else.</p>
    <ul className="hl-honest">{GATES.map(g=><li key={g}>{g}</li>)}</ul>
    <p><Link className="ps-link" to="/trust">Read the governance and privacy information →</Link></p>
   </div></section>

   <section className="hl-section" aria-labelledby="hw-deeper-h"><div className="hl-inner">
    <h2 id="hw-deeper-h">Go deeper in the app.</h2>
    <ul className="hl-honest">
     <li><Link to="/evidence-intelligence">Evidence intelligence</Link>: inspect source, passage, context and what is missing before comparing.</li>
     <li><Link to="/context-conflict-audit">Context-Conflict Audit</Link>: see whether apparently conflicting findings share a biological and experimental context.</li>
     <li><Link to="/research/knowledge-graph">Claim-level knowledge graph</Link>: each relationship with its publication, passage and what is missing.</li>
    </ul>
   </div></section>
  </div>
 );
}
