/**
 * Synthetic e2e → N5 / Path B adapter (engineering slice).
 *
 * Maps a tiny subset (1 patient × 1 protocol version × criteria) from the
 * vendored hsi-synthetic-e2e sample payloads into N5-adjacent honesty types.
 * Never claims live eligibility, CDS/PHI, Gate C, or Neon clinical writes.
 */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {HSI_CDS_PHI_INVARIANTS, rejectPhiPayload, type HsiCdsPhiInvariants} from "../cdsPhiBoundary";
import {
  CRITERION_STATES,
  FORBIDDEN_ELIGIBILITY_PHRASES,
  containsForbiddenEligibilityLanguage,
  type CriterionState,
} from "../trialsCriteriaMvp";

export const SYNTHETIC_E2E_N5_ADAPTER_SCHEMA = "hsi-synthetic-e2e-n5-adapter-1" as const;
export const SYNTHETIC_E2E_N5_ADAPTER_METHOD = "hsi-synthetic-e2e-pack-to-path-b-1" as const;
export const SYNTHETIC_E2E_N5_ADAPTER_ID = "adapter-synthetic-e2e-n5-slice-1" as const;

export const PACK_TRUTH_VALUES = ["true", "false", "unknown"] as const;
export type PackTruth = (typeof PACK_TRUTH_VALUES)[number];

export const PACK_SCREENING_STATUSES = ["candidate", "excluded", "needs_review"] as const;
export type PackScreeningStatus = (typeof PACK_SCREENING_STATUSES)[number];

export type GateStatus = "CLEARED" | "BLOCKED";

export type PackCriterionDecision = {
  criterion_id: string;
  evidence_ids: string[];
  reason: string;
  truth: PackTruth;
};

export type PackTrialScreening = {
  as_of: string;
  criterion_decisions: PackCriterionDecision[];
  notice: string;
  patient_id: string;
  protocol_version_id: string;
  status: PackScreeningStatus;
  trial_id: string;
  unknowns: string[];
};

export type PackSampleResponse = {
  synthetic: true;
  synthetic_notice: string;
  contract_version: string;
  namespace: string;
  confidence: {method: string; value: null};
  trial_screening: PackTrialScreening;
  ui_state: string;
};

/**
 * Pack truth → Path B criterion state.
 * Pack screening labels (candidate|excluded|needs_review) are aggregate UI
 * statuses derived from these truths — they are not themselves Path B states
 * and never imply patientEligible / confirmedEligible.
 */
export function mapPackTruthToPathB(truth: PackTruth): CriterionState {
  switch (truth) {
    case "true":
      return "satisfied";
    case "false":
      return "not_satisfied";
    case "unknown":
      return "unknown";
    default: {
      const _exhaustive: never = truth;
      return _exhaustive;
    }
  }
}

/**
 * Pack screening status ↔ Path B aggregate correspondence (honesty-preserving).
 * candidate ≠ eligibility; excluded / needs_review stay fixture labels only.
 */
