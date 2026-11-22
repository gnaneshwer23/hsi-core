/**
 * U38 — staging multi-process / crash-restart E2E harness (U33–U34 live path).
 *
 * Modes:
 * - check: CI-safe honesty catalog (no spawn, no Neon)
 * - fixture: real OS multi-process against durable SQLite CAS store
 * - live: real OS multi-process against disposable HSI Neon (owner env only)
 *
 * Never invents Neon hosts, research_admin sessions, write enablement,
 * scientific approval, Gate C, or acceptedForScope.
 */
import {assertDisposableRehearsalTarget} from "../db/migrationRehearsal";

export const HSI_MULTIPROCESS_CRASH_RESTART_SUITE_SCHEMA =
  "hsi-multiprocess-crash-restart-suite-1" as const;

export type HsiMultiprocessSuiteMode = "check" | "fixture" | "live";

export type HsiMultiprocessSurfaceId =
  | "exclusive_ownership_os_race"
  | "crash_restart_orphan_resume"
  | "sqlite_fixture_store"
  | "neon_live_store"
  | "disposable_neon_target"
  | "research_admin_recovery_http";

export type HsiMultiprocessSurfaceRow = {
  surface: HsiMultiprocessSurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  acceptedForScope: false;
  scientificApproval: false;
  notes: string;
};

export type HsiMultiprocessCrashRestartPacket = {
  schemaVersion: typeof HSI_MULTIPROCESS_CRASH_RESTART_SUITE_SCHEMA;
  purpose: "hsi_multiprocess_crash_restart_e2e_u38";
  backlogId: "HSI-U38-MULTIPROCESS-CRASH-RESTART";
  closesSoftLandGaps: readonly ["U33", "U34"];
  scientificApproval: false;
  acceptedForScope: false;
  gateCAutoApprove: false;
  productionWritesEnabled: false;
  inventedNeonHost: false;
  inventedResearchAdmin: false;
  ciSafeModes: readonly Extract<HsiMultiprocessSuiteMode, "check" | "fixture">[];
  surfaces: readonly HsiMultiprocessSurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/hsi-multiprocess-crash-restart-u38.pending.json";
  softLandDocPath: "docs/engineering/HSI_U38_MULTIPROCESS_CRASH_RESTART_E2E_2026-11-21.md";
  honesty: {
    fixtureOsProcessesAreNotNeon: true;
    liveRequiresDisposableTarget: true;
    acceptedForScopeStaysFalse: true;
    noInventedHosts: true;
    noGateC: true;
  };
};

export type HsiMultiprocessAssessment = {
  schemaVersion: "hsi-multiprocess-crash-restart-assessment-1";
  suiteMode: HsiMultiprocessSuiteMode;
  mayClaimLiveOsMultiProcessE2E: boolean;
  mayClaimLiveNeonMultiProcessE2E: boolean;
  mayInventNeonHost: false;
  mayEnableProductionWrites: false;
  mayClaimAcceptedForScope: false;
  mayClaimScientificApproval: false;
  ciSafe: boolean;
  reasons: string[];
};

