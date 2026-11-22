/**
 * U41 — Scientific Companion (text-first) soft-land catalog.
 *
 * Phase-2 vision milestone: evidence-grounded conversational turns on KG /
 * interrogative services. Never claims voice, avatar, networking, scientific
 * approval, or unfenced LLM free-text.
 */

export const HSI_SCIENTIFIC_COMPANION_SOFT_LAND_SCHEMA =
  "hsi-scientific-companion-soft-land-1" as const;

export type HsiScientificCompanionSurfaceId =
  | "text_discuss_turn"
  | "text_critique_turn"
  | "text_experiment_planning_turn"
  | "kg_interrogative_reuse"
  | "research_ui_shell"
  | "voice_avatar"
  | "networking_matching";

export type HsiScientificCompanionSurfaceRow = {
  surface: HsiScientificCompanionSurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  phase: 2 | 3 | 4 | 5;
  scientificApproval: false;
  notes: string;
};

export type HsiScientificCompanionSoftLandPacket = {
  schemaVersion: typeof HSI_SCIENTIFIC_COMPANION_SOFT_LAND_SCHEMA;
  purpose: "hsi_scientific_companion_text_first_u41";
  backlogId: "HSI-U41-SCIENTIFIC-COMPANION";
  visionPhase: 2;
  scientificApproval: false;
  voiceEnabled: false;
  avatarEnabled: false;
  networkingMatchingEnabled: false;
  llmUnfencedFreeText: false;
  gateCAutoApprove: false;
  productionWritesEnabled: false;
  surfaces: readonly HsiScientificCompanionSurfaceRow[];
  reuseModules: readonly string[];
  softLandDocPath: "docs/engineering/HSI_U41_SCIENTIFIC_COMPANION_TEXT_FIRST_2026-11-21.md";
  honesty: {
    textFirstOnly: true;
    sameServicesAsWorkbench: true;
    noAvatar: true;
    noVoice: true;
    noNetworking: true;
    noUnfencedLlm: true;
    noScientificApproval: true;
  };
};

const SURFACES: readonly HsiScientificCompanionSurfaceRow[] = [
  {
    surface: "text_discuss_turn",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    phase: 2,
    scientificApproval: false,
    notes: "Deterministic discuss turn over interrogative plan + missing evidence.",
  },
  {
    surface: "text_critique_turn",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    phase: 2,
    scientificApproval: false,
    notes: "Critique turn reuses evaluateSscFalsification — not SME gold.",
  },
  {
    surface: "text_experiment_planning_turn",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    phase: 2,
    scientificApproval: false,
    notes: "Experiment planning surfaces branch falsification tests as next steps.",
  },
  {
    surface: "kg_interrogative_reuse",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    phase: 2,
    scientificApproval: false,
    notes: "Companion composes existing interrogativeQuestionEngine / falsification engines.",
  },
  {
    surface: "research_ui_shell",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    phase: 2,
    scientificApproval: false,
    notes: "/research/companion text UI shell — no avatar chrome.",
  },
  {
    surface: "voice_avatar",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    phase: 3,
    scientificApproval: false,
    notes: "Voice + Nuance-style avatar remain Phase 3; privacy/provider gates first.",
  },
  {
    surface: "networking_matching",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    phase: 4,
    scientificApproval: false,
    notes: "Researcher/lab matching is Phase 4–5 — not part of U41.",
  },
];

const REUSE_MODULES: readonly string[] = [
  "src/interrogativeQuestionEngine.ts",
  "src/interrogativeFalsificationEngine.ts",
  "src/hsiScientificCompanionRuntime.ts",
  "src/hsiLiveScientificPlatformRuntime.ts",
  "docs/strategy/HSI_END_TO_END_VISION_AND_USER_JOURNEY.md",
];

export function hsiScientificCompanionSoftLandPacket(): HsiScientificCompanionSoftLandPacket {
  return {
    schemaVersion: HSI_SCIENTIFIC_COMPANION_SOFT_LAND_SCHEMA,
    purpose: "hsi_scientific_companion_text_first_u41",
    backlogId: "HSI-U41-SCIENTIFIC-COMPANION",
    visionPhase: 2,
    scientificApproval: false,
    voiceEnabled: false,
    avatarEnabled: false,
    networkingMatchingEnabled: false,
    llmUnfencedFreeText: false,
    gateCAutoApprove: false,
    productionWritesEnabled: false,
    surfaces: SURFACES,
    reuseModules: REUSE_MODULES,
    softLandDocPath: "docs/engineering/HSI_U41_SCIENTIFIC_COMPANION_TEXT_FIRST_2026-11-21.md",
    honesty: {
      textFirstOnly: true,
      sameServicesAsWorkbench: true,
      noAvatar: true,
      noVoice: true,
      noNetworking: true,
      noUnfencedLlm: true,
      noScientificApproval: true,
    },
  };
}

export function hsiScientificCompanionSurfaceById(
  surface: HsiScientificCompanionSurfaceId,
): HsiScientificCompanionSurfaceRow {
  switch (surface) {
    case "text_discuss_turn":
    case "text_critique_turn":
    case "text_experiment_planning_turn":
    case "kg_interrogative_reuse":
    case "research_ui_shell":
    case "voice_avatar":
    case "networking_matching": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing U41 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown U41 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsiScientificCompanionSoftLand(
  packet: HsiScientificCompanionSoftLandPacket = hsiScientificCompanionSoftLandPacket(),
): {
  surfaceCount: number;
  voiceEnabled: false;
  avatarEnabled: false;
  scientificApproval: false;
} {
  if (packet.schemaVersion !== HSI_SCIENTIFIC_COMPANION_SOFT_LAND_SCHEMA) {
    throw new Error("unexpected U41 schema");
  }
  if (packet.visionPhase !== 2) {
    throw new Error("U41 must bind vision Phase 2");
  }
  if (
    packet.voiceEnabled !== false ||
    packet.avatarEnabled !== false ||
    packet.networkingMatchingEnabled !== false ||
    packet.llmUnfencedFreeText !== false ||
    packet.scientificApproval !== false ||
    packet.gateCAutoApprove !== false ||
    packet.productionWritesEnabled !== false
  ) {
    throw new Error("U41 soft-land must keep voice, avatar, networking, LLM free-text, approval, Gate C, and writes closed");
  }
  if (packet.surfaces.length !== 7) {
    throw new Error("expected seven U41 surfaces");
  }
  const avatar = packet.surfaces.find((s) => s.surface === "voice_avatar");
  if (!avatar || avatar.engineeringReady !== false) {
    throw new Error("voice/avatar must stay Phase 3 owner-gated");
  }
  return {
    surfaceCount: packet.surfaces.length,
    voiceEnabled: false,
    avatarEnabled: false,
    scientificApproval: false,
  };
}
