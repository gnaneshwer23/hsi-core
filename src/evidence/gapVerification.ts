/**
 * Execution step 04 / PR 6 — deterministic gap verification with semantic
 * evidence analysis hooks against permitted local + living + oppose-search evidence.
 *
 * Distinguishes missing local data, incomplete literature coverage, contradictory
 * findings, unresolved mechanisms, unverified computational hypotheses, and
 * insufficient evidence. Search completeness and scientific novelty are separate
 * assessments — incomplete coverage never implies a verified scientific novelty gap.
 *
 * A gap is never labelled scientifically verified without expert-reviewed evaluation
 * that records search scope and date. Semantic analysis requires a supporting
 * passage or explicit reasoning record — not a classifier label alone.
 */
import type {LivingEvidenceOutcomeSection} from "./livingEvidenceExpansion";
import {
  projectOpposingSearchCoverageForGap,
  type OpposingEvidenceSearchReport,
} from "./opposingEvidenceSearch";

export const GAP_VERIFICATION_SCHEMA = "hsi-gap-verification-1" as const;
export const GAP_VERIFICATION_METHOD = "hsi-deterministic-gap-classification-1" as const;

/** Engineering + scientific gap classes (PR 6 taxonomy + retained operational kinds). */
export type GapKind =
  | "missing_local_data"
  | "incomplete_literature_coverage"
  | "contradictory_findings"
  | "unresolved_biological_mechanism"
  | "unverified_computational_hypothesis"
  | "insufficient_evidence"
  /** Retained operational / step-04 kinds (still emitted where templates match). */
  | "genuine_unresolved_question"
  | "passage_rights_blocked"
  | "oppose_search_incomplete"
  | "abstain_insufficient_evidence";

/**
 * Scientific-gap status is orthogonal to engineering classification.
 * Incomplete literature coverage → Not verified (never “verified novelty gap”).
 */
export type ScientificGapStatus =
  | "not_verified"
  | "expert_reviewed_labelled"
  | "scientifically_verified";

export type SearchCompletenessAssessment = {
  status:
    | "not_assessed"
    | "search_not_performed"
    | "incomplete_bounded"
    | "provider_unavailable"
    | "bounded_completed";
  finding: string;
  coverageNote: string;
  /** Explicit: search completeness ≠ scientific novelty. */
  impliesScientificNovelty: false;
};

export type ScientificNoveltyAssessment = {
  status: "not_assessed" | "not_verified";
  note: string;
  /** Novelty claims require expert-reviewed evaluation with search scope/date. */
  expertReviewRequired: true;
};

export type SemanticGapSupport = {
  kind: "supporting_passage" | "explicit_reasoning_record" | "absent";
  passageRef: string | null;
  reasoningRecord: string | null;
  /** Semantic analysis is refused when support is absent. */
  acceptedForSemanticAnalysis: boolean;
  refusalReason: string | null;
};

export type ExpertReviewedGapAssessment = {
  status: "not_reviewed" | "expert_reviewed";
  scientificGapStatus: Exclude<ScientificGapStatus, "scientifically_verified">;
  reviewerId: string | null;
  assessedAt: string | null;
  /** Required when expert_reviewed — must not imply nobody ever investigated. */
  searchScope: {
    providers: readonly string[];
    contentLevel: string;
    dateOfSearch: string;
    corpusNote: string;
  } | null;
  note: string;
};

export type GapVerificationItem = {
  id: string;
  branchId: string | null;
  sourceField: "missingEvidence" | "uncertainty";
  recordedText: string;
  kind: GapKind;
  rationale: string;
  scientificGapStatus: ScientificGapStatus;
  searchCompleteness: SearchCompletenessAssessment;
  scientificNovelty: ScientificNoveltyAssessment;
  semanticSupport: SemanticGapSupport;
  expertReview: ExpertReviewedGapAssessment;
  trace: {
    supportingClaimIds: string[];
    opposingClaimIds: string[];
    matchedLivingPmids: string[];
    openTargetsDiseaseIds: string[];
    localSourcePmids: string[];
    opposingSearchStatus: string | null;
  };
  expertLabelStatus: "unavailable" | "recorded";
  scientificallyValidated: false;
};

export type GapVerificationReport = {
  schemaVersion: typeof GAP_VERIFICATION_SCHEMA;
  method: typeof GAP_VERIFICATION_METHOD;
  asOf: string;
  items: GapVerificationItem[];
  summary: {
    missingLocalData: number;
    incompleteLiteratureCoverage: number;
    contradictoryFindings: number;
    unresolvedBiologicalMechanism: number;
    unverifiedComputationalHypothesis: number;
    insufficientEvidence: number;
    genuineUnresolved: number;
    passageRightsBlocked: number;
    opposeSearchIncomplete: number;
    abstain: number;
  };
  honesty: {
    smeGoldFilled: false;
    expertLabelsAvailable: boolean;
    scientificallyValidated: false;
    humanQueueBlocked: readonly ["#4"];
    passageImportAuthorized: false;
    searchCompletenessDistinctFromScientificNovelty: true;
    incompleteCoverageDoesNotVerifyNoveltyGap: true;
  };
  unavailableCapabilities: string[];
  note: string;
};

