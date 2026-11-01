import { describe, expect, test } from "bun:test";
import {
  DISEASE_VERTICAL_STUBS,
  HSI_PROMOTED_ISI_RELATIONSHIPS,
  IMMUNE_CELL_SPINE_NODES,
  ISI_CONTROLLED_RELATIONSHIP_TYPES,
  ISI_RELATIONSHIP_TO_HSI_EDGE,
  buildImmuneCellSpineBundle,
  getDiseaseVertical,
  getPartnerLock,
  isHsiEdgeType,
  isIsiControlledRelationshipType,
  listImmuneCellLineages,
} from "../src/index";

describe("immune-cell spine stubs (PRD vocabulary)", () => {
  test("bundle schema and invariants", () => {
    const bundle = buildImmuneCellSpineBundle();
    expect(bundle.schemaVersion).toBe("hsi-immune-cell-spine-1");
    expect(bundle.cells.length).toBeGreaterThanOrEqual(15);
    expect(bundle.relationshipTypes).toEqual([
      ...ISI_CONTROLLED_RELATIONSHIP_TYPES,
    ]);
    expect(bundle.invariants.some((s) => s.includes("RA Stage 1"))).toBe(true);
  });

  test("major lineages include CD4 among many immune cells", () => {
    const lineages = listImmuneCellLineages().map((n) => n.label);
    for (const label of [
      "CD4 T cell",
      "CD8 T cell",
      "B cell",
      "NK cell",
      "Macrophage",
      "Neutrophil",
      "Mast cell",
      "Dendritic cell",
    ]) {
      expect(lineages).toContain(label);
    }
    expect(
      IMMUNE_CELL_SPINE_NODES.some(
        (n) => n.layer === "subset_state" && n.label === "Tfh",
      ),
    ).toBe(true);
  });

  test("PRD relationship types map to valid HSI edge types; P1.4 promoted identity-map", () => {
    for (const rel of ISI_CONTROLLED_RELATIONSHIP_TYPES) {
      expect(isIsiControlledRelationshipType(rel)).toBe(true);
      expect(isHsiEdgeType(ISI_RELATIONSHIP_TO_HSI_EDGE[rel])).toBe(true);
    }
    for (const rel of HSI_PROMOTED_ISI_RELATIONSHIPS) {
      expect(isHsiEdgeType(rel)).toBe(true);
      expect(ISI_RELATIONSHIP_TO_HSI_EDGE[rel]).toBe(rel);
    }
    // Still alias-only
    expect(ISI_RELATIONSHIP_TO_HSI_EDGE.presents_antigen_to).toBe(
      "associated_with",
    );
    expect(ISI_RELATIONSHIP_TO_HSI_EDGE.kills).toBe("drives");
  });

  test("dual-track verticals: RA locked; SSc PRD target with thin deep seeds", () => {
    const ra = getDiseaseVertical("ra");
    const ssc = getDiseaseVertical("ssc");
    expect(ra?.role).toBe("stage1_scope_locked");
    expect(ra?.deepSeedsPresent).toBe(true);
    expect(ssc?.role).toBe("prd_mvp_target");
    expect(ssc?.deepSeedsPresent).toBe(true);
    expect(ssc?.pathwayHint).toContain("Tfh");

    const lock = getPartnerLock();
    expect(lock.scopeLocked).toBe(true);
    expect(lock.disease?.id).toBe("ra");
    expect(lock.verticalStrategy).toBe("dual_track");
    expect(DISEASE_VERTICAL_STUBS.some((d) => d.id === "ssc")).toBe(true);
  });
});
