/**
 * Milestone 3 / PR1 — Hypothesis Registry & Evidence Contracts.
 *
 * Extends N2 evidence-ledger hypothesis assertion kind and N7 experiment
 * prediction lineage with a first-class lifecycle. Does NOT invent wet-lab
 * outcomes, LLM probabilities, Gate C approval, or graph promotion.
 *
 * Binding honesty:
 * - Review approval ≠ experimental validation.
 * - Confidence is not_assessed; numericConfidence stays null (no LLM-as-probability).
 * - Fixtures ≠ live evidence / real observation.
 * - Supersession preserves lineage; never silent rewrite of prior statements.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";

export const HYPOTHESIS_REGISTRY_SCHEMA = "hsi-hypothesis-registry-1" as const;
export const HYPOTHESIS_REGISTRY_METHOD = "hsi.hypothesis_registry.v1" as const;
export const HYPOTHESIS_REGISTRY_VERSION = "0.1.0" as const;

/** Closed lifecycle — transitions are fail-closed in `transitionHypothesisState`. */
export const HYPOTHESIS_LIFECYCLE_STATES = [
  "proposed",
  "under_review",
  "review_approved",
  "review_rejected",
  "queued_for_experiment",
  "experiment_linked",
  "superseded",
  "withdrawn",
] as const;
export type HypothesisLifecycleState = (typeof HYPOTHESIS_LIFECYCLE_STATES)[number];

export type HypothesisReviewApprovalStatus =
  | "not_submitted"
  | "pending"
  | "approved"
  | "rejected";

/** Orthogonal to review — never set from review alone. */
export type HypothesisExperimentalValidationStatus =
  | "not_started"
  | "queued"
  | "linked_to_experiment"
  | "awaiting_authorised_observation"
  | "not_experimentally_validated";

export type HypothesisConfidence = {
  /** Only permitted model for PR1 — never LLM/softmax probability. */
  model: "not_assessed";
  numericConfidence: null;
  note: string;
};

/** Evidence / investigation / experiment contract refs (ids only — no invented payloads). */
export type HypothesisEvidenceContract = {
  /** Optional investigation run / workspace id. */
  investigationId: string | null;
  /** N2 evidence ledger record ids (hypothesis/prediction/finding). */
  evidenceLedgerRecordIds: readonly string[];
  /** N7 experiment ledger record ids (prediction freeze lineage). */
  experimentRecordIds: readonly string[];
  /** Dynamic persistence / candidate source ids when available. */
  dynamicCandidateSourceIds: readonly string[];
  /** Optional structured comparison ids (M2 #90) — may be empty until merge. */
  structuredComparisonIds: readonly string[];
  /** Optional opposing-search / gap assessment ids. */
  opposingOrGapRecordIds: readonly string[];
};

export type HypothesisRecord = {
  schemaVersion: typeof HYPOTHESIS_REGISTRY_SCHEMA;
  id: string;
  version: number;
  parentVersion: number | null;
  lifecycle: HypothesisLifecycleState;
  statement: string;
  subjectId: string;
  predicate: string;
  objectId: string;
  falsifier: string;
  evidenceContract: HypothesisEvidenceContract;
  reviewApprovalStatus: HypothesisReviewApprovalStatus;
  experimentalValidationStatus: HypothesisExperimentalValidationStatus;
  /** Explicit orthogonality flag — always true. */
  reviewApprovalDistinctFromExperimentalValidation: true;
  confidence: HypothesisConfidence;
  supersededById: string | null;
  programme: "gut_immune_t2d" | "ssc_tfh_il21" | "unscoped_research";
  dataBasis: "fixture_engineering" | "declared_research" | "authorised_public_data";
  fixtureHonesty: boolean;
  scientificApproval: false;
  graphPromotable: false;
  experimentallyValidated: false;
  createdAt: string;
  updatedAt: string;
  contentHash: string;
  note: string;
};

