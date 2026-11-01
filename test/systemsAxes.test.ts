import { describe, expect, test } from "bun:test";
import {
  FUTURE_TECH_ADAPTER_STUBS,
  GUT_MICROBIOME_ENTITY_STUBS,
  NEUROIMMUNE_ENTITY_STUBS,
  PATIENT_DATA_PLANE_RULES,
  SYSTEMS_CROSS_AXIS_PREDICATES,
  SYSTEMS_HYPOTHESIS_CAPABLE_PREDICATES,
  SYSTEMS_PREDICATE_TO_HSI_EDGE,
  SYSTEMS_VISION_SCHEMA,
  buildSystemsVisionBundle,
  getPartnerLock,
  isHsiEdgeType,
  isSystemsCrossAxisPredicate,
  listGutMicrobiomeEntitiesByClass,
  listNeuroimmuneEntitiesByType,
} from "../src/index";

describe("systems vision axes stubs", () => {
  test("bundle schema, domains, and invariants", () => {
    const bundle = buildSystemsVisionBundle({
      generatedAt: "2026-11-01T00:00:00.000Z",
    });
    expect(bundle.schemaVersion).toBe(SYSTEMS_VISION_SCHEMA);
    expect(bundle.notCds).toBe(true);
    expect(bundle.autoApproveIntoKg).toBe(false);
    expect(bundle.domains.length).toBe(6);
    expect(bundle.immuneCellSpine.cellCount).toBeGreaterThanOrEqual(15);
    expect(bundle.gutMicrobiome.entities.length).toBeGreaterThanOrEqual(4);
    expect(bundle.neuroimmune.entities.length).toBeGreaterThanOrEqual(5);
    expect(bundle.diseaseTissueBiomarker.entities.length).toBeGreaterThanOrEqual(
      4,
    );
    expect(bundle.invariants.some((s) => s.includes("RA Stage 1"))).toBe(true);
    expect(bundle.invariants.some((s) => s.includes("raw PHI"))).toBe(true);
    expect(bundle.stageGates.stage1).toContain("Research evidence");
    expect(bundle.stageGates.stage3).toContain("Patient");
  });

  test("gut and neuroimmune entity helpers", () => {
    expect(listGutMicrobiomeEntitiesByClass("metabolite").length).toBeGreaterThan(
      0,
    );
    expect(listNeuroimmuneEntitiesByType("neuroimmune_axis").length).toBeGreaterThan(
      0,
    );
    expect(
      GUT_MICROBIOME_ENTITY_STUBS.some((e) => e.id.includes("GALT")),
    ).toBe(false);
    expect(
      GUT_MICROBIOME_ENTITY_STUBS.some((e) => e.label.includes("GALT")),
    ).toBe(true);
    expect(
      NEUROIMMUNE_ENTITY_STUBS.some((e) => e.label === "Microglia"),
    ).toBe(true);
  });

  test("cross-axis predicates map to Phase 0 HSI edges; hypothesis set non-empty", () => {
    for (const p of SYSTEMS_CROSS_AXIS_PREDICATES) {
      expect(isSystemsCrossAxisPredicate(p)).toBe(true);
      expect(isHsiEdgeType(SYSTEMS_PREDICATE_TO_HSI_EDGE[p])).toBe(true);
    }
    expect(SYSTEMS_HYPOTHESIS_CAPABLE_PREDICATES.length).toBeGreaterThanOrEqual(4);
    expect(SYSTEMS_HYPOTHESIS_CAPABLE_PREDICATES).toContain(
      "hypothesized_gut_immune",
    );
    expect(SYSTEMS_HYPOTHESIS_CAPABLE_PREDICATES).toContain(
      "hypothesized_brain_immune",
    );
  });

  test("patient plane never-stores PHI; adapters never flip grades", () => {
    const neverPhi = PATIENT_DATA_PLANE_RULES.find(
      (r) => r.id === "hsi-never-raw-phi",
    );
    expect(neverPhi?.stores).toBe(false);
    expect(neverPhi?.stage).toBe("never");

    for (const a of FUTURE_TECH_ADAPTER_STUBS) {
      expect(a.mayFlipEvidenceGrade).toBe(false);
    }
    expect(
      FUTURE_TECH_ADAPTER_STUBS.some((a) => a.id === "adapter-af3"),
    ).toBe(true);
  });

  test("does not wipe RA lock or invent partnerSigned", () => {
    const lock = getPartnerLock();
    expect(lock.scopeLocked).toBe(true);
    expect(lock.disease?.id).toBe("ra");
    expect(lock.partnerSigned).toBe(false);

    const bundle = buildSystemsVisionBundle();
    const ra = bundle.immuneCellSpine.diseaseVerticals.find((d) => d.id === "ra");
    const ssc = bundle.immuneCellSpine.diseaseVerticals.find((d) => d.id === "ssc");
    expect(ra?.role).toBe("stage1_scope_locked");
    expect(ssc?.deepSeedsPresent).toBe(false);
  });
});
