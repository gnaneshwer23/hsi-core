import { useState } from "react";
import { Link } from "react-router-dom";

type ScenarioId = "metabolic" | "immune" | "oncology";

type Scenario = {
  id: ScenarioId;
  label: string;
  title: string;
  context: string;
  items: string[];
};

/** Copy + interactions from founder Downloads/index (2).html — HSI Trials. */
const SCENARIOS: Scenario[] = [
  {
    id: "metabolic",
    label: "Metabolic health",
    title: "Metabolic intervention study",
    context:
      "Metabolic protocols may specify laboratory thresholds, medication stability and clinical exclusions.",
    items: [
      "Condition and diagnosis documented",
      "Recent relevant laboratory results available",
      "Current medications reviewed",
      "Age range confirmed",
      "Relevant medical history reviewed",
    ],
  },
  {
    id: "immune",
    label: "Immune conditions",
    title: "Immune condition observational study",
    context:
      "Immune studies may depend on disease classification, treatment history and specific biomarkers.",
    items: [
      "Condition classification documented",
      "Treatment history available",
      "Relevant biomarkers recorded",
      "Disease activity information available",
      "Exclusion conditions reviewed",
    ],
  },
  {
    id: "oncology",
    label: "Oncology",
    title: "Oncology treatment study",
    context:
      "Oncology protocols can depend on histology, disease stage, prior therapy and performance status.",
    items: [
      "Pathology or diagnosis documented",
      "Disease stage information available",
      "Prior treatment history reviewed",
      "Performance status documented",
      "Protocol-specific testing available",
    ],
  },
];

const JOURNEY = [
  {
    n: "01 / Find",
    title: "Discover studies",
    body: "Search official trial registries by condition, location, status and study design.",
  },
  {
    n: "02 / Understand",
    title: "Read criteria",
    body: "Translate protocol terminology into understandable, source-linked explanations.",
  },
  {
    n: "03 / Prepare",
    title: "Identify unknowns",
    body: "Prepare relevant questions and information for the clinical or research team.",
  },
  {
    n: "04 / Connect",
    title: "Contact the team",
    body: "Use official study contacts and preserve investigator-led eligibility screening.",
  },
] as const;

const PATIENT_POINTS = [
  "Plain-language trial summaries",
  "Study location, phase and participation expectations",
  "Questions to ask the treating clinician",
  "Official contact and registry links",
] as const;

const TEAM_POINTS = [
  "Structured inclusion and exclusion criteria",
  "Traceability to protocol text and version",
  "Missing-data and ambiguity flags",
  "Documented investigator review",
] as const;

const GOVERNANCE = [
  "Official registry and protocol provenance",
  "Study status and version freshness checks",
  "Permission-bound patient information",
  "Explicit uncertainty and missing-data indicators",
  "Investigator-led screening and informed consent",
] as const;

/**
 * Founder Downloads/index (2).html — HSI Trials marketing landing.
 * Ivory/teal/coral tokens; Shell/nav remain product chrome.
 * Illustrative criteria completeness only — never eligibility.
 */
