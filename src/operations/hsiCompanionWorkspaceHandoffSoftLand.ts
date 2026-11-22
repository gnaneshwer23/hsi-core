/**
 * U45 — Companion ↔ workspace evidence handoff soft-land.
 */

export const HSI_COMPANION_WORKSPACE_HANDOFF_SOFT_LAND_SCHEMA =
  "hsi-companion-workspace-handoff-soft-land-1" as const;

export type HsiCompanionWorkspaceHandoffSurfaceId =
  | "map_live_records"
  | "map_candidates"
  | "curated_scenario_fixture"
  | "companion_ui_handoff"
  | "companion_network_retrieval"
  | "claim_verification"
  | "voice_avatar_networking";

export type HsiCompanionWorkspaceHandoffSurfaceRow = {
  surface: HsiCompanionWorkspaceHandoffSurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  phase: 2 | 3 | 4 | 5;
  scientificApproval: false;
  notes: string;
};

export type HsiCompanionWorkspaceHandoffSoftLandPacket = {
  schemaVersion: typeof HSI_COMPANION_WORKSPACE_HANDOFF_SOFT_LAND_SCHEMA;
  purpose: "hsi_companion_workspace_handoff_u45";
  backlogId: "HSI-U45-COMPANION-WORKSPACE-HANDOFF";
  buildsOn: readonly ["HSI-U41-SCIENTIFIC-COMPANION", "HSI-U42-COMPANION-LIVE-EVIDENCE"];
  visionPhase: 2;
  scientificApproval: false;
  companionPerformsNetworkRetrieval: false;
  claimVerificationAuthorized: false;
  voiceEnabled: false;
  avatarEnabled: false;
  networkingMatchingEnabled: false;
  surfaces: readonly HsiCompanionWorkspaceHandoffSurfaceRow[];
  softLandDocPath: "docs/engineering/HSI_U45_COMPANION_WORKSPACE_HANDOFF_2026-11-22.md";
  honesty: {
    workspaceDerivedOnly: true;
    noNetworkInCompanion: true;
    notClaimVerified: true;
    fixturesAreIllustrative: true;
    noAvatar: true;
    noNetworking: true;
  };
};

const SURFACES: readonly HsiCompanionWorkspaceHandoffSurfaceRow[] = [
  {
    surface: "map_live_records",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    phase: 2,
    scientificApproval: false,
    notes: "Map LiveEvidenceRecord rows into companion bound evidence.",
  },
  {
    surface: "map_candidates",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    phase: 2,
    scientificApproval: false,
    notes: "Map extracted candidates into companion bound evidence (deduped by sourceId).",
  },
  {
    surface: "curated_scenario_fixture",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    phase: 2,
    scientificApproval: false,
    notes: "Illustrative fixture for curated scenarios when no live rows are supplied.",
  },
  {
    surface: "companion_ui_handoff",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    phase: 2,
    scientificApproval: false,
    notes: "/research/companion?from=workspace&scenario=… loads handoff into the turn.",
  },
  {
    surface: "companion_network_retrieval",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    phase: 2,
    scientificApproval: false,
    notes: "Companion still does not call Europe PMC / OpenAlex itself.",
  },
  {
    surface: "claim_verification",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    phase: 2,
    scientificApproval: false,
    notes: "Handoff records stay metadata_retrieved_not_claim_verified.",
  },
  {
    surface: "voice_avatar_networking",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    phase: 3,
    scientificApproval: false,
    notes: "Voice / avatar / networking remain Phase 3+.",
  },
];

export function hsiCompanionWorkspaceHandoffSoftLandPacket(): HsiCompanionWorkspaceHandoffSoftLandPacket {
  return {
    schemaVersion: HSI_COMPANION_WORKSPACE_HANDOFF_SOFT_LAND_SCHEMA,
    purpose: "hsi_companion_workspace_handoff_u45",
    backlogId: "HSI-U45-COMPANION-WORKSPACE-HANDOFF",
    buildsOn: ["HSI-U41-SCIENTIFIC-COMPANION", "HSI-U42-COMPANION-LIVE-EVIDENCE"],
    visionPhase: 2,
    scientificApproval: false,
    companionPerformsNetworkRetrieval: false,
    claimVerificationAuthorized: false,
    voiceEnabled: false,
    avatarEnabled: false,
    networkingMatchingEnabled: false,
    surfaces: SURFACES,
    softLandDocPath: "docs/engineering/HSI_U45_COMPANION_WORKSPACE_HANDOFF_2026-11-22.md",
    honesty: {
      workspaceDerivedOnly: true,
      noNetworkInCompanion: true,
      notClaimVerified: true,
      fixturesAreIllustrative: true,
      noAvatar: true,
      noNetworking: true,
    },
  };
}

export function hsiCompanionWorkspaceHandoffSurfaceById(
  surface: HsiCompanionWorkspaceHandoffSurfaceId,
): HsiCompanionWorkspaceHandoffSurfaceRow {
  switch (surface) {
    case "map_live_records":
    case "map_candidates":
    case "curated_scenario_fixture":
    case "companion_ui_handoff":
    case "companion_network_retrieval":
    case "claim_verification":
    case "voice_avatar_networking": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing U45 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown U45 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsiCompanionWorkspaceHandoffSoftLand(
  packet: HsiCompanionWorkspaceHandoffSoftLandPacket = hsiCompanionWorkspaceHandoffSoftLandPacket(),
): {
  surfaceCount: number;
  companionPerformsNetworkRetrieval: false;
  scientificApproval: false;
} {
  if (packet.schemaVersion !== HSI_COMPANION_WORKSPACE_HANDOFF_SOFT_LAND_SCHEMA) {
    throw new Error("unexpected U45 schema");
  }
  if (packet.backlogId !== "HSI-U45-COMPANION-WORKSPACE-HANDOFF") {
    throw new Error("soft-land must bind HSI-U45-COMPANION-WORKSPACE-HANDOFF");
  }
  if (
    packet.scientificApproval !== false ||
    packet.companionPerformsNetworkRetrieval !== false ||
    packet.claimVerificationAuthorized !== false ||
    packet.voiceEnabled !== false ||
    packet.avatarEnabled !== false ||
    packet.networkingMatchingEnabled !== false
  ) {
    throw new Error("U45 soft-land must keep retrieval, verification, voice, avatar, and networking closed");
  }
  if (packet.surfaces.length !== 7) {
    throw new Error("expected seven U45 surfaces");
  }
  return {
    surfaceCount: packet.surfaces.length,
    companionPerformsNetworkRetrieval: false,
    scientificApproval: false,
  };
}
