/**
 * Correction provenance stubs: keep evaluation feeds separate from training feeds.
 * Never fabricates SME labels or promotes demo/fixture corrections into scientific grades.
 */
export const CORRECTION_PROVENANCE_VERSION = "hsi-correction-provenance-1" as const;

export type CorrectionFeedKind = "evaluation_frozen" | "training_permitted" | "demo_fixture_only";

export type CorrectionRecordStub = {
  id: string;
  feed: CorrectionFeedKind;
  investigationKey: string;
  releaseId: string;
  rationale: string;
  scientificReview: "unreviewed";
  containsPhi: false;
  clinicalAdvice: false;
  kgWrite: false;
  notForScientificClaim: boolean;
  createdAt: string;
};

export type CorrectionProvenanceBundle = {
  schemaVersion: typeof CORRECTION_PROVENANCE_VERSION;
  containsPhi: false;
  clinicalAdvice: false;
  kgWrite: false;
  scientificReview: "unreviewed";
  feeds: {
    evaluation_frozen: { writable: false; description: string };
    training_permitted: { writable: true; description: string; requiresHumanGate: true };
    demo_fixture_only: { writable: true; description: string; notForScientificClaim: true };
  };
  records: CorrectionRecordStub[];
};

export class CorrectionProvenanceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const idPattern = /^[A-Za-z0-9][A-Za-z0-9:_.-]{0,127}$/;

/** Empty worksheet-compatible provenance envelope — no fabricated SME outcomes. */
export function emptyCorrectionProvenanceBundle(): CorrectionProvenanceBundle {
  return {
    schemaVersion: CORRECTION_PROVENANCE_VERSION,
    containsPhi: false,
    clinicalAdvice: false,
    kgWrite: false,
    scientificReview: "unreviewed",
    feeds: {
      evaluation_frozen: {
        writable: false,
        description: "Frozen evaluation partition. Corrections must not mutate this feed after lock.",
      },
      training_permitted: {
        writable: true,
        description: "Separately governed training corrections after human scientific review. Never auto-promoted from demo.",
        requiresHumanGate: true,
      },
      demo_fixture_only: {
        writable: true,
        description: "Engineering/demo corrections against ra-anti-tnf-demo. not_for_scientific_claim; never mixed into evaluation_frozen.",
        notForScientificClaim: true,
      },
    },
    records: [],
  };
}

export function assertCorrectionFeedSeparation(bundle: CorrectionProvenanceBundle): void {
  if (bundle.schemaVersion !== CORRECTION_PROVENANCE_VERSION) throw new CorrectionProvenanceError("schema");
  if (bundle.containsPhi || bundle.clinicalAdvice || bundle.kgWrite) throw new CorrectionProvenanceError("boundary");
  if (bundle.scientificReview !== "unreviewed") throw new CorrectionProvenanceError("scientificReview");
  if (bundle.feeds.evaluation_frozen.writable !== false) throw new CorrectionProvenanceError("evaluation_writable");
  if (bundle.feeds.training_permitted.requiresHumanGate !== true) throw new CorrectionProvenanceError("training_gate");
  if (bundle.feeds.demo_fixture_only.notForScientificClaim !== true) throw new CorrectionProvenanceError("demo_honesty");
  for (const record of bundle.records) {
    if (!idPattern.test(record.id) || !idPattern.test(record.investigationKey) || !idPattern.test(record.releaseId)) {
      throw new CorrectionProvenanceError("ids");
    }
    if (record.containsPhi || record.clinicalAdvice || record.kgWrite) throw new CorrectionProvenanceError("record_boundary");
    if (record.scientificReview !== "unreviewed") throw new CorrectionProvenanceError("record_review");
    if (record.feed === "evaluation_frozen") throw new CorrectionProvenanceError("cannot_write_evaluation");
    if (record.feed === "demo_fixture_only" && !record.notForScientificClaim) {
      throw new CorrectionProvenanceError("demo_must_not_claim");
    }
    if (record.feed === "training_permitted" && record.releaseId === "ra-anti-tnf-demo") {
      throw new CorrectionProvenanceError("demo_cannot_enter_training");
    }
    if (!record.rationale.trim() || record.rationale.length > 4000) throw new CorrectionProvenanceError("rationale");
  }
}

/** Route a proposed correction into the correct feed without inventing SME outcomes. */
export function routeCorrectionStub(input: {
  id: string;
  investigationKey: string;
  releaseId: string;
  rationale: string;
  createdAt: string;
  intendedFeed: Exclude<CorrectionFeedKind, "evaluation_frozen">;
}): CorrectionRecordStub {
  const notForScientificClaim = input.releaseId === "ra-anti-tnf-demo" || input.intendedFeed === "demo_fixture_only";
  if (input.intendedFeed === "training_permitted" && notForScientificClaim) {
    throw new CorrectionProvenanceError("demo_cannot_enter_training");
  }
  const record: CorrectionRecordStub = {
    id: input.id,
    feed: notForScientificClaim ? "demo_fixture_only" : input.intendedFeed,
    investigationKey: input.investigationKey,
    releaseId: input.releaseId,
    rationale: input.rationale,
    scientificReview: "unreviewed",
    containsPhi: false,
    clinicalAdvice: false,
    kgWrite: false,
    notForScientificClaim,
    createdAt: input.createdAt,
  };
  assertCorrectionFeedSeparation({ ...emptyCorrectionProvenanceBundle(), records: [record] });
  return record;
}
