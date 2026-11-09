/**
 * Milestone 17 / PR3 — Continuous Evidence Investigation.
 *
 * Programme-scoped living-evidence investigation contracts that extend M8
 * incremental evidence monitoring with programme subscriptions, scheduled
 * retrieval, deduplication, source-identity verification, classification,
 * context extraction, contradiction detection, retraction/correction handling,
 * evidence change detection, and programme impact assessment.
 *
 * Reuses authorised integration refs (fixtures OK): Europe PMC, Open Targets,
 * ClinicalTrials.gov, UniProt, Reactome (stub), approved omics, authorised
 * research datasets, clinical/experimental evidence services.
 *
 * Does NOT auto-approve extracted claims, treat new publications as consensus
 * change, treat retractions as valid support, invent a separate agent platform,
 * ship workbench UI, fabricate discoveries, invent Gate C auto-approve / MoU,
 * wire PHI/CDS, introduce Neon migrations, or claim scientific knowledge
 * evolution writers (PR4).
 *
 * Binding honesty:
 * - New publication ≠ consensus change.
 * - Extracted claims are never auto-approved.
 * - Retracted ≠ valid support.
 * - Respect licences / rate limits / budgets.
 * - Preserve evidence snapshots and retrieval timestamps.
 * - Agents investigate / propose; researchers approve.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 * - Depends on PR2 (#134) / PR1 (#131) and M8 monitoring refs — stack or merge first.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";
import {
  MONITORING_LIVE_PROVIDERS,
  MONITORING_SCHEDULE_INTERVALS,
  type MonitoringLiveProvider,
  type MonitoringProviderRef,
  type MonitoringScheduleInterval,
} from "./evidence/incrementalEvidenceMonitoring";

export const CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA =
  "hsi-continuous-evidence-investigation-1" as const;
export const CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD =
  "hsi.continuous_evidence_investigation.v1" as const;
export const CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION = "0.1.0" as const;

/** Programme-scoped investigation source families (compose M8 + declared). */
export const PROGRAMME_EVIDENCE_SOURCE_KINDS = [
  "europe_pmc",
  "open_targets",
  "clinicaltrials_gov",
  "uniprot",
  "reactome_stub",
  "approved_omics",
  "authorised_research_dataset",
  "clinical_experimental_evidence_service",
] as const;
export type ProgrammeEvidenceSourceKind =
  (typeof PROGRAMME_EVIDENCE_SOURCE_KINDS)[number];

export const PROGRAMME_SUBSCRIPTION_LIFECYCLES = [
  "draft",
  "active",
  "paused",
  "superseded",
  "cancelled",
] as const;
export type ProgrammeSubscriptionLifecycle =
  (typeof PROGRAMME_SUBSCRIPTION_LIFECYCLES)[number];

export const SCHEDULED_RETRIEVAL_STATUSES = [
  "scheduled",
  "running_fixture",
  "completed_bounded",
  "skipped_offline",
  "gated_not_run",
  "budget_exhausted",
  "provider_unavailable",
  "invalid",
] as const;
export type ScheduledRetrievalStatus =
  (typeof SCHEDULED_RETRIEVAL_STATUSES)[number];

export const EVIDENCE_CLASSIFICATION_KINDS = [
  "literature_record",
  "target_association",
  "trial_record",
  "protein_record",
  "pathway_stub",
  "omics_declared",
  "dataset_declared",
  "clinical_experimental_declared",
  "other_declared",
] as const;
export type EvidenceClassificationKind =
  (typeof EVIDENCE_CLASSIFICATION_KINDS)[number];

export const SOURCE_IDENTITY_VERIFICATION_STATES = [
  "verified_fixture",
  "verified_declared",
  "unresolved",
  "invalid",
  "not_assessed",
] as const;
export type SourceIdentityVerificationState =
  (typeof SOURCE_IDENTITY_VERIFICATION_STATES)[number];

export const CONTRADICTION_DETECTION_STATUSES = [
  "none_detected_fixture",
  "candidate_recorded",
  "insufficient_comparability",
  "not_assessed",
] as const;
export type ContradictionDetectionStatus =
  (typeof CONTRADICTION_DETECTION_STATUSES)[number];

export const RETRACTION_CORRECTION_KINDS = [
  "retraction",
  "correction",
  "expression_of_concern",
  "withdrawal",
] as const;
export type RetractionCorrectionKind =
  (typeof RETRACTION_CORRECTION_KINDS)[number];

export const EVIDENCE_CHANGE_KINDS = [
  "new_record",
  "metadata_refresh",
  "status_change",
  "retraction_or_correction",
  "duplicate_collapsed",
  "licence_or_availability_change",
] as const;
export type EvidenceChangeKind = (typeof EVIDENCE_CHANGE_KINDS)[number];

export const PROGRAMME_IMPACT_CLASSES = [
  "informational_only",
  "may_affect_workstream_priority",
  "may_affect_evidence_gap",
  "requires_human_review",
  "not_assessed",
] as const;
export type ProgrammeImpactClass = (typeof PROGRAMME_IMPACT_CLASSES)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type ContinuousEvidenceActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type ContinuousEvidenceDataBasis = (typeof DATA_BASES)[number];

const SUBSCRIPTION_ID_RE = /^hsi-sp-psub-[a-z0-9-]{3,80}$/;
const RETRIEVAL_ID_RE = /^hsi-sp-sret-[a-z0-9-]{3,80}$/;
const EVIDENCE_ID_RE = /^hsi-sp-evid-[a-z0-9-]{3,80}$/;
const CONTEXT_ID_RE = /^hsi-sp-ctx-[a-z0-9-]{3,80}$/;
const CONTRADICTION_ID_RE = /^hsi-sp-ctr-[a-z0-9-]{3,80}$/;
const RETRACTION_ID_RE = /^hsi-sp-rtx-[a-z0-9-]{3,80}$/;
const CHANGE_ID_RE = /^hsi-sp-chg-[a-z0-9-]{3,80}$/;
const IMPACT_ID_RE = /^hsi-sp-imp-[a-z0-9-]{3,80}$/;
const PROGRAMME_ID_RE = /^hsi-sp-prog-[a-z0-9-]{3,80}$/;
const PLAN_ID_RE = /^hsi-sp-plan-[a-z0-9-]{3,80}$/;
const WORKSTREAM_ID_RE = /^hsi-sp-ws-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type ContinuousEvidenceInvestigationHonesty = {
  dependsOnPr1ScientificProgrammeContracts: true;
  dependsOnPr2ResearchObjectivePlanning: true;
  extendsM8IncrementalEvidenceMonitoring: true;
  newPublicationIsNotConsensusChange: true;
  extractedClaimsNotAutoApproved: true;
  retractedIsNotValidSupport: true;
  licencesAndLimitsRespected: true;
  snapshotsAndRetrievalTimestampsPreserved: true;
  notSeparateAgentPlatform: true;
  agentsInvestigateResearchersApprove: true;
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
  /** Knowledge-evolution writers are deferred to PR4. */
  scientificKnowledgeEvolution: false;
};

export type ContinuousEvidenceActor = {
  principalId: string;
  actorKind: ContinuousEvidenceActorKind;
};

export type ProgrammeSourceLicenceBound = {
  /** Explicit: licence/limit respect is required; never silent scrape. */
  licencesAndLimitsRespected: true;
  fullDatabaseScrape: false;
  rateLimitMsMin: number;
  maxResultsPerRun: number;
  note: string;
};

