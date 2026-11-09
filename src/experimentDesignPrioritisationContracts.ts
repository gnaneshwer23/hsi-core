/**
 * Milestone 10 / PR2 — Experiment Design and Prioritisation.
 *
 * Extends M3 hypothesis registry + M10 PR1 experimental lifecycle proposals
 * with structured experiment-design intelligence and transparent prioritisation.
 * Does NOT invent information-gain probabilities, unjustified power/sample-size
 * claims, fabricated results, pipeline execution, lab adapters, workbench UI,
 * Neon migrations, Gate C auto-approve, MoU, PHI/CDS, or AI self-approval.
 *
 * Binding honesty:
 * - Agents propose designs; researchers approve execution via PR1 lifecycle.
 * - Prioritise discriminating experiments (not predicted-positive optimisation).
 * - Include negative controls and null-result interpretation.
 * - Ranking is ordinal / qualitative — never LLM-as-probability.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 * - Depends on PR1 lifecycle contracts (#101) — stack or merge first.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const EXPERIMENT_DESIGN_SCHEMA =
  "hsi-experiment-design-prioritisation-1" as const;
export const EXPERIMENT_DESIGN_METHOD =
  "hsi.experiment_design_prioritisation.v1" as const;
export const EXPERIMENT_DESIGN_VERSION = "0.1.0" as const;

/** Closed experiment categories for design proposals. */
export const EXPERIMENT_CATEGORIES = [
  "public_dataset_reanalysis",
  "single_cell_spatial_omics",
  "proteomic_metabolomic",
  "computational_pathway",
  "in_vitro_mechanistic",
  "ex_vivo",
  "approved_observational_cohort",
  "independent_replication",
  "biomarker_validation",
] as const;
export type ExperimentCategory = (typeof EXPERIMENT_CATEGORIES)[number];

/** Ordinal feasibility — never invent sample-size power claims. */
export const FEASIBILITY_LEVELS = [
  "not_assessed",
  "blocked",
  "low",
  "moderate",
  "high",
] as const;
export type FeasibilityLevel = (typeof FEASIBILITY_LEVELS)[number];

/**
 * Ordinal discrimination strength for transparent ranking.
 * Not a probability and not information-gain.
 */
export const DISCRIMINATION_STRENGTHS = [
  "not_assessed",
  "weak",
  "moderate",
  "strong",
] as const;
export type DiscriminationStrength =
  (typeof DISCRIMINATION_STRENGTHS)[number];

export const DESIGN_PACKAGE_LIFECYCLES = [
  "draft",
  "ready_for_prioritisation",
  "prioritised",
  "superseded",
  "withdrawn",
] as const;
export type DesignPackageLifecycle =
  (typeof DESIGN_PACKAGE_LIFECYCLES)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type DesignActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type DesignDataBasis = (typeof DATA_BASES)[number];

const DESIGN_ID_RE = /^hsi-exp-des-[a-z0-9-]{3,80}$/;
const APPROACH_ID_RE = /^hsi-exp-apr-[a-z0-9-]{3,80}$/;
const PRIORITY_ID_RE = /^hsi-exp-pri-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

const FEASIBILITY_RANK: Record<FeasibilityLevel, number> = {
  high: 4,
  moderate: 3,
  low: 2,
  blocked: 1,
  not_assessed: 0,
};

const DISCRIMINATION_RANK: Record<DiscriminationStrength, number> = {
  strong: 3,
  moderate: 2,
  weak: 1,
  not_assessed: 0,
};

export type ExperimentDesignHonesty = {
  agentsProposeResearchersApprove: true;
  aiCannotSelfApproveExperiments: true;
  noInventedInformationGainProbability: true;
  noInventedPowerSampleSizeClaims: true;
  noOptimiseSolelyForPredictedPositives: true;
  fabricatedResults: false;
  pipelinesExecuted: false;
  labAdaptersWired: false;
  workbenchUiShipped: false;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
  dependsOnPr1LifecycleContracts: true;
};

export type FalsifiablePrediction = {
  id: string;
  statement: string;
  /** What observation would falsify the linked hypothesis claim. */
  falsifier: string;
};

export type CompetingExplanation = {
  id: string;
  statement: string;
  /** Optional link to opposing / gap / comparison record ids. */
  evidenceRefIds: readonly string[];
};

export type DiscriminatingQuestion = {
  id: string;
  question: string;
  /** Competing explanation ids this question is meant to separate. */
  targetsExplanationIds: readonly string[];
};

