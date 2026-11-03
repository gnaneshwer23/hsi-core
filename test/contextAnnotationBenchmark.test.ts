import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import {
  emptyContextAnnotationBenchmarkKit,
  assertBenchmarkKitHonesty,
  scaffoldPracticeRowsFromResearchRelease,
  scaffoldRowsFromVerifiedRelease,
  buildDoubleBlindLabelPackets,
  openAdjudicationRecord,
  assignPartitionsByPolicy,
  acceptPracticeLabelSubmission,
  finalizeAdjudicationRecord,
  buildPracticeAdjudicationQueue,
  ContextAnnotationBenchmarkError,
} from "../src/contextAnnotationBenchmark";
import pending from "../research/ra-anti-tnf/release.json";

const research = JSON.parse(readFileSync("research/ra-anti-tnf-research/release.json", "utf8"));

test("empty kit stays unlabelled and honest", () => {
  const kit = emptyContextAnnotationBenchmarkKit();
  expect(kit.fabricatedLabelsPermitted).toBe(false);
  expect(kit.emptyLabelStore.evaluation_frozen).toEqual([]);
  assertBenchmarkKitHonesty(kit);
});

test("practice scaffolds come from research working set and cannot claim PMIDs", () => {
  const rows = scaffoldPracticeRowsFromResearchRelease(research);
  expect(rows.length).toBeGreaterThanOrEqual(2);
  for (const row of rows) {
    expect(row.partition).toBe("practice_not_evaluation");
    expect(row.pmid).toBeNull();
    expect(row.tags.species).toBeNull();
    expect(row.annotatorId).toBeNull();
  }
});

test("verified scaffold refuses pending marker and mints unlabelled rights-verified rows", () => {
  const marker = { status: "awaiting_verified_source_import", reason: "Fixture pending marker." };
  expect(() => scaffoldRowsFromVerifiedRelease(marker, "evaluation_frozen")).toThrow();
  const rows = scaffoldRowsFromVerifiedRelease(pending, "evaluation_frozen");
  expect(rows.length).toBeGreaterThanOrEqual(2);
  expect(rows.every((r) => r.pmid && r.licenceIdentifier && r.annotatorId === null && r.tags.species === null)).toBe(true);
  const split = assignPartitionsByPolicy(rows);
  expect(split.evaluation_frozen.length + split.training_candidate.length + split.holdout_candidate.length).toBe(rows.length);
});

test("double-blind packets omit peer state and stay unlabelled", () => {
  const rows = scaffoldPracticeRowsFromResearchRelease(research);
  const [a, b] = buildDoubleBlindLabelPackets(rows);
  expect(a.doubleBlind).toBe(true);
  expect(b.doubleBlind).toBe(true);
  expect(a.annotatorSlot).toBe("annotator_a");
  expect(b.annotatorSlot).toBe("annotator_b");
  expect(a.packetId).not.toBe(b.packetId);
  expect(a.rows.every((r) => r.tags.species === null)).toBe(true);
});

test("adjudication opens empty final tags; practice cannot enter eval split", () => {
  const record = openAdjudicationRecord(
    "ROW-1",
    {
      species: "human",
      tissue_or_sample: "serum",
      setting_or_model: "clinical_observational",
      intervention: "anti-TNF",
      outcome: "DAS28",
      timepoint: "12 weeks",
    },
    {
      species: "human",
      tissue_or_sample: "plasma",
      setting_or_model: "clinical_observational",
      intervention: "anti-TNF",
      outcome: "DAS28",
      timepoint: "12 weeks",
    },
  );
  expect(record.disagreeOn).toContain("tissue_or_sample");
  expect(record.finalTags).toBeNull();
  expect(record.fabricatedLabelsPermitted).toBe(false);

  const practice = scaffoldPracticeRowsFromResearchRelease(research);
  expect(() => assignPartitionsByPolicy(practice)).toThrow(ContextAnnotationBenchmarkError);
});

test("worksheet and protocol templates remain label-free", () => {
  const worksheet = JSON.parse(readFileSync("research/ra-anti-tnf/context-annotation-worksheet-v1.json", "utf8"));
  expect(worksheet.rows).toEqual([]);
  expect(worksheet.adjudication.fabricatedLabelsPermitted).toBe(false);
  const protocol = readFileSync("research/ra-anti-tnf/sme-labelling-protocol-v1.md", "utf8");
  expect(protocol).toContain("no expert labels are supplied");
  expect(protocol).not.toMatch(/\b85%\b.*achieved|\bmeasured result\b/i);
});

test("practice submission accepts grounded tags and keeps practice partition", () => {
  const rows = scaffoldPracticeRowsFromResearchRelease(research);
  const [packetA] = buildDoubleBlindLabelPackets(rows);
  const accepted = acceptPracticeLabelSubmission(packetA, {
    packetId: packetA.packetId,
    annotatorSlot: "annotator_a",
    annotatorId: "sme-a",
    labelledAt: "2026-11-03T17:00:00Z",
    rows: packetA.rows.map((row) => ({
      rowId: row.rowId,
      groundingSpan: row.passageText.slice(0, 40),
      tags: {
        species: "human",
        tissue_or_sample: "missing",
        setting_or_model: "clinical_observational",
        intervention: "anti-TNF",
        outcome: "response",
        timepoint: "missing",
      },
    })),
  });
  expect(accepted.notForEvaluation).toBe(true);
  expect(accepted.partition).toBe("practice_not_evaluation");
  expect(accepted.rows.every((r) => r.annotatorId === "sme-a")).toBe(true);
});

test("practice adjudication queue finalizes human tags without evaluation promotion", () => {
  const rows = scaffoldPracticeRowsFromResearchRelease(research);
  const [blankA, blankB] = buildDoubleBlindLabelPackets(rows);
  const tagsA = {
    species: "human" as const,
    tissue_or_sample: "serum",
    setting_or_model: "clinical_observational" as const,
    intervention: "anti-TNF",
    outcome: "response",
    timepoint: "12 weeks",
  };
  const tagsB = { ...tagsA, tissue_or_sample: "plasma" };
  const packetA = acceptPracticeLabelSubmission(blankA, {
    packetId: blankA.packetId,
    annotatorSlot: "annotator_a",
    annotatorId: "sme-a",
    labelledAt: "2026-11-03T17:00:00Z",
    rows: blankA.rows.map((row) => ({
      rowId: row.rowId,
      groundingSpan: row.passageText.slice(0, 40),
      tags: tagsA,
    })),
  });
  const packetB = acceptPracticeLabelSubmission(blankB, {
    packetId: blankB.packetId,
    annotatorSlot: "annotator_b",
    annotatorId: "sme-b",
    labelledAt: "2026-11-03T17:05:00Z",
    rows: blankB.rows.map((row) => ({
      rowId: row.rowId,
      groundingSpan: row.passageText.slice(0, 40),
      tags: tagsB,
    })),
  });
  const queue = buildPracticeAdjudicationQueue(packetA, packetB);
  expect(queue[0]!.disagreeOn).toContain("tissue_or_sample");
  expect(queue[0]!.finalTags).toBeNull();
  const closed = finalizeAdjudicationRecord(queue[0]!, {
    finalTags: tagsA,
    adjudicatorId: "sme-lead",
    rationale: "Prefer serum wording from Annotator A for this practice passage.",
    adjudicatedAt: "2026-11-03T17:10:00Z",
  });
  expect(closed.finalTags?.tissue_or_sample).toBe("serum");
  expect(closed.fabricatedLabelsPermitted).toBe(false);
  expect(packetA.partition).toBe("practice_not_evaluation");
});