export type GapVerificationOutcomeSection = GapVerificationReport & {
  status: "classified_against_bound_evidence" | "classified_local_only" | "empty";
};

type BranchInput = {
  id: string;
  assessment: string;
  supportingClaimIds: readonly string[];
  opposingClaimIds: readonly string[];
  missingEvidence: readonly string[];
  uncertainty: readonly string[];
};

type ClaimContextInput = {
  claimId: string;
  context: {
    tissueId?: string | null;
    assay?: string | null;
    diseaseStage?: string | null;
    experimentalSystem?: string | null;
    species?: string | null;
  };
};

export type GapVerificationInput = {
  asOf?: string;
  branches: readonly BranchInput[];
  claimContexts: readonly ClaimContextInput[];
  localSourcePmids: readonly (string | null | undefined)[];
  contradictions: {recordedOpposingClaimIds: readonly string[]; searchStatus: string};
  livingEvidence: LivingEvidenceOutcomeSection;
  /** Optional PR 6 opposing-evidence search receipt. */
  opposingSearch?: OpposingEvidenceSearchReport | null;
  /** Optional semantic supports keyed by recorded gap text or gap id. */
  semanticSupports?: readonly {
    matchText?: string;
    gapId?: string;
    supportingPassage?: string | null;
    reasoningRecord?: string | null;
    passageRef?: string | null;
  }[];
  /** Optional expert-reviewed assessments keyed by gap id (never auto-verify science). */
  expertReviews?: readonly {
    gapId: string;
    reviewerId: string;
    assessedAt: string;
    searchScope: {
      providers: readonly string[];
      contentLevel: string;
      dateOfSearch: string;
      corpusNote: string;
    };
    note?: string;
  }[];
};

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter((v) => typeof v === "string" && v.trim()))];
}

function contextPresent(claimContexts: readonly ClaimContextInput[], claimIds: readonly string[]): boolean {
  return claimIds.some((id) => {
    const c = claimContexts.find((row) => row.claimId === id);
    if (!c) return false;
    return Boolean(
      c.context.tissueId ||
        c.context.assay ||
        c.context.diseaseStage ||
        c.context.experimentalSystem ||
        c.context.species,
    );
  });
}

function buildSemanticSupport(input: {
  supportingPassage?: string | null;
  reasoningRecord?: string | null;
  passageRef?: string | null;
}): SemanticGapSupport {
  const passage = input.supportingPassage?.trim() || null;
  const reasoning = input.reasoningRecord?.trim() || null;
  const passageRef = input.passageRef?.trim() || null;
  if (passage) {
    return {
      kind: "supporting_passage",
      passageRef,
      reasoningRecord: reasoning,
      acceptedForSemanticAnalysis: true,
      refusalReason: null,
    };
  }
  if (reasoning) {
    return {
      kind: "explicit_reasoning_record",
      passageRef,
      reasoningRecord: reasoning,
      acceptedForSemanticAnalysis: true,
      refusalReason: null,
    };
  }
  return {
    kind: "absent",
    passageRef: null,
    reasoningRecord: null,
    acceptedForSemanticAnalysis: false,
    refusalReason:
      "Semantic gap analysis requires a supporting passage or explicit reasoning record — classifier label alone is insufficient",
  };
}

/**
 * Refuse “semantic” gap analysis when neither a passage nor a reasoning record is supplied.
 */
export function requireSemanticGapSupport(input: {
  supportingPassage?: string | null;
  reasoningRecord?: string | null;
  passageRef?: string | null;
}): SemanticGapSupport {
  return buildSemanticSupport(input);
}

/**
 * Expert-reviewed gap assessment must record search scope + date and must not
 * imply worldwide absence of investigation. Never sets scientifically_verified.
 */
