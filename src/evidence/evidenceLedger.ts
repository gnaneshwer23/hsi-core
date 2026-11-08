/**
 * N2 versioned evidence ledger.
 * Distinguishes reported findings, predictions, hypotheses and experimental observations.
 * Lineage is evidence → passage → source → method. Does not grant scientific approval.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import type {N1VerificationOutcome} from "./n1SourceVerification";

export const EVIDENCE_LEDGER_SCHEMA = "hsi-evidence-ledger-1" as const;

/** N2 assertion kinds — never collapse these into one enum value at rest. */
export const EVIDENCE_ASSERTION_KINDS = [
  "reported_finding",
  "prediction",
  "hypothesis",
  "experimental_observation",
] as const;

export type EvidenceAssertionKind = (typeof EVIDENCE_ASSERTION_KINDS)[number];

/** Legacy epistemic labels from migration 002 — mapped, not rewritten in archives. */
export const LEGACY_EPISTEMIC_TYPES = [
  "experimental_finding",
  "observational_association",
  "review_summary",
  "computational_inference",
  "hypothesis",
] as const;

export type LegacyEpistemicType = (typeof LEGACY_EPISTEMIC_TYPES)[number];

export type EvidenceSpecies =
  | "human"
  | "mouse"
  | "mixed"
  | "cell_line"
  | "ex_vivo"
  | "unspecified";

export type EvidenceContextField =
  | "model"
  | "species"
  | "tissue"
  | "population"
  | "assay"
  | "dose"
  | "doseUnit"
  | "timepoint"
  | "intervention"
  | "outcome";

export type EvidenceContext = {
  model: string | null;
  species: EvidenceSpecies | null;
  tissue: string | null;
  population: string | null;
  assay: string | null;
  dose: string | null;
  doseUnit: string | null;
  timepoint: string | null;
  intervention: string | null;
  outcome: string | null;
  /** Every null context field must appear here — omission is fail-closed. */
  missingFields: EvidenceContextField[];
};

export type EvidenceLineage = {
  sourceId: string | null;
  passageIds: string[];
  methodId: string | null;
  n1QueueId: string | null;
  n1Outcome: N1VerificationOutcome | null;
};

export type PredictionFreeze = {
  frozenAt: string;
  outcomeUnknown: true;
  falsifier: string;
};

export type ObservationProtocol = {
  protocolId: string;
  measuredAt: string | null;
  qcStatus: "not_run" | "passed" | "failed" | "inconclusive";
};

export type LedgerRecordStatus = "draft" | "superseded" | "withdrawn";

export type EvidenceLedgerRecord = {
  id: string;
  version: number;
  parentVersion: number | null;
  assertionKind: EvidenceAssertionKind;
  assertion: string;
  subjectId: string;
  predicate: string;
  objectId: string;
  context: EvidenceContext;
  lineage: EvidenceLineage;
  status: LedgerRecordStatus;
  predictionFreeze: PredictionFreeze | null;
  observationProtocol: ObservationProtocol | null;
  legacyEpistemicType: LegacyEpistemicType | null;
  scientificApproval: false;
  graphPromotable: false;
  claimEntailmentAssessed: false;
  createdAt: string;
  contentHash: string;
};

export type EvidenceLedger = {
  schemaVersion: typeof EVIDENCE_LEDGER_SCHEMA;
  phase: "N2";
  programme: "gut_immune_t2d";
  scientificApproval: false;
  graphPromotable: false;
  claimEntailmentAssessed: false;
  records: EvidenceLedgerRecord[];
  archives: EvidenceLedgerRecord[];
};

export type LedgerRecordInput = Omit<
  EvidenceLedgerRecord,
  | "version"
  | "parentVersion"
  | "status"
  | "scientificApproval"
  | "graphPromotable"
  | "claimEntailmentAssessed"
  | "contentHash"
