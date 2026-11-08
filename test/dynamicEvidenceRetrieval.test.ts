/**
 * PR 2 — Dynamic retrieval: query validation + failure taxonomy.
 * Uses injected fetchers; does not call live providers or invent science.
 */
import {describe, expect, test} from "bun:test";
import {readFileSync, existsSync} from "node:fs";
import {resolve} from "node:path";
import {
  assertValidEuropePmcCursorMark,
  assertValidEuropePmcPageSize,
  assertValidEuropePmcSearchQuery,
  EUROPE_PMC_CURSOR_MARK_START,
  EUROPE_PMC_PROVIDER_VERSION,
  parseEuropePmcBibliographicPayload,
  searchEuropePmcByQuery,
} from "../src/evidence/europePmcBibliographicLookup";
import {
  assertValidOpenTargetsAssociationPageSize,
  assertValidOpenTargetsEnableIndirect,
  associationScopeFromEnableIndirect,
  diseaseAssociationQuery,
  OPEN_TARGETS_SCORE_HONESTY,
  parseOpenTargetsDiseasePayload,
} from "../src/evidence/openTargetsLookup";
import {
  clarifyResearcherEntities,
  createMemoryRetrievalCache,
  projectPermittedMetadataForRegistryImport,
  runDynamicEvidenceRetrieval,
  validateResearcherQuery,
} from "../src/evidence/dynamicEvidenceRetrieval";
import {LIVING_EVIDENCE_PMID_PINS} from "../src/evidence/livingEvidenceExpansion";

const root = resolve(import.meta.dir, "..");
const fixturesDir = resolve(root, "research/domain-graph/living-evidence/fixtures");
const retrievedAt = "2026-11-08T20:00:00.000Z";

function epmcEmptyBody(hitCount = 0): string {
  return JSON.stringify({hitCount, resultList: {result: []}, nextCursorMark: EUROPE_PMC_CURSOR_MARK_START});
}

function epmcHitBody(
  pmid: string,
  title: string,
  hitCount = 1,
  nextCursorMark: string | null = null,
): string {
  const body: Record<string, unknown> = {
    hitCount,
    resultList: {
      result: [
        {
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
        },
      ],
    },
  };
  if (nextCursorMark !== null) body.nextCursorMark = nextCursorMark;
  return JSON.stringify(body);
}

