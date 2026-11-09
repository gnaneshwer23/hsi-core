/**
 * PR 3 — Persistence, deduplication, provenance for dynamic retrieval.
 * Memory store only; does not call live Neon or invent claim support.
 */
import {describe, expect, test} from "bun:test";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  buildDynamicPersistencePlan,
  createMemoryDynamicEvidencePersistStore,
  persistDynamicEvidencePlan,
  type DeclaredStudyRelationship,
} from "../src/evidence/dynamicEvidencePersistence";
import {
  createMemoryRetrievalCache,
  runDynamicEvidenceRetrieval,
  type DynamicSearchRecord,
} from "../src/evidence/dynamicEvidenceRetrieval";
import {assertLedgerNeonWritable} from "../src/db/ledgerNeonWriteGate";

const root = resolve(import.meta.dir, "..");
const retrievedAt = "2026-11-08T21:00:00.000Z";

function epmcHit(pmid: string, title: string, doi?: string): Record<string, unknown> {
  return {
    id: pmid,
    source: "MED",
    pmid,
    doi: doi ?? undefined,
    title,
    authorString: "Test Author",
    journalTitle: "Test Journal",
    pubYear: "2020",
    isOpenAccess: "N",
    inEPMC: "N",
    inPMC: "N",
  };
}

