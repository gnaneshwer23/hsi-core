/**
 * Milestone 9 / PR2 — Collaborative Investigation Contracts.
 *
 * Extends M6 investigation orchestration + M9 PR1 org/tenant security with
 * authorised collaboration: ownership, participating orgs, collaborators,
 * shared plan / tasks, evidence contribution *references*, hypothesis /
 * experiment stubs, review checkpoints, decision history, and versioned
 * research artifacts with artifact-level permissions.
 *
 * Critical: sharing an investigation does NOT grant access to underlying
 * restricted datasets. Cross-org access is fail-closed. Does NOT invent a
 * social network, separate app, Research Decision Workbench UI, federated
 * connectors/query, discovery network UI, Neon migration, Gate C auto-approve,
 * MoU, PHI/CDS, or full contribution/attribution model (PR3).
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";
import {
  INVESTIGATION_ORCHESTRATION_SCHEMA,
  type ScientificInvestigationContract,
} from "./evidence/investigationOrchestrationContracts";
import {
  assertSameTenant,
  decideTenantArtifactAccess,
  type CollaborationActor,
  type ResearchOrganisation,
  type TenantScopedArtifactRef,
} from "./researchOrganisationTenantSecurity";

export const COLLABORATIVE_INVESTIGATION_SCHEMA =
  "hsi-collaborative-investigation-1" as const;
export const COLLABORATIVE_INVESTIGATION_METHOD =
  "hsi.collaborative_investigation.v1" as const;
export const COLLABORATIVE_INVESTIGATION_VERSION = "0.1.0" as const;

/** Roles within a shared investigation (distinct from org membership roles). */
export const COLLABORATION_ROLES = [
  "owner",
  "co_investigator",
  "contributor",
  "independent_reviewer",
  "observer",
] as const;
export type CollaborationRole = (typeof COLLABORATION_ROLES)[number];

export const COLLABORATION_LIFECYCLES = [
  "draft",
  "inviting",
  "active",
  "under_scientific_review",
  "archived",
] as const;
export type CollaborationLifecycle = (typeof COLLABORATION_LIFECYCLES)[number];

export const INVITE_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "revoked",
  "expired",
] as const;
export type InviteStatus = (typeof INVITE_STATUSES)[number];

/** Artifact-level share grants — never dataset/corpus grants. */
export const ARTIFACT_SHARE_GRANTS = [
  "read",
  "comment",
  "propose_revision",
  "request_scientific_review",
] as const;
export type ArtifactShareGrant = (typeof ARTIFACT_SHARE_GRANTS)[number];

export const COLLABORATION_ACTIONS = [
  "invite",
  "accept_invite",
  "decline_invite",
  "assign_role",
  "share_artifact",
  "comment",
  "propose_revision",
  "request_scientific_review",
  "approve_action",
  "reject_action",
  "revoke_access",
  "archive_collaboration",
] as const;
export type CollaborationAction = (typeof COLLABORATION_ACTIONS)[number];

export const DECISION_KINDS = [
  "invite_accepted",
  "invite_declined",
  "role_assigned",
  "artifact_shared",
  "revision_proposed",
  "scientific_review_requested",
  "action_approved",
  "action_rejected",
  "access_revoked",
  "collaboration_archived",
  "checkpoint_recorded",
] as const;
export type DecisionKind = (typeof DECISION_KINDS)[number];

const COLLAB_ID_RE = /^hsi-collab-[a-z0-9-]{3,80}$/;
const INVITE_ID_RE = /^hsi-invite-[a-z0-9-]{3,80}$/;
const ARTIFACT_ID_RE = /^hsi-(inv|artifact|evidence|plan|task)-[a-z0-9-]{3,100}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const ORG_ID_RE = /^hsi-org-[a-z0-9-]{3,64}$/;
const OBJ_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;

export type CollaborationHonesty = {
  sharingDoesNotGrantRestrictedDatasetAccess: true;
  artifactLevelPermissionsRequired: true;
  federationDoesNotImplyCentralOwnership: true;
  institutionalDataRemainsTenantScoped: true;
  aiCannotActAsIndependentHumanReviewer: true;
  patientLevelFederatedRetrieval: false;
  realInstitutionalPartnershipClaimed: false;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  socialNetworkProduct: false;
  separateApp: false;
  workbenchUiDuplicated: false;
  federatedConnectorsImplemented: false;
  federatedQueryImplemented: false;
  discoveryNetworkUi: false;
  fullContributionModel: false;
  neonProjectPolicy: "red-wave-only";
  neonMigrationInThisPr: false;
};

export type ResearchCollaborator = {
  principalId: string;
  orgId: string;
  role: CollaborationRole;
  actorKind: "human" | "ai_agent" | "service";
  active: boolean;
  joinedAt: string;
  revokedAt: string | null;
};

export type CollaborationInvite = {
  inviteId: string;
  collaborationId: string;
  invitedPrincipalId: string;
  invitedOrgId: string;
  proposedRole: CollaborationRole;
  status: InviteStatus;
  invitedByPrincipalId: string;
  createdAt: string;
  respondedAt: string | null;
};

export type ScientificObjective = {
  id: string;
  text: string;
  ownerPrincipalId: string | null;
  hypothesisId: string | null;
};

export type SharedInvestigationPlan = {
  planId: string;
  version: number;
  summary: string;
  /** Bound to M6 planVersion when present. */
  boundInvestigationPlanVersion: number | null;
  updatedAt: string;
  updatedByPrincipalId: string;
};

export type TaskAssignment = {
  taskId: string;
  title: string;
  assigneePrincipalId: string | null;
  status: "todo" | "in_progress" | "blocked" | "done" | "cancelled";
  createdAt: string;
};

/** Evidence contribution *reference* only — full attribution model is PR3. */
export type EvidenceContributionRef = {
  contributionRefId: string;
  /** Pointer into existing evidence / source identity — not a full contribution record. */
  evidenceRef: string;
  contributedByPrincipalId: string;
  orgId: string;
  note: string;
  fullContributionModel: false;
};

/** Stub — full hypothesis intelligence is later. */
export type HypothesisDiscussionStub = {
  discussionId: string;
  hypothesisId: string | null;
  topic: string;
  authorPrincipalId: string;
  createdAt: string;
  stub: true;
};

/** Stub — full experiment proposal intelligence is later. */
export type ExperimentProposalStub = {
  proposalId: string;
  title: string;
  proposedByPrincipalId: string;
  createdAt: string;
  stub: true;
};

