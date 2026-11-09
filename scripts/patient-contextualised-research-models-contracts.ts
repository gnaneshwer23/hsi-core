/**
 * Milestone 15 / PR6 — patient-contextualised research models pack check.
 * Offline contracts only — no PHI, twin, CDS, treatment recommendations,
 * or complete biological replica claims; out-of-scope outside validated domain.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  PCRM_CAPABILITY_KINDS,
  PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
  PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
  PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
  buildPatientContextualisedResearchModelsPack,
  draftAuditHistoryRecord,
  draftAuthorisedLongitudinalInput,
  draftDiseaseStateEstimation,
  draftMissingInformationAssessment,
  draftModelApplicabilityCheck,
  draftPatientContextualisedResearchBundle,
  draftPatientContextualisedResearchSpec,
  draftResearchOnlyInterpretation,
  draftUncertaintyEstimation,
  draftVersionedObservationSet,
  projectPatientContextualisedResearchModelsPersistenceLines,
  transitionPatientContextualisedResearchBundle,
} from "../src/patientContextualisedResearchModelsContracts";

const asOf = "2026-11-09T15:00:00.000Z";
const outDir = "evaluation/patient-contextualised-research-models";

function fixturePack() {
  const blockedSpec = draftPatientContextualisedResearchSpec({
    id: "hsi-pcrm-spec-blocked-demo",
    displayName:
      "Blocked patient-contextualised research until authorised dataset",
    scientificQuestion:
      "Blocked scientific path for patient-contextualised research models until an authorised clinical dataset is supplied.",
    diseaseContextId: "hsi-hdi-ctx-blocked-demo",
    digitalPatientModelId: "hsi-hdi-dpm-blocked-demo",
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });

  const spec = draftPatientContextualisedResearchSpec({
    id: "hsi-pcrm-spec-ssc-demo",
    displayName: "Fixture SSc patient-contextualised research model spec",
    scientificQuestion:
      "How can a bounded individual-context research representation declare authorised longitudinal input, versioned observations, disease-state estimation, applicability, missing information, uncertainty, research-only interpretation, and audit history while keeping research envelopes distinct from replica or care claims?",
    diseaseContextId: "hsi-hdi-ctx-ssc-demo",
    digitalPatientModelId: "hsi-hdi-dpm-ssc-demo",
    populationModellingSpecId: "hsi-pcdm-spec-ssc-demo",
    integratedDiseaseContextId: "hsi-cbc-idc-ssc-demo",
    longitudinalModellingSpecId: "hsi-ldsm-spec-ssc-demo",
    crossScaleOntologySpecId: "hsi-csol-spec-ssc-demo",
    cohortDefinitionId: "hsi-rcb-coh-ssc-demo",
    rweStudyId: "hsi-rwe-study-ssc-demo",
    longitudinalClinicalEvidenceSpecId: "hsi-lce-spec-ssc-demo",
    datasetAvailability: "fixture_only",
    authoredByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });

  const ali = draftAuthorisedLongitudinalInput({
    id: "hsi-pcrm-ali-ssc-demo",
    researchSpec: spec,
    authorisationStatus: "fixture_declared",
    longitudinalSourceSummary:
      "Fixture authorised longitudinal input envelope for research representation only.",
    linkedObservationRefIds: [
      "hsi-hdi-obs-ssc-baseline",
      "hsi-hdi-obs-ssc-followup",
    ],
    limitations: [
      "Fixture longitudinal input is not an authorised clinical feed.",
      "Not a complete biological replica.",
    ],
    authoredByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });

  const vos = draftVersionedObservationSet({
    id: "hsi-pcrm-vos-ssc-demo",
    researchSpec: spec,
    authorisedLongitudinalInput: ali,
    observationSetVersion: "0.1.0",
    observationRefIds: [
      "hsi-hdi-obs-ssc-baseline",
      "hsi-hdi-obs-ssc-followup",
    ],
    versionNote: "Fixture versioned observation set v0.1.0.",
    limitations: [
      "Versioned observation set is research framing only.",
      "Observed facts stay distinct from inferred estimates.",
    ],
    authoredByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });

  const estimation = draftDiseaseStateEstimation({
    id: "hsi-pcrm-est-ssc-demo",
    researchSpec: spec,
    versionedObservationSet: vos,
    estimateMethodOrdinal: "population_model_conditioned_declared",
    estimateSummary:
      "Fixture inferred disease-state estimate conditioned on population model envelopes — research only.",
    limitations: [
      "Population association is not individual truth.",
      "Inferred estimate is not an observed fact.",
      "Not a treatment recommendation.",
    ],
    authoredByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });

  const applicabilityOk = draftModelApplicabilityCheck({
    id: "hsi-pcrm-app-ssc-partial",
    researchSpec: spec,
    applicabilityOutcome: "partial_with_limitations",
    applicabilitySummary:
      "Fixture partial applicability declared with research limitations.",
    limitations: [
      "Partial applicability is not clinical authorisation.",
      "Research-only framing.",
    ],
    authoredByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });

  const applicabilityOos = draftModelApplicabilityCheck({
    id: "hsi-pcrm-app-ssc-oos",
    researchSpec: spec,
    applicabilityOutcome: "out_of_scope_outside_validated_population",
    applicabilitySummary:
      "Fixture subject context sits outside the validated population domain for the linked population model.",
    limitations: [
      "Out-of-scope outside validated population — research representation only.",
      "Not clinical care.",
    ],
    authoredByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });

  const missing = draftMissingInformationAssessment({
    id: "hsi-pcrm-mis-ssc-demo",
    researchSpec: spec,
    versionedObservationSet: vos,
    missingInfoStatus: "partial_declared",
    missingDomainsDeclared: ["organ imaging follow-up", "biomarker panel"],
    assessmentSummary:
      "Fixture missing-information assessment without inventing values.",
    limitations: [
      "Missing information must not be invented.",
      "Fixture research only.",
    ],
    authoredByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });

  const uncertainty = draftUncertaintyEstimation({
    id: "hsi-pcrm-unc-ssc-demo",
    researchSpec: spec,
    diseaseStateEstimation: estimation,
    uncertaintyOrdinal: "high_declared",
    uncertaintySummary:
      "Fixture high uncertainty declared from sparse observations and exploratory method.",
    sourcesOfUncertainty: [
      "sparse observation coverage",
      "population-conditioned estimate limitations",
    ],
    limitations: [
      "Uncertainty estimation is research framing only.",
      "Not clinical care.",
    ],
    authoredByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });

  const interpretation = draftResearchOnlyInterpretation({
    id: "hsi-pcrm-int-ssc-demo",
    researchSpec: spec,
    diseaseStateEstimation: estimation,
    modelApplicabilityCheck: applicabilityOk,
    missingInformationAssessment: missing,
    uncertaintyEstimation: uncertainty,
    interpretationSummary:
      "Fixture research-only interpretation under partial applicability and high uncertainty.",
    limitations: [
      "Research-only interpretation.",
      "Not a treatment recommendation.",
      "Not clinical care without separate validation.",
    ],
    authoredByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });

  const audit = draftAuditHistoryRecord({
    id: "hsi-pcrm-aud-ssc-demo",
    researchSpec: spec,
    subjectRecordId: interpretation.id,
    subjectRecordKind: "research_only_interpretation",
    action: "created",
    actionSummary: "Created fixture research-only interpretation record.",
    performedByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });

  const draftBundle = draftPatientContextualisedResearchBundle({
    id: "hsi-pcrm-bnd-ssc-demo",
    displayName: "Fixture SSc patient-contextualised research bundle",
    researchSpec: spec,
    bundleVersion: "0.1.0",
    limitations: [
      "Fixture patient-contextualised research bundle — research decision support only.",
      "Not a complete biological replica.",
      "Not a treatment recommendation.",
      "Out-of-scope outside validated domain is preserved.",
    ],
    authorisedLongitudinalInputs: [ali],
    versionedObservationSets: [vos],
    diseaseStateEstimations: [estimation],
    modelApplicabilityChecks: [applicabilityOk, applicabilityOos],
    missingInformationAssessments: [missing],
    uncertaintyEstimations: [uncertainty],
    researchOnlyInterpretations: [interpretation],
    auditHistoryRecords: [audit],
    authoredByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });
  const underReview = transitionPatientContextualisedResearchBundle({
    bundle: draftBundle,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-pcrm", actorKind: "ai_agent"},
  });
  const bundle = transitionPatientContextualisedResearchBundle({
    bundle: underReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const blockedBundle = draftPatientContextualisedResearchBundle({
    id: "hsi-pcrm-bnd-blocked-demo",
    displayName: "Blocked patient-contextualised research bundle",
    researchSpec: blockedSpec,
    bundleVersion: "0.1.0",
    limitations: [
      "Blocked awaiting authorised research dataset — not scientific validation.",
      "Not a digital twin product; fixtures only.",
    ],
    authoredByPrincipalId: "fixture-agent-pcrm",
    createdAt: asOf,
  });

  const specs = [blockedSpec, spec];
  const pack = buildPatientContextualisedResearchModelsPack({
    specs,
    authorisedLongitudinalInputs: [ali],
    versionedObservationSets: [vos],
    diseaseStateEstimations: [estimation],
    modelApplicabilityChecks: [applicabilityOk, applicabilityOos],
    missingInformationAssessments: [missing],
    uncertaintyEstimations: [uncertainty],
    researchOnlyInterpretations: [interpretation],
    auditHistoryRecords: [audit],
    bundles: [blockedBundle, bundle],
    asOf,
  });
  const persistenceLines =
    projectPatientContextualisedResearchModelsPersistenceLines({
      specs,
      authorisedLongitudinalInputs: [ali],
      versionedObservationSets: [vos],
      diseaseStateEstimations: [estimation],
      modelApplicabilityChecks: [applicabilityOk, applicabilityOos],
      missingInformationAssessments: [missing],
      uncertaintyEstimations: [uncertainty],
      researchOnlyInterpretations: [interpretation],
      auditHistoryRecords: [audit],
      bundles: [blockedBundle, bundle],
    });

  return {pack, persistenceLines, blockedSpec};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blockedSpec} = fixturePack();
  writeFileSync(
    join(outDir, "patient-contextualised-research-models-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_SCHEMA,
        method: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_METHOD,
        version: PATIENT_CONTEXTUALISED_RESEARCH_MODELS_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked:
          blockedSpec.datasetAvailability ===
          "blocked_no_authorised_clinical_dataset",
        scientificPathBlockedNoAuthorisedDataset: true,
        capabilityKindCount: PCRM_CAPABILITY_KINDS.length,
        notCompleteBiologicalReplica: true,
        notDigitalTwinProduct: true,
        notTreatmentRecommendation: true,
        notClinicalCareWithoutSeparateValidation: true,
        outOfScopeOutsideValidatedDomain: true,
        populationAssociationIsNotIndividualTruth: true,
        observedIsNotInferred: true,
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
    pack.authorisedLongitudinalInputCount !== 1 ||
    pack.versionedObservationSetCount !== 1 ||
    pack.diseaseStateEstimationCount !== 1 ||
    pack.modelApplicabilityCheckCount !== 2 ||
    pack.missingInformationAssessmentCount !== 1 ||
    pack.uncertaintyEstimationCount !== 1 ||
    pack.researchOnlyInterpretationCount !== 1 ||
    pack.auditHistoryRecordCount !== 1 ||
    pack.bundleCount !== 2 ||
    pack.outOfScopeApplicabilityCount !== 1 ||
    pack.capabilityKindCount !== 8
  ) {
    throw new Error(
      "Patient-contextualised research models pack check failed",
    );
  }
  if (pack.honesty.notCompleteBiologicalReplica !== true) {
    throw new Error("Not-complete-biological-replica honesty gate failed");
  }
  if (pack.honesty.notTreatmentRecommendation !== true) {
    throw new Error("Not-treatment-recommendation honesty gate failed");
  }
  if (pack.honesty.outOfScopeOutsideValidatedDomain !== true) {
    throw new Error("Out-of-scope honesty gate failed");
  }
  if (pack.honesty.notDigitalTwinProduct !== true) {
    throw new Error("Not-digital-twin honesty gate failed");
  }
  if (
    blockedSpec.datasetAvailability !==
    "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `patient-contextualised-research-models-contracts check ok (${pack.specCount} specs, ${pack.bundleCount} bundles, ${pack.capabilityKindCount} capabilities, ${pack.outOfScopeApplicabilityCount} out-of-scope; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(
    `Wrote ${outDir}/patient-contextualised-research-models-pack.v1.json`,
  );
}