export function TrialsLanding() {
  const [scenario, setScenario] = useState<ScenarioId>("metabolic");
  const [checked, setChecked] = useState<Record<ScenarioId, boolean[]>>({
    metabolic: [false, false, false, false, false],
    immune: [false, false, false, false, false],
    oncology: [false, false, false, false, false],
  });

  const data = SCENARIOS.find((s) => s.id === scenario) ?? SCENARIOS[0];
  const flags = checked[scenario];
  const available = flags.filter(Boolean).length;
  const percent = available * 20;
  const summary =
    available === 5
      ? "All example information fields are marked available. A study team must still assess the full official protocol."
      : `${available} of 5 example information fields available. ${5 - available} remain unconfirmed; no eligibility conclusion can be drawn.`;

  function toggleItem(index: number) {
    setChecked((prev) => {
      const next = [...prev[scenario]];
      next[index] = !next[index];
      return { ...prev, [scenario]: next };
    });
  }

  return (
    <>
      <section className="land-trials section section-bone" id="top" aria-labelledby="trials-title">
        <div className="container">
          <span className="section-num">HSI Trials / clinical research intelligence · Planned</span>
          <div className="land-trials-hero">
            <h1 className="display display-xl" id="trials-title">
              Better trial discovery.
              <br />
              <em className="land-em">Clearer next steps.</em>
            </h1>
            <p className="lede">
              Navigate complex clinical trial information with structured criteria, transparent
              uncertainty and reviewable pathways for patients, clinicians and research teams.
            </p>
          </div>

          <section
            className="land-trials-demo"
            id="discovery"
            aria-label="Illustrative trial criteria explorer"
          >
            <div className="land-trials-demo-bar">
              <span>HSI / trial criteria explorer</span>
              <span className="land-trials-badge">
                Illustrative scenarios · syntheticOnly · not live trial listings
              </span>
            </div>

            <div className="land-trials-intro">
              <div>
                <h2>Explore what trial criteria really mean.</h2>
                <p>Choose a fictional research scenario, then mark which information is available.</p>
              </div>
              <div className="land-trials-tabs" role="group" aria-label="Trial scenario">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={s.id === scenario}
                    onClick={() => setScenario(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="land-trials-grid">
              <div className="land-trials-card">
                <div className="land-micro">01 / Information to review</div>
                <h3>{data.title}</h3>
                <div className="land-trials-criteria">
                  {data.items.map((item, i) => {
                    const on = flags[i];
                    const id = `trials-c-${scenario}-${i}`;
                    return (
                      <div key={id} className="land-trials-criterion">
                        <input
                          type="checkbox"
                          id={id}
                          checked={on}
                          onChange={() => toggleItem(i)}
                        />
                        <label htmlFor={id}>{item}</label>
                        <span>{on ? "Available" : "Not confirmed"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="land-trials-card" aria-live="polite">
                <div className="land-micro">02 / Transparent review</div>
                <h3>Readiness to assess</h3>
                <div className="land-trials-summary">
                  <div className="land-micro">Information completeness</div>
                  <div className="land-trials-value">{percent}%</div>
                  <p>{summary}</p>
                </div>
                <div className="land-trials-explain">
                  <div>
                    <i className="land-trials-dot" aria-hidden />
                    <span>{data.context}</span>
                  </div>
                  <div>
                    <i className="land-trials-dot" aria-hidden />
                    <span>
                      Information completeness is not eligibility, medical suitability or a
                      recommendation to enrol.
                    </span>
                  </div>
                  <div>
                    <i className="land-trials-dot" aria-hidden />
                    <span>
                      Only authorised study teams can determine final eligibility through their
                      screening process.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="land-trials-demo-foot">
              <span>Discover → interpret → review → contact study team</span>
              <span>
                All trial examples are fictional · no personal information stored · confirmedEligible
                never true
              </span>
            </div>
          </section>
        </div>
      </section>

      <section className="land-trials section section-grid-light" id="journey" aria-labelledby="trials-journey">
        <div className="container">
          <div className="land-trials-section-head">
            <div>
              <span className="section-num">Trials / 02 — the journey</span>
              <h2 className="display display-xl" id="trials-journey">
                From discovery to
                <br />
                <em className="land-em">informed contact.</em>
              </h2>
            </div>
            <p className="lede">
              Finding a study is only the beginning. A useful trial experience helps people understand
              requirements, identify missing information and know who must make the next decision.
            </p>
          </div>
          <div className="land-trials-timeline">
            {JOURNEY.map((card) => (
              <article key={card.n} className="land-trials-stage">
                <span>{card.n}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="land-trials section section-bone" id="review" aria-labelledby="trials-review">
        <div className="container">
          <div className="land-trials-section-head">
            <div>
              <span className="section-num">Trials / 03 — two perspectives</span>
              <h2 className="display display-xl" id="trials-review">
                One study.
                <br />
                <em className="land-em">Different decisions.</em>
              </h2>
            </div>
            <p className="lede">
              Patients need clarity and agency. Researchers need accurate protocol interpretation,
              auditable workflows and defensible screening decisions.
            </p>
          </div>
          <div className="land-trials-comparison">
            <div className="land-trials-side">
              <span className="section-num">For patients and caregivers</span>
              <h3>Understand the opportunity.</h3>
              <p>
                Explore trials without confusing an automated suggestion for a clinical
                recommendation.
              </p>
              <ul>
                {PATIENT_POINTS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="land-trials-side land-trials-side-dark">
              <span className="section-num">For research and clinical teams</span>
              <h3>Review the evidence.</h3>
              <p>
                Keep protocol interpretation, source verification and screening decisions visible to
                authorised humans.
              </p>
              <ul>
                {TEAM_POINTS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="land-trials section section-grid-light" id="safety" aria-labelledby="trials-safety">
        <div className="container">
          <div className="land-trials-section-head">
            <div>
              <span className="section-num">Trials / 04 — trust and oversight</span>
              <h2 className="display display-xl" id="trials-safety">
                Transparent by design.
                <br />
                <em className="land-em">Human by decision.</em>
              </h2>
            </div>
            <p className="lede">
              Clinical research depends on informed consent, accurate protocols and responsible
              handling of sensitive information. Intelligent discovery must support—not replace—those
              safeguards.
            </p>
          </div>
          <div className="land-trials-gov">
            <div>
              <h3>Protocol first. People always.</h3>
              <p>
                The intended HSI Trials architecture treats registries and protocol documents as
                authoritative sources, preserves uncertainties and routes eligibility questions to
                study professionals. Eligibility stays with investigators — never auto-confirmed.
              </p>
            </div>
            <ul>
              {GOVERNANCE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="land-trials section section-bone land-trials-last" id="next">
        <div className="container land-trials-last-inner">
          <span className="section-num">HSI Trials / the next step · Planned</span>
          <h2 className="display display-xl">
            Make research opportunities easier to understand.
          </h2>
          <p className="lede">
            HSI Trials aims to connect people and research teams through transparent study discovery
            and careful protocol interpretation—without overstating what an algorithm can decide.
          </p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <a href="#discovery" className="btn btn-primary">
              Explore study discovery <span className="arrow">↗</span>
            </a>
            <Link to="/how-it-works" className="btn btn-ghost land-btn-on-light">
              How HSI works
            </Link>
            <Link to="/modules" className="btn btn-ghost land-btn-on-light">
              Four products
            </Link>
          </div>
          <small className="land-trials-foot-note">
            Product concept — illustrative criteria only. No live registry matching or eligibility
            decisions.
          </small>
        </div>
      </section>
    </>
  );
}
