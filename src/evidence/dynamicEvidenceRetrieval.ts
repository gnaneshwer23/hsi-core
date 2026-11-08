/**
 * PR 2 — Dynamic evidence retrieval (unpinned researcher queries).
 *
 * Extends Europe PMC + Open Targets adapters with validated free-form /
 * entity-shaped queries, honest failure taxonomy, rate limits, caching,
 * and a reproducible search record.
 *
 * Critical honesty:
 * - Source identity ≠ claim support (bibliographic metadata never fabricates
 *   passages, effect estimates, or mechanistic conclusions).
 * - Provider unavailable must never silently become “no evidence found.”
 * - Metadata-only; no restricted full-text import without verified reuse rights.
 * - Graph promotion / Gate C / CDS-PHI remain closed.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  assertValidDoi,
  assertValidEuropePmcPageSize,
  assertValidEuropePmcSearchQuery,
  assertValidPmid,
  type BibliographicLookupResult,
  type BibliographicRecord,
  searchEuropePmcByQuery,
} from "./europePmcBibliographicLookup";
import {
  assertValidOpenTargetsAssociationPageSize,
  assertValidOpenTargetsDiseaseId,
  lookupOpenTargetsDiseaseAssociations,
  type OpenTargetsLookupResult,
  OPEN_TARGETS_PROVIDER,
} from "./openTargetsLookup";

export const DYNAMIC_SEARCH_RECORD_SCHEMA = "hsi-dynamic-search-record-1" as const;
export const DYNAMIC_RETRIEVAL_METHOD = "hsi.dynamic_evidence_retrieval.v1" as const;
export const DYNAMIC_RATE_LIMIT_MS = 350;
export const DYNAMIC_QUESTION_MAX_CHARS = 1_000;
export const DYNAMIC_TERM_MAX_CHARS = 120;
export const DYNAMIC_MAX_ENTITY_IDS = 8;
export const DYNAMIC_CACHE_TTL_MS = 5 * 60_000;

export type SourceIdentityState = "verified" | "unresolved" | "invalid";
export type ClaimSupportState = "not_assessed";
export type ContentAccessState = "metadata";

/** Distinct outcome classes — must not be conflated. */
export type RetrievalOutcomeClass =
  | "successful_hits"
  | "successful_empty"
  | "truncated_by_budget"
  | "partial_retrieval"
  | "provider_unavailable"
  | "invalid_query"
  | "permission_licence_restriction"
  | "provider_http_error"
  | "invalid_response"
  | "oversized_response"
  | "timeout_or_network"
  | "disease_not_found";

export type DynamicContentAccessRequest = "metadata" | "abstract" | "licensed_full_text";

export type ResearcherQueryInput = {
  /** Natural-language researcher question (unpinned). */
  question: string;
  /** Optional structured entities; journey must work with question alone. */
  entities?: {
    diseaseIds?: readonly string[];
    freeTextTerms?: readonly string[];
    pmids?: readonly string[];
    dois?: readonly string[];
  };
  /** Ordering hint recorded in the search record (provider default if omitted). */
  ordering?: "relevance" | "date_desc" | "provider_default";
  synonyms?: readonly string[];
  pageSize?: number;
  /** Only metadata is permitted in PR 2 without human rights clearance. */
  contentAccess?: DynamicContentAccessRequest;
};

export type NormalisedEntityBundle = {
  diseaseIds: string[];
  freeTextTerms: string[];
  pmids: string[];
  dois: string[];
  ambiguities: string[];
  /** True when no living-evidence / SSC pin set was required. */
  unpinned: true;
};

export type DynamicQueryAttempt = {
  provider: "europe_pmc" | typeof OPEN_TARGETS_PROVIDER;
  query: string;
  purpose: "literature_search" | "pmid_identity" | "doi_identity" | "disease_associations";
  requestedExternalId: string | null;
  sourceIdentity: SourceIdentityState;
  cacheStatus: "miss" | "hit";
  outcome: RetrievalOutcomeClass;
  retrievedAt: string;
  httpStatus: number | null;
  responseIdentity: string | null;
  detail: string | null;
  hitCount: number | null;
  returnedCount: number;
  truncatedByPageBudget: boolean;
  pageSize: number;
};

