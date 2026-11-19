/**
 * Track B — owner / human-gated soft-land.
 *
 * Catalogues B1–B5 gates that unblock live passages, migrations, dual review,
 * benchmark floors, and provider spend. Never invents signers, reviewer
 * identities, numeric caps, MoUs, or signed acceptance.
 */

export const TRACK_B_OWNER_GATES_SCHEMA =
  "hsi-track-b-owner-gates-1" as const;

export type TrackBSuiteMode = "check" | "fixture";

export type TrackBGateId = "B1" | "B2" | "B3" | "B4" | "B5";

export type TrackBGateDisposition =
  | "owner_policy_sign"
  | "owner_name_reviewer"
  | "owner_recruit_smes"
  | "owner_approve_floors"
  | "owner_set_caps";

export type TrackBGateRow = {
  gate: TrackBGateId;
  disposition: TrackBGateDisposition;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedAuthority: false;
  unblocks: string;
  pathHints: readonly string[];
  notes: string;
};

export type TrackBOwnerGatesPacket = {
  schemaVersion: typeof TRACK_B_OWNER_GATES_SCHEMA;
  purpose: "track_b_owner_gates_soft_land";
  backlogId: "Track-B";
  scientificApproval: false;
  pilotReadinessClaimed: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedSigner: false;
  inventedReviewerIdentities: false;
  inventedNumericCaps: false;
  inventedMoU: false;
  gateCAutoApprove: false;
  ciSafeModes: readonly TrackBSuiteMode[];
  reuseModules: readonly string[];
  gates: readonly TrackBGateRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/track-b-owner-gates.pending.json";
  softLandDocPath: "docs/engineering/TRACK_B_OWNER_GATES_SOFT_LAND.md";
  honesty: {
    noInventedSigner: true;
    noInventedReviewers: true;
    noInventedCaps: true;
    noInventedMoU: true;
    noPilotReadinessClaim: true;
    fixtureIsNotOwnerAcceptance: true;
  };
};

export type TrackBAssessment = {
  schemaVersion: "hsi-track-b-assessment-1";
  suiteMode: TrackBSuiteMode;
  mayInventSigner: false;
  mayInventReviewers: false;
  mayInventNumericCaps: false;
  mayClaimPilotReadiness: false;
  mayClaimAcceptance: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  acceptedForScope: false;
};

export type TrackBHonesty = {
  schemaVersion: "hsi-track-b-honesty-1";
  mustKeepPolicyDraftUntilOwnerSigns: true;
  mustKeepMigrationHoldsUntilDbReviewer: true;
  mustKeepDualReviewBlockedUntilSmes: true;
  mustKeepBenchmarkFloorsUnapproved: true;
  mustKeepSpendCapsUnsetInGit: true;
  reasons: string[];
};

