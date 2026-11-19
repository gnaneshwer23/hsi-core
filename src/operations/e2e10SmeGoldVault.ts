/**
 * PR-E2E-10 — SME gold authoring / vault workflow soft-land.
 *
 * Catalogues existing label-vault, R2 worksheets, and gold-suite scaffolds toward
 * the 60→120 adjudicated-case target. Never invents SME labels, adjudications,
 * freezes, or scientific approval. smeGoldFilled stays false.
 */

export const E2E_10_SME_GOLD_SCHEMA =
  "hsi-e2e-10-sme-gold-vault-1" as const;

export type E2e10SuiteMode = "check" | "fixture";

export type E2e10GoldSurfaceId =
  | "label_vault_layout"
  | "immuno_dev_set_authoring"
  | "conflict_benchmark_expert_path"
  | "r2_sme_worksheets"
  | "gold_evaluation_suite_v1"
  | "scientific_benchmark_sme_slots"
  | "freeze_and_manifest_gates";

export type E2e10SurfaceDisposition =
  | "reuse_vault"
  | "reuse_scaffold"
  | "owner_human_authoring"
  | "blocked_until_adjudicated";

export type E2e10GoldSurfaceRow = {
  surface: E2e10GoldSurfaceId;
  disposition: E2e10SurfaceDisposition;
  /** Soft-land never claims gold is filled or scientifically accepted. */
  smeGoldFilled: false;
  scientificApproval: false;
  adjudicatedCasesClaimed: 0;
  pathHints: readonly string[];
  notes: string;
};

export type E2e10SmeGoldPacket = {
  schemaVersion: typeof E2E_10_SME_GOLD_SCHEMA;
  purpose: "pr_e2e_10_sme_gold_vault_soft_land";
  backlogId: "PR-E2E-10";
  scientificApproval: false;
  smeGoldFilled: false;
  frozenHeldOut: false;
  independentlyLabelledCases: 0;
  adjudicatedCases: 0;
  draftBankCaseCount: 50;
  targetCaseFloor: 60;
  targetCaseCeiling: 120;
  goldCommittedInGit: false;
  runtimeMayReadVault: false;
  inventedSmeLabels: false;
  inventedAdjudications: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  ciSafeModes: readonly E2e10SuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly E2e10GoldSurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/e2e-10-sme-gold-vault.pending.json";
  softLandDocPath: "docs/engineering/E2E_10_SME_GOLD_VAULT_SOFT_LAND.md";
  honesty: {
    draftBankIsNotGold: true;
    noInventedLabels: true;
    noInventedAdjudications: true;
    noScientificApproval: true;
    vaultStaysGitignored: true;
    fixtureIsNotAdjudication: true;
  };
};

export type E2e10GoldAssessment = {
  schemaVersion: "hsi-e2e-10-assessment-1";
  suiteMode: E2e10SuiteMode;
  mayClaimSmeGoldFilled: false;
  mayClaimAdjudicatedCases: false;
  mayClaimScientificApproval: false;
  mayFreezeHeldOut: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  smeGoldFilled: false;
};

export type E2e10AuthoringHonesty = {
  schemaVersion: "hsi-e2e-10-authoring-honesty-1";
  mustKeepSmeGoldFilledFalseUntilDualSme: true;
  mustKeepIndependentlyLabelledCasesZeroUntilRealLabels: true;
  mustNotCommitGoldIntoGit: true;
  mustNotTreatDraftBankAsGold: true;
  mustRequireAdjudicationForDisagreement: true;
  reasons: string[];
};

