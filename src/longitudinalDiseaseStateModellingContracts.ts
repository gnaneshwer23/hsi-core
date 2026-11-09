/**
 * Milestone 15 / PR3 — Longitudinal Disease State Modelling.
 *
 * Extends M14 longitudinal clinical evidence + M15 HDI/CBC contracts with
 * research envelopes for disease trajectory reconstruction, baseline/follow-up
 * comparison, clinical event timelines, organ-specific outcome trends,
 * treatment exposure context, biomarker trajectories, missing-data analysis,
 * and disease-state transition modelling — contracts only, not clinical care.
 *
 * Temporal safeguards (fail-closed):
 * - Distinguish event / measurement / ingestion / prediction times.
 * - Prevent future-data leakage into earlier eligibility/exposure/baseline.
 * - Handle irregular follow-up explicitly; preserve uncertainty when sparse.
 * - Do not invent continuous trajectories across clinically meaningful gaps
 *   without a justified interpolation model declaration.
 *
 * Binding honesty:
 * - Research decision support only; fixtures until authorised.
 * - Observed ≠ inferred; observational trajectory ≠ proven treatment effect.
 * - No PHI/CDS, twin product, Gate C / MoU, fabricated timelines, Neon migration.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const LONGITUDINAL_DISEASE_STATE_SCHEMA =
  "hsi-longitudinal-disease-state-1" as const;
export const LONGITUDINAL_DISEASE_STATE_METHOD =
  "hsi.longitudinal_disease_state.v1" as const;
export const LONGITUDINAL_DISEASE_STATE_VERSION = "0.1.0" as const;

export const LDSM_MODELLING_KINDS = [
  "disease_trajectory_reconstruction",
  "baseline_follow_up_comparison",
  "clinical_event_timeline",
  "organ_specific_outcome_trend",
  "treatment_exposure_context",
  "biomarker_trajectory",
  "missing_data_analysis",
  "disease_state_transition",
] as const;
export type LdsmModellingKind = (typeof LDSM_MODELLING_KINDS)[number];

export const LDSM_TEMPORAL_ROLES = [
  "event_time",
  "measurement_time",
  "ingestion_time",
  "prediction_time",
  "baseline_time",
  "follow_up_time",
] as const;
export type LdsmTemporalRole = (typeof LDSM_TEMPORAL_ROLES)[number];

export const LDSM_OBSERVATION_INTERVAL_KINDS = [
  "regular_declared",
  "irregular_declared",
  "sparse_declared",
  "unknown_interval",
] as const;
export type LdsmObservationIntervalKind =
  (typeof LDSM_OBSERVATION_INTERVAL_KINDS)[number];

export const LDSM_MISSING_DATA_HANDLINGS = [
  "declared_missing",
  "not_applicable",
  "imputation_not_performed",
  "complete_case_declared",
  "explicitly_unresolved",
  "uncertainty_preserved_sparse",
] as const;
export type LdsmMissingDataHandling =
  (typeof LDSM_MISSING_DATA_HANDLINGS)[number];

export const LDSM_GAP_POLICIES = [
  "no_interpolation_across_gap",
  "declared_interpolation_model_with_limitations",
  "gap_recorded_uncertainty_preserved",
] as const;
export type LdsmGapPolicy = (typeof LDSM_GAP_POLICIES)[number];

export const LDSM_TEMPORAL_INTEGRITY_STATUSES = [
  "passed_declared_checks",
  "failed_future_information_leakage",
  "failed_collapsed_temporal_roles",
  "failed_prediction_before_measurement",
  "failed_missing_anchors",
  "not_assessed",
] as const;
export type LdsmTemporalIntegrityStatus =
  (typeof LDSM_TEMPORAL_INTEGRITY_STATUSES)[number];

export const LDSM_UNCERTAINTY_ORDINALS = [
  "not_assessed",
  "low_declared",
  "moderate_declared",
  "high_sparse_preserved",
  "insufficient_gap",
  "blocked",
] as const;
export type LdsmUncertaintyOrdinal =
  (typeof LDSM_UNCERTAINTY_ORDINALS)[number];

export const LDSM_TRANSITION_CONFIDENCES = [
  "not_assessed",
  "low",
  "moderate",
  "high_declared_with_limitations",
  "insufficient",
] as const;
export type LdsmTransitionConfidence =
  (typeof LDSM_TRANSITION_CONFIDENCES)[number];

export const LDSM_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_temporal_leakage",
  "blocked_awaiting_authorised_dataset",
  "rejected",
  "superseded",
] as const;
export type LdsmLifecycle = (typeof LDSM_LIFECYCLES)[number];

export const LDSM_DATASET_AVAILABILITY = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type LdsmDatasetAvailability =
  (typeof LDSM_DATASET_AVAILABILITY)[number];

export const LDSM_ACCESS_CLASSIFICATIONS = [
  "fixture_engineering",
  "authorised_pseudonymous_research",
  "authorised_aggregate_only",
  "restricted_not_ingested",
] as const;
export type LdsmAccessClassification =
  (typeof LDSM_ACCESS_CLASSIFICATIONS)[number];

export const LDSM_SUBJECT_REF_KINDS = [
  "pseudonymous_subject",
  "cohort_aggregate",
] as const;
export type LdsmSubjectRefKind = (typeof LDSM_SUBJECT_REF_KINDS)[number];

export const LDSM_ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type LdsmActorKind = (typeof LDSM_ACTOR_KINDS)[number];

export const LDSM_DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type LdsmDataBasis = (typeof LDSM_DATA_BASES)[number];

const SPEC_ID_RE = /^hsi-ldsm-spec-[a-z0-9-]{3,80}$/;
const TRJ_ID_RE = /^hsi-ldsm-trj-[a-z0-9-]{3,80}$/;
const CMP_ID_RE = /^hsi-ldsm-cmp-[a-z0-9-]{3,80}$/;
const EVT_ID_RE = /^hsi-ldsm-evt-[a-z0-9-]{3,80}$/;
const ORG_ID_RE = /^hsi-ldsm-org-[a-z0-9-]{3,80}$/;
const EXP_ID_RE = /^hsi-ldsm-exp-[a-z0-9-]{3,80}$/;
const BIO_ID_RE = /^hsi-ldsm-bio-[a-z0-9-]{3,80}$/;
const MIS_ID_RE = /^hsi-ldsm-mis-[a-z0-9-]{3,80}$/;
const TXN_ID_RE = /^hsi-ldsm-txn-[a-z0-9-]{3,80}$/;
const MDL_ID_RE = /^hsi-ldsm-mdl-[a-z0-9-]{3,80}$/;
const TMP_ID_RE = /^hsi-ldsm-tmp-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const HDI_CTX_RE = /^hsi-hdi-ctx-[a-z0-9-]{3,80}$/;
const HDI_OBS_RE = /^hsi-hdi-obs-[a-z0-9-]{3,80}$/;
const HDI_EST_RE = /^hsi-hdi-est-[a-z0-9-]{3,80}$/;
const CBC_IDC_RE = /^hsi-cbc-idc-[a-z0-9-]{3,80}$/;
const LCE_SPEC_RE = /^hsi-lce-spec-[a-z0-9-]{3,80}$/;
const LCE_SERIES_RE = /^hsi-lce-ser-[a-z0-9-]{3,80}$/;
const RWE_STUDY_RE = /^hsi-rwe-study-[a-z0-9-]{3,80}$/;
const RWE_EXP_RE = /^hsi-rwe-exp-[a-z0-9-]{3,80}$/;
const RWE_OUT_RE = /^hsi-rwe-out-[a-z0-9-]{3,80}$/;

export type LongitudinalDiseaseStateHonesty = {
  researchDecisionSupportOnly: true;
  observedIsNotInferred: true;
  observationalTrajectoryIsNotProvenTreatmentEffect: true;
  noFutureDataLeakage: true;
  temporalRolesMustRemainDistinct: true;
  irregularFollowUpMustBeExplicit: true;
  uncertaintyPreservedWhenSparse: true;
  noInventedContinuousTrajectoryAcrossGaps: true;
  noPhiIngestion: true;
  noLiveTwinOrMultiscaleClaim: true;
  noAutonomousDiagnosisOrPrescribing: true;
  noFabricatedDiseaseTimelines: true;
  noWorkbenchUi: true;
  notClinicalCare: true;
  agentsDraftHumansReview: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
};

export type LdsmActor = {
  principalId: string;
  actorKind: LdsmActorKind;
};

export type LdsmTemporalAnchor = {
  role: LdsmTemporalRole;
  timestamp: string | null;
  declaredAbsent: boolean;
  note: string;
};

export type LdsmTemporalAnchorSet = {
  eventTime: LdsmTemporalAnchor;
  measurementTime: LdsmTemporalAnchor;
  ingestionTime: LdsmTemporalAnchor;
  predictionTime: LdsmTemporalAnchor;
  baselineTime: LdsmTemporalAnchor;
  followUpTime: LdsmTemporalAnchor;
};

export type LongitudinalDiseaseStateSpec = {
  schema: typeof LONGITUDINAL_DISEASE_STATE_SCHEMA;
  method: typeof LONGITUDINAL_DISEASE_STATE_METHOD;
  version: typeof LONGITUDINAL_DISEASE_STATE_VERSION;
  id: string;
  modellingKind: LdsmModellingKind;
  displayName: string;
  scientificQuestion: string;
  diseaseContextId: string;
  integratedDiseaseContextId: string | null;
  rweStudyId: string | null;
  longitudinalAnalysisSpecId: string | null;
  subjectRefKind: LdsmSubjectRefKind;
  subjectOrCohortRef: string;
  temporalAnchors: LdsmTemporalAnchorSet;
  observationIntervalKind: LdsmObservationIntervalKind;
  irregularFollowUpNote: string | null;
  missingDataHandling: LdsmMissingDataHandling;
  gapPolicy: LdsmGapPolicy;
  clinicallyMeaningfulGapDays: number | null;
  eligibilityDefinitionTimeRole: LdsmTemporalRole;
  exposureDefinitionTimeRole: LdsmTemporalRole;
  datasetAvailability: LdsmDatasetAvailability;
  accessClassification: LdsmAccessClassification;
  containsIdentifiablePhi: false;
  liveLongitudinalEngineOperational: false;
  notClinicalCare: true;
  lifecycle: LdsmLifecycle;
  reviewedBy: LdsmActor | null;
  authoredBy: LdsmActor;
  dataBasis: LdsmDataBasis;
  fixtureHonesty: boolean;
  honesty: LongitudinalDiseaseStateHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DiseaseTrajectoryPoint = {
  sequenceIndex: number;
  measurementTime: string | null;
  eventTime: string | null;
  ingestionTime: string | null;
  valueDeclared: string | null;
  unit: string | null;
  missingnessDeclared: boolean;
  intervalDaysFromPrior: number | null;
  crossesClinicallyMeaningfulGap: boolean;
  interpolated: false;
  note: string;
};

export type DiseaseTrajectoryReconstruction = {
  schema: typeof LONGITUDINAL_DISEASE_STATE_SCHEMA;
  method: typeof LONGITUDINAL_DISEASE_STATE_METHOD;
  version: typeof LONGITUDINAL_DISEASE_STATE_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  clinicalConcept: string;
  observationIntervalKind: LdsmObservationIntervalKind;
  gapPolicy: LdsmGapPolicy;
  missingDataHandling: LdsmMissingDataHandling;
  uncertaintyOrdinal: LdsmUncertaintyOrdinal;
  points: readonly DiseaseTrajectoryPoint[];
  hdiObservationIds: readonly string[];
  longitudinalSeriesId: string | null;
  continuousInterpolationInvented: null;
  fabricatedTrajectory: null;
  containsIdentifiablePhi: false;
  authoredBy: LdsmActor;
  honesty: LongitudinalDiseaseStateHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type BaselineFollowUpComparison = {
  schema: typeof LONGITUDINAL_DISEASE_STATE_SCHEMA;
  method: typeof LONGITUDINAL_DISEASE_STATE_METHOD;
  version: typeof LONGITUDINAL_DISEASE_STATE_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  clinicalConcept: string;
  baselineTime: string;
  followUpTime: string;
  baselineValueDeclared: string | null;
  followUpValueDeclared: string | null;
  comparisonSummary: string;
  uncertaintyOrdinal: LdsmUncertaintyOrdinal;
  missingDataHandling: LdsmMissingDataHandling;
  hdiObservationIds: readonly string[];
  inventedDelta: null;
  provenTreatmentEffectClaimed: false;
  authoredBy: LdsmActor;
  honesty: LongitudinalDiseaseStateHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ClinicalEventTimelineEntry = {
  sequenceIndex: number;
  eventTime: string;
  measurementTime: string | null;
  ingestionTime: string | null;
  eventLabel: string;
  missingnessDeclared: boolean;
  note: string;
};

export type ClinicalEventTimeline = {
  schema: typeof LONGITUDINAL_DISEASE_STATE_SCHEMA;
  method: typeof LONGITUDINAL_DISEASE_STATE_METHOD;
  version: typeof LONGITUDINAL_DISEASE_STATE_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  observationIntervalKind: LdsmObservationIntervalKind;
  entries: readonly ClinicalEventTimelineEntry[];
  gapPolicy: LdsmGapPolicy;
  fabricatedTimeline: null;
  containsIdentifiablePhi: false;
  authoredBy: LdsmActor;
  honesty: LongitudinalDiseaseStateHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type OrganSpecificOutcomeTrend = {
  schema: typeof LONGITUDINAL_DISEASE_STATE_SCHEMA;
  method: typeof LONGITUDINAL_DISEASE_STATE_METHOD;
  version: typeof LONGITUDINAL_DISEASE_STATE_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  organSystem: string;
  outcomeConcept: string;
  observationIntervalKind: LdsmObservationIntervalKind;
  trendSummary: string;
  uncertaintyOrdinal: LdsmUncertaintyOrdinal;
  gapPolicy: LdsmGapPolicy;
  rweOutcomeId: string | null;
  longitudinalSeriesId: string | null;
  inventedContinuousCurve: null;
  authoredBy: LdsmActor;
  honesty: LongitudinalDiseaseStateHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type TreatmentExposureContext = {
  schema: typeof LONGITUDINAL_DISEASE_STATE_SCHEMA;
  method: typeof LONGITUDINAL_DISEASE_STATE_METHOD;
  version: typeof LONGITUDINAL_DISEASE_STATE_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  exposureConcept: string;
  exposureStartTime: string | null;
  exposureEndTime: string | null;
  exposureSummary: string;
  rweExposureId: string | null;
  treatmentEffectClaimed: false;
  prescribingDirective: null;
  authoredBy: LdsmActor;
  honesty: LongitudinalDiseaseStateHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type BiomarkerTrajectory = {
  schema: typeof LONGITUDINAL_DISEASE_STATE_SCHEMA;
  method: typeof LONGITUDINAL_DISEASE_STATE_METHOD;
  version: typeof LONGITUDINAL_DISEASE_STATE_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  biomarkerConcept: string;
  observationIntervalKind: LdsmObservationIntervalKind;
  gapPolicy: LdsmGapPolicy;
  uncertaintyOrdinal: LdsmUncertaintyOrdinal;
  points: readonly DiseaseTrajectoryPoint[];
  hdiObservationIds: readonly string[];
  longitudinalSeriesId: string | null;
  continuousInterpolationInvented: null;
  authoredBy: LdsmActor;
  honesty: LongitudinalDiseaseStateHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MissingDataAnalysis = {
  schema: typeof LONGITUDINAL_DISEASE_STATE_SCHEMA;
  method: typeof LONGITUDINAL_DISEASE_STATE_METHOD;
  version: typeof LONGITUDINAL_DISEASE_STATE_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  missingConcepts: readonly string[];
  missingDataHandling: LdsmMissingDataHandling;
  sparseUncertaintyPreserved: true;
  analysisSummary: string;
  inventedValues: null;
  authoredBy: LdsmActor;
  honesty: LongitudinalDiseaseStateHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DiseaseStateTransition = {
  schema: typeof LONGITUDINAL_DISEASE_STATE_SCHEMA;
  method: typeof LONGITUDINAL_DISEASE_STATE_METHOD;
  version: typeof LONGITUDINAL_DISEASE_STATE_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  fromStateLabel: string;
  toStateLabel: string;
  transitionTime: string | null;
  transitionConfidence: LdsmTransitionConfidence;
  epistemicStatus: "observed" | "inferred";
  hdiObservationId: string | null;
  hdiEstimateId: string | null;
  limitations: readonly string[];
  clinicalCareDirective: null;
  authoredBy: LdsmActor;
  honesty: LongitudinalDiseaseStateHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type LdsmTemporalIntegrityCheck = {
  schema: typeof LONGITUDINAL_DISEASE_STATE_SCHEMA;
  method: typeof LONGITUDINAL_DISEASE_STATE_METHOD;
  version: typeof LONGITUDINAL_DISEASE_STATE_VERSION;
  id: string;
  modellingSpecId: string;
  status: LdsmTemporalIntegrityStatus;
  checksPerformed: readonly string[];
  failures: readonly string[];
  usedFutureInformationForEarlierWindow: boolean;
  collapsedTemporalRoles: boolean;
  predictionBeforeMeasurement: boolean;
  authoredBy: LdsmActor;
  honesty: LongitudinalDiseaseStateHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type LongitudinalDiseaseStateModel = {
  schema: typeof LONGITUDINAL_DISEASE_STATE_SCHEMA;
  method: typeof LONGITUDINAL_DISEASE_STATE_METHOD;
  version: typeof LONGITUDINAL_DISEASE_STATE_VERSION;
  id: string;
  displayName: string;
  diseaseContextId: string;
  modellingSpecId: string;
  trajectoryReconstructionIds: readonly string[];
  baselineFollowUpComparisonIds: readonly string[];
  clinicalEventTimelineIds: readonly string[];
  organSpecificOutcomeTrendIds: readonly string[];
  treatmentExposureContextIds: readonly string[];
  biomarkerTrajectoryIds: readonly string[];
  missingDataAnalysisIds: readonly string[];
  diseaseStateTransitionIds: readonly string[];
  temporalIntegrityCheckIds: readonly string[];
  modelVersion: string;
  limitations: readonly string[];
  temporalIntegrityStatus: LdsmTemporalIntegrityStatus;
  datasetAvailability: LdsmDatasetAvailability;
  liveTwinOperational: false;
  notClinicalCare: true;
  graphPromotable: false;
  lifecycle: LdsmLifecycle;
  reviewedBy: LdsmActor | null;
  authoredBy: LdsmActor;
  dataBasis: LdsmDataBasis;
  fixtureHonesty: boolean;
  honesty: LongitudinalDiseaseStateHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type LongitudinalDiseaseStateStore = {
  upsertSpec(record: LongitudinalDiseaseStateSpec): LongitudinalDiseaseStateSpec;
  getSpec(id: string): LongitudinalDiseaseStateSpec | null;
  listSpecs(diseaseContextId?: string): readonly LongitudinalDiseaseStateSpec[];
  upsertTrajectory(
    record: DiseaseTrajectoryReconstruction,
  ): DiseaseTrajectoryReconstruction;
  getTrajectory(id: string): DiseaseTrajectoryReconstruction | null;
  listTrajectories(
    diseaseContextId?: string,
  ): readonly DiseaseTrajectoryReconstruction[];
  upsertBaselineFollowUp(
    record: BaselineFollowUpComparison,
  ): BaselineFollowUpComparison;
  getBaselineFollowUp(id: string): BaselineFollowUpComparison | null;
  listBaselineFollowUps(
    diseaseContextId?: string,
  ): readonly BaselineFollowUpComparison[];
  upsertEventTimeline(record: ClinicalEventTimeline): ClinicalEventTimeline;
  getEventTimeline(id: string): ClinicalEventTimeline | null;
  listEventTimelines(
    diseaseContextId?: string,
  ): readonly ClinicalEventTimeline[];
  upsertOrganTrend(
    record: OrganSpecificOutcomeTrend,
  ): OrganSpecificOutcomeTrend;
  getOrganTrend(id: string): OrganSpecificOutcomeTrend | null;
  listOrganTrends(
    diseaseContextId?: string,
  ): readonly OrganSpecificOutcomeTrend[];
  upsertTreatmentExposure(
    record: TreatmentExposureContext,
  ): TreatmentExposureContext;
  getTreatmentExposure(id: string): TreatmentExposureContext | null;
  listTreatmentExposures(
    diseaseContextId?: string,
  ): readonly TreatmentExposureContext[];
  upsertBiomarkerTrajectory(record: BiomarkerTrajectory): BiomarkerTrajectory;
  getBiomarkerTrajectory(id: string): BiomarkerTrajectory | null;
  listBiomarkerTrajectories(
    diseaseContextId?: string,
  ): readonly BiomarkerTrajectory[];
  upsertMissingDataAnalysis(record: MissingDataAnalysis): MissingDataAnalysis;
  getMissingDataAnalysis(id: string): MissingDataAnalysis | null;
  listMissingDataAnalyses(
    diseaseContextId?: string,
  ): readonly MissingDataAnalysis[];
  upsertStateTransition(record: DiseaseStateTransition): DiseaseStateTransition;
  getStateTransition(id: string): DiseaseStateTransition | null;
  listStateTransitions(
    diseaseContextId?: string,
  ): readonly DiseaseStateTransition[];
  upsertTemporalIntegrityCheck(
    record: LdsmTemporalIntegrityCheck,
  ): LdsmTemporalIntegrityCheck;
  getTemporalIntegrityCheck(id: string): LdsmTemporalIntegrityCheck | null;
  listTemporalIntegrityChecks(
    modellingSpecId?: string,
  ): readonly LdsmTemporalIntegrityCheck[];
  upsertModel(
    record: LongitudinalDiseaseStateModel,
  ): LongitudinalDiseaseStateModel;
  getModel(id: string): LongitudinalDiseaseStateModel | null;
  listModels(
    diseaseContextId?: string,
  ): readonly LongitudinalDiseaseStateModel[];
};

const DEFAULT_HONESTY: LongitudinalDiseaseStateHonesty = {
  researchDecisionSupportOnly: true,
  observedIsNotInferred: true,
  observationalTrajectoryIsNotProvenTreatmentEffect: true,
  noFutureDataLeakage: true,
  temporalRolesMustRemainDistinct: true,
  irregularFollowUpMustBeExplicit: true,
  uncertaintyPreservedWhenSparse: true,
  noInventedContinuousTrajectoryAcrossGaps: true,
  noPhiIngestion: true,
  noLiveTwinOrMultiscaleClaim: true,
  noAutonomousDiagnosisOrPrescribing: true,
  noFabricatedDiseaseTimelines: true,
  noWorkbenchUi: true,
  notClinicalCare: true,
  agentsDraftHumansReview: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
};

const SPEC_TRANSITIONS: Record<
  LdsmLifecycle,
  readonly LdsmLifecycle[]
> = {
  draft: [
    "under_review",
    "blocked_temporal_leakage",
    "blocked_awaiting_authorised_dataset",
    "rejected",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_temporal_leakage",
    "blocked_awaiting_authorised_dataset",
    "rejected",
    "draft",
  ],
  accepted_with_limitations: ["superseded"],
  blocked_temporal_leakage: ["draft", "rejected"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
  rejected: [],
  superseded: [],
};

const MODEL_TRANSITIONS = SPEC_TRANSITIONS;

function isIsoTimestamp(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function textOk(value: string, max: number): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= max;
}

function assertClosed<T extends string>(
  value: T,
  allowed: readonly T[],
  label: string,
): void {
  if (!allowed.includes(value)) throw Error(`Invalid ${label}`);
}

function assertHonesty(honesty: LongitudinalDiseaseStateHonesty): void {
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Research decision support only");
  }
  if (honesty.observedIsNotInferred !== true) {
    throw Error("Observed must not collapse into inferred");
  }
  if (honesty.observationalTrajectoryIsNotProvenTreatmentEffect !== true) {
    throw Error("Observational trajectory is not proven treatment effect");
  }
  if (honesty.noFutureDataLeakage !== true) {
    throw Error("Future data leakage forbidden");
  }
  if (honesty.temporalRolesMustRemainDistinct !== true) {
    throw Error("Temporal roles must remain distinct");
  }
  if (honesty.irregularFollowUpMustBeExplicit !== true) {
    throw Error("Irregular follow-up must be explicit");
  }
  if (honesty.uncertaintyPreservedWhenSparse !== true) {
    throw Error("Uncertainty must be preserved when sparse");
  }
  if (honesty.noInventedContinuousTrajectoryAcrossGaps !== true) {
    throw Error("Invented continuous trajectories across gaps forbidden");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noLiveTwinOrMultiscaleClaim !== true) {
    throw Error("Live twin / multiscale claim forbidden");
  }
  if (honesty.noAutonomousDiagnosisOrPrescribing !== true) {
    throw Error("Autonomous diagnosis/prescribing forbidden");
  }
  if (honesty.noFabricatedDiseaseTimelines !== true) {
    throw Error("Fabricated disease timelines forbidden");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR3");
  }
  if (honesty.notClinicalCare !== true) {
    throw Error("Not clinical care");
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
  const lower = text
    .toLowerCase()
    .replace(
      /\b(?:not|no|without|never)\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+recommendation|treatment\s+directive|proven\s+treatment\s+effect|personalised\s+treatment\s+effect|personalized\s+treatment\s+effect|live\s+(?:twin|multiscale\s+engine)|digital\s+twin\s+product|fabricated\s+(?:timeline|trajectory)|clinical\s+care|invented\s+continuous\s+trajectory)(?:\s+or\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+recommendation|live\s+(?:twin|multiscale\s+engine)|digital\s+twin\s+product|fabricated\s+(?:timeline|trajectory)|clinical\s+care))*/g,
      " ",
    );
  if (
    /\bdiagnos(e|is|ing)\b/.test(lower) ||
    /\bprescribe\b/.test(lower) ||
    /\btreatment\s+recommendation\b/.test(lower) ||
    /\btreatment\s+directive\b/.test(lower) ||
    /\bproven\s+treatment\s+effect\b/.test(lower) ||
    /\bpersonalised\s+treatment\s+effect\b/.test(lower) ||
    /\bpersonalized\s+treatment\s+effect\b/.test(lower) ||
    /\blive\s+(?:twin|multiscale\s+engine)\b/.test(lower) ||
    /\bdigital\s+twin\s+product\b/.test(lower) ||
    /\bfabricated\s+(?:timeline|trajectory)\b/.test(lower) ||
    /\binvented\s+continuous\s+trajectory\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower)
  ) {
    throw Error(
      `${label} must not diagnose/prescribe, claim live twin/multiscale, invent timelines/counts, or include identifiers`,
    );
  }
}

