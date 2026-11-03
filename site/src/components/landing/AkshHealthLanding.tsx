import { useState } from "react";
import { Link } from "react-router-dom";

type ScenarioId = "metabolic" | "glucose" | "lifestyle";

type Scenario = {
  id: ScenarioId;
  label: string;
  sub: string;
  a: [string, string, string];
  b: [string, string, string];
  title: string;
  bars: number[];
  heading: string;
  copy: string;
  checks: string[];
};

/** Copy + interactions from founder Downloads/index (1).html — Aksh Health. */
const SCENARIOS: Scenario[] = [
  {
    id: "metabolic",
    label: "Metabolic overview",
    sub: "Trends & context",
    a: ["Illustrative HbA1c", "48", "mmol/mol"],
    b: ["Example activity", "6.8k", "steps/day"],
    title: "Example longitudinal signal",
    bars: [45, 50, 43, 57, 54, 63, 59, 70, 67, 74, 78, 82],
    heading: "See the whole picture",
    copy: "A single value rarely explains a health trajectory. View trends alongside medication, activity, sleep and relevant clinical context.",
    checks: [
      "Understand changes over time",
      "Identify missing context",
      "Prepare questions for a clinician",
    ],
  },
  {
    id: "glucose",
    label: "Glucose patterns",
    sub: "Longitudinal signals",
    a: ["Example glucose", "7.2", "mmol/L"],
    b: ["Illustrative readings", "12", "this week"],
    title: "Example glucose pattern",
    bars: [70, 58, 65, 44, 61, 76, 53, 62, 49, 57, 68, 60],
    heading: "Patterns need context",
    copy: "Individual readings can vary with meals, medication, timing and other factors. This example illustrates context, not an assessment of glucose control.",
    checks: [
      "Review timing and consistency",
      "Record relevant contextual factors",
      "Discuss concerns with the care team",
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle context",
    sub: "Activity & sleep",
    a: ["Example sleep", "7.1", "hours/night"],
    b: ["Example activity", "7.4k", "steps/day"],
    title: "Example activity pattern",
    bars: [36, 49, 42, 64, 71, 51, 75, 68, 78, 63, 83, 74],
    heading: "Everyday signals matter",
    copy: "Sleep and activity may provide helpful context for personal health discussions. Their associations should not be interpreted as diagnoses or causal conclusions.",
    checks: [
      "Notice longer-term patterns",
      "Consider measurement limitations",
      "Set realistic discussion goals",
    ],
  },
];

const JOURNEY = [
  {
    n: "01 / UNDERSTAND",
    title: "Start with you",
    body: "Goals, conditions, preferences and permitted health sources establish a relevant starting point.",
  },
  {
    n: "02 / CONNECT",
    title: "Bring signals together",
    body: "View clinical results, medications and everyday measurements within their proper context.",
  },
  {
    n: "03 / INTERPRET",
    title: "Make trends understandable",
    body: "Explain patterns, changes and uncertainty in plain language, without overstating conclusions.",
  },
  {
    n: "04 / COLLABORATE",
    title: "Prepare for care",
    body: "Organise questions, relevant observations and clinician-reviewed follow-up information.",
  },
] as const;

const FEATURES = [
  {
    ico: "◷",
    title: "Longitudinal trends",
    body: "See changes in measurements and events across meaningful periods.",
  },
  {
    ico: "◈",
    title: "Diabetes context",
    body: "Understand glucose-related information in relation to care goals and clinical review.",
  },
  {
    ico: "◎",
    title: "Medication context",
    body: "Keep relevant medication information visible and flag questions for professional review.",
  },
  {
    ico: "◇",
    title: "Lifestyle signals",
    body: "Explore sleep, activity and other contextual factors with appropriate uncertainty.",
  },
  {
    ico: "✳",
    title: "Biological insights",
    body: "Connect accessible education to immune, endocrine and metabolic science.",
  },
  {
    ico: "↗",
    title: "Care preparation",
    body: "Summarise observations and questions for more productive clinical conversations.",
  },
] as const;

const CARE_POINTS = [
  "Explicit consent and appropriate data access controls",
  "Clear source attribution and uncertainty",
  "Safety escalation for concerning symptoms",
  "HCP review for clinical interpretations",
  "Evaluation with healthcare professionals before broader deployment",
] as const;

/**
 * Founder Downloads/index (1).html — Aksh Health personal-intelligence landing.
 * Ivory/teal/coral tokens; Shell/nav remain product chrome.
 */
export function AkshHealthLanding() {
  const [scenario, setScenario] = useState<ScenarioId>("metabolic");
  const d = SCENARIOS.find((s) => s.id === scenario) ?? SCENARIOS[0];

  return (
    <>
      <section className="land-aksh section section-bone" id="overview" aria-labelledby="aksh-title">
        <div className="container">
          <span className="section-num">AKSH HEALTH / PERSONAL HEALTH INTELLIGENCE</span>
          <div className="land-aksh-hero">
            <h1 className="display display-xl" id="aksh-title">
              Your health.
              <br />
              <em className="land-em">Connected over time.</em>
            </h1>
            <p className="lede">
              Health is more than a single result. Aksh Health is designed to bring everyday
              signals, clinical context and meaningful trends together—starting with diabetes
              and metabolic health.
            </p>
          </div>

          <section
            className="land-aksh-demo"
            aria-label="Interactive fictional Aksh personal health preview"
          >
            <div className="land-aksh-demo-bar">
              <span>AKSH / PERSONAL HEALTH OVERVIEW</span>
              <span className="land-aksh-badge">INTERACTIVE FICTIONAL PREVIEW · NOT LIVE DATA</span>
            </div>

            <div className="land-aksh-grid">
              <div className="land-aksh-panel">
                <div className="land-micro">EXPLORE A HEALTH JOURNEY</div>
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="land-aksh-scenario"
                    aria-pressed={s.id === scenario}
                    onClick={() => setScenario(s.id)}
                  >
                    {s.label}
                    <small>{s.sub}</small>
                  </button>
                ))}
              </div>

              <div className="land-aksh-panel" aria-live="polite">
                <div className="land-micro">PERSONALISED CONTEXT</div>
                <div className="land-aksh-person">
                  <div className="land-aksh-avatar" aria-hidden>
                    A
                  </div>
                  <div>
                    <b>Alex Morgan</b>
                    <span>Fictional example · 12-week overview</span>
                  </div>
                </div>
                <div className="land-aksh-metrics">
                  <div className="land-aksh-metric">
                    <span>{d.a[0]}</span>
                    <b>{d.a[1]}</b>
                    <small>{d.a[2]}</small>
                  </div>
                  <div className="land-aksh-metric">
                    <span>{d.b[0]}</span>
                    <b>{d.b[1]}</b>
                    <small>{d.b[2]}</small>
                  </div>
                </div>
                <div className="land-aksh-timeline">
                  <h3>{d.title}</h3>
                  <div className="land-aksh-bars" aria-label="Illustrative trend chart">
                    {d.bars.map((v, i) => (
                      <div key={`${d.id}-${i}`} className="land-aksh-bar" style={{ height: `${v}%` }} />
                    ))}
                  </div>
                  <p className="land-aksh-timeline-note">
                    Illustrative values only. Not measurements or clinical predictions.
                  </p>
                </div>
              </div>

              <aside className="land-aksh-panel" aria-live="polite">
                <div className="land-micro">PERSONALISED EXPLANATION</div>
                <div className="land-aksh-insight">
                  <h3>{d.heading}</h3>
                  <p>{d.copy}</p>
                </div>
                <ul className="land-aksh-checks">
                  {d.checks.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <p className="land-aksh-disclaimer">
                  Educational demonstration. No diagnosis, treatment recommendation or automated
                  medical decision is generated.
                </p>
              </aside>
            </div>
          </section>
        </div>
      </section>

      <section className="land-aksh section section-grid-light" id="journey" aria-labelledby="aksh-journey">
        <div className="container">
          <div className="land-aksh-section-head">
            <div>
              <span className="section-num">AKSH / 02 — THE PERSONAL HEALTH JOURNEY</span>
              <h2 className="display display-xl" id="aksh-journey">
                Not another dashboard.
                <br />
                <em className="land-em">A connected journey.</em>
              </h2>
            </div>
            <p className="lede">
              Aksh should make health information useful at the right moment, without overwhelming
              people with unexplained metrics or fragmented reports.
            </p>
          </div>
          <div className="land-aksh-journey">
            {JOURNEY.map((card) => (
              <article key={card.n} className="land-aksh-journey-card">
                <span>{card.n}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="land-aksh section section-bone"
        id="intelligence"
        aria-labelledby="aksh-intel"
      >
        <div className="container">
          <div className="land-aksh-section-head">
            <div>
              <span className="section-num">AKSH / 03 — CONNECTED HEALTH INTELLIGENCE</span>
              <h2 className="display display-xl" id="aksh-intel">
                More than glucose.
                <br />
                <em className="land-em">More than numbers.</em>
              </h2>
            </div>
            <p className="lede">
              Metabolic health spans multiple systems. The Aksh vision is to connect relevant
              dimensions without presenting speculative correlations as established medical
              conclusions.
            </p>
          </div>
          <div className="land-aksh-features">
            {FEATURES.map((f) => (
              <article key={f.title} className="land-aksh-feature">
                <div className="land-aksh-ico" aria-hidden>
                  {f.ico}
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="land-aksh section section-grid-light" id="care" aria-labelledby="aksh-care">
        <div className="container">
          <div className="land-aksh-section-head">
            <div>
              <span className="section-num">AKSH / 04 — CARE COLLABORATION</span>
              <h2 className="display display-xl" id="aksh-care">
                Designed for people.
                <br />
                <em className="land-em">Grounded in care.</em>
              </h2>
            </div>
            <p className="lede">
              Personal health intelligence must respect boundaries: education is not diagnosis, a
              pattern is not proof, and a patient-facing assistant does not replace a healthcare
              professional.
            </p>
          </div>
          <div className="land-aksh-care">
            <div>
              <h3>Human decisions stay human.</h3>
              <p>
                Aksh&apos;s intended clinical collaboration model supports transparent summaries and
                relevant context while keeping consequential medical decisions with qualified
                professionals.
              </p>
            </div>
            <ul>
              {CARE_POINTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="land-aksh section section-bone land-aksh-last" id="connected">
        <div className="container land-aksh-last-inner">
          <span className="section-num">AKSH HEALTH / CONNECTED TO HSI</span>
          <h2 className="display display-xl">
            A clearer picture of health starts with connected context.
          </h2>
          <p className="lede">
            Aksh brings the HSI vision into the personal health experience—starting with diabetes
            and metabolic health, with responsible pathways to clinician collaboration.
          </p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <a href="#overview" className="btn btn-primary">
              Explore the health journey <span className="arrow">↗</span>
            </a>
            <Link to="/platform" className="btn btn-ghost land-btn-on-light">
              See the platform
            </Link>
            <a
              href="https://www.akshhealth.com"
              className="btn btn-ghost land-btn-on-light"
              target="_blank"
              rel="noreferrer"
            >
              Open Aksh Health ↗
            </a>
          </div>
          <small className="land-aksh-foot-note">
            Interactive product concept with fictional data — not a live account or care record.
          </small>
        </div>
      </section>
    </>
  );
}
