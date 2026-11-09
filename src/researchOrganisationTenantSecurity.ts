/**
 * Milestone 9 / PR1 — Research Organisations and Tenant Security.
 *
 * Extends existing Neon Auth + `hsi_research_access` + `hsi_reviewer_authority`
 * + `researchAccount` contracts with organisation / team / membership roles and
 * fail-closed tenant isolation. Does NOT invent a social network, separate app,
 * new graph DB, federated query gateway, discovery UI, Gate C auto-approve,
 * MoU, PHI/CDS, real institutional partnerships, or unrestricted patient-level
 * federated retrieval.
 *
 * Persistence: validated contracts + thin in-memory store. No new Neon
 * migration in PR1 — existing grants remain authoritative for live auth.
 * Federation must NOT imply central ownership of institutional data.
 * AI / agent actors cannot act as independent human reviewers.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const RESEARCH_ORG_TENANT_SCHEMA =
  "hsi-research-organisation-tenant-1" as const;
export const RESEARCH_ORG_TENANT_METHOD =
  "hsi.research_organisation_tenant.v1" as const;
export const RESEARCH_ORG_TENANT_VERSION = "0.1.0" as const;

/** Closed organisation membership roles (tenant-scoped). */
export const ORG_MEMBERSHIP_ROLES = [
  "org_admin",
  "principal_investigator",
  "contributor",
  "independent_reviewer",
  "data_steward",
  "observer",
] as const;
export type OrgMembershipRole = (typeof ORG_MEMBERSHIP_ROLES)[number];

/** Platform-scoped role — not an org membership grant by itself. */
export const PLATFORM_ROLES = ["platform_admin"] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export type ResearchCollaborationRole = OrgMembershipRole | PlatformRole;

/** Existing HSI research grants (migrations 005 / 006) — bridge only. */
export const EXISTING_RESEARCH_ACCESS_ROLES = [
  "researcher",
  "research_admin",
  "scientific_reviewer",
] as const;
export type ExistingResearchAccessRole =
  (typeof EXISTING_RESEARCH_ACCESS_ROLES)[number];

export const RESEARCH_ORG_TYPES = [
  "university",
  "hospital_research",
  "biotech",
  "consortium",
  "independent_lab",
  "other",
] as const;
export type ResearchOrgType = (typeof RESEARCH_ORG_TYPES)[number];

export const RESEARCH_ORG_LIFECYCLES = [
  "draft",
  "active",
  "suspended",
  "archived",
] as const;
export type ResearchOrgLifecycle = (typeof RESEARCH_ORG_LIFECYCLES)[number];

export const DOMAIN_VERIFICATION_STATUSES = [
  "placeholder_unverified",
  "pending_human_verification",
  "verified",
  "revoked",
] as const;
export type DomainVerificationStatus =
  (typeof DOMAIN_VERIFICATION_STATUSES)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type CollaborationActorKind = (typeof ACTOR_KINDS)[number];

export const ARTIFACT_PERMISSIONS = [
  "read",
  "write",
  "share_within_org",
  "request_independent_review",
  "perform_independent_review",
  "administer_org",
  "steward_data_policy",
] as const;
export type ArtifactPermission = (typeof ARTIFACT_PERMISSIONS)[number];

const ORG_ID_RE = /^hsi-org-[a-z0-9-]{3,64}$/;
const TEAM_ID_RE = /^hsi-team-[a-z0-9-]{3,64}$/;
const MEMBERSHIP_ID_RE = /^hsi-org-member-[a-z0-9-]{3,80}$/;
const ARTIFACT_ID_RE = /^hsi-(inv|artifact|evidence)-[a-z0-9-]{3,100}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type VerifiedDomainConfigPlaceholder = {
  /** Domains claimed by the org — verification is placeholder unless human-gated. */
  domains: readonly string[];
  verificationStatus: DomainVerificationStatus;
  /** Never invent live DNS / MoU proof in PR1. */
  liveDnsProofPresent: false;
  mouInvented: false;
};

