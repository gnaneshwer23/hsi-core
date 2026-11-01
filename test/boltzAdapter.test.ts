import { describe, expect, test } from "bun:test";
import {
  WeightsPolicyNotAckedError,
  runBoltzAdapter,
  serializeBoltzAdapterBundle,
  serializeBoltzAdapterMarkdown,
} from "../src/index";

describe("Boltz adapter (WEIGHTS_POLICY_ACK)", () => {
  test("refuses without WEIGHTS_POLICY_ACK", () => {
    expect(() =>
      runBoltzAdapter({
        generatedAt: "2026-11-01T21:00:00.000Z",
        env: {},
      }),
    ).toThrow(WeightsPolicyNotAckedError);
  });

  test("emits Gate C pending proposals citing pack edges", () => {
    const bundle = runBoltzAdapter({
      generatedAt: "2026-11-01T21:00:00.000Z",
      env: { WEIGHTS_POLICY_ACK: "true" },
    });
    expect(bundle.adapterId).toBe("adapter-boltz");
    expect(bundle.runtime).toBe("stub");
    expect(bundle.autoApprove).toBe(false);
    expect(bundle.autoApproveIntoKg).toBe(false);
    expect(bundle.mayFlipEvidenceGrade).toBe(false);
    expect(bundle.vendorsModelWeights).toBe(false);
    expect(bundle.weightsPolicyAck).toBe(true);
    expect(bundle.proposals.map((p) => p.proposalId)).toEqual([
      "HSI-MP-BOLTZ-TNF-001",
      "HSI-MP-BOLTZ-FOXP3-001",
    ]);
    for (const p of bundle.proposals) {
      expect(p.suggestedTeachingStatus).toBe("hypothesized");
      expect(p.sourceAdapterOrAgent).toBe("adapter-boltz");
      expect(p.contextNote).toContain("does not set hsiGrade");
      expect(p.evidenceHints.some((h) => h.startsWith("edge:"))).toBe(true);
      expect(p.evidenceHints.some((h) => h.startsWith("pack:"))).toBe(true);
    }

    const json = JSON.parse(serializeBoltzAdapterBundle(bundle));
    expect(json.vendorsModelWeights).toBe(false);
    const md = serializeBoltzAdapterMarkdown(bundle);
    expect(md).toContain("HSI-MP-BOLTZ-TNF-001");
    expect(md).toContain("WEIGHTS_POLICY_ACK=true");
  });
});