export type CandidateExperimentalApproach = {
  id: string;
  title: string;
  category: ExperimentCategory;
  /** Experimental model / system proposed (qualitative). */
  experimentalModel: string;
  controls: readonly string[];
  /** Required: at least one negative / null-control entry. */
  negativeControls: readonly string[];
  measurements: readonly string[];
  confounders: readonly string[];
  methodologicalLimitations: readonly string[];
  feasibility: FeasibilityLevel;
  /** Explicit blockers when feasibility is blocked / low. */
  feasibilityNotes: string;
  discriminationStrength: DiscriminationStrength;
  /** Competing explanation ids this approach can distinguish. */
  distinguishesExplanationIds: readonly string[];
  /** Qualitative: what a supportive result would mean. */
  resultsSupportHypothesis: string;
  /** Qualitative: what a challenging result would mean. */
  resultsChallengeHypothesis: string;
  /** Required null / negative-result interpretation. */
  nullResultInterpretation: string;
  remainingUncertainties: readonly string[];
  /** Information required before any execution / approval. */
  infoRequiredBeforeExecution: readonly string[];
  reproducibilityNotes: readonly string[];
  /** Optional bind to M10 PR1 proposal id. */
  linkedProposalId: string | null;
  note: string;
};

export type ExperimentDesignPackage = {
  schema: typeof EXPERIMENT_DESIGN_SCHEMA;
  method: typeof EXPERIMENT_DESIGN_METHOD;
  version: typeof EXPERIMENT_DESIGN_VERSION;
  id: string;
  /** M3 hypothesis registry id. */
  hypothesisId: string;
  hypothesisStatement: string;
  hypothesisFalsifier: string;
  investigationId: string | null;
  lifecycle: DesignPackageLifecycle;
  falsifiablePredictions: readonly FalsifiablePrediction[];
  competingExplanations: readonly CompetingExplanation[];
  discriminatingQuestions: readonly DiscriminatingQuestion[];
  candidateApproaches: readonly CandidateExperimentalApproach[];
  authoredBy: {
    principalId: string;
    actorKind: DesignActorKind;
  };
  dataBasis: DesignDataBasis;
  fixtureHonesty: boolean;
  honesty: ExperimentDesignHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PrioritisationComparisonRow = {
  approachId: string;
  rank: number;
  testsWhat: string;
  distinguishesExplanationIds: readonly string[];
  resultsSupportHypothesis: string;
  resultsChallengeHypothesis: string;
  nullResultInterpretation: string;
  remainingUncertainties: readonly string[];
  infoRequiredBeforeExecution: readonly string[];
  discriminationStrength: DiscriminationStrength;
  feasibility: FeasibilityLevel;
  /** Qualitative rationale — never an invented probability. */
  prioritisationRationale: string;
};

export type ExperimentPrioritisationRecord = {
  schema: typeof EXPERIMENT_DESIGN_SCHEMA;
  method: typeof EXPERIMENT_DESIGN_METHOD;
  version: typeof EXPERIMENT_DESIGN_VERSION;
  id: string;
  designPackageId: string;
  hypothesisId: string;
  rankingMethod: "discrimination_then_feasibility_ordinal";
  comparisons: readonly PrioritisationComparisonRow[];
  rankedApproachIds: readonly string[];
  inventedInformationGainProbability: false;
  inventedPowerSampleSizeClaims: false;
  optimisesSolelyForPredictedPositives: false;
  autoApprovedForExecution: false;
  dataBasis: DesignDataBasis;
  fixtureHonesty: boolean;
  honesty: ExperimentDesignHonesty;
  createdAt: string;
  createdByPrincipalId: string;
  note: string;
};

export type ExperimentDesignStore = {
  upsertDesignPackage(
    pack: ExperimentDesignPackage,
  ): ExperimentDesignPackage;
  getDesignPackage(id: string): ExperimentDesignPackage | null;
  listDesignPackages(
    hypothesisId?: string,
  ): readonly ExperimentDesignPackage[];
  upsertPrioritisation(
    record: ExperimentPrioritisationRecord,
  ): ExperimentPrioritisationRecord;
  getPrioritisation(id: string): ExperimentPrioritisationRecord | null;
  listPrioritisations(
    designPackageId?: string,
  ): readonly ExperimentPrioritisationRecord[];
};

const DEFAULT_HONESTY: ExperimentDesignHonesty = {
  agentsProposeResearchersApprove: true,
  aiCannotSelfApproveExperiments: true,
  noInventedInformationGainProbability: true,
  noInventedPowerSampleSizeClaims: true,
  noOptimiseSolelyForPredictedPositives: true,
  fabricatedResults: false,
  pipelinesExecuted: false,
  labAdaptersWired: false,
  workbenchUiShipped: false,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
  dependsOnPr1LifecycleContracts: true,
};

const PACKAGE_TRANSITIONS: Record<
  DesignPackageLifecycle,
  readonly DesignPackageLifecycle[]
> = {
  draft: ["ready_for_prioritisation", "withdrawn"],
  ready_for_prioritisation: ["prioritised", "superseded", "withdrawn"],
  prioritised: ["superseded", "withdrawn"],
  superseded: [],
  withdrawn: [],
};

function isIsoTimestamp(value: string): boolean {
  return (
    typeof value === "string" &&
    value.length >= 20 &&
    value.length <= 40 &&
    !Number.isNaN(Date.parse(value))
  );
}

function assertClosed<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): asserts value is T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw Error(`Invalid ${label}`);
  }
}

function textOk(value: string, max: number): boolean {
  const t = value.trim();
  return t.length > 0 && t.length <= max;
}