export type PermittedBibliographicMetadata = {
  provider: "europe_pmc";
  pmid: string | null;
  doi: string | null;
  title: string;
  journal: string | null;
  publicationYear: number | null;
  url: string;
  retrievedAt: string;
  responseIdentity: string;
  sourceIdentity: SourceIdentityState;
  contentAccess: ContentAccessState;
  claimSupport: ClaimSupportState;
  scientificApproval: false;
  graphPromotable: false;
  passageImported: false;
  /** Record vs study vs independent-evidence: PR 2 records provider record identity only. */
  identityLayer: "provider_record";
  duplicateOfPmid: string | null;
};

export type PermittedOpenTargetsMetadata = {
  provider: typeof OPEN_TARGETS_PROVIDER;
  diseaseId: string;
  diseaseName: string;
  associationCount: number;
  associationSymbols: string[];
  retrievedAt: string;
  responseIdentity: string;
  sourceIdentity: SourceIdentityState;
  contentAccess: ContentAccessState;
  claimSupport: ClaimSupportState;
  scientificApproval: false;
  graphPromotable: false;
  passageImported: false;
  /** Open Targets Europe PMC–derived literature is not independent corroboration. */
  independentCorroborationOfEuropePmc: false;
  identityLayer: "provider_record";
};

export type DynamicSearchRecord = {
  schemaVersion: typeof DYNAMIC_SEARCH_RECORD_SCHEMA;
  method: typeof DYNAMIC_RETRIEVAL_METHOD;
  question: string;
  normalisedEntities: NormalisedEntityBundle;
  synonyms: string[];
  ordering: "relevance" | "date_desc" | "provider_default";
  filters: {
    contentAccess: ContentAccessState;
    europePmcResultType: "core";
    metadataOnly: true;
  };
  pagination: {
    pageSize: number;
    rateLimitMs: number;
  };
  timestamps: {
    startedAt: string;
    completedAt: string;
  };
  providerVersions: {
    europePmc: "europepmc_rest_search";
    openTargets: typeof OPEN_TARGETS_PROVIDER;
  };
  queriesSent: DynamicQueryAttempt[];
  retrievedBibliographic: PermittedBibliographicMetadata[];
  retrievedOpenTargets: PermittedOpenTargetsMetadata[];
  excluded: {reason: string; detail: string}[];
  deduped: {pmid: string; keptResponseIdentity: string; droppedCount: number}[];
  failures: {outcome: RetrievalOutcomeClass; provider: string; detail: string}[];
  coverage: {
    literatureAttempts: number;
    literatureHits: number;
    openTargetsAttempts: number;
    openTargetsHits: number;
    cacheHits: number;
    truncated: boolean;
    partial: boolean;
    providerUnavailable: boolean;
    invalidQuery: boolean;
    permissionBlocked: boolean;
    overallOutcome: RetrievalOutcomeClass;
  };
  honesty: {
    metadataOnly: true;
    claimSupport: ClaimSupportState;
    sourceIdentityDistinctFromClaimSupport: true;
    passageImportFailClosed: true;
    humanCleared: false;
    scientificApproval: false;
    graphPromotable: false;
    gateCAutoApprove: false;
    legalBinding: false;
    cdsPhi: false;
    fixturesAreNotLiveEvidence: true;
    openTargetsNotIndependentEuropePmcCorroboration: true;
  };
  searchRecordHash?: string;
};

export type DynamicRetrievalResult = {
  ok: boolean;
  record: DynamicSearchRecord;
};

type CacheEntry = {
  storedAtMs: number;
  result: BibliographicLookupResult | OpenTargetsLookupResult;
};

export type DynamicRetrievalCache = {
  get(key: string): CacheEntry | undefined;
  set(key: string, entry: CacheEntry): void;
};

