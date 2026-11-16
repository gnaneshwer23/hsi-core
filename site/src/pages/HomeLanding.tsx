import {Link} from "react-router-dom";
import {GraphSnapshotProvider,useGraphSnapshot} from "../components/home/useGraphSnapshot";
import {LiveGraphHero} from "../components/home/LiveGraphHero";
import {OpenQuestions} from "../components/home/OpenQuestions";
import "../styles/premium-public.css";

const PILLARS=[
 {n:"01",title:"Every claim keeps its evidence.",text:"A relationship is stored with its source, the model it was studied in, tissue, population, assay and limitations, and its review status. Findings that did not hold stay in the graph instead of being dropped.",to:"/knowledge-graph",cta:"See how a line is built"},
 {n:"02",title:"It shows what is missing, and says how sure it is.",text:"A gap is first only a gap in the graph. HSI then counts the literature for it, and only an expert decides whether it is a real gap in knowledge. The three are never mixed up.",to:"/research/gaps",cta:"Open the Gap Register"},
 {n:"03",title:"It keeps patient data apart.",text:"Patient-level work runs in a separate, governed plane. Here that plane holds synthetic patients only, small groups are suppressed, and trial pre-screening reports what is unknown instead of saying someone is eligible.",to:"/trust",cta:"Read the governance model"},
] as const;

const FLOW=[
 {title:"Frame the question",text:"Match the genes, cells, diseases and drugs you name to concepts in the graph.",status:"Live"},
 {title:"Retrieve evidence",text:"Search Europe PMC, OpenAlex and Open Targets, with a trace of how the answer was produced and which searches failed.",status:"Live public sources"},
 {title:"Weigh support and conflict",text:"Compare findings by model, tissue, population and assay, so a real conflict can be told from a difference in context.",status:"Published snapshot · unreviewed"},
 {title:"Find what is missing",text:"Rank graph gaps, count the literature for each, and leave the final call to an expert.",status:"Live counts · expert review separate"},
 {title:"Form a testable hypothesis",text:"State a prediction and what would prove it wrong, and keep the history of every change.",status:"Kept on your device"},
 {title:"Review before anything enters the graph",text:"Independent reviewers decide what is promoted. Nothing is promoted automatically, and nothing is reviewed yet.",status:"Workflow built · no claim reviewed"},
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
    <section className="pg-hero pg-hero-dark" aria-labelledby="home-title">
     <div className="pg-hero-copy">
      <h1 id="home-title">Human biology as a living knowledge graph that shows where the evidence stops.</h1>
      <p className="pg-lead">Findings are scattered across papers, models and experimental contexts. HSI connects them in one graph, keeps each claim's source, context and review status, and marks what conflicts and what is missing, so the next experiment is a decision, not a guess.</p>
      <div className="pg-cta"><Link className="pg-btn pg-btn-light" to="/welcome">Set up your research home <span aria-hidden="true">→</span></Link><Link className="pg-link pg-link-light" to="/how-it-works">See how it works</Link></div>
      <p className="pg-micro">Research preview. Candidate-only: nothing here is scientifically approved. No account is needed to start, public evidence is live, and patient data is synthetic.</p>
     </div>
     <LiveGraphHero/>
    </section>
    <div className="pg-strip"><Status/></div>

    <section className="pg-pillars" aria-labelledby="pg-pillars-h">
     <h2 id="pg-pillars-h">What makes it different from a literature search.</h2>
     <p className="pg-sec-lead">A search returns papers. HSI keeps the structure of what the papers claim, and what they leave out.</p>
     <ol>{PILLARS.map(p=>(
      <li key={p.n}><span className="pg-pn" aria-hidden="true">{p.n}</span><h3>{p.title}</h3><p>{p.text}</p><Link className="pg-link" to={p.to}>{p.cta} <span aria-hidden="true">→</span></Link></li>
     ))}</ol>
    </section>

    <section className="pg-open" aria-labelledby="pg-open-h">
     <div className="pg-open-head">
      <h2 id="pg-open-h">Questions the graph is open on today.</h2>
      <p>These are the gaps recorded in the published graph. Each opens its concepts, evidence and the next study a researcher could run. They are candidates for expert review, not findings.</p>
      <Link className="pg-btn pg-btn-light" to="/research/gaps">Open the Gap Register <span aria-hidden="true">→</span></Link>
     </div>
     <OpenQuestions/>
    </section>

    <section className="pg-loop" aria-labelledby="pg-loop-h">
     <div className="pg-loop-head">
      <h2 id="pg-loop-h">From a question to a testable next step.</h2>
      <p>Each step says whether it runs on live sources, on the published snapshot, or only on your device.</p>
      <Link className="pg-link" to="/how-it-works">Walk through all eight steps <span aria-hidden="true">→</span></Link>
     </div>
     <ol className="pg-steps" aria-label="The research loop">{FLOW.map((s,i)=>(
      <li key={s.title}><span className="pg-num" aria-hidden="true">{i+1}</span><div><h3>{s.title}</h3><span className="pg-chip">{s.status}</span><p>{s.text}</p></div></li>
     ))}</ol>
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
      <div className="pg-cta"><Link className="pg-btn" to="/welcome">Set up your research home <span aria-hidden="true">→</span></Link></div>
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
     <h2 id="pg-honest-h">Limits, stated up front</h2>
     <ul>{LIMITS.map(h=>(<li key={h.title}><h3>{h.title}</h3><p>{h.text}</p></li>))}</ul>
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
