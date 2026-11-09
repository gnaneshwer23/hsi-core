/**
 * Milestone 17 / PR5 — Research Gap and Hypothesis Portfolio.
 *
 * Programme-scoped research-gap investigation envelopes and a hypothesis
 * portfolio that extend PR2 evidence-gap records, M3 hypothesis registry ids,
 * and PR4 knowledge-evolution honesty — without inventing importance scores,
 * confirming hypotheses from discussion volume, auto-approving state changes,
 * fabricating discoveries, shipping workbench UI, wiring PHI/CDS, inventing
 * Gate C auto-approve / MoU, introducing Neon migrations, or claiming
 * experiment-portfolio integration (PR6).
 *
 * Binding honesty:
 * - Agents investigate / propose; researchers approve; independent reviewers verify.
 * - Agents must not approve their own findings or self-transition portfolio states.
 * - Gap prioritisation (if used) must expose criteria and assumptions — no bare scores.
 * - Hypothesis state changes require evidence + review; discussion volume alone is refused.
 * - Rejected / superseded hypotheses are retained.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 * - Depends on PR1–PR4 and M3 hypothesis registry composition by id.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA =
  "hsi-research-gap-hypothesis-portfolio-1" as const;
export const RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD =
  "hsi.research_gap_hypothesis_portfolio.v1" as const;
export const RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION = "0.1.0" as const;

/** Closed research-gap categories for programme intelligence. */
export const RESEARCH_GAP_CATEGORIES = [
  "missing_mechanistic_evidence",
  "contradictory_findings",
  "missing_human_validation",
  "incomplete_biomarker_validation",
  "uncertain_therapeutic_target_evidence",
  "missing_experimental_replication",
  "limited_disease_context_coverage",
  "insufficient_longitudinal_outcomes",
  "model_validation_gaps",
  "cross_disease_evidence_gaps",
] as const;
export type ResearchGapCategory = (typeof RESEARCH_GAP_CATEGORIES)[number];

export const RESEARCH_GAP_REVIEW_STATES = [
  "draft",
  "under_review",
  "accepted_human",
  "rejected_retained",
  "superseded_retained",
  "cancelled",
] as const;
export type ResearchGapReviewState =
  (typeof RESEARCH_GAP_REVIEW_STATES)[number];

/** Closed hypothesis portfolio states — distinct from M3 registry lifecycle. */
export const HYPOTHESIS_PORTFOLIO_STATES = [
  "proposed",
  "under_investigation",
  "evidence_supported",
  "challenged",
  "experimentally_tested",
  "inconclusive",
  "rejected",
  "superseded",
] as const;
export type HypothesisPortfolioState =
  (typeof HYPOTHESIS_PORTFOLIO_STATES)[number];

export const HYPOTHESIS_VALIDATION_STATUSES = [
  "not_started",
  "awaiting_evidence_review",
  "partially_supported",
  "challenged_pending_resolution",
  "experiment_linked_awaiting_observation",
  "inconclusive_after_review",
  "rejected_after_review",
  "superseded_after_review",
  "not_experimentally_validated",
] as const;
export type HypothesisValidationStatus =
  (typeof HYPOTHESIS_VALIDATION_STATUSES)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type PortfolioActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type PortfolioDataBasis = (typeof DATA_BASES)[number];

export const EVIDENCE_POLARITIES = [
  "supporting",
  "opposing",
  "ambiguous",
  "context_only",
] as const;
export type EvidencePolarity = (typeof EVIDENCE_POLARITIES)[number];

const PORTFOLIO_ID_RE = /^hsi-sp-rghp-[a-z0-9-]{3,80}$/;
const GAP_ID_RE = /^hsi-sp-gap-[a-z0-9-]{3,80}$/;
const HYP_ID_RE = /^hsi-sp-hpf-[a-z0-9-]{3,80}$/;
const PRED_ID_RE = /^hsi-sp-hpred-[a-z0-9-]{3,80}$/;
const COMP_ID_RE = /^hsi-sp-hcomp-[a-z0-9-]{3,80}$/;
const REASSESS_ID_RE = /^hsi-sp-hra-[a-z0-9-]{3,80}$/;
const PRIORITY_ID_RE = /^hsi-sp-gpc-[a-z0-9-]{3,80}$/;
const PROGRAMME_ID_RE = /^hsi-sp-prog-[a-z0-9-]{3,80}$/;
const OBJECTIVE_ID_RE = /^hsi-sp-obj-[a-z0-9-]{3,80}$/;
const PLAN_GAP_ID_RE = /^hsi-sp-egap-[a-z0-9-]{3,80}$|^[a-zA-Z0-9_.:@/-]{3,160}$/;
const EVIDENCE_ID_RE = /^hsi-sp-evid-[a-z0-9-]{3,80}$|^[a-zA-Z0-9_.:@/-]{3,160}$/;
const EXPERIMENT_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const M3_HYP_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type ResearchGapHypothesisPortfolioHonesty = {
  dependsOnPr1ScientificProgrammeContracts: true;
  dependsOnPr2ResearchObjectivePlanning: true;
  dependsOnPr3ContinuousEvidenceInvestigation: true;
  dependsOnPr4ScientificKnowledgeEvolution: true;
  extendsM3HypothesisRegistryById: true;
  extendsGapInvestigation: true;
  noArbitraryImportanceScores: true;
  prioritisationExposesCriteriaAndAssumptions: true;
  hypothesisStateRequiresEvidenceAndReview: true;
  discussionVolumeAloneDoesNotConfirm: true;
  retainRejectedAndSupersededHypotheses: true;
  notSeparateAgentPlatform: true;
  agentsInvestigateResearchersApprove: true;
  independentReviewerNotAuthoringAgent: true;
  agentsCannotSelfApprove: true;
  noAutoApprovalOfPlansOrClaims: true;
  noFabricatedDiscoveries: true;
  noWorkbenchUi: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
  researchGapHypothesisPortfolio: true;
  /** Experiment portfolio integration deferred to PR6. */
  experimentPortfolioIntegration: false;
};

export type PortfolioActor = {
  principalId: string;
  actorKind: PortfolioActorKind;
};

export type GapPrioritisationCriteria = {
  id: string;
  /** Explicit: no bare numeric importance without criteria. */
  noArbitraryImportanceScore: true;
  criteriaSummary: string;
  assumptions: readonly string[];
  ordinalRank: number | null;
  note: string;
};

