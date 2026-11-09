/**
 * ClinicalTrials.gov API v2 study lookup for N5 public-registry research.
 * Live fetch is metadata/criteria capture only — never eligibility, enrolment, CDS or PHI.
 */
import type { FetchLike } from "../fetchLike";
import {createHash} from "node:crypto";
import {rejectPhiPayload} from "../cdsPhiBoundary";

export const CTGOV_API_V2_BASE = "https://clinicaltrials.gov/api/v2/studies";
export const CTGOV_PROVIDER = "clinicaltrials_gov_api_v2" as const;

const MAX_BODY_BYTES = 400_000;

export type CtgovLookupOk = {
  ok: true;
  provider: typeof CTGOV_PROVIDER;
  nctId: string;
  query: string;
  retrievedAt: string;
  httpStatus: number;
  responseIdentity: string;
  /** Raw API v2 study object (protocolSection at top level). */
  study: Record<string, unknown>;
  bodyText: string;
};

export type CtgovLookupFail = {
  ok: false;
  provider: typeof CTGOV_PROVIDER;
  nctId: string;
  query: string;
  retrievedAt: string;
  outcome:
    | "provider_http_error"
    | "provider_unavailable"
    | "invalid_response"
    | "oversized_response"
    | "timeout_or_network"
    | "phi_shaped_payload_rejected"
    | "nct_mismatch";
  httpStatus: number | null;
  detail: string;
};

export type CtgovLookupResult = CtgovLookupOk | CtgovLookupFail;

export function assertValidNctId(nctId: string): string {
  const id = nctId.trim().toUpperCase();
  if (!/^NCT\d{8}$/.test(id)) throw new Error(`Invalid NCT id: ${nctId}`);
  return id;
}

export function clinicalTrialsGovStudyUrl(nctId: string): string {
  return `${CTGOV_API_V2_BASE}/${assertValidNctId(nctId)}?format=json`;
}

function responseIdentityOf(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

export function parseClinicalTrialsGovStudyPayload(input: {
  nctId: string;
  bodyText: string;
  httpStatus: number;
  retrievedAt: string;
}): CtgovLookupResult {
  const nctId = assertValidNctId(input.nctId);
  const query = clinicalTrialsGovStudyUrl(nctId);
  const {bodyText, httpStatus, retrievedAt} = input;

  if (httpStatus === 401 || httpStatus === 403) {
    return {
      ok: false,
      provider: CTGOV_PROVIDER,
      nctId,
      query,
      retrievedAt,
      outcome: "provider_unavailable",
      httpStatus,
      detail: `ClinicalTrials.gov blocked or unauthorized (HTTP ${httpStatus})`,
    };
  }
  if (httpStatus === 404) {
    return {
      ok: false,
      provider: CTGOV_PROVIDER,
      nctId,
      query,
      retrievedAt,
      outcome: "provider_http_error",
      httpStatus,
      detail: `Study not found (HTTP 404)`,
    };
  }
  if (httpStatus < 200 || httpStatus >= 300) {
    return {
      ok: false,
      provider: CTGOV_PROVIDER,
      nctId,
      query,
      retrievedAt,
      outcome: "provider_http_error",
      httpStatus,
      detail: `ClinicalTrials.gov request failed (HTTP ${httpStatus})`,
    };
  }
  if (bodyText.length > MAX_BODY_BYTES) {
    return {
      ok: false,
      provider: CTGOV_PROVIDER,
      nctId,
      query,
      retrievedAt,
      outcome: "oversized_response",
      httpStatus,
      detail: "Oversized provider response",
    };
  }
  if (!rejectPhiPayload({textBlobs: [bodyText]}).ok) {
    return {
      ok: false,
      provider: CTGOV_PROVIDER,
      nctId,
      query,
      retrievedAt,
      outcome: "phi_shaped_payload_rejected",
      httpStatus,
      detail: "Provider payload rejected by PHI-shaped guard",
    };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return {
      ok: false,
      provider: CTGOV_PROVIDER,
      nctId,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: "ClinicalTrials.gov response was not JSON",
    };
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      ok: false,
      provider: CTGOV_PROVIDER,
      nctId,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: "Invalid ClinicalTrials.gov study envelope",
    };
  }
  const study = payload as Record<string, unknown>;
  const protocol = study.protocolSection;
  if (!protocol || typeof protocol !== "object" || Array.isArray(protocol)) {
    return {
      ok: false,
      provider: CTGOV_PROVIDER,
      nctId,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: "Missing protocolSection",
    };
  }
  const identification = (protocol as Record<string, unknown>).identificationModule;
  const returnedNct =
    identification && typeof identification === "object" && !Array.isArray(identification)
      ? (identification as Record<string, unknown>).nctId
      : null;
  if (typeof returnedNct !== "string" || assertValidNctId(returnedNct) !== nctId) {
    return {
      ok: false,
      provider: CTGOV_PROVIDER,
      nctId,
      query,
      retrievedAt,
      outcome: "nct_mismatch",
      httpStatus,
      detail: `Returned NCT ${String(returnedNct)} did not match requested ${nctId}`,
    };
  }

  return {
    ok: true,
    provider: CTGOV_PROVIDER,
    nctId,
    query,
    retrievedAt,
    httpStatus,
    responseIdentity: responseIdentityOf(bodyText),
    study,
    bodyText,
  };
}

/** Live NCT lookup. Does not assess eligibility, enrolment or scientific acceptance. */
export async function lookupClinicalTrialsGovByNctId(input: {
  nctId: string;
  fetcher?: FetchLike;
  now?: () => Date;
  signal?: AbortSignal;
}): Promise<CtgovLookupResult> {
  const nctId = assertValidNctId(input.nctId);
  const query = clinicalTrialsGovStudyUrl(nctId);
  const retrievedAt = (input.now ?? (() => new Date()))().toISOString();
  try {
    const response = await (input.fetcher ?? fetch)(query, {
      headers: {Accept: "application/json"},
      signal: input.signal,
    });
    const bodyText = await response.text();
    return parseClinicalTrialsGovStudyPayload({
      nctId,
      bodyText,
      httpStatus: response.status,
      retrievedAt,
    });
  } catch (error) {
    return {
      ok: false,
      provider: CTGOV_PROVIDER,
      nctId,
      query,
      retrievedAt,
      outcome: "timeout_or_network",
      httpStatus: null,
      detail: error instanceof Error ? error.message : "Network failure",
    };
  }
}
