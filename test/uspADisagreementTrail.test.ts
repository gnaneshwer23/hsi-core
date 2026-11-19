import { describe, expect, test } from "bun:test";
import {
  emptyLiveStructuredComparison,
  type LiveComparisonItem,
} from "../src/investigation/liveBriefComparison";
import {
  assertUspATrailHonesty,
  buildUspADisagreementTrail,
  comparisonPairKey,
  findComparisonItem,
  USP_A_TRAIL_HONESTY,
} from "../src/investigation/uspADisagreementTrail";

const sampleItem = (overrides: Partial<LiveComparisonItem> = {}): LiveComparisonItem => ({
  leftId: "c1",
  rightId: "c2",
  leftLabel: "IL-21 → Tfh (RA)",
  rightLabel: "IL-21 → Tfh (SSc)",
  leftContexts: ["ra"],
  rightContexts: ["ssc"],
  engineOutcome: "context_dependent",
  outcome: "context_dependent",
  rationale: "Disease context differs; tissue not stated on both sides.",
  verificationBindNote: null,
  verificationLeft: "agreed",
  verificationRight: "agreed",
  sharedSubjectObject: true,
  contextDepth: "coarse_metadata_only",
  needsHumanReview: true,
  potentialContradictionIsNotProven: true,
  ...overrides,
});

describe("USP A disagreement trail", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertUspATrailHonesty(USP_A_TRAIL_HONESTY);
    expect(honesty.scientificApproval).toBe(false);
    expect(honesty.inventsContext).toBe(false);
    expect(honesty.potentialContradictionIsNotProven).toBe(true);
    expect(honesty.usp).toBe("A");
  });

  test("starts at ask before a run", () => {
    const trail = buildUspADisagreementTrail({
      hasRun: false,
      candidateCount: 0,
      selectedClaimId: null,
      selectedComparisonKey: null,
      comparison: null,
      briefOpen: false,
    });
    expect(trail.activeStep).toBe("ask");
    expect(trail.steps).toHaveLength(5);
    expect(trail.steps.map((s) => s.id)).toEqual([
      "ask",
      "evidence",
      "passport",
      "disagreement",
      "brief",
    ]);
  });

  test("advances through evidence, passport, disagreement, brief", () => {
    const comparison = {
      ...emptyLiveStructuredComparison(),
      pairCount: 1,
      items: [sampleItem()],
      summary: {
        ...emptyLiveStructuredComparison().summary,
        contextDependent: 1,
      },
    };
    const key = comparisonPairKey(comparison.items[0]!);
    expect(findComparisonItem(comparison, key)?.outcome).toBe("context_dependent");

    expect(
      buildUspADisagreementTrail({
        hasRun: true,
        candidateCount: 4,
        selectedClaimId: null,
        selectedComparisonKey: null,
        comparison,
        briefOpen: false,
      }).activeStep,
    ).toBe("evidence");

    expect(
      buildUspADisagreementTrail({
        hasRun: true,
        candidateCount: 4,
        selectedClaimId: "c1",
        selectedComparisonKey: null,
        comparison,
        briefOpen: false,
      }).activeStep,
    ).toBe("passport");

    expect(
      buildUspADisagreementTrail({
        hasRun: true,
        candidateCount: 4,
        selectedClaimId: "c1",
        selectedComparisonKey: key,
        comparison,
        briefOpen: false,
      }).activeStep,
    ).toBe("disagreement");

    expect(
      buildUspADisagreementTrail({
        hasRun: true,
        candidateCount: 4,
        selectedClaimId: "c1",
        selectedComparisonKey: key,
        comparison,
        briefOpen: true,
      }).activeStep,
    ).toBe("brief");
  });
});
