/**
 * N1 general biomedical bibliographic lookup via Europe PMC.
 * Not SSc-scoped authority. Metadata retrieval is not claim support, rights clearance or graph approval.
 */
import type { FetchLike } from "../fetchLike";
import {createHash} from "node:crypto";

export const EUROPE_PMC_SEARCH_ENDPOINT = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";
/** Provider-version token for cache keys / search records (cursorMark-capable REST search). */
export const EUROPE_PMC_PROVIDER_VERSION = "europepmc_rest_search_cursor_v1" as const;
/** First-page cursorMark value required by Europe PMC search. */
export const EUROPE_PMC_CURSOR_MARK_START = "*" as const;

export type BibliographicProvider = "europe_pmc";

export type BibliographicYn = "Y" | "N" | null;

/** Provider-reported reuse signals. Observation ≠ HSI passage clearance. */
export type BibliographicRightsSignals = {
  isOpenAccess: BibliographicYn;
  inEPMC: BibliographicYn;
  inPMC: BibliographicYn;
  /** Raw Europe PMC `license` label when present (e.g. `cc by`); not a cleared URI. */
  providerLicenseLabel: string | null;
};

export type BibliographicRecord = {
  provider: BibliographicProvider;
  sourceId: string;
  sourceType: string;
  pmid: string | null;
  pmcid: string | null;
  doi: string | null;
  title: string;
  authors: string | null;
  journal: string | null;
  publicationYear: number | null;
  isRetracted: boolean | null;
  /** Provider publication types (for example a published erratum); used by source integrity checks. Empty when absent. */
  publicationTypes: string[];
  rightsSignals: BibliographicRightsSignals;
  url: string;
  retrievedAt: string;
  responseIdentity: string;
  verificationState: "metadata_retrieved_not_claim_verified";
  reviewState: "unreviewed";
  scientificApproval: false;
  graphPromotable: false;
};

export type BibliographicLookupOk = {
  ok: true;
  provider: BibliographicProvider;
  query: string;
  retrievedAt: string;
  httpStatus: number;
  responseIdentity: string;
  records: BibliographicRecord[];
  /** Provider hitCount when present; null if absent from payload. */
  hitCount: number | null;
  /** True when hitCount exceeds returned page (bounded pageSize) or more pages remain. */
  truncatedByPageBudget: boolean;
  pageSize: number;
  /** Cursor used for this request (`*` for the first page). */
  cursorMark: string;
  /**
   * Next cursor from the provider. Null when absent, equal to the request cursor,
   * or when no further page should be requested.
   */
  nextCursorMark: string | null;
  providerVersion: typeof EUROPE_PMC_PROVIDER_VERSION;
};

export type BibliographicLookupFail = {
  ok: false;
  provider: BibliographicProvider;
  query: string;
  retrievedAt: string;
  outcome:
    | "provider_http_error"
    | "provider_unavailable"
    | "invalid_response"
    | "oversized_response"
    | "timeout_or_network";
  httpStatus: number | null;
  detail: string;
};

export type BibliographicLookupResult = BibliographicLookupOk | BibliographicLookupFail;

type EpmcResult = {
  id?: unknown;
  source?: unknown;
  pmid?: unknown;
  pmcid?: unknown;
  doi?: unknown;
  title?: unknown;
  authorString?: unknown;
  journalTitle?: unknown;
  pubYear?: unknown;
  isRetracted?: unknown;
  pubTypeList?: unknown;
  isOpenAccess?: unknown;
  inEPMC?: unknown;
  inPMC?: unknown;
  license?: unknown;
};

function stringOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function publicationYear(v: unknown): number | null {
  const year = typeof v === "string" && /^\d{4}$/.test(v) ? Number(v) : null;
  return year !== null && year >= 1800 && year <= 2200 ? year : null;
}

function ynFlag(v: unknown): BibliographicYn {
  if (v === "Y" || v === "N") return v;
  return null;
}

