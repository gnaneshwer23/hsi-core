import {ArrowIcon} from "../components/ArrowIcon";
import {Link} from "react-router-dom";
import {LandingVisual} from "../components/editorial/LandingVisual";

const scales = [
  {title: "Molecular", text: "Genes, proteins, receptors, signalling pathways and metabolites."},
  {title: "Cellular", text: "Immune-cell populations, activation states, differentiation and interactions."},
  {title: "Tissue", text: "Local microenvironments, inflammation, fibrosis and tissue-specific responses."},
  {title: "Systemic", text: "Immune–metabolic, gut–immune and neuroimmune interactions."},
  {title: "Disease", text: "Phenotypes, progression, biomarkers and treatment-response contexts."},
] as const;

export function Biology() {
  return (
    <div className="ed-home ed-subpage">
      <header className="ed-home-hero ed-home-hero-visual">
        <div className="ed-hero-copy">
          <p className="ed-kicker">Biological intelligence</p>
          <h1>
            Understand disease as an
            <br />
            <em>interconnected biological system.</em>
          </h1>
          <p className="ed-lead">
            A gene does not act alone. A cell&apos;s behaviour depends on its state, tissue environment and surrounding
            molecular signals. A therapeutic response depends on biological context.
          </p>
          <p className="ed-lead ed-lead-secondary">HSI is designed to make these connections explorable.</p>
          <div className="ed-actions">
            <Link className="ed-button" to="/science/graph">
              Explore the Biology Graph <span aria-hidden="true"><ArrowIcon /></span>
            </Link>
            <Link className="ed-text-link" to="/science">
              Open the science explorer <span aria-hidden="true"><ArrowIcon direction="right" /></span>
            </Link>
          </div>
          <p className="ed-hero-note">Educational draft graph — not a validated causal clinical model.</p>
        </div>
        <LandingVisual kind="immunometabolic" priority />
      </header>

      <section className="ed-approach">
        <div className="ed-approach-heading">
          <p className="ed-kicker">Multi-scale biology</p>
          <h2>
            Explore biology
            <br />
            <em>at multiple scales.</em>
          </h2>
        </div>
        <ol className="ed-approach-grid">
          {scales.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ed-intro">
        <p className="ed-kicker">Mechanism and evidence</p>
        <h2>
          Follow the mechanism.
          <br />
          <em>Examine the evidence.</em>
        </h2>
        <div>
          <p>
            Select a biological relationship to investigate its supporting studies, experimental models, disease context
            and unresolved questions—keeping association distinct from causation.
          </p>
          <Link className="ed-text-link" to="/science/graph">
            Explore the Biology Graph <span aria-hidden="true"><ArrowIcon direction="right" /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
