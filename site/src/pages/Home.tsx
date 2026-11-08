import {ArrowIcon} from "../components/ArrowIcon";
import {Link} from "react-router-dom";
import {LandingBleedBand, LandingVisual} from "../components/editorial/LandingVisual";

const approach = [
  {
    n: "01",
    title: "Understand the biology",
    text: "Explore relationships between cells, tissues, molecular pathways, physiological systems and disease mechanisms.",
  },
  {
    n: "02",
    title: "Interrogate the evidence",
    text: "Examine supporting and opposing findings, experimental context, study limitations and unanswered questions.",
  },
  {
    n: "03",
    title: "Inform the next decision",
    text: "Connect scientific uncertainty to research priorities, therapeutic hypotheses and potential next experiments.",
  },
] as const;

const stages = [
  {title: "Biological landscape", text: "Understand relevant cells, tissues, pathways and disease contexts."},
  {title: "Evidence intelligence", text: "Review supporting findings, conflicting studies and source provenance."},
  {title: "Research-gap investigation", text: "Distinguish missing evidence from potentially unresolved scientific questions."},
  {title: "Translational intelligence", text: "Examine therapeutic mechanisms, clinical research and development activity."},
  {title: "Research planning", text: "Formulate testable hypotheses and identify evidence needed to evaluate them."},
  {title: "Research outcomes", text: "Assemble a traceable research brief with findings, uncertainties and next actions."},
] as const;

const systems = [
  "Immune and inflammatory diseases",
  "Autoimmunity and fibrosis",
  "Cancer and tumour immunology",
  "Gut–immune–metabolic interactions",
  "Neuroimmune biology",
  "Molecular pathways and multi-omics",
  "Biomarkers and therapeutic response",
] as const;

const outcomes = [
  {title: "Mechanism maps", text: "Evidence-linked representations of disease biology."},
  {title: "Evidence assessments", text: "Supporting and contradictory findings with context and uncertainty."},
  {title: "Research-gap assessments", text: "Candidate unanswered questions, with documented search limitations."},
  {title: "Therapeutic landscapes", text: "Connections between biological targets, existing interventions and clinical development."},
  {title: "Research plans", text: "Testable hypotheses, candidate experiments and evidence requirements."},
  {title: "Traceable research briefs", text: "Findings that can be followed back to their original sources."},
] as const;