export type CollaborationReviewCheckpoint = {
  id: string;
  kind: "scientific_review" | "owner_approval" | "artifact_share_review" | "other";
  required: true;
  status: "pending" | "satisfied" | "rejected" | "blocked";
  note: string;
  gateCAutoApprove: false;
};

export type DecisionHistoryEntry = {
  decisionId: string;
  kind: DecisionKind;
  actorPrincipalId: string;
  at: string;
  summary: string;
  relatedArtifactId: string | null;
};

export type VersionedResearchArtifact = {
  artifactId: string;
  kind:
    | "investigation_plan"
    | "shared_brief"
    | "evidence_bundle_ref"
    | "hypothesis_note"
    | "experiment_note"
    | "review_packet"
    | "other";
  version: number;
  owningOrgId: string;
  /** Artifact data class — restricted classes stay tenant-scoped. */
  dataClass: "public_biomedical" | "licensed_partner" | "org_private" | "synthetic_demo";
  /** Explicit: artifact share ≠ underlying dataset access. */
  grantsUnderlyingDatasetAccess: false;
  label: string;
  createdAt: string;
  createdByPrincipalId: string;
};

export type ArtifactAclEntry = {
  artifactId: string;
  principalId: string;
  grants: readonly ArtifactShareGrant[];
  grantedByPrincipalId: string;
  grantedAt: string;
  revokedAt: string | null;
};

export type CollaborationComment = {
  commentId: string;
  artifactId: string | null;
  authorPrincipalId: string;
  text: string;
  createdAt: string;
};

export type RevisionProposal = {
  revisionId: string;
  artifactId: string;
  proposedByPrincipalId: string;
  summary: string;
  status: "proposed" | "accepted" | "rejected" | "withdrawn";
  createdAt: string;
};

export type CollaborativeInvestigation = {
  schema: typeof COLLABORATIVE_INVESTIGATION_SCHEMA;
  method: typeof COLLABORATIVE_INVESTIGATION_METHOD;
  version: typeof COLLABORATIVE_INVESTIGATION_VERSION;
  collaborationId: string;
  /** Bound M6 investigation id (orchestration contract). */
  investigationId: string;
  investigationSchema: typeof INVESTIGATION_ORCHESTRATION_SCHEMA;
  ownerPrincipalId: string;
  ownerOrgId: string;
  participatingOrgIds: readonly string[];
  collaborators: readonly ResearchCollaborator[];
  invites: readonly CollaborationInvite[];
  scientificObjectives: readonly ScientificObjective[];
  sharedPlan: SharedInvestigationPlan | null;
  taskAssignments: readonly TaskAssignment[];
  evidenceContributionRefs: readonly EvidenceContributionRef[];
  hypothesisDiscussions: readonly HypothesisDiscussionStub[];
  experimentProposals: readonly ExperimentProposalStub[];
  reviewCheckpoints: readonly CollaborationReviewCheckpoint[];
  decisionHistory: readonly DecisionHistoryEntry[];
  versionedArtifacts: readonly VersionedResearchArtifact[];
  artifactAcls: readonly ArtifactAclEntry[];
  comments: readonly CollaborationComment[];
  revisionProposals: readonly RevisionProposal[];
  lifecycle: CollaborationLifecycle;
  createdAt: string;
  updatedAt: string;
  honesty: CollaborationHonesty;
};

export type CollaborativeArtifactAccessDecision = {
  allowed: boolean;
  reason:
    | "allowed"
    | "unauthenticated"
    | "collaboration_not_found"
    | "collaboration_archived"
    | "not_a_collaborator"
    | "collaborator_inactive"
    | "role_insufficient"
    | "artifact_acl_denied"
    | "cross_org_denied"
    | "restricted_dataset_access_denied"
    | "ai_cannot_independent_review"
    | "tenant_isolation_denied";
  collaborationId: string | null;
  artifactId: string | null;
  grant: ArtifactShareGrant | null;
};

export type CollaborativeInvestigationStore = {
  upsert(collab: CollaborativeInvestigation): CollaborativeInvestigation;
  get(collaborationId: string): CollaborativeInvestigation | null;
  getByInvestigationId(investigationId: string): CollaborativeInvestigation | null;
  list(): readonly CollaborativeInvestigation[];
};

const DEFAULT_HONESTY: CollaborationHonesty = {
  sharingDoesNotGrantRestrictedDatasetAccess: true,
  artifactLevelPermissionsRequired: true,
  federationDoesNotImplyCentralOwnership: true,
  institutionalDataRemainsTenantScoped: true,
  aiCannotActAsIndependentHumanReviewer: true,
  patientLevelFederatedRetrieval: false,
  realInstitutionalPartnershipClaimed: false,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  socialNetworkProduct: false,
  separateApp: false,
  workbenchUiDuplicated: false,
  federatedConnectorsImplemented: false,
  federatedQueryImplemented: false,
  discoveryNetworkUi: false,
  fullContributionModel: false,
  neonProjectPolicy: "red-wave-only",
  neonMigrationInThisPr: false,
};

const ROLE_ACTIONS: Record<CollaborationRole, readonly CollaborationAction[]> = {
  owner: [...COLLABORATION_ACTIONS],
  co_investigator: [
    "invite",
    "assign_role",
    "share_artifact",
    "comment",
    "propose_revision",
    "request_scientific_review",
    "approve_action",
    "reject_action",
    "revoke_access",
  ],
  contributor: ["share_artifact", "comment", "propose_revision", "request_scientific_review"],
  independent_reviewer: ["comment", "approve_action", "reject_action", "request_scientific_review"],
  observer: ["comment"],
};

function isIsoTimestamp(value: string): boolean {
  return (
    typeof value === "string" &&
    value.length >= 20 &&
    value.length <= 40 &&
    !Number.isNaN(Date.parse(value))
  );
}

function assertClosed<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): asserts value is T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw Error(`Invalid ${label}`);
  }
}

function touch(
  collab: CollaborativeInvestigation,
  updatedAt: string,
  decision?: DecisionHistoryEntry,
): CollaborativeInvestigation {
  if (!isIsoTimestamp(updatedAt)) throw Error("Invalid updatedAt");
  if (Date.parse(updatedAt) < Date.parse(collab.updatedAt)) {
    throw Error("updatedAt must not move backwards");
  }
  return validateCollaborativeInvestigation({
    ...collab,
    updatedAt,
    decisionHistory: decision
      ? [...collab.decisionHistory, decision]
      : [...collab.decisionHistory],
  });
}