export function buildExpertReviewedGapAssessment(input: {
  reviewerId: string;
  assessedAt: string;
  searchScope: {
    providers: readonly string[];
    contentLevel: string;
    dateOfSearch: string;
    corpusNote: string;
  };
  note?: string;
}): ExpertReviewedGapAssessment {
  if (!input.reviewerId.trim()) throw Error("Expert gap assessment requires reviewerId");
  if (!Number.isFinite(Date.parse(input.assessedAt))) throw Error("Invalid expert assessment date");
  if (!Number.isFinite(Date.parse(input.searchScope.dateOfSearch))) {
    throw Error("Expert gap assessment requires dateOfSearch");
  }
  if (!input.searchScope.providers.length) throw Error("Expert gap assessment requires search scope providers");
  if (!input.searchScope.contentLevel.trim() || !input.searchScope.corpusNote.trim()) {
    throw Error("Expert gap assessment requires contentLevel and corpusNote");
  }
  return {
    status: "expert_reviewed",
    scientificGapStatus: "expert_reviewed_labelled",
    reviewerId: input.reviewerId.trim(),
    assessedAt: input.assessedAt,
    searchScope: {
      providers: [...input.searchScope.providers],
      contentLevel: input.searchScope.contentLevel,
      dateOfSearch: input.searchScope.dateOfSearch,
      corpusNote: input.searchScope.corpusNote,
    },
    note:
      input.note?.trim() ||
      "Expert-reviewed engineering label only. Scope/date bound the search — does not imply nobody has investigated the question. Scientifically verified remains false pending acceptance (#4).",
  };
}

function defaultExpertReview(): ExpertReviewedGapAssessment {
  return {
    status: "not_reviewed",
    scientificGapStatus: "not_verified",
    reviewerId: null,
    assessedAt: null,
    searchScope: null,
    note: "Expert review unavailable (human queue #4 PARKED). Scientific-gap status remains not_verified.",
  };
}

function assessSearchCompleteness(input: {
  opposingSearch: OpposingEvidenceSearchReport | null | undefined;
  contradictions: GapVerificationInput["contradictions"];
  text: string;
}): SearchCompletenessAssessment {
  const oppose = input.opposingSearch;
  const providerFailed =
    oppose?.coverage.providerUnavailable === true ||
    oppose?.status === "provider_unavailable" ||
    oppose?.coverage.overallOutcome === "provider_unavailable" ||
    oppose?.coverage.overallOutcome === "provider_http_error" ||
    oppose?.coverage.overallOutcome === "timeout_or_network";
  if (providerFailed && oppose) {
    return {
      status: "provider_unavailable",
      finding: "Provider unavailable during opposing/literature search",
      coverageNote:
        oppose.searchScope.corpusNote ||
        "Provider unavailable ≠ no evidence; search completeness incomplete",
      impliesScientificNovelty: false,
    };
  }
  if (oppose?.searchPerformed) {
    const empty =
      oppose.status === "successful_empty" ||
      (oppose.findings.length === 0 && !oppose.coverage.providerUnavailable);
    return {
      status: empty || oppose.status === "partial" ? "incomplete_bounded" : "bounded_completed",
      finding: empty
        ? "no relevant study retrieved (bounded oppose/literature pass)"
        : `bounded search returned ${oppose.findings.length} bibliographic hit(s)`,
      coverageNote: `${oppose.searchScope.corpusNote}; contentLevel=${oppose.searchScope.contentLevel}; dateOfSearch=${oppose.searchScope.dateOfSearch}`,
      impliesScientificNovelty: false,
    };
  }
  if (
    input.contradictions.searchStatus === "not_recorded" ||
    input.contradictions.searchStatus === "not_executed" ||
    input.contradictions.searchStatus === "skipped_budget" ||
    input.contradictions.searchStatus === "stubbed_incomplete"
  ) {
    return {
      status: "search_not_performed",
      finding: /no relevant study|not retrieved|no study/i.test(input.text)
        ? "no relevant study retrieved"
        : "Opposing/literature search not completed in this audit",
      coverageNote: "Search completeness unknown or incomplete; does not establish scientific novelty",
      impliesScientificNovelty: false,
    };
  }
  return {
    status: "not_assessed",
    finding: "Search completeness not separately audited for this gap text",
    coverageNote: "Engineering classification only",
    impliesScientificNovelty: false,
  };
}

function assessScientificNovelty(
  searchCompleteness: SearchCompletenessAssessment,
  kind: GapKind,
): ScientificNoveltyAssessment {
  if (
    kind === "incomplete_literature_coverage" ||
    searchCompleteness.status === "incomplete_bounded" ||
    searchCompleteness.status === "search_not_performed" ||
    searchCompleteness.status === "provider_unavailable"
  ) {
    return {
      status: "not_verified",
      note:
        "Search completeness and scientific novelty are separate. Incomplete or empty bounded search does not verify a scientific novelty gap.",
      expertReviewRequired: true,
    };
  }
  return {
    status: "not_assessed",
    note: "Scientific novelty is not assessed by the engineering classifier; expert-reviewed evaluation with search scope/date is required.",
    expertReviewRequired: true,
  };
}

