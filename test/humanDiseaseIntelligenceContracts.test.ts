/**
 * Milestone 15 PR1 — human disease intelligence contract honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  PERMITTED_RESEARCH_USES,
  buildHumanDiseaseIntelligencePack,
  createMemoryHumanDiseaseIntelligenceStore,
  draftDigitalPatientResearchModel,
  draftDiseaseResearchContext,
  draftDiseaseStateEstimate,
  draftDiseaseStateObservation,
  draftSimulationScenario,
  fingerprintDiseaseResearchContext,
  projectHumanDiseaseIntelligencePersistenceLines,
  transitionDigitalPatientResearchModel,
  transitionDiseaseResearchContext,
  transitionSimulationScenario,
  type DiseaseResearchContext,
} from "../src/humanDiseaseIntelligenceContracts";

const asOf = "2026-11-09T22:00:00.000Z";

function seedFixtureContext(
  overrides?: Partial<Parameters<typeof draftDiseaseResearchContext>[0]>,
): DiseaseResearchContext {
  return draftDiseaseResearchContext({
    id: "hsi-hdi-ctx-ssc-fixture",
    displayName: "Fixture SSc disease research context",
    diseaseFocus: "Systemic sclerosis research framing",
    scientificQuestion:
      "How can fixture disease-state observations and inferred estimates be governed without claiming individual clinical truth?",
    populationFraming:
      "Fixture engineering cohort framing — not an authorised clinical population",
    permittedResearchUses: [
      "disease_mechanism_research",
      "observational_association_research",
      "methods_engineering_fixture",
    ],
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "agent-hsi-hdi-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    rweStudyId: "hsi-rwe-study-fixture-demo",
    longitudinalAnalysisSpecId: "hsi-lce-spec-lab-trend-fixture",
    cohortDefinitionId: "hsi-rcb-coh-fixture-reserved",
    therapeuticProgrammeId: "hsi-tx-prog-fixture-demo",
    translationalProgrammeId: "hsi-td-prog-fixture-demo",
    ...overrides,
  });
}

function seedBlockedContext(): DiseaseResearchContext {
  return draftDiseaseResearchContext({
    id: "hsi-hdi-ctx-blocked-demo",
    displayName: "Blocked disease context until authorised dataset",
    diseaseFocus: "Blocked disease framing",
    scientificQuestion:
      "Blocked scientific path until an authorised research dataset is supplied.",
    populationFraming: "Authorised population not supplied",
    permittedResearchUses: ["methods_engineering_fixture"],
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "agent-hsi-hdi-1",
    createdAt: asOf,
  });
}

describe("human disease intelligence contracts (M15 PR1)", () => {
  test("disease context composes M14 RWE/LCE/reserved cohort ids with honesty gates", () => {
    expect(PERMITTED_RESEARCH_USES).toContain("population_simulation_research");
    const context = seedFixtureContext();
    expect(context.separateDigitalTwinProduct).toBe(false);
    expect(context.containsIdentifiablePhi).toBe(false);
    expect(context.honesty.observedIsNotInferred).toBe(true);
    expect(context.honesty.notSeparateDigitalTwinProduct).toBe(true);
    expect(context.honesty.noLiveMultiscaleEngineClaim).toBe(true);
    expect(context.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(context.rweStudyId).toBe("hsi-rwe-study-fixture-demo");
    expect(context.longitudinalAnalysisSpecId).toBe(
      "hsi-lce-spec-lab-trend-fixture",
    );
    expect(context.cohortDefinitionId).toBe("hsi-rcb-coh-fixture-reserved");
    expect(fingerprintDiseaseResearchContext(context)).toMatch(/^[a-f0-9]{64}$/);
  });

  test("observations stay observed; estimates stay inferred; collapse refused", () => {
    const context = seedFixtureContext();
    const observation = draftDiseaseStateObservation({
      id: "hsi-hdi-obs-crp-fixture",
      diseaseContext: context,
      clinicalConcept: "Fixture CRP laboratory concept",
      subjectRefKind: "pseudonymous_subject",
      subjectOrCohortRef: "pseudo-subj-hdi-001",
      missingness: "observed",
      missingnessNote: "Value present in fixture observation",
      observedValueDeclared: "declared-fixture-crp",
      unit: "mg/L",
      observedAt: "2024-03-10T12:00:00.000Z",
      rweObservationId: "hsi-rwe-obs-fixture-demo",
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });
    expect(observation.epistemicStatus).toBe("observed");
    expect(observation.isDiagnosisDirective).toBe(false);

    const estimate = draftDiseaseStateEstimate({
      id: "hsi-hdi-est-activity-fixture",
      diseaseContext: context,
      estimateMethod: "cohort_association_declared",
      confidenceOrdinal: "low",
      estimateSummary:
        "Fixture inferred disease-activity estimate from declared cohort association — not individual truth",
      limitations: [
        "Inferred estimate only — population association is not individual truth.",
        "Confounding unresolved; not a diagnosis or treatment directive.",
      ],
      subjectRefKind: "cohort_aggregate",
      subjectOrCohortRef: "cohort-hdi-fixture-001",
      supportingObservationIds: [observation.id],
      rweAnalysisId: "hsi-rwe-anl-fixture-demo",
      longitudinalResultId: "hsi-lce-res-lab-fixture",
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });
    expect(estimate.epistemicStatus).toBe("inferred");
    expect(estimate.populationAssociationIsNotIndividualTruth).toBe(true);
    expect(estimate.inventedIndividualTruth).toBeNull();
    expect(estimate.causalIdentificationClaimed).toBe(false);

    expect(() =>
      draftDiseaseStateObservation({
        id: "hsi-hdi-obs-diagnose",
        diseaseContext: context,
        clinicalConcept: "Diagnose the patient with active disease",
        subjectRefKind: "pseudonymous_subject",
        subjectOrCohortRef: "pseudo-subj-hdi-002",
        missingness: "observed",
        missingnessNote: "bad",
        observedValueDeclared: "x",
        authoredByPrincipalId: "agent-hsi-hdi-1",
        createdAt: asOf,
      }),
    ).toThrow(/must not diagnose/);

    expect(() =>
      draftDiseaseStateObservation({
        id: "hsi-hdi-obs-phi-ref",
        diseaseContext: context,
        clinicalConcept: "Fixture concept",
        subjectRefKind: "pseudonymous_subject",
        subjectOrCohortRef: "nhs-1234567890",
        missingness: "missing",
        missingnessNote: "Missing declared",
        authoredByPrincipalId: "agent-hsi-hdi-1",
        createdAt: asOf,
      }),
    ).toThrow(/Direct personal identifier/);
  });

  test("digital patient research model is access-scoped and not a twin product", () => {
    const context = seedFixtureContext();
    const observation = draftDiseaseStateObservation({
      id: "hsi-hdi-obs-model-link",
      diseaseContext: context,
      clinicalConcept: "Fixture linked observation",
      subjectRefKind: "pseudonymous_subject",
      subjectOrCohortRef: "pseudo-subj-hdi-model",
      missingness: "observed",
      missingnessNote: "Present",
      observedValueDeclared: "fixture-v0",
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });
    const estimate = draftDiseaseStateEstimate({
      id: "hsi-hdi-est-model-link",
      diseaseContext: context,
      estimateMethod: "literature_prior_declared",
      confidenceOrdinal: "not_assessed",
      estimateSummary: "Fixture linked estimate — inferred only",
      limitations: [
        "Inferred research estimate; not individual clinical truth.",
      ],
      subjectRefKind: "pseudonymous_subject",
      subjectOrCohortRef: "pseudo-subj-hdi-model",
      supportingObservationIds: [observation.id],
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });

    const model = draftDigitalPatientResearchModel({
      id: "hsi-hdi-dpm-fixture-001",
      diseaseContext: context,
      displayName: "Fixture digital patient research model",
      pseudonymousSubjectRef: "pseudo-subj-hdi-model",
      permittedResearchUses: [
        "observational_association_research",
        "methods_engineering_fixture",
      ],
      linkedObservationIds: [observation.id],
      linkedEstimateIds: [estimate.id],
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });
    expect(model.separateDigitalTwinProduct).toBe(false);
    expect(model.identifiableOutsideScientificKg).toBe(true);
    expect(model.syntheticPatientUsedAsScientificValidation).toBe(false);
    expect(model.fabricatedTimeline).toBeNull();
    expect(model.rweStudyId).toBe("hsi-rwe-study-fixture-demo");
    expect(model.longitudinalAnalysisSpecId).toBe(
      "hsi-lce-spec-lab-trend-fixture",
    );

    const blocked = seedBlockedContext();
    expect(() =>
      draftDigitalPatientResearchModel({
        id: "hsi-hdi-dpm-blocked-bad",
        diseaseContext: blocked,
        displayName: "Blocked model misuse",
        pseudonymousSubjectRef: "pseudo-subj-blocked",
        permittedResearchUses: ["methods_engineering_fixture"],
        authoredByPrincipalId: "agent-hsi-hdi-1",
        createdAt: asOf,
        note: "Scientifically validated synthetic twin",
      }),
    ).toThrow(/must not be presented as scientific validation/);
  });

  test("simulation scenarios are research-only and refuse live multiscale / Tx effects", () => {
    const context = seedFixtureContext();
    const model = draftDigitalPatientResearchModel({
      id: "hsi-hdi-dpm-sim-link",
      diseaseContext: context,
      displayName: "Fixture model for simulation link",
      pseudonymousSubjectRef: "pseudo-subj-sim",
      permittedResearchUses: ["population_simulation_research"],
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });
    const scenario = draftSimulationScenario({
      id: "hsi-hdi-sim-fixture-001",
      diseaseContext: context,
      displayName: "Fixture research simulation scenario",
      researchQuestion:
        "What population-level research associations can a fixture scenario explore without personalised treatment effects?",
      subjectRefKind: "cohort_aggregate",
      subjectOrCohortRef: "cohort-hdi-sim-fixture",
      digitalPatientModelId: model.id,
      limitations: [
        "Research-only simulation envelope — not a personalised treatment effect.",
        "M11 multiscale engine is skipped/missing; live engine not operational.",
        "Population association is not individual truth.",
      ],
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });
    expect(scenario.researchOnly).toBe(true);
    expect(scenario.notPersonalisedTreatmentEffect).toBe(true);
    expect(scenario.liveMultiscaleEngineOperational).toBe(false);
    expect(scenario.m11SimulationClaimed).toBe(false);
    expect(scenario.fabricatedTimeline).toBeNull();
    expect(scenario.inventedTreatmentEffect).toBeNull();

    expect(() =>
      draftSimulationScenario({
        id: "hsi-hdi-sim-bad-tx",
        diseaseContext: context,
        displayName: "Bad personalised treatment effect claim",
        researchQuestion:
          "Estimate the personalised treatment effect for this subject",
        subjectRefKind: "pseudonymous_subject",
        subjectOrCohortRef: "pseudo-subj-bad",
        limitations: ["x"],
        authoredByPrincipalId: "agent-hsi-hdi-1",
        createdAt: asOf,
      }),
    ).toThrow(/must not diagnose\/prescribe|personalised treatment/);
  });

  test("blocked dataset paths cannot be accepted; human review required", () => {
    const blocked = seedBlockedContext();
    expect(blocked.lifecycle).toBe("blocked_awaiting_authorised_dataset");
    expect(() =>
      transitionDiseaseResearchContext({
        context: blocked,
        to: "accepted_for_further_research",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher", actorKind: "human"},
      }),
    ).toThrow(/Illegal context transition/);

    const fixture = seedFixtureContext();
    const underReview = transitionDiseaseResearchContext({
      context: fixture,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-hdi-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionDiseaseResearchContext({
        context: underReview,
        to: "accepted_for_further_research",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-hdi-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);
    const accepted = transitionDiseaseResearchContext({
      context: underReview,
      to: "accepted_for_further_research",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_for_further_research");

    const blockedModel = draftDigitalPatientResearchModel({
      id: "hsi-hdi-dpm-blocked-demo",
      diseaseContext: blocked,
      displayName: "Blocked digital patient model",
      pseudonymousSubjectRef: "pseudo-subj-blocked-demo",
      permittedResearchUses: ["methods_engineering_fixture"],
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });
    expect(blockedModel.lifecycle).toBe("blocked_awaiting_authorised_dataset");
    expect(() =>
      transitionDigitalPatientResearchModel({
        model: blockedModel,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher", actorKind: "human"},
      }),
    ).toThrow(/Illegal model transition/);

    const blockedScenario = draftSimulationScenario({
      id: "hsi-hdi-sim-blocked-demo",
      diseaseContext: blocked,
      displayName: "Blocked simulation scenario",
      researchQuestion: "Blocked until authorised dataset supplied",
      subjectRefKind: "cohort_aggregate",
      subjectOrCohortRef: "cohort-blocked",
      limitations: [
        "Scientifically blocked — synthetic results are not validation.",
      ],
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });
    expect(blockedScenario.lifecycle).toBe(
      "blocked_awaiting_authorised_dataset",
    );
    expect(() =>
      transitionSimulationScenario({
        scenario: blockedScenario,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher", actorKind: "human"},
      }),
    ).toThrow(/Illegal scenario transition/);
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const context = seedFixtureContext();
    const observation = draftDiseaseStateObservation({
      id: "hsi-hdi-obs-store",
      diseaseContext: context,
      clinicalConcept: "Fixture store observation",
      subjectRefKind: "pseudonymous_subject",
      subjectOrCohortRef: "pseudo-subj-store",
      missingness: "observed",
      missingnessNote: "Present",
      observedValueDeclared: "fixture-store-v0",
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });
    const estimate = draftDiseaseStateEstimate({
      id: "hsi-hdi-est-store",
      diseaseContext: context,
      estimateMethod: "model_based_declared",
      confidenceOrdinal: "moderate",
      estimateSummary: "Fixture store estimate — inferred",
      limitations: [
        "Inferred only; population association is not individual truth.",
      ],
      subjectRefKind: "pseudonymous_subject",
      subjectOrCohortRef: "pseudo-subj-store",
      supportingObservationIds: [observation.id],
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });
    const model = draftDigitalPatientResearchModel({
      id: "hsi-hdi-dpm-store",
      diseaseContext: context,
      displayName: "Fixture store digital patient model",
      pseudonymousSubjectRef: "pseudo-subj-store",
      permittedResearchUses: ["methods_engineering_fixture"],
      linkedObservationIds: [observation.id],
      linkedEstimateIds: [estimate.id],
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });
    const scenario = draftSimulationScenario({
      id: "hsi-hdi-sim-store",
      diseaseContext: context,
      displayName: "Fixture store simulation scenario",
      researchQuestion: "Fixture research-only simulation envelope",
      subjectRefKind: "pseudonymous_subject",
      subjectOrCohortRef: "pseudo-subj-store",
      digitalPatientModelId: model.id,
      limitations: [
        "Research-only; not personalised treatment effect; M11 engine absent.",
      ],
      authoredByPrincipalId: "agent-hsi-hdi-1",
      createdAt: asOf,
    });

    const store = createMemoryHumanDiseaseIntelligenceStore();
    store.upsertContext(context);
    store.upsertObservation(observation);
    store.upsertEstimate(estimate);
    store.upsertDigitalPatientModel(model);
    store.upsertSimulationScenario(scenario);
    expect(store.listContexts()).toHaveLength(1);
    expect(store.listObservations(context.id)).toHaveLength(1);
    expect(store.listEstimates(context.id)).toHaveLength(1);
    expect(store.listDigitalPatientModels(context.id)).toHaveLength(1);
    expect(store.listSimulationScenarios(context.id)).toHaveLength(1);

    const lines = projectHumanDiseaseIntelligencePersistenceLines({
      contexts: [context],
      observations: [observation],
      estimates: [estimate],
      digitalPatientModels: [model],
      simulationScenarios: [scenario],
    });
    expect(lines).toContain("notSeparateDigitalTwinProduct=true");
    expect(lines).toContain("observedIsNotInferred=true");
    expect(lines).toContain("populationAssociationIsNotIndividualTruth=true");
    expect(lines).toContain("liveMultiscaleEngine=false");
    expect(lines).toContain("syntheticPatientsNotValidationWhenBlocked=true");

    const pack = buildHumanDiseaseIntelligencePack({
      contexts: [context],
      observations: [observation],
      estimates: [estimate],
      digitalPatientModels: [model],
      simulationScenarios: [scenario],
      asOf,
    });
    expect(pack.contextCount).toBe(1);
    expect(pack.honesty.noAutonomousDiagnosisOrPrescribing).toBe(true);
    expect(pack.honesty.noLiveMultiscaleEngineClaim).toBe(true);

    const modelReview = transitionDigitalPatientResearchModel({
      model,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-hdi-1", actorKind: "ai_agent"},
    });
    const modelAccepted = transitionDigitalPatientResearchModel({
      model: modelReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher", actorKind: "human"},
    });
    expect(modelAccepted.lifecycle).toBe("accepted_with_limitations");

    const scenarioReview = transitionSimulationScenario({
      scenario,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-hdi-1", actorKind: "ai_agent"},
    });
    const scenarioAccepted = transitionSimulationScenario({
      scenario: scenarioReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher", actorKind: "human"},
    });
    expect(scenarioAccepted.lifecycle).toBe("accepted_with_limitations");
  });

  test("refuses missing observation values and invented estimate language", () => {
    const context = seedFixtureContext();
    expect(() =>
      draftDiseaseStateObservation({
        id: "hsi-hdi-obs-no-value",
        diseaseContext: context,
        clinicalConcept: "Fixture concept",
        subjectRefKind: "cohort_aggregate",
        subjectOrCohortRef: "cohort-no-value",
        missingness: "observed",
        missingnessNote: "claimed observed",
        authoredByPrincipalId: "agent-hsi-hdi-1",
        createdAt: asOf,
      }),
    ).toThrow(/requires observedValueDeclared/);

    expect(() =>
      draftDiseaseStateEstimate({
        id: "hsi-hdi-est-bad-claims",
        diseaseContext: context,
        estimateMethod: "other_declared",
        confidenceOrdinal: "high_declared_with_limitations",
        estimateSummary:
          "Proven treatment effect with n = 240 for this digital twin product",
        limitations: ["Vague"],
        subjectRefKind: "cohort_aggregate",
        subjectOrCohortRef: "cohort-bad",
        authoredByPrincipalId: "agent-hsi-hdi-1",
        createdAt: asOf,
      }),
    ).toThrow(/must not diagnose\/prescribe|personalised|digital twin|invent/);
  });
});
