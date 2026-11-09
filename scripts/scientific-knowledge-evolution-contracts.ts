/**
 * Milestone 17 / PR4 — scientific knowledge evolution pack check.
 * Offline contracts only — no auto-approval, KG promotion, or fabricated discoveries.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  appendKnowledgeEvolutionAuditEvent,
  applyApprovedKnowledgeChange,
  buildScientificKnowledgeEvolutionPack,
  decideIndependentScientificReview,
  generateProposedKnowledgeChange,
  identifyDownstreamAffectedInvestigations,
  notifyAuthorisedProgrammeMembers,
  openKnowledgeEvolutionEpisode,
  preservePriorGraphVersion,
  projectScientificKnowledgeEvolutionPersistenceLines,
  recordEvolutionWorkflowStep,
  recordKnowledgeState,
  requestIndependentScientificReview,
  SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
  SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
  SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
  transitionKnowledgeState,
} from "../src/scientificKnowledgeEvolutionContracts";

const asOf = "2026-11-09T18:00:00.000Z";
const outDir = "evaluation/scientific-knowledge-evolution";

function fixturePack() {
  const episode = openKnowledgeEvolutionEpisode({
    id: "hsi-sp-kev-fixture-demo",
    programmeId: "hsi-sp-prog-fixture-demo",
    topicLabel:
      "Fixture programme knowledge evolution episode — non-graph-promotable",
    authoredByPrincipalId: "fixture-agent-ske",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    evidenceItemIds: ["hsi-sp-evid-fixture-a"],
    ceiChangeIds: ["hsi-sp-chg-fixture-demo"],
  });

  const retrieved = recordKnowledgeState({
    id: "hsi-sp-kst-fixture-retrieved",
    episode,
    state: "retrieved_evidence",
    subjectLabel: "Fixture retrieved evidence for evolution demo",
    authoredByPrincipalId: "fixture-agent-ske",
    createdAt: asOf,
    evidenceItemId: "hsi-sp-evid-fixture-a",
  });

  const candidate = recordKnowledgeState({
    id: "hsi-sp-kst-fixture-candidate",
    episode,
    state: "extracted_candidate_claim",
    subjectLabel: "Fixture extracted candidate claim — not auto-approved",
    authoredByPrincipalId: "fixture-agent-ske",
    createdAt: asOf,
    evidenceItemId: "hsi-sp-evid-fixture-a",
    priorStateId: retrieved.id,
  });

  const verified = recordKnowledgeState({
    id: "hsi-sp-kst-fixture-verified",
    episode,
    state: "verified_source",
    subjectLabel: "Fixture verified source identity envelope",
    authoredByPrincipalId: "fixture-agent-ske",
    createdAt: asOf,
    evidenceItemId: "hsi-sp-evid-fixture-a",
    priorStateId: candidate.id,
  });

  const reviewed = recordKnowledgeState({
    id: "hsi-sp-kst-fixture-reviewed",
    episode,
    state: "reviewed_scientific_claim",
    subjectLabel: "Fixture reviewed scientific claim envelope",
    authoredByPrincipalId: "fixture-researcher",
    authoredByActorKind: "human",
    createdAt: asOf,
    priorStateId: verified.id,
  });

  const approved = recordKnowledgeState({
    id: "hsi-sp-kst-fixture-approved",
    episode,
    state: "approved_graph_assertion",
    subjectLabel: "Fixture approved graph assertion envelope",
    authoredByPrincipalId: "fixture-researcher",
    authoredByActorKind: "human",
    createdAt: asOf,
    priorStateId: reviewed.id,
  });

  const {prior: retainedApproved, next: superseded} = transitionKnowledgeState({
    prior: approved,
    nextId: "hsi-sp-kst-fixture-superseded",
    nextState: "superseded_assertion",
    subjectLabel: "Fixture superseded assertion — prior retained",
    actor: {principalId: "fixture-researcher", actorKind: "human"},
    updatedAt: asOf,
  });

  const disputed = recordKnowledgeState({
    id: "hsi-sp-kst-fixture-disputed",
    episode,
    state: "disputed_assertion",
    subjectLabel: "Fixture disputed assertion — retained for audit",
    authoredByPrincipalId: "fixture-reviewer",
    authoredByActorKind: "human",
    createdAt: asOf,
  });

  const retracted = recordKnowledgeState({
    id: "hsi-sp-kst-fixture-retracted",
    episode,
    state: "retracted_or_invalidated_evidence",
    subjectLabel: "Fixture retracted or invalidated evidence — retained",
    authoredByPrincipalId: "fixture-ske-retraction",
    authoredByActorKind: "service",
    createdAt: asOf,
    evidenceItemId: "hsi-sp-evid-fixture-a",
  });

  const hypothesis = recordKnowledgeState({
    id: "hsi-sp-kst-fixture-hypothesis",
    episode,
    state: "unvalidated_hypothesis",
    subjectLabel: "Fixture unvalidated hypothesis envelope",
    authoredByPrincipalId: "fixture-agent-ske",
    createdAt: asOf,
  });

  const workflowSteps = [
    "detect_new_or_changed_evidence",
    "resolve_source_identity",
    "identify_relevant_graph_entities",
    "compare_against_existing_assertions",
    "detect_agreement_disagreement",
    "evaluate_biological_context",
    "generate_proposed_changes",
    "identify_downstream_affected_investigations",
    "request_independent_scientific_review",
    "preserve_prior_graph_versions",
    "notify_authorised_programme_members",
  ].map((step, index) =>
    recordEvolutionWorkflowStep({
      id: `hsi-sp-kstp-fixture-${index + 1}`,
      episode,
      step: step as
        | "detect_new_or_changed_evidence"
        | "resolve_source_identity"
        | "identify_relevant_graph_entities"
        | "compare_against_existing_assertions"
        | "detect_agreement_disagreement"
        | "evaluate_biological_context"
        | "generate_proposed_changes"
        | "identify_downstream_affected_investigations"
        | "request_independent_scientific_review"
        | "preserve_prior_graph_versions"
        | "notify_authorised_programme_members",
      summary: `Fixture workflow step ${step} — not auto-approval`,
      authoredByPrincipalId: "fixture-agent-ske",
      createdAt: asOf,
    }),
  );

  const correction = generateProposedKnowledgeChange({
    id: "hsi-sp-kch-fixture-correction",
    episode,
    changeKind: "source_correction",
    summary: "Fixture source correction proposal — distinct from reinterpretation",
    authoredByPrincipalId: "fixture-agent-ske",
    createdAt: asOf,
    targetKnowledgeStateId: verified.id,
    agreementStatus: "partial_overlap",
    graphEntityRefs: ["entity:IL21", "entity:Tfh"],
  });

  const reinterpretation = generateProposedKnowledgeChange({
    id: "hsi-sp-kch-fixture-reinterpret",
    episode,
    changeKind: "reinterpretation",
    summary:
      "Fixture reinterpretation proposal — distinct from source correction",
    authoredByPrincipalId: "fixture-agent-ske",
    createdAt: asOf,
    agreementStatus: "disagreement_candidate",
  });

  const downstream = identifyDownstreamAffectedInvestigations({
    id: "hsi-sp-kdi-fixture-demo",
    episode,
    investigationRef: "inv-fixture-demo-001",
    impactSummary:
      "Fixture downstream investigation impact advisory — not auto-approval",
    authoredByPrincipalId: "fixture-agent-ske",
    createdAt: asOf,
    workstreamId: "hsi-sp-ws-fixture-demo",
  });

  const reviewRequested = requestIndependentScientificReview({
    id: "hsi-sp-krv-fixture-demo",
    episode,
    proposedChangeIds: [correction.id, reinterpretation.id],
    requestedByPrincipalId: "fixture-agent-ske",
    createdAt: asOf,
    independentReviewerPrincipalId: "fixture-reviewer",
  });

  const reviewAccepted = decideIndependentScientificReview({
    request: reviewRequested,
    status: "accepted_human",
    decidedBy: {principalId: "fixture-reviewer", actorKind: "human"},
    decidedAt: asOf,
    decisionRationale:
      "Fixture independent human acceptance — engineering only; not Gate C.",
  });

  const {episode: appliedEpisode, step: applyStep} =
    applyApprovedKnowledgeChange({
      episode,
      review: reviewAccepted,
      stepId: "hsi-sp-kstp-fixture-apply",
      appliedAt: asOf,
      actor: {principalId: "fixture-researcher", actorKind: "human"},
      summary:
        "Fixture apply of accepted changes — remains non-graph-promotable",
    });

  const version = preservePriorGraphVersion({
    id: "hsi-sp-kgv-fixture-demo",
    episode: appliedEpisode,
    priorVersionRef: "graph-ver://fixture/demo-v1",
    preservedSnapshotRef: "snap://fixture/ske-demo-kgv",
    authoredByPrincipalId: "fixture-ske-version",
    createdAt: asOf,
    relatedKnowledgeStateIds: [
      retainedApproved.id,
      superseded.id,
      disputed.id,
      retracted.id,
    ],
  });

  const notification = notifyAuthorisedProgrammeMembers({
    id: "hsi-sp-knt-fixture-demo",
    episode: appliedEpisode,
    recipientPrincipalIds: ["fixture-researcher", "fixture-reviewer"],
    message:
      "Fixture knowledge-evolution apply completed for authorised programme members",
    authoredByPrincipalId: "fixture-ske-notify",
    authoredByActorKind: "service",
    createdAt: asOf,
  });

  const audit1 = appendKnowledgeEvolutionAuditEvent({
    id: "hsi-sp-kau-fixture-1",
    episode: appliedEpisode,
    eventKind: "episode_opened",
    summary: "Fixture audit: episode opened",
    authoredByPrincipalId: "fixture-ske-audit",
    createdAt: asOf,
    subjectRefs: [appliedEpisode.id],
  });
  const audit2 = appendKnowledgeEvolutionAuditEvent({
    id: "hsi-sp-kau-fixture-2",
    episode: appliedEpisode,
    eventKind: "approved_change_applied_fixture",
    summary: "Fixture audit: approved change applied in fixture mode",
    authoredByPrincipalId: "fixture-ske-audit",
    createdAt: asOf,
    subjectRefs: [correction.id, reinterpretation.id],
    prevEvent: audit1,
  });

  const knowledgeStates = [
    retrieved,
    candidate,
    verified,
    reviewed,
    retainedApproved,
    superseded,
    disputed,
    retracted,
    hypothesis,
  ];
  const allSteps = [...workflowSteps, applyStep];

  const pack = buildScientificKnowledgeEvolutionPack({
    episodes: [appliedEpisode],
    knowledgeStates,
    workflowSteps: allSteps,
    proposedChanges: [correction, reinterpretation],
    downstream: [downstream],
    reviewRequests: [reviewAccepted],
    graphVersions: [version],
    notifications: [notification],
    auditEvents: [audit1, audit2],
    asOf,
  });

  const persistenceLines = projectScientificKnowledgeEvolutionPersistenceLines({
    episode: appliedEpisode,
    knowledgeStates,
    workflowSteps: allSteps,
    proposedChanges: [correction, reinterpretation],
    downstream: [downstream],
    reviewRequests: [reviewAccepted],
    graphVersions: [version],
    notifications: [notification],
    auditEvents: [audit1, audit2],
  });

  return {pack, persistenceLines};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines} = fixturePack();
  writeFileSync(
    join(outDir, "scientific-knowledge-evolution-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
        method: SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
        version: SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        agentsMustNotOverwriteApprovedClaims: true,
        appendOnlyTamperEvidentAudit: true,
        retainRejectedAndSuperseded: true,
        sourceCorrectionsDistinctFromReinterpretations: true,
        independentReviewerNotAuthoringAgent: true,
        dependsOnPr1ScientificProgrammeContracts: true,
        dependsOnPr2ResearchObjectivePlanning: true,
        dependsOnPr3ContinuousEvidenceInvestigation: true,
        extendsArch002LivingKnowledgeGraph: true,
        notSeparateAgentPlatform: true,
        noAutoApprovalOfPlansOrClaims: true,
        noFabricatedDiscoveries: true,
        workbenchUi: false,
        graphPromotable: false,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        scientificKnowledgeEvolution: true,
        researchGapHypothesisPortfolio: false,
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
    pack.episodeCount !== 1 ||
    pack.knowledgeStateCount !== 9 ||
    pack.workflowStepCount !== 12 ||
    pack.proposedChangeCount !== 2 ||
    pack.downstreamCount !== 1 ||
    pack.reviewRequestCount !== 1 ||
    pack.graphVersionCount !== 1 ||
    pack.notificationCount !== 1 ||
    pack.auditEventCount !== 2
  ) {
    throw new Error("Scientific knowledge evolution pack check failed");
  }
  if (pack.honesty.scientificKnowledgeEvolution !== true) {
    throw new Error("Scientific knowledge evolution honesty gate failed");
  }
  if (pack.honesty.agentsMustNotOverwriteApprovedClaims !== true) {
    throw new Error("Approved-claim overwrite honesty gate failed");
  }
  if (pack.honesty.appendOnlyTamperEvidentAudit !== true) {
    throw new Error("Append-only audit honesty gate failed");
  }
  if (pack.honesty.sourceCorrectionsDistinctFromReinterpretations !== true) {
    throw new Error("Source-correction/reinterpretation honesty gate failed");
  }
  if (pack.honesty.researchGapHypothesisPortfolio !== false) {
    throw new Error("Research gap / hypothesis portfolio must stay deferred to PR5");
  }
  if (pack.honesty.graphPromotable !== false) {
    throw new Error("Graph promotion must stay false");
  }
  if (
    pack.knowledgeStates.some(
      (s) =>
        (s.state === "superseded_assertion" ||
          s.state === "retracted_or_invalidated_evidence" ||
          s.state === "disputed_assertion") &&
        s.retainedAfterRejectOrSupersede !== true,
    )
  ) {
    throw new Error("Rejected/superseded/disputed/retracted states must be retained");
  }
  console.log("scientific-knowledge-evolution contracts check ok");
} else {
  writeOutputs();
  console.log(`wrote ${outDir}`);
}
