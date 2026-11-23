/**
 * U48 — P1 Human #4 SME reliability fill-apply soft-land catalog.
 */

export const HSI_SME_RELIABILITY_FILL_APPLY_SOFT_LAND_SCHEMA =
  "hsi-sme-reliability-fill-apply-soft-land-1" as const;

export type HsiSmeReliabilityFillApplySurfaceId =
  | "dry_run_apply"
  | "write_apply_with_owner_flags"
  | "placeholder_refuse"
  | "sme_gold_filled_claim"
  | "scientific_approval_claim"
  | "invented_labels_adjudications"
  | "gold_committed_in_git";

export type HsiSmeReliabilityFillApplySurfaceRow = {
  surface: HsiSmeReliabilityFillApplySurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  scientificApproval: false;
  notes: string;
};

export type HsiSmeReliabilityFillApplySoftLandPacket = {
  schemaVersion: typeof HSI_SME_RELIABILITY_FILL_APPLY_SOFT_LAND_SCHEMA;
  purpose: "hsi_sme_reliability_fill_apply_u48";
  backlogId: "HSI-U48-SME-RELIABILITY-FILL-APPLY";
  fillsSoftLand: readonly ["HSI-1.0-SCIENTIFIC-RELIABILITY-U7", "E2E-10-SME-GOLD-VAULT"];
  scientificApproval: false;
  smeGoldFilled: false;
  frozenHeldOut: false;
  adjudicatedCases: 0;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedSmeLabels: false;
  inventedAdjudications: false;
  goldCommittedInGit: false;
  surfaces: readonly HsiSmeReliabilityFillApplySurfaceRow[];
  pendingWorksheetPaths: readonly [
    "operations/staging/hsi-10-scientific-reliability-u7.pending.json",
    "operations/staging/e2e-10-sme-gold-vault.pending.json",
  ];
  softLandDocPath: "docs/engineering/HSI_U48_SME_RELIABILITY_FILL_APPLY_2026-11-22.md";
  honesty: {
    dryRunDefault: true;
    noSmeGoldFilled: true;
    noScientificApproval: true;
    noInventedLabels: true;
    noInventedAdjudications: true;
    noGoldInGit: true;
    vaultStaysGitignored: true;
  };
};

const SURFACES: readonly HsiSmeReliabilityFillApplySurfaceRow[] = [
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
    notes: "CLI --write requires dual owner env flags; gold stays unfilled.",
  },
  {
    surface: "placeholder_refuse",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    scientificApproval: false,
    notes: "Placeholder / invented SME refs refused by proposal builder.",
  },
  {
    surface: "sme_gold_filled_claim",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "smeGoldFilled stays false after apply.",
  },
  {
    surface: "scientific_approval_claim",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "scientificApproval stays false after apply.",
  },
  {
    surface: "invented_labels_adjudications",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "Invented SME labels and adjudications refused.",
  },
  {
    surface: "gold_committed_in_git",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "Gold labels stay out of git; vault remains gitignored.",
  },
];

export function hsiSmeReliabilityFillApplySoftLandPacket(): HsiSmeReliabilityFillApplySoftLandPacket {
  return {
    schemaVersion: HSI_SME_RELIABILITY_FILL_APPLY_SOFT_LAND_SCHEMA,
    purpose: "hsi_sme_reliability_fill_apply_u48",
    backlogId: "HSI-U48-SME-RELIABILITY-FILL-APPLY",
    fillsSoftLand: ["HSI-1.0-SCIENTIFIC-RELIABILITY-U7", "E2E-10-SME-GOLD-VAULT"],
    scientificApproval: false,
    smeGoldFilled: false,
    frozenHeldOut: false,
    adjudicatedCases: 0,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedSmeLabels: false,
    inventedAdjudications: false,
    goldCommittedInGit: false,
    surfaces: SURFACES,
    pendingWorksheetPaths: [
      "operations/staging/hsi-10-scientific-reliability-u7.pending.json",
      "operations/staging/e2e-10-sme-gold-vault.pending.json",
    ],
    softLandDocPath: "docs/engineering/HSI_U48_SME_RELIABILITY_FILL_APPLY_2026-11-22.md",
    honesty: {
      dryRunDefault: true,
      noSmeGoldFilled: true,
      noScientificApproval: true,
      noInventedLabels: true,
      noInventedAdjudications: true,
      noGoldInGit: true,
      vaultStaysGitignored: true,
    },
  };
}

export function hsiSmeReliabilityFillApplySurfaceById(
  surface: HsiSmeReliabilityFillApplySurfaceId,
): HsiSmeReliabilityFillApplySurfaceRow {
  const row = SURFACES.find((s) => s.surface === surface);
  if (!row) {
    throw new Error(`Missing U48 surface: ${surface}`);
  }
  return row;
}

export function assertHsiSmeReliabilityFillApplySoftLand(
  packet: HsiSmeReliabilityFillApplySoftLandPacket = hsiSmeReliabilityFillApplySoftLandPacket(),
): {
  surfaceCount: number;
  smeGoldFilled: false;
  scientificApproval: false;
  adjudicatedCases: 0;
  acceptedForScope: false;
} {
  if (packet.schemaVersion !== HSI_SME_RELIABILITY_FILL_APPLY_SOFT_LAND_SCHEMA) {
    throw new Error("unexpected U48 schema");
  }
  if (packet.backlogId !== "HSI-U48-SME-RELIABILITY-FILL-APPLY") {
    throw new Error("soft-land must bind HSI-U48-SME-RELIABILITY-FILL-APPLY");
  }
  if (
    packet.scientificApproval !== false ||
    packet.smeGoldFilled !== false ||
    packet.frozenHeldOut !== false ||
    packet.adjudicatedCases !== 0 ||
    packet.acceptedForScope !== false ||
    packet.signedPacketClaimed !== false ||
    packet.inventedSmeLabels !== false ||
    packet.inventedAdjudications !== false ||
    packet.goldCommittedInGit !== false
  ) {
    throw new Error(
      "U48 soft-land must keep gold, freeze, adjudications, acceptance, invented labels, and git gold closed",
    );
  }
  if (packet.surfaces.length !== 7) {
    throw new Error("expected seven U48 surfaces");
  }
  for (const surface of [
    "dry_run_apply",
    "write_apply_with_owner_flags",
    "placeholder_refuse",
    "sme_gold_filled_claim",
    "scientific_approval_claim",
    "invented_labels_adjudications",
    "gold_committed_in_git",
  ] as const) {
    hsiSmeReliabilityFillApplySurfaceById(surface);
  }
  return {
    surfaceCount: packet.surfaces.length,
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCases: 0,
    acceptedForScope: false,
  };
}
