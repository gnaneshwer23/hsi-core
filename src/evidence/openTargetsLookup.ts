/**
 * Open Targets Platform GraphQL lookup (public association metadata).
 * Returns disease→target association rows for research navigation only.
 * Not claim support, rights clearance, drug recommendation, or scientific approval.
 */
import {createHash} from "node:crypto";

export const OPEN_TARGETS_GRAPHQL_ENDPOINT =
  "https://api.platform.opentargets.org/api/v4/graphql";
export const OPEN_TARGETS_PROVIDER = "open_targets_platform_graphql_v4" as const;

const MAX_BODY_BYTES = 400_000;
const DEFAULT_ASSOCIATION_PAGE_SIZE = 5;
export const OPEN_TARGETS_ASSOCIATION_PAGE_SIZE_MIN = 1;
export const OPEN_TARGETS_ASSOCIATION_PAGE_SIZE_MAX = 25;

export function assertValidOpenTargetsAssociationPageSize(pageSize: number): number {
  if (
    !Number.isInteger(pageSize) ||
    pageSize < OPEN_TARGETS_ASSOCIATION_PAGE_SIZE_MIN ||
    pageSize > OPEN_TARGETS_ASSOCIATION_PAGE_SIZE_MAX
  ) {
    throw new Error(
      `Invalid Open Targets association page size (allowed ${OPEN_TARGETS_ASSOCIATION_PAGE_SIZE_MIN}–${OPEN_TARGETS_ASSOCIATION_PAGE_SIZE_MAX})`,
    );
  }
  return pageSize;
}

function diseaseAssociationQuery(pageSize: number): string {
  const size = assertValidOpenTargetsAssociationPageSize(pageSize);
  return `query diseaseAssoc($efoId: String!) {
  disease(efoId: $efoId) {
    id
    name
    associatedTargets(page: { index: 0, size: ${size} }) {
      count
      rows {
        score
        target { id approvedSymbol }
        datatypeScores { id score }
      }
    }
  }
}`;
}

/** Disease IDs accepted by current Open Targets Platform (underscore form). */
export function assertValidOpenTargetsDiseaseId(id: string): string {
  const normalized = id.trim().toUpperCase().replace(/:/g, "_");
  if (!/^(?:MONDO|EFO)_\d{7}$/.test(normalized)) {
    throw new Error(`Invalid Open Targets disease id: ${id}`);
  }
  return normalized;
}

export type OpenTargetsAssociationRow = {
  targetEnsemblId: string;
  approvedSymbol: string;
  score: number;
  datatypeScores: readonly {id: string; score: number}[];
};

export type OpenTargetsDiseaseRecord = {
  provider: typeof OPEN_TARGETS_PROVIDER;
  diseaseId: string;
  diseaseName: string;
  associationCount: number;
  associations: readonly OpenTargetsAssociationRow[];
  retrievedAt: string;
  responseIdentity: string;
  verificationState: "metadata_retrieved_not_claim_verified";
  reviewState: "unreviewed";
  scientificApproval: false;
  graphPromotable: false;
  /** Associations are public research indexes — not licensed passage text. */
  passageImportAuthorized: false;
};

export type OpenTargetsLookupOk = {
  ok: true;
  provider: typeof OPEN_TARGETS_PROVIDER;
  diseaseId: string;
  query: string;
  retrievedAt: string;
  httpStatus: number;
  responseIdentity: string;
  record: OpenTargetsDiseaseRecord;
  bodyText: string;
  pageSize: number;
  truncatedByPageBudget: boolean;
  /** Disease id matched provider payload — source identity verified for this lookup. */
  sourceIdentity: "verified";
};

export type OpenTargetsLookupFail = {
  ok: false;
  provider: typeof OPEN_TARGETS_PROVIDER;
  diseaseId: string;
  query: string;
  retrievedAt: string;
  outcome:
    | "provider_http_error"
    | "provider_unavailable"
    | "invalid_response"
    | "oversized_response"
    | "timeout_or_network"
    | "disease_not_found";
  httpStatus: number | null;
  detail: string;
};

export type OpenTargetsLookupResult = OpenTargetsLookupOk | OpenTargetsLookupFail;

/** Default GraphQL document (page size 5). Prefer diseaseAssociationQuery(pageSize) for dynamic budgets. */
export const OPEN_TARGETS_DISEASE_ASSOCIATION_QUERY = diseaseAssociationQuery(DEFAULT_ASSOCIATION_PAGE_SIZE);

