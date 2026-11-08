import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {parseN1CandidateQueue} from "../src/evidence/n1CandidateQueue";
import {
  assessLabelFreeze,
  assertStudyFamilySeparation,
  buildScientificBenchmarkKit,
  emptyLabelPacket,
  evaluateBenchmarkKit,
  parseBenchmarkLabelPacket,
  parseScientificBenchmarkKit,
  type BenchmarkLabelPacket,
  type ScientificBenchmarkKit,
} from "../src/evidence/scientificBenchmark";

const root = resolve(import.meta.dir, "..");
const queue = parseN1CandidateQueue(
  JSON.parse(readFileSync(resolve(root, "research/domain-graph/n1/candidates.v1.json"), "utf8")),
);

function freshKit(): ScientificBenchmarkKit {
  return buildScientificBenchmarkKit({
    candidates: queue.candidates,
    generatedAt: "2026-11-07T22:00:00.000Z",
    ledgerRecordByQueueId: new Map([["N1-C-01", "N2-R-001"]]),
  });
}

describe("N3 scientific benchmark", () => {
  test("builds a 24-item calibration scaffold without inventing labels", () => {
    const kit = freshKit();
    expect(kit.fabricatedLabelsPermitted).toBe(false);
    expect(kit.scientificApproval).toBe(false);
    expect(kit.scalePlan.currentCalibrationCount).toBe(24);
    expect(kit.scalePlan.labelledCount).toBe(0);
    expect(kit.gates.engineeringHarness).toBe("CLEARED");
    expect(kit.gates.calibrationScaffold).toBe("CLEARED");
    expect(kit.gates.studyFamilySplit).toBe("CLEARED");
    expect(kit.gates.humanLabelFreeze).toBe("BLOCKED");
    expect(kit.gates.scientificAcceptance).toBe("BLOCKED");
    expect(kit.items.every((i) => i.expectedOutcome === null && i.annotatorId === null)).toBe(true);
    expect(kit.items.filter((i) => i.partition === "excluded_identity_blocked")).toHaveLength(0);
    expect(kit.items.find((i) => i.n1QueueId === "N1-C-01")?.ledgerRecordId).toBe("N2-R-001");
  });

  test("empty label packet stays awaiting_sme and freeze remains BLOCKED", () => {
    const kit = freshKit();
    const labels = emptyLabelPacket(kit);
    expect(labels.status).toBe("awaiting_sme");
    expect(labels.rows.every((r) => r.expectedOutcome === null)).toBe(true);
    const freeze = assessLabelFreeze(labels, kit);
    expect(freeze.status).toBe("BLOCKED");
    expect(freeze.labelledCount).toBe(0);
    expect(freeze.reasons.length).toBeGreaterThan(0);
  });

  test("evaluation receipt is replayable and refuses scientific acceptance", () => {
    const kit = freshKit();
    const labels = emptyLabelPacket(kit);
    const receipt = evaluateBenchmarkKit(kit, labels, "2026-11-07T22:00:00.000Z");
    expect(receipt.engineeringHarness).toBe("CLEARED");
    expect(receipt.humanLabelFreeze).toBe("BLOCKED");
    expect(receipt.scientificAcceptance).toBe("BLOCKED");
    expect(receipt.outcomeAccuracy).toBeNull();
    expect(receipt.modelActivationAllowed).toBe(false);
    expect(receipt.scientificValidityEstablished).toBe(false);
    expect(receipt.calibrationItems).toBe(24);
  });

  test("study-family leakage across scored partitions fails closed", () => {
    const kit = freshKit();
    const leaked = structuredClone(kit.split);
    const family = leaked.partitionFamilies.calibration[0]!;
    leaked.partitionFamilies.held_out_frozen.push(family);
    expect(() => assertStudyFamilySeparation(leaked)).toThrow("leakage");
  });

  test("partial labels are rejected", () => {
    const kit = freshKit();
    const labels = emptyLabelPacket(kit) as BenchmarkLabelPacket;
    labels.rows[0]!.expectedOutcome = "abstain";
    expect(() => parseBenchmarkLabelPacket(labels)).toThrow("Incomplete human label");
  });

  test("kit cannot mark scientificAcceptance CLEARED", () => {
    const kit = freshKit();
    const bad = structuredClone(kit);
    bad.gates.scientificAcceptance = "CLEARED";
    expect(() => parseScientificBenchmarkKit(bad)).toThrow("scientificAcceptance");
  });

  test("on-disk n3 artifacts match builder when present", () => {
    const kitPath = resolve(root, "research/domain-graph/n3/benchmark-kit.v1.json");
    const labelsPath = resolve(root, "research/domain-graph/n3/labels.awaiting_sme.json");
    const kit = parseScientificBenchmarkKit(JSON.parse(readFileSync(kitPath, "utf8")));
    const labels = parseBenchmarkLabelPacket(JSON.parse(readFileSync(labelsPath, "utf8")));
    expect(kit.scalePlan.currentCalibrationCount).toBe(24);
    expect(labels.status).toBe("awaiting_sme");
    expect(evaluateBenchmarkKit(kit, labels, kit.generatedAt).humanLabelFreeze).toBe("BLOCKED");
  });
});
