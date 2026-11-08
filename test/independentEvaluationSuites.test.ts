/**
 * PR 8 — Independent evaluation suites.
 * Deterministic contracts + honesty gates. Does not invent SME scores or live success.
 */
import {describe, expect, test} from "bun:test";
import {createHash} from "node:crypto";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  LIVING_EVIDENCE_DISEASE_PINS,
  LIVING_EVIDENCE_NCT_PINS,
  LIVING_EVIDENCE_PMID_PINS,
} from "../src/evidence/livingEvidenceExpansion";
import {SSC_INITIAL_PMIDS} from "../src/evidenceIngestion";
import {
  REPRESENTATIVE_WALKTHROUGH_QUESTIONS,
  assertQuestionsAvoidPinnedFixtures,
  buildIndependentEvaluationSuites,
  buildLiveIntegrationAttemptReceipt,
  isLiveIntegrationGateOpen,
  parseIndependentEvaluationSuites,
  LIVE_INTEGRATION_ENV_FLAG,
} from "../src/evidence/independentEvaluationSuites";

const root = resolve(import.meta.dir, "..");
const generatedAt = "2026-11-08T22:20:00.000Z";
const limitationsPath = resolve(
  root,
  "docs/engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md",
);
const matrixPath = resolve(
  root,
  "docs/engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md",
);

describe("PR 8 independent evaluation suites — deterministic", () => {
  test("builds eng-CLEARED manifest with science/live BLOCKED and empty SME slots", () => {
    const manifest = buildIndependentEvaluationSuites({generatedAt, repoRoot: root});
    expect(manifest.engineeringScaffold).toBe("CLEARED");
    expect(manifest.scientificAcceptance).toBe("BLOCKED");
    expect(manifest.rightsAcceptance).toBe("BLOCKED");
    expect(manifest.liveJourneyAcceptance).toBe("BLOCKED");
    expect(manifest.productionReadinessClaimed).toBe(false);
    expect(manifest.ciGreenIsNotScientificValidity).toBe(true);
    expect(manifest.suites.deterministic.status).toBe("ENGINEERING_CLEARED");
    expect(manifest.suites.deterministic.scientificValidityClaimed).toBe(false);
    expect(manifest.suites.live.status).toBe("GATED_NOT_RUN");
    expect(manifest.suites.live.liveSuccessClaimed).toBe(false);
    expect(manifest.suites.live.gate.envFlag).toBe(LIVE_INTEGRATION_ENV_FLAG);
    expect(manifest.suites.live.gate.ciMustNotEnable).toBe(true);
    expect(manifest.suites.scientific.status).toBe("AWAITING_SME");
    expect(manifest.suites.scientific.smeSlotsFilled).toBe(0);
    expect(manifest.suites.scientific.scorecard).toHaveLength(7);
    expect(manifest.suites.scientific.scorecard.every((s) => s.value === null)).toBe(true);
    expect(manifest.suites.scientific.failureModeContracts).toHaveLength(4);
    expect(manifest.suites.scientific.expertReviewSlots.every((s) => !s.filled)).toBe(true);
    expect(parseIndependentEvaluationSuites(manifest).inventoryHash).toBe(manifest.inventoryHash);
  });

  test("scorecard dimensions and failure modes stay orthogonal contracts", () => {
    const manifest = buildIndependentEvaluationSuites({generatedAt, repoRoot: root});
    const dims = manifest.suites.scientific.scorecard.map((s) => s.dimensionId);
    expect(dims).toEqual([
      "citation_correctness",
      "citation_supports_statement",
      "biological_context_accuracy",
      "contradiction_retrieval",
      "gap_assessment_precision",
      "abstention_quality",
      "expert_rated_research_usefulness",
    ]);
    const modes = manifest.suites.scientific.failureModeContracts.map((m) => m.modeId);
    expect(modes).toEqual([
      "citation_points_to_real_source",
      "citation_supports_statement",
      "retrieved_evidence_matches_species_tissue_context",
      "overall_conclusion_justified",
    ]);
    for (const mode of manifest.suites.scientific.failureModeContracts) {
      expect(mode.scored).toBe(false);
      expect(mode.taxonomyContractTestable).toBe(true);
      expect(mode.distinctFrom.length).toBe(3);
      expect(mode.distinctFrom).not.toContain(mode.modeId);
    }
  });

  test("walkthrough questions avoid living-evidence and SSC fixture pins", () => {
    assertQuestionsAvoidPinnedFixtures(REPRESENTATIVE_WALKTHROUGH_QUESTIONS);
    const pins = [
      ...LIVING_EVIDENCE_PMID_PINS,
      ...SSC_INITIAL_PMIDS,
      ...LIVING_EVIDENCE_NCT_PINS,
      ...LIVING_EVIDENCE_DISEASE_PINS,
    ];
    for (const q of REPRESENTATIVE_WALKTHROUGH_QUESTIONS) {
      expect(q.embedsPinnedFixtureIds).toBe(false);
      for (const pin of pins) {
        expect(q.question.includes(pin)).toBe(false);
      }
    }
    expect(REPRESENTATIVE_WALKTHROUGH_QUESTIONS.some((q) => q.domain === "autoimmune")).toBe(
      true,
    );
    expect(REPRESENTATIVE_WALKTHROUGH_QUESTIONS.some((q) => q.domain === "inflammatory")).toBe(
      true,
    );
    expect(REPRESENTATIVE_WALKTHROUGH_QUESTIONS.some((q) => q.domain === "translational")).toBe(
      true,
    );
  });

  test("researcher workflow comparison keeps quality and time separate and empty", () => {
    const manifest = buildIndependentEvaluationSuites({generatedAt, repoRoot: root});
    const slots = manifest.suites.scientific.researcherWorkflowComparison.slots;
    expect(slots.length).toBe(REPRESENTATIVE_WALKTHROUGH_QUESTIONS.length);
    for (const slot of slots) {
      expect(slot.reportQualitySeparately).toBe(true);
      expect(slot.reportTimeBudgetSeparately).toBe(true);
      expect(slot.qualityScore).toBe(null);
      expect(slot.timeBudgetMinutes).toBe(null);
      expect(slot.arms).toEqual(["hsi_assisted", "conventional_researcher"]);
    }
  });

  test("limitations report and matrix document the three suites", () => {
    expect(existsSync(limitationsPath)).toBe(true);
    expect(existsSync(matrixPath)).toBe(true);
    const limitations = readFileSync(limitationsPath, "utf8");
    const matrix = readFileSync(matrixPath, "utf8");
    for (const needle of [
      "Deterministic regression",
      "Live integration",
      "Scientific evaluation",
      "HSI_LIVE_INTEGRATION_EVAL",
      "smeSlotsFilled=0",
      "CI green is not scientific",
      "human queue",
    ]) {
      expect(limitations).toContain(needle);
    }
    expect(matrix).toContain("**8**");
    expect(matrix).toMatch(/[Ii]ndependent evaluation/);
  });
});