const SURFACES: readonly HsiMultiprocessSurfaceRow[] = [
  {
    surface: "exclusive_ownership_os_race",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    acceptedForScope: false,
    scientificApproval: false,
    notes:
      "Two OS claimer processes race startHsiCheckpoint; exactly one owner. Fixture proves OS path; Neon live still owner-gated.",
  },
  {
    surface: "crash_restart_orphan_resume",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    acceptedForScope: false,
    scientificApproval: false,
    notes:
      "Worker A leaves RUNNING; worker B resumes orphan / abandon-then-retry via store API. research_admin HTTP recovery remains separate.",
  },
  {
    surface: "sqlite_fixture_store",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    acceptedForScope: false,
    scientificApproval: false,
    notes: "Durable SQLite CAS store for CI-safe multi-process fixture only.",
  },
  {
    surface: "neon_live_store",
    engineeringReady: true,
    ownerEvidenceRequired: true,
    acceptedForScope: false,
    scientificApproval: false,
    notes: "createHsiNeonCheckpointStore on disposable HSI Neon; refused without owner env pins.",
  },
  {
    surface: "disposable_neon_target",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    acceptedForScope: false,
    scientificApproval: false,
    notes: "assertDisposableRehearsalTarget must pass; hosts never invented in git.",
  },
  {
    surface: "research_admin_recovery_http",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    acceptedForScope: false,
    scientificApproval: false,
    notes:
      "authoriseAndRecoverHsiCheckpoint HTTP/admin path still owner-gated (credentials + disposable target).",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Create an expiring disposable child of the HSI production Neon branch (≤24h).",
  "Confirm assertDisposableRehearsalTarget would pass (parent=production, not default/primary).",
  "Set HSI_MULTIPROCESS_E2E_ENABLED=1 and HSI_MULTIPROCESS_LIVE_AUTHORIZED=1 only for that run.",
  "Supply HSI_MULTIPROCESS_DATABASE_URL + disposable pin env privately — never commit.",
  "Tear down the disposable branch afterwards; production untouched.",
];

export function hsiMultiprocessCrashRestartPacket(): HsiMultiprocessCrashRestartPacket {
  return {
    schemaVersion: HSI_MULTIPROCESS_CRASH_RESTART_SUITE_SCHEMA,
    purpose: "hsi_multiprocess_crash_restart_e2e_u38",
    backlogId: "HSI-U38-MULTIPROCESS-CRASH-RESTART",
    closesSoftLandGaps: ["U33", "U34"],
    scientificApproval: false,
    acceptedForScope: false,
    gateCAutoApprove: false,
    productionWritesEnabled: false,
    inventedNeonHost: false,
    inventedResearchAdmin: false,
    ciSafeModes: ["check", "fixture"],
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/hsi-multiprocess-crash-restart-u38.pending.json",
    softLandDocPath: "docs/engineering/HSI_U38_MULTIPROCESS_CRASH_RESTART_E2E_2026-11-21.md",
    honesty: {
      fixtureOsProcessesAreNotNeon: true,
      liveRequiresDisposableTarget: true,
      acceptedForScopeStaysFalse: true,
      noInventedHosts: true,
      noGateC: true,
    },
  };
}

export function hsiMultiprocessSurfaceById(
  surface: HsiMultiprocessSurfaceId,
): HsiMultiprocessSurfaceRow {
  switch (surface) {
    case "exclusive_ownership_os_race":
    case "crash_restart_orphan_resume":
    case "sqlite_fixture_store":
    case "neon_live_store":
    case "disposable_neon_target":
    case "research_admin_recovery_http": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing U38 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown U38 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessHsiMultiprocessCrashRestartMode(
  mode: HsiMultiprocessSuiteMode,
): HsiMultiprocessAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-multiprocess-crash-restart-assessment-1",
        suiteMode: mode,
        mayClaimLiveOsMultiProcessE2E: false,
        mayClaimLiveNeonMultiProcessE2E: false,
        mayInventNeonHost: false,
        mayEnableProductionWrites: false,
        mayClaimAcceptedForScope: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "check mode validates harness honesty only",
          "no OS spawn and no Neon connection",
        ],
      };
    case "fixture":
      return {
        schemaVersion: "hsi-multiprocess-crash-restart-assessment-1",
        suiteMode: mode,
        mayClaimLiveOsMultiProcessE2E: true,
        mayClaimLiveNeonMultiProcessE2E: false,
        mayInventNeonHost: false,
        mayEnableProductionWrites: false,
        mayClaimAcceptedForScope: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "fixture spawns real OS processes against SQLite CAS",
          "fixture green is not Neon live multi-process acceptance",
        ],
      };
    case "live":
      return {
        schemaVersion: "hsi-multiprocess-crash-restart-assessment-1",
        suiteMode: mode,
        mayClaimLiveOsMultiProcessE2E: true,
        mayClaimLiveNeonMultiProcessE2E: true,
        mayInventNeonHost: false,
        mayEnableProductionWrites: false,
        mayClaimAcceptedForScope: false,
        mayClaimScientificApproval: false,
        ciSafe: false,
        reasons: [
          "live requires disposable HSI Neon pins and dual authorization flags",
          "acceptedForScope stays false until independent security packet",
        ],
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown U38 suite mode: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsiMultiprocessCrashRestartSoftLand(
  packet: HsiMultiprocessCrashRestartPacket,
): {
  surfaceCount: number;
  acceptedForScope: false;
  inventedNeonHost: false;
  productionWritesEnabled: false;
} {
  if (packet.schemaVersion !== HSI_MULTIPROCESS_CRASH_RESTART_SUITE_SCHEMA) {
    throw new Error("unexpected U38 schema");
  }
  if (packet.backlogId !== "HSI-U38-MULTIPROCESS-CRASH-RESTART") {
    throw new Error("soft-land must bind HSI-U38-MULTIPROCESS-CRASH-RESTART");
  }
  if (
    packet.acceptedForScope !== false ||
    packet.scientificApproval !== false ||
    packet.gateCAutoApprove !== false ||
    packet.productionWritesEnabled !== false ||
    packet.inventedNeonHost !== false ||
    packet.inventedResearchAdmin !== false
  ) {
    throw new Error("U38 soft-land must keep acceptance, writes, hosts, and Gate C closed");
  }
  if (packet.surfaces.length !== 6) {
    throw new Error("expected six U38 surfaces");
  }
  const neon = packet.surfaces.find((s) => s.surface === "disposable_neon_target");
  if (!neon || neon.engineeringReady !== false || neon.ownerEvidenceRequired !== true) {
    throw new Error("disposable Neon target must stay owner-gated");
  }
  return {
    surfaceCount: packet.surfaces.length,
    acceptedForScope: false,
    inventedNeonHost: false,
    productionWritesEnabled: false,
  };
}

/** Refuse live mode unless dual flags + disposable target pins verify. */
export function assertHsiMultiprocessLiveAuthorization(input: {
  enabled: string | undefined;
  liveAuthorized: string | undefined;
  target: {
    projectId: string;
    branchId: string;
    parentId: string | null;
    isDefault: boolean;
    isPrimary: boolean;
    expiresAt: string | null;
  };
  pins: {
    projectId: string;
    productionBranchId: string;
    disposableBranchId: string;
  };
  databaseUrl: string | undefined;
  now?: number;
}): void {
  if (input.enabled !== "1") {
    throw Error(
      "Live multi-process E2E refused: set HSI_MULTIPROCESS_E2E_ENABLED=1 only on a disposable HSI Neon branch",
    );
  }
  if (input.liveAuthorized !== "1") {
    throw Error(
      "Live multi-process E2E refused: set HSI_MULTIPROCESS_LIVE_AUTHORIZED=1 for an owner-reviewed disposable run",
    );
  }
  if (!input.databaseUrl?.trim()) {
    throw Error("Live multi-process E2E refused: HSI_MULTIPROCESS_DATABASE_URL required");
  }
  assertDisposableRehearsalTarget(input.target, input.pins, input.now ?? Date.now());
}
