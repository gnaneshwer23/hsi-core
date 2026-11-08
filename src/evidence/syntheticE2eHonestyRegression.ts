/**
 * Synthetic e2e honesty regression pack.
 *
 * Ports quarantine + oracle *expectations* as unit-testable validation
 * behaviour. Refuses quarantine ingest into Neon/clinical tables and refuses
 * Gate C auto-approve / legalBinding flips from demo outputs.
 * synthetic ≠ clinical ≠ eligible.
 */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {HSI_CDS_PHI_INVARIANTS, rejectPhiPayload, type HsiCdsPhiInvariants} from "../cdsPhiBoundary";

export const SYNTHETIC_E2E_HONESTY_REGRESSION_SCHEMA = "hsi-synthetic-e2e-honesty-regression-1" as const;
export const SYNTHETIC_E2E_HONESTY_REGRESSION_ID = "honesty-regression-synthetic-e2e-1" as const;

export const SYNTHETIC_NE_CLINICAL_NE_ELIGIBLE = "synthetic ≠ clinical ≠ eligible" as const;

export const PACK_ORACLE_STATUSES = ["candidate", "excluded", "needs_review"] as const;
export type PackOracleStatus = (typeof PACK_ORACLE_STATUSES)[number];

export const PACK_QUARANTINE_ERRORS = [
  "duplicate_id",
  "invalid_lab",
  "foreign_key",
  "invalid_date",
  "provenance",
  "schema_type_or_extra_field",
  "cross_split",
  "cross_tenant",
] as const;
export type PackQuarantineError = (typeof PACK_QUARANTINE_ERRORS)[number];

export type GateStatus = "CLEARED" | "BLOCKED";

export type OracleCaseExpectation = {
  id: string;
  expected_status: PackOracleStatus;
  expected_reason?: string;
  changes: Record<string, unknown>;
};

export type OracleCasesFixture = {
  synthetic: true;
  namespace: string;
  id: string;
  as_of: string;
  provenance: string;
  baseline: Record<string, unknown>;
  cases: OracleCaseExpectation[];
};

export type QuarantineFixtureRow = {
  id: string;
  expected_error: PackQuarantineError;
  notice: string;
  split: "quarantine";
  synthetic: true;
  namespace: string;
  operation: string;
  invalid_record: Record<string, unknown>;
};

export type IngestRefusal = {
  allowed: false;
  reason: string;
  target: "neon_clinical" | "approved_corpus" | "retrieval_index" | "gate_c" | "legal_binding";
  neonClinicalWrites: false;
  gateCAutoApprove: false;
  legalBinding: false;
};

export type DemoOutputHonestyProbe = {
  groundedClaimAccepted?: boolean;
  gateCAutoApprove?: boolean;
  legalBinding?: boolean;
  patientEligible?: boolean;
  confirmedEligible?: boolean;
  scientificAcceptance?: string;
  dataClass?: string;
};

export type HonestyRegressionReceipt = {
  schemaVersion: typeof SYNTHETIC_E2E_HONESTY_REGRESSION_SCHEMA;
  regressionId: typeof SYNTHETIC_E2E_HONESTY_REGRESSION_ID;
  generatedAt: string;
  dataClass: "synthetic";
  containsPhi: false;
  quarantineRows: number;
  oracleCases: number;
  quarantineErrorsCovered: PackQuarantineError[];
  oracleStatusesCovered: PackOracleStatus[];
  ingestRefusals: IngestRefusal[];
  gateCAutoApprove: false;
  legalBinding: false;
  neonClinicalWrites: false;
  httpServer: false;
  engineeringHarness: GateStatus;
  scientificAcceptance: GateStatus;
  banner: typeof SYNTHETIC_NE_CLINICAL_NE_ELIGIBLE;
  honesty: string[];
  invariants: HsiCdsPhiInvariants;
};

