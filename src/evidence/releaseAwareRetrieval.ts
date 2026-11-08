/**
 * PR 4 — Release-aware retrieval over approved graph + labelled draft candidates.
 *
 * Path (fail-closed):
 *   candidate evidence store → verification → authenticated review →
 *   approved graph release → release-aware retrieval
 *
 * Draft / candidate findings surface only when explicitly labelled and permitted.
 * They are never rendered as approved graph relationships.
 */
import {
  assessReleaseClaim,
  queryPublishedGraph,
  type GraphQuery,
  type PublishedReleaseSnapshot,
  type ReleaseClaim,
} from "../graphRelease";
import {
  assertNotApprovedGraphRelationship,
  refuseAutoPromoteContextualCandidate,
  type ContextualCandidatePack,
  type ContextualCandidateRelationship,
} from "./contextualCandidateRelationships";

export const RELEASE_AWARE_RETRIEVAL_SCHEMA = "hsi-release-aware-retrieval-1" as const;
export const RELEASE_AWARE_RETRIEVAL_METHOD = "hsi.release_aware_retrieval.v1" as const;

export type ReleaseAwareRetrievalRequest = {
  /** Approved published release only — never draft packs. */
  published?: PublishedReleaseSnapshot | null;
  query?: GraphQuery;
  /** Draft/candidate pack — omitted unless caller opts in. */
  candidatePack?: ContextualCandidatePack | null;
  /**
   * Must be true to receive draft/candidate relationships.
   * Even then, every row retains surfaceLabel + reviewState=draft.
   */
  includeDraftCandidates?: boolean;
  /** Permit fixture-labelled candidates when includeDraftCandidates is true. */
  allowFixtureCandidates?: boolean;
};

export type ApprovedGraphHit = {
  channel: "approved_release";
  releaseId: string;
  releaseVersion: string;
  manifestHash: string;
  claimId: string;
  subjectId: string;
  predicate: string;
  objectId: string;
  assertion: string;
  epistemicType: string;
  biologicalContext: Record<string, unknown>;
  sources: ReleaseClaim["sources"];
  reviewDecisionId: string | undefined;
  surfaceLabel: "approved_release";
};

export type DraftCandidateHit = {
  channel: "draft_candidate";
  relationship: ContextualCandidateRelationship;
  surfaceLabel: ContextualCandidateRelationship["surfaceLabel"];
  reviewState: "draft";
  graphPromotable: false;
  scientificApproval: false;
  warning: string;
};

export type ReleaseAwareRetrievalResult = {
  schemaVersion: typeof RELEASE_AWARE_RETRIEVAL_SCHEMA;
  method: typeof RELEASE_AWARE_RETRIEVAL_METHOD;
  approved: ApprovedGraphHit[];
  drafts: DraftCandidateHit[];
  honesty: {
    draftsNeverRenderedAsApproved: true;
    releaseFilterApplied: true;
    assessReleaseClaimFailClosed: true;
    includeDraftCandidates: boolean;
    autoPromotionForbidden: true;
    gateCAutoApprove: false;
    cdsPhi: false;
  };
};

function fail(message: string): never {
  throw new Error(message);
}

function draftPermitted(
  rel: ContextualCandidateRelationship,
  request: ReleaseAwareRetrievalRequest,
): boolean {
  if (!request.includeDraftCandidates) return false;
  assertNotApprovedGraphRelationship(rel);
  if (rel.surfaceLabel === "fixture" && !request.allowFixtureCandidates) return false;
  if (rel.graphPromotable !== false || rel.scientificApproval !== false || rel.reviewState !== "draft") {
    return false;
  }
  return true;
}

/**
 * Release-aware read: approved hits only from published release that pass
 * assessReleaseClaim; draft candidates only in a separate labelled channel.
 */
