/**
 * HSI 1.0 — U8 pilot readiness soft-land (Human #8 / NEXT-F → checklist #8).
 *
 * Bundles existing NEXT-F soak/pilot soft-land with the usefulness / brief
 * engineering surfaces. Never invents on-call owners, soak evidence, signed
 * pilot releases, or researcher invites. Checklist #8 stays blocked until
 * Human #8 / NEXT-F.
 */

export const HSI_10_PILOT_READINESS_U8_SCHEMA =
  "hsi-1-0-pilot-readiness-u8-1" as const;

export type Hsi10PilotReadinessSurfaceId =
  | "next_f_soak_pilot_release"
  | "ops_alert_and_kill_switch"
  | "brief_usefulness_panel"
  | "checklist_8_researcher_invite"
  | "auto_graph_promotion";

export type Hsi10PilotReadinessSurfaceRow = {
  surface: Hsi10PilotReadinessSurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  soakAccepted: false;
  pilotReleaseSigned: false;
  pilotInviteAllowed: false;
  scientificApproval: false;
  autoGraphPromotion: false;
  checklistItem: 8;
  pathHints: readonly string[];
  notes: string;
};

export type Hsi10PilotReadinessSuiteMode = "check" | "fixture";

export type Hsi10PilotReadinessPacket = {
  schemaVersion: typeof HSI_10_PILOT_READINESS_U8_SCHEMA;
  purpose: "hsi_1_0_pilot_readiness_u8_soft_land";
  backlogId: "HSI-1.0-PILOT-READINESS-U8";
  humanGate: 8;
  checklistItem: 8;
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
  ciSafeModes: readonly Hsi10PilotReadinessSuiteMode[];
  surfaces: readonly Hsi10PilotReadinessSurfaceRow[];
  reuseModules: readonly string[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/hsi-10-pilot-readiness-u8.pending.json";
  softLandDocPath: "docs/engineering/HSI_10_PILOT_READINESS_U8_SOFT_LAND.md";
  acceptanceStatusDocPath: "docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md";
  honesty: {
    catalogsExistPilotBlocked: true;
    noInventedOnCall: true;
    noInventedAlertDestinations: true;
    noInventedSoakEvidence: true;
    noInventedPilotInvite: true;
    noAutoGraphPromotion: true;
    fixtureIsNotPilotRelease: true;
    checklist8BlockedUntilHuman8: true;
  };
};

export type Hsi10PilotReadinessAssessment = {
  schemaVersion: "hsi-1-0-pilot-readiness-u8-assessment-1";
  suiteMode: Hsi10PilotReadinessSuiteMode;
  mayClaimSoakAccepted: false;
  mayClaimPilotReleaseSigned: false;
  mayInvitePilotResearchers: false;
  mayInventOnCall: false;
  mayAutoPromoteGraph: false;
  mayClaimScientificApproval: false;
  ciSafe: true;
  reasons: string[];
  acceptedForScope: false;
  pilotInviteAllowed: false;
};

const SURFACES: readonly Hsi10PilotReadinessSurfaceRow[] = [
  {
    surface: "next_f_soak_pilot_release",
    engineeringReady: true,
    ownerEvidenceRequired: true,
    soakAccepted: false,
    pilotReleaseSigned: false,
    pilotInviteAllowed: false,
    scientificApproval: false,
    autoGraphPromotion: false,
    checklistItem: 8,
    pathHints: [
      "src/operations/nextFSoakPilotReleaseSoftLand.ts",
      "operations/staging/next-f-soak-pilot-release.pending.json",
      "docs/engineering/NEXT_F_SOAK_PILOT_RELEASE_SOFT_LAND.md",
    ],
    notes:
      "NEXT-F catalogs ops soak / signed invite-only pilot. Human #8 must accept soak before checklist #8 invites.",
  },
  {
    surface: "ops_alert_and_kill_switch",
    engineeringReady: true,
    ownerEvidenceRequired: true,
    soakAccepted: false,
    pilotReleaseSigned: false,
    pilotInviteAllowed: false,
    scientificApproval: false,
    autoGraphPromotion: false,
    checklistItem: 8,
    pathHints: [
      "src/operations/opsAlertCatalog.ts",
      "src/operations/sec02KillSwitchCatalog.ts",
    ],
    notes:
      "Alert + kill-switch catalogs exist; destinations and on-call owners remain UNASSIGNED until owner fills them.",
  },
  {
    surface: "brief_usefulness_panel",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    soakAccepted: false,
    pilotReleaseSigned: false,
    pilotInviteAllowed: false,
    scientificApproval: false,
    autoGraphPromotion: false,
    checklistItem: 8,
    pathHints: [
      "site/src/pages/InvestigationWorkspace.tsx",
      "docs/engineering/WORKSPACE_CONTINUOUS_TRAIL.md",
    ],
    notes:
      "Brief + usefulness engineering surface is ready for a controlled pilot. Not an invite authorization.",
  },
  {
    surface: "checklist_8_researcher_invite",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    soakAccepted: false,
    pilotReleaseSigned: false,
    pilotInviteAllowed: false,
    scientificApproval: false,
    autoGraphPromotion: false,
    checklistItem: 8,
    pathHints: [
      "operations/staging/hsi-10-owner-gates.pending.json",
      "docs/engineering/HSI_1_0_OWNER_GATES_WORKSHEET_2026-11-20.md",
    ],
    notes:
      "Always blocked here. Invite 3–5 researchers only after Human #8 / NEXT-F operational acceptance.",
  },
  {
    surface: "auto_graph_promotion",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    soakAccepted: false,
    pilotReleaseSigned: false,
    pilotInviteAllowed: false,
    scientificApproval: false,
    autoGraphPromotion: false,
    checklistItem: 8,
    pathHints: ["src/cdsPhiBoundary.ts"],
    notes: "Always refused. Pilot feedback must never auto-promote graph edges.",
  },
];

const REUSE_MODULES: readonly string[] = [
  "src/operations/nextFSoakPilotReleaseSoftLand.ts",
  "src/operations/hsi10OwnerGatesWorksheet.ts",
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Accept NEXT-E and required P0/P1 packets before Human #8 / NEXT-F soak.",
  "Name on-call and security owners privately — never invent destinations in git.",
  "Retain 14-day soak evidence digests before signing invite-only pilot.",
  "Invite 3–5 researchers for checklist #8 only after signed Human #8 / NEXT-F acceptance.",
  "Never auto-promote graph edges from pilot usefulness feedback.",
];

export function hsi10PilotReadinessU8Packet(): Hsi10PilotReadinessPacket {
  return {
    schemaVersion: HSI_10_PILOT_READINESS_U8_SCHEMA,
    purpose: "hsi_1_0_pilot_readiness_u8_soft_land",
    backlogId: "HSI-1.0-PILOT-READINESS-U8",
    humanGate: 8,
    checklistItem: 8,
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
    ciSafeModes: ["check", "fixture"],
    surfaces: SURFACES,
    reuseModules: REUSE_MODULES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/hsi-10-pilot-readiness-u8.pending.json",
    softLandDocPath: "docs/engineering/HSI_10_PILOT_READINESS_U8_SOFT_LAND.md",
    acceptanceStatusDocPath: "docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md",
    honesty: {
      catalogsExistPilotBlocked: true,
      noInventedOnCall: true,
      noInventedAlertDestinations: true,
      noInventedSoakEvidence: true,
      noInventedPilotInvite: true,
      noAutoGraphPromotion: true,
      fixtureIsNotPilotRelease: true,
      checklist8BlockedUntilHuman8: true,
    },
  };
}

export function hsi10PilotReadinessSurfaceById(
  surface: Hsi10PilotReadinessSurfaceId,
): Hsi10PilotReadinessSurfaceRow {
  switch (surface) {
    case "next_f_soak_pilot_release":
    case "ops_alert_and_kill_switch":
    case "brief_usefulness_panel":
    case "checklist_8_researcher_invite":
    case "auto_graph_promotion": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing U8 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown U8 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessHsi10PilotReadinessU8Mode(
  mode: Hsi10PilotReadinessSuiteMode,
): Hsi10PilotReadinessAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-1-0-pilot-readiness-u8-assessment-1",
        suiteMode: mode,
        mayClaimSoakAccepted: false,
        mayClaimPilotReleaseSigned: false,
        mayInvitePilotResearchers: false,
        mayInventOnCall: false,
        mayAutoPromoteGraph: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "check mode validates U8 scaffold honesty only",
          "checklist #8 stays blocked until Human #8 / NEXT-F",
          "auto graph promotion remains refused",
        ],
        acceptedForScope: false,
        pilotInviteAllowed: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-1-0-pilot-readiness-u8-assessment-1",
        suiteMode: mode,
        mayClaimSoakAccepted: false,
        mayClaimPilotReleaseSigned: false,
        mayInvitePilotResearchers: false,
        mayInventOnCall: false,
        mayAutoPromoteGraph: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "fixture green reuses NEXT-F soft-land tests only",
          "fixture green is not soak acceptance or signed pilot",
        ],
        acceptedForScope: false,
        pilotInviteAllowed: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown U8 suite mode: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsi10PilotReadinessU8SoftLand(
  packet: Hsi10PilotReadinessPacket,
): {
  surfaceCount: number;
  soakAccepted: false;
  pilotReleaseSigned: false;
  pilotInviteAllowed: false;
  autoGraphPromotion: false;
  acceptedForScope: false;
} {
  if (packet.schemaVersion !== HSI_10_PILOT_READINESS_U8_SCHEMA) {
    throw new Error("unexpected U8 pilot-readiness schema");
  }
  if (packet.backlogId !== "HSI-1.0-PILOT-READINESS-U8") {
    throw new Error("soft-land must bind HSI-1.0-PILOT-READINESS-U8");
  }
  if (packet.humanGate !== 8 || packet.checklistItem !== 8) {
    throw new Error("U8 must bind Human #8 / checklist #8");
  }
  if (
    packet.soakAccepted !== false ||
    packet.pilotReleaseSigned !== false ||
    packet.pilotInviteAllowed !== false ||
    packet.autoGraphPromotion !== false
  ) {
    throw new Error("soft-land must keep soak/pilot/invite/promotion claims false");
  }
  if (
    packet.inventedOnCallOwners !== false ||
    packet.inventedAlertDestinations !== false ||
    packet.inventedFourteenDayEvidence !== false ||
    packet.inventedPilotInvite !== false
  ) {
    throw new Error("soft-land must not invent on-call, destinations, soak, or invites");
  }
  if (packet.acceptedForScope !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must keep acceptance claims false");
  }
  if (packet.scientificApproval !== false) {
    throw new Error("soft-land must not claim scientific approval");
  }
  if (packet.surfaces.length !== 5) {
    throw new Error("expected five U8 surfaces");
  }
  const invite = packet.surfaces.find((s) => s.surface === "checklist_8_researcher_invite");
  if (!invite || invite.pilotInviteAllowed !== false || invite.engineeringReady !== false) {
    throw new Error("checklist #8 invites must stay blocked");
  }
  return {
    surfaceCount: packet.surfaces.length,
    soakAccepted: false,
    pilotReleaseSigned: false,
    pilotInviteAllowed: false,
    autoGraphPromotion: false,
    acceptedForScope: false,
  };
}
