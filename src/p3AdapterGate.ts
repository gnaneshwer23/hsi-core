/**
 * P3 adapter license gate — refuse run while blockedUntilSignOff=true.
 *
 * Binding: docs/P3_ADAPTER_RFC.md · docs/P3_WEIGHTS_AND_LICENSE_POLICY.md ·
 * src/p3AdapterLicenseMatrix.ts.
 * Never invents commercial signed; never flips grades.
 */
import {
  assertSafeP3AdapterLicenseRow,
  buildP3AdapterLicenseRows,
  type P3AdapterLicenseRow,
} from "./p3AdapterLicenseMatrix";

/** Env ack required before Boltz stub proposals (weights policy). */
export const WEIGHTS_POLICY_ACK_ENV = "WEIGHTS_POLICY_ACK" as const;
/** Optional external Boltz weights cache — never vendored into hsi-core. */
export const BOLTZ_WEIGHTS_CACHE_ENV = "BOLTZ_WEIGHTS_CACHE" as const;

export class P3AdapterLicenseBlockedError extends Error {
  readonly adapterId: string;
  readonly signOffStatus: string;

  constructor(row: P3AdapterLicenseRow) {
    super(
      `Refusing adapter "${row.adapterId}" — blockedUntilSignOff=true (signOffStatus=${row.signOffStatus}). See docs/P3_ADAPTER_RFC.md.`,
    );
    this.name = "P3AdapterLicenseBlockedError";
    this.adapterId = row.adapterId;
    this.signOffStatus = row.signOffStatus;
  }
}

export class WeightsPolicyNotAckedError extends Error {
  readonly adapterId: string;

  constructor(adapterId: string) {
    super(
      `Refusing adapter "${adapterId}" — WEIGHTS_POLICY_ACK must be "true" (see docs/P3_WEIGHTS_AND_LICENSE_POLICY.md). No multi-GB weight vendoring.`,
    );
    this.name = "WeightsPolicyNotAckedError";
    this.adapterId = adapterId;
  }
}

export class P3AdapterUnknownError extends Error {
  readonly adapterId: string;

  constructor(adapterId: string) {
    super(
      `Unknown P3 adapter "${adapterId}" — not present in hsi-p3-adapter-license-matrix.`,
    );
    this.name = "P3AdapterUnknownError";
    this.adapterId = adapterId;
  }
}

/** Lookup a matrix row by adapterId (throws if missing). */
export function getP3AdapterLicenseRow(
  adapterId: string,
  rows: P3AdapterLicenseRow[] = buildP3AdapterLicenseRows(),
): P3AdapterLicenseRow {
  const row = rows.find((r) => r.adapterId === adapterId);
  if (!row) {
    throw new P3AdapterUnknownError(adapterId);
  }
  return row;
}

export function isWeightsPolicyAcked(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const raw = env[WEIGHTS_POLICY_ACK_ENV];
  if (!raw) return false;
  const v = raw.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * Boltz (and any weights-gated adapter): require WEIGHTS_POLICY_ACK=true.
 * Does not download or vendor weights.
 */
export function assertWeightsPolicyAcked(
  adapterId: string,
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (!isWeightsPolicyAcked(env)) {
    throw new WeightsPolicyNotAckedError(adapterId);
  }
}

export function getOptionalBoltzWeightsCache(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const raw = env[BOLTZ_WEIGHTS_CACHE_ENV]?.trim();
  return raw && raw.length > 0 ? raw : null;
}

/**
 * License gate before any adapter run / wire / download.
 * Throws when blockedUntilSignOff=true or mayFlipEvidenceGrade would be true.
 */
export function assertP3AdapterRunnable(
  adapterId: string,
  rows: P3AdapterLicenseRow[] = buildP3AdapterLicenseRows(),
): P3AdapterLicenseRow {
  const row = getP3AdapterLicenseRow(adapterId, rows);
  if (row.blockedUntilSignOff) {
    throw new P3AdapterLicenseBlockedError(row);
  }
  // Literal false/true fields on P3AdapterLicenseRow are compile-time guarantees;
  // re-check via Record so mutated / cast rows still fail closed (and tsc stays green).
  const safety = assertSafeP3AdapterLicenseRow(
    row as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(`Refusing adapter "${adapterId}" — ${safety.reason}`);
  }
  return row;
}

/**
 * Boltz gate: license row + WEIGHTS_POLICY_ACK.
 */
export function assertBoltzAdapterRunnable(
  rows: P3AdapterLicenseRow[] = buildP3AdapterLicenseRows(),
  env: NodeJS.ProcessEnv = process.env,
): P3AdapterLicenseRow {
  const row = assertP3AdapterRunnable("adapter-boltz", rows);
  assertWeightsPolicyAcked("adapter-boltz", env);
  return row;
}
