import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessNextDFreezeHonesty,
  assessNextDMode,
  assertNextDExpertVaultFreezeSoftLand,
  nextDExpertVaultFreezePacket,
  nextDSurfaceById,
  type NextDSuiteMode,
  type NextDSurfaceId,
} from "../src/operations/nextDExpertVaultFreezeSoftLand";

describe("NEXT-D expert vault / freeze soft-land", () => {
  test("documents seven surfaces without claiming freeze or gold", () => {
    const packet = nextDExpertVaultFreezePacket();
    const summary = assertNextDExpertVaultFreezeSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.smeGoldFilled).toBe(false);
    expect(summary.signedFreezeClaimed).toBe(false);
    expect(summary.adjudicatedCases).toBe(0);
    expect(packet.backlogId).toBe("NEXT-D");
    expect(packet.priority).toBe("P1");
    expect(packet.resolvedFinalCaseTarget).toBe(120);
    expect(packet.dependsOn).toEqual(["PR-E2E-10"]);
    expect(packet.honesty.noInventedExpertIds).toBe(true);
    expect(packet.inventedScores).toBe(false);
  });

  test("each surface keeps gold, freeze, and adjudication claims false", () => {
    const surfaces: NextDSurfaceId[] = [
      "e2e10_vault_reuse",
      "dual_expert_authoring_slots",
      "adjudication_workflow",
      "contamination_and_restricted_answers",
      "family_splits_and_held_out",
      "methodology_rubric_policy",
      "signed_freeze_120_cases",
    ];
    for (const surface of surfaces) {
      const row = nextDSurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.smeGoldFilled).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.signedFreezeClaimed).toBe(false);
      expect(row.adjudicatedCasesClaimed).toBe(0);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows freeze, gold, or invented experts", () => {
    const modes: NextDSuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessNextDMode(mode);
      expect(assessment.mayClaimSmeGoldFilled).toBe(false);
      expect(assessment.mayClaimSignedFreeze).toBe(false);
      expect(assessment.mayInventExpertIds).toBe(false);
      expect(assessment.mayInventScores).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.smeGoldFilled).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("freeze honesty stays fail-closed", () => {
    const honesty = assessNextDFreezeHonesty();
    expect(honesty.mustKeepSmeGoldFilledFalseUntilDualExperts).toBe(true);
    expect(honesty.mustRequireIndependentAdjudication).toBe(true);
    expect(honesty.mustKeepContaminationEvidenceSeparate).toBe(true);
    expect(honesty.mustApproveRubricBeforeTuning).toBe(true);
    expect(honesty.mustReachExactly120ResolvedFinalCases).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/next-d-expert-vault-freeze.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      smeGoldFilled: boolean;
      signedFreezeClaimed: boolean;
      references: {
        expert_a_ref: string;
        expert_b_ref: string;
        adjudicator_ref: string;
        methodology_signature_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.smeGoldFilled).toBe(false);
    expect(pending.signedFreezeClaimed).toBe(false);
    expect(pending.references.expert_a_ref).toBe("UNASSIGNED");
    expect(pending.references.expert_b_ref).toBe("UNASSIGNED");
    expect(pending.references.adjudicator_ref).toBe("UNASSIGNED");
    expect(pending.references.methodology_signature_ref).toBe("NOT_STARTED");

    const doc = readFileSync(
      join(root, "docs/engineering/NEXT_D_EXPERT_VAULT_FREEZE_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("NEXT-D");
    expect(doc).toContain("smeGoldFilled");
    expect(doc).toContain("120");
  });
});