export type ProgrammeSourceSubscription = {
  schema: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA;
  method: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD;
  version: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION;
  id: string;
  programmeId: string;
  /** Optional bind to PR2 registered plan. */
  planId: string | null;
  /** Optional bind to PR1 workstream. */
  workstreamId: string | null;
  /** Optional M8 monitoring subscription id composition. */
  m8SubscriptionId: string | null;
  topicLabel: string;
  sourceKinds: readonly ProgrammeEvidenceSourceKind[];
  scheduleInterval: MonitoringScheduleInterval;
  nextRetrievalAt: string | null;
  licenceBound: ProgrammeSourceLicenceBound;
  lifecycle: ProgrammeSubscriptionLifecycle;
  authoredBy: ContinuousEvidenceActor;
  dataBasis: ContinuousEvidenceDataBasis;
  fixtureHonesty: boolean;
  honesty: ContinuousEvidenceInvestigationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ScheduledEvidenceRetrieval = {
  schema: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA;
  method: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD;
  version: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION;
  id: string;
  subscriptionId: string;
  programmeId: string;
  status: ScheduledRetrievalStatus;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  /** Retrieval timestamp preserved for honesty / replay. */
  retrievedAt: string | null;
  sourceKindsAttempted: readonly ProgrammeEvidenceSourceKind[];
  hitCountBounded: number;
  truncatedByBudget: boolean;
  liveNetworkUsed: boolean;
  offlineFixture: boolean;
  snapshotRef: string | null;
  authoredBy: ContinuousEvidenceActor;
  honesty: ContinuousEvidenceInvestigationHonesty;
  note: string;
};

export type ProgrammeEvidenceItem = {
  schema: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA;
  method: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD;
  version: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION;
  id: string;
  programmeId: string;
  subscriptionId: string;
  retrievalId: string;
  sourceKind: ProgrammeEvidenceSourceKind;
  /** Provider + external id stable key for dedupe. */
  evidenceKey: string;
  externalId: string;
  title: string;
  classification: EvidenceClassificationKind;
  sourceIdentityState: SourceIdentityVerificationState;
  /** Extracted claim text if any — never auto-approved. */
  extractedClaimSummary: string | null;
  extractedClaimsNotAutoApproved: true;
  duplicateOfEvidenceId: string | null;
  duplicateOfPrior: boolean;
  retractedOrCorrected: boolean;
  /** Retracted records must not count as valid support. */
  validSupport: false | "not_assessed";
  snapshotRef: string;
  retrievedAt: string;
  createdAt: string;
  updatedAt: string;
  honesty: ContinuousEvidenceInvestigationHonesty;
  note: string;
};

export type EvidenceContextExtraction = {
  schema: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA;
  method: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD;
  version: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION;
  id: string;
  evidenceId: string;
  programmeId: string;
  contextSummary: string;
  relatedWorkstreamIds: readonly string[];
  relatedPlanId: string | null;
  /** Context extraction ≠ consensus or claim approval. */
  notConsensusChange: true;
  extractedClaimsNotAutoApproved: true;
  authoredBy: ContinuousEvidenceActor;
  createdAt: string;
  honesty: ContinuousEvidenceInvestigationHonesty;
  note: string;
};

export type ContradictionDetectionRecord = {
  schema: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA;
  method: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD;
  version: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION;
  id: string;
  programmeId: string;
  evidenceIdA: string;
  evidenceIdB: string;
  status: ContradictionDetectionStatus;
  summary: string;
  /** Detection ≠ adjudication or consensus change. */
  notConsensusChange: true;
  notAutoApproved: true;
  authoredBy: ContinuousEvidenceActor;
  createdAt: string;
  honesty: ContinuousEvidenceInvestigationHonesty;
  note: string;
};

export type RetractionCorrectionRecord = {
  schema: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA;
  method: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD;
  version: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION;
  id: string;
  programmeId: string;
  evidenceId: string;
  kind: RetractionCorrectionKind;
  summary: string;
  noticedAt: string;
  /** Retracted / corrected records are not valid support. */
  retractedIsNotValidSupport: true;
  validSupportAfter: false;
  authoredBy: ContinuousEvidenceActor;
  honesty: ContinuousEvidenceInvestigationHonesty;
  note: string;
};

export type EvidenceChangeRecord = {
  schema: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA;
  method: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD;
  version: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION;
  id: string;
  programmeId: string;
  evidenceId: string;
  changeKind: EvidenceChangeKind;
  summary: string;
  previousSnapshotRef: string | null;
  currentSnapshotRef: string;
  detectedAt: string;
  /** New publication / change ≠ consensus change. */
  newPublicationIsNotConsensusChange: true;
  authoredBy: ContinuousEvidenceActor;
  honesty: ContinuousEvidenceInvestigationHonesty;
  note: string;
};

export type ProgrammeImpactAssessment = {
  schema: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA;
  method: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD;
  version: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION;
  id: string;
  programmeId: string;
  subjectRefs: readonly string[];
  impactClass: ProgrammeImpactClass;
  summary: string;
  /** Impact assessment is advisory — never auto-approves claims or plans. */
  notAutoApproved: true;
  newPublicationIsNotConsensusChange: true;
  requiresHumanReview: boolean;
  authoredBy: ContinuousEvidenceActor;
  createdAt: string;
  honesty: ContinuousEvidenceInvestigationHonesty;
  note: string;
};

export type ContinuousEvidenceInvestigationStore = {
  upsertSubscription(
    subscription: ProgrammeSourceSubscription,
  ): ProgrammeSourceSubscription;
  getSubscription(id: string): ProgrammeSourceSubscription | null;
  listSubscriptions(programmeId?: string): readonly ProgrammeSourceSubscription[];
  upsertRetrieval(
    retrieval: ScheduledEvidenceRetrieval,
  ): ScheduledEvidenceRetrieval;
  getRetrieval(id: string): ScheduledEvidenceRetrieval | null;
  listRetrievals(programmeId?: string): readonly ScheduledEvidenceRetrieval[];
  upsertEvidence(item: ProgrammeEvidenceItem): ProgrammeEvidenceItem;
  getEvidence(id: string): ProgrammeEvidenceItem | null;
  listEvidence(programmeId?: string): readonly ProgrammeEvidenceItem[];
  upsertContext(
    context: EvidenceContextExtraction,
  ): EvidenceContextExtraction;
  listContexts(programmeId?: string): readonly EvidenceContextExtraction[];
  upsertContradiction(
    record: ContradictionDetectionRecord,
  ): ContradictionDetectionRecord;
  listContradictions(
    programmeId?: string,
  ): readonly ContradictionDetectionRecord[];
  upsertRetraction(
    record: RetractionCorrectionRecord,
  ): RetractionCorrectionRecord;
  listRetractions(programmeId?: string): readonly RetractionCorrectionRecord[];
  upsertChange(record: EvidenceChangeRecord): EvidenceChangeRecord;
  listChanges(programmeId?: string): readonly EvidenceChangeRecord[];
  upsertImpact(assessment: ProgrammeImpactAssessment): ProgrammeImpactAssessment;
  listImpacts(programmeId?: string): readonly ProgrammeImpactAssessment[];
};

const DEFAULT_HONESTY: ContinuousEvidenceInvestigationHonesty = {
  dependsOnPr1ScientificProgrammeContracts: true,
  dependsOnPr2ResearchObjectivePlanning: true,
  extendsM8IncrementalEvidenceMonitoring: true,
  newPublicationIsNotConsensusChange: true,
  extractedClaimsNotAutoApproved: true,
  retractedIsNotValidSupport: true,
  licencesAndLimitsRespected: true,
  snapshotsAndRetrievalTimestampsPreserved: true,
  notSeparateAgentPlatform: true,
  agentsInvestigateResearchersApprove: true,
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
  scientificKnowledgeEvolution: false,
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

function assertHonesty(honesty: ContinuousEvidenceInvestigationHonesty): void {
  if (honesty.dependsOnPr1ScientificProgrammeContracts !== true) {
    throw Error("Must depend on PR1 scientific programme contracts");
  }
  if (honesty.dependsOnPr2ResearchObjectivePlanning !== true) {
    throw Error("Must depend on PR2 research objective planning");
  }
  if (honesty.extendsM8IncrementalEvidenceMonitoring !== true) {
    throw Error("Must extend M8 incremental evidence monitoring");
  }
  if (honesty.newPublicationIsNotConsensusChange !== true) {
    throw Error("New publication must not equal consensus change");
  }
  if (honesty.extractedClaimsNotAutoApproved !== true) {
    throw Error("Extracted claims must not be auto-approved");
  }
  if (honesty.retractedIsNotValidSupport !== true) {
    throw Error("Retracted evidence must not count as valid support");
  }
  if (honesty.licencesAndLimitsRespected !== true) {
    throw Error("Licences and limits must be respected");
  }
  if (honesty.snapshotsAndRetrievalTimestampsPreserved !== true) {
    throw Error("Snapshots and retrieval timestamps must be preserved");
  }
  if (honesty.notSeparateAgentPlatform !== true) {
    throw Error("Must not invent a separate agent platform");
  }
  if (honesty.agentsInvestigateResearchersApprove !== true) {
    throw Error("Agents investigate; researchers approve");
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
  if (honesty.scientificKnowledgeEvolution !== false) {
    throw Error("Scientific knowledge evolution deferred to PR4");
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
    (/\bconsensus\s+change\b/.test(lower) &&
      !/\b(not|no|≠|!=)\s+(a\s+)?consensus\s+change\b/.test(lower) &&
      !/\bis\s+not\s+(a\s+)?consensus\s+change\b/.test(lower) &&
      !/\b≠\s*consensus\b/.test(lower) &&
      !/\band\s+not\s+(a\s+)?consensus\s+change\b/.test(lower))
  ) {
    throw Error(
      `${label} must not invent discoveries, auto-approval, self-approval, PHI/CDS directives, consensus-change claims, or live multiscale claims`,
    );
  }
}

function assertActor(
  actor: ContinuousEvidenceActor,
  label: string,
): ContinuousEvidenceActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actorKind`);
  return {
    principalId: actor.principalId.trim(),
    actorKind: actor.actorKind,
  };
}

function validateLicenceBound(
  bound: ProgrammeSourceLicenceBound,
): ProgrammeSourceLicenceBound {
  if (bound.licencesAndLimitsRespected !== true) {
    throw Error("Licences and limits must be respected");
  }
  if (bound.fullDatabaseScrape !== false) {
    throw Error("Full database scrape refused");
  }
  if (
    !Number.isInteger(bound.rateLimitMsMin) ||
    bound.rateLimitMsMin < 200 ||
    bound.rateLimitMsMin > 60_000
  ) {
    throw Error("rateLimitMsMin must be 200–60000");
  }
  if (
    !Number.isInteger(bound.maxResultsPerRun) ||
    bound.maxResultsPerRun < 1 ||
    bound.maxResultsPerRun > 100
  ) {
    throw Error("maxResultsPerRun must be 1–100");
  }
  if (!textOk(bound.note, 500)) throw Error("Invalid licenceBound note");
  return {
    licencesAndLimitsRespected: true,
    fullDatabaseScrape: false,
    rateLimitMsMin: bound.rateLimitMsMin,
    maxResultsPerRun: bound.maxResultsPerRun,
    note: bound.note.trim(),
  };
}

function validateSourceKinds(
  kinds: readonly ProgrammeEvidenceSourceKind[],
): readonly ProgrammeEvidenceSourceKind[] {
  if (kinds.length < 1 || kinds.length > 12) {
    throw Error("sourceKinds must have 1–12 entries");
  }
  const seen = new Set<string>();
  for (const kind of kinds) {
    assertClosed(kind, PROGRAMME_EVIDENCE_SOURCE_KINDS, "sourceKind");
    if (seen.has(kind)) throw Error("Duplicate sourceKind");
    seen.add(kind);
  }
  return [...kinds];
}

function toMonitoringProviderRef(
  kind: ProgrammeEvidenceSourceKind,
): MonitoringProviderRef | null {
  switch (kind) {
    case "europe_pmc":
    case "open_targets":
    case "clinicaltrials_gov":
    case "uniprot":
      return kind satisfies MonitoringLiveProvider;
    case "reactome_stub":
      return "reactome_stub";
    case "approved_omics":
    case "authorised_research_dataset":
    case "clinical_experimental_evidence_service":
      return null;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function mapProgrammeSourceToM8Provider(
  kind: ProgrammeEvidenceSourceKind,
): MonitoringProviderRef | null {
  return toMonitoringProviderRef(kind);
}

export function validateProgrammeSourceSubscription(
  subscription: ProgrammeSourceSubscription,
): ProgrammeSourceSubscription {
  if (subscription.schema !== CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA) {
    throw Error("Unexpected CEI schema");
  }
  if (subscription.method !== CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD) {
    throw Error("Unexpected CEI method");
  }
  if (subscription.version !== CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION) {
    throw Error("Unexpected CEI version");
  }
  if (!SUBSCRIPTION_ID_RE.test(subscription.id)) {
    throw Error("Invalid programme source subscription id");
  }
  if (!PROGRAMME_ID_RE.test(subscription.programmeId)) {
    throw Error("Invalid programmeId");
  }
  if (subscription.planId !== null && !PLAN_ID_RE.test(subscription.planId)) {
    throw Error("Invalid planId");
  }
  if (
    subscription.workstreamId !== null &&
    !WORKSTREAM_ID_RE.test(subscription.workstreamId)
  ) {
    throw Error("Invalid workstreamId");
  }
  if (
    subscription.m8SubscriptionId !== null &&
    !REF_ID_RE.test(subscription.m8SubscriptionId)
  ) {
    throw Error("Invalid m8SubscriptionId");
  }
  if (!textOk(subscription.topicLabel, 200)) {
    throw Error("Invalid topicLabel");
  }
  assertNoForbiddenClaimLanguage(subscription.topicLabel, "topicLabel");
  const sourceKinds = validateSourceKinds(subscription.sourceKinds);
  assertClosed(
    subscription.scheduleInterval,
    MONITORING_SCHEDULE_INTERVALS,
    "scheduleInterval",
  );
  if (
    subscription.nextRetrievalAt !== null &&
    !isIsoTimestamp(subscription.nextRetrievalAt)
  ) {
    throw Error("Invalid nextRetrievalAt");
  }
  const licenceBound = validateLicenceBound(subscription.licenceBound);
  assertClosed(
    subscription.lifecycle,
    PROGRAMME_SUBSCRIPTION_LIFECYCLES,
    "subscription lifecycle",
  );
  const authoredBy = assertActor(subscription.authoredBy, "subscription author");
  assertClosed(subscription.dataBasis, DATA_BASES, "dataBasis");
  if (subscription.fixtureHonesty !== true && subscription.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(subscription.honesty);
  if (!isIsoTimestamp(subscription.createdAt)) throw Error("Invalid createdAt");
  if (!isIsoTimestamp(subscription.updatedAt)) throw Error("Invalid updatedAt");
  if (!textOk(subscription.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(subscription.note, "subscription note");

  // Live-capable M8 providers must remain listed for composition honesty.
  for (const kind of sourceKinds) {
    const mapped = toMonitoringProviderRef(kind);
    if (
      mapped !== null &&
      mapped !== "reactome_stub" &&
      !(MONITORING_LIVE_PROVIDERS as readonly string[]).includes(mapped)
    ) {
      throw Error(`Unknown live provider mapping for ${kind}`);
    }
  }

  return {
    ...subscription,
    topicLabel: subscription.topicLabel.trim(),
    sourceKinds,
    licenceBound,
    authoredBy,
    note: subscription.note.trim(),
  };
}

export function draftProgrammeSourceSubscription(input: {
  id: string;
  programmeId: string;
  topicLabel: string;
  sourceKinds: readonly ProgrammeEvidenceSourceKind[];
  scheduleInterval: MonitoringScheduleInterval;
  authoredByPrincipalId: string;
  authoredByActorKind?: ContinuousEvidenceActorKind;
  createdAt: string;
  planId?: string | null;
  workstreamId?: string | null;
  m8SubscriptionId?: string | null;
  nextRetrievalAt?: string | null;
  licenceBound?: Partial<ProgrammeSourceLicenceBound>;
  dataBasis?: ContinuousEvidenceDataBasis;
  note?: string;
}): ProgrammeSourceSubscription {
  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "human",
    },
    "subscription author",
  );
  if (authoredBy.actorKind === "ai_agent") {
    // Agents may draft subscriptions; humans activate.
  }
  const licenceBound = validateLicenceBound({
    licencesAndLimitsRespected: true,
    fullDatabaseScrape: false,
    rateLimitMsMin: input.licenceBound?.rateLimitMsMin ?? 1000,
    maxResultsPerRun: input.licenceBound?.maxResultsPerRun ?? 20,
    note:
      input.licenceBound?.note ??
      "Respect provider licences, rate limits, and bounded budgets — no full-DB scrape.",
  });

  return validateProgrammeSourceSubscription({
    schema: CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA,
    method: CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD,
    version: CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION,
    id: input.id,
    programmeId: input.programmeId,
    planId: input.planId ?? null,
    workstreamId: input.workstreamId ?? null,
    m8SubscriptionId: input.m8SubscriptionId ?? null,
    topicLabel: input.topicLabel,
    sourceKinds: input.sourceKinds,
    scheduleInterval: input.scheduleInterval,
    nextRetrievalAt: input.nextRetrievalAt ?? null,
    licenceBound,
    lifecycle: "draft",
    authoredBy,
    dataBasis: input.dataBasis ?? "fixture_engineering",
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note:
      input.note ??
      "Programme-scoped source subscription — extends M8; fixtures ≠ live; new hits ≠ consensus.",
  });
}

export function activateProgrammeSourceSubscription(input: {
  subscription: ProgrammeSourceSubscription;
  updatedAt: string;
  actor: ContinuousEvidenceActor;
  nextRetrievalAt?: string | null;
}): ProgrammeSourceSubscription {
  const current = validateProgrammeSourceSubscription(input.subscription);
  if (current.lifecycle !== "draft" && current.lifecycle !== "paused") {
    throw Error("Only draft or paused subscriptions may be activated");
  }
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "activate actor");
  if (actor.actorKind !== "human") {
    throw Error("Only human researchers may activate programme source subscriptions");
  }
  if (
    input.nextRetrievalAt !== undefined &&
    input.nextRetrievalAt !== null &&
    !isIsoTimestamp(input.nextRetrievalAt)
  ) {
    throw Error("Invalid nextRetrievalAt");
  }
  return validateProgrammeSourceSubscription({
    ...current,
    lifecycle: "active",
    nextRetrievalAt:
      input.nextRetrievalAt !== undefined
        ? input.nextRetrievalAt
        : current.nextRetrievalAt,
    updatedAt: input.updatedAt,
  });
}

export function validateScheduledEvidenceRetrieval(
  retrieval: ScheduledEvidenceRetrieval,
): ScheduledEvidenceRetrieval {
  if (retrieval.schema !== CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA) {
    throw Error("Unexpected CEI schema");
  }
  if (retrieval.method !== CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD) {
    throw Error("Unexpected CEI method");
  }
  if (retrieval.version !== CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION) {
    throw Error("Unexpected CEI version");
  }
  if (!RETRIEVAL_ID_RE.test(retrieval.id)) {
    throw Error("Invalid scheduled retrieval id");
  }
  if (!SUBSCRIPTION_ID_RE.test(retrieval.subscriptionId)) {
    throw Error("Invalid subscriptionId");
  }
  if (!PROGRAMME_ID_RE.test(retrieval.programmeId)) {
    throw Error("Invalid programmeId");
  }
  assertClosed(retrieval.status, SCHEDULED_RETRIEVAL_STATUSES, "retrieval status");
  if (!isIsoTimestamp(retrieval.scheduledAt)) throw Error("Invalid scheduledAt");
  if (retrieval.startedAt !== null && !isIsoTimestamp(retrieval.startedAt)) {
    throw Error("Invalid startedAt");
  }
  if (retrieval.completedAt !== null && !isIsoTimestamp(retrieval.completedAt)) {
    throw Error("Invalid completedAt");
  }
  if (retrieval.retrievedAt !== null && !isIsoTimestamp(retrieval.retrievedAt)) {
    throw Error("Invalid retrievedAt");
  }
  const sourceKinds = validateSourceKinds(retrieval.sourceKindsAttempted);
  if (
    !Number.isInteger(retrieval.hitCountBounded) ||
    retrieval.hitCountBounded < 0 ||
    retrieval.hitCountBounded > 500
  ) {
    throw Error("hitCountBounded must be 0–500");
  }
  if (typeof retrieval.truncatedByBudget !== "boolean") {
    throw Error("Invalid truncatedByBudget");
  }
  if (typeof retrieval.liveNetworkUsed !== "boolean") {
    throw Error("Invalid liveNetworkUsed");
  }
  if (typeof retrieval.offlineFixture !== "boolean") {
    throw Error("Invalid offlineFixture");
  }
  if (retrieval.liveNetworkUsed && retrieval.offlineFixture) {
    throw Error("Cannot claim both liveNetworkUsed and offlineFixture");
  }
  if (
    retrieval.snapshotRef !== null &&
    !textOk(retrieval.snapshotRef, 200)
  ) {
    throw Error("Invalid snapshotRef");
  }
  if (
    (retrieval.status === "completed_bounded" ||
      retrieval.status === "running_fixture") &&
    retrieval.retrievedAt === null
  ) {
    throw Error("completed/running retrievals must preserve retrievedAt");
  }
  if (
    retrieval.status === "completed_bounded" &&
    retrieval.snapshotRef === null
  ) {
    throw Error("completed retrievals must preserve snapshotRef");
  }
  const authoredBy = assertActor(retrieval.authoredBy, "retrieval author");
  assertHonesty(retrieval.honesty);
  if (!textOk(retrieval.note, 1000)) throw Error("Invalid retrieval note");
  assertNoForbiddenClaimLanguage(retrieval.note, "retrieval note");
  return {
    ...retrieval,
    sourceKindsAttempted: sourceKinds,
    authoredBy,
    note: retrieval.note.trim(),
  };
}

export function recordScheduledEvidenceRetrieval(input: {
  id: string;
  subscription: ProgrammeSourceSubscription;
  status: ScheduledRetrievalStatus;
  scheduledAt: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ContinuousEvidenceActorKind;
  startedAt?: string | null;
  completedAt?: string | null;
  retrievedAt?: string | null;
  hitCountBounded?: number;
  truncatedByBudget?: boolean;
  liveNetworkUsed?: boolean;
  offlineFixture?: boolean;
  snapshotRef?: string | null;
  note?: string;
}): ScheduledEvidenceRetrieval {
  const subscription = validateProgrammeSourceSubscription(input.subscription);
  if (subscription.lifecycle !== "active") {
    throw Error("Scheduled retrieval requires an active subscription");
  }
  return validateScheduledEvidenceRetrieval({
    schema: CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA,
    method: CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD,
    version: CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION,
    id: input.id,
    subscriptionId: subscription.id,
    programmeId: subscription.programmeId,
    status: input.status,
    scheduledAt: input.scheduledAt,
    startedAt: input.startedAt ?? null,
    completedAt: input.completedAt ?? null,
    retrievedAt: input.retrievedAt ?? null,
    sourceKindsAttempted: subscription.sourceKinds,
    hitCountBounded: input.hitCountBounded ?? 0,
    truncatedByBudget: input.truncatedByBudget ?? false,
    liveNetworkUsed: input.liveNetworkUsed ?? false,
    offlineFixture: input.offlineFixture ?? true,
    snapshotRef: input.snapshotRef ?? null,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "service",
    },
    honesty: {...DEFAULT_HONESTY},
    note:
      input.note ??
      "Bounded scheduled retrieval — preserves snapshot + timestamp; not consensus change.",
  });
}

function evidenceKeyFor(
  sourceKind: ProgrammeEvidenceSourceKind,
  externalId: string,
): string {
  return `${sourceKind}:${externalId.trim()}`;
}

export function validateProgrammeEvidenceItem(
  item: ProgrammeEvidenceItem,
): ProgrammeEvidenceItem {
  if (item.schema !== CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA) {
    throw Error("Unexpected CEI schema");
  }
  if (item.method !== CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD) {
    throw Error("Unexpected CEI method");
  }
  if (item.version !== CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION) {
    throw Error("Unexpected CEI version");
  }
  if (!EVIDENCE_ID_RE.test(item.id)) throw Error("Invalid evidence id");
  if (!PROGRAMME_ID_RE.test(item.programmeId)) throw Error("Invalid programmeId");
  if (!SUBSCRIPTION_ID_RE.test(item.subscriptionId)) {
    throw Error("Invalid subscriptionId");
  }
  if (!RETRIEVAL_ID_RE.test(item.retrievalId)) throw Error("Invalid retrievalId");
  assertClosed(item.sourceKind, PROGRAMME_EVIDENCE_SOURCE_KINDS, "sourceKind");
  if (!textOk(item.evidenceKey, 200)) throw Error("Invalid evidenceKey");
  if (!textOk(item.externalId, 120)) throw Error("Invalid externalId");
  if (!textOk(item.title, 500)) throw Error("Invalid title");
  assertNoForbiddenClaimLanguage(item.title, "evidence title");
  assertClosed(
    item.classification,
    EVIDENCE_CLASSIFICATION_KINDS,
    "classification",
  );
  assertClosed(
    item.sourceIdentityState,
    SOURCE_IDENTITY_VERIFICATION_STATES,
    "sourceIdentityState",
  );
  if (
    item.extractedClaimSummary !== null &&
    !textOk(item.extractedClaimSummary, 1000)
  ) {
    throw Error("Invalid extractedClaimSummary");
  }
  if (item.extractedClaimSummary !== null) {
    assertNoForbiddenClaimLanguage(
      item.extractedClaimSummary,
      "extractedClaimSummary",
    );
  }
  if (item.extractedClaimsNotAutoApproved !== true) {
    throw Error("Extracted claims must not be auto-approved");
  }
  if (
    item.duplicateOfEvidenceId !== null &&
    !EVIDENCE_ID_RE.test(item.duplicateOfEvidenceId)
  ) {
    throw Error("Invalid duplicateOfEvidenceId");
  }
  if (typeof item.duplicateOfPrior !== "boolean") {
    throw Error("Invalid duplicateOfPrior");
  }
  if (typeof item.retractedOrCorrected !== "boolean") {
    throw Error("Invalid retractedOrCorrected");
  }
  if (item.retractedOrCorrected) {
    if (item.validSupport !== false) {
      throw Error("Retracted evidence must not count as valid support");
    }
  } else if (item.validSupport !== false && item.validSupport !== "not_assessed") {
    throw Error("Invalid validSupport");
  }
  if (!textOk(item.snapshotRef, 200)) throw Error("Invalid snapshotRef");
  if (!isIsoTimestamp(item.retrievedAt)) throw Error("Invalid retrievedAt");
  if (!isIsoTimestamp(item.createdAt)) throw Error("Invalid createdAt");
  if (!isIsoTimestamp(item.updatedAt)) throw Error("Invalid updatedAt");
  assertHonesty(item.honesty);
  if (!textOk(item.note, 1000)) throw Error("Invalid evidence note");
  return {
    ...item,
    evidenceKey: item.evidenceKey.trim(),
    externalId: item.externalId.trim(),
    title: item.title.trim(),
    extractedClaimSummary: item.extractedClaimSummary?.trim() ?? null,
    snapshotRef: item.snapshotRef.trim(),
    note: item.note.trim(),
  };
}

/**
 * Ingest a retrieved evidence item with deduplication against prior keys.
 * Deduped rows remain non-promotable and claims stay unapproved.
 */
export function ingestProgrammeEvidenceItem(input: {
  id: string;
  subscription: ProgrammeSourceSubscription;
  retrieval: ScheduledEvidenceRetrieval;
  sourceKind: ProgrammeEvidenceSourceKind;
  externalId: string;
  title: string;
  classification: EvidenceClassificationKind;
  sourceIdentityState?: SourceIdentityVerificationState;
  extractedClaimSummary?: string | null;
  priorEvidence: readonly ProgrammeEvidenceItem[];
  snapshotRef: string;
  retrievedAt: string;
  createdAt: string;
  note?: string;
}): ProgrammeEvidenceItem {
  const subscription = validateProgrammeSourceSubscription(input.subscription);
  const retrieval = validateScheduledEvidenceRetrieval(input.retrieval);
  if (retrieval.subscriptionId !== subscription.id) {
    throw Error("Retrieval subscription mismatch");
  }
  if (retrieval.programmeId !== subscription.programmeId) {
    throw Error("Retrieval programme mismatch");
  }
  if (!subscription.sourceKinds.includes(input.sourceKind)) {
    throw Error("sourceKind not on subscription");
  }
  if (!retrieval.sourceKindsAttempted.includes(input.sourceKind)) {
    throw Error("sourceKind not attempted on retrieval");
  }

  const evidenceKey = evidenceKeyFor(input.sourceKind, input.externalId);
  const prior = input.priorEvidence
    .map(validateProgrammeEvidenceItem)
    .find(
      (row) =>
        row.programmeId === subscription.programmeId &&
        row.evidenceKey === evidenceKey,
    );

  return validateProgrammeEvidenceItem({
    schema: CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA,
    method: CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD,
    version: CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION,
    id: input.id,
    programmeId: subscription.programmeId,
    subscriptionId: subscription.id,
    retrievalId: retrieval.id,
    sourceKind: input.sourceKind,
    evidenceKey,
    externalId: input.externalId,
    title: input.title,
    classification: input.classification,
    sourceIdentityState: input.sourceIdentityState ?? "not_assessed",
    extractedClaimSummary: input.extractedClaimSummary ?? null,
    extractedClaimsNotAutoApproved: true,
    duplicateOfEvidenceId: prior?.id ?? null,
    duplicateOfPrior: prior !== undefined,
    retractedOrCorrected: false,
    validSupport: "not_assessed",
    snapshotRef: input.snapshotRef,
    retrievedAt: input.retrievedAt,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    honesty: {...DEFAULT_HONESTY},
    note:
      input.note ??
      (prior
        ? "Deduplicated against prior programme evidence key — duplicate ≠ new consensus."
        : "Ingested programme evidence item — extracted claims not auto-approved."),
  });
}

export function verifyProgrammeEvidenceSourceIdentity(input: {
  evidence: ProgrammeEvidenceItem;
  state: SourceIdentityVerificationState;
  updatedAt: string;
  note?: string;
}): ProgrammeEvidenceItem {
  const current = validateProgrammeEvidenceItem(input.evidence);
  assertClosed(input.state, SOURCE_IDENTITY_VERIFICATION_STATES, "state");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  if (input.state === "invalid" && current.validSupport === "not_assessed") {
    // Invalid identity cannot become claim support.
  }
  return validateProgrammeEvidenceItem({
    ...current,
    sourceIdentityState: input.state,
    updatedAt: input.updatedAt,
    note:
      input.note ??
      `Source identity verification → ${input.state}; identity ≠ claim support.`,
  });
}

export function classifyProgrammeEvidence(input: {
  evidence: ProgrammeEvidenceItem;
  classification: EvidenceClassificationKind;
  updatedAt: string;
  note?: string;
}): ProgrammeEvidenceItem {
  const current = validateProgrammeEvidenceItem(input.evidence);
  assertClosed(
    input.classification,
    EVIDENCE_CLASSIFICATION_KINDS,
    "classification",
  );
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  return validateProgrammeEvidenceItem({
    ...current,
    classification: input.classification,
    updatedAt: input.updatedAt,
    extractedClaimsNotAutoApproved: true,
    note:
      input.note ??
      `Classified as ${input.classification} — classification ≠ claim approval.`,
  });
}

export function validateEvidenceContextExtraction(
  context: EvidenceContextExtraction,
): EvidenceContextExtraction {
  if (context.schema !== CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA) {
    throw Error("Unexpected CEI schema");
  }
  if (!CONTEXT_ID_RE.test(context.id)) throw Error("Invalid context id");
  if (!EVIDENCE_ID_RE.test(context.evidenceId)) throw Error("Invalid evidenceId");
  if (!PROGRAMME_ID_RE.test(context.programmeId)) throw Error("Invalid programmeId");
  if (!textOk(context.contextSummary, 2000)) {
    throw Error("Invalid contextSummary");
  }
  assertNoForbiddenClaimLanguage(context.contextSummary, "contextSummary");
  if (context.relatedWorkstreamIds.length > 20) {
    throw Error("Too many relatedWorkstreamIds");
  }
  for (const id of context.relatedWorkstreamIds) {
    if (!WORKSTREAM_ID_RE.test(id)) throw Error("Invalid relatedWorkstreamId");
  }
  if (context.relatedPlanId !== null && !PLAN_ID_RE.test(context.relatedPlanId)) {
    throw Error("Invalid relatedPlanId");
  }
  if (context.notConsensusChange !== true) {
    throw Error("Context extraction must not claim consensus change");
  }
  if (context.extractedClaimsNotAutoApproved !== true) {
    throw Error("Extracted claims must not be auto-approved");
  }
  const authoredBy = assertActor(context.authoredBy, "context author");
  if (!isIsoTimestamp(context.createdAt)) throw Error("Invalid createdAt");
  assertHonesty(context.honesty);
  if (!textOk(context.note, 1000)) throw Error("Invalid context note");
  return {
    ...context,
    contextSummary: context.contextSummary.trim(),
    relatedWorkstreamIds: [...context.relatedWorkstreamIds],
    authoredBy,
    note: context.note.trim(),
  };
}

export function extractEvidenceContext(input: {
  id: string;
  evidence: ProgrammeEvidenceItem;
  contextSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ContinuousEvidenceActorKind;
  createdAt: string;
  relatedWorkstreamIds?: readonly string[];
  relatedPlanId?: string | null;
  note?: string;
}): EvidenceContextExtraction {
  const evidence = validateProgrammeEvidenceItem(input.evidence);
  return validateEvidenceContextExtraction({
    schema: CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA,
    method: CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD,
    version: CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION,
    id: input.id,
    evidenceId: evidence.id,
    programmeId: evidence.programmeId,
    contextSummary: input.contextSummary,
    relatedWorkstreamIds: input.relatedWorkstreamIds ?? [],
    relatedPlanId: input.relatedPlanId ?? null,
    notConsensusChange: true,
    extractedClaimsNotAutoApproved: true,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    createdAt: input.createdAt,
    honesty: {...DEFAULT_HONESTY},
    note:
      input.note ??
      "Context extraction for human review — not consensus change; claims not auto-approved.",
  });
}

export function validateContradictionDetectionRecord(
  record: ContradictionDetectionRecord,
): ContradictionDetectionRecord {
  if (record.schema !== CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA) {
    throw Error("Unexpected CEI schema");
  }
  if (!CONTRADICTION_ID_RE.test(record.id)) {
    throw Error("Invalid contradiction id");
  }
  if (!PROGRAMME_ID_RE.test(record.programmeId)) throw Error("Invalid programmeId");
  if (!EVIDENCE_ID_RE.test(record.evidenceIdA)) throw Error("Invalid evidenceIdA");
  if (!EVIDENCE_ID_RE.test(record.evidenceIdB)) throw Error("Invalid evidenceIdB");
  if (record.evidenceIdA === record.evidenceIdB) {
    throw Error("Contradiction requires two distinct evidence ids");
  }
  assertClosed(record.status, CONTRADICTION_DETECTION_STATUSES, "status");
  if (!textOk(record.summary, 2000)) throw Error("Invalid contradiction summary");
  assertNoForbiddenClaimLanguage(record.summary, "contradiction summary");
  if (record.notConsensusChange !== true) {
    throw Error("Contradiction detection must not claim consensus change");
  }
  if (record.notAutoApproved !== true) {
    throw Error("Contradiction detection must not auto-approve");
  }
  const authoredBy = assertActor(record.authoredBy, "contradiction author");
  if (!isIsoTimestamp(record.createdAt)) throw Error("Invalid createdAt");
  assertHonesty(record.honesty);
  if (!textOk(record.note, 1000)) throw Error("Invalid contradiction note");
  return {
    ...record,
    summary: record.summary.trim(),
    authoredBy,
    note: record.note.trim(),
  };
}

export function detectProgrammeEvidenceContradiction(input: {
  id: string;
  evidenceA: ProgrammeEvidenceItem;
  evidenceB: ProgrammeEvidenceItem;
  status: ContradictionDetectionStatus;
  summary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ContinuousEvidenceActorKind;
  createdAt: string;
  note?: string;
}): ContradictionDetectionRecord {
  const a = validateProgrammeEvidenceItem(input.evidenceA);
  const b = validateProgrammeEvidenceItem(input.evidenceB);
  if (a.programmeId !== b.programmeId) {
    throw Error("Contradiction evidence must share programmeId");
  }
  return validateContradictionDetectionRecord({
    schema: CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA,
    method: CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD,
    version: CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION,
    id: input.id,
    programmeId: a.programmeId,
    evidenceIdA: a.id,
    evidenceIdB: b.id,
    status: input.status,
    summary: input.summary,
    notConsensusChange: true,
    notAutoApproved: true,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    createdAt: input.createdAt,
    honesty: {...DEFAULT_HONESTY},
    note:
      input.note ??
      "Contradiction candidate recorded for human review — detection ≠ adjudication.",
  });
}

export function validateRetractionCorrectionRecord(
  record: RetractionCorrectionRecord,
): RetractionCorrectionRecord {
  if (record.schema !== CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA) {
    throw Error("Unexpected CEI schema");
  }
  if (!RETRACTION_ID_RE.test(record.id)) throw Error("Invalid retraction id");
  if (!PROGRAMME_ID_RE.test(record.programmeId)) throw Error("Invalid programmeId");
  if (!EVIDENCE_ID_RE.test(record.evidenceId)) throw Error("Invalid evidenceId");
  assertClosed(record.kind, RETRACTION_CORRECTION_KINDS, "retraction kind");
  if (!textOk(record.summary, 2000)) throw Error("Invalid retraction summary");
  assertNoForbiddenClaimLanguage(record.summary, "retraction summary");
  if (!isIsoTimestamp(record.noticedAt)) throw Error("Invalid noticedAt");
  if (record.retractedIsNotValidSupport !== true) {
    throw Error("Retracted must not be valid support");
  }
  if (record.validSupportAfter !== false) {
    throw Error("validSupportAfter must be false after retraction/correction");
  }
  const authoredBy = assertActor(record.authoredBy, "retraction author");
  assertHonesty(record.honesty);
  if (!textOk(record.note, 1000)) throw Error("Invalid retraction note");
  return {
    ...record,
    summary: record.summary.trim(),
    authoredBy,
    note: record.note.trim(),
  };
}

export function recordRetractionOrCorrection(input: {
  id: string;
  evidence: ProgrammeEvidenceItem;
  kind: RetractionCorrectionKind;
  summary: string;
  noticedAt: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ContinuousEvidenceActorKind;
  note?: string;
}): {record: RetractionCorrectionRecord; evidence: ProgrammeEvidenceItem} {
  const evidence = validateProgrammeEvidenceItem(input.evidence);
  const record = validateRetractionCorrectionRecord({
    schema: CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA,
    method: CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD,
    version: CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION,
    id: input.id,
    programmeId: evidence.programmeId,
    evidenceId: evidence.id,
    kind: input.kind,
    summary: input.summary,
    noticedAt: input.noticedAt,
    retractedIsNotValidSupport: true,
    validSupportAfter: false,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "service",
    },
    honesty: {...DEFAULT_HONESTY},
    note:
      input.note ??
      "Retraction/correction noticed — retracted evidence is not valid support.",
  });
  const updated = validateProgrammeEvidenceItem({
    ...evidence,
    retractedOrCorrected: true,
    validSupport: false,
    updatedAt: input.noticedAt,
    note: `Marked after ${input.kind}; retracted ≠ valid support.`,
  });
  return {record, evidence: updated};
}

export function validateEvidenceChangeRecord(
  record: EvidenceChangeRecord,
): EvidenceChangeRecord {
  if (record.schema !== CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA) {
    throw Error("Unexpected CEI schema");
  }
  if (!CHANGE_ID_RE.test(record.id)) throw Error("Invalid change id");
  if (!PROGRAMME_ID_RE.test(record.programmeId)) throw Error("Invalid programmeId");
  if (!EVIDENCE_ID_RE.test(record.evidenceId)) throw Error("Invalid evidenceId");
  assertClosed(record.changeKind, EVIDENCE_CHANGE_KINDS, "changeKind");
  if (!textOk(record.summary, 2000)) throw Error("Invalid change summary");
  assertNoForbiddenClaimLanguage(record.summary, "change summary");
  if (
    record.previousSnapshotRef !== null &&
    !textOk(record.previousSnapshotRef, 200)
  ) {
    throw Error("Invalid previousSnapshotRef");
  }
  if (!textOk(record.currentSnapshotRef, 200)) {
    throw Error("Invalid currentSnapshotRef");
  }
  if (!isIsoTimestamp(record.detectedAt)) throw Error("Invalid detectedAt");
  if (record.newPublicationIsNotConsensusChange !== true) {
    throw Error("New publication must not equal consensus change");
  }
  const authoredBy = assertActor(record.authoredBy, "change author");
  assertHonesty(record.honesty);
  if (!textOk(record.note, 1000)) throw Error("Invalid change note");
  return {
    ...record,
    summary: record.summary.trim(),
    previousSnapshotRef: record.previousSnapshotRef?.trim() ?? null,
    currentSnapshotRef: record.currentSnapshotRef.trim(),
    authoredBy,
    note: record.note.trim(),
  };
}

export function detectEvidenceChange(input: {
  id: string;
  evidence: ProgrammeEvidenceItem;
  changeKind: EvidenceChangeKind;
  summary: string;
  previousSnapshotRef: string | null;
  currentSnapshotRef: string;
  detectedAt: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ContinuousEvidenceActorKind;
  note?: string;
}): EvidenceChangeRecord {
  const evidence = validateProgrammeEvidenceItem(input.evidence);
  return validateEvidenceChangeRecord({
    schema: CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA,
    method: CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD,
    version: CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION,
    id: input.id,
    programmeId: evidence.programmeId,
    evidenceId: evidence.id,
    changeKind: input.changeKind,
    summary: input.summary,
    previousSnapshotRef: input.previousSnapshotRef,
    currentSnapshotRef: input.currentSnapshotRef,
    detectedAt: input.detectedAt,
    newPublicationIsNotConsensusChange: true,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "service",
    },
    honesty: {...DEFAULT_HONESTY},
    note:
      input.note ??
      "Evidence change detected — new publication ≠ consensus change; snapshots preserved.",
  });
}

export function validateProgrammeImpactAssessment(
  assessment: ProgrammeImpactAssessment,
): ProgrammeImpactAssessment {
  if (assessment.schema !== CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA) {
    throw Error("Unexpected CEI schema");
  }
  if (!IMPACT_ID_RE.test(assessment.id)) throw Error("Invalid impact id");
  if (!PROGRAMME_ID_RE.test(assessment.programmeId)) {
    throw Error("Invalid programmeId");
  }
  if (assessment.subjectRefs.length < 1 || assessment.subjectRefs.length > 40) {
    throw Error("subjectRefs must have 1–40 entries");
  }
  for (const ref of assessment.subjectRefs) {
    if (!REF_ID_RE.test(ref)) throw Error("Invalid subjectRef");
  }
  assertClosed(assessment.impactClass, PROGRAMME_IMPACT_CLASSES, "impactClass");
  if (!textOk(assessment.summary, 2000)) throw Error("Invalid impact summary");
  assertNoForbiddenClaimLanguage(assessment.summary, "impact summary");
  if (assessment.notAutoApproved !== true) {
    throw Error("Impact assessment must not auto-approve");
  }
  if (assessment.newPublicationIsNotConsensusChange !== true) {
    throw Error("Impact must not treat new publication as consensus change");
  }
  if (typeof assessment.requiresHumanReview !== "boolean") {
    throw Error("Invalid requiresHumanReview");
  }
  if (
    (assessment.impactClass === "may_affect_workstream_priority" ||
      assessment.impactClass === "may_affect_evidence_gap" ||
      assessment.impactClass === "requires_human_review") &&
    assessment.requiresHumanReview !== true
  ) {
    throw Error("Material impact classes require human review");
  }
  const authoredBy = assertActor(assessment.authoredBy, "impact author");
  if (!isIsoTimestamp(assessment.createdAt)) throw Error("Invalid createdAt");
  assertHonesty(assessment.honesty);
  if (!textOk(assessment.note, 1000)) throw Error("Invalid impact note");
  return {
    ...assessment,
    subjectRefs: [...assessment.subjectRefs],
    summary: assessment.summary.trim(),
    authoredBy,
    note: assessment.note.trim(),
  };
}

export function assessProgrammeEvidenceImpact(input: {
  id: string;
  programmeId: string;
  subjectRefs: readonly string[];
  impactClass: ProgrammeImpactClass;
  summary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ContinuousEvidenceActorKind;
  createdAt: string;
  requiresHumanReview?: boolean;
  note?: string;
}): ProgrammeImpactAssessment {
  if (!PROGRAMME_ID_RE.test(input.programmeId)) {
    throw Error("Invalid programmeId");
  }
  const requiresHumanReview =
    input.requiresHumanReview ??
    (input.impactClass === "may_affect_workstream_priority" ||
      input.impactClass === "may_affect_evidence_gap" ||
      input.impactClass === "requires_human_review");

  return validateProgrammeImpactAssessment({
    schema: CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA,
    method: CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD,
    version: CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION,
    id: input.id,
    programmeId: input.programmeId,
    subjectRefs: input.subjectRefs,
    impactClass: input.impactClass,
    summary: input.summary,
    notAutoApproved: true,
    newPublicationIsNotConsensusChange: true,
    requiresHumanReview,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    createdAt: input.createdAt,
    honesty: {...DEFAULT_HONESTY},
    note:
      input.note ??
      "Programme impact assessment is advisory — not auto-approval and not consensus change.",
  });
}

export function createMemoryContinuousEvidenceInvestigationStore(): ContinuousEvidenceInvestigationStore & {
  subscriptions: Map<string, ProgrammeSourceSubscription>;
  retrievals: Map<string, ScheduledEvidenceRetrieval>;
  evidence: Map<string, ProgrammeEvidenceItem>;
  contexts: Map<string, EvidenceContextExtraction>;
  contradictions: Map<string, ContradictionDetectionRecord>;
  retractions: Map<string, RetractionCorrectionRecord>;
  changes: Map<string, EvidenceChangeRecord>;
  impacts: Map<string, ProgrammeImpactAssessment>;
} {
  const subscriptions = new Map<string, ProgrammeSourceSubscription>();
  const retrievals = new Map<string, ScheduledEvidenceRetrieval>();
  const evidence = new Map<string, ProgrammeEvidenceItem>();
  const contexts = new Map<string, EvidenceContextExtraction>();
  const contradictions = new Map<string, ContradictionDetectionRecord>();
  const retractions = new Map<string, RetractionCorrectionRecord>();
  const changes = new Map<string, EvidenceChangeRecord>();
  const impacts = new Map<string, ProgrammeImpactAssessment>();

  return {
    subscriptions,
    retrievals,
    evidence,
    contexts,
    contradictions,
    retractions: retractions,
    changes,
    impacts,
    upsertSubscription(subscription) {
      const validated = validateProgrammeSourceSubscription(subscription);
      subscriptions.set(validated.id, validated);
      return validated;
    },
    getSubscription(id) {
      return subscriptions.get(id) ?? null;
    },
    listSubscriptions(programmeId) {
      const all = [...subscriptions.values()];
      return programmeId
        ? all.filter((s) => s.programmeId === programmeId)
        : all;
    },
    upsertRetrieval(retrieval) {
      const validated = validateScheduledEvidenceRetrieval(retrieval);
      retrievals.set(validated.id, validated);
      return validated;
    },
    getRetrieval(id) {
      return retrievals.get(id) ?? null;
    },
    listRetrievals(programmeId) {
      const all = [...retrievals.values()];
      return programmeId
        ? all.filter((r) => r.programmeId === programmeId)
        : all;
    },
    upsertEvidence(item) {
      const validated = validateProgrammeEvidenceItem(item);
      evidence.set(validated.id, validated);
      return validated;
    },
    getEvidence(id) {
      return evidence.get(id) ?? null;
    },
    listEvidence(programmeId) {
      const all = [...evidence.values()];
      return programmeId
        ? all.filter((e) => e.programmeId === programmeId)
        : all;
    },
    upsertContext(context) {
      const validated = validateEvidenceContextExtraction(context);
      contexts.set(validated.id, validated);
      return validated;
    },
    listContexts(programmeId) {
      const all = [...contexts.values()];
      return programmeId
        ? all.filter((c) => c.programmeId === programmeId)
        : all;
    },
    upsertContradiction(record) {
      const validated = validateContradictionDetectionRecord(record);
      contradictions.set(validated.id, validated);
      return validated;
    },
    listContradictions(programmeId) {
      const all = [...contradictions.values()];
      return programmeId
        ? all.filter((c) => c.programmeId === programmeId)
        : all;
    },
    upsertRetraction(record) {
      const validated = validateRetractionCorrectionRecord(record);
      retractions.set(validated.id, validated);
      return validated;
    },
    listRetractions(programmeId) {
      const all = [...retractions.values()];
      return programmeId
        ? all.filter((r) => r.programmeId === programmeId)
        : all;
    },
    upsertChange(record) {
      const validated = validateEvidenceChangeRecord(record);
      changes.set(validated.id, validated);
      return validated;
    },
    listChanges(programmeId) {
      const all = [...changes.values()];
      return programmeId
        ? all.filter((c) => c.programmeId === programmeId)
        : all;
    },
    upsertImpact(assessment) {
      const validated = validateProgrammeImpactAssessment(assessment);
      impacts.set(validated.id, validated);
      return validated;
    },
    listImpacts(programmeId) {
      const all = [...impacts.values()];
      return programmeId
        ? all.filter((i) => i.programmeId === programmeId)
        : all;
    },
  };
}

export function projectContinuousEvidenceInvestigationPersistenceLines(input: {
  subscription: ProgrammeSourceSubscription;
  retrieval?: ScheduledEvidenceRetrieval | null;
  evidence?: readonly ProgrammeEvidenceItem[];
  contexts?: readonly EvidenceContextExtraction[];
  contradictions?: readonly ContradictionDetectionRecord[];
  retractions?: readonly RetractionCorrectionRecord[];
  changes?: readonly EvidenceChangeRecord[];
  impacts?: readonly ProgrammeImpactAssessment[];
}): string[] {
  const subscription = validateProgrammeSourceSubscription(input.subscription);
  const retrieval = input.retrieval
    ? validateScheduledEvidenceRetrieval(input.retrieval)
    : null;
  const evidenceItems = (input.evidence ?? []).map(validateProgrammeEvidenceItem);
  const contexts = (input.contexts ?? []).map(validateEvidenceContextExtraction);
  const contradictions = (input.contradictions ?? []).map(
    validateContradictionDetectionRecord,
  );
  const retractions = (input.retractions ?? []).map(
    validateRetractionCorrectionRecord,
  );
  const changes = (input.changes ?? []).map(validateEvidenceChangeRecord);
  const impacts = (input.impacts ?? []).map(validateProgrammeImpactAssessment);

  return [
    `schema=${subscription.schema}`,
    `method=${subscription.method}`,
    `version=${subscription.version}`,
    `programmeId=${subscription.programmeId}`,
    `subscriptionId=${subscription.id}`,
    `subscriptionLifecycle=${subscription.lifecycle}`,
    `sourceKindCount=${subscription.sourceKinds.length}`,
    `scheduleInterval=${subscription.scheduleInterval}`,
    `retrievalId=${retrieval?.id ?? "none"}`,
    `retrievalStatus=${retrieval?.status ?? "none"}`,
    `retrievedAt=${retrieval?.retrievedAt ?? "none"}`,
    `snapshotRef=${retrieval?.snapshotRef ?? "none"}`,
    `evidenceCount=${evidenceItems.length}`,
    `duplicateCount=${evidenceItems.filter((e) => e.duplicateOfPrior).length}`,
    `contextCount=${contexts.length}`,
    `contradictionCount=${contradictions.length}`,
    `retractionCount=${retractions.length}`,
    `changeCount=${changes.length}`,
    `impactCount=${impacts.length}`,
    `newPublicationIsNotConsensusChange=true`,
    `extractedClaimsNotAutoApproved=true`,
    `retractedIsNotValidSupport=true`,
    `licencesAndLimitsRespected=true`,
    `snapshotsAndRetrievalTimestampsPreserved=true`,
    `noAutoApproval=true`,
    `noFabricatedDiscoveries=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
    `scientificKnowledgeEvolution=false`,
  ];
}

export function fingerprintProgrammeSourceSubscription(
  subscription: ProgrammeSourceSubscription,
): string {
  const validated = validateProgrammeSourceSubscription(subscription);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildContinuousEvidenceInvestigationPack(input: {
  subscriptions: readonly ProgrammeSourceSubscription[];
  retrievals: readonly ScheduledEvidenceRetrieval[];
  evidence: readonly ProgrammeEvidenceItem[];
  contexts: readonly EvidenceContextExtraction[];
  contradictions: readonly ContradictionDetectionRecord[];
  retractions: readonly RetractionCorrectionRecord[];
  changes: readonly EvidenceChangeRecord[];
  impacts: readonly ProgrammeImpactAssessment[];
  asOf: string;
}): {
  schema: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA;
  method: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD;
  version: typeof CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION;
  asOf: string;
  subscriptionCount: number;
  retrievalCount: number;
  evidenceCount: number;
  contextCount: number;
  contradictionCount: number;
  retractionCount: number;
  changeCount: number;
  impactCount: number;
  honesty: ContinuousEvidenceInvestigationHonesty;
  subscriptions: readonly ProgrammeSourceSubscription[];
  retrievals: readonly ScheduledEvidenceRetrieval[];
  evidence: readonly ProgrammeEvidenceItem[];
  contexts: readonly EvidenceContextExtraction[];
  contradictions: readonly ContradictionDetectionRecord[];
  retractions: readonly RetractionCorrectionRecord[];
  changes: readonly EvidenceChangeRecord[];
  impacts: readonly ProgrammeImpactAssessment[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const subscriptions = input.subscriptions.map(
    validateProgrammeSourceSubscription,
  );
  const retrievals = input.retrievals.map(validateScheduledEvidenceRetrieval);
  const evidence = input.evidence.map(validateProgrammeEvidenceItem);
  const contexts = input.contexts.map(validateEvidenceContextExtraction);
  const contradictions = input.contradictions.map(
    validateContradictionDetectionRecord,
  );
  const retractions = input.retractions.map(validateRetractionCorrectionRecord);
  const changes = input.changes.map(validateEvidenceChangeRecord);
  const impacts = input.impacts.map(validateProgrammeImpactAssessment);
  return {
    schema: CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA,
    method: CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD,
    version: CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION,
    asOf: input.asOf,
    subscriptionCount: subscriptions.length,
    retrievalCount: retrievals.length,
    evidenceCount: evidence.length,
    contextCount: contexts.length,
    contradictionCount: contradictions.length,
    retractionCount: retractions.length,
    changeCount: changes.length,
    impactCount: impacts.length,
    honesty: {...DEFAULT_HONESTY},
    subscriptions,
    retrievals,
    evidence,
    contexts,
    contradictions,
    retractions,
    changes,
    impacts,
  };
}
