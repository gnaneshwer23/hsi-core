/**
 * Milestone 15 PR7 — multiscale simulation integration honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  MSI_CAPABILITY_KINDS,
  buildMultiscaleSimulationIntegrationPack,
  createMemoryMultiscaleSimulationIntegrationStore,
  draftApprovedComputationalModelRun,
  draftAuthorisedInputDataRetrieval,
  draftBiologicalClinicalAssumptionDefinition,
  draftDiseaseResearchQuestionSelection,
  draftModelApplicabilityCheck,
  draftModelCouplingDeclaration,
  draftMultiscaleSimulationIntegrationBundle,
  draftMultiscaleSimulationIntegrationSpec,
  draftNumericalBiologicalValidityEvaluation,
  draftResearchInterpretationEnvelope,
  draftSimulationConfiguration,
  draftUncertaintyQuantification,
  draftValidatedModelComponentIdentification,
  fingerprintMultiscaleSimulationIntegrationBundle,
  isFixtureHarnessRun,
  isOutOfScopeApplicability,
  isUnavailableModelComponent,
  projectMultiscaleSimulationIntegrationPersistenceLines,
  transitionMultiscaleSimulationIntegrationBundle,
  transitionMultiscaleSimulationIntegrationSpec,
  type MultiscaleSimulationIntegrationSpec,
} from "../src/multiscaleSimulationIntegrationContracts";

const asOf = "2026-11-09T16:00:00.000Z";

function seedFixtureSpec(
  overrides?: Partial<
    Parameters<typeof draftMultiscaleSimulationIntegrationSpec>[0]
  >,
): MultiscaleSimulationIntegrationSpec {
  return draftMultiscaleSimulationIntegrationSpec({
    id: "hsi-msi-spec-ssc-fixture",
    displayName: "Fixture SSc multiscale simulation integration spec",
    scientificQuestion:
      "How can research-only multiscale simulation scenarios declare disease questions, model-component availability, applicability, fixture input refs, assumptions, configuration, fixture/harness runs, uncertainty, validity flags, and reviewable interpretation while keeping research envelopes distinct from engine or individual-prediction claims?",
    diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
    simulationScenarioId: "hsi-hdi-sim-ssc-fixture",
    digitalPatientModelId: "hsi-hdi-dpm-ssc-fixture",
    patientContextualisedResearchSpecId: "hsi-pcrm-spec-ssc-fixture",
    crossScaleOntologySpecId: "hsi-csol-spec-ssc-fixture",
    populationModellingSpecId: "hsi-pcdm-spec-ssc-fixture",
    integratedDiseaseContextId: "hsi-cbc-idc-ssc-fixture",
    longitudinalModellingSpecId: "hsi-ldsm-spec-ssc-fixture",
    cohortDefinitionId: "hsi-rcb-coh-ssc-fixture",
    rweStudyId: "hsi-rwe-study-ssc-fixture",
    longitudinalClinicalEvidenceSpecId: "hsi-lce-spec-ssc-fixture",
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "agent-hsi-msi-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    ...overrides,
  });
}

describe("multiscale simulation integration contracts (M15 PR7)", () => {
  test("covers all ten capability kinds with HDI/PCRM/CSOL links", () => {
    expect(MSI_CAPABILITY_KINDS).toHaveLength(10);
    expect(MSI_CAPABILITY_KINDS).toContain(
      "disease_research_question_selection",
    );
    expect(MSI_CAPABILITY_KINDS).toContain(
      "validated_model_component_identification",
    );
    expect(MSI_CAPABILITY_KINDS).toContain("model_applicability_check");
    expect(MSI_CAPABILITY_KINDS).toContain("authorised_input_data_retrieval");
    expect(MSI_CAPABILITY_KINDS).toContain(
      "biological_clinical_assumption_definition",
    );
    expect(MSI_CAPABILITY_KINDS).toContain("simulation_configuration");
    expect(MSI_CAPABILITY_KINDS).toContain("approved_computational_model_run");
    expect(MSI_CAPABILITY_KINDS).toContain("uncertainty_quantification");
    expect(MSI_CAPABILITY_KINDS).toContain(
      "numerical_biological_validity_evaluation",
    );
    expect(MSI_CAPABILITY_KINDS).toContain("research_interpretation_envelope");

    const spec = seedFixtureSpec();
    expect(spec.honesty.liveMultiscaleEngineOperational).toBe(false);
    expect(spec.honesty.m11SimulationClaimed).toBe(false);
    expect(spec.honesty.notValidatedIndividualOutcomePrediction).toBe(true);
    expect(spec.honesty.molecularDoesNotEqualOrganWithoutValidatedCoupling).toBe(
      true,
    );
    expect(spec.honesty.doNotInventMissingParameters).toBe(true);
    expect(spec.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(spec.simulationScenarioId).toBe("hsi-hdi-sim-ssc-fixture");
    expect(spec.patientContextualisedResearchSpecId).toBe(
      "hsi-pcrm-spec-ssc-fixture",
    );
    expect(spec.crossScaleOntologySpecId).toBe("hsi-csol-spec-ssc-fixture");
    expect(spec.inventedParameters).toBeNull();
    expect(spec.capabilityKinds).toHaveLength(10);
  });

  test("marks unavailable model components and refuses invented authorised inputs", () => {
    const spec = seedFixtureSpec();
    const question = draftDiseaseResearchQuestionSelection({
      id: "hsi-msi-drq-ssc-fixture",
      integrationSpec: spec,
      researchQuestion:
        "Fixture research question on cross-scale inflammatory signalling under research-only simulation framing.",
      questionScopeSummary:
        "Research-only disease question selection — not clinical care.",
      limitations: [
        "Research question is not clinical care.",
        "Fixture framing only.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    expect(question.notClinicalCareQuestion).toBe(true);

    const available = draftValidatedModelComponentIdentification({
      id: "hsi-msi-vmc-ssc-available",
      integrationSpec: spec,
      diseaseResearchQuestion: question,
      componentRefId: "fixture-model-component-il6-pathway",
      componentLabel: "Fixture IL-6 pathway component",
      availability: "validated_component_declared",
      crossScaleMappingId: "hsi-csol-map-ssc-fixture",
      availabilitySummary:
        "Fixture validated model component declared for research coupling.",
      limitations: [
        "Validated component declaration is research framing only.",
        "Operational multiscale engine absent.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    expect(isUnavailableModelComponent(available.availability)).toBe(false);

    const unavailable = draftValidatedModelComponentIdentification({
      id: "hsi-msi-vmc-ssc-unavailable",
      integrationSpec: spec,
      diseaseResearchQuestion: question,
      componentRefId: "fixture-model-component-organ-coupling",
      componentLabel: "Unavailable organ-scale coupling component",
      availability: "unavailable_declared",
      availabilitySummary:
        "Organ-scale coupling component unavailable — recorded explicitly.",
      limitations: [
        "Unavailable components must stay unavailable.",
        "Molecular does not equal organ without validated coupling.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    expect(isUnavailableModelComponent(unavailable.availability)).toBe(true);

    expect(() =>
      draftAuthorisedInputDataRetrieval({
        id: "hsi-msi-aid-bad-auth",
        integrationSpec: spec,
        authorisationStatus: "authorised_declared",
        inputDataRefIds: ["fixture-input-ref-1"],
        inputSummary: "Must refuse authorised_declared under fixture_only.",
        limitations: ["Authorisation status must match dataset honesty."],
        authoredByPrincipalId: "agent-hsi-msi-1",
        createdAt: asOf,
      }),
    ).toThrow(/Fixture dataset cannot claim authorised_declared/);

    const inputs = draftAuthorisedInputDataRetrieval({
      id: "hsi-msi-aid-ssc-fixture",
      integrationSpec: spec,
      authorisationStatus: "fixture_declared",
      inputDataRefIds: ["fixture-input-ref-il6", "fixture-input-ref-crp"],
      inputSummary:
        "Fixture authorised input data refs for harness-only simulation.",
      limitations: [
        "Fixture input refs are not an authorised clinical feed.",
        "Missing parameters stay undeclared.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    expect(inputs.inventedParameters).toBeNull();
    expect(inputs.inputDataRefIds).toHaveLength(2);
  });

  test("model coupling requires evidence for validated support and blocks configuration otherwise", () => {
    const spec = seedFixtureSpec();
    expect(() =>
      draftModelCouplingDeclaration({
        id: "hsi-msi-cpl-missing-evidence",
        integrationSpec: spec,
        couplingSupportStatus: "validated_coupling_declared",
        coupledVariables: ["il6_concentration", "organ_inflammation_index"],
        units: ["pg/mL", "arbitrary_units"],
        timeScales: ["hours", "days"],
        assumptions: ["Fixture coupling assumption declared."],
        identifiabilityStatus: "partially_identifiable_declared",
        validationEvidenceRefs: [],
        knownFailureConditions: ["Fails when coupling evidence absent."],
        couplingSummary: "Must refuse validated coupling without evidence refs.",
        limitations: ["Validated coupling requires evidence."],
        authoredByPrincipalId: "agent-hsi-msi-1",
        createdAt: asOf,
      }),
    ).toThrow(/validationEvidenceRef/);

    const blockedCoupling = draftModelCouplingDeclaration({
      id: "hsi-msi-cpl-blocked",
      integrationSpec: spec,
      couplingSupportStatus: "blocked_no_validated_coupling",
      coupledVariables: ["molecular_signal", "organ_response"],
      units: ["relative_units", "relative_units"],
      timeScales: ["minutes", "days"],
      assumptions: [
        "Molecular association does not imply organ-level causal effect.",
      ],
      identifiabilityStatus: "insufficient_to_assess",
      knownFailureConditions: [
        "Cross-scale organ inference without validated coupling.",
      ],
      couplingSummary:
        "Blocked coupling recorded explicitly — molecular ≠ organ without validated coupling.",
      limitations: [
        "Blocked coupling cannot authorise cross-scale simulation wiring.",
        "Compose with PR4 unsupported coupling honesty.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    expect(blockedCoupling.inventedParameters).toBeNull();
    expect(
      blockedCoupling.molecularDoesNotEqualOrganWithoutValidatedCoupling,
    ).toBe(true);

    const question = draftDiseaseResearchQuestionSelection({
      id: "hsi-msi-drq-coupling",
      integrationSpec: spec,
      researchQuestion: "Fixture question for blocked coupling configuration.",
      questionScopeSummary: "Research-only scope for coupling refusal.",
      limitations: ["Research-only.", "Not clinical care."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const inputs = draftAuthorisedInputDataRetrieval({
      id: "hsi-msi-aid-coupling",
      integrationSpec: spec,
      authorisationStatus: "fixture_declared",
      inputDataRefIds: ["fixture-input-ref-1"],
      inputSummary: "Fixture inputs for coupling refusal.",
      limitations: ["Fixture only.", "No invented parameters."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const assumptions = draftBiologicalClinicalAssumptionDefinition({
      id: "hsi-msi-asm-coupling",
      integrationSpec: spec,
      assumptionStatements: [
        "Fixture biological assumption declared without inventing parameters.",
      ],
      assumptionSummary: "Fixture assumptions for coupling refusal.",
      limitations: ["Assumptions are research framing only.", "Fixture only."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });

    expect(() =>
      draftSimulationConfiguration({
        id: "hsi-msi-cfg-blocked-coupling",
        integrationSpec: spec,
        diseaseResearchQuestion: question,
        authorisedInputData: inputs,
        assumptionDefinition: assumptions,
        modelCouplingDeclaration: blockedCoupling,
        configurationSummary:
          "Must refuse configuration under blocked coupling.",
        configuredComponentRefIds: ["fixture-model-component-il6-pathway"],
        limitations: [
          "Blocked coupling refuses configuration.",
          "Operational engine absent.",
        ],
        authoredByPrincipalId: "agent-hsi-msi-1",
        createdAt: asOf,
      }),
    ).toThrow(/blocked_no_validated_coupling/);
  });

  test("fixture/harness runs stay honest and refuse individual outcome prediction language", () => {
    const spec = seedFixtureSpec();
    const question = draftDiseaseResearchQuestionSelection({
      id: "hsi-msi-drq-run",
      integrationSpec: spec,
      researchQuestion: "Fixture run question for harness-only execution.",
      questionScopeSummary: "Research-only harness scope.",
      limitations: ["Research-only.", "Not clinical care."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const inputs = draftAuthorisedInputDataRetrieval({
      id: "hsi-msi-aid-run",
      integrationSpec: spec,
      authorisationStatus: "fixture_declared",
      inputDataRefIds: ["fixture-input-ref-il6"],
      inputSummary: "Fixture inputs for harness run.",
      limitations: ["Fixture only.", "No invented parameters."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const assumptions = draftBiologicalClinicalAssumptionDefinition({
      id: "hsi-msi-asm-run",
      integrationSpec: spec,
      assumptionStatements: ["Fixture assumption for harness run."],
      assumptionSummary: "Fixture assumptions for harness run.",
      limitations: ["Assumptions are research framing only.", "Fixture only."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const coupling = draftModelCouplingDeclaration({
      id: "hsi-msi-cpl-run",
      integrationSpec: spec,
      couplingSupportStatus: "uncertain_coupling_declared",
      coupledVariables: ["il6_concentration"],
      units: ["pg/mL"],
      timeScales: ["hours"],
      assumptions: ["Single-scale fixture coupling only."],
      identifiabilityStatus: "partially_identifiable_declared",
      knownFailureConditions: ["Fails if treated as organ-level causal effect."],
      couplingSummary: "Uncertain single-scale coupling for fixture harness.",
      limitations: [
        "Uncertain coupling is not validated organ causal support.",
        "Fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const configuration = draftSimulationConfiguration({
      id: "hsi-msi-cfg-run",
      integrationSpec: spec,
      diseaseResearchQuestion: question,
      authorisedInputData: inputs,
      assumptionDefinition: assumptions,
      modelCouplingDeclaration: coupling,
      configurationSummary: "Fixture simulation configuration for harness run.",
      configuredComponentRefIds: ["fixture-model-component-il6-pathway"],
      limitations: [
        "Configuration is research framing only.",
        "Operational multiscale engine absent.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });

    expect(() =>
      draftApprovedComputationalModelRun({
        id: "hsi-msi-run-bad-label",
        integrationSpec: spec,
        simulationConfiguration: configuration,
        runMode: "fixture_harness_only",
        runSummary: "Must refuse dishonest harness label.",
        harnessLabel: "production-engine-v1",
        limitations: ["Harness must be labelled honestly."],
        authoredByPrincipalId: "agent-hsi-msi-1",
        createdAt: asOf,
      }),
    ).toThrow(/label harness honestly/);

    const run = draftApprovedComputationalModelRun({
      id: "hsi-msi-run-ssc-fixture",
      integrationSpec: spec,
      simulationConfiguration: configuration,
      runMode: "fixture_harness_only",
      runSummary:
        "Fixture/harness-only computational model run — operational engine absent.",
      harnessLabel: "msi-fixture-harness-v1",
      limitations: [
        "Fixture harness is not a live engine.",
        "Individual outcome prediction not authorised.",
        "Operational multiscale engine remains skipped/missing.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    expect(isFixtureHarnessRun(run.runMode)).toBe(true);
    expect(run.liveMultiscaleEngineOperational).toBe(false);
    expect(run.m11SimulationClaimed).toBe(false);
    expect(run.notValidatedIndividualOutcomePrediction).toBe(true);

    expect(() =>
      draftResearchInterpretationEnvelope({
        id: "hsi-msi-int-bad-language",
        integrationSpec: spec,
        approvedComputationalModelRun: run,
        interpretationSummary:
          "This provides a validated individual outcome prediction for care.",
        limitations: ["Must refuse individual outcome prediction language."],
        authoredByPrincipalId: "agent-hsi-msi-1",
        createdAt: asOf,
      }),
    ).toThrow(/validated individual outcome prediction/);
  });

  test("applicability out-of-scope refuses interpretation; validity and uncertainty compose", () => {
    const spec = seedFixtureSpec();
    expect(
      isOutOfScopeApplicability("out_of_scope_outside_validated_population"),
    ).toBe(true);

    const outOfScope = draftModelApplicabilityCheck({
      id: "hsi-msi-app-oos",
      integrationSpec: spec,
      applicabilityOutcome: "out_of_scope_outside_validated_population",
      applicabilitySummary:
        "Fixture subject context sits outside the validated population domain.",
      limitations: [
        "Out-of-scope outside validated population.",
        "Research-only gate.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    expect(outOfScope.outOfScope).toBe(true);

    expect(() =>
      draftResearchInterpretationEnvelope({
        id: "hsi-msi-int-refused-oos",
        integrationSpec: spec,
        modelApplicabilityCheck: outOfScope,
        interpretationSummary: "Must refuse interpretation while out of scope.",
        limitations: [
          "Interpretation refused while out of scope.",
          "Research-only gate.",
        ],
        authoredByPrincipalId: "agent-hsi-msi-1",
        createdAt: asOf,
      }),
    ).toThrow(/out of scope/);

    const question = draftDiseaseResearchQuestionSelection({
      id: "hsi-msi-drq-compose",
      integrationSpec: spec,
      researchQuestion: "Fixture composition question.",
      questionScopeSummary: "Research-only composition scope.",
      limitations: ["Research-only.", "Not clinical care."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const inputs = draftAuthorisedInputDataRetrieval({
      id: "hsi-msi-aid-compose",
      integrationSpec: spec,
      authorisationStatus: "fixture_declared",
      inputDataRefIds: ["fixture-input-ref-il6"],
      inputSummary: "Fixture inputs for composition.",
      limitations: ["Fixture only.", "No invented parameters."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const assumptions = draftBiologicalClinicalAssumptionDefinition({
      id: "hsi-msi-asm-compose",
      integrationSpec: spec,
      assumptionStatements: ["Fixture assumption for composition."],
      assumptionSummary: "Fixture assumptions for composition.",
      limitations: ["Assumptions are research framing only.", "Fixture only."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const configuration = draftSimulationConfiguration({
      id: "hsi-msi-cfg-compose",
      integrationSpec: spec,
      diseaseResearchQuestion: question,
      authorisedInputData: inputs,
      assumptionDefinition: assumptions,
      configurationSummary: "Fixture configuration for composition.",
      configuredComponentRefIds: ["fixture-model-component-il6-pathway"],
      limitations: [
        "Configuration is research framing only.",
        "Operational engine absent.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const run = draftApprovedComputationalModelRun({
      id: "hsi-msi-run-compose",
      integrationSpec: spec,
      simulationConfiguration: configuration,
      runMode: "fixture_harness_only",
      runSummary: "Fixture harness run for composition.",
      harnessLabel: "msi-fixture-harness-compose",
      limitations: [
        "Fixture harness is not a live engine.",
        "Individual outcome prediction not authorised.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const applicability = draftModelApplicabilityCheck({
      id: "hsi-msi-app-compose",
      integrationSpec: spec,
      diseaseResearchQuestion: question,
      applicabilityOutcome: "partial_with_limitations",
      applicabilitySummary: "Fixture partial applicability for composition.",
      limitations: [
        "Partial applicability is not clinical authorisation.",
        "Research-only framing.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const uncertainty = draftUncertaintyQuantification({
      id: "hsi-msi-unc-compose",
      integrationSpec: spec,
      approvedComputationalModelRun: run,
      uncertaintyOrdinal: "high_declared",
      uncertaintySummary:
        "Fixture high uncertainty from harness-only execution and sparse inputs.",
      sourcesOfUncertainty: [
        "fixture harness only",
        "unavailable organ-scale component",
      ],
      limitations: [
        "Uncertainty quantification is research framing only.",
        "Not clinical care.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    expect(uncertainty.uncertaintyOrdinal).toBe("high_declared");

    const validity = draftNumericalBiologicalValidityEvaluation({
      id: "hsi-msi-val-compose",
      integrationSpec: spec,
      approvedComputationalModelRun: run,
      numericalValidityFlag: "numerically_plausible_declared",
      biologicalValidityFlag: "biologically_uncertain_declared",
      evaluationSummary:
        "Fixture numerical/biological validity flags — research envelope only.",
      limitations: [
        "Validity flags stay research envelopes only.",
        "Fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    expect(validity.numericalValidityFlag).toBe(
      "numerically_plausible_declared",
    );
    expect(validity.biologicalValidityFlag).toBe(
      "biologically_uncertain_declared",
    );

    const interpretation = draftResearchInterpretationEnvelope({
      id: "hsi-msi-int-compose",
      integrationSpec: spec,
      diseaseResearchQuestion: question,
      approvedComputationalModelRun: run,
      modelApplicabilityCheck: applicability,
      uncertaintyQuantification: uncertainty,
      numericalBiologicalValidityEvaluation: validity,
      interpretationSummary:
        "Fixture reviewable research interpretation under partial applicability, high uncertainty, and harness-only execution.",
      limitations: [
        "Research-only interpretation.",
        "Not a personalised treatment effect.",
        "Individual outcome prediction not authorised.",
        "Operational multiscale engine not claimed.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    expect(interpretation.researchOnly).toBe(true);
    expect(interpretation.reviewable).toBe(true);
    expect(interpretation.m11SimulationClaimed).toBe(false);
  });

  test("lifecycle transitions and blocked dataset stay fail-closed", () => {
    const blocked = seedFixtureSpec({
      id: "hsi-msi-spec-blocked-demo",
      displayName:
        "Blocked multiscale simulation integration until authorised dataset",
      scientificQuestion:
        "Blocked scientific path for multiscale simulation integration until an authorised clinical dataset is supplied.",
      diseaseContextId: "hsi-hdi-ctx-blocked-demo",
      simulationScenarioId: null,
      digitalPatientModelId: null,
      patientContextualisedResearchSpecId: null,
      crossScaleOntologySpecId: null,
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
      transitionMultiscaleSimulationIntegrationSpec({
        spec: blocked,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "researcher-1", actorKind: "human"},
      }),
    ).toThrow(/Illegal lifecycle transition|Cannot accept/);

    const fixture = seedFixtureSpec();
    const underReview = transitionMultiscaleSimulationIntegrationSpec({
      spec: fixture,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-msi-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionMultiscaleSimulationIntegrationSpec({
        spec: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-msi-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Human review required/);

    const accepted = transitionMultiscaleSimulationIntegrationSpec({
      spec: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_limitations");
    expect(accepted.reviewedBy?.actorKind).toBe("human");

    const engineBlocked = transitionMultiscaleSimulationIntegrationSpec({
      spec: seedFixtureSpec({id: "hsi-msi-spec-engine-block"}),
      to: "blocked_no_live_multiscale_engine",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(engineBlocked.lifecycle).toBe("blocked_no_live_multiscale_engine");
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const spec = seedFixtureSpec();
    const question = draftDiseaseResearchQuestionSelection({
      id: "hsi-msi-drq-store",
      integrationSpec: spec,
      researchQuestion: "Fixture store research question.",
      questionScopeSummary: "Research-only store scope.",
      limitations: ["Research-only.", "Not clinical care."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const available = draftValidatedModelComponentIdentification({
      id: "hsi-msi-vmc-store-ok",
      integrationSpec: spec,
      diseaseResearchQuestion: question,
      componentRefId: "fixture-model-component-il6-pathway",
      componentLabel: "Fixture available component",
      availability: "validated_component_declared",
      availabilitySummary: "Store fixture validated component.",
      limitations: ["Research framing only.", "Operational engine absent."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const unavailable = draftValidatedModelComponentIdentification({
      id: "hsi-msi-vmc-store-na",
      integrationSpec: spec,
      diseaseResearchQuestion: question,
      componentRefId: "fixture-model-component-organ",
      componentLabel: "Fixture unavailable organ component",
      availability: "unavailable_declared",
      availabilitySummary: "Store fixture unavailable component.",
      limitations: [
        "Unavailable component recorded explicitly.",
        "Molecular ≠ organ without validated coupling.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const applicability = draftModelApplicabilityCheck({
      id: "hsi-msi-app-store",
      integrationSpec: spec,
      diseaseResearchQuestion: question,
      applicabilityOutcome: "partial_with_limitations",
      applicabilitySummary: "Store fixture partial applicability.",
      limitations: [
        "Partial applicability is not clinical care.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const inputs = draftAuthorisedInputDataRetrieval({
      id: "hsi-msi-aid-store",
      integrationSpec: spec,
      authorisationStatus: "fixture_declared",
      inputDataRefIds: ["fixture-input-ref-il6"],
      inputSummary: "Store fixture input refs.",
      limitations: ["Fixture only.", "No invented parameters."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const assumptions = draftBiologicalClinicalAssumptionDefinition({
      id: "hsi-msi-asm-store",
      integrationSpec: spec,
      assumptionStatements: ["Store fixture assumption."],
      assumptionSummary: "Store fixture assumptions.",
      limitations: ["Assumptions are research framing only.", "Fixture only."],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const coupling = draftModelCouplingDeclaration({
      id: "hsi-msi-cpl-store",
      integrationSpec: spec,
      couplingSupportStatus: "uncertain_coupling_declared",
      coupledVariables: ["il6_concentration"],
      units: ["pg/mL"],
      timeScales: ["hours"],
      assumptions: ["Store fixture coupling assumption."],
      identifiabilityStatus: "partially_identifiable_declared",
      knownFailureConditions: ["Fails if treated as operational engine output."],
      couplingSummary: "Store fixture coupling declaration.",
      limitations: [
        "Uncertain coupling is not validated organ causal support.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const configuration = draftSimulationConfiguration({
      id: "hsi-msi-cfg-store",
      integrationSpec: spec,
      diseaseResearchQuestion: question,
      authorisedInputData: inputs,
      assumptionDefinition: assumptions,
      modelCouplingDeclaration: coupling,
      configurationSummary: "Store fixture simulation configuration.",
      configuredComponentRefIds: ["fixture-model-component-il6-pathway"],
      limitations: [
        "Configuration is research framing only.",
        "Operational engine absent.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const run = draftApprovedComputationalModelRun({
      id: "hsi-msi-run-store",
      integrationSpec: spec,
      simulationConfiguration: configuration,
      runMode: "fixture_harness_only",
      runSummary: "Store fixture harness run.",
      harnessLabel: "msi-fixture-harness-store",
      limitations: [
        "Fixture harness is not a live engine.",
        "Individual outcome prediction not authorised.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const uncertainty = draftUncertaintyQuantification({
      id: "hsi-msi-unc-store",
      integrationSpec: spec,
      approvedComputationalModelRun: run,
      uncertaintyOrdinal: "moderate_declared",
      uncertaintySummary: "Store fixture uncertainty quantification.",
      sourcesOfUncertainty: ["fixture harness only"],
      limitations: [
        "Uncertainty is research framing only.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const validity = draftNumericalBiologicalValidityEvaluation({
      id: "hsi-msi-val-store",
      integrationSpec: spec,
      approvedComputationalModelRun: run,
      numericalValidityFlag: "numerically_plausible_declared",
      biologicalValidityFlag: "biologically_uncertain_declared",
      evaluationSummary: "Store fixture validity evaluation.",
      limitations: [
        "Validity flags are not individual outcome predictions.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    const interpretation = draftResearchInterpretationEnvelope({
      id: "hsi-msi-int-store",
      integrationSpec: spec,
      diseaseResearchQuestion: question,
      approvedComputationalModelRun: run,
      modelApplicabilityCheck: applicability,
      uncertaintyQuantification: uncertainty,
      numericalBiologicalValidityEvaluation: validity,
      modelCouplingDeclaration: coupling,
      interpretationSummary: "Store fixture research interpretation envelope.",
      limitations: [
        "Research-only interpretation.",
        "Not a personalised treatment effect.",
        "Individual outcome prediction not authorised.",
      ],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });

    const draftBundle = draftMultiscaleSimulationIntegrationBundle({
      id: "hsi-msi-bnd-store",
      displayName: "Fixture store multiscale simulation integration bundle",
      integrationSpec: spec,
      bundleVersion: "0.1.0",
      limitations: [
        "Fixture store bundle — research decision support only.",
        "Operational multiscale engine absent.",
        "Individual outcome prediction not authorised.",
        "Unavailable components preserved explicitly.",
      ],
      diseaseResearchQuestions: [question],
      validatedModelComponents: [available, unavailable],
      modelApplicabilityChecks: [applicability],
      authorisedInputData: [inputs],
      biologicalClinicalAssumptions: [assumptions],
      modelCouplingDeclarations: [coupling],
      simulationConfigurations: [configuration],
      approvedComputationalModelRuns: [run],
      uncertaintyQuantifications: [uncertainty],
      numericalBiologicalValidityEvaluations: [validity],
      researchInterpretationEnvelopes: [interpretation],
      authoredByPrincipalId: "agent-hsi-msi-1",
      createdAt: asOf,
    });
    expect(draftBundle.unavailableComponentIds).toContain(unavailable.id);
    expect(draftBundle.liveMultiscaleEngineOperational).toBe(false);

    const underReview = transitionMultiscaleSimulationIntegrationBundle({
      bundle: draftBundle,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-msi-1", actorKind: "ai_agent"},
    });
    const bundle = transitionMultiscaleSimulationIntegrationBundle({
      bundle: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(bundle.lifecycle).toBe("accepted_with_limitations");
    expect(fingerprintMultiscaleSimulationIntegrationBundle(bundle)).toMatch(
      /^[a-f0-9]{64}$/,
    );

    const store = createMemoryMultiscaleSimulationIntegrationStore();
    store.upsertSpec(spec);
    store.upsertDiseaseResearchQuestion(question);
    store.upsertValidatedModelComponent(available);
    store.upsertValidatedModelComponent(unavailable);
    store.upsertModelApplicabilityCheck(applicability);
    store.upsertAuthorisedInputData(inputs);
    store.upsertBiologicalClinicalAssumption(assumptions);
    store.upsertModelCouplingDeclaration(coupling);
    store.upsertSimulationConfiguration(configuration);
    store.upsertApprovedComputationalModelRun(run);
    store.upsertUncertaintyQuantification(uncertainty);
    store.upsertNumericalBiologicalValidityEvaluation(validity);
    store.upsertResearchInterpretationEnvelope(interpretation);
    store.upsertBundle(bundle);

    expect(store.listSpecs(spec.diseaseContextId)).toHaveLength(1);
    expect(
      store.listValidatedModelComponents(spec.diseaseContextId),
    ).toHaveLength(2);
    expect(store.listBundles(spec.diseaseContextId)).toHaveLength(1);

    const lines = projectMultiscaleSimulationIntegrationPersistenceLines({
      specs: [spec],
      diseaseResearchQuestions: [question],
      validatedModelComponents: [available, unavailable],
      modelApplicabilityChecks: [applicability],
      authorisedInputData: [inputs],
      biologicalClinicalAssumptions: [assumptions],
      modelCouplingDeclarations: [coupling],
      simulationConfigurations: [configuration],
      approvedComputationalModelRuns: [run],
      uncertaintyQuantifications: [uncertainty],
      numericalBiologicalValidityEvaluations: [validity],
      researchInterpretationEnvelopes: [interpretation],
      bundles: [bundle],
    });
    expect(lines).toContain("liveMultiscaleEngineOperational=false");
    expect(lines).toContain("m11SimulationClaimed=false");
    expect(lines).toContain("notValidatedIndividualOutcomePrediction=true");
    expect(lines).toContain(
      "molecularDoesNotEqualOrganWithoutValidatedCoupling=true",
    );
    expect(lines).toContain("capabilityKindCount=10");
    expect(lines).toContain("unavailableModelComponents=1");
    expect(lines).toContain("fixtureHarnessRuns=1");
    expect(lines).toContain("neon=red-wave-only");

    const pack = buildMultiscaleSimulationIntegrationPack({
      specs: [spec],
      diseaseResearchQuestions: [question],
      validatedModelComponents: [available, unavailable],
      modelApplicabilityChecks: [applicability],
      authorisedInputData: [inputs],
      biologicalClinicalAssumptions: [assumptions],
      modelCouplingDeclarations: [coupling],
      simulationConfigurations: [configuration],
      approvedComputationalModelRuns: [run],
      uncertaintyQuantifications: [uncertainty],
      numericalBiologicalValidityEvaluations: [validity],
      researchInterpretationEnvelopes: [interpretation],
      bundles: [bundle],
      asOf,
    });
    expect(pack.capabilityKindCount).toBe(10);
    expect(pack.unavailableModelComponentCount).toBe(1);
    expect(pack.fixtureHarnessRunCount).toBe(1);
    expect(pack.honesty.m11SimulationClaimed).toBe(false);
  });
});
