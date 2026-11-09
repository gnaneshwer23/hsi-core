/**
 * HSI Phase 0 foundation — schema, grades, seed, safety criteria, LOINC links.
 * Run: bun test
 */
import {
  HSI_CURATION_REVIEWS,
  HSI_EXAMPLE_TRANSLATION_CARDS,
  HSI_GRADES,
  HSI_MARKERS,
  HSI_SAFETY_RELEASE_CRITERIA_V0,
  HSI_T2D_IMMUNO_SEED_EDGES,
  PROVISIONAL_AKSH_TO_DURABLE,
  assertHitlStubCdsClosed,
  buildAkshHitlCardViewModel,
  buildAkshHitlStubBundle,
  buildIsiExportBundle,
  buildSchemaGapReport,
  claimsWithAkshMappings,
  claimsWithIsiMappings,
  hsiEvidenceHandoff,
  hsiGradeFromCuration,
  isCdsSurfacable,
  isDurableAkshClinicId,
  linkClaimToMarker,
  listAkshHitlReadOnlyCards,
  listAkshNodeSuggestions,
  listBridgeCandidates,
  listIsiRelSuggestions,
  buildGateCChecklist,
  buildPilotAcceptancePack,
  buildPilotEvidencePack,
  buildPilotReviewRubric,
  buildR2ValidationBundle,
  buildTranslationHandoffPack,
  buildAkenoConsumerBundle,
  evaluateAkenoConsumerSafety,
  recordAkenoHitlReview,
  getPartnerLock,
  loadAkshHitlStubFromExport,
  migrateAkshNodeId,
  parseAkshNodeMapExport,
  publishOutputs,
  seedClaimLoincMap,
  suggestionForClaim,
  summarizeGradeCounts,
  summarizeIsiRelMappings,
  validateHsiEdge,
  validateTranslationCard,
} from "../src/index";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

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
        // Honest gaps: none (no ISI analogue) or marker_only (LOINC-linked, no REL yet).
        expect(["none", "marker_only"]).toContain(s.matchKind);
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
  it("builds card view-models from aksh map without opening CDS", () => {
    const stub = buildAkshHitlStubBundle();
    expect(stub.schemaVersion).toBe("hsi-aksh-hitl-stub-1");
    expect(stub.notCds).toBe(true);
    expect(stub.autoSurfaceCds).toBe(false);
    expect(stub.autoApplyToEhr).toBe(false);
    expect(stub.cards.length).toBeGreaterThanOrEqual(10);
    expect(stub.cdsSurfacableCount).toBe(0);
    expect(assertHitlStubCdsClosed(stub.cards)).toBe(true);

    const hba1c = buildAkshHitlCardViewModel("HSI-C-T2D-001");
    expect(hba1c).not.toBeNull();
    expect(hba1c!.akshNodeId).toBe("aksh:finding:hba1c");
    expect(hba1c!.hsiGrade).not.toBe("established");
    expect(hba1c!.cdsSurfacable).toBe(false);
    expect(hba1c!.displayMode).toBe("map_pointer_only");
    expect(hba1c!.loinc).toBe("4548-4");
    expect(hba1c!.clinicLabel).toBe("HbA1c");
    expect(hba1c!.requiredClinicianAction.requiresHitl).toBe(true);
    expect(hba1c!.requiredClinicianAction.autoApplyToEhr).toBe(false);
    expect(hba1c!.requiredClinicianAction.cdsEligibleHint).toBe(false);
    expect(hba1c!.autoApplyToEhr).toBe(false);

    const cards = listAkshHitlReadOnlyCards({ mappedOnly: true });
    expect(cards.every((c) => c.cdsSurfacable === false)).toBe(true);
    expect(cards.every((c) => c.akshNodeId?.startsWith("aksh:"))).toBe(true);
    expect(cards.every((c) => c.displayMode === "map_pointer_only")).toBe(true);
  });

  it("loads export:aksh-map and keeps cdsSurfacable false", () => {
    // Ensure legacy export exists on clean checkouts (gitignores exports/*.json).
    publishOutputs({ generatedAt: "2026-11-01T12:00:00.000Z" });
    const fromExport = loadAkshHitlStubFromExport("exports/hsi-aksh-node-map.json", {
      fallbackInMemory: false,
    });
    expect(fromExport.source).toBe("export");
    expect(fromExport.autoSurfaceCds).toBe(false);
    expect(fromExport.cdsSurfacableCount).toBe(0);
    expect(fromExport.cards.length).toBeGreaterThanOrEqual(10);
    expect(Object.keys(fromExport.claimToAkshNodeId).length).toBeGreaterThanOrEqual(10);

    const parsed = parseAkshNodeMapExport({
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
    expect(parsed.claimToAkshNodeId["HSI-C-T2D-001"]).toBe("aksh:finding:hba1c");
    expect(parsed.claimToAkshNodeId["HSI-C-T2D-005"]).toBe("aksh:medicine:metformin");
    expect(parsed.autoSurfaceCds).toBe(false);

    const edge = HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.claimId === "HSI-C-T2D-001")!;
    expect(isCdsSurfacable(edge)).toBe(false);
    expect(claimsWithAkshMappings().find((c) => c.id === "HSI-C-T2D-001")?.akshNodeId).toBe(
      "aksh:finding:hba1c",
    );
  });
});