function assertRefList(
  ids: readonly string[],
  label: string,
  max = 50,
): readonly string[] {
  if (ids.length > max) throw Error(`Too many ${label}`);
  const seen = new Set<string>();
  for (const id of ids) {
    if (!REF_ID_RE.test(id)) throw Error(`Invalid ${label} id`);
    if (seen.has(id)) throw Error(`Duplicate ${label} id`);
    seen.add(id);
  }
  return [...ids];
}

function assertStringList(
  values: readonly string[],
  label: string,
  maxItems: number,
  maxLen: number,
): readonly string[] {
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  const out: string[] = [];
  for (const value of values) {
    if (!textOk(value, maxLen)) throw Error(`Invalid ${label} entry`);
    out.push(value.trim());
  }
  return out;
}

function assertHonesty(honesty: ExperimentDesignHonesty): void {
  if (honesty.agentsProposeResearchersApprove !== true) {
    throw Error("Agents propose; researchers approve");
  }
  if (honesty.aiCannotSelfApproveExperiments !== true) {
    throw Error("AI cannot self-approve experiments");
  }
  if (honesty.noInventedInformationGainProbability !== true) {
    throw Error("Invented information-gain probabilities forbidden");
  }
  if (honesty.noInventedPowerSampleSizeClaims !== true) {
    throw Error("Invented power/sample-size claims forbidden");
  }
  if (honesty.noOptimiseSolelyForPredictedPositives !== true) {
    throw Error("Must not optimise solely for predicted positives");
  }
  if (honesty.fabricatedResults !== false) {
    throw Error("Fabricated results forbidden");
  }
  if (honesty.pipelinesExecuted !== false) {
    throw Error("Pipeline execution must not be claimed");
  }
  if (honesty.labAdaptersWired !== false) {
    throw Error("Lab adapters must not be claimed");
  }
  if (honesty.workbenchUiShipped !== false) {
    throw Error("Workbench UI must not be claimed");
  }
  if (honesty.gateCAutoApprove !== false) {
    throw Error("Gate C auto-approve forbidden");
  }
  if (honesty.mouInvented !== false) throw Error("MoU must not be invented");
  if (honesty.phiCdsWired !== false) throw Error("PHI/CDS must stay unwired");
  if (honesty.scientificApproval !== false) {
    throw Error("Scientific approval must stay false");
  }
  if (honesty.graphPromotable !== false) {
    throw Error("Graph promotion forbidden");
  }
  if (honesty.neonProjectPolicy !== "red-wave-only") {
    throw Error("Neon red-wave only");
  }
  if (honesty.migration !== "deferred") {
    throw Error("Migration must stay deferred");
  }
  if (honesty.dependsOnPr1LifecycleContracts !== true) {
    throw Error("PR2 depends on PR1 lifecycle contracts");
  }
}

function assertPrediction(
  prediction: FalsifiablePrediction,
): FalsifiablePrediction {
  if (!REF_ID_RE.test(prediction.id)) throw Error("Invalid prediction id");
  if (!textOk(prediction.statement, 2000)) {
    throw Error("Invalid prediction statement");
  }
  if (!textOk(prediction.falsifier, 2000)) {
    throw Error("Prediction requires falsifier");
  }
  return {
    id: prediction.id,
    statement: prediction.statement.trim(),
    falsifier: prediction.falsifier.trim(),
  };
}

function assertCompetingExplanation(
  explanation: CompetingExplanation,
): CompetingExplanation {
  if (!REF_ID_RE.test(explanation.id)) {
    throw Error("Invalid competing explanation id");
  }
  if (!textOk(explanation.statement, 2000)) {
    throw Error("Invalid competing explanation statement");
  }
  return {
    id: explanation.id,
    statement: explanation.statement.trim(),
    evidenceRefIds: assertRefList(
      explanation.evidenceRefIds,
      "competing explanation evidence ref",
    ),
  };
}

function assertDiscriminatingQuestion(
  question: DiscriminatingQuestion,
  explanationIds: ReadonlySet<string>,
): DiscriminatingQuestion {
  if (!REF_ID_RE.test(question.id)) {
    throw Error("Invalid discriminating question id");
  }
  if (!textOk(question.question, 2000)) {
    throw Error("Invalid discriminating question");
  }
  const targets = assertRefList(
    question.targetsExplanationIds,
    "discriminating question target",
  );
  if (targets.length < 1) {
    throw Error("Discriminating question must target at least one explanation");
  }
  for (const id of targets) {
    if (!explanationIds.has(id)) {
      throw Error("Discriminating question targets unknown explanation");
    }
  }
  return {
    id: question.id,
    question: question.question.trim(),
    targetsExplanationIds: targets,
  };
}