function publicationTypesOf(v: unknown): string[] {
  const list = (v as {pubType?: unknown} | null | undefined)?.pubType;
  const items = Array.isArray(list) ? list : typeof list === "string" ? [list] : [];
  return items.filter((t): t is string => typeof t === "string" && t.trim().length > 0 && t.length <= 100).map((t) => t.trim()).slice(0, 20);
}

function providerLicenseLabel(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const label = v.trim().toLowerCase().replace(/\s+/g, " ");
  if (!label || label.length > 64 || !/^[a-z0-9 .+\-]+$/.test(label)) return null;
  return label;
}

function rightsSignalsOf(item: EpmcResult): BibliographicRightsSignals {
  return {
    isOpenAccess: ynFlag(item.isOpenAccess),
    inEPMC: ynFlag(item.inEPMC),
    inPMC: ynFlag(item.inPMC),
    providerLicenseLabel: providerLicenseLabel(item.license),
  };
}

function normalizeDoi(doi: string): string {
  return doi.trim().toLowerCase().replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "");
}

export function assertValidDoi(doi: string): string {
  const normalized = normalizeDoi(doi);
  if (!/^10\.\d{4,9}\/\S+$/.test(normalized) || normalized.length > 256) throw new Error("Invalid DOI");
  return normalized;
}