export type ResearchGapRecord = {
  schema: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA;
  method: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD;
  version: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION;
  id: string;
  portfolioId: string;
  programmeId: string;
  category: ResearchGapCategory;
  scientificQuestion: string;
  evidenceSupportingTheGap: readonly string[];
  whyItMatters: string;
  alternativeExplanations: readonly string[];
  availableInvestigationMethods: readonly string[];
  expectedDecisionRelevance: string;
  dataRequirements: string;
  uncertainty: string;
  reviewState: ResearchGapReviewState;
  /** Optional link to PR2 plan evidence-gap ids. */
  linkedPlanEvidenceGapIds: readonly string[];
  /** Optional PR3 evidence item / ledger refs supporting the gap claim. */
  supportingEvidenceRefs: readonly string[];
  prioritisation: GapPrioritisationCriteria | null;
  authoredBy: PortfolioActor;
  reviewedBy: PortfolioActor | null;
  dataBasis: PortfolioDataBasis;
  fixtureHonesty: boolean;
  honesty: ResearchGapHypothesisPortfolioHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CompetingExplanation = {
  id: string;
  summary: string;
  relationToPrimary: "competing" | "complementary" | "narrower" | "broader";
  note: string;
};

export type PortfolioEvidenceLink = {
  evidenceRef: string;
  polarity: EvidencePolarity;
  note: string;
};

export type FalsifiablePrediction = {
  id: string;
  prediction: string;
  falsifier: string;
  linkedExperimentIds: readonly string[];
  note: string;
};

export type HypothesisPortfolioEntry = {
  schema: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA;
  method: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD;
  version: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION;
  id: string;
  portfolioId: string;
  programmeId: string;
  statement: string;
  /** Links to PR2 scientific objective ids. */
  linkedObjectiveIds: readonly string[];
  /** Optional composition with M3 hypothesis registry ids. */
  linkedM3HypothesisIds: readonly string[];
  /** Optional gaps this hypothesis addresses. */
  addressesGapIds: readonly string[];
  competingExplanations: readonly CompetingExplanation[];
  evidenceLinks: readonly PortfolioEvidenceLink[];
  falsifiablePredictions: readonly FalsifiablePrediction[];
  linkedExperimentIds: readonly string[];
  state: HypothesisPortfolioState;
  validationStatus: HypothesisValidationStatus;
  /** Explicit: discussion volume alone never confirms. */
  discussionVolumeAloneDoesNotConfirm: true;
  retainedAfterRejectOrSupersede: boolean;
  supersededByHypothesisId: string | null;
  authoredBy: PortfolioActor;
  reviewedBy: PortfolioActor | null;
  dataBasis: PortfolioDataBasis;
  fixtureHonesty: boolean;
  honesty: ResearchGapHypothesisPortfolioHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type HypothesisReassessmentRecord = {
  schema: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA;
  method: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD;
  version: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION;
  id: string;
  portfolioId: string;
  programmeId: string;
  hypothesisId: string;
  priorState: HypothesisPortfolioState;
  nextState: HypothesisPortfolioState;
  newEvidenceRefs: readonly string[];
  rationale: string;
  /** Evidence + review required; discussion volume refused. */
  evidenceAndReviewRequired: true;
  discussionVolumeAloneRefused: true;
  authoredBy: PortfolioActor;
  reviewedBy: PortfolioActor;
  dataBasis: PortfolioDataBasis;
  fixtureHonesty: boolean;
  honesty: ResearchGapHypothesisPortfolioHonesty;
  createdAt: string;
  note: string;
};

export type ResearchGapHypothesisPortfolio = {
  schema: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA;
  method: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD;
  version: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION;
  id: string;
  programmeId: string;
  label: string;
  linkedObjectiveIds: readonly string[];
  authoredBy: PortfolioActor;
  dataBasis: PortfolioDataBasis;
  fixtureHonesty: boolean;
  honesty: ResearchGapHypothesisPortfolioHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ResearchGapHypothesisPortfolioStore = {
  upsertPortfolio(
    portfolio: ResearchGapHypothesisPortfolio,
  ): ResearchGapHypothesisPortfolio;
  getPortfolio(id: string): ResearchGapHypothesisPortfolio | null;
  listPortfolios(programmeId?: string): readonly ResearchGapHypothesisPortfolio[];
  upsertGap(gap: ResearchGapRecord): ResearchGapRecord;
  getGap(id: string): ResearchGapRecord | null;
  listGaps(portfolioId?: string): readonly ResearchGapRecord[];
  upsertHypothesis(entry: HypothesisPortfolioEntry): HypothesisPortfolioEntry;
  getHypothesis(id: string): HypothesisPortfolioEntry | null;
  listHypotheses(portfolioId?: string): readonly HypothesisPortfolioEntry[];
  upsertReassessment(
    record: HypothesisReassessmentRecord,
  ): HypothesisReassessmentRecord;
  listReassessments(hypothesisId?: string): readonly HypothesisReassessmentRecord[];
};

const DEFAULT_HONESTY: ResearchGapHypothesisPortfolioHonesty = {
  dependsOnPr1ScientificProgrammeContracts: true,
  dependsOnPr2ResearchObjectivePlanning: true,
  dependsOnPr3ContinuousEvidenceInvestigation: true,
  dependsOnPr4ScientificKnowledgeEvolution: true,
  extendsM3HypothesisRegistryById: true,
  extendsGapInvestigation: true,
  noArbitraryImportanceScores: true,
  prioritisationExposesCriteriaAndAssumptions: true,
  hypothesisStateRequiresEvidenceAndReview: true,
  discussionVolumeAloneDoesNotConfirm: true,
  retainRejectedAndSupersededHypotheses: true,
  notSeparateAgentPlatform: true,
  agentsInvestigateResearchersApprove: true,
  independentReviewerNotAuthoringAgent: true,
  agentsCannotSelfApprove: true,
  noAutoApprovalOfPlansOrClaims: true,
  noFabricatedDiscoveries: true,
  noWorkbenchUi: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
  researchGapHypothesisPortfolio: true,
  experimentPortfolioIntegration: false,
};

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

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

function assertHonesty(honesty: ResearchGapHypothesisPortfolioHonesty): void {
  if (honesty.dependsOnPr1ScientificProgrammeContracts !== true) {
    throw Error("Must depend on PR1 scientific programme contracts");
  }
  if (honesty.dependsOnPr2ResearchObjectivePlanning !== true) {
    throw Error("Must depend on PR2 research objective planning");
  }
  if (honesty.dependsOnPr3ContinuousEvidenceInvestigation !== true) {
    throw Error("Must depend on PR3 continuous evidence investigation");
  }
  if (honesty.dependsOnPr4ScientificKnowledgeEvolution !== true) {
    throw Error("Must depend on PR4 scientific knowledge evolution");
  }
  if (honesty.extendsM3HypothesisRegistryById !== true) {
    throw Error("Must extend M3 hypothesis registry by id composition");
  }
  if (honesty.extendsGapInvestigation !== true) {
    throw Error("Must extend gap investigation");
  }
  if (honesty.noArbitraryImportanceScores !== true) {
    throw Error("Arbitrary importance scores refused");
  }
  if (honesty.prioritisationExposesCriteriaAndAssumptions !== true) {
    throw Error("Prioritisation must expose criteria and assumptions");
  }
  if (honesty.hypothesisStateRequiresEvidenceAndReview !== true) {
    throw Error("Hypothesis state changes require evidence and review");
  }
  if (honesty.discussionVolumeAloneDoesNotConfirm !== true) {
    throw Error("Discussion volume alone must not confirm hypotheses");
  }
  if (honesty.retainRejectedAndSupersededHypotheses !== true) {
    throw Error("Rejected and superseded hypotheses must be retained");
  }
  if (honesty.notSeparateAgentPlatform !== true) {
    throw Error("Must not invent a separate agent platform");
  }
  if (honesty.agentsInvestigateResearchersApprove !== true) {
    throw Error("Agents investigate; researchers approve");
  }
  if (honesty.independentReviewerNotAuthoringAgent !== true) {
    throw Error("Independent reviewer must not be the authoring agent");
  }
  if (honesty.agentsCannotSelfApprove !== true) {
    throw Error("Agents cannot self-approve");
  }
  if (honesty.noAutoApprovalOfPlansOrClaims !== true) {
    throw Error("No auto-approval of plans or claims");
  }
  if (honesty.noFabricatedDiscoveries !== true) {
    throw Error("No fabricated discoveries");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI out of scope");
  }
  if (honesty.gateCAutoApprove !== false) {
    throw Error("Gate C auto-approve refused");
  }
  if (honesty.mouInvented !== false) {
    throw Error("MoU invention refused");
  }
  if (honesty.phiCdsWired !== false) {
    throw Error("PHI/CDS wiring refused");
  }
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
  if (honesty.researchGapHypothesisPortfolio !== true) {
    throw Error("Research gap / hypothesis portfolio must be enabled in PR5");
  }
  if (honesty.experimentPortfolioIntegration !== false) {
    throw Error("Experiment portfolio integration deferred to PR6");
  }
}

function assertNoForbiddenClaimLanguage(text: string, label: string): void {
  const lower = text.toLowerCase();
  if (
    (/\bfabricated\s+discover(?:y|ies)\b/.test(lower) &&
      !/\bno\s+fabricated\s+discover/.test(lower)) ||
    /\bdiscovered\s+that\b/.test(lower) ||
    /\bwe\s+have\s+proven\b/.test(lower) ||
    (/\bauto[- ]?approv(e|ed|al)\b/.test(lower) &&
      !/\b(no|not)\s+auto[- ]?approv/.test(lower)) ||
    /\bgate\s*c\s+auto/.test(lower) ||
    /\bagents?\s+may\s+approve\b/.test(lower) ||
    (/\bself[- ]?approv(e|ed|al)\b/.test(lower) &&
      !/\b(no|not|cannot|must\s+not)\s+self[- ]?approv/.test(lower) &&
      !/\bcannot\s+self[- ]?approv/.test(lower)) ||
    /\btreatment\s+recommendation\b/.test(lower) ||
    /\bdiagnos(e|is|ing)\s+the\s+patient\b/.test(lower) ||
    /\blive\s+multiscale\s+engine\b/.test(lower) ||
    (/\bconfirmed\s+by\s+discussion\b/.test(lower) &&
      !/\b(not|never|refused|cannot)\b/.test(lower)) ||
    (/\bimportance\s+score\b/.test(lower) &&
      !/\b(no|not|without|arbitrary)\b/.test(lower)) ||
    (/\bpromoted\s+to\s+(the\s+)?(curated\s+)?kg\b/.test(lower) &&
      !/\b(not|no|non-)[- ]?promot/.test(lower))
  ) {
    throw Error(
      `${label} must not invent discoveries, auto-approval, self-approval, discussion-volume confirmation, bare importance scores, KG promotion, PHI/CDS directives, or live multiscale claims`,
    );
  }
}

function assertActor(
  actor: PortfolioActor,
  label: string,
): PortfolioActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actorKind`);
  return {
    principalId: actor.principalId.trim(),
    actorKind: actor.actorKind,
  };
}

function validateRefList(
  refs: readonly string[],
  label: string,
  pattern: RegExp,
  max = 32,
): readonly string[] {
  if (refs.length > max) throw Error(`${label} exceeds max ${max}`);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ref of refs) {
    if (!pattern.test(ref)) throw Error(`Invalid ${label} ref`);
    if (seen.has(ref)) throw Error(`Duplicate ${label} ref`);
    seen.add(ref);
    out.push(ref);
  }
  return out;
}

function validateTextList(
  values: readonly string[],
  label: string,
  maxItems = 16,
  maxLen = 500,
): readonly string[] {
  if (values.length > maxItems) throw Error(`${label} exceeds max ${maxItems}`);
  const out: string[] = [];
  for (const value of values) {
    if (!textOk(value, maxLen)) throw Error(`Invalid ${label} entry`);
    assertNoForbiddenClaimLanguage(value, label);
    out.push(value.trim());
  }
  return out;
}

export function validateGapPrioritisationCriteria(
  criteria: GapPrioritisationCriteria,
): GapPrioritisationCriteria {
  if (!PRIORITY_ID_RE.test(criteria.id)) {
    throw Error("Invalid prioritisation criteria id");
  }
  if (criteria.noArbitraryImportanceScore !== true) {
    throw Error("Prioritisation must declare noArbitraryImportanceScore");
  }
  if (!textOk(criteria.criteriaSummary, 500)) {
    throw Error("Invalid prioritisation criteriaSummary");
  }
  assertNoForbiddenClaimLanguage(
    criteria.criteriaSummary,
    "prioritisation criteriaSummary",
  );
  const assumptions = validateTextList(
    criteria.assumptions,
    "prioritisation assumptions",
    16,
    400,
  );
  if (assumptions.length < 1) {
    throw Error("Prioritisation must expose at least one assumption");
  }
  if (
    criteria.ordinalRank !== null &&
    (!Number.isInteger(criteria.ordinalRank) ||
      criteria.ordinalRank < 1 ||
      criteria.ordinalRank > 10_000)
  ) {
    throw Error("Invalid ordinalRank");
  }
  if (!textOk(criteria.note, 1000)) throw Error("Invalid prioritisation note");
  assertNoForbiddenClaimLanguage(criteria.note, "prioritisation note");
  return {
    ...criteria,
    criteriaSummary: criteria.criteriaSummary.trim(),
    assumptions,
    note: criteria.note.trim(),
  };
}

export function validateResearchGapHypothesisPortfolio(
  portfolio: ResearchGapHypothesisPortfolio,
): ResearchGapHypothesisPortfolio {
  if (portfolio.schema !== RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA) {
    throw Error("Invalid portfolio schema");
  }
  if (portfolio.method !== RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD) {
    throw Error("Invalid portfolio method");
  }
  if (portfolio.version !== RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION) {
    throw Error("Invalid portfolio version");
  }
  if (!PORTFOLIO_ID_RE.test(portfolio.id)) throw Error("Invalid portfolio id");
  if (!PROGRAMME_ID_RE.test(portfolio.programmeId)) {
    throw Error("Invalid programmeId");
  }
  if (!textOk(portfolio.label, 240)) throw Error("Invalid portfolio label");
  assertNoForbiddenClaimLanguage(portfolio.label, "portfolio label");
  const linkedObjectiveIds = validateRefList(
    portfolio.linkedObjectiveIds,
    "linkedObjectiveIds",
    OBJECTIVE_ID_RE,
  );
  const authoredBy = assertActor(portfolio.authoredBy, "portfolio author");
  assertClosed(portfolio.dataBasis, DATA_BASES, "dataBasis");
  if (portfolio.fixtureHonesty !== true && portfolio.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(portfolio.honesty);
  if (!isIsoTimestamp(portfolio.createdAt)) throw Error("Invalid createdAt");
  if (!isIsoTimestamp(portfolio.updatedAt)) throw Error("Invalid updatedAt");
  if (!textOk(portfolio.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(portfolio.note, "portfolio note");
  return {
    ...portfolio,
    label: portfolio.label.trim(),
    linkedObjectiveIds,
    authoredBy,
    note: portfolio.note.trim(),
  };
}

export function validateResearchGapRecord(
  gap: ResearchGapRecord,
): ResearchGapRecord {
  if (gap.schema !== RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA) {
    throw Error("Invalid gap schema");
  }
  if (gap.method !== RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD) {
    throw Error("Invalid gap method");
  }
  if (gap.version !== RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION) {
    throw Error("Invalid gap version");
  }
  if (!GAP_ID_RE.test(gap.id)) throw Error("Invalid gap id");
  if (!PORTFOLIO_ID_RE.test(gap.portfolioId)) throw Error("Invalid portfolioId");
  if (!PROGRAMME_ID_RE.test(gap.programmeId)) throw Error("Invalid programmeId");
  assertClosed(gap.category, RESEARCH_GAP_CATEGORIES, "gap category");
  if (!textOk(gap.scientificQuestion, 800)) {
    throw Error("Invalid scientificQuestion");
  }
  assertNoForbiddenClaimLanguage(gap.scientificQuestion, "scientificQuestion");
  const evidenceSupportingTheGap = validateTextList(
    gap.evidenceSupportingTheGap,
    "evidenceSupportingTheGap",
    24,
    600,
  );
  if (evidenceSupportingTheGap.length < 1) {
    throw Error("Gap must include evidence supporting the gap");
  }
  if (!textOk(gap.whyItMatters, 800)) throw Error("Invalid whyItMatters");
  assertNoForbiddenClaimLanguage(gap.whyItMatters, "whyItMatters");
  const alternativeExplanations = validateTextList(
    gap.alternativeExplanations,
    "alternativeExplanations",
    16,
    500,
  );
  const availableInvestigationMethods = validateTextList(
    gap.availableInvestigationMethods,
    "availableInvestigationMethods",
    16,
    400,
  );
  if (availableInvestigationMethods.length < 1) {
    throw Error("Gap must declare available investigation methods");
  }
  if (!textOk(gap.expectedDecisionRelevance, 800)) {
    throw Error("Invalid expectedDecisionRelevance");
  }
  assertNoForbiddenClaimLanguage(
    gap.expectedDecisionRelevance,
    "expectedDecisionRelevance",
  );
  if (!textOk(gap.dataRequirements, 800)) {
    throw Error("Invalid dataRequirements");
  }
  assertNoForbiddenClaimLanguage(gap.dataRequirements, "dataRequirements");
  if (!textOk(gap.uncertainty, 800)) throw Error("Invalid uncertainty");
  assertNoForbiddenClaimLanguage(gap.uncertainty, "uncertainty");
  assertClosed(gap.reviewState, RESEARCH_GAP_REVIEW_STATES, "reviewState");
  const linkedPlanEvidenceGapIds = validateRefList(
    gap.linkedPlanEvidenceGapIds,
    "linkedPlanEvidenceGapIds",
    PLAN_GAP_ID_RE,
  );
  const supportingEvidenceRefs = validateRefList(
    gap.supportingEvidenceRefs,
    "supportingEvidenceRefs",
    EVIDENCE_ID_RE,
  );
  const prioritisation =
    gap.prioritisation === null
      ? null
      : validateGapPrioritisationCriteria(gap.prioritisation);
  const authoredBy = assertActor(gap.authoredBy, "gap author");
  const reviewedBy =
    gap.reviewedBy === null ? null : assertActor(gap.reviewedBy, "gap reviewer");
  if (
    (gap.reviewState === "accepted_human" ||
      gap.reviewState === "rejected_retained" ||
      gap.reviewState === "superseded_retained") &&
    reviewedBy === null
  ) {
    throw Error("Reviewed gap states require reviewedBy");
  }
  if (
    reviewedBy !== null &&
    authoredBy.actorKind === "ai_agent" &&
    reviewedBy.principalId === authoredBy.principalId
  ) {
    throw Error("Independent reviewer must differ from the authoring agent");
  }
  if (
    reviewedBy !== null &&
    reviewedBy.actorKind === "ai_agent" &&
    (gap.reviewState === "accepted_human" ||
      gap.reviewState === "rejected_retained" ||
      gap.reviewState === "superseded_retained")
  ) {
    throw Error("Only human reviewers may accept or reject research gaps");
  }
  assertClosed(gap.dataBasis, DATA_BASES, "dataBasis");
  if (gap.fixtureHonesty !== true && gap.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(gap.honesty);
  if (!isIsoTimestamp(gap.createdAt)) throw Error("Invalid createdAt");
  if (!isIsoTimestamp(gap.updatedAt)) throw Error("Invalid updatedAt");
  if (!textOk(gap.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(gap.note, "gap note");
  return {
    ...gap,
    scientificQuestion: gap.scientificQuestion.trim(),
    evidenceSupportingTheGap,
    whyItMatters: gap.whyItMatters.trim(),
    alternativeExplanations,
    availableInvestigationMethods,
    expectedDecisionRelevance: gap.expectedDecisionRelevance.trim(),
    dataRequirements: gap.dataRequirements.trim(),
    uncertainty: gap.uncertainty.trim(),
    linkedPlanEvidenceGapIds,
    supportingEvidenceRefs,
    prioritisation,
    authoredBy,
    reviewedBy,
    note: gap.note.trim(),
  };
}

function validateCompetingExplanation(
  explanation: CompetingExplanation,
): CompetingExplanation {
  if (!COMP_ID_RE.test(explanation.id)) {
    throw Error("Invalid competing explanation id");
  }
  if (!textOk(explanation.summary, 600)) {
    throw Error("Invalid competing explanation summary");
  }
  assertNoForbiddenClaimLanguage(
    explanation.summary,
    "competing explanation summary",
  );
  assertClosed(
    explanation.relationToPrimary,
    ["competing", "complementary", "narrower", "broader"] as const,
    "relationToPrimary",
  );
  if (!textOk(explanation.note, 500)) {
    throw Error("Invalid competing explanation note");
  }
  assertNoForbiddenClaimLanguage(
    explanation.note,
    "competing explanation note",
  );
  return {
    ...explanation,
    summary: explanation.summary.trim(),
    note: explanation.note.trim(),
  };
}

function validateEvidenceLink(
  link: PortfolioEvidenceLink,
): PortfolioEvidenceLink {
  if (!EVIDENCE_ID_RE.test(link.evidenceRef)) {
    throw Error("Invalid evidenceRef");
  }
  assertClosed(link.polarity, EVIDENCE_POLARITIES, "evidence polarity");
  if (!textOk(link.note, 400)) throw Error("Invalid evidence link note");
  assertNoForbiddenClaimLanguage(link.note, "evidence link note");
  return {...link, note: link.note.trim()};
}

function validateFalsifiablePrediction(
  prediction: FalsifiablePrediction,
): FalsifiablePrediction {
  if (!PRED_ID_RE.test(prediction.id)) {
    throw Error("Invalid falsifiable prediction id");
  }
  if (!textOk(prediction.prediction, 600)) {
    throw Error("Invalid prediction text");
  }
  assertNoForbiddenClaimLanguage(prediction.prediction, "prediction");
  if (!textOk(prediction.falsifier, 600)) {
    throw Error("Invalid falsifier");
  }
  assertNoForbiddenClaimLanguage(prediction.falsifier, "falsifier");
  const linkedExperimentIds = validateRefList(
    prediction.linkedExperimentIds,
    "prediction linkedExperimentIds",
    EXPERIMENT_ID_RE,
  );
  if (!textOk(prediction.note, 500)) {
    throw Error("Invalid prediction note");
  }
  assertNoForbiddenClaimLanguage(prediction.note, "prediction note");
  return {
    ...prediction,
    prediction: prediction.prediction.trim(),
    falsifier: prediction.falsifier.trim(),
    linkedExperimentIds,
    note: prediction.note.trim(),
  };
}

export function validateHypothesisPortfolioEntry(
  entry: HypothesisPortfolioEntry,
): HypothesisPortfolioEntry {
  if (entry.schema !== RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA) {
    throw Error("Invalid hypothesis schema");
  }
  if (entry.method !== RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD) {
    throw Error("Invalid hypothesis method");
  }
  if (entry.version !== RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION) {
    throw Error("Invalid hypothesis version");
  }
  if (!HYP_ID_RE.test(entry.id)) throw Error("Invalid hypothesis id");
  if (!PORTFOLIO_ID_RE.test(entry.portfolioId)) {
    throw Error("Invalid portfolioId");
  }
  if (!PROGRAMME_ID_RE.test(entry.programmeId)) {
    throw Error("Invalid programmeId");
  }
  if (!textOk(entry.statement, 1000)) throw Error("Invalid statement");
  assertNoForbiddenClaimLanguage(entry.statement, "hypothesis statement");
  const linkedObjectiveIds = validateRefList(
    entry.linkedObjectiveIds,
    "linkedObjectiveIds",
    OBJECTIVE_ID_RE,
  );
  const linkedM3HypothesisIds = validateRefList(
    entry.linkedM3HypothesisIds,
    "linkedM3HypothesisIds",
    M3_HYP_ID_RE,
  );
  const addressesGapIds = validateRefList(
    entry.addressesGapIds,
    "addressesGapIds",
    GAP_ID_RE,
  );
  const competingExplanations = entry.competingExplanations.map(
    validateCompetingExplanation,
  );
  const evidenceLinks = entry.evidenceLinks.map(validateEvidenceLink);
  const falsifiablePredictions = entry.falsifiablePredictions.map(
    validateFalsifiablePrediction,
  );
  if (falsifiablePredictions.length < 1) {
    throw Error("Hypothesis must declare at least one falsifiable prediction");
  }
  const linkedExperimentIds = validateRefList(
    entry.linkedExperimentIds,
    "linkedExperimentIds",
    EXPERIMENT_ID_RE,
  );
  assertClosed(entry.state, HYPOTHESIS_PORTFOLIO_STATES, "hypothesis state");
  assertClosed(
    entry.validationStatus,
    HYPOTHESIS_VALIDATION_STATUSES,
    "validationStatus",
  );
  if (entry.discussionVolumeAloneDoesNotConfirm !== true) {
    throw Error("discussionVolumeAloneDoesNotConfirm must be true");
  }
  if (
    entry.retainedAfterRejectOrSupersede !== true &&
    entry.retainedAfterRejectOrSupersede !== false
  ) {
    throw Error("Invalid retainedAfterRejectOrSupersede");
  }
  if (
    (entry.state === "rejected" || entry.state === "superseded") &&
    entry.retainedAfterRejectOrSupersede !== true
  ) {
    throw Error("Rejected and superseded hypotheses must be retained");
  }
  if (
    entry.supersededByHypothesisId !== null &&
    !HYP_ID_RE.test(entry.supersededByHypothesisId)
  ) {
    throw Error("Invalid supersededByHypothesisId");
  }
  if (entry.state === "superseded" && entry.supersededByHypothesisId === null) {
    throw Error("Superseded hypotheses require supersededByHypothesisId");
  }
  const authoredBy = assertActor(entry.authoredBy, "hypothesis author");
  const reviewedBy =
    entry.reviewedBy === null
      ? null
      : assertActor(entry.reviewedBy, "hypothesis reviewer");
  if (
    (entry.state === "evidence_supported" ||
      entry.state === "challenged" ||
      entry.state === "experimentally_tested" ||
      entry.state === "inconclusive" ||
      entry.state === "rejected" ||
      entry.state === "superseded") &&
    reviewedBy === null
  ) {
    throw Error(
      "Hypothesis states beyond proposed/under_investigation require reviewedBy",
    );
  }
  if (
    reviewedBy !== null &&
    authoredBy.actorKind === "ai_agent" &&
    reviewedBy.principalId === authoredBy.principalId
  ) {
    throw Error("Independent reviewer must differ from the authoring agent");
  }
  if (reviewedBy !== null && reviewedBy.actorKind === "ai_agent") {
    throw Error("Only human reviewers may decide hypothesis portfolio states");
  }
  if (
    (entry.state === "evidence_supported" ||
      entry.state === "experimentally_tested") &&
    evidenceLinks.filter((l) => l.polarity === "supporting").length < 1
  ) {
    throw Error(
      "Evidence-supported or experimentally-tested states require supporting evidence",
    );
  }
  assertClosed(entry.dataBasis, DATA_BASES, "dataBasis");
  if (entry.fixtureHonesty !== true && entry.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(entry.honesty);
  if (!isIsoTimestamp(entry.createdAt)) throw Error("Invalid createdAt");
  if (!isIsoTimestamp(entry.updatedAt)) throw Error("Invalid updatedAt");
  if (!textOk(entry.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(entry.note, "hypothesis note");
  return {
    ...entry,
    statement: entry.statement.trim(),
    linkedObjectiveIds,
    linkedM3HypothesisIds,
    addressesGapIds,
    competingExplanations,
    evidenceLinks,
    falsifiablePredictions,
    linkedExperimentIds,
    authoredBy,
    reviewedBy,
    note: entry.note.trim(),
  };
}

export function validateHypothesisReassessmentRecord(
  record: HypothesisReassessmentRecord,
): HypothesisReassessmentRecord {
  if (record.schema !== RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA) {
    throw Error("Invalid reassessment schema");
  }
  if (record.method !== RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD) {
    throw Error("Invalid reassessment method");
  }
  if (record.version !== RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION) {
    throw Error("Invalid reassessment version");
  }
  if (!REASSESS_ID_RE.test(record.id)) throw Error("Invalid reassessment id");
  if (!PORTFOLIO_ID_RE.test(record.portfolioId)) {
    throw Error("Invalid portfolioId");
  }
  if (!PROGRAMME_ID_RE.test(record.programmeId)) {
    throw Error("Invalid programmeId");
  }
  if (!HYP_ID_RE.test(record.hypothesisId)) {
    throw Error("Invalid hypothesisId");
  }
  assertClosed(record.priorState, HYPOTHESIS_PORTFOLIO_STATES, "priorState");
  assertClosed(record.nextState, HYPOTHESIS_PORTFOLIO_STATES, "nextState");
  const newEvidenceRefs = validateRefList(
    record.newEvidenceRefs,
    "newEvidenceRefs",
    EVIDENCE_ID_RE,
  );
  if (newEvidenceRefs.length < 1) {
    throw Error("Reassessment requires at least one new evidence ref");
  }
  if (!textOk(record.rationale, 1000)) throw Error("Invalid rationale");
  assertNoForbiddenClaimLanguage(record.rationale, "reassessment rationale");
  if (record.evidenceAndReviewRequired !== true) {
    throw Error("evidenceAndReviewRequired must be true");
  }
  if (record.discussionVolumeAloneRefused !== true) {
    throw Error("discussionVolumeAloneRefused must be true");
  }
  const authoredBy = assertActor(record.authoredBy, "reassessment author");
  const reviewedBy = assertActor(record.reviewedBy, "reassessment reviewer");
  if (reviewedBy.actorKind !== "human") {
    throw Error("Only human reviewers may complete hypothesis reassessment");
  }
  if (
    authoredBy.actorKind === "ai_agent" &&
    reviewedBy.principalId === authoredBy.principalId
  ) {
    throw Error("Independent reviewer must differ from the authoring agent");
  }
  assertClosed(record.dataBasis, DATA_BASES, "dataBasis");
  if (record.fixtureHonesty !== true && record.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(record.honesty);
  if (!isIsoTimestamp(record.createdAt)) throw Error("Invalid createdAt");
  if (!textOk(record.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(record.note, "reassessment note");
  return {
    ...record,
    newEvidenceRefs,
    rationale: record.rationale.trim(),
    authoredBy,
    reviewedBy,
    note: record.note.trim(),
  };
}

export function openResearchGapHypothesisPortfolio(input: {
  id: string;
  programmeId: string;
  label: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: PortfolioActorKind;
  createdAt: string;
  linkedObjectiveIds?: readonly string[];
  note?: string;
  dataBasis?: PortfolioDataBasis;
}): ResearchGapHypothesisPortfolio {
  return validateResearchGapHypothesisPortfolio({
    schema: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA,
    method: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD,
    version: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION,
    id: input.id,
    programmeId: input.programmeId,
    label: input.label,
    linkedObjectiveIds: input.linkedObjectiveIds ?? [],
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    dataBasis: input.dataBasis ?? "fixture_engineering",
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note:
      input.note ??
      "Fixture research-gap / hypothesis portfolio — not a discovery claim.",
  });
}

export function registerResearchGap(input: {
  id: string;
  portfolio: ResearchGapHypothesisPortfolio;
  category: ResearchGapCategory;
  scientificQuestion: string;
  evidenceSupportingTheGap: readonly string[];
  whyItMatters: string;
  alternativeExplanations: readonly string[];
  availableInvestigationMethods: readonly string[];
  expectedDecisionRelevance: string;
  dataRequirements: string;
  uncertainty: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: PortfolioActorKind;
  createdAt: string;
  reviewState?: ResearchGapReviewState;
  linkedPlanEvidenceGapIds?: readonly string[];
  supportingEvidenceRefs?: readonly string[];
  prioritisation?: GapPrioritisationCriteria | null;
  note?: string;
}): ResearchGapRecord {
  return validateResearchGapRecord({
    schema: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA,
    method: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD,
    version: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION,
    id: input.id,
    portfolioId: input.portfolio.id,
    programmeId: input.portfolio.programmeId,
    category: input.category,
    scientificQuestion: input.scientificQuestion,
    evidenceSupportingTheGap: input.evidenceSupportingTheGap,
    whyItMatters: input.whyItMatters,
    alternativeExplanations: input.alternativeExplanations,
    availableInvestigationMethods: input.availableInvestigationMethods,
    expectedDecisionRelevance: input.expectedDecisionRelevance,
    dataRequirements: input.dataRequirements,
    uncertainty: input.uncertainty,
    reviewState: input.reviewState ?? "draft",
    linkedPlanEvidenceGapIds: input.linkedPlanEvidenceGapIds ?? [],
    supportingEvidenceRefs: input.supportingEvidenceRefs ?? [],
    prioritisation: input.prioritisation ?? null,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    reviewedBy: null,
    dataBasis: input.portfolio.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note:
      input.note ??
      "Fixture research-gap envelope — investigation proposal only.",
  });
}

export function reviewResearchGap(input: {
  gap: ResearchGapRecord;
  reviewState: Extract<
    ResearchGapReviewState,
    "accepted_human" | "rejected_retained" | "superseded_retained"
  >;
  reviewedBy: PortfolioActor;
  updatedAt: string;
  note?: string;
}): ResearchGapRecord {
  if (input.reviewedBy.actorKind !== "human") {
    throw Error("Only human reviewers may accept or reject research gaps");
  }
  if (
    input.gap.authoredBy.actorKind === "ai_agent" &&
    input.reviewedBy.principalId === input.gap.authoredBy.principalId
  ) {
    throw Error("Agents cannot self-approve research gap reviews");
  }
  return validateResearchGapRecord({
    ...input.gap,
    reviewState: input.reviewState,
    reviewedBy: input.reviewedBy,
    updatedAt: input.updatedAt,
    note:
      input.note ??
      "Human research-gap review recorded — fixtures only; not scientific approval.",
  });
}

export function registerHypothesisPortfolioEntry(input: {
  id: string;
  portfolio: ResearchGapHypothesisPortfolio;
  statement: string;
  falsifiablePredictions: readonly FalsifiablePrediction[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PortfolioActorKind;
  createdAt: string;
  linkedObjectiveIds?: readonly string[];
  linkedM3HypothesisIds?: readonly string[];
  addressesGapIds?: readonly string[];
  competingExplanations?: readonly CompetingExplanation[];
  evidenceLinks?: readonly PortfolioEvidenceLink[];
  linkedExperimentIds?: readonly string[];
  state?: Extract<
    HypothesisPortfolioState,
    "proposed" | "under_investigation"
  >;
  note?: string;
}): HypothesisPortfolioEntry {
  return validateHypothesisPortfolioEntry({
    schema: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA,
    method: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD,
    version: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION,
    id: input.id,
    portfolioId: input.portfolio.id,
    programmeId: input.portfolio.programmeId,
    statement: input.statement,
    linkedObjectiveIds:
      input.linkedObjectiveIds ?? input.portfolio.linkedObjectiveIds,
    linkedM3HypothesisIds: input.linkedM3HypothesisIds ?? [],
    addressesGapIds: input.addressesGapIds ?? [],
    competingExplanations: input.competingExplanations ?? [],
    evidenceLinks: input.evidenceLinks ?? [],
    falsifiablePredictions: input.falsifiablePredictions,
    linkedExperimentIds: input.linkedExperimentIds ?? [],
    state: input.state ?? "proposed",
    validationStatus: "not_started",
    discussionVolumeAloneDoesNotConfirm: true,
    retainedAfterRejectOrSupersede: false,
    supersededByHypothesisId: null,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    reviewedBy: null,
    dataBasis: input.portfolio.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note:
      input.note ??
      "Fixture hypothesis portfolio entry — not confirmed; review required.",
  });
}

const STATE_TO_VALIDATION: Record<
  HypothesisPortfolioState,
  HypothesisValidationStatus
> = {
  proposed: "not_started",
  under_investigation: "awaiting_evidence_review",
  evidence_supported: "partially_supported",
  challenged: "challenged_pending_resolution",
  experimentally_tested: "experiment_linked_awaiting_observation",
  inconclusive: "inconclusive_after_review",
  rejected: "rejected_after_review",
  superseded: "superseded_after_review",
};

export function transitionHypothesisPortfolioState(input: {
  entry: HypothesisPortfolioEntry;
  nextState: HypothesisPortfolioState;
  reviewedBy: PortfolioActor;
  updatedAt: string;
  evidenceLinks?: readonly PortfolioEvidenceLink[];
  linkedExperimentIds?: readonly string[];
  supersededByHypothesisId?: string | null;
  note?: string;
  /** Explicit refuse path for discussion-volume confirmation attempts. */
  confirmedByDiscussionVolume?: boolean;
}): HypothesisPortfolioEntry {
  if (input.confirmedByDiscussionVolume === true) {
    throw Error(
      "Hypothesis confirmation from discussion volume alone is refused",
    );
  }
  if (input.reviewedBy.actorKind !== "human") {
    throw Error("Only human reviewers may change hypothesis portfolio states");
  }
  if (
    input.entry.authoredBy.actorKind === "ai_agent" &&
    input.reviewedBy.principalId === input.entry.authoredBy.principalId
  ) {
    throw Error("Agents cannot self-approve hypothesis portfolio state changes");
  }
  if (
    input.nextState === input.entry.state &&
    input.nextState !== "under_investigation"
  ) {
    throw Error("Hypothesis state transition must change state");
  }

  const evidenceLinks = input.evidenceLinks ?? input.entry.evidenceLinks;
  const linkedExperimentIds =
    input.linkedExperimentIds ?? input.entry.linkedExperimentIds;
  const retained =
    input.nextState === "rejected" || input.nextState === "superseded"
      ? true
      : input.entry.retainedAfterRejectOrSupersede;

  return validateHypothesisPortfolioEntry({
    ...input.entry,
    state: input.nextState,
    validationStatus: STATE_TO_VALIDATION[input.nextState],
    evidenceLinks,
    linkedExperimentIds,
    retainedAfterRejectOrSupersede: retained,
    supersededByHypothesisId:
      input.nextState === "superseded"
        ? (input.supersededByHypothesisId ?? null)
        : input.entry.supersededByHypothesisId,
    reviewedBy: input.reviewedBy,
    updatedAt: input.updatedAt,
    note:
      input.note ??
      "Human-reviewed hypothesis state transition — evidence required; fixtures only.",
  });
}

export function reassessHypothesisAfterNewEvidence(input: {
  id: string;
  entry: HypothesisPortfolioEntry;
  nextState: HypothesisPortfolioState;
  newEvidenceRefs: readonly string[];
  rationale: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: PortfolioActorKind;
  reviewedBy: PortfolioActor;
  createdAt: string;
  evidenceLinks?: readonly PortfolioEvidenceLink[];
  linkedExperimentIds?: readonly string[];
  supersededByHypothesisId?: string | null;
  note?: string;
  confirmedByDiscussionVolume?: boolean;
}): {
  entry: HypothesisPortfolioEntry;
  reassessment: HypothesisReassessmentRecord;
} {
  if (input.confirmedByDiscussionVolume === true) {
    throw Error(
      "Hypothesis confirmation from discussion volume alone is refused",
    );
  }
  const entry = transitionHypothesisPortfolioState({
    entry: input.entry,
    nextState: input.nextState,
    reviewedBy: input.reviewedBy,
    updatedAt: input.createdAt,
    evidenceLinks: input.evidenceLinks,
    linkedExperimentIds: input.linkedExperimentIds,
    supersededByHypothesisId: input.supersededByHypothesisId,
    note:
      input.note ??
      "Hypothesis reassessed after new evidence — retained history; fixtures only.",
  });
  const reassessment = validateHypothesisReassessmentRecord({
    schema: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA,
    method: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD,
    version: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION,
    id: input.id,
    portfolioId: input.entry.portfolioId,
    programmeId: input.entry.programmeId,
    hypothesisId: input.entry.id,
    priorState: input.entry.state,
    nextState: input.nextState,
    newEvidenceRefs: input.newEvidenceRefs,
    rationale: input.rationale,
    evidenceAndReviewRequired: true,
    discussionVolumeAloneRefused: true,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    reviewedBy: input.reviewedBy,
    dataBasis: input.entry.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    note:
      input.note ??
      "Append-style reassessment record after new evidence — rejected/superseded retained.",
  });
  return {entry, reassessment};
}

export function createMemoryResearchGapHypothesisPortfolioStore(): ResearchGapHypothesisPortfolioStore & {
  portfolios: Map<string, ResearchGapHypothesisPortfolio>;
  gaps: Map<string, ResearchGapRecord>;
  hypotheses: Map<string, HypothesisPortfolioEntry>;
  reassessments: Map<string, HypothesisReassessmentRecord>;
} {
  const portfolios = new Map<string, ResearchGapHypothesisPortfolio>();
  const gaps = new Map<string, ResearchGapRecord>();
  const hypotheses = new Map<string, HypothesisPortfolioEntry>();
  const reassessments = new Map<string, HypothesisReassessmentRecord>();

  return {
    portfolios,
    gaps,
    hypotheses,
    reassessments,
    upsertPortfolio(portfolio) {
      const validated = validateResearchGapHypothesisPortfolio(portfolio);
      portfolios.set(validated.id, validated);
      return validated;
    },
    getPortfolio(id) {
      return portfolios.get(id) ?? null;
    },
    listPortfolios(programmeId) {
      const all = [...portfolios.values()];
      return programmeId
        ? all.filter((p) => p.programmeId === programmeId)
        : all;
    },
    upsertGap(gap) {
      const validated = validateResearchGapRecord(gap);
      gaps.set(validated.id, validated);
      return validated;
    },
    getGap(id) {
      return gaps.get(id) ?? null;
    },
    listGaps(portfolioId) {
      const all = [...gaps.values()];
      return portfolioId
        ? all.filter((g) => g.portfolioId === portfolioId)
        : all;
    },
    upsertHypothesis(entry) {
      const validated = validateHypothesisPortfolioEntry(entry);
      hypotheses.set(validated.id, validated);
      return validated;
    },
    getHypothesis(id) {
      return hypotheses.get(id) ?? null;
    },
    listHypotheses(portfolioId) {
      const all = [...hypotheses.values()];
      return portfolioId
        ? all.filter((h) => h.portfolioId === portfolioId)
        : all;
    },
    upsertReassessment(record) {
      const validated = validateHypothesisReassessmentRecord(record);
      reassessments.set(validated.id, validated);
      return validated;
    },
    listReassessments(hypothesisId) {
      const all = [...reassessments.values()];
      return hypothesisId
        ? all.filter((r) => r.hypothesisId === hypothesisId)
        : all;
    },
  };
}

export function projectResearchGapHypothesisPortfolioPersistenceLines(input: {
  portfolio: ResearchGapHypothesisPortfolio;
  gaps?: readonly ResearchGapRecord[];
  hypotheses?: readonly HypothesisPortfolioEntry[];
  reassessments?: readonly HypothesisReassessmentRecord[];
}): string[] {
  const portfolio = validateResearchGapHypothesisPortfolio(input.portfolio);
  const gaps = (input.gaps ?? []).map(validateResearchGapRecord);
  const hypotheses = (input.hypotheses ?? []).map(
    validateHypothesisPortfolioEntry,
  );
  const reassessments = (input.reassessments ?? []).map(
    validateHypothesisReassessmentRecord,
  );
  const retained = hypotheses.filter(
    (h) =>
      (h.state === "rejected" || h.state === "superseded") &&
      h.retainedAfterRejectOrSupersede,
  ).length;

  return [
    `schema=${portfolio.schema}`,
    `method=${portfolio.method}`,
    `version=${portfolio.version}`,
    `programmeId=${portfolio.programmeId}`,
    `portfolioId=${portfolio.id}`,
    `gapCount=${gaps.length}`,
    `gapCategoryCount=${RESEARCH_GAP_CATEGORIES.length}`,
    `hypothesisCount=${hypotheses.length}`,
    `hypothesisStateCount=${HYPOTHESIS_PORTFOLIO_STATES.length}`,
    `reassessmentCount=${reassessments.length}`,
    `retainedRejectedOrSuperseded=${retained}`,
    `noArbitraryImportanceScores=true`,
    `prioritisationExposesCriteriaAndAssumptions=true`,
    `hypothesisStateRequiresEvidenceAndReview=true`,
    `discussionVolumeAloneDoesNotConfirm=true`,
    `agentsCannotSelfApprove=true`,
    `retainRejectedAndSupersededHypotheses=true`,
    `noAutoApproval=true`,
    `noFabricatedDiscoveries=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
    `researchGapHypothesisPortfolio=true`,
    `experimentPortfolioIntegration=false`,
  ];
}

export function fingerprintResearchGapHypothesisPortfolio(
  portfolio: ResearchGapHypothesisPortfolio,
): string {
  const validated = validateResearchGapHypothesisPortfolio(portfolio);
  return sha256Hex(canonicalEvidenceJson(validated));
}

export function buildResearchGapHypothesisPortfolioPack(input: {
  portfolios: readonly ResearchGapHypothesisPortfolio[];
  gaps: readonly ResearchGapRecord[];
  hypotheses: readonly HypothesisPortfolioEntry[];
  reassessments: readonly HypothesisReassessmentRecord[];
  asOf: string;
}): {
  schema: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA;
  method: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD;
  version: typeof RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION;
  asOf: string;
  portfolioCount: number;
  gapCount: number;
  hypothesisCount: number;
  reassessmentCount: number;
  gapCategories: typeof RESEARCH_GAP_CATEGORIES;
  hypothesisStates: typeof HYPOTHESIS_PORTFOLIO_STATES;
  honesty: ResearchGapHypothesisPortfolioHonesty;
  portfolios: readonly ResearchGapHypothesisPortfolio[];
  gaps: readonly ResearchGapRecord[];
  hypotheses: readonly HypothesisPortfolioEntry[];
  reassessments: readonly HypothesisReassessmentRecord[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const portfolios = input.portfolios.map(
    validateResearchGapHypothesisPortfolio,
  );
  const gaps = input.gaps.map(validateResearchGapRecord);
  const hypotheses = input.hypotheses.map(validateHypothesisPortfolioEntry);
  const reassessments = input.reassessments.map(
    validateHypothesisReassessmentRecord,
  );
  return {
    schema: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA,
    method: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD,
    version: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION,
    asOf: input.asOf,
    portfolioCount: portfolios.length,
    gapCount: gaps.length,
    hypothesisCount: hypotheses.length,
    reassessmentCount: reassessments.length,
    gapCategories: RESEARCH_GAP_CATEGORIES,
    hypothesisStates: HYPOTHESIS_PORTFOLIO_STATES,
    honesty: {...DEFAULT_HONESTY},
    portfolios,
    gaps,
    hypotheses,
    reassessments,
  };
}
