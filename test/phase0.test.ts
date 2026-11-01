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
  buildSchemaGapReport,
  PROVISIONAL_AKSH_TO_DURABLE,
  buildAkshHitlCard,
  claimsWithAkshMappings,
  claimsWithIsiMappings,
  hsiEvidenceHandoff,
  hsiGradeFromCuration,
  isCdsSurfacable,
  isDurableAkshClinicId,
  linkClaimToMarker,
  listAkshHitlCards,
  listAkshNodeSuggestions,
  listBridgeCandidates,
  listCdsEligibleAkshHitlCards,
  listIsiRelSuggestions,
  loadAkshHitlMapFromExport,
  loadAkshHitlMapFromObject,
  loadAkshHitlMapInMemory,
  migrateAkshNodeId,
  seedClaimLoincMap,
  suggestionForClaim,
  summarizeAkshHitlCards,
  summarizeGradeCounts,
  summarizeIsiRelMappings,
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

describe("schema gap report (backlog b2)", () => {
  it("flags remaining gaps and lists bridge shortlist with REL suggestions", () => {
    const report = buildSchemaGapReport({ generatedAt: "2026-10-31T00:00:00.000Z" });
    expect(report.schemaVersion).toBe("hsi-gap-report-1");
    expect(report.summary.seedEdges).toBe(HSI_T2D_IMMUNO_SEED_EDGES.length);
    expect(report.summary.claimsMappedToIsi).toBeGreaterThanOrEqual(8);
    expect(report.summary.claimsMappedToAksh).toBeGreaterThanOrEqual(10);
    expect(report.akshNodeMapping.autoApplyToEhr).toBe(false);
    expect(report.akshNodeMapping.anyCdsSurfacableOnSeedEdges).toBe(false);
    expect(report.akshNodeMapping.t2dSeedsMapped).toBe(report.akshNodeMapping.t2dSeedsTotal);
    expect(report.summary.bridgeCandidates).toBeGreaterThanOrEqual(8);
    expect(report.isiRelMapping.autoApproveIntoKg).toBe(false);
    expect(report.isiRelMapping.withRelId).toBeGreaterThanOrEqual(8);
    expect(report.bridgeShortlist.some((b) => b.suggestedIsiRelationshipId?.startsWith("REL-"))).toBe(
      true,
    );
    expect(report.bridgeShortlist.some((b) => b.matchKind === "none")).toBe(true);
    expect(report.gaps.every((g) => g.missing.includes("gate_c_approved"))).toBe(true);
    expect(report.nextActions.length).toBeGreaterThanOrEqual(3);
  });
});