function classifyGap(input: {
  text: string;
  branch: BranchInput | null;
  claimContexts: readonly ClaimContextInput[];
  contradictions: GapVerificationInput["contradictions"];
  livingEvidence: LivingEvidenceOutcomeSection;
  localSourcePmids: readonly string[];
  opposingSearch: OpposingEvidenceSearchReport | null | undefined;
  searchCompleteness: SearchCompletenessAssessment;
}): {kind: GapKind; rationale: string} {
  const text = input.text;
  const supporting = input.branch?.supportingClaimIds ?? [];
  const opposing = input.branch?.opposingClaimIds ?? [];
  const livingBound = input.livingEvidence.status === "bound_metadata_refresh";
  const livingPmids = input.livingEvidence.matchedPmids;
  const passageBlocked =
    livingBound &&
    (input.livingEvidence.licensing?.humanCleared === false ||
      input.livingEvidence.licensing?.passageImportAuthorized === false ||
      input.livingEvidence.unavailableCapabilities.some((s) => /passage import/i.test(s)));

  // PR 6 critical path: empty/incomplete search → incomplete literature coverage, novelty not verified.
  if (
    /no relevant study|no study retrieved|literature coverage|successful_empty|bounded search returned 0/i.test(
      text,
    ) ||
    (input.searchCompleteness.finding.includes("no relevant study retrieved") &&
      /coverage|literature|study|retrieve|oppose/i.test(text))
  ) {
    return {
      kind: "incomplete_literature_coverage",
      rationale:
        "Bounded search completeness is incomplete (e.g. no relevant study retrieved under Europe PMC / abstract-or-metadata-level coverage). Scientific-gap / novelty status remains not_verified — incomplete coverage ≠ verified scientific novelty gap.",
    };
  }

  if (/computational|in silico|simulation|model-derived|algorithmic hypothesis/i.test(text)) {
    return {
      kind: "unverified_computational_hypothesis",
      rationale:
        "Recorded gap concerns a computational / model-derived hypothesis that lacks expert-verified experimental support in this audit.",
    };
  }

  if (/contradictor|opposing|null findings|contradictory findings/i.test(text)) {
    if (opposing.length > 0 || input.contradictions.recordedOpposingClaimIds.length > 0) {
      return {
        kind: "contradictory_findings",
        rationale:
          "Opposing claim bindings are recorded. Contradiction search is not exhaustive; expert adjudication is unavailable (#4 PARKED). Scientific-gap status remains not_verified.",
      };
    }
    if (
      input.contradictions.searchStatus === "not_recorded" ||
      input.contradictions.searchStatus === "not_executed" ||
      input.contradictions.searchStatus === "skipped_budget" ||
      input.contradictions.searchStatus === "stubbed_incomplete"
    ) {
      return {
        kind: "oppose_search_incomplete",
        rationale:
          "No opposing traces and no completed contradiction-search audit. Absence of oppose rows is not consensus.",
      };
    }
    if (input.opposingSearch?.status === "provider_unavailable") {
      return {
        kind: "incomplete_literature_coverage",
        rationale:
          "Opposing-evidence provider was unavailable. Provider unavailable ≠ no contradictory evidence; scientific novelty not verified.",
      };
    }
    if (input.opposingSearch?.searchPerformed && input.opposingSearch.findings.length === 0) {
      return {
        kind: "incomplete_literature_coverage",
        rationale:
          "Opposing-evidence search completed within bounded providers/date with no hits. Incomplete coverage ≠ verified absence of contradiction or novelty gap.",
      };
    }
    return {
      kind: "insufficient_evidence",
      rationale: "Contradiction status cannot be classified from the available audit fields.",
    };
  }

  if (/approved source-linked claims|biological mechanism|mechanism gap|pathway|signalling|signaling/i.test(text)) {
    if (supporting.length > 0) {
      return {
        kind: "unresolved_biological_mechanism",
        rationale:
          "Local source-linked claims are bound, yet the mechanism assessment remains unresolved pending independent scientific review. Not SME-ranked.",
      };
    }
    if (livingBound && livingPmids.length > 0) {
      return {
        kind: passageBlocked ? "passage_rights_blocked" : "missing_local_data",
        rationale: passageBlocked
          ? "Living-evidence bibliographic identities overlap pins, but passage import remains fail-closed (humanCleared=false)."
          : "Living-evidence metadata is bound without local approved claim bindings for this mechanism gap.",
      };
    }
    return {
      kind: "missing_local_data",
      rationale: "No local supporting claims and no overlapping living-evidence PMIDs for this mechanism gap.",
    };
  }

  if (/disease stage|tissue|assay context/i.test(text)) {
    if (contextPresent(input.claimContexts, supporting)) {
      return {
        kind: "genuine_unresolved_question",
        rationale:
          "Some biological context fields exist on bound claims, but disease-stage / tissue / assay completeness is still recorded as unresolved.",
      };
    }
    return {
      kind: "missing_local_data",
      rationale: "Bound claims do not carry the disease-stage / tissue / assay context this gap requests.",
    };
  }

  if (/no evidence retrieval|not established by its inclusion/i.test(text)) {
    if (livingBound) {
      return {
        kind: passageBlocked ? "passage_rights_blocked" : "genuine_unresolved_question",
        rationale: passageBlocked
          ? "Planner uncertainty remains; living-evidence metadata refresh is bound but passages are not cleared for entailment."
          : "Planner did not retrieve evidence; living-evidence metadata is bound and still requires independent assessment.",
      };
    }
    if (input.localSourcePmids.length > 0) {
      return {
        kind: "genuine_unresolved_question",
        rationale:
          "Local package sources exist, but the question planner recorded that retrieval was not performed for this branch.",
      };
    }
    return {
      kind: "missing_local_data",
      rationale: "No local source PMIDs and no living-evidence bind; planner retrieval was not performed.",
    };
  }

  if (input.searchCompleteness.status === "incomplete_bounded" || input.searchCompleteness.status === "provider_unavailable") {
    return {
      kind: "incomplete_literature_coverage",
      rationale:
        "Search completeness is incomplete or provider-unavailable under a bounded corpus. Scientific novelty remains not_verified.",
    };
  }

  if (supporting.length > 0 || opposing.length > 0 || livingBound) {
    return {
      kind: "abstain_insufficient_evidence",
      rationale:
        "Evidence is partially present, but this recorded gap text does not match a classified template — abstaining rather than inventing a scientific rank.",
    };
  }
  return {
    kind: "missing_local_data",
    rationale: "No local claim bindings and no living-evidence overlap address this recorded gap.",
  };
}

