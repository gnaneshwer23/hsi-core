#!/usr/bin/env bun
/**
 * N7 experiment ledger fixture build/check.
 * Offline only — no invented real lab outcomes, Gate C, or Neon writes.
 * Fixture outcomes declare fixtureHonesty / dataBasis=fixture_engineering.
 */
import {createHash} from "node:crypto";
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  appendExperimentDraft,
  attachExperimentArtifacts,
  attachExperimentOutcome,
  bindExperimentProtocol,
  buildExperimentLedgerStatus,
  emptyExperimentLedger,
  freezeExperimentPrediction,
  parseExperimentLedger,
  submitExperimentReviewCandidate,
  type ExperimentLedger,
  type ExperimentRecordInput,
} from "../src/evidence/experimentLedger";

const root = resolve(import.meta.dir, "..");
const n7Dir = resolve(root, "research/domain-graph/n7");
const ledgerPath = resolve(n7Dir, "ledger.v1.json");
const statusPath = resolve(n7Dir, "STATUS.json");
const check = process.argv.includes("--check");
const generatedAt = "2026-11-07T23:30:00.000Z";

function fileHash(path: string): string | null {
  try {
    return createHash("sha256").update(readFileSync(path)).digest("hex");
  } catch {
    return null;
  }
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), {recursive: true});
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function basePins(): ExperimentRecordInput["frozenEvalPins"] {
  return {
    n3KitHash: fileHash(resolve(root, "research/domain-graph/n3/benchmark-kit.v1.json")),
    n6ProtocolHash: fileHash(resolve(root, "research/domain-graph/n6/protocol.v1.json")),
    mayMutatePinnedEval: false,
  };
}