function assertApproach(
  approach: CandidateExperimentalApproach,
  explanationIds: ReadonlySet<string>,
): CandidateExperimentalApproach {
  if (!APPROACH_ID_RE.test(approach.id)) throw Error("Invalid approach id");
  if (!textOk(approach.title, 200)) throw Error("Invalid approach title");
  assertClosed(approach.category, EXPERIMENT_CATEGORIES, "experiment category");
  if (!textOk(approach.experimentalModel, 2000)) {
    throw Error("Invalid experimental model");
  }
  const controls = assertStringList(approach.controls, "controls", 32, 500);
  const negativeControls = assertStringList(
    approach.negativeControls,
    "negative controls",
    16,
    500,
  );
  if (negativeControls.length < 1) {
    throw Error("Approach requires at least one negative control");
  }
  const measurements = assertStringList(
    approach.measurements,
    "measurements",
    32,
    500,
  );
  if (measurements.length < 1) {
    throw Error("Approach requires at least one measurement");
  }
  const confounders = assertStringList(
    approach.confounders,
    "confounders",
    32,
    500,
  );
  const methodologicalLimitations = assertStringList(
    approach.methodologicalLimitations,
    "methodological limitations",
    32,
    1000,
  );
  if (methodologicalLimitations.length < 1) {
    throw Error("Approach requires methodological limitations");
  }
  assertClosed(approach.feasibility, FEASIBILITY_LEVELS, "feasibility");
  if (!textOk(approach.feasibilityNotes, 2000)) {
    throw Error("Invalid feasibility notes");
  }
  assertClosed(
    approach.discriminationStrength,
    DISCRIMINATION_STRENGTHS,
    "discrimination strength",
  );
  const distinguishes = assertRefList(
    approach.distinguishesExplanationIds,
    "distinguished explanation",
  );
  for (const id of distinguishes) {
    if (!explanationIds.has(id)) {
      throw Error("Approach distinguishes unknown explanation");
    }
  }
  if (!textOk(approach.resultsSupportHypothesis, 2000)) {
    throw Error("Invalid resultsSupportHypothesis");
  }
  if (!textOk(approach.resultsChallengeHypothesis, 2000)) {
    throw Error("Invalid resultsChallengeHypothesis");
  }
  if (!textOk(approach.nullResultInterpretation, 2000)) {
    throw Error("Null-result interpretation required");
  }
  const remainingUncertainties = assertStringList(
    approach.remainingUncertainties,
    "remaining uncertainties",
    32,
    1000,
  );
  const infoRequiredBeforeExecution = assertStringList(
    approach.infoRequiredBeforeExecution,
    "info required before execution",
    32,
    1000,
  );
  if (infoRequiredBeforeExecution.length < 1) {
    throw Error("Approach requires infoRequiredBeforeExecution");
  }
  const reproducibilityNotes = assertStringList(
    approach.reproducibilityNotes,
    "reproducibility notes",
    16,
    1000,
  );
  if (
    approach.linkedProposalId !== null &&
    !REF_ID_RE.test(approach.linkedProposalId)
  ) {
    throw Error("Invalid linked proposal id");
  }
  if (approach.note.trim() !== "" && !textOk(approach.note, 2000)) {
    throw Error("Invalid approach note");
  }
  return {
    id: approach.id,
    title: approach.title.trim(),
    category: approach.category,
    experimentalModel: approach.experimentalModel.trim(),
    controls,
    negativeControls,
    measurements,
    confounders,
    methodologicalLimitations,
    feasibility: approach.feasibility,
    feasibilityNotes: approach.feasibilityNotes.trim(),
    discriminationStrength: approach.discriminationStrength,
    distinguishesExplanationIds: distinguishes,
    resultsSupportHypothesis: approach.resultsSupportHypothesis.trim(),
    resultsChallengeHypothesis: approach.resultsChallengeHypothesis.trim(),
    nullResultInterpretation: approach.nullResultInterpretation.trim(),
    remainingUncertainties,
    infoRequiredBeforeExecution,
    reproducibilityNotes,
    linkedProposalId: approach.linkedProposalId,
    note: approach.note.trim(),
  };
}

