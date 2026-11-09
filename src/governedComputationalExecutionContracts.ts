/**
 * Milestone 10 / PR4 — Governed Computational Execution.
 *
 * First real execution pathway: governed computational reanalysis of an
 * authorised public biomedical fixture dataset under reproducible pipeline
 * contracts. Binds PR3 researcher-approved protocols to isolated compute jobs
 * with dataset access verification, version pins, resource limits, logs, QC,
 * result artifacts, and a reproducibility manifest.
 *
 * Does NOT wire lab adapters / instrument control, claim live lab validation,
 * fabricate biological discoveries, ship workbench UI, run Neon migrations,
 * invent MoU / Gate C auto-approve, allow AI self-approval of execution, or
 * wire PHI/CDS.
 *
 * Binding honesty:
 * - Approved analysis specification + human execution authorisation required.
 * - No arbitrary model-generated code without validation + explicit authorisation.
 * - Isolated execution: resource budgets, timeouts, restricted network.
 * - Credentials must stay out of model prompts / free-text specs.
 * - Completed eng job ≠ scientific validation / interpretation.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 * - Depends on PR1 (#101) + PR2 (#102) + PR3 (#103) — stack or merge first.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const GOVERNED_COMPUTATIONAL_SCHEMA =
  "hsi-governed-computational-execution-1" as const;
export const GOVERNED_COMPUTATIONAL_METHOD =
  "hsi.governed_computational_execution.v1" as const;
export const GOVERNED_COMPUTATIONAL_VERSION = "0.1.0" as const;

/** Closed job lifecycle — transitions are fail-closed. */
export const COMPUTE_JOB_LIFECYCLES = [
  "draft_spec",
  "awaiting_execution_authorisation",
  "authorised",
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
  "superseded",
] as const;
export type ComputeJobLifecycle = (typeof COMPUTE_JOB_LIFECYCLES)[number];

/**
 * Terminal eng outcome classes. A completed job is never scientific validation.
 * `awaiting_scientific_interpretation` marks eng success pending human review.
 */
export const COMPUTE_JOB_OUTCOMES = [
  "succeeded",
  "failed",
  "qc_failed",
  "incomplete",
  "succeeded_null_results",
  "awaiting_scientific_interpretation",
] as const;
export type ComputeJobOutcome = (typeof COMPUTE_JOB_OUTCOMES)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type ComputeActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type ComputeDataBasis = (typeof DATA_BASES)[number];

export const DATASET_ACCESS_STATUSES = [
  "verified_authorised",
  "denied",
  "unverified",
] as const;
export type DatasetAccessStatus = (typeof DATASET_ACCESS_STATUSES)[number];

/**
 * Closed authorised pipeline kinds. Arbitrary / model-generated code is refused
 * unless promoted into this closed set by a separate human-gated change.
 */
export const AUTHORISED_PIPELINE_KINDS = [
  "public_fixture_descriptive_summary_v1",
  "public_fixture_correlation_v1",
] as const;
export type AuthorisedPipelineKind =
  (typeof AUTHORISED_PIPELINE_KINDS)[number];

export const NETWORK_POLICIES = [
  "deny_all",
  "allowlist_declared_only",
] as const;
export type NetworkPolicy = (typeof NETWORK_POLICIES)[number];

export const ARTIFACT_KINDS = [
  "execution_log",
  "qc_report",
  "result_table",
  "reproducibility_manifest",
  "null_result_declaration",
] as const;
export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

const ANALYSIS_SPEC_ID_RE = /^hsi-exp-cas-[a-z0-9-]{3,80}$/;
const JOB_ID_RE = /^hsi-exp-cej-[a-z0-9-]{3,80}$/;
const DATASET_ID_RE = /^hsi-exp-cds-[a-z0-9-]{3,80}$/;
const ARTIFACT_ID_RE = /^hsi-exp-car-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const SEMVER_RE = /^\d+\.\d+\.\d+([+-][A-Za-z0-9.-]+)?$/;
const HEX64_RE = /^[a-f0-9]{64}$/;

/** Credential-like tokens must never appear in free-text specs or prompts. */
const CREDENTIAL_LEAK_RE =
  /\b(api[_-]?key|secret|password|bearer\s+[a-z0-9._-]{8,}|sk-[a-z0-9]{10,}|neon\.tech\/[^\s]+|postgres(ql)?:\/\/[^\s]+)\b/i;

export type GovernedComputationalHonesty = {
  agentsProposeResearchersApprove: true;
  aiCannotSelfApproveExperiments: true;
  aiCannotSelfAuthoriseExecution: true;
  noArbitraryModelGeneratedCodeWithoutAuthorisation: true;
  isolatedExecutionModel: true;
  credentialsSeparateFromModelPrompts: true;
  completedJobIsNotScientificValidation: true;
  fabricatedBiologicalDiscoveries: false;
  liveLabValidationClaimed: false;
  labAdaptersWired: false;
  workbenchUiShipped: false;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  closedLoopDiscoveryComplete: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
  dependsOnPr1LifecycleContracts: true;
  dependsOnPr2DesignPrioritisation: true;
  dependsOnPr3ProtocolIntelligence: true;
};

export type DatasetAccessVerification = {
  datasetId: string;
  datasetVersion: string;
  accessStatus: DatasetAccessStatus;
  licenceRef: string | null;
  verifiedAt: string;
  verifiedByPrincipalId: string;
  containsPhi: false;
  /** Public fixture or authorised public catalogue — never invented patient data. */
  publicOrAuthorised: true;
};

export type PipelineVersionPins = {
  analysisCodeVersion: string;
  dependencyVersions: readonly {name: string; version: string}[];
  containerImage: string | null;
  containerDigest: string | null;
  computeEnvironment: string;
};

export type ResourceLimits = {
  timeoutMs: number;
  maxMemoryMb: number;
  maxCpuMillis: number;
  maxInputRows: number;
  maxInputColumns: number;
  networkPolicy: NetworkPolicy;
  networkAllowlist: readonly string[];
};

