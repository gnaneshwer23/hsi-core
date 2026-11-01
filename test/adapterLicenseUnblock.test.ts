import { describe, expect, test } from "bun:test";
import {
  P3AdapterLicenseBlockedError,
  WeightsPolicyNotAckedError,
  assertBoltzAdapterRunnable,
  assertP3AdapterRunnable,
  assertWeightsPolicyAcked,
  buildAf3AdapterProposals,
  buildGateCChecklist,
  buildIsiAgentsAdapterProposals,
  buildModelEvalHarnessBundle,
  buildTdcAdapterProposals,
  getResearchSignOffFixture,
  runAf3Adapter,
  runBoltzAdapter,
  runIsiAgentsAdapter,
  runTdcAdapter,
} from "../src/index";

describe("Research sign-off fixture + Boltz weights policy", () => {
  test("AF3/TDC/ISI fixtures unlock with notCommercial + replaceWithLegalSignOff", () => {
    for (const id of ["adapter-af3", "adapter-tdc", "adapter-isi-agents"] as const) {
      const fixture = getResearchSignOffFixture(id);
      expect(fixture).toBeDefined();
      expect(fixture!.notCommercial).toBe(true);
      expect(fixture!.replaceWithLegalSignOff).toBe(true);
      expect(fixture!.legalBinding).toBe(false);
      expect(fixture!.banner.length).toBeGreaterThan(20);
      const row = assertP3AdapterRunnable(id);
      expect(row.blockedUntilSignOff).toBe(false);
    }

    const af3 = runAf3Adapter({ generatedAt: "2026-11-01T20:00:00.000Z" });
    expect(af3.notCommercial).toBe(true);
    expect(af3.commercialAf3RightsClaimed).toBe(false);
    expect(af3.proposals.length).toBe(2);
    expect(af3.banner.toLowerCase()).toContain("not commercial");

    const tdc = runTdcAdapter({ generatedAt: "2026-11-01T20:00:00.000Z" });
    expect(tdc.proposals.length).toBe(2);
    expect(tdc.notCommercial).toBe(true);

    const isi = runIsiAgentsAdapter({
      generatedAt: "2026-11-01T20:00:00.000Z",
    });
    expect(isi.runtimeOutOfRepo).toBe(true);
    expect(isi.proposals.length).toBe(2);
  });

  test("Boltz requires WEIGHTS_POLICY_ACK; never vendors weights", () => {
    expect(() =>
      assertBoltzAdapterRunnable(undefined, { WEIGHTS_POLICY_ACK: "false" }),
    ).toThrow(WeightsPolicyNotAckedError);
    expect(() => assertWeightsPolicyAcked("adapter-boltz", {})).toThrow(
      WeightsPolicyNotAckedError,
    );

    const bundle = runBoltzAdapter({
      generatedAt: "2026-11-01T20:00:00.000Z",
      env: { WEIGHTS_POLICY_ACK: "true" },
    });
    expect(bundle.weightsPolicyAck).toBe(true);
    expect(bundle.vendorsModelWeights).toBe(false);
    expect(bundle.autoApprove).toBe(false);
    expect(bundle.mayFlipEvidenceGrade).toBe(false);
    expect(bundle.proposals.length).toBe(2);
    expect(bundle.externalWeightsCache).toBeNull();
    expect(bundle.proposals[0]!.proposalId).toBe("HSI-MP-BOLTZ-TNF-001");
    expect(bundle.proposals[1]!.proposalId).toBe("HSI-MP-BOLTZ-FOXP3-001");
    expect(
      bundle.proposals[0]!.evidenceHints.some((h) => h === "edge:HSI-E-RA-001"),
    ).toBe(true);
    expect(
      bundle.proposals[1]!.evidenceHints.some((h) => h === "edge:HSI-E-GUT-003"),
    ).toBe(true);

    // Optional external cache path — stub still runs; no weights downloaded/vendored.
    const withCache = runBoltzAdapter({
      generatedAt: "2026-11-01T20:00:00.000Z",
      env: {
        WEIGHTS_POLICY_ACK: "true",
        BOLTZ_WEIGHTS_CACHE: "/tmp/hsi-boltz-cache-absent",
      },
    });
    expect(withCache.externalWeightsCache).toBe(
      "/tmp/hsi-boltz-cache-absent",
    );
    expect(withCache.vendorsModelWeights).toBe(false);
    expect(withCache.runtime).toBe("stub");
    expect(withCache.proposals[0]!.contextNote).toContain(
      "BOLTZ_WEIGHTS_CACHE=/tmp/hsi-boltz-cache-absent",
    );
  });

  test("Gate C + eval harness include new stub proposals", () => {
    const gate = buildGateCChecklist({
      generatedAt: "2026-11-01T20:00:00.000Z",
    });
    const sources = new Set(
      gate.modelProposals.map((p) => p.sourceAdapterOrAgent),
    );
    expect(sources.has("adapter-af3")).toBe(true);
    expect(sources.has("adapter-tdc")).toBe(true);
    expect(sources.has("adapter-boltz")).toBe(true);
    expect(sources.has("adapter-isi-agents")).toBe(true);
    expect(gate.summary.modelProposalsAutoApprove).toBe(0);

    const af3 = buildAf3AdapterProposals({
      createdAt: "2026-11-01T20:00:00.000Z",
    });
    const tdc = buildTdcAdapterProposals({
      createdAt: "2026-11-01T20:00:00.000Z",
    });
    const isi = buildIsiAgentsAdapterProposals({
      createdAt: "2026-11-01T20:00:00.000Z",
    });
    expect(af3[0]!.suggestedTeachingStatus).toBe("hypothesized");
    expect(tdc[0]!.evidenceHints.some((h) => h.startsWith("edge:"))).toBe(true);
    expect(isi[0]!.sourceAdapterOrAgent).toBe("adapter-isi-agents");

    const harness = buildModelEvalHarnessBundle({
      generatedAt: "2026-11-01T20:00:00.000Z",
    });
    const ids = new Set(harness.cases.map((c) => c.caseId));
    expect(ids.has("EVAL-PASS-AF3-TNF-001")).toBe(true);
    expect(ids.has("EVAL-PASS-TDC-ADMET-001")).toBe(true);
    expect(ids.has("EVAL-PASS-BOLTZ-TNF-001")).toBe(true);
    expect(ids.has("EVAL-PASS-ISI-AGENTS-LIT-001")).toBe(true);
    expect(harness.summary.stubBehaviorGreen).toBe(true);

    // Keep blocked-error class import live for future blocked rows.
    expect(typeof P3AdapterLicenseBlockedError).toBe("function");
  });
});