export function mapPackScreeningToPathBAggregate(
  status: PackScreeningStatus,
): {
  dominantPathBState: CriterionState;
  correspondence: string;
} {
  switch (status) {
    case "candidate":
      return {
        dominantPathBState: "satisfied",
        correspondence:
          "Pack status candidate ↔ Path B criteria all satisfied on fixture rules only — not confirmedEligible / patientEligible.",
      };
    case "excluded":
      return {
        dominantPathBState: "not_satisfied",
        correspondence:
          "Pack status excluded ↔ Path B has not_satisfied criterion — fixture screening label only, not clinical exclusion authority.",
      };
    case "needs_review":
      return {
        dominantPathBState: "requires_investigator_review",
        correspondence:
          "Pack status needs_review ↔ Path B unknown / investigator review — missing fixture facts stay unresolved.",
      };
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/** Inverse documentation: pack truth → pack screening contribution. */
export function packTruthToScreeningContribution(truth: PackTruth): PackScreeningStatus {
  switch (truth) {
    case "true":
      return "candidate";
    case "false":
      return "excluded";
    case "unknown":
      return "needs_review";
    default: {
      const _exhaustive: never = truth;
      return _exhaustive;
    }
  }
}

export type AdaptedCriterionInspection = {
  criterionId: string;
  packTruth: PackTruth;
  packScreeningContribution: PackScreeningStatus;
  state: CriterionState;
  reason: string;
  evidenceIds: string[];
  attributePresent: boolean;
  method: typeof SYNTHETIC_E2E_N5_ADAPTER_METHOD;
  confirmedEligible: false;
};

export type SyntheticE2eN5AdapterSlice = {
  schemaVersion: typeof SYNTHETIC_E2E_N5_ADAPTER_SCHEMA;
  adapterId: typeof SYNTHETIC_E2E_N5_ADAPTER_ID;
  method: typeof SYNTHETIC_E2E_N5_ADAPTER_METHOD;
  generatedAt: string;
  /** Forced honesty — always synthetic engineering fixture. */
  dataClass: "synthetic";
  containsPhi: false;
  syntheticOnly: true;
  patientId: string;
  trialId: string;
  protocolVersionId: string;
  asOf: string;
  packScreeningStatus: PackScreeningStatus;
  pathBAggregate: ReturnType<typeof mapPackScreeningToPathBAggregate>;
  inspections: AdaptedCriterionInspection[];
  satisfiedCount: number;
  notSatisfiedCount: number;
  unknownCount: number;
  overallLabel: "criterion_assessment_only";
  confirmedEligible: false;
  patientEligible: false;
  patientEligibilityAssessed: false;
  enrolmentEnabled: false;
  clinicalAdvice: false;
  scientificApproval: false;
  graphPromotable: false;
  httpServer: false;
  neonClinicalWrites: false;
  gateCAutoApprove: false;
  engineeringHarness: GateStatus;
  scientificAcceptance: GateStatus;
  honestyBanners: string[];
  honesty: string[];
  invariants: HsiCdsPhiInvariants;
  sourceSample: string;
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

function parsePackTruth(value: unknown, label: string): PackTruth {
  if (typeof value !== "string" || !(PACK_TRUTH_VALUES as readonly string[]).includes(value)) {
    fail(`${label}: truth must be true|false|unknown`);
  }
  return value as PackTruth;
}

function parsePackScreeningStatus(value: unknown, label: string): PackScreeningStatus {
  if (typeof value !== "string" || !(PACK_SCREENING_STATUSES as readonly string[]).includes(value)) {
    fail(`${label}: status must be candidate|excluded|needs_review`);
  }
  return value as PackScreeningStatus;
}

export function parsePackSampleResponse(raw: unknown, sourceSample = "inline"): PackSampleResponse {
  if (!isObject(raw)) fail(`${sourceSample}: sample must be object`);
  if (raw.synthetic !== true) fail(`${sourceSample}: synthetic must be true`);
  const synthetic_notice = asString(raw.synthetic_notice, `${sourceSample}.synthetic_notice`);
  if (!synthetic_notice.includes("Wholly synthetic")) {
    fail(`${sourceSample}: synthetic_notice must keep wholly-synthetic banner`);
  }
  const phiGate = rejectPhiPayload({
    containsPhi: false,
    mayUseLivePhi: false,
    phiToLlm: false,
    textBlobs: [synthetic_notice, JSON.stringify(raw.trial_screening ?? {})],
  });
  if (!phiGate.ok) fail(`${sourceSample}: PHI boundary rejected sample (${phiGate.detail})`);
  if (!isObject(raw.confidence) || raw.confidence.value !== null) {
    fail(`${sourceSample}: confidence.value must be null`);
  }
  if (!isObject(raw.trial_screening)) fail(`${sourceSample}: trial_screening required`);
  const ts = raw.trial_screening;
  const notice = asString(ts.notice, `${sourceSample}.trial_screening.notice`);
  if (!notice.includes("not confirmed eligibility") || !notice.includes("SYNTHETIC_ONLY")) {
    fail(`${sourceSample}: screening notice must deny confirmed eligibility`);
  }
  if (!Array.isArray(ts.criterion_decisions) || ts.criterion_decisions.length === 0) {
    fail(`${sourceSample}: criterion_decisions must be non-empty`);
  }
  const criterion_decisions: PackCriterionDecision[] = ts.criterion_decisions.map((row, i) => {
    if (!isObject(row)) fail(`${sourceSample}: criterion_decisions[${i}] must be object`);
    const evidence_ids = Array.isArray(row.evidence_ids)
      ? row.evidence_ids.map((id, j) => asString(id, `${sourceSample}.evidence_ids[${j}]`))
      : fail(`${sourceSample}: criterion_decisions[${i}].evidence_ids must be array`);
    return {
      criterion_id: asString(row.criterion_id, `${sourceSample}.criterion_id[${i}]`),
      evidence_ids,
      reason: asString(row.reason, `${sourceSample}.reason[${i}]`),
      truth: parsePackTruth(row.truth, `${sourceSample}.truth[${i}]`),
    };
  });
  const unknowns = Array.isArray(ts.unknowns)
    ? ts.unknowns.map((u, i) => asString(u, `${sourceSample}.unknowns[${i}]`))
    : fail(`${sourceSample}: unknowns must be array`);

  return {
    synthetic: true,
    synthetic_notice,
    contract_version: asString(raw.contract_version, `${sourceSample}.contract_version`),
    namespace: asString(raw.namespace, `${sourceSample}.namespace`),
    confidence: {
      method: asString(raw.confidence.method, `${sourceSample}.confidence.method`),
      value: null,
    },
    trial_screening: {
      as_of: asString(ts.as_of, `${sourceSample}.as_of`),
      criterion_decisions,
      notice,
      patient_id: asString(ts.patient_id, `${sourceSample}.patient_id`),
      protocol_version_id: asString(ts.protocol_version_id, `${sourceSample}.protocol_version_id`),
      status: parsePackScreeningStatus(ts.status, `${sourceSample}.status`),
      trial_id: asString(ts.trial_id, `${sourceSample}.trial_id`),
      unknowns,
    },
    ui_state: asString(raw.ui_state, `${sourceSample}.ui_state`),
  };
}

function assertHonestyText(text: string, label: string): void {
  if (containsForbiddenEligibilityLanguage(text)) {
    fail(`${label}: forbidden eligibility language`);
  }
  for (const phrase of FORBIDDEN_ELIGIBILITY_PHRASES) {
    if (text.toLowerCase().includes(phrase)) fail(`${label}: contains "${phrase}"`);
  }
}

/**
 * Adapt one vendored sample into an N5-adjacent Path B slice.
 * Scope: exactly one patient × one protocol version × its criterion decisions.
 */
export function adaptSyntheticE2eSampleToN5Slice(input: {
  sample: PackSampleResponse;
  sourceSample: string;
  generatedAt: string;
}): SyntheticE2eN5AdapterSlice {
  const {sample, sourceSample, generatedAt} = input;
  const ts = sample.trial_screening;
  assertHonestyText(sample.synthetic_notice, "synthetic_notice");
  assertHonestyText(ts.notice, "trial_screening.notice");

  if (!ts.patient_id.startsWith("SYNTHETIC/PATIENT/")) {
    fail("patient_id must remain under SYNTHETIC/PATIENT/");
  }
  if (!ts.protocol_version_id.startsWith("SYNTHETIC/TRIAL/")) {
    fail("protocol_version_id must remain under SYNTHETIC/TRIAL/");
  }
  if (!ts.trial_id.startsWith("SYNTHETIC/TRIAL/")) {
    fail("trial_id must remain under SYNTHETIC/TRIAL/");
  }

  const inspections: AdaptedCriterionInspection[] = ts.criterion_decisions.map((d) => {
    const state = mapPackTruthToPathB(d.truth);
    if (!(CRITERION_STATES as readonly string[]).includes(state)) {
      fail(`mapped state out of Path B: ${state}`);
    }
    return {
      criterionId: d.criterion_id,
      packTruth: d.truth,
      packScreeningContribution: packTruthToScreeningContribution(d.truth),
      state,
      reason: d.reason,
      evidenceIds: d.evidence_ids,
      attributePresent: d.truth !== "unknown",
      method: SYNTHETIC_E2E_N5_ADAPTER_METHOD,
      confirmedEligible: false,
    };
  });

  const count = (state: CriterionState) => inspections.filter((i) => i.state === state).length;
  const satisfiedCount = count("satisfied");
  const notSatisfiedCount = count("not_satisfied");
  const unknownCount = count("unknown");
  const pathBAggregate = mapPackScreeningToPathBAggregate(ts.status);

  // Consistency: pack aggregate must match Path B counts for this tiny slice.
  if (ts.status === "candidate" && (notSatisfiedCount > 0 || unknownCount > 0)) {
    fail("pack status candidate requires all criteria satisfied (truth=true)");
  }
  if (ts.status === "excluded" && notSatisfiedCount === 0) {
    fail("pack status excluded requires at least one not_satisfied (truth=false)");
  }
  if (ts.status === "needs_review" && unknownCount === 0) {
    fail("pack status needs_review requires at least one unknown (truth=unknown)");
  }

  const honestyBanners = [sample.synthetic_notice, ts.notice];
  const honesty = [
    "Vendored synthetic e2e sample only — not live CDS, PHI, or enrolment.",
    "dataClass=synthetic · containsPhi=false · patientEligible=false · confirmedEligible=false always.",
    "Pack candidate|excluded|needs_review are fixture screening labels; Path B states never grant eligibility.",
    pathBAggregate.correspondence,
    "No HTTP server, Gate C auto-approve, invented MoU, or Neon clinical writes.",
  ];

  return {
    schemaVersion: SYNTHETIC_E2E_N5_ADAPTER_SCHEMA,
    adapterId: SYNTHETIC_E2E_N5_ADAPTER_ID,
    method: SYNTHETIC_E2E_N5_ADAPTER_METHOD,
    generatedAt,
    dataClass: "synthetic",
    containsPhi: false,
    syntheticOnly: true,
    patientId: ts.patient_id,
    trialId: ts.trial_id,
    protocolVersionId: ts.protocol_version_id,
    asOf: ts.as_of,
    packScreeningStatus: ts.status,
    pathBAggregate,
    inspections,
    satisfiedCount,
    notSatisfiedCount,
    unknownCount,
    overallLabel: "criterion_assessment_only",
    confirmedEligible: false,
    patientEligible: false,
    patientEligibilityAssessed: false,
    enrolmentEnabled: false,
    clinicalAdvice: false,
    scientificApproval: false,
    graphPromotable: false,
    httpServer: false,
    neonClinicalWrites: false,
    gateCAutoApprove: false,
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
    honestyBanners,
    honesty,
    invariants: HSI_CDS_PHI_INVARIANTS,
    sourceSample,
  };
}

export function parseSyntheticE2eN5AdapterSlice(raw: unknown): SyntheticE2eN5AdapterSlice {
  if (!isObject(raw)) fail("adapter slice must be object");
  if (raw.schemaVersion !== SYNTHETIC_E2E_N5_ADAPTER_SCHEMA) fail("schemaVersion mismatch");
  if (raw.adapterId !== SYNTHETIC_E2E_N5_ADAPTER_ID) fail("adapterId mismatch");
  if (raw.dataClass !== "synthetic") fail("dataClass must be synthetic");
  if (raw.containsPhi !== false) fail("containsPhi must be false");
  if (raw.confirmedEligible !== false || raw.patientEligible !== false) {
    fail("eligibility flags must remain false");
  }
  if (raw.overallLabel !== "criterion_assessment_only") fail("overallLabel mismatch");
  if (raw.scientificAcceptance !== "BLOCKED") fail("scientificAcceptance must stay BLOCKED");
  if (raw.httpServer !== false || raw.neonClinicalWrites !== false || raw.gateCAutoApprove !== false) {
    fail("http/neon/gateC must remain false");
  }
  if (!Array.isArray(raw.inspections) || raw.inspections.length === 0) fail("inspections required");
  for (const row of raw.inspections) {
    if (!isObject(row)) fail("inspection must be object");
    if (!(CRITERION_STATES as readonly string[]).includes(row.state as string)) {
      fail(`inspection state not Path B: ${String(row.state)}`);
    }
    if (row.confirmedEligible !== false) fail("inspection.confirmedEligible must be false");
  }
  return raw as SyntheticE2eN5AdapterSlice;
}

const DEFAULT_FIXTURE_REL = "research/fixtures/hsi-synthetic-e2e";
const DEFAULT_SAMPLE = "outputs/sample_response.json";

/** Load + adapt the pinned default sample (1 patient × 1 protocol × criteria). */
export function adaptVendoredSyntheticE2eDefaultSlice(input?: {
  repoRoot?: string;
  sampleRelativePath?: string;
  generatedAt?: string;
}): SyntheticE2eN5AdapterSlice {
  const repoRoot = input?.repoRoot ?? resolve(import.meta.dir, "../..");
  const sampleRelativePath = input?.sampleRelativePath ?? DEFAULT_SAMPLE;
  const generatedAt = input?.generatedAt ?? "2026-11-08T05:30:00.000Z";
  const abs = resolve(repoRoot, DEFAULT_FIXTURE_REL, sampleRelativePath);
  const raw = JSON.parse(readFileSync(abs, "utf8")) as unknown;
  const sample = parsePackSampleResponse(raw, sampleRelativePath);
  return adaptSyntheticE2eSampleToN5Slice({sample, sourceSample: sampleRelativePath, generatedAt});
}

export type SyntheticE2eN5AdapterCheckResult = {
  ok: true;
  adapterId: typeof SYNTHETIC_E2E_N5_ADAPTER_ID;
  slices: number;
  patientIds: string[];
  packStatuses: PackScreeningStatus[];
  engineeringHarness: GateStatus;
  scientificAcceptance: GateStatus;
};

/** Adapt candidate + excluded + needs_review samples and assert honesty. */
export function checkSyntheticE2eN5Adapter(repoRoot?: string): SyntheticE2eN5AdapterCheckResult {
  const root = repoRoot ?? resolve(import.meta.dir, "../..");
  const generatedAt = "2026-11-08T05:30:00.000Z";
  const samples = [
    "outputs/sample_response.json",
    "outputs/sample_response_excluded.json",
    "outputs/sample_response_needs_review.json",
  ] as const;
  const slices = samples.map((rel) => {
    const slice = adaptVendoredSyntheticE2eDefaultSlice({
      repoRoot: root,
      sampleRelativePath: rel,
      generatedAt,
    });
    return parseSyntheticE2eN5AdapterSlice(slice);
  });

  const byStatus = new Map(slices.map((s) => [s.packScreeningStatus, s]));
  if (!byStatus.has("candidate") || !byStatus.has("excluded") || !byStatus.has("needs_review")) {
    fail("expected one slice each for candidate, excluded, needs_review");
  }
  const candidate = byStatus.get("candidate")!;
  if (candidate.patientId !== "SYNTHETIC/PATIENT/0000") fail("candidate slice patient mismatch");
  if (candidate.protocolVersionId !== "SYNTHETIC/TRIAL/RA/v2") fail("protocol version mismatch");
  if (candidate.inspections.length < 1) fail("candidate must map at least one criterion");
  if (candidate.pathBAggregate.dominantPathBState !== "satisfied") {
    fail("candidate aggregate Path B correspondence mismatch");
  }
  if (byStatus.get("excluded")!.pathBAggregate.dominantPathBState !== "not_satisfied") {
    fail("excluded aggregate Path B correspondence mismatch");
  }
  if (byStatus.get("needs_review")!.pathBAggregate.dominantPathBState !== "requires_investigator_review") {
    fail("needs_review aggregate Path B correspondence mismatch");
  }

  for (const slice of slices) {
    if (slice.dataClass !== "synthetic" || slice.containsPhi !== false) fail("honesty dataClass/PHI");
    if (slice.patientEligible !== false || slice.confirmedEligible !== false) fail("eligibility forced false");
    if (slice.honestyBanners.length < 2) fail("honesty banners required");
  }

  return {
    ok: true,
    adapterId: SYNTHETIC_E2E_N5_ADAPTER_ID,
    slices: slices.length,
    patientIds: slices.map((s) => s.patientId),
    packStatuses: slices.map((s) => s.packScreeningStatus),
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
  };
}