function fail(message: string): never {
  throw new Error(message);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${label} must be non-empty string`);
  return value;
}

function parseOracleStatus(value: unknown, label: string): PackOracleStatus {
  if (typeof value !== "string" || !(PACK_ORACLE_STATUSES as readonly string[]).includes(value)) {
    fail(`${label}: expected_status must be candidate|excluded|needs_review`);
  }
  return value as PackOracleStatus;
}

function parseQuarantineError(value: unknown, label: string): PackQuarantineError {
  if (typeof value !== "string" || !(PACK_QUARANTINE_ERRORS as readonly string[]).includes(value)) {
    fail(`${label}: unexpected quarantine expected_error ${String(value)}`);
  }
  return value as PackQuarantineError;
}

export function parseOracleCasesFixture(raw: unknown, source = "oracle_cases.json"): OracleCasesFixture {
  if (!isObject(raw)) fail(`${source}: must be object`);
  if (raw.synthetic !== true) fail(`${source}: synthetic must be true`);
  const namespace = asString(raw.namespace, `${source}.namespace`);
  if (!namespace.startsWith("SYNTHETIC/")) fail(`${source}: namespace must stay SYNTHETIC/`);
  const provenance = asString(raw.provenance, `${source}.provenance`);
  if (!provenance.toLowerCase().includes("not independently clinically adjudicated")) {
    fail(`${source}: provenance must deny clinical adjudication`);
  }
  if (!isObject(raw.baseline)) fail(`${source}: baseline required`);
  if (!Array.isArray(raw.cases) || raw.cases.length === 0) fail(`${source}: cases required`);
  const cases: OracleCaseExpectation[] = raw.cases.map((row, i) => {
    if (!isObject(row)) fail(`${source}.cases[${i}] must be object`);
    const changes = isObject(row.changes) ? row.changes : fail(`${source}.cases[${i}].changes required`);
    const expectation: OracleCaseExpectation = {
      id: asString(row.id, `${source}.cases[${i}].id`),
      expected_status: parseOracleStatus(row.expected_status, `${source}.cases[${i}]`),
      changes,
    };
    if (typeof row.expected_reason === "string" && row.expected_reason.length > 0) {
      expectation.expected_reason = row.expected_reason;
    }
    return expectation;
  });
  return {
    synthetic: true,
    namespace,
    id: asString(raw.id, `${source}.id`),
    as_of: asString(raw.as_of, `${source}.as_of`),
    provenance,
    baseline: raw.baseline,
    cases,
  };
}

export function parseQuarantineFixtureLine(line: string, index: number): QuarantineFixtureRow {
  let raw: unknown;
  try {
    raw = JSON.parse(line);
  } catch {
    fail(`quarantine.jsonl[${index}]: invalid JSON`);
  }
  if (!isObject(raw)) fail(`quarantine.jsonl[${index}]: must be object`);
  if (raw.synthetic !== true) fail(`quarantine.jsonl[${index}]: wrapper synthetic must be true`);
  if (raw.split !== "quarantine") fail(`quarantine.jsonl[${index}]: split must be quarantine`);
  const notice = asString(raw.notice, `quarantine.jsonl[${index}].notice`);
  if (!notice.includes("Never ingest")) fail(`quarantine.jsonl[${index}]: notice must say Never ingest`);
  if (!isObject(raw.invalid_record)) fail(`quarantine.jsonl[${index}]: invalid_record required`);
  return {
    id: asString(raw.id, `quarantine.jsonl[${index}].id`),
    expected_error: parseQuarantineError(raw.expected_error, `quarantine.jsonl[${index}]`),
    notice,
    split: "quarantine",
    synthetic: true,
    namespace: asString(raw.namespace, `quarantine.jsonl[${index}].namespace`),
    operation: asString(raw.operation, `quarantine.jsonl[${index}].operation`),
    invalid_record: raw.invalid_record,
  };
}

export function parseQuarantineFixtureJsonl(text: string, source = "quarantine.jsonl"): QuarantineFixtureRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) fail(`${source}: empty`);
  return lines.map((line, i) => parseQuarantineFixtureLine(line, i));
}

/** Soft oracle evaluator: applies case changes onto baseline for expectation checks only. */
export function evaluateOracleCaseExpectation(
  fixture: OracleCasesFixture,
  caseId: string,
): {
  caseId: string;
  expected_status: PackOracleStatus;
  expected_reason?: string;
  effective: Record<string, unknown>;
  clinicalEligible: false;
  confirmedEligible: false;
} {
  const row = fixture.cases.find((c) => c.id === caseId);
  if (!row) fail(`oracle case not found: ${caseId}`);
  const effective = {...fixture.baseline, ...row.changes};
  return {
    caseId: row.id,
    expected_status: row.expected_status,
    ...(row.expected_reason ? {expected_reason: row.expected_reason} : {}),
    effective,
    clinicalEligible: false,
    confirmedEligible: false,
  };
}

/** Refuse any path that would ingest quarantine fixtures into clinical/Neon stores. */
export function refuseQuarantineIngest(input: {
  row: QuarantineFixtureRow;
  target: IngestRefusal["target"];
}): IngestRefusal {
  if (input.row.split !== "quarantine") {
    fail("refuseQuarantineIngest only accepts quarantine-split rows");
  }
  const phiGate = rejectPhiPayload({
    containsPhi: false,
    mayUseLivePhi: false,
    phiToLlm: false,
    textBlobs: [input.row.notice, JSON.stringify(input.row.invalid_record)],
  });
  if (!phiGate.ok) {
    return {
      allowed: false,
      reason: `PHI boundary blocked quarantine payload (${phiGate.detail})`,
      target: input.target,
      neonClinicalWrites: false,
      gateCAutoApprove: false,
      legalBinding: false,
    };
  }
  return {
    allowed: false,
    reason: `${input.row.notice} expected_error=${input.row.expected_error}; target=${input.target} refused.`,
    target: input.target,
    neonClinicalWrites: false,
    gateCAutoApprove: false,
    legalBinding: false,
  };
}

/**
 * Refuse Gate C auto-approve / legalBinding / eligibility flips from demo outputs.
 * Engineering demos may only keep these false.
 */
export function refuseDishonestDemoOutputFlips(probe: DemoOutputHonestyProbe): {
  ok: true;
  gateCAutoApprove: false;
  legalBinding: false;
  groundedClaimAccepted: false;
  patientEligible: false;
  confirmedEligible: false;
} | {
  ok: false;
  refusals: string[];
} {
  const refusals: string[] = [];
  if (probe.gateCAutoApprove === true) refusals.push("refuse Gate C auto-approve from demo output");
  if (probe.legalBinding === true) refusals.push("refuse legalBinding flip from demo output");
  if (probe.groundedClaimAccepted === true) refusals.push("refuse groundedClaimAccepted=true from demo output");
  if (probe.patientEligible === true) refusals.push("refuse patientEligible=true from demo output");
  if (probe.confirmedEligible === true) refusals.push("refuse confirmedEligible=true from demo output");
  if (probe.scientificAcceptance === "CLEARED") {
    refusals.push("refuse scientificAcceptance=CLEARED from synthetic demo output");
  }
  if (probe.dataClass && probe.dataClass !== "synthetic") {
    refusals.push(`refuse non-synthetic dataClass=${probe.dataClass}`);
  }
  if (refusals.length) return {ok: false, refusals};
  return {
    ok: true,
    gateCAutoApprove: false,
    legalBinding: false,
    groundedClaimAccepted: false,
    patientEligible: false,
    confirmedEligible: false,
  };
}

const DEFAULT_FIXTURE_REL = "research/fixtures/hsi-synthetic-e2e";

export function loadVendoredHonestyFixtures(repoRoot?: string): {
  oracle: OracleCasesFixture;
  quarantine: QuarantineFixtureRow[];
} {
  const root = repoRoot ?? resolve(import.meta.dir, "../..");
  const oracle = parseOracleCasesFixture(
    JSON.parse(readFileSync(resolve(root, DEFAULT_FIXTURE_REL, "fixtures/oracle_cases.json"), "utf8")),
  );
  const quarantine = parseQuarantineFixtureJsonl(
    readFileSync(resolve(root, DEFAULT_FIXTURE_REL, "fixtures/quarantine.jsonl"), "utf8"),
  );
  return {oracle, quarantine};
}

export function runHonestyRegressionPack(input?: {
  repoRoot?: string;
  generatedAt?: string;
}): HonestyRegressionReceipt {
  const generatedAt = input?.generatedAt ?? "2026-11-08T05:40:00.000Z";
  const {oracle, quarantine} = loadVendoredHonestyFixtures(input?.repoRoot);

  if (quarantine.length < 8) fail("expected all 8 quarantine expectation rows");
  const quarantineErrorsCovered = quarantine.map((q) => q.expected_error);
  const uniqueErrors = new Set(quarantineErrorsCovered);
  if (uniqueErrors.size !== PACK_QUARANTINE_ERRORS.length) {
    fail("quarantine pack must cover each expected_error exactly once");
  }

  const oracleStatusesCovered = [...new Set(oracle.cases.map((c) => c.expected_status))];
  for (const status of PACK_ORACLE_STATUSES) {
    if (!oracleStatusesCovered.includes(status)) fail(`oracle cases missing status ${status}`);
  }

  // Spot-check a few software oracle expectations (not clinical adjudication).
  const positive = evaluateOracleCaseExpectation(oracle, "SYNTHETIC/CASE/positive");
  if (positive.expected_status !== "candidate") fail("positive oracle expectation drift");
  const lowRenal = evaluateOracleCaseExpectation(oracle, "SYNTHETIC/CASE/low-renal");
  if (lowRenal.expected_status !== "excluded" || lowRenal.expected_reason !== "outside_bounds") {
    fail("low-renal oracle expectation drift");
  }
  const missingCrp = evaluateOracleCaseExpectation(oracle, "SYNTHETIC/CASE/missing-crp");
  if (missingCrp.expected_status !== "needs_review" || missingCrp.expected_reason !== "missing") {
    fail("missing-crp oracle expectation drift");
  }

  const ingestRefusals: IngestRefusal[] = quarantine.flatMap((row) => [
    refuseQuarantineIngest({row, target: "neon_clinical"}),
    refuseQuarantineIngest({row, target: "approved_corpus"}),
  ]);
  if (ingestRefusals.some((r) => r.allowed !== false || r.neonClinicalWrites !== false)) {
    fail("quarantine ingest must always refuse Neon/clinical writes");
  }

  const dishonest = refuseDishonestDemoOutputFlips({
    gateCAutoApprove: true,
    legalBinding: true,
    groundedClaimAccepted: true,
    patientEligible: true,
    confirmedEligible: true,
    scientificAcceptance: "CLEARED",
    dataClass: "clinical",
  });
  if (dishonest.ok) fail("dishonest demo flips must be refused");

  const honest = refuseDishonestDemoOutputFlips({
    gateCAutoApprove: false,
    legalBinding: false,
    groundedClaimAccepted: false,
    patientEligible: false,
    confirmedEligible: false,
    scientificAcceptance: "BLOCKED",
    dataClass: "synthetic",
  });
  if (!honest.ok) fail("honest demo flags must pass");

  return {
    schemaVersion: SYNTHETIC_E2E_HONESTY_REGRESSION_SCHEMA,
    regressionId: SYNTHETIC_E2E_HONESTY_REGRESSION_ID,
    generatedAt,
    dataClass: "synthetic",
    containsPhi: false,
    quarantineRows: quarantine.length,
    oracleCases: oracle.cases.length,
    quarantineErrorsCovered,
    oracleStatusesCovered,
    ingestRefusals: ingestRefusals.slice(0, 4),
    gateCAutoApprove: false,
    legalBinding: false,
    neonClinicalWrites: false,
    httpServer: false,
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
    banner: SYNTHETIC_NE_CLINICAL_NE_ELIGIBLE,
    honesty: [
      SYNTHETIC_NE_CLINICAL_NE_ELIGIBLE,
      "Quarantine fixtures are never ingestible into Neon/clinical tables.",
      "Oracle cases are software expectations only — not clinical adjudication.",
      "Demo outputs cannot flip Gate C auto-approve or legalBinding.",
    ],
    invariants: HSI_CDS_PHI_INVARIANTS,
  };
}

export function parseHonestyRegressionReceipt(raw: unknown): HonestyRegressionReceipt {
  if (!isObject(raw)) fail("honesty regression receipt must be object");
  if (raw.schemaVersion !== SYNTHETIC_E2E_HONESTY_REGRESSION_SCHEMA) fail("schemaVersion mismatch");
  if (raw.regressionId !== SYNTHETIC_E2E_HONESTY_REGRESSION_ID) fail("regressionId mismatch");
  if (raw.banner !== SYNTHETIC_NE_CLINICAL_NE_ELIGIBLE) fail("banner mismatch");
  if (raw.gateCAutoApprove !== false || raw.legalBinding !== false) fail("Gate C / legalBinding must stay false");
  if (raw.neonClinicalWrites !== false || raw.httpServer !== false) fail("neon/http must stay false");
  if (raw.scientificAcceptance !== "BLOCKED") fail("scientificAcceptance must stay BLOCKED");
  if (raw.dataClass !== "synthetic" || raw.containsPhi !== false) fail("honesty dataClass/PHI");
  return raw as HonestyRegressionReceipt;
}

export type SyntheticE2eHonestyCheckResult = {
  ok: true;
  regressionId: typeof SYNTHETIC_E2E_HONESTY_REGRESSION_ID;
  quarantineRows: number;
  oracleCases: number;
  engineeringHarness: GateStatus;
  scientificAcceptance: GateStatus;
  banner: typeof SYNTHETIC_NE_CLINICAL_NE_ELIGIBLE;
};

export function checkSyntheticE2eHonestyRegression(repoRoot?: string): SyntheticE2eHonestyCheckResult {
  const receipt = parseHonestyRegressionReceipt(
    runHonestyRegressionPack({
      repoRoot: repoRoot ?? resolve(import.meta.dir, "../.."),
      generatedAt: "2026-11-08T05:40:00.000Z",
    }),
  );
  return {
    ok: true,
    regressionId: receipt.regressionId,
    quarantineRows: receipt.quarantineRows,
    oracleCases: receipt.oracleCases,
    engineeringHarness: receipt.engineeringHarness,
    scientificAcceptance: receipt.scientificAcceptance,
    banner: receipt.banner,
  };
}
