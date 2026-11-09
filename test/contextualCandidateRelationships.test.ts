/**
 * PR 4 — Contextual candidate relationships + release-aware retrieval gates.
 */
import {describe, expect, test} from "bun:test";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  buildContextualCandidatePack,
  CANDIDATE_RELATIONSHIP_RECORD_SCHEMA,
  projectCandidateRelationshipRecord,
  projectCandidateRelationshipRecords,
  refuseAutoPromoteContextualCandidate,
  type DeclaredContextualAssociation,
} from "../src/evidence/contextualCandidateRelationships";
import {
  attemptApprovalBypass,
  retrieveReleaseAware,
} from "../src/evidence/releaseAwareRetrieval";
import {
  buildDynamicPersistencePlan,
  createMemoryDynamicEvidencePersistStore,
  persistDynamicEvidencePlan,
} from "../src/evidence/dynamicEvidencePersistence";
import {
  createMemoryRetrievalCache,
  runDynamicEvidenceRetrieval,
  type DynamicSearchRecord,
} from "../src/evidence/dynamicEvidenceRetrieval";
import {
  createCandidateManifest,
  type ReleaseClaim,
} from "../src/graphRelease";
import type {OpenTargetsDiseaseRecord} from "../src/evidence/openTargetsLookup";
import {
  OPEN_TARGETS_PROVIDER,
  OPEN_TARGETS_SCORE_HONESTY,
} from "../src/evidence/openTargetsLookup";

const root = resolve(import.meta.dir, "..");
const retrievedAt = "2026-11-08T21:00:00.000Z";

function epmcHit(pmid: string, title: string): Record<string, unknown> {
  return {
    id: pmid,
    source: "MED",
    pmid,
    title,
    authorString: "Test Author",
    journalTitle: "Test Journal",
    pubYear: "2020",
    isOpenAccess: "N",
    inEPMC: "N",
    inPMC: "N",
  };
}

function epmcBody(hits: Record<string, unknown>[]): string {
  return JSON.stringify({
    hitCount: hits.length,
    resultList: {result: hits},
  });
}

function otBody(diseaseId: string, name: string): string {
  return JSON.stringify({
    data: {
      disease: {
        id: diseaseId,
        name,
        associatedTargets: {
          count: 1,
          rows: [
            {
              target: {id: "ENSG00000105397", approvedSymbol: "TGFB1"},
              score: 0.5,
              datatypeScores: [{id: "literature", score: 0.4}],
            },
          ],
        },
      },
    },
  });
}

async function sampleSearchRecord(): Promise<DynamicSearchRecord> {
  const result = await runDynamicEvidenceRetrieval({
    query: {
      question: "Tfh IL-21 systemic sclerosis fibrosis",
      pageSize: 5,
      entities: {freeTextTerms: ["Tfh IL-21"]},
    },
    now: () => new Date(retrievedAt),
    rateLimitMs: 0,
    cache: createMemoryRetrievalCache(),
    fetcher: async (url) => {
      const u = String(url);
      if (u.includes("opentargets")) {
        return new Response(otBody("MONDO_0005100", "systemic sclerosis"), {status: 200});
      }
      if (u.includes("europepmc")) {
        return new Response(epmcBody([epmcHit("30760472", "Tfh IL-21 in SSc")]), {status: 200});
      }
      return new Response("unexpected", {status: 500});
    },
  });
  expect(result.ok).toBe(true);
  return result.record;
}

const otRecord: OpenTargetsDiseaseRecord = {
  provider: OPEN_TARGETS_PROVIDER,
  diseaseId: "MONDO_0005100",
  diseaseName: "systemic sclerosis",
  associationCount: 1,
  associations: [
    {
      targetEnsemblId: "ENSG00000105397",
      approvedSymbol: "TGFB1",
      score: 0.5,
      datatypeScores: [{id: "literature", score: 0.4}],
      datasourceScores: [{id: "europepmc", score: 0.35}],
    },
  ],
  associationScope: "direct",
  enableIndirect: false,
  scoreHonesty: OPEN_TARGETS_SCORE_HONESTY,
  retrievedAt,
  responseIdentity: "a".repeat(64),
  verificationState: "metadata_retrieved_not_claim_verified",
  reviewState: "unreviewed",
  scientificApproval: false,
  graphPromotable: false,
  passageImportAuthorized: false,
};

