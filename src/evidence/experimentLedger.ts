/**
 * N7 research-safe experiment ledger.
 * Freezes a prediction content hash before any outcome may attach.
 * Distinguishes supported / negative-null / inconclusive / inactive-assay / technical-failure.
 * Review candidates cannot publish graph facts or edit frozen N3/N6 evaluation data.
 * Never invents real laboratory results; fixture rows must declare fixture honesty.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";

export const EXPERIMENT_LEDGER_SCHEMA = "hsi-experiment-ledger-1" as const;

/** Distinct measured-outcome classes — never collapse at rest. */
export const EXPERIMENT_OUTCOME_CLASSES = [
  "supported",
  "negative_null",
  "inconclusive",
  "inactive_assay",
  "technical_failure",
] as const;
export type ExperimentOutcomeClass = (typeof EXPERIMENT_OUTCOME_CLASSES)[number];

export const EXPERIMENT_DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "partner_lab_agreement",
] as const;
export type ExperimentDataBasis = (typeof EXPERIMENT_DATA_BASES)[number];

export const EXPERIMENT_LIFECYCLE = [
  "prediction_draft",
  "prediction_frozen",
  "protocol_bound",
  "artifacts_attached",
  "outcome_recorded",
  "review_candidate",
  "withdrawn",
] as const;
export type ExperimentLifecycle = (typeof EXPERIMENT_LIFECYCLE)[number];

export const QC_STATUSES = ["not_run", "passed", "failed", "inconclusive"] as const;
export type ExperimentQcStatus = (typeof QC_STATUSES)[number];

export type GateStatus = "CLEARED" | "BLOCKED";

export type ExperimentPrediction = {
  /** Optional pointer into the N2 evidence ledger prediction row. */
  n2PredictionRecordId: string | null;
  n2PredictionVersion: number | null;
  assertion: string;
  subjectId: string;
  predicate: string;
  objectId: string;
  falsifier: string;
  /** Present only after freezePrediction — immutable thereafter. */
  freeze: {
    frozenAt: string;
    outcomeUnknownAtFreeze: true;
    predictionContentHash: string;
  } | null;
};

export type ExperimentProtocol = {
  protocolId: string;
  compoundIdentity: string;
  dose: string | null;
  doseUnit: string | null;
  tissueOrCellState: string | null;
  controls: string[];
  timing: string | null;
  batchId: string | null;
  deviations: string[];
  missingFields: Array<
    "dose" | "doseUnit" | "tissueOrCellState" | "timing" | "batchId"
  >;
};

export type ExperimentRawArtifact = {
  artifactId: string;
  pointer: string;
  contentHash: string | null;
  capturedAt: string | null;
  notes: string;
};

export type ExperimentProcessing = {
  processingVersion: string;
  calibrationNotes: string;
  pipelineId: string;
};

export type ExperimentQc = {
  status: ExperimentQcStatus;
  assessedAt: string | null;
  notes: string;
  /** Failed QC never refutes biology by itself. */
  biologyNotRefutedByFailedQc: true;
};

export type ExperimentOutcome = {
  outcomeClass: ExperimentOutcomeClass;
  recordedAt: string;
  summary: string;
  measuredValues: Array<{name: string; value: string; unit: string | null}>;
  /**
   * Negative/null results do not establish absence of effect.
   * Forced true whenever outcomeClass is negative_null.
   */
  noEffectNotEstablished: boolean;
  /**
   * Technical failure / inactive assay never refute the biological prediction.
   * Forced true for technical_failure and inactive_assay.
   */
  biologyNotRefuted: boolean;
  /**
   * Must equal the frozen prediction content hash at attach time.
   * Immutable lineage lock — outcome cannot rewrite the prediction.
   */
  lockedPredictionContentHash: string;
};

export type ExperimentReviewCandidate = {
  submittedAt: string;
  /** Always false — review candidates are not graph facts. */
  graphPromotable: false;
  scientificApproval: false;
  /** Explicit refusal to mutate frozen evaluation artifacts. */
  mayEditFrozenEvaluationData: false;
  note: string;
};

export type ExperimentRecord = {
  id: string;
  version: number;
  parentVersion: number | null;
  lifecycle: ExperimentLifecycle;
  dataBasis: ExperimentDataBasis;
  /** True only for fixture_engineering rows. */
  fixtureHonesty: boolean;
  programme: "gut_immune_t2d";
  prediction: ExperimentPrediction;
  protocol: ExperimentProtocol | null;
  rawArtifacts: ExperimentRawArtifact[];
  processing: ExperimentProcessing | null;
  qc: ExperimentQc | null;
  outcome: ExperimentOutcome | null;
  reviewCandidate: ExperimentReviewCandidate | null;
  /** Optional pins — N7 must not rewrite these blobs. */
  frozenEvalPins: {
    n3KitHash: string | null;
    n6ProtocolHash: string | null;
    mayMutatePinnedEval: false;
  };
  scientificApproval: false;
  graphPromotable: false;
  realObservationClaimed: false;
  createdAt: string;
  contentHash: string;
};

