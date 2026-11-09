/**
 * Shared fail-closed write gate for N2/N7 Neon ledger helpers (Audit #7 companion).
 * Reads may use any HSI red-wave host; writes require staging + writesEnabled.
 * Never autumn-snow / Akeno / DeliverX.
 */
import {
  assertHsiNeonDatabaseUrl,
  HSI_STAGING_HOST_PREFIX,
  isForbiddenNeonTarget,
} from "./neonGuard";

export type LedgerNeonStoreConfig = {
  databaseUrl: string;
  neonProjectId?: string | null;
  /** Must be true AND target staging host for any INSERT/UPDATE. */
  writesEnabled?: boolean;
};

export class LedgerNeonWriteGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LedgerNeonWriteGateError";
  }
}

function hostPrefix(databaseUrl: string): string {
  const host = new URL(databaseUrl).hostname.split(".")[0]?.replace(/-pooler$/, "") ?? "";
  return host;
}

/** Guard HSI Neon URL; refuse forbidden projects. */
export function assertLedgerNeonReadable(config: LedgerNeonStoreConfig): {hostPrefix: string} {
  if (isForbiddenNeonTarget(config.databaseUrl)) {
    throw new LedgerNeonWriteGateError(
      "Forbidden Neon target (ISI autumn-snow / Akeno / DeliverX) refused for HSI ledger helpers",
    );
  }
  const guard = assertHsiNeonDatabaseUrl(config.databaseUrl, {
    neonProjectId: config.neonProjectId,
  });
  if (!guard.ok) {
    throw new LedgerNeonWriteGateError(`HSI database guard: ${guard.reason}`);
  }
  return {hostPrefix: hostPrefix(config.databaseUrl)};
}

/**
 * Writes require writesEnabled=true and the approved staging host prefix.
 * Production (ep-hsi-production) stays read-only for ledger helpers.
 */
export function assertLedgerNeonWritable(config: LedgerNeonStoreConfig): {hostPrefix: string} {
  const readable = assertLedgerNeonReadable(config);
  if (config.writesEnabled !== true) {
    throw new LedgerNeonWriteGateError(
      "Ledger writes disabled (writesEnabled=false). Offline fixtures remain authority.",
    );
  }
  if (readable.hostPrefix !== HSI_STAGING_HOST_PREFIX) {
    throw new LedgerNeonWriteGateError(
      `Ledger writes require approved staging host ${HSI_STAGING_HOST_PREFIX}; got ${readable.hostPrefix || "unknown"}`,
    );
  }
  return readable;
}

/** Pure honesty samples for unit tests — no live Neon. */
export function assessLedgerNeonWriteGateSamples(): {
  stagingWritesEnabled: boolean;
  productionWritesRefused: boolean;
  writesDisabledRefused: boolean;
  autumnSnowRefused: boolean;
} {
  const stagingUrl =
    "postgresql://test:never-used@ep-hsi-staging.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
  const productionUrl =
    "postgresql://test:never-used@ep-hsi-production.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
  const autumnSnowUrl =
    "postgresql://x:y@ep-isi-product-example.eu-west-2.aws.neon.tech/neondb?sslmode=require";

  let stagingWritesEnabled = false;
  try {
    assertLedgerNeonWritable({databaseUrl: stagingUrl, writesEnabled: true});
    stagingWritesEnabled = true;
  } catch {
    stagingWritesEnabled = false;
  }

  let productionWritesRefused = false;
  try {
    assertLedgerNeonWritable({databaseUrl: productionUrl, writesEnabled: true});
  } catch {
    productionWritesRefused = true;
  }

  let writesDisabledRefused = false;
  try {
    assertLedgerNeonWritable({databaseUrl: stagingUrl, writesEnabled: false});
  } catch {
    writesDisabledRefused = true;
  }

  let autumnSnowRefused = false;
  try {
    assertLedgerNeonReadable({databaseUrl: autumnSnowUrl});
  } catch {
    autumnSnowRefused = true;
  }

  return {
    stagingWritesEnabled,
    productionWritesRefused,
    writesDisabledRefused,
    autumnSnowRefused,
  };
}
