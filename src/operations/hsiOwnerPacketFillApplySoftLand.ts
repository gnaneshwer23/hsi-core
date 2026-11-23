/**
 * U47 — P0 Human #2/#3/#5 owner-packet fill-apply soft-land catalog.
 */

export const HSI_OWNER_PACKET_FILL_APPLY_SOFT_LAND_SCHEMA =
  "hsi-owner-packet-fill-apply-soft-land-1" as const;

export type HsiOwnerPacketFillApplySurfaceId =
  | "dry_run_apply"
  | "write_apply_with_owner_flags"
  | "placeholder_refuse"
  | "human_2_closed_claim"
  | "human_3_closed_claim"
  | "human_5_closed_claim"
  | "invented_signer_mou_host";

export type HsiOwnerPacketFillApplySurfaceRow = {
  surface: HsiOwnerPacketFillApplySurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  scientificApproval: false;
  notes: string;
};

export type HsiOwnerPacketFillApplySoftLandPacket = {
  schemaVersion: typeof HSI_OWNER_PACKET_FILL_APPLY_SOFT_LAND_SCHEMA;
  purpose: "hsi_owner_packet_fill_apply_u47";
  backlogId: "HSI-U47-OWNER-PACKET-FILL-APPLY";
  fillsSoftLand: readonly ["HSI-1.0-OWNER-PACKETS-U6"];
  scientificApproval: false;
  human2Closed: false;
  human3Closed: false;
  human5Closed: false;
  signedPacketClaimed: false;
  acceptedForScope: false;
  productionWritesEnabled: false;
  inventedSigner: false;
  inventedStagingUrl: false;
  inventedMoU: false;
  surfaces: readonly HsiOwnerPacketFillApplySurfaceRow[];
  pendingWorksheetPath: "operations/staging/hsi-10-owner-packets.pending.json";
  softLandDocPath: "docs/engineering/HSI_U47_OWNER_PACKET_FILL_APPLY_2026-11-22.md";
  honesty: {
    dryRunDefault: true;
    noHumanGatesClosed: true;
    noSignedPacket: true;
    noInventedSigner: true;
    noInventedStagingUrl: true;
    noInventedMoU: true;
    noProductionWrites: true;
  };
};

const SURFACES: readonly HsiOwnerPacketFillApplySurfaceRow[] = [
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
    notes: "CLI --write requires dual owner env flags; Human gates stay open.",
  },
  {
    surface: "placeholder_refuse",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    scientificApproval: false,
    notes: "Placeholder / invented refs refused by proposal builder.",
  },
  {
    surface: "human_2_closed_claim",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "human2Closed stays false after apply.",
  },
  {
    surface: "human_3_closed_claim",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "human3Closed stays false after apply.",
  },
  {
    surface: "human_5_closed_claim",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "human5Closed stays false after apply.",
  },
  {
    surface: "invented_signer_mou_host",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "Invented signers, MoUs, and staging hosts refused.",
  },
];

export function hsiOwnerPacketFillApplySoftLandPacket(): HsiOwnerPacketFillApplySoftLandPacket {
  return {
    schemaVersion: HSI_OWNER_PACKET_FILL_APPLY_SOFT_LAND_SCHEMA,
    purpose: "hsi_owner_packet_fill_apply_u47",
    backlogId: "HSI-U47-OWNER-PACKET-FILL-APPLY",
    fillsSoftLand: ["HSI-1.0-OWNER-PACKETS-U6"],
    scientificApproval: false,
    human2Closed: false,
    human3Closed: false,
    human5Closed: false,
    signedPacketClaimed: false,
    acceptedForScope: false,
    productionWritesEnabled: false,
    inventedSigner: false,
    inventedStagingUrl: false,
    inventedMoU: false,
    surfaces: SURFACES,
    pendingWorksheetPath: "operations/staging/hsi-10-owner-packets.pending.json",
    softLandDocPath: "docs/engineering/HSI_U47_OWNER_PACKET_FILL_APPLY_2026-11-22.md",
    honesty: {
      dryRunDefault: true,
      noHumanGatesClosed: true,
      noSignedPacket: true,
      noInventedSigner: true,
      noInventedStagingUrl: true,
      noInventedMoU: true,
      noProductionWrites: true,
    },
  };
}

export function hsiOwnerPacketFillApplySurfaceById(
  surface: HsiOwnerPacketFillApplySurfaceId,
): HsiOwnerPacketFillApplySurfaceRow {
  const row = SURFACES.find((s) => s.surface === surface);
  if (!row) {
    throw new Error(`Missing U47 surface: ${surface}`);
  }
  return row;
}

export function assertHsiOwnerPacketFillApplySoftLand(
  packet: HsiOwnerPacketFillApplySoftLandPacket = hsiOwnerPacketFillApplySoftLandPacket(),
): {
  surfaceCount: number;
  human2Closed: false;
  human3Closed: false;
  human5Closed: false;
  acceptedForScope: false;
} {
  if (packet.schemaVersion !== HSI_OWNER_PACKET_FILL_APPLY_SOFT_LAND_SCHEMA) {
    throw new Error("unexpected U47 schema");
  }
  if (packet.backlogId !== "HSI-U47-OWNER-PACKET-FILL-APPLY") {
    throw new Error("soft-land must bind HSI-U47-OWNER-PACKET-FILL-APPLY");
  }
  if (
    packet.scientificApproval !== false ||
    packet.human2Closed !== false ||
    packet.human3Closed !== false ||
    packet.human5Closed !== false ||
    packet.signedPacketClaimed !== false ||
    packet.acceptedForScope !== false ||
    packet.productionWritesEnabled !== false ||
    packet.inventedSigner !== false ||
    packet.inventedStagingUrl !== false ||
    packet.inventedMoU !== false
  ) {
    throw new Error(
      "U47 soft-land must keep Human gates, signed packets, acceptance, writes, signers, hosts, and MoUs closed",
    );
  }
  if (packet.surfaces.length !== 7) {
    throw new Error("expected seven U47 surfaces");
  }
  for (const surface of [
    "dry_run_apply",
    "write_apply_with_owner_flags",
    "placeholder_refuse",
    "human_2_closed_claim",
    "human_3_closed_claim",
    "human_5_closed_claim",
    "invented_signer_mou_host",
  ] as const) {
    hsiOwnerPacketFillApplySurfaceById(surface);
  }
  return {
    surfaceCount: packet.surfaces.length,
    human2Closed: false,
    human3Closed: false,
    human5Closed: false,
    acceptedForScope: false,
  };
}
