import { Link } from "react-router-dom";

const PILLARS = [
  {
    title: "Traceable sources",
    text: "Claims keep provenance, or they are not presented as evidence.",
  },
  {
    title: "Scientific uncertainty",
    text: "Association, inference and established evidence stay distinct.",
  },
  {
    title: "Independent human review",
    text: "Nothing auto-approves. People approve, reject, or leave claims unreviewed.",
  },
  {
    title: "Patient-data barrier",
    text: "Private clinical information does not auto-enter the research knowledge graph.",
  },
] as const;

/** Compact integrity tease — full policy lives on Evidence & safety / governance. */
export function HomeIntegrity() {
  return (
    <section className="cl-integrity cl-chapter" aria-labelledby="integrity-title">
      <div className="cl-chapter-inner">
        <h2 id="integrity-title">Evidence handling stays visible. Human judgement stays required.</h2>
        <p className="cl-chapter-lead">
          Trust comes from transparent governance — not from certifications that have not been established.
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
