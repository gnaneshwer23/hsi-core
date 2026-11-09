/**
 * PR 6 — Opposing-evidence search honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  opposingSearchStatusToContextual,
  projectOpposingSearchCoverageForGap,
  runOpposingEvidenceSearch,
} from "../src/evidence/opposingEvidenceSearch";
import {createMemoryRetrievalCache} from "../src/evidence/dynamicEvidenceRetrieval";

const asOf = "2026-11-08T22:00:00.000Z";

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

function otBody(diseaseId: string): string {
  return JSON.stringify({
    data: {
      disease: {
        id: diseaseId,
        name: "systemic sclerosis",
        associatedTargets: {count: 0, rows: []},
      },
    },
  });
}

describe("opposing evidence search", () => {
  test("records search performed, findings, limitations; empty ≠ consensus", async () => {
    const report = await runOpposingEvidenceSearch({
      question: "Tfh IL-21 systemic sclerosis fibrosis",
      entities: {freeTextTerms: ["Tfh IL-21"], diseaseIds: ["MONDO_0005100"]},
      now: () => asOf,
      cache: createMemoryRetrievalCache(),
      fetcher: async (url) => {
        const u = String(url);
        if (u.includes("opentargets")) {
          return new Response(otBody("MONDO_0005100"), {status: 200});
        }
        if (u.includes("europepmc")) {
          return new Response(epmcBody([]), {status: 200});
        }
        return new Response("unexpected", {status: 500});
      },
    });

    expect(report.searchPerformed).toBe(true);
    expect(report.consensusEstablished).toBe(false);
    expect(report.providerUnavailableDistinctFromNoEvidence).toBe(true);
    expect(report.scientificApproval).toBe(false);
    expect(report.searchScope.dateOfSearch).toBe(asOf);
    expect(report.searchScope.providers).toContain("europe_pmc");
    expect(report.searchScope.contentLevel).toBe("metadata");
    expect(report.searchScope.corpusNote).toMatch(/Europe PMC/);
    expect(report.limitations.some((l) => /consensus/i.test(l))).toBe(true);
    expect(report.status === "successful_empty" || report.findings.length === 0).toBe(true);
    expect(opposingSearchStatusToContextual(report.status)).toBe("completed_bounded");
  });

  test("provider unavailable is distinct from no opposing evidence", async () => {
    const report = await runOpposingEvidenceSearch({
      question: "Tfh IL-21 systemic sclerosis fibrosis",
      entities: {freeTextTerms: ["Tfh IL-21"]},
      now: () => asOf,
      cache: createMemoryRetrievalCache(),
      fetcher: async () => new Response("down", {status: 503}),
    });

    expect(report.searchPerformed).toBe(true);
    expect(report.coverage.providerUnavailable || report.status === "provider_unavailable").toBe(true);
    expect(report.providerUnavailableDistinctFromNoEvidence).toBe(true);
    expect(report.limitations.some((l) => /Provider unavailable/i.test(l))).toBe(true);
    expect(report.consensusEstablished).toBe(false);
    expect(opposingSearchStatusToContextual("provider_unavailable")).toBe("provider_unavailable");
  });

  test("title oppose signals stay claimSupport not_assessed", async () => {
    const report = await runOpposingEvidenceSearch({
      question: "Tfh IL-21 systemic sclerosis",
      now: () => asOf,
      cache: createMemoryRetrievalCache(),
      fetcher: async (url) => {
        const u = String(url);
        if (u.includes("opentargets")) {
          return new Response(otBody("MONDO_0005100"), {status: 200});
        }
        if (u.includes("europepmc")) {
          return new Response(
            epmcBody([epmcHit("99900001", "Failed to replicate Tfh IL-21 association in SSc")]),
            {status: 200},
          );
        }
        return new Response("unexpected", {status: 500});
      },
    });

    expect(report.findings.length).toBeGreaterThan(0);
    const hit = report.findings[0]!;
    expect(hit.polarityHint).toBe("opposing_title_signal");
    expect(hit.claimSupport).toBe("not_assessed");
    expect(hit.sourceIdentityDistinctFromClaimSupport).toBe(true);
  });

  test("budget skip records limitations without claiming empty evidence", async () => {
    const report = await runOpposingEvidenceSearch({
      question: "Tfh IL-21 systemic sclerosis fibrosis",
      now: () => asOf,
      skipForBudget: true,
    });
    expect(report.searchPerformed).toBe(false);
    expect(report.status).toBe("skipped_budget");
    expect(report.findings).toEqual([]);
    expect(report.limitations.some((l) => /Skipped oppose/i.test(l))).toBe(true);
  });

  test("projects searched_sources / retrieved_records for gap envelope without collapsing empty to no-evidence", async () => {
    const report = await runOpposingEvidenceSearch({
      question: "Tfh IL-21 systemic sclerosis fibrosis",
      now: () => asOf,
      cache: createMemoryRetrievalCache(),
      fetcher: async (url) => {
        const u = String(url);
        if (u.includes("opentargets")) {
          return new Response(otBody("MONDO_0005100"), {status: 200});
        }
        if (u.includes("europepmc")) {
          return new Response(epmcBody([]), {status: 200});
        }
        return new Response("unexpected", {status: 500});
      },
    });
    const coverage = projectOpposingSearchCoverageForGap({
      opposingSearch: report,
      resultBudget: 50,
    });
    expect(coverage.searched_sources).toEqual(["europe_pmc", "open_targets"]);
    expect(coverage.result_budget).toBe(50);
    expect(coverage.not_found_in_this_search_distinct_from_no_evidence).toBe(true);
    expect(coverage.coverage_limitations.length).toBeGreaterThan(0);
  });
});
