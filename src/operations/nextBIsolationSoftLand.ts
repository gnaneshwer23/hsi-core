/**
 * NEXT-B — real-account staging isolation acceptance soft-land (P0).
 *
 * Catalogues the isolation suite, E2E-02 packet, and next-b pending worksheet.
 * Never invents staging targets, researcher/reviewer identities, security
 * signers, or signed scope acceptance. Migration holds stay unchanged.
 */

export const NEXT_B_ISOLATION_SCHEMA =
  "hsi-next-b-isolation-soft-land-1" as const;

export type NextBSuiteMode = "check" | "fixture";

export type NextBSurfaceId =
  | "isolation_suite_cli"
  | "persistence_security_checks"
  | "e2e02_acceptance_packet"
  | "next_b_pending_worksheet"
  | "two_researcher_http_runner"
  | "per_scope_migration_packet"
  | "migration_holds";

export type NextBSurfaceDisposition =
  | "reuse_suite"
  | "reuse_soft_land"
  | "owner_gated_live"
  | "blocked_until_b2"
  | "holds_unchanged";

export type NextBSurfaceRow = {
  surface: NextBSurfaceId;
  disposition: NextBSurfaceDisposition;
  liveExecutionAuthorized: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  pathHints: readonly string[];
  notes: string;
};

export type NextBIsolationPacket = {
  schemaVersion: typeof NEXT_B_ISOLATION_SCHEMA;
  purpose: "next_b_isolation_acceptance_soft_land";
  backlogId: "NEXT-B";
  priority: "P0";
  scientificApproval: false;
  liveExecutionAuthorized: false;
  productionActivationApproved: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedStagingTarget: false;
  inventedResearcherIdentities: false;
  inventedSecuritySigner: false;
  migrationHoldsChanged: false;
  communityWrites: "DEFERRED";
  dependsOnTrackB: readonly ["B2"];
  ciSafeModes: readonly NextBSuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly NextBSurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/next-b-acceptance.pending.json";
  softLandDocPath: "docs/engineering/NEXT_B_ISOLATION_SOFT_LAND.md";
  honesty: {
    checkFixtureNeverAcceptance: true;
    liveOwnerGatedOnly: true;
    noInventedSigner: true;
    noInventedAccounts: true;
    noHoldRemoval: true;
    fixtureIsNotLiveAcceptance: true;
  };
};

export type NextBAssessment = {
  schemaVersion: "hsi-next-b-assessment-1";
  suiteMode: NextBSuiteMode;
  mayClaimAcceptance: false;
  mayEnableLiveExecution: false;
  mayInventSigner: false;
  mayChangeMigrationHolds: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  acceptedForScope: false;
};

export type NextBIsolationHonesty = {
  schemaVersion: "hsi-next-b-isolation-honesty-1";
  mustKeepCheckFixtureNonAcceptance: true;
  mustRequireTwoResearchersPlusReviewer: true;
  mustKeepScopesSeparatelySigned: true;
  mustKeepHoldsUnchanged: true;
  mustKeepCommunityWritesDeferred: true;
  reasons: string[];
};

