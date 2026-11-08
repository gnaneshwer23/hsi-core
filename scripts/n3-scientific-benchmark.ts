#!/usr/bin/env bun
/**
 * N3 scientific benchmark scaffold / check / eval / freeze-prep.
 * Offline only — no fabricated expert labels, Gate C, or Neon writes.
 */
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {parseN1CandidateQueue} from "../src/evidence/n1CandidateQueue";
import {
  buildN3CalibrationFreezePrep,
  parseN3CalibrationFreezePrep,
} from "../src/evidence/n3CalibrationFreezePrep";
import {
  buildScientificBenchmarkKit,
  emptyLabelPacket,
  evaluateBenchmarkKit,
  parseBenchmarkLabelPacket,
  parseScientificBenchmarkKit,
  type ScientificBenchmarkKit,
} from "../src/evidence/scientificBenchmark";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";

const root = resolve(import.meta.dir, "..");
const n3Dir = resolve(root, "research/domain-graph/n3");
const check = process.argv.includes("--check");
const evalOnly = process.argv.includes("--eval");
const freezePrep = process.argv.includes("--freeze-prep");
const generatedAt = "2026-11-07T22:00:00.000Z";
const freezePrepGeneratedAt = "2026-11-08T10:00:00.000Z";

const queue = parseN1CandidateQueue(
  JSON.parse(readFileSync(resolve(root, "research/domain-graph/n1/candidates.v1.json"), "utf8")),
);

