/**
 * UniProt metadata-only adapter honesty tests.
 * Fixture/injected fetcher by default — never represents fixtures as live evidence.
 * Optional live path gated by HSI_UNIPROT_LIVE=1.
 */
import {describe, expect, test} from "bun:test";
import {
  assertValidUniprotAccession,
  lookupUniprotMetadataByAccession,
  parseUniprotMetadataPayload,
  uniprotAdapterConnectionStatus,
  uniprotMetadataRequestUrl,
  UNIPROT_METADATA_FIELDS,
  UNIPROT_PROVIDER,
} from "../src/evidence/uniprotMetadataLookup";
import {
  clarifyResearcherEntities,
  runDynamicEvidenceRetrieval,
} from "../src/evidence/dynamicEvidenceRetrieval";
import {
  buildDynamicPersistencePlan,
  createMemoryDynamicEvidencePersistStore,
  persistDynamicEvidencePlan,
} from "../src/evidence/dynamicEvidencePersistence";

const retrievedAt = "2026-11-09T06:30:00.000Z";

function tnfFixtureBody(): string {
  return JSON.stringify({
    entryType: "UniProtKB reviewed (Swiss-Prot)",
    primaryAccession: "P01375",
    uniProtkbId: "TNFA_HUMAN",
    organism: {
      scientificName: "Homo sapiens",
      commonName: "Human",
      taxonId: 9606,
    },
    proteinDescription: {
      recommendedName: {
        fullName: {value: "Tumor necrosis factor"},
      },
    },
    genes: [
      {
        geneName: {value: "TNF"},
        synonyms: [{value: "TNFA"}, {value: "TNFSF2"}],
      },
    ],
  });
}

function retryHonesty(overrides: Partial<{
  attemptsUsed: number;
  retried: boolean;
  rateLimited: boolean;
}> = {}) {
  return {
    maxRetries: 1,
    attemptsUsed: overrides.attemptsUsed ?? 1,
    retried: overrides.retried ?? false,
    rateLimited: overrides.rateLimited ?? false,
    timeoutMs: 10_000,
    fixturesAreNotLiveEvidence: true as const,
    lookupMode: "fixture" as const,
  };
}

describe("UniProt accession validation", () => {
  test("accepts Swiss-Prot / TrEMBL forms and rejects junk", () => {
    expect(assertValidUniprotAccession("p01375")).toBe("P01375");
    expect(assertValidUniprotAccession("Q9BZS1")).toBe("Q9BZS1");
    expect(assertValidUniprotAccession("P01375-1")).toBe("P01375-1");
    expect(() => assertValidUniprotAccession("")).toThrow(/Invalid UniProt/);
    expect(() => assertValidUniprotAccession("TNF")).toThrow(/Invalid UniProt/);
    expect(() => assertValidUniprotAccession("P0137")).toThrow(/Invalid UniProt/);
  });

  test("builds field-bounded metadata URL", () => {
    const url = uniprotMetadataRequestUrl("P01375");
    expect(url).toContain("rest.uniprot.org/uniprotkb/P01375.json");
    expect(url).toContain(`fields=${encodeURIComponent(UNIPROT_METADATA_FIELDS)}`);
  });
});

