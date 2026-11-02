import { describe, expect, test } from "bun:test";
import {
  buildOperatorAuthorizedGateCDecisions,
  dryRunGateCDecisionsImport,
  parseGateCDecisionsImport,
  resolvePartnerReviewSessionStatus,
} from "../src/index";

describe("P2.1 operator-authorized Gate C decisions", () => {
  test("builds non-hypothetical envelope for all mapped pending rows", () => {
    const env = buildOperatorAuthorizedGateCDecisions({
      generatedAt: "2026-11-02T05:40:00.000Z",
    });
    expect(env.kind).toBe("operator_authorized_export");
    expect(env.isHypothetical).toBe(false);
    expect(env.productionApproved).toBe(false);
    expect(env.notProductionApproved).toBe(true);
    expect(env.inventedApoloOutcomes).toBe(false);
    expect(env.autoApprove).toBe(false);
    expect(env.mayFlipHsiGrade).toBe(false);
    expect(env.decisions.length).toBe(13);
    expect(env.decisions.every((d) => d.decision === "approve")).toBe(true);
    expect(env.decisions.every((d) => d.autoApprove === false)).toBe(true);
    expect(env.decisions.every((d) => d.hsiGradeFlipped === false)).toBe(true);
    expect(
      env.decisions.every((d) =>
        (d.reviewedBy ?? "").startsWith("operator:"),
      ),
    ).toBe(true);
    expect(
      env.decisions.every(
        (d) => !(d.reviewedBy ?? "").toLowerCase().includes("apolo"),
      ),
    ).toBe(true);
  });

  test("dry-run marks decisions_imported (not hypothetical)", () => {
    const env = buildOperatorAuthorizedGateCDecisions({
      generatedAt: "2026-11-02T05:40:00.000Z",
    });
    const report = dryRunGateCDecisionsImport(env, {
      generatedAt: "2026-11-02T05:40:00.000Z",
    });
    expect(report.ok).toBe(true);
    expect(report.envelope.isHypothetical).toBe(false);
    expect(report.partnerReviewSessionWouldBe).toBe("decisions_imported");
    expect(report.matchedPendingEdges).toBe(13);
    expect(report.unmatchedEdgeIds).toEqual([]);
    expect(report.byDecision.approve).toBe(13);

    const parsed = parseGateCDecisionsImport(env);
    expect(parsed.envelope.kind).toBe("operator_authorized_export");
    expect(
      resolvePartnerReviewSessionStatus({
        decisionCount: parsed.decisions.length,
        isHypothetical: parsed.envelope.isHypothetical,
      }),
    ).toBe("decisions_imported");
  });
});
