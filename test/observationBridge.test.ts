import { test, expect } from "bun:test";
import {
  OBSERVATION_BIOLOGY_BRIDGE_VERSION,
  ObservationBiologyBridgeError,
  bridgeObservationToBiology,
} from "../src/observationBiologyBridge";
import {
  CORRECTION_PROVENANCE_VERSION,
  emptyCorrectionProvenanceBundle,
  assertCorrectionFeedSeparation,
  routeCorrectionStub,
  CorrectionProvenanceError,
} from "../src/correctionProvenance";
import { secondIndicationPackStub } from "../src/secondPackStub";

test("observation biology bridge accepts research-safe synthetic observation", () => {
  const result = bridgeObservationToBiology({
    id: "obs-1",
    label: "Demo CRP trend",
    observationCode: "SYN-OBS-CRP",
    valueSummary: "elevated (fixture)",
    containsPhi: false,
    syntheticOnly: true,
    liveEmis: false,
  });
  expect(result.schemaVersion).toBe(OBSERVATION_BIOLOGY_BRIDGE_VERSION);
  expect(result.containsPhi).toBe(false);
  expect(result.clinicalAdvice).toBe(false);
  expect(result.kgWrite).toBe(false);
  expect(result.notCds).toBe(true);
  expect(result.scientificReview).toBe("unreviewed");
});

test("observation biology bridge rejects PHI / live EMIS payloads", () => {
  expect(() =>
    bridgeObservationToBiology({
      id: "obs-bad",
      label: "bad",
      observationCode: "x",
      valueSummary: "x",
      containsPhi: true,
      syntheticOnly: true,
      liveEmis: false,
    } as never),
  ).toThrow(ObservationBiologyBridgeError);
});

test("correction provenance keeps eval frozen and blocks demo into training", () => {
  const empty = emptyCorrectionProvenanceBundle();
  expect(empty.schemaVersion).toBe(CORRECTION_PROVENANCE_VERSION);
  assertCorrectionFeedSeparation(empty);
  const demo = routeCorrectionStub({
    id: "corr-demo-1",
    investigationKey: "inv-1",
    releaseId: "ra-anti-tnf-demo",
    rationale: "Demo-only correction",
    createdAt: "2026-11-03T16:00:00Z",
    intendedFeed: "demo_fixture_only",
  });
  expect(demo.feed).toBe("demo_fixture_only");
  expect(demo.notForScientificClaim).toBe(true);
  expect(() =>
    routeCorrectionStub({
      id: "corr-bad",
      investigationKey: "inv-1",
      releaseId: "ra-anti-tnf-demo",
      rationale: "Must not train",
      createdAt: "2026-11-03T16:00:00Z",
      intendedFeed: "training_permitted",
    }),
  ).toThrow(CorrectionProvenanceError);
});

test("second indication pack stub stays scaffolding until rights-verified RA", () => {
  const stub = secondIndicationPackStub();
  expect(stub.status).toBe("scaffolding_only");
  expect(stub.dependsOn.demoDoesNotSatisfy).toBe(true);
  expect(stub.dependsOn.firstPackReleaseId).toBe("ra-anti-tnf-evidence");
});