function responseIdentityOf(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

function parseRecords(list: unknown[], retrievedAt: string, responseIdentity: string): BibliographicRecord[] {
  return list.flatMap((raw): BibliographicRecord[] => {
    const item = raw as EpmcResult;
    const sourceId = stringOrNull(item.id);
    const sourceType = stringOrNull(item.source);
    const title = stringOrNull(item.title);
    if (!sourceId || !sourceType || !title || title.length > 4000) return [];
    const pmid = stringOrNull(item.pmid);
    if (pmid && !/^[1-9]\d{0,8}$/.test(pmid)) return [];
    const doi = stringOrNull(item.doi);
    const retracted = item.isRetracted === "Y" ? true : item.isRetracted === "N" ? false : null;
    return [{
      provider: "europe_pmc",
      sourceId,
      sourceType,
      pmid,
      pmcid: stringOrNull(item.pmcid),
      doi: doi ? normalizeDoi(doi) : null,
      title,
      authors: stringOrNull(item.authorString),
      journal: stringOrNull(item.journalTitle),
      publicationYear: publicationYear(item.pubYear),
      isRetracted: retracted,
      publicationTypes: publicationTypesOf(item.pubTypeList),
      rightsSignals: rightsSignalsOf(item),
      url: `https://europepmc.org/article/${encodeURIComponent(sourceType)}/${encodeURIComponent(sourceId)}`,
      retrievedAt,
      responseIdentity,
      verificationState: "metadata_retrieved_not_claim_verified",
      reviewState: "unreviewed",
      scientificApproval: false,
      graphPromotable: false,
    }];
  });
}

export const EUROPE_PMC_SEARCH_PAGE_SIZE_MIN = 1;
export const EUROPE_PMC_SEARCH_PAGE_SIZE_MAX = 25;
/** Free-text / structured search queries (not only pinned EXT_ID / DOI). */
export const EUROPE_PMC_SEARCH_QUERY_MAX_CHARS = 500;

export function assertValidEuropePmcSearchQuery(query: string): string {
  if (typeof query !== "string" || /[\x00-\x1f]/.test(query)) {
    throw new Error("Invalid Europe PMC search query control characters");
  }
  const trimmed = query.trim().replace(/\s+/g, " ");
  if (!trimmed || trimmed.length > EUROPE_PMC_SEARCH_QUERY_MAX_CHARS) {
    throw new Error("Invalid Europe PMC search query length");
  }
  return trimmed;
}

export function assertValidEuropePmcPageSize(pageSize: number): number {
  if (!Number.isInteger(pageSize) || pageSize < EUROPE_PMC_SEARCH_PAGE_SIZE_MIN || pageSize > EUROPE_PMC_SEARCH_PAGE_SIZE_MAX) {
    throw new Error(`Invalid Europe PMC page size (allowed ${EUROPE_PMC_SEARCH_PAGE_SIZE_MIN}–${EUROPE_PMC_SEARCH_PAGE_SIZE_MAX})`);
  }
  return pageSize;
}

export function assertValidEuropePmcCursorMark(cursorMark: string): string {
  if (typeof cursorMark !== "string" || /[\x00-\x1f]/.test(cursorMark)) {
    throw new Error("Invalid Europe PMC cursorMark control characters");
  }
  const trimmed = cursorMark.trim();
  if (!trimmed || trimmed.length > 256) {
    throw new Error("Invalid Europe PMC cursorMark length");
  }
  return trimmed;
}

export function parseEuropePmcBibliographicPayload(input: {
  query: string;
  bodyText: string;
  httpStatus: number;
  retrievedAt: string;
  pageSize?: number;
  cursorMark?: string;
}): BibliographicLookupResult {
  const {query, bodyText, httpStatus, retrievedAt} = input;
  const pageSize = input.pageSize ?? EUROPE_PMC_SEARCH_PAGE_SIZE_MAX;
  const cursorMark = assertValidEuropePmcCursorMark(input.cursorMark ?? EUROPE_PMC_CURSOR_MARK_START);
  if (httpStatus === 403 || httpStatus === 401) {
    return {ok: false, provider: "europe_pmc", query, retrievedAt, outcome: "provider_unavailable", httpStatus, detail: `Europe PMC blocked or unauthorized (HTTP ${httpStatus})`};
  }
  if (httpStatus < 200 || httpStatus >= 300) {
    return {ok: false, provider: "europe_pmc", query, retrievedAt, outcome: "provider_http_error", httpStatus, detail: `Europe PMC request failed (HTTP ${httpStatus})`};
  }
  if (bodyText.length > 400_000) {
    return {ok: false, provider: "europe_pmc", query, retrievedAt, outcome: "oversized_response", httpStatus, detail: "Oversized provider response"};
  }
  let payload: unknown;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return {ok: false, provider: "europe_pmc", query, retrievedAt, outcome: "invalid_response", httpStatus, detail: "Europe PMC response was not JSON"};
  }
  if (!payload || typeof payload !== "object") {
    return {ok: false, provider: "europe_pmc", query, retrievedAt, outcome: "invalid_response", httpStatus, detail: "Invalid Europe PMC response"};
  }
  const body = payload as Record<string, unknown>;
  const list = body.resultList && typeof body.resultList === "object"
    ? (body.resultList as Record<string, unknown>).result
    : null;
  if (!Array.isArray(list)) {
    return {ok: false, provider: "europe_pmc", query, retrievedAt, outcome: "invalid_response", httpStatus, detail: "Europe PMC result list missing"};
  }
  const identity = responseIdentityOf(bodyText);
  const records = parseRecords(list, retrievedAt, identity);
  const hitCount =
    typeof body.hitCount === "number" && Number.isFinite(body.hitCount) && body.hitCount >= 0
      ? Math.floor(body.hitCount)
      : null;
  const rawNext = stringOrNull(body.nextCursorMark);
  const nextCursorMark = rawNext && rawNext !== cursorMark ? rawNext : null;
  const morePagesRemain = nextCursorMark !== null;
  return {
    ok: true,
    provider: "europe_pmc",
    query,
    retrievedAt,
    httpStatus,
    responseIdentity: identity,
    records,
    hitCount,
    truncatedByPageBudget:
      (hitCount !== null ? hitCount > records.length : false) || morePagesRemain,
    pageSize,
    cursorMark,
    nextCursorMark,
    providerVersion: EUROPE_PMC_PROVIDER_VERSION,
  };
}

