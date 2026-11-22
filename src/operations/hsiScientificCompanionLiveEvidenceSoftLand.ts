/**
 * U42 — Scientific Companion live-evidence binding soft-land.
 *
 * Deepens U41 text-first companion turns with caller-supplied public literature
 * metadata. Never performs network retrieval inside the companion turn, never
 * claims claim-verified science, voice, avatar, or networking.
 */

export const HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_SOFT_LAND_SCHEMA =
  "hsi-scientific-companion-live-evidence-soft-land-1" as const;

export type HsiScientificCompanionLiveEvidenceSurfaceId =
  | "bind_caller_supplied_records"
  | "cite_in_discuss_critique_plan"
  | "workspace_handoff_path"
  | "companion_network_retrieval"
  | "claim_verification"
  | "voice_avatar"
  | "networking_matching";

export type HsiScientificCompanionLiveEvidenceSurfaceRow = {
  surface: HsiScientificCompanionLiveEvidenceSurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  phase: 2 | 3 | 4 | 5;
  scientificApproval: false;
  notes: string;
};

export type HsiScientificCompanionLiveEvidenceSoftLandPacket = {
  schemaVersion: typeof HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_SOFT_LAND_SCHEMA;
  purpose: "hsi_scientific_companion_live_evidence_u42";
  backlogId: "HSI-U42-COMPANION-LIVE-EVIDENCE";
  buildsOn: "HSI-U41-SCIENTIFIC-COMPANION";
  visionPhase: 2;
  scientificApproval: false;
  companionPerformsNetworkRetrieval: false;
  claimVerificationAuthorized: false;
  voiceEnabled: false;
  avatarEnabled: false;
  networkingMatchingEnabled: false;
  llmUnfencedFreeText: false;
  gateCAutoApprove: false;
  productionWritesEnabled: false;
  surfaces: readonly HsiScientificCompanionLiveEvidenceSurfaceRow[];
  softLandDocPath: "docs/engineering/HSI_U42_COMPANION_LIVE_EVIDENCE_2026-11-22.md";
  honesty: {
    callerSuppliedOnly: true;
    noNetworkInCompanionTurn: true;
    notClaimVerified: true;
    noAvatar: true;
    noVoice: true;
    noNetworking: true;
    noUnfencedLlm: true;
    noScientificApproval: true;
  };
};

const SURFACES: readonly HsiScientificCompanionLiveEvidenceSurfaceRow[] = [
  {
    surface: "bind_caller_supplied_records",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    phase: 2,
    scientificApproval: false,
    notes: "Accept pre-fetched public metadata records into a companion turn.",
  },
  {
    surface: "cite_in_discuss_critique_plan",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    phase: 2,
    scientificApproval: false,
    notes: "Surface bound records as citations in discuss / critique / experiment_planning.",
  },
  {
    surface: "workspace_handoff_path",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    phase: 2,
    scientificApproval: false,
    notes: "UI can paste workspace-retrieved metadata; companion does not call providers.",
  },
  {
    surface: "companion_network_retrieval",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    phase: 2,
    scientificApproval: false,
    notes: "Network retrieval stays outside the companion turn (workbench / live sources).",
  },
  {
    surface: "claim_verification",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    phase: 2,
    scientificApproval: false,
    notes: "Bound records remain metadata_retrieved_not_claim_verified.",
  },
  {
    surface: "voice_avatar",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    phase: 3,
    scientificApproval: false,
    notes: "Voice / avatar remain Phase 3.",
  },
  {
    surface: "networking_matching",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    phase: 4,
    scientificApproval: false,
    notes: "Networking / matching remain Phase 4–5.",
  },
];

export function hsiScientificCompanionLiveEvidenceSoftLandPacket(): HsiScientificCompanionLiveEvidenceSoftLandPacket {
  return {
    schemaVersion: HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_SOFT_LAND_SCHEMA,
    purpose: "hsi_scientific_companion_live_evidence_u42",
    backlogId: "HSI-U42-COMPANION-LIVE-EVIDENCE",
    buildsOn: "HSI-U41-SCIENTIFIC-COMPANION",
    visionPhase: 2,
    scientificApproval: false,
    companionPerformsNetworkRetrieval: false,
    claimVerificationAuthorized: false,
    voiceEnabled: false,
    avatarEnabled: false,
    networkingMatchingEnabled: false,
    llmUnfencedFreeText: false,
    gateCAutoApprove: false,
    productionWritesEnabled: false,
    surfaces: SURFACES,
    softLandDocPath: "docs/engineering/HSI_U42_COMPANION_LIVE_EVIDENCE_2026-11-22.md",
    honesty: {
      callerSuppliedOnly: true,
      noNetworkInCompanionTurn: true,
      notClaimVerified: true,
      noAvatar: true,
      noVoice: true,
      noNetworking: true,
      noUnfencedLlm: true,
      noScientificApproval: true,
    },
  };
}

export function hsiScientificCompanionLiveEvidenceSurfaceById(
  surface: HsiScientificCompanionLiveEvidenceSurfaceId,
): HsiScientificCompanionLiveEvidenceSurfaceRow {
  switch (surface) {
    case "bind_caller_supplied_records":
    case "cite_in_discuss_critique_plan":
    case "workspace_handoff_path":
    case "companion_network_retrieval":
    case "claim_verification":
    case "voice_avatar":
    case "networking_matching": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing U42 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown U42 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsiScientificCompanionLiveEvidenceSoftLand(
  packet: HsiScientificCompanionLiveEvidenceSoftLandPacket = hsiScientificCompanionLiveEvidenceSoftLandPacket(),
): {
  surfaceCount: number;
  companionPerformsNetworkRetrieval: false;
  claimVerificationAuthorized: false;
  voiceEnabled: false;
  scientificApproval: false;
} {
  if (packet.schemaVersion !== HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_SOFT_LAND_SCHEMA) {
    throw new Error("unexpected U42 schema");
  }
  if (packet.backlogId !== "HSI-U42-COMPANION-LIVE-EVIDENCE") {
    throw new Error("soft-land must bind HSI-U42-COMPANION-LIVE-EVIDENCE");
  }
  if (
    packet.scientificApproval !== false ||
    packet.companionPerformsNetworkRetrieval !== false ||
    packet.claimVerificationAuthorized !== false ||
    packet.voiceEnabled !== false ||
    packet.avatarEnabled !== false ||
    packet.networkingMatchingEnabled !== false ||
    packet.llmUnfencedFreeText !== false ||
    packet.gateCAutoApprove !== false ||
    packet.productionWritesEnabled !== false
  ) {
    throw new Error("U42 soft-land must keep retrieval, verification, voice, avatar, networking, writes, and Gate C closed");
  }
  if (packet.surfaces.length !== 7) {
    throw new Error("expected seven U42 surfaces");
  }
  const retrieval = packet.surfaces.find((s) => s.surface === "companion_network_retrieval");
  if (!retrieval || retrieval.engineeringReady !== false) {
    throw new Error("companion network retrieval must stay gated");
  }
  return {
    surfaceCount: packet.surfaces.length,
    companionPerformsNetworkRetrieval: false,
    claimVerificationAuthorized: false,
    voiceEnabled: false,
    scientificApproval: false,
  };
}
