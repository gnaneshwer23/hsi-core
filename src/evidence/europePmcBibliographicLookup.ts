/**
 * N1 general biomedical bibliographic lookup via Europe PMC.
 * Not SSc-scoped authority. Metadata retrieval is not claim support, rights clearance or graph approval.
 */
import {createHash} from "node:crypto";

export const EUROPE_PMC_SEARCH_ENDPOINT = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";

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

export function parseEuropePmcBibliographicPayload(input: {
  query: string;
  bodyText: string;
  httpStatus: number;
  retrievedAt: string;
}): BibliographicLookupResult {
  const {query, bodyText, httpStatus, retrievedAt} = input;
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
  return {
    ok: true,
    provider: "europe_pmc",
    query,
    retrievedAt,
    httpStatus,
    responseIdentity: identity,
    records: parseRecords(list, retrievedAt, identity),
  };
}

/** Lookup by DOI. Does not grant claim support, rights or scientific approval. */
export async function lookupEuropePmcByDoi(input: {
  doi: string;
  fetcher?: typeof fetch;
  now?: () => Date;
  signal?: AbortSignal;
}): Promise<BibliographicLookupResult> {
  const doi = assertValidDoi(input.doi);
  const query = `DOI:"${doi}"`;
  const params = new URLSearchParams({
    query,
    format: "json",
    resultType: "core",
    pageSize: "5",
  });
  const retrievedAt = (input.now ?? (() => new Date()))().toISOString();
  try {
    const response = await (input.fetcher ?? fetch)(`${EUROPE_PMC_SEARCH_ENDPOINT}?${params}`, {
      headers: {Accept: "application/json"},
      signal: input.signal,
    });
    const bodyText = await response.text();
    return parseEuropePmcBibliographicPayload({
      query,
      bodyText,
      httpStatus: response.status,
      retrievedAt,
    });
  } catch (error) {
    return {
      ok: false,
      provider: "europe_pmc",
      query,
      retrievedAt,
      outcome: "timeout_or_network",
      httpStatus: null,
      detail: error instanceof Error ? error.message : "Network failure",
    };
  }
}