> & {
  version?: number;
  parentVersion?: number | null;
  status?: LedgerRecordStatus;
};

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{1,150}$/;
/** Source ids include DOI forms such as `doi:10.2337/db08-1637` (slash required). */
const SOURCE_ID = /^[A-Za-z0-9][A-Za-z0-9._:/-]{1,200}$/;
const CONTEXT_FIELDS: EvidenceContextField[] = [
  "model",
  "species",
  "tissue",
  "population",
  "assay",
  "dose",
  "doseUnit",
  "timepoint",
  "intervention",
  "outcome",
];

const N1_BLOCKED_FOR_FINDING: ReadonlySet<N1VerificationOutcome> = new Set([
  "identity_mismatch",
  "ambiguous_multiple_hits",
  "not_found",
  "lookup_failed",
  "provider_unavailable",
]);

export class EvidenceLedgerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvidenceLedgerError";
  }
}

function fail(message: string): never {
  throw new EvidenceLedgerError(message);
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
    fail("Invalid evidence ledger shape");
  }
}

function iso(v: unknown): v is string {
  return text(v, 40) && Number.isFinite(Date.parse(v));
}

/** Map archived migration-002 epistemic labels into N2 assertion kinds without rewriting history. */
export function mapLegacyEpistemicToAssertionKind(legacy: LegacyEpistemicType): EvidenceAssertionKind {
  switch (legacy) {
    case "experimental_finding":
      return "experimental_observation";
    case "observational_association":
      return "reported_finding";
    case "review_summary":
      return "reported_finding";
    case "computational_inference":
      return "prediction";
    case "hypothesis":
      return "hypothesis";
    default: {
      const _exhaustive: never = legacy;
      return _exhaustive;
    }
  }
}

function hashRecordBody(record: Omit<EvidenceLedgerRecord, "contentHash">): string {
  return createHash("sha256").update(canonicalEvidenceJson(record)).digest("hex");
}

function validateContext(context: EvidenceContext): void {
  exact(context, [...CONTEXT_FIELDS, "missingFields"]);
  if (!Array.isArray(context.missingFields) || new Set(context.missingFields).size !== context.missingFields.length) {
    fail("Context missingFields must be a unique array");
  }
  for (const field of context.missingFields) {
    if (!CONTEXT_FIELDS.includes(field)) fail(`Unknown missing context field: ${field}`);
  }
  for (const field of CONTEXT_FIELDS) {
    const value = context[field];
    if (field === "species") {
      if (value === null) {
        if (!context.missingFields.includes("species")) fail("Null species must be listed in missingFields");
      } else if (
        value !== "human" &&
        value !== "mouse" &&
        value !== "mixed" &&
        value !== "cell_line" &&
        value !== "ex_vivo" &&
        value !== "unspecified"
      ) {
        fail("Invalid species");
      } else if (context.missingFields.includes("species")) {
        fail("Present species cannot be listed as missing");
      }
      continue;
    }
    if (value === null) {
      if (!context.missingFields.includes(field)) fail(`Null ${field} must be listed in missingFields`);
    } else if (!text(value, 3000)) {
      fail(`Invalid context.${field}`);
    } else if (context.missingFields.includes(field)) {
      fail(`Present ${field} cannot be listed as missing`);
    }
  }
}

function validateLineage(lineage: EvidenceLineage, kind: EvidenceAssertionKind): void {
  exact(lineage, ["sourceId", "passageIds", "methodId", "n1QueueId", "n1Outcome"]);
  if (!Array.isArray(lineage.passageIds) || lineage.passageIds.length > 25) fail("Invalid passageIds");
  if (new Set(lineage.passageIds).size !== lineage.passageIds.length) fail("Duplicate passageIds");
  for (const id of lineage.passageIds) if (!ID.test(id)) fail("Invalid passage id");
  if (lineage.sourceId !== null && !SOURCE_ID.test(lineage.sourceId)) fail("Invalid sourceId");
  if (lineage.methodId !== null && !ID.test(lineage.methodId)) fail("Invalid methodId");
  if (lineage.n1QueueId !== null && !/^N1-C-\d{2}$/.test(lineage.n1QueueId)) fail("Invalid n1QueueId");
  if (
    lineage.n1Outcome !== null &&
    ![
      "metadata_matched_unreviewed",
      "identity_mismatch",
      "ambiguous_multiple_hits",
      "not_found",
      "lookup_failed",
      "provider_unavailable",
      "rights_restricted_metadata_only",
    ].includes(lineage.n1Outcome)
  ) {
    fail("Invalid n1Outcome");
  }

  if (kind === "reported_finding") {
    if (!lineage.sourceId) fail("reported_finding requires source lineage");
    if (lineage.n1Outcome && N1_BLOCKED_FOR_FINDING.has(lineage.n1Outcome)) {
      fail("Failed or mismatched N1 lookup cannot become a reported_finding");
    }
  }
  if (kind === "prediction" || kind === "experimental_observation") {
    if (!lineage.methodId) fail(`${kind} requires method lineage`);
  }
}

