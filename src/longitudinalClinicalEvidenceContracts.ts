/**
 * Milestone 14 / PR3 — Longitudinal Clinical Evidence Model.
 *
 * Time-aware clinical research *analysis contracts* layered on M14 PR1 RWE
 * envelopes and PR2 secure clinical interop ids. Supports disease trajectories,
 * laboratory trends, treatment timelines, clinical events, PROs, functional
 * outcomes, organ-specific measures, and follow-up completeness — as governed
 * envelopes only.
 *
 * Does NOT ingest live PHI, run live longitudinal engines, fabricate
 * trajectories/effects/survival curves, claim proven treatment effects,
 * ship workbench UI / cohort builder (PR4), invent Gate C / MoU, or promote
 * identifiable records into the curated KG.
 *
 * Temporal honesty (fail-closed):
 * - Distinguish event / record creation / ingestion / treatment initiation /
 *   baseline / follow-up / outcome ascertainment times.
 * - Refuse future information when defining earlier exposure or eligibility.
 * - Require explicit irregular observation intervals and missing-data handling.
 *
 * Binding honesty:
 * - Research decision support only; fixtures/contracts until authorised.
 * - Observational trajectory ≠ proven treatment effect.
 * - Pseudonymised data may still be personal data.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA =
  "hsi-longitudinal-clinical-evidence-1" as const;
export const LONGITUDINAL_CLINICAL_EVIDENCE_METHOD =
  "hsi.longitudinal_clinical_evidence.v1" as const;
export const LONGITUDINAL_CLINICAL_EVIDENCE_VERSION = "0.1.0" as const;

export const LONGITUDINAL_ANALYSIS_KINDS = [
  "disease_trajectory",
  "laboratory_trend",
  "treatment_timeline",
  "clinical_event",
  "patient_reported_outcome",
  "functional_outcome",
  "organ_specific_measure",
  "follow_up_completeness",
] as const;
export type LongitudinalAnalysisKind =
  (typeof LONGITUDINAL_ANALYSIS_KINDS)[number];

export const TEMPORAL_ROLES = [
  "event_time",
  "record_creation_time",
  "ingestion_time",
  "treatment_initiation_time",
  "baseline_time",
  "follow_up_time",
  "outcome_ascertainment_time",
] as const;
export type TemporalRole = (typeof TEMPORAL_ROLES)[number];

export const OBSERVATION_INTERVAL_KINDS = [
  "regular_declared",
  "irregular_declared",
  "sparse_declared",
  "unknown_interval",
] as const;
export type ObservationIntervalKind =
  (typeof OBSERVATION_INTERVAL_KINDS)[number];

export const MISSING_DATA_HANDLINGS = [
  "declared_missing",
  "not_applicable",
  "imputation_not_performed",
  "complete_case_declared",
  "explicitly_unresolved",
] as const;
export type MissingDataHandling = (typeof MISSING_DATA_HANDLINGS)[number];

export const LONGITUDINAL_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_temporal_leakage",
  "blocked_awaiting_authorised_dataset",
  "rejected",
  "superseded",
] as const;
export type LongitudinalLifecycle = (typeof LONGITUDINAL_LIFECYCLES)[number];

export const TEMPORAL_INTEGRITY_STATUSES = [
  "passed_declared_checks",
  "failed_future_information_leakage",
  "failed_collapsed_temporal_roles",
  "failed_missing_anchors",
  "not_assessed",
] as const;
export type TemporalIntegrityStatus =
  (typeof TEMPORAL_INTEGRITY_STATUSES)[number];

export const DATASET_AVAILABILITY = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type LongitudinalDatasetAvailability =
  (typeof DATASET_AVAILABILITY)[number];

export const ACCESS_CLASSIFICATIONS = [
  "fixture_engineering",
  "authorised_pseudonymous_research",
  "authorised_aggregate_only",
  "restricted_not_ingested",
] as const;
export type LongitudinalAccessClassification =
  (typeof ACCESS_CLASSIFICATIONS)[number];

export const SUBJECT_REF_KINDS = [
  "pseudonymous_subject",
  "cohort_aggregate",
] as const;
export type LongitudinalSubjectRefKind = (typeof SUBJECT_REF_KINDS)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type LongitudinalActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type LongitudinalDataBasis = (typeof DATA_BASES)[number];

const SPEC_ID_RE = /^hsi-lce-spec-[a-z0-9-]{3,80}$/;
const SERIES_ID_RE = /^hsi-lce-ser-[a-z0-9-]{3,80}$/;
const RESULT_ID_RE = /^hsi-lce-res-[a-z0-9-]{3,80}$/;
const CHECK_ID_RE = /^hsi-lce-tmp-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const RWE_STUDY_RE = /^hsi-rwe-study-[a-z0-9-]{3,80}$/;
const RWE_OBS_RE = /^hsi-rwe-obs-[a-z0-9-]{3,80}$/;
const RWE_EXP_RE = /^hsi-rwe-exp-[a-z0-9-]{3,80}$/;
const RWE_OUT_RE = /^hsi-rwe-out-[a-z0-9-]{3,80}$/;
const RWE_ANL_RE = /^hsi-rwe-anl-[a-z0-9-]{3,80}$/;
const SCDI_SRC_RE = /^hsi-scdi-src-[a-z0-9-]{3,80}$/;
const SCDI_TMP_RE = /^hsi-scdi-tmp-[a-z0-9-]{3,80}$/;

export type LongitudinalClinicalEvidenceHonesty = {
  researchDecisionSupportOnly: true;
  noUnrestrictedCentralPatientDatabase: true;
  observationalTrajectoryIsNotProvenTreatmentEffect: true;
  noFutureInformationForEarlierExposureOrEligibility: true;
  temporalRolesMustRemainDistinct: true;
  irregularIntervalsAndMissingDataMustBeExplicit: true;
  identifiableRecordsOutsideScientificKg: true;
  pseudonymisedMayStillBePersonalData: true;
  noPhiIngestion: true;
  noFabricatedTrajectoriesOrEffects: true;
  noPatientTreatmentDirectives: true;
  noWorkbenchUi: true;
  noLiveLongitudinalEngineClaim: true;
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

export type LongitudinalActor = {
  principalId: string;
  actorKind: LongitudinalActorKind;
};

export type TemporalAnchor = {
  role: TemporalRole;
  timestamp: string | null;
  declaredAbsent: boolean;
  note: string;
};

export type TemporalAnchorSet = {
  eventTime: TemporalAnchor;
  recordCreationTime: TemporalAnchor;
  ingestionTime: TemporalAnchor;
  treatmentInitiationTime: TemporalAnchor;
  baselineTime: TemporalAnchor;
  followUpTime: TemporalAnchor;
  outcomeAscertainmentTime: TemporalAnchor;
};

export type LongitudinalAnalysisSpec = {
  schema: typeof LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA;
  method: typeof LONGITUDINAL_CLINICAL_EVIDENCE_METHOD;
  version: typeof LONGITUDINAL_CLINICAL_EVIDENCE_VERSION;
  id: string;
  analysisKind: LongitudinalAnalysisKind;
  displayName: string;
  scientificQuestion: string;
  rweStudyId: string;
  /** Optional PR1 observation / exposure / outcome / analysis refs. */
  rweObservationIds: readonly string[];
  rweExposureIds: readonly string[];
  rweOutcomeIds: readonly string[];
  rweAnalysisId: string | null;
  /** Optional PR2 interop source / temporal alignment refs. */
  interopDataSourceId: string | null;
  interopTemporalAlignmentId: string | null;
  subjectRefKind: LongitudinalSubjectRefKind;
  subjectOrCohortRef: string;
  temporalAnchors: TemporalAnchorSet;
  observationIntervalKind: ObservationIntervalKind;
  irregularIntervalNote: string | null;
  missingDataHandling: MissingDataHandling;
  missingDataNote: string;
  eligibilityDefinitionTimeRole: TemporalRole;
  exposureDefinitionTimeRole: TemporalRole;
  datasetAvailability: LongitudinalDatasetAvailability;
  accessClassification: LongitudinalAccessClassification;
  containsIdentifiablePhi: false;
  liveLongitudinalEngineOperational: false;
  lifecycle: LongitudinalLifecycle;
  reviewedBy: LongitudinalActor | null;
  authoredBy: LongitudinalActor;
  dataBasis: LongitudinalDataBasis;
  fixtureHonesty: boolean;
  honesty: LongitudinalClinicalEvidenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type LongitudinalObservationPoint = {
  sequenceIndex: number;
  intendedRole: TemporalRole;
  eventTime: string | null;
  recordCreationTime: string | null;
  ingestionTime: string | null;
  valueDeclared: string | null;
  unit: string | null;
  missingnessDeclared: boolean;
  intervalDaysFromPrior: number | null;
  note: string;
};

