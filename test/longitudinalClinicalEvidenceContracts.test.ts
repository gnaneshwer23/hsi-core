/**
 * Milestone 14 PR3 — longitudinal clinical evidence contract honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  LONGITUDINAL_ANALYSIS_KINDS,
  TEMPORAL_ROLES,
  buildLongitudinalClinicalEvidencePack,
  createMemoryLongitudinalClinicalEvidenceStore,
  draftLongitudinalAnalysisResult,
  draftLongitudinalAnalysisSpec,
  draftLongitudinalObservationSeries,
  draftTemporalIntegrityCheck,
  evaluateTemporalIntegrity,
  fingerprintLongitudinalAnalysisSpec,
  fixtureTemporalAnchors,
  projectLongitudinalClinicalEvidencePersistenceLines,
  transitionLongitudinalAnalysisResult,
  transitionLongitudinalAnalysisSpec,
  type LongitudinalAnalysisSpec,
  type TemporalAnchorSet,
} from "../src/longitudinalClinicalEvidenceContracts";

const asOf = "2026-11-09T21:00:00.000Z";

function seedFixtureSpec(
  overrides?: Partial<Parameters<typeof draftLongitudinalAnalysisSpec>[0]>,
): LongitudinalAnalysisSpec {
  return draftLongitudinalAnalysisSpec({
    id: "hsi-lce-spec-lab-trend-fixture",
    analysisKind: "laboratory_trend",
    displayName: "Fixture laboratory trend envelope",
    scientificQuestion:
      "How do declared fixture laboratory values change over irregular observation intervals without claiming proven treatment effects?",
    rweStudyId: "hsi-rwe-study-fixture-demo",
    subjectRefKind: "cohort_aggregate",
    subjectOrCohortRef: "cohort-lce-fixture-001",
    temporalAnchors: fixtureTemporalAnchors(asOf),
    observationIntervalKind: "irregular_declared",
    irregularIntervalNote:
      "Fixture intervals are irregular; gaps declared per point",
    missingDataHandling: "declared_missing",
    missingDataNote: "Missing laboratory points declared explicitly in series",
    eligibilityDefinitionTimeRole: "baseline_time",
    exposureDefinitionTimeRole: "treatment_initiation_time",
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "agent-hsi-lce-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    rweObservationIds: ["hsi-rwe-obs-fixture-demo"],
    rweExposureIds: ["hsi-rwe-exp-fixture-demo"],
    rweOutcomeIds: ["hsi-rwe-out-fixture-demo"],
    rweAnalysisId: "hsi-rwe-anl-fixture-demo",
    interopDataSourceId: "hsi-scdi-src-fhir-r4-demo",
    interopTemporalAlignmentId: "hsi-scdi-tmp-fixture-demo",
    ...overrides,
  });
}

function seedBlockedSpec(): LongitudinalAnalysisSpec {
  return draftLongitudinalAnalysisSpec({
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
    authoredByPrincipalId: "agent-hsi-lce-1",
    createdAt: asOf,
  });
}

describe("longitudinal clinical evidence contracts (M14 PR3)", () => {
  test("supports all analysis kinds with distinct temporal roles and RWE/interop links", () => {
    expect(LONGITUDINAL_ANALYSIS_KINDS).toEqual([
      "disease_trajectory",
      "laboratory_trend",
      "treatment_timeline",
      "clinical_event",
      "patient_reported_outcome",
      "functional_outcome",
      "organ_specific_measure",
      "follow_up_completeness",
    ]);
    expect(TEMPORAL_ROLES).toHaveLength(7);

    const spec = seedFixtureSpec();
    expect(spec.liveLongitudinalEngineOperational).toBe(false);
    expect(spec.containsIdentifiablePhi).toBe(false);
    expect(spec.honesty.observationalTrajectoryIsNotProvenTreatmentEffect).toBe(
      true,
    );
    expect(spec.honesty.noFutureInformationForEarlierExposureOrEligibility).toBe(
      true,
    );
    expect(spec.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(spec.rweStudyId).toBe("hsi-rwe-study-fixture-demo");
    expect(spec.interopDataSourceId).toBe("hsi-scdi-src-fhir-r4-demo");
    expect(spec.interopTemporalAlignmentId).toBe("hsi-scdi-tmp-fixture-demo");
    expect(fingerprintLongitudinalAnalysisSpec(spec)).toMatch(/^[a-f0-9]{64}$/);

    for (const kind of LONGITUDINAL_ANALYSIS_KINDS) {
      const drafted = seedFixtureSpec({
        id: `hsi-lce-spec-${kind.replace(/_/g, "-").slice(0, 40)}`,
        analysisKind: kind,
        displayName: `Fixture ${kind} envelope`,
      });
      expect(drafted.analysisKind).toBe(kind);
    }
  });

  test("fail-closed refuses future information for earlier exposure/eligibility", () => {
    const leaky: TemporalAnchorSet = fixtureTemporalAnchors(asOf);
    expect(() =>
      draftLongitudinalAnalysisSpec({
        id: "hsi-lce-spec-leaky-eligibility",
        analysisKind: "clinical_event",
        displayName: "Leaky eligibility fixture",
        scientificQuestion: "Must fail closed on future eligibility definition",
        rweStudyId: "hsi-rwe-study-fixture-demo",
        subjectRefKind: "cohort_aggregate",
        subjectOrCohortRef: "cohort-leaky-1",
        temporalAnchors: leaky,
        observationIntervalKind: "regular_declared",
        missingDataHandling: "not_applicable",
        missingDataNote: "N/A",
        eligibilityDefinitionTimeRole: "outcome_ascertainment_time",
        exposureDefinitionTimeRole: "treatment_initiation_time",
        datasetAvailability: "fixture_only",
        authoredByPrincipalId: "agent-hsi-lce-1",
        createdAt: asOf,
      }),
    ).toThrow(/Temporal leakage fail-closed/);

    const evalResult = evaluateTemporalIntegrity({
      temporalAnchors: leaky,
      eligibilityDefinitionTimeRole: "baseline_time",
      exposureDefinitionTimeRole: "follow_up_time",
    });
    expect(evalResult.status).toBe("failed_future_information_leakage");
    expect(
      evalResult.usedFutureInformationForEarlierExposureOrEligibility,
    ).toBe(true);

    const collapsed: TemporalAnchorSet = {
      eventTime: {
        role: "event_time",
        timestamp: asOf,
        declaredAbsent: false,
        note: "",
      },
      recordCreationTime: {
        role: "record_creation_time",
        timestamp: asOf,
        declaredAbsent: false,
        note: "",
      },
      ingestionTime: {
        role: "ingestion_time",
        timestamp: asOf,
        declaredAbsent: false,
        note: "",
      },
      treatmentInitiationTime: {
        role: "treatment_initiation_time",
        timestamp: asOf,
        declaredAbsent: false,
        note: "",
      },
      baselineTime: {
        role: "baseline_time",
        timestamp: asOf,
        declaredAbsent: false,
        note: "",
      },
      followUpTime: {
        role: "follow_up_time",
        timestamp: asOf,
        declaredAbsent: false,
        note: "",
      },
      outcomeAscertainmentTime: {
        role: "outcome_ascertainment_time",
        timestamp: asOf,
        declaredAbsent: false,
        note: "",
      },
    };
    expect(() =>
      seedFixtureSpec({
        id: "hsi-lce-spec-collapsed-roles",
        temporalAnchors: collapsed,
      }),
    ).toThrow(/Collapsed temporal roles fail-closed/);
  });

  test("requires explicit irregular intervals and missing data; refuses PHI refs", () => {
    expect(() =>
      seedFixtureSpec({
        id: "hsi-lce-spec-missing-interval-note",
        irregularIntervalNote: null,
      }),
    ).toThrow(/Irregular\/sparse\/unknown intervals require irregularIntervalNote/);

    expect(() =>
      seedFixtureSpec({
        id: "hsi-lce-spec-phi-ref",
        subjectRefKind: "pseudonymous_subject",
        subjectOrCohortRef: "nhs-1234567890",
      }),
    ).toThrow(/Direct personal identifier/);

    const spec = seedFixtureSpec();
    const series = draftLongitudinalObservationSeries({
      id: "hsi-lce-ser-lab-fixture",
      analysisSpec: spec,
      clinicalConcept: "Fixture CRP laboratory concept",
      authoredByPrincipalId: "agent-hsi-lce-1",
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
          note: "Baseline lab",
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
          note: "Follow-up lab missing — declared",
        },
      ],
    });
    expect(series.fabricatedTrajectory).toBeNull();
    expect(series.points[1]?.missingnessDeclared).toBe(true);

    expect(() =>
      draftLongitudinalObservationSeries({
        id: "hsi-lce-ser-bad-order",
        analysisSpec: spec,
        clinicalConcept: "bad order",
        authoredByPrincipalId: "agent-hsi-lce-1",
        createdAt: asOf,
        points: [
          {
            sequenceIndex: 0,
            intendedRole: "event_time",
            eventTime: "2024-03-11T00:00:00.000Z",
            recordCreationTime: "2024-03-10T00:00:00.000Z",
            ingestionTime: "2024-03-12T00:00:00.000Z",
            valueDeclared: "x",
            unit: null,
            missingnessDeclared: false,
            intervalDaysFromPrior: null,
            note: "",
          },
        ],
      }),
    ).toThrow(/eventTime must not be after recordCreationTime/);
  });

  test("analysis results refuse causal claims and invented trajectories/effects", () => {
    const spec = seedFixtureSpec();
    const check = draftTemporalIntegrityCheck({
      id: "hsi-lce-tmp-fixture-1",
      analysisSpec: spec,
      authoredByPrincipalId: "agent-hsi-lce-1",
      createdAt: asOf,
    });
    expect(check.status).toBe("passed_declared_checks");
    expect(check.usedFutureInformationForEarlierExposureOrEligibility).toBe(
      false,
    );

    const result = draftLongitudinalAnalysisResult({
      id: "hsi-lce-res-lab-fixture",
      analysisSpec: spec,
      temporalCheck: check,
      summary:
        "Fixture laboratory trend envelope — descriptive association only",
      limitations: [
        "Observational trajectory only — confounding unresolved; not a proven treatment effect.",
        "Irregular intervals and declared missingness limit interpretation.",
      ],
      trajectoryNarrative:
        "Declared fixture narrative of irregular laboratory follow-up — not an invented survival curve",
      authoredByPrincipalId: "agent-hsi-lce-1",
      createdAt: asOf,
    });
    expect(result.causalIdentificationClaimed).toBe(false);
    expect(result.inventedPatientCount).toBeNull();
    expect(result.inventedEffectEstimate).toBeNull();
    expect(result.inventedSurvivalCurve).toBeNull();
    expect(result.fabricatedTrajectory).toBeNull();

    expect(() =>
      draftLongitudinalAnalysisResult({
        id: "hsi-lce-res-bad-claims",
        analysisSpec: spec,
        temporalCheck: check,
        summary: "Proven treatment effect with n = 240 and hazard ratio = 0.55",
        limitations: ["Something vague"],
        authoredByPrincipalId: "agent-hsi-lce-1",
        createdAt: asOf,
      }),
    ).toThrow(/must not invent/);
  });

  test("blocked dataset specs cannot be accepted; human review required", () => {
    const blocked = seedBlockedSpec();
    expect(blocked.lifecycle).toBe("blocked_awaiting_authorised_dataset");
    expect(() =>
      transitionLongitudinalAnalysisSpec({
        spec: blocked,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher", actorKind: "human"},
      }),
    ).toThrow(/Illegal spec transition/);

    const fixture = seedFixtureSpec();
    const underReview = transitionLongitudinalAnalysisSpec({
      spec: fixture,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-lce-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionLongitudinalAnalysisSpec({
        spec: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-lce-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);
    const accepted = transitionLongitudinalAnalysisSpec({
      spec: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_limitations");
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const spec = seedFixtureSpec();
    const series = draftLongitudinalObservationSeries({
      id: "hsi-lce-ser-store",
      analysisSpec: spec,
      clinicalConcept: "Fixture store concept",
      authoredByPrincipalId: "agent-hsi-lce-1",
      createdAt: asOf,
      points: [
        {
          sequenceIndex: 0,
          intendedRole: "baseline_time",
          eventTime: "2024-01-15T00:00:00.000Z",
          recordCreationTime: "2024-01-15T06:00:00.000Z",
          ingestionTime: "2024-01-16T09:00:00.000Z",
          valueDeclared: "fixture-v0",
          unit: null,
          missingnessDeclared: false,
          intervalDaysFromPrior: null,
          note: "",
        },
        {
          sequenceIndex: 1,
          intendedRole: "follow_up_time",
          eventTime: "2024-06-15T00:00:00.000Z",
          recordCreationTime: "2024-06-15T08:00:00.000Z",
          ingestionTime: "2024-06-16T09:00:00.000Z",
          valueDeclared: "fixture-v1",
          unit: null,
          missingnessDeclared: false,
          intervalDaysFromPrior: 152,
          note: "",
        },
      ],
    });
    const check = draftTemporalIntegrityCheck({
      id: "hsi-lce-tmp-store",
      analysisSpec: spec,
      authoredByPrincipalId: "agent-hsi-lce-1",
      createdAt: asOf,
    });
    const result = draftLongitudinalAnalysisResult({
      id: "hsi-lce-res-store",
      analysisSpec: spec,
      temporalCheck: check,
      summary: "Store fixture longitudinal summary",
      limitations: [
        "Observational association / trajectory only; confounding not assessed.",
      ],
      authoredByPrincipalId: "agent-hsi-lce-1",
      createdAt: asOf,
    });

    const store = createMemoryLongitudinalClinicalEvidenceStore();
    store.upsertSpec(spec);
    store.upsertSeries(series);
    store.upsertTemporalCheck(check);
    store.upsertResult(result);
    expect(store.listSpecs(spec.rweStudyId)).toHaveLength(1);
    expect(store.listSeries(spec.id)).toHaveLength(1);
    expect(store.listTemporalChecks(spec.id)).toHaveLength(1);
    expect(store.listResults(spec.id)).toHaveLength(1);

    const lines = projectLongitudinalClinicalEvidencePersistenceLines({
      specs: [spec],
      series: [series],
      temporalChecks: [check],
      results: [result],
    });
    expect(lines).toContain("noUnrestrictedPatientDb=true");
    expect(lines).toContain("observationalTrajectoryIsNotProvenEffect=true");
    expect(lines).toContain("noFutureInfoForEarlierExposure=true");
    expect(lines).toContain("fabricatedTrajectories=false");
    expect(lines).toContain("liveLongitudinalEngine=false");

    const pack = buildLongitudinalClinicalEvidencePack({
      specs: [spec],
      series: [series],
      temporalChecks: [check],
      results: [result],
      asOf,
    });
    expect(pack.specCount).toBe(1);
    expect(pack.honesty.noPhiIngestion).toBe(true);

    const underReview = transitionLongitudinalAnalysisResult({
      result,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-lce-1", actorKind: "ai_agent"},
    });
    const accepted = transitionLongitudinalAnalysisResult({
      result: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_limitations");
  });

  test("follow-up completeness and organ measures stay contract-only", () => {
    const followUp = seedFixtureSpec({
      id: "hsi-lce-spec-follow-up-completeness",
      analysisKind: "follow_up_completeness",
      displayName: "Fixture follow-up completeness envelope",
      scientificQuestion:
        "What follow-up completeness is declared for the fixture cohort without inventing rates?",
      observationIntervalKind: "sparse_declared",
      irregularIntervalNote: "Sparse follow-up visits declared in fixture",
      missingDataHandling: "complete_case_declared",
      missingDataNote: "Complete-case handling declared — not imputed",
    });
    expect(followUp.analysisKind).toBe("follow_up_completeness");
    expect(followUp.liveLongitudinalEngineOperational).toBe(false);

    const organ = seedFixtureSpec({
      id: "hsi-lce-spec-organ-specific",
      analysisKind: "organ_specific_measure",
      displayName: "Fixture organ-specific measure envelope",
      scientificQuestion:
        "How are organ-specific fixture measures sequenced over time without causal claims?",
    });
    expect(organ.analysisKind).toBe("organ_specific_measure");
    expect(organ.honesty.causalIdentificationClaimed).toBe(false);
  });
});