export function verifyRecordedGaps(input: GapVerificationInput): GapVerificationReport {
  const asOf = input.asOf ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(asOf))) throw Error("Invalid gap verification asOf");
  const localSourcePmids = unique(
    input.localSourcePmids.filter((p): p is string => typeof p === "string" && /^[1-9]\d{0,8}$/.test(p)),
  );
  const openTargetsDiseaseIds = unique(
    input.livingEvidence.openTargetsAssociations.map((a) => a.diseaseId),
  );
  const expertByGapId = new Map(
    (input.expertReviews ?? []).map((row) => [
      row.gapId,
      buildExpertReviewedGapAssessment({
        reviewerId: row.reviewerId,
        assessedAt: row.assessedAt,
        searchScope: row.searchScope,
        note: row.note,
      }),
    ]),
  );
  const items: GapVerificationItem[] = [];
  let seq = 0;
  for (const branch of input.branches) {
    const push = (sourceField: "missingEvidence" | "uncertainty", recordedText: string) => {
      if (typeof recordedText !== "string" || !recordedText.trim() || recordedText.length > 2000) {
        throw Error("Invalid gap text");
      }
      seq += 1;
      const id = `gap-${seq.toString().padStart(3, "0")}`;
      const searchCompleteness = assessSearchCompleteness({
        opposingSearch: input.opposingSearch,
        contradictions: input.contradictions,
        text: recordedText,
      });
      const {kind, rationale} = classifyGap({
        text: recordedText,
        branch,
        claimContexts: input.claimContexts,
        contradictions: input.contradictions,
        livingEvidence: input.livingEvidence,
        localSourcePmids,
        opposingSearch: input.opposingSearch,
        searchCompleteness,
      });
      const scientificNovelty = assessScientificNovelty(searchCompleteness, kind);
      const semanticMatch = (input.semanticSupports ?? []).find(
        (s) => s.gapId === id || (s.matchText && s.matchText === recordedText),
      );
      const semanticSupport = buildSemanticSupport({
        supportingPassage: semanticMatch?.supportingPassage,
        reasoningRecord: semanticMatch?.reasoningRecord,
        passageRef: semanticMatch?.passageRef,
      });
      const expertReview = expertByGapId.get(id) ?? defaultExpertReview();
      // Engineering path never emits scientifically_verified.
      if (expertReview.scientificGapStatus === ("scientifically_verified" as ScientificGapStatus)) {
        throw Error("Gap verification refuses scientifically_verified without separate acceptance gate");
      }
      items.push({
        id,
        branchId: branch.id,
        sourceField,
        recordedText,
        kind,
        rationale,
        scientificGapStatus: expertReview.status === "expert_reviewed" ? "expert_reviewed_labelled" : "not_verified",
        searchCompleteness,
        scientificNovelty,
        semanticSupport,
        expertReview,
        trace: {
          supportingClaimIds: [...branch.supportingClaimIds],
          opposingClaimIds: [...branch.opposingClaimIds],
          matchedLivingPmids: [...input.livingEvidence.matchedPmids],
          openTargetsDiseaseIds,
          localSourcePmids,
          opposingSearchStatus: input.opposingSearch?.status ?? input.contradictions.searchStatus,
        },
        expertLabelStatus: expertReview.status === "expert_reviewed" ? "recorded" : "unavailable",
        scientificallyValidated: false,
      });
    };
    for (const text of branch.missingEvidence) push("missingEvidence", text);
    for (const text of branch.uncertainty) push("uncertainty", text);
  }

  const summary = {
    missingLocalData: items.filter((i) => i.kind === "missing_local_data").length,
    incompleteLiteratureCoverage: items.filter((i) => i.kind === "incomplete_literature_coverage").length,
    contradictoryFindings: items.filter((i) => i.kind === "contradictory_findings").length,
    unresolvedBiologicalMechanism: items.filter((i) => i.kind === "unresolved_biological_mechanism").length,
    unverifiedComputationalHypothesis: items.filter((i) => i.kind === "unverified_computational_hypothesis")
      .length,
    insufficientEvidence: items.filter((i) => i.kind === "insufficient_evidence").length,
    genuineUnresolved: items.filter((i) => i.kind === "genuine_unresolved_question").length,
    passageRightsBlocked: items.filter((i) => i.kind === "passage_rights_blocked").length,
    opposeSearchIncomplete: items.filter((i) => i.kind === "oppose_search_incomplete").length,
    abstain: items.filter((i) => i.kind === "abstain_insufficient_evidence").length,
  };

  const anyExpert = items.some((i) => i.expertReview.status === "expert_reviewed");

  return {
    schemaVersion: GAP_VERIFICATION_SCHEMA,
    method: GAP_VERIFICATION_METHOD,
    asOf,
    items,
    summary,
    honesty: {
      smeGoldFilled: false,
      expertLabelsAvailable: anyExpert,
      scientificallyValidated: false,
      humanQueueBlocked: ["#4"],
      passageImportAuthorized: false,
      searchCompletenessDistinctFromScientificNovelty: true,
      incompleteCoverageDoesNotVerifyNoveltyGap: true,
    },
    unavailableCapabilities: [
      "Expert-labelled scientific gap ranking accepted as gold (human queue #4 PARKED; smeGoldFilled=false)",
      "Passage-backed entailment against uncleared passages (human queue #2 PARKED)",
      "Gate C auto-approve / MoU legalBinding (forbidden)",
      "Declaring scientifically_verified gaps without expert-reviewed evaluation that records search scope and date",
      "Treating incomplete literature coverage as verified scientific novelty",
    ],
    note:
      "Engineering classification only: separates missing local data, incomplete literature coverage, contradictory findings, unresolved mechanisms, unverified computational hypotheses, and insufficient evidence. Search completeness ≠ scientific novelty. Not scientist-ranked and not scientifically validated.",
  };
}

