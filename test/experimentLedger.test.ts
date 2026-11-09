import {describe, expect, it} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  appendExperimentDraft,
  attachExperimentOutcome,
  bindExperimentProtocol,
  emptyExperimentLedger,
  freezeExperimentPrediction,
  hashExperimentPredictionBody,
  parseExperimentLedger,
  readExperimentRecord,
  submitExperimentReviewCandidate,
  type ExperimentRecordInput,
} from "../src/evidence/experimentLedger";

const root = resolve(import.meta.dir, "..");
const fixturePath = resolve(root, "research/domain-graph/n7/ledger.v1.json");

function draftInput(overrides: Partial<ExperimentRecordInput> = {}): ExperimentRecordInput {
  return {
    id: "EXP-TEST-001",
    dataBasis: "fixture_engineering",
    fixtureHonesty: true,
    prediction: {
      n2PredictionRecordId: null,
      n2PredictionVersion: null,
      assertion: "Fixture test prediction.",
      subjectId: "marker:test",
      predicate: "changes_after",
      objectId: "stimulus:test",
      falsifier: "No pre-specified change.",
      freeze: null,
    },
    frozenEvalPins: {
      n3KitHash: null,
      n6ProtocolHash: null,
      mayMutatePinnedEval: false,
    },
    createdAt: "2026-11-07T22:00:00.000Z",
    ...overrides,
    programme: overrides.programme ?? "gut_immune_t2d",
  };
}

