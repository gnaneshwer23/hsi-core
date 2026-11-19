import { describe, expect, test } from "bun:test";
import {
  TESTABLE_NEXT_QUESTIONS_HONESTY,
  TESTABLE_NEXT_QUESTIONS_SCHEMA,
  assertTestableNextQuestionsHonesty,
  buildTestableNextQuestions,
} from "../src/investigation/testableNextQuestions";

describe("testable next questions", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertTestableNextQuestionsHonesty(TESTABLE_NEXT_QUESTIONS_HONESTY);
    expect(honesty.unvalidatedOnly).toBe(true);
    expect(honesty.inventsExperiments).toBe(false);
    expect(honesty.scientificApproval).toBe(false);
    expect(honesty.clinicalAdvice).toBe(false);
    expect(honesty.recommendsAction).toBe(false);
    expect(honesty.journeyCompleteClaimed).toBe(false);
  });

  test("stays empty before gaps or hypotheses", () => {
    const pack = buildTestableNextQuestions({
      gaps: [],
      hypotheses: [],
      hypothesesStatus: "not_configured",
    });
    expect(pack.schemaVersion).toBe(TESTABLE_NEXT_QUESTIONS_SCHEMA);
    expect(pack.items).toEqual([]);
    expect(pack.note).toContain("No testable next questions yet");
  });

  test("derives demoted items from gaps and unvalidated hypotheses without inventing experiments", () => {
    const pack = buildTestableNextQuestions({
      gaps: [
        {
          id: "rg:il21:disputed_claims:all",
          scope: "scientific",
          title: "1 claim the two checks disagreed on",
          detail: "Direction unresolved.",
          nextStep: "Read the source passages.",
          candidateIds: ["c1"],
        },
        {
          id: "rg:il21:search_failed:openalex",
          scope: "retrieval",
          title: "Search failed: openalex",
          detail: "HTTP 500",
          nextStep: "Re-run the investigation.",
          candidateIds: [],
        },
      ],
      hypotheses: [
        {
          id: "h1",
          statement: "Blocking IL-21 reduces Tfh expansion.",
          rationale: "Cited finding links IL-21 to Tfh.",
          prediction: "Fewer Tfh cells.",
          experiment: "Culture with IL-21 blocking antibody.",
          falsifier: "No change in Tfh numbers.",
          limits: "Association only.",
          citedClaimIds: ["c1"],
          state: "unvalidated_hypothesis",
          challenge: { verdict: "overreach", reason: "Blockade not in findings." },
        },
      ],
      hypothesesStatus: "generated",
    });

    expect(pack.gapDerivedCount).toBe(2);
    expect(pack.hypothesisDerivedCount).toBe(1);
    expect(pack.items).toHaveLength(3);
    expect(pack.items.every((i) => i.demoted && i.scientificApproval === false)).toBe(true);
    expect(pack.items[0]?.nextStep).toBe("Read the source passages.");
    expect(pack.items[0]?.scopeLabel).toContain("Scientific gap");
    expect(pack.items[1]?.scopeLabel).toContain("Retrieval limit");
    const hyp = pack.items[2];
    expect(hyp?.source).toBe("unvalidated_hypothesis");
    expect(hyp?.prediction).toBe("Fewer Tfh cells.");
    expect(hyp?.falsifier).toBe("No change in Tfh numbers.");
    expect(hyp?.why).toContain("overreach");
    expect(pack.honesty.inventsExperiments).toBe(false);
    expect(pack.honesty.recommendsAction).toBe(false);
  });
});