function buildFixtureLedger(): ExperimentLedger {
  const pins = basePins();
  let ledger = emptyExperimentLedger({
    engineeringHarness: "CLEARED",
    realObservationAcceptance: "BLOCKED",
    publicDataOrPartnerAgreement: "BLOCKED",
  });

  // EXP-N7-001 — freeze N2-linked prediction; await real outcome (none invented).
  const awaiting: ExperimentRecordInput = {
    id: "EXP-N7-001",
    programme: "gut_immune_t2d",
    dataBasis: "fixture_engineering",
    fixtureHonesty: true,
    prediction: {
      n2PredictionRecordId: "N2-R-002",
      n2PredictionVersion: 1,
      assertion:
        "Raising luminal butyrate in a matched human gut–immune organoid will reduce inflammatory signalling markers relative to vehicle under a frozen protocol.",
      subjectId: "metabolite:butyrate",
      predicate: "associated_with",
      objectId: "process:inflammatory_signalling",
      falsifier:
        "No reduction (or an increase) in pre-specified inflammatory markers versus vehicle under the frozen protocol.",
      freeze: null,
    },
    frozenEvalPins: pins,
    createdAt: "2026-11-07T22:00:00.000Z",
  };
  ledger = appendExperimentDraft(ledger, awaiting);
  ledger = freezeExperimentPrediction(ledger, "EXP-N7-001", "2026-11-07T22:05:00.000Z");
  ledger = bindExperimentProtocol(
    ledger,
    "EXP-N7-001",
    {
      protocolId: "protocol:organoid-butyrate-v0",
      compoundIdentity: "sodium butyrate (fixture identity only)",
      dose: null,
      doseUnit: null,
      tissueOrCellState: "human gut-immune organoid (proposed)",
      controls: ["vehicle"],
      timing: null,
      batchId: null,
      deviations: [],
      missingFields: ["dose", "doseUnit", "timing", "batchId"],
    },
    "2026-11-07T22:10:00.000Z",
  );
  // Intentionally no outcome — awaiting authorised observation.

  // EXP-N7-002 — fixture technical_failure (QC failed ≠ biology refuted) → review candidate.
  const techFail: ExperimentRecordInput = {
    id: "EXP-N7-002",
    programme: "gut_immune_t2d",
    dataBasis: "fixture_engineering",
    fixtureHonesty: true,
    prediction: {
      n2PredictionRecordId: null,
      n2PredictionVersion: null,
      assertion:
        "Fixture prediction: plate-reader inflammatory marker panel will complete QC under engineering protocol v0.",
      subjectId: "assay:fixture_inflammation_panel",
      predicate: "completes",
      objectId: "qc:fixture_pass",
      falsifier: "Panel fails calibration or plate QC under the frozen fixture protocol.",
      freeze: null,
    },
    frozenEvalPins: pins,
    createdAt: "2026-11-07T22:20:00.000Z",
  };
  ledger = appendExperimentDraft(ledger, techFail);
  ledger = freezeExperimentPrediction(ledger, "EXP-N7-002", "2026-11-07T22:21:00.000Z");
  ledger = bindExperimentProtocol(
    ledger,
    "EXP-N7-002",
    {
      protocolId: "protocol:fixture-qc-v0",
      compoundIdentity: "fixture-compound-A",
      dose: "0",
      doseUnit: "n/a",
      tissueOrCellState: "fixture well plate",
      controls: ["blank", "vehicle"],
      timing: "t0 fixture",
      batchId: "fixture-batch-001",
      deviations: ["Engineering dry-run only — no wet lab execution."],
      missingFields: [],
    },
    "2026-11-07T22:22:00.000Z",
  );
  ledger = attachExperimentArtifacts(ledger, "EXP-N7-002", {
    rawArtifacts: [
      {
        artifactId: "raw:fixture-plate-001",
        pointer: "research/domain-graph/n7/fixtures/raw-plate-fixture.txt",
        contentHash: createHash("sha256").update("n7-fixture-raw-plate-v0\n").digest("hex"),
        capturedAt: "2026-11-07T22:23:00.000Z",
        notes: "Synthetic fixture pointer; not a laboratory file.",
      },
    ],
    processing: {
      processingVersion: "fixture-process-1",
      calibrationNotes: "Fixture calibration curve intentionally out of range.",
      pipelineId: "pipeline:fixture-qc-v0",
    },
    qc: {
      status: "failed",
      assessedAt: "2026-11-07T22:24:00.000Z",
      notes: "Fixture QC fail — biology must not be treated as refuted.",
      biologyNotRefutedByFailedQc: true,
    },
    createdAt: "2026-11-07T22:24:00.000Z",
  });
  ledger = attachExperimentOutcome(ledger, "EXP-N7-002", {
    outcomeClass: "technical_failure",
    recordedAt: "2026-11-07T22:25:00.000Z",
    summary:
      "Fixture technical failure: plate QC failed. This does not refute the biological prediction.",
    measuredValues: [],
  });
  ledger = submitExperimentReviewCandidate(
    ledger,
    "EXP-N7-002",
    "2026-11-07T22:26:00.000Z",
    "Fixture review candidate only — cannot publish graph facts or edit frozen N3/N6 eval.",
  );

  // EXP-N7-003 — fixture negative_null (noEffectNotEstablished forced).
  const negNull: ExperimentRecordInput = {
    id: "EXP-N7-003",
    programme: "gut_immune_t2d",
    dataBasis: "fixture_engineering",
    fixtureHonesty: true,
    prediction: {
      n2PredictionRecordId: null,
      n2PredictionVersion: null,
      assertion:
        "Fixture prediction: marker M1 decreases ≥20% versus vehicle after fixture stimulus.",
      subjectId: "marker:fixture_m1",
      predicate: "decreases_after",
      objectId: "stimulus:fixture_s1",
      falsifier: "M1 change is <20% decrease versus vehicle under the frozen fixture protocol.",
      freeze: null,
    },
    frozenEvalPins: pins,
    createdAt: "2026-11-07T22:30:00.000Z",
  };
  ledger = appendExperimentDraft(ledger, negNull);
  ledger = freezeExperimentPrediction(ledger, "EXP-N7-003", "2026-11-07T22:31:00.000Z");
  ledger = bindExperimentProtocol(
    ledger,
    "EXP-N7-003",
    {
      protocolId: "protocol:fixture-negnull-v0",
      compoundIdentity: "fixture-stimulus-S1",
      dose: "1",
      doseUnit: "µM",
      tissueOrCellState: "fixture monolayer",
      controls: ["vehicle"],
      timing: "24h fixture",
      batchId: "fixture-batch-002",
      deviations: [],
      missingFields: [],
    },
    "2026-11-07T22:32:00.000Z",
  );
  ledger = attachExperimentArtifacts(ledger, "EXP-N7-003", {
    rawArtifacts: [
      {
        artifactId: "raw:fixture-m1-001",
        pointer: "research/domain-graph/n7/fixtures/raw-m1-fixture.txt",
        contentHash: createHash("sha256").update("n7-fixture-m1-v0\n").digest("hex"),
        capturedAt: "2026-11-07T22:33:00.000Z",
        notes: "Synthetic fixture values only.",
      },
    ],
    processing: {
      processingVersion: "fixture-process-1",
      calibrationNotes: "Fixture calibration within range.",
      pipelineId: "pipeline:fixture-negnull-v0",
    },
    qc: {
      status: "passed",
      assessedAt: "2026-11-07T22:34:00.000Z",
      notes: "Fixture QC passed; negative/null still does not establish no effect.",
      biologyNotRefutedByFailedQc: true,
    },
    createdAt: "2026-11-07T22:34:00.000Z",
  });
  ledger = attachExperimentOutcome(ledger, "EXP-N7-003", {
    outcomeClass: "negative_null",
    recordedAt: "2026-11-07T22:35:00.000Z",
    summary:
      "Fixture negative/null: M1 change below pre-specified threshold. noEffectNotEstablished remains true.",
    measuredValues: [{name: "M1_fold_change_vs_vehicle", value: "-0.05", unit: "fold"}],
  });

  // EXP-N7-004 — fixture inconclusive + inactive_assay siblings covered via two outcomes across ledger:
  // this record is inconclusive; EXP-N7-005 covers inactive_assay; EXP-N7-006 covers supported (fixture).
  const inconclusive: ExperimentRecordInput = {
    id: "EXP-N7-004",
    programme: "gut_immune_t2d",
    dataBasis: "fixture_engineering",
    fixtureHonesty: true,
    prediction: {
      n2PredictionRecordId: null,
      n2PredictionVersion: null,
      assertion: "Fixture prediction: directional change in marker M2 is decidable after one run.",
      subjectId: "marker:fixture_m2",
      predicate: "directionally_decidable_after",
      objectId: "run:fixture_single",
      falsifier: "Run yields overlapping intervals that prevent a directional call.",
      freeze: null,
    },
    frozenEvalPins: pins,
    createdAt: "2026-11-07T22:40:00.000Z",
  };
  ledger = appendExperimentDraft(ledger, inconclusive);
  ledger = freezeExperimentPrediction(ledger, "EXP-N7-004", "2026-11-07T22:41:00.000Z");
  ledger = bindExperimentProtocol(
    ledger,
    "EXP-N7-004",
    {
      protocolId: "protocol:fixture-inconclusive-v0",
      compoundIdentity: "fixture-stimulus-S2",
      dose: "2",
      doseUnit: "µM",
      tissueOrCellState: "fixture monolayer",
      controls: ["vehicle"],
      timing: "12h fixture",
      batchId: "fixture-batch-003",
      deviations: ["Single-run fixture — underpowered by design."],
      missingFields: [],
    },
    "2026-11-07T22:42:00.000Z",
  );
  ledger = attachExperimentOutcome(ledger, "EXP-N7-004", {
    outcomeClass: "inconclusive",
    recordedAt: "2026-11-07T22:43:00.000Z",
    summary: "Fixture inconclusive: confidence intervals overlap; no directional call.",
    measuredValues: [{name: "M2_delta", value: "0.02±0.08", unit: "AU"}],
  });

  const inactive: ExperimentRecordInput = {
    id: "EXP-N7-005",
    programme: "gut_immune_t2d",
    dataBasis: "fixture_engineering",
    fixtureHonesty: true,
    prediction: {
      n2PredictionRecordId: null,
      n2PredictionVersion: null,
      assertion: "Fixture prediction: assay reagent R1 produces detectable signal in positive control.",
      subjectId: "reagent:fixture_r1",
      predicate: "detects",
      objectId: "control:fixture_positive",
      falsifier: "Positive control yields no detectable signal (inactive assay).",
      freeze: null,
    },
    frozenEvalPins: pins,
    createdAt: "2026-11-07T22:50:00.000Z",
  };
  ledger = appendExperimentDraft(ledger, inactive);
  ledger = freezeExperimentPrediction(ledger, "EXP-N7-005", "2026-11-07T22:51:00.000Z");
  ledger = bindExperimentProtocol(
    ledger,
    "EXP-N7-005",
    {
      protocolId: "protocol:fixture-inactive-v0",
      compoundIdentity: "fixture-reagent-R1",
      dose: null,
      doseUnit: null,
      tissueOrCellState: "fixture positive-control well",
      controls: ["positive", "negative"],
      timing: "t_read fixture",
      batchId: "fixture-batch-004",
      deviations: [],
      missingFields: ["dose", "doseUnit"],
    },
    "2026-11-07T22:52:00.000Z",
  );
  ledger = attachExperimentOutcome(ledger, "EXP-N7-005", {
    outcomeClass: "inactive_assay",
    recordedAt: "2026-11-07T22:53:00.000Z",
    summary:
      "Fixture inactive assay: positive control silent. Biology of the original prediction is not refuted.",
    measuredValues: [{name: "positive_control_signal", value: "LOD", unit: "AU"}],
  });

  const supported: ExperimentRecordInput = {
    id: "EXP-N7-006",
    programme: "gut_immune_t2d",
    dataBasis: "fixture_engineering",
    fixtureHonesty: true,
    prediction: {
      n2PredictionRecordId: null,
      n2PredictionVersion: null,
      assertion: "Fixture prediction: marker M3 increases ≥15% versus vehicle under protocol v0.",
      subjectId: "marker:fixture_m3",
      predicate: "increases_after",
      objectId: "stimulus:fixture_s3",
      falsifier: "M3 increase is <15% versus vehicle.",
      freeze: null,
    },
    frozenEvalPins: pins,
    createdAt: "2026-11-07T23:00:00.000Z",
  };
  ledger = appendExperimentDraft(ledger, supported);
  ledger = freezeExperimentPrediction(ledger, "EXP-N7-006", "2026-11-07T23:01:00.000Z");
  ledger = bindExperimentProtocol(
    ledger,
    "EXP-N7-006",
    {
      protocolId: "protocol:fixture-supported-v0",
      compoundIdentity: "fixture-stimulus-S3",
      dose: "5",
      doseUnit: "µM",
      tissueOrCellState: "fixture monolayer",
      controls: ["vehicle"],
      timing: "24h fixture",
      batchId: "fixture-batch-005",
      deviations: [],
      missingFields: [],
    },
    "2026-11-07T23:02:00.000Z",
  );
  ledger = attachExperimentOutcome(ledger, "EXP-N7-006", {
    outcomeClass: "supported",
    recordedAt: "2026-11-07T23:03:00.000Z",
    summary:
      "Fixture supported outcome for engineering path coverage only — not a real laboratory finding.",
    measuredValues: [{name: "M3_percent_increase", value: "22", unit: "%"}],
  });

  return parseExperimentLedger(ledger);
}

