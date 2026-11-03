import { useState } from "react";
import { Link } from "react-router-dom";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL, type EcosystemProduct } from "../../lib/productMaturity";
import "../../styles/how-it-works.css";

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

const STAGES = ["Connect", "Understand", "Investigate", "Verify", "Review", "Refine"] as const;

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
    title: "From a research question to a reviewable brief.",
    intro: "Explore how an ISI investigation can organise permitted evidence, biological context and human assessment. The example explains the approach rather than reporting a scientific result.",
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

const PERSPECTIVES: { id: PersonaId; label: string; productId: EcosystemProduct["id"]; href: string; scope: string }[] = [
  { id: "patient", label: "Personal health", productId: "aksh", href: "/for-aksh", scope: "Illustrative Aksh journey. Available features depend on the product’s stated care scope and authorised data sources." },
  { id: "researcher", label: "Research", productId: "isi", href: "/for-isi", scope: "Illustrative research journey. Evidence availability and permitted collections determine what an investigation can use." },
  { id: "clinician", label: "Care teams", productId: "clinical", href: "/platform", scope: "Intended HSI Clinical journey, in development. This page does not connect to clinical records or provide clinical decision support." },
  { id: "trial", label: "Trial research", productId: "trials", href: "/for-trials", scope: "Intended HSI Trials journey, planned. Live study matching, patient screening and eligibility confirmation are not available here." },
];

