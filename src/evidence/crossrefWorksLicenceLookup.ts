/**
 * Crossref works licence observation for N1 rights eng-assist.
 * Records publisher-reported license URLs only. Never invents clearance,
 * never maps unversioned Europe PMC tokens to versioned CC paths, never
 * treats TDM-only rows as passage-reuse permission.
 */
import {createHash} from "node:crypto";
import {assertValidDoi} from "./europePmcBibliographicLookup";

export const CROSSREF_WORKS_ENDPOINT = "https://api.crossref.org/works";

export type CrossrefLicenceContentVersion = "vor" | "unspecified" | "tdm" | "other";

export type CrossrefLicenceObservationRow = {
  contentVersion: CrossrefLicenceContentVersion;
  rawContentVersion: string | null;
  url: string;
  delayInDays: number | null;
};

export type CrossrefWorksLicenceOk = {
  ok: true;
  provider: "crossref_works";
  requestedDoi: string;
  resolvedDoi: string;
  publisher: string | null;
  title: string | null;
  licenses: CrossrefLicenceObservationRow[];
  /** Non-TDM vor/unspecified URLs as Crossref reported them (observation ≠ clearance). */
  candidateEvidenceUrls: string[];
  /** TDM content-version URLs (including any CC URL under TDM-only). */
  tdmUrls: string[];
  creativeCommonsUrlsUnderTdmOnly: string[];
  hasOnlyTdmLicences: boolean;
  hasEmptyLicenceArray: boolean;
  doiRedirected: boolean;
  retrievedAt: string;
  responseIdentity: string;
};

export type CrossrefWorksLicenceFail = {
  ok: false;
  provider: "crossref_works";
  requestedDoi: string;
  retrievedAt: string;
  outcome: "invalid_response" | "doi_mismatch" | "oversized_response";
  detail: string;
};

export type CrossrefWorksLicenceResult = CrossrefWorksLicenceOk | CrossrefWorksLicenceFail;

const MAX_BODY_BYTES = 2_000_000;

function stringOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function normalizeObservedUrl(url: string): string {
  const trimmed = url.trim();
  if (/^http:\/\/creativecommons\.org\//i.test(trimmed)) {
    return `https://${trimmed.slice("http://".length)}`;
  }
  return trimmed;
}

function classifyContentVersion(raw: string | null): CrossrefLicenceContentVersion {
  if (!raw) return "unspecified";
  const v = raw.trim().toLowerCase();
  if (v === "vor") return "vor";
  if (v === "tdm") return "tdm";
  if (v === "unspecified" || v === "") return "unspecified";
  return "other";
}

function isCreativeCommonsUrl(url: string): boolean {
  return /^https?:\/\/creativecommons\.org\//i.test(url);
}

