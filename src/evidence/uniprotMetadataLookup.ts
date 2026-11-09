/**
 * Thin governed UniProtKB metadata-only adapter.
 *
 * Extends existing evidence lookup patterns (Europe PMC / Open Targets / CT.gov).
 * Permitted fields only: accession, protein name, gene names, organism,
 * retrieval timestamp, provenance. Never fabricates claims, sequences-as-evidence,
 * full-text rights, Gate C approval, or scientific validity.
 *
 * Honesty (binding):
 * - Source identity ≠ claim support.
 * - Provider unavailable ≠ empty result set.
 * - Invalid accession/query is distinct from provider failure.
 * - Fixtures ≠ live evidence; offline/fixture mode must not be labelled live.
 * - Metadata-only; no passage / sequence / CDS / PHI surfaces.
 */
import {createHash} from "node:crypto";
import {validateHsiOntologyIdentifier} from "../hsiOntologyRegistry";

export const UNIPROT_REST_BASE = "https://rest.uniprot.org/uniprotkb";
export const UNIPROT_PROVIDER = "uniprot_uniprotkb_rest_v1" as const;
/** Fields requested from UniProt — intentionally narrow (metadata only). */
export const UNIPROT_METADATA_FIELDS = "accession,id,protein_name,gene_names,organism_name" as const;
export const UNIPROT_DEFAULT_TIMEOUT_MS = 10_000;
/** At most one retry on transient 429/503 — never silent infinite retry. */
export const UNIPROT_MAX_RETRIES = 1;
export const UNIPROT_RETRY_BACKOFF_MS = 500;
const MAX_BODY_BYTES = 200_000;
const MAX_GENE_NAMES = 32;
const MAX_NAME_CHARS = 500;

/**
 * UniProtKB accession (Swiss-Prot / TrEMBL), optional isoform suffix.
 * Mirrors `HSI_ONTOLOGY_NAMESPACES` UniProt pattern.
 */
export const UNIPROT_ACCESSION_PATTERN =
  /^(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9][A-Z0-9]{8}[0-9])(?:-[1-9][0-9]*)?$/;

export type UniprotLookupMode = "live" | "fixture" | "offline";

export type UniprotRetryHonesty = {
  maxRetries: number;
  attemptsUsed: number;
  retried: boolean;
  rateLimited: boolean;
  timeoutMs: number;
  /** True when caller injected a fixture/offline fetcher — never represent as live. */
  fixturesAreNotLiveEvidence: true;
  lookupMode: UniprotLookupMode;
};

export type UniprotPermittedMetadata = {
  provider: typeof UNIPROT_PROVIDER;
  accession: string;
  proteinName: string | null;
  geneNames: readonly string[];
  organism: string | null;
  retrievedAt: string;
  responseIdentity: string;
  provenance: {
    endpoint: string;
    fields: typeof UNIPROT_METADATA_FIELDS;
    entryUrl: string;
    providerVersion: typeof UNIPROT_PROVIDER;
  };
  verificationState: "metadata_retrieved_not_claim_verified";
  reviewState: "unreviewed";
  scientificApproval: false;
  graphPromotable: false;
  claimSupport: "not_assessed";
  /** Identity of the UniProt catalog record — not mechanistic claim support. */
  sourceIdentityDistinctFromClaimSupport: true;
  passageImportAuthorized: false;
  sequenceRetrieved: false;
};

export type UniprotLookupOk = {
  ok: true;
  provider: typeof UNIPROT_PROVIDER;
  accession: string;
  query: string;
  retrievedAt: string;
  httpStatus: number;
  responseIdentity: string;
  record: UniprotPermittedMetadata;
  retryHonesty: UniprotRetryHonesty;
  sourceIdentity: "verified";
};

export type UniprotLookupFailOutcome =
  | "provider_http_error"
  | "provider_unavailable"
  | "invalid_query"
  | "invalid_response"
  | "oversized_response"
  | "timeout_or_network"
  | "accession_not_found"
  | "empty_result";

