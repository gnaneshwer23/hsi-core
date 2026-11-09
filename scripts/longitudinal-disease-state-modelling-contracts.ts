/**
 * Milestone 15 / PR3 — longitudinal disease state modelling pack check.
 * Offline contracts only — no PHI, twin, clinical care, or invented continuous
 * trajectories across clinically meaningful gaps.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  LDSM_MODELLING_KINDS,
  LONGITUDINAL_DISEASE_STATE_METHOD,
  LONGITUDINAL_DISEASE_STATE_SCHEMA,
  LONGITUDINAL_DISEASE_STATE_VERSION,
  buildLongitudinalDiseaseStatePack,
  draftBaselineFollowUpComparison,
  draftBiomarkerTrajectory,
  draftClinicalEventTimeline,
  draftDiseaseStateTransition,
  draftDiseaseTrajectoryReconstruction,
  draftLdsmTemporalIntegrityCheck,
  draftLongitudinalDiseaseStateModel,
  draftLongitudinalDiseaseStateSpec,
  draftMissingDataAnalysis,
  draftOrganSpecificOutcomeTrend,
  draftTreatmentExposureContext,
  fixtureLdsmTemporalAnchors,
  projectLongitudinalDiseaseStatePersistenceLines,
  transitionLongitudinalDiseaseStateModel,
} from "../src/longitudinalDiseaseStateModellingContracts";

const asOf = "2026-11-09T23:30:00.000Z";
const outDir = "evaluation/longitudinal-disease-state";

function sparsePoints() {
  return [
    {
      sequenceIndex: 0,
      measurementTime: "2024-01-15T10:00:00.000Z",
      eventTime: "2024-01-15T09:30:00.000Z",
      ingestionTime: "2024-01-16T08:00:00.000Z",
      valueDeclared: "baseline-declared",
      unit: "fixture-unit",
      missingnessDeclared: false,
      intervalDaysFromPrior: null,
      crossesClinicallyMeaningfulGap: false,
      interpolated: false as const,
      note: "Baseline fixture point",
    },
    {
      sequenceIndex: 1,
      measurementTime: "2024-06-15T10:00:00.000Z",
      eventTime: null,
      ingestionTime: "2024-06-16T08:00:00.000Z",
      valueDeclared: "follow-up-declared",
      unit: "fixture-unit",
      missingnessDeclared: false,
      intervalDaysFromPrior: 152,
      crossesClinicallyMeaningfulGap: true,
      interpolated: false as const,
      note: "Follow-up after clinically meaningful gap — discrete only",
    },
  ];
}

function fixturePack() {
  const blockedSpec = draftLongitudinalDiseaseStateSpec({
    id: "hsi-ldsm-spec-blocked-demo",
    modellingKind: "disease_state_transition",
    displayName: "Blocked disease-state modelling until authorised dataset",
    scientificQuestion:
      "Blocked scientific path for disease-state transitions until an authorised clinical dataset is supplied.",
    diseaseContextId: "hsi-hdi-ctx-blocked-demo",
    subjectRefKind: "cohort_aggregate",
    subjectOrCohortRef: "cohort-ldsm-blocked",
    temporalAnchors: fixtureLdsmTemporalAnchors(asOf),
    observationIntervalKind: "unknown_interval",
    missingDataHandling: "explicitly_unresolved",
    gapPolicy: "gap_recorded_uncertainty_preserved",
    eligibilityDefinitionTimeRole: "baseline_time",
    exposureDefinitionTimeRole: "event_time",
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const spec = draftLongitudinalDiseaseStateSpec({
    id: "hsi-ldsm-spec-ssc-demo",
    modellingKind: "disease_trajectory_reconstruction",
    displayName: "Fixture SSc longitudinal disease-state modelling spec",
    scientificQuestion:
      "How do declared fixture disease-state observations change over irregular follow-up without inventing continuous trajectories or proven treatment effects?",
    diseaseContextId: "hsi-hdi-ctx-ssc-demo",
    integratedDiseaseContextId: "hsi-cbc-idc-ssc-demo",
    rweStudyId: "hsi-rwe-study-fixture-demo",
    longitudinalAnalysisSpecId: "hsi-lce-spec-lab-trend-demo",
    subjectRefKind: "pseudonymous_subject",
    subjectOrCohortRef: "pseudo-subj-ldsm-demo",
    temporalAnchors: fixtureLdsmTemporalAnchors(asOf),
    observationIntervalKind: "sparse_declared",
    irregularFollowUpNote:
      "Fixture follow-up is sparse; clinically meaningful gaps declared without continuous fill.",
    missingDataHandling: "uncertainty_preserved_sparse",
    gapPolicy: "no_interpolation_across_gap",
    clinicallyMeaningfulGapDays: 90,
    eligibilityDefinitionTimeRole: "baseline_time",
    exposureDefinitionTimeRole: "event_time",
    datasetAvailability: "fixture_only",
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const trajectory = draftDiseaseTrajectoryReconstruction({
    id: "hsi-ldsm-trj-ssc-demo",
    modellingSpec: spec,
    clinicalConcept: "Fixture disease activity score",
    points: sparsePoints(),
    uncertaintyOrdinal: "high_sparse_preserved",
    hdiObservationIds: ["hsi-hdi-obs-crp-demo"],
    longitudinalSeriesId: "hsi-lce-ser-lab-demo",
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const comparison = draftBaselineFollowUpComparison({
    id: "hsi-ldsm-cmp-ssc-demo",
    modellingSpec: spec,
    clinicalConcept: "Fixture FVC percent predicted",
    baselineTime: "2024-01-15T10:00:00.000Z",
    followUpTime: "2024-06-15T10:00:00.000Z",
    baselineValueDeclared: "72",
    followUpValueDeclared: "68",
    comparisonSummary:
      "Fixture baseline vs follow-up FVC comparison under declared limitations — not a proven treatment effect.",
    uncertaintyOrdinal: "high_sparse_preserved",
    hdiObservationIds: ["hsi-hdi-obs-fvc-demo"],
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const timeline = draftClinicalEventTimeline({
    id: "hsi-ldsm-evt-ssc-demo",
    modellingSpec: spec,
    entries: [
      {
        sequenceIndex: 0,
        eventTime: "2024-03-10T11:30:00.000Z",
        measurementTime: "2024-03-10T12:00:00.000Z",
        ingestionTime: "2024-03-11T08:00:00.000Z",
        eventLabel: "Fixture clinic visit",
        missingnessDeclared: false,
        note: "Event/measurement/ingestion times distinct",
      },
    ],
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const organ = draftOrganSpecificOutcomeTrend({
    id: "hsi-ldsm-org-lung-demo",
    modellingSpec: spec,
    organSystem: "pulmonary",
    outcomeConcept: "Fixture FVC trend",
    trendSummary:
      "Fixture organ-specific FVC trend with sparse uncertainty preserved — no invented continuous curve.",
    uncertaintyOrdinal: "high_sparse_preserved",
    rweOutcomeId: "hsi-rwe-out-fixture-demo",
    longitudinalSeriesId: "hsi-lce-ser-lab-demo",
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const exposure = draftTreatmentExposureContext({
    id: "hsi-ldsm-exp-mmf-demo",
    modellingSpec: spec,
    exposureConcept: "Fixture mycophenolate exposure context",
    exposureStartTime: "2024-02-01T00:00:00.000Z",
    exposureEndTime: "2024-06-01T00:00:00.000Z",
    exposureSummary:
      "Fixture treatment exposure context for research framing only — not a prescribing directive.",
    rweExposureId: "hsi-rwe-exp-fixture-demo",
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const biomarker = draftBiomarkerTrajectory({
    id: "hsi-ldsm-bio-crp-demo",
    modellingSpec: spec,
    biomarkerConcept: "Fixture CRP laboratory concept",
    points: sparsePoints(),
    uncertaintyOrdinal: "high_sparse_preserved",
    hdiObservationIds: ["hsi-hdi-obs-crp-demo"],
    longitudinalSeriesId: "hsi-lce-ser-lab-demo",
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const missing = draftMissingDataAnalysis({
    id: "hsi-ldsm-mis-ssc-demo",
    modellingSpec: spec,
    missingConcepts: ["Fixture DLCO", "Fixture skin score"],
    analysisSummary:
      "Missing concepts recorded without inventing values; sparse uncertainty preserved.",
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const observedTxn = draftDiseaseStateTransition({
    id: "hsi-ldsm-txn-obs-demo",
    modellingSpec: spec,
    fromStateLabel: "Fixture stable research state",
    toStateLabel: "Fixture progressed research state",
    transitionTime: "2024-06-15T10:00:00.000Z",
    transitionConfidence: "low",
    epistemicStatus: "observed",
    hdiObservationId: "hsi-hdi-obs-crp-demo",
    limitations: [
      "Observed transition envelope only — not clinical care.",
      "Observed is not inferred.",
    ],
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const inferredTxn = draftDiseaseStateTransition({
    id: "hsi-ldsm-txn-inf-demo",
    modellingSpec: spec,
    fromStateLabel: "Fixture latent state A",
    toStateLabel: "Fixture latent state B",
    transitionConfidence: "insufficient",
    epistemicStatus: "inferred",
    hdiEstimateId: "hsi-hdi-est-demo",
    limitations: [
      "Inferred transition research envelope only.",
      "Not a diagnosis or clinical care directive.",
    ],
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const check = draftLdsmTemporalIntegrityCheck({
    id: "hsi-ldsm-tmp-ssc-demo",
    modellingSpec: spec,
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const draftModel = draftLongitudinalDiseaseStateModel({
    id: "hsi-ldsm-mdl-ssc-demo",
    displayName: "Fixture longitudinal SSc disease-state model",
    modellingSpec: spec,
    modelVersion: "0.1.0",
    limitations: [
      "Fixture disease-state model only — not clinical care.",
      "Observed is not inferred; observational trajectory is not a proven treatment effect.",
      "No invented continuous trajectories across clinically meaningful gaps.",
    ],
    trajectories: [trajectory],
    baselineFollowUps: [comparison],
    eventTimelines: [timeline],
    organTrends: [organ],
    treatmentExposures: [exposure],
    biomarkerTrajectories: [biomarker],
    missingDataAnalyses: [missing],
    stateTransitions: [observedTxn, inferredTxn],
    temporalChecks: [check],
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });
  const underReview = transitionLongitudinalDiseaseStateModel({
    model: draftModel,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-ldsm", actorKind: "ai_agent"},
  });
  const model = transitionLongitudinalDiseaseStateModel({
    model: underReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const blockedModel = draftLongitudinalDiseaseStateModel({
    id: "hsi-ldsm-mdl-blocked-demo",
    displayName: "Blocked longitudinal disease-state model",
    modellingSpec: blockedSpec,
    modelVersion: "0.1.0",
    limitations: [
      "Blocked awaiting authorised research dataset — not scientific validation.",
      "Not clinical care; fixtures only.",
    ],
    authoredByPrincipalId: "fixture-agent-ldsm",
    createdAt: asOf,
  });

  const specs = [blockedSpec, spec];
  const pack = buildLongitudinalDiseaseStatePack({
    specs,
    trajectories: [trajectory],
    baselineFollowUps: [comparison],
    eventTimelines: [timeline],
    organTrends: [organ],
    treatmentExposures: [exposure],
    biomarkerTrajectories: [biomarker],
    missingDataAnalyses: [missing],
    stateTransitions: [observedTxn, inferredTxn],
    temporalChecks: [check],
    models: [blockedModel, model],
    asOf,
  });
  const persistenceLines = projectLongitudinalDiseaseStatePersistenceLines({
    specs,
    trajectories: [trajectory],
    baselineFollowUps: [comparison],
    eventTimelines: [timeline],
    organTrends: [organ],
    treatmentExposures: [exposure],
    biomarkerTrajectories: [biomarker],
    missingDataAnalyses: [missing],
    stateTransitions: [observedTxn, inferredTxn],
    temporalChecks: [check],
    models: [blockedModel, model],
  });

  return {pack, persistenceLines, blockedSpec};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blockedSpec} = fixturePack();
  writeFileSync(
    join(outDir, "longitudinal-disease-state-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: LONGITUDINAL_DISEASE_STATE_SCHEMA,
        method: LONGITUDINAL_DISEASE_STATE_METHOD,
        version: LONGITUDINAL_DISEASE_STATE_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked:
          blockedSpec.datasetAvailability ===
          "blocked_no_authorised_clinical_dataset",
        scientificPathBlockedNoAuthorisedDataset: true,
        modellingKindCount: LDSM_MODELLING_KINDS.length,
        observedIsNotInferred: true,
        noFutureDataLeakage: true,
        uncertaintyPreservedWhenSparse: true,
        noInventedContinuousTrajectoryAcrossGaps: true,
        notClinicalCare: true,
        phiIngestion: false,
        liveTwinOrMultiscale: false,
        autonomousDiagnosisOrPrescribing: false,
        fabricatedDiseaseTimelines: false,
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
    pack.trajectoryCount !== 1 ||
    pack.baselineFollowUpCount !== 1 ||
    pack.eventTimelineCount !== 1 ||
    pack.organTrendCount !== 1 ||
    pack.treatmentExposureCount !== 1 ||
    pack.biomarkerTrajectoryCount !== 1 ||
    pack.missingDataAnalysisCount !== 1 ||
    pack.stateTransitionCount !== 2 ||
    pack.temporalCheckCount !== 1 ||
    pack.modelCount !== 2 ||
    pack.modellingKindCount !== 8
  ) {
    throw new Error("Longitudinal disease state modelling pack check failed");
  }
  if (pack.honesty.observedIsNotInferred !== true) {
    throw new Error("Observed≠inferred honesty gate failed");
  }
  if (pack.honesty.noFutureDataLeakage !== true) {
    throw new Error("Future-data leakage honesty gate failed");
  }
  if (pack.honesty.noInventedContinuousTrajectoryAcrossGaps !== true) {
    throw new Error("Gap interpolation honesty gate failed");
  }
  if (pack.honesty.notClinicalCare !== true) {
    throw new Error("Not-clinical-care honesty gate failed");
  }
  if (pack.honesty.noLiveTwinOrMultiscaleClaim !== true) {
    throw new Error("Live twin / multiscale honesty gate failed");
  }
  if (
    blockedSpec.datasetAvailability !==
    "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `longitudinal-disease-state-modelling-contracts check ok (${pack.specCount} specs, ${pack.modelCount} models, ${pack.stateTransitionCount} transitions, ${pack.modellingKindCount} kinds; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(`Wrote ${outDir}/longitudinal-disease-state-pack.v1.json`);
}
