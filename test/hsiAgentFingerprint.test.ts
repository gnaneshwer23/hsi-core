import {test, expect} from "bun:test";
import {
  fingerprintsEqual,
  hashHsiAgentFingerprint,
  HSI_FP_CANONICAL_SORTED_V1,
  HSI_FP_JSON_INSERTION_ORDER_V1,
  HSI_FINGERPRINT_MIGRATION_POLICY,
  validateHsiReviewRevisionRound,
  type HsiReviewRevisionRound,
} from "../src/hsiAgentFingerprint";
import {hashHsiCheckpointInput} from "../src/hsiAgentDurableCheckpoint";

test("migration policy forbids in-place rewrite and cross-algorithm equality", () => {
  expect(HSI_FINGERPRINT_MIGRATION_POLICY.rewriteHistoricalDigestsInPlace).toBe(false);
  expect(HSI_FINGERPRINT_MIGRATION_POLICY.crossAlgorithmEqualityAllowed).toBe(false);
  expect(HSI_FINGERPRINT_MIGRATION_POLICY.scientificApprovalImplied).toBe(false);
});

test("canonical and insertion-order algorithms diverge on key order", () => {
  const a = {b: 1, a: 2};
  const b = {a: 2, b: 1};
  const insertionA = hashHsiAgentFingerprint({algorithm: HSI_FP_JSON_INSERTION_ORDER_V1, value: a});
  const insertionB = hashHsiAgentFingerprint({algorithm: HSI_FP_JSON_INSERTION_ORDER_V1, value: b});
  const canonicalA = hashHsiAgentFingerprint({algorithm: HSI_FP_CANONICAL_SORTED_V1, value: a});
  const canonicalB = hashHsiAgentFingerprint({algorithm: HSI_FP_CANONICAL_SORTED_V1, value: b});
  expect(insertionA.digest).not.toBe(insertionB.digest);
  expect(canonicalA.digest).toBe(canonicalB.digest);
  expect(canonicalA.digest).toBe(hashHsiCheckpointInput(a));
});

test("fingerprintsEqual refuses cross-algorithm comparison", () => {
  const value = {question: "SSc"};
  const insertion = hashHsiAgentFingerprint({algorithm: HSI_FP_JSON_INSERTION_ORDER_V1, value});
  const canonical = hashHsiAgentFingerprint({algorithm: HSI_FP_CANONICAL_SORTED_V1, value});
  expect(() => fingerprintsEqual(insertion, canonical)).toThrow("Cross-algorithm");
  expect(fingerprintsEqual(canonical, hashHsiAgentFingerprint({algorithm: HSI_FP_CANONICAL_SORTED_V1, value}))).toBe(
    true,
  );
});

test("review revision round soft-land validates append-only chain", () => {
  const snapshot = hashHsiAgentFingerprint({
    algorithm: HSI_FP_CANONICAL_SORTED_V1,
    value: {investigationId: "inv-1", state: "draft"},
  });
  const round1: HsiReviewRevisionRound = {
    schemaVersion: "hsi-agent-review-revision-round-1",
    revisionId: "rev-1",
    investigationId: "inv-1",
    parentDecisionId: null,
    round: 1,
    snapshotFingerprint: snapshot,
    appendOnly: true,
    overwritesPriorDecision: false,
    scientificApproval: false,
    implementedInDatabase: false,
  };
  expect(() => validateHsiReviewRevisionRound(round1)).not.toThrow();
  expect(() =>
    validateHsiReviewRevisionRound({
      ...round1,
      round: 2,
      parentDecisionId: null,
    }),
  ).toThrow("parentDecisionId");
  expect(() =>
    validateHsiReviewRevisionRound({
      ...round1,
      implementedInDatabase: true as false,
    }),
  ).toThrow("scientific approval");
});
