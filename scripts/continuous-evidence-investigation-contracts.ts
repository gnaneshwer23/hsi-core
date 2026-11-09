/**
 * Milestone 17 / PR3 — continuous evidence investigation pack check.
 * Offline contracts only — no auto-approval, consensus claims, or fabricated discoveries.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  activateProgrammeSourceSubscription,
  assessProgrammeEvidenceImpact,
  buildContinuousEvidenceInvestigationPack,
  CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD,
  CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA,
  CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION,
  detectEvidenceChange,
  detectProgrammeEvidenceContradiction,
  draftProgrammeSourceSubscription,
  extractEvidenceContext,
  ingestProgrammeEvidenceItem,
  projectContinuousEvidenceInvestigationPersistenceLines,
  recordRetractionOrCorrection,
  recordScheduledEvidenceRetrieval,
} from "../src/continuousEvidenceInvestigationContracts";

const asOf = "2026-11-09T17:00:00.000Z";
const outDir = "evaluation/continuous-evidence-investigation";

function fixturePack() {
  const draft = draftProgrammeSourceSubscription({
    id: "hsi-sp-psub-fixture-demo",
    programmeId: "hsi-sp-prog-fixture-demo",
    topicLabel: "Fixture programme literature subscription",
    sourceKinds: [
      "europe_pmc",
      "open_targets",
      "clinicaltrials_gov",
      "uniprot",
      "reactome_stub",
      "approved_omics",
      "authorised_research_dataset",
      "clinical_experimental_evidence_service",
    ],
    scheduleInterval: "daily_bounded",
    authoredByPrincipalId: "fixture-agent-cei",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    planId: "hsi-sp-plan-fixture-demo",
    workstreamId: "hsi-sp-ws-fixture-demo",
    m8SubscriptionId: "m8-sub-fixture-demo",
    nextRetrievalAt: asOf,
  });

  const subscription = activateProgrammeSourceSubscription({
    subscription: draft,
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
    nextRetrievalAt: asOf,
  });

  const retrieval = recordScheduledEvidenceRetrieval({
    id: "hsi-sp-sret-fixture-demo",
    subscription,
    status: "completed_bounded",
    scheduledAt: asOf,
    startedAt: asOf,
    completedAt: asOf,
    retrievedAt: asOf,
    hitCountBounded: 2,
    truncatedByBudget: false,
    liveNetworkUsed: false,
    offlineFixture: true,
    snapshotRef: "snap://fixture/cei-demo",
    authoredByPrincipalId: "fixture-cei-scheduler",
    authoredByActorKind: "service",
  });

  const evidenceA = ingestProgrammeEvidenceItem({
    id: "hsi-sp-evid-fixture-a",
    subscription,
    retrieval,
    sourceKind: "europe_pmc",
    externalId: "PMID:8880001",
    title: "Fixture Europe PMC record for programme evidence investigation",
    classification: "literature_record",
    sourceIdentityState: "verified_fixture",
    extractedClaimSummary:
      "Fixture extracted claim for human review — not auto-approved.",
    priorEvidence: [],
    snapshotRef: "snap://fixture/cei-demo#a",
    retrievedAt: asOf,
    createdAt: asOf,
  });

  const evidenceB = ingestProgrammeEvidenceItem({
    id: "hsi-sp-evid-fixture-b",
    subscription,
    retrieval,
    sourceKind: "open_targets",
    externalId: "EFO_0000699",
    title: "Fixture Open Targets association for programme scoping",
    classification: "target_association",
    sourceIdentityState: "verified_fixture",
    priorEvidence: [evidenceA],
    snapshotRef: "snap://fixture/cei-demo#b",
    retrievedAt: asOf,
    createdAt: asOf,
  });

  const context = extractEvidenceContext({
    id: "hsi-sp-ctx-fixture-demo",
    evidence: evidenceA,
    contextSummary:
      "Fixture context extraction for workstream review — not a consensus change.",
    authoredByPrincipalId: "fixture-agent-cei",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    relatedWorkstreamIds: ["hsi-sp-ws-fixture-demo"],
    relatedPlanId: "hsi-sp-plan-fixture-demo",
  });

  const contradiction = detectProgrammeEvidenceContradiction({
    id: "hsi-sp-ctr-fixture-demo",
    evidenceA,
    evidenceB,
    status: "none_detected_fixture",
    summary:
      "Fixture pair recorded with no contradiction candidate — detection is not adjudication.",
    authoredByPrincipalId: "fixture-agent-cei",
    createdAt: asOf,
  });

  const {record: retraction, evidence: retractedA} = recordRetractionOrCorrection({
    id: "hsi-sp-rtx-fixture-demo",
    evidence: evidenceA,
    kind: "correction",
    summary: "Fixture correction notice — retracted/corrected is not valid support.",
    noticedAt: asOf,
    authoredByPrincipalId: "fixture-cei-retraction-watch",
    authoredByActorKind: "service",
  });

  const change = detectEvidenceChange({
    id: "hsi-sp-chg-fixture-demo",
    evidence: retractedA,
    changeKind: "retraction_or_correction",
    summary:
      "Fixture evidence change after correction — new publication is not consensus change.",
    previousSnapshotRef: evidenceA.snapshotRef,
    currentSnapshotRef: "snap://fixture/cei-demo#a-corrected",
    detectedAt: asOf,
    authoredByPrincipalId: "fixture-cei-change-watch",
    authoredByActorKind: "service",
  });

  const impact = assessProgrammeEvidenceImpact({
    id: "hsi-sp-imp-fixture-demo",
    programmeId: "hsi-sp-prog-fixture-demo",
    subjectRefs: [retractedA.id, change.id],
    impactClass: "informational_only",
    summary:
      "Fixture programme impact advisory only — not auto-approval and not consensus change.",
    authoredByPrincipalId: "fixture-agent-cei",
    createdAt: asOf,
    requiresHumanReview: false,
  });

  const pack = buildContinuousEvidenceInvestigationPack({
    subscriptions: [subscription],
    retrievals: [retrieval],
    evidence: [retractedA, evidenceB],
    contexts: [context],
    contradictions: [contradiction],
    retractions: [retraction],
    changes: [change],
    impacts: [impact],
    asOf,
  });

  const persistenceLines = projectContinuousEvidenceInvestigationPersistenceLines({
    subscription,
    retrieval,
    evidence: [retractedA, evidenceB],
    contexts: [context],
    contradictions: [contradiction],
    retractions: [retraction],
    changes: [change],
    impacts: [impact],
  });

  return {pack, persistenceLines};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines} = fixturePack();
  writeFileSync(
    join(outDir, "continuous-evidence-investigation-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: CONTINUOUS_EVIDENCE_INVESTIGATION_SCHEMA,
        method: CONTINUOUS_EVIDENCE_INVESTIGATION_METHOD,
        version: CONTINUOUS_EVIDENCE_INVESTIGATION_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        newPublicationIsNotConsensusChange: true,
        extractedClaimsNotAutoApproved: true,
        retractedIsNotValidSupport: true,
        licencesAndLimitsRespected: true,
        snapshotsAndRetrievalTimestampsPreserved: true,
        extendsM8IncrementalEvidenceMonitoring: true,
        dependsOnPr1ScientificProgrammeContracts: true,
        dependsOnPr2ResearchObjectivePlanning: true,
        notSeparateAgentPlatform: true,
        noAutoApprovalOfPlansOrClaims: true,
        noFabricatedDiscoveries: true,
        workbenchUi: false,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        scientificKnowledgeEvolution: false,
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
    pack.subscriptionCount !== 1 ||
    pack.retrievalCount !== 1 ||
    pack.evidenceCount !== 2 ||
    pack.contextCount !== 1 ||
    pack.contradictionCount !== 1 ||
    pack.retractionCount !== 1 ||
    pack.changeCount !== 1 ||
    pack.impactCount !== 1
  ) {
    throw new Error("Continuous evidence investigation pack check failed");
  }
  if (pack.honesty.newPublicationIsNotConsensusChange !== true) {
    throw new Error("Consensus-change honesty gate failed");
  }
  if (pack.honesty.extractedClaimsNotAutoApproved !== true) {
    throw new Error("Extracted-claim auto-approve honesty gate failed");
  }
  if (pack.honesty.retractedIsNotValidSupport !== true) {
    throw new Error("Retraction support honesty gate failed");
  }
  if (pack.honesty.scientificKnowledgeEvolution !== false) {
    throw new Error("Knowledge evolution must stay deferred to PR4");
  }
  if (pack.evidence.some((e) => e.retractedOrCorrected && e.validSupport !== false)) {
    throw new Error("Retracted evidence must not count as valid support");
  }
  console.log("continuous-evidence-investigation contracts check ok");
} else {
  writeOutputs();
  console.log(`wrote ${outDir}`);
}
