import {describe, expect, test} from "bun:test";
import {
  emptyLiveStructuredComparison,
  renderLiveBriefComparisonSections,
} from "../src/investigation/liveBriefComparison";
import {
  bindComparisonOutcomeToVerification,
  buildLiveStructuredComparison,
  type LiveComparisonCandidate,
} from "../src/investigation/liveRunComparison";
import {renderLiveBriefMarkdown} from "../src/investigation/liveBrief";
import type {LiveInvestigation} from "../src/investigation/liveRun";

const cand = (
  o: Partial<LiveComparisonCandidate> & Pick<LiveComparisonCandidate, "id">,
): LiveComparisonCandidate => ({
  relationId: "il21-tfh",
  subject: "IL-21",
  object: "T follicular helper cells",
  contexts: ["ssc"],
  species: "human",
  sourceId: `s-${o.id}`,
  polarity: "supporting",
  verification: "agree_directional",
  ...o,
});

describe("live structured comparison binding", () => {
  test("abstains from potential_contradiction when verification is incomplete", () => {
    expect(
      bindComparisonOutcomeToVerification("potential_contradiction", "not_run", "agree_directional")
        .outcome,
    ).toBe("insufficient_evidence");
    expect(
      bindComparisonOutcomeToVerification("potential_contradiction", "disputed", "agree_directional")
        .outcome,
    ).toBe("insufficient_evidence");
    expect(
      bindComparisonOutcomeToVerification(
        "potential_contradiction",
        "agree_directional",
        "agree_directional",
      ).outcome,
    ).toBe("potential_contradiction");
    expect(
      bindComparisonOutcomeToVerification("context_dependent", "not_run", "not_run").outcome,
    ).toBe("context_dependent");
  });

  test("compares same-relation pairs and keeps honesty flags", () => {
    const pack = buildLiveStructuredComparison({
      candidates: [
        cand({id: "c1", contexts: ["ssc"], polarity: "supporting", verification: "agree_directional"}),
        cand({
          id: "c2",
          contexts: ["ra"],
          polarity: "opposing",
          verification: "agree_directional",
          species: "mouse",
        }),
        cand({id: "c3", relationId: "other", contexts: ["ssc"]}),
      ],
      contextLabels: {ssc: "Systemic sclerosis", ra: "Rheumatoid arthritis"},
    });
    expect(pack.schemaVersion).toBe("hsi-live-structured-comparison-1");
    expect(pack.pairCount).toBe(1);
    expect(pack.honesty.scientificApproval).toBe(false);
    expect(pack.honesty.graphPromotable).toBe(false);
    expect(pack.honesty.neonContradictionLedger).toBe(false);
    expect(pack.honesty.verificationBoundBeforeContradictionLanguage).toBe(true);
    expect(pack.honesty.potentialContradictionIsNotProvenContradiction).toBe(true);
    expect(pack.items[0]!.contextDepth).toBe("coarse_metadata_only");
    expect(pack.items[0]!.needsHumanReview).toBe(true);
    // Different disease + species → not a proven contradiction; typically context_dependent
    // or insufficient_* depending on axis overlap.
    expect(pack.items[0]!.outcome).not.toBe("potential_contradiction");
  });

  test("verification bind rewrites opposing same-context unchecked pairs", () => {
    const pack = buildLiveStructuredComparison({
      candidates: [
        cand({
          id: "a",
          contexts: ["ssc"],
          species: "human",
          polarity: "supporting",
          verification: "not_run",
        }),
        cand({
          id: "b",
          contexts: ["ssc"],
          species: "human",
          polarity: "opposing",
          verification: "not_run",
        }),
      ],
      contextLabels: {ssc: "Systemic sclerosis"},
    });
    expect(pack.pairCount).toBe(1);
    if (pack.items[0]!.engineOutcome === "potential_contradiction") {
      expect(pack.items[0]!.outcome).toBe("insufficient_evidence");
      expect(pack.items[0]!.verificationBindNote).toMatch(/Verification incomplete/i);
    }
    expect(pack.summary.potentialContradiction).toBe(0);
  });

  test("brief markdown includes comparison section and honesty", () => {
    const comparison = buildLiveStructuredComparison({
      candidates: [
        cand({id: "c1", polarity: "supporting"}),
        cand({id: "c2", contexts: ["ra"], polarity: "opposing", species: "mouse"}),
      ],
      contextLabels: {ssc: "Systemic sclerosis", ra: "Rheumatoid arthritis"},
    });
    const md = renderLiveBriefComparisonSections(comparison);
    expect(md).toContain("## Structured evidence comparison (candidate)");
    expect(md).toContain("potential_contradiction is not a proven contradiction");
    expect(md).toContain("Verification is bound before contradiction language");
    expect(md.toLowerCase()).not.toContain("scientifically approved");
    expect(renderLiveBriefComparisonSections(undefined)).toContain("No comparable claim pairs");
    expect(emptyLiveStructuredComparison().pairCount).toBe(0);
  });

  test("live brief renderer splices comparison when attached", () => {
    const structuredComparison = buildLiveStructuredComparison({
      candidates: [
        cand({id: "c1"}),
        cand({id: "c2", contexts: ["ra"], polarity: "opposing", species: null}),
      ],
      contextLabels: {ssc: "Systemic sclerosis", ra: "Rheumatoid arthritis"},
    });
    const run = {
      schemaVersion: "hsi-live-investigation-1",
      mode: "live",
      scenarioId: "il21-autoimmune",
      question: "Why might IL-21 signalling differ across autoimmune contexts?",
      version: 1,
      briefHash: "a".repeat(64),
      entities: ["IL-21"],
      searches: [],
      records: [],
      targets: [],
      candidates: [],
      byContext: {},
      verification: {
        status: "completed",
        reason: null,
        checked: 2,
        independence: "independent_execution_only",
      },
      hypotheses: {
        status: "not_configured",
        reason: "none",
        items: [],
        dropped: 0,
        basis: {findings: 0},
      },
      structuredComparison,
      gaps: [],
      budget: null,
      flags: {
        scientificApproval: false,
        graphPromotable: false,
        consensusEstablished: false,
        humanReview: "required",
        clinicalAdvice: false,
        containsPhi: false,
      },
      events: [],
    } as LiveInvestigation;
    const md = renderLiveBriefMarkdown(run);
    expect(md).toContain("## Structured evidence comparison (candidate)");
    expect(md).toContain("potential_contradiction is not proven contradiction");
  });
});
