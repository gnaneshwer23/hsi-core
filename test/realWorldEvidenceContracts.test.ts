/**
 * Milestone 14 PR1 — clinical evidence / RWE contract honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  DATASET_AVAILABILITY,
  buildRealWorldEvidencePack,
  createMemoryRealWorldEvidenceStore,
  draftRweAnalysisResult,
  draftRweLongitudinalObservation,
  draftRweOutcome,
  draftRweStudyRecord,
  draftRweTreatmentExposure,
  fingerprintRweStudyRecord,
  projectRealWorldEvidencePersistenceLines,
  transitionRweAnalysisResult,
  transitionRweStudyRecord,
  type RweStudyRecord,
} from "../src/realWorldEvidenceContracts";

const asOf = "2026-11-09T19:00:00.000Z";

function seedBlockedStudy(
  overrides?: Partial<Parameters<typeof draftRweStudyRecord>[0]>,
): RweStudyRecord {
  return draftRweStudyRecord({
    id: "hsi-rwe-study-ssc-outcomes-fixture",
    scientificQuestion:
      "How do observed SSc trajectories relate to declared research exposures without claiming proven treatment effects?",
    studyDesign: "observational_cohort",
    dataSource: "No authorised clinical dataset supplied (blocker declared)",
    dataControllerOrOwner: "Not assigned — awaiting authorised controller",
    permittedPurpose: "Engineering contract exercise only",
    populationDefinition:
      "Adult SSc research phenotype considerations — not individual eligibility",
    protocolVersion: "0.1.0-fixture",
    analysisVersion: "0.1.0-fixture",
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "agent-hsi-rwe-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    orgId: "org-hsi-fixture-1",
    investigationId: "inv-ssc-mech-001",
    translationalDevelopmentProgrammeId: "hsi-td-prog-ssc-tfh-fixture",
    trialConceptId: "hsi-td-trial-ssc-concept-fixture",
    therapeuticProgrammeId: "hsi-tx-prog-ssc-il6-fixture",
    ...overrides,
  });
}

function seedFixtureStudy(): RweStudyRecord {
  return draftRweStudyRecord({
    id: "hsi-rwe-study-fixture-demo",
    scientificQuestion:
      "Fixture observational envelope for contract exercise — not causal identification.",
    studyDesign: "observational_cohort",
    dataSource: "Engineering fixture synthetic cohort",
    dataControllerOrOwner: "HSI fixture controller",
    permittedPurpose: "Engineering fixture only",
    populationDefinition: "Fixture cohort aggregate",
    protocolVersion: "0.1.0-fixture",
    analysisVersion: "0.1.0-fixture",
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "agent-hsi-rwe-1",
    createdAt: asOf,
  });
}

describe("real-world evidence contracts (M14 PR1)", () => {
  test("drafts study with M9/M12/M13 links and blocked dataset honesty", () => {
    const study = seedBlockedStudy();
    expect(study.lifecycle).toBe("blocked_awaiting_authorised_dataset");
    expect(study.datasetAvailability).toBe(
      "blocked_no_authorised_clinical_dataset",
    );
    expect(study.honesty.noUnrestrictedCentralPatientDatabase).toBe(true);
    expect(
      study.honesty.observationalAssociationIsNotProvenTreatmentEffect,
    ).toBe(true);
    expect(study.honesty.pseudonymisedMayStillBePersonalData).toBe(true);
    expect(study.honesty.identifiableRecordsOutsideScientificKg).toBe(true);
    expect(study.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(study.translationalDevelopmentProgrammeId).toBe(
      "hsi-td-prog-ssc-tfh-fixture",
    );
    expect(study.trialConceptId).toBe("hsi-td-trial-ssc-concept-fixture");
    expect(study.therapeuticProgrammeId).toBe("hsi-tx-prog-ssc-il6-fixture");
    expect(fingerprintRweStudyRecord(study)).toMatch(/^[a-f0-9]{64}$/);
    expect(DATASET_AVAILABILITY).toContain(
      "blocked_no_authorised_clinical_dataset",
    );
  });

  test("refuses accepting blocked studies and forged identifiers/effects", () => {
    const study = seedBlockedStudy();
    expect(() =>
      transitionRweStudyRecord({
        study,
        to: "accepted_for_further_research",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher", actorKind: "human"},
      }),
    ).toThrow(/Illegal study transition|Cannot accept study/);

    expect(() =>
      seedBlockedStudy({
        scientificQuestion:
          "Proven treatment effect with n = 240 and hazard ratio = 0.55",
      }),
    ).toThrow(/must not invent/);

    expect(() =>
      seedBlockedStudy({therapeuticProgrammeId: "bad-id"}),
    ).toThrow(/therapeuticProgrammeId/);
  });

  test("observations use pseudonymous/cohort refs and refuse PHI", () => {
    const study = seedFixtureStudy();
    const obs = draftRweLongitudinalObservation({
      id: "hsi-rwe-obs-fixture-1",
      study,
      subjectRefKind: "pseudonymous_subject",
      subjectOrCohortRef: "pseudo-subj-fixture-001",
      eventType: "laboratory_measurement",
      observationTime: asOf,
      eventTime: asOf,
      dataSource: "fixture_synthetic",
      clinicalConcept: "Fixture CRP concept",
      measurementValue: "declared-fixture-value",
      unit: "mg/L",
      missingness: "observed",
      provenance: "fixture engineering pack",
      authoredByPrincipalId: "agent-hsi-rwe-1",
      createdAt: asOf,
    });
    expect(obs.containsIdentifiablePhi).toBe(false);
    expect(obs.subjectRefKind).toBe("pseudonymous_subject");

    expect(() =>
      draftRweLongitudinalObservation({
        id: "hsi-rwe-obs-bad-id",
        study,
        subjectRefKind: "pseudonymous_subject",
        subjectOrCohortRef: "nhs-1234567890",
        eventType: "x",
        observationTime: asOf,
        dataSource: "y",
        clinicalConcept: "z",
        missingness: "observed",
        provenance: "p",
        authoredByPrincipalId: "agent-hsi-rwe-1",
        createdAt: asOf,
      }),
    ).toThrow(/Direct personal identifier/);
  });

  test("exposures never recommend treatment; outcomes never claim efficacy", () => {
    const study = seedFixtureStudy();
    const exposure = draftRweTreatmentExposure({
      id: "hsi-rwe-exp-fixture-1",
      study,
      subjectRefKind: "cohort_aggregate",
      subjectOrCohortRef: "cohort-fixture-001",
      interventionIdentity: "Fixture immunomodulator catalogue identity",
      exposureUncertainty: "Exposure ascertainment incomplete in fixture",
      exposureStart: asOf,
      authoredByPrincipalId: "agent-hsi-rwe-1",
      createdAt: asOf,
    });
    expect(exposure.treatmentRecommended).toBe(false);

    const outcome = draftRweOutcome({
      id: "hsi-rwe-out-fixture-1",
      study,
      subjectRefKind: "cohort_aggregate",
      subjectOrCohortRef: "cohort-fixture-001",
      outcomeDefinition: "Fixture composite progression outcome definition",
      measurementMethod: "Declared fixture method",
      missingness: "unknown",
      validationStatus: "defined_only",
      authoredByPrincipalId: "agent-hsi-rwe-1",
      createdAt: asOf,
    });
    expect(outcome.efficacyClaimed).toBe(false);
  });

  test("analysis results refuse causal identification and invented estimates", () => {
    const study = seedFixtureStudy();
    const analysis = draftRweAnalysisResult({
      id: "hsi-rwe-anl-fixture-1",
      study,
      researchQuestion:
        "Fixture estimand exercise — association envelope only",
      estimand:
        "Association between declared fixture exposure and fixture outcome under unspecified confounding",
      cohortVersion: "fixture-cohort-v0",
      analysisMethod: "Descriptive association envelope (not causal identification)",
      uncertaintySummary:
        "No authorised effect estimate; uncertainty not quantified",
      limitations: [
        "Observational association only — confounding unresolved; not a proven treatment effect.",
      ],
      provenance: "fixture engineering pack",
      authoredByPrincipalId: "agent-hsi-rwe-1",
      createdAt: asOf,
    });
    expect(analysis.causalIdentificationClaimed).toBe(false);
    expect(analysis.observationalAssociationIsNotProvenTreatmentEffect).toBe(
      true,
    );
    expect(analysis.inventedPatientCount).toBeNull();
    expect(analysis.inventedEffectEstimate).toBeNull();

    expect(() =>
      draftRweAnalysisResult({
        id: "hsi-rwe-anl-bad",
        study,
        researchQuestion: "bad",
        estimand: "e",
        cohortVersion: "c",
        analysisMethod: "m",
        uncertaintySummary: "u",
        limitations: ["No mention of required constraint class."],
        provenance: "p",
        authoredByPrincipalId: "agent-hsi-rwe-1",
        createdAt: asOf,
      }),
    ).toThrow(/observational\/association\/causal\/confounding/);

    const underReview = transitionRweAnalysisResult({
      analysis,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-rwe-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionRweAnalysisResult({
        analysis: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-rwe-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const study = seedFixtureStudy();
    const observation = draftRweLongitudinalObservation({
      id: "hsi-rwe-obs-store",
      study,
      subjectRefKind: "cohort_aggregate",
      subjectOrCohortRef: "cohort-store-1",
      eventType: "clinical_event",
      observationTime: asOf,
      dataSource: "fixture",
      clinicalConcept: "Fixture concept",
      missingness: "missing",
      provenance: "store fixture",
      authoredByPrincipalId: "agent-hsi-rwe-1",
      createdAt: asOf,
    });
    const exposure = draftRweTreatmentExposure({
      id: "hsi-rwe-exp-store",
      study,
      subjectRefKind: "cohort_aggregate",
      subjectOrCohortRef: "cohort-store-1",
      interventionIdentity: "Fixture intervention",
      exposureUncertainty: "Unknown",
      authoredByPrincipalId: "agent-hsi-rwe-1",
      createdAt: asOf,
    });
    const outcome = draftRweOutcome({
      id: "hsi-rwe-out-store",
      study,
      subjectRefKind: "cohort_aggregate",
      subjectOrCohortRef: "cohort-store-1",
      outcomeDefinition: "Fixture outcome",
      measurementMethod: "Fixture method",
      missingness: "unknown",
      authoredByPrincipalId: "agent-hsi-rwe-1",
      createdAt: asOf,
    });
    const analysis = draftRweAnalysisResult({
      id: "hsi-rwe-anl-store",
      study,
      researchQuestion: "Store fixture question",
      estimand: "Store fixture estimand",
      cohortVersion: "v0",
      analysisMethod: "descriptive",
      uncertaintySummary: "unknown",
      limitations: ["Observational association; confounding not assessed."],
      provenance: "store",
      authoredByPrincipalId: "agent-hsi-rwe-1",
      createdAt: asOf,
    });

    const store = createMemoryRealWorldEvidenceStore();
    store.upsertStudy(study);
    store.upsertObservation(observation);
    store.upsertExposure(exposure);
    store.upsertOutcome(outcome);
    store.upsertAnalysis(analysis);
    expect(store.listStudies()).toHaveLength(1);
    expect(store.listObservations(study.id)).toHaveLength(1);
    expect(store.listExposures(study.id)).toHaveLength(1);
    expect(store.listOutcomes(study.id)).toHaveLength(1);
    expect(store.listAnalyses(study.id)).toHaveLength(1);

    const lines = projectRealWorldEvidencePersistenceLines({
      study,
      observations: [observation],
      exposures: [exposure],
      outcomes: [outcome],
      analyses: [analysis],
    });
    expect(lines).toContain("noUnrestrictedPatientDb=true");
    expect(lines).toContain("observationalIsNotProvenEffect=true");
    expect(lines).toContain("inventedPatientCounts=false");
    expect(lines).toContain("phiIngestion=false");

    const pack = buildRealWorldEvidencePack({
      studies: [study],
      observations: [observation],
      exposures: [exposure],
      outcomes: [outcome],
      analyses: [analysis],
      asOf,
    });
    expect(pack.studyCount).toBe(1);
    expect(pack.honesty.noPhiIngestion).toBe(true);
  });

  test("fixture study can move to under_review then human accept", () => {
    const study = seedFixtureStudy();
    expect(study.lifecycle).toBe("draft");
    const underReview = transitionRweStudyRecord({
      study,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-rwe-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionRweStudyRecord({
        study: underReview,
        to: "accepted_for_further_research",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-rwe-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);
    const accepted = transitionRweStudyRecord({
      study: underReview,
      to: "accepted_for_further_research",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_for_further_research");
  });
});