export function assertValidPmid(pmid: string): string {
  const id = pmid.trim();
  if (!/^[1-9]\d{0,8}$/.test(id)) throw new Error("Invalid PMID");
  return id;
}

async function lookupEuropePmc(input: {
  query: string;
  pageSize: number;
  cursorMark: string;
  fetcher?: FetchLike;
  now?: () => Date;
  signal?: AbortSignal;
}): Promise<BibliographicLookupResult> {
  const pageSize = assertValidEuropePmcPageSize(input.pageSize);
  const cursorMark = assertValidEuropePmcCursorMark(input.cursorMark);
  const params = new URLSearchParams({
    query: input.query,
    format: "json",
    resultType: "core",
    pageSize: String(pageSize),
    cursorMark,
  });
  const retrievedAt = (input.now ?? (() => new Date()))().toISOString();
  try {
    const response = await (input.fetcher ?? fetch)(`${EUROPE_PMC_SEARCH_ENDPOINT}?${params}`, {
      headers: {Accept: "application/json"},
      signal: input.signal,
    });
    const bodyText = await response.text();
    return parseEuropePmcBibliographicPayload({
      query: input.query,
      bodyText,
      httpStatus: response.status,
      retrievedAt,
      pageSize,
      cursorMark,
    });
  } catch (error) {
    return {
      ok: false,
      provider: "europe_pmc",
      query: input.query,
      retrievedAt,
      outcome: "timeout_or_network",
      httpStatus: null,
      detail: error instanceof Error ? error.message : "Network failure",
    };
  }
}

/**
 * Unpinned / researcher-defined Europe PMC search (metadata only).
 * Does not grant claim support, rights clearance, or scientific approval.
 * Provider failures stay typed — never collapse to an empty hit list.
 * Uses Europe PMC `cursorMark` pagination (`*` then `nextCursorMark`).
 */
export async function searchEuropePmcByQuery(input: {
  query: string;
  pageSize?: number;
  /** Cursor for this page; defaults to `*` (first page). */
  cursorMark?: string;
  fetcher?: FetchLike;
  now?: () => Date;
  signal?: AbortSignal;
}): Promise<BibliographicLookupResult> {
  const query = assertValidEuropePmcSearchQuery(input.query);
  const pageSize = assertValidEuropePmcPageSize(input.pageSize ?? 10);
  const cursorMark = assertValidEuropePmcCursorMark(input.cursorMark ?? EUROPE_PMC_CURSOR_MARK_START);
  return lookupEuropePmc({
    query,
    pageSize,
    cursorMark,
    fetcher: input.fetcher,
    now: input.now,
    signal: input.signal,
  });
}

/** Lookup by DOI. Does not grant claim support, rights or scientific approval. */
export async function lookupEuropePmcByDoi(input: {
  doi: string;
  fetcher?: FetchLike;
  now?: () => Date;
  signal?: AbortSignal;
}): Promise<BibliographicLookupResult> {
  const doi = assertValidDoi(input.doi);
  return lookupEuropePmc({
    query: `DOI:"${doi}"`,
    pageSize: 5,
    cursorMark: EUROPE_PMC_CURSOR_MARK_START,
    fetcher: input.fetcher,
    now: input.now,
    signal: input.signal,
  });
}

/** Lookup by PubMed ID via Europe PMC. Metadata only — not claim support or rights clearance. */
export async function lookupEuropePmcByPmid(input: {
  pmid: string;
  fetcher?: FetchLike;
  now?: () => Date;
  signal?: AbortSignal;
}): Promise<BibliographicLookupResult> {
  const pmid = assertValidPmid(input.pmid);
  return lookupEuropePmc({
    query: `EXT_ID:${pmid} AND SRC:MED`,
    pageSize: 2,
    cursorMark: EUROPE_PMC_CURSOR_MARK_START,
    fetcher: input.fetcher,
    now: input.now,
    signal: input.signal,
  });
}
