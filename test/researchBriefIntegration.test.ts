/**
 * PR 7 — Research-brief product bind + release-aware surface honesty.
 */
import type { FetchLike } from "../src/fetchLike";
import {describe, expect, test} from "bun:test";
import {
  integrateResearchBrief,
  projectReleaseAwareProductSurface,
  toBoundedResearchBriefArtifact,
} from "../src/evidence/researchBriefIntegration";
import type {ReleaseAwareRetrievalResult} from "../src/evidence/releaseAwareRetrieval";
import type {TranslationalOutcomeSection} from "../src/evidence/translationalEvidenceAttach";
import {
  createMemoryCheckpointStore,
  createMemoryFencedArtifactStore,
  reconstructBoundedArtifacts,
  runBoundedAgentExecution,
} from "../src/evidence/boundedAgentExecution";
import {createMemoryDynamicEvidencePersistStore} from "../src/evidence/dynamicEvidencePersistence";
import {createMemoryRetrievalCache} from "../src/evidence/dynamicEvidenceRetrieval";

const graphRelease = {
  id: "HSI-GR-BRIEF",
  version: "1.0.0",
  manifestHash: "c".repeat(64),
};

function epmcBody(): string {
  return JSON.stringify({
    hitCount: 1,
    resultList: {
      result: [
        {
          id: "30760472",
          source: "MED",
          pmid: "30760472",
          title: "Tfh IL-21 in SSc",
          authorString: "Test",
          journalTitle: "Test",
          pubYear: "2020",
          isOpenAccess: "N",
          inEPMC: "N",
          inPMC: "N",
        },
      ],
    },
  });
}

function otBody(): string {
  return JSON.stringify({
    data: {
      disease: {
        id: "MONDO_0005100",
        name: "systemic sclerosis",
        associatedTargets: {
          count: 1,
          rows: [
            {
              target: {id: "ENSG00000105397", approvedSymbol: "TGFB1"},
              score: 0.5,
              datatypeScores: [{id: "literature", score: 0.4}],
            },
          ],
        },
      },
    },
  });
}

const mockFetcher: FetchLike = async (url) => {
  const u = String(url);
  if (u.includes("opentargets")) return new Response(otBody(), {status: 200});
  if (u.includes("europepmc")) return new Response(epmcBody(), {status: 200});
  return new Response("unexpected", {status: 500});
};

const translationalStub: TranslationalOutcomeSection = {
  status: "attached_registry_snapshot",
  schemaVersion: "hsi-translational-evidence-attach-1",
  snapshotHash: "d".repeat(64),
  asOf: "2026-11-08T21:55:00.000Z",
  relevanceScope: "preliminary_research_only",
  eligibilityAssessed: false,
  confirmedEligible: false,
  records: [
    {
      nctId: "NCT01030861",
      briefTitle: "Teplizumab prevention",
      overallStatus: "COMPLETED",
      phases: ["PHASE2"],
      interventions: ["Teplizumab"],
      mappedTargetSymbols: ["Teplizumab"],
      hasRegistryResults: true,
      publishedOutcomePmidCount: 1,
      missingKinds: [],
    },
  ],
  planes: {
    trialRegistrationAndStatus: [],
    interventionAndTargetMapping: [],
    registryReportedResults: [],
    publishedOutcomes: [],
    missingOrUnresolvedOutcomeEvidence: [],
  },
  honesty: {
    o04Attached: true,
    registrationIsNotEfficacy: true,
    missingResultsIsNotFailure: true,
    eligibilityAssessed: false,
    confirmedEligible: false,
    clinicalAdvice: false,
    causalBenefitInferred: false,
    scientificApproval: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    cdsPhi: false,
    fixturesAreNotLiveEvidence: true,
    providerFailureDistinctFromEmptyEvidence: true,
    sourceIdentityDistinctFromClaimSupport: true,
  },
  limitations: ["A registered trial is not evidence of efficacy"],
  note: "O-04 attached for brief tests",
};

