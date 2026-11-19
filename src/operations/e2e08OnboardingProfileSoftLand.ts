/**
 * PR-E2E-08 — server onboarding profile store soft-land.
 *
 * Catalogues fail-closed localStorage-default and staging-only server sync
 * surfaces. Never lifts migration 023, enables production writes, or claims
 * multi-device durable sync from memory rehearsal.
 */

export const E2E_08_ONBOARDING_PROFILE_SCHEMA =
  "hsi-e2e-08-onboarding-profile-soft-land-1" as const;

export type E2e08SuiteMode = "check" | "fixture";

export type E2e08SurfaceId =
  | "device_local_default"
  | "write_gate_fail_closed"
  | "onboarding_profile_api"
  | "memory_rehearsal_store"
  | "migration_023_hold"
  | "client_profile_sync"
  | "staging_owner_enable";

export type E2e08SurfaceDisposition =
  | "reuse_adapter"
  | "reuse_runbook"
  | "hold_unchanged"
  | "owner_gated_staging";

export type E2e08SurfaceRow = {
  surface: E2e08SurfaceId;
  disposition: E2e08SurfaceDisposition;
  schemaApplied: false;
  acceptedForScope: false;
  productionAllowed: false;
  holdsUnchanged: true;
  pathHints: readonly string[];
  notes: string;
};

export type E2e08OnboardingProfilePacket = {
  schemaVersion: typeof E2E_08_ONBOARDING_PROFILE_SCHEMA;
  purpose: "pr_e2e_08_onboarding_profile_soft_land";
  backlogId: "PR-E2E-08";
  priority: "P2";
  scientificApproval: false;
  schemaApplied: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  productionWritesEnabled: false;
  migration023Lifted: false;
  multiDeviceDurableClaimed: false;
  implementationPr: "#473";
  ciSafeModes: readonly E2e08SuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly E2e08SurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/e2e-08-onboarding-profile.pending.json";
  softLandDocPath: "docs/engineering/E2E_08_ONBOARDING_PROFILE_SOFT_LAND.md";
  honesty: {
    defaultIsLocalStorage: true;
    no023HoldRemoval: true;
    noProductionWrites: true;
    memoryStoreIsNotDurableSync: true;
    fixtureIsNotSchemaApplied: true;
  };
};

export type E2e08Assessment = {
  schemaVersion: "hsi-e2e-08-assessment-1";
  suiteMode: E2e08SuiteMode;
  mayClaimSchemaApplied: false;
  mayLift023: false;
  mayEnableProductionWrites: false;
  mayClaimMultiDeviceDurable: false;
  mayClaimScientificApproval: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  schemaApplied: false;
};

export type E2e08ProfileHonesty = {
  schemaVersion: "hsi-e2e-08-profile-honesty-1";
  mustDefaultToLocalStorage: true;
  mustKeep023Held: true;
  mustKeepAcceptedForScopeFalse: true;
  mustNotClaimMemoryAsDurable: true;
  mustRequireStagingPinsAndFlag: true;
  reasons: string[];
};