describe("ISI REL-* suggestion map", () => {
  it("points at real REL-* ids without auto-approve or grade collapse", () => {
    const suggestions = listIsiRelSuggestions();
    expect(suggestions.length).toBeGreaterThanOrEqual(12);
    expect(suggestions.every((s) => s.autoApprove === false)).toBe(true);
    for (const s of suggestions) {
      if (s.suggestedIsiRelationshipId) {
        expect(s.suggestedIsiRelationshipId.startsWith("REL-")).toBe(true);
        expect(s.matchKind).not.toBe("none");
      } else {
        expect(s.matchKind).toBe("none");
        expect(s.status).toBe("unmapped");
      }
    }
    const mapped = claimsWithIsiMappings();
    expect(mapped.filter((c) => c.isiRelationshipId).length).toBeGreaterThanOrEqual(8);
    // Axes stay separate: mapping does not approve or establish.
    for (const edge of HSI_T2D_IMMUNO_SEED_EDGES) {
      expect(edge.curationReview).not.toBe("approved");
      expect(edge.hsiGrade).not.toBe("established");
      expect(isCdsSurfacable(edge)).toBe(false);
    }
    const pd1 = suggestionForClaim("HSI-C-IO-001");
    expect(pd1?.suggestedIsiRelationshipId).toBe("REL-R011-drives-P015");
    expect(pd1?.matchKind).toBe("exact_concept_pair");
    expect(pd1?.status).toBe("curated");
    expect(pd1?.autoApprove).toBe(false);

    const ioEdge = HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.id === "HSI-E-IO-001");
    expect(ioEdge?.provenance.pmid).toBe("16382236");
    expect(ioEdge?.curationReview).toBe("source-verified");
    expect(ioEdge?.hsiGrade).toBe("uncertain");
    expect(ioEdge?.teachingStatus).toBe("associative");
    // Axes stay separate — source-verified ≠ approved ≠ CDS.
    expect(ioEdge?.curationReview).not.toBe("approved");
    expect(isCdsSurfacable(ioEdge!)).toBe(false);

    const handoff = hsiEvidenceHandoff(ioEdge!);
    expect(handoff.evidenceLink).toBe("evidence_linked");
    expect(handoff.gateC).toBe("pending");
    expect(handoff.label).toContain("Gate C pending");
    expect(handoff.pmid).toBe("16382236");

    // Evidence sprint: related-axis maps with real PMIDs → curated (HSI-side), Gate C still pending.
    const evidenceSprint: Array<{ claimId: string; edgeId: string; rel: string; pmid: string }> = [
      { claimId: "HSI-C-IM-010", edgeId: "HSI-E-IM-010", rel: "REL-I023-targets-M002", pmid: "28845751" },
      { claimId: "HSI-C-IM-006", edgeId: "HSI-E-IM-006", rel: "REL-R004-activates-P003", pmid: "15030775" },
      { claimId: "HSI-C-IM-004", edgeId: "HSI-E-IM-004", rel: "REL-P021-produces-B001", pmid: "12813013" },
      { claimId: "HSI-C-IM-002", edgeId: "HSI-E-IM-002", rel: "REL-M001-contributes_to-D001", pmid: "11244034" },
      { claimId: "HSI-C-IM-003", edgeId: "HSI-E-IM-003", rel: "REL-M003-contributes_to-D001", pmid: "18625622" },
      { claimId: "HSI-C-IM-005", edgeId: "HSI-E-IM-005", rel: "REL-C003-produces-M001", pmid: "2993897" },
      { claimId: "HSI-C-T2D-010", edgeId: "HSI-E-T2D-010", rel: "REL-I010-suppresses-P001", pmid: "7569976" },
      { claimId: "HSI-C-AU-001", edgeId: "HSI-E-AU-001", rel: "REL-B015-predicts_eligibility_for-I013", pmid: "31180194" },
    ];
    expect(suggestions.filter((s) => s.status === "curated").length).toBeGreaterThanOrEqual(9);
    for (const row of evidenceSprint) {
      const sug = suggestionForClaim(row.claimId);
      expect(sug?.suggestedIsiRelationshipId).toBe(row.rel);
      expect(sug?.matchKind).toBe("related_axis");
      expect(sug?.status).toBe("curated");
      expect(sug?.autoApprove).toBe(false);
      const edge = HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.id === row.edgeId)!;
      expect(edge.provenance.pmid).toBe(row.pmid);
      expect(edge.curationReview).toBe("source-verified");
      expect(edge.hsiGrade).toBe("uncertain");
      expect(edge.curationReview).not.toBe("approved");
      expect(isCdsSurfacable(edge)).toBe(false);
      const h = hsiEvidenceHandoff(edge);
      expect(h.evidenceLink).toBe("evidence_linked");
      expect(h.gateC).toBe("pending");
      expect(h.pmid).toBe(row.pmid);
    }
    // Honest unmapped gaps remain (no invented RELs).
    expect(suggestions.filter((s) => s.status === "unmapped" && !s.suggestedIsiRelationshipId).length).toBeGreaterThanOrEqual(7);
  });
});

describe("Aksh node-id map (P1 HITL)", () => {
  it("maps T2D seeds to durable aksh: ids without opening CDS", () => {
    const suggestions = listAkshNodeSuggestions();
    expect(suggestions.length).toBeGreaterThanOrEqual(20);
    expect(suggestions.every((s) => s.autoApplyToEhr === false)).toBe(true);
    expect(suggestions.every((s) => s.cdsSurfacableHint === false)).toBe(true);

    const mapped = claimsWithAkshMappings();
    const withAksh = mapped.filter((c) => c.akshNodeId);
    expect(withAksh.length).toBeGreaterThanOrEqual(10);
    expect(withAksh.every((c) => c.akshNodeId!.startsWith("aksh:"))).toBe(true);
    expect(withAksh.every((c) => !c.akshNodeId!.startsWith("AKSH-"))).toBe(true);

    const hba1c = mapped.find((c) => c.id === "HSI-C-T2D-001");
    expect(hba1c?.akshNodeId).toBe("aksh:finding:hba1c");

    // Mapping never promotes CDS: seeds stay closed.
    for (const edge of HSI_T2D_IMMUNO_SEED_EDGES) {
      expect(isCdsSurfacable(edge)).toBe(false);
      expect(edge.curationReview).not.toBe("approved");
      expect(edge.hsiGrade).not.toBe("established");
    }

    const bundle = buildIsiExportBundle({ generatedAt: "2026-11-01T00:00:00.000Z" });
    expect(bundle.akshNodeMapping.t2dSeedsMapped).toBe(bundle.akshNodeMapping.t2dSeedsTotal);
    expect(bundle.akshNodeMapping.autoApplyToEhr).toBe(false);
    expect(bundle.akshNodeMapping.anyCdsSurfacableOnSeedEdges).toBe(false);
    expect(bundle.akshNodeMapping.provisionalAkshIdsRemaining).toBe(0);
    expect(bundle.akshNodeMapping.durableAkshIds).toBeGreaterThanOrEqual(20);
    expect(bundle.notCds).toBe(true);

    expect(migrateAkshNodeId("AKSH-N-hba1c")).toBe("aksh:finding:hba1c");
    expect(migrateAkshNodeId("aksh:medicine:metformin")).toBe("aksh:medicine:metformin");
    expect(isDurableAkshClinicId("aksh:finding:hba1c")).toBe(true);
    expect(Object.keys(PROVISIONAL_AKSH_TO_DURABLE).length).toBe(22);

    const isiMap = summarizeIsiRelMappings();
    expect(isiMap.curated).toBeGreaterThanOrEqual(9);
    expect(isiMap.autoApproveIntoKg).toBe(false);
  });
});

