/**
 * Milestone 15 / PR5 — Population and Cohort Disease Models.
 *
 * Extends M15 HDI / CBC / LDSM / CSOL (+ M14 RWE / cohort) with research
 * envelopes for the first validated modelling tier:
 * - Longitudinal outcome prediction (research)
 * - Disease trajectory clustering (exploratory unless validated)
 * - Disease progression risk research
 * - Phenotype stratification
 * - Organ-specific outcome modelling
 * - Biomarker association analysis
 *
 * Methodology fields (required on each modelling envelope):
 * cohort definition, index date, outcome horizon, predictor availability,
 * train/validation separation, missing-data handling, confounder assessment,
 * calibration, discrimination where relevant, external validation where
 * feasible, subgroup performance.
 *
 * Binding safeguards (fail-closed):
 * - Prediction ≠ causal explanation.
 * - Unsupervised clusters ≠ validated disease subtypes.
 * - Predictive accuracy alone ≠ clinical usefulness.
 *
 * Binding honesty:
 * - Research decision support only; fixtures until authorised.
 * - Aggregate honesty; small-cell disclosure; no individual collapse.
 * - No PHI/CDS, twin product, Gate C / MoU, workbench UI, Neon migration.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const POPULATION_COHORT_DISEASE_MODELS_SCHEMA =
  "hsi-population-cohort-disease-models-1" as const;
export const POPULATION_COHORT_DISEASE_MODELS_METHOD =
  "hsi.population_cohort_disease_models.v1" as const;
export const POPULATION_COHORT_DISEASE_MODELS_VERSION = "0.1.0" as const;

export const PCDM_MODELLING_KINDS = [
  "longitudinal_outcome_prediction",
  "disease_trajectory_clustering",
  "disease_progression_risk",
  "phenotype_stratification",
  "organ_specific_outcome_modelling",
  "biomarker_association_analysis",
] as const;
export type PcdmModellingKind = (typeof PCDM_MODELLING_KINDS)[number];

export const PCDM_INDEX_DATE_KINDS = [
  "first_qualifying_diagnosis",
  "treatment_initiation",
  "cohort_entry_declared",
  "study_start_declared",
  "other_declared",
] as const;
export type PcdmIndexDateKind = (typeof PCDM_INDEX_DATE_KINDS)[number];

export const PCDM_OUTCOME_HORIZON_UNITS = [
  "days",
  "weeks",
  "months",
  "years",
] as const;
export type PcdmOutcomeHorizonUnit =
  (typeof PCDM_OUTCOME_HORIZON_UNITS)[number];

export const PCDM_PREDICTOR_AVAILABILITY = [
  "declared_available_at_index",
  "partial_missingness_declared",
  "insufficient_declared",
  "not_assessed",
] as const;
export type PcdmPredictorAvailability =
  (typeof PCDM_PREDICTOR_AVAILABILITY)[number];

export const PCDM_TRAIN_VALIDATION_SEPARATIONS = [
  "holdout_declared",
  "cross_validation_declared",
  "temporal_split_declared",
  "external_holdout_declared",
  "not_separated_declared",
  "not_applicable_exploratory",
] as const;
export type PcdmTrainValidationSeparation =
  (typeof PCDM_TRAIN_VALIDATION_SEPARATIONS)[number];

export const PCDM_MISSING_DATA_HANDLINGS = [
  "declared_missing",
  "complete_case_declared",
  "imputation_declared_with_limitations",
  "imputation_not_performed",
  "explicitly_unresolved",
  "not_assessed",
] as const;
export type PcdmMissingDataHandling =
  (typeof PCDM_MISSING_DATA_HANDLINGS)[number];

export const PCDM_CONFOUNDER_ASSESSMENTS = [
  "assessed_declared",
  "partial_declared",
  "not_assessed",
  "not_applicable_prediction_only",
  "insufficient",
] as const;
export type PcdmConfounderAssessment =
  (typeof PCDM_CONFOUNDER_ASSESSMENTS)[number];

export const PCDM_CALIBRATION_STATUSES = [
  "assessed_declared",
  "not_assessed",
  "not_applicable",
  "insufficient",
] as const;
export type PcdmCalibrationStatus = (typeof PCDM_CALIBRATION_STATUSES)[number];

export const PCDM_DISCRIMINATION_STATUSES = [
  "assessed_declared",
  "not_assessed",
  "not_applicable",
  "insufficient",
] as const;
export type PcdmDiscriminationStatus =
  (typeof PCDM_DISCRIMINATION_STATUSES)[number];

export const PCDM_EXTERNAL_VALIDATION_STATUSES = [
  "performed_declared",
  "feasible_not_performed",
  "not_feasible_declared",
  "not_assessed",
  "not_applicable_exploratory",
] as const;
export type PcdmExternalValidationStatus =
  (typeof PCDM_EXTERNAL_VALIDATION_STATUSES)[number];

export const PCDM_SUBGROUP_PERFORMANCE_STATUSES = [
  "assessed_declared",
  "partial_declared",
  "not_assessed",
  "suppressed_small_cell",
  "not_applicable",
] as const;
export type PcdmSubgroupPerformanceStatus =
  (typeof PCDM_SUBGROUP_PERFORMANCE_STATUSES)[number];

export const PCDM_CLUSTER_VALIDATION_STATUSES = [
  "exploratory_unsupervised",
  "exploratory_supervised_declared",
  "validated_subtype_declared",
  "blocked_insufficient",
] as const;
export type PcdmClusterValidationStatus =
  (typeof PCDM_CLUSTER_VALIDATION_STATUSES)[number];

export const PCDM_ASSOCIATION_KINDS = [
  "association_only",
  "prediction_association",
  "exploratory_correlation",
] as const;
export type PcdmAssociationKind = (typeof PCDM_ASSOCIATION_KINDS)[number];

export const PCDM_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_prediction_causation_collapse",
  "blocked_unvalidated_subtype_claim",
  "blocked_awaiting_authorised_dataset",
  "rejected",
  "superseded",
] as const;
export type PcdmLifecycle = (typeof PCDM_LIFECYCLES)[number];

export const PCDM_DATASET_AVAILABILITY = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type PcdmDatasetAvailability =
  (typeof PCDM_DATASET_AVAILABILITY)[number];

export const PCDM_ACCESS_CLASSIFICATIONS = [
  "fixture_engineering",
  "authorised_pseudonymous_research",
  "authorised_aggregate_only",
  "restricted_not_ingested",
] as const;
export type PcdmAccessClassification =
  (typeof PCDM_ACCESS_CLASSIFICATIONS)[number];

export const PCDM_ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type PcdmActorKind = (typeof PCDM_ACTOR_KINDS)[number];

export const PCDM_DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type PcdmDataBasis = (typeof PCDM_DATA_BASES)[number];

export const PCDM_DISCLOSURE_STATUSES = [
  "released_aggregate",
  "suppressed_small_cell",
  "suppressed_sensitive_subgroup",
  "blocked_identifiable_request",
  "not_assessed",
] as const;
export type PcdmDisclosureStatus = (typeof PCDM_DISCLOSURE_STATUSES)[number];

const SPEC_ID_RE = /^hsi-pcdm-spec-[a-z0-9-]{3,80}$/;
const METH_ID_RE = /^hsi-pcdm-meth-[a-z0-9-]{3,80}$/;
const PRED_ID_RE = /^hsi-pcdm-pred-[a-z0-9-]{3,80}$/;
const CLU_ID_RE = /^hsi-pcdm-clu-[a-z0-9-]{3,80}$/;
const RISK_ID_RE = /^hsi-pcdm-risk-[a-z0-9-]{3,80}$/;
const PHENO_ID_RE = /^hsi-pcdm-pheno-[a-z0-9-]{3,80}$/;
const ORGAN_ID_RE = /^hsi-pcdm-organ-[a-z0-9-]{3,80}$/;
const BIO_ID_RE = /^hsi-pcdm-bio-[a-z0-9-]{3,80}$/;
const BND_ID_RE = /^hsi-pcdm-bnd-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const HDI_CTX_RE = /^hsi-hdi-ctx-[a-z0-9-]{3,80}$/;
const CBC_IDC_RE = /^hsi-cbc-idc-[a-z0-9-]{3,80}$/;
const LDSM_SPEC_RE = /^hsi-ldsm-spec-[a-z0-9-]{3,80}$/;
const CSOL_SPEC_RE = /^hsi-csol-spec-[a-z0-9-]{3,80}$/;
const RCB_COH_RE = /^hsi-rcb-coh-[a-z0-9-]{3,80}$/;
const RWE_STUDY_RE = /^hsi-rwe-study-[a-z0-9-]{3,80}$/;
const RWE_OUT_RE = /^hsi-rwe-out-[a-z0-9-]{3,80}$/;

export type PopulationCohortDiseaseModelsHonesty = {
  researchDecisionSupportOnly: true;
  predictionIsNotCausation: true;
  unsupervisedClustersAreNotValidatedSubtypes: true;
  predictiveAccuracyIsNotClinicalUsefulness: true;
  aggregateHonestyRequired: true;
  smallCellDisclosureRequired: true;
  noIndividualCollapse: true;
  noPhiIngestion: true;
  noLiveTwinOrMultiscaleClaim: true;
  noAutonomousDiagnosisOrPrescribing: true;
  noWorkbenchUi: true;
  notClinicalCare: true;
  notDigitalTwinProduct: true;
  agentsDraftHumansReview: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
};

export type PcdmActor = {
  principalId: string;
  actorKind: PcdmActorKind;
};

export type PcdmOutcomeHorizon = {
  value: number;
  unit: PcdmOutcomeHorizonUnit;
  note: string;
};

/**
 * Shared methodology declaration required for every modelling envelope.
 */
