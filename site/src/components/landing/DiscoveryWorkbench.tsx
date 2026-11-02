import { useState } from "react";
import { Link } from "react-router-dom";

const STAGES = [
  ["Established evidence", "What research supports"],
  ["Conflicting findings", "Where results diverge"],
  ["Knowledge gaps", "What remains unknown"],
  ["Testable hypothesis", "What could be investigated"],
  ["Validation pathway", "How researchers evaluate"],
] as const;

type StepData = {
  title: string;
  desc: string;
  sources: string[];
  inspect: string;
  text: string;
  facts: [string, string][];
};

const DATASETS: StepData[][] = [
  [
    {
      title: "Inflammatory signalling involves multiple interacting pathways.",
      desc: "Published biomedical research describes innate and adaptive immune responses, cytokine signalling and mechanisms that regulate inflammation. The relevance of any pathway depends on tissue, disease state and study context.",
      sources: [
        "Immune signalling and cytokine biology",
        "Resolution and regulatory pathways",
        "Tissue-specific immune responses",
      ],
      inspect: "What is supported?",
      text: "A mechanism may be biologically plausible without explaining an individual patient's symptoms or establishing treatment efficacy.",
      facts: [
        ["Established concepts", "Inflammatory pathways and regulatory processes are documented."],
        ["Context matters", "Cell type, tissue and disease state alter interpretation."],
      ],
    },
    {
      title: "Why do findings differ between studies?",
      desc: "Differences in study populations, disease definitions, sample timing, assays and interventions can produce findings that appear inconsistent. HSI should surface those differences rather than average them away.",
      sources: [
        "Study population and inclusion criteria",
        "Biomarker and assay differences",
        "Conflicting or null study findings",
      ],
      inspect: "Contradiction is information",
      text: "A disagreement between studies is not automatically a scientific contradiction. First compare design, endpoints and measurement context.",
      facts: [
        ["Compare methods", "Distinguish true disagreement from incomparable studies."],
        ["Check strength", "Review replication, bias and effect uncertainty."],
      ],
    },
    {
      title: "Which mechanism remains insufficiently characterised?",
      desc: "A research gap emerges when relevant relationships, measurements or experimental comparisons are missing. HSI should distinguish absent evidence from evidence of absence.",
      sources: [
        "Missing longitudinal measurements",
        "Understudied tissue contexts",
        "Unresolved pathway interactions",
      ],
      inspect: "Identify a bounded unknown",
      text: "A useful gap specifies the population, biological context, missing observation and why resolving it would matter.",
      facts: [
        ["Unknown ≠ negative", "Lack of studies cannot prove a mechanism is absent."],
        ["Prioritise", "Consider feasibility, novelty and potential impact."],
      ],
    },
    {
      title:
        "Could immune-regulatory patterns help explain persistent inflammation in a defined subgroup?",
      desc: "Candidate hypothesis: in a clearly specified disease and tissue context, differences in regulatory signalling may associate with prolonged inflammatory markers. This is a proposal to test, not an established causal claim.",
      sources: [
        "Define population and comparator",
        "Specify measurable pathway markers",
        "Pre-register alternative explanations",
      ],
      inspect: "Turn the question into a test",
      text: "A testable hypothesis defines exposures, outcomes, timing, confounders and falsification criteria.",
      facts: [
        ["Prediction", "Prespecified regulatory markers differ across groups."],
        ["Alternative", "Observed differences may reflect disease severity or treatment."],
      ],
    },
    {
      title: "Design a study that could challenge the hypothesis.",
      desc: "An investigator would evaluate study feasibility, measurement validity, confounding, ethical approvals and statistical analysis. Replication and independent review determine whether confidence should change.",
      sources: [
        "Protocol and ethics review",
        "Measurement and analysis plan",
        "Independent replication and review",
      ],
      inspect: "Human-led validation",
      text: "HSI can organise evidence and propose research directions. Scientific experts remain responsible for study design, interpretation and approval.",
      facts: [
        ["Review gate", "Expert approval before any real-world research action."],
        ["Update evidence", "Validated results can inform versioned knowledge updates."],
      ],
    },
  ],
  [
    {
      title: "Gut microbes and immune signalling are linked in research.",
      desc: "Research describes microbial metabolites, epithelial barriers and host immune responses. Associations vary across cohorts, sampling methods and physiological contexts.",
      sources: [
        "Microbial metabolite studies",
        "Barrier and mucosal immunity",
        "Host–microbe interactions",
      ],
      inspect: "Known relationships",
      text: "Microbiome composition alone cannot reliably establish a specific clinical mechanism.",
      facts: [
        ["Evidence type", "Many findings are observational or preclinical."],
        ["Context", "Diet, medications and environment can matter."],
      ],
    },
    {
      title: "Different cohorts report different microbial signatures.",
      desc: "Taxonomic differences may reflect geography, diet, sequencing, processing or disease heterogeneity rather than a single reproducible disease signature.",
      sources: [
        "Cohort comparisons",
        "Sequencing and batch effects",
        "Null and inconsistent findings",
      ],
      inspect: "Explain heterogeneity",
      text: "HSI should compare methods and confidence before calling results contradictory.",
      facts: [
        ["Reproducibility", "Cross-cohort validation is essential."],
        ["Confounders", "Diet and medication exposures need review."],
      ],
    },
    {
      title: "Which functional signals are reproducible?",
      desc: "A gap may concern whether metabolite pathways or host responses are more transferable across populations than specific taxa.",
      sources: [
        "Functional metagenomics",
        "Metabolomics availability",
        "Host-response measurements",
      ],
      inspect: "Define the gap",
      text: "Missing paired host and microbial longitudinal measurements may limit interpretation.",
      facts: [
        ["Missing data", "Matched time-series can be scarce."],
        ["Boundary", "Functional association is not causal proof."],
      ],
    },
    {
      title: "Do metabolite-linked pathways correlate with a defined immune phenotype?",
      desc: "A candidate study could compare prespecified microbial metabolites and host immune markers across matched participants, with confounder control and longitudinal sampling.",
      sources: ["Prespecified biomarker panel", "Sampling and comparator plan", "Negative controls"],
      inspect: "Falsifiable prediction",
      text: "The hypothesis should allow a clear negative result and competing explanations.",
      facts: [
        ["Prediction", "A prespecified association is reproducible."],
        ["Alternative", "Diet or medication explains the pattern."],
      ],
    },
    {
      title: "Validate through rigorous cohort and experimental work.",
      desc: "A staged programme might use independent cohorts and, where justified, controlled mechanistic studies with appropriate approvals.",
      sources: [
        "Independent cohort replication",
        "Assay validation",
        "Ethics and expert review",
      ],
      inspect: "Review before action",
      text: "Clinical translation requires substantially more evidence than exploratory associations.",
      facts: [
        ["Gate", "Ethics, safety and scientific review."],
        ["Outcome", "Version the evidence and record limitations."],
      ],
    },
  ],
  [
    {
      title: "Metabolism and immunity interact across tissues.",
      desc: "Metabolic regulation involves endocrine, inflammatory and organ-specific pathways. Literature connects these processes but not every association has a confirmed causal mechanism.",
      sources: [
        "Insulin signalling research",
        "Adipose immune biology",
        "Metabolic inflammation literature",
      ],
      inspect: "Biological foundation",
      text: "Organ, cell-state and treatment context determine how findings should be interpreted.",
      facts: [
        ["Known biology", "Multiple pathways contribute."],
        ["Caution", "No single pathway explains every patient."],
      ],
    },
    {
      title: "Biomarker patterns differ across populations.",
      desc: "Some studies report different inflammatory or metabolic markers depending on age, disease stage, medication exposure and measurement timing.",
      sources: [
        "Population differences",
        "Medication and timing effects",
        "Discordant biomarker findings",
      ],
      inspect: "Compare carefully",
      text: "Disagreement may be due to cohort composition or analytical differences.",
      facts: [
        ["Study design", "Compare endpoints and baseline risk."],
        ["Uncertainty", "Account for confidence intervals."],
      ],
    },
    {
      title: "Which temporal relationships are unresolved?",
      desc: "A key gap may be whether immune changes precede metabolic changes, follow them or reflect shared upstream processes.",
      sources: [
        "Longitudinal cohort availability",
        "Time-resolved biomarkers",
        "Missing confounder data",
      ],
      inspect: "Temporal uncertainty",
      text: "Even a time-ordered association is not sufficient to establish causation.",
      facts: [
        ["Time", "Measure order and interval."],
        ["Causality", "Consider confounding and reverse causation."],
      ],
    },
    {
      title: "Can longitudinal immune markers predict later metabolic change?",
      desc: "A research hypothesis could test whether prespecified immune-marker trajectories add predictive value beyond established clinical predictors in a defined cohort.",
      sources: [
        "Prediction baseline model",
        "Longitudinal marker protocol",
        "External validation plan",
      ],
      inspect: "A measurable proposal",
      text: "Evaluate calibration, generalisation and potential bias, not just model discrimination.",
      facts: [
        ["Primary endpoint", "Incremental predictive performance."],
        ["Alternative", "Markers may proxy known risk factors."],
      ],
    },
    {
      title: "Test and independently validate the prediction.",
      desc: "Researchers would predefine analyses, evaluate external cohorts and investigate whether any finding is robust and clinically meaningful.",
      sources: [
        "Pre-registration",
        "External cohort evaluation",
        "Scientific and clinical review",
      ],
      inspect: "Evidence before deployment",
      text: "Predictive value alone does not justify clinical decision support or treatment changes.",
      facts: [
        ["Review", "Independent replication and bias assessment."],
        ["Governance", "Clinical deployment requires separate validation."],
      ],
    },
  ],
];