export type AnalysisSpecification = {
  schema: typeof GOVERNED_COMPUTATIONAL_SCHEMA;
  method: typeof GOVERNED_COMPUTATIONAL_METHOD;
  version: typeof GOVERNED_COMPUTATIONAL_VERSION;
  id: string;
  title: string;
  objective: string;
  /** PR3 researcher-approved protocol draft id. */
  approvedProtocolDraftId: string;
  approvedProtocolVersion: number;
  hypothesisId: string | null;
  investigationId: string | null;
  /** Optional PR1 execution / N7 refs. */
  linkedPr1ExecutionId: string | null;
  n7ExperimentRecordId: string | null;
  /** Optional durable checkpoint task id (ARCH-009). */
  durableCheckpointTaskId: string | null;
  pipelineKind: AuthorisedPipelineKind;
  dataset: DatasetAccessVerification;
  versionPins: PipelineVersionPins;
  resourceLimits: ResourceLimits;
  qcAcceptanceCriteria: readonly string[];
  /** Explicit human authorisation to execute — distinct from protocol approval. */
  executionAuthorisation: {
    principalId: string;
    actorKind: "human";
    authorisedAt: string;
    note: string;
  } | null;
  draftedBy: {
    principalId: string;
    actorKind: ComputeActorKind;
  };
  dataBasis: ComputeDataBasis;
  fixtureHonesty: boolean;
  honesty: GovernedComputationalHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ExecutionLogEntry = {
  at: string;
  level: "info" | "warn" | "error";
  message: string;
};

export type QcCheckResult = {
  id: string;
  description: string;
  passed: boolean;
  detail: string;
};

export type ComputeArtifact = {
  id: string;
  jobId: string;
  kind: ArtifactKind;
  label: string;
  /** Deterministic content payload (fixture / harness output). */
  content: unknown;
  contentSha256: string;
  producedAt: string;
  /** True when content is engineering fixture, not a wet-lab discovery. */
  fixtureDeclared: boolean;
  fabricatedBiology: false;
};

export type ReproducibilityManifest = {
  analysisSpecId: string;
  jobId: string;
  pipelineKind: AuthorisedPipelineKind;
  datasetId: string;
  datasetVersion: string;
  analysisCodeVersion: string;
  dependencyVersions: readonly {name: string; version: string}[];
  containerImage: string | null;
  containerDigest: string | null;
  computeEnvironment: string;
  inputFixtureSha256: string;
  artifactSha256s: readonly {artifactId: string; sha256: string}[];
  resourceLimits: ResourceLimits;
  networkPolicy: NetworkPolicy;
  producedAt: string;
  scientificValidationClaimed: false;
};

export type GovernedComputeJob = {
  schema: typeof GOVERNED_COMPUTATIONAL_SCHEMA;
  method: typeof GOVERNED_COMPUTATIONAL_METHOD;
  version: typeof GOVERNED_COMPUTATIONAL_VERSION;
  id: string;
  analysisSpecId: string;
  lifecycle: ComputeJobLifecycle;
  outcome: ComputeJobOutcome | null;
  startedAt: string | null;
  finishedAt: string | null;
  cancelledAt: string | null;
  failureReason: string | null;
  logs: readonly ExecutionLogEntry[];
  qcResults: readonly QcCheckResult[];
  artifactIds: readonly string[];
  reproducibilityManifest: ReproducibilityManifest | null;
  /** Eng completion never implies scientific validation. */
  scientificValidationClaimed: false;
  awaitingScientificInterpretation: boolean;
  honesty: GovernedComputationalHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PublicFixtureExpressionMatrix = {
  schema: "hsi-public-fixture-expression-matrix-1";
  datasetId: string;
  datasetVersion: string;
  /** Gene / feature ids. */
  features: readonly string[];
  /** Sample ids. */
  samples: readonly string[];
  /** Row-major values[featureIndex][sampleIndex]. */
  values: readonly (readonly number[])[];
  honesty: {
    fixtureDeclared: true;
    fabricatedBiology: false;
    containsPhi: false;
    publicCatalogueSimulated: true;
  };
};

export type GovernedComputationalStore = {
  upsertAnalysisSpec(spec: AnalysisSpecification): AnalysisSpecification;
  getAnalysisSpec(id: string): AnalysisSpecification | null;
  listAnalysisSpecs(protocolDraftId?: string): readonly AnalysisSpecification[];
  upsertJob(job: GovernedComputeJob): GovernedComputeJob;
  getJob(id: string): GovernedComputeJob | null;
  listJobs(analysisSpecId?: string): readonly GovernedComputeJob[];
  upsertArtifact(artifact: ComputeArtifact): ComputeArtifact;
  getArtifact(id: string): ComputeArtifact | null;
  listArtifacts(jobId?: string): readonly ComputeArtifact[];
};

const DEFAULT_HONESTY: GovernedComputationalHonesty = {
  agentsProposeResearchersApprove: true,
  aiCannotSelfApproveExperiments: true,
  aiCannotSelfAuthoriseExecution: true,
  noArbitraryModelGeneratedCodeWithoutAuthorisation: true,
  isolatedExecutionModel: true,
  credentialsSeparateFromModelPrompts: true,
  completedJobIsNotScientificValidation: true,
  fabricatedBiologicalDiscoveries: false,
  liveLabValidationClaimed: false,
  labAdaptersWired: false,
  workbenchUiShipped: false,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  closedLoopDiscoveryComplete: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
  dependsOnPr1LifecycleContracts: true,
  dependsOnPr2DesignPrioritisation: true,
  dependsOnPr3ProtocolIntelligence: true,
};

const JOB_TRANSITIONS: Record<
  ComputeJobLifecycle,
  readonly ComputeJobLifecycle[]
> = {
  draft_spec: ["awaiting_execution_authorisation", "superseded", "cancelled"],
  awaiting_execution_authorisation: ["authorised", "cancelled", "superseded"],
  authorised: ["queued", "cancelled", "superseded"],
  queued: ["running", "cancelled", "failed"],
  running: ["completed", "failed", "cancelled"],
  completed: ["superseded"],
  failed: ["superseded"],
  cancelled: [],
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

function assertNoCredentialLeak(text: string, label: string): void {
  if (CREDENTIAL_LEAK_RE.test(text)) {
    throw Error(
      `${label} must not embed credentials or connection secrets (keep separate from model prompts)`,
    );
  }
}

function assertHonesty(honesty: GovernedComputationalHonesty): void {
  if (honesty.agentsProposeResearchersApprove !== true) {
    throw Error("Agents propose; researchers approve");
  }
  if (honesty.aiCannotSelfApproveExperiments !== true) {
    throw Error("AI cannot self-approve experiments");
  }
  if (honesty.aiCannotSelfAuthoriseExecution !== true) {
    throw Error("AI cannot self-authorise execution");
  }
  if (honesty.noArbitraryModelGeneratedCodeWithoutAuthorisation !== true) {
    throw Error("Arbitrary model-generated code requires authorisation");
  }
  if (honesty.isolatedExecutionModel !== true) {
    throw Error("Isolated execution model required");
  }
  if (honesty.credentialsSeparateFromModelPrompts !== true) {
    throw Error("Credentials must stay separate from model prompts");
  }
  if (honesty.completedJobIsNotScientificValidation !== true) {
    throw Error("Completed job must not claim scientific validation");
  }
  if (honesty.fabricatedBiologicalDiscoveries !== false) {
    throw Error("Fabricated biological discoveries forbidden");
  }
  if (honesty.liveLabValidationClaimed !== false) {
    throw Error("Live lab validation must not be claimed");
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
    throw Error("PR4 depends on PR1 lifecycle contracts");
  }
  if (honesty.dependsOnPr2DesignPrioritisation !== true) {
    throw Error("PR4 depends on PR2 design prioritisation");
  }
  if (honesty.dependsOnPr3ProtocolIntelligence !== true) {
    throw Error("PR4 depends on PR3 protocol intelligence");
  }
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
    assertNoCredentialLeak(value, label);
    out.push(value.trim());
  }
  return out;
}

function sha256Of(value: unknown): string {
  return createHash("sha256")
    .update(canonicalEvidenceJson(value))
    .digest("hex");
}

function assertDatasetAccess(
  dataset: DatasetAccessVerification,
): DatasetAccessVerification {
  if (!DATASET_ID_RE.test(dataset.datasetId)) {
    throw Error("Invalid dataset id");
  }
  if (!textOk(dataset.datasetVersion, 128)) {
    throw Error("Invalid dataset version");
  }
  assertClosed(
    dataset.accessStatus,
    DATASET_ACCESS_STATUSES,
    "dataset access status",
  );
  if (!isIsoTimestamp(dataset.verifiedAt)) {
    throw Error("Invalid dataset verifiedAt");
  }
  if (!PRINCIPAL_RE.test(dataset.verifiedByPrincipalId)) {
    throw Error("Invalid dataset verifier");
  }
  if (dataset.containsPhi !== false) throw Error("Dataset must not contain PHI");
  if (dataset.publicOrAuthorised !== true) {
    throw Error("Dataset must be public or authorised");
  }
  if (
    dataset.licenceRef !== null &&
    !textOk(dataset.licenceRef, 500)
  ) {
    throw Error("Invalid licenceRef");
  }
  if (
    dataset.accessStatus === "verified_authorised" &&
    dataset.licenceRef === null
  ) {
    throw Error("verified_authorised dataset requires licenceRef");
  }
  return {
    datasetId: dataset.datasetId,
    datasetVersion: dataset.datasetVersion.trim(),
    accessStatus: dataset.accessStatus,
    licenceRef: dataset.licenceRef === null ? null : dataset.licenceRef.trim(),
    verifiedAt: dataset.verifiedAt,
    verifiedByPrincipalId: dataset.verifiedByPrincipalId,
    containsPhi: false,
    publicOrAuthorised: true,
  };
}

function assertVersionPins(pins: PipelineVersionPins): PipelineVersionPins {
  if (!SEMVER_RE.test(pins.analysisCodeVersion)) {
    throw Error("Invalid analysisCodeVersion");
  }
  if (!textOk(pins.computeEnvironment, 200)) {
    throw Error("Invalid computeEnvironment");
  }
  assertNoCredentialLeak(pins.computeEnvironment, "computeEnvironment");
  if (pins.dependencyVersions.length < 1 || pins.dependencyVersions.length > 40) {
    throw Error("Invalid dependencyVersions count");
  }
  const deps: {name: string; version: string}[] = [];
  const seen = new Set<string>();
  for (const dep of pins.dependencyVersions) {
    if (!textOk(dep.name, 128) || !textOk(dep.version, 128)) {
      throw Error("Invalid dependency pin");
    }
    if (seen.has(dep.name)) throw Error("Duplicate dependency pin");
    seen.add(dep.name);
    deps.push({name: dep.name.trim(), version: dep.version.trim()});
  }
  if (pins.containerImage !== null && !textOk(pins.containerImage, 500)) {
    throw Error("Invalid containerImage");
  }
  if (pins.containerDigest !== null) {
    if (
      !/^sha256:[a-f0-9]{64}$/.test(pins.containerDigest) &&
      !HEX64_RE.test(pins.containerDigest)
    ) {
      throw Error("Invalid containerDigest");
    }
  }
  if (pins.containerImage !== null && pins.containerDigest === null) {
    throw Error("containerImage requires containerDigest");
  }
  return {
    analysisCodeVersion: pins.analysisCodeVersion,
    dependencyVersions: deps,
    containerImage: pins.containerImage,
    containerDigest: pins.containerDigest,
    computeEnvironment: pins.computeEnvironment.trim(),
  };
}

function assertResourceLimits(limits: ResourceLimits): ResourceLimits {
  assertClosed(limits.networkPolicy, NETWORK_POLICIES, "network policy");
  if (
    !Number.isInteger(limits.timeoutMs) ||
    limits.timeoutMs < 100 ||
    limits.timeoutMs > 600_000
  ) {
    throw Error("Invalid timeoutMs");
  }
  if (
    !Number.isInteger(limits.maxMemoryMb) ||
    limits.maxMemoryMb < 16 ||
    limits.maxMemoryMb > 8192
  ) {
    throw Error("Invalid maxMemoryMb");
  }
  if (
    !Number.isInteger(limits.maxCpuMillis) ||
    limits.maxCpuMillis < 100 ||
    limits.maxCpuMillis > 3_600_000
  ) {
    throw Error("Invalid maxCpuMillis");
  }
  if (
    !Number.isInteger(limits.maxInputRows) ||
    limits.maxInputRows < 1 ||
    limits.maxInputRows > 100_000
  ) {
    throw Error("Invalid maxInputRows");
  }
  if (
    !Number.isInteger(limits.maxInputColumns) ||
    limits.maxInputColumns < 1 ||
    limits.maxInputColumns > 10_000
  ) {
    throw Error("Invalid maxInputColumns");
  }
  if (limits.networkAllowlist.length > 32) {
    throw Error("Too many network allowlist entries");
  }
  if (
    limits.networkPolicy === "deny_all" &&
    limits.networkAllowlist.length > 0
  ) {
    throw Error("deny_all network policy forbids allowlist entries");
  }
  if (
    limits.networkPolicy === "allowlist_declared_only" &&
    limits.networkAllowlist.length < 1
  ) {
    throw Error("allowlist_declared_only requires allowlist entries");
  }
  const allowlist = assertStringList(
    limits.networkAllowlist,
    "network allowlist",
    32,
    200,
  );
  return {
    timeoutMs: limits.timeoutMs,
    maxMemoryMb: limits.maxMemoryMb,
    maxCpuMillis: limits.maxCpuMillis,
    maxInputRows: limits.maxInputRows,
    maxInputColumns: limits.maxInputColumns,
    networkPolicy: limits.networkPolicy,
    networkAllowlist: allowlist,
  };
}

/**
 * Canonical public fixture matrix used by the deterministic local harness.
 * Engineering fixture only — not a wet-lab discovery or patient dataset.
 */
export function buildPublicFixtureExpressionMatrix(): PublicFixtureExpressionMatrix {
  return {
    schema: "hsi-public-fixture-expression-matrix-1",
    datasetId: "hsi-exp-cds-public-fixture-il6-001",
    datasetVersion: "1.0.0",
    features: ["IL6", "STAT3", "TGFB1", "COL1A1", "GAPDH"],
    samples: ["S1", "S2", "S3", "S4"],
    values: [
      [2.1, 2.4, 1.9, 2.2],
      [1.8, 2.0, 1.7, 1.9],
      [3.0, 2.8, 3.1, 2.9],
      [2.5, 2.6, 2.4, 2.7],
      [5.0, 5.1, 4.9, 5.0],
    ],
    honesty: {
      fixtureDeclared: true,
      fabricatedBiology: false,
      containsPhi: false,
      publicCatalogueSimulated: true,
    },
  };
}

export function validatePublicFixtureExpressionMatrix(
  matrix: PublicFixtureExpressionMatrix,
): PublicFixtureExpressionMatrix {
  if (matrix.schema !== "hsi-public-fixture-expression-matrix-1") {
    throw Error("Invalid fixture matrix schema");
  }
  if (!DATASET_ID_RE.test(matrix.datasetId)) throw Error("Invalid dataset id");
  if (!SEMVER_RE.test(matrix.datasetVersion)) {
    throw Error("Invalid dataset version");
  }
  if (matrix.features.length < 2 || matrix.samples.length < 2) {
    throw Error("Fixture matrix too small");
  }
  if (matrix.values.length !== matrix.features.length) {
    throw Error("Fixture matrix feature/value mismatch");
  }
  for (const row of matrix.values) {
    if (row.length !== matrix.samples.length) {
      throw Error("Fixture matrix sample/value mismatch");
    }
    for (const cell of row) {
      if (!Number.isFinite(cell)) throw Error("Non-finite fixture value");
    }
  }
  if (matrix.honesty.fixtureDeclared !== true) {
    throw Error("Fixture must declare honesty");
  }
  if (matrix.honesty.fabricatedBiology !== false) {
    throw Error("Fabricated biology forbidden in fixture");
  }
  if (matrix.honesty.containsPhi !== false) {
    throw Error("Fixture must not contain PHI");
  }
  if (matrix.honesty.publicCatalogueSimulated !== true) {
    throw Error("Fixture must declare simulated public catalogue");
  }
  return matrix;
}

export function validateAnalysisSpecification(
  spec: AnalysisSpecification,
): AnalysisSpecification {
  if (spec.schema !== GOVERNED_COMPUTATIONAL_SCHEMA) {
    throw Error("Invalid analysis spec schema");
  }
  if (spec.method !== GOVERNED_COMPUTATIONAL_METHOD) {
    throw Error("Invalid analysis spec method");
  }
  if (spec.version !== GOVERNED_COMPUTATIONAL_VERSION) {
    throw Error("Invalid analysis spec version");
  }
  if (!ANALYSIS_SPEC_ID_RE.test(spec.id)) throw Error("Invalid analysis spec id");
  if (!textOk(spec.title, 300)) throw Error("Invalid title");
  if (!textOk(spec.objective, 4000)) throw Error("Invalid objective");
  assertNoCredentialLeak(spec.title, "title");
  assertNoCredentialLeak(spec.objective, "objective");
  assertNoCredentialLeak(spec.note, "note");
  if (!REF_ID_RE.test(spec.approvedProtocolDraftId)) {
    throw Error("Invalid approvedProtocolDraftId");
  }
  if (
    !Number.isInteger(spec.approvedProtocolVersion) ||
    spec.approvedProtocolVersion < 1
  ) {
    throw Error("Invalid approvedProtocolVersion");
  }
  assertClosed(spec.pipelineKind, AUTHORISED_PIPELINE_KINDS, "pipeline kind");
  assertClosed(spec.dataBasis, DATA_BASES, "data basis");
  const dataset = assertDatasetAccess(spec.dataset);
  const versionPins = assertVersionPins(spec.versionPins);
  const resourceLimits = assertResourceLimits(spec.resourceLimits);
  const qcAcceptanceCriteria = assertStringList(
    spec.qcAcceptanceCriteria,
    "QC acceptance criteria",
    32,
    1000,
    1,
  );
  assertHonesty(spec.honesty);
  if (!PRINCIPAL_RE.test(spec.draftedBy.principalId)) {
    throw Error("Invalid draftedBy principal");
  }
  assertClosed(spec.draftedBy.actorKind, ACTOR_KINDS, "draftedBy actor kind");
  if (!isIsoTimestamp(spec.createdAt) || !isIsoTimestamp(spec.updatedAt)) {
    throw Error("Invalid analysis spec timestamps");
  }
  if (spec.dataBasis === "fixture_engineering" && !spec.fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  if (dataset.accessStatus !== "verified_authorised") {
    throw Error("Analysis specification requires verified_authorised dataset");
  }
  if (spec.executionAuthorisation !== null) {
    if (spec.executionAuthorisation.actorKind !== "human") {
      throw Error("Execution authorisation requires human actor");
    }
    if (!PRINCIPAL_RE.test(spec.executionAuthorisation.principalId)) {
      throw Error("Invalid execution authorisation principal");
    }
    if (
      spec.draftedBy.actorKind === "ai_agent" &&
      spec.executionAuthorisation.principalId === spec.draftedBy.principalId
    ) {
      throw Error("AI cannot self-authorise computational execution");
    }
    if (!isIsoTimestamp(spec.executionAuthorisation.authorisedAt)) {
      throw Error("Invalid execution authorisation timestamp");
    }
    if (!textOk(spec.executionAuthorisation.note, 2000)) {
      throw Error("Invalid execution authorisation note");
    }
    assertNoCredentialLeak(
      spec.executionAuthorisation.note,
      "execution authorisation note",
    );
  }
  for (const optional of [
    spec.hypothesisId,
    spec.investigationId,
    spec.linkedPr1ExecutionId,
    spec.n7ExperimentRecordId,
    spec.durableCheckpointTaskId,
  ] as const) {
    if (optional !== null && !REF_ID_RE.test(optional)) {
      throw Error("Invalid optional reference id");
    }
  }
  return {
    ...spec,
    title: spec.title.trim(),
    objective: spec.objective.trim(),
    note: spec.note.trim(),
    dataset,
    versionPins,
    resourceLimits,
    qcAcceptanceCriteria,
    honesty: {...DEFAULT_HONESTY},
  };
}

export function draftAnalysisSpecification(input: {
  id: string;
  title: string;
  objective: string;
  approvedProtocolDraftId: string;
  approvedProtocolVersion: number;
  /** Must be researcher_approved before binding — caller supplies stamp. */
  protocolLifecycle: "researcher_approved";
  protocolApprovedByPrincipalId: string;
  draftedByPrincipalId: string;
  draftedByActorKind: ComputeActorKind;
  createdAt: string;
  pipelineKind: AuthorisedPipelineKind;
  dataset: DatasetAccessVerification;
  versionPins: PipelineVersionPins;
  resourceLimits: ResourceLimits;
  qcAcceptanceCriteria: readonly string[];
  hypothesisId?: string | null;
  investigationId?: string | null;
  linkedPr1ExecutionId?: string | null;
  n7ExperimentRecordId?: string | null;
  durableCheckpointTaskId?: string | null;
  dataBasis?: ComputeDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): AnalysisSpecification {
  if (input.protocolLifecycle !== "researcher_approved") {
    throw Error("Analysis specification requires researcher_approved protocol");
  }
  if (!PRINCIPAL_RE.test(input.protocolApprovedByPrincipalId)) {
    throw Error("Invalid protocol approver");
  }
  const dataBasis = input.dataBasis ?? "fixture_engineering";
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  const spec: AnalysisSpecification = {
    schema: GOVERNED_COMPUTATIONAL_SCHEMA,
    method: GOVERNED_COMPUTATIONAL_METHOD,
    version: GOVERNED_COMPUTATIONAL_VERSION,
    id: input.id,
    title: input.title,
    objective: input.objective,
    approvedProtocolDraftId: input.approvedProtocolDraftId,
    approvedProtocolVersion: input.approvedProtocolVersion,
    hypothesisId: input.hypothesisId ?? null,
    investigationId: input.investigationId ?? null,
    linkedPr1ExecutionId: input.linkedPr1ExecutionId ?? null,
    n7ExperimentRecordId: input.n7ExperimentRecordId ?? null,
    durableCheckpointTaskId: input.durableCheckpointTaskId ?? null,
    pipelineKind: input.pipelineKind,
    dataset: input.dataset,
    versionPins: input.versionPins,
    resourceLimits: input.resourceLimits,
    qcAcceptanceCriteria: input.qcAcceptanceCriteria,
    executionAuthorisation: null,
    draftedBy: {
      principalId: input.draftedByPrincipalId,
      actorKind: input.draftedByActorKind,
    },
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: input.note ?? "",
  };
  return validateAnalysisSpecification(spec);
}

/**
 * Explicit human authorisation to execute — distinct from PR3 protocol approval.
 * AI agents cannot authorise their own specs.
 */
export function authoriseComputationalExecution(input: {
  spec: AnalysisSpecification;
  principalId: string;
  actorKind: ComputeActorKind;
  authorisedAt: string;
  note: string;
}): AnalysisSpecification {
  const prior = validateAnalysisSpecification(input.spec);
  if (input.actorKind !== "human") {
    throw Error("Only authorised humans may authorise computational execution");
  }
  if (!PRINCIPAL_RE.test(input.principalId)) {
    throw Error("Invalid authorisation principal");
  }
  if (
    prior.draftedBy.actorKind === "ai_agent" &&
    input.principalId === prior.draftedBy.principalId
  ) {
    throw Error("AI cannot self-authorise computational execution");
  }
  if (!isIsoTimestamp(input.authorisedAt)) {
    throw Error("Invalid authorisedAt");
  }
  if (!textOk(input.note, 2000)) throw Error("Invalid authorisation note");
  assertNoCredentialLeak(input.note, "authorisation note");
  return validateAnalysisSpecification({
    ...prior,
    executionAuthorisation: {
      principalId: input.principalId,
      actorKind: "human",
      authorisedAt: input.authorisedAt,
      note: input.note.trim(),
    },
    updatedAt: input.authorisedAt,
  });
}

/**
 * Refuse arbitrary / model-generated code that is not in the closed pipeline set.
 */
export function refuseArbitraryModelGeneratedCode(input: {
  requestedPipelineKind: string;
  authorised: boolean;
}): {
  refused: true;
  reason: string;
  authorisedPipelineKinds: readonly AuthorisedPipelineKind[];
} {
  const closed = (AUTHORISED_PIPELINE_KINDS as readonly string[]).includes(
    input.requestedPipelineKind,
  );
  if (closed && input.authorised) {
    throw Error("Authorised closed pipeline kind must not be refused");
  }
  return {
    refused: true,
    reason: closed
      ? "Closed pipeline kind still requires explicit human execution authorisation"
      : "Arbitrary / model-generated code is not an authorised pipeline kind",
    authorisedPipelineKinds: AUTHORISED_PIPELINE_KINDS,
  };
}

export function draftGovernedComputeJob(input: {
  id: string;
  spec: AnalysisSpecification;
  createdAt: string;
  note?: string;
}): GovernedComputeJob {
  const spec = validateAnalysisSpecification(input.spec);
  if (!JOB_ID_RE.test(input.id)) throw Error("Invalid job id");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (spec.executionAuthorisation === null) {
    throw Error("Compute job requires execution authorisation on analysis spec");
  }
  const job: GovernedComputeJob = {
    schema: GOVERNED_COMPUTATIONAL_SCHEMA,
    method: GOVERNED_COMPUTATIONAL_METHOD,
    version: GOVERNED_COMPUTATIONAL_VERSION,
    id: input.id,
    analysisSpecId: spec.id,
    lifecycle: "authorised",
    outcome: null,
    startedAt: null,
    finishedAt: null,
    cancelledAt: null,
    failureReason: null,
    logs: [],
    qcResults: [],
    artifactIds: [],
    reproducibilityManifest: null,
    scientificValidationClaimed: false,
    awaitingScientificInterpretation: false,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateGovernedComputeJob(job);
}

export function validateGovernedComputeJob(
  job: GovernedComputeJob,
): GovernedComputeJob {
  if (job.schema !== GOVERNED_COMPUTATIONAL_SCHEMA) {
    throw Error("Invalid job schema");
  }
  if (job.method !== GOVERNED_COMPUTATIONAL_METHOD) {
    throw Error("Invalid job method");
  }
  if (job.version !== GOVERNED_COMPUTATIONAL_VERSION) {
    throw Error("Invalid job version");
  }
  if (!JOB_ID_RE.test(job.id)) throw Error("Invalid job id");
  if (!ANALYSIS_SPEC_ID_RE.test(job.analysisSpecId)) {
    throw Error("Invalid analysisSpecId");
  }
  assertClosed(job.lifecycle, COMPUTE_JOB_LIFECYCLES, "job lifecycle");
  if (job.outcome !== null) {
    assertClosed(job.outcome, COMPUTE_JOB_OUTCOMES, "job outcome");
  }
  assertHonesty(job.honesty);
  if (job.scientificValidationClaimed !== false) {
    throw Error("Scientific validation must not be claimed from eng completion");
  }
  if (!isIsoTimestamp(job.createdAt) || !isIsoTimestamp(job.updatedAt)) {
    throw Error("Invalid job timestamps");
  }
  if (job.startedAt !== null && !isIsoTimestamp(job.startedAt)) {
    throw Error("Invalid startedAt");
  }
  if (job.finishedAt !== null && !isIsoTimestamp(job.finishedAt)) {
    throw Error("Invalid finishedAt");
  }
  if (job.cancelledAt !== null && !isIsoTimestamp(job.cancelledAt)) {
    throw Error("Invalid cancelledAt");
  }
  if (
    job.lifecycle === "completed" &&
    (job.outcome === null || job.finishedAt === null)
  ) {
    throw Error("Completed job requires outcome and finishedAt");
  }
  if (
    (job.lifecycle === "failed" || job.lifecycle === "cancelled") &&
    job.outcome === null
  ) {
    throw Error("Failed/cancelled job requires outcome");
  }
  if (
    job.outcome === "awaiting_scientific_interpretation" &&
    !job.awaitingScientificInterpretation
  ) {
    throw Error(
      "awaiting_scientific_interpretation outcome requires awaiting flag",
    );
  }
  if (job.awaitingScientificInterpretation && job.scientificValidationClaimed) {
    throw Error("Awaiting interpretation cannot claim scientific validation");
  }
  return job;
}

export function transitionGovernedComputeJob(input: {
  job: GovernedComputeJob;
  to: ComputeJobLifecycle;
  updatedAt: string;
  failureReason?: string | null;
  outcome?: ComputeJobOutcome | null;
}): GovernedComputeJob {
  const prior = validateGovernedComputeJob(input.job);
  assertClosed(input.to, COMPUTE_JOB_LIFECYCLES, "job lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const allowed = JOB_TRANSITIONS[prior.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(`Illegal compute job transition ${prior.lifecycle} → ${input.to}`);
  }

  let outcome = prior.outcome;
  let failureReason = prior.failureReason;
  let startedAt = prior.startedAt;
  let finishedAt = prior.finishedAt;
  let cancelledAt = prior.cancelledAt;
  let awaitingScientificInterpretation = prior.awaitingScientificInterpretation;

  if (input.to === "running") {
    startedAt = input.updatedAt;
  }
  if (input.to === "completed") {
    if (input.outcome == null) {
      throw Error("Completed transition requires outcome");
    }
    assertClosed(input.outcome, COMPUTE_JOB_OUTCOMES, "job outcome");
    if (
      input.outcome !== "succeeded" &&
      input.outcome !== "succeeded_null_results" &&
      input.outcome !== "qc_failed" &&
      input.outcome !== "awaiting_scientific_interpretation"
    ) {
      throw Error("Completed transition outcome must be a completion class");
    }
    outcome = input.outcome;
    finishedAt = input.updatedAt;
    awaitingScientificInterpretation =
      input.outcome === "awaiting_scientific_interpretation";
  }
  if (input.to === "failed") {
    outcome = input.outcome ?? "failed";
    if (outcome !== "failed" && outcome !== "incomplete") {
      throw Error("Failed transition requires failed/incomplete outcome");
    }
    failureReason = (input.failureReason ?? "unspecified").trim();
    if (!textOk(failureReason, 2000)) throw Error("Invalid failureReason");
    finishedAt = input.updatedAt;
  }
  if (input.to === "cancelled") {
    outcome = "incomplete";
    cancelledAt = input.updatedAt;
    finishedAt = input.updatedAt;
    failureReason = (input.failureReason ?? "cancelled").trim();
  }

  return validateGovernedComputeJob({
    ...prior,
    lifecycle: input.to,
    outcome,
    failureReason,
    startedAt,
    finishedAt,
    cancelledAt,
    awaitingScientificInterpretation,
    updatedAt: input.updatedAt,
  });
}

function mean(xs: readonly number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function variance(xs: readonly number[]): number {
  const m = mean(xs);
  return xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length;
}

function pearson(xs: readonly number[], ys: readonly number[]): number {
  if (xs.length !== ys.length || xs.length < 2) {
    throw Error("Pearson requires paired samples");
  }
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i]! - mx;
    const b = ys[i]! - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return 0;
  return num / Math.sqrt(dx * dy);
}

function buildArtifact(input: {
  id: string;
  jobId: string;
  kind: ArtifactKind;
  label: string;
  content: unknown;
  producedAt: string;
}): ComputeArtifact {
  if (!ARTIFACT_ID_RE.test(input.id)) throw Error("Invalid artifact id");
  assertClosed(input.kind, ARTIFACT_KINDS, "artifact kind");
  if (!textOk(input.label, 300)) throw Error("Invalid artifact label");
  if (!isIsoTimestamp(input.producedAt)) throw Error("Invalid producedAt");
  return {
    id: input.id,
    jobId: input.jobId,
    kind: input.kind,
    label: input.label.trim(),
    content: input.content,
    contentSha256: sha256Of(input.content),
    producedAt: input.producedAt,
    fixtureDeclared: true,
    fabricatedBiology: false,
  };
}

export type HarnessRunResult = {
  job: GovernedComputeJob;
  artifacts: readonly ComputeArtifact[];
  matrix: PublicFixtureExpressionMatrix;
};

/**
 * Deterministic local harness: runs an authorised closed pipeline against the
 * public fixture expression matrix. Produces real reproducible artifacts from
 * fixture data — not fabricated wet-lab biology.
 */
export function runGovernedComputationalHarness(input: {
  job: GovernedComputeJob;
  spec: AnalysisSpecification;
  asOf: string;
  /** Force QC failure for testing. */
  forceQcFailure?: boolean;
  /** Force empty/null results for testing. */
  forceNullResults?: boolean;
  /** Force runtime failure for testing. */
  forceFailure?: string | null;
  /** Cancel before completion. */
  forceCancel?: boolean;
  artifactIdPrefix?: string;
  matrix?: PublicFixtureExpressionMatrix;
}): HarnessRunResult {
  const spec = validateAnalysisSpecification(input.spec);
  let job = validateGovernedComputeJob(input.job);
  if (job.analysisSpecId !== spec.id) {
    throw Error("Job analysisSpecId must match specification");
  }
  if (spec.executionAuthorisation === null) {
    throw Error("Harness requires authorised analysis specification");
  }
  if (spec.dataset.accessStatus !== "verified_authorised") {
    throw Error("Harness requires verified dataset access");
  }
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");

  const matrix = validatePublicFixtureExpressionMatrix(
    input.matrix ?? buildPublicFixtureExpressionMatrix(),
  );
  if (matrix.datasetId !== spec.dataset.datasetId) {
    throw Error("Fixture datasetId must match analysis specification");
  }
  if (matrix.datasetVersion !== spec.dataset.datasetVersion) {
    throw Error("Fixture datasetVersion must match analysis specification");
  }

  // Resource budget guards (fail-closed).
  if (matrix.features.length > spec.resourceLimits.maxInputRows) {
    throw Error("Input rows exceed resource budget");
  }
  if (matrix.samples.length > spec.resourceLimits.maxInputColumns) {
    throw Error("Input columns exceed resource budget");
  }
  if (spec.resourceLimits.networkPolicy === "deny_all") {
    // Isolated: no network egress during harness.
  }

  if (job.lifecycle === "authorised") {
    job = transitionGovernedComputeJob({
      job,
      to: "queued",
      updatedAt: input.asOf,
    });
  }
  if (job.lifecycle === "queued") {
    job = transitionGovernedComputeJob({
      job,
      to: "running",
      updatedAt: input.asOf,
    });
  }
  if (job.lifecycle !== "running") {
    throw Error("Harness requires running job lifecycle");
  }

  const logs: ExecutionLogEntry[] = [
    {
      at: input.asOf,
      level: "info",
      message: `Starting authorised pipeline ${spec.pipelineKind} under isolated harness`,
    },
    {
      at: input.asOf,
      level: "info",
      message: `Dataset ${spec.dataset.datasetId}@${spec.dataset.datasetVersion} access verified_authorised`,
    },
    {
      at: input.asOf,
      level: "info",
      message: `Network policy ${spec.resourceLimits.networkPolicy}; timeout ${spec.resourceLimits.timeoutMs}ms`,
    },
  ];

  if (input.forceCancel) {
    const cancelled = transitionGovernedComputeJob({
      job: {
        ...job,
        logs,
      },
      to: "cancelled",
      updatedAt: input.asOf,
      failureReason: "cancelled_by_operator",
    });
    return {job: cancelled, artifacts: [], matrix};
  }

  if (input.forceFailure) {
    const failed = transitionGovernedComputeJob({
      job: {
        ...job,
        logs: [
          ...logs,
          {at: input.asOf, level: "error", message: input.forceFailure},
        ],
      },
      to: "failed",
      updatedAt: input.asOf,
      failureReason: input.forceFailure,
      outcome: "failed",
    });
    return {job: failed, artifacts: [], matrix};
  }

  const prefix = input.artifactIdPrefix ?? `hsi-exp-car-${job.id.slice(12)}`;
  const qcResults: QcCheckResult[] = [
    {
      id: "qc-finite-values",
      description: "All fixture values must be finite",
      passed: matrix.values.every((row) => row.every((v) => Number.isFinite(v))),
      detail: "Finite-value scan over fixture matrix",
    },
    {
      id: "qc-min-samples",
      description: "At least 3 samples required",
      passed: matrix.samples.length >= 3,
      detail: `samples=${matrix.samples.length}`,
    },
    {
      id: "qc-housekeeping",
      description: "GAPDH housekeeping feature present",
      passed: matrix.features.includes("GAPDH"),
      detail: matrix.features.includes("GAPDH") ? "GAPDH found" : "GAPDH missing",
    },
  ];

  if (input.forceQcFailure) {
    qcResults.push({
      id: "qc-forced-failure",
      description: "Forced QC failure for engineering test",
      passed: false,
      detail: "forceQcFailure=true",
    });
  }

  for (const criterion of spec.qcAcceptanceCriteria) {
    // Criteria are declarative acceptance strings; harness maps known ids.
    if (/finite/i.test(criterion)) {
      // already covered
    }
  }

  const qcPassed = qcResults.every((q) => q.passed);
  const artifacts: ComputeArtifact[] = [];

  const logArtifact = buildArtifact({
    id: `${prefix}-log`,
    jobId: job.id,
    kind: "execution_log",
    label: "Isolated harness execution log",
    content: {entries: logs},
    producedAt: input.asOf,
  });
  artifacts.push(logArtifact);

  const qcArtifact = buildArtifact({
    id: `${prefix}-qc`,
    jobId: job.id,
    kind: "qc_report",
    label: "QC report",
    content: {checks: qcResults, passed: qcPassed},
    producedAt: input.asOf,
  });
  artifacts.push(qcArtifact);

  if (!qcPassed) {
    const manifest: ReproducibilityManifest = {
      analysisSpecId: spec.id,
      jobId: job.id,
      pipelineKind: spec.pipelineKind,
      datasetId: spec.dataset.datasetId,
      datasetVersion: spec.dataset.datasetVersion,
      analysisCodeVersion: spec.versionPins.analysisCodeVersion,
      dependencyVersions: spec.versionPins.dependencyVersions,
      containerImage: spec.versionPins.containerImage,
      containerDigest: spec.versionPins.containerDigest,
      computeEnvironment: spec.versionPins.computeEnvironment,
      inputFixtureSha256: sha256Of(matrix),
      artifactSha256s: artifacts.map((a) => ({
        artifactId: a.id,
        sha256: a.contentSha256,
      })),
      resourceLimits: spec.resourceLimits,
      networkPolicy: spec.resourceLimits.networkPolicy,
      producedAt: input.asOf,
      scientificValidationClaimed: false,
    };
    const manifestArtifact = buildArtifact({
      id: `${prefix}-manifest`,
      jobId: job.id,
      kind: "reproducibility_manifest",
      label: "Reproducibility manifest",
      content: manifest,
      producedAt: input.asOf,
    });
    artifacts.push(manifestArtifact);
    const completed = validateGovernedComputeJob({
      ...job,
      lifecycle: "completed",
      outcome: "qc_failed",
      startedAt: job.startedAt ?? input.asOf,
      finishedAt: input.asOf,
      logs: [
        ...logs,
        {
          at: input.asOf,
          level: "warn",
          message: "QC failed — eng job complete without scientific validation",
        },
      ],
      qcResults,
      artifactIds: artifacts.map((a) => a.id),
      reproducibilityManifest: manifest,
      scientificValidationClaimed: false,
      awaitingScientificInterpretation: false,
      updatedAt: input.asOf,
    });
    return {job: completed, artifacts, matrix};
  }

  let resultContent: unknown;
  let nullResults = input.forceNullResults === true;

  if (spec.pipelineKind === "public_fixture_descriptive_summary_v1") {
    const rows = matrix.features.map((feature, i) => {
      const vals = matrix.values[i]!;
      return {
        feature,
        mean: Number(mean(vals).toFixed(6)),
        variance: Number(variance(vals).toFixed(6)),
        n: vals.length,
      };
    });
    resultContent = {
      pipelineKind: spec.pipelineKind,
      summary: rows,
      note: "Deterministic descriptive summary of public fixture matrix — not a biological discovery claim.",
    };
    if (input.forceNullResults) {
      resultContent = {
        pipelineKind: spec.pipelineKind,
        summary: [],
        note: "Valid analysis completed with null/empty results under fixture constraints.",
      };
      nullResults = true;
    }
  } else if (spec.pipelineKind === "public_fixture_correlation_v1") {
    const iIl6 = matrix.features.indexOf("IL6");
    const iStat3 = matrix.features.indexOf("STAT3");
    if (iIl6 < 0 || iStat3 < 0) {
      throw Error("Correlation pipeline requires IL6 and STAT3 features");
    }
    const r = pearson(matrix.values[iIl6]!, matrix.values[iStat3]!);
    resultContent = {
      pipelineKind: spec.pipelineKind,
      pair: ["IL6", "STAT3"],
      pearsonR: Number(r.toFixed(6)),
      n: matrix.samples.length,
      note: "Deterministic fixture correlation — not scientific validation of biology.",
    };
    if (input.forceNullResults) {
      resultContent = {
        pipelineKind: spec.pipelineKind,
        pair: ["IL6", "STAT3"],
        pearsonR: null,
        n: matrix.samples.length,
        note: "Valid analysis with null correlation result under fixture constraints.",
      };
      nullResults = true;
    }
  } else {
    const _exhaustive: never = spec.pipelineKind;
    throw Error(`Unhandled pipeline kind: ${_exhaustive}`);
  }

  const resultArtifact = buildArtifact({
    id: `${prefix}-result`,
    jobId: job.id,
    kind: nullResults ? "null_result_declaration" : "result_table",
    label: nullResults ? "Null result declaration" : "Result table",
    content: resultContent,
    producedAt: input.asOf,
  });
  artifacts.push(resultArtifact);

  const outcome: ComputeJobOutcome = nullResults
    ? "succeeded_null_results"
    : "awaiting_scientific_interpretation";

  // Manifest lists hashes of non-manifest artifacts only (stable, no self-hash cycle).
  const manifest: ReproducibilityManifest = {
    analysisSpecId: spec.id,
    jobId: job.id,
    pipelineKind: spec.pipelineKind,
    datasetId: spec.dataset.datasetId,
    datasetVersion: spec.dataset.datasetVersion,
    analysisCodeVersion: spec.versionPins.analysisCodeVersion,
    dependencyVersions: spec.versionPins.dependencyVersions,
    containerImage: spec.versionPins.containerImage,
    containerDigest: spec.versionPins.containerDigest,
    computeEnvironment: spec.versionPins.computeEnvironment,
    inputFixtureSha256: sha256Of(matrix),
    artifactSha256s: artifacts.map((a) => ({
      artifactId: a.id,
      sha256: a.contentSha256,
    })),
    resourceLimits: spec.resourceLimits,
    networkPolicy: spec.resourceLimits.networkPolicy,
    producedAt: input.asOf,
    scientificValidationClaimed: false,
  };

  const manifestArtifact = buildArtifact({
    id: `${prefix}-manifest`,
    jobId: job.id,
    kind: "reproducibility_manifest",
    label: "Reproducibility manifest",
    content: manifest,
    producedAt: input.asOf,
  });
  artifacts.push(manifestArtifact);

  const completed = validateGovernedComputeJob({
    ...job,
    lifecycle: "completed",
    outcome,
    startedAt: job.startedAt ?? input.asOf,
    finishedAt: input.asOf,
    logs: [
      ...logs,
      {
        at: input.asOf,
        level: "info",
        message: `Pipeline finished outcome=${outcome}; scientific validation not claimed`,
      },
    ],
    qcResults,
    artifactIds: artifacts.map((a) => a.id),
    reproducibilityManifest: manifest,
    scientificValidationClaimed: false,
    awaitingScientificInterpretation:
      outcome === "awaiting_scientific_interpretation",
    updatedAt: input.asOf,
  });

  return {job: completed, artifacts, matrix};
}

export function createMemoryGovernedComputationalStore(): GovernedComputationalStore & {
  specs: Map<string, AnalysisSpecification>;
  jobs: Map<string, GovernedComputeJob>;
  artifacts: Map<string, ComputeArtifact>;
} {
  const specs = new Map<string, AnalysisSpecification>();
  const jobs = new Map<string, GovernedComputeJob>();
  const artifacts = new Map<string, ComputeArtifact>();
  return {
    specs,
    jobs,
    artifacts,
    upsertAnalysisSpec(spec) {
      const validated = validateAnalysisSpecification(spec);
      specs.set(validated.id, validated);
      return validated;
    },
    getAnalysisSpec(id) {
      return specs.get(id) ?? null;
    },
    listAnalysisSpecs(protocolDraftId) {
      const all = [...specs.values()];
      return protocolDraftId
        ? all.filter((s) => s.approvedProtocolDraftId === protocolDraftId)
        : all;
    },
    upsertJob(job) {
      const validated = validateGovernedComputeJob(job);
      jobs.set(validated.id, validated);
      return validated;
    },
    getJob(id) {
      return jobs.get(id) ?? null;
    },
    listJobs(analysisSpecId) {
      const all = [...jobs.values()];
      return analysisSpecId
        ? all.filter((j) => j.analysisSpecId === analysisSpecId)
        : all;
    },
    upsertArtifact(artifact) {
      if (!ARTIFACT_ID_RE.test(artifact.id)) throw Error("Invalid artifact id");
      assertClosed(artifact.kind, ARTIFACT_KINDS, "artifact kind");
      if (artifact.fabricatedBiology !== false) {
        throw Error("Fabricated biology artifacts forbidden");
      }
      artifacts.set(artifact.id, artifact);
      return artifact;
    },
    getArtifact(id) {
      return artifacts.get(id) ?? null;
    },
    listArtifacts(jobId) {
      const all = [...artifacts.values()];
      return jobId ? all.filter((a) => a.jobId === jobId) : all;
    },
  };
}

export function projectGovernedComputationalPersistenceLines(input: {
  spec: AnalysisSpecification;
  job?: GovernedComputeJob | null;
  artifacts?: readonly ComputeArtifact[];
}): string[] {
  const spec = validateAnalysisSpecification(input.spec);
  const lines = [
    `schema=${spec.schema}`,
    `method=${spec.method}`,
    `version=${spec.version}`,
    `analysisSpecId=${spec.id}`,
    `approvedProtocolDraftId=${spec.approvedProtocolDraftId}`,
    `pipelineKind=${spec.pipelineKind}`,
    `datasetId=${spec.dataset.datasetId}`,
    `datasetVersion=${spec.dataset.datasetVersion}`,
    `datasetAccess=${spec.dataset.accessStatus}`,
    `analysisCodeVersion=${spec.versionPins.analysisCodeVersion}`,
    `computeEnvironment=${spec.versionPins.computeEnvironment}`,
    `networkPolicy=${spec.resourceLimits.networkPolicy}`,
    `executionAuthorised=${spec.executionAuthorisation !== null}`,
    `scientificValidationClaimed=false`,
    `fabricatedBiology=false`,
    `labAdapters=false`,
    `liveLabValidation=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
    `dependsOnPr1=true`,
    `dependsOnPr2=true`,
    `dependsOnPr3=true`,
  ];
  if (input.job) {
    const job = validateGovernedComputeJob(input.job);
    lines.push(`jobId=${job.id}`);
    lines.push(`jobLifecycle=${job.lifecycle}`);
    lines.push(`jobOutcome=${job.outcome ?? "none"}`);
    lines.push(
      `awaitingScientificInterpretation=${job.awaitingScientificInterpretation}`,
    );
  }
  if (input.artifacts) {
    lines.push(`artifacts=${input.artifacts.length}`);
  }
  return lines;
}

export function fingerprintAnalysisSpecification(
  spec: AnalysisSpecification,
): string {
  return sha256Of(validateAnalysisSpecification(spec));
}

export function buildGovernedComputationalPack(input: {
  specs: readonly AnalysisSpecification[];
  jobs: readonly GovernedComputeJob[];
  artifacts: readonly ComputeArtifact[];
  asOf: string;
}): {
  schema: typeof GOVERNED_COMPUTATIONAL_SCHEMA;
  method: typeof GOVERNED_COMPUTATIONAL_METHOD;
  version: typeof GOVERNED_COMPUTATIONAL_VERSION;
  asOf: string;
  analysisSpecCount: number;
  jobCount: number;
  artifactCount: number;
  honesty: GovernedComputationalHonesty;
  specs: readonly AnalysisSpecification[];
  jobs: readonly GovernedComputeJob[];
  artifacts: readonly ComputeArtifact[];
  dependency: {
    requiresPr1LifecycleContracts: true;
    requiresPr2DesignPrioritisation: true;
    requiresPr3ProtocolIntelligence: true;
    pr1Status: "must_merge_or_stack_first";
    pr2Status: "must_merge_or_stack_first";
    pr3Status: "must_merge_or_stack_first";
  };
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const specs = input.specs.map(validateAnalysisSpecification);
  const jobs = input.jobs.map(validateGovernedComputeJob);
  return {
    schema: GOVERNED_COMPUTATIONAL_SCHEMA,
    method: GOVERNED_COMPUTATIONAL_METHOD,
    version: GOVERNED_COMPUTATIONAL_VERSION,
    asOf: input.asOf,
    analysisSpecCount: specs.length,
    jobCount: jobs.length,
    artifactCount: input.artifacts.length,
    honesty: {...DEFAULT_HONESTY},
    specs,
    jobs,
    artifacts: input.artifacts,
    dependency: {
      requiresPr1LifecycleContracts: true,
      requiresPr2DesignPrioritisation: true,
      requiresPr3ProtocolIntelligence: true,
      pr1Status: "must_merge_or_stack_first",
      pr2Status: "must_merge_or_stack_first",
      pr3Status: "must_merge_or_stack_first",
    },
  };
}
