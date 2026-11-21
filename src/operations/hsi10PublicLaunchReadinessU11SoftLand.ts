/**
 * HSI 1.0 — U11 public launch (L0) readiness soft-land.
 *
 * Catalogues engineering-ready public surfaces vs owner GO/NO-GO.
 * Never invents visual acceptance, scientific approval, or write enablement.
 */

export const HSI_10_PUBLIC_LAUNCH_READINESS_U11_SCHEMA =
  "hsi-1-0-public-launch-readiness-u11-1" as const;

export type Hsi10PublicLaunchSurfaceId =
  | "public_qa_packet"
  | "demo_universe_synthetic"
  | "landing_honesty_labels"
  | "production_probe_writes_false"
  | "premortem_non_gate"
  | "owner_visual_acceptance"
  | "owner_public_launch_go";

export type Hsi10PublicLaunchSurfaceRow = {
  surface: Hsi10PublicLaunchSurfaceId;
  engineeringReady: boolean;
  ownerSignOffRequired: boolean;
  publicLaunchClaimed: false;
  scientificApproval: false;
  productionWritesEnabled: false;
  pathHints: readonly string[];
  notes: string;
};

export type Hsi10PublicLaunchSuiteMode = "check" | "fixture";

export type Hsi10PublicLaunchReadinessPacket = {
  schemaVersion: typeof HSI_10_PUBLIC_LAUNCH_READINESS_U11_SCHEMA;
  purpose: "hsi_1_0_public_launch_readiness_u11_soft_land";
  backlogId: "HSI-1.0-PUBLIC-LAUNCH-READINESS-U11";
  stage: "L0_public";
  scientificApproval: false;
  publicLaunchClaimed: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  productionWritesEnabled: false;
  premortemIsReleaseGate: false;
  inventedOwnerGo: false;
  ciSafeModes: readonly Hsi10PublicLaunchSuiteMode[];
  surfaces: readonly Hsi10PublicLaunchSurfaceRow[];
  reuseModules: readonly string[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/hsi-10-public-launch-readiness-u11.pending.json";
  softLandDocPath: "docs/engineering/HSI_10_PUBLIC_LAUNCH_READINESS_U11_SOFT_LAND.md";
  qaPacketPath: "docs/qa/HSI_PUBLIC_LAUNCH_QA_PACKET_2026-11-21.md";
  honesty: {
    catalogsExistLaunchBlocked: true;
    noInventedOwnerGo: true;
    noScientificApproval: true;
    noProductionWrites: true;
    premortemNotAGate: true;
    fixtureIsNotPublicLaunch: true;
  };
};

export type Hsi10PublicLaunchAssessment = {
  schemaVersion: "hsi-1-0-public-launch-readiness-u11-assessment-1";
  suiteMode: Hsi10PublicLaunchSuiteMode;
  mayClaimPublicLaunch: false;
  mayInventOwnerGo: false;
  mayEnableProductionWrites: false;
  mayTreatPremortemAsGate: false;
  ciSafe: true;
  reasons: string[];
  acceptedForScope: false;
  publicLaunchClaimed: false;
};

const SURFACES: readonly Hsi10PublicLaunchSurfaceRow[] = [
  {
    surface: "public_qa_packet",
    engineeringReady: true,
    ownerSignOffRequired: true,
    publicLaunchClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: [
      "docs/qa/HSI_PUBLIC_LAUNCH_QA_PACKET_2026-11-21.md",
      "docs/qa/evidence/prod-2026-11-21/",
    ],
    notes:
      "Dated QA packet + evidence folder exist. Owner visual acceptance and GO/NO-GO remain UNASSIGNED.",
  },
  {
    surface: "demo_universe_synthetic",
    engineeringReady: true,
    ownerSignOffRequired: false,
    publicLaunchClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: [
      "site/e2e/demo-universe-landing.spec.ts",
      "test/demoUniverseIntegrity.test.ts",
    ],
    notes:
      "Synthetic Demo Universe is public-ready as demonstration data with write-false honesty.",
  },
  {
    surface: "landing_honesty_labels",
    engineeringReady: true,
    ownerSignOffRequired: false,
    publicLaunchClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: [
      "site/e2e/landing-pages.spec.ts",
      "site/e2e/seo.spec.ts",
    ],
    notes:
      "Landing / SEO e2e assert research-preview honesty. Not scientific GO.",
  },
  {
    surface: "production_probe_writes_false",
    engineeringReady: true,
    ownerSignOffRequired: false,
    publicLaunchClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: ["src/server/healthHandler.ts", "src/db/neonGuard.ts"],
    notes:
      "Production probe / health keep writesEnabled false. Soft-land never flips that.",
  },
  {
    surface: "premortem_non_gate",
    engineeringReady: true,
    ownerSignOffRequired: false,
    publicLaunchClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: [
      "docs/production/HSI_RELEASE_GATES.md",
      "docs/plans/HSI_PRODUCTION_READINESS_PHASE_2026-11-21.md",
    ],
    notes:
      "Business pre-mortem is strategy-only and must not block L0 public launch.",
  },
  {
    surface: "owner_visual_acceptance",
    engineeringReady: true,
    ownerSignOffRequired: true,
    publicLaunchClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: [
      "docs/qa/HSI_PUBLIC_LAUNCH_QA_PACKET_2026-11-21.md",
      "src/hsiOwnerDeployAuthorizations.ts",
    ],
    notes:
      "Owner visual acceptance recorded 21 Nov 2026 (U36). Still not a scientific-approval claim.",
  },
  {
    surface: "owner_public_launch_go",
    engineeringReady: true,
    ownerSignOffRequired: true,
    publicLaunchClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: [
      "src/hsiOwnerDeployAuthorizations.ts",
      "docs/engineering/HSI_U36_PUBLIC_CLINICAL_OWNER_APPROVALS_2026-11-21.md",
      "docs/qa/HSI_PUBLIC_LAUNCH_QA_PACKET_2026-11-21.md",
    ],
    notes:
      "Owner L0 public launch GO recorded 21 Nov 2026 (U36). Research writes and PHI remain false; not an unrestricted scientific GA claim.",
  },
];

const REUSE_MODULES: readonly string[] = [
  "docs/qa/HSI_PUBLIC_LAUNCH_QA_PACKET_2026-11-21.md",
  "src/operations/hsi10OwnerPacketsScaffold.ts",
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "L0 visual acceptance + public launch GO recorded via U36 HSI_PUBLIC_L0_DEPLOY_APPROVAL (21 Nov 2026).",
  "Keep scientific approval and production research writes false for L0 public launch.",
  "Do not treat business pre-mortem completion as a technical release blocker.",
  "Do not enable real PHI / clinical activity — ADR-0010 gates remain open.",
];

export function hsi10PublicLaunchReadinessU11Packet(): Hsi10PublicLaunchReadinessPacket {
  return {
    schemaVersion: HSI_10_PUBLIC_LAUNCH_READINESS_U11_SCHEMA,
    purpose: "hsi_1_0_public_launch_readiness_u11_soft_land",
    backlogId: "HSI-1.0-PUBLIC-LAUNCH-READINESS-U11",
    stage: "L0_public",
    scientificApproval: false,
    publicLaunchClaimed: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    productionWritesEnabled: false,
    premortemIsReleaseGate: false,
    inventedOwnerGo: false,
    ciSafeModes: ["check", "fixture"],
    surfaces: SURFACES,
    reuseModules: REUSE_MODULES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath:
      "operations/staging/hsi-10-public-launch-readiness-u11.pending.json",
    softLandDocPath: "docs/engineering/HSI_10_PUBLIC_LAUNCH_READINESS_U11_SOFT_LAND.md",
    qaPacketPath: "docs/qa/HSI_PUBLIC_LAUNCH_QA_PACKET_2026-11-21.md",
    honesty: {
      catalogsExistLaunchBlocked: true,
      noInventedOwnerGo: true,
      noScientificApproval: true,
      noProductionWrites: true,
      premortemNotAGate: true,
      fixtureIsNotPublicLaunch: true,
    },
  };
}

export function hsi10PublicLaunchSurfaceById(
  surface: Hsi10PublicLaunchSurfaceId,
): Hsi10PublicLaunchSurfaceRow {
  switch (surface) {
    case "public_qa_packet":
    case "demo_universe_synthetic":
    case "landing_honesty_labels":
    case "production_probe_writes_false":
    case "premortem_non_gate":
    case "owner_visual_acceptance":
    case "owner_public_launch_go": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing U11 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown U11 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessHsi10PublicLaunchReadinessU11Mode(
  mode: Hsi10PublicLaunchSuiteMode,
): Hsi10PublicLaunchAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-1-0-public-launch-readiness-u11-assessment-1",
        suiteMode: mode,
        mayClaimPublicLaunch: false,
        mayInventOwnerGo: false,
        mayEnableProductionWrites: false,
        mayTreatPremortemAsGate: false,
        ciSafe: true,
        reasons: [
          "check mode validates L0 readiness honesty only",
          "owner visual acceptance and GO/NO-GO remain required",
          "premortem is not a technical release gate",
        ],
        acceptedForScope: false,
        publicLaunchClaimed: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-1-0-public-launch-readiness-u11-assessment-1",
        suiteMode: mode,
        mayClaimPublicLaunch: false,
        mayInventOwnerGo: false,
        mayEnableProductionWrites: false,
        mayTreatPremortemAsGate: false,
        ciSafe: true,
        reasons: [
          "fixture green reuses QA packet paths and soft-land tests only",
          "fixture green is not public launch GO",
        ],
        acceptedForScope: false,
        publicLaunchClaimed: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown U11 suite mode: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsi10PublicLaunchReadinessU11SoftLand(
  packet: Hsi10PublicLaunchReadinessPacket,
): {
  surfaceCount: number;
  publicLaunchClaimed: false;
  productionWritesEnabled: false;
  premortemIsReleaseGate: false;
  acceptedForScope: false;
} {
  if (packet.schemaVersion !== HSI_10_PUBLIC_LAUNCH_READINESS_U11_SCHEMA) {
    throw new Error("unexpected U11 public-launch schema");
  }
  if (packet.backlogId !== "HSI-1.0-PUBLIC-LAUNCH-READINESS-U11") {
    throw new Error("soft-land must bind HSI-1.0-PUBLIC-LAUNCH-READINESS-U11");
  }
  if (packet.stage !== "L0_public") {
    throw new Error("U11 must bind L0_public stage");
  }
  if (
    packet.publicLaunchClaimed !== false ||
    packet.acceptedForScope !== false ||
    packet.signedPacketClaimed !== false ||
    packet.scientificApproval !== false
  ) {
    throw new Error("soft-land must keep launch and acceptance claims false");
  }
  if (packet.productionWritesEnabled !== false || packet.inventedOwnerGo !== false) {
    throw new Error("soft-land must not enable writes or invent owner GO");
  }
  if (packet.premortemIsReleaseGate !== false) {
    throw new Error("soft-land must keep premortemIsReleaseGate false");
  }
  if (packet.surfaces.length !== 7) {
    throw new Error("expected seven U11 surfaces");
  }
  const go = packet.surfaces.find((s) => s.surface === "owner_public_launch_go");
  if (!go || go.ownerSignOffRequired !== true || go.publicLaunchClaimed !== false) {
    throw new Error("owner public launch GO must remain owner-signed and non-GA");
  }
  // U36 may mark engineeringReady true once the explicit owner L0 GO envelope exists.
  if (go.engineeringReady !== true && go.engineeringReady !== false) {
    throw new Error("owner public launch GO engineeringReady must be boolean");
  }
  return {
    surfaceCount: packet.surfaces.length,
    publicLaunchClaimed: false,
    productionWritesEnabled: false,
    premortemIsReleaseGate: false,
    acceptedForScope: false,
  };
}