const SCENARIOS = ["Chronic inflammation", "Gut–immune signalling", "Metabolic disease"];
const TAGS = ["EVIDENCE MAP", "COMPARE", "OPEN QUESTION", "UNVALIDATED", "REVIEW GATE"];
const SOURCE_LABELS = ["Research dimension", "Evidence comparison", "Investigation input"];
const SOURCE_SYMBOLS = ["◇", "↗", "⊞"];

type Props = {
  /** Use h1 on dedicated `/discovery-engine`; h2 when embedded on Home. */
  headingLevel?: 1 | 2;
};

/** §04 discovery engine workbench (founder HTML). */
export function DiscoveryWorkbench({ headingLevel = 2 }: Props) {
  const [scenario, setScenario] = useState(0);
  const [step, setStep] = useState(0);
  const d = DATASETS[scenario][step];
  const TitleTag = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className="land-disc section section-grid-light" id="discovery-engine" aria-labelledby="disc-title">
      <div className="container">
        <div className="land-disc-heading">
          <div>
            <span className="section-num">04 / THE DISCOVERY ENGINE</span>
            <TitleTag className="display display-xl" id="disc-title" style={{ marginTop: "0.75rem" }}>
              From evidence
              <br />
              to <em className="land-em">discovery.</em>
            </TitleTag>
          </div>
          <p className="lede">
            Science advances when we connect what we know, challenge what conflicts, and ask
            better questions. Explore how HSI can organise evidence into research-ready
            hypotheses.
          </p>
        </div>

        <section className="land-workspace-dark" aria-label="Interactive HSI scientific discovery experience">
          <div className="land-toolbar">
            <div className="land-micro">HSI / SCIENTIFIC DISCOVERY WORKBENCH</div>
            <div className="land-status">
              <span className="land-status-dot" aria-hidden />
              EXPLORATORY RESEARCH · HUMAN REVIEW REQUIRED
            </div>
          </div>

          <div className="land-scenario-bar">
            <span className="land-scenario-label">INVESTIGATE</span>
            {SCENARIOS.map((label, i) => (
              <button
                key={label}
                type="button"
                className="land-chip"
                aria-pressed={i === scenario}
                onClick={() => {
                  setScenario(i);
                  setStep(0);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="land-flow" aria-label="Discovery process">
            {STAGES.map((s, i) => (
              <button
                key={s[0]}
                type="button"
                className="land-flow-stage"
                aria-pressed={i === step}
                onClick={() => setStep(i)}
              >
                <span className="land-stepnum">0{i + 1} / 05</span>
                <div className="land-stagetitle">{s[0]}</div>
                <div className="land-stagesub">{s[1]}</div>
              </button>
            ))}
          </div>

          <div className="land-disc-detail">
            <article className="land-evidence" aria-live="polite">
              <div className="land-panelhead">
                <span className="land-micro">
                  0{step + 1} / {STAGES[step][0].toUpperCase()}
                </span>
                <span className="land-chip-tag">{TAGS[step]}</span>
              </div>
              <h3 className="land-paneltitle">{d.title}</h3>
              <p className="land-panelcopy">{d.desc}</p>
              <div className="land-sourcecards">
                {d.sources.map((src, i) => (
                  <div key={src} className="land-source-card">
                    <span className="land-symbol" aria-hidden>
                      {SOURCE_SYMBOLS[i]}
                    </span>
                    <div>
                      {src}
                      <small>
                        {SOURCE_LABELS[i]} · illustrative, not a live citation
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <aside className="land-inspector" aria-live="polite">
              <span className="land-micro">RESEARCH INTERPRETATION</span>
              <h3>{d.inspect}</h3>
              <p>{d.text}</p>
              {d.facts.map((f) => (
                <div key={f[0]} className="land-fact">
                  <div
                    className={`land-factmark${
                      step === 1 || step === 2 ? " warn" : step === 4 ? " lime" : ""
                    }`}
                  />
                  <div>
                    <strong>{f[0]}</strong>
                    <span>{f[1]}</span>
                  </div>
                </div>
              ))}
            </aside>
          </div>

          <div className="land-disc-footer">
            <p className="land-disclaimer-dark">
              Illustrative scientific workflow. Examples are not generated from a live evidence
              corpus and do not represent validated findings, treatment recommendations, or
              confirmed causal relationships.
            </p>
            <button
              type="button"
              className="land-next"
              onClick={() => setStep((s) => (s + 1) % 5)}
            >
              {step === 4
                ? "Restart investigation ↺"
                : `Next: ${STAGES[step + 1][0].toLowerCase()} →`}
            </button>
          </div>
        </section>

        <div className="land-disc-lower">
          <div>
            <strong>Grounded in evidence.</strong> Designed to expose uncertainty, not conceal it.
          </div>
          <div>Observe → Compare → Question → Test → Review</div>
          <Link to="/discovery" className="btn btn-ink">
            Open Discovery Centre <span className="arrow">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