export type GovernanceContact = {
  role: "scientific_governance" | "data_protection" | "security" | "other";
  label: string;
  /** Contact handle placeholder — not a live directory claim. */
  contactRef: string | null;
};

export type DataSharingPolicyRef = {
  policyId: string;
  /** Reference only — does not create legal binding. */
  legalBinding: false;
  summary: string;
};

export type ApprovedIntegrationRef = {
  integrationId: string;
  kind: "public_biomedical_adapter" | "partner_export" | "internal_tool" | "other";
  /** Partnership honesty — fixtures ≠ live institutional agreement. */
  realInstitutionalPartnershipClaimed: false;
};

export type OrgAuditSettings = {
  retainMembershipChanges: true;
  retainCrossTenantDenials: true;
  /** Patient-level federated retrieval stays off. */
  patientLevelFederatedRetrieval: false;
};

export type OrgMembership = {
  membershipId: string;
  orgId: string;
  principalId: string;
  actorKind: CollaborationActorKind;
  roles: readonly OrgMembershipRole[];
  teamIds: readonly string[];
  active: boolean;
  grantedAt: string;
  revokedAt: string | null;
};

export type ResearchTeam = {
  teamId: string;
  orgId: string;
  name: string;
  memberPrincipalIds: readonly string[];
};

export type ResearchOrganisationHonesty = {
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
  newGraphDb: false;
  neonProjectPolicy: "red-wave-only";
};

export type ResearchOrganisation = {
  schema: typeof RESEARCH_ORG_TENANT_SCHEMA;
  method: typeof RESEARCH_ORG_TENANT_METHOD;
  version: typeof RESEARCH_ORG_TENANT_VERSION;
  id: string;
  name: string;
  type: ResearchOrgType;
  verifiedDomainConfig: VerifiedDomainConfigPlaceholder;
  membership: readonly OrgMembership[];
  teams: readonly ResearchTeam[];
  governanceContacts: readonly GovernanceContact[];
  dataSharingPolicyRefs: readonly DataSharingPolicyRef[];
  approvedIntegrations: readonly ApprovedIntegrationRef[];
  auditSettings: OrgAuditSettings;
  lifecycle: ResearchOrgLifecycle;
  createdAt: string;
  updatedAt: string;
  honesty: ResearchOrganisationHonesty;
};

export type TenantScopedArtifactRef = {
  artifactId: string;
  owningOrgId: string;
  /** Optional team scope inside the owning org. */
  teamId: string | null;
  dataClass: "public_biomedical" | "licensed_partner" | "org_private" | "synthetic_demo";
};

export type CollaborationActor = {
  principalId: string;
  authenticated: boolean;
  actorKind: CollaborationActorKind;
  /** Existing HSI research grants when known. */
  existingResearchRoles: readonly ExistingResearchAccessRole[];
  /** Platform roles — never inferred from client headers. */
  platformRoles: readonly PlatformRole[];
};

export type TenantAccessDecision = {
  allowed: boolean;
  reason:
    | "allowed"
    | "unauthenticated"
    | "org_not_found"
    | "org_not_active"
    | "not_a_member"
    | "membership_inactive"
    | "role_insufficient"
    | "cross_tenant_denied"
    | "ai_cannot_independent_review"
    | "patient_federated_retrieval_denied"
    | "platform_admin_required";
  orgId: string | null;
  permission: ArtifactPermission | null;
};

export type ResearchOrganisationStore = {
  upsertOrganisation(org: ResearchOrganisation): ResearchOrganisation;
  getOrganisation(orgId: string): ResearchOrganisation | null;
  listOrganisations(): readonly ResearchOrganisation[];
};

const DEFAULT_HONESTY: ResearchOrganisationHonesty = {
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
  newGraphDb: false,
  neonProjectPolicy: "red-wave-only",
};

