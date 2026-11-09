/**
 * Milestone 14 / PR4 — reproducible cohort builder pack check.
 * Offline contracts only — no live PHI, fabricated real counts, or EHR queries.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  REPRODUCIBLE_COHORT_BUILDER_METHOD,
  REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
  REPRODUCIBLE_COHORT_BUILDER_VERSION,
  buildReproducibleCohortBuilderPack,
  draftAttritionReport,
  draftCohortDefinition,
  draftDisclosureDecision,
  draftEligibilityAssessment,
  draftMeasurementAvailability,
  draftMissingDataAssessment,
  draftOverlapComparabilityCheck,
  draftPopulationDescription,
  fixtureInclusionExclusionCriteria,
  projectReproducibleCohortBuilderPersistenceLines,
  runCohortDiscoverySearch,
  transitionCohortDefinition,
} from "../src/reproducibleCohortBuilderContracts";

const asOf = "2026-11-09T22:00:00.000Z";
const outDir = "evaluation/reproducible-cohort-builder";

function fixturePack() {
  const criteria = fixtureInclusionExclusionCriteria();

  const blocked = draftCohortDefinition({
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
    authoredByPrincipalId: "fixture-agent-rcb",
    createdAt: asOf,
  });

  const draft = draftCohortDefinition({
    id: "hsi-rcb-coh-fixture-demo",
    displayName: "Fixture SSc observational cohort envelope",
    scientificQuestion:
      "Fixture reproducible cohort definition — observational association only.",
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
    longitudinalAnalysisSpecId: "hsi-lce-spec-lab-trend-demo",
    authoredByPrincipalId: "fixture-agent-rcb",
    createdAt: asOf,
  });
  const underReview = transitionCohortDefinition({
    cohort: draft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-rcb", actorKind: "ai_agent"},
  });
  const cohort = transitionCohortDefinition({
    cohort: underReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const eligibility = draftEligibilityAssessment({
    id: "hsi-rcb-elig-demo",
    cohort,
    subjectRefKind: "cohort_aggregate",
    subjectOrCohortRef: "cohort-rcb-fixture-demo",
    decision: "eligible_declared",
    matchedInclusionCriterionIds: ["hsi-rcb-crit-inc-diagnosis"],
    authoredByPrincipalId: "fixture-agent-rcb",
    createdAt: asOf,
  });

  const attrition = draftAttritionReport({
    id: "hsi-rcb-atr-demo",
    cohort,
    authoredByPrincipalId: "fixture-agent-rcb",
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

  const missingData = draftMissingDataAssessment({
    id: "hsi-rcb-miss-demo",
    cohort,
    status: "partially_assessed",
    variablesAssessed: ["baseline CRP", "follow-up completeness"],
    summary:
      "Fixture missing-data envelope — rates not invented as real clinical missingness",
    authoredByPrincipalId: "fixture-agent-rcb",
    createdAt: asOf,
  });

  const population = draftPopulationDescription({
    id: "hsi-rcb-pop-demo",
    cohort,
    summary: "Fixture population description — observational association only",
    characteristics: [
      "Adult fixture cohort aggregate",
      "Baseline observation window declared",
    ],
    aggregateNDeclared: 20,
    authoredByPrincipalId: "fixture-agent-rcb",
    createdAt: asOf,
  });

  const measurement = draftMeasurementAvailability({
    id: "hsi-rcb-meas-demo",
    cohort,
    measurementConcept: "Fixture CRP laboratory concept",
    status: "partially_available",
    summary: "Measurement availability declared for fixture only",
    authoredByPrincipalId: "fixture-agent-rcb",
    createdAt: asOf,
  });

  const overlap = draftOverlapComparabilityCheck({
    id: "hsi-rcb-ovl-demo",
    cohort,
    status: "overlap_plausible_declared",
    summary:
      "Fixture exposure/comparator overlap declared without causal identification",
    limitations: [
      "Observational overlap only — confounding unresolved; not a proven treatment effect.",
      "Comparability limited to fixture declarations.",
    ],
    authoredByPrincipalId: "fixture-agent-rcb",
    createdAt: asOf,
  });

  const searchOk = runCohortDiscoverySearch({
    query: {
      id: "hsi-rcb-q-demo",
      queryText: "fixture observational",
      requestedIdentifiablePatientLevel: false,
      authoredBy: {
        principalId: "fixture-agent-rcb",
        actorKind: "ai_agent",
      },
      createdAt: asOf,
    },
    cohorts: [cohort],
    aggregateCountsByCohortId: {[cohort.id]: 20},
  });
  const searchBlocked = runCohortDiscoverySearch({
    query: {
      id: "hsi-rcb-q-ident-demo",
      queryText: "fixture observational",
      requestedIdentifiablePatientLevel: true,
      authoredBy: {
        principalId: "fixture-agent-rcb",
        actorKind: "ai_agent",
      },
      createdAt: asOf,
    },
    cohorts: [cohort],
  });

  const disclosure = draftDisclosureDecision({
    id: "hsi-rcb-disc-demo",
    cohort,
    cellLabel: "Fixture age band cell",
    rawCountDeclared: 3,
    authoredByPrincipalId: "fixture-agent-rcb",
    createdAt: asOf,
  });

  const cohorts = [blocked, cohort];
  const pack = buildReproducibleCohortBuilderPack({
    cohorts,
    attrition: [attrition],
    eligibility: [eligibility],
    missingData: [missingData],
    population: [population],
    measurement: [measurement],
    overlap: [overlap],
    searchResults: [searchOk, searchBlocked],
    disclosure: [disclosure],
    asOf,
  });
  const persistenceLines = projectReproducibleCohortBuilderPersistenceLines({
    cohorts,
    attrition: [attrition],
    eligibility: [eligibility],
    missingData: [missingData],
    population: [population],
    measurement: [measurement],
    overlap: [overlap],
    searchResults: [searchOk, searchBlocked],
    disclosure: [disclosure],
  });

  return {pack, persistenceLines, blocked, searchBlocked, disclosure};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blocked, searchBlocked, disclosure} =
    fixturePack();
  writeFileSync(
    join(outDir, "reproducible-cohort-builder-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: REPRODUCIBLE_COHORT_BUILDER_SCHEMA,
        method: REPRODUCIBLE_COHORT_BUILDER_METHOD,
        version: REPRODUCIBLE_COHORT_BUILDER_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked: blocked.datasetAvailability,
        scientificPathBlockedNoAuthorisedDataset: true,
        unrestrictedCentralPatientDatabase: false,
        observationalCohortIsNotProvenTreatmentEffect: true,
        noIdentifiablePatientLevelExposureViaSearch: true,
        smallCellDisclosureControlsRequired: true,
        identifiableOutsideKg: true,
        pseudonymisedMayStillBePersonalData: true,
        phiIngestion: false,
        inventedPatientCounts: false,
        liveEhrQuery: false,
        workbenchUi: false,
        blockedIdentifiableSearchDemo: searchBlocked.blockedIdentifiableRequest,
        smallCellSuppressedDemo: disclosure.status === "suppressed_small_cell",
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        cohortCount: pack.cohortCount,
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
  const {pack, blocked, searchBlocked, disclosure} = fixturePack();
  if (pack.cohortCount < 2 || pack.searchResultCount !== 2) {
    throw new Error("Reproducible cohort builder pack check failed");
  }
  if (pack.honesty.noUnrestrictedCentralPatientDatabase !== true) {
    throw new Error("Honesty gate failed");
  }
  if (pack.honesty.noIdentifiablePatientLevelExposureViaSearch !== true) {
    throw new Error("Identifiable search honesty gate failed");
  }
  if (pack.honesty.smallCellDisclosureControlsRequired !== true) {
    throw new Error("Small-cell disclosure honesty gate failed");
  }
  if (
    blocked.datasetAvailability !== "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  if (!searchBlocked.blockedIdentifiableRequest) {
    throw new Error("Identifiable search must fail closed");
  }
  if (disclosure.status !== "suppressed_small_cell") {
    throw new Error("Small-cell disclosure demo must suppress");
  }
  console.log(
    `reproducible-cohort-builder-contracts check ok (${pack.cohortCount} cohorts, ${pack.attritionCount} attrition, ${pack.searchResultCount} searches; dataset blocked declared; identifiable search blocked; small cells suppressed)`,
  );
} else {
  writeOutputs();
  console.log(`Wrote ${outDir}/reproducible-cohort-builder-pack.v1.json`);
}
