/**
 * Milestone 17 / PR5 — research gap and hypothesis portfolio pack check.
 * Offline contracts only — no auto-approval, fabricated discoveries, or experiment portfolio claims.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  buildResearchGapHypothesisPortfolioPack,
  openResearchGapHypothesisPortfolio,
  projectResearchGapHypothesisPortfolioPersistenceLines,
  reassessHypothesisAfterNewEvidence,
  registerHypothesisPortfolioEntry,
  registerResearchGap,
  RESEARCH_GAP_CATEGORIES,
  RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD,
  RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA,
  RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION,
  reviewResearchGap,
  transitionHypothesisPortfolioState,
} from "../src/researchGapHypothesisPortfolioContracts";

const asOf = "2026-11-09T19:00:00.000Z";
const outDir = "evaluation/research-gap-hypothesis-portfolio";

function fixturePack() {
  const portfolio = openResearchGapHypothesisPortfolio({
    id: "hsi-sp-rghp-fixture-demo",
    programmeId: "hsi-sp-prog-fixture-demo",
    label:
      "Fixture research-gap and hypothesis portfolio — engineering only; not discovery",
    authoredByPrincipalId: "fixture-agent-rghp",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    linkedObjectiveIds: ["hsi-sp-obj-fixture-demo"],
  });

  const gaps = RESEARCH_GAP_CATEGORIES.map((category, index) => {
    const draft = registerResearchGap({
      id: `hsi-sp-gap-fixture-${index + 1}`,
      portfolio,
      category,
      scientificQuestion: `Fixture scientific question for ${category.replace(/_/g, " ")}?`,
      evidenceSupportingTheGap: [
        `Fixture evidence supporting the ${category} gap classification.`,
      ],
      whyItMatters:
        "Fixture programme decision relevance for investigation planning — not a discovery claim.",
      alternativeExplanations: [
        "Fixture alternative: coverage limits may explain the apparent gap.",
      ],
      availableInvestigationMethods: [
        "Bounded public-evidence retrieval with human review",
      ],
      expectedDecisionRelevance:
        "Informs whether to propose a workstream or pause pending evidence.",
      dataRequirements: "Public evidence refs only; no PHI.",
      uncertainty: "Fixture gap uncertainty — not scientifically verified.",
      authoredByPrincipalId: "fixture-agent-rghp",
      createdAt: asOf,
      linkedPlanEvidenceGapIds: [`plan-gap-fixture-${index + 1}`],
      supportingEvidenceRefs: [`hsi-sp-evid-fixture-${index + 1}`],
      prioritisation:
        index === 0
          ? {
              id: "hsi-sp-gpc-fixture-1",
              noArbitraryImportanceScore: true,
              criteriaSummary:
                "Prioritise gaps blocking declared milestone exit criteria — no bare importance score.",
              assumptions: [
                "Milestone exit criteria are human-declared.",
                "Fixture evidence bounds are incomplete.",
              ],
              ordinalRank: 1,
              note: "Criteria-bound ordinal rank only.",
            }
          : null,
    });
    if (index === 0) {
      return reviewResearchGap({
        gap: draft,
        reviewState: "accepted_human",
        reviewedBy: {
          principalId: "fixture-researcher",
          actorKind: "human",
        },
        updatedAt: asOf,
      });
    }
    return draft;
  });

  const primary = registerHypothesisPortfolioEntry({
    id: "hsi-sp-hpf-fixture-primary",
    portfolio,
    statement:
      "Fixture primary hypothesis linking Tfh/IL-21 neighbourhood signals under public-evidence bounds.",
    linkedObjectiveIds: ["hsi-sp-obj-fixture-demo"],
    linkedM3HypothesisIds: ["hyp-fixture-m3-001"],
    addressesGapIds: [gaps[0]!.id],
    competingExplanations: [
      {
        id: "hsi-sp-hcomp-fixture-1",
        summary:
          "Competing fixture explanation emphasises macrophage cytokine axes instead.",
        relationToPrimary: "competing",
        note: "Competing explanation retained.",
      },
    ],
    evidenceLinks: [
      {
        evidenceRef: "hsi-sp-evid-fixture-1",
        polarity: "supporting",
        note: "Fixture supporting evidence — not confirmation.",
      },
      {
        evidenceRef: "hsi-sp-evid-fixture-oppose",
        polarity: "opposing",
        note: "Fixture opposing evidence retained.",
      },
    ],
    falsifiablePredictions: [
      {
        id: "hsi-sp-hpred-fixture-1",
        prediction:
          "Fixture prediction: co-occurrence of Tfh and IL-21 markers under declared bounds.",
        falsifier:
          "Absence of co-occurrence after bounded search would challenge the hypothesis.",
        linkedExperimentIds: ["exp-fixture-001"],
        note: "Falsifiable prediction — not a wet-lab outcome.",
      },
    ],
    linkedExperimentIds: ["exp-fixture-001"],
    authoredByPrincipalId: "fixture-agent-rghp",
    createdAt: asOf,
  });

  const successor = registerHypothesisPortfolioEntry({
    id: "hsi-sp-hpf-fixture-successor",
    portfolio,
    statement:
      "Fixture successor hypothesis with narrower disease-context scope.",
    linkedObjectiveIds: ["hsi-sp-obj-fixture-demo"],
    falsifiablePredictions: [
      {
        id: "hsi-sp-hpred-fixture-2",
        prediction:
          "Narrower context should improve agreement under declared bounds.",
        falsifier: "No improvement would challenge the successor hypothesis.",
        linkedExperimentIds: ["exp-fixture-002"],
        note: "Successor falsifier — fixtures only.",
      },
    ],
    linkedExperimentIds: ["exp-fixture-002"],
    authoredByPrincipalId: "fixture-agent-rghp",
    createdAt: asOf,
  });

  const underInvestigation = transitionHypothesisPortfolioState({
    entry: primary,
    nextState: "under_investigation",
    reviewedBy: {principalId: "fixture-reviewer", actorKind: "human"},
    updatedAt: asOf,
  });

  const {entry: superseded, reassessment} = reassessHypothesisAfterNewEvidence({
    id: "hsi-sp-hra-fixture-1",
    entry: underInvestigation,
    nextState: "superseded",
    newEvidenceRefs: ["hsi-sp-evid-fixture-new"],
    rationale:
      "New fixture evidence favours the successor hypothesis; prior entry retained as superseded.",
    authoredByPrincipalId: "fixture-agent-rghp",
    reviewedBy: {principalId: "fixture-reviewer", actorKind: "human"},
    createdAt: asOf,
    supersededByHypothesisId: successor.id,
    evidenceLinks: [
      ...underInvestigation.evidenceLinks,
      {
        evidenceRef: "hsi-sp-evid-fixture-new",
        polarity: "opposing",
        note: "New evidence challenges the primary statement.",
      },
    ],
  });

  const rejectedSuccessor = transitionHypothesisPortfolioState({
    entry: successor,
    nextState: "rejected",
    reviewedBy: {principalId: "fixture-reviewer", actorKind: "human"},
    updatedAt: asOf,
    evidenceLinks: [
      {
        evidenceRef: "hsi-sp-evid-fixture-reject",
        polarity: "opposing",
        note: "Fixture opposing evidence after review.",
      },
    ],
    note: "Human rejection retained in portfolio history.",
  });

  const pack = buildResearchGapHypothesisPortfolioPack({
    portfolios: [portfolio],
    gaps,
    hypotheses: [superseded, rejectedSuccessor],
    reassessments: [reassessment],
    asOf,
  });

  const persistenceLines = projectResearchGapHypothesisPortfolioPersistenceLines(
    {
      portfolio,
      gaps,
      hypotheses: [superseded, rejectedSuccessor],
      reassessments: [reassessment],
    },
  );

  return {pack, persistenceLines};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines} = fixturePack();
  writeFileSync(
    join(outDir, "research-gap-hypothesis-portfolio-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_SCHEMA,
        method: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_METHOD,
        version: RESEARCH_GAP_HYPOTHESIS_PORTFOLIO_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        noArbitraryImportanceScores: true,
        prioritisationExposesCriteriaAndAssumptions: true,
        hypothesisStateRequiresEvidenceAndReview: true,
        discussionVolumeAloneDoesNotConfirm: true,
        agentsCannotSelfApprove: true,
        retainRejectedAndSupersededHypotheses: true,
        dependsOnPr1ScientificProgrammeContracts: true,
        dependsOnPr2ResearchObjectivePlanning: true,
        dependsOnPr3ContinuousEvidenceInvestigation: true,
        dependsOnPr4ScientificKnowledgeEvolution: true,
        extendsM3HypothesisRegistryById: true,
        extendsGapInvestigation: true,
        notSeparateAgentPlatform: true,
        noAutoApprovalOfPlansOrClaims: true,
        noFabricatedDiscoveries: true,
        workbenchUi: false,
        graphPromotable: false,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        researchGapHypothesisPortfolio: true,
        experimentPortfolioIntegration: false,
        persistenceLineCount: persistenceLines.length,
        persistenceLines,
      },
      null,
      2,
    )}\n`,
  );
}

const checkOnly = process.argv.includes("--check");
if (checkOnly) {
  const {pack} = fixturePack();
  if (
    pack.portfolioCount !== 1 ||
    pack.gapCount !== 10 ||
    pack.hypothesisCount !== 2 ||
    pack.reassessmentCount !== 1 ||
    pack.gapCategories.length !== 10 ||
    pack.hypothesisStates.length !== 8
  ) {
    throw new Error("Research gap / hypothesis portfolio pack check failed");
  }
  if (pack.honesty.researchGapHypothesisPortfolio !== true) {
    throw new Error("Research gap / hypothesis portfolio honesty gate failed");
  }
  if (pack.honesty.experimentPortfolioIntegration !== false) {
    throw new Error("Experiment portfolio integration must stay deferred to PR6");
  }
  if (pack.honesty.noArbitraryImportanceScores !== true) {
    throw new Error("Arbitrary importance score honesty gate failed");
  }
  if (pack.honesty.discussionVolumeAloneDoesNotConfirm !== true) {
    throw new Error("Discussion-volume confirmation honesty gate failed");
  }
  if (pack.honesty.agentsCannotSelfApprove !== true) {
    throw new Error("Agent self-approval honesty gate failed");
  }
  if (pack.honesty.graphPromotable !== false) {
    throw new Error("Graph promotion must stay false");
  }
  if (
    pack.hypotheses.some(
      (h) =>
        (h.state === "rejected" || h.state === "superseded") &&
        h.retainedAfterRejectOrSupersede !== true,
    )
  ) {
    throw new Error("Rejected/superseded hypotheses must be retained");
  }
  console.log("research-gap-hypothesis-portfolio contracts check ok");
} else {
  writeOutputs();
  console.log(`wrote ${outDir}`);
}
