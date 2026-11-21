import {Link} from "react-router-dom";
import {FigureBoard} from "../components/cinematic/Figures";
import {GraphSnapshotProvider} from "../components/home/useGraphSnapshot";
import {HomeResearchGraph as Explorer} from "../components/HomeResearchGraph";
import {RelationshipDiagram} from "../components/landing/RelationshipDiagram";

const faq:[string,string][]=[
 ["Does a line prove causation?","No. A line is a recorded connection. Study design, species and context still decide what it can support."],
 ["Has anything been reviewed?","Nothing here has scientific approval. The graph holds candidates for independent review, and graph promotion is a separate decision."],
];

const QUALITIES=[
 ["Evidence-linked","Relationships retain traceable source information."],
 ["Context-aware","Experimental conditions remain attached to scientific interpretations."],
 ["Cross-domain","Explore connections across biological systems."],
 ["Uncertainty-preserving","Candidate relationships remain distinct from reviewed knowledge."],
 ["Governed","New findings do not silently become established facts."],
] as const;

export function KnowledgeGraphPublicPage(){
 return (
  <GraphSnapshotProvider>
   <div className="cine">
    <header className="cine-section" aria-labelledby="kg-title">
     <div className="cine-wrap">
      <p className="cine-eye">— Connected biological intelligence</p>
      <h1 id="kg-title">Discover the connections behind complex biology.</h1>
      <p className="cine-lead">A scientific relationship is more than a line between two entities. Its meaning depends on the evidence supporting it, the biological context in which it was observed and the uncertainty surrounding the interpretation.</p>
      <p>The HSI Living Biomedical Knowledge Graph connects biological concepts with their supporting evidence and contextual information.</p>
      <div className="cine-cta" style={{justifyContent:"flex-start"}}>
       <Link className="cine-btn" to="#home-knowledge-graph">Explore the graph</Link>
       <Link className="cine-btn cine-btn-line" to="/research/knowledge-graph">Open the full explorer</Link>
      </div>
      <p className="pg-micro cine-note">Published relationships are candidate-only and unreviewed unless explicitly stated otherwise.</p>
     </div>
    </header>
    <section className="cine-section" aria-labelledby="kg-connect">
     <div className="cine-wrap">
      <h2 id="kg-connect">What can the graph connect?</h2>
      <p>Genes. Proteins. Cells. Pathways. Organs. Tissues. Diseases. Microbial processes. Metabolic signals. Experimental findings.</p>
      <FigureBoard label="What the graph keeps with a relationship" cells={QUALITIES.map(([title,text],i)=>({n:String(i+1).padStart(2,"0"),title,text}))}/>
     </div>
    </section>
    <section className="cine-section" aria-labelledby="kg-walk-h">
     <div className="cine-wrap">
      <h2 id="kg-walk-h">Explore the biology. Inspect the evidence.</h2>
      <p>Use the published research-preview graph to examine candidate relationships and their provenance. Choose a department, pick a relationship, and read the study behind it.</p>
      <Explorer/>
     </div>
    </section>
    <section className="cine-section" aria-label="Relationship structure">
     <div className="cine-wrap"><RelationshipDiagram/></div>
    </section>
    <section className="cine-section" aria-labelledby="kg-limits">
     <div className="cine-wrap">
      <h2 id="kg-limits">What a line means</h2>
      <div>
       {faq.map(([q,a])=>(
        <details key={q}><summary>{q}</summary><p>{a}</p></details>
       ))}
       <p>See <Link to="/validation">how evidence, inference and approval stay separate</Link>.</p>
      </div>
     </div>
    </section>
   </div>
  </GraphSnapshotProvider>
 );
}
