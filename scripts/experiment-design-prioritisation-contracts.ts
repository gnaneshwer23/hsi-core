/**
 * Milestone 10 / PR2 — experiment design & prioritisation pack check.
 * Offline contracts only — does not invent results, probabilities, or lab runs.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  buildExperimentDesignPack,
  buildExperimentPrioritisation,
  draftExperimentDesignPackage,
  EXPERIMENT_DESIGN_METHOD,
  EXPERIMENT_DESIGN_SCHEMA,
  EXPERIMENT_DESIGN_VERSION,
  projectExperimentDesignPersistenceLines,
  transitionExperimentDesignPackage,
} from "../src/experimentDesignPrioritisationContracts";

const asOf = "2026-11-09T15:00:00.000Z";
const outDir = "evaluation/experiment-design-prioritisation";

function fixturePack() {
  const draft = draftExperimentDesignPackage({
    id: "hsi-exp-des-fixture-demo",
    hypothesisId: "hyp-fixture-001",
    hypothesisStatement:
      "Fixture hypothesis: pathway X is a primary driver in the scoped research context.",
    hypothesisFalsifier:
      "If authorised pathway-X readouts remain null with intact controls, the primary-driver claim is not supported.",
    authoredByPrincipalId: "fixture-agent-designer",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    investigationId: "inv-fixture-001",
    falsifiablePredictions: [
      {
        id: "pred-fixture-1",
        statement: "Authorised pathway-X perturbation changes declared markers.",
        falsifier: "No marker change under authorised perturbation with intact controls.",
      },
    ],
    competingExplanations: [
      {
        id: "ce-fixture-alt",
        statement: "Pathway Y dominates; pathway X is secondary.",
        evidenceRefIds: ["gap-fixture-001"],
      },
      {
        id: "ce-fixture-epiphenomenon",
        statement: "Pathway X elevation is correlative only.",
        evidenceRefIds: [],
      },
    ],
    discriminatingQuestions: [
      {
        id: "dq-fixture-1",
        question: "Does pathway-X perturbation act independently of pathway Y?",
        targetsExplanationIds: ["ce-fixture-alt", "ce-fixture-epiphenomenon"],
      },
    ],
    candidateApproaches: [
      {
        id: "hsi-exp-apr-fixture-reanalysis",
        title: "Fixture public reanalysis",
        category: "public_dataset_reanalysis",
        experimentalModel: "Authorised public cohort reanalysis (fixture).",
        controls: ["matched_negative_signature"],
        negativeControls: ["scrambled_null_set"],
        measurements: ["enrichment_score"],
        confounders: ["batch_effects"],
        methodologicalLimitations: ["Public bulk data lacks tissue resolution."],
        feasibility: "high",
        feasibilityNotes: "Offline fixture / authorised public data only.",
        discriminationStrength: "moderate",
        distinguishesExplanationIds: ["ce-fixture-alt"],
        resultsSupportHypothesis: "Consistent enrichment supports pathway-X framing.",
        resultsChallengeHypothesis: "Absent enrichment challenges pathway-X framing.",
        nullResultInterpretation:
          "Null enrichment may reflect cohort mismatch; does not auto-confirm pathway Y.",
        remainingUncertainties: ["Tissue compartment unresolved."],
        infoRequiredBeforeExecution: ["Confirm dataset licence and inclusion criteria."],
        reproducibilityNotes: ["Pin accessions and script hashes."],
        linkedProposalId: "hsi-exp-prop-fixture-demo",
        note: "Fixture approach A",
      },
      {
        id: "hsi-exp-apr-fixture-invitro",
        title: "Fixture in vitro discrimination",
        category: "in_vitro_mechanistic",
        experimentalModel: "Culture perturbation vs pathway-Y controls (fixture design only).",
        controls: ["vehicle"],
        negativeControls: ["non_targeting_control"],
        measurements: ["marker_readout"],
        confounders: ["serum_batch"],
        methodologicalLimitations: [
          "In vitro systems may not recapitulate tissue context.",
          "Not a wet-lab authorisation.",
        ],
        feasibility: "moderate",
        feasibilityNotes: "Requires PR1 researcher-approved protocol before any run claim.",
        discriminationStrength: "strong",
        distinguishesExplanationIds: [
          "ce-fixture-alt",
          "ce-fixture-epiphenomenon",
        ],
        resultsSupportHypothesis:
          "Pathway-X-specific marker dependence supports the hypothesis.",
        resultsChallengeHypothesis:
          "Pathway-Y-only dependence challenges the pathway-X primary-driver claim.",
        nullResultInterpretation:
          "Null across arms challenges both simple stories; revisit confounders.",
        remainingUncertainties: ["Translation to human tissue unresolved."],
        infoRequiredBeforeExecution: [
          "Researcher-approved PR1 protocol version.",
          "Do not invent partner MoU.",
        ],
        reproducibilityNotes: ["Queue independent replication if culture signal appears."],
        linkedProposalId: null,
        note: "Fixture approach B",
      },
    ],
  });

  const ready = transitionExperimentDesignPackage({
    pack: draft,
    to: "ready_for_prioritisation",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-designer", actorKind: "ai_agent"},
  });

  const prioritisation = buildExperimentPrioritisation({
    id: "hsi-exp-pri-fixture-demo",
    designPackage: ready,
    createdAt: asOf,
    createdByPrincipalId: "fixture-researcher",
  });

  const prioritised = transitionExperimentDesignPackage({
    pack: ready,
    to: "prioritised",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  return {designPackage: prioritised, prioritisation};
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const {designPackage, prioritisation} = fixturePack();
  const pack = buildExperimentDesignPack({
    designPackages: [designPackage],
    prioritisations: [prioritisation],
    asOf,
  });
  const status = {
    schema: EXPERIMENT_DESIGN_SCHEMA,
    method: EXPERIMENT_DESIGN_METHOD,
    version: EXPERIMENT_DESIGN_VERSION,
    asOf,
    designPackageCount: pack.designPackageCount,
    prioritisationCount: pack.prioritisationCount,
    topApproachId: prioritisation.rankedApproachIds[0] ?? null,
    rankingMethod: prioritisation.rankingMethod,
    migration: "deferred",
    neon: "red-wave-only",
    dependsOnPr1: true,
    pr1PullRequest: 101,
    honesty: pack.honesty,
    persistenceLines: projectExperimentDesignPersistenceLines({
      designPackage,
      prioritisation,
    }),
  };

  if (!checkOnly) {
    mkdirSync(outDir, {recursive: true});
    writeFileSync(join(outDir, "STATUS.json"), `${JSON.stringify(status, null, 2)}\n`);
    writeFileSync(
      join(outDir, "design-prioritisation-pack.v1.json"),
      `${JSON.stringify(pack, null, 2)}\n`,
    );
  }

  if (pack.honesty.fabricatedResults) {
    throw Error("Fabricated results must stay false");
  }
  if (pack.honesty.pipelinesExecuted) {
    throw Error("Pipeline execution must stay false");
  }
  if (pack.honesty.labAdaptersWired) {
    throw Error("Lab adapters must stay false");
  }
  if (prioritisation.inventedInformationGainProbability) {
    throw Error("Information-gain probability must stay false");
  }
  if (prioritisation.autoApprovedForExecution) {
    throw Error("Auto-approve execution must stay false");
  }
  if (prioritisation.rankedApproachIds[0] !== "hsi-exp-apr-fixture-invitro") {
    throw Error("Expected discriminating in-vitro approach to rank first");
  }

  console.log(
    checkOnly
      ? `experiment-design-prioritisation check ok (${pack.designPackageCount} packages, ${pack.prioritisationCount} prioritisations)`
      : `wrote ${outDir} (${pack.designPackageCount} packages, ${pack.prioritisationCount} prioritisations)`,
  );
}

main();