export type LongitudinalObservationSeries = {
  schema: typeof LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA;
  method: typeof LONGITUDINAL_CLINICAL_EVIDENCE_METHOD;
  version: typeof LONGITUDINAL_CLINICAL_EVIDENCE_VERSION;
  id: string;
  analysisSpecId: string;
  rweStudyId: string;
  clinicalConcept: string;
  observationIntervalKind: ObservationIntervalKind;
  missingDataHandling: MissingDataHandling;
  points: readonly LongitudinalObservationPoint[];
  containsIdentifiablePhi: false;
  fabricatedTrajectory: null;
  authoredBy: LongitudinalActor;
  honesty: LongitudinalClinicalEvidenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type TemporalIntegrityCheck = {
  schema: typeof LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA;
  method: typeof LONGITUDINAL_CLINICAL_EVIDENCE_METHOD;
  version: typeof LONGITUDINAL_CLINICAL_EVIDENCE_VERSION;
  id: string;
  analysisSpecId: string;
  status: TemporalIntegrityStatus;
  checksPerformed: readonly string[];
  failures: readonly string[];
  usedFutureInformationForEarlierExposureOrEligibility: false | true;
  collapsedTemporalRoles: false | true;
  authoredBy: LongitudinalActor;
  honesty: LongitudinalClinicalEvidenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type LongitudinalAnalysisResult = {
  schema: typeof LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA;
  method: typeof LONGITUDINAL_CLINICAL_EVIDENCE_METHOD;
  version: typeof LONGITUDINAL_CLINICAL_EVIDENCE_VERSION;
  id: string;
  analysisSpecId: string;
  rweStudyId: string;
  analysisKind: LongitudinalAnalysisKind;
  summary: string;
  temporalIntegrityStatus: TemporalIntegrityStatus;
  observationIntervalKind: ObservationIntervalKind;
  missingDataHandling: MissingDataHandling;
  limitations: readonly string[];
  /** Declared narrative only when non-invented; otherwise null. */
  trajectoryNarrative: string | null;
  observationalTrajectoryIsNotProvenTreatmentEffect: true;
  causalIdentificationClaimed: false;
  inventedPatientCount: null;
  inventedEffectEstimate: null;
  inventedSurvivalCurve: null;
  fabricatedTrajectory: null;
  lifecycle: LongitudinalLifecycle;
  reviewedBy: LongitudinalActor | null;
  authoredBy: LongitudinalActor;
  dataBasis: LongitudinalDataBasis;
  fixtureHonesty: boolean;
  honesty: LongitudinalClinicalEvidenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type LongitudinalClinicalEvidenceStore = {
  upsertSpec(spec: LongitudinalAnalysisSpec): LongitudinalAnalysisSpec;
  getSpec(id: string): LongitudinalAnalysisSpec | null;
  listSpecs(rweStudyId?: string): readonly LongitudinalAnalysisSpec[];
  upsertSeries(
    series: LongitudinalObservationSeries,
  ): LongitudinalObservationSeries;
  getSeries(id: string): LongitudinalObservationSeries | null;
  listSeries(analysisSpecId?: string): readonly LongitudinalObservationSeries[];
  upsertTemporalCheck(
    check: TemporalIntegrityCheck,
  ): TemporalIntegrityCheck;
  getTemporalCheck(id: string): TemporalIntegrityCheck | null;
  listTemporalChecks(
    analysisSpecId?: string,
  ): readonly TemporalIntegrityCheck[];
  upsertResult(result: LongitudinalAnalysisResult): LongitudinalAnalysisResult;
  getResult(id: string): LongitudinalAnalysisResult | null;
  listResults(analysisSpecId?: string): readonly LongitudinalAnalysisResult[];
};

const DEFAULT_HONESTY: LongitudinalClinicalEvidenceHonesty = {
  researchDecisionSupportOnly: true,
  noUnrestrictedCentralPatientDatabase: true,
  observationalTrajectoryIsNotProvenTreatmentEffect: true,
  noFutureInformationForEarlierExposureOrEligibility: true,
  temporalRolesMustRemainDistinct: true,
  irregularIntervalsAndMissingDataMustBeExplicit: true,
  identifiableRecordsOutsideScientificKg: true,
  pseudonymisedMayStillBePersonalData: true,
  noPhiIngestion: true,
  noFabricatedTrajectoriesOrEffects: true,
  noPatientTreatmentDirectives: true,
  noWorkbenchUi: true,
  noLiveLongitudinalEngineClaim: true,
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

const SPEC_TRANSITIONS: Record<
  LongitudinalLifecycle,
  readonly LongitudinalLifecycle[]
> = {
  draft: [
    "under_review",
    "blocked_temporal_leakage",
    "blocked_awaiting_authorised_dataset",
    "superseded",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_temporal_leakage",
    "blocked_awaiting_authorised_dataset",
    "rejected",
    "superseded",
  ],
  accepted_with_limitations: [
    "blocked_temporal_leakage",
    "superseded",
  ],
  blocked_temporal_leakage: ["draft", "superseded"],
  blocked_awaiting_authorised_dataset: [
    "under_review",
    "superseded",
  ],
  rejected: ["superseded"],
  superseded: [],
};

const RESULT_TRANSITIONS: Record<
  LongitudinalLifecycle,
  readonly LongitudinalLifecycle[]
> = {
  draft: ["under_review", "blocked_temporal_leakage", "superseded"],
  under_review: [
    "accepted_with_limitations",
    "blocked_temporal_leakage",
    "rejected",
    "superseded",
  ],
  accepted_with_limitations: ["superseded"],
  blocked_temporal_leakage: ["draft", "superseded"],
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

function assertActor(
  actor: LongitudinalActor,
  label: string,
): LongitudinalActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principal`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actor kind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}

function assertHonesty(honesty: LongitudinalClinicalEvidenceHonesty): void {
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Must remain research decision support only");
  }
  if (honesty.noUnrestrictedCentralPatientDatabase !== true) {
    throw Error("Unrestricted central patient database forbidden");
  }
  if (honesty.observationalTrajectoryIsNotProvenTreatmentEffect !== true) {
    throw Error("Observational trajectory is not proven treatment effect");
  }
  if (honesty.noFutureInformationForEarlierExposureOrEligibility !== true) {
    throw Error("Future information for earlier exposure/eligibility forbidden");
  }
  if (honesty.temporalRolesMustRemainDistinct !== true) {
    throw Error("Temporal roles must remain distinct");
  }
  if (honesty.irregularIntervalsAndMissingDataMustBeExplicit !== true) {
    throw Error("Irregular intervals and missing data must be explicit");
  }
  if (honesty.identifiableRecordsOutsideScientificKg !== true) {
    throw Error("Identifiable records must stay outside scientific KG");
  }
  if (honesty.pseudonymisedMayStillBePersonalData !== true) {
    throw Error("Pseudonymised data may still be personal data");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noFabricatedTrajectoriesOrEffects !== true) {
    throw Error("Fabricated trajectories or effects forbidden");
  }
  if (honesty.noPatientTreatmentDirectives !== true) {
    throw Error("Patient treatment directives forbidden");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR3");
  }
  if (honesty.noLiveLongitudinalEngineClaim !== true) {
    throw Error("Live longitudinal engine claim forbidden");
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
    throw Error("Scientific approval must stay false in PR3");
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
    /\bhazard\s*ratio\s*=\s*[\d.]+\b/.test(lower) ||
    /\bodds\s*ratio\s*=\s*[\d.]+\b/.test(lower) ||
    /\bsurvival\s+curve\s*=\s*/.test(lower) ||
    /\bfabricated\s+trajectory\b/.test(lower) ||
    /\blive\s+longitudinal\s+engine\b/.test(lower) ||
    /\btreat(ment)?\s+recommendation\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower) ||
    /\bunrestricted\s+patient\s+(db|database)\b/.test(lower) ||
    /\bprescribe\b/.test(lower)
  ) {
    throw Error(
      `${label} must not invent counts/effects/trajectories, claim proven treatment effects, include identifiers, or issue treatment directives`,
    );
  }
}

function assertSubjectRef(
  kind: LongitudinalSubjectRefKind,
  ref: string,
): {subjectRefKind: LongitudinalSubjectRefKind; subjectOrCohortRef: string} {
  assertClosed(kind, SUBJECT_REF_KINDS, "subject ref kind");
  if (!REF_ID_RE.test(ref)) throw Error("Invalid subjectOrCohortRef");
  if (/^(nhs|mrn|ssn|name|dob)-/i.test(ref)) {
    throw Error("Direct personal identifier refs forbidden");
  }
  return {subjectRefKind: kind, subjectOrCohortRef: ref};
}

function assertOptionalIso(
  value: string | null | undefined,
  label: string,
): string | null {
  if (value === undefined || value === null) return null;
  if (!isIsoTimestamp(value)) throw Error(`Invalid ${label}`);
  return value;
}

function draftAnchor(input: {
  role: TemporalRole;
  timestamp?: string | null;
  declaredAbsent?: boolean;
  note?: string;
}): TemporalAnchor {
  assertClosed(input.role, TEMPORAL_ROLES, "temporal role");
  const timestamp = assertOptionalIso(input.timestamp, input.role);
  const declaredAbsent = input.declaredAbsent ?? timestamp === null;
  if (timestamp === null && !declaredAbsent) {
    throw Error(`${input.role} requires timestamp or declaredAbsent`);
  }
  if (timestamp !== null && declaredAbsent) {
    throw Error(`${input.role} cannot be both present and declaredAbsent`);
  }
  const note = (input.note ?? "").trim();
  if (note.length > 500) throw Error(`Invalid ${input.role} note`);
  if (note) assertNoForbiddenClaimLanguage(note, `${input.role} note`);
  return {
    role: input.role,
    timestamp,
    declaredAbsent,
    note,
  };
}

function assertTemporalAnchorSet(
  anchors: TemporalAnchorSet,
): TemporalAnchorSet {
  const roles: TemporalRole[] = [
    anchors.eventTime.role,
    anchors.recordCreationTime.role,
    anchors.ingestionTime.role,
    anchors.treatmentInitiationTime.role,
    anchors.baselineTime.role,
    anchors.followUpTime.role,
    anchors.outcomeAscertainmentTime.role,
  ];
  const expected: TemporalRole[] = [
    "event_time",
    "record_creation_time",
    "ingestion_time",
    "treatment_initiation_time",
    "baseline_time",
    "follow_up_time",
    "outcome_ascertainment_time",
  ];
  for (let i = 0; i < expected.length; i++) {
    if (roles[i] !== expected[i]) {
      throw Error("Temporal roles must remain distinct and ordered");
    }
  }
  return {
    eventTime: draftAnchor(anchors.eventTime),
    recordCreationTime: draftAnchor(anchors.recordCreationTime),
    ingestionTime: draftAnchor(anchors.ingestionTime),
    treatmentInitiationTime: draftAnchor(anchors.treatmentInitiationTime),
    baselineTime: draftAnchor(anchors.baselineTime),
    followUpTime: draftAnchor(anchors.followUpTime),
    outcomeAscertainmentTime: draftAnchor(anchors.outcomeAscertainmentTime),
  };
}

function anchorTimestamp(
  anchors: TemporalAnchorSet,
  role: TemporalRole,
): string | null {
  switch (role) {
    case "event_time":
      return anchors.eventTime.timestamp;
    case "record_creation_time":
      return anchors.recordCreationTime.timestamp;
    case "ingestion_time":
      return anchors.ingestionTime.timestamp;
    case "treatment_initiation_time":
      return anchors.treatmentInitiationTime.timestamp;
    case "baseline_time":
      return anchors.baselineTime.timestamp;
    case "follow_up_time":
      return anchors.followUpTime.timestamp;
    case "outcome_ascertainment_time":
      return anchors.outcomeAscertainmentTime.timestamp;
    default: {
      const _exhaustive: never = role;
      throw Error(`Unhandled temporal role: ${_exhaustive}`);
    }
  }
}

/**
 * Fail-closed temporal integrity: refuse using later-role information to
 * define earlier exposure or eligibility windows.
 */
export function evaluateTemporalIntegrity(input: {
  temporalAnchors: TemporalAnchorSet;
  eligibilityDefinitionTimeRole: TemporalRole;
  exposureDefinitionTimeRole: TemporalRole;
}): {
  status: TemporalIntegrityStatus;
  failures: readonly string[];
  usedFutureInformationForEarlierExposureOrEligibility: boolean;
  collapsedTemporalRoles: boolean;
  checksPerformed: readonly string[];
} {
  const anchors = assertTemporalAnchorSet(input.temporalAnchors);
  assertClosed(
    input.eligibilityDefinitionTimeRole,
    TEMPORAL_ROLES,
    "eligibilityDefinitionTimeRole",
  );
  assertClosed(
    input.exposureDefinitionTimeRole,
    TEMPORAL_ROLES,
    "exposureDefinitionTimeRole",
  );

  const checksPerformed = [
    "distinct_temporal_roles",
    "eligibility_not_defined_by_future_outcome",
    "exposure_not_defined_by_future_outcome",
    "baseline_before_follow_up_when_both_present",
    "treatment_initiation_not_after_outcome_ascertainment_when_both_present",
  ];
  const failures: string[] = [];

  const timestamps = [
    anchors.eventTime.timestamp,
    anchors.recordCreationTime.timestamp,
    anchors.ingestionTime.timestamp,
    anchors.treatmentInitiationTime.timestamp,
    anchors.baselineTime.timestamp,
    anchors.followUpTime.timestamp,
    anchors.outcomeAscertainmentTime.timestamp,
  ].filter((t): t is string => t !== null);
  const unique = new Set(timestamps);
  let collapsedTemporalRoles = false;
  if (timestamps.length >= 2 && unique.size === 1) {
    collapsedTemporalRoles = true;
    failures.push(
      "All populated temporal anchors share one timestamp — roles collapsed",
    );
  }

  const eligibilityTs = anchorTimestamp(
    anchors,
    input.eligibilityDefinitionTimeRole,
  );
  const exposureTs = anchorTimestamp(anchors, input.exposureDefinitionTimeRole);
  const outcomeTs = anchors.outcomeAscertainmentTime.timestamp;
  const followUpTs = anchors.followUpTime.timestamp;
  const baselineTs = anchors.baselineTime.timestamp;
  const treatmentTs = anchors.treatmentInitiationTime.timestamp;

  let usedFuture = false;

  if (
    input.eligibilityDefinitionTimeRole === "outcome_ascertainment_time" ||
    input.eligibilityDefinitionTimeRole === "follow_up_time"
  ) {
    usedFuture = true;
    failures.push(
      "Eligibility must not be defined by follow-up or outcome ascertainment time",
    );
  }
  if (
    input.exposureDefinitionTimeRole === "outcome_ascertainment_time" ||
    input.exposureDefinitionTimeRole === "follow_up_time"
  ) {
    usedFuture = true;
    failures.push(
      "Exposure must not be defined by follow-up or outcome ascertainment time",
    );
  }

  if (
    eligibilityTs !== null &&
    outcomeTs !== null &&
    Date.parse(eligibilityTs) > Date.parse(outcomeTs)
  ) {
    usedFuture = true;
    failures.push(
      "Eligibility timestamp is after outcome ascertainment (future information)",
    );
  }
  if (
    exposureTs !== null &&
    outcomeTs !== null &&
    Date.parse(exposureTs) > Date.parse(outcomeTs)
  ) {
    usedFuture = true;
    failures.push(
      "Exposure timestamp is after outcome ascertainment (future information)",
    );
  }
  if (
    baselineTs !== null &&
    followUpTs !== null &&
    Date.parse(baselineTs) > Date.parse(followUpTs)
  ) {
    usedFuture = true;
    failures.push("Baseline time is after follow-up time");
  }
  if (
    treatmentTs !== null &&
    outcomeTs !== null &&
    Date.parse(treatmentTs) > Date.parse(outcomeTs)
  ) {
    usedFuture = true;
    failures.push(
      "Treatment initiation is after outcome ascertainment (future information)",
    );
  }

  let status: TemporalIntegrityStatus = "passed_declared_checks";
  if (failures.length === 0) {
    status = "passed_declared_checks";
  } else if (usedFuture) {
    status = "failed_future_information_leakage";
  } else if (collapsedTemporalRoles) {
    status = "failed_collapsed_temporal_roles";
  } else {
    status = "failed_missing_anchors";
  }

  return {
    status,
    failures,
    usedFutureInformationForEarlierExposureOrEligibility: usedFuture,
    collapsedTemporalRoles,
    checksPerformed,
  };
}

function assertIdList(
  values: readonly string[],
  re: RegExp,
  label: string,
  maxItems: number,
): readonly string[] {
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  return values.map((v) => {
    if (!re.test(v)) throw Error(`Invalid ${label}`);
    return v;
  });
}

export function draftLongitudinalAnalysisSpec(input: {
  id: string;
  analysisKind: LongitudinalAnalysisKind;
  displayName: string;
  scientificQuestion: string;
  rweStudyId: string;
  subjectRefKind: LongitudinalSubjectRefKind;
  subjectOrCohortRef: string;
  temporalAnchors: TemporalAnchorSet;
  observationIntervalKind: ObservationIntervalKind;
  missingDataHandling: MissingDataHandling;
  missingDataNote: string;
  eligibilityDefinitionTimeRole: TemporalRole;
  exposureDefinitionTimeRole: TemporalRole;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LongitudinalActorKind;
  rweObservationIds?: readonly string[];
  rweExposureIds?: readonly string[];
  rweOutcomeIds?: readonly string[];
  rweAnalysisId?: string | null;
  interopDataSourceId?: string | null;
  interopTemporalAlignmentId?: string | null;
  irregularIntervalNote?: string | null;
  datasetAvailability?: LongitudinalDatasetAvailability;
  accessClassification?: LongitudinalAccessClassification;
  dataBasis?: LongitudinalDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): LongitudinalAnalysisSpec {
  if (!SPEC_ID_RE.test(input.id)) throw Error("Invalid analysis spec id");
  assertClosed(input.analysisKind, LONGITUDINAL_ANALYSIS_KINDS, "analysis kind");
  if (!textOk(input.displayName, 240)) throw Error("Invalid displayName");
  if (!textOk(input.scientificQuestion, 4000)) {
    throw Error("Invalid scientific question");
  }
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(
    input.scientificQuestion,
    "scientificQuestion",
  );
  if (!RWE_STUDY_RE.test(input.rweStudyId)) throw Error("Invalid rweStudyId");
  const subject = assertSubjectRef(
    input.subjectRefKind,
    input.subjectOrCohortRef,
  );
  const temporalAnchors = assertTemporalAnchorSet(input.temporalAnchors);
  assertClosed(
    input.observationIntervalKind,
    OBSERVATION_INTERVAL_KINDS,
    "observation interval kind",
  );
  assertClosed(
    input.missingDataHandling,
    MISSING_DATA_HANDLINGS,
    "missing data handling",
  );
  if (!textOk(input.missingDataNote, 1000)) {
    throw Error("Invalid missingDataNote");
  }
  assertNoForbiddenClaimLanguage(input.missingDataNote, "missingDataNote");

  if (
    (input.observationIntervalKind === "irregular_declared" ||
      input.observationIntervalKind === "sparse_declared" ||
      input.observationIntervalKind === "unknown_interval") &&
    !(input.irregularIntervalNote && textOk(input.irregularIntervalNote, 1000))
  ) {
    throw Error(
      "Irregular/sparse/unknown intervals require irregularIntervalNote",
    );
  }

  assertClosed(
    input.eligibilityDefinitionTimeRole,
    TEMPORAL_ROLES,
    "eligibilityDefinitionTimeRole",
  );
  assertClosed(
    input.exposureDefinitionTimeRole,
    TEMPORAL_ROLES,
    "exposureDefinitionTimeRole",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const integrity = evaluateTemporalIntegrity({
    temporalAnchors,
    eligibilityDefinitionTimeRole: input.eligibilityDefinitionTimeRole,
    exposureDefinitionTimeRole: input.exposureDefinitionTimeRole,
  });
  if (integrity.usedFutureInformationForEarlierExposureOrEligibility) {
    throw Error(
      `Temporal leakage fail-closed: ${integrity.failures.join("; ")}`,
    );
  }
  if (integrity.collapsedTemporalRoles) {
    throw Error(
      `Collapsed temporal roles fail-closed: ${integrity.failures.join("; ")}`,
    );
  }

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

  const rweAnalysisId =
    input.rweAnalysisId === undefined || input.rweAnalysisId === null
      ? null
      : input.rweAnalysisId;
  if (rweAnalysisId !== null && !RWE_ANL_RE.test(rweAnalysisId)) {
    throw Error("Invalid rweAnalysisId");
  }
  const interopDataSourceId =
    input.interopDataSourceId === undefined ||
    input.interopDataSourceId === null
      ? null
      : input.interopDataSourceId;
  if (interopDataSourceId !== null && !SCDI_SRC_RE.test(interopDataSourceId)) {
    throw Error("Invalid interopDataSourceId");
  }
  const interopTemporalAlignmentId =
    input.interopTemporalAlignmentId === undefined ||
    input.interopTemporalAlignmentId === null
      ? null
      : input.interopTemporalAlignmentId;
  if (
    interopTemporalAlignmentId !== null &&
    !SCDI_TMP_RE.test(interopTemporalAlignmentId)
  ) {
    throw Error("Invalid interopTemporalAlignmentId");
  }

  const lifecycle: LongitudinalLifecycle =
    datasetAvailability === "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const irregularIntervalNote =
    input.irregularIntervalNote === undefined ||
    input.irregularIntervalNote === null
      ? null
      : input.irregularIntervalNote.trim();
  if (irregularIntervalNote) {
    assertNoForbiddenClaimLanguage(
      irregularIntervalNote,
      "irregularIntervalNote",
    );
  }

  const spec: LongitudinalAnalysisSpec = {
    schema: LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA,
    method: LONGITUDINAL_CLINICAL_EVIDENCE_METHOD,
    version: LONGITUDINAL_CLINICAL_EVIDENCE_VERSION,
    id: input.id,
    analysisKind: input.analysisKind,
    displayName: input.displayName.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    rweStudyId: input.rweStudyId,
    rweObservationIds: assertIdList(
      input.rweObservationIds ?? [],
      RWE_OBS_RE,
      "rweObservationIds",
      32,
    ),
    rweExposureIds: assertIdList(
      input.rweExposureIds ?? [],
      RWE_EXP_RE,
      "rweExposureIds",
      32,
    ),
    rweOutcomeIds: assertIdList(
      input.rweOutcomeIds ?? [],
      RWE_OUT_RE,
      "rweOutcomeIds",
      32,
    ),
    rweAnalysisId,
    interopDataSourceId,
    interopTemporalAlignmentId,
    subjectRefKind: subject.subjectRefKind,
    subjectOrCohortRef: subject.subjectOrCohortRef,
    temporalAnchors,
    observationIntervalKind: input.observationIntervalKind,
    irregularIntervalNote,
    missingDataHandling: input.missingDataHandling,
    missingDataNote: input.missingDataNote.trim(),
    eligibilityDefinitionTimeRole: input.eligibilityDefinitionTimeRole,
    exposureDefinitionTimeRole: input.exposureDefinitionTimeRole,
    datasetAvailability,
    accessClassification,
    containsIdentifiablePhi: false,
    liveLongitudinalEngineOperational: false,
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
  return validateLongitudinalAnalysisSpec(spec);
}

export function validateLongitudinalAnalysisSpec(
  spec: LongitudinalAnalysisSpec,
): LongitudinalAnalysisSpec {
  if (!SPEC_ID_RE.test(spec.id)) throw Error("Invalid analysis spec id");
  if (!RWE_STUDY_RE.test(spec.rweStudyId)) throw Error("Invalid rweStudyId");
  assertClosed(spec.analysisKind, LONGITUDINAL_ANALYSIS_KINDS, "analysis kind");
  assertClosed(spec.lifecycle, LONGITUDINAL_LIFECYCLES, "lifecycle");
  assertTemporalAnchorSet(spec.temporalAnchors);
  assertClosed(
    spec.observationIntervalKind,
    OBSERVATION_INTERVAL_KINDS,
    "observation interval kind",
  );
  assertClosed(
    spec.missingDataHandling,
    MISSING_DATA_HANDLINGS,
    "missing data handling",
  );
  if (spec.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (spec.liveLongitudinalEngineOperational !== false) {
    throw Error("Live longitudinal engine forbidden in PR3");
  }
  assertHonesty(spec.honesty);
  assertActor(spec.authoredBy, "author");
  if (spec.reviewedBy !== null) assertActor(spec.reviewedBy, "reviewer");
  return spec;
}

export function transitionLongitudinalAnalysisSpec(input: {
  spec: LongitudinalAnalysisSpec;
  to: LongitudinalLifecycle;
  updatedAt: string;
  actor: LongitudinalActor;
}): LongitudinalAnalysisSpec {
  const current = validateLongitudinalAnalysisSpec(input.spec);
  assertClosed(input.to, LONGITUDINAL_LIFECYCLES, "lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = SPEC_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(`Illegal spec transition ${current.lifecycle} → ${input.to}`);
  }
  if (
    (input.to === "accepted_with_limitations" || input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may accept or reject analysis specs");
  }
  if (
    input.to === "accepted_with_limitations" &&
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset"
  ) {
    throw Error(
      "Cannot accept longitudinal analysis while authorised dataset is blocked",
    );
  }
  return validateLongitudinalAnalysisSpec({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftLongitudinalObservationSeries(input: {
  id: string;
  analysisSpec: LongitudinalAnalysisSpec;
  clinicalConcept: string;
  points: readonly Omit<LongitudinalObservationPoint, never>[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LongitudinalActorKind;
  note?: string;
}): LongitudinalObservationSeries {
  if (!SERIES_ID_RE.test(input.id)) throw Error("Invalid observation series id");
  const spec = validateLongitudinalAnalysisSpec(input.analysisSpec);
  if (!textOk(input.clinicalConcept, 500)) {
    throw Error("Invalid clinicalConcept");
  }
  assertNoForbiddenClaimLanguage(input.clinicalConcept, "clinicalConcept");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (input.points.length === 0) throw Error("Observation series needs points");
  if (input.points.length > 64) throw Error("Too many observation points");

  const points: LongitudinalObservationPoint[] = input.points.map((p, i) => {
    if (p.sequenceIndex !== i) {
      throw Error("Observation point sequenceIndex must be contiguous from 0");
    }
    assertClosed(p.intendedRole, TEMPORAL_ROLES, "point intendedRole");
    const eventTime = assertOptionalIso(p.eventTime, "point eventTime");
    const recordCreationTime = assertOptionalIso(
      p.recordCreationTime,
      "point recordCreationTime",
    );
    const ingestionTime = assertOptionalIso(
      p.ingestionTime,
      "point ingestionTime",
    );
    if (
      eventTime !== null &&
      recordCreationTime !== null &&
      Date.parse(eventTime) > Date.parse(recordCreationTime)
    ) {
      throw Error(
        "Point eventTime must not be after recordCreationTime (temporal order)",
      );
    }
    if (
      recordCreationTime !== null &&
      ingestionTime !== null &&
      Date.parse(recordCreationTime) > Date.parse(ingestionTime)
    ) {
      throw Error(
        "Point recordCreationTime must not be after ingestionTime (temporal order)",
      );
    }
    if (p.missingnessDeclared && p.valueDeclared !== null) {
      throw Error("Missing point cannot declare a value");
    }
    if (!p.missingnessDeclared && p.valueDeclared === null) {
      throw Error("Observed point requires valueDeclared or missingnessDeclared");
    }
    if (p.valueDeclared !== null) {
      if (!textOk(p.valueDeclared, 240)) throw Error("Invalid valueDeclared");
      assertNoForbiddenClaimLanguage(p.valueDeclared, "valueDeclared");
    }
    if (p.unit !== null && !textOk(p.unit, 64)) throw Error("Invalid unit");
    if (
      p.intervalDaysFromPrior !== null &&
      (!Number.isFinite(p.intervalDaysFromPrior) || p.intervalDaysFromPrior < 0)
    ) {
      throw Error("Invalid intervalDaysFromPrior");
    }
    if (
      i > 0 &&
      spec.observationIntervalKind === "irregular_declared" &&
      p.intervalDaysFromPrior === null
    ) {
      throw Error(
        "Irregular series points after the first require intervalDaysFromPrior",
      );
    }
    const note = (p.note ?? "").trim();
    if (note.length > 500) throw Error("Invalid point note");
    if (note) assertNoForbiddenClaimLanguage(note, "point note");
    return {
      sequenceIndex: p.sequenceIndex,
      intendedRole: p.intendedRole,
      eventTime,
      recordCreationTime,
      ingestionTime,
      valueDeclared: p.valueDeclared,
      unit: p.unit,
      missingnessDeclared: p.missingnessDeclared,
      intervalDaysFromPrior: p.intervalDaysFromPrior,
      note,
    };
  });

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const series: LongitudinalObservationSeries = {
    schema: LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA,
    method: LONGITUDINAL_CLINICAL_EVIDENCE_METHOD,
    version: LONGITUDINAL_CLINICAL_EVIDENCE_VERSION,
    id: input.id,
    analysisSpecId: spec.id,
    rweStudyId: spec.rweStudyId,
    clinicalConcept: input.clinicalConcept.trim(),
    observationIntervalKind: spec.observationIntervalKind,
    missingDataHandling: spec.missingDataHandling,
    points,
    containsIdentifiablePhi: false,
    fabricatedTrajectory: null,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateLongitudinalObservationSeries(series);
}

export function validateLongitudinalObservationSeries(
  series: LongitudinalObservationSeries,
): LongitudinalObservationSeries {
  if (!SERIES_ID_RE.test(series.id)) {
    throw Error("Invalid observation series id");
  }
  if (!SPEC_ID_RE.test(series.analysisSpecId)) {
    throw Error("Invalid analysisSpecId");
  }
  if (!RWE_STUDY_RE.test(series.rweStudyId)) throw Error("Invalid rweStudyId");
  if (series.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (series.fabricatedTrajectory !== null) {
    throw Error("Fabricated trajectories forbidden");
  }
  if (series.points.length === 0) throw Error("Observation series needs points");
  assertHonesty(series.honesty);
  assertActor(series.authoredBy, "author");
  return series;
}

export function draftTemporalIntegrityCheck(input: {
  id: string;
  analysisSpec: LongitudinalAnalysisSpec;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LongitudinalActorKind;
  note?: string;
}): TemporalIntegrityCheck {
  if (!CHECK_ID_RE.test(input.id)) {
    throw Error("Invalid temporal integrity check id");
  }
  const spec = validateLongitudinalAnalysisSpec(input.analysisSpec);
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const evaluation = evaluateTemporalIntegrity({
    temporalAnchors: spec.temporalAnchors,
    eligibilityDefinitionTimeRole: spec.eligibilityDefinitionTimeRole,
    exposureDefinitionTimeRole: spec.exposureDefinitionTimeRole,
  });
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const check: TemporalIntegrityCheck = {
    schema: LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA,
    method: LONGITUDINAL_CLINICAL_EVIDENCE_METHOD,
    version: LONGITUDINAL_CLINICAL_EVIDENCE_VERSION,
    id: input.id,
    analysisSpecId: spec.id,
    status: evaluation.status,
    checksPerformed: evaluation.checksPerformed,
    failures: evaluation.failures,
    usedFutureInformationForEarlierExposureOrEligibility:
      evaluation.usedFutureInformationForEarlierExposureOrEligibility,
    collapsedTemporalRoles: evaluation.collapsedTemporalRoles,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateTemporalIntegrityCheck(check);
}

export function validateTemporalIntegrityCheck(
  check: TemporalIntegrityCheck,
): TemporalIntegrityCheck {
  if (!CHECK_ID_RE.test(check.id)) {
    throw Error("Invalid temporal integrity check id");
  }
  if (!SPEC_ID_RE.test(check.analysisSpecId)) {
    throw Error("Invalid analysisSpecId");
  }
  assertClosed(check.status, TEMPORAL_INTEGRITY_STATUSES, "temporal status");
  assertStringList(check.checksPerformed, "checksPerformed", 32, 240);
  assertStringList(check.failures, "failures", 32, 500);
  assertHonesty(check.honesty);
  assertActor(check.authoredBy, "author");
  return check;
}

export function draftLongitudinalAnalysisResult(input: {
  id: string;
  analysisSpec: LongitudinalAnalysisSpec;
  temporalCheck: TemporalIntegrityCheck;
  summary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LongitudinalActorKind;
  trajectoryNarrative?: string | null;
  dataBasis?: LongitudinalDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): LongitudinalAnalysisResult {
  if (!RESULT_ID_RE.test(input.id)) {
    throw Error("Invalid longitudinal analysis result id");
  }
  const spec = validateLongitudinalAnalysisSpec(input.analysisSpec);
  const temporalCheck = validateTemporalIntegrityCheck(input.temporalCheck);
  if (temporalCheck.analysisSpecId !== spec.id) {
    throw Error("Temporal check must reference the same analysis spec");
  }
  if (
    temporalCheck.usedFutureInformationForEarlierExposureOrEligibility ||
    temporalCheck.status === "failed_future_information_leakage"
  ) {
    throw Error(
      "Cannot draft analysis result under failed temporal leakage checks",
    );
  }
  if (!textOk(input.summary, 4000)) throw Error("Invalid summary");
  assertNoForbiddenClaimLanguage(input.summary, "summary");
  const limitations = assertStringList(input.limitations, "limitations", 32, 1000);
  if (limitations.length === 0) throw Error("limitations required");
  const joined = limitations.join(" ").toLowerCase();
  if (
    !/\b(observational|association|trajectory|confound|not\s+proven)\b/.test(
      joined,
    )
  ) {
    throw Error(
      "limitations must declare observational/association/trajectory/confounding constraints",
    );
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const trajectoryNarrative =
    input.trajectoryNarrative === undefined ||
    input.trajectoryNarrative === null
      ? null
      : input.trajectoryNarrative.trim();
  if (trajectoryNarrative !== null) {
    if (!textOk(trajectoryNarrative, 4000)) {
      throw Error("Invalid trajectoryNarrative");
    }
    assertNoForbiddenClaimLanguage(
      trajectoryNarrative,
      "trajectoryNarrative",
    );
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? spec.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const result: LongitudinalAnalysisResult = {
    schema: LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA,
    method: LONGITUDINAL_CLINICAL_EVIDENCE_METHOD,
    version: LONGITUDINAL_CLINICAL_EVIDENCE_VERSION,
    id: input.id,
    analysisSpecId: spec.id,
    rweStudyId: spec.rweStudyId,
    analysisKind: spec.analysisKind,
    summary: input.summary.trim(),
    temporalIntegrityStatus: temporalCheck.status,
    observationIntervalKind: spec.observationIntervalKind,
    missingDataHandling: spec.missingDataHandling,
    limitations,
    trajectoryNarrative,
    observationalTrajectoryIsNotProvenTreatmentEffect: true,
    causalIdentificationClaimed: false,
    inventedPatientCount: null,
    inventedEffectEstimate: null,
    inventedSurvivalCurve: null,
    fabricatedTrajectory: null,
    lifecycle: "draft",
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
  return validateLongitudinalAnalysisResult(result);
}

export function validateLongitudinalAnalysisResult(
  result: LongitudinalAnalysisResult,
): LongitudinalAnalysisResult {
  if (!RESULT_ID_RE.test(result.id)) {
    throw Error("Invalid longitudinal analysis result id");
  }
  if (!SPEC_ID_RE.test(result.analysisSpecId)) {
    throw Error("Invalid analysisSpecId");
  }
  if (!RWE_STUDY_RE.test(result.rweStudyId)) throw Error("Invalid rweStudyId");
  assertClosed(result.analysisKind, LONGITUDINAL_ANALYSIS_KINDS, "analysis kind");
  assertClosed(result.lifecycle, LONGITUDINAL_LIFECYCLES, "lifecycle");
  assertClosed(
    result.temporalIntegrityStatus,
    TEMPORAL_INTEGRITY_STATUSES,
    "temporal integrity status",
  );
  if (result.observationalTrajectoryIsNotProvenTreatmentEffect !== true) {
    throw Error("Observational trajectory is not proven treatment effect");
  }
  if (result.causalIdentificationClaimed !== false) {
    throw Error("Causal identification claims forbidden");
  }
  if (result.inventedPatientCount !== null) {
    throw Error("Invented patient counts forbidden");
  }
  if (result.inventedEffectEstimate !== null) {
    throw Error("Invented effect estimates forbidden");
  }
  if (result.inventedSurvivalCurve !== null) {
    throw Error("Invented survival curves forbidden");
  }
  if (result.fabricatedTrajectory !== null) {
    throw Error("Fabricated trajectories forbidden");
  }
  if (result.limitations.length === 0) throw Error("limitations required");
  assertHonesty(result.honesty);
  assertActor(result.authoredBy, "author");
  if (result.reviewedBy !== null) assertActor(result.reviewedBy, "reviewer");
  return result;
}

export function transitionLongitudinalAnalysisResult(input: {
  result: LongitudinalAnalysisResult;
  to: LongitudinalLifecycle;
  updatedAt: string;
  actor: LongitudinalActor;
}): LongitudinalAnalysisResult {
  const current = validateLongitudinalAnalysisResult(input.result);
  assertClosed(input.to, LONGITUDINAL_LIFECYCLES, "lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = RESULT_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal result transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    (input.to === "accepted_with_limitations" || input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may accept or reject analysis results");
  }
  if (
    input.to === "accepted_with_limitations" &&
    current.temporalIntegrityStatus === "failed_future_information_leakage"
  ) {
    throw Error("Cannot accept result with temporal leakage failures");
  }
  return validateLongitudinalAnalysisResult({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryLongitudinalClinicalEvidenceStore(): LongitudinalClinicalEvidenceStore & {
  specs: Map<string, LongitudinalAnalysisSpec>;
  series: Map<string, LongitudinalObservationSeries>;
  temporalChecks: Map<string, TemporalIntegrityCheck>;
  results: Map<string, LongitudinalAnalysisResult>;
} {
  const specs = new Map<string, LongitudinalAnalysisSpec>();
  const series = new Map<string, LongitudinalObservationSeries>();
  const temporalChecks = new Map<string, TemporalIntegrityCheck>();
  const results = new Map<string, LongitudinalAnalysisResult>();

  return {
    specs,
    series,
    temporalChecks,
    results,
    upsertSpec(spec) {
      const validated = validateLongitudinalAnalysisSpec(spec);
      specs.set(validated.id, validated);
      return validated;
    },
    getSpec(id) {
      return specs.get(id) ?? null;
    },
    listSpecs(rweStudyId) {
      const all = [...specs.values()];
      return rweStudyId
        ? all.filter((s) => s.rweStudyId === rweStudyId)
        : all;
    },
    upsertSeries(record) {
      const validated = validateLongitudinalObservationSeries(record);
      series.set(validated.id, validated);
      return validated;
    },
    getSeries(id) {
      return series.get(id) ?? null;
    },
    listSeries(analysisSpecId) {
      const all = [...series.values()];
      return analysisSpecId
        ? all.filter((s) => s.analysisSpecId === analysisSpecId)
        : all;
    },
    upsertTemporalCheck(check) {
      const validated = validateTemporalIntegrityCheck(check);
      temporalChecks.set(validated.id, validated);
      return validated;
    },
    getTemporalCheck(id) {
      return temporalChecks.get(id) ?? null;
    },
    listTemporalChecks(analysisSpecId) {
      const all = [...temporalChecks.values()];
      return analysisSpecId
        ? all.filter((c) => c.analysisSpecId === analysisSpecId)
        : all;
    },
    upsertResult(result) {
      const validated = validateLongitudinalAnalysisResult(result);
      results.set(validated.id, validated);
      return validated;
    },
    getResult(id) {
      return results.get(id) ?? null;
    },
    listResults(analysisSpecId) {
      const all = [...results.values()];
      return analysisSpecId
        ? all.filter((r) => r.analysisSpecId === analysisSpecId)
        : all;
    },
  };
}

export function projectLongitudinalClinicalEvidencePersistenceLines(input: {
  specs: readonly LongitudinalAnalysisSpec[];
  series?: readonly LongitudinalObservationSeries[];
  temporalChecks?: readonly TemporalIntegrityCheck[];
  results?: readonly LongitudinalAnalysisResult[];
}): string[] {
  for (const s of input.specs) validateLongitudinalAnalysisSpec(s);
  for (const s of input.series ?? []) validateLongitudinalObservationSeries(s);
  for (const c of input.temporalChecks ?? []) {
    validateTemporalIntegrityCheck(c);
  }
  for (const r of input.results ?? []) validateLongitudinalAnalysisResult(r);

  const kinds = [...new Set(input.specs.map((s) => s.analysisKind))].sort();
  return [
    `schema=${LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA}`,
    `method=${LONGITUDINAL_CLINICAL_EVIDENCE_METHOD}`,
    `version=${LONGITUDINAL_CLINICAL_EVIDENCE_VERSION}`,
    `specs=${input.specs.length}`,
    `series=${(input.series ?? []).length}`,
    `temporalChecks=${(input.temporalChecks ?? []).length}`,
    `results=${(input.results ?? []).length}`,
    `analysisKinds=${kinds.join(",")}`,
    `noUnrestrictedPatientDb=true`,
    `observationalTrajectoryIsNotProvenEffect=true`,
    `noFutureInfoForEarlierExposure=true`,
    `temporalRolesDistinct=true`,
    `irregularIntervalsExplicit=true`,
    `inventedPatientCounts=false`,
    `inventedEffectEstimates=false`,
    `inventedSurvivalCurves=false`,
    `fabricatedTrajectories=false`,
    `liveLongitudinalEngine=false`,
    `phiIngestion=false`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintLongitudinalAnalysisSpec(
  spec: LongitudinalAnalysisSpec,
): string {
  const validated = validateLongitudinalAnalysisSpec(spec);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildLongitudinalClinicalEvidencePack(input: {
  specs: readonly LongitudinalAnalysisSpec[];
  series: readonly LongitudinalObservationSeries[];
  temporalChecks: readonly TemporalIntegrityCheck[];
  results: readonly LongitudinalAnalysisResult[];
  asOf: string;
}): {
  schema: typeof LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA;
  method: typeof LONGITUDINAL_CLINICAL_EVIDENCE_METHOD;
  version: typeof LONGITUDINAL_CLINICAL_EVIDENCE_VERSION;
  asOf: string;
  specCount: number;
  seriesCount: number;
  temporalCheckCount: number;
  resultCount: number;
  honesty: LongitudinalClinicalEvidenceHonesty;
  specs: readonly LongitudinalAnalysisSpec[];
  series: readonly LongitudinalObservationSeries[];
  temporalChecks: readonly TemporalIntegrityCheck[];
  results: readonly LongitudinalAnalysisResult[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const specs = input.specs.map(validateLongitudinalAnalysisSpec);
  const series = input.series.map(validateLongitudinalObservationSeries);
  const temporalChecks = input.temporalChecks.map(validateTemporalIntegrityCheck);
  const results = input.results.map(validateLongitudinalAnalysisResult);
  return {
    schema: LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA,
    method: LONGITUDINAL_CLINICAL_EVIDENCE_METHOD,
    version: LONGITUDINAL_CLINICAL_EVIDENCE_VERSION,
    asOf: input.asOf,
    specCount: specs.length,
    seriesCount: series.length,
    temporalCheckCount: temporalChecks.length,
    resultCount: results.length,
    honesty: {...DEFAULT_HONESTY},
    specs,
    series,
    temporalChecks,
    results,
  };
}

/** Fixture helper: distinct temporal anchors that pass integrity checks. */
export function fixtureTemporalAnchors(asOf: string): TemporalAnchorSet {
  const baseline = "2024-01-15T00:00:00.000Z";
  const treatment = "2024-02-01T00:00:00.000Z";
  const event = "2024-03-10T12:00:00.000Z";
  const record = "2024-03-10T18:00:00.000Z";
  const ingest = "2024-03-11T09:00:00.000Z";
  const followUp = "2024-06-15T00:00:00.000Z";
  const outcome = "2024-06-20T00:00:00.000Z";
  if (!isIsoTimestamp(asOf)) throw Error("Invalid asOf for fixture anchors");
  return {
    eventTime: {
      role: "event_time",
      timestamp: event,
      declaredAbsent: false,
      note: "Fixture clinical event time",
    },
    recordCreationTime: {
      role: "record_creation_time",
      timestamp: record,
      declaredAbsent: false,
      note: "Fixture source-system record creation",
    },
    ingestionTime: {
      role: "ingestion_time",
      timestamp: ingest,
      declaredAbsent: false,
      note: "Fixture research ingestion time",
    },
    treatmentInitiationTime: {
      role: "treatment_initiation_time",
      timestamp: treatment,
      declaredAbsent: false,
      note: "Fixture treatment initiation",
    },
    baselineTime: {
      role: "baseline_time",
      timestamp: baseline,
      declaredAbsent: false,
      note: "Fixture baseline / eligibility window start",
    },
    followUpTime: {
      role: "follow_up_time",
      timestamp: followUp,
      declaredAbsent: false,
      note: "Fixture follow-up assessment",
    },
    outcomeAscertainmentTime: {
      role: "outcome_ascertainment_time",
      timestamp: outcome,
      declaredAbsent: false,
      note: "Fixture outcome ascertainment",
    },
  };
}
