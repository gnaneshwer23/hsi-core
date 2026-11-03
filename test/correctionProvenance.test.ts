import { test, expect } from "bun:test";
import {
  emptyCorrectionProvenanceBundle,
  assertCorrectionFeedSeparation,
  routeCorrectionStub,
  CorrectionProvenanceError,
} from "../src/correctionProvenance";

test("empty correction provenance separates evaluation from training and demo feeds", () => {
  const bundle = emptyCorrectionProvenanceBundle();
  assertCorrectionFeedSeparation(bundle);
  expect(bundle.feeds.evaluation_frozen.writable).toBe(false);
  expect(bundle.feeds.training_permitted.requiresHumanGate).toBe(true);
  expect(bundle.feeds.demo_fixture_only.notForScientificClaim).toBe(true);
  expect(bundle.records).toEqual([]);
});

test("demo corrections cannot enter the training feed", () => {
  expect(() =>
    routeCorrectionStub({
      id: "SYN-CORR-1",
      investigationKey: "inv-1",
      releaseId: "ra-anti-tnf-demo",
      rationale: "Demo review note",
      createdAt: "2026-11-03T16:05:00.000Z",
      intendedFeed: "training_permitted",
    }),
  ).toThrow(CorrectionProvenanceError);
  const demo = routeCorrectionStub({
    id: "SYN-CORR-2",
    investigationKey: "inv-1",
    releaseId: "ra-anti-tnf-demo",
    rationale: "Demo review note",
    createdAt: "2026-11-03T16:05:00.000Z",
    intendedFeed: "demo_fixture_only",
  });
  expect(demo.feed).toBe("demo_fixture_only");
  expect(demo.notForScientificClaim).toBe(true);
});
