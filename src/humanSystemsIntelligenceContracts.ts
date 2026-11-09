/**
 * Milestone 16 / PR1 — Human Systems Data Contracts.
 *
 * Governed envelopes for cross-disease investigation, cross-disease mechanism
 * relationships (with relationship classifications), organ-system
 * relationships, multimorbidity research context, and research-scoped systems
 * simulation — composing optional M15 HDI / CSOL and M14 RWE/LCE/cohort ids.
 *
 * Does NOT diagnose, select treatments, perform clinical decision-making,
 * claim whole-body simulation, auto-transfer mechanisms across diseases,
 * invent shared-mechanism statistics, duplicate entity registries, ingest
 * PHI, invent Gate C / MoU, or claim a live M11 multiscale engine.
 *
 * Binding honesty:
 * - Research intelligence only.
 * - Shared gene ≠ shared causal mechanism.
 * - Co-occurrence ≠ causation.
 * - Pathway enrichment ≠ activation.
 * - No whole-body simulation claim.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA =
  "hsi-human-systems-intelligence-1" as const;
export const HUMAN_SYSTEMS_INTELLIGENCE_METHOD =
  "hsi.human_systems_intelligence.v1" as const;
export const HUMAN_SYSTEMS_INTELLIGENCE_VERSION = "0.1.0" as const;

export const HSYS_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_awaiting_authorised_dataset",
  "blocked_no_live_multiscale_engine",
  "rejected",
  "superseded",
] as const;
export type HsysLifecycle = (typeof HSYS_LIFECYCLES)[number];

export const HSYS_DATASET_AVAILABILITY = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type HsysDatasetAvailability =
  (typeof HSYS_DATASET_AVAILABILITY)[number];

export const HSYS_ACCESS_CLASSIFICATIONS = [
  "fixture_engineering",
  "authorised_pseudonymous_research",
  "authorised_aggregate_only",
  "restricted_not_ingested",
] as const;
export type HsysAccessClassification =
  (typeof HSYS_ACCESS_CLASSIFICATIONS)[number];

export const HSYS_DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type HsysDataBasis = (typeof HSYS_DATA_BASES)[number];

export const HSYS_ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type HsysActorKind = (typeof HSYS_ACTOR_KINDS)[number];

export const HSYS_PERMITTED_RESEARCH_USES = [
  "cross_disease_mechanism_research",
  "multimorbidity_association_research",
  "organ_system_relationship_research",
  "systems_simulation_research",
  "observational_association_research",
  "methods_engineering_fixture",
] as const;
export type HsysPermittedResearchUse =
  (typeof HSYS_PERMITTED_RESEARCH_USES)[number];

/**
 * Closed relationship classifications for cross-disease mechanism links.
 * Classification honesty is fail-closed in validators.
 */
export const CROSS_DISEASE_MECHANISM_RELATIONSHIP_CLASSIFICATIONS = [
  "shared_gene_association",
  "shared_pathway_enrichment",
  "shared_cell_type_association",
  "shared_phenotype_association",
  "co_occurrence_association",
  "putative_shared_mechanism_hypothesis",
  "antagonistic_or_opposing_mechanism_hypothesis",
  "disease_specific_mechanism_declared",
  "uncertain_relationship",
  "unsupported_relationship",
] as const;
export type CrossDiseaseMechanismRelationshipClassification =
  (typeof CROSS_DISEASE_MECHANISM_RELATIONSHIP_CLASSIFICATIONS)[number];

export const ORGAN_SYSTEM_LABELS = [
  "immune",
  "cardiovascular",
  "respiratory",
  "gastrointestinal",
  "hepatic",
  "renal",
  "endocrine_metabolic",
  "nervous",
  "musculoskeletal",
  "integumentary",
  "hematologic",
  "reproductive",
  "other_declared",
] as const;
export type OrganSystemLabel = (typeof ORGAN_SYSTEM_LABELS)[number];

export const ORGAN_SYSTEM_RELATIONSHIP_KINDS = [
  "anatomical_adjacency_declared",
  "physiological_coupling_declared",
  "shared_pathway_association",
  "inflammatory_axis_association",
  "metabolic_axis_association",
  "neural_immune_axis_association",
  "gut_immune_metabolic_axis_association",
  "uncertain_organ_system_relationship",
  "unsupported_organ_system_relationship",
] as const;
export type OrganSystemRelationshipKind =
  (typeof ORGAN_SYSTEM_RELATIONSHIP_KINDS)[number];

export const SYSTEMS_SIMULATION_VALIDATION_SCOPES = [
  "fixture_engineering_only",
  "single_axis_research_scoped",
  "multi_organ_research_scoped_not_whole_body",
  "blocked_no_authorised_dataset",
  "blocked_no_live_multiscale_engine",
] as const;
export type SystemsSimulationValidationScope =
  (typeof SYSTEMS_SIMULATION_VALIDATION_SCOPES)[number];

