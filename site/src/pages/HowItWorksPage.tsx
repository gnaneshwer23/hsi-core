import {Link} from "react-router-dom";
import {FigurePath} from "../components/cinematic/Figures";
import {RelationshipDiagram} from "../components/landing/RelationshipDiagram";

const STEPS=[
 ["01","Define the question","Start with a research question, biological mechanism, publication or scientific topic."],
 ["02","Discover the evidence","Find relevant scientific sources through approved retrieval systems."],
 ["03","Preserve the context","Capture the species, tissue, cell type, assay, disease state and experimental conditions behind findings."],
 ["04","Connect the biology","Explore relationships in the Living Biomedical Knowledge Graph."],
 ["05","Compare the findings","Distinguish agreement, genuine contradiction and studies that are not directly comparable."],
 ["06","Identify what is missing","Explore evidence gaps, unresolved mechanisms and limitations."],
 ["07","Develop the next hypothesis","Consider alternative explanations and possible experiments."],
 ["08","Produce a research brief","Bring findings, sources, uncertainty and suggested next steps into a traceable output."],
] as const;

export function HowItWorksPage(){
 return (
  <div className="cine">
   <header className="cine-section" aria-labelledby="hw-title">
    <div className="cine-wrap">
     <p className="cine-eye">— The HSI platform</p>
     <h1 id="hw-title">From scientific questions to evidence-linked decisions.</h1>
     <p className="cine-lead">Research rarely follows a straight line. HSI is designed to help researchers move between evidence, mechanisms, uncertainty and possible next experiments without losing the scientific reasoning behind each step.</p>
     <div className="cine-cta" style={{justifyContent:"flex-start"}}>
      <Link className="cine-btn" to="/demo/universe">Open an example investigation</Link>
      <Link className="cine-btn cine-btn-line" to="/validation">Read how approval stays separate</Link>
     </div>
     <p className="pg-micro cine-note">Research preview · example findings are labelled · no clinical advice · no patient data on this site</p>
    </div>
   </header>
   <section className="cine-section" aria-labelledby="hw-journey">
    <div className="cine-wrap">
     <h2 id="hw-journey">The investigation journey</h2>
     <FigurePath label="Investigation journey" steps={STEPS.map(([n,title,text])=>({n,title,text}))}/>
    </div>
   </section>
   <section className="cine-section" aria-labelledby="hw-context-title">
    <div className="cine-wrap">
     <h2 id="hw-context-title">Inspect the conditions before comparing the findings.</h2>
     <p>Different species, tissues or endpoints can change what a study establishes.</p>
     <RelationshipDiagram/>
    </div>
   </section>
   <section className="cine-section" aria-labelledby="hw-steps-h">
    <div className="cine-wrap">
     <h2 id="hw-steps-h">On screen.</h2>
     <div className="pg-shots" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1rem"}}>
      <figure className="pg-shot"><img src="/images/product/explorer-v2.webp" width={1440} height={900} alt="Graph explorer with a selected relationship and evidence context" loading="lazy"/><figcaption>Explore a relationship and inspect its evidence.</figcaption></figure>
      <figure className="pg-shot"><img src="/images/product/dashboard-v2.webp" width={1440} height={1120} alt="Research home with topic metrics and a graph panel" loading="lazy"/><figcaption>Return to your topics and continue the investigation.</figcaption></figure>
     </div>
    </div>
   </section>
   <section className="cine-section" aria-labelledby="hw-review-title">
    <div className="cine-wrap">
     <h2 id="hw-review-title">Built for scientific scrutiny</h2>
     <p>HSI distinguishes source evidence, extracted claims, model interpretations, candidate hypotheses and scientifically reviewed knowledge.</p>
     <FigurePath label="Scientific review boundaries" steps={[
      {n:"01",title:"Extracted claim",text:"A source-reported statement to inspect."},
      {n:"02",title:"Evidence check",text:"Assess support, missing context and uncertainty."},
      {n:"03",title:"Human review",text:"An authorised reviewer records a decision."},
      {n:"04",title:"Versioned record",text:"Retain the source, decision and history."},
     ]}/>
     <p className="cine-note">Published graph relationships are currently unreviewed. Model checks require configuration. <Link to="/validation">Validation methodology</Link></p>
    </div>
   </section>
   <section className="cine-section" aria-labelledby="hw-close-h">
    <div className="cine-wrap">
     <h2 id="hw-close-h">Explore an investigation.</h2>
     <div className="cine-cta" style={{justifyContent:"flex-start"}}>
      <Link className="cine-btn" to="/demo/universe">Explore an Investigation</Link>
      <Link className="cine-btn cine-btn-line" to="/knowledge-graph">Explore the Knowledge Graph</Link>
     </div>
    </div>
   </section>
  </div>
 );
}
