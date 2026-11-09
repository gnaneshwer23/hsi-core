/**
 * Milestone 14 / PR1 — real-world evidence pack check.
 * Offline contracts only — no live PHI, fabricated counts/effects, or causal claims.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  buildRealWorldEvidencePack,
  draftRweAnalysisResult,
  draftRweLongitudinalObservation,
  draftRweOutcome,
  draftRweStudyRecord,
  draftRweTreatmentExposure,
  projectRealWorldEvidencePersistenceLines,
  REAL_WORLD_EVIDENCE_METHOD,
  REAL_WORLD_EVIDENCE_SCHEMA,
  REAL_WORLD_EVIDENCE_VERSION,
  transitionRweAnalysisResult,
  transitionRweStudyRecord,
} from "../src/realWorldEvidenceContracts";

const asOf = "2026-11-09T19:00:00.000Z";
const outDir = "evaluation/real-world-evidence";

function fixturePack() {
  const blocked = draftRweStudyRecord({
    id: "hsi-rwe-study-blocked-demo",
    scientificQuestion:
      "Blocked scientific path until an authorised clinical dataset is supplied.",
    studyDesign: "observational_cohort",
    dataSource: "None — blocked",
    dataControllerOrOwner: "Unassigned",
    permittedPurpose: "Engineering honesty demonstration",
    populationDefinition: "Not defined — dataset unavailable",
    protocolVersion: "0.1.0-blocked",
    analysisVersion: "0.1.0-blocked",
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "fixture-agent-rwe",
    createdAt: asOf,
  });

  const draft = draftRweStudyRecord({
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
    authoredByPrincipalId: "fixture-agent-rwe",
    createdAt: asOf,
    orgId: "org-fixture-1",
    translationalDevelopmentProgrammeId: "hsi-td-prog-fixture-demo",
    therapeuticProgrammeId: "hsi-tx-prog-fixture-demo",
  });
  const underReview = transitionRweStudyRecord({
    study: draft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-rwe", actorKind: "ai_agent"},
  });
  const study = transitionRweStudyRecord({
    study: underReview,
    to: "accepted_for_further_research",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const observation = draftRweLongitudinalObservation({
    id: "hsi-rwe-obs-fixture-demo",
    study,
    subjectRefKind: "cohort_aggregate",
    subjectOrCohortRef: "cohort-fixture-demo",
    eventType: "laboratory_measurement",
    observationTime: asOf,
    dataSource: "fixture_synthetic",
    clinicalConcept: "Fixture CRP concept",
    missingness: "unknown",
    provenance: "fixture engineering pack",
    authoredByPrincipalId: "fixture-agent-rwe",
    createdAt: asOf,
  });
  const exposure = draftRweTreatmentExposure({
    id: "hsi-rwe-exp-fixture-demo",
    study,
    subjectRefKind: "cohort_aggregate",
    subjectOrCohortRef: "cohort-fixture-demo",
    interventionIdentity: "Fixture intervention identity",
    exposureUncertainty: "Exposure incomplete in fixture",
    authoredByPrincipalId: "fixture-agent-rwe",
    createdAt: asOf,
  });
  const outcome = draftRweOutcome({
    id: "hsi-rwe-out-fixture-demo",
    study,
    subjectRefKind: "cohort_aggregate",
    subjectOrCohortRef: "cohort-fixture-demo",
    outcomeDefinition: "Fixture progression outcome",
    measurementMethod: "Declared fixture method",
    missingness: "unknown",
    authoredByPrincipalId: "fixture-agent-rwe",
    createdAt: asOf,
  });
  const analysisDraft = draftRweAnalysisResult({
    id: "hsi-rwe-anl-fixture-demo",
    study,
    researchQuestion: "Fixture analysis question",
    estimand: "Association envelope under unresolved confounding",
    cohortVersion: "fixture-v0",
    analysisMethod: "Descriptive association envelope",
    uncertaintySummary: "No authorised quantified estimate",
    limitations: [
      "Observational association only — confounding unresolved; not a proven treatment effect.",
    ],
    provenance: "fixture engineering pack",
    authoredByPrincipalId: "fixture-agent-rwe",
    createdAt: asOf,
  });
  const analysisReviewed = transitionRweAnalysisResult({
    analysis: analysisDraft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-rwe", actorKind: "ai_agent"},
  });
  const analysis = transitionRweAnalysisResult({
    analysis: analysisReviewed,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const pack = buildRealWorldEvidencePack({
    studies: [blocked, study],
    observations: [observation],
    exposures: [exposure],
    outcomes: [outcome],
    analyses: [analysis],
    asOf,
  });
  const persistenceLines = projectRealWorldEvidencePersistenceLines({
    study,
    observations: [observation],
    exposures: [exposure],
    outcomes: [outcome],
    analyses: [analysis],
  });

  return {pack, persistenceLines, blocked};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blocked} = fixturePack();
  writeFileSync(
    join(outDir, "real-world-evidence-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: REAL_WORLD_EVIDENCE_SCHEMA,
        method: REAL_WORLD_EVIDENCE_METHOD,
        version: REAL_WORLD_EVIDENCE_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked: blocked.datasetAvailability,
        scientificPathBlockedNoAuthorisedDataset: true,
        unrestrictedCentralPatientDatabase: false,
        observationalIsNotProvenTreatmentEffect: true,
        identifiableOutsideKg: true,
        pseudonymisedMayStillBePersonalData: true,
        phiIngestion: false,
        inventedPatientCounts: false,
        inventedEffectEstimates: false,
        workbenchUi: false,
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
  const {pack, blocked} = fixturePack();
  if (pack.studyCount !== 2 || pack.analysisCount !== 1) {
    throw new Error("Real-world evidence pack check failed");
  }
  if (pack.honesty.noUnrestrictedCentralPatientDatabase !== true) {
    throw new Error("Honesty gate failed");
  }
  if (
    blocked.datasetAvailability !== "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `real-world-evidence-contracts check ok (${pack.studyCount} studies, ${pack.observationCount} observations, ${pack.analysisCount} analyses; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(`Wrote ${outDir}/real-world-evidence-pack.v1.json`);
}
