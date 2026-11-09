/**
 * Milestone 17 PR5 — research gap and hypothesis portfolio honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  buildResearchGapHypothesisPortfolioPack,
  createMemoryResearchGapHypothesisPortfolioStore,
  fingerprintResearchGapHypothesisPortfolio,
  HYPOTHESIS_PORTFOLIO_STATES,
  openResearchGapHypothesisPortfolio,
  projectResearchGapHypothesisPortfolioPersistenceLines,
  reassessHypothesisAfterNewEvidence,
  registerHypothesisPortfolioEntry,
  registerResearchGap,
  RESEARCH_GAP_CATEGORIES,
  reviewResearchGap,
  transitionHypothesisPortfolioState,
  type ResearchGapHypothesisPortfolio,
} from "../src/researchGapHypothesisPortfolioContracts";

const asOf = "2026-11-09T19:00:00.000Z";
const programmeId = "hsi-sp-prog-ssc-fixture";
const objectiveId = "hsi-sp-obj-ssc-tfh-il21";

function seedPortfolio(
  overrides?: Partial<Parameters<typeof openResearchGapHypothesisPortfolio>[0]>,
): ResearchGapHypothesisPortfolio {
  return openResearchGapHypothesisPortfolio({
    id: "hsi-sp-rghp-ssc-001",
    programmeId,
    label:
      "Fixture SSc Tfh/IL-21 research-gap and hypothesis portfolio — non-discovery",
    authoredByPrincipalId: "agent-hsi-sp-rghp-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    linkedObjectiveIds: [objectiveId],
    ...overrides,
  });
}

function seedGap(
  portfolio: ResearchGapHypothesisPortfolio = seedPortfolio(),
  category: (typeof RESEARCH_GAP_CATEGORIES)[number] = "missing_mechanistic_evidence",
) {
  return registerResearchGap({
    id: `hsi-sp-gap-ssc-${category.replace(/_/g, "-").slice(0, 40)}`,
    portfolio,
    category,
    scientificQuestion:
      "Which public-evidence neighbourhoods leave Tfh / IL-21 signalling in SSc mechanistically unresolved?",
    evidenceSupportingTheGap: [
      "Fixture literature neighbourhood shows sparse mechanistic pathway coverage for Tfh/IL-21 in SSc.",
      "PR3 evidence item hsi-sp-evid-pmid-fixture-1 does not establish mechanism.",
    ],
    whyItMatters:
      "Programme go/no-go decisions on mechanism-focused workstreams need an explicit gap record.",
    alternativeExplanations: [
      "Sparse coverage may reflect indexing limits rather than absence of mechanism.",
      "Disease-context mismatch may hide transferable mechanism evidence.",
    ],
    availableInvestigationMethods: [
      "Bounded literature retrieval with contradiction review",
      "Structured comparison against opposing evidence search",
      "Optional experiment design proposal (not auto-run)",
    ],
    expectedDecisionRelevance:
      "Informs whether to open a mechanism workstream or pause pending evidence.",
    dataRequirements:
      "Public literature + optional authorised research datasets; no PHI.",
    uncertainty:
      "Fixture gap classification is engineering-only and not scientifically verified.",
    authoredByPrincipalId: "agent-hsi-sp-rghp-1",
    createdAt: asOf,
    linkedPlanEvidenceGapIds: ["hsi-sp-egap-ssc-mechanism-1"],
    supportingEvidenceRefs: ["hsi-sp-evid-pmid-fixture-1"],
  });
}

function seedHypothesis(
  portfolio: ResearchGapHypothesisPortfolio = seedPortfolio(),
  gapIds: readonly string[] = [],
) {
  return registerHypothesisPortfolioEntry({
    id: "hsi-sp-hpf-ssc-tfh-il21-001",
    portfolio,
    statement:
      "Fixture: Tfh-derived IL-21 signalling contributes to SSc fibrotic niche communication under public-evidence constraints.",
    linkedObjectiveIds: [objectiveId],
    linkedM3HypothesisIds: ["hyp-ssc-tfh-il21-001"],
    addressesGapIds: gapIds,
    competingExplanations: [
      {
        id: "hsi-sp-hcomp-ssc-alt-1",
        summary:
          "Competing: macrophage-dominant cytokine axes explain the same fibrotic niche signals.",
        relationToPrimary: "competing",
        note: "Competing explanation retained for portfolio review.",
      },
    ],
    evidenceLinks: [
      {
        evidenceRef: "hsi-sp-evid-pmid-fixture-1",
        polarity: "supporting",
        note: "Fixture supporting neighbourhood — not confirmation.",
      },
      {
        evidenceRef: "hsi-sp-evid-pmid-fixture-oppose-1",
        polarity: "opposing",
        note: "Fixture opposing neighbourhood retained.",
      },
    ],
    falsifiablePredictions: [
      {
        id: "hsi-sp-hpred-ssc-1",
        prediction:
          "If Tfh/IL-21 is causal in the fixture neighbourhood, IL-21 pathway markers should co-occur with Tfh signatures in public SSc datasets under declared bounds.",
        falsifier:
          "Absence of co-occurrence after bounded authorised search would challenge the hypothesis.",
        linkedExperimentIds: ["exp-ssc-il21-fixture-001"],
        note: "Falsifiable prediction — not a wet-lab outcome.",
      },
    ],
    linkedExperimentIds: ["exp-ssc-il21-fixture-001"],
    authoredByPrincipalId: "agent-hsi-sp-rghp-1",
    createdAt: asOf,
  });
}

describe("research gap and hypothesis portfolio contracts (M17 PR5)", () => {
  test("opens portfolio with ten gap categories and PR1–PR4 honesty", () => {
    const portfolio = seedPortfolio();
    expect(portfolio.honesty.researchGapHypothesisPortfolio).toBe(true);
    expect(portfolio.honesty.dependsOnPr4ScientificKnowledgeEvolution).toBe(
      true,
    );
    expect(portfolio.honesty.extendsM3HypothesisRegistryById).toBe(true);
    expect(portfolio.honesty.extendsGapInvestigation).toBe(true);
    expect(portfolio.honesty.experimentPortfolioIntegration).toBe(false);
    expect(portfolio.honesty.noArbitraryImportanceScores).toBe(true);
    expect(portfolio.honesty.agentsCannotSelfApprove).toBe(true);
    expect(portfolio.honesty.graphPromotable).toBe(false);
    expect(RESEARCH_GAP_CATEGORIES).toHaveLength(10);
    expect(HYPOTHESIS_PORTFOLIO_STATES).toHaveLength(8);
    expect(fingerprintResearchGapHypothesisPortfolio(portfolio)).toMatch(
      /^[a-f0-9]{64}$/,
    );

    expect(() =>
      seedPortfolio({
        label: "We have proven a discovery confirmed by discussion volume.",
      }),
    ).toThrow(/must not invent/);
  });

  test("registers research gaps across categories with required fields and criteria-bound prioritisation", () => {
    const portfolio = seedPortfolio();
    const gaps = RESEARCH_GAP_CATEGORIES.map((category) =>
      seedGap(portfolio, category),
    );
    expect(gaps).toHaveLength(10);
    expect(gaps[0]?.scientificQuestion.length).toBeGreaterThan(10);
    expect(gaps[0]?.evidenceSupportingTheGap.length).toBeGreaterThan(0);
    expect(gaps[0]?.alternativeExplanations.length).toBeGreaterThan(0);
    expect(gaps[0]?.availableInvestigationMethods.length).toBeGreaterThan(0);
    expect(gaps[0]?.prioritisation).toBeNull();

    const withPriority = registerResearchGap({
      id: "hsi-sp-gap-ssc-priority-1",
      portfolio,
      category: "contradictory_findings",
      scientificQuestion:
        "Where do public SSc Tfh/IL-21 findings contradict each other under declared search bounds?",
      evidenceSupportingTheGap: [
        "Fixture contradictory neighbourhood pair without resolution.",
      ],
      whyItMatters:
        "Contradiction handling changes whether a workstream can claim mechanism readiness.",
      alternativeExplanations: [
        "Apparent contradictions may be context or assay differences.",
      ],
      availableInvestigationMethods: [
        "Structured contradiction investigation with human review",
      ],
      expectedDecisionRelevance:
        "Guides whether to escalate contradiction review before experiment proposals.",
      dataRequirements: "Public contradictory literature pairs; no PHI.",
      uncertainty: "Contradiction labelling is fixture-only.",
      authoredByPrincipalId: "agent-hsi-sp-rghp-1",
      createdAt: asOf,
      prioritisation: {
        id: "hsi-sp-gpc-ssc-1",
        noArbitraryImportanceScore: true,
        criteriaSummary:
          "Prioritise gaps that block programme milestone exit criteria under declared evidence bounds — no bare importance score.",
        assumptions: [
          "Programme milestone exit criteria are human-declared.",
          "Public evidence bounds are incomplete relative to authorised datasets.",
        ],
        ordinalRank: 1,
        note: "Ordinal rank is criteria-bound, not an arbitrary importance score.",
      },
    });
    expect(withPriority.prioritisation?.noArbitraryImportanceScore).toBe(true);
    expect(withPriority.prioritisation?.assumptions.length).toBeGreaterThan(0);

    expect(() =>
      registerResearchGap({
        id: "hsi-sp-gap-ssc-bad-priority",
        portfolio,
        category: "missing_human_validation",
        scientificQuestion: "Bad prioritisation without assumptions?",
        evidenceSupportingTheGap: ["Fixture evidence for gap."],
        whyItMatters: "Matters for validation planning.",
        alternativeExplanations: ["Assay limitation."],
        availableInvestigationMethods: ["Human cohort study design proposal"],
        expectedDecisionRelevance: "Validation go/no-go.",
        dataRequirements: "Declared research only.",
        uncertainty: "Fixture uncertainty.",
        authoredByPrincipalId: "agent-hsi-sp-rghp-1",
        createdAt: asOf,
        prioritisation: {
          id: "hsi-sp-gpc-bad",
          noArbitraryImportanceScore: true,
          criteriaSummary: "Missing assumptions list",
          assumptions: [],
          ordinalRank: 2,
          note: "Should fail",
        },
      }),
    ).toThrow(/at least one assumption/);
  });

  test("human gap review refuses agent self-approval", () => {
    const portfolio = seedPortfolio();
    const gap = seedGap(portfolio);
    expect(gap.reviewState).toBe("draft");

    expect(() =>
      reviewResearchGap({
        gap,
        reviewState: "accepted_human",
        reviewedBy: {
          principalId: "agent-hsi-sp-rghp-1",
          actorKind: "ai_agent",
        },
        updatedAt: asOf,
      }),
    ).toThrow(/Only human reviewers/);

    expect(() =>
      reviewResearchGap({
        gap,
        reviewState: "accepted_human",
        reviewedBy: {
          principalId: "agent-hsi-sp-rghp-1",
          actorKind: "human",
        },
        updatedAt: asOf,
      }),
    ).toThrow(/cannot self-approve/);

    const accepted = reviewResearchGap({
      gap,
      reviewState: "accepted_human",
      reviewedBy: {
        principalId: "principal-researcher-alice",
        actorKind: "human",
      },
      updatedAt: asOf,
    });
    expect(accepted.reviewState).toBe("accepted_human");
    expect(accepted.reviewedBy?.principalId).toBe("principal-researcher-alice");
  });

  test("registers hypothesis portfolio linked to objectives, gaps, competing explanations, and experiments", () => {
    const portfolio = seedPortfolio();
    const gap = seedGap(portfolio);
    const hypothesis = seedHypothesis(portfolio, [gap.id]);
    expect(hypothesis.state).toBe("proposed");
    expect(hypothesis.linkedObjectiveIds).toEqual([objectiveId]);
    expect(hypothesis.linkedM3HypothesisIds).toEqual(["hyp-ssc-tfh-il21-001"]);
    expect(hypothesis.addressesGapIds).toEqual([gap.id]);
    expect(hypothesis.competingExplanations).toHaveLength(1);
    expect(hypothesis.evidenceLinks.map((e) => e.polarity).sort()).toEqual([
      "opposing",
      "supporting",
    ]);
    expect(hypothesis.falsifiablePredictions).toHaveLength(1);
    expect(hypothesis.linkedExperimentIds).toEqual(["exp-ssc-il21-fixture-001"]);
    expect(hypothesis.discussionVolumeAloneDoesNotConfirm).toBe(true);
    expect(hypothesis.honesty.experimentPortfolioIntegration).toBe(false);

    expect(() =>
      registerHypothesisPortfolioEntry({
        id: "hsi-sp-hpf-ssc-bad",
        portfolio,
        statement: "Missing falsifier prediction",
        falsifiablePredictions: [],
        authoredByPrincipalId: "agent-hsi-sp-rghp-1",
        createdAt: asOf,
      }),
    ).toThrow(/at least one falsifiable prediction/);
  });

  test("hypothesis state changes require evidence and review; discussion volume confirmation refused", () => {
    const portfolio = seedPortfolio();
    const hypothesis = seedHypothesis(portfolio);

    expect(() =>
      transitionHypothesisPortfolioState({
        entry: hypothesis,
        nextState: "evidence_supported",
        reviewedBy: {
          principalId: "agent-hsi-sp-rghp-1",
          actorKind: "ai_agent",
        },
        updatedAt: asOf,
      }),
    ).toThrow(/Only human reviewers/);

    expect(() =>
      transitionHypothesisPortfolioState({
        entry: hypothesis,
        nextState: "evidence_supported",
        reviewedBy: {
          principalId: "agent-hsi-sp-rghp-1",
          actorKind: "human",
        },
        updatedAt: asOf,
      }),
    ).toThrow(/cannot self-approve/);

    expect(() =>
      transitionHypothesisPortfolioState({
        entry: hypothesis,
        nextState: "evidence_supported",
        reviewedBy: {
          principalId: "principal-reviewer-bob",
          actorKind: "human",
        },
        updatedAt: asOf,
        confirmedByDiscussionVolume: true,
      }),
    ).toThrow(/discussion volume alone is refused/);

    const underInvestigation = transitionHypothesisPortfolioState({
      entry: hypothesis,
      nextState: "under_investigation",
      reviewedBy: {
        principalId: "principal-reviewer-bob",
        actorKind: "human",
      },
      updatedAt: asOf,
    });
    expect(underInvestigation.state).toBe("under_investigation");
    expect(underInvestigation.validationStatus).toBe(
      "awaiting_evidence_review",
    );

    const supported = transitionHypothesisPortfolioState({
      entry: underInvestigation,
      nextState: "evidence_supported",
      reviewedBy: {
        principalId: "principal-reviewer-bob",
        actorKind: "human",
      },
      updatedAt: asOf,
    });
    expect(supported.state).toBe("evidence_supported");
    expect(supported.reviewedBy?.actorKind).toBe("human");
  });

  test("reassesses after new evidence and retains rejected or superseded hypotheses", () => {
    const portfolio = seedPortfolio();
    const primary = seedHypothesis(portfolio);
    const successor = registerHypothesisPortfolioEntry({
      id: "hsi-sp-hpf-ssc-tfh-il21-002",
      portfolio,
      statement:
        "Fixture successor hypothesis with narrower disease-context scope for SSc Tfh/IL-21 signalling.",
      falsifiablePredictions: [
        {
          id: "hsi-sp-hpred-ssc-2",
          prediction:
            "Narrower disease-context markers should improve agreement under declared bounds.",
          falsifier:
            "No improvement after bounded comparison would challenge the successor.",
          linkedExperimentIds: ["exp-ssc-il21-fixture-002"],
          note: "Successor falsifier — fixtures only.",
        },
      ],
      authoredByPrincipalId: "agent-hsi-sp-rghp-1",
      createdAt: asOf,
      linkedObjectiveIds: [objectiveId],
      linkedExperimentIds: ["exp-ssc-il21-fixture-002"],
    });

    const {entry: superseded, reassessment} = reassessHypothesisAfterNewEvidence(
      {
        id: "hsi-sp-hra-ssc-1",
        entry: primary,
        nextState: "superseded",
        newEvidenceRefs: ["hsi-sp-evid-pmid-fixture-2"],
        rationale:
          "New fixture evidence favours the narrower successor hypothesis; prior entry retained as superseded.",
        authoredByPrincipalId: "agent-hsi-sp-rghp-1",
        reviewedBy: {
          principalId: "principal-reviewer-bob",
          actorKind: "human",
        },
        createdAt: asOf,
        supersededByHypothesisId: successor.id,
        evidenceLinks: [
          ...primary.evidenceLinks,
          {
            evidenceRef: "hsi-sp-evid-pmid-fixture-2",
            polarity: "opposing",
            note: "New evidence challenges the primary statement.",
          },
        ],
      },
    );
    expect(superseded.state).toBe("superseded");
    expect(superseded.retainedAfterRejectOrSupersede).toBe(true);
    expect(superseded.supersededByHypothesisId).toBe(successor.id);
    expect(reassessment.evidenceAndReviewRequired).toBe(true);
    expect(reassessment.discussionVolumeAloneRefused).toBe(true);
    expect(reassessment.newEvidenceRefs).toEqual([
      "hsi-sp-evid-pmid-fixture-2",
    ]);

    const rejected = transitionHypothesisPortfolioState({
      entry: successor,
      nextState: "rejected",
      reviewedBy: {
        principalId: "principal-reviewer-bob",
        actorKind: "human",
      },
      updatedAt: asOf,
      evidenceLinks: [
        {
          evidenceRef: "hsi-sp-evid-pmid-fixture-3",
          polarity: "opposing",
          note: "Fixture opposing evidence after review.",
        },
      ],
      note: "Human rejection retained in portfolio history.",
    });
    expect(rejected.state).toBe("rejected");
    expect(rejected.retainedAfterRejectOrSupersede).toBe(true);

    expect(() =>
      reassessHypothesisAfterNewEvidence({
        id: "hsi-sp-hra-ssc-bad",
        entry: primary,
        nextState: "evidence_supported",
        newEvidenceRefs: [],
        rationale: "No evidence",
        authoredByPrincipalId: "agent-hsi-sp-rghp-1",
        reviewedBy: {
          principalId: "principal-reviewer-bob",
          actorKind: "human",
        },
        createdAt: asOf,
      }),
    ).toThrow(/at least one new evidence ref/);
  });

  test("thin store and pack projection preserve honesty gates", () => {
    const store = createMemoryResearchGapHypothesisPortfolioStore();
    const portfolio = seedPortfolio();
    const gap = seedGap(portfolio, "cross_disease_evidence_gaps");
    const hypothesis = seedHypothesis(portfolio, [gap.id]);
    const challenged = transitionHypothesisPortfolioState({
      entry: hypothesis,
      nextState: "challenged",
      reviewedBy: {
        principalId: "principal-reviewer-bob",
        actorKind: "human",
      },
      updatedAt: asOf,
    });
    const {entry: inconclusive, reassessment} =
      reassessHypothesisAfterNewEvidence({
        id: "hsi-sp-hra-store-1",
        entry: challenged,
        nextState: "inconclusive",
        newEvidenceRefs: ["hsi-sp-evid-pmid-fixture-4"],
        rationale:
          "New fixture evidence leaves the hypothesis inconclusive after human review.",
        authoredByPrincipalId: "agent-hsi-sp-rghp-1",
        reviewedBy: {
          principalId: "principal-reviewer-bob",
          actorKind: "human",
        },
        createdAt: asOf,
        evidenceLinks: [
          ...challenged.evidenceLinks,
          {
            evidenceRef: "hsi-sp-evid-pmid-fixture-4",
            polarity: "ambiguous",
            note: "Ambiguous new evidence.",
          },
        ],
      });

    store.upsertPortfolio(portfolio);
    store.upsertGap(gap);
    store.upsertHypothesis(inconclusive);
    store.upsertReassessment(reassessment);

    expect(store.listPortfolios(programmeId)).toHaveLength(1);
    expect(store.listGaps(portfolio.id)).toHaveLength(1);
    expect(store.listHypotheses(portfolio.id)).toHaveLength(1);
    expect(store.listReassessments(hypothesis.id)).toHaveLength(1);

    const pack = buildResearchGapHypothesisPortfolioPack({
      portfolios: [portfolio],
      gaps: [gap],
      hypotheses: [inconclusive],
      reassessments: [reassessment],
      asOf,
    });
    expect(pack.portfolioCount).toBe(1);
    expect(pack.gapCount).toBe(1);
    expect(pack.hypothesisCount).toBe(1);
    expect(pack.reassessmentCount).toBe(1);
    expect(pack.gapCategories).toHaveLength(10);
    expect(pack.hypothesisStates).toHaveLength(8);
    expect(pack.honesty.researchGapHypothesisPortfolio).toBe(true);
    expect(pack.honesty.experimentPortfolioIntegration).toBe(false);
    expect(pack.honesty.discussionVolumeAloneDoesNotConfirm).toBe(true);

    const lines = projectResearchGapHypothesisPortfolioPersistenceLines({
      portfolio,
      gaps: [gap],
      hypotheses: [inconclusive],
      reassessments: [reassessment],
    });
    expect(lines).toContain("researchGapHypothesisPortfolio=true");
    expect(lines).toContain("experimentPortfolioIntegration=false");
    expect(lines).toContain("noArbitraryImportanceScores=true");
    expect(lines).toContain("discussionVolumeAloneDoesNotConfirm=true");
    expect(lines).toContain("agentsCannotSelfApprove=true");
    expect(lines).toContain("retainRejectedAndSupersededHypotheses=true");
    expect(lines).toContain("neon=red-wave-only");
    expect(lines).toContain("gapCategoryCount=10");
    expect(lines).toContain("hypothesisStateCount=8");
  });
});