export function draftExperimentDesignPackage(input: {
  id: string;
  hypothesisId: string;
  hypothesisStatement: string;
  hypothesisFalsifier: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: DesignActorKind;
  createdAt: string;
  investigationId?: string | null;
  falsifiablePredictions: readonly FalsifiablePrediction[];
  competingExplanations: readonly CompetingExplanation[];
  discriminatingQuestions: readonly DiscriminatingQuestion[];
  candidateApproaches: readonly CandidateExperimentalApproach[];
  dataBasis?: DesignDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): ExperimentDesignPackage {
  if (!DESIGN_ID_RE.test(input.id)) throw Error("Invalid design package id");
  if (!REF_ID_RE.test(input.hypothesisId)) throw Error("Invalid hypothesis id");
  if (!textOk(input.hypothesisStatement, 4000)) {
    throw Error("Invalid hypothesis statement");
  }
  if (!textOk(input.hypothesisFalsifier, 2000)) {
    throw Error("Hypothesis falsifier required");
  }
  if (!PRINCIPAL_RE.test(input.authoredByPrincipalId)) {
    throw Error("Invalid author principal");
  }
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  assertClosed(actorKind, ACTOR_KINDS, "actor kind");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (
    input.investigationId != null &&
    !REF_ID_RE.test(input.investigationId)
  ) {
    throw Error("Invalid investigation id");
  }

  if (input.falsifiablePredictions.length < 1) {
    throw Error("At least one falsifiable prediction required");
  }
  if (input.falsifiablePredictions.length > 32) {
    throw Error("Too many falsifiable predictions");
  }
  if (input.competingExplanations.length < 1) {
    throw Error("At least one competing explanation required");
  }
  if (input.competingExplanations.length > 32) {
    throw Error("Too many competing explanations");
  }
  if (input.discriminatingQuestions.length < 1) {
    throw Error("At least one discriminating question required");
  }
  if (input.candidateApproaches.length < 1) {
    throw Error("At least one candidate approach required");
  }
  if (input.candidateApproaches.length > 32) {
    throw Error("Too many candidate approaches");
  }

  const predictions = input.falsifiablePredictions.map(assertPrediction);
  const explanations = input.competingExplanations.map(
    assertCompetingExplanation,
  );
  const explanationIds = new Set(explanations.map((e) => e.id));
  if (explanationIds.size !== explanations.length) {
    throw Error("Duplicate competing explanation id");
  }
  const questions = input.discriminatingQuestions.map((q) =>
    assertDiscriminatingQuestion(q, explanationIds),
  );
  const approaches = input.candidateApproaches.map((a) =>
    assertApproach(a, explanationIds),
  );
  const approachIds = new Set(approaches.map((a) => a.id));
  if (approachIds.size !== approaches.length) {
    throw Error("Duplicate approach id");
  }

  const dataBasis = input.dataBasis ?? "fixture_engineering";
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && fixtureHonesty !== true) {
    throw Error("fixture_engineering requires fixtureHonesty=true");
  }
  if (dataBasis !== "fixture_engineering" && fixtureHonesty !== false) {
    throw Error("Non-fixture dataBasis requires fixtureHonesty=false");
  }

  const pack: ExperimentDesignPackage = {
    schema: EXPERIMENT_DESIGN_SCHEMA,
    method: EXPERIMENT_DESIGN_METHOD,
    version: EXPERIMENT_DESIGN_VERSION,
    id: input.id,
    hypothesisId: input.hypothesisId,
    hypothesisStatement: input.hypothesisStatement.trim(),
    hypothesisFalsifier: input.hypothesisFalsifier.trim(),
    investigationId: input.investigationId ?? null,
    lifecycle: "draft",
    falsifiablePredictions: predictions,
    competingExplanations: explanations,
    discriminatingQuestions: questions,
    candidateApproaches: approaches,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind,
    },
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateExperimentDesignPackage(pack);
}

export function validateExperimentDesignPackage(
  pack: ExperimentDesignPackage,
): ExperimentDesignPackage {
  if (pack.schema !== EXPERIMENT_DESIGN_SCHEMA) throw Error("Invalid schema");
  if (pack.method !== EXPERIMENT_DESIGN_METHOD) throw Error("Invalid method");
  if (pack.version !== EXPERIMENT_DESIGN_VERSION) throw Error("Invalid version");
  if (!DESIGN_ID_RE.test(pack.id)) throw Error("Invalid design package id");
  if (!REF_ID_RE.test(pack.hypothesisId)) throw Error("Invalid hypothesis id");
  if (!textOk(pack.hypothesisStatement, 4000)) {
    throw Error("Invalid hypothesis statement");
  }
  if (!textOk(pack.hypothesisFalsifier, 2000)) {
    throw Error("Hypothesis falsifier required");
  }
  assertClosed(pack.lifecycle, DESIGN_PACKAGE_LIFECYCLES, "lifecycle");
  assertClosed(pack.dataBasis, DATA_BASES, "data basis");
  assertHonesty(pack.honesty);
  if (!isIsoTimestamp(pack.createdAt) || !isIsoTimestamp(pack.updatedAt)) {
    throw Error("Invalid timestamps");
  }
  if (!PRINCIPAL_RE.test(pack.authoredBy.principalId)) {
    throw Error("Invalid author principal");
  }
  assertClosed(pack.authoredBy.actorKind, ACTOR_KINDS, "actor kind");
  if (
    pack.investigationId !== null &&
    !REF_ID_RE.test(pack.investigationId)
  ) {
    throw Error("Invalid investigation id");
  }
  if (pack.dataBasis === "fixture_engineering" && pack.fixtureHonesty !== true) {
    throw Error("fixture_engineering requires fixtureHonesty=true");
  }
  if (
    pack.dataBasis !== "fixture_engineering" &&
    pack.fixtureHonesty !== false
  ) {
    throw Error("Non-fixture dataBasis requires fixtureHonesty=false");
  }

  if (pack.falsifiablePredictions.length < 1) {
    throw Error("At least one falsifiable prediction required");
  }
  if (pack.competingExplanations.length < 1) {
    throw Error("At least one competing explanation required");
  }
  if (pack.discriminatingQuestions.length < 1) {
    throw Error("At least one discriminating question required");
  }
  if (pack.candidateApproaches.length < 1) {
    throw Error("At least one candidate approach required");
  }

  const predictions = pack.falsifiablePredictions.map(assertPrediction);
  const explanations = pack.competingExplanations.map(
    assertCompetingExplanation,
  );
  const explanationIds = new Set(explanations.map((e) => e.id));
  if (explanationIds.size !== explanations.length) {
    throw Error("Duplicate competing explanation id");
  }
  const questions = pack.discriminatingQuestions.map((q) =>
    assertDiscriminatingQuestion(q, explanationIds),
  );
  const approaches = pack.candidateApproaches.map((a) =>
    assertApproach(a, explanationIds),
  );
  const approachIds = new Set(approaches.map((a) => a.id));
  if (approachIds.size !== approaches.length) {
    throw Error("Duplicate approach id");
  }

  return {
    ...pack,
    hypothesisStatement: pack.hypothesisStatement.trim(),
    hypothesisFalsifier: pack.hypothesisFalsifier.trim(),
    falsifiablePredictions: predictions,
    competingExplanations: explanations,
    discriminatingQuestions: questions,
    candidateApproaches: approaches,
    note: pack.note.trim(),
    honesty: {...DEFAULT_HONESTY},
  };
}

