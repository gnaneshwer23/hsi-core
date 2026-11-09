/**
 * Milestone 15 / PR1 — human disease intelligence pack check.
 * Offline contracts only — no twin product, PHI, fabricated timelines,
 * personalised treatment effects, or live multiscale engine claims.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  HUMAN_DISEASE_INTELLIGENCE_METHOD,
  HUMAN_DISEASE_INTELLIGENCE_SCHEMA,
  HUMAN_DISEASE_INTELLIGENCE_VERSION,
  PERMITTED_RESEARCH_USES,
  buildHumanDiseaseIntelligencePack,
  draftDigitalPatientResearchModel,
  draftDiseaseResearchContext,
  draftDiseaseStateEstimate,
  draftDiseaseStateObservation,
  draftSimulationScenario,
  projectHumanDiseaseIntelligencePersistenceLines,
  transitionDigitalPatientResearchModel,
  transitionDiseaseResearchContext,
  transitionSimulationScenario,
} from "../src/humanDiseaseIntelligenceContracts";

const asOf = "2026-11-09T22:00:00.000Z";
const outDir = "evaluation/human-disease-intelligence";

function fixturePack() {
  const blocked = draftDiseaseResearchContext({
    id: "hsi-hdi-ctx-blocked-demo",
    displayName: "Blocked disease context until authorised dataset",
    diseaseFocus: "Blocked disease framing",
    scientificQuestion:
      "Blocked scientific path until an authorised research dataset is supplied.",
    populationFraming: "Authorised population not supplied",
    permittedResearchUses: ["methods_engineering_fixture"],
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "fixture-agent-hdi",
    createdAt: asOf,
  });

  const draft = draftDiseaseResearchContext({
    id: "hsi-hdi-ctx-ssc-demo",
    displayName: "Fixture SSc disease research context",
    diseaseFocus: "Systemic sclerosis research framing",
    scientificQuestion:
      "Fixture disease intelligence envelopes — observed vs inferred without individual clinical truth claims.",
    populationFraming:
      "Fixture engineering cohort framing — not an authorised clinical population",
    permittedResearchUses: [
      "disease_mechanism_research",
      "observational_association_research",
      "population_simulation_research",
      "methods_engineering_fixture",
    ],
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "fixture-agent-hdi",
    createdAt: asOf,
    rweStudyId: "hsi-rwe-study-fixture-demo",
    longitudinalAnalysisSpecId: "hsi-lce-spec-lab-trend-demo",
    cohortDefinitionId: "hsi-rcb-coh-fixture-reserved",
    therapeuticProgrammeId: "hsi-tx-prog-fixture-demo",
    translationalProgrammeId: "hsi-td-prog-fixture-demo",
  });
  const underReview = transitionDiseaseResearchContext({
    context: draft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-hdi", actorKind: "ai_agent"},
  });
  const context = transitionDiseaseResearchContext({
    context: underReview,
    to: "accepted_for_further_research",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const observation = draftDiseaseStateObservation({
    id: "hsi-hdi-obs-crp-demo",
    diseaseContext: context,
    clinicalConcept: "Fixture CRP laboratory concept",
    subjectRefKind: "pseudonymous_subject",
    subjectOrCohortRef: "pseudo-subj-hdi-demo",
    missingness: "observed",
    missingnessNote: "Value present in fixture observation",
    observedValueDeclared: "declared-fixture-crp",
    unit: "mg/L",
    observedAt: "2024-03-10T12:00:00.000Z",
    rweObservationId: "hsi-rwe-obs-fixture-demo",
    authoredByPrincipalId: "fixture-agent-hdi",
    createdAt: asOf,
  });

  const estimate = draftDiseaseStateEstimate({
    id: "hsi-hdi-est-activity-demo",
    diseaseContext: context,
    estimateMethod: "cohort_association_declared",
    confidenceOrdinal: "low",
    estimateSummary:
      "Fixture inferred disease-activity estimate — population association is not individual truth",
    limitations: [
      "Inferred estimate only — not a diagnosis or treatment directive.",
      "Population association is not individual truth.",
    ],
    subjectRefKind: "cohort_aggregate",
    subjectOrCohortRef: "cohort-hdi-fixture-demo",
    supportingObservationIds: [observation.id],
    rweAnalysisId: "hsi-rwe-anl-fixture-demo",
    longitudinalResultId: "hsi-lce-res-lab-demo",
    authoredByPrincipalId: "fixture-agent-hdi",
    createdAt: asOf,
  });

  const modelDraft = draftDigitalPatientResearchModel({
    id: "hsi-hdi-dpm-demo-001",
    diseaseContext: context,
    displayName: "Fixture digital patient research model",
    pseudonymousSubjectRef: "pseudo-subj-hdi-demo",
    permittedResearchUses: [
      "observational_association_research",
      "population_simulation_research",
      "methods_engineering_fixture",
    ],
    linkedObservationIds: [observation.id],
    linkedEstimateIds: [estimate.id],
    authoredByPrincipalId: "fixture-agent-hdi",
    createdAt: asOf,
  });
  const modelReview = transitionDigitalPatientResearchModel({
    model: modelDraft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-hdi", actorKind: "ai_agent"},
  });
  const model = transitionDigitalPatientResearchModel({
    model: modelReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const scenarioDraft = draftSimulationScenario({
    id: "hsi-hdi-sim-demo-001",
    diseaseContext: context,
    displayName: "Fixture research simulation scenario",
    researchQuestion:
      "Fixture population-level research simulation envelope for association exploration under declared limitations.",
    subjectRefKind: "cohort_aggregate",
    subjectOrCohortRef: "cohort-hdi-sim-demo",
    digitalPatientModelId: model.id,
    limitations: [
      "Research-only simulation envelope — not a personalised treatment effect.",
      "M11 multiscale engine is skipped/missing; live engine not operational.",
      "Synthetic/fixture results are not scientific validation when authorised dataset is blocked.",
    ],
    authoredByPrincipalId: "fixture-agent-hdi",
    createdAt: asOf,
  });
  const scenarioReview = transitionSimulationScenario({
    scenario: scenarioDraft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-hdi", actorKind: "ai_agent"},
  });
  const scenario = transitionSimulationScenario({
    scenario: scenarioReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const contexts = [blocked, context];
  const pack = buildHumanDiseaseIntelligencePack({
    contexts,
    observations: [observation],
    estimates: [estimate],
    digitalPatientModels: [model],
    simulationScenarios: [scenario],
    asOf,
  });
  const persistenceLines = projectHumanDiseaseIntelligencePersistenceLines({
    contexts,
    observations: [observation],
    estimates: [estimate],
    digitalPatientModels: [model],
    simulationScenarios: [scenario],
  });

  return {pack, persistenceLines, blocked};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blocked} = fixturePack();
  writeFileSync(
    join(outDir, "human-disease-intelligence-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: HUMAN_DISEASE_INTELLIGENCE_SCHEMA,
        method: HUMAN_DISEASE_INTELLIGENCE_METHOD,
        version: HUMAN_DISEASE_INTELLIGENCE_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked: blocked.datasetAvailability,
        scientificPathBlockedNoAuthorisedDataset: true,
        notSeparateDigitalTwinProduct: true,
        observedIsNotInferred: true,
        populationAssociationIsNotIndividualTruth: true,
        identifiableOutsideScientificKg: true,
        pseudonymisedMayStillBePersonalData: true,
        phiIngestion: false,
        autonomousDiagnosisOrPrescribing: false,
        personalisedTreatmentEffects: false,
        fabricatedDiseaseTimelines: false,
        syntheticPatientsUsedAsScientificValidation: false,
        liveMultiscaleEngine: false,
        m11SimulationClaimed: false,
        workbenchUi: false,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        permittedResearchUseCount: PERMITTED_RESEARCH_USES.length,
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
  const {pack, blocked} = fixturePack();
  if (
    pack.contextCount < 2 ||
    pack.observationCount !== 1 ||
    pack.estimateCount !== 1 ||
    pack.digitalPatientModelCount !== 1 ||
    pack.simulationScenarioCount !== 1
  ) {
    throw new Error("Human disease intelligence pack check failed");
  }
  if (pack.honesty.notSeparateDigitalTwinProduct !== true) {
    throw new Error("Honesty gate failed");
  }
  if (pack.honesty.observedIsNotInferred !== true) {
    throw new Error("Observed≠inferred honesty gate failed");
  }
  if (pack.honesty.noLiveMultiscaleEngineClaim !== true) {
    throw new Error("Live multiscale engine honesty gate failed");
  }
  if (
    blocked.datasetAvailability !== "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `human-disease-intelligence-contracts check ok (${pack.contextCount} contexts, ${pack.observationCount} observations, ${pack.estimateCount} estimates, ${pack.digitalPatientModelCount} models, ${pack.simulationScenarioCount} scenarios; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(`Wrote ${outDir}/human-disease-intelligence-pack.v1.json`);
}
