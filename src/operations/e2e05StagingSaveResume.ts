/**
 * PR-E2E-05 — staging investigation save/resume soft-land.
 *
 * Catalogues fail-closed gates for owned investigation persistence. Never
 * enables production writes, never removes migration holds, never invents
 * staging URLs or signed acceptance.
 */

export const E2E_05_SAVE_RESUME_SCHEMA = "hsi-e2e-05-staging-save-resume-1" as const;

export type E2e05SuiteMode = "check" | "fixture";

export type E2e05PersistencePathId =
  | "device_local_default"
  | "graph_workspace_server"
  | "investigation_compose"
  | "dashboard_owned_list"
  | "production_writes";

export type E2e05PersistencePathRow = {
  path: E2e05PersistencePathId;
  defaultEnabled: boolean;
  stagingOwnerGated: boolean;
  productionAllowed: false;
  holdsUnchanged: true;
  acceptedForScope: false;
  notes: string;
  pathHints: readonly string[];
};

export type E2e05StagingSaveResumePacket = {
  schemaVersion: typeof E2E_05_SAVE_RESUME_SCHEMA;
  purpose: "pr_e2e_05_staging_save_resume_soft_land";
  backlogId: "PR-E2E-05";
  scientificApproval: false;
  liveExecutionAuthorized: false;
  productionWritesEnabled: false;
  productionActivationApproved: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  migrationHoldsChanged: false;
  communityWrites: "DEFERRED";
  ciSafeModes: readonly E2e05SuiteMode[];
  reuseModules: readonly string[];
  paths: readonly E2e05PersistencePathRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/e2e-05-staging-save-resume.pending.json";
  softLandDocPath: "docs/engineering/E2E_05_STAGING_SAVE_RESUME_SOFT_LAND.md";
  graphWorkspaceRunbookPath: "docs/engineering/GRAPH_WORKSPACE_FLAG_RUNBOOK.md";
  honesty: {
    noInventedSigner: true;
    noInventedStagingUrl: true;
    noHoldRemoval: true;
    noProductionWrites: true;
    fixtureIsNotLivePersistence: true;
  };
};

export type E2e05SaveResumeAssessment = {
  schemaVersion: "hsi-e2e-05-assessment-1";
  suiteMode: E2e05SuiteMode;
  mayClaimAcceptance: false;
  mayEnableProductionWrites: false;
  mayClaimLiveOwnedList: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  acceptedForScope: false;
};

