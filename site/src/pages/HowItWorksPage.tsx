import {Link} from "react-router-dom";
import {JourneySteps} from "../components/home/JourneySteps";
import "../styles/research-home.css";
import "../styles/premium-public.css";

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
  <div className="pg-page pg-sub">
   <header className="pg-phero">
    <h1>How HSI works: one loop, eight steps.</h1>
    <div><p className="pg-lead">Each step is a working screen. Each says what it shows, what it does not, and whether it uses live public sources, published graph data, synthetic data or your own records.</p>
    <div className="pg-cta"><Link className="pg-btn" to="/welcome">Set up your research home <span aria-hidden="true">→</span></Link><Link className="pg-link" to="/research/journey">Open the guided walkthrough in the app <span aria-hidden="true">→</span></Link></div></div>
   </header>

   <section className="pg-block" aria-labelledby="hw-steps-h">
    <h2 id="hw-steps-h" className="pg-vh">The eight steps</h2>
    <JourneySteps headingLevel={3}/>
   </section>

   <section className="pg-block pg-two" aria-labelledby="hw-runs-h">
    <div><h2 id="hw-runs-h">What runs where.</h2><p className="pg-sub-p">Each part, and its status today.</p></div>
    <div className="pg-tablewrap" tabIndex={0} role="region" aria-label="What runs where, scrollable"><table className="pg-table"><caption className="pg-vh">What each part of HSI does and its status</caption><thead><tr><th scope="col">Part</th><th scope="col">Today</th></tr></thead><tbody>{RUNS.map(([a,b])=><tr key={a}><th scope="row">{a}</th><td>{b}</td></tr>)}</tbody></table></div>
   </section>

   <section className="pg-block pg-two" aria-labelledby="hw-gate-h">
    <div><h2 id="hw-gate-h">Before any real patient data.</h2><p className="pg-sub-p">These are not all in place. Until they are, patient steps stay synthetic and the gate refuses anything else.</p><p><Link className="pg-link" to="/trust">Read the governance and privacy information <span aria-hidden="true">→</span></Link></p></div>
    <ul className="pg-gates">{GATES.map((g,i)=><li key={g} data-tone={["mint","lav","peach","sky"][i%4]}>{g}</li>)}</ul>
   </section>

   <section className="pg-block pg-two" aria-labelledby="hw-deeper-h">
    <div><h2 id="hw-deeper-h">Go deeper in the app.</h2></div>
    <ul className="pg-gates">
     <li data-tone="mint"><Link to="/evidence-intelligence">Evidence intelligence</Link>: inspect source, passage, context and what is missing before comparing.</li>
     <li data-tone="lav"><Link to="/context-conflict-audit">Context-Conflict Audit</Link>: see whether apparently conflicting findings share a biological and experimental context.</li>
     <li data-tone="peach"><Link to="/research/knowledge-graph">Claim-level knowledge graph</Link>: each relationship with its publication, passage and what is missing.</li>
    </ul>
   </section>
  </div>
 );
}
