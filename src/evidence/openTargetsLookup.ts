/**
 * Open Targets Platform GraphQL lookup (public association metadata).
 * Returns disease→target association rows for research navigation only.
 * Not claim support, rights clearance, drug recommendation, or scientific approval.
 *
 * Honesty (binding):
 * - Association `score` ≠ causation, efficacy, or target validation.
 * - Datatype / datasource scores are provider evidence-type indexes, not claim support.
 * - `enableIndirect` distinguishes direct vs ontology-propagated (indirect) association scope.
 * - Source identity ≠ claim support; fixtures ≠ live evidence; provider fail ≠ empty.
 */
import {createHash} from "node:crypto";

export const OPEN_TARGETS_GRAPHQL_ENDPOINT =
  "https://api.platform.opentargets.org/api/v4/graphql";
export const OPEN_TARGETS_PROVIDER = "open_targets_platform_graphql_v4" as const;

const MAX_BODY_BYTES = 400_000;
const DEFAULT_ASSOCIATION_PAGE_SIZE = 5;
export const OPEN_TARGETS_ASSOCIATION_PAGE_SIZE_MIN = 1;
export const OPEN_TARGETS_ASSOCIATION_PAGE_SIZE_MAX = 25;
/** Bound on GraphQL error messages retained for partial reporting. */
export const OPEN_TARGETS_GRAPHQL_ERROR_BUDGET = 8;

export type OpenTargetsAssociationScope = "direct" | "indirect_enabled";

export type OpenTargetsScoredComponent = {
  id: string;
  score: number;
};

/** Explicit non-causal framing for OT association scores. */
export type OpenTargetsScoreHonesty = {
  scoreIsNotCausation: true;
  scoreIsNotEfficacy: true;
  scoreIsNotTargetValidation: true;
  scoreIsNotClaimSupport: true;
};

export const OPEN_TARGETS_SCORE_HONESTY: OpenTargetsScoreHonesty = {
  scoreIsNotCausation: true,
  scoreIsNotEfficacy: true,
  scoreIsNotTargetValidation: true,
  scoreIsNotClaimSupport: true,
};

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

export function assertValidOpenTargetsEnableIndirect(enableIndirect: boolean): boolean {
  if (typeof enableIndirect !== "boolean") {
    throw new Error("Invalid Open Targets enableIndirect (boolean required)");
  }
  return enableIndirect;
}

export function associationScopeFromEnableIndirect(
  enableIndirect: boolean,
): OpenTargetsAssociationScope {
  return enableIndirect ? "indirect_enabled" : "direct";
}

/**
 * Build the disease→associatedTargets GraphQL document.
 * Validates pageSize + enableIndirect; rejects documents that omit required fields.
 */
export function diseaseAssociationQuery(input: {
  pageSize: number;
  enableIndirect?: boolean;
}): string {
  const size = assertValidOpenTargetsAssociationPageSize(input.pageSize);
  const enableIndirect = assertValidOpenTargetsEnableIndirect(input.enableIndirect ?? false);
  const query = `query diseaseAssoc($efoId: String!) {
  disease(efoId: $efoId) {
    id
    name
    associatedTargets(page: { index: 0, size: ${size} }, enableIndirect: ${enableIndirect}) {
      count
      rows {
        score
        target { id approvedSymbol }
        datatypeScores { id score }
        datasourceScores { id score }
      }
    }
  }
}`;
  return assertValidOpenTargetsAssociationQueryDocument(query);
}

/** Structural validation of the association GraphQL selection set (no live schema introspect). */
export function assertValidOpenTargetsAssociationQueryDocument(query: string): string {
  const normalised = query.replace(/\s+/g, " ").trim();
  if (!normalised || normalised.length > 4_000) {
    throw new Error("Invalid Open Targets GraphQL query length");
  }
  const required = [
    "disease(efoId:",
    "associatedTargets(",
    "enableIndirect:",
    "datatypeScores",
    "datasourceScores",
    "approvedSymbol",
  ] as const;
  for (const token of required) {
    if (!normalised.includes(token)) {
      throw new Error(`Open Targets GraphQL query missing required field: ${token}`);
    }
  }
  return query;
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
  /**
   * Overall OT association score (0–1).
   * Not causation, efficacy, target validation, or claim support.
   */
  score: number;
  /** Evidence-type scores (e.g. genetic_association, literature, clinical). */
  datatypeScores: readonly OpenTargetsScoredComponent[];
  /** Underlying evidence-source / datasource scores (e.g. chembl, europepmc). */
  datasourceScores: readonly OpenTargetsScoredComponent[];
};

