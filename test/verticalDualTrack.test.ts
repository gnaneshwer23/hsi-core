import { describe, expect, test } from "bun:test";
import {
  HSI_SSC_SEED_EDGES,
  HSI_T2D_IMMUNO_SEED_EDGES,
  SSC_PATHWAY_META,
  buildImmuneCellSpineBundle,
  buildSscPathwayPack,
  buildSystemsVisionBundle,
  getDiseaseVertical,
  getPartnerLock,
  getVerticalDecision,
  sscDeepSeedsLanded,
} from "../src/index";

describe("dual-track vertical decision A", () => {
  test("records dual_track with RA activeScope and SSc prdMvpTarget", () => {
    const d = getVerticalDecision();
    expect(d.option).toBe("A");
    expect(d.verticalStrategy).toBe("dual_track");
    expect(d.activeScope).toBe("ra-tnf");
    expect(d.prdMvpTarget).toBe("ssc-tfh-b-il21");
    expect(d.raComparisonFraming).toBe("release2");
  });

  test("partner lock keeps RA scopeLocked and surfaces dual-track fields", () => {
    const lock = getPartnerLock();
    expect(lock.scopeLocked).toBe(true);
    expect(lock.disease?.id).toBe("ra");
    expect(lock.partnerSigned).toBe(false);
    expect(lock.lockedPilot).toBe(false);
    expect(lock.verticalStrategy).toBe("dual_track");
    expect(lock.activeScope).toBe("ra-tnf");
    expect(lock.prdMvpTarget).toBe("ssc-tfh-b-il21");
    expect(lock.seedPathway?.id).toBe("ra-tnf-response-heterogeneity");
  });

  test("SSc thin seeds land with verified PMIDs; RA edges untouched", () => {
    expect(sscDeepSeedsLanded()).toBe(true);
    expect(HSI_SSC_SEED_EDGES.length).toBeGreaterThanOrEqual(6);
    for (const edge of HSI_SSC_SEED_EDGES) {
      expect(edge.provenance?.pmid?.trim()).toBeTruthy();
      expect(edge.id.startsWith("HSI-E-SSC-")).toBe(true);
    }
    const ebv = HSI_SSC_SEED_EDGES.find((e) => e.id === "HSI-E-SSC-007");
    expect(ebv?.teachingStatus).toBe("hypothesized");

    expect(HSI_T2D_IMMUNO_SEED_EDGES.some((e) => e.id === "HSI-E-RA-001")).toBe(
      true,
    );
    expect(HSI_T2D_IMMUNO_SEED_EDGES.some((e) => e.id === "HSI-E-SSC-001")).toBe(
      true,
    );
  });

  test("SSc pathway pack and disease vertical deepSeedsPresent", () => {
    const pack = buildSscPathwayPack({
      generatedAt: "2026-11-01T17:00:00.000Z",
    });
    expect(pack.schemaVersion).toBe("hsi-ssc-pathway-pack-1");
    expect(pack.deepSeedsPresent).toBe(true);
    expect(pack.pathway.id).toBe(SSC_PATHWAY_META.id);
    expect(pack.stage1ActiveScope.diseaseId).toBe("ra");
    expect(pack.notCds).toBe(true);
    expect(pack.competingExplanations.some((c) => c.id.includes("ebv"))).toBe(
      true,
    );

    const ssc = getDiseaseVertical("ssc");
    expect(ssc?.role).toBe("prd_mvp_target");
    expect(ssc?.deepSeedsPresent).toBe(true);

    const spine = buildImmuneCellSpineBundle();
    expect(
      spine.diseaseVerticals.find((d) => d.id === "ssc")?.deepSeedsPresent,
    ).toBe(true);

    const vision = buildSystemsVisionBundle();
    expect(vision.verticalStrategy).toBe("dual_track");
    expect(vision.activeScope).toBe("ra-tnf");
    expect(vision.prdMvpTarget).toBe("ssc-tfh-b-il21");
  });
});
