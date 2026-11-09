/**
 * Milestone 15 / PR6 — Patient-Contextualised Research Models.
 *
 * Bounded individual-context research representation that reuses HDI digital
 * patient research models + population/cohort disease models (PR5) + M14 ids.
 *
 * Capabilities:
 * - Authorised longitudinal input
 * - Versioned observation set
 * - Disease state estimation (research / inferred)
 * - Model applicability check
 * - Missing-information assessment
 * - Uncertainty estimation
 * - Research-only interpretation
 * - Audit history
 *
 * Binding honesty:
 * - NOT a complete biological replica / digital twin product.
 * - NOT treatment recommendations or clinical care without separate
 *   validation/governance.
 * - Out-of-scope state when outside validated population/input domain.
 * - Fixtures only until authorised dataset; no PHI/CDS; Neon deferred;
 *   no workbench UI; no Gate C / MoU invention.
 * - Persistence: validated contracts + thin in-memory store.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA =
  "hsi-patient-contextualised-research-models-1" as const;
export const PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD =
  "hsi.patient_contextualised_research_models.v1" as const;
export const PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION = "0.1.0" as const;

export const PCRM_CAPABILITY_KINDS = [
  "authorised_longitudinal_input",
  "versioned_observation_set",
  "disease_state_estimation",
  "model_applicability_check",
  "missing_information_assessment",
  "uncertainty_estimation",
  "research_only_interpretation",
  "audit_history",
] as const;
export type PcrmCapabilityKind = (typeof PCRM_CAPABILITY_KINDS)[number];

export const PCRM_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "out_of_scope_outside_validated_domain",
  "blocked_awaiting_authorised_dataset",
  "blocked_incomplete_biological_replica_claim",
  "blocked_treatment_recommendation_claim",
  "rejected",
  "superseded",
] as const;
export type PcrmLifecycle = (typeof PCRM_LIFECYCLES)[number];

export const PCRM_DATASET_AVAILABILITY = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type PcrmDatasetAvailability =
  (typeof PCRM_DATASET_AVAILABILITY)[number];

export const PCRM_ACCESS_CLASSIFICATIONS = [
  "fixture_engineering",
  "authorised_pseudonymous_research",
  "restricted_not_ingested",
] as const;
export type PcrmAccessClassification =
  (typeof PCRM_ACCESS_CLASSIFICATIONS)[number];

export const PCRM_ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type PcrmActorKind = (typeof PCRM_ACTOR_KINDS)[number];

export const PCRM_DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type PcrmDataBasis = (typeof PCRM_DATA_BASES)[number];

export const PCRM_INPUT_AUTHORISATION_STATUSES = [
  "authorised_declared",
  "fixture_declared",
  "insufficient_authorisation",
  "blocked_not_authorised",
] as const;
export type PcrmInputAuthorisationStatus =
  (typeof PCRM_INPUT_AUTHORISATION_STATUSES)[number];

export const PCRM_APPLICABILITY_OUTCOMES = [
  "applicable_within_validated_domain",
  "partial_with_limitations",
  "out_of_scope_outside_validated_population",
  "out_of_scope_outside_input_domain",
  "insufficient_to_assess",
  "blocked_awaiting_authorised_dataset",
] as const;
export type PcrmApplicabilityOutcome =
  (typeof PCRM_APPLICABILITY_OUTCOMES)[number];

export const PCRM_MISSING_INFO_STATUSES = [
  "none_material_declared",
  "partial_declared",
  "material_gaps_declared",
  "explicitly_unresolved",
  "not_assessed",
] as const;
export type PcrmMissingInfoStatus =
  (typeof PCRM_MISSING_INFO_STATUSES)[number];

export const PCRM_UNCERTAINTY_ORDINALS = [
  "low_declared",
  "moderate_declared",
  "high_declared",
  "unquantified_declared",
  "insufficient",
] as const;
export type PcrmUncertaintyOrdinal =
  (typeof PCRM_UNCERTAINTY_ORDINALS)[number];

export const PCRM_ESTIMATE_METHOD_ORDINALS = [
  "rule_based_declared",
  "population_model_conditioned_declared",
  "expert_elicited_declared",
  "exploratory_declared",
  "insufficient",
] as const;
export type PcrmEstimateMethodOrdinal =
  (typeof PCRM_ESTIMATE_METHOD_ORDINALS)[number];

export const PCRM_AUDIT_ACTIONS = [
  "created",
  "updated",
  "reviewed",
  "accepted_with_limitations",
  "marked_out_of_scope",
  "blocked",
  "rejected",
  "superseded",
] as const;
export type PcrmAuditAction = (typeof PCRM_AUDIT_ACTIONS)[number];

const SPEC_ID_RE = /^hsi-pcrm-spec-[a-z0-9-]{3,80}$/;
const ALI_ID_RE = /^hsi-pcrm-ali-[a-z0-9-]{3,80}$/;
const VOS_ID_RE = /^hsi-pcrm-vos-[a-z0-9-]{3,80}$/;
const EST_ID_RE = /^hsi-pcrm-est-[a-z0-9-]{3,80}$/;
const APP_ID_RE = /^hsi-pcrm-app-[a-z0-9-]{3,80}$/;
const MIS_ID_RE = /^hsi-pcrm-mis-[a-z0-9-]{3,80}$/;
const UNC_ID_RE = /^hsi-pcrm-unc-[a-z0-9-]{3,80}$/;
const INT_ID_RE = /^hsi-pcrm-int-[a-z0-9-]{3,80}$/;
const AUD_ID_RE = /^hsi-pcrm-aud-[a-z0-9-]{3,80}$/;
const BND_ID_RE = /^hsi-pcrm-bnd-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const HDI_CTX_RE = /^hsi-hdi-ctx-[a-z0-9-]{3,80}$/;
const HDI_DPM_RE = /^hsi-hdi-dpm-[a-z0-9-]{3,80}$/;
const HDI_OBS_RE = /^hsi-hdi-obs-[a-z0-9-]{3,80}$/;
const CBC_IDC_RE = /^hsi-cbc-idc-[a-z0-9-]{3,80}$/;
const LDSM_SPEC_RE = /^hsi-ldsm-spec-[a-z0-9-]{3,80}$/;
const CSOL_SPEC_RE = /^hsi-csol-spec-[a-z0-9-]{3,80}$/;
const PCDM_SPEC_RE = /^hsi-pcdm-spec-[a-z0-9-]{3,80}$/;
const RCB_COH_RE = /^hsi-rcb-coh-[a-z0-9-]{3,80}$/;
const RWE_STUDY_RE = /^hsi-rwe-study-[a-z0-9-]{3,80}$/;
const LCE_SPEC_RE = /^hsi-lce-spec-[a-z0-9-]{3,80}$/;

export type PatientContextualisedResearchModelsHonesty = {
  researchDecisionSupportOnly: true;
  notCompleteBiologicalReplica: true;
  notDigitalTwinProduct: true;
  notTreatmentRecommendation: true;
  notClinicalCareWithoutSeparateValidation: true;
  outOfScopeOutsideValidatedDomain: true;
  populationAssociationIsNotIndividualTruth: true;
  observedIsNotInferred: true;
  noPhiIngestion: true;
  noLiveTwinOrMultiscaleClaim: true;
  noAutonomousDiagnosisOrPrescribing: true;
  noWorkbenchUi: true;
  agentsDraftHumansReview: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
};

export type PcrmActor = {
  principalId: string;
  actorKind: PcrmActorKind;
};

export type PatientContextualisedResearchSpec = {
  schema: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA;
  method: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD;
  version: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION;
  id: string;
  displayName: string;
  scientificQuestion: string;
  capabilityKinds: readonly PcrmCapabilityKind[];
  diseaseContextId: string;
  digitalPatientModelId: string;
  populationModellingSpecId: string | null;
  integratedDiseaseContextId: string | null;
  longitudinalModellingSpecId: string | null;
  crossScaleOntologySpecId: string | null;
  cohortDefinitionId: string | null;
  rweStudyId: string | null;
  longitudinalClinicalEvidenceSpecId: string | null;
  datasetAvailability: PcrmDatasetAvailability;
  accessClassification: PcrmAccessClassification;
  containsIdentifiablePhi: false;
  completeBiologicalReplicaClaimed: false;
  liveMultiscaleEngineOperational: false;
  notDigitalTwinProduct: true;
  notTreatmentRecommendation: true;
  notClinicalCareWithoutSeparateValidation: true;
  lifecycle: PcrmLifecycle;
  reviewedBy: PcrmActor | null;
  authoredBy: PcrmActor;
  dataBasis: PcrmDataBasis;
  fixtureHonesty: boolean;
  honesty: PatientContextualisedResearchModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type AuthorisedLongitudinalInput = {
  schema: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA;
  method: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD;
  version: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION;
  id: string;
  researchSpecId: string;
  diseaseContextId: string;
  digitalPatientModelId: string;
  authorisationStatus: PcrmInputAuthorisationStatus;
  longitudinalSourceSummary: string;
  linkedObservationRefIds: readonly string[];
  longitudinalClinicalEvidenceSpecId: string | null;
  containsIdentifiablePhi: false;
  limitations: readonly string[];
  authoredBy: PcrmActor;
  honesty: PatientContextualisedResearchModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type VersionedObservationSet = {
  schema: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA;
  method: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD;
  version: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION;
  id: string;
  researchSpecId: string;
  diseaseContextId: string;
  digitalPatientModelId: string;
  authorisedLongitudinalInputId: string;
  observationSetVersion: string;
  observationRefIds: readonly string[];
  observationCountDeclared: number;
  versionNote: string;
  containsIdentifiablePhi: false;
  limitations: readonly string[];
  authoredBy: PcrmActor;
  honesty: PatientContextualisedResearchModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DiseaseStateEstimation = {
  schema: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA;
  method: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD;
  version: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION;
  id: string;
  researchSpecId: string;
  diseaseContextId: string;
  digitalPatientModelId: string;
  versionedObservationSetId: string;
  populationModellingSpecId: string | null;
  epistemicStatus: "inferred";
  estimateMethodOrdinal: PcrmEstimateMethodOrdinal;
  estimateSummary: string;
  populationAssociationIsNotIndividualTruth: true;
  isDiagnosisDirective: false;
  treatmentRecommendationClaimed: false;
  limitations: readonly string[];
  authoredBy: PcrmActor;
  honesty: PatientContextualisedResearchModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ModelApplicabilityCheck = {
  schema: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA;
  method: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD;
  version: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION;
  id: string;
  researchSpecId: string;
  diseaseContextId: string;
  digitalPatientModelId: string;
  populationModellingSpecId: string | null;
  cohortDefinitionId: string | null;
  applicabilityOutcome: PcrmApplicabilityOutcome;
  applicabilitySummary: string;
  outsideValidatedPopulation: boolean;
  outsideInputDomain: boolean;
  outOfScope: boolean;
  limitations: readonly string[];
  authoredBy: PcrmActor;
  honesty: PatientContextualisedResearchModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MissingInformationAssessment = {
  schema: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA;
  method: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD;
  version: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION;
  id: string;
  researchSpecId: string;
  diseaseContextId: string;
  digitalPatientModelId: string;
  versionedObservationSetId: string;
  missingInfoStatus: PcrmMissingInfoStatus;
  missingDomainsDeclared: readonly string[];
  assessmentSummary: string;
  inventedValues: null;
  limitations: readonly string[];
  authoredBy: PcrmActor;
  honesty: PatientContextualisedResearchModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type UncertaintyEstimation = {
  schema: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA;
  method: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD;
  version: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION;
  id: string;
  researchSpecId: string;
  diseaseContextId: string;
  digitalPatientModelId: string;
  diseaseStateEstimationId: string | null;
  uncertaintyOrdinal: PcrmUncertaintyOrdinal;
  uncertaintySummary: string;
  sourcesOfUncertainty: readonly string[];
  limitations: readonly string[];
  authoredBy: PcrmActor;
  honesty: PatientContextualisedResearchModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ResearchOnlyInterpretation = {
  schema: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA;
  method: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD;
  version: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION;
  id: string;
  researchSpecId: string;
  diseaseContextId: string;
  digitalPatientModelId: string;
  diseaseStateEstimationId: string | null;
  modelApplicabilityCheckId: string | null;
  missingInformationAssessmentId: string | null;
  uncertaintyEstimationId: string | null;
  interpretationSummary: string;
  researchOnly: true;
  treatmentRecommendationClaimed: false;
  clinicalCareAuthorised: false;
  completeBiologicalReplicaClaimed: false;
  limitations: readonly string[];
  authoredBy: PcrmActor;
  honesty: PatientContextualisedResearchModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type AuditHistoryRecord = {
  schema: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA;
  method: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD;
  version: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION;
  id: string;
  researchSpecId: string;
  diseaseContextId: string;
  digitalPatientModelId: string;
  subjectRecordId: string;
  subjectRecordKind: string;
  action: PcrmAuditAction;
  actionSummary: string;
  performedBy: PcrmActor;
  honesty: PatientContextualisedResearchModelsHonesty;
  createdAt: string;
  note: string;
};

export type PatientContextualisedResearchBundle = {
  schema: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA;
  method: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD;
  version: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION;
  id: string;
  displayName: string;
  diseaseContextId: string;
  researchSpecId: string;
  digitalPatientModelId: string;
  authorisedLongitudinalInputIds: readonly string[];
  versionedObservationSetIds: readonly string[];
  diseaseStateEstimationIds: readonly string[];
  modelApplicabilityCheckIds: readonly string[];
  missingInformationAssessmentIds: readonly string[];
  uncertaintyEstimationIds: readonly string[];
  researchOnlyInterpretationIds: readonly string[];
  auditHistoryRecordIds: readonly string[];
  outOfScopeApplicabilityIds: readonly string[];
  bundleVersion: string;
  limitations: readonly string[];
  datasetAvailability: PcrmDatasetAvailability;
  completeBiologicalReplicaClaimed: false;
  liveMultiscaleEngineOperational: false;
  notDigitalTwinProduct: true;
  notTreatmentRecommendation: true;
  notClinicalCareWithoutSeparateValidation: true;
  graphPromotable: false;
  lifecycle: PcrmLifecycle;
  reviewedBy: PcrmActor | null;
  authoredBy: PcrmActor;
  dataBasis: PcrmDataBasis;
  fixtureHonesty: boolean;
  honesty: PatientContextualisedResearchModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PatientContextualisedResearchModelsStore = {
  upsertSpec(
    record: PatientContextualisedResearchSpec,
  ): PatientContextualisedResearchSpec;
  getSpec(id: string): PatientContextualisedResearchSpec | null;
  listSpecs(
    diseaseContextId?: string,
  ): readonly PatientContextualisedResearchSpec[];
  upsertAuthorisedLongitudinalInput(
    record: AuthorisedLongitudinalInput,
  ): AuthorisedLongitudinalInput;
  getAuthorisedLongitudinalInput(
    id: string,
  ): AuthorisedLongitudinalInput | null;
  listAuthorisedLongitudinalInputs(
    diseaseContextId?: string,
  ): readonly AuthorisedLongitudinalInput[];
  upsertVersionedObservationSet(
    record: VersionedObservationSet,
  ): VersionedObservationSet;
  getVersionedObservationSet(id: string): VersionedObservationSet | null;
  listVersionedObservationSets(
    diseaseContextId?: string,
  ): readonly VersionedObservationSet[];
  upsertDiseaseStateEstimation(
    record: DiseaseStateEstimation,
  ): DiseaseStateEstimation;
  getDiseaseStateEstimation(id: string): DiseaseStateEstimation | null;
  listDiseaseStateEstimations(
    diseaseContextId?: string,
  ): readonly DiseaseStateEstimation[];
  upsertModelApplicabilityCheck(
    record: ModelApplicabilityCheck,
  ): ModelApplicabilityCheck;
  getModelApplicabilityCheck(id: string): ModelApplicabilityCheck | null;
  listModelApplicabilityChecks(
    diseaseContextId?: string,
  ): readonly ModelApplicabilityCheck[];
  upsertMissingInformationAssessment(
    record: MissingInformationAssessment,
  ): MissingInformationAssessment;
  getMissingInformationAssessment(
    id: string,
  ): MissingInformationAssessment | null;
  listMissingInformationAssessments(
    diseaseContextId?: string,
  ): readonly MissingInformationAssessment[];
  upsertUncertaintyEstimation(
    record: UncertaintyEstimation,
  ): UncertaintyEstimation;
  getUncertaintyEstimation(id: string): UncertaintyEstimation | null;
  listUncertaintyEstimations(
    diseaseContextId?: string,
  ): readonly UncertaintyEstimation[];
  upsertResearchOnlyInterpretation(
    record: ResearchOnlyInterpretation,
  ): ResearchOnlyInterpretation;
  getResearchOnlyInterpretation(
    id: string,
  ): ResearchOnlyInterpretation | null;
  listResearchOnlyInterpretations(
    diseaseContextId?: string,
  ): readonly ResearchOnlyInterpretation[];
  upsertAuditHistoryRecord(record: AuditHistoryRecord): AuditHistoryRecord;
  getAuditHistoryRecord(id: string): AuditHistoryRecord | null;
  listAuditHistoryRecords(
    diseaseContextId?: string,
  ): readonly AuditHistoryRecord[];
  upsertBundle(
    record: PatientContextualisedResearchBundle,
  ): PatientContextualisedResearchBundle;
  getBundle(id: string): PatientContextualisedResearchBundle | null;
  listBundles(
    diseaseContextId?: string,
  ): readonly PatientContextualisedResearchBundle[];
};

const DEFAULT_HONESTY: PatientContextualisedResearchModelsHonesty = {
  researchDecisionSupportOnly: true,
  notCompleteBiologicalReplica: true,
  notDigitalTwinProduct: true,
  notTreatmentRecommendation: true,
  notClinicalCareWithoutSeparateValidation: true,
  outOfScopeOutsideValidatedDomain: true,
  populationAssociationIsNotIndividualTruth: true,
  observedIsNotInferred: true,
  noPhiIngestion: true,
  noLiveTwinOrMultiscaleClaim: true,
  noAutonomousDiagnosisOrPrescribing: true,
  noWorkbenchUi: true,
  agentsDraftHumansReview: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
};

const SPEC_TRANSITIONS: Record<PcrmLifecycle, readonly PcrmLifecycle[]> = {
  draft: [
    "under_review",
    "out_of_scope_outside_validated_domain",
    "blocked_awaiting_authorised_dataset",
    "blocked_incomplete_biological_replica_claim",
    "blocked_treatment_recommendation_claim",
    "rejected",
  ],
  under_review: [
    "accepted_with_limitations",
    "out_of_scope_outside_validated_domain",
    "blocked_awaiting_authorised_dataset",
    "blocked_incomplete_biological_replica_claim",
    "blocked_treatment_recommendation_claim",
    "rejected",
    "draft",
  ],
  accepted_with_limitations: ["superseded", "out_of_scope_outside_validated_domain"],
  out_of_scope_outside_validated_domain: ["draft", "rejected"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
  blocked_incomplete_biological_replica_claim: ["draft", "rejected"],
  blocked_treatment_recommendation_claim: ["draft", "rejected"],
  rejected: [],
  superseded: [],
};

const BUNDLE_TRANSITIONS = SPEC_TRANSITIONS;

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

function assertHonesty(
  honesty: PatientContextualisedResearchModelsHonesty,
): void {
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Research decision support only");
  }
  if (honesty.notCompleteBiologicalReplica !== true) {
    throw Error("Must not claim a complete biological replica");
  }
  if (honesty.notDigitalTwinProduct !== true) {
    throw Error("Not a digital twin product");
  }
  if (honesty.notTreatmentRecommendation !== true) {
    throw Error("Not a treatment recommendation");
  }
  if (honesty.notClinicalCareWithoutSeparateValidation !== true) {
    throw Error("Not clinical care without separate validation");
  }
  if (honesty.outOfScopeOutsideValidatedDomain !== true) {
    throw Error("Out-of-scope outside validated domain required");
  }
  if (honesty.populationAssociationIsNotIndividualTruth !== true) {
    throw Error("Population association is not individual truth");
  }
  if (honesty.observedIsNotInferred !== true) {
    throw Error("Observed must stay distinct from inferred");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noLiveTwinOrMultiscaleClaim !== true) {
    throw Error("Live twin/multiscale claim forbidden");
  }
  if (honesty.noAutonomousDiagnosisOrPrescribing !== true) {
    throw Error("Autonomous diagnosis/prescribing forbidden");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR6");
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
    throw Error("Scientific approval must stay false in PR6");
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
      /\b(?:not|no|without|never|does\s+not|do\s+not|must\s+not)\s+(?:a\s+|an\s+|the\s+|establish\s+|claim(?:ing)?\s+|confuse\s+.*?with\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+recommendation|treatment\s+directive|clinical\s+care|complete\s+biological\s+replica|digital\s+twin(?:\s+product)?|live\s+(?:twin|multiscale\s+engine)|individual\s+truth)(?:\s+or\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+recommendation|clinical\s+care|complete\s+biological\s+replica|digital\s+twin(?:\s+product)?|live\s+(?:twin|multiscale\s+engine)|individual\s+truth))*/g,
      " ",
    );
  if (
    /\bdiagnos(e|is|ing)\b/.test(lower) ||
    /\bprescribe\b/.test(lower) ||
    /\btreatment\s+recommendation\b/.test(lower) ||
    /\btreatment\s+directive\b/.test(lower) ||
    /\bcomplete\s+biological\s+replica\b/.test(lower) ||
    /\bdigital\s+twin(?:\s+product)?\b/.test(lower) ||
    /\blive\s+(?:twin|multiscale\s+engine)\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower)
  ) {
    throw Error(
      `${label} must not diagnose/prescribe, claim complete biological replica, twin product, live twin/multiscale, invent counts, or include identifiers`,
    );
  }
}

