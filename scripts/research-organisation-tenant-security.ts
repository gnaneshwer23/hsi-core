/**
 * Milestone 9 / PR1 — research organisation + tenant security pack check.
 * Offline contracts only — does not invent partnerships or Neon org tables.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  buildResearchOrganisationTenantPack,
  draftOrgMembership,
  draftResearchOrganisation,
  draftResearchTeam,
  projectOrganisationPersistenceLines,
  RESEARCH_ORG_TENANT_METHOD,
  RESEARCH_ORG_TENANT_SCHEMA,
  RESEARCH_ORG_TENANT_VERSION,
} from "../src/researchOrganisationTenantSecurity";

const asOf = "2026-11-09T12:00:00.000Z";
const outDir = "evaluation/research-organisation-tenant";

function fixtureOrg() {
  const orgId = "hsi-org-fixture-demo";
  return draftResearchOrganisation({
    id: orgId,
    name: "HSI Fixture Research Org",
    type: "independent_lab",
    createdAt: asOf,
    lifecycle: "draft",
    domains: ["fixture.example.invalid"],
    membership: [
      draftOrgMembership({
        membershipId: "hsi-org-member-fixture-admin",
        orgId,
        principalId: "fixture-principal-admin",
        roles: ["org_admin"],
        grantedAt: asOf,
      }),
      draftOrgMembership({
        membershipId: "hsi-org-member-fixture-reviewer",
        orgId,
        principalId: "fixture-principal-reviewer",
        roles: ["independent_reviewer"],
        grantedAt: asOf,
      }),
    ],
    teams: [
      draftResearchTeam({
        teamId: "hsi-team-fixture",
        orgId,
        name: "Fixture team",
        memberPrincipalIds: ["fixture-principal-admin"],
      }),
    ],
    dataSharingPolicyRefs: [
      {
        policyId: "dsp-fixture-public",
        legalBinding: false,
        summary: "Fixture policy — not a live MoU",
      },
    ],
    approvedIntegrations: [
      {
        integrationId: "fixture-public-adapter",
        kind: "public_biomedical_adapter",
        realInstitutionalPartnershipClaimed: false,
      },
    ],
  });
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const org = fixtureOrg();
  const pack = buildResearchOrganisationTenantPack({
    organisations: [org],
    asOf,
  });
  const status = {
    schema: RESEARCH_ORG_TENANT_SCHEMA,
    method: RESEARCH_ORG_TENANT_METHOD,
    version: RESEARCH_ORG_TENANT_VERSION,
    asOf,
    organisationCount: pack.organisationCount,
    migration: "deferred",
    neon: "red-wave-only",
    honesty: pack.honesty,
    persistenceLines: projectOrganisationPersistenceLines(org),
  };

  if (!checkOnly) {
    mkdirSync(outDir, {recursive: true});
    writeFileSync(join(outDir, "STATUS.json"), `${JSON.stringify(status, null, 2)}\n`);
    writeFileSync(
      join(outDir, "organisation-pack.v1.json"),
      `${JSON.stringify(pack, null, 2)}\n`,
    );
  }

  if (pack.honesty.realInstitutionalPartnershipClaimed) {
    throw Error("Partnership claim must stay false");
  }
  if (pack.honesty.patientLevelFederatedRetrieval) {
    throw Error("Patient federated retrieval must stay false");
  }
  console.log(
    checkOnly
      ? `research-organisation-tenant-security check ok (${pack.organisationCount} orgs)`
      : `wrote ${outDir} (${pack.organisationCount} orgs)`,
  );
}

main();
