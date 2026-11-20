import {Link} from "react-router-dom";
import {GraphSnapshotProvider,useGraphSnapshot} from "../components/home/useGraphSnapshot";
import {LiveGraphHero} from "../components/home/LiveGraphHero";
import {OpenQuestions} from "../components/home/OpenQuestions";
import {ClaimAnatomy} from "../components/home/ClaimAnatomy";
import {HomepageWorkedConflict} from "../components/home/HomepageWorkedConflict";
import {ScientificIntelligenceJourney} from "../components/home/ScientificIntelligenceJourney";
import {LIVE_INVESTIGATION_PATH} from "../lib/workbenchPrimary";
import "../styles/premium-public.css";

const DOMAINS=[
 "Immunology & Inflammation",
 "Neuroscience",
 "Microbiome & Metabolism",
 "Genomics & Multi-omics",
 "Organ & Tissue Biology",
 "Disease Mechanisms",
] as const;

const PILLARS=[
 {n:"01",title:"Every claim keeps its evidence.",text:"A relationship is stored with its source, the model it was studied in, tissue, population, assay and limitations, and its review status. Findings that did not hold stay in the graph instead of being dropped.",to:"/knowledge-graph",cta:"See how a line is built"},
 {n:"02",title:"It shows what is missing, and says how sure it is.",text:"A gap is first only a gap in the graph. HSI then counts the literature for it, and only an expert decides whether it is a real gap in knowledge. The three are never mixed up.",to:"/research/gaps",cta:"Open the Gap Register"},
 {n:"03",title:"It keeps patient data apart.",text:"Patient-level work runs in a separate, governed plane. Here that plane holds synthetic patients only, small groups are suppressed, and trial pre-screening reports what is unknown instead of saying someone is eligible.",to:"/trust",cta:"Read the governance model"},
] as const;

const LIMITS=[
 {title:"Evidence, inference and approval stay separate.",text:"Every relationship in the graph is a candidate with its source, experimental context and review status. Nothing is scientifically approved."},
 {title:"Patient data lives in a separate plane.",text:"Here it is synthetic only, and the release gate refuses anything else. Small groups are suppressed before any total leaves."},
 {title:"What is not true yet.",text:"Model checks are off, saved work is on your device and not a server, there is no real patient data, and nothing is clinical advice."},
] as const;

function Status(){
 const {snapshot:s,failed}=useGraphSnapshot();
 return <p className="pg-status" role="status">{s?<><b>{s.concepts.toLocaleString("en-GB")}</b> concepts <i aria-hidden="true">·</i> <b>{s.relationships.toLocaleString("en-GB")}</b> candidate relationships <i aria-hidden="true">·</i> <b>{s.gaps.length}</b> recorded gaps <i aria-hidden="true">·</i> <b>{s.reviewed}</b> scientifically reviewed</>:failed?"Snapshot unavailable. No substitute figures are shown.":"Verifying the published snapshot…"}</p>;
}

