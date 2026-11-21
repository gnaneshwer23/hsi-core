/**
 * HSI 1.0 — U12 restricted-preview (L1) readiness soft-land.
 *
 * Catalogues engineering-ready preview surfaces vs owner staging-grant evidence.
 * Never invents staging hosts, grants, write enablement, or journey acceptance.
 */

export const HSI_10_RESTRICTED_PREVIEW_READINESS_U12_SCHEMA =
  "hsi-1-0-restricted-preview-readiness-u12-1" as const;

export type Hsi10RestrictedPreviewSurfaceId =
  | "continuous_journey_local_e2e"
  | "ask_live_investigation_honesty"
  | "device_local_save_reopen"
  | "auth_grant_fail_closed"
  | "production_writes_refused"
  | "staging_grant_continuous_run"
  | "owner_preview_go";

export type Hsi10RestrictedPreviewSurfaceRow = {
  surface: Hsi10RestrictedPreviewSurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  restrictedPreviewClaimed: false;
  scientificApproval: false;
  productionWritesEnabled: false;
  checklistItem: 1 | 5 | null;
  pathHints: readonly string[];
  notes: string;
};

export type Hsi10RestrictedPreviewSuiteMode = "check" | "fixture";

export type Hsi10RestrictedPreviewReadinessPacket = {
  schemaVersion: typeof HSI_10_RESTRICTED_PREVIEW_READINESS_U12_SCHEMA;
  purpose: "hsi_1_0_restricted_preview_readiness_u12_soft_land";
  backlogId: "HSI-1.0-RESTRICTED-PREVIEW-READINESS-U12";
  stage: "L1_restricted_preview";
  scientificApproval: false;
  restrictedPreviewClaimed: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  productionWritesEnabled: false;
  inventedStagingUrl: false;
  inventedGrant: false;
  gateCAutoApprove: false;
  ciSafeModes: readonly Hsi10RestrictedPreviewSuiteMode[];
  surfaces: readonly Hsi10RestrictedPreviewSurfaceRow[];
  reuseModules: readonly string[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json";
  softLandDocPath: "docs/engineering/HSI_10_RESTRICTED_PREVIEW_READINESS_U12_SOFT_LAND.md";
  honesty: {
    catalogsExistPreviewBlocked: true;
    noInventedStagingUrl: true;
    noInventedGrant: true;
    noProductionWrites: true;
    noJourneyCompleteClaim: true;
    fixtureIsNotPreviewAcceptance: true;
    localE2eIsNotStagingGrant: true;
  };
};

export type Hsi10RestrictedPreviewAssessment = {
  schemaVersion: "hsi-1-0-restricted-preview-readiness-u12-assessment-1";
  suiteMode: Hsi10RestrictedPreviewSuiteMode;
  mayClaimRestrictedPreview: false;
  mayInventStagingUrl: false;
  mayInventGrant: false;
  mayEnableProductionWrites: false;
  mayClaimChecklist1Verified: false;
  ciSafe: true;
  reasons: string[];
  acceptedForScope: false;
  restrictedPreviewClaimed: false;
};

const SURFACES: readonly Hsi10RestrictedPreviewSurfaceRow[] = [
  {
    surface: "continuous_journey_local_e2e",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    restrictedPreviewClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    checklistItem: 1,
    pathHints: [
      "site/e2e/workspace-continuous-journey.spec.ts",
      "src/operations/hsi10ContinuousJourneyEvidenceSoftLand.ts",
    ],
    notes:
      "Local Playwright continuous Ask→brief→save path is engineering-ready. Not a staging grant run.",
  },
  {
    surface: "ask_live_investigation_honesty",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    restrictedPreviewClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    checklistItem: 1,
    pathHints: [
      "site/e2e/live-investigation.spec.ts",
      "src/server/askHandler.ts",
      "src/server/liveInvestigationHandler.ts",
    ],
    notes:
      "Ask / live-investigation honesty + rate-limit envelopes shipped (U5/U9/U10). Still not owner preview acceptance.",
  },
  {
    surface: "device_local_save_reopen",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    restrictedPreviewClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    checklistItem: 5,
    pathHints: [
      "src/operations/e2e05StagingSaveResume.ts",
      "site/src/lib/useLiveRun.ts",
    ],
    notes:
      "Device-local library remains the default save path while productionWritesEnabled is false.",
  },
  {
    surface: "auth_grant_fail_closed",
    engineeringReady: true,
    ownerEvidenceRequired: true,
    restrictedPreviewClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    checklistItem: null,
    pathHints: [
      "src/server/vercelResearch.ts",
      "src/server/neonAuthGateway.ts",
    ],
    notes:
      "Research APIs fail closed without provider-verified session / grant. Owner must provision real preview grants privately.",
  },
  {
    surface: "production_writes_refused",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    restrictedPreviewClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    checklistItem: 5,
    pathHints: ["src/server/vercelResearch.ts", "src/db/neonGuard.ts"],
    notes:
      "POST research writes stay refused with RESEARCH_WRITES_DISABLED until an authorised staging scope exists.",
  },
  {
    surface: "staging_grant_continuous_run",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    restrictedPreviewClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    checklistItem: 1,
    pathHints: [
      "operations/staging/hsi-10-continuous-journey-evidence.pending.json",
      "docs/engineering/HSI_10_CONTINUOUS_JOURNEY_EVIDENCE_SOFT_LAND.md",
    ],
    notes:
      "Owner must capture a real staging grant continuous journey evidence packet. Soft-land never invents the host or grant.",
  },
  {
    surface: "owner_preview_go",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    restrictedPreviewClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    checklistItem: null,
    pathHints: [
      "operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json",
      "docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md",
      "src/hsiLiveScientificPlatformRuntime.ts",
    ],
    notes:
      "U37 authorized L1 engineering composition only. Restricted-preview GO remains owner-only after real staging grant evidence. Soft-land never invents the decision.",
  },
];

const REUSE_MODULES: readonly string[] = [
  "src/operations/hsi10ContinuousJourneyEvidenceSoftLand.ts",
  "src/operations/hsi10OwnerPacketsScaffold.ts",
  "src/operations/hsi10PublicLaunchReadinessU11SoftLand.ts",
  "src/hsiLiveScientificPlatformRuntime.ts",
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Approve a disposable HSI staging target privately — never invent hosts in git.",
  "Provision a real research-preview grant and capture continuous Ask→brief→device-local save evidence.",
  "Keep productionWritesEnabled false on public production; durable staging save only after Human #5.",
  "Record restricted-preview GO or NO-GO privately after staging evidence exists — U37 engineering authorization is not preview GO.",
];

export function hsi10RestrictedPreviewReadinessU12Packet(): Hsi10RestrictedPreviewReadinessPacket {
  return {
    schemaVersion: HSI_10_RESTRICTED_PREVIEW_READINESS_U12_SCHEMA,
    purpose: "hsi_1_0_restricted_preview_readiness_u12_soft_land",
    backlogId: "HSI-1.0-RESTRICTED-PREVIEW-READINESS-U12",
    stage: "L1_restricted_preview",
    scientificApproval: false,
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    productionWritesEnabled: false,
    inventedStagingUrl: false,
    inventedGrant: false,
    gateCAutoApprove: false,
    ciSafeModes: ["check", "fixture"],
    surfaces: SURFACES,
    reuseModules: REUSE_MODULES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath:
      "operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json",
    softLandDocPath:
      "docs/engineering/HSI_10_RESTRICTED_PREVIEW_READINESS_U12_SOFT_LAND.md",
    honesty: {
      catalogsExistPreviewBlocked: true,
      noInventedStagingUrl: true,
      noInventedGrant: true,
      noProductionWrites: true,
      noJourneyCompleteClaim: true,
      fixtureIsNotPreviewAcceptance: true,
      localE2eIsNotStagingGrant: true,
    },
  };
}

export function hsi10RestrictedPreviewSurfaceById(
  surface: Hsi10RestrictedPreviewSurfaceId,
): Hsi10RestrictedPreviewSurfaceRow {
  switch (surface) {
    case "continuous_journey_local_e2e":
    case "ask_live_investigation_honesty":
    case "device_local_save_reopen":
    case "auth_grant_fail_closed":
    case "production_writes_refused":
    case "staging_grant_continuous_run":
    case "owner_preview_go": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing U12 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown U12 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessHsi10RestrictedPreviewReadinessU12Mode(
  mode: Hsi10RestrictedPreviewSuiteMode,
): Hsi10RestrictedPreviewAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-1-0-restricted-preview-readiness-u12-assessment-1",
        suiteMode: mode,
        mayClaimRestrictedPreview: false,
        mayInventStagingUrl: false,
        mayInventGrant: false,
        mayEnableProductionWrites: false,
        mayClaimChecklist1Verified: false,
        ciSafe: true,
        reasons: [
          "check mode validates L1 readiness honesty only",
          "staging grant continuous run remains owner-gated",
          "local e2e is not staging grant evidence",
        ],
        acceptedForScope: false,
        restrictedPreviewClaimed: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-1-0-restricted-preview-readiness-u12-assessment-1",
        suiteMode: mode,
        mayClaimRestrictedPreview: false,
        mayInventStagingUrl: false,
        mayInventGrant: false,
        mayEnableProductionWrites: false,
        mayClaimChecklist1Verified: false,
        ciSafe: true,
        reasons: [
          "fixture green reuses continuous-journey soft-land tests only",
          "fixture green is not restricted-preview GO",
        ],
        acceptedForScope: false,
        restrictedPreviewClaimed: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown U12 suite mode: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsi10RestrictedPreviewReadinessU12SoftLand(
  packet: Hsi10RestrictedPreviewReadinessPacket,
): {
  surfaceCount: number;
  restrictedPreviewClaimed: false;
  productionWritesEnabled: false;
  inventedStagingUrl: false;
  acceptedForScope: false;
} {
  if (packet.schemaVersion !== HSI_10_RESTRICTED_PREVIEW_READINESS_U12_SCHEMA) {
    throw new Error("unexpected U12 restricted-preview schema");
  }
  if (packet.backlogId !== "HSI-1.0-RESTRICTED-PREVIEW-READINESS-U12") {
    throw new Error("soft-land must bind HSI-1.0-RESTRICTED-PREVIEW-READINESS-U12");
  }
  if (packet.stage !== "L1_restricted_preview") {
    throw new Error("U12 must bind L1_restricted_preview stage");
  }
  if (
    packet.restrictedPreviewClaimed !== false ||
    packet.acceptedForScope !== false ||
    packet.signedPacketClaimed !== false ||
    packet.scientificApproval !== false
  ) {
    throw new Error("soft-land must keep preview and acceptance claims false");
  }
  if (
    packet.productionWritesEnabled !== false ||
    packet.inventedStagingUrl !== false ||
    packet.inventedGrant !== false ||
    packet.gateCAutoApprove !== false
  ) {
    throw new Error("soft-land must not invent grants, hosts, writes, or Gate C auto-approve");
  }
  if (packet.surfaces.length !== 7) {
    throw new Error("expected seven U12 surfaces");
  }
  const go = packet.surfaces.find((s) => s.surface === "owner_preview_go");
  if (!go || go.engineeringReady !== false || go.ownerEvidenceRequired !== true) {
    throw new Error("owner preview GO must stay owner-gated");
  }
  const staging = packet.surfaces.find((s) => s.surface === "staging_grant_continuous_run");
  if (!staging || staging.engineeringReady !== false) {
    throw new Error("staging grant continuous run must stay owner-gated");
  }
  return {
    surfaceCount: packet.surfaces.length,
    restrictedPreviewClaimed: false,
    productionWritesEnabled: false,
    inventedStagingUrl: false,
    acceptedForScope: false,
  };
}
