import {Link} from "react-router-dom";
import {DemoLandingPreviewPanel} from "../components/demo/DemoLandingPreviewPanel";
import {GraphSnapshotProvider,useGraphSnapshot} from "../components/home/useGraphSnapshot";
import {LiveGraphHero} from "../components/home/LiveGraphHero";
import {OpenQuestions} from "../components/home/OpenQuestions";
import {HomepageWorkedConflict} from "../components/home/HomepageWorkedConflict";
import {InvestigationFlowDiagram} from "../components/landing/InvestigationFlowDiagram";
import {LIVE_INVESTIGATION_PATH} from "../lib/workbenchPrimary";
import "../styles/premium-public.css";

const USPS=[
 {
  title:"Context-aware disagreement",
  text:"Compare by model, tissue, dose and endpoint — or abstain.",
  to:"/context-conflict-audit",
 },
 {
  title:"Cross-domain mechanisms",
  text:"Follow candidate relationships with source and review status.",
  to:"/knowledge-graph",
 },
 {
  title:"Connected research path",
  text:"Questions, evidence, gaps and briefs stay on one trail.",
  to:"/welcome",
 },
] as const;

const DOMAINS=[
 {label:"Immunology & inflammation",to:"/research/knowledge-graph?netDepartment=immunology"},
 {label:"Neuroscience",to:"/research/knowledge-graph?netDepartment=neuroscience"},
 {label:"Microbiome & metabolism",to:"/research/knowledge-graph?netDepartment=microbiome"},
 {label:"Genomics & multi-omics",to:"/research/knowledge-graph?netDepartment=genomics-multi-omics"},
 {label:"Organ & tissue biology",to:"/research/knowledge-graph?netDepartment=human-physiology"},
 {label:"Disease mechanisms",to:"/knowledge-graph"},
] as const;

const AUDIENCES=[
 {label:"Researchers",to:"/researchers"},
 {label:"Research groups",to:"/enterprise"},
 {label:"Biotech & pharma",to:"/biotech"},
 {label:"Clinical research",to:"/enterprise/clinical"},
 {label:"Laboratories",to:"/enterprise/lab"},
 {label:"Community",to:"/enterprise/community"},
] as const;

