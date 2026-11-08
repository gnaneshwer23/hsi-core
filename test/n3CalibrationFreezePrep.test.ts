import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {parseN1CandidateQueue} from "../src/evidence/n1CandidateQueue";
import {
  buildN3CalibrationFreezePrep,
  parseN3CalibrationFreezePrep,
} from "../src/evidence/n3CalibrationFreezePrep";
import {
  buildScientificBenchmarkKit,
  emptyLabelPacket,
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

describe("N3 calibration freeze prep (audit Phase #4)", () => {
  test("builds eng-CLEARED prep with human gates BLOCKED and empty SME slots", () => {
    const kit = freshKit();
    const labels = emptyLabelPacket(kit);
    const prep = buildN3CalibrationFreezePrep({
      kit,
      labels,
      generatedAt: "2026-11-08T10:00:00.000Z",
    });
    expect(prep.engineeringScaffold).toBe("CLEARED");
    expect(prep.humanLabelFreeze).toBe("BLOCKED");
    expect(prep.scientificAcceptance).toBe("BLOCKED");
    expect(prep.labelledCalibrationCount).toBe(0);
    expect(prep.summary.smeSlotsFilled).toBe(0);
    expect(prep.summary.calibrationInRange).toBe(true);
    expect(prep.calibrationItemCount).toBe(24);
    expect(prep.smeRosterSlots.every((s) => s.principal === null)).toBe(true);
    expect(prep.checks.filter((c) => c.plane === "engineering").every((c) => c.status === "CLEARED")).toBe(
      true,
    );
    expect(prep.checks.filter((c) => c.plane === "human").every((c) => c.status === "PENDING_HUMAN")).toBe(
      true,
    );
    expect(prep.kitHash).toBe(labels.kitHash);
    expect(parseN3CalibrationFreezePrep(prep).prepHash).toBe(prep.prepHash);
  });

  test("refuses invented SME principals in roster slots", () => {
    const kit = freshKit();
    const labels = emptyLabelPacket(kit);
    const prep = buildN3CalibrationFreezePrep({
      kit,
      labels,
      generatedAt: "2026-11-08T10:00:00.000Z",
    });
    const bad = structuredClone(prep) as typeof prep & {prepHash: string};
    bad.smeRosterSlots[0]!.principal = "Dr Invented" as unknown as null;
    expect(() => parseN3CalibrationFreezePrep(bad)).toThrow("invent SME");
  });

  test("refuses partially labelled packets in freeze-prep scaffold", () => {
    const kit = freshKit();
    const labels = emptyLabelPacket(kit) as BenchmarkLabelPacket;
    labels.rows[0]!.expectedOutcome = "abstain";
    expect(() =>
      buildN3CalibrationFreezePrep({
        kit,
        labels,
        generatedAt: "2026-11-08T10:00:00.000Z",
      }),
    ).toThrow();
  });

  test("on-disk freeze-prep.v1.json parses and stays science-BLOCKED when present", () => {
    const path = resolve(root, "research/domain-graph/n3/freeze-prep.v1.json");
    const raw = JSON.parse(readFileSync(path, "utf8"));
    const prep = parseN3CalibrationFreezePrep(raw);
    expect(prep.humanLabelFreeze).toBe("BLOCKED");
    expect(prep.summary.smeSlotsFilled).toBe(0);
    expect(prep.remediationPhase).toBe("production_readiness_audit_phase_4");
  });
});
