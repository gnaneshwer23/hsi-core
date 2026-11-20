import {Link} from "react-router-dom";
import "../styles/scientific-public.css";
import "../styles/knowledge-graph-public.css";
import "../styles/home-redesign.css";
import "../styles/home-story.css";
import "../styles/premium-public.css";
import {GraphSnapshotProvider} from "../components/home/useGraphSnapshot";
import {HomeResearchGraph as Explorer} from "../components/HomeResearchGraph";
import {ChartsPair} from "../components/graph/GraphCharts";

/** Public entry to the HSI knowledge graph. It links only to surfaces that exist and states what each one is. */
const ways = [
  {
    to: "#home-knowledge-graph",
    title: "Explore the connections",
    text: "Start from a biological system, pick a connection, then read its source and experimental context.",
    status: "Preview · recorded candidate snapshot",
  },
  {
    to: "/science/graph",
    title: "Browse the educational map",
    text: "A cross-system topic map with filters and concept dossiers, for orientation rather than evidence.",
    status: "Educational draft · no scientific approval",
  },
  {
    to: "/research/knowledge-graph",
    title: "Inspect claims and sources",
    text: "The claim graph: each relationship with its publication, passage and what is missing.",
    status: "Research preview · unreviewed candidates",
  },
  {
    to: "/research/investigate",
    title: "Ask a question over a selection",
    text: "Run a curated example investigation over graph context. Writes are closed in this environment.",
    status: "Demonstration · curated examples",
  },
] as const;




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
          <p className="pg-lead">A graph of what research reports about cells, molecules, tissues and conditions, with every connection tied to its source, context and review status. Pick a department, follow a connection, open its source.</p>
          <div className="pg-cta">
            <Link className="pg-btn" to="#home-knowledge-graph">Explore the graph <span aria-hidden="true">→</span></Link>
            <Link className="pg-link" to="/research/knowledge-graph">Open the full explorer <span aria-hidden="true">→</span></Link>
          </div>
          <p className="pg-micro">Published snapshot · candidate-only · unreviewed</p>
          <p className="pg-micro" role="note">Former “Science” marketing URLs redirect here. Educational topic maps stay under <Link className="pg-link" to="/science/graph">/science/graph</Link>; they are not a separate Science product home.</p>
        </div>
      </section>

      <section className="kg-section kg-intro" aria-labelledby="kg-walk-h">
        <h2 id="kg-walk-h">Follow a connection to its source.</h2>
        <p>Choose a department, pick a relationship, and read the study behind it: its model, design, limits and what is missing.</p>
      </section>

      <Explorer />

      <ChartsFigure />

      <section className="kg-section" aria-labelledby="kg-ways">
        <h2 id="kg-ways">Ways in</h2>
        <ul className="kg-index">
          {ways.map((w) => (
            <li key={w.to}>
              <h3><Link to={w.to}>{w.title}</Link></h3>
              <p>{w.text}</p>
              <p className="kg-status"><span aria-hidden="true" className="kg-dot" />{w.status}</p>
            </li>
          ))}
        </ul>
      </section>

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