export function projectGapVerificationForOutcome(input: GapVerificationInput): GapVerificationOutcomeSection {
  const report = verifyRecordedGaps(input);
  const status: GapVerificationOutcomeSection["status"] = !report.items.length
    ? "empty"
    : input.livingEvidence.status === "bound_metadata_refresh"
      ? "classified_against_bound_evidence"
      : "classified_local_only";
  return {...report, status};
}

/** Refined-brief gap-assessment envelope (projection only — not a parallel classifier). */
export const GAP_ASSESSMENT_RECORD_SCHEMA = "hsi-gap-assessment-record-1" as const;

export type GapAssessmentVerificationStatus = "not_verified" | "expert_reviewed_labelled";

export type GapAssessmentRecord = {
  schemaVersion: typeof GAP_ASSESSMENT_RECORD_SCHEMA;
  gap_id: string;
  investigation_id: string;
  gap_type: GapKind;
  question: string;
  searched_sources: readonly string[];
  retrieved_records: number;
  result_budget: number | null;
  coverage_limitations: readonly string[];
  contradictions: readonly string[];
  missing_local_data: readonly string[];
  unresolved_mechanisms: readonly string[];
  verification_status: GapAssessmentVerificationStatus;
  expert_review_required: true;
  next_research_action: string;
  honesty: {
    searchCompletenessDistinctFromScientificNovelty: true;
    notFoundInThisSearchDistinctFromNoEvidence: true;
    scientificallyVerifiedForbiddenWithoutExpertReview: true;
    projectedFromGapVerification: true;
    notAParallelGapSystem: true;
  };
};

function defaultNextResearchAction(item: GapVerificationItem): string {
  switch (item.kind) {
    case "incomplete_literature_coverage":
    case "oppose_search_incomplete":
      return "Expand bounded literature/oppose search (providers, date, content level) and re-assess; do not treat empty hits as worldwide absence";
    case "missing_local_data":
    case "passage_rights_blocked":
      return "Clear passage/rights or bind approved local source-linked claims before re-classifying";
    case "contradictory_findings":
      return "Preserve contradiction traces for expert adjudication; do not silently resolve";
    case "unresolved_biological_mechanism":
      return "Seek expert-reviewed mechanistic evaluation with recorded search scope and date";
    case "unverified_computational_hypothesis":
      return "Keep computational hypothesis unverified pending experimental/expert review";
    case "insufficient_evidence":
    case "abstain_insufficient_evidence":
    case "genuine_unresolved_question":
      return "Record next retrieval or expert-review action; abstain rather than invent scientific novelty";
    default: {
      const _exhaustive: never = item.kind;
      void _exhaustive;
      return "Expert review required before any verified scientific-gap label";
    }
  }
}