describe("Aksh HITL read-only stub (P1)", () => {
  it("loads export:aksh-map and projects cards without opening CDS", () => {
    const map = loadAkshHitlMapFromExport("exports/hsi-aksh-node-map.json");
    expect(map.schemaVersion).toBe("hsi-aksh-node-map-2");
    expect(map.autoSurfaceCds).toBe(false);
    expect(map.notCds).toBe(true);
    expect(Object.keys(map.claimToAkshNodeId).length).toBeGreaterThanOrEqual(20);

    const cards = listAkshHitlCards({ map, mappedOnly: true });
    expect(cards.length).toBeGreaterThanOrEqual(20);
    expect(cards.every((c) => c.akshNodeId?.startsWith("aksh:"))).toBe(true);
    expect(cards.every((c) => c.cdsSurfacable === false)).toBe(true);
    expect(cards.every((c) => c.autoApplyToEhr === false)).toBe(true);
    expect(cards.every((c) => c.displayMode === "map_pointer_readonly")).toBe(true);
    expect(cards.every((c) => c.requiredClinicianAction.requiresHitl === true)).toBe(true);

    const hba1c = buildAkshHitlCard("HSI-C-T2D-001", { map });
    expect(hba1c?.akshNodeId).toBe("aksh:finding:hba1c");
    expect(hba1c?.loinc).toBe("4548-4");
    expect(hba1c?.clinicLabel).toBe("HbA1c");
    expect(hba1c?.hsiGrade).not.toBe("established");
    expect(hba1c?.cdsSurfacable).toBe(false);
    expect(hba1c?.requiredClinicianAction.label.length).toBeGreaterThan(0);

    const summary = summarizeAkshHitlCards(cards);
    expect(summary.cdsSurfacableCount).toBe(0);
    expect(summary.autoApplyToEhr).toBe(false);
    expect(summary.withLoinc).toBeGreaterThanOrEqual(3);

    expect(listCdsEligibleAkshHitlCards({ map })).toEqual([]);
    expect(loadAkshHitlMapInMemory().source).toBe("in_memory");
  });

  it("never marks cdsSurfacable from akshNodeId alone", () => {
    const edge = HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.claimId === "HSI-C-T2D-001")!;
    expect(claimsWithAkshMappings().find((c) => c.id === "HSI-C-T2D-001")?.akshNodeId).toBe(
      "aksh:finding:hba1c",
    );
    expect(isCdsSurfacable(edge)).toBe(false);
    const card = buildAkshHitlCard("HSI-C-T2D-001");
    expect(card?.cdsSurfacable).toBe(false);
    expect(card?.displayMode).toBe("map_pointer_readonly");
  });

  it("migrates provisional ids when loading export objects", () => {
    const map = loadAkshHitlMapFromObject({
      schemaVersion: "hsi-aksh-node-map-2",
      idNamespace: "aksh:",
      notCds: true,
      autoSurfaceCds: false,
      cdsRequiresApprovedEstablished: true,
      claimToAkshNodeId: {
        "HSI-C-T2D-001": "AKSH-N-hba1c",
        "HSI-C-T2D-005": "aksh:medicine:metformin",
      },
    });
    expect(map.claimToAkshNodeId["HSI-C-T2D-001"]).toBe("aksh:finding:hba1c");
    expect(map.claimToAkshNodeId["HSI-C-T2D-005"]).toBe("aksh:medicine:metformin");
    expect(map.autoSurfaceCds).toBe(false);
    const card = buildAkshHitlCard("HSI-C-T2D-001", { map });
    expect(card?.cdsSurfacable).toBe(false);
    expect(card?.akshNodeId).toBe("aksh:finding:hba1c");
  });
});
