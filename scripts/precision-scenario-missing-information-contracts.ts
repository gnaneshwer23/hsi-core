/**
 * Milestone 15 / PR8 — precision scenario missing-information pack check.
 * Offline contracts only — no PHI, twin, CDS, clinical dosing, invented
 * info-gain probabilities, or specific-patient prediction claims.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  PSMI_CAPABILITY_KINDS,
  PSMI_SCENARIO_KINDS,
  PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
  PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
  PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
  buildPrecisionScenarioMissingInformationPack,
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
  projectPrecisionScenarioMissingInformationPersistenceLines,
  transitionPrecisionScenarioMissingInformationBundle,
} from "../src/precisionScenarioMissingInformationContracts";

const asOf = "2026-11-09T17:00:00.000Z";
const outDir = "evaluation/precision-scenario-missing-information";

function fixturePack() {
  const blockedSpec = draftPrecisionScenarioMissingInformationSpec({
    id: "hsi-psmi-spec-blocked-demo",
    displayName: "Blocked precision scenario intelligence until authorised dataset",
    scientificQuestion:
      "Blocked scientific path for precision scenario missing-information intelligence until an authorised clinical dataset is supplied.",
    diseaseContextId: "hsi-hdi-ctx-blocked-demo",
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "fixture-agent-psmi",
    createdAt: asOf,
  });

  const spec = draftPrecisionScenarioMissingInformationSpec({
    id: "hsi-psmi-spec-ssc-demo",
    displayName: "Fixture SSc precision scenario missing-information spec",
    scientificQuestion:
      "How can bounded research scenarios declare alternative mechanisms, trajectory comparisons, biomarker measurement, parameter sensitivity, subgroup comparisons, pathway perturbations, and monitoring schedules while missing-information intelligence stays research-priority framed?",
    diseaseContextId: "hsi-hdi-ctx-ssc-demo",
    simulationScenarioId: "hsi-hdi-sim-ssc-demo",
    digitalPatientModelId: "hsi-hdi-dpm-ssc-demo",
    patientContextualisedResearchSpecId: "hsi-pcrm-spec-ssc-demo",
    pcrmMissingInformationAssessmentId: "hsi-pcrm-mia-ssc-demo",
    multiscaleSimulationIntegrationSpecId: "hsi-msi-spec-ssc-demo",
    populationModellingSpecId: "hsi-pcdm-spec-ssc-demo",
    integratedDiseaseContextId: "hsi-cbc-idc-ssc-demo",
    longitudinalModellingSpecId: "hsi-ldsm-spec-ssc-demo",
    cohortDefinitionId: "hsi-rcb-coh-ssc-demo",
    rweStudyId: "hsi-rwe-study-ssc-demo",
    longitudinalClinicalEvidenceSpecId: "hsi-lce-spec-ssc-demo",
    datasetAvailability: "fixture_only",
    authoredByPrincipalId: "fixture-agent-psmi",
    createdAt: asOf,
  });

  const scenarios = PSMI_SCENARIO_KINDS.map((kind, index) =>
    draftPrecisionResearchScenario({
      id: `hsi-psmi-scn-ssc-${index + 1}`,
      intelligenceSpec: spec,
      scenarioKind: kind,
      scenarioDefinition: `Fixture ${kind} research scenario for SSc evaluation.`,
      keyAssumptions: [
        "Fixture research assumption declared.",
        "Not a personalised treatment effect framing.",
      ],
      limitations: [
        "Research scenario only.",
        "Not clinical dosing.",
        "Specific-patient prediction not authorised unless separately validated.",
      ],
      authoredByPrincipalId: "fixture-agent-psmi",
      createdAt: asOf,
    }),
  );
  const primary = scenarios[0]!;

  const context = draftScenarioModelAndContext({
    id: "hsi-psmi-ctx-ssc-demo",
    intelligenceSpec: spec,
    precisionResearchScenario: primary,
    modelVersion: "fixture-model-v0.1.0",
    supportedBiologicalContext: "Fixture inflammatory pathway research context.",
    contextSummary: "Supported biological context for fixture scenario.",
    limitations: ["Context is research framing only.", "Fixture only."],
    authoredByPrincipalId: "fixture-agent-psmi",
    createdAt: asOf,
  });

  const outputs = draftScenarioPredictedOutputs({
    id: "hsi-psmi-out-ssc-demo",
    intelligenceSpec: spec,
    precisionResearchScenario: primary,
    predictedOutputs: [
      "Relative biomarker trajectory band under research assumptions.",
      "Comparative sensitivity ranking across sampling schedules.",
    ],
    outputsSummary:
      "Fixture predicted research outputs — not specific-patient prediction.",
    limitations: [
      "Predicted outputs are research envelopes only.",
      "Specific-patient prediction not authorised.",
    ],
    authoredByPrincipalId: "fixture-agent-psmi",
    createdAt: asOf,
  });

  const uncertainty = draftScenarioUncertaintySensitivity({
    id: "hsi-psmi-unc-ssc-demo",
    intelligenceSpec: spec,
    precisionResearchScenario: primary,
    uncertaintyOrdinal: "high_declared",
    sensitivityOrdinal: "moderate_declared",
    uncertaintySummary: "Fixture high uncertainty from sparse sampling.",
    sensitivitySummary: "Moderate sensitivity to sampling interval assumption.",
    sourcesOfUncertainty: ["sparse sampling", "fixture model version"],
    sensitivityDrivers: ["sampling interval", "assay noise band"],
    limitations: ["Uncertainty is research framing only.", "Fixture only."],
    authoredByPrincipalId: "fixture-agent-psmi",
    createdAt: asOf,
  });

  const validation = draftScenarioValidationRecommendation({
    id: "hsi-psmi-val-ssc-demo",
    intelligenceSpec: spec,
    precisionResearchScenario: primary,
    recommendedValidationSteps: [
      "Compare fixture outputs against authorised research cohort when available.",
    ],
    scenarioLimitations: ["Fixture scenario is not scientific validation."],
    validationSummary:
      "Recommended research validation steps — not a clinical order.",
    limitations: [
      "Research-only validation recommendations.",
      "Not a clinical order.",
    ],
    authoredByPrincipalId: "fixture-agent-psmi",
    createdAt: asOf,
  });

  const assessment = draftMissingInformationAssessmentEnvelope({
    id: "hsi-psmi-mia-ssc-demo",
    intelligenceSpec: spec,
    pcrmMissingInformationAssessmentId: "hsi-pcrm-mia-ssc-demo",
    missingMeasurementIds: ["fixture-meas-il6", "fixture-meas-crp-followup"],
    dataQualityGaps: ["Sparse follow-up inflammatory markers."],
    modelInputRequirements: ["Longitudinal inflammatory marker series required."],
    assessmentSummary:
      "Fixture missing-information assessment for research priorities.",
    limitations: [
      "Research measurement priorities only.",
      "Not clinical orders.",
    ],
    authoredByPrincipalId: "fixture-agent-psmi",
    createdAt: asOf,
  });

  const researchValue = draftMissingVariableResearchValue({
    id: "hsi-psmi-mrv-ssc-demo",
    intelligenceSpec: spec,
    missingInformationAssessment: assessment,
    missingVariableIds: ["fixture-meas-il6"],
    sensitivityToMissingVariables: "high_declared",
    sensitivitySummary:
      "High sensitivity to missing IL-6 follow-up under fixture assumptions.",
    infoValueStatus: "unquantifiable_declared",
    limitations: [
      "Info value unquantifiable — no invented probability.",
      "Research framing only.",
    ],
    authoredByPrincipalId: "fixture-agent-psmi",
    createdAt: asOf,
  });

  const followUp = draftFollowUpAndExperimentalValidation({
    id: "hsi-psmi-fuv-ssc-demo",
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
    authoredByPrincipalId: "fixture-agent-psmi",
    createdAt: asOf,
  });

  const draftBundle = draftPrecisionScenarioMissingInformationBundle({
    id: "hsi-psmi-bnd-ssc-demo",
    displayName: "Fixture SSc precision scenario missing-information bundle",
    intelligenceSpec: spec,
    bundleVersion: "0.1.0",
    limitations: [
      "Fixture precision scenario missing-information bundle — research decision support only.",
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
    authoredByPrincipalId: "fixture-agent-psmi",
    createdAt: asOf,
  });
  const underReview = transitionPrecisionScenarioMissingInformationBundle({
    bundle: draftBundle,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-psmi", actorKind: "ai_agent"},
  });
  const bundle = transitionPrecisionScenarioMissingInformationBundle({
    bundle: underReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const blockedBundle = draftPrecisionScenarioMissingInformationBundle({
    id: "hsi-psmi-bnd-blocked-demo",
    displayName: "Blocked precision scenario missing-information bundle",
    intelligenceSpec: blockedSpec,
    bundleVersion: "0.1.0",
    limitations: [
      "Blocked awaiting authorised research dataset — not scientific validation.",
      "Fixtures only until authorised dataset exists.",
    ],
    authoredByPrincipalId: "fixture-agent-psmi",
    createdAt: asOf,
  });

  const specs = [blockedSpec, spec];
  const pack = buildPrecisionScenarioMissingInformationPack({
    specs,
    precisionResearchScenarios: scenarios,
    scenarioModelAndContexts: [context],
    scenarioPredictedOutputs: [outputs],
    scenarioUncertaintySensitivities: [uncertainty],
    scenarioValidationRecommendations: [validation],
    missingInformationAssessments: [assessment],
    missingVariableResearchValues: [researchValue],
    followUpAndExperimentalValidations: [followUp],
    bundles: [blockedBundle, bundle],
    asOf,
  });
  const persistenceLines = projectPrecisionScenarioMissingInformationPersistenceLines({
    specs,
    precisionResearchScenarios: scenarios,
    scenarioModelAndContexts: [context],
    scenarioPredictedOutputs: [outputs],
    scenarioUncertaintySensitivities: [uncertainty],
    scenarioValidationRecommendations: [validation],
    missingInformationAssessments: [assessment],
    missingVariableResearchValues: [researchValue],
    followUpAndExperimentalValidations: [followUp],
    bundles: [blockedBundle, bundle],
  });

  return {pack, persistenceLines, blockedSpec};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blockedSpec} = fixturePack();
  writeFileSync(
    join(outDir, "precision-scenario-missing-information-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: PRECISION_SCENARIO_MISSING_INFORMATION_SCHEMA,
        method: PRECISION_SCENARIO_MISSING_INFORMATION_METHOD,
        version: PRECISION_SCENARIO_MISSING_INFORMATION_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked:
          blockedSpec.datasetAvailability ===
          "blocked_no_authorised_clinical_dataset",
        scientificPathBlockedNoAuthorisedDataset: true,
        capabilityKindCount: PSMI_CAPABILITY_KINDS.length,
        scenarioKindCount: PSMI_SCENARIO_KINDS.length,
        notPersonalisedTreatmentEffect: true,
        noClinicalDosing: true,
        notSpecificPatientPredictionUnlessValidated: true,
        researchMeasurementPrioritiesNotClinicalOrders: true,
        noInvasiveTestingWithoutGovernance: true,
        noInventedInfoGainProbabilities: true,
        notDigitalTwinProduct: true,
        notValidatedIndividualOutcomePrediction: true,
        liveMultiscaleEngineOperational: false,
        m11SimulationClaimed: false,
        phiIngestion: false,
        autonomousDiagnosisOrPrescribing: false,
        workbenchUi: false,
        graphPromotable: false,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        scenarioKindsCovered: pack.scenarioKindsCovered,
        quantifiableInfoValueCount: pack.quantifiableInfoValueCount,
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
    pack.precisionResearchScenarioCount !== 7 ||
    pack.scenarioModelAndContextCount !== 1 ||
    pack.scenarioPredictedOutputCount !== 1 ||
    pack.scenarioUncertaintySensitivityCount !== 1 ||
    pack.scenarioValidationRecommendationCount !== 1 ||
    pack.missingInformationAssessmentCount !== 1 ||
    pack.missingVariableResearchValueCount !== 1 ||
    pack.followUpAndExperimentalValidationCount !== 1 ||
    pack.bundleCount !== 2 ||
    pack.scenarioKindsCovered !== 7 ||
    pack.capabilityKindCount !== 8 ||
    pack.scenarioKindCount !== 7
  ) {
    throw new Error("Precision scenario missing-information pack check failed");
  }
  if (pack.honesty.notPersonalisedTreatmentEffect !== true) {
    throw new Error("Personalised treatment effect honesty gate failed");
  }
  if (pack.honesty.noClinicalDosing !== true) {
    throw new Error("Clinical dosing honesty gate failed");
  }
  if (pack.honesty.noInventedInfoGainProbabilities !== true) {
    throw new Error("Invented info-gain honesty gate failed");
  }
  if (pack.honesty.noInvasiveTestingWithoutGovernance !== true) {
    throw new Error("Invasive testing governance honesty gate failed");
  }
  if (
    blockedSpec.datasetAvailability !==
    "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `precision-scenario-missing-information-contracts check ok (${pack.specCount} specs, ${pack.bundleCount} bundles, ${pack.capabilityKindCount} capabilities, ${pack.scenarioKindsCovered} scenario kinds; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(
    `Wrote ${outDir}/precision-scenario-missing-information-pack.v1.json`,
  );
}