function requireActiveCollaborator(
  collab: CollaborativeInvestigation,
  principalId: string,
): ResearchCollaborator {
  const member = collab.collaborators.find(
    (c) => c.principalId === principalId && c.active && c.revokedAt === null,
  );
  if (!member) throw Error("not_a_collaborator");
  return member;
}

function assertCanAct(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  action: CollaborationAction,
): ResearchCollaborator {
  if (!actor.authenticated || !PRINCIPAL_RE.test(actor.principalId)) {
    throw Error("unauthenticated");
  }
  if (collab.lifecycle === "archived") throw Error("collaboration_archived");
  const member = requireActiveCollaborator(collab, actor.principalId);
  if (!ROLE_ACTIONS[member.role].includes(action)) {
    throw Error("role_insufficient");
  }
  if (
    action === "approve_action" &&
    member.role === "independent_reviewer" &&
    actor.actorKind !== "human"
  ) {
    throw Error("ai_cannot_independent_review");
  }
  return member;
}

export function draftCollaborativeInvestigation(input: {
  collaborationId: string;
  investigation: Pick<ScientificInvestigationContract, "investigationId" | "schemaVersion">;
  ownerPrincipalId: string;
  ownerOrgId: string;
  createdAt: string;
  participatingOrgIds?: readonly string[];
  scientificObjectives?: readonly ScientificObjective[];
  lifecycle?: CollaborationLifecycle;
}): CollaborativeInvestigation {
  if (!COLLAB_ID_RE.test(input.collaborationId)) throw Error("Invalid collaboration id");
  if (!input.investigation.investigationId.trim()) throw Error("Invalid investigation id");
  if (input.investigation.schemaVersion !== INVESTIGATION_ORCHESTRATION_SCHEMA) {
    throw Error("Investigation must use M6 orchestration schema");
  }
  if (!PRINCIPAL_RE.test(input.ownerPrincipalId)) throw Error("Invalid owner principal");
  if (!ORG_ID_RE.test(input.ownerOrgId)) throw Error("Invalid owner org");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const lifecycle = input.lifecycle ?? "draft";
  assertClosed(lifecycle, COLLABORATION_LIFECYCLES, "lifecycle");

  const participating = [
    ...new Set([input.ownerOrgId, ...(input.participatingOrgIds ?? [])]),
  ];
  for (const orgId of participating) {
    if (!ORG_ID_RE.test(orgId)) throw Error("Invalid participating org id");
  }

  const owner: ResearchCollaborator = {
    principalId: input.ownerPrincipalId,
    orgId: input.ownerOrgId,
    role: "owner",
    actorKind: "human",
    active: true,
    joinedAt: input.createdAt,
    revokedAt: null,
  };

  const collab: CollaborativeInvestigation = {
    schema: COLLABORATIVE_INVESTIGATION_SCHEMA,
    method: COLLABORATIVE_INVESTIGATION_METHOD,
    version: COLLABORATIVE_INVESTIGATION_VERSION,
    collaborationId: input.collaborationId,
    investigationId: input.investigation.investigationId,
    investigationSchema: INVESTIGATION_ORCHESTRATION_SCHEMA,
    ownerPrincipalId: input.ownerPrincipalId,
    ownerOrgId: input.ownerOrgId,
    participatingOrgIds: participating,
    collaborators: [owner],
    invites: [],
    scientificObjectives: [...(input.scientificObjectives ?? [])],
    sharedPlan: null,
    taskAssignments: [],
    evidenceContributionRefs: [],
    hypothesisDiscussions: [],
    experimentProposals: [],
    reviewCheckpoints: [
      {
        id: "cp-collab-scientific-review",
        kind: "scientific_review",
        required: true,
        status: "pending",
        note: "Human scientific review required; Gate C auto-approve refused.",
        gateCAutoApprove: false,
      },
    ],
    decisionHistory: [],
    versionedArtifacts: [],
    artifactAcls: [],
    comments: [],
    revisionProposals: [],
    lifecycle,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    honesty: {...DEFAULT_HONESTY},
  };
  return validateCollaborativeInvestigation(collab);
}

