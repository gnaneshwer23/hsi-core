/**
 * Milestone 16 / PR2 — Cross-Disease Mechanism Intelligence.
 *
 * Extends biological mechanism investigation with governed contracts for the
 * comparative workflow:
 * 1. define diseases being compared
 * 2. resolve disease identifiers
 * 3. retrieve approved mechanisms
 * 4. identify shared genes/proteins/pathways
 * 5. compare cell/tissue contexts
 * 6. retrieve supporting evidence
 * 7. retrieve opposing evidence
 * 8. evaluate directionality
 * 9. identify disease-specific differences
 * 10. generate a reviewable comparative mechanism profile
 *
 * Composes M16 PR1 Human Systems Intelligence envelopes (`hsi-hsys-inv-*`,
 * optional `hsi-hsys-cmr-*`) and M15 disease-context ids (`hsi-hdi-ctx-*`).
 *
 * Binding honesty / fail-closed:
 * - Research intelligence only; fixtures until authorised.
 * - Shared gene ≠ shared causal mechanism.
 * - Pathway enrichment ≠ activation.
 * - Do not auto-transfer mechanisms across diseases.
 * - Preserve species / tissue / cell state / disease stage / experimental context.
 * - No PHI/CDS, Gate C auto-approve, MoU invention, Neon migration, or UI.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA =
  "hsi-cross-disease-mechanism-intelligence-1" as const;
export const CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD =
  "hsi.cross_disease_mechanism_intelligence.v1" as const;
export const CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION = "0.1.0" as const;

/**
 * Closed mechanism-intelligence classifications for comparative profiles.
 * Distinct from PR1 relationship-envelope classifications.
 */
export const CDMI_MECHANISM_CLASSIFICATIONS = [
  "shared_molecular_association",
  "shared_pathway_involvement",
  "shared_functional_mechanism",
  "disease_specific",
  "context_dependent",
  "computational_similarity",
  "unvalidated_mechanistic_hypothesis",
] as const;
export type CdmiMechanismClassification =
  (typeof CDMI_MECHANISM_CLASSIFICATIONS)[number];

export const CDMI_DATASET_AVAILABILITIES = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type CdmiDatasetAvailability =
  (typeof CDMI_DATASET_AVAILABILITIES)[number];

export const CDMI_DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type CdmiDataBasis = (typeof CDMI_DATA_BASES)[number];

export const CDMI_ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type CdmiActorKind = (typeof CDMI_ACTOR_KINDS)[number];

export const CDMI_IDENTIFIER_RESOLUTION_STATUSES = [
  "resolved_fixture",
  "resolved_authorised_declared",
  "denied_unresolved",
  "blocked_no_authorised_dataset",
] as const;
export type CdmiIdentifierResolutionStatus =
  (typeof CDMI_IDENTIFIER_RESOLUTION_STATUSES)[number];

export const CDMI_MECHANISM_APPROVAL_SCOPES = [
  "fixture_approved_declared",
  "public_biomedical_approved_declared",
  "blocked_unapproved",
] as const;
export type CdmiMechanismApprovalScope =
  (typeof CDMI_MECHANISM_APPROVAL_SCOPES)[number];

export const CDMI_MOLECULAR_ENTITY_KINDS = [
  "gene",
  "protein",
  "pathway",
] as const;
export type CdmiMolecularEntityKind =
  (typeof CDMI_MOLECULAR_ENTITY_KINDS)[number];

export const CDMI_EVIDENCE_POLARITIES = [
  "supports",
  "opposes",
  "mixed_or_uncertain",
] as const;
export type CdmiEvidencePolarity = (typeof CDMI_EVIDENCE_POLARITIES)[number];

export const CDMI_DIRECTIONALITY_ORDINALS = [
  "not_assessed",
  "concordant_association_declared",
  "discordant_or_opposing_declared",
  "context_dependent_direction_declared",
  "insufficient_to_evaluate",
] as const;
export type CdmiDirectionalityOrdinal =
  (typeof CDMI_DIRECTIONALITY_ORDINALS)[number];

export const CDMI_PROFILE_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_awaiting_authorised_dataset",
  "rejected",
  "superseded",
] as const;
export type CdmiProfileLifecycle = (typeof CDMI_PROFILE_LIFECYCLES)[number];

const DEF_ID_RE = /^hsi-cdmi-def-[a-z0-9-]{3,80}$/;
const RES_ID_RE = /^hsi-cdmi-res-[a-z0-9-]{3,80}$/;
const MECH_ID_RE = /^hsi-cdmi-mech-[a-z0-9-]{3,80}$/;
const MOL_ID_RE = /^hsi-cdmi-mol-[a-z0-9-]{3,80}$/;
const CTX_ID_RE = /^hsi-cdmi-ctx-[a-z0-9-]{3,80}$/;
const SUP_ID_RE = /^hsi-cdmi-sup-[a-z0-9-]{3,80}$/;
const OPP_ID_RE = /^hsi-cdmi-opp-[a-z0-9-]{3,80}$/;
const DIR_ID_RE = /^hsi-cdmi-dir-[a-z0-9-]{3,80}$/;
const DIFF_ID_RE = /^hsi-cdmi-diff-[a-z0-9-]{3,80}$/;
const CMP_ID_RE = /^hsi-cdmi-cmp-[a-z0-9-]{3,80}$/;
const INV_ID_RE = /^hsi-hsys-inv-[a-z0-9-]{3,80}$/;
const CMR_ID_RE = /^hsi-hsys-cmr-[a-z0-9-]{3,80}$/;
const HDI_CTX_RE = /^hsi-hdi-ctx-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type CrossDiseaseMechanismIntelligenceHonesty = {
  researchIntelligenceOnly: true;
  notDiagnosisOrTreatmentSelection: true;
  notClinicalDecisionMaking: true;
  sharedGeneIsNotSharedCausalMechanism: true;
  pathwayEnrichmentIsNotActivation: true;
  noAutoTransferOfMechanismsAcrossDiseases: true;
  experimentalContextMustBePreserved: true;
  noInventedMechanismsOrStatistics: true;
  noPhiIngestion: true;
  noWorkbenchUi: true;
  agentsDraftHumansReview: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  causalMechanismProven: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
};

export type CdmiActor = {
  principalId: string;
  actorKind: CdmiActorKind;
};

/** Preserved experimental / biological context — never collapsed away. */
export type CdmiExperimentalContext = {
  species: string;
  tissue: string;
  cellState: string;
  diseaseStage: string;
  experimentalContext: string;
};