const PATHS: readonly E2e05PersistencePathRow[] = [
  {
    path: "device_local_default",
    defaultEnabled: true,
    stagingOwnerGated: false,
    productionAllowed: false,
    holdsUnchanged: true,
    acceptedForScope: false,
    notes: "Default save path remains device-local localStorage until staging flags are owner-set.",
    pathHints: ["site/src/lib/graphWorkspaceClient.ts", "src/knowledgeGraph/investigationStore.ts"],
  },
  {
    path: "graph_workspace_server",
    defaultEnabled: false,
    stagingOwnerGated: true,
    productionAllowed: false,
    holdsUnchanged: true,
    acceptedForScope: false,
    notes: "HSI_GRAPH_WORKSPACE_STORE_ENABLED + staging writes pins; migrations 031–033 stay held in repo.",
    pathHints: [
      "src/db/graphWorkspaceWriteGate.ts",
      "src/db/graphWorkspaceStore.ts",
      "src/server/graphWorkspaceApi.ts",
    ],
  },
  {
    path: "investigation_compose",
    defaultEnabled: false,
    stagingOwnerGated: true,
    productionAllowed: false,
    holdsUnchanged: true,
    acceptedForScope: false,
    notes: "composeSavedInvestigation digests chain; server compose only behind the graph-workspace gate.",
    pathHints: ["src/knowledgeGraph/investigationStore.ts"],
  },
  {
    path: "dashboard_owned_list",
    defaultEnabled: false,
    stagingOwnerGated: true,
    productionAllowed: false,
    holdsUnchanged: true,
    acceptedForScope: false,
    notes: "Owned investigations list for granted users requires staging persistence + grant gate honesty.",
    pathHints: ["site/src/pages/ResearchDashboard.tsx", "site/src/lib/dashboardAccessState.ts"],
  },
  {
    path: "production_writes",
    defaultEnabled: false,
    stagingOwnerGated: false,
    productionAllowed: false,
    holdsUnchanged: true,
    acceptedForScope: false,
    notes: "Production writesEnabled stays false; soft-land never flips it.",
    pathHints: ["src/db/neonGuard.ts", "docs/engineering/STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md"],
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Apply held graph-workspace migrations 031–033 only on disposable/staging HSI Neon out-of-band (holds unchanged in git).",
  "Enable staging research writes pins (branch/host) — never production host.",
  "Set HSI_GRAPH_WORKSPACE_STORE_ENABLED=true only on that staging deployment.",
  "Confirm /api/research/graph-workspace/status reports enabled:true, path:server, acceptedForScope:false.",
  "Exercise save → list → resume as a granted researcher; confirm cross-tenant denial.",
  "Unset flag and tear down disposable pins; production writes remain disabled.",
];

const REUSE_MODULES: readonly string[] = [
  "src/db/graphWorkspaceWriteGate.ts",
  "src/db/graphWorkspaceStore.ts",
  "src/knowledgeGraph/investigationStore.ts",
  "src/server/graphWorkspaceApi.ts",
  "site/src/lib/dashboardAccessState.ts",
];

export function e2e05StagingSaveResumePacket(): E2e05StagingSaveResumePacket {
  return {
    schemaVersion: E2E_05_SAVE_RESUME_SCHEMA,
    purpose: "pr_e2e_05_staging_save_resume_soft_land",
    backlogId: "PR-E2E-05",
    scientificApproval: false,
    liveExecutionAuthorized: false,
    productionWritesEnabled: false,
    productionActivationApproved: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    migrationHoldsChanged: false,
    communityWrites: "DEFERRED",
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    paths: PATHS,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/e2e-05-staging-save-resume.pending.json",
    softLandDocPath: "docs/engineering/E2E_05_STAGING_SAVE_RESUME_SOFT_LAND.md",
    graphWorkspaceRunbookPath: "docs/engineering/GRAPH_WORKSPACE_FLAG_RUNBOOK.md",
    honesty: {
      noInventedSigner: true,
      noInventedStagingUrl: true,
      noHoldRemoval: true,
      noProductionWrites: true,
      fixtureIsNotLivePersistence: true,
    },
  };
}

export function e2e05PersistencePathById(path: E2e05PersistencePathId): E2e05PersistencePathRow {
  switch (path) {
    case "device_local_default":
    case "graph_workspace_server":
    case "investigation_compose":
    case "dashboard_owned_list":
    case "production_writes": {
      const row = PATHS.find((p) => p.path === path);
      if (!row) throw new Error(`Missing save/resume path row: ${path}`);
      return row;
    }
    default: {
      const _exhaustive: never = path;
      throw new Error(`Unknown save/resume path: ${String(_exhaustive)}`);
    }
  }
}

export function assessE2e05SaveResumeMode(mode: E2e05SuiteMode): E2e05SaveResumeAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-e2e-05-assessment-1",
        suiteMode: mode,
        mayClaimAcceptance: false,
        mayEnableProductionWrites: false,
        mayClaimLiveOwnedList: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog and fail-closed gate honesty only",
          "owned staging list requires owner-gated flags outside this soft-land",
        ],
        scientificApproval: false,
        acceptedForScope: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-e2e-05-assessment-1",
        suiteMode: mode,
        mayClaimAcceptance: false,
        mayEnableProductionWrites: false,
        mayClaimLiveOwnedList: false,
        ciSafe: true,
        reasons: [
          "fixture unit samples (e.g. assessGraphWorkspaceGateSamples) are not live persistence",
          "production writes remain disabled",
        ],
        scientificApproval: false,
        acceptedForScope: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown save/resume suite mode: ${String(_exhaustive)}`);
    }
  }
}

export function assertE2e05StagingSaveResumeSoftLand(
  packet: E2e05StagingSaveResumePacket,
): {
  pathCount: number;
  productionWritesEnabled: false;
  acceptedForScope: false;
  migrationHoldsChanged: false;
} {
  if (packet.schemaVersion !== E2E_05_SAVE_RESUME_SCHEMA) {
    throw new Error("unexpected e2e-05 save/resume schema");
  }
  if (packet.productionWritesEnabled !== false) {
    throw new Error("soft-land must keep productionWritesEnabled false");
  }
  if (packet.acceptedForScope !== false) throw new Error("soft-land must keep acceptedForScope false");
  if (packet.signedPacketClaimed !== false) throw new Error("soft-land must not claim signed packet");
  if (packet.migrationHoldsChanged !== false) throw new Error("soft-land must not change holds");
  if (packet.scientificApproval !== false) throw new Error("soft-land must not claim scientific approval");
  if (packet.liveExecutionAuthorized !== false) throw new Error("soft-land must not authorize live");
  if (packet.productionActivationApproved !== false) {
    throw new Error("soft-land must not approve production activation");
  }
  if (packet.paths.length !== 5) throw new Error("expected five persistence paths");
  for (const path of packet.paths) {
    if (path.productionAllowed !== false) {
      throw new Error(`path ${path.path} must refuse production`);
    }
    if (path.acceptedForScope !== false) throw new Error(`path ${path.path} must stay unaccepted`);
    if (path.holdsUnchanged !== true) throw new Error(`path ${path.path} must leave holds unchanged`);
  }
  return {
    pathCount: packet.paths.length,
    productionWritesEnabled: false,
    acceptedForScope: false,
    migrationHoldsChanged: false,
  };
}
