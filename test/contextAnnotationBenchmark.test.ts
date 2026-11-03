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

test("verified scaffold refuses pending release", () => {
  expect(() => scaffoldRowsFromVerifiedRelease(pending, "evaluation_frozen")).toThrow();
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