const SURFACES: readonly NextBSurfaceRow[] = [
  {
    surface: "isolation_suite_cli",
    disposition: "reuse_suite",
    liveExecutionAuthorized: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    pathHints: [
      "src/db/stagingIsolationSuite.ts",
      "docs/engineering/DB_ISOLATION_SUITE_RUNBOOK.md",
    ],
    notes: "staging:isolation:check/fixture CI-safe; :live owner-gated observations only.",
  },
  {
    surface: "persistence_security_checks",
    disposition: "reuse_suite",
    liveExecutionAuthorized: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    pathHints: [
      "src/db/persistenceSecurityAcceptance.ts",
      "src/db/isolationProbeCatalog.ts",
    ],
    notes: "Catalogued persistence-security checks; fixture green ≠ signed scope evidence.",
  },
  {
    surface: "e2e02_acceptance_packet",
    disposition: "reuse_soft_land",
    liveExecutionAuthorized: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    pathHints: [
      "src/operations/e2eIsolationAcceptancePacket.ts",
      "docs/engineering/E2E_02_ISOLATION_ACCEPTANCE_PACKET_SOFT_LAND.md",
    ],
    notes: "E2E-02 soft-land; never invents signer or sets acceptedForScope.",
  },
  {
    surface: "next_b_pending_worksheet",
    disposition: "owner_gated_live",
    liveExecutionAuthorized: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    pathHints: ["operations/staging/next-b-acceptance.pending.json"],
    notes: "BLOCKED worksheet with UNASSIGNED account/signer refs; soft-land invents none.",
  },
  {
    surface: "two_researcher_http_runner",
    disposition: "owner_gated_live",
    liveExecutionAuthorized: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    pathHints: [
      "src/db/stagingIsolationRunner.ts",
      "docs/audits/HSI_NEXT_B_ISOLATION_RUNNER.md",
    ],
    notes: "Real two-researcher + independent reviewer HTTP runner remains owner-gated.",
  },
  {
    surface: "per_scope_migration_packet",
    disposition: "blocked_until_b2",
    liveExecutionAuthorized: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    pathHints: [
      "operations/staging/next-b-acceptance.pending.json",
      "docs/engineering/TRACK_B_OWNER_GATES_SOFT_LAND.md",
    ],
    notes: "Per-scope migration/rollback acceptance needs named DB reviewer (B2).",
  },
  {
    surface: "migration_holds",
    disposition: "holds_unchanged",
    liveExecutionAuthorized: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    pathHints: ["docs/engineering/DB_ISOLATION_SUITE_RUNBOOK.md"],
    notes: "Held migrations stay held; soft-land never removes 022–033 as a batch.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Approve an HSI staging target and private least-privilege config (never commit secrets).",
  "Name Track B2 independent DB reviewer before any hold removal or consolidation apply.",
  "Provision two distinct researchers plus independent reviewer/security signer privately.",
  "Run staging:isolation:live only with owner authorization; retain protected execution evidence per scope.",
  "Keep communityWrites DEFERRED and migrationHoldsChanged false in git artifacts.",
  "Do not treat check/fixture green or soft-land green as NEXT-B acceptance.",
];

const REUSE_MODULES: readonly string[] = [
  "src/db/stagingIsolationSuite.ts",
  "src/db/stagingIsolationRunner.ts",
  "src/db/persistenceSecurityAcceptance.ts",
  "src/db/isolationProbeCatalog.ts",
  "src/operations/e2eIsolationAcceptancePacket.ts",
  "operations/staging/next-b-acceptance.pending.json",
  "docs/engineering/DB_ISOLATION_SUITE_RUNBOOK.md",
  "docs/engineering/E2E_02_ISOLATION_ACCEPTANCE_PACKET_SOFT_LAND.md",
  "docs/engineering/TRACK_B_OWNER_GATES_SOFT_LAND.md",
];

export function nextBIsolationPacket(): NextBIsolationPacket {
  return {
    schemaVersion: NEXT_B_ISOLATION_SCHEMA,
    purpose: "next_b_isolation_acceptance_soft_land",
    backlogId: "NEXT-B",
    priority: "P0",
    scientificApproval: false,
    liveExecutionAuthorized: false,
    productionActivationApproved: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedStagingTarget: false,
    inventedResearcherIdentities: false,
    inventedSecuritySigner: false,
    migrationHoldsChanged: false,
    communityWrites: "DEFERRED",
    dependsOnTrackB: ["B2"],
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/next-b-acceptance.pending.json",
    softLandDocPath: "docs/engineering/NEXT_B_ISOLATION_SOFT_LAND.md",
    honesty: {
      checkFixtureNeverAcceptance: true,
      liveOwnerGatedOnly: true,
      noInventedSigner: true,
      noInventedAccounts: true,
      noHoldRemoval: true,
      fixtureIsNotLiveAcceptance: true,
    },
  };
}

export function nextBSurfaceById(surface: NextBSurfaceId): NextBSurfaceRow {
  switch (surface) {
    case "isolation_suite_cli":
    case "persistence_security_checks":
    case "e2e02_acceptance_packet":
    case "next_b_pending_worksheet":
    case "two_researcher_http_runner":
    case "per_scope_migration_packet":
    case "migration_holds": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing NEXT-B surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown NEXT-B surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessNextBMode(mode: NextBSuiteMode): NextBAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-next-b-assessment-1",
        suiteMode: mode,
        mayClaimAcceptance: false,
        mayEnableLiveExecution: false,
        mayInventSigner: false,
        mayChangeMigrationHolds: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "NEXT-B acceptance stays blocked until owner-run live evidence and B2 exist",
        ],
        scientificApproval: false,
        acceptedForScope: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-next-b-assessment-1",
        suiteMode: mode,
        mayClaimAcceptance: false,
        mayEnableLiveExecution: false,
        mayInventSigner: false,
        mayChangeMigrationHolds: false,
        ciSafe: true,
        reasons: [
          "fixture isolation suite uses synthetic transport only",
          "fixture green is not signed per-scope acceptance or hold removal",
        ],
        scientificApproval: false,
        acceptedForScope: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown NEXT-B suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Isolation-acceptance honesty for NEXT-B soft-land. */
export function assessNextBIsolationHonesty(): NextBIsolationHonesty {
  return {
    schemaVersion: "hsi-next-b-isolation-honesty-1",
    mustKeepCheckFixtureNonAcceptance: true,
    mustRequireTwoResearchersPlusReviewer: true,
    mustKeepScopesSeparatelySigned: true,
    mustKeepHoldsUnchanged: true,
    mustKeepCommunityWritesDeferred: true,
    reasons: [
      "staging:isolation:check/fixture never establish acceptance",
      "Live acceptance needs two researchers plus independent reviewer/security signer",
      "Each activation scope requires its own signed evidence packet",
      "Migration holds stay unchanged until B2 names an independent DB reviewer",
      "communityWrites remain DEFERRED in next-b pending worksheet",
    ],
  };
}

export function assertNextBIsolationSoftLand(
  packet: NextBIsolationPacket,
): {
  surfaceCount: number;
  liveExecutionAuthorized: false;
  migrationHoldsChanged: false;
  acceptedForScope: false;
} {
  if (packet.schemaVersion !== NEXT_B_ISOLATION_SCHEMA) {
    throw new Error("unexpected NEXT-B isolation schema");
  }
  if (packet.backlogId !== "NEXT-B" || packet.priority !== "P0") {
    throw new Error("soft-land must bind NEXT-B at P0");
  }
  if (packet.liveExecutionAuthorized !== false || packet.productionActivationApproved !== false) {
    throw new Error("soft-land must keep live/production activation unauthorized");
  }
  if (packet.acceptedForScope !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim acceptance or signed packet");
  }
  if (packet.migrationHoldsChanged !== false) {
    throw new Error("soft-land must keep migrationHoldsChanged false");
  }
  if (packet.communityWrites !== "DEFERRED") {
    throw new Error("soft-land must keep communityWrites DEFERRED");
  }
  if (
    packet.inventedStagingTarget !== false ||
    packet.inventedResearcherIdentities !== false ||
    packet.inventedSecuritySigner !== false
  ) {
    throw new Error("soft-land must not invent staging target, accounts, or signer");
  }
  if (packet.dependsOnTrackB.length !== 1 || packet.dependsOnTrackB[0] !== "B2") {
    throw new Error("soft-land must depend on Track B2");
  }
  if (packet.scientificApproval !== false) {
    throw new Error("soft-land must not claim scientific approval");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven NEXT-B surfaces");
  for (const surface of packet.surfaces) {
    if (surface.liveExecutionAuthorized !== false || surface.acceptedForScope !== false) {
      throw new Error(`surface ${surface.surface} must keep live/acceptance false`);
    }
    if (surface.signedPacketClaimed !== false) {
      throw new Error(`surface ${surface.surface} must not claim signed packet`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    liveExecutionAuthorized: false,
    migrationHoldsChanged: false,
    acceptedForScope: false,
  };
}
