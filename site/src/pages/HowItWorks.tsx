import {ArrowIcon} from "../components/ArrowIcon";
import {Link} from "react-router-dom";
import {LandingVisual} from "../components/editorial/LandingVisual";

const outputs = [
  {
    title: "Mechanism dossier",
    text: "A structured view of relevant biological mechanisms, contextual relationships and supporting evidence.",
  },
  {
    title: "Contradiction assessment",
    text: "A comparison of conflicting findings, study conditions and possible explanations.",
  },
  {
    title: "Research-gap assessment",
    text: "Candidate unresolved questions with source coverage, limitations and verification status.",
  },
  {
    title: "Translational assessment",
    text: "Connections between mechanisms, therapeutic targets, interventions and clinical research.",
  },
  {
    title: "Experiment proposal",
    text: "A testable hypothesis, proposed methods, expected observations, alternative explanations and falsification criteria.",
  },
  {
    title: "Research brief",
    text: "A consolidated, source-linked record of findings, limitations, proposed next steps and review status.",
  },
] as const;

export function HowItWorks() {
  return (
    <div className="ed-home ed-subpage">
      <header className="ed-home-hero ed-home-hero-visual">
        <div className="ed-hero-copy">
          <p className="ed-kicker">Research that leads to decisions</p>
          <h1>
            Scientific intelligence should
            <br />
            <em>produce more than a summary.</em>
          </h1>
          <p className="ed-lead">
            The goal of an investigation is not simply to collect findings. It is to understand which conclusions are
            supported, which remain uncertain and what evidence could change the next decision.
          </p>
          <div className="ed-actions">
            <Link className="ed-button" to="/research">
              Explore research outputs <span aria-hidden="true"><ArrowIcon /></span>
            </Link>
            <Link className="ed-text-link" to="/platform">
              See the platform workflow <span aria-hidden="true"><ArrowIcon direction="right" /></span>
            </Link>
          </div>
        </div>
        <LandingVisual kind="knowledge" priority />
      </header>

      <section className="ed-approach">
        <div className="ed-approach-heading">
          <p className="ed-kicker">Research outcomes</p>
          <h2>
            Intended investigation
            <br />
            <em>outputs.</em>
          </h2>
          <p>These describe the research record HSI aims to assemble—not fabricated study results.</p>
        </div>
        <ol className="ed-approach-grid">
          {outputs.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