describe("UniProt parse honesty — fixture payloads", () => {
  test("extracts permitted metadata only and refuses claim support", () => {
    const result = parseUniprotMetadataPayload({
      accession: "P01375",
      bodyText: tnfFixtureBody(),
      httpStatus: 200,
      retrievedAt,
      retryHonesty: retryHonesty(),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.provider).toBe(UNIPROT_PROVIDER);
    expect(result.sourceIdentity).toBe("verified");
    expect(result.record.accession).toBe("P01375");
    expect(result.record.proteinName).toBe("Tumor necrosis factor");
    expect(result.record.geneNames).toContain("TNF");
    expect(result.record.geneNames).toContain("TNFA");
    expect(result.record.organism).toBe("Homo sapiens");
    expect(result.record.claimSupport).toBe("not_assessed");
    expect(result.record.scientificApproval).toBe(false);
    expect(result.record.graphPromotable).toBe(false);
    expect(result.record.sequenceRetrieved).toBe(false);
    expect(result.record.passageImportAuthorized).toBe(false);
    expect(result.record.sourceIdentityDistinctFromClaimSupport).toBe(true);
    expect(result.retryHonesty.fixturesAreNotLiveEvidence).toBe(true);
    expect(result.retryHonesty.lookupMode).toBe("fixture");
    expect(result.record).not.toHaveProperty("sequence");
    expect(result.record).not.toHaveProperty("function");
    expect(result.record.claimSupport).not.toBe("supported");
  });

  test("distinguishes provider unavailable from empty and invalid query", () => {
    const blocked = parseUniprotMetadataPayload({
      accession: "P01375",
      bodyText: "forbidden",
      httpStatus: 403,
      retrievedAt,
      retryHonesty: retryHonesty(),
    });
    expect(blocked.ok).toBe(false);
    if (blocked.ok) throw new Error("expected fail");
    expect(blocked.outcome).toBe("provider_unavailable");

    const missing = parseUniprotMetadataPayload({
      accession: "P01375",
      bodyText: "not found",
      httpStatus: 404,
      retrievedAt,
      retryHonesty: retryHonesty(),
    });
    expect(missing.ok).toBe(false);
    if (missing.ok) throw new Error("expected fail");
    expect(missing.outcome).toBe("accession_not_found");

    const empty = parseUniprotMetadataPayload({
      accession: "P01375",
      bodyText: "",
      httpStatus: 200,
      retrievedAt,
      retryHonesty: retryHonesty(),
    });
    expect(empty.ok).toBe(false);
    if (empty.ok) throw new Error("expected fail");
    expect(empty.outcome).toBe("empty_result");

    const badQuery = awaitishInvalid();
    expect(badQuery.outcome).toBe("invalid_query");
  });

  test("inactive entries are accession_not_found, not successful empty", () => {
    const result = parseUniprotMetadataPayload({
      accession: "P01375",
      bodyText: JSON.stringify({
        entryType: "Inactive",
        primaryAccession: "P01375",
        inactiveReason: {inactiveReasonType: "DELETED"},
      }),
      httpStatus: 200,
      retrievedAt,
      retryHonesty: retryHonesty(),
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail");
    expect(result.outcome).toBe("accession_not_found");
  });
});

function awaitishInvalid() {
  return parseUniprotMetadataPayload({
    accession: "NOT-AN-ACCESSION",
    bodyText: "{}",
    httpStatus: 200,
    retrievedAt,
    retryHonesty: retryHonesty(),
  }) as Extract<ReturnType<typeof parseUniprotMetadataPayload>, {ok: false}>;
}

describe("UniProt live lookup — injected fetcher + retry honesty", () => {
  test("lookup uses fixture mode when fetcher injected; retries 429 once", async () => {
    let calls = 0;
    const result = await lookupUniprotMetadataByAccession({
      accession: "P01375",
      now: () => new Date(retrievedAt),
      maxRetries: 1,
      fetcher: async () => {
        calls += 1;
        if (calls === 1) return new Response("slow down", {status: 429});
        return new Response(tnfFixtureBody(), {status: 200});
      },
    });
    expect(calls).toBe(2);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.retryHonesty.retried).toBe(true);
    expect(result.retryHonesty.rateLimited).toBe(true);
    expect(result.retryHonesty.lookupMode).toBe("fixture");
    expect(result.retryHonesty.fixturesAreNotLiveEvidence).toBe(true);
  });

  test("timeout_or_network stays distinct from empty_result", async () => {
    const result = await lookupUniprotMetadataByAccession({
      accession: "P01375",
      now: () => new Date(retrievedAt),
      maxRetries: 0,
      fetcher: async () => {
        throw new Error("network down");
      },
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail");
    expect(result.outcome).toBe("timeout_or_network");
    expect(result.outcome).not.toBe("empty_result");
  });

  test("invalid accession fails before network", async () => {
    let called = false;
    const result = await lookupUniprotMetadataByAccession({
      accession: "TNF",
      fetcher: async () => {
        called = true;
        return new Response("{}", {status: 200});
      },
    });
    expect(called).toBe(false);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected fail");
    expect(result.outcome).toBe("invalid_query");
  });

  test("connection status never labels fixtures as live", () => {
    const offline = uniprotAdapterConnectionStatus({liveEnabled: false});
    expect(offline.status).toBe("partially_implemented");
    expect(offline.connected).toBe("offline_fixture_only");
    expect(offline.label.toLowerCase()).toContain("not live");
    expect(offline.honesty.fixturesAreNotLiveEvidence).toBe(true);

    const live = uniprotAdapterConnectionStatus({liveEnabled: true, lastLiveOk: true});
    expect(live.connected).toBe("metadata_only");
    expect(live.honesty.claimSupport).toBe("not_assessed");
  });
});

describe("Dynamic retrieval + persistence — UniProt wire", () => {
  test("clarifyResearcherEntities extracts UniProt accessions", () => {
    const entities = clarifyResearcherEntities({
      question: "What is UniProt:P01375 protein metadata for TNF?",
    });
    expect(entities.uniprotAccessions).toContain("P01375");
  });

  test("runDynamicEvidenceRetrieval attaches permitted UniProt metadata", async () => {
    const {ok, record} = await runDynamicEvidenceRetrieval({
      query: {
        question: "Catalog metadata for UniProt P01375",
        entities: {uniprotAccessions: ["P01375"]},
      },
      rateLimitMs: 0,
      now: () => new Date(retrievedAt),
      fetcher: async (url) => {
        const href = String(url);
        if (href.includes("uniprot.org")) {
          return new Response(tnfFixtureBody(), {status: 200});
        }
        // Other providers unused for this accession-only question path.
        return new Response(JSON.stringify({hitCount: 0, resultList: {result: []}}), {status: 200});
      },
    });
    expect(ok).toBe(true);
    expect(record.coverage.uniprotHits).toBe(1);
    expect(record.retrievedUniprot).toHaveLength(1);
    expect(record.retrievedUniprot[0]!.accession).toBe("P01375");
    expect(record.retrievedUniprot[0]!.claimSupport).toBe("not_assessed");
    expect(record.retrievedUniprot[0]!.sequenceRetrieved).toBe(false);
    expect(record.honesty.uniprotMetadataOnly).toBe(true);
    expect(record.honesty.fixturesAreNotLiveEvidence).toBe(true);
    expect(record.providerVersions.uniprot).toBe(UNIPROT_PROVIDER);
    expect(record.retrievedUniprot[0]!.retryHonesty.lookupMode).toBe("fixture");

    const plan = buildDynamicPersistencePlan({searchRecord: record});
    expect(plan.honesty.uniprotMetadataOnly).toBe(true);
    expect(plan.candidates.some((c) => c.provider === UNIPROT_PROVIDER)).toBe(true);
    expect(plan.bindings.some((b) => b.role === "uniprot_candidate")).toBe(true);
    const store = createMemoryDynamicEvidencePersistStore();
    const persisted = await persistDynamicEvidencePlan(plan, store);
    expect(persisted.candidateCount).toBeGreaterThanOrEqual(1);
  });

  test("provider unavailable on UniProt does not become successful empty", async () => {
    const {ok, record} = await runDynamicEvidenceRetrieval({
      query: {
        question: "UniProt P01375",
        entities: {uniprotAccessions: ["P01375"]},
      },
      rateLimitMs: 0,
      now: () => new Date(retrievedAt),
      fetcher: async () => new Response("blocked", {status: 403}),
    });
    expect(ok).toBe(false);
    expect(record.coverage.providerUnavailable).toBe(true);
    expect(record.coverage.overallOutcome).toBe("provider_unavailable");
    expect(record.coverage.uniprotHits).toBe(0);
    expect(record.failures.some((f) => f.provider === UNIPROT_PROVIDER)).toBe(true);
  });
});

const liveEnabled = process.env.HSI_UNIPROT_LIVE === "1";

describe.skipIf(!liveEnabled)("UniProt live optional (HSI_UNIPROT_LIVE=1)", () => {
  test("fetches P01375 metadata from UniProt REST", async () => {
    const result = await lookupUniprotMetadataByAccession({
      accession: "P01375",
      lookupMode: "live",
      timeoutMs: 15_000,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.detail);
    expect(result.retryHonesty.lookupMode).toBe("live");
    expect(result.record.accession).toBe("P01375");
    expect(result.record.organism).toBeTruthy();
    expect(result.record.claimSupport).toBe("not_assessed");
  });
});
