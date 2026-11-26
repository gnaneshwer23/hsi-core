import type { AtlasStatus } from "../atlas/atlasData";

/**
 * One invented example record that follows a single question through ten stages. It shows what an investigation record
 * keeps, not a run: there are no counts, no scores and no live output. "Intervention X" and "marker Y" are placeholders.
 */
export type InvStage = {
  id: string;
  title: string;
  answers: string;
  /** Agent name from the site's agent list (for maturity), or a label for a person or the memory engine. */
  by: { label: string; agent?: string; fixed?: "In development" | "Prototype" | "Planned" };
  checkedBy: string;
  fields: [string, string][];
  chain?: { from: string; to: string; status: AtlasStatus }[];
  stays: string;
};

export const QUESTION = "Does intervention X lower inflammatory marker Y, and under what conditions?";

export const INV_STAGES: InvStage[] = [
  {
    id: "question", title: "Define the question", answers: "What exactly are we asking, and what will count as evidence?",
    by: { label: "The researcher" }, checkedBy: "A person confirms the scope before any retrieval.",
    fields: [["Question", QUESTION], ["Scope", "Human studies and animal-model studies"], ["Counts as evidence", "Peer-reviewed reports; preprints are kept apart and flagged"], ["Out of scope", "Unpublished data and patient records"]],
    stays: "The scope is fixed first, so every later stage answers the same question.",
  },
  {
    id: "retrieve", title: "Retrieve authorised evidence", answers: "Which sources were searched, how, and what was left out?",
    by: { label: "Literature Synthesis", agent: "Literature Synthesis" }, checkedBy: "Evidence Verification samples the filtering rule.",
    fields: [["Sources searched", "PubMed through a prototype connector"], ["Other sources", "Not yet connected, so not searched"], ["Search record", "Terms and date are saved with the record"], ["Filtering", "The rule is recorded and each excluded record is listed with its reason"]],
    stays: "An unconnected source is not searched, and an empty result is not evidence that nothing exists.",
  },
  {
    id: "context", title: "Extract biological context", answers: "Under what conditions was each finding observed?",
    by: { label: "Literature Synthesis", agent: "Literature Synthesis" }, checkedBy: "Evidence Verification re-reads the source passage for each value.",
    fields: [["Organism", "For example mouse, rat or human cohort"], ["Model", "For example induced inflammation"], ["Intervention and dose", "As reported, or “not reported”"], ["Timing and sex", "As reported, or “not reported”"], ["Readout", "Marker Y, and how it was measured"]],
    stays: "A value the paper does not report is recorded as not reported. It is never filled in.",
  },
  {
    id: "mechanism", title: "Map relevant mechanisms", answers: "How might the intervention act, and how well is each link supported?",
    by: { label: "Literature Synthesis", agent: "Literature Synthesis" }, checkedBy: "A reviewer checks every link marked hypothesis.",
    fields: [["Proposed route", "Intervention X to a receptor, to a regulatory immune cell, to an anti-inflammatory signal"]],
    chain: [{ from: "Intervention X", to: "Receptor", status: "supported" }, { from: "Receptor", to: "Regulatory T cell", status: "association" }, { from: "Regulatory T cell", to: "Anti-inflammatory signal", status: "hypothesis" }],
    stays: "Each link keeps its own status. A chain is no stronger than its weakest link.",
  },
  {
    id: "compare", title: "Compare conflicting findings", answers: "Do the studies really disagree, or do they differ in context?",
    by: { label: "Contradiction Detection", agent: "Contradiction Detection" }, checkedBy: "Expert review.",
    fields: [["Findings", "Some studies report lowering, others no effect or a rise"], ["Candidate explanations", "Dose, timing, sex and model"], ["Status", "Unresolved, and kept visible"]],
    stays: "Disagreement is a lead to investigate. It is not treated as proof that studies contradict.",
  },
  {
    id: "verify", title: "Verify claims", answers: "Does the source passage actually support each claim?",
    by: { label: "Evidence Verification", agent: "Evidence Verification" }, checkedBy: "A human reviewer on disputed or sampled claims.",
    fields: [["Claim", "“Intervention X lowers marker Y in humans.”"], ["Status", "Not supported"], ["Reason", "The passages report the effect in animal models only"], ["Retractions and corrections", "Checked against the source's current status"]],
    stays: "A claim that fails stays out of the output, and its reason is recorded.",
  },
  {
    id: "gaps", title: "Identify research gaps", answers: "What is missing that would change the answer?",
    by: { label: "Contradiction Detection", agent: "Contradiction Detection" }, checkedBy: "Expert review.",
    fields: [["Gap", "No human study measures marker Y after intervention X"], ["Gap", "Few studies report sex, so sex-specific effects cannot be assessed"], ["Gap", "Dose is often not reported"]],
    stays: "Gaps are findings too. They are listed, not hidden.",
  },
  {
    id: "hypothesis", title: "Propose testable hypotheses", answers: "What explanation could be tested, and what would falsify it?",
    by: { label: "Hypothesis Generation", agent: "Hypothesis Generation" }, checkedBy: "Expert review before any action.",
    fields: [["Hypothesis", "The timing of X relative to the inflammatory insult explains the mixed results"], ["Falsified if", "Studies that vary timing alone show the same effect"], ["Status", "A proposal, not a finding"]],
    stays: "Nothing proposed here is acted on until an expert has reviewed it.",
  },
  {
    id: "experiment", title: "Suggest experiments", answers: "What study would settle the question?",
    by: { label: "Experimental Design", agent: "Experimental Design" }, checkedBy: "Expert review.",
    fields: [["Option", "Same model, dose and sex; give X before or after the insult"], ["Controls", "Vehicle and untreated groups"], ["Readouts", "Marker Y and a second independent marker"], ["Power", "Not computed in this example; the researcher sets it"]],
    stays: "These are drafts for expert consideration. No protocol is issued.",
  },
  {
    id: "memory", title: "Retain the investigation history", answers: "What is kept so the work can be resumed or audited?",
    by: { label: "Scientific memory", fixed: "In development" }, checkedBy: "Owner and reviewer, with access limited to the lab group.",
    fields: [["Kept", "The question, sources searched, decisions and reviewer notes"], ["Visibility", "Your lab group only"], ["Versions", "Each stage is saved as a new version"], ["Status", "Memory is in development and is not enabled for researchers"]],
    stays: "Memory records what was decided and why. It does not make anything a verified finding.",
  },
];
