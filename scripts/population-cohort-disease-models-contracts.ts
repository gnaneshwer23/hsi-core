/**
 * Milestone 15 / PR5 — population and cohort disease models pack check.
 * Offline contracts only — no PHI, twin, CDS, or causal/subtype collapse;
 * prediction ≠ causation; unsupervised clusters ≠ validated subtypes;
 * predictive accuracy ≠ clinical usefulness.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  PCDM_MODELLING_KINDS,
  POPULATION_COHORT_DISEASE_MODELS_METHOD,
  POPULATION_COHORT_DISEASE_MODELS_SCHEMA,
  POPULATION_COHORT_DISEASE_MODELS_VERSION,
  buildPopulationCohortDiseaseModelsPack,
  draftBiomarkerAssociationAnalysis,
  draftDiseaseProgressionRisk,
  draftDiseaseTrajectoryClustering,
  draftLongitudinalOutcomePrediction,
  draftModellingMethodologyDeclaration,
  draftOrganSpecificOutcomeModelling,
  draftPhenotypeStratification,
  draftPopulationCohortModellingBundle,
  draftPopulationCohortModellingSpec,
  projectPopulationCohortDiseaseModelsPersistenceLines,
  transitionPopulationCohortModellingBundle,
} from "../src/populationCohortDiseaseModelsContracts";

const asOf = "2026-11-09T14:00:00.000Z";
const outDir = "evaluation/population-cohort-disease-models";

function fixturePack() {
  const blockedSpec = draftPopulationCohortModellingSpec({
    id: "hsi-pcdm-spec-blocked-demo",
    displayName: "Blocked population cohort models until authorised dataset",
    scientificQuestion:
      "Blocked scientific path for population and cohort disease models until an authorised clinical dataset is supplied.",
    diseaseContextId: "hsi-hdi-ctx-blocked-demo",
    cohortDefinitionId: "hsi-rcb-coh-blocked-demo",
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "fixture-agent-pcdm",
    createdAt: asOf,
  });

  const spec = draftPopulationCohortModellingSpec({
    id: "hsi-pcdm-spec-ssc-demo",
    displayName: "Fixture SSc population and cohort disease modelling spec",
    scientificQuestion:
      "How can fixture cohort-level disease models declare longitudinal outcome prediction, exploratory trajectory clustering, progression risk, phenotype stratification, organ-specific outcomes, and biomarker associations while keeping prediction distinct from causation and keeping exploratory clusters distinct from subtype validation?",
    diseaseContextId: "hsi-hdi-ctx-ssc-demo",
    integratedDiseaseContextId: "hsi-cbc-idc-ssc-demo",
    longitudinalModellingSpecId: "hsi-ldsm-spec-ssc-demo",
    crossScaleOntologySpecId: "hsi-csol-spec-ssc-demo",
    cohortDefinitionId: "hsi-rcb-coh-ssc-demo",
    rweStudyId: "hsi-rwe-study-ssc-demo",
    datasetAvailability: "fixture_only",
    authoredByPrincipalId: "fixture-agent-pcdm",
    createdAt: asOf,
  });

  const methodology = draftModellingMethodologyDeclaration({
    id: "hsi-pcdm-meth-ssc-demo",
    modellingSpec: spec,
    indexDateKind: "first_qualifying_diagnosis",
    indexDateDeclaration:
      "Fixture index date = first qualifying SSc code in the cohort definition window.",
    outcomeHorizon: {
      value: 24,
      unit: "months",
      note: "Fixture 24-month research outcome horizon.",
    },
    predictorAvailability: "declared_available_at_index",
    trainValidationSeparation: "holdout_declared",
    missingDataHandling: "complete_case_declared",
    confounderAssessment: "not_applicable_prediction_only",
    calibrationStatus: "assessed_declared",
    discriminationStatus: "assessed_declared",
    externalValidationStatus: "feasible_not_performed",
    subgroupPerformanceStatus: "partial_declared",
    methodologySummary:
      "Fixture methodology declares cohort definition, index date, outcome horizon, predictor availability, train/validation separation, missing-data handling, confounder assessment, calibration, discrimination, external validation feasibility, and subgroup performance — research envelopes only.",
    authoredByPrincipalId: "fixture-agent-pcdm",
    createdAt: asOf,
  });

  const prediction = draftLongitudinalOutcomePrediction({
    id: "hsi-pcdm-pred-ssc-outcome",
    modellingSpec: spec,
    methodology,
    outcomeRef: "hsi-rwe-out-ssc-pf-demo",
    predictionSummary:
      "Fixture longitudinal outcome prediction for research — prediction envelope only.",
    limitations: [
      "Prediction is not causation.",
      "Predictive accuracy alone does not establish clinical usefulness.",
      "Fixture research envelope — not clinical care.",
    ],
    authoredByPrincipalId: "fixture-agent-pcdm",
    createdAt: asOf,
  });

  const clustering = draftDiseaseTrajectoryClustering({
    id: "hsi-pcdm-clu-ssc-exploratory",
    modellingSpec: spec,
    methodology,
    clusterValidationStatus: "exploratory_unsupervised",
    clusterCountDeclared: 3,
    clusteringSummary:
      "Fixture unsupervised trajectory clustering — exploratory research only.",
    limitations: [
      "Unsupervised clusters are not validated disease subtypes.",
      "Exploratory clustering only until external validation.",
    ],
    authoredByPrincipalId: "fixture-agent-pcdm",
    createdAt: asOf,
  });

  const risk = draftDiseaseProgressionRisk({
    id: "hsi-pcdm-risk-ssc-progression",
    modellingSpec: spec,
    methodology,
    riskSummary:
      "Fixture disease progression risk research envelope without causal explanation claims.",
    limitations: [
      "Progression risk research is not causal explanation.",
      "Not a treatment directive.",
    ],
    authoredByPrincipalId: "fixture-agent-pcdm",
    createdAt: asOf,
  });

  const phenotype = draftPhenotypeStratification({
    id: "hsi-pcdm-pheno-ssc-strata",
    modellingSpec: spec,
    methodology,
    stratificationSummary:
      "Fixture phenotype stratification into aggregate research strata.",
    stratumCountDeclared: 4,
    limitations: [
      "Phenotype strata are not validated disease subtypes by default.",
      "Aggregate honesty; small-cell disclosure applies.",
    ],
    authoredByPrincipalId: "fixture-agent-pcdm",
    createdAt: asOf,
  });

  const organ = draftOrganSpecificOutcomeModelling({
    id: "hsi-pcdm-organ-ssc-lung",
    modellingSpec: spec,
    methodology,
    organOrSystemLabel: "lung",
    outcomeSummary:
      "Fixture organ-specific outcome modelling for lung research endpoints.",
    limitations: [
      "Organ-specific modelling is not causal organ explanation.",
      "Small-cell disclosure applies for fixture research.",
    ],
    authoredByPrincipalId: "fixture-agent-pcdm",
    createdAt: asOf,
  });

  const biomarker = draftBiomarkerAssociationAnalysis({
    id: "hsi-pcdm-bio-ssc-crp",
    modellingSpec: spec,
    methodology,
    biomarkerLabel: "Fixture CRP association marker",
    associationKind: "association_only",
    associationSummary:
      "Fixture biomarker association analysis — association only, not causation.",
    limitations: [
      "Association is not causation.",
      "Not a clinical usefulness claim.",
    ],
    authoredByPrincipalId: "fixture-agent-pcdm",
    createdAt: asOf,
  });

  const draftBundle = draftPopulationCohortModellingBundle({
    id: "hsi-pcdm-bnd-ssc-demo",
    displayName: "Fixture SSc population cohort modelling bundle",
    modellingSpec: spec,
    bundleVersion: "0.1.0",
    limitations: [
      "Fixture population/cohort modelling bundle — research decision support only.",
      "Prediction is not causation.",
      "Unsupervised clusters are not validated subtypes.",
      "Predictive accuracy is not clinical usefulness.",
    ],
    methodologies: [methodology],
    longitudinalOutcomePredictions: [prediction],
    diseaseTrajectoryClusterings: [clustering],
    diseaseProgressionRisks: [risk],
    phenotypeStratifications: [phenotype],
    organSpecificOutcomeModellings: [organ],
    biomarkerAssociationAnalyses: [biomarker],
    authoredByPrincipalId: "fixture-agent-pcdm",
    createdAt: asOf,
  });
  const underReview = transitionPopulationCohortModellingBundle({
    bundle: draftBundle,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-pcdm", actorKind: "ai_agent"},
  });
  const bundle = transitionPopulationCohortModellingBundle({
    bundle: underReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const blockedBundle = draftPopulationCohortModellingBundle({
    id: "hsi-pcdm-bnd-blocked-demo",
    displayName: "Blocked population cohort modelling bundle",
    modellingSpec: blockedSpec,
    bundleVersion: "0.1.0",
    limitations: [
      "Blocked awaiting authorised research dataset — not scientific validation.",
      "Not a digital twin product; fixtures only.",
    ],
    authoredByPrincipalId: "fixture-agent-pcdm",
    createdAt: asOf,
  });

  const specs = [blockedSpec, spec];
  const methodologies = [methodology];
  const pack = buildPopulationCohortDiseaseModelsPack({
    specs,
    methodologies,
    longitudinalOutcomePredictions: [prediction],
    diseaseTrajectoryClusterings: [clustering],
    diseaseProgressionRisks: [risk],
    phenotypeStratifications: [phenotype],
    organSpecificOutcomeModellings: [organ],
    biomarkerAssociationAnalyses: [biomarker],
    bundles: [blockedBundle, bundle],
    asOf,
  });
  const persistenceLines = projectPopulationCohortDiseaseModelsPersistenceLines(
    {
      specs,
      methodologies,
      longitudinalOutcomePredictions: [prediction],
      diseaseTrajectoryClusterings: [clustering],
      diseaseProgressionRisks: [risk],
      phenotypeStratifications: [phenotype],
      organSpecificOutcomeModellings: [organ],
      biomarkerAssociationAnalyses: [biomarker],
      bundles: [blockedBundle, bundle],
    },
  );

  return {pack, persistenceLines, blockedSpec};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blockedSpec} = fixturePack();
  writeFileSync(
    join(outDir, "population-cohort-disease-models-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: POPULATION_COHORT_DISEASE_MODELS_SCHEMA,
        method: POPULATION_COHORT_DISEASE_MODELS_METHOD,
        version: POPULATION_COHORT_DISEASE_MODELS_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked:
          blockedSpec.datasetAvailability ===
          "blocked_no_authorised_clinical_dataset",
        scientificPathBlockedNoAuthorisedDataset: true,
        modellingKindCount: PCDM_MODELLING_KINDS.length,
        predictionIsNotCausation: true,
        unsupervisedClustersAreNotValidatedSubtypes: true,
        predictiveAccuracyIsNotClinicalUsefulness: true,
        aggregateHonestyRequired: true,
        smallCellDisclosureRequired: true,
        noIndividualCollapse: true,
        notClinicalCare: true,
        notDigitalTwinProduct: true,
        phiIngestion: false,
        liveTwinOrMultiscale: false,
        autonomousDiagnosisOrPrescribing: false,
        workbenchUi: false,
        graphPromotable: false,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
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
  const {pack, blockedSpec} = fixturePack();
  if (
    pack.specCount !== 2 ||
    pack.methodologyCount !== 1 ||
    pack.longitudinalOutcomePredictionCount !== 1 ||
    pack.diseaseTrajectoryClusteringCount !== 1 ||
    pack.diseaseProgressionRiskCount !== 1 ||
    pack.phenotypeStratificationCount !== 1 ||
    pack.organSpecificOutcomeModellingCount !== 1 ||
    pack.biomarkerAssociationAnalysisCount !== 1 ||
    pack.bundleCount !== 2 ||
    pack.exploratoryClusterCount !== 1 ||
    pack.modellingKindCount !== 6
  ) {
    throw new Error("Population cohort disease models pack check failed");
  }
  if (pack.honesty.predictionIsNotCausation !== true) {
    throw new Error("Prediction≠causation honesty gate failed");
  }
  if (pack.honesty.unsupervisedClustersAreNotValidatedSubtypes !== true) {
    throw new Error("Unsupervised≠validated subtype honesty gate failed");
  }
  if (pack.honesty.predictiveAccuracyIsNotClinicalUsefulness !== true) {
    throw new Error("Accuracy≠clinical usefulness honesty gate failed");
  }
  if (pack.honesty.aggregateHonestyRequired !== true) {
    throw new Error("Aggregate honesty gate failed");
  }
  if (pack.honesty.noIndividualCollapse !== true) {
    throw new Error("No individual collapse honesty gate failed");
  }
  if (
    blockedSpec.datasetAvailability !==
    "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `population-cohort-disease-models-contracts check ok (${pack.specCount} specs, ${pack.bundleCount} bundles, ${pack.modellingKindCount} kinds, ${pack.exploratoryClusterCount} exploratory clusters; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(
    `Wrote ${outDir}/population-cohort-disease-models-pack.v1.json`,
  );
}