export function transitionExperimentDesignPackage(input: {
  pack: ExperimentDesignPackage;
  to: DesignPackageLifecycle;
  updatedAt: string;
  actor: {principalId: string; actorKind: DesignActorKind};
}): ExperimentDesignPackage {
  const pack = validateExperimentDesignPackage(input.pack);
  assertClosed(input.to, DESIGN_PACKAGE_LIFECYCLES, "lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  if (!PRINCIPAL_RE.test(input.actor.principalId)) {
    throw Error("Invalid actor principal");
  }
  assertClosed(input.actor.actorKind, ACTOR_KINDS, "actor kind");

  const allowed = PACKAGE_TRANSITIONS[pack.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal design package transition ${pack.lifecycle} → ${input.to}`,
    );
  }

  // Prioritised state may be set by human or agent after comparison, but
  // never implies execution approval (PR1 researcher gate remains).
  return validateExperimentDesignPackage({
    ...pack,
    lifecycle: input.to,
    updatedAt: input.updatedAt,
  });
}

function compareApproachesForPrioritisation(
  a: CandidateExperimentalApproach,
  b: CandidateExperimentalApproach,
): number {
  const disc =
    DISCRIMINATION_RANK[b.discriminationStrength] -
    DISCRIMINATION_RANK[a.discriminationStrength];
  if (disc !== 0) return disc;

  const explain =
    b.distinguishesExplanationIds.length -
    a.distinguishesExplanationIds.length;
  if (explain !== 0) return explain;

  const feas =
    FEASIBILITY_RANK[b.feasibility] - FEASIBILITY_RANK[a.feasibility];
  if (feas !== 0) return feas;

  // Stable tie-break: prefer approaches that declare more remaining
  // uncertainties / pre-execution info (transparency), then id.
  const uncertainty =
    b.remainingUncertainties.length - a.remainingUncertainties.length;
  if (uncertainty !== 0) return uncertainty;
  return a.id.localeCompare(b.id);
}

export function buildExperimentPrioritisation(input: {
  id: string;
  designPackage: ExperimentDesignPackage;
  createdAt: string;
  createdByPrincipalId: string;
  note?: string;
}): ExperimentPrioritisationRecord {
  if (!PRIORITY_ID_RE.test(input.id)) {
    throw Error("Invalid prioritisation id");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (!PRINCIPAL_RE.test(input.createdByPrincipalId)) {
    throw Error("Invalid creator principal");
  }

  const pack = validateExperimentDesignPackage(input.designPackage);
  if (
    pack.lifecycle !== "ready_for_prioritisation" &&
    pack.lifecycle !== "prioritised"
  ) {
    throw Error(
      "Design package must be ready_for_prioritisation or prioritised",
    );
  }

  const sorted = [...pack.candidateApproaches].sort(
    compareApproachesForPrioritisation,
  );

  const comparisons: PrioritisationComparisonRow[] = sorted.map(
    (approach, index) => ({
      approachId: approach.id,
      rank: index + 1,
      testsWhat: `${approach.title} (${approach.category}) via ${approach.experimentalModel}`,
      distinguishesExplanationIds: approach.distinguishesExplanationIds,
      resultsSupportHypothesis: approach.resultsSupportHypothesis,
      resultsChallengeHypothesis: approach.resultsChallengeHypothesis,
      nullResultInterpretation: approach.nullResultInterpretation,
      remainingUncertainties: approach.remainingUncertainties,
      infoRequiredBeforeExecution: approach.infoRequiredBeforeExecution,
      discriminationStrength: approach.discriminationStrength,
      feasibility: approach.feasibility,
      prioritisationRationale: [
        `Ordinal rank ${index + 1} by discrimination_then_feasibility_ordinal.`,
        `Discrimination=${approach.discriminationStrength}; feasibility=${approach.feasibility}.`,
        `Distinguishes ${approach.distinguishesExplanationIds.length} competing explanation(s).`,
        "No information-gain probability or power/sample-size claim invented.",
        "Does not approve execution — PR1 researcher approval required.",
      ].join(" "),
    }),
  );

  const record: ExperimentPrioritisationRecord = {
    schema: EXPERIMENT_DESIGN_SCHEMA,
    method: EXPERIMENT_DESIGN_METHOD,
    version: EXPERIMENT_DESIGN_VERSION,
    id: input.id,
    designPackageId: pack.id,
    hypothesisId: pack.hypothesisId,
    rankingMethod: "discrimination_then_feasibility_ordinal",
    comparisons,
    rankedApproachIds: comparisons.map((c) => c.approachId),
    inventedInformationGainProbability: false,
    inventedPowerSampleSizeClaims: false,
    optimisesSolelyForPredictedPositives: false,
    autoApprovedForExecution: false,
    dataBasis: pack.dataBasis,
    fixtureHonesty: pack.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    createdByPrincipalId: input.createdByPrincipalId,
    note: (input.note ?? "").trim(),
  };
  return validateExperimentPrioritisation(record);
}

export function validateExperimentPrioritisation(
  record: ExperimentPrioritisationRecord,
): ExperimentPrioritisationRecord {
  if (record.schema !== EXPERIMENT_DESIGN_SCHEMA) {
    throw Error("Invalid schema");
  }
  if (record.method !== EXPERIMENT_DESIGN_METHOD) {
    throw Error("Invalid method");
  }
  if (record.version !== EXPERIMENT_DESIGN_VERSION) {
    throw Error("Invalid version");
  }
  if (!PRIORITY_ID_RE.test(record.id)) {
    throw Error("Invalid prioritisation id");
  }
  if (!DESIGN_ID_RE.test(record.designPackageId)) {
    throw Error("Invalid design package id");
  }
  if (!REF_ID_RE.test(record.hypothesisId)) {
    throw Error("Invalid hypothesis id");
  }
  if (record.rankingMethod !== "discrimination_then_feasibility_ordinal") {
    throw Error("Unsupported ranking method");
  }
  if (record.inventedInformationGainProbability !== false) {
    throw Error("Invented information-gain probability forbidden");
  }
  if (record.inventedPowerSampleSizeClaims !== false) {
    throw Error("Invented power/sample-size claims forbidden");
  }
  if (record.optimisesSolelyForPredictedPositives !== false) {
    throw Error("Must not optimise solely for predicted positives");
  }
  if (record.autoApprovedForExecution !== false) {
    throw Error("Prioritisation must not auto-approve execution");
  }
  assertClosed(record.dataBasis, DATA_BASES, "data basis");
  assertHonesty(record.honesty);
  if (!isIsoTimestamp(record.createdAt)) throw Error("Invalid createdAt");
  if (!PRINCIPAL_RE.test(record.createdByPrincipalId)) {
    throw Error("Invalid creator principal");
  }
  if (record.comparisons.length < 1) {
    throw Error("Prioritisation requires comparisons");
  }
  if (record.comparisons.length !== record.rankedApproachIds.length) {
    throw Error("Ranked approach ids must match comparisons");
  }

  const seen = new Set<string>();
  for (let i = 0; i < record.comparisons.length; i++) {
    const row = record.comparisons[i]!;
    if (!APPROACH_ID_RE.test(row.approachId)) {
      throw Error("Invalid comparison approach id");
    }
    if (seen.has(row.approachId)) {
      throw Error("Duplicate comparison approach id");
    }
    seen.add(row.approachId);
    if (row.rank !== i + 1) throw Error("Comparison ranks must be contiguous");
    if (record.rankedApproachIds[i] !== row.approachId) {
      throw Error("rankedApproachIds order must match comparisons");
    }
    assertClosed(
      row.discriminationStrength,
      DISCRIMINATION_STRENGTHS,
      "discrimination strength",
    );
    assertClosed(row.feasibility, FEASIBILITY_LEVELS, "feasibility");
    if (!textOk(row.testsWhat, 2000)) throw Error("Invalid testsWhat");
    if (!textOk(row.resultsSupportHypothesis, 2000)) {
      throw Error("Invalid resultsSupportHypothesis");
    }
    if (!textOk(row.resultsChallengeHypothesis, 2000)) {
      throw Error("Invalid resultsChallengeHypothesis");
    }
    if (!textOk(row.nullResultInterpretation, 2000)) {
      throw Error("Null-result interpretation required");
    }
    if (!textOk(row.prioritisationRationale, 4000)) {
      throw Error("Invalid prioritisation rationale");
    }
    // Refuse rationale that sneaks in invented numeric probabilities / power /
    // sample-size claims. Honesty denials ("no … probability invented") are OK.
    const rationaleLower = row.prioritisationRationale.toLowerCase();
    if (
      /\bp\s*[<>=]\s*0\.\d+/.test(rationaleLower) ||
      /information[- ]gain\s*(probability\s*)?(p\s*=\s*0\.\d+|=\s*0\.\d+)/.test(
        rationaleLower,
      ) ||
      /\bpower\s*=\s*0\.\d+/.test(rationaleLower) ||
      /\bsample\s*size\s*=\s*\d+/.test(rationaleLower) ||
      /\bn\s*=\s*\d{2,}\b/.test(rationaleLower)
    ) {
      throw Error(
        "Prioritisation rationale must not invent probabilities, power, or sample sizes",
      );
    }
    assertRefList(row.distinguishesExplanationIds, "distinguished explanation");
    assertStringList(
      row.remainingUncertainties,
      "remaining uncertainties",
      32,
      1000,
    );
    assertStringList(
      row.infoRequiredBeforeExecution,
      "info required before execution",
      32,
      1000,
    );
  }

  return {
    ...record,
    note: record.note.trim(),
    honesty: {...DEFAULT_HONESTY},
    inventedInformationGainProbability: false,
    inventedPowerSampleSizeClaims: false,
    optimisesSolelyForPredictedPositives: false,
    autoApprovedForExecution: false,
  };
}

export function createMemoryExperimentDesignStore(): ExperimentDesignStore & {
  packages: Map<string, ExperimentDesignPackage>;
  prioritisations: Map<string, ExperimentPrioritisationRecord>;
} {
  const packages = new Map<string, ExperimentDesignPackage>();
  const prioritisations = new Map<string, ExperimentPrioritisationRecord>();

  return {
    packages,
    prioritisations,
    upsertDesignPackage(pack) {
      const validated = validateExperimentDesignPackage(pack);
      packages.set(validated.id, validated);
      return validated;
    },
    getDesignPackage(id) {
      return packages.get(id) ?? null;
    },
    listDesignPackages(hypothesisId) {
      const all = [...packages.values()];
      return hypothesisId
        ? all.filter((p) => p.hypothesisId === hypothesisId)
        : all;
    },
    upsertPrioritisation(record) {
      const validated = validateExperimentPrioritisation(record);
      prioritisations.set(validated.id, validated);
      return validated;
    },
    getPrioritisation(id) {
      return prioritisations.get(id) ?? null;
    },
    listPrioritisations(designPackageId) {
      const all = [...prioritisations.values()];
      return designPackageId
        ? all.filter((p) => p.designPackageId === designPackageId)
        : all;
    },
  };
}

export function projectExperimentDesignPersistenceLines(input: {
  designPackage: ExperimentDesignPackage;
  prioritisation?: ExperimentPrioritisationRecord | null;
}): string[] {
  const pack = validateExperimentDesignPackage(input.designPackage);
  const lines = [
    `schema=${pack.schema}`,
    `method=${pack.method}`,
    `version=${pack.version}`,
    `designPackageId=${pack.id}`,
    `hypothesisId=${pack.hypothesisId}`,
    `lifecycle=${pack.lifecycle}`,
    `predictions=${pack.falsifiablePredictions.length}`,
    `competingExplanations=${pack.competingExplanations.length}`,
    `discriminatingQuestions=${pack.discriminatingQuestions.length}`,
    `approaches=${pack.candidateApproaches.length}`,
    `infoGainProbability=false`,
    `powerSampleSizeClaims=false`,
    `autoApproveExecution=false`,
    `fabricatedResults=false`,
    `pipelinesExecuted=false`,
    `labAdapters=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
    `dependsOnPr1=true`,
  ];
  if (input.prioritisation) {
    const pri = validateExperimentPrioritisation(input.prioritisation);
    lines.push(
      `prioritisationId=${pri.id}`,
      `rankingMethod=${pri.rankingMethod}`,
      `rankedApproaches=${pri.rankedApproachIds.length}`,
      `topApproachId=${pri.rankedApproachIds[0] ?? "none"}`,
    );
  }
  return lines;
}

