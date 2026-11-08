import {ArrowIcon} from "../components/ArrowIcon";
import {Link} from "react-router-dom";
import {LandingVisual} from "../components/editorial/LandingVisual";

const layers = [
  {
    title: "Biomedical evidence connections",
    text: "Research publications, biological databases, ontologies, experimental datasets and public clinical research records provide source material for investigation.",
  },
  {
    title: "Living knowledge graph",
    text: "Biological entities, relationships, evidence provenance, temporal context and uncertainty are represented in a connected structure.",
  },
  {
    title: "Research agent orchestration",
    text: "Specialised investigation components coordinate evidence retrieval, biological analysis, comparison, verification and research output assembly.",
  },
  {
    title: "Scientific governance",
    text: "Source validation, access controls, review states and traceability support responsible interpretation and reuse of scientific findings.",
  },
  {
    title: "Research experience",
    text: "A connected workspace enables researchers to explore questions, review evidence and assemble research outputs.",
  },
] as const;

export function Technology() {
  return (
    <div className="ed-home ed-subpage">
      <header className="ed-home-hero ed-home-hero-visual">
        <div className="ed-hero-copy">
          <p className="ed-kicker">The intelligence infrastructure</p>
          <h1>
            Connecting biological data,
            <br />
            <em>evidence and scientific reasoning.</em>
          </h1>
          <p className="ed-lead">
            HSI&apos;s architecture is built around a living biomedical knowledge graph and a governed research
            investigation workflow.
          </p>
          <div className="ed-actions">
            <Link className="ed-button" to="/platform">
              Explore the technology <span aria-hidden="true"><ArrowIcon /></span>
            </Link>
            <Link className="ed-text-link" to="/evidence-safety">
              Science &amp; Trust <span aria-hidden="true"><ArrowIcon direction="right" /></span>
            </Link>
          </div>
          <p className="ed-hero-note">
            Architecture descriptions distinguish implemented substrate from illustrative future integrations. No live
            CDS, PHI or EHR write-back is offered here.
          </p>
        </div>
        <LandingVisual kind="network" priority />
      </header>

      <section className="ed-approach">
        <div className="ed-approach-heading">
          <p className="ed-kicker">Available research methods</p>
          <h2>
            Graph, agents,
            <br />
            <em>governance and experience.</em>
          </h2>
          <p>
            Naming a capability does not claim scientific validation. Agent orchestration and graph navigation remain
            under continuous engineering and scientific evaluation.
          </p>
        </div>
        <ol className="ed-approach-grid">
          {layers.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ed-intro">
        <p className="ed-kicker">Illustrative future architecture</p>
        <h2>
          Future connectors stay
          <br />
          <em>labelled as future.</em>
        </h2>
        <div>
          <p>
            Authorised care systems, longitudinal clinical records and trial-matching workflows may appear in architecture
            discussions as intended directions. They are not live hospital integrations, eligibility engines or clinical
            decision support.
          </p>
          <Link className="ed-text-link" to="/evidence-safety">
            Read validation honesty <span aria-hidden="true"><ArrowIcon direction="right" /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
