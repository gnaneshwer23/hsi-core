/**
 * Milestone 14 / PR2 — Secure Clinical Data Interoperability Contracts.
 *
 * Extends M14 PR1 RWE contracts and existing HSI Clinical / federation honesty
 * with data-source registration, data-use permissions, schema/terminology
 * mappings, unit normalisation, temporal alignment, quality validation,
 * provenance, access enforcement, retention/deletion, and governance records.
 *
 * Supports *contract* mappings for HL7 FHIR R4, OMOP CDM, clinical
 * terminologies, research dataset schemas, and trial outcome formats —
 * without claiming live connectors, ingesting PHI, building an unrestricted
 * central patient DB, wiring EHR write-back / CDS, inventing Gate C / MoU,
 * or fabricating clinical results.
 *
 * Binding honesty:
 * - Research decision support only; fixtures/contracts until authorised.
 * - Pseudonymised data may still be personal data.
 * - Federation / FHIR / OMOP connectors are not operational unless verified.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const SECURE_CLINICAL_INTEROP_SCHEMA =
  "hsi-secure-clinical-data-interop-1" as const;
export const SECURE_CLINICAL_INTEROP_METHOD =
  "hsi.secure_clinical_data_interop.v1" as const;
export const SECURE_CLINICAL_INTEROP_VERSION = "0.1.0" as const;

export const DATA_SOURCE_KINDS = [
  "hl7_fhir_r4",
  "omop_cdm",
  "clinical_terminology",
  "research_dataset_schema",
  "trial_outcome_format",
  "other_declared",
] as const;
export type DataSourceKind = (typeof DATA_SOURCE_KINDS)[number];

export const DATA_SOURCE_LIFECYCLES = [
  "draft",
  "registered",
  "permission_blocked",
  "connector_unverified",
  "retired",
  "rejected",
] as const;
export type DataSourceLifecycle = (typeof DATA_SOURCE_LIFECYCLES)[number];

export const CONNECTOR_STATUSES = [
  "contract_only",
  "fixture_mapping",
  "unverified_not_operational",
  "blocked_no_authorised_dataset",
] as const;
export type ConnectorStatus = (typeof CONNECTOR_STATUSES)[number];

export const LEGAL_BASES = [
  "fixture_engineering",
  "declared_research_authorisation_ref",
  "public_interest_research_declared",
  "consent_declared",
  "other_declared",
  "not_established",
] as const;
export type LegalBasis = (typeof LEGAL_BASES)[number];

export const CONTROLLER_PROCESSOR_ROLES = [
  "controller",
  "joint_controller",
  "processor",
  "fixture_only",
  "unassigned",
] as const;
export type ControllerProcessorRole =
  (typeof CONTROLLER_PROCESSOR_ROLES)[number];

export const ACCESS_PERMISSIONS = [
  "register_source",
  "map_schema",
  "map_terminology",
  "normalise_units",
  "align_temporal",
  "validate_quality",
  "read_provenance",
  "export_restricted",
  "retain_or_delete",
  "administer_governance",
] as const;
export type AccessPermission = (typeof ACCESS_PERMISSIONS)[number];

export const ACCESS_DECISIONS = [
  "permit",
  "deny",
] as const;
export type AccessDecision = (typeof ACCESS_DECISIONS)[number];

export const SCHEMA_TARGET_MODELS = [
  "hl7_fhir_r4",
  "omop_cdm",
  "hsi_rwe_observation",
  "research_dataset_schema",
  "trial_outcome_format",
] as const;
export type SchemaTargetModel = (typeof SCHEMA_TARGET_MODELS)[number];

export const TERMINOLOGY_SYSTEMS = [
  "snomed_ct",
  "loinc",
  "icd10",
  "icd11",
  "rxnorm",
  "dmd",
  "atc",
  "ucum",
  "hsi_concept",
  "other_declared",
] as const;
export type TerminologySystem = (typeof TERMINOLOGY_SYSTEMS)[number];

export const MAPPING_CONFIDENCES = [
  "exact",
  "narrower",
  "broader",
  "inexact",
  "unmapped",
] as const;
export type MappingConfidence = (typeof MAPPING_CONFIDENCES)[number];

export const QUALITY_STATUSES = [
  "not_assessed",
  "passed_declared_checks",
  "failed_checks",
  "insufficient_evidence",
] as const;
export type QualityStatus = (typeof QUALITY_STATUSES)[number];

export const RETENTION_ACTIONS = [
  "retain_under_policy",
  "schedule_deletion",
  "delete_completed",
  "deletion_blocked",
] as const;
export type RetentionAction = (typeof RETENTION_ACTIONS)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type InteropActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type InteropDataBasis = (typeof DATA_BASES)[number];

const SOURCE_ID_RE = /^hsi-scdi-src-[a-z0-9-]{3,80}$/;
const PERMISSION_ID_RE = /^hsi-scdi-perm-[a-z0-9-]{3,80}$/;
const SCHEMA_MAP_ID_RE = /^hsi-scdi-sch-[a-z0-9-]{3,80}$/;
const TERM_MAP_ID_RE = /^hsi-scdi-trm-[a-z0-9-]{3,80}$/;
const UNIT_ID_RE = /^hsi-scdi-unt-[a-z0-9-]{3,80}$/;
const TEMPORAL_ID_RE = /^hsi-scdi-tmp-[a-z0-9-]{3,80}$/;
const QUALITY_ID_RE = /^hsi-scdi-qty-[a-z0-9-]{3,80}$/;
const PROVENANCE_ID_RE = /^hsi-scdi-prv-[a-z0-9-]{3,80}$/;
const ACCESS_ID_RE = /^hsi-scdi-acs-[a-z0-9-]{3,80}$/;
const RETENTION_ID_RE = /^hsi-scdi-rtn-[a-z0-9-]{3,80}$/;
const GOV_ID_RE = /^hsi-scdi-gov-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const RWE_STUDY_RE = /^hsi-rwe-study-[a-z0-9-]{3,80}$/;
const ORG_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type SecureClinicalInteropHonesty = {
  researchDecisionSupportOnly: true;
  noUnrestrictedCentralPatientDatabase: true;
  noLivePhiIngestion: true;
  noEhrWriteBackOrCds: true;
  noLiveConnectorClaimWithoutVerification: true;
  federationNotOperationalUnlessVerified: true;
  pseudonymisedMayStillBePersonalData: true;
  identifiableRecordsOutsideScientificKg: true;
  noFabricatedClinicalResults: true;
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

export type InteropActor = {
  principalId: string;
  actorKind: InteropActorKind;
};

export type DataSourceRegistration = {
  schema: typeof SECURE_CLINICAL_INTEROP_SCHEMA;
  method: typeof SECURE_CLINICAL_INTEROP_METHOD;
  version: typeof SECURE_CLINICAL_INTEROP_VERSION;
  id: string;
  displayName: string;
  sourceKind: DataSourceKind;
  schemaProfile: string;
  connectorStatus: ConnectorStatus;
  lifecycle: DataSourceLifecycle;
  liveConnectorOperational: false;
  containsIdentifiablePhi: false;
  permittedPurposes: readonly string[];
  orgId: string | null;
  rweStudyId: string | null;
  authoredBy: InteropActor;
  dataBasis: InteropDataBasis;
  fixtureHonesty: boolean;
  honesty: SecureClinicalInteropHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DataUsePermissionRecord = {
  schema: typeof SECURE_CLINICAL_INTEROP_SCHEMA;
  method: typeof SECURE_CLINICAL_INTEROP_METHOD;
  version: typeof SECURE_CLINICAL_INTEROP_VERSION;
  id: string;
  dataSourceId: string;
  legalBasis: LegalBasis;
  researchAuthorisationRef: string | null;
  purpose: string;
  purposeLimitation: string;
  permissions: readonly AccessPermission[];
  dataMinimisationStatement: string;
  exportRestrictions: string;
  permitted: boolean;
  denyReason: string | null;
  authoredBy: InteropActor;
  honesty: SecureClinicalInteropHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type SchemaMappingRecord = {
  schema: typeof SECURE_CLINICAL_INTEROP_SCHEMA;
  method: typeof SECURE_CLINICAL_INTEROP_METHOD;
  version: typeof SECURE_CLINICAL_INTEROP_VERSION;
  id: string;
  dataSourceId: string;
  sourceFieldPath: string;
  targetModel: SchemaTargetModel;
  targetFieldPath: string;
  mappingConfidence: MappingConfidence;
  liveTransformOperational: false;
  authoredBy: InteropActor;
  honesty: SecureClinicalInteropHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type TerminologyMappingRecord = {
  schema: typeof SECURE_CLINICAL_INTEROP_SCHEMA;
  method: typeof SECURE_CLINICAL_INTEROP_METHOD;
  version: typeof SECURE_CLINICAL_INTEROP_VERSION;
  id: string;
  dataSourceId: string;
  sourceSystem: TerminologySystem;
  sourceCode: string;
  targetSystem: TerminologySystem;
  targetCode: string;
  mappingConfidence: MappingConfidence;
  liveLookupOperational: false;
  authoredBy: InteropActor;
  honesty: SecureClinicalInteropHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type UnitNormalisationRecord = {
  schema: typeof SECURE_CLINICAL_INTEROP_SCHEMA;
  method: typeof SECURE_CLINICAL_INTEROP_METHOD;
  version: typeof SECURE_CLINICAL_INTEROP_VERSION;
  id: string;
  dataSourceId: string;
  sourceUnit: string;
  targetUnit: string;
  conversionFactorDeclared: string | null;
  conversionVerified: false;
  authoredBy: InteropActor;
  honesty: SecureClinicalInteropHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type TemporalAlignmentRecord = {
  schema: typeof SECURE_CLINICAL_INTEROP_SCHEMA;
  method: typeof SECURE_CLINICAL_INTEROP_METHOD;
  version: typeof SECURE_CLINICAL_INTEROP_VERSION;
  id: string;
  dataSourceId: string;
  sourceTimezone: string;
  targetTimezone: string;
  eventTimeField: string;
  observationTimeField: string;
  alignmentRule: string;
  liveAlignmentOperational: false;
  authoredBy: InteropActor;
  honesty: SecureClinicalInteropHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DataQualityValidationRecord = {
  schema: typeof SECURE_CLINICAL_INTEROP_SCHEMA;
  method: typeof SECURE_CLINICAL_INTEROP_METHOD;
  version: typeof SECURE_CLINICAL_INTEROP_VERSION;
  id: string;
  dataSourceId: string;
  checksPerformed: readonly string[];
  qualityStatus: QualityStatus;
  failures: readonly string[];
  fabricatedResults: null;
  authoredBy: InteropActor;
  honesty: SecureClinicalInteropHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type SourceProvenanceRecord = {
  schema: typeof SECURE_CLINICAL_INTEROP_SCHEMA;
  method: typeof SECURE_CLINICAL_INTEROP_METHOD;
  version: typeof SECURE_CLINICAL_INTEROP_VERSION;
  id: string;
  dataSourceId: string;
  provenanceSummary: string;
  upstreamSystem: string;
  capturedAt: string;
  lineageRefs: readonly string[];
  authoredBy: InteropActor;
  honesty: SecureClinicalInteropHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type AccessEnforcementRecord = {
  schema: typeof SECURE_CLINICAL_INTEROP_SCHEMA;
  method: typeof SECURE_CLINICAL_INTEROP_METHOD;
  version: typeof SECURE_CLINICAL_INTEROP_VERSION;
  id: string;
  dataSourceId: string;
  permissionRecordId: string;
  requestedPermission: AccessPermission;
  decision: AccessDecision;
  denyReason: string | null;
  actor: InteropActor;
  honesty: SecureClinicalInteropHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type RetentionDeletionRecord = {
  schema: typeof SECURE_CLINICAL_INTEROP_SCHEMA;
  method: typeof SECURE_CLINICAL_INTEROP_METHOD;
  version: typeof SECURE_CLINICAL_INTEROP_VERSION;
  id: string;
  dataSourceId: string;
  retentionPolicyRef: string;
  retentionAction: RetentionAction;
  retainUntil: string | null;
  deletionCompletedAt: string | null;
  authoredBy: InteropActor;
  honesty: SecureClinicalInteropHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type InteropGovernanceRecord = {
  schema: typeof SECURE_CLINICAL_INTEROP_SCHEMA;
  method: typeof SECURE_CLINICAL_INTEROP_METHOD;
  version: typeof SECURE_CLINICAL_INTEROP_VERSION;
  id: string;
  dataSourceId: string;
  legalBasis: LegalBasis;
  researchAuthorisationRef: string | null;
  controllerRole: ControllerProcessorRole;
  processorRole: ControllerProcessorRole;
  controllerName: string;
  processorName: string;
  purposeLimitation: string;
  accessPermissions: readonly AccessPermission[];
  dataMinimisationStatement: string;
  exportRestrictions: string;
  retentionPolicyRef: string;
  auditHistory: readonly string[];
  pseudonymisedMayStillBePersonalData: true;
  authoredBy: InteropActor;
  honesty: SecureClinicalInteropHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type SecureClinicalDataInteropStore = {
  upsertDataSource(source: DataSourceRegistration): DataSourceRegistration;
  getDataSource(id: string): DataSourceRegistration | null;
  listDataSources(): readonly DataSourceRegistration[];
  upsertPermission(
    permission: DataUsePermissionRecord,
  ): DataUsePermissionRecord;
  getPermission(id: string): DataUsePermissionRecord | null;
  listPermissions(dataSourceId?: string): readonly DataUsePermissionRecord[];
  upsertSchemaMapping(mapping: SchemaMappingRecord): SchemaMappingRecord;
  getSchemaMapping(id: string): SchemaMappingRecord | null;
  listSchemaMappings(dataSourceId?: string): readonly SchemaMappingRecord[];
  upsertTerminologyMapping(
    mapping: TerminologyMappingRecord,
  ): TerminologyMappingRecord;
  getTerminologyMapping(id: string): TerminologyMappingRecord | null;
  listTerminologyMappings(
    dataSourceId?: string,
  ): readonly TerminologyMappingRecord[];
  upsertUnitNormalisation(
    record: UnitNormalisationRecord,
  ): UnitNormalisationRecord;
  getUnitNormalisation(id: string): UnitNormalisationRecord | null;
  listUnitNormalisations(
    dataSourceId?: string,
  ): readonly UnitNormalisationRecord[];
  upsertTemporalAlignment(
    record: TemporalAlignmentRecord,
  ): TemporalAlignmentRecord;
  getTemporalAlignment(id: string): TemporalAlignmentRecord | null;
  listTemporalAlignments(
    dataSourceId?: string,
  ): readonly TemporalAlignmentRecord[];
  upsertQualityValidation(
    record: DataQualityValidationRecord,
  ): DataQualityValidationRecord;
  getQualityValidation(id: string): DataQualityValidationRecord | null;
  listQualityValidations(
    dataSourceId?: string,
  ): readonly DataQualityValidationRecord[];
  upsertProvenance(record: SourceProvenanceRecord): SourceProvenanceRecord;
  getProvenance(id: string): SourceProvenanceRecord | null;
  listProvenance(dataSourceId?: string): readonly SourceProvenanceRecord[];
  upsertAccessEnforcement(
    record: AccessEnforcementRecord,
  ): AccessEnforcementRecord;
  getAccessEnforcement(id: string): AccessEnforcementRecord | null;
  listAccessEnforcements(
    dataSourceId?: string,
  ): readonly AccessEnforcementRecord[];
  upsertRetention(record: RetentionDeletionRecord): RetentionDeletionRecord;
  getRetention(id: string): RetentionDeletionRecord | null;
  listRetentions(dataSourceId?: string): readonly RetentionDeletionRecord[];
  upsertGovernance(record: InteropGovernanceRecord): InteropGovernanceRecord;
  getGovernance(id: string): InteropGovernanceRecord | null;
  listGovernance(dataSourceId?: string): readonly InteropGovernanceRecord[];
};

const DEFAULT_HONESTY: SecureClinicalInteropHonesty = {
  researchDecisionSupportOnly: true,
  noUnrestrictedCentralPatientDatabase: true,
  noLivePhiIngestion: true,
  noEhrWriteBackOrCds: true,
  noLiveConnectorClaimWithoutVerification: true,
  federationNotOperationalUnlessVerified: true,
  pseudonymisedMayStillBePersonalData: true,
  identifiableRecordsOutsideScientificKg: true,
  noFabricatedClinicalResults: true,
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

const SOURCE_TRANSITIONS: Record<
  DataSourceLifecycle,
  readonly DataSourceLifecycle[]
> = {
  draft: ["registered", "permission_blocked", "connector_unverified", "rejected"],
  registered: ["permission_blocked", "connector_unverified", "retired"],
  permission_blocked: ["draft", "retired", "rejected"],
  connector_unverified: ["registered", "retired", "rejected"],
  retired: [],
  rejected: ["retired"],
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

function assertOptionalRef(
  value: string | null | undefined,
  label: string,
  pattern: RegExp = REF_ID_RE,
): string | null {
  if (value === undefined || value === null) return null;
  if (!pattern.test(value)) throw Error(`Invalid ${label}`);
  return value;
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

function assertPermissionList(
  values: readonly AccessPermission[],
): readonly AccessPermission[] {
  if (values.length === 0 || values.length > ACCESS_PERMISSIONS.length) {
    throw Error("Invalid permissions list");
  }
  const seen = new Set<string>();
  for (const p of values) {
    assertClosed(p, ACCESS_PERMISSIONS, "access permission");
    if (seen.has(p)) throw Error("Duplicate access permission");
    seen.add(p);
  }
  return values;
}

function assertActor(actor: InteropActor, label: string): InteropActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principal`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actor kind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}

function assertHonesty(honesty: SecureClinicalInteropHonesty): void {
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Must remain research decision support only");
  }
  if (honesty.noUnrestrictedCentralPatientDatabase !== true) {
    throw Error("Unrestricted central patient database forbidden");
  }
  if (honesty.noLivePhiIngestion !== true) {
    throw Error("Live PHI ingestion forbidden");
  }
  if (honesty.noEhrWriteBackOrCds !== true) {
    throw Error("EHR write-back / CDS forbidden");
  }
  if (honesty.noLiveConnectorClaimWithoutVerification !== true) {
    throw Error("Live connector claims without verification forbidden");
  }
  if (honesty.federationNotOperationalUnlessVerified !== true) {
    throw Error("Federation must remain non-operational unless verified");
  }
  if (honesty.pseudonymisedMayStillBePersonalData !== true) {
    throw Error("Pseudonymised data may still be personal data");
  }
  if (honesty.identifiableRecordsOutsideScientificKg !== true) {
    throw Error("Identifiable records must stay outside scientific KG");
  }
  if (honesty.noFabricatedClinicalResults !== true) {
    throw Error("Fabricated clinical results forbidden");
  }
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
    /\blive\s+(fhir|omop|ehr|connector)\b/.test(lower) ||
    /\b(fhir|omop|ehr|connector)\s+(operational|connected|verified)\b/.test(
      lower,
    ) ||
    /\bfederation\s+(live|operational)\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower) ||
    /\bunrestricted\s+patient\s+(db|database)\b/.test(lower) ||
    /\bphi\s+ingested\b/.test(lower) ||
    /\behr\s+write[- ]?back\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bhazard\s*ratio\s*=\s*[\d.]+\b/.test(lower) ||
    /\bprescribe\b/.test(lower) ||
    /\btreatment\s+recommendation\b/.test(lower)
  ) {
    throw Error(
      `${label} must not claim live connectors, ingest PHI, invent clinical results, or issue treatment directives`,
    );
  }
}

function defaultLifecycleForConnector(
  connectorStatus: ConnectorStatus,
): DataSourceLifecycle {
  switch (connectorStatus) {
    case "contract_only":
    case "fixture_mapping":
      return "draft";
    case "unverified_not_operational":
      return "connector_unverified";
    case "blocked_no_authorised_dataset":
      return "permission_blocked";
    default: {
      const _exhaustive: never = connectorStatus;
      throw Error(`Unhandled connector status: ${_exhaustive}`);
    }
  }
}

export function draftDataSourceRegistration(input: {
  id: string;
  displayName: string;
  sourceKind: DataSourceKind;
  schemaProfile: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: InteropActorKind;
  createdAt: string;
  connectorStatus?: ConnectorStatus;
  permittedPurposes?: readonly string[];
  orgId?: string | null;
  rweStudyId?: string | null;
  dataBasis?: InteropDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): DataSourceRegistration {
  if (!SOURCE_ID_RE.test(input.id)) throw Error("Invalid data source id");
  if (!textOk(input.displayName, 240)) throw Error("Invalid displayName");
  assertClosed(input.sourceKind, DATA_SOURCE_KINDS, "source kind");
  if (!textOk(input.schemaProfile, 240)) throw Error("Invalid schemaProfile");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(input.schemaProfile, "schemaProfile");
  const connectorStatus = input.connectorStatus ?? "contract_only";
  assertClosed(connectorStatus, CONNECTOR_STATUSES, "connector status");
  const permittedPurposes = assertStringList(
    input.permittedPurposes ?? ["engineering_fixture_mapping"],
    "permittedPurposes",
    12,
    240,
  );
  for (const p of permittedPurposes) {
    assertNoForbiddenClaimLanguage(p, "permittedPurpose");
  }
  const orgId = assertOptionalRef(input.orgId, "orgId", ORG_RE);
  const rweStudyId = assertOptionalRef(
    input.rweStudyId,
    "rweStudyId",
    RWE_STUDY_RE,
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? "fixture_engineering";
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty = input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && fixtureHonesty !== true) {
    throw Error("Fixture data basis requires fixtureHonesty");
  }
  if (input.note) assertNoForbiddenClaimLanguage(input.note, "note");

  const source: DataSourceRegistration = {
    schema: SECURE_CLINICAL_INTEROP_SCHEMA,
    method: SECURE_CLINICAL_INTEROP_METHOD,
    version: SECURE_CLINICAL_INTEROP_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    sourceKind: input.sourceKind,
    schemaProfile: input.schemaProfile.trim(),
    connectorStatus,
    lifecycle: defaultLifecycleForConnector(connectorStatus),
    liveConnectorOperational: false,
    containsIdentifiablePhi: false,
    permittedPurposes,
    orgId,
    rweStudyId,
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
  return validateDataSourceRegistration(source);
}

export function validateDataSourceRegistration(
  source: DataSourceRegistration,
): DataSourceRegistration {
  if (!SOURCE_ID_RE.test(source.id)) throw Error("Invalid data source id");
  assertClosed(source.sourceKind, DATA_SOURCE_KINDS, "source kind");
  assertClosed(source.connectorStatus, CONNECTOR_STATUSES, "connector status");
  assertClosed(source.lifecycle, DATA_SOURCE_LIFECYCLES, "lifecycle");
  if (source.liveConnectorOperational !== false) {
    throw Error("Live connector must remain non-operational in PR2");
  }
  if (source.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI registration forbidden");
  }
  if (
    source.connectorStatus === "blocked_no_authorised_dataset" &&
    source.lifecycle !== "permission_blocked"
  ) {
    throw Error("Blocked dataset sources must use permission_blocked lifecycle");
  }
  if (
    source.connectorStatus === "unverified_not_operational" &&
    source.lifecycle === "registered" &&
    source.liveConnectorOperational !== false
  ) {
    throw Error("Unverified connectors cannot be live");
  }
  assertHonesty(source.honesty);
  assertActor(source.authoredBy, "author");
  return source;
}

export function transitionDataSourceRegistration(input: {
  source: DataSourceRegistration;
  to: DataSourceLifecycle;
  updatedAt: string;
  actor: InteropActor;
}): DataSourceRegistration {
  const current = validateDataSourceRegistration(input.source);
  assertClosed(input.to, DATA_SOURCE_LIFECYCLES, "lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = SOURCE_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal data-source transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (input.to === "registered" && actor.actorKind !== "human") {
    throw Error("Only humans may register data sources");
  }
  if (
    input.to === "registered" &&
    current.connectorStatus === "blocked_no_authorised_dataset"
  ) {
    throw Error("Cannot register source while authorised dataset is blocked");
  }
  return validateDataSourceRegistration({
    ...current,
    lifecycle: input.to,
    updatedAt: input.updatedAt,
  });
}

export function draftDataUsePermission(input: {
  id: string;
  dataSource: DataSourceRegistration;
  legalBasis: LegalBasis;
  purpose: string;
  purposeLimitation: string;
  permissions: readonly AccessPermission[];
  dataMinimisationStatement: string;
  exportRestrictions: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: InteropActorKind;
  createdAt: string;
  researchAuthorisationRef?: string | null;
  note?: string;
}): DataUsePermissionRecord {
  if (!PERMISSION_ID_RE.test(input.id)) throw Error("Invalid permission id");
  const source = validateDataSourceRegistration(input.dataSource);
  assertClosed(input.legalBasis, LEGAL_BASES, "legal basis");
  if (!textOk(input.purpose, 1000)) throw Error("Invalid purpose");
  if (!textOk(input.purposeLimitation, 1000)) {
    throw Error("Invalid purposeLimitation");
  }
  if (!textOk(input.dataMinimisationStatement, 1000)) {
    throw Error("Invalid dataMinimisationStatement");
  }
  if (!textOk(input.exportRestrictions, 1000)) {
    throw Error("Invalid exportRestrictions");
  }
  assertNoForbiddenClaimLanguage(input.purpose, "purpose");
  assertNoForbiddenClaimLanguage(input.purposeLimitation, "purposeLimitation");
  const permissions = assertPermissionList(input.permissions);
  const researchAuthorisationRef = assertOptionalRef(
    input.researchAuthorisationRef,
    "researchAuthorisationRef",
  );
  if (
    input.legalBasis === "declared_research_authorisation_ref" &&
    !researchAuthorisationRef
  ) {
    throw Error("researchAuthorisationRef required for declared authorisation");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actorKind = input.authoredByActorKind ?? "ai_agent";

  const permitted =
    input.legalBasis !== "not_established" &&
    source.connectorStatus !== "blocked_no_authorised_dataset" &&
    source.lifecycle !== "permission_blocked" &&
    source.lifecycle !== "rejected";

  const denyReason = permitted
    ? null
    : source.connectorStatus === "blocked_no_authorised_dataset" ||
        source.lifecycle === "permission_blocked"
      ? "Authorised clinical dataset not supplied"
      : input.legalBasis === "not_established"
        ? "Legal basis not established"
        : "Data-use permission denied";

  const record: DataUsePermissionRecord = {
    schema: SECURE_CLINICAL_INTEROP_SCHEMA,
    method: SECURE_CLINICAL_INTEROP_METHOD,
    version: SECURE_CLINICAL_INTEROP_VERSION,
    id: input.id,
    dataSourceId: source.id,
    legalBasis: input.legalBasis,
    researchAuthorisationRef,
    purpose: input.purpose.trim(),
    purposeLimitation: input.purposeLimitation.trim(),
    permissions,
    dataMinimisationStatement: input.dataMinimisationStatement.trim(),
    exportRestrictions: input.exportRestrictions.trim(),
    permitted,
    denyReason,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateDataUsePermission(record);
}

export function validateDataUsePermission(
  record: DataUsePermissionRecord,
): DataUsePermissionRecord {
  if (!PERMISSION_ID_RE.test(record.id)) throw Error("Invalid permission id");
  if (!SOURCE_ID_RE.test(record.dataSourceId)) {
    throw Error("Invalid permission dataSourceId");
  }
  assertClosed(record.legalBasis, LEGAL_BASES, "legal basis");
  assertPermissionList(record.permissions);
  if (record.permitted && record.denyReason !== null) {
    throw Error("Permitted records must not carry denyReason");
  }
  if (!record.permitted && !record.denyReason) {
    throw Error("Denied records require denyReason");
  }
  assertHonesty(record.honesty);
  return record;
}

export function checkDataUsePermission(input: {
  permission: DataUsePermissionRecord;
  requestedPermission: AccessPermission;
}): {allowed: boolean; reason: string} {
  const permission = validateDataUsePermission(input.permission);
  assertClosed(
    input.requestedPermission,
    ACCESS_PERMISSIONS,
    "requested permission",
  );
  if (!permission.permitted) {
    return {
      allowed: false,
      reason: permission.denyReason ?? "Data-use permission denied",
    };
  }
  if (!permission.permissions.includes(input.requestedPermission)) {
    return {
      allowed: false,
      reason: `Permission ${input.requestedPermission} not granted`,
    };
  }
  return {allowed: true, reason: "Permission granted under declared purpose"};
}

export function draftSchemaMapping(input: {
  id: string;
  dataSource: DataSourceRegistration;
  sourceFieldPath: string;
  targetModel: SchemaTargetModel;
  targetFieldPath: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: InteropActorKind;
  createdAt: string;
  mappingConfidence?: MappingConfidence;
  note?: string;
}): SchemaMappingRecord {
  if (!SCHEMA_MAP_ID_RE.test(input.id)) throw Error("Invalid schema mapping id");
  const source = validateDataSourceRegistration(input.dataSource);
  if (!textOk(input.sourceFieldPath, 240)) {
    throw Error("Invalid sourceFieldPath");
  }
  if (!textOk(input.targetFieldPath, 240)) {
    throw Error("Invalid targetFieldPath");
  }
  assertClosed(input.targetModel, SCHEMA_TARGET_MODELS, "target model");
  const mappingConfidence = input.mappingConfidence ?? "inexact";
  assertClosed(mappingConfidence, MAPPING_CONFIDENCES, "mapping confidence");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  if (input.note) assertNoForbiddenClaimLanguage(input.note, "note");

  const record: SchemaMappingRecord = {
    schema: SECURE_CLINICAL_INTEROP_SCHEMA,
    method: SECURE_CLINICAL_INTEROP_METHOD,
    version: SECURE_CLINICAL_INTEROP_VERSION,
    id: input.id,
    dataSourceId: source.id,
    sourceFieldPath: input.sourceFieldPath.trim(),
    targetModel: input.targetModel,
    targetFieldPath: input.targetFieldPath.trim(),
    mappingConfidence,
    liveTransformOperational: false,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateSchemaMapping(record);
}

export function validateSchemaMapping(
  record: SchemaMappingRecord,
): SchemaMappingRecord {
  if (!SCHEMA_MAP_ID_RE.test(record.id)) throw Error("Invalid schema mapping id");
  if (!SOURCE_ID_RE.test(record.dataSourceId)) {
    throw Error("Invalid schema mapping dataSourceId");
  }
  assertClosed(record.targetModel, SCHEMA_TARGET_MODELS, "target model");
  assertClosed(
    record.mappingConfidence,
    MAPPING_CONFIDENCES,
    "mapping confidence",
  );
  if (record.liveTransformOperational !== false) {
    throw Error("Live schema transforms forbidden in PR2");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftTerminologyMapping(input: {
  id: string;
  dataSource: DataSourceRegistration;
  sourceSystem: TerminologySystem;
  sourceCode: string;
  targetSystem: TerminologySystem;
  targetCode: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: InteropActorKind;
  createdAt: string;
  mappingConfidence?: MappingConfidence;
  note?: string;
}): TerminologyMappingRecord {
  if (!TERM_MAP_ID_RE.test(input.id)) {
    throw Error("Invalid terminology mapping id");
  }
  const source = validateDataSourceRegistration(input.dataSource);
  assertClosed(input.sourceSystem, TERMINOLOGY_SYSTEMS, "source system");
  assertClosed(input.targetSystem, TERMINOLOGY_SYSTEMS, "target system");
  if (!textOk(input.sourceCode, 120)) throw Error("Invalid sourceCode");
  if (!textOk(input.targetCode, 120)) throw Error("Invalid targetCode");
  const mappingConfidence = input.mappingConfidence ?? "inexact";
  assertClosed(mappingConfidence, MAPPING_CONFIDENCES, "mapping confidence");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actorKind = input.authoredByActorKind ?? "ai_agent";

  const record: TerminologyMappingRecord = {
    schema: SECURE_CLINICAL_INTEROP_SCHEMA,
    method: SECURE_CLINICAL_INTEROP_METHOD,
    version: SECURE_CLINICAL_INTEROP_VERSION,
    id: input.id,
    dataSourceId: source.id,
    sourceSystem: input.sourceSystem,
    sourceCode: input.sourceCode.trim(),
    targetSystem: input.targetSystem,
    targetCode: input.targetCode.trim(),
    mappingConfidence,
    liveLookupOperational: false,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateTerminologyMapping(record);
}

export function validateTerminologyMapping(
  record: TerminologyMappingRecord,
): TerminologyMappingRecord {
  if (!TERM_MAP_ID_RE.test(record.id)) {
    throw Error("Invalid terminology mapping id");
  }
  if (!SOURCE_ID_RE.test(record.dataSourceId)) {
    throw Error("Invalid terminology mapping dataSourceId");
  }
  assertClosed(record.sourceSystem, TERMINOLOGY_SYSTEMS, "source system");
  assertClosed(record.targetSystem, TERMINOLOGY_SYSTEMS, "target system");
  if (record.liveLookupOperational !== false) {
    throw Error("Live terminology lookup forbidden in PR2");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftUnitNormalisation(input: {
  id: string;
  dataSource: DataSourceRegistration;
  sourceUnit: string;
  targetUnit: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: InteropActorKind;
  createdAt: string;
  conversionFactorDeclared?: string | null;
  note?: string;
}): UnitNormalisationRecord {
  if (!UNIT_ID_RE.test(input.id)) throw Error("Invalid unit normalisation id");
  const source = validateDataSourceRegistration(input.dataSource);
  if (!textOk(input.sourceUnit, 64)) throw Error("Invalid sourceUnit");
  if (!textOk(input.targetUnit, 64)) throw Error("Invalid targetUnit");
  const conversionFactorDeclared =
    input.conversionFactorDeclared === undefined
      ? null
      : input.conversionFactorDeclared === null
        ? null
        : (() => {
            if (!textOk(input.conversionFactorDeclared, 64)) {
              throw Error("Invalid conversionFactorDeclared");
            }
            return input.conversionFactorDeclared.trim();
          })();
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actorKind = input.authoredByActorKind ?? "ai_agent";

  const record: UnitNormalisationRecord = {
    schema: SECURE_CLINICAL_INTEROP_SCHEMA,
    method: SECURE_CLINICAL_INTEROP_METHOD,
    version: SECURE_CLINICAL_INTEROP_VERSION,
    id: input.id,
    dataSourceId: source.id,
    sourceUnit: input.sourceUnit.trim(),
    targetUnit: input.targetUnit.trim(),
    conversionFactorDeclared,
    conversionVerified: false,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateUnitNormalisation(record);
}

export function validateUnitNormalisation(
  record: UnitNormalisationRecord,
): UnitNormalisationRecord {
  if (!UNIT_ID_RE.test(record.id)) throw Error("Invalid unit normalisation id");
  if (!SOURCE_ID_RE.test(record.dataSourceId)) {
    throw Error("Invalid unit normalisation dataSourceId");
  }
  if (record.conversionVerified !== false) {
    throw Error("Unit conversion verification forbidden without authorised data");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftTemporalAlignment(input: {
  id: string;
  dataSource: DataSourceRegistration;
  sourceTimezone: string;
  targetTimezone: string;
  eventTimeField: string;
  observationTimeField: string;
  alignmentRule: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: InteropActorKind;
  createdAt: string;
  note?: string;
}): TemporalAlignmentRecord {
  if (!TEMPORAL_ID_RE.test(input.id)) {
    throw Error("Invalid temporal alignment id");
  }
  const source = validateDataSourceRegistration(input.dataSource);
  for (const [label, value] of Object.entries({
    sourceTimezone: input.sourceTimezone,
    targetTimezone: input.targetTimezone,
    eventTimeField: input.eventTimeField,
    observationTimeField: input.observationTimeField,
    alignmentRule: input.alignmentRule,
  })) {
    if (!textOk(value, 240)) throw Error(`Invalid ${label}`);
    assertNoForbiddenClaimLanguage(value, label);
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actorKind = input.authoredByActorKind ?? "ai_agent";

  const record: TemporalAlignmentRecord = {
    schema: SECURE_CLINICAL_INTEROP_SCHEMA,
    method: SECURE_CLINICAL_INTEROP_METHOD,
    version: SECURE_CLINICAL_INTEROP_VERSION,
    id: input.id,
    dataSourceId: source.id,
    sourceTimezone: input.sourceTimezone.trim(),
    targetTimezone: input.targetTimezone.trim(),
    eventTimeField: input.eventTimeField.trim(),
    observationTimeField: input.observationTimeField.trim(),
    alignmentRule: input.alignmentRule.trim(),
    liveAlignmentOperational: false,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateTemporalAlignment(record);
}

export function validateTemporalAlignment(
  record: TemporalAlignmentRecord,
): TemporalAlignmentRecord {
  if (!TEMPORAL_ID_RE.test(record.id)) {
    throw Error("Invalid temporal alignment id");
  }
  if (!SOURCE_ID_RE.test(record.dataSourceId)) {
    throw Error("Invalid temporal alignment dataSourceId");
  }
  if (record.liveAlignmentOperational !== false) {
    throw Error("Live temporal alignment forbidden in PR2");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftDataQualityValidation(input: {
  id: string;
  dataSource: DataSourceRegistration;
  checksPerformed: readonly string[];
  qualityStatus: QualityStatus;
  authoredByPrincipalId: string;
  authoredByActorKind?: InteropActorKind;
  createdAt: string;
  failures?: readonly string[];
  note?: string;
}): DataQualityValidationRecord {
  if (!QUALITY_ID_RE.test(input.id)) throw Error("Invalid quality validation id");
  const source = validateDataSourceRegistration(input.dataSource);
  assertClosed(input.qualityStatus, QUALITY_STATUSES, "quality status");
  const checksPerformed = assertStringList(
    input.checksPerformed,
    "checksPerformed",
    32,
    240,
  );
  if (checksPerformed.length === 0) throw Error("checksPerformed required");
  const failures = assertStringList(
    input.failures ?? [],
    "failures",
    32,
    240,
  );
  if (input.qualityStatus === "failed_checks" && failures.length === 0) {
    throw Error("failed_checks requires failures");
  }
  if (input.qualityStatus === "passed_declared_checks" && failures.length > 0) {
    throw Error("passed_declared_checks cannot include failures");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  for (const c of checksPerformed) {
    assertNoForbiddenClaimLanguage(c, "check");
  }

  const record: DataQualityValidationRecord = {
    schema: SECURE_CLINICAL_INTEROP_SCHEMA,
    method: SECURE_CLINICAL_INTEROP_METHOD,
    version: SECURE_CLINICAL_INTEROP_VERSION,
    id: input.id,
    dataSourceId: source.id,
    checksPerformed,
    qualityStatus: input.qualityStatus,
    failures,
    fabricatedResults: null,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateDataQualityValidation(record);
}

export function validateDataQualityValidation(
  record: DataQualityValidationRecord,
): DataQualityValidationRecord {
  if (!QUALITY_ID_RE.test(record.id)) {
    throw Error("Invalid quality validation id");
  }
  if (!SOURCE_ID_RE.test(record.dataSourceId)) {
    throw Error("Invalid quality validation dataSourceId");
  }
  assertClosed(record.qualityStatus, QUALITY_STATUSES, "quality status");
  if (record.fabricatedResults !== null) {
    throw Error("Fabricated clinical quality results forbidden");
  }
  assertHonesty(record.honesty);
  return record;
}

export function draftSourceProvenance(input: {
  id: string;
  dataSource: DataSourceRegistration;
  provenanceSummary: string;
  upstreamSystem: string;
  capturedAt: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: InteropActorKind;
  createdAt: string;
  lineageRefs?: readonly string[];
  note?: string;
}): SourceProvenanceRecord {
  if (!PROVENANCE_ID_RE.test(input.id)) throw Error("Invalid provenance id");
  const source = validateDataSourceRegistration(input.dataSource);
  if (!textOk(input.provenanceSummary, 2000)) {
    throw Error("Invalid provenanceSummary");
  }
  if (!textOk(input.upstreamSystem, 240)) throw Error("Invalid upstreamSystem");
  assertNoForbiddenClaimLanguage(input.provenanceSummary, "provenanceSummary");
  assertNoForbiddenClaimLanguage(input.upstreamSystem, "upstreamSystem");
  if (!isIsoTimestamp(input.capturedAt)) throw Error("Invalid capturedAt");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const lineageRefs = assertStringList(
    input.lineageRefs ?? [],
    "lineageRefs",
    32,
    160,
  );
  const actorKind = input.authoredByActorKind ?? "ai_agent";

  const record: SourceProvenanceRecord = {
    schema: SECURE_CLINICAL_INTEROP_SCHEMA,
    method: SECURE_CLINICAL_INTEROP_METHOD,
    version: SECURE_CLINICAL_INTEROP_VERSION,
    id: input.id,
    dataSourceId: source.id,
    provenanceSummary: input.provenanceSummary.trim(),
    upstreamSystem: input.upstreamSystem.trim(),
    capturedAt: input.capturedAt,
    lineageRefs,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateSourceProvenance(record);
}

export function validateSourceProvenance(
  record: SourceProvenanceRecord,
): SourceProvenanceRecord {
  if (!PROVENANCE_ID_RE.test(record.id)) throw Error("Invalid provenance id");
  if (!SOURCE_ID_RE.test(record.dataSourceId)) {
    throw Error("Invalid provenance dataSourceId");
  }
  if (!isIsoTimestamp(record.capturedAt)) throw Error("Invalid capturedAt");
  assertHonesty(record.honesty);
  return record;
}

export function enforceAccess(input: {
  id: string;
  dataSource: DataSourceRegistration;
  permission: DataUsePermissionRecord;
  requestedPermission: AccessPermission;
  actor: InteropActor;
  createdAt: string;
  note?: string;
}): AccessEnforcementRecord {
  if (!ACCESS_ID_RE.test(input.id)) throw Error("Invalid access enforcement id");
  const source = validateDataSourceRegistration(input.dataSource);
  const permission = validateDataUsePermission(input.permission);
  if (permission.dataSourceId !== source.id) {
    throw Error("Permission record does not match data source");
  }
  assertClosed(
    input.requestedPermission,
    ACCESS_PERMISSIONS,
    "requested permission",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actor = assertActor(input.actor, "access actor");
  const check = checkDataUsePermission({
    permission,
    requestedPermission: input.requestedPermission,
  });
  const decision: AccessDecision = check.allowed ? "permit" : "deny";

  const record: AccessEnforcementRecord = {
    schema: SECURE_CLINICAL_INTEROP_SCHEMA,
    method: SECURE_CLINICAL_INTEROP_METHOD,
    version: SECURE_CLINICAL_INTEROP_VERSION,
    id: input.id,
    dataSourceId: source.id,
    permissionRecordId: permission.id,
    requestedPermission: input.requestedPermission,
    decision,
    denyReason: check.allowed ? null : check.reason,
    actor,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateAccessEnforcement(record);
}

export function validateAccessEnforcement(
  record: AccessEnforcementRecord,
): AccessEnforcementRecord {
  if (!ACCESS_ID_RE.test(record.id)) {
    throw Error("Invalid access enforcement id");
  }
  if (!SOURCE_ID_RE.test(record.dataSourceId)) {
    throw Error("Invalid access dataSourceId");
  }
  if (!PERMISSION_ID_RE.test(record.permissionRecordId)) {
    throw Error("Invalid permissionRecordId");
  }
  assertClosed(record.decision, ACCESS_DECISIONS, "access decision");
  assertClosed(
    record.requestedPermission,
    ACCESS_PERMISSIONS,
    "requested permission",
  );
  if (record.decision === "permit" && record.denyReason !== null) {
    throw Error("Permit decisions must not carry denyReason");
  }
  if (record.decision === "deny" && !record.denyReason) {
    throw Error("Deny decisions require denyReason");
  }
  assertHonesty(record.honesty);
  assertActor(record.actor, "access actor");
  return record;
}

export function draftRetentionDeletion(input: {
  id: string;
  dataSource: DataSourceRegistration;
  retentionPolicyRef: string;
  retentionAction: RetentionAction;
  authoredByPrincipalId: string;
  authoredByActorKind?: InteropActorKind;
  createdAt: string;
  retainUntil?: string | null;
  deletionCompletedAt?: string | null;
  note?: string;
}): RetentionDeletionRecord {
  if (!RETENTION_ID_RE.test(input.id)) throw Error("Invalid retention id");
  const source = validateDataSourceRegistration(input.dataSource);
  if (!textOk(input.retentionPolicyRef, 240)) {
    throw Error("Invalid retentionPolicyRef");
  }
  assertClosed(input.retentionAction, RETENTION_ACTIONS, "retention action");
  const retainUntil =
    input.retainUntil === undefined || input.retainUntil === null
      ? null
      : (() => {
          if (!isIsoTimestamp(input.retainUntil)) {
            throw Error("Invalid retainUntil");
          }
          return input.retainUntil;
        })();
  const deletionCompletedAt =
    input.deletionCompletedAt === undefined ||
    input.deletionCompletedAt === null
      ? null
      : (() => {
          if (!isIsoTimestamp(input.deletionCompletedAt)) {
            throw Error("Invalid deletionCompletedAt");
          }
          return input.deletionCompletedAt;
        })();
  if (
    input.retentionAction === "delete_completed" &&
    deletionCompletedAt === null
  ) {
    throw Error("delete_completed requires deletionCompletedAt");
  }
  if (
    input.retentionAction === "retain_under_policy" &&
    deletionCompletedAt !== null
  ) {
    throw Error("retain_under_policy cannot set deletionCompletedAt");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actorKind = input.authoredByActorKind ?? "ai_agent";

  const record: RetentionDeletionRecord = {
    schema: SECURE_CLINICAL_INTEROP_SCHEMA,
    method: SECURE_CLINICAL_INTEROP_METHOD,
    version: SECURE_CLINICAL_INTEROP_VERSION,
    id: input.id,
    dataSourceId: source.id,
    retentionPolicyRef: input.retentionPolicyRef.trim(),
    retentionAction: input.retentionAction,
    retainUntil,
    deletionCompletedAt,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateRetentionDeletion(record);
}

export function validateRetentionDeletion(
  record: RetentionDeletionRecord,
): RetentionDeletionRecord {
  if (!RETENTION_ID_RE.test(record.id)) throw Error("Invalid retention id");
  if (!SOURCE_ID_RE.test(record.dataSourceId)) {
    throw Error("Invalid retention dataSourceId");
  }
  assertClosed(record.retentionAction, RETENTION_ACTIONS, "retention action");
  assertHonesty(record.honesty);
  return record;
}

export function draftInteropGovernance(input: {
  id: string;
  dataSource: DataSourceRegistration;
  legalBasis: LegalBasis;
  controllerRole: ControllerProcessorRole;
  processorRole: ControllerProcessorRole;
  controllerName: string;
  processorName: string;
  purposeLimitation: string;
  accessPermissions: readonly AccessPermission[];
  dataMinimisationStatement: string;
  exportRestrictions: string;
  retentionPolicyRef: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: InteropActorKind;
  createdAt: string;
  researchAuthorisationRef?: string | null;
  auditHistory?: readonly string[];
  note?: string;
}): InteropGovernanceRecord {
  if (!GOV_ID_RE.test(input.id)) throw Error("Invalid governance id");
  const source = validateDataSourceRegistration(input.dataSource);
  assertClosed(input.legalBasis, LEGAL_BASES, "legal basis");
  assertClosed(
    input.controllerRole,
    CONTROLLER_PROCESSOR_ROLES,
    "controller role",
  );
  assertClosed(
    input.processorRole,
    CONTROLLER_PROCESSOR_ROLES,
    "processor role",
  );
  for (const [label, value] of Object.entries({
    controllerName: input.controllerName,
    processorName: input.processorName,
    purposeLimitation: input.purposeLimitation,
    dataMinimisationStatement: input.dataMinimisationStatement,
    exportRestrictions: input.exportRestrictions,
    retentionPolicyRef: input.retentionPolicyRef,
  })) {
    if (!textOk(value, 1000)) throw Error(`Invalid ${label}`);
    assertNoForbiddenClaimLanguage(value, label);
  }
  const accessPermissions = assertPermissionList(input.accessPermissions);
  const researchAuthorisationRef = assertOptionalRef(
    input.researchAuthorisationRef,
    "researchAuthorisationRef",
  );
  if (
    input.legalBasis === "declared_research_authorisation_ref" &&
    !researchAuthorisationRef
  ) {
    throw Error("researchAuthorisationRef required for declared authorisation");
  }
  const auditHistory = assertStringList(
    input.auditHistory ?? ["governance draft created"],
    "auditHistory",
    64,
    500,
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actorKind = input.authoredByActorKind ?? "ai_agent";

  const record: InteropGovernanceRecord = {
    schema: SECURE_CLINICAL_INTEROP_SCHEMA,
    method: SECURE_CLINICAL_INTEROP_METHOD,
    version: SECURE_CLINICAL_INTEROP_VERSION,
    id: input.id,
    dataSourceId: source.id,
    legalBasis: input.legalBasis,
    researchAuthorisationRef,
    controllerRole: input.controllerRole,
    processorRole: input.processorRole,
    controllerName: input.controllerName.trim(),
    processorName: input.processorName.trim(),
    purposeLimitation: input.purposeLimitation.trim(),
    accessPermissions,
    dataMinimisationStatement: input.dataMinimisationStatement.trim(),
    exportRestrictions: input.exportRestrictions.trim(),
    retentionPolicyRef: input.retentionPolicyRef.trim(),
    auditHistory,
    pseudonymisedMayStillBePersonalData: true,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateInteropGovernance(record);
}

export function validateInteropGovernance(
  record: InteropGovernanceRecord,
): InteropGovernanceRecord {
  if (!GOV_ID_RE.test(record.id)) throw Error("Invalid governance id");
  if (!SOURCE_ID_RE.test(record.dataSourceId)) {
    throw Error("Invalid governance dataSourceId");
  }
  assertClosed(record.legalBasis, LEGAL_BASES, "legal basis");
  assertClosed(
    record.controllerRole,
    CONTROLLER_PROCESSOR_ROLES,
    "controller role",
  );
  assertClosed(
    record.processorRole,
    CONTROLLER_PROCESSOR_ROLES,
    "processor role",
  );
  if (record.pseudonymisedMayStillBePersonalData !== true) {
    throw Error("Pseudonymised data may still be personal data");
  }
  assertPermissionList(record.accessPermissions);
  assertHonesty(record.honesty);
  return record;
}

export function createMemorySecureClinicalDataInteropStore(): SecureClinicalDataInteropStore & {
  dataSources: Map<string, DataSourceRegistration>;
  permissions: Map<string, DataUsePermissionRecord>;
  schemaMappings: Map<string, SchemaMappingRecord>;
  terminologyMappings: Map<string, TerminologyMappingRecord>;
  unitNormalisations: Map<string, UnitNormalisationRecord>;
  temporalAlignments: Map<string, TemporalAlignmentRecord>;
  qualityValidations: Map<string, DataQualityValidationRecord>;
  provenance: Map<string, SourceProvenanceRecord>;
  accessEnforcements: Map<string, AccessEnforcementRecord>;
  retentions: Map<string, RetentionDeletionRecord>;
  governance: Map<string, InteropGovernanceRecord>;
} {
  const dataSources = new Map<string, DataSourceRegistration>();
  const permissions = new Map<string, DataUsePermissionRecord>();
  const schemaMappings = new Map<string, SchemaMappingRecord>();
  const terminologyMappings = new Map<string, TerminologyMappingRecord>();
  const unitNormalisations = new Map<string, UnitNormalisationRecord>();
  const temporalAlignments = new Map<string, TemporalAlignmentRecord>();
  const qualityValidations = new Map<string, DataQualityValidationRecord>();
  const provenance = new Map<string, SourceProvenanceRecord>();
  const accessEnforcements = new Map<string, AccessEnforcementRecord>();
  const retentions = new Map<string, RetentionDeletionRecord>();
  const governance = new Map<string, InteropGovernanceRecord>();

  const filterBySource = <T extends {dataSourceId: string}>(
    map: Map<string, T>,
    dataSourceId?: string,
  ): readonly T[] => {
    const all = [...map.values()];
    return dataSourceId
      ? all.filter((r) => r.dataSourceId === dataSourceId)
      : all;
  };

  return {
    dataSources,
    permissions,
    schemaMappings,
    terminologyMappings,
    unitNormalisations,
    temporalAlignments,
    qualityValidations,
    provenance,
    accessEnforcements,
    retentions,
    governance,
    upsertDataSource(source) {
      const validated = validateDataSourceRegistration(source);
      dataSources.set(validated.id, validated);
      return validated;
    },
    getDataSource(id) {
      return dataSources.get(id) ?? null;
    },
    listDataSources() {
      return [...dataSources.values()];
    },
    upsertPermission(permission) {
      const validated = validateDataUsePermission(permission);
      permissions.set(validated.id, validated);
      return validated;
    },
    getPermission(id) {
      return permissions.get(id) ?? null;
    },
    listPermissions(dataSourceId) {
      return filterBySource(permissions, dataSourceId);
    },
    upsertSchemaMapping(mapping) {
      const validated = validateSchemaMapping(mapping);
      schemaMappings.set(validated.id, validated);
      return validated;
    },
    getSchemaMapping(id) {
      return schemaMappings.get(id) ?? null;
    },
    listSchemaMappings(dataSourceId) {
      return filterBySource(schemaMappings, dataSourceId);
    },
    upsertTerminologyMapping(mapping) {
      const validated = validateTerminologyMapping(mapping);
      terminologyMappings.set(validated.id, validated);
      return validated;
    },
    getTerminologyMapping(id) {
      return terminologyMappings.get(id) ?? null;
    },
    listTerminologyMappings(dataSourceId) {
      return filterBySource(terminologyMappings, dataSourceId);
    },
    upsertUnitNormalisation(record) {
      const validated = validateUnitNormalisation(record);
      unitNormalisations.set(validated.id, validated);
      return validated;
    },
    getUnitNormalisation(id) {
      return unitNormalisations.get(id) ?? null;
    },
    listUnitNormalisations(dataSourceId) {
      return filterBySource(unitNormalisations, dataSourceId);
    },
    upsertTemporalAlignment(record) {
      const validated = validateTemporalAlignment(record);
      temporalAlignments.set(validated.id, validated);
      return validated;
    },
    getTemporalAlignment(id) {
      return temporalAlignments.get(id) ?? null;
    },
    listTemporalAlignments(dataSourceId) {
      return filterBySource(temporalAlignments, dataSourceId);
    },
    upsertQualityValidation(record) {
      const validated = validateDataQualityValidation(record);
      qualityValidations.set(validated.id, validated);
      return validated;
    },
    getQualityValidation(id) {
      return qualityValidations.get(id) ?? null;
    },
    listQualityValidations(dataSourceId) {
      return filterBySource(qualityValidations, dataSourceId);
    },
    upsertProvenance(record) {
      const validated = validateSourceProvenance(record);
      provenance.set(validated.id, validated);
      return validated;
    },
    getProvenance(id) {
      return provenance.get(id) ?? null;
    },
    listProvenance(dataSourceId) {
      return filterBySource(provenance, dataSourceId);
    },
    upsertAccessEnforcement(record) {
      const validated = validateAccessEnforcement(record);
      accessEnforcements.set(validated.id, validated);
      return validated;
    },
    getAccessEnforcement(id) {
      return accessEnforcements.get(id) ?? null;
    },
    listAccessEnforcements(dataSourceId) {
      return filterBySource(accessEnforcements, dataSourceId);
    },
    upsertRetention(record) {
      const validated = validateRetentionDeletion(record);
      retentions.set(validated.id, validated);
      return validated;
    },
    getRetention(id) {
      return retentions.get(id) ?? null;
    },
    listRetentions(dataSourceId) {
      return filterBySource(retentions, dataSourceId);
    },
    upsertGovernance(record) {
      const validated = validateInteropGovernance(record);
      governance.set(validated.id, validated);
      return validated;
    },
    getGovernance(id) {
      return governance.get(id) ?? null;
    },
    listGovernance(dataSourceId) {
      return filterBySource(governance, dataSourceId);
    },
  };
}

export function projectSecureClinicalInteropPersistenceLines(input: {
  dataSource: DataSourceRegistration;
  permissions?: readonly DataUsePermissionRecord[];
  schemaMappings?: readonly SchemaMappingRecord[];
  terminologyMappings?: readonly TerminologyMappingRecord[];
  unitNormalisations?: readonly UnitNormalisationRecord[];
  temporalAlignments?: readonly TemporalAlignmentRecord[];
  qualityValidations?: readonly DataQualityValidationRecord[];
  provenance?: readonly SourceProvenanceRecord[];
  accessEnforcements?: readonly AccessEnforcementRecord[];
  retentions?: readonly RetentionDeletionRecord[];
  governance?: readonly InteropGovernanceRecord[];
}): string[] {
  const dataSource = validateDataSourceRegistration(input.dataSource);
  const lines = [
    `schema=${dataSource.schema}`,
    `method=${dataSource.method}`,
    `version=${dataSource.version}`,
    `dataSourceId=${dataSource.id}`,
    `sourceKind=${dataSource.sourceKind}`,
    `lifecycle=${dataSource.lifecycle}`,
    `connectorStatus=${dataSource.connectorStatus}`,
    `liveConnectorOperational=false`,
    `containsIdentifiablePhi=false`,
    `noUnrestrictedPatientDb=true`,
    `noLivePhiIngestion=true`,
    `noEhrWriteBackOrCds=true`,
    `federationNotOperationalUnlessVerified=true`,
    `pseudonymisedMayStillBePersonalData=true`,
    `permissions=${(input.permissions ?? []).length}`,
    `schemaMappings=${(input.schemaMappings ?? []).length}`,
    `terminologyMappings=${(input.terminologyMappings ?? []).length}`,
    `unitNormalisations=${(input.unitNormalisations ?? []).length}`,
    `temporalAlignments=${(input.temporalAlignments ?? []).length}`,
    `qualityValidations=${(input.qualityValidations ?? []).length}`,
    `provenance=${(input.provenance ?? []).length}`,
    `accessEnforcements=${(input.accessEnforcements ?? []).length}`,
    `retentions=${(input.retentions ?? []).length}`,
    `governance=${(input.governance ?? []).length}`,
    `fabricatedClinicalResults=false`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
  for (const p of input.permissions ?? []) validateDataUsePermission(p);
  for (const m of input.schemaMappings ?? []) validateSchemaMapping(m);
  for (const m of input.terminologyMappings ?? []) {
    validateTerminologyMapping(m);
  }
  for (const u of input.unitNormalisations ?? []) validateUnitNormalisation(u);
  for (const t of input.temporalAlignments ?? []) validateTemporalAlignment(t);
  for (const q of input.qualityValidations ?? []) {
    validateDataQualityValidation(q);
  }
  for (const p of input.provenance ?? []) validateSourceProvenance(p);
  for (const a of input.accessEnforcements ?? []) {
    validateAccessEnforcement(a);
  }
  for (const r of input.retentions ?? []) validateRetentionDeletion(r);
  for (const g of input.governance ?? []) validateInteropGovernance(g);
  return lines;
}

export function fingerprintDataSourceRegistration(
  source: DataSourceRegistration,
): string {
  const validated = validateDataSourceRegistration(source);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildSecureClinicalInteropPack(input: {
  dataSources: readonly DataSourceRegistration[];
  permissions: readonly DataUsePermissionRecord[];
  schemaMappings: readonly SchemaMappingRecord[];
  terminologyMappings: readonly TerminologyMappingRecord[];
  unitNormalisations: readonly UnitNormalisationRecord[];
  temporalAlignments: readonly TemporalAlignmentRecord[];
  qualityValidations: readonly DataQualityValidationRecord[];
  provenance: readonly SourceProvenanceRecord[];
  accessEnforcements: readonly AccessEnforcementRecord[];
  retentions: readonly RetentionDeletionRecord[];
  governance: readonly InteropGovernanceRecord[];
  asOf: string;
}): {
  schema: typeof SECURE_CLINICAL_INTEROP_SCHEMA;
  method: typeof SECURE_CLINICAL_INTEROP_METHOD;
  version: typeof SECURE_CLINICAL_INTEROP_VERSION;
  asOf: string;
  dataSourceCount: number;
  permissionCount: number;
  schemaMappingCount: number;
  terminologyMappingCount: number;
  unitNormalisationCount: number;
  temporalAlignmentCount: number;
  qualityValidationCount: number;
  provenanceCount: number;
  accessEnforcementCount: number;
  retentionCount: number;
  governanceCount: number;
  honesty: SecureClinicalInteropHonesty;
  dataSources: readonly DataSourceRegistration[];
  permissions: readonly DataUsePermissionRecord[];
  schemaMappings: readonly SchemaMappingRecord[];
  terminologyMappings: readonly TerminologyMappingRecord[];
  unitNormalisations: readonly UnitNormalisationRecord[];
  temporalAlignments: readonly TemporalAlignmentRecord[];
  qualityValidations: readonly DataQualityValidationRecord[];
  provenance: readonly SourceProvenanceRecord[];
  accessEnforcements: readonly AccessEnforcementRecord[];
  retentions: readonly RetentionDeletionRecord[];
  governance: readonly InteropGovernanceRecord[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const dataSources = input.dataSources.map(validateDataSourceRegistration);
  const permissions = input.permissions.map(validateDataUsePermission);
  const schemaMappings = input.schemaMappings.map(validateSchemaMapping);
  const terminologyMappings = input.terminologyMappings.map(
    validateTerminologyMapping,
  );
  const unitNormalisations = input.unitNormalisations.map(
    validateUnitNormalisation,
  );
  const temporalAlignments = input.temporalAlignments.map(
    validateTemporalAlignment,
  );
  const qualityValidations = input.qualityValidations.map(
    validateDataQualityValidation,
  );
  const provenance = input.provenance.map(validateSourceProvenance);
  const accessEnforcements = input.accessEnforcements.map(
    validateAccessEnforcement,
  );
  const retentions = input.retentions.map(validateRetentionDeletion);
  const governance = input.governance.map(validateInteropGovernance);
  return {
    schema: SECURE_CLINICAL_INTEROP_SCHEMA,
    method: SECURE_CLINICAL_INTEROP_METHOD,
    version: SECURE_CLINICAL_INTEROP_VERSION,
    asOf: input.asOf,
    dataSourceCount: dataSources.length,
    permissionCount: permissions.length,
    schemaMappingCount: schemaMappings.length,
    terminologyMappingCount: terminologyMappings.length,
    unitNormalisationCount: unitNormalisations.length,
    temporalAlignmentCount: temporalAlignments.length,
    qualityValidationCount: qualityValidations.length,
    provenanceCount: provenance.length,
    accessEnforcementCount: accessEnforcements.length,
    retentionCount: retentions.length,
    governanceCount: governance.length,
    honesty: {...DEFAULT_HONESTY},
    dataSources,
    permissions,
    schemaMappings,
    terminologyMappings,
    unitNormalisations,
    temporalAlignments,
    qualityValidations,
    provenance,
    accessEnforcements,
    retentions,
    governance,
  };
}
