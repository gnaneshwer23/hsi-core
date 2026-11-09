/**
 * Milestone 16 / PR4 — Immune–Metabolic–Microbiome Intelligence.
 *
 * Extends Gut–Immune–Metabolic Graph contracts for research intelligence:
 * - immune vs metabolic pathway comparison
 * - metabolite–host interaction
 * - microbial function ↔ host pathway mapping
 * - inflammation–metabolic phenotype relationships
 * - disease-context comparisons
 * - evidence contradiction analysis
 *
 * Distinctions (must not collapse):
 * microbial taxonomic association · microbial functional evidence ·
 * metabolite measurement · host molecular response · experimental causal
 * evidence · human observational association.
 *
 * Composes optional gutImmunePack axis labels, M16 PR3 CSBR (`hsi-csbr-*`),
 * M16 PR1 HSI (`hsi-hsys-*`), M16 PR2 CDMI (`hsi-cdmi-*`), and M15 HDI
 * (`hsi-hdi-ctx-*`) via id refs — no duplicate ontology registry.
 *
 * Binding honesty / fail-closed:
 * - Composition correlations ≠ causality.
 * - Animal evidence ≠ automatic human translation.
 * - Do not construct complete gut–immune–metabolic chains from unsupported links.
 * - No PHI/CDS; Gate C auto-approve false; Neon red-wave only; migration deferred;
 *   fixtures ≠ scientific validation.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA =
  "hsi-immune-metabolic-microbiome-intelligence-1" as const;
export const IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD =
  "hsi.immune_metabolic_microbiome_intelligence.v1" as const;
export const IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION =
  "0.1.0" as const;

export const IMMI_CAPABILITY_KINDS = [
  "immune_vs_metabolic_pathway_comparison",
  "metabolite_host_interaction",
  "microbial_function_host_pathway_mapping",
  "inflammation_metabolic_phenotype_relationship",
  "disease_context_comparison",
  "evidence_contradiction_analysis",
] as const;
export type ImmiCapabilityKind = (typeof IMMI_CAPABILITY_KINDS)[number];

/** Evidence distinctions that must stay separated. */
export const IMMI_EVIDENCE_DISTINCTIONS = [
  "microbial_taxonomic_association",
  "microbial_functional_evidence",
  "metabolite_measurement",
  "host_molecular_response",
  "experimental_causal_evidence",
  "human_observational_association",
] as const;
export type ImmiEvidenceDistinction =
  (typeof IMMI_EVIDENCE_DISTINCTIONS)[number];

export const IMMI_AXIS_BANDS = [
  "immune",
  "metabolic",
  "microbiome",
  "inflammation_phenotype",
  "host_pathway",
] as const;
export type ImmiAxisBand = (typeof IMMI_AXIS_BANDS)[number];

export const IMMI_COMPARISON_OUTCOMES = [
  "overlap_declared",
  "divergence_declared",
  "context_dependent_declared",
  "insufficient_to_compare",
  "unsupported",
] as const;
export type ImmiComparisonOutcome =
  (typeof IMMI_COMPARISON_OUTCOMES)[number];

export const IMMI_INTERACTION_KINDS = [
  "association_declared",
  "measurement_linked_declared",
  "host_response_declared",
  "experimental_effect_declared",
  "observational_association_declared",
  "unsupported",
] as const;
export type ImmiInteractionKind = (typeof IMMI_INTERACTION_KINDS)[number];

export const IMMI_MAPPING_OUTCOMES = [
  "supported",
  "unsupported",
  "uncertain",
] as const;
export type ImmiMappingOutcome = (typeof IMMI_MAPPING_OUTCOMES)[number];

export const IMMI_CHAIN_STATUSES = [
  "chain_incomplete_declared",
  "chain_partial_supported_links_only",
  "chain_blocked_unsupported_links",
  "not_applicable_single_link",
] as const;
export type ImmiChainStatus = (typeof IMMI_CHAIN_STATUSES)[number];

export const IMMI_TRANSLATION_STATUSES = [
  "human_evidence_declared",
  "animal_only_declared",
  "mixed_species_declared",
  "in_vitro_only_declared",
  "translation_uncertain",
  "blocked_no_human_translation",
] as const;
export type ImmiTranslationStatus =
  (typeof IMMI_TRANSLATION_STATUSES)[number];

export const IMMI_CONTRADICTION_STATUSES = [
  "none_detected_declared",
  "contradiction_detected_declared",
  "competing_evidence_declared",
  "insufficient_to_analyse",
] as const;
export type ImmiContradictionStatus =
  (typeof IMMI_CONTRADICTION_STATUSES)[number];

export const IMMI_DATASET_AVAILABILITIES = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type ImmiDatasetAvailability =
  (typeof IMMI_DATASET_AVAILABILITIES)[number];

export const IMMI_DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type ImmiDataBasis = (typeof IMMI_DATA_BASES)[number];

export const IMMI_ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type ImmiActorKind = (typeof IMMI_ACTOR_KINDS)[number];

export const IMMI_PROFILE_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_awaiting_authorised_dataset",
  "blocked_unsupported_chain_links",
  "rejected",
  "superseded",
] as const;
export type ImmiProfileLifecycle = (typeof IMMI_PROFILE_LIFECYCLES)[number];

const SCP_ID_RE = /^hsi-immi-scp-[a-z0-9-]{3,80}$/;
const IPC_ID_RE = /^hsi-immi-ipc-[a-z0-9-]{3,80}$/;
const MHI_ID_RE = /^hsi-immi-mhi-[a-z0-9-]{3,80}$/;
const MFM_ID_RE = /^hsi-immi-mfm-[a-z0-9-]{3,80}$/;
const IMP_ID_RE = /^hsi-immi-imp-[a-z0-9-]{3,80}$/;
const DCC_ID_RE = /^hsi-immi-dcc-[a-z0-9-]{3,80}$/;
const ECA_ID_RE = /^hsi-immi-eca-[a-z0-9-]{3,80}$/;
const PRF_ID_RE = /^hsi-immi-prf-[a-z0-9-]{3,80}$/;
const ENT_ID_RE = /^hsi-immi-ent-[a-z0-9-]{3,80}$/;
const CSBR_REF_RE = /^hsi-csbr-[a-z0-9-]{3,80}$/;
const HSYS_REF_RE = /^hsi-hsys-[a-z0-9-]{3,80}$/;
const CDMI_REF_RE = /^hsi-cdmi-[a-z0-9-]{3,80}$/;
const HDI_CTX_RE = /^hsi-hdi-ctx-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type ImmuneMetabolicMicrobiomeIntelligenceHonesty = {
  researchIntelligenceOnly: true;
  notDiagnosisOrTreatmentSelection: true;
  notClinicalDecisionMaking: true;
  compositionCorrelationIsNotCausality: true;
  animalEvidenceIsNotAutomaticHumanTranslation: true;
  unsupportedLinksDoNotCompleteGutImmuneMetabolicChains: true;
  evidenceDistinctionsMustNotCollapse: true;
  noInventedMechanismsOrStatistics: true;
  noPhiIngestion: true;
  noWorkbenchUi: true;
  agentsDraftHumansReview: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  completeUnsupportedChainClaimed: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
};

export type ImmiActor = {
  principalId: string;
  actorKind: ImmiActorKind;
};

export type ImmiEntityRef = {
  id: string;
  label: string;
  axisBand: ImmiAxisBand;
  ontologySystem: string | null;
  ontologyValue: string | null;
  note: string;
};

