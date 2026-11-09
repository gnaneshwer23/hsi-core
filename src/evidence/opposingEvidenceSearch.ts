/**
 * PR 6 — Bounded opposing-evidence search (metadata-level).
 *
 * Extends dynamic retrieval with an explicit oppose-oriented query pass.
 * Records search performed / findings / limitations. Provider unavailable
 * is never collapsed into “no opposing evidence.” Incomplete search ≠ consensus.
 *
 * Source identity ≠ claim support. No Gate C auto-approve / CDS-PHI / graph promote.
 */
import {
  runDynamicEvidenceRetrieval,
  type DynamicRetrievalCache,
  type DynamicSearchRecord,
  type ResearcherQueryInput,
  type RetrievalOutcomeClass,
} from "./dynamicEvidenceRetrieval";
import type {ContextualCandidateRelationship} from "./contextualCandidateRelationships";
import {
  assessContradictionInvestigation,
  compareCandidatesAgainstOpposingFindings,
  type ContradictionInvestigationAssessment,
  type StructuredEvidenceComparisonPack,
} from "./structuredEvidenceComparison";

export const OPPOSING_EVIDENCE_SEARCH_SCHEMA = "hsi-opposing-evidence-search-1" as const;
export const OPPOSING_EVIDENCE_SEARCH_METHOD = "hsi.opposing_evidence_search.v1" as const;
export const OPPOSING_EVIDENCE_SEARCH_VERSION = "0.1.0" as const;

export type OpposingSearchExecutionStatus =
  | "completed_bounded"
  | "partial"
  | "provider_unavailable"
  | "successful_empty"
  | "skipped_budget"
  | "not_executed"
  | "invalid_query";

export type OpposingEvidenceFinding = {
  pmid: string | null;
  doi: string | null;
  title: string;
  polarityHint: "opposing_title_signal" | "uncertain" | "unclassified";
  note: string;
  sourceIdentityDistinctFromClaimSupport: true;
  claimSupport: "not_assessed";
};

export type OpposingEvidenceSearchScope = {
  providers: readonly ("europe_pmc" | "open_targets")[];
  contentLevel: "metadata" | "abstract-level";
  dateOfSearch: string;
  corpusNote: string;
  queryVariants: readonly string[];
  bounded: true;
};

export type OpposingEvidenceSearchReport = {
  schemaVersion: typeof OPPOSING_EVIDENCE_SEARCH_SCHEMA;
  method: typeof OPPOSING_EVIDENCE_SEARCH_METHOD;
  version: typeof OPPOSING_EVIDENCE_SEARCH_VERSION;
  searchPerformed: boolean;
  status: OpposingSearchExecutionStatus;
  searchScope: OpposingEvidenceSearchScope;
  findings: readonly OpposingEvidenceFinding[];
  recordedOpposingCandidateIds: readonly string[];
  coverage: {
    literatureAttempts: number;
    literatureHits: number;
    openTargetsAttempts: number;
    openTargetsHits: number;
    providerUnavailable: boolean;
    successfulEmpty: boolean;
    overallOutcome: RetrievalOutcomeClass | "not_executed" | "skipped_budget";
  };
  searchRecordId: string | null;
  searchRecordHash: string | null;
  limitations: readonly string[];
  /** Optional Phase 4–6 structured comparison bind (investigation categories, not conclusions). */
  structuredComparison: StructuredEvidenceComparisonPack | null;
  contradictionInvestigation: ContradictionInvestigationAssessment | null;
  consensusEstablished: false;
  providerUnavailableDistinctFromNoEvidence: true;
  scientificApproval: false;
  graphPromotable: false;
};

const OPPOSITION_QUERY_SUFFIX =
  "(contradict OR contradiction OR \"null finding\" OR \"failed to replicate\" OR opposing OR refute OR negative)";

const TITLE_OPPOSE_SIGNAL =
  /\b(contradict|refut|null find|failed to replicate|oppos|negative result|no association|not associated)\b/i;

