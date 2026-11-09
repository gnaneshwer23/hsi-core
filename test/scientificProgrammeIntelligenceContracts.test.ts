/**
 * Milestone 17 PR1 — scientific programme intelligence contract honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  AUTHORISATION_CLASSES,
  buildScientificProgrammePack,
  createMemoryScientificProgrammeStore,
  draftProgrammeMilestone,
  draftResearchDecision,
  draftResearchProgramme,
  draftResearchWorkstream,
  fingerprintResearchProgramme,
  projectScientificProgrammePersistenceLines,
  transitionProgrammeMilestone,
  transitionResearchDecision,
  transitionResearchProgramme,
  transitionResearchWorkstream,
  type ResearchProgramme,
} from "../src/scientificProgrammeIntelligenceContracts";

const asOf = "2026-11-09T15:00:00.000Z";

function seedProgramme(
  overrides?: Partial<Parameters<typeof draftResearchProgramme>[0]>,
): ResearchProgramme {
  return draftResearchProgramme({
    id: "hsi-sp-prog-ssc-fixture",
    name: "SSc scientific programme intelligence scoping (fixture)",
    purpose:
      "Organise governed investigation of Tfh–IL-21 neighbourhood questions without claiming discovery or autonomous closed-loop science.",
    scopeSummary:
      "Fixture programme framing only — compose existing investigation and therapeutic refs; not a separate agent platform.",
    authoredByPrincipalId: "agent-hsi-sp-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    investigationIds: ["inv-ssc-mech-001"],
    hypothesisIds: ["hyp-ssc-tfh-il21-001"],
    orgId: "org-hsi-fixture-1",
    therapeuticProgrammeId: "hsi-tx-prog-ssc-il6-fixture",
    translationalProgrammeId: "hsi-td-prog-ssc-tfh-fixture",
    identities: [
      {
        system: "open_targets_disease",
        value: "EFO_0000699",
        label: "systemic sclerosis",
        resolution: "resolved_prefix",
        claimSupport: "not_assessed",
      },
    ],
    ...overrides,
  });
}

describe("scientific programme intelligence contracts (M17 PR1)", () => {
  test("drafts research programme with M3/M6/M9/M12/M13 links and honesty", () => {
    const programme = seedProgramme();
    expect(programme.lifecycle).toBe("draft");
    expect(programme.notSeparateAgentPlatform).toBe(true);
    expect(programme.investigationIds).toEqual(["inv-ssc-mech-001"]);
    expect(programme.hypothesisIds).toEqual(["hyp-ssc-tfh-il21-001"]);
    expect(programme.orgId).toBe("org-hsi-fixture-1");
    expect(programme.therapeuticProgrammeId).toBe(
      "hsi-tx-prog-ssc-il6-fixture",
    );
    expect(programme.translationalProgrammeId).toBe(
      "hsi-td-prog-ssc-tfh-fixture",
    );
    expect(programme.honesty.agentsInvestigateResearchersApprove).toBe(true);
    expect(programme.honesty.agentsMustNotApproveOwnFindings).toBe(true);
    expect(programme.honesty.noAutoApprovalOfPlansOrClaims).toBe(true);
    expect(programme.honesty.noFabricatedDiscoveries).toBe(true);
    expect(programme.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(programme.honesty.m11LiveMultiscaleClaimed).toBe(false);
    expect(fingerprintResearchProgramme(programme)).toMatch(/^[a-f0-9]{64}$/);
    expect(AUTHORISATION_CLASSES).toContain("explicit_authorisation_required");
  });

  test("rejects invalid therapeutic/translational ids and forbidden claim language", () => {
    expect(() =>
      seedProgramme({therapeuticProgrammeId: "not-an-m12-id"}),
    ).toThrow(/hsi-tx-prog/);

    expect(() =>
      seedProgramme({translationalProgrammeId: "not-an-m13-id"}),
    ).toThrow(/hsi-td-prog/);

    expect(() =>
      seedProgramme({
        purpose:
          "We have proven a fabricated discovery with gate c auto-approve.",
      }),
    ).toThrow(/must not invent/);
  });

  test("workstream requires propose-only bounds and human activation", () => {
    const programme = seedProgramme();
    const workstream = draftResearchWorkstream({
      id: "hsi-sp-ws-evidence-fixture",
      programme,
      name: "Public evidence investigation lane (fixture)",
      objectiveSummary:
        "Retrieve and propose public-evidence neighbourhoods for human review — not autonomous execution.",
      authoredByPrincipalId: "agent-hsi-sp-1",
      createdAt: asOf,
      investigationId: "inv-ssc-mech-001",
      hypothesisIds: ["hyp-ssc-tfh-il21-001"],
    });
    expect(workstream.agentsProposeOnly).toBe(true);
    expect(workstream.notAutonomousExecution).toBe(true);
    expect(workstream.permittedActions).toContain("not_execute_autonomously");
    expect(workstream.programmeId).toBe(programme.id);

    expect(() =>
      draftResearchWorkstream({
        id: "hsi-sp-ws-bad-actions",
        programme,
        name: "Bad",
        objectiveSummary: "Missing autonomous denial.",
        authoredByPrincipalId: "agent-hsi-sp-1",
        createdAt: asOf,
        permittedActions: ["retrieve_public_evidence"],
      }),
    ).toThrow(/not_execute_autonomously/);

    const underReview = transitionResearchWorkstream({
      workstream,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-sp-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionResearchWorkstream({
        workstream: underReview,
        to: "active",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-sp-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);

    const active = transitionResearchWorkstream({
      workstream: underReview,
      to: "active",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    });
    expect(active.lifecycle).toBe("active");
    expect(active.reviewedBy?.actorKind).toBe("human");
  });

  test("milestones require evidence and refuse AI acceptance", () => {
    const programme = seedProgramme();
    const workstream = draftResearchWorkstream({
      id: "hsi-sp-ws-milestone-lane",
      programme,
      name: "Milestone lane",
      objectiveSummary: "Fixture lane for milestone honesty.",
      authoredByPrincipalId: "agent-hsi-sp-1",
      createdAt: asOf,
    });
    const milestone = draftProgrammeMilestone({
      id: "hsi-sp-ms-gap-review-fixture",
      programme,
      workstream,
      name: "Gap review checkpoint",
      exitCriteria:
        "Human review confirms remaining uncertainties are recorded; no fabricated discovery claim.",
      authoredByPrincipalId: "agent-hsi-sp-1",
      createdAt: asOf,
    });
    expect(milestone.evidenceRequired).toBe(true);
    expect(milestone.notAutoComplete).toBe(true);
    expect(milestone.workstreamId).toBe(workstream.id);

    const inProgress = transitionProgrammeMilestone({
      milestone,
      to: "in_progress",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-sp-1", actorKind: "ai_agent"},
    });
    const awaiting = transitionProgrammeMilestone({
      milestone: inProgress,
      to: "awaiting_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-sp-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionProgrammeMilestone({
        milestone: awaiting,
        to: "accepted",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-sp-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);

    const accepted = transitionProgrammeMilestone({
      milestone: awaiting,
      to: "accepted",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted");
  });

  test("research decisions refuse agent self-approval and require distinct independent reviewer", () => {
    const programme = seedProgramme();
    const decision = draftResearchDecision({
      id: "hsi-sp-dec-go-nogo-fixture",
      programme,
      decisionKind: "investigation_go_no_go",
      summary:
        "Proposed go/no-go for further investigation of public evidence neighbourhood — draft only.",
      rationale:
        "Associative neighbourhood only; human decision required before any further workstream activation.",
      authoredByPrincipalId: "agent-hsi-sp-1",
      authoredByActorKind: "ai_agent",
      createdAt: asOf,
      subjectRefs: ["inv-ssc-mech-001", "hyp-ssc-tfh-il21-001"],
    });
    expect(decision.proposingAgentPrincipalId).toBe("agent-hsi-sp-1");
    expect(decision.lifecycle).toBe("draft");

    const underReview = transitionResearchDecision({
      decision,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-sp-1", actorKind: "ai_agent"},
    });

    expect(() =>
      transitionResearchDecision({
        decision: underReview,
        to: "accepted",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-sp-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);

    expect(() =>
      transitionResearchDecision({
        decision: underReview,
        to: "accepted",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-sp-1", actorKind: "human"},
      }),
    ).toThrow(/must not approve their own findings/);

    expect(() =>
      transitionResearchDecision({
        decision: underReview,
        to: "accepted",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher-alice", actorKind: "human"},
        independentReviewer: {
          principalId: "agent-hsi-sp-1",
          actorKind: "human",
        },
      }),
    ).toThrow(/differ from proposing agent/);

    const accepted = transitionResearchDecision({
      decision: underReview,
      to: "accepted",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
      independentReviewer: {
        principalId: "principal-reviewer-bob",
        actorKind: "human",
      },
    });
    expect(accepted.lifecycle).toBe("accepted");
    expect(accepted.decidedBy?.principalId).toBe("principal-researcher-alice");
    expect(accepted.independentReviewer?.principalId).toBe(
      "principal-reviewer-bob",
    );
  });

  test("programme human activation and illegal transitions", () => {
    const programme = seedProgramme();
    const underReview = transitionResearchProgramme({
      programme,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-sp-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionResearchProgramme({
        programme: underReview,
        to: "active",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-sp-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);

    const active = transitionResearchProgramme({
      programme: underReview,
      to: "active",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    });
    expect(active.lifecycle).toBe("active");

    expect(() =>
      transitionResearchProgramme({
        programme: active,
        to: "draft",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher-alice", actorKind: "human"},
      }),
    ).toThrow(/Illegal programme transition/);
  });

  test("memory store round-trip and pack persistence lines", () => {
    const programmeDraft = seedProgramme();
    const underReview = transitionResearchProgramme({
      programme: programmeDraft,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-sp-1", actorKind: "ai_agent"},
    });
    const programme = transitionResearchProgramme({
      programme: underReview,
      to: "active",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    });
    const workstream = draftResearchWorkstream({
      id: "hsi-sp-ws-store-fixture",
      programme,
      name: "Store fixture workstream",
      objectiveSummary: "Memory-store round-trip lane.",
      authoredByPrincipalId: "agent-hsi-sp-1",
      createdAt: asOf,
    });
    const milestone = draftProgrammeMilestone({
      id: "hsi-sp-ms-store-fixture",
      programme,
      workstream,
      name: "Store fixture milestone",
      exitCriteria: "Human review recorded.",
      authoredByPrincipalId: "agent-hsi-sp-1",
      createdAt: asOf,
    });
    const decision = draftResearchDecision({
      id: "hsi-sp-dec-store-fixture",
      programme,
      workstream,
      milestone,
      decisionKind: "milestone_acceptance",
      summary: "Draft decision for store round-trip.",
      rationale: "Engineering fixture only.",
      authoredByPrincipalId: "agent-hsi-sp-1",
      createdAt: asOf,
    });

    const store = createMemoryScientificProgrammeStore();
    store.upsertProgramme(programme);
    store.upsertWorkstream(workstream);
    store.upsertMilestone(milestone);
    store.upsertDecision(decision);
    expect(store.getProgramme(programme.id)?.id).toBe(programme.id);
    expect(store.listWorkstreams(programme.id)).toHaveLength(1);
    expect(store.listMilestones(programme.id)).toHaveLength(1);
    expect(store.listDecisions(programme.id)).toHaveLength(1);

    const pack = buildScientificProgrammePack({
      programmes: [programme],
      workstreams: [workstream],
      milestones: [milestone],
      decisions: [decision],
      asOf,
    });
    expect(pack.programmeCount).toBe(1);
    expect(pack.workstreamCount).toBe(1);
    expect(pack.honesty.notSeparateAgentPlatform).toBe(true);

    const lines = projectScientificProgrammePersistenceLines({
      programme,
      workstreams: [workstream],
      milestones: [milestone],
      decisions: [decision],
    });
    expect(lines).toContain("notSeparateAgentPlatform=true");
    expect(lines).toContain("noFabricatedDiscoveries=true");
    expect(lines).toContain("neon=red-wave-only");
    expect(lines).toContain("migration=deferred");
  });
});