export function fingerprintExperimentDesignPackage(
  pack: ExperimentDesignPackage,
): string {
  const validated = validateExperimentDesignPackage(pack);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildExperimentDesignPack(input: {
  designPackages: readonly ExperimentDesignPackage[];
  prioritisations: readonly ExperimentPrioritisationRecord[];
  asOf: string;
}): {
  schema: typeof EXPERIMENT_DESIGN_SCHEMA;
  method: typeof EXPERIMENT_DESIGN_METHOD;
  version: typeof EXPERIMENT_DESIGN_VERSION;
  asOf: string;
  designPackageCount: number;
  prioritisationCount: number;
  honesty: ExperimentDesignHonesty;
  designPackages: readonly ExperimentDesignPackage[];
  prioritisations: readonly ExperimentPrioritisationRecord[];
  dependency: {
    requiresPr1LifecycleContracts: true;
    pr1Status: "must_merge_or_stack_first";
  };
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const designPackages = input.designPackages.map(
    validateExperimentDesignPackage,
  );
  const prioritisations = input.prioritisations.map(
    validateExperimentPrioritisation,
  );
  return {
    schema: EXPERIMENT_DESIGN_SCHEMA,
    method: EXPERIMENT_DESIGN_METHOD,
    version: EXPERIMENT_DESIGN_VERSION,
    asOf: input.asOf,
    designPackageCount: designPackages.length,
    prioritisationCount: prioritisations.length,
    honesty: {...DEFAULT_HONESTY},
    designPackages,
    prioritisations,
    dependency: {
      requiresPr1LifecycleContracts: true,
      pr1Status: "must_merge_or_stack_first",
    },
  };
}
