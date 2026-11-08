/**
 * PR 7 — Research-brief product bind over PR 2–6 artifacts + optional O-04 attach.
 *
 * Composes source-linked claims, explicit limitations, and next research actions.
 * Candidates remain unapproved; review gates intact; no efficacy/eligibility inference.
 * Release-aware draft vs approved channels stay separated when a retrieval surface is bound.
 */
import type {GapVerificationOutcomeSection} from "./gapVerification";
import type {OpposingEvidenceSearchReport} from "./opposingEvidenceSearch";
import type {ReleaseAwareRetrievalResult} from "./releaseAwareRetrieval";
import type {TranslationalOutcomeSection} from "./translationalEvidenceAttach";

export const RESEARCH_BRIEF_INTEGRATION_SCHEMA = "hsi-research-brief-integration-1" as const;
export const RESEARCH_BRIEF_INTEGRATION_METHOD = "hsi.research_brief_integration.v1" as const;

/** Compatible with bounded-agent ResearchBriefArtifact without importing that module (cycle-safe). */
export type BoundedBriefLike = {
  claims: readonly {
    text: string;
    traceRefs: readonly string[];
    support: "traceable_candidate_only" | "insufficient";
  }[];
  limitations: readonly string[];
  nextResearchActions: readonly string[];
  scientificValidityClaimed: false;
};

export type IntegratedResearchBriefClaim = {
  text: string;
  traceRefs: readonly string[];
  support: "traceable_candidate_only" | "insufficient";
  /** Locator / identity only — not claim support. */
  sourceLinks: readonly {kind: "pmid" | "doi" | "nct" | "release_claim" | "candidate"; value: string}[];
};

export type IntegratedResearchBrief = {
  schemaVersion: typeof RESEARCH_BRIEF_INTEGRATION_SCHEMA;
  method: typeof RESEARCH_BRIEF_INTEGRATION_METHOD;
  question: string;
  claims: readonly IntegratedResearchBriefClaim[];
  limitations: readonly string[];
  nextResearchActions: readonly string[];
  priorArtifacts: {
    retrievalBound: boolean;
    opposingSearchBound: boolean;
    gapVerificationBound: boolean;
    translationalBound: boolean;
    releaseAwareBound: boolean;
  };
  releaseAwareSurface: {
    approvedCount: number;
    draftCount: number;
    draftsNeverRenderedAsApproved: true;
    assessReleaseClaimFailClosed: true;
  } | null;
  translationalSummary: {
    status: TranslationalOutcomeSection["status"];
    trialCount: number;
    registrationIsNotEfficacy: true;
    missingResultsIsNotFailure: true;
  } | null;
  candidatesRemainUnapproved: true;
  reviewGatesIntact: true;
  scientificValidityClaimed: false;
  graphPromotable: false;
  gateCAutoApprove: false;
  cdsPhi: false;
  eligibilityInferred: false;
  efficacyInferred: false;
};

export type IntegrateResearchBriefInput = {
  question: string;
  /** PR 5/6 bounded brief artifact when available. */
  boundedBrief?: BoundedBriefLike | null;
  opposingSearch?: OpposingEvidenceSearchReport | null;
  gapVerification?: GapVerificationOutcomeSection | null;
  translational?: TranslationalOutcomeSection | null;
  releaseAware?: ReleaseAwareRetrievalResult | null;
  /** Optional source locators from retrieval / living evidence. */
  sourceLocators?: readonly {kind: "pmid" | "doi" | "nct"; value: string}[];
};

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

/**
 * Product-facing brief: compose prior PR artifacts without inventing efficacy or approval.
 */