describe("Gate C checklist + publish outputs", () => {
  it("lists curated REL rows as pending with PMID and S-P-O note", () => {
    const checklist = buildGateCChecklist({ generatedAt: "2026-11-01T12:00:00.000Z" });
    expect(checklist.schemaVersion).toBe("hsi-gate-c-checklist-1");
    expect(checklist.autoApproveIntoKg).toBe(false);
    expect(checklist.notCds).toBe(true);
    expect(checklist.summary.pendingGateC).toBeGreaterThanOrEqual(9);
    expect(checklist.summary.unmapped).toBeGreaterThanOrEqual(7);

    const pd1 = checklist.rows.find((r) => r.edgeId === "HSI-E-IO-001");
    expect(pd1?.isiRelationshipId).toBe("REL-R011-drives-P015");
    expect(pd1?.pmid).toBe("16382236");
    expect(pd1?.gateCStatus).toBe("pending");
    expect(pd1?.spoNote).toContain("—");
    expect(pd1?.autoApprove).toBe(false);

    expect(checklist.rows.every((r) => r.gateCStatus !== "pending" || Boolean(r.isiRelationshipId))).toBe(
      true,
    );
  });

  it("builds a scope-locked RA pilot evidence pack with fixture partnerSigned (not MoU)", () => {
    const pack = buildPilotEvidencePack({ generatedAt: "2026-11-01T13:00:00.000Z" });
    expect(pack.schemaVersion).toBe("hsi-pilot-evidence-pack-2");
    expect(pack.disease).toBe("Rheumatoid arthritis");
    expect(pack.researchQuestion.toLowerCase()).toContain("anti-tnf");
    expect(pack.scopeLocked).toBe(true);
    expect(pack.partnerSigned).toBe(true); // hypothetical fixture path-testing
    expect(pack.lockedPilot).toBe(false);
    expect(pack.provisionalLock).toBe(false);
    expect(pack.partnerLock.status).toBe("scope_locked");
    expect(pack.notCds).toBe(true);
    expect(pack.noPatientLevelActions).toBe(true);
    expect(pack.autoApproveIntoKg).toBe(false);
    expect(pack.questionProject.status).toBe("scope_locked");
    expect(pack.questionProject.scopeLocked).toBe(true);
    expect(pack.questionProject.partnerSigned).toBe(true);
    expect(pack.questionProject.lockedPilot).toBe(false);
    expect(pack.evidenceMap.length).toBe(HSI_T2D_IMMUNO_SEED_EDGES.length);
    expect(pack.summary.partnerScopedEvidenceRows).toBeGreaterThanOrEqual(12);
    expect(pack.summary.evidenceMapRows).toBe(pack.evidenceMap.length);
    expect(pack.expertShortlist.every((i) => i.autoApproved === false)).toBe(true);
    expect(pack.clinicalBoundary.some((b) => b.toLowerCase().includes("ehr"))).toBe(true);
    expect(pack.discoveryCentre.discoveryLoop.framing).toContain("ASK");
    expect(pack.discoveryCentre.illustrativeDiseaseContexts.every((d) => d.lockedPilot === false)).toBe(
      true,
    );
    expect(pack.summary.claimsWithLoinc).toBeGreaterThanOrEqual(6);
    expect(pack.entitySlice.typed.length).toBeGreaterThan(0);
    expect(pack.partnerScopedEntitySlice.diseases.some((d) => d.includes("Rheumatoid"))).toBe(true);
    expect(pack.evidenceMap.some((r) => r.claimId === "HSI-C-RA-001")).toBe(true);
    expect(pack.evidenceMap.some((r) => r.claimId === "HSI-C-RA-005")).toBe(true);
    expect(pack.evidenceMap.some((r) => r.claimId === "HSI-C-RA-007")).toBe(true);
    expect(pack.evidenceMap.some((r) => r.claimId === "HSI-C-RA-010")).toBe(true);
    expect(pack.evidenceMap.some((r) => r.marker.loinc === "53031-9")).toBe(true);
    expect(pack.evidenceMap.some((r) => r.marker.loinc === "11572-5")).toBe(true);
    expect(pack.competingExplanations.some((c) => c.id === "expl-ra-ada-immunogenicity")).toBe(true);
    expect(
      pack.competingExplanations.some((c) => c.id === "expl-ra-acpa-subgroup" && c.relatedClaimIds.includes("HSI-C-RA-010")),
    ).toBe(true);
    const antiCcp = HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.id === "HSI-E-RA-002");
    expect(antiCcp?.provenance.pmid).toBe("10662881");
    const ada = HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.id === "HSI-E-RA-007");
    expect(ada?.provenance.pmid).toBe("16508927");
  });

  it("ships a review rubric with fixture thresholds (real partner still TBD)", () => {
    const lock = getPartnerLock();
    expect(lock.scopeLocked).toBe(true);
    expect(lock.partnerSigned).toBe(true); // hypothetical fixture
    expect(lock.lockedPilot).toBe(false);
    expect(lock.legalBinding).toBe(false);
    expect(lock.isHypothetical).toBe(true);
    expect(lock.provisionalLock).toBe(false);
    expect(lock.status).toBe("scope_locked");
    expect(lock.disease?.id).toBe("ra");
    expect(lock.partner?.type).toBe("hypothetical_test_fixture");
    expect(lock.partner?.id).toBe("test:hypothetical-isi-pilot-partner");
    expect(lock.partner?.outreachStatus).toBe("test_fixture");
    expect(lock.flipRequirements.length).toBeGreaterThanOrEqual(5);

    const rubric = buildPilotReviewRubric({ generatedAt: "2026-11-01T13:00:00.000Z" });
    expect(rubric.schemaVersion).toBe("hsi-pilot-review-rubric-1");
    expect(rubric.partnerLock.scopeLocked).toBe(true);
    expect(rubric.partnerLock.partnerSigned).toBe(true);
    expect(rubric.partnerLock.lockedPilot).toBe(false);
    expect(rubric.partnerLock.provisionalLock).toBe(false);
    expect(rubric.partnerLock.status).toBe("scope_locked");
    expect(rubric.summary.readyForHuman).toBeGreaterThanOrEqual(6);
    // Fixture: licensing + real partner still block some items honestly
    expect(rubric.summary.blockedOnPartner).toBeGreaterThanOrEqual(1);
    expect(rubric.checklist.find((c) => c.id === "x-4")?.status).toBe(
      "blocked_on_partner",
    );
    expect(rubric.summary.thresholdStatus).toBe("set_for_test");
    expect(rubric.summary.thresholdSource).toBe("hypothetical_test_fixture");
    expect(rubric.summary.numericThresholdsMet).toBe(true);
    expect(rubric.stage1Thresholds.replaceWithPartnerAgreedThresholds).toBe(true);
    expect(rubric.stage1Thresholds.partnerId).toBe("test:hypothetical-isi-pilot-partner");
    expect(rubric.stage1Thresholds.numeric.minPartnerScopedEdges).toBe(12);
    expect(rubric.stage1Thresholds.numeric.minCompetingExplanations).toBe(4);
    expect(rubric.stage1Thresholds.numeric.minLoincLinkedClaims).toBe(6);
    expect(rubric.stage1Thresholds.numeric.gateCPendingAllowed).toBe(true);
    expect(rubric.stage1Thresholds.numeric.acceptanceOverallAllowed).toBe(
      "green_with_pending",
    );
    expect(rubric.checklist.find((c) => c.id === "x-3")?.status).toBe(
      "set_for_test",
    );
    expect(
      rubric.successMetrics.every((m) => m.thresholdStatus === "set_for_test"),
    ).toBe(true);
    expect(rubric.checklist.every((c) => c.status !== "ready_for_human" || c.criterion.length > 0)).toBe(
      true,
    );
    expect(rubric.notCds).toBe(true);
    expect(rubric.autoApproveIntoKg).toBe(false);
  });

  it("ships Phase 5 acceptance pack with honest pending for real partner (fixture signed)", () => {
    const acceptance = buildPilotAcceptancePack({ generatedAt: "2026-11-01T14:45:00.000Z" });
    expect(acceptance.schemaVersion).toBe("hsi-pilot-acceptance-1");
    expect(acceptance.phase).toBe("5");
    expect(acceptance.notCds).toBe(true);
    expect(acceptance.autoApproveIntoKg).toBe(false);
    expect(acceptance.scope.scopeLocked).toBe(true);
    expect(acceptance.scope.partnerSigned).toBe(true);
    expect(acceptance.scope.lockedPilot).toBe(false);
    expect(acceptance.scope.isHypothetical).toBe(true);
    expect(acceptance.scope.agreementKind).toBe("hypothetical_test_only");
    expect(acceptance.scope.testFixtureBanner).toContain("TEST FIXTURE");
    expect(acceptance.summary.fail).toBe(0);
    expect(acceptance.summary.stage1FourOutputsGreen).toBe(true);
    expect(acceptance.summary.partnerReadyWalkthrough).toBe(true);
    expect(acceptance.summary.overallStage1Acceptance).toBe("green_with_pending");
    expect(acceptance.criteria.find((c) => c.id === "ac-em")?.status).toBe("pass");
    expect(acceptance.criteria.find((c) => c.id === "ac-es")?.status).toBe("pass");
    expect(acceptance.criteria.find((c) => c.id === "ac-ce")?.status).toBe("pass");
    expect(acceptance.criteria.find((c) => c.id === "ac-ex")?.status).toBe("pass");
    expect(acceptance.criteria.find((c) => c.id === "ac-manifest")?.status).toBe("pass");
    expect(acceptance.criteria.find((c) => c.id === "ac-gap")?.status).toBe("pass");
    expect(acceptance.criteria.find((c) => c.id === "ac-gate-c")?.status).toBe("pass");
    expect(acceptance.criteria.find((c) => c.id === "ac-scope-lock")?.status).toBe("pass");
    expect(acceptance.criteria.find((c) => c.id === "ac-rubric")?.status).toBe("pass");
    expect(acceptance.criteria.find((c) => c.id === "ac-partner-signed")?.status).toBe("pending");
    expect(acceptance.criteria.find((c) => c.id === "ac-licensing")?.status).toBe("pending");
    expect(acceptance.criteria.find((c) => c.id === "ac-thresholds")?.status).toBe("set_for_test");
    expect(acceptance.walkthroughSteps.length).toBeGreaterThanOrEqual(5);
    expect(acceptance.criteria.find((c) => c.id === "ac-discovery-ui")?.status).toBe("pass");
    expect(
      acceptance.deferredExplicitAsk.some((d) => d.toLowerCase().includes("akeno clinical product")),
    ).toBe(true);
  });

  it("ships Phase 7 R2 validation with grounded hypothesis cards and ranked gaps", () => {
    const r2 = buildR2ValidationBundle({ generatedAt: "2026-11-01T15:00:00.000Z" });
    expect(r2.schemaVersion).toBe("hsi-r2-validation-1");
    expect(r2.phase).toBe("7");
    expect(r2.targetRelease).toBe("R2");
    expect(r2.notCds).toBe(true);
    expect(r2.autoApproveIntoKg).toBe(false);
    expect(r2.scopeLocked).toBe(true);
    expect(r2.partnerSigned).toBe(true); // fixture path-testing
    expect(r2.lockedPilot).toBe(false);
    expect(r2.hypothesisCards.length).toBeGreaterThanOrEqual(5);
    expect(r2.hypothesisCards.every((c) => c.autoApproved === false)).toBe(true);
    expect(r2.hypothesisCards.every((c) => c.literatureTests.every((t) => t.notClinicalProtocol))).toBe(
      true,
    );
    expect(r2.summary.byStatus.supported).toBeGreaterThanOrEqual(2);
    expect(r2.summary.byStatus.gap).toBeGreaterThanOrEqual(1);
    expect(r2.summary.byStatus.refuted).toBeGreaterThanOrEqual(1);
    expect(r2.rankedGaps.length).toBeGreaterThanOrEqual(3);
    expect(r2.rankedGaps[0]?.rank).toBe(1);
    expect(r2.hypothesisCards.some((c) => c.id === "hyp-card-serology-predictor" && c.validationStatus === "refuted")).toBe(
      true,
    );
    expect(r2.boundary.some((b) => b.toLowerCase().includes("phase 8"))).toBe(true);
    const allPmids = r2.hypothesisCards.flatMap((c) => c.groundingPmids);
    expect(allPmids).toContain("18625622");
    expect(allPmids).toContain("24586782");
  });

  it("ships Phase 8 translation handoff with HITL-only deferred candidates", () => {
    const xlat = buildTranslationHandoffPack({ generatedAt: "2026-11-01T16:00:00.000Z" });
    expect(xlat.schemaVersion).toBe("hsi-translation-handoff-1");
    expect(xlat.phase).toBe("8");
    expect(xlat.targetReleases).toEqual(["R3", "R4", "R5"]);
    expect(xlat.notCds).toBe(true);
    expect(xlat.clinicalActive).toBe(false);
    expect(xlat.clinicalUse).toBe("not_for_clinical_use");
    expect(xlat.autoApprove).toBe(false);
    expect(xlat.autoSurfaceCds).toBe(false);
    expect(xlat.akenoProductIntegration).toBe("in_repo_hitl_consumer");
    expect(xlat.akenoConsumerPath).toBe("/akeno");
    expect(xlat.candidates.length).toBeGreaterThanOrEqual(3);
    expect(xlat.candidates.every((c) => c.hitlRequired === true)).toBe(true);
    expect(xlat.candidates.every((c) => c.autoApprove === false)).toBe(true);
    expect(xlat.candidates.every((c) => c.cdsSurfacable === false)).toBe(true);
    expect(xlat.candidates.every((c) => c.status === "deferred_until_hitl")).toBe(true);
    expect(xlat.candidates.every((c) => c.clinicalUse === "not_for_clinical_use")).toBe(true);
    expect(xlat.candidates.every((c) => c.intendedConsumer === "akeno_hsi_core")).toBe(true);
    expect(xlat.summary.cdsSurfacableCount).toBe(0);
    expect(xlat.candidates.some((c) => Boolean(c.akshNodeId))).toBe(true);
    expect(xlat.candidates.some((c) => Boolean(c.loinc))).toBe(true);
    // Orthogonal axes present and distinct fields on each candidate.
    expect(
      xlat.candidates.every(
        (c) =>
          typeof c.teachingStatus === "string" &&
          typeof c.hsiGrade === "string" &&
          c.cdsSurfacable === false,
      ),
    ).toBe(true);
    expect(xlat.boundary.some((b) => b.toLowerCase().includes("/akeno"))).toBe(true);
    expect(
      xlat.whatRemainsOutsideHsiCore.some((w) => w.toLowerCase().includes("neon")),
    ).toBe(true);

    const checklist = buildGateCChecklist({ generatedAt: "2026-11-01T16:00:00.000Z" });
    expect(checklist.translationCandidates.length).toBeGreaterThanOrEqual(3);
    expect(checklist.translationCandidates.every((t) => t.autoApprove === false)).toBe(true);
    expect(checklist.translationCandidates.every((t) => t.hitlRequired === true)).toBe(true);
    expect(checklist.summary.translationCdsSurfacable).toBe(0);
    expect(checklist.instructions.some((i) => i.toLowerCase().includes("translation"))).toBe(true);
  });

  it("embeds Discovery Centre metadata pointing at the Phase 6 site surface", () => {
    const bundle = buildIsiExportBundle({ generatedAt: "2026-11-01T13:00:00.000Z" });
    expect(bundle.discoveryCentre.surfaceRole).toBe("site_product_surface");
    expect(bundle.discoveryCentre.notInteractiveUi).toBe(false);
    expect(bundle.discoveryCentre.productSurfacePath).toBe("/discovery");
    expect(bundle.discoveryCentre.notLockedPilotIndications).toBe(true);
    expect(bundle.discoveryCentre.partnerLock.disease).toBe("Rheumatoid arthritis");
    expect(bundle.discoveryCentre.partnerLock.scopeLocked).toBe(true);
    expect(bundle.discoveryCentre.partnerLock.partnerSigned).toBe(true);
    expect(bundle.discoveryCentre.partnerLock.lockedPilot).toBe(false);
    expect(bundle.discoveryCentre.partnerLock.isHypothetical).toBe(true);
    expect(bundle.discoveryCentre.partnerLock.provisionalLock).toBe(false);
    expect(bundle.discoveryCentre.partnerLock.status).toBe("scope_locked");
    expect(bundle.discoveryCentre.discoveryLoop.steps.map((s) => s.id)).toEqual([
      "ask",
      "map",
      "review",
      "test",
      "learn",
    ]);
    expect(bundle.edges.some((e) => e.id === "HSI-E-SLE-001")).toBe(true);
    expect(bundle.edges.some((e) => e.id === "HSI-E-RA-003")).toBe(true);
    expect(bundle.claimLoincLinks.some((l) => l.loinc === "42254-3")).toBe(true);
  });

  it("writes versioned dist/outputs bundle with required artifacts", () => {
    const result = publishOutputs({ generatedAt: "2026-11-01T12:00:00.000Z" });
    expect(result.bundleId).toContain("hsi-core-0.1.0-");
    expect(result.files).toContain("hsi-isi-export.json");
    expect(result.files).toContain("hsi-isi-rel-map.json");
    expect(result.files).toContain("hsi-aksh-node-map.json");
    expect(result.files).toContain("hsi-aksh-hitl-cards.json");
    expect(result.files).toContain("hsi-gap-report.json");
    expect(result.files).toContain("hsi-gap-report.md");
    expect(result.files).toContain("gate-c-checklist.json");
    expect(result.files).toContain("gate-c-checklist.md");
    expect(result.files).toContain("hsi-curator-ux.json");
    expect(result.files).toContain("hsi-curator-ux.md");
    expect(result.discoverySynced.some((p) => p.includes("hsi-curator-ux.json"))).toBe(
      true,
    );
    expect(result.files).toContain("hsi-pilot-evidence-pack.json");
    expect(result.files).toContain("hsi-pilot-evidence-pack.md");
    expect(result.files).toContain("hsi-pilot-review-rubric.json");
    expect(result.files).toContain("hsi-pilot-review-rubric.md");
    expect(result.files).toContain("hsi-pilot-acceptance.json");
    expect(result.files).toContain("hsi-pilot-acceptance.md");
    expect(result.files).toContain("hsi-pilot-walkthrough.md");
    expect(result.files).toContain("hsi-partner-lock.json");
    expect(result.files).toContain("hsi-ssc-pathway-pack.json");
    expect(result.files).toContain("hsi-gut-immune-pack.json");
    expect(result.files).toContain("hsi-gut-immune-pack.md");
    expect(result.files).toContain("hsi-r2-validation.json");
    expect(result.files).toContain("hsi-r2-validation.md");
    expect(result.files).toContain("hsi-translation-handoff.json");
    expect(result.files).toContain("hsi-translation-handoff.md");
    expect(result.files).toContain("MANIFEST.json");
    expect(result.discoverySynced).toContain("site/public/discovery/hsi-r2-validation.json");
    expect(result.discoverySynced).toContain("site/public/discovery/hsi-gut-immune-pack.json");
    expect(result.discoverySynced).toContain("site/public/discovery/hsi-translation-handoff.json");
    expect(existsSync(join(process.cwd(), "site/public/discovery/hsi-r2-validation.json"))).toBe(
      true,
    );
    expect(
      existsSync(join(process.cwd(), "site/public/discovery/hsi-translation-handoff.json")),
    ).toBe(true);

    for (const name of result.files) {
      expect(existsSync(join(result.outDir, name)), name).toBe(true);
    }
    expect(existsSync(join(process.cwd(), "dist/outputs/latest/MANIFEST.json"))).toBe(true);
    expect(existsSync(join(process.cwd(), "dist/outputs/LATEST.json"))).toBe(true);
    expect(existsSync(join(process.cwd(), "exports/hsi-isi-export.json"))).toBe(true);

    const manifest = JSON.parse(readFileSync(join(result.outDir, "MANIFEST.json"), "utf8")) as {
      notCds: boolean;
      autoApproveIntoKg: boolean;
      autoSurfaceCds: boolean;
      partnerLock: {
        scopeLocked: boolean;
        partnerSigned: boolean;
        lockedPilot: boolean;
        provisionalLock: boolean;
        status: string;
      };
      acceptance: {
        overallStage1Acceptance: string;
        stage1FourOutputsGreen: boolean;
        partnerReadyWalkthrough: boolean;
        partnerSigned: boolean;
      };
      counts: {
        gateCPending: number;
        partnerScopedEvidenceRows: number;
        acceptancePass: number;
        acceptancePending: number;
        acceptanceSetForTest: number;
        reviewRubricSetForTest: number;
        reviewRubricThresholdStatus: string;
        stage1FourOutputsGreen: boolean;
        r2HypothesisCards: number;
        r2RankedGaps: number;
        translationCandidates: number;
        translationCdsSurfacable: number;
        gateCTranslationCandidates: number;
        gateCModelProposals: number;
        gateCModelProposalsPending: number;
        sscCellCards: number;
        sscPathwayEdges: number;
      };
      r2Validation: {
        phase: string;
        targetRelease: string;
        hypothesisCards: number;
      };
      translationHandoff: {
        phase: string;
        clinicalActive: boolean;
        clinicalUse: string;
        akenoProductIntegration: string;
        candidates: number;
        cdsSurfacableCount: number;
      };
    };
    expect(manifest.notCds).toBe(true);
    expect(manifest.autoApproveIntoKg).toBe(false);
    expect(manifest.autoSurfaceCds).toBe(false);
    expect(manifest.partnerLock.scopeLocked).toBe(true);
    expect(manifest.partnerLock.partnerSigned).toBe(true);
    expect(manifest.partnerLock.lockedPilot).toBe(false);
    expect(manifest.partnerLock.provisionalLock).toBe(false);
    expect(manifest.partnerLock.status).toBe("scope_locked");
    expect(manifest.counts.gateCPending).toBeGreaterThanOrEqual(9);
    expect(manifest.counts.partnerScopedEvidenceRows).toBeGreaterThanOrEqual(12);
    expect(manifest.acceptance.overallStage1Acceptance).toBe("green_with_pending");
    expect(manifest.acceptance.stage1FourOutputsGreen).toBe(true);
    expect(manifest.acceptance.partnerReadyWalkthrough).toBe(true);
    expect(manifest.acceptance.partnerSigned).toBe(true);
    expect(manifest.counts.stage1FourOutputsGreen).toBe(true);
    expect(manifest.counts.acceptancePass).toBeGreaterThanOrEqual(9);
    expect(manifest.counts.acceptancePending).toBeGreaterThanOrEqual(2);
    expect(manifest.counts.reviewRubricThresholdStatus).toBe("set_for_test");
    expect(manifest.counts.r2HypothesisCards).toBeGreaterThanOrEqual(5);
    expect(manifest.counts.r2RankedGaps).toBeGreaterThanOrEqual(3);
    expect(manifest.r2Validation.phase).toBe("7");
    expect(manifest.r2Validation.targetRelease).toBe("R2");
    expect(manifest.counts.translationCandidates).toBeGreaterThanOrEqual(3);
    expect(manifest.counts.translationCdsSurfacable).toBe(0);
    expect(manifest.counts.gateCTranslationCandidates).toBeGreaterThanOrEqual(3);
    expect(manifest.counts.gateCModelProposals).toBeGreaterThanOrEqual(2);
    expect(manifest.counts.gateCModelProposalsPending).toBe(
      manifest.counts.gateCModelProposals,
    );
    expect(manifest.counts.sscCellCards).toBeGreaterThanOrEqual(7);
    expect(manifest.counts.sscPathwayEdges).toBeGreaterThanOrEqual(8);
    expect(manifest.translationHandoff.phase).toBe("8");
    expect(manifest.translationHandoff.clinicalActive).toBe(false);
    expect(manifest.translationHandoff.clinicalUse).toBe("not_for_clinical_use");
    expect(manifest.translationHandoff.akenoProductIntegration).toBe("in_repo_hitl_consumer");
    expect(manifest.translationHandoff.cdsSurfacableCount).toBe(0);

    const hitl = JSON.parse(
      readFileSync(join(result.outDir, "hsi-aksh-hitl-cards.json"), "utf8"),
    ) as { cdsSurfacableCount: number; autoApplyToEhr: boolean };
    expect(hitl.cdsSurfacableCount).toBe(0);
    expect(hitl.autoApplyToEhr).toBe(false);

    const xlat = JSON.parse(
      readFileSync(join(result.outDir, "hsi-translation-handoff.json"), "utf8"),
    ) as {
      clinicalActive: boolean;
      summary: { cdsSurfacableCount: number };
      candidates: { cdsSurfacable: boolean; status: string }[];
    };
    expect(xlat.clinicalActive).toBe(false);
    expect(xlat.summary.cdsSurfacableCount).toBe(0);
    expect(xlat.candidates.every((c) => c.cdsSurfacable === false)).toBe(true);
    expect(xlat.candidates.every((c) => c.status === "deferred_until_hitl")).toBe(true);

    const discoveryIndex = JSON.parse(
      readFileSync(join(process.cwd(), "site/public/discovery/catalogue.json"), "utf8"),
    ) as { phase: string; clinicalActive: boolean; framing: string; notes: string[] };
    expect(discoveryIndex.phase).toBe("8");
    expect(discoveryIndex.clinicalActive).toBe(false);
    expect(discoveryIndex.framing).toContain("TRANSLATE");
    expect(discoveryIndex.notes.some((n) => n.includes("/akeno"))).toBe(true);
  });

  it("ships in-repo Akeno HITL consumer over translation handoff (not CDS, no Neon)", () => {
    const pack = buildTranslationHandoffPack({ generatedAt: "2026-11-01T17:00:00.000Z" });
    const consumer = buildAkenoConsumerBundle({
      generatedAt: "2026-11-01T17:00:00.000Z",
      pack,
    });
    expect(consumer.schemaVersion).toBe("hsi-akeno-consumer-1");
    expect(consumer.akenoProductIntegration).toBe("in_repo_hitl_consumer");
    expect(consumer.consumerPath).toBe("/akeno");
    expect(consumer.clinicalActive).toBe(false);
    expect(consumer.notCds).toBe(true);
    expect(consumer.autoSurfaceCds).toBe(false);
    expect(consumer.candidates.length).toBe(pack.candidates.length);
    expect(consumer.neonIsolation.hsiSubstrateOnly).toBe("hsi-neon-project");
    expect(consumer.neonIsolation.akenoDbEnvPrefix).toBe("AKENO_");
    expect(consumer.provenance.akenohealth.commit.length).toBe(40);
    expect(consumer.provenance.akenoHealthAi.lovableUrl).toContain("lovable.dev");

    const safety = evaluateAkenoConsumerSafety();
    expect(safety.blocked).toBe(true);
    expect(safety.nextAction).toBe("route_to_clinician_hitl");
    expect(safety.autoSurfaceCds).toBe(false);

    const first = pack.candidates[0];
    expect(first).toBeDefined();
    const decision = recordAkenoHitlReview({
      candidate: first!,
      action: "acknowledge",
      reason: "Map pointer reviewed — not clinical use",
      reviewedAt: "2026-11-01T17:01:00.000Z",
    });
    expect(decision.cdsSurfacable).toBe(false);
    expect(decision.autoApplyToEhr).toBe(false);
    expect(decision.auditEventType).toBe("AKENO_HITL_REVIEW_DECISION");
    expect(() =>
      recordAkenoHitlReview({ candidate: first!, action: "defer", reason: "   " }),
    ).toThrow();
  });
});
