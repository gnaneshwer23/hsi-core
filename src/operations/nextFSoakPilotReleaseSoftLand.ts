/**
 * NEXT-F — operational soak / on-call / restore / signed pilot soft-land (P1).
 *
 * Catalogues alert, kill-switch, pilot-ops, and restore/rollback surfaces for
 * invite-only pilot after exact-artifact release. Never invents on-call owners,
 * alert destinations, 14-day soak evidence, or signed pilot release.
 */

export const NEXT_F_SOAK_PILOT_RELEASE_SCHEMA =
  "hsi-next-f-soak-pilot-release-soft-land-1" as const;

export type NextFSuiteMode = "check" | "fixture";

export type NextFSurfaceId =
  | "ops_alert_catalog"
  | "kill_switch_spend_caps"
  | "pilot_operations_store"
  | "restore_rollback_drills"
  | "fourteen_day_soak_evidence"
  | "on_call_acknowledgement"
  | "signed_invite_only_pilot";

export type NextFSurfaceDisposition =
  | "reuse_soft_land"
  | "reuse_adapter"
  | "owner_gated_ops"
  | "blocked_until_next_e_and_p0_p1";

export type NextFSurfaceRow = {
  surface: NextFSurfaceId;
  disposition: NextFSurfaceDisposition;
  soakAccepted: false;
  pilotReleaseSigned: false;
  scientificApproval: false;
  pathHints: readonly string[];
  notes: string;
};

export type NextFSoakPilotReleasePacket = {
  schemaVersion: typeof NEXT_F_SOAK_PILOT_RELEASE_SCHEMA;
  purpose: "next_f_soak_pilot_release_soft_land";
  backlogId: "NEXT-F";
  priority: "P1";
  scientificApproval: false;
  soakAccepted: false;
  pilotReleaseSigned: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedOnCallOwners: false;
  inventedAlertDestinations: false;
  inventedFourteenDayEvidence: false;
  autoGraphPromotion: false;
  dependsOn: readonly ["NEXT-E"];
  alsoRequires: "all_p0_p1_acceptance";
  ciSafeModes: readonly NextFSuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly NextFSurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/next-f-soak-pilot-release.pending.json";
  softLandDocPath: "docs/engineering/NEXT_F_SOAK_PILOT_RELEASE_SOFT_LAND.md";
  honesty: {
    catalogsExistPilotBlocked: true;
    noInventedOnCall: true;
    noInventedAlertDestinations: true;
    noInventedSoakEvidence: true;
    noAutoGraphPromotion: true;
    nextEAndP0P1Required: true;
    fixtureIsNotPilotRelease: true;
  };
};

export type NextFAssessment = {
  schemaVersion: "hsi-next-f-assessment-1";
  suiteMode: NextFSuiteMode;
  mayClaimSoakAccepted: false;
  mayClaimPilotReleaseSigned: false;
  mayInventOnCall: false;
  mayInventAlertDestinations: false;
  mayAutoPromoteGraph: false;
  mayClaimScientificApproval: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  soakAccepted: false;
};

export type NextFPilotHonesty = {
  schemaVersion: "hsi-next-f-pilot-honesty-1";
  mustNameSecurityAndOpsOwners: true;
  mustWireRealKeysAndAlertDestination: true;
  mustApproveLoadCapCohortPolicy: true;
  mustRetainFourteenDayEvidence: true;
  mustDrillRpoRtoAndKillSwitch: true;
  mustKeepBriefAndGraphPromotionSeparate: true;
  reasons: string[];
};