describe("PR 8 independent evaluation suites — live gate honesty", () => {
  test("gate is closed by default and skipped receipt never claims success", () => {
    expect(isLiveIntegrationGateOpen({})).toBe(false);
    expect(isLiveIntegrationGateOpen({[LIVE_INTEGRATION_ENV_FLAG]: "0"})).toBe(false);
    const receipt = buildLiveIntegrationAttemptReceipt({
      attemptedAt: generatedAt,
      gateOpen: false,
    });
    expect(receipt.status).toBe("skipped_gate");
    expect(receipt.liveSuccessClaimed).toBe(false);
    expect(receipt.scientificValidityClaimed).toBe(false);
    expect(receipt.stages.every((s) => s.outcome === "skipped_gate")).toBe(true);
  });

  test("open gate without stage evidence reports failed_honest — not success", () => {
    expect(isLiveIntegrationGateOpen({[LIVE_INTEGRATION_ENV_FLAG]: "1"})).toBe(true);
    const receipt = buildLiveIntegrationAttemptReceipt({
      attemptedAt: generatedAt,
      gateOpen: true,
    });
    expect(receipt.status).toBe("attempted");
    expect(receipt.liveSuccessClaimed).toBe(false);
    expect(receipt.stages.every((s) => s.outcome === "failed_honest")).toBe(true);
  });

  test("refuses invented SME scores on scorecard", () => {
    const manifest = buildIndependentEvaluationSuites({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest;
    bad.suites.scientific.scorecard[0]!.value = 0.9 as unknown as null;
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseIndependentEvaluationSuites(sealed)).toThrow("null placeholders");
  });

  test("refuses claiming scientificAcceptance CLEARED", () => {
    const manifest = buildIndependentEvaluationSuites({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest & {
      scientificAcceptance: string;
    };
    bad.scientificAcceptance = "CLEARED";
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseIndependentEvaluationSuites(sealed)).toThrow();
  });

  test("refuses liveSuccessClaimed true on sealed live suite", () => {
    const manifest = buildIndependentEvaluationSuites({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest;
    bad.suites.live.liveSuccessClaimed = true as unknown as false;
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseIndependentEvaluationSuites(sealed)).toThrow("liveSuccessClaimed");
  });

  test("refuses filled expert review slots", () => {
    const manifest = buildIndependentEvaluationSuites({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest;
    bad.suites.scientific.expertReviewSlots[0]!.filled = true as unknown as false;
    bad.suites.scientific.expertReviewSlots[0]!.reviewerId = "fake-sme" as unknown as null;
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseIndependentEvaluationSuites(sealed)).toThrow("empty");
  });
});
