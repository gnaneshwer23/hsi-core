/**
 * U46 — P0 staging acceptance orchestration soft-land catalog.
 */

export const HSI_STAGING_ACCEPTANCE_ORCHESTRATION_SOFT_LAND_SCHEMA =
  "hsi-staging-acceptance-orchestration-soft-land-1" as const;

export type HsiStagingAcceptanceOrchestrationSurfaceId =
  | "check_honesty"
  | "fixture_u40_probe"
  | "dry_apply_u43"
  | "live_staging_grant"
  | "preview_go_claim"
  | "checklist_1_verified_claim"
  | "invented_host_grant";

export type HsiStagingAcceptanceOrchestrationSurfaceRow = {
  surface: HsiStagingAcceptanceOrchestrationSurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  scientificApproval: false;
  notes: string;
};

export type HsiStagingAcceptanceOrchestrationSoftLandPacket = {
  schemaVersion: typeof HSI_STAGING_ACCEPTANCE_ORCHESTRATION_SOFT_LAND_SCHEMA;
  purpose: "hsi_staging_acceptance_orchestration_u46";
  backlogId: "HSI-U46-STAGING-ACCEPTANCE-ORCHESTRATION";
  fillsSoftLand: readonly ["U12", "U40", "U43", "HSI-1.0-CONTINUOUS-JOURNEY-EVIDENCE"];
  scientificApproval: false;
  restrictedPreviewClaimed: false;
  checklist1Verified: false;
  acceptedForScope: false;
  productionWritesEnabled: false;
  inventedStagingUrl: false;
  inventedGrant: false;
  surfaces: readonly HsiStagingAcceptanceOrchestrationSurfaceRow[];
  pendingWorksheetPath: "operations/staging/hsi-u46-staging-acceptance-orchestration.pending.json";
  softLandDocPath: "docs/engineering/HSI_U46_STAGING_ACCEPTANCE_ORCHESTRATION_2026-11-22.md";
  honesty: {
    composesU40U43: true;
    noPreviewGo: true;
    noChecklist1Verified: true;
    noInventedHosts: true;
    noInventedGrants: true;
    noProductionWrites: true;
    fixtureIsNotStagingGrant: true;
  };
};

const SURFACES: readonly HsiStagingAcceptanceOrchestrationSurfaceRow[] = [
  {
    surface: "check_honesty",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    scientificApproval: false,
    notes: "CI-safe bind of U40/U43/U12/continuous-journey soft-lands.",
  },
  {
    surface: "fixture_u40_probe",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    scientificApproval: false,
    notes: "Local U40 fixture + placeholder fill refusal; no network.",
  },
  {
    surface: "dry_apply_u43",
    engineeringReady: true,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "Dry-run apply of owner-supplied U12 fill proposal; preview GO stays false.",
  },
  {
    surface: "live_staging_grant",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "Live staging grant + origin probe remain owner-gated (U40 live).",
  },
  {
    surface: "preview_go_claim",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "restrictedPreviewClaimed stays false after orchestration.",
  },
  {
    surface: "checklist_1_verified_claim",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "checklist1Verified stays false; owner GO is separate.",
  },
  {
    surface: "invented_host_grant",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "Invented hosts/grants refused; no placeholder writes.",
  },
];

export function hsiStagingAcceptanceOrchestrationSoftLandPacket(): HsiStagingAcceptanceOrchestrationSoftLandPacket {
  return {
    schemaVersion: HSI_STAGING_ACCEPTANCE_ORCHESTRATION_SOFT_LAND_SCHEMA,
    purpose: "hsi_staging_acceptance_orchestration_u46",
    backlogId: "HSI-U46-STAGING-ACCEPTANCE-ORCHESTRATION",
    fillsSoftLand: ["U12", "U40", "U43", "HSI-1.0-CONTINUOUS-JOURNEY-EVIDENCE"],
    scientificApproval: false,
    restrictedPreviewClaimed: false,
    checklist1Verified: false,
    acceptedForScope: false,
    productionWritesEnabled: false,
    inventedStagingUrl: false,
    inventedGrant: false,
    surfaces: SURFACES,
    pendingWorksheetPath:
      "operations/staging/hsi-u46-staging-acceptance-orchestration.pending.json",
    softLandDocPath:
      "docs/engineering/HSI_U46_STAGING_ACCEPTANCE_ORCHESTRATION_2026-11-22.md",
    honesty: {
      composesU40U43: true,
      noPreviewGo: true,
      noChecklist1Verified: true,
      noInventedHosts: true,
      noInventedGrants: true,
      noProductionWrites: true,
      fixtureIsNotStagingGrant: true,
    },
  };
}

export function hsiStagingAcceptanceOrchestrationSurfaceById(
  surface: HsiStagingAcceptanceOrchestrationSurfaceId,
): HsiStagingAcceptanceOrchestrationSurfaceRow {
  const row = SURFACES.find((s) => s.surface === surface);
  if (!row) {
    throw new Error(`Missing U46 surface: ${surface}`);
  }
  return row;
}

export function assertHsiStagingAcceptanceOrchestrationSoftLand(
  packet: HsiStagingAcceptanceOrchestrationSoftLandPacket = hsiStagingAcceptanceOrchestrationSoftLandPacket(),
): {
  surfaceCount: number;
  restrictedPreviewClaimed: false;
  checklist1Verified: false;
  acceptedForScope: false;
} {
  if (packet.schemaVersion !== HSI_STAGING_ACCEPTANCE_ORCHESTRATION_SOFT_LAND_SCHEMA) {
    throw new Error("unexpected U46 schema");
  }
  if (packet.backlogId !== "HSI-U46-STAGING-ACCEPTANCE-ORCHESTRATION") {
    throw new Error("soft-land must bind HSI-U46-STAGING-ACCEPTANCE-ORCHESTRATION");
  }
  if (
    packet.scientificApproval !== false ||
    packet.restrictedPreviewClaimed !== false ||
    packet.checklist1Verified !== false ||
    packet.acceptedForScope !== false ||
    packet.productionWritesEnabled !== false ||
    packet.inventedStagingUrl !== false ||
    packet.inventedGrant !== false
  ) {
    throw new Error(
      "U46 soft-land must keep preview GO, checklist #1, acceptance, writes, hosts, and grants closed",
    );
  }
  if (packet.surfaces.length !== 7) {
    throw new Error("expected seven U46 surfaces");
  }
  for (const surface of [
    "check_honesty",
    "fixture_u40_probe",
    "dry_apply_u43",
    "live_staging_grant",
    "preview_go_claim",
    "checklist_1_verified_claim",
    "invented_host_grant",
  ] as const) {
    hsiStagingAcceptanceOrchestrationSurfaceById(surface);
  }
  return {
    surfaceCount: packet.surfaces.length,
    restrictedPreviewClaimed: false,
    checklist1Verified: false,
    acceptedForScope: false,
  };
}
