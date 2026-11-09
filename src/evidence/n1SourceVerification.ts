/**
 * N1 source identity verification for the gut–immune–T2D candidate queue.
 * DOI/PMID/title conflicts fail closed. Metadata retrieval ≠ claim entailment ≠ rights clearance.
 */
import type { FetchLike } from "../fetchLike";
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import type {N1Candidate, N1CandidateQueue} from "./n1CandidateQueue";
import {parseN1CandidateQueue} from "./n1CandidateQueue";
import {
  assertValidDoi,
  lookupEuropePmcByDoi,
  parseEuropePmcBibliographicPayload,
  type BibliographicLookupResult,
  type BibliographicRecord,
} from "./europePmcBibliographicLookup";

export type N1VerificationOutcome =
  | "metadata_matched_unreviewed"
  | "identity_mismatch"
  | "ambiguous_multiple_hits"
  | "not_found"
  | "lookup_failed"
  | "provider_unavailable"
  | "rights_restricted_metadata_only";

export type N1CandidateResult = {
  queueId: string;
  sourceId: string;
  requestedDoi: string;
  requestedTitle: string;
  outcome: N1VerificationOutcome;
  provider: "europe_pmc";
  query: string | null;
  retrievedAt: string | null;
  responseIdentity: string | null;
  matched: {
    pmid: string | null;
    doi: string | null;
    title: string | null;
    url: string | null;
    journal: string | null;
    publicationYear: number | null;
    isRetracted: boolean | null;
  } | null;
  titleSimilarity: number | null;
  passageTextImported: false;
  rightsStatus: "unverified_metadata_only";
  claimEntailmentAssessed: false;
  scientificApproval: false;
  graphPromotable: false;
  notes: string[];
  contextFields: {
    model: string | null;
    tissue: null;
    population: null;
    assay: null;
    doseUnit: null;
    timepoint: null;
    intervention: null;
    outcome: string | null;
    correctionOrRetraction: "unknown" | "provider_flagged_retracted" | "none_reported_by_provider";
  };
};

export type N1ImportReceipt = {
  schemaVersion: "hsi-n1-import-receipt-1";
  phase: "N1";
  programme: "gut_immune_t2d";
  mode: "offline_fixture" | "live_provider";
  generatedAt: string;
  providerCapability: {
    provider: "europe_pmc";
    probed: boolean;
    reachable: boolean | null;
    detail: string;
  };
  scientificApproval: false;
  graphPromotable: false;
  claimEntailmentAssessed: false;
  liveAcceptance: "blocked" | "cleared_for_metadata_only";
  liveAcceptanceReason: string;
  queueVersionHint: "hsi-n1-candidate-queue-1";
  results: N1CandidateResult[];
  summary: {
    total: 12;
    metadataMatchedUnreviewed: number;
    identityMismatch: number;
    ambiguous: number;
    notFound: number;
    lookupFailed: number;
    providerUnavailable: number;
    rightsRestrictedMetadataOnly: number;
  };
  receiptHash: string;
};

const STOP = new Set(["the", "and", "of", "in", "a", "an", "to", "for", "with", "on", "by"]);

