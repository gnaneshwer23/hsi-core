/**
 * Phase 1 — Backend Scientific Intelligence acceptance scaffolding.
 *
 * Encodes audit gates and state non-conflation. Does NOT invent live scientific
 * benchmark results, Gate C clearance, MoU, CDS/PHI, or production readiness.
 *
 * Matrix: docs/engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md
 */
import {describe, expect, test} from "bun:test";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  parseEuropePmcBibliographicPayload,
  assertValidPmid,
} from "../src/evidence/europePmcBibliographicLookup";
import {
  LIVING_EVIDENCE_PMID_PINS,
  runLivingEvidenceExpansionFromFixtures,
} from "../src/evidence/livingEvidenceExpansion";
import {validateScientificReview} from "../src/scientificReview";
import {assessReleaseClaim, type ReleaseClaim} from "../src/graphRelease";
import {
  HSI_CDS_PHI_INVARIANTS,
  assertHsiCdsPhiBoundary,
} from "../src/cdsPhiBoundary";
import {RESEARCH_WORKSPACE_TEST_FIXTURE} from "../src/researchWorkspaceTestFixture";
import {refuseDishonestDemoOutputFlips} from "../src/evidence/syntheticE2eHonestyRegression";

const root = resolve(import.meta.dir, "..");
const matrixPath = resolve(
  root,
  "docs/engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md",
);

const AUDITED_MAIN_SHA = "4452e14b7a40d8ebfec978d9cc9b63d1d7b23719";

describe("Phase 1 backend scientific intelligence — audit baseline", () => {
  test("integration matrix document exists with required audit fields", () => {
    expect(existsSync(matrixPath)).toBe(true);
    const body = readFileSync(matrixPath, "utf8");
    expect(body).toContain(AUDITED_MAIN_SHA);
    expect(body).toContain("PR [#70]");
    expect(body).toContain("**MERGED**");
    for (const field of [
      "Capability",
      "Implementation",
      "Execution path",
      "Status",
      "Evidence",
      "Deployment",
      "Change",
      "Dependency",
    ]) {
      expect(body).toContain(field);
    }
    for (const status of ["Connected", "Partial", "Fixture-only", "Blocked", "Missing"]) {
      expect(body).toContain(status);
    }
    expect(body).toContain("provider_unavailable");
    expect(body).toContain("No evidence found");
    expect(body).toContain("Proposed PR sequence");
    expect(body).toContain("First vertical-slice acceptance criteria");
  });

  test("matrix freezes honesty: no Gate C / MoU / CDS-PHI / autumn-snow", () => {
    const body = readFileSync(matrixPath, "utf8");
    expect(body).toContain("no Gate C auto-approve");
    expect(body).toContain("no invented MoU");
    expect(body).toContain("no live CDS/PHI");
    expect(body).toContain("never autumn-snow");
    expect(body).toContain("red-wave");
  });
});

