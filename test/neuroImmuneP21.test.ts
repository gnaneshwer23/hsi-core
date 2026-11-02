import { describe, expect, test } from "bun:test";
import {
  HSI_NI_SEED_EDGES,
  HSI_T2D_IMMUNO_SEED_EDGES,
  NI_PATHWAY_META,
  buildNeuroImmunePack,
  buildSystemsVisionBundle,
  getPartnerLock,
  getVerticalDecision,
  neuroDeepSeedsLanded,
} from "../src/index";

describe("P2.1 neuroimmune vagus / cholinergic anti-inflammatory reflex", () => {
  test("deep seeds land with verified PMIDs and honest uncertain grades", () => {
    expect(neuroDeepSeedsLanded()).toBe(true);
    expect(HSI_NI_SEED_EDGES.length).toBe(16);
    expect(NI_PATHWAY_META.primaryPmids).toEqual([
      "10839541",
      "12490958",
      "12508119",
      "16025117",
      "21921156",
      "27382171",
      "16785311",
      "18669662",
      "11901203",
      "19542466",
      "12469056",
      "15831717",
      "17220915",
      "25172555",
      "8707929",
      "19228962",
    ]);
    expect(NI_PATHWAY_META.neighbourhoodChoiceRationale.toLowerCase()).toContain(
      "clearest",
    );
    expect(NI_PATHWAY_META.deepenPhase).toBe(
      "p1_9_neuro_microglia_bbb_neighbourhood",
    );

    for (const edge of HSI_NI_SEED_EDGES) {
      expect(edge.id.startsWith("HSI-E-NI-")).toBe(true);
      expect(edge.provenance?.pmid?.trim()).toBeTruthy();
      expect(edge.curationReview).toBe("source-verified");
      expect(edge.hsiGrade).toBe("uncertain");
      expect(["associative", "hypothesized"]).toContain(edge.teachingStatus);
    }

    const humanVns = HSI_NI_SEED_EDGES.find((e) => e.id === "HSI-E-NI-006");
    expect(humanVns?.teachingStatus).toBe("hypothesized");
    expect(humanVns?.provenance?.pmid).toBe("27382171");
    // Hypothesized human VNS–RA keeps Phase 0 associated_with
    expect(humanVns?.edgeType).toBe("associated_with");

    const vagusTnf = HSI_NI_SEED_EDGES.find((e) => e.id === "HSI-E-NI-001");
    expect(vagusTnf?.edgeType).toBe("suppresses_peripheral_inflammation");
    const reflex = HSI_NI_SEED_EDGES.find((e) => e.id === "HSI-E-NI-002");
    expect(reflex?.edgeType).toBe("signals_via_axis");
    const jakStat = HSI_NI_SEED_EDGES.find((e) => e.id === "HSI-E-NI-004");
    expect(jakStat?.edgeType).toBe("associates_neuroimmune");
  });

  test("pack + systems vision deepSeedsPresent; RA/SSc/gut + partnerSigned untouched", () => {
    const pack = buildNeuroImmunePack({
      generatedAt: "2026-11-01T19:00:00.000Z",
    });
    expect(pack.schemaVersion).toBe("hsi-neuroimmune-pack-1");
    expect(pack.deepSeedsPresent).toBe(true);
    expect(pack.discoveryRole).toBe("systems_secondary_axis");
    expect(pack.notCds).toBe(true);
    expect(pack.autoApproveIntoKg).toBe(false);
    expect(pack.stage1ActiveScope.diseaseId).toBe("ra");
    expect(pack.stage1ActiveScope.partnerSigned).toBe(true);
    expect(
      pack.competingExplanations.some((c) => c.id.includes("vns-ra-human")),
    ).toBe(true);
    expect(
      pack.honesty.some((h) => /clinical brain–immune cure/i.test(h)),
    ).toBe(true);

    const vision = buildSystemsVisionBundle();
    const neuroDomain = vision.domains.find(
      (d) => d.domain === "neuroimmune_brain_immune",
    );
    expect(neuroDomain?.deepSeedsPresent).toBe(true);
    expect(vision.neuroimmune.deepSeedsPresent).toBe(true);
    expect(vision.neuroimmune.neighbourhoodPack).toBe("hsi-neuroimmune-pack");
    expect(vision.neuroimmune.neighbourhoodId).toBe(
      "neuro-vagus-cholinergic-reflex",
    );
    expect(vision.gutMicrobiome.deepSeedsPresent).toBe(true);

    const lock = getPartnerLock();
    expect(lock.scopeLocked).toBe(true);
    expect(lock.disease?.id).toBe("ra");
    expect(lock.partnerSigned).toBe(true);
    expect(lock.lockedPilot).toBe(true);
    expect(lock.isHypothetical).toBe(false);
    expect(lock.partner?.id).toBe("partner:apolo-pharma");
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
    expect(HSI_T2D_IMMUNO_SEED_EDGES.some((e) => e.id === "HSI-E-NI-001")).toBe(
      true,
    );
  });
});