/** Normalize titles for fail-closed identity comparison (not semantic entailment). */
export function normalizeBibliographicTitle(title: string): string {
  return title
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function bibliographicTitleSimilarity(a: string, b: string): number {
  const left = new Set(normalizeBibliographicTitle(a).split(" ").filter((t) => t && !STOP.has(t)));
  const right = new Set(normalizeBibliographicTitle(b).split(" ").filter((t) => t && !STOP.has(t)));
  if (!left.size || !right.size) return 0;
  let inter = 0;
  for (const t of left) if (right.has(t)) inter++;
  const union = left.size + right.size - inter;
  return union === 0 ? 0 : inter / union;
}

function titlesCompatible(requested: string, returned: string): boolean {
  const a = normalizeBibliographicTitle(requested);
  const b = normalizeBibliographicTitle(returned).replace(/\.$/, "");
  if (!a || !b) return false;
  if (a === b || a === `${b}` || b.startsWith(a) || a.startsWith(b)) return true;
  return bibliographicTitleSimilarity(requested, returned) >= 0.82;
}

function doiMatches(requested: string, record: BibliographicRecord): boolean {
  return !!record.doi && record.doi === assertValidDoi(requested);
}

function selectRecordForCandidate(candidate: N1Candidate, lookup: BibliographicLookupResult): {
  outcome: N1VerificationOutcome;
  record: BibliographicRecord | null;
  notes: string[];
  titleSimilarity: number | null;
  query: string | null;
  retrievedAt: string | null;
  responseIdentity: string | null;
} {
  if (!lookup.ok) {
    const outcome: N1VerificationOutcome =
      lookup.outcome === "provider_unavailable" ? "provider_unavailable" : "lookup_failed";
    return {
      outcome,
      record: null,
      notes: [lookup.detail],
      titleSimilarity: null,
      query: lookup.query,
      retrievedAt: lookup.retrievedAt,
      responseIdentity: null,
    };
  }
  const doiHits = lookup.records.filter((r) => doiMatches(candidate.doi, r));
  if (!doiHits.length) {
    return {
      outcome: "not_found",
      record: null,
      notes: ["No Europe PMC record returned the requested DOI."],
      titleSimilarity: null,
      query: lookup.query,
      retrievedAt: lookup.retrievedAt,
      responseIdentity: lookup.responseIdentity,
    };
  }
  if (doiHits.length > 1) {
    const titles = new Set(doiHits.map((r) => normalizeBibliographicTitle(r.title)));
    if (titles.size > 1) {
      return {
        outcome: "ambiguous_multiple_hits",
        record: null,
        notes: ["Multiple DOI hits disagree on title; independent study grouping required."],
        titleSimilarity: null,
        query: lookup.query,
        retrievedAt: lookup.retrievedAt,
        responseIdentity: lookup.responseIdentity,
      };
    }
  }
  const record = doiHits[0]!;
  const similarity = bibliographicTitleSimilarity(candidate.requestedTitle, record.title);
  if (!titlesCompatible(candidate.requestedTitle, record.title)) {
    return {
      outcome: "identity_mismatch",
      record,
      notes: [
        "Requested editorial title conflicts with bibliographic metadata for this DOI.",
        "Failed lookups and mismatched identities are not verified sources.",
        "DOI identity alone cannot substitute for title agreement or claim entailment.",
      ],
      titleSimilarity: similarity,
      query: lookup.query,
      retrievedAt: lookup.retrievedAt,
      responseIdentity: lookup.responseIdentity,
    };
  }
  // Metadata matched; exact passage rights are not established — remain metadata-only.
  return {
    outcome: "metadata_matched_unreviewed",
    record,
    notes: [
      "Bibliographic identity matched (DOI + title).",
      "Exact passage text was not imported; reuse rights remain unverified (rights_restricted_metadata_only).",
      "Metadata retrieval is not claim entailment or scientific approval.",
    ],
    titleSimilarity: similarity,
    query: lookup.query,
    retrievedAt: lookup.retrievedAt,
    responseIdentity: lookup.responseIdentity,
  };
}

function toResult(candidate: N1Candidate, lookup: BibliographicLookupResult): N1CandidateResult {
  const selected = selectRecordForCandidate(candidate, lookup);
  const retraction =
    selected.record?.isRetracted === true
      ? "provider_flagged_retracted"
      : selected.record?.isRetracted === false
        ? "none_reported_by_provider"
        : "unknown";
  return {
    queueId: candidate.queueId,
    sourceId: candidate.sourceId,
    requestedDoi: candidate.doi,
    requestedTitle: candidate.requestedTitle,
    outcome: selected.outcome,
    provider: "europe_pmc",
    query: selected.query,
    retrievedAt: selected.retrievedAt,
    responseIdentity: selected.responseIdentity,
    matched: selected.record
      ? {
          pmid: selected.record.pmid,
          doi: selected.record.doi,
          title: selected.record.title,
          url: selected.record.url,
          journal: selected.record.journal,
          publicationYear: selected.record.publicationYear,
          isRetracted: selected.record.isRetracted,
        }
      : null,
    titleSimilarity: selected.titleSimilarity,
    passageTextImported: false,
    rightsStatus: "unverified_metadata_only",
    claimEntailmentAssessed: false,
    scientificApproval: false,
    graphPromotable: false,
    notes: selected.notes,
    contextFields: {
      model: candidate.modelAnnotation,
      tissue: null,
      population: null,
      assay: null,
      doseUnit: null,
      timepoint: null,
      intervention: null,
      outcome: candidate.outcomeAnnotation,
      correctionOrRetraction: retraction,
    },
  };
}

function summarize(results: N1CandidateResult[]): N1ImportReceipt["summary"] {
  const count = (outcome: N1VerificationOutcome) => results.filter((r) => r.outcome === outcome).length;
  return {
    total: 12,
    metadataMatchedUnreviewed: count("metadata_matched_unreviewed"),
    identityMismatch: count("identity_mismatch"),
    ambiguous: count("ambiguous_multiple_hits"),
    notFound: count("not_found"),
    lookupFailed: count("lookup_failed"),
    providerUnavailable: count("provider_unavailable"),
    rightsRestrictedMetadataOnly: count("rights_restricted_metadata_only"),
  };
}

function sealReceipt(body: Omit<N1ImportReceipt, "receiptHash">): N1ImportReceipt {
  const receiptHash = createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
  return {...body, receiptHash};
}

export function parseN1ImportReceipt(value: unknown): N1ImportReceipt {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid N1 import receipt");
  const receipt = value as N1ImportReceipt;
  if (receipt.schemaVersion !== "hsi-n1-import-receipt-1" || receipt.phase !== "N1" || receipt.programme !== "gut_immune_t2d") {
    throw new Error("Unsupported N1 import receipt");
  }
  if (receipt.scientificApproval !== false || receipt.graphPromotable !== false || receipt.claimEntailmentAssessed !== false) {
    throw new Error("N1 receipt cannot claim scientific approval or graph promotion");
  }
  if (!Array.isArray(receipt.results) || receipt.results.length !== 12) throw new Error("N1 receipt must cover all 12 candidates");
  const {receiptHash, ...body} = receipt;
  const expected = createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
  if (receiptHash !== expected) throw new Error("N1 receipt hash mismatch");
  return receipt;
}

export function verifyN1CandidatesFromLookups(input: {
  queue: N1CandidateQueue;
  lookups: Record<string, BibliographicLookupResult>;
  mode: "offline_fixture" | "live_provider";
  generatedAt: string;
  providerCapability: N1ImportReceipt["providerCapability"];
  liveAcceptance: N1ImportReceipt["liveAcceptance"];
  liveAcceptanceReason: string;
}): N1ImportReceipt {
  const queue = parseN1CandidateQueue(input.queue);
  const results = queue.candidates.map((candidate) => {
    const lookup = input.lookups[candidate.queueId];
    if (!lookup) {
      return toResult(candidate, {
        ok: false,
        provider: "europe_pmc",
        query: `DOI:"${candidate.doi}"`,
        retrievedAt: input.generatedAt,
        outcome: "timeout_or_network",
        httpStatus: null,
        detail: "No lookup result supplied for candidate",
      });
    }
    return toResult(candidate, lookup);
  });
  if (results.some((r) => r.scientificApproval || r.graphPromotable || r.claimEntailmentAssessed || r.passageTextImported)) {
    throw new Error("N1 results must remain unapproved and passage-free");
  }
  return sealReceipt({
    schemaVersion: "hsi-n1-import-receipt-1",
    phase: "N1",
    programme: "gut_immune_t2d",
    mode: input.mode,
    generatedAt: input.generatedAt,
    providerCapability: input.providerCapability,
    scientificApproval: false,
    graphPromotable: false,
    claimEntailmentAssessed: false,
    liveAcceptance: input.liveAcceptance,
    liveAcceptanceReason: input.liveAcceptanceReason,
    queueVersionHint: "hsi-n1-candidate-queue-1",
    results,
    summary: summarize(results),
  });
}

export async function verifyN1CandidatesLive(input: {
  queue: N1CandidateQueue;
  fetcher?: FetchLike;
  now?: () => Date;
}): Promise<N1ImportReceipt> {
  const queue = parseN1CandidateQueue(input.queue);
  const now = input.now ?? (() => new Date());
  const generatedAt = now().toISOString();
  const lookups: Record<string, BibliographicLookupResult> = {};
  let reachable = false;
  let blocked = false;
  let detail = "No candidates probed";
  for (const candidate of queue.candidates) {
    const lookup = await lookupEuropePmcByDoi({doi: candidate.doi, fetcher: input.fetcher, now});
    lookups[candidate.queueId] = lookup;
    if (lookup.ok) {
      reachable = true;
      detail = "Europe PMC returned HTTP 2xx for at least one DOI lookup";
    } else if (lookup.outcome === "provider_unavailable") {
      blocked = true;
      detail = lookup.detail;
    } else if (!reachable) {
      detail = lookup.detail;
    }
  }
  const liveAcceptance = blocked && !reachable ? "blocked" : reachable ? "cleared_for_metadata_only" : "blocked";
  return verifyN1CandidatesFromLookups({
    queue,
    lookups,
    mode: "live_provider",
    generatedAt,
    providerCapability: {
      provider: "europe_pmc",
      probed: true,
      reachable: reachable ? true : blocked ? false : null,
      detail,
    },
    liveAcceptance,
    liveAcceptanceReason: liveAcceptance === "cleared_for_metadata_only"
      ? "Provider reachable for metadata. Exact-text rights and claim entailment remain open; mismatches stay failed."
      : "Live N1 acceptance blocked: provider unavailable or no successful metadata responses.",
  });
}

export function verifyN1CandidatesFromFixtures(input: {
  queue: N1CandidateQueue;
  fixtures: Record<string, {httpStatus: number; bodyText: string}>;
  generatedAt: string;
  providerCapabilityDetail?: string;
}): N1ImportReceipt {
  const queue = parseN1CandidateQueue(input.queue);
  const lookups: Record<string, BibliographicLookupResult> = {};
  for (const candidate of queue.candidates) {
    const fixture = input.fixtures[candidate.queueId];
    if (!fixture) {
      lookups[candidate.queueId] = {
        ok: false,
        provider: "europe_pmc",
        query: `DOI:"${candidate.doi}"`,
        retrievedAt: input.generatedAt,
        outcome: "timeout_or_network",
        httpStatus: null,
        detail: "Missing offline fixture for candidate",
      };
      continue;
    }
    lookups[candidate.queueId] = parseEuropePmcBibliographicPayload({
      query: `DOI:"${candidate.doi}"`,
      bodyText: fixture.bodyText,
      httpStatus: fixture.httpStatus,
      retrievedAt: input.generatedAt,
    });
  }
  return verifyN1CandidatesFromLookups({
    queue,
    lookups,
    mode: "offline_fixture",
    generatedAt: input.generatedAt,
    providerCapability: {
      provider: "europe_pmc",
      probed: false,
      reachable: null,
      detail: input.providerCapabilityDetail ?? "Offline fixture replay; not a live capability clearance.",
    },
    liveAcceptance: "blocked",
    liveAcceptanceReason:
      "Offline fixture replay validates adapters and identity checks. Live N1 acceptance requires a separate provider probe.",
  });
}