const approvedClaim: ReleaseClaim = {
  id: "HSI-C-SSC-001",
  subjectId: "Tfh",
  predicate: "associated_with",
  objectId: "SSc",
  assertion: "Cohort-specific association",
  epistemicType: "observational_association",
  biologicalContext: {model: "human", disease: "SSc"},
  status: "approved",
  sources: [
    {
      id: "pmid:30760472",
      licenceStatus: "metadata_only",
      retractionStatus: "none_reported",
      polarity: "supports",
      sourceVersion: "2026-11-04",
    },
  ],
  reviews: [
    {
      id: "review-1",
      claimId: "HSI-C-SSC-001",
      decision: "approve",
      reviewerPrincipal: "oidc:scientist",
      reviewerAuthorised: true,
      reviewedAt: "2026-11-04T10:00:00Z",
    },
  ],
};

describe("PR 4 contextual candidate relationships", () => {
  test("projects refined-brief relationship envelope without collapsing axes or auto-promoting", () => {
    const pack = buildContextualCandidatePack({
      openTargetsRecords: [otRecord],
      generatedAt: retrievedAt,
      surfaceLabel: "candidate",
    });
    const records = projectCandidateRelationshipRecords({
      pack,
      graphVersion: "v42",
    });
    expect(records.length).toBe(1);
    const row = records[0]!;
    expect(row.schemaVersion).toBe(CANDIDATE_RELATIONSHIP_RECORD_SCHEMA);
    expect(row.relationship_id).toBe(pack.relationships[0]!.id);
    expect(row.subject_id).toContain("MONDO");
    expect(row.object_id).toContain("ENSG00000105397");
    expect(row.predicate).toBe("associated_with_target_metadata");
    expect(row.relationship_type).toBe("associative");
    expect(row.directionality).toBe("directed");
    expect(row.evidence_status).toBe("insufficient");
    expect(row.confidence).toBe(0.5);
    expect(row.context.disease).toBeTruthy();
    expect(row.source_ids.length).toBeGreaterThan(0);
    expect(row.claim_ids).toEqual([]);
    expect(row.curation_review).toBe("draft");
    expect(row.hsi_grade).toBe("unexplored");
    expect(row.teaching_status).toBe("unknown");
    expect(row.graph_version).toBe("v42");
    expect(row.created_at).toBe(retrievedAt);
    expect(row.graph_promotable).toBe(false);
    expect(row.scientific_approval).toBe(false);
    expect(row.honesty.axesPreservedOrthogonal).toBe(true);
    expect(row.honesty.confidenceDistinctFromScientificCertainty).toBe(true);
    expect(row.honesty.autoPromotedToApprovedGraph).toBe(false);

    const single = projectCandidateRelationshipRecord({
      relationship: pack.relationships[0]!,
      createdAt: retrievedAt,
      graphVersion: "v42",
    });
    expect(single.relationship_id).toBe(row.relationship_id);
    expect(single.curation_review).not.toBe(single.hsi_grade as string);
    expect(single.relationship_type).not.toBe(single.evidence_status as string);
  });

  test("builds disease/gene/target context from Open Targets without claim support", () => {
    const pack = buildContextualCandidatePack({
      openTargetsRecords: [otRecord],
      generatedAt: retrievedAt,
      surfaceLabel: "candidate",
    });
    expect(pack.relationships.length).toBe(1);
    const rel = pack.relationships[0]!;
    expect(rel.kind).toBe("disease_associated_target_metadata");
    expect(rel.findingPolarity).toBe("uncertain");
    expect(rel.biologicalContext.diseasePhenotype[0]?.value).toBe("MONDO:0005100");
    expect(rel.biologicalContext.genesProteinsPathways[0]?.label).toBe("TGFB1");
    expect(rel.biologicalContext.interventionsTargets[0]?.value).toBe("ENSG00000105397");
    expect(rel.claimSupport).toBe(false);
    expect(rel.graphPromotable).toBe(false);
    expect(rel.scientificApproval).toBe(false);
    expect(rel.reviewState).toBe("draft");
    expect(rel.axes).toEqual({
      curationReview: "draft",
      hsiGrade: "unexplored",
      teachingStatus: "unknown",
    });
    expect(rel.limitations).toContain("association_index_not_claim");
    expect(pack.honesty.noModelConfidenceScore).toBe(true);
    expect(pack.honesty.autoPromotedToApprovedGraph).toBe(false);
  });

  test("bibliographic-only metadata does not invent mechanistic relationships", async () => {
    const record = await sampleSearchRecord();
    const plan = buildDynamicPersistencePlan({searchRecord: record});
    const bare = buildContextualCandidatePack({plan, generatedAt: retrievedAt});
    expect(bare.relationships.every((r) => r.kind !== "bibliographic_context_anchor")).toBe(true);

    const withContext = buildContextualCandidatePack({
      plan,
      declaredContext: {
        diseasePhenotype: [{system: "MONDO", value: "MONDO:0005100", label: "SSc"}],
        genesProteinsPathways: [{system: "HGNC", value: "HGNC:11766", label: "IL21"}],
        experimentalSystemsSpecies: [{system: "NCBITaxon", value: "9606", label: "human"}],
      },
      generatedAt: retrievedAt,
    });
    const anchors = withContext.relationships.filter((r) => r.kind === "bibliographic_context_anchor");
    expect(anchors.length).toBeGreaterThan(0);
    expect(anchors.every((r) => r.limitations.includes("bibliographic_not_mechanistic"))).toBe(true);
    expect(anchors.every((r) => r.claimSupport === false)).toBe(true);
  });

  test("preserves supporting / opposing / uncertain findings and incomplete oppose honesty", () => {
    const declared: DeclaredContextualAssociation[] = [
      {
        subject: {system: "MONDO", value: "MONDO:0005100", label: "SSc"},
        predicate: "involves_cell_state",
        object: {system: "CL", value: "CL:0002038", label: "Tfh"},
        findingPolarity: "supporting",
        evidenceSourceIds: ["pmid:30760472"],
        context: {
          diseasePhenotype: [{system: "MONDO", value: "MONDO:0005100", label: "SSc"}],
          organTissueCellState: [{system: "CL", value: "CL:0002038", label: "Tfh"}],
        },
      },
      {
        subject: {system: "MONDO", value: "MONDO:0005100", label: "SSc"},
        predicate: "involves_cell_state",
        object: {system: "CL", value: "CL:0002038", label: "Tfh"},
        findingPolarity: "opposing",
        evidenceSourceIds: ["pmid:99999999"],
      },
      {
        subject: {system: "HGNC", value: "HGNC:11766", label: "IL21"},
        predicate: "associated_with_pathway",
        object: {system: "Reactome", value: "R-HSA-123", label: "cytokine"},
        findingPolarity: "uncertain",
        evidenceSourceIds: ["pmid:11111111"],
      },
    ];
    const pack = buildContextualCandidatePack({
      declaredAssociations: declared,
      opposingSearchStatus: "stubbed_incomplete",
      generatedAt: retrievedAt,
    });
    expect(pack.relationships.map((r) => r.findingPolarity).sort()).toEqual([
      "opposing",
      "supporting",
      "uncertain",
    ]);
    expect(pack.opposingEvidenceSearch.consensusEstablished).toBe(false);
    expect(pack.opposingEvidenceSearch.status).toBe("stubbed_incomplete");
    expect(pack.opposingEvidenceSearch.note).toContain("Incomplete oppose ≠ consensus");
  });

  test("auto-promotion refused even after source mutation or added citations", () => {
    const pack = buildContextualCandidatePack({
      openTargetsRecords: [otRecord],
      generatedAt: retrievedAt,
    });
    const rel = pack.relationships[0]!;
    const refusal = refuseAutoPromoteContextualCandidate(rel, {
      replacementSourceId: "pmid:00000001",
      additionalCitationIds: ["pmid:00000002", "doi:10.1000/bypass"],
    });
    expect(refusal.promoted).toBe(false);
    expect(refusal.reasons).toContain("auto_promotion_forbidden");
    expect(refusal.reasons).toContain("source_identity_mutation_does_not_grant_approval");
    expect(refusal.reasons).toContain("additional_citations_do_not_bypass_approval");
  });
});