describe("Phase 1 gates — fixture is not live scientific evidence", () => {
  test("research workspace fixture stays synthetic-labelled", () => {
    expect(RESEARCH_WORKSPACE_TEST_FIXTURE.label).toBe("synthetic-test-fixture");
    expect(RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner).toContain("SYNTHETIC");
    expect(RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner).toContain("not scientific approval");
    expect(RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner).toContain("Gate C");
    expect(RESEARCH_WORKSPACE_TEST_FIXTURE.question).toContain("TEST/SYNTHETIC");
  });

  test("living-evidence offline expansion origin is fixture_replay and not graph-promotable", () => {
    const fixturesDir = resolve(root, "research/domain-graph/living-evidence/fixtures");
    const europePmcBodiesByPmid: Record<string, {httpStatus: number; bodyText: string}> = {};
    for (const pmid of LIVING_EVIDENCE_PMID_PINS) {
      const path = resolve(fixturesDir, `europepmc.pmid.${pmid}.json`);
      expect(existsSync(path)).toBe(true);
      europePmcBodiesByPmid[pmid] = {httpStatus: 200, bodyText: readFileSync(path, "utf8")};
    }
    const openTargetsBodiesByDiseaseId: Record<string, {httpStatus: number; bodyText: string}> = {
      MONDO_0008383: {
        httpStatus: 200,
        bodyText: readFileSync(
          resolve(fixturesDir, "opentargets.disease.mondo_0008383.json"),
          "utf8",
        ),
      },
      MONDO_0005100: {
        httpStatus: 200,
        bodyText: readFileSync(
          resolve(fixturesDir, "opentargets.disease.mondo_0005100.json"),
          "utf8",
        ),
      },
    };
    const ctgovBodiesByNct = {
      NCT01030861: {
        httpStatus: 200,
        bodyText: readFileSync(resolve(fixturesDir, "ctgov.nct01030861.json"), "utf8"),
      },
    };
    const {snapshot, receipt} = runLivingEvidenceExpansionFromFixtures({
      europePmcBodiesByPmid,
      openTargetsBodiesByDiseaseId,
      ctgovBodiesByNct,
      retrievedAt: "2026-11-08T17:40:00.000Z",
      asOf: "2026-11-08T17:45:00.000Z",
      generatedAt: "2026-11-08T17:45:00.000Z",
    });
    expect(snapshot.origin).toBe("fixture_replay");
    expect(snapshot.honesty.graphPromotable).toBe(false);
    expect(snapshot.honesty.scientificAcceptance).toBe("BLOCKED");
    expect(snapshot.licensing.humanCleared).toBe(false);
    expect(snapshot.licensing.passageImported).toBe(false);
    expect(snapshot.graphRelationshipCandidates.every((c) => c.claimSupport === false)).toBe(true);
    expect(snapshot.graphRelationshipCandidates.every((c) => c.graphPromotable === false)).toBe(true);
    expect(receipt.graphPromotable).toBe(false);
    expect(receipt.scientificAcceptance).toBe("BLOCKED");
    expect(receipt.humanCleared).toBe(false);
  });

  test("dishonest demo flips that claim live science are refused", () => {
    const bad = refuseDishonestDemoOutputFlips({
      gateCAutoApprove: true,
      legalBinding: true,
      groundedClaimAccepted: true,
      scientificAcceptance: "CLEARED",
    });
    expect(bad.ok).toBe(false);
  });
});

describe("Phase 1 gates — scientific review gate intact", () => {
  const principal = {
    principalId: "oidc:phase1-reviewer",
    roles: ["scientific_reviewer"] as const,
    authenticated: true as const,
  };
  const request = {
    claimId: "HSI-C-SSC-PHASE1",
    decision: "approve" as const,
    rationale:
      "Phase 1 acceptance: substantive rationale confirming human review remains mandatory.",
    evidenceReviewed: ["pmid:30760472"] as const,
    conflictOfInterestDeclared: true,
  };

  test("anonymous caller cannot approve", () => {
    expect(() => validateScientificReview(null, request)).toThrow(/authentication/i);
  });

  test("non-reviewer role cannot approve", () => {
    expect(() =>
      validateScientificReview({...principal, roles: ["researcher"]}, request),
    ).toThrow(/authentication/i);
  });

  test("release assessment rejects draft claims without authorised approval", () => {
    const draft: ReleaseClaim = {
      id: "HSI-C-DRAFT-1",
      subjectId: "cell:tcell",
      predicate: "associated_with",
      objectId: "disease:ssc",
      assertion: "Draft association must not release",
      epistemicType: "association",
      biologicalContext: {},
      status: "draft",
      sources: [
        {
          id: "pmid:30760472",
          licenceStatus: "metadata_only",
          retractionStatus: "none_reported",
          polarity: "supports",
          sourceVersion: "1",
        },
      ],
      reviews: [],
    };
    const assessment = assessReleaseClaim(draft);
    expect(assessment.eligible).toBe(false);
    expect(assessment.reasons).toContain("claim_not_approved");
    expect(assessment.reasons).toContain("missing_current_authorised_approval");
  });
});