function fail(message: string): never {
  throw new Error(message);
}

function buildOpposeQuestion(question: string): {question: string; queryVariants: string[]} {
  const base = question.trim();
  const opposeQuery = `${base} ${OPPOSITION_QUERY_SUFFIX}`.trim();
  if (opposeQuery.length > 1_000) {
    // Keep within dynamic retrieval question budget; prefer the oppose suffix.
    const truncatedBase = base.slice(0, Math.max(0, 1_000 - OPPOSITION_QUERY_SUFFIX.length - 1)).trim();
    const clipped = `${truncatedBase} ${OPPOSITION_QUERY_SUFFIX}`.trim();
    return {question: clipped, queryVariants: [clipped]};
  }
  return {question: opposeQuery, queryVariants: [opposeQuery]};
}

function polarityHintFromTitle(title: string): OpposingEvidenceFinding["polarityHint"] {
  if (TITLE_OPPOSE_SIGNAL.test(title)) return "opposing_title_signal";
  return "unclassified";
}

export function opposingSearchStatusToContextual(
  status: OpposingSearchExecutionStatus,
): "not_executed" | "stubbed_incomplete" | "recorded_traces_only" | "completed_bounded" | "provider_unavailable" {
  switch (status) {
    case "not_executed":
    case "skipped_budget":
      return "not_executed";
    case "provider_unavailable":
      return "provider_unavailable";
    case "completed_bounded":
    case "successful_empty":
    case "partial":
      return "completed_bounded";
    case "invalid_query":
      return "stubbed_incomplete";
    default: {
      const _exhaustive: never = status;
      void _exhaustive;
      return "stubbed_incomplete";
    }
  }
}

/**
 * Project opposing-search receipt fields used by the refined-brief gap envelope.
 * Empty / provider-unavailable remains scoped to this search — never “no evidence exists.”
 */
export function projectOpposingSearchCoverageForGap(input: {
  opposingSearch?: OpposingEvidenceSearchReport | null;
  resultBudget?: number | null;
}): {
  searched_sources: readonly string[];
  retrieved_records: number;
  result_budget: number | null;
  coverage_limitations: readonly string[];
  not_found_in_this_search_distinct_from_no_evidence: true;
} {
  const oppose = input.opposingSearch ?? null;
  const searched_sources = oppose?.searchScope.providers ?? [];
  const retrieved_records = oppose
    ? oppose.coverage.literatureHits + oppose.coverage.openTargetsHits
    : 0;
  const coverage_limitations = oppose
    ? [
        ...oppose.limitations,
        `contentLevel=${oppose.searchScope.contentLevel}`,
        `dateOfSearch=${oppose.searchScope.dateOfSearch}`,
        oppose.searchScope.corpusNote,
      ]
    : ["Opposing/literature search receipt not attached for this gap projection"];
  return {
    searched_sources: [...searched_sources],
    retrieved_records,
    result_budget: input.resultBudget ?? null,
    coverage_limitations: [...new Set(coverage_limitations.filter(Boolean))],
    not_found_in_this_search_distinct_from_no_evidence: true,
  };
}

/**
 * Run a bounded opposing-evidence bibliographic/association search.
 * Does not invent consensus; does not treat provider failure as empty opposition.
 */
