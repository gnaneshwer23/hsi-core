import {ArrowIcon} from "../components/ArrowIcon";
import {Link} from "react-router-dom";
import {LandingVisual} from "../components/editorial/LandingVisual";

const workflow = [
  {name: "Investigate", text: "Define a research question and explore relevant biological context."},
  {name: "Connect", text: "Navigate relationships between diseases, biological mechanisms, evidence and interventions."},
  {name: "Evaluate", text: "Examine uncertainty, contradictions and differences between experimental contexts."},
  {name: "Translate", text: "Investigate how biological findings relate to therapeutic development and clinical research."},
  {name: "Decide", text: "Assemble evidence-backed research priorities and proposed next experiments."},
] as const;

export function Platform() {
  return (
    <div className="ed-home ed-subpage">
      <header className="ed-home-hero ed-home-hero-visual">
        <div className="ed-hero-copy">
          <p className="ed-kicker">The HSI platform</p>
          <h1>
            One research environment.
            <br />
            <em>Connected scientific intelligence.</em>
          </h1>
          <p className="ed-lead">
            Biomedical discovery involves multiple layers of information: molecular mechanisms, cellular behaviour, tissue
            environments, disease phenotypes, experimental evidence and therapeutic outcomes.
          </p>
          <p className="ed-lead ed-lead-secondary">
            HSI is designed to bring these layers into a connected investigation environment—with source provenance,
            uncertainty and human review kept visible.
          </p>
          <div className="ed-actions">
            <Link className="ed-button" to="/sign-in">
              Explore the research workspace <span aria-hidden="true"><ArrowIcon /></span>
            </Link>
            <Link className="ed-text-link" to="/research">
              Research Intelligence <span aria-hidden="true"><ArrowIcon direction="right" /></span>
            </Link>
          </div>
          <p className="ed-hero-note">
            Marketing overview of the research environment. Authorised tools remain behind separately provisioned access.
          </p>
        </div>
        <LandingVisual kind="knowledge" priority />
      </header>

      <section className="ed-approach">
        <div className="ed-approach-heading">
          <p className="ed-kicker">A unified research workflow</p>
          <h2>
            Evidence in motion—
            <br />
            <em>not just answers on a page.</em>
          </h2>
        </div>
        <ol className="ed-approach-grid ed-workflow-grid">
          {workflow.map((item, index) => (
            <li key={item.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.name}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ed-intro">
        <p className="ed-kicker">Built around evidence</p>
        <h2>
          Evidence, not
          <br />
          <em>just answers.</em>
        </h2>
        <div>
          <p>
            Every scientific conclusion should distinguish established evidence, reported associations, computational
            inferences and unvalidated hypotheses.
          </p>
          <p>
            HSI&apos;s approach emphasises source provenance, reproducibility, scientific review and transparent
            limitations. Capabilities still under validation are labelled as such—never presented as independently proven
            discoveries.
          </p>
          <Link className="ed-text-link" to="/evidence-safety">
            Science &amp; Trust <span aria-hidden="true"><ArrowIcon direction="right" /></span>
          </Link>
        </div>
      </section>

      <section className="ed-final">
        <div>
          <p className="ed-kicker">Next step</p>
          <h2>
            Open the workspace
            <br />
            <em>when access is ready.</em>
          </h2>
        </div>
        <div>
          <p>
            Create an account and request research access, or continue exploring public biology and science pages without
            credentials.
          </p>
          <Link className="ed-button" to="/contact">
            Collaborate / request access <span aria-hidden="true"><ArrowIcon /></span>
          </Link>
          <Link className="ed-text-link" to="/biology">
            Explore Biology <span aria-hidden="true"><ArrowIcon direction="right" /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
