import { useRef, useState } from "react";
import { Link } from "react-router-dom";

type PersonaId = "patient" | "clinician" | "researcher" | "trial";

type Step = {
  title: string;
  description: string;
  outputTitle: string;
  outputDescription: string;
  oversight: string;
};

type Journey = {
  title: string;
  intro: string;
  steps: Step[];
};

const STAGES = ["Connect", "Understand", "Investigate", "Verify", "Act", "Learn"] as const;

/** Founder Downloads/index (3).html — How HSI Works experience explorer. */
const JOURNEYS: Record<PersonaId, Journey> = {
  patient: {
    title: "A clearer picture of your health.",
    intro:
      "Follow a person using Aksh Health to understand changing metabolic health signals and prepare for a care conversation.",
    steps: [
      {
        title: "Bring your information together",
        description:
          "With permission, relevant health records, laboratory results and personal measurements can be brought into a longitudinal view.",
        outputTitle: "Connected health timeline",
        outputDescription: "Available data sources and their coverage are clearly identified.",
        oversight: "Only authorised data should be accessed.",
      },
      {
        title: "See what changed",
        description:
          "View trends over time, including laboratory values, monitoring and daily-life context, without treating one measurement as the whole story.",
        outputTitle: "Meaningful changes over time",
        outputDescription: "An accessible explanation of trends and gaps in the data.",
        oversight: "A trend is not a diagnosis.",
      },
      {
        title: "Ask a better question",
        description:
          "Explore possible context for changes and identify what information might be useful to discuss with a professional.",
        outputTitle: "Questions worth discussing",
        outputDescription: "A structured set of considerations, not an automated treatment plan.",
        oversight: "Explanations must not imply unsupported causation.",
      },
      {
        title: "Check the explanation",
        description:
          "Inspect the data behind a summary, its limits and any missing or inconsistent observations.",
        outputTitle: "Traceable interpretation",
        outputDescription: "A clear distinction between recorded facts and interpretation.",
        oversight: "Uncertainty must be shown.",
      },
      {
        title: "Prepare for care",
        description: "Create a concise summary and questions to take to a clinician.",
        outputTitle: "Visit preparation",
        outputDescription: "A reviewable summary for a healthcare conversation.",
        oversight: "Treatment decisions remain with qualified professionals.",
      },
      {
        title: "Follow changes over time",
        description:
          "Continue monitoring relevant trends and record follow-up outcomes as new information becomes available.",
        outputTitle: "Longitudinal perspective",
        outputDescription: "A history that can support future conversations.",
        oversight: "Ongoing monitoring requires appropriate permissions.",
      },
    ],
  },
  clinician: {
    title: "The patient story, in clinical context.",
    intro:
      "Follow a clinician reviewing a complex longitudinal record without losing sight of safety and accountability.",
    steps: [
      {
        title: "Access authorised context",
        description:
          "Bring together relevant history, medications, investigations and monitoring from permitted clinical sources.",
        outputTitle: "Patient context view",
        outputDescription: "Information is organised around the clinical task.",
        oversight: "Identity, access and provenance must be verified.",
      },
      {
        title: "Summarise the timeline",
        description:
          "Identify clinically relevant events and changes while retaining links to original records.",
        outputTitle: "Longitudinal summary",
        outputDescription: "A reviewable timeline, not a replacement medical record.",
        oversight: "Summaries can omit important context and require review.",
      },
      {
        title: "Investigate the question",
        description:
          "Explore medication changes, trends and missing information relevant to the presenting problem.",
        outputTitle: "Clinical review workspace",
        outputDescription: "Structured observations and questions for professional assessment.",
        oversight: "No autonomous diagnosis or prescribing.",
      },
      {
        title: "Validate with evidence",
        description:
          "Inspect sources, potential contradictions and uncertainty before accepting any generated interpretation.",
        outputTitle: "Evidence-linked considerations",
        outputDescription: "Support for clinician judgment, not a recommendation without review.",
        oversight: "Clinical safety and local validation are essential.",
      },
      {
        title: "Document and decide",
        description:
          "A clinician confirms, edits or rejects the interpretation and records the decision through approved workflows.",
        outputTitle: "Clinician-controlled output",
        outputDescription: "A reviewed note or follow-up plan where supported.",
        oversight: "Only authorised clinical actions are permitted.",
      },
      {
        title: "Review outcomes",
        description:
          "Use subsequent results and follow-up to update the clinical picture and assess workflow performance.",
        outputTitle: "Care continuity",
        outputDescription: "A clearer record of what changed after review.",
        oversight: "Audit and quality monitoring remain necessary.",
      },
    ],
  },
  researcher: {
    title: "From a scientific question to a testable direction.",
    intro:
      "Follow an ISI researcher comparing biological mechanisms and evidence rather than accepting an opaque answer.",
    steps: [
      {
        title: "Define a question",
        description:
          "Specify the biological mechanism, cell population, tissue and disease context under investigation.",
        outputTitle: "Investigation scope",
        outputDescription: "A precise question and explicit assumptions.",
        oversight: "Research scope should remain transparent.",
      },
      {
        title: "Retrieve relevant knowledge",
        description:
          "Assemble relevant concepts and source-linked studies from approved research collections.",
        outputTitle: "Evidence collection",
        outputDescription: "Study context, methods and source metadata.",
        oversight: "Source coverage and freshness must be stated.",
      },
      {
        title: "Compare explanations",
        description:
          "Examine alternative mechanisms and where different studies appear to disagree.",
        outputTitle: "Mechanism comparison",
        outputDescription: "A structured comparison of plausible explanations.",
        oversight: "Correlation must not be presented as causation.",
      },
      {
        title: "Evaluate confidence",
        description:
          "Review study limitations, reproducibility, confounders and gaps before drawing conclusions.",
        outputTitle: "Uncertainty assessment",
        outputDescription: "An evidence-qualified interpretation.",
        oversight: "Computational inferences are not validated findings.",
      },
      {
        title: "Form a hypothesis",
        description:
          "Translate an unresolved mechanism into a falsifiable question and candidate experiment.",
        outputTitle: "Research brief",
        outputDescription: "A proposed hypothesis with measurements and controls.",
        oversight: "Human scientific review is required.",
      },
      {
        title: "Refine through evidence",
        description:
          "Update the hypothesis as new studies or experimental results become available.",
        outputTitle: "Investigation history",
        outputDescription: "A traceable record of changing interpretations.",
        oversight: "Claims require review before promotion to accepted knowledge.",
      },
    ],
  },
  trial: {
    title: "A more transparent path through trial information.",
    intro:
      "Follow a study team organising protocol criteria and preparing information for human eligibility review.",
    steps: [
      {
        title: "Identify a study",
        description: "Find relevant studies using verified registry and protocol information.",
        outputTitle: "Study discovery",
        outputDescription: "A shortlist grounded in official study details.",
        oversight: "Recruitment status and registry dates must be checked.",
      },
      {
        title: "Understand the protocol",
        description: "Break down inclusion, exclusion, intervention and visit requirements.",
        outputTitle: "Structured criteria",
        outputDescription: "Readable requirements linked to the original protocol.",
        oversight: "The protocol remains authoritative.",
      },
      {
        title: "Collect relevant context",
        description:
          "With appropriate consent and access, identify available information relevant to each criterion.",
        outputTitle: "Criteria checklist",
        outputDescription: "A clear view of what is known and missing.",
        oversight: "Sensitive data use requires a lawful basis.",
      },
      {
        title: "Review uncertainty",
        description:
          "Distinguish information that appears consistent with a criterion from missing or ambiguous information.",
        outputTitle: "Review flags",
        outputDescription: "Questions for a study coordinator or investigator.",
        oversight: "No automated eligibility confirmation.",
      },
      {
        title: "Support screening",
        description:
          "Provide a reviewable summary to the authorised research team for formal assessment.",
        outputTitle: "Screening preparation",
        outputDescription: "A structured, auditable handoff.",
        oversight: "Investigator-led screening determines eligibility.",
      },
      {
        title: "Track next steps",
        description:
          "Record follow-up questions and changes in study status through authorised workflows.",
        outputTitle: "Study follow-up",
        outputDescription: "A clearer path for further contact and review.",
        oversight: "Participation and consent remain voluntary.",
      },
    ],
  },
};