export function validateCollaborativeInvestigation(
  collab: CollaborativeInvestigation,
): CollaborativeInvestigation {
  if (collab.schema !== COLLABORATIVE_INVESTIGATION_SCHEMA) {
    throw Error("Invalid collaboration schema");
  }
  if (collab.method !== COLLABORATIVE_INVESTIGATION_METHOD) {
    throw Error("Invalid collaboration method");
  }
  if (collab.version !== COLLABORATIVE_INVESTIGATION_VERSION) {
    throw Error("Invalid collaboration version");
  }
  if (!COLLAB_ID_RE.test(collab.collaborationId)) throw Error("Invalid collaboration id");
  if (collab.investigationSchema !== INVESTIGATION_ORCHESTRATION_SCHEMA) {
    throw Error("Must bind M6 investigation schema");
  }
  if (!ORG_ID_RE.test(collab.ownerOrgId)) throw Error("Invalid owner org");
  if (!PRINCIPAL_RE.test(collab.ownerPrincipalId)) throw Error("Invalid owner principal");
  assertClosed(collab.lifecycle, COLLABORATION_LIFECYCLES, "lifecycle");
  if (!isIsoTimestamp(collab.createdAt) || !isIsoTimestamp(collab.updatedAt)) {
    throw Error("Invalid timestamps");
  }

  if (collab.honesty.sharingDoesNotGrantRestrictedDatasetAccess !== true) {
    throw Error("Sharing must not grant restricted dataset access");
  }
  if (collab.honesty.artifactLevelPermissionsRequired !== true) {
    throw Error("Artifact-level permissions required");
  }
  if (collab.honesty.gateCAutoApprove !== false) throw Error("Gate C auto-approve refused");
  if (collab.honesty.phiCdsWired !== false) throw Error("PHI/CDS refused");
  if (collab.honesty.neonProjectPolicy !== "red-wave-only") throw Error("Neon red-wave only");
  if (collab.honesty.neonMigrationInThisPr !== false) {
    throw Error("PR2 must not claim Neon migration");
  }
  if (collab.honesty.fullContributionModel !== false) {
    throw Error("Full contribution model is PR3");
  }
  if (collab.honesty.federatedConnectorsImplemented !== false) {
    throw Error("Federated connectors out of PR2");
  }
  if (collab.honesty.federatedQueryImplemented !== false) {
    throw Error("Federated query out of PR2");
  }
  if (collab.honesty.discoveryNetworkUi !== false) {
    throw Error("Discovery network UI out of PR2");
  }
  if (collab.honesty.workbenchUiDuplicated !== false) {
    throw Error("Must not duplicate workbench UI");
  }

  if (!collab.participatingOrgIds.includes(collab.ownerOrgId)) {
    throw Error("Owner org must participate");
  }
  for (const orgId of collab.participatingOrgIds) {
    if (!ORG_ID_RE.test(orgId)) throw Error("Invalid participating org");
  }

  const ownerRows = collab.collaborators.filter((c) => c.role === "owner" && c.active);
  if (ownerRows.length !== 1) throw Error("Exactly one active owner required");
  if (ownerRows[0]!.principalId !== collab.ownerPrincipalId) {
    throw Error("Owner principal mismatch");
  }

  for (const c of collab.collaborators) {
    if (!PRINCIPAL_RE.test(c.principalId)) throw Error("Invalid collaborator principal");
    if (!ORG_ID_RE.test(c.orgId)) throw Error("Invalid collaborator org");
    assertClosed(c.role, COLLABORATION_ROLES, "collaboration role");
    if (!collab.participatingOrgIds.includes(c.orgId)) {
      throw Error("Collaborator org must participate");
    }
    if (c.actorKind !== "human" && c.role === "independent_reviewer") {
      throw Error("AI/service cannot be independent_reviewer");
    }
  }

  for (const invite of collab.invites) {
    if (!INVITE_ID_RE.test(invite.inviteId)) throw Error("Invalid invite id");
    if (invite.collaborationId !== collab.collaborationId) {
      throw Error("Invite collaboration mismatch");
    }
    assertClosed(invite.status, INVITE_STATUSES, "invite status");
    assertClosed(invite.proposedRole, COLLABORATION_ROLES, "proposed role");
    if (invite.proposedRole === "owner") throw Error("Cannot invite as owner");
  }

  for (const obj of collab.scientificObjectives) {
    if (!OBJ_ID_RE.test(obj.id)) throw Error("Invalid objective id");
    if (!obj.text.trim() || obj.text.length > 500) throw Error("Invalid objective text");
  }

  for (const ref of collab.evidenceContributionRefs) {
    if (ref.fullContributionModel !== false) {
      throw Error("Evidence refs must keep fullContributionModel false");
    }
  }

  for (const stub of collab.hypothesisDiscussions) {
    if (stub.stub !== true) throw Error("Hypothesis discussions are stubs in PR2");
  }
  for (const stub of collab.experimentProposals) {
    if (stub.stub !== true) throw Error("Experiment proposals are stubs in PR2");
  }

  for (const cp of collab.reviewCheckpoints) {
    if (cp.required !== true) throw Error("Review checkpoints remain required");
    if (cp.gateCAutoApprove !== false) throw Error("Checkpoint Gate C auto-approve refused");
  }

  for (const artifact of collab.versionedArtifacts) {
    if (!ARTIFACT_ID_RE.test(artifact.artifactId)) throw Error("Invalid artifact id");
    if (artifact.grantsUnderlyingDatasetAccess !== false) {
      throw Error("Artifact must not grant underlying dataset access");
    }
    if (!ORG_ID_RE.test(artifact.owningOrgId)) throw Error("Invalid artifact owning org");
    if (!collab.participatingOrgIds.includes(artifact.owningOrgId)) {
      throw Error("Artifact owning org must participate");
    }
  }

  for (const acl of collab.artifactAcls) {
    if (!ARTIFACT_ID_RE.test(acl.artifactId)) throw Error("Invalid ACL artifact id");
    for (const grant of acl.grants) assertClosed(grant, ARTIFACT_SHARE_GRANTS, "artifact grant");
  }

  return collab;
}

/**
 * Sharing an investigation never implies access to restricted underlying datasets.
 * Callers must still pass tenant artifact checks for org_private / licensed_partner data.
 */
export function assertSharingDoesNotGrantDatasetAccess(
  artifact: VersionedResearchArtifact,
): void {
  if (artifact.grantsUnderlyingDatasetAccess !== false) {
    throw Error("restricted_dataset_access_denied");
  }
}

export function inviteCollaborator(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {
    inviteId: string;
    invitedPrincipalId: string;
    invitedOrgId: string;
    proposedRole: CollaborationRole;
    at: string;
  },
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "invite");
  if (!INVITE_ID_RE.test(input.inviteId)) throw Error("Invalid invite id");
  if (!PRINCIPAL_RE.test(input.invitedPrincipalId)) throw Error("Invalid invited principal");
  if (!ORG_ID_RE.test(input.invitedOrgId)) throw Error("Invalid invited org");
  assertClosed(input.proposedRole, COLLABORATION_ROLES, "proposed role");
  if (input.proposedRole === "owner") throw Error("Cannot invite as owner");
  if (collab.invites.some((i) => i.inviteId === input.inviteId)) {
    throw Error("Duplicate invite id");
  }
  if (
    collab.collaborators.some(
      (c) => c.principalId === input.invitedPrincipalId && c.active && c.revokedAt === null,
    )
  ) {
    throw Error("Already a collaborator");
  }

  const participatingOrgIds = collab.participatingOrgIds.includes(input.invitedOrgId)
    ? collab.participatingOrgIds
    : [...collab.participatingOrgIds, input.invitedOrgId];

  const invite: CollaborationInvite = {
    inviteId: input.inviteId,
    collaborationId: collab.collaborationId,
    invitedPrincipalId: input.invitedPrincipalId,
    invitedOrgId: input.invitedOrgId,
    proposedRole: input.proposedRole,
    status: "pending",
    invitedByPrincipalId: actor.principalId,
    createdAt: input.at,
    respondedAt: null,
  };

  const next: CollaborativeInvestigation = {
    ...collab,
    participatingOrgIds,
    invites: [...collab.invites, invite],
    lifecycle: collab.lifecycle === "draft" ? "inviting" : collab.lifecycle,
  };
  return touch(next, input.at);
}