export type ExperimentLedger = {
  schemaVersion: typeof EXPERIMENT_LEDGER_SCHEMA;
  phase: "N7";
  programme: "gut_immune_t2d";
  scientificApproval: false;
  graphPromotable: false;
  realObservationClaimed: false;
  /** Engineering harness may be CLEARED while scientific observation stays BLOCKED. */
  engineeringHarness: GateStatus;
  realObservationAcceptance: GateStatus;
  publicDataOrPartnerAgreement: GateStatus;
  records: ExperimentRecord[];
  archives: ExperimentRecord[];
};

export type ExperimentRecordInput = Omit<
  ExperimentRecord,
  | "version"
  | "parentVersion"
  | "lifecycle"
  | "scientificApproval"
  | "graphPromotable"
  | "realObservationClaimed"
  | "contentHash"
  | "reviewCandidate"
  | "outcome"
  | "protocol"
  | "rawArtifacts"
  | "processing"
  | "qc"
> & {
  version?: number;
  parentVersion?: number | null;
  lifecycle?: ExperimentLifecycle;
  protocol?: ExperimentProtocol | null;
  rawArtifacts?: ExperimentRawArtifact[];
  processing?: ExperimentProcessing | null;
  qc?: ExperimentQc | null;
  outcome?: ExperimentOutcome | null;
  reviewCandidate?: ExperimentReviewCandidate | null;
};

export class ExperimentLedgerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExperimentLedgerError";
  }
}

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{1,150}$/;
const SHA = /^[a-f0-9]{64}$/;
const PROTOCOL_MISSING = ["dose", "doseUnit", "tissueOrCellState", "timing", "batchId"] as const;

function fail(message: string): never {
  throw new ExperimentLedgerError(message);
}

function text(v: unknown, max: number): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max && !/[\u0000-\u0008]/.test(v);
}

function exact(value: unknown, keys: string[]): void {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).sort().join("|") !== [...keys].sort().join("|")
  ) {
    fail("Invalid experiment ledger shape");
  }
}

function iso(v: unknown): v is string {
  return text(v, 40) && Number.isFinite(Date.parse(v));
}

