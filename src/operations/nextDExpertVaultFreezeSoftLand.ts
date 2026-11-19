/**
 * NEXT-D — expert case authoring / curator-vault / signed freeze soft-land (P1).
 *
 * Catalogues vault, dual-expert, adjudication, contamination, and freeze
 * surfaces toward exactly 120 resolved final cases. Never invents expert IDs,
 * scores, freezes, or methodology signatures. Human authoring stays blocked.
 */

export const NEXT_D_EXPERT_VAULT_FREEZE_SCHEMA =
  "hsi-next-d-expert-vault-freeze-soft-land-1" as const;

export type NextDSuiteMode = "check" | "fixture";

export type NextDSurfaceId =
  | "e2e10_vault_reuse"
  | "dual_expert_authoring_slots"
  | "adjudication_workflow"
  | "contamination_and_restricted_answers"
  | "family_splits_and_held_out"
  | "methodology_rubric_policy"
  | "signed_freeze_120_cases";

export type NextDSurfaceDisposition =
  | "reuse_soft_land"
  | "reuse_scaffold"
  | "owner_human_authoring"
  | "blocked_until_experts_and_adjudication";

export type NextDSurfaceRow = {
  surface: NextDSurfaceId;
  disposition: NextDSurfaceDisposition;
  smeGoldFilled: false;
  scientificApproval: false;
  signedFreezeClaimed: false;
  adjudicatedCasesClaimed: 0;
  pathHints: readonly string[];
  notes: string;
};

export type NextDExpertVaultFreezePacket = {
  schemaVersion: typeof NEXT_D_EXPERT_VAULT_FREEZE_SCHEMA;
  purpose: "next_d_expert_vault_freeze_soft_land";
  backlogId: "NEXT-D";
  priority: "P1";
  scientificApproval: false;
  smeGoldFilled: false;
  frozenHeldOut: false;
  signedFreezeClaimed: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  independentlyLabelledCases: 0;
  adjudicatedCases: 0;
  resolvedFinalCaseTarget: 120;
  inventedExpertIds: false;
  inventedScores: false;
  inventedMethodologySignature: false;
  dependsOn: readonly ["PR-E2E-10"];
  humanWorkStartsInParallel: true;
  ciSafeModes: readonly NextDSuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly NextDSurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/next-d-expert-vault-freeze.pending.json";
  softLandDocPath: "docs/engineering/NEXT_D_EXPERT_VAULT_FREEZE_SOFT_LAND.md";
  honesty: {
    e2e10IsPrerequisiteCatalog: true;
    noInventedExpertIds: true;
    noInventedScores: true;
    noSignedFreezeWithoutExperts: true;
    draftBankIsNotGold: true;
    fixtureIsNotFreeze: true;
    tuningBlockedUntilRubricAndFloors: true;
  };
};

export type NextDAssessment = {
  schemaVersion: "hsi-next-d-assessment-1";
  suiteMode: NextDSuiteMode;
  mayClaimSmeGoldFilled: false;
  mayClaimSignedFreeze: false;
  mayInventExpertIds: false;
  mayInventScores: false;
  mayClaimScientificApproval: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  smeGoldFilled: false;
};

export type NextDFreezeHonesty = {
  schemaVersion: "hsi-next-d-freeze-honesty-1";
  mustKeepSmeGoldFilledFalseUntilDualExperts: true;
  mustRequireIndependentAdjudication: true;
  mustKeepContaminationEvidenceSeparate: true;
  mustApproveRubricBeforeTuning: true;
  mustReachExactly120ResolvedFinalCases: true;
  reasons: string[];
};