function responseIdentityOf(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

function numberOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function stringOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export function parseOpenTargetsDiseasePayload(input: {
  diseaseId: string;
  bodyText: string;
  httpStatus: number;
  retrievedAt: string;
  pageSize?: number;
}): OpenTargetsLookupResult {
  const diseaseId = assertValidOpenTargetsDiseaseId(input.diseaseId);
  const pageSize = assertValidOpenTargetsAssociationPageSize(input.pageSize ?? DEFAULT_ASSOCIATION_PAGE_SIZE);
  const query = `disease(efoId: ${diseaseId})`;
  const {bodyText, httpStatus, retrievedAt} = input;

  if (httpStatus === 401 || httpStatus === 403) {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "provider_unavailable",
      httpStatus,
      detail: `Open Targets blocked or unauthorized (HTTP ${httpStatus})`,
    };
  }
  if (httpStatus < 200 || httpStatus >= 300) {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "provider_http_error",
      httpStatus,
      detail: `Open Targets request failed (HTTP ${httpStatus})`,
    };
  }
  if (bodyText.length > MAX_BODY_BYTES) {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "oversized_response",
      httpStatus,
      detail: "Oversized Open Targets response",
    };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: "Open Targets response was not JSON",
    };
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: "Invalid Open Targets envelope",
    };
  }

  const data = (payload as {data?: unknown}).data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: "Open Targets data envelope missing",
    };
  }

  const disease = (data as {disease?: unknown}).disease;
  if (disease === null) {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "disease_not_found",
      httpStatus,
      detail: `Open Targets returned no disease for ${diseaseId}`,
    };
  }
  if (!disease || typeof disease !== "object" || Array.isArray(disease)) {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: "Open Targets disease payload malformed",
    };
  }

  const row = disease as Record<string, unknown>;
  const returnedId = stringOrNull(row.id);
  const name = stringOrNull(row.name);
  if (!returnedId || returnedId !== diseaseId || !name || name.length > 500) {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: "Open Targets disease identity mismatch",
    };
  }

  const associated = row.associatedTargets;
  if (!associated || typeof associated !== "object" || Array.isArray(associated)) {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: "Open Targets associatedTargets missing",
    };
  }
  const assoc = associated as Record<string, unknown>;
  const count = numberOrNull(assoc.count);
  const rowsRaw = assoc.rows;
  if (count === null || count < 0 || !Array.isArray(rowsRaw) || rowsRaw.length > pageSize) {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: "Open Targets association rows invalid",
    };
  }

  const associations: OpenTargetsAssociationRow[] = [];
  for (const raw of rowsRaw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const item = raw as Record<string, unknown>;
    const score = numberOrNull(item.score);
    const target = item.target;
    if (score === null || score < 0 || score > 1 || !target || typeof target !== "object" || Array.isArray(target)) {
      continue;
    }
    const t = target as Record<string, unknown>;
    const targetEnsemblId = stringOrNull(t.id);
    const approvedSymbol = stringOrNull(t.approvedSymbol);
    if (!targetEnsemblId || !/^ENSG\d{11}$/.test(targetEnsemblId) || !approvedSymbol || approvedSymbol.length > 64) {
      continue;
    }
    const datatypeScores: {id: string; score: number}[] = [];
    if (Array.isArray(item.datatypeScores)) {
      for (const ds of item.datatypeScores) {
        if (!ds || typeof ds !== "object" || Array.isArray(ds)) continue;
        const d = ds as Record<string, unknown>;
        const id = stringOrNull(d.id);
        const dsScore = numberOrNull(d.score);
        if (!id || id.length > 64 || dsScore === null) continue;
        datatypeScores.push({id, score: dsScore});
      }
    }
    associations.push({targetEnsemblId, approvedSymbol, score, datatypeScores});
  }

  const identity = responseIdentityOf(bodyText);
  return {
    ok: true,
    provider: OPEN_TARGETS_PROVIDER,
    diseaseId,
    query,
    retrievedAt,
    httpStatus,
    responseIdentity: identity,
    bodyText,
    pageSize,
    truncatedByPageBudget: count > associations.length,
    sourceIdentity: "verified",
    record: {
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      diseaseName: name,
      associationCount: count,
      associations,
      retrievedAt,
      responseIdentity: identity,
      verificationState: "metadata_retrieved_not_claim_verified",
      reviewState: "unreviewed",
      scientificApproval: false,
      graphPromotable: false,
      passageImportAuthorized: false,
    },
  };
}

/**
 * Lookup disease→target associations for a researcher-supplied Open Targets disease id.
 * Accepts validated MONDO_/EFO_ ids (unpinned relative to living-evidence pins).
 * Metadata only — not claim support, independent lit corroboration, or graph approval.
 */
export async function lookupOpenTargetsDiseaseAssociations(input: {
  diseaseId: string;
  pageSize?: number;
  fetcher?: typeof fetch;
  now?: () => Date;
  signal?: AbortSignal;
}): Promise<OpenTargetsLookupResult> {
  const diseaseId = assertValidOpenTargetsDiseaseId(input.diseaseId);
  const pageSize = assertValidOpenTargetsAssociationPageSize(input.pageSize ?? DEFAULT_ASSOCIATION_PAGE_SIZE);
  const retrievedAt = (input.now ?? (() => new Date()))().toISOString();
  const query = `disease(efoId: ${diseaseId})`;
  try {
    const response = await (input.fetcher ?? fetch)(OPEN_TARGETS_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {Accept: "application/json", "Content-Type": "application/json"},
      signal: input.signal,
      body: JSON.stringify({
        query: diseaseAssociationQuery(pageSize),
        variables: {efoId: diseaseId},
      }),
    });
    const bodyText = await response.text();
    return parseOpenTargetsDiseasePayload({
      diseaseId,
      bodyText,
      httpStatus: response.status,
      retrievedAt,
      pageSize,
    });
  } catch (error) {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "timeout_or_network",
      httpStatus: null,
      detail: error instanceof Error ? error.message : "Network failure",
    };
  }
}