const ROLE_PERMISSIONS: Record<OrgMembershipRole, readonly ArtifactPermission[]> = {
  org_admin: [
    "read",
    "write",
    "share_within_org",
    "request_independent_review",
    "administer_org",
    "steward_data_policy",
  ],
  principal_investigator: [
    "read",
    "write",
    "share_within_org",
    "request_independent_review",
  ],
  contributor: ["read", "write", "share_within_org", "request_independent_review"],
  independent_reviewer: ["read", "perform_independent_review"],
  data_steward: ["read", "share_within_org", "steward_data_policy"],
  observer: ["read"],
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

/** Bridge existing research grants into suggested org roles (non-authoritative). */
export function suggestOrgRolesFromExistingGrants(
  roles: readonly ExistingResearchAccessRole[],
): readonly OrgMembershipRole[] {
  const out = new Set<OrgMembershipRole>();
  for (const role of roles) {
    switch (role) {
      case "research_admin":
        out.add("org_admin");
        break;
      case "researcher":
        out.add("contributor");
        break;
      case "scientific_reviewer":
        out.add("independent_reviewer");
        break;
      default: {
        const _exhaustive: never = role;
        void _exhaustive;
        throw Error("Unhandled existing research role");
      }
    }
  }
  return [...out];
}

export function draftResearchOrganisation(input: {
  id: string;
  name: string;
  type: ResearchOrgType;
  createdAt: string;
  lifecycle?: ResearchOrgLifecycle;
  domains?: readonly string[];
  domainVerificationStatus?: DomainVerificationStatus;
  governanceContacts?: readonly GovernanceContact[];
  dataSharingPolicyRefs?: readonly DataSharingPolicyRef[];
  approvedIntegrations?: readonly ApprovedIntegrationRef[];
  teams?: readonly ResearchTeam[];
  membership?: readonly OrgMembership[];
}): ResearchOrganisation {
  if (!ORG_ID_RE.test(input.id)) throw Error("Invalid organisation id");
  if (!input.name.trim() || input.name.length > 200) throw Error("Invalid organisation name");
  assertClosed(input.type, RESEARCH_ORG_TYPES, "organisation type");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const lifecycle = input.lifecycle ?? "draft";
  assertClosed(lifecycle, RESEARCH_ORG_LIFECYCLES, "lifecycle");
  const verificationStatus =
    input.domainVerificationStatus ?? "placeholder_unverified";
  assertClosed(verificationStatus, DOMAIN_VERIFICATION_STATUSES, "domain verification");
  if (verificationStatus === "verified") {
    throw Error("Verified domain requires human gate — cannot invent in draft");
  }

  const org: ResearchOrganisation = {
    schema: RESEARCH_ORG_TENANT_SCHEMA,
    method: RESEARCH_ORG_TENANT_METHOD,
    version: RESEARCH_ORG_TENANT_VERSION,
    id: input.id,
    name: input.name.trim(),
    type: input.type,
    verifiedDomainConfig: {
      domains: [...(input.domains ?? [])],
      verificationStatus,
      liveDnsProofPresent: false,
      mouInvented: false,
    },
    membership: [...(input.membership ?? [])],
    teams: [...(input.teams ?? [])],
    governanceContacts: [...(input.governanceContacts ?? [])],
    dataSharingPolicyRefs: [...(input.dataSharingPolicyRefs ?? [])],
    approvedIntegrations: [...(input.approvedIntegrations ?? [])],
    auditSettings: {
      retainMembershipChanges: true,
      retainCrossTenantDenials: true,
      patientLevelFederatedRetrieval: false,
    },
    lifecycle,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    honesty: {...DEFAULT_HONESTY},
  };
  return validateResearchOrganisation(org);
}

export function draftOrgMembership(input: {
  membershipId: string;
  orgId: string;
  principalId: string;
  roles: readonly OrgMembershipRole[];
  grantedAt: string;
  actorKind?: CollaborationActorKind;
  teamIds?: readonly string[];
  active?: boolean;
}): OrgMembership {
  if (!MEMBERSHIP_ID_RE.test(input.membershipId)) throw Error("Invalid membership id");
  if (!ORG_ID_RE.test(input.orgId)) throw Error("Invalid organisation id");
  if (!PRINCIPAL_RE.test(input.principalId)) throw Error("Invalid principal id");
  if (!input.roles.length || input.roles.length > 6) throw Error("Invalid membership roles");
  const roles = [...new Set(input.roles)];
  for (const role of roles) assertClosed(role, ORG_MEMBERSHIP_ROLES, "membership role");
  const actorKind = input.actorKind ?? "human";
  assertClosed(actorKind, ACTOR_KINDS, "actor kind");
  if (actorKind !== "human" && roles.includes("independent_reviewer")) {
    throw Error("AI/service cannot hold independent_reviewer");
  }
  if (!isIsoTimestamp(input.grantedAt)) throw Error("Invalid grantedAt");
  for (const teamId of input.teamIds ?? []) {
    if (!TEAM_ID_RE.test(teamId)) throw Error("Invalid team id");
  }
  return {
    membershipId: input.membershipId,
    orgId: input.orgId,
    principalId: input.principalId,
    actorKind,
    roles,
    teamIds: [...(input.teamIds ?? [])],
    active: input.active ?? true,
    grantedAt: input.grantedAt,
    revokedAt: null,
  };
}

export function draftResearchTeam(input: {
  teamId: string;
  orgId: string;
  name: string;
  memberPrincipalIds?: readonly string[];
}): ResearchTeam {
  if (!TEAM_ID_RE.test(input.teamId)) throw Error("Invalid team id");
  if (!ORG_ID_RE.test(input.orgId)) throw Error("Invalid organisation id");
  if (!input.name.trim() || input.name.length > 120) throw Error("Invalid team name");
  for (const principalId of input.memberPrincipalIds ?? []) {
    if (!PRINCIPAL_RE.test(principalId)) throw Error("Invalid team member principal");
  }
  return {
    teamId: input.teamId,
    orgId: input.orgId,
    name: input.name.trim(),
    memberPrincipalIds: [...(input.memberPrincipalIds ?? [])],
  };
}

export function validateResearchOrganisation(
  org: ResearchOrganisation,
): ResearchOrganisation {
  if (org.schema !== RESEARCH_ORG_TENANT_SCHEMA) throw Error("Invalid org schema");
  if (org.method !== RESEARCH_ORG_TENANT_METHOD) throw Error("Invalid org method");
  if (org.version !== RESEARCH_ORG_TENANT_VERSION) throw Error("Invalid org version");
  if (!ORG_ID_RE.test(org.id)) throw Error("Invalid organisation id");
  if (!org.name.trim() || org.name.length > 200) throw Error("Invalid organisation name");
  assertClosed(org.type, RESEARCH_ORG_TYPES, "organisation type");
  assertClosed(org.lifecycle, RESEARCH_ORG_LIFECYCLES, "lifecycle");
  assertClosed(
    org.verifiedDomainConfig.verificationStatus,
    DOMAIN_VERIFICATION_STATUSES,
    "domain verification",
  );
  if (org.verifiedDomainConfig.liveDnsProofPresent !== false) {
    throw Error("DNS proof cannot be claimed without human gate");
  }
  if (org.verifiedDomainConfig.mouInvented !== false) throw Error("MoU must not be invented");
  if (org.honesty.federationDoesNotImplyCentralOwnership !== true) {
    throw Error("Federation ownership honesty required");
  }
  if (org.honesty.aiCannotActAsIndependentHumanReviewer !== true) {
    throw Error("AI reviewer honesty required");
  }
  if (org.honesty.patientLevelFederatedRetrieval !== false) {
    throw Error("Patient federated retrieval must stay denied");
  }
  if (org.honesty.realInstitutionalPartnershipClaimed !== false) {
    throw Error("Partnership claims forbidden in PR1");
  }
  if (org.honesty.neonProjectPolicy !== "red-wave-only") {
    throw Error("Neon red-wave only");
  }
  if (org.auditSettings.patientLevelFederatedRetrieval !== false) {
    throw Error("Audit settings must deny patient federated retrieval");
  }
  if (!isIsoTimestamp(org.createdAt) || !isIsoTimestamp(org.updatedAt)) {
    throw Error("Invalid org timestamps");
  }

  const membershipIds = new Set<string>();
  for (const member of org.membership) {
    if (member.orgId !== org.id) throw Error("Membership org mismatch");
    if (membershipIds.has(member.membershipId)) throw Error("Duplicate membership id");
    membershipIds.add(member.membershipId);
    if (!PRINCIPAL_RE.test(member.principalId)) throw Error("Invalid membership principal");
    assertClosed(member.actorKind, ACTOR_KINDS, "actor kind");
    if (
      member.actorKind !== "human" &&
      member.roles.includes("independent_reviewer")
    ) {
      throw Error("AI/service cannot hold independent_reviewer");
    }
    for (const role of member.roles) {
      assertClosed(role, ORG_MEMBERSHIP_ROLES, "membership role");
    }
  }

  const teamIds = new Set<string>();
  for (const team of org.teams) {
    if (team.orgId !== org.id) throw Error("Team org mismatch");
    if (teamIds.has(team.teamId)) throw Error("Duplicate team id");
    teamIds.add(team.teamId);
  }

  for (const integration of org.approvedIntegrations) {
    if (integration.realInstitutionalPartnershipClaimed !== false) {
      throw Error("Integration must not claim real partnership");
    }
  }
  for (const policy of org.dataSharingPolicyRefs) {
    if (policy.legalBinding !== false) throw Error("Policy must not invent legalBinding");
  }

  return org;
}

export function activeMembershipForPrincipal(
  org: ResearchOrganisation,
  principalId: string,
): OrgMembership | null {
  const matches = org.membership.filter(
    (m) => m.principalId === principalId && m.active && m.revokedAt === null,
  );
  if (matches.length === 0) return null;
  if (matches.length > 1) throw Error("Duplicate active membership for principal");
  return matches[0]!;
}

export function membershipGrantsPermission(
  membership: OrgMembership,
  permission: ArtifactPermission,
): boolean {
  return membership.roles.some((role) => ROLE_PERMISSIONS[role].includes(permission));
}

/**
 * Fail-closed tenant isolation + artifact permission check.
 * Cross-tenant access is always denied for org_private / licensed_partner.
 * Public biomedical may be read by authenticated actors without membership,
 * but never written or reviewed across tenants.
 */
export function decideTenantArtifactAccess(input: {
  actor: CollaborationActor;
  organisation: ResearchOrganisation | null;
  artifact: TenantScopedArtifactRef;
  permission: ArtifactPermission;
}): TenantAccessDecision {
  const {actor, organisation, artifact, permission} = input;
  const base = {
    orgId: artifact.owningOrgId,
    permission,
  };

  if (!actor.authenticated || !PRINCIPAL_RE.test(actor.principalId)) {
    return {...base, allowed: false, reason: "unauthenticated"};
  }

  if (permission === "perform_independent_review" && actor.actorKind !== "human") {
    return {...base, allowed: false, reason: "ai_cannot_independent_review"};
  }

  if (
    artifact.dataClass !== "public_biomedical" &&
    artifact.dataClass !== "synthetic_demo" &&
    organisation === null
  ) {
    return {...base, allowed: false, reason: "org_not_found"};
  }

  if (organisation && organisation.id !== artifact.owningOrgId) {
    return {...base, allowed: false, reason: "cross_tenant_denied"};
  }

  // Draft orgs: members may still stage; suspended/archived deny.
  if (
    organisation &&
    (organisation.lifecycle === "suspended" || organisation.lifecycle === "archived")
  ) {
    return {...base, allowed: false, reason: "org_not_active"};
  }

  // Platform admin may administer org lifecycle metadata when the org is known —
  // still cannot silently read org_private without membership (below).
  if (
    organisation &&
    permission === "administer_org" &&
    actor.platformRoles.includes("platform_admin")
  ) {
    return {...base, allowed: true, reason: "allowed"};
  }

  if (
    artifact.dataClass === "public_biomedical" &&
    permission === "read" &&
    (!organisation || organisation.id === artifact.owningOrgId)
  ) {
    // Public biomedical read is allowed for authenticated actors (no private bleed).
    return {...base, allowed: true, reason: "allowed"};
  }

  if (!organisation) {
    return {...base, allowed: false, reason: "org_not_found"};
  }

  if (organisation.id !== artifact.owningOrgId) {
    return {...base, allowed: false, reason: "cross_tenant_denied"};
  }

  const membership = activeMembershipForPrincipal(organisation, actor.principalId);
  if (!membership) {
    return {...base, allowed: false, reason: "not_a_member"};
  }
  if (!membership.active || membership.revokedAt !== null) {
    return {...base, allowed: false, reason: "membership_inactive"};
  }

  if (
    permission === "perform_independent_review" &&
    membership.actorKind !== "human"
  ) {
    return {...base, allowed: false, reason: "ai_cannot_independent_review"};
  }

  if (artifact.teamId) {
    const team = organisation.teams.find((t) => t.teamId === artifact.teamId);
    if (!team || team.orgId !== organisation.id) {
      return {...base, allowed: false, reason: "cross_tenant_denied"};
    }
    if (
      !membership.teamIds.includes(artifact.teamId) &&
      !membership.roles.includes("org_admin") &&
      !membership.roles.includes("data_steward")
    ) {
      return {...base, allowed: false, reason: "role_insufficient"};
    }
  }

  if (!membershipGrantsPermission(membership, permission)) {
    // Privilege escalation attempt (e.g. observer → write)
    return {...base, allowed: false, reason: "role_insufficient"};
  }

  return {...base, allowed: true, reason: "allowed"};
}

/** Explicit deny helper for cross-tenant attempts. */
export function assertSameTenant(
  actorOrgId: string | null | undefined,
  resourceOrgId: string,
): void {
  if (!actorOrgId || actorOrgId !== resourceOrgId) {
    throw Error("cross_tenant_denied");
  }
}

export function denyPatientLevelFederatedRetrieval(): TenantAccessDecision {
  return {
    allowed: false,
    reason: "patient_federated_retrieval_denied",
    orgId: null,
    permission: null,
  };
}

export function createMemoryResearchOrganisationStore(): ResearchOrganisationStore & {
  byId: Map<string, ResearchOrganisation>;
} {
  const byId = new Map<string, ResearchOrganisation>();
  return {
    byId,
    upsertOrganisation(org) {
      const validated = validateResearchOrganisation(org);
      byId.set(validated.id, validated);
      return validated;
    },
    getOrganisation(orgId) {
      return byId.get(orgId) ?? null;
    },
    listOrganisations() {
      return [...byId.values()];
    },
  };
}

export function projectOrganisationPersistenceLines(
  org: ResearchOrganisation,
): string[] {
  const validated = validateResearchOrganisation(org);
  return [
    `schema=${validated.schema}`,
    `method=${validated.method}`,
    `version=${validated.version}`,
    `orgId=${validated.id}`,
    `lifecycle=${validated.lifecycle}`,
    `members=${validated.membership.length}`,
    `teams=${validated.teams.length}`,
    `federationCentralOwnership=false`,
    `aiIndependentReviewer=false`,
    `patientFederatedRetrieval=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintResearchOrganisation(org: ResearchOrganisation): string {
  const validated = validateResearchOrganisation(org);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildResearchOrganisationTenantPack(input: {
  organisations: readonly ResearchOrganisation[];
  asOf: string;
}): {
  schema: typeof RESEARCH_ORG_TENANT_SCHEMA;
  method: typeof RESEARCH_ORG_TENANT_METHOD;
  version: typeof RESEARCH_ORG_TENANT_VERSION;
  asOf: string;
  organisationCount: number;
  honesty: ResearchOrganisationHonesty;
  organisations: readonly ResearchOrganisation[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const organisations = input.organisations.map(validateResearchOrganisation);
  return {
    schema: RESEARCH_ORG_TENANT_SCHEMA,
    method: RESEARCH_ORG_TENANT_METHOD,
    version: RESEARCH_ORG_TENANT_VERSION,
    asOf: input.asOf,
    organisationCount: organisations.length,
    honesty: {...DEFAULT_HONESTY},
    organisations,
  };
}
