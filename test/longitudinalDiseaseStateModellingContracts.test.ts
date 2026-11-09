/**
 * Milestone 15 PR3 — longitudinal disease state modelling honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  LDSM_MODELLING_KINDS,
  LDSM_TEMPORAL_ROLES,
  buildLongitudinalDiseaseStatePack,
  createMemoryLongitudinalDiseaseStateStore,
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
  evaluateLdsmTemporalIntegrity,
  fingerprintLongitudinalDiseaseStateModel,
  fixtureLdsmTemporalAnchors,
  projectLongitudinalDiseaseStatePersistenceLines,
  transitionLongitudinalDiseaseStateModel,
  transitionLongitudinalDiseaseStateSpec,
  type LongitudinalDiseaseStateSpec,
  type LdsmTemporalAnchorSet,
} from "../src/longitudinalDiseaseStateModellingContracts";

const asOf = "2026-11-09T23:30:00.000Z";

function seedFixtureSpec(
  overrides?: Partial<Parameters<typeof draftLongitudinalDiseaseStateSpec>[0]>,
): LongitudinalDiseaseStateSpec {
  return draftLongitudinalDiseaseStateSpec({
    id: "hsi-ldsm-spec-ssc-fixture",
    modellingKind: "disease_trajectory_reconstruction",
    displayName: "Fixture SSc longitudinal disease-state modelling spec",
    scientificQuestion:
      "How do declared fixture disease-state observations change over irregular follow-up without inventing continuous trajectories or proven treatment effects?",
    diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
    integratedDiseaseContextId: "hsi-cbc-idc-ssc-fixture",
    rweStudyId: "hsi-rwe-study-fixture-demo",
    longitudinalAnalysisSpecId: "hsi-lce-spec-lab-trend-fixture",
    subjectRefKind: "pseudonymous_subject",
    subjectOrCohortRef: "pseudo-subj-ldsm-demo",
    temporalAnchors: fixtureLdsmTemporalAnchors(asOf),
    observationIntervalKind: "irregular_declared",
    irregularFollowUpNote:
      "Fixture follow-up is irregular; clinically meaningful gaps declared without continuous fill.",
    missingDataHandling: "uncertainty_preserved_sparse",
    gapPolicy: "no_interpolation_across_gap",
    clinicallyMeaningfulGapDays: 90,
    eligibilityDefinitionTimeRole: "baseline_time",
    exposureDefinitionTimeRole: "event_time",
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "agent-hsi-ldsm-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    ...overrides,
  });
}

function seedBlockedSpec(): LongitudinalDiseaseStateSpec {
  return draftLongitudinalDiseaseStateSpec({
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
    authoredByPrincipalId: "agent-hsi-ldsm-1",
    createdAt: asOf,
  });
}

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
      note: "Follow-up after clinically meaningful gap — discrete only, not interpolated",
    },
  ];
}

describe("longitudinal disease state modelling contracts (M15 PR3)", () => {
  test("supports all modelling kinds with distinct temporal roles and HDI/CBC/LCE links", () => {
    expect(LDSM_MODELLING_KINDS).toHaveLength(8);
    expect(LDSM_TEMPORAL_ROLES).toContain("event_time");
    expect(LDSM_TEMPORAL_ROLES).toContain("measurement_time");
    expect(LDSM_TEMPORAL_ROLES).toContain("ingestion_time");
    expect(LDSM_TEMPORAL_ROLES).toContain("prediction_time");

    const spec = seedFixtureSpec();
    expect(spec.honesty.observedIsNotInferred).toBe(true);
    expect(spec.honesty.noFutureDataLeakage).toBe(true);
    expect(spec.honesty.noInventedContinuousTrajectoryAcrossGaps).toBe(true);
    expect(spec.honesty.notClinicalCare).toBe(true);
    expect(spec.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(spec.diseaseContextId).toBe("hsi-hdi-ctx-ssc-fixture");
    expect(spec.integratedDiseaseContextId).toBe("hsi-cbc-idc-ssc-fixture");
    expect(spec.longitudinalAnalysisSpecId).toBe(
      "hsi-lce-spec-lab-trend-fixture",
    );
    expect(spec.liveLongitudinalEngineOperational).toBe(false);
    expect(spec.containsIdentifiablePhi).toBe(false);

    for (const kind of LDSM_MODELLING_KINDS) {
      const drafted = seedFixtureSpec({
        id: `hsi-ldsm-spec-${kind.replace(/_/g, "-").slice(0, 40)}`,
        modellingKind: kind,
      });
      expect(drafted.modellingKind).toBe(kind);
    }
  });

  test("fail-closed refuses future-data leakage and prediction-before-measurement", () => {
    const anchors = fixtureLdsmTemporalAnchors(asOf);
    expect(() =>
      draftLongitudinalDiseaseStateSpec({
        id: "hsi-ldsm-spec-leak-eligibility",
        modellingKind: "baseline_follow_up_comparison",
        displayName: "Leakage eligibility fixture",
        scientificQuestion: "Must refuse follow-up as eligibility definition time.",
        diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
        subjectRefKind: "pseudonymous_subject",
        subjectOrCohortRef: "pseudo-subj-ldsm-leak",
        temporalAnchors: anchors,
        observationIntervalKind: "irregular_declared",
        irregularFollowUpNote: "Irregular follow-up declared for leakage test.",
        missingDataHandling: "declared_missing",
        gapPolicy: "no_interpolation_across_gap",
        eligibilityDefinitionTimeRole: "follow_up_time",
        exposureDefinitionTimeRole: "event_time",
        authoredByPrincipalId: "agent-hsi-ldsm-1",
        createdAt: asOf,
      }),
    ).toThrow(/Temporal leakage fail-closed|Eligibility must not/);

    const leaked: LdsmTemporalAnchorSet = {
      ...anchors,
      predictionTime: {
        role: "prediction_time",
        timestamp: "2024-01-01T00:00:00.000Z",
        declaredAbsent: false,
        note: "Prediction before measurement — leakage",
      },
    };
    const integrity = evaluateLdsmTemporalIntegrity({
      temporalAnchors: leaked,
      eligibilityDefinitionTimeRole: "baseline_time",
      exposureDefinitionTimeRole: "event_time",
    });
    expect(integrity.status).toBe("failed_prediction_before_measurement");
    expect(integrity.predictionBeforeMeasurement).toBe(true);

    expect(() =>
      draftLongitudinalDiseaseStateSpec({
        id: "hsi-ldsm-spec-pred-leak",
        modellingKind: "disease_trajectory_reconstruction",
        displayName: "Prediction leakage fixture",
        scientificQuestion: "Must refuse prediction before measurement.",
        diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
        subjectRefKind: "pseudonymous_subject",
        subjectOrCohortRef: "pseudo-subj-ldsm-pred",
        temporalAnchors: leaked,
        observationIntervalKind: "irregular_declared",
        irregularFollowUpNote: "Irregular follow-up declared for prediction leakage.",
        missingDataHandling: "declared_missing",
        gapPolicy: "gap_recorded_uncertainty_preserved",
        eligibilityDefinitionTimeRole: "baseline_time",
        exposureDefinitionTimeRole: "event_time",
        authoredByPrincipalId: "agent-hsi-ldsm-1",
        createdAt: asOf,
      }),
    ).toThrow(/Temporal leakage fail-closed|Prediction time is before/);
  });

  test("reconstructs trajectories and biomarkers without inventing continuous fill across gaps", () => {
    const spec = seedFixtureSpec({
      observationIntervalKind: "sparse_declared",
      irregularFollowUpNote:
        "Sparse fixture intervals; uncertainty preserved across gaps.",
      missingDataHandling: "uncertainty_preserved_sparse",
    });

    expect(() =>
      draftDiseaseTrajectoryReconstruction({
        id: "hsi-ldsm-trj-low-unc",
        modellingSpec: spec,
        clinicalConcept: "Fixture disease activity score",
        points: sparsePoints(),
        uncertaintyOrdinal: "low_declared",
        authoredByPrincipalId: "agent-hsi-ldsm-1",
        createdAt: asOf,
      }),
    ).toThrow(/Sparse follow-up must preserve/);

    const trajectory = draftDiseaseTrajectoryReconstruction({
      id: "hsi-ldsm-trj-ssc-fixture",
      modellingSpec: spec,
      clinicalConcept: "Fixture disease activity score",
      points: sparsePoints(),
      uncertaintyOrdinal: "high_sparse_preserved",
      hdiObservationIds: ["hsi-hdi-obs-crp-demo"],
      longitudinalSeriesId: "hsi-lce-ser-lab-demo",
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    expect(trajectory.continuousInterpolationInvented).toBeNull();
    expect(trajectory.fabricatedTrajectory).toBeNull();
    expect(trajectory.points[1]?.crossesClinicallyMeaningfulGap).toBe(true);
    expect(trajectory.points.every((p) => p.interpolated === false)).toBe(true);

    const biomarker = draftBiomarkerTrajectory({
      id: "hsi-ldsm-bio-crp-fixture",
      modellingSpec: spec,
      biomarkerConcept: "Fixture CRP laboratory concept",
      points: sparsePoints(),
      uncertaintyOrdinal: "high_sparse_preserved",
      hdiObservationIds: ["hsi-hdi-obs-crp-demo"],
      longitudinalSeriesId: "hsi-lce-ser-lab-demo",
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    expect(biomarker.continuousInterpolationInvented).toBeNull();
    expect(biomarker.uncertaintyOrdinal).toBe("high_sparse_preserved");
  });

  test("baseline/follow-up, events, organ trends, exposure, missing-data, and transitions stay honest", () => {
    const spec = seedFixtureSpec();

    const comparison = draftBaselineFollowUpComparison({
      id: "hsi-ldsm-cmp-ssc-fixture",
      modellingSpec: spec,
      clinicalConcept: "Fixture FVC percent predicted",
      baselineTime: "2024-01-15T10:00:00.000Z",
      followUpTime: "2024-06-15T10:00:00.000Z",
      baselineValueDeclared: "72",
      followUpValueDeclared: "68",
      comparisonSummary:
        "Fixture baseline vs follow-up FVC comparison under declared limitations — not a proven treatment effect.",
      uncertaintyOrdinal: "moderate_declared",
      hdiObservationIds: ["hsi-hdi-obs-fvc-demo"],
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    expect(comparison.inventedDelta).toBeNull();
    expect(comparison.provenTreatmentEffectClaimed).toBe(false);

    expect(() =>
      draftBaselineFollowUpComparison({
        id: "hsi-ldsm-cmp-bad-order",
        modellingSpec: spec,
        clinicalConcept: "Fixture bad order",
        baselineTime: "2024-06-15T10:00:00.000Z",
        followUpTime: "2024-01-15T10:00:00.000Z",
        comparisonSummary: "Invalid order must fail.",
        uncertaintyOrdinal: "moderate_declared",
        authoredByPrincipalId: "agent-hsi-ldsm-1",
        createdAt: asOf,
      }),
    ).toThrow(/Baseline time must not be after/);

    const timeline = draftClinicalEventTimeline({
      id: "hsi-ldsm-evt-ssc-fixture",
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
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    expect(timeline.fabricatedTimeline).toBeNull();

    const organ = draftOrganSpecificOutcomeTrend({
      id: "hsi-ldsm-org-lung-fixture",
      modellingSpec: spec,
      organSystem: "pulmonary",
      outcomeConcept: "Fixture FVC trend",
      trendSummary:
        "Fixture organ-specific FVC trend with sparse uncertainty preserved — no invented continuous curve.",
      uncertaintyOrdinal: "high_sparse_preserved",
      rweOutcomeId: "hsi-rwe-out-fixture-demo",
      longitudinalSeriesId: "hsi-lce-ser-lab-demo",
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    expect(organ.inventedContinuousCurve).toBeNull();

    const exposure = draftTreatmentExposureContext({
      id: "hsi-ldsm-exp-mmf-fixture",
      modellingSpec: spec,
      exposureConcept: "Fixture mycophenolate exposure context",
      exposureStartTime: "2024-02-01T00:00:00.000Z",
      exposureEndTime: "2024-06-01T00:00:00.000Z",
      exposureSummary:
        "Fixture treatment exposure context for research framing only — not a prescribing directive.",
      rweExposureId: "hsi-rwe-exp-fixture-demo",
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    expect(exposure.treatmentEffectClaimed).toBe(false);
    expect(exposure.prescribingDirective).toBeNull();

    const missing = draftMissingDataAnalysis({
      id: "hsi-ldsm-mis-ssc-fixture",
      modellingSpec: spec,
      missingConcepts: ["Fixture DLCO", "Fixture skin score"],
      analysisSummary:
        "Missing concepts recorded without inventing values; sparse uncertainty preserved.",
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    expect(missing.inventedValues).toBeNull();
    expect(missing.sparseUncertaintyPreserved).toBe(true);

    const observedTxn = draftDiseaseStateTransition({
      id: "hsi-ldsm-txn-obs-fixture",
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
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    expect(observedTxn.clinicalCareDirective).toBeNull();
    expect(observedTxn.hdiEstimateId).toBeNull();

    expect(() =>
      draftDiseaseStateTransition({
        id: "hsi-ldsm-txn-collapse",
        modellingSpec: spec,
        fromStateLabel: "Fixture a",
        toStateLabel: "Fixture b",
        transitionConfidence: "low",
        epistemicStatus: "observed",
        hdiEstimateId: "hsi-hdi-est-demo",
        limitations: ["Must refuse collapsing observed into estimate."],
        authoredByPrincipalId: "agent-hsi-ldsm-1",
        createdAt: asOf,
      }),
    ).toThrow(/must not bind an inferred estimate/);

    const inferredTxn = draftDiseaseStateTransition({
      id: "hsi-ldsm-txn-inf-fixture",
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
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    expect(inferredTxn.epistemicStatus).toBe("inferred");
  });

  test("blocked dataset models cannot be accepted; human review required", () => {
    const blocked = seedBlockedSpec();
    expect(blocked.lifecycle).toBe("blocked_awaiting_authorised_dataset");
    expect(() =>
      transitionLongitudinalDiseaseStateSpec({
        spec: blocked,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "human-reviewer-1", actorKind: "human"},
      }),
    ).toThrow(/Invalid modelling spec transition|cannot be accepted/);

    const blockedModel = draftLongitudinalDiseaseStateModel({
      id: "hsi-ldsm-mdl-blocked-demo",
      displayName: "Blocked longitudinal disease-state model",
      modellingSpec: blocked,
      modelVersion: "0.1.0",
      limitations: [
        "Blocked awaiting authorised research dataset — not scientific validation.",
        "Not clinical care; fixtures only.",
      ],
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    expect(blockedModel.lifecycle).toBe("blocked_awaiting_authorised_dataset");
    expect(blockedModel.liveTwinOperational).toBe(false);
    expect(() =>
      transitionLongitudinalDiseaseStateModel({
        model: blockedModel,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "human-reviewer-1", actorKind: "human"},
      }),
    ).toThrow(/Invalid disease state model transition|cannot be accepted/);

    const spec = seedFixtureSpec();
    const check = draftLdsmTemporalIntegrityCheck({
      id: "hsi-ldsm-tmp-ssc-fixture",
      modellingSpec: spec,
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    expect(check.status).toBe("passed_declared_checks");

    const draft = draftLongitudinalDiseaseStateModel({
      id: "hsi-ldsm-mdl-ssc-fixture",
      displayName: "Fixture longitudinal disease-state model",
      modellingSpec: spec,
      modelVersion: "0.1.0",
      limitations: [
        "Fixture disease-state model only — not clinical care.",
        "Observed is not inferred; observational trajectory is not a proven treatment effect.",
        "No invented continuous trajectories across clinically meaningful gaps.",
      ],
      temporalChecks: [check],
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    expect(fingerprintLongitudinalDiseaseStateModel(draft)).toMatch(
      /^[a-f0-9]{64}$/,
    );

    const underReview = transitionLongitudinalDiseaseStateModel({
      model: draft,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-ldsm-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionLongitudinalDiseaseStateModel({
        model: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-ldsm-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Human review required/);

    const accepted = transitionLongitudinalDiseaseStateModel({
      model: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "human-reviewer-1", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_limitations");
    expect(accepted.reviewedBy?.actorKind).toBe("human");
  });

  test("refuses PHI-shaped subject refs and irregular follow-up without notes", () => {
    expect(() =>
      seedFixtureSpec({
        subjectOrCohortRef: "nhs-1234567890",
      }),
    ).toThrow(/Direct personal identifier/);

    expect(() =>
      seedFixtureSpec({
        observationIntervalKind: "irregular_declared",
        irregularFollowUpNote: null,
      }),
    ).toThrow(/Irregular\/sparse follow-up requires/);
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const spec = seedFixtureSpec({
      observationIntervalKind: "sparse_declared",
      irregularFollowUpNote: "Sparse store fixture intervals.",
      missingDataHandling: "uncertainty_preserved_sparse",
    });
    const trajectory = draftDiseaseTrajectoryReconstruction({
      id: "hsi-ldsm-trj-store-1",
      modellingSpec: spec,
      clinicalConcept: "Fixture store trajectory",
      points: sparsePoints(),
      uncertaintyOrdinal: "high_sparse_preserved",
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    const comparison = draftBaselineFollowUpComparison({
      id: "hsi-ldsm-cmp-store-1",
      modellingSpec: spec,
      clinicalConcept: "Fixture store comparison",
      baselineTime: "2024-01-15T10:00:00.000Z",
      followUpTime: "2024-06-15T10:00:00.000Z",
      comparisonSummary: "Fixture store baseline/follow-up comparison.",
      uncertaintyOrdinal: "high_sparse_preserved",
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    const timeline = draftClinicalEventTimeline({
      id: "hsi-ldsm-evt-store-1",
      modellingSpec: spec,
      entries: [
        {
          sequenceIndex: 0,
          eventTime: "2024-03-10T11:30:00.000Z",
          measurementTime: "2024-03-10T12:00:00.000Z",
          ingestionTime: "2024-03-11T08:00:00.000Z",
          eventLabel: "Fixture store event",
          missingnessDeclared: false,
          note: "Store event",
        },
      ],
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    const organ = draftOrganSpecificOutcomeTrend({
      id: "hsi-ldsm-org-store-1",
      modellingSpec: spec,
      organSystem: "pulmonary",
      outcomeConcept: "Fixture store organ outcome",
      trendSummary: "Fixture store organ trend under research limitations.",
      uncertaintyOrdinal: "high_sparse_preserved",
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    const exposure = draftTreatmentExposureContext({
      id: "hsi-ldsm-exp-store-1",
      modellingSpec: spec,
      exposureConcept: "Fixture store exposure",
      exposureSummary: "Fixture store exposure context — research only.",
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    const biomarker = draftBiomarkerTrajectory({
      id: "hsi-ldsm-bio-store-1",
      modellingSpec: spec,
      biomarkerConcept: "Fixture store biomarker",
      points: sparsePoints(),
      uncertaintyOrdinal: "high_sparse_preserved",
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    const missing = draftMissingDataAnalysis({
      id: "hsi-ldsm-mis-store-1",
      modellingSpec: spec,
      missingConcepts: ["Fixture missing store concept"],
      analysisSummary: "Store missing-data analysis without invention.",
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    const transition = draftDiseaseStateTransition({
      id: "hsi-ldsm-txn-store-1",
      modellingSpec: spec,
      fromStateLabel: "Fixture store state A",
      toStateLabel: "Fixture store state B",
      transitionConfidence: "low",
      epistemicStatus: "inferred",
      hdiEstimateId: "hsi-hdi-est-demo",
      limitations: [
        "Store inferred transition — research only.",
        "Not clinical care.",
      ],
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    const check = draftLdsmTemporalIntegrityCheck({
      id: "hsi-ldsm-tmp-store-1",
      modellingSpec: spec,
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });
    const model = draftLongitudinalDiseaseStateModel({
      id: "hsi-ldsm-mdl-store-1",
      displayName: "Fixture store disease-state model",
      modellingSpec: spec,
      modelVersion: "0.1.0",
      limitations: [
        "Fixture store model — research decision support only.",
        "Uncertainty preserved when sparse.",
      ],
      trajectories: [trajectory],
      baselineFollowUps: [comparison],
      eventTimelines: [timeline],
      organTrends: [organ],
      treatmentExposures: [exposure],
      biomarkerTrajectories: [biomarker],
      missingDataAnalyses: [missing],
      stateTransitions: [transition],
      temporalChecks: [check],
      authoredByPrincipalId: "agent-hsi-ldsm-1",
      createdAt: asOf,
    });

    const store = createMemoryLongitudinalDiseaseStateStore();
    store.upsertSpec(spec);
    store.upsertTrajectory(trajectory);
    store.upsertBaselineFollowUp(comparison);
    store.upsertEventTimeline(timeline);
    store.upsertOrganTrend(organ);
    store.upsertTreatmentExposure(exposure);
    store.upsertBiomarkerTrajectory(biomarker);
    store.upsertMissingDataAnalysis(missing);
    store.upsertStateTransition(transition);
    store.upsertTemporalIntegrityCheck(check);
    store.upsertModel(model);

    expect(store.listSpecs(spec.diseaseContextId)).toHaveLength(1);
    expect(store.listTrajectories(spec.diseaseContextId)).toHaveLength(1);
    expect(store.listModels(spec.diseaseContextId)).toHaveLength(1);
    expect(store.listTemporalIntegrityChecks(spec.id)).toHaveLength(1);

    const lines = projectLongitudinalDiseaseStatePersistenceLines({
      specs: [spec],
      trajectories: [trajectory],
      baselineFollowUps: [comparison],
      eventTimelines: [timeline],
      organTrends: [organ],
      treatmentExposures: [exposure],
      biomarkerTrajectories: [biomarker],
      missingDataAnalyses: [missing],
      stateTransitions: [transition],
      temporalChecks: [check],
      models: [model],
    });
    expect(lines).toContain("observedIsNotInferred=true");
    expect(lines).toContain("noFutureDataLeakage=true");
    expect(lines).toContain("uncertaintyPreservedWhenSparse=true");
    expect(lines).toContain("noInventedContinuousTrajectoryAcrossGaps=true");
    expect(lines).toContain("notClinicalCare=true");
    expect(lines).toContain("neon=red-wave-only");

    const pack = buildLongitudinalDiseaseStatePack({
      specs: [spec],
      trajectories: [trajectory],
      baselineFollowUps: [comparison],
      eventTimelines: [timeline],
      organTrends: [organ],
      treatmentExposures: [exposure],
      biomarkerTrajectories: [biomarker],
      missingDataAnalyses: [missing],
      stateTransitions: [transition],
      temporalChecks: [check],
      models: [model],
      asOf,
    });
    expect(pack.modellingKindCount).toBe(8);
    expect(pack.modelCount).toBe(1);
    expect(pack.honesty.noLiveTwinOrMultiscaleClaim).toBe(true);
  });
});
