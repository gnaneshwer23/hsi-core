/**
 * Milestone 9 PR2 — collaborative investigation contracts honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  acceptInvite,
  addComment,
  addEvidenceContributionRef,
  addExperimentProposalStub,
  addHypothesisDiscussionStub,
  approveOrRejectPermittedAction,
  archiveCollaboration,
  assignCollaborationRole,
  assignTask,
  buildCollaborativeInvestigationPack,
  createMemoryCollaborativeInvestigationStore,
  decideCollaborativeArtifactAccess,
  declineInvite,
  denyRestrictedDatasetAccessViaCollaborationShare,
  draftCollaborativeInvestigation,
  fingerprintCollaborativeInvestigation,
  inviteCollaborator,
  projectCollaborativeInvestigationPersistenceLines,
  proposeRevision,
  registerVersionedArtifact,
  requestScientificReview,
  revokeAccess,
  shareSelectedArtifact,
  upsertSharedPlan,
  validateCollaborativeInvestigation,
  type CollaborativeInvestigation,
} from "../src/collaborativeInvestigationContracts";
import {draftScientificInvestigation} from "../src/evidence/investigationOrchestrationContracts";
import {
  createMemoryResearchOrganisationStore,
  decideTenantArtifactAccess,
  draftOrgMembership,
  draftResearchOrganisation,
  type CollaborationActor,
} from "../src/researchOrganisationTenantSecurity";

const asOf = "2026-11-09T14:00:00.000Z";
const later = "2026-11-09T15:00:00.000Z";
const later2 = "2026-11-09T16:00:00.000Z";

function ownerActor(): CollaborationActor {
  return {
    principalId: "principal-alice",
    authenticated: true,
    actorKind: "human",
    existingResearchRoles: ["researcher"],
    platformRoles: [],
  };
}

function bobActor(): CollaborationActor {
  return {
    principalId: "principal-bob",
    authenticated: true,
    actorKind: "human",
    existingResearchRoles: ["researcher"],
    platformRoles: [],
  };
}

function outsiderActor(): CollaborationActor {
  return {
    principalId: "principal-outsider",
    authenticated: true,
    actorKind: "human",
    existingResearchRoles: ["researcher"],
    platformRoles: [],
  };
}

function seedCollab(): CollaborativeInvestigation {
  const investigation = draftScientificInvestigation({
    investigationId: "hsi-inv-m9-collab-demo",
    question: "Collaborative IL-21 / SSc investigation contract (fixtures ≠ live).",
    domain: "ssc_tfh_il21",
    createdAt: asOf,
    authScope: {
      principalId: "principal-alice",
      authenticated: true,
      roles: ["researcher"],
      dataClass: "synthetic_demo",
    },
  });
  return draftCollaborativeInvestigation({
    collaborationId: "hsi-collab-ssc-il21",
    investigation,
    ownerPrincipalId: "principal-alice",
    ownerOrgId: "hsi-org-alpha-lab",
    createdAt: asOf,
    scientificObjectives: [
      {
        id: "obj-il21",
        text: "Map IL-21 evidence gaps under shared review without dataset bleed.",
        ownerPrincipalId: "principal-alice",
        hypothesisId: null,
      },
    ],
  });
}

describe("collaborative investigation contracts (M9 PR2)", () => {
  test("drafts collaboration bound to M6 investigation with honesty gates", () => {
    const collab = seedCollab();
    expect(collab.investigationSchema).toBe("hsi-investigation-orchestration-1");
    expect(collab.ownerPrincipalId).toBe("principal-alice");
    expect(collab.participatingOrgIds).toContain("hsi-org-alpha-lab");
    expect(collab.collaborators).toHaveLength(1);
    expect(collab.honesty.sharingDoesNotGrantRestrictedDatasetAccess).toBe(true);
    expect(collab.honesty.fullContributionModel).toBe(false);
    expect(collab.honesty.federatedQueryImplemented).toBe(false);
    expect(collab.honesty.workbenchUiDuplicated).toBe(false);
    expect(collab.honesty.neonMigrationInThisPr).toBe(false);
    expect(collab.reviewCheckpoints.every((c) => c.required && !c.gateCAutoApprove)).toBe(
      true,
    );
    validateCollaborativeInvestigation(collab);
    expect(fingerprintCollaborativeInvestigation(collab)).toHaveLength(64);
  });

  test("invite → accept / decline and role assignment", () => {
    let collab = seedCollab();
    collab = inviteCollaborator(collab, ownerActor(), {
      inviteId: "hsi-invite-bob-contrib",
      invitedPrincipalId: "principal-bob",
      invitedOrgId: "hsi-org-beta-lab",
      proposedRole: "contributor",
      at: later,
    });
    expect(collab.lifecycle).toBe("inviting");
    expect(collab.participatingOrgIds).toContain("hsi-org-beta-lab");

    const declined = declineInvite(
      inviteCollaborator(seedCollab(), ownerActor(), {
        inviteId: "hsi-invite-cara",
        invitedPrincipalId: "principal-cara",
        invitedOrgId: "hsi-org-beta-lab",
        proposedRole: "observer",
        at: later,
      }),
      {
        principalId: "principal-cara",
        authenticated: true,
        actorKind: "human",
        existingResearchRoles: [],
        platformRoles: [],
      },
      {inviteId: "hsi-invite-cara", at: later2},
    );
    expect(declined.invites[0]!.status).toBe("declined");
    expect(declined.collaborators).toHaveLength(1);

    collab = acceptInvite(collab, bobActor(), {
      inviteId: "hsi-invite-bob-contrib",
      at: later2,
    });
    expect(collab.lifecycle).toBe("active");
    expect(collab.collaborators.some((c) => c.principalId === "principal-bob")).toBe(true);

    collab = assignCollaborationRole(collab, ownerActor(), {
      principalId: "principal-bob",
      role: "co_investigator",
      at: "2026-11-09T17:00:00.000Z",
    });
    expect(
      collab.collaborators.find((c) => c.principalId === "principal-bob")?.role,
    ).toBe("co_investigator");
  });

  test("shared plan, tasks, evidence refs, hypothesis/experiment stubs", () => {
    let collab = seedCollab();
    collab = upsertSharedPlan(collab, ownerActor(), {
      planId: "hsi-plan-shared-v1",
      summary: "Shared investigation plan for collaborative review (no planner claim).",
      boundInvestigationPlanVersion: 0,
      at: later,
    });
    expect(collab.sharedPlan?.version).toBe(1);

    collab = inviteCollaborator(collab, ownerActor(), {
      inviteId: "hsi-invite-bob-task",
      invitedPrincipalId: "principal-bob",
      invitedOrgId: "hsi-org-alpha-lab",
      proposedRole: "contributor",
      at: later,
    });
    collab = acceptInvite(collab, bobActor(), {
      inviteId: "hsi-invite-bob-task",
      at: later2,
    });
    collab = assignTask(collab, ownerActor(), {
      taskId: "hsi-task-lit-scan",
      title: "Scan public IL-21 refs",
      assigneePrincipalId: "principal-bob",
      at: "2026-11-09T17:00:00.000Z",
    });
    collab = addEvidenceContributionRef(collab, bobActor(), {
      contributionRefId: "contrib-ref-1",
      evidenceRef: "pmid:19180481",
      orgId: "hsi-org-alpha-lab",
      note: "Reference only — full attribution is PR3",
      at: "2026-11-09T17:30:00.000Z",
    });
    expect(collab.evidenceContributionRefs[0]!.fullContributionModel).toBe(false);

    collab = addHypothesisDiscussionStub(collab, bobActor(), {
      discussionId: "hyp-disc-1",
      topic: "IL-21 signalling stub discussion",
      at: "2026-11-09T18:00:00.000Z",
    });
    collab = addExperimentProposalStub(collab, bobActor(), {
      proposalId: "exp-prop-1",
      title: "Stub experiment proposal",
      at: "2026-11-09T18:30:00.000Z",
    });
    expect(collab.hypothesisDiscussions[0]!.stub).toBe(true);
    expect(collab.experimentProposals[0]!.stub).toBe(true);
  });

  test("artifact-level share, comment, revision, review — not dataset access", () => {
    let collab = seedCollab();
    collab = inviteCollaborator(collab, ownerActor(), {
      inviteId: "hsi-invite-bob-art",
      invitedPrincipalId: "principal-bob",
      invitedOrgId: "hsi-org-beta-lab",
      proposedRole: "contributor",
      at: later,
    });
    collab = acceptInvite(collab, bobActor(), {inviteId: "hsi-invite-bob-art", at: later2});

    collab = registerVersionedArtifact(collab, ownerActor(), {
      artifact: {
        artifactId: "hsi-artifact-shared-brief-1",
        kind: "shared_brief",
        version: 1,
        owningOrgId: "hsi-org-alpha-lab",
        dataClass: "org_private",
        label: "Private brief excerpt (shared artifact only)",
      },
      at: "2026-11-09T17:00:00.000Z",
    });
    expect(collab.versionedArtifacts[0]!.grantsUnderlyingDatasetAccess).toBe(false);

    // Before ACL: cross-org contributor denied on org_private.
    expect(
      decideCollaborativeArtifactAccess({
        collab,
        actor: bobActor(),
        artifactId: "hsi-artifact-shared-brief-1",
        grant: "read",
        enforceTenantIsolation: true,
      }).allowed,
    ).toBe(false);

    collab = shareSelectedArtifact(collab, ownerActor(), {
      artifactId: "hsi-artifact-shared-brief-1",
      granteePrincipalId: "principal-bob",
      grants: ["read", "comment", "propose_revision"],
      at: "2026-11-09T17:15:00.000Z",
    });
    expect(
      decideCollaborativeArtifactAccess({
        collab,
        actor: bobActor(),
        artifactId: "hsi-artifact-shared-brief-1",
        grant: "read",
        enforceTenantIsolation: true,
      }).allowed,
    ).toBe(true);

    // Sharing the artifact still does not open restricted datasets.
    expect(denyRestrictedDatasetAccessViaCollaborationShare().allowed).toBe(false);

    const orgStore = createMemoryResearchOrganisationStore();
    const alpha = draftResearchOrganisation({
      id: "hsi-org-alpha-lab",
      name: "Alpha Lab",
      type: "university",
      createdAt: asOf,
      lifecycle: "active",
      membership: [
        draftOrgMembership({
          membershipId: "hsi-org-member-alice-admin",
          orgId: "hsi-org-alpha-lab",
          principalId: "principal-alice",
          roles: ["org_admin"],
          grantedAt: asOf,
        }),
      ],
    });
    orgStore.upsertOrganisation(alpha);
    const datasetDecision = decideTenantArtifactAccess({
      actor: bobActor(),
      organisation: alpha,
      artifact: {
        artifactId: "hsi-artifact-shared-brief-1::underlying-dataset",
        owningOrgId: "hsi-org-alpha-lab",
        teamId: null,
        dataClass: "org_private",
      },
      permission: "read",
    });
    expect(datasetDecision.allowed).toBe(false);
    expect(datasetDecision.reason).toBe("not_a_member");

    collab = addComment(collab, bobActor(), {
      commentId: "comment-1",
      artifactId: "hsi-artifact-shared-brief-1",
      text: "Artifact comment under ACL",
      at: "2026-11-09T17:30:00.000Z",
    });
    collab = proposeRevision(collab, bobActor(), {
      revisionId: "rev-1",
      artifactId: "hsi-artifact-shared-brief-1",
      summary: "Clarify limitations section",
      at: "2026-11-09T17:45:00.000Z",
    });
    collab = approveOrRejectPermittedAction(collab, ownerActor(), {
      decision: "approve",
      target: "revision",
      targetId: "rev-1",
      at: "2026-11-09T18:00:00.000Z",
    });
    expect(collab.revisionProposals[0]!.status).toBe("accepted");

    collab = requestScientificReview(collab, ownerActor(), {
      at: "2026-11-09T18:15:00.000Z",
    });
    expect(collab.lifecycle).toBe("under_scientific_review");
  });

  test("fail-closed: outsider and revoked collaborator denied; archive blocks actions", () => {
    let collab = seedCollab();
    collab = inviteCollaborator(collab, ownerActor(), {
      inviteId: "hsi-invite-bob-deny",
      invitedPrincipalId: "principal-bob",
      invitedOrgId: "hsi-org-beta-lab",
      proposedRole: "observer",
      at: later,
    });
    collab = acceptInvite(collab, bobActor(), {
      inviteId: "hsi-invite-bob-deny",
      at: later2,
    });
    collab = registerVersionedArtifact(collab, ownerActor(), {
      artifact: {
        artifactId: "hsi-artifact-private-note",
        kind: "hypothesis_note",
        version: 1,
        owningOrgId: "hsi-org-alpha-lab",
        dataClass: "org_private",
        label: "Private note",
      },
      at: "2026-11-09T17:00:00.000Z",
    });

    expect(
      decideCollaborativeArtifactAccess({
        collab,
        actor: outsiderActor(),
        artifactId: "hsi-artifact-private-note",
        grant: "read",
      }).reason,
    ).toBe("not_a_collaborator");

    expect(() =>
      inviteCollaborator(collab, outsiderActor(), {
        inviteId: "hsi-invite-evil",
        invitedPrincipalId: "principal-evil",
        invitedOrgId: "hsi-org-evil",
        proposedRole: "contributor",
        at: "2026-11-09T17:30:00.000Z",
      }),
    ).toThrow(/not_a_collaborator|role_insufficient/);

    // Observer cannot share artifacts.
    expect(() =>
      shareSelectedArtifact(collab, bobActor(), {
        artifactId: "hsi-artifact-private-note",
        granteePrincipalId: "principal-alice",
        grants: ["read"],
        at: "2026-11-09T17:45:00.000Z",
      }),
    ).toThrow(/role_insufficient/);

    collab = revokeAccess(collab, ownerActor(), {
      principalId: "principal-bob",
      at: "2026-11-09T18:00:00.000Z",
    });
    expect(
      decideCollaborativeArtifactAccess({
        collab,
        actor: bobActor(),
        artifactId: "hsi-artifact-private-note",
        grant: "read",
      }).reason,
    ).toBe("not_a_collaborator");

    collab = archiveCollaboration(collab, ownerActor(), {
      at: "2026-11-09T19:00:00.000Z",
    });
    expect(collab.lifecycle).toBe("archived");
    expect(() =>
      inviteCollaborator(collab, ownerActor(), {
        inviteId: "hsi-invite-after-archive",
        invitedPrincipalId: "principal-dan",
        invitedOrgId: "hsi-org-beta-lab",
        proposedRole: "contributor",
        at: "2026-11-09T20:00:00.000Z",
      }),
    ).toThrow(/collaboration_archived/);
  });

  test("AI cannot accept independent_reviewer or approve scientific review", () => {
    let collab = seedCollab();
    collab = inviteCollaborator(collab, ownerActor(), {
      inviteId: "hsi-invite-agent",
      invitedPrincipalId: "agent-bot-1",
      invitedOrgId: "hsi-org-alpha-lab",
      proposedRole: "independent_reviewer",
      at: later,
    });
    expect(() =>
      acceptInvite(
        collab,
        {
          principalId: "agent-bot-1",
          authenticated: true,
          actorKind: "ai_agent",
          existingResearchRoles: [],
          platformRoles: [],
        },
        {inviteId: "hsi-invite-agent", at: later2},
      ),
    ).toThrow(/ai_cannot_independent_review/);
  });

  test("memory store + pack + persistence projection", () => {
    const store = createMemoryCollaborativeInvestigationStore();
    const collab = store.upsert(seedCollab());
    expect(store.get(collab.collaborationId)?.investigationId).toBe(
      "hsi-inv-m9-collab-demo",
    );
    expect(store.getByInvestigationId("hsi-inv-m9-collab-demo")?.collaborationId).toBe(
      collab.collaborationId,
    );
    const pack = buildCollaborativeInvestigationPack({
      collaborations: store.list(),
      asOf,
    });
    expect(pack.collaborationCount).toBe(1);
    expect(pack.honesty.sharingDoesNotGrantRestrictedDatasetAccess).toBe(true);
    const lines = projectCollaborativeInvestigationPersistenceLines(collab);
    expect(lines.some((l) => l.includes("sharingGrantsDatasetAccess=false"))).toBe(true);
    expect(lines.some((l) => l.includes("neon=red-wave-only"))).toBe(true);
  });
});
