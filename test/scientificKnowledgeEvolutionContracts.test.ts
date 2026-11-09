/**
 * Milestone 17 PR4 — scientific knowledge evolution honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  advanceKnowledgeEvolutionEpisode,
  appendKnowledgeEvolutionAuditEvent,
  applyApprovedKnowledgeChange,
  buildScientificKnowledgeEvolutionPack,
  createMemoryScientificKnowledgeEvolutionStore,
  decideIndependentScientificReview,
  fingerprintKnowledgeEvolutionEpisode,
  generateProposedKnowledgeChange,
  identifyDownstreamAffectedInvestigations,
  KNOWLEDGE_STATES,
  notifyAuthorisedProgrammeMembers,
  openKnowledgeEvolutionEpisode,
  preservePriorGraphVersion,
  projectScientificKnowledgeEvolutionPersistenceLines,
  recordEvolutionWorkflowStep,
  recordKnowledgeState,
  requestIndependentScientificReview,
  transitionKnowledgeState,
  type KnowledgeEvolutionEpisode,
  type KnowledgeStateRecord,
} from "../src/scientificKnowledgeEvolutionContracts";

const asOf = "2026-11-09T18:00:00.000Z";
const programmeId = "hsi-sp-prog-ssc-fixture";

function seedEpisode(
  overrides?: Partial<Parameters<typeof openKnowledgeEvolutionEpisode>[0]>,
): KnowledgeEvolutionEpisode {
  return openKnowledgeEvolutionEpisode({
    id: "hsi-sp-kev-ssc-001",
    programmeId,
    topicLabel:
      "Fixture SSc neighbourhood knowledge evolution — non-graph-promotable",
    authoredByPrincipalId: "agent-hsi-sp-ske-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    evidenceItemIds: ["hsi-sp-evid-pmid-fixture-1"],
    ceiChangeIds: ["hsi-sp-chg-ssc-1"],
    ...overrides,
  });
}

function seedRetrievedState(
  episode: KnowledgeEvolutionEpisode = seedEpisode(),
): KnowledgeStateRecord {
  return recordKnowledgeState({
    id: "hsi-sp-kst-retrieved-1",
    episode,
    state: "retrieved_evidence",
    subjectLabel: "Fixture retrieved evidence neighbourhood row",
    authoredByPrincipalId: "agent-hsi-sp-ske-1",
    createdAt: asOf,
    evidenceItemId: "hsi-sp-evid-pmid-fixture-1",
  });
}

describe("scientific knowledge evolution contracts (M17 PR4)", () => {
  test("opens episode with all knowledge states and ARCH-002 honesty", () => {
    const episode = seedEpisode();
    expect(episode.lifecycle).toBe("draft");
    expect(episode.honesty.dependsOnPr3ContinuousEvidenceInvestigation).toBe(
      true,
    );
    expect(episode.honesty.extendsArch002LivingKnowledgeGraph).toBe(true);
    expect(episode.honesty.scientificKnowledgeEvolution).toBe(true);
    expect(episode.honesty.researchGapHypothesisPortfolio).toBe(false);
    expect(episode.honesty.agentsMustNotOverwriteApprovedClaims).toBe(true);
    expect(episode.honesty.graphPromotable).toBe(false);
    expect(KNOWLEDGE_STATES).toHaveLength(9);
    expect(fingerprintKnowledgeEvolutionEpisode(episode)).toMatch(
      /^[a-f0-9]{64}$/,
    );

    expect(() =>
      seedEpisode({
        topicLabel: "We have proven a discovery and promoted to the curated kg.",
      }),
    ).toThrow(/must not invent/);
  });

  test("records knowledge states and refuses agent overwrite of approved claims", () => {
    const episode = seedEpisode();
    const retrieved = seedRetrievedState(episode);
    expect(retrieved.state).toBe("retrieved_evidence");

    const candidate = recordKnowledgeState({
      id: "hsi-sp-kst-candidate-1",
      episode,
      state: "extracted_candidate_claim",
      subjectLabel: "Fixture extracted candidate claim for human review",
      authoredByPrincipalId: "agent-hsi-sp-ske-1",
      createdAt: asOf,
      evidenceItemId: "hsi-sp-evid-pmid-fixture-1",
      priorStateId: retrieved.id,
    });
    expect(candidate.state).toBe("extracted_candidate_claim");

    const approved = recordKnowledgeState({
      id: "hsi-sp-kst-approved-1",
      episode,
      state: "approved_graph_assertion",
      subjectLabel: "Fixture approved graph assertion envelope",
      authoredByPrincipalId: "principal-researcher-alice",
      authoredByActorKind: "human",
      createdAt: asOf,
      priorStateId: candidate.id,
    });

    expect(() =>
      transitionKnowledgeState({
        prior: approved,
        nextId: "hsi-sp-kst-agent-overwrite",
        nextState: "reviewed_scientific_claim",
        subjectLabel: "Agent overwrite attempt",
        actor: {principalId: "agent-hsi-sp-ske-1", actorKind: "ai_agent"},
        updatedAt: asOf,
      }),
    ).toThrow(/must not overwrite approved scientific claims/);

    const {prior, next} = transitionKnowledgeState({
      prior: approved,
      nextId: "hsi-sp-kst-superseded-1",
      nextState: "superseded_assertion",
      subjectLabel: "Human supersession of approved assertion — prior retained",
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
      updatedAt: asOf,
    });
    expect(next.state).toBe("superseded_assertion");
    expect(next.retainedAfterRejectOrSupersede).toBe(true);
    expect(prior.retainedAfterRejectOrSupersede).toBe(true);
    expect(prior.supersededByStateId).toBe(next.id);
  });

  test("separates source corrections from reinterpretations in proposed changes", () => {
    const episode = seedEpisode();
    const state = seedRetrievedState(episode);

    const correction = generateProposedKnowledgeChange({
      id: "hsi-sp-kch-correction-1",
      episode,
      changeKind: "source_correction",
      summary:
        "Fixture source-identity correction proposal for verified source review",
      authoredByPrincipalId: "agent-hsi-sp-ske-1",
      createdAt: asOf,
      targetKnowledgeStateId: state.id,
      agreementStatus: "partial_overlap",
      graphEntityRefs: ["entity:IL21", "entity:Tfh"],
    });
    expect(correction.sourceCorrectionDistinctFromReinterpretation).toBe(true);
    expect(correction.notAutoApproved).toBe(true);
    expect(correction.graphPromotable).toBe(false);

    const reinterpretation = generateProposedKnowledgeChange({
      id: "hsi-sp-kch-reinterpret-1",
      episode,
      changeKind: "reinterpretation",
      summary:
        "Fixture biological reinterpretation proposal — distinct from source correction",
      authoredByPrincipalId: "agent-hsi-sp-ske-1",
      createdAt: asOf,
      agreementStatus: "disagreement_candidate",
    });
    expect(reinterpretation.changeKind).toBe("reinterpretation");

    expect(() =>
      generateProposedKnowledgeChange({
        id: "hsi-sp-kch-bad",
        episode,
        changeKind: "source_correction",
        summary: "Bad mixed labelling",
        authoredByPrincipalId: "agent-hsi-sp-ske-1",
        createdAt: asOf,
        note: "This is a reinterpretation disguised as source correction",
      }),
    ).toThrow(/must not be labelled as reinterpretation/);
  });

  test("records twelve-step workflow including downstream and notifications", () => {
    const episode = advanceKnowledgeEvolutionEpisode({
      episode: seedEpisode(),
      lifecycle: "in_progress",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-sp-ske-1", actorKind: "ai_agent"},
    });

    const steps = [
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
    ] as const;

    const recorded = steps.map((step, index) =>
      recordEvolutionWorkflowStep({
        id: `hsi-sp-kstp-ssc-${index + 1}`,
        episode,
        step,
        summary: `Fixture workflow step ${step} — not auto-approval`,
        authoredByPrincipalId: "agent-hsi-sp-ske-1",
        createdAt: asOf,
      }),
    );
    expect(recorded).toHaveLength(11);

    expect(() =>
      recordEvolutionWorkflowStep({
        id: "hsi-sp-kstp-apply-agent",
        episode,
        step: "apply_approved_changes",
        summary: "Agent must not apply approved changes",
        authoredByPrincipalId: "agent-hsi-sp-ske-1",
        authoredByActorKind: "ai_agent",
        createdAt: asOf,
      }),
    ).toThrow(/Only human researchers may record apply_approved_changes/);

    const downstream = identifyDownstreamAffectedInvestigations({
      id: "hsi-sp-kdi-ssc-1",
      episode,
      investigationRef: "inv-ssc-fixture-001",
      impactSummary:
        "Fixture downstream investigation may need human review of proposed change",
      authoredByPrincipalId: "agent-hsi-sp-ske-1",
      createdAt: asOf,
      workstreamId: "hsi-sp-ws-ssc-fixture",
    });
    expect(downstream.investigationRef).toBe("inv-ssc-fixture-001");

    const notification = notifyAuthorisedProgrammeMembers({
      id: "hsi-sp-knt-ssc-1",
      episode,
      recipientPrincipalIds: [
        "principal-researcher-alice",
        "principal-reviewer-bob",
      ],
      message:
        "Fixture knowledge-evolution episode awaiting independent scientific review",
      authoredByPrincipalId: "service-ske-notify",
      authoredByActorKind: "service",
      createdAt: asOf,
    });
    expect(notification.recipientPrincipalIds).toHaveLength(2);
  });

  test("independent review refuses agent self-approval; human apply stays non-promotable", () => {
    const episode = seedEpisode();
    const change = generateProposedKnowledgeChange({
      id: "hsi-sp-kch-review-1",
      episode,
      changeKind: "new_assertion_candidate",
      summary: "Fixture proposed assertion candidate for independent review",
      authoredByPrincipalId: "agent-hsi-sp-ske-1",
      createdAt: asOf,
    });
    const requested = requestIndependentScientificReview({
      id: "hsi-sp-krv-ssc-1",
      episode,
      proposedChangeIds: [change.id],
      requestedByPrincipalId: "agent-hsi-sp-ske-1",
      createdAt: asOf,
      independentReviewerPrincipalId: "principal-reviewer-bob",
    });
    expect(requested.status).toBe("requested");

    expect(() =>
      decideIndependentScientificReview({
        request: requested,
        status: "accepted_human",
        decidedBy: {
          principalId: "agent-hsi-sp-ske-1",
          actorKind: "ai_agent",
        },
        decidedAt: asOf,
        decisionRationale: "Agent self-approval attempt",
      }),
    ).toThrow(/Only human independent reviewers/);

    expect(() =>
      decideIndependentScientificReview({
        request: requested,
        status: "accepted_human",
        decidedBy: {
          principalId: "agent-hsi-sp-ske-1",
          actorKind: "human",
        },
        decidedAt: asOf,
        decisionRationale: "Same principal as authoring agent",
      }),
    ).toThrow(/must differ from the authoring agent/);

    const accepted = decideIndependentScientificReview({
      request: requested,
      status: "accepted_human",
      decidedBy: {
        principalId: "principal-reviewer-bob",
        actorKind: "human",
      },
      decidedAt: asOf,
      decisionRationale:
        "Fixture independent human acceptance — engineering only; not Gate C.",
    });
    expect(accepted.status).toBe("accepted_human");

    const {episode: applied, step} = applyApprovedKnowledgeChange({
      episode,
      review: accepted,
      stepId: "hsi-sp-kstp-apply-1",
      appliedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
      summary:
        "Fixture apply of accepted change — remains non-graph-promotable",
    });
    expect(applied.lifecycle).toBe("applied_fixture");
    expect(step.step).toBe("apply_approved_changes");
    expect(applied.honesty.graphPromotable).toBe(false);
    expect(applied.honesty.gateCAutoApprove).toBe(false);
  });

  test("append-only audit and prior graph version preservation", () => {
    const episode = seedEpisode();
    const state = seedRetrievedState(episode);
    const first = appendKnowledgeEvolutionAuditEvent({
      id: "hsi-sp-kau-ssc-1",
      episode,
      eventKind: "episode_opened",
      summary: "Fixture audit: episode opened",
      authoredByPrincipalId: "service-ske-audit",
      createdAt: asOf,
      subjectRefs: [episode.id],
    });
    expect(first.prevEventId).toBeNull();
    expect(first.chainHash).toMatch(/^[a-f0-9]{64}$/);

    const second = appendKnowledgeEvolutionAuditEvent({
      id: "hsi-sp-kau-ssc-2",
      episode,
      eventKind: "knowledge_state_recorded",
      summary: "Fixture audit: knowledge state recorded",
      authoredByPrincipalId: "service-ske-audit",
      createdAt: asOf,
      subjectRefs: [state.id],
      prevEvent: first,
    });
    expect(second.prevEventId).toBe(first.id);
    expect(second.chainHash).not.toBe(first.chainHash);

    const store = createMemoryScientificKnowledgeEvolutionStore();
    store.appendAuditEvent(first);
    store.appendAuditEvent(second);
    expect(() => store.appendAuditEvent(first)).toThrow(/Append-only audit/);

    const version = preservePriorGraphVersion({
      id: "hsi-sp-kgv-ssc-1",
      episode,
      priorVersionRef: "graph-ver://fixture/ssc-v1",
      preservedSnapshotRef: "snap://fixture/ssc-kgv-001",
      authoredByPrincipalId: "service-ske-version",
      createdAt: asOf,
      relatedKnowledgeStateIds: [state.id],
    });
    expect(version.priorVersionRef).toBe("graph-ver://fixture/ssc-v1");
  });

  test("thin store and pack projection preserve honesty gates", () => {
    const store = createMemoryScientificKnowledgeEvolutionStore();
    const episode = seedEpisode();
    const retrieved = seedRetrievedState(episode);
    const hypothesis = recordKnowledgeState({
      id: "hsi-sp-kst-hypothesis-1",
      episode,
      state: "unvalidated_hypothesis",
      subjectLabel: "Fixture unvalidated hypothesis envelope",
      authoredByPrincipalId: "agent-hsi-sp-ske-1",
      createdAt: asOf,
    });
    const retracted = recordKnowledgeState({
      id: "hsi-sp-kst-retracted-1",
      episode,
      state: "retracted_or_invalidated_evidence",
      subjectLabel: "Fixture retracted or invalidated evidence — retained",
      authoredByPrincipalId: "service-ske-retraction",
      authoredByActorKind: "service",
      createdAt: asOf,
      evidenceItemId: "hsi-sp-evid-pmid-fixture-1",
    });
    expect(retracted.retainedAfterRejectOrSupersede).toBe(true);

    const step = recordEvolutionWorkflowStep({
      id: "hsi-sp-kstp-store-1",
      episode,
      step: "detect_new_or_changed_evidence",
      summary: "Fixture detect new/changed evidence step",
      authoredByPrincipalId: "agent-hsi-sp-ske-1",
      createdAt: asOf,
    });
    const change = generateProposedKnowledgeChange({
      id: "hsi-sp-kch-store-1",
      episode,
      changeKind: "hypothesis_record",
      summary: "Fixture hypothesis record proposal",
      authoredByPrincipalId: "agent-hsi-sp-ske-1",
      createdAt: asOf,
      targetKnowledgeStateId: hypothesis.id,
    });
    const downstream = identifyDownstreamAffectedInvestigations({
      id: "hsi-sp-kdi-store-1",
      episode,
      investigationRef: "inv-store-001",
      impactSummary: "Fixture downstream impact advisory",
      authoredByPrincipalId: "agent-hsi-sp-ske-1",
      createdAt: asOf,
    });
    const review = requestIndependentScientificReview({
      id: "hsi-sp-krv-store-1",
      episode,
      proposedChangeIds: [change.id],
      requestedByPrincipalId: "agent-hsi-sp-ske-1",
      createdAt: asOf,
      independentReviewerPrincipalId: "principal-reviewer-bob",
    });
    const version = preservePriorGraphVersion({
      id: "hsi-sp-kgv-store-1",
      episode,
      priorVersionRef: "graph-ver://fixture/store-v1",
      preservedSnapshotRef: "snap://fixture/store-kgv",
      authoredByPrincipalId: "service-ske-version",
      createdAt: asOf,
      relatedKnowledgeStateIds: [retrieved.id, retracted.id],
    });
    const notification = notifyAuthorisedProgrammeMembers({
      id: "hsi-sp-knt-store-1",
      episode,
      recipientPrincipalIds: ["principal-researcher-alice"],
      message: "Fixture store notification for authorised members",
      authoredByPrincipalId: "service-ske-notify",
      authoredByActorKind: "service",
      createdAt: asOf,
    });
    const audit = appendKnowledgeEvolutionAuditEvent({
      id: "hsi-sp-kau-store-1",
      episode,
      eventKind: "episode_opened",
      summary: "Fixture store audit event",
      authoredByPrincipalId: "service-ske-audit",
      createdAt: asOf,
      subjectRefs: [episode.id],
    });

    store.upsertEpisode(episode);
    store.upsertKnowledgeState(retrieved);
    store.upsertKnowledgeState(hypothesis);
    store.upsertKnowledgeState(retracted);
    store.upsertWorkflowStep(step);
    store.upsertProposedChange(change);
    store.upsertDownstream(downstream);
    store.upsertReviewRequest(review);
    store.upsertGraphVersion(version);
    store.upsertNotification(notification);
    store.appendAuditEvent(audit);

    expect(store.listEpisodes(programmeId)).toHaveLength(1);
    expect(store.listKnowledgeStates(programmeId)).toHaveLength(3);
    expect(store.listAuditEvents(episode.id)).toHaveLength(1);

    const pack = buildScientificKnowledgeEvolutionPack({
      episodes: [episode],
      knowledgeStates: [retrieved, hypothesis, retracted],
      workflowSteps: [step],
      proposedChanges: [change],
      downstream: [downstream],
      reviewRequests: [review],
      graphVersions: [version],
      notifications: [notification],
      auditEvents: [audit],
      asOf,
    });
    expect(pack.episodeCount).toBe(1);
    expect(pack.knowledgeStateCount).toBe(3);
    expect(pack.honesty.scientificKnowledgeEvolution).toBe(true);
    expect(pack.honesty.researchGapHypothesisPortfolio).toBe(false);
    expect(pack.honesty.agentsMustNotOverwriteApprovedClaims).toBe(true);

    const lines = projectScientificKnowledgeEvolutionPersistenceLines({
      episode,
      knowledgeStates: [retrieved, hypothesis, retracted],
      workflowSteps: [step],
      proposedChanges: [change],
      downstream: [downstream],
      reviewRequests: [review],
      graphVersions: [version],
      notifications: [notification],
      auditEvents: [audit],
    });
    expect(lines).toContain("agentsMustNotOverwriteApprovedClaims=true");
    expect(lines).toContain("appendOnlyTamperEvidentAudit=true");
    expect(lines).toContain("retainRejectedAndSuperseded=true");
    expect(lines).toContain(
      "sourceCorrectionsDistinctFromReinterpretations=true",
    );
    expect(lines).toContain("scientificKnowledgeEvolution=true");
    expect(lines).toContain("researchGapHypothesisPortfolio=false");
    expect(lines).toContain("neon=red-wave-only");
  });
});