export function createMemoryRetrievalCache(): DynamicRetrievalCache {
  const map = new Map<string, CacheEntry>();
  return {
    get: (key) => map.get(key),
    set: (key, entry) => {
      map.set(key, entry);
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sealRecord(body: Omit<DynamicSearchRecord, "searchRecordHash">): DynamicSearchRecord {
  const searchRecordHash = createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
  return {...body, searchRecordHash};
}

function uniquePreserve(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function extractDiseaseIds(text: string): string[] {
  const matches = text.matchAll(/\b(?:MONDO|EFO)[:_]\d{7}\b/gi);
  return uniquePreserve([...matches].map((m) => assertValidOpenTargetsDiseaseId(m[0]!)));
}

function extractPmids(text: string): string[] {
  const matches = text.matchAll(/\bPMID[:\s-]*([1-9]\d{0,8})\b/gi);
  const bare = text.matchAll(/\b([1-9]\d{6,8})\b/g);
  const out: string[] = [];
  for (const m of matches) out.push(assertValidPmid(m[1]!));
  // Bare long numeric tokens are ambiguous — record as ambiguity, do not auto-pin.
  for (const m of bare) {
    if (m[1] && m[1].length >= 7) {
      /* leave for ambiguity reporting only */
    }
  }
  return uniquePreserve(out);
}

function extractDois(text: string): string[] {
  const matches = text.matchAll(/\b(10\.\d{4,9}\/[^\s]+)/gi);
  const out: string[] = [];
  for (const m of matches) {
    try {
      out.push(assertValidDoi(m[1]!));
    } catch {
      /* skip malformed */
    }
  }
  return uniquePreserve(out);
}

export function validateResearcherQuery(input: ResearcherQueryInput): {
  ok: true;
  question: string;
  pageSize: number;
  ordering: DynamicSearchRecord["ordering"];
  synonyms: string[];
  contentAccess: DynamicContentAccessRequest;
} | {
  ok: false;
  outcome: "invalid_query" | "permission_licence_restriction";
  detail: string;
} {
  if (!input || typeof input !== "object") {
    return {ok: false, outcome: "invalid_query", detail: "Query input missing"};
  }
  if (typeof input.question !== "string" || /[\x00-\x1f]/.test(input.question)) {
    return {ok: false, outcome: "invalid_query", detail: "Question contains control characters"};
  }
  const question = input.question.trim().replace(/\s+/g, " ");
  if (!question || question.length > DYNAMIC_QUESTION_MAX_CHARS) {
    return {ok: false, outcome: "invalid_query", detail: "Question missing or too long"};
  }
  const contentAccess = input.contentAccess ?? "metadata";
  if (contentAccess !== "metadata" && contentAccess !== "abstract" && contentAccess !== "licensed_full_text") {
    return {ok: false, outcome: "invalid_query", detail: "Invalid contentAccess request"};
  }
  if (contentAccess !== "metadata") {
    return {
      ok: false,
      outcome: "permission_licence_restriction",
      detail:
        "PR 2 retrieves permitted metadata only. Abstract/full-text import requires verified reuse rights (human queue #2).",
    };
  }
  let pageSize: number;
  try {
    pageSize = assertValidEuropePmcPageSize(input.pageSize ?? 10);
    assertValidOpenTargetsAssociationPageSize(Math.min(pageSize, 25));
  } catch (error) {
    return {
      ok: false,
      outcome: "invalid_query",
      detail: error instanceof Error ? error.message : "Invalid page size",
    };
  }
  const ordering = input.ordering ?? "provider_default";
  if (ordering !== "relevance" && ordering !== "date_desc" && ordering !== "provider_default") {
    return {ok: false, outcome: "invalid_query", detail: "Invalid ordering"};
  }
  const synonyms: string[] = [];
  if (input.synonyms) {
    if (!Array.isArray(input.synonyms) || input.synonyms.length > 20) {
      return {ok: false, outcome: "invalid_query", detail: "Invalid synonyms list"};
    }
    for (const s of input.synonyms) {
      if (typeof s !== "string" || !s.trim() || s.trim().length > DYNAMIC_TERM_MAX_CHARS || /[\x00-\x1f]/.test(s)) {
        return {ok: false, outcome: "invalid_query", detail: "Invalid synonym token"};
      }
      synonyms.push(s.trim().replace(/\s+/g, " "));
    }
  }
  return {ok: true, question, pageSize, ordering, synonyms: uniquePreserve(synonyms), contentAccess};
}

export function clarifyResearcherEntities(input: {
  question: string;
  entities?: ResearcherQueryInput["entities"];
}): NormalisedEntityBundle {
  const ambiguities: string[] = [];
  const fromQuestionDisease = extractDiseaseIds(input.question);
  const fromQuestionPmid = extractPmids(input.question);
  const fromQuestionDoi = extractDois(input.question);

  const diseaseIds: string[] = [...fromQuestionDisease];
  const pmids: string[] = [...fromQuestionPmid];
  const dois: string[] = [...fromQuestionDoi];
  const freeTextTerms: string[] = [];

  const supplied = input.entities;
  if (supplied?.diseaseIds) {
    for (const raw of supplied.diseaseIds.slice(0, DYNAMIC_MAX_ENTITY_IDS)) {
      try {
        diseaseIds.push(assertValidOpenTargetsDiseaseId(raw));
      } catch {
        ambiguities.push(`invalid_disease_id:${raw}`);
      }
    }
  }
  if (supplied?.pmids) {
    for (const raw of supplied.pmids.slice(0, DYNAMIC_MAX_ENTITY_IDS)) {
      try {
        pmids.push(assertValidPmid(raw));
      } catch {
        ambiguities.push(`invalid_pmid:${raw}`);
      }
    }
  }
  if (supplied?.dois) {
    for (const raw of supplied.dois.slice(0, DYNAMIC_MAX_ENTITY_IDS)) {
      try {
        dois.push(assertValidDoi(raw));
      } catch {
        ambiguities.push(`invalid_doi:${raw}`);
      }
    }
  }
  if (supplied?.freeTextTerms) {
    for (const raw of supplied.freeTextTerms.slice(0, DYNAMIC_MAX_ENTITY_IDS)) {
      const term = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
      if (!term || term.length > DYNAMIC_TERM_MAX_CHARS || /[\x00-\x1f]/.test(term)) {
        ambiguities.push(`invalid_free_text_term`);
        continue;
      }
      freeTextTerms.push(term.replace(/[()]/g, " ").trim());
    }
  }

  // Strip known identifier tokens from residual free-text search seed.
  let residual = input.question;
  for (const id of [...diseaseIds, ...pmids, ...dois]) {
    residual = residual.replace(new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), " ");
  }
  residual = residual
    .replace(/\bPMID[:\s-]*[1-9]\d{0,8}\b/gi, " ")
    .replace(/\b(?:MONDO|EFO)[:_]\d{7}\b/gi, " ")
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (residual.length >= 3 && residual.length <= DYNAMIC_TERM_MAX_CHARS) {
    freeTextTerms.push(residual);
  } else if (residual.length > DYNAMIC_TERM_MAX_CHARS) {
    freeTextTerms.push(residual.slice(0, DYNAMIC_TERM_MAX_CHARS));
    ambiguities.push("question_truncated_for_search_term");
  }

  if (diseaseIds.length > DYNAMIC_MAX_ENTITY_IDS) {
    ambiguities.push("disease_ids_truncated");
  }
  if (pmids.length === 0 && dois.length === 0 && diseaseIds.length === 0 && freeTextTerms.length === 0) {
    ambiguities.push("no_searchable_entities_or_terms");
  }
  if (/\b([1-9]\d{6,8})\b/.test(input.question) && fromQuestionPmid.length === 0) {
    ambiguities.push("bare_numeric_token_not_auto_treated_as_pmid");
  }

  return {
    diseaseIds: uniquePreserve(diseaseIds).slice(0, DYNAMIC_MAX_ENTITY_IDS),
    freeTextTerms: uniquePreserve(freeTextTerms).slice(0, DYNAMIC_MAX_ENTITY_IDS),
    pmids: uniquePreserve(pmids).slice(0, DYNAMIC_MAX_ENTITY_IDS),
    dois: uniquePreserve(dois).slice(0, DYNAMIC_MAX_ENTITY_IDS),
    ambiguities,
    unpinned: true,
  };
}

function mapProviderFailOutcome(
  outcome: BibliographicLookupResult extends {ok: false; outcome: infer O} ? O : never,
): RetrievalOutcomeClass {
  return outcome;
}

function mapOpenTargetsFailOutcome(
  outcome: OpenTargetsLookupResult extends {ok: false; outcome: infer O} ? O : never,
): RetrievalOutcomeClass {
  return outcome;
}

function sourceIdentityForPinnedHit(input: {
  requestedId: string;
  kind: "pmid" | "doi";
  records: BibliographicRecord[];
}): SourceIdentityState {
  if (input.records.length === 0) return "unresolved";
  if (input.kind === "pmid") {
    return input.records.some((r) => r.pmid === input.requestedId) ? "verified" : "unresolved";
  }
  return input.records.some((r) => r.doi === input.requestedId) ? "verified" : "unresolved";
}

function toPermittedBibliographic(
  record: BibliographicRecord,
  sourceIdentity: SourceIdentityState,
  duplicateOfPmid: string | null,
): PermittedBibliographicMetadata {
  return {
    provider: "europe_pmc",
    pmid: record.pmid,
    doi: record.doi,
    title: record.title,
    journal: record.journal,
    publicationYear: record.publicationYear,
    url: record.url,
    retrievedAt: record.retrievedAt,
    responseIdentity: record.responseIdentity,
    sourceIdentity,
    contentAccess: "metadata",
    claimSupport: "not_assessed",
    scientificApproval: false,
    graphPromotable: false,
    passageImported: false,
    identityLayer: "provider_record",
    duplicateOfPmid,
  };
}

function buildLiteratureQuery(entities: NormalisedEntityBundle, synonyms: string[]): string | null {
  const parts: string[] = [];
  for (const term of entities.freeTextTerms) parts.push(`(${term})`);
  for (const syn of synonyms) parts.push(`(${syn.replace(/[()]/g, " ").trim()})`);
  if (parts.length === 0) return null;
  const joined = parts.join(" OR ");
  try {
    return assertValidEuropePmcSearchQuery(joined);
  } catch {
    return null;
  }
}

function classifyOverall(input: {
  attempts: DynamicQueryAttempt[];
  bibliographicCount: number;
  openTargetsCount: number;
  invalidQuery: boolean;
  permissionBlocked: boolean;
}): RetrievalOutcomeClass {
  if (input.permissionBlocked) return "permission_licence_restriction";
  if (input.invalidQuery) return "invalid_query";
  const outcomes = input.attempts.map((a) => a.outcome);
  if (outcomes.includes("provider_unavailable")) return "provider_unavailable";
  if (outcomes.some((o) => o === "timeout_or_network" || o === "provider_http_error" || o === "invalid_response" || o === "oversized_response")) {
    if (input.bibliographicCount > 0 || input.openTargetsCount > 0) return "partial_retrieval";
    return outcomes.find((o) => o !== "successful_empty" && o !== "successful_hits" && o !== "truncated_by_budget" && o !== "disease_not_found")
      ?? "partial_retrieval";
  }
  if (outcomes.includes("truncated_by_budget")) return "truncated_by_budget";
  if (outcomes.includes("partial_retrieval")) return "partial_retrieval";
  if (input.bibliographicCount > 0 || input.openTargetsCount > 0) return "successful_hits";
  if (outcomes.includes("disease_not_found") && outcomes.every((o) => o === "disease_not_found" || o === "successful_empty")) {
    return "disease_not_found";
  }
  return "successful_empty";
}

/**
 * Run dynamic retrieval for an unpinned researcher question.
 * Persists nothing to Neon — returns permitted metadata + search record for PR 3 persistence.
 */
export async function runDynamicEvidenceRetrieval(input: {
  query: ResearcherQueryInput;
  fetcher?: typeof fetch;
  now?: () => Date;
  signal?: AbortSignal;
  cache?: DynamicRetrievalCache;
  rateLimitMs?: number;
  /** Injected clock for cache TTL tests. */
  nowMs?: () => number;
}): Promise<DynamicRetrievalResult> {
  const now = input.now ?? (() => new Date());
  const nowMs = input.nowMs ?? (() => Date.now());
  const startedAt = now().toISOString();
  const rateLimitMs = input.rateLimitMs ?? DYNAMIC_RATE_LIMIT_MS;
  const cache = input.cache ?? createMemoryRetrievalCache();

  const validated = validateResearcherQuery(input.query);
  if (!validated.ok) {
    const completedAt = now().toISOString();
    const record = sealRecord({
      schemaVersion: DYNAMIC_SEARCH_RECORD_SCHEMA,
      method: DYNAMIC_RETRIEVAL_METHOD,
      question: typeof input.query?.question === "string" ? input.query.question : "",
      normalisedEntities: {
        diseaseIds: [],
        freeTextTerms: [],
        pmids: [],
        dois: [],
        ambiguities: [validated.detail],
        unpinned: true,
      },
      synonyms: [],
      ordering: "provider_default",
      filters: {contentAccess: "metadata", europePmcResultType: "core", metadataOnly: true},
      pagination: {pageSize: 0, rateLimitMs},
      timestamps: {startedAt, completedAt},
      providerVersions: {europePmc: "europepmc_rest_search", openTargets: OPEN_TARGETS_PROVIDER},
      queriesSent: [],
      retrievedBibliographic: [],
      retrievedOpenTargets: [],
      excluded: [{reason: validated.outcome, detail: validated.detail}],
      deduped: [],
      failures: [{outcome: validated.outcome, provider: "local_validation", detail: validated.detail}],
      coverage: {
        literatureAttempts: 0,
        literatureHits: 0,
        openTargetsAttempts: 0,
        openTargetsHits: 0,
        cacheHits: 0,
        truncated: false,
        partial: false,
        providerUnavailable: false,
        invalidQuery: validated.outcome === "invalid_query",
        permissionBlocked: validated.outcome === "permission_licence_restriction",
        overallOutcome: validated.outcome,
      },
      honesty: {
        metadataOnly: true,
        claimSupport: "not_assessed",
        sourceIdentityDistinctFromClaimSupport: true,
        passageImportFailClosed: true,
        humanCleared: false,
        scientificApproval: false,
        graphPromotable: false,
        gateCAutoApprove: false,
        legalBinding: false,
        cdsPhi: false,
        fixturesAreNotLiveEvidence: true,
        openTargetsNotIndependentEuropePmcCorroboration: true,
      },
    });
    return {ok: false, record};
  }

  const entities = clarifyResearcherEntities({
    question: validated.question,
    entities: input.query.entities,
  });

  const attempts: DynamicQueryAttempt[] = [];
  const bibliographic: PermittedBibliographicMetadata[] = [];
  const openTargetsMeta: PermittedOpenTargetsMetadata[] = [];
  const excluded: {reason: string; detail: string}[] = [];
  const failures: {outcome: RetrievalOutcomeClass; provider: string; detail: string}[] = [];
  const seenPmids = new Map<string, string>();
  const deduped: DynamicSearchRecord["deduped"] = [];
  let cacheHits = 0;
  let callIndex = 0;

  const pace = async () => {
    if (callIndex > 0 && rateLimitMs > 0) await sleep(rateLimitMs);
    callIndex += 1;
  };

  const runEuropePmc = async (args: {
    query: string;
    purpose: DynamicQueryAttempt["purpose"];
    requestedExternalId: string | null;
    pageSize: number;
  }) => {
    const cacheKey = `epmc:${args.query}:ps=${args.pageSize}`;
    const cached = cache.get(cacheKey);
    let result: BibliographicLookupResult;
    let cacheStatus: "miss" | "hit" = "miss";
    if (cached && nowMs() - cached.storedAtMs <= DYNAMIC_CACHE_TTL_MS) {
      result = cached.result as BibliographicLookupResult;
      cacheStatus = "hit";
      cacheHits += 1;
    } else {
      await pace();
      result = await searchEuropePmcByQuery({
        query: args.query,
        pageSize: args.pageSize,
        fetcher: input.fetcher,
        now,
        signal: input.signal,
      });
      cache.set(cacheKey, {storedAtMs: nowMs(), result});
    }

    if (!result.ok) {
      const outcome = mapProviderFailOutcome(result.outcome);
      attempts.push({
        provider: "europe_pmc",
        query: args.query,
        purpose: args.purpose,
        requestedExternalId: args.requestedExternalId,
        sourceIdentity: args.requestedExternalId ? "unresolved" : "unresolved",
        cacheStatus,
        outcome,
        retrievedAt: result.retrievedAt,
        httpStatus: result.httpStatus,
        responseIdentity: null,
        detail: result.detail,
        hitCount: null,
        returnedCount: 0,
        truncatedByPageBudget: false,
        pageSize: args.pageSize,
      });
      failures.push({outcome, provider: "europe_pmc", detail: result.detail});
      return;
    }

    let sourceIdentity: SourceIdentityState = "unresolved";
    if (args.purpose === "pmid_identity" && args.requestedExternalId) {
      sourceIdentity = sourceIdentityForPinnedHit({
        requestedId: args.requestedExternalId,
        kind: "pmid",
        records: result.records,
      });
    } else if (args.purpose === "doi_identity" && args.requestedExternalId) {
      sourceIdentity = sourceIdentityForPinnedHit({
        requestedId: args.requestedExternalId,
        kind: "doi",
        records: result.records,
      });
    } else if (result.records.length > 0) {
      // Search hits: provider returned concrete records; identity verified at record layer.
      sourceIdentity = "verified";
    }

    const outcome: RetrievalOutcomeClass = result.truncatedByPageBudget
      ? "truncated_by_budget"
      : result.records.length === 0
        ? "successful_empty"
        : "successful_hits";

    attempts.push({
      provider: "europe_pmc",
      query: args.query,
      purpose: args.purpose,
      requestedExternalId: args.requestedExternalId,
      sourceIdentity,
      cacheStatus,
      outcome,
      retrievedAt: result.retrievedAt,
      httpStatus: result.httpStatus,
      responseIdentity: result.responseIdentity,
      detail: null,
      hitCount: result.hitCount,
      returnedCount: result.records.length,
      truncatedByPageBudget: result.truncatedByPageBudget,
      pageSize: result.pageSize,
    });

    for (const row of result.records) {
      if (row.pmid && seenPmids.has(row.pmid)) {
        const kept = seenPmids.get(row.pmid)!;
        const existing = deduped.find((d) => d.pmid === row.pmid);
        if (existing) existing.droppedCount += 1;
        else deduped.push({pmid: row.pmid, keptResponseIdentity: kept, droppedCount: 1});
        bibliographic.push(toPermittedBibliographic(row, sourceIdentity, row.pmid));
        continue;
      }
      if (row.pmid) seenPmids.set(row.pmid, row.responseIdentity);
      bibliographic.push(toPermittedBibliographic(row, sourceIdentity, null));
    }
  };

  const runOpenTargets = async (diseaseId: string, pageSize: number) => {
    const cacheKey = `ot:${diseaseId}:ps=${pageSize}`;
    const cached = cache.get(cacheKey);
    let result: OpenTargetsLookupResult;
    let cacheStatus: "miss" | "hit" = "miss";
    if (cached && nowMs() - cached.storedAtMs <= DYNAMIC_CACHE_TTL_MS) {
      result = cached.result as OpenTargetsLookupResult;
      cacheStatus = "hit";
      cacheHits += 1;
    } else {
      await pace();
      result = await lookupOpenTargetsDiseaseAssociations({
        diseaseId,
        pageSize,
        fetcher: input.fetcher,
        now,
        signal: input.signal,
      });
      cache.set(cacheKey, {storedAtMs: nowMs(), result});
    }

    if (!result.ok) {
      const outcome = mapOpenTargetsFailOutcome(result.outcome);
      attempts.push({
        provider: OPEN_TARGETS_PROVIDER,
        query: result.query,
        purpose: "disease_associations",
        requestedExternalId: diseaseId,
        sourceIdentity: result.outcome === "disease_not_found" ? "unresolved" : "unresolved",
        cacheStatus,
        outcome,
        retrievedAt: result.retrievedAt,
        httpStatus: result.httpStatus,
        responseIdentity: null,
        detail: result.detail,
        hitCount: null,
        returnedCount: 0,
        truncatedByPageBudget: false,
        pageSize,
      });
      failures.push({outcome, provider: OPEN_TARGETS_PROVIDER, detail: result.detail});
      return;
    }

    const outcome: RetrievalOutcomeClass = result.truncatedByPageBudget
      ? "truncated_by_budget"
      : result.record.associations.length === 0 && result.record.associationCount === 0
        ? "successful_empty"
        : "successful_hits";

    attempts.push({
      provider: OPEN_TARGETS_PROVIDER,
      query: result.query,
      purpose: "disease_associations",
      requestedExternalId: diseaseId,
      sourceIdentity: result.sourceIdentity,
      cacheStatus,
      outcome,
      retrievedAt: result.retrievedAt,
      httpStatus: result.httpStatus,
      responseIdentity: result.responseIdentity,
      detail: null,
      hitCount: result.record.associationCount,
      returnedCount: result.record.associations.length,
      truncatedByPageBudget: result.truncatedByPageBudget,
      pageSize: result.pageSize,
    });

    openTargetsMeta.push({
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId: result.record.diseaseId,
      diseaseName: result.record.diseaseName,
      associationCount: result.record.associationCount,
      associationSymbols: result.record.associations.map((a) => a.approvedSymbol),
      retrievedAt: result.record.retrievedAt,
      responseIdentity: result.record.responseIdentity,
      sourceIdentity: result.sourceIdentity,
      contentAccess: "metadata",
      claimSupport: "not_assessed",
      scientificApproval: false,
      graphPromotable: false,
      passageImported: false,
      independentCorroborationOfEuropePmc: false,
      identityLayer: "provider_record",
    });
  };

  // Optional identity lookups when the question/entities name concrete ids.
  for (const pmid of entities.pmids) {
    await runEuropePmc({
      query: `EXT_ID:${pmid} AND SRC:MED`,
      purpose: "pmid_identity",
      requestedExternalId: pmid,
      pageSize: Math.min(2, validated.pageSize),
    });
  }
  for (const doi of entities.dois) {
    await runEuropePmc({
      query: `DOI:"${doi}"`,
      purpose: "doi_identity",
      requestedExternalId: doi,
      pageSize: Math.min(5, validated.pageSize),
    });
  }

  const literatureQuery = buildLiteratureQuery(entities, validated.synonyms);
  if (literatureQuery) {
    await runEuropePmc({
      query: literatureQuery,
      purpose: "literature_search",
      requestedExternalId: null,
      pageSize: validated.pageSize,
    });
  } else if (entities.pmids.length === 0 && entities.dois.length === 0 && entities.diseaseIds.length === 0) {
    excluded.push({
      reason: "invalid_query",
      detail: "No searchable literature terms after entity clarification",
    });
    failures.push({
      outcome: "invalid_query",
      provider: "local_validation",
      detail: "No searchable literature terms after entity clarification",
    });
  }

  for (const diseaseId of entities.diseaseIds) {
    await runOpenTargets(diseaseId, Math.min(validated.pageSize, 25));
  }

  for (const a of entities.ambiguities) {
    excluded.push({reason: "ambiguity", detail: a});
  }

  const completedAt = now().toISOString();
  const literatureAttempts = attempts.filter((a) => a.provider === "europe_pmc").length;
  const openTargetsAttempts = attempts.filter((a) => a.provider === OPEN_TARGETS_PROVIDER).length;
  const invalidQuery = failures.some((f) => f.outcome === "invalid_query");
  const permissionBlocked = failures.some((f) => f.outcome === "permission_licence_restriction");
  const overallOutcome = classifyOverall({
    attempts,
    bibliographicCount: bibliographic.filter((b) => b.duplicateOfPmid === null).length,
    openTargetsCount: openTargetsMeta.length,
    invalidQuery,
    permissionBlocked,
  });

  const record = sealRecord({
    schemaVersion: DYNAMIC_SEARCH_RECORD_SCHEMA,
    method: DYNAMIC_RETRIEVAL_METHOD,
    question: validated.question,
    normalisedEntities: entities,
    synonyms: validated.synonyms,
    ordering: validated.ordering,
    filters: {contentAccess: "metadata", europePmcResultType: "core", metadataOnly: true},
    pagination: {pageSize: validated.pageSize, rateLimitMs},
    timestamps: {startedAt, completedAt},
    providerVersions: {europePmc: "europepmc_rest_search", openTargets: OPEN_TARGETS_PROVIDER},
    queriesSent: attempts,
    retrievedBibliographic: bibliographic,
    retrievedOpenTargets: openTargetsMeta,
    excluded,
    deduped,
    failures,
    coverage: {
      literatureAttempts,
      literatureHits: bibliographic.filter((b) => b.duplicateOfPmid === null).length,
      openTargetsAttempts,
      openTargetsHits: openTargetsMeta.length,
      cacheHits,
      truncated: attempts.some((a) => a.truncatedByPageBudget),
      partial: overallOutcome === "partial_retrieval",
      providerUnavailable: overallOutcome === "provider_unavailable",
      invalidQuery,
      permissionBlocked,
      overallOutcome,
    },
    honesty: {
      metadataOnly: true,
      claimSupport: "not_assessed",
      sourceIdentityDistinctFromClaimSupport: true,
      passageImportFailClosed: true,
      humanCleared: false,
      scientificApproval: false,
      graphPromotable: false,
      gateCAutoApprove: false,
      legalBinding: false,
      cdsPhi: false,
      fixturesAreNotLiveEvidence: true,
      openTargetsNotIndependentEuropePmcCorroboration: true,
    },
  });

  const ok =
    !record.coverage.providerUnavailable &&
    !record.coverage.invalidQuery &&
    !record.coverage.permissionBlocked &&
    (record.coverage.literatureHits > 0 || record.coverage.openTargetsHits > 0 || record.coverage.overallOutcome === "successful_empty");

  return {ok, record};
}

/** Project permitted bibliographic metadata into source-registry import shape (no Neon write). */
export function projectPermittedMetadataForRegistryImport(
  record: DynamicSearchRecord,
): {
  schemaVersion: "hsi-source-metadata-import-1";
  provider: "europe_pmc";
  retrievedAt: string;
  claimSupport: "not_assessed";
  records: {pmid: string; title: string; doi: string | null; publishedAt: null; licence: null; retractionStatus: "unknown"}[];
} {
  const rows = record.retrievedBibliographic.filter((r) => r.pmid && r.duplicateOfPmid === null);
  return {
    schemaVersion: "hsi-source-metadata-import-1",
    provider: "europe_pmc",
    retrievedAt: record.timestamps.completedAt,
    claimSupport: "not_assessed",
    records: rows.map((r) => ({
      pmid: r.pmid!,
      title: r.title,
      doi: r.doi,
      publishedAt: null,
      licence: null,
      retractionStatus: "unknown" as const,
    })),
  };
}