const PERSONA_TABS: { id: PersonaId; label: string }[] = [
  { id: "patient", label: "For patients" },
  { id: "clinician", label: "For clinicians" },
  { id: "researcher", label: "For researchers" },
  { id: "trial", label: "For trial teams" },
];

const JOURNEY_CARDS: {
  n: string;
  title: string;
  body: string;
  jump: PersonaId;
  cta: string;
  to: string;
}[] = [
  {
    n: "01 / AKSH HEALTH",
    title: "People & patients",
    body: "Understand personal trends, prepare questions and collaborate with care professionals.",
    jump: "patient",
    cta: "Explore patient journey ↗",
    to: "/for-aksh",
  },
  {
    n: "02 / HSI CLINICAL",
    title: "Care professionals",
    body: "Bring authorised longitudinal context and evidence-linked considerations into review.",
    jump: "clinician",
    cta: "Explore clinical journey ↗",
    to: "/clinical-timeline",
  },
  {
    n: "03 / IMMUNE SUPER INTELLIGENCE",
    title: "Scientists",
    body: "Investigate mechanisms, conflicting evidence and testable scientific hypotheses.",
    jump: "researcher",
    cta: "Explore research journey ↗",
    to: "/for-isi",
  },
  {
    n: "04 / HSI TRIALS",
    title: "Trial teams",
    body: "Structure study criteria, review relevant information and support investigator screening.",
    jump: "trial",
    cta: "Explore trials journey ↗",
    to: "/for-trials",
  },
];