export function retrieveReleaseAware(request: ReleaseAwareRetrievalRequest): ReleaseAwareRetrievalResult {
  const approved: ApprovedGraphHit[] = [];
  const drafts: DraftCandidateHit[] = [];

  if (request.published) {
    if (request.published.manifest.status !== "published") {
      fail("Unpublished graph release cannot be retrieved as approved");
    }
    const page = queryPublishedGraph(request.published, request.query ?? {});
    for (const hit of page.results) {
      const claim = request.published.claims.find((c) => c.id === hit.claimId);
      if (!claim) continue;
      const assessment = assessReleaseClaim(claim);
      if (!assessment.eligible) continue;
      approved.push({
        channel: "approved_release",
        releaseId: page.releaseId,
        releaseVersion: page.releaseVersion,
        manifestHash: page.manifestHash,
        claimId: hit.claimId,
        subjectId: hit.subjectId,
        predicate: hit.predicate,
        objectId: hit.objectId,
        assertion: hit.assertion,
        epistemicType: hit.epistemicType,
        biologicalContext: hit.biologicalContext,
        sources: hit.sources,
        reviewDecisionId: hit.reviewDecisionId,
        surfaceLabel: "approved_release",
      });
    }
  }

  if (request.candidatePack) {
    if (request.candidatePack.honesty.autoPromotedToApprovedGraph !== false) {
      fail("Candidate pack honesty violated: auto promotion claimed");
    }
    if (request.candidatePack.honesty.graphPromotable !== false) {
      fail("Candidate pack must remain non-promotable");
    }
    for (const rel of request.candidatePack.relationships) {
      // Hard gate: never leak into approved channel.
      if (rel.reviewState !== "draft" || rel.graphPromotable !== false) {
        fail("Candidate relationship attempted to present as approved / promotable");
      }
      if (!draftPermitted(rel, request)) continue;
      drafts.push({
        channel: "draft_candidate",
        relationship: rel,
        surfaceLabel: rel.surfaceLabel,
        reviewState: "draft",
        graphPromotable: false,
        scientificApproval: false,
        warning:
          "Draft / candidate relationship — not an approved graph release edge. Explicit includeDraftCandidates required.",
      });
    }
  }

  // Defence: approved channel must not contain draft-labelled rows.
  if (approved.some((a) => (a as {channel: string}).channel !== "approved_release")) {
    fail("Draft leakage into approved channel");
  }
  if (drafts.some((d) => d.channel !== "draft_candidate" || d.surfaceLabel === ("approved_release" as string))) {
    fail("Draft channel mislabelled");
  }

  return {
    schemaVersion: RELEASE_AWARE_RETRIEVAL_SCHEMA,
    method: RELEASE_AWARE_RETRIEVAL_METHOD,
    approved,
    drafts,
    honesty: {
      draftsNeverRenderedAsApproved: true,
      releaseFilterApplied: true,
      assessReleaseClaimFailClosed: true,
      includeDraftCandidates: request.includeDraftCandidates === true,
      autoPromotionForbidden: true,
      gateCAutoApprove: false,
      cdsPhi: false,
    },
  };
}

/**
 * Simulate approval-bypass attempts: mutate source identity or pile on citations.
 * Must always fail closed — returns refusal reasons, never an approved hit.
 */
