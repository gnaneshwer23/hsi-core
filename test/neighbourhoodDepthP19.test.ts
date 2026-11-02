import { describe, expect, test } from "bun:test";
import {
  GUT_PATHWAY_META,
  HSI_GUT_SEED_EDGES,
  HSI_NI_SEED_EDGES,
  HSI_SSC_SEED_EDGES,
  HSI_T2D_IMMUNO_SEED_EDGES,
  NI_PATHWAY_META,
  SSC_PATHWAY_META,
  buildSourceLicensingStubBundle,
  getPartnerLock,
} from "../src/index";

describe("P1.9 SSc/gut/neuro neighbourhood depth", () => {
  test("neuro adds microglia/BBB edges with honest grades; VNS–RA stays hypothesized", () => {
    const microglia = HSI_NI_SEED_EDGES.find((e) => e.id === "HSI-E-NI-012");
    expect(microglia?.provenance?.pmid).toBe("15831717");
    expect(microglia?.edgeType).toBe("associates_neuroimmune");
    expect(microglia?.hsiGrade).toBe("uncertain");

    const bbbTransport = HSI_NI_SEED_EDGES.find((e) => e.id === "HSI-E-NI-015");
    expect(bbbTransport?.provenance?.pmid).toBe("8707929");
    expect(bbbTransport?.edgeType).toBe("associated_with");

    const monocyte = HSI_NI_SEED_EDGES.find((e) => e.id === "HSI-E-NI-016");
    expect(monocyte?.teachingStatus).toBe("hypothesized");
    expect(monocyte?.provenance?.pmid).toBe("19228962");

    const humanVns = HSI_NI_SEED_EDGES.find((e) => e.id === "HSI-E-NI-006");
    expect(humanVns?.teachingStatus).toBe("hypothesized");
    expect(NI_PATHWAY_META.deepenPhase).toContain("p1_9");
  });

  test("gut adds SFB→Th17 + AhR hops; competing Th17 frames intact; RA untouched", () => {
    const sfb = HSI_GUT_SEED_EDGES.find((e) => e.id === "HSI-E-GUT-013");
    expect(sfb?.provenance?.pmid).toBe("19836068");
    expect(sfb?.teachingStatus).toBe("hypothesized");
    expect(sfb?.edgeType).toBe("upregulates");

    const ahr = HSI_GUT_SEED_EDGES.find((e) => e.id === "HSI-E-GUT-014");
    expect(ahr?.provenance?.pmid).toBe("23973224");
    expect(ahr?.edgeType).toBe("modulates_immune");

    expect(
      HSI_GUT_SEED_EDGES.find((e) => e.id === "HSI-E-GUT-005")?.teachingStatus,
    ).toBe("hypothesized");
    expect(
      HSI_GUT_SEED_EDGES.find((e) => e.id === "HSI-E-GUT-006")?.teachingStatus,
    ).toBe("hypothesized");
    expect(GUT_PATHWAY_META.deepenPhase).toContain("p1_9");
  });

  test("SSc adds vascular + fibrosis neighbourhood; EBV + RA Stage 1 untouched", () => {
    const vascular = HSI_SSC_SEED_EDGES.find((e) => e.id === "HSI-E-SSC-016");
    expect(vascular?.provenance?.pmid).toBe("19420368");
    expect(vascular?.teachingStatus).toBe("associative");

    const fibrosis = HSI_SSC_SEED_EDGES.find((e) => e.id === "HSI-E-SSC-017");
    expect(fibrosis?.provenance?.pmid).toBe("17332883");
    expect(fibrosis?.hsiGrade).toBe("uncertain");

    const ebv = HSI_SSC_SEED_EDGES.find((e) => e.subjectId === "HSI-N-ebv");
    expect(ebv?.teachingStatus).toBe("hypothesized");
    expect(SSC_PATHWAY_META.deepenPhase).toContain("p1_9");

    expect(HSI_T2D_IMMUNO_SEED_EDGES.some((e) => e.id === "HSI-E-RA-001")).toBe(
      true,
    );
    const lock = getPartnerLock();
    expect(lock.disease?.id).toBe("ra");
    expect(lock.lockedPilot).toBe(true);
  });

  test("new P1.9 PMIDs are licensing-stubbed; uncleared stays 0 under Apolo clearance", () => {
    const stub = buildSourceLicensingStubBundle();
    expect(stub.summary.clearanceScopeCounts.uncleared).toBe(0);
    expect(stub.summary.partnerClearedCount).toBeGreaterThanOrEqual(48);
    for (const pmid of [
      "15831717",
      "17220915",
      "25172555",
      "8707929",
      "19228962",
      "19836068",
      "23973224",
      "19420368",
      "17332883",
    ]) {
      const row = stub.rows.find((r) => r.pmid === pmid);
      expect(row?.partnerCleared).toBe(true);
      expect(row?.clearanceScope).not.toBe("uncleared");
    }
  });
});