const PRINCIPLES = [
  "Permission-based access to health information",
  "Traceable source and evidence context",
  "Visible uncertainty and missing information",
  "Human review and accountable decisions",
  "Safety evaluation before clinical deployment",
] as const;

/**
 * Founder Downloads/index (3).html — How HSI Works interactive journeys.
 * Ivory/teal/coral tokens; Shell/nav remain product chrome.
 */
export function HowItWorks() {
  const [persona, setPersona] = useState<PersonaId>("patient");
  const [step, setStep] = useState(0);
  const experienceRef = useRef<HTMLElement>(null);

  const journey = JOURNEYS[persona];
  const current = journey.steps[step];

  function selectPersona(id: PersonaId) {
    setPersona(id);
    setStep(0);
  }

  function jumpTo(id: PersonaId) {
    selectPersona(id);
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    experienceRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <>
      <section className="land-hiw section section-bone" aria-labelledby="hiw-title">
        <div className="container">
          <span className="section-num">HSI / HOW IT WORKS</span>
          <div className="land-hiw-hero">
            <h1 className="display display-xl" id="hiw-title">
              From complexity
              <br />
              to <em className="land-em">clarity.</em>
            </h1>
            <p className="lede">
              Health information is fragmented. Scientific knowledge is vast. HSI is designed to
              connect the relevant context, investigate meaningful questions and make findings
              understandable—with evidence, privacy and human judgment at the centre.
            </p>
          </div>

          <section
            ref={experienceRef}
            id="experience"
            className="land-hiw-workspace"
            aria-label="Interactive HSI journeys"
          >
            <div className="land-hiw-topline">
              <span>HSI / EXPERIENCE EXPLORER</span>
              <span>
                <b>●</b> CONCEPTUAL WORKFLOW
              </span>
            </div>

            <div className="land-hiw-tabs" role="tablist" aria-label="Choose a perspective">
              {PERSONA_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={persona === tab.id}
                  onClick={() => selectPersona(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="land-hiw-workspace-head">
              <h2>{journey.title}</h2>
              <p>{journey.intro}</p>
            </div>

            <div className="land-hiw-steps" aria-label="Journey stages">
              {STAGES.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  aria-current={i === step ? "step" : undefined}
                  onClick={() => setStep(i)}
                >
                  <small>0{i + 1} / 06</small>
                  <strong>{label}</strong>
                </button>
              ))}
            </div>

            <div className="land-hiw-detail">
              <div className="land-hiw-detail-main" aria-live="polite">
                <div>
                  <div className="land-hiw-eyebrow">
                    STEP 0{step + 1} / {STAGES[step].toUpperCase()}
                  </div>
                  <h3>{current.title}</h3>
                  <p>{current.description}</p>
                </div>
                <div className="land-hiw-flowline">Context → Interpretation → Review</div>
              </div>
              <aside className="land-hiw-side">
                <div>
                  <div className="land-hiw-eyebrow">WHAT YOU SEE</div>
                  <h4>{current.outputTitle}</h4>
                  <p>{current.outputDescription}</p>
                </div>
                <div className="land-hiw-side-foot">REVIEW NOTE · {current.oversight}</div>
              </aside>
            </div>

            <div className="land-hiw-actions">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                ← Previous stage
              </button>
              <button type="button" onClick={() => setStep((s) => (s + 1) % 6)}>
                {step === 5 ? "Restart journey ↺" : "Next stage →"}
              </button>
            </div>

            <p className="land-hiw-disclaimer">
              Illustrative product journey. These screens do not represent live patient data,
              completed clinical validations or currently deployed research services. No invented
              MoU; Gate C stays human-only; trial paths never auto-confirm eligibility.
            </p>
          </section>
        </div>
      </section>

      <section className="land-hiw section section-grid-light" id="people" aria-labelledby="hiw-people">
        <div className="container">
          <div className="land-hiw-section-head">
            <div>
              <span className="section-num">FOUR EXPERIENCES / ONE CONNECTED VISION</span>
              <h2 className="display display-xl" id="hiw-people">
                Built around
                <br />
                <em className="land-em">your question.</em>
              </h2>
            </div>
            <p className="lede">
              The underlying approach is shared, but the experience and permissions differ. A
              patient should not see a researcher&apos;s workbench; a clinician should not receive
              an unexplained automated recommendation.
            </p>
          </div>
          <div className="land-hiw-journeys">
            {JOURNEY_CARDS.map((card) => (
              <article key={card.n} className="land-hiw-journey">
                <span className="land-hiw-journey-n">{card.n}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <button type="button" className="land-hiw-jump" onClick={() => jumpTo(card.jump)}>
                  {card.cta}
                </button>
                <Link to={card.to} className="land-hiw-product-link">
                  Open product surface →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="land-hiw section section-bone"
        id="responsibility"
        aria-labelledby="hiw-trust"
      >
        <div className="container">
          <div className="land-hiw-section-head">
            <div>
              <span className="section-num">BUILT WITH RESPONSIBILITY</span>
              <h2 className="display display-xl" id="hiw-trust">
                Intelligence you
                <br />
                can <em className="land-em">question.</em>
              </h2>
            </div>
            <p className="lede">
              Useful intelligence needs clear limits. HSI&apos;s intended architecture makes the
              source, uncertainty, permissions and review requirements visible at the point of use.
            </p>
          </div>
          <div className="land-hiw-principles">
            <div>
              <h3>Human judgment stays in control.</h3>
              <p>
                HSI is designed to support, not replace, clinical decisions, research validation or
                trial investigator assessment.
              </p>
            </div>
            <ul>
              {PRINCIPLES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="land-hiw section section-grid-light land-hiw-last">
        <div className="container land-hiw-last-inner">
          <span className="section-num">ONE SYSTEM / DIFFERENT PERSPECTIVES</span>
          <h2 className="display display-xl">
            One connected approach. Many meaningful outcomes.
          </h2>
          <p className="lede">
            Explore how HSI is intended to help turn disconnected information into understandable,
            reviewable knowledge across personal health, clinical care, scientific research and
            trials.
          </p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <a href="#experience" className="btn btn-ink">
              Explore the interactive journey <span className="arrow">↗</span>
            </a>
            <Link to="/status" className="btn btn-ghost land-btn-on-light">
              What&apos;s available
            </Link>
            <Link to="/products" className="btn btn-ghost land-btn-on-light">
              Four products
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