function epmcBody(hits: Record<string, unknown>[], hitCount?: number): string {
  return JSON.stringify({
    hitCount: hitCount ?? hits.length,
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

async function retrievalWithDualPmidHits(): Promise<DynamicSearchRecord> {
  let calls = 0;
  const result = await runDynamicEvidenceRetrieval({
    query: {
      question: "Tfh IL-21 systemic sclerosis fibrosis",
      pageSize: 5,
      entities: {freeTextTerms: ["Tfh IL-21"]},
    },
    now: () => new Date(retrievedAt),
    rateLimitMs: 0,
    cache: createMemoryRetrievalCache(),
    fetcher: async (input) => {
      calls += 1;
      const url = String(input);
      if (url.includes("europepmc") || url.includes("europe_pmc") || url.includes("ebi.ac.uk/europepmc")) {
        // Same PMID twice in one page — exercises in-batch dedup provenance.
        return new Response(
          epmcBody(
            [
              epmcHit("30760472", "Tfh paper A"),
              epmcHit("30760472", "Tfh paper A duplicate row"),
              epmcHit("29514998", "Primary study"),
            ],
            3,
          ),
          {status: 200},
        );
      }
      throw new Error(`Unexpected fetch: ${url} (call ${calls})`);
    },
  });
  return result.record;
}

describe("PR 3 dynamic evidence persistence — plan + honesty", () => {
  test("persists permitted metadata as draft/unexplored candidates without claim support", async () => {
    const record = await retrievalWithDualPmidHits();
    expect(record.deduped.some((d) => d.pmid === "30760472")).toBe(true);
    expect(record.failures).toEqual([]);

    const plan = buildDynamicPersistencePlan({searchRecord: record});
    expect(plan.honesty.claimSupport).toBe("not_assessed");
    expect(plan.honesty.graphPromotable).toBe(false);
    expect(plan.honesty.autoPromotedToApprovedGraph).toBe(false);
    expect(plan.candidates.every((c) => c.axes.curationReview === "draft")).toBe(true);
    expect(plan.candidates.every((c) => c.axes.hsiGrade === "unexplored")).toBe(true);
    expect(plan.candidates.every((c) => c.axes.teachingStatus === "unknown")).toBe(true);
    expect(plan.candidates.every((c) => c.claimSupport === "not_assessed")).toBe(true);
    expect(plan.candidates.every((c) => c.licenceStatus === "metadata_only")).toBe(true);
    expect(plan.candidates.some((c) => c.id === "pmid:30760472")).toBe(true);
    expect(plan.candidates.some((c) => c.id === "pmid:29514998")).toBe(true);
    // Primary candidate once; duplicate retrieval preserved as binding.
    expect(plan.candidates.filter((c) => c.id === "pmid:30760472")).toHaveLength(1);
    expect(plan.bindings.some((b) => b.role === "duplicate_retrieval" && b.pmid === "30760472")).toBe(
      true,
    );

    const store = createMemoryDynamicEvidencePersistStore();
    const persisted = await persistDynamicEvidencePlan(plan, store);
    expect(persisted.candidateCount).toBe(plan.candidates.length);
    expect(persisted.preservedDeduped).toBeGreaterThan(0);
    const saved = await store.getSearchRecord?.(plan.searchRecordId);
    expect(saved?.searchRecordHash).toBe(record.searchRecordHash);
    expect(saved?.coverage).toEqual(record.coverage);
    expect(saved?.failures).toEqual(record.failures);
    expect(saved?.queriesSent.length).toBe(record.queriesSent.length);
  });

  test("same article from two providers links record identity without independent corroboration", async () => {
    const record = await retrievalWithDualPmidHits();
    const declared: DeclaredStudyRelationship[] = [
      {
        kind: "cross_provider_same_record",
        pmid: "30760472",
        providerA: "europe_pmc",
        providerB: "secondary_bibliographic",
        recordIdA: "pmid:30760472",
        recordIdB: "secondary:30760472",
      },
    ];
    const plan = buildDynamicPersistencePlan({searchRecord: record, declaredRelationships: declared});
    const cross = plan.identityLinks.filter((l) => l.relation === "cross_provider_same_record");
    expect(cross).toHaveLength(1);
    expect(cross[0]!.countsAsIndependentEvidence).toBe(false);
    expect(plan.identityLinks.some((l) => l.relation === "same_study" && l.toIdentity === "study:pmid:30760472")).toBe(
      true,
    );
  });

  test("preprint vs published share study identity; remain non-independent", async () => {
    const result = await runDynamicEvidenceRetrieval({
      query: {
        question: "preprint and published fibrosis",
        pageSize: 5,
        entities: {pmids: ["11111111", "22222222"], freeTextTerms: ["fibrosis"]},
      },
      now: () => new Date(retrievedAt),
      rateLimitMs: 0,
      cache: createMemoryRetrievalCache(),
      fetcher: async (input) => {
        const url = decodeURIComponent(String(input));
        if (url.includes("EXT_ID:11111111")) {
          return new Response(
            epmcBody([epmcHit("11111111", "Preprint title", "10.1101/2020.01.01.12345")]),
            {status: 200},
          );
        }
        if (url.includes("EXT_ID:22222222")) {
          return new Response(
            epmcBody([epmcHit("22222222", "Published title", "10.1038/s41586-020-0000")]),
            {status: 200},
          );
        }
        // literature search
        return new Response(
          epmcBody([
            epmcHit("11111111", "Preprint title", "10.1101/2020.01.01.12345"),
            epmcHit("22222222", "Published title", "10.1038/s41586-020-0000"),
          ]),
          {status: 200},
        );
      },
    });
    const plan = buildDynamicPersistencePlan({
      searchRecord: result.record,
      declaredRelationships: [
        {
          kind: "preprint_of",
          preprintPmid: "11111111",
          publishedPmid: "22222222",
          sharedDoi: null,
        },
      ],
    });
    const studyLinks = plan.identityLinks.filter((l) => l.relation === "same_study");
    expect(studyLinks.length).toBeGreaterThanOrEqual(2);
    expect(studyLinks.every((l) => l.countsAsIndependentEvidence === false)).toBe(true);
    expect(plan.candidates.map((c) => c.id).sort()).toEqual(["pmid:11111111", "pmid:22222222"]);
  });

  test("review citing primary is dependency, not independent evidence", async () => {
    const result = await runDynamicEvidenceRetrieval({
      query: {
        question: "review of primary mechanism",
        pageSize: 5,
        entities: {pmids: ["33333333", "44444444"]},
      },
      now: () => new Date(retrievedAt),
      rateLimitMs: 0,
      cache: createMemoryRetrievalCache(),
      fetcher: async (input) => {
        const url = decodeURIComponent(String(input));
        if (url.includes("EXT_ID:33333333")) {
          return new Response(epmcBody([epmcHit("33333333", "Review article")]), {status: 200});
        }
        if (url.includes("EXT_ID:44444444")) {
          return new Response(epmcBody([epmcHit("44444444", "Primary article")]), {status: 200});
        }
        // Literature search may also run from residual question terms — return both.
        return new Response(
          epmcBody([epmcHit("33333333", "Review article"), epmcHit("44444444", "Primary article")]),
          {status: 200},
        );
      },
    });
    expect(result.record.retrievedBibliographic.some((b) => b.pmid === "33333333")).toBe(true);
    expect(result.record.retrievedBibliographic.some((b) => b.pmid === "44444444")).toBe(true);
    const plan = buildDynamicPersistencePlan({
      searchRecord: result.record,
      declaredRelationships: [
        {kind: "review_cites_primary", reviewPmid: "33333333", primaryPmid: "44444444"},
      ],
    });
    const cites = plan.identityLinks.filter((l) => l.relation === "cites_or_reviews");
    expect(cites).toHaveLength(1);
    expect(cites[0]!.countsAsIndependentEvidence).toBe(false);
    expect(cites[0]!.fromIdentity).toBe("pmid:33333333");
    expect(cites[0]!.toIdentity).toBe("pmid:44444444");
  });

  test("Open Targets item with Europe PMC hits is not independent corroboration", async () => {
    const result = await runDynamicEvidenceRetrieval({
      query: {
        question: "systemic sclerosis targets EFO_0000685",
        pageSize: 5,
        entities: {
          diseaseIds: ["EFO_0000685"],
          freeTextTerms: ["systemic sclerosis"],
        },
      },
      now: () => new Date(retrievedAt),
      rateLimitMs: 0,
      cache: createMemoryRetrievalCache(),
      fetcher: async (input) => {
        const url = String(input);
        if (url.includes("platform.opentargets") || url.includes("api.platform.opentargets")) {
          return new Response(otBody("EFO_0000685", "systemic sclerosis"), {status: 200});
        }
        return new Response(epmcBody([epmcHit("30760472", "SSc lit")]), {status: 200});
      },
    });
    expect(result.record.retrievedOpenTargets.length).toBe(1);
    expect(result.record.retrievedBibliographic.some((b) => b.pmid === "30760472")).toBe(true);

    const plan = buildDynamicPersistencePlan({searchRecord: result.record});
    const derived = plan.identityLinks.filter((l) => l.relation === "derived_not_independent");
    expect(derived.length).toBeGreaterThanOrEqual(1);
    expect(derived.every((l) => l.countsAsIndependentEvidence === false)).toBe(true);
    expect(
      plan.candidates.some(
        (c) =>
          c.provider === "open_targets_platform_graphql_v4" &&
          c.independentCorroborationOfEuropePmc === false,
      ),
    ).toBe(true);
  });

  test("provider failure and coverage are preserved on the persisted search record", async () => {
    const result = await runDynamicEvidenceRetrieval({
      query: {question: "provider down query", pageSize: 5, entities: {freeTextTerms: ["fibrosis"]}},
      now: () => new Date(retrievedAt),
      rateLimitMs: 0,
      cache: createMemoryRetrievalCache(),
      fetcher: async () => new Response("nope", {status: 503}),
    });
    expect(result.record.failures.length).toBeGreaterThan(0);
    expect(result.record.coverage.overallOutcome).not.toBe("successful_empty");

    const plan = buildDynamicPersistencePlan({searchRecord: result.record});
    const store = createMemoryDynamicEvidencePersistStore();
    const persisted = await persistDynamicEvidencePlan(plan, store);
    expect(persisted.preservedFailures).toBe(result.record.failures.length);
    const saved = await store.getSearchRecord?.(plan.searchRecordId);
    expect(saved?.failures).toEqual(result.record.failures);
    expect(saved?.coverage.providerUnavailable || saved?.coverage.partial || saved?.failures.length).toBeTruthy();
    expect(saved?.queriesSent.every((q) => typeof q.outcome === "string")).toBe(true);
  });

  test("Neon store write gate refuses autumn-snow / production writes; migration 018 present", () => {
    const migration = resolve(root, "db/migrations/018_hsi_dynamic_evidence_persistence.sql");
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("hsi_dynamic_search_records");
    expect(sql).toContain("hsi_evidence_identity_links");
    expect(sql).toContain("hsi_dynamic_candidate_bindings");
    expect(sql).toContain("scientific_approval boolean NOT NULL DEFAULT false CHECK (scientific_approval = false)");
    expect(sql).toContain("derived_not_independent");

    const productionUrl =
      "postgresql://test:never-used@ep-hsi-production.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
    expect(() => assertLedgerNeonWritable({databaseUrl: productionUrl, writesEnabled: true})).toThrow(
      /staging host/,
    );
  });
});