export function acceptInvite(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {inviteId: string; at: string},
): CollaborativeInvestigation {
  if (!actor.authenticated) throw Error("unauthenticated");
  if (collab.lifecycle === "archived") throw Error("collaboration_archived");
  const invite = collab.invites.find((i) => i.inviteId === input.inviteId);
  if (!invite || invite.status !== "pending") throw Error("Invite not pending");
  if (invite.invitedPrincipalId !== actor.principalId) throw Error("Invite principal mismatch");
  if (invite.proposedRole === "independent_reviewer" && actor.actorKind !== "human") {
    throw Error("ai_cannot_independent_review");
  }

  const invites = collab.invites.map((i) =>
    i.inviteId === input.inviteId
      ? {...i, status: "accepted" as const, respondedAt: input.at}
      : i,
  );
  const collaborator: ResearchCollaborator = {
    principalId: invite.invitedPrincipalId,
    orgId: invite.invitedOrgId,
    role: invite.proposedRole,
    actorKind: actor.actorKind,
    active: true,
    joinedAt: input.at,
    revokedAt: null,
  };
  const next: CollaborativeInvestigation = {
    ...collab,
    invites,
    collaborators: [...collab.collaborators, collaborator],
    lifecycle: collab.lifecycle === "inviting" ? "active" : collab.lifecycle,
  };
  return touch(next, input.at, {
    decisionId: `dec-accept-${input.inviteId}`,
    kind: "invite_accepted",
    actorPrincipalId: actor.principalId,
    at: input.at,
    summary: `Accepted invite as ${invite.proposedRole}`,
    relatedArtifactId: null,
  });
}

export function declineInvite(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {inviteId: string; at: string},
): CollaborativeInvestigation {
  if (!actor.authenticated) throw Error("unauthenticated");
  const invite = collab.invites.find((i) => i.inviteId === input.inviteId);
  if (!invite || invite.status !== "pending") throw Error("Invite not pending");
  if (invite.invitedPrincipalId !== actor.principalId) throw Error("Invite principal mismatch");
  const invites = collab.invites.map((i) =>
    i.inviteId === input.inviteId
      ? {...i, status: "declined" as const, respondedAt: input.at}
      : i,
  );
  return touch(
    {...collab, invites},
    input.at,
    {
      decisionId: `dec-decline-${input.inviteId}`,
      kind: "invite_declined",
      actorPrincipalId: actor.principalId,
      at: input.at,
      summary: "Declined collaboration invite",
      relatedArtifactId: null,
    },
  );
}

export function assignCollaborationRole(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {principalId: string; role: CollaborationRole; at: string},
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "assign_role");
  assertClosed(input.role, COLLABORATION_ROLES, "collaboration role");
  if (input.role === "owner") throw Error("Cannot reassign ownership via role assign");
  const collaborators = collab.collaborators.map((c) => {
    if (c.principalId !== input.principalId || !c.active) return c;
    if (c.role === "owner") throw Error("Cannot demote owner via assign_role");
    if (input.role === "independent_reviewer" && c.actorKind !== "human") {
      throw Error("ai_cannot_independent_review");
    }
    return {...c, role: input.role};
  });
  if (!collaborators.some((c) => c.principalId === input.principalId && c.active)) {
    throw Error("not_a_collaborator");
  }
  return touch(
    {...collab, collaborators},
    input.at,
    {
      decisionId: `dec-role-${input.principalId}-${input.at}`,
      kind: "role_assigned",
      actorPrincipalId: actor.principalId,
      at: input.at,
      summary: `Assigned role ${input.role} to ${input.principalId}`,
      relatedArtifactId: null,
    },
  );
}

export function upsertSharedPlan(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {
    planId: string;
    summary: string;
    boundInvestigationPlanVersion?: number | null;
    at: string;
  },
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "propose_revision");
  if (!ARTIFACT_ID_RE.test(input.planId) && !/^hsi-plan-[a-z0-9-]{3,80}$/.test(input.planId)) {
    throw Error("Invalid plan id");
  }
  if (!input.summary.trim() || input.summary.length > 2000) throw Error("Invalid plan summary");
  const prevVersion = collab.sharedPlan?.version ?? 0;
  const sharedPlan: SharedInvestigationPlan = {
    planId: input.planId,
    version: prevVersion + 1,
    summary: input.summary.trim(),
    boundInvestigationPlanVersion: input.boundInvestigationPlanVersion ?? null,
    updatedAt: input.at,
    updatedByPrincipalId: actor.principalId,
  };
  return touch({...collab, sharedPlan}, input.at);
}

export function assignTask(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {
    taskId: string;
    title: string;
    assigneePrincipalId: string | null;
    at: string;
  },
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "assign_role");
  if (!/^hsi-task-[a-z0-9-]{3,80}$/.test(input.taskId)) throw Error("Invalid task id");
  if (!input.title.trim() || input.title.length > 200) throw Error("Invalid task title");
  if (
    input.assigneePrincipalId &&
    !collab.collaborators.some(
      (c) => c.principalId === input.assigneePrincipalId && c.active,
    )
  ) {
    throw Error("Assignee must be an active collaborator");
  }
  if (collab.taskAssignments.some((t) => t.taskId === input.taskId)) {
    throw Error("Duplicate task id");
  }
  const task: TaskAssignment = {
    taskId: input.taskId,
    title: input.title.trim(),
    assigneePrincipalId: input.assigneePrincipalId,
    status: "todo",
    createdAt: input.at,
  };
  return touch({...collab, taskAssignments: [...collab.taskAssignments, task]}, input.at);
}

export function addEvidenceContributionRef(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {
    contributionRefId: string;
    evidenceRef: string;
    orgId: string;
    note: string;
    at: string;
  },
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "comment");
  if (!OBJ_ID_RE.test(input.contributionRefId)) throw Error("Invalid contribution ref id");
  if (!input.evidenceRef.trim() || input.evidenceRef.length > 200) {
    throw Error("Invalid evidence ref");
  }
  if (!ORG_ID_RE.test(input.orgId)) throw Error("Invalid contribution org");
  if (!collab.participatingOrgIds.includes(input.orgId)) {
    throw Error("Contribution org must participate");
  }
  const ref: EvidenceContributionRef = {
    contributionRefId: input.contributionRefId,
    evidenceRef: input.evidenceRef.trim(),
    contributedByPrincipalId: actor.principalId,
    orgId: input.orgId,
    note: input.note.trim().slice(0, 500),
    fullContributionModel: false,
  };
  return touch(
    {
      ...collab,
      evidenceContributionRefs: [...collab.evidenceContributionRefs, ref],
    },
    input.at,
  );
}

export function addHypothesisDiscussionStub(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {
    discussionId: string;
    topic: string;
    hypothesisId?: string | null;
    at: string;
  },
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "comment");
  if (!OBJ_ID_RE.test(input.discussionId)) throw Error("Invalid discussion id");
  const stub: HypothesisDiscussionStub = {
    discussionId: input.discussionId,
    hypothesisId: input.hypothesisId ?? null,
    topic: input.topic.trim().slice(0, 300),
    authorPrincipalId: actor.principalId,
    createdAt: input.at,
    stub: true,
  };
  return touch(
    {
      ...collab,
      hypothesisDiscussions: [...collab.hypothesisDiscussions, stub],
    },
    input.at,
  );
}