describe("Phase 1 gates — source identity ≠ claim support", () => {
  test("successful bibliographic parse does not imply claim support or approval", () => {
    const pmid = "30760472";
    const fixture = resolve(
      root,
      `research/domain-graph/living-evidence/fixtures/europepmc.pmid.${pmid}.json`,
    );
    const parsed = parseEuropePmcBibliographicPayload({
      query: `EXT_ID:${pmid} AND SRC:MED`,
      bodyText: readFileSync(fixture, "utf8"),
      httpStatus: 200,
      retrievedAt: "2026-11-08T17:40:00.000Z",
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.records.length).toBeGreaterThan(0);
    for (const record of parsed.records) {
      expect(record.scientificApproval).toBe(false);
      expect(record.graphPromotable).toBe(false);
      expect(record.reviewState).toBe("unreviewed");
    }
  });

  test("invalid PMID fails before provider call (invalid ≠ empty evidence)", () => {
    expect(() => assertValidPmid("not-a-pmid")).toThrow(/Invalid PMID/);
    expect(() => assertValidPmid("0")).toThrow(/Invalid PMID/);
  });
});

describe("Phase 1 gates — provider failure ≠ empty results", () => {
  test("HTTP 403 encodes provider_unavailable, not an empty hit list", () => {
    const result = parseEuropePmcBibliographicPayload({
      query: 'EXT_ID:30760472 AND SRC:MED',
      bodyText: "forbidden",
      httpStatus: 403,
      retrievedAt: "2026-11-08T17:40:00.000Z",
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.outcome).toBe("provider_unavailable");
    expect("records" in result).toBe(false);
  });

  test("HTTP 200 with empty result list is successful empty, distinct from unavailable", () => {
    const result = parseEuropePmcBibliographicPayload({
      query: "EXT_ID:99999999 AND SRC:MED",
      bodyText: JSON.stringify({resultList: {result: []}}),
      httpStatus: 200,
      retrievedAt: "2026-11-08T17:40:00.000Z",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.records).toEqual([]);
  });

  test("timeout_or_network shaped invalid JSON is invalid_response, not empty evidence", () => {
    const result = parseEuropePmcBibliographicPayload({
      query: "EXT_ID:30760472 AND SRC:MED",
      bodyText: "{not-json",
      httpStatus: 200,
      retrievedAt: "2026-11-08T17:40:00.000Z",
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.outcome).toBe("invalid_response");
  });
});

describe("Phase 1 gates — privacy / CDS boundary intact", () => {
  test("CDS/PHI invariants remain refuse-closed", () => {
    expect(HSI_CDS_PHI_INVARIANTS.notCds).toBe(true);
    expect(HSI_CDS_PHI_INVARIANTS.mayUseLivePhi).toBe(false);
    expect(HSI_CDS_PHI_INVARIANTS.autoApproveIntoKg).toBe(false);
    expect(HSI_CDS_PHI_INVARIANTS.ehrWriteBack).toBe(false);
    expect(() => assertHsiCdsPhiBoundary(HSI_CDS_PHI_INVARIANTS)).not.toThrow();
  });
});

describe("Phase 1 scaffolding — vertical slice (PR 2+) documented, not implemented here", () => {
  test("matrix documents unpinned first vertical slice acceptance criteria", () => {
    const body = readFileSync(matrixPath, "utf8");
    expect(body).toContain("New researcher question");
    expect(body).toContain("must NOT rely on already-pinned source identifiers");
    expect(body).toContain("**PR 2**");
    expect(body).toContain("Dynamic retrieval");
  });

  /**
   * Scaffolding marker for PR 2: dynamic retrieval must accept an unpinned
   * researcher question. This Phase 1 suite intentionally does not call live
   * providers or invent scientific hits.
   */
  test.todo(
    "PR2: unpinned researcher question retrieves live metadata without depending on LIVING_EVIDENCE_PMID_PINS",
  );
});