export async function runOpposingEvidenceSearch(input: {
  question: string;
  entities?: ResearcherQueryInput["entities"];
  recordedOpposingCandidateIds?: readonly string[];
  now?: () => string;
  fetcher?: typeof fetch;
  cache?: DynamicRetrievalCache;
  signal?: AbortSignal;
  pageSize?: number;
  skipForBudget?: boolean;
}): Promise<OpposingEvidenceSearchReport> {
  const asOf = input.now?.() ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(asOf))) fail("Invalid opposing-search asOf");
  const question = input.question?.trim() ?? "";
  if (!question) fail("Opposing-evidence search requires a research question");

  const recordedOpposingCandidateIds = [...(input.recordedOpposingCandidateIds ?? [])];
  const scopeBase: Omit<OpposingEvidenceSearchScope, "queryVariants" | "dateOfSearch"> = {
    providers: ["europe_pmc", "open_targets"],
    contentLevel: "metadata",
    corpusNote: "Europe PMC + Open Targets only; metadata-level; bounded page budget — not exhaustive worldwide literature",
    bounded: true,
  };

  if (input.skipForBudget) {
    return {
      schemaVersion: OPPOSING_EVIDENCE_SEARCH_SCHEMA,
      method: OPPOSING_EVIDENCE_SEARCH_METHOD,
      version: OPPOSING_EVIDENCE_SEARCH_VERSION,
      searchPerformed: false,
      status: "skipped_budget",
      searchScope: {
        ...scopeBase,
        dateOfSearch: asOf,
        queryVariants: [],
      },
      findings: [],
      recordedOpposingCandidateIds,
      coverage: {
        literatureAttempts: 0,
        literatureHits: 0,
        openTargetsAttempts: 0,
        openTargetsHits: 0,
        providerUnavailable: false,
        successfulEmpty: false,
        overallOutcome: "skipped_budget",
      },
      searchRecordId: null,
      searchRecordHash: null,
      limitations: [
        "Opposing-evidence search skipped by resource budget",
        "Skipped oppose ≠ consensus or absence of contradiction",
        "Provider unavailable is not claimed; search was not attempted",
      ],
      structuredComparison: null,
      contradictionInvestigation: null,
      consensusEstablished: false,
      providerUnavailableDistinctFromNoEvidence: true,
      scientificApproval: false,
      graphPromotable: false,
    };
  }

  const {question: opposeQuestion, queryVariants} = buildOpposeQuestion(question);
  const retrieval = await runDynamicEvidenceRetrieval({
    query: {
      question: opposeQuestion,
      entities: input.entities,
      pageSize: input.pageSize ?? 5,
      contentAccess: "metadata",
      ordering: "relevance",
    },
    fetcher: input.fetcher,
    cache: input.cache,
    signal: input.signal,
    now: () => new Date(asOf),
  });

  const record: DynamicSearchRecord = retrieval.record;
  const coverage = record.coverage;
  const findings: OpposingEvidenceFinding[] = record.retrievedBibliographic.map((row) => ({
    pmid: row.pmid,
    doi: row.doi,
    title: row.title,
    polarityHint: polarityHintFromTitle(row.title),
    note: "Bibliographic metadata only — title oppose signals are not claim-level contradiction adjudication",
    sourceIdentityDistinctFromClaimSupport: true,
    claimSupport: "not_assessed",
  }));

  const providerFailed =
    coverage.providerUnavailable ||
    coverage.overallOutcome === "provider_unavailable" ||
    coverage.overallOutcome === "provider_http_error" ||
    coverage.overallOutcome === "timeout_or_network";

  let status: OpposingSearchExecutionStatus;
  if (providerFailed) status = "provider_unavailable";
  else if (coverage.invalidQuery || coverage.overallOutcome === "invalid_query") status = "invalid_query";
  else if (coverage.partial || coverage.truncated) status = "partial";
  else if (coverage.overallOutcome === "successful_empty" || findings.length === 0) {
    status = "successful_empty";
  } else status = "completed_bounded";

  const limitations: string[] = [
    "Bounded metadata oppose search only — not exhaustive contradiction adjudication",
    "Incomplete or empty oppose ≠ scientific consensus",
    "Source identity ≠ claim support; titles are untrusted signals",
    scopeBase.corpusNote,
    `Search date (UTC): ${asOf}`,
  ];
  if (providerFailed) {
    limitations.push(
      "Provider unavailable — must not be interpreted as ‘no opposing evidence exists’",
    );
  }
  if (status === "successful_empty") {
    limitations.push(
      "No opposing bibliographic hits in this bounded search; absence is scoped to providers/date/budget above",
    );
  }
  if (recordedOpposingCandidateIds.length > 0) {
    limitations.push(
      `Recorded opposing candidate traces (${recordedOpposingCandidateIds.length}) remain draft and require expert interpretation`,
    );
  }

  return {
    schemaVersion: OPPOSING_EVIDENCE_SEARCH_SCHEMA,
    method: OPPOSING_EVIDENCE_SEARCH_METHOD,
    version: OPPOSING_EVIDENCE_SEARCH_VERSION,
    searchPerformed: true,
    status,
    searchScope: {
      ...scopeBase,
      dateOfSearch: asOf,
      queryVariants,
    },
    findings,
    recordedOpposingCandidateIds,
    coverage: {
      literatureAttempts: coverage.literatureAttempts,
      literatureHits: coverage.literatureHits,
      openTargetsAttempts: coverage.openTargetsAttempts,
      openTargetsHits: coverage.openTargetsHits,
      providerUnavailable: providerFailed,
      successfulEmpty: status === "successful_empty",
      overallOutcome: coverage.overallOutcome,
    },
    searchRecordId: record.searchRecordHash ? `search:${record.searchRecordHash.slice(0, 24)}` : null,
    searchRecordHash: record.searchRecordHash ?? null,
    limitations,
    structuredComparison: null,
    contradictionInvestigation: null,
    consensusEstablished: false,
    providerUnavailableDistinctFromNoEvidence: true,
    scientificApproval: false,
    graphPromotable: false,
  };
}

