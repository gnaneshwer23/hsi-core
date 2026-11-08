#!/usr/bin/env bun
/**
 * Synthetic e2e contract pin check.
 * Verifies vendored SHA-256 pins + honesty fields. No HTTP server, Neon, Gate C, or CDS.
 * Python CLI / engine.py remain external — not product authority.
 */
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const root = resolve(import.meta.dir, "..");
const fixtureDir = resolve(root, "research/fixtures/hsi-synthetic-e2e");

const CONTRACT_VERSION = "hsi-output/1.0.0";
const NAMESPACE = "SYNTHETIC/HSI/v1";
const PACK_VERSION = "hsi-fixture-1.0.0";
const SEED = 20261106;
const SCREENING_STATUSES = new Set(["candidate", "excluded", "needs_review"]);
const SYNTHETIC_NOTICE = "Wholly synthetic demonstration; not scientific or clinical validation.";
const SCREENING_NOTICE_FRAGMENT = "not confirmed eligibility";

type PinEntry = {bytes: number; sha256: string};
type FixtureManifest = {
  schemaVersion: string;
  label: string;
  packVersion: string;
  seed: number;
  synthetic: true;
  engineeringPin: "CLEARED";
  scientificAcceptance: "BLOCKED";
  cdsPhi: "BLOCKED";
  httpServer: false;
  enginePyIsProductAuthority: false;
  pin: Record<string, PinEntry>;
};