function verificationStatusForItem(item: GapVerificationItem): GapAssessmentVerificationStatus {
  if (item.scientificGapStatus === "scientifically_verified") {
    throw Error("Gap assessment record refuses scientifically_verified without separate acceptance gate");
  }
  if (item.scientificGapStatus === "expert_reviewed_labelled") return "expert_reviewed_labelled";
  return "not_verified";
}

/**
 * Map one gap-verification item onto the refined brief's gap JSON envelope.
 * Defaults verification_status to not_verified; expert review remains required.
 */
export function projectGapAssessmentRecord(input: {
  investigationId: string;
  question: string;
  item: GapVerificationItem;
  report: Pick<GapVerificationReport, "summary" | "items" | "honesty">;
  opposingSearch?: OpposingEvidenceSearchReport | null;
  resultBudget?: number | null;
  nextResearchAction?: string | null;
}): GapAssessmentRecord {
  const investigation_id = input.investigationId.trim();
  const question = input.question.trim();
  if (!investigation_id) throw Error("Gap assessment record requires investigation_id");
  if (!question) throw Error("Gap assessment record requires question");

  const coverage = projectOpposingSearchCoverageForGap({
    opposingSearch: input.opposingSearch,
    resultBudget: input.resultBudget,
  });

  const contradictions: string[] = [];
  if (input.item.kind === "contradictory_findings" || input.item.trace.opposingClaimIds.length > 0) {
    contradictions.push(
      ...input.item.trace.opposingClaimIds.map((id) => `opposing_claim:${id}`),
      input.item.recordedText,
    );
  }
  if (input.report.summary.contradictoryFindings > 0 && input.item.kind === "contradictory_findings") {
    contradictions.push(input.item.rationale);
  }

  const missing_local_data =
    input.item.kind === "missing_local_data" || input.item.kind === "passage_rights_blocked"
      ? [input.item.recordedText]
      : [];
  const unresolved_mechanisms =
    input.item.kind === "unresolved_biological_mechanism" ||
    input.item.kind === "unverified_computational_hypothesis"
      ? [input.item.recordedText]
      : [];

  const verification_status = verificationStatusForItem(input.item);

  return {
    schemaVersion: GAP_ASSESSMENT_RECORD_SCHEMA,
    gap_id: input.item.id,
    investigation_id,
    gap_type: input.item.kind,
    question,
    searched_sources: coverage.searched_sources,
    retrieved_records: coverage.retrieved_records,
    result_budget: coverage.result_budget,
    coverage_limitations: [
      ...coverage.coverage_limitations,
      input.item.searchCompleteness.coverageNote,
      `search_completeness=${input.item.searchCompleteness.status}`,
      "Search completeness ≠ scientific novelty",
    ],
    contradictions: unique(contradictions),
    missing_local_data,
    unresolved_mechanisms,
    verification_status,
    expert_review_required: true,
    next_research_action: input.nextResearchAction?.trim() || defaultNextResearchAction(input.item),
    honesty: {
      searchCompletenessDistinctFromScientificNovelty: true,
      notFoundInThisSearchDistinctFromNoEvidence: true,
      scientificallyVerifiedForbiddenWithoutExpertReview: true,
      projectedFromGapVerification: true,
      notAParallelGapSystem: true,
    },
  };
}

/** Project every item in a gap-verification report onto refined-brief gap envelopes. */
export function projectGapAssessmentRecords(input: {
  investigationId: string;
  question: string;
  report: GapVerificationReport | GapVerificationOutcomeSection;
  opposingSearch?: OpposingEvidenceSearchReport | null;
  resultBudget?: number | null;
}): GapAssessmentRecord[] {
  return input.report.items.map((item) =>
    projectGapAssessmentRecord({
      investigationId: input.investigationId,
      question: input.question,
      item,
      report: input.report,
      opposingSearch: input.opposingSearch,
      resultBudget: input.resultBudget,
    }),
  );
}

const GAP_KINDS: readonly GapKind[] = [
  "missing_local_data",
  "incomplete_literature_coverage",
  "contradictory_findings",
  "unresolved_biological_mechanism",
  "unverified_computational_hypothesis",
  "insufficient_evidence",
  "genuine_unresolved_question",
  "passage_rights_blocked",
  "oppose_search_incomplete",
  "abstain_insufficient_evidence",
] as const;

function asGapKind(value: string): GapKind {
  if ((GAP_KINDS as readonly string[]).includes(value)) return value as GapKind;
  return "insufficient_evidence";
}