const SURFACES: readonly E2e08SurfaceRow[] = [
  {
    surface: "device_local_default",
    disposition: "reuse_adapter",
    schemaApplied: false,
    acceptedForScope: false,
    productionAllowed: false,
    holdsUnchanged: true,
    pathHints: ["site/src/lib/researchHome.ts", "src/onboarding/researcherProfile.ts"],
    notes: "Default path remains device-local localStorage until owner staging enable.",
  },
  {
    surface: "write_gate_fail_closed",
    disposition: "reuse_adapter",
    schemaApplied: false,
    acceptedForScope: false,
    productionAllowed: false,
    holdsUnchanged: true,
    pathHints: ["src/db/onboardingProfileWriteGate.ts"],
    notes: "Gate requires flag + research writes pins; schemaApplied stays false.",
  },
  {
    surface: "onboarding_profile_api",
    disposition: "reuse_adapter",
    schemaApplied: false,
    acceptedForScope: false,
    productionAllowed: false,
    holdsUnchanged: true,
    pathHints: ["src/server/onboardingProfileApi.ts"],
    notes: "Status/GET/PUT stay 403 or SCHEMA_NOT_APPLIED without owner backend.",
  },
  {
    surface: "memory_rehearsal_store",
    disposition: "reuse_adapter",
    schemaApplied: false,
    acceptedForScope: false,
    productionAllowed: false,
    holdsUnchanged: true,
    pathHints: ["src/onboarding/onboardingProfileStore.ts"],
    notes: "Injected memory store is rehearsal/tests only — not multi-device durable SQL.",
  },
  {
    surface: "migration_023_hold",
    disposition: "hold_unchanged",
    schemaApplied: false,
    acceptedForScope: false,
    productionAllowed: false,
    holdsUnchanged: true,
    pathHints: ["src/db/migrationHolds.ts"],
    notes: "023 community / additive profile SQL remains held; soft-land never lifts it.",
  },
  {
    surface: "client_profile_sync",
    disposition: "reuse_adapter",
    schemaApplied: false,
    acceptedForScope: false,
    productionAllowed: false,
    holdsUnchanged: true,
    pathHints: ["site/src/lib/onboardingProfileClient.ts"],
    notes: "Client may call server API only when status reports enabled honesty fields.",
  },
  {
    surface: "staging_owner_enable",
    disposition: "owner_gated_staging",
    schemaApplied: false,
    acceptedForScope: false,
    productionAllowed: false,
    holdsUnchanged: true,
    pathHints: ["docs/engineering/ONBOARDING_PROFILE_STORE_RUNBOOK.md"],
    notes: "Owner staging enable steps live in the runbook; production host always refused.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Keep default path device-local localStorage until an explicit staging enable.",
  "Do not lift migration 023 or claim schemaApplied from soft-land green.",
  "Require HSI_ONBOARDING_PROFILE_STORE_ENABLED + research writes pins + additive backend.",
  "Never treat in-memory rehearsal store as multi-device durable sync.",
  "Refuse production host enablement.",
];

const REUSE_MODULES: readonly string[] = [
  "src/db/onboardingProfileWriteGate.ts",
  "src/server/onboardingProfileApi.ts",
  "src/onboarding/onboardingProfileStore.ts",
  "src/onboarding/researcherProfile.ts",
  "site/src/lib/onboardingProfileClient.ts",
  "src/db/migrationHolds.ts",
  "docs/engineering/ONBOARDING_PROFILE_STORE_RUNBOOK.md",
];

export function e2e08OnboardingProfilePacket(): E2e08OnboardingProfilePacket {
  return {
    schemaVersion: E2E_08_ONBOARDING_PROFILE_SCHEMA,
    purpose: "pr_e2e_08_onboarding_profile_soft_land",
    backlogId: "PR-E2E-08",
    priority: "P2",
    scientificApproval: false,
    schemaApplied: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    productionWritesEnabled: false,
    migration023Lifted: false,
    multiDeviceDurableClaimed: false,
    implementationPr: "#473",
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/e2e-08-onboarding-profile.pending.json",
    softLandDocPath: "docs/engineering/E2E_08_ONBOARDING_PROFILE_SOFT_LAND.md",
    honesty: {
      defaultIsLocalStorage: true,
      no023HoldRemoval: true,
      noProductionWrites: true,
      memoryStoreIsNotDurableSync: true,
      fixtureIsNotSchemaApplied: true,
    },
  };
}

export function e2e08SurfaceById(surface: E2e08SurfaceId): E2e08SurfaceRow {
  switch (surface) {
    case "device_local_default":
    case "write_gate_fail_closed":
    case "onboarding_profile_api":
    case "memory_rehearsal_store":
    case "migration_023_hold":
    case "client_profile_sync":
    case "staging_owner_enable": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing E2E-08 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown E2E-08 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessE2e08Mode(mode: E2e08SuiteMode): E2e08Assessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-e2e-08-assessment-1",
        suiteMode: mode,
        mayClaimSchemaApplied: false,
        mayLift023: false,
        mayEnableProductionWrites: false,
        mayClaimMultiDeviceDurable: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "check mode validates fail-closed onboarding honesty only",
          "schemaApplied and acceptedForScope stay false until owner staging packet",
        ],
        scientificApproval: false,
        schemaApplied: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-e2e-08-assessment-1",
        suiteMode: mode,
        mayClaimSchemaApplied: false,
        mayLift023: false,
        mayEnableProductionWrites: false,
        mayClaimMultiDeviceDurable: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "fixture memory-store tests are rehearsal only",
          "fixture green is not durable SQL or migration 023 lift",
        ],
        scientificApproval: false,
        schemaApplied: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown E2E-08 suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Profile-store honesty for PR-E2E-08 soft-land. */
export function assessE2e08ProfileHonesty(): E2e08ProfileHonesty {
  return {
    schemaVersion: "hsi-e2e-08-profile-honesty-1",
    mustDefaultToLocalStorage: true,
    mustKeep023Held: true,
    mustKeepAcceptedForScopeFalse: true,
    mustNotClaimMemoryAsDurable: true,
    mustRequireStagingPinsAndFlag: true,
    reasons: [
      "Default onboarding path remains device-local localStorage",
      "Migration 023 stays held; soft-land never lifts community tables",
      "acceptedForScope and schemaApplied stay false in git artifacts",
      "In-memory rehearsal is not multi-device durable sync",
      "Server path requires staging pins plus explicit store flag and backend",
    ],
  };
}

export function assertE2e08OnboardingProfileSoftLand(
  packet: E2e08OnboardingProfilePacket,
): {
  surfaceCount: number;
  schemaApplied: false;
  migration023Lifted: false;
  productionWritesEnabled: false;
} {
  if (packet.schemaVersion !== E2E_08_ONBOARDING_PROFILE_SCHEMA) {
    throw new Error("unexpected E2E-08 onboarding-profile schema");
  }
  if (packet.backlogId !== "PR-E2E-08" || packet.priority !== "P2") {
    throw new Error("soft-land must bind PR-E2E-08 at P2");
  }
  if (packet.schemaApplied !== false || packet.acceptedForScope !== false) {
    throw new Error("soft-land must keep schemaApplied and acceptedForScope false");
  }
  if (packet.scientificApproval !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim scientific approval or signed packet");
  }
  if (
    packet.productionWritesEnabled !== false ||
    packet.migration023Lifted !== false ||
    packet.multiDeviceDurableClaimed !== false
  ) {
    throw new Error("soft-land must not enable production, lift 023, or claim durable sync");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven E2E-08 surfaces");
  for (const surface of packet.surfaces) {
    if (surface.schemaApplied !== false || surface.acceptedForScope !== false) {
      throw new Error(`surface ${surface.surface} must keep schema/acceptance false`);
    }
    if (surface.productionAllowed !== false || surface.holdsUnchanged !== true) {
      throw new Error(`surface ${surface.surface} must keep production false and holds unchanged`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    schemaApplied: false,
    migration023Lifted: false,
    productionWritesEnabled: false,
  };
}