function fail(message: string): never {
  throw new Error(message);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sha256File(path: string): {bytes: number; sha256: string} {
  const buf = readFileSync(path);
  return {bytes: buf.byteLength, sha256: createHash("sha256").update(buf).digest("hex")};
}

function loadJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertPinHashes(manifest: FixtureManifest): void {
  for (const [rel, expected] of Object.entries(manifest.pin)) {
    const actual = sha256File(resolve(fixtureDir, rel));
    if (actual.sha256 !== expected.sha256) {
      fail(`Hash mismatch for ${rel}: expected ${expected.sha256}, got ${actual.sha256}`);
    }
    if (actual.bytes !== expected.bytes) {
      fail(`Byte-size mismatch for ${rel}: expected ${expected.bytes}, got ${actual.bytes}`);
    }
  }
}

function assertRequestHonesty(request: unknown, path: string): void {
  if (!isObject(request)) fail(`${path}: request must be object`);
  if (request.synthetic !== true) fail(`${path}: synthetic must be true`);
  if (request.namespace !== NAMESPACE) fail(`${path}: namespace must be ${NAMESPACE}`);
  if (request.contract_version !== CONTRACT_VERSION) {
    fail(`${path}: contract_version must be ${CONTRACT_VERSION}`);
  }
  if (typeof request.patient_id !== "string" || !request.patient_id.startsWith("SYNTHETIC/PATIENT/")) {
    fail(`${path}: patient_id must use SYNTHETIC/PATIENT/ prefix`);
  }
  if (typeof request.trial_id !== "string" || !request.trial_id.startsWith("SYNTHETIC/TRIAL/")) {
    fail(`${path}: trial_id must use SYNTHETIC/TRIAL/ prefix`);
  }
}

function assertResponseHonesty(response: unknown, path: string, expectedStatus: string): void {
  if (!isObject(response)) fail(`${path}: response must be object`);
  if (response.synthetic !== true) fail(`${path}: synthetic must be true`);
  if (response.namespace !== NAMESPACE) fail(`${path}: namespace must be ${NAMESPACE}`);
  if (response.contract_version !== CONTRACT_VERSION) {
    fail(`${path}: contract_version must be ${CONTRACT_VERSION}`);
  }
  if (response.ui_state !== "ready_synthetic") fail(`${path}: ui_state must be ready_synthetic`);
  if (response.synthetic_notice !== SYNTHETIC_NOTICE) {
    fail(`${path}: permanent synthetic_notice banner missing or altered`);
  }
  if (response.model_version !== null) fail(`${path}: model_version must be null`);

  if (!isObject(response.confidence)) fail(`${path}: confidence object required`);
  if (response.confidence.value !== null) fail(`${path}: confidence.value must be null`);
  if (typeof response.confidence.method !== "string" || !response.confidence.method.includes("not_calibrated")) {
    fail(`${path}: confidence.method must declare not_calibrated`);
  }

  if (!isObject(response.provenance)) fail(`${path}: provenance required`);
  if (response.provenance.kind !== "procedural-fiction") {
    fail(`${path}: provenance.kind must be procedural-fiction`);
  }
  if (response.provenance.generator !== PACK_VERSION) {
    fail(`${path}: provenance.generator must be ${PACK_VERSION}`);
  }

  if (!isObject(response.trial_screening)) fail(`${path}: trial_screening required`);
  const screening = response.trial_screening;
  if (screening.status !== expectedStatus) {
    fail(`${path}: expected screening status ${expectedStatus}, got ${String(screening.status)}`);
  }
  if (!SCREENING_STATUSES.has(String(screening.status))) {
    fail(`${path}: unknown screening status`);
  }
  if (typeof screening.notice !== "string" || !screening.notice.includes(SCREENING_NOTICE_FRAGMENT)) {
    fail(`${path}: trial_screening.notice must deny confirmed eligibility`);
  }
  if (!String(screening.notice).includes("SYNTHETIC_ONLY")) {
    fail(`${path}: trial_screening.notice must carry SYNTHETIC_ONLY banner`);
  }
  // Fixture screening labels only — never live CDS eligibility confirmation.
  if (screening.live_eligibility === true || screening.confirmed_eligibility === true) {
    fail(`${path}: live/confirmed eligibility flags must not be true`);
  }
  if (response.live_eligibility === true || response.cds === true || response.phi === true) {
    fail(`${path}: must not claim live eligibility / CDS / PHI`);
  }
}

function assertApiContractHonesty(contract: unknown): void {
  if (!isObject(contract)) fail("api_contract.json must be object");
  if (contract["x-synthetic-only"] !== true) fail("api_contract.json: x-synthetic-only must be true");
  if (!isObject(contract.info)) fail("api_contract.json: info required");
  const title = String(contract.info.title ?? "");
  if (!title.toLowerCase().includes("not implemented")) {
    fail("api_contract.json: info.title must state HTTP is not implemented");
  }
  const schemas = isObject(contract.components) && isObject(contract.components.schemas)
    ? contract.components.schemas
    : null;
  if (!schemas || !isObject(schemas.Output) || !isObject(schemas.Output.properties)) {
    fail("api_contract.json: Output schema required");
  }
  const synthetic = schemas.Output.properties.synthetic;
  if (!isObject(synthetic) || synthetic.const !== true) {
    fail("api_contract.json: Output.synthetic const must be true");
  }
  const uiState = schemas.Output.properties.ui_state;
  if (!isObject(uiState) || uiState.const !== "ready_synthetic") {
    fail("api_contract.json: Output.ui_state const must be ready_synthetic");
  }
  const ns = schemas.Output.properties.namespace;
  if (!isObject(ns) || ns.const !== NAMESPACE) {
    fail("api_contract.json: Output.namespace const must be SYNTHETIC/HSI/v1");
  }
}

function assertPackManifestHonesty(pack: unknown): void {
  if (!isObject(pack)) fail("PACK_MANIFEST.json must be object");
  if (pack.synthetic !== true) fail("PACK_MANIFEST.json: synthetic must be true");
  if (pack.version !== PACK_VERSION) fail(`PACK_MANIFEST.json: version must be ${PACK_VERSION}`);
  if (pack.namespace !== NAMESPACE) fail("PACK_MANIFEST.json: namespace mismatch");
}

function assertStatusReceipt(status: unknown): void {
  if (!isObject(status)) fail("STATUS.json must be object");
  if (status.engineeringPin !== "CLEARED") fail("STATUS.json: engineeringPin must be CLEARED");
  if (status.scientificAcceptance !== "BLOCKED") fail("STATUS.json: scientificAcceptance must be BLOCKED");
  if (status.cdsPhi !== "BLOCKED") fail("STATUS.json: cdsPhi must be BLOCKED");
  if (status.httpServer !== false) fail("STATUS.json: httpServer must be false");
  if (status.liveEligibility !== false) fail("STATUS.json: liveEligibility must be false");
  if (status.gateCAutoApprove !== false) fail("STATUS.json: gateCAutoApprove must be false");
  if (status.neonWrites !== false) fail("STATUS.json: neonWrites must be false");
  if (status.label !== "e2e-fixture") fail("STATUS.json: label must be e2e-fixture");
  if (status.distinctFrom !== "hsi-synthetic-validation-0.1") {
    fail("STATUS.json: must remain distinct from validation-0.1");
  }
  if (status.seed !== SEED) fail(`STATUS.json: seed must be ${SEED}`);
}

export type SyntheticE2eCheckResult = {
  ok: true;
  packVersion: string;
  seed: number;
  pinnedFiles: number;
  label: "e2e-fixture";
};

export function checkSyntheticE2eFixture(): SyntheticE2eCheckResult {
  const manifest = loadJson(resolve(fixtureDir, "MANIFEST.json")) as FixtureManifest;
  if (manifest.schemaVersion !== "hsi-synthetic-e2e-fixture-manifest-1") {
    fail("MANIFEST.json: unexpected schemaVersion");
  }
  if (manifest.label !== "e2e-fixture") fail("MANIFEST.json: label must be e2e-fixture");
  if (manifest.packVersion !== PACK_VERSION) fail("MANIFEST.json: packVersion mismatch");
  if (manifest.seed !== SEED) fail("MANIFEST.json: seed mismatch");
  if (manifest.synthetic !== true) fail("MANIFEST.json: synthetic must be true");
  if (manifest.engineeringPin !== "CLEARED") fail("MANIFEST.json: engineeringPin must be CLEARED");
  if (manifest.scientificAcceptance !== "BLOCKED") fail("MANIFEST.json: science must stay BLOCKED");
  if (manifest.cdsPhi !== "BLOCKED") fail("MANIFEST.json: cdsPhi must stay BLOCKED");
  if (manifest.httpServer !== false) fail("MANIFEST.json: httpServer must be false");
  if (manifest.enginePyIsProductAuthority !== false) {
    fail("MANIFEST.json: engine.py must not be product authority");
  }

  assertPinHashes(manifest);
  assertPackManifestHonesty(loadJson(resolve(fixtureDir, "PACK_MANIFEST.json")));
  assertApiContractHonesty(loadJson(resolve(fixtureDir, "api_contract.json")));
  assertStatusReceipt(loadJson(resolve(fixtureDir, "STATUS.json")));
  assertRequestHonesty(loadJson(resolve(fixtureDir, "outputs/sample_request.json")), "sample_request");
  assertResponseHonesty(
    loadJson(resolve(fixtureDir, "outputs/sample_response.json")),
    "sample_response",
    "candidate",
  );
  assertResponseHonesty(
    loadJson(resolve(fixtureDir, "outputs/sample_response_excluded.json")),
    "sample_response_excluded",
    "excluded",
  );
  assertResponseHonesty(
    loadJson(resolve(fixtureDir, "outputs/sample_response_needs_review.json")),
    "sample_response_needs_review",
    "needs_review",
  );

  return {
    ok: true,
    packVersion: PACK_VERSION,
    seed: SEED,
    pinnedFiles: Object.keys(manifest.pin).length,
    label: "e2e-fixture",
  };
}

if (import.meta.main) {
  const result = checkSyntheticE2eFixture();
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        check: "fixture:synthetic-e2e:check",
        label: result.label,
        packVersion: result.packVersion,
        seed: result.seed,
        pinnedFiles: result.pinnedFiles,
        engineeringPin: "CLEARED",
        scientificAcceptance: "BLOCKED",
        httpServer: false,
        note: "Contract pin honesty OK; Python CLI external; no CDS/PHI.",
      },
      null,
      2,
    ),
  );
}
