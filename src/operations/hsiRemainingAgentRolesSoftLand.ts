/**
 * U44 — remaining ARCH-003 roles soft-land (entity_resolver / graph_reasoner / interrogator).
 *
 * Closes the U39 gap by checkpointing the last catalogue roles under pipeline
 * `full_ssc`. Never claims LLM execution, Gate C, PHI, Neon live E2E, or
 * scientific approval.
 */

export const HSI_REMAINING_AGENT_ROLES_SOFT_LAND_SCHEMA =
  "hsi-remaining-agent-roles-soft-land-1" as const;

export type HsiRemainingAgentRolesSurfaceId =
  | "entity_resolver_checkpoint"
  | "graph_reasoner_checkpoint"
  | "interrogator_checkpoint"
  | "full_ssc_pipeline"
  | "llm_execution"
  | "neon_live_multiprocess"
  | "scientific_approval";

export type HsiRemainingAgentRolesSurfaceRow = {
  surface: HsiRemainingAgentRolesSurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  scientificApproval: false;
  notes: string;
};

export type HsiRemainingAgentRolesSoftLandPacket = {
  schemaVersion: typeof HSI_REMAINING_AGENT_ROLES_SOFT_LAND_SCHEMA;
  purpose: "hsi_remaining_agent_roles_u44";
  backlogId: "HSI-U44-REMAINING-AGENT-ROLES";
  buildsOn: readonly ["HSI-U35-RESEARCH-AGENT-RUNTIME", "HSI-U39-EXPANDED-RESEARCH-AGENT-ROLES"];
  pipeline: "full_ssc";
  scientificApproval: false;
  llmExecution: false;
  gateCAutoApprove: false;
  phiAllowed: false;
  implementedAsLiveMultiProcessE2E: false;
  surfaces: readonly HsiRemainingAgentRolesSurfaceRow[];
  softLandDocPath: "docs/engineering/HSI_U44_REMAINING_AGENT_ROLES_2026-11-22.md";
  honesty: {
    deterministicAdaptersOnly: true;
    noLlm: true;
    noGateC: true;
    noPhi: true;
    noNeonLiveE2E: true;
    noScientificApproval: true;
  };
};

const SURFACES: readonly HsiRemainingAgentRolesSurfaceRow[] = [
  {
    surface: "entity_resolver_checkpoint",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    scientificApproval: false,
    notes: "Resolves planned branch/focus entities from the interrogative draft.",
  },
  {
    surface: "graph_reasoner_checkpoint",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    scientificApproval: false,
    notes: "Mechanism summary over planned branches — not graph publication.",
  },
  {
    surface: "interrogator_checkpoint",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    scientificApproval: false,
    notes: "Deterministic next-question brief from missing evidence.",
  },
  {
    surface: "full_ssc_pipeline",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    scientificApproval: false,
    notes: "pipeline: full_ssc wires all ARCH-003 catalogue roles behind checkpoints.",
  },
  {
    surface: "llm_execution",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "No model execution in this soft-land.",
  },
  {
    surface: "neon_live_multiprocess",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "Neon live multi-process E2E remains owner-gated (U38).",
  },
  {
    surface: "scientific_approval",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    scientificApproval: false,
    notes: "Scientific approval / Gate C remain closed.",
  },
];

export function hsiRemainingAgentRolesSoftLandPacket(): HsiRemainingAgentRolesSoftLandPacket {
  return {
    schemaVersion: HSI_REMAINING_AGENT_ROLES_SOFT_LAND_SCHEMA,
    purpose: "hsi_remaining_agent_roles_u44",
    backlogId: "HSI-U44-REMAINING-AGENT-ROLES",
    buildsOn: ["HSI-U35-RESEARCH-AGENT-RUNTIME", "HSI-U39-EXPANDED-RESEARCH-AGENT-ROLES"],
    pipeline: "full_ssc",
    scientificApproval: false,
    llmExecution: false,
    gateCAutoApprove: false,
    phiAllowed: false,
    implementedAsLiveMultiProcessE2E: false,
    surfaces: SURFACES,
    softLandDocPath: "docs/engineering/HSI_U44_REMAINING_AGENT_ROLES_2026-11-22.md",
    honesty: {
      deterministicAdaptersOnly: true,
      noLlm: true,
      noGateC: true,
      noPhi: true,
      noNeonLiveE2E: true,
      noScientificApproval: true,
    },
  };
}

export function hsiRemainingAgentRolesSurfaceById(
  surface: HsiRemainingAgentRolesSurfaceId,
): HsiRemainingAgentRolesSurfaceRow {
  switch (surface) {
    case "entity_resolver_checkpoint":
    case "graph_reasoner_checkpoint":
    case "interrogator_checkpoint":
    case "full_ssc_pipeline":
    case "llm_execution":
    case "neon_live_multiprocess":
    case "scientific_approval": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing U44 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown U44 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsiRemainingAgentRolesSoftLand(
  packet: HsiRemainingAgentRolesSoftLandPacket = hsiRemainingAgentRolesSoftLandPacket(),
): {
  surfaceCount: number;
  llmExecution: false;
  scientificApproval: false;
  implementedAsLiveMultiProcessE2E: false;
} {
  if (packet.schemaVersion !== HSI_REMAINING_AGENT_ROLES_SOFT_LAND_SCHEMA) {
    throw new Error("unexpected U44 schema");
  }
  if (packet.backlogId !== "HSI-U44-REMAINING-AGENT-ROLES") {
    throw new Error("soft-land must bind HSI-U44-REMAINING-AGENT-ROLES");
  }
  if (
    packet.scientificApproval !== false ||
    packet.llmExecution !== false ||
    packet.gateCAutoApprove !== false ||
    packet.phiAllowed !== false ||
    packet.implementedAsLiveMultiProcessE2E !== false
  ) {
    throw new Error("U44 soft-land must keep LLM, Gate C, PHI, Neon live E2E, and scientific approval closed");
  }
  if (packet.surfaces.length !== 7) {
    throw new Error("expected seven U44 surfaces");
  }
  const llm = packet.surfaces.find((s) => s.surface === "llm_execution");
  if (!llm || llm.engineeringReady !== false) {
    throw new Error("LLM execution must stay gated");
  }
  return {
    surfaceCount: packet.surfaces.length,
    llmExecution: false,
    scientificApproval: false,
    implementedAsLiveMultiProcessE2E: false,
  };
}
