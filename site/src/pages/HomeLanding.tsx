import {Link} from "react-router-dom";
import {DemoLandingPreviewPanel} from "../components/demo/DemoLandingPreviewPanel";
import {CellLattice} from "../components/cinematic/CellLattice";
import {MicroTiles} from "../components/cinematic/MicroTiles";
import {GraphSnapshotProvider,useGraphSnapshot} from "../components/home/useGraphSnapshot";
import {LiveGraphHero} from "../components/home/LiveGraphHero";
import {RelationshipDiagram} from "../components/landing/RelationshipDiagram";

const DOMAINS=[
 {label:"Immunology and inflammation",to:"/research/knowledge-graph?netDepartment=immunology"},
 {label:"Neuroscience",to:"/research/knowledge-graph?netDepartment=neuroscience"},
 {label:"Microbiome and metabolism",to:"/research/knowledge-graph?netDepartment=microbiome"},
 {label:"Genomics and multi-omics",to:"/research/knowledge-graph?netDepartment=genomics-multi-omics"},
 {label:"Organ and tissue biology",to:"/research/knowledge-graph?netDepartment=human-physiology"},
 {label:"Disease mechanisms",to:"/knowledge-graph"},
] as const;

const CHALLENGES=[
 "Evidence is scattered across databases and disciplines.",
 "Experimental conditions are easily lost when findings are summarised.",
 "Contradictory results are difficult to interpret.",
 "Important research gaps remain difficult to identify.",
 "Researchers spend valuable time connecting information rather than investigating the next question.",
];

const CAPABILITIES=[
 ["Explore the evidence","Discover relevant publications and inspect the scientific basis behind findings."],
 ["Connect biological mechanisms","Explore relationships across genes, cells, pathways, organs and diseases."],
 ["Understand disagreements","Compare conflicting findings in their biological and experimental context."],
 ["Identify research gaps","Investigate missing evidence, unresolved mechanisms and questions worth testing."],
 ["Develop research hypotheses","Explore provisional explanations, experiments and alternative approaches."],
 ["Discover scientific expertise","Identify relevant research groups and complementary capabilities."],
] as const;

const JOURNEY=["Ask a question","Explore evidence","Compare findings","Investigate mechanisms","Identify gaps","Develop hypotheses","Generate a research brief"];

function Icon(){
 return <span className="cine-ico" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2.2" stroke="currentColor"/><path d="M7 1.5v2M7 10.5v2M1.5 7h2M10.5 7h2" stroke="currentColor"/></svg></span>;
}

function Status(){
 const {snapshot:s,failed}=useGraphSnapshot();
 return (
  <p className="pg-status" role="status">
   {s?(
    <>
     <b>{s.concepts.toLocaleString("en-GB")}</b> concepts <i aria-hidden="true">·</i>{" "}
     <b>{s.relationships.toLocaleString("en-GB")}</b> candidate relationships <i aria-hidden="true">·</i>{" "}
     <b>{s.gaps.length}</b> recorded gaps <i aria-hidden="true">·</i> <b>{s.reviewed}</b> scientifically reviewed
    </>
   ):failed?"Snapshot unavailable. No substitute figures are shown.":"Verifying the published snapshot…"}
  </p>
 );
}

function LatticeLabels(){
 const {snapshot}=useGraphSnapshot();
 const labels=snapshot?.network.nodes.slice(0,7).map(n=>n.name)??[];
 return <CellLattice labels={labels}/>;
}