const SURFACES: readonly NextDSurfaceRow[] = [
  {
    surface: "e2e10_vault_reuse",
    disposition: "reuse_soft_land",
    smeGoldFilled: false,
    scientificApproval: false,
    signedFreezeClaimed: false,
    adjudicatedCasesClaimed: 0,
    pathHints: [
      "src/operations/e2e10SmeGoldVault.ts",
      "docs/engineering/E2E_10_SME_GOLD_VAULT_SOFT_LAND.md",
    ],
    notes: "PR-E2E-10 vault/worksheet catalog; NEXT-D extends toward signed freeze + 120 cases.",
  },
  {
    surface: "dual_expert_authoring_slots",
    disposition: "owner_human_authoring",
    smeGoldFilled: false,
    scientificApproval: false,
    signedFreezeClaimed: false,
    adjudicatedCasesClaimed: 0,
    pathHints: [
      "src/evidence/labelVault.ts",
      "src/evidence/scientificBenchmarkRegistry.ts",
    ],
    notes: "Two independent experts required; soft-land never invents expert identities.",
  },
  {
    surface: "adjudication_workflow",
    disposition: "reuse_scaffold",
    smeGoldFilled: false,
    scientificApproval: false,
    signedFreezeClaimed: false,
    adjudicatedCasesClaimed: 0,
    pathHints: [
      "src/evidence/r2GoldEvaluationSuite.ts",
      "src/evidence/conflictBenchmarkExpertPath.ts",
    ],
    notes: "Empty adjudication worksheets; disagreements stay unresolved until a real adjudicator.",
  },
  {
    surface: "contamination_and_restricted_answers",
    disposition: "reuse_scaffold",
    smeGoldFilled: false,
    scientificApproval: false,
    signedFreezeClaimed: false,
    adjudicatedCasesClaimed: 0,
    pathHints: [
      "src/evidence/labelVault.ts",
      "docs/engineering/HUMAN_QUEUE_RESIDUALS.md",
    ],
    notes: "Holdout answers and restricted evidence stay out of public assets/prompts/logs.",
  },
  {
    surface: "family_splits_and_held_out",
    disposition: "reuse_scaffold",
    smeGoldFilled: false,
    scientificApproval: false,
    signedFreezeClaimed: false,
    adjudicatedCasesClaimed: 0,
    pathHints: [
      "src/evidence/r2GoldEvaluationSuite.ts",
      "src/goldEvaluationSuite.ts",
    ],
    notes: "Study-grouped / family splits remain unfilled; frozenHeldOut stays false.",
  },
  {
    surface: "methodology_rubric_policy",
    disposition: "owner_human_authoring",
    smeGoldFilled: false,
    scientificApproval: false,
    signedFreezeClaimed: false,
    adjudicatedCasesClaimed: 0,
    pathHints: [
      "docs/engineering/R2_GOLD_EVALUATION_SUITE_CHECKLIST.md",
      "docs/engineering/N3_CALIBRATION_FREEZE_CHECKLIST.md",
    ],
    notes: "Approved rubric and subgroup/risk floors required before tuning/final evaluation.",
  },
  {
    surface: "signed_freeze_120_cases",
    disposition: "blocked_until_experts_and_adjudication",
    smeGoldFilled: false,
    scientificApproval: false,
    signedFreezeClaimed: false,
    adjudicatedCasesClaimed: 0,
    pathHints: ["docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md"],
    notes: "Exactly 120 resolved final cases + signed freeze wait on dual experts, adjudication, and methodology.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Recruit two independent experts and a separate adjudicator; never invent identities in git.",
  "Author cases only under the gitignored curator vault; keep holdout answers restricted.",
  "Resolve exactly 120 final cases with cleared versions/spans, family splits, and contamination evidence.",
  "Approve methodology/rubric and subgroup/risk floors before any tuning or final evaluation.",
  "Sign the freeze only after dual labelling + adjudication; keep smeGoldFilled false until then.",
];

const REUSE_MODULES: readonly string[] = [
  "src/operations/e2e10SmeGoldVault.ts",
  "src/evidence/labelVault.ts",
  "src/evidence/r2GoldEvaluationSuite.ts",
  "src/evidence/conflictBenchmarkExpertPath.ts",
  "src/evidence/scientificBenchmarkRegistry.ts",
  "src/goldEvaluationSuite.ts",
  "docs/engineering/E2E_10_SME_GOLD_VAULT_SOFT_LAND.md",
  "docs/engineering/R2_GOLD_EVALUATION_SUITE_CHECKLIST.md",
  "docs/engineering/N3_CALIBRATION_FREEZE_CHECKLIST.md",
];

export function nextDExpertVaultFreezePacket(): NextDExpertVaultFreezePacket {
  return {
    schemaVersion: NEXT_D_EXPERT_VAULT_FREEZE_SCHEMA,
    purpose: "next_d_expert_vault_freeze_soft_land",
    backlogId: "NEXT-D",
    priority: "P1",
    scientificApproval: false,
    smeGoldFilled: false,
    frozenHeldOut: false,
    signedFreezeClaimed: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    independentlyLabelledCases: 0,
    adjudicatedCases: 0,
    resolvedFinalCaseTarget: 120,
    inventedExpertIds: false,
    inventedScores: false,
    inventedMethodologySignature: false,
    dependsOn: ["PR-E2E-10"],
    humanWorkStartsInParallel: true,
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/next-d-expert-vault-freeze.pending.json",
    softLandDocPath: "docs/engineering/NEXT_D_EXPERT_VAULT_FREEZE_SOFT_LAND.md",
    honesty: {
      e2e10IsPrerequisiteCatalog: true,
      noInventedExpertIds: true,
      noInventedScores: true,
      noSignedFreezeWithoutExperts: true,
      draftBankIsNotGold: true,
      fixtureIsNotFreeze: true,
      tuningBlockedUntilRubricAndFloors: true,
    },
  };
}

export function nextDSurfaceById(surface: NextDSurfaceId): NextDSurfaceRow {
  switch (surface) {
    case "e2e10_vault_reuse":
    case "dual_expert_authoring_slots":
    case "adjudication_workflow":
    case "contamination_and_restricted_answers":
    case "family_splits_and_held_out":
    case "methodology_rubric_policy":
    case "signed_freeze_120_cases": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing NEXT-D surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown NEXT-D surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessNextDMode(mode: NextDSuiteMode): NextDAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-next-d-assessment-1",
        suiteMode: mode,
        mayClaimSmeGoldFilled: false,
        mayClaimSignedFreeze: false,
        mayInventExpertIds: false,
        mayInventScores: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "signed freeze and 120 resolved cases stay blocked until real dual experts + adjudication",
        ],
        scientificApproval: false,
        smeGoldFilled: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-next-d-assessment-1",
        suiteMode: mode,
        mayClaimSmeGoldFilled: false,
        mayClaimSignedFreeze: false,
        mayInventExpertIds: false,
        mayInventScores: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "fixture vault/worksheet checks use empty scaffolds only",
          "fixture green is not a signed freeze or scientific acceptance",
        ],
        scientificApproval: false,
        smeGoldFilled: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown NEXT-D suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Freeze / methodology honesty for NEXT-D soft-land. */
export function assessNextDFreezeHonesty(): NextDFreezeHonesty {
  return {
    schemaVersion: "hsi-next-d-freeze-honesty-1",
    mustKeepSmeGoldFilledFalseUntilDualExperts: true,
    mustRequireIndependentAdjudication: true,
    mustKeepContaminationEvidenceSeparate: true,
    mustApproveRubricBeforeTuning: true,
    mustReachExactly120ResolvedFinalCases: true,
    reasons: [
      "Dual independent experts are required before smeGoldFilled can flip",
      "Disagreements need an independent adjudicator before a reference label exists",
      "Restricted answers and contamination evidence must stay out of public assets",
      "Rubric and subgroup/risk floors must be approved before tuning or final evaluation",
      "Signed freeze targets exactly 120 resolved final cases plus separate development",
    ],
  };
}

export function assertNextDExpertVaultFreezeSoftLand(
  packet: NextDExpertVaultFreezePacket,
): {
  surfaceCount: number;
  smeGoldFilled: false;
  signedFreezeClaimed: false;
  adjudicatedCases: 0;
} {
  if (packet.schemaVersion !== NEXT_D_EXPERT_VAULT_FREEZE_SCHEMA) {
    throw new Error("unexpected NEXT-D expert-vault-freeze schema");
  }
  if (packet.backlogId !== "NEXT-D" || packet.priority !== "P1") {
    throw new Error("soft-land must bind NEXT-D at P1");
  }
  if (packet.smeGoldFilled !== false || packet.frozenHeldOut !== false) {
    throw new Error("soft-land must keep smeGoldFilled and frozenHeldOut false");
  }
  if (packet.signedFreezeClaimed !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim signed freeze or signed packet");
  }
  if (packet.scientificApproval !== false || packet.acceptedForScope !== false) {
    throw new Error("soft-land must not claim scientific approval or acceptance");
  }
  if (packet.independentlyLabelledCases !== 0 || packet.adjudicatedCases !== 0) {
    throw new Error("soft-land must keep labelled/adjudicated counts at zero");
  }
  if (packet.resolvedFinalCaseTarget !== 120) {
    throw new Error("soft-land must target exactly 120 resolved final cases");
  }
  if (
    packet.inventedExpertIds !== false ||
    packet.inventedScores !== false ||
    packet.inventedMethodologySignature !== false
  ) {
    throw new Error("soft-land must not invent experts, scores, or methodology signatures");
  }
  if (packet.dependsOn.length !== 1 || packet.dependsOn[0] !== "PR-E2E-10") {
    throw new Error("soft-land must depend on PR-E2E-10");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven NEXT-D surfaces");
  for (const surface of packet.surfaces) {
    if (surface.smeGoldFilled !== false || surface.signedFreezeClaimed !== false) {
      throw new Error(`surface ${surface.surface} must keep gold/freeze false`);
    }
    if (surface.scientificApproval !== false || surface.adjudicatedCasesClaimed !== 0) {
      throw new Error(`surface ${surface.surface} must not claim approval or adjudicated cases`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    smeGoldFilled: false,
    signedFreezeClaimed: false,
    adjudicatedCases: 0,
  };
}
