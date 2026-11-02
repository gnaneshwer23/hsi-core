import { describe, expect, it } from "bun:test";
import { buildAkshResearchExport } from "../src/akshResearchExport";
import { HSI_T2D_IMMUNO_SEED_EDGES } from "../src/seed/t2dImmunoMetabolic";

describe("Aksh public research export", () => {
  it("exports actual mapped concepts, unchanged grades and source caveats without patient/action objects", () => {
    const bundle = buildAkshResearchExport("a".repeat(40), "2026-11-02T00:00:00.000Z");
    expect(bundle.cards.length).toBeGreaterThan(0);
    expect(bundle.containsPhi).toBe(false);
    expect(bundle.notCds).toBe(true);
    expect(bundle.autoApplyToEhr).toBe(false);
    for (const card of bundle.cards) {
      const edge = HSI_T2D_IMMUNO_SEED_EDGES.find((item) => item.id === card.edgeId)!;
      expect(card.grade).toBe(edge.hsiGrade);
      expect(card.provenanceNote).toBe(edge.provenance.notes);
      expect(card.sourceSupport).toBe("not_verified_for_clinical_use");
      expect(card).not.toHaveProperty("observation");
      expect(card).not.toHaveProperty("requiredClinicianAction");
      expect(card.akshNodeId.startsWith("aksh:")).toBe(true);
    }
  });
  it("requires source revision and a valid timestamp", () => {
    expect(() => buildAkshResearchExport("main")).toThrow("revision");
    expect(() => buildAkshResearchExport("a".repeat(40), "invalid")).toThrow("timestamp");
  });
});
