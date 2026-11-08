import {ArrowIcon} from "../components/ArrowIcon";
import {Link} from "react-router-dom";
import {LandingVisual} from "../components/editorial/LandingVisual";

const partners = [
  "Academic and biomedical research groups",
  "Immunologists and systems biologists",
  "Translational medicine teams",
  "Pharmaceutical and biotechnology researchers",
  "Scientific data and infrastructure partners",
] as const;

export function About() {
  return (
    <div className="ed-home ed-subpage">
      <header className="ed-home-hero ed-home-hero-visual">
        <div className="ed-hero-copy">
          <p className="ed-kicker">Our mission</p>
          <h1>
            Building the connections
            <br />
            <em>that move science forward.</em>
          </h1>
          <p className="ed-lead">
            Human Super Intelligence was founded on the belief that meaningful biomedical progress requires a deeper
            understanding of how biological systems interact—and a more rigorous way to connect the evidence describing
            them.
          </p>
          <p className="ed-lead ed-lead-secondary">
            We are developing an intelligence platform to support scientific investigation across immunology, systems
            biology and translational research.
          </p>
          <div className="ed-actions">
            <Link className="ed-button" to="/contact">
              Discuss a research collaboration <span aria-hidden="true"><ArrowIcon /></span>
            </Link>
            <Link className="ed-text-link" to="/platform">
              Explore the Platform <span aria-hidden="true"><ArrowIcon direction="right" /></span>
            </Link>
          </div>
        </div>
        <LandingVisual kind="knowledge" priority />
      </header>

      <section className="ed-intro">
        <p className="ed-kicker">Collaborate with HSI</p>
        <h2>
          Conversations that
          <br />
          <em>test real research decisions.</em>
        </h2>
        <div>
          <p>We welcome conversations with:</p>
          <ul className="ed-plain-list">
            {partners.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            We are particularly interested in collaborations that help evaluate whether connected evidence and biological
            reasoning can improve real research decisions—without inventing MoUs, clinical readiness or Gate C
            auto-approval.
          </p>
          <Link className="ed-text-link" to="/contact">
            Collaborate <span aria-hidden="true"><ArrowIcon direction="right" /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