export type DiseaseComparisonDefinition = {
  schema: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA;
  method: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD;
  version: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION;
  id: string;
  displayName: string;
  scientificQuestion: string;
  investigationId: string;
  diseaseContextIds: readonly string[];
  datasetAvailability: CdmiDatasetAvailability;
  autoTransferAcrossDiseases: false;
  containsIdentifiablePhi: false;
  authoredBy: CdmiActor;
  dataBasis: CdmiDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossDiseaseMechanismIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DiseaseIdentifierResolution = {
  schema: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA;
  method: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD;
  version: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION;
  id: string;
  comparisonDefinitionId: string;
  investigationId: string;
  diseaseContextId: string;
  resolvedIdentifier: string;
  resolutionStatus: CdmiIdentifierResolutionStatus;
  resolved: boolean;
  denyReason: string | null;
  datasetAvailabilityBlocked: boolean;
  authoredBy: CdmiActor;
  dataBasis: CdmiDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossDiseaseMechanismIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ApprovedMechanismRetrieval = {
  schema: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA;
  method: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD;
  version: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION;
  id: string;
  comparisonDefinitionId: string;
  investigationId: string;
  diseaseContextId: string;
  mechanismLabel: string;
  approvalScope: CdmiMechanismApprovalScope;
  approved: boolean;
  denyReason: string | null;
  experimentalContext: CdmiExperimentalContext;
  optionalPr1MechanismRelationshipId: string | null;
  autoTransferAcrossDiseases: false;
  authoredBy: CdmiActor;
  dataBasis: CdmiDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossDiseaseMechanismIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type SharedMolecularOverlap = {
  schema: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA;
  method: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD;
  version: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION;
  id: string;
  comparisonDefinitionId: string;
  investigationId: string;
  diseaseContextIdA: string;
  diseaseContextIdB: string;
  entityKind: CdmiMolecularEntityKind;
  entityLabel: string;
  mechanismClassification: CdmiMechanismClassification;
  sharedGeneIsNotSharedCausalMechanism: true;
  pathwayEnrichmentIsNotActivation: true;
  autoTransferAcrossDiseases: false;
  causalMechanismProven: false;
  experimentalContext: CdmiExperimentalContext;
  approvedMechanismRetrievalIds: readonly string[];
  authoredBy: CdmiActor;
  dataBasis: CdmiDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossDiseaseMechanismIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CellTissueContextComparison = {
  schema: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA;
  method: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD;
  version: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION;
  id: string;
  comparisonDefinitionId: string;
  investigationId: string;
  diseaseContextIdA: string;
  diseaseContextIdB: string;
  contextSummary: string;
  contextA: CdmiExperimentalContext;
  contextB: CdmiExperimentalContext;
  contextsComparable: boolean;
  contextDependent: boolean;
  autoTransferAcrossDiseases: false;
  authoredBy: CdmiActor;
  dataBasis: CdmiDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossDiseaseMechanismIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type SupportingEvidenceRetrieval = {
  schema: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA;
  method: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD;
  version: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION;
  id: string;
  comparisonDefinitionId: string;
  investigationId: string;
  relatedOverlapOrMechanismId: string;
  evidenceSummary: string;
  polarity: "supports";
  evidenceRef: string;
  experimentalContext: CdmiExperimentalContext;
  inventedStatistics: null;
  authoredBy: CdmiActor;
  dataBasis: CdmiDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossDiseaseMechanismIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type OpposingEvidenceRetrieval = {
  schema: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA;
  method: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD;
  version: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION;
  id: string;
  comparisonDefinitionId: string;
  investigationId: string;
  relatedOverlapOrMechanismId: string;
  evidenceSummary: string;
  polarity: "opposes";
  evidenceRef: string;
  experimentalContext: CdmiExperimentalContext;
  inventedStatistics: null;
  authoredBy: CdmiActor;
  dataBasis: CdmiDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossDiseaseMechanismIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DirectionalityEvaluation = {
  schema: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA;
  method: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD;
  version: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION;
  id: string;
  comparisonDefinitionId: string;
  investigationId: string;
  directionalityOrdinal: CdmiDirectionalityOrdinal;
  evaluationSummary: string;
  supportingEvidenceIds: readonly string[];
  opposingEvidenceIds: readonly string[];
  causalMechanismProven: false;
  autoTransferAcrossDiseases: false;
  authoredBy: CdmiActor;
  dataBasis: CdmiDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossDiseaseMechanismIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DiseaseSpecificDifferenceIdentification = {
  schema: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA;
  method: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD;
  version: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION;
  id: string;
  comparisonDefinitionId: string;
  investigationId: string;
  diseaseContextId: string;
  differenceSummary: string;
  mechanismClassification: "disease_specific" | "context_dependent";
  autoTransferAcrossDiseases: false;
  experimentalContext: CdmiExperimentalContext;
  authoredBy: CdmiActor;
  dataBasis: CdmiDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossDiseaseMechanismIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ComparativeMechanismProfile = {
  schema: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA;
  method: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD;
  version: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION;
  id: string;
  displayName: string;
  comparisonDefinitionId: string;
  investigationId: string;
  diseaseContextIds: readonly string[];
  identifierResolutionIds: readonly string[];
  approvedMechanismRetrievalIds: readonly string[];
  sharedMolecularOverlapIds: readonly string[];
  cellTissueContextComparisonIds: readonly string[];
  supportingEvidenceIds: readonly string[];
  opposingEvidenceIds: readonly string[];
  directionalityEvaluationIds: readonly string[];
  diseaseSpecificDifferenceIds: readonly string[];
  primaryMechanismClassification: CdmiMechanismClassification;
  profileVersion: string;
  lifecycle: CdmiProfileLifecycle;
  reviewedBy: CdmiActor | null;
  sharedGeneIsNotSharedCausalMechanism: true;
  pathwayEnrichmentIsNotActivation: true;
  autoTransferAcrossDiseases: false;
  causalMechanismProven: false;
  graphPromotable: false;
  containsIdentifiablePhi: false;
  limitations: readonly string[];
  authoredBy: CdmiActor;
  dataBasis: CdmiDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossDiseaseMechanismIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossDiseaseMechanismIntelligenceStore = {
  upsertComparisonDefinition(
    record: DiseaseComparisonDefinition,
  ): DiseaseComparisonDefinition;
  getComparisonDefinition(id: string): DiseaseComparisonDefinition | null;
  listComparisonDefinitions(): readonly DiseaseComparisonDefinition[];
  upsertIdentifierResolution(
    record: DiseaseIdentifierResolution,
  ): DiseaseIdentifierResolution;
  getIdentifierResolution(id: string): DiseaseIdentifierResolution | null;
  listIdentifierResolutions(
    comparisonDefinitionId?: string,
  ): readonly DiseaseIdentifierResolution[];
  upsertApprovedMechanismRetrieval(
    record: ApprovedMechanismRetrieval,
  ): ApprovedMechanismRetrieval;
  getApprovedMechanismRetrieval(id: string): ApprovedMechanismRetrieval | null;
  listApprovedMechanismRetrievals(
    comparisonDefinitionId?: string,
  ): readonly ApprovedMechanismRetrieval[];
  upsertSharedMolecularOverlap(
    record: SharedMolecularOverlap,
  ): SharedMolecularOverlap;
  getSharedMolecularOverlap(id: string): SharedMolecularOverlap | null;
  listSharedMolecularOverlaps(
    comparisonDefinitionId?: string,
  ): readonly SharedMolecularOverlap[];
  upsertCellTissueContextComparison(
    record: CellTissueContextComparison,
  ): CellTissueContextComparison;
  getCellTissueContextComparison(
    id: string,
  ): CellTissueContextComparison | null;
  listCellTissueContextComparisons(
    comparisonDefinitionId?: string,
  ): readonly CellTissueContextComparison[];
  upsertSupportingEvidence(
    record: SupportingEvidenceRetrieval,
  ): SupportingEvidenceRetrieval;
  getSupportingEvidence(id: string): SupportingEvidenceRetrieval | null;
  listSupportingEvidence(
    comparisonDefinitionId?: string,
  ): readonly SupportingEvidenceRetrieval[];
  upsertOpposingEvidence(
    record: OpposingEvidenceRetrieval,
  ): OpposingEvidenceRetrieval;
  getOpposingEvidence(id: string): OpposingEvidenceRetrieval | null;
  listOpposingEvidence(
    comparisonDefinitionId?: string,
  ): readonly OpposingEvidenceRetrieval[];
  upsertDirectionalityEvaluation(
    record: DirectionalityEvaluation,
  ): DirectionalityEvaluation;
  getDirectionalityEvaluation(id: string): DirectionalityEvaluation | null;
  listDirectionalityEvaluations(
    comparisonDefinitionId?: string,
  ): readonly DirectionalityEvaluation[];
  upsertDiseaseSpecificDifference(
    record: DiseaseSpecificDifferenceIdentification,
  ): DiseaseSpecificDifferenceIdentification;
  getDiseaseSpecificDifference(
    id: string,
  ): DiseaseSpecificDifferenceIdentification | null;
  listDiseaseSpecificDifferences(
    comparisonDefinitionId?: string,
  ): readonly DiseaseSpecificDifferenceIdentification[];
  upsertComparativeMechanismProfile(
    record: ComparativeMechanismProfile,
  ): ComparativeMechanismProfile;
  getComparativeMechanismProfile(
    id: string,
  ): ComparativeMechanismProfile | null;
  listComparativeMechanismProfiles(
    comparisonDefinitionId?: string,
  ): readonly ComparativeMechanismProfile[];
};

const DEFAULT_HONESTY: CrossDiseaseMechanismIntelligenceHonesty = {
  researchIntelligenceOnly: true,
  notDiagnosisOrTreatmentSelection: true,
  notClinicalDecisionMaking: true,
  sharedGeneIsNotSharedCausalMechanism: true,
  pathwayEnrichmentIsNotActivation: true,
  noAutoTransferOfMechanismsAcrossDiseases: true,
  experimentalContextMustBePreserved: true,
  noInventedMechanismsOrStatistics: true,
  noPhiIngestion: true,
  noWorkbenchUi: true,
  agentsDraftHumansReview: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  causalMechanismProven: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
};

const PROFILE_TRANSITIONS: Record<
  CdmiProfileLifecycle,
  readonly CdmiProfileLifecycle[]
> = {
  draft: [
    "under_review",
    "blocked_awaiting_authorised_dataset",
    "rejected",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_awaiting_authorised_dataset",
    "rejected",
    "draft",
  ],
  accepted_with_limitations: ["superseded"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
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
  honesty: CrossDiseaseMechanismIntelligenceHonesty,
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
  if (honesty.sharedGeneIsNotSharedCausalMechanism !== true) {
    throw Error("Shared gene must not imply shared causal mechanism");
  }
  if (honesty.pathwayEnrichmentIsNotActivation !== true) {
    throw Error("Pathway enrichment must not imply activation");
  }
  if (honesty.noAutoTransferOfMechanismsAcrossDiseases !== true) {
    throw Error("Auto-transfer of mechanisms across diseases forbidden");
  }
  if (honesty.experimentalContextMustBePreserved !== true) {
    throw Error("Experimental context must be preserved");
  }
  if (honesty.noInventedMechanismsOrStatistics !== true) {
    throw Error("Invented mechanisms/statistics forbidden");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR2");
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
    throw Error("Scientific approval must stay false in PR2");
  }
  if (honesty.causalMechanismProven !== false) {
    throw Error("Causal mechanism proven claims forbidden");
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
      /\b(?:not|no|without|never|nor)\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+selection|treatment\s+recommendation|clinical\s+decision(?:[- ]making)?|shared\s+causal\s+mechanism|pathway\s+activation|auto[- ]transfer(?:\s+of\s+mechanisms?)?|proven\s+causation|causal\s+mechanism\s+proven)(?:\s+or\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+selection|treatment\s+recommendation|clinical\s+decision(?:[- ]making)?|shared\s+causal\s+mechanism|pathway\s+activation))*/g,
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
    /\bauto[- ]transfer(?:red|ring)?\s+(?:mechanisms?\s+)?across\s+diseases?\b/.test(
      lower,
    ) ||
    /\bcausal\s+mechanism\s+proven\b/.test(lower) ||
    /\bproven\s+causation\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bhr\s*=\s*[\d.]+\b/.test(lower) ||
    /\bor\s*=\s*[\d.]+\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower)
  ) {
    throw Error(
      `${label} must not diagnose/select treatments, claim shared causal mechanism/pathway activation, auto-transfer mechanisms, invent effect sizes, or include identifiers`,
    );
  }
}

function assertActor(actor: CdmiActor, label: string): CdmiActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, CDMI_ACTOR_KINDS, `${label} actorKind`);
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

function assertExperimentalContext(
  context: CdmiExperimentalContext,
  label: string,
): CdmiExperimentalContext {
  if (!textOk(context.species, 120)) throw Error(`Invalid ${label}.species`);
  if (!textOk(context.tissue, 160)) throw Error(`Invalid ${label}.tissue`);
  if (!textOk(context.cellState, 160)) throw Error(`Invalid ${label}.cellState`);
  if (!textOk(context.diseaseStage, 160)) {
    throw Error(`Invalid ${label}.diseaseStage`);
  }
  if (!textOk(context.experimentalContext, 500)) {
    throw Error(`Invalid ${label}.experimentalContext`);
  }
  assertNoForbiddenClaimLanguage(context.species, `${label}.species`);
  assertNoForbiddenClaimLanguage(context.tissue, `${label}.tissue`);
  assertNoForbiddenClaimLanguage(context.cellState, `${label}.cellState`);
  assertNoForbiddenClaimLanguage(
    context.diseaseStage,
    `${label}.diseaseStage`,
  );
  assertNoForbiddenClaimLanguage(
    context.experimentalContext,
    `${label}.experimentalContext`,
  );
  return {
    species: context.species.trim(),
    tissue: context.tissue.trim(),
    cellState: context.cellState.trim(),
    diseaseStage: context.diseaseStage.trim(),
    experimentalContext: context.experimentalContext.trim(),
  };
}

function dataBasisForDataset(
  availability: CdmiDatasetAvailability,
): CdmiDataBasis {
  if (availability === "authorised_declared") return "declared_research";
  return "fixture_engineering";
}

function refuseAutoTransfer(autoTransfer?: boolean): void {
  if (autoTransfer === true) {
    throw Error(
      "Fail-closed: auto-transfer of mechanisms across diseases is forbidden",
    );
  }
}

function refuseSharedGeneAsCausal(input: {
  mechanismClassification: CdmiMechanismClassification;
  claimSharedCausalMechanism?: boolean;
}): void {
  if (
    (input.mechanismClassification === "shared_molecular_association" ||
      input.mechanismClassification === "shared_pathway_involvement" ||
      input.mechanismClassification === "computational_similarity") &&
    input.claimSharedCausalMechanism === true
  ) {
    throw Error(
      "Fail-closed: shared gene/pathway/computational similarity must not become shared causal mechanism",
    );
  }
  if (input.claimSharedCausalMechanism === true) {
    throw Error("Fail-closed: causal mechanism proven claims forbidden");
  }
}

function refusePathwayEnrichmentAsActivation(input: {
  mechanismClassification: CdmiMechanismClassification;
  claimPathwayActivation?: boolean;
}): void {
  if (
    input.mechanismClassification === "shared_pathway_involvement" &&
    input.claimPathwayActivation === true
  ) {
    throw Error(
      "Fail-closed: pathway enrichment/involvement must not imply pathway activation",
    );
  }
}

export function draftDiseaseComparisonDefinition(input: {
  id: string;
  displayName: string;
  scientificQuestion: string;
  investigationId: string;
  diseaseContextIds: readonly string[];
  datasetAvailability?: CdmiDatasetAvailability;
  authoredByPrincipalId: string;
  authoredByActorKind?: CdmiActorKind;
  createdAt: string;
  note?: string;
  autoTransferAcrossDiseases?: boolean;
}): DiseaseComparisonDefinition {
  if (!DEF_ID_RE.test(input.id)) {
    throw Error("Invalid disease comparison definition id");
  }
  if (!INV_ID_RE.test(input.investigationId)) {
    throw Error("Invalid investigationId (compose PR1 hsi-hsys-inv-*)");
  }
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  if (!textOk(input.scientificQuestion, 1000)) {
    throw Error("Invalid scientificQuestion");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  refuseAutoTransfer(input.autoTransferAcrossDiseases);
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(
    input.scientificQuestion,
    "scientificQuestion",
  );

  const diseaseContextIds = assertIdList(
    input.diseaseContextIds,
    HDI_CTX_RE,
    "diseaseContextId",
    8,
  );
  if (diseaseContextIds.length < 2) {
    throw Error("At least 2 diseaseContextIds required for comparison");
  }

  const datasetAvailability =
    input.datasetAvailability ?? "fixture_only";
  assertClosed(
    datasetAvailability,
    CDMI_DATASET_AVAILABILITIES,
    "datasetAvailability",
  );

  const record: DiseaseComparisonDefinition = {
    schema: CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
    method: CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
    version: CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    investigationId: input.investigationId,
    diseaseContextIds,
    datasetAvailability,
    autoTransferAcrossDiseases: false,
    containsIdentifiablePhi: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForDataset(datasetAvailability),
    fixtureHonesty: datasetAvailability === "fixture_only",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "Cross-disease mechanism comparison definition").trim(),
  };
  return validateDiseaseComparisonDefinition(record);
}

export function validateDiseaseComparisonDefinition(
  record: DiseaseComparisonDefinition,
): DiseaseComparisonDefinition {
  if (record.schema !== CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA) {
    throw Error("Invalid schema");
  }
  if (record.method !== CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD) {
    throw Error("Invalid method");
  }
  if (record.version !== CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION) {
    throw Error("Invalid version");
  }
  if (!DEF_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!INV_ID_RE.test(record.investigationId)) {
    throw Error("Invalid investigationId");
  }
  if (record.diseaseContextIds.length < 2) {
    throw Error("At least 2 diseaseContextIds required");
  }
  assertIdList(record.diseaseContextIds, HDI_CTX_RE, "diseaseContextId", 8);
  assertClosed(
    record.datasetAvailability,
    CDMI_DATASET_AVAILABILITIES,
    "datasetAvailability",
  );
  if (record.autoTransferAcrossDiseases !== false) {
    throw Error("autoTransferAcrossDiseases must be false");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("PHI forbidden");
  }
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  if (!isIsoTimestamp(record.createdAt) || !isIsoTimestamp(record.updatedAt)) {
    throw Error("Invalid timestamps");
  }
  return record;
}

export function draftDiseaseIdentifierResolution(input: {
  id: string;
  comparison: DiseaseComparisonDefinition;
  diseaseContextId: string;
  resolvedIdentifier: string;
  resolutionStatus: CdmiIdentifierResolutionStatus;
  denyReason?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CdmiActorKind;
  createdAt: string;
  note?: string;
}): DiseaseIdentifierResolution {
  if (!RES_ID_RE.test(input.id)) {
    throw Error("Invalid disease identifier resolution id");
  }
  validateDiseaseComparisonDefinition(input.comparison);
  if (!input.comparison.diseaseContextIds.includes(input.diseaseContextId)) {
    throw Error("diseaseContextId must belong to comparison definition");
  }
  if (!HDI_CTX_RE.test(input.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (!REF_ID_RE.test(input.resolvedIdentifier)) {
    throw Error("Invalid resolvedIdentifier");
  }
  assertClosed(
    input.resolutionStatus,
    CDMI_IDENTIFIER_RESOLUTION_STATUSES,
    "resolutionStatus",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const resolved =
    input.resolutionStatus === "resolved_fixture" ||
    input.resolutionStatus === "resolved_authorised_declared";
  const datasetAvailabilityBlocked =
    input.resolutionStatus === "blocked_no_authorised_dataset" ||
    input.comparison.datasetAvailability ===
      "blocked_no_authorised_clinical_dataset";

  let denyReason: string | null = null;
  if (!resolved) {
    denyReason =
      input.denyReason?.trim() ||
      (input.resolutionStatus === "denied_unresolved"
        ? "Disease identifier unresolved"
        : "Authorised dataset not supplied for identifier resolution");
    if (!textOk(denyReason, 500)) throw Error("Invalid denyReason");
  } else if (input.denyReason) {
    throw Error("denyReason must be null when resolved");
  }

  const record: DiseaseIdentifierResolution = {
    schema: CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
    method: CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
    version: CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
    id: input.id,
    comparisonDefinitionId: input.comparison.id,
    investigationId: input.comparison.investigationId,
    diseaseContextId: input.diseaseContextId,
    resolvedIdentifier: input.resolvedIdentifier,
    resolutionStatus: input.resolutionStatus,
    resolved,
    denyReason,
    datasetAvailabilityBlocked,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForDataset(input.comparison.datasetAvailability),
    fixtureHonesty: input.resolutionStatus === "resolved_fixture",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "Disease identifier resolution").trim(),
  };
  return validateDiseaseIdentifierResolution(record);
}

export function validateDiseaseIdentifierResolution(
  record: DiseaseIdentifierResolution,
): DiseaseIdentifierResolution {
  if (!RES_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!DEF_ID_RE.test(record.comparisonDefinitionId)) {
    throw Error("Invalid comparisonDefinitionId");
  }
  if (!INV_ID_RE.test(record.investigationId)) {
    throw Error("Invalid investigationId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  assertClosed(
    record.resolutionStatus,
    CDMI_IDENTIFIER_RESOLUTION_STATUSES,
    "resolutionStatus",
  );
  assertHonesty(record.honesty);
  return record;
}

export function draftApprovedMechanismRetrieval(input: {
  id: string;
  comparison: DiseaseComparisonDefinition;
  diseaseContextId: string;
  mechanismLabel: string;
  approvalScope: CdmiMechanismApprovalScope;
  experimentalContext: CdmiExperimentalContext;
  optionalPr1MechanismRelationshipId?: string | null;
  denyReason?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CdmiActorKind;
  createdAt: string;
  note?: string;
  autoTransferAcrossDiseases?: boolean;
}): ApprovedMechanismRetrieval {
  if (!MECH_ID_RE.test(input.id)) {
    throw Error("Invalid approved mechanism retrieval id");
  }
  validateDiseaseComparisonDefinition(input.comparison);
  if (!input.comparison.diseaseContextIds.includes(input.diseaseContextId)) {
    throw Error("diseaseContextId must belong to comparison definition");
  }
  if (!textOk(input.mechanismLabel, 300)) throw Error("Invalid mechanismLabel");
  assertClosed(
    input.approvalScope,
    CDMI_MECHANISM_APPROVAL_SCOPES,
    "approvalScope",
  );
  refuseAutoTransfer(input.autoTransferAcrossDiseases);
  assertNoForbiddenClaimLanguage(input.mechanismLabel, "mechanismLabel");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const approved = input.approvalScope !== "blocked_unapproved";
  let denyReason: string | null = null;
  if (!approved) {
    denyReason =
      input.denyReason?.trim() ||
      "Mechanism not approved for cross-disease retrieval";
    if (!textOk(denyReason, 500)) throw Error("Invalid denyReason");
  } else if (input.denyReason) {
    throw Error("denyReason must be null when approved");
  }

  const record: ApprovedMechanismRetrieval = {
    schema: CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
    method: CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
    version: CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
    id: input.id,
    comparisonDefinitionId: input.comparison.id,
    investigationId: input.comparison.investigationId,
    diseaseContextId: input.diseaseContextId,
    mechanismLabel: input.mechanismLabel.trim(),
    approvalScope: input.approvalScope,
    approved,
    denyReason,
    experimentalContext: assertExperimentalContext(
      input.experimentalContext,
      "experimentalContext",
    ),
    optionalPr1MechanismRelationshipId: assertOptionalId(
      input.optionalPr1MechanismRelationshipId,
      CMR_ID_RE,
      "optionalPr1MechanismRelationshipId",
    ),
    autoTransferAcrossDiseases: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForDataset(input.comparison.datasetAvailability),
    fixtureHonesty: input.approvalScope === "fixture_approved_declared",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "Approved mechanism retrieval").trim(),
  };
  return validateApprovedMechanismRetrieval(record);
}

export function validateApprovedMechanismRetrieval(
  record: ApprovedMechanismRetrieval,
): ApprovedMechanismRetrieval {
  if (!MECH_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.autoTransferAcrossDiseases !== false) {
    throw Error("autoTransferAcrossDiseases must be false");
  }
  assertExperimentalContext(
    record.experimentalContext,
    "experimentalContext",
  );
  assertHonesty(record.honesty);
  return record;
}

export function draftSharedMolecularOverlap(input: {
  id: string;
  comparison: DiseaseComparisonDefinition;
  diseaseContextIdA: string;
  diseaseContextIdB: string;
  entityKind: CdmiMolecularEntityKind;
  entityLabel: string;
  mechanismClassification: CdmiMechanismClassification;
  experimentalContext: CdmiExperimentalContext;
  approvedMechanisms: readonly ApprovedMechanismRetrieval[];
  authoredByPrincipalId: string;
  authoredByActorKind?: CdmiActorKind;
  createdAt: string;
  note?: string;
  claimSharedCausalMechanism?: boolean;
  claimPathwayActivation?: boolean;
  autoTransferAcrossDiseases?: boolean;
}): SharedMolecularOverlap {
  if (!MOL_ID_RE.test(input.id)) {
    throw Error("Invalid shared molecular overlap id");
  }
  validateDiseaseComparisonDefinition(input.comparison);
  if (
    !input.comparison.diseaseContextIds.includes(input.diseaseContextIdA) ||
    !input.comparison.diseaseContextIds.includes(input.diseaseContextIdB)
  ) {
    throw Error("Overlap disease contexts must belong to comparison");
  }
  if (input.diseaseContextIdA === input.diseaseContextIdB) {
    throw Error("Overlap requires two distinct disease contexts");
  }
  assertClosed(input.entityKind, CDMI_MOLECULAR_ENTITY_KINDS, "entityKind");
  assertClosed(
    input.mechanismClassification,
    CDMI_MECHANISM_CLASSIFICATIONS,
    "mechanismClassification",
  );
  if (!textOk(input.entityLabel, 200)) throw Error("Invalid entityLabel");
  refuseAutoTransfer(input.autoTransferAcrossDiseases);
  refuseSharedGeneAsCausal({
    mechanismClassification: input.mechanismClassification,
    claimSharedCausalMechanism: input.claimSharedCausalMechanism,
  });
  refusePathwayEnrichmentAsActivation({
    mechanismClassification: input.mechanismClassification,
    claimPathwayActivation: input.claimPathwayActivation,
  });
  assertNoForbiddenClaimLanguage(input.entityLabel, "entityLabel");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  if (input.approvedMechanisms.length === 0) {
    throw Error("At least one approved mechanism retrieval required");
  }
  for (const mech of input.approvedMechanisms) {
    validateApprovedMechanismRetrieval(mech);
    if (mech.comparisonDefinitionId !== input.comparison.id) {
      throw Error("Mechanism retrieval must match comparison definition");
    }
    if (!mech.approved) {
      throw Error("Cannot overlap unapproved mechanisms");
    }
  }

  if (
    input.entityKind === "gene" &&
    input.mechanismClassification !== "shared_molecular_association" &&
    input.mechanismClassification !== "computational_similarity" &&
    input.mechanismClassification !== "unvalidated_mechanistic_hypothesis" &&
    input.mechanismClassification !== "context_dependent"
  ) {
    throw Error(
      "Gene overlaps must use molecular/computational/context/unvalidated classifications — not shared functional mechanism auto-claim",
    );
  }
  if (
    input.entityKind === "pathway" &&
    input.mechanismClassification === "shared_molecular_association"
  ) {
    throw Error(
      "Pathway overlaps should use shared_pathway_involvement (or other non-molecular) classification",
    );
  }

  const record: SharedMolecularOverlap = {
    schema: CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
    method: CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
    version: CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
    id: input.id,
    comparisonDefinitionId: input.comparison.id,
    investigationId: input.comparison.investigationId,
    diseaseContextIdA: input.diseaseContextIdA,
    diseaseContextIdB: input.diseaseContextIdB,
    entityKind: input.entityKind,
    entityLabel: input.entityLabel.trim(),
    mechanismClassification: input.mechanismClassification,
    sharedGeneIsNotSharedCausalMechanism: true,
    pathwayEnrichmentIsNotActivation: true,
    autoTransferAcrossDiseases: false,
    causalMechanismProven: false,
    experimentalContext: assertExperimentalContext(
      input.experimentalContext,
      "experimentalContext",
    ),
    approvedMechanismRetrievalIds: input.approvedMechanisms.map((m) => m.id),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForDataset(input.comparison.datasetAvailability),
    fixtureHonesty: input.comparison.datasetAvailability === "fixture_only",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "Shared molecular overlap — not causal transfer").trim(),
  };
  return validateSharedMolecularOverlap(record);
}

export function validateSharedMolecularOverlap(
  record: SharedMolecularOverlap,
): SharedMolecularOverlap {
  if (!MOL_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.sharedGeneIsNotSharedCausalMechanism !== true) {
    throw Error("sharedGeneIsNotSharedCausalMechanism must be true");
  }
  if (record.pathwayEnrichmentIsNotActivation !== true) {
    throw Error("pathwayEnrichmentIsNotActivation must be true");
  }
  if (record.autoTransferAcrossDiseases !== false) {
    throw Error("autoTransferAcrossDiseases must be false");
  }
  if (record.causalMechanismProven !== false) {
    throw Error("causalMechanismProven must be false");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftCellTissueContextComparison(input: {
  id: string;
  comparison: DiseaseComparisonDefinition;
  diseaseContextIdA: string;
  diseaseContextIdB: string;
  contextSummary: string;
  contextA: CdmiExperimentalContext;
  contextB: CdmiExperimentalContext;
  contextsComparable: boolean;
  contextDependent?: boolean;
  authoredByPrincipalId: string;
  authoredByActorKind?: CdmiActorKind;
  createdAt: string;
  note?: string;
  autoTransferAcrossDiseases?: boolean;
}): CellTissueContextComparison {
  if (!CTX_ID_RE.test(input.id)) {
    throw Error("Invalid cell/tissue context comparison id");
  }
  validateDiseaseComparisonDefinition(input.comparison);
  if (
    !input.comparison.diseaseContextIds.includes(input.diseaseContextIdA) ||
    !input.comparison.diseaseContextIds.includes(input.diseaseContextIdB)
  ) {
    throw Error("Context disease ids must belong to comparison");
  }
  if (!textOk(input.contextSummary, 1000)) {
    throw Error("Invalid contextSummary");
  }
  refuseAutoTransfer(input.autoTransferAcrossDiseases);
  assertNoForbiddenClaimLanguage(input.contextSummary, "contextSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const contextA = assertExperimentalContext(input.contextA, "contextA");
  const contextB = assertExperimentalContext(input.contextB, "contextB");
  const inferredContextDependent =
    contextA.tissue !== contextB.tissue ||
    contextA.cellState !== contextB.cellState ||
    contextA.diseaseStage !== contextB.diseaseStage ||
    contextA.species !== contextB.species ||
    contextA.experimentalContext !== contextB.experimentalContext;
  const contextDependent =
    input.contextDependent ?? inferredContextDependent;

  if (!input.contextsComparable && !contextDependent) {
    throw Error(
      "Non-comparable contexts must be marked contextDependent to preserve differences",
    );
  }

  const record: CellTissueContextComparison = {
    schema: CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
    method: CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
    version: CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
    id: input.id,
    comparisonDefinitionId: input.comparison.id,
    investigationId: input.comparison.investigationId,
    diseaseContextIdA: input.diseaseContextIdA,
    diseaseContextIdB: input.diseaseContextIdB,
    contextSummary: input.contextSummary.trim(),
    contextA,
    contextB,
    contextsComparable: input.contextsComparable,
    contextDependent,
    autoTransferAcrossDiseases: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForDataset(input.comparison.datasetAvailability),
    fixtureHonesty: input.comparison.datasetAvailability === "fixture_only",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (
      input.note ??
      "Cell/tissue context comparison — contexts preserved, not collapsed"
    ).trim(),
  };
  return validateCellTissueContextComparison(record);
}

export function validateCellTissueContextComparison(
  record: CellTissueContextComparison,
): CellTissueContextComparison {
  if (!CTX_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.autoTransferAcrossDiseases !== false) {
    throw Error("autoTransferAcrossDiseases must be false");
  }
  assertExperimentalContext(record.contextA, "contextA");
  assertExperimentalContext(record.contextB, "contextB");
  assertHonesty(record.honesty);
  return record;
}

export function draftSupportingEvidenceRetrieval(input: {
  id: string;
  comparison: DiseaseComparisonDefinition;
  relatedOverlapOrMechanismId: string;
  evidenceSummary: string;
  evidenceRef: string;
  experimentalContext: CdmiExperimentalContext;
  authoredByPrincipalId: string;
  authoredByActorKind?: CdmiActorKind;
  createdAt: string;
  note?: string;
}): SupportingEvidenceRetrieval {
  if (!SUP_ID_RE.test(input.id)) {
    throw Error("Invalid supporting evidence retrieval id");
  }
  validateDiseaseComparisonDefinition(input.comparison);
  if (
    !MOL_ID_RE.test(input.relatedOverlapOrMechanismId) &&
    !MECH_ID_RE.test(input.relatedOverlapOrMechanismId)
  ) {
    throw Error("relatedOverlapOrMechanismId must be mol or mech id");
  }
  if (!textOk(input.evidenceSummary, 1000)) {
    throw Error("Invalid evidenceSummary");
  }
  if (!REF_ID_RE.test(input.evidenceRef)) throw Error("Invalid evidenceRef");
  assertNoForbiddenClaimLanguage(input.evidenceSummary, "evidenceSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: SupportingEvidenceRetrieval = {
    schema: CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
    method: CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
    version: CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
    id: input.id,
    comparisonDefinitionId: input.comparison.id,
    investigationId: input.comparison.investigationId,
    relatedOverlapOrMechanismId: input.relatedOverlapOrMechanismId,
    evidenceSummary: input.evidenceSummary.trim(),
    polarity: "supports",
    evidenceRef: input.evidenceRef,
    experimentalContext: assertExperimentalContext(
      input.experimentalContext,
      "experimentalContext",
    ),
    inventedStatistics: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForDataset(input.comparison.datasetAvailability),
    fixtureHonesty: input.comparison.datasetAvailability === "fixture_only",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "Supporting evidence retrieval").trim(),
  };
  return validateSupportingEvidenceRetrieval(record);
}

export function validateSupportingEvidenceRetrieval(
  record: SupportingEvidenceRetrieval,
): SupportingEvidenceRetrieval {
  if (!SUP_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.polarity !== "supports") throw Error("polarity must be supports");
  if (record.inventedStatistics !== null) {
    throw Error("inventedStatistics must be null");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftOpposingEvidenceRetrieval(input: {
  id: string;
  comparison: DiseaseComparisonDefinition;
  relatedOverlapOrMechanismId: string;
  evidenceSummary: string;
  evidenceRef: string;
  experimentalContext: CdmiExperimentalContext;
  authoredByPrincipalId: string;
  authoredByActorKind?: CdmiActorKind;
  createdAt: string;
  note?: string;
}): OpposingEvidenceRetrieval {
  if (!OPP_ID_RE.test(input.id)) {
    throw Error("Invalid opposing evidence retrieval id");
  }
  validateDiseaseComparisonDefinition(input.comparison);
  if (
    !MOL_ID_RE.test(input.relatedOverlapOrMechanismId) &&
    !MECH_ID_RE.test(input.relatedOverlapOrMechanismId)
  ) {
    throw Error("relatedOverlapOrMechanismId must be mol or mech id");
  }
  if (!textOk(input.evidenceSummary, 1000)) {
    throw Error("Invalid evidenceSummary");
  }
  if (!REF_ID_RE.test(input.evidenceRef)) throw Error("Invalid evidenceRef");
  assertNoForbiddenClaimLanguage(input.evidenceSummary, "evidenceSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: OpposingEvidenceRetrieval = {
    schema: CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
    method: CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
    version: CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
    id: input.id,
    comparisonDefinitionId: input.comparison.id,
    investigationId: input.comparison.investigationId,
    relatedOverlapOrMechanismId: input.relatedOverlapOrMechanismId,
    evidenceSummary: input.evidenceSummary.trim(),
    polarity: "opposes",
    evidenceRef: input.evidenceRef,
    experimentalContext: assertExperimentalContext(
      input.experimentalContext,
      "experimentalContext",
    ),
    inventedStatistics: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForDataset(input.comparison.datasetAvailability),
    fixtureHonesty: input.comparison.datasetAvailability === "fixture_only",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "Opposing evidence retrieval").trim(),
  };
  return validateOpposingEvidenceRetrieval(record);
}

export function validateOpposingEvidenceRetrieval(
  record: OpposingEvidenceRetrieval,
): OpposingEvidenceRetrieval {
  if (!OPP_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.polarity !== "opposes") throw Error("polarity must be opposes");
  if (record.inventedStatistics !== null) {
    throw Error("inventedStatistics must be null");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftDirectionalityEvaluation(input: {
  id: string;
  comparison: DiseaseComparisonDefinition;
  directionalityOrdinal: CdmiDirectionalityOrdinal;
  evaluationSummary: string;
  supportingEvidence: readonly SupportingEvidenceRetrieval[];
  opposingEvidence: readonly OpposingEvidenceRetrieval[];
  authoredByPrincipalId: string;
  authoredByActorKind?: CdmiActorKind;
  createdAt: string;
  note?: string;
  claimCausalMechanismProven?: boolean;
  autoTransferAcrossDiseases?: boolean;
}): DirectionalityEvaluation {
  if (!DIR_ID_RE.test(input.id)) {
    throw Error("Invalid directionality evaluation id");
  }
  validateDiseaseComparisonDefinition(input.comparison);
  assertClosed(
    input.directionalityOrdinal,
    CDMI_DIRECTIONALITY_ORDINALS,
    "directionalityOrdinal",
  );
  if (!textOk(input.evaluationSummary, 1000)) {
    throw Error("Invalid evaluationSummary");
  }
  refuseAutoTransfer(input.autoTransferAcrossDiseases);
  if (input.claimCausalMechanismProven === true) {
    throw Error("Fail-closed: causal mechanism proven claims forbidden");
  }
  assertNoForbiddenClaimLanguage(input.evaluationSummary, "evaluationSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  for (const s of input.supportingEvidence) {
    validateSupportingEvidenceRetrieval(s);
    if (s.comparisonDefinitionId !== input.comparison.id) {
      throw Error("Supporting evidence must match comparison");
    }
  }
  for (const o of input.opposingEvidence) {
    validateOpposingEvidenceRetrieval(o);
    if (o.comparisonDefinitionId !== input.comparison.id) {
      throw Error("Opposing evidence must match comparison");
    }
  }

  const record: DirectionalityEvaluation = {
    schema: CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
    method: CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
    version: CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
    id: input.id,
    comparisonDefinitionId: input.comparison.id,
    investigationId: input.comparison.investigationId,
    directionalityOrdinal: input.directionalityOrdinal,
    evaluationSummary: input.evaluationSummary.trim(),
    supportingEvidenceIds: input.supportingEvidence.map((s) => s.id),
    opposingEvidenceIds: input.opposingEvidence.map((o) => o.id),
    causalMechanismProven: false,
    autoTransferAcrossDiseases: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForDataset(input.comparison.datasetAvailability),
    fixtureHonesty: input.comparison.datasetAvailability === "fixture_only",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "Directionality evaluation").trim(),
  };
  return validateDirectionalityEvaluation(record);
}

export function validateDirectionalityEvaluation(
  record: DirectionalityEvaluation,
): DirectionalityEvaluation {
  if (!DIR_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.causalMechanismProven !== false) {
    throw Error("causalMechanismProven must be false");
  }
  if (record.autoTransferAcrossDiseases !== false) {
    throw Error("autoTransferAcrossDiseases must be false");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftDiseaseSpecificDifferenceIdentification(input: {
  id: string;
  comparison: DiseaseComparisonDefinition;
  diseaseContextId: string;
  differenceSummary: string;
  mechanismClassification: "disease_specific" | "context_dependent";
  experimentalContext: CdmiExperimentalContext;
  authoredByPrincipalId: string;
  authoredByActorKind?: CdmiActorKind;
  createdAt: string;
  note?: string;
  autoTransferAcrossDiseases?: boolean;
}): DiseaseSpecificDifferenceIdentification {
  if (!DIFF_ID_RE.test(input.id)) {
    throw Error("Invalid disease-specific difference id");
  }
  validateDiseaseComparisonDefinition(input.comparison);
  if (!input.comparison.diseaseContextIds.includes(input.diseaseContextId)) {
    throw Error("diseaseContextId must belong to comparison");
  }
  if (
    input.mechanismClassification !== "disease_specific" &&
    input.mechanismClassification !== "context_dependent"
  ) {
    throw Error(
      "Disease-specific differences must use disease_specific or context_dependent classification",
    );
  }
  if (!textOk(input.differenceSummary, 1000)) {
    throw Error("Invalid differenceSummary");
  }
  refuseAutoTransfer(input.autoTransferAcrossDiseases);
  assertNoForbiddenClaimLanguage(input.differenceSummary, "differenceSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: DiseaseSpecificDifferenceIdentification = {
    schema: CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
    method: CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
    version: CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
    id: input.id,
    comparisonDefinitionId: input.comparison.id,
    investigationId: input.comparison.investigationId,
    diseaseContextId: input.diseaseContextId,
    differenceSummary: input.differenceSummary.trim(),
    mechanismClassification: input.mechanismClassification,
    autoTransferAcrossDiseases: false,
    experimentalContext: assertExperimentalContext(
      input.experimentalContext,
      "experimentalContext",
    ),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForDataset(input.comparison.datasetAvailability),
    fixtureHonesty: input.comparison.datasetAvailability === "fixture_only",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (
      input.note ??
      "Disease-specific difference — not auto-transferred across diseases"
    ).trim(),
  };
  return validateDiseaseSpecificDifferenceIdentification(record);
}

export function validateDiseaseSpecificDifferenceIdentification(
  record: DiseaseSpecificDifferenceIdentification,
): DiseaseSpecificDifferenceIdentification {
  if (!DIFF_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.autoTransferAcrossDiseases !== false) {
    throw Error("autoTransferAcrossDiseases must be false");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftComparativeMechanismProfile(input: {
  id: string;
  displayName: string;
  comparison: DiseaseComparisonDefinition;
  identifierResolutions: readonly DiseaseIdentifierResolution[];
  approvedMechanisms: readonly ApprovedMechanismRetrieval[];
  sharedOverlaps: readonly SharedMolecularOverlap[];
  contextComparisons: readonly CellTissueContextComparison[];
  supportingEvidence: readonly SupportingEvidenceRetrieval[];
  opposingEvidence: readonly OpposingEvidenceRetrieval[];
  directionalityEvaluations: readonly DirectionalityEvaluation[];
  diseaseSpecificDifferences: readonly DiseaseSpecificDifferenceIdentification[];
  primaryMechanismClassification: CdmiMechanismClassification;
  profileVersion: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: CdmiActorKind;
  createdAt: string;
  note?: string;
  claimSharedCausalMechanism?: boolean;
  claimPathwayActivation?: boolean;
  autoTransferAcrossDiseases?: boolean;
}): ComparativeMechanismProfile {
  if (!CMP_ID_RE.test(input.id)) {
    throw Error("Invalid comparative mechanism profile id");
  }
  validateDiseaseComparisonDefinition(input.comparison);
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  if (!textOk(input.profileVersion, 40)) throw Error("Invalid profileVersion");
  assertClosed(
    input.primaryMechanismClassification,
    CDMI_MECHANISM_CLASSIFICATIONS,
    "primaryMechanismClassification",
  );
  refuseAutoTransfer(input.autoTransferAcrossDiseases);
  refuseSharedGeneAsCausal({
    mechanismClassification: input.primaryMechanismClassification,
    claimSharedCausalMechanism: input.claimSharedCausalMechanism,
  });
  refusePathwayEnrichmentAsActivation({
    mechanismClassification: input.primaryMechanismClassification,
    claimPathwayActivation: input.claimPathwayActivation,
  });
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  for (const r of input.identifierResolutions) {
    validateDiseaseIdentifierResolution(r);
    if (r.comparisonDefinitionId !== input.comparison.id) {
      throw Error("Identifier resolution must match comparison");
    }
  }
  for (const m of input.approvedMechanisms) {
    validateApprovedMechanismRetrieval(m);
    if (m.comparisonDefinitionId !== input.comparison.id) {
      throw Error("Mechanism retrieval must match comparison");
    }
  }
  for (const o of input.sharedOverlaps) {
    validateSharedMolecularOverlap(o);
    if (o.comparisonDefinitionId !== input.comparison.id) {
      throw Error("Overlap must match comparison");
    }
  }
  for (const c of input.contextComparisons) {
    validateCellTissueContextComparison(c);
    if (c.comparisonDefinitionId !== input.comparison.id) {
      throw Error("Context comparison must match comparison");
    }
  }
  for (const s of input.supportingEvidence) {
    validateSupportingEvidenceRetrieval(s);
  }
  for (const o of input.opposingEvidence) {
    validateOpposingEvidenceRetrieval(o);
  }
  for (const d of input.directionalityEvaluations) {
    validateDirectionalityEvaluation(d);
  }
  for (const d of input.diseaseSpecificDifferences) {
    validateDiseaseSpecificDifferenceIdentification(d);
  }

  const blocked =
    input.comparison.datasetAvailability ===
    "blocked_no_authorised_clinical_dataset";
  const lifecycle: CdmiProfileLifecycle = blocked
    ? "blocked_awaiting_authorised_dataset"
    : "draft";

  const record: ComparativeMechanismProfile = {
    schema: CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
    method: CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
    version: CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    comparisonDefinitionId: input.comparison.id,
    investigationId: input.comparison.investigationId,
    diseaseContextIds: input.comparison.diseaseContextIds,
    identifierResolutionIds: input.identifierResolutions.map((r) => r.id),
    approvedMechanismRetrievalIds: input.approvedMechanisms.map((m) => m.id),
    sharedMolecularOverlapIds: input.sharedOverlaps.map((o) => o.id),
    cellTissueContextComparisonIds: input.contextComparisons.map((c) => c.id),
    supportingEvidenceIds: input.supportingEvidence.map((s) => s.id),
    opposingEvidenceIds: input.opposingEvidence.map((o) => o.id),
    directionalityEvaluationIds: input.directionalityEvaluations.map(
      (d) => d.id,
    ),
    diseaseSpecificDifferenceIds: input.diseaseSpecificDifferences.map(
      (d) => d.id,
    ),
    primaryMechanismClassification: input.primaryMechanismClassification,
    profileVersion: input.profileVersion.trim(),
    lifecycle,
    reviewedBy: null,
    sharedGeneIsNotSharedCausalMechanism: true,
    pathwayEnrichmentIsNotActivation: true,
    autoTransferAcrossDiseases: false,
    causalMechanismProven: false,
    graphPromotable: false,
    containsIdentifiablePhi: false,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForDataset(input.comparison.datasetAvailability),
    fixtureHonesty: input.comparison.datasetAvailability === "fixture_only",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (
      input.note ??
      "Reviewable comparative mechanism profile — research intelligence only"
    ).trim(),
  };
  return validateComparativeMechanismProfile(record);
}

export function validateComparativeMechanismProfile(
  record: ComparativeMechanismProfile,
): ComparativeMechanismProfile {
  if (!CMP_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!DEF_ID_RE.test(record.comparisonDefinitionId)) {
    throw Error("Invalid comparisonDefinitionId");
  }
  if (!INV_ID_RE.test(record.investigationId)) {
    throw Error("Invalid investigationId");
  }
  if (record.diseaseContextIds.length < 2) {
    throw Error("At least 2 diseaseContextIds required");
  }
  assertClosed(record.lifecycle, CDMI_PROFILE_LIFECYCLES, "lifecycle");
  assertClosed(
    record.primaryMechanismClassification,
    CDMI_MECHANISM_CLASSIFICATIONS,
    "primaryMechanismClassification",
  );
  if (record.sharedGeneIsNotSharedCausalMechanism !== true) {
    throw Error("sharedGeneIsNotSharedCausalMechanism must be true");
  }
  if (record.pathwayEnrichmentIsNotActivation !== true) {
    throw Error("pathwayEnrichmentIsNotActivation must be true");
  }
  if (record.autoTransferAcrossDiseases !== false) {
    throw Error("autoTransferAcrossDiseases must be false");
  }
  if (record.causalMechanismProven !== false) {
    throw Error("causalMechanismProven must be false");
  }
  if (record.graphPromotable !== false) {
    throw Error("graphPromotable must be false");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("PHI forbidden");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  return record;
}

export function transitionComparativeMechanismProfile(input: {
  profile: ComparativeMechanismProfile;
  to: CdmiProfileLifecycle;
  updatedAt: string;
  actor: CdmiActor;
}): ComparativeMechanismProfile {
  const current = validateComparativeMechanismProfile(input.profile);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "actor");
  const allowed = PROFILE_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Invalid comparative mechanism profile transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    (actor.actorKind !== "human" ||
      current.lifecycle === "blocked_awaiting_authorised_dataset")
  ) {
    throw Error(
      "accepted_with_limitations requires human reviewer and non-blocked lifecycle",
    );
  }
  return validateComparativeMechanismProfile({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "under_review"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryCrossDiseaseMechanismIntelligenceStore(): CrossDiseaseMechanismIntelligenceStore & {
  comparisonDefinitions: Map<string, DiseaseComparisonDefinition>;
  identifierResolutions: Map<string, DiseaseIdentifierResolution>;
  approvedMechanismRetrievals: Map<string, ApprovedMechanismRetrieval>;
  sharedMolecularOverlaps: Map<string, SharedMolecularOverlap>;
  cellTissueContextComparisons: Map<string, CellTissueContextComparison>;
  supportingEvidenceRetrievals: Map<string, SupportingEvidenceRetrieval>;
  opposingEvidenceRetrievals: Map<string, OpposingEvidenceRetrieval>;
  directionalityEvaluations: Map<string, DirectionalityEvaluation>;
  diseaseSpecificDifferences: Map<
    string,
    DiseaseSpecificDifferenceIdentification
  >;
  comparativeMechanismProfiles: Map<string, ComparativeMechanismProfile>;
} {
  const comparisonDefinitions = new Map<string, DiseaseComparisonDefinition>();
  const identifierResolutions = new Map<string, DiseaseIdentifierResolution>();
  const approvedMechanismRetrievals = new Map<
    string,
    ApprovedMechanismRetrieval
  >();
  const sharedMolecularOverlaps = new Map<string, SharedMolecularOverlap>();
  const cellTissueContextComparisons = new Map<
    string,
    CellTissueContextComparison
  >();
  const supportingEvidenceRetrievals = new Map<
    string,
    SupportingEvidenceRetrieval
  >();
  const opposingEvidenceRetrievals = new Map<
    string,
    OpposingEvidenceRetrieval
  >();
  const directionalityEvaluations = new Map<string, DirectionalityEvaluation>();
  const diseaseSpecificDifferences = new Map<
    string,
    DiseaseSpecificDifferenceIdentification
  >();
  const comparativeMechanismProfiles = new Map<
    string,
    ComparativeMechanismProfile
  >();

  const filterByComparison = <T extends {comparisonDefinitionId: string}>(
    map: Map<string, T>,
    comparisonDefinitionId?: string,
  ): readonly T[] => {
    const all = [...map.values()];
    return comparisonDefinitionId
      ? all.filter((r) => r.comparisonDefinitionId === comparisonDefinitionId)
      : all;
  };

  return {
    comparisonDefinitions,
    identifierResolutions,
    approvedMechanismRetrievals,
    sharedMolecularOverlaps,
    cellTissueContextComparisons,
    supportingEvidenceRetrievals,
    opposingEvidenceRetrievals,
    directionalityEvaluations,
    diseaseSpecificDifferences,
    comparativeMechanismProfiles,
    upsertComparisonDefinition(record) {
      const validated = validateDiseaseComparisonDefinition(record);
      comparisonDefinitions.set(validated.id, validated);
      return validated;
    },
    getComparisonDefinition(id) {
      return comparisonDefinitions.get(id) ?? null;
    },
    listComparisonDefinitions() {
      return [...comparisonDefinitions.values()];
    },
    upsertIdentifierResolution(record) {
      const validated = validateDiseaseIdentifierResolution(record);
      identifierResolutions.set(validated.id, validated);
      return validated;
    },
    getIdentifierResolution(id) {
      return identifierResolutions.get(id) ?? null;
    },
    listIdentifierResolutions(comparisonDefinitionId) {
      return filterByComparison(identifierResolutions, comparisonDefinitionId);
    },
    upsertApprovedMechanismRetrieval(record) {
      const validated = validateApprovedMechanismRetrieval(record);
      approvedMechanismRetrievals.set(validated.id, validated);
      return validated;
    },
    getApprovedMechanismRetrieval(id) {
      return approvedMechanismRetrievals.get(id) ?? null;
    },
    listApprovedMechanismRetrievals(comparisonDefinitionId) {
      return filterByComparison(
        approvedMechanismRetrievals,
        comparisonDefinitionId,
      );
    },
    upsertSharedMolecularOverlap(record) {
      const validated = validateSharedMolecularOverlap(record);
      sharedMolecularOverlaps.set(validated.id, validated);
      return validated;
    },
    getSharedMolecularOverlap(id) {
      return sharedMolecularOverlaps.get(id) ?? null;
    },
    listSharedMolecularOverlaps(comparisonDefinitionId) {
      return filterByComparison(sharedMolecularOverlaps, comparisonDefinitionId);
    },
    upsertCellTissueContextComparison(record) {
      const validated = validateCellTissueContextComparison(record);
      cellTissueContextComparisons.set(validated.id, validated);
      return validated;
    },
    getCellTissueContextComparison(id) {
      return cellTissueContextComparisons.get(id) ?? null;
    },
    listCellTissueContextComparisons(comparisonDefinitionId) {
      return filterByComparison(
        cellTissueContextComparisons,
        comparisonDefinitionId,
      );
    },
    upsertSupportingEvidence(record) {
      const validated = validateSupportingEvidenceRetrieval(record);
      supportingEvidenceRetrievals.set(validated.id, validated);
      return validated;
    },
    getSupportingEvidence(id) {
      return supportingEvidenceRetrievals.get(id) ?? null;
    },
    listSupportingEvidence(comparisonDefinitionId) {
      return filterByComparison(
        supportingEvidenceRetrievals,
        comparisonDefinitionId,
      );
    },
    upsertOpposingEvidence(record) {
      const validated = validateOpposingEvidenceRetrieval(record);
      opposingEvidenceRetrievals.set(validated.id, validated);
      return validated;
    },
    getOpposingEvidence(id) {
      return opposingEvidenceRetrievals.get(id) ?? null;
    },
    listOpposingEvidence(comparisonDefinitionId) {
      return filterByComparison(
        opposingEvidenceRetrievals,
        comparisonDefinitionId,
      );
    },
    upsertDirectionalityEvaluation(record) {
      const validated = validateDirectionalityEvaluation(record);
      directionalityEvaluations.set(validated.id, validated);
      return validated;
    },
    getDirectionalityEvaluation(id) {
      return directionalityEvaluations.get(id) ?? null;
    },
    listDirectionalityEvaluations(comparisonDefinitionId) {
      return filterByComparison(
        directionalityEvaluations,
        comparisonDefinitionId,
      );
    },
    upsertDiseaseSpecificDifference(record) {
      const validated = validateDiseaseSpecificDifferenceIdentification(record);
      diseaseSpecificDifferences.set(validated.id, validated);
      return validated;
    },
    getDiseaseSpecificDifference(id) {
      return diseaseSpecificDifferences.get(id) ?? null;
    },
    listDiseaseSpecificDifferences(comparisonDefinitionId) {
      return filterByComparison(
        diseaseSpecificDifferences,
        comparisonDefinitionId,
      );
    },
    upsertComparativeMechanismProfile(record) {
      const validated = validateComparativeMechanismProfile(record);
      comparativeMechanismProfiles.set(validated.id, validated);
      return validated;
    },
    getComparativeMechanismProfile(id) {
      return comparativeMechanismProfiles.get(id) ?? null;
    },
    listComparativeMechanismProfiles(comparisonDefinitionId) {
      return filterByComparison(
        comparativeMechanismProfiles,
        comparisonDefinitionId,
      );
    },
  };
}

export function projectCrossDiseaseMechanismIntelligencePersistenceLines(input: {
  comparisonDefinitions: readonly DiseaseComparisonDefinition[];
  identifierResolutions?: readonly DiseaseIdentifierResolution[];
  approvedMechanismRetrievals?: readonly ApprovedMechanismRetrieval[];
  sharedMolecularOverlaps?: readonly SharedMolecularOverlap[];
  cellTissueContextComparisons?: readonly CellTissueContextComparison[];
  supportingEvidenceRetrievals?: readonly SupportingEvidenceRetrieval[];
  opposingEvidenceRetrievals?: readonly OpposingEvidenceRetrieval[];
  directionalityEvaluations?: readonly DirectionalityEvaluation[];
  diseaseSpecificDifferences?: readonly DiseaseSpecificDifferenceIdentification[];
  comparativeMechanismProfiles?: readonly ComparativeMechanismProfile[];
}): string[] {
  for (const r of input.comparisonDefinitions) {
    validateDiseaseComparisonDefinition(r);
  }
  for (const r of input.identifierResolutions ?? []) {
    validateDiseaseIdentifierResolution(r);
  }
  for (const r of input.approvedMechanismRetrievals ?? []) {
    validateApprovedMechanismRetrieval(r);
  }
  for (const r of input.sharedMolecularOverlaps ?? []) {
    validateSharedMolecularOverlap(r);
  }
  for (const r of input.cellTissueContextComparisons ?? []) {
    validateCellTissueContextComparison(r);
  }
  for (const r of input.supportingEvidenceRetrievals ?? []) {
    validateSupportingEvidenceRetrieval(r);
  }
  for (const r of input.opposingEvidenceRetrievals ?? []) {
    validateOpposingEvidenceRetrieval(r);
  }
  for (const r of input.directionalityEvaluations ?? []) {
    validateDirectionalityEvaluation(r);
  }
  for (const r of input.diseaseSpecificDifferences ?? []) {
    validateDiseaseSpecificDifferenceIdentification(r);
  }
  for (const r of input.comparativeMechanismProfiles ?? []) {
    validateComparativeMechanismProfile(r);
  }

  return [
    `schema=${CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA}`,
    `method=${CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD}`,
    `version=${CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION}`,
    `comparisonDefinitions=${input.comparisonDefinitions.length}`,
    `identifierResolutions=${(input.identifierResolutions ?? []).length}`,
    `approvedMechanismRetrievals=${(input.approvedMechanismRetrievals ?? []).length}`,
    `sharedMolecularOverlaps=${(input.sharedMolecularOverlaps ?? []).length}`,
    `cellTissueContextComparisons=${(input.cellTissueContextComparisons ?? []).length}`,
    `supportingEvidenceRetrievals=${(input.supportingEvidenceRetrievals ?? []).length}`,
    `opposingEvidenceRetrievals=${(input.opposingEvidenceRetrievals ?? []).length}`,
    `directionalityEvaluations=${(input.directionalityEvaluations ?? []).length}`,
    `diseaseSpecificDifferences=${(input.diseaseSpecificDifferences ?? []).length}`,
    `comparativeMechanismProfiles=${(input.comparativeMechanismProfiles ?? []).length}`,
    `sharedGeneIsNotSharedCausalMechanism=true`,
    `pathwayEnrichmentIsNotActivation=true`,
    `noAutoTransferAcrossDiseases=true`,
    `experimentalContextMustBePreserved=true`,
    `noPhiIngestion=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintComparativeMechanismProfile(
  profile: ComparativeMechanismProfile,
): string {
  const validated = validateComparativeMechanismProfile(profile);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildCrossDiseaseMechanismIntelligencePack(input: {
  comparisonDefinitions: readonly DiseaseComparisonDefinition[];
  identifierResolutions: readonly DiseaseIdentifierResolution[];
  approvedMechanismRetrievals: readonly ApprovedMechanismRetrieval[];
  sharedMolecularOverlaps: readonly SharedMolecularOverlap[];
  cellTissueContextComparisons: readonly CellTissueContextComparison[];
  supportingEvidenceRetrievals: readonly SupportingEvidenceRetrieval[];
  opposingEvidenceRetrievals: readonly OpposingEvidenceRetrieval[];
  directionalityEvaluations: readonly DirectionalityEvaluation[];
  diseaseSpecificDifferences: readonly DiseaseSpecificDifferenceIdentification[];
  comparativeMechanismProfiles: readonly ComparativeMechanismProfile[];
  asOf: string;
}): {
  schema: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA;
  method: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD;
  version: typeof CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION;
  asOf: string;
  comparisonDefinitionCount: number;
  identifierResolutionCount: number;
  approvedMechanismRetrievalCount: number;
  sharedMolecularOverlapCount: number;
  cellTissueContextComparisonCount: number;
  supportingEvidenceRetrievalCount: number;
  opposingEvidenceRetrievalCount: number;
  directionalityEvaluationCount: number;
  diseaseSpecificDifferenceCount: number;
  comparativeMechanismProfileCount: number;
  mechanismClassificationCount: number;
  honesty: CrossDiseaseMechanismIntelligenceHonesty;
  comparisonDefinitions: readonly DiseaseComparisonDefinition[];
  identifierResolutions: readonly DiseaseIdentifierResolution[];
  approvedMechanismRetrievals: readonly ApprovedMechanismRetrieval[];
  sharedMolecularOverlaps: readonly SharedMolecularOverlap[];
  cellTissueContextComparisons: readonly CellTissueContextComparison[];
  supportingEvidenceRetrievals: readonly SupportingEvidenceRetrieval[];
  opposingEvidenceRetrievals: readonly OpposingEvidenceRetrieval[];
  directionalityEvaluations: readonly DirectionalityEvaluation[];
  diseaseSpecificDifferences: readonly DiseaseSpecificDifferenceIdentification[];
  comparativeMechanismProfiles: readonly ComparativeMechanismProfile[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const comparisonDefinitions = input.comparisonDefinitions.map(
    validateDiseaseComparisonDefinition,
  );
  const identifierResolutions = input.identifierResolutions.map(
    validateDiseaseIdentifierResolution,
  );
  const approvedMechanismRetrievals = input.approvedMechanismRetrievals.map(
    validateApprovedMechanismRetrieval,
  );
  const sharedMolecularOverlaps = input.sharedMolecularOverlaps.map(
    validateSharedMolecularOverlap,
  );
  const cellTissueContextComparisons = input.cellTissueContextComparisons.map(
    validateCellTissueContextComparison,
  );
  const supportingEvidenceRetrievals = input.supportingEvidenceRetrievals.map(
    validateSupportingEvidenceRetrieval,
  );
  const opposingEvidenceRetrievals = input.opposingEvidenceRetrievals.map(
    validateOpposingEvidenceRetrieval,
  );
  const directionalityEvaluations = input.directionalityEvaluations.map(
    validateDirectionalityEvaluation,
  );
  const diseaseSpecificDifferences = input.diseaseSpecificDifferences.map(
    validateDiseaseSpecificDifferenceIdentification,
  );
  const comparativeMechanismProfiles = input.comparativeMechanismProfiles.map(
    validateComparativeMechanismProfile,
  );

  return {
    schema: CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
    method: CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
    version: CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
    asOf: input.asOf,
    comparisonDefinitionCount: comparisonDefinitions.length,
    identifierResolutionCount: identifierResolutions.length,
    approvedMechanismRetrievalCount: approvedMechanismRetrievals.length,
    sharedMolecularOverlapCount: sharedMolecularOverlaps.length,
    cellTissueContextComparisonCount: cellTissueContextComparisons.length,
    supportingEvidenceRetrievalCount: supportingEvidenceRetrievals.length,
    opposingEvidenceRetrievalCount: opposingEvidenceRetrievals.length,
    directionalityEvaluationCount: directionalityEvaluations.length,
    diseaseSpecificDifferenceCount: diseaseSpecificDifferences.length,
    comparativeMechanismProfileCount: comparativeMechanismProfiles.length,
    mechanismClassificationCount: CDMI_MECHANISM_CLASSIFICATIONS.length,
    honesty: {...DEFAULT_HONESTY},
    comparisonDefinitions,
    identifierResolutions,
    approvedMechanismRetrievals,
    sharedMolecularOverlaps,
    cellTissueContextComparisons,
    supportingEvidenceRetrievals,
    opposingEvidenceRetrievals,
    directionalityEvaluations,
    diseaseSpecificDifferences,
    comparativeMechanismProfiles,
  };
}