export function addExperimentProposalStub(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {proposalId: string; title: string; at: string},
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "propose_revision");
  if (!OBJ_ID_RE.test(input.proposalId)) throw Error("Invalid proposal id");
  const stub: ExperimentProposalStub = {
    proposalId: input.proposalId,
    title: input.title.trim().slice(0, 200),
    proposedByPrincipalId: actor.principalId,
    createdAt: input.at,
    stub: true,
  };
  return touch(
    {
      ...collab,
      experimentProposals: [...collab.experimentProposals, stub],
    },
    input.at,
  );
}

export function registerVersionedArtifact(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {
    artifact: Omit<
      VersionedResearchArtifact,
      "createdAt" | "createdByPrincipalId" | "grantsUnderlyingDatasetAccess"
    >;
    at: string;
  },
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "share_artifact");
  if (!ARTIFACT_ID_RE.test(input.artifact.artifactId)) throw Error("Invalid artifact id");
  if (!collab.participatingOrgIds.includes(input.artifact.owningOrgId)) {
    throw Error("Artifact owning org must participate");
  }
  const artifact: VersionedResearchArtifact = {
    ...input.artifact,
    grantsUnderlyingDatasetAccess: false,
    createdAt: input.at,
    createdByPrincipalId: actor.principalId,
  };
  assertSharingDoesNotGrantDatasetAccess(artifact);
  if (collab.versionedArtifacts.some((a) => a.artifactId === artifact.artifactId)) {
    throw Error("Duplicate artifact id");
  }
  return touch(
    {
      ...collab,
      versionedArtifacts: [...collab.versionedArtifacts, artifact],
    },
    input.at,
  );
}

export function shareSelectedArtifact(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {
    artifactId: string;
    granteePrincipalId: string;
    grants: readonly ArtifactShareGrant[];
    at: string;
  },
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "share_artifact");
  const artifact = collab.versionedArtifacts.find((a) => a.artifactId === input.artifactId);
  if (!artifact) throw Error("Unknown artifact");
  assertSharingDoesNotGrantDatasetAccess(artifact);
  if (
    !collab.collaborators.some(
      (c) => c.principalId === input.granteePrincipalId && c.active,
    )
  ) {
    throw Error("Grantee must be an active collaborator");
  }
  if (!input.grants.length) throw Error("At least one grant required");
  for (const g of input.grants) assertClosed(g, ARTIFACT_SHARE_GRANTS, "artifact grant");

  const artifactAcls = [
    ...collab.artifactAcls.filter(
      (a) =>
        !(a.artifactId === input.artifactId && a.principalId === input.granteePrincipalId),
    ),
    {
      artifactId: input.artifactId,
      principalId: input.granteePrincipalId,
      grants: [...input.grants],
      grantedByPrincipalId: actor.principalId,
      grantedAt: input.at,
      revokedAt: null,
    } satisfies ArtifactAclEntry,
  ];

  return touch(
    {...collab, artifactAcls},
    input.at,
    {
      decisionId: `dec-share-${input.artifactId}-${input.granteePrincipalId}`,
      kind: "artifact_shared",
      actorPrincipalId: actor.principalId,
      at: input.at,
      summary: `Shared artifact ${input.artifactId} with selected grants`,
      relatedArtifactId: input.artifactId,
    },
  );
}

export function addComment(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {
    commentId: string;
    text: string;
    artifactId?: string | null;
    at: string;
  },
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "comment");
  if (!OBJ_ID_RE.test(input.commentId)) throw Error("Invalid comment id");
  if (!input.text.trim() || input.text.length > 2000) throw Error("Invalid comment text");
  if (input.artifactId) {
    const artifact = collab.versionedArtifacts.find((a) => a.artifactId === input.artifactId);
    if (!artifact) throw Error("Unknown artifact");
    const access = decideCollaborativeArtifactAccess({
      collab,
      actor,
      artifactId: input.artifactId,
      grant: "comment",
    });
    if (!access.allowed) throw Error(access.reason);
  }
  const comment: CollaborationComment = {
    commentId: input.commentId,
    artifactId: input.artifactId ?? null,
    authorPrincipalId: actor.principalId,
    text: input.text.trim(),
    createdAt: input.at,
  };
  return touch({...collab, comments: [...collab.comments, comment]}, input.at);
}

export function proposeRevision(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {
    revisionId: string;
    artifactId: string;
    summary: string;
    at: string;
  },
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "propose_revision");
  if (!OBJ_ID_RE.test(input.revisionId)) throw Error("Invalid revision id");
  const artifact = collab.versionedArtifacts.find((a) => a.artifactId === input.artifactId);
  if (!artifact) throw Error("Unknown artifact");
  const access = decideCollaborativeArtifactAccess({
    collab,
    actor,
    artifactId: input.artifactId,
    grant: "propose_revision",
  });
  if (!access.allowed && actor.principalId !== collab.ownerPrincipalId) {
    // Owners / co-investigators may propose without prior ACL when they registered the artifact.
    const member = requireActiveCollaborator(collab, actor.principalId);
    if (member.role !== "owner" && member.role !== "co_investigator" && member.role !== "contributor") {
      throw Error(access.reason);
    }
  }
  const revision: RevisionProposal = {
    revisionId: input.revisionId,
    artifactId: input.artifactId,
    proposedByPrincipalId: actor.principalId,
    summary: input.summary.trim().slice(0, 500),
    status: "proposed",
    createdAt: input.at,
  };
  return touch(
    {...collab, revisionProposals: [...collab.revisionProposals, revision]},
    input.at,
    {
      decisionId: `dec-rev-${input.revisionId}`,
      kind: "revision_proposed",
      actorPrincipalId: actor.principalId,
      at: input.at,
      summary: `Proposed revision on ${input.artifactId}`,
      relatedArtifactId: input.artifactId,
    },
  );
}