const LIMITS=[
 "Evidence, inference and approval stay separate — graph relationships are candidates, not scientifically approved.",
 "Patient data stays in a separate plane; this preview uses synthetic patients only.",
 "Dual-model checks are off by default, many saves remain on-device, and nothing is clinical advice.",
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
    <section className="pg-hero pg-hero-platform pg-hero-console" aria-labelledby="home-title">
     <div className="pg-hero-copy">
      <h1 id="home-title">
       <span className="pg-brand">Human Super Intelligence </span>
       The AI platform for scientific evidence and biological reasoning
      </h1>
      <p className="pg-lead">
       Evidence, experimental context and candidate mechanisms — with provenance attached and approval kept separate.
      </p>
      <div className="pg-cta">
       <Link className="pg-btn" to="/how-it-works">
        Explore the platform <span aria-hidden="true">→</span>
       </Link>
       <Link className="pg-link" to={LIVE_INVESTIGATION_PATH}>
        Scientific workbench
       </Link>
      </div>
      <p className="pg-micro">
       Research preview. Candidate-only: nothing here is scientifically approved. Domain coverage is unequal today; systemic sclerosis is the validation case, not a claim of uniform depth. No clinical advice; patient data on this site is synthetic.
      </p>
     </div>
     <LiveGraphHero/>
    </section>

    <div className="pg-strip">
     <Status/>
    </div>

    <section className="pg-flow" aria-labelledby="pg-flow-h">
     <h2 id="pg-flow-h">The investigation flow.</h2>
     <p className="pg-flow-lead">
      One path from question to brief. The live graph above is the mechanism node.
     </p>
     <InvestigationFlowDiagram emphasizeId="graph"/>
     <p className="pg-flow-note">
      Candidate-only and unreviewed. Agents propose in the background and are not named here.
     </p>
    </section>

    <section className="pg-links" aria-labelledby="pg-diff-h">
     <div className="pg-links-row">
      <h2 id="pg-diff-h">What makes it different.</h2>
      <ul className="pg-usp-row" aria-label="Product differentiators">
       {USPS.map((p)=>(
        <li key={p.title}>
         <Link to={p.to}>{p.title} <span aria-hidden="true">→</span></Link>
         <span>{p.text}</span>
        </li>
       ))}
      </ul>
     </div>
    </section>

    <section className="pg-demo-universe" id="product-demo" aria-labelledby="pg-demo-universe-h">
     <div className="pg-demo-universe-head">
      <h2 id="pg-demo-universe-h">Demo Research Universe product previews</h2>
      <p>Pack-backed conflict pairs from seeded scenarios. Not scientific approval.</p>
     </div>
     <DemoLandingPreviewPanel/>
    </section>

    <HomepageWorkedConflict/>

    <section className="pg-links" aria-labelledby="pg-domains-h">
     <div className="pg-links-row">
      <h2 id="pg-domains-h">Domains</h2>
      <p>Coverage is unequal today. Systemic sclerosis is a validation case, not uniform depth.</p>
      <ul className="pg-domain-list" aria-label="Scientific domains in scope">
       {DOMAINS.map((d)=>(
        <li key={d.label}>
         <Link to={d.to}>{d.label}</Link>
        </li>
       ))}
      </ul>
     </div>
    </section>

    <section className="pg-links" aria-labelledby="pg-audiences-h">
     <div className="pg-links-row">
      <h2 id="pg-audiences-h">Audiences</h2>
      <p>Enterprise shells are demonstration previews until organisation features are accepted.</p>
      <ul className="pg-audience-list">
       {AUDIENCES.map((a)=>(
        <li key={a.label}>
         <Link to={a.to}>{a.label}</Link>
        </li>
       ))}
      </ul>
     </div>
    </section>

    <section className="pg-open" aria-labelledby="pg-open-h">
     <div className="pg-open-head">
      <h2 id="pg-open-h">Open questions on the graph.</h2>
      <p>Recorded gaps — candidates for expert review, not findings.</p>
      <Link className="pg-btn pg-btn-light" to="/research/gaps">
       Open the Gap Register <span aria-hidden="true">→</span>
      </Link>
     </div>
     <OpenQuestions/>
    </section>

    <section className="pg-product" aria-labelledby="pg-product-h">
     <div className="pg-product-copy">
      <h2 id="pg-product-h">Your research home</h2>
      <p>
       Describe your area. HSI assembles a home with literature radar, gap finder, hypothesis ledger and a
       graph scoped to your topics.
      </p>
      <ul>
       <li>
        <b>Investigations with proof.</b> A failed source is shown as failed, never as nothing found.
       </li>
       <li>
        <b>Your gaps, hypotheses and methods.</b> Kept on your device today, with a history of every change.
       </li>
       <li>
        <b>One place to continue.</b> Progress and activity drawn from real records only.
       </li>
      </ul>
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

    <section className="pg-honest" aria-labelledby="pg-honest-h">
     <h2 id="pg-honest-h">Limits, stated up front</h2>
     <ul className="pg-honest-list">
      {LIMITS.map((line)=>(
       <li key={line}>
        <span className="pg-honest-mark" aria-hidden="true">—</span>
        <span>{line}</span>
       </li>
      ))}
     </ul>
     <p>
      <Link className="pg-link" to="/validation">
       Review the validation approach <span aria-hidden="true">→</span>
      </Link>
      {" · "}
      <Link className="pg-link" to="/trust">
       Governance and privacy <span aria-hidden="true">→</span>
      </Link>
     </p>
    </section>

    <section className="pg-close" aria-labelledby="pg-close-h">
     <div>
      <h2 id="pg-close-h">See scientific intelligence in action.</h2>
      <p>Open the workbench, walk the platform loop, or set up a research home.</p>
     </div>
     <div className="pg-cta">
      <Link className="pg-btn pg-btn-light" to={LIVE_INVESTIGATION_PATH}>
       Scientific workbench <span aria-hidden="true">→</span>
      </Link>
      <Link className="pg-link pg-link-light" to="/how-it-works">
       Explore the platform
      </Link>
      <Link className="pg-link pg-link-light" to="/welcome">
       Set up research home
      </Link>
     </div>
    </section>
   </GraphSnapshotProvider>
  </div>
 );
}
