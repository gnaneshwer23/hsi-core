import {Link} from "react-router-dom";
import {DemoLandingPreviewPanel} from "../components/demo/DemoLandingPreviewPanel";
import {CellLattice} from "../components/cinematic/CellLattice";
import {FigureBoard,FigurePath} from "../components/cinematic/Figures";
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
 {n:"01",title:"Scattered evidence",text:"Evidence is scattered across databases and disciplines."},
 {n:"02",title:"Lost conditions",text:"Experimental conditions are easily lost when findings are summarised."},
 {n:"03",title:"Hard contradictions",text:"Contradictory results are difficult to interpret."},
 {n:"04",title:"Hidden gaps",text:"Important research gaps remain difficult to identify."},
 {n:"05",title:"Time on connecting",text:"Researchers spend valuable time connecting information rather than investigating the next question."},
] as const;

const CAPABILITIES=[
 ["Explore the evidence","Discover relevant publications and inspect the scientific basis behind findings."],
 ["Connect biological mechanisms","Explore relationships across genes, cells, pathways, organs and diseases."],
 ["Understand disagreements","Compare conflicting findings in their biological and experimental context."],
 ["Identify research gaps","Investigate missing evidence, unresolved mechanisms and questions worth testing."],
 ["Develop research hypotheses","Explore provisional explanations, experiments and alternative approaches."],
 ["Discover scientific expertise","Identify relevant research groups and complementary capabilities."],
] as const;

const JOURNEY=["Ask a question","Explore evidence","Compare findings","Investigate mechanisms","Identify gaps","Develop hypotheses","Generate a research brief"];

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
     <div className="cine-wrap">
      <p className="cine-eye">— The challenge</p>
      <h2 id="cine-challenge">Research is advancing. Knowledge remains fragmented.</h2>
      <p>A single scientific question can span thousands of publications, multiple biological systems and years of experimental findings.</p>
      <FigurePath label="Why knowledge stays fragmented" onSheet steps={CHALLENGES}/>
      <p>What if scientific knowledge could be explored as a connected system?</p>
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
     <div className="cine-wrap">
      <p className="cine-eye">— The platform</p>
      <h2 id="cine-platform">One intelligence platform. Connected scientific understanding.</h2>
      <p>HSI combines six capabilities. Some are in the research preview. Others are still being built, and the pages say which.</p>
      <FigureBoard label="Six capabilities" cells={CAPABILITIES.map(([title,text],i)=>({n:String(i+1).padStart(2,"0"),title,text}))}/>
     </div>
    </section>

    <section className="cine-section" aria-labelledby="pg-domains-h">
     <div className="cine-wrap">
      <p className="cine-eye">— Cross-domain intelligence</p>
      <h2 id="pg-domains-h">Six scientific domains. One connected view.</h2>
      <p>Explore questions that cross conventional disciplinary boundaries without losing the context that makes scientific evidence meaningful.</p>
      <ul className="fig-hub pg-domain-list" aria-label="Scientific domains in scope">
       {DOMAINS.map((d,i)=><li key={d.label}><Link to={d.to}><span className="fig-node">{String(i+1).padStart(2,"0")}</span>{d.label}</Link></li>)}
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
      <FigurePath label="Question to research brief" steps={JOURNEY.map((title,i)=>({n:String(i+1).padStart(2,"0"),title}))}/>
      <p>HSI is being developed to connect the scientific investigation process into one traceable workflow.</p>
      <h2 id="pg-demo-universe-h">Compare findings across contexts.</h2>
      <p>Labelled Example studies. Not an approval.</p>
      <DemoLandingPreviewPanel/>
     </div>
    </section>

    <section className="cine-section" id="scientific-memory" aria-labelledby="cine-memory">
     <div className="cine-wrap">
      <p className="cine-eye">— Scientific memory · In development</p>
      <div className="cine-split">
       <h2 id="cine-memory">Science should build on what you already know.</h2>
       <p>HSI is developing a governed scientific memory layer to help researchers revisit previous questions, evidence references, provisional hypotheses and investigation context without starting from scratch.</p>
      </div>
      <FigurePath label="Planned scientific memory journey" steps={[
       {n:"01",title:"Capture research context",text:"Keep notes, evidence references and provisional ideas distinct."},
       {n:"02",title:"Retrieve relevant context",text:"Combine keyword, conceptual and biological relationship retrieval."},
       {n:"03",title:"Recheck permissions and evidence",text:"Respect scope, current versions and scientific uncertainty."},
       {n:"04",title:"Continue the investigation",text:"Use relevant context to inform the next research question."},
      ]}/>
      <FigureBoard label="Scientific memory development status" cells={[
       {n:"01",title:"Memory foundation",text:"Database and lifecycle procedures tested in disposable PostgreSQL, not a live memory service."},
       {n:"02",title:"Hybrid retrieval",text:"Keyword retrieval tested in fixtures; semantic ranking implemented offline. Vector storage and graph integration remain in development."},
       {n:"03",title:"Research continuity",text:"Personal and permission-based project memory, living scientific notes and investigation recovery are planned experiences."},
      ]}/>
      <p className="cine-note">Research preview roadmap. Persistent scientific memory is not currently enabled for researchers. Remembered content is not verified evidence and does not automatically enter the knowledge graph.</p>
      <Link className="cine-btn cine-btn-line" to="/trust">Explore the scientific trust model</Link>
     </div>
    </section>

    <section className="cine-section" aria-labelledby="cine-agents">
     <div className="cine-wrap cine-split">
      <div>
       <p className="cine-eye">— The intelligence collective</p>
       <h2 id="cine-agents">Specialised scientific responsibilities. One connected investigation.</h2>
      </div>
      <div>
       <p>HSI’s agent architecture coordinates evidence discovery, source integrity, biological mapping, mechanism investigation, contradiction analysis, verification and research evaluation. Governed retrieval of previous research context is being developed as a shared capability, not an independent source of scientific truth. Agents propose and analyse. Scientific evidence and authorised review determine what can be trusted.</p>
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
       <p>Future capability — not currently advertised as a live service. Permission-based conversation continuity is also planned; voice and audiovisual memory are not enabled.</p>
       <Link className="cine-btn cine-btn-line" to="/scientific-companion">Explore the Scientific Companion Vision</Link>
      </div>
     </div>
    </section>

    <section className="cine-section" aria-labelledby="cine-network">
     <div className="cine-wrap cine-split">
      <h2 id="cine-network">Great science rarely happens in isolation.</h2>
      <div>
       <p>HSI’s future Research Network aims to connect scientific questions with relevant people, expertise and verified opportunities. Community and matching capabilities are being developed. Interest and opportunity status must be independently verified. Shared institutional knowledge is a planned capability, with explicit permissions rather than automatic access to private research.</p>
       <Link className="cine-btn cine-btn-line" to="/research-community">Explore the Research Community</Link>
      </div>
     </div>
    </section>

    <section className="cine-section" aria-labelledby="pg-close-h">
     <div className="cine-wrap">
      <p className="cine-eye">— Trust</p>
      <FigurePath label="Scientific commitment" steps={[
       {n:"01",title:"Understand the mechanism"},
       {n:"02",title:"Preserve the evidence"},
       {n:"03",title:"Explain the uncertainty"},
       {n:"04",title:"Inform the next decision"},
      ]}/>
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
