/**
 * Milestone 9 PR1 — research organisation / tenant security honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  assertSameTenant,
  buildResearchOrganisationTenantPack,
  createMemoryResearchOrganisationStore,
  decideTenantArtifactAccess,
  denyPatientLevelFederatedRetrieval,
  draftOrgMembership,
  draftResearchOrganisation,
  draftResearchTeam,
  fingerprintResearchOrganisation,
  projectOrganisationPersistenceLines,
  suggestOrgRolesFromExistingGrants,
  validateResearchOrganisation,
  type CollaborationActor,
  type ResearchOrganisation,
  type TenantScopedArtifactRef,
} from "../src/researchOrganisationTenantSecurity";

const asOf = "2026-11-09T12:00:00.000Z";

function seedOrg(overrides?: {
  membership?: ResearchOrganisation["membership"];
  lifecycle?: ResearchOrganisation["lifecycle"];
  teams?: ResearchOrganisation["teams"];
}): ResearchOrganisation {
  const orgId = "hsi-org-alpha-lab";
  const membership =
    overrides?.membership ??
    [
      draftOrgMembership({
        membershipId: "hsi-org-member-alice-admin",
        orgId,
        principalId: "principal-alice",
        roles: ["org_admin"],
        grantedAt: asOf,
      }),
      draftOrgMembership({
        membershipId: "hsi-org-member-bob-pi",
        orgId,
        principalId: "principal-bob",
        roles: ["principal_investigator"],
        grantedAt: asOf,
      }),
      draftOrgMembership({
        membershipId: "hsi-org-member-cara-contrib",
        orgId,
        principalId: "principal-cara",
        roles: ["contributor"],
        grantedAt: asOf,
        teamIds: ["hsi-team-ssc"],
      }),
      draftOrgMembership({
        membershipId: "hsi-org-member-dan-reviewer",
        orgId,
        principalId: "principal-dan",
        roles: ["independent_reviewer"],
        grantedAt: asOf,
      }),
      draftOrgMembership({
        membershipId: "hsi-org-member-erin-steward",
        orgId,
        principalId: "principal-erin",
        roles: ["data_steward"],
        grantedAt: asOf,
      }),
      draftOrgMembership({
        membershipId: "hsi-org-member-fran-observer",
        orgId,
        principalId: "principal-fran",
        roles: ["observer"],
        grantedAt: asOf,
      }),
    ];
  return draftResearchOrganisation({
    id: orgId,
    name: "Alpha Immunology Lab",
    type: "university",
    createdAt: asOf,
    lifecycle: overrides?.lifecycle ?? "active",
    domains: ["alpha-lab.example.invalid"],
    domainVerificationStatus: "placeholder_unverified",
    governanceContacts: [
      {
        role: "scientific_governance",
        label: "Governance desk",
        contactRef: null,
      },
    ],
    dataSharingPolicyRefs: [
      {
        policyId: "dsp-alpha-public-only",
        legalBinding: false,
        summary: "Public biomedical share only; no patient federation",
      },
    ],
    approvedIntegrations: [
      {
        integrationId: "europe-pmc-public",
        kind: "public_biomedical_adapter",
        realInstitutionalPartnershipClaimed: false,
      },
    ],
    teams:
      overrides?.teams ??
      [
        draftResearchTeam({
          teamId: "hsi-team-ssc",
          orgId,
          name: "SSc evidence team",
          memberPrincipalIds: ["principal-cara"],
        }),
      ],
    membership,
  });
}

function actor(
  principalId: string,
  opts?: Partial<CollaborationActor>,
): CollaborationActor {
  return {
    principalId,
    authenticated: true,
    actorKind: "human",
    existingResearchRoles: [],
    platformRoles: [],
    ...opts,
  };
}

function artifact(
  owningOrgId: string,
  opts?: Partial<TenantScopedArtifactRef>,
): TenantScopedArtifactRef {
  return {
    artifactId: "hsi-inv-collab-demo-1",
    owningOrgId,
    teamId: null,
    dataClass: "org_private",
    ...opts,
  };
}

describe("research organisation tenant security (M9 PR1)", () => {
  test("drafts org metadata contract with closed roles and honesty gates", () => {
    const org = seedOrg();
    expect(org.schema).toBe("hsi-research-organisation-tenant-1");
    expect(org.verifiedDomainConfig.verificationStatus).toBe(
      "placeholder_unverified",
    );
    expect(org.verifiedDomainConfig.mouInvented).toBe(false);
    expect(org.honesty.federationDoesNotImplyCentralOwnership).toBe(true);
    expect(org.honesty.aiCannotActAsIndependentHumanReviewer).toBe(true);
    expect(org.honesty.patientLevelFederatedRetrieval).toBe(false);
    expect(org.honesty.realInstitutionalPartnershipClaimed).toBe(false);
    expect(org.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(org.membership.map((m) => m.roles[0])).toEqual([
      "org_admin",
      "principal_investigator",
      "contributor",
      "independent_reviewer",
      "data_steward",
      "observer",
    ]);
    validateResearchOrganisation(org);
    expect(fingerprintResearchOrganisation(org)).toMatch(/^[a-f0-9]{64}$/);
  });

  test("bridges existing research grants without inventing platform admin", () => {
    expect(suggestOrgRolesFromExistingGrants(["research_admin"])).toEqual([
      "org_admin",
    ]);
    expect(suggestOrgRolesFromExistingGrants(["researcher"])).toEqual([
      "contributor",
    ]);
    expect(suggestOrgRolesFromExistingGrants(["scientific_reviewer"])).toEqual([
      "independent_reviewer",
    ]);
    expect(
      suggestOrgRolesFromExistingGrants([
        "researcher",
        "scientific_reviewer",
      ]),
    ).toEqual(["contributor", "independent_reviewer"]);
  });

  test("denies cross-tenant private artifact access", () => {
    const alpha = seedOrg();
    const beta = draftResearchOrganisation({
      id: "hsi-org-beta-lab",
      name: "Beta Lab",
      type: "biotech",
      createdAt: asOf,
      lifecycle: "active",
      membership: [
        draftOrgMembership({
          membershipId: "hsi-org-member-zoe-admin",
          orgId: "hsi-org-beta-lab",
          principalId: "principal-zoe",
          roles: ["org_admin"],
          grantedAt: asOf,
        }),
      ],
    });
    const store = createMemoryResearchOrganisationStore();
    store.upsertOrganisation(alpha);
    store.upsertOrganisation(beta);

    const decision = decideTenantArtifactAccess({
      actor: actor("principal-zoe"),
      organisation: store.getOrganisation("hsi-org-alpha-lab"),
      artifact: artifact("hsi-org-alpha-lab"),
      permission: "read",
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("not_a_member");

    expect(() => assertSameTenant("hsi-org-beta-lab", "hsi-org-alpha-lab")).toThrow(
      "cross_tenant_denied",
    );
  });

  test("denies privilege escalation from observer to write / administer", () => {
    const org = seedOrg();
    const write = decideTenantArtifactAccess({
      actor: actor("principal-fran"),
      organisation: org,
      artifact: artifact(org.id),
      permission: "write",
    });
    expect(write.allowed).toBe(false);
    expect(write.reason).toBe("role_insufficient");

    const admin = decideTenantArtifactAccess({
      actor: actor("principal-fran"),
      organisation: org,
      artifact: artifact(org.id),
      permission: "administer_org",
    });
    expect(admin.allowed).toBe(false);
    expect(admin.reason).toBe("role_insufficient");

    const review = decideTenantArtifactAccess({
      actor: actor("principal-fran"),
      organisation: org,
      artifact: artifact(org.id),
      permission: "perform_independent_review",
    });
    expect(review.allowed).toBe(false);
    expect(review.reason).toBe("role_insufficient");
  });

  test("allows contributor write in-tenant and independent reviewer review", () => {
    const org = seedOrg();
    const write = decideTenantArtifactAccess({
      actor: actor("principal-cara", {
        existingResearchRoles: ["researcher"],
      }),
      organisation: org,
      artifact: artifact(org.id, {teamId: "hsi-team-ssc"}),
      permission: "write",
    });
    expect(write.allowed).toBe(true);

    const review = decideTenantArtifactAccess({
      actor: actor("principal-dan", {
        existingResearchRoles: ["scientific_reviewer"],
      }),
      organisation: org,
      artifact: artifact(org.id),
      permission: "perform_independent_review",
    });
    expect(review.allowed).toBe(true);
  });

  test("AI agent cannot hold or exercise independent reviewer authority", () => {
    expect(() =>
      draftOrgMembership({
        membershipId: "hsi-org-member-bot-reviewer",
        orgId: "hsi-org-alpha-lab",
        principalId: "agent-bot-1",
        roles: ["independent_reviewer"],
        grantedAt: asOf,
        actorKind: "ai_agent",
      }),
    ).toThrow("AI/service cannot hold independent_reviewer");

    const org = seedOrg({
      membership: [
        draftOrgMembership({
          membershipId: "hsi-org-member-bot-contrib",
          orgId: "hsi-org-alpha-lab",
          principalId: "agent-bot-1",
          roles: ["contributor"],
          grantedAt: asOf,
          actorKind: "ai_agent",
        }),
      ],
    });
    const decision = decideTenantArtifactAccess({
      actor: actor("agent-bot-1", {actorKind: "ai_agent"}),
      organisation: org,
      artifact: artifact(org.id),
      permission: "perform_independent_review",
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("ai_cannot_independent_review");
  });

  test("denies patient-level federated retrieval and unverified domain elevation", () => {
    expect(denyPatientLevelFederatedRetrieval()).toEqual({
      allowed: false,
      reason: "patient_federated_retrieval_denied",
      orgId: null,
      permission: null,
    });
    expect(() =>
      draftResearchOrganisation({
        id: "hsi-org-forged",
        name: "Forged",
        type: "other",
        createdAt: asOf,
        domainVerificationStatus: "verified",
      }),
    ).toThrow("Verified domain requires human gate");
  });

  test("thin memory store + persistence projection (no Neon migration)", () => {
    const org = seedOrg();
    const store = createMemoryResearchOrganisationStore();
    store.upsertOrganisation(org);
    expect(store.getOrganisation(org.id)?.name).toBe("Alpha Immunology Lab");
    expect(store.listOrganisations()).toHaveLength(1);
    const lines = projectOrganisationPersistenceLines(org);
    expect(lines).toContain("migration=deferred");
    expect(lines).toContain("neon=red-wave-only");
    expect(lines).toContain("federationCentralOwnership=false");
    const pack = buildResearchOrganisationTenantPack({
      organisations: [org],
      asOf,
    });
    expect(pack.organisationCount).toBe(1);
    expect(pack.honesty.socialNetworkProduct).toBe(false);
    expect(pack.honesty.separateApp).toBe(false);
    expect(pack.honesty.newGraphDb).toBe(false);
  });

  test("unauthenticated and cross-org id mismatch fail closed", () => {
    const org = seedOrg();
    const unauth = decideTenantArtifactAccess({
      actor: actor("principal-alice", {authenticated: false}),
      organisation: org,
      artifact: artifact(org.id),
      permission: "read",
    });
    expect(unauth.allowed).toBe(false);
    expect(unauth.reason).toBe("unauthenticated");

    const mismatch = decideTenantArtifactAccess({
      actor: actor("principal-alice"),
      organisation: org,
      artifact: artifact("hsi-org-other-lab"),
      permission: "read",
    });
    expect(mismatch.allowed).toBe(false);
    expect(mismatch.reason).toBe("cross_tenant_denied");
  });
});
