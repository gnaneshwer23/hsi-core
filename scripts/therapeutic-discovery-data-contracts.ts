/**
 * Milestone 12 / PR1 — therapeutic discovery data pack check.
 * Offline contracts only — no ChEMBL live pull, repurposing engine, or efficacy claims.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  buildTherapeuticDiscoveryPack,
  draftCompoundOrIntervention,
  draftTargetCandidate,
  draftTargetInterventionAssessment,
  draftTherapeuticProgramme,
  projectTherapeuticDiscoveryPersistenceLines,
  THERAPEUTIC_DISCOVERY_METHOD,
  THERAPEUTIC_DISCOVERY_SCHEMA,
  THERAPEUTIC_DISCOVERY_VERSION,
  transitionTargetCandidate,
  transitionTargetInterventionAssessment,
  transitionTherapeuticProgramme,
} from "../src/therapeuticDiscoveryDataContracts";

const asOf = "2026-11-09T16:00:00.000Z";
const outDir = "evaluation/therapeutic-discovery-data";

function fixturePack() {
  const draft = draftTherapeuticProgramme({
    id: "hsi-tx-prog-fixture-demo",
    name: "Fixture therapeutic discovery programme",
    researchQuestion:
      "Which fixture pathway targets deserve further investigation without claiming efficacy?",
    diseaseContext: "Fixture disease context",
    indicationScope: "Engineering fixture only — not a clinical programme.",
    authoredByPrincipalId: "fixture-agent-tx",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    investigationId: "inv-fixture-001",
    hypothesisIds: ["hyp-fixture-001"],
    orgId: "org-fixture-1",
  });
  const scoped = transitionTherapeuticProgramme({
    programme: draft,
    to: "scoped",
    updatedAt: asOf,
  });
  const programme = transitionTherapeuticProgramme({
    programme: scoped,
    to: "active_investigation",
    updatedAt: asOf,
  });

  const targetDraft = draftTargetCandidate({
    id: "hsi-tx-tgt-fixture-demo",
    programme,
    name: "FIXTURE1",
    geneSymbol: "FIXTURE1",
    rationale: "Fixture associative neighbourhood for contract exercise.",
    biologicalPlausibilityNote:
      "Plausibility declared for engineering only — not predictive validity.",
    authoredByPrincipalId: "fixture-agent-tx",
    createdAt: asOf,
    evidenceStrength: "associative_only",
    identities: [
      {
        system: "chembl",
        value: "CHEMBL25",
        label: "fixture chembl stub",
        resolution: "stub_only",
        claimSupport: "not_assessed",
      },
    ],
  });
  const targetReviewed = transitionTargetCandidate({
    target: targetDraft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-tx", actorKind: "ai_agent"},
  });
  const target = transitionTargetCandidate({
    target: targetReviewed,
    to: "prioritised_for_investigation",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const intervention = draftCompoundOrIntervention({
    id: "hsi-tx-int-fixture-demo",
    programme,
    name: "Fixture molecular compound",
    interventionKind: "molecular_compound",
    publicSmiles: "CCO",
    authoredByPrincipalId: "fixture-agent-tx",
    createdAt: asOf,
  });

  const assessmentDraft = draftTargetInterventionAssessment({
    id: "hsi-tx-assess-fixture-demo",
    programme,
    target,
    intervention,
    summary:
      "Fixture assessment: associative only; further investigation may be warranted.",
    conclusionKind: "further_investigation_warranted",
    evidenceStrength: "associative_only",
    remainingUncertainties: ["No authorised causal evidence."],
    infoRequiredBeforeFurtherWork: ["Define discriminating experiment."],
    authoredByPrincipalId: "fixture-agent-tx",
    createdAt: asOf,
  });
  const assessmentSubmitted = transitionTargetInterventionAssessment({
    assessment: assessmentDraft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-tx", actorKind: "ai_agent"},
  });
  const assessment = transitionTargetInterventionAssessment({
    assessment: assessmentSubmitted,
    to: "accepted_for_further_investigation",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const pack = buildTherapeuticDiscoveryPack({
    programmes: [programme],
    targets: [target],
    interventions: [intervention],
    assessments: [assessment],
    asOf,
  });
  const persistenceLines = projectTherapeuticDiscoveryPersistenceLines({
    programme,
    targets: [target],
    interventions: [intervention],
    assessments: [assessment],
  });

  return {pack, persistenceLines};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines} = fixturePack();
  writeFileSync(
    join(outDir, "therapeutic-discovery-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: THERAPEUTIC_DISCOVERY_SCHEMA,
        method: THERAPEUTIC_DISCOVERY_METHOD,
        version: THERAPEUTIC_DISCOVERY_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        chemblLivePull: false,
        repurposingEngine: false,
        efficacyClaimed: false,
        safetyClaimed: false,
        clinicalSuitabilityClaimed: false,
        treatmentRecommended: false,
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
  const {pack} = fixturePack();
  if (pack.programmeCount !== 1 || pack.targetCount !== 1) {
    throw new Error("Therapeutic discovery pack check failed");
  }
  if (pack.honesty.noChemblLivePull !== true) {
    throw new Error("Honesty gate failed");
  }
  console.log(
    `therapeutic-discovery-data-contracts check ok (${pack.programmeCount} programme, ${pack.targetCount} target)`,
  );
} else {
  writeOutputs();
  console.log(`Wrote ${outDir}/therapeutic-discovery-pack.v1.json`);
}