export function requestScientificReview(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {at: string; note?: string},
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "request_scientific_review");
  const reviewCheckpoints = collab.reviewCheckpoints.map((cp) =>
    cp.kind === "scientific_review"
      ? {
          ...cp,
          status: "pending" as const,
          note: input.note?.trim() || cp.note,
          gateCAutoApprove: false as const,
          required: true as const,
        }
      : cp,
  );
  return touch(
    {
      ...collab,
      reviewCheckpoints,
      lifecycle: "under_scientific_review",
    },
    input.at,
    {
      decisionId: `dec-sci-req-${input.at}`,
      kind: "scientific_review_requested",
      actorPrincipalId: actor.principalId,
      at: input.at,
      summary: "Requested scientific review",
      relatedArtifactId: null,
    },
  );
}

export function approveOrRejectPermittedAction(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {
    decision: "approve" | "reject";
    target: "revision" | "scientific_review_checkpoint";
    targetId: string;
    at: string;
    summary?: string;
  },
): CollaborativeInvestigation {
  const action: CollaborationAction =
    input.decision === "approve" ? "approve_action" : "reject_action";
  assertCanAct(collab, actor, action);

  if (input.target === "revision") {
    const revisionProposals = collab.revisionProposals.map((r) =>
      r.revisionId === input.targetId
        ? {
            ...r,
            status:
              input.decision === "approve"
                ? ("accepted" as const)
                : ("rejected" as const),
          }
        : r,
    );
    if (!collab.revisionProposals.some((r) => r.revisionId === input.targetId)) {
      throw Error("Unknown revision");
    }
    return touch(
      {...collab, revisionProposals},
      input.at,
      {
        decisionId: `dec-${input.decision}-${input.targetId}`,
        kind: input.decision === "approve" ? "action_approved" : "action_rejected",
        actorPrincipalId: actor.principalId,
        at: input.at,
        summary: input.summary?.trim() || `${input.decision} revision ${input.targetId}`,
        relatedArtifactId:
          collab.revisionProposals.find((r) => r.revisionId === input.targetId)?.artifactId ??
          null,
      },
    );
  }

  if (input.target === "scientific_review_checkpoint") {
    const member = requireActiveCollaborator(collab, actor.principalId);
    if (member.role !== "independent_reviewer" && member.role !== "owner") {
      throw Error("role_insufficient");
    }
    if (actor.actorKind !== "human") throw Error("ai_cannot_independent_review");
    const reviewCheckpoints = collab.reviewCheckpoints.map((cp) =>
      cp.id === input.targetId
        ? {
            ...cp,
            status:
              input.decision === "approve"
                ? ("satisfied" as const)
                : ("rejected" as const),
            gateCAutoApprove: false as const,
            required: true as const,
          }
        : cp,
    );
    if (!collab.reviewCheckpoints.some((cp) => cp.id === input.targetId)) {
      throw Error("Unknown checkpoint");
    }
    return touch(
      {...collab, reviewCheckpoints},
      input.at,
      {
        decisionId: `dec-cp-${input.decision}-${input.targetId}`,
        kind: input.decision === "approve" ? "action_approved" : "action_rejected",
        actorPrincipalId: actor.principalId,
        at: input.at,
        summary: input.summary?.trim() || `${input.decision} checkpoint ${input.targetId}`,
        relatedArtifactId: null,
      },
    );
  }

  const _exhaustive: never = input.target;
  void _exhaustive;
  throw Error("Unhandled approve/reject target");
}

export function revokeAccess(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {principalId: string; at: string},
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "revoke_access");
  if (input.principalId === collab.ownerPrincipalId) {
    throw Error("Cannot revoke owner access");
  }
  const collaborators = collab.collaborators.map((c) =>
    c.principalId === input.principalId && c.active
      ? {...c, active: false, revokedAt: input.at}
      : c,
  );
  if (!collab.collaborators.some((c) => c.principalId === input.principalId && c.active)) {
    throw Error("not_a_collaborator");
  }
  const invites = collab.invites.map((i) =>
    i.invitedPrincipalId === input.principalId && i.status === "pending"
      ? {...i, status: "revoked" as const, respondedAt: input.at}
      : i,
  );
  const artifactAcls = collab.artifactAcls.map((a) =>
    a.principalId === input.principalId && a.revokedAt === null
      ? {...a, revokedAt: input.at}
      : a,
  );
  return touch(
    {...collab, collaborators, invites, artifactAcls},
    input.at,
    {
      decisionId: `dec-revoke-${input.principalId}`,
      kind: "access_revoked",
      actorPrincipalId: actor.principalId,
      at: input.at,
      summary: `Revoked access for ${input.principalId}`,
      relatedArtifactId: null,
    },
  );
}

export function archiveCollaboration(
  collab: CollaborativeInvestigation,
  actor: CollaborationActor,
  input: {at: string},
): CollaborativeInvestigation {
  assertCanAct(collab, actor, "archive_collaboration");
  const member = requireActiveCollaborator(collab, actor.principalId);
  if (member.role !== "owner") throw Error("role_insufficient");
  return touch(
    {...collab, lifecycle: "archived"},
    input.at,
    {
      decisionId: `dec-archive-${input.at}`,
      kind: "collaboration_archived",
      actorPrincipalId: actor.principalId,
      at: input.at,
      summary: "Archived collaboration",
      relatedArtifactId: null,
    },
  );
}

/**
 * Fail-closed collaborative artifact access.
 * - Must be an active collaborator.
 * - Restricted artifacts require ACL grant (owners/co-investigators of owning org excepted for read).
 * - Never grants underlying restricted dataset access.
 * - Cross-org private bleed denied; composes with PR1 tenant isolation when org store provided.
 */
