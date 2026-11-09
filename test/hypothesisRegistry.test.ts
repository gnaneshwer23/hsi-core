/**
 * Milestone 3 PR1 — Hypothesis Registry & Evidence Contracts honesty tests.
 */
import {createHash} from "node:crypto";
import {describe, expect, test} from "bun:test";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  bindHypothesisEvidenceContract,
  emptyHypothesisRegistry,
  parseHypothesisRegistry,
  projectHypothesisEvidenceContractSummary,
  proposeHypothesis,
  readHypothesisRecord,
  transitionHypothesisState,
} from "../src/evidence/hypothesisRegistry";

const asOf = "2026-11-09T07:30:00.000Z";

function propose(reg = emptyHypothesisRegistry()) {
  return proposeHypothesis(reg, {
    id: "HYP-M3-001",
    statement: "Tfh-derived IL-21 contributes to dermal fibrosis in SSc under declared research framing.",
    subjectId: "cell:tfh",
    predicate: "associated_with",
    objectId: "process:dermal_fibrosis",
    falsifier: "No association between Tfh IL-21 signalling and fibrosis markers in the declared cohort/assay.",
    programme: "ssc_tfh_il21",
    dataBasis: "fixture_engineering",
    fixtureHonesty: true,
    investigationId: "inv:ssc-demo-001",
    evidenceLedgerRecordIds: ["N2-R-HYP-001"],
    createdAt: asOf,
    note: "Fixture registry row — not experimental validation.",
  });
}

describe("hypothesis registry propose + honesty", () => {
  test("proposes with evidence contract hooks and refuses fabricated confidence", () => {
    const reg = propose();
    const row = readHypothesisRecord(reg, "HYP-M3-001");
    expect(row.lifecycle).toBe("proposed");
    expect(row.reviewApprovalStatus).toBe("not_submitted");
    expect(row.experimentalValidationStatus).toBe("not_started");
    expect(row.reviewApprovalDistinctFromExperimentalValidation).toBe(true);
    expect(row.confidence.model).toBe("not_assessed");
    expect(row.confidence.numericConfidence).toBeNull();
    expect(row.scientificApproval).toBe(false);
    expect(row.graphPromotable).toBe(false);
    expect(row.experimentallyValidated).toBe(false);
    expect(row.evidenceContract.investigationId).toBe("inv:ssc-demo-001");
    expect(row.evidenceContract.evidenceLedgerRecordIds).toContain("N2-R-HYP-001");
    expect(row.fixtureHonesty).toBe(true);
    expect(parseHypothesisRegistry(reg).honesty.noLlmAsProbability).toBe(true);
  });

  test("review approval does not become experimental validation", () => {
    let reg = propose();
    const proposed = readHypothesisRecord(reg, "HYP-M3-001");
    const {contentHash, ...body} = structuredClone(proposed);
    const recomputed = createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
    expect(contentHash).toBe(recomputed);
    expect(() => parseHypothesisRegistry(reg)).not.toThrow();
    reg = transitionHypothesisState({
      registry: reg,
      id: "HYP-M3-001",
      to: "under_review",
      updatedAt: "2026-11-09T07:31:00.000Z",
    });
    reg = transitionHypothesisState({
      registry: reg,
      id: "HYP-M3-001",
      to: "review_approved",
      updatedAt: "2026-11-09T07:32:00.000Z",
    });
    const approved = readHypothesisRecord(reg, "HYP-M3-001");
    expect(approved.lifecycle).toBe("review_approved");
    expect(approved.reviewApprovalStatus).toBe("approved");
    expect(approved.experimentalValidationStatus).toBe("not_experimentally_validated");
    expect(approved.experimentallyValidated).toBe(false);
    expect(approved.scientificApproval).toBe(false);

    const summary = projectHypothesisEvidenceContractSummary(approved);
    expect(summary.reviewApprovalDistinctFromExperimentalValidation).toBe(true);
    expect(summary.confidenceModel).toBe("not_assessed");
    expect(summary.numericConfidence).toBeNull();
    expect(summary.scientificallyValidated).toBe(false);
    expect(() => parseHypothesisRegistry(reg, {verifyContentHashes: true})).not.toThrow();
  });

  test("queues and links experiment ids without inventing outcomes", () => {
    let reg = propose();
    reg = transitionHypothesisState({
      registry: reg,
      id: "HYP-M3-001",
      to: "under_review",
      updatedAt: "2026-11-09T07:31:00.000Z",
    });
    reg = transitionHypothesisState({
      registry: reg,
      id: "HYP-M3-001",
      to: "review_approved",
      updatedAt: "2026-11-09T07:32:00.000Z",
    });
    reg = transitionHypothesisState({
      registry: reg,
      id: "HYP-M3-001",
      to: "queued_for_experiment",
      updatedAt: "2026-11-09T07:33:00.000Z",
    });
    expect(readHypothesisRecord(reg, "HYP-M3-001").experimentalValidationStatus).toBe("queued");

    reg = bindHypothesisEvidenceContract({
      registry: reg,
      id: "HYP-M3-001",
      experimentRecordIds: ["EXP-N7-001"],
      structuredComparisonIds: ["cmp:optional-m2-inflight"],
      updatedAt: "2026-11-09T07:34:00.000Z",
    });
    const linked = readHypothesisRecord(reg, "HYP-M3-001");
    expect(linked.lifecycle).toBe("experiment_linked");
    expect(linked.experimentalValidationStatus).toBe("linked_to_experiment");
    expect(linked.evidenceContract.experimentRecordIds).toContain("EXP-N7-001");
    expect(linked.evidenceContract.structuredComparisonIds).toContain("cmp:optional-m2-inflight");
    expect(linked.experimentallyValidated).toBe(false);
  });

  test("illegal transitions and terminal supersession are fail-closed", () => {
    let reg = propose();
    expect(() =>
      transitionHypothesisState({
        registry: reg,
        id: "HYP-M3-001",
        to: "experiment_linked",
      }),
    ).toThrow(/Illegal hypothesis transition/);

    reg = transitionHypothesisState({
      registry: reg,
      id: "HYP-M3-001",
      to: "under_review",
      updatedAt: "2026-11-09T07:31:00.000Z",
    });
    reg = transitionHypothesisState({
      registry: reg,
      id: "HYP-M3-001",
      to: "review_rejected",
      updatedAt: "2026-11-09T07:32:00.000Z",
    });
    reg = transitionHypothesisState({
      registry: reg,
      id: "HYP-M3-001",
      to: "superseded",
      supersededById: "HYP-M3-002",
      updatedAt: "2026-11-09T07:33:00.000Z",
    });
    expect(readHypothesisRecord(reg, "HYP-M3-001").supersededById).toBe("HYP-M3-002");
    expect(() =>
      bindHypothesisEvidenceContract({
        registry: reg,
        id: "HYP-M3-001",
        evidenceLedgerRecordIds: ["N2-R-X"],
      }),
    ).toThrow(/terminal hypothesis/);
  });
});
