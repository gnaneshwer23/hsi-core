import {Link} from "react-router-dom";
import "../styles/scientific-public.css";
import "../styles/knowledge-graph-public.css";

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

const carried = [
  ["Entities", "Cells, molecules, tissues, pathways and conditions, each with an identifier."],
  ["Relationships", "A stated connection between two entities, with direction and polarity where the source gives one."],
  ["Provenance", "The publication and passage the relationship came from, and what the source does not say."],
  ["Experimental context", "Species, tissue, cell state, assay, intervention and timing, kept attached to the claim."],
  ["Uncertainty and gaps", "Missing information and open questions are recorded, not smoothed over."],
  ["Review status", "Every item is unreviewed until an authorised human reviews it. Graph promotion is a separate decision."],
] as const;

const extending = [
  ["Ontology grounding", "Candidate links from graph concepts to pinned releases of public ontologies. A curator can record a recommendation; it is not an approved mapping."],
  ["Researcher-owned investigations", "Saving an investigation as a digest-chained, unreviewed record. Storage is designed and held; it is not enabled."],
  ["Candidate-only agents", "Roles that propose relationships and context over the graph. They produce candidates for review, never approvals."],
  ["Beyond one disease", "The Context-Conflict Audit generalised across systems. Systemic sclerosis is one validation case, not the boundary."],
] as const;

/** Schematic of one relationship and what travels with it. Illustrative; it shows structure, not a finding. */
function RelationshipSchematic() {
  return (
    <figure className="kg-figure">
      <svg viewBox="0 0 520 150" role="img" aria-labelledby="kg-fig-title kg-fig-desc">
        <title id="kg-fig-title">One relationship between two entities</title>
        <desc id="kg-fig-desc">Two entities joined by a relationship. A structural schematic, not a scientific finding.</desc>
        <g className="kg-edge">
          <line x1="130" y1="64" x2="388" y2="64" />
          <path d="M378 56L390 64L378 72" fill="none" />
        </g>
        <circle className="kg-node" cx="100" cy="64" r="34" />
        <circle className="kg-node" cx="420" cy="64" r="34" />
        <text className="kg-label" x="100" y="132" textAnchor="middle">Entity</text>
        <text className="kg-label" x="420" y="132" textAnchor="middle">Entity</text>
        <text className="kg-label kg-label-mid" x="259" y="48" textAnchor="middle">relationship</text>
      </svg>
      <p className="kg-attach">Every relationship carries:</p>
      <ul className="kg-chips">
        <li><b>Source</b> publication and passage</li>
        <li><b>Context</b> species · tissue · assay</li>
        <li><b>Status</b> unreviewed</li>
      </ul>
      <figcaption>Schematic of structure. It is not a scientific finding.</figcaption>
    </figure>
  );
}

export function KnowledgeGraphPublicPage() {
  return (
    <div className="sp-page kg-page">
      <header className="kg-hero">
        <div>
          <p className="sp-kicker">Knowledge graph</p>
          <h1>Relationships between biological entities, with the evidence attached.</h1>
          <p className="kg-lead">
            The HSI graph connects what research reports about cells, molecules, tissues and conditions, and keeps each
            connection tied to its source, its experimental context and its review status. It is the foundation the
            rest of the platform works around.
          </p>
          <div className="kg-actions">
            <Link className="sp-button" to="/#home-knowledge-graph">Explore the graph <span aria-hidden="true">→</span></Link>
            <Link className="kg-link" to="/evidence-intelligence">Inspect the evidence →</Link>
          </div>
        </div>
        <RelationshipSchematic />
      </header>

      <section className="kg-section" aria-labelledby="kg-ways">
        <p className="sp-kicker">Four ways in</p>
        <h2 id="kg-ways">Choose how deep to go.</h2>
        <ul className="kg-cards">
          {ways.map((w) => (
            <li key={w.to} className="kg-card">
              <h3><Link to={w.to}>{w.title}</Link></h3>
              <p>{w.text}</p>
              <p className="kg-status"><span aria-hidden="true" className="kg-dot" />{w.status}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="kg-section" aria-labelledby="kg-carries">
        <p className="sp-kicker">What every relationship carries</p>
        <h2 id="kg-carries">A connection is a starting point, not a conclusion.</h2>
        <dl className="kg-facts">
          {carried.map(([term, text]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="kg-section" aria-labelledby="kg-limits">
        <div className="kg-callout">
          <p className="sp-kicker">What the graph does not claim</p>
          <h2 id="kg-limits">Plain limits.</h2>
          <ul className="kg-limits">
            <li>Lines are recorded connections, not validated causality.</li>
            <li>Layout and distance on screen are not biology.</li>
            <li>Coverage is unequal across systems, and some areas have none yet.</li>
            <li>Nothing here has scientific approval. The graph holds candidates for independent review.</li>
            <li>No patient data enters the research graph, and nothing here is clinical advice.</li>
          </ul>
          <p className="kg-note">See <Link to="/trust">how evidence, inference and approval stay separate</Link>.</p>
        </div>
      </section>

      <section className="kg-section" aria-labelledby="kg-next">
        <p className="sp-kicker">Being extended / not live</p>
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