describe("N7 experiment ledger freeze-before-outcome", () => {
  it("freezes prediction content hash and refuses outcome before freeze", () => {
    let ledger = appendExperimentDraft(emptyExperimentLedger(), draftInput());
    const draft = readExperimentRecord(ledger, "EXP-TEST-001");
    expect(draft.lifecycle).toBe("prediction_draft");
    expect(draft.prediction.freeze).toBeNull();

    expect(() =>
      attachExperimentOutcome(ledger, "EXP-TEST-001", {
        outcomeClass: "supported",
        recordedAt: "2026-11-07T22:10:00.000Z",
        summary: "should fail",
        measuredValues: [],
      }),
    ).toThrow(/before prediction freeze/);

    ledger = freezeExperimentPrediction(ledger, "EXP-TEST-001", "2026-11-07T22:05:00.000Z");
    const frozen = readExperimentRecord(ledger, "EXP-TEST-001");
    expect(frozen.lifecycle).toBe("prediction_frozen");
    expect(frozen.prediction.freeze?.outcomeUnknownAtFreeze).toBe(true);
    expect(frozen.prediction.freeze?.predictionContentHash).toBe(
      hashExperimentPredictionBody(frozen.prediction),
    );
  });

  it("fail-closes when outcome timestamp precedes freeze", () => {
    let ledger = appendExperimentDraft(emptyExperimentLedger(), draftInput());
    ledger = freezeExperimentPrediction(ledger, "EXP-TEST-001", "2026-11-07T22:05:00.000Z");
    ledger = bindExperimentProtocol(
      ledger,
      "EXP-TEST-001",
      {
        protocolId: "protocol:test",
        compoundIdentity: "fixture",
        dose: "1",
        doseUnit: "µM",
        tissueOrCellState: "fixture",
        controls: ["vehicle"],
        timing: "24h",
        batchId: "b1",
        deviations: [],
        missingFields: [],
      },
      "2026-11-07T22:06:00.000Z",
    );
    expect(() =>
      attachExperimentOutcome(ledger, "EXP-TEST-001", {
        outcomeClass: "inconclusive",
        recordedAt: "2026-11-07T22:04:00.000Z",
        summary: "too early",
        measuredValues: [],
      }),
    ).toThrow(/cannot precede prediction freeze/);
  });

  it("forces honesty flags on negative_null and technical_failure", () => {
    let ledger = appendExperimentDraft(emptyExperimentLedger(), draftInput());
    ledger = freezeExperimentPrediction(ledger, "EXP-TEST-001", "2026-11-07T22:05:00.000Z");
    ledger = bindExperimentProtocol(
      ledger,
      "EXP-TEST-001",
      {
        protocolId: "protocol:test",
        compoundIdentity: "fixture",
        dose: null,
        doseUnit: null,
        tissueOrCellState: null,
        controls: [],
        timing: null,
        batchId: null,
        deviations: [],
        missingFields: ["dose", "doseUnit", "tissueOrCellState", "timing", "batchId"],
      },
      "2026-11-07T22:06:00.000Z",
    );
    ledger = attachExperimentOutcome(ledger, "EXP-TEST-001", {
      outcomeClass: "negative_null",
      recordedAt: "2026-11-07T22:07:00.000Z",
      summary: "null result fixture",
      measuredValues: [],
    });
    const neg = readExperimentRecord(ledger, "EXP-TEST-001");
    expect(neg.outcome?.noEffectNotEstablished).toBe(true);
    expect(neg.outcome?.biologyNotRefuted).toBe(false);
    expect(neg.outcome?.lockedPredictionContentHash).toBe(neg.prediction.freeze!.predictionContentHash);
  });

  it("review candidates cannot publish graph or edit frozen eval", () => {
    let ledger = appendExperimentDraft(emptyExperimentLedger(), draftInput());
    ledger = freezeExperimentPrediction(ledger, "EXP-TEST-001", "2026-11-07T22:05:00.000Z");
    ledger = bindExperimentProtocol(
      ledger,
      "EXP-TEST-001",
      {
        protocolId: "protocol:test",
        compoundIdentity: "fixture",
        dose: "1",
        doseUnit: "u",
        tissueOrCellState: "x",
        controls: ["c"],
        timing: "t",
        batchId: "b",
        deviations: [],
        missingFields: [],
      },
      "2026-11-07T22:06:00.000Z",
    );
    ledger = attachExperimentOutcome(ledger, "EXP-TEST-001", {
      outcomeClass: "technical_failure",
      recordedAt: "2026-11-07T22:07:00.000Z",
      summary: "qc fail",
      measuredValues: [],
    });
    const failed = readExperimentRecord(ledger, "EXP-TEST-001");
    expect(failed.outcome?.biologyNotRefuted).toBe(true);

    ledger = submitExperimentReviewCandidate(
      ledger,
      "EXP-TEST-001",
      "2026-11-07T22:08:00.000Z",
      "candidate only",
    );
    const review = readExperimentRecord(ledger, "EXP-TEST-001");
    expect(review.lifecycle).toBe("review_candidate");
    expect(review.reviewCandidate?.graphPromotable).toBe(false);
    expect(review.reviewCandidate?.mayEditFrozenEvaluationData).toBe(false);
    expect(review.graphPromotable).toBe(false);
    expect(review.scientificApproval).toBe(false);
  });

  it("rejects non-fixture rows while real observation acceptance is BLOCKED", () => {
    expect(() =>
      appendExperimentDraft(
        emptyExperimentLedger(),
        draftInput({
          dataBasis: "authorised_public_data",
          fixtureHonesty: false,
        }),
      ),
    ).toThrow(/realObservationAcceptance/);
  });

  it("rejects mayMutatePinnedEval=true", () => {
    expect(() =>
      appendExperimentDraft(
        emptyExperimentLedger(),
        draftInput({
          frozenEvalPins: {
            n3KitHash: null,
            n6ProtocolHash: null,
            mayMutatePinnedEval: true as false,
          },
        }),
      ),
    ).toThrow(/cannot mutate frozen evaluation/);
  });

  it("loads N7 fixture with distinct outcome classes and awaiting freeze", () => {
    const fixture = parseExperimentLedger(JSON.parse(readFileSync(fixturePath, "utf8")));
    expect(fixture.phase).toBe("N7");
    expect(fixture.realObservationAcceptance).toBe("BLOCKED");
    expect(fixture.scientificApproval).toBe(false);
    expect(fixture.realObservationClaimed).toBe(false);

    const awaiting = fixture.records.find((r) => r.id === "EXP-N7-001")!;
    expect(awaiting.prediction.n2PredictionRecordId).toBe("N2-R-002");
    expect(awaiting.prediction.freeze).not.toBeNull();
    expect(awaiting.outcome).toBeNull();
    expect(awaiting.lifecycle).toBe("protocol_bound");

    const classes = new Set(
      fixture.records.map((r) => r.outcome?.outcomeClass).filter(Boolean),
    );
    expect(classes.has("supported")).toBe(true);
    expect(classes.has("negative_null")).toBe(true);
    expect(classes.has("inconclusive")).toBe(true);
    expect(classes.has("inactive_assay")).toBe(true);
    expect(classes.has("technical_failure")).toBe(true);
    expect(fixture.records.every((r) => r.fixtureHonesty === true)).toBe(true);
  });
});
