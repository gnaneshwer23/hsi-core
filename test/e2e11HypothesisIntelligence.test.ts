import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessE2e11HypothesisMode,
  assessHypothesisIntelligenceHonesty,
  assertE2e11HypothesisSoftLand,
  e2e11HypothesisIntelligencePacket,
  e2e11HypothesisSurfaceById,
  type E2e11HypothesisSurfaceId,
  type E2e11SuiteMode,
} from "../src/operations/e2e11HypothesisIntelligence";

describe("PR-E2E-11 hypothesis intelligence soft-land", () => {
  test("documents seven surfaces without claiming validation or 1.0 must-ship", () => {
    const packet = e2e11HypothesisIntelligencePacket();
    const summary = assertE2e11HypothesisSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.experimentallyValidated).toBe(false);
    expect(summary.mustShipForHsi10).toBe(false);
    expect(summary.scientificApproval).toBe(false);
    expect(packet.backlogId).toBe("PR-E2E-11");
    expect(packet.priority).toBe("P3");
    expect(packet.labelledLater).toBe(true);
    expect(packet.honesty.reviewIsNotExperimentalValidation).toBe(true);
    expect(packet.inventedWetLabOutcomes).toBe(false);
  });

  test("each surface keeps validation and must-ship false", () => {
    const surfaces: E2e11HypothesisSurfaceId[] = [
      "hypothesis_registry",
      "hypothesis_ledger_device_local",
      "falsifiable_experiment_proposals",
      "interrogative_falsification_engine",
      "research_outcome_hypotheses",
      "collaboration_hypothesis_stubs",
      "optional_planner_comparison",
    ];
    for (const surface of surfaces) {
      const row = e2e11HypothesisSurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.experimentallyValidated).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.mustShipForHsi10).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows validation or must-ship claims", () => {
    const modes: E2e11SuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessE2e11HypothesisMode(mode);
      expect(assessment.mayClaimExperimentalValidation).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.mayClaimMustShipForHsi10).toBe(false);
      expect(assessment.mayPromoteToGraph).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.experimentallyValidated).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("hypothesis honesty stays fail-closed", () => {
    const honesty = assessHypothesisIntelligenceHonesty();
    expect(honesty.mustKeepUnvalidatedFlag).toBe(true);
    expect(honesty.mustRequireFalsifierBeforeTesting).toBe(true);
    expect(honesty.mustKeepConfidenceNotAssessed).toBe(true);
    expect(honesty.mustNotTreatReviewAsValidation).toBe(true);
    expect(honesty.mustKeepLabelledLater).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/e2e-11-hypothesis-intelligence.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      experimentallyValidated: boolean;
      mustShipForHsi10: boolean;
      labelledLater: boolean;
      references: {
        hsi10_e2e_acceptance_ref: string;
        planner_comparison_receipt_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.experimentallyValidated).toBe(false);
    expect(pending.mustShipForHsi10).toBe(false);
    expect(pending.labelledLater).toBe(true);
    expect(pending.references.hsi10_e2e_acceptance_ref).toBe("NOT_STARTED");
    expect(pending.references.planner_comparison_receipt_ref).toBe("UNASSIGNED");

    const doc = readFileSync(
      join(root, "docs/engineering/E2E_11_HYPOTHESIS_INTELLIGENCE_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("PR-E2E-11");
    expect(doc).toContain("labelled later");
    expect(doc).toContain("mustShipForHsi10");
  });
});