export function decideCollaborativeArtifactAccess(input: {
  collab: CollaborativeInvestigation;
  actor: CollaborationActor;
  artifactId: string;
  grant: ArtifactShareGrant;
  organisation?: ResearchOrganisation | null;
  /** When true, also require PR1 tenant check against artifact owning org. */
  enforceTenantIsolation?: boolean;
}): CollaborativeArtifactAccessDecision {
  const {collab, actor, artifactId, grant} = input;
  const base = {
    collaborationId: collab.collaborationId,
    artifactId,
    grant,
  };

  if (!actor.authenticated || !PRINCIPAL_RE.test(actor.principalId)) {
    return {...base, allowed: false, reason: "unauthenticated"};
  }
  if (collab.lifecycle === "archived") {
    return {...base, allowed: false, reason: "collaboration_archived"};
  }

  const artifact = collab.versionedArtifacts.find((a) => a.artifactId === artifactId);
  if (!artifact) {
    return {...base, allowed: false, reason: "artifact_acl_denied"};
  }
  if (artifact.grantsUnderlyingDatasetAccess !== false) {
    return {...base, allowed: false, reason: "restricted_dataset_access_denied"};
  }

  const member = collab.collaborators.find(
    (c) => c.principalId === actor.principalId && c.active && c.revokedAt === null,
  );
  if (!member) {
    return {...base, allowed: false, reason: "not_a_collaborator"};
  }

  if (
    grant === "request_scientific_review" &&
    actor.actorKind !== "human" &&
    member.role === "independent_reviewer"
  ) {
    return {...base, allowed: false, reason: "ai_cannot_independent_review"};
  }

  // Cross-org: collaborator may only touch artifacts from participating orgs;
  // org_private / licensed_partner still need ACL or owning-org elevated role.
  if (!collab.participatingOrgIds.includes(artifact.owningOrgId)) {
    return {...base, allowed: false, reason: "cross_org_denied"};
  }

  if (input.enforceTenantIsolation) {
    try {
      assertSameTenant(member.orgId, artifact.owningOrgId);
    } catch {
      // Cross-org collaboration is allowed only via explicit ACL on shared artifacts —
      // never via tenant bypass for restricted datasets.
      if (
        artifact.dataClass === "org_private" ||
        artifact.dataClass === "licensed_partner"
      ) {
        const acl = collab.artifactAcls.find(
          (a) =>
            a.artifactId === artifactId &&
            a.principalId === actor.principalId &&
            a.revokedAt === null &&
            a.grants.includes(grant),
        );
        if (!acl) {
          return {...base, allowed: false, reason: "cross_org_denied"};
        }
        // Explicit share of the *artifact* still must not open the underlying dataset.
        // Tenant check on a synthetic dataset ref must fail-closed when asked.
        if (input.organisation) {
          const datasetRef: TenantScopedArtifactRef = {
            artifactId: `${artifact.artifactId}::underlying-dataset`,
            owningOrgId: artifact.owningOrgId,
            teamId: null,
            dataClass: artifact.dataClass,
          };
          const tenant = decideTenantArtifactAccess({
            actor,
            organisation: input.organisation,
            artifact: datasetRef,
            permission: "read",
          });
          // Collaboration share does not flip tenant dataset access to allowed for non-members.
          if (
            !tenant.allowed &&
            member.orgId !== artifact.owningOrgId &&
            grant !== "read" &&
            grant !== "comment" &&
            grant !== "propose_revision"
          ) {
            return {...base, allowed: false, reason: "tenant_isolation_denied"};
          }
        }
        return {...base, allowed: true, reason: "allowed"};
      }
      // Public / synthetic may cross-org via collaboration ACL or elevated roles below.
    }
  }

  if (member.role === "owner") {
    return {...base, allowed: true, reason: "allowed"};
  }

  if (
    (member.role === "co_investigator" || member.role === "contributor") &&
    member.orgId === artifact.owningOrgId &&
    (grant === "read" || grant === "comment" || grant === "propose_revision")
  ) {
    return {...base, allowed: true, reason: "allowed"};
  }

  if (
    artifact.dataClass === "public_biomedical" ||
    artifact.dataClass === "synthetic_demo"
  ) {
    if (grant === "read" || grant === "comment") {
      return {...base, allowed: true, reason: "allowed"};
    }
  }

  const acl = collab.artifactAcls.find(
    (a) =>
      a.artifactId === artifactId &&
      a.principalId === actor.principalId &&
      a.revokedAt === null &&
      a.grants.includes(grant),
  );
  if (!acl) {
    return {...base, allowed: false, reason: "artifact_acl_denied"};
  }
  return {...base, allowed: true, reason: "allowed"};
}

/**
 * Explicit deny: collaboration membership must never open restricted datasets.
 */
export function denyRestrictedDatasetAccessViaCollaborationShare(): CollaborativeArtifactAccessDecision {
  return {
    allowed: false,
    reason: "restricted_dataset_access_denied",
    collaborationId: null,
    artifactId: null,
    grant: null,
  };
}

export function createMemoryCollaborativeInvestigationStore(): CollaborativeInvestigationStore & {
  byId: Map<string, CollaborativeInvestigation>;
} {
  const byId = new Map<string, CollaborativeInvestigation>();
  return {
    byId,
    upsert(collab) {
      const validated = validateCollaborativeInvestigation(collab);
      byId.set(validated.collaborationId, validated);
      return validated;
    },
    get(collaborationId) {
      return byId.get(collaborationId) ?? null;
    },
    getByInvestigationId(investigationId) {
      for (const c of byId.values()) {
        if (c.investigationId === investigationId) return c;
      }
      return null;
    },
    list() {
      return [...byId.values()];
    },
  };
}

export function projectCollaborativeInvestigationPersistenceLines(
  collab: CollaborativeInvestigation,
): string[] {
  const validated = validateCollaborativeInvestigation(collab);
  return [
    `schema=${validated.schema}`,
    `method=${validated.method}`,
    `version=${validated.version}`,
    `collaborationId=${validated.collaborationId}`,
    `investigationId=${validated.investigationId}`,
    `ownerOrgId=${validated.ownerOrgId}`,
    `lifecycle=${validated.lifecycle}`,
    `collaborators=${validated.collaborators.filter((c) => c.active).length}`,
    `participatingOrgs=${validated.participatingOrgIds.length}`,
    `artifacts=${validated.versionedArtifacts.length}`,
    `sharingGrantsDatasetAccess=false`,
    `fullContributionModel=false`,
    `federatedQuery=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintCollaborativeInvestigation(
  collab: CollaborativeInvestigation,
): string {
  const validated = validateCollaborativeInvestigation(collab);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildCollaborativeInvestigationPack(input: {
  collaborations: readonly CollaborativeInvestigation[];
  asOf: string;
}): {
  schema: typeof COLLABORATIVE_INVESTIGATION_SCHEMA;
  method: typeof COLLABORATIVE_INVESTIGATION_METHOD;
  version: typeof COLLABORATIVE_INVESTIGATION_VERSION;
  asOf: string;
  collaborationCount: number;
  honesty: CollaborationHonesty;
  collaborations: readonly CollaborativeInvestigation[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const collaborations = input.collaborations.map(validateCollaborativeInvestigation);
  return {
    schema: COLLABORATIVE_INVESTIGATION_SCHEMA,
    method: COLLABORATIVE_INVESTIGATION_METHOD,
    version: COLLABORATIVE_INVESTIGATION_VERSION,
    asOf: input.asOf,
    collaborationCount: collaborations.length,
    honesty: {...DEFAULT_HONESTY},
    collaborations,
  };
}