/**
 * Project durable gap-assessment stage rows (already classified) onto brief envelopes
 * without re-running the classifier — avoids double-classification drift.
 */
export function projectGapAssessmentRecordsFromDurableItems(input: {
  investigationId: string;
  question: string;
  items: readonly {
    id: string;
    classification: string;
    rationale: string;
    scientificGapStatus: string;
    searchCompleteness: string;
    scientificNovelty: string;
  }[];
  summary?: GapVerificationReport["summary"] | null;
  opposingSearch?: OpposingEvidenceSearchReport | null;
  resultBudget?: number | null;
  nextResearchActions?: readonly string[];
}): GapAssessmentRecord[] {
  const investigation_id = input.investigationId.trim();
  const question = input.question.trim();
  if (!investigation_id) throw Error("Gap assessment record requires investigation_id");
  if (!question) throw Error("Gap assessment record requires question");

  // Opposing-search coverage is applied inside projectGapAssessmentRecord
  // (searched_sources / retrieved_records / result_budget / coverage_limitations).
  const defaultAction = input.nextResearchActions?.[0]?.trim();

  return input.items.map((row, index) => {
    const gap_type = asGapKind(row.classification);
    const verification_status: GapAssessmentVerificationStatus =
      row.scientificGapStatus === "expert_reviewed_labelled"
        ? "expert_reviewed_labelled"
        : "not_verified";
    if (row.scientificGapStatus === "scientifically_verified") {
      throw Error("Gap assessment record refuses scientifically_verified without separate acceptance gate");
    }
    const completenessStatus: SearchCompletenessAssessment["status"] = (
      [
        "not_assessed",
        "search_not_performed",
        "incomplete_bounded",
        "provider_unavailable",
        "bounded_completed",
      ] as const
    ).includes(row.searchCompleteness as SearchCompletenessAssessment["status"])
      ? (row.searchCompleteness as SearchCompletenessAssessment["status"])
      : "not_assessed";
    const synthetic: GapVerificationItem = {
      id: row.id,
      branchId: null,
      sourceField: "missingEvidence",
      recordedText: row.rationale,
      kind: gap_type,
      rationale: row.rationale,
      scientificGapStatus: verification_status,
      searchCompleteness: {
        status: completenessStatus,
        finding: row.searchCompleteness,
        coverageNote: `durable_search_completeness=${row.searchCompleteness}`,
        impliesScientificNovelty: false,
      },
      scientificNovelty: {
        status: "not_verified",
        note: row.scientificNovelty,
        expertReviewRequired: true,
      },
      semanticSupport: {
        kind: "absent",
        passageRef: null,
        reasoningRecord: null,
        acceptedForSemanticAnalysis: false,
        refusalReason: null,
      },
      expertReview:
        verification_status === "expert_reviewed_labelled"
          ? {
              ...defaultExpertReview(),
              status: "expert_reviewed",
              scientificGapStatus: "expert_reviewed_labelled",
              note: "Expert-reviewed label carried from durable gap stage; scientifically verified remains false.",
            }
          : defaultExpertReview(),
      trace: {
        supportingClaimIds: [],
        opposingClaimIds: [],
        matchedLivingPmids: [],
        openTargetsDiseaseIds: [],
        localSourcePmids: [],
        opposingSearchStatus: input.opposingSearch?.status ?? null,
      },
      expertLabelStatus: verification_status === "expert_reviewed_labelled" ? "recorded" : "unavailable",
      scientificallyValidated: false,
    };
    // Prefer the shared projector so honesty / coverage mapping stay single-sourced.
    return projectGapAssessmentRecord({
      investigationId: investigation_id,
      question,
      item: synthetic,
      report: {
        summary: input.summary ?? {
          missingLocalData: 0,
          incompleteLiteratureCoverage: 0,
          contradictoryFindings: 0,
          unresolvedBiologicalMechanism: 0,
          unverifiedComputationalHypothesis: 0,
          insufficientEvidence: 0,
          genuineUnresolved: 0,
          passageRightsBlocked: 0,
          opposeSearchIncomplete: 0,
          abstain: 0,
        },
        items: [synthetic],
        honesty: {
          smeGoldFilled: false,
          expertLabelsAvailable: verification_status === "expert_reviewed_labelled",
          scientificallyValidated: false,
          humanQueueBlocked: ["#4"],
          passageImportAuthorized: false,
          searchCompletenessDistinctFromScientificNovelty: true,
          incompleteCoverageDoesNotVerifyNoveltyGap: true,
        },
      },
      opposingSearch: input.opposingSearch,
      resultBudget: input.resultBudget,
      nextResearchAction:
        input.nextResearchActions?.[index]?.trim() ||
        defaultAction ||
        defaultNextResearchAction(synthetic),
    });
  });
}
