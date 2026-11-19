import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessE2e10GoldMode,
  assessSmeGoldAuthoringHonesty,
  assertE2e10SmeGoldSoftLand,
  e2e10GoldSurfaceById,
  e2e10SmeGoldVaultPacket,
  type E2e10GoldSurfaceId,
  type E2e10SuiteMode,
} from "../src/operations/e2e10SmeGoldVault";

describe("PR-E2E-10 SME gold vault soft-land", () => {
  test("documents seven surfaces without claiming gold filled", () => {
    const packet = e2e10SmeGoldVaultPacket();
    const summary = assertE2e10SmeGoldSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.smeGoldFilled).toBe(false);
    expect(summary.adjudicatedCases).toBe(0);
    expect(summary.scientificApproval).toBe(false);
    expect(packet.backlogId).toBe("PR-E2E-10");
    expect(packet.targetCaseFloor).toBe(60);
    expect(packet.targetCaseCeiling).toBe(120);
    expect(packet.honesty.noInventedLabels).toBe(true);
    expect(packet.honesty.draftBankIsNotGold).toBe(true);
    expect(packet.inventedSmeLabels).toBe(false);
  });

  test("each surface keeps gold and adjudication claims false/zero", () => {
    const surfaces: E2e10GoldSurfaceId[] = [
      "label_vault_layout",
      "immuno_dev_set_authoring",
      "conflict_benchmark_expert_path",
      "r2_sme_worksheets",
      "gold_evaluation_suite_v1",
      "scientific_benchmark_sme_slots",
      "freeze_and_manifest_gates",
    ];
    for (const surface of surfaces) {
      const row = e2e10GoldSurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.smeGoldFilled).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.adjudicatedCasesClaimed).toBe(0);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows gold or freeze claims", () => {
    const modes: E2e10SuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessE2e10GoldMode(mode);
      expect(assessment.mayClaimSmeGoldFilled).toBe(false);
      expect(assessment.mayClaimAdjudicatedCases).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.mayFreezeHeldOut).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.smeGoldFilled).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("authoring honesty stays fail-closed", () => {
    const honesty = assessSmeGoldAuthoringHonesty();
    expect(honesty.mustKeepSmeGoldFilledFalseUntilDualSme).toBe(true);
    expect(honesty.mustKeepIndependentlyLabelledCasesZeroUntilRealLabels).toBe(true);
    expect(honesty.mustNotCommitGoldIntoGit).toBe(true);
    expect(honesty.mustNotTreatDraftBankAsGold).toBe(true);
    expect(honesty.mustRequireAdjudicationForDisagreement).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/e2e-10-sme-gold-vault.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      smeGoldFilled: boolean;
      independentlyLabelledCases: number;
      adjudicatedCases: number;
      references: {
        sme_a_ref: string;
        sme_b_ref: string;
        adjudicator_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.smeGoldFilled).toBe(false);
    expect(pending.independentlyLabelledCases).toBe(0);
    expect(pending.adjudicatedCases).toBe(0);
    expect(pending.references.sme_a_ref).toBe("UNASSIGNED");
    expect(pending.references.sme_b_ref).toBe("UNASSIGNED");
    expect(pending.references.adjudicator_ref).toBe("UNASSIGNED");

    const doc = readFileSync(
      join(root, "docs/engineering/E2E_10_SME_GOLD_VAULT_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("PR-E2E-10");
    expect(doc).toContain("smeGoldFilled");
    expect(doc).toContain("60→120");
  });
});