const ledgerRecordByQueueId = new Map<string, string>();
try {
  const ledger = JSON.parse(readFileSync(resolve(root, "research/domain-graph/n2/ledger.v1.json"), "utf8")) as {
    records?: {id: string; lineage?: {n1QueueId?: string | null}}[];
  };
  for (const r of ledger.records ?? []) {
    const q = r.lineage?.n1QueueId;
    if (q && !ledgerRecordByQueueId.has(q)) ledgerRecordByQueueId.set(q, r.id);
  }
} catch {
  // N2 fixture optional for N3 scaffold; missing ledger links stay null.
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function buildKit(): ScientificBenchmarkKit {
  return buildScientificBenchmarkKit({
    candidates: queue.candidates,
    generatedAt,
    ledgerRecordByQueueId,
  });
}

function writeStatus(receipt: ReturnType<typeof evaluateBenchmarkKit>, extra?: Record<string, unknown>): void {
  writeJson(resolve(n3Dir, "STATUS.json"), {
    phase: "N3",
    programme: "gut_immune_t2d",
    generatedAt,
    labelledRows: receipt.labelledItems,
    calibrationRows: receipt.calibrationItems,
    pilotCandidateRows: receipt.pilotCandidateItems,
    heldOutFrozenRows: receipt.heldOutFrozenItems,
    engineeringHarness: receipt.engineeringHarness,
    humanLabelFreeze: receipt.humanLabelFreeze,
    scientificAcceptance: receipt.scientificAcceptance,
    fabricatedLabelsPermitted: false,
    scientificApproval: false,
    freezePrepEngineering: "CLEARED",
    freezePrepHuman: "BLOCKED",
    note: "Empty scaffolds + Phase #4 freeze-prep only. No expert labels or SME identities were invented.",
    ...extra,
  });
}

function main(): void {
  mkdirSync(n3Dir, {recursive: true});
  const kitPath = resolve(n3Dir, "benchmark-kit.v1.json");
  const labelsPath = resolve(n3Dir, "labels.awaiting_sme.json");
  const splitPath = resolve(n3Dir, "study-family-split.v1.json");
  const receiptPath = resolve(n3Dir, "eval.offline.receipt.json");
  const freezePrepPath = resolve(n3Dir, "freeze-prep.v1.json");

  if (check || evalOnly || freezePrep) {
    const kit = parseScientificBenchmarkKit(JSON.parse(readFileSync(kitPath, "utf8")));
    const labels = parseBenchmarkLabelPacket(JSON.parse(readFileSync(labelsPath, "utf8")));
    const receipt = evaluateBenchmarkKit(kit, labels, generatedAt);

    if (freezePrep) {
      const prep = buildN3CalibrationFreezePrep({
        kit,
        labels,
        generatedAt: freezePrepGeneratedAt,
      });
      writeJson(freezePrepPath, prep);
      writeStatus(receipt, {
        freezePrepHash: prep.prepHash,
        freezePrepGeneratedAt: prep.generatedAt,
        smeSlotsReserved: prep.summary.smeSlotsReserved,
        smeSlotsFilled: prep.summary.smeSlotsFilled,
      });
      console.log(
        JSON.stringify(
          {
            wrote: [freezePrepPath],
            engineeringScaffold: prep.engineeringScaffold,
            humanLabelFreeze: prep.humanLabelFreeze,
            scientificAcceptance: prep.scientificAcceptance,
            calibrationItemCount: prep.calibrationItemCount,
            smeSlotsFilled: prep.summary.smeSlotsFilled,
            engineeringChecksCleared: prep.summary.engineeringChecksCleared,
            humanChecksPending: prep.summary.humanChecksPending,
            prepHash: prep.prepHash,
          },
          null,
          2,
        ),
      );
      return;
    }

    if (check) {
      const expected = buildKit();
      if (canonicalEvidenceJson(kit) !== canonicalEvidenceJson(expected)) {
        throw new Error("benchmark-kit.v1.json is stale relative to N1 candidates / builder");
      }
      const expectedLabels = emptyLabelPacket(expected);
      if (canonicalEvidenceJson(labels) !== canonicalEvidenceJson(expectedLabels)) {
        throw new Error("labels.awaiting_sme.json is stale relative to kit");
      }
      if (canonicalEvidenceJson(kit.split) !== canonicalEvidenceJson(JSON.parse(readFileSync(splitPath, "utf8")))) {
        throw new Error("study-family-split.v1.json is stale relative to kit.split");
      }
      if (receipt.humanLabelFreeze !== "BLOCKED") {
        throw new Error("Expected humanLabelFreeze BLOCKED for empty SME labels");
      }
      if (receipt.engineeringHarness !== "CLEARED") {
        throw new Error("Expected engineeringHarness CLEARED");
      }
      const expectedPrep = buildN3CalibrationFreezePrep({
        kit: expected,
        labels: expectedLabels,
        generatedAt: freezePrepGeneratedAt,
      });
      const onDiskPrep = parseN3CalibrationFreezePrep(JSON.parse(readFileSync(freezePrepPath, "utf8")));
      if (canonicalEvidenceJson(onDiskPrep) !== canonicalEvidenceJson(expectedPrep)) {
        throw new Error("freeze-prep.v1.json is stale — re-run bun run n3:freeze-prep");
      }
      if (onDiskPrep.humanLabelFreeze !== "BLOCKED" || onDiskPrep.summary.smeSlotsFilled !== 0) {
        throw new Error("freeze-prep must keep science BLOCKED and SME slots empty");
      }
      console.log(
        JSON.stringify(
          {
            ok: true,
            engineeringHarness: receipt.engineeringHarness,
            humanLabelFreeze: receipt.humanLabelFreeze,
            calibrationItems: receipt.calibrationItems,
            labelledItems: receipt.labelledItems,
            scientificAcceptance: receipt.scientificAcceptance,
            freezePrepEngineering: onDiskPrep.engineeringScaffold,
            freezePrepHuman: onDiskPrep.humanLabelFreeze,
            smeSlotsFilled: onDiskPrep.summary.smeSlotsFilled,
            prepHash: onDiskPrep.prepHash,
          },
          null,
          2,
        ),
      );
      return;
    }

    writeJson(receiptPath, receipt);
    console.log(JSON.stringify(receipt, null, 2));
    return;
  }

  const kit = buildKit();
  const labels = emptyLabelPacket(kit);
  const receipt = evaluateBenchmarkKit(kit, labels, generatedAt);
  const prep = buildN3CalibrationFreezePrep({
    kit,
    labels,
    generatedAt: freezePrepGeneratedAt,
  });

  writeJson(kitPath, kit);
  writeJson(labelsPath, labels);
  writeJson(splitPath, kit.split);
  writeJson(receiptPath, receipt);
  writeJson(freezePrepPath, prep);
  writeStatus(receipt, {
    freezePrepHash: prep.prepHash,
    freezePrepGeneratedAt: prep.generatedAt,
    smeSlotsReserved: prep.summary.smeSlotsReserved,
    smeSlotsFilled: prep.summary.smeSlotsFilled,
  });

  console.log(
    JSON.stringify(
      {
        wrote: [kitPath, labelsPath, splitPath, receiptPath, freezePrepPath],
        engineeringHarness: receipt.engineeringHarness,
        humanLabelFreeze: receipt.humanLabelFreeze,
        calibrationItems: receipt.calibrationItems,
        labelledItems: receipt.labelledItems,
        freezePrepEngineering: prep.engineeringScaffold,
        smeSlotsFilled: prep.summary.smeSlotsFilled,
      },
      null,
      2,
    ),
  );
}

main();
