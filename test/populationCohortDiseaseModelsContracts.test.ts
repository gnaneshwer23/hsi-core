/**
 * Milestone 15 PR5 — population and cohort disease models honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  PCDM_MODELLING_KINDS,
  buildPopulationCohortDiseaseModelsPack,
  createMemoryPopulationCohortDiseaseModelsStore,
  draftBiomarkerAssociationAnalysis,
  draftDiseaseProgressionRisk,
  draftDiseaseTrajectoryClustering,
  draftLongitudinalOutcomePrediction,
  draftModellingMethodologyDeclaration,
  draftOrganSpecificOutcomeModelling,
  draftPhenotypeStratification,
  draftPopulationCohortModellingBundle,
  draftPopulationCohortModellingSpec,
  fingerprintPopulationCohortModellingBundle,
  isExploratoryClusterStatus,
  projectPopulationCohortDiseaseModelsPersistenceLines,
  transitionPopulationCohortModellingBundle,
  transitionPopulationCohortModellingSpec,
  type ModellingMethodologyDeclaration,
  type PopulationCohortModellingSpec,
} from "../src/populationCohortDiseaseModelsContracts";

const asOf = "2026-11-09T14:00:00.000Z";

function seedFixtureSpec(
  overrides?: Partial<Parameters<typeof draftPopulationCohortModellingSpec>[0]>,
): PopulationCohortModellingSpec {
  return draftPopulationCohortModellingSpec({
    id: "hsi-pcdm-spec-ssc-fixture",
    displayName: "Fixture SSc population and cohort disease modelling spec",
    scientificQuestion:
      "How can fixture cohort-level disease models declare longitudinal outcome prediction, exploratory trajectory clustering, progression risk, phenotype stratification, organ-specific outcomes, and biomarker associations while keeping prediction distinct from causation and keeping exploratory clusters distinct from subtype validation?",
    diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
    integratedDiseaseContextId: "hsi-cbc-idc-ssc-fixture",
    longitudinalModellingSpecId: "hsi-ldsm-spec-ssc-fixture",
    crossScaleOntologySpecId: "hsi-csol-spec-ssc-fixture",
    cohortDefinitionId: "hsi-rcb-coh-ssc-fixture",
    rweStudyId: "hsi-rwe-study-ssc-fixture",
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "agent-hsi-pcdm-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    ...overrides,
  });
}

function seedMethodology(
  spec: PopulationCohortModellingSpec,
  overrides?: Partial<
    Parameters<typeof draftModellingMethodologyDeclaration>[0]
  >,
): ModellingMethodologyDeclaration {
  return draftModellingMethodologyDeclaration({
    id: "hsi-pcdm-meth-ssc-fixture",
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
    authoredByPrincipalId: "agent-hsi-pcdm-1",
    createdAt: asOf,
    ...overrides,
  });
}

describe("population and cohort disease models contracts (M15 PR5)", () => {
  test("covers all modelling kinds with HDI/CBC/LDSM/CSOL/cohort links", () => {
    expect(PCDM_MODELLING_KINDS).toHaveLength(6);
    expect(PCDM_MODELLING_KINDS).toContain("longitudinal_outcome_prediction");
    expect(PCDM_MODELLING_KINDS).toContain("disease_trajectory_clustering");
    expect(PCDM_MODELLING_KINDS).toContain("biomarker_association_analysis");

    const spec = seedFixtureSpec();
    expect(spec.honesty.predictionIsNotCausation).toBe(true);
    expect(spec.honesty.unsupervisedClustersAreNotValidatedSubtypes).toBe(
      true,
    );
    expect(spec.honesty.predictiveAccuracyIsNotClinicalUsefulness).toBe(true);
    expect(spec.honesty.aggregateHonestyRequired).toBe(true);
    expect(spec.honesty.noIndividualCollapse).toBe(true);
    expect(spec.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(spec.diseaseContextId).toBe("hsi-hdi-ctx-ssc-fixture");
    expect(spec.integratedDiseaseContextId).toBe("hsi-cbc-idc-ssc-fixture");
    expect(spec.longitudinalModellingSpecId).toBe("hsi-ldsm-spec-ssc-fixture");
    expect(spec.crossScaleOntologySpecId).toBe("hsi-csol-spec-ssc-fixture");
    expect(spec.cohortDefinitionId).toBe("hsi-rcb-coh-ssc-fixture");
    expect(spec.predictionIsNotCausation).toBe(true);
    expect(spec.notDigitalTwinProduct).toBe(true);
    expect(spec.modellingKinds).toHaveLength(6);

    const methodology = seedMethodology(spec);
    expect(methodology.cohortDefinitionId).toBe("hsi-rcb-coh-ssc-fixture");
    expect(methodology.indexDateKind).toBe("first_qualifying_diagnosis");
    expect(methodology.outcomeHorizon.value).toBe(24);
    expect(methodology.trainValidationSeparation).toBe("holdout_declared");
    expect(methodology.calibrationStatus).toBe("assessed_declared");
    expect(methodology.discriminationStatus).toBe("assessed_declared");
  });

  test("prediction is not causation and accuracy is not clinical usefulness", () => {
    const spec = seedFixtureSpec();
    const methodology = seedMethodology(spec);

    const prediction = draftLongitudinalOutcomePrediction({
      id: "hsi-pcdm-pred-ssc-outcome",
      modellingSpec: spec,
      methodology,
      outcomeRef: "hsi-rwe-out-ssc-pf-fixture",
      predictionSummary:
        "Fixture longitudinal outcome prediction for research — prediction envelope only.",
      limitations: [
        "Prediction is not causation.",
        "Predictive accuracy alone does not establish clinical usefulness.",
        "Fixture research envelope — not clinical care.",
      ],
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    expect(prediction.causalExplanationClaimed).toBe(false);
    expect(prediction.clinicalUsefulnessClaimed).toBe(false);

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
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    expect(risk.causalExplanationClaimed).toBe(false);

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
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    expect(biomarker.causalExplanationClaimed).toBe(false);
    expect(biomarker.associationKind).toBe("association_only");

    expect(() =>
      draftLongitudinalOutcomePrediction({
        id: "hsi-pcdm-pred-bad-language",
        modellingSpec: spec,
        methodology,
        predictionSummary:
          "This prediction provides a causal explanation for disease progression.",
        limitations: ["Must refuse causal explanation language."],
        authoredByPrincipalId: "agent-hsi-pcdm-1",
        createdAt: asOf,
      }),
    ).toThrow(/must not diagnose\/prescribe|causal explanation/);
  });

  test("unsupervised clusters are exploratory unless validated subtypes declared", () => {
    const spec = seedFixtureSpec();
    const methodology = seedMethodology(spec);

    expect(isExploratoryClusterStatus("exploratory_unsupervised")).toBe(true);
    expect(isExploratoryClusterStatus("validated_subtype_declared")).toBe(
      false,
    );

    const exploratory = draftDiseaseTrajectoryClustering({
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
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    expect(exploratory.validatedSubtypeClaimed).toBe(false);
    expect(exploratory.clusterValidationStatus).toBe(
      "exploratory_unsupervised",
    );

    const exploratoryMeth = seedMethodology(spec, {
      id: "hsi-pcdm-meth-exploratory-val",
      trainValidationSeparation: "not_applicable_exploratory",
      externalValidationStatus: "not_applicable_exploratory",
      calibrationStatus: "not_applicable",
      discriminationStatus: "not_applicable",
      confounderAssessment: "not_assessed",
    });
    expect(() =>
      draftDiseaseTrajectoryClustering({
        id: "hsi-pcdm-clu-bad-validated",
        modellingSpec: spec,
        methodology: exploratoryMeth,
        clusterValidationStatus: "validated_subtype_declared",
        clusteringSummary:
          "Must refuse subtype-validation claim under exploratory methodology.",
        limitations: ["Subtype-validation claim refused under exploratory methodology."],
        authoredByPrincipalId: "agent-hsi-pcdm-1",
        createdAt: asOf,
      }),
    ).toThrow(/Validated subtype claim refused/);

    const validatedMeth = seedMethodology(spec, {
      id: "hsi-pcdm-meth-validated-clu",
      externalValidationStatus: "performed_declared",
      trainValidationSeparation: "external_holdout_declared",
    });
    const validated = draftDiseaseTrajectoryClustering({
      id: "hsi-pcdm-clu-ssc-validated",
      modellingSpec: spec,
      methodology: validatedMeth,
      clusterValidationStatus: "validated_subtype_declared",
      clusterCountDeclared: 2,
      clusteringSummary:
        "Fixture clustering with research-declared subtype validation under limitations — still not clinical care.",
      limitations: [
        "Subtype validation declared under research limitations only.",
        "Still research-only framing; predictive accuracy alone is not clinical usefulness.",
      ],
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    expect(validated.validatedSubtypeClaimed).toBe(true);
  });

  test("phenotype, organ-specific, and biomarker envelopes stay aggregate-honest", () => {
    const spec = seedFixtureSpec();
    const methodology = seedMethodology(spec);

    const phenotype = draftPhenotypeStratification({
      id: "hsi-pcdm-pheno-ssc-strata",
      modellingSpec: spec,
      methodology,
      stratificationSummary:
        "Fixture phenotype stratification into aggregate research strata.",
      stratumCountDeclared: 4,
      disclosureStatus: "released_aggregate",
      limitations: [
        "Phenotype strata are not validated disease subtypes by default.",
        "Aggregate honesty; small-cell disclosure applies.",
      ],
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    expect(phenotype.validatedSubtypeClaimed).toBe(false);
    expect(phenotype.disclosureStatus).toBe("released_aggregate");

    const organ = draftOrganSpecificOutcomeModelling({
      id: "hsi-pcdm-organ-ssc-lung",
      modellingSpec: spec,
      methodology,
      organOrSystemLabel: "lung",
      outcomeSummary:
        "Fixture organ-specific outcome modelling for lung research endpoints.",
      disclosureStatus: "suppressed_small_cell",
      limitations: [
        "Organ-specific modelling is not causal organ explanation.",
        "Small-cell disclosure suppressed for fixture research.",
      ],
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    expect(organ.causalExplanationClaimed).toBe(false);
    expect(organ.disclosureStatus).toBe("suppressed_small_cell");

    const biomarker = draftBiomarkerAssociationAnalysis({
      id: "hsi-pcdm-bio-ssc-kl6",
      modellingSpec: spec,
      methodology,
      biomarkerLabel: "Fixture KL-6 association marker",
      associationKind: "exploratory_correlation",
      associationSummary:
        "Fixture biomarker association — exploratory correlation only.",
      limitations: [
        "Exploratory correlation is not causation.",
        "No individual collapse from population association.",
      ],
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    expect(biomarker.associationKind).toBe("exploratory_correlation");
  });

  test("lifecycle transitions and blocked dataset stay fail-closed", () => {
    const blocked = seedFixtureSpec({
      id: "hsi-pcdm-spec-blocked-demo",
      displayName: "Blocked population cohort models until authorised dataset",
      scientificQuestion:
        "Blocked scientific path for population and cohort disease models until an authorised clinical dataset is supplied.",
      diseaseContextId: "hsi-hdi-ctx-blocked-demo",
      integratedDiseaseContextId: null,
      longitudinalModellingSpecId: null,
      crossScaleOntologySpecId: null,
      cohortDefinitionId: "hsi-rcb-coh-blocked-demo",
      rweStudyId: null,
      datasetAvailability: "blocked_no_authorised_clinical_dataset",
    });
    expect(blocked.lifecycle).toBe("blocked_awaiting_authorised_dataset");

    expect(() =>
      transitionPopulationCohortModellingSpec({
        spec: blocked,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "researcher-1", actorKind: "human"},
      }),
    ).toThrow(/Illegal lifecycle transition|Cannot accept/);

    const fixture = seedFixtureSpec();
    const underReview = transitionPopulationCohortModellingSpec({
      spec: fixture,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-pcdm-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionPopulationCohortModellingSpec({
        spec: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-pcdm-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Human review required/);

    const accepted = transitionPopulationCohortModellingSpec({
      spec: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_limitations");
    expect(accepted.reviewedBy?.actorKind).toBe("human");

    expect(() =>
      seedFixtureSpec({
        scientificQuestion:
          "This claims clinical usefulness from predictive accuracy alone for care decisions.",
      }),
    ).toThrow(/must not diagnose\/prescribe|clinical usefulness/);
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const spec = seedFixtureSpec();
    const methodology = seedMethodology(spec);
    const prediction = draftLongitudinalOutcomePrediction({
      id: "hsi-pcdm-pred-store-1",
      modellingSpec: spec,
      methodology,
      predictionSummary: "Store fixture longitudinal outcome prediction.",
      limitations: [
        "Prediction is not causation.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    const clustering = draftDiseaseTrajectoryClustering({
      id: "hsi-pcdm-clu-store-1",
      modellingSpec: spec,
      methodology,
      clusterValidationStatus: "exploratory_unsupervised",
      clusterCountDeclared: 3,
      clusteringSummary: "Store fixture exploratory trajectory clustering.",
      limitations: [
        "Unsupervised clusters are not validated subtypes.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    const risk = draftDiseaseProgressionRisk({
      id: "hsi-pcdm-risk-store-1",
      modellingSpec: spec,
      methodology,
      riskSummary: "Store fixture progression risk research.",
      limitations: [
        "Progression risk is not causal explanation.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    const phenotype = draftPhenotypeStratification({
      id: "hsi-pcdm-pheno-store-1",
      modellingSpec: spec,
      methodology,
      stratificationSummary: "Store fixture phenotype stratification.",
      stratumCountDeclared: 3,
      limitations: [
        "Phenotype strata are not validated subtypes by default.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    const organ = draftOrganSpecificOutcomeModelling({
      id: "hsi-pcdm-organ-store-1",
      modellingSpec: spec,
      methodology,
      organOrSystemLabel: "skin",
      outcomeSummary: "Store fixture organ-specific outcome modelling.",
      limitations: [
        "Organ modelling is not causal explanation.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    const biomarker = draftBiomarkerAssociationAnalysis({
      id: "hsi-pcdm-bio-store-1",
      modellingSpec: spec,
      methodology,
      biomarkerLabel: "Fixture store biomarker",
      associationKind: "prediction_association",
      associationSummary: "Store fixture biomarker association analysis.",
      limitations: [
        "Association is not causation.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });

    const draftBundle = draftPopulationCohortModellingBundle({
      id: "hsi-pcdm-bnd-store-1",
      displayName: "Fixture store population cohort modelling bundle",
      modellingSpec: spec,
      bundleVersion: "0.1.0",
      limitations: [
        "Fixture store bundle — research decision support only.",
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
      authoredByPrincipalId: "agent-hsi-pcdm-1",
      createdAt: asOf,
    });
    expect(draftBundle.exploratoryClusterIds).toContain(clustering.id);
    expect(draftBundle.predictionIsNotCausation).toBe(true);

    const underReview = transitionPopulationCohortModellingBundle({
      bundle: draftBundle,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-pcdm-1", actorKind: "ai_agent"},
    });
    const bundle = transitionPopulationCohortModellingBundle({
      bundle: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(bundle.lifecycle).toBe("accepted_with_limitations");
    expect(fingerprintPopulationCohortModellingBundle(bundle)).toMatch(
      /^[a-f0-9]{64}$/,
    );

    const store = createMemoryPopulationCohortDiseaseModelsStore();
    store.upsertSpec(spec);
    store.upsertMethodology(methodology);
    store.upsertLongitudinalOutcomePrediction(prediction);
    store.upsertDiseaseTrajectoryClustering(clustering);
    store.upsertDiseaseProgressionRisk(risk);
    store.upsertPhenotypeStratification(phenotype);
    store.upsertOrganSpecificOutcomeModelling(organ);
    store.upsertBiomarkerAssociationAnalysis(biomarker);
    store.upsertBundle(bundle);

    expect(store.listSpecs(spec.diseaseContextId)).toHaveLength(1);
    expect(store.listMethodologies(spec.diseaseContextId)).toHaveLength(1);
    expect(
      store.listLongitudinalOutcomePredictions(spec.diseaseContextId),
    ).toHaveLength(1);
    expect(
      store.listDiseaseTrajectoryClusterings(spec.diseaseContextId),
    ).toHaveLength(1);
    expect(store.listBundles(spec.diseaseContextId)).toHaveLength(1);

    const lines = projectPopulationCohortDiseaseModelsPersistenceLines({
      specs: [spec],
      methodologies: [methodology],
      longitudinalOutcomePredictions: [prediction],
      diseaseTrajectoryClusterings: [clustering],
      diseaseProgressionRisks: [risk],
      phenotypeStratifications: [phenotype],
      organSpecificOutcomeModellings: [organ],
      biomarkerAssociationAnalyses: [biomarker],
      bundles: [bundle],
    });
    expect(lines).toContain("predictionIsNotCausation=true");
    expect(lines).toContain(
      "unsupervisedClustersAreNotValidatedSubtypes=true",
    );
    expect(lines).toContain(
      "predictiveAccuracyIsNotClinicalUsefulness=true",
    );
    expect(lines).toContain("aggregateHonestyRequired=true");
    expect(lines).toContain("noIndividualCollapse=true");
    expect(lines).toContain("neon=red-wave-only");
    expect(lines).toContain("exploratoryClustersRecorded=1");

    const pack = buildPopulationCohortDiseaseModelsPack({
      specs: [spec],
      methodologies: [methodology],
      longitudinalOutcomePredictions: [prediction],
      diseaseTrajectoryClusterings: [clustering],
      diseaseProgressionRisks: [risk],
      phenotypeStratifications: [phenotype],
      organSpecificOutcomeModellings: [organ],
      biomarkerAssociationAnalyses: [biomarker],
      bundles: [bundle],
      asOf,
    });
    expect(pack.modellingKindCount).toBe(6);
    expect(pack.exploratoryClusterCount).toBe(1);
    expect(pack.honesty.notDigitalTwinProduct).toBe(true);
  });
});