function main(): void {
  mkdirSync(n7Dir, {recursive: true});
  mkdirSync(resolve(n7Dir, "fixtures"), {recursive: true});

  // Keep synthetic raw pointers present for hash demos.
  const rawPlate = resolve(n7Dir, "fixtures/raw-plate-fixture.txt");
  const rawM1 = resolve(n7Dir, "fixtures/raw-m1-fixture.txt");
  if (!check) {
    writeFileSync(rawPlate, "n7-fixture-raw-plate-v0\n");
    writeFileSync(rawM1, "n7-fixture-m1-v0\n");
  }

  const ledger = buildFixtureLedger();
  const status = buildExperimentLedgerStatus(ledger, generatedAt);

  if (check) {
    const existing = parseExperimentLedger(JSON.parse(readFileSync(ledgerPath, "utf8")));
    if (canonicalEvidenceJson(existing) !== canonicalEvidenceJson(ledger)) {
      console.error(
        JSON.stringify({ok: false, error: "N7 ledger fixture is stale; re-run without --check"}, null, 2),
      );
      process.exit(1);
    }
    const onDiskStatus = JSON.parse(readFileSync(statusPath, "utf8"));
    if (canonicalEvidenceJson(onDiskStatus) !== canonicalEvidenceJson(status)) {
      console.error(
        JSON.stringify({ok: false, error: "N7 STATUS.json is stale; re-run without --check"}, null, 2),
      );
      process.exit(1);
    }
    if (status.realObservationAcceptance !== "BLOCKED") {
      console.error(JSON.stringify({ok: false, error: "realObservationAcceptance must stay BLOCKED"}, null, 2));
      process.exit(1);
    }
    if (status.scientificApproval !== false || status.realObservationClaimed !== false) {
      console.error(JSON.stringify({ok: false, error: "Honesty flags must remain false"}, null, 2));
      process.exit(1);
    }
    const awaiting = existing.records.find((r) => r.id === "EXP-N7-001");
    if (!awaiting?.prediction.freeze || awaiting.outcome !== null) {
      console.error(
        JSON.stringify(
          {ok: false, error: "EXP-N7-001 must stay frozen without an invented outcome"},
          null,
          2,
        ),
      );
      process.exit(1);
    }
    console.log(
      JSON.stringify(
        {
          ok: true,
          path: "research/domain-graph/n7/ledger.v1.json",
          liveExperiments: existing.records.length,
          archivedVersions: existing.archives.length,
          outcomeClassesPresent: status.outcomeClassesPresent,
          realObservationAcceptance: status.realObservationAcceptance,
          scientificApproval: false,
        },
        null,
        2,
      ),
    );
    return;
  }

  writeJson(ledgerPath, ledger);
  writeJson(statusPath, status);
  console.log(
    JSON.stringify(
      {
        ok: true,
        wrote: ["research/domain-graph/n7/ledger.v1.json", "research/domain-graph/n7/STATUS.json"],
        liveExperiments: ledger.records.length,
        archivedVersions: ledger.archives.length,
        outcomeClassesPresent: status.outcomeClassesPresent,
        realObservationAcceptance: "BLOCKED",
      },
      null,
      2,
    ),
  );
}

main();