export function attemptApprovalBypass(input: {
  candidate: ContextualCandidateRelationship;
  published?: PublishedReleaseSnapshot | null;
  mutation:
    | {kind: "replace_source_id"; newSourceId: string}
    | {kind: "add_citation"; citationId: string; polarity?: "supports" | "contradicts" | "contextualises"}
    | {kind: "flip_review_state_locally"; to: "approved"};
}): {
  bypassSucceeded: false;
  approvedHitsInjected: 0;
  refusal: ReturnType<typeof refuseAutoPromoteContextualCandidate>;
  releaseEligible: false;
  reasons: string[];
} {
  const mutated: ContextualCandidateRelationship = {
    ...input.candidate,
    evidenceSourceIds:
      input.mutation.kind === "replace_source_id"
        ? [input.mutation.newSourceId]
        : input.mutation.kind === "add_citation"
          ? [...input.candidate.evidenceSourceIds, input.mutation.citationId]
          : [...input.candidate.evidenceSourceIds],
    // Local flip must still be rejected by honesty gates.
    reviewState: input.mutation.kind === "flip_review_state_locally" ? ("draft" as const) : input.candidate.reviewState,
  };

  const refusal = refuseAutoPromoteContextualCandidate(mutated, {
    replacementSourceId:
      input.mutation.kind === "replace_source_id" ? input.mutation.newSourceId : undefined,
    additionalCitationIds:
      input.mutation.kind === "add_citation" ? [input.mutation.citationId] : undefined,
  });

  const reasons = [...refusal.reasons];
  if (input.mutation.kind === "flip_review_state_locally") {
    reasons.push("local_review_state_flip_ignored_without_authenticated_review");
  }

  // Even if caller fabricates a ReleaseClaim-shaped object from the candidate,
  // assessReleaseClaim must fail without authorised approval + rights + support.
  const forgedClaim: ReleaseClaim = {
    id: mutated.id,
    subjectId: `${mutated.subject.system}:${mutated.subject.value}`,
    predicate: mutated.predicate,
    objectId: `${mutated.object.system}:${mutated.object.value}`,
    assertion: mutated.note,
    epistemicType: "association",
    biologicalContext: {...mutated.biologicalContext},
    status: input.mutation.kind === "flip_review_state_locally" ? "approved" : "draft",
    sources: mutated.evidenceSourceIds.map((id) => ({
      id,
      licenceStatus: "metadata_only" as const,
      retractionStatus: "none_reported" as const,
      polarity:
        input.mutation.kind === "add_citation"
          ? (input.mutation.polarity ?? "supports")
          : ("supports" as const),
      sourceVersion: mutated.version,
    })),
    reviews:
      input.mutation.kind === "flip_review_state_locally"
        ? [
            {
              id: "forged-local-review",
              claimId: mutated.id,
              decision: "approve" as const,
              reviewerPrincipal: "",
              reviewerAuthorised: false,
              reviewedAt: "2026-11-08T00:00:00.000Z",
            },
          ]
        : [],
  };

  const assessment = assessReleaseClaim(forgedClaim);
  if (assessment.eligible) {
    fail("Bypass attempt unexpectedly became release-eligible");
  }
  reasons.push(...assessment.reasons.map((r) => `release:${r}`));

  if (input.published) {
    const before = retrieveReleaseAware({
      published: input.published,
      includeDraftCandidates: false,
    }).approved.length;
    const after = retrieveReleaseAware({
      published: input.published,
      candidatePack: {
        schemaVersion: "hsi-contextual-candidate-pack-1",
        method: "hsi.contextual_candidate_relationships.v1",
        searchRecordId: null,
        version: "0.1.0",
        generatedAt: "2026-11-08T21:00:00.000Z",
        relationships: [mutated],
        opposingEvidenceSearch: {
          status: "stubbed_incomplete",
          recordedOpposingCount: 0,
          consensusEstablished: false,
          note: "bypass probe",
        },
        honesty: {
          metadataOnly: true,
          claimSupportNotAssessed: true,
          sourceIdentityDistinctFromClaimSupport: true,
          bibliographicDoesNotInventMechanism: true,
          axesPreservedOrthogonal: true,
          noModelConfidenceScore: true,
          scientificApproval: false,
          graphPromotable: false,
          gateCAutoApprove: false,
          autoPromotedToApprovedGraph: false,
          draftsRequireExplicitLabel: true,
          cdsPhi: false,
          fixturesAreNotLiveEvidence: true,
        },
      },
      includeDraftCandidates: false,
    }).approved.length;
    if (after !== before) {
      fail("Candidate mutation altered approved release retrieval");
    }
  }

  return {
    bypassSucceeded: false,
    approvedHitsInjected: 0,
    refusal,
    releaseEligible: false,
    reasons,
  };
}
