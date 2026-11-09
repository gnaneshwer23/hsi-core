/**
 * Milestone 14 / PR4 — Reproducible Cohort Builder.
 *
 * Versioned cohort *definition contracts* layered on M14 PR1 RWE envelopes,
 * PR2 secure clinical interop ids, and PR3 longitudinal analysis ids.
 * Supports inclusion/exclusion criteria, index date, baseline window, exposure
 * and comparator definitions, follow-up period, outcome definition, data
 * source, and cohort version — plus discovery, eligibility, attrition,
 * missing-data, population description, measurement availability, and
 * overlap/comparability envelopes with small-cell disclosure controls.
 *
 * Does NOT ingest live PHI, run live EHR queries, fabricate real patient
 * counts, ship workbench UI / observational causal engines (PR5), invent
 * Gate C / MoU, or expose identifiable patient-level data via cohort search,
 * graph, summaries, or exports.
 *
 * Privacy honesty (fail-closed):
 * - Cohort search / discovery returns aggregate or suppressed cells only.
 * - Small-cell / sensitive-subgroup disclosure controls suppress counts
 *   below the declared threshold (never invent substitute real n).
 * - Direct personal identifier refs refused.
 *
 * Binding honesty:
 * - Research decision support only; fixtures/contracts until authorised.
 * - Observational cohort ≠ proven treatment effect / causal identification.
 * - Pseudonymised data may still be personal data.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const REPRODUCIBLE_COHORT_BUILDER_SCHEMA =
  "hsi-reproducible-cohort-builder-1" as const;
export const REPRODUCIBLE_COHORT_BUILDER_METHOD =
  "hsi.reproducible_cohort_builder.v1" as const;
export const REPRODUCIBLE_COHORT_BUILDER_VERSION = "0.1.0" as const;

/** Default small-cell disclosure threshold — counts strictly below are suppressed. */
export const DEFAULT_SMALL_CELL_THRESHOLD = 5 as const;

export const CRITERION_POLARITIES = ["inclusion", "exclusion"] as const;
export type CriterionPolarity = (typeof CRITERION_POLARITIES)[number];

export const CRITERION_DOMAINS = [
  "diagnosis",
  "procedure",
  "medication",
  "laboratory",
  "demographics_aggregate",
  "observation_window",
  "other_declared",
] as const;
export type CriterionDomain = (typeof CRITERION_DOMAINS)[number];

export const INDEX_DATE_KINDS = [
  "first_qualifying_diagnosis",
  "treatment_initiation",
  "cohort_entry_declared",
  "study_start_declared",
  "other_declared",
] as const;
export type IndexDateKind = (typeof INDEX_DATE_KINDS)[number];

export const WINDOW_UNITS = ["days", "weeks", "months", "years"] as const;
export type WindowUnit = (typeof WINDOW_UNITS)[number];

export const EXPOSURE_ROLES = ["exposure", "comparator"] as const;
export type ExposureRole = (typeof EXPOSURE_ROLES)[number];

export const FOLLOW_UP_END_KINDS = [
  "fixed_duration",
  "event_driven",
  "administrative_censor",
  "death_or_competing_declared",
  "other_declared",
] as const;
export type FollowUpEndKind = (typeof FOLLOW_UP_END_KINDS)[number];

export const COHORT_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_disclosure_risk",
  "blocked_awaiting_authorised_dataset",
  "rejected",
  "superseded",
] as const;
export type CohortLifecycle = (typeof COHORT_LIFECYCLES)[number];

export const DATASET_AVAILABILITY = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type CohortDatasetAvailability =
  (typeof DATASET_AVAILABILITY)[number];

export const ACCESS_CLASSIFICATIONS = [
  "fixture_engineering",
  "authorised_pseudonymous_research",
  "authorised_aggregate_only",
  "restricted_not_ingested",
] as const;
export type CohortAccessClassification =
  (typeof ACCESS_CLASSIFICATIONS)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type CohortActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type CohortDataBasis = (typeof DATA_BASES)[number];

export const ATTRITION_STEP_KINDS = [
  "source_population",
  "inclusion_applied",
  "exclusion_applied",
  "index_date_assigned",
  "baseline_complete",
  "exposure_assigned",
  "comparator_assigned",
  "follow_up_started",
  "outcome_ascertainable",
  "final_analytic_cohort",
] as const;
export type AttritionStepKind = (typeof ATTRITION_STEP_KINDS)[number];

export const DISCLOSURE_STATUSES = [
  "released_aggregate",
  "suppressed_small_cell",
  "suppressed_sensitive_subgroup",
  "blocked_identifiable_request",
  "not_assessed",
] as const;
export type DisclosureStatus = (typeof DISCLOSURE_STATUSES)[number];

export const ELIGIBILITY_DECISIONS = [
  "eligible_declared",
  "ineligible_inclusion",
  "ineligible_exclusion",
  "insufficient_data",
  "not_assessed",
] as const;
export type EligibilityDecision = (typeof ELIGIBILITY_DECISIONS)[number];

export const MISSING_DATA_ASSESSMENT_STATUSES = [
  "assessed_declared",
  "partially_assessed",
  "not_assessed",
  "blocked_no_authorised_dataset",
] as const;
export type MissingDataAssessmentStatus =
  (typeof MISSING_DATA_ASSESSMENT_STATUSES)[number];

export const MEASUREMENT_AVAILABILITY_STATUSES = [
  "available_declared",
  "partially_available",
  "unavailable",
  "not_assessed",
  "blocked_no_authorised_dataset",
] as const;
export type MeasurementAvailabilityStatus =
  (typeof MEASUREMENT_AVAILABILITY_STATUSES)[number];

export const OVERLAP_COMPARABILITY_STATUSES = [
  "overlap_plausible_declared",
  "limited_overlap_declared",
  "non_comparable_declared",
  "not_assessed",
  "blocked_no_authorised_dataset",
] as const;
export type OverlapComparabilityStatus =
  (typeof OVERLAP_COMPARABILITY_STATUSES)[number];

export const SEARCH_RESULT_KINDS = [
  "cohort_definition_match",
  "aggregate_count_suppressed",
  "aggregate_count_released",
  "blocked_identifiable",
] as const;
export type SearchResultKind = (typeof SEARCH_RESULT_KINDS)[number];

const COHORT_ID_RE = /^hsi-rcb-coh-[a-z0-9-]{3,80}$/;
const CRITERION_ID_RE = /^hsi-rcb-crit-[a-z0-9-]{3,80}$/;
const ATTRITION_ID_RE = /^hsi-rcb-atr-[a-z0-9-]{3,80}$/;
const ELIGIBILITY_ID_RE = /^hsi-rcb-elig-[a-z0-9-]{3,80}$/;
const MISSING_ID_RE = /^hsi-rcb-miss-[a-z0-9-]{3,80}$/;
const POP_ID_RE = /^hsi-rcb-pop-[a-z0-9-]{3,80}$/;
const MEAS_ID_RE = /^hsi-rcb-meas-[a-z0-9-]{3,80}$/;
const OVERLAP_ID_RE = /^hsi-rcb-ovl-[a-z0-9-]{3,80}$/;
const SEARCH_ID_RE = /^hsi-rcb-src-[a-z0-9-]{3,80}$/;
const QUERY_ID_RE = /^hsi-rcb-q-[a-z0-9-]{3,80}$/;
const DISCLOSURE_ID_RE = /^hsi-rcb-disc-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const VERSION_RE = /^[a-zA-Z0-9._-]{1,64}$/;
const RWE_STUDY_RE = /^hsi-rwe-study-[a-z0-9-]{3,80}$/;
const RWE_EXP_RE = /^hsi-rwe-exp-[a-z0-9-]{3,80}$/;
const RWE_OUT_RE = /^hsi-rwe-out-[a-z0-9-]{3,80}$/;
const SCDI_SRC_RE = /^hsi-scdi-src-[a-z0-9-]{3,80}$/;
const LCE_SPEC_RE = /^hsi-lce-spec-[a-z0-9-]{3,80}$/;

export type ReproducibleCohortBuilderHonesty = {
  researchDecisionSupportOnly: true;
  noUnrestrictedCentralPatientDatabase: true;
  observationalCohortIsNotProvenTreatmentEffect: true;
  noIdentifiablePatientLevelExposureViaSearch: true;
  smallCellDisclosureControlsRequired: true;
  identifiableRecordsOutsideScientificKg: true;
  pseudonymisedMayStillBePersonalData: true;
  noPhiIngestion: true;
  noFabricatedPatientCountsAsReal: true;
  noPatientTreatmentDirectives: true;
  noWorkbenchUi: true;
  noLiveEhrQueryClaim: true;
  agentsDraftHumansReview: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  causalIdentificationClaimed: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
};

export type CohortActor = {
  principalId: string;
  actorKind: CohortActorKind;
};

export type CohortCriterion = {
  id: string;
  polarity: CriterionPolarity;
  domain: CriterionDomain;
  description: string;
  codeSystemRef: string | null;
  codeValue: string | null;
  lookbackDays: number | null;
  note: string;
};

export type TimeWindow = {
  startOffset: number;
  endOffset: number;
  unit: WindowUnit;
  note: string;
};

export type IndexDateDefinition = {
  kind: IndexDateKind;
  description: string;
  anchoredToCriterionId: string | null;
  note: string;
};

export type ExposureOrComparatorDefinition = {
  role: ExposureRole;
  displayName: string;
  definition: string;
  rweExposureId: string | null;
  washoutDays: number | null;
  note: string;
};

export type FollowUpPeriodDefinition = {
  endKind: FollowUpEndKind;
  description: string;
  maxDurationValue: number | null;
  maxDurationUnit: WindowUnit | null;
  note: string;
};

