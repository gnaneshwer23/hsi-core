/**
 * Milestone 15 PR8 — precision scenario and missing-information honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  PSMI_CAPABILITY_KINDS,
  PSMI_SCENARIO_KINDS,
  buildPrecisionScenarioMissingInformationPack,
  createMemoryPrecisionScenarioMissingInformationStore,
  draftFollowUpAndExperimentalValidation,
  draftMissingInformationAssessmentEnvelope,
  draftMissingVariableResearchValue,
  draftPrecisionResearchScenario,
  draftPrecisionScenarioMissingInformationBundle,
  draftPrecisionScenarioMissingInformationSpec,
  draftScenarioModelAndContext,
  draftScenarioPredictedOutputs,
  draftScenarioUncertaintySensitivity,
  draftScenarioValidationRecommendation,
  fingerprintPrecisionScenarioMissingInformationBundle,
  isBlockedInfoValue,
  isQuantifiableInfoValue,
  projectPrecisionScenarioMissingInformationPersistenceLines,
  requiresInvasiveGovernance,
  transitionPrecisionScenarioMissingInformationBundle,
  transitionPrecisionScenarioMissingInformationSpec,
  type PrecisionScenarioMissingInformationSpec,
} from "../src/precisionScenarioMissingInformationContracts";

const asOf = "2026-11-09T17:00:00.000Z";

function seedFixtureSpec(
  overrides?: Partial<
    Parameters<typeof draftPrecisionScenarioMissingInformationSpec>[0]
  >,
): PrecisionScenarioMissingInformationSpec {
  return draftPrecisionScenarioMissingInformationSpec({
    id: "hsi-psmi-spec-ssc-fixture",
    displayName: "Fixture SSc precision scenario missing-information spec",
    scientificQuestion:
      "How can bounded research scenarios declare alternative mechanisms, trajectory comparisons, biomarker measurement, parameter sensitivity, subgroup comparisons, pathway perturbations, and monitoring schedules while missing-information intelligence stays research-priority framed?",
    diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
    simulationScenarioId: "hsi-hdi-sim-ssc-fixture",
    digitalPatientModelId: "hsi-hdi-dpm-ssc-fixture",
    patientContextualisedResearchSpecId: "hsi-pcrm-spec-ssc-fixture",
    pcrmMissingInformationAssessmentId: "hsi-pcrm-mia-ssc-fixture",
    multiscaleSimulationIntegrationSpecId: "hsi-msi-spec-ssc-fixture",
    populationModellingSpecId: "hsi-pcdm-spec-ssc-fixture",
    integratedDiseaseContextId: "hsi-cbc-idc-ssc-fixture",
    longitudinalModellingSpecId: "hsi-ldsm-spec-ssc-fixture",
    cohortDefinitionId: "hsi-rcb-coh-ssc-fixture",
    rweStudyId: "hsi-rwe-study-ssc-fixture",
    longitudinalClinicalEvidenceSpecId: "hsi-lce-spec-ssc-fixture",
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "agent-hsi-psmi-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    ...overrides,
  });
}

describe("precision scenario missing-information contracts (M15 PR8)", () => {
  test("covers scenario kinds, capabilities, and HDI/PCRM/MSI links", () => {
    expect(PSMI_SCENARIO_KINDS).toHaveLength(7);
    expect(PSMI_CAPABILITY_KINDS).toHaveLength(8);
    expect(PSMI_SCENARIO_KINDS).toContain("alternative_biological_mechanism_assumptions");
    expect(PSMI_SCENARIO_KINDS).toContain("alternative_monitoring_schedules");
    expect(PSMI_CAPABILITY_KINDS).toContain("precision_research_scenario");
    expect(PSMI_CAPABILITY_KINDS).toContain("follow_up_and_experimental_validation");

    const spec = seedFixtureSpec();
    expect(spec.honesty.notPersonalisedTreatmentEffect).toBe(true);
    expect(spec.honesty.noClinicalDosing).toBe(true);
    expect(spec.honesty.notSpecificPatientPredictionUnlessValidated).toBe(true);
    expect(spec.honesty.researchMeasurementPrioritiesNotClinicalOrders).toBe(true);
    expect(spec.honesty.noInvasiveTestingWithoutGovernance).toBe(true);
    expect(spec.honesty.noInventedInfoGainProbabilities).toBe(true);
    expect(spec.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(spec.multiscaleSimulationIntegrationSpecId).toBe("hsi-msi-spec-ssc-fixture");
    expect(spec.patientContextualisedResearchSpecId).toBe("hsi-pcrm-spec-ssc-fixture");
    expect(spec.inventedInfoGainProbability).toBeNull();
    expect(spec.capabilityKinds).toHaveLength(8);
  });

  test("drafts all seven scenario kinds without treatment or dosing claims", () => {
    const spec = seedFixtureSpec();
    for (const [index, kind] of PSMI_SCENARIO_KINDS.entries()) {
      const scenario = draftPrecisionResearchScenario({
        id: `hsi-psmi-scn-ssc-${index + 1}`,
        intelligenceSpec: spec,
        scenarioKind: kind,
        scenarioDefinition: `Fixture ${kind} research scenario definition.`,
        keyAssumptions: [
          "Fixture research assumption declared.",
          "Not a personalised treatment effect framing.",
        ],
        limitations: [
          "Research scenario only.",
          "Not clinical dosing.",
          "Specific-patient prediction not authorised unless separately validated.",
        ],
        authoredByPrincipalId: "agent-hsi-psmi-1",
        createdAt: asOf,
      });
      expect(scenario.scenarioKind).toBe(kind);
      expect(scenario.noClinicalDosing).toBe(true);
      expect(scenario.notPersonalisedTreatmentEffect).toBe(true);
    }

    expect(() =>
      draftPrecisionResearchScenario({
        id: "hsi-psmi-scn-bad-language",
        intelligenceSpec: spec,
        scenarioKind: "model_parameter_sensitivity",
        scenarioDefinition: "This claims a personalised treatment effect for care.",
        keyAssumptions: ["Bad assumption."],
        limitations: ["Must refuse personalised treatment effect language."],
        authoredByPrincipalId: "agent-hsi-psmi-1",
        createdAt: asOf,
      }),
    ).toThrow(/personalised treatment effect/);
  });

  test("scenario outputs declare model version, context, uncertainty, and validation", () => {
    const spec = seedFixtureSpec();
    const scenario = draftPrecisionResearchScenario({
      id: "hsi-psmi-scn-ssc-outputs",
      intelligenceSpec: spec,
      scenarioKind: "biomarker_measurement_scenarios",
      scenarioDefinition: "Fixture biomarker measurement research scenario.",
      keyAssumptions: ["Sparse biomarker sampling assumption."],
      limitations: ["Research-only.", "Not clinical dosing."],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    const context = draftScenarioModelAndContext({
      id: "hsi-psmi-ctx-ssc-outputs",
      intelligenceSpec: spec,
      precisionResearchScenario: scenario,
      modelVersion: "fixture-model-v0.1.0",
      supportedBiologicalContext: "Fixture inflammatory pathway research context.",
      contextSummary: "Supported biological context for fixture scenario.",
      limitations: ["Context is research framing only.", "Fixture only."],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    expect(context.modelVersion).toBe("fixture-model-v0.1.0");

    const outputs = draftScenarioPredictedOutputs({
      id: "hsi-psmi-out-ssc-outputs",
      intelligenceSpec: spec,
      precisionResearchScenario: scenario,
      predictedOutputs: [
        "Relative biomarker trajectory band under research assumptions.",
        "Comparative sensitivity ranking across sampling schedules.",
      ],
      outputsSummary: "Fixture predicted research outputs — not specific-patient prediction.",
      limitations: [
        "Predicted outputs are research envelopes only.",
        "Specific-patient prediction not authorised.",
      ],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    expect(outputs.validatedForSpecificPatientPurpose).toBe(false);

    expect(() =>
      draftScenarioPredictedOutputs({
        id: "hsi-psmi-out-bad",
        intelligenceSpec: spec,
        precisionResearchScenario: scenario,
        predictedOutputs: ["Bad output with specific patient prediction claim."],
        outputsSummary: "This is a specific patient prediction for care.",
        limitations: ["Must refuse."],
        authoredByPrincipalId: "agent-hsi-psmi-1",
        createdAt: asOf,
      }),
    ).toThrow(/specific-patient prediction|specific patient prediction/i);

    const uncertainty = draftScenarioUncertaintySensitivity({
      id: "hsi-psmi-unc-ssc-outputs",
      intelligenceSpec: spec,
      precisionResearchScenario: scenario,
      uncertaintyOrdinal: "high_declared",
      sensitivityOrdinal: "moderate_declared",
      uncertaintySummary: "Fixture high uncertainty from sparse sampling.",
      sensitivitySummary: "Moderate sensitivity to sampling interval assumption.",
      sourcesOfUncertainty: ["sparse sampling", "fixture model version"],
      sensitivityDrivers: ["sampling interval", "assay noise band"],
      limitations: ["Uncertainty is research framing only.", "Fixture only."],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    expect(uncertainty.uncertaintyOrdinal).toBe("high_declared");

    const validation = draftScenarioValidationRecommendation({
      id: "hsi-psmi-val-ssc-outputs",
      intelligenceSpec: spec,
      precisionResearchScenario: scenario,
      recommendedValidationSteps: [
        "Compare fixture outputs against authorised research cohort when available.",
      ],
      scenarioLimitations: ["Fixture scenario is not scientific validation."],
      validationSummary: "Recommended research validation steps — not a clinical order.",
      limitations: ["Research-only validation recommendations.", "Not a clinical order."],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    expect(validation.notClinicalOrder).toBe(true);
  });

  test("missing-information intelligence refuses invented info-gain and ungovered invasive testing", () => {
    const spec = seedFixtureSpec();
    const assessment = draftMissingInformationAssessmentEnvelope({
      id: "hsi-psmi-mia-ssc-fixture",
      intelligenceSpec: spec,
      pcrmMissingInformationAssessmentId: "hsi-pcrm-mia-ssc-fixture",
      missingMeasurementIds: ["fixture-meas-il6", "fixture-meas-crp-followup"],
      dataQualityGaps: ["Sparse follow-up inflammatory markers."],
      modelInputRequirements: ["Longitudinal inflammatory marker series required."],
      assessmentSummary: "Fixture missing-information assessment for research priorities.",
      limitations: [
        "Research measurement priorities only.",
        "Not clinical orders.",
      ],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    expect(assessment.inventedValues).toBeNull();

    expect(() =>
      draftMissingVariableResearchValue({
        id: "hsi-psmi-mrv-blocked",
        intelligenceSpec: spec,
        missingInformationAssessment: assessment,
        missingVariableIds: ["fixture-meas-il6"],
        sensitivityToMissingVariables: "high_declared",
        sensitivitySummary: "Must refuse invented probability status.",
        infoValueStatus: "blocked_invented_probability",
        limitations: ["Invented info-gain probabilities forbidden."],
        authoredByPrincipalId: "agent-hsi-psmi-1",
        createdAt: asOf,
      }),
    ).toThrow(/Invented info-gain probability blocked/);

    const unquantifiable = draftMissingVariableResearchValue({
      id: "hsi-psmi-mrv-unquant",
      intelligenceSpec: spec,
      missingInformationAssessment: assessment,
      missingVariableIds: ["fixture-meas-il6"],
      sensitivityToMissingVariables: "high_declared",
      sensitivitySummary: "High sensitivity to missing IL-6 follow-up under fixture assumptions.",
      infoValueStatus: "unquantifiable_declared",
      limitations: [
        "Info value unquantifiable — no invented probability.",
        "Research framing only.",
      ],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    expect(isQuantifiableInfoValue(unquantifiable.infoValueStatus)).toBe(false);
    expect(isBlockedInfoValue(unquantifiable.infoValueStatus)).toBe(false);
    expect(unquantifiable.inventedInfoGainProbability).toBeNull();

    const quantifiable = draftMissingVariableResearchValue({
      id: "hsi-psmi-mrv-quant",
      intelligenceSpec: spec,
      missingInformationAssessment: assessment,
      missingVariableIds: ["fixture-meas-crp-followup"],
      sensitivityToMissingVariables: "moderate_declared",
      sensitivitySummary: "Moderate sensitivity to missing CRP follow-up.",
      infoValueStatus: "quantifiable_declared",
      quantifiableInfoValueSummary:
        "Fixture declared comparative information value ranking without invented probabilities.",
      limitations: [
        "Quantifiable summary is comparative research framing only.",
        "No invented info-gain probability.",
      ],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    expect(isQuantifiableInfoValue(quantifiable.infoValueStatus)).toBe(true);

    expect(() =>
      draftFollowUpAndExperimentalValidation({
        id: "hsi-psmi-fuv-blocked",
        intelligenceSpec: spec,
        missingInformationAssessment: assessment,
        candidateFollowUpMeasurements: ["Fixture serum marker panel comparison."],
        experimentalValidationRecommendations: ["Fixture experimental validation recommendation."],
        researchMeasurementPriorities: ["Prioritise non-invasive research markers."],
        comparisonSummary: "Must refuse ungovered invasive testing.",
        invasiveTestingGovernanceStatus: "blocked_without_governance",
        limitations: ["Invasive testing without governance forbidden."],
        authoredByPrincipalId: "agent-hsi-psmi-1",
        createdAt: asOf,
      }),
    ).toThrow(/Invasive testing without governance blocked/);

    const followUp = draftFollowUpAndExperimentalValidation({
      id: "hsi-psmi-fuv-ssc-fixture",
      intelligenceSpec: spec,
      missingInformationAssessment: assessment,
      candidateFollowUpMeasurements: [
        "Fixture serum IL-6 follow-up comparison",
        "Fixture CRP sampling-schedule comparison",
      ],
      experimentalValidationRecommendations: [
        "Validate scenario outputs on authorised research cohort when available.",
      ],
      researchMeasurementPriorities: [
        "Prioritise non-invasive inflammatory marker follow-up for research evaluation.",
      ],
      comparisonSummary:
        "Candidate follow-up measurements framed as research priorities — not clinical orders.",
      invasiveTestingGovernanceStatus: "governance_required_declared",
      limitations: [
        "Research measurement priorities are not clinical orders.",
        "Invasive testing requires governance.",
      ],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    expect(requiresInvasiveGovernance(followUp.invasiveTestingGovernanceStatus)).toBe(true);
    expect(followUp.researchMeasurementPrioritiesNotClinicalOrders).toBe(true);
  });

  test("lifecycle transitions and blocked dataset stay fail-closed", () => {
    const blocked = seedFixtureSpec({
      id: "hsi-psmi-spec-blocked-demo",
      displayName: "Blocked precision scenario intelligence until authorised dataset",
      scientificQuestion:
        "Blocked scientific path for precision scenario missing-information intelligence until an authorised clinical dataset is supplied.",
      diseaseContextId: "hsi-hdi-ctx-blocked-demo",
      simulationScenarioId: null,
      digitalPatientModelId: null,
      patientContextualisedResearchSpecId: null,
      pcrmMissingInformationAssessmentId: null,
      multiscaleSimulationIntegrationSpecId: null,
      populationModellingSpecId: null,
      integratedDiseaseContextId: null,
      longitudinalModellingSpecId: null,
      cohortDefinitionId: null,
      rweStudyId: null,
      longitudinalClinicalEvidenceSpecId: null,
      datasetAvailability: "blocked_no_authorised_clinical_dataset",
    });
    expect(blocked.lifecycle).toBe("blocked_awaiting_authorised_dataset");

    expect(() =>
      transitionPrecisionScenarioMissingInformationSpec({
        spec: blocked,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "researcher-1", actorKind: "human"},
      }),
    ).toThrow(/Illegal lifecycle transition|Cannot accept/);

    const fixture = seedFixtureSpec();
    const underReview = transitionPrecisionScenarioMissingInformationSpec({
      spec: fixture,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-psmi-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionPrecisionScenarioMissingInformationSpec({
        spec: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-psmi-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Human review required/);

    const accepted = transitionPrecisionScenarioMissingInformationSpec({
      spec: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_limitations");

    const dosingBlocked = transitionPrecisionScenarioMissingInformationSpec({
      spec: seedFixtureSpec({id: "hsi-psmi-spec-dosing-block"}),
      to: "blocked_clinical_dosing_claim",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(dosingBlocked.lifecycle).toBe("blocked_clinical_dosing_claim");
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const spec = seedFixtureSpec();
    const scenarios = PSMI_SCENARIO_KINDS.map((kind, index) =>
      draftPrecisionResearchScenario({
        id: `hsi-psmi-scn-store-${index + 1}`,
        intelligenceSpec: spec,
        scenarioKind: kind,
        scenarioDefinition: `Store fixture ${kind} scenario.`,
        keyAssumptions: ["Store fixture assumption."],
        limitations: ["Research-only.", "Not clinical dosing."],
        authoredByPrincipalId: "agent-hsi-psmi-1",
        createdAt: asOf,
      }),
    );
    const primary = scenarios[0]!;
    const context = draftScenarioModelAndContext({
      id: "hsi-psmi-ctx-store",
      intelligenceSpec: spec,
      precisionResearchScenario: primary,
      modelVersion: "fixture-model-v0.1.0",
      supportedBiologicalContext: "Store fixture biological context.",
      contextSummary: "Store fixture model and context.",
      limitations: ["Research framing only.", "Fixture only."],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    const outputs = draftScenarioPredictedOutputs({
      id: "hsi-psmi-out-store",
      intelligenceSpec: spec,
      precisionResearchScenario: primary,
      predictedOutputs: ["Store fixture predicted research output."],
      outputsSummary: "Store fixture predicted outputs.",
      limitations: ["Research envelopes only.", "Specific-patient prediction not authorised."],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    const uncertainty = draftScenarioUncertaintySensitivity({
      id: "hsi-psmi-unc-store",
      intelligenceSpec: spec,
      precisionResearchScenario: primary,
      uncertaintyOrdinal: "moderate_declared",
      sensitivityOrdinal: "moderate_declared",
      uncertaintySummary: "Store fixture uncertainty.",
      sensitivitySummary: "Store fixture sensitivity.",
      sourcesOfUncertainty: ["fixture model"],
      sensitivityDrivers: ["assumption set"],
      limitations: ["Research framing only.", "Fixture only."],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    const validation = draftScenarioValidationRecommendation({
      id: "hsi-psmi-val-store",
      intelligenceSpec: spec,
      precisionResearchScenario: primary,
      recommendedValidationSteps: ["Store fixture validation step."],
      scenarioLimitations: ["Store fixture scenario limitation."],
      validationSummary: "Store fixture validation recommendation.",
      limitations: ["Research-only.", "Not a clinical order."],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    const assessment = draftMissingInformationAssessmentEnvelope({
      id: "hsi-psmi-mia-store",
      intelligenceSpec: spec,
      missingMeasurementIds: ["fixture-meas-il6"],
      dataQualityGaps: ["Store fixture quality gap."],
      modelInputRequirements: ["Store fixture input requirement."],
      assessmentSummary: "Store fixture missing-information assessment.",
      limitations: ["Research priorities only.", "Not clinical orders."],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    const researchValue = draftMissingVariableResearchValue({
      id: "hsi-psmi-mrv-store",
      intelligenceSpec: spec,
      missingInformationAssessment: assessment,
      missingVariableIds: ["fixture-meas-il6"],
      sensitivityToMissingVariables: "moderate_declared",
      sensitivitySummary: "Store fixture missing-variable sensitivity.",
      infoValueStatus: "unquantifiable_declared",
      limitations: ["No invented info-gain probability.", "Research framing only."],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    const followUp = draftFollowUpAndExperimentalValidation({
      id: "hsi-psmi-fuv-store",
      intelligenceSpec: spec,
      missingInformationAssessment: assessment,
      candidateFollowUpMeasurements: ["Store fixture follow-up measurement."],
      experimentalValidationRecommendations: ["Store fixture experimental validation."],
      researchMeasurementPriorities: ["Store fixture research measurement priority."],
      comparisonSummary: "Store fixture follow-up comparison.",
      invasiveTestingGovernanceStatus: "not_applicable",
      limitations: ["Research priorities only.", "Not clinical orders."],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });

    const draftBundle = draftPrecisionScenarioMissingInformationBundle({
      id: "hsi-psmi-bnd-store",
      displayName: "Fixture store precision scenario missing-information bundle",
      intelligenceSpec: spec,
      bundleVersion: "0.1.0",
      limitations: [
        "Fixture store bundle — research decision support only.",
        "Not personalised treatment effects.",
        "Not clinical dosing.",
        "Specific-patient prediction not authorised.",
      ],
      precisionResearchScenarios: scenarios,
      scenarioModelAndContexts: [context],
      scenarioPredictedOutputs: [outputs],
      scenarioUncertaintySensitivities: [uncertainty],
      scenarioValidationRecommendations: [validation],
      missingInformationAssessments: [assessment],
      missingVariableResearchValues: [researchValue],
      followUpAndExperimentalValidations: [followUp],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    expect(draftBundle.precisionResearchScenarioIds).toHaveLength(7);
    expect(draftBundle.scenarioKindIdsByKind.alternative_monitoring_schedules).toHaveLength(1);

    const underReview = transitionPrecisionScenarioMissingInformationBundle({
      bundle: draftBundle,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-psmi-1", actorKind: "ai_agent"},
    });
    const bundle = transitionPrecisionScenarioMissingInformationBundle({
      bundle: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(fingerprintPrecisionScenarioMissingInformationBundle(bundle)).toMatch(/^[a-f0-9]{64}$/);

    const store = createMemoryPrecisionScenarioMissingInformationStore();
    store.upsertSpec(spec);
    for (const scenario of scenarios) store.upsertPrecisionResearchScenario(scenario);
    store.upsertScenarioModelAndContext(context);
    store.upsertScenarioPredictedOutputs(outputs);
    store.upsertScenarioUncertaintySensitivity(uncertainty);
    store.upsertScenarioValidationRecommendation(validation);
    store.upsertMissingInformationAssessment(assessment);
    store.upsertMissingVariableResearchValue(researchValue);
    store.upsertFollowUpAndExperimentalValidation(followUp);
    store.upsertBundle(bundle);

    expect(store.listPrecisionResearchScenarios(spec.diseaseContextId)).toHaveLength(7);
    expect(store.listBundles(spec.diseaseContextId)).toHaveLength(1);

    const lines = projectPrecisionScenarioMissingInformationPersistenceLines({
      specs: [spec],
      precisionResearchScenarios: scenarios,
      scenarioModelAndContexts: [context],
      scenarioPredictedOutputs: [outputs],
      scenarioUncertaintySensitivities: [uncertainty],
      scenarioValidationRecommendations: [validation],
      missingInformationAssessments: [assessment],
      missingVariableResearchValues: [researchValue],
      followUpAndExperimentalValidations: [followUp],
      bundles: [bundle],
    });
    expect(lines).toContain("notPersonalisedTreatmentEffect=true");
    expect(lines).toContain("noClinicalDosing=true");
    expect(lines).toContain("noInventedInfoGainProbabilities=true");
    expect(lines).toContain("scenarioKindsCovered=7");
    expect(lines).toContain("capabilityKindCount=8");
    expect(lines).toContain("neon=red-wave-only");

    const pack = buildPrecisionScenarioMissingInformationPack({
      specs: [spec],
      precisionResearchScenarios: scenarios,
      scenarioModelAndContexts: [context],
      scenarioPredictedOutputs: [outputs],
      scenarioUncertaintySensitivities: [uncertainty],
      scenarioValidationRecommendations: [validation],
      missingInformationAssessments: [assessment],
      missingVariableResearchValues: [researchValue],
      followUpAndExperimentalValidations: [followUp],
      bundles: [bundle],
      asOf,
    });
    expect(pack.scenarioKindsCovered).toBe(7);
    expect(pack.capabilityKindCount).toBe(8);
    expect(pack.honesty.noInventedInfoGainProbabilities).toBe(true);
  });

  test("compose pack helper rejects mismatched scenario ownership", () => {
    const spec = seedFixtureSpec();
    const other = seedFixtureSpec({
      id: "hsi-psmi-spec-other",
      diseaseContextId: "hsi-hdi-ctx-other-fixture",
    });
    const scenario = draftPrecisionResearchScenario({
      id: "hsi-psmi-scn-other-owner",
      intelligenceSpec: other,
      scenarioKind: "cohort_subgroup_comparisons",
      scenarioDefinition: "Scenario owned by a different intelligence spec.",
      keyAssumptions: ["Ownership mismatch fixture."],
      limitations: ["Research-only.", "Ownership must match."],
      authoredByPrincipalId: "agent-hsi-psmi-1",
      createdAt: asOf,
    });
    expect(() =>
      draftScenarioModelAndContext({
        id: "hsi-psmi-ctx-mismatch",
        intelligenceSpec: spec,
        precisionResearchScenario: scenario,
        modelVersion: "fixture-model-v0.1.0",
        supportedBiologicalContext: "Mismatch context.",
        contextSummary: "Must refuse mismatched ownership.",
        limitations: ["Ownership mismatch.", "Research-only."],
        authoredByPrincipalId: "agent-hsi-psmi-1",
        createdAt: asOf,
      }),
    ).toThrow(/belong to intelligence spec/);
  });
});
