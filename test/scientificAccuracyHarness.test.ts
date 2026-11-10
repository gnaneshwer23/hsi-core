import { describe, expect, test } from "bun:test";
import { buildScientificInvestigation } from "../src/scientificInvestigation";
import { evaluateInvestigation, loadReferenceQuestions, NOT_YET_SCORED } from "../src/scientificAccuracyHarness";

describe("scientific evaluation harness", () => {
  test("stays draft and unscored, including the systemic sclerosis reference question", () => {
    const questions = loadReferenceQuestions();
    expect(questions.status).toBe("DRAFT - awaiting expert review");
    expect(questions.reviewerName).toBeNull();
    expect(questions.approved).toBe(false);
    expect(questions.questions.map((item) => item.id)).toContain("rq-ssc-tfh-il21");
    const report = evaluateInvestigation(buildScientificInvestigation("gut-neuro"), questions);
    expect(report.scores).toEqual({
      scientificAccuracy: NOT_YET_SCORED,
      evidenceSupport: NOT_YET_SCORED,
      contradictionDetection: NOT_YET_SCORED,
      gapUsefulness: NOT_YET_SCORED,
    });
    expect(report.approved).toBe(false);
    expect(report.structuralChecks.every((item) => item.pass)).toBe(true);
    expect(JSON.stringify(report)).not.toMatch(/clinically proven|scientifically validated|approved by/i);
  });
});
