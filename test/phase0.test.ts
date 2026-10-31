/**
 * HSI Phase 0 foundation — schema, grades, seed, safety criteria, LOINC links.
 * Run: bun test
 */
import { describe, expect, it } from "bun:test";
import {
  HSI_CURATION_REVIEWS,
  HSI_EXAMPLE_TRANSLATION_CARDS,
  HSI_GRADES,
  HSI_MARKERS,
  HSI_SAFETY_RELEASE_CRITERIA_V0,
  HSI_T2D_IMMUNO_SEED_EDGES,
  buildIsiExportBundle,
  hsiGradeFromCuration,
  isCdsSurfacable,
  linkClaimToMarker,
  listBridgeCandidates,
  seedClaimLoincMap,
  summarizeGradeCounts,
  validateHsiEdge,
  validateTranslationCard,
} from "../src/index";

describe("HSI Phase 0 grades", () => {
  it("maps ISI curation reviews onto coarse HSI grades without silent promotion", () => {
    expect(hsiGradeFromCuration("approved")).toBe("established");
    expect(hsiGradeFromCuration("claim-assessed")).toBe("uncertain");
    expect(hsiGradeFromCuration("source-verified")).toBe("uncertain");
    expect(hsiGradeFromCuration("draft")).toBe("unexplored");
    expect(hsiGradeFromCuration("unreviewed")).toBe("unexplored");
    expect(HSI_CURATION_REVIEWS).toHaveLength(8);
    expect(HSI_GRADES).toEqual(["established", "uncertain", "unexplored"]);
  });
});

describe("HSI Phase 0 seed edges", () => {
  it("ships at least 20 curated placeholder edges with provenance fields", () => {
    expect(HSI_T2D_IMMUNO_SEED_EDGES.length).toBeGreaterThanOrEqual(20);
    for (const edge of HSI_T2D_IMMUNO_SEED_EDGES) {
      const result = validateHsiEdge(edge);
      expect(result.ok, `${edge.id}: ${result.issues.map((i) => i.message).join("; ")}`).toBe(true);
      expect(edge.provenance.recordedAt).toBeTruthy();
      expect(edge.seedKind).toBe("placeholder");
      expect(edge.hsiGrade).toBe(hsiGradeFromCuration(edge.curationReview));
      expect(isCdsSurfacable(edge)).toBe(false);
    }
  });

  it("includes immuno-metabolic bridge candidates for P1 shortlist", () => {
    const bridges = listBridgeCandidates();
    expect(bridges.length).toBeGreaterThanOrEqual(8);
    expect(bridges.every((e) => e.bridgeCandidate)).toBe(true);
  });

  it("summarizes grade density for the seed set", () => {
    const counts = summarizeGradeCounts(HSI_T2D_IMMUNO_SEED_EDGES);
    expect(counts.established).toBe(0);
    expect(counts.uncertain + counts.unexplored).toBe(HSI_T2D_IMMUNO_SEED_EDGES.length);
  });
});

describe("HSI Phase 0 translation cards", () => {
  it("provides one T2D and one immuno-metabolic claim→marker→observation→action card", () => {
    expect(HSI_EXAMPLE_TRANSLATION_CARDS).toHaveLength(2);
    for (const card of HSI_EXAMPLE_TRANSLATION_CARDS) {
      const result = validateTranslationCard(card);
      expect(result.ok, result.issues.map((i) => i.message).join("; ")).toBe(true);
      expect(card.action.requiresHitl).toBe(true);
      expect(card.observation.dataClass).toBe("fixture");
    }
    expect(HSI_MARKERS.some((m) => m.loinc === "4548-4")).toBe(true);
  });
});

describe("HSI Phase 0 safety release criteria v0", () => {
  it("covers HITL, no PHI→LLM, and not-CDS labelling", () => {
    const text = HSI_SAFETY_RELEASE_CRITERIA_V0.map((c) => c.rule).join(" ");
    expect(text.toLowerCase()).toContain("hitl");
    expect(text.toLowerCase()).toMatch(/llm|phi/);
    expect(text.toLowerCase()).toContain("cds");
    expect(HSI_SAFETY_RELEASE_CRITERIA_V0.length).toBeGreaterThanOrEqual(5);
  });
});

describe("claim → LOINC mapping", () => {
  it("wires HbA1c and hs-CRP claims to LOINC codes", () => {
    const hba1c = linkClaimToMarker("HSI-C-T2D-001");
    expect(hba1c?.marker.loinc).toBe("4548-4");
    const crp = linkClaimToMarker("HSI-C-IM-004");
    expect(crp?.marker.loinc).toBe("30522-7");
    const links = seedClaimLoincMap();
    expect(links.length).toBeGreaterThanOrEqual(4);
    expect(links.every((l) => /^\d+-\d+$/.test(l.loinc))).toBe(true);
  });
});

describe("ISI export bundle", () => {
  it("emits not-CDS graded payload with LOINC coverage", () => {
    const bundle = buildIsiExportBundle({ generatedAt: "2026-10-31T00:00:00.000Z" });
    expect(bundle.schemaVersion).toBe("hsi-isi-export-1");
    expect(bundle.notCds).toBe(true);
    expect(bundle.edges.length).toBe(HSI_T2D_IMMUNO_SEED_EDGES.length);
    expect(bundle.claimLoincLinks.length).toBeGreaterThanOrEqual(4);
    expect(bundle.safetyCriteriaIds).toContain("HSI-SAFE-001");
  });
});