export type HypothesisRegistry = {
  schemaVersion: typeof HYPOTHESIS_REGISTRY_SCHEMA;
  method: typeof HYPOTHESIS_REGISTRY_METHOD;
  version: typeof HYPOTHESIS_REGISTRY_VERSION;
  scientificApproval: false;
  graphPromotable: false;
  experimentallyValidatedClaimed: false;
  records: HypothesisRecord[];
  archives: HypothesisRecord[];
  honesty: {
    reviewApprovalDistinctFromExperimentalValidation: true;
    noLlmAsProbability: true;
    noFabricatedConfidence: true;
    fixturesAreNotLiveEvidence: true;
    fixturesAreNotWetLabOutcomes: true;
    gateCAutoApprove: false;
    cdsPhi: false;
    autoPromotedToApprovedGraph: false;
    m2StructuredComparisonOptional: true;
  };
};

export type ProposeHypothesisInput = {
  id: string;
  statement: string;
  subjectId: string;
  predicate: string;
  objectId: string;
  falsifier: string;
  programme?: HypothesisRecord["programme"];
  dataBasis?: HypothesisRecord["dataBasis"];
  fixtureHonesty?: boolean;
  investigationId?: string | null;
  evidenceLedgerRecordIds?: readonly string[];
  experimentRecordIds?: readonly string[];
  dynamicCandidateSourceIds?: readonly string[];
  structuredComparisonIds?: readonly string[];
  opposingOrGapRecordIds?: readonly string[];
  note?: string;
  createdAt?: string;
};

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{1,150}$/;

function fail(message: string): never {
  throw new Error(message);
}

function text(value: string, max: number): boolean {
  const t = value.trim();
  return t.length >= 1 && t.length <= max;
}

