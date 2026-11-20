import {Link} from "react-router-dom";
import "../styles/scientific-public.css";
import "../styles/knowledge-graph-public.css";
import "../styles/home-redesign.css";
import "../styles/home-story.css";
import "../styles/premium-public.css";
import {GraphSnapshotProvider} from "../components/home/useGraphSnapshot";
import {HomeResearchGraph as Explorer} from "../components/HomeResearchGraph";
import {RelationshipDiagram} from "../components/landing/RelationshipDiagram";
import {ChartsPair} from "../components/graph/GraphCharts";

/** Public entry to the HSI knowledge graph. It links only to surfaces that exist and states what each one is. */
/** Figure 3: coverage and vocabulary of the snapshot. */
function ChartsFigure(){
  return (
    <figure className="fg kg-fig" aria-labelledby="kg-f3">
      <div className="kg-fig-body"><ChartsPair/></div>
      <figcaption id="kg-f3" className="fg-cap"><b>Figure 1.</b> What the snapshot covers and how it describes relationships. Counts are read from the published snapshot and the department tags, and they will change as the graph is extended.</figcaption>
    </figure>
  );
}

const faq:[string,string][]=[
  ["Does a line prove causation?","No. A line is a recorded connection. Study design, species and context still decide what it can support."],
  ["Has anything been reviewed?","Nothing here has scientific approval. The graph holds candidates for independent review, and graph promotion is a separate decision."],
];
function FaqList(){
  return (
    <div className="kg-faq">
      {faq.map(([q,a])=>(
        <details key={q}><summary>{q}</summary><p>{a}</p></details>
      ))}
      <p className="kg-note">See <Link to="/trust">how evidence, inference and approval stay separate</Link>.</p>
    </div>
  );
}

export function KnowledgeGraphPublicPage() {
  return (
    <GraphSnapshotProvider><div className="sp-page fg-page kg-page pg-page pg-sub">
      <section className="pg-hero pg-hero-platform pg-hero-text kg-phero" aria-labelledby="kg-title">
        <div className="pg-hero-copy">
          <h1 id="kg-title">Relationships between biological entities, with the evidence attached.</h1>
          <p className="pg-lead">Select an entity, follow a candidate relationship and inspect its evidence. Missing experimental context stays visible.</p>
          <div className="pg-cta">
            <Link className="pg-btn" to="#home-knowledge-graph">Explore the graph <span aria-hidden="true">→</span></Link>
            <Link className="pg-link" to="/research/knowledge-graph">Open the full explorer <span aria-hidden="true">→</span></Link>
          </div>
          <p className="pg-micro">Published snapshot · candidate-only · unreviewed</p>

        </div>
      </section>

      <section className="kg-section kg-intro" aria-labelledby="kg-walk-h">
        <h2 id="kg-walk-h">Follow a connection to its source.</h2>
        <p>Choose a department, pick a relationship, and read the study behind it: its model, design, limits and what is missing.</p>
      </section>

      <Explorer />

      <ChartsFigure />

      <section className="kg-section" aria-label="Relationship structure"><RelationshipDiagram/></section>

      <section className="kg-section" aria-labelledby="kg-limits">
        <h2 id="kg-limits">What a line means</h2>
        <FaqList />
      </section>


      <section className="kg-section kg-close">
        <h2>Follow a connection back to its evidence.</h2>
        <p>Start with a system, pick a relationship and read the source behind it.</p>
        <Link className="sp-button" to="#home-knowledge-graph">Explore the graph <span aria-hidden="true">↗</span></Link>
      </section>
    </div></GraphSnapshotProvider>
  );
}
