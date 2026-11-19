import {Link} from "react-router-dom";
import {DemoLandingPreviewPanel} from "../components/demo/DemoLandingPreviewPanel";
import {GraphSnapshotProvider,useGraphSnapshot} from "../components/home/useGraphSnapshot";
import {LiveGraphHero} from "../components/home/LiveGraphHero";
import {OpenQuestions} from "../components/home/OpenQuestions";
import {ClaimAnatomy} from "../components/home/ClaimAnatomy";
import {HomepageWorkedConflict} from "../components/home/HomepageWorkedConflict";
import {ScientificIntelligenceJourney} from "../components/home/ScientificIntelligenceJourney";
import {LIVE_INVESTIGATION_PATH} from "../lib/workbenchPrimary";
import "../styles/premium-public.css";

/** Three product differentiators — linked only to real surfaces. */
const USPS=[
 {
  n:"01",
  title:"Context-aware disagreement analysis",
  text:"Compare findings by model, tissue, dose and endpoint before treating them as contradiction. When studies are not comparable, HSI says so and abstains.",
  to:"/context-conflict-audit",
  cta:"Open the context comparison",
 },
 {
  n:"02",
  title:"Cross-domain mechanism investigation",
  text:"Follow candidate relationships across immunology, neuroscience, microbiome, metabolism, genomics and tissue biology on the published graph — with source and review status attached.",
  to:"/knowledge-graph",
  cta:"Explore the knowledge graph",
 },
 {
  n:"03",
  title:"Connected research collaboration",
  text:"Keep questions, evidence, gaps and briefs in one research path. Group and role workspaces remain demonstration-labelled until organisation features are accepted.",
  to:"/welcome",
  cta:"Set up a research home",
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
 {
  title:"Evidence, inference and approval stay separate.",
  text:"Graph relationships are candidates with source, context and review status. Nothing here is scientifically approved.",
 },
 {
  title:"Patient data stays in a separate plane.",
  text:"This preview uses synthetic patients only. The release gate refuses non-synthetic clinical data.",
 },
 {
  title:"What is not true yet.",
  text:"Dual-model checks are off by default, many saves remain on-device, there is no real patient data, and nothing is clinical advice.",
 },
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
    <section className="pg-hero pg-hero-dark pg-hero-console pg-hero-stage2" aria-labelledby="home-title">
     <div className="pg-hero-copy">
      <h1 id="home-title">
       <span className="pg-brand">Human Super Intelligence</span>{" "}
       Biology is connected. Scientific intelligence should be too.
      </h1>
      <p className="pg-lead">
       A connected biomedical intelligence platform that brings together scientific evidence, biological mechanisms, knowledge graphs and AI-powered investigation — helping researchers understand what is known, uncover what remains uncertain, and make better-informed research decisions.
      </p>
      <div className="pg-cta">
       <Link className="pg-btn pg-btn-light" to="/how-it-works">
        Explore the platform <span aria-hidden="true">→</span>
       </Link>
       <Link className="pg-link pg-link-light" to={LIVE_INVESTIGATION_PATH}>
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

    <section className="pg-story" aria-labelledby="pg-challenge-h">
     <div className="pg-story-block">
      <h2 id="pg-challenge-h">Biomedical knowledge is growing. Evidence is still fragmented.</h2>
      <p>
       Findings sit across publications, experiments, biological systems and disciplines. Researchers must decide what conflicts, what is merely non-comparable context, and what remains unknown — without losing the trail to the source.
      </p>
     </div>
     <div className="pg-story-block">
      <h2 id="pg-vision-h">From disconnected information to connected understanding.</h2>
      <p>
       HSI moves researchers from scattered scientific records toward evidence-grounded understanding of human biology: what is known, what is uncertain, and what to investigate next — with provenance attached.
      </p>
     </div>
    </section>

    <ScientificIntelligenceJourney/>

    <section className="pg-demo-universe" id="product-demo" aria-labelledby="pg-demo-universe-h">
     <div className="pg-open-head">
      <h2 id="pg-demo-universe-h">Demo Research Universe product previews</h2>
      <p>Pack-backed conflict pairs from seeded Demo Universe scenarios. Not scientific approval. Open the full comparison desk for briefs, abstention and assay sketches.</p>
     </div>
     <DemoLandingPreviewPanel/>
    </section>

    <section className="pg-pillars" aria-labelledby="pg-pillars-h">
     <div className="pg-pillars-copy">
      <h2 id="pg-pillars-h">What makes it different.</h2>
      <p className="pg-sec-lead">
       Three capabilities define the product. Each links to a working surface — labelled for what is live,
       illustrative or not yet reviewed.
      </p>
      <ol>
       {USPS.map((p)=>(
        <li key={p.n}>
         <span className="pg-pn" aria-hidden="true">{p.n}</span>
         <div>
          <h3>{p.title}</h3>
          <p>{p.text}</p>
          <Link className="pg-link" to={p.to}>
           {p.cta} <span aria-hidden="true">→</span>
          </Link>
         </div>
        </li>
       ))}
      </ol>
     </div>
     <ClaimAnatomy/>
    </section>

    <HomepageWorkedConflict/>

    <section className="pg-domains" aria-labelledby="pg-domains-h">
     <h2 id="pg-domains-h">Explore scientific domains through one graph.</h2>
     <p className="pg-sec-lead">
      Coverage is unequal today. Systemic sclerosis remains a validation case, not a claim of uniform depth
      across biology.
     </p>
     <ul className="pg-domain-list" aria-label="Scientific domains in scope">
      {DOMAINS.map((d)=>(
       <li key={d.label}>
        <Link to={d.to}>{d.label}</Link>
       </li>
      ))}
     </ul>
    </section>

    <section className="pg-audiences" aria-labelledby="pg-audiences-h">
     <h2 id="pg-audiences-h">Built for how research is organised.</h2>
     <p className="pg-sec-lead">
      Choose the path that matches your role. Enterprise shells are demonstration previews until organisation
      features are accepted.
     </p>
     <ul className="pg-audience-list">
      {AUDIENCES.map((a)=>(
       <li key={a.label}>
        <Link to={a.to}>{a.label}</Link>
       </li>
      ))}
     </ul>
    </section>

    <section className="pg-open" aria-labelledby="pg-open-h">
     <div className="pg-open-head">
      <h2 id="pg-open-h">Questions the graph is open on today.</h2>
      <p>
       Gaps recorded in the published graph. Each opens concepts, evidence and a next study a researcher could
       run. Candidates for expert review — not findings.
      </p>
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
     <ul>
      {LIMITS.map((h)=>(
       <li key={h.title}>
        <h3>{h.title}</h3>
        <p>{h.text}</p>
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
      <p>Open the workbench on a curated investigation, walk the platform loop, or set up a research home around your topics.</p>
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
