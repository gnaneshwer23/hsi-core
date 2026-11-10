import { Link } from "react-router-dom";

const PILLARS = [
  {
    title: "Traceable scientific sources",
    text: "Claims keep provenance, or they are not presented as evidence.",
  },
  {
    title: "Evidence provenance",
    text: "Supporting and conflicting findings stay attached to the question.",
  },
  {
    title: "Biological context",
    text: "Population, tissue, assay and timepoint context travel with the record when known.",
  },
  {
    title: "Scientific uncertainty",
    text: "Association, inference and established evidence are kept distinct.",
  },
  {
    title: "Reproducible investigations",
    text: "Public demonstrations use curated examples with explicit live_backend labels.",
  },
  {
    title: "Independent human review",
    text: "Nothing auto-approves. People approve, reject, or leave claims unreviewed.",
  },
  {
    title: "Versioned scientific records",
    text: "Only approved review can version knowledge that later questions read.",
  },
  {
    title: "Secure research environments",
    text: "Private clinical information does not auto-enter the research knowledge graph.",
  },
] as const;

/** Section 7 — integrity without invented certifications. */
export function HomeIntegrity() {
  return (
    <section className="cl-integrity cl-chapter" aria-labelledby="integrity-title">
      <div className="cl-chapter-inner">
        <h2 id="integrity-title">Scientific intelligence built around evidence and human judgement.</h2>
        <p className="cl-chapter-lead">
          Trust comes from transparent evidence handling and human governance — not from claimed certifications that
          have not been established.
        </p>
        <ul className="cl-integrity-list">
          {PILLARS.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
        <div className="cl-integrity-actions">
          <Link to="/evidence-safety">Evidence &amp; safety</Link>
          <Link to="/research/governance">Research governance</Link>
        </div>
      </div>
    </section>
  );
}