const INV_ID_RE = /^hsi-hsys-inv-[a-z0-9-]{3,80}$/;
const CMR_ID_RE = /^hsi-hsys-cmr-[a-z0-9-]{3,80}$/;
const OSR_ID_RE = /^hsi-hsys-osr-[a-z0-9-]{3,80}$/;
const MM_ID_RE = /^hsi-hsys-mm-[a-z0-9-]{3,80}$/;
const SIM_ID_RE = /^hsi-hsys-sim-[a-z0-9-]{3,80}$/;
const HDI_CTX_RE = /^hsi-hdi-ctx-[a-z0-9-]{3,80}$/;
const CSOL_SPEC_RE = /^hsi-csol-spec-[a-z0-9-]{3,80}$/;
const RWE_STUDY_RE = /^hsi-rwe-study-[a-z0-9-]{3,80}$/;
const LCE_SPEC_RE = /^hsi-lce-spec-[a-z0-9-]{3,80}$/;
const RCB_COH_RE = /^hsi-rcb-coh-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type HumanSystemsIntelligenceHonesty = {
  researchIntelligenceOnly: true;
  notDiagnosisOrTreatmentSelection: true;
  notClinicalDecisionMaking: true;
  sharedGeneIsNotSharedCausalMechanism: true;
  pathwayEnrichmentIsNotActivation: true;
  coOccurrenceIsNotCausation: true;
  noAutoTransferOfMechanismsAcrossDiseases: true;
  noDuplicateEntityRegistries: true;
  noWholeBodySimulationClaim: true;
  noLiveMultiscaleEngineClaim: true;
  noInventedMechanismsOrStatistics: true;
  noPhiIngestion: true;
  noWorkbenchUi: true;
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

export type HsysActor = {
  principalId: string;
  actorKind: HsysActorKind;
};

export type CrossDiseaseInvestigation = {
  schema: typeof HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA;
  method: typeof HUMAN_SYSTEMS_INTELLIGENCE_METHOD;
  version: typeof HUMAN_SYSTEMS_INTELLIGENCE_VERSION;
  id: string;
  displayName: string;
  scientificQuestion: string;
  diseaseContextIds: readonly string[];
  permittedResearchUses: readonly HsysPermittedResearchUse[];
  datasetAvailability: HsysDatasetAvailability;
  accessClassification: HsysAccessClassification;
  autoTransferAcrossDiseases: false;
  containsIdentifiablePhi: false;
  csolSpecId: string | null;
  rweStudyId: string | null;
  longitudinalAnalysisSpecId: string | null;
  cohortDefinitionId: string | null;
  lifecycle: HsysLifecycle;
  reviewedBy: HsysActor | null;
  authoredBy: HsysActor;
  dataBasis: HsysDataBasis;
  fixtureHonesty: boolean;
  honesty: HumanSystemsIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossDiseaseMechanismRelationship = {
  schema: typeof HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA;
  method: typeof HUMAN_SYSTEMS_INTELLIGENCE_METHOD;
  version: typeof HUMAN_SYSTEMS_INTELLIGENCE_VERSION;
  id: string;
  investigationId: string;
  displayName: string;
  diseaseContextIdA: string;
  diseaseContextIdB: string;
  relationshipClassification: CrossDiseaseMechanismRelationshipClassification;
  mechanismSummary: string;
  sharedGeneIsNotSharedCausalMechanism: true;
  pathwayEnrichmentIsNotActivation: true;
  coOccurrenceIsNotCausation: true;
  autoTransferAcrossDiseases: false;
  causalIdentificationClaimed: false;
  inventedStatistics: null;
  ontologyConceptRef: string | null;
  provenanceNote: string;
  limitations: readonly string[];
  datasetAvailability: HsysDatasetAvailability;
  lifecycle: HsysLifecycle;
  reviewedBy: HsysActor | null;
  authoredBy: HsysActor;
  dataBasis: HsysDataBasis;
  fixtureHonesty: boolean;
  honesty: HumanSystemsIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type OrganSystemRelationship = {
  schema: typeof HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA;
  method: typeof HUMAN_SYSTEMS_INTELLIGENCE_METHOD;
  version: typeof HUMAN_SYSTEMS_INTELLIGENCE_VERSION;
  id: string;
  investigationId: string | null;
  displayName: string;
  organSystemA: OrganSystemLabel;
  organSystemB: OrganSystemLabel;
  relationshipKind: OrganSystemRelationshipKind;
  relationshipSummary: string;
  wholeBodyPhysiologyClaimed: false;
  csolSpecId: string | null;
  ontologyConceptRef: string | null;
  limitations: readonly string[];
  datasetAvailability: HsysDatasetAvailability;
  lifecycle: HsysLifecycle;
  reviewedBy: HsysActor | null;
  authoredBy: HsysActor;
  dataBasis: HsysDataBasis;
  fixtureHonesty: boolean;
  honesty: HumanSystemsIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MultimorbidityResearchContext = {
  schema: typeof HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA;
  method: typeof HUMAN_SYSTEMS_INTELLIGENCE_METHOD;
  version: typeof HUMAN_SYSTEMS_INTELLIGENCE_VERSION;
  id: string;
  investigationId: string | null;
  displayName: string;
  diseaseContextIds: readonly string[];
  populationFraming: string;
  coOccurrenceFraming: string;
  coOccurrenceIsNotCausation: true;
  causalMultimorbidityNetworkClaimed: false;
  inventedPrevalenceOrEffectSize: null;
  permittedResearchUses: readonly HsysPermittedResearchUse[];
  datasetAvailability: HsysDatasetAvailability;
  accessClassification: HsysAccessClassification;
  rweStudyId: string | null;
  longitudinalAnalysisSpecId: string | null;
  cohortDefinitionId: string | null;
  limitations: readonly string[];
  lifecycle: HsysLifecycle;
  reviewedBy: HsysActor | null;
  authoredBy: HsysActor;
  dataBasis: HsysDataBasis;
  fixtureHonesty: boolean;
  honesty: HumanSystemsIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type SystemsSimulation = {
  schema: typeof HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA;
  method: typeof HUMAN_SYSTEMS_INTELLIGENCE_METHOD;
  version: typeof HUMAN_SYSTEMS_INTELLIGENCE_VERSION;
  id: string;
  investigationId: string | null;
  multimorbidityContextId: string | null;
  displayName: string;
  researchQuestion: string;
  validationScope: SystemsSimulationValidationScope;
  researchOnly: true;
  wholeBodySimulationClaimed: false;
  liveMultiscaleEngineOperational: false;
  m11SimulationClaimed: false;
  notDiagnosisOrTreatmentSelection: true;
  inventedParameters: null;
  limitations: readonly string[];
  datasetAvailability: HsysDatasetAvailability;
  accessClassification: HsysAccessClassification;
  organSystemRelationshipIds: readonly string[];
  mechanismRelationshipIds: readonly string[];
  lifecycle: HsysLifecycle;
  reviewedBy: HsysActor | null;
  authoredBy: HsysActor;
  dataBasis: HsysDataBasis;
  fixtureHonesty: boolean;
  honesty: HumanSystemsIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type HumanSystemsIntelligenceStore = {
  upsertInvestigation(
    investigation: CrossDiseaseInvestigation,
  ): CrossDiseaseInvestigation;
  getInvestigation(id: string): CrossDiseaseInvestigation | null;
  listInvestigations(): readonly CrossDiseaseInvestigation[];
  upsertMechanismRelationship(
    relationship: CrossDiseaseMechanismRelationship,
  ): CrossDiseaseMechanismRelationship;
  getMechanismRelationship(
    id: string,
  ): CrossDiseaseMechanismRelationship | null;
  listMechanismRelationships(
    investigationId?: string,
  ): readonly CrossDiseaseMechanismRelationship[];
  upsertOrganSystemRelationship(
    relationship: OrganSystemRelationship,
  ): OrganSystemRelationship;
  getOrganSystemRelationship(id: string): OrganSystemRelationship | null;
  listOrganSystemRelationships(
    investigationId?: string,
  ): readonly OrganSystemRelationship[];
  upsertMultimorbidityContext(
    context: MultimorbidityResearchContext,
  ): MultimorbidityResearchContext;
  getMultimorbidityContext(id: string): MultimorbidityResearchContext | null;
  listMultimorbidityContexts(): readonly MultimorbidityResearchContext[];
  upsertSystemsSimulation(simulation: SystemsSimulation): SystemsSimulation;
  getSystemsSimulation(id: string): SystemsSimulation | null;
  listSystemsSimulations(): readonly SystemsSimulation[];
};

const DEFAULT_HONESTY: HumanSystemsIntelligenceHonesty = {
  researchIntelligenceOnly: true,
  notDiagnosisOrTreatmentSelection: true,
  notClinicalDecisionMaking: true,
  sharedGeneIsNotSharedCausalMechanism: true,
  pathwayEnrichmentIsNotActivation: true,
  coOccurrenceIsNotCausation: true,
  noAutoTransferOfMechanismsAcrossDiseases: true,
  noDuplicateEntityRegistries: true,
  noWholeBodySimulationClaim: true,
  noLiveMultiscaleEngineClaim: true,
  noInventedMechanismsOrStatistics: true,
  noPhiIngestion: true,
  noWorkbenchUi: true,
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

const LIFECYCLE_TRANSITIONS: Record<
  HsysLifecycle,
  readonly HsysLifecycle[]
> = {
  draft: [
    "under_review",
    "blocked_awaiting_authorised_dataset",
    "blocked_no_live_multiscale_engine",
    "rejected",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_awaiting_authorised_dataset",
    "blocked_no_live_multiscale_engine",
    "rejected",
    "draft",
  ],
  accepted_with_limitations: ["superseded"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
  blocked_no_live_multiscale_engine: ["draft", "rejected"],
  rejected: [],
  superseded: [],
};

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

function assertHonesty(honesty: HumanSystemsIntelligenceHonesty): void {
  if (honesty.researchIntelligenceOnly !== true) {
    throw Error("Research intelligence only");
  }
  if (honesty.notDiagnosisOrTreatmentSelection !== true) {
    throw Error("Diagnosis/treatment selection forbidden");
  }
  if (honesty.notClinicalDecisionMaking !== true) {
    throw Error("Clinical decision-making forbidden");
  }
  if (honesty.sharedGeneIsNotSharedCausalMechanism !== true) {
    throw Error("Shared gene must not imply shared causal mechanism");
  }
  if (honesty.pathwayEnrichmentIsNotActivation !== true) {
    throw Error("Pathway enrichment must not imply activation");
  }
  if (honesty.coOccurrenceIsNotCausation !== true) {
    throw Error("Co-occurrence must not imply causation");
  }
  if (honesty.noAutoTransferOfMechanismsAcrossDiseases !== true) {
    throw Error("Auto-transfer of mechanisms across diseases forbidden");
  }
  if (honesty.noDuplicateEntityRegistries !== true) {
    throw Error("Duplicate entity registries forbidden");
  }
  if (honesty.noWholeBodySimulationClaim !== true) {
    throw Error("Whole-body simulation claim forbidden");
  }
  if (honesty.noLiveMultiscaleEngineClaim !== true) {
    throw Error("Live multiscale engine claim forbidden");
  }
  if (honesty.noInventedMechanismsOrStatistics !== true) {
    throw Error("Invented mechanisms/statistics forbidden");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR1");
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
    throw Error("Scientific approval must stay false in PR1");
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

function stripHonestyNegations(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /\b(?:not|no|without|never|nor)\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+selection|treatment\s+recommendation|clinical\s+decision(?:[- ]making)?|shared\s+causal\s+mechanism|pathway\s+activation|whole[- ]body\s+simulation|live\s+multiscale\s+engine|auto[- ]transfer(?:\s+of\s+mechanisms?)?|causation|proven\s+treatment\s+effect)(?:\s+or\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+selection|treatment\s+recommendation|clinical\s+decision(?:[- ]making)?|shared\s+causal\s+mechanism|pathway\s+activation|whole[- ]body\s+simulation|live\s+multiscale\s+engine|causation))*/g,
      " ",
    )
    .replace(
      /\b(?:live\s+multiscale\s+engine|m11(?:\s+multiscale)?\s+engine)\s+(?:is\s+)?(?:skipped|missing|absent|not\s+operational)\b/g,
      " ",
    )
    .replace(
      /\buntil\s+(?:a\s+|an\s+|the\s+)?live\s+multiscale\s+engine\b/g,
      " ",
    );
}

function assertNoForbiddenClaimLanguage(text: string, label: string): void {
  const lower = stripHonestyNegations(text);
  if (
    /\bdiagnos(e|is|ing)\b/.test(lower) ||
    /\bprescribe\b/.test(lower) ||
    /\btreatment\s+selection\b/.test(lower) ||
    /\btreatment\s+recommendation\b/.test(lower) ||
    /\bclinical\s+decision(?:[- ]making)?\b/.test(lower) ||
    /\bshared\s+causal\s+mechanism\b/.test(lower) ||
    /\bpathway\s+activation\b/.test(lower) ||
    /\bwhole[- ]body\s+simulation\b/.test(lower) ||
    /\blive\s+multiscale\s+engine\b/.test(lower) ||
    /\bauto[- ]transfer(?:red|ring)?\s+(?:mechanisms?\s+)?across\s+diseases?\b/.test(
      lower,
    ) ||
    /\bproven\s+causation\b/.test(lower) ||
    /\bcausal(ly)?\s+(proven|established|identified)\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bhr\s*=\s*[\d.]+\b/.test(lower) ||
    /\bor\s*=\s*[\d.]+\b/.test(lower) ||
    /\bprevalence\s*=\s*[\d.]+\s*%?\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower)
  ) {
    throw Error(
      `${label} must not diagnose/select treatments, claim shared causal mechanism/pathway activation/whole-body simulation, auto-transfer mechanisms, invent effect sizes, or include identifiers`,
    );
  }
}

function assertActor(actor: HsysActor, label: string): HsysActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, HSYS_ACTOR_KINDS, `${label} actorKind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}

function assertPermittedUses(
  uses: readonly HsysPermittedResearchUse[],
): readonly HsysPermittedResearchUse[] {
  if (uses.length === 0) throw Error("At least one permitted research use");
  if (uses.length > 8) throw Error("Too many permitted research uses");
  const seen = new Set<string>();
  for (const use of uses) {
    assertClosed(use, HSYS_PERMITTED_RESEARCH_USES, "permitted research use");
    if (seen.has(use)) throw Error("Duplicate permitted research use");
    seen.add(use);
  }
  return [...uses];
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
  minItems: number,
  maxItems: number,
): readonly string[] {
  if (values.length < minItems) throw Error(`At least ${minItems} ${label}`);
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  const seen = new Set<string>();
  return values.map((v) => {
    if (!re.test(v)) throw Error(`Invalid ${label}`);
    if (seen.has(v)) throw Error(`Duplicate ${label}`);
    seen.add(v);
    return v;
  });
}

function assertOptionalIdList(
  values: readonly string[] | undefined,
  re: RegExp,
  label: string,
  maxItems: number,
): readonly string[] {
  return assertIdList(values ?? [], re, label, 0, maxItems);
}

function resolveDataBasis(
  datasetAvailability: HsysDatasetAvailability,
  accessClassification: HsysAccessClassification,
): {dataBasis: HsysDataBasis; fixtureHonesty: boolean} {
  if (datasetAvailability === "fixture_only") {
    return {dataBasis: "fixture_engineering", fixtureHonesty: true};
  }
  if (datasetAvailability === "blocked_no_authorised_clinical_dataset") {
    return {dataBasis: "fixture_engineering", fixtureHonesty: true};
  }
  if (accessClassification === "fixture_engineering") {
    return {dataBasis: "fixture_engineering", fixtureHonesty: true};
  }
  if (accessClassification === "authorised_aggregate_only") {
    return {dataBasis: "declared_research", fixtureHonesty: false};
  }
  return {dataBasis: "authorised_public_data", fixtureHonesty: false};
}

function resolveInitialLifecycle(
  datasetAvailability: HsysDatasetAvailability,
  blockedNoEngine?: boolean,
): HsysLifecycle {
  if (blockedNoEngine) return "blocked_no_live_multiscale_engine";
  if (datasetAvailability === "blocked_no_authorised_clinical_dataset") {
    return "blocked_awaiting_authorised_dataset";
  }
  return "draft";
}

function transitionEnvelope<T extends {lifecycle: HsysLifecycle; reviewedBy: HsysActor | null; updatedAt: string; datasetAvailability: HsysDatasetAvailability}>(
  current: T,
  to: HsysLifecycle,
  updatedAt: string,
  actor: HsysActor,
  validate: (value: T) => T,
  options?: {refuseAcceptWhenBlockedDataset?: boolean; refuseAcceptWhenEngineBlocked?: boolean},
): T {
  assertClosed(to, HSYS_LIFECYCLES, "lifecycle");
  if (!isIsoTimestamp(updatedAt)) throw Error("Invalid updatedAt");
  const transitionActor = assertActor(actor, "transition actor");
  const allowed = LIFECYCLE_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(to)) {
    throw Error(`Illegal lifecycle transition ${current.lifecycle} → ${to}`);
  }
  if (
    (to === "accepted_with_limitations" || to === "rejected") &&
    transitionActor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may accept or reject");
  }
  if (
    options?.refuseAcceptWhenBlockedDataset !== false &&
    to === "accepted_with_limitations" &&
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset"
  ) {
    throw Error("Cannot accept while authorised dataset is blocked");
  }
  if (
    options?.refuseAcceptWhenEngineBlocked &&
    to === "accepted_with_limitations" &&
    current.lifecycle === "blocked_no_live_multiscale_engine"
  ) {
    throw Error("Cannot accept while live multiscale engine is blocked");
  }
  return validate({
    ...current,
    lifecycle: to,
    reviewedBy:
      to === "accepted_with_limitations" || to === "rejected"
        ? transitionActor
        : current.reviewedBy,
    updatedAt,
  });
}

export function draftCrossDiseaseInvestigation(input: {
  id: string;
  displayName: string;
  scientificQuestion: string;
  diseaseContextIds: readonly string[];
  permittedResearchUses: readonly HsysPermittedResearchUse[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: HsysActorKind;
  datasetAvailability?: HsysDatasetAvailability;
  accessClassification?: HsysAccessClassification;
  csolSpecId?: string | null;
  rweStudyId?: string | null;
  longitudinalAnalysisSpecId?: string | null;
  cohortDefinitionId?: string | null;
  note?: string;
}): CrossDiseaseInvestigation {
  if (!INV_ID_RE.test(input.id)) throw Error("Invalid investigation id");
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  if (!textOk(input.scientificQuestion, 2000)) {
    throw Error("Invalid scientificQuestion");
  }
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(
    input.scientificQuestion,
    "scientificQuestion",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const datasetAvailability =
    input.datasetAvailability ?? "fixture_only";
  assertClosed(
    datasetAvailability,
    HSYS_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  const accessClassification =
    input.accessClassification ??
    (datasetAvailability === "fixture_only"
      ? "fixture_engineering"
      : "authorised_aggregate_only");
  assertClosed(
    accessClassification,
    HSYS_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );
  const {dataBasis, fixtureHonesty} = resolveDataBasis(
    datasetAvailability,
    accessClassification,
  );
  const actorKind = input.authoredByActorKind ?? "ai_agent";

  const investigation: CrossDiseaseInvestigation = {
    schema: HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA,
    method: HUMAN_SYSTEMS_INTELLIGENCE_METHOD,
    version: HUMAN_SYSTEMS_INTELLIGENCE_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    diseaseContextIds: assertIdList(
      input.diseaseContextIds,
      HDI_CTX_RE,
      "diseaseContextIds",
      2,
      16,
    ),
    permittedResearchUses: assertPermittedUses(input.permittedResearchUses),
    datasetAvailability,
    accessClassification,
    autoTransferAcrossDiseases: false,
    containsIdentifiablePhi: false,
    csolSpecId: assertOptionalId(input.csolSpecId, CSOL_SPEC_RE, "csolSpecId"),
    rweStudyId: assertOptionalId(input.rweStudyId, RWE_STUDY_RE, "rweStudyId"),
    longitudinalAnalysisSpecId: assertOptionalId(
      input.longitudinalAnalysisSpecId,
      LCE_SPEC_RE,
      "longitudinalAnalysisSpecId",
    ),
    cohortDefinitionId: assertOptionalId(
      input.cohortDefinitionId,
      RCB_COH_RE,
      "cohortDefinitionId",
    ),
    lifecycle: resolveInitialLifecycle(datasetAvailability),
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
  return validateCrossDiseaseInvestigation(investigation);
}

export function validateCrossDiseaseInvestigation(
  investigation: CrossDiseaseInvestigation,
): CrossDiseaseInvestigation {
  if (!INV_ID_RE.test(investigation.id)) {
    throw Error("Invalid investigation id");
  }
  assertIdList(
    investigation.diseaseContextIds,
    HDI_CTX_RE,
    "diseaseContextIds",
    2,
    16,
  );
  if (investigation.autoTransferAcrossDiseases !== false) {
    throw Error("Auto-transfer across diseases forbidden");
  }
  if (investigation.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  assertClosed(investigation.lifecycle, HSYS_LIFECYCLES, "lifecycle");
  assertHonesty(investigation.honesty);
  assertActor(investigation.authoredBy, "author");
  if (investigation.reviewedBy !== null) {
    assertActor(investigation.reviewedBy, "reviewer");
  }
  return investigation;
}

export function transitionCrossDiseaseInvestigation(input: {
  investigation: CrossDiseaseInvestigation;
  to: HsysLifecycle;
  updatedAt: string;
  actor: HsysActor;
}): CrossDiseaseInvestigation {
  return transitionEnvelope(
    validateCrossDiseaseInvestigation(input.investigation),
    input.to,
    input.updatedAt,
    input.actor,
    validateCrossDiseaseInvestigation,
  );
}

export function draftCrossDiseaseMechanismRelationship(input: {
  id: string;
  investigation: CrossDiseaseInvestigation;
  displayName: string;
  diseaseContextIdA: string;
  diseaseContextIdB: string;
  relationshipClassification: CrossDiseaseMechanismRelationshipClassification;
  mechanismSummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: HsysActorKind;
  ontologyConceptRef?: string | null;
  provenanceNote?: string;
  note?: string;
}): CrossDiseaseMechanismRelationship {
  if (!CMR_ID_RE.test(input.id)) {
    throw Error("Invalid mechanism relationship id");
  }
  const investigation = validateCrossDiseaseInvestigation(input.investigation);
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  if (!textOk(input.mechanismSummary, 2000)) {
    throw Error("Invalid mechanismSummary");
  }
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(input.mechanismSummary, "mechanismSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertClosed(
    input.relationshipClassification,
    CROSS_DISEASE_MECHANISM_RELATIONSHIP_CLASSIFICATIONS,
    "relationshipClassification",
  );
  if (!HDI_CTX_RE.test(input.diseaseContextIdA)) {
    throw Error("Invalid diseaseContextIdA");
  }
  if (!HDI_CTX_RE.test(input.diseaseContextIdB)) {
    throw Error("Invalid diseaseContextIdB");
  }
  if (input.diseaseContextIdA === input.diseaseContextIdB) {
    throw Error("Mechanism relationship requires two distinct disease contexts");
  }
  if (!investigation.diseaseContextIds.includes(input.diseaseContextIdA)) {
    throw Error("diseaseContextIdA must belong to investigation");
  }
  if (!investigation.diseaseContextIds.includes(input.diseaseContextIdB)) {
    throw Error("diseaseContextIdB must belong to investigation");
  }
  const summaryForClaims = stripHonestyNegations(input.mechanismSummary);
  if (
    input.relationshipClassification === "shared_gene_association" &&
    /shared\s+causal\s+mechanism/.test(summaryForClaims)
  ) {
    throw Error("Shared gene association must not claim shared causal mechanism");
  }
  if (
    input.relationshipClassification === "shared_pathway_enrichment" &&
    /pathway\s+activation/.test(summaryForClaims)
  ) {
    throw Error("Pathway enrichment must not claim pathway activation");
  }
  if (
    input.relationshipClassification === "co_occurrence_association" &&
    /\bcausation\b/.test(summaryForClaims)
  ) {
    throw Error("Co-occurrence association must not claim causation");
  }

  const ontologyConceptRef =
    input.ontologyConceptRef === undefined || input.ontologyConceptRef === null
      ? null
      : (() => {
          if (!REF_ID_RE.test(input.ontologyConceptRef)) {
            throw Error("Invalid ontologyConceptRef");
          }
          return input.ontologyConceptRef;
        })();
  const provenanceNote = (input.provenanceNote ?? "fixture_declared").trim();
  if (!textOk(provenanceNote, 500)) throw Error("Invalid provenanceNote");
  assertNoForbiddenClaimLanguage(provenanceNote, "provenanceNote");

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const relationship: CrossDiseaseMechanismRelationship = {
    schema: HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA,
    method: HUMAN_SYSTEMS_INTELLIGENCE_METHOD,
    version: HUMAN_SYSTEMS_INTELLIGENCE_VERSION,
    id: input.id,
    investigationId: investigation.id,
    displayName: input.displayName.trim(),
    diseaseContextIdA: input.diseaseContextIdA,
    diseaseContextIdB: input.diseaseContextIdB,
    relationshipClassification: input.relationshipClassification,
    mechanismSummary: input.mechanismSummary.trim(),
    sharedGeneIsNotSharedCausalMechanism: true,
    pathwayEnrichmentIsNotActivation: true,
    coOccurrenceIsNotCausation: true,
    autoTransferAcrossDiseases: false,
    causalIdentificationClaimed: false,
    inventedStatistics: null,
    ontologyConceptRef,
    provenanceNote,
    limitations: assertLimitations(input.limitations),
    datasetAvailability: investigation.datasetAvailability,
    lifecycle: resolveInitialLifecycle(investigation.datasetAvailability),
    reviewedBy: null,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    dataBasis: investigation.dataBasis,
    fixtureHonesty: investigation.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateCrossDiseaseMechanismRelationship(relationship);
}

export function validateCrossDiseaseMechanismRelationship(
  relationship: CrossDiseaseMechanismRelationship,
): CrossDiseaseMechanismRelationship {
  if (!CMR_ID_RE.test(relationship.id)) {
    throw Error("Invalid mechanism relationship id");
  }
  if (!INV_ID_RE.test(relationship.investigationId)) {
    throw Error("Invalid investigationId");
  }
  assertClosed(
    relationship.relationshipClassification,
    CROSS_DISEASE_MECHANISM_RELATIONSHIP_CLASSIFICATIONS,
    "relationshipClassification",
  );
  if (relationship.sharedGeneIsNotSharedCausalMechanism !== true) {
    throw Error("Shared gene ≠ shared causal mechanism honesty required");
  }
  if (relationship.pathwayEnrichmentIsNotActivation !== true) {
    throw Error("Pathway enrichment ≠ activation honesty required");
  }
  if (relationship.coOccurrenceIsNotCausation !== true) {
    throw Error("Co-occurrence ≠ causation honesty required");
  }
  if (relationship.autoTransferAcrossDiseases !== false) {
    throw Error("Auto-transfer across diseases forbidden");
  }
  if (relationship.causalIdentificationClaimed !== false) {
    throw Error("Causal identification claims forbidden");
  }
  if (relationship.inventedStatistics !== null) {
    throw Error("Invented statistics forbidden");
  }
  assertLimitations(relationship.limitations);
  assertClosed(relationship.lifecycle, HSYS_LIFECYCLES, "lifecycle");
  assertHonesty(relationship.honesty);
  assertActor(relationship.authoredBy, "author");
  if (relationship.reviewedBy !== null) {
    assertActor(relationship.reviewedBy, "reviewer");
  }
  return relationship;
}

export function transitionCrossDiseaseMechanismRelationship(input: {
  relationship: CrossDiseaseMechanismRelationship;
  to: HsysLifecycle;
  updatedAt: string;
  actor: HsysActor;
}): CrossDiseaseMechanismRelationship {
  return transitionEnvelope(
    validateCrossDiseaseMechanismRelationship(input.relationship),
    input.to,
    input.updatedAt,
    input.actor,
    validateCrossDiseaseMechanismRelationship,
  );
}

export function draftOrganSystemRelationship(input: {
  id: string;
  displayName: string;
  organSystemA: OrganSystemLabel;
  organSystemB: OrganSystemLabel;
  relationshipKind: OrganSystemRelationshipKind;
  relationshipSummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: HsysActorKind;
  investigation?: CrossDiseaseInvestigation | null;
  csolSpecId?: string | null;
  ontologyConceptRef?: string | null;
  datasetAvailability?: HsysDatasetAvailability;
  note?: string;
}): OrganSystemRelationship {
  if (!OSR_ID_RE.test(input.id)) {
    throw Error("Invalid organ-system relationship id");
  }
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  if (!textOk(input.relationshipSummary, 2000)) {
    throw Error("Invalid relationshipSummary");
  }
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(
    input.relationshipSummary,
    "relationshipSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertClosed(input.organSystemA, ORGAN_SYSTEM_LABELS, "organSystemA");
  assertClosed(input.organSystemB, ORGAN_SYSTEM_LABELS, "organSystemB");
  if (input.organSystemA === input.organSystemB) {
    throw Error("Organ-system relationship requires two distinct systems");
  }
  assertClosed(
    input.relationshipKind,
    ORGAN_SYSTEM_RELATIONSHIP_KINDS,
    "relationshipKind",
  );

  const investigation =
    input.investigation === undefined || input.investigation === null
      ? null
      : validateCrossDiseaseInvestigation(input.investigation);
  const datasetAvailability =
    input.datasetAvailability ??
    investigation?.datasetAvailability ??
    "fixture_only";
  assertClosed(
    datasetAvailability,
    HSYS_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  const {dataBasis, fixtureHonesty} = resolveDataBasis(
    datasetAvailability,
    investigation?.accessClassification ?? "fixture_engineering",
  );
  const ontologyConceptRef =
    input.ontologyConceptRef === undefined || input.ontologyConceptRef === null
      ? null
      : (() => {
          if (!REF_ID_RE.test(input.ontologyConceptRef)) {
            throw Error("Invalid ontologyConceptRef");
          }
          return input.ontologyConceptRef;
        })();
  const actorKind = input.authoredByActorKind ?? "ai_agent";

  const relationship: OrganSystemRelationship = {
    schema: HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA,
    method: HUMAN_SYSTEMS_INTELLIGENCE_METHOD,
    version: HUMAN_SYSTEMS_INTELLIGENCE_VERSION,
    id: input.id,
    investigationId: investigation?.id ?? null,
    displayName: input.displayName.trim(),
    organSystemA: input.organSystemA,
    organSystemB: input.organSystemB,
    relationshipKind: input.relationshipKind,
    relationshipSummary: input.relationshipSummary.trim(),
    wholeBodyPhysiologyClaimed: false,
    csolSpecId: assertOptionalId(input.csolSpecId, CSOL_SPEC_RE, "csolSpecId"),
    ontologyConceptRef,
    limitations: assertLimitations(input.limitations),
    datasetAvailability,
    lifecycle: resolveInitialLifecycle(datasetAvailability),
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
  return validateOrganSystemRelationship(relationship);
}

export function validateOrganSystemRelationship(
  relationship: OrganSystemRelationship,
): OrganSystemRelationship {
  if (!OSR_ID_RE.test(relationship.id)) {
    throw Error("Invalid organ-system relationship id");
  }
  if (relationship.wholeBodyPhysiologyClaimed !== false) {
    throw Error("Whole-body physiology claims forbidden");
  }
  assertClosed(relationship.organSystemA, ORGAN_SYSTEM_LABELS, "organSystemA");
  assertClosed(relationship.organSystemB, ORGAN_SYSTEM_LABELS, "organSystemB");
  assertClosed(
    relationship.relationshipKind,
    ORGAN_SYSTEM_RELATIONSHIP_KINDS,
    "relationshipKind",
  );
  assertLimitations(relationship.limitations);
  assertClosed(relationship.lifecycle, HSYS_LIFECYCLES, "lifecycle");
  assertHonesty(relationship.honesty);
  assertActor(relationship.authoredBy, "author");
  if (relationship.reviewedBy !== null) {
    assertActor(relationship.reviewedBy, "reviewer");
  }
  return relationship;
}

export function transitionOrganSystemRelationship(input: {
  relationship: OrganSystemRelationship;
  to: HsysLifecycle;
  updatedAt: string;
  actor: HsysActor;
}): OrganSystemRelationship {
  return transitionEnvelope(
    validateOrganSystemRelationship(input.relationship),
    input.to,
    input.updatedAt,
    input.actor,
    validateOrganSystemRelationship,
  );
}

export function draftMultimorbidityResearchContext(input: {
  id: string;
  displayName: string;
  diseaseContextIds: readonly string[];
  populationFraming: string;
  coOccurrenceFraming: string;
  permittedResearchUses: readonly HsysPermittedResearchUse[];
  limitations: readonly string[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: HsysActorKind;
  investigation?: CrossDiseaseInvestigation | null;
  datasetAvailability?: HsysDatasetAvailability;
  accessClassification?: HsysAccessClassification;
  rweStudyId?: string | null;
  longitudinalAnalysisSpecId?: string | null;
  cohortDefinitionId?: string | null;
  note?: string;
}): MultimorbidityResearchContext {
  if (!MM_ID_RE.test(input.id)) {
    throw Error("Invalid multimorbidity context id");
  }
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  if (!textOk(input.populationFraming, 2000)) {
    throw Error("Invalid populationFraming");
  }
  if (!textOk(input.coOccurrenceFraming, 2000)) {
    throw Error("Invalid coOccurrenceFraming");
  }
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(input.populationFraming, "populationFraming");
  assertNoForbiddenClaimLanguage(
    input.coOccurrenceFraming,
    "coOccurrenceFraming",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const investigation =
    input.investigation === undefined || input.investigation === null
      ? null
      : validateCrossDiseaseInvestigation(input.investigation);
  const datasetAvailability =
    input.datasetAvailability ??
    investigation?.datasetAvailability ??
    "fixture_only";
  assertClosed(
    datasetAvailability,
    HSYS_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  const accessClassification =
    input.accessClassification ??
    investigation?.accessClassification ??
    (datasetAvailability === "fixture_only"
      ? "fixture_engineering"
      : "authorised_aggregate_only");
  assertClosed(
    accessClassification,
    HSYS_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );
  const {dataBasis, fixtureHonesty} = resolveDataBasis(
    datasetAvailability,
    accessClassification,
  );
  const actorKind = input.authoredByActorKind ?? "ai_agent";

  const context: MultimorbidityResearchContext = {
    schema: HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA,
    method: HUMAN_SYSTEMS_INTELLIGENCE_METHOD,
    version: HUMAN_SYSTEMS_INTELLIGENCE_VERSION,
    id: input.id,
    investigationId: investigation?.id ?? null,
    displayName: input.displayName.trim(),
    diseaseContextIds: assertIdList(
      input.diseaseContextIds,
      HDI_CTX_RE,
      "diseaseContextIds",
      2,
      16,
    ),
    populationFraming: input.populationFraming.trim(),
    coOccurrenceFraming: input.coOccurrenceFraming.trim(),
    coOccurrenceIsNotCausation: true,
    causalMultimorbidityNetworkClaimed: false,
    inventedPrevalenceOrEffectSize: null,
    permittedResearchUses: assertPermittedUses(input.permittedResearchUses),
    datasetAvailability,
    accessClassification,
    rweStudyId: assertOptionalId(input.rweStudyId, RWE_STUDY_RE, "rweStudyId"),
    longitudinalAnalysisSpecId: assertOptionalId(
      input.longitudinalAnalysisSpecId,
      LCE_SPEC_RE,
      "longitudinalAnalysisSpecId",
    ),
    cohortDefinitionId: assertOptionalId(
      input.cohortDefinitionId,
      RCB_COH_RE,
      "cohortDefinitionId",
    ),
    limitations: assertLimitations(input.limitations),
    lifecycle: resolveInitialLifecycle(datasetAvailability),
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
  return validateMultimorbidityResearchContext(context);
}

export function validateMultimorbidityResearchContext(
  context: MultimorbidityResearchContext,
): MultimorbidityResearchContext {
  if (!MM_ID_RE.test(context.id)) {
    throw Error("Invalid multimorbidity context id");
  }
  assertIdList(
    context.diseaseContextIds,
    HDI_CTX_RE,
    "diseaseContextIds",
    2,
    16,
  );
  if (context.coOccurrenceIsNotCausation !== true) {
    throw Error("Co-occurrence ≠ causation honesty required");
  }
  if (context.causalMultimorbidityNetworkClaimed !== false) {
    throw Error("Causal multimorbidity network claims forbidden");
  }
  if (context.inventedPrevalenceOrEffectSize !== null) {
    throw Error("Invented prevalence/effect sizes forbidden");
  }
  assertLimitations(context.limitations);
  assertClosed(context.lifecycle, HSYS_LIFECYCLES, "lifecycle");
  assertHonesty(context.honesty);
  assertActor(context.authoredBy, "author");
  if (context.reviewedBy !== null) {
    assertActor(context.reviewedBy, "reviewer");
  }
  return context;
}

export function transitionMultimorbidityResearchContext(input: {
  context: MultimorbidityResearchContext;
  to: HsysLifecycle;
  updatedAt: string;
  actor: HsysActor;
}): MultimorbidityResearchContext {
  return transitionEnvelope(
    validateMultimorbidityResearchContext(input.context),
    input.to,
    input.updatedAt,
    input.actor,
    validateMultimorbidityResearchContext,
  );
}

export function draftSystemsSimulation(input: {
  id: string;
  displayName: string;
  researchQuestion: string;
  validationScope: SystemsSimulationValidationScope;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: HsysActorKind;
  investigation?: CrossDiseaseInvestigation | null;
  multimorbidityContext?: MultimorbidityResearchContext | null;
  organSystemRelationshipIds?: readonly string[];
  mechanismRelationshipIds?: readonly string[];
  datasetAvailability?: HsysDatasetAvailability;
  accessClassification?: HsysAccessClassification;
  note?: string;
}): SystemsSimulation {
  if (!SIM_ID_RE.test(input.id)) throw Error("Invalid systems simulation id");
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  if (!textOk(input.researchQuestion, 2000)) {
    throw Error("Invalid researchQuestion");
  }
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(input.researchQuestion, "researchQuestion");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertClosed(
    input.validationScope,
    SYSTEMS_SIMULATION_VALIDATION_SCOPES,
    "validationScope",
  );

  const investigation =
    input.investigation === undefined || input.investigation === null
      ? null
      : validateCrossDiseaseInvestigation(input.investigation);
  const multimorbidityContext =
    input.multimorbidityContext === undefined ||
    input.multimorbidityContext === null
      ? null
      : validateMultimorbidityResearchContext(input.multimorbidityContext);

  const datasetAvailability =
    input.datasetAvailability ??
    investigation?.datasetAvailability ??
    multimorbidityContext?.datasetAvailability ??
    "fixture_only";
  assertClosed(
    datasetAvailability,
    HSYS_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  const accessClassification =
    input.accessClassification ??
    investigation?.accessClassification ??
    multimorbidityContext?.accessClassification ??
    (datasetAvailability === "fixture_only"
      ? "fixture_engineering"
      : "authorised_aggregate_only");
  assertClosed(
    accessClassification,
    HSYS_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );

  if (
    input.validationScope === "fixture_engineering_only" &&
    datasetAvailability === "authorised_declared"
  ) {
    throw Error(
      "Fixture engineering validation scope cannot claim authorised dataset",
    );
  }
  if (
    (input.validationScope === "blocked_no_authorised_dataset" ||
      datasetAvailability === "blocked_no_authorised_clinical_dataset") &&
    /scientifically\s+validated/i.test(input.researchQuestion)
  ) {
    throw Error(
      "Blocked dataset paths must not claim scientific validation",
    );
  }

  const blockedNoEngine =
    input.validationScope === "blocked_no_live_multiscale_engine";
  const {dataBasis, fixtureHonesty} = resolveDataBasis(
    datasetAvailability,
    accessClassification,
  );
  const actorKind = input.authoredByActorKind ?? "ai_agent";

  const simulation: SystemsSimulation = {
    schema: HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA,
    method: HUMAN_SYSTEMS_INTELLIGENCE_METHOD,
    version: HUMAN_SYSTEMS_INTELLIGENCE_VERSION,
    id: input.id,
    investigationId: investigation?.id ?? null,
    multimorbidityContextId: multimorbidityContext?.id ?? null,
    displayName: input.displayName.trim(),
    researchQuestion: input.researchQuestion.trim(),
    validationScope: input.validationScope,
    researchOnly: true,
    wholeBodySimulationClaimed: false,
    liveMultiscaleEngineOperational: false,
    m11SimulationClaimed: false,
    notDiagnosisOrTreatmentSelection: true,
    inventedParameters: null,
    limitations: assertLimitations(input.limitations),
    datasetAvailability,
    accessClassification,
    organSystemRelationshipIds: assertOptionalIdList(
      input.organSystemRelationshipIds,
      OSR_ID_RE,
      "organSystemRelationshipIds",
      16,
    ),
    mechanismRelationshipIds: assertOptionalIdList(
      input.mechanismRelationshipIds,
      CMR_ID_RE,
      "mechanismRelationshipIds",
      16,
    ),
    lifecycle: resolveInitialLifecycle(datasetAvailability, blockedNoEngine),
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
  return validateSystemsSimulation(simulation);
}

export function validateSystemsSimulation(
  simulation: SystemsSimulation,
): SystemsSimulation {
  if (!SIM_ID_RE.test(simulation.id)) {
    throw Error("Invalid systems simulation id");
  }
  if (simulation.researchOnly !== true) {
    throw Error("Systems simulations must be research-only");
  }
  if (simulation.wholeBodySimulationClaimed !== false) {
    throw Error("Whole-body simulation claims forbidden");
  }
  if (simulation.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine forbidden");
  }
  if (simulation.m11SimulationClaimed !== false) {
    throw Error("M11 simulation claims forbidden");
  }
  if (simulation.notDiagnosisOrTreatmentSelection !== true) {
    throw Error("Diagnosis/treatment selection forbidden");
  }
  if (simulation.inventedParameters !== null) {
    throw Error("Invented parameters forbidden");
  }
  assertClosed(
    simulation.validationScope,
    SYSTEMS_SIMULATION_VALIDATION_SCOPES,
    "validationScope",
  );
  assertLimitations(simulation.limitations);
  assertClosed(simulation.lifecycle, HSYS_LIFECYCLES, "lifecycle");
  assertHonesty(simulation.honesty);
  assertActor(simulation.authoredBy, "author");
  if (simulation.reviewedBy !== null) {
    assertActor(simulation.reviewedBy, "reviewer");
  }
  return simulation;
}

export function transitionSystemsSimulation(input: {
  simulation: SystemsSimulation;
  to: HsysLifecycle;
  updatedAt: string;
  actor: HsysActor;
}): SystemsSimulation {
  const current = validateSystemsSimulation(input.simulation);
  if (
    input.to === "accepted_with_limitations" &&
    current.wholeBodySimulationClaimed !== false
  ) {
    throw Error("Cannot accept whole-body simulation claim");
  }
  if (
    input.to === "accepted_with_limitations" &&
    current.liveMultiscaleEngineOperational !== false
  ) {
    throw Error("Cannot accept simulation claiming live multiscale engine");
  }
  return transitionEnvelope(
    current,
    input.to,
    input.updatedAt,
    input.actor,
    validateSystemsSimulation,
    {refuseAcceptWhenEngineBlocked: true},
  );
}

export function createMemoryHumanSystemsIntelligenceStore(): HumanSystemsIntelligenceStore & {
  investigations: Map<string, CrossDiseaseInvestigation>;
  mechanismRelationships: Map<string, CrossDiseaseMechanismRelationship>;
  organSystemRelationships: Map<string, OrganSystemRelationship>;
  multimorbidityContexts: Map<string, MultimorbidityResearchContext>;
  systemsSimulations: Map<string, SystemsSimulation>;
} {
  const investigations = new Map<string, CrossDiseaseInvestigation>();
  const mechanismRelationships = new Map<
    string,
    CrossDiseaseMechanismRelationship
  >();
  const organSystemRelationships = new Map<string, OrganSystemRelationship>();
  const multimorbidityContexts = new Map<
    string,
    MultimorbidityResearchContext
  >();
  const systemsSimulations = new Map<string, SystemsSimulation>();

  return {
    investigations,
    mechanismRelationships,
    organSystemRelationships,
    multimorbidityContexts,
    systemsSimulations,
    upsertInvestigation(investigation) {
      const validated = validateCrossDiseaseInvestigation(investigation);
      investigations.set(validated.id, validated);
      return validated;
    },
    getInvestigation(id) {
      return investigations.get(id) ?? null;
    },
    listInvestigations() {
      return [...investigations.values()];
    },
    upsertMechanismRelationship(relationship) {
      const validated = validateCrossDiseaseMechanismRelationship(relationship);
      mechanismRelationships.set(validated.id, validated);
      return validated;
    },
    getMechanismRelationship(id) {
      return mechanismRelationships.get(id) ?? null;
    },
    listMechanismRelationships(investigationId) {
      const all = [...mechanismRelationships.values()];
      return investigationId
        ? all.filter((r) => r.investigationId === investigationId)
        : all;
    },
    upsertOrganSystemRelationship(relationship) {
      const validated = validateOrganSystemRelationship(relationship);
      organSystemRelationships.set(validated.id, validated);
      return validated;
    },
    getOrganSystemRelationship(id) {
      return organSystemRelationships.get(id) ?? null;
    },
    listOrganSystemRelationships(investigationId) {
      const all = [...organSystemRelationships.values()];
      return investigationId
        ? all.filter((r) => r.investigationId === investigationId)
        : all;
    },
    upsertMultimorbidityContext(context) {
      const validated = validateMultimorbidityResearchContext(context);
      multimorbidityContexts.set(validated.id, validated);
      return validated;
    },
    getMultimorbidityContext(id) {
      return multimorbidityContexts.get(id) ?? null;
    },
    listMultimorbidityContexts() {
      return [...multimorbidityContexts.values()];
    },
    upsertSystemsSimulation(simulation) {
      const validated = validateSystemsSimulation(simulation);
      systemsSimulations.set(validated.id, validated);
      return validated;
    },
    getSystemsSimulation(id) {
      return systemsSimulations.get(id) ?? null;
    },
    listSystemsSimulations() {
      return [...systemsSimulations.values()];
    },
  };
}

export function projectHumanSystemsIntelligencePersistenceLines(input: {
  investigations: readonly CrossDiseaseInvestigation[];
  mechanismRelationships?: readonly CrossDiseaseMechanismRelationship[];
  organSystemRelationships?: readonly OrganSystemRelationship[];
  multimorbidityContexts?: readonly MultimorbidityResearchContext[];
  systemsSimulations?: readonly SystemsSimulation[];
}): string[] {
  for (const i of input.investigations) validateCrossDiseaseInvestigation(i);
  for (const r of input.mechanismRelationships ?? []) {
    validateCrossDiseaseMechanismRelationship(r);
  }
  for (const r of input.organSystemRelationships ?? []) {
    validateOrganSystemRelationship(r);
  }
  for (const c of input.multimorbidityContexts ?? []) {
    validateMultimorbidityResearchContext(c);
  }
  for (const s of input.systemsSimulations ?? []) {
    validateSystemsSimulation(s);
  }

  return [
    `schema=${HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA}`,
    `method=${HUMAN_SYSTEMS_INTELLIGENCE_METHOD}`,
    `version=${HUMAN_SYSTEMS_INTELLIGENCE_VERSION}`,
    `investigations=${input.investigations.length}`,
    `mechanismRelationships=${(input.mechanismRelationships ?? []).length}`,
    `organSystemRelationships=${(input.organSystemRelationships ?? []).length}`,
    `multimorbidityContexts=${(input.multimorbidityContexts ?? []).length}`,
    `systemsSimulations=${(input.systemsSimulations ?? []).length}`,
    `researchIntelligenceOnly=true`,
    `sharedGeneIsNotSharedCausalMechanism=true`,
    `pathwayEnrichmentIsNotActivation=true`,
    `coOccurrenceIsNotCausation=true`,
    `noAutoTransferAcrossDiseases=true`,
    `noDuplicateEntityRegistries=true`,
    `wholeBodySimulationClaimed=false`,
    `liveMultiscaleEngine=false`,
    `m11SimulationClaimed=false`,
    `noInventedMechanismsOrStatistics=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintCrossDiseaseInvestigation(
  investigation: CrossDiseaseInvestigation,
): string {
  const validated = validateCrossDiseaseInvestigation(investigation);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildHumanSystemsIntelligencePack(input: {
  investigations: readonly CrossDiseaseInvestigation[];
  mechanismRelationships: readonly CrossDiseaseMechanismRelationship[];
  organSystemRelationships: readonly OrganSystemRelationship[];
  multimorbidityContexts: readonly MultimorbidityResearchContext[];
  systemsSimulations: readonly SystemsSimulation[];
  asOf: string;
}): {
  schema: typeof HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA;
  method: typeof HUMAN_SYSTEMS_INTELLIGENCE_METHOD;
  version: typeof HUMAN_SYSTEMS_INTELLIGENCE_VERSION;
  asOf: string;
  investigationCount: number;
  mechanismRelationshipCount: number;
  organSystemRelationshipCount: number;
  multimorbidityContextCount: number;
  systemsSimulationCount: number;
  honesty: HumanSystemsIntelligenceHonesty;
  investigations: readonly CrossDiseaseInvestigation[];
  mechanismRelationships: readonly CrossDiseaseMechanismRelationship[];
  organSystemRelationships: readonly OrganSystemRelationship[];
  multimorbidityContexts: readonly MultimorbidityResearchContext[];
  systemsSimulations: readonly SystemsSimulation[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const investigations = input.investigations.map(
    validateCrossDiseaseInvestigation,
  );
  const mechanismRelationships = input.mechanismRelationships.map(
    validateCrossDiseaseMechanismRelationship,
  );
  const organSystemRelationships = input.organSystemRelationships.map(
    validateOrganSystemRelationship,
  );
  const multimorbidityContexts = input.multimorbidityContexts.map(
    validateMultimorbidityResearchContext,
  );
  const systemsSimulations = input.systemsSimulations.map(
    validateSystemsSimulation,
  );
  return {
    schema: HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA,
    method: HUMAN_SYSTEMS_INTELLIGENCE_METHOD,
    version: HUMAN_SYSTEMS_INTELLIGENCE_VERSION,
    asOf: input.asOf,
    investigationCount: investigations.length,
    mechanismRelationshipCount: mechanismRelationships.length,
    organSystemRelationshipCount: organSystemRelationships.length,
    multimorbidityContextCount: multimorbidityContexts.length,
    systemsSimulationCount: systemsSimulations.length,
    honesty: {...DEFAULT_HONESTY},
    investigations,
    mechanismRelationships,
    organSystemRelationships,
    multimorbidityContexts,
    systemsSimulations,
  };
}
