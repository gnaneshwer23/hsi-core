import {Link} from "react-router-dom";
import {GraphSnapshotProvider,useGraphSnapshot} from "../components/home/useGraphSnapshot";
import {HeroGraph} from "../components/home/HeroGraph";
import "../styles/premium-public.css";

const LOOP=[
 {title:"Investigate",chip:"Live public sources",text:"Ask a question. HSI searches Europe PMC, OpenAlex and Open Targets and shows how the answer was produced, step by step.",to:"/research/workspace",cta:"Open investigations"},
 {title:"Find gaps, form hypotheses",chip:"From the graph and your runs",text:"See what is missing or contested. Carry a hypothesis only with a stated way it could be proved wrong.",to:"/research/gaps",cta:"Open the Gap Register"},
 {title:"Connect to patients",chip:"Synthetic patients",text:"A phenotype is evaluated in a separate, governed plane. Only small-group-protected totals come back, after a different person approves.",to:"/research/cohort",cta:"See the synthetic cohort"},
 {title:"Targets and trials",chip:"Live metadata · synthetic pre-screening",text:"Candidate targets with the evidence that is present and missing. Trial pre-screening that never says someone is eligible.",to:"/research/targets",cta:"See candidate targets"},
] as const;

const HONEST=[
 {tone:"mint",title:"Evidence, inference and approval stay separate.",text:"Every relationship in the graph is a candidate with its source, experimental context and review status. Nothing is scientifically approved."},
 {tone:"lav",title:"Patient data lives in a separate plane.",text:"Here it is synthetic only, and the release gate refuses anything else. Small groups are suppressed before any total leaves."},
 {tone:"peach",title:"What is not true yet.",text:"Model checks are off, saved work is on your device and not a server, there is no real patient data, and nothing is clinical advice."},
] as const;

function Status(){
 const {snapshot:s,failed}=useGraphSnapshot();
 return <p className="pg-status" role="status">{s?<><b>{s.concepts.toLocaleString("en-GB")}</b> concepts <i aria-hidden="true">·</i> <b>{s.relationships.toLocaleString("en-GB")}</b> candidate relationships <i aria-hidden="true">·</i> <b>{s.gaps.length}</b> recorded gaps <i aria-hidden="true">·</i> <b>{s.reviewed}</b> scientifically reviewed</>:failed?"Snapshot unavailable. No substitute figures are shown.":"Verifying the published snapshot…"}</p>;
}

export function HomeLanding(){
 return (
  <div className="pg-page">
   <GraphSnapshotProvider>
    <section className="pg-hero" aria-labelledby="home-title">
     <div className="pg-hero-copy">
      <h1 id="home-title">Connect biology. Find the gaps. Translate evidence into human impact.</h1>
      <p className="pg-lead">HSI links open literature and a verified knowledge graph to what researchers should investigate next, then to patient groups, targets and trials under governance. Every claim keeps its source, context and review status.</p>
      <div className="pg-cta"><Link className="pg-btn" to="/welcome">Set up your research home <span aria-hidden="true">→</span></Link><Link className="pg-link" to="/how-it-works">See how it works</Link></div>
      <p className="pg-micro">Research preview. Candidate-only: nothing here is scientifically approved. No account is needed to start, public evidence is live, and patient data is synthetic.</p>
     </div>
     <HeroGraph/>
    </section>
    <div className="pg-strip"><Status/></div>

    <section className="pg-loop" aria-labelledby="pg-loop-h">
     <div className="pg-loop-head">
      <h2 id="pg-loop-h">One loop, from a question to patient-relevant opportunities.</h2>
      <p>Then record what you learned and reassess, which feeds the next question.</p>
      <Link className="pg-link" to="/how-it-works">Walk through all eight steps <span aria-hidden="true">→</span></Link>
     </div>
     <ol className="pg-steps" aria-label="The research loop">{LOOP.map((s,i)=>(
      <li key={s.title}><span className="pg-num" aria-hidden="true">{i+1}</span><div><h3>{s.title}</h3><span className="pg-chip">{s.chip}</span><p>{s.text}</p><Link className="pg-link" to={s.to}>{s.cta} <span aria-hidden="true">→</span></Link></div></li>
     ))}</ol>
    </section>

    <section className="pg-product" aria-labelledby="pg-product-h">
     <div className="pg-product-copy">
      <h2 id="pg-product-h">Your research home.</h2>
      <p>Tell HSI what you work on and get a radar of new papers, a gap finder, a hypothesis ledger and a place to continue. It takes two minutes and every step is optional.</p>
      <ul>
       <li><b>Investigations with proof.</b> A failed source is shown as failed, never as nothing found.</li>
       <li><b>Your gaps, hypotheses and methods.</b> Kept on your device today, with a history of every change.</li>
       <li><b>One place to pick up.</b> Your loop progress and activity, from real records only.</li>
      </ul>
      <div className="pg-cta"><Link className="pg-btn" to="/welcome">Set up your research home <span aria-hidden="true">→</span></Link></div>
     </div>
     <figure className="pg-shot">
      <img src="/images/product/dashboard.jpg" width={1440} height={900} alt="The HSI research home: a glass sidebar, a search box, and four overview tiles for concepts, recorded relationships, gaps and your loop progress." loading="lazy" decoding="async"/>
     </figure>
    </section>

    <section className="pg-honest" aria-labelledby="pg-honest-h">
     <h2 id="pg-honest-h">How it stays honest.</h2>
     <ul>{HONEST.map(h=>(<li key={h.title} data-tone={h.tone}><h3>{h.title}</h3><p>{h.text}</p></li>))}</ul>
     <p><Link className="pg-link" to="/trust">Read how evidence, privacy and governance are handled <span aria-hidden="true">→</span></Link></p>
    </section>

    <section className="pg-close" aria-labelledby="pg-close-h">
     <div>
      <h2 id="pg-close-h">Start with your own topics.</h2>
      <p>Set up your research home, or create an account so your sign-in is ready when saving to a server is available.</p>
     </div>
     <div className="pg-cta"><Link className="pg-btn pg-btn-light" to="/welcome">Set up your research home <span aria-hidden="true">→</span></Link><Link className="pg-link pg-link-light" to="/sign-up">Create an account</Link></div>
    </section>
   </GraphSnapshotProvider>
  </div>
 );
}
