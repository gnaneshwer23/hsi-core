import { describe, expect, test } from "bun:test";
import {
  GUT_PATHWAY_META,
  HSI_GUT_SEED_EDGES,
  HSI_T2D_IMMUNO_SEED_EDGES,
  buildGutImmunePack,
  buildSystemsVisionBundle,
  getPartnerLock,
  getVerticalDecision,
  gutDeepSeedsLanded,
} from "../src/index";

describe("P1.3 gut–immune SCFA ↔ mucosal Treg/Th17", () => {
  test("deep seeds land with verified PMIDs and honest uncertain grades", () => {
    expect(gutDeepSeedsLanded()).toBe(true);
    expect(HSI_GUT_SEED_EDGES.length).toBe(14);
    expect(GUT_PATHWAY_META.primaryPmids).toEqual([
      "21205640",
      "23842501",
      "24226770",
      "23828891",
      "24917457",
      "30918945",
      "19625695",
      "24412617",
      "29163504",
      "24226773",
      "24390544",
      "25865369",
      "19836068",
      "23973224",
    ]);
    expect(GUT_PATHWAY_META.deepenPhase).toBe(
      "p1_9_gut_sfb_ahr_neighbourhood",
    );

    for (const edge of HSI_GUT_SEED_EDGES) {
      expect(edge.id.startsWith("HSI-E-GUT-")).toBe(true);
      expect(edge.provenance?.pmid?.trim()).toBeTruthy();
      expect(edge.curationReview).toBe("source-verified");
      expect(edge.hsiGrade).toBe("uncertain");
      expect(["associative", "hypothesized"]).toContain(edge.teachingStatus);
    }

    const th17Promote = HSI_GUT_SEED_EDGES.find((e) => e.id === "HSI-E-GUT-005");
    const th17Inhibit = HSI_GUT_SEED_EDGES.find((e) => e.id === "HSI-E-GUT-006");
    expect(th17Promote?.teachingStatus).toBe("hypothesized");
    expect(th17Inhibit?.teachingStatus).toBe("hypothesized");
    // Hypothesized frames keep Phase 0 directional types (systems pred still aliased)
    expect(th17Promote?.edgeType).toBe("upregulates");
    expect(th17Inhibit?.edgeType).toBe("inhibits");

    const butyrateTreg = HSI_GUT_SEED_EDGES.find((e) => e.id === "HSI-E-GUT-003");
    expect(butyrateTreg?.edgeType).toBe("produces_metabolite_sensed_by");
    const clostridia = HSI_GUT_SEED_EDGES.find((e) => e.id === "HSI-E-GUT-001");
    expect(clostridia?.edgeType).toBe("modulates_immune");
  });

  test("pack + systems vision deepSeedsPresent; RA lock + partnerSigned untouched", () => {
    const pack = buildGutImmunePack({
      generatedAt: "2026-11-01T18:30:00.000Z",
    });
    expect(pack.schemaVersion).toBe("hsi-gut-immune-pack-1");
    expect(pack.deepSeedsPresent).toBe(true);
    expect(pack.discoveryRole).toBe("systems_secondary_axis");
    expect(pack.notCds).toBe(true);
    expect(pack.autoApproveIntoKg).toBe(false);
    expect(pack.stage1ActiveScope.diseaseId).toBe("ra");
    expect(pack.stage1ActiveScope.partnerSigned).toBe(true);
    expect(
      pack.competingExplanations.some((c) => c.id.includes("th17-promote")),
    ).toBe(true);
    expect(
      pack.competingExplanations.some((c) => c.id.includes("th17-inhibit")),
    ).toBe(true);

    const vision = buildSystemsVisionBundle();
    const gutDomain = vision.domains.find(
      (d) => d.domain === "gut_microbiome_immune",
    );
    expect(gutDomain?.deepSeedsPresent).toBe(true);
    expect(vision.gutMicrobiome.deepSeedsPresent).toBe(true);
    expect(vision.gutMicrobiome.neighbourhoodPack).toBe("hsi-gut-immune-pack");
    const neuro = vision.domains.find(
      (d) => d.domain === "neuroimmune_brain_immune",
    );
    // P2.1 may land in parallel; gut test only asserts gut deep seeds + RA lock.
    expect(typeof neuro?.deepSeedsPresent).toBe("boolean");

    const lock = getPartnerLock();
    expect(lock.scopeLocked).toBe(true);
    expect(lock.disease?.id).toBe("ra");
    expect(lock.partnerSigned).toBe(true);
    expect(lock.lockedPilot).toBe(false);
    expect(lock.isHypothetical).toBe(true);
    expect(lock.partner?.id).toBe("test:hypothetical-isi-pilot-partner");
    expect(lock.verticalStrategy).toBe("dual_track");

    const decision = getVerticalDecision();
    expect(decision.activeScope).toBe("ra-tnf");
    expect(decision.prdMvpTarget).toBe("ssc-tfh-b-il21");

    expect(HSI_T2D_IMMUNO_SEED_EDGES.some((e) => e.id === "HSI-E-RA-001")).toBe(
      true,
    );
    expect(HSI_T2D_IMMUNO_SEED_EDGES.some((e) => e.id === "HSI-E-GUT-003")).toBe(
      true,
    );
    expect(HSI_T2D_IMMUNO_SEED_EDGES.some((e) => e.id === "HSI-E-SSC-001")).toBe(
      true,
    );
  });
});