export type UniprotLookupFail = {
  ok: false;
  provider: typeof UNIPROT_PROVIDER;
  accession: string | null;
  query: string;
  retrievedAt: string;
  outcome: UniprotLookupFailOutcome;
  httpStatus: number | null;
  detail: string;
  retryHonesty: UniprotRetryHonesty;
};

export type UniprotLookupResult = UniprotLookupOk | UniprotLookupFail;

function responseIdentityOf(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

function stringOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Validate UniProt accession via ontology registry + local pattern. */
export function assertValidUniprotAccession(accession: string): string {
  const id = accession.trim().toUpperCase();
  if (!UNIPROT_ACCESSION_PATTERN.test(id)) {
    throw new Error(`Invalid UniProt accession: ${accession}`);
  }
  validateHsiOntologyIdentifier("UniProt", id);
  return id;
}

export function uniprotEntryUrl(accession: string): string {
  const id = assertValidUniprotAccession(accession);
  return `https://www.uniprot.org/uniprotkb/${encodeURIComponent(id)}/entry`;
}

export function uniprotMetadataRequestUrl(accession: string): string {
  const id = assertValidUniprotAccession(accession);
  const params = new URLSearchParams({fields: UNIPROT_METADATA_FIELDS});
  return `${UNIPROT_REST_BASE}/${encodeURIComponent(id)}.json?${params}`;
}

function extractProteinName(entry: Record<string, unknown>): string | null {
  const desc = entry.proteinDescription;
  if (!desc || typeof desc !== "object" || Array.isArray(desc)) return null;
  const recommended = (desc as Record<string, unknown>).recommendedName;
  if (recommended && typeof recommended === "object" && !Array.isArray(recommended)) {
    const full = (recommended as Record<string, unknown>).fullName;
    if (full && typeof full === "object" && !Array.isArray(full)) {
      const value = stringOrNull((full as Record<string, unknown>).value);
      if (value && value.length <= MAX_NAME_CHARS) return value;
    }
  }
  const submission = (desc as Record<string, unknown>).submissionNames;
  if (Array.isArray(submission) && submission[0] && typeof submission[0] === "object") {
    const full = (submission[0] as Record<string, unknown>).fullName;
    if (full && typeof full === "object" && !Array.isArray(full)) {
      const value = stringOrNull((full as Record<string, unknown>).value);
      if (value && value.length <= MAX_NAME_CHARS) return value;
    }
  }
  return null;
}

function extractGeneNames(entry: Record<string, unknown>): string[] {
  const genes = entry.genes;
  if (!Array.isArray(genes)) return [];
  const out: string[] = [];
  for (const gene of genes.slice(0, MAX_GENE_NAMES)) {
    if (!gene || typeof gene !== "object" || Array.isArray(gene)) continue;
    const g = gene as Record<string, unknown>;
    const primary = g.geneName;
    if (primary && typeof primary === "object" && !Array.isArray(primary)) {
      const value = stringOrNull((primary as Record<string, unknown>).value);
      if (value && value.length <= 64 && !out.includes(value)) out.push(value);
    }
    const synonyms = g.synonyms;
    if (Array.isArray(synonyms)) {
      for (const syn of synonyms) {
        if (!syn || typeof syn !== "object" || Array.isArray(syn)) continue;
        const value = stringOrNull((syn as Record<string, unknown>).value);
        if (value && value.length <= 64 && !out.includes(value)) out.push(value);
        if (out.length >= MAX_GENE_NAMES) return out;
      }
    }
  }
  return out;
}

function extractOrganism(entry: Record<string, unknown>): string | null {
  const organism = entry.organism;
  if (!organism || typeof organism !== "object" || Array.isArray(organism)) return null;
  const scientific = stringOrNull((organism as Record<string, unknown>).scientificName);
  if (scientific && scientific.length <= MAX_NAME_CHARS) return scientific;
  return null;
}

function isInactiveEntry(entry: Record<string, unknown>): boolean {
  const entryType = stringOrNull(entry.entryType);
  return entryType !== null && /inactive/i.test(entryType);
}

function baseRetryHonesty(input: {
  attemptsUsed: number;
  retried: boolean;
  rateLimited: boolean;
  timeoutMs: number;
  lookupMode: UniprotLookupMode;
}): UniprotRetryHonesty {
  return {
    maxRetries: UNIPROT_MAX_RETRIES,
    attemptsUsed: input.attemptsUsed,
    retried: input.retried,
    rateLimited: input.rateLimited,
    timeoutMs: input.timeoutMs,
    fixturesAreNotLiveEvidence: true,
    lookupMode: input.lookupMode,
  };
}

/**
 * Parse a UniProtKB JSON entry body into permitted metadata only.
 * Does not invent protein function, disease association, or claim support.
 */
export function parseUniprotMetadataPayload(input: {
  accession: string;
  bodyText: string;
  httpStatus: number;
  retrievedAt: string;
  retryHonesty: UniprotRetryHonesty;
}): UniprotLookupResult {
  let accession: string;
  try {
    accession = assertValidUniprotAccession(input.accession);
  } catch (error) {
    return {
      ok: false,
      provider: UNIPROT_PROVIDER,
      accession: null,
      query: input.accession,
      retrievedAt: input.retrievedAt,
      outcome: "invalid_query",
      httpStatus: input.httpStatus,
      detail: error instanceof Error ? error.message : "Invalid UniProt accession",
      retryHonesty: input.retryHonesty,
    };
  }
  const query = uniprotMetadataRequestUrl(accession);
  const {bodyText, httpStatus, retrievedAt, retryHonesty} = input;

  if (httpStatus === 401 || httpStatus === 403) {
    return {
      ok: false,
      provider: UNIPROT_PROVIDER,
      accession,
      query,
      retrievedAt,
      outcome: "provider_unavailable",
      httpStatus,
      detail: `UniProt blocked or unauthorized (HTTP ${httpStatus})`,
      retryHonesty,
    };
  }
  if (httpStatus === 404) {
    return {
      ok: false,
      provider: UNIPROT_PROVIDER,
      accession,
      query,
      retrievedAt,
      outcome: "accession_not_found",
      httpStatus,
      detail: `UniProt accession not found (HTTP 404): ${accession}`,
      retryHonesty,
    };
  }
  if (httpStatus === 400) {
    return {
      ok: false,
      provider: UNIPROT_PROVIDER,
      accession,
      query,
      retrievedAt,
      outcome: "invalid_query",
      httpStatus,
      detail: `UniProt rejected accession/query (HTTP 400)`,
      retryHonesty,
    };
  }
  if (httpStatus < 200 || httpStatus >= 300) {
    return {
      ok: false,
      provider: UNIPROT_PROVIDER,
      accession,
      query,
      retrievedAt,
      outcome: "provider_http_error",
      httpStatus,
      detail: `UniProt request failed (HTTP ${httpStatus})`,
      retryHonesty,
    };
  }
  if (bodyText.length > MAX_BODY_BYTES) {
    return {
      ok: false,
      provider: UNIPROT_PROVIDER,
      accession,
      query,
      retrievedAt,
      outcome: "oversized_response",
      httpStatus,
      detail: "Oversized UniProt response",
      retryHonesty,
    };
  }
  if (!bodyText.trim()) {
    return {
      ok: false,
      provider: UNIPROT_PROVIDER,
      accession,
      query,
      retrievedAt,
      outcome: "empty_result",
      httpStatus,
      detail: "UniProt returned an empty body",
      retryHonesty,
    };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return {
      ok: false,
      provider: UNIPROT_PROVIDER,
      accession,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: "UniProt response was not JSON",
      retryHonesty,
    };
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      ok: false,
      provider: UNIPROT_PROVIDER,
      accession,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: "Invalid UniProt entry envelope",
      retryHonesty,
    };
  }

  const entry = payload as Record<string, unknown>;
  if (isInactiveEntry(entry)) {
    return {
      ok: false,
      provider: UNIPROT_PROVIDER,
      accession,
      query,
      retrievedAt,
      outcome: "accession_not_found",
      httpStatus,
      detail: `UniProt entry inactive for ${accession}`,
      retryHonesty,
    };
  }

  const returnedAccession = stringOrNull(entry.primaryAccession)?.toUpperCase() ?? null;
  // Isoform requests may return primaryAccession without suffix; accept primary match.
  const primaryRequested = accession.replace(/-\d+$/, "");
  if (
    !returnedAccession ||
    (returnedAccession !== accession && returnedAccession !== primaryRequested)
  ) {
    return {
      ok: false,
      provider: UNIPROT_PROVIDER,
      accession,
      query,
      retrievedAt,
      outcome: "invalid_response",
      httpStatus,
      detail: `UniProt accession mismatch: requested ${accession}, got ${String(returnedAccession)}`,
      retryHonesty,
    };
  }

  const identity = responseIdentityOf(bodyText);
  const proteinName = extractProteinName(entry);
  const geneNames = extractGeneNames(entry);
  const organism = extractOrganism(entry);

  return {
    ok: true,
    provider: UNIPROT_PROVIDER,
    accession,
    query,
    retrievedAt,
    httpStatus,
    responseIdentity: identity,
    sourceIdentity: "verified",
    retryHonesty,
    record: {
      provider: UNIPROT_PROVIDER,
      accession,
      proteinName,
      geneNames,
      organism,
      retrievedAt,
      responseIdentity: identity,
      provenance: {
        endpoint: query,
        fields: UNIPROT_METADATA_FIELDS,
        entryUrl: uniprotEntryUrl(accession),
        providerVersion: UNIPROT_PROVIDER,
      },
      verificationState: "metadata_retrieved_not_claim_verified",
      reviewState: "unreviewed",
      scientificApproval: false,
      graphPromotable: false,
      claimSupport: "not_assessed",
      sourceIdentityDistinctFromClaimSupport: true,
      passageImportAuthorized: false,
      sequenceRetrieved: false,
    },
  };
}

