import { describe, expect, test } from "bun:test";
import {
  GATE_C_DECISIONS_IMPORT_SCHEMA,
  buildAwaitingGateCDecisionsTemplate,
  buildCuratorUxBundle,
  buildHypotheticalGateCDecisionsFixture,
  dryRunGateCDecisionsImport,
  parseGateCDecisionsImport,
  resolvePartnerReviewSessionStatus,
} from "../src/index";

describe("P1.7 Gate C decisions dry-run / import fixtures", () => {
  test("awaiting empty template has no decisions and stays not production-approved", () => {
    const envelope = buildAwaitingGateCDecisionsTemplate({
      generatedAt: "2026-11-02T05:10:00.000Z",
    });
    expect(envelope.schemaVersion).toBe(GATE_C_DECISIONS_IMPORT_SCHEMA);
    expect(envelope.kind).toBe("awaiting_empty");
    expect(envelope.decisions).toEqual([]);
    expect(envelope.productionApproved).toBe(false);
    expect(envelope.notProductionApproved).toBe(true);
    expect(envelope.inventedApoloOutcomes).toBe(false);
    expect(envelope.autoApprove).toBe(false);
    expect(envelope.mayFlipHsiGrade).toBe(false);
    expect(envelope.neonTarget).toBe("autumn-snow");
    expect(envelope.hsiNeonTarget).toBe("red-wave");
  });

  test("hypothetical schema fixture is loudly not Apolo / not production", () => {
    const fixture = buildHypotheticalGateCDecisionsFixture({
      generatedAt: "2026-11-02T05:10:00.000Z",
    });
    expect(fixture.kind).toBe("hypothetical_schema_fixture");
    expect(fixture.isHypothetical).toBe(true);
    expect(fixture.productionApproved).toBe(false);
    expect(fixture.notProductionApproved).toBe(true);
    expect(fixture.inventedApoloOutcomes).toBe(false);
    expect(fixture.decisions.length).toBe(3);
    expect(fixture.decisions.map((d) => d.decision).sort()).toEqual([
      "approve",
      "defer",
      "reject",
    ]);
    for (const d of fixture.decisions) {
      expect(d.autoApprove).toBe(false);
      expect(d.hsiGradeFlipped).toBe(false);
      expect(d.reviewedBy).toBe(
        "hypothetical-fixture-not-a-partner-signature",
      );
      expect(d.reviewerNote?.toUpperCase()).toContain("HYPOTHETICAL");
      expect(d.reviewedBy?.toLowerCase()).not.toContain("apolo");
    }
  });

  test("dry-run writes nothing and maps hypothetical → hypothetical_fixture_imported", () => {
    const fixture = buildHypotheticalGateCDecisionsFixture({
      generatedAt: "2026-11-02T05:10:00.000Z",
    });
    const report = dryRunGateCDecisionsImport(fixture, {
      generatedAt: "2026-11-02T05:10:00.000Z",
    });
    expect(report.ok).toBe(true);
    expect(report.dryRun).toBe(true);
    expect(report.wroteArtifacts).toBe(false);
    expect(report.envelope.isHypothetical).toBe(true);
    expect(report.envelope.productionApproved).toBe(false);
    expect(report.partnerReviewSessionWouldBe).toBe(
      "hypothetical_fixture_imported",
    );
    expect(report.decisionCount).toBe(3);
    expect(report.refusedAutoApprove).toBe(false);
    expect(report.refusedGradeFlip).toBe(false);
  });

  test("dry-run on empty awaiting stays awaiting_partner_review_session", () => {
    const empty = buildAwaitingGateCDecisionsTemplate({
      generatedAt: "2026-11-02T05:10:00.000Z",
    });
    const report = dryRunGateCDecisionsImport(empty, {
      generatedAt: "2026-11-02T05:10:00.000Z",
    });
    expect(report.partnerReviewSessionWouldBe).toBe(
      "awaiting_partner_review_session",
    );
    expect(report.decisionCount).toBe(0);
    expect(report.wroteArtifacts).toBe(false);
  });

  test("parse refuses productionApproved=true and autoApprove envelopes", () => {
    expect(() =>
      parseGateCDecisionsImport({
        kind: "partner_export",
        productionApproved: true,
        decisions: [],
      }),
    ).toThrow(/productionApproved/);

    expect(() =>
      parseGateCDecisionsImport({
        kind: "partner_export",
        autoApprove: true,
        decisions: [],
      }),
    ).toThrow(/autoApprove/);

    expect(() =>
      parseGateCDecisionsImport({
        kind: "awaiting_empty",
        decisions: [
          {
            edgeId: "HSI-E-IM-002",
            status: "pending",
            decision: null,
            autoApprove: false,
            hsiGradeFlipped: false,
          },
        ],
      }),
    ).toThrow(/awaiting_empty/);
  });

  test("hypothetical import into curator UX never claims decisions_imported / production", () => {
    const fixture = buildHypotheticalGateCDecisionsFixture({
      generatedAt: "2026-11-02T05:10:00.000Z",
    });
    const parsed = parseGateCDecisionsImport(fixture);
    expect(parsed.envelope.isHypothetical).toBe(true);

    const bundle = buildCuratorUxBundle({
      generatedAt: "2026-11-02T05:10:00.000Z",
      decisions: parsed.decisions,
      decisionsAreHypothetical: true,
    });

    expect(bundle.partnerReviewSession.status).toBe(
      "hypothetical_fixture_imported",
    );
    expect(bundle.partnerReviewSession.isHypothetical).toBe(true);
    expect(bundle.partnerReviewSession.productionApproved).toBe(false);
    expect(bundle.partnerReviewSession.notProductionApproved).toBe(true);
    expect(bundle.partnerReviewSession.inventedOutcomes).toBe(false);
    expect(bundle.mayFlipHsiGrade).toBe(false);
    expect(bundle.autoApproveIntoKg).toBe(false);
    expect(bundle.partnerReviewSession.note).toMatch(/HYPOTHETICAL/i);
    expect(bundle.partnerReviewSession.note).not.toMatch(
      /Apolo Pharma Gate C session complete/i,
    );
  });

  test("resolvePartnerReviewSessionStatus honesty matrix", () => {
    expect(
      resolvePartnerReviewSessionStatus({
        decisionCount: 0,
        isHypothetical: false,
      }),
    ).toBe("awaiting_partner_review_session");
    expect(
      resolvePartnerReviewSessionStatus({
        decisionCount: 2,
        isHypothetical: true,
      }),
    ).toBe("hypothetical_fixture_imported");
    expect(
      resolvePartnerReviewSessionStatus({
        decisionCount: 2,
        isHypothetical: false,
      }),
    ).toBe("decisions_imported");
  });

  test("legacy raw array still parses; dry-run does not invent Apolo", () => {
    const report = dryRunGateCDecisionsImport(
      [
        {
          edgeId: "HSI-E-IM-002",
          status: "deferred",
          decision: "defer",
          reviewerNote: "operator dry-run",
          reviewedBy: "operator",
          reviewedAt: "2026-11-02T05:10:00.000Z",
          autoApprove: false,
          hsiGradeFlipped: false,
        },
      ],
      { generatedAt: "2026-11-02T05:10:00.000Z" },
    );
    expect(report.envelope.kind).toBe("raw_array");
    expect(report.wroteArtifacts).toBe(false);
    expect(report.envelope.productionApproved).toBe(false);
  });
});
