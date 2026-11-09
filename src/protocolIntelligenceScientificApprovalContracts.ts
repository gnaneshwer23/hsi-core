/**
 * Milestone 10 / PR3 — Protocol Intelligence and Scientific Approval.
 *
 * Deepens PR1 versioned protocol + PR2 approved experiment specifications into
 * protocol drafts with method/control docs, required metadata, statistical
 * analysis plans (no unjustified power/n), QC, safety/ethics governance
 * records, versioning, reviewer comments, approval/rejection, and change
 * control. Does NOT execute pipelines, wire lab adapters, invent results,
 * ship workbench UI, run Neon migrations, invent MoU/Gate C auto-approve,
 * auto-issue instrument instructions, or allow AI self-approval.
 *
 * Binding honesty:
 * - Protocols approved only by authorised human researchers.
 * - An AI agent must NOT approve its own experimental proposal / protocol.
 * - Do NOT automatically issue executable instrument instructions.
 * - Record external governance refs; do not invent MoU or Gate C auto-approve.
 * - SAP must not invent unjustified power / sample-size claims.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 * - Depends on PR1 (#101) + PR2 (#102) — stack or merge first.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const PROTOCOL_INTELLIGENCE_SCHEMA =
  "hsi-protocol-intelligence-scientific-approval-1" as const;
export const PROTOCOL_INTELLIGENCE_METHOD =
  "hsi.protocol_intelligence_scientific_approval.v1" as const;
export const PROTOCOL_INTELLIGENCE_VERSION = "0.1.0" as const;

/** Closed scientific-approval lifecycle for protocol drafts. */
export const PROTOCOL_DRAFT_LIFECYCLES = [
  "draft",
  "submitted_for_scientific_review",
  "changes_requested",
  "researcher_approved",
  "researcher_rejected",
  "superseded",
  "withdrawn",
] as const;
export type ProtocolDraftLifecycle = (typeof PROTOCOL_DRAFT_LIFECYCLES)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type ProtocolActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type ProtocolDataBasis = (typeof DATA_BASES)[number];

/**
 * How the statistical analysis plan is justified.
 * Never invent unjustified power / n claims.
 */
export const SAP_JUSTIFICATION_KINDS = [
  "not_applicable_exploratory",
  "qualitative_only",
  "declared_external_plan",
  "sample_size_deferred",
] as const;
export type SapJustificationKind = (typeof SAP_JUSTIFICATION_KINDS)[number];

/** External governance records — refs only; never invent MoU. */
export const EXTERNAL_GOVERNANCE_KINDS = [
  "none_declared",
  "ethics_committee_ref",
  "safety_review_ref",
  "partner_agreement_ref",
  "institutional_biosafety_ref",
] as const;
export type ExternalGovernanceKind =
  (typeof EXTERNAL_GOVERNANCE_KINDS)[number];

export const REVIEW_COMMENT_SEVERITIES = [
  "info",
  "minor",
  "major",
  "blocking",
] as const;
export type ReviewCommentSeverity =
  (typeof REVIEW_COMMENT_SEVERITIES)[number];

export const CHANGE_CONTROL_KINDS = [
  "created",
  "content_revised",
  "submitted_for_review",
  "changes_requested",
  "approved",
  "rejected",
  "superseded",
  "withdrawn",
  "comment_added",
] as const;
export type ChangeControlKind = (typeof CHANGE_CONTROL_KINDS)[number];

const PROTOCOL_DRAFT_ID_RE = /^hsi-exp-pint-[a-z0-9-]{3,80}$/;
const COMMENT_ID_RE = /^hsi-exp-pcom-[a-z0-9-]{3,80}$/;
const CHANGE_ID_RE = /^hsi-exp-pch-[a-z0-9-]{3,80}$/;
const METADATA_KEY_RE = /^[a-z][a-z0-9_]{1,63}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type ProtocolIntelligenceHonesty = {
  agentsProposeResearchersApprove: true;
  aiCannotSelfApproveExperiments: true;
  protocolsApprovedOnlyByAuthorisedResearchers: true;
  noAutomaticInstrumentInstructions: true;
  noUnjustifiedPowerSampleSizeClaims: true;
  fabricatedResults: false;
  pipelinesExecuted: false;
  labAdaptersWired: false;
  workbenchUiShipped: false;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  closedLoopDiscoveryComplete: false;
  scientificApprovalClaimedComplete: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
  dependsOnPr1LifecycleContracts: true;
  dependsOnPr2DesignPrioritisation: true;
};

export type RequiredProtocolMetadataField = {
  key: string;
  label: string;
  required: boolean;
  /** Declared value or null when still missing (honest gap). */
  value: string | null;
  missingReason: string | null;
};

export type StatisticalAnalysisPlan = {
  objectives: readonly string[];
  endpoints: readonly string[];
  analysisMethods: readonly string[];
  justificationKind: SapJustificationKind;
  /** Qualitative plan text — must not invent unjustified power/n. */
  planSummary: string;
  /** Optional external SAP / analysis-plan reference id. */
  externalPlanRef: string | null;
  inventedPowerSampleSizeClaims: false;
};

export type QualityControlRequirement = {
  id: string;
  description: string;
  acceptanceCriterion: string;
};

export type SafetyEthicsGovernanceRecord = {
  kind: ExternalGovernanceKind;
  /** External reference string when kind is not none_declared. */
  externalRef: string | null;
  summary: string;
  /** Always false — MoU must not be invented in this layer. */
  mouInvented: false;
  gateCAutoApprove: false;
};

export type MethodControlDocumentation = {
  methods: readonly string[];
  controls: readonly string[];
  negativeControls: readonly string[];
  measurements: readonly string[];
  proceduralLimitations: readonly string[];
};

