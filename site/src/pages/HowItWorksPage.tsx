import {Link} from "react-router-dom";
import {PlatformPathFlow} from "../components/landing/PlatformPathFlow";
import {RelationshipDiagram} from "../components/landing/RelationshipDiagram";
import {InvestigationFlowDiagram} from "../components/landing/InvestigationFlowDiagram";
import "../styles/research-home.css";
import "../styles/premium-public.css";

export function HowItWorksPage(){
 return <div className="pg-page pg-sub">
  <header className="pg-phero pg-phero-spine" data-hero-style="b" aria-labelledby="hw-title">
   <div className="pg-phero-intro">
    <h1 id="hw-title">Follow a question through the evidence.</h1>
    <p className="pg-lead">From the first source to a brief you can inspect.</p>
    <div className="pg-cta"><Link className="pg-btn" to="/demo/universe">Explore a demonstration</Link><Link className="pg-link" to="/research/journey">Explore Workflow</Link></div>
    <p className="pg-micro">Research preview · demonstration findings are labelled · no clinical advice</p>
   </div>
   <div className="pg-phero-figure"><PlatformPathFlow/></div>
  </header>
  <section className="pg-block" aria-labelledby="hw-context-title">
   <h2 id="hw-context-title">Inspect the conditions before comparing the findings.</h2>
   <p className="pg-sub-p">Different species, tissues or endpoints can change what a study establishes.</p>
   <RelationshipDiagram/>
  </section>
  <section className="pg-block" aria-labelledby="hw-steps-h">
   <h2 id="hw-steps-h">The workflow on screen.</h2>
   <p className="pg-sub-p">Product previews. Simulated and local-only steps remain labelled.</p>
   <div className="pg-shots">
    <figure className="pg-shot"><img src="/images/product/explorer-v2.webp" width={1440} height={900} alt="Graph explorer with a selected relationship and evidence context" loading="lazy"/><figcaption>Explore a relationship and inspect its evidence.</figcaption></figure>
    <figure className="pg-shot"><img src="/images/product/dashboard-v2.webp" width={1440} height={1120} alt="Research home with topic metrics and a graph panel" loading="lazy"/><figcaption>Return to your topics and continue the investigation.</figcaption></figure>
   </div>
  </section>
  <section className="pg-block" aria-labelledby="hw-review-title">
   <h2 id="hw-review-title">A model check is one step. Approval is another.</h2>
   <InvestigationFlowDiagram ariaLabel="Scientific review boundaries" steps={[
    {id:"candidate",label:"Extracted claim",line:"A source-reported statement to inspect."},
    {id:"check",label:"Evidence check",line:"Assess support, missing context and uncertainty."},
    {id:"review",label:"Human review",line:"An authorised reviewer records a decision."},
    {id:"version",label:"Versioned record",line:"Retain the source, decision and history."},
   ]}/>
   <p className="pg-micro">Published graph relationships are currently unreviewed. Model checks require configuration; many saves remain on-device. <Link to="/validation">Validation status</Link></p>
  </section>
  <section className="pg-close" aria-labelledby="hw-close-h">
   <div><h2 id="hw-close-h">Inspect an investigation.</h2><p>Choose a scenario. Follow its evidence and open the brief.</p></div>
   <div className="pg-cta"><Link className="pg-btn pg-btn-light" to="/demo/universe">Explore a demonstration</Link><Link className="pg-link pg-link-light" to="/knowledge-graph">Explore the graph</Link></div>
  </section>
 </div>;
}