const releaseAwareStub = {
  schemaVersion: "hsi-release-aware-retrieval-1",
  method: "hsi.release_aware_retrieval.v1",
  approved: [
    {
      channel: "approved_release" as const,
      releaseId: "HSI-REL-1",
      releaseVersion: "1.0.0",
      manifestHash: "e".repeat(64),
      claimId: "HSI-C-001",
      subjectId: "A",
      predicate: "associates_with",
      objectId: "B",
      assertion: "approved claim locator",
      epistemicType: "association",
      biologicalContext: {},
      sources: [] as ReleaseAwareRetrievalResult["approved"][number]["sources"],
      reviewDecisionId: "rev-1",
      surfaceLabel: "approved_release" as const,
    },
  ],
  drafts: [
    {
      channel: "draft_candidate" as const,
      relationship: {id: "cand-1", surfaceLabel: "draft_candidate"} as unknown as ReleaseAwareRetrievalResult["drafts"][number]["relationship"],
      surfaceLabel: "draft_candidate" as unknown as ReleaseAwareRetrievalResult["drafts"][number]["surfaceLabel"],
      reviewState: "draft" as const,
      graphPromotable: false as const,
      scientificApproval: false as const,
      warning: "Draft only",
    },
  ],
  honesty: {
    draftsNeverRenderedAsApproved: true as const,
    releaseFilterApplied: true as const,
    assessReleaseClaimFailClosed: true as const,
    includeDraftCandidates: true,
    autoPromotionForbidden: true as const,
    gateCAutoApprove: false as const,
    cdsPhi: false as const,
  },
} as unknown as ReleaseAwareRetrievalResult;

describe("research brief integration (PR 7)", () => {
  test("limitations are explicit; eligibility and efficacy stay uninferred", () => {
    const brief = integrateResearchBrief({
      question: "How does teplizumab relate to T1D prevention trials?",
      translational: translationalStub,
      releaseAware: releaseAwareStub,
      sourceLocators: [{kind: "pmid", value: "31180194"}],
      boundedBrief: {
        claims: [
          {
            text: "Draft candidate only",
            traceRefs: ["retrieval:1"],
            support: "traceable_candidate_only",
          },
        ],
        limitations: ["Candidate claims remain unapproved"],
        nextResearchActions: ["Human review"],
        scientificValidityClaimed: false,
      },
    });
    expect(brief.scientificValidityClaimed).toBe(false);
    expect(brief.eligibilityInferred).toBe(false);
    expect(brief.efficacyInferred).toBe(false);
    expect(brief.candidatesRemainUnapproved).toBe(true);
    expect(brief.reviewGatesIntact).toBe(true);
    expect(brief.gateCAutoApprove).toBe(false);
    expect(brief.limitations.some((l) => /registration is not efficacy/i.test(l))).toBe(true);
    expect(brief.priorArtifacts.translationalBound).toBe(true);
    expect(brief.priorArtifacts.releaseAwareBound).toBe(true);
    expect(brief.releaseAwareSurface?.draftsNeverRenderedAsApproved).toBe(true);
    expect(brief.translationalSummary?.registrationIsNotEfficacy).toBe(true);
    expect(brief.translationalSummary?.missingResultsIsNotFailure).toBe(true);

    const surface = projectReleaseAwareProductSurface(releaseAwareStub);
    expect(surface.approved.every((a) => a.surfaceLabel === "approved_release")).toBe(true);
    expect(surface.drafts.every((d) => d.graphPromotable === false)).toBe(true);
    expect(surface.honesty.draftsNeverRenderedAsApproved).toBe(true);

    const durable = toBoundedResearchBriefArtifact(brief);
    expect(durable.scientificValidityClaimed).toBe(false);
    expect(durable.schemaVersion).toBe("hsi-bounded-research-brief-1");
  });

  test("bounded agent research-brief stage composes PR7 integration", async () => {
    const checkpointStore = createMemoryCheckpointStore();
    const artifactStore = createMemoryFencedArtifactStore({checkpointStore});
    const result = await runBoundedAgentExecution({
      investigationId: "inv-brief-pr7-1",
      question: "Tfh IL-21 systemic sclerosis fibrosis",
      entities: {freeTextTerms: ["Tfh IL-21"], diseaseIds: ["MONDO_0005100"]},
      graphRelease,
      now: () => "2026-11-08T21:55:00.000Z",
      fetcher: mockFetcher,
      cache: createMemoryRetrievalCache(),
      persistStore: createMemoryDynamicEvidencePersistStore(),
      checkpointStore,
      artifactStore,
      budgets: {maxToolCallsPerStage: 4, timeoutMsPerStage: 5_000, pageSize: 5},
      translational: translationalStub,
      releaseAware: releaseAwareStub,
    });
    expect(result.status).toBe("completed");
    const artifacts = reconstructBoundedArtifacts(result);
    const brief = artifacts["research-brief"];
    if (!brief || !("scientificValidityClaimed" in brief)) throw new Error("missing brief");
    expect(brief.scientificValidityClaimed).toBe(false);
    expect(brief.limitations.some((l) => /registration is not efficacy|O-04/i.test(l))).toBe(true);
    expect(brief.nextResearchActions.some((a) => /eval deepening|PR 8/i.test(a))).toBe(true);
    expect(brief.nextResearchActions.some((a) => /Translational O-04 \/ research-brief product bind \(PR 7\)/i.test(a))).toBe(
      false,
    );
  });
});
