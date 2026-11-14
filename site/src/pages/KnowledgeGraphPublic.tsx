import {Link} from "react-router-dom";
import "../styles/scientific-public.css";
import "../styles/knowledge-graph-public.css";
import "../styles/home-redesign.css";
import {useGraphSnapshot} from "../components/home/useGraphSnapshot";
import {NeighbourhoodDiagram,ChartsPair} from "../components/graph/GraphCharts";

/** Public entry to the HSI knowledge graph. It links only to surfaces that exist and states what each one is. */
const ways = [
  {
    to: "/#home-knowledge-graph",
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

const extending = [
  ["Ontology grounding", "Candidate links from graph concepts to pinned releases of public ontologies. A curator can record a recommendation; it is not an approved mapping."],
  ["Researcher-owned investigations", "Saving an investigation as a digest-chained, unreviewed record. Storage is designed and held; it is not enabled."],
  ["Candidate-only agents", "Roles that propose relationships and context over the graph. They produce candidates for review, never approvals."],
  ["Beyond one disease", "The Context-Conflict Audit generalised across systems. Systemic sclerosis is one validation case, not the boundary."],
] as const;


const fmt=(n:number)=>n.toLocaleString("en-GB");

/** Figure 2: one relationship from the published snapshot, followed from the wider graph back to its source. */
function WalkFigure(){
  const {snapshot:s,failed}=useGraphSnapshot();
  const e=s?.examples[0];
  return (
    <figure className="fg kg-walk" aria-labelledby="kg-walk-cap">
      <div className="fg-panels kg-walk-panels">
        <section aria-labelledby="kw-a">
          <span className="fg-letter" aria-hidden="true">A</span>
          <h2 id="kw-a">The wider picture</h2>
          {s?<p className="fg-big"><b>{fmt(s.concepts)}</b> concepts, <b>{fmt(s.relationships)}</b> candidate relationships</p>:<p className="fg-wait">{failed?"Snapshot unavailable. No substitute figures are shown.":"Verifying snapshot…"}</p>}
          <p>Every line is a recorded connection between two concepts. Select one in the explorer to open the rest of this chain.</p>
          <Link to="/#home-knowledge-graph">Open the explorer →</Link>
        </section>
        <section aria-labelledby="kw-b">
          <span className="fg-letter" aria-hidden="true">B</span>
          <h2 id="kw-b">One relationship</h2>
          {e?<><p className="fg-big">{e.subject} <span className="kg-pred">{e.predicate}</span> {e.object}</p><p>{e.assertion}</p></>:<p className="fg-wait">{failed?"Unavailable.":"Verifying snapshot…"}</p>}
        </section>
        <section aria-labelledby="kw-c">
          <span className="fg-letter" aria-hidden="true">C</span>
          <h2 id="kw-c">Its source</h2>
          {e?.source?<><p className="fg-big kg-title">{e.source.title}</p><p>{e.source.pmid?`PubMed ${e.source.pmid}. `:""}Status: {e.source.identity}.{e.source.locator?` ${e.source.locator}.`:""}</p></>:<p className="fg-wait">{failed?"Unavailable.":"Verifying snapshot…"}</p>}
        </section>
        <section aria-labelledby="kw-d">
          <span className="fg-letter" aria-hidden="true">D</span>
          <h2 id="kw-d">Context and limits</h2>
          {e?<><p>Model: {e.model}. Design: {e.design}.{e.tissue?` Tissue: ${e.tissue}.`:""}</p><p>{e.limits}</p>{e.warnings.map(w=><p key={w}>{w}</p>)}</>:<p className="fg-wait">{failed?"Unavailable.":"Verifying snapshot…"}</p>}
        </section>
      </div>
      <figcaption id="kg-walk-cap" className="fg-cap"><b>Figure 2.</b> One relationship from the published snapshot{s?` (${s.version})`:""}, followed back to its source. It is a candidate and unreviewed. The assertion is an editorial annotation pending source verification, and the source is a bibliographic record whose passage has not been retrieved.</figcaption>
    </figure>
  );
}

/** Figure 1: a real neighbourhood of the snapshot. */
function NeighbourhoodFigure(){
  return (
    <figure className="fg kg-fig" aria-labelledby="kg-f1">
      <div className="kg-fig-body"><NeighbourhoodDiagram/></div>
      <figcaption id="kg-f1" className="fg-cap"><b>Figure 1.</b> A neighbourhood of the published snapshot: one concept and the concepts it is recorded as connected to. Layout and distance are not biology. Every relationship is a candidate and unreviewed.</figcaption>
    </figure>
  );
}

/** Figure 3: coverage and vocabulary of the snapshot. */
function ChartsFigure(){
  return (
    <figure className="fg kg-fig" aria-labelledby="kg-f3">
      <div className="kg-fig-body"><ChartsPair/></div>
      <figcaption id="kg-f3" className="fg-cap"><b>Figure 3.</b> What the snapshot covers and how it describes relationships. Counts are read from the published snapshot and the department tags, and they will change as the graph is extended.</figcaption>
    </figure>
  );
}

const faq:[string,string][]=[
  ["Does a line prove causation?","No. A line is a recorded connection. Study design, species and context still decide what it can support."],
  ["Does more than one source mean more certainty?","No. Several records can come from one study, and source count supports navigation, not conclusions."],
  ["Has anything been reviewed?","Nothing here has scientific approval. The graph holds candidates for independent review, and graph promotion is a separate decision."],
  ["Is the layout meaningful?","No. Layout and distance on screen are not biology, and coverage is unequal across systems."],
  ["Does it use patient data or give clinical advice?","No. No patient data enters the research graph, and nothing here is clinical advice."],
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
    <div className="sp-page fg-page kg-page">
      <header className="fg-hook">
        <h1>Relationships between biological entities, with the evidence attached.</h1>
        <div>
          <p className="fg-lead">A graph of what research reports about cells, molecules, tissues and conditions, with every connection tied to its source, context and review status.</p>
          <div className="sp-actions">
            <Link className="sp-button" to="/#home-knowledge-graph">Explore the graph <span aria-hidden="true">→</span></Link>
            <Link to="/evidence-intelligence">Inspect the evidence →</Link>
          </div>
          <p className="fg-status">Published snapshot · candidate-only · unreviewed</p>
        </div>
      </header>

      <NeighbourhoodFigure />
      <WalkFigure />
      <ChartsFigure />

      <section className="kg-section" aria-labelledby="kg-ways">
        <h2 id="kg-ways">Choose how deep to go.</h2>
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
        <h2 id="kg-limits">Plain answers about what a line means.</h2>
        <FaqList />
      </section>

      <section className="kg-section" aria-labelledby="kg-next">
        <h2 id="kg-next">Where the graph is being developed.</h2>
        <dl className="kg-facts">
          {extending.map(([term, text]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
        <p className="kg-note">No dates are promised. Each of these needs independent review before it changes what the graph says.</p>
      </section>

      <section className="kg-section kg-close">
        <h2>Follow a connection back to its evidence.</h2>
        <p>Start with a system, pick a relationship and read the source behind it.</p>
        <Link className="sp-button" to="/#home-knowledge-graph">Explore the graph <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}