const SURFACES: readonly E2e10GoldSurfaceRow[] = [
  {
    surface: "label_vault_layout",
    disposition: "reuse_vault",
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCasesClaimed: 0,
    pathHints: ["src/evidence/labelVault.ts"],
    notes: "VER-05 gitignored .hsi-private-benchmark layout; runtimeMayRead=false; no gold in git.",
  },
  {
    surface: "immuno_dev_set_authoring",
    disposition: "reuse_vault",
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCasesClaimed: 0,
    pathHints: ["src/evidence/immunoDevSet.ts", "src/evidence/labelVault.ts"],
    notes: "Private immuno dev-set import/validate/score CLI; vaultRef digests only — not public gold.",
  },
  {
    surface: "conflict_benchmark_expert_path",
    disposition: "reuse_scaffold",
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCasesClaimed: 0,
    pathHints: [
      "src/evidence/conflictBenchmark.ts",
      "src/evidence/conflictBenchmarkExpertPath.ts",
    ],
    notes: "Expert path scaffolds empty labels/adjudicated=null; refuses freeze without real labels.",
  },
  {
    surface: "r2_sme_worksheets",
    disposition: "reuse_scaffold",
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCasesClaimed: 0,
    pathHints: [
      "docs/engineering/R2_GOLD_EVALUATION_SUITE_CHECKLIST.md",
      "evaluation/gold-evaluation-suite/r2/suite-manifest.v1.json",
    ],
    notes: "Empty SME A/B + adjudication worksheets (50 rows); independentlyLabelledCases=0.",
  },
  {
    surface: "gold_evaluation_suite_v1",
    disposition: "reuse_scaffold",
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCasesClaimed: 0,
    pathHints: ["docs/engineering/GOLD_EVALUATION_SUITE_V1.md"],
    notes: "Ten capability slots; draft bank ≠ gold; metrics null until adjudication.",
  },
  {
    surface: "scientific_benchmark_sme_slots",
    disposition: "owner_human_authoring",
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCasesClaimed: 0,
    pathHints: ["src/evidence/scientificBenchmarkRegistry.ts"],
    notes: "SME A/B/adjudicator role slots reserved; soft-land never invents assignee identities.",
  },
  {
    surface: "freeze_and_manifest_gates",
    disposition: "blocked_until_adjudicated",
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCasesClaimed: 0,
    pathHints: ["src/evidence/labelVault.ts"],
    notes: "Freeze refuses empty labels; frozenHeldOut stays false until owner dual-SME + rights.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Recruit independent SME A and SME B (human queue #4); never invent expert identities in git.",
  "Author labels only under the gitignored .hsi-private-benchmark vault via label-vault:* CLI.",
  "Adjudicate disagreements with an accountable adjudicator before claiming gold.",
  "Grow from the 50-case draft bank toward the 60→120 adjudicated-case target without inventing labels.",
  "Keep smeGoldFilled=false / independentlyLabelledCases=0 in committed artifacts until real dual SME + adjudication exist.",
  "Do not treat soft-land green, r2:check green, or draft-bank size as scientific acceptance.",
];

const REUSE_MODULES: readonly string[] = [
  "src/evidence/labelVault.ts",
  "src/evidence/immunoDevSet.ts",
  "src/evidence/conflictBenchmark.ts",
  "src/evidence/conflictBenchmarkExpertPath.ts",
  "src/evidence/scientificBenchmarkRegistry.ts",
  "docs/engineering/R2_GOLD_EVALUATION_SUITE_CHECKLIST.md",
  "docs/engineering/GOLD_EVALUATION_SUITE_V1.md",
];

export function e2e10SmeGoldVaultPacket(): E2e10SmeGoldPacket {
  return {
    schemaVersion: E2E_10_SME_GOLD_SCHEMA,
    purpose: "pr_e2e_10_sme_gold_vault_soft_land",
    backlogId: "PR-E2E-10",
    scientificApproval: false,
    smeGoldFilled: false,
    frozenHeldOut: false,
    independentlyLabelledCases: 0,
    adjudicatedCases: 0,
    draftBankCaseCount: 50,
    targetCaseFloor: 60,
    targetCaseCeiling: 120,
    goldCommittedInGit: false,
    runtimeMayReadVault: false,
    inventedSmeLabels: false,
    inventedAdjudications: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/e2e-10-sme-gold-vault.pending.json",
    softLandDocPath: "docs/engineering/E2E_10_SME_GOLD_VAULT_SOFT_LAND.md",
    honesty: {
      draftBankIsNotGold: true,
      noInventedLabels: true,
      noInventedAdjudications: true,
      noScientificApproval: true,
      vaultStaysGitignored: true,
      fixtureIsNotAdjudication: true,
    },
  };
}

export function e2e10GoldSurfaceById(
  surface: E2e10GoldSurfaceId,
): E2e10GoldSurfaceRow {
  switch (surface) {
    case "label_vault_layout":
    case "immuno_dev_set_authoring":
    case "conflict_benchmark_expert_path":
    case "r2_sme_worksheets":
    case "gold_evaluation_suite_v1":
    case "scientific_benchmark_sme_slots":
    case "freeze_and_manifest_gates": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing SME gold surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown SME gold surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessE2e10GoldMode(mode: E2e10SuiteMode): E2e10GoldAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-e2e-10-assessment-1",
        suiteMode: mode,
        mayClaimSmeGoldFilled: false,
        mayClaimAdjudicatedCases: false,
        mayClaimScientificApproval: false,
        mayFreezeHeldOut: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "smeGoldFilled remains false until dual SME + adjudication exist outside soft-land",
        ],
        scientificApproval: false,
        smeGoldFilled: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-e2e-10-assessment-1",
        suiteMode: mode,
        mayClaimSmeGoldFilled: false,
        mayClaimAdjudicatedCases: false,
        mayClaimScientificApproval: false,
        mayFreezeHeldOut: false,
        ciSafe: true,
        reasons: [
          "fixture vault/layout tests use empty stubs only",
          "fixture green is not adjudicated gold or scientific acceptance",
        ],
        scientificApproval: false,
        smeGoldFilled: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown SME gold suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Product / ops honesty for authoring under soft-land (no invented gold). */
export function assessSmeGoldAuthoringHonesty(): E2e10AuthoringHonesty {
  return {
    schemaVersion: "hsi-e2e-10-authoring-honesty-1",
    mustKeepSmeGoldFilledFalseUntilDualSme: true,
    mustKeepIndependentlyLabelledCasesZeroUntilRealLabels: true,
    mustNotCommitGoldIntoGit: true,
    mustNotTreatDraftBankAsGold: true,
    mustRequireAdjudicationForDisagreement: true,
    reasons: [
      "Draft research-readiness bank is not expert gold",
      "Committed manifests keep smeGoldFilled=false and labelled counts at zero",
      "Gold labels live only under the gitignored private vault",
      "Disagreements without adjudication do not produce a reference label",
      "60→120 is a human authoring target, not an engineering fill claim",
    ],
  };
}

export function assertE2e10SmeGoldSoftLand(
  packet: E2e10SmeGoldPacket,
): {
  surfaceCount: number;
  smeGoldFilled: false;
  adjudicatedCases: 0;
  scientificApproval: false;
} {
  if (packet.schemaVersion !== E2E_10_SME_GOLD_SCHEMA) {
    throw new Error("unexpected e2e-10 SME gold schema");
  }
  if (packet.smeGoldFilled !== false) {
    throw new Error("soft-land must keep smeGoldFilled false");
  }
  if (packet.independentlyLabelledCases !== 0 || packet.adjudicatedCases !== 0) {
    throw new Error("soft-land must keep labelled/adjudicated counts at zero");
  }
  if (packet.frozenHeldOut !== false) {
    throw new Error("soft-land must keep frozenHeldOut false");
  }
  if (packet.scientificApproval !== false) {
    throw new Error("soft-land must not claim scientific approval");
  }
  if (packet.inventedSmeLabels !== false || packet.inventedAdjudications !== false) {
    throw new Error("soft-land must not invent labels or adjudications");
  }
  if (packet.goldCommittedInGit !== false || packet.runtimeMayReadVault !== false) {
    throw new Error("soft-land must keep vault gitignored and runtime-unreadable");
  }
  if (packet.acceptedForScope !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim acceptance or signed packet");
  }
  if (packet.draftBankCaseCount !== 50) {
    throw new Error("soft-land draft bank count must remain the known 50-case scaffold");
  }
  if (packet.targetCaseFloor !== 60 || packet.targetCaseCeiling !== 120) {
    throw new Error("soft-land must preserve the 60→120 human target range");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven SME gold surfaces");
  for (const surface of packet.surfaces) {
    if (surface.smeGoldFilled !== false) {
      throw new Error(`surface ${surface.surface} must keep smeGoldFilled false`);
    }
    if (surface.adjudicatedCasesClaimed !== 0) {
      throw new Error(`surface ${surface.surface} must claim zero adjudicated cases`);
    }
    if (surface.scientificApproval !== false) {
      throw new Error(`surface ${surface.surface} must not claim scientific approval`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    smeGoldFilled: false,
    adjudicatedCases: 0,
    scientificApproval: false,
  };
}
