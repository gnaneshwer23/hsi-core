import { useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { PRODUCT_NAME, PRODUCT_SHORT } from "../../lib/brand";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL, type EcosystemProduct } from "../../lib/productMaturity";
import "../../styles/hsi-editorial.css";
import "../../styles/how-it-works.css";

type PersonaId = "patient" | "clinician" | "researcher" | "trial";

/** Arrow/Home/End navigation for exclusive radiogroups built from buttons. */
function moveRadioFocus(
  event: KeyboardEvent<HTMLElement>,
  index: number,
  length: number,
  select: (next: number) => void,
) {
  let next: number | null = null;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowRight":
      next = (index + 1) % length;
      break;
    case "ArrowUp":
    case "ArrowLeft":
      next = (index - 1 + length) % length;
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = length - 1;
      break;
    default:
      return;
  }
  event.preventDefault();
  select(next);
  const group = event.currentTarget.closest("[role='radiogroup']");
  const radios = group?.querySelectorAll<HTMLElement>('[role="radio"]');
  radios?.[next]?.focus();
}

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

const STAGES = ["Connect", "Understand", "Investigate", "Verify", "Review", "Refine"] as const;

/** Founder Downloads/index (3).html — How HSI Works experience explorer. */
const JOURNEYS: Record<PersonaId, Journey> = {
  patient: {
    title: "A clearer picture of your health.",
    intro: "Follow a person using Aksh Health to understand changing metabolic health signals and prepare for a care conversation.",
    steps: [
      {
        title: "Bring your information together",
        description: "With permission, relevant health records, laboratory results and personal measurements can be brought into a longitudinal view.",
        outputTitle: "Connected health timeline",
        outputDescription: "Available data sources and their coverage are clearly identified.",
        oversight: "Only authorised data should be accessed.",
      },
      {
        title: "See what changed",
        description: "View trends over time, including laboratory values, monitoring and daily-life context, without treating one measurement as the whole story.",
        outputTitle: "Meaningful changes over time",
        outputDescription: "An accessible explanation of trends and gaps in the data.",
        oversight: "A trend is not a diagnosis.",
      },
      {
        title: "Ask a better question",
        description: "Explore possible context for changes and identify what information might be useful to discuss with a professional.",
        outputTitle: "Questions worth discussing",
        outputDescription: "A structured set of considerations, not an automated treatment plan.",
        oversight: "Explanations must not imply unsupported causation.",
      },
      {
        title: "Check the explanation",
        description: "Inspect the data behind a summary, its limits and any missing or inconsistent observations.",
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
        description: "Continue monitoring relevant trends and record follow-up outcomes as new information becomes available.",
        outputTitle: "Longitudinal perspective",
        outputDescription: "A history that can support future conversations.",
        oversight: "Ongoing monitoring requires appropriate permissions.",
      },
    ],
  },
  clinician: {
    title: "The patient story, in clinical context.",
    intro: "Follow a clinician reviewing a complex longitudinal record without losing sight of safety and accountability.",
    steps: [
      {
        title: "Access authorised context",
        description: "Bring together relevant history, medications, investigations and monitoring from permitted clinical sources.",
        outputTitle: "Patient context view",
        outputDescription: "Information is organised around the clinical task.",
        oversight: "Identity, access and provenance must be verified.",
      },
      {
        title: "Summarise the timeline",
        description: "Identify clinically relevant events and changes while retaining links to original records.",
        outputTitle: "Longitudinal summary",
        outputDescription: "A reviewable timeline, not a replacement medical record.",
        oversight: "Summaries can omit important context and require review.",
      },
      {
        title: "Investigate the question",
        description: "Explore medication changes, trends and missing information relevant to the presenting problem.",
        outputTitle: "Clinical review workspace",
        outputDescription: "Structured observations and questions for professional assessment.",
        oversight: "No autonomous diagnosis or prescribing.",
      },
      {
        title: "Validate with evidence",
        description: "Inspect sources, potential contradictions and uncertainty before accepting any generated interpretation.",
        outputTitle: "Evidence-linked considerations",
        outputDescription: "Support for clinician judgment, not a recommendation without review.",
        oversight: "Clinical safety and local validation are essential.",
      },
      {
        title: "Document and decide",
        description: "A clinician confirms, edits or rejects the interpretation and records the decision through approved workflows.",
        outputTitle: "Clinician-controlled output",
        outputDescription: "A reviewed note or follow-up plan where supported.",
        oversight: "Only authorised clinical actions are permitted.",
      },
      {
        title: "Review outcomes",
        description: "Use subsequent results and follow-up to update the clinical picture and assess workflow performance.",
        outputTitle: "Care continuity",
        outputDescription: "A clearer record of what changed after review.",
        oversight: "Audit and quality monitoring remain necessary.",
      },
    ],
  },
  researcher: {
    title: "From a research question to a reviewable brief.",
    intro: "Explore how an ISI Research investigation can organise permitted evidence, biological context and human assessment. The example explains the approach rather than reporting a scientific result.",
    steps: [
      {
        title: "Define the research question",
        description: "Specify the biological concepts, study population and question being investigated. Make assumptions and limits explicit before looking for an explanation.",
        outputTitle: "Investigation scope",
        outputDescription: "A question and the context selected for the investigation.",
        oversight: "Scope and permissions determine what information can be used.",
      },
      {
        title: "Find relevant evidence",
        description: "Retrieve relevant passages from the permitted evidence collection. Retain source references and versions so the material can be inspected.",
        outputTitle: "Evidence references",
        outputDescription: "Relevant passage references from the supplied collection.",
        oversight: "Coverage is limited to supplied evidence; this is not a search of all literature.",
      },
      {
        title: "Inspect the biological connections",
        description: "Follow existing knowledge relationships and inspect explicit supporting or opposing assessments where available. Keep biological context distinct from direct claim support.",
        outputTitle: "Graph and evidence context",
        outputDescription: "Existing relationship identifiers and the assessments linked to them.",
        oversight: "A connection does not establish causation. Missing opposing evidence is not proof of agreement.",
      },
      {
        title: "Assess the limits",
        description: "A reviewer examines study setting, population, methods and uncertainties before accepting an interpretation. Unmapped evidence and missing context remain visible.",
        outputTitle: "Questions for assessment",
        outputDescription: "A clear account of evidence limits and unresolved questions.",
        oversight: "An investigation does not independently validate a scientific finding.",
      },
      {
        title: "Review the investigation",
        description: "An authorised reviewer inspects the evidence and candidate research questions, records an assessment and prepares a brief with source references retained.",
        outputTitle: "Reviewable research brief",
        outputDescription: "An investigation summary and explicit human review record.",
        oversight: "Candidate questions remain unvalidated. Review completion does not approve a claim.",
      },
      {
        title: "Refine with human oversight",
        description: "Use reviewer feedback to refine the research question. Further evidence and any change to accepted knowledge require their own checks and human assessment.",
        outputTitle: "Documented next questions",
        outputDescription: "A considered direction for further investigation rather than an automatic conclusion.",
        oversight: "Feedback does not automatically update the knowledge graph or train a model.",
      },
    ],
  },
  trial: {
    title: "A more transparent path through trial information.",
    intro: "Follow a study team organising protocol criteria and preparing information for human eligibility review.",
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
        description: "With appropriate consent and access, identify available information relevant to each criterion.",
        outputTitle: "Criteria checklist",
        outputDescription: "A clear view of what is known and missing.",
        oversight: "Sensitive data use requires a lawful basis.",
      },
      {
        title: "Review uncertainty",
        description: "Distinguish information that appears consistent with a criterion from missing or ambiguous information.",
        outputTitle: "Review flags",
        outputDescription: "Questions for a study coordinator or investigator.",
        oversight: "No automated eligibility confirmation.",
      },
      {
        title: "Support screening",
        description: "Provide a reviewable summary to the authorised research team for formal assessment.",
        outputTitle: "Screening preparation",
        outputDescription: "A structured, auditable handoff.",
        oversight: "Investigator-led screening determines eligibility.",
      },
      {
        title: "Track next steps",
        description: "Record follow-up questions and changes in study status through authorised workflows.",
        outputTitle: "Study follow-up",
        outputDescription: "A clearer path for further contact and review.",
        oversight: "Participation and consent remain voluntary.",
      },
    ],
  },
};