/**
 * Wire structured evidence comparison into an opposing-search receipt.
 * Retrieves comparable candidate records, compares context against oppose hits,
 * and records investigation categories — not predetermined conclusions.
 * LLM-only rationale is never treated as verification.
 */
export function attachStructuredComparisonToOpposingSearch(input: {
  report: OpposingEvidenceSearchReport;
  candidates: readonly ContextualCandidateRelationship[];
  generatedAt?: string;
  maxPairs?: number;
}): OpposingEvidenceSearchReport {
  const generatedAt = input.generatedAt ?? input.report.searchScope.dateOfSearch;
  if (!input.candidates.length || !input.report.findings.length) {
    const emptyPack = compareCandidatesAgainstOpposingFindings({
      candidates: input.candidates,
      opposingFindings: input.report.findings,
      generatedAt,
      maxPairs: input.maxPairs,
    });
    const investigation = assessContradictionInvestigation({
      pack: emptyPack,
      generatedAt,
      searchRecordId: input.report.searchRecordId,
      searchRecordHash: input.report.searchRecordHash,
    });
    return {
      ...input.report,
      structuredComparison: emptyPack,
      contradictionInvestigation: investigation,
      limitations: [
        ...input.report.limitations,
        input.candidates.length === 0
          ? "Structured comparison abstained: no comparable candidate relationships supplied"
          : "Structured comparison abstained: no opposing bibliographic findings to compare",
        "Insufficient evidence for contradiction adjudication remains explicit — not LLM-verified",
      ],
    };
  }

  const pack = compareCandidatesAgainstOpposingFindings({
    candidates: input.candidates,
    opposingFindings: input.report.findings,
    generatedAt,
    maxPairs: input.maxPairs,
  });
  const investigation = assessContradictionInvestigation({
    pack,
    generatedAt,
    searchRecordId: input.report.searchRecordId,
    searchRecordHash: input.report.searchRecordHash,
  });

  return {
    ...input.report,
    structuredComparison: pack,
    contradictionInvestigation: investigation,
    limitations: [
      ...input.report.limitations,
      `Structured comparison pairs=${pack.comparisons.length}; potential_contradiction=${pack.summary.potentialContradiction}`,
      "Investigation categories are candidate explanation bins — not predetermined conclusions",
      "Explanations are not verified by LLM rationale alone; insufficient evidence stays explicit",
      ...investigation.persistenceLines.slice(0, 12),
    ],
  };
}
