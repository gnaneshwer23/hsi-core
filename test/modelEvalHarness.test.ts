import { describe, expect, test } from "bun:test";
import {
  MODEL_EVAL_CHECK_IDS,
  MODEL_EVAL_HARNESS_STUB,
  buildDemoModelEvalCases,
  buildFrozenPublicPackFixtures,
  buildGateCChecklist,
  buildModelEvalHarnessBundle,
  detectClinicalPhiClaims,
  extractCitedEdgeIds,
  scoreModelEvalSubject,
  serializeModelEvalHarness,
  serializeModelEvalHarnessMarkdown,
} from "../src/index";

describe("P2.3 offline model eval harness", () => {
  test("schema stub is wired for offline checks and forbids PHI/training/grade flips", () => {
    expect(MODEL_EVAL_HARNESS_STUB.status).toBe("wired_offline_stub");
    expect(MODEL_EVAL_HARNESS_STUB.mayUseLivePhi).toBe(false);
    expect(MODEL_EVAL_HARNESS_STUB.mayTrainModels).toBe(false);
    expect(MODEL_EVAL_HARNESS_STUB.mayFlipEvidenceGrade).toBe(false);
    expect(MODEL_EVAL_HARNESS_STUB.autoApprove).toBe(false);
    expect(MODEL_EVAL_HARNESS_STUB.autoApproveIntoKg).toBe(false);
    expect(MODEL_EVAL_HARNESS_STUB.containsPhi).toBe(false);
    expect(MODEL_EVAL_HARNESS_STUB.packsRemainAuthority).toBe(true);
    expect(MODEL_EVAL_HARNESS_STUB.exportArtifact).toBe(
      "hsi-model-eval-harness.json",
    );
    expect(MODEL_EVAL_HARNESS_STUB.runtimeModule).toBe(
      "src/modelEvalHarness.ts",
    );
    for (const id of MODEL_EVAL_CHECK_IDS) {
      expect(MODEL_EVAL_HARNESS_STUB.checkIds).toContain(id);
    }
  });

  test("frozen fixtures cover RA/SSc/gut/neuro public packs", () => {
    const fixtures = buildFrozenPublicPackFixtures();
    expect(fixtures.length).toBeGreaterThanOrEqual(20);
    const packs = new Set(fixtures.map((f) => f.packId));
    expect(packs.has("hsi-pilot-ra-tnf")).toBe(true);
    expect(packs.has("hsi-ssc-pathway-pack")).toBe(true);
    expect(packs.has("hsi-gut-immune-pack")).toBe(true);
    expect(packs.has("hsi-neuroimmune-pack")).toBe(true);
    expect(fixtures.some((f) => f.edgeId === "HSI-E-RA-001")).toBe(true);
    expect(fixtures.some((f) => f.edgeId === "HSI-E-SSC-001")).toBe(true);
    expect(fixtures.some((f) => f.edgeId === "HSI-E-GUT-003")).toBe(true);
    expect(fixtures.some((f) => f.edgeId === "HSI-E-NI-001")).toBe(true);
  });

  test("extractCitedEdgeIds + clinical/PHI detector", () => {
    expect(
      extractCitedEdgeIds({
        evidenceHints: ["edge:HSI-E-SSC-001", "PMID:30760472"],
        textBlobs: ["mentions HSI-E-RA-006 in notes"],
        citedEdgeIds: ["HSI-E-NI-001"],
      }),
    ).toEqual(["HSI-E-NI-001", "HSI-E-RA-006", "HSI-E-SSC-001"]);

    expect(detectClinicalPhiClaims(["research only"]).hit).toBe(false);
    expect(
      detectClinicalPhiClaims([
        "claims clinical cure and includes PHI / MRN language",
      ]).hit,
    ).toBe(true);
    expect(
      detectClinicalPhiClaims(["partnerSigned=true fake MoU"]).matches,
    ).toContain("partner_signed_fake");
  });

  test("demo bundle stubBehaviorGreen; intentional fails fail-closed", () => {
    const generatedAt = "2026-11-01T19:00:00.000Z";
    const bundle = buildModelEvalHarnessBundle({ generatedAt });
    expect(bundle.schemaVersion).toBe("hsi-model-eval-harness-1");
    expect(bundle.status).toBe("wired_offline_stub");
    expect(bundle.offlineOnly).toBe(true);
    expect(bundle.mayUseLivePhi).toBe(false);
    expect(bundle.mayTrainModels).toBe(false);
    expect(bundle.containsPhi).toBe(false);
    expect(bundle.packsRemainAuthority).toBe(true);
    expect(bundle.summary.stubBehaviorGreen).toBe(true);
    expect(bundle.summary.caseCount).toBeGreaterThanOrEqual(7);
    expect(bundle.summary.intentionalFailCorrect).toBeGreaterThanOrEqual(4);

    const byId = Object.fromEntries(bundle.cases.map((c) => [c.caseId, c]));
    expect(byId["EVAL-PASS-PROPOSAL-SSC-001"]?.passed).toBe(true);
    expect(byId["EVAL-PASS-SIDECAR-RA-001"]?.passed).toBe(true);
    expect(byId["EVAL-FAIL-UNKNOWN-EDGE"]?.passed).toBe(false);
    expect(byId["EVAL-FAIL-UNKNOWN-EDGE"]?.failClosed).toBe(true);
    expect(byId["EVAL-FAIL-GRADE-FLIP"]?.passed).toBe(false);
    expect(byId["EVAL-FAIL-CLINICAL-PHI"]?.passed).toBe(false);
    expect(byId["EVAL-FAIL-CLINICAL-PHI"]?.failClosed).toBe(true);
    expect(byId["EVAL-FAIL-SIDECAR-NO-LOCATOR"]?.passed).toBe(false);
    expect(byId["EVAL-FAIL-MISSING-FIELDS"]?.passed).toBe(false);

    const json = JSON.parse(serializeModelEvalHarness(bundle)) as {
      summary: { stubBehaviorGreen: boolean };
    };
    expect(json.summary.stubBehaviorGreen).toBe(true);
    const md = serializeModelEvalHarnessMarkdown(bundle);
    expect(md).toContain("fail-closed");
    expect(md).toContain("EVAL-FAIL-CLINICAL-PHI");
  });

  test("scoreModelEvalSubject rejects grade flip and unknown edges directly", () => {
    const fixtures = buildFrozenPublicPackFixtures();
    const badGrade = scoreModelEvalSubject(
      {
        caseId: "unit-grade",
        kind: "model_proposal",
        label: "bad",
        expectPass: false,
        subject: {
          proposalId: "x",
          sourceAdapterOrAgent: "stub",
          proposedSubject: "a",
          proposedPredicate: "associated_with",
          proposedObject: "b",
          contextNote: "ok",
          evidenceHints: ["edge:HSI-E-RA-001"],
          suggestedTeachingStatus: "hypothesized",
          createdAt: "2026-11-01T19:00:00.000Z",
          hsiGrade: "established",
        },
      },
      fixtures,
    );
    expect(badGrade.passed).toBe(false);
    expect(
      badGrade.checks.find((c) => c.checkId === "grade_not_flipped")?.passed,
    ).toBe(false);

    const badEdge = scoreModelEvalSubject(
      {
        caseId: "unit-edge",
        kind: "model_proposal",
        label: "bad edge",
        expectPass: false,
        subject: {
          proposalId: "y",
          sourceAdapterOrAgent: "stub",
          proposedSubject: "a",
          proposedPredicate: "associated_with",
          proposedObject: "b",
          contextNote: "ok",
          evidenceHints: ["edge:HSI-E-DOES-NOT-EXIST"],
          suggestedTeachingStatus: "hypothesized",
          createdAt: "2026-11-01T19:00:00.000Z",
        },
      },
      fixtures,
    );
    expect(badEdge.passed).toBe(false);
    expect(
      badEdge.checks.find((c) => c.checkId === "cited_edge_ids_exist")?.passed,
    ).toBe(false);
  });

  test("demo case inputs stay offline and Gate C notes eval harness", () => {
    const cases = buildDemoModelEvalCases({
      createdAt: "2026-11-01T19:00:00.000Z",
    });
    expect(cases.some((c) => c.expectPass === false)).toBe(true);
    expect(cases.some((c) => c.kind === "embedding_sidecar")).toBe(true);

    const checklist = buildGateCChecklist({
      generatedAt: "2026-11-01T19:00:00.000Z",
    });
    expect(
      checklist.instructions.some((s) => s.includes("eval harness")),
    ).toBe(true);
    expect(checklist.autoApproveIntoKg).toBe(false);
  });
});