const GATES: readonly TrackBGateRow[] = [
  {
    gate: "B1",
    disposition: "owner_policy_sign",
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedAuthority: false,
    unblocks: "Live passages, NEXT-A composition",
    pathHints: [
      "docs/SOURCE_CLEARANCE_POLICY_DRAFT.md",
      "docs/engineering/E2E_03_SOURCE_CLEARANCE_COMPOSITION_SOFT_LAND.md",
      "operations/staging/e2e-03-source-clearance.pending.json",
    ],
    notes: "DRAFT policy stays DRAFT until owner signs or explicitly defers; soft-land invents neither.",
  },
  {
    gate: "B2",
    disposition: "owner_name_reviewer",
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedAuthority: false,
    unblocks: "Applying consolidation / held migrations",
    pathHints: [
      "docs/engineering/E2E_02_ISOLATION_ACCEPTANCE_PACKET_SOFT_LAND.md",
      "operations/staging/next-b-acceptance.pending.json",
      "docs/engineering/DB_ISOLATION_SUITE_RUNBOOK.md",
    ],
    notes: "Independent DB reviewer identity is owner-named; holds stay unchanged in soft-land.",
  },
  {
    gate: "B3",
    disposition: "owner_recruit_smes",
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedAuthority: false,
    unblocks: "First reviewed slice + calibration",
    pathHints: [
      "docs/engineering/C3_DUAL_REVIEWER_DECISIONS_SOFT_LAND.md",
      "operations/staging/c3-dual-reviewer-decisions.pending.json",
      "docs/engineering/E2E_10_SME_GOLD_VAULT_SOFT_LAND.md",
    ],
    notes: "Immunology / metabolism / gut microbiome reviewers — never invent identities in git.",
  },
  {
    gate: "B4",
    disposition: "owner_approve_floors",
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedAuthority: false,
    unblocks: "Public /benchmark numbers",
    pathHints: [
      "docs/engineering/R2_GOLD_EVALUATION_SUITE_CHECKLIST.md",
      "docs/engineering/E2E_10_SME_GOLD_VAULT_SOFT_LAND.md",
    ],
    notes: "Benchmark floors stay unapproved; soft-land never invents scores or floors.",
  },
  {
    gate: "B5",
    disposition: "owner_set_caps",
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedAuthority: false,
    unblocks: "A1.2 / live verifier",
    pathHints: [
      "docs/engineering/A1_2_SEC02_KILL_SWITCH_SOFT_LAND.md",
      "src/operations/sec02KillSwitchCatalog.ts",
      "operations/staging/sec02-caps-dry-run.pending.json",
      "docs/engineering/E2E_06_DUAL_PROVIDER_VERIFICATION_SOFT_LAND.md",
    ],
    notes: "Provider spend caps and deployments stay owner-private; soft-land invents no numeric caps.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Sign or explicitly defer SOURCE_CLEARANCE_POLICY_DRAFT (B1) before live passage reuse.",
  "Name an independent DB reviewer (B2) before removing or applying held migrations.",
  "Recruit immunology, metabolism, and gut microbiome reviewers (B3) before dual-slice release.",
  "Approve benchmark floors privately (B4) before public /benchmark numbers.",
  "Record provider spend caps and approved deployments privately (B5); never commit secrets.",
  "Do not treat soft-land green as pilot readiness or signed acceptance.",
];

const REUSE_MODULES: readonly string[] = [
  "docs/SOURCE_CLEARANCE_POLICY_DRAFT.md",
  "docs/engineering/E2E_02_ISOLATION_ACCEPTANCE_PACKET_SOFT_LAND.md",
  "docs/engineering/E2E_03_SOURCE_CLEARANCE_COMPOSITION_SOFT_LAND.md",
  "docs/engineering/A1_2_SEC02_KILL_SWITCH_SOFT_LAND.md",
  "docs/engineering/E2E_06_DUAL_PROVIDER_VERIFICATION_SOFT_LAND.md",
  "docs/engineering/E2E_10_SME_GOLD_VAULT_SOFT_LAND.md",
  "docs/engineering/C3_DUAL_REVIEWER_DECISIONS_SOFT_LAND.md",
];

export function trackBOwnerGatesPacket(): TrackBOwnerGatesPacket {
  return {
    schemaVersion: TRACK_B_OWNER_GATES_SCHEMA,
    purpose: "track_b_owner_gates_soft_land",
    backlogId: "Track-B",
    scientificApproval: false,
    pilotReadinessClaimed: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedSigner: false,
    inventedReviewerIdentities: false,
    inventedNumericCaps: false,
    inventedMoU: false,
    gateCAutoApprove: false,
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    gates: GATES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/track-b-owner-gates.pending.json",
    softLandDocPath: "docs/engineering/TRACK_B_OWNER_GATES_SOFT_LAND.md",
    honesty: {
      noInventedSigner: true,
      noInventedReviewers: true,
      noInventedCaps: true,
      noInventedMoU: true,
      noPilotReadinessClaim: true,
      fixtureIsNotOwnerAcceptance: true,
    },
  };
}

export function trackBGateById(gate: TrackBGateId): TrackBGateRow {
  switch (gate) {
    case "B1":
    case "B2":
    case "B3":
    case "B4":
    case "B5": {
      const row = GATES.find((g) => g.gate === gate);
      if (!row) throw new Error(`Missing Track B gate: ${gate}`);
      return row;
    }
    default: {
      const _exhaustive: never = gate;
      throw new Error(`Unknown Track B gate: ${String(_exhaustive)}`);
    }
  }
}

export function assessTrackBMode(mode: TrackBSuiteMode): TrackBAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-track-b-assessment-1",
        suiteMode: mode,
        mayInventSigner: false,
        mayInventReviewers: false,
        mayInventNumericCaps: false,
        mayClaimPilotReadiness: false,
        mayClaimAcceptance: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "B1–B5 remain owner-gated; soft-land invents no authorities",
        ],
        scientificApproval: false,
        acceptedForScope: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-track-b-assessment-1",
        suiteMode: mode,
        mayInventSigner: false,
        mayInventReviewers: false,
        mayInventNumericCaps: false,
        mayClaimPilotReadiness: false,
        mayClaimAcceptance: false,
        ciSafe: true,
        reasons: [
          "fixture gate catalogs use UNASSIGNED refs only",
          "fixture green is not signed policy, dual review, or spend-cap acceptance",
        ],
        scientificApproval: false,
        acceptedForScope: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown Track B suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Owner-gate honesty for Track B soft-land. */