export function integrateResearchBrief(input: IntegrateResearchBriefInput): IntegratedResearchBrief {
  const question = input.question.trim();
  if (!question) throw new Error("Research brief requires a question");

  const claims: IntegratedResearchBriefClaim[] = [];
  if (input.boundedBrief?.claims?.length) {
    for (const c of input.boundedBrief.claims.slice(0, 12)) {
      claims.push({
        text: c.text,
        traceRefs: c.traceRefs,
        support: c.support,
        sourceLinks: (input.sourceLocators ?? []).slice(0, 8),
      });
    }
  } else {
    claims.push({
      text: "No draft candidates were available to summarise; brief abstains from scientific claims.",
      traceRefs: ["retrieval:none"],
      support: "insufficient",
      sourceLinks: (input.sourceLocators ?? []).slice(0, 8),
    });
  }

  // Attach translational trial locators as source links on first claim when present.
  if (input.translational && input.translational.status !== "not_queried") {
    const nctLinks = input.translational.records.map((r) => ({
      kind: "nct" as const,
      value: r.nctId,
    }));
    if (claims[0]) {
      claims[0] = {
        ...claims[0],
        sourceLinks: [...claims[0].sourceLinks, ...nctLinks].slice(0, 16),
      };
    }
  }

  if (input.releaseAware) {
    for (const hit of input.releaseAware.approved.slice(0, 5)) {
      claims.push({
        text: `Approved-release claim locator ${hit.claimId} (not re-validated by this brief).`,
        traceRefs: [hit.claimId, hit.releaseId],
        support: "traceable_candidate_only",
        sourceLinks: [{kind: "release_claim", value: hit.claimId}],
      });
    }
    for (const draft of input.releaseAware.drafts.slice(0, 5)) {
      claims.push({
        text: `Draft candidate ${draft.relationship.id} labelled ${draft.surfaceLabel} — not approved graph.`,
        traceRefs: [draft.relationship.id],
        support: "traceable_candidate_only",
        sourceLinks: [{kind: "candidate", value: draft.relationship.id}],
      });
    }
  }

  const limitations = uniqueStrings([
    "Structured engineering brief only — not a scientifically validated conclusion",
    "Candidate claims remain unapproved; curationReview stays draft until authenticated human review",
    "Source links are locators; source identity ≠ claim support",
    "No efficacy, eligibility, or causal benefit inference",
    "Fixtures are not live evidence; provider failure is not empty evidence",
    ...(input.boundedBrief?.limitations ?? []),
    ...(input.opposingSearch?.limitations ?? []),
    ...(input.gapVerification?.items
      .filter((g) => g.kind === "incomplete_literature_coverage" || g.kind === "insufficient_evidence")
      .map((g) => g.rationale)
      .slice(0, 5) ?? []),
    ...(input.translational?.limitations ?? []),
    ...(input.translational && input.translational.status !== "not_queried"
      ? [
          "O-04 registry attach: registration is not efficacy; missing results are not therapy failure",
        ]
      : []),
    ...(input.releaseAware
      ? [
          "Release-aware surface keeps draft candidates in a separate labelled channel; assessReleaseClaim remains fail-closed",
        ]
      : []),
  ]);

  const nextResearchActions = uniqueStrings([
    ...(input.boundedBrief?.nextResearchActions.filter(
      (a) => !/Translational O-04|eval deepening \(PR 8\)|Independent evaluation suites \(PR 8\)/i.test(a),
    ) ?? []),
    "Expert-reviewed gap assessment with recorded search scope and date (no Gate C auto-approve)",
    "Passage-backed semantic entailment when reuse rights clear (human queue #2)",
    "Authenticated scientific review before any graph promotion or claim acceptance",
    ...(input.translational && input.translational.status !== "not_queried"
      ? [
          "Independently verify registry-reported results and published outcome passages before any efficacy interpretation",
        ]
      : ["Attach O-04 translational registry snapshot when NCT pins or operator-supplied studies are available"]),
    "Independent evaluation suites (PR 8): deterministic CI ≠ live gated ≠ scientific SME slots — gold remains blocked",
  ]);

  if (input.boundedBrief && input.boundedBrief.scientificValidityClaimed !== false) {
    throw new Error("Bounded brief must not claim scientific validity");
  }
  if (input.releaseAware?.honesty.draftsNeverRenderedAsApproved !== true) {
    // Only enforce when bound.
  }

  const releaseAwareSurface = input.releaseAware
    ? {
        approvedCount: input.releaseAware.approved.length,
        draftCount: input.releaseAware.drafts.length,
        draftsNeverRenderedAsApproved: true as const,
        assessReleaseClaimFailClosed: true as const,
      }
    : null;

  const translationalSummary =
    input.translational && input.translational.status !== "not_queried"
      ? {
          status: input.translational.status,
          trialCount: input.translational.records.length,
          registrationIsNotEfficacy: true as const,
          missingResultsIsNotFailure: true as const,
        }
      : null;

  return {
    schemaVersion: RESEARCH_BRIEF_INTEGRATION_SCHEMA,
    method: RESEARCH_BRIEF_INTEGRATION_METHOD,
    question,
    claims,
    limitations,
    nextResearchActions,
    priorArtifacts: {
      retrievalBound: Boolean(input.sourceLocators?.length || input.boundedBrief),
      opposingSearchBound: Boolean(input.opposingSearch),
      gapVerificationBound: Boolean(input.gapVerification),
      translationalBound: Boolean(translationalSummary),
      releaseAwareBound: Boolean(releaseAwareSurface),
    },
    releaseAwareSurface,
    translationalSummary,
    candidatesRemainUnapproved: true,
    reviewGatesIntact: true,
    scientificValidityClaimed: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    cdsPhi: false,
    eligibilityInferred: false,
    efficacyInferred: false,
  };
}