function iso(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function assertId(id: string, label: string): string {
  const t = id.trim();
  if (!ID.test(t)) fail(`Invalid ${label}`);
  return t;
}

function emptyContract(): HypothesisEvidenceContract {
  return {
    investigationId: null,
    evidenceLedgerRecordIds: [],
    experimentRecordIds: [],
    dynamicCandidateSourceIds: [],
    structuredComparisonIds: [],
    opposingOrGapRecordIds: [],
  };
}

function normaliseIdList(ids: readonly string[] | undefined, label: string): string[] {
  if (!ids) return [];
  if (!Array.isArray(ids) || ids.length > 64) fail(`Invalid ${label} list`);
  const out: string[] = [];
  for (const raw of ids) {
    if (typeof raw !== "string" || !ID.test(raw.trim())) fail(`Invalid ${label} id`);
    const id = raw.trim();
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

function defaultConfidence(): HypothesisConfidence {
  return {
    model: "not_assessed",
    numericConfidence: null,
    note: "Confidence is not assessed; LLM/softmax probabilities are refused.",
  };
}

function hashRecord(body: Omit<HypothesisRecord, "contentHash">): string {
  return createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
}

function assertHonesty(record: HypothesisRecord): void {
  if (record.scientificApproval !== false || record.graphPromotable !== false) {
    fail("Hypothesis must stay unapproved / non-promotable");
  }
  if (record.experimentallyValidated !== false) {
    fail("Registry cannot claim experimental validation on the record flag");
  }
  if (record.reviewApprovalDistinctFromExperimentalValidation !== true) {
    fail("Review approval must remain distinct from experimental validation");
  }
  if (record.confidence.model !== "not_assessed" || record.confidence.numericConfidence !== null) {
    fail("Fabricated / LLM confidence refused");
  }
  if (record.dataBasis === "fixture_engineering" && record.fixtureHonesty !== true) {
    fail("fixture_engineering requires fixtureHonesty=true");
  }
  if (record.dataBasis !== "fixture_engineering" && record.fixtureHonesty !== false) {
    fail("Non-fixture dataBasis requires fixtureHonesty=false");
  }
  // Review approved must never flip experimental validation.
  if (
    record.reviewApprovalStatus === "approved" &&
    record.experimentalValidationStatus !== "not_started" &&
    record.experimentalValidationStatus !== "queued" &&
    record.experimentalValidationStatus !== "linked_to_experiment" &&
    record.experimentalValidationStatus !== "awaiting_authorised_observation" &&
    record.experimentalValidationStatus !== "not_experimentally_validated"
  ) {
    fail("Invalid experimentalValidationStatus");
  }
  if (
    record.reviewApprovalStatus === "approved" &&
    record.experimentalValidationStatus === "not_started" &&
    record.lifecycle === "review_approved"
  ) {
    // expected: approved for review only
  }
}

export function emptyHypothesisRegistry(): HypothesisRegistry {
  return {
    schemaVersion: HYPOTHESIS_REGISTRY_SCHEMA,
    method: HYPOTHESIS_REGISTRY_METHOD,
    version: HYPOTHESIS_REGISTRY_VERSION,
    scientificApproval: false,
    graphPromotable: false,
    experimentallyValidatedClaimed: false,
    records: [],
    archives: [],
    honesty: {
      reviewApprovalDistinctFromExperimentalValidation: true,
      noLlmAsProbability: true,
      noFabricatedConfidence: true,
      fixturesAreNotLiveEvidence: true,
      fixturesAreNotWetLabOutcomes: true,
      gateCAutoApprove: false,
      cdsPhi: false,
      autoPromotedToApprovedGraph: false,
      m2StructuredComparisonOptional: true,
    },
  };
}

export function parseHypothesisRegistry(
  value: unknown,
  options?: {verifyContentHashes?: boolean},
): HypothesisRegistry {
  const reg = value as HypothesisRegistry;
  if (
    !reg ||
    reg.schemaVersion !== HYPOTHESIS_REGISTRY_SCHEMA ||
    reg.method !== HYPOTHESIS_REGISTRY_METHOD ||
    reg.version !== HYPOTHESIS_REGISTRY_VERSION ||
    reg.scientificApproval !== false ||
    reg.graphPromotable !== false ||
    reg.experimentallyValidatedClaimed !== false ||
    !Array.isArray(reg.records) ||
    !Array.isArray(reg.archives)
  ) {
    fail("Invalid hypothesis registry envelope");
  }
  if (
    reg.honesty?.reviewApprovalDistinctFromExperimentalValidation !== true ||
    reg.honesty.noLlmAsProbability !== true ||
    reg.honesty.noFabricatedConfidence !== true ||
    reg.honesty.gateCAutoApprove !== false ||
    reg.honesty.autoPromotedToApprovedGraph !== false
  ) {
    fail("Hypothesis registry honesty violated");
  }
  const verifyHashes = options?.verifyContentHashes !== false;
  for (const row of [...reg.records, ...reg.archives]) {
    assertHonesty(row);
    if (!verifyHashes) continue;
    const {contentHash, ...body} = row;
    if (hashRecord(body) !== contentHash) fail(`Hypothesis content hash mismatch: ${row.id}`);
  }
  return reg;
}

export function readHypothesisRecord(registry: HypothesisRegistry, id: string): HypothesisRecord {
  const row = registry.records.find((r) => r.id === id);
  if (!row) fail(`Hypothesis not found: ${id}`);
  return row;
}

/**
 * Propose a new hypothesis (lifecycle=proposed).
 * Thin investigation / evidence / experiment id hooks only.
 */
export function proposeHypothesis(
  registry: HypothesisRegistry,
  input: ProposeHypothesisInput,
): HypothesisRegistry {
  parseHypothesisRegistry(registry);
  const id = assertId(input.id, "hypothesis id");
  if (registry.records.some((r) => r.id === id)) fail(`Hypothesis already exists: ${id}`);
  if (!text(input.statement, 4000)) fail("Invalid hypothesis statement");
  if (!text(input.subjectId, 200) || !text(input.predicate, 200) || !text(input.objectId, 200)) {
    fail("Invalid hypothesis triple");
  }
  if (!text(input.falsifier, 2000)) fail("Hypothesis requires an explicit falsifier");

  const dataBasis = input.dataBasis ?? "fixture_engineering";
  const fixtureHonesty =
    input.fixtureHonesty ?? (dataBasis === "fixture_engineering");
  const createdAt = input.createdAt ?? new Date().toISOString();
  if (!iso(createdAt)) fail("Invalid createdAt");

  const investigationId =
    input.investigationId === undefined || input.investigationId === null
      ? null
      : assertId(input.investigationId, "investigationId");

  const body: Omit<HypothesisRecord, "contentHash"> = {
    schemaVersion: HYPOTHESIS_REGISTRY_SCHEMA,
    id,
    version: 1,
    parentVersion: null,
    lifecycle: "proposed",
    statement: input.statement.trim(),
    subjectId: input.subjectId.trim(),
    predicate: input.predicate.trim(),
    objectId: input.objectId.trim(),
    falsifier: input.falsifier.trim(),
    evidenceContract: {
      investigationId,
      evidenceLedgerRecordIds: normaliseIdList(input.evidenceLedgerRecordIds, "evidenceLedgerRecordIds"),
      experimentRecordIds: normaliseIdList(input.experimentRecordIds, "experimentRecordIds"),
      dynamicCandidateSourceIds: normaliseIdList(
        input.dynamicCandidateSourceIds,
        "dynamicCandidateSourceIds",
      ),
      structuredComparisonIds: normaliseIdList(
        input.structuredComparisonIds,
        "structuredComparisonIds",
      ),
      opposingOrGapRecordIds: normaliseIdList(
        input.opposingOrGapRecordIds,
        "opposingOrGapRecordIds",
      ),
    },
    reviewApprovalStatus: "not_submitted",
    experimentalValidationStatus: "not_started",
    reviewApprovalDistinctFromExperimentalValidation: true,
    confidence: defaultConfidence(),
    supersededById: null,
    programme: input.programme ?? "unscoped_research",
    dataBasis,
    fixtureHonesty,
    scientificApproval: false,
    graphPromotable: false,
    experimentallyValidated: false,
    createdAt,
    updatedAt: createdAt,
    note: (input.note ?? "").trim(),
  };
  assertHonesty(body as HypothesisRecord);
  const record: HypothesisRecord = {...body, contentHash: hashRecord(body)};
  return {
    ...registry,
    records: [...registry.records, record],
  };
}

const ALLOWED_TRANSITIONS: Record<
  HypothesisLifecycleState,
  readonly HypothesisLifecycleState[]
> = {
  proposed: ["under_review", "withdrawn"],
  under_review: ["review_approved", "review_rejected", "withdrawn"],
  review_approved: ["queued_for_experiment", "superseded", "withdrawn"],
  review_rejected: ["superseded", "withdrawn"],
  queued_for_experiment: ["experiment_linked", "superseded", "withdrawn"],
  experiment_linked: ["superseded", "withdrawn"],
  superseded: [],
  withdrawn: [],
};

function reviewStatusForLifecycle(
  lifecycle: HypothesisLifecycleState,
  prior: HypothesisReviewApprovalStatus,
): HypothesisReviewApprovalStatus {
  switch (lifecycle) {
    case "proposed":
      return "not_submitted";
    case "under_review":
      return "pending";
    case "review_approved":
    case "queued_for_experiment":
    case "experiment_linked":
      return "approved";
    case "review_rejected":
      return "rejected";
    case "superseded":
    case "withdrawn":
      // Preserve prior review disposition on terminal states.
      return prior;
    default: {
      const _exhaustive: never = lifecycle;
      return _exhaustive;
    }
  }
}

function experimentalStatusForLifecycle(
  lifecycle: HypothesisLifecycleState,
  prior: HypothesisExperimentalValidationStatus,
): HypothesisExperimentalValidationStatus {
  switch (lifecycle) {
    case "queued_for_experiment":
      return "queued";
    case "experiment_linked":
      return "linked_to_experiment";
    case "proposed":
    case "under_review":
    case "review_approved":
    case "review_rejected":
    case "superseded":
    case "withdrawn":
      // Review / terminal transitions never mint experimental validation.
      if (
        prior === "queued" ||
        prior === "linked_to_experiment" ||
        prior === "awaiting_authorised_observation"
      ) {
        return prior;
      }
      return "not_experimentally_validated";
    default: {
      const _exhaustive: never = lifecycle;
      return _exhaustive;
    }
  }
}

function replaceRecord(registry: HypothesisRegistry, next: HypothesisRecord): HypothesisRegistry {
  assertHonesty(next);
  const idx = registry.records.findIndex((r) => r.id === next.id);
  if (idx < 0) fail(`Hypothesis not found: ${next.id}`);
  const records = [...registry.records];
  records[idx] = next;
  return {...registry, records};
}

function bump(
  prior: HypothesisRecord,
  patch: Partial<Omit<HypothesisRecord, "contentHash" | "id" | "schemaVersion">> & {
    updatedAt: string;
  },
): HypothesisRecord {
  const {contentHash: _priorHash, ...priorBody} = prior;
  const body: Omit<HypothesisRecord, "contentHash"> = {
    ...priorBody,
    ...patch,
    version: prior.version + 1,
    parentVersion: prior.version,
    scientificApproval: false,
    graphPromotable: false,
    experimentallyValidated: false,
    reviewApprovalDistinctFromExperimentalValidation: true,
    confidence: defaultConfidence(),
  };
  return {...body, contentHash: hashRecord(body)};
}

/**
 * Fail-closed lifecycle transition.
 * Review approval never sets experimentallyValidated or invents outcomes.
 */
export function transitionHypothesisState(input: {
  registry: HypothesisRegistry;
  id: string;
  to: HypothesisLifecycleState;
  updatedAt?: string;
  supersededById?: string | null;
  note?: string;
}): HypothesisRegistry {
  parseHypothesisRegistry(input.registry);
  const prior = readHypothesisRecord(input.registry, input.id);
  const allowed = ALLOWED_TRANSITIONS[prior.lifecycle];
  if (!allowed.includes(input.to)) {
    fail(`Illegal hypothesis transition ${prior.lifecycle} → ${input.to}`);
  }
  const updatedAt = input.updatedAt ?? new Date().toISOString();
  if (!iso(updatedAt)) fail("Invalid updatedAt");

  if (input.to === "superseded") {
    const successor = input.supersededById?.trim();
    if (!successor || !ID.test(successor)) fail("superseded requires supersededById");
  }

  let experimentalValidationStatus = experimentalStatusForLifecycle(
    input.to,
    prior.experimentalValidationStatus,
  );
  // Explicit: landing on review_approved keeps experimental status non-validated.
  if (input.to === "review_approved") {
    experimentalValidationStatus = "not_experimentally_validated";
  }

  const next = bump(prior, {
    lifecycle: input.to,
    reviewApprovalStatus: reviewStatusForLifecycle(input.to, prior.reviewApprovalStatus),
    experimentalValidationStatus,
    supersededById: input.to === "superseded" ? input.supersededById!.trim() : prior.supersededById,
    updatedAt,
    note: input.note?.trim() ? input.note.trim() : prior.note,
  });
  return replaceRecord(input.registry, next);
}

/**
 * Attach evidence / investigation / experiment refs without changing lifecycle.
 * Structured comparison ids are optional (M2 may be in-flight).
 */
export function bindHypothesisEvidenceContract(input: {
  registry: HypothesisRegistry;
  id: string;
  investigationId?: string | null;
  evidenceLedgerRecordIds?: readonly string[];
  experimentRecordIds?: readonly string[];
  dynamicCandidateSourceIds?: readonly string[];
  structuredComparisonIds?: readonly string[];
  opposingOrGapRecordIds?: readonly string[];
  updatedAt?: string;
}): HypothesisRegistry {
  parseHypothesisRegistry(input.registry);
  const prior = readHypothesisRecord(input.registry, input.id);
  if (prior.lifecycle === "withdrawn" || prior.lifecycle === "superseded") {
    fail("Cannot bind evidence contract on terminal hypothesis");
  }
  const updatedAt = input.updatedAt ?? new Date().toISOString();
  if (!iso(updatedAt)) fail("Invalid updatedAt");

  const investigationId =
    input.investigationId === undefined
      ? prior.evidenceContract.investigationId
      : input.investigationId === null
        ? null
        : assertId(input.investigationId, "investigationId");

  const contract: HypothesisEvidenceContract = {
    investigationId,
    evidenceLedgerRecordIds:
      input.evidenceLedgerRecordIds !== undefined
        ? normaliseIdList(input.evidenceLedgerRecordIds, "evidenceLedgerRecordIds")
        : [...prior.evidenceContract.evidenceLedgerRecordIds],
    experimentRecordIds:
      input.experimentRecordIds !== undefined
        ? normaliseIdList(input.experimentRecordIds, "experimentRecordIds")
        : [...prior.evidenceContract.experimentRecordIds],
    dynamicCandidateSourceIds:
      input.dynamicCandidateSourceIds !== undefined
        ? normaliseIdList(input.dynamicCandidateSourceIds, "dynamicCandidateSourceIds")
        : [...prior.evidenceContract.dynamicCandidateSourceIds],
    structuredComparisonIds:
      input.structuredComparisonIds !== undefined
        ? normaliseIdList(input.structuredComparisonIds, "structuredComparisonIds")
        : [...prior.evidenceContract.structuredComparisonIds],
    opposingOrGapRecordIds:
      input.opposingOrGapRecordIds !== undefined
        ? normaliseIdList(input.opposingOrGapRecordIds, "opposingOrGapRecordIds")
        : [...prior.evidenceContract.opposingOrGapRecordIds],
  };

  let lifecycle = prior.lifecycle;
  let experimentalValidationStatus = prior.experimentalValidationStatus;
  if (contract.experimentRecordIds.length > 0 && prior.lifecycle === "queued_for_experiment") {
    lifecycle = "experiment_linked";
    experimentalValidationStatus = "linked_to_experiment";
  } else if (
    contract.experimentRecordIds.length > 0 &&
    prior.lifecycle === "experiment_linked"
  ) {
    experimentalValidationStatus = "linked_to_experiment";
  }

  const next = bump(prior, {
    evidenceContract: contract,
    lifecycle,
    experimentalValidationStatus,
    reviewApprovalStatus: reviewStatusForLifecycle(lifecycle, prior.reviewApprovalStatus),
    updatedAt,
  });
  return replaceRecord(input.registry, next);
}

/**
 * Thin projector for workbench / brief consumers.
 * Never emits experimental validation from review alone.
 */
export function projectHypothesisEvidenceContractSummary(record: HypothesisRecord): {
  schemaVersion: "hsi-hypothesis-evidence-contract-summary-1";
  hypothesisId: string;
  lifecycle: HypothesisLifecycleState;
  reviewApprovalStatus: HypothesisReviewApprovalStatus;
  experimentalValidationStatus: HypothesisExperimentalValidationStatus;
  reviewApprovalDistinctFromExperimentalValidation: true;
  investigationId: string | null;
  evidenceLedgerRecordIds: readonly string[];
  experimentRecordIds: readonly string[];
  confidenceModel: "not_assessed";
  numericConfidence: null;
  scientificallyValidated: false;
  graphPromotable: false;
} {
  assertHonesty(record);
  return {
    schemaVersion: "hsi-hypothesis-evidence-contract-summary-1",
    hypothesisId: record.id,
    lifecycle: record.lifecycle,
    reviewApprovalStatus: record.reviewApprovalStatus,
    experimentalValidationStatus: record.experimentalValidationStatus,
    reviewApprovalDistinctFromExperimentalValidation: true,
    investigationId: record.evidenceContract.investigationId,
    evidenceLedgerRecordIds: record.evidenceContract.evidenceLedgerRecordIds,
    experimentRecordIds: record.evidenceContract.experimentRecordIds,
    confidenceModel: "not_assessed",
    numericConfidence: null,
    scientificallyValidated: false,
    graphPromotable: false,
  };
}