export type ModellingMethodologyDeclaration = {
  schema: typeof POPULATION_COHORT_DISEASE_MODELS_SCHEMA;
  method: typeof POPULATION_COHORT_DISEASE_MODELS_METHOD;
  version: typeof POPULATION_COHORT_DISEASE_MODELS_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  cohortDefinitionId: string;
  indexDateKind: PcdmIndexDateKind;
  indexDateDeclaration: string;
  outcomeHorizon: PcdmOutcomeHorizon;
  predictorAvailability: PcdmPredictorAvailability;
  trainValidationSeparation: PcdmTrainValidationSeparation;
  missingDataHandling: PcdmMissingDataHandling;
  confounderAssessment: PcdmConfounderAssessment;
  calibrationStatus: PcdmCalibrationStatus;
  discriminationStatus: PcdmDiscriminationStatus;
  externalValidationStatus: PcdmExternalValidationStatus;
  subgroupPerformanceStatus: PcdmSubgroupPerformanceStatus;
  methodologySummary: string;
  authoredBy: PcdmActor;
  honesty: PopulationCohortDiseaseModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PopulationCohortModellingSpec = {
  schema: typeof POPULATION_COHORT_DISEASE_MODELS_SCHEMA;
  method: typeof POPULATION_COHORT_DISEASE_MODELS_METHOD;
  version: typeof POPULATION_COHORT_DISEASE_MODELS_VERSION;
  id: string;
  displayName: string;
  scientificQuestion: string;
  modellingKinds: readonly PcdmModellingKind[];
  diseaseContextId: string;
  integratedDiseaseContextId: string | null;
  longitudinalModellingSpecId: string | null;
  crossScaleOntologySpecId: string | null;
  cohortDefinitionId: string;
  rweStudyId: string | null;
  datasetAvailability: PcdmDatasetAvailability;
  accessClassification: PcdmAccessClassification;
  containsIdentifiablePhi: false;
  liveMultiscaleEngineOperational: false;
  notDigitalTwinProduct: true;
  predictionIsNotCausation: true;
  unsupervisedClustersAreNotValidatedSubtypes: true;
  predictiveAccuracyIsNotClinicalUsefulness: true;
  lifecycle: PcdmLifecycle;
  reviewedBy: PcdmActor | null;
  authoredBy: PcdmActor;
  dataBasis: PcdmDataBasis;
  fixtureHonesty: boolean;
  honesty: PopulationCohortDiseaseModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type LongitudinalOutcomePrediction = {
  schema: typeof POPULATION_COHORT_DISEASE_MODELS_SCHEMA;
  method: typeof POPULATION_COHORT_DISEASE_MODELS_METHOD;
  version: typeof POPULATION_COHORT_DISEASE_MODELS_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  methodologyId: string;
  outcomeRef: string | null;
  predictionSummary: string;
  causalExplanationClaimed: false;
  clinicalUsefulnessClaimed: false;
  disclosureStatus: PcdmDisclosureStatus;
  limitations: readonly string[];
  authoredBy: PcdmActor;
  honesty: PopulationCohortDiseaseModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DiseaseTrajectoryClustering = {
  schema: typeof POPULATION_COHORT_DISEASE_MODELS_SCHEMA;
  method: typeof POPULATION_COHORT_DISEASE_MODELS_METHOD;
  version: typeof POPULATION_COHORT_DISEASE_MODELS_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  methodologyId: string;
  clusterValidationStatus: PcdmClusterValidationStatus;
  clusterCountDeclared: number | null;
  clusteringSummary: string;
  validatedSubtypeClaimed: boolean;
  clinicalUsefulnessClaimed: false;
  disclosureStatus: PcdmDisclosureStatus;
  limitations: readonly string[];
  authoredBy: PcdmActor;
  honesty: PopulationCohortDiseaseModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DiseaseProgressionRisk = {
  schema: typeof POPULATION_COHORT_DISEASE_MODELS_SCHEMA;
  method: typeof POPULATION_COHORT_DISEASE_MODELS_METHOD;
  version: typeof POPULATION_COHORT_DISEASE_MODELS_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  methodologyId: string;
  riskSummary: string;
  causalExplanationClaimed: false;
  clinicalUsefulnessClaimed: false;
  disclosureStatus: PcdmDisclosureStatus;
  limitations: readonly string[];
  authoredBy: PcdmActor;
  honesty: PopulationCohortDiseaseModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PhenotypeStratification = {
  schema: typeof POPULATION_COHORT_DISEASE_MODELS_SCHEMA;
  method: typeof POPULATION_COHORT_DISEASE_MODELS_METHOD;
  version: typeof POPULATION_COHORT_DISEASE_MODELS_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  methodologyId: string;
  stratificationSummary: string;
  stratumCountDeclared: number | null;
  validatedSubtypeClaimed: false;
  clinicalUsefulnessClaimed: false;
  disclosureStatus: PcdmDisclosureStatus;
  limitations: readonly string[];
  authoredBy: PcdmActor;
  honesty: PopulationCohortDiseaseModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type OrganSpecificOutcomeModelling = {
  schema: typeof POPULATION_COHORT_DISEASE_MODELS_SCHEMA;
  method: typeof POPULATION_COHORT_DISEASE_MODELS_METHOD;
  version: typeof POPULATION_COHORT_DISEASE_MODELS_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  methodologyId: string;
  organOrSystemLabel: string;
  outcomeSummary: string;
  causalExplanationClaimed: false;
  clinicalUsefulnessClaimed: false;
  disclosureStatus: PcdmDisclosureStatus;
  limitations: readonly string[];
  authoredBy: PcdmActor;
  honesty: PopulationCohortDiseaseModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type BiomarkerAssociationAnalysis = {
  schema: typeof POPULATION_COHORT_DISEASE_MODELS_SCHEMA;
  method: typeof POPULATION_COHORT_DISEASE_MODELS_METHOD;
  version: typeof POPULATION_COHORT_DISEASE_MODELS_VERSION;
  id: string;
  modellingSpecId: string;
  diseaseContextId: string;
  methodologyId: string;
  biomarkerLabel: string;
  associationKind: PcdmAssociationKind;
  associationSummary: string;
  causalExplanationClaimed: false;
  clinicalUsefulnessClaimed: false;
  disclosureStatus: PcdmDisclosureStatus;
  limitations: readonly string[];
  authoredBy: PcdmActor;
  honesty: PopulationCohortDiseaseModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PopulationCohortModellingBundle = {
  schema: typeof POPULATION_COHORT_DISEASE_MODELS_SCHEMA;
  method: typeof POPULATION_COHORT_DISEASE_MODELS_METHOD;
  version: typeof POPULATION_COHORT_DISEASE_MODELS_VERSION;
  id: string;
  displayName: string;
  diseaseContextId: string;
  modellingSpecId: string;
  methodologyIds: readonly string[];
  longitudinalOutcomePredictionIds: readonly string[];
  diseaseTrajectoryClusteringIds: readonly string[];
  diseaseProgressionRiskIds: readonly string[];
  phenotypeStratificationIds: readonly string[];
  organSpecificOutcomeModellingIds: readonly string[];
  biomarkerAssociationAnalysisIds: readonly string[];
  exploratoryClusterIds: readonly string[];
  bundleVersion: string;
  limitations: readonly string[];
  datasetAvailability: PcdmDatasetAvailability;
  predictionIsNotCausation: true;
  unsupervisedClustersAreNotValidatedSubtypes: true;
  predictiveAccuracyIsNotClinicalUsefulness: true;
  liveMultiscaleEngineOperational: false;
  notDigitalTwinProduct: true;
  graphPromotable: false;
  lifecycle: PcdmLifecycle;
  reviewedBy: PcdmActor | null;
  authoredBy: PcdmActor;
  dataBasis: PcdmDataBasis;
  fixtureHonesty: boolean;
  honesty: PopulationCohortDiseaseModelsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PopulationCohortDiseaseModelsStore = {
  upsertSpec(
    record: PopulationCohortModellingSpec,
  ): PopulationCohortModellingSpec;
  getSpec(id: string): PopulationCohortModellingSpec | null;
  listSpecs(
    diseaseContextId?: string,
  ): readonly PopulationCohortModellingSpec[];
  upsertMethodology(
    record: ModellingMethodologyDeclaration,
  ): ModellingMethodologyDeclaration;
  getMethodology(id: string): ModellingMethodologyDeclaration | null;
  listMethodologies(
    diseaseContextId?: string,
  ): readonly ModellingMethodologyDeclaration[];
  upsertLongitudinalOutcomePrediction(
    record: LongitudinalOutcomePrediction,
  ): LongitudinalOutcomePrediction;
  getLongitudinalOutcomePrediction(
    id: string,
  ): LongitudinalOutcomePrediction | null;
  listLongitudinalOutcomePredictions(
    diseaseContextId?: string,
  ): readonly LongitudinalOutcomePrediction[];
  upsertDiseaseTrajectoryClustering(
    record: DiseaseTrajectoryClustering,
  ): DiseaseTrajectoryClustering;
  getDiseaseTrajectoryClustering(
    id: string,
  ): DiseaseTrajectoryClustering | null;
  listDiseaseTrajectoryClusterings(
    diseaseContextId?: string,
  ): readonly DiseaseTrajectoryClustering[];
  upsertDiseaseProgressionRisk(
    record: DiseaseProgressionRisk,
  ): DiseaseProgressionRisk;
  getDiseaseProgressionRisk(id: string): DiseaseProgressionRisk | null;
  listDiseaseProgressionRisks(
    diseaseContextId?: string,
  ): readonly DiseaseProgressionRisk[];
  upsertPhenotypeStratification(
    record: PhenotypeStratification,
  ): PhenotypeStratification;
  getPhenotypeStratification(id: string): PhenotypeStratification | null;
  listPhenotypeStratifications(
    diseaseContextId?: string,
  ): readonly PhenotypeStratification[];
  upsertOrganSpecificOutcomeModelling(
    record: OrganSpecificOutcomeModelling,
  ): OrganSpecificOutcomeModelling;
  getOrganSpecificOutcomeModelling(
    id: string,
  ): OrganSpecificOutcomeModelling | null;
  listOrganSpecificOutcomeModellings(
    diseaseContextId?: string,
  ): readonly OrganSpecificOutcomeModelling[];
  upsertBiomarkerAssociationAnalysis(
    record: BiomarkerAssociationAnalysis,
  ): BiomarkerAssociationAnalysis;
  getBiomarkerAssociationAnalysis(
    id: string,
  ): BiomarkerAssociationAnalysis | null;
  listBiomarkerAssociationAnalyses(
    diseaseContextId?: string,
  ): readonly BiomarkerAssociationAnalysis[];
  upsertBundle(
    record: PopulationCohortModellingBundle,
  ): PopulationCohortModellingBundle;
  getBundle(id: string): PopulationCohortModellingBundle | null;
  listBundles(
    diseaseContextId?: string,
  ): readonly PopulationCohortModellingBundle[];
};

const DEFAULT_HONESTY: PopulationCohortDiseaseModelsHonesty = {
  researchDecisionSupportOnly: true,
  predictionIsNotCausation: true,
  unsupervisedClustersAreNotValidatedSubtypes: true,
  predictiveAccuracyIsNotClinicalUsefulness: true,
  aggregateHonestyRequired: true,
  smallCellDisclosureRequired: true,
  noIndividualCollapse: true,
  noPhiIngestion: true,
  noLiveTwinOrMultiscaleClaim: true,
  noAutonomousDiagnosisOrPrescribing: true,
  noWorkbenchUi: true,
  notClinicalCare: true,
  notDigitalTwinProduct: true,
  agentsDraftHumansReview: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
};

const SPEC_TRANSITIONS: Record<PcdmLifecycle, readonly PcdmLifecycle[]> = {
  draft: [
    "under_review",
    "blocked_prediction_causation_collapse",
    "blocked_unvalidated_subtype_claim",
    "blocked_awaiting_authorised_dataset",
    "rejected",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_prediction_causation_collapse",
    "blocked_unvalidated_subtype_claim",
    "blocked_awaiting_authorised_dataset",
    "rejected",
    "draft",
  ],
  accepted_with_limitations: ["superseded"],
  blocked_prediction_causation_collapse: ["draft", "rejected"],
  blocked_unvalidated_subtype_claim: ["draft", "rejected"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
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

function assertHonesty(honesty: PopulationCohortDiseaseModelsHonesty): void {
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Research decision support only");
  }
  if (honesty.predictionIsNotCausation !== true) {
    throw Error("Prediction must not be treated as causation");
  }
  if (honesty.unsupervisedClustersAreNotValidatedSubtypes !== true) {
    throw Error("Unsupervised clusters are not validated subtypes");
  }
  if (honesty.predictiveAccuracyIsNotClinicalUsefulness !== true) {
    throw Error("Predictive accuracy is not clinical usefulness");
  }
  if (honesty.aggregateHonestyRequired !== true) {
    throw Error("Aggregate honesty required");
  }
  if (honesty.smallCellDisclosureRequired !== true) {
    throw Error("Small-cell disclosure required");
  }
  if (honesty.noIndividualCollapse !== true) {
    throw Error("Individual collapse forbidden");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noLiveTwinOrMultiscaleClaim !== true) {
    throw Error("Live twin/multiscale claim forbidden");
  }
  if (honesty.noAutonomousDiagnosisOrPrescribing !== true) {
    throw Error("Autonomous diagnosis/prescribing forbidden");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR5");
  }
  if (honesty.notClinicalCare !== true) throw Error("Not clinical care");
  if (honesty.notDigitalTwinProduct !== true) {
    throw Error("Not a digital twin product");
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
    throw Error("Scientific approval must stay false in PR5");
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
      /\b(?:not|no|without|never|does\s+not|do\s+not|must\s+not)\s+(?:a\s+|an\s+|the\s+|establish\s+|claim\s+|confuse\s+.*?with\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+recommendation|treatment\s+directive|causal\s+explanation|validated\s+(?:disease\s+)?subtypes?|clinical\s+usefulness|live\s+(?:twin|multiscale\s+engine)|digital\s+twin\s+product|clinical\s+care)(?:\s+or\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+recommendation|causal\s+explanation|validated\s+(?:disease\s+)?subtypes?|clinical\s+usefulness|live\s+(?:twin|multiscale\s+engine)|digital\s+twin\s+product|clinical\s+care))*/g,
      " ",
    );
  if (
    /\bdiagnos(e|is|ing)\b/.test(lower) ||
    /\bprescribe\b/.test(lower) ||
    /\btreatment\s+recommendation\b/.test(lower) ||
    /\btreatment\s+directive\b/.test(lower) ||
    /\bcausal\s+explanation\b/.test(lower) ||
    /\bvalidated\s+(?:disease\s+)?subtypes?\b/.test(lower) ||
    /\bclinical\s+usefulness\b/.test(lower) ||
    /\blive\s+(?:twin|multiscale\s+engine)\b/.test(lower) ||
    /\bdigital\s+twin\s+product\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower)
  ) {
    throw Error(
      `${label} must not diagnose/prescribe, claim causal explanation, validated subtypes, clinical usefulness, live twin/multiscale, invent counts, or include identifiers`,
    );
  }
}

function assertActor(actor: PcdmActor, label: string): PcdmActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, PCDM_ACTOR_KINDS, `${label} actorKind`);
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

function dataBasisForAvailability(
  availability: PcdmDatasetAvailability,
): PcdmDataBasis {
  if (availability === "authorised_declared") return "declared_research";
  if (availability === "fixture_only") return "fixture_engineering";
  return "fixture_engineering";
}

function assertOutcomeHorizon(
  horizon: PcdmOutcomeHorizon,
): PcdmOutcomeHorizon {
  if (
    !Number.isFinite(horizon.value) ||
    horizon.value <= 0 ||
    horizon.value > 1000
  ) {
    throw Error("Invalid outcomeHorizon.value");
  }
  assertClosed(horizon.unit, PCDM_OUTCOME_HORIZON_UNITS, "outcomeHorizon.unit");
  const note = (horizon.note ?? "").trim();
  if (note.length > 500) throw Error("Invalid outcomeHorizon.note");
  if (note) assertNoForbiddenClaimLanguage(note, "outcomeHorizon.note");
  return {value: horizon.value, unit: horizon.unit, note};
}

export function isExploratoryClusterStatus(
  status: PcdmClusterValidationStatus,
): boolean {
  return (
    status === "exploratory_unsupervised" ||
    status === "exploratory_supervised_declared" ||
    status === "blocked_insufficient"
  );
}

export function draftPopulationCohortModellingSpec(input: {
  id: string;
  displayName: string;
  scientificQuestion: string;
  modellingKinds?: readonly PcdmModellingKind[];
  diseaseContextId: string;
  integratedDiseaseContextId?: string | null;
  longitudinalModellingSpecId?: string | null;
  crossScaleOntologySpecId?: string | null;
  cohortDefinitionId: string;
  rweStudyId?: string | null;
  datasetAvailability: PcdmDatasetAvailability;
  accessClassification?: PcdmAccessClassification;
  authoredByPrincipalId: string;
  authoredByActorKind?: PcdmActorKind;
  createdAt: string;
  note?: string;
}): PopulationCohortModellingSpec {
  if (!SPEC_ID_RE.test(input.id)) throw Error("Invalid modelling spec id");
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
  if (!RCB_COH_RE.test(input.cohortDefinitionId)) {
    throw Error("Invalid cohortDefinitionId");
  }
  assertClosed(
    input.datasetAvailability,
    PCDM_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const modellingKinds =
    input.modellingKinds && input.modellingKinds.length > 0
      ? [...new Set(input.modellingKinds)]
      : [...PCDM_MODELLING_KINDS];
  for (const kind of modellingKinds) {
    assertClosed(kind, PCDM_MODELLING_KINDS, "modellingKind");
  }

  const accessClassification =
    input.accessClassification ??
    (input.datasetAvailability === "authorised_declared"
      ? "authorised_aggregate_only"
      : input.datasetAvailability === "fixture_only"
        ? "fixture_engineering"
        : "restricted_not_ingested");
  assertClosed(
    accessClassification,
    PCDM_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );

  const lifecycle: PcdmLifecycle =
    input.datasetAvailability === "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const record: PopulationCohortModellingSpec = {
    schema: POPULATION_COHORT_DISEASE_MODELS_SCHEMA,
    method: POPULATION_COHORT_DISEASE_MODELS_METHOD,
    version: POPULATION_COHORT_DISEASE_MODELS_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    modellingKinds,
    diseaseContextId: input.diseaseContextId,
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
    cohortDefinitionId: input.cohortDefinitionId,
    rweStudyId: assertOptionalId(input.rweStudyId, RWE_STUDY_RE, "rweStudyId"),
    datasetAvailability: input.datasetAvailability,
    accessClassification,
    containsIdentifiablePhi: false,
    liveMultiscaleEngineOperational: false,
    notDigitalTwinProduct: true,
    predictionIsNotCausation: true,
    unsupervisedClustersAreNotValidatedSubtypes: true,
    predictiveAccuracyIsNotClinicalUsefulness: true,
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
  return validatePopulationCohortModellingSpec(record);
}

export function validatePopulationCohortModellingSpec(
  record: PopulationCohortModellingSpec,
): PopulationCohortModellingSpec {
  if (!SPEC_ID_RE.test(record.id)) throw Error("Invalid modelling spec id");
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (!RCB_COH_RE.test(record.cohortDefinitionId)) {
    throw Error("Invalid cohortDefinitionId");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (record.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine must stay false");
  }
  if (record.notDigitalTwinProduct !== true) {
    throw Error("Must declare not a digital twin product");
  }
  if (record.predictionIsNotCausation !== true) {
    throw Error("Prediction is not causation must stay true");
  }
  if (record.unsupervisedClustersAreNotValidatedSubtypes !== true) {
    throw Error(
      "Unsupervised clusters are not validated subtypes must stay true",
    );
  }
  if (record.predictiveAccuracyIsNotClinicalUsefulness !== true) {
    throw Error(
      "Predictive accuracy is not clinical usefulness must stay true",
    );
  }
  assertClosed(record.lifecycle, PCDM_LIFECYCLES, "lifecycle");
  assertClosed(
    record.datasetAvailability,
    PCDM_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  assertClosed(
    record.accessClassification,
    PCDM_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );
  assertClosed(record.dataBasis, PCDM_DATA_BASES, "dataBasis");
  for (const kind of record.modellingKinds) {
    assertClosed(kind, PCDM_MODELLING_KINDS, "modellingKind");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  return record;
}

export function transitionPopulationCohortModellingSpec(input: {
  spec: PopulationCohortModellingSpec;
  to: PcdmLifecycle;
  updatedAt: string;
  actor: PcdmActor;
}): PopulationCohortModellingSpec {
  const current = validatePopulationCohortModellingSpec(input.spec);
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
  return validatePopulationCohortModellingSpec({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftModellingMethodologyDeclaration(input: {
  id: string;
  modellingSpec: PopulationCohortModellingSpec;
  indexDateKind: PcdmIndexDateKind;
  indexDateDeclaration: string;
  outcomeHorizon: PcdmOutcomeHorizon;
  predictorAvailability: PcdmPredictorAvailability;
  trainValidationSeparation: PcdmTrainValidationSeparation;
  missingDataHandling: PcdmMissingDataHandling;
  confounderAssessment: PcdmConfounderAssessment;
  calibrationStatus: PcdmCalibrationStatus;
  discriminationStatus: PcdmDiscriminationStatus;
  externalValidationStatus: PcdmExternalValidationStatus;
  subgroupPerformanceStatus: PcdmSubgroupPerformanceStatus;
  methodologySummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: PcdmActorKind;
  createdAt: string;
  note?: string;
}): ModellingMethodologyDeclaration {
  if (!METH_ID_RE.test(input.id)) throw Error("Invalid methodology id");
  validatePopulationCohortModellingSpec(input.modellingSpec);
  assertClosed(input.indexDateKind, PCDM_INDEX_DATE_KINDS, "indexDateKind");
  if (!textOk(input.indexDateDeclaration, 500)) {
    throw Error("Invalid indexDateDeclaration");
  }
  assertNoForbiddenClaimLanguage(
    input.indexDateDeclaration,
    "indexDateDeclaration",
  );
  assertClosed(
    input.predictorAvailability,
    PCDM_PREDICTOR_AVAILABILITY,
    "predictorAvailability",
  );
  assertClosed(
    input.trainValidationSeparation,
    PCDM_TRAIN_VALIDATION_SEPARATIONS,
    "trainValidationSeparation",
  );
  assertClosed(
    input.missingDataHandling,
    PCDM_MISSING_DATA_HANDLINGS,
    "missingDataHandling",
  );
  assertClosed(
    input.confounderAssessment,
    PCDM_CONFOUNDER_ASSESSMENTS,
    "confounderAssessment",
  );
  assertClosed(
    input.calibrationStatus,
    PCDM_CALIBRATION_STATUSES,
    "calibrationStatus",
  );
  assertClosed(
    input.discriminationStatus,
    PCDM_DISCRIMINATION_STATUSES,
    "discriminationStatus",
  );
  assertClosed(
    input.externalValidationStatus,
    PCDM_EXTERNAL_VALIDATION_STATUSES,
    "externalValidationStatus",
  );
  assertClosed(
    input.subgroupPerformanceStatus,
    PCDM_SUBGROUP_PERFORMANCE_STATUSES,
    "subgroupPerformanceStatus",
  );
  if (!textOk(input.methodologySummary, 2000)) {
    throw Error("Invalid methodologySummary");
  }
  assertNoForbiddenClaimLanguage(
    input.methodologySummary,
    "methodologySummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: ModellingMethodologyDeclaration = {
    schema: POPULATION_COHORT_DISEASE_MODELS_SCHEMA,
    method: POPULATION_COHORT_DISEASE_MODELS_METHOD,
    version: POPULATION_COHORT_DISEASE_MODELS_VERSION,
    id: input.id,
    modellingSpecId: input.modellingSpec.id,
    diseaseContextId: input.modellingSpec.diseaseContextId,
    cohortDefinitionId: input.modellingSpec.cohortDefinitionId,
    indexDateKind: input.indexDateKind,
    indexDateDeclaration: input.indexDateDeclaration.trim(),
    outcomeHorizon: assertOutcomeHorizon(input.outcomeHorizon),
    predictorAvailability: input.predictorAvailability,
    trainValidationSeparation: input.trainValidationSeparation,
    missingDataHandling: input.missingDataHandling,
    confounderAssessment: input.confounderAssessment,
    calibrationStatus: input.calibrationStatus,
    discriminationStatus: input.discriminationStatus,
    externalValidationStatus: input.externalValidationStatus,
    subgroupPerformanceStatus: input.subgroupPerformanceStatus,
    methodologySummary: input.methodologySummary.trim(),
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
  return validateModellingMethodologyDeclaration(record);
}

export function validateModellingMethodologyDeclaration(
  record: ModellingMethodologyDeclaration,
): ModellingMethodologyDeclaration {
  if (!METH_ID_RE.test(record.id)) throw Error("Invalid methodology id");
  if (!SPEC_ID_RE.test(record.modellingSpecId)) {
    throw Error("Invalid modellingSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (!RCB_COH_RE.test(record.cohortDefinitionId)) {
    throw Error("Invalid cohortDefinitionId");
  }
  assertClosed(record.indexDateKind, PCDM_INDEX_DATE_KINDS, "indexDateKind");
  assertOutcomeHorizon(record.outcomeHorizon);
  assertClosed(
    record.predictorAvailability,
    PCDM_PREDICTOR_AVAILABILITY,
    "predictorAvailability",
  );
  assertClosed(
    record.trainValidationSeparation,
    PCDM_TRAIN_VALIDATION_SEPARATIONS,
    "trainValidationSeparation",
  );
  assertClosed(
    record.missingDataHandling,
    PCDM_MISSING_DATA_HANDLINGS,
    "missingDataHandling",
  );
  assertClosed(
    record.confounderAssessment,
    PCDM_CONFOUNDER_ASSESSMENTS,
    "confounderAssessment",
  );
  assertClosed(
    record.calibrationStatus,
    PCDM_CALIBRATION_STATUSES,
    "calibrationStatus",
  );
  assertClosed(
    record.discriminationStatus,
    PCDM_DISCRIMINATION_STATUSES,
    "discriminationStatus",
  );
  assertClosed(
    record.externalValidationStatus,
    PCDM_EXTERNAL_VALIDATION_STATUSES,
    "externalValidationStatus",
  );
  assertClosed(
    record.subgroupPerformanceStatus,
    PCDM_SUBGROUP_PERFORMANCE_STATUSES,
    "subgroupPerformanceStatus",
  );
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

function assertMethodologyMatchesSpec(input: {
  modellingSpec: PopulationCohortModellingSpec;
  methodology: ModellingMethodologyDeclaration;
}): void {
  validatePopulationCohortModellingSpec(input.modellingSpec);
  validateModellingMethodologyDeclaration(input.methodology);
  if (input.methodology.modellingSpecId !== input.modellingSpec.id) {
    throw Error("methodology.modellingSpecId must match modellingSpec.id");
  }
  if (input.methodology.diseaseContextId !== input.modellingSpec.diseaseContextId) {
    throw Error("methodology.diseaseContextId must match modellingSpec");
  }
  if (
    input.methodology.cohortDefinitionId !==
    input.modellingSpec.cohortDefinitionId
  ) {
    throw Error("methodology.cohortDefinitionId must match modellingSpec");
  }
}

export function draftLongitudinalOutcomePrediction(input: {
  id: string;
  modellingSpec: PopulationCohortModellingSpec;
  methodology: ModellingMethodologyDeclaration;
  outcomeRef?: string | null;
  predictionSummary: string;
  disclosureStatus?: PcdmDisclosureStatus;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcdmActorKind;
  createdAt: string;
  note?: string;
}): LongitudinalOutcomePrediction {
  if (!PRED_ID_RE.test(input.id)) throw Error("Invalid prediction id");
  assertMethodologyMatchesSpec({
    modellingSpec: input.modellingSpec,
    methodology: input.methodology,
  });
  if (!textOk(input.predictionSummary, 2000)) {
    throw Error("Invalid predictionSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.predictionSummary,
    "predictionSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const disclosureStatus = input.disclosureStatus ?? "released_aggregate";
  assertClosed(
    disclosureStatus,
    PCDM_DISCLOSURE_STATUSES,
    "disclosureStatus",
  );

  const record: LongitudinalOutcomePrediction = {
    schema: POPULATION_COHORT_DISEASE_MODELS_SCHEMA,
    method: POPULATION_COHORT_DISEASE_MODELS_METHOD,
    version: POPULATION_COHORT_DISEASE_MODELS_VERSION,
    id: input.id,
    modellingSpecId: input.modellingSpec.id,
    diseaseContextId: input.modellingSpec.diseaseContextId,
    methodologyId: input.methodology.id,
    outcomeRef: assertOptionalId(input.outcomeRef, RWE_OUT_RE, "outcomeRef"),
    predictionSummary: input.predictionSummary.trim(),
    causalExplanationClaimed: false,
    clinicalUsefulnessClaimed: false,
    disclosureStatus,
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
  return validateLongitudinalOutcomePrediction(record);
}

export function validateLongitudinalOutcomePrediction(
  record: LongitudinalOutcomePrediction,
): LongitudinalOutcomePrediction {
  if (!PRED_ID_RE.test(record.id)) throw Error("Invalid prediction id");
  if (record.causalExplanationClaimed !== false) {
    throw Error("Prediction must not claim causal explanation");
  }
  if (record.clinicalUsefulnessClaimed !== false) {
    throw Error(
      "Predictive accuracy alone must not claim clinical usefulness",
    );
  }
  assertClosed(
    record.disclosureStatus,
    PCDM_DISCLOSURE_STATUSES,
    "disclosureStatus",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftDiseaseTrajectoryClustering(input: {
  id: string;
  modellingSpec: PopulationCohortModellingSpec;
  methodology: ModellingMethodologyDeclaration;
  clusterValidationStatus: PcdmClusterValidationStatus;
  clusterCountDeclared?: number | null;
  clusteringSummary: string;
  disclosureStatus?: PcdmDisclosureStatus;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcdmActorKind;
  createdAt: string;
  note?: string;
}): DiseaseTrajectoryClustering {
  if (!CLU_ID_RE.test(input.id)) throw Error("Invalid clustering id");
  assertMethodologyMatchesSpec({
    modellingSpec: input.modellingSpec,
    methodology: input.methodology,
  });
  assertClosed(
    input.clusterValidationStatus,
    PCDM_CLUSTER_VALIDATION_STATUSES,
    "clusterValidationStatus",
  );
  if (!textOk(input.clusteringSummary, 2000)) {
    throw Error("Invalid clusteringSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.clusteringSummary,
    "clusteringSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const validatedSubtypeClaimed =
    input.clusterValidationStatus === "validated_subtype_declared";
  if (
    validatedSubtypeClaimed &&
    input.methodology.externalValidationStatus === "not_applicable_exploratory"
  ) {
    throw Error(
      "Validated subtype claim refused without external validation status beyond exploratory",
    );
  }
  if (
    isExploratoryClusterStatus(input.clusterValidationStatus) &&
    validatedSubtypeClaimed
  ) {
    throw Error(
      "Exploratory unsupervised clusters cannot claim validated subtypes",
    );
  }

  const clusterCountDeclared =
    input.clusterCountDeclared === undefined ||
    input.clusterCountDeclared === null
      ? null
      : input.clusterCountDeclared;
  if (
    clusterCountDeclared !== null &&
    (!Number.isInteger(clusterCountDeclared) ||
      clusterCountDeclared < 2 ||
      clusterCountDeclared > 64)
  ) {
    throw Error("Invalid clusterCountDeclared");
  }

  const disclosureStatus = input.disclosureStatus ?? "released_aggregate";
  assertClosed(
    disclosureStatus,
    PCDM_DISCLOSURE_STATUSES,
    "disclosureStatus",
  );

  const record: DiseaseTrajectoryClustering = {
    schema: POPULATION_COHORT_DISEASE_MODELS_SCHEMA,
    method: POPULATION_COHORT_DISEASE_MODELS_METHOD,
    version: POPULATION_COHORT_DISEASE_MODELS_VERSION,
    id: input.id,
    modellingSpecId: input.modellingSpec.id,
    diseaseContextId: input.modellingSpec.diseaseContextId,
    methodologyId: input.methodology.id,
    clusterValidationStatus: input.clusterValidationStatus,
    clusterCountDeclared,
    clusteringSummary: input.clusteringSummary.trim(),
    validatedSubtypeClaimed,
    clinicalUsefulnessClaimed: false,
    disclosureStatus,
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
  return validateDiseaseTrajectoryClustering(record);
}

export function validateDiseaseTrajectoryClustering(
  record: DiseaseTrajectoryClustering,
): DiseaseTrajectoryClustering {
  if (!CLU_ID_RE.test(record.id)) throw Error("Invalid clustering id");
  assertClosed(
    record.clusterValidationStatus,
    PCDM_CLUSTER_VALIDATION_STATUSES,
    "clusterValidationStatus",
  );
  if (
    isExploratoryClusterStatus(record.clusterValidationStatus) &&
    record.validatedSubtypeClaimed
  ) {
    throw Error(
      "Exploratory unsupervised clusters cannot claim validated subtypes",
    );
  }
  if (
    record.clusterValidationStatus === "validated_subtype_declared" &&
    !record.validatedSubtypeClaimed
  ) {
    throw Error(
      "validated_subtype_declared requires validatedSubtypeClaimed=true",
    );
  }
  if (record.clinicalUsefulnessClaimed !== false) {
    throw Error(
      "Predictive accuracy alone must not claim clinical usefulness",
    );
  }
  assertClosed(
    record.disclosureStatus,
    PCDM_DISCLOSURE_STATUSES,
    "disclosureStatus",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftDiseaseProgressionRisk(input: {
  id: string;
  modellingSpec: PopulationCohortModellingSpec;
  methodology: ModellingMethodologyDeclaration;
  riskSummary: string;
  disclosureStatus?: PcdmDisclosureStatus;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcdmActorKind;
  createdAt: string;
  note?: string;
}): DiseaseProgressionRisk {
  if (!RISK_ID_RE.test(input.id)) throw Error("Invalid progression risk id");
  assertMethodologyMatchesSpec({
    modellingSpec: input.modellingSpec,
    methodology: input.methodology,
  });
  if (!textOk(input.riskSummary, 2000)) throw Error("Invalid riskSummary");
  assertNoForbiddenClaimLanguage(input.riskSummary, "riskSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const disclosureStatus = input.disclosureStatus ?? "released_aggregate";
  assertClosed(
    disclosureStatus,
    PCDM_DISCLOSURE_STATUSES,
    "disclosureStatus",
  );

  const record: DiseaseProgressionRisk = {
    schema: POPULATION_COHORT_DISEASE_MODELS_SCHEMA,
    method: POPULATION_COHORT_DISEASE_MODELS_METHOD,
    version: POPULATION_COHORT_DISEASE_MODELS_VERSION,
    id: input.id,
    modellingSpecId: input.modellingSpec.id,
    diseaseContextId: input.modellingSpec.diseaseContextId,
    methodologyId: input.methodology.id,
    riskSummary: input.riskSummary.trim(),
    causalExplanationClaimed: false,
    clinicalUsefulnessClaimed: false,
    disclosureStatus,
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
  return validateDiseaseProgressionRisk(record);
}

export function validateDiseaseProgressionRisk(
  record: DiseaseProgressionRisk,
): DiseaseProgressionRisk {
  if (!RISK_ID_RE.test(record.id)) throw Error("Invalid progression risk id");
  if (record.causalExplanationClaimed !== false) {
    throw Error("Progression risk must not claim causal explanation");
  }
  if (record.clinicalUsefulnessClaimed !== false) {
    throw Error(
      "Predictive accuracy alone must not claim clinical usefulness",
    );
  }
  assertClosed(
    record.disclosureStatus,
    PCDM_DISCLOSURE_STATUSES,
    "disclosureStatus",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftPhenotypeStratification(input: {
  id: string;
  modellingSpec: PopulationCohortModellingSpec;
  methodology: ModellingMethodologyDeclaration;
  stratificationSummary: string;
  stratumCountDeclared?: number | null;
  disclosureStatus?: PcdmDisclosureStatus;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcdmActorKind;
  createdAt: string;
  note?: string;
}): PhenotypeStratification {
  if (!PHENO_ID_RE.test(input.id)) {
    throw Error("Invalid phenotype stratification id");
  }
  assertMethodologyMatchesSpec({
    modellingSpec: input.modellingSpec,
    methodology: input.methodology,
  });
  if (!textOk(input.stratificationSummary, 2000)) {
    throw Error("Invalid stratificationSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.stratificationSummary,
    "stratificationSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const stratumCountDeclared =
    input.stratumCountDeclared === undefined ||
    input.stratumCountDeclared === null
      ? null
      : input.stratumCountDeclared;
  if (
    stratumCountDeclared !== null &&
    (!Number.isInteger(stratumCountDeclared) ||
      stratumCountDeclared < 2 ||
      stratumCountDeclared > 64)
  ) {
    throw Error("Invalid stratumCountDeclared");
  }

  const disclosureStatus = input.disclosureStatus ?? "released_aggregate";
  assertClosed(
    disclosureStatus,
    PCDM_DISCLOSURE_STATUSES,
    "disclosureStatus",
  );

  const record: PhenotypeStratification = {
    schema: POPULATION_COHORT_DISEASE_MODELS_SCHEMA,
    method: POPULATION_COHORT_DISEASE_MODELS_METHOD,
    version: POPULATION_COHORT_DISEASE_MODELS_VERSION,
    id: input.id,
    modellingSpecId: input.modellingSpec.id,
    diseaseContextId: input.modellingSpec.diseaseContextId,
    methodologyId: input.methodology.id,
    stratificationSummary: input.stratificationSummary.trim(),
    stratumCountDeclared,
    validatedSubtypeClaimed: false,
    clinicalUsefulnessClaimed: false,
    disclosureStatus,
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
  return validatePhenotypeStratification(record);
}

export function validatePhenotypeStratification(
  record: PhenotypeStratification,
): PhenotypeStratification {
  if (!PHENO_ID_RE.test(record.id)) {
    throw Error("Invalid phenotype stratification id");
  }
  if (record.validatedSubtypeClaimed !== false) {
    throw Error(
      "Phenotype stratification must not claim validated subtypes by default",
    );
  }
  if (record.clinicalUsefulnessClaimed !== false) {
    throw Error(
      "Predictive accuracy alone must not claim clinical usefulness",
    );
  }
  assertClosed(
    record.disclosureStatus,
    PCDM_DISCLOSURE_STATUSES,
    "disclosureStatus",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftOrganSpecificOutcomeModelling(input: {
  id: string;
  modellingSpec: PopulationCohortModellingSpec;
  methodology: ModellingMethodologyDeclaration;
  organOrSystemLabel: string;
  outcomeSummary: string;
  disclosureStatus?: PcdmDisclosureStatus;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcdmActorKind;
  createdAt: string;
  note?: string;
}): OrganSpecificOutcomeModelling {
  if (!ORGAN_ID_RE.test(input.id)) {
    throw Error("Invalid organ-specific outcome modelling id");
  }
  assertMethodologyMatchesSpec({
    modellingSpec: input.modellingSpec,
    methodology: input.methodology,
  });
  if (!textOk(input.organOrSystemLabel, 200)) {
    throw Error("Invalid organOrSystemLabel");
  }
  assertNoForbiddenClaimLanguage(
    input.organOrSystemLabel,
    "organOrSystemLabel",
  );
  if (!textOk(input.outcomeSummary, 2000)) {
    throw Error("Invalid outcomeSummary");
  }
  assertNoForbiddenClaimLanguage(input.outcomeSummary, "outcomeSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const disclosureStatus = input.disclosureStatus ?? "released_aggregate";
  assertClosed(
    disclosureStatus,
    PCDM_DISCLOSURE_STATUSES,
    "disclosureStatus",
  );

  const record: OrganSpecificOutcomeModelling = {
    schema: POPULATION_COHORT_DISEASE_MODELS_SCHEMA,
    method: POPULATION_COHORT_DISEASE_MODELS_METHOD,
    version: POPULATION_COHORT_DISEASE_MODELS_VERSION,
    id: input.id,
    modellingSpecId: input.modellingSpec.id,
    diseaseContextId: input.modellingSpec.diseaseContextId,
    methodologyId: input.methodology.id,
    organOrSystemLabel: input.organOrSystemLabel.trim(),
    outcomeSummary: input.outcomeSummary.trim(),
    causalExplanationClaimed: false,
    clinicalUsefulnessClaimed: false,
    disclosureStatus,
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
  return validateOrganSpecificOutcomeModelling(record);
}

export function validateOrganSpecificOutcomeModelling(
  record: OrganSpecificOutcomeModelling,
): OrganSpecificOutcomeModelling {
  if (!ORGAN_ID_RE.test(record.id)) {
    throw Error("Invalid organ-specific outcome modelling id");
  }
  if (record.causalExplanationClaimed !== false) {
    throw Error(
      "Organ-specific outcome modelling must not claim causal explanation",
    );
  }
  if (record.clinicalUsefulnessClaimed !== false) {
    throw Error(
      "Predictive accuracy alone must not claim clinical usefulness",
    );
  }
  assertClosed(
    record.disclosureStatus,
    PCDM_DISCLOSURE_STATUSES,
    "disclosureStatus",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftBiomarkerAssociationAnalysis(input: {
  id: string;
  modellingSpec: PopulationCohortModellingSpec;
  methodology: ModellingMethodologyDeclaration;
  biomarkerLabel: string;
  associationKind: PcdmAssociationKind;
  associationSummary: string;
  disclosureStatus?: PcdmDisclosureStatus;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcdmActorKind;
  createdAt: string;
  note?: string;
}): BiomarkerAssociationAnalysis {
  if (!BIO_ID_RE.test(input.id)) {
    throw Error("Invalid biomarker association analysis id");
  }
  assertMethodologyMatchesSpec({
    modellingSpec: input.modellingSpec,
    methodology: input.methodology,
  });
  if (!textOk(input.biomarkerLabel, 200)) {
    throw Error("Invalid biomarkerLabel");
  }
  assertNoForbiddenClaimLanguage(input.biomarkerLabel, "biomarkerLabel");
  assertClosed(
    input.associationKind,
    PCDM_ASSOCIATION_KINDS,
    "associationKind",
  );
  if (!textOk(input.associationSummary, 2000)) {
    throw Error("Invalid associationSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.associationSummary,
    "associationSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const disclosureStatus = input.disclosureStatus ?? "released_aggregate";
  assertClosed(
    disclosureStatus,
    PCDM_DISCLOSURE_STATUSES,
    "disclosureStatus",
  );

  const record: BiomarkerAssociationAnalysis = {
    schema: POPULATION_COHORT_DISEASE_MODELS_SCHEMA,
    method: POPULATION_COHORT_DISEASE_MODELS_METHOD,
    version: POPULATION_COHORT_DISEASE_MODELS_VERSION,
    id: input.id,
    modellingSpecId: input.modellingSpec.id,
    diseaseContextId: input.modellingSpec.diseaseContextId,
    methodologyId: input.methodology.id,
    biomarkerLabel: input.biomarkerLabel.trim(),
    associationKind: input.associationKind,
    associationSummary: input.associationSummary.trim(),
    causalExplanationClaimed: false,
    clinicalUsefulnessClaimed: false,
    disclosureStatus,
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
  return validateBiomarkerAssociationAnalysis(record);
}

export function validateBiomarkerAssociationAnalysis(
  record: BiomarkerAssociationAnalysis,
): BiomarkerAssociationAnalysis {
  if (!BIO_ID_RE.test(record.id)) {
    throw Error("Invalid biomarker association analysis id");
  }
  assertClosed(
    record.associationKind,
    PCDM_ASSOCIATION_KINDS,
    "associationKind",
  );
  if (record.causalExplanationClaimed !== false) {
    throw Error(
      "Biomarker association must not claim causal explanation",
    );
  }
  if (record.clinicalUsefulnessClaimed !== false) {
    throw Error(
      "Predictive accuracy alone must not claim clinical usefulness",
    );
  }
  assertClosed(
    record.disclosureStatus,
    PCDM_DISCLOSURE_STATUSES,
    "disclosureStatus",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftPopulationCohortModellingBundle(input: {
  id: string;
  displayName: string;
  modellingSpec: PopulationCohortModellingSpec;
  bundleVersion: string;
  limitations: readonly string[];
  methodologies?: readonly ModellingMethodologyDeclaration[];
  longitudinalOutcomePredictions?: readonly LongitudinalOutcomePrediction[];
  diseaseTrajectoryClusterings?: readonly DiseaseTrajectoryClustering[];
  diseaseProgressionRisks?: readonly DiseaseProgressionRisk[];
  phenotypeStratifications?: readonly PhenotypeStratification[];
  organSpecificOutcomeModellings?: readonly OrganSpecificOutcomeModelling[];
  biomarkerAssociationAnalyses?: readonly BiomarkerAssociationAnalysis[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PcdmActorKind;
  createdAt: string;
  note?: string;
}): PopulationCohortModellingBundle {
  if (!BND_ID_RE.test(input.id)) throw Error("Invalid bundle id");
  validatePopulationCohortModellingSpec(input.modellingSpec);
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!textOk(input.bundleVersion, 40)) throw Error("Invalid bundleVersion");
  if (!REF_ID_RE.test(input.bundleVersion)) {
    throw Error("Invalid bundleVersion token");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const methodologies = input.methodologies ?? [];
  const predictions = input.longitudinalOutcomePredictions ?? [];
  const clusterings = input.diseaseTrajectoryClusterings ?? [];
  const risks = input.diseaseProgressionRisks ?? [];
  const phenotypes = input.phenotypeStratifications ?? [];
  const organs = input.organSpecificOutcomeModellings ?? [];
  const biomarkers = input.biomarkerAssociationAnalyses ?? [];

  for (const m of methodologies) validateModellingMethodologyDeclaration(m);
  for (const p of predictions) validateLongitudinalOutcomePrediction(p);
  for (const c of clusterings) validateDiseaseTrajectoryClustering(c);
  for (const r of risks) validateDiseaseProgressionRisk(r);
  for (const p of phenotypes) validatePhenotypeStratification(p);
  for (const o of organs) validateOrganSpecificOutcomeModelling(o);
  for (const b of biomarkers) validateBiomarkerAssociationAnalysis(b);

  const exploratoryClusterIds = clusterings
    .filter((c) => isExploratoryClusterStatus(c.clusterValidationStatus))
    .map((c) => c.id);

  const lifecycle: PcdmLifecycle =
    input.modellingSpec.datasetAvailability ===
    "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const record: PopulationCohortModellingBundle = {
    schema: POPULATION_COHORT_DISEASE_MODELS_SCHEMA,
    method: POPULATION_COHORT_DISEASE_MODELS_METHOD,
    version: POPULATION_COHORT_DISEASE_MODELS_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    diseaseContextId: input.modellingSpec.diseaseContextId,
    modellingSpecId: input.modellingSpec.id,
    methodologyIds: assertIdList(
      methodologies.map((m) => m.id),
      METH_ID_RE,
      "methodologyIds",
      64,
    ),
    longitudinalOutcomePredictionIds: assertIdList(
      predictions.map((p) => p.id),
      PRED_ID_RE,
      "longitudinalOutcomePredictionIds",
      64,
    ),
    diseaseTrajectoryClusteringIds: assertIdList(
      clusterings.map((c) => c.id),
      CLU_ID_RE,
      "diseaseTrajectoryClusteringIds",
      64,
    ),
    diseaseProgressionRiskIds: assertIdList(
      risks.map((r) => r.id),
      RISK_ID_RE,
      "diseaseProgressionRiskIds",
      64,
    ),
    phenotypeStratificationIds: assertIdList(
      phenotypes.map((p) => p.id),
      PHENO_ID_RE,
      "phenotypeStratificationIds",
      64,
    ),
    organSpecificOutcomeModellingIds: assertIdList(
      organs.map((o) => o.id),
      ORGAN_ID_RE,
      "organSpecificOutcomeModellingIds",
      64,
    ),
    biomarkerAssociationAnalysisIds: assertIdList(
      biomarkers.map((b) => b.id),
      BIO_ID_RE,
      "biomarkerAssociationAnalysisIds",
      64,
    ),
    exploratoryClusterIds: assertIdList(
      exploratoryClusterIds,
      CLU_ID_RE,
      "exploratoryClusterIds",
      64,
    ),
    bundleVersion: input.bundleVersion,
    limitations: assertLimitations(input.limitations),
    datasetAvailability: input.modellingSpec.datasetAvailability,
    predictionIsNotCausation: true,
    unsupervisedClustersAreNotValidatedSubtypes: true,
    predictiveAccuracyIsNotClinicalUsefulness: true,
    liveMultiscaleEngineOperational: false,
    notDigitalTwinProduct: true,
    graphPromotable: false,
    lifecycle,
    reviewedBy: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.modellingSpec.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validatePopulationCohortModellingBundle(record);
}

export function validatePopulationCohortModellingBundle(
  record: PopulationCohortModellingBundle,
): PopulationCohortModellingBundle {
  if (!BND_ID_RE.test(record.id)) throw Error("Invalid bundle id");
  if (record.predictionIsNotCausation !== true) {
    throw Error("Prediction is not causation must stay true");
  }
  if (record.unsupervisedClustersAreNotValidatedSubtypes !== true) {
    throw Error(
      "Unsupervised clusters are not validated subtypes must stay true",
    );
  }
  if (record.predictiveAccuracyIsNotClinicalUsefulness !== true) {
    throw Error(
      "Predictive accuracy is not clinical usefulness must stay true",
    );
  }
  if (record.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine must stay false");
  }
  if (record.notDigitalTwinProduct !== true) {
    throw Error("Must declare not a digital twin product");
  }
  if (record.graphPromotable !== false) {
    throw Error("Graph promotion forbidden");
  }
  assertClosed(record.lifecycle, PCDM_LIFECYCLES, "lifecycle");
  assertClosed(
    record.datasetAvailability,
    PCDM_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  return record;
}

export function transitionPopulationCohortModellingBundle(input: {
  bundle: PopulationCohortModellingBundle;
  to: PcdmLifecycle;
  updatedAt: string;
  actor: PcdmActor;
}): PopulationCohortModellingBundle {
  const current = validatePopulationCohortModellingBundle(input.bundle);
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
  return validatePopulationCohortModellingBundle({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryPopulationCohortDiseaseModelsStore(): PopulationCohortDiseaseModelsStore & {
  specs: Map<string, PopulationCohortModellingSpec>;
  methodologies: Map<string, ModellingMethodologyDeclaration>;
  predictions: Map<string, LongitudinalOutcomePrediction>;
  clusterings: Map<string, DiseaseTrajectoryClustering>;
  risks: Map<string, DiseaseProgressionRisk>;
  phenotypes: Map<string, PhenotypeStratification>;
  organs: Map<string, OrganSpecificOutcomeModelling>;
  biomarkers: Map<string, BiomarkerAssociationAnalysis>;
  bundles: Map<string, PopulationCohortModellingBundle>;
} {
  const specs = new Map<string, PopulationCohortModellingSpec>();
  const methodologies = new Map<string, ModellingMethodologyDeclaration>();
  const predictions = new Map<string, LongitudinalOutcomePrediction>();
  const clusterings = new Map<string, DiseaseTrajectoryClustering>();
  const risks = new Map<string, DiseaseProgressionRisk>();
  const phenotypes = new Map<string, PhenotypeStratification>();
  const organs = new Map<string, OrganSpecificOutcomeModelling>();
  const biomarkers = new Map<string, BiomarkerAssociationAnalysis>();
  const bundles = new Map<string, PopulationCohortModellingBundle>();

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
    methodologies,
    predictions,
    clusterings,
    risks,
    phenotypes,
    organs,
    biomarkers,
    bundles,
    upsertSpec(record) {
      const validated = validatePopulationCohortModellingSpec(record);
      specs.set(validated.id, validated);
      return validated;
    },
    getSpec(id) {
      return specs.get(id) ?? null;
    },
    listSpecs(diseaseContextId) {
      return filterByDisease(specs, diseaseContextId);
    },
    upsertMethodology(record) {
      const validated = validateModellingMethodologyDeclaration(record);
      methodologies.set(validated.id, validated);
      return validated;
    },
    getMethodology(id) {
      return methodologies.get(id) ?? null;
    },
    listMethodologies(diseaseContextId) {
      return filterByDisease(methodologies, diseaseContextId);
    },
    upsertLongitudinalOutcomePrediction(record) {
      const validated = validateLongitudinalOutcomePrediction(record);
      predictions.set(validated.id, validated);
      return validated;
    },
    getLongitudinalOutcomePrediction(id) {
      return predictions.get(id) ?? null;
    },
    listLongitudinalOutcomePredictions(diseaseContextId) {
      return filterByDisease(predictions, diseaseContextId);
    },
    upsertDiseaseTrajectoryClustering(record) {
      const validated = validateDiseaseTrajectoryClustering(record);
      clusterings.set(validated.id, validated);
      return validated;
    },
    getDiseaseTrajectoryClustering(id) {
      return clusterings.get(id) ?? null;
    },
    listDiseaseTrajectoryClusterings(diseaseContextId) {
      return filterByDisease(clusterings, diseaseContextId);
    },
    upsertDiseaseProgressionRisk(record) {
      const validated = validateDiseaseProgressionRisk(record);
      risks.set(validated.id, validated);
      return validated;
    },
    getDiseaseProgressionRisk(id) {
      return risks.get(id) ?? null;
    },
    listDiseaseProgressionRisks(diseaseContextId) {
      return filterByDisease(risks, diseaseContextId);
    },
    upsertPhenotypeStratification(record) {
      const validated = validatePhenotypeStratification(record);
      phenotypes.set(validated.id, validated);
      return validated;
    },
    getPhenotypeStratification(id) {
      return phenotypes.get(id) ?? null;
    },
    listPhenotypeStratifications(diseaseContextId) {
      return filterByDisease(phenotypes, diseaseContextId);
    },
    upsertOrganSpecificOutcomeModelling(record) {
      const validated = validateOrganSpecificOutcomeModelling(record);
      organs.set(validated.id, validated);
      return validated;
    },
    getOrganSpecificOutcomeModelling(id) {
      return organs.get(id) ?? null;
    },
    listOrganSpecificOutcomeModellings(diseaseContextId) {
      return filterByDisease(organs, diseaseContextId);
    },
    upsertBiomarkerAssociationAnalysis(record) {
      const validated = validateBiomarkerAssociationAnalysis(record);
      biomarkers.set(validated.id, validated);
      return validated;
    },
    getBiomarkerAssociationAnalysis(id) {
      return biomarkers.get(id) ?? null;
    },
    listBiomarkerAssociationAnalyses(diseaseContextId) {
      return filterByDisease(biomarkers, diseaseContextId);
    },
    upsertBundle(record) {
      const validated = validatePopulationCohortModellingBundle(record);
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

export function projectPopulationCohortDiseaseModelsPersistenceLines(input: {
  specs: readonly PopulationCohortModellingSpec[];
  methodologies?: readonly ModellingMethodologyDeclaration[];
  longitudinalOutcomePredictions?: readonly LongitudinalOutcomePrediction[];
  diseaseTrajectoryClusterings?: readonly DiseaseTrajectoryClustering[];
  diseaseProgressionRisks?: readonly DiseaseProgressionRisk[];
  phenotypeStratifications?: readonly PhenotypeStratification[];
  organSpecificOutcomeModellings?: readonly OrganSpecificOutcomeModelling[];
  biomarkerAssociationAnalyses?: readonly BiomarkerAssociationAnalysis[];
  bundles?: readonly PopulationCohortModellingBundle[];
}): string[] {
  for (const s of input.specs) validatePopulationCohortModellingSpec(s);
  for (const m of input.methodologies ?? []) {
    validateModellingMethodologyDeclaration(m);
  }
  for (const p of input.longitudinalOutcomePredictions ?? []) {
    validateLongitudinalOutcomePrediction(p);
  }
  for (const c of input.diseaseTrajectoryClusterings ?? []) {
    validateDiseaseTrajectoryClustering(c);
  }
  for (const r of input.diseaseProgressionRisks ?? []) {
    validateDiseaseProgressionRisk(r);
  }
  for (const p of input.phenotypeStratifications ?? []) {
    validatePhenotypeStratification(p);
  }
  for (const o of input.organSpecificOutcomeModellings ?? []) {
    validateOrganSpecificOutcomeModelling(o);
  }
  for (const b of input.biomarkerAssociationAnalyses ?? []) {
    validateBiomarkerAssociationAnalysis(b);
  }
  for (const b of input.bundles ?? []) {
    validatePopulationCohortModellingBundle(b);
  }

  const exploratoryClusters = (input.diseaseTrajectoryClusterings ?? []).filter(
    (c) => isExploratoryClusterStatus(c.clusterValidationStatus),
  ).length;

  return [
    `schema=${POPULATION_COHORT_DISEASE_MODELS_SCHEMA}`,
    `method=${POPULATION_COHORT_DISEASE_MODELS_METHOD}`,
    `version=${POPULATION_COHORT_DISEASE_MODELS_VERSION}`,
    `specs=${input.specs.length}`,
    `methodologies=${(input.methodologies ?? []).length}`,
    `longitudinalOutcomePredictions=${(input.longitudinalOutcomePredictions ?? []).length}`,
    `diseaseTrajectoryClusterings=${(input.diseaseTrajectoryClusterings ?? []).length}`,
    `diseaseProgressionRisks=${(input.diseaseProgressionRisks ?? []).length}`,
    `phenotypeStratifications=${(input.phenotypeStratifications ?? []).length}`,
    `organSpecificOutcomeModellings=${(input.organSpecificOutcomeModellings ?? []).length}`,
    `biomarkerAssociationAnalyses=${(input.biomarkerAssociationAnalyses ?? []).length}`,
    `bundles=${(input.bundles ?? []).length}`,
    `exploratoryClustersRecorded=${exploratoryClusters}`,
    `modellingKindCount=${PCDM_MODELLING_KINDS.length}`,
    `predictionIsNotCausation=true`,
    `unsupervisedClustersAreNotValidatedSubtypes=true`,
    `predictiveAccuracyIsNotClinicalUsefulness=true`,
    `aggregateHonestyRequired=true`,
    `smallCellDisclosureRequired=true`,
    `noIndividualCollapse=true`,
    `notDigitalTwinProduct=true`,
    `notClinicalCare=true`,
    `noPhiIngestion=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintPopulationCohortModellingBundle(
  bundle: PopulationCohortModellingBundle,
): string {
  const validated = validatePopulationCohortModellingBundle(bundle);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildPopulationCohortDiseaseModelsPack(input: {
  specs: readonly PopulationCohortModellingSpec[];
  methodologies: readonly ModellingMethodologyDeclaration[];
  longitudinalOutcomePredictions: readonly LongitudinalOutcomePrediction[];
  diseaseTrajectoryClusterings: readonly DiseaseTrajectoryClustering[];
  diseaseProgressionRisks: readonly DiseaseProgressionRisk[];
  phenotypeStratifications: readonly PhenotypeStratification[];
  organSpecificOutcomeModellings: readonly OrganSpecificOutcomeModelling[];
  biomarkerAssociationAnalyses: readonly BiomarkerAssociationAnalysis[];
  bundles: readonly PopulationCohortModellingBundle[];
  asOf: string;
}): {
  schema: typeof POPULATION_COHORT_DISEASE_MODELS_SCHEMA;
  method: typeof POPULATION_COHORT_DISEASE_MODELS_METHOD;
  version: typeof POPULATION_COHORT_DISEASE_MODELS_VERSION;
  asOf: string;
  modellingKindCount: number;
  specCount: number;
  methodologyCount: number;
  longitudinalOutcomePredictionCount: number;
  diseaseTrajectoryClusteringCount: number;
  diseaseProgressionRiskCount: number;
  phenotypeStratificationCount: number;
  organSpecificOutcomeModellingCount: number;
  biomarkerAssociationAnalysisCount: number;
  bundleCount: number;
  exploratoryClusterCount: number;
  honesty: PopulationCohortDiseaseModelsHonesty;
  specs: readonly PopulationCohortModellingSpec[];
  methodologies: readonly ModellingMethodologyDeclaration[];
  longitudinalOutcomePredictions: readonly LongitudinalOutcomePrediction[];
  diseaseTrajectoryClusterings: readonly DiseaseTrajectoryClustering[];
  diseaseProgressionRisks: readonly DiseaseProgressionRisk[];
  phenotypeStratifications: readonly PhenotypeStratification[];
  organSpecificOutcomeModellings: readonly OrganSpecificOutcomeModelling[];
  biomarkerAssociationAnalyses: readonly BiomarkerAssociationAnalysis[];
  bundles: readonly PopulationCohortModellingBundle[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const specs = input.specs.map(validatePopulationCohortModellingSpec);
  const methodologies = input.methodologies.map(
    validateModellingMethodologyDeclaration,
  );
  const longitudinalOutcomePredictions =
    input.longitudinalOutcomePredictions.map(
      validateLongitudinalOutcomePrediction,
    );
  const diseaseTrajectoryClusterings = input.diseaseTrajectoryClusterings.map(
    validateDiseaseTrajectoryClustering,
  );
  const diseaseProgressionRisks = input.diseaseProgressionRisks.map(
    validateDiseaseProgressionRisk,
  );
  const phenotypeStratifications = input.phenotypeStratifications.map(
    validatePhenotypeStratification,
  );
  const organSpecificOutcomeModellings =
    input.organSpecificOutcomeModellings.map(
      validateOrganSpecificOutcomeModelling,
    );
  const biomarkerAssociationAnalyses = input.biomarkerAssociationAnalyses.map(
    validateBiomarkerAssociationAnalysis,
  );
  const bundles = input.bundles.map(validatePopulationCohortModellingBundle);
  const exploratoryClusterCount = diseaseTrajectoryClusterings.filter((c) =>
    isExploratoryClusterStatus(c.clusterValidationStatus),
  ).length;

  return {
    schema: POPULATION_COHORT_DISEASE_MODELS_SCHEMA,
    method: POPULATION_COHORT_DISEASE_MODELS_METHOD,
    version: POPULATION_COHORT_DISEASE_MODELS_VERSION,
    asOf: input.asOf,
    modellingKindCount: PCDM_MODELLING_KINDS.length,
    specCount: specs.length,
    methodologyCount: methodologies.length,
    longitudinalOutcomePredictionCount: longitudinalOutcomePredictions.length,
    diseaseTrajectoryClusteringCount: diseaseTrajectoryClusterings.length,
    diseaseProgressionRiskCount: diseaseProgressionRisks.length,
    phenotypeStratificationCount: phenotypeStratifications.length,
    organSpecificOutcomeModellingCount: organSpecificOutcomeModellings.length,
    biomarkerAssociationAnalysisCount: biomarkerAssociationAnalyses.length,
    bundleCount: bundles.length,
    exploratoryClusterCount,
    honesty: {...DEFAULT_HONESTY},
    specs,
    methodologies,
    longitudinalOutcomePredictions,
    diseaseTrajectoryClusterings,
    diseaseProgressionRisks,
    phenotypeStratifications,
    organSpecificOutcomeModellings,
    biomarkerAssociationAnalyses,
    bundles,
  };
}