function assertActor(actor: LdsmActor, label: string): LdsmActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, LDSM_ACTOR_KINDS, `${label} actorKind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}

function assertOptionalId(
  value: string | null | undefined,
  re: RegExp,
  label: string,
): string | null {
  if (value === undefined || value === null) return null;
  if (!re.test(value)) throw Error(`Invalid ${label}`);
  return value;
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

function assertLimitations(limitations: readonly string[]): readonly string[] {
  if (limitations.length === 0) throw Error("limitations required");
  if (limitations.length > 16) throw Error("Too many limitations");
  return limitations.map((item, index) => {
    if (!textOk(item, 1000)) throw Error(`Invalid limitation[${index}]`);
    assertNoForbiddenClaimLanguage(item, `limitation[${index}]`);
    return item.trim();
  });
}

function assertSubjectOrCohortRef(ref: string): string {
  if (!REF_ID_RE.test(ref)) throw Error("Invalid subjectOrCohortRef");
  const lower = ref.toLowerCase();
  if (
    /\bnhs[-_]?/.test(lower) ||
    /\bssn\b/.test(lower) ||
    /\bmrn\b/.test(lower) ||
    /\bpatient[-_]?name\b/.test(lower) ||
    /^\d{6,}$/.test(ref)
  ) {
    throw Error("Direct personal identifier patterns forbidden in subject ref");
  }
  return ref;
}

function assertStringList(
  values: readonly string[],
  label: string,
  maxItems: number,
  maxLen: number,
): readonly string[] {
  if (values.length === 0) throw Error(`${label} required`);
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  return values.map((item, index) => {
    if (!textOk(item, maxLen)) throw Error(`Invalid ${label}[${index}]`);
    assertNoForbiddenClaimLanguage(item, `${label}[${index}]`);
    return item.trim();
  });
}

function dataBasisForAvailability(
  availability: LdsmDatasetAvailability,
): LdsmDataBasis {
  if (availability === "authorised_declared") return "declared_research";
  return "fixture_engineering";
}

function draftAnchor(input: LdsmTemporalAnchor): LdsmTemporalAnchor {
  assertClosed(input.role, LDSM_TEMPORAL_ROLES, "temporal role");
  const declaredAbsent = input.declaredAbsent === true;
  let timestamp: string | null = null;
  if (declaredAbsent) {
    if (input.timestamp !== null && input.timestamp !== undefined) {
      throw Error(`${input.role} cannot have timestamp when declaredAbsent`);
    }
  } else if (input.timestamp !== null && input.timestamp !== undefined) {
    if (!isIsoTimestamp(input.timestamp)) {
      throw Error(`Invalid ${input.role} timestamp`);
    }
    timestamp = input.timestamp;
  } else {
    throw Error(`${input.role} requires timestamp or declaredAbsent`);
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
  anchors: LdsmTemporalAnchorSet,
): LdsmTemporalAnchorSet {
  const roles: LdsmTemporalRole[] = [
    anchors.eventTime.role,
    anchors.measurementTime.role,
    anchors.ingestionTime.role,
    anchors.predictionTime.role,
    anchors.baselineTime.role,
    anchors.followUpTime.role,
  ];
  const expected: LdsmTemporalRole[] = [
    "event_time",
    "measurement_time",
    "ingestion_time",
    "prediction_time",
    "baseline_time",
    "follow_up_time",
  ];
  for (let i = 0; i < expected.length; i++) {
    if (roles[i] !== expected[i]) {
      throw Error("Temporal roles must remain distinct and ordered");
    }
  }
  return {
    eventTime: draftAnchor(anchors.eventTime),
    measurementTime: draftAnchor(anchors.measurementTime),
    ingestionTime: draftAnchor(anchors.ingestionTime),
    predictionTime: draftAnchor(anchors.predictionTime),
    baselineTime: draftAnchor(anchors.baselineTime),
    followUpTime: draftAnchor(anchors.followUpTime),
  };
}

function anchorTimestamp(
  anchors: LdsmTemporalAnchorSet,
  role: LdsmTemporalRole,
): string | null {
  switch (role) {
    case "event_time":
      return anchors.eventTime.timestamp;
    case "measurement_time":
      return anchors.measurementTime.timestamp;
    case "ingestion_time":
      return anchors.ingestionTime.timestamp;
    case "prediction_time":
      return anchors.predictionTime.timestamp;
    case "baseline_time":
      return anchors.baselineTime.timestamp;
    case "follow_up_time":
      return anchors.followUpTime.timestamp;
    default: {
      const _exhaustive: never = role;
      throw Error(`Unhandled temporal role: ${_exhaustive}`);
    }
  }
}

export function fixtureLdsmTemporalAnchors(
  asOf: string,
): LdsmTemporalAnchorSet {
  if (!isIsoTimestamp(asOf)) throw Error("Invalid asOf for fixture anchors");
  const baseline = "2024-01-15T10:00:00.000Z";
  const measurement = "2024-03-10T12:00:00.000Z";
  const event = "2024-03-10T11:30:00.000Z";
  const followUp = "2024-06-15T10:00:00.000Z";
  const ingestion = "2024-06-16T08:00:00.000Z";
  return {
    eventTime: {
      role: "event_time",
      timestamp: event,
      declaredAbsent: false,
      note: "Fixture clinical event time",
    },
    measurementTime: {
      role: "measurement_time",
      timestamp: measurement,
      declaredAbsent: false,
      note: "Fixture measurement time",
    },
    ingestionTime: {
      role: "ingestion_time",
      timestamp: ingestion,
      declaredAbsent: false,
      note: "Fixture ingestion time (after measurement)",
    },
    predictionTime: {
      role: "prediction_time",
      timestamp: null,
      declaredAbsent: true,
      note: "No prediction time in fixture reconstruction",
    },
    baselineTime: {
      role: "baseline_time",
      timestamp: baseline,
      declaredAbsent: false,
      note: "Fixture baseline",
    },
    followUpTime: {
      role: "follow_up_time",
      timestamp: followUp,
      declaredAbsent: false,
      note: "Fixture follow-up",
    },
  };
}

/**
 * Fail-closed temporal integrity for disease-state modelling.
 * Distinguishes event/measurement/ingestion/prediction; refuses future leakage.
 */
export function evaluateLdsmTemporalIntegrity(input: {
  temporalAnchors: LdsmTemporalAnchorSet;
  eligibilityDefinitionTimeRole: LdsmTemporalRole;
  exposureDefinitionTimeRole: LdsmTemporalRole;
}): {
  status: LdsmTemporalIntegrityStatus;
  failures: readonly string[];
  usedFutureInformationForEarlierWindow: boolean;
  collapsedTemporalRoles: boolean;
  predictionBeforeMeasurement: boolean;
  checksPerformed: readonly string[];
} {
  const anchors = assertTemporalAnchorSet(input.temporalAnchors);
  assertClosed(
    input.eligibilityDefinitionTimeRole,
    LDSM_TEMPORAL_ROLES,
    "eligibilityDefinitionTimeRole",
  );
  assertClosed(
    input.exposureDefinitionTimeRole,
    LDSM_TEMPORAL_ROLES,
    "exposureDefinitionTimeRole",
  );

  const checksPerformed = [
    "distinct_temporal_roles",
    "eligibility_not_defined_by_follow_up_or_prediction",
    "exposure_not_defined_by_follow_up_or_prediction",
    "baseline_before_follow_up_when_both_present",
    "prediction_not_before_measurement_when_both_present",
    "ingestion_not_before_measurement_when_both_present",
  ];
  const failures: string[] = [];

  const timestamps = [
    anchors.eventTime.timestamp,
    anchors.measurementTime.timestamp,
    anchors.ingestionTime.timestamp,
    anchors.predictionTime.timestamp,
    anchors.baselineTime.timestamp,
    anchors.followUpTime.timestamp,
  ].filter((t): t is string => t !== null);
  const unique = new Set(timestamps);
  let collapsedTemporalRoles = false;
  if (timestamps.length >= 2 && unique.size === 1) {
    collapsedTemporalRoles = true;
    failures.push(
      "All populated temporal anchors share one timestamp — roles collapsed",
    );
  }

  let usedFuture = false;
  let predictionBeforeMeasurement = false;

  if (
    input.eligibilityDefinitionTimeRole === "follow_up_time" ||
    input.eligibilityDefinitionTimeRole === "prediction_time"
  ) {
    usedFuture = true;
    failures.push(
      "Eligibility must not be defined by follow-up or prediction time",
    );
  }
  if (
    input.exposureDefinitionTimeRole === "follow_up_time" ||
    input.exposureDefinitionTimeRole === "prediction_time"
  ) {
    usedFuture = true;
    failures.push(
      "Exposure must not be defined by follow-up or prediction time",
    );
  }

  const eligibilityTs = anchorTimestamp(
    anchors,
    input.eligibilityDefinitionTimeRole,
  );
  const exposureTs = anchorTimestamp(anchors, input.exposureDefinitionTimeRole);
  const baselineTs = anchors.baselineTime.timestamp;
  const followUpTs = anchors.followUpTime.timestamp;
  const measurementTs = anchors.measurementTime.timestamp;
  const predictionTs = anchors.predictionTime.timestamp;
  const ingestionTs = anchors.ingestionTime.timestamp;

  if (
    eligibilityTs !== null &&
    followUpTs !== null &&
    Date.parse(eligibilityTs) > Date.parse(followUpTs)
  ) {
    usedFuture = true;
    failures.push("Eligibility timestamp is after follow-up (future information)");
  }
  if (
    exposureTs !== null &&
    followUpTs !== null &&
    Date.parse(exposureTs) > Date.parse(followUpTs)
  ) {
    usedFuture = true;
    failures.push("Exposure timestamp is after follow-up (future information)");
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
    predictionTs !== null &&
    measurementTs !== null &&
    Date.parse(predictionTs) < Date.parse(measurementTs)
  ) {
    predictionBeforeMeasurement = true;
    usedFuture = true;
    failures.push(
      "Prediction time is before measurement time (future-data leakage into prediction framing)",
    );
  }
  if (
    ingestionTs !== null &&
    measurementTs !== null &&
    Date.parse(ingestionTs) < Date.parse(measurementTs)
  ) {
    usedFuture = true;
    failures.push("Ingestion time is before measurement time");
  }

  let status: LdsmTemporalIntegrityStatus = "passed_declared_checks";
  if (failures.length === 0) {
    status = "passed_declared_checks";
  } else if (predictionBeforeMeasurement) {
    status = "failed_prediction_before_measurement";
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
    usedFutureInformationForEarlierWindow: usedFuture,
    collapsedTemporalRoles,
    predictionBeforeMeasurement,
    checksPerformed,
  };
}

function assertTrajectoryPoints(
  points: readonly DiseaseTrajectoryPoint[],
  gapPolicy: LdsmGapPolicy,
  clinicallyMeaningfulGapDays: number | null,
): readonly DiseaseTrajectoryPoint[] {
  if (points.length === 0) throw Error("trajectory points required");
  if (points.length > 64) throw Error("Too many trajectory points");
  return points.map((point, index) => {
    if (point.sequenceIndex !== index) {
      throw Error(`trajectory point sequenceIndex must equal ${index}`);
    }
    if (point.interpolated !== false) {
      throw Error("Interpolated trajectory points forbidden without model declaration");
    }
    if (
      point.crossesClinicallyMeaningfulGap &&
      gapPolicy === "no_interpolation_across_gap" &&
      point.valueDeclared !== null &&
      point.missingnessDeclared !== true
    ) {
      // Allowed: discrete declared values at sparse points; continuous fill forbidden via interpolated flag.
    }
    if (
      point.crossesClinicallyMeaningfulGap &&
      gapPolicy === "no_interpolation_across_gap" &&
      clinicallyMeaningfulGapDays !== null &&
      point.intervalDaysFromPrior !== null &&
      point.intervalDaysFromPrior >= clinicallyMeaningfulGapDays &&
      point.interpolated !== false
    ) {
      throw Error(
        "Cannot invent continuous trajectory across clinically meaningful gap",
      );
    }
    if (point.measurementTime !== null && !isIsoTimestamp(point.measurementTime)) {
      throw Error(`Invalid measurementTime at point[${index}]`);
    }
    if (point.eventTime !== null && !isIsoTimestamp(point.eventTime)) {
      throw Error(`Invalid eventTime at point[${index}]`);
    }
    if (point.ingestionTime !== null && !isIsoTimestamp(point.ingestionTime)) {
      throw Error(`Invalid ingestionTime at point[${index}]`);
    }
    if (point.valueDeclared !== null && !textOk(point.valueDeclared, 200)) {
      throw Error(`Invalid valueDeclared at point[${index}]`);
    }
    if (point.unit !== null && !textOk(point.unit, 64)) {
      throw Error(`Invalid unit at point[${index}]`);
    }
    if (!textOk(point.note, 500)) throw Error(`Invalid note at point[${index}]`);
    assertNoForbiddenClaimLanguage(point.note, `point[${index}] note`);
    if (
      point.missingnessDeclared &&
      point.valueDeclared !== null &&
      point.valueDeclared.trim().length > 0
    ) {
      throw Error(
        `point[${index}] cannot declare missingness with a value`,
      );
    }
    return {
      sequenceIndex: point.sequenceIndex,
      measurementTime: point.measurementTime,
      eventTime: point.eventTime,
      ingestionTime: point.ingestionTime,
      valueDeclared: point.valueDeclared,
      unit: point.unit,
      missingnessDeclared: point.missingnessDeclared === true,
      intervalDaysFromPrior: point.intervalDaysFromPrior,
      crossesClinicallyMeaningfulGap: point.crossesClinicallyMeaningfulGap === true,
      interpolated: false,
      note: point.note.trim(),
    };
  });
}

export function draftLongitudinalDiseaseStateSpec(input: {
  id: string;
  modellingKind: LdsmModellingKind;
  displayName: string;
  scientificQuestion: string;
  diseaseContextId: string;
  subjectRefKind: LdsmSubjectRefKind;
  subjectOrCohortRef: string;
  temporalAnchors: LdsmTemporalAnchorSet;
  observationIntervalKind: LdsmObservationIntervalKind;
  missingDataHandling: LdsmMissingDataHandling;
  gapPolicy: LdsmGapPolicy;
  eligibilityDefinitionTimeRole: LdsmTemporalRole;
  exposureDefinitionTimeRole: LdsmTemporalRole;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LdsmActorKind;
  integratedDiseaseContextId?: string | null;
  rweStudyId?: string | null;
  longitudinalAnalysisSpecId?: string | null;
  irregularFollowUpNote?: string | null;
  clinicallyMeaningfulGapDays?: number | null;
  datasetAvailability?: LdsmDatasetAvailability;
  accessClassification?: LdsmAccessClassification;
  note?: string;
}): LongitudinalDiseaseStateSpec {
  if (!SPEC_ID_RE.test(input.id)) throw Error("Invalid modelling spec id");
  if (!HDI_CTX_RE.test(input.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  assertClosed(input.modellingKind, LDSM_MODELLING_KINDS, "modellingKind");
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!textOk(input.scientificQuestion, 1000)) {
    throw Error("Invalid scientificQuestion");
  }
  assertNoForbiddenClaimLanguage(input.scientificQuestion, "scientificQuestion");
  assertClosed(input.subjectRefKind, LDSM_SUBJECT_REF_KINDS, "subjectRefKind");
  const subjectOrCohortRef = assertSubjectOrCohortRef(input.subjectOrCohortRef);
  const temporalAnchors = assertTemporalAnchorSet(input.temporalAnchors);
  assertClosed(
    input.observationIntervalKind,
    LDSM_OBSERVATION_INTERVAL_KINDS,
    "observationIntervalKind",
  );
  assertClosed(
    input.missingDataHandling,
    LDSM_MISSING_DATA_HANDLINGS,
    "missingDataHandling",
  );
  assertClosed(input.gapPolicy, LDSM_GAP_POLICIES, "gapPolicy");
  assertClosed(
    input.eligibilityDefinitionTimeRole,
    LDSM_TEMPORAL_ROLES,
    "eligibilityDefinitionTimeRole",
  );
  assertClosed(
    input.exposureDefinitionTimeRole,
    LDSM_TEMPORAL_ROLES,
    "exposureDefinitionTimeRole",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const datasetAvailability =
    input.datasetAvailability ?? "fixture_only";
  assertClosed(
    datasetAvailability,
    LDSM_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  const accessClassification =
    input.accessClassification ??
    (datasetAvailability === "fixture_only"
      ? "fixture_engineering"
      : datasetAvailability === "blocked_no_authorised_clinical_dataset"
        ? "restricted_not_ingested"
        : "authorised_pseudonymous_research");
  assertClosed(
    accessClassification,
    LDSM_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );

  if (
    (input.observationIntervalKind === "irregular_declared" ||
      input.observationIntervalKind === "sparse_declared") &&
    !(input.irregularFollowUpNote && textOk(input.irregularFollowUpNote, 500))
  ) {
    throw Error("Irregular/sparse follow-up requires irregularFollowUpNote");
  }
  if (input.irregularFollowUpNote) {
    assertNoForbiddenClaimLanguage(
      input.irregularFollowUpNote,
      "irregularFollowUpNote",
    );
  }

  if (
    input.clinicallyMeaningfulGapDays !== undefined &&
    input.clinicallyMeaningfulGapDays !== null &&
    (input.clinicallyMeaningfulGapDays < 1 ||
      input.clinicallyMeaningfulGapDays > 3650 ||
      !Number.isInteger(input.clinicallyMeaningfulGapDays))
  ) {
    throw Error("Invalid clinicallyMeaningfulGapDays");
  }

  const integrity = evaluateLdsmTemporalIntegrity({
    temporalAnchors,
    eligibilityDefinitionTimeRole: input.eligibilityDefinitionTimeRole,
    exposureDefinitionTimeRole: input.exposureDefinitionTimeRole,
  });
  if (
    integrity.status === "failed_future_information_leakage" ||
    integrity.status === "failed_prediction_before_measurement"
  ) {
    throw Error(
      `Temporal leakage fail-closed: ${integrity.failures.join("; ")}`,
    );
  }

  let lifecycle: LdsmLifecycle = "draft";
  if (datasetAvailability === "blocked_no_authorised_clinical_dataset") {
    lifecycle = "blocked_awaiting_authorised_dataset";
  } else if (
    integrity.status === "failed_collapsed_temporal_roles" ||
    integrity.status === "failed_missing_anchors"
  ) {
    lifecycle = "blocked_temporal_leakage";
  }

  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    "authoredBy",
  );
  const note = (input.note ?? "").trim();
  if (note) assertNoForbiddenClaimLanguage(note, "note");

  const record: LongitudinalDiseaseStateSpec = {
    schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
    method: LONGITUDINAL_DISEASE_STATE_METHOD,
    version: LONGITUDINAL_DISEASE_STATE_VERSION,
    id: input.id,
    modellingKind: input.modellingKind,
    displayName: input.displayName.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    diseaseContextId: input.diseaseContextId,
    integratedDiseaseContextId: assertOptionalId(
      input.integratedDiseaseContextId,
      CBC_IDC_RE,
      "integratedDiseaseContextId",
    ),
    rweStudyId: assertOptionalId(input.rweStudyId, RWE_STUDY_RE, "rweStudyId"),
    longitudinalAnalysisSpecId: assertOptionalId(
      input.longitudinalAnalysisSpecId,
      LCE_SPEC_RE,
      "longitudinalAnalysisSpecId",
    ),
    subjectRefKind: input.subjectRefKind,
    subjectOrCohortRef,
    temporalAnchors,
    observationIntervalKind: input.observationIntervalKind,
    irregularFollowUpNote: input.irregularFollowUpNote?.trim() ?? null,
    missingDataHandling: input.missingDataHandling,
    gapPolicy: input.gapPolicy,
    clinicallyMeaningfulGapDays: input.clinicallyMeaningfulGapDays ?? null,
    eligibilityDefinitionTimeRole: input.eligibilityDefinitionTimeRole,
    exposureDefinitionTimeRole: input.exposureDefinitionTimeRole,
    datasetAvailability,
    accessClassification,
    containsIdentifiablePhi: false,
    liveLongitudinalEngineOperational: false,
    notClinicalCare: true,
    lifecycle,
    reviewedBy: null,
    authoredBy,
    dataBasis: dataBasisForAvailability(datasetAvailability),
    fixtureHonesty: datasetAvailability === "fixture_only",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note,
  };
  return validateLongitudinalDiseaseStateSpec(record);
}

export function validateLongitudinalDiseaseStateSpec(
  record: LongitudinalDiseaseStateSpec,
): LongitudinalDiseaseStateSpec {
  if (record.schema !== LONGITUDINAL_DISEASE_STATE_SCHEMA) {
    throw Error("Invalid schema");
  }
  if (record.method !== LONGITUDINAL_DISEASE_STATE_METHOD) {
    throw Error("Invalid method");
  }
  if (record.version !== LONGITUDINAL_DISEASE_STATE_VERSION) {
    throw Error("Invalid version");
  }
  if (!SPEC_ID_RE.test(record.id)) throw Error("Invalid modelling spec id");
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  assertClosed(record.modellingKind, LDSM_MODELLING_KINDS, "modellingKind");
  assertClosed(record.lifecycle, LDSM_LIFECYCLES, "lifecycle");
  assertClosed(
    record.datasetAvailability,
    LDSM_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  assertClosed(
    record.accessClassification,
    LDSM_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );
  assertTemporalAnchorSet(record.temporalAnchors);
  assertHonesty(record.honesty);
  if (record.containsIdentifiablePhi !== false) {
    throw Error("PHI must stay false");
  }
  if (record.liveLongitudinalEngineOperational !== false) {
    throw Error("Live longitudinal engine must stay false");
  }
  if (record.notClinicalCare !== true) throw Error("Not clinical care");
  if (
    record.datasetAvailability === "blocked_no_authorised_clinical_dataset" &&
    record.lifecycle === "accepted_with_limitations"
  ) {
    throw Error("Blocked dataset spec cannot be accepted");
  }
  return record;
}

export function transitionLongitudinalDiseaseStateSpec(input: {
  spec: LongitudinalDiseaseStateSpec;
  to: LdsmLifecycle;
  updatedAt: string;
  actor: LdsmActor;
}): LongitudinalDiseaseStateSpec {
  const current = validateLongitudinalDiseaseStateSpec(input.spec);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "actor");
  const allowed = SPEC_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Invalid modelling spec transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    actor.actorKind !== "human"
  ) {
    throw Error("Human review required to accept modelling spec");
  }
  if (
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset" &&
    input.to === "accepted_with_limitations"
  ) {
    throw Error("Blocked dataset spec cannot be accepted");
  }
  return validateLongitudinalDiseaseStateSpec({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftDiseaseTrajectoryReconstruction(input: {
  id: string;
  modellingSpec: LongitudinalDiseaseStateSpec;
  clinicalConcept: string;
  points: readonly DiseaseTrajectoryPoint[];
  uncertaintyOrdinal: LdsmUncertaintyOrdinal;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LdsmActorKind;
  hdiObservationIds?: readonly string[];
  longitudinalSeriesId?: string | null;
  note?: string;
}): DiseaseTrajectoryReconstruction {
  const spec = validateLongitudinalDiseaseStateSpec(input.modellingSpec);
  if (!TRJ_ID_RE.test(input.id)) throw Error("Invalid trajectory id");
  if (!textOk(input.clinicalConcept, 200)) throw Error("Invalid clinicalConcept");
  assertNoForbiddenClaimLanguage(input.clinicalConcept, "clinicalConcept");
  assertClosed(
    input.uncertaintyOrdinal,
    LDSM_UNCERTAINTY_ORDINALS,
    "uncertaintyOrdinal",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (
    (spec.observationIntervalKind === "sparse_declared" ||
      spec.missingDataHandling === "uncertainty_preserved_sparse") &&
    input.uncertaintyOrdinal !== "high_sparse_preserved" &&
    input.uncertaintyOrdinal !== "insufficient_gap" &&
    input.uncertaintyOrdinal !== "blocked"
  ) {
    throw Error(
      "Sparse follow-up must preserve high/insufficient/blocked uncertainty",
    );
  }
  const points = assertTrajectoryPoints(
    input.points,
    spec.gapPolicy,
    spec.clinicallyMeaningfulGapDays,
  );
  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    "authoredBy",
  );
  const note = (input.note ?? "").trim();
  if (note) assertNoForbiddenClaimLanguage(note, "note");

  const record: DiseaseTrajectoryReconstruction = {
    schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
    method: LONGITUDINAL_DISEASE_STATE_METHOD,
    version: LONGITUDINAL_DISEASE_STATE_VERSION,
    id: input.id,
    modellingSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    clinicalConcept: input.clinicalConcept.trim(),
    observationIntervalKind: spec.observationIntervalKind,
    gapPolicy: spec.gapPolicy,
    missingDataHandling: spec.missingDataHandling,
    uncertaintyOrdinal: input.uncertaintyOrdinal,
    points,
    hdiObservationIds: assertIdList(
      input.hdiObservationIds ?? [],
      HDI_OBS_RE,
      "hdiObservationIds",
      32,
    ),
    longitudinalSeriesId: assertOptionalId(
      input.longitudinalSeriesId,
      LCE_SERIES_RE,
      "longitudinalSeriesId",
    ),
    continuousInterpolationInvented: null,
    fabricatedTrajectory: null,
    containsIdentifiablePhi: false,
    authoredBy,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note,
  };
  return validateDiseaseTrajectoryReconstruction(record);
}

export function validateDiseaseTrajectoryReconstruction(
  record: DiseaseTrajectoryReconstruction,
): DiseaseTrajectoryReconstruction {
  if (!TRJ_ID_RE.test(record.id)) throw Error("Invalid trajectory id");
  if (record.continuousInterpolationInvented !== null) {
    throw Error("Continuous interpolation must stay null");
  }
  if (record.fabricatedTrajectory !== null) {
    throw Error("Fabricated trajectory must stay null");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("PHI must stay false");
  }
  assertHonesty(record.honesty);
  assertTrajectoryPoints(
    record.points,
    record.gapPolicy,
    null,
  );
  return record;
}

export function draftBaselineFollowUpComparison(input: {
  id: string;
  modellingSpec: LongitudinalDiseaseStateSpec;
  clinicalConcept: string;
  baselineTime: string;
  followUpTime: string;
  comparisonSummary: string;
  uncertaintyOrdinal: LdsmUncertaintyOrdinal;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LdsmActorKind;
  baselineValueDeclared?: string | null;
  followUpValueDeclared?: string | null;
  hdiObservationIds?: readonly string[];
  note?: string;
}): BaselineFollowUpComparison {
  const spec = validateLongitudinalDiseaseStateSpec(input.modellingSpec);
  if (!CMP_ID_RE.test(input.id)) throw Error("Invalid comparison id");
  if (!textOk(input.clinicalConcept, 200)) throw Error("Invalid clinicalConcept");
  assertNoForbiddenClaimLanguage(input.clinicalConcept, "clinicalConcept");
  if (!isIsoTimestamp(input.baselineTime)) throw Error("Invalid baselineTime");
  if (!isIsoTimestamp(input.followUpTime)) throw Error("Invalid followUpTime");
  if (Date.parse(input.baselineTime) > Date.parse(input.followUpTime)) {
    throw Error("Baseline time must not be after follow-up time");
  }
  if (!textOk(input.comparisonSummary, 1000)) {
    throw Error("Invalid comparisonSummary");
  }
  assertNoForbiddenClaimLanguage(input.comparisonSummary, "comparisonSummary");
  assertClosed(
    input.uncertaintyOrdinal,
    LDSM_UNCERTAINTY_ORDINALS,
    "uncertaintyOrdinal",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    "authoredBy",
  );
  const note = (input.note ?? "").trim();
  if (note) assertNoForbiddenClaimLanguage(note, "note");

  const record: BaselineFollowUpComparison = {
    schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
    method: LONGITUDINAL_DISEASE_STATE_METHOD,
    version: LONGITUDINAL_DISEASE_STATE_VERSION,
    id: input.id,
    modellingSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    clinicalConcept: input.clinicalConcept.trim(),
    baselineTime: input.baselineTime,
    followUpTime: input.followUpTime,
    baselineValueDeclared: input.baselineValueDeclared?.trim() ?? null,
    followUpValueDeclared: input.followUpValueDeclared?.trim() ?? null,
    comparisonSummary: input.comparisonSummary.trim(),
    uncertaintyOrdinal: input.uncertaintyOrdinal,
    missingDataHandling: spec.missingDataHandling,
    hdiObservationIds: assertIdList(
      input.hdiObservationIds ?? [],
      HDI_OBS_RE,
      "hdiObservationIds",
      16,
    ),
    inventedDelta: null,
    provenTreatmentEffectClaimed: false,
    authoredBy,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note,
  };
  return validateBaselineFollowUpComparison(record);
}

export function validateBaselineFollowUpComparison(
  record: BaselineFollowUpComparison,
): BaselineFollowUpComparison {
  if (!CMP_ID_RE.test(record.id)) throw Error("Invalid comparison id");
  if (record.inventedDelta !== null) throw Error("Invented delta forbidden");
  if (record.provenTreatmentEffectClaimed !== false) {
    throw Error("Proven treatment effect claim forbidden");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftClinicalEventTimeline(input: {
  id: string;
  modellingSpec: LongitudinalDiseaseStateSpec;
  entries: readonly ClinicalEventTimelineEntry[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LdsmActorKind;
  note?: string;
}): ClinicalEventTimeline {
  const spec = validateLongitudinalDiseaseStateSpec(input.modellingSpec);
  if (!EVT_ID_RE.test(input.id)) throw Error("Invalid event timeline id");
  if (input.entries.length === 0) throw Error("event entries required");
  if (input.entries.length > 64) throw Error("Too many event entries");
  const entries = input.entries.map((entry, index) => {
    if (entry.sequenceIndex !== index) {
      throw Error(`event entry sequenceIndex must equal ${index}`);
    }
    if (!isIsoTimestamp(entry.eventTime)) {
      throw Error(`Invalid eventTime at entry[${index}]`);
    }
    if (
      entry.measurementTime !== null &&
      !isIsoTimestamp(entry.measurementTime)
    ) {
      throw Error(`Invalid measurementTime at entry[${index}]`);
    }
    if (entry.ingestionTime !== null && !isIsoTimestamp(entry.ingestionTime)) {
      throw Error(`Invalid ingestionTime at entry[${index}]`);
    }
    if (!textOk(entry.eventLabel, 200)) {
      throw Error(`Invalid eventLabel at entry[${index}]`);
    }
    assertNoForbiddenClaimLanguage(entry.eventLabel, `entry[${index}] eventLabel`);
    if (!textOk(entry.note, 500)) throw Error(`Invalid note at entry[${index}]`);
    assertNoForbiddenClaimLanguage(entry.note, `entry[${index}] note`);
    return {
      sequenceIndex: entry.sequenceIndex,
      eventTime: entry.eventTime,
      measurementTime: entry.measurementTime,
      ingestionTime: entry.ingestionTime,
      eventLabel: entry.eventLabel.trim(),
      missingnessDeclared: entry.missingnessDeclared === true,
      note: entry.note.trim(),
    };
  });
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    "authoredBy",
  );
  const note = (input.note ?? "").trim();
  if (note) assertNoForbiddenClaimLanguage(note, "note");

  const record: ClinicalEventTimeline = {
    schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
    method: LONGITUDINAL_DISEASE_STATE_METHOD,
    version: LONGITUDINAL_DISEASE_STATE_VERSION,
    id: input.id,
    modellingSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    observationIntervalKind: spec.observationIntervalKind,
    entries,
    gapPolicy: spec.gapPolicy,
    fabricatedTimeline: null,
    containsIdentifiablePhi: false,
    authoredBy,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note,
  };
  return validateClinicalEventTimeline(record);
}

export function validateClinicalEventTimeline(
  record: ClinicalEventTimeline,
): ClinicalEventTimeline {
  if (!EVT_ID_RE.test(record.id)) throw Error("Invalid event timeline id");
  if (record.fabricatedTimeline !== null) {
    throw Error("Fabricated timeline must stay null");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("PHI must stay false");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftOrganSpecificOutcomeTrend(input: {
  id: string;
  modellingSpec: LongitudinalDiseaseStateSpec;
  organSystem: string;
  outcomeConcept: string;
  trendSummary: string;
  uncertaintyOrdinal: LdsmUncertaintyOrdinal;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LdsmActorKind;
  rweOutcomeId?: string | null;
  longitudinalSeriesId?: string | null;
  note?: string;
}): OrganSpecificOutcomeTrend {
  const spec = validateLongitudinalDiseaseStateSpec(input.modellingSpec);
  if (!ORG_ID_RE.test(input.id)) throw Error("Invalid organ trend id");
  if (!textOk(input.organSystem, 120)) throw Error("Invalid organSystem");
  assertNoForbiddenClaimLanguage(input.organSystem, "organSystem");
  if (!textOk(input.outcomeConcept, 200)) throw Error("Invalid outcomeConcept");
  assertNoForbiddenClaimLanguage(input.outcomeConcept, "outcomeConcept");
  if (!textOk(input.trendSummary, 1000)) throw Error("Invalid trendSummary");
  assertNoForbiddenClaimLanguage(input.trendSummary, "trendSummary");
  assertClosed(
    input.uncertaintyOrdinal,
    LDSM_UNCERTAINTY_ORDINALS,
    "uncertaintyOrdinal",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    "authoredBy",
  );
  const note = (input.note ?? "").trim();
  if (note) assertNoForbiddenClaimLanguage(note, "note");

  const record: OrganSpecificOutcomeTrend = {
    schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
    method: LONGITUDINAL_DISEASE_STATE_METHOD,
    version: LONGITUDINAL_DISEASE_STATE_VERSION,
    id: input.id,
    modellingSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    organSystem: input.organSystem.trim(),
    outcomeConcept: input.outcomeConcept.trim(),
    observationIntervalKind: spec.observationIntervalKind,
    trendSummary: input.trendSummary.trim(),
    uncertaintyOrdinal: input.uncertaintyOrdinal,
    gapPolicy: spec.gapPolicy,
    rweOutcomeId: assertOptionalId(
      input.rweOutcomeId,
      RWE_OUT_RE,
      "rweOutcomeId",
    ),
    longitudinalSeriesId: assertOptionalId(
      input.longitudinalSeriesId,
      LCE_SERIES_RE,
      "longitudinalSeriesId",
    ),
    inventedContinuousCurve: null,
    authoredBy,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note,
  };
  return validateOrganSpecificOutcomeTrend(record);
}

export function validateOrganSpecificOutcomeTrend(
  record: OrganSpecificOutcomeTrend,
): OrganSpecificOutcomeTrend {
  if (!ORG_ID_RE.test(record.id)) throw Error("Invalid organ trend id");
  if (record.inventedContinuousCurve !== null) {
    throw Error("Invented continuous curve forbidden");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftTreatmentExposureContext(input: {
  id: string;
  modellingSpec: LongitudinalDiseaseStateSpec;
  exposureConcept: string;
  exposureSummary: string;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LdsmActorKind;
  exposureStartTime?: string | null;
  exposureEndTime?: string | null;
  rweExposureId?: string | null;
  note?: string;
}): TreatmentExposureContext {
  const spec = validateLongitudinalDiseaseStateSpec(input.modellingSpec);
  if (!EXP_ID_RE.test(input.id)) throw Error("Invalid exposure context id");
  if (!textOk(input.exposureConcept, 200)) throw Error("Invalid exposureConcept");
  assertNoForbiddenClaimLanguage(input.exposureConcept, "exposureConcept");
  if (!textOk(input.exposureSummary, 1000)) {
    throw Error("Invalid exposureSummary");
  }
  assertNoForbiddenClaimLanguage(input.exposureSummary, "exposureSummary");
  if (
    input.exposureStartTime !== undefined &&
    input.exposureStartTime !== null &&
    !isIsoTimestamp(input.exposureStartTime)
  ) {
    throw Error("Invalid exposureStartTime");
  }
  if (
    input.exposureEndTime !== undefined &&
    input.exposureEndTime !== null &&
    !isIsoTimestamp(input.exposureEndTime)
  ) {
    throw Error("Invalid exposureEndTime");
  }
  if (
    input.exposureStartTime &&
    input.exposureEndTime &&
    Date.parse(input.exposureStartTime) > Date.parse(input.exposureEndTime)
  ) {
    throw Error("Exposure start must not be after exposure end");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    "authoredBy",
  );
  const note = (input.note ?? "").trim();
  if (note) assertNoForbiddenClaimLanguage(note, "note");

  const record: TreatmentExposureContext = {
    schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
    method: LONGITUDINAL_DISEASE_STATE_METHOD,
    version: LONGITUDINAL_DISEASE_STATE_VERSION,
    id: input.id,
    modellingSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    exposureConcept: input.exposureConcept.trim(),
    exposureStartTime: input.exposureStartTime ?? null,
    exposureEndTime: input.exposureEndTime ?? null,
    exposureSummary: input.exposureSummary.trim(),
    rweExposureId: assertOptionalId(
      input.rweExposureId,
      RWE_EXP_RE,
      "rweExposureId",
    ),
    treatmentEffectClaimed: false,
    prescribingDirective: null,
    authoredBy,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note,
  };
  return validateTreatmentExposureContext(record);
}

export function validateTreatmentExposureContext(
  record: TreatmentExposureContext,
): TreatmentExposureContext {
  if (!EXP_ID_RE.test(record.id)) throw Error("Invalid exposure context id");
  if (record.treatmentEffectClaimed !== false) {
    throw Error("Treatment effect claim forbidden");
  }
  if (record.prescribingDirective !== null) {
    throw Error("Prescribing directive forbidden");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftBiomarkerTrajectory(input: {
  id: string;
  modellingSpec: LongitudinalDiseaseStateSpec;
  biomarkerConcept: string;
  points: readonly DiseaseTrajectoryPoint[];
  uncertaintyOrdinal: LdsmUncertaintyOrdinal;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LdsmActorKind;
  hdiObservationIds?: readonly string[];
  longitudinalSeriesId?: string | null;
  note?: string;
}): BiomarkerTrajectory {
  const spec = validateLongitudinalDiseaseStateSpec(input.modellingSpec);
  if (!BIO_ID_RE.test(input.id)) throw Error("Invalid biomarker trajectory id");
  if (!textOk(input.biomarkerConcept, 200)) {
    throw Error("Invalid biomarkerConcept");
  }
  assertNoForbiddenClaimLanguage(input.biomarkerConcept, "biomarkerConcept");
  assertClosed(
    input.uncertaintyOrdinal,
    LDSM_UNCERTAINTY_ORDINALS,
    "uncertaintyOrdinal",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (
    (spec.observationIntervalKind === "sparse_declared" ||
      spec.missingDataHandling === "uncertainty_preserved_sparse") &&
    input.uncertaintyOrdinal !== "high_sparse_preserved" &&
    input.uncertaintyOrdinal !== "insufficient_gap" &&
    input.uncertaintyOrdinal !== "blocked"
  ) {
    throw Error(
      "Sparse biomarker follow-up must preserve high/insufficient/blocked uncertainty",
    );
  }
  const points = assertTrajectoryPoints(
    input.points,
    spec.gapPolicy,
    spec.clinicallyMeaningfulGapDays,
  );
  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    "authoredBy",
  );
  const note = (input.note ?? "").trim();
  if (note) assertNoForbiddenClaimLanguage(note, "note");

  const record: BiomarkerTrajectory = {
    schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
    method: LONGITUDINAL_DISEASE_STATE_METHOD,
    version: LONGITUDINAL_DISEASE_STATE_VERSION,
    id: input.id,
    modellingSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    biomarkerConcept: input.biomarkerConcept.trim(),
    observationIntervalKind: spec.observationIntervalKind,
    gapPolicy: spec.gapPolicy,
    uncertaintyOrdinal: input.uncertaintyOrdinal,
    points,
    hdiObservationIds: assertIdList(
      input.hdiObservationIds ?? [],
      HDI_OBS_RE,
      "hdiObservationIds",
      32,
    ),
    longitudinalSeriesId: assertOptionalId(
      input.longitudinalSeriesId,
      LCE_SERIES_RE,
      "longitudinalSeriesId",
    ),
    continuousInterpolationInvented: null,
    authoredBy,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note,
  };
  return validateBiomarkerTrajectory(record);
}

export function validateBiomarkerTrajectory(
  record: BiomarkerTrajectory,
): BiomarkerTrajectory {
  if (!BIO_ID_RE.test(record.id)) throw Error("Invalid biomarker trajectory id");
  if (record.continuousInterpolationInvented !== null) {
    throw Error("Continuous interpolation must stay null");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftMissingDataAnalysis(input: {
  id: string;
  modellingSpec: LongitudinalDiseaseStateSpec;
  missingConcepts: readonly string[];
  analysisSummary: string;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LdsmActorKind;
  note?: string;
}): MissingDataAnalysis {
  const spec = validateLongitudinalDiseaseStateSpec(input.modellingSpec);
  if (!MIS_ID_RE.test(input.id)) throw Error("Invalid missing-data analysis id");
  const missingConcepts = assertStringList(
    input.missingConcepts,
    "missingConcepts",
    32,
    200,
  );
  if (!textOk(input.analysisSummary, 1000)) {
    throw Error("Invalid analysisSummary");
  }
  assertNoForbiddenClaimLanguage(input.analysisSummary, "analysisSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    "authoredBy",
  );
  const note = (input.note ?? "").trim();
  if (note) assertNoForbiddenClaimLanguage(note, "note");

  const record: MissingDataAnalysis = {
    schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
    method: LONGITUDINAL_DISEASE_STATE_METHOD,
    version: LONGITUDINAL_DISEASE_STATE_VERSION,
    id: input.id,
    modellingSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    missingConcepts,
    missingDataHandling: spec.missingDataHandling,
    sparseUncertaintyPreserved: true,
    analysisSummary: input.analysisSummary.trim(),
    inventedValues: null,
    authoredBy,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note,
  };
  return validateMissingDataAnalysis(record);
}

export function validateMissingDataAnalysis(
  record: MissingDataAnalysis,
): MissingDataAnalysis {
  if (!MIS_ID_RE.test(record.id)) throw Error("Invalid missing-data analysis id");
  if (record.inventedValues !== null) throw Error("Invented values forbidden");
  if (record.sparseUncertaintyPreserved !== true) {
    throw Error("Sparse uncertainty must be preserved");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftDiseaseStateTransition(input: {
  id: string;
  modellingSpec: LongitudinalDiseaseStateSpec;
  fromStateLabel: string;
  toStateLabel: string;
  transitionConfidence: LdsmTransitionConfidence;
  epistemicStatus: "observed" | "inferred";
  limitations: readonly string[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LdsmActorKind;
  transitionTime?: string | null;
  hdiObservationId?: string | null;
  hdiEstimateId?: string | null;
  note?: string;
}): DiseaseStateTransition {
  const spec = validateLongitudinalDiseaseStateSpec(input.modellingSpec);
  if (!TXN_ID_RE.test(input.id)) throw Error("Invalid state transition id");
  if (!textOk(input.fromStateLabel, 200)) throw Error("Invalid fromStateLabel");
  assertNoForbiddenClaimLanguage(input.fromStateLabel, "fromStateLabel");
  if (!textOk(input.toStateLabel, 200)) throw Error("Invalid toStateLabel");
  assertNoForbiddenClaimLanguage(input.toStateLabel, "toStateLabel");
  assertClosed(
    input.transitionConfidence,
    LDSM_TRANSITION_CONFIDENCES,
    "transitionConfidence",
  );
  if (
    input.epistemicStatus !== "observed" &&
    input.epistemicStatus !== "inferred"
  ) {
    throw Error("Invalid epistemicStatus");
  }
  if (
    input.epistemicStatus === "observed" &&
    input.hdiEstimateId !== undefined &&
    input.hdiEstimateId !== null
  ) {
    throw Error("Observed transition must not bind an inferred estimate id");
  }
  if (
    input.epistemicStatus === "inferred" &&
    input.hdiObservationId !== undefined &&
    input.hdiObservationId !== null &&
    (input.hdiEstimateId === undefined || input.hdiEstimateId === null)
  ) {
    throw Error(
      "Inferred transition should not collapse into observation-only binding",
    );
  }
  const limitations = assertLimitations(input.limitations);
  if (
    input.transitionTime !== undefined &&
    input.transitionTime !== null &&
    !isIsoTimestamp(input.transitionTime)
  ) {
    throw Error("Invalid transitionTime");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    "authoredBy",
  );
  const note = (input.note ?? "").trim();
  if (note) assertNoForbiddenClaimLanguage(note, "note");

  const record: DiseaseStateTransition = {
    schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
    method: LONGITUDINAL_DISEASE_STATE_METHOD,
    version: LONGITUDINAL_DISEASE_STATE_VERSION,
    id: input.id,
    modellingSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    fromStateLabel: input.fromStateLabel.trim(),
    toStateLabel: input.toStateLabel.trim(),
    transitionTime: input.transitionTime ?? null,
    transitionConfidence: input.transitionConfidence,
    epistemicStatus: input.epistemicStatus,
    hdiObservationId: assertOptionalId(
      input.hdiObservationId,
      HDI_OBS_RE,
      "hdiObservationId",
    ),
    hdiEstimateId: assertOptionalId(
      input.hdiEstimateId,
      HDI_EST_RE,
      "hdiEstimateId",
    ),
    limitations,
    clinicalCareDirective: null,
    authoredBy,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note,
  };
  return validateDiseaseStateTransition(record);
}

export function validateDiseaseStateTransition(
  record: DiseaseStateTransition,
): DiseaseStateTransition {
  if (!TXN_ID_RE.test(record.id)) throw Error("Invalid state transition id");
  if (record.clinicalCareDirective !== null) {
    throw Error("Clinical care directive forbidden");
  }
  if (
    record.epistemicStatus === "observed" &&
    record.hdiEstimateId !== null
  ) {
    throw Error("Observed transition must not bind inferred estimate");
  }
  assertHonesty(record.honesty);
  assertLimitations(record.limitations);
  return record;
}

export function draftLdsmTemporalIntegrityCheck(input: {
  id: string;
  modellingSpec: LongitudinalDiseaseStateSpec;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LdsmActorKind;
  note?: string;
}): LdsmTemporalIntegrityCheck {
  const spec = validateLongitudinalDiseaseStateSpec(input.modellingSpec);
  if (!TMP_ID_RE.test(input.id)) throw Error("Invalid temporal check id");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const integrity = evaluateLdsmTemporalIntegrity({
    temporalAnchors: spec.temporalAnchors,
    eligibilityDefinitionTimeRole: spec.eligibilityDefinitionTimeRole,
    exposureDefinitionTimeRole: spec.exposureDefinitionTimeRole,
  });
  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    "authoredBy",
  );
  const note = (input.note ?? "").trim();
  if (note) assertNoForbiddenClaimLanguage(note, "note");

  const record: LdsmTemporalIntegrityCheck = {
    schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
    method: LONGITUDINAL_DISEASE_STATE_METHOD,
    version: LONGITUDINAL_DISEASE_STATE_VERSION,
    id: input.id,
    modellingSpecId: spec.id,
    status: integrity.status,
    checksPerformed: integrity.checksPerformed,
    failures: integrity.failures,
    usedFutureInformationForEarlierWindow:
      integrity.usedFutureInformationForEarlierWindow,
    collapsedTemporalRoles: integrity.collapsedTemporalRoles,
    predictionBeforeMeasurement: integrity.predictionBeforeMeasurement,
    authoredBy,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note,
  };
  return validateLdsmTemporalIntegrityCheck(record);
}

export function validateLdsmTemporalIntegrityCheck(
  record: LdsmTemporalIntegrityCheck,
): LdsmTemporalIntegrityCheck {
  if (!TMP_ID_RE.test(record.id)) throw Error("Invalid temporal check id");
  assertClosed(record.status, LDSM_TEMPORAL_INTEGRITY_STATUSES, "status");
  assertHonesty(record.honesty);
  return record;
}

export function draftLongitudinalDiseaseStateModel(input: {
  id: string;
  displayName: string;
  modellingSpec: LongitudinalDiseaseStateSpec;
  modelVersion: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: LdsmActorKind;
  trajectories?: readonly DiseaseTrajectoryReconstruction[];
  baselineFollowUps?: readonly BaselineFollowUpComparison[];
  eventTimelines?: readonly ClinicalEventTimeline[];
  organTrends?: readonly OrganSpecificOutcomeTrend[];
  treatmentExposures?: readonly TreatmentExposureContext[];
  biomarkerTrajectories?: readonly BiomarkerTrajectory[];
  missingDataAnalyses?: readonly MissingDataAnalysis[];
  stateTransitions?: readonly DiseaseStateTransition[];
  temporalChecks?: readonly LdsmTemporalIntegrityCheck[];
  note?: string;
}): LongitudinalDiseaseStateModel {
  const spec = validateLongitudinalDiseaseStateSpec(input.modellingSpec);
  if (!MDL_ID_RE.test(input.id)) throw Error("Invalid disease state model id");
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!textOk(input.modelVersion, 32)) throw Error("Invalid modelVersion");
  const limitations = assertLimitations(input.limitations);
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const trajectories = (input.trajectories ?? []).map(
    validateDiseaseTrajectoryReconstruction,
  );
  const baselineFollowUps = (input.baselineFollowUps ?? []).map(
    validateBaselineFollowUpComparison,
  );
  const eventTimelines = (input.eventTimelines ?? []).map(
    validateClinicalEventTimeline,
  );
  const organTrends = (input.organTrends ?? []).map(
    validateOrganSpecificOutcomeTrend,
  );
  const treatmentExposures = (input.treatmentExposures ?? []).map(
    validateTreatmentExposureContext,
  );
  const biomarkerTrajectories = (input.biomarkerTrajectories ?? []).map(
    validateBiomarkerTrajectory,
  );
  const missingDataAnalyses = (input.missingDataAnalyses ?? []).map(
    validateMissingDataAnalysis,
  );
  const stateTransitions = (input.stateTransitions ?? []).map(
    validateDiseaseStateTransition,
  );
  const temporalChecks = (input.temporalChecks ?? []).map(
    validateLdsmTemporalIntegrityCheck,
  );

  for (const item of [
    ...trajectories,
    ...baselineFollowUps,
    ...eventTimelines,
    ...organTrends,
    ...treatmentExposures,
    ...biomarkerTrajectories,
    ...missingDataAnalyses,
    ...stateTransitions,
  ]) {
    if (item.modellingSpecId !== spec.id) {
      throw Error("Child envelope modellingSpecId mismatch");
    }
    if (item.diseaseContextId !== spec.diseaseContextId) {
      throw Error("Child envelope diseaseContextId mismatch");
    }
  }
  for (const check of temporalChecks) {
    if (check.modellingSpecId !== spec.id) {
      throw Error("Temporal check modellingSpecId mismatch");
    }
  }

  const worstStatus =
    temporalChecks.find(
      (c) =>
        c.status === "failed_future_information_leakage" ||
        c.status === "failed_prediction_before_measurement" ||
        c.status === "failed_collapsed_temporal_roles" ||
        c.status === "failed_missing_anchors",
    )?.status ??
    temporalChecks[0]?.status ??
    "not_assessed";

  if (
    worstStatus === "failed_future_information_leakage" ||
    worstStatus === "failed_prediction_before_measurement"
  ) {
    throw Error("Cannot draft model under failed temporal leakage checks");
  }

  let lifecycle: LdsmLifecycle = "draft";
  if (spec.datasetAvailability === "blocked_no_authorised_clinical_dataset") {
    lifecycle = "blocked_awaiting_authorised_dataset";
  } else if (
    worstStatus === "failed_collapsed_temporal_roles" ||
    worstStatus === "failed_missing_anchors"
  ) {
    lifecycle = "blocked_temporal_leakage";
  }

  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    "authoredBy",
  );
  const note = (input.note ?? "").trim();
  if (note) assertNoForbiddenClaimLanguage(note, "note");

  const record: LongitudinalDiseaseStateModel = {
    schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
    method: LONGITUDINAL_DISEASE_STATE_METHOD,
    version: LONGITUDINAL_DISEASE_STATE_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    diseaseContextId: spec.diseaseContextId,
    modellingSpecId: spec.id,
    trajectoryReconstructionIds: trajectories.map((t) => t.id),
    baselineFollowUpComparisonIds: baselineFollowUps.map((c) => c.id),
    clinicalEventTimelineIds: eventTimelines.map((e) => e.id),
    organSpecificOutcomeTrendIds: organTrends.map((o) => o.id),
    treatmentExposureContextIds: treatmentExposures.map((e) => e.id),
    biomarkerTrajectoryIds: biomarkerTrajectories.map((b) => b.id),
    missingDataAnalysisIds: missingDataAnalyses.map((m) => m.id),
    diseaseStateTransitionIds: stateTransitions.map((t) => t.id),
    temporalIntegrityCheckIds: temporalChecks.map((t) => t.id),
    modelVersion: input.modelVersion.trim(),
    limitations,
    temporalIntegrityStatus: worstStatus,
    datasetAvailability: spec.datasetAvailability,
    liveTwinOperational: false,
    notClinicalCare: true,
    graphPromotable: false,
    lifecycle,
    reviewedBy: null,
    authoredBy,
    dataBasis: spec.dataBasis,
    fixtureHonesty: spec.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note,
  };
  return validateLongitudinalDiseaseStateModel(record);
}

export function validateLongitudinalDiseaseStateModel(
  record: LongitudinalDiseaseStateModel,
): LongitudinalDiseaseStateModel {
  if (!MDL_ID_RE.test(record.id)) throw Error("Invalid disease state model id");
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (!SPEC_ID_RE.test(record.modellingSpecId)) {
    throw Error("Invalid modellingSpecId");
  }
  assertClosed(record.lifecycle, LDSM_LIFECYCLES, "lifecycle");
  assertClosed(
    record.temporalIntegrityStatus,
    LDSM_TEMPORAL_INTEGRITY_STATUSES,
    "temporalIntegrityStatus",
  );
  assertClosed(
    record.datasetAvailability,
    LDSM_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  if (record.liveTwinOperational !== false) {
    throw Error("Live twin must stay false");
  }
  if (record.notClinicalCare !== true) throw Error("Not clinical care");
  if (record.graphPromotable !== false) throw Error("Graph promotion forbidden");
  if (
    record.datasetAvailability === "blocked_no_authorised_clinical_dataset" &&
    record.lifecycle === "accepted_with_limitations"
  ) {
    throw Error("Blocked dataset model cannot be accepted");
  }
  if (
    (record.temporalIntegrityStatus === "failed_future_information_leakage" ||
      record.temporalIntegrityStatus ===
        "failed_prediction_before_measurement") &&
    record.lifecycle === "accepted_with_limitations"
  ) {
    throw Error("Cannot accept model with temporal leakage failures");
  }
  return record;
}

export function transitionLongitudinalDiseaseStateModel(input: {
  model: LongitudinalDiseaseStateModel;
  to: LdsmLifecycle;
  updatedAt: string;
  actor: LdsmActor;
}): LongitudinalDiseaseStateModel {
  const current = validateLongitudinalDiseaseStateModel(input.model);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "actor");
  const allowed = MODEL_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Invalid disease state model transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    actor.actorKind !== "human"
  ) {
    throw Error("Human review required to accept disease state model");
  }
  if (
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset" &&
    input.to === "accepted_with_limitations"
  ) {
    throw Error("Blocked dataset model cannot be accepted");
  }
  if (
    (current.temporalIntegrityStatus === "failed_future_information_leakage" ||
      current.temporalIntegrityStatus ===
        "failed_prediction_before_measurement") &&
    input.to === "accepted_with_limitations"
  ) {
    throw Error("Cannot accept model with temporal leakage failures");
  }
  return validateLongitudinalDiseaseStateModel({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryLongitudinalDiseaseStateStore(): LongitudinalDiseaseStateStore & {
  specs: Map<string, LongitudinalDiseaseStateSpec>;
  trajectories: Map<string, DiseaseTrajectoryReconstruction>;
  baselineFollowUps: Map<string, BaselineFollowUpComparison>;
  eventTimelines: Map<string, ClinicalEventTimeline>;
  organTrends: Map<string, OrganSpecificOutcomeTrend>;
  treatmentExposures: Map<string, TreatmentExposureContext>;
  biomarkerTrajectories: Map<string, BiomarkerTrajectory>;
  missingDataAnalyses: Map<string, MissingDataAnalysis>;
  stateTransitions: Map<string, DiseaseStateTransition>;
  temporalChecks: Map<string, LdsmTemporalIntegrityCheck>;
  models: Map<string, LongitudinalDiseaseStateModel>;
} {
  const specs = new Map<string, LongitudinalDiseaseStateSpec>();
  const trajectories = new Map<string, DiseaseTrajectoryReconstruction>();
  const baselineFollowUps = new Map<string, BaselineFollowUpComparison>();
  const eventTimelines = new Map<string, ClinicalEventTimeline>();
  const organTrends = new Map<string, OrganSpecificOutcomeTrend>();
  const treatmentExposures = new Map<string, TreatmentExposureContext>();
  const biomarkerTrajectories = new Map<string, BiomarkerTrajectory>();
  const missingDataAnalyses = new Map<string, MissingDataAnalysis>();
  const stateTransitions = new Map<string, DiseaseStateTransition>();
  const temporalChecks = new Map<string, LdsmTemporalIntegrityCheck>();
  const models = new Map<string, LongitudinalDiseaseStateModel>();

  const filterByDisease = <T extends {diseaseContextId: string}>(
    map: Map<string, T>,
    diseaseContextId?: string,
  ): readonly T[] => {
    const all = [...map.values()];
    return diseaseContextId
      ? all.filter((r) => r.diseaseContextId === diseaseContextId)
      : all;
  };

  return {
    specs,
    trajectories,
    baselineFollowUps,
    eventTimelines,
    organTrends,
    treatmentExposures,
    biomarkerTrajectories,
    missingDataAnalyses,
    stateTransitions,
    temporalChecks,
    models,
    upsertSpec(record) {
      const validated = validateLongitudinalDiseaseStateSpec(record);
      specs.set(validated.id, validated);
      return validated;
    },
    getSpec(id) {
      return specs.get(id) ?? null;
    },
    listSpecs(diseaseContextId) {
      return filterByDisease(specs, diseaseContextId);
    },
    upsertTrajectory(record) {
      const validated = validateDiseaseTrajectoryReconstruction(record);
      trajectories.set(validated.id, validated);
      return validated;
    },
    getTrajectory(id) {
      return trajectories.get(id) ?? null;
    },
    listTrajectories(diseaseContextId) {
      return filterByDisease(trajectories, diseaseContextId);
    },
    upsertBaselineFollowUp(record) {
      const validated = validateBaselineFollowUpComparison(record);
      baselineFollowUps.set(validated.id, validated);
      return validated;
    },
    getBaselineFollowUp(id) {
      return baselineFollowUps.get(id) ?? null;
    },
    listBaselineFollowUps(diseaseContextId) {
      return filterByDisease(baselineFollowUps, diseaseContextId);
    },
    upsertEventTimeline(record) {
      const validated = validateClinicalEventTimeline(record);
      eventTimelines.set(validated.id, validated);
      return validated;
    },
    getEventTimeline(id) {
      return eventTimelines.get(id) ?? null;
    },
    listEventTimelines(diseaseContextId) {
      return filterByDisease(eventTimelines, diseaseContextId);
    },
    upsertOrganTrend(record) {
      const validated = validateOrganSpecificOutcomeTrend(record);
      organTrends.set(validated.id, validated);
      return validated;
    },
    getOrganTrend(id) {
      return organTrends.get(id) ?? null;
    },
    listOrganTrends(diseaseContextId) {
      return filterByDisease(organTrends, diseaseContextId);
    },
    upsertTreatmentExposure(record) {
      const validated = validateTreatmentExposureContext(record);
      treatmentExposures.set(validated.id, validated);
      return validated;
    },
    getTreatmentExposure(id) {
      return treatmentExposures.get(id) ?? null;
    },
    listTreatmentExposures(diseaseContextId) {
      return filterByDisease(treatmentExposures, diseaseContextId);
    },
    upsertBiomarkerTrajectory(record) {
      const validated = validateBiomarkerTrajectory(record);
      biomarkerTrajectories.set(validated.id, validated);
      return validated;
    },
    getBiomarkerTrajectory(id) {
      return biomarkerTrajectories.get(id) ?? null;
    },
    listBiomarkerTrajectories(diseaseContextId) {
      return filterByDisease(biomarkerTrajectories, diseaseContextId);
    },
    upsertMissingDataAnalysis(record) {
      const validated = validateMissingDataAnalysis(record);
      missingDataAnalyses.set(validated.id, validated);
      return validated;
    },
    getMissingDataAnalysis(id) {
      return missingDataAnalyses.get(id) ?? null;
    },
    listMissingDataAnalyses(diseaseContextId) {
      return filterByDisease(missingDataAnalyses, diseaseContextId);
    },
    upsertStateTransition(record) {
      const validated = validateDiseaseStateTransition(record);
      stateTransitions.set(validated.id, validated);
      return validated;
    },
    getStateTransition(id) {
      return stateTransitions.get(id) ?? null;
    },
    listStateTransitions(diseaseContextId) {
      return filterByDisease(stateTransitions, diseaseContextId);
    },
    upsertTemporalIntegrityCheck(record) {
      const validated = validateLdsmTemporalIntegrityCheck(record);
      temporalChecks.set(validated.id, validated);
      return validated;
    },
    getTemporalIntegrityCheck(id) {
      return temporalChecks.get(id) ?? null;
    },
    listTemporalIntegrityChecks(modellingSpecId) {
      const all = [...temporalChecks.values()];
      return modellingSpecId
        ? all.filter((r) => r.modellingSpecId === modellingSpecId)
        : all;
    },
    upsertModel(record) {
      const validated = validateLongitudinalDiseaseStateModel(record);
      models.set(validated.id, validated);
      return validated;
    },
    getModel(id) {
      return models.get(id) ?? null;
    },
    listModels(diseaseContextId) {
      return filterByDisease(models, diseaseContextId);
    },
  };
}

export function projectLongitudinalDiseaseStatePersistenceLines(input: {
  specs: readonly LongitudinalDiseaseStateSpec[];
  trajectories?: readonly DiseaseTrajectoryReconstruction[];
  baselineFollowUps?: readonly BaselineFollowUpComparison[];
  eventTimelines?: readonly ClinicalEventTimeline[];
  organTrends?: readonly OrganSpecificOutcomeTrend[];
  treatmentExposures?: readonly TreatmentExposureContext[];
  biomarkerTrajectories?: readonly BiomarkerTrajectory[];
  missingDataAnalyses?: readonly MissingDataAnalysis[];
  stateTransitions?: readonly DiseaseStateTransition[];
  temporalChecks?: readonly LdsmTemporalIntegrityCheck[];
  models?: readonly LongitudinalDiseaseStateModel[];
}): string[] {
  for (const s of input.specs) validateLongitudinalDiseaseStateSpec(s);
  for (const t of input.trajectories ?? []) {
    validateDiseaseTrajectoryReconstruction(t);
  }
  for (const c of input.baselineFollowUps ?? []) {
    validateBaselineFollowUpComparison(c);
  }
  for (const e of input.eventTimelines ?? []) {
    validateClinicalEventTimeline(e);
  }
  for (const o of input.organTrends ?? []) {
    validateOrganSpecificOutcomeTrend(o);
  }
  for (const e of input.treatmentExposures ?? []) {
    validateTreatmentExposureContext(e);
  }
  for (const b of input.biomarkerTrajectories ?? []) {
    validateBiomarkerTrajectory(b);
  }
  for (const m of input.missingDataAnalyses ?? []) {
    validateMissingDataAnalysis(m);
  }
  for (const t of input.stateTransitions ?? []) {
    validateDiseaseStateTransition(t);
  }
  for (const t of input.temporalChecks ?? []) {
    validateLdsmTemporalIntegrityCheck(t);
  }
  for (const m of input.models ?? []) {
    validateLongitudinalDiseaseStateModel(m);
  }

  return [
    `schema=${LONGITUDINAL_DISEASE_STATE_SCHEMA}`,
    `method=${LONGITUDINAL_DISEASE_STATE_METHOD}`,
    `version=${LONGITUDINAL_DISEASE_STATE_VERSION}`,
    `specs=${input.specs.length}`,
    `trajectories=${(input.trajectories ?? []).length}`,
    `baselineFollowUps=${(input.baselineFollowUps ?? []).length}`,
    `eventTimelines=${(input.eventTimelines ?? []).length}`,
    `organTrends=${(input.organTrends ?? []).length}`,
    `treatmentExposures=${(input.treatmentExposures ?? []).length}`,
    `biomarkerTrajectories=${(input.biomarkerTrajectories ?? []).length}`,
    `missingDataAnalyses=${(input.missingDataAnalyses ?? []).length}`,
    `stateTransitions=${(input.stateTransitions ?? []).length}`,
    `temporalChecks=${(input.temporalChecks ?? []).length}`,
    `models=${(input.models ?? []).length}`,
    `observedIsNotInferred=true`,
    `noFutureDataLeakage=true`,
    `uncertaintyPreservedWhenSparse=true`,
    `noInventedContinuousTrajectoryAcrossGaps=true`,
    `notClinicalCare=true`,
    `noPhiIngestion=true`,
    `noLiveTwinOrMultiscaleClaim=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintLongitudinalDiseaseStateModel(
  model: LongitudinalDiseaseStateModel,
): string {
  const validated = validateLongitudinalDiseaseStateModel(model);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildLongitudinalDiseaseStatePack(input: {
  specs: readonly LongitudinalDiseaseStateSpec[];
  trajectories: readonly DiseaseTrajectoryReconstruction[];
  baselineFollowUps: readonly BaselineFollowUpComparison[];
  eventTimelines: readonly ClinicalEventTimeline[];
  organTrends: readonly OrganSpecificOutcomeTrend[];
  treatmentExposures: readonly TreatmentExposureContext[];
  biomarkerTrajectories: readonly BiomarkerTrajectory[];
  missingDataAnalyses: readonly MissingDataAnalysis[];
  stateTransitions: readonly DiseaseStateTransition[];
  temporalChecks: readonly LdsmTemporalIntegrityCheck[];
  models: readonly LongitudinalDiseaseStateModel[];
  asOf: string;
}): {
  schema: typeof LONGITUDINAL_DISEASE_STATE_SCHEMA;
  method: typeof LONGITUDINAL_DISEASE_STATE_METHOD;
  version: typeof LONGITUDINAL_DISEASE_STATE_VERSION;
  asOf: string;
  modellingKindCount: number;
  specCount: number;
  trajectoryCount: number;
  baselineFollowUpCount: number;
  eventTimelineCount: number;
  organTrendCount: number;
  treatmentExposureCount: number;
  biomarkerTrajectoryCount: number;
  missingDataAnalysisCount: number;
  stateTransitionCount: number;
  temporalCheckCount: number;
  modelCount: number;
  honesty: LongitudinalDiseaseStateHonesty;
  specs: readonly LongitudinalDiseaseStateSpec[];
  trajectories: readonly DiseaseTrajectoryReconstruction[];
  baselineFollowUps: readonly BaselineFollowUpComparison[];
  eventTimelines: readonly ClinicalEventTimeline[];
  organTrends: readonly OrganSpecificOutcomeTrend[];
  treatmentExposures: readonly TreatmentExposureContext[];
  biomarkerTrajectories: readonly BiomarkerTrajectory[];
  missingDataAnalyses: readonly MissingDataAnalysis[];
  stateTransitions: readonly DiseaseStateTransition[];
  temporalChecks: readonly LdsmTemporalIntegrityCheck[];
  models: readonly LongitudinalDiseaseStateModel[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const specs = input.specs.map(validateLongitudinalDiseaseStateSpec);
  const trajectories = input.trajectories.map(
    validateDiseaseTrajectoryReconstruction,
  );
  const baselineFollowUps = input.baselineFollowUps.map(
    validateBaselineFollowUpComparison,
  );
  const eventTimelines = input.eventTimelines.map(validateClinicalEventTimeline);
  const organTrends = input.organTrends.map(validateOrganSpecificOutcomeTrend);
  const treatmentExposures = input.treatmentExposures.map(
    validateTreatmentExposureContext,
  );
  const biomarkerTrajectories = input.biomarkerTrajectories.map(
    validateBiomarkerTrajectory,
  );
  const missingDataAnalyses = input.missingDataAnalyses.map(
    validateMissingDataAnalysis,
  );
  const stateTransitions = input.stateTransitions.map(
    validateDiseaseStateTransition,
  );
  const temporalChecks = input.temporalChecks.map(
    validateLdsmTemporalIntegrityCheck,
  );
  const models = input.models.map(validateLongitudinalDiseaseStateModel);
  return {
    schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
    method: LONGITUDINAL_DISEASE_STATE_METHOD,
    version: LONGITUDINAL_DISEASE_STATE_VERSION,
    asOf: input.asOf,
    modellingKindCount: LDSM_MODELLING_KINDS.length,
    specCount: specs.length,
    trajectoryCount: trajectories.length,
    baselineFollowUpCount: baselineFollowUps.length,
    eventTimelineCount: eventTimelines.length,
    organTrendCount: organTrends.length,
    treatmentExposureCount: treatmentExposures.length,
    biomarkerTrajectoryCount: biomarkerTrajectories.length,
    missingDataAnalysisCount: missingDataAnalyses.length,
    stateTransitionCount: stateTransitions.length,
    temporalCheckCount: temporalChecks.length,
    modelCount: models.length,
    honesty: {...DEFAULT_HONESTY},
    specs,
    trajectories,
    baselineFollowUps,
    eventTimelines,
    organTrends,
    treatmentExposures,
    biomarkerTrajectories,
    missingDataAnalyses,
    stateTransitions,
    temporalChecks,
    models,
  };
}