export type ProtocolReviewerComment = {
  id: string;
  protocolDraftId: string;
  protocolVersion: number;
  authorPrincipalId: string;
  authorActorKind: ProtocolActorKind;
  severity: ReviewCommentSeverity;
  body: string;
  createdAt: string;
  resolved: boolean;
};

export type ProtocolChangeControlEntry = {
  id: string;
  protocolDraftId: string;
  fromVersion: number | null;
  toVersion: number;
  kind: ChangeControlKind;
  summary: string;
  actorPrincipalId: string;
  actorKind: ProtocolActorKind;
  at: string;
};

export type IntelligentProtocolDraft = {
  schema: typeof PROTOCOL_INTELLIGENCE_SCHEMA;
  method: typeof PROTOCOL_INTELLIGENCE_METHOD;
  version: typeof PROTOCOL_INTELLIGENCE_VERSION;
  id: string;
  title: string;
  objective: string;
  /** Monotonic immutable content version (change-control lineage). */
  protocolVersion: number;
  parentProtocolVersion: number | null;
  lifecycle: ProtocolDraftLifecycle;
  /** Optional bind to PR1 proposal id (approved experiment specification). */
  sourceProposalId: string | null;
  /** Optional bind to PR2 design package / approach. */
  sourceDesignPackageId: string | null;
  sourceApproachId: string | null;
  /** Optional PR1 protocol id when projecting onto lifecycle protocol. */
  linkedPr1ProtocolId: string | null;
  hypothesisId: string | null;
  investigationId: string | null;
  methodControls: MethodControlDocumentation;
  requiredMetadata: readonly RequiredProtocolMetadataField[];
  statisticalAnalysisPlan: StatisticalAnalysisPlan;
  qualityControlRequirements: readonly QualityControlRequirement[];
  safetyEthics: readonly SafetyEthicsGovernanceRecord[];
  /** Never auto-issue executable instrument instructions. */
  executableInstrumentInstructions: null;
  instrumentInstructionsIssued: false;
  draftedBy: {
    principalId: string;
    actorKind: ProtocolActorKind;
  };
  /** Set only by authorised human researcher approval. */
  approvedBy: {
    principalId: string;
    actorKind: "human";
    approvedAt: string;
  } | null;
  rejectedBy: {
    principalId: string;
    actorKind: "human";
    rejectedAt: string;
    reason: string;
  } | null;
  dataBasis: ProtocolDataBasis;
  fixtureHonesty: boolean;
  honesty: ProtocolIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ProtocolIntelligenceStore = {
  upsertProtocolDraft(
    draft: IntelligentProtocolDraft,
  ): IntelligentProtocolDraft;
  getProtocolDraft(id: string): IntelligentProtocolDraft | null;
  listProtocolDrafts(hypothesisId?: string): readonly IntelligentProtocolDraft[];
  upsertReviewerComment(
    comment: ProtocolReviewerComment,
  ): ProtocolReviewerComment;
  getReviewerComment(id: string): ProtocolReviewerComment | null;
  listReviewerComments(
    protocolDraftId?: string,
  ): readonly ProtocolReviewerComment[];
  appendChangeControl(
    entry: ProtocolChangeControlEntry,
  ): ProtocolChangeControlEntry;
  listChangeControl(
    protocolDraftId?: string,
  ): readonly ProtocolChangeControlEntry[];
};

const DEFAULT_HONESTY: ProtocolIntelligenceHonesty = {
  agentsProposeResearchersApprove: true,
  aiCannotSelfApproveExperiments: true,
  protocolsApprovedOnlyByAuthorisedResearchers: true,
  noAutomaticInstrumentInstructions: true,
  noUnjustifiedPowerSampleSizeClaims: true,
  fabricatedResults: false,
  pipelinesExecuted: false,
  labAdaptersWired: false,
  workbenchUiShipped: false,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  closedLoopDiscoveryComplete: false,
  scientificApprovalClaimedComplete: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
  dependsOnPr1LifecycleContracts: true,
  dependsOnPr2DesignPrioritisation: true,
};

const DRAFT_TRANSITIONS: Record<
  ProtocolDraftLifecycle,
  readonly ProtocolDraftLifecycle[]
> = {
  draft: ["submitted_for_scientific_review", "withdrawn"],
  submitted_for_scientific_review: [
    "changes_requested",
    "researcher_approved",
    "researcher_rejected",
    "withdrawn",
  ],
  changes_requested: ["submitted_for_scientific_review", "withdrawn"],
  researcher_approved: ["superseded", "withdrawn"],
  researcher_rejected: ["superseded", "withdrawn"],
  superseded: [],
  withdrawn: [],
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

function assertRefList(
  ids: readonly string[],
  label: string,
  max = 50,
): readonly string[] {
  if (ids.length > max) throw Error(`Too many ${label}`);
  const seen = new Set<string>();
  for (const id of ids) {
    if (!REF_ID_RE.test(id)) throw Error(`Invalid ${label} id`);
    if (seen.has(id)) throw Error(`Duplicate ${label} id`);
    seen.add(id);
  }
  return [...ids];
}

function assertStringList(
  values: readonly string[],
  label: string,
  maxItems: number,
  maxLen: number,
  minItems = 0,
): readonly string[] {
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  if (values.length < minItems) throw Error(`Too few ${label}`);
  const out: string[] = [];
  for (const value of values) {
    if (!textOk(value, maxLen)) throw Error(`Invalid ${label} entry`);
    out.push(value.trim());
  }
  return out;
}

function assertHonesty(honesty: ProtocolIntelligenceHonesty): void {
  if (honesty.agentsProposeResearchersApprove !== true) {
    throw Error("Agents propose; researchers approve");
  }
  if (honesty.aiCannotSelfApproveExperiments !== true) {
    throw Error("AI cannot self-approve experiments");
  }
  if (honesty.protocolsApprovedOnlyByAuthorisedResearchers !== true) {
    throw Error("Protocols require authorised researcher approval");
  }
  if (honesty.noAutomaticInstrumentInstructions !== true) {
    throw Error("Automatic instrument instructions forbidden");
  }
  if (honesty.noUnjustifiedPowerSampleSizeClaims !== true) {
    throw Error("Unjustified power/sample-size claims forbidden");
  }
  if (honesty.fabricatedResults !== false) {
    throw Error("Fabricated results forbidden");
  }
  if (honesty.pipelinesExecuted !== false) {
    throw Error("Pipeline execution must not be claimed");
  }
  if (honesty.labAdaptersWired !== false) {
    throw Error("Lab adapters must not be claimed");
  }
  if (honesty.workbenchUiShipped !== false) {
    throw Error("Workbench UI must not be claimed");
  }
  if (honesty.gateCAutoApprove !== false) {
    throw Error("Gate C auto-approve forbidden");
  }
  if (honesty.mouInvented !== false) throw Error("MoU must not be invented");
  if (honesty.phiCdsWired !== false) throw Error("PHI/CDS must stay unwired");
  if (honesty.closedLoopDiscoveryComplete !== false) {
    throw Error("Closed-loop discovery must not be claimed");
  }
  if (honesty.scientificApprovalClaimedComplete !== false) {
    throw Error("Scientific approval completeness must not be claimed");
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
  if (honesty.dependsOnPr1LifecycleContracts !== true) {
    throw Error("PR3 depends on PR1 lifecycle contracts");
  }
  if (honesty.dependsOnPr2DesignPrioritisation !== true) {
    throw Error("PR3 depends on PR2 design prioritisation");
  }
}

/** Refuse unjustified numeric power / sample-size inventions in free text. */
function assertNoInventedPowerOrN(text: string, label: string): void {
  const lower = text.toLowerCase();
  if (
    /\bpower\s*=\s*0\.\d+/.test(lower) ||
    /\bsample\s*size\s*=\s*\d+/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bpowered\s+at\s+0\.\d+/.test(lower) ||
    /\bpower\s+calculation\s+yields\s+n\s*=\s*\d+/.test(lower)
  ) {
    throw Error(
      `${label} must not invent unjustified power or sample-size claims`,
    );
  }
}

function assertMethodControls(
  docs: MethodControlDocumentation,
): MethodControlDocumentation {
  const methods = assertStringList(docs.methods, "methods", 40, 1000, 1);
  const controls = assertStringList(docs.controls, "controls", 32, 500, 1);
  const negativeControls = assertStringList(
    docs.negativeControls,
    "negative controls",
    16,
    500,
    1,
  );
  const measurements = assertStringList(
    docs.measurements,
    "measurements",
    32,
    500,
    1,
  );
  const proceduralLimitations = assertStringList(
    docs.proceduralLimitations,
    "procedural limitations",
    32,
    1000,
    1,
  );
  return {
    methods,
    controls,
    negativeControls,
    measurements,
    proceduralLimitations,
  };
}

function assertRequiredMetadata(
  fields: readonly RequiredProtocolMetadataField[],
): readonly RequiredProtocolMetadataField[] {
  if (fields.length < 1 || fields.length > 40) {
    throw Error("Invalid required metadata count");
  }
  const seen = new Set<string>();
  const out: RequiredProtocolMetadataField[] = [];
  for (const field of fields) {
    if (!METADATA_KEY_RE.test(field.key)) {
      throw Error("Invalid metadata key");
    }
    if (seen.has(field.key)) throw Error("Duplicate metadata key");
    seen.add(field.key);
    if (!textOk(field.label, 200)) throw Error("Invalid metadata label");
    if (typeof field.required !== "boolean") {
      throw Error("Invalid metadata required flag");
    }
    if (field.value !== null && !textOk(field.value, 1000)) {
      throw Error("Invalid metadata value");
    }
    if (
      field.missingReason !== null &&
      !textOk(field.missingReason, 1000)
    ) {
      throw Error("Invalid metadata missingReason");
    }
    if (field.required && field.value === null && field.missingReason === null) {
      throw Error("Required metadata missing value needs missingReason");
    }
    if (field.value !== null && field.missingReason !== null) {
      throw Error("Metadata value and missingReason are mutually exclusive");
    }
    out.push({
      key: field.key,
      label: field.label.trim(),
      required: field.required,
      value: field.value === null ? null : field.value.trim(),
      missingReason:
        field.missingReason === null ? null : field.missingReason.trim(),
    });
  }
  return out;
}

function assertStatisticalAnalysisPlan(
  sap: StatisticalAnalysisPlan,
): StatisticalAnalysisPlan {
  assertClosed(
    sap.justificationKind,
    SAP_JUSTIFICATION_KINDS,
    "SAP justification",
  );
  if (sap.inventedPowerSampleSizeClaims !== false) {
    throw Error("Invented power/sample-size claims forbidden");
  }
  const objectives = assertStringList(
    sap.objectives,
    "SAP objectives",
    16,
    1000,
    1,
  );
  const endpoints = assertStringList(sap.endpoints, "SAP endpoints", 16, 500, 1);
  const analysisMethods = assertStringList(
    sap.analysisMethods,
    "SAP analysis methods",
    16,
    1000,
    1,
  );
  if (!textOk(sap.planSummary, 4000)) throw Error("Invalid SAP plan summary");
  assertNoInventedPowerOrN(sap.planSummary, "SAP plan summary");
  for (const method of analysisMethods) {
    assertNoInventedPowerOrN(method, "SAP analysis method");
  }
  if (
    sap.justificationKind === "declared_external_plan" &&
    (sap.externalPlanRef === null || !REF_ID_RE.test(sap.externalPlanRef))
  ) {
    throw Error("declared_external_plan requires externalPlanRef");
  }
  if (
    sap.justificationKind !== "declared_external_plan" &&
    sap.externalPlanRef !== null &&
    !REF_ID_RE.test(sap.externalPlanRef)
  ) {
    throw Error("Invalid externalPlanRef");
  }
  return {
    objectives,
    endpoints,
    analysisMethods,
    justificationKind: sap.justificationKind,
    planSummary: sap.planSummary.trim(),
    externalPlanRef: sap.externalPlanRef,
    inventedPowerSampleSizeClaims: false,
  };
}

function assertQualityControl(
  requirements: readonly QualityControlRequirement[],
): readonly QualityControlRequirement[] {
  if (requirements.length < 1 || requirements.length > 32) {
    throw Error("Invalid QC requirement count");
  }
  const seen = new Set<string>();
  const out: QualityControlRequirement[] = [];
  for (const req of requirements) {
    if (!REF_ID_RE.test(req.id)) throw Error("Invalid QC requirement id");
    if (seen.has(req.id)) throw Error("Duplicate QC requirement id");
    seen.add(req.id);
    if (!textOk(req.description, 1000)) throw Error("Invalid QC description");
    if (!textOk(req.acceptanceCriterion, 1000)) {
      throw Error("Invalid QC acceptance criterion");
    }
    out.push({
      id: req.id,
      description: req.description.trim(),
      acceptanceCriterion: req.acceptanceCriterion.trim(),
    });
  }
  return out;
}

function assertSafetyEthics(
  records: readonly SafetyEthicsGovernanceRecord[],
): readonly SafetyEthicsGovernanceRecord[] {
  if (records.length < 1 || records.length > 16) {
    throw Error("Invalid safety/ethics record count");
  }
  const out: SafetyEthicsGovernanceRecord[] = [];
  for (const record of records) {
    assertClosed(record.kind, EXTERNAL_GOVERNANCE_KINDS, "governance kind");
    if (record.mouInvented !== false) throw Error("MoU must not be invented");
    if (record.gateCAutoApprove !== false) {
      throw Error("Gate C auto-approve forbidden");
    }
    if (!textOk(record.summary, 2000)) {
      throw Error("Invalid safety/ethics summary");
    }
    if (record.kind === "none_declared") {
      if (record.externalRef !== null) {
        throw Error("none_declared must not carry externalRef");
      }
    } else if (
      record.externalRef === null ||
      !textOk(record.externalRef, 500)
    ) {
      throw Error("Governance kind requires externalRef");
    }
    out.push({
      kind: record.kind,
      externalRef:
        record.externalRef === null ? null : record.externalRef.trim(),
      summary: record.summary.trim(),
      mouInvented: false,
      gateCAutoApprove: false,
    });
  }
  return out;
}

export function validateIntelligentProtocolDraft(
  draft: IntelligentProtocolDraft,
): IntelligentProtocolDraft {
  if (draft.schema !== PROTOCOL_INTELLIGENCE_SCHEMA) {
    throw Error("Invalid schema");
  }
  if (draft.method !== PROTOCOL_INTELLIGENCE_METHOD) {
    throw Error("Invalid method");
  }
  if (draft.version !== PROTOCOL_INTELLIGENCE_VERSION) {
    throw Error("Invalid version");
  }
  if (!PROTOCOL_DRAFT_ID_RE.test(draft.id)) {
    throw Error("Invalid protocol draft id");
  }
  if (!textOk(draft.title, 200)) throw Error("Invalid protocol title");
  if (!textOk(draft.objective, 2000)) throw Error("Invalid protocol objective");
  if (!Number.isInteger(draft.protocolVersion) || draft.protocolVersion < 1) {
    throw Error("Invalid protocol version");
  }
  if (draft.protocolVersion === 1 && draft.parentProtocolVersion !== null) {
    throw Error("Version 1 cannot have parent");
  }
  if (draft.protocolVersion > 1 && draft.parentProtocolVersion === null) {
    throw Error("Version >1 requires parentProtocolVersion");
  }
  if (
    draft.parentProtocolVersion !== null &&
    (!Number.isInteger(draft.parentProtocolVersion) ||
      draft.parentProtocolVersion < 1 ||
      draft.parentProtocolVersion >= draft.protocolVersion)
  ) {
    throw Error("Invalid parentProtocolVersion");
  }
  assertClosed(draft.lifecycle, PROTOCOL_DRAFT_LIFECYCLES, "protocol lifecycle");
  assertClosed(draft.dataBasis, DATA_BASES, "data basis");
  if (draft.dataBasis === "fixture_engineering" && !draft.fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  assertHonesty(draft.honesty);

  if (
    draft.sourceProposalId !== null &&
    !REF_ID_RE.test(draft.sourceProposalId)
  ) {
    throw Error("Invalid sourceProposalId");
  }
  if (
    draft.sourceDesignPackageId !== null &&
    !REF_ID_RE.test(draft.sourceDesignPackageId)
  ) {
    throw Error("Invalid sourceDesignPackageId");
  }
  if (
    draft.sourceApproachId !== null &&
    !REF_ID_RE.test(draft.sourceApproachId)
  ) {
    throw Error("Invalid sourceApproachId");
  }
  if (
    draft.linkedPr1ProtocolId !== null &&
    !REF_ID_RE.test(draft.linkedPr1ProtocolId)
  ) {
    throw Error("Invalid linkedPr1ProtocolId");
  }
  if (draft.hypothesisId !== null && !REF_ID_RE.test(draft.hypothesisId)) {
    throw Error("Invalid hypothesisId");
  }
  if (
    draft.investigationId !== null &&
    !REF_ID_RE.test(draft.investigationId)
  ) {
    throw Error("Invalid investigationId");
  }

  const methodControls = assertMethodControls(draft.methodControls);
  const requiredMetadata = assertRequiredMetadata(draft.requiredMetadata);
  const statisticalAnalysisPlan = assertStatisticalAnalysisPlan(
    draft.statisticalAnalysisPlan,
  );
  const qualityControlRequirements = assertQualityControl(
    draft.qualityControlRequirements,
  );
  const safetyEthics = assertSafetyEthics(draft.safetyEthics);

  if (draft.executableInstrumentInstructions !== null) {
    throw Error("Executable instrument instructions must stay null");
  }
  if (draft.instrumentInstructionsIssued !== false) {
    throw Error("Instrument instructions must not be issued automatically");
  }

  if (!PRINCIPAL_RE.test(draft.draftedBy.principalId)) {
    throw Error("Invalid draftedBy principal");
  }
  assertClosed(draft.draftedBy.actorKind, ACTOR_KINDS, "draftedBy actor kind");

  if (draft.lifecycle === "researcher_approved") {
    if (draft.approvedBy === null) {
      throw Error("Approved protocol missing approval stamp");
    }
    if (draft.approvedBy.actorKind !== "human") {
      throw Error("Only human researchers may approve protocols");
    }
    if (!PRINCIPAL_RE.test(draft.approvedBy.principalId)) {
      throw Error("Invalid approver principal");
    }
    if (!isIsoTimestamp(draft.approvedBy.approvedAt)) {
      throw Error("Invalid approvedAt");
    }
    if (
      draft.draftedBy.actorKind !== "human" &&
      draft.approvedBy.principalId === draft.draftedBy.principalId
    ) {
      throw Error("AI cannot self-approve experimental protocol");
    }
  } else if (draft.approvedBy !== null) {
    throw Error("Approval stamp only allowed when researcher_approved");
  }

  if (draft.lifecycle === "researcher_rejected") {
    if (draft.rejectedBy === null) {
      throw Error("Rejected protocol missing rejection stamp");
    }
    if (draft.rejectedBy.actorKind !== "human") {
      throw Error("Only human researchers may reject protocols");
    }
    if (!PRINCIPAL_RE.test(draft.rejectedBy.principalId)) {
      throw Error("Invalid rejector principal");
    }
    if (!isIsoTimestamp(draft.rejectedBy.rejectedAt)) {
      throw Error("Invalid rejectedAt");
    }
    if (!textOk(draft.rejectedBy.reason, 2000)) {
      throw Error("Rejection requires reason");
    }
  } else if (draft.rejectedBy !== null) {
    throw Error("Rejection stamp only allowed when researcher_rejected");
  }

  if (!isIsoTimestamp(draft.createdAt) || !isIsoTimestamp(draft.updatedAt)) {
    throw Error("Invalid timestamps");
  }
  if (draft.note.trim() !== "" && !textOk(draft.note, 2000)) {
    throw Error("Invalid note");
  }

  return {
    ...draft,
    title: draft.title.trim(),
    objective: draft.objective.trim(),
    methodControls,
    requiredMetadata,
    statisticalAnalysisPlan,
    qualityControlRequirements,
    safetyEthics,
    executableInstrumentInstructions: null,
    instrumentInstructionsIssued: false,
    honesty: {...DEFAULT_HONESTY},
    note: draft.note.trim(),
  };
}

export function draftIntelligentProtocol(input: {
  id: string;
  title: string;
  objective: string;
  draftedByPrincipalId: string;
  draftedByActorKind?: ProtocolActorKind;
  createdAt: string;
  protocolVersion?: number;
  parentProtocolVersion?: number | null;
  sourceProposalId?: string | null;
  sourceDesignPackageId?: string | null;
  sourceApproachId?: string | null;
  linkedPr1ProtocolId?: string | null;
  hypothesisId?: string | null;
  investigationId?: string | null;
  methodControls: MethodControlDocumentation;
  requiredMetadata: readonly RequiredProtocolMetadataField[];
  statisticalAnalysisPlan: StatisticalAnalysisPlan;
  qualityControlRequirements: readonly QualityControlRequirement[];
  safetyEthics: readonly SafetyEthicsGovernanceRecord[];
  dataBasis?: ProtocolDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): IntelligentProtocolDraft {
  if (!PROTOCOL_DRAFT_ID_RE.test(input.id)) {
    throw Error("Invalid protocol draft id");
  }
  if (!PRINCIPAL_RE.test(input.draftedByPrincipalId)) {
    throw Error("Invalid draftedBy principal");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actorKind = input.draftedByActorKind ?? "ai_agent";
  assertClosed(actorKind, ACTOR_KINDS, "draftedBy actor kind");
  const dataBasis = input.dataBasis ?? "fixture_engineering";
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  const protocolVersion = input.protocolVersion ?? 1;
  const parent =
    input.parentProtocolVersion === undefined
      ? protocolVersion === 1
        ? null
        : protocolVersion - 1
      : input.parentProtocolVersion;

  // At least one approved-spec source should be declared for honesty.
  if (
    (input.sourceProposalId === undefined || input.sourceProposalId === null) &&
    (input.sourceDesignPackageId === undefined ||
      input.sourceDesignPackageId === null)
  ) {
    throw Error(
      "Protocol draft requires sourceProposalId and/or sourceDesignPackageId",
    );
  }

  const draft: IntelligentProtocolDraft = {
    schema: PROTOCOL_INTELLIGENCE_SCHEMA,
    method: PROTOCOL_INTELLIGENCE_METHOD,
    version: PROTOCOL_INTELLIGENCE_VERSION,
    id: input.id,
    title: input.title,
    objective: input.objective,
    protocolVersion,
    parentProtocolVersion: parent,
    lifecycle: "draft",
    sourceProposalId: input.sourceProposalId ?? null,
    sourceDesignPackageId: input.sourceDesignPackageId ?? null,
    sourceApproachId: input.sourceApproachId ?? null,
    linkedPr1ProtocolId: input.linkedPr1ProtocolId ?? null,
    hypothesisId: input.hypothesisId ?? null,
    investigationId: input.investigationId ?? null,
    methodControls: input.methodControls,
    requiredMetadata: input.requiredMetadata,
    statisticalAnalysisPlan: input.statisticalAnalysisPlan,
    qualityControlRequirements: input.qualityControlRequirements,
    safetyEthics: input.safetyEthics,
    executableInstrumentInstructions: null,
    instrumentInstructionsIssued: false,
    draftedBy: {
      principalId: input.draftedByPrincipalId,
      actorKind,
    },
    approvedBy: null,
    rejectedBy: null,
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: input.note ?? "",
  };
  return validateIntelligentProtocolDraft(draft);
}

/**
 * Fail-closed scientific-approval transition.
 * Only authorised human researchers may approve or reject.
 * AI / agent cannot approve its own experimental protocol.
 */
export function transitionIntelligentProtocolDraft(input: {
  draft: IntelligentProtocolDraft;
  to: ProtocolDraftLifecycle;
  updatedAt: string;
  actor: {principalId: string; actorKind: ProtocolActorKind};
  rejectionReason?: string;
  note?: string;
}): IntelligentProtocolDraft {
  const prior = validateIntelligentProtocolDraft(input.draft);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  if (!PRINCIPAL_RE.test(input.actor.principalId)) {
    throw Error("Invalid transition actor");
  }
  assertClosed(input.actor.actorKind, ACTOR_KINDS, "actor kind");
  assertClosed(input.to, PROTOCOL_DRAFT_LIFECYCLES, "lifecycle");

  const allowed = DRAFT_TRANSITIONS[prior.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal protocol draft transition ${prior.lifecycle} → ${input.to}`,
    );
  }

  if (
    input.to === "researcher_approved" ||
    input.to === "researcher_rejected" ||
    input.to === "changes_requested"
  ) {
    if (input.actor.actorKind !== "human") {
      throw Error("Only authorised human researchers may decide protocols");
    }
  }

  if (input.to === "researcher_approved") {
    if (
      prior.draftedBy.actorKind !== "human" &&
      input.actor.principalId === prior.draftedBy.principalId
    ) {
      throw Error("AI cannot self-approve experimental protocol");
    }
  }

  if (input.to === "researcher_rejected") {
    if (!textOk(input.rejectionReason ?? "", 2000)) {
      throw Error("Rejection requires reason");
    }
  }

  const approvedBy =
    input.to === "researcher_approved"
      ? {
          principalId: input.actor.principalId,
          actorKind: "human" as const,
          approvedAt: input.updatedAt,
        }
      : null;

  const rejectedBy =
    input.to === "researcher_rejected"
      ? {
          principalId: input.actor.principalId,
          actorKind: "human" as const,
          rejectedAt: input.updatedAt,
          reason: (input.rejectionReason ?? "").trim(),
        }
      : null;

  const next: IntelligentProtocolDraft = {
    ...prior,
    lifecycle: input.to,
    approvedBy,
    rejectedBy,
    updatedAt: input.updatedAt,
    note: input.note !== undefined ? input.note.trim() : prior.note,
    honesty: {...DEFAULT_HONESTY},
    executableInstrumentInstructions: null,
    instrumentInstructionsIssued: false,
  };
  return validateIntelligentProtocolDraft(next);
}

/**
 * Create a new immutable protocol version with change-control lineage.
 * Does not auto-approve or issue instrument instructions.
 */
export function reviseIntelligentProtocolVersion(input: {
  prior: IntelligentProtocolDraft;
  newId?: string;
  revisedAt: string;
  actor: {principalId: string; actorKind: ProtocolActorKind};
  title?: string;
  objective?: string;
  methodControls?: MethodControlDocumentation;
  requiredMetadata?: readonly RequiredProtocolMetadataField[];
  statisticalAnalysisPlan?: StatisticalAnalysisPlan;
  qualityControlRequirements?: readonly QualityControlRequirement[];
  safetyEthics?: readonly SafetyEthicsGovernanceRecord[];
  note?: string;
}): {
  draft: IntelligentProtocolDraft;
  change: ProtocolChangeControlEntry;
} {
  const prior = validateIntelligentProtocolDraft(input.prior);
  if (!isIsoTimestamp(input.revisedAt)) throw Error("Invalid revisedAt");
  if (!PRINCIPAL_RE.test(input.actor.principalId)) {
    throw Error("Invalid revision actor");
  }
  assertClosed(input.actor.actorKind, ACTOR_KINDS, "actor kind");
  if (
    prior.lifecycle !== "draft" &&
    prior.lifecycle !== "changes_requested" &&
    prior.lifecycle !== "researcher_approved"
  ) {
    throw Error(
      "Revision only from draft, changes_requested, or researcher_approved",
    );
  }

  const nextVersion = prior.protocolVersion + 1;
  const draft = draftIntelligentProtocol({
    id: input.newId ?? prior.id,
    title: input.title ?? prior.title,
    objective: input.objective ?? prior.objective,
    draftedByPrincipalId: prior.draftedBy.principalId,
    draftedByActorKind: prior.draftedBy.actorKind,
    createdAt: input.revisedAt,
    protocolVersion: nextVersion,
    parentProtocolVersion: prior.protocolVersion,
    sourceProposalId: prior.sourceProposalId,
    sourceDesignPackageId: prior.sourceDesignPackageId,
    sourceApproachId: prior.sourceApproachId,
    linkedPr1ProtocolId: prior.linkedPr1ProtocolId,
    hypothesisId: prior.hypothesisId,
    investigationId: prior.investigationId,
    methodControls: input.methodControls ?? prior.methodControls,
    requiredMetadata: input.requiredMetadata ?? prior.requiredMetadata,
    statisticalAnalysisPlan:
      input.statisticalAnalysisPlan ?? prior.statisticalAnalysisPlan,
    qualityControlRequirements:
      input.qualityControlRequirements ?? prior.qualityControlRequirements,
    safetyEthics: input.safetyEthics ?? prior.safetyEthics,
    dataBasis: prior.dataBasis,
    fixtureHonesty: prior.fixtureHonesty,
    note: input.note ?? prior.note,
  });

  const change = buildChangeControlEntry({
    id: `hsi-exp-pch-${prior.id.replace(/^hsi-exp-pint-/, "")}-v${nextVersion}`,
    protocolDraftId: draft.id,
    fromVersion: prior.protocolVersion,
    toVersion: nextVersion,
    kind: "content_revised",
    summary: `Revised protocol to version ${nextVersion}`,
    actorPrincipalId: input.actor.principalId,
    actorKind: input.actor.actorKind,
    at: input.revisedAt,
  });

  return {draft, change};
}

export function buildChangeControlEntry(input: {
  id: string;
  protocolDraftId: string;
  fromVersion: number | null;
  toVersion: number;
  kind: ChangeControlKind;
  summary: string;
  actorPrincipalId: string;
  actorKind: ProtocolActorKind;
  at: string;
}): ProtocolChangeControlEntry {
  if (!CHANGE_ID_RE.test(input.id)) throw Error("Invalid change-control id");
  if (!PROTOCOL_DRAFT_ID_RE.test(input.protocolDraftId)) {
    throw Error("Invalid protocol draft id");
  }
  assertClosed(input.kind, CHANGE_CONTROL_KINDS, "change-control kind");
  if (!textOk(input.summary, 2000)) throw Error("Invalid change summary");
  if (!PRINCIPAL_RE.test(input.actorPrincipalId)) {
    throw Error("Invalid change actor");
  }
  assertClosed(input.actorKind, ACTOR_KINDS, "actor kind");
  if (!isIsoTimestamp(input.at)) throw Error("Invalid change timestamp");
  if (!Number.isInteger(input.toVersion) || input.toVersion < 1) {
    throw Error("Invalid toVersion");
  }
  if (
    input.fromVersion !== null &&
    (!Number.isInteger(input.fromVersion) || input.fromVersion < 1)
  ) {
    throw Error("Invalid fromVersion");
  }
  return {
    id: input.id,
    protocolDraftId: input.protocolDraftId,
    fromVersion: input.fromVersion,
    toVersion: input.toVersion,
    kind: input.kind,
    summary: input.summary.trim(),
    actorPrincipalId: input.actorPrincipalId,
    actorKind: input.actorKind,
    at: input.at,
  };
}

export function addProtocolReviewerComment(input: {
  id: string;
  draft: IntelligentProtocolDraft;
  authorPrincipalId: string;
  authorActorKind?: ProtocolActorKind;
  severity: ReviewCommentSeverity;
  body: string;
  createdAt: string;
  resolved?: boolean;
}): ProtocolReviewerComment {
  const draft = validateIntelligentProtocolDraft(input.draft);
  if (!COMMENT_ID_RE.test(input.id)) throw Error("Invalid comment id");
  if (!PRINCIPAL_RE.test(input.authorPrincipalId)) {
    throw Error("Invalid comment author");
  }
  const actorKind = input.authorActorKind ?? "human";
  assertClosed(actorKind, ACTOR_KINDS, "comment author actor kind");
  assertClosed(input.severity, REVIEW_COMMENT_SEVERITIES, "comment severity");
  if (!textOk(input.body, 4000)) throw Error("Invalid comment body");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (
    draft.lifecycle !== "submitted_for_scientific_review" &&
    draft.lifecycle !== "changes_requested" &&
    draft.lifecycle !== "researcher_approved" &&
    draft.lifecycle !== "researcher_rejected"
  ) {
    throw Error("Comments require a reviewable protocol lifecycle");
  }
  return {
    id: input.id,
    protocolDraftId: draft.id,
    protocolVersion: draft.protocolVersion,
    authorPrincipalId: input.authorPrincipalId,
    authorActorKind: actorKind,
    severity: input.severity,
    body: input.body.trim(),
    createdAt: input.createdAt,
    resolved: input.resolved ?? false,
  };
}

/**
 * Explicitly refuse auto-issuing instrument instructions from an approved
 * protocol. Callers must not treat approval as executable lab control.
 */
export function refuseAutomaticInstrumentInstructions(
  draft: IntelligentProtocolDraft,
): {
  refused: true;
  reason: string;
  instrumentInstructionsIssued: false;
  executableInstrumentInstructions: null;
} {
  const validated = validateIntelligentProtocolDraft(draft);
  if (validated.instrumentInstructionsIssued !== false) {
    throw Error("Instrument instructions already issued (forbidden)");
  }
  return {
    refused: true,
    reason:
      "Protocol scientific approval does not auto-issue executable instrument instructions (M10 PR3)",
    instrumentInstructionsIssued: false,
    executableInstrumentInstructions: null,
  };
}

export function createMemoryProtocolIntelligenceStore(): ProtocolIntelligenceStore & {
  drafts: Map<string, IntelligentProtocolDraft>;
  comments: Map<string, ProtocolReviewerComment>;
  changes: ProtocolChangeControlEntry[];
} {
  const drafts = new Map<string, IntelligentProtocolDraft>();
  const comments = new Map<string, ProtocolReviewerComment>();
  const changes: ProtocolChangeControlEntry[] = [];

  return {
    drafts,
    comments,
    changes,
    upsertProtocolDraft(draft) {
      const validated = validateIntelligentProtocolDraft(draft);
      drafts.set(validated.id, validated);
      return validated;
    },
    getProtocolDraft(id) {
      return drafts.get(id) ?? null;
    },
    listProtocolDrafts(hypothesisId) {
      const all = [...drafts.values()];
      return hypothesisId
        ? all.filter((d) => d.hypothesisId === hypothesisId)
        : all;
    },
    upsertReviewerComment(comment) {
      if (!COMMENT_ID_RE.test(comment.id)) throw Error("Invalid comment id");
      if (!PROTOCOL_DRAFT_ID_RE.test(comment.protocolDraftId)) {
        throw Error("Invalid protocol draft id");
      }
      assertClosed(
        comment.severity,
        REVIEW_COMMENT_SEVERITIES,
        "comment severity",
      );
      comments.set(comment.id, comment);
      return comment;
    },
    getReviewerComment(id) {
      return comments.get(id) ?? null;
    },
    listReviewerComments(protocolDraftId) {
      const all = [...comments.values()];
      return protocolDraftId
        ? all.filter((c) => c.protocolDraftId === protocolDraftId)
        : all;
    },
    appendChangeControl(entry) {
      const validated = buildChangeControlEntry(entry);
      changes.push(validated);
      return validated;
    },
    listChangeControl(protocolDraftId) {
      return protocolDraftId
        ? changes.filter((c) => c.protocolDraftId === protocolDraftId)
        : [...changes];
    },
  };
}

export function projectProtocolIntelligencePersistenceLines(input: {
  draft: IntelligentProtocolDraft;
  comments?: readonly ProtocolReviewerComment[];
  changes?: readonly ProtocolChangeControlEntry[];
}): string[] {
  const draft = validateIntelligentProtocolDraft(input.draft);
  const lines = [
    `schema=${draft.schema}`,
    `method=${draft.method}`,
    `version=${draft.version}`,
    `protocolDraftId=${draft.id}`,
    `protocolVersion=${draft.protocolVersion}`,
    `lifecycle=${draft.lifecycle}`,
    `sourceProposalId=${draft.sourceProposalId ?? "none"}`,
    `sourceDesignPackageId=${draft.sourceDesignPackageId ?? "none"}`,
    `hypothesisId=${draft.hypothesisId ?? "none"}`,
    `sapJustification=${draft.statisticalAnalysisPlan.justificationKind}`,
    `powerSampleSizeClaims=false`,
    `instrumentInstructionsIssued=false`,
    `mouInvented=false`,
    `gateCAutoApprove=false`,
    `fabricatedResults=false`,
    `pipelinesExecuted=false`,
    `labAdapters=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
    `dependsOnPr1=true`,
    `dependsOnPr2=true`,
  ];
  if (input.comments) {
    lines.push(`reviewerComments=${input.comments.length}`);
  }
  if (input.changes) {
    lines.push(`changeControlEntries=${input.changes.length}`);
  }
  return lines;
}

export function fingerprintIntelligentProtocolDraft(
  draft: IntelligentProtocolDraft,
): string {
  const validated = validateIntelligentProtocolDraft(draft);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildProtocolIntelligencePack(input: {
  drafts: readonly IntelligentProtocolDraft[];
  comments: readonly ProtocolReviewerComment[];
  changes: readonly ProtocolChangeControlEntry[];
  asOf: string;
}): {
  schema: typeof PROTOCOL_INTELLIGENCE_SCHEMA;
  method: typeof PROTOCOL_INTELLIGENCE_METHOD;
  version: typeof PROTOCOL_INTELLIGENCE_VERSION;
  asOf: string;
  protocolDraftCount: number;
  reviewerCommentCount: number;
  changeControlCount: number;
  honesty: ProtocolIntelligenceHonesty;
  drafts: readonly IntelligentProtocolDraft[];
  comments: readonly ProtocolReviewerComment[];
  changes: readonly ProtocolChangeControlEntry[];
  dependency: {
    requiresPr1LifecycleContracts: true;
    requiresPr2DesignPrioritisation: true;
    pr1Status: "must_merge_or_stack_first";
    pr2Status: "must_merge_or_stack_first";
  };
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const drafts = input.drafts.map(validateIntelligentProtocolDraft);
  return {
    schema: PROTOCOL_INTELLIGENCE_SCHEMA,
    method: PROTOCOL_INTELLIGENCE_METHOD,
    version: PROTOCOL_INTELLIGENCE_VERSION,
    asOf: input.asOf,
    protocolDraftCount: drafts.length,
    reviewerCommentCount: input.comments.length,
    changeControlCount: input.changes.length,
    honesty: {...DEFAULT_HONESTY},
    drafts,
    comments: input.comments,
    changes: input.changes,
    dependency: {
      requiresPr1LifecycleContracts: true,
      requiresPr2DesignPrioritisation: true,
      pr1Status: "must_merge_or_stack_first",
      pr2Status: "must_merge_or_stack_first",
    },
  };
}
