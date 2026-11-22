/**
 * U43 — U12 evidence fill-apply soft-land catalog.
 */

export const HSI_U12_EVIDENCE_FILL_APPLY_SOFT_LAND_SCHEMA =
  "hsi-u12-evidence-fill-apply-soft-land-1" as const;

export type HsiU12EvidenceFillApplySurfaceId =
  | "dry_run_apply"
  | "write_apply_with_owner_flags"
  | "placeholder_refuse"
  | "preview_go_claim"
  | "checklist_1_verified_claim"
  | "invented_host_grant";

export type HsiU12EvidenceFillApplySurfaceRow = {
  surface: HsiU12EvidenceFillApplySurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  scientificApproval: false;
  notes: string;
};

export type HsiU12EvidenceFillApplySoftLandPacket = {
  schemaVersion: typeof HSI_U12_EVIDENCE_FILL_APPLY_SOFT_LAND_SCHEMA;
  purpose: "hsi_u12_evidence_fill_apply_u43";
  backlogId: "HSI-U43-U12-EVIDENCE-FILL-APPLY";
  fillsSoftLand: readonly ["U12", "HSI-1.0-CONTINUOUS-JOURNEY-EVIDENCE", "U40"];
  scientificApproval: false;
  restrictedPreviewClaimed: false;
  checklist1Verified: false;
  acceptedForScope: false;
  productionWritesEnabled: false;
  inventedStagingUrl: false;
  inventedGrant: false;
  surfaces: readonly HsiU12EvidenceFillApplySurfaceRow[];
  pendingWorksheetPaths: readonly [
    "operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json",
    "operations/staging/hsi-10-continuous-journey-evidence.pending.json",
  ];
  softLandDocPath: "docs/engineering/HSI_U43_U12_EVIDENCE_FILL_APPLY_2026-11-22.md";
  honesty: {
    dryRunDefault: true;
    noPreviewGo: true;
    noChecklist1Verified: true;
    noInventedHosts: true;
    noInventedGrants: true;
    noProductionWrites: true;
  };
};

const SURFACES: readonly HsiU12EvidenceFillApplySurfaceRow[] = [
  {
    surface: "dry_run_apply",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    scientificApproval: false,
    notes: "Pure apply returns next JSON without writing files.",
  },
  {
    surface: "write_apply_with_owner_flags",
    engineeringReady: true,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "CLI --write requires dual owner env flags; still leaves preview GO false.",
  },
  {
    surface: "placeholder_refuse",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    scientificApproval: false,
    notes: "Reuses U40 assertNonPlaceholderRef via fill proposal builder.",
  },
  {
    surface: "preview_go_claim",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "restrictedPreviewClaimed stays false after apply.",
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
    notes: "Invented hosts/grants refused by proposal builder + apply honesty.",
  },
];

export function hsiU12EvidenceFillApplySoftLandPacket(): HsiU12EvidenceFillApplySoftLandPacket {
  return {
    schemaVersion: HSI_U12_EVIDENCE_FILL_APPLY_SOFT_LAND_SCHEMA,
    purpose: "hsi_u12_evidence_fill_apply_u43",
    backlogId: "HSI-U43-U12-EVIDENCE-FILL-APPLY",
    fillsSoftLand: ["U12", "HSI-1.0-CONTINUOUS-JOURNEY-EVIDENCE", "U40"],
    scientificApproval: false,
    restrictedPreviewClaimed: false,
    checklist1Verified: false,
    acceptedForScope: false,
    productionWritesEnabled: false,
    inventedStagingUrl: false,
    inventedGrant: false,
    surfaces: SURFACES,
    pendingWorksheetPaths: [
      "operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json",
      "operations/staging/hsi-10-continuous-journey-evidence.pending.json",
    ],
    softLandDocPath: "docs/engineering/HSI_U43_U12_EVIDENCE_FILL_APPLY_2026-11-22.md",
    honesty: {
      dryRunDefault: true,
      noPreviewGo: true,
      noChecklist1Verified: true,
      noInventedHosts: true,
      noInventedGrants: true,
      noProductionWrites: true,
    },
  };
}

export function hsiU12EvidenceFillApplySurfaceById(
  surface: HsiU12EvidenceFillApplySurfaceId,
): HsiU12EvidenceFillApplySurfaceRow {
  switch (surface) {
    case "dry_run_apply":
    case "write_apply_with_owner_flags":
    case "placeholder_refuse":
    case "preview_go_claim":
    case "checklist_1_verified_claim":
    case "invented_host_grant": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing U43 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown U43 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsiU12EvidenceFillApplySoftLand(
  packet: HsiU12EvidenceFillApplySoftLandPacket = hsiU12EvidenceFillApplySoftLandPacket(),
): {
  surfaceCount: number;
  restrictedPreviewClaimed: false;
  checklist1Verified: false;
  inventedStagingUrl: false;
} {
  if (packet.schemaVersion !== HSI_U12_EVIDENCE_FILL_APPLY_SOFT_LAND_SCHEMA) {
    throw new Error("unexpected U43 schema");
  }
  if (packet.backlogId !== "HSI-U43-U12-EVIDENCE-FILL-APPLY") {
    throw new Error("soft-land must bind HSI-U43-U12-EVIDENCE-FILL-APPLY");
  }
  if (
    packet.restrictedPreviewClaimed !== false ||
    packet.checklist1Verified !== false ||
    packet.acceptedForScope !== false ||
    packet.productionWritesEnabled !== false ||
    packet.inventedStagingUrl !== false ||
    packet.inventedGrant !== false ||
    packet.scientificApproval !== false
  ) {
    throw new Error("U43 soft-land must keep preview GO, checklist #1, writes, and invented hosts closed");
  }
  if (packet.surfaces.length !== 6) {
    throw new Error("expected six U43 surfaces");
  }
  return {
    surfaceCount: packet.surfaces.length,
    restrictedPreviewClaimed: false,
    checklist1Verified: false,
    inventedStagingUrl: false,
  };
}