function Arrow() {
  return <svg className="hiw-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

/** Public workflow explainer. Selection updates local educational content only. */
export function HowItWorks() {
  const [persona, setPersona] = useState<PersonaId>("researcher");
  const [step, setStep] = useState(0);
  const journey = JOURNEYS[persona];
  const current = journey.steps[step];
  const perspective = PERSPECTIVES.find(p => p.id === persona)!;
  const product = ECOSYSTEM_PRODUCTS.find(p => p.id === perspective.productId)!;

  function selectPersona(id: PersonaId) {
    setPersona(id);
    setStep(0);
  }

  return <div className="hiw-page">
    <section className="hiw-hero" aria-labelledby="how-title"><div className="hiw-wrap"><p className="hiw-eyebrow"><span /> HOW HSI WORKS</p><div className="hiw-hero-grid"><h1 id="how-title">Start with a question.<br /><em>Build a clearer view.</em></h1><div><p className="hiw-lede">Bring the relevant context into focus. Examine the evidence. Keep people in control of interpretation and the next step.</p><div className="hiw-actions"><a className="hiw-button" href="#journey-explorer">Follow a journey <Arrow /></a><Link className="hiw-link" to="/platform">See the foundation <Arrow /></Link></div></div></div><div className="hiw-overview" aria-label="Question to context, evidence and human review"><div><span>01</span><strong>Your question</strong><small>Define what matters</small></div><b aria-hidden="true">→</b><div><span>02</span><strong>Relevant context</strong><small>Connect the pieces</small></div><b aria-hidden="true">→</b><div><span>03</span><strong>Traceable evidence</strong><small>Examine the support</small></div><b aria-hidden="true">→</b><div><span>04</span><strong>Human review</strong><small>Assess the next step</small></div></div></div></section>

    <section className="hiw-section hiw-explorer" id="journey-explorer" aria-labelledby="explorer-title"><div className="hiw-wrap"><div className="hiw-heading"><div><p className="hiw-eyebrow">THE EXPERIENCE EXPLORER</p><h2 id="explorer-title">Different perspectives.<br /><em>A thoughtful process.</em></h2></div><p>Choose a perspective, then move through its stages. These are explanations of the workflow, rather than live product sessions.</p></div>
      <div className="hiw-perspectives" role="group" aria-label="Choose a perspective">{PERSPECTIVES.map(p=><button type="button" key={p.id} aria-pressed={p.id===persona} aria-controls="journey-content" onClick={()=>selectPersona(p.id)}>{p.label}<Arrow /></button>)}</div>
      <div className="hiw-experience" id="journey-content"><div className="hiw-journey-head"><div className="hiw-product-line"><span>{product.name}</span><span className={`hiw-status hiw-status-${product.chip}`}>{MATURITY_CHIP_LABEL[product.chip]}</span></div><h3>{journey.title}</h3><p>{journey.intro}</p><div className="hiw-scope">{perspective.scope}</div></div>
        <div className="hiw-stages" role="group" aria-label="Journey stages">{STAGES.map((label,i)=><button type="button" key={label} aria-current={i===step ? "step" : undefined} aria-pressed={i===step} aria-controls="journey-step-detail" onClick={()=>setStep(i)}><small>0{i+1} / 06</small><strong>{label}</strong><Arrow /></button>)}</div>
        <div className="hiw-step" id="journey-step-detail" aria-live="polite" aria-atomic="true"><div className="hiw-step-main"><p className="hiw-eyebrow">STEP 0{step+1} / {STAGES[step].toUpperCase()}</p><h4>{current.title}</h4><p>{current.description}</p></div><aside className="hiw-step-output"><p className="hiw-eyebrow">ILLUSTRATED OUTPUT</p><h4>{current.outputTitle}</h4><p>{current.outputDescription}</p><div className="hiw-review-note"><span>HUMAN OVERSIGHT</span><p>{current.oversight}</p></div></aside></div>
        <div className="hiw-controls"><button type="button" disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))}>← Previous stage</button><span>0{step+1} / 06</span><button type="button" onClick={()=>setStep(s=>(s+1)%STAGES.length)}>{step===STAGES.length-1 ? "Restart journey" : "Next stage →"}</button></div>
        <div className="hiw-experience-foot"><p>Illustrative workflow · no live patient data or automatic clinical action. Selecting a stage does not run an investigation.</p><Link className="hiw-link" to={perspective.href}>{persona==="clinician" ? "Explore the foundation" : "Explore this product"}<Arrow /></Link></div>
      </div>
    </div></section>

    <section className="hiw-section hiw-boundaries" aria-labelledby="boundaries-title"><div className="hiw-wrap"><div className="hiw-heading"><div><p className="hiw-eyebrow">THE BOUNDARIES THAT MATTER</p><h2 id="boundaries-title">Connect the thinking.<br /><em>Respect the context.</em></h2></div><p>The approach is shared. Product data, permissions and the decisions people make remain distinct.</p></div><div className="hiw-principles"><article><span>01 / OWNERSHIP</span><h3>Data stays with its product</h3><p>Aksh care records and ISI research data remain in their own environments. Shared technology does not create a shared patient database.</p></article><article><span>02 / EVIDENCE</span><h3>Sources stay in view</h3><p>Review requires the context behind an interpretation: source references, study limits, uncertainty and information that is missing.</p></article><article><span>03 / ACCOUNTABILITY</span><h3>People assess the next step</h3><p>Research questions need scientific assessment. Clinical decisions and formal trial eligibility remain with authorised professionals.</p></article></div></div></section>

    <section className="hiw-section hiw-trust"><div className="hiw-wrap hiw-trust-grid"><div><p className="hiw-eyebrow">A PROCESS YOU CAN QUESTION</p><h2>Clarity includes<br /><em>knowing the limits.</em></h2></div><div><p>A well-structured investigation should make it easier to see what is known, what is inferred and what still needs work.</p><ul><li>Relevant information is bounded by purpose and permissions.</li><li>Biological context is kept distinct from evidence of an effect.</li><li>Candidate hypotheses remain unvalidated until assessed.</li><li>Feedback requires review before changing accepted knowledge.</li></ul></div></div></section>

    <section className="hiw-section hiw-closing"><div className="hiw-wrap"><p className="hiw-eyebrow">CHOOSE YOUR NEXT STEP</p><h2>Explore the experience.<br /><em>Understand the foundation.</em></h2><p>Find your product or learn more about the biology behind the questions.</p><div className="hiw-actions"><Link className="hiw-button" to="/products">Explore the products <Arrow /></Link><Link className="hiw-link" to="/science">Discover the science <Arrow /></Link></div></div></section>
  </div>;
}
