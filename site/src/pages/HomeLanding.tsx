import {Link} from "react-router-dom";
import {GraphSnapshotProvider,useGraphSnapshot} from "../components/home/useGraphSnapshot";
import {Shot} from "../components/home/ProductStory";
import "../styles/scientific-public.css";
import "../styles/home-story.css";

const LOOP=[
 {n:1,title:"Investigate",chip:"Live public sources",text:"Ask a question. HSI searches Europe PMC, OpenAlex and Open Targets and shows how the answer was produced, step by step."},
 {n:2,title:"Find gaps, form hypotheses",chip:"From the graph and your runs",text:"See what is missing or contested. Carry a hypothesis only with a stated way it could be proved wrong."},
 {n:3,title:"Connect to patients",chip:"Synthetic patients",text:"A phenotype is evaluated in a separate, governed plane. Only small-group-protected totals come back, after a different person approves."},
 {n:4,title:"Targets and trials",chip:"Live metadata · synthetic pre-screening",text:"Candidate targets with the evidence that is present and missing. Trial pre-screening that never says someone is eligible."},
] as const;

function Snapshot(){
 const {snapshot:s,failed}=useGraphSnapshot();
 return (
  <section className="hl-section" aria-labelledby="hl-graph-h">
   <div className="hl-inner">
    <h2 id="hl-graph-h">The graph underneath.</h2>
    <p className="ps-sub">Biological relationships, each with its source, experimental context and review status attached.</p>
    <p className="hl-stats" role="status">{s?<><b>{s.concepts.toLocaleString("en-GB")}</b> concepts · <b>{s.relationships.toLocaleString("en-GB")}</b> candidate relationships · every one unreviewed</>:failed?"Snapshot unavailable. No substitute figures are shown.":"Verifying the published snapshot…"}</p>
    <div className="ps-cta"><Link className="sp-button" to="/knowledge-graph">Explore the knowledge graph <span aria-hidden="true">→</span></Link></div>
   </div>
  </section>
 );
}

export function HomeLanding(){
 return (
  <div className="sp-page fg-page hl-page">
   <GraphSnapshotProvider>
    <section className="ps-hero" aria-labelledby="home-title">
     <div className="ps-hero-copy">
      <p className="ps-eyebrow">Research preview · candidate-only · nothing scientifically approved</p>
      <h1 id="home-title">Connect biology. Find the gaps. Translate evidence into human impact.</h1>
      <p className="ps-lead">HSI links open literature and a verified knowledge graph to what researchers should investigate next, then to patient groups, targets and trials under governance. Every claim keeps its source, context and review status.</p>
      <div className="ps-cta"><Link className="sp-button" to="/welcome">Set up your research home <span aria-hidden="true">→</span></Link><Link to="/how-it-works">See how it works</Link></div>
      <p className="ps-micro">No account needed to start. Public evidence is live. Patient data in this preview is synthetic.</p>
     </div>
     <figure className="ps-hero-shot">
      <Shot name="home" w={1440} h={900} eager alt="The HSI research home: a search box, a research radar showing new papers for two example topics with ten-year publication trends, and a gap finder."/>
      <figcaption>The research home, with live results for two example topics.</figcaption>
     </figure>
    </section>

    <section className="hl-section" aria-labelledby="hl-loop-h">
     <div className="hl-inner">
      <h2 id="hl-loop-h">One loop, from a question to patient-relevant opportunities.</h2>
      <ol className="hl-loop" aria-label="The research loop">{LOOP.map(s=>(
       <li key={s.n}><span className="hl-n" aria-hidden="true">{s.n}</span><h3>{s.title}</h3><span className="ps-tag">{s.chip}</span><p>{s.text}</p></li>
      ))}</ol>
      <p className="hl-return">Then record what you learned and reassess, which feeds the next question.</p>
      <div className="ps-cta"><Link className="sp-button" to="/how-it-works">Walk through all eight steps <span aria-hidden="true">→</span></Link></div>
     </div>
    </section>

    <section className="ps-tour" aria-labelledby="hl-get-h">
     <h2 id="hl-get-h" className="ps-h2">What you get when you start.</h2>
     <ul className="ps-cards">
      <li><Link className="ps-card" to="/welcome"><img src="/images/product/radar.webp" width={1092} height={386} alt="The research radar: new papers for two topics with trend lines." loading="lazy" decoding="async"/><span className="ps-tag">Two minutes · every step optional</span><b>Your research home</b><span className="ps-note">Tell HSI what you work on. Get a radar of new papers, a gap finder, and a place to continue your work.</span></Link></li>
      <li><Link className="ps-card" to="/research/workspace"><img src="/images/product/workspace.webp" width={1440} height={900} alt="The investigation workspace: evidence, relationships and verification for one question." loading="lazy" decoding="async"/><span className="ps-tag">Model checks off in this preview</span><b>Investigations with proof</b><span className="ps-note">Run a question and keep the source, context and status of every claim. A failed source is shown as failed, never as nothing found.</span></Link></li>
      <li><Link className="ps-card" to="/research/gaps"><img src="/images/product/gaps.webp" width={1092} height={386} alt="The gap finder: gaps recorded in the graph and thin areas of the literature." loading="lazy" decoding="async"/><span className="ps-tag">Kept on your device today</span><b>Your gaps, hypotheses and methods</b><span className="ps-note">A Gap Register, a Hypothesis Ledger and a methods notebook that record what you decided and what happened.</span></Link></li>
     </ul>
    </section>

    <section className="hl-section" aria-labelledby="hl-honest-h">
     <div className="hl-inner">
      <h2 id="hl-honest-h">How it stays honest.</h2>
      <ul className="hl-honest">
       <li><b>Evidence, inference and approval stay separate.</b> Every relationship in the graph is a candidate. Nothing is scientifically approved.</li>
       <li><b>Patient data lives in a separate plane.</b> Here it is synthetic only, and the release gate refuses anything else.</li>
       <li><b>What is not true yet.</b> Model checks are off, saved work is on your device and not a server, there is no real patient data, and nothing is clinical advice.</li>
      </ul>
      <p><Link className="ps-link" to="/trust">Read how evidence, privacy and governance are handled →</Link></p>
     </div>
    </section>

    <Snapshot/>

    <section className="hl-section hl-close" aria-labelledby="hl-close-h">
     <div className="hl-inner">
      <h2 id="hl-close-h">Start with your own topics.</h2>
      <p className="ps-sub">Set up your research home, or create an account so your sign-in is ready when saving to a server is available.</p>
      <div className="ps-cta"><Link className="sp-button" to="/welcome">Set up your research home <span aria-hidden="true">→</span></Link><Link to="/sign-up">Create an account</Link></div>
     </div>
    </section>
   </GraphSnapshotProvider>
  </div>
 );
}
