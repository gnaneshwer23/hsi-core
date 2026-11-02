import { describe, expect, test } from "bun:test";
import {
  HSI_EDGE_TYPES,
  HSI_GUT_SEED_EDGES,
  HSI_GUT_SEED_SYSTEMS_PREDICATES,
  HSI_NI_SEED_EDGES,
  HSI_PROMOTED_ISI_RELATIONSHIPS,
  HSI_PROMOTED_SYSTEMS_PREDICATES,
  HSI_T2D_IMMUNO_SEED_EDGES,
  ISI_RELATIONSHIP_TO_HSI_EDGE,
  SYSTEMS_PREDICATE_TO_HSI_EDGE,
  buildGutImmunePack,
  getPartnerLock,
  isHsiEdgeType,
} from "../src/index";

describe("P1.4 first-class systems/ISI predicates on HSI_EDGE_TYPES", () => {
  test("promoted predicates are on HSI_EDGE_TYPES; Phase 0 core retained", () => {
    for (const core of [
      "associated_with",
      "contributes_to",
      "inhibits",
      "upregulates",
      "bridges_domain",
    ] as const) {
      expect(HSI_EDGE_TYPES).toContain(core);
    }
    for (const p of HSI_PROMOTED_SYSTEMS_PREDICATES) {
      expect(HSI_EDGE_TYPES).toContain(p);
      expect(isHsiEdgeType(p)).toBe(true);
    }
    for (const p of HSI_PROMOTED_ISI_RELATIONSHIPS) {
      expect(HSI_EDGE_TYPES).toContain(p);
      expect(isHsiEdgeType(p)).toBe(true);
    }
    expect(HSI_EDGE_TYPES.length).toBe(20);
  });

  test("gut pack evidenceMap identity-maps promoted systems predicates", () => {
    const pack = buildGutImmunePack({
      generatedAt: "2026-11-01T18:30:00.000Z",
    });
    const gut003 = pack.evidenceMap.find((r) => r.edgeId === "HSI-E-GUT-003");
    expect(gut003?.predicate).toBe("produces_metabolite_sensed_by");
    expect(gut003?.systemsPredicate).toBe("produces_metabolite_sensed_by");
    expect(gut003?.systemsPredicateMapsToHsi).toBe(
      "produces_metabolite_sensed_by",
    );

    for (const ann of HSI_GUT_SEED_SYSTEMS_PREDICATES) {
      const edge = HSI_GUT_SEED_EDGES.find((e) => e.id === ann.edgeId);
      expect(edge).toBeTruthy();
      const mapped = SYSTEMS_PREDICATE_TO_HSI_EDGE[ann.systemsPredicate];
      if (
        (HSI_PROMOTED_SYSTEMS_PREDICATES as readonly string[]).includes(
          ann.systemsPredicate,
        )
      ) {
        expect(edge!.edgeType).toBe(ann.systemsPredicate);
        expect(mapped).toBe(ann.systemsPredicate);
      } else {
        // hypothesized_* keep Phase 0 directional edgeTypes
        expect(isHsiEdgeType(edge!.edgeType)).toBe(true);
        expect(mapped).not.toBe(ann.systemsPredicate);
      }
    }
  });

  test("SSc Tfh→IL-21 uses produces; RA Stage 1 edgeTypes untouched", () => {
    const ssc002 = HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.id === "HSI-E-SSC-002");
    expect(ssc002?.edgeType).toBe("produces");
    expect(ISI_RELATIONSHIP_TO_HSI_EDGE.produces).toBe("produces");

    const ra001 = HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.id === "HSI-E-RA-001");
    expect(ra001).toBeTruthy();
    expect(
      ["associated_with", "contributes_to", "drives", "inhibits", "upregulates", "downregulates", "biomarker_of", "risk_factor_for", "treats", "worsens", "bridges_domain"].includes(
        ra001!.edgeType,
      ),
    ).toBe(true);

    const lock = getPartnerLock();
    expect(lock.scopeLocked).toBe(true);
    expect(lock.disease?.id).toBe("ra");
    expect(lock.lockedPilot).toBe(false);

    expect(HSI_NI_SEED_EDGES.some((e) => e.id === "HSI-E-NI-001")).toBe(true);
  });
});