const SURFACES: readonly NextFSurfaceRow[] = [
  {
    surface: "ops_alert_catalog",
    disposition: "reuse_soft_land",
    soakAccepted: false,
    pilotReleaseSigned: false,
    scientificApproval: false,
    pathHints: [
      "src/operations/opsAlertCatalog.ts",
      "docs/engineering/A1_3_OPS_ERROR_ALERTS_SOFT_LAND.md",
    ],
    notes: "Four Pack §5 alerts documented; live on-call delivery stays owner-gated.",
  },
  {
    surface: "kill_switch_spend_caps",
    disposition: "reuse_soft_land",
    soakAccepted: false,
    pilotReleaseSigned: false,
    scientificApproval: false,
    pathHints: [
      "src/operations/sec02KillSwitchCatalog.ts",
      "docs/engineering/A1_2_SEC02_KILL_SWITCH_SOFT_LAND.md",
    ],
    notes: "Kill-switch catalog; numeric caps and drills remain owner-chosen.",
  },
  {
    surface: "pilot_operations_store",
    disposition: "reuse_adapter",
    soakAccepted: false,
    pilotReleaseSigned: false,
    scientificApproval: false,
    pathHints: [
      "src/operations/pilotOperationsStore.ts",
      "src/operations/pilotOperationsService.ts",
    ],
    notes: "Pilot SQLite ops/alert mocks are not product on-call or soak acceptance.",
  },
  {
    surface: "restore_rollback_drills",
    disposition: "owner_gated_ops",
    soakAccepted: false,
    pilotReleaseSigned: false,
    scientificApproval: false,
    pathHints: [
      "src/operations/trackBOwnerGates.ts",
      "src/operations/nextBIsolationSoftLand.ts",
    ],
    notes: "Full restore/rollback and RPO/RTO drills need named DB/security owners.",
  },
  {
    surface: "fourteen_day_soak_evidence",
    disposition: "blocked_until_next_e_and_p0_p1",
    soakAccepted: false,
    pilotReleaseSigned: false,
    scientificApproval: false,
    pathHints: ["docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md"],
    notes: "14-day operational soak evidence cannot be invented in git.",
  },
  {
    surface: "on_call_acknowledgement",
    disposition: "owner_gated_ops",
    soakAccepted: false,
    pilotReleaseSigned: false,
    scientificApproval: false,
    pathHints: ["docs/engineering/A1_3_OPS_ERROR_ALERTS_SOFT_LAND.md"],
    notes: "Named security/ops owners + real alert destination required; never invent identities.",
  },
  {
    surface: "signed_invite_only_pilot",
    disposition: "blocked_until_next_e_and_p0_p1",
    soakAccepted: false,
    pilotReleaseSigned: false,
    scientificApproval: false,
    pathHints: ["docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md"],
    notes: "Invite-only pilot after exact-artifact release; each brief/graph promotion is a separate human decision.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Accept NEXT-E and all remaining P0/P1 acceptances for the exact release artifact first.",
  "Name security and operations owners; wire real keys and an alert destination without inventing them.",
  "Approve load/cap/cohort policy; retain 14-day soak evidence with RPO/RTO and kill-switch drills.",
  "Sign invite-only pilot release only for the exact accepted artifact.",
  "Keep every material brief and graph promotion as a separate human decision after pilot start.",
];

const REUSE_MODULES: readonly string[] = [
  "src/operations/opsAlertCatalog.ts",
  "src/operations/sec02KillSwitchCatalog.ts",
  "src/operations/pilotOperationsStore.ts",
  "src/operations/pilotOperationsService.ts",
  "src/operations/trackBOwnerGates.ts",
  "docs/engineering/A1_2_SEC02_KILL_SWITCH_SOFT_LAND.md",
  "docs/engineering/A1_3_OPS_ERROR_ALERTS_SOFT_LAND.md",
];

export function nextFSoakPilotReleasePacket(): NextFSoakPilotReleasePacket {
  return {
    schemaVersion: NEXT_F_SOAK_PILOT_RELEASE_SCHEMA,
    purpose: "next_f_soak_pilot_release_soft_land",
    backlogId: "NEXT-F",
    priority: "P1",
    scientificApproval: false,
    soakAccepted: false,
    pilotReleaseSigned: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedOnCallOwners: false,
    inventedAlertDestinations: false,
    inventedFourteenDayEvidence: false,
    autoGraphPromotion: false,
    dependsOn: ["NEXT-E"],
    alsoRequires: "all_p0_p1_acceptance",
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/next-f-soak-pilot-release.pending.json",
    softLandDocPath: "docs/engineering/NEXT_F_SOAK_PILOT_RELEASE_SOFT_LAND.md",
    honesty: {
      catalogsExistPilotBlocked: true,
      noInventedOnCall: true,
      noInventedAlertDestinations: true,
      noInventedSoakEvidence: true,
      noAutoGraphPromotion: true,
      nextEAndP0P1Required: true,
      fixtureIsNotPilotRelease: true,
    },
  };
}

export function nextFSurfaceById(surface: NextFSurfaceId): NextFSurfaceRow {
  switch (surface) {
    case "ops_alert_catalog":
    case "kill_switch_spend_caps":
    case "pilot_operations_store":
    case "restore_rollback_drills":
    case "fourteen_day_soak_evidence":
    case "on_call_acknowledgement":
    case "signed_invite_only_pilot": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing NEXT-F surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown NEXT-F surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessNextFMode(mode: NextFSuiteMode): NextFAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-next-f-assessment-1",
        suiteMode: mode,
        mayClaimSoakAccepted: false,
        mayClaimPilotReleaseSigned: false,
        mayInventOnCall: false,
        mayInventAlertDestinations: false,
        mayAutoPromoteGraph: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "soak and signed pilot stay blocked until NEXT-E plus all P0/P1 acceptance",
        ],
        scientificApproval: false,
        soakAccepted: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-next-f-assessment-1",
        suiteMode: mode,
        mayClaimSoakAccepted: false,
        mayClaimPilotReleaseSigned: false,
        mayInventOnCall: false,
        mayInventAlertDestinations: false,
        mayAutoPromoteGraph: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "fixture alert/pilot-store tests use mocks only",
          "fixture green is not 14-day soak evidence or signed pilot release",
        ],
        scientificApproval: false,
        soakAccepted: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown NEXT-F suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Pilot / soak honesty for NEXT-F soft-land. */
export function assessNextFPilotHonesty(): NextFPilotHonesty {
  return {
    schemaVersion: "hsi-next-f-pilot-honesty-1",
    mustNameSecurityAndOpsOwners: true,
    mustWireRealKeysAndAlertDestination: true,
    mustApproveLoadCapCohortPolicy: true,
    mustRetainFourteenDayEvidence: true,
    mustDrillRpoRtoAndKillSwitch: true,
    mustKeepBriefAndGraphPromotionSeparate: true,
    reasons: [
      "Named security and operations owners are required before pilot",
      "Real keys and alert destination must be wired without inventing destinations",
      "Load/cap/cohort policy must be approved before soak",
      "14-day operational evidence cannot be fabricated in soft-land",
      "RPO/RTO and kill-switch drills must be executed and retained",
      "Each material brief and graph promotion remains a separate human decision",
    ],
  };
}

export function assertNextFSoakPilotReleaseSoftLand(
  packet: NextFSoakPilotReleasePacket,
): {
  surfaceCount: number;
  soakAccepted: false;
  pilotReleaseSigned: false;
  acceptedForScope: false;
} {
  if (packet.schemaVersion !== NEXT_F_SOAK_PILOT_RELEASE_SCHEMA) {
    throw new Error("unexpected NEXT-F soak-pilot-release schema");
  }
  if (packet.backlogId !== "NEXT-F" || packet.priority !== "P1") {
    throw new Error("soft-land must bind NEXT-F at P1");
  }
  if (packet.soakAccepted !== false || packet.pilotReleaseSigned !== false) {
    throw new Error("soft-land must keep soakAccepted and pilotReleaseSigned false");
  }
  if (packet.scientificApproval !== false || packet.acceptedForScope !== false) {
    throw new Error("soft-land must not claim scientific approval or acceptance");
  }
  if (packet.signedPacketClaimed !== false || packet.autoGraphPromotion !== false) {
    throw new Error("soft-land must not claim signed packet or auto graph promotion");
  }
  if (
    packet.inventedOnCallOwners !== false ||
    packet.inventedAlertDestinations !== false ||
    packet.inventedFourteenDayEvidence !== false
  ) {
    throw new Error("soft-land must not invent on-call, destinations, or soak evidence");
  }
  if (packet.dependsOn.length !== 1 || packet.dependsOn[0] !== "NEXT-E") {
    throw new Error("soft-land must depend on NEXT-E");
  }
  if (packet.alsoRequires !== "all_p0_p1_acceptance") {
    throw new Error("soft-land must also require all P0/P1 acceptance");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven NEXT-F surfaces");
  for (const surface of packet.surfaces) {
    if (surface.soakAccepted !== false || surface.pilotReleaseSigned !== false) {
      throw new Error(`surface ${surface.surface} must keep soak/pilot false`);
    }
    if (surface.scientificApproval !== false) {
      throw new Error(`surface ${surface.surface} must not claim scientific approval`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    soakAccepted: false,
    pilotReleaseSigned: false,
    acceptedForScope: false,
  };
}