const PERSPECTIVES: { id: PersonaId; label: string; productId: EcosystemProduct["id"]; href: string; scope: string }[] = [
  { id: "patient", label: "Personal health", productId: "aksh", href: "/for-aksh", scope: "Illustrative Aksh journey. Available features depend on the product’s stated care scope and authorised data sources." },
  { id: "researcher", label: "Research", productId: "isi", href: "/for-isi", scope: "Illustrative ISI Research journey. Evidence availability and permitted collections determine what an investigation can use." },
  { id: "clinician", label: "Care teams", productId: "clinical", href: "/platform", scope: "Intended HSI Clinical journey, in development. This page does not connect to clinical records or provide clinical decision support." },
  { id: "trial", label: "Trial research", productId: "trials", href: "/for-trials", scope: "Intended HSI Trials journey, planned. Live study matching, patient screening and eligibility confirmation are not available here." },
];

const PRINCIPLES = [
  {
    title: "Data stays with its product",
    detail: "Aksh care records and ISI research data remain in their own environments. Shared technology does not create a shared patient database.",
    kicker: "01 / OWNERSHIP",
  },
  {
    title: "Sources stay in view",
    detail: "Review requires the context behind an interpretation: source references, study limits, uncertainty and information that is missing.",
    kicker: "02 / EVIDENCE",
  },
  {
    title: "People assess the next step",
    detail: "Research questions need scientific assessment. Clinical decisions and formal trial eligibility remain with authorised professionals.",
    kicker: "03 / ACCOUNTABILITY",
  },
] as const;