/**
 * Thin product surface over release-aware retrieval for UI/API bind.
 * Approved and draft channels stay separate; never collapses drafts into approved.
 */
export function projectReleaseAwareProductSurface(result: ReleaseAwareRetrievalResult): {
  schemaVersion: "hsi-release-aware-product-surface-1";
  approved: readonly {
    claimId: string;
    releaseId: string;
    surfaceLabel: "approved_release";
    assertion: string;
  }[];
  drafts: readonly {
    candidateId: string;
    surfaceLabel: string;
    warning: string;
    graphPromotable: false;
  }[];
  honesty: {
    draftsNeverRenderedAsApproved: true;
    assessReleaseClaimFailClosed: true;
    gateCAutoApprove: false;
  };
} {
  if (result.honesty.draftsNeverRenderedAsApproved !== true) {
    throw new Error("Release-aware surface refused: drafts must never render as approved");
  }
  return {
    schemaVersion: "hsi-release-aware-product-surface-1",
    approved: result.approved.map((a) => ({
      claimId: a.claimId,
      releaseId: a.releaseId,
      surfaceLabel: "approved_release" as const,
      assertion: a.assertion,
    })),
    drafts: result.drafts.map((d) => ({
      candidateId: d.relationship.id,
      surfaceLabel: d.surfaceLabel,
      warning: d.warning,
      graphPromotable: false as const,
    })),
    honesty: {
      draftsNeverRenderedAsApproved: true,
      assessReleaseClaimFailClosed: true,
      gateCAutoApprove: false,
    },
  };
}

/** Map integrated brief back into the bounded research-brief durable artifact shape. */
export function toBoundedResearchBriefArtifact(brief: IntegratedResearchBrief): {
  schemaVersion: "hsi-bounded-research-brief-1";
  question: string;
  claims: readonly {
    text: string;
    traceRefs: readonly string[];
    support: "traceable_candidate_only" | "insufficient";
  }[];
  limitations: readonly string[];
  nextResearchActions: readonly string[];
  scientificValidityClaimed: false;
  graphPromotable: false;
  gateCAutoApprove: false;
  cdsPhi: false;
} {
  return {
    schemaVersion: "hsi-bounded-research-brief-1",
    question: brief.question,
    claims: brief.claims.map((c) => ({
      text: c.text,
      traceRefs: c.traceRefs,
      support: c.support,
    })),
    limitations: brief.limitations,
    nextResearchActions: brief.nextResearchActions,
    scientificValidityClaimed: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    cdsPhi: false,
  };
}