export type OpenTargetsDiseaseRecord = {
  provider: typeof OPEN_TARGETS_PROVIDER;
  diseaseId: string;
  diseaseName: string;
  associationCount: number;
  associations: readonly OpenTargetsAssociationRow[];
  /** Query-level direct vs ontology-propagated (indirect) scope. */
  associationScope: OpenTargetsAssociationScope;
  enableIndirect: boolean;
  scoreHonesty: OpenTargetsScoreHonesty;
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
  associationScope: OpenTargetsAssociationScope;
  enableIndirect: boolean;
  scoreHonesty: OpenTargetsScoreHonesty;
  /**
   * GraphQL `errors` present alongside usable `data` — partial provider reporting.
   * Null when the response had no GraphQL error entries.
   */
  graphqlPartialErrors: readonly string[] | null;
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

/** Default GraphQL document (page size 5, direct associations). */
export const OPEN_TARGETS_DISEASE_ASSOCIATION_QUERY = diseaseAssociationQuery({
  pageSize: DEFAULT_ASSOCIATION_PAGE_SIZE,
  enableIndirect: false,
});

function responseIdentityOf(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

function numberOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function stringOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function parseScoredComponents(raw: unknown): OpenTargetsScoredComponent[] {
  const out: OpenTargetsScoredComponent[] = [];
  if (!Array.isArray(raw)) return out;
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const id = stringOrNull(row.id);
    const score = numberOrNull(row.score);
    if (!id || id.length > 64 || score === null || score < 0 || score > 1) continue;
    out.push({id, score});
  }
  return out;
}

function parseGraphqlErrorMessages(errors: unknown): string[] {
  if (!Array.isArray(errors) || errors.length === 0) return [];
  const messages: string[] = [];
  for (const err of errors.slice(0, OPEN_TARGETS_GRAPHQL_ERROR_BUDGET)) {
    if (!err || typeof err !== "object" || Array.isArray(err)) continue;
    const message = stringOrNull((err as {message?: unknown}).message);
    if (message && message.length <= 500) messages.push(message);
  }
  return messages;
}

export function parseOpenTargetsDiseasePayload(input: {
  diseaseId: string;
  bodyText: string;
  httpStatus: number;
  retrievedAt: string;
  pageSize?: number;
  enableIndirect?: boolean;
}): OpenTargetsLookupResult {
  const diseaseId = assertValidOpenTargetsDiseaseId(input.diseaseId);
  const pageSize = assertValidOpenTargetsAssociationPageSize(input.pageSize ?? DEFAULT_ASSOCIATION_PAGE_SIZE);
  const enableIndirect = assertValidOpenTargetsEnableIndirect(input.enableIndirect ?? false);
  const associationScope = associationScopeFromEnableIndirect(enableIndirect);
  const query = `disease(efoId: ${diseaseId}; enableIndirect: ${enableIndirect})`;
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

  const envelope = payload as {data?: unknown; errors?: unknown};
  const graphqlErrorMessages = parseGraphqlErrorMessages(envelope.errors);
  const data = envelope.data;
  if ((!data || typeof data !== "object" || Array.isArray(data)) && graphqlErrorMessages.length > 0) {
    return {
      ok: false,
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: `Open Targets GraphQL errors: ${graphqlErrorMessages.join("; ")}`,
    };
  }
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
    associations.push({
      targetEnsemblId,
      approvedSymbol,
      score,
      datatypeScores: parseScoredComponents(item.datatypeScores),
      datasourceScores: parseScoredComponents(item.datasourceScores),
    });
  }

  const identity = responseIdentityOf(bodyText);
  const graphqlPartialErrors = graphqlErrorMessages.length > 0 ? graphqlErrorMessages : null;
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
    associationScope,
    enableIndirect,
    scoreHonesty: OPEN_TARGETS_SCORE_HONESTY,
    graphqlPartialErrors,
    sourceIdentity: "verified",
    record: {
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId,
      diseaseName: name,
      associationCount: count,
      associations,
      associationScope,
      enableIndirect,
      scoreHonesty: OPEN_TARGETS_SCORE_HONESTY,
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
 * Default `enableIndirect: false` requests direct associations only.
 */
export async function lookupOpenTargetsDiseaseAssociations(input: {
  diseaseId: string;
  pageSize?: number;
  /** When true, OT propagates evidence via disease ontology descendants (indirect). */
  enableIndirect?: boolean;
  fetcher?: typeof fetch;
  now?: () => Date;
  signal?: AbortSignal;
}): Promise<OpenTargetsLookupResult> {
  const diseaseId = assertValidOpenTargetsDiseaseId(input.diseaseId);
  const pageSize = assertValidOpenTargetsAssociationPageSize(input.pageSize ?? DEFAULT_ASSOCIATION_PAGE_SIZE);
  const enableIndirect = assertValidOpenTargetsEnableIndirect(input.enableIndirect ?? false);
  const retrievedAt = (input.now ?? (() => new Date()))().toISOString();
  const query = `disease(efoId: ${diseaseId}; enableIndirect: ${enableIndirect})`;
  try {
    const response = await (input.fetcher ?? fetch)(OPEN_TARGETS_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {Accept: "application/json", "Content-Type": "application/json"},
      signal: input.signal,
      body: JSON.stringify({
        query: diseaseAssociationQuery({pageSize, enableIndirect}),
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
      enableIndirect,
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