export type GutImmuneMetabolicGraphScope = {
  schema: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA;
  method: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD;
  version: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION;
  id: string;
  displayName: string;
  scientificQuestion: string;
  coveredAxisBands: readonly ImmiAxisBand[];
  capabilityKinds: readonly ImmiCapabilityKind[];
  evidenceDistinctions: readonly ImmiEvidenceDistinction[];
  diseaseContextIds: readonly string[];
  optionalCsbrScopeId: string | null;
  optionalHsysOrganSystemRelationshipId: string | null;
  optionalCdmiComparativeProfileId: string | null;
  optionalGutImmunePackSchema: string | null;
  datasetAvailability: ImmiDatasetAvailability;
  compositionCorrelationIsCausality: false;
  animalEvidenceAutoTranslatesToHuman: false;
  completeUnsupportedChainClaimed: false;
  containsIdentifiablePhi: false;
  authoredBy: ImmiActor;
  dataBasis: ImmiDataBasis;
  fixtureHonesty: boolean;
  honesty: ImmuneMetabolicMicrobiomeIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ImmuneVsMetabolicPathwayComparisonRecord = {
  schema: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA;
  method: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD;
  version: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION;
  id: string;
  scopeId: string;
  immunePathwayEntity: ImmiEntityRef;
  metabolicPathwayEntity: ImmiEntityRef;
  comparisonOutcome: ImmiComparisonOutcome;
  evidenceDistinction: ImmiEvidenceDistinction;
  comparisonSummary: string;
  compositionCorrelationIsCausality: false;
  authoredBy: ImmiActor;
  dataBasis: ImmiDataBasis;
  fixtureHonesty: boolean;
  honesty: ImmuneMetabolicMicrobiomeIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MetaboliteHostInteractionRecord = {
  schema: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA;
  method: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD;
  version: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION;
  id: string;
  scopeId: string;
  metaboliteEntity: ImmiEntityRef;
  hostEntity: ImmiEntityRef;
  interactionKind: ImmiInteractionKind;
  evidenceDistinction: ImmiEvidenceDistinction;
  translationStatus: ImmiTranslationStatus;
  interactionSummary: string;
  animalEvidenceAutoTranslatesToHuman: false;
  compositionCorrelationIsCausality: false;
  authoredBy: ImmiActor;
  dataBasis: ImmiDataBasis;
  fixtureHonesty: boolean;
  honesty: ImmuneMetabolicMicrobiomeIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MicrobialFunctionHostPathwayMappingRecord = {
  schema: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA;
  method: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD;
  version: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION;
  id: string;
  scopeId: string;
  microbialEntity: ImmiEntityRef;
  hostPathwayEntity: ImmiEntityRef;
  mappingOutcome: ImmiMappingOutcome;
  evidenceDistinction: ImmiEvidenceDistinction;
  chainStatus: ImmiChainStatus;
  mappingSummary: string;
  taxonomicAssociationCollapsedIntoFunctionalEvidence: false;
  completeUnsupportedChainClaimed: false;
  authoredBy: ImmiActor;
  dataBasis: ImmiDataBasis;
  fixtureHonesty: boolean;
  honesty: ImmuneMetabolicMicrobiomeIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type InflammationMetabolicPhenotypeRelationshipRecord = {
  schema: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA;
  method: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD;
  version: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION;
  id: string;
  scopeId: string;
  inflammationEntity: ImmiEntityRef;
  metabolicPhenotypeEntity: ImmiEntityRef;
  mappingOutcome: ImmiMappingOutcome;
  evidenceDistinction: ImmiEvidenceDistinction;
  relationshipSummary: string;
  compositionCorrelationIsCausality: false;
  authoredBy: ImmiActor;
  dataBasis: ImmiDataBasis;
  fixtureHonesty: boolean;
  honesty: ImmuneMetabolicMicrobiomeIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DiseaseContextComparisonRecord = {
  schema: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA;
  method: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD;
  version: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION;
  id: string;
  scopeId: string;
  diseaseContextIds: readonly string[];
  comparisonOutcome: ImmiComparisonOutcome;
  evidenceDistinction: ImmiEvidenceDistinction;
  comparisonSummary: string;
  autoTransferAcrossDiseases: false;
  authoredBy: ImmiActor;
  dataBasis: ImmiDataBasis;
  fixtureHonesty: boolean;
  honesty: ImmuneMetabolicMicrobiomeIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type EvidenceContradictionAnalysisRecord = {
  schema: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA;
  method: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD;
  version: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION;
  id: string;
  scopeId: string;
  relatedRecordIds: readonly string[];
  contradictionStatus: ImmiContradictionStatus;
  evidenceDistinctionsCompared: readonly ImmiEvidenceDistinction[];
  analysisSummary: string;
  distinctionsCollapsed: false;
  authoredBy: ImmiActor;
  dataBasis: ImmiDataBasis;
  fixtureHonesty: boolean;
  honesty: ImmuneMetabolicMicrobiomeIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ImmuneMetabolicMicrobiomeProfile = {
  schema: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA;
  method: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD;
  version: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION;
  id: string;
  displayName: string;
  scopeId: string;
  immuneVsMetabolicPathwayComparisonIds: readonly string[];
  metaboliteHostInteractionIds: readonly string[];
  microbialFunctionHostPathwayMappingIds: readonly string[];
  inflammationMetabolicPhenotypeRelationshipIds: readonly string[];
  diseaseContextComparisonIds: readonly string[];
  evidenceContradictionAnalysisIds: readonly string[];
  profileVersion: string;
  lifecycle: ImmiProfileLifecycle;
  reviewedBy: ImmiActor | null;
  compositionCorrelationIsCausality: false;
  animalEvidenceAutoTranslatesToHuman: false;
  completeUnsupportedChainClaimed: false;
  containsIdentifiablePhi: false;
  limitations: readonly string[];
  authoredBy: ImmiActor;
  dataBasis: ImmiDataBasis;
  fixtureHonesty: boolean;
  honesty: ImmuneMetabolicMicrobiomeIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ImmuneMetabolicMicrobiomeIntelligenceStore = {
  upsertGutImmuneMetabolicGraphScope(
    record: GutImmuneMetabolicGraphScope,
  ): GutImmuneMetabolicGraphScope;
  getGutImmuneMetabolicGraphScope(
    id: string,
  ): GutImmuneMetabolicGraphScope | null;
  listGutImmuneMetabolicGraphScopes(): readonly GutImmuneMetabolicGraphScope[];
  upsertImmuneVsMetabolicPathwayComparison(
    record: ImmuneVsMetabolicPathwayComparisonRecord,
  ): ImmuneVsMetabolicPathwayComparisonRecord;
  getImmuneVsMetabolicPathwayComparison(
    id: string,
  ): ImmuneVsMetabolicPathwayComparisonRecord | null;
  listImmuneVsMetabolicPathwayComparisons(
    scopeId?: string,
  ): readonly ImmuneVsMetabolicPathwayComparisonRecord[];
  upsertMetaboliteHostInteraction(
    record: MetaboliteHostInteractionRecord,
  ): MetaboliteHostInteractionRecord;
  getMetaboliteHostInteraction(
    id: string,
  ): MetaboliteHostInteractionRecord | null;
  listMetaboliteHostInteractions(
    scopeId?: string,
  ): readonly MetaboliteHostInteractionRecord[];
  upsertMicrobialFunctionHostPathwayMapping(
    record: MicrobialFunctionHostPathwayMappingRecord,
  ): MicrobialFunctionHostPathwayMappingRecord;
  getMicrobialFunctionHostPathwayMapping(
    id: string,
  ): MicrobialFunctionHostPathwayMappingRecord | null;
  listMicrobialFunctionHostPathwayMappings(
    scopeId?: string,
  ): readonly MicrobialFunctionHostPathwayMappingRecord[];
  upsertInflammationMetabolicPhenotypeRelationship(
    record: InflammationMetabolicPhenotypeRelationshipRecord,
  ): InflammationMetabolicPhenotypeRelationshipRecord;
  getInflammationMetabolicPhenotypeRelationship(
    id: string,
  ): InflammationMetabolicPhenotypeRelationshipRecord | null;
  listInflammationMetabolicPhenotypeRelationships(
    scopeId?: string,
  ): readonly InflammationMetabolicPhenotypeRelationshipRecord[];
  upsertDiseaseContextComparison(
    record: DiseaseContextComparisonRecord,
  ): DiseaseContextComparisonRecord;
  getDiseaseContextComparison(
    id: string,
  ): DiseaseContextComparisonRecord | null;
  listDiseaseContextComparisons(
    scopeId?: string,
  ): readonly DiseaseContextComparisonRecord[];
  upsertEvidenceContradictionAnalysis(
    record: EvidenceContradictionAnalysisRecord,
  ): EvidenceContradictionAnalysisRecord;
  getEvidenceContradictionAnalysis(
    id: string,
  ): EvidenceContradictionAnalysisRecord | null;
  listEvidenceContradictionAnalyses(
    scopeId?: string,
  ): readonly EvidenceContradictionAnalysisRecord[];
  upsertProfile(
    record: ImmuneMetabolicMicrobiomeProfile,
  ): ImmuneMetabolicMicrobiomeProfile;
  getProfile(id: string): ImmuneMetabolicMicrobiomeProfile | null;
  listProfiles(scopeId?: string): readonly ImmuneMetabolicMicrobiomeProfile[];
};

const DEFAULT_HONESTY: ImmuneMetabolicMicrobiomeIntelligenceHonesty = {
  researchIntelligenceOnly: true,
  notDiagnosisOrTreatmentSelection: true,
  notClinicalDecisionMaking: true,
  compositionCorrelationIsNotCausality: true,
  animalEvidenceIsNotAutomaticHumanTranslation: true,
  unsupportedLinksDoNotCompleteGutImmuneMetabolicChains: true,
  evidenceDistinctionsMustNotCollapse: true,
  noInventedMechanismsOrStatistics: true,
  noPhiIngestion: true,
  noWorkbenchUi: true,
  agentsDraftHumansReview: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  completeUnsupportedChainClaimed: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
};

const PROFILE_TRANSITIONS: Record<
  ImmiProfileLifecycle,
  readonly ImmiProfileLifecycle[]
> = {
  draft: [
    "under_review",
    "blocked_awaiting_authorised_dataset",
    "blocked_unsupported_chain_links",
    "rejected",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_awaiting_authorised_dataset",
    "blocked_unsupported_chain_links",
    "rejected",
    "draft",
  ],
  accepted_with_limitations: ["superseded"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
  blocked_unsupported_chain_links: ["draft", "rejected"],
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

function assertHonesty(
  honesty: ImmuneMetabolicMicrobiomeIntelligenceHonesty,
): void {
  if (honesty.researchIntelligenceOnly !== true) {
    throw Error("Research intelligence only");
  }
  if (honesty.notDiagnosisOrTreatmentSelection !== true) {
    throw Error("Diagnosis/treatment selection forbidden");
  }
  if (honesty.notClinicalDecisionMaking !== true) {
    throw Error("Clinical decision-making forbidden");
  }
  if (honesty.compositionCorrelationIsNotCausality !== true) {
    throw Error("Composition correlation must not equal causality");
  }
  if (honesty.animalEvidenceIsNotAutomaticHumanTranslation !== true) {
    throw Error("Animal evidence must not auto-translate to human");
  }
  if (
    honesty.unsupportedLinksDoNotCompleteGutImmuneMetabolicChains !== true
  ) {
    throw Error(
      "Unsupported links must not complete gut–immune–metabolic chains",
    );
  }
  if (honesty.evidenceDistinctionsMustNotCollapse !== true) {
    throw Error("Evidence distinctions must not collapse");
  }
  if (honesty.noInventedMechanismsOrStatistics !== true) {
    throw Error("Invented mechanisms/statistics forbidden");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR4");
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
  if (honesty.completeUnsupportedChainClaimed !== false) {
    throw Error("Complete unsupported chain claims forbidden");
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
      /\b(?:not|no|without|never|nor)\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+selection|treatment\s+recommendation|clinical\s+decision(?:[- ]making)?|complete\s+gut[- ]immune[- ]metabolic\s+chain|automatic\s+human\s+translation|composition\s+causality)(?:\s+or\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+selection|treatment\s+recommendation|clinical\s+decision(?:[- ]making)?))*/g,
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
    /\bcomplete\s+gut[- ]immune[- ]metabolic\s+chain\b/.test(lower) ||
    /\bcomposition\s+(?:correlation\s+)?(?:equals|is|=)\s+causal(?:ity|tion)?\b/.test(
      lower,
    ) ||
    /\banimal\s+(?:evidence\s+)?(?:auto(?:matic(?:ally)?)?\s+)?translates?\s+to\s+human\b/.test(
      lower,
    ) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bhr\s*=\s*[\d.]+\b/.test(lower) ||
    /\bor\s*=\s*[\d.]+\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower)
  ) {
    throw Error(
      `${label} must not diagnose/select treatments, claim complete unsupported gut–immune–metabolic chains, equate composition correlation with causality, auto-translate animal evidence to human, invent effect sizes, or include identifiers`,
    );
  }
}

function assertActor(actor: ImmiActor, label: string): ImmiActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, IMMI_ACTOR_KINDS, `${label} actorKind`);
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
  const seen = new Set<string>();
  return values.map((v) => {
    if (!re.test(v)) throw Error(`Invalid ${label}`);
    if (seen.has(v)) throw Error(`Duplicate ${label}`);
    seen.add(v);
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

function dataBasisForDataset(
  availability: ImmiDatasetAvailability,
): ImmiDataBasis {
  if (availability === "authorised_declared") return "declared_research";
  return "fixture_engineering";
}

function assertEntityRef(entity: ImmiEntityRef): ImmiEntityRef {
  if (!ENT_ID_RE.test(entity.id)) throw Error("Invalid entity id");
  if (!textOk(entity.label, 200)) throw Error("Invalid entity label");
  assertNoForbiddenClaimLanguage(entity.label, "entity label");
  assertClosed(entity.axisBand, IMMI_AXIS_BANDS, "entity axisBand");
  const ontologySystem =
    entity.ontologySystem === null || entity.ontologySystem === undefined
      ? null
      : (() => {
          if (!REF_ID_RE.test(entity.ontologySystem)) {
            throw Error("Invalid ontologySystem");
          }
          return entity.ontologySystem;
        })();
  const ontologyValue =
    entity.ontologyValue === null || entity.ontologyValue === undefined
      ? null
      : (() => {
          if (!REF_ID_RE.test(entity.ontologyValue)) {
            throw Error("Invalid ontologyValue");
          }
          return entity.ontologyValue;
        })();
  if ((ontologySystem === null) !== (ontologyValue === null)) {
    throw Error(
      "ontologySystem and ontologyValue must both be set or both null",
    );
  }
  const note = (entity.note ?? "").trim();
  if (note.length > 500) throw Error("Invalid entity note");
  if (note) assertNoForbiddenClaimLanguage(note, "entity note");
  return {
    id: entity.id,
    label: entity.label.trim(),
    axisBand: entity.axisBand,
    ontologySystem,
    ontologyValue,
    note,
  };
}

function assertEvidenceDistinctionList(
  values: readonly ImmiEvidenceDistinction[],
): readonly ImmiEvidenceDistinction[] {
  if (values.length === 0) {
    throw Error("At least 1 evidenceDistinction required");
  }
  if (values.length > IMMI_EVIDENCE_DISTINCTIONS.length) {
    throw Error("Too many evidenceDistinctions");
  }
  const seen = new Set<string>();
  return values.map((v) => {
    assertClosed(v, IMMI_EVIDENCE_DISTINCTIONS, "evidenceDistinction");
    if (seen.has(v)) throw Error("Duplicate evidenceDistinction");
    seen.add(v);
    return v;
  });
}

function refuseCompositionAsCausality(claim?: boolean): void {
  if (claim === true) {
    throw Error(
      "Fail-closed: composition correlations must not be treated as causality",
    );
  }
}

function refuseAnimalAutoHuman(claim?: boolean): void {
  if (claim === true) {
    throw Error(
      "Fail-closed: animal evidence must not automatically translate to human",
    );
  }
}

function refuseCompleteUnsupportedChain(claim?: boolean): void {
  if (claim === true) {
    throw Error(
      "Fail-closed: complete gut–immune–metabolic chains must not be constructed from unsupported links",
    );
  }
}

function refuseTaxonomicFunctionalCollapse(claim?: boolean): void {
  if (claim === true) {
    throw Error(
      "Fail-closed: microbial taxonomic association must not collapse into microbial functional evidence",
    );
  }
}

function refuseDistinctionCollapse(claim?: boolean): void {
  if (claim === true) {
    throw Error(
      "Fail-closed: evidence distinctions must not be collapsed",
    );
  }
}

function refuseAutoTransfer(claim?: boolean): void {
  if (claim === true) {
    throw Error(
      "Fail-closed: auto-transfer across diseases is forbidden",
    );
  }
}

/**
 * True when a microbial→host mapping claims a multi-hop gut–immune–metabolic
 * chain completeness that is blocked by unsupported/uncertain links.
 */
export function chainBlockedByUnsupportedLinks(
  chainStatus: ImmiChainStatus,
  mappingOutcome: ImmiMappingOutcome,
): boolean {
  assertClosed(chainStatus, IMMI_CHAIN_STATUSES, "chainStatus");
  assertClosed(mappingOutcome, IMMI_MAPPING_OUTCOMES, "mappingOutcome");
  return (
    chainStatus === "chain_blocked_unsupported_links" ||
    (mappingOutcome === "unsupported" &&
      chainStatus !== "not_applicable_single_link")
  );
}

export function draftGutImmuneMetabolicGraphScope(input: {
  id: string;
  displayName: string;
  scientificQuestion: string;
  coveredAxisBands: readonly ImmiAxisBand[];
  diseaseContextIds?: readonly string[];
  optionalCsbrScopeId?: string | null;
  optionalHsysOrganSystemRelationshipId?: string | null;
  optionalCdmiComparativeProfileId?: string | null;
  optionalGutImmunePackSchema?: string | null;
  datasetAvailability?: ImmiDatasetAvailability;
  authoredByPrincipalId: string;
  authoredByActorKind?: ImmiActorKind;
  createdAt: string;
  note?: string;
  claimCompositionCorrelationIsCausality?: boolean;
  claimAnimalAutoTranslatesToHuman?: boolean;
  claimCompleteUnsupportedChain?: boolean;
}): GutImmuneMetabolicGraphScope {
  refuseCompositionAsCausality(input.claimCompositionCorrelationIsCausality);
  refuseAnimalAutoHuman(input.claimAnimalAutoTranslatesToHuman);
  refuseCompleteUnsupportedChain(input.claimCompleteUnsupportedChain);

  if (!SCP_ID_RE.test(input.id)) throw Error("Invalid id");
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  if (!textOk(input.scientificQuestion, 2000)) {
    throw Error("Invalid scientificQuestion");
  }
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(
    input.scientificQuestion,
    "scientificQuestion",
  );
  if (input.coveredAxisBands.length < 2) {
    throw Error("At least 2 coveredAxisBands required");
  }
  if (input.coveredAxisBands.length > IMMI_AXIS_BANDS.length) {
    throw Error("Too many coveredAxisBands");
  }
  const seenBands = new Set<string>();
  const coveredAxisBands = input.coveredAxisBands.map((band) => {
    assertClosed(band, IMMI_AXIS_BANDS, "coveredAxisBand");
    if (seenBands.has(band)) throw Error("Duplicate coveredAxisBand");
    seenBands.add(band);
    return band;
  });

  const datasetAvailability =
    input.datasetAvailability ?? "fixture_only";
  assertClosed(
    datasetAvailability,
    IMMI_DATASET_AVAILABILITIES,
    "datasetAvailability",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const diseaseContextIds = assertIdList(
    input.diseaseContextIds ?? [],
    HDI_CTX_RE,
    "diseaseContextId",
    8,
  );

  const record: GutImmuneMetabolicGraphScope = {
    schema: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA,
    method: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD,
    version: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    coveredAxisBands,
    capabilityKinds: [...IMMI_CAPABILITY_KINDS],
    evidenceDistinctions: [...IMMI_EVIDENCE_DISTINCTIONS],
    diseaseContextIds,
    optionalCsbrScopeId: assertOptionalId(
      input.optionalCsbrScopeId,
      CSBR_REF_RE,
      "optionalCsbrScopeId",
    ),
    optionalHsysOrganSystemRelationshipId: assertOptionalId(
      input.optionalHsysOrganSystemRelationshipId,
      HSYS_REF_RE,
      "optionalHsysOrganSystemRelationshipId",
    ),
    optionalCdmiComparativeProfileId: assertOptionalId(
      input.optionalCdmiComparativeProfileId,
      CDMI_REF_RE,
      "optionalCdmiComparativeProfileId",
    ),
    optionalGutImmunePackSchema:
      input.optionalGutImmunePackSchema === undefined ||
      input.optionalGutImmunePackSchema === null
        ? null
        : (() => {
            if (!REF_ID_RE.test(input.optionalGutImmunePackSchema)) {
              throw Error("Invalid optionalGutImmunePackSchema");
            }
            return input.optionalGutImmunePackSchema;
          })(),
    datasetAvailability,
    compositionCorrelationIsCausality: false,
    animalEvidenceAutoTranslatesToHuman: false,
    completeUnsupportedChainClaimed: false,
    containsIdentifiablePhi: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForDataset(datasetAvailability),
    fixtureHonesty: datasetAvailability !== "authorised_declared",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateGutImmuneMetabolicGraphScope(record);
}

export function validateGutImmuneMetabolicGraphScope(
  record: GutImmuneMetabolicGraphScope,
): GutImmuneMetabolicGraphScope {
  if (!SCP_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.coveredAxisBands.length < 2) {
    throw Error("At least 2 coveredAxisBands required");
  }
  for (const band of record.coveredAxisBands) {
    assertClosed(band, IMMI_AXIS_BANDS, "coveredAxisBand");
  }
  assertEvidenceDistinctionList(record.evidenceDistinctions);
  for (const kind of record.capabilityKinds) {
    assertClosed(kind, IMMI_CAPABILITY_KINDS, "capabilityKind");
  }
  assertClosed(
    record.datasetAvailability,
    IMMI_DATASET_AVAILABILITIES,
    "datasetAvailability",
  );
  if (record.compositionCorrelationIsCausality !== false) {
    throw Error("Composition correlation must not equal causality");
  }
  if (record.animalEvidenceAutoTranslatesToHuman !== false) {
    throw Error("Animal evidence must not auto-translate to human");
  }
  if (record.completeUnsupportedChainClaimed !== false) {
    throw Error("Complete unsupported chain claims forbidden");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftImmuneVsMetabolicPathwayComparison(input: {
  id: string;
  scope: GutImmuneMetabolicGraphScope;
  immunePathwayEntity: ImmiEntityRef;
  metabolicPathwayEntity: ImmiEntityRef;
  comparisonOutcome: ImmiComparisonOutcome;
  evidenceDistinction: ImmiEvidenceDistinction;
  comparisonSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ImmiActorKind;
  createdAt: string;
  note?: string;
  claimCompositionCorrelationIsCausality?: boolean;
}): ImmuneVsMetabolicPathwayComparisonRecord {
  refuseCompositionAsCausality(input.claimCompositionCorrelationIsCausality);
  validateGutImmuneMetabolicGraphScope(input.scope);
  if (!IPC_ID_RE.test(input.id)) throw Error("Invalid id");
  if (!textOk(input.comparisonSummary, 2000)) {
    throw Error("Invalid comparisonSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.comparisonSummary,
    "comparisonSummary",
  );
  assertClosed(
    input.comparisonOutcome,
    IMMI_COMPARISON_OUTCOMES,
    "comparisonOutcome",
  );
  assertClosed(
    input.evidenceDistinction,
    IMMI_EVIDENCE_DISTINCTIONS,
    "evidenceDistinction",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const immunePathwayEntity = assertEntityRef(input.immunePathwayEntity);
  const metabolicPathwayEntity = assertEntityRef(
    input.metabolicPathwayEntity,
  );
  if (immunePathwayEntity.axisBand !== "immune") {
    throw Error("immunePathwayEntity.axisBand must be immune");
  }
  if (metabolicPathwayEntity.axisBand !== "metabolic") {
    throw Error("metabolicPathwayEntity.axisBand must be metabolic");
  }
  if (
    !input.scope.coveredAxisBands.includes("immune") ||
    !input.scope.coveredAxisBands.includes("metabolic")
  ) {
    throw Error("Scope must cover immune and metabolic axis bands");
  }

  const record: ImmuneVsMetabolicPathwayComparisonRecord = {
    schema: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA,
    method: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD,
    version: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    immunePathwayEntity,
    metabolicPathwayEntity,
    comparisonOutcome: input.comparisonOutcome,
    evidenceDistinction: input.evidenceDistinction,
    comparisonSummary: input.comparisonSummary.trim(),
    compositionCorrelationIsCausality: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateImmuneVsMetabolicPathwayComparison(record);
}

export function validateImmuneVsMetabolicPathwayComparison(
  record: ImmuneVsMetabolicPathwayComparisonRecord,
): ImmuneVsMetabolicPathwayComparisonRecord {
  if (!IPC_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!SCP_ID_RE.test(record.scopeId)) throw Error("Invalid scopeId");
  assertClosed(
    record.comparisonOutcome,
    IMMI_COMPARISON_OUTCOMES,
    "comparisonOutcome",
  );
  assertClosed(
    record.evidenceDistinction,
    IMMI_EVIDENCE_DISTINCTIONS,
    "evidenceDistinction",
  );
  if (record.compositionCorrelationIsCausality !== false) {
    throw Error("Composition correlation must not equal causality");
  }
  assertEntityRef(record.immunePathwayEntity);
  assertEntityRef(record.metabolicPathwayEntity);
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftMetaboliteHostInteraction(input: {
  id: string;
  scope: GutImmuneMetabolicGraphScope;
  metaboliteEntity: ImmiEntityRef;
  hostEntity: ImmiEntityRef;
  interactionKind: ImmiInteractionKind;
  evidenceDistinction: ImmiEvidenceDistinction;
  translationStatus: ImmiTranslationStatus;
  interactionSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ImmiActorKind;
  createdAt: string;
  note?: string;
  claimAnimalAutoTranslatesToHuman?: boolean;
  claimCompositionCorrelationIsCausality?: boolean;
}): MetaboliteHostInteractionRecord {
  refuseAnimalAutoHuman(input.claimAnimalAutoTranslatesToHuman);
  refuseCompositionAsCausality(input.claimCompositionCorrelationIsCausality);
  validateGutImmuneMetabolicGraphScope(input.scope);
  if (!MHI_ID_RE.test(input.id)) throw Error("Invalid id");
  if (!textOk(input.interactionSummary, 2000)) {
    throw Error("Invalid interactionSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.interactionSummary,
    "interactionSummary",
  );
  assertClosed(
    input.interactionKind,
    IMMI_INTERACTION_KINDS,
    "interactionKind",
  );
  assertClosed(
    input.evidenceDistinction,
    IMMI_EVIDENCE_DISTINCTIONS,
    "evidenceDistinction",
  );
  assertClosed(
    input.translationStatus,
    IMMI_TRANSLATION_STATUSES,
    "translationStatus",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const metaboliteEntity = assertEntityRef(input.metaboliteEntity);
  const hostEntity = assertEntityRef(input.hostEntity);
  if (metaboliteEntity.axisBand !== "metabolic") {
    throw Error("metaboliteEntity.axisBand must be metabolic");
  }
  if (
    hostEntity.axisBand !== "immune" &&
    hostEntity.axisBand !== "host_pathway" &&
    hostEntity.axisBand !== "inflammation_phenotype"
  ) {
    throw Error(
      "hostEntity.axisBand must be immune, host_pathway, or inflammation_phenotype",
    );
  }

  if (
    input.translationStatus === "animal_only_declared" &&
    input.evidenceDistinction === "experimental_causal_evidence"
  ) {
    // Allowed — but animal≠human translation stays false.
  }
  if (
    input.translationStatus === "blocked_no_human_translation" &&
    input.interactionKind === "experimental_effect_declared" &&
    input.evidenceDistinction === "experimental_causal_evidence"
  ) {
    // Explicit block path for animal experimental evidence without human translation.
  }

  const record: MetaboliteHostInteractionRecord = {
    schema: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA,
    method: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD,
    version: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    metaboliteEntity,
    hostEntity,
    interactionKind: input.interactionKind,
    evidenceDistinction: input.evidenceDistinction,
    translationStatus: input.translationStatus,
    interactionSummary: input.interactionSummary.trim(),
    animalEvidenceAutoTranslatesToHuman: false,
    compositionCorrelationIsCausality: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateMetaboliteHostInteraction(record);
}

export function validateMetaboliteHostInteraction(
  record: MetaboliteHostInteractionRecord,
): MetaboliteHostInteractionRecord {
  if (!MHI_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!SCP_ID_RE.test(record.scopeId)) throw Error("Invalid scopeId");
  assertClosed(
    record.interactionKind,
    IMMI_INTERACTION_KINDS,
    "interactionKind",
  );
  assertClosed(
    record.evidenceDistinction,
    IMMI_EVIDENCE_DISTINCTIONS,
    "evidenceDistinction",
  );
  assertClosed(
    record.translationStatus,
    IMMI_TRANSLATION_STATUSES,
    "translationStatus",
  );
  if (record.animalEvidenceAutoTranslatesToHuman !== false) {
    throw Error("Animal evidence must not auto-translate to human");
  }
  if (record.compositionCorrelationIsCausality !== false) {
    throw Error("Composition correlation must not equal causality");
  }
  assertEntityRef(record.metaboliteEntity);
  assertEntityRef(record.hostEntity);
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftMicrobialFunctionHostPathwayMapping(input: {
  id: string;
  scope: GutImmuneMetabolicGraphScope;
  microbialEntity: ImmiEntityRef;
  hostPathwayEntity: ImmiEntityRef;
  mappingOutcome: ImmiMappingOutcome;
  evidenceDistinction: ImmiEvidenceDistinction;
  chainStatus?: ImmiChainStatus;
  mappingSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ImmiActorKind;
  createdAt: string;
  note?: string;
  collapseTaxonomicIntoFunctional?: boolean;
  claimCompleteUnsupportedChain?: boolean;
}): MicrobialFunctionHostPathwayMappingRecord {
  refuseTaxonomicFunctionalCollapse(input.collapseTaxonomicIntoFunctional);
  refuseCompleteUnsupportedChain(input.claimCompleteUnsupportedChain);
  validateGutImmuneMetabolicGraphScope(input.scope);
  if (!MFM_ID_RE.test(input.id)) throw Error("Invalid id");
  if (!textOk(input.mappingSummary, 2000)) {
    throw Error("Invalid mappingSummary");
  }
  assertNoForbiddenClaimLanguage(input.mappingSummary, "mappingSummary");
  assertClosed(
    input.mappingOutcome,
    IMMI_MAPPING_OUTCOMES,
    "mappingOutcome",
  );
  assertClosed(
    input.evidenceDistinction,
    IMMI_EVIDENCE_DISTINCTIONS,
    "evidenceDistinction",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const microbialEntity = assertEntityRef(input.microbialEntity);
  const hostPathwayEntity = assertEntityRef(input.hostPathwayEntity);
  if (microbialEntity.axisBand !== "microbiome") {
    throw Error("microbialEntity.axisBand must be microbiome");
  }
  if (
    hostPathwayEntity.axisBand !== "host_pathway" &&
    hostPathwayEntity.axisBand !== "immune" &&
    hostPathwayEntity.axisBand !== "metabolic"
  ) {
    throw Error(
      "hostPathwayEntity.axisBand must be host_pathway, immune, or metabolic",
    );
  }

  if (
    input.evidenceDistinction === "microbial_taxonomic_association" &&
    input.mappingOutcome === "supported" &&
    input.claimCompleteUnsupportedChain === true
  ) {
    throw Error(
      "Fail-closed: taxonomic association alone cannot complete a gut–immune–metabolic chain",
    );
  }

  let chainStatus: ImmiChainStatus =
    input.chainStatus ?? "not_applicable_single_link";
  assertClosed(chainStatus, IMMI_CHAIN_STATUSES, "chainStatus");

  if (
    input.mappingOutcome === "unsupported" &&
    (chainStatus === "chain_incomplete_declared" ||
      chainStatus === "chain_partial_supported_links_only")
  ) {
    chainStatus = "chain_blocked_unsupported_links";
  }

  if (
    chainStatus === "chain_blocked_unsupported_links" &&
    input.claimCompleteUnsupportedChain === true
  ) {
    throw Error(
      "Fail-closed: complete gut–immune–metabolic chains must not be constructed from unsupported links",
    );
  }

  const record: MicrobialFunctionHostPathwayMappingRecord = {
    schema: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA,
    method: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD,
    version: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    microbialEntity,
    hostPathwayEntity,
    mappingOutcome: input.mappingOutcome,
    evidenceDistinction: input.evidenceDistinction,
    chainStatus,
    mappingSummary: input.mappingSummary.trim(),
    taxonomicAssociationCollapsedIntoFunctionalEvidence: false,
    completeUnsupportedChainClaimed: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateMicrobialFunctionHostPathwayMapping(record);
}

export function validateMicrobialFunctionHostPathwayMapping(
  record: MicrobialFunctionHostPathwayMappingRecord,
): MicrobialFunctionHostPathwayMappingRecord {
  if (!MFM_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!SCP_ID_RE.test(record.scopeId)) throw Error("Invalid scopeId");
  assertClosed(
    record.mappingOutcome,
    IMMI_MAPPING_OUTCOMES,
    "mappingOutcome",
  );
  assertClosed(
    record.evidenceDistinction,
    IMMI_EVIDENCE_DISTINCTIONS,
    "evidenceDistinction",
  );
  assertClosed(record.chainStatus, IMMI_CHAIN_STATUSES, "chainStatus");
  if (record.taxonomicAssociationCollapsedIntoFunctionalEvidence !== false) {
    throw Error(
      "Taxonomic association must not collapse into functional evidence",
    );
  }
  if (record.completeUnsupportedChainClaimed !== false) {
    throw Error("Complete unsupported chain claims forbidden");
  }
  assertEntityRef(record.microbialEntity);
  assertEntityRef(record.hostPathwayEntity);
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftInflammationMetabolicPhenotypeRelationship(input: {
  id: string;
  scope: GutImmuneMetabolicGraphScope;
  inflammationEntity: ImmiEntityRef;
  metabolicPhenotypeEntity: ImmiEntityRef;
  mappingOutcome: ImmiMappingOutcome;
  evidenceDistinction: ImmiEvidenceDistinction;
  relationshipSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ImmiActorKind;
  createdAt: string;
  note?: string;
  claimCompositionCorrelationIsCausality?: boolean;
}): InflammationMetabolicPhenotypeRelationshipRecord {
  refuseCompositionAsCausality(input.claimCompositionCorrelationIsCausality);
  validateGutImmuneMetabolicGraphScope(input.scope);
  if (!IMP_ID_RE.test(input.id)) throw Error("Invalid id");
  if (!textOk(input.relationshipSummary, 2000)) {
    throw Error("Invalid relationshipSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.relationshipSummary,
    "relationshipSummary",
  );
  assertClosed(
    input.mappingOutcome,
    IMMI_MAPPING_OUTCOMES,
    "mappingOutcome",
  );
  assertClosed(
    input.evidenceDistinction,
    IMMI_EVIDENCE_DISTINCTIONS,
    "evidenceDistinction",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const inflammationEntity = assertEntityRef(input.inflammationEntity);
  const metabolicPhenotypeEntity = assertEntityRef(
    input.metabolicPhenotypeEntity,
  );
  if (inflammationEntity.axisBand !== "inflammation_phenotype") {
    throw Error(
      "inflammationEntity.axisBand must be inflammation_phenotype",
    );
  }
  if (metabolicPhenotypeEntity.axisBand !== "metabolic") {
    throw Error("metabolicPhenotypeEntity.axisBand must be metabolic");
  }

  const record: InflammationMetabolicPhenotypeRelationshipRecord = {
    schema: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA,
    method: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD,
    version: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    inflammationEntity,
    metabolicPhenotypeEntity,
    mappingOutcome: input.mappingOutcome,
    evidenceDistinction: input.evidenceDistinction,
    relationshipSummary: input.relationshipSummary.trim(),
    compositionCorrelationIsCausality: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateInflammationMetabolicPhenotypeRelationship(record);
}

export function validateInflammationMetabolicPhenotypeRelationship(
  record: InflammationMetabolicPhenotypeRelationshipRecord,
): InflammationMetabolicPhenotypeRelationshipRecord {
  if (!IMP_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!SCP_ID_RE.test(record.scopeId)) throw Error("Invalid scopeId");
  assertClosed(
    record.mappingOutcome,
    IMMI_MAPPING_OUTCOMES,
    "mappingOutcome",
  );
  assertClosed(
    record.evidenceDistinction,
    IMMI_EVIDENCE_DISTINCTIONS,
    "evidenceDistinction",
  );
  if (record.compositionCorrelationIsCausality !== false) {
    throw Error("Composition correlation must not equal causality");
  }
  assertEntityRef(record.inflammationEntity);
  assertEntityRef(record.metabolicPhenotypeEntity);
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftDiseaseContextComparison(input: {
  id: string;
  scope: GutImmuneMetabolicGraphScope;
  diseaseContextIds: readonly string[];
  comparisonOutcome: ImmiComparisonOutcome;
  evidenceDistinction: ImmiEvidenceDistinction;
  comparisonSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ImmiActorKind;
  createdAt: string;
  note?: string;
  claimAutoTransferAcrossDiseases?: boolean;
}): DiseaseContextComparisonRecord {
  refuseAutoTransfer(input.claimAutoTransferAcrossDiseases);
  validateGutImmuneMetabolicGraphScope(input.scope);
  if (!DCC_ID_RE.test(input.id)) throw Error("Invalid id");
  if (!textOk(input.comparisonSummary, 2000)) {
    throw Error("Invalid comparisonSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.comparisonSummary,
    "comparisonSummary",
  );
  assertClosed(
    input.comparisonOutcome,
    IMMI_COMPARISON_OUTCOMES,
    "comparisonOutcome",
  );
  assertClosed(
    input.evidenceDistinction,
    IMMI_EVIDENCE_DISTINCTIONS,
    "evidenceDistinction",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const diseaseContextIds = assertIdList(
    input.diseaseContextIds,
    HDI_CTX_RE,
    "diseaseContextId",
    8,
  );
  if (diseaseContextIds.length < 2) {
    throw Error("At least 2 diseaseContextIds required for comparison");
  }

  const record: DiseaseContextComparisonRecord = {
    schema: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA,
    method: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD,
    version: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    diseaseContextIds,
    comparisonOutcome: input.comparisonOutcome,
    evidenceDistinction: input.evidenceDistinction,
    comparisonSummary: input.comparisonSummary.trim(),
    autoTransferAcrossDiseases: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateDiseaseContextComparison(record);
}

export function validateDiseaseContextComparison(
  record: DiseaseContextComparisonRecord,
): DiseaseContextComparisonRecord {
  if (!DCC_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!SCP_ID_RE.test(record.scopeId)) throw Error("Invalid scopeId");
  if (record.diseaseContextIds.length < 2) {
    throw Error("At least 2 diseaseContextIds required");
  }
  assertIdList(
    record.diseaseContextIds,
    HDI_CTX_RE,
    "diseaseContextId",
    8,
  );
  assertClosed(
    record.comparisonOutcome,
    IMMI_COMPARISON_OUTCOMES,
    "comparisonOutcome",
  );
  assertClosed(
    record.evidenceDistinction,
    IMMI_EVIDENCE_DISTINCTIONS,
    "evidenceDistinction",
  );
  if (record.autoTransferAcrossDiseases !== false) {
    throw Error("Auto-transfer across diseases forbidden");
  }
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftEvidenceContradictionAnalysis(input: {
  id: string;
  scope: GutImmuneMetabolicGraphScope;
  relatedRecordIds: readonly string[];
  contradictionStatus: ImmiContradictionStatus;
  evidenceDistinctionsCompared: readonly ImmiEvidenceDistinction[];
  analysisSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ImmiActorKind;
  createdAt: string;
  note?: string;
  collapseDistinctions?: boolean;
}): EvidenceContradictionAnalysisRecord {
  refuseDistinctionCollapse(input.collapseDistinctions);
  validateGutImmuneMetabolicGraphScope(input.scope);
  if (!ECA_ID_RE.test(input.id)) throw Error("Invalid id");
  if (!textOk(input.analysisSummary, 2000)) {
    throw Error("Invalid analysisSummary");
  }
  assertNoForbiddenClaimLanguage(input.analysisSummary, "analysisSummary");
  assertClosed(
    input.contradictionStatus,
    IMMI_CONTRADICTION_STATUSES,
    "contradictionStatus",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const relatedRecordIds = assertIdList(
    input.relatedRecordIds,
    /^hsi-immi-(?:ipc|mhi|mfm|imp|dcc)-[a-z0-9-]{3,80}$/,
    "relatedRecordId",
    16,
  );
  if (relatedRecordIds.length < 1) {
    throw Error("At least 1 relatedRecordId required");
  }
  const evidenceDistinctionsCompared = assertEvidenceDistinctionList(
    input.evidenceDistinctionsCompared,
  );

  const record: EvidenceContradictionAnalysisRecord = {
    schema: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA,
    method: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD,
    version: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    relatedRecordIds,
    contradictionStatus: input.contradictionStatus,
    evidenceDistinctionsCompared,
    analysisSummary: input.analysisSummary.trim(),
    distinctionsCollapsed: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateEvidenceContradictionAnalysis(record);
}

export function validateEvidenceContradictionAnalysis(
  record: EvidenceContradictionAnalysisRecord,
): EvidenceContradictionAnalysisRecord {
  if (!ECA_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!SCP_ID_RE.test(record.scopeId)) throw Error("Invalid scopeId");
  assertClosed(
    record.contradictionStatus,
    IMMI_CONTRADICTION_STATUSES,
    "contradictionStatus",
  );
  assertEvidenceDistinctionList(record.evidenceDistinctionsCompared);
  if (record.distinctionsCollapsed !== false) {
    throw Error("Evidence distinctions must not be collapsed");
  }
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftImmuneMetabolicMicrobiomeProfile(input: {
  id: string;
  displayName: string;
  scope: GutImmuneMetabolicGraphScope;
  immuneVsMetabolicPathwayComparisons: readonly ImmuneVsMetabolicPathwayComparisonRecord[];
  metaboliteHostInteractions: readonly MetaboliteHostInteractionRecord[];
  microbialFunctionHostPathwayMappings: readonly MicrobialFunctionHostPathwayMappingRecord[];
  inflammationMetabolicPhenotypeRelationships: readonly InflammationMetabolicPhenotypeRelationshipRecord[];
  diseaseContextComparisons: readonly DiseaseContextComparisonRecord[];
  evidenceContradictionAnalyses: readonly EvidenceContradictionAnalysisRecord[];
  profileVersion: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: ImmiActorKind;
  createdAt: string;
  note?: string;
}): ImmuneMetabolicMicrobiomeProfile {
  validateGutImmuneMetabolicGraphScope(input.scope);
  if (!PRF_ID_RE.test(input.id)) throw Error("Invalid id");
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!textOk(input.profileVersion, 32)) {
    throw Error("Invalid profileVersion");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  for (const r of input.immuneVsMetabolicPathwayComparisons) {
    validateImmuneVsMetabolicPathwayComparison(r);
    if (r.scopeId !== input.scope.id) {
      throw Error("Pathway comparison scopeId mismatch");
    }
  }
  for (const r of input.metaboliteHostInteractions) {
    validateMetaboliteHostInteraction(r);
    if (r.scopeId !== input.scope.id) {
      throw Error("Metabolite-host interaction scopeId mismatch");
    }
  }
  for (const r of input.microbialFunctionHostPathwayMappings) {
    validateMicrobialFunctionHostPathwayMapping(r);
    if (r.scopeId !== input.scope.id) {
      throw Error("Microbial function mapping scopeId mismatch");
    }
  }
  for (const r of input.inflammationMetabolicPhenotypeRelationships) {
    validateInflammationMetabolicPhenotypeRelationship(r);
    if (r.scopeId !== input.scope.id) {
      throw Error("Inflammation-metabolic relationship scopeId mismatch");
    }
  }
  for (const r of input.diseaseContextComparisons) {
    validateDiseaseContextComparison(r);
    if (r.scopeId !== input.scope.id) {
      throw Error("Disease-context comparison scopeId mismatch");
    }
  }
  for (const r of input.evidenceContradictionAnalyses) {
    validateEvidenceContradictionAnalysis(r);
    if (r.scopeId !== input.scope.id) {
      throw Error("Contradiction analysis scopeId mismatch");
    }
  }

  let lifecycle: ImmiProfileLifecycle = "draft";
  if (
    input.scope.datasetAvailability ===
    "blocked_no_authorised_clinical_dataset"
  ) {
    lifecycle = "blocked_awaiting_authorised_dataset";
  } else if (
    input.microbialFunctionHostPathwayMappings.some((m) =>
      chainBlockedByUnsupportedLinks(m.chainStatus, m.mappingOutcome),
    )
  ) {
    lifecycle = "blocked_unsupported_chain_links";
  }

  const record: ImmuneMetabolicMicrobiomeProfile = {
    schema: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA,
    method: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD,
    version: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    scopeId: input.scope.id,
    immuneVsMetabolicPathwayComparisonIds:
      input.immuneVsMetabolicPathwayComparisons.map((r) => r.id),
    metaboliteHostInteractionIds: input.metaboliteHostInteractions.map(
      (r) => r.id,
    ),
    microbialFunctionHostPathwayMappingIds:
      input.microbialFunctionHostPathwayMappings.map((r) => r.id),
    inflammationMetabolicPhenotypeRelationshipIds:
      input.inflammationMetabolicPhenotypeRelationships.map((r) => r.id),
    diseaseContextComparisonIds: input.diseaseContextComparisons.map(
      (r) => r.id,
    ),
    evidenceContradictionAnalysisIds: input.evidenceContradictionAnalyses.map(
      (r) => r.id,
    ),
    profileVersion: input.profileVersion.trim(),
    lifecycle,
    reviewedBy: null,
    compositionCorrelationIsCausality: false,
    animalEvidenceAutoTranslatesToHuman: false,
    completeUnsupportedChainClaimed: false,
    containsIdentifiablePhi: false,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateImmuneMetabolicMicrobiomeProfile(record);
}

export function validateImmuneMetabolicMicrobiomeProfile(
  record: ImmuneMetabolicMicrobiomeProfile,
): ImmuneMetabolicMicrobiomeProfile {
  if (!PRF_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!SCP_ID_RE.test(record.scopeId)) throw Error("Invalid scopeId");
  assertClosed(record.lifecycle, IMMI_PROFILE_LIFECYCLES, "lifecycle");
  if (record.compositionCorrelationIsCausality !== false) {
    throw Error("Composition correlation must not equal causality");
  }
  if (record.animalEvidenceAutoTranslatesToHuman !== false) {
    throw Error("Animal evidence must not auto-translate to human");
  }
  if (record.completeUnsupportedChainClaimed !== false) {
    throw Error("Complete unsupported chain claims forbidden");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  assertLimitations(record.limitations);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  assertHonesty(record.honesty);
  return record;
}

export function transitionImmuneMetabolicMicrobiomeProfile(input: {
  profile: ImmuneMetabolicMicrobiomeProfile;
  to: ImmiProfileLifecycle;
  updatedAt: string;
  actor: ImmiActor;
}): ImmuneMetabolicMicrobiomeProfile {
  const current = validateImmuneMetabolicMicrobiomeProfile(input.profile);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "actor");
  const allowed = PROFILE_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Invalid immune-metabolic-microbiome profile transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    (actor.actorKind !== "human" ||
      current.lifecycle === "blocked_awaiting_authorised_dataset" ||
      current.lifecycle === "blocked_unsupported_chain_links")
  ) {
    throw Error(
      "accepted_with_limitations requires human reviewer and non-blocked lifecycle",
    );
  }
  return validateImmuneMetabolicMicrobiomeProfile({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "under_review"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryImmuneMetabolicMicrobiomeIntelligenceStore(): ImmuneMetabolicMicrobiomeIntelligenceStore & {
  gutImmuneMetabolicGraphScopes: Map<string, GutImmuneMetabolicGraphScope>;
  immuneVsMetabolicPathwayComparisons: Map<
    string,
    ImmuneVsMetabolicPathwayComparisonRecord
  >;
  metaboliteHostInteractions: Map<string, MetaboliteHostInteractionRecord>;
  microbialFunctionHostPathwayMappings: Map<
    string,
    MicrobialFunctionHostPathwayMappingRecord
  >;
  inflammationMetabolicPhenotypeRelationships: Map<
    string,
    InflammationMetabolicPhenotypeRelationshipRecord
  >;
  diseaseContextComparisons: Map<string, DiseaseContextComparisonRecord>;
  evidenceContradictionAnalyses: Map<
    string,
    EvidenceContradictionAnalysisRecord
  >;
  profiles: Map<string, ImmuneMetabolicMicrobiomeProfile>;
} {
  const gutImmuneMetabolicGraphScopes = new Map<
    string,
    GutImmuneMetabolicGraphScope
  >();
  const immuneVsMetabolicPathwayComparisons = new Map<
    string,
    ImmuneVsMetabolicPathwayComparisonRecord
  >();
  const metaboliteHostInteractions = new Map<
    string,
    MetaboliteHostInteractionRecord
  >();
  const microbialFunctionHostPathwayMappings = new Map<
    string,
    MicrobialFunctionHostPathwayMappingRecord
  >();
  const inflammationMetabolicPhenotypeRelationships = new Map<
    string,
    InflammationMetabolicPhenotypeRelationshipRecord
  >();
  const diseaseContextComparisons = new Map<
    string,
    DiseaseContextComparisonRecord
  >();
  const evidenceContradictionAnalyses = new Map<
    string,
    EvidenceContradictionAnalysisRecord
  >();
  const profiles = new Map<string, ImmuneMetabolicMicrobiomeProfile>();

  const filterByScope = <T extends {scopeId: string}>(
    map: Map<string, T>,
    scopeId?: string,
  ): readonly T[] => {
    const all = [...map.values()];
    return scopeId ? all.filter((r) => r.scopeId === scopeId) : all;
  };

  return {
    gutImmuneMetabolicGraphScopes,
    immuneVsMetabolicPathwayComparisons,
    metaboliteHostInteractions,
    microbialFunctionHostPathwayMappings,
    inflammationMetabolicPhenotypeRelationships,
    diseaseContextComparisons,
    evidenceContradictionAnalyses,
    profiles,
    upsertGutImmuneMetabolicGraphScope(record) {
      const validated = validateGutImmuneMetabolicGraphScope(record);
      gutImmuneMetabolicGraphScopes.set(validated.id, validated);
      return validated;
    },
    getGutImmuneMetabolicGraphScope(id) {
      return gutImmuneMetabolicGraphScopes.get(id) ?? null;
    },
    listGutImmuneMetabolicGraphScopes() {
      return [...gutImmuneMetabolicGraphScopes.values()];
    },
    upsertImmuneVsMetabolicPathwayComparison(record) {
      const validated = validateImmuneVsMetabolicPathwayComparison(record);
      immuneVsMetabolicPathwayComparisons.set(validated.id, validated);
      return validated;
    },
    getImmuneVsMetabolicPathwayComparison(id) {
      return immuneVsMetabolicPathwayComparisons.get(id) ?? null;
    },
    listImmuneVsMetabolicPathwayComparisons(scopeId) {
      return filterByScope(immuneVsMetabolicPathwayComparisons, scopeId);
    },
    upsertMetaboliteHostInteraction(record) {
      const validated = validateMetaboliteHostInteraction(record);
      metaboliteHostInteractions.set(validated.id, validated);
      return validated;
    },
    getMetaboliteHostInteraction(id) {
      return metaboliteHostInteractions.get(id) ?? null;
    },
    listMetaboliteHostInteractions(scopeId) {
      return filterByScope(metaboliteHostInteractions, scopeId);
    },
    upsertMicrobialFunctionHostPathwayMapping(record) {
      const validated = validateMicrobialFunctionHostPathwayMapping(record);
      microbialFunctionHostPathwayMappings.set(validated.id, validated);
      return validated;
    },
    getMicrobialFunctionHostPathwayMapping(id) {
      return microbialFunctionHostPathwayMappings.get(id) ?? null;
    },
    listMicrobialFunctionHostPathwayMappings(scopeId) {
      return filterByScope(microbialFunctionHostPathwayMappings, scopeId);
    },
    upsertInflammationMetabolicPhenotypeRelationship(record) {
      const validated =
        validateInflammationMetabolicPhenotypeRelationship(record);
      inflammationMetabolicPhenotypeRelationships.set(
        validated.id,
        validated,
      );
      return validated;
    },
    getInflammationMetabolicPhenotypeRelationship(id) {
      return inflammationMetabolicPhenotypeRelationships.get(id) ?? null;
    },
    listInflammationMetabolicPhenotypeRelationships(scopeId) {
      return filterByScope(
        inflammationMetabolicPhenotypeRelationships,
        scopeId,
      );
    },
    upsertDiseaseContextComparison(record) {
      const validated = validateDiseaseContextComparison(record);
      diseaseContextComparisons.set(validated.id, validated);
      return validated;
    },
    getDiseaseContextComparison(id) {
      return diseaseContextComparisons.get(id) ?? null;
    },
    listDiseaseContextComparisons(scopeId) {
      return filterByScope(diseaseContextComparisons, scopeId);
    },
    upsertEvidenceContradictionAnalysis(record) {
      const validated = validateEvidenceContradictionAnalysis(record);
      evidenceContradictionAnalyses.set(validated.id, validated);
      return validated;
    },
    getEvidenceContradictionAnalysis(id) {
      return evidenceContradictionAnalyses.get(id) ?? null;
    },
    listEvidenceContradictionAnalyses(scopeId) {
      return filterByScope(evidenceContradictionAnalyses, scopeId);
    },
    upsertProfile(record) {
      const validated = validateImmuneMetabolicMicrobiomeProfile(record);
      profiles.set(validated.id, validated);
      return validated;
    },
    getProfile(id) {
      return profiles.get(id) ?? null;
    },
    listProfiles(scopeId) {
      return filterByScope(profiles, scopeId);
    },
  };
}

export function projectImmuneMetabolicMicrobiomeIntelligencePersistenceLines(input: {
  gutImmuneMetabolicGraphScopes: readonly GutImmuneMetabolicGraphScope[];
  immuneVsMetabolicPathwayComparisons?: readonly ImmuneVsMetabolicPathwayComparisonRecord[];
  metaboliteHostInteractions?: readonly MetaboliteHostInteractionRecord[];
  microbialFunctionHostPathwayMappings?: readonly MicrobialFunctionHostPathwayMappingRecord[];
  inflammationMetabolicPhenotypeRelationships?: readonly InflammationMetabolicPhenotypeRelationshipRecord[];
  diseaseContextComparisons?: readonly DiseaseContextComparisonRecord[];
  evidenceContradictionAnalyses?: readonly EvidenceContradictionAnalysisRecord[];
  profiles?: readonly ImmuneMetabolicMicrobiomeProfile[];
}): string[] {
  for (const r of input.gutImmuneMetabolicGraphScopes) {
    validateGutImmuneMetabolicGraphScope(r);
  }
  for (const r of input.immuneVsMetabolicPathwayComparisons ?? []) {
    validateImmuneVsMetabolicPathwayComparison(r);
  }
  for (const r of input.metaboliteHostInteractions ?? []) {
    validateMetaboliteHostInteraction(r);
  }
  for (const r of input.microbialFunctionHostPathwayMappings ?? []) {
    validateMicrobialFunctionHostPathwayMapping(r);
  }
  for (const r of input.inflammationMetabolicPhenotypeRelationships ?? []) {
    validateInflammationMetabolicPhenotypeRelationship(r);
  }
  for (const r of input.diseaseContextComparisons ?? []) {
    validateDiseaseContextComparison(r);
  }
  for (const r of input.evidenceContradictionAnalyses ?? []) {
    validateEvidenceContradictionAnalysis(r);
  }
  for (const r of input.profiles ?? []) {
    validateImmuneMetabolicMicrobiomeProfile(r);
  }

  return [
    `schema=${IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA}`,
    `method=${IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD}`,
    `version=${IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION}`,
    `gutImmuneMetabolicGraphScopes=${input.gutImmuneMetabolicGraphScopes.length}`,
    `immuneVsMetabolicPathwayComparisons=${(input.immuneVsMetabolicPathwayComparisons ?? []).length}`,
    `metaboliteHostInteractions=${(input.metaboliteHostInteractions ?? []).length}`,
    `microbialFunctionHostPathwayMappings=${(input.microbialFunctionHostPathwayMappings ?? []).length}`,
    `inflammationMetabolicPhenotypeRelationships=${(input.inflammationMetabolicPhenotypeRelationships ?? []).length}`,
    `diseaseContextComparisons=${(input.diseaseContextComparisons ?? []).length}`,
    `evidenceContradictionAnalyses=${(input.evidenceContradictionAnalyses ?? []).length}`,
    `profiles=${(input.profiles ?? []).length}`,
    `compositionCorrelationIsNotCausality=true`,
    `animalEvidenceIsNotAutomaticHumanTranslation=true`,
    `unsupportedLinksDoNotCompleteGutImmuneMetabolicChains=true`,
    `evidenceDistinctionsMustNotCollapse=true`,
    `noPhiIngestion=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintImmuneMetabolicMicrobiomeProfile(
  profile: ImmuneMetabolicMicrobiomeProfile,
): string {
  const validated = validateImmuneMetabolicMicrobiomeProfile(profile);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildImmuneMetabolicMicrobiomeIntelligencePack(input: {
  gutImmuneMetabolicGraphScopes: readonly GutImmuneMetabolicGraphScope[];
  immuneVsMetabolicPathwayComparisons: readonly ImmuneVsMetabolicPathwayComparisonRecord[];
  metaboliteHostInteractions: readonly MetaboliteHostInteractionRecord[];
  microbialFunctionHostPathwayMappings: readonly MicrobialFunctionHostPathwayMappingRecord[];
  inflammationMetabolicPhenotypeRelationships: readonly InflammationMetabolicPhenotypeRelationshipRecord[];
  diseaseContextComparisons: readonly DiseaseContextComparisonRecord[];
  evidenceContradictionAnalyses: readonly EvidenceContradictionAnalysisRecord[];
  profiles: readonly ImmuneMetabolicMicrobiomeProfile[];
  asOf: string;
}): {
  schema: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA;
  method: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD;
  version: typeof IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION;
  asOf: string;
  gutImmuneMetabolicGraphScopeCount: number;
  immuneVsMetabolicPathwayComparisonCount: number;
  metaboliteHostInteractionCount: number;
  microbialFunctionHostPathwayMappingCount: number;
  inflammationMetabolicPhenotypeRelationshipCount: number;
  diseaseContextComparisonCount: number;
  evidenceContradictionAnalysisCount: number;
  profileCount: number;
  axisBandCount: number;
  capabilityKindCount: number;
  evidenceDistinctionCount: number;
  honesty: ImmuneMetabolicMicrobiomeIntelligenceHonesty;
  gutImmuneMetabolicGraphScopes: readonly GutImmuneMetabolicGraphScope[];
  immuneVsMetabolicPathwayComparisons: readonly ImmuneVsMetabolicPathwayComparisonRecord[];
  metaboliteHostInteractions: readonly MetaboliteHostInteractionRecord[];
  microbialFunctionHostPathwayMappings: readonly MicrobialFunctionHostPathwayMappingRecord[];
  inflammationMetabolicPhenotypeRelationships: readonly InflammationMetabolicPhenotypeRelationshipRecord[];
  diseaseContextComparisons: readonly DiseaseContextComparisonRecord[];
  evidenceContradictionAnalyses: readonly EvidenceContradictionAnalysisRecord[];
  profiles: readonly ImmuneMetabolicMicrobiomeProfile[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const gutImmuneMetabolicGraphScopes =
    input.gutImmuneMetabolicGraphScopes.map(
      validateGutImmuneMetabolicGraphScope,
    );
  const immuneVsMetabolicPathwayComparisons =
    input.immuneVsMetabolicPathwayComparisons.map(
      validateImmuneVsMetabolicPathwayComparison,
    );
  const metaboliteHostInteractions = input.metaboliteHostInteractions.map(
    validateMetaboliteHostInteraction,
  );
  const microbialFunctionHostPathwayMappings =
    input.microbialFunctionHostPathwayMappings.map(
      validateMicrobialFunctionHostPathwayMapping,
    );
  const inflammationMetabolicPhenotypeRelationships =
    input.inflammationMetabolicPhenotypeRelationships.map(
      validateInflammationMetabolicPhenotypeRelationship,
    );
  const diseaseContextComparisons = input.diseaseContextComparisons.map(
    validateDiseaseContextComparison,
  );
  const evidenceContradictionAnalyses =
    input.evidenceContradictionAnalyses.map(
      validateEvidenceContradictionAnalysis,
    );
  const profiles = input.profiles.map(
    validateImmuneMetabolicMicrobiomeProfile,
  );

  return {
    schema: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA,
    method: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD,
    version: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION,
    asOf: input.asOf,
    gutImmuneMetabolicGraphScopeCount: gutImmuneMetabolicGraphScopes.length,
    immuneVsMetabolicPathwayComparisonCount:
      immuneVsMetabolicPathwayComparisons.length,
    metaboliteHostInteractionCount: metaboliteHostInteractions.length,
    microbialFunctionHostPathwayMappingCount:
      microbialFunctionHostPathwayMappings.length,
    inflammationMetabolicPhenotypeRelationshipCount:
      inflammationMetabolicPhenotypeRelationships.length,
    diseaseContextComparisonCount: diseaseContextComparisons.length,
    evidenceContradictionAnalysisCount: evidenceContradictionAnalyses.length,
    profileCount: profiles.length,
    axisBandCount: IMMI_AXIS_BANDS.length,
    capabilityKindCount: IMMI_CAPABILITY_KINDS.length,
    evidenceDistinctionCount: IMMI_EVIDENCE_DISTINCTIONS.length,
    honesty: {...DEFAULT_HONESTY},
    gutImmuneMetabolicGraphScopes,
    immuneVsMetabolicPathwayComparisons,
    metaboliteHostInteractions,
    microbialFunctionHostPathwayMappings,
    inflammationMetabolicPhenotypeRelationships,
    diseaseContextComparisons,
    evidenceContradictionAnalyses,
    profiles,
  };
}