function resolveLookupMode(input: {
  fetcher?: typeof fetch;
  lookupMode?: UniprotLookupMode;
}): UniprotLookupMode {
  if (input.lookupMode) return input.lookupMode;
  // Injected fetcher ⇒ fixture/offline path; never claim live without explicit mode.
  if (input.fetcher) return "fixture";
  return "live";
}

/**
 * Lookup UniProtKB accession metadata (bounded, metadata-only).
 * Optional live network; inject `fetcher` for fixture-gated tests.
 * One honest retry on 429/503; timeout fails as timeout_or_network (≠ empty).
 */
export async function lookupUniprotMetadataByAccession(input: {
  accession: string;
  fetcher?: typeof fetch;
  now?: () => Date;
  signal?: AbortSignal;
  timeoutMs?: number;
  maxRetries?: number;
  lookupMode?: UniprotLookupMode;
}): Promise<UniprotLookupResult> {
  const retrievedAt = (input.now ?? (() => new Date()))().toISOString();
  const timeoutMs = input.timeoutMs ?? UNIPROT_DEFAULT_TIMEOUT_MS;
  const maxRetries = Math.min(
    UNIPROT_MAX_RETRIES,
    Math.max(0, input.maxRetries ?? UNIPROT_MAX_RETRIES),
  );
  const lookupMode = resolveLookupMode(input);

  let accession: string;
  try {
    accession = assertValidUniprotAccession(input.accession);
  } catch (error) {
    return {
      ok: false,
      provider: UNIPROT_PROVIDER,
      accession: null,
      query: typeof input.accession === "string" ? input.accession : "",
      retrievedAt,
      outcome: "invalid_query",
      httpStatus: null,
      detail: error instanceof Error ? error.message : "Invalid UniProt accession",
      retryHonesty: baseRetryHonesty({
        attemptsUsed: 0,
        retried: false,
        rateLimited: false,
        timeoutMs,
        lookupMode,
      }),
    };
  }

  const query = uniprotMetadataRequestUrl(accession);
  const fetcher = input.fetcher ?? fetch;
  let attemptsUsed = 0;
  let rateLimited = false;
  let lastErrorDetail = "Network failure";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attemptsUsed = attempt + 1;
    const retryHonesty = baseRetryHonesty({
      attemptsUsed,
      retried: attempt > 0,
      rateLimited,
      timeoutMs,
      lookupMode,
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onOuterAbort = () => controller.abort();
    input.signal?.addEventListener("abort", onOuterAbort, {once: true});

    try {
      const response = await fetcher(query, {
        headers: {Accept: "application/json"},
        signal: controller.signal,
      });
      const bodyText = await response.text();

      if ((response.status === 429 || response.status === 503) && attempt < maxRetries) {
        rateLimited = response.status === 429 || rateLimited;
        await sleep(UNIPROT_RETRY_BACKOFF_MS);
        continue;
      }

      return parseUniprotMetadataPayload({
        accession,
        bodyText,
        httpStatus: response.status,
        retrievedAt,
        retryHonesty: baseRetryHonesty({
          attemptsUsed,
          retried: attempt > 0,
          rateLimited: rateLimited || response.status === 429,
          timeoutMs,
          lookupMode,
        }),
      });
    } catch (error) {
      lastErrorDetail = error instanceof Error ? error.message : "Network failure";
      const aborted =
        (error instanceof Error && error.name === "AbortError") ||
        input.signal?.aborted === true ||
        controller.signal.aborted;
      if (aborted && attempt >= maxRetries) {
        return {
          ok: false,
          provider: UNIPROT_PROVIDER,
          accession,
          query,
          retrievedAt,
          outcome: "timeout_or_network",
          httpStatus: null,
          detail: `UniProt timeout or abort after ${attemptsUsed} attempt(s): ${lastErrorDetail}`,
          retryHonesty,
        };
      }
      if (attempt < maxRetries) {
        await sleep(UNIPROT_RETRY_BACKOFF_MS);
        continue;
      }
      return {
        ok: false,
        provider: UNIPROT_PROVIDER,
        accession,
        query,
        retrievedAt,
        outcome: "timeout_or_network",
        httpStatus: null,
        detail: lastErrorDetail,
        retryHonesty,
      };
    } finally {
      clearTimeout(timer);
      input.signal?.removeEventListener("abort", onOuterAbort);
    }
  }

  return {
    ok: false,
    provider: UNIPROT_PROVIDER,
    accession,
    query,
    retrievedAt,
    outcome: "timeout_or_network",
    httpStatus: null,
    detail: lastErrorDetail,
    retryHonesty: baseRetryHonesty({
      attemptsUsed,
      retried: attemptsUsed > 1,
      rateLimited,
      timeoutMs,
      lookupMode,
    }),
  };
}

/** Offline/CI status — never claim live connectivity from fixtures. */
export function uniprotAdapterConnectionStatus(input: {
  liveEnabled?: boolean;
  lastLiveOk?: boolean | null;
}): {
  status: "partially_implemented";
  connected: "metadata_only" | "offline_fixture_only";
  label: string;
  honesty: {
    fixturesAreNotLiveEvidence: true;
    metadataOnly: true;
    claimSupport: "not_assessed";
    liveOptional: true;
  };
} {
  const live = input.liveEnabled === true && input.lastLiveOk === true;
  return {
    status: "partially_implemented",
    connected: live ? "metadata_only" : "offline_fixture_only",
    label: live
      ? "UniProt metadata-only adapter (live optional)"
      : "UniProt metadata-only adapter (fixture/offline — not live evidence)",
    honesty: {
      fixturesAreNotLiveEvidence: true,
      metadataOnly: true,
      claimSupport: "not_assessed",
      liveOptional: true,
    },
  };
}
