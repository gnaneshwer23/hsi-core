/**
 * HSI 1.0 — continuous journey evidence soft-land (acceptance checklist #1).
 *
 * Catalogues CI-safe local e2e proof vs owner staging grant evidence.
 * Never invents staging URLs, never enables production writes, never claims
 * checklist #1 verified.
 */

export const HSI_10_CONTINUOUS_JOURNEY_EVIDENCE_SCHEMA =
  "hsi-1-0-continuous-journey-evidence-1" as const;

export type Hsi10ContinuousJourneySurfaceId =
  | "local_playwright_continuous"
  | "local_live_investigation"
  | "device_local_save_reopen"
  | "staging_grant_run"
  | "production_writes";

export type Hsi10ContinuousJourneySurfaceRow = {
  surface: Hsi10ContinuousJourneySurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  productionAllowed: false;
  acceptedForScope: false;
  checklistItem: 1 | 5;
  notes: string;
  pathHints: readonly string[];
};

export type Hsi10ContinuousJourneySuiteMode = "check" | "fixture";

export type Hsi10ContinuousJourneyEvidencePacket = {
  schemaVersion: typeof HSI_10_CONTINUOUS_JOURNEY_EVIDENCE_SCHEMA;
  purpose: "hsi_1_0_continuous_journey_evidence_soft_land";
  backlogId: "HSI-1.0-CONTINUOUS-JOURNEY-EVIDENCE";
  checklistItems: readonly [1, 5];
  scientificApproval: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  productionWritesEnabled: false;
  journeyCompleteClaimed: false;
  inventedStagingUrl: false;
  gateCAutoApprove: false;
  ciSafeModes: readonly Hsi10ContinuousJourneySuiteMode[];
  surfaces: readonly Hsi10ContinuousJourneySurfaceRow[];
  reuseModules: readonly string[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/hsi-10-continuous-journey-evidence.pending.json";
  softLandDocPath: "docs/engineering/HSI_10_CONTINUOUS_JOURNEY_EVIDENCE_SOFT_LAND.md";
  acceptanceStatusDocPath: "docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md";
  honesty: {
    catalogsExistAcceptanceBlocked: true;
    noInventedStagingUrl: true;
    noProductionWrites: true;
    noJourneyCompleteClaim: true;
    fixtureIsNotOwnerAcceptance: true;
    localE2eIsNotStagingGrant: true;
  };
};

export type Hsi10ContinuousJourneyAssessment = {
  schemaVersion: "hsi-1-0-continuous-journey-assessment-1";
  suiteMode: Hsi10ContinuousJourneySuiteMode;
  mayClaimChecklist1Verified: false;
  mayClaimChecklist5Verified: false;
  mayEnableProductionWrites: false;
  mayInventStagingUrl: false;
  ciSafe: true;
  reasons: string[];
  acceptedForScope: false;
};

const SURFACES: readonly Hsi10ContinuousJourneySurfaceRow[] = [
  {
    surface: "local_playwright_continuous",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    productionAllowed: false,
    acceptedForScope: false,
    checklistItem: 1,
    notes:
      "site/e2e/workspace-continuous-journey.spec.ts proves Ask→…→Save without gaps/ledger hops in CI. Not a staging grant run.",
    pathHints: [
      "site/e2e/workspace-continuous-journey.spec.ts",
      "src/investigation/workspaceTrailNavigation.ts",
      "docs/engineering/WORKSPACE_CONTINUOUS_TRAIL.md",
    ],
  },
  {
    surface: "local_live_investigation",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    productionAllowed: false,
    acceptedForScope: false,
    checklistItem: 1,
    notes:
      "live-investigation.spec.ts covers honesty, passport empty-state, brief limitations. Still not owner acceptance.",
    pathHints: ["site/e2e/live-investigation.spec.ts"],
  },
  {
    surface: "device_local_save_reopen",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    productionAllowed: false,
    acceptedForScope: false,
    checklistItem: 5,
    notes:
      "Browser library save/reopen works with productionWritesEnabled=false. Durable staging path remains owner-gated (E2E-05).",
    pathHints: [
      "site/src/lib/useLiveRun.ts",
      "src/operations/e2e05StagingSaveResume.ts",
      "operations/staging/e2e-05-staging-save-resume.pending.json",
    ],
  },
  {
    surface: "staging_grant_run",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    productionAllowed: false,
    acceptedForScope: false,
    checklistItem: 1,
    notes:
      "Owner must capture a real staging grant continuous Ask→brief→save evidence packet. Soft-land never invents the host or grant.",
    pathHints: [
      "operations/staging/hsi-10-continuous-journey-evidence.pending.json",
      "docs/engineering/HSI_1_0_OWNER_GATES_WORKSHEET_2026-11-20.md",
    ],
  },
  {
    surface: "production_writes",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    productionAllowed: false,
    acceptedForScope: false,
    checklistItem: 5,
    notes: "Always refused here. Human #5 write packet required before any durable production path.",
    pathHints: ["src/db/neonGuard.ts", "src/db/migrationHolds.ts"],
  },
];

const REUSE_MODULES: readonly string[] = [
  "site/e2e/workspace-continuous-journey.spec.ts",
  "src/investigation/unifiedJourneyTrail.ts",
  "src/operations/e2e05StagingSaveResume.ts",
  "src/operations/hsi10OwnerGatesWorksheet.ts",
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Approve a disposable HSI staging target privately — never invent hosts in git.",
  "Run continuous Ask→passport→compare→brief→device-local save under a real grant.",
  "Retain redacted evidence digests + failure inventory for checklist #1.",
  "Reuse E2E-05 owner packet for durable staging save only after Human #5.",
  "Do not set production writesEnabled=true from this soft-land.",
];

export function hsi10ContinuousJourneyEvidencePacket(): Hsi10ContinuousJourneyEvidencePacket {
  return {
    schemaVersion: HSI_10_CONTINUOUS_JOURNEY_EVIDENCE_SCHEMA,
    purpose: "hsi_1_0_continuous_journey_evidence_soft_land",
    backlogId: "HSI-1.0-CONTINUOUS-JOURNEY-EVIDENCE",
    checklistItems: [1, 5],
    scientificApproval: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    productionWritesEnabled: false,
    journeyCompleteClaimed: false,
    inventedStagingUrl: false,
    gateCAutoApprove: false,
    ciSafeModes: ["check", "fixture"],
    surfaces: SURFACES,
    reuseModules: REUSE_MODULES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath:
      "operations/staging/hsi-10-continuous-journey-evidence.pending.json",
    softLandDocPath:
      "docs/engineering/HSI_10_CONTINUOUS_JOURNEY_EVIDENCE_SOFT_LAND.md",
    acceptanceStatusDocPath:
      "docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md",
    honesty: {
      catalogsExistAcceptanceBlocked: true,
      noInventedStagingUrl: true,
      noProductionWrites: true,
      noJourneyCompleteClaim: true,
      fixtureIsNotOwnerAcceptance: true,
      localE2eIsNotStagingGrant: true,
    },
  };
}

export function hsi10ContinuousJourneySurfaceById(
  surface: Hsi10ContinuousJourneySurfaceId,
): Hsi10ContinuousJourneySurfaceRow {
  switch (surface) {
    case "local_playwright_continuous":
    case "local_live_investigation":
    case "device_local_save_reopen":
    case "staging_grant_run":
    case "production_writes": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing continuous-journey surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown continuous-journey surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessHsi10ContinuousJourneyMode(
  mode: Hsi10ContinuousJourneySuiteMode,
): Hsi10ContinuousJourneyAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-1-0-continuous-journey-assessment-1",
        suiteMode: mode,
        mayClaimChecklist1Verified: false,
        mayClaimChecklist5Verified: false,
        mayEnableProductionWrites: false,
        mayInventStagingUrl: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "checklist #1 verified requires owner staging grant evidence",
        ],
        acceptedForScope: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-1-0-continuous-journey-assessment-1",
        suiteMode: mode,
        mayClaimChecklist1Verified: false,
        mayClaimChecklist5Verified: false,
        mayEnableProductionWrites: false,
        mayInventStagingUrl: false,
        ciSafe: true,
        reasons: [
          "fixture / local Playwright green is not staging grant acceptance",
          "device-local save is not Neon durable reopen",
        ],
        acceptedForScope: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown suite mode: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsi10ContinuousJourneyEvidenceSoftLand(
  packet: Hsi10ContinuousJourneyEvidencePacket = hsi10ContinuousJourneyEvidencePacket(),
): {
  surfaceCount: number;
  productionWritesEnabled: false;
  acceptedForScope: false;
  journeyCompleteClaimed: false;
} {
  if (packet.productionWritesEnabled !== false) {
    throw new Error("productionWritesEnabled must be false");
  }
  if (packet.acceptedForScope !== false) {
    throw new Error("acceptedForScope must be false");
  }
  if (packet.journeyCompleteClaimed !== false) {
    throw new Error("journeyCompleteClaimed must be false");
  }
  if (packet.inventedStagingUrl !== false) {
    throw new Error("inventedStagingUrl must be false");
  }
  if (packet.surfaces.length !== 5) {
    throw new Error("expected five continuous-journey surfaces");
  }
  for (const row of packet.surfaces) {
    if (row.productionAllowed !== false || row.acceptedForScope !== false) {
      throw new Error(`surface ${row.surface} must refuse production and acceptance`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    productionWritesEnabled: false,
    acceptedForScope: false,
    journeyCompleteClaimed: false,
  };
}
