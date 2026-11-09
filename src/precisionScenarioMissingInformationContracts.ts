/**
 * Milestone 15 / PR8 — Precision Scenario and Missing-Information Intelligence.
 *
 * Contracts + thin store for bounded research scenarios and missing-information
 * intelligence. Composes HDI / PCRM (PR6) / MSI (PR7) envelopes.
 *
 * Binding honesty: not personalised treatment effects; no clinical dosing;
 * no specific-patient prediction unless validated for that purpose; no invented
 * info-gain probabilities; research measurement priorities ≠ clinical orders;
 * no invasive testing without governance; fixtures only; no PHI/CDS; Neon
 * deferred; no workbench UI; no twin; no Gate C / MoU.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA =
  "hsi-precision-scenario-missing-information-1" as const;
export const PRECISION_SCENARIO_MISSING_INFORMATION_METHOD =
  "hsi.precision_scenario_missing_information.v1" as const;
export const PRECISION_SCENARIO_MISSING_INFORMATION_VERSION = "0.1.0" as const;

export const PSMI_SCENARIO_KINDS = [
  "alternative_biological_mechanism_assumptions",
  "disease_trajectory_model_comparison",
  "biomarker_measurement_scenarios",
  "model_parameter_sensitivity",
  "cohort_subgroup_comparisons",
  "hypothetical_pathway_perturbations",
  "alternative_monitoring_schedules",
] as const;
export type PsmiScenarioKind = (typeof PSMI_SCENARIO_KINDS)[number];

export const PSMI_CAPABILITY_KINDS = [
  "precision_research_scenario",
  "scenario_model_and_context",
  "scenario_predicted_outputs",
  "scenario_uncertainty_sensitivity",
  "scenario_validation_recommendation",
  "missing_information_assessment",
  "missing_variable_research_value",
  "follow_up_and_experimental_validation",
] as const;
export type PsmiCapabilityKind = (typeof PSMI_CAPABILITY_KINDS)[number];

export const PSMI_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_awaiting_authorised_dataset",
  "blocked_personalised_treatment_effect_claim",
  "blocked_clinical_dosing_claim",
  "blocked_specific_patient_prediction_claim",
  "blocked_invented_info_gain",
  "blocked_invasive_testing_without_governance",
  "rejected",
  "superseded",
] as const;
export type PsmiLifecycle = (typeof PSMI_LIFECYCLES)[number];

export const PSMI_DATASET_AVAILABILITY = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type PsmiDatasetAvailability = (typeof PSMI_DATASET_AVAILABILITY)[number];

export const PSMI_ACCESS_CLASSIFICATIONS = [
  "fixture_engineering",
  "authorised_pseudonymous_research",
  "restricted_not_ingested",
] as const;
export type PsmiAccessClassification = (typeof PSMI_ACCESS_CLASSIFICATIONS)[number];

export const PSMI_ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type PsmiActorKind = (typeof PSMI_ACTOR_KINDS)[number];

export const PSMI_DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type PsmiDataBasis = (typeof PSMI_DATA_BASES)[number];

export const PSMI_UNCERTAINTY_ORDINALS = [
  "low_declared",
  "moderate_declared",
  "high_declared",
  "unquantified_declared",
  "insufficient",
] as const;
export type PsmiUncertaintyOrdinal = (typeof PSMI_UNCERTAINTY_ORDINALS)[number];

export const PSMI_SENSITIVITY_ORDINALS = [
  "low_declared",
  "moderate_declared",
  "high_declared",
  "unquantified_declared",
  "insufficient",
] as const;
export type PsmiSensitivityOrdinal = (typeof PSMI_SENSITIVITY_ORDINALS)[number];

export const PSMI_INFO_VALUE_STATUSES = [
  "quantifiable_declared",
  "unquantifiable_declared",
  "insufficient_to_assess",
  "blocked_invented_probability",
] as const;
export type PsmiInfoValueStatus = (typeof PSMI_INFO_VALUE_STATUSES)[number];

export const PSMI_INVASIVE_GOVERNANCE_STATUSES = [
  "not_applicable",
  "governance_required_declared",
  "blocked_without_governance",
] as const;
export type PsmiInvasiveGovernanceStatus =
  (typeof PSMI_INVASIVE_GOVERNANCE_STATUSES)[number];

const SPEC_ID_RE = /^hsi-psmi-spec-[a-z0-9-]{3,80}$/;
const SCN_ID_RE = /^hsi-psmi-scn-[a-z0-9-]{3,80}$/;
const CTX_ID_RE = /^hsi-psmi-ctx-[a-z0-9-]{3,80}$/;
const OUT_ID_RE = /^hsi-psmi-out-[a-z0-9-]{3,80}$/;
const UNC_ID_RE = /^hsi-psmi-unc-[a-z0-9-]{3,80}$/;
const VAL_ID_RE = /^hsi-psmi-val-[a-z0-9-]{3,80}$/;
const MIA_ID_RE = /^hsi-psmi-mia-[a-z0-9-]{3,80}$/;
const MRV_ID_RE = /^hsi-psmi-mrv-[a-z0-9-]{3,80}$/;
const FUV_ID_RE = /^hsi-psmi-fuv-[a-z0-9-]{3,80}$/;
const BND_ID_RE = /^hsi-psmi-bnd-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const HDI_CTX_RE = /^hsi-hdi-ctx-[a-z0-9-]{3,80}$/;
const HDI_SIM_RE = /^hsi-hdi-sim-[a-z0-9-]{3,80}$/;
const HDI_DPM_RE = /^hsi-hdi-dpm-[a-z0-9-]{3,80}$/;
const PCRM_SPEC_RE = /^hsi-pcrm-spec-[a-z0-9-]{3,80}$/;
const PCRM_MIA_RE = /^hsi-pcrm-mia-[a-z0-9-]{3,80}$/;
const MSI_SPEC_RE = /^hsi-msi-spec-[a-z0-9-]{3,80}$/;
const PCDM_SPEC_RE = /^hsi-pcdm-spec-[a-z0-9-]{3,80}$/;
const LDSM_SPEC_RE = /^hsi-ldsm-spec-[a-z0-9-]{3,80}$/;
const CBC_IDC_RE = /^hsi-cbc-idc-[a-z0-9-]{3,80}$/;
const RCB_COH_RE = /^hsi-rcb-coh-[a-z0-9-]{3,80}$/;
const RWE_STUDY_RE = /^hsi-rwe-study-[a-z0-9-]{3,80}$/;
const LCE_SPEC_RE = /^hsi-lce-spec-[a-z0-9-]{3,80}$/;

export type PrecisionScenarioMissingInformationHonesty = {
  researchDecisionSupportOnly: true;
  notPersonalisedTreatmentEffect: true;
  noClinicalDosing: true;
  notSpecificPatientPredictionUnlessValidated: true;
  researchMeasurementPrioritiesNotClinicalOrders: true;
  noInvasiveTestingWithoutGovernance: true;
  noInventedInfoGainProbabilities: true;
  notDigitalTwinProduct: true;
  notValidatedIndividualOutcomePrediction: true;
  liveMultiscaleEngineOperational: false;
  m11SimulationClaimed: false;
  populationAssociationIsNotIndividualTruth: true;
  observedIsNotInferred: true;
  noPhiIngestion: true;
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

export type PsmiActor = {principalId: string; actorKind: PsmiActorKind};

export type PrecisionScenarioMissingInformationSpec = {
  schema: typeof PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA;
  method: typeof PRECISION_SCENARIO_MISSING_INFORMATION_METHOD;
  version: typeof PRECISION_SCENARIO_MISSING_INFORMATION_VERSION;
  id: string;
  displayName: string;
  scientificQuestion: string;
  capabilityKinds: readonly PsmiCapabilityKind[];
  diseaseContextId: string;
  simulationScenarioId: string | null;
  digitalPatientModelId: string | null;
  patientContextualisedResearchSpecId: string | null;
  pcrmMissingInformationAssessmentId: string | null;
  multiscaleSimulationIntegrationSpecId: string | null;
  populationModellingSpecId: string | null;
  integratedDiseaseContextId: string | null;
  longitudinalModellingSpecId: string | null;
  cohortDefinitionId: string | null;
  rweStudyId: string | null;
  longitudinalClinicalEvidenceSpecId: string | null;
  datasetAvailability: PsmiDatasetAvailability;
  accessClassification: PsmiAccessClassification;
  containsIdentifiablePhi: false;
  notPersonalisedTreatmentEffect: true;
  noClinicalDosing: true;
  notSpecificPatientPredictionUnlessValidated: true;
  researchMeasurementPrioritiesNotClinicalOrders: true;
  noInvasiveTestingWithoutGovernance: true;
  noInventedInfoGainProbabilities: true;
  notDigitalTwinProduct: true;
  notValidatedIndividualOutcomePrediction: true;
  liveMultiscaleEngineOperational: false;
  m11SimulationClaimed: false;
  inventedInfoGainProbability: null;
  lifecycle: PsmiLifecycle;
  reviewedBy: PsmiActor | null;
  authoredBy: PsmiActor;
  dataBasis: PsmiDataBasis;
  fixtureHonesty: boolean;
  honesty: PrecisionScenarioMissingInformationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PrecisionResearchScenario = {
  schema: typeof PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA;
  method: typeof PRECISION_SCENARIO_MISSING_INFORMATION_METHOD;
  version: typeof PRECISION_SCENARIO_MISSING_INFORMATION_VERSION;
  id: string;
  intelligenceSpecId: string;
  diseaseContextId: string;
  scenarioKind: PsmiScenarioKind;
  scenarioDefinition: string;
  keyAssumptions: readonly string[];
  notPersonalisedTreatmentEffect: true;
  noClinicalDosing: true;
  notSpecificPatientPredictionUnlessValidated: true;
  limitations: readonly string[];
  authoredBy: PsmiActor;
  honesty: PrecisionScenarioMissingInformationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ScenarioModelAndContext = {
  schema: typeof PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA;
  method: typeof PRECISION_SCENARIO_MISSING_INFORMATION_METHOD;
  version: typeof PRECISION_SCENARIO_MISSING_INFORMATION_VERSION;
  id: string;
  intelligenceSpecId: string;
  diseaseContextId: string;
  precisionResearchScenarioId: string;
  modelVersion: string;
  supportedBiologicalContext: string;
  contextSummary: string;
  limitations: readonly string[];
  authoredBy: PsmiActor;
  honesty: PrecisionScenarioMissingInformationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ScenarioPredictedOutputs = {
  schema: typeof PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA;
  method: typeof PRECISION_SCENARIO_MISSING_INFORMATION_METHOD;
  version: typeof PRECISION_SCENARIO_MISSING_INFORMATION_VERSION;
  id: string;
  intelligenceSpecId: string;
  diseaseContextId: string;
  precisionResearchScenarioId: string;
  predictedOutputs: readonly string[];
  outputsSummary: string;
  notSpecificPatientPredictionUnlessValidated: true;
  notPersonalisedTreatmentEffect: true;
  validatedForSpecificPatientPurpose: false;
  limitations: readonly string[];
  authoredBy: PsmiActor;
  honesty: PrecisionScenarioMissingInformationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ScenarioUncertaintySensitivity = {
  schema: typeof PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA;
  method: typeof PRECISION_SCENARIO_MISSING_INFORMATION_METHOD;
  version: typeof PRECISION_SCENARIO_MISSING_INFORMATION_VERSION;
  id: string;
  intelligenceSpecId: string;
  diseaseContextId: string;
  precisionResearchScenarioId: string;
  uncertaintyOrdinal: PsmiUncertaintyOrdinal;
  sensitivityOrdinal: PsmiSensitivityOrdinal;
  uncertaintySummary: string;
  sensitivitySummary: string;
  sourcesOfUncertainty: readonly string[];
  sensitivityDrivers: readonly string[];
  limitations: readonly string[];
  authoredBy: PsmiActor;
  honesty: PrecisionScenarioMissingInformationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ScenarioValidationRecommendation = {
  schema: typeof PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA;
  method: typeof PRECISION_SCENARIO_MISSING_INFORMATION_METHOD;
  version: typeof PRECISION_SCENARIO_MISSING_INFORMATION_VERSION;
  id: string;
  intelligenceSpecId: string;
  diseaseContextId: string;
  precisionResearchScenarioId: string;
  recommendedValidationSteps: readonly string[];
  scenarioLimitations: readonly string[];
  validationSummary: string;
  researchOnly: true;
  notClinicalOrder: true;
  limitations: readonly string[];
  authoredBy: PsmiActor;
  honesty: PrecisionScenarioMissingInformationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MissingInformationAssessmentEnvelope = {
  schema: typeof PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA;
  method: typeof PRECISION_SCENARIO_MISSING_INFORMATION_METHOD;
  version: typeof PRECISION_SCENARIO_MISSING_INFORMATION_VERSION;
  id: string;
  intelligenceSpecId: string;
  diseaseContextId: string;
  pcrmMissingInformationAssessmentId: string | null;
  missingMeasurementIds: readonly string[];
  dataQualityGaps: readonly string[];
  modelInputRequirements: readonly string[];
  assessmentSummary: string;
  inventedValues: null;
  researchMeasurementPrioritiesNotClinicalOrders: true;
  limitations: readonly string[];
  authoredBy: PsmiActor;
  honesty: PrecisionScenarioMissingInformationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MissingVariableResearchValue = {
  schema: typeof PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA;
  method: typeof PRECISION_SCENARIO_MISSING_INFORMATION_METHOD;
  version: typeof PRECISION_SCENARIO_MISSING_INFORMATION_VERSION;
  id: string;
  intelligenceSpecId: string;
  diseaseContextId: string;
  missingInformationAssessmentId: string;
  missingVariableIds: readonly string[];
  sensitivityToMissingVariables: PsmiSensitivityOrdinal;
  sensitivitySummary: string;
  infoValueStatus: PsmiInfoValueStatus;
  quantifiableInfoValueSummary: string | null;
  inventedInfoGainProbability: null;
  limitations: readonly string[];
  authoredBy: PsmiActor;
  honesty: PrecisionScenarioMissingInformationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type FollowUpAndExperimentalValidation = {
  schema: typeof PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA;
  method: typeof PRECISION_SCENARIO_MISSING_INFORMATION_METHOD;
  version: typeof PRECISION_SCENARIO_MISSING_INFORMATION_VERSION;
  id: string;
  intelligenceSpecId: string;
  diseaseContextId: string;
  missingInformationAssessmentId: string | null;
  candidateFollowUpMeasurements: readonly string[];
  experimentalValidationRecommendations: readonly string[];
  researchMeasurementPriorities: readonly string[];
  comparisonSummary: string;
  researchMeasurementPrioritiesNotClinicalOrders: true;
  invasiveTestingGovernanceStatus: PsmiInvasiveGovernanceStatus;
  noInvasiveTestingWithoutGovernance: true;
  limitations: readonly string[];
  authoredBy: PsmiActor;
  honesty: PrecisionScenarioMissingInformationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PrecisionScenarioMissingInformationBundle = {
  schema: typeof PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA;
  method: typeof PRECISION_SCENARIO_MISSING_INFORMATION_METHOD;
  version: typeof PRECISION_SCENARIO_MISSING_INFORMATION_VERSION;
  id: string;
  displayName: string;
  diseaseContextId: string;
  intelligenceSpecId: string;
  precisionResearchScenarioIds: readonly string[];
  scenarioModelAndContextIds: readonly string[];
  scenarioPredictedOutputIds: readonly string[];
  scenarioUncertaintySensitivityIds: readonly string[];
  scenarioValidationRecommendationIds: readonly string[];
  missingInformationAssessmentIds: readonly string[];
  missingVariableResearchValueIds: readonly string[];
  followUpAndExperimentalValidationIds: readonly string[];
  scenarioKindIdsByKind: Readonly<Record<PsmiScenarioKind, readonly string[]>>;
  bundleVersion: string;
  limitations: readonly string[];
  datasetAvailability: PsmiDatasetAvailability;
  notPersonalisedTreatmentEffect: true;
  noClinicalDosing: true;
  notSpecificPatientPredictionUnlessValidated: true;
  researchMeasurementPrioritiesNotClinicalOrders: true;
  noInvasiveTestingWithoutGovernance: true;
  noInventedInfoGainProbabilities: true;
  notDigitalTwinProduct: true;
  notValidatedIndividualOutcomePrediction: true;
  liveMultiscaleEngineOperational: false;
  m11SimulationClaimed: false;
  inventedInfoGainProbability: null;
  graphPromotable: false;
  lifecycle: PsmiLifecycle;
  reviewedBy: PsmiActor | null;
  authoredBy: PsmiActor;
  dataBasis: PsmiDataBasis;
  fixtureHonesty: boolean;
  honesty: PrecisionScenarioMissingInformationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PrecisionScenarioMissingInformationStore = {
  upsertSpec(record: PrecisionScenarioMissingInformationSpec): PrecisionScenarioMissingInformationSpec;
  getSpec(id: string): PrecisionScenarioMissingInformationSpec | null;
  listSpecs(diseaseContextId?: string): readonly PrecisionScenarioMissingInformationSpec[];
  upsertPrecisionResearchScenario(record: PrecisionResearchScenario): PrecisionResearchScenario;
  getPrecisionResearchScenario(id: string): PrecisionResearchScenario | null;
  listPrecisionResearchScenarios(diseaseContextId?: string): readonly PrecisionResearchScenario[];
  upsertScenarioModelAndContext(record: ScenarioModelAndContext): ScenarioModelAndContext;
  getScenarioModelAndContext(id: string): ScenarioModelAndContext | null;
  listScenarioModelAndContexts(diseaseContextId?: string): readonly ScenarioModelAndContext[];
  upsertScenarioPredictedOutputs(record: ScenarioPredictedOutputs): ScenarioPredictedOutputs;
  getScenarioPredictedOutputs(id: string): ScenarioPredictedOutputs | null;
  listScenarioPredictedOutputs(diseaseContextId?: string): readonly ScenarioPredictedOutputs[];
  upsertScenarioUncertaintySensitivity(record: ScenarioUncertaintySensitivity): ScenarioUncertaintySensitivity;
  getScenarioUncertaintySensitivity(id: string): ScenarioUncertaintySensitivity | null;
  listScenarioUncertaintySensitivities(diseaseContextId?: string): readonly ScenarioUncertaintySensitivity[];
  upsertScenarioValidationRecommendation(record: ScenarioValidationRecommendation): ScenarioValidationRecommendation;
  getScenarioValidationRecommendation(id: string): ScenarioValidationRecommendation | null;
  listScenarioValidationRecommendations(diseaseContextId?: string): readonly ScenarioValidationRecommendation[];
  upsertMissingInformationAssessment(record: MissingInformationAssessmentEnvelope): MissingInformationAssessmentEnvelope;
  getMissingInformationAssessment(id: string): MissingInformationAssessmentEnvelope | null;
  listMissingInformationAssessments(diseaseContextId?: string): readonly MissingInformationAssessmentEnvelope[];
  upsertMissingVariableResearchValue(record: MissingVariableResearchValue): MissingVariableResearchValue;
  getMissingVariableResearchValue(id: string): MissingVariableResearchValue | null;
  listMissingVariableResearchValues(diseaseContextId?: string): readonly MissingVariableResearchValue[];
  upsertFollowUpAndExperimentalValidation(record: FollowUpAndExperimentalValidation): FollowUpAndExperimentalValidation;
  getFollowUpAndExperimentalValidation(id: string): FollowUpAndExperimentalValidation | null;
  listFollowUpAndExperimentalValidations(diseaseContextId?: string): readonly FollowUpAndExperimentalValidation[];
  upsertBundle(record: PrecisionScenarioMissingInformationBundle): PrecisionScenarioMissingInformationBundle;
  getBundle(id: string): PrecisionScenarioMissingInformationBundle | null;
  listBundles(diseaseContextId?: string): readonly PrecisionScenarioMissingInformationBundle[];
};

const DEFAULT_HONESTY: PrecisionScenarioMissingInformationHonesty = {
  researchDecisionSupportOnly: true,
  notPersonalisedTreatmentEffect: true,
  noClinicalDosing: true,
  notSpecificPatientPredictionUnlessValidated: true,
  researchMeasurementPrioritiesNotClinicalOrders: true,
  noInvasiveTestingWithoutGovernance: true,
  noInventedInfoGainProbabilities: true,
  notDigitalTwinProduct: true,
  notValidatedIndividualOutcomePrediction: true,
  liveMultiscaleEngineOperational: false,
  m11SimulationClaimed: false,
  populationAssociationIsNotIndividualTruth: true,
  observedIsNotInferred: true,
  noPhiIngestion: true,
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

const SPEC_TRANSITIONS: Record<PsmiLifecycle, readonly PsmiLifecycle[]> = {
  draft: [
    "under_review",
    "blocked_awaiting_authorised_dataset",
    "blocked_personalised_treatment_effect_claim",
    "blocked_clinical_dosing_claim",
    "blocked_specific_patient_prediction_claim",
    "blocked_invented_info_gain",
    "blocked_invasive_testing_without_governance",
    "rejected",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_awaiting_authorised_dataset",
    "blocked_personalised_treatment_effect_claim",
    "blocked_clinical_dosing_claim",
    "blocked_specific_patient_prediction_claim",
    "blocked_invented_info_gain",
    "blocked_invasive_testing_without_governance",
    "rejected",
    "draft",
  ],
  accepted_with_limitations: ["superseded"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
  blocked_personalised_treatment_effect_claim: ["draft", "rejected"],
  blocked_clinical_dosing_claim: ["draft", "rejected"],
  blocked_specific_patient_prediction_claim: ["draft", "rejected"],
  blocked_invented_info_gain: ["draft", "rejected"],
  blocked_invasive_testing_without_governance: ["draft", "rejected"],
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
function assertClosed<T extends string>(value: T, allowed: readonly T[], label: string): void {
  if (!allowed.includes(value)) throw Error(`Invalid ${label}`);
}
function assertHonesty(honesty: PrecisionScenarioMissingInformationHonesty): void {
  if (honesty.researchDecisionSupportOnly !== true) throw Error("Research decision support only");
  if (honesty.notPersonalisedTreatmentEffect !== true) throw Error("Not a personalised treatment effect");
  if (honesty.noClinicalDosing !== true) throw Error("Clinical dosing forbidden");
  if (honesty.notSpecificPatientPredictionUnlessValidated !== true) {
    throw Error("Must not claim specific-patient prediction unless validated for that purpose");
  }
  if (honesty.researchMeasurementPrioritiesNotClinicalOrders !== true) {
    throw Error("Research measurement priorities are not clinical orders");
  }
  if (honesty.noInvasiveTestingWithoutGovernance !== true) throw Error("Invasive testing without governance forbidden");
  if (honesty.noInventedInfoGainProbabilities !== true) throw Error("Invented info-gain probabilities forbidden");
  if (honesty.notDigitalTwinProduct !== true) throw Error("Not a digital twin product");
  if (honesty.notValidatedIndividualOutcomePrediction !== true) {
    throw Error("Must not claim validated individual outcome prediction");
  }
  if (honesty.liveMultiscaleEngineOperational !== false) throw Error("Live multiscale engine forbidden");
  if (honesty.m11SimulationClaimed !== false) throw Error("M11 simulation claims forbidden");
  if (honesty.populationAssociationIsNotIndividualTruth !== true) {
    throw Error("Population association is not individual truth");
  }
  if (honesty.observedIsNotInferred !== true) throw Error("Observed must stay distinct from inferred");
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noAutonomousDiagnosisOrPrescribing !== true) throw Error("Autonomous diagnosis/prescribing forbidden");
  if (honesty.noWorkbenchUi !== true) throw Error("Workbench UI forbidden in PR8");
  if (honesty.agentsDraftHumansReview !== true) throw Error("Agents draft; humans review");
  if (honesty.gateCAutoApprove !== false) throw Error("Gate C auto-approve forbidden");
  if (honesty.mouInvented !== false) throw Error("MoU must not be invented");
  if (honesty.phiCdsWired !== false) throw Error("PHI/CDS must stay unwired");
  if (honesty.scientificApproval !== false) throw Error("Scientific approval must stay false in PR8");
  if (honesty.graphPromotable !== false) throw Error("Graph promotion forbidden");
  if (honesty.neonProjectPolicy !== "red-wave-only") throw Error("Neon red-wave only");
  if (honesty.migration !== "deferred") throw Error("Migration must stay deferred");
}
function assertNoForbiddenClaimLanguage(text: string, label: string): void {
  const lower = text
    .toLowerCase()
    .replace(
      /\b(?:not|no|without|never|does\s+not|do\s+not|must\s+not|refusing|refuse|forbidding|forbid|avoid(?:ing)?)\s+(?:a\s+|an\s+|the\s+|claim(?:ing)?\s+|present(?:ing)?\s+|invent(?:ed|ing)?\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|clinical\s+dos(?:e|ing)|personalised\s+treatment\s+effect|specific\s+patient\s+prediction|validated\s+individual\s+outcome\s+prediction|digital\s+twin(?:\s+product)?|clinical\s+order|invasive\s+testing\s+without\s+governance|invented\s+info(?:-|\s)?gain(?:\s+probabilities?)?|info(?:-|\s)?gain\s+probabilities?)/g,
      " ",
    );
  if (
    /\bdiagnos(e|is|ing)\b/.test(lower) ||
    /\bprescribe\b/.test(lower) ||
    /\bclinical\s+dos(?:e|ing)\b/.test(lower) ||
    /\bpersonalised\s+treatment\s+effect\b/.test(lower) ||
    /\bspecific\s+patient\s+prediction\b/.test(lower) ||
    /\bvalidated\s+individual\s+outcome\s+prediction\b/.test(lower) ||
    /\bdigital\s+twin(?:\s+product)?\b/.test(lower) ||
    /\bclinical\s+order\b/.test(lower) ||
    /\binvasive\s+testing\s+without\s+governance\b/.test(lower) ||
    /\binvent(?:ed|ing)\s+info(?:-|\s)?gain\b/.test(lower) ||
    /\binfo(?:-|\s)?gain\s+probabilit/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower)
  ) {
    throw Error(
      `${label} must not diagnose/prescribe, claim clinical dosing, personalised treatment effect, specific-patient prediction, twin product, clinical orders, invented info-gain probabilities, invent counts, or include identifiers`,
    );
  }
}
function assertActor(actor: PsmiActor, label: string): PsmiActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) throw Error(`Invalid ${label} principalId`);
  assertClosed(actor.actorKind, PSMI_ACTOR_KINDS, `${label} actorKind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}
function assertOptionalId(value: string | null | undefined, re: RegExp, label: string): string | null {
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
function assertIdList(values: readonly string[], re: RegExp, label: string, maxItems: number): readonly string[] {
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  return values.map((v) => {
    if (!re.test(v)) throw Error(`Invalid ${label}`);
    return v;
  });
}
function assertStringList(values: readonly string[], label: string, maxItems: number, maxLen: number): readonly string[] {
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  return values.map((item, index) => {
    if (!textOk(item, maxLen)) throw Error(`Invalid ${label}[${index}]`);
    assertNoForbiddenClaimLanguage(item, `${label}[${index}]`);
    return item.trim();
  });
}
function dataBasisForAvailability(availability: PsmiDatasetAvailability): PsmiDataBasis {
  if (availability === "authorised_declared") return "declared_research";
  return "fixture_engineering";
}

export function isQuantifiableInfoValue(status: PsmiInfoValueStatus): boolean {
  return status === "quantifiable_declared";
}
export function isBlockedInfoValue(status: PsmiInfoValueStatus): boolean {
  return status === "blocked_invented_probability";
}
export function requiresInvasiveGovernance(status: PsmiInvasiveGovernanceStatus): boolean {
  return status === "governance_required_declared" || status === "blocked_without_governance";
}
export function emptyScenarioKindIndex(): Record<PsmiScenarioKind, readonly string[]> {
  return {
    alternative_biological_mechanism_assumptions: [],
    disease_trajectory_model_comparison: [],
    biomarker_measurement_scenarios: [],
    model_parameter_sensitivity: [],
    cohort_subgroup_comparisons: [],
    hypothetical_pathway_perturbations: [],
    alternative_monitoring_schedules: [],
  };
}

export function draftPrecisionScenarioMissingInformationSpec(input: {
  id: string;
  displayName: string;
  scientificQuestion: string;
  capabilityKinds?: readonly PsmiCapabilityKind[];
  diseaseContextId: string;
  simulationScenarioId?: string | null;
  digitalPatientModelId?: string | null;
  patientContextualisedResearchSpecId?: string | null;
  pcrmMissingInformationAssessmentId?: string | null;
  multiscaleSimulationIntegrationSpecId?: string | null;
  populationModellingSpecId?: string | null;
  integratedDiseaseContextId?: string | null;
  longitudinalModellingSpecId?: string | null;
  cohortDefinitionId?: string | null;
  rweStudyId?: string | null;
  longitudinalClinicalEvidenceSpecId?: string | null;
  datasetAvailability: PsmiDatasetAvailability;
  accessClassification?: PsmiAccessClassification;
  authoredByPrincipalId: string;
  authoredByActorKind?: PsmiActorKind;
  createdAt: string;
  note?: string;
}): PrecisionScenarioMissingInformationSpec {
  if (!SPEC_ID_RE.test(input.id)) throw Error("Invalid intelligence spec id");
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!textOk(input.scientificQuestion, 2000)) throw Error("Invalid scientificQuestion");
  assertNoForbiddenClaimLanguage(input.scientificQuestion, "scientificQuestion");
  if (!HDI_CTX_RE.test(input.diseaseContextId)) throw Error("Invalid diseaseContextId");
  assertClosed(input.datasetAvailability, PSMI_DATASET_AVAILABILITY, "datasetAvailability");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const capabilityKinds =
    input.capabilityKinds && input.capabilityKinds.length > 0
      ? [...new Set(input.capabilityKinds)]
      : [...PSMI_CAPABILITY_KINDS];
  for (const kind of capabilityKinds) assertClosed(kind, PSMI_CAPABILITY_KINDS, "capabilityKind");
  const accessClassification =
    input.accessClassification ??
    (input.datasetAvailability === "authorised_declared"
      ? "authorised_pseudonymous_research"
      : input.datasetAvailability === "fixture_only"
        ? "fixture_engineering"
        : "restricted_not_ingested");
  assertClosed(accessClassification, PSMI_ACCESS_CLASSIFICATIONS, "accessClassification");
  const lifecycle: PsmiLifecycle =
    input.datasetAvailability === "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";
  const record: PrecisionScenarioMissingInformationSpec = {
    schema: PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
    method: PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
    version: PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    capabilityKinds,
    diseaseContextId: input.diseaseContextId,
    simulationScenarioId: assertOptionalId(input.simulationScenarioId, HDI_SIM_RE, "simulationScenarioId"),
    digitalPatientModelId: assertOptionalId(input.digitalPatientModelId, HDI_DPM_RE, "digitalPatientModelId"),
    patientContextualisedResearchSpecId: assertOptionalId(
      input.patientContextualisedResearchSpecId, PCRM_SPEC_RE, "patientContextualisedResearchSpecId",
    ),
    pcrmMissingInformationAssessmentId: assertOptionalId(
      input.pcrmMissingInformationAssessmentId, PCRM_MIA_RE, "pcrmMissingInformationAssessmentId",
    ),
    multiscaleSimulationIntegrationSpecId: assertOptionalId(
      input.multiscaleSimulationIntegrationSpecId, MSI_SPEC_RE, "multiscaleSimulationIntegrationSpecId",
    ),
    populationModellingSpecId: assertOptionalId(input.populationModellingSpecId, PCDM_SPEC_RE, "populationModellingSpecId"),
    integratedDiseaseContextId: assertOptionalId(input.integratedDiseaseContextId, CBC_IDC_RE, "integratedDiseaseContextId"),
    longitudinalModellingSpecId: assertOptionalId(input.longitudinalModellingSpecId, LDSM_SPEC_RE, "longitudinalModellingSpecId"),
    cohortDefinitionId: assertOptionalId(input.cohortDefinitionId, RCB_COH_RE, "cohortDefinitionId"),
    rweStudyId: assertOptionalId(input.rweStudyId, RWE_STUDY_RE, "rweStudyId"),
    longitudinalClinicalEvidenceSpecId: assertOptionalId(
      input.longitudinalClinicalEvidenceSpecId, LCE_SPEC_RE, "longitudinalClinicalEvidenceSpecId",
    ),
    datasetAvailability: input.datasetAvailability,
    accessClassification,
    containsIdentifiablePhi: false,
    notPersonalisedTreatmentEffect: true,
    noClinicalDosing: true,
    notSpecificPatientPredictionUnlessValidated: true,
    researchMeasurementPrioritiesNotClinicalOrders: true,
    noInvasiveTestingWithoutGovernance: true,
    noInventedInfoGainProbabilities: true,
    notDigitalTwinProduct: true,
    notValidatedIndividualOutcomePrediction: true,
    liveMultiscaleEngineOperational: false,
    m11SimulationClaimed: false,
    inventedInfoGainProbability: null,
    lifecycle,
    reviewedBy: null,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind: input.authoredByActorKind ?? "ai_agent"},
      "authoredBy",
    ),
    dataBasis: dataBasisForAvailability(input.datasetAvailability),
    fixtureHonesty: input.datasetAvailability !== "authorised_declared",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validatePrecisionScenarioMissingInformationSpec(record);
}

export function validatePrecisionScenarioMissingInformationSpec(
  record: PrecisionScenarioMissingInformationSpec,
): PrecisionScenarioMissingInformationSpec {
  if (!SPEC_ID_RE.test(record.id)) throw Error("Invalid intelligence spec id");
  if (!HDI_CTX_RE.test(record.diseaseContextId)) throw Error("Invalid diseaseContextId");
  assertClosed(record.lifecycle, PSMI_LIFECYCLES, "lifecycle");
  assertClosed(record.datasetAvailability, PSMI_DATASET_AVAILABILITY, "datasetAvailability");
  assertClosed(record.accessClassification, PSMI_ACCESS_CLASSIFICATIONS, "accessClassification");
  assertClosed(record.dataBasis, PSMI_DATA_BASES, "dataBasis");
  if (record.containsIdentifiablePhi !== false) throw Error("Identifiable PHI forbidden");
  if (record.notPersonalisedTreatmentEffect !== true) throw Error("Must declare not personalised treatment effect");
  if (record.noClinicalDosing !== true) throw Error("Must declare no clinical dosing");
  if (record.notSpecificPatientPredictionUnlessValidated !== true) throw Error("Must declare specific-patient prediction gate");
  if (record.researchMeasurementPrioritiesNotClinicalOrders !== true) {
    throw Error("Must declare research priorities are not clinical orders");
  }
  if (record.noInvasiveTestingWithoutGovernance !== true) throw Error("Must declare invasive-testing governance gate");
  if (record.noInventedInfoGainProbabilities !== true) throw Error("Must declare no invented info-gain probabilities");
  if (record.inventedInfoGainProbability !== null) throw Error("Invented info-gain probability forbidden");
  if (record.liveMultiscaleEngineOperational !== false) throw Error("Live multiscale engine must stay false");
  if (record.m11SimulationClaimed !== false) throw Error("M11 simulation claims forbidden");
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  return record;
}

export function transitionPrecisionScenarioMissingInformationSpec(input: {
  spec: PrecisionScenarioMissingInformationSpec;
  to: PsmiLifecycle;
  updatedAt: string;
  actor: PsmiActor;
}): PrecisionScenarioMissingInformationSpec {
  const current = validatePrecisionScenarioMissingInformationSpec(input.spec);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = SPEC_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(`Illegal lifecycle transition ${current.lifecycle} -> ${input.to}`);
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
  return validatePrecisionScenarioMissingInformationSpec({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected" ? actor : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftPrecisionResearchScenario(input: {
  id: string;
  intelligenceSpec: PrecisionScenarioMissingInformationSpec;
  scenarioKind: PsmiScenarioKind;
  scenarioDefinition: string;
  keyAssumptions: readonly string[];
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PsmiActorKind;
  createdAt: string;
  note?: string;
}): PrecisionResearchScenario {
  if (!SCN_ID_RE.test(input.id)) throw Error("Invalid precision research scenario id");
  const spec = validatePrecisionScenarioMissingInformationSpec(input.intelligenceSpec);
  assertClosed(input.scenarioKind, PSMI_SCENARIO_KINDS, "scenarioKind");
  if (!textOk(input.scenarioDefinition, 2000)) throw Error("Invalid scenarioDefinition");
  assertNoForbiddenClaimLanguage(input.scenarioDefinition, "scenarioDefinition");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const keyAssumptions = assertStringList(input.keyAssumptions, "keyAssumptions", 12, 500);
  if (keyAssumptions.length === 0) throw Error("keyAssumptions required");
  const record: PrecisionResearchScenario = {
    schema: PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
    method: PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
    version: PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
    id: input.id,
    intelligenceSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    scenarioKind: input.scenarioKind,
    scenarioDefinition: input.scenarioDefinition.trim(),
    keyAssumptions,
    notPersonalisedTreatmentEffect: true,
    noClinicalDosing: true,
    notSpecificPatientPredictionUnlessValidated: true,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind: input.authoredByActorKind ?? "ai_agent"},
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validatePrecisionResearchScenario(record);
}

export function validatePrecisionResearchScenario(record: PrecisionResearchScenario): PrecisionResearchScenario {
  if (!SCN_ID_RE.test(record.id)) throw Error("Invalid precision research scenario id");
  if (!SPEC_ID_RE.test(record.intelligenceSpecId)) throw Error("Invalid intelligenceSpecId");
  if (!HDI_CTX_RE.test(record.diseaseContextId)) throw Error("Invalid diseaseContextId");
  assertClosed(record.scenarioKind, PSMI_SCENARIO_KINDS, "scenarioKind");
  if (record.notPersonalisedTreatmentEffect !== true) throw Error("Must declare not personalised treatment effect");
  if (record.noClinicalDosing !== true) throw Error("Must declare no clinical dosing");
  if (record.notSpecificPatientPredictionUnlessValidated !== true) throw Error("Must declare specific-patient prediction gate");
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftScenarioModelAndContext(input: {
  id: string;
  intelligenceSpec: PrecisionScenarioMissingInformationSpec;
  precisionResearchScenario: PrecisionResearchScenario;
  modelVersion: string;
  supportedBiologicalContext: string;
  contextSummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PsmiActorKind;
  createdAt: string;
  note?: string;
}): ScenarioModelAndContext {
  if (!CTX_ID_RE.test(input.id)) throw Error("Invalid scenario model and context id");
  const spec = validatePrecisionScenarioMissingInformationSpec(input.intelligenceSpec);
  const scenario = validatePrecisionResearchScenario(input.precisionResearchScenario);
  if (scenario.intelligenceSpecId !== spec.id) throw Error("Scenario must belong to intelligence spec");
  if (!textOk(input.modelVersion, 80)) throw Error("Invalid modelVersion");
  assertNoForbiddenClaimLanguage(input.modelVersion, "modelVersion");
  if (!textOk(input.supportedBiologicalContext, 1000)) throw Error("Invalid supportedBiologicalContext");
  assertNoForbiddenClaimLanguage(input.supportedBiologicalContext, "supportedBiologicalContext");
  if (!textOk(input.contextSummary, 1000)) throw Error("Invalid contextSummary");
  assertNoForbiddenClaimLanguage(input.contextSummary, "contextSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const record: ScenarioModelAndContext = {
    schema: PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
    method: PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
    version: PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
    id: input.id,
    intelligenceSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    precisionResearchScenarioId: scenario.id,
    modelVersion: input.modelVersion.trim(),
    supportedBiologicalContext: input.supportedBiologicalContext.trim(),
    contextSummary: input.contextSummary.trim(),
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind: input.authoredByActorKind ?? "ai_agent"},
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateScenarioModelAndContext(record);
}

export function validateScenarioModelAndContext(record: ScenarioModelAndContext): ScenarioModelAndContext {
  if (!CTX_ID_RE.test(record.id)) throw Error("Invalid scenario model and context id");
  if (!SPEC_ID_RE.test(record.intelligenceSpecId)) throw Error("Invalid intelligenceSpecId");
  if (!SCN_ID_RE.test(record.precisionResearchScenarioId)) throw Error("Invalid precisionResearchScenarioId");
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftScenarioPredictedOutputs(input: {
  id: string;
  intelligenceSpec: PrecisionScenarioMissingInformationSpec;
  precisionResearchScenario: PrecisionResearchScenario;
  predictedOutputs: readonly string[];
  outputsSummary: string;
  validatedForSpecificPatientPurpose?: false;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PsmiActorKind;
  createdAt: string;
  note?: string;
}): ScenarioPredictedOutputs {
  if (!OUT_ID_RE.test(input.id)) throw Error("Invalid scenario predicted outputs id");
  const spec = validatePrecisionScenarioMissingInformationSpec(input.intelligenceSpec);
  const scenario = validatePrecisionResearchScenario(input.precisionResearchScenario);
  if (scenario.intelligenceSpecId !== spec.id) throw Error("Scenario must belong to intelligence spec");
  const predictedOutputs = assertStringList(input.predictedOutputs, "predictedOutputs", 12, 500);
  if (predictedOutputs.length === 0) throw Error("predictedOutputs required");
  if (!textOk(input.outputsSummary, 1000)) throw Error("Invalid outputsSummary");
  assertNoForbiddenClaimLanguage(input.outputsSummary, "outputsSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (input.validatedForSpecificPatientPurpose !== undefined && input.validatedForSpecificPatientPurpose !== false) {
    throw Error("Specific-patient prediction purpose must stay unvalidated in PR8 fixtures");
  }
  const record: ScenarioPredictedOutputs = {
    schema: PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
    method: PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
    version: PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
    id: input.id,
    intelligenceSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    precisionResearchScenarioId: scenario.id,
    predictedOutputs,
    outputsSummary: input.outputsSummary.trim(),
    notSpecificPatientPredictionUnlessValidated: true,
    notPersonalisedTreatmentEffect: true,
    validatedForSpecificPatientPurpose: false,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind: input.authoredByActorKind ?? "ai_agent"},
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateScenarioPredictedOutputs(record);
}

export function validateScenarioPredictedOutputs(record: ScenarioPredictedOutputs): ScenarioPredictedOutputs {
  if (!OUT_ID_RE.test(record.id)) throw Error("Invalid scenario predicted outputs id");
  if (record.validatedForSpecificPatientPurpose !== false) throw Error("Specific-patient prediction purpose must stay false");
  if (record.notSpecificPatientPredictionUnlessValidated !== true) throw Error("Must declare specific-patient prediction gate");
  if (record.notPersonalisedTreatmentEffect !== true) throw Error("Must declare not personalised treatment effect");
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftScenarioUncertaintySensitivity(input: {
  id: string;
  intelligenceSpec: PrecisionScenarioMissingInformationSpec;
  precisionResearchScenario: PrecisionResearchScenario;
  uncertaintyOrdinal: PsmiUncertaintyOrdinal;
  sensitivityOrdinal: PsmiSensitivityOrdinal;
  uncertaintySummary: string;
  sensitivitySummary: string;
  sourcesOfUncertainty: readonly string[];
  sensitivityDrivers: readonly string[];
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PsmiActorKind;
  createdAt: string;
  note?: string;
}): ScenarioUncertaintySensitivity {
  if (!UNC_ID_RE.test(input.id)) throw Error("Invalid scenario uncertainty sensitivity id");
  const spec = validatePrecisionScenarioMissingInformationSpec(input.intelligenceSpec);
  const scenario = validatePrecisionResearchScenario(input.precisionResearchScenario);
  if (scenario.intelligenceSpecId !== spec.id) throw Error("Scenario must belong to intelligence spec");
  assertClosed(input.uncertaintyOrdinal, PSMI_UNCERTAINTY_ORDINALS, "uncertaintyOrdinal");
  assertClosed(input.sensitivityOrdinal, PSMI_SENSITIVITY_ORDINALS, "sensitivityOrdinal");
  if (!textOk(input.uncertaintySummary, 1000)) throw Error("Invalid uncertaintySummary");
  assertNoForbiddenClaimLanguage(input.uncertaintySummary, "uncertaintySummary");
  if (!textOk(input.sensitivitySummary, 1000)) throw Error("Invalid sensitivitySummary");
  assertNoForbiddenClaimLanguage(input.sensitivitySummary, "sensitivitySummary");
  const sourcesOfUncertainty = assertStringList(input.sourcesOfUncertainty, "sourcesOfUncertainty", 12, 300);
  if (sourcesOfUncertainty.length === 0) throw Error("sourcesOfUncertainty required");
  const sensitivityDrivers = assertStringList(input.sensitivityDrivers, "sensitivityDrivers", 12, 300);
  if (sensitivityDrivers.length === 0) throw Error("sensitivityDrivers required");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const record: ScenarioUncertaintySensitivity = {
    schema: PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
    method: PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
    version: PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
    id: input.id,
    intelligenceSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    precisionResearchScenarioId: scenario.id,
    uncertaintyOrdinal: input.uncertaintyOrdinal,
    sensitivityOrdinal: input.sensitivityOrdinal,
    uncertaintySummary: input.uncertaintySummary.trim(),
    sensitivitySummary: input.sensitivitySummary.trim(),
    sourcesOfUncertainty,
    sensitivityDrivers,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind: input.authoredByActorKind ?? "ai_agent"},
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateScenarioUncertaintySensitivity(record);
}

export function validateScenarioUncertaintySensitivity(
  record: ScenarioUncertaintySensitivity,
): ScenarioUncertaintySensitivity {
  if (!UNC_ID_RE.test(record.id)) throw Error("Invalid scenario uncertainty sensitivity id");
  assertClosed(record.uncertaintyOrdinal, PSMI_UNCERTAINTY_ORDINALS, "uncertaintyOrdinal");
  assertClosed(record.sensitivityOrdinal, PSMI_SENSITIVITY_ORDINALS, "sensitivityOrdinal");
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftScenarioValidationRecommendation(input: {
  id: string;
  intelligenceSpec: PrecisionScenarioMissingInformationSpec;
  precisionResearchScenario: PrecisionResearchScenario;
  recommendedValidationSteps: readonly string[];
  scenarioLimitations: readonly string[];
  validationSummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PsmiActorKind;
  createdAt: string;
  note?: string;
}): ScenarioValidationRecommendation {
  if (!VAL_ID_RE.test(input.id)) throw Error("Invalid scenario validation recommendation id");
  const spec = validatePrecisionScenarioMissingInformationSpec(input.intelligenceSpec);
  const scenario = validatePrecisionResearchScenario(input.precisionResearchScenario);
  if (scenario.intelligenceSpecId !== spec.id) throw Error("Scenario must belong to intelligence spec");
  const recommendedValidationSteps = assertStringList(
    input.recommendedValidationSteps, "recommendedValidationSteps", 12, 500,
  );
  if (recommendedValidationSteps.length === 0) throw Error("recommendedValidationSteps required");
  const scenarioLimitations = assertStringList(input.scenarioLimitations, "scenarioLimitations", 12, 500);
  if (scenarioLimitations.length === 0) throw Error("scenarioLimitations required");
  if (!textOk(input.validationSummary, 1000)) throw Error("Invalid validationSummary");
  assertNoForbiddenClaimLanguage(input.validationSummary, "validationSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const record: ScenarioValidationRecommendation = {
    schema: PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
    method: PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
    version: PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
    id: input.id,
    intelligenceSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    precisionResearchScenarioId: scenario.id,
    recommendedValidationSteps,
    scenarioLimitations,
    validationSummary: input.validationSummary.trim(),
    researchOnly: true,
    notClinicalOrder: true,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind: input.authoredByActorKind ?? "ai_agent"},
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateScenarioValidationRecommendation(record);
}

export function validateScenarioValidationRecommendation(
  record: ScenarioValidationRecommendation,
): ScenarioValidationRecommendation {
  if (!VAL_ID_RE.test(record.id)) throw Error("Invalid scenario validation recommendation id");
  if (record.researchOnly !== true) throw Error("Must stay research-only");
  if (record.notClinicalOrder !== true) throw Error("Must declare not a clinical order");
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftMissingInformationAssessmentEnvelope(input: {
  id: string;
  intelligenceSpec: PrecisionScenarioMissingInformationSpec;
  pcrmMissingInformationAssessmentId?: string | null;
  missingMeasurementIds: readonly string[];
  dataQualityGaps: readonly string[];
  modelInputRequirements: readonly string[];
  assessmentSummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PsmiActorKind;
  createdAt: string;
  note?: string;
}): MissingInformationAssessmentEnvelope {
  if (!MIA_ID_RE.test(input.id)) throw Error("Invalid missing information assessment id");
  const spec = validatePrecisionScenarioMissingInformationSpec(input.intelligenceSpec);
  const missingMeasurementIds = assertIdList(input.missingMeasurementIds, REF_ID_RE, "missingMeasurementIds", 24);
  if (missingMeasurementIds.length === 0) throw Error("missingMeasurementIds required");
  const dataQualityGaps = assertStringList(input.dataQualityGaps, "dataQualityGaps", 12, 500);
  if (dataQualityGaps.length === 0) throw Error("dataQualityGaps required");
  const modelInputRequirements = assertStringList(
    input.modelInputRequirements, "modelInputRequirements", 12, 500,
  );
  if (modelInputRequirements.length === 0) throw Error("modelInputRequirements required");
  if (!textOk(input.assessmentSummary, 1000)) throw Error("Invalid assessmentSummary");
  assertNoForbiddenClaimLanguage(input.assessmentSummary, "assessmentSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const record: MissingInformationAssessmentEnvelope = {
    schema: PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
    method: PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
    version: PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
    id: input.id,
    intelligenceSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    pcrmMissingInformationAssessmentId: assertOptionalId(
      input.pcrmMissingInformationAssessmentId, PCRM_MIA_RE, "pcrmMissingInformationAssessmentId",
    ),
    missingMeasurementIds,
    dataQualityGaps,
    modelInputRequirements,
    assessmentSummary: input.assessmentSummary.trim(),
    inventedValues: null,
    researchMeasurementPrioritiesNotClinicalOrders: true,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind: input.authoredByActorKind ?? "ai_agent"},
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateMissingInformationAssessmentEnvelope(record);
}

export function validateMissingInformationAssessmentEnvelope(
  record: MissingInformationAssessmentEnvelope,
): MissingInformationAssessmentEnvelope {
  if (!MIA_ID_RE.test(record.id)) throw Error("Invalid missing information assessment id");
  if (record.inventedValues !== null) throw Error("Invented values forbidden");
  if (record.researchMeasurementPrioritiesNotClinicalOrders !== true) {
    throw Error("Must declare research priorities are not clinical orders");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftMissingVariableResearchValue(input: {
  id: string;
  intelligenceSpec: PrecisionScenarioMissingInformationSpec;
  missingInformationAssessment: MissingInformationAssessmentEnvelope;
  missingVariableIds: readonly string[];
  sensitivityToMissingVariables: PsmiSensitivityOrdinal;
  sensitivitySummary: string;
  infoValueStatus: PsmiInfoValueStatus;
  quantifiableInfoValueSummary?: string | null;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PsmiActorKind;
  createdAt: string;
  note?: string;
}): MissingVariableResearchValue {
  if (!MRV_ID_RE.test(input.id)) throw Error("Invalid missing variable research value id");
  const spec = validatePrecisionScenarioMissingInformationSpec(input.intelligenceSpec);
  const assessment = validateMissingInformationAssessmentEnvelope(input.missingInformationAssessment);
  if (assessment.intelligenceSpecId !== spec.id) throw Error("Assessment must belong to intelligence spec");
  const missingVariableIds = assertIdList(input.missingVariableIds, REF_ID_RE, "missingVariableIds", 24);
  if (missingVariableIds.length === 0) throw Error("missingVariableIds required");
  assertClosed(input.sensitivityToMissingVariables, PSMI_SENSITIVITY_ORDINALS, "sensitivityToMissingVariables");
  assertClosed(input.infoValueStatus, PSMI_INFO_VALUE_STATUSES, "infoValueStatus");
  if (input.infoValueStatus === "blocked_invented_probability") {
    throw Error("Invented info-gain probability blocked");
  }
  if (!textOk(input.sensitivitySummary, 1000)) throw Error("Invalid sensitivitySummary");
  assertNoForbiddenClaimLanguage(input.sensitivitySummary, "sensitivitySummary");
  let quantifiableInfoValueSummary: string | null = null;
  if (input.infoValueStatus === "quantifiable_declared") {
    if (!input.quantifiableInfoValueSummary || !textOk(input.quantifiableInfoValueSummary, 1000)) {
      throw Error("quantifiableInfoValueSummary required when quantifiable_declared");
    }
    assertNoForbiddenClaimLanguage(input.quantifiableInfoValueSummary, "quantifiableInfoValueSummary");
    quantifiableInfoValueSummary = input.quantifiableInfoValueSummary.trim();
  } else if (input.quantifiableInfoValueSummary) {
    throw Error("quantifiableInfoValueSummary only allowed when quantifiable_declared");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const record: MissingVariableResearchValue = {
    schema: PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
    method: PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
    version: PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
    id: input.id,
    intelligenceSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    missingInformationAssessmentId: assessment.id,
    missingVariableIds,
    sensitivityToMissingVariables: input.sensitivityToMissingVariables,
    sensitivitySummary: input.sensitivitySummary.trim(),
    infoValueStatus: input.infoValueStatus,
    quantifiableInfoValueSummary,
    inventedInfoGainProbability: null,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind: input.authoredByActorKind ?? "ai_agent"},
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateMissingVariableResearchValue(record);
}

export function validateMissingVariableResearchValue(
  record: MissingVariableResearchValue,
): MissingVariableResearchValue {
  if (!MRV_ID_RE.test(record.id)) throw Error("Invalid missing variable research value id");
  assertClosed(record.infoValueStatus, PSMI_INFO_VALUE_STATUSES, "infoValueStatus");
  if (record.infoValueStatus === "blocked_invented_probability") {
    throw Error("Invented info-gain probability blocked");
  }
  if (record.inventedInfoGainProbability !== null) throw Error("Invented info-gain probability forbidden");
  if (record.infoValueStatus === "quantifiable_declared" && !record.quantifiableInfoValueSummary) {
    throw Error("quantifiableInfoValueSummary required when quantifiable_declared");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftFollowUpAndExperimentalValidation(input: {
  id: string;
  intelligenceSpec: PrecisionScenarioMissingInformationSpec;
  missingInformationAssessment?: MissingInformationAssessmentEnvelope | null;
  candidateFollowUpMeasurements: readonly string[];
  experimentalValidationRecommendations: readonly string[];
  researchMeasurementPriorities: readonly string[];
  comparisonSummary: string;
  invasiveTestingGovernanceStatus: PsmiInvasiveGovernanceStatus;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PsmiActorKind;
  createdAt: string;
  note?: string;
}): FollowUpAndExperimentalValidation {
  if (!FUV_ID_RE.test(input.id)) throw Error("Invalid follow-up and experimental validation id");
  const spec = validatePrecisionScenarioMissingInformationSpec(input.intelligenceSpec);
  const assessment = input.missingInformationAssessment
    ? validateMissingInformationAssessmentEnvelope(input.missingInformationAssessment)
    : null;
  if (assessment && assessment.intelligenceSpecId !== spec.id) {
    throw Error("Assessment must belong to intelligence spec");
  }
  assertClosed(
    input.invasiveTestingGovernanceStatus,
    PSMI_INVASIVE_GOVERNANCE_STATUSES,
    "invasiveTestingGovernanceStatus",
  );
  if (input.invasiveTestingGovernanceStatus === "blocked_without_governance") {
    throw Error("Invasive testing without governance blocked");
  }
  const candidateFollowUpMeasurements = assertStringList(
    input.candidateFollowUpMeasurements, "candidateFollowUpMeasurements", 12, 500,
  );
  if (candidateFollowUpMeasurements.length === 0) throw Error("candidateFollowUpMeasurements required");
  const experimentalValidationRecommendations = assertStringList(
    input.experimentalValidationRecommendations, "experimentalValidationRecommendations", 12, 500,
  );
  if (experimentalValidationRecommendations.length === 0) {
    throw Error("experimentalValidationRecommendations required");
  }
  const researchMeasurementPriorities = assertStringList(
    input.researchMeasurementPriorities, "researchMeasurementPriorities", 12, 500,
  );
  if (researchMeasurementPriorities.length === 0) throw Error("researchMeasurementPriorities required");
  if (!textOk(input.comparisonSummary, 1000)) throw Error("Invalid comparisonSummary");
  assertNoForbiddenClaimLanguage(input.comparisonSummary, "comparisonSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const record: FollowUpAndExperimentalValidation = {
    schema: PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
    method: PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
    version: PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
    id: input.id,
    intelligenceSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    missingInformationAssessmentId: assessment?.id ?? null,
    candidateFollowUpMeasurements,
    experimentalValidationRecommendations,
    researchMeasurementPriorities,
    comparisonSummary: input.comparisonSummary.trim(),
    researchMeasurementPrioritiesNotClinicalOrders: true,
    invasiveTestingGovernanceStatus: input.invasiveTestingGovernanceStatus,
    noInvasiveTestingWithoutGovernance: true,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind: input.authoredByActorKind ?? "ai_agent"},
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateFollowUpAndExperimentalValidation(record);
}

export function validateFollowUpAndExperimentalValidation(
  record: FollowUpAndExperimentalValidation,
): FollowUpAndExperimentalValidation {
  if (!FUV_ID_RE.test(record.id)) throw Error("Invalid follow-up and experimental validation id");
  assertClosed(
    record.invasiveTestingGovernanceStatus,
    PSMI_INVASIVE_GOVERNANCE_STATUSES,
    "invasiveTestingGovernanceStatus",
  );
  if (record.invasiveTestingGovernanceStatus === "blocked_without_governance") {
    throw Error("Invasive testing without governance blocked");
  }
  if (record.researchMeasurementPrioritiesNotClinicalOrders !== true) {
    throw Error("Must declare research priorities are not clinical orders");
  }
  if (record.noInvasiveTestingWithoutGovernance !== true) {
    throw Error("Must declare invasive-testing governance gate");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftPrecisionScenarioMissingInformationBundle(input: {
  id: string;
  displayName: string;
  intelligenceSpec: PrecisionScenarioMissingInformationSpec;
  bundleVersion: string;
  limitations: readonly string[];
  precisionResearchScenarios?: readonly PrecisionResearchScenario[];
  scenarioModelAndContexts?: readonly ScenarioModelAndContext[];
  scenarioPredictedOutputs?: readonly ScenarioPredictedOutputs[];
  scenarioUncertaintySensitivities?: readonly ScenarioUncertaintySensitivity[];
  scenarioValidationRecommendations?: readonly ScenarioValidationRecommendation[];
  missingInformationAssessments?: readonly MissingInformationAssessmentEnvelope[];
  missingVariableResearchValues?: readonly MissingVariableResearchValue[];
  followUpAndExperimentalValidations?: readonly FollowUpAndExperimentalValidation[];
  authoredByPrincipalId: string;
  authoredByActorKind?: PsmiActorKind;
  createdAt: string;
  note?: string;
}): PrecisionScenarioMissingInformationBundle {
  if (!BND_ID_RE.test(input.id)) throw Error("Invalid bundle id");
  const spec = validatePrecisionScenarioMissingInformationSpec(input.intelligenceSpec);
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!textOk(input.bundleVersion, 40)) throw Error("Invalid bundleVersion");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const precisionResearchScenarios = (input.precisionResearchScenarios ?? []).map(
    validatePrecisionResearchScenario,
  );
  const scenarioModelAndContexts = (input.scenarioModelAndContexts ?? []).map(
    validateScenarioModelAndContext,
  );
  const scenarioPredictedOutputs = (input.scenarioPredictedOutputs ?? []).map(
    validateScenarioPredictedOutputs,
  );
  const scenarioUncertaintySensitivities = (
    input.scenarioUncertaintySensitivities ?? []
  ).map(validateScenarioUncertaintySensitivity);
  const scenarioValidationRecommendations = (
    input.scenarioValidationRecommendations ?? []
  ).map(validateScenarioValidationRecommendation);
  const missingInformationAssessments = (
    input.missingInformationAssessments ?? []
  ).map(validateMissingInformationAssessmentEnvelope);
  const missingVariableResearchValues = (
    input.missingVariableResearchValues ?? []
  ).map(validateMissingVariableResearchValue);
  const followUpAndExperimentalValidations = (
    input.followUpAndExperimentalValidations ?? []
  ).map(validateFollowUpAndExperimentalValidation);

  const kindBuckets: Record<PsmiScenarioKind, string[]> = {
    alternative_biological_mechanism_assumptions: [],
    disease_trajectory_model_comparison: [],
    biomarker_measurement_scenarios: [],
    model_parameter_sensitivity: [],
    cohort_subgroup_comparisons: [],
    hypothetical_pathway_perturbations: [],
    alternative_monitoring_schedules: [],
  };
  for (const scenario of precisionResearchScenarios) {
    kindBuckets[scenario.scenarioKind].push(scenario.id);
  }
  const scenarioKindIdsByKind: Record<PsmiScenarioKind, readonly string[]> = {
    alternative_biological_mechanism_assumptions:
      kindBuckets.alternative_biological_mechanism_assumptions,
    disease_trajectory_model_comparison:
      kindBuckets.disease_trajectory_model_comparison,
    biomarker_measurement_scenarios: kindBuckets.biomarker_measurement_scenarios,
    model_parameter_sensitivity: kindBuckets.model_parameter_sensitivity,
    cohort_subgroup_comparisons: kindBuckets.cohort_subgroup_comparisons,
    hypothetical_pathway_perturbations:
      kindBuckets.hypothetical_pathway_perturbations,
    alternative_monitoring_schedules: kindBuckets.alternative_monitoring_schedules,
  };

  const lifecycle: PsmiLifecycle =
    spec.datasetAvailability === "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const record: PrecisionScenarioMissingInformationBundle = {
    schema: PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
    method: PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
    version: PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    diseaseContextId: spec.diseaseContextId,
    intelligenceSpecId: spec.id,
    precisionResearchScenarioIds: precisionResearchScenarios.map((r) => r.id),
    scenarioModelAndContextIds: scenarioModelAndContexts.map((r) => r.id),
    scenarioPredictedOutputIds: scenarioPredictedOutputs.map((r) => r.id),
    scenarioUncertaintySensitivityIds: scenarioUncertaintySensitivities.map((r) => r.id),
    scenarioValidationRecommendationIds: scenarioValidationRecommendations.map((r) => r.id),
    missingInformationAssessmentIds: missingInformationAssessments.map((r) => r.id),
    missingVariableResearchValueIds: missingVariableResearchValues.map((r) => r.id),
    followUpAndExperimentalValidationIds: followUpAndExperimentalValidations.map((r) => r.id),
    scenarioKindIdsByKind,
    bundleVersion: input.bundleVersion.trim(),
    limitations: assertLimitations(input.limitations),
    datasetAvailability: spec.datasetAvailability,
    notPersonalisedTreatmentEffect: true,
    noClinicalDosing: true,
    notSpecificPatientPredictionUnlessValidated: true,
    researchMeasurementPrioritiesNotClinicalOrders: true,
    noInvasiveTestingWithoutGovernance: true,
    noInventedInfoGainProbabilities: true,
    notDigitalTwinProduct: true,
    notValidatedIndividualOutcomePrediction: true,
    liveMultiscaleEngineOperational: false,
    m11SimulationClaimed: false,
    inventedInfoGainProbability: null,
    graphPromotable: false,
    lifecycle,
    reviewedBy: null,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind: input.authoredByActorKind ?? "ai_agent"},
      "authoredBy",
    ),
    dataBasis: dataBasisForAvailability(spec.datasetAvailability),
    fixtureHonesty: spec.datasetAvailability !== "authorised_declared",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validatePrecisionScenarioMissingInformationBundle(record);
}

export function validatePrecisionScenarioMissingInformationBundle(
  record: PrecisionScenarioMissingInformationBundle,
): PrecisionScenarioMissingInformationBundle {
  if (!BND_ID_RE.test(record.id)) throw Error("Invalid bundle id");
  if (!SPEC_ID_RE.test(record.intelligenceSpecId)) throw Error("Invalid intelligenceSpecId");
  if (!HDI_CTX_RE.test(record.diseaseContextId)) throw Error("Invalid diseaseContextId");
  if (record.notPersonalisedTreatmentEffect !== true) throw Error("Must declare not personalised treatment effect");
  if (record.noClinicalDosing !== true) throw Error("Must declare no clinical dosing");
  if (record.notSpecificPatientPredictionUnlessValidated !== true) {
    throw Error("Must declare specific-patient prediction gate");
  }
  if (record.researchMeasurementPrioritiesNotClinicalOrders !== true) {
    throw Error("Must declare research priorities are not clinical orders");
  }
  if (record.noInvasiveTestingWithoutGovernance !== true) throw Error("Must declare invasive-testing governance gate");
  if (record.noInventedInfoGainProbabilities !== true) throw Error("Must declare no invented info-gain probabilities");
  if (record.inventedInfoGainProbability !== null) throw Error("Invented info-gain probability forbidden");
  if (record.liveMultiscaleEngineOperational !== false) throw Error("Live multiscale engine must stay false");
  if (record.m11SimulationClaimed !== false) throw Error("M11 simulation claims forbidden");
  if (record.graphPromotable !== false) throw Error("Graph promotion forbidden");
  assertClosed(record.lifecycle, PSMI_LIFECYCLES, "lifecycle");
  assertClosed(record.datasetAvailability, PSMI_DATASET_AVAILABILITY, "datasetAvailability");
  assertClosed(record.dataBasis, PSMI_DATA_BASES, "dataBasis");
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  return record;
}

export function transitionPrecisionScenarioMissingInformationBundle(input: {
  bundle: PrecisionScenarioMissingInformationBundle;
  to: PsmiLifecycle;
  updatedAt: string;
  actor: PsmiActor;
}): PrecisionScenarioMissingInformationBundle {
  const current = validatePrecisionScenarioMissingInformationBundle(input.bundle);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = BUNDLE_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(`Illegal lifecycle transition ${current.lifecycle} -> ${input.to}`);
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
  return validatePrecisionScenarioMissingInformationBundle({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected" ? actor : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryPrecisionScenarioMissingInformationStore(): PrecisionScenarioMissingInformationStore & {
  specs: Map<string, PrecisionScenarioMissingInformationSpec>;
  precisionResearchScenarios: Map<string, PrecisionResearchScenario>;
  scenarioModelAndContexts: Map<string, ScenarioModelAndContext>;
  scenarioPredictedOutputs: Map<string, ScenarioPredictedOutputs>;
  scenarioUncertaintySensitivities: Map<string, ScenarioUncertaintySensitivity>;
  scenarioValidationRecommendations: Map<string, ScenarioValidationRecommendation>;
  missingInformationAssessments: Map<string, MissingInformationAssessmentEnvelope>;
  missingVariableResearchValues: Map<string, MissingVariableResearchValue>;
  followUpAndExperimentalValidations: Map<string, FollowUpAndExperimentalValidation>;
  bundles: Map<string, PrecisionScenarioMissingInformationBundle>;
} {
  const specs = new Map<string, PrecisionScenarioMissingInformationSpec>();
  const precisionResearchScenarios = new Map<string, PrecisionResearchScenario>();
  const scenarioModelAndContexts = new Map<string, ScenarioModelAndContext>();
  const scenarioPredictedOutputs = new Map<string, ScenarioPredictedOutputs>();
  const scenarioUncertaintySensitivities = new Map<string, ScenarioUncertaintySensitivity>();
  const scenarioValidationRecommendations = new Map<string, ScenarioValidationRecommendation>();
  const missingInformationAssessments = new Map<string, MissingInformationAssessmentEnvelope>();
  const missingVariableResearchValues = new Map<string, MissingVariableResearchValue>();
  const followUpAndExperimentalValidations = new Map<string, FollowUpAndExperimentalValidation>();
  const bundles = new Map<string, PrecisionScenarioMissingInformationBundle>();

  const filterByDisease = <T extends {diseaseContextId: string}>(
    map: Map<string, T>,
    diseaseContextId?: string,
  ): readonly T[] => {
    const all = [...map.values()];
    return diseaseContextId ? all.filter((r) => r.diseaseContextId === diseaseContextId) : all;
  };

  return {
    specs,
    precisionResearchScenarios,
    scenarioModelAndContexts,
    scenarioPredictedOutputs,
    scenarioUncertaintySensitivities,
    scenarioValidationRecommendations,
    missingInformationAssessments,
    missingVariableResearchValues,
    followUpAndExperimentalValidations,
    bundles,
    upsertSpec(record) {
      const validated = validatePrecisionScenarioMissingInformationSpec(record);
      specs.set(validated.id, validated);
      return validated;
    },
    getSpec(id) { return specs.get(id) ?? null; },
    listSpecs(diseaseContextId) { return filterByDisease(specs, diseaseContextId); },
    upsertPrecisionResearchScenario(record) {
      const validated = validatePrecisionResearchScenario(record);
      precisionResearchScenarios.set(validated.id, validated);
      return validated;
    },
    getPrecisionResearchScenario(id) { return precisionResearchScenarios.get(id) ?? null; },
    listPrecisionResearchScenarios(diseaseContextId) {
      return filterByDisease(precisionResearchScenarios, diseaseContextId);
    },
    upsertScenarioModelAndContext(record) {
      const validated = validateScenarioModelAndContext(record);
      scenarioModelAndContexts.set(validated.id, validated);
      return validated;
    },
    getScenarioModelAndContext(id) { return scenarioModelAndContexts.get(id) ?? null; },
    listScenarioModelAndContexts(diseaseContextId) {
      return filterByDisease(scenarioModelAndContexts, diseaseContextId);
    },
    upsertScenarioPredictedOutputs(record) {
      const validated = validateScenarioPredictedOutputs(record);
      scenarioPredictedOutputs.set(validated.id, validated);
      return validated;
    },
    getScenarioPredictedOutputs(id) { return scenarioPredictedOutputs.get(id) ?? null; },
    listScenarioPredictedOutputs(diseaseContextId) {
      return filterByDisease(scenarioPredictedOutputs, diseaseContextId);
    },
    upsertScenarioUncertaintySensitivity(record) {
      const validated = validateScenarioUncertaintySensitivity(record);
      scenarioUncertaintySensitivities.set(validated.id, validated);
      return validated;
    },
    getScenarioUncertaintySensitivity(id) {
      return scenarioUncertaintySensitivities.get(id) ?? null;
    },
    listScenarioUncertaintySensitivities(diseaseContextId) {
      return filterByDisease(scenarioUncertaintySensitivities, diseaseContextId);
    },
    upsertScenarioValidationRecommendation(record) {
      const validated = validateScenarioValidationRecommendation(record);
      scenarioValidationRecommendations.set(validated.id, validated);
      return validated;
    },
    getScenarioValidationRecommendation(id) {
      return scenarioValidationRecommendations.get(id) ?? null;
    },
    listScenarioValidationRecommendations(diseaseContextId) {
      return filterByDisease(scenarioValidationRecommendations, diseaseContextId);
    },
    upsertMissingInformationAssessment(record) {
      const validated = validateMissingInformationAssessmentEnvelope(record);
      missingInformationAssessments.set(validated.id, validated);
      return validated;
    },
    getMissingInformationAssessment(id) {
      return missingInformationAssessments.get(id) ?? null;
    },
    listMissingInformationAssessments(diseaseContextId) {
      return filterByDisease(missingInformationAssessments, diseaseContextId);
    },
    upsertMissingVariableResearchValue(record) {
      const validated = validateMissingVariableResearchValue(record);
      missingVariableResearchValues.set(validated.id, validated);
      return validated;
    },
    getMissingVariableResearchValue(id) {
      return missingVariableResearchValues.get(id) ?? null;
    },
    listMissingVariableResearchValues(diseaseContextId) {
      return filterByDisease(missingVariableResearchValues, diseaseContextId);
    },
    upsertFollowUpAndExperimentalValidation(record) {
      const validated = validateFollowUpAndExperimentalValidation(record);
      followUpAndExperimentalValidations.set(validated.id, validated);
      return validated;
    },
    getFollowUpAndExperimentalValidation(id) {
      return followUpAndExperimentalValidations.get(id) ?? null;
    },
    listFollowUpAndExperimentalValidations(diseaseContextId) {
      return filterByDisease(followUpAndExperimentalValidations, diseaseContextId);
    },
    upsertBundle(record) {
      const validated = validatePrecisionScenarioMissingInformationBundle(record);
      bundles.set(validated.id, validated);
      return validated;
    },
    getBundle(id) { return bundles.get(id) ?? null; },
    listBundles(diseaseContextId) { return filterByDisease(bundles, diseaseContextId); },
  };
}

export function projectPrecisionScenarioMissingInformationPersistenceLines(input: {
  specs: readonly PrecisionScenarioMissingInformationSpec[];
  precisionResearchScenarios?: readonly PrecisionResearchScenario[];
  scenarioModelAndContexts?: readonly ScenarioModelAndContext[];
  scenarioPredictedOutputs?: readonly ScenarioPredictedOutputs[];
  scenarioUncertaintySensitivities?: readonly ScenarioUncertaintySensitivity[];
  scenarioValidationRecommendations?: readonly ScenarioValidationRecommendation[];
  missingInformationAssessments?: readonly MissingInformationAssessmentEnvelope[];
  missingVariableResearchValues?: readonly MissingVariableResearchValue[];
  followUpAndExperimentalValidations?: readonly FollowUpAndExperimentalValidation[];
  bundles?: readonly PrecisionScenarioMissingInformationBundle[];
}): string[] {
  for (const s of input.specs) validatePrecisionScenarioMissingInformationSpec(s);
  for (const r of input.precisionResearchScenarios ?? []) validatePrecisionResearchScenario(r);
  for (const r of input.scenarioModelAndContexts ?? []) validateScenarioModelAndContext(r);
  for (const r of input.scenarioPredictedOutputs ?? []) validateScenarioPredictedOutputs(r);
  for (const r of input.scenarioUncertaintySensitivities ?? []) validateScenarioUncertaintySensitivity(r);
  for (const r of input.scenarioValidationRecommendations ?? []) validateScenarioValidationRecommendation(r);
  for (const r of input.missingInformationAssessments ?? []) validateMissingInformationAssessmentEnvelope(r);
  for (const r of input.missingVariableResearchValues ?? []) validateMissingVariableResearchValue(r);
  for (const r of input.followUpAndExperimentalValidations ?? []) validateFollowUpAndExperimentalValidation(r);
  for (const r of input.bundles ?? []) validatePrecisionScenarioMissingInformationBundle(r);

  const scenarioKindsCovered = new Set(
    (input.precisionResearchScenarios ?? []).map((s) => s.scenarioKind),
  ).size;
  const quantifiableInfoValueCount = (input.missingVariableResearchValues ?? []).filter((r) =>
    isQuantifiableInfoValue(r.infoValueStatus),
  ).length;

  return [
    `schema=${PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA}`,
    `method=${PRECISION_SCENARIO_MISSING_INFORMATION_METHOD}`,
    `version=${PRECISION_SCENARIO_MISSING_INFORMATION_VERSION}`,
    `specs=${input.specs.length}`,
    `precisionResearchScenarios=${(input.precisionResearchScenarios ?? []).length}`,
    `scenarioModelAndContexts=${(input.scenarioModelAndContexts ?? []).length}`,
    `scenarioPredictedOutputs=${(input.scenarioPredictedOutputs ?? []).length}`,
    `scenarioUncertaintySensitivities=${(input.scenarioUncertaintySensitivities ?? []).length}`,
    `scenarioValidationRecommendations=${(input.scenarioValidationRecommendations ?? []).length}`,
    `missingInformationAssessments=${(input.missingInformationAssessments ?? []).length}`,
    `missingVariableResearchValues=${(input.missingVariableResearchValues ?? []).length}`,
    `followUpAndExperimentalValidations=${(input.followUpAndExperimentalValidations ?? []).length}`,
    `bundles=${(input.bundles ?? []).length}`,
    `scenarioKindsCovered=${scenarioKindsCovered}`,
    `quantifiableInfoValueCount=${quantifiableInfoValueCount}`,
    `capabilityKindCount=${PSMI_CAPABILITY_KINDS.length}`,
    `scenarioKindCount=${PSMI_SCENARIO_KINDS.length}`,
    `notPersonalisedTreatmentEffect=true`,
    `noClinicalDosing=true`,
    `notSpecificPatientPredictionUnlessValidated=true`,
    `researchMeasurementPrioritiesNotClinicalOrders=true`,
    `noInvasiveTestingWithoutGovernance=true`,
    `noInventedInfoGainProbabilities=true`,
    `notDigitalTwinProduct=true`,
    `notValidatedIndividualOutcomePrediction=true`,
    `liveMultiscaleEngineOperational=false`,
    `m11SimulationClaimed=false`,
    `noPhiIngestion=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintPrecisionScenarioMissingInformationBundle(
  bundle: PrecisionScenarioMissingInformationBundle,
): string {
  const validated = validatePrecisionScenarioMissingInformationBundle(bundle);
  return createHash("sha256").update(canonicalEvidenceJson(validated)).digest("hex");
}

export function buildPrecisionScenarioMissingInformationPack(input: {
  specs: readonly PrecisionScenarioMissingInformationSpec[];
  precisionResearchScenarios: readonly PrecisionResearchScenario[];
  scenarioModelAndContexts: readonly ScenarioModelAndContext[];
  scenarioPredictedOutputs: readonly ScenarioPredictedOutputs[];
  scenarioUncertaintySensitivities: readonly ScenarioUncertaintySensitivity[];
  scenarioValidationRecommendations: readonly ScenarioValidationRecommendation[];
  missingInformationAssessments: readonly MissingInformationAssessmentEnvelope[];
  missingVariableResearchValues: readonly MissingVariableResearchValue[];
  followUpAndExperimentalValidations: readonly FollowUpAndExperimentalValidation[];
  bundles: readonly PrecisionScenarioMissingInformationBundle[];
  asOf: string;
}): {
  schema: typeof PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA;
  method: typeof PRECISION_SCENARIO_MISSING_INFORMATION_METHOD;
  version: typeof PRECISION_SCENARIO_MISSING_INFORMATION_VERSION;
  asOf: string;
  capabilityKindCount: number;
  scenarioKindCount: number;
  specCount: number;
  precisionResearchScenarioCount: number;
  scenarioModelAndContextCount: number;
  scenarioPredictedOutputCount: number;
  scenarioUncertaintySensitivityCount: number;
  scenarioValidationRecommendationCount: number;
  missingInformationAssessmentCount: number;
  missingVariableResearchValueCount: number;
  followUpAndExperimentalValidationCount: number;
  bundleCount: number;
  scenarioKindsCovered: number;
  quantifiableInfoValueCount: number;
  honesty: PrecisionScenarioMissingInformationHonesty;
  specs: readonly PrecisionScenarioMissingInformationSpec[];
  precisionResearchScenarios: readonly PrecisionResearchScenario[];
  scenarioModelAndContexts: readonly ScenarioModelAndContext[];
  scenarioPredictedOutputs: readonly ScenarioPredictedOutputs[];
  scenarioUncertaintySensitivities: readonly ScenarioUncertaintySensitivity[];
  scenarioValidationRecommendations: readonly ScenarioValidationRecommendation[];
  missingInformationAssessments: readonly MissingInformationAssessmentEnvelope[];
  missingVariableResearchValues: readonly MissingVariableResearchValue[];
  followUpAndExperimentalValidations: readonly FollowUpAndExperimentalValidation[];
  bundles: readonly PrecisionScenarioMissingInformationBundle[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const specs = input.specs.map(validatePrecisionScenarioMissingInformationSpec);
  const precisionResearchScenarios = input.precisionResearchScenarios.map(validatePrecisionResearchScenario);
  const scenarioModelAndContexts = input.scenarioModelAndContexts.map(validateScenarioModelAndContext);
  const scenarioPredictedOutputs = input.scenarioPredictedOutputs.map(validateScenarioPredictedOutputs);
  const scenarioUncertaintySensitivities = input.scenarioUncertaintySensitivities.map(
    validateScenarioUncertaintySensitivity,
  );
  const scenarioValidationRecommendations = input.scenarioValidationRecommendations.map(
    validateScenarioValidationRecommendation,
  );
  const missingInformationAssessments = input.missingInformationAssessments.map(
    validateMissingInformationAssessmentEnvelope,
  );
  const missingVariableResearchValues = input.missingVariableResearchValues.map(
    validateMissingVariableResearchValue,
  );
  const followUpAndExperimentalValidations = input.followUpAndExperimentalValidations.map(
    validateFollowUpAndExperimentalValidation,
  );
  const bundles = input.bundles.map(validatePrecisionScenarioMissingInformationBundle);
  const scenarioKindsCovered = new Set(precisionResearchScenarios.map((s) => s.scenarioKind)).size;
  const quantifiableInfoValueCount = missingVariableResearchValues.filter((r) =>
    isQuantifiableInfoValue(r.infoValueStatus),
  ).length;

  return {
    schema: PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
    method: PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
    version: PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
    asOf: input.asOf,
    capabilityKindCount: PSMI_CAPABILITY_KINDS.length,
    scenarioKindCount: PSMI_SCENARIO_KINDS.length,
    specCount: specs.length,
    precisionResearchScenarioCount: precisionResearchScenarios.length,
    scenarioModelAndContextCount: scenarioModelAndContexts.length,
    scenarioPredictedOutputCount: scenarioPredictedOutputs.length,
    scenarioUncertaintySensitivityCount: scenarioUncertaintySensitivities.length,
    scenarioValidationRecommendationCount: scenarioValidationRecommendations.length,
    missingInformationAssessmentCount: missingInformationAssessments.length,
    missingVariableResearchValueCount: missingVariableResearchValues.length,
    followUpAndExperimentalValidationCount: followUpAndExperimentalValidations.length,
    bundleCount: bundles.length,
    scenarioKindsCovered,
    quantifiableInfoValueCount,
    honesty: {...DEFAULT_HONESTY},
    specs,
    precisionResearchScenarios,
    scenarioModelAndContexts,
    scenarioPredictedOutputs,
    scenarioUncertaintySensitivities,
    scenarioValidationRecommendations,
    missingInformationAssessments,
    missingVariableResearchValues,
    followUpAndExperimentalValidations,
    bundles,
  };
}