export function HomeLanding(){
 return (
  <GraphSnapshotProvider>
   <div className="cine">
    <section className="cine-hero pg-hero" aria-labelledby="home-title">
     <div className="cine-hero-copy">
      <p className="cine-eye">— Human Super Intelligence · Scientific discovery</p>
      <h1 id="home-title">Your next scientific discovery starts with a <em>better question.</em></h1>
      <p className="cine-lead">Scientific knowledge is expanding. Understanding how it connects is the challenge.</p>
      <p className="cine-copy">Human Super Intelligence brings biomedical evidence, biological mechanisms and scientific context together to help researchers explore complex questions, understand conflicting findings and discover what to investigate next.</p>
      <div className="cine-cta pg-cta">
       <Link className="cine-btn" to="/how-it-works">Explore HSI</Link>
       <Link className="cine-btn cine-btn-line" to="/knowledge-graph">Explore the Knowledge Graph</Link>
      </div>
      <p className="cine-note">Research preview. Scientific findings and AI-generated hypotheses are not automatically validated.</p>
     </div>
     <div className="cine-stage"><LatticeLabels/></div>
    </section>

    <section className="cine-sheet" aria-labelledby="cine-challenge">
     <div className="cine-wrap cine-split">
      <div>
       <p className="cine-eye">— The challenge</p>
       <h2 id="cine-challenge">Research is advancing. Knowledge remains fragmented.</h2>
      </div>
      <div>
       <p>A single scientific question can span thousands of publications, multiple biological systems and years of experimental findings. Yet the connections between those findings are often difficult to discover.</p>
       <ul className="cine-list">
        {CHALLENGES.map(item=><li key={item} className="cine-cap"><Icon/>{item}</li>)}
       </ul>
       <p>What if scientific knowledge could be explored as a connected system?</p>
      </div>
     </div>
    </section>

    <section className="cine-section" aria-labelledby="pg-proof-h">
     <div className="cine-wrap">
      <p className="cine-eye">— The knowledge graph</p>
      <div className="cine-split">
       <h2 id="pg-proof-h">Biology doesn’t operate in silos. Neither should scientific intelligence.</h2>
       <p>The HSI Living Biomedical Knowledge Graph is designed to connect relationships while preserving their evidence, context, uncertainty and review status. Every relationship on this page is a candidate. Nothing here is approved.</p>
      </div>
      <div className="pg-proof">
       <LiveGraphHero/>
       <Status/>
      </div>
      <div className="cine-section" style={{paddingTop:"3rem"}}>
       <h2>Open a connection.</h2>
       <p>Evidence, conditions, then review status.</p>
       <RelationshipDiagram/>
      </div>
     </div>
    </section>

    <section className="cine-section" aria-labelledby="cine-platform">
     <div className="cine-wrap cine-split">
      <div>
       <p className="cine-eye">— The platform</p>
       <h2 id="cine-platform">One intelligence platform. Connected scientific understanding.</h2>
       <p>HSI combines six capabilities. Some are in the research preview. Others are still being built, and the pages say which.</p>
      </div>
      <ul className="cine-list">
       {CAPABILITIES.map(([title,text])=>(
        <li key={title}><h3 style={{margin:"0 0 .2rem",fontSize:"1.05rem"}}>{title}</h3><p style={{margin:0}}>{text}</p></li>
       ))}
      </ul>
     </div>
    </section>

    <section className="cine-section" aria-labelledby="pg-domains-h">
     <div className="cine-wrap cine-split">
      <div>
       <p className="cine-eye">— Cross-domain intelligence</p>
       <h2 id="pg-domains-h">Six scientific domains. One connected view.</h2>
       <p>Explore questions that cross conventional disciplinary boundaries without losing the context that makes scientific evidence meaningful.</p>
      </div>
      <ul className="cine-list pg-domain-list" aria-label="Scientific domains in scope">
       {DOMAINS.map(d=><li key={d.label}><Link to={d.to}><Icon/>{d.label}</Link></li>)}
      </ul>
     </div>
     <div className="cine-wrap">
      <MicroTiles/>
      <p className="cine-note">Abstract renderings generated in the browser. Not experimental images.</p>
     </div>
    </section>

    <section className="cine-section" id="product-demo" aria-labelledby="pg-demo-universe-h">
     <div className="cine-wrap">
      <p className="cine-eye">— Scientific investigation</p>
      <h2>Go beyond finding papers.</h2>
      <ol className="cine-steps" aria-label="Question to research brief">
       {JOURNEY.map((step,i)=><li key={step}><b>0{i+1}</b><div><h3>{step}</h3></div></li>)}
      </ol>
      <p>HSI is being developed to connect the scientific investigation process into one traceable workflow.</p>
      <h2 id="pg-demo-universe-h">Compare findings across contexts.</h2>
      <p>Labelled Example studies. Not an approval.</p>
      <DemoLandingPreviewPanel/>
     </div>
    </section>

    <section className="cine-section" aria-labelledby="cine-agents">
     <div className="cine-wrap cine-split">
      <div>
       <p className="cine-eye">— The intelligence collective</p>
       <h2 id="cine-agents">Specialised scientific responsibilities. One connected investigation.</h2>
      </div>
      <div>
       <p>HSI’s agent architecture coordinates evidence discovery, source integrity, biological mapping, mechanism investigation, contradiction analysis, verification and research evaluation. Agents propose and analyse. Scientific evidence and authorised review determine what can be trusted.</p>
       <div className="cine-cta" style={{justifyContent:"flex-start"}}>
        <Link className="cine-btn" to="/intelligence">Explore Scientific Intelligence</Link>
       </div>
      </div>
     </div>
    </section>

    <section className="cine-section" aria-labelledby="cine-gaps">
     <div className="cine-wrap">
      <p className="cine-eye">— Research gaps</p>
      <h2 id="cine-gaps">The next breakthrough may begin with what’s missing.</h2>
      <p>Recorded gaps in the published snapshot are shown as they are. A dedicated Gap Navigator is under development.</p>
      <GapList/>
      <Link className="cine-btn cine-btn-line" to="/research-gaps">Explore the Research Gap Vision</Link>
     </div>
    </section>

    <section className="cine-section" aria-labelledby="cine-companion">
     <div className="cine-wrap cine-split">
      <div>
       <p className="cine-future">Future capability</p>
       <h2 id="cine-companion">A scientific companion for deeper conversations.</h2>
      </div>
      <div>
       <p>Imagine discussing a complex biological mechanism, challenging an interpretation or exploring alternative experiments through a natural scientific conversation. HSI is developing toward an evidence-grounded Scientific Companion with text, voice and optional audiovisual interaction.</p>
       <p>Future capability — not currently advertised as a live service.</p>
       <Link className="cine-btn cine-btn-line" to="/scientific-companion">Explore the Scientific Companion Vision</Link>
      </div>
     </div>
    </section>

    <section className="cine-section" aria-labelledby="cine-network">
     <div className="cine-wrap cine-split">
      <h2 id="cine-network">Great science rarely happens in isolation.</h2>
      <div>
       <p>HSI’s future Research Network aims to connect scientific questions with relevant people, expertise and verified opportunities. Community and matching capabilities are being developed. Interest and opportunity status must be independently verified.</p>
       <Link className="cine-btn cine-btn-line" to="/research-community">Explore the Research Community</Link>
      </div>
     </div>
    </section>

    <section className="cine-section" aria-labelledby="pg-close-h">
     <div className="cine-wrap">
      <p className="cine-eye">— Trust</p>
      <p className="cine-promise">Understand the mechanism. Preserve the evidence. Explain the uncertainty. Inform the next decision.</p>
      <h2 id="pg-close-h">Better questions. Clearer evidence. More informed research.</h2>
      <p>From scientific questions to scientific progress. Explore the scientific intelligence already taking shape inside HSI.</p>
      <div className="cine-cta" style={{justifyContent:"flex-start"}}>
       <Link className="cine-btn" to="/how-it-works">Explore the Research Preview</Link>
       <Link className="cine-btn cine-btn-line" to="/validation">Read the scientific boundaries</Link>
      </div>
     </div>
    </section>
   </div>
  </GraphSnapshotProvider>
 );
}

function GapList(){
 const {snapshot}=useGraphSnapshot();
 if(!snapshot) return <p className="cine-note">Verifying recorded gaps from the published snapshot…</p>;
 return (
  <ul className="cine-list">
   {snapshot.gaps.slice(0,4).map(g=><li key={g.question}><h3 style={{margin:0,fontSize:"1rem"}}>{g.question}</h3><p style={{margin:".2rem 0 0"}}>{g.missing}</p></li>)}
  </ul>
 );
}