export function HomeLanding(){
 return (
  <div className="pg-page">
   <GraphSnapshotProvider>
    <section className="pg-hero pg-hero-dark pg-hero-console" aria-labelledby="home-title">
     <div className="pg-hero-copy">
      <h1 id="home-title"><span className="pg-brand">Human Super Intelligence</span> Biology is connected. Scientific intelligence should be too.</h1>
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
    <div className="pg-strip"><Status/></div>

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

    <HomepageWorkedConflict/>

    <section className="pg-domains" aria-labelledby="pg-domains-h">
     <div className="pg-domains-copy">
      <h2 id="pg-domains-h">Explore scientific domains through one graph.</h2>
      <p>
       Cross-domain scope is the product. Depth is unequal today: published candidates concentrate where the validation case is deepest, and other domains remain thinner until expert review expands them.
      </p>
     </div>
     <ul className="pg-domain-list" aria-label="Scientific domains in scope">
      {DOMAINS.map((d)=>(
       <li key={d}>{d}</li>
      ))}
     </ul>
    </section>

    <section className="pg-pillars" aria-labelledby="pg-pillars-h">
     <div className="pg-pillars-copy">
      <h2 id="pg-pillars-h">What makes it different from a literature search.</h2>
      <p className="pg-sec-lead">Search is getting smarter. HSI still has to go further: keep the structure of what papers claim, under which experimental conditions, and what they leave out.</p>
      <ol>{PILLARS.map(p=>(
       <li key={p.n}><span className="pg-pn" aria-hidden="true">{p.n}</span><div><h3>{p.title}</h3><p>{p.text}</p><Link className="pg-link" to={p.to}>{p.cta} <span aria-hidden="true">→</span></Link></div></li>
      ))}</ol>
     </div>
     <ClaimAnatomy/>
    </section>

    <section className="pg-open" aria-labelledby="pg-open-h">
     <div className="pg-open-head">
      <h2 id="pg-open-h">Questions the graph is open on today.</h2>
      <p>These are the gaps recorded in the published graph. Each opens its concepts, evidence and the next study a researcher could run. They are candidates for expert review, not findings.</p>
      <Link className="pg-btn pg-btn-light" to="/research/gaps">Open the Gap Register <span aria-hidden="true">→</span></Link>
     </div>
     <OpenQuestions/>
    </section>

    <section className="pg-product" aria-labelledby="pg-product-h">
     <div className="pg-product-copy">
      <h2 id="pg-product-h">Your research home</h2>
      <p>Answer a few questions about your area. HSI builds a home with a literature radar, a gap finder, a hypothesis ledger and a knowledge graph around your own topics. Setup takes about two minutes.</p>
      <ul>
       <li><b>Investigations with proof.</b> A failed source is shown as failed, never as nothing found.</li>
       <li><b>Your gaps, hypotheses and methods.</b> Kept on your device today, with a history of every change.</li>
       <li><b>One place to pick up.</b> Your loop progress and activity, from real records only.</li>
      </ul>
      <div className="pg-cta">
       <Link className="pg-btn" to="/welcome">Set up your research home <span aria-hidden="true">→</span></Link>
       <Link className="pg-link" to={LIVE_INVESTIGATION_PATH}>Open scientific workbench <span aria-hidden="true">→</span></Link>
      </div>
     </div>
     <div className="pg-shots">
      <figure className="pg-shot">
       <img src="/images/product/dashboard-v2.webp" width={1440} height={1120} alt="The researcher home: four numbers for your own research area, then your knowledge graph with a panel listing the recorded relationships of the selected concept, each with its source." loading="lazy" decoding="async"/>
       <figcaption><b>Your home.</b> Built from your own topics: the numbers, the graph around them and the evidence behind each line.</figcaption>
      </figure>
      <figure className="pg-shot">
       <img src="/images/product/explorer-v2.webp" width={1440} height={900} alt="The knowledge graph explorer: a dark live network coloured by department with amber markers for research gaps, and a panel showing evidence by model and a research gap with its status." loading="lazy" decoding="async"/>
       <figcaption><b>The explorer.</b> Filter, select, trace a route between concepts and open any research gap with its evidence.</figcaption>
      </figure>
     </div>
    </section>

    <section className="pg-honest" aria-labelledby="pg-honest-h">
     <h2 id="pg-honest-h">Trust through scientific transparency</h2>
     <ul>{LIMITS.map(h=>(<li key={h.title}><h3>{h.title}</h3><p>{h.text}</p></li>))}</ul>
     <p><Link className="pg-link" to="/trust">Read how evidence, privacy and governance are handled <span aria-hidden="true">→</span></Link></p>
    </section>

    <section className="pg-close" aria-labelledby="pg-close-h">
     <div>
      <h2 id="pg-close-h">See scientific intelligence in action.</h2>
      <p>Open the workbench on a curated investigation, walk the platform loop, or set up a research home around your topics.</p>
     </div>
     <div className="pg-cta">
      <Link className="pg-btn pg-btn-light" to={LIVE_INVESTIGATION_PATH}>Scientific workbench <span aria-hidden="true">→</span></Link>
      <Link className="pg-link pg-link-light" to="/how-it-works">Explore the platform</Link>
      <Link className="pg-link pg-link-light" to="/welcome">Set up research home</Link>
     </div>
    </section>
   </GraphSnapshotProvider>
  </div>
 );
}
