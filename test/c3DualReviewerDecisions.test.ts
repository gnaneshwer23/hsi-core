import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessC3DualMode,
  assessC3DualReleaseHonesty,
  assertC3DualReviewerSoftLand,
  c3DualReviewerDecisionsPacket,
  c3DualSurfaceById,
  type C3DualSurfaceId,
  type C3SuiteMode,
} from "../src/operations/c3DualReviewerDecisions";

describe("Track C3 dual-reviewer decisions soft-land", () => {
  test("documents seven surfaces without inventing dual reviews", () => {
    const packet = c3DualReviewerDecisionsPacket();
    const summary = assertC3DualReviewerSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.dualReviewedEdgeCount).toBe(0);
    expect(summary.dualReviewComplete).toBe(false);
    expect(summary.scientificApproval).toBe(false);
    expect(packet.backlogId).toBe("C3");
    expect(packet.targetEdgeFloor).toBe(40);
    expect(packet.targetEdgeCeiling).toBe(60);
    expect(packet.honesty.c2IsNotDualRelease).toBe(true);
    expect(packet.inventedReviewerIdentities).toBe(false);
  });

  test("each surface keeps dual complete and promotion false", () => {
    const surfaces: C3DualSurfaceId[] = [
      "c2_local_recommendations",
      "recommendation_digest_chain",
      "dual_independent_reviewers",
      "immutable_decision_records",
      "target_band_40_60",
      "reviewed_lane_reserved",
      "graph_version_bump_blocked",
    ];
    for (const surface of surfaces) {
      const row = c3DualSurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.dualReviewComplete).toBe(false);
      expect(row.graphPromotion).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows invent/release claims", () => {
    const modes: C3SuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessC3DualMode(mode);
      expect(assessment.mayInventReviewers).toBe(false);
      expect(assessment.mayClaimDualReviewComplete).toBe(false);
      expect(assessment.mayPromoteEdges).toBe(false);
      expect(assessment.mayBumpGraphVersionForReview).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.dualReviewComplete).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("dual-release honesty stays fail-closed", () => {
    const honesty = assessC3DualReleaseHonesty();
    expect(honesty.mustRequireTwoIndependentReviewers).toBe(true);
    expect(honesty.mustKeepSelfReviewDenied).toBe(true);
    expect(honesty.mustKeepC2RecommendationsUnverified).toBe(true);
    expect(honesty.mustKeepReviewedLaneEmptyUntilDual).toBe(true);
    expect(honesty.mustNotInventDecisionRecords).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/c3-dual-reviewer-decisions.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      dualReviewComplete: boolean;
      dualReviewedEdgeCount: number;
      references: {
        reviewer_a_ref: string;
        reviewer_b_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.dualReviewComplete).toBe(false);
    expect(pending.dualReviewedEdgeCount).toBe(0);
    expect(pending.references.reviewer_a_ref).toBe("UNASSIGNED");
    expect(pending.references.reviewer_b_ref).toBe("UNASSIGNED");

    const doc = readFileSync(
      join(root, "docs/engineering/C3_DUAL_REVIEWER_DECISIONS_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("Track C3");
    expect(doc).toContain("40–60");
    expect(doc).toContain("dualReviewedEdgeCount");
  });
});