function validateKindSpecific(record: {
  assertionKind: EvidenceAssertionKind;
  predictionFreeze: PredictionFreeze | null;
  observationProtocol: ObservationProtocol | null;
}): void {
  const {assertionKind, predictionFreeze, observationProtocol} = record;
  switch (assertionKind) {
    case "reported_finding":
      if (predictionFreeze !== null) fail("reported_finding cannot carry a prediction freeze");
      if (observationProtocol !== null) fail("reported_finding cannot carry an observation protocol");
      break;
    case "prediction":
      if (!predictionFreeze) fail("prediction requires a freeze record");
      exact(predictionFreeze, ["frozenAt", "outcomeUnknown", "falsifier"]);
      if (!iso(predictionFreeze.frozenAt) || predictionFreeze.outcomeUnknown !== true || !text(predictionFreeze.falsifier, 2000)) {
        fail("Invalid prediction freeze");
      }
      if (observationProtocol !== null) fail("prediction cannot attach a measured observation (N7)");
      break;
    case "hypothesis":
      if (predictionFreeze !== null) fail("hypothesis is not a frozen prediction");
      if (observationProtocol !== null) fail("hypothesis cannot claim an experimental observation");
      break;
    case "experimental_observation":
      if (predictionFreeze !== null) fail("experimental_observation is not a pre-result prediction");
      if (!observationProtocol) fail("experimental_observation requires a protocol record");
      exact(observationProtocol, ["protocolId", "measuredAt", "qcStatus"]);
      if (!ID.test(observationProtocol.protocolId)) fail("Invalid protocolId");
      if (observationProtocol.measuredAt !== null && !iso(observationProtocol.measuredAt)) fail("Invalid measuredAt");
      if (!["not_run", "passed", "failed", "inconclusive"].includes(observationProtocol.qcStatus)) {
        fail("Invalid qcStatus");
      }
      break;
    default: {
      const _exhaustive: never = assertionKind;
      return _exhaustive;
    }
  }
}

function validateRecordShape(record: EvidenceLedgerRecord): void {
  exact(record, [
    "id",
    "version",
    "parentVersion",
    "assertionKind",
    "assertion",
    "subjectId",
    "predicate",
    "objectId",
    "context",
    "lineage",
    "status",
    "predictionFreeze",
    "observationProtocol",
    "legacyEpistemicType",
    "scientificApproval",
    "graphPromotable",
    "claimEntailmentAssessed",
    "createdAt",
    "contentHash",
  ]);
  if (!ID.test(record.id)) fail("Invalid record id");
  if (!Number.isInteger(record.version) || record.version < 1) fail("Invalid version");
  if (record.parentVersion !== null && (!Number.isInteger(record.parentVersion) || record.parentVersion < 1 || record.parentVersion >= record.version)) {
    fail("Invalid parentVersion");
  }
  if (!EVIDENCE_ASSERTION_KINDS.includes(record.assertionKind)) fail("Unknown assertionKind");
  if (!text(record.assertion, 5000) || !ID.test(record.subjectId) || !text(record.predicate, 120) || !ID.test(record.objectId)) {
    fail("Invalid assertion triple");
  }
  if (!["draft", "superseded", "withdrawn"].includes(record.status)) fail("Invalid status");
  if (record.scientificApproval !== false || record.graphPromotable !== false || record.claimEntailmentAssessed !== false) {
    fail("Ledger records cannot claim approval, graph promotion or entailment");
  }
  if (!iso(record.createdAt)) fail("Invalid createdAt");
  if (record.legacyEpistemicType !== null) {
    if (!LEGACY_EPISTEMIC_TYPES.includes(record.legacyEpistemicType)) fail("Unknown legacy epistemic type");
    if (mapLegacyEpistemicToAssertionKind(record.legacyEpistemicType) !== record.assertionKind) {
      fail("legacyEpistemicType does not map to assertionKind");
    }
  }
  validateContext(record.context);
  validateLineage(record.lineage, record.assertionKind);
  validateKindSpecific(record);
  const {contentHash, ...body} = record;
  if (contentHash !== hashRecordBody(body)) fail("contentHash mismatch");
}