describe("Europe PMC adapter — unpinned search query validation", () => {
  test("rejects oversized or control-character queries before provider call", () => {
    expect(() => assertValidEuropePmcSearchQuery("")).toThrow(/Invalid Europe PMC search query/);
    expect(() => assertValidEuropePmcSearchQuery("bad\nquery")).toThrow(/control characters/);
    expect(() => assertValidEuropePmcSearchQuery("x".repeat(501))).toThrow(/length/);
    expect(assertValidEuropePmcSearchQuery("  Tfh IL-21  ")).toBe("Tfh IL-21");
  });

  test("bounds page size", () => {
    expect(() => assertValidEuropePmcPageSize(0)).toThrow(/page size/);
    expect(() => assertValidEuropePmcPageSize(26)).toThrow(/page size/);
    expect(assertValidEuropePmcPageSize(10)).toBe(10);
    expect(assertValidOpenTargetsAssociationPageSize(5)).toBe(5);
  });

  test("rejects invalid cursorMark", () => {
    expect(() => assertValidEuropePmcCursorMark("")).toThrow(/cursorMark/);
    expect(() => assertValidEuropePmcCursorMark("bad\ncursor")).toThrow(/control characters/);
    expect(assertValidEuropePmcCursorMark(EUROPE_PMC_CURSOR_MARK_START)).toBe("*");
  });

  test("searchEuropePmcByQuery records truncation vs successful empty", async () => {
    const empty = await searchEuropePmcByQuery({
      query: "systemic sclerosis Tfh",
      pageSize: 5,
      now: () => new Date(retrievedAt),
      fetcher: async () => new Response(epmcEmptyBody(0), {status: 200}),
    });
    expect(empty.ok).toBe(true);
    if (!empty.ok) throw new Error("expected ok");
    expect(empty.records).toEqual([]);
    expect(empty.hitCount).toBe(0);
    expect(empty.truncatedByPageBudget).toBe(false);
    expect(empty.cursorMark).toBe(EUROPE_PMC_CURSOR_MARK_START);
    expect(empty.nextCursorMark).toBeNull();
    expect(empty.providerVersion).toBe(EUROPE_PMC_PROVIDER_VERSION);

    const truncated = await searchEuropePmcByQuery({
      query: "fibrosis",
      pageSize: 1,
      now: () => new Date(retrievedAt),
      fetcher: async () => new Response(epmcHitBody("30760472", "Example", 42, "cursor-page-2"), {status: 200}),
    });
    expect(truncated.ok).toBe(true);
    if (!truncated.ok) throw new Error("expected ok");
    expect(truncated.records.length).toBe(1);
    expect(truncated.hitCount).toBe(42);
    expect(truncated.truncatedByPageBudget).toBe(true);
    expect(truncated.nextCursorMark).toBe("cursor-page-2");
  });

  test("searchEuropePmcByQuery sends cursorMark and parses nextCursorMark", async () => {
    let requestedUrl = "";
    const page = await searchEuropePmcByQuery({
      query: "IL-6 insulin resistance",
      pageSize: 2,
      cursorMark: "page-token-1",
      now: () => new Date(retrievedAt),
      fetcher: async (url) => {
        requestedUrl = String(url);
        return new Response(epmcHitBody("11111111", "Page two", 3, "page-token-2"), {status: 200});
      },
    });
    expect(requestedUrl).toContain("cursorMark=page-token-1");
    expect(page.ok).toBe(true);
    if (!page.ok) throw new Error("expected ok");
    expect(page.cursorMark).toBe("page-token-1");
    expect(page.nextCursorMark).toBe("page-token-2");
  });

  test("provider_unavailable stays typed (never empty records)", async () => {
    const result = await searchEuropePmcByQuery({
      query: "systemic sclerosis",
      fetcher: async () => new Response("forbidden", {status: 403}),
      now: () => new Date(retrievedAt),
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail");
    expect(result.outcome).toBe("provider_unavailable");
    expect("records" in result).toBe(false);
  });
});

describe("dynamic retrieval — query validation + entity clarify", () => {
  test("validateResearcherQuery rejects empty / oversized / non-metadata access", () => {
    expect(validateResearcherQuery({question: ""}).ok).toBe(false);
    const long = validateResearcherQuery({question: "q".repeat(1001)});
    expect(long.ok).toBe(false);
    if (long.ok) throw new Error("expected fail");
    expect(long.outcome).toBe("invalid_query");

    const rights = validateResearcherQuery({
      question: "Does IL-21 drive fibrosis in systemic sclerosis?",
      contentAccess: "licensed_full_text",
    });
    expect(rights.ok).toBe(false);
    if (rights.ok) throw new Error("expected fail");
    expect(rights.outcome).toBe("permission_licence_restriction");
  });

  test("clarifyResearcherEntities works without living-evidence PMID pins", () => {
    const entities = clarifyResearcherEntities({
      question: "How do Tfh cells and IL-21 relate to fibrosis in systemic sclerosis?",
    });
    expect(entities.unpinned).toBe(true);
    expect(entities.freeTextTerms.length).toBeGreaterThan(0);
    expect(entities.pmids).toEqual([]);
    for (const pin of LIVING_EVIDENCE_PMID_PINS) {
      expect(entities.pmids.includes(pin)).toBe(false);
    }
  });

  test("clarify extracts MONDO / DOI / PMID when present and records ambiguities", () => {
    const entities = clarifyResearcherEntities({
      question: "Compare MONDO:0005090 with DOI 10.1038/nature12345 and PMID 30760472",
      entities: {diseaseIds: ["not-a-disease"], freeTextTerms: ["ok term"]},
    });
    expect(entities.diseaseIds).toContain("MONDO_0005090");
    expect(entities.dois).toContain("10.1038/nature12345");
    expect(entities.pmids).toContain("30760472");
    expect(entities.ambiguities.some((a) => a.startsWith("invalid_disease_id:"))).toBe(true);
    expect(entities.freeTextTerms).toContain("ok term");
  });
});

describe("dynamic retrieval — failure taxonomy + honesty", () => {
  test("provider_unavailable is overall outcome, not successful_empty", async () => {
    const {ok, record} = await runDynamicEvidenceRetrieval({
      query: {question: "T follicular helper IL-21 fibrosis scleroderma"},
      rateLimitMs: 0,
      now: () => new Date(retrievedAt),
      fetcher: async () => new Response("nope", {status: 403}),
    });
    expect(ok).toBe(false);
    expect(record.coverage.overallOutcome).toBe("provider_unavailable");
    expect(record.coverage.providerUnavailable).toBe(true);
    expect(record.retrievedBibliographic).toEqual([]);
    expect(record.failures.some((f) => f.outcome === "provider_unavailable")).toBe(true);
    expect(record.honesty.claimSupport).toBe("not_assessed");
    expect(record.honesty.sourceIdentityDistinctFromClaimSupport).toBe(true);
    expect(record.honesty.graphPromotable).toBe(false);
    expect(record.honesty.gateCAutoApprove).toBe(false);
    expect(record.normalisedEntities.unpinned).toBe(true);
  });

  test("successful empty is distinct from provider failure", async () => {
    const {ok, record} = await runDynamicEvidenceRetrieval({
      query: {question: "completely obscure nonexistent biomarker xyzzy123"},
      rateLimitMs: 0,
      now: () => new Date(retrievedAt),
      fetcher: async () => new Response(epmcEmptyBody(0), {status: 200}),
    });
    expect(record.coverage.overallOutcome).toBe("successful_empty");
    expect(record.coverage.providerUnavailable).toBe(false);
    expect(ok).toBe(true);
    expect(record.retrievedBibliographic).toEqual([]);
  });

  test("truncated_by_budget when hitCount exceeds page", async () => {
    const {record} = await runDynamicEvidenceRetrieval({
      query: {question: "systemic sclerosis fibrosis", pageSize: 1, maxResults: 1},
      rateLimitMs: 0,
      now: () => new Date(retrievedAt),
      fetcher: async () => new Response(epmcHitBody("24586782", "SSc fibrosis", 99), {status: 200}),
    });
    expect(record.coverage.truncated).toBe(true);
    expect(record.coverage.overallOutcome).toBe("truncated_by_budget");
    expect(record.retrievedBibliographic.length).toBe(1);
    expect(record.retrievedBibliographic[0]!.claimSupport).toBe("not_assessed");
    expect(record.retrievedBibliographic[0]!.sourceIdentity).toBe("verified");
    expect(record.retrievedBibliographic[0]!.passageImported).toBe(false);
    expect(record.pagination.cursor).toBe(EUROPE_PMC_CURSOR_MARK_START);
    expect(record.providerVersions.europePmc).toBe(EUROPE_PMC_PROVIDER_VERSION);
  });

  test("cursorMark pagination walks pages until maxResults", async () => {
    const urls: string[] = [];
    const {record} = await runDynamicEvidenceRetrieval({
      query: {question: "systemic sclerosis fibrosis IL-21", pageSize: 1, maxResults: 2},
      rateLimitMs: 0,
      now: () => new Date(retrievedAt),
      fetcher: async (url) => {
        const u = String(url);
        urls.push(u);
        if (u.includes("cursorMark=%2A") || u.includes("cursorMark=*")) {
          return new Response(epmcHitBody("24586782", "Page one", 5, "cursor-b"), {status: 200});
        }
        if (u.includes("cursorMark=cursor-b")) {
          return new Response(epmcHitBody("30760472", "Page two", 5, "cursor-c"), {status: 200});
        }
        return new Response(epmcHitBody("99999999", "Should not fetch", 5), {status: 200});
      },
    });
    expect(urls.some((u) => u.includes("cursorMark=%2A") || u.includes("cursorMark=*"))).toBe(true);
    expect(urls.some((u) => u.includes("cursorMark=cursor-b"))).toBe(true);
    expect(record.pagination.europePmcPagesFetched).toBe(2);
    expect(record.pagination.maxResults).toBe(2);
    expect(record.pagination.nextCursorMark).toBe("cursor-c");
    expect(record.coverage.literatureHits).toBe(2);
    expect(record.coverage.truncated).toBe(true);
    expect(record.coverage.overallOutcome).toBe("truncated_by_budget");
    const pmids = record.retrievedBibliographic.map((r) => r.pmid).sort();
    expect(pmids).toEqual(["24586782", "30760472"]);
    expect(record.queriesSent.every((q) => q.provider !== "europe_pmc" || q.cursorMark !== undefined)).toBe(true);
  });

  test("cache key distinguishes cursorMark pages", async () => {
    let calls = 0;
    const cache = createMemoryRetrievalCache();
    const fetcher: typeof fetch = async (url) => {
      calls += 1;
      const u = String(url);
      if (u.includes("cursorMark=%2A") || u.includes("cursorMark=*")) {
        return new Response(epmcHitBody("11111111", "A", 3, "cursor-b"), {status: 200});
      }
      return new Response(epmcHitBody("22222222", "B", 3), {status: 200});
    };
    await runDynamicEvidenceRetrieval({
      query: {question: "Tfh scleroderma fibrosis", pageSize: 1, maxResults: 2},
      rateLimitMs: 0,
      cache,
      now: () => new Date(retrievedAt),
      nowMs: () => 1_000,
      fetcher,
    });
    expect(calls).toBe(2);
    await runDynamicEvidenceRetrieval({
      query: {question: "Tfh scleroderma fibrosis", pageSize: 1, maxResults: 2},
      rateLimitMs: 0,
      cache,
      now: () => new Date(retrievedAt),
      nowMs: () => 2_000,
      fetcher,
    });
    expect(calls).toBe(2);
  });

  test("partial retrieval when one provider fails and another returns hits", async () => {
    const otFixture = resolve(fixturesDir, "opentargets.disease.mondo_0008383.json");
    expect(existsSync(otFixture)).toBe(true);
    const otBody = readFileSync(otFixture, "utf8");

    const {record} = await runDynamicEvidenceRetrieval({
      query: {
        question: "What targets associate with systemic sclerosis MONDO_0008383?",
        entities: {diseaseIds: ["MONDO_0008383"], freeTextTerms: ["systemic sclerosis"]},
        pageSize: 5,
      },
      rateLimitMs: 0,
      now: () => new Date(retrievedAt),
      fetcher: async (url, init) => {
        const u = String(url);
        if (u.includes("opentargets")) {
          return new Response(otBody, {status: 200});
        }
        if (u.includes("europepmc")) {
          return new Response("down", {status: 503});
        }
        return new Response("unexpected", {status: 500});
      },
    });
    expect(record.coverage.openTargetsHits).toBe(1);
    expect(record.failures.some((f) => f.outcome === "provider_http_error")).toBe(true);
    expect(record.coverage.overallOutcome).toBe("partial_retrieval");
    expect(record.retrievedOpenTargets[0]!.claimSupport).toBe("not_assessed");
    expect(record.retrievedOpenTargets[0]!.independentCorroborationOfEuropePmc).toBe(false);
    expect(record.retrievedOpenTargets[0]!.sourceIdentity).toBe("verified");
    expect(record.retrievedOpenTargets[0]!.associationScope).toBe("direct");
    expect(record.retrievedOpenTargets[0]!.scoreHonesty).toEqual(OPEN_TARGETS_SCORE_HONESTY);
    expect(record.retrievedOpenTargets[0]!.associations.length).toBeGreaterThan(0);
    expect(record.retrievedOpenTargets[0]!.associations[0]!.evidenceTypes.length).toBeGreaterThan(0);
    expect(record.retrievedOpenTargets[0]!.associations[0]!.evidenceSources.length).toBeGreaterThan(0);
    expect(record.honesty.openTargetsScoreIsNotCausation).toBe(true);
    expect(record.honesty.openTargetsScoreIsNotEfficacy).toBe(true);
    expect(record.honesty.openTargetsScoreIsNotTargetValidation).toBe(true);
  });

  test("cache hit avoids a second provider call", async () => {
    let calls = 0;
    const cache = createMemoryRetrievalCache();
    const fetcher: typeof fetch = async () => {
      calls += 1;
      return new Response(epmcHitBody("18375541", "Cached hit", 1), {status: 200});
    };
    const first = await runDynamicEvidenceRetrieval({
      query: {question: "Tfh cells scleroderma"},
      rateLimitMs: 0,
      cache,
      now: () => new Date(retrievedAt),
      nowMs: () => 1_000,
      fetcher,
    });
    const second = await runDynamicEvidenceRetrieval({
      query: {question: "Tfh cells scleroderma"},
      rateLimitMs: 0,
      cache,
      now: () => new Date(retrievedAt),
      nowMs: () => 2_000,
      fetcher,
    });
    expect(first.record.coverage.cacheHits).toBe(0);
    expect(second.record.coverage.cacheHits).toBeGreaterThan(0);
    expect(calls).toBe(1);
  });

  test("permission_licence_restriction never imports passages", async () => {
    const {ok, record} = await runDynamicEvidenceRetrieval({
      query: {
        question: "IL-21 fibrosis",
        contentAccess: "abstract",
      },
      rateLimitMs: 0,
    });
    expect(ok).toBe(false);
    expect(record.coverage.overallOutcome).toBe("permission_licence_restriction");
    expect(record.honesty.passageImportFailClosed).toBe(true);
    expect(record.retrievedBibliographic).toEqual([]);
  });

  test("projectPermittedMetadataForRegistryImport stays metadata + not_assessed", async () => {
    const {record} = await runDynamicEvidenceRetrieval({
      query: {question: "scleroderma fibrosis"},
      rateLimitMs: 0,
      now: () => new Date(retrievedAt),
      fetcher: async () => new Response(epmcHitBody("30760472", "Meta only", 1), {status: 200}),
    });
    const projected = projectPermittedMetadataForRegistryImport(record);
    expect(projected.schemaVersion).toBe("hsi-source-metadata-import-1");
    expect(projected.claimSupport).toBe("not_assessed");
    expect(projected.records[0]!.pmid).toBe("30760472");
    expect(projected.records[0]!.licence).toBeNull();
  });
});

describe("adapter parse helpers preserve hitCount fields", () => {
  test("parseEuropePmcBibliographicPayload exposes truncation flags", () => {
    const parsed = parseEuropePmcBibliographicPayload({
      query: "fibrosis",
      bodyText: epmcHitBody("30760472", "Example", 10, "next-page"),
      httpStatus: 200,
      retrievedAt,
      pageSize: 1,
      cursorMark: EUROPE_PMC_CURSOR_MARK_START,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.truncatedByPageBudget).toBe(true);
    expect(parsed.pageSize).toBe(1);
    expect(parsed.cursorMark).toBe("*");
    expect(parsed.nextCursorMark).toBe("next-page");
    expect(parsed.providerVersion).toBe(EUROPE_PMC_PROVIDER_VERSION);
  });

  test("Open Targets fixture still parses with sourceIdentity verified", () => {
    const path = resolve(fixturesDir, "opentargets.disease.mondo_0008383.json");
    const parsed = parseOpenTargetsDiseasePayload({
      diseaseId: "MONDO_0008383",
      bodyText: readFileSync(path, "utf8"),
      httpStatus: 200,
      retrievedAt,
      pageSize: 5,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.sourceIdentity).toBe("verified");
    expect(parsed.record.scientificApproval).toBe(false);
  });
});

describe("Open Targets GraphQL hardening", () => {
  test("query document validates required fields and bounds pageSize / enableIndirect", () => {
    expect(() => assertValidOpenTargetsAssociationPageSize(0)).toThrow(/page size/);
    expect(() => assertValidOpenTargetsAssociationPageSize(26)).toThrow(/page size/);
    expect(assertValidOpenTargetsEnableIndirect(false)).toBe(false);
    expect(associationScopeFromEnableIndirect(false)).toBe("direct");
    expect(associationScopeFromEnableIndirect(true)).toBe("indirect_enabled");
    const direct = diseaseAssociationQuery({pageSize: 5, enableIndirect: false});
    expect(direct).toContain("enableIndirect: false");
    expect(direct).toContain("datatypeScores");
    expect(direct).toContain("datasourceScores");
    const indirect = diseaseAssociationQuery({pageSize: 3, enableIndirect: true});
    expect(indirect).toContain("enableIndirect: true");
    expect(indirect).toContain("size: 3");
  });

  test("preserves evidence types, datasource scores, direct scope, and score ≠ causation honesty", () => {
    const path = resolve(fixturesDir, "opentargets.disease.mondo_0008383.json");
    const parsed = parseOpenTargetsDiseasePayload({
      diseaseId: "MONDO_0008383",
      bodyText: readFileSync(path, "utf8"),
      httpStatus: 200,
      retrievedAt,
      pageSize: 5,
      enableIndirect: false,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.associationScope).toBe("direct");
    expect(parsed.enableIndirect).toBe(false);
    expect(parsed.scoreHonesty.scoreIsNotCausation).toBe(true);
    expect(parsed.scoreHonesty.scoreIsNotEfficacy).toBe(true);
    expect(parsed.scoreHonesty.scoreIsNotTargetValidation).toBe(true);
    expect(parsed.scoreHonesty.scoreIsNotClaimSupport).toBe(true);
    expect(parsed.record.scoreHonesty).toEqual(OPEN_TARGETS_SCORE_HONESTY);
    expect(parsed.graphqlPartialErrors).toBeNull();
    expect(parsed.truncatedByPageBudget).toBe(true);
    const first = parsed.record.associations[0]!;
    expect(first.datatypeScores.some((d) => d.id === "genetic_association" || d.id === "literature")).toBe(
      true,
    );
    expect(first.datasourceScores.length).toBeGreaterThan(0);
    expect(first.datasourceScores.every((d) => d.score >= 0 && d.score <= 1)).toBe(true);
  });

  test("records indirect_enabled scope when enableIndirect is requested", () => {
    const path = resolve(fixturesDir, "opentargets.disease.mondo_0005100.json");
    const parsed = parseOpenTargetsDiseasePayload({
      diseaseId: "MONDO_0005100",
      bodyText: readFileSync(path, "utf8"),
      httpStatus: 200,
      retrievedAt,
      pageSize: 5,
      enableIndirect: true,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.associationScope).toBe("indirect_enabled");
    expect(parsed.query).toContain("enableIndirect: true");
  });

  test("GraphQL errors without data are provider invalid_response (not empty hits)", () => {
    const parsed = parseOpenTargetsDiseasePayload({
      diseaseId: "MONDO_0008383",
      bodyText: JSON.stringify({
        errors: [{message: "Cannot query field associatedTargets"}],
      }),
      httpStatus: 200,
      retrievedAt,
      pageSize: 5,
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) throw new Error("expected fail");
    expect(parsed.outcome).toBe("invalid_response");
    expect(parsed.detail).toMatch(/GraphQL errors/);
  });

  test("GraphQL errors alongside usable data are reported as partial", () => {
    const path = resolve(fixturesDir, "opentargets.disease.mondo_0008383.json");
    const fixture = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    fixture.errors = [{message: "Field 'novelty' is deprecated"}];
    const parsed = parseOpenTargetsDiseasePayload({
      diseaseId: "MONDO_0008383",
      bodyText: JSON.stringify(fixture),
      httpStatus: 200,
      retrievedAt,
      pageSize: 5,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.graphqlPartialErrors).toEqual(["Field 'novelty' is deprecated"]);
  });

  test("provider HTTP failure is not silent empty associations", async () => {
    const {record} = await runDynamicEvidenceRetrieval({
      query: {
        question: "targets for MONDO_0008383 rheumatoid arthritis",
        entities: {diseaseIds: ["MONDO_0008383"]},
        pageSize: 5,
      },
      rateLimitMs: 0,
      now: () => new Date(retrievedAt),
      fetcher: async (url) => {
        const u = String(url);
        if (u.includes("opentargets")) return new Response("unavailable", {status: 503});
        if (u.includes("europepmc")) return new Response(epmcEmptyBody(0), {status: 200});
        return new Response("unexpected", {status: 500});
      },
    });
    expect(record.retrievedOpenTargets).toEqual([]);
    expect(record.failures.some((f) => f.provider.includes("open_targets") && f.outcome === "provider_http_error")).toBe(
      true,
    );
    expect(record.coverage.openTargetsHits).toBe(0);
    expect(record.coverage.overallOutcome).not.toBe("successful_empty");
  });
});