export function assessTrackBHonesty(): TrackBHonesty {
  return {
    schemaVersion: "hsi-track-b-honesty-1",
    mustKeepPolicyDraftUntilOwnerSigns: true,
    mustKeepMigrationHoldsUntilDbReviewer: true,
    mustKeepDualReviewBlockedUntilSmes: true,
    mustKeepBenchmarkFloorsUnapproved: true,
    mustKeepSpendCapsUnsetInGit: true,
    reasons: [
      "SOURCE_CLEARANCE_POLICY_DRAFT stays DRAFT without owner signature or deferral",
      "Held migrations 022–033 stay held until an independent DB reviewer is named",
      "Dual-reviewed edges and SME gold stay at zero until B3 humans exist",
      "Public benchmark numbers require approved floors (B4)",
      "Numeric provider spend caps belong in private env / console (B5), not git",
    ],
  };
}

export function assertTrackBOwnerGatesSoftLand(
  packet: TrackBOwnerGatesPacket,
): {
  gateCount: number;
  pilotReadinessClaimed: false;
  acceptedForScope: false;
  scientificApproval: false;
} {
  if (packet.schemaVersion !== TRACK_B_OWNER_GATES_SCHEMA) {
    throw new Error("unexpected Track B owner-gates schema");
  }
  if (packet.pilotReadinessClaimed !== false) {
    throw new Error("soft-land must not claim pilot readiness");
  }
  if (packet.acceptedForScope !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim acceptance or signed packet");
  }
  if (packet.scientificApproval !== false || packet.gateCAutoApprove !== false) {
    throw new Error("soft-land must not claim scientific approval or Gate C auto-approve");
  }
  if (
    packet.inventedSigner !== false ||
    packet.inventedReviewerIdentities !== false ||
    packet.inventedNumericCaps !== false ||
    packet.inventedMoU !== false
  ) {
    throw new Error("soft-land must not invent signer, reviewers, caps, or MoU");
  }
  if (packet.gates.length !== 5) throw new Error("expected five Track B gates");
  for (const gate of packet.gates) {
    if (gate.acceptedForScope !== false || gate.signedPacketClaimed !== false) {
      throw new Error(`gate ${gate.gate} must not claim acceptance`);
    }
    if (gate.inventedAuthority !== false) {
      throw new Error(`gate ${gate.gate} must not invent authority`);
    }
  }
  return {
    gateCount: packet.gates.length,
    pilotReadinessClaimed: false,
    acceptedForScope: false,
    scientificApproval: false,
  };
}