export function Home() {
  return (
    <div className="ed-home">
      <header className="ed-home-hero ed-home-hero-visual">
        <div className="ed-hero-copy">
          <p className="ed-kicker">The next frontier of biomedical intelligence</p>
          <h1>
            Biology is connected.
            <br />
            <em>Scientific knowledge should be too.</em>
          </h1>
          <p className="ed-lead">
            The human body is an interconnected system. Yet the evidence needed to understand disease is scattered across
            publications, experiments, biological datasets and clinical research.
          </p>
          <p className="ed-lead ed-lead-secondary">
            Human Super Intelligence is building a connected research environment to investigate disease mechanisms,
            examine competing evidence and uncover the questions that could shape the next generation of therapies.
          </p>
          <div className="ed-actions">
            <Link className="ed-button" to="/platform">
              Explore Human Super Intelligence <span aria-hidden="true"><ArrowIcon /></span>
            </Link>
            <Link className="ed-text-link" to="/how-it-works">
              See how it works <span aria-hidden="true"><ArrowIcon direction="right" /></span>
            </Link>
          </div>
          <p className="ed-hero-note">
            Research intelligence under development. Available capabilities are distinguished from planned or unvalidated
            ones throughout this site.
          </p>
        </div>
        <LandingVisual kind="network" priority className="ed-hero-landing-visual" />
      </header>

      <div className="ed-domain-strip" aria-label="Connected research perspectives">
        <span>Immunology</span>
        <i />
        <span>Gut &amp; microbiome</span>
        <i />
        <span>Metabolism</span>
        <i />
        <span>Neuroscience</span>
      </div>

      <section className="ed-intro">
        <p className="ed-kicker">The challenge</p>
        <h2>
          Science generates knowledge.
          <br />
          <em>Discovery requires connections.</em>
        </h2>
        <div>
          <p>
            Every year, biomedical research produces enormous amounts of new information. But evidence remains distributed
            across disciplines, experimental systems and disease contexts.
          </p>
          <p>
            A mechanism observed in one tissue may behave differently in another. A promising therapeutic target may not
            translate into clinical benefit. Contradictory findings may remain unresolved because their biological contexts
            were never compared.
          </p>
          <p>
            The challenge is no longer simply finding more information.{" "}
            <strong>It is understanding what the evidence means together—and what remains uncertain.</strong>
          </p>
          <Link className="ed-text-link" to="/research">
            Research Intelligence <span aria-hidden="true"><ArrowIcon direction="right" /></span>
          </Link>
        </div>
      </section>

      <section className="ed-approach">
        <div className="ed-approach-heading">
          <p className="ed-kicker">Connected scientific intelligence</p>
          <h2>
            From fragmented findings to
            <br />
            <em>connected biological understanding.</em>
          </h2>
          <p>HSI brings together three essential dimensions of biomedical research.</p>
        </div>
        <ol className="ed-approach-grid">
          {approach.map((item) => (
            <li key={item.n}>
              <span>{item.n}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ed-research-section">
        <div className="ed-research-heading">
          <div>
            <p className="ed-kicker">One connected investigation</p>
            <h2>
              Start with a scientific question.
              <br />
              Follow the evidence.
            </h2>
          </div>
          <p className="ed-stage-example">
            Example research question:{" "}
            <em>
              Why do patients with the same autoimmune disease respond differently to therapies targeting the same immune
              pathway?
            </em>
          </p>
        </div>
        <div className="ed-research-grid ed-stage-layout">
          <ol className="ed-stage-list">
            {stages.map((stage, index) => (
              <li key={stage.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{stage.title}</strong>
                  <p>{stage.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <LandingVisual kind="signalling" caption="Investigate mechanisms in biological context · illustrative" />
        </div>
        <p className="ed-scope-line">
          The public experience distinguishes available functions from capabilities under development. Authorised
          workspaces require separately provisioned research access.
        </p>
        <Link className="ed-text-link" to="/platform">
          Explore the research workflow <span aria-hidden="true"><ArrowIcon direction="right" /></span>
        </Link>
      </section>

      <LandingBleedBand
        kind="immunometabolic"
        eyebrow="Systems biology"
        title="Diseases do not exist in isolation."
        cta={
          <Link className="ed-button ed-button-on-dark" to="/biology">
            Explore biological systems <span aria-hidden="true"><ArrowIcon /></span>
          </Link>
        }
      >
        <p>
          Immune processes influence metabolism, tissue repair, neurological function and responses to treatment. HSI is
          designed to explore biological connections across domains—without inventing validated clinical results.
        </p>
        <ul className="ed-bleed-list">
          {systems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LandingBleedBand>

      <section className="ed-outcome ed-outcome-wide">
        <div>
          <p className="ed-kicker">From information to investigation</p>
          <h2>
            Better questions.
            <br />
            <em>Stronger evidence. More informed decisions.</em>
          </h2>
          <p>The intended outputs of HSI research investigations include:</p>
          <Link className="ed-text-link" to="/how-it-works">
            Explore research outcomes <span aria-hidden="true"><ArrowIcon direction="right" /></span>
          </Link>
        </div>
        <ul className="ed-outcome-grid">
          {outcomes.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="ed-final">
        <div>
          <p className="ed-kicker">Collaborate with HSI</p>
          <h2>
            The next discovery may begin with a
            <br />
            <em>connection we have not yet understood.</em>
          </h2>
        </div>
        <div>
          <p>
            Human Super Intelligence is developing a research platform for scientists who want to go beyond finding
            information—to investigate biology, challenge assumptions and identify what should be tested next.
          </p>
          <Link className="ed-button" to="/contact">
            Collaborate with HSI <span aria-hidden="true"><ArrowIcon /></span>
          </Link>
          <Link className="ed-text-link" to="/platform">
            Explore the Platform <span aria-hidden="true"><ArrowIcon direction="right" /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
