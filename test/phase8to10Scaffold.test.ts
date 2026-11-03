import { test, expect } from "bun:test";
import { bridgeObservationToBiology, ObservationBiologyBridgeError } from "../src/observationBiologyBridge";
import { secondIndicationPackStub } from "../src/secondPackStub";
import { decideClinicalResearchScaffold, clinicalResearchScaffoldManifest } from "../src/clinicalResearchScaffold";

test("observation bridge maps research-safe stubs without PHI or CDS", () => {
  const result = bridgeObservationToBiology({
    id: "SYN-OBS-1",
    label: "Synthetic RA anti-TNF serology pointer",
    observationCode: "SYN-RA-SEROLOGY",
    valueSummary: "Fixture RF/anti-CCP context for rheumatoid arthritis research.",
    containsPhi: false,
    syntheticOnly: true,
    liveEmis: false,
  });
  expect(result.containsPhi).toBe(false);
  expect(result.clinicalAdvice).toBe(false);
  expect(result.concepts.some((c) => c.conceptId === "D001")).toBe(true);
  expect(result.concepts.every((c) => c.support === "unassessed")).toBe(true);
});

test("observation bridge refuses PHI-marked payloads", () => {
  expect(() =>
    bridgeObservationToBiology({
      id: "SYN-OBS-BAD",
      label: "Patient name and NHS number present",
      observationCode: "BAD",
      valueSummary: "Contains protected health information markers.",
      containsPhi: false,
      syntheticOnly: true,
      liveEmis: false,
    }),
  ).toThrow(ObservationBiologyBridgeError);
});

test("second pack stub stays blocked on research working set", () => {
  const pack = secondIndicationPackStub();
  expect(pack.status).toBe("scaffolding_only");
  expect(pack.candidateIndication).toBeNull();
  expect(pack.dependsOn.researchWorkingSetDoesNotSatisfy).toBe(true);
  expect(pack.notForScientificClaim).toBe(true);
});

test("clinical research scaffold refuses live CDS and PHI", () => {
  expect(decideClinicalResearchScaffold({ purpose: "live_cds", containsPhi: false, syntheticOnly: true }).allow).toBe(false);
  expect(decideClinicalResearchScaffold({ purpose: "phi_linked_research", containsPhi: true, syntheticOnly: false }).allow).toBe(false);
  expect(decideClinicalResearchScaffold({ purpose: "trials_criteria_stub", containsPhi: false, syntheticOnly: true }).allow).toBe(true);
  const manifest = clinicalResearchScaffoldManifest();
  expect(manifest.notCds).toBe(true);
  expect(manifest.refuses).toContain("live_cds");
});