describe("PR 4 release-aware retrieval", () => {
  test("approved release hits stay separate from draft candidates", async () => {
    const record = await sampleSearchRecord();
    const plan = buildDynamicPersistencePlan({searchRecord: record});
    const store = createMemoryDynamicEvidencePersistStore();
    await persistDynamicEvidencePlan(plan, store);

    const pack = buildContextualCandidatePack({
      plan,
      openTargetsRecords: [otRecord],
      declaredContext: {
        diseasePhenotype: [{system: "MONDO", value: "MONDO:0005100", label: "SSc"}],
      },
      surfaceLabel: "candidate",
      generatedAt: retrievedAt,
    });

    const manifest = createCandidateManifest("HSI-GR-ssc-1", "1.0.0", [approvedClaim], retrievedAt);
    const published = {manifest: {...manifest, status: "published" as const}, claims: [approvedClaim]};

    const withoutDraft = retrieveReleaseAware({
      published,
      candidatePack: pack,
      includeDraftCandidates: false,
    });
    expect(withoutDraft.approved).toHaveLength(1);
    expect(withoutDraft.drafts).toHaveLength(0);
    expect(withoutDraft.approved[0]!.surfaceLabel).toBe("approved_release");
    expect(withoutDraft.honesty.draftsNeverRenderedAsApproved).toBe(true);

    const withDraft = retrieveReleaseAware({
      published,
      candidatePack: pack,
      includeDraftCandidates: true,
    });
    expect(withDraft.approved).toHaveLength(1);
    expect(withDraft.drafts.length).toBeGreaterThan(0);
    expect(withDraft.drafts.every((d) => d.channel === "draft_candidate")).toBe(true);
    expect(withDraft.drafts.every((d) => d.reviewState === "draft")).toBe(true);
    expect(withDraft.drafts.every((d) => d.graphPromotable === false)).toBe(true);
    expect(withDraft.drafts.every((d) => d.warning.includes("not an approved"))).toBe(true);
    expect(withDraft.drafts.some((d) => (d.surfaceLabel as string) === "approved_release")).toBe(false);
  });

  test("fixture candidates require explicit allowFixtureCandidates", () => {
    const pack = buildContextualCandidatePack({
      openTargetsRecords: [otRecord],
      surfaceLabel: "fixture",
      generatedAt: retrievedAt,
    });
    const denied = retrieveReleaseAware({
      candidatePack: pack,
      includeDraftCandidates: true,
      allowFixtureCandidates: false,
    });
    expect(denied.drafts).toHaveLength(0);
    const allowed = retrieveReleaseAware({
      candidatePack: pack,
      includeDraftCandidates: true,
      allowFixtureCandidates: true,
    });
    expect(allowed.drafts.length).toBe(1);
    expect(allowed.drafts[0]!.surfaceLabel).toBe("fixture");
  });

  test("changing source id or adding citation cannot bypass approval into approved channel", () => {
    const pack = buildContextualCandidatePack({
      openTargetsRecords: [otRecord],
      generatedAt: retrievedAt,
    });
    const rel = pack.relationships[0]!;
    const manifest = createCandidateManifest("HSI-GR-ssc-1", "1.0.0", [approvedClaim], retrievedAt);
    const published = {manifest: {...manifest, status: "published" as const}, claims: [approvedClaim]};

    for (const mutation of [
      {kind: "replace_source_id" as const, newSourceId: "pmid:00000042"},
      {kind: "add_citation" as const, citationId: "pmid:88888888", polarity: "supports" as const},
      {kind: "flip_review_state_locally" as const, to: "approved" as const},
    ]) {
      const result = attemptApprovalBypass({candidate: rel, published, mutation});
      expect(result.bypassSucceeded).toBe(false);
      expect(result.approvedHitsInjected).toBe(0);
      expect(result.releaseEligible).toBe(false);
      expect(result.reasons.length).toBeGreaterThan(0);
    }
  });

  test("context fields survive pack → release-aware draft channel", () => {
    const pack = buildContextualCandidatePack({
      declaredAssociations: [
        {
          subject: {system: "MONDO", value: "MONDO:0005100", label: "SSc"},
          predicate: "modulates",
          object: {system: "GO", value: "GO:0006955", label: "immune response"},
          findingPolarity: "uncertain",
          evidenceSourceIds: ["pmid:30760472"],
          context: {
            diseasePhenotype: [{system: "MONDO", value: "MONDO:0005100", label: "SSc"}],
            organTissueCellState: [{system: "UBERON", value: "UBERON:0002107", label: "liver"}],
            genesProteinsPathways: [{system: "GO", value: "GO:0006955", label: "immune response"}],
            experimentalSystemsSpecies: [{system: "NCBITaxon", value: "9606", label: "human"}],
            interventionsTargets: [{system: "UniProt", value: "P01579", label: "IFNG"}],
          },
        },
      ],
      generatedAt: retrievedAt,
    });
    const out = retrieveReleaseAware({candidatePack: pack, includeDraftCandidates: true});
    const ctx = out.drafts[0]!.relationship.biologicalContext;
    expect(ctx.diseasePhenotype[0]?.value).toBe("MONDO:0005100");
    expect(ctx.organTissueCellState[0]?.system).toBe("UBERON");
    expect(ctx.genesProteinsPathways[0]?.value).toBe("GO:0006955");
    expect(ctx.experimentalSystemsSpecies[0]?.value).toBe("9606");
    expect(ctx.interventionsTargets[0]?.value).toBe("P01579");
    expect(out.drafts[0]!.relationship.axes.curationReview).toBe("draft");
    expect(out.drafts[0]!.relationship.axes.hsiGrade).toBe("unexplored");
    expect(out.drafts[0]!.relationship.axes.teachingStatus).toBe("unknown");
  });
});

describe("PR 4 matrix documentation", () => {
  test("integration matrix mentions contextual candidates and release-aware retrieval", () => {
    const matrixPath = resolve(
      root,
      "docs/engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md",
    );
    expect(existsSync(matrixPath)).toBe(true);
    const body = readFileSync(matrixPath, "utf8");
    expect(body).toContain("contextualCandidateRelationships");
    expect(body).toContain("releaseAwareRetrieval");
  });
});
