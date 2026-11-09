/**
 * Milestone 14 / PR3 — longitudinal clinical evidence pack check.
 * Offline contracts only — no live PHI, fabricated trajectories, or causal claims.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  LONGITUDINAL_ANALYSIS_KINDS,
  LONGITUDINAL_CLINICAL_EVIDENCE_METHOD,
  LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA,
  LONGITUDINAL_CLINICAL_EVIDENCE_VERSION,
  buildLongitudinalClinicalEvidencePack,
  draftLongitudinalAnalysisResult,
  draftLongitudinalAnalysisSpec,
  draftLongitudinalObservationSeries,
  draftTemporalIntegrityCheck,
  fixtureTemporalAnchors,
  projectLongitudinalClinicalEvidencePersistenceLines,
  transitionLongitudinalAnalysisResult,
  transitionLongitudinalAnalysisSpec,
} from "../src/longitudinalClinicalEvidenceContracts";

const asOf = "2026-11-09T21:00:00.000Z";
const outDir = "evaluation/longitudinal-clinical-evidence";

function fixturePack() {
  const blocked = draftLongitudinalAnalysisSpec({
    id: "hsi-lce-spec-blocked-demo",
    analysisKind: "disease_trajectory",
    displayName: "Blocked disease trajectory until authorised dataset",
    scientificQuestion:
      "Blocked scientific path for disease trajectory until an authorised clinical dataset is supplied.",
    rweStudyId: "hsi-rwe-study-blocked-demo",
    subjectRefKind: "cohort_aggregate",
    subjectOrCohortRef: "cohort-blocked-awaiting-dataset",
    temporalAnchors: fixtureTemporalAnchors(asOf),
    observationIntervalKind: "unknown_interval",
    irregularIntervalNote: "Intervals unknown — authorised dataset not supplied",
    missingDataHandling: "explicitly_unresolved",
    missingDataNote: "Missingness unresolved without authorised dataset",
    eligibilityDefinitionTimeRole: "baseline_time",
    exposureDefinitionTimeRole: "treatment_initiation_time",
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "fixture-agent-lce",
    createdAt: asOf,
  });

  const draft = draftLongitudinalAnalysisSpec({
    id: "hsi-lce-spec-lab-trend-demo",
    analysisKind: "laboratory_trend",
    displayName: "Fixture laboratory trend envelope",
    scientificQuestion:
      "Fixture laboratory trend over irregular intervals — not causal identification.",
    rweStudyId: "hsi-rwe-study-fixture-demo",
    subjectRefKind: "cohort_aggregate",
    subjectOrCohortRef: "cohort-lce-fixture-demo",
    temporalAnchors: fixtureTemporalAnchors(asOf),
    observationIntervalKind: "irregular_declared",
    irregularIntervalNote: "Fixture irregular laboratory intervals",
    missingDataHandling: "declared_missing",
    missingDataNote: "Missing points declared in series",
    eligibilityDefinitionTimeRole: "baseline_time",
    exposureDefinitionTimeRole: "treatment_initiation_time",
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "fixture-agent-lce",
    createdAt: asOf,
    rweObservationIds: ["hsi-rwe-obs-fixture-demo"],
    rweExposureIds: ["hsi-rwe-exp-fixture-demo"],
    rweOutcomeIds: ["hsi-rwe-out-fixture-demo"],
    rweAnalysisId: "hsi-rwe-anl-fixture-demo",
    interopDataSourceId: "hsi-scdi-src-fhir-r4-demo",
    interopTemporalAlignmentId: "hsi-scdi-tmp-fixture-demo",
  });
  const underReview = transitionLongitudinalAnalysisSpec({
    spec: draft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-lce", actorKind: "ai_agent"},
  });
  const spec = transitionLongitudinalAnalysisSpec({
    spec: underReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const kindSpecs = LONGITUDINAL_ANALYSIS_KINDS.filter(
    (k) => k !== "laboratory_trend" && k !== "disease_trajectory",
  ).map((kind) =>
    draftLongitudinalAnalysisSpec({
      id: `hsi-lce-spec-${kind.replace(/_/g, "-").slice(0, 48)}`,
      analysisKind: kind,
      displayName: `Fixture ${kind} envelope`,
      scientificQuestion: `Fixture ${kind} contract exercise — observational only.`,
      rweStudyId: "hsi-rwe-study-fixture-demo",
      subjectRefKind: "cohort_aggregate",
      subjectOrCohortRef: `cohort-lce-${kind}`,
      temporalAnchors: fixtureTemporalAnchors(asOf),
      observationIntervalKind:
        kind === "follow_up_completeness" ? "sparse_declared" : "regular_declared",
      irregularIntervalNote:
        kind === "follow_up_completeness"
          ? "Sparse follow-up declared for completeness envelope"
          : null,
      missingDataHandling:
        kind === "follow_up_completeness"
          ? "complete_case_declared"
          : "imputation_not_performed",
      missingDataNote: "Missing-data handling declared for fixture",
      eligibilityDefinitionTimeRole: "baseline_time",
      exposureDefinitionTimeRole: "treatment_initiation_time",
      datasetAvailability: "fixture_only",
      authoredByPrincipalId: "fixture-agent-lce",
      createdAt: asOf,
    }),
  );

  const series = draftLongitudinalObservationSeries({
    id: "hsi-lce-ser-lab-demo",
    analysisSpec: spec,
    clinicalConcept: "Fixture CRP laboratory concept",
    authoredByPrincipalId: "fixture-agent-lce",
    createdAt: asOf,
    points: [
      {
        sequenceIndex: 0,
        intendedRole: "baseline_time",
        eventTime: "2024-01-15T00:00:00.000Z",
        recordCreationTime: "2024-01-15T06:00:00.000Z",
        ingestionTime: "2024-01-16T09:00:00.000Z",
        valueDeclared: "declared-fixture-baseline",
        unit: "mg/L",
        missingnessDeclared: false,
        intervalDaysFromPrior: null,
        note: "Baseline",
      },
      {
        sequenceIndex: 1,
        intendedRole: "follow_up_time",
        eventTime: "2024-06-15T00:00:00.000Z",
        recordCreationTime: "2024-06-15T08:00:00.000Z",
        ingestionTime: "2024-06-16T09:00:00.000Z",
        valueDeclared: null,
        unit: null,
        missingnessDeclared: true,
        intervalDaysFromPrior: 152,
        note: "Missing follow-up declared",
      },
    ],
  });

  const temporalCheck = draftTemporalIntegrityCheck({
    id: "hsi-lce-tmp-demo",
    analysisSpec: spec,
    authoredByPrincipalId: "fixture-agent-lce",
    createdAt: asOf,
  });

  const resultDraft = draftLongitudinalAnalysisResult({
    id: "hsi-lce-res-lab-demo",
    analysisSpec: spec,
    temporalCheck,
    summary:
      "Fixture laboratory trend envelope — descriptive association only",
    limitations: [
      "Observational trajectory only — confounding unresolved; not a proven treatment effect.",
      "Irregular intervals and declared missingness limit interpretation.",
    ],
    trajectoryNarrative:
      "Declared fixture narrative of irregular laboratory follow-up",
    authoredByPrincipalId: "fixture-agent-lce",
    createdAt: asOf,
  });
  const resultReviewed = transitionLongitudinalAnalysisResult({
    result: resultDraft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-lce", actorKind: "ai_agent"},
  });
  const result = transitionLongitudinalAnalysisResult({
    result: resultReviewed,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const specs = [blocked, spec, ...kindSpecs];
  const pack = buildLongitudinalClinicalEvidencePack({
    specs,
    series: [series],
    temporalChecks: [temporalCheck],
    results: [result],
    asOf,
  });
  const persistenceLines = projectLongitudinalClinicalEvidencePersistenceLines({
    specs,
    series: [series],
    temporalChecks: [temporalCheck],
    results: [result],
  });

  return {pack, persistenceLines, blocked};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blocked} = fixturePack();
  writeFileSync(
    join(outDir, "longitudinal-clinical-evidence-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: LONGITUDINAL_CLINICAL_EVIDENCE_SCHEMA,
        method: LONGITUDINAL_CLINICAL_EVIDENCE_METHOD,
        version: LONGITUDINAL_CLINICAL_EVIDENCE_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked: blocked.datasetAvailability,
        scientificPathBlockedNoAuthorisedDataset: true,
        unrestrictedCentralPatientDatabase: false,
        observationalTrajectoryIsNotProvenTreatmentEffect: true,
        noFutureInformationForEarlierExposureOrEligibility: true,
        temporalRolesDistinct: true,
        irregularIntervalsAndMissingDataExplicit: true,
        identifiableOutsideKg: true,
        pseudonymisedMayStillBePersonalData: true,
        phiIngestion: false,
        inventedPatientCounts: false,
        inventedEffectEstimates: false,
        inventedSurvivalCurves: false,
        fabricatedTrajectories: false,
        liveLongitudinalEngine: false,
        workbenchUi: false,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        analysisKindCount: LONGITUDINAL_ANALYSIS_KINDS.length,
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
  if (pack.specCount < 8 || pack.resultCount !== 1) {
    throw new Error("Longitudinal clinical evidence pack check failed");
  }
  if (pack.honesty.noUnrestrictedCentralPatientDatabase !== true) {
    throw new Error("Honesty gate failed");
  }
  if (
    pack.honesty.noFutureInformationForEarlierExposureOrEligibility !== true
  ) {
    throw new Error("Temporal leakage honesty gate failed");
  }
  if (
    blocked.datasetAvailability !== "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `longitudinal-clinical-evidence-contracts check ok (${pack.specCount} specs, ${pack.seriesCount} series, ${pack.resultCount} results; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(`Wrote ${outDir}/longitudinal-clinical-evidence-pack.v1.json`);
}
