/**
 * Milestone 13 / PR1 — translational development pack check.
 * Offline contracts only — no trial execution, sample-size invention,
 * readiness engine, workbench UI, or regulatory claims.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  buildTranslationalDevelopmentPack,
  draftBiomarkerDevelopmentRecord,
  draftClinicalTrialConcept,
  draftDevelopmentProgramme,
  draftTranslationalEvidenceAssessment,
  projectTranslationalDevelopmentPersistenceLines,
  TRANSLATIONAL_DEVELOPMENT_METHOD,
  TRANSLATIONAL_DEVELOPMENT_SCHEMA,
  TRANSLATIONAL_DEVELOPMENT_VERSION,
  transitionBiomarkerDevelopmentRecord,
  transitionClinicalTrialConcept,
  transitionDevelopmentProgramme,
  transitionTranslationalEvidenceAssessment,
} from "../src/translationalDevelopmentContracts";

const asOf = "2026-11-09T18:00:00.000Z";
const outDir = "evaluation/translational-development";

function fixturePack() {
  const draft = draftDevelopmentProgramme({
    id: "hsi-td-prog-fixture-demo",
    name: "Fixture translational development programme",
    therapeuticHypothesis:
      "Fixture therapeutic hypothesis for contract exercise — not a treatment claim.",
    diseaseContext: "Fixture disease context",
    phenotypeContext: "Fixture phenotype context",
    intendedResearchIndication:
      "Engineering fixture only — not a regulatory indication.",
    authoredByPrincipalId: "fixture-agent-td",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    developmentStage: "translational_evidence_review",
    investigationId: "inv-fixture-001",
    hypothesisIds: ["hyp-fixture-001"],
    orgId: "org-fixture-1",
    therapeuticProgrammeId: "hsi-tx-prog-fixture-demo",
    therapeuticTargetIds: ["hsi-tx-tgt-fixture-demo"],
    therapeuticInterventionIds: ["hsi-tx-int-fixture-demo"],
  });
  const underReview = transitionDevelopmentProgramme({
    programme: draft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-td", actorKind: "ai_agent"},
  });
  const programme = transitionDevelopmentProgramme({
    programme: underReview,
    to: "accepted_for_further_research",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const assessmentDraft = draftTranslationalEvidenceAssessment({
    id: "hsi-td-assess-fixture-demo",
    programme,
    summary:
      "Fixture assessment: associative/mechanistic signals with explicit gaps — not clinical readiness.",
    targetValidity: "associative_only",
    humanBiologicalRelevance: "mechanistic_hypothesis",
    preclinicalEvidence: "insufficient",
    pharmacologyEvidence: "not_assessed",
    targetEngagement: "not_assessed",
    safetyEvidence: "insufficient",
    modelRelevance: "conflicting",
    keyUncertainties: ["Model-to-human relevance unresolved."],
    missingStudies: ["Authorised pharmacology characterisation."],
    authoredByPrincipalId: "fixture-agent-td",
    createdAt: asOf,
  });
  const assessmentReviewed = transitionTranslationalEvidenceAssessment({
    assessment: assessmentDraft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-td", actorKind: "ai_agent"},
  });
  const assessment = transitionTranslationalEvidenceAssessment({
    assessment: assessmentReviewed,
    to: "accepted_with_gaps",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const conceptDraft = draftClinicalTrialConcept({
    id: "hsi-td-trial-fixture-demo",
    programme,
    researchQuestion:
      "Could a fixture exploratory research concept be reviewed without claiming approval?",
    investigationalIntervention: "Fixture intervention concept",
    intendedPopulation: "Fixture population considerations",
    comparatorConcept: "Fixture comparator concept",
    primaryObjective: "Concept review exercise only — not efficacy.",
    exploratoryObjectives: ["Explore biomarker collection questions."],
    candidateEndpoints: ["Fixture candidate endpoint"],
    biomarkerStrategy: "Exploratory only — not a validated selection test.",
    eligibilityConsiderations: [
      "Population-level considerations only — not individual eligibility.",
    ],
    statisticalAssumptions: [
      "Effect-size assumptions not yet defensible — statistical review required.",
    ],
    feasibilityAssumptions: ["Recruitment rates unknown — do not invent."],
    ethicalAndRegulatoryConsiderations: [
      "Qualified clinical, statistical, ethics and regulatory review required.",
    ],
    authoredByPrincipalId: "fixture-agent-td",
    createdAt: asOf,
  });
  const conceptSci = transitionClinicalTrialConcept({
    concept: conceptDraft,
    to: "under_scientific_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-td", actorKind: "ai_agent"},
  });
  const conceptStat = transitionClinicalTrialConcept({
    concept: conceptSci,
    to: "under_statistical_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-statistician", actorKind: "human"},
  });
  const conceptEthics = transitionClinicalTrialConcept({
    concept: conceptStat,
    to: "under_ethics_regulatory_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-ethicist", actorKind: "human"},
  });
  const concept = transitionClinicalTrialConcept({
    concept: conceptEthics,
    to: "accepted_as_concept_only",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const biomarkerDraft = draftBiomarkerDevelopmentRecord({
    id: "hsi-td-bm-fixture-demo",
    programme,
    name: "Fixture exploratory biomarker",
    biologicalIdentity: "Fixture biological identity",
    specimenAndAssay: "Fixture specimen/assay (availability unverified)",
    contextOfUse: "pharmacodynamic",
    validationStatus: "exploratory",
    confounders: ["Disease activity confounding possible."],
    limitations: [
      "Exploratory only — not a qualified or clinically validated biomarker.",
    ],
    authoredByPrincipalId: "fixture-agent-td",
    createdAt: asOf,
  });
  const biomarkerReviewed = transitionBiomarkerDevelopmentRecord({
    record: biomarkerDraft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-td", actorKind: "ai_agent"},
  });
  const biomarker = transitionBiomarkerDevelopmentRecord({
    record: biomarkerReviewed,
    to: "accepted_as_exploratory",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const pack = buildTranslationalDevelopmentPack({
    programmes: [programme],
    assessments: [assessment],
    trialConcepts: [concept],
    biomarkers: [biomarker],
    asOf,
  });
  const persistenceLines = projectTranslationalDevelopmentPersistenceLines({
    programme,
    assessments: [assessment],
    trialConcepts: [concept],
    biomarkers: [biomarker],
  });

  return {pack, persistenceLines};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines} = fixturePack();
  writeFileSync(
    join(outDir, "translational-development-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: TRANSLATIONAL_DEVELOPMENT_SCHEMA,
        method: TRANSLATIONAL_DEVELOPMENT_METHOD,
        version: TRANSLATIONAL_DEVELOPMENT_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        autonomousTrialAuthorisation: false,
        trialConceptIsNotApprovedProtocol: true,
        exploratoryBiomarkerIsNotQualified: true,
        inventedSampleSizes: false,
        fabricatedTrialOutcomes: false,
        workbenchUi: false,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        m12Dependency: "id-pattern-compatible-107-merged",
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
  const {pack} = fixturePack();
  if (
    pack.programmeCount !== 1 ||
    pack.assessmentCount !== 1 ||
    pack.trialConceptCount !== 1 ||
    pack.biomarkerCount !== 1
  ) {
    throw new Error("Translational development pack check failed");
  }
  if (pack.honesty.notAutonomousTrialAuthorisation !== true) {
    throw new Error("Honesty gate failed");
  }
  if (pack.honesty.trialConceptIsNotApprovedProtocol !== true) {
    throw new Error("Trial concept honesty gate failed");
  }
  console.log(
    `translational-development-contracts check ok (${pack.programmeCount} programme, ${pack.assessmentCount} assessment, ${pack.trialConceptCount} trial concept, ${pack.biomarkerCount} biomarker)`,
  );
} else {
  writeOutputs();
  console.log(`Wrote ${outDir}/translational-development-pack.v1.json`);
}
