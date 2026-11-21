/**
 * HSI 1.0 — owner-gate worksheet soft-land.
 *
 * Maps acceptance checklist #5–#8 to existing E2E / NEXT / Track B packets.
 * Never invents staging URLs, isolation signers, SME gold, or signed pilot.
 */

export const HSI_10_OWNER_GATES_SCHEMA =
  "hsi-1-0-owner-gates-worksheet-1" as const;

export type Hsi10OwnerGateId =
  | "acceptance_5_staging_save_reopen"
  | "acceptance_6_two_user_isolation"
  | "acceptance_7_expert_benchmark"
  | "acceptance_8_decision_brief_pilot";

export type Hsi10OwnerGateDisposition =
  | "reuse_soft_land"
  | "owner_gated"
  | "blocked_until_human_8_next_f";

export type Hsi10OwnerGateRow = {
  gate: Hsi10OwnerGateId;
  checklistItem: 5 | 6 | 7 | 8;
  disposition: Hsi10OwnerGateDisposition;
  acceptedForScope: false;
  signedPacketClaimed: false;
  pilotReadinessClaimed: false;
  scientificApproval: false;
  pathHints: readonly string[];
  notes: string;
};

export type Hsi10SuiteMode = "check" | "fixture";

export type Hsi10OwnerGatesPacket = {
  schemaVersion: typeof HSI_10_OWNER_GATES_SCHEMA;
  purpose: "hsi_1_0_owner_gates_worksheet";
  backlogId: "HSI-1.0-OWNER-GATES";
  scientificApproval: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  pilotReadinessClaimed: false;
  productionWritesEnabled: false;
  gateCAutoApprove: false;
  inventedSigner: false;
  inventedStagingUrl: false;
  inventedSmeGold: false;
  inventedPilotInvite: false;
  ciSafeModes: readonly Hsi10SuiteMode[];
  gates: readonly Hsi10OwnerGateRow[];
  reuseModules: readonly string[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/hsi-10-owner-gates.pending.json";
  softLandDocPath: "docs/engineering/HSI_1_0_OWNER_GATES_WORKSHEET_2026-11-20.md";
  acceptanceStatusDocPath: "docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md";
  honesty: {
    catalogsExistAcceptanceBlocked: true;
    noInventedSigner: true;
    noInventedStagingUrl: true;
    noInventedSmeGold: true;
    noInventedPilotInvite: true;
    noProductionWrites: true;
    noGateCAutoApprove: true;
    fixtureIsNotOwnerAcceptance: true;
    pilotRequiresHuman8NextF: true;
  };
};

export type Hsi10OwnerGatesAssessment = {
  schemaVersion: "hsi-1-0-owner-gates-assessment-1";
  suiteMode: Hsi10SuiteMode;
  mayClaimOwnerAcceptance: false;
  mayEnableProductionWrites: false;
  mayInventSmeGold: false;
  mayInvitePilotResearchers: false;
  mayClaimScientificApproval: false;
  ciSafe: true;
  reasons: string[];
  acceptedForScope: false;
  pilotReadinessClaimed: false;
};

const GATES: readonly Hsi10OwnerGateRow[] = [
  {
    gate: "acceptance_5_staging_save_reopen",
    checklistItem: 5,
    disposition: "reuse_soft_land",
    acceptedForScope: false,
    signedPacketClaimed: false,
    pilotReadinessClaimed: false,
    scientificApproval: false,
    pathHints: [
      "src/operations/e2e05StagingSaveResume.ts",
      "operations/staging/e2e-05-staging-save-resume.pending.json",
      "docs/engineering/E2E_05_STAGING_SAVE_RESUME_SOFT_LAND.md",
    ],
    notes:
      "Device-local library remains default. Staging save/reopen needs Human #5 write packet; held migrations 022–033 stay closed.",
  },
  {
    gate: "acceptance_6_two_user_isolation",
    checklistItem: 6,
    disposition: "reuse_soft_land",
    acceptedForScope: false,
    signedPacketClaimed: false,
    pilotReadinessClaimed: false,
    scientificApproval: false,
    pathHints: [
      "src/operations/nextBIsolationSoftLand.ts",
      "src/operations/e2eIsolationAcceptancePacket.ts",
      "operations/staging/next-b-isolation-soft-land.pending.json",
      "operations/staging/e2e-02-isolation-acceptance.pending.json",
      "docs/engineering/NEXT_B_ISOLATION_SOFT_LAND.md",
    ],
    notes:
      "Isolation catalogs exist. Two-user staging HTTP proof needs Human #3 isolation signer.",
  },
  {
    gate: "acceptance_7_expert_benchmark",
    checklistItem: 7,
    disposition: "reuse_soft_land",
    acceptedForScope: false,
    signedPacketClaimed: false,
    pilotReadinessClaimed: false,
    scientificApproval: false,
    pathHints: [
      "src/operations/e2e10SmeGoldVault.ts",
      "src/operations/nextDExpertVaultFreezeSoftLand.ts",
      "operations/staging/e2e-10-sme-gold-vault.pending.json",
      "operations/staging/next-d-expert-vault-freeze.pending.json",
      "docs/engineering/E2E_10_SME_GOLD_VAULT_SOFT_LAND.md",
    ],
    notes:
      "Gold harness scaffolding exists. Expert adjudication needs Human #4 SME gold vault — soft-land never invents labels.",
  },
  {
    gate: "acceptance_8_decision_brief_pilot",
    checklistItem: 8,
    disposition: "blocked_until_human_8_next_f",
    acceptedForScope: false,
    signedPacketClaimed: false,
    pilotReadinessClaimed: false,
    scientificApproval: false,
    pathHints: [
      "src/operations/nextFSoakPilotReleaseSoftLand.ts",
      "operations/staging/next-f-soak-pilot-release.pending.json",
      "docs/engineering/NEXT_F_SOAK_PILOT_RELEASE_SOFT_LAND.md",
      "docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md",
    ],
    notes:
      "Brief UI engineering surface is ready. Controlled researcher pilot only after Human #8 / NEXT-F operational acceptance.",
  },
];

const REUSE_MODULES: readonly string[] = [
  "src/operations/hsi10OwnerPacketsScaffold.ts",
  "src/operations/e2e03SourceClearanceComposition.ts",
  "src/operations/e2e05StagingSaveResume.ts",
  "src/operations/nextBIsolationSoftLand.ts",
  "src/operations/e2eIsolationAcceptancePacket.ts",
  "src/operations/e2e10SmeGoldVault.ts",
  "src/operations/nextDExpertVaultFreezeSoftLand.ts",
  "src/operations/nextFSoakPilotReleaseSoftLand.ts",
  "src/operations/trackBOwnerGates.ts",
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Close Human #2 clearance via U6 owner-packets scaffold without inventing MoUs or authorities.",
  "Close Human #5 staging write packet without lifting held migrations 022–033 unless explicitly authorised.",
  "Name Human #3 isolation signer and retain two-user staging HTTP evidence.",
  "Populate Human #4 SME gold vault with expert-adjudicated labels — never invent gold in git.",
  "Accept Human #8 / NEXT-F operational soak and signed invite-only pilot before checklist #8 researcher invites.",
  "Keep productionWritesEnabled false and Gate C auto-approve forbidden until owner packets say otherwise.",
];

export function hsi10OwnerGatesPacket(): Hsi10OwnerGatesPacket {
  return {
    schemaVersion: HSI_10_OWNER_GATES_SCHEMA,
    purpose: "hsi_1_0_owner_gates_worksheet",
    backlogId: "HSI-1.0-OWNER-GATES",
    scientificApproval: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    pilotReadinessClaimed: false,
    productionWritesEnabled: false,
    gateCAutoApprove: false,
    inventedSigner: false,
    inventedStagingUrl: false,
    inventedSmeGold: false,
    inventedPilotInvite: false,
    ciSafeModes: ["check", "fixture"],
    gates: GATES,
    reuseModules: REUSE_MODULES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/hsi-10-owner-gates.pending.json",
    softLandDocPath: "docs/engineering/HSI_1_0_OWNER_GATES_WORKSHEET_2026-11-20.md",
    acceptanceStatusDocPath: "docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md",
    honesty: {
      catalogsExistAcceptanceBlocked: true,
      noInventedSigner: true,
      noInventedStagingUrl: true,
      noInventedSmeGold: true,
      noInventedPilotInvite: true,
      noProductionWrites: true,
      noGateCAutoApprove: true,
      fixtureIsNotOwnerAcceptance: true,
      pilotRequiresHuman8NextF: true,
    },
  };
}

export function hsi10OwnerGateById(gate: Hsi10OwnerGateId): Hsi10OwnerGateRow {
  switch (gate) {
    case "acceptance_5_staging_save_reopen":
    case "acceptance_6_two_user_isolation":
    case "acceptance_7_expert_benchmark":
    case "acceptance_8_decision_brief_pilot": {
      const row = GATES.find((g) => g.gate === gate);
      if (!row) throw new Error(`Missing HSI 1.0 owner gate: ${gate}`);
      return row;
    }
    default: {
      const _exhaustive: never = gate;
      throw new Error(`Unknown HSI 1.0 owner gate: ${String(_exhaustive)}`);
    }
  }
}

export function assessHsi10OwnerGatesMode(
  mode: Hsi10SuiteMode,
): Hsi10OwnerGatesAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-1-0-owner-gates-assessment-1",
        suiteMode: mode,
        mayClaimOwnerAcceptance: false,
        mayEnableProductionWrites: false,
        mayInventSmeGold: false,
        mayInvitePilotResearchers: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "check mode validates worksheet honesty only",
          "acceptance #5–#8 stay owner-gated",
          "pilot invites require Human #8 / NEXT-F first",
        ],
        acceptedForScope: false,
        pilotReadinessClaimed: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-1-0-owner-gates-assessment-1",
        suiteMode: mode,
        mayClaimOwnerAcceptance: false,
        mayEnableProductionWrites: false,
        mayInventSmeGold: false,
        mayInvitePilotResearchers: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "fixture green reuses existing soft-land unit tests only",
          "fixture green is not staging persistence, isolation, SME gold, or signed pilot",
        ],
        acceptedForScope: false,
        pilotReadinessClaimed: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown HSI 1.0 suite mode: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsi10OwnerGatesWorksheet(
  packet: Hsi10OwnerGatesPacket,
): {
  gateCount: number;
  acceptedForScope: false;
  pilotReadinessClaimed: false;
  signedPacketClaimed: false;
} {
  if (packet.schemaVersion !== HSI_10_OWNER_GATES_SCHEMA) {
    throw new Error("unexpected HSI 1.0 owner-gates schema");
  }
  if (packet.backlogId !== "HSI-1.0-OWNER-GATES") {
    throw new Error("soft-land must bind HSI-1.0-OWNER-GATES");
  }
  if (
    packet.acceptedForScope !== false ||
    packet.signedPacketClaimed !== false ||
    packet.pilotReadinessClaimed !== false
  ) {
    throw new Error("soft-land must keep acceptance and pilot claims false");
  }
  if (packet.scientificApproval !== false) {
    throw new Error("soft-land must not claim scientific approval");
  }
  if (packet.productionWritesEnabled !== false || packet.gateCAutoApprove !== false) {
    throw new Error("soft-land must keep writes and Gate C auto-approve false");
  }
  if (
    packet.inventedSigner !== false ||
    packet.inventedStagingUrl !== false ||
    packet.inventedSmeGold !== false ||
    packet.inventedPilotInvite !== false
  ) {
    throw new Error("soft-land must not invent signer, staging URL, SME gold, or pilot invite");
  }
  if (packet.gates.length !== 4) {
    throw new Error("expected four HSI 1.0 owner gates (#5–#8)");
  }
  for (const gate of packet.gates) {
    if (
      gate.acceptedForScope !== false ||
      gate.signedPacketClaimed !== false ||
      gate.pilotReadinessClaimed !== false ||
      gate.scientificApproval !== false
    ) {
      throw new Error(`gate ${gate.gate} must keep acceptance claims false`);
    }
  }
  const eight = packet.gates.find((g) => g.checklistItem === 8);
  if (!eight || eight.disposition !== "blocked_until_human_8_next_f") {
    throw new Error("checklist #8 must stay blocked until Human #8 / NEXT-F");
  }
  return {
    gateCount: packet.gates.length,
    acceptedForScope: false,
    pilotReadinessClaimed: false,
    signedPacketClaimed: false,
  };
}
