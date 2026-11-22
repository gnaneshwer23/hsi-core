/**
 * HSI 1.0 — U7 scientific reliability soft-land (Human #4 / SME gold).
 *
 * Bundles existing E2E-10 vault + NEXT-D freeze soft-lands for production-
 * readiness phase progress. Never invents SME labels, adjudications, freezes,
 * or scientific approval. adjudicatedCases stays 0 in committed artifacts.
 */

export const HSI_10_SCIENTIFIC_RELIABILITY_U7_SCHEMA =
  "hsi-1-0-scientific-reliability-u7-1" as const;

export type Hsi10ScientificReliabilitySurfaceId =
  | "e2e10_sme_gold_vault"
  | "next_d_expert_vault_freeze"
  | "comparability_honesty_ui"
  | "provisional_hypothesis_honesty_ui"
  | "scientific_approval_public_claim";

export type Hsi10ScientificReliabilitySurfaceRow = {
  surface: Hsi10ScientificReliabilitySurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  smeGoldFilled: false;
  scientificApproval: false;
  adjudicatedCasesClaimed: 0;
  checklistItem: 3 | 4 | 7;
  pathHints: readonly string[];
  notes: string;
};

export type Hsi10ScientificReliabilitySuiteMode = "check" | "fixture";

export type Hsi10ScientificReliabilityPacket = {
  schemaVersion: typeof HSI_10_SCIENTIFIC_RELIABILITY_U7_SCHEMA;
  purpose: "hsi_1_0_scientific_reliability_u7_soft_land";
  backlogId: "HSI-1.0-SCIENTIFIC-RELIABILITY-U7";
  humanGate: 4;
  checklistItems: readonly [3, 4, 7];
  scientificApproval: false;
  smeGoldFilled: false;
  frozenHeldOut: false;
  adjudicatedCases: 0;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedSmeLabels: false;
  inventedAdjudications: false;
  goldCommittedInGit: false;
  ciSafeModes: readonly Hsi10ScientificReliabilitySuiteMode[];
  surfaces: readonly Hsi10ScientificReliabilitySurfaceRow[];
  reuseModules: readonly string[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/hsi-10-scientific-reliability-u7.pending.json";
  softLandDocPath: "docs/engineering/HSI_10_SCIENTIFIC_RELIABILITY_U7_SOFT_LAND.md";
  acceptanceStatusDocPath: "docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md";
  honesty: {
    catalogsExistAcceptanceBlocked: true;
    draftBankIsNotGold: true;
    noInventedLabels: true;
    noInventedAdjudications: true;
    noScientificApproval: true;
    vaultStaysGitignored: true;
    fixtureIsNotAdjudication: true;
    uiHonestyIsNotScientificGo: true;
  };
};

export type Hsi10ScientificReliabilityAssessment = {
  schemaVersion: "hsi-1-0-scientific-reliability-u7-assessment-1";
  suiteMode: Hsi10ScientificReliabilitySuiteMode;
  mayClaimSmeGoldFilled: false;
  mayClaimAdjudicatedCases: false;
  mayClaimScientificApproval: false;
  mayFreezeHeldOut: false;
  mayInventSmeLabels: false;
  ciSafe: true;
  reasons: string[];
  acceptedForScope: false;
};

const SURFACES: readonly Hsi10ScientificReliabilitySurfaceRow[] = [
  {
    surface: "e2e10_sme_gold_vault",
    engineeringReady: true,
    ownerEvidenceRequired: true,
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCasesClaimed: 0,
    checklistItem: 7,
    pathHints: [
      "src/operations/e2e10SmeGoldVault.ts",
      "operations/staging/e2e-10-sme-gold-vault.pending.json",
      "docs/engineering/E2E_10_SME_GOLD_VAULT_SOFT_LAND.md",
    ],
    notes:
      "Vault layout + draft bank scaffolds exist. Human #4 must recruit SME A/B + adjudicator and author private labels.",
  },
  {
    surface: "next_d_expert_vault_freeze",
    engineeringReady: true,
    ownerEvidenceRequired: true,
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCasesClaimed: 0,
    checklistItem: 7,
    pathHints: [
      "src/operations/nextDExpertVaultFreezeSoftLand.ts",
      "operations/staging/next-d-expert-vault-freeze.pending.json",
      "docs/engineering/NEXT_D_EXPERT_VAULT_FREEZE_SOFT_LAND.md",
    ],
    notes:
      "Freeze / 120-case path stays blocked until real dual-expert adjudication exists. Soft-land never invents freezes.",
  },
  {
    surface: "comparability_honesty_ui",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCasesClaimed: 0,
    checklistItem: 3,
    pathHints: [
      "docs/engineering/WORKSPACE_COMPARABILITY_HONESTY.md",
      "site/e2e/workspace-continuous-journey.spec.ts",
    ],
    notes:
      "Comparability honesty labels shipped. Checklist #3 scientific verification still needs SME gold (Human #4).",
  },
  {
    surface: "provisional_hypothesis_honesty_ui",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCasesClaimed: 0,
    checklistItem: 4,
    pathHints: [
      "docs/engineering/WORKSPACE_PROVISIONAL_HYPOTHESIS_HONESTY.md",
      "site/src/components/workspace/TestableNextQuestionsPanel.tsx",
    ],
    notes:
      "Provisional / experiment honesty labels shipped. Not scientific approval.",
  },
  {
    surface: "scientific_approval_public_claim",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCasesClaimed: 0,
    checklistItem: 7,
    pathHints: [
      "site/src/lib/seo/siteSeo.ts",
      "site/src/pages/InvestigationWorkspace.tsx",
      "site/e2e/live-investigation.spec.ts",
    ],
    notes:
      "Public and workspace surfaces must keep scientific approval false. U7 never flips that claim.",
  },
];

const REUSE_MODULES: readonly string[] = [
  "src/operations/e2e10SmeGoldVault.ts",
  "src/operations/nextDExpertVaultFreezeSoftLand.ts",
  "src/operations/hsi10OwnerGatesWorksheet.ts",
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Recruit independent SME A, SME B, and an adjudicator for Human #4 — never invent identities in git.",
  "Author labels only under the private vault; keep goldCommittedInGit false.",
  "Grow adjudicatedCases only with real dual-SME + adjudication evidence — never invent counts in committed JSON.",
  "Do not freeze held-out splits without rights-cleared packets and real labels.",
  "Keep public UI scientificApproval false until owner scientific GO exists outside this soft-land.",
];

export function hsi10ScientificReliabilityU7Packet(): Hsi10ScientificReliabilityPacket {
  return {
    schemaVersion: HSI_10_SCIENTIFIC_RELIABILITY_U7_SCHEMA,
    purpose: "hsi_1_0_scientific_reliability_u7_soft_land",
    backlogId: "HSI-1.0-SCIENTIFIC-RELIABILITY-U7",
    humanGate: 4,
    checklistItems: [3, 4, 7],
    scientificApproval: false,
    smeGoldFilled: false,
    frozenHeldOut: false,
    adjudicatedCases: 0,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedSmeLabels: false,
    inventedAdjudications: false,
    goldCommittedInGit: false,
    ciSafeModes: ["check", "fixture"],
    surfaces: SURFACES,
    reuseModules: REUSE_MODULES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath:
      "operations/staging/hsi-10-scientific-reliability-u7.pending.json",
    softLandDocPath: "docs/engineering/HSI_10_SCIENTIFIC_RELIABILITY_U7_SOFT_LAND.md",
    acceptanceStatusDocPath: "docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md",
    honesty: {
      catalogsExistAcceptanceBlocked: true,
      draftBankIsNotGold: true,
      noInventedLabels: true,
      noInventedAdjudications: true,
      noScientificApproval: true,
      vaultStaysGitignored: true,
      fixtureIsNotAdjudication: true,
      uiHonestyIsNotScientificGo: true,
    },
  };
}

export function hsi10ScientificReliabilitySurfaceById(
  surface: Hsi10ScientificReliabilitySurfaceId,
): Hsi10ScientificReliabilitySurfaceRow {
  switch (surface) {
    case "e2e10_sme_gold_vault":
    case "next_d_expert_vault_freeze":
    case "comparability_honesty_ui":
    case "provisional_hypothesis_honesty_ui":
    case "scientific_approval_public_claim": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing U7 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown U7 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessHsi10ScientificReliabilityU7Mode(
  mode: Hsi10ScientificReliabilitySuiteMode,
): Hsi10ScientificReliabilityAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-1-0-scientific-reliability-u7-assessment-1",
        suiteMode: mode,
        mayClaimSmeGoldFilled: false,
        mayClaimAdjudicatedCases: false,
        mayClaimScientificApproval: false,
        mayFreezeHeldOut: false,
        mayInventSmeLabels: false,
        ciSafe: true,
        reasons: [
          "check mode validates U7 scaffold honesty only",
          "Human #4 SME gold stays owner-gated",
          "UI honesty labels are not scientific GO",
        ],
        acceptedForScope: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-1-0-scientific-reliability-u7-assessment-1",
        suiteMode: mode,
        mayClaimSmeGoldFilled: false,
        mayClaimAdjudicatedCases: false,
        mayClaimScientificApproval: false,
        mayFreezeHeldOut: false,
        mayInventSmeLabels: false,
        ciSafe: true,
        reasons: [
          "fixture green reuses E2E-10 / NEXT-D soft-land tests only",
          "fixture green is not adjudicated gold or scientific approval",
        ],
        acceptedForScope: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown U7 suite mode: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsi10ScientificReliabilityU7SoftLand(
  packet: Hsi10ScientificReliabilityPacket,
): {
  surfaceCount: number;
  smeGoldFilled: false;
  scientificApproval: false;
  adjudicatedCases: 0;
  acceptedForScope: false;
} {
  if (packet.schemaVersion !== HSI_10_SCIENTIFIC_RELIABILITY_U7_SCHEMA) {
    throw new Error("unexpected U7 scientific-reliability schema");
  }
  if (packet.backlogId !== "HSI-1.0-SCIENTIFIC-RELIABILITY-U7") {
    throw new Error("soft-land must bind HSI-1.0-SCIENTIFIC-RELIABILITY-U7");
  }
  if (packet.humanGate !== 4) {
    throw new Error("U7 must bind Human #4");
  }
  if (
    packet.smeGoldFilled !== false ||
    packet.scientificApproval !== false ||
    packet.adjudicatedCases !== 0 ||
    packet.frozenHeldOut !== false
  ) {
    throw new Error("soft-land must keep gold/approval/adjudication claims empty");
  }
  if (
    packet.inventedSmeLabels !== false ||
    packet.inventedAdjudications !== false ||
    packet.goldCommittedInGit !== false
  ) {
    throw new Error("soft-land must not invent or commit gold");
  }
  if (packet.acceptedForScope !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must keep acceptance claims false");
  }
  if (packet.surfaces.length !== 5) {
    throw new Error("expected five U7 surfaces");
  }
  for (const row of packet.surfaces) {
    if (
      row.smeGoldFilled !== false ||
      row.scientificApproval !== false ||
      row.adjudicatedCasesClaimed !== 0
    ) {
      throw new Error(`surface ${row.surface} must keep gold claims empty`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    smeGoldFilled: false,
    scientificApproval: false,
    adjudicatedCases: 0,
    acceptedForScope: false,
  };
}
