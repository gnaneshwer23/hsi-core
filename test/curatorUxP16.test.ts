import { describe, expect, test } from "bun:test";
import {
  CURATOR_UX_SCHEMA,
  assertSafeCuratorDecision,
  buildCuratorUxBundle,
  buildGateCChecklist,
  buildSchemaGapReport,
  parseCuratorGateCDecisions,
  serializeCuratorUxMarkdown,
  serializeRichGapReportMarkdown,
  serializeRichGateCChecklistMarkdown,
  type CuratorGateCDecision,
} from "../src/index";

describe("P1.6 curator UX — richer gap / Gate C scaffolding", () => {
  test("default bundle awaits partner review session; no invented outcomes", () => {
    const bundle = buildCuratorUxBundle({
      generatedAt: "2026-11-02T05:00:00.000Z",
      decisions: [],
    });

    expect(bundle.schemaVersion).toBe(CURATOR_UX_SCHEMA);
    expect(bundle.notCds).toBe(true);
    expect(bundle.autoApproveIntoKg).toBe(false);
    expect(bundle.mayFlipHsiGrade).toBe(false);
    expect(bundle.partnerReviewSession.status).toBe(
      "awaiting_partner_review_session",
    );
    expect(bundle.partnerReviewSession.humanDecisionCount).toBe(0);
    expect(bundle.partnerReviewSession.inventedOutcomes).toBe(false);
    expect(bundle.partnerReviewSession.isiNeonTarget).toBe("autumn-snow");
    expect(bundle.partnerReviewSession.hsiNeonTarget).toBe("red-wave");
    expect(bundle.gateCQueue.decidedCount).toBe(0);
    expect(bundle.gateCQueue.actionableCount).toBeGreaterThan(0);
    expect(bundle.gateCQueue.items.every((i) => i.autoApprove === false)).toBe(
      true,
    );
    expect(
      bundle.gateCQueue.items.every((i) => i.mayFlipHsiGrade === false),
    ).toBe(true);
    expect(bundle.gapAnalysis.buckets.length).toBe(5);
    expect(bundle.gapAnalysis.gapRowCount).toBeGreaterThan(0);
  });

  test("rich gap markdown includes buckets and backlog table", () => {
    const gap = buildSchemaGapReport({
      generatedAt: "2026-11-02T05:00:00.000Z",
    });
    const md = serializeRichGapReportMarkdown(gap);
    expect(md).toContain("# HSI schema gap report (curator)");
    expect(md).toContain("## Gap buckets (by missing slot)");
    expect(md).toContain("`gate_c_approved`");
    expect(md).toContain("## Gap rows (curator backlog)");
    expect(md).not.toMatch(/human_approved|Apolo approved all/i);
  });

  test("rich Gate C markdown notes awaiting partner when decisions empty", () => {
    const gateC = buildGateCChecklist({
      generatedAt: "2026-11-02T05:00:00.000Z",
    });
    const md = serializeRichGateCChecklistMarkdown(gateC, []);
    expect(md).toContain("Awaiting partner review session");
    expect(md).toContain("mayFlipHsiGrade=false");
    expect(md).toContain("autumn-snow");
    expect(md).toContain("## Gate C queue (mapped REL)");
    expect(md).not.toContain("**human_approved**");
  });

  test("imported immunecity-shaped decisions merge without flipping grades", () => {
    const gateC = buildGateCChecklist({
      generatedAt: "2026-11-02T05:00:00.000Z",
    });
    const pending = gateC.rows.find(
      (r) => r.gateCStatus === "pending" && r.isiRelationshipId,
    );
    expect(pending).toBeTruthy();

    const decision: CuratorGateCDecision = {
      edgeId: pending!.edgeId,
      status: "human_approved",
      decision: "approve",
      reviewerNote: "fixture import for merge test only",
      reviewedBy: "test-reviewer",
      reviewedAt: "2026-11-02T05:00:00.000Z",
      isiRelationshipId: pending!.isiRelationshipId,
      pmid: pending!.pmid,
      autoApprove: false,
      hsiGradeFlipped: false,
    };

    const bundle = buildCuratorUxBundle({
      generatedAt: "2026-11-02T05:00:00.000Z",
      gateC,
      decisions: [decision],
    });

    expect(bundle.partnerReviewSession.status).toBe("decisions_imported");
    expect(bundle.partnerReviewSession.humanDecisionCount).toBe(1);
    expect(bundle.partnerReviewSession.inventedOutcomes).toBe(false);
    expect(bundle.mayFlipHsiGrade).toBe(false);

    const row = bundle.gateCQueue.items.find((i) => i.edgeId === pending!.edgeId);
    expect(row?.effectiveStatus).toBe("human_approved");
    expect(row?.decision).toBe("approve");
    expect(row?.actionable).toBe(false);
    expect(row?.mayFlipHsiGrade).toBe(false);

    const md = serializeRichGateCChecklistMarkdown(gateC, [decision]);
    expect(md).toContain("Human decisions imported");
    expect(md).toContain("**human_approved**");
    expect(md).not.toContain("Awaiting partner review session");
  });

  test("parseCuratorGateCDecisions refuses autoApprove / grade flip claims", () => {
    expect(() =>
      parseCuratorGateCDecisions([
        {
          edgeId: "HSI-E-IM-002",
          status: "human_approved",
          decision: "approve",
          autoApprove: true,
        },
      ]),
    ).toThrow(/autoApprove/);

    expect(() =>
      parseCuratorGateCDecisions([
        {
          edgeId: "HSI-E-IM-002",
          status: "human_approved",
          decision: "approve",
          hsiGradeFlipped: true,
        },
      ]),
    ).toThrow(/hsiGradeFlipped/);

    expect(() =>
      assertSafeCuratorDecision({
        edgeId: "x",
        status: "pending",
        decision: null,
        reviewerNote: null,
        reviewedBy: null,
        reviewedAt: null,
        isiRelationshipId: null,
        pmid: null,
        autoApprove: false,
        hsiGradeFlipped: false,
      }),
    ).not.toThrow();
  });

  test("curator briefing markdown surfaces awaiting banner by default", () => {
    const md = serializeCuratorUxMarkdown(
      buildCuratorUxBundle({ generatedAt: "2026-11-02T05:00:00.000Z" }),
    );
    expect(md).toContain("# HSI curator UX briefing");
    expect(md).toContain("awaiting_partner_review_session");
    expect(md).toContain("/curator");
    expect(md).toContain("## Gap analysis snapshot");
    expect(md).toContain("## Gate C queue snapshot");
  });
});