/** Validate a single N2 ledger row (Neon helper / offline fixture) without requiring parent archives. */
export function parseEvidenceLedgerRecord(value: unknown): EvidenceLedgerRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("Invalid evidence ledger record");
  const record = value as EvidenceLedgerRecord;
  validateRecordShape(record);
  return record;
}

export function emptyEvidenceLedger(): EvidenceLedger {
  return {
    schemaVersion: EVIDENCE_LEDGER_SCHEMA,
    phase: "N2",
    programme: "gut_immune_t2d",
    scientificApproval: false,
    graphPromotable: false,
    claimEntailmentAssessed: false,
    records: [],
    archives: [],
  };
}

export function parseEvidenceLedger(value: unknown): EvidenceLedger {
  exact(value, [
    "schemaVersion",
    "phase",
    "programme",
    "scientificApproval",
    "graphPromotable",
    "claimEntailmentAssessed",
    "records",
    "archives",
  ]);
  const ledger = value as EvidenceLedger;
  if (
    ledger.schemaVersion !== EVIDENCE_LEDGER_SCHEMA ||
    ledger.phase !== "N2" ||
    ledger.programme !== "gut_immune_t2d" ||
    ledger.scientificApproval !== false ||
    ledger.graphPromotable !== false ||
    ledger.claimEntailmentAssessed !== false ||
    !Array.isArray(ledger.records) ||
    !Array.isArray(ledger.archives) ||
    ledger.records.length > 500 ||
    ledger.archives.length > 2000
  ) {
    fail("Invalid evidence ledger envelope");
  }

  const liveKeys = new Set<string>();
  for (const record of ledger.records) {
    validateRecordShape(record);
    if (record.status === "superseded") fail("Live records cannot be superseded; move prior versions to archives");
    const key = `${record.id}@${record.version}`;
    if (liveKeys.has(record.id)) fail(`Duplicate live record id ${record.id}`);
    liveKeys.add(record.id);
    if (liveKeys.has(key)) fail(`Duplicate live version ${key}`);
  }

  const archiveKeys = new Set<string>();
  for (const record of ledger.archives) {
    validateRecordShape(record);
    if (record.status !== "superseded" && record.status !== "withdrawn") {
      fail("Archive records must be superseded or withdrawn");
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

function materializeRecord(input: LedgerRecordInput, version: number, parentVersion: number | null, status: LedgerRecordStatus): EvidenceLedgerRecord {
  const body: Omit<EvidenceLedgerRecord, "contentHash"> = {
    id: input.id,
    version,
    parentVersion,
    assertionKind: input.assertionKind,
    assertion: input.assertion,
    subjectId: input.subjectId,
    predicate: input.predicate,
    objectId: input.objectId,
    context: input.context,
    lineage: input.lineage,
    status,
    predictionFreeze: input.predictionFreeze,
    observationProtocol: input.observationProtocol,
    legacyEpistemicType: input.legacyEpistemicType,
    scientificApproval: false,
    graphPromotable: false,
    claimEntailmentAssessed: false,
    createdAt: input.createdAt,
  };
  const record: EvidenceLedgerRecord = {...body, contentHash: hashRecordBody(body)};
  validateRecordShape(record);
  return record;
}

/** Append a new draft record. Refuses colliding ids and approval flags. */
export function appendLedgerRecord(ledger: EvidenceLedger, input: LedgerRecordInput): EvidenceLedger {
  const parsed = parseEvidenceLedger(ledger);
  if (parsed.records.some((r) => r.id === input.id) || parsed.archives.some((r) => r.id === input.id)) {
    fail(`Record ${input.id} already exists; use supersedeLedgerRecord`);
  }
  const record = materializeRecord(input, 1, null, "draft");
  return parseEvidenceLedger({...parsed, records: [...parsed.records, record]});
}

/** Version a live record; prior version moves to archives with status superseded. */
export function supersedeLedgerRecord(ledger: EvidenceLedger, id: string, patch: LedgerRecordInput): EvidenceLedger {
  const parsed = parseEvidenceLedger(ledger);
  const current = parsed.records.find((r) => r.id === id);
  if (!current) fail(`Unknown live record ${id}`);
  if (patch.id !== id) fail("Supersession cannot change record id");
  const {contentHash: _ignored, ...currentBody} = current;
  const archivedFinal: EvidenceLedgerRecord = {
    ...currentBody,
    status: "superseded",
    contentHash: hashRecordBody({...currentBody, status: "superseded"}),
  };
  validateRecordShape(archivedFinal);

  const next = materializeRecord(patch, current.version + 1, current.version, "draft");
  return parseEvidenceLedger({
    ...parsed,
    records: parsed.records.map((r) => (r.id === id ? next : r)),
    archives: [...parsed.archives, archivedFinal],
  });
}

export function readLedgerRecord(ledger: EvidenceLedger, id: string, version?: number): EvidenceLedgerRecord {
  const parsed = parseEvidenceLedger(ledger);
  if (version === undefined) {
    const live = parsed.records.find((r) => r.id === id);
    if (!live) fail(`Unknown live record ${id}`);
    return live;
  }
  const live = parsed.records.find((r) => r.id === id && r.version === version);
  if (live) return live;
  const archived = parsed.archives.find((r) => r.id === id && r.version === version);
  if (!archived) fail(`Unknown record version ${id}@${version}`);
  return archived;
}

export function listLedgerLineage(ledger: EvidenceLedger, id: string): EvidenceLedgerRecord[] {
  const parsed = parseEvidenceLedger(ledger);
  const versions = [
    ...parsed.archives.filter((r) => r.id === id),
    ...parsed.records.filter((r) => r.id === id),
  ].sort((a, b) => a.version - b.version);
  if (!versions.length) fail(`Unknown record ${id}`);
  return versions;
}

/** Build a metadata-only reported_finding candidate from a successful N1 match. */
export function draftFindingFromN1Match(input: {
  id: string;
  assertion: string;
  subjectId: string;
  predicate: string;
  objectId: string;
  sourceId: string;
  n1QueueId: string;
  n1Outcome: N1VerificationOutcome;
  model: string | null;
  outcome: string | null;
  createdAt: string;
}): LedgerRecordInput {
  if (input.n1Outcome !== "metadata_matched_unreviewed" && input.n1Outcome !== "rights_restricted_metadata_only") {
    fail("Only matched N1 metadata outcomes may draft a reported_finding");
  }
  const missingFields: EvidenceContextField[] = [
    "species",
    "tissue",
    "population",
    "assay",
    "dose",
    "doseUnit",
    "timepoint",
    "intervention",
  ];
  if (input.model === null) missingFields.unshift("model");
  if (input.outcome === null) missingFields.push("outcome");
  return {
    id: input.id,
    assertionKind: "reported_finding",
    assertion: input.assertion,
    subjectId: input.subjectId,
    predicate: input.predicate,
    objectId: input.objectId,
    context: {
      model: input.model,
      species: null,
      tissue: null,
      population: null,
      assay: null,
      dose: null,
      doseUnit: null,
      timepoint: null,
      intervention: null,
      outcome: input.outcome,
      missingFields,
    },
    lineage: {
      sourceId: input.sourceId,
      passageIds: [],
      methodId: null,
      n1QueueId: input.n1QueueId,
      n1Outcome: input.n1Outcome,
    },
    predictionFreeze: null,
    observationProtocol: null,
    legacyEpistemicType: "observational_association",
    createdAt: input.createdAt,
  };
}
