/**
 * Milestone 14 PR4 — reproducible cohort builder contract honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  DEFAULT_SMALL_CELL_THRESHOLD,
  applySmallCellDisclosure,
  buildReproducibleCohortBuilderPack,
  createMemoryReproducibleCohortBuilderStore,
  draftAttritionReport,
  draftCohortDefinition,
  draftDisclosureDecision,
  draftEligibilityAssessment,
  draftMeasurementAvailability,
  draftMissingDataAssessment,
  draftOverlapComparabilityCheck,
  draftPopulationDescription,
  fingerprintCohortDefinition,
  fixtureInclusionExclusionCriteria,
  projectReproducibleCohortBuilderPersistenceLines,
  runCohortDiscoverySearch,
  transitionCohortDefinition,
  type CohortDefinition,
} from "../src/reproducibleCohortBuilderContracts";

const asOf = "2026-11-09T22:00:00.000Z";

function seedFixtureCohort(
  overrides?: Partial<Parameters<typeof draftCohortDefinition>[0]>,
): CohortDefinition {
  const criteria = fixtureInclusionExclusionCriteria();
  return draftCohortDefinition({
    id: "hsi-rcb-coh-fixture-demo",
    displayName: "Fixture SSc observational cohort envelope",
    scientificQuestion:
      "How is a reproducible fixture cohort defined without claiming proven treatment effects?",
    cohortVersion: "fixture-cohort-v0",
    rweStudyId: "hsi-rwe-study-fixture-demo",
    dataSourceDescription: "Engineering fixture synthetic cohort source",
    inclusionCriteria: criteria.inclusion,
    exclusionCriteria: criteria.exclusion,
    indexDate: {
      kind: "first_qualifying_diagnosis",
      description: "First fixture qualifying diagnosis as index",
      anchoredToCriterionId: "hsi-rcb-crit-inc-diagnosis",
      note: "Index date fixture",
    },
    baselineWindow: {
      startOffset: -180,
      endOffset: -1,
      unit: "days",
      note: "Baseline window before index",
    },
    exposure: {
      displayName: "Fixture exposure",
      definition: "Declared fixture exposure definition",
      rweExposureId: "hsi-rwe-exp-fixture-demo",
      washoutDays: 180,
      note: "Exposure fixture",
    },
    comparator: {
      displayName: "Fixture comparator",
      definition: "Declared fixture comparator definition",
      rweExposureId: "hsi-rwe-exp-fixture-comp",
      washoutDays: 180,
      note: "Comparator fixture",
    },
    followUpPeriod: {
      endKind: "fixed_duration",
      description: "Fixed 12-month follow-up fixture",
      maxDurationValue: 12,
      maxDurationUnit: "months",
      note: "Follow-up fixture",
    },
    outcome: {
      displayName: "Fixture outcome",
      definition: "Declared fixture outcome ascertainment",
      rweOutcomeId: "hsi-rwe-out-fixture-demo",
      ascertainmentWindow: {
        startOffset: 0,
        endOffset: 365,
        unit: "days",
        note: "Outcome window",
      },
      note: "Outcome fixture",
    },
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    interopDataSourceId: "hsi-scdi-src-fhir-r4-demo",
    longitudinalAnalysisSpecId: "hsi-lce-spec-lab-trend-fixture",
    authoredByPrincipalId: "agent-hsi-rcb-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    ...overrides,
  });
}

function seedBlockedCohort(): CohortDefinition {
  const criteria = fixtureInclusionExclusionCriteria();
  return draftCohortDefinition({
    id: "hsi-rcb-coh-blocked-demo",
    displayName: "Blocked cohort until authorised dataset",
    scientificQuestion:
      "Blocked scientific path for cohort building until an authorised clinical dataset is supplied.",
    cohortVersion: "blocked-v0",
    rweStudyId: "hsi-rwe-study-blocked-demo",
    dataSourceDescription: "Authorised clinical dataset not supplied",
    inclusionCriteria: criteria.inclusion,
    exclusionCriteria: criteria.exclusion,
    indexDate: {
      kind: "cohort_entry_declared",
      description: "Declared cohort entry — blocked pending dataset",
      anchoredToCriterionId: null,
      note: "",
    },
    baselineWindow: {
      startOffset: -90,
      endOffset: -1,
      unit: "days",
      note: "",
    },
    exposure: {
      displayName: "Blocked exposure",
      definition: "Exposure undefined without authorised dataset",
      rweExposureId: null,
      washoutDays: null,
      note: "",
    },
    comparator: {
      displayName: "Blocked comparator",
      definition: "Comparator undefined without authorised dataset",
      rweExposureId: null,
      washoutDays: null,
      note: "",
    },
    followUpPeriod: {
      endKind: "administrative_censor",
      description: "Follow-up blocked pending dataset",
      maxDurationValue: null,
      maxDurationUnit: null,
      note: "",
    },
    outcome: {
      displayName: "Blocked outcome",
      definition: "Outcome undefined without authorised dataset",
      rweOutcomeId: null,
      ascertainmentWindow: null,
      note: "",
    },
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "agent-hsi-rcb-1",
    createdAt: asOf,
  });
}

describe("reproducible cohort builder contracts (M14 PR4)", () => {
  test("cohort definition carries inclusion/exclusion, index, baseline, exposure, comparator, follow-up, outcome, data source, version", () => {
    const cohort = seedFixtureCohort();
    expect(cohort.inclusionCriteria.length).toBeGreaterThanOrEqual(1);
    expect(cohort.exclusionCriteria.length).toBeGreaterThanOrEqual(1);
    expect(cohort.indexDate.kind).toBe("first_qualifying_diagnosis");
    expect(cohort.baselineWindow.unit).toBe("days");
    expect(cohort.exposure.role).toBe("exposure");
    expect(cohort.comparator.role).toBe("comparator");
    expect(cohort.followUpPeriod.endKind).toBe("fixed_duration");
    expect(cohort.outcome.rweOutcomeId).toBe("hsi-rwe-out-fixture-demo");
    expect(cohort.dataSourceDescription.length).toBeGreaterThan(0);
    expect(cohort.cohortVersion).toBe("fixture-cohort-v0");
    expect(cohort.interopDataSourceId).toBe("hsi-scdi-src-fhir-r4-demo");
    expect(cohort.longitudinalAnalysisSpecId).toBe(
      "hsi-lce-spec-lab-trend-fixture",
    );
    expect(cohort.liveEhrQueryOperational).toBe(false);
    expect(cohort.containsIdentifiablePhi).toBe(false);
    expect(cohort.inventedPatientCount).toBeNull();
    expect(cohort.honesty.observationalCohortIsNotProvenTreatmentEffect).toBe(
      true,
    );
    expect(cohort.honesty.smallCellDisclosureControlsRequired).toBe(true);
    expect(cohort.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(fingerprintCohortDefinition(cohort)).toMatch(/^[a-f0-9]{64}$/);
  });

  test("small-cell and sensitive-subgroup disclosure suppress counts", () => {
    expect(DEFAULT_SMALL_CELL_THRESHOLD).toBe(5);
    const small = applySmallCellDisclosure({rawCountDeclared: 3});
    expect(small.status).toBe("suppressed_small_cell");
    expect(small.releasedCount).toBeNull();

    const released = applySmallCellDisclosure({rawCountDeclared: 12});
    expect(released.status).toBe("released_aggregate");
    expect(released.releasedCount).toBe(12);

    const sensitive = applySmallCellDisclosure({
      rawCountDeclared: 100,
      sensitiveSubgroup: true,
    });
    expect(sensitive.status).toBe("suppressed_sensitive_subgroup");
    expect(sensitive.releasedCount).toBeNull();

    const cohort = seedFixtureCohort();
    const decision = draftDisclosureDecision({
      id: "hsi-rcb-disc-small-1",
      cohort,
      cellLabel: "Fixture age band cell",
      rawCountDeclared: 2,
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });
    expect(decision.status).toBe("suppressed_small_cell");
    expect(decision.releasedCount).toBeNull();

    const pop = draftPopulationDescription({
      id: "hsi-rcb-pop-small-1",
      cohort,
      summary: "Fixture population with small aggregate n — suppressed",
      characteristics: ["Fixture age band declared"],
      aggregateNDeclared: 4,
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });
    expect(pop.disclosureStatus).toBe("suppressed_small_cell");
    expect(pop.aggregateNDeclared).toBeNull();
  });

  test("fail-closed: cohort search cannot leak identifiable patient-level data", () => {
    const cohort = seedFixtureCohort();
    const blocked = runCohortDiscoverySearch({
      query: {
        id: "hsi-rcb-q-ident-1",
        queryText: "fixture observational cohort",
        requestedIdentifiablePatientLevel: true,
        authoredBy: {
          principalId: "agent-hsi-rcb-1",
          actorKind: "ai_agent",
        },
        createdAt: asOf,
      },
      cohorts: [cohort],
      aggregateCountsByCohortId: {[cohort.id]: 40},
    });
    expect(blocked.blockedIdentifiableRequest).toBe(true);
    expect(blocked.containsIdentifiablePhi).toBe(false);
    expect(blocked.hits[0]?.kind).toBe("blocked_identifiable");
    expect(blocked.hits[0]?.aggregateCount).toBeNull();
    expect(blocked.hits.every((h) => h.containsIdentifiablePhi === false)).toBe(
      true,
    );

    const idRefBlocked = runCohortDiscoverySearch({
      query: {
        id: "hsi-rcb-q-nhs-ref",
        queryText: "nhs-1234567890",
        requestedIdentifiablePatientLevel: false,
        authoredBy: {
          principalId: "agent-hsi-rcb-1",
          actorKind: "ai_agent",
        },
        createdAt: asOf,
      },
      cohorts: [cohort],
    });
    expect(idRefBlocked.blockedIdentifiableRequest).toBe(true);
    expect(idRefBlocked.containsIdentifiablePhi).toBe(false);

    expect(() =>
      draftEligibilityAssessment({
        id: "hsi-rcb-elig-phi",
        cohort,
        subjectRefKind: "pseudonymous_subject",
        subjectOrCohortRef: "nhs-9999999999",
        decision: "eligible_declared",
        authoredByPrincipalId: "agent-hsi-rcb-1",
        createdAt: asOf,
      }),
    ).toThrow(/Direct personal identifier/);
  });

  test("eligibility, attrition, missing-data, population, measurement, overlap capabilities", () => {
    const cohort = seedFixtureCohort();

    const eligibility = draftEligibilityAssessment({
      id: "hsi-rcb-elig-fixture-1",
      cohort,
      subjectRefKind: "cohort_aggregate",
      subjectOrCohortRef: "cohort-rcb-fixture-001",
      decision: "eligible_declared",
      matchedInclusionCriterionIds: ["hsi-rcb-crit-inc-diagnosis"],
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });
    expect(eligibility.decision).toBe("eligible_declared");
    expect(eligibility.containsIdentifiablePhi).toBe(false);

    const attrition = draftAttritionReport({
      id: "hsi-rcb-atr-fixture-1",
      cohort,
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
      steps: [
        {
          stepKind: "source_population",
          label: "Fixture source population",
          countDeclared: null,
          disclosureStatus: "not_assessed",
          removedReason: null,
          note: "n not invented",
        },
        {
          stepKind: "inclusion_applied",
          label: "Inclusion applied",
          countDeclared: null,
          disclosureStatus: "suppressed_small_cell",
          removedReason: null,
          note: "Small cell suppressed",
        },
        {
          stepKind: "final_analytic_cohort",
          label: "Final analytic cohort",
          countDeclared: 20,
          disclosureStatus: "released_aggregate",
          removedReason: null,
          note: "Disclosure-safe aggregate",
        },
      ],
    });
    expect(attrition.inventedPatientCount).toBeNull();
    expect(attrition.steps).toHaveLength(3);

    expect(() =>
      draftAttritionReport({
        id: "hsi-rcb-atr-leak",
        cohort,
        authoredByPrincipalId: "agent-hsi-rcb-1",
        createdAt: asOf,
        steps: [
          {
            stepKind: "final_analytic_cohort",
            label: "Leaked small cell",
            countDeclared: 2,
            disclosureStatus: "released_aggregate",
            removedReason: null,
            note: "",
          },
        ],
      }),
    ).toThrow(/Small-cell counts cannot be released_aggregate/);

    const missing = draftMissingDataAssessment({
      id: "hsi-rcb-miss-fixture-1",
      cohort,
      status: "partially_assessed",
      variablesAssessed: ["baseline CRP", "follow-up completeness"],
      summary:
        "Fixture missing-data envelope — rates not invented as real clinical missingness",
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });
    expect(missing.inventedMissingnessRates).toBeNull();

    const population = draftPopulationDescription({
      id: "hsi-rcb-pop-fixture-1",
      cohort,
      summary: "Fixture population description — observational association only",
      characteristics: [
        "Adult fixture cohort aggregate",
        "Baseline observation window declared",
      ],
      aggregateNDeclared: 40,
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });
    expect(population.aggregateNDeclared).toBe(40);
    expect(population.disclosureStatus).toBe("released_aggregate");

    const measurement = draftMeasurementAvailability({
      id: "hsi-rcb-meas-fixture-1",
      cohort,
      measurementConcept: "Fixture CRP laboratory concept",
      status: "partially_available",
      summary: "Measurement availability declared for fixture only",
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });
    expect(measurement.status).toBe("partially_available");

    const overlap = draftOverlapComparabilityCheck({
      id: "hsi-rcb-ovl-fixture-1",
      cohort,
      status: "overlap_plausible_declared",
      summary:
        "Fixture exposure/comparator overlap declared without causal identification",
      limitations: [
        "Observational overlap only — confounding unresolved; not a proven treatment effect.",
        "Comparability limited to fixture declarations.",
      ],
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });
    expect(overlap.causalIdentificationClaimed).toBe(false);
  });

  test("cohort discovery returns aggregate or suppressed hits only", () => {
    const cohort = seedFixtureCohort();
    const search = runCohortDiscoverySearch({
      query: {
        id: "hsi-rcb-q-discover-1",
        queryText: "fixture observational",
        requestedIdentifiablePatientLevel: false,
        authoredBy: {
          principalId: "agent-hsi-rcb-1",
          actorKind: "ai_agent",
        },
        createdAt: asOf,
      },
      cohorts: [cohort],
      aggregateCountsByCohortId: {
        [cohort.id]: 3,
      },
    });
    expect(search.blockedIdentifiableRequest).toBe(false);
    expect(search.hits.length).toBe(1);
    expect(search.hits[0]?.kind).toBe("aggregate_count_suppressed");
    expect(search.hits[0]?.aggregateCount).toBeNull();
    expect(search.hits[0]?.containsIdentifiablePhi).toBe(false);
    expect(search.inventedPatientCount).toBeNull();
  });

  test("blocked dataset cohorts cannot be accepted; human review required", () => {
    const blocked = seedBlockedCohort();
    expect(blocked.lifecycle).toBe("blocked_awaiting_authorised_dataset");
    expect(() =>
      transitionCohortDefinition({
        cohort: blocked,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher", actorKind: "human"},
      }),
    ).toThrow(/Illegal cohort transition/);

    expect(() =>
      draftMissingDataAssessment({
        id: "hsi-rcb-miss-blocked",
        cohort: blocked,
        status: "assessed_declared",
        variablesAssessed: ["x"],
        summary: "Must fail while blocked",
        authoredByPrincipalId: "agent-hsi-rcb-1",
        createdAt: asOf,
      }),
    ).toThrow(/Cannot declare assessed missing-data/);

    const fixture = seedFixtureCohort();
    const underReview = transitionCohortDefinition({
      cohort: fixture,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-rcb-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionCohortDefinition({
        cohort: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-rcb-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);
    const accepted = transitionCohortDefinition({
      cohort: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_limitations");
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const cohort = seedFixtureCohort();
    const eligibility = draftEligibilityAssessment({
      id: "hsi-rcb-elig-store",
      cohort,
      subjectRefKind: "cohort_aggregate",
      subjectOrCohortRef: "cohort-rcb-store-1",
      decision: "eligible_declared",
      matchedInclusionCriterionIds: ["hsi-rcb-crit-inc-diagnosis"],
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });
    const attrition = draftAttritionReport({
      id: "hsi-rcb-atr-store",
      cohort,
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
      steps: [
        {
          stepKind: "final_analytic_cohort",
          label: "Final",
          countDeclared: 15,
          disclosureStatus: "released_aggregate",
          removedReason: null,
          note: "",
        },
      ],
    });
    const missing = draftMissingDataAssessment({
      id: "hsi-rcb-miss-store",
      cohort,
      status: "not_assessed",
      variablesAssessed: ["baseline"],
      summary: "Not assessed in store fixture",
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });
    const population = draftPopulationDescription({
      id: "hsi-rcb-pop-store",
      cohort,
      summary: "Store fixture population",
      characteristics: ["Fixture characteristic"],
      aggregateNDeclared: 15,
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });
    const measurement = draftMeasurementAvailability({
      id: "hsi-rcb-meas-store",
      cohort,
      measurementConcept: "Store concept",
      status: "not_assessed",
      summary: "Not assessed",
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });
    const overlap = draftOverlapComparabilityCheck({
      id: "hsi-rcb-ovl-store",
      cohort,
      status: "not_assessed",
      summary: "Overlap not assessed in store fixture",
      limitations: [
        "Observational comparability not assessed; confounding unresolved.",
      ],
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });
    const search = runCohortDiscoverySearch({
      query: {
        id: "hsi-rcb-q-store",
        queryText: "fixture",
        requestedIdentifiablePatientLevel: false,
        authoredBy: {
          principalId: "agent-hsi-rcb-1",
          actorKind: "ai_agent",
        },
        createdAt: asOf,
      },
      cohorts: [cohort],
      aggregateCountsByCohortId: {[cohort.id]: 15},
    });
    const disclosure = draftDisclosureDecision({
      id: "hsi-rcb-disc-store",
      cohort,
      cellLabel: "Store cell",
      rawCountDeclared: 15,
      authoredByPrincipalId: "agent-hsi-rcb-1",
      createdAt: asOf,
    });

    const store = createMemoryReproducibleCohortBuilderStore();
    store.upsertCohort(cohort);
    store.upsertEligibility(eligibility);
    store.upsertAttrition(attrition);
    store.upsertMissingData(missing);
    store.upsertPopulation(population);
    store.upsertMeasurement(measurement);
    store.upsertOverlap(overlap);
    store.upsertSearchResult(search);
    store.upsertDisclosure(disclosure);

    expect(store.listCohorts(cohort.rweStudyId)).toHaveLength(1);
    expect(store.listEligibility(cohort.id)).toHaveLength(1);
    expect(store.listAttrition(cohort.id)).toHaveLength(1);
    expect(store.listSearchResults()).toHaveLength(1);

    const lines = projectReproducibleCohortBuilderPersistenceLines({
      cohorts: [cohort],
      attrition: [attrition],
      eligibility: [eligibility],
      missingData: [missing],
      population: [population],
      measurement: [measurement],
      overlap: [overlap],
      searchResults: [search],
      disclosure: [disclosure],
    });
    expect(lines).toContain("noUnrestrictedPatientDb=true");
    expect(lines).toContain("observationalCohortIsNotProvenEffect=true");
    expect(lines).toContain("noIdentifiableSearch=true");
    expect(lines).toContain("smallCellDisclosure=true");
    expect(lines).toContain("liveEhrQuery=false");

    const pack = buildReproducibleCohortBuilderPack({
      cohorts: [cohort],
      attrition: [attrition],
      eligibility: [eligibility],
      missingData: [missing],
      population: [population],
      measurement: [measurement],
      overlap: [overlap],
      searchResults: [search],
      disclosure: [disclosure],
      asOf,
    });
    expect(pack.cohortCount).toBe(1);
    expect(pack.honesty.noPhiIngestion).toBe(true);
    expect(pack.honesty.noIdentifiablePatientLevelExposureViaSearch).toBe(true);
  });
});