function responseIdentityOf(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

/** Parse a Crossref works JSON body (full or assist-minimal) into licence observations. */
export function parseCrossrefWorksLicencePayload(input: {
  requestedDoi: string;
  bodyText: string;
  retrievedAt: string;
}): CrossrefWorksLicenceResult {
  const requestedDoi = assertValidDoi(input.requestedDoi);
  if (input.bodyText.length > MAX_BODY_BYTES) {
    return {
      ok: false,
      provider: "crossref_works",
      requestedDoi,
      retrievedAt: input.retrievedAt,
      outcome: "oversized_response",
      detail: "Crossref response exceeds size limit",
    };
  }
  let payload: unknown;
  try {
    payload = JSON.parse(input.bodyText) as unknown;
  } catch {
    return {
      ok: false,
      provider: "crossref_works",
      requestedDoi,
      retrievedAt: input.retrievedAt,
      outcome: "invalid_response",
      detail: "Crossref body is not JSON",
    };
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      ok: false,
      provider: "crossref_works",
      requestedDoi,
      retrievedAt: input.retrievedAt,
      outcome: "invalid_response",
      detail: "Crossref body is not an object",
    };
  }
  const root = payload as Record<string, unknown>;
  const message = root.message;
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return {
      ok: false,
      provider: "crossref_works",
      requestedDoi,
      retrievedAt: input.retrievedAt,
      outcome: "invalid_response",
      detail: "Crossref works payload missing message",
    };
  }
  const msg = message as Record<string, unknown>;
  const resolvedRaw = stringOrNull(msg.DOI);
  if (!resolvedRaw) {
    return {
      ok: false,
      provider: "crossref_works",
      requestedDoi,
      retrievedAt: input.retrievedAt,
      outcome: "invalid_response",
      detail: "Crossref message missing DOI",
    };
  }
  const resolvedDoi = assertValidDoi(resolvedRaw);
  // Allow known JCI short-form → long-form redirect; otherwise require exact DOI match.
  const allowedRedirect =
    requestedDoi === "10.1172/jci19246" && resolvedDoi === "10.1172/jci200319246";
  if (resolvedDoi !== requestedDoi && !allowedRedirect) {
    return {
      ok: false,
      provider: "crossref_works",
      requestedDoi,
      retrievedAt: input.retrievedAt,
      outcome: "doi_mismatch",
      detail: `Crossref DOI ${resolvedDoi} differs from requested ${requestedDoi}`,
    };
  }
  const licenseRaw = msg.license;
  const licenses: CrossrefLicenceObservationRow[] = [];
  if (Array.isArray(licenseRaw)) {
    for (const row of licenseRaw) {
      if (!row || typeof row !== "object" || Array.isArray(row)) continue;
      const rec = row as Record<string, unknown>;
      const urlRaw = stringOrNull(rec.URL);
      if (!urlRaw || urlRaw.length > 2048) continue;
      const rawVersion = stringOrNull(rec["content-version"]);
      const delay =
        typeof rec["delay-in-days"] === "number" && Number.isFinite(rec["delay-in-days"])
          ? rec["delay-in-days"]
          : null;
      licenses.push({
        contentVersion: classifyContentVersion(rawVersion),
        rawContentVersion: rawVersion,
        url: normalizeObservedUrl(urlRaw),
        delayInDays: delay,
      });
    }
  } else if (licenseRaw != null) {
    return {
      ok: false,
      provider: "crossref_works",
      requestedDoi,
      retrievedAt: input.retrievedAt,
      outcome: "invalid_response",
      detail: "Crossref license field is not an array",
    };
  }

  const candidateEvidenceUrls: string[] = [];
  const tdmUrls: string[] = [];
  for (const lic of licenses) {
    if (lic.contentVersion === "tdm") {
      tdmUrls.push(lic.url);
      continue;
    }
    if (lic.contentVersion === "vor" || lic.contentVersion === "unspecified") {
      candidateEvidenceUrls.push(lic.url);
    }
  }
  const uniqueCandidates = [...new Set(candidateEvidenceUrls)];
  const uniqueTdm = [...new Set(tdmUrls)];
  const creativeCommonsUrlsUnderTdmOnly =
    uniqueCandidates.length === 0
      ? uniqueTdm.filter((u) => isCreativeCommonsUrl(u))
      : [];
  const titleList = msg.title;
  const title =
    Array.isArray(titleList) && typeof titleList[0] === "string" ? titleList[0] : null;

  return {
    ok: true,
    provider: "crossref_works",
    requestedDoi,
    resolvedDoi,
    publisher: stringOrNull(msg.publisher),
    title,
    licenses,
    candidateEvidenceUrls: uniqueCandidates,
    tdmUrls: uniqueTdm,
    creativeCommonsUrlsUnderTdmOnly,
    hasOnlyTdmLicences: licenses.length > 0 && uniqueCandidates.length === 0,
    hasEmptyLicenceArray: licenses.length === 0,
    doiRedirected: resolvedDoi !== requestedDoi,
    retrievedAt: input.retrievedAt,
    responseIdentity: responseIdentityOf(input.bodyText),
  };
}