function assertActor(actor: PcrmActor, label: string): PcrmActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, PCRM_ACTOR_KINDS, `${label} actorKind`);
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

function assertLimitations(limitations: readonly string[]): readonly string[] {
  if (limitations.length === 0) throw Error("limitations required");
  if (limitations.length > 16) throw Error("Too many limitations");
  return limitations.map((item, index) => {
    if (!textOk(item, 1000)) throw Error(`Invalid limitation[${index}]`);
    assertNoForbiddenClaimLanguage(item, `limitation[${index}]`);
    return item.trim();
  });
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

function assertStringList(
  values: readonly string[],
  label: string,
  maxItems: number,
  maxLen: number,
): readonly string[] {
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  return values.map((item, index) => {
    if (!textOk(item, maxLen)) throw Error(`Invalid ${label}[${index}]`);
    assertNoForbiddenClaimLanguage(item, `${label}[${index}]`);
    return item.trim();
  });
}

function dataBasisForAvailability(
  availability: PcrmDatasetAvailability,
): PcrmDataBasis {
  if (availability === "authorised_declared") return "declared_research";
  if (availability === "fixture_only") return "fixture_engineering";
  return "fixture_engineering";
}

export function isOutOfScopeApplicability(
  outcome: PcrmApplicabilityOutcome,
): boolean {
  return (
    outcome === "out_of_scope_outside_validated_population" ||
    outcome === "out_of_scope_outside_input_domain"
  );
}

export function draftPatientContextualisedResearchSpec(input: {
  id: string;
  displayName: string;
  scientificQuestion: string;
  capabilityKinds?: readonly PcrmCapabilityKind[];
  diseaseContextId: string;
  digitalPatientModelId: string;
  populationModellingSpecId?: string | null;
  integratedDiseaseContextId?: string | null;
  longitudinalModellingSpecId?: string | null;
  crossScaleOntologySpecId?: string | null;
  cohortDefinitionId?: string | null;
  rweStudyId?: string | null;
  longitudinalClinicalEvidenceSpecId?: string | null;
  datasetAvailability: PcrmDatasetAvailability;
  accessClassification?: PcrmAccessClassification;
  authoredByPrincipalId: string;
  authoredByActorKind?: PcrmActorKind;
  createdAt: string;
  note?: string;
}): PatientContextualisedResearchSpec {
  if (!SPEC_ID_RE.test(input.id)) throw Error("Invalid research spec id");
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!textOk(input.scientificQuestion, 2000)) {
    throw Error("Invalid scientificQuestion");
  }
  assertNoForbiddenClaimLanguage(
    input.scientificQuestion,
    "scientificQuestion",
  );
  if (!HDI_CTX_RE.test(input.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (!HDI_DPM_RE.test(input.digitalPatientModelId)) {
    throw Error("Invalid digitalPatientModelId");
  }
  assertClosed(
    input.datasetAvailability,
    PCRM_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const capabilityKinds =
    input.capabilityKinds && input.capabilityKinds.length > 0
      ? [...new Set(input.capabilityKinds)]
      : [...PCRM_CAPABILITY_KINDS];
  for (const kind of capabilityKinds) {
    assertClosed(kind, PCRM_CAPABILITY_KINDS, "capabilityKind");
  }

  const accessClassification =
    input.accessClassification ??
    (input.datasetAvailability === "authorised_declared"
      ? "authorised_pseudonymous_research"
      : input.datasetAvailability === "fixture_only"
        ? "fixture_engineering"
        : "restricted_not_ingested");
  assertClosed(
    accessClassification,
    PCRM_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );

  const lifecycle: PcrmLifecycle =
    input.datasetAvailability === "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const record: PatientContextualisedResearchSpec = {
    schema: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
    method: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
    version: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    capabilityKinds,
    diseaseContextId: input.diseaseContextId,
    digitalPatientModelId: input.digitalPatientModelId,
    populationModellingSpecId: assertOptionalId(
      input.populationModellingSpecId,
      PCDM_SPEC_RE,
      "populationModellingSpecId",
    ),
    integratedDiseaseContextId: assertOptionalId(
      input.integratedDiseaseContextId,
      CBC_IDC_RE,
      "integratedDiseaseContextId",
    ),
    longitudinalModellingSpecId: assertOptionalId(
      input.longitudinalModellingSpecId,
      LDSM_SPEC_RE,
      "longitudinalModellingSpecId",
    ),
    crossScaleOntologySpecId: assertOptionalId(
      input.crossScaleOntologySpecId,
      CSOL_SPEC_RE,
      "crossScaleOntologySpecId",
    ),
    cohortDefinitionId: assertOptionalId(
      input.cohortDefinitionId,
      RCB_COH_RE,
      "cohortDefinitionId",
    ),
    rweStudyId: assertOptionalId(input.rweStudyId, RWE_STUDY_RE, "rweStudyId"),
    longitudinalClinicalEvidenceSpecId: assertOptionalId(
      input.longitudinalClinicalEvidenceSpecId,
      LCE_SPEC_RE,
      "longitudinalClinicalEvidenceSpecId",
    ),
    datasetAvailability: input.datasetAvailability,
    accessClassification,
    containsIdentifiablePhi: false,
    completeBiologicalReplicaClaimed: false,
    liveMultiscaleEngineOperational: false,
    notDigitalTwinProduct: true,
    notTreatmentRecommendation: true,
    notClinicalCareWithoutSeparateValidation: true,
    lifecycle,
    reviewedBy: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForAvailability(input.datasetAvailability),
    fixtureHonesty: input.datasetAvailability !== "authorised_declared",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validatePatientContextualisedResearchSpec(record);
}

export function validatePatientContextualisedResearchSpec(
  record: PatientContextualisedResearchSpec,
): PatientContextualisedResearchSpec {
  if (!SPEC_ID_RE.test(record.id)) throw Error("Invalid research spec id");
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (!HDI_DPM_RE.test(record.digitalPatientModelId)) {
    throw Error("Invalid digitalPatientModelId");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (record.completeBiologicalReplicaClaimed !== false) {
    throw Error("Complete biological replica claim forbidden");
  }
  if (record.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine must stay false");
  }
  if (record.notDigitalTwinProduct !== true) {
    throw Error("Must declare not a digital twin product");
  }
  if (record.notTreatmentRecommendation !== true) {
    throw Error("Must declare not a treatment recommendation");
  }
  if (record.notClinicalCareWithoutSeparateValidation !== true) {
    throw Error(
      "Must declare not clinical care without separate validation",
    );
  }
  assertClosed(record.lifecycle, PCRM_LIFECYCLES, "lifecycle");
  assertClosed(
    record.datasetAvailability,
    PCRM_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  assertClosed(
    record.accessClassification,
    PCRM_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );
  assertClosed(record.dataBasis, PCRM_DATA_BASES, "dataBasis");
  for (const kind of record.capabilityKinds) {
    assertClosed(kind, PCRM_CAPABILITY_KINDS, "capabilityKind");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  return record;
}

export function transitionPatientContextualisedResearchSpec(input: {
  spec: PatientContextualisedResearchSpec;
  to: PcrmLifecycle;
  updatedAt: string;
  actor: PcrmActor;
}): PatientContextualisedResearchSpec {
  const current = validatePatientContextualisedResearchSpec(input.spec);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = SPEC_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal lifecycle transition ${current.lifecycle} -> ${input.to}`,
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset"
  ) {
    throw Error("Cannot accept while dataset blocked");
  }
  if (input.to === "accepted_with_limitations" && actor.actorKind !== "human") {
    throw Error("Human review required for acceptance");
  }
  return validatePatientContextualisedResearchSpec({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" ||
      input.to === "rejected" ||
      input.to === "out_of_scope_outside_validated_domain"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftAuthorisedLongitudinalInput(input: {
  id: string;
  researchSpec: PatientContextualisedResearchSpec;
  authorisationStatus: PcrmInputAuthorisationStatus;
  longitudinalSourceSummary: string;
  linkedObservationRefIds?: readonly string[];
  longitudinalClinicalEvidenceSpecId?: string | null;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcrmActorKind;
  createdAt: string;
  note?: string;
}): AuthorisedLongitudinalInput {
  const spec = validatePatientContextualisedResearchSpec(input.researchSpec);
  if (!ALI_ID_RE.test(input.id)) {
    throw Error("Invalid authorised longitudinal input id");
  }
  assertClosed(
    input.authorisationStatus,
    PCRM_INPUT_AUTHORISATION_STATUSES,
    "authorisationStatus",
  );
  if (
    spec.datasetAvailability === "blocked_no_authorised_clinical_dataset" &&
    input.authorisationStatus === "authorised_declared"
  ) {
    throw Error(
      "Cannot declare authorised longitudinal input while dataset blocked",
    );
  }
  if (
    spec.datasetAvailability === "fixture_only" &&
    input.authorisationStatus === "authorised_declared"
  ) {
    throw Error(
      "Fixture dataset cannot claim authorised_declared longitudinal input",
    );
  }
  if (!textOk(input.longitudinalSourceSummary, 2000)) {
    throw Error("Invalid longitudinalSourceSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.longitudinalSourceSummary,
    "longitudinalSourceSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: AuthorisedLongitudinalInput = {
    schema: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
    method: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
    version: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
    id: input.id,
    researchSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    digitalPatientModelId: spec.digitalPatientModelId,
    authorisationStatus: input.authorisationStatus,
    longitudinalSourceSummary: input.longitudinalSourceSummary.trim(),
    linkedObservationRefIds: assertIdList(
      input.linkedObservationRefIds ?? [],
      HDI_OBS_RE,
      "linkedObservationRefIds",
      64,
    ),
    longitudinalClinicalEvidenceSpecId: assertOptionalId(
      input.longitudinalClinicalEvidenceSpecId ??
        spec.longitudinalClinicalEvidenceSpecId,
      LCE_SPEC_RE,
      "longitudinalClinicalEvidenceSpecId",
    ),
    containsIdentifiablePhi: false,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateAuthorisedLongitudinalInput(record);
}

export function validateAuthorisedLongitudinalInput(
  record: AuthorisedLongitudinalInput,
): AuthorisedLongitudinalInput {
  if (!ALI_ID_RE.test(record.id)) {
    throw Error("Invalid authorised longitudinal input id");
  }
  if (!SPEC_ID_RE.test(record.researchSpecId)) {
    throw Error("Invalid researchSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (!HDI_DPM_RE.test(record.digitalPatientModelId)) {
    throw Error("Invalid digitalPatientModelId");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  assertClosed(
    record.authorisationStatus,
    PCRM_INPUT_AUTHORISATION_STATUSES,
    "authorisationStatus",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftVersionedObservationSet(input: {
  id: string;
  researchSpec: PatientContextualisedResearchSpec;
  authorisedLongitudinalInput: AuthorisedLongitudinalInput;
  observationSetVersion: string;
  observationRefIds: readonly string[];
  versionNote: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcrmActorKind;
  createdAt: string;
  note?: string;
}): VersionedObservationSet {
  const spec = validatePatientContextualisedResearchSpec(input.researchSpec);
  const ali = validateAuthorisedLongitudinalInput(
    input.authorisedLongitudinalInput,
  );
  if (ali.researchSpecId !== spec.id) {
    throw Error("Authorised longitudinal input must match research spec");
  }
  if (!VOS_ID_RE.test(input.id)) {
    throw Error("Invalid versioned observation set id");
  }
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(input.observationSetVersion)) {
    throw Error("Invalid observationSetVersion");
  }
  if (input.observationRefIds.length === 0) {
    throw Error("observationRefIds required");
  }
  if (!textOk(input.versionNote, 1000)) throw Error("Invalid versionNote");
  assertNoForbiddenClaimLanguage(input.versionNote, "versionNote");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const observationRefIds = assertIdList(
    input.observationRefIds,
    HDI_OBS_RE,
    "observationRefIds",
    128,
  );

  const record: VersionedObservationSet = {
    schema: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
    method: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
    version: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
    id: input.id,
    researchSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    digitalPatientModelId: spec.digitalPatientModelId,
    authorisedLongitudinalInputId: ali.id,
    observationSetVersion: input.observationSetVersion,
    observationRefIds,
    observationCountDeclared: observationRefIds.length,
    versionNote: input.versionNote.trim(),
    containsIdentifiablePhi: false,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateVersionedObservationSet(record);
}

export function validateVersionedObservationSet(
  record: VersionedObservationSet,
): VersionedObservationSet {
  if (!VOS_ID_RE.test(record.id)) {
    throw Error("Invalid versioned observation set id");
  }
  if (!SPEC_ID_RE.test(record.researchSpecId)) {
    throw Error("Invalid researchSpecId");
  }
  if (!ALI_ID_RE.test(record.authorisedLongitudinalInputId)) {
    throw Error("Invalid authorisedLongitudinalInputId");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (record.observationCountDeclared !== record.observationRefIds.length) {
    throw Error("observationCountDeclared must match observationRefIds length");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftDiseaseStateEstimation(input: {
  id: string;
  researchSpec: PatientContextualisedResearchSpec;
  versionedObservationSet: VersionedObservationSet;
  estimateMethodOrdinal: PcrmEstimateMethodOrdinal;
  estimateSummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcrmActorKind;
  createdAt: string;
  note?: string;
}): DiseaseStateEstimation {
  const spec = validatePatientContextualisedResearchSpec(input.researchSpec);
  const vos = validateVersionedObservationSet(input.versionedObservationSet);
  if (vos.researchSpecId !== spec.id) {
    throw Error("Versioned observation set must match research spec");
  }
  if (!EST_ID_RE.test(input.id)) {
    throw Error("Invalid disease state estimation id");
  }
  assertClosed(
    input.estimateMethodOrdinal,
    PCRM_ESTIMATE_METHOD_ORDINALS,
    "estimateMethodOrdinal",
  );
  if (!textOk(input.estimateSummary, 2000)) {
    throw Error("Invalid estimateSummary");
  }
  assertNoForbiddenClaimLanguage(input.estimateSummary, "estimateSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: DiseaseStateEstimation = {
    schema: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
    method: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
    version: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
    id: input.id,
    researchSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    digitalPatientModelId: spec.digitalPatientModelId,
    versionedObservationSetId: vos.id,
    populationModellingSpecId: spec.populationModellingSpecId,
    epistemicStatus: "inferred",
    estimateMethodOrdinal: input.estimateMethodOrdinal,
    estimateSummary: input.estimateSummary.trim(),
    populationAssociationIsNotIndividualTruth: true,
    isDiagnosisDirective: false,
    treatmentRecommendationClaimed: false,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateDiseaseStateEstimation(record);
}

export function validateDiseaseStateEstimation(
  record: DiseaseStateEstimation,
): DiseaseStateEstimation {
  if (!EST_ID_RE.test(record.id)) {
    throw Error("Invalid disease state estimation id");
  }
  if (record.epistemicStatus !== "inferred") {
    throw Error("Disease state estimation must stay inferred");
  }
  if (record.isDiagnosisDirective !== false) {
    throw Error("Diagnosis directive forbidden");
  }
  if (record.treatmentRecommendationClaimed !== false) {
    throw Error("Treatment recommendation forbidden");
  }
  if (record.populationAssociationIsNotIndividualTruth !== true) {
    throw Error("Population association is not individual truth");
  }
  assertClosed(
    record.estimateMethodOrdinal,
    PCRM_ESTIMATE_METHOD_ORDINALS,
    "estimateMethodOrdinal",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftModelApplicabilityCheck(input: {
  id: string;
  researchSpec: PatientContextualisedResearchSpec;
  applicabilityOutcome: PcrmApplicabilityOutcome;
  applicabilitySummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcrmActorKind;
  createdAt: string;
  note?: string;
}): ModelApplicabilityCheck {
  const spec = validatePatientContextualisedResearchSpec(input.researchSpec);
  if (!APP_ID_RE.test(input.id)) {
    throw Error("Invalid model applicability check id");
  }
  assertClosed(
    input.applicabilityOutcome,
    PCRM_APPLICABILITY_OUTCOMES,
    "applicabilityOutcome",
  );
  if (
    spec.datasetAvailability === "blocked_no_authorised_clinical_dataset" &&
    input.applicabilityOutcome === "applicable_within_validated_domain"
  ) {
    throw Error(
      "Cannot claim applicable within validated domain while dataset blocked",
    );
  }
  if (!textOk(input.applicabilitySummary, 2000)) {
    throw Error("Invalid applicabilitySummary");
  }
  assertNoForbiddenClaimLanguage(
    input.applicabilitySummary,
    "applicabilitySummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const outsideValidatedPopulation =
    input.applicabilityOutcome ===
    "out_of_scope_outside_validated_population";
  const outsideInputDomain =
    input.applicabilityOutcome === "out_of_scope_outside_input_domain";
  const outOfScope = isOutOfScopeApplicability(input.applicabilityOutcome);

  const record: ModelApplicabilityCheck = {
    schema: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
    method: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
    version: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
    id: input.id,
    researchSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    digitalPatientModelId: spec.digitalPatientModelId,
    populationModellingSpecId: spec.populationModellingSpecId,
    cohortDefinitionId: spec.cohortDefinitionId,
    applicabilityOutcome: input.applicabilityOutcome,
    applicabilitySummary: input.applicabilitySummary.trim(),
    outsideValidatedPopulation,
    outsideInputDomain,
    outOfScope,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateModelApplicabilityCheck(record);
}

export function validateModelApplicabilityCheck(
  record: ModelApplicabilityCheck,
): ModelApplicabilityCheck {
  if (!APP_ID_RE.test(record.id)) {
    throw Error("Invalid model applicability check id");
  }
  assertClosed(
    record.applicabilityOutcome,
    PCRM_APPLICABILITY_OUTCOMES,
    "applicabilityOutcome",
  );
  const expectedOutOfScope = isOutOfScopeApplicability(
    record.applicabilityOutcome,
  );
  if (record.outOfScope !== expectedOutOfScope) {
    throw Error("outOfScope flag must match applicabilityOutcome");
  }
  if (
    record.outsideValidatedPopulation !==
    (record.applicabilityOutcome ===
      "out_of_scope_outside_validated_population")
  ) {
    throw Error("outsideValidatedPopulation flag mismatch");
  }
  if (
    record.outsideInputDomain !==
    (record.applicabilityOutcome === "out_of_scope_outside_input_domain")
  ) {
    throw Error("outsideInputDomain flag mismatch");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftMissingInformationAssessment(input: {
  id: string;
  researchSpec: PatientContextualisedResearchSpec;
  versionedObservationSet: VersionedObservationSet;
  missingInfoStatus: PcrmMissingInfoStatus;
  missingDomainsDeclared?: readonly string[];
  assessmentSummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcrmActorKind;
  createdAt: string;
  note?: string;
}): MissingInformationAssessment {
  const spec = validatePatientContextualisedResearchSpec(input.researchSpec);
  const vos = validateVersionedObservationSet(input.versionedObservationSet);
  if (vos.researchSpecId !== spec.id) {
    throw Error("Versioned observation set must match research spec");
  }
  if (!MIS_ID_RE.test(input.id)) {
    throw Error("Invalid missing information assessment id");
  }
  assertClosed(
    input.missingInfoStatus,
    PCRM_MISSING_INFO_STATUSES,
    "missingInfoStatus",
  );
  if (!textOk(input.assessmentSummary, 2000)) {
    throw Error("Invalid assessmentSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.assessmentSummary,
    "assessmentSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const missingDomainsDeclared = assertStringList(
    input.missingDomainsDeclared ?? [],
    "missingDomainsDeclared",
    24,
    200,
  );
  if (
    (input.missingInfoStatus === "material_gaps_declared" ||
      input.missingInfoStatus === "partial_declared") &&
    missingDomainsDeclared.length === 0
  ) {
    throw Error("Missing domains required when gaps are declared");
  }

  const record: MissingInformationAssessment = {
    schema: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
    method: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
    version: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
    id: input.id,
    researchSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    digitalPatientModelId: spec.digitalPatientModelId,
    versionedObservationSetId: vos.id,
    missingInfoStatus: input.missingInfoStatus,
    missingDomainsDeclared,
    assessmentSummary: input.assessmentSummary.trim(),
    inventedValues: null,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateMissingInformationAssessment(record);
}

export function validateMissingInformationAssessment(
  record: MissingInformationAssessment,
): MissingInformationAssessment {
  if (!MIS_ID_RE.test(record.id)) {
    throw Error("Invalid missing information assessment id");
  }
  if (record.inventedValues !== null) {
    throw Error("Invented values forbidden");
  }
  assertClosed(
    record.missingInfoStatus,
    PCRM_MISSING_INFO_STATUSES,
    "missingInfoStatus",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftUncertaintyEstimation(input: {
  id: string;
  researchSpec: PatientContextualisedResearchSpec;
  diseaseStateEstimation?: DiseaseStateEstimation | null;
  uncertaintyOrdinal: PcrmUncertaintyOrdinal;
  uncertaintySummary: string;
  sourcesOfUncertainty: readonly string[];
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcrmActorKind;
  createdAt: string;
  note?: string;
}): UncertaintyEstimation {
  const spec = validatePatientContextualisedResearchSpec(input.researchSpec);
  const estimation = input.diseaseStateEstimation
    ? validateDiseaseStateEstimation(input.diseaseStateEstimation)
    : null;
  if (estimation && estimation.researchSpecId !== spec.id) {
    throw Error("Disease state estimation must match research spec");
  }
  if (!UNC_ID_RE.test(input.id)) {
    throw Error("Invalid uncertainty estimation id");
  }
  assertClosed(
    input.uncertaintyOrdinal,
    PCRM_UNCERTAINTY_ORDINALS,
    "uncertaintyOrdinal",
  );
  if (!textOk(input.uncertaintySummary, 2000)) {
    throw Error("Invalid uncertaintySummary");
  }
  assertNoForbiddenClaimLanguage(
    input.uncertaintySummary,
    "uncertaintySummary",
  );
  if (input.sourcesOfUncertainty.length === 0) {
    throw Error("sourcesOfUncertainty required");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: UncertaintyEstimation = {
    schema: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
    method: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
    version: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
    id: input.id,
    researchSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    digitalPatientModelId: spec.digitalPatientModelId,
    diseaseStateEstimationId: estimation?.id ?? null,
    uncertaintyOrdinal: input.uncertaintyOrdinal,
    uncertaintySummary: input.uncertaintySummary.trim(),
    sourcesOfUncertainty: assertStringList(
      input.sourcesOfUncertainty,
      "sourcesOfUncertainty",
      16,
      400,
    ),
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateUncertaintyEstimation(record);
}

export function validateUncertaintyEstimation(
  record: UncertaintyEstimation,
): UncertaintyEstimation {
  if (!UNC_ID_RE.test(record.id)) {
    throw Error("Invalid uncertainty estimation id");
  }
  assertClosed(
    record.uncertaintyOrdinal,
    PCRM_UNCERTAINTY_ORDINALS,
    "uncertaintyOrdinal",
  );
  if (record.sourcesOfUncertainty.length === 0) {
    throw Error("sourcesOfUncertainty required");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftResearchOnlyInterpretation(input: {
  id: string;
  researchSpec: PatientContextualisedResearchSpec;
  interpretationSummary: string;
  diseaseStateEstimation?: DiseaseStateEstimation | null;
  modelApplicabilityCheck?: ModelApplicabilityCheck | null;
  missingInformationAssessment?: MissingInformationAssessment | null;
  uncertaintyEstimation?: UncertaintyEstimation | null;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcrmActorKind;
  createdAt: string;
  note?: string;
}): ResearchOnlyInterpretation {
  const spec = validatePatientContextualisedResearchSpec(input.researchSpec);
  const estimation = input.diseaseStateEstimation
    ? validateDiseaseStateEstimation(input.diseaseStateEstimation)
    : null;
  const applicability = input.modelApplicabilityCheck
    ? validateModelApplicabilityCheck(input.modelApplicabilityCheck)
    : null;
  const missing = input.missingInformationAssessment
    ? validateMissingInformationAssessment(input.missingInformationAssessment)
    : null;
  const uncertainty = input.uncertaintyEstimation
    ? validateUncertaintyEstimation(input.uncertaintyEstimation)
    : null;

  if (estimation && estimation.researchSpecId !== spec.id) {
    throw Error("Disease state estimation must match research spec");
  }
  if (applicability && applicability.researchSpecId !== spec.id) {
    throw Error("Model applicability check must match research spec");
  }
  if (missing && missing.researchSpecId !== spec.id) {
    throw Error("Missing information assessment must match research spec");
  }
  if (uncertainty && uncertainty.researchSpecId !== spec.id) {
    throw Error("Uncertainty estimation must match research spec");
  }
  if (applicability?.outOfScope === true) {
    throw Error(
      "Research interpretation refused while model applicability is out of scope",
    );
  }
  if (!INT_ID_RE.test(input.id)) {
    throw Error("Invalid research-only interpretation id");
  }
  if (!textOk(input.interpretationSummary, 2000)) {
    throw Error("Invalid interpretationSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.interpretationSummary,
    "interpretationSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: ResearchOnlyInterpretation = {
    schema: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
    method: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
    version: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
    id: input.id,
    researchSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    digitalPatientModelId: spec.digitalPatientModelId,
    diseaseStateEstimationId: estimation?.id ?? null,
    modelApplicabilityCheckId: applicability?.id ?? null,
    missingInformationAssessmentId: missing?.id ?? null,
    uncertaintyEstimationId: uncertainty?.id ?? null,
    interpretationSummary: input.interpretationSummary.trim(),
    researchOnly: true,
    treatmentRecommendationClaimed: false,
    clinicalCareAuthorised: false,
    completeBiologicalReplicaClaimed: false,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateResearchOnlyInterpretation(record);
}

export function validateResearchOnlyInterpretation(
  record: ResearchOnlyInterpretation,
): ResearchOnlyInterpretation {
  if (!INT_ID_RE.test(record.id)) {
    throw Error("Invalid research-only interpretation id");
  }
  if (record.researchOnly !== true) {
    throw Error("Interpretation must stay research-only");
  }
  if (record.treatmentRecommendationClaimed !== false) {
    throw Error("Treatment recommendation forbidden");
  }
  if (record.clinicalCareAuthorised !== false) {
    throw Error("Clinical care authorisation forbidden in PR6");
  }
  if (record.completeBiologicalReplicaClaimed !== false) {
    throw Error("Complete biological replica claim forbidden");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftAuditHistoryRecord(input: {
  id: string;
  researchSpec: PatientContextualisedResearchSpec;
  subjectRecordId: string;
  subjectRecordKind: string;
  action: PcrmAuditAction;
  actionSummary: string;
  performedByPrincipalId: string;
  performedByActorKind?: PcrmActorKind;
  createdAt: string;
  note?: string;
}): AuditHistoryRecord {
  const spec = validatePatientContextualisedResearchSpec(input.researchSpec);
  if (!AUD_ID_RE.test(input.id)) throw Error("Invalid audit history record id");
  if (!REF_ID_RE.test(input.subjectRecordId)) {
    throw Error("Invalid subjectRecordId");
  }
  if (!textOk(input.subjectRecordKind, 80)) {
    throw Error("Invalid subjectRecordKind");
  }
  assertClosed(input.action, PCRM_AUDIT_ACTIONS, "action");
  if (!textOk(input.actionSummary, 1000)) {
    throw Error("Invalid actionSummary");
  }
  assertNoForbiddenClaimLanguage(input.actionSummary, "actionSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: AuditHistoryRecord = {
    schema: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
    method: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
    version: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
    id: input.id,
    researchSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    digitalPatientModelId: spec.digitalPatientModelId,
    subjectRecordId: input.subjectRecordId,
    subjectRecordKind: input.subjectRecordKind.trim(),
    action: input.action,
    actionSummary: input.actionSummary.trim(),
    performedBy: assertActor(
      {
        principalId: input.performedByPrincipalId,
        actorKind: input.performedByActorKind ?? "ai_agent",
      },
      "performedBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateAuditHistoryRecord(record);
}

export function validateAuditHistoryRecord(
  record: AuditHistoryRecord,
): AuditHistoryRecord {
  if (!AUD_ID_RE.test(record.id)) {
    throw Error("Invalid audit history record id");
  }
  assertClosed(record.action, PCRM_AUDIT_ACTIONS, "action");
  assertHonesty(record.honesty);
  assertActor(record.performedBy, "performedBy");
  return record;
}

export function draftPatientContextualisedResearchBundle(input: {
  id: string;
  displayName: string;
  researchSpec: PatientContextualisedResearchSpec;
  bundleVersion: string;
  limitations: readonly string[];
  authorisedLongitudinalInputs?: readonly AuthorisedLongitudinalInput[];
  versionedObservationSets?: readonly VersionedObservationSet[];
  diseaseStateEstimations?: readonly DiseaseStateEstimation[];
  modelApplicabilityChecks?: readonly ModelApplicabilityCheck[];
  missingInformationAssessments?: readonly MissingInformationAssessment[];
  uncertaintyEstimations?: readonly UncertaintyEstimation[];
  researchOnlyInterpretations?: readonly ResearchOnlyInterpretation[];
  auditHistoryRecords?: readonly AuditHistoryRecord[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcrmActorKind;
  createdAt: string;
  note?: string;
}): PatientContextualisedResearchBundle {
  const spec = validatePatientContextualisedResearchSpec(input.researchSpec);
  if (!BND_ID_RE.test(input.id)) throw Error("Invalid research bundle id");
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(input.bundleVersion)) {
    throw Error("Invalid bundleVersion");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const authorisedLongitudinalInputs = (
    input.authorisedLongitudinalInputs ?? []
  ).map(validateAuthorisedLongitudinalInput);
  const versionedObservationSets = (input.versionedObservationSets ?? []).map(
    validateVersionedObservationSet,
  );
  const diseaseStateEstimations = (input.diseaseStateEstimations ?? []).map(
    validateDiseaseStateEstimation,
  );
  const modelApplicabilityChecks = (input.modelApplicabilityChecks ?? []).map(
    validateModelApplicabilityCheck,
  );
  const missingInformationAssessments = (
    input.missingInformationAssessments ?? []
  ).map(validateMissingInformationAssessment);
  const uncertaintyEstimations = (input.uncertaintyEstimations ?? []).map(
    validateUncertaintyEstimation,
  );
  const researchOnlyInterpretations = (
    input.researchOnlyInterpretations ?? []
  ).map(validateResearchOnlyInterpretation);
  const auditHistoryRecords = (input.auditHistoryRecords ?? []).map(
    validateAuditHistoryRecord,
  );

  for (const item of [
    ...authorisedLongitudinalInputs,
    ...versionedObservationSets,
    ...diseaseStateEstimations,
    ...modelApplicabilityChecks,
    ...missingInformationAssessments,
    ...uncertaintyEstimations,
    ...researchOnlyInterpretations,
    ...auditHistoryRecords,
  ]) {
    if (item.researchSpecId !== spec.id) {
      throw Error("Bundle child records must match research spec");
    }
  }

  const outOfScopeApplicabilityIds = modelApplicabilityChecks
    .filter((c) => c.outOfScope)
    .map((c) => c.id);

  const record: PatientContextualisedResearchBundle = {
    schema: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
    method: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
    version: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    diseaseContextId: spec.diseaseContextId,
    researchSpecId: spec.id,
    digitalPatientModelId: spec.digitalPatientModelId,
    authorisedLongitudinalInputIds: authorisedLongitudinalInputs.map(
      (r) => r.id,
    ),
    versionedObservationSetIds: versionedObservationSets.map((r) => r.id),
    diseaseStateEstimationIds: diseaseStateEstimations.map((r) => r.id),
    modelApplicabilityCheckIds: modelApplicabilityChecks.map((r) => r.id),
    missingInformationAssessmentIds: missingInformationAssessments.map(
      (r) => r.id,
    ),
    uncertaintyEstimationIds: uncertaintyEstimations.map((r) => r.id),
    researchOnlyInterpretationIds: researchOnlyInterpretations.map(
      (r) => r.id,
    ),
    auditHistoryRecordIds: auditHistoryRecords.map((r) => r.id),
    outOfScopeApplicabilityIds,
    bundleVersion: input.bundleVersion,
    limitations: assertLimitations(input.limitations),
    datasetAvailability: spec.datasetAvailability,
    completeBiologicalReplicaClaimed: false,
    liveMultiscaleEngineOperational: false,
    notDigitalTwinProduct: true,
    notTreatmentRecommendation: true,
    notClinicalCareWithoutSeparateValidation: true,
    graphPromotable: false,
    lifecycle: spec.lifecycle,
    reviewedBy: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: spec.dataBasis,
    fixtureHonesty: spec.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validatePatientContextualisedResearchBundle(record);
}

export function validatePatientContextualisedResearchBundle(
  record: PatientContextualisedResearchBundle,
): PatientContextualisedResearchBundle {
  if (!BND_ID_RE.test(record.id)) throw Error("Invalid research bundle id");
  if (!SPEC_ID_RE.test(record.researchSpecId)) {
    throw Error("Invalid researchSpecId");
  }
  if (!HDI_DPM_RE.test(record.digitalPatientModelId)) {
    throw Error("Invalid digitalPatientModelId");
  }
  if (record.completeBiologicalReplicaClaimed !== false) {
    throw Error("Complete biological replica claim forbidden");
  }
  if (record.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine must stay false");
  }
  if (record.notDigitalTwinProduct !== true) {
    throw Error("Must declare not a digital twin product");
  }
  if (record.notTreatmentRecommendation !== true) {
    throw Error("Must declare not a treatment recommendation");
  }
  if (record.notClinicalCareWithoutSeparateValidation !== true) {
    throw Error(
      "Must declare not clinical care without separate validation",
    );
  }
  if (record.graphPromotable !== false) {
    throw Error("Graph promotion forbidden");
  }
  assertClosed(record.lifecycle, PCRM_LIFECYCLES, "lifecycle");
  assertClosed(
    record.datasetAvailability,
    PCRM_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  assertClosed(record.dataBasis, PCRM_DATA_BASES, "dataBasis");
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  return record;
}

export function transitionPatientContextualisedResearchBundle(input: {
  bundle: PatientContextualisedResearchBundle;
  to: PcrmLifecycle;
  updatedAt: string;
  actor: PcrmActor;
}): PatientContextualisedResearchBundle {
  const current = validatePatientContextualisedResearchBundle(input.bundle);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = BUNDLE_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal lifecycle transition ${current.lifecycle} -> ${input.to}`,
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset"
  ) {
    throw Error("Cannot accept while dataset blocked");
  }
  if (input.to === "accepted_with_limitations" && actor.actorKind !== "human") {
    throw Error("Human review required for acceptance");
  }
  return validatePatientContextualisedResearchBundle({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" ||
      input.to === "rejected" ||
      input.to === "out_of_scope_outside_validated_domain"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryPatientContextualisedResearchModelsStore(): PatientContextualisedResearchModelsStore & {
  specs: Map<string, PatientContextualisedResearchSpec>;
  authorisedInputs: Map<string, AuthorisedLongitudinalInput>;
  observationSets: Map<string, VersionedObservationSet>;
  estimations: Map<string, DiseaseStateEstimation>;
  applicabilityChecks: Map<string, ModelApplicabilityCheck>;
  missingAssessments: Map<string, MissingInformationAssessment>;
  uncertainties: Map<string, UncertaintyEstimation>;
  interpretations: Map<string, ResearchOnlyInterpretation>;
  audits: Map<string, AuditHistoryRecord>;
  bundles: Map<string, PatientContextualisedResearchBundle>;
} {
  const specs = new Map<string, PatientContextualisedResearchSpec>();
  const authorisedInputs = new Map<string, AuthorisedLongitudinalInput>();
  const observationSets = new Map<string, VersionedObservationSet>();
  const estimations = new Map<string, DiseaseStateEstimation>();
  const applicabilityChecks = new Map<string, ModelApplicabilityCheck>();
  const missingAssessments = new Map<string, MissingInformationAssessment>();
  const uncertainties = new Map<string, UncertaintyEstimation>();
  const interpretations = new Map<string, ResearchOnlyInterpretation>();
  const audits = new Map<string, AuditHistoryRecord>();
  const bundles = new Map<string, PatientContextualisedResearchBundle>();

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
    authorisedInputs,
    observationSets,
    estimations,
    applicabilityChecks,
    missingAssessments,
    uncertainties,
    interpretations,
    audits,
    bundles,
    upsertSpec(record) {
      const validated = validatePatientContextualisedResearchSpec(record);
      specs.set(validated.id, validated);
      return validated;
    },
    getSpec(id) {
      return specs.get(id) ?? null;
    },
    listSpecs(diseaseContextId) {
      return filterByDisease(specs, diseaseContextId);
    },
    upsertAuthorisedLongitudinalInput(record) {
      const validated = validateAuthorisedLongitudinalInput(record);
      authorisedInputs.set(validated.id, validated);
      return validated;
    },
    getAuthorisedLongitudinalInput(id) {
      return authorisedInputs.get(id) ?? null;
    },
    listAuthorisedLongitudinalInputs(diseaseContextId) {
      return filterByDisease(authorisedInputs, diseaseContextId);
    },
    upsertVersionedObservationSet(record) {
      const validated = validateVersionedObservationSet(record);
      observationSets.set(validated.id, validated);
      return validated;
    },
    getVersionedObservationSet(id) {
      return observationSets.get(id) ?? null;
    },
    listVersionedObservationSets(diseaseContextId) {
      return filterByDisease(observationSets, diseaseContextId);
    },
    upsertDiseaseStateEstimation(record) {
      const validated = validateDiseaseStateEstimation(record);
      estimations.set(validated.id, validated);
      return validated;
    },
    getDiseaseStateEstimation(id) {
      return estimations.get(id) ?? null;
    },
    listDiseaseStateEstimations(diseaseContextId) {
      return filterByDisease(estimations, diseaseContextId);
    },
    upsertModelApplicabilityCheck(record) {
      const validated = validateModelApplicabilityCheck(record);
      applicabilityChecks.set(validated.id, validated);
      return validated;
    },
    getModelApplicabilityCheck(id) {
      return applicabilityChecks.get(id) ?? null;
    },
    listModelApplicabilityChecks(diseaseContextId) {
      return filterByDisease(applicabilityChecks, diseaseContextId);
    },
    upsertMissingInformationAssessment(record) {
      const validated = validateMissingInformationAssessment(record);
      missingAssessments.set(validated.id, validated);
      return validated;
    },
    getMissingInformationAssessment(id) {
      return missingAssessments.get(id) ?? null;
    },
    listMissingInformationAssessments(diseaseContextId) {
      return filterByDisease(missingAssessments, diseaseContextId);
    },
    upsertUncertaintyEstimation(record) {
      const validated = validateUncertaintyEstimation(record);
      uncertainties.set(validated.id, validated);
      return validated;
    },
    getUncertaintyEstimation(id) {
      return uncertainties.get(id) ?? null;
    },
    listUncertaintyEstimations(diseaseContextId) {
      return filterByDisease(uncertainties, diseaseContextId);
    },
    upsertResearchOnlyInterpretation(record) {
      const validated = validateResearchOnlyInterpretation(record);
      interpretations.set(validated.id, validated);
      return validated;
    },
    getResearchOnlyInterpretation(id) {
      return interpretations.get(id) ?? null;
    },
    listResearchOnlyInterpretations(diseaseContextId) {
      return filterByDisease(interpretations, diseaseContextId);
    },
    upsertAuditHistoryRecord(record) {
      const validated = validateAuditHistoryRecord(record);
      audits.set(validated.id, validated);
      return validated;
    },
    getAuditHistoryRecord(id) {
      return audits.get(id) ?? null;
    },
    listAuditHistoryRecords(diseaseContextId) {
      return filterByDisease(audits, diseaseContextId);
    },
    upsertBundle(record) {
      const validated = validatePatientContextualisedResearchBundle(record);
      bundles.set(validated.id, validated);
      return validated;
    },
    getBundle(id) {
      return bundles.get(id) ?? null;
    },
    listBundles(diseaseContextId) {
      return filterByDisease(bundles, diseaseContextId);
    },
  };
}

export function projectPatientContextualisedResearchModelsPersistenceLines(input: {
  specs: readonly PatientContextualisedResearchSpec[];
  authorisedLongitudinalInputs?: readonly AuthorisedLongitudinalInput[];
  versionedObservationSets?: readonly VersionedObservationSet[];
  diseaseStateEstimations?: readonly DiseaseStateEstimation[];
  modelApplicabilityChecks?: readonly ModelApplicabilityCheck[];
  missingInformationAssessments?: readonly MissingInformationAssessment[];
  uncertaintyEstimations?: readonly UncertaintyEstimation[];
  researchOnlyInterpretations?: readonly ResearchOnlyInterpretation[];
  auditHistoryRecords?: readonly AuditHistoryRecord[];
  bundles?: readonly PatientContextualisedResearchBundle[];
}): string[] {
  for (const s of input.specs) validatePatientContextualisedResearchSpec(s);
  for (const r of input.authorisedLongitudinalInputs ?? []) {
    validateAuthorisedLongitudinalInput(r);
  }
  for (const r of input.versionedObservationSets ?? []) {
    validateVersionedObservationSet(r);
  }
  for (const r of input.diseaseStateEstimations ?? []) {
    validateDiseaseStateEstimation(r);
  }
  for (const r of input.modelApplicabilityChecks ?? []) {
    validateModelApplicabilityCheck(r);
  }
  for (const r of input.missingInformationAssessments ?? []) {
    validateMissingInformationAssessment(r);
  }
  for (const r of input.uncertaintyEstimations ?? []) {
    validateUncertaintyEstimation(r);
  }
  for (const r of input.researchOnlyInterpretations ?? []) {
    validateResearchOnlyInterpretation(r);
  }
  for (const r of input.auditHistoryRecords ?? []) {
    validateAuditHistoryRecord(r);
  }
  for (const r of input.bundles ?? []) {
    validatePatientContextualisedResearchBundle(r);
  }

  const outOfScopeCount = (input.modelApplicabilityChecks ?? []).filter((c) =>
    isOutOfScopeApplicability(c.applicabilityOutcome),
  ).length;

  return [
    `schema=${PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA}`,
    `method=${PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD}`,
    `version=${PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION}`,
    `specs=${input.specs.length}`,
    `authorisedLongitudinalInputs=${(input.authorisedLongitudinalInputs ?? []).length}`,
    `versionedObservationSets=${(input.versionedObservationSets ?? []).length}`,
    `diseaseStateEstimations=${(input.diseaseStateEstimations ?? []).length}`,
    `modelApplicabilityChecks=${(input.modelApplicabilityChecks ?? []).length}`,
    `missingInformationAssessments=${(input.missingInformationAssessments ?? []).length}`,
    `uncertaintyEstimations=${(input.uncertaintyEstimations ?? []).length}`,
    `researchOnlyInterpretations=${(input.researchOnlyInterpretations ?? []).length}`,
    `auditHistoryRecords=${(input.auditHistoryRecords ?? []).length}`,
    `bundles=${(input.bundles ?? []).length}`,
    `outOfScopeApplicabilityChecks=${outOfScopeCount}`,
    `capabilityKindCount=${PCRM_CAPABILITY_KINDS.length}`,
    `notCompleteBiologicalReplica=true`,
    `notDigitalTwinProduct=true`,
    `notTreatmentRecommendation=true`,
    `notClinicalCareWithoutSeparateValidation=true`,
    `outOfScopeOutsideValidatedDomain=true`,
    `populationAssociationIsNotIndividualTruth=true`,
    `observedIsNotInferred=true`,
    `noPhiIngestion=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintPatientContextualisedResearchBundle(
  bundle: PatientContextualisedResearchBundle,
): string {
  const validated = validatePatientContextualisedResearchBundle(bundle);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildPatientContextualisedResearchModelsPack(input: {
  specs: readonly PatientContextualisedResearchSpec[];
  authorisedLongitudinalInputs: readonly AuthorisedLongitudinalInput[];
  versionedObservationSets: readonly VersionedObservationSet[];
  diseaseStateEstimations: readonly DiseaseStateEstimation[];
  modelApplicabilityChecks: readonly ModelApplicabilityCheck[];
  missingInformationAssessments: readonly MissingInformationAssessment[];
  uncertaintyEstimations: readonly UncertaintyEstimation[];
  researchOnlyInterpretations: readonly ResearchOnlyInterpretation[];
  auditHistoryRecords: readonly AuditHistoryRecord[];
  bundles: readonly PatientContextualisedResearchBundle[];
  asOf: string;
}): {
  schema: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA;
  method: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD;
  version: typeof PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION;
  asOf: string;
  capabilityKindCount: number;
  specCount: number;
  authorisedLongitudinalInputCount: number;
  versionedObservationSetCount: number;
  diseaseStateEstimationCount: number;
  modelApplicabilityCheckCount: number;
  missingInformationAssessmentCount: number;
  uncertaintyEstimationCount: number;
  researchOnlyInterpretationCount: number;
  auditHistoryRecordCount: number;
  bundleCount: number;
  outOfScopeApplicabilityCount: number;
  honesty: PatientContextualisedResearchModelsHonesty;
  specs: readonly PatientContextualisedResearchSpec[];
  authorisedLongitudinalInputs: readonly AuthorisedLongitudinalInput[];
  versionedObservationSets: readonly VersionedObservationSet[];
  diseaseStateEstimations: readonly DiseaseStateEstimation[];
  modelApplicabilityChecks: readonly ModelApplicabilityCheck[];
  missingInformationAssessments: readonly MissingInformationAssessment[];
  uncertaintyEstimations: readonly UncertaintyEstimation[];
  researchOnlyInterpretations: readonly ResearchOnlyInterpretation[];
  auditHistoryRecords: readonly AuditHistoryRecord[];
  bundles: readonly PatientContextualisedResearchBundle[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const specs = input.specs.map(validatePatientContextualisedResearchSpec);
  const authorisedLongitudinalInputs = input.authorisedLongitudinalInputs.map(
    validateAuthorisedLongitudinalInput,
  );
  const versionedObservationSets = input.versionedObservationSets.map(
    validateVersionedObservationSet,
  );
  const diseaseStateEstimations = input.diseaseStateEstimations.map(
    validateDiseaseStateEstimation,
  );
  const modelApplicabilityChecks = input.modelApplicabilityChecks.map(
    validateModelApplicabilityCheck,
  );
  const missingInformationAssessments = input.missingInformationAssessments.map(
    validateMissingInformationAssessment,
  );
  const uncertaintyEstimations = input.uncertaintyEstimations.map(
    validateUncertaintyEstimation,
  );
  const researchOnlyInterpretations = input.researchOnlyInterpretations.map(
    validateResearchOnlyInterpretation,
  );
  const auditHistoryRecords = input.auditHistoryRecords.map(
    validateAuditHistoryRecord,
  );
  const bundles = input.bundles.map(
    validatePatientContextualisedResearchBundle,
  );
  const outOfScopeApplicabilityCount = modelApplicabilityChecks.filter((c) =>
    isOutOfScopeApplicability(c.applicabilityOutcome),
  ).length;

  return {
    schema: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
    method: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
    version: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
    asOf: input.asOf,
    capabilityKindCount: PCRM_CAPABILITY_KINDS.length,
    specCount: specs.length,
    authorisedLongitudinalInputCount: authorisedLongitudinalInputs.length,
    versionedObservationSetCount: versionedObservationSets.length,
    diseaseStateEstimationCount: diseaseStateEstimations.length,
    modelApplicabilityCheckCount: modelApplicabilityChecks.length,
    missingInformationAssessmentCount: missingInformationAssessments.length,
    uncertaintyEstimationCount: uncertaintyEstimations.length,
    researchOnlyInterpretationCount: researchOnlyInterpretations.length,
    auditHistoryRecordCount: auditHistoryRecords.length,
    bundleCount: bundles.length,
    outOfScopeApplicabilityCount,
    honesty: {...DEFAULT_HONESTY},
    specs,
    authorisedLongitudinalInputs,
    versionedObservationSets,
    diseaseStateEstimations,
    modelApplicabilityChecks,
    missingInformationAssessments,
    uncertaintyEstimations,
    researchOnlyInterpretations,
    auditHistoryRecords,
    bundles,
  };
}