const TRUST_POINTS = [
  "Relevant information is bounded by purpose and permissions.",
  "Biological context is kept distinct from evidence of an effect.",
  "Candidate hypotheses remain unvalidated until assessed.",
  "Feedback requires review before changing accepted knowledge.",
] as const;

/** Public workflow explainer. Selection updates local educational content only. */
export function HowItWorks() {
  const [persona, setPersona] = useState<PersonaId>("researcher");
  const [step, setStep] = useState(0);
  const journey = JOURNEYS[persona];
  const current = journey.steps[step];
  const perspective = PERSPECTIVES.find((p) => p.id === persona)!;
  const product = ECOSYSTEM_PRODUCTS.find((p) => p.id === perspective.productId)!;

  function selectPersona(id: PersonaId) {
    setPersona(id);
    setStep(0);
  }

  return (
    <div className="hsi-editorial">
      <section className="hsi-hiw-hero" aria-labelledby="how-title">
        <div className="hsi-editorial-wrap">
          <p className="hsi-editorial-kicker">
            <span className="hsi-coral-dot" /> {PRODUCT_NAME} / HOW IT WORKS
          </p>
          <div className="hsi-hiw-hero-grid">
            <h1 id="how-title">
              Start with a question.<br />
              <em>Build a clearer view.</em>
            </h1>
            <div>
              <p className="hsi-editorial-lede">
                Bring the relevant context into focus. Examine the evidence. Keep people in control of interpretation and the next step.
              </p>
              <div className="hsi-editorial-actions">
                <a className="hsi-editorial-button" href="#journey-explorer">
                  Follow a journey <span aria-hidden="true">↗</span>
                </a>
                <Link className="hsi-editorial-textlink" to="/platform">
                  See the foundation ↗
                </Link>
              </div>
            </div>
          </div>
          <div className="hsi-hiw-overview" aria-label="Question to context, evidence and human review">
            <div>
              <span>01</span>
              <strong>Your question</strong>
              <small>Define what matters</small>
            </div>
            <b aria-hidden="true">→</b>
            <div>
              <span>02</span>
              <strong>Relevant context</strong>
              <small>Connect the pieces</small>
            </div>
            <b aria-hidden="true">→</b>
            <div>
              <span>03</span>
              <strong>Traceable evidence</strong>
              <small>Examine the support</small>
            </div>
            <b aria-hidden="true">→</b>
            <div>
              <span>04</span>
              <strong>Human review</strong>
              <small>Assess the next step</small>
            </div>
          </div>
        </div>
      </section>

      <section className="hsi-rebuild-stack hsi-hiw-explorer" id="journey-explorer" aria-labelledby="explorer-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-rebuild-heading">
            <div>
              <p className="hsi-editorial-kicker">01 / THE EXPERIENCE EXPLORER</p>
              <h2 id="explorer-title">
                DIFFERENT PERSPECTIVES.<br />
                <em>A THOUGHTFUL PROCESS.</em>
              </h2>
            </div>
            <p>Choose a perspective, then move through its stages. These are explanations of the workflow, rather than live product sessions.</p>
          </div>

          <div className="hsi-hiw-perspectives" role="radiogroup" aria-label="Choose a perspective">
            {PERSPECTIVES.map((p, i) => (
              <button
                type="button"
                key={p.id}
                role="radio"
                className={"hsi-research-step" + (p.id === persona ? " is-active" : "")}
                aria-checked={p.id === persona}
                aria-controls="journey-content"
                tabIndex={p.id === persona ? 0 : -1}
                onClick={() => selectPersona(p.id)}
                onKeyDown={(event) =>
                  moveRadioFocus(event, i, PERSPECTIVES.length, (next) =>
                    selectPersona(PERSPECTIVES[next]!.id),
                  )
                }
              >
                <span className="hsi-research-step-index">0{i + 1}</span>
                <span className="hsi-research-step-copy">
                  <strong>{p.label}</strong>
                  <small>{ECOSYSTEM_PRODUCTS.find((prod) => prod.id === p.productId)!.name}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>

          <div className="hsi-hiw-experience" id="journey-content">
            <div className="hsi-hiw-journey-head">
              <div className="hsi-hiw-product-line">
                <span>{product.name}</span>
                <span className={`hsi-hiw-status hsi-hiw-status-${product.chip}`}>
                  {MATURITY_CHIP_LABEL[product.chip]}
                </span>
              </div>
              <h3>{journey.title}</h3>
              <p>{journey.intro}</p>
              <div className="hsi-hiw-scope">{perspective.scope}</div>
            </div>

            <div className="hsi-hiw-stages" role="radiogroup" aria-label="Journey stages">
              {STAGES.map((label, i) => (
                <button
                  type="button"
                  key={label}
                  role="radio"
                  className={"hsi-research-step" + (i === step ? " is-active" : "")}
                  aria-current={i === step ? "step" : undefined}
                  aria-checked={i === step}
                  aria-controls="journey-step-detail"
                  tabIndex={i === step ? 0 : -1}
                  onClick={() => setStep(i)}
                  onKeyDown={(event) =>
                    moveRadioFocus(event, i, STAGES.length, setStep)
                  }
                >
                  <span className="hsi-research-step-index">0{i + 1}</span>
                  <span className="hsi-research-step-copy">
                    <strong>{label}</strong>
                    <small>0{i + 1} / 06</small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>

            <div className="hsi-hiw-step" id="journey-step-detail" aria-live="polite" aria-atomic="true">
              <div className="hsi-hiw-step-main">
                <p className="hsi-editorial-kicker">
                  STEP 0{step + 1} / {STAGES[step].toUpperCase()}
                </p>
                <h4>{current.title}</h4>
                <p>{current.description}</p>
              </div>
              <aside className="hsi-hiw-step-output">
                <p className="hsi-editorial-kicker">ILLUSTRATED OUTPUT</p>
                <h4>{current.outputTitle}</h4>
                <p>{current.outputDescription}</p>
                <div className="hsi-hiw-review-note">
                  <span>HUMAN OVERSIGHT</span>
                  <p>{current.oversight}</p>
                </div>
              </aside>
            </div>

            <div className="hsi-hiw-controls">
              <button type="button" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                ← Previous stage
              </button>
              <span>0{step + 1} / 06</span>
              <button type="button" onClick={() => setStep((s) => (s + 1) % STAGES.length)}>
                {step === STAGES.length - 1 ? "Restart journey" : "Next stage →"}
              </button>
            </div>

            <div className="hsi-hiw-experience-foot">
              <p>Illustrative workflow · no live patient data or automatic clinical action. Selecting a stage does not run an investigation.</p>
              <Link className="hsi-rebuild-inline-link" to={perspective.href}>
                {persona === "clinician" ? "Explore the foundation" : "Explore this product"} ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="hsi-rebuild-story" aria-labelledby="boundaries-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-editorial-sectionhead">
            <div>
              <p className="hsi-editorial-kicker">02 / THE BOUNDARIES THAT MATTER</p>
              <h2 id="boundaries-title">
                Connect the thinking.<br />
                <em>Respect the context.</em>
              </h2>
            </div>
            <p>The approach is shared. Product data, permissions and the decisions people make remain distinct.</p>
          </div>
          <div className="hsi-hiw-principles">
            {PRINCIPLES.map((item) => (
              <article key={item.kicker}>
                <span>{item.kicker}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hsi-editorial-connection" aria-labelledby="trust-title">
        <div className="hsi-editorial-wrap hsi-editorial-connection-grid">
          <div>
            <p className="hsi-editorial-kicker">03 / A PROCESS YOU CAN QUESTION</p>
            <h2 id="trust-title">
              Clarity includes<br />
              <em>knowing the limits.</em>
            </h2>
            <p>
              A well-structured investigation should make it easier to see what is known, what is inferred and what still needs work — across {PRODUCT_SHORT} experiences.
            </p>
          </div>
          <ul className="hsi-hiw-trust-list">
            {TRUST_POINTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="hsi-editorial-outro">
        <div className="hsi-editorial-wrap">
          <p className="hsi-editorial-kicker">04 / CHOOSE YOUR NEXT STEP</p>
          <h2>
            Explore the experience.<br />
            <em>Understand the foundation.</em>
          </h2>
          <p>Find your product or learn more about the biology behind the questions.</p>
          <div className="hsi-editorial-actions">
            <Link className="hsi-editorial-button" to="/products">
              Explore the products <span aria-hidden="true">↗</span>
            </Link>
            <Link className="hsi-editorial-textlink" to="/science">
              Discover the science ↗
            </Link>
          </div>
          <small>
            Illustrative journeys only. Scientific research tools do not provide diagnosis, prescribing or confirmed trial eligibility. Clinical and trial capabilities are separately governed and subject to human validation. HSI does not operate a shared evidence database across products.
          </small>
        </div>
      </section>
    </div>
  );
}
