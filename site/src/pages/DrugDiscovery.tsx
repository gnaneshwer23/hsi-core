import {ArrowIcon} from "../components/ArrowIcon";
import {Link} from "react-router-dom";
import {LandingVisual} from "../components/editorial/LandingVisual";

const pillars = [
  {
    title: "Mechanism-to-target investigation",
    text: "Explore how biological mechanisms relate to candidate therapeutic targets.",
  },
  {
    title: "Translational evidence",
    text: "Compare findings across experimental systems and human disease contexts.",
  },
  {
    title: "Therapeutic landscape",
    text: "Examine existing interventions, clinical research and reported development outcomes.",
  },
  {
    title: "Uncertainty and next experiments",
    text: "Identify evidence that could strengthen or challenge a therapeutic hypothesis.",
  },
] as const;

export function DrugDiscovery() {
  return (
    <div className="ed-home ed-subpage">
      <header className="ed-home-hero ed-home-hero-visual">
        <div className="ed-hero-copy">
          <p className="ed-kicker">From biology to therapeutic insight</p>
          <h1>
            A promising target is not
            <br />
            <em>the same as a promising therapy.</em>
          </h1>
          <p className="ed-lead">
            Drug discovery requires more than identifying a disease-associated molecule. Researchers must understand
            causal mechanisms, biological context, target engagement, patient heterogeneity, experimental limitations and
            the reasons therapeutic programmes succeed or fail.
          </p>
          <p className="ed-lead ed-lead-secondary">
            HSI is developing research intelligence to help investigate these questions.
          </p>
          <div className="ed-actions">
            <Link className="ed-button" to="/research">
              Explore Drug Discovery Intelligence <span aria-hidden="true"><ArrowIcon /></span>
            </Link>
            <Link className="ed-text-link" to="/contact">
              Discuss a collaboration <span aria-hidden="true"><ArrowIcon direction="right" /></span>
            </Link>
          </div>
          <p className="ed-hero-note">
            HSI is not a validated de novo molecular design engine or an autonomous drug development system.
          </p>
        </div>
        <LandingVisual kind="signalling" priority />
      </header>

      <section className="ed-approach">
        <div className="ed-approach-heading">
          <p className="ed-kicker">Discovery intelligence</p>
          <h2>
            Mechanism-to-target
            <br />
            <em>investigation.</em>
          </h2>
        </div>
        <ol className="ed-approach-grid">
          {pillars.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ed-final">
        <div>
          <p className="ed-kicker">Honesty boundary</p>
          <h2>
            Intelligence for investigation—
            <br />
            <em>not automatic discovery claims.</em>
          </h2>
        </div>
        <div>
          <p>
            Public pages describe intended research workflows. They do not claim experimentally validated targets,
            clinical effectiveness or pharmaceutical partnerships without evidence.
          </p>
          <Link className="ed-button" to="/evidence-safety">
            Science &amp; Trust <span aria-hidden="true"><ArrowIcon /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
