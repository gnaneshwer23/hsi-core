import {Link} from "react-router-dom";
import {DemoLandingPreviewPanel} from "../components/demo/DemoLandingPreviewPanel";
import {PRODUCT_TAGLINE} from "../lib/brand";
import {GraphSnapshotProvider,useGraphSnapshot} from "../components/home/useGraphSnapshot";
import {LiveGraphHero} from "../components/home/LiveGraphHero";
import {RelationshipDiagram} from "../components/landing/RelationshipDiagram";

import {InvestigationFlowDiagram} from "../components/landing/InvestigationFlowDiagram";
import {LIVE_INVESTIGATION_PATH} from "../lib/workbenchPrimary";
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
      <p className="pg-vision">{PRODUCT_TAGLINE}</p>
      <h1 id="home-title">
       <span className="pg-brand">Human Super Intelligence </span>
       See what the evidence actually supports.
      </h1>
      <p className="pg-lead">
       HSI helps scientists determine what biomedical evidence actually supports, why findings disagree, and what to investigate next — with a traceable explanation you can reopen.
      </p>
      <div className="pg-cta">
       <Link className="pg-btn" to="/how-it-works">
        Follow an example investigation <span aria-hidden="true">→</span>
       </Link>
       <Link className="pg-link" to="/contact">
        Request a pilot conversation
       </Link>
      </div>
      <p className="pg-micro">
       Research preview · candidate relationships only · nothing scientifically approved · no clinical advice · no patient data on this site
      </p>
     </div>

     <div className="pg-hero-figure" role="region" aria-labelledby="pg-flow-h">
      <h2 id="pg-flow-h">From a question to a research brief.</h2>
      <p className="pg-flow-lead">
       Connect, verify, reason and collaborate. One path, grouped from the question through to a brief you can reopen.
      </p>
      <InvestigationFlowDiagram emphasizeId="graph"/>
      <p className="pg-flow-note">
       Research preview. Model interpretation and scientific approval remain separate.
      </p>
     </div>
    </section>

    <section className="pg-proof" aria-labelledby="pg-proof-h">
     <div className="pg-proof-head">
      <h2 id="pg-proof-h">Published knowledge graph</h2>
      <p>Live from the digest-verified snapshot. Every relationship is a candidate.</p>
     </div>
     <LiveGraphHero/>
     <div className="pg-strip pg-strip-inline">
      <Status/>
     </div>
    </section>

    <section className="pg-block" aria-labelledby="context-section-title">
     <h2 id="context-section-title">A connection is only the beginning.</h2>
     <p className="pg-sub-p">Inspect its evidence, experimental conditions and review status.</p>
     <RelationshipDiagram/>
    </section>

    <section className="pg-demo-universe" id="product-demo" aria-labelledby="pg-demo-universe-h">
     <div className="pg-demo-universe-head">
      <h2 id="pg-demo-universe-h">Compare findings across contexts.</h2>
      <p>An example investigation. The studies are labelled Example, and they are not an approval.</p>
     </div>
     <DemoLandingPreviewPanel/>
    </section>

    <section className="pg-links" aria-labelledby="pg-domains-h">
     <div className="pg-links-row">
      <h2 id="pg-domains-h">Connected biological systems.</h2>
      <p>Six areas of investigation. Published evidence coverage varies by area.</p>
      <ul className="pg-domain-list" aria-label="Scientific domains in scope">
       {DOMAINS.map(d=><li key={d.label}><Link to={d.to}>{d.label}</Link></li>)}
      </ul>
     </div>
    </section>

    <section className="pg-links" aria-labelledby="pg-who-h">
     <div className="pg-links-row">
      <h2 id="pg-who-h">Who it is for.</h2>
      <p>Two paths. Other audiences stay in the footer.</p>
      <ul className="pg-usp-row pg-who">
       <li>
        <Link to="/biotech">Biotech teams</Link>
        <span>Small R&amp;D and funded translational groups can inspect evidence, see why findings disagree, and request a pilot conversation.</span>
       </li>
       <li>
        <Link to="/researchers">Researchers</Link>
        <span>Academic scientists can join as design partners and run a labelled example investigation.</span>
       </li>
      </ul>
     </div>
    </section>

    <section className="pg-product" aria-labelledby="pg-product-h">
     <div className="pg-product-copy">
      <h2 id="pg-product-h">Your research home</h2>
      <p>Choose your topics. Explore the graph. Keep your investigation and brief together.</p>
      <p className="pg-micro">Many saved records remain on this device.</p>
      <div className="pg-cta">
       <Link className="pg-btn" to="/welcome">
        Set up your research home <span aria-hidden="true">→</span>
       </Link>
       <Link className="pg-link" to={LIVE_INVESTIGATION_PATH}>
        Open scientific workbench <span aria-hidden="true">→</span>
       </Link>
      </div>
     </div>
     <div className="pg-shots">
      <figure className="pg-shot">
       <img
        src="/images/product/dashboard-v2.webp"
        width={1440}
        height={1120}
        alt="Researcher home showing topic metrics and a knowledge graph panel with source-linked relationships for the selected concept."
        loading="lazy"
        decoding="async"
       />
       <figcaption>
        <b>Your home.</b> Built from your topics: metrics, graph neighbourhood and evidence behind each line.
       </figcaption>
      </figure>
      <figure className="pg-shot">
       <img
        src="/images/product/explorer-v2.webp"
        width={1440}
        height={900}
        alt="Knowledge graph explorer with department colouring, gap markers and an evidence panel by experimental model."
        loading="lazy"
        decoding="async"
       />
       <figcaption>
        <b>The explorer.</b> Filter, select, trace routes and open research gaps with their evidence.
       </figcaption>
      </figure>
     </div>
    </section>

    <section className="pg-close" aria-labelledby="pg-close-h">
     <div>
      <h2 id="pg-close-h">Start with one research question.</h2>
      <p>Open the example, or request a pilot conversation.</p>
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
