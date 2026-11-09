/**
 * Milestone 15 / PR7 — multiscale simulation integration pack check.
 * Offline contracts only — no PHI, twin, CDS, live M11 engine, invented
 * parameters, or validated individual outcome predictions.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  MSI_CAPABILITY_KINDS,
  MULTISCALE_SIMULATION_INTEGRATION_METHOD,
  MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
  MULTISCALE_SIMULATION_INTEGRATION_VERSION,
  buildMultiscaleSimulationIntegrationPack,
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
  projectMultiscaleSimulationIntegrationPersistenceLines,
  transitionMultiscaleSimulationIntegrationBundle,
} from "../src/multiscaleSimulationIntegrationContracts";

const asOf = "2026-11-09T16:00:00.000Z";
const outDir = "evaluation/multiscale-simulation-integration";

function fixturePack() {
  const blockedSpec = draftMultiscaleSimulationIntegrationSpec({
    id: "hsi-msi-spec-blocked-demo",
    displayName:
      "Blocked multiscale simulation integration until authorised dataset",
    scientificQuestion:
      "Blocked scientific path for multiscale simulation integration until an authorised clinical dataset is supplied.",
    diseaseContextId: "hsi-hdi-ctx-blocked-demo",
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const spec = draftMultiscaleSimulationIntegrationSpec({
    id: "hsi-msi-spec-ssc-demo",
    displayName: "Fixture SSc multiscale simulation integration spec",
    scientificQuestion:
      "How can research-only multiscale simulation scenarios declare disease questions, model-component availability, applicability, fixture input refs, assumptions, configuration, fixture/harness runs, uncertainty, validity flags, and reviewable interpretation while keeping research envelopes distinct from engine or individual-prediction claims?",
    diseaseContextId: "hsi-hdi-ctx-ssc-demo",
    simulationScenarioId: "hsi-hdi-sim-ssc-demo",
    digitalPatientModelId: "hsi-hdi-dpm-ssc-demo",
    patientContextualisedResearchSpecId: "hsi-pcrm-spec-ssc-demo",
    crossScaleOntologySpecId: "hsi-csol-spec-ssc-demo",
    populationModellingSpecId: "hsi-pcdm-spec-ssc-demo",
    integratedDiseaseContextId: "hsi-cbc-idc-ssc-demo",
    longitudinalModellingSpecId: "hsi-ldsm-spec-ssc-demo",
    cohortDefinitionId: "hsi-rcb-coh-ssc-demo",
    rweStudyId: "hsi-rwe-study-ssc-demo",
    longitudinalClinicalEvidenceSpecId: "hsi-lce-spec-ssc-demo",
    datasetAvailability: "fixture_only",
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const question = draftDiseaseResearchQuestionSelection({
    id: "hsi-msi-drq-ssc-demo",
    integrationSpec: spec,
    researchQuestion:
      "Fixture research question on cross-scale inflammatory signalling under research-only simulation framing.",
    questionScopeSummary:
      "Research-only disease question selection — not clinical care.",
    limitations: [
      "Research question is not clinical care.",
      "Fixture framing only.",
    ],
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const available = draftValidatedModelComponentIdentification({
    id: "hsi-msi-vmc-ssc-available",
    integrationSpec: spec,
    diseaseResearchQuestion: question,
    componentRefId: "fixture-model-component-il6-pathway",
    componentLabel: "Fixture IL-6 pathway component",
    availability: "validated_component_declared",
    crossScaleMappingId: "hsi-csol-map-ssc-demo",
    availabilitySummary:
      "Fixture validated model component declared for research coupling.",
    limitations: [
      "Validated component declaration is research framing only.",
      "Operational multiscale engine absent.",
    ],
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

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
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const applicability = draftModelApplicabilityCheck({
    id: "hsi-msi-app-ssc-partial",
    integrationSpec: spec,
    diseaseResearchQuestion: question,
    applicabilityOutcome: "partial_with_limitations",
    applicabilitySummary:
      "Fixture partial applicability declared with research limitations.",
    limitations: [
      "Partial applicability is not clinical authorisation.",
      "Research-only framing.",
    ],
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const inputs = draftAuthorisedInputDataRetrieval({
    id: "hsi-msi-aid-ssc-demo",
    integrationSpec: spec,
    authorisationStatus: "fixture_declared",
    inputDataRefIds: ["fixture-input-ref-il6", "fixture-input-ref-crp"],
    inputSummary:
      "Fixture authorised input data refs for harness-only simulation.",
    limitations: [
      "Fixture input refs are not an authorised clinical feed.",
      "Missing parameters stay undeclared.",
    ],
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const assumptions = draftBiologicalClinicalAssumptionDefinition({
    id: "hsi-msi-asm-ssc-demo",
    integrationSpec: spec,
    assumptionStatements: [
      "Fixture biological assumption declared without inventing parameters.",
      "Clinical framing remains research-only.",
    ],
    assumptionSummary:
      "Fixture biological/clinical assumptions for simulation configuration.",
    limitations: [
      "Assumptions are research framing only.",
      "Missing parameters stay undeclared.",
    ],
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const coupling = draftModelCouplingDeclaration({
    id: "hsi-msi-cpl-ssc-demo",
    integrationSpec: spec,
    couplingSupportStatus: "uncertain_coupling_declared",
    coupledVariables: ["il6_concentration"],
    units: ["pg/mL"],
    timeScales: ["hours"],
    assumptions: ["Single-scale fixture coupling only."],
    identifiabilityStatus: "partially_identifiable_declared",
    knownFailureConditions: [
      "Fails if treated as organ-level causal effect.",
      "Fails if treated as operational engine output.",
    ],
    couplingSummary:
      "Uncertain single-scale coupling for fixture harness — molecular ≠ organ without validated coupling.",
    crossScaleMappingId: "hsi-csol-map-ssc-demo",
    limitations: [
      "Uncertain coupling is not validated organ causal support.",
      "Compose with PR4 coupling honesty.",
    ],
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const configuration = draftSimulationConfiguration({
    id: "hsi-msi-cfg-ssc-demo",
    integrationSpec: spec,
    diseaseResearchQuestion: question,
    authorisedInputData: inputs,
    assumptionDefinition: assumptions,
    modelCouplingDeclaration: coupling,
    configurationSummary:
      "Fixture simulation configuration for harness-only run.",
    configuredComponentRefIds: ["fixture-model-component-il6-pathway"],
    limitations: [
      "Configuration is research framing only.",
      "Operational multiscale engine absent.",
    ],
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const run = draftApprovedComputationalModelRun({
    id: "hsi-msi-run-ssc-demo",
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
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const uncertainty = draftUncertaintyQuantification({
    id: "hsi-msi-unc-ssc-demo",
    integrationSpec: spec,
    approvedComputationalModelRun: run,
    uncertaintyOrdinal: "high_declared",
    uncertaintySummary:
      "Fixture high uncertainty from harness-only execution and unavailable organ-scale component.",
    sourcesOfUncertainty: [
      "fixture harness only",
      "unavailable organ-scale component",
    ],
    limitations: [
      "Uncertainty quantification is research framing only.",
      "Not clinical care.",
    ],
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const validity = draftNumericalBiologicalValidityEvaluation({
    id: "hsi-msi-val-ssc-demo",
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
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const interpretation = draftResearchInterpretationEnvelope({
    id: "hsi-msi-int-ssc-demo",
    integrationSpec: spec,
    diseaseResearchQuestion: question,
    approvedComputationalModelRun: run,
    modelApplicabilityCheck: applicability,
    uncertaintyQuantification: uncertainty,
    numericalBiologicalValidityEvaluation: validity,
    modelCouplingDeclaration: coupling,
    interpretationSummary:
      "Fixture reviewable research interpretation under partial applicability, high uncertainty, and harness-only execution.",
    limitations: [
      "Research-only interpretation.",
      "Not a personalised treatment effect.",
      "Individual outcome prediction not authorised.",
      "Operational multiscale engine not claimed.",
    ],
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const draftBundle = draftMultiscaleSimulationIntegrationBundle({
    id: "hsi-msi-bnd-ssc-demo",
    displayName: "Fixture SSc multiscale simulation integration bundle",
    integrationSpec: spec,
    bundleVersion: "0.1.0",
    limitations: [
      "Fixture multiscale simulation integration bundle — research decision support only.",
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
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });
  const underReview = transitionMultiscaleSimulationIntegrationBundle({
    bundle: draftBundle,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-msi", actorKind: "ai_agent"},
  });
  const bundle = transitionMultiscaleSimulationIntegrationBundle({
    bundle: underReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const blockedBundle = draftMultiscaleSimulationIntegrationBundle({
    id: "hsi-msi-bnd-blocked-demo",
    displayName: "Blocked multiscale simulation integration bundle",
    integrationSpec: blockedSpec,
    bundleVersion: "0.1.0",
    limitations: [
      "Blocked awaiting authorised research dataset — not scientific validation.",
      "Operational multiscale engine absent; fixtures only.",
    ],
    authoredByPrincipalId: "fixture-agent-msi",
    createdAt: asOf,
  });

  const specs = [blockedSpec, spec];
  const pack = buildMultiscaleSimulationIntegrationPack({
    specs,
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
    bundles: [blockedBundle, bundle],
    asOf,
  });
  const persistenceLines =
    projectMultiscaleSimulationIntegrationPersistenceLines({
      specs,
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
      bundles: [blockedBundle, bundle],
    });

  return {pack, persistenceLines, blockedSpec};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blockedSpec} = fixturePack();
  writeFileSync(
    join(outDir, "multiscale-simulation-integration-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
        method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
        version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked:
          blockedSpec.datasetAvailability ===
          "blocked_no_authorised_clinical_dataset",
        scientificPathBlockedNoAuthorisedDataset: true,
        capabilityKindCount: MSI_CAPABILITY_KINDS.length,
        liveMultiscaleEngineOperational: false,
        m11SimulationClaimed: false,
        notValidatedIndividualOutcomePrediction: true,
        notPersonalisedTreatmentEffect: true,
        notDigitalTwinProduct: true,
        molecularDoesNotEqualOrganWithoutValidatedCoupling: true,
        doNotInventMissingParameters: true,
        fixtureHarnessIsNotLiveEngine: true,
        populationAssociationIsNotIndividualTruth: true,
        observedIsNotInferred: true,
        phiIngestion: false,
        autonomousDiagnosisOrPrescribing: false,
        workbenchUi: false,
        graphPromotable: false,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        unavailableModelComponentCount: pack.unavailableModelComponentCount,
        fixtureHarnessRunCount: pack.fixtureHarnessRunCount,
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
    pack.diseaseResearchQuestionCount !== 1 ||
    pack.validatedModelComponentCount !== 2 ||
    pack.modelApplicabilityCheckCount !== 1 ||
    pack.authorisedInputDataCount !== 1 ||
    pack.biologicalClinicalAssumptionCount !== 1 ||
    pack.modelCouplingDeclarationCount !== 1 ||
    pack.simulationConfigurationCount !== 1 ||
    pack.approvedComputationalModelRunCount !== 1 ||
    pack.uncertaintyQuantificationCount !== 1 ||
    pack.numericalBiologicalValidityEvaluationCount !== 1 ||
    pack.researchInterpretationEnvelopeCount !== 1 ||
    pack.bundleCount !== 2 ||
    pack.unavailableModelComponentCount !== 1 ||
    pack.fixtureHarnessRunCount !== 1 ||
    pack.capabilityKindCount !== 10
  ) {
    throw new Error("Multiscale simulation integration pack check failed");
  }
  if (pack.honesty.liveMultiscaleEngineOperational !== false) {
    throw new Error("Live multiscale engine honesty gate failed");
  }
  if (pack.honesty.m11SimulationClaimed !== false) {
    throw new Error("M11 simulation claim honesty gate failed");
  }
  if (pack.honesty.notValidatedIndividualOutcomePrediction !== true) {
    throw new Error("Individual outcome prediction honesty gate failed");
  }
  if (pack.honesty.molecularDoesNotEqualOrganWithoutValidatedCoupling !== true) {
    throw new Error("Molecular≠organ coupling honesty gate failed");
  }
  if (pack.honesty.doNotInventMissingParameters !== true) {
    throw new Error("Invented-parameters honesty gate failed");
  }
  if (
    blockedSpec.datasetAvailability !==
    "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `multiscale-simulation-integration-contracts check ok (${pack.specCount} specs, ${pack.bundleCount} bundles, ${pack.capabilityKindCount} capabilities, ${pack.unavailableModelComponentCount} unavailable components, ${pack.fixtureHarnessRunCount} fixture harness runs; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(
    `Wrote ${outDir}/multiscale-simulation-integration-pack.v1.json`,
  );
}
