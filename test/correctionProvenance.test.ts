import { test, expect } from "bun:test";
import {
  emptyCorrectionProvenanceBundle,
  assertCorrectionFeedSeparation,
  routeCorrectionStub,
  CorrectionProvenanceError,
} from "../src/correctionProvenance";

test("empty correction provenance separates evaluation from training and research working-set feeds", () => {
  const bundle = emptyCorrectionProvenanceBundle();
  assertCorrectionFeedSeparation(bundle);
  expect(bundle.feeds.evaluation_frozen.writable).toBe(false);
  expect(bundle.feeds.training_permitted.requiresHumanGate).toBe(true);
  expect(bundle.feeds.research_working_set_only.notForScientificClaim).toBe(true);
  expect(bundle.records).toEqual([]);
});

test("research working-set corrections cannot enter the training feed", () => {
  expect(() =>
    routeCorrectionStub({
      id: "SYN-CORR-1",
      investigationKey: "inv-1",
      releaseId: "ra-anti-tnf-research",
      rationale: "Research working-set review note",
      createdAt: "2026-11-03T16:05:00.000Z",
      intendedFeed: "training_permitted",
    }),
  ).toThrow(CorrectionProvenanceError);
  const research = routeCorrectionStub({
    id: "SYN-CORR-2",
    investigationKey: "inv-1",
    releaseId: "ra-anti-tnf-research",
    rationale: "Research working-set review note",
    createdAt: "2026-11-03T16:05:00.000Z",
    intendedFeed: "research_working_set_only",
  });
  expect(research.feed).toBe("research_working_set_only");
  expect(research.notForScientificClaim).toBe(true);
});