export type OutcomeDefinitionRef = {
  displayName: string;
  definition: string;
  rweOutcomeId: string | null;
  ascertainmentWindow: TimeWindow | null;
  note: string;
};

export type DisclosureControlPolicy = {
  smallCellThreshold: number;
  suppressSensitiveSubgroups: true;
  allowIdentifiablePatientLevelExport: false;
  allowIdentifiablePatientLevelSearch: false;
  note: string;
};

export type CohortDefinition = {
  schema: typeof REPRODUCIBLE_COHORT_BUILDER_SCHEMA;
  method: typeof REPRODUCIBLE_COHORT_BUILDER_METHOD;
  version: typeof REPRODUCIBLE_COHORT_BUILDER_VERSION;
  id: string;
  displayName: string;
  scientificQuestion: string;
  cohortVersion: string;
  rweStudyId: string;
  /** Optional PR2 interop data-source registration. */
  interopDataSourceId: string | null;
  /** Optional PR3 longitudinal analysis spec. */
  longitudinalAnalysisSpecId: string | null;
  dataSourceDescription: string;
  inclusionCriteria: readonly CohortCriterion[];
  exclusionCriteria: readonly CohortCriterion[];
  indexDate: IndexDateDefinition;
  baselineWindow: TimeWindow;
  exposure: ExposureOrComparatorDefinition;
  comparator: ExposureOrComparatorDefinition;
  followUpPeriod: FollowUpPeriodDefinition;
  outcome: OutcomeDefinitionRef;
  disclosurePolicy: DisclosureControlPolicy;
  datasetAvailability: CohortDatasetAvailability;
  accessClassification: CohortAccessClassification;
  containsIdentifiablePhi: false;
  liveEhrQueryOperational: false;
  inventedPatientCount: null;
  lifecycle: CohortLifecycle;
  reviewedBy: CohortActor | null;
  authoredBy: CohortActor;
  dataBasis: CohortDataBasis;
  fixtureHonesty: boolean;
  honesty: ReproducibleCohortBuilderHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type AttritionStep = {
  stepKind: AttritionStepKind;
  label: string;
  /** Declared count only when non-invented and disclosure-safe; otherwise null. */
  countDeclared: number | null;
  disclosureStatus: DisclosureStatus;
  removedReason: string | null;
  note: string;
};

export type AttritionReport = {
  schema: typeof REPRODUCIBLE_COHORT_BUILDER_SCHEMA;
  method: typeof REPRODUCIBLE_COHORT_BUILDER_METHOD;
  version: typeof REPRODUCIBLE_COHORT_BUILDER_VERSION;
  id: string;
  cohortDefinitionId: string;
  cohortVersion: string;
  steps: readonly AttritionStep[];
  inventedPatientCount: null;
  containsIdentifiablePhi: false;
  authoredBy: CohortActor;
  honesty: ReproducibleCohortBuilderHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type EligibilityAssessment = {
  schema: typeof REPRODUCIBLE_COHORT_BUILDER_SCHEMA;
  method: typeof REPRODUCIBLE_COHORT_BUILDER_METHOD;
  version: typeof REPRODUCIBLE_COHORT_BUILDER_VERSION;
  id: string;
  cohortDefinitionId: string;
  /** Pseudonymous or aggregate subject ref — never direct identifiers. */
  subjectOrCohortRef: string;
  subjectRefKind: "pseudonymous_subject" | "cohort_aggregate";
  decision: EligibilityDecision;
  matchedInclusionCriterionIds: readonly string[];
  matchedExclusionCriterionIds: readonly string[];
  containsIdentifiablePhi: false;
  authoredBy: CohortActor;
  honesty: ReproducibleCohortBuilderHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MissingDataAssessment = {
  schema: typeof REPRODUCIBLE_COHORT_BUILDER_SCHEMA;
  method: typeof REPRODUCIBLE_COHORT_BUILDER_METHOD;
  version: typeof REPRODUCIBLE_COHORT_BUILDER_VERSION;
  id: string;
  cohortDefinitionId: string;
  status: MissingDataAssessmentStatus;
  variablesAssessed: readonly string[];
  summary: string;
  inventedMissingnessRates: null;
  containsIdentifiablePhi: false;
  authoredBy: CohortActor;
  honesty: ReproducibleCohortBuilderHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PopulationDescription = {
  schema: typeof REPRODUCIBLE_COHORT_BUILDER_SCHEMA;
  method: typeof REPRODUCIBLE_COHORT_BUILDER_METHOD;
  version: typeof REPRODUCIBLE_COHORT_BUILDER_VERSION;
  id: string;
  cohortDefinitionId: string;
  summary: string;
  characteristics: readonly string[];
  /** Aggregate n only when disclosure-safe and non-invented; otherwise null. */
  aggregateNDeclared: number | null;
  disclosureStatus: DisclosureStatus;
  inventedPatientCount: null;
  containsIdentifiablePhi: false;
  authoredBy: CohortActor;
  honesty: ReproducibleCohortBuilderHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MeasurementAvailabilityRecord = {
  schema: typeof REPRODUCIBLE_COHORT_BUILDER_SCHEMA;
  method: typeof REPRODUCIBLE_COHORT_BUILDER_METHOD;
  version: typeof REPRODUCIBLE_COHORT_BUILDER_VERSION;
  id: string;
  cohortDefinitionId: string;
  measurementConcept: string;
  status: MeasurementAvailabilityStatus;
  summary: string;
  containsIdentifiablePhi: false;
  authoredBy: CohortActor;
  honesty: ReproducibleCohortBuilderHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type OverlapComparabilityCheck = {
  schema: typeof REPRODUCIBLE_COHORT_BUILDER_SCHEMA;
  method: typeof REPRODUCIBLE_COHORT_BUILDER_METHOD;
  version: typeof REPRODUCIBLE_COHORT_BUILDER_VERSION;
  id: string;
  cohortDefinitionId: string;
  status: OverlapComparabilityStatus;
  summary: string;
  limitations: readonly string[];
  causalIdentificationClaimed: false;
  containsIdentifiablePhi: false;
  authoredBy: CohortActor;
  honesty: ReproducibleCohortBuilderHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CohortSearchQuery = {
  id: string;
  queryText: string;
  requestedIdentifiablePatientLevel: boolean;
  authoredBy: CohortActor;
  createdAt: string;
};

export type CohortSearchHit = {
  kind: SearchResultKind;
  cohortDefinitionId: string | null;
  displayLabel: string;
  aggregateCount: number | null;
  disclosureStatus: DisclosureStatus;
  containsIdentifiablePhi: false;
  note: string;
};

export type CohortSearchResult = {
  schema: typeof REPRODUCIBLE_COHORT_BUILDER_SCHEMA;
  method: typeof REPRODUCIBLE_COHORT_BUILDER_METHOD;
  version: typeof REPRODUCIBLE_COHORT_BUILDER_VERSION;
  id: string;
  queryId: string;
  hits: readonly CohortSearchHit[];
  blockedIdentifiableRequest: boolean;
  containsIdentifiablePhi: false;
  inventedPatientCount: null;
  authoredBy: CohortActor;
  honesty: ReproducibleCohortBuilderHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DisclosureDecision = {
  schema: typeof REPRODUCIBLE_COHORT_BUILDER_SCHEMA;
  method: typeof REPRODUCIBLE_COHORT_BUILDER_METHOD;
  version: typeof REPRODUCIBLE_COHORT_BUILDER_VERSION;
  id: string;
  cohortDefinitionId: string;
  cellLabel: string;
  rawCountDeclared: number | null;
  releasedCount: number | null;
  status: DisclosureStatus;
  smallCellThreshold: number;
  containsIdentifiablePhi: false;
  authoredBy: CohortActor;
  honesty: ReproducibleCohortBuilderHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ReproducibleCohortBuilderStore = {
  upsertCohort(cohort: CohortDefinition): CohortDefinition;
  getCohort(id: string): CohortDefinition | null;
  listCohorts(rweStudyId?: string): readonly CohortDefinition[];
  upsertAttrition(report: AttritionReport): AttritionReport;
  getAttrition(id: string): AttritionReport | null;
  listAttrition(cohortDefinitionId?: string): readonly AttritionReport[];
  upsertEligibility(record: EligibilityAssessment): EligibilityAssessment;
  getEligibility(id: string): EligibilityAssessment | null;
  listEligibility(
    cohortDefinitionId?: string,
  ): readonly EligibilityAssessment[];
  upsertMissingData(record: MissingDataAssessment): MissingDataAssessment;
  getMissingData(id: string): MissingDataAssessment | null;
  listMissingData(
    cohortDefinitionId?: string,
  ): readonly MissingDataAssessment[];
  upsertPopulation(record: PopulationDescription): PopulationDescription;
  getPopulation(id: string): PopulationDescription | null;
  listPopulation(
    cohortDefinitionId?: string,
  ): readonly PopulationDescription[];
  upsertMeasurement(
    record: MeasurementAvailabilityRecord,
  ): MeasurementAvailabilityRecord;
  getMeasurement(id: string): MeasurementAvailabilityRecord | null;
  listMeasurement(
    cohortDefinitionId?: string,
  ): readonly MeasurementAvailabilityRecord[];
  upsertOverlap(record: OverlapComparabilityCheck): OverlapComparabilityCheck;
  getOverlap(id: string): OverlapComparabilityCheck | null;
  listOverlap(
    cohortDefinitionId?: string,
  ): readonly OverlapComparabilityCheck[];
  upsertSearchResult(result: CohortSearchResult): CohortSearchResult;
  getSearchResult(id: string): CohortSearchResult | null;
  listSearchResults(): readonly CohortSearchResult[];
  upsertDisclosure(decision: DisclosureDecision): DisclosureDecision;
  getDisclosure(id: string): DisclosureDecision | null;
  listDisclosure(
    cohortDefinitionId?: string,
  ): readonly DisclosureDecision[];
};

const DEFAULT_HONESTY: ReproducibleCohortBuilderHonesty = {
  researchDecisionSupportOnly: true,
  noUnrestrictedCentralPatientDatabase: true,
  observationalCohortIsNotProvenTreatmentEffect: true,
  noIdentifiablePatientLevelExposureViaSearch: true,
  smallCellDisclosureControlsRequired: true,
  identifiableRecordsOutsideScientificKg: true,
  pseudonymisedMayStillBePersonalData: true,
  noPhiIngestion: true,
  noFabricatedPatientCountsAsReal: true,
  noPatientTreatmentDirectives: true,
  noWorkbenchUi: true,
  noLiveEhrQueryClaim: true,
  agentsDraftHumansReview: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  causalIdentificationClaimed: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
};

const COHORT_TRANSITIONS: Record<
  CohortLifecycle,
  readonly CohortLifecycle[]
> = {
  draft: [
    "under_review",
    "blocked_disclosure_risk",
    "blocked_awaiting_authorised_dataset",
    "superseded",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_disclosure_risk",
    "blocked_awaiting_authorised_dataset",
    "rejected",
    "superseded",
  ],
  accepted_with_limitations: ["blocked_disclosure_risk", "superseded"],
  blocked_disclosure_risk: ["draft", "superseded"],
  blocked_awaiting_authorised_dataset: ["under_review", "superseded"],
  rejected: ["superseded"],
  superseded: [],
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

function assertStringList(
  values: readonly string[],
  label: string,
  maxItems: number,
  maxLen: number,
): readonly string[] {
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  return values.map((v) => {
    if (!textOk(v, maxLen)) throw Error(`Invalid ${label} entry`);
    return v.trim();
  });
}

function assertActor(actor: CohortActor, label: string): CohortActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principal`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actor kind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}

function assertHonesty(honesty: ReproducibleCohortBuilderHonesty): void {
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Must remain research decision support only");
  }
  if (honesty.noUnrestrictedCentralPatientDatabase !== true) {
    throw Error("Unrestricted central patient database forbidden");
  }
  if (honesty.observationalCohortIsNotProvenTreatmentEffect !== true) {
    throw Error("Observational cohort is not proven treatment effect");
  }
  if (honesty.noIdentifiablePatientLevelExposureViaSearch !== true) {
    throw Error("Identifiable patient-level exposure via search forbidden");
  }
  if (honesty.smallCellDisclosureControlsRequired !== true) {
    throw Error("Small-cell disclosure controls required");
  }
  if (honesty.identifiableRecordsOutsideScientificKg !== true) {
    throw Error("Identifiable records must stay outside scientific KG");
  }
  if (honesty.pseudonymisedMayStillBePersonalData !== true) {
    throw Error("Pseudonymised data may still be personal data");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noFabricatedPatientCountsAsReal !== true) {
    throw Error("Fabricated patient counts as real forbidden");
  }
  if (honesty.noPatientTreatmentDirectives !== true) {
    throw Error("Patient treatment directives forbidden");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR4");
  }
  if (honesty.noLiveEhrQueryClaim !== true) {
    throw Error("Live EHR query claim forbidden");
  }
  if (honesty.agentsDraftHumansReview !== true) {
    throw Error("Agents draft; humans review");
  }
  if (honesty.gateCAutoApprove !== false) {
    throw Error("Gate C auto-approve forbidden");
  }
  if (honesty.mouInvented !== false) throw Error("MoU must not be invented");
  if (honesty.phiCdsWired !== false) throw Error("PHI/CDS must stay unwired");
  if (honesty.scientificApproval !== false) {
    throw Error("Scientific approval must stay false in PR4");
  }
  if (honesty.causalIdentificationClaimed !== false) {
    throw Error("Causal identification claims forbidden");
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
}

function assertNoForbiddenClaimLanguage(text: string, label: string): void {
  const lower = text.toLowerCase();
  if (
    /\bproven\s+treatment\s+effect\b/.test(lower) ||
    /\bcausal(ly)?\s+(proven|established|identified)\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\breal\s+patient\s+count\s*=\s*\d+\b/.test(lower) ||
    /\bhazard\s*ratio\s*=\s*[\d.]+\b/.test(lower) ||
    /\btreat(ment)?\s+recommendation\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower) ||
    /\bunrestricted\s+patient\s+(db|database)\b/.test(lower) ||
    /\blive\s+ehr\s+query\b/.test(lower) ||
    /\bprescribe\b/.test(lower)
  ) {
    throw Error(
      `${label} must not invent counts/effects, claim proven treatment effects, include identifiers, claim live EHR queries, or issue treatment directives`,
    );
  }
}

function looksLikeDirectIdentifier(ref: string): boolean {
  return /^(nhs|mrn|ssn|name|dob)-/i.test(ref) ||
    /\b(nhs\s*number|mrn|ssn|date\s*of\s*birth)\b/i.test(ref);
}

function assertSubjectRef(
  kind: "pseudonymous_subject" | "cohort_aggregate",
  ref: string,
): {subjectRefKind: "pseudonymous_subject" | "cohort_aggregate"; subjectOrCohortRef: string} {
  if (kind !== "pseudonymous_subject" && kind !== "cohort_aggregate") {
    throw Error("Invalid subject ref kind");
  }
  if (!REF_ID_RE.test(ref)) throw Error("Invalid subjectOrCohortRef");
  if (looksLikeDirectIdentifier(ref)) {
    throw Error("Direct personal identifier refs forbidden");
  }
  return {subjectRefKind: kind, subjectOrCohortRef: ref};
}

function assertNonNegInt(value: number | null, label: string): number | null {
  if (value === null) return null;
  if (!Number.isInteger(value) || value < 0) {
    throw Error(`Invalid ${label}`);
  }
  return value;
}

function assertTimeWindow(window: TimeWindow, label: string): TimeWindow {
  assertClosed(window.unit, WINDOW_UNITS, `${label} unit`);
  if (!Number.isInteger(window.startOffset) || !Number.isInteger(window.endOffset)) {
    throw Error(`Invalid ${label} offsets`);
  }
  if (window.startOffset > window.endOffset) {
    throw Error(`${label} startOffset must be <= endOffset`);
  }
  const note = (window.note ?? "").trim();
  if (note.length > 500) throw Error(`Invalid ${label} note`);
  if (note) assertNoForbiddenClaimLanguage(note, `${label} note`);
  return {
    startOffset: window.startOffset,
    endOffset: window.endOffset,
    unit: window.unit,
    note,
  };
}

function assertCriterion(criterion: CohortCriterion): CohortCriterion {
  if (!CRITERION_ID_RE.test(criterion.id)) throw Error("Invalid criterion id");
  assertClosed(criterion.polarity, CRITERION_POLARITIES, "criterion polarity");
  assertClosed(criterion.domain, CRITERION_DOMAINS, "criterion domain");
  if (!textOk(criterion.description, 1000)) {
    throw Error("Invalid criterion description");
  }
  assertNoForbiddenClaimLanguage(criterion.description, "criterion description");
  const codeSystemRef =
    criterion.codeSystemRef === null || criterion.codeSystemRef === undefined
      ? null
      : criterion.codeSystemRef.trim();
  if (codeSystemRef !== null && !textOk(codeSystemRef, 240)) {
    throw Error("Invalid codeSystemRef");
  }
  const codeValue =
    criterion.codeValue === null || criterion.codeValue === undefined
      ? null
      : criterion.codeValue.trim();
  if (codeValue !== null && !textOk(codeValue, 240)) {
    throw Error("Invalid codeValue");
  }
  const lookbackDays = assertNonNegInt(
    criterion.lookbackDays ?? null,
    "lookbackDays",
  );
  const note = (criterion.note ?? "").trim();
  if (note.length > 500) throw Error("Invalid criterion note");
  if (note) assertNoForbiddenClaimLanguage(note, "criterion note");
  return {
    id: criterion.id,
    polarity: criterion.polarity,
    domain: criterion.domain,
    description: criterion.description.trim(),
    codeSystemRef,
    codeValue,
    lookbackDays,
    note,
  };
}

function assertDisclosurePolicy(
  policy: DisclosureControlPolicy,
): DisclosureControlPolicy {
  if (
    !Number.isInteger(policy.smallCellThreshold) ||
    policy.smallCellThreshold < 1 ||
    policy.smallCellThreshold > 50
  ) {
    throw Error("Invalid smallCellThreshold");
  }
  if (policy.suppressSensitiveSubgroups !== true) {
    throw Error("Sensitive subgroup suppression required");
  }
  if (policy.allowIdentifiablePatientLevelExport !== false) {
    throw Error("Identifiable patient-level export forbidden");
  }
  if (policy.allowIdentifiablePatientLevelSearch !== false) {
    throw Error("Identifiable patient-level search forbidden");
  }
  const note = (policy.note ?? "").trim();
  if (note.length > 500) throw Error("Invalid disclosure policy note");
  if (note) assertNoForbiddenClaimLanguage(note, "disclosure policy note");
  return {
    smallCellThreshold: policy.smallCellThreshold,
    suppressSensitiveSubgroups: true,
    allowIdentifiablePatientLevelExport: false,
    allowIdentifiablePatientLevelSearch: false,
    note,
  };
}

/**
 * Apply small-cell disclosure controls. Counts strictly below the threshold
 * are suppressed (releasedCount null). Never invents substitute real n.
 */
export function applySmallCellDisclosure(input: {
  rawCountDeclared: number | null;
  smallCellThreshold?: number;
  sensitiveSubgroup?: boolean;
}): {
  status: DisclosureStatus;
  releasedCount: number | null;
  smallCellThreshold: number;
} {
  const threshold = input.smallCellThreshold ?? DEFAULT_SMALL_CELL_THRESHOLD;
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 50) {
    throw Error("Invalid smallCellThreshold");
  }
  if (input.rawCountDeclared !== null) {
    if (
      !Number.isInteger(input.rawCountDeclared) ||
      input.rawCountDeclared < 0
    ) {
      throw Error("Invalid rawCountDeclared");
    }
  }
  if (input.sensitiveSubgroup === true) {
    return {
      status: "suppressed_sensitive_subgroup",
      releasedCount: null,
      smallCellThreshold: threshold,
    };
  }
  if (input.rawCountDeclared === null) {
    return {
      status: "not_assessed",
      releasedCount: null,
      smallCellThreshold: threshold,
    };
  }
  if (input.rawCountDeclared < threshold) {
    return {
      status: "suppressed_small_cell",
      releasedCount: null,
      smallCellThreshold: threshold,
    };
  }
  return {
    status: "released_aggregate",
    releasedCount: input.rawCountDeclared,
    smallCellThreshold: threshold,
  };
}

/**
 * Fail-closed cohort discovery: refuse identifiable patient-level requests;
 * never return PHI in hits.
 */
export function runCohortDiscoverySearch(input: {
  query: CohortSearchQuery;
  cohorts: readonly CohortDefinition[];
  aggregateCountsByCohortId?: Readonly<Record<string, number | null>>;
}): CohortSearchResult {
  if (!QUERY_ID_RE.test(input.query.id)) throw Error("Invalid query id");
  if (!textOk(input.query.queryText, 2000)) throw Error("Invalid queryText");
  assertNoForbiddenClaimLanguage(input.query.queryText, "queryText");
  if (!isIsoTimestamp(input.query.createdAt)) throw Error("Invalid createdAt");
  const authoredBy = assertActor(input.query.authoredBy, "query author");
  const resultId = `hsi-rcb-src-${input.query.id.slice("hsi-rcb-q-".length)}`;

  if (
    input.query.requestedIdentifiablePatientLevel ||
    looksLikeDirectIdentifier(input.query.queryText)
  ) {
    const result: CohortSearchResult = {
      schema: REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
      method: REPRODUCIBLE_COHORT_BUILDER_METHOD,
      version: REPRODUCIBLE_COHORT_BUILDER_VERSION,
      id: resultId,
      queryId: input.query.id,
      hits: [
        {
          kind: "blocked_identifiable",
          cohortDefinitionId: null,
          displayLabel: "Identifiable patient-level cohort search blocked",
          aggregateCount: null,
          disclosureStatus: "blocked_identifiable_request",
          containsIdentifiablePhi: false,
          note: "Fail-closed: cohort search must not expose identifiable patient-level data",
        },
      ],
      blockedIdentifiableRequest: true,
      containsIdentifiablePhi: false,
      inventedPatientCount: null,
      authoredBy,
      honesty: {...DEFAULT_HONESTY},
      createdAt: input.query.createdAt,
      updatedAt: input.query.createdAt,
      note: "Blocked identifiable request",
    };
    return validateCohortSearchResult(result);
  }

  const q = input.query.queryText.toLowerCase().trim();
  const hits: CohortSearchHit[] = [];
  for (const cohort of input.cohorts) {
    const validated = validateCohortDefinition(cohort);
    const hay =
      `${validated.displayName} ${validated.scientificQuestion} ${validated.cohortVersion}`.toLowerCase();
    if (q.length > 0) {
      const tokens = q.split(/\s+/).filter((t) => t.length >= 3);
      if (tokens.length > 0 && !tokens.some((t) => hay.includes(t))) {
        continue;
      }
      if (tokens.length === 0 && !hay.includes(q)) continue;
    }
    const raw = input.aggregateCountsByCohortId?.[validated.id] ?? null;
    const disclosure = applySmallCellDisclosure({
      rawCountDeclared: raw,
      smallCellThreshold: validated.disclosurePolicy.smallCellThreshold,
    });
    hits.push({
      kind:
        disclosure.status === "suppressed_small_cell" ||
        disclosure.status === "suppressed_sensitive_subgroup"
          ? "aggregate_count_suppressed"
          : disclosure.status === "released_aggregate"
            ? "aggregate_count_released"
            : "cohort_definition_match",
      cohortDefinitionId: validated.id,
      displayLabel: validated.displayName,
      aggregateCount: disclosure.releasedCount,
      disclosureStatus: disclosure.status,
      containsIdentifiablePhi: false,
      note: "Aggregate cohort discovery hit — no patient-level rows",
    });
  }

  const result: CohortSearchResult = {
    schema: REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
    method: REPRODUCIBLE_COHORT_BUILDER_METHOD,
    version: REPRODUCIBLE_COHORT_BUILDER_VERSION,
    id: resultId,
    queryId: input.query.id,
    hits,
    blockedIdentifiableRequest: false,
    containsIdentifiablePhi: false,
    inventedPatientCount: null,
    authoredBy,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.query.createdAt,
    updatedAt: input.query.createdAt,
    note: "Cohort discovery — aggregate / suppressed only",
  };
  return validateCohortSearchResult(result);
}

export function draftCohortDefinition(input: {
  id: string;
  displayName: string;
  scientificQuestion: string;
  cohortVersion: string;
  rweStudyId: string;
  dataSourceDescription: string;
  inclusionCriteria: readonly CohortCriterion[];
  exclusionCriteria: readonly CohortCriterion[];
  indexDate: IndexDateDefinition;
  baselineWindow: TimeWindow;
  exposure: Omit<ExposureOrComparatorDefinition, "role"> & {role?: "exposure"};
  comparator: Omit<ExposureOrComparatorDefinition, "role"> & {
    role?: "comparator";
  };
  followUpPeriod: FollowUpPeriodDefinition;
  outcome: OutcomeDefinitionRef;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: CohortActorKind;
  interopDataSourceId?: string | null;
  longitudinalAnalysisSpecId?: string | null;
  disclosurePolicy?: Partial<DisclosureControlPolicy>;
  datasetAvailability?: CohortDatasetAvailability;
  accessClassification?: CohortAccessClassification;
  dataBasis?: CohortDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): CohortDefinition {
  if (!COHORT_ID_RE.test(input.id)) throw Error("Invalid cohort definition id");
  if (!textOk(input.displayName, 240)) throw Error("Invalid displayName");
  if (!textOk(input.scientificQuestion, 4000)) {
    throw Error("Invalid scientificQuestion");
  }
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(
    input.scientificQuestion,
    "scientificQuestion",
  );
  if (!VERSION_RE.test(input.cohortVersion)) {
    throw Error("Invalid cohortVersion");
  }
  if (!RWE_STUDY_RE.test(input.rweStudyId)) throw Error("Invalid rweStudyId");
  if (!textOk(input.dataSourceDescription, 1000)) {
    throw Error("Invalid dataSourceDescription");
  }
  assertNoForbiddenClaimLanguage(
    input.dataSourceDescription,
    "dataSourceDescription",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  if (input.inclusionCriteria.length === 0) {
    throw Error("At least one inclusion criterion required");
  }
  if (input.inclusionCriteria.length > 32) {
    throw Error("Too many inclusion criteria");
  }
  if (input.exclusionCriteria.length > 32) {
    throw Error("Too many exclusion criteria");
  }
  const inclusionCriteria = input.inclusionCriteria.map((c) => {
    const crit = assertCriterion(c);
    if (crit.polarity !== "inclusion") {
      throw Error("Inclusion list requires polarity=inclusion");
    }
    return crit;
  });
  const exclusionCriteria = input.exclusionCriteria.map((c) => {
    const crit = assertCriterion(c);
    if (crit.polarity !== "exclusion") {
      throw Error("Exclusion list requires polarity=exclusion");
    }
    return crit;
  });

  assertClosed(input.indexDate.kind, INDEX_DATE_KINDS, "indexDate.kind");
  if (!textOk(input.indexDate.description, 1000)) {
    throw Error("Invalid indexDate.description");
  }
  assertNoForbiddenClaimLanguage(
    input.indexDate.description,
    "indexDate.description",
  );
  const anchoredToCriterionId =
    input.indexDate.anchoredToCriterionId === undefined ||
    input.indexDate.anchoredToCriterionId === null
      ? null
      : input.indexDate.anchoredToCriterionId;
  if (anchoredToCriterionId !== null && !CRITERION_ID_RE.test(anchoredToCriterionId)) {
    throw Error("Invalid indexDate.anchoredToCriterionId");
  }
  if (
    anchoredToCriterionId !== null &&
    !inclusionCriteria.some((c) => c.id === anchoredToCriterionId) &&
    !exclusionCriteria.some((c) => c.id === anchoredToCriterionId)
  ) {
    throw Error("indexDate.anchoredToCriterionId must reference a criterion");
  }
  const indexNote = (input.indexDate.note ?? "").trim();
  if (indexNote.length > 500) throw Error("Invalid indexDate.note");
  if (indexNote) assertNoForbiddenClaimLanguage(indexNote, "indexDate.note");

  const baselineWindow = assertTimeWindow(input.baselineWindow, "baselineWindow");

  const exposure = assertExposureOrComparator(
    {...input.exposure, role: "exposure"},
    "exposure",
  );
  const comparator = assertExposureOrComparator(
    {...input.comparator, role: "comparator"},
    "comparator",
  );
  const followUpPeriod = assertFollowUp(input.followUpPeriod);
  const outcome = assertOutcome(input.outcome);

  const interopDataSourceId =
    input.interopDataSourceId === undefined || input.interopDataSourceId === null
      ? null
      : input.interopDataSourceId;
  if (interopDataSourceId !== null && !SCDI_SRC_RE.test(interopDataSourceId)) {
    throw Error("Invalid interopDataSourceId");
  }
  const longitudinalAnalysisSpecId =
    input.longitudinalAnalysisSpecId === undefined ||
    input.longitudinalAnalysisSpecId === null
      ? null
      : input.longitudinalAnalysisSpecId;
  if (
    longitudinalAnalysisSpecId !== null &&
    !LCE_SPEC_RE.test(longitudinalAnalysisSpecId)
  ) {
    throw Error("Invalid longitudinalAnalysisSpecId");
  }

  const disclosurePolicy = assertDisclosurePolicy({
    smallCellThreshold:
      input.disclosurePolicy?.smallCellThreshold ?? DEFAULT_SMALL_CELL_THRESHOLD,
    suppressSensitiveSubgroups: true,
    allowIdentifiablePatientLevelExport: false,
    allowIdentifiablePatientLevelSearch: false,
    note:
      input.disclosurePolicy?.note ??
      "Small-cell and sensitive-subgroup suppression; no identifiable export/search",
  });

  const datasetAvailability =
    input.datasetAvailability ?? "blocked_no_authorised_clinical_dataset";
  assertClosed(
    datasetAvailability,
    DATASET_AVAILABILITY,
    "dataset availability",
  );
  const accessClassification =
    input.accessClassification ??
    (datasetAvailability === "fixture_only"
      ? "fixture_engineering"
      : "restricted_not_ingested");
  assertClosed(
    accessClassification,
    ACCESS_CLASSIFICATIONS,
    "access classification",
  );

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? "fixture_engineering";
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const lifecycle: CohortLifecycle =
    datasetAvailability === "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const cohort: CohortDefinition = {
    schema: REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
    method: REPRODUCIBLE_COHORT_BUILDER_METHOD,
    version: REPRODUCIBLE_COHORT_BUILDER_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    cohortVersion: input.cohortVersion,
    rweStudyId: input.rweStudyId,
    interopDataSourceId,
    longitudinalAnalysisSpecId,
    dataSourceDescription: input.dataSourceDescription.trim(),
    inclusionCriteria,
    exclusionCriteria,
    indexDate: {
      kind: input.indexDate.kind,
      description: input.indexDate.description.trim(),
      anchoredToCriterionId,
      note: indexNote,
    },
    baselineWindow,
    exposure,
    comparator,
    followUpPeriod,
    outcome,
    disclosurePolicy,
    datasetAvailability,
    accessClassification,
    containsIdentifiablePhi: false,
    liveEhrQueryOperational: false,
    inventedPatientCount: null,
    lifecycle,
    reviewedBy: null,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateCohortDefinition(cohort);
}

function assertExposureOrComparator(
  def: ExposureOrComparatorDefinition,
  label: string,
): ExposureOrComparatorDefinition {
  assertClosed(def.role, EXPOSURE_ROLES, `${label}.role`);
  if (label === "exposure" && def.role !== "exposure") {
    throw Error("Exposure role must be exposure");
  }
  if (label === "comparator" && def.role !== "comparator") {
    throw Error("Comparator role must be comparator");
  }
  if (!textOk(def.displayName, 240)) throw Error(`Invalid ${label}.displayName`);
  if (!textOk(def.definition, 2000)) throw Error(`Invalid ${label}.definition`);
  assertNoForbiddenClaimLanguage(def.displayName, `${label}.displayName`);
  assertNoForbiddenClaimLanguage(def.definition, `${label}.definition`);
  const rweExposureId =
    def.rweExposureId === undefined || def.rweExposureId === null
      ? null
      : def.rweExposureId;
  if (rweExposureId !== null && !RWE_EXP_RE.test(rweExposureId)) {
    throw Error(`Invalid ${label}.rweExposureId`);
  }
  const washoutDays = assertNonNegInt(def.washoutDays ?? null, `${label}.washoutDays`);
  const note = (def.note ?? "").trim();
  if (note.length > 500) throw Error(`Invalid ${label}.note`);
  if (note) assertNoForbiddenClaimLanguage(note, `${label}.note`);
  return {
    role: def.role,
    displayName: def.displayName.trim(),
    definition: def.definition.trim(),
    rweExposureId,
    washoutDays,
    note,
  };
}

function assertFollowUp(
  followUp: FollowUpPeriodDefinition,
): FollowUpPeriodDefinition {
  assertClosed(followUp.endKind, FOLLOW_UP_END_KINDS, "followUp.endKind");
  if (!textOk(followUp.description, 1000)) {
    throw Error("Invalid followUp.description");
  }
  assertNoForbiddenClaimLanguage(followUp.description, "followUp.description");
  const maxDurationValue = assertNonNegInt(
    followUp.maxDurationValue ?? null,
    "followUp.maxDurationValue",
  );
  const maxDurationUnit =
    followUp.maxDurationUnit === undefined || followUp.maxDurationUnit === null
      ? null
      : followUp.maxDurationUnit;
  if (maxDurationUnit !== null) {
    assertClosed(maxDurationUnit, WINDOW_UNITS, "followUp.maxDurationUnit");
  }
  if (followUp.endKind === "fixed_duration") {
    if (maxDurationValue === null || maxDurationUnit === null) {
      throw Error("fixed_duration follow-up requires maxDurationValue and unit");
    }
  }
  const note = (followUp.note ?? "").trim();
  if (note.length > 500) throw Error("Invalid followUp.note");
  if (note) assertNoForbiddenClaimLanguage(note, "followUp.note");
  return {
    endKind: followUp.endKind,
    description: followUp.description.trim(),
    maxDurationValue,
    maxDurationUnit,
    note,
  };
}

function assertOutcome(outcome: OutcomeDefinitionRef): OutcomeDefinitionRef {
  if (!textOk(outcome.displayName, 240)) {
    throw Error("Invalid outcome.displayName");
  }
  if (!textOk(outcome.definition, 2000)) {
    throw Error("Invalid outcome.definition");
  }
  assertNoForbiddenClaimLanguage(outcome.displayName, "outcome.displayName");
  assertNoForbiddenClaimLanguage(outcome.definition, "outcome.definition");
  const rweOutcomeId =
    outcome.rweOutcomeId === undefined || outcome.rweOutcomeId === null
      ? null
      : outcome.rweOutcomeId;
  if (rweOutcomeId !== null && !RWE_OUT_RE.test(rweOutcomeId)) {
    throw Error("Invalid outcome.rweOutcomeId");
  }
  const ascertainmentWindow =
    outcome.ascertainmentWindow === undefined ||
    outcome.ascertainmentWindow === null
      ? null
      : assertTimeWindow(outcome.ascertainmentWindow, "outcome.ascertainmentWindow");
  const note = (outcome.note ?? "").trim();
  if (note.length > 500) throw Error("Invalid outcome.note");
  if (note) assertNoForbiddenClaimLanguage(note, "outcome.note");
  return {
    displayName: outcome.displayName.trim(),
    definition: outcome.definition.trim(),
    rweOutcomeId,
    ascertainmentWindow,
    note,
  };
}

export function validateCohortDefinition(
  cohort: CohortDefinition,
): CohortDefinition {
  if (!COHORT_ID_RE.test(cohort.id)) throw Error("Invalid cohort definition id");
  if (!RWE_STUDY_RE.test(cohort.rweStudyId)) throw Error("Invalid rweStudyId");
  if (!VERSION_RE.test(cohort.cohortVersion)) {
    throw Error("Invalid cohortVersion");
  }
  assertClosed(cohort.lifecycle, COHORT_LIFECYCLES, "lifecycle");
  if (cohort.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (cohort.liveEhrQueryOperational !== false) {
    throw Error("Live EHR query forbidden in PR4");
  }
  if (cohort.inventedPatientCount !== null) {
    throw Error("Invented patient counts forbidden");
  }
  assertDisclosurePolicy(cohort.disclosurePolicy);
  assertHonesty(cohort.honesty);
  assertActor(cohort.authoredBy, "author");
  if (cohort.reviewedBy !== null) assertActor(cohort.reviewedBy, "reviewer");
  return cohort;
}

export function transitionCohortDefinition(input: {
  cohort: CohortDefinition;
  to: CohortLifecycle;
  updatedAt: string;
  actor: CohortActor;
}): CohortDefinition {
  const current = validateCohortDefinition(input.cohort);
  assertClosed(input.to, COHORT_LIFECYCLES, "lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = COHORT_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal cohort transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    (input.to === "accepted_with_limitations" || input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may accept or reject cohort definitions");
  }
  if (
    input.to === "accepted_with_limitations" &&
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset"
  ) {
    throw Error(
      "Cannot accept cohort definition while authorised dataset is blocked",
    );
  }
  return validateCohortDefinition({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftAttritionReport(input: {
  id: string;
  cohort: CohortDefinition;
  steps: readonly AttritionStep[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: CohortActorKind;
  note?: string;
}): AttritionReport {
  if (!ATTRITION_ID_RE.test(input.id)) throw Error("Invalid attrition report id");
  const cohort = validateCohortDefinition(input.cohort);
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (input.steps.length === 0) throw Error("Attrition steps required");
  if (input.steps.length > 32) throw Error("Too many attrition steps");

  const steps = input.steps.map((step) => {
    assertClosed(step.stepKind, ATTRITION_STEP_KINDS, "attrition stepKind");
    if (!textOk(step.label, 240)) throw Error("Invalid attrition step label");
    assertNoForbiddenClaimLanguage(step.label, "attrition step label");
    assertClosed(
      step.disclosureStatus,
      DISCLOSURE_STATUSES,
      "attrition disclosureStatus",
    );
    const countDeclared = assertNonNegInt(
      step.countDeclared ?? null,
      "attrition countDeclared",
    );
    if (
      countDeclared !== null &&
      countDeclared < cohort.disclosurePolicy.smallCellThreshold &&
      step.disclosureStatus === "released_aggregate"
    ) {
      throw Error(
        "Small-cell counts cannot be released_aggregate — suppress or omit",
      );
    }
    if (
      step.disclosureStatus === "suppressed_small_cell" ||
      step.disclosureStatus === "suppressed_sensitive_subgroup" ||
      step.disclosureStatus === "blocked_identifiable_request"
    ) {
      if (countDeclared !== null) {
        throw Error("Suppressed attrition steps must not release countDeclared");
      }
    }
    const removedReason =
      step.removedReason === undefined || step.removedReason === null
        ? null
        : step.removedReason.trim();
    if (removedReason !== null) {
      if (!textOk(removedReason, 500)) throw Error("Invalid removedReason");
      assertNoForbiddenClaimLanguage(removedReason, "removedReason");
    }
    const note = (step.note ?? "").trim();
    if (note.length > 500) throw Error("Invalid attrition step note");
    if (note) assertNoForbiddenClaimLanguage(note, "attrition step note");
    return {
      stepKind: step.stepKind,
      label: step.label.trim(),
      countDeclared,
      disclosureStatus: step.disclosureStatus,
      removedReason,
      note,
    };
  });

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const report: AttritionReport = {
    schema: REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
    method: REPRODUCIBLE_COHORT_BUILDER_METHOD,
    version: REPRODUCIBLE_COHORT_BUILDER_VERSION,
    id: input.id,
    cohortDefinitionId: cohort.id,
    cohortVersion: cohort.cohortVersion,
    steps,
    inventedPatientCount: null,
    containsIdentifiablePhi: false,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateAttritionReport(report);
}

export function validateAttritionReport(
  report: AttritionReport,
): AttritionReport {
  if (!ATTRITION_ID_RE.test(report.id)) {
    throw Error("Invalid attrition report id");
  }
  if (!COHORT_ID_RE.test(report.cohortDefinitionId)) {
    throw Error("Invalid cohortDefinitionId");
  }
  if (report.inventedPatientCount !== null) {
    throw Error("Invented patient counts forbidden");
  }
  if (report.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  assertHonesty(report.honesty);
  assertActor(report.authoredBy, "author");
  return report;
}

export function draftEligibilityAssessment(input: {
  id: string;
  cohort: CohortDefinition;
  subjectOrCohortRef: string;
  subjectRefKind: "pseudonymous_subject" | "cohort_aggregate";
  decision: EligibilityDecision;
  matchedInclusionCriterionIds?: readonly string[];
  matchedExclusionCriterionIds?: readonly string[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: CohortActorKind;
  note?: string;
}): EligibilityAssessment {
  if (!ELIGIBILITY_ID_RE.test(input.id)) {
    throw Error("Invalid eligibility assessment id");
  }
  const cohort = validateCohortDefinition(input.cohort);
  const subject = assertSubjectRef(input.subjectRefKind, input.subjectOrCohortRef);
  assertClosed(input.decision, ELIGIBILITY_DECISIONS, "eligibility decision");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const matchedInclusionCriterionIds = assertStringList(
    input.matchedInclusionCriterionIds ?? [],
    "matchedInclusionCriterionIds",
    32,
    120,
  );
  for (const id of matchedInclusionCriterionIds) {
    if (!CRITERION_ID_RE.test(id)) {
      throw Error("Invalid matched inclusion criterion id");
    }
    if (!cohort.inclusionCriteria.some((c) => c.id === id)) {
      throw Error("matchedInclusionCriterionIds must reference inclusion criteria");
    }
  }
  const matchedExclusionCriterionIds = assertStringList(
    input.matchedExclusionCriterionIds ?? [],
    "matchedExclusionCriterionIds",
    32,
    120,
  );
  for (const id of matchedExclusionCriterionIds) {
    if (!CRITERION_ID_RE.test(id)) {
      throw Error("Invalid matched exclusion criterion id");
    }
    if (!cohort.exclusionCriteria.some((c) => c.id === id)) {
      throw Error("matchedExclusionCriterionIds must reference exclusion criteria");
    }
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const record: EligibilityAssessment = {
    schema: REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
    method: REPRODUCIBLE_COHORT_BUILDER_METHOD,
    version: REPRODUCIBLE_COHORT_BUILDER_VERSION,
    id: input.id,
    cohortDefinitionId: cohort.id,
    subjectOrCohortRef: subject.subjectOrCohortRef,
    subjectRefKind: subject.subjectRefKind,
    decision: input.decision,
    matchedInclusionCriterionIds,
    matchedExclusionCriterionIds,
    containsIdentifiablePhi: false,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateEligibilityAssessment(record);
}

export function validateEligibilityAssessment(
  record: EligibilityAssessment,
): EligibilityAssessment {
  if (!ELIGIBILITY_ID_RE.test(record.id)) {
    throw Error("Invalid eligibility assessment id");
  }
  if (!COHORT_ID_RE.test(record.cohortDefinitionId)) {
    throw Error("Invalid cohortDefinitionId");
  }
  assertSubjectRef(record.subjectRefKind, record.subjectOrCohortRef);
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "author");
  return record;
}

export function draftMissingDataAssessment(input: {
  id: string;
  cohort: CohortDefinition;
  status: MissingDataAssessmentStatus;
  variablesAssessed: readonly string[];
  summary: string;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: CohortActorKind;
  note?: string;
}): MissingDataAssessment {
  if (!MISSING_ID_RE.test(input.id)) {
    throw Error("Invalid missing-data assessment id");
  }
  const cohort = validateCohortDefinition(input.cohort);
  assertClosed(
    input.status,
    MISSING_DATA_ASSESSMENT_STATUSES,
    "missing-data status",
  );
  if (!textOk(input.summary, 2000)) throw Error("Invalid summary");
  assertNoForbiddenClaimLanguage(input.summary, "missing-data summary");
  const variablesAssessed = assertStringList(
    input.variablesAssessed,
    "variablesAssessed",
    64,
    240,
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (
    cohort.datasetAvailability === "blocked_no_authorised_clinical_dataset" &&
    input.status === "assessed_declared"
  ) {
    throw Error(
      "Cannot declare assessed missing-data while authorised dataset is blocked",
    );
  }
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const record: MissingDataAssessment = {
    schema: REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
    method: REPRODUCIBLE_COHORT_BUILDER_METHOD,
    version: REPRODUCIBLE_COHORT_BUILDER_VERSION,
    id: input.id,
    cohortDefinitionId: cohort.id,
    status: input.status,
    variablesAssessed,
    summary: input.summary.trim(),
    inventedMissingnessRates: null,
    containsIdentifiablePhi: false,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateMissingDataAssessment(record);
}

export function validateMissingDataAssessment(
  record: MissingDataAssessment,
): MissingDataAssessment {
  if (!MISSING_ID_RE.test(record.id)) {
    throw Error("Invalid missing-data assessment id");
  }
  if (!COHORT_ID_RE.test(record.cohortDefinitionId)) {
    throw Error("Invalid cohortDefinitionId");
  }
  if (record.inventedMissingnessRates !== null) {
    throw Error("Invented missingness rates forbidden");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "author");
  return record;
}

export function draftPopulationDescription(input: {
  id: string;
  cohort: CohortDefinition;
  summary: string;
  characteristics: readonly string[];
  aggregateNDeclared?: number | null;
  sensitiveSubgroup?: boolean;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: CohortActorKind;
  note?: string;
}): PopulationDescription {
  if (!POP_ID_RE.test(input.id)) {
    throw Error("Invalid population description id");
  }
  const cohort = validateCohortDefinition(input.cohort);
  if (!textOk(input.summary, 2000)) throw Error("Invalid summary");
  assertNoForbiddenClaimLanguage(input.summary, "population summary");
  const characteristics = assertStringList(
    input.characteristics,
    "characteristics",
    64,
    500,
  );
  if (characteristics.length === 0) {
    throw Error("characteristics required");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const raw = assertNonNegInt(
    input.aggregateNDeclared === undefined ? null : input.aggregateNDeclared,
    "aggregateNDeclared",
  );
  const disclosure = applySmallCellDisclosure({
    rawCountDeclared: raw,
    smallCellThreshold: cohort.disclosurePolicy.smallCellThreshold,
    sensitiveSubgroup: input.sensitiveSubgroup,
  });
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const record: PopulationDescription = {
    schema: REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
    method: REPRODUCIBLE_COHORT_BUILDER_METHOD,
    version: REPRODUCIBLE_COHORT_BUILDER_VERSION,
    id: input.id,
    cohortDefinitionId: cohort.id,
    summary: input.summary.trim(),
    characteristics,
    aggregateNDeclared: disclosure.releasedCount,
    disclosureStatus: disclosure.status,
    inventedPatientCount: null,
    containsIdentifiablePhi: false,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validatePopulationDescription(record);
}

export function validatePopulationDescription(
  record: PopulationDescription,
): PopulationDescription {
  if (!POP_ID_RE.test(record.id)) {
    throw Error("Invalid population description id");
  }
  if (!COHORT_ID_RE.test(record.cohortDefinitionId)) {
    throw Error("Invalid cohortDefinitionId");
  }
  if (record.inventedPatientCount !== null) {
    throw Error("Invented patient counts forbidden");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  assertClosed(record.disclosureStatus, DISCLOSURE_STATUSES, "disclosureStatus");
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "author");
  return record;
}

export function draftMeasurementAvailability(input: {
  id: string;
  cohort: CohortDefinition;
  measurementConcept: string;
  status: MeasurementAvailabilityStatus;
  summary: string;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: CohortActorKind;
  note?: string;
}): MeasurementAvailabilityRecord {
  if (!MEAS_ID_RE.test(input.id)) {
    throw Error("Invalid measurement availability id");
  }
  const cohort = validateCohortDefinition(input.cohort);
  if (!textOk(input.measurementConcept, 500)) {
    throw Error("Invalid measurementConcept");
  }
  assertNoForbiddenClaimLanguage(
    input.measurementConcept,
    "measurementConcept",
  );
  assertClosed(
    input.status,
    MEASUREMENT_AVAILABILITY_STATUSES,
    "measurement status",
  );
  if (!textOk(input.summary, 2000)) throw Error("Invalid summary");
  assertNoForbiddenClaimLanguage(input.summary, "measurement summary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (
    cohort.datasetAvailability === "blocked_no_authorised_clinical_dataset" &&
    input.status === "available_declared"
  ) {
    throw Error(
      "Cannot declare measurement available while authorised dataset is blocked",
    );
  }
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const record: MeasurementAvailabilityRecord = {
    schema: REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
    method: REPRODUCIBLE_COHORT_BUILDER_METHOD,
    version: REPRODUCIBLE_COHORT_BUILDER_VERSION,
    id: input.id,
    cohortDefinitionId: cohort.id,
    measurementConcept: input.measurementConcept.trim(),
    status: input.status,
    summary: input.summary.trim(),
    containsIdentifiablePhi: false,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateMeasurementAvailability(record);
}

export function validateMeasurementAvailability(
  record: MeasurementAvailabilityRecord,
): MeasurementAvailabilityRecord {
  if (!MEAS_ID_RE.test(record.id)) {
    throw Error("Invalid measurement availability id");
  }
  if (!COHORT_ID_RE.test(record.cohortDefinitionId)) {
    throw Error("Invalid cohortDefinitionId");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "author");
  return record;
}

export function draftOverlapComparabilityCheck(input: {
  id: string;
  cohort: CohortDefinition;
  status: OverlapComparabilityStatus;
  summary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: CohortActorKind;
  note?: string;
}): OverlapComparabilityCheck {
  if (!OVERLAP_ID_RE.test(input.id)) {
    throw Error("Invalid overlap/comparability check id");
  }
  const cohort = validateCohortDefinition(input.cohort);
  assertClosed(
    input.status,
    OVERLAP_COMPARABILITY_STATUSES,
    "overlap status",
  );
  if (!textOk(input.summary, 2000)) throw Error("Invalid summary");
  assertNoForbiddenClaimLanguage(input.summary, "overlap summary");
  const limitations = assertStringList(
    input.limitations,
    "limitations",
    32,
    1000,
  );
  if (limitations.length === 0) throw Error("limitations required");
  const joined = limitations.join(" ").toLowerCase();
  if (
    !/\b(observational|association|overlap|confound|not\s+proven|comparab)\b/.test(
      joined,
    )
  ) {
    throw Error(
      "limitations must declare observational/overlap/comparability/confounding constraints",
    );
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const record: OverlapComparabilityCheck = {
    schema: REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
    method: REPRODUCIBLE_COHORT_BUILDER_METHOD,
    version: REPRODUCIBLE_COHORT_BUILDER_VERSION,
    id: input.id,
    cohortDefinitionId: cohort.id,
    status: input.status,
    summary: input.summary.trim(),
    limitations,
    causalIdentificationClaimed: false,
    containsIdentifiablePhi: false,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateOverlapComparabilityCheck(record);
}

export function validateOverlapComparabilityCheck(
  record: OverlapComparabilityCheck,
): OverlapComparabilityCheck {
  if (!OVERLAP_ID_RE.test(record.id)) {
    throw Error("Invalid overlap/comparability check id");
  }
  if (!COHORT_ID_RE.test(record.cohortDefinitionId)) {
    throw Error("Invalid cohortDefinitionId");
  }
  if (record.causalIdentificationClaimed !== false) {
    throw Error("Causal identification claims forbidden");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "author");
  return record;
}

export function validateCohortSearchResult(
  result: CohortSearchResult,
): CohortSearchResult {
  if (!SEARCH_ID_RE.test(result.id)) throw Error("Invalid search result id");
  if (result.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (result.inventedPatientCount !== null) {
    throw Error("Invented patient counts forbidden");
  }
  for (const hit of result.hits) {
    assertClosed(hit.kind, SEARCH_RESULT_KINDS, "search hit kind");
    assertClosed(hit.disclosureStatus, DISCLOSURE_STATUSES, "hit disclosure");
    if (hit.containsIdentifiablePhi !== false) {
      throw Error("Search hits must not contain identifiable PHI");
    }
    if (hit.kind === "blocked_identifiable" && !result.blockedIdentifiableRequest) {
      throw Error("blocked_identifiable hit requires blockedIdentifiableRequest");
    }
  }
  if (result.blockedIdentifiableRequest) {
    const hasBlock = result.hits.some(
      (h) => h.disclosureStatus === "blocked_identifiable_request",
    );
    if (!hasBlock) {
      throw Error("Blocked identifiable request must include blocked hit");
    }
  }
  assertHonesty(result.honesty);
  assertActor(result.authoredBy, "author");
  return result;
}

export function draftDisclosureDecision(input: {
  id: string;
  cohort: CohortDefinition;
  cellLabel: string;
  rawCountDeclared: number | null;
  sensitiveSubgroup?: boolean;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: CohortActorKind;
  note?: string;
}): DisclosureDecision {
  if (!DISCLOSURE_ID_RE.test(input.id)) {
    throw Error("Invalid disclosure decision id");
  }
  const cohort = validateCohortDefinition(input.cohort);
  if (!textOk(input.cellLabel, 240)) throw Error("Invalid cellLabel");
  assertNoForbiddenClaimLanguage(input.cellLabel, "cellLabel");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const applied = applySmallCellDisclosure({
    rawCountDeclared: input.rawCountDeclared,
    smallCellThreshold: cohort.disclosurePolicy.smallCellThreshold,
    sensitiveSubgroup: input.sensitiveSubgroup,
  });
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const decision: DisclosureDecision = {
    schema: REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
    method: REPRODUCIBLE_COHORT_BUILDER_METHOD,
    version: REPRODUCIBLE_COHORT_BUILDER_VERSION,
    id: input.id,
    cohortDefinitionId: cohort.id,
    cellLabel: input.cellLabel.trim(),
    rawCountDeclared: input.rawCountDeclared,
    releasedCount: applied.releasedCount,
    status: applied.status,
    smallCellThreshold: applied.smallCellThreshold,
    containsIdentifiablePhi: false,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateDisclosureDecision(decision);
}

export function validateDisclosureDecision(
  decision: DisclosureDecision,
): DisclosureDecision {
  if (!DISCLOSURE_ID_RE.test(decision.id)) {
    throw Error("Invalid disclosure decision id");
  }
  if (!COHORT_ID_RE.test(decision.cohortDefinitionId)) {
    throw Error("Invalid cohortDefinitionId");
  }
  assertClosed(decision.status, DISCLOSURE_STATUSES, "disclosure status");
  if (decision.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (
    (decision.status === "suppressed_small_cell" ||
      decision.status === "suppressed_sensitive_subgroup") &&
    decision.releasedCount !== null
  ) {
    throw Error("Suppressed cells must not release counts");
  }
  assertHonesty(decision.honesty);
  assertActor(decision.authoredBy, "author");
  return decision;
}

export function createMemoryReproducibleCohortBuilderStore(): ReproducibleCohortBuilderStore & {
  cohorts: Map<string, CohortDefinition>;
  attrition: Map<string, AttritionReport>;
  eligibility: Map<string, EligibilityAssessment>;
  missingData: Map<string, MissingDataAssessment>;
  population: Map<string, PopulationDescription>;
  measurement: Map<string, MeasurementAvailabilityRecord>;
  overlap: Map<string, OverlapComparabilityCheck>;
  searchResults: Map<string, CohortSearchResult>;
  disclosure: Map<string, DisclosureDecision>;
} {
  const cohorts = new Map<string, CohortDefinition>();
  const attrition = new Map<string, AttritionReport>();
  const eligibility = new Map<string, EligibilityAssessment>();
  const missingData = new Map<string, MissingDataAssessment>();
  const population = new Map<string, PopulationDescription>();
  const measurement = new Map<string, MeasurementAvailabilityRecord>();
  const overlap = new Map<string, OverlapComparabilityCheck>();
  const searchResults = new Map<string, CohortSearchResult>();
  const disclosure = new Map<string, DisclosureDecision>();

  return {
    cohorts,
    attrition,
    eligibility,
    missingData,
    population,
    measurement,
    overlap,
    searchResults,
    disclosure,
    upsertCohort(cohort) {
      const validated = validateCohortDefinition(cohort);
      cohorts.set(validated.id, validated);
      return validated;
    },
    getCohort(id) {
      return cohorts.get(id) ?? null;
    },
    listCohorts(rweStudyId) {
      const all = [...cohorts.values()];
      return rweStudyId
        ? all.filter((c) => c.rweStudyId === rweStudyId)
        : all;
    },
    upsertAttrition(report) {
      const validated = validateAttritionReport(report);
      attrition.set(validated.id, validated);
      return validated;
    },
    getAttrition(id) {
      return attrition.get(id) ?? null;
    },
    listAttrition(cohortDefinitionId) {
      const all = [...attrition.values()];
      return cohortDefinitionId
        ? all.filter((r) => r.cohortDefinitionId === cohortDefinitionId)
        : all;
    },
    upsertEligibility(record) {
      const validated = validateEligibilityAssessment(record);
      eligibility.set(validated.id, validated);
      return validated;
    },
    getEligibility(id) {
      return eligibility.get(id) ?? null;
    },
    listEligibility(cohortDefinitionId) {
      const all = [...eligibility.values()];
      return cohortDefinitionId
        ? all.filter((r) => r.cohortDefinitionId === cohortDefinitionId)
        : all;
    },
    upsertMissingData(record) {
      const validated = validateMissingDataAssessment(record);
      missingData.set(validated.id, validated);
      return validated;
    },
    getMissingData(id) {
      return missingData.get(id) ?? null;
    },
    listMissingData(cohortDefinitionId) {
      const all = [...missingData.values()];
      return cohortDefinitionId
        ? all.filter((r) => r.cohortDefinitionId === cohortDefinitionId)
        : all;
    },
    upsertPopulation(record) {
      const validated = validatePopulationDescription(record);
      population.set(validated.id, validated);
      return validated;
    },
    getPopulation(id) {
      return population.get(id) ?? null;
    },
    listPopulation(cohortDefinitionId) {
      const all = [...population.values()];
      return cohortDefinitionId
        ? all.filter((r) => r.cohortDefinitionId === cohortDefinitionId)
        : all;
    },
    upsertMeasurement(record) {
      const validated = validateMeasurementAvailability(record);
      measurement.set(validated.id, validated);
      return validated;
    },
    getMeasurement(id) {
      return measurement.get(id) ?? null;
    },
    listMeasurement(cohortDefinitionId) {
      const all = [...measurement.values()];
      return cohortDefinitionId
        ? all.filter((r) => r.cohortDefinitionId === cohortDefinitionId)
        : all;
    },
    upsertOverlap(record) {
      const validated = validateOverlapComparabilityCheck(record);
      overlap.set(validated.id, validated);
      return validated;
    },
    getOverlap(id) {
      return overlap.get(id) ?? null;
    },
    listOverlap(cohortDefinitionId) {
      const all = [...overlap.values()];
      return cohortDefinitionId
        ? all.filter((r) => r.cohortDefinitionId === cohortDefinitionId)
        : all;
    },
    upsertSearchResult(result) {
      const validated = validateCohortSearchResult(result);
      searchResults.set(validated.id, validated);
      return validated;
    },
    getSearchResult(id) {
      return searchResults.get(id) ?? null;
    },
    listSearchResults() {
      return [...searchResults.values()];
    },
    upsertDisclosure(decision) {
      const validated = validateDisclosureDecision(decision);
      disclosure.set(validated.id, validated);
      return validated;
    },
    getDisclosure(id) {
      return disclosure.get(id) ?? null;
    },
    listDisclosure(cohortDefinitionId) {
      const all = [...disclosure.values()];
      return cohortDefinitionId
        ? all.filter((d) => d.cohortDefinitionId === cohortDefinitionId)
        : all;
    },
  };
}

export function projectReproducibleCohortBuilderPersistenceLines(input: {
  cohorts: readonly CohortDefinition[];
  attrition?: readonly AttritionReport[];
  eligibility?: readonly EligibilityAssessment[];
  missingData?: readonly MissingDataAssessment[];
  population?: readonly PopulationDescription[];
  measurement?: readonly MeasurementAvailabilityRecord[];
  overlap?: readonly OverlapComparabilityCheck[];
  searchResults?: readonly CohortSearchResult[];
  disclosure?: readonly DisclosureDecision[];
}): string[] {
  for (const c of input.cohorts) validateCohortDefinition(c);
  for (const r of input.attrition ?? []) validateAttritionReport(r);
  for (const r of input.eligibility ?? []) validateEligibilityAssessment(r);
  for (const r of input.missingData ?? []) validateMissingDataAssessment(r);
  for (const r of input.population ?? []) validatePopulationDescription(r);
  for (const r of input.measurement ?? []) validateMeasurementAvailability(r);
  for (const r of input.overlap ?? []) validateOverlapComparabilityCheck(r);
  for (const r of input.searchResults ?? []) validateCohortSearchResult(r);
  for (const r of input.disclosure ?? []) validateDisclosureDecision(r);

  return [
    `schema=${REPRODUCIBLE_COHORT_BUILDER_SCHEMA}`,
    `method=${REPRODUCIBLE_COHORT_BUILDER_METHOD}`,
    `version=${REPRODUCIBLE_COHORT_BUILDER_VERSION}`,
    `cohorts=${input.cohorts.length}`,
    `attrition=${(input.attrition ?? []).length}`,
    `eligibility=${(input.eligibility ?? []).length}`,
    `missingData=${(input.missingData ?? []).length}`,
    `population=${(input.population ?? []).length}`,
    `measurement=${(input.measurement ?? []).length}`,
    `overlap=${(input.overlap ?? []).length}`,
    `searchResults=${(input.searchResults ?? []).length}`,
    `disclosure=${(input.disclosure ?? []).length}`,
    `noUnrestrictedPatientDb=true`,
    `observationalCohortIsNotProvenEffect=true`,
    `noIdentifiableSearch=true`,
    `smallCellDisclosure=true`,
    `inventedPatientCounts=false`,
    `liveEhrQuery=false`,
    `phiIngestion=false`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintCohortDefinition(cohort: CohortDefinition): string {
  const validated = validateCohortDefinition(cohort);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildReproducibleCohortBuilderPack(input: {
  cohorts: readonly CohortDefinition[];
  attrition: readonly AttritionReport[];
  eligibility: readonly EligibilityAssessment[];
  missingData: readonly MissingDataAssessment[];
  population: readonly PopulationDescription[];
  measurement: readonly MeasurementAvailabilityRecord[];
  overlap: readonly OverlapComparabilityCheck[];
  searchResults: readonly CohortSearchResult[];
  disclosure: readonly DisclosureDecision[];
  asOf: string;
}): {
  schema: typeof REPRODUCIBLE_COHORT_BUILDER_SCHEMA;
  method: typeof REPRODUCIBLE_COHORT_BUILDER_METHOD;
  version: typeof REPRODUCIBLE_COHORT_BUILDER_VERSION;
  asOf: string;
  cohortCount: number;
  attritionCount: number;
  eligibilityCount: number;
  missingDataCount: number;
  populationCount: number;
  measurementCount: number;
  overlapCount: number;
  searchResultCount: number;
  disclosureCount: number;
  honesty: ReproducibleCohortBuilderHonesty;
  cohorts: readonly CohortDefinition[];
  attrition: readonly AttritionReport[];
  eligibility: readonly EligibilityAssessment[];
  missingData: readonly MissingDataAssessment[];
  population: readonly PopulationDescription[];
  measurement: readonly MeasurementAvailabilityRecord[];
  overlap: readonly OverlapComparabilityCheck[];
  searchResults: readonly CohortSearchResult[];
  disclosure: readonly DisclosureDecision[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const cohorts = input.cohorts.map(validateCohortDefinition);
  const attrition = input.attrition.map(validateAttritionReport);
  const eligibility = input.eligibility.map(validateEligibilityAssessment);
  const missingData = input.missingData.map(validateMissingDataAssessment);
  const population = input.population.map(validatePopulationDescription);
  const measurement = input.measurement.map(validateMeasurementAvailability);
  const overlap = input.overlap.map(validateOverlapComparabilityCheck);
  const searchResults = input.searchResults.map(validateCohortSearchResult);
  const disclosure = input.disclosure.map(validateDisclosureDecision);
  return {
    schema: REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
    method: REPRODUCIBLE_COHORT_BUILDER_METHOD,
    version: REPRODUCIBLE_COHORT_BUILDER_VERSION,
    asOf: input.asOf,
    cohortCount: cohorts.length,
    attritionCount: attrition.length,
    eligibilityCount: eligibility.length,
    missingDataCount: missingData.length,
    populationCount: population.length,
    measurementCount: measurement.length,
    overlapCount: overlap.length,
    searchResultCount: searchResults.length,
    disclosureCount: disclosure.length,
    honesty: {...DEFAULT_HONESTY},
    cohorts,
    attrition,
    eligibility,
    missingData,
    population,
    measurement,
    overlap,
    searchResults,
    disclosure,
  };
}

/** Fixture helper: minimal inclusion + exclusion criteria for drafts. */
export function fixtureInclusionExclusionCriteria(): {
  inclusion: CohortCriterion[];
  exclusion: CohortCriterion[];
} {
  return {
    inclusion: [
      {
        id: "hsi-rcb-crit-inc-diagnosis",
        polarity: "inclusion",
        domain: "diagnosis",
        description: "Fixture qualifying diagnosis code envelope",
        codeSystemRef: "fixture-icd10",
        codeValue: "FIX.01",
        lookbackDays: 365,
        note: "Inclusion fixture",
      },
      {
        id: "hsi-rcb-crit-inc-observation",
        polarity: "inclusion",
        domain: "observation_window",
        description: "Fixture continuous observation before index",
        codeSystemRef: null,
        codeValue: null,
        lookbackDays: 180,
        note: "Baseline observation fixture",
      },
    ],
    exclusion: [
      {
        id: "hsi-rcb-crit-exc-prior-exposure",
        polarity: "exclusion",
        domain: "medication",
        description: "Fixture prior exposure washout exclusion",
        codeSystemRef: "fixture-atc",
        codeValue: "FIX-ATC",
        lookbackDays: 180,
        note: "Exclusion fixture",
      },
    ],
  };
}
