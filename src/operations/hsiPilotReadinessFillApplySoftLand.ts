/**
 * U49 — P1 Human #8 pilot readiness fill-apply soft-land catalog.
 */

export const HSI_PILOT_READINESS_FILL_APPLY_SOFT_LAND_SCHEMA =
  "hsi-pilot-readiness-fill-apply-soft-land-1" as const;

export type HsiPilotReadinessFillApplySurfaceId =
  | "dry_run_apply"
  | "write_apply_with_owner_flags"
  | "placeholder_refuse"
  | "soak_accepted_claim"
  | "pilot_release_signed_claim"
  | "checklist_8_invite_claim"
  | "invented_oncall_soak_invite";

export type HsiPilotReadinessFillApplySurfaceRow = {
  surface: HsiPilotReadinessFillApplySurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  scientificApproval: false;
  notes: string;
};

export type HsiPilotReadinessFillApplySoftLandPacket = {
  schemaVersion: typeof HSI_PILOT_READINESS_FILL_APPLY_SOFT_LAND_SCHEMA;
  purpose: "hsi_pilot_readiness_fill_apply_u49";
  backlogId: "HSI-U49-PILOT-READINESS-FILL-APPLY";
  fillsSoftLand: readonly ["HSI-1.0-PILOT-READINESS-U8", "NEXT-F-SOAK-PILOT-RELEASE"];
  scientificApproval: false;
  soakAccepted: false;
  pilotReleaseSigned: false;
  pilotInviteAllowed: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedOnCallOwners: false;
  inventedAlertDestinations: false;
  inventedFourteenDayEvidence: false;
  inventedPilotInvite: false;
  autoGraphPromotion: false;
  surfaces: readonly HsiPilotReadinessFillApplySurfaceRow[];
  pendingWorksheetPaths: readonly [
    "operations/staging/hsi-10-pilot-readiness-u8.pending.json",
    "operations/staging/next-f-soak-pilot-release.pending.json",
  ];
  softLandDocPath: "docs/engineering/HSI_U49_PILOT_READINESS_FILL_APPLY_2026-11-22.md";
  honesty: {
    dryRunDefault: true;
    noSoakAccepted: true;
    noPilotReleaseSigned: true;
    noChecklist8Invite: true;
    noInventedOnCall: true;
    noInventedSoakEvidence: true;
    noInventedPilotInvite: true;
    noAutoGraphPromotion: true;
  };
};

const SURFACES: readonly HsiPilotReadinessFillApplySurfaceRow[] = [
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
    notes: "CLI --write requires dual owner env flags; soak/pilot stay unsigned.",
  },
  {
    surface: "placeholder_refuse",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    scientificApproval: false,
    notes: "Placeholder / invented on-call / soak / invite refs refused.",
  },
  {
    surface: "soak_accepted_claim",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "soakAccepted stays false after apply.",
  },
  {
    surface: "pilot_release_signed_claim",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "pilotReleaseSigned stays false after apply.",
  },
  {
    surface: "checklist_8_invite_claim",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "pilotInviteAllowed stays false; checklist #8 remains blocked.",
  },
  {
    surface: "invented_oncall_soak_invite",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "Invented on-call, alerts, soak evidence, and invites refused.",
  },
];

export function hsiPilotReadinessFillApplySoftLandPacket(): HsiPilotReadinessFillApplySoftLandPacket {
  return {
    schemaVersion: HSI_PILOT_READINESS_FILL_APPLY_SOFT_LAND_SCHEMA,
    purpose: "hsi_pilot_readiness_fill_apply_u49",
    backlogId: "HSI-U49-PILOT-READINESS-FILL-APPLY",
    fillsSoftLand: ["HSI-1.0-PILOT-READINESS-U8", "NEXT-F-SOAK-PILOT-RELEASE"],
    scientificApproval: false,
    soakAccepted: false,
    pilotReleaseSigned: false,
    pilotInviteAllowed: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedOnCallOwners: false,
    inventedAlertDestinations: false,
    inventedFourteenDayEvidence: false,
    inventedPilotInvite: false,
    autoGraphPromotion: false,
    surfaces: SURFACES,
    pendingWorksheetPaths: [
      "operations/staging/hsi-10-pilot-readiness-u8.pending.json",
      "operations/staging/next-f-soak-pilot-release.pending.json",
    ],
    softLandDocPath: "docs/engineering/HSI_U49_PILOT_READINESS_FILL_APPLY_2026-11-22.md",
    honesty: {
      dryRunDefault: true,
      noSoakAccepted: true,
      noPilotReleaseSigned: true,
      noChecklist8Invite: true,
      noInventedOnCall: true,
      noInventedSoakEvidence: true,
      noInventedPilotInvite: true,
      noAutoGraphPromotion: true,
    },
  };
}

export function hsiPilotReadinessFillApplySurfaceById(
  surface: HsiPilotReadinessFillApplySurfaceId,
): HsiPilotReadinessFillApplySurfaceRow {
  const row = SURFACES.find((s) => s.surface === surface);
  if (!row) {
    throw new Error(`Missing U49 surface: ${surface}`);
  }
  return row;
}

export function assertHsiPilotReadinessFillApplySoftLand(
  packet: HsiPilotReadinessFillApplySoftLandPacket = hsiPilotReadinessFillApplySoftLandPacket(),
): {
  surfaceCount: number;
  soakAccepted: false;
  pilotReleaseSigned: false;
  pilotInviteAllowed: false;
  acceptedForScope: false;
} {
  if (packet.schemaVersion !== HSI_PILOT_READINESS_FILL_APPLY_SOFT_LAND_SCHEMA) {
    throw new Error("unexpected U49 schema");
  }
  if (packet.backlogId !== "HSI-U49-PILOT-READINESS-FILL-APPLY") {
    throw new Error("soft-land must bind HSI-U49-PILOT-READINESS-FILL-APPLY");
  }
  if (
    packet.scientificApproval !== false ||
    packet.soakAccepted !== false ||
    packet.pilotReleaseSigned !== false ||
    packet.pilotInviteAllowed !== false ||
    packet.acceptedForScope !== false ||
    packet.signedPacketClaimed !== false ||
    packet.inventedOnCallOwners !== false ||
    packet.inventedAlertDestinations !== false ||
    packet.inventedFourteenDayEvidence !== false ||
    packet.inventedPilotInvite !== false ||
    packet.autoGraphPromotion !== false
  ) {
    throw new Error(
      "U49 soft-land must keep soak, pilot release, invites, acceptance, invented ops evidence, and auto graph promotion closed",
    );
  }
  if (packet.surfaces.length !== 7) {
    throw new Error("expected seven U49 surfaces");
  }
  for (const surface of [
    "dry_run_apply",
    "write_apply_with_owner_flags",
    "placeholder_refuse",
    "soak_accepted_claim",
    "pilot_release_signed_claim",
    "checklist_8_invite_claim",
    "invented_oncall_soak_invite",
  ] as const) {
    hsiPilotReadinessFillApplySurfaceById(surface);
  }
  return {
    surfaceCount: packet.surfaces.length,
    soakAccepted: false,
    pilotReleaseSigned: false,
    pilotInviteAllowed: false,
    acceptedForScope: false,
  };
}
