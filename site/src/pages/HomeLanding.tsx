import {Link} from "react-router-dom";
import {DemoLandingPreviewPanel} from "../components/demo/DemoLandingPreviewPanel";
import {PRODUCT_TAGLINE} from "../lib/brand";
import {GraphSnapshotProvider,useGraphSnapshot} from "../components/home/useGraphSnapshot";
import {LiveGraphHero} from "../components/home/LiveGraphHero";
import {RelationshipDiagram} from "../components/landing/RelationshipDiagram";

import {InvestigationFlowDiagram} from "../components/landing/InvestigationFlowDiagram";
import "../styles/premium-public.css";

const DOMAINS=[
 {label:"Immunology & inflammation",to:"/research/knowledge-graph?netDepartment=immunology"},
 {label:"Neuroscience",to:"/research/knowledge-graph?netDepartment=neuroscience"},
 {label:"Microbiome & metabolism",to:"/research/knowledge-graph?netDepartment=microbiome"},
 {label:"Genomics & multi-omics",to:"/research/knowledge-graph?netDepartment=genomics-multi-omics"},
 {label:"Organ & tissue biology",to:"/research/knowledge-graph?netDepartment=human-physiology"},
 {label:"Disease mechanisms",to:"/knowledge-graph"},
] as const;

function Status(){
 const {snapshot:s,failed}=useGraphSnapshot();
 return (
  <p className="pg-status" role="status">
   {s?(
    <>
     <b>{s.concepts.toLocaleString("en-GB")}</b> concepts <i aria-hidden="true">·</i>{" "}
     <b>{s.relationships.toLocaleString("en-GB")}</b> candidate relationships <i aria-hidden="true">·</i>{" "}
     <b>{s.gaps.length}</b> recorded gaps <i aria-hidden="true">·</i> <b>{s.reviewed}</b> scientifically
     reviewed
    </>
   ):failed?(
    "Snapshot unavailable. No substitute figures are shown."
   ):(
    "Verifying the published snapshot…"
   )}
  </p>
 );
}

export function HomeLanding(){
 return (
  <div className="pg-page">
   <GraphSnapshotProvider>
    <section className="pg-hero pg-hero-platform pg-hero-spine" aria-labelledby="home-title">
     <div className="pg-hero-copy">
      <h1 id="home-title">See what the evidence actually supports.</h1>
      <p className="pg-lead">
       Trace a finding, see why studies disagree, and leave with the next question.
      </p>
      <div className="pg-cta">
       <Link className="pg-btn" to="/how-it-works">
        Follow an example investigation <span aria-hidden="true">→</span>
       </Link>
       <Link className="pg-btn pg-btn-light" to="/contact">
        Request a pilot conversation
       </Link>
      </div>
      <p className="pg-micro">
       Research preview · candidate relationships only · nothing approved · no clinical advice · no patient data
      </p>
      <p className="pg-vision">{PRODUCT_TAGLINE}</p>
     </div>

     <div className="pg-hero-figure" role="region" aria-labelledby="pg-flow-h">
      <h2 id="pg-flow-h">One path. Six steps.</h2>
      <InvestigationFlowDiagram emphasizeId="graph"/>
     </div>
    </section>

    <section className="pg-proof" aria-labelledby="pg-proof-h">
     <div className="pg-proof-head">
      <h2 id="pg-proof-h">The published graph</h2>
      <p>Every relationship is a candidate. Nothing here is approved.</p>
     </div>
     <LiveGraphHero/>
     <div className="pg-strip pg-strip-inline">
      <Status/>
     </div>
    </section>

    <section className="pg-block" aria-labelledby="context-section-title">
     <h2 id="context-section-title">Open a connection.</h2>
     <p className="pg-sub-p">Evidence, conditions, then review status.</p>
     <RelationshipDiagram/>
    </section>

    <section className="pg-demo-universe" id="product-demo" aria-labelledby="pg-demo-universe-h">
     <div className="pg-demo-universe-head">
      <h2 id="pg-demo-universe-h">Compare two findings.</h2>
      <p>Labelled Example studies. Not an approval.</p>
     </div>
     <DemoLandingPreviewPanel/>
    </section>

    <section className="pg-links" aria-labelledby="pg-domains-h">
     <div className="pg-links-row">
      <h2 id="pg-domains-h">Six areas.</h2>
      <ul className="pg-domain-list" aria-label="Scientific domains in scope">
       {DOMAINS.map(d=><li key={d.label}><Link to={d.to}>{d.label}</Link></li>)}
      </ul>
     </div>
    </section>

    <section className="pg-links" aria-labelledby="pg-who-h">
     <div className="pg-links-row">
      <h2 id="pg-who-h">Two ways in.</h2>
      <ul className="pg-usp-row pg-who">
       <li>
        <Link to="/biotech">Biotech teams</Link>
        <span>Request a pilot.</span>
       </li>
       <li>
        <Link to="/researchers">Researchers</Link>
        <span>Join as a design partner.</span>
       </li>
      </ul>
     </div>
    </section>

    <section className="pg-close" aria-labelledby="pg-close-h">
     <div>
      <h2 id="pg-close-h">Start with one question.</h2>
     </div>
     <div className="pg-cta">
      <Link className="pg-btn pg-btn-light" to="/how-it-works">
       Follow an example investigation <span aria-hidden="true">→</span>
      </Link>
      <Link className="pg-link pg-link-light" to="/contact">
       Request a pilot conversation
      </Link>
     </div>
    </section>
   </GraphSnapshotProvider>
  </div>
 );
}
