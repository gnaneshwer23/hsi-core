/** ARCH-009 Phase 2 fingerprint versioning soft-land (U26).
 *
 * Historical fingerprints use two incompatible serialisation rules. This module
 * names both algorithms explicitly and forbids silent cross-API comparison or
 * in-place rewrite of stored digests. It does not migrate Neon rows, invent
 * reviewer credentials, or claim scientific approval.
 */
import {createHash} from "node:crypto";

export const HSI_AGENT_FINGERPRINT_SCHEMA = "hsi-agent-fingerprint-1" as const;

/** Insertion-order JSON.stringify — used by legacy `fingerprintInterrogativeInvestigation`. */
export const HSI_FP_JSON_INSERTION_ORDER_V1 = "json-insertion-order-sha256-v1" as const;
/** Canonical sorted-key JSON — used by checkpoint / review-snapshot / persistence hashes. */
export const HSI_FP_CANONICAL_SORTED_V1 = "canonical-sorted-sha256-v1" as const;

export const HSI_AGENT_FINGERPRINT_ALGORITHMS = [
  HSI_FP_JSON_INSERTION_ORDER_V1,
  HSI_FP_CANONICAL_SORTED_V1,
] as const;

export type HsiAgentFingerprintAlgorithm = (typeof HSI_AGENT_FINGERPRINT_ALGORITHMS)[number];

export type HsiVersionedFingerprint = {
  schemaVersion: typeof HSI_AGENT_FINGERPRINT_SCHEMA;
  algorithm: HsiAgentFingerprintAlgorithm;
  digest: string;
};

export const HSI_FINGERPRINT_MIGRATION_POLICY = {
  rewriteHistoricalDigestsInPlace: false,
  crossAlgorithmEqualityAllowed: false,
  newApisMustDeclareAlgorithm: true,
  scientificApprovalImplied: false,
} as const;

const HEX64 = /^[a-f0-9]{64}$/;

function canonicalSortedJson(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonicalSortedJson).join(",") + "]";
  if (value && typeof value === "object") {
    return (
      "{" +
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => JSON.stringify(k) + ":" + canonicalSortedJson(v))
        .join(",") +
      "}"
    );
  }
  return JSON.stringify(value) ?? "null";
}

function insertionOrderJson(value: unknown): string {
  return JSON.stringify(value) ?? "null";
}

export function hashHsiAgentFingerprint(input: {
  algorithm: HsiAgentFingerprintAlgorithm;
  value: unknown;
}): HsiVersionedFingerprint {
  let payload: string;
  switch (input.algorithm) {
    case HSI_FP_JSON_INSERTION_ORDER_V1:
      payload = insertionOrderJson(input.value);
      break;
    case HSI_FP_CANONICAL_SORTED_V1:
      payload = canonicalSortedJson(input.value);
      break;
    default: {
      const _exhaustive: never = input.algorithm;
      throw Error(`Unknown fingerprint algorithm: ${String(_exhaustive)}`);
    }
  }
  return {
    schemaVersion: HSI_AGENT_FINGERPRINT_SCHEMA,
    algorithm: input.algorithm,
    digest: createHash("sha256").update(payload).digest("hex"),
  };
}

export function validateHsiVersionedFingerprint(fp: HsiVersionedFingerprint): void {
  if (!fp || fp.schemaVersion !== HSI_AGENT_FINGERPRINT_SCHEMA) throw Error("Invalid fingerprint schema");
  if (!(HSI_AGENT_FINGERPRINT_ALGORITHMS as readonly string[]).includes(fp.algorithm)) {
    throw Error("Unknown fingerprint algorithm");
  }
  if (!HEX64.test(fp.digest)) throw Error("Invalid fingerprint digest");
}

/** Digests may only be compared when algorithm IDs match. Never rewrite stored hashes. */
export function fingerprintsEqual(a: HsiVersionedFingerprint, b: HsiVersionedFingerprint): boolean {
  validateHsiVersionedFingerprint(a);
  validateHsiVersionedFingerprint(b);
  if (a.algorithm !== b.algorithm) {
    throw Error("Cross-algorithm fingerprint comparison is forbidden");
  }
  return a.digest === b.digest;
}

/**
 * Soft-land design for scientific-review revision rounds (migration 008 UNIQUE limitation).
 * Not a live store — documents append-only round identity before DB work.
 */
export const HSI_REVIEW_REVISION_ROUND_SCHEMA = "hsi-agent-review-revision-round-1" as const;

export type HsiReviewRevisionRound = {
  schemaVersion: typeof HSI_REVIEW_REVISION_ROUND_SCHEMA;
  revisionId: string;
  investigationId: string;
  parentDecisionId: string | null;
  round: number;
  snapshotFingerprint: HsiVersionedFingerprint;
  /** One-shot UNIQUE(investigation_id) must not be treated as revision support. */
  appendOnly: true;
  overwritesPriorDecision: false;
  scientificApproval: false;
  implementedInDatabase: false;
};

export function validateHsiReviewRevisionRound(round: HsiReviewRevisionRound): void {
  if (!round || round.schemaVersion !== HSI_REVIEW_REVISION_ROUND_SCHEMA) {
    throw Error("Invalid review revision round schema");
  }
  if (!round.revisionId.trim() || !round.investigationId.trim()) throw Error("Invalid revision identity");
  if (!Number.isInteger(round.round) || round.round < 1 || round.round > 50) throw Error("Invalid revision round");
  if (round.round === 1 && round.parentDecisionId !== null) {
    throw Error("First revision round cannot reference a parent decision");
  }
  if (round.round > 1 && !round.parentDecisionId?.trim()) {
    throw Error("Subsequent revision rounds require parentDecisionId");
  }
  if (round.appendOnly !== true || round.overwritesPriorDecision !== false) {
    throw Error("Revision rounds must be append-only");
  }
  if (round.scientificApproval !== false || round.implementedInDatabase !== false) {
    throw Error("Revision round soft-land must not claim DB or scientific approval");
  }
  validateHsiVersionedFingerprint(round.snapshotFingerprint);
  if (round.snapshotFingerprint.algorithm !== HSI_FP_CANONICAL_SORTED_V1) {
    throw Error("Review revision snapshots must use canonical-sorted fingerprint algorithm");
  }
}
