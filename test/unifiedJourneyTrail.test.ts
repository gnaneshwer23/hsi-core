import { describe, expect, test } from "bun:test";
import {
  assertUnifiedJourneyHonesty,
  buildUnifiedJourneyTrail,
  UNIFIED_JOURNEY_HONESTY,
  UNIFIED_JOURNEY_TRAIL_SCHEMA,
} from "../src/investigation/unifiedJourneyTrail";

const base = {
  hasRun: false,
  candidateCount: 0,
  selectedClaimId: null as string | null,
  selectedComparisonKey: null as string | null,
  comparisonPairCount: 0,
  crossDomainPathCount: 0,
  graphLoaded: false,
  gapCount: 0,
  briefOpen: false,
  libraryCount: 0,
  savedThisSession: false,
};

describe("unified journey trail", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertUnifiedJourneyHonesty(UNIFIED_JOURNEY_HONESTY);
    expect(honesty.researcherJourneyCompleteClaimed).toBe(false);
    expect(honesty.scientificApproval).toBe(false);
    expect(honesty.inventsContext).toBe(false);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.potentialContradictionIsNotProven).toBe(true);
    expect(honesty.associationIsNotCausation).toBe(true);
  });

  test("starts at ask before a run", () => {
    const trail = buildUnifiedJourneyTrail(base);
    expect(trail.schemaVersion).toBe(UNIFIED_JOURNEY_TRAIL_SCHEMA);
    expect(trail.activeStep).toBe("ask");
    expect(trail.steps.map((s) => s.id)).toEqual([
      "ask",
      "evidence",
      "passport",
      "disagreement",
      "crossDomain",
      "gaps",
      "brief",
      "save",
    ]);
  });

  test("advances through evidence, passport, disagreement, gaps, brief, save", () => {
    expect(
      buildUnifiedJourneyTrail({
        ...base,
        hasRun: true,
        candidateCount: 3,
        graphLoaded: true,
      }).activeStep,
    ).toBe("evidence");

    expect(
      buildUnifiedJourneyTrail({
        ...base,
        hasRun: true,
        candidateCount: 3,
        selectedClaimId: "c1",
        graphLoaded: true,
      }).activeStep,
    ).toBe("passport");

    expect(
      buildUnifiedJourneyTrail({
        ...base,
        hasRun: true,
        candidateCount: 3,
        selectedComparisonKey: "a::b",
        comparisonPairCount: 1,
        graphLoaded: true,
      }).activeStep,
    ).toBe("disagreement");

    expect(
      buildUnifiedJourneyTrail({
        ...base,
        hasRun: true,
        candidateCount: 3,
        crossDomainPathCount: 2,
        graphLoaded: true,
      }).activeStep,
    ).toBe("crossDomain");

    expect(
      buildUnifiedJourneyTrail({
        ...base,
        hasRun: true,
        candidateCount: 3,
        gapCount: 2,
        graphLoaded: true,
      }).activeStep,
    ).toBe("gaps");

    expect(
      buildUnifiedJourneyTrail({
        ...base,
        hasRun: true,
        candidateCount: 3,
        briefOpen: true,
        graphLoaded: true,
      }).activeStep,
    ).toBe("brief");

    expect(
      buildUnifiedJourneyTrail({
        ...base,
        hasRun: true,
        candidateCount: 3,
        briefOpen: true,
        savedThisSession: true,
        libraryCount: 1,
        graphLoaded: true,
      }).activeStep,
    ).toBe("save");
  });
});