function sha256Canonical(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

/** Hash of the pre-freeze prediction body (assertion + falsifier + triple). */
export function hashExperimentPredictionBody(
  prediction: Omit<ExperimentPrediction, "freeze"> & {freeze?: ExperimentPrediction["freeze"]},
): string {
  const {freeze: _ignored, ...body} = prediction;
  return sha256Canonical(body);
}

function hashRecordBody(record: Omit<ExperimentRecord, "contentHash">): string {
  return sha256Canonical(record);
}

function validateProtocol(protocol: ExperimentProtocol): void {
  exact(protocol, [
    "protocolId",
    "compoundIdentity",
    "dose",
    "doseUnit",
    "tissueOrCellState",
    "controls",
    "timing",
    "batchId",
    "deviations",
    "missingFields",
  ]);
  if (!ID.test(protocol.protocolId) || !text(protocol.compoundIdentity, 500)) fail("Invalid protocol identity");
  if (!Array.isArray(protocol.controls) || protocol.controls.length > 20) fail("Invalid controls");
  for (const c of protocol.controls) if (!text(c, 500)) fail("Invalid control");
  if (!Array.isArray(protocol.deviations) || protocol.deviations.length > 50) fail("Invalid deviations");
  for (const d of protocol.deviations) if (!text(d, 2000)) fail("Invalid deviation");
  if (
    !Array.isArray(protocol.missingFields) ||
    new Set(protocol.missingFields).size !== protocol.missingFields.length
  ) {
    fail("Protocol missingFields must be unique");
  }
  for (const field of protocol.missingFields) {
    if (!PROTOCOL_MISSING.includes(field)) fail(`Unknown protocol missing field: ${field}`);
  }
  for (const field of PROTOCOL_MISSING) {
    const value = protocol[field];
    if (value === null) {
      if (!protocol.missingFields.includes(field)) fail(`Null ${field} must be listed in missingFields`);
    } else if (!text(value, 500)) {
      fail(`Invalid protocol.${field}`);
    } else if (protocol.missingFields.includes(field)) {
      fail(`Present ${field} cannot be listed as missing`);
    }
  }
}

function validatePrediction(prediction: ExperimentPrediction): void {
  exact(prediction, [
    "n2PredictionRecordId",
    "n2PredictionVersion",
    "assertion",
    "subjectId",
    "predicate",
    "objectId",
    "falsifier",
    "freeze",
  ]);
  if (prediction.n2PredictionRecordId !== null && !ID.test(prediction.n2PredictionRecordId)) {
    fail("Invalid n2PredictionRecordId");
  }
  if (
    prediction.n2PredictionVersion !== null &&
    (!Number.isInteger(prediction.n2PredictionVersion) || prediction.n2PredictionVersion < 1)
  ) {
    fail("Invalid n2PredictionVersion");
  }
  if (
    (prediction.n2PredictionRecordId === null) !== (prediction.n2PredictionVersion === null)
  ) {
    fail("n2PredictionRecordId and n2PredictionVersion must both be set or both null");
  }
  if (
    !text(prediction.assertion, 5000) ||
    !ID.test(prediction.subjectId) ||
    !text(prediction.predicate, 120) ||
    !ID.test(prediction.objectId) ||
    !text(prediction.falsifier, 2000)
  ) {
    fail("Invalid prediction body");
  }
  if (prediction.freeze !== null) {
    exact(prediction.freeze, ["frozenAt", "outcomeUnknownAtFreeze", "predictionContentHash"]);
    if (
      !iso(prediction.freeze.frozenAt) ||
      prediction.freeze.outcomeUnknownAtFreeze !== true ||
      !SHA.test(prediction.freeze.predictionContentHash)
    ) {
      fail("Invalid prediction freeze");
    }
    const expected = hashExperimentPredictionBody(prediction);
    if (prediction.freeze.predictionContentHash !== expected) {
      fail("Frozen predictionContentHash does not match prediction body");
    }
  }
}

function validateOutcome(outcome: ExperimentOutcome, freeze: NonNullable<ExperimentPrediction["freeze"]>): void {
  exact(outcome, [
    "outcomeClass",
    "recordedAt",
    "summary",
    "measuredValues",
    "noEffectNotEstablished",
    "biologyNotRefuted",
    "lockedPredictionContentHash",
  ]);
  if (!EXPERIMENT_OUTCOME_CLASSES.includes(outcome.outcomeClass)) fail("Unknown outcomeClass");
  if (!iso(outcome.recordedAt) || !text(outcome.summary, 5000)) fail("Invalid outcome summary/time");
  if (!Array.isArray(outcome.measuredValues) || outcome.measuredValues.length > 50) fail("Invalid measuredValues");
  for (const mv of outcome.measuredValues) {
    exact(mv, ["name", "value", "unit"]);
    if (!text(mv.name, 200) || !text(mv.value, 500)) fail("Invalid measured value");
    if (mv.unit !== null && !text(mv.unit, 80)) fail("Invalid measured unit");
  }
  if (outcome.lockedPredictionContentHash !== freeze.predictionContentHash) {
    fail("Outcome lockedPredictionContentHash must equal frozen prediction hash");
  }
  if (Date.parse(outcome.recordedAt) < Date.parse(freeze.frozenAt)) {
    fail("Outcome cannot precede prediction freeze");
  }
  if (outcome.outcomeClass === "negative_null") {
    if (outcome.noEffectNotEstablished !== true) {
      fail("negative_null must set noEffectNotEstablished=true");
    }
  } else if (outcome.noEffectNotEstablished !== false) {
    fail("noEffectNotEstablished is reserved for negative_null");
  }
  if (outcome.outcomeClass === "technical_failure" || outcome.outcomeClass === "inactive_assay") {
    if (outcome.biologyNotRefuted !== true) {
      fail(`${outcome.outcomeClass} must set biologyNotRefuted=true`);
    }
  } else if (outcome.biologyNotRefuted !== false) {
    fail("biologyNotRefuted is reserved for technical_failure and inactive_assay");
  }
}

function validateLifecycleConsistency(record: ExperimentRecord): void {
  const hasFreeze = record.prediction.freeze !== null;
  const hasProtocol = record.protocol !== null;
  const hasArtifacts = record.rawArtifacts.length > 0 || record.processing !== null || record.qc !== null;
  const hasOutcome = record.outcome !== null;
  const hasReview = record.reviewCandidate !== null;

  switch (record.lifecycle) {
    case "prediction_draft":
      if (hasFreeze || hasProtocol || hasArtifacts || hasOutcome || hasReview) {
        fail("prediction_draft cannot carry freeze/protocol/artifacts/outcome/review");
      }
      break;
    case "prediction_frozen":
      if (!hasFreeze || hasProtocol || hasArtifacts || hasOutcome || hasReview) {
        fail("prediction_frozen requires freeze only");
      }
      break;
    case "protocol_bound":
      if (!hasFreeze || !hasProtocol || hasArtifacts || hasOutcome || hasReview) {
        fail("protocol_bound requires freeze+protocol only");
      }
      break;
    case "artifacts_attached":
      if (!hasFreeze || !hasProtocol || !hasArtifacts || hasOutcome || hasReview) {
        fail("artifacts_attached requires freeze+protocol+artifacts and no outcome");
      }
      break;
    case "outcome_recorded":
      if (!hasFreeze || !hasProtocol || !hasOutcome || hasReview) {
        fail("outcome_recorded requires freeze+protocol+outcome and no review yet");
      }
      break;
    case "review_candidate":
      if (!hasFreeze || !hasProtocol || !hasOutcome || !hasReview) {
        fail("review_candidate requires freeze+protocol+outcome+review");
      }
      break;
    case "withdrawn":
      break;
    default: {
      const _exhaustive: never = record.lifecycle;
      return _exhaustive;
    }
  }

  if (hasOutcome && !hasFreeze) fail("Outcome requires a frozen prediction");
  if (hasReview && !hasOutcome) fail("Review candidate requires an outcome");
}

function validateRecordShape(record: ExperimentRecord): void {
  exact(record, [
    "id",
    "version",
    "parentVersion",
    "lifecycle",
    "dataBasis",
    "fixtureHonesty",
    "programme",
    "prediction",
    "protocol",
    "rawArtifacts",
    "processing",
    "qc",
    "outcome",
    "reviewCandidate",
    "frozenEvalPins",
    "scientificApproval",
    "graphPromotable",
    "realObservationClaimed",
    "createdAt",
    "contentHash",
  ]);
  if (!ID.test(record.id)) fail("Invalid experiment id");
  if (!Number.isInteger(record.version) || record.version < 1) fail("Invalid version");
  if (
    record.parentVersion !== null &&
    (!Number.isInteger(record.parentVersion) ||
      record.parentVersion < 1 ||
      record.parentVersion >= record.version)
  ) {
    fail("Invalid parentVersion");
  }
  if (!EXPERIMENT_LIFECYCLE.includes(record.lifecycle)) fail("Unknown lifecycle");
  if (!EXPERIMENT_DATA_BASES.includes(record.dataBasis)) fail("Unknown dataBasis");
  if (record.programme !== "gut_immune_t2d") fail("Invalid programme");
  if (record.dataBasis === "fixture_engineering") {
    if (record.fixtureHonesty !== true) fail("fixture_engineering requires fixtureHonesty=true");
  } else if (record.fixtureHonesty !== false) {
    fail("Non-fixture rows cannot set fixtureHonesty");
  }
  if (
    record.scientificApproval !== false ||
    record.graphPromotable !== false ||
    record.realObservationClaimed !== false
  ) {
    fail("Experiment records cannot claim approval, graph promotion or real observation");
  }
  if (!iso(record.createdAt)) fail("Invalid createdAt");

  exact(record.frozenEvalPins, ["n3KitHash", "n6ProtocolHash", "mayMutatePinnedEval"]);
  if (record.frozenEvalPins.mayMutatePinnedEval !== false) {
    fail("Experiments cannot mutate frozen evaluation data");
  }
  if (record.frozenEvalPins.n3KitHash !== null && !SHA.test(record.frozenEvalPins.n3KitHash)) {
    fail("Invalid n3KitHash pin");
  }
  if (record.frozenEvalPins.n6ProtocolHash !== null && !SHA.test(record.frozenEvalPins.n6ProtocolHash)) {
    fail("Invalid n6ProtocolHash pin");
  }

  validatePrediction(record.prediction);
  if (record.protocol !== null) validateProtocol(record.protocol);

  if (!Array.isArray(record.rawArtifacts) || record.rawArtifacts.length > 50) fail("Invalid rawArtifacts");
  for (const art of record.rawArtifacts) {
    exact(art, ["artifactId", "pointer", "contentHash", "capturedAt", "notes"]);
    if (!ID.test(art.artifactId) || !text(art.pointer, 2000) || !text(art.notes, 2000)) {
      fail("Invalid raw artifact");
    }
    if (art.contentHash !== null && !SHA.test(art.contentHash)) fail("Invalid artifact contentHash");
    if (art.capturedAt !== null && !iso(art.capturedAt)) fail("Invalid artifact capturedAt");
  }

  if (record.processing !== null) {
    exact(record.processing, ["processingVersion", "calibrationNotes", "pipelineId"]);
    if (
      !text(record.processing.processingVersion, 120) ||
      !text(record.processing.calibrationNotes, 2000) ||
      !ID.test(record.processing.pipelineId)
    ) {
      fail("Invalid processing");
    }
  }

  if (record.qc !== null) {
    exact(record.qc, ["status", "assessedAt", "notes", "biologyNotRefutedByFailedQc"]);
    if (!QC_STATUSES.includes(record.qc.status)) fail("Invalid qc status");
    if (record.qc.assessedAt !== null && !iso(record.qc.assessedAt)) fail("Invalid qc assessedAt");
    if (!text(record.qc.notes, 2000) || record.qc.biologyNotRefutedByFailedQc !== true) {
      fail("Invalid qc record");
    }
  }

  if (record.outcome !== null) {
    if (!record.prediction.freeze) fail("Outcome requires frozen prediction");
    validateOutcome(record.outcome, record.prediction.freeze);
  }

  if (record.reviewCandidate !== null) {
    exact(record.reviewCandidate, [
      "submittedAt",
      "graphPromotable",
      "scientificApproval",
      "mayEditFrozenEvaluationData",
      "note",
    ]);
    if (
      !iso(record.reviewCandidate.submittedAt) ||
      record.reviewCandidate.graphPromotable !== false ||
      record.reviewCandidate.scientificApproval !== false ||
      record.reviewCandidate.mayEditFrozenEvaluationData !== false ||
      !text(record.reviewCandidate.note, 2000)
    ) {
      fail("Invalid review candidate");
    }
  }

  validateLifecycleConsistency(record);
  const {contentHash, ...body} = record;
  if (contentHash !== hashRecordBody(body)) fail("contentHash mismatch");
}

export function emptyExperimentLedger(input?: {
  engineeringHarness?: GateStatus;
  realObservationAcceptance?: GateStatus;
  publicDataOrPartnerAgreement?: GateStatus;
}): ExperimentLedger {
  return {
    schemaVersion: EXPERIMENT_LEDGER_SCHEMA,
    phase: "N7",
    programme: "gut_immune_t2d",
    scientificApproval: false,
    graphPromotable: false,
    realObservationClaimed: false,
    engineeringHarness: input?.engineeringHarness ?? "CLEARED",
    realObservationAcceptance: input?.realObservationAcceptance ?? "BLOCKED",
    publicDataOrPartnerAgreement: input?.publicDataOrPartnerAgreement ?? "BLOCKED",
    records: [],
    archives: [],
  };
}

export function parseExperimentLedger(value: unknown): ExperimentLedger {
  exact(value, [
    "schemaVersion",
    "phase",
    "programme",
    "scientificApproval",
    "graphPromotable",
    "realObservationClaimed",
    "engineeringHarness",
    "realObservationAcceptance",
    "publicDataOrPartnerAgreement",
    "records",
    "archives",
  ]);
  const ledger = value as ExperimentLedger;
  if (
    ledger.schemaVersion !== EXPERIMENT_LEDGER_SCHEMA ||
    ledger.phase !== "N7" ||
    ledger.programme !== "gut_immune_t2d" ||
    ledger.scientificApproval !== false ||
    ledger.graphPromotable !== false ||
    ledger.realObservationClaimed !== false ||
    (ledger.engineeringHarness !== "CLEARED" && ledger.engineeringHarness !== "BLOCKED") ||
    (ledger.realObservationAcceptance !== "CLEARED" && ledger.realObservationAcceptance !== "BLOCKED") ||
    (ledger.publicDataOrPartnerAgreement !== "CLEARED" &&
      ledger.publicDataOrPartnerAgreement !== "BLOCKED") ||
    !Array.isArray(ledger.records) ||
    !Array.isArray(ledger.archives) ||
    ledger.records.length > 500 ||
    ledger.archives.length > 2000
  ) {
    fail("Invalid experiment ledger envelope");
  }

  // Real observations stay BLOCKED without authorised public data / partner agreement.
  if (
    ledger.realObservationAcceptance === "CLEARED" &&
    ledger.publicDataOrPartnerAgreement !== "CLEARED"
  ) {
    fail("Real observation acceptance requires public data or partner agreement");
  }

  const liveIds = new Set<string>();
  for (const record of ledger.records) {
    validateRecordShape(record);
    if (record.lifecycle === "withdrawn") fail("Live records cannot be withdrawn; archive them");
    if (liveIds.has(record.id)) fail(`Duplicate live experiment id ${record.id}`);
    liveIds.add(record.id);
    if (record.dataBasis !== "fixture_engineering" && ledger.realObservationAcceptance !== "CLEARED") {
      fail("Non-fixture experiments require realObservationAcceptance=CLEARED");
    }
  }

  const archiveKeys = new Set<string>();
  for (const record of ledger.archives) {
    validateRecordShape(record);
    if (record.lifecycle !== "withdrawn" && record.parentVersion === null && record.version > 1) {
      // archived supersessions keep prior lifecycle; withdrawn is explicit
    }
    const key = `${record.id}@${record.version}`;
    if (archiveKeys.has(key)) fail(`Duplicate archive version ${key}`);
    archiveKeys.add(key);
  }

  for (const record of ledger.records) {
    if (record.parentVersion !== null) {
      const parentKey = `${record.id}@${record.parentVersion}`;
      if (!archiveKeys.has(parentKey)) fail(`Missing archived parent ${parentKey}`);
    }
  }

  return ledger;
}

function materializeRecord(
  input: ExperimentRecordInput,
  version: number,
  parentVersion: number | null,
  lifecycle: ExperimentLifecycle,
): ExperimentRecord {
  const body: Omit<ExperimentRecord, "contentHash"> = {
    id: input.id,
    version,
    parentVersion,
    lifecycle,
    dataBasis: input.dataBasis,
    fixtureHonesty: input.fixtureHonesty,
    programme: "gut_immune_t2d",
    prediction: input.prediction,
    protocol: input.protocol ?? null,
    rawArtifacts: input.rawArtifacts ?? [],
    processing: input.processing ?? null,
    qc: input.qc ?? null,
    outcome: input.outcome ?? null,
    reviewCandidate: input.reviewCandidate ?? null,
    frozenEvalPins: input.frozenEvalPins,
    scientificApproval: false,
    graphPromotable: false,
    realObservationClaimed: false,
    createdAt: input.createdAt,
  };
  const record: ExperimentRecord = {...body, contentHash: hashRecordBody(body)};
  validateRecordShape(record);
  return record;
}

function replaceLive(ledger: ExperimentLedger, next: ExperimentRecord, archived: ExperimentRecord): ExperimentLedger {
  return parseExperimentLedger({
    ...ledger,
    records: ledger.records.map((r) => (r.id === next.id ? next : r)),
    archives: [...ledger.archives, archived],
  });
}

function archiveCurrent(current: ExperimentRecord): ExperimentRecord {
  const {contentHash: _c, ...body} = current;
  // Keep lifecycle as-was for lineage; mark via parentVersion on the next live row.
  const archived: ExperimentRecord = {
    ...body,
    contentHash: hashRecordBody(body),
  };
  validateRecordShape(archived);
  return archived;
}

/** Append a draft prediction (unfrozen). */
export function appendExperimentDraft(ledger: ExperimentLedger, input: ExperimentRecordInput): ExperimentLedger {
  const parsed = parseExperimentLedger(ledger);
  if (parsed.records.some((r) => r.id === input.id) || parsed.archives.some((r) => r.id === input.id)) {
    fail(`Experiment ${input.id} already exists`);
  }
  if (input.prediction.freeze !== null) fail("Use freezeExperimentPrediction after draft append");
  if (input.protocol || input.outcome || input.reviewCandidate || (input.rawArtifacts?.length ?? 0) > 0) {
    fail("Draft append accepts prediction only");
  }
  const record = materializeRecord(
    {
      ...input,
      protocol: null,
      rawArtifacts: [],
      processing: null,
      qc: null,
      outcome: null,
      reviewCandidate: null,
    },
    1,
    null,
    "prediction_draft",
  );
  return parseExperimentLedger({...parsed, records: [...parsed.records, record]});
}

/** Freeze prediction content hash before any outcome may attach. */
export function freezeExperimentPrediction(
  ledger: ExperimentLedger,
  id: string,
  frozenAt: string,
): ExperimentLedger {
  const parsed = parseExperimentLedger(ledger);
  const current = parsed.records.find((r) => r.id === id);
  if (!current) fail(`Unknown live experiment ${id}`);
  if (current.lifecycle !== "prediction_draft") fail("Only prediction_draft may be frozen");
  if (current.prediction.freeze) fail("Prediction already frozen");
  if (!iso(frozenAt)) fail("Invalid frozenAt");
  if (Date.parse(frozenAt) < Date.parse(current.createdAt)) {
    fail("Freeze cannot precede experiment creation");
  }
  const predictionContentHash = hashExperimentPredictionBody(current.prediction);
  const nextInput: ExperimentRecordInput = {
    ...current,
    prediction: {
      ...current.prediction,
      freeze: {
        frozenAt,
        outcomeUnknownAtFreeze: true,
        predictionContentHash,
      },
    },
    createdAt: frozenAt,
  };
  const archived = archiveCurrent(current);
  const next = materializeRecord(nextInput, current.version + 1, current.version, "prediction_frozen");
  return replaceLive(parsed, next, archived);
}

/** Bind protocol metadata after freeze. */
export function bindExperimentProtocol(
  ledger: ExperimentLedger,
  id: string,
  protocol: ExperimentProtocol,
  createdAt: string,
): ExperimentLedger {
  const parsed = parseExperimentLedger(ledger);
  const current = parsed.records.find((r) => r.id === id);
  if (!current) fail(`Unknown live experiment ${id}`);
  if (current.lifecycle !== "prediction_frozen") fail("Protocol requires prediction_frozen");
  if (!iso(createdAt) || Date.parse(createdAt) < Date.parse(current.prediction.freeze!.frozenAt)) {
    fail("Protocol bind cannot precede prediction freeze");
  }
  const nextInput: ExperimentRecordInput = {
    ...current,
    protocol,
    createdAt,
  };
  const archived = archiveCurrent(current);
  const next = materializeRecord(nextInput, current.version + 1, current.version, "protocol_bound");
  return replaceLive(parsed, next, archived);
}

/** Attach raw artifacts / processing / QC after protocol bind. */
export function attachExperimentArtifacts(
  ledger: ExperimentLedger,
  id: string,
  patch: {
    rawArtifacts: ExperimentRawArtifact[];
    processing: ExperimentProcessing | null;
    qc: ExperimentQc | null;
    createdAt: string;
  },
): ExperimentLedger {
  const parsed = parseExperimentLedger(ledger);
  const current = parsed.records.find((r) => r.id === id);
  if (!current) fail(`Unknown live experiment ${id}`);
  if (current.lifecycle !== "protocol_bound" && current.lifecycle !== "artifacts_attached") {
    fail("Artifacts require protocol_bound (or further artifact updates)");
  }
  if (!iso(patch.createdAt)) fail("Invalid createdAt");
  if (
    patch.rawArtifacts.length === 0 &&
    patch.processing === null &&
    patch.qc === null
  ) {
    fail("Artifacts attach requires at least one of rawArtifacts/processing/qc");
  }
  const nextInput: ExperimentRecordInput = {
    ...current,
    rawArtifacts: patch.rawArtifacts,
    processing: patch.processing,
    qc: patch.qc,
    createdAt: patch.createdAt,
  };
  const archived = archiveCurrent(current);
  const next = materializeRecord(nextInput, current.version + 1, current.version, "artifacts_attached");
  return replaceLive(parsed, next, archived);
}

/**
 * Attach a measured outcome. Fail-closed if prediction is not frozen,
 * if outcome timestamp precedes freeze, or if locked hash mismatches.
 */
export function attachExperimentOutcome(
  ledger: ExperimentLedger,
  id: string,
  outcomeInput: Omit<ExperimentOutcome, "lockedPredictionContentHash" | "noEffectNotEstablished" | "biologyNotRefuted"> & {
    noEffectNotEstablished?: boolean;
    biologyNotRefuted?: boolean;
  },
): ExperimentLedger {
  const parsed = parseExperimentLedger(ledger);
  const current = parsed.records.find((r) => r.id === id);
  if (!current) fail(`Unknown live experiment ${id}`);
  if (!current.prediction.freeze) fail("Cannot attach outcome before prediction freeze");
  if (current.lifecycle !== "protocol_bound" && current.lifecycle !== "artifacts_attached") {
    fail("Outcome requires protocol_bound or artifacts_attached");
  }
  if (current.outcome) fail("Outcome already recorded; withdraw or supersede via new experiment id");
  if (Date.parse(outcomeInput.recordedAt) < Date.parse(current.prediction.freeze.frozenAt)) {
    fail("Outcome cannot precede prediction freeze");
  }

  const noEffectNotEstablished =
    outcomeInput.outcomeClass === "negative_null" ? true : false;
  const biologyNotRefuted =
    outcomeInput.outcomeClass === "technical_failure" || outcomeInput.outcomeClass === "inactive_assay"
      ? true
      : false;

  const outcome: ExperimentOutcome = {
    outcomeClass: outcomeInput.outcomeClass,
    recordedAt: outcomeInput.recordedAt,
    summary: outcomeInput.summary,
    measuredValues: outcomeInput.measuredValues,
    noEffectNotEstablished,
    biologyNotRefuted,
    lockedPredictionContentHash: current.prediction.freeze.predictionContentHash,
  };

  const nextInput: ExperimentRecordInput = {
    ...current,
    outcome,
    createdAt: outcomeInput.recordedAt,
  };
  const archived = archiveCurrent(current);
  const next = materializeRecord(nextInput, current.version + 1, current.version, "outcome_recorded");
  return replaceLive(parsed, next, archived);
}

/** Submit as review candidate — cannot publish graph or edit frozen eval. */
export function submitExperimentReviewCandidate(
  ledger: ExperimentLedger,
  id: string,
  submittedAt: string,
  note: string,
): ExperimentLedger {
  const parsed = parseExperimentLedger(ledger);
  const current = parsed.records.find((r) => r.id === id);
  if (!current) fail(`Unknown live experiment ${id}`);
  if (current.lifecycle !== "outcome_recorded") fail("Review candidate requires outcome_recorded");
  if (!iso(submittedAt) || !text(note, 2000)) fail("Invalid review candidate fields");
  if (Date.parse(submittedAt) < Date.parse(current.outcome!.recordedAt)) {
    fail("Review submission cannot precede outcome");
  }
  const nextInput: ExperimentRecordInput = {
    ...current,
    reviewCandidate: {
      submittedAt,
      graphPromotable: false,
      scientificApproval: false,
      mayEditFrozenEvaluationData: false,
      note,
    },
    createdAt: submittedAt,
  };
  const archived = archiveCurrent(current);
  const next = materializeRecord(nextInput, current.version + 1, current.version, "review_candidate");
  return replaceLive(parsed, next, archived);
}

export function readExperimentRecord(
  ledger: ExperimentLedger,
  id: string,
  version?: number,
): ExperimentRecord {
  const parsed = parseExperimentLedger(ledger);
  if (version === undefined) {
    const live = parsed.records.find((r) => r.id === id);
    if (!live) fail(`Unknown live experiment ${id}`);
    return live;
  }
  const live = parsed.records.find((r) => r.id === id && r.version === version);
  if (live) return live;
  const archived = parsed.archives.find((r) => r.id === id && r.version === version);
  if (!archived) fail(`Unknown experiment version ${id}@${version}`);
  return archived;
}

export type ExperimentLedgerStatus = {
  phase: "N7";
  programme: "gut_immune_t2d";
  generatedAt: string;
  liveExperiments: number;
  archivedVersions: number;
  frozenPredictions: number;
  outcomesRecorded: number;
  reviewCandidates: number;
  outcomeClassesPresent: ExperimentOutcomeClass[];
  engineeringHarness: GateStatus;
  realObservationAcceptance: GateStatus;
  publicDataOrPartnerAgreement: GateStatus;
  scientificApproval: false;
  graphPromotable: false;
  realObservationClaimed: false;
  inventedRealOutcomesPermitted: false;
  note: string;
};

export function buildExperimentLedgerStatus(
  ledger: ExperimentLedger,
  generatedAt: string,
): ExperimentLedgerStatus {
  const parsed = parseExperimentLedger(ledger);
  const classes = [
    ...new Set(
      parsed.records
        .map((r) => r.outcome?.outcomeClass)
        .filter((c): c is ExperimentOutcomeClass => c !== undefined),
    ),
  ].sort();
  return {
    phase: "N7",
    programme: "gut_immune_t2d",
    generatedAt,
    liveExperiments: parsed.records.length,
    archivedVersions: parsed.archives.length,
    frozenPredictions: parsed.records.filter((r) => r.prediction.freeze !== null).length,
    outcomesRecorded: parsed.records.filter((r) => r.outcome !== null).length,
    reviewCandidates: parsed.records.filter((r) => r.reviewCandidate !== null).length,
    outcomeClassesPresent: classes,
    engineeringHarness: parsed.engineeringHarness,
    realObservationAcceptance: parsed.realObservationAcceptance,
    publicDataOrPartnerAgreement: parsed.publicDataOrPartnerAgreement,
    scientificApproval: false,
    graphPromotable: false,
    realObservationClaimed: false,
    inventedRealOutcomesPermitted: false,
    note:
      "Fixture engineering outcomes only. Real laboratory / authorised public observations remain BLOCKED until agreements exist.",
  };
}
