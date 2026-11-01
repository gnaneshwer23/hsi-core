import { describe, expect, test } from "bun:test";
import {
  HSI_SSC_SEED_EDGES,
  HSI_T2D_IMMUNO_SEED_EDGES,
  MODEL_PROPOSAL_ARTIFACT_SCHEMA,
  SSC_NEIGHBOURHOOD_CARDS,
  assertSafeModelProposal,
  buildExampleModelProposals,
  buildGateCChecklist,
  buildGateCModelProposalRows,
  buildImmuneCellSpineBundle,
  buildSscPathwayPack,
  getPartnerLock,
  sscCellCardByNodeId,
  toGateCModelProposalRow,
} from "../src/index";

describe("P1.1 SSc deepen — cell cards + CL·MONDO hints + PMIDs", () => {
  test("neighbourhood cards carry CL/MONDO hint_only binds for core entities", () => {
    expect(SSC_NEIGHBOURHOOD_CARDS.length).toBeGreaterThanOrEqual(7);

    const tfh = sscCellCardByNodeId("HSI-N-tfh");
    expect(tfh?.ontologyHints.some((h) => h.id === "CL:0002038")).toBe(true);
    expect(tfh?.ontologyHints.every((h) => h.bindStatus === "hint_only")).toBe(true);

    const b = sscCellCardByNodeId("HSI-N-b-cell");
    expect(b?.ontologyHints.some((h) => h.id === "CL:0000236")).toBe(true);

    const pb = sscCellCardByNodeId("HSI-N-plasmablast");
    expect(pb?.ontologyHints.some((h) => h.id === "CL:0000980")).toBe(true);

    const ssc = sscCellCardByNodeId("HSI-N-ssc");
    expect(ssc?.ontologyHints.some((h) => h.id === "MONDO:0005100")).toBe(true);

    const pack = buildSscPathwayPack({ generatedAt: "2026-11-01T18:00:00.000Z" });
    expect(pack.cellCards.length).toBe(SSC_NEIGHBOURHOOD_CARDS.length);
    expect(pack.cellCardSchema).toBe("hsi-ssc-cell-card-1");
  });

  test("spine Tfh / B / plasmablast carry CL hints", () => {
    const spine = buildImmuneCellSpineBundle();
    expect(spine.cells.find((c) => c.id === "HSI-IC-sub-tfh")?.cellOntologyId).toBe(
      "CL:0002038",
    );
    expect(spine.cells.find((c) => c.id === "HSI-IC-lin-b")?.cellOntologyId).toBe(
      "CL:0000236",
    );
    expect(
      spine.cells.find((c) => c.id === "HSI-IC-sub-plasmablast")?.cellOntologyId,
    ).toBe("CL:0000980");
  });

  test("additional verified PMIDs land; EBV stays hypothesized; RA untouched", () => {
    expect(HSI_SSC_SEED_EDGES.some((e) => e.id === "HSI-E-SSC-008")).toBe(true);
    expect(HSI_SSC_SEED_EDGES.some((e) => e.id === "HSI-E-SSC-009")).toBe(true);

    const fibrosisComment = HSI_SSC_SEED_EDGES.find((e) => e.id === "HSI-E-SSC-008");
    expect(fibrosisComment?.provenance?.pmid).toBe("29626172");

    const il21Joint = HSI_SSC_SEED_EDGES.find((e) => e.id === "HSI-E-SSC-009");
    expect(il21Joint?.provenance?.pmid).toBe("37763102");
    expect(il21Joint?.teachingStatus).toBe("hypothesized");

    const ebv = HSI_SSC_SEED_EDGES.find((e) => e.id === "HSI-E-SSC-007");
    expect(ebv?.teachingStatus).toBe("hypothesized");

    expect(HSI_T2D_IMMUNO_SEED_EDGES.some((e) => e.id === "HSI-E-RA-001")).toBe(true);
    const lock = getPartnerLock();
    expect(lock.disease?.id).toBe("ra");
    expect(lock.partnerSigned).toBe(false);
    expect(lock.scopeLocked).toBe(true);
  });
});

describe("P1.5 model-proposal → Gate C pending", () => {
  test("schema is wired and forbids grade / autoApprove fields", () => {
    expect(MODEL_PROPOSAL_ARTIFACT_SCHEMA.status).toBe("wired_to_gate_c_pending");
    expect(MODEL_PROPOSAL_ARTIFACT_SCHEMA.autoApproveIntoKg).toBe(false);
    expect(MODEL_PROPOSAL_ARTIFACT_SCHEMA.mayFlipEvidenceGrade).toBe(false);
    expect(MODEL_PROPOSAL_ARTIFACT_SCHEMA.forbiddenFields).toContain("hsiGrade");
    expect(MODEL_PROPOSAL_ARTIFACT_SCHEMA.gateCChecklistField).toBe("modelProposals");
  });

  test("safe proposals become pending Gate C rows with autoApprove=false", () => {
    const rows = buildGateCModelProposalRows({
      createdAt: "2026-11-01T18:00:00.000Z",
    });
    expect(rows.length).toBeGreaterThanOrEqual(2);
    for (const row of rows) {
      expect(row.gateCStatus).toBe("pending");
      expect(row.autoApprove).toBe(false);
      expect(row.autoApproveIntoKg).toBe(false);
      expect(row.mayFlipEvidenceGrade).toBe(false);
      expect(row.isGradedKgEdge).toBe(false);
      expect("hsiGrade" in row).toBe(false);
      expect("curationReview" in row).toBe(false);
    }

    const checklist = buildGateCChecklist({
      generatedAt: "2026-11-01T18:00:00.000Z",
    });
    // Example stubs + P3.0 RDKit spike proposals both land on Gate C as pending.
    expect(checklist.summary.modelProposals).toBeGreaterThanOrEqual(rows.length);
    expect(checklist.summary.modelProposalsPending).toBe(
      checklist.summary.modelProposals,
    );
    expect(checklist.summary.modelProposalsAutoApprove).toBe(0);
    expect(checklist.modelProposals.every((p) => p.autoApprove === false)).toBe(true);
    expect(checklist.autoApproveIntoKg).toBe(false);
    expect(
      checklist.modelProposals.some((p) => p.sourceAdapterOrAgent === "adapter-rdkit"),
    ).toBe(true);
  });

  test("rejects proposals that try to set forbidden grade fields", () => {
    const bad = {
      proposalId: "x",
      hsiGrade: "established",
    };
    const result = assertSafeModelProposal(bad);
    expect(result.ok).toBe(false);

    const good = buildExampleModelProposals({
      createdAt: "2026-11-01T18:00:00.000Z",
    })[0]!;
    expect(() => toGateCModelProposalRow(good)).not.toThrow();
  });
});
