/**
 * Milestone 9 / PR2 — collaborative investigation contracts pack check.
 * Offline contracts only — no federated query, Neon migration, or workbench UI.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  buildCollaborativeInvestigationPack,
  draftCollaborativeInvestigation,
  inviteCollaborator,
  acceptInvite,
  registerVersionedArtifact,
  shareSelectedArtifact,
  projectCollaborativeInvestigationPersistenceLines,
  COLLABORATIVE_INVESTIGATION_METHOD,
  COLLABORATIVE_INVESTIGATION_SCHEMA,
  COLLABORATIVE_INVESTIGATION_VERSION,
  type CollaborationHonesty,
} from "../src/collaborativeInvestigationContracts";
import {draftScientificInvestigation} from "../src/evidence/investigationOrchestrationContracts";
import type {CollaborationActor} from "../src/researchOrganisationTenantSecurity";

const asOf = "2026-11-09T14:00:00.000Z";
const outDir = "evaluation/collaborative-investigation";

const owner: CollaborationActor = {
  principalId: "fixture-principal-owner",
  authenticated: true,
  actorKind: "human",
  existingResearchRoles: ["researcher"],
  platformRoles: [],
};

const collaborator: CollaborationActor = {
  principalId: "fixture-principal-collab",
  authenticated: true,
  actorKind: "human",
  existingResearchRoles: ["researcher"],
  platformRoles: [],
};

function fixtureCollaboration() {
  const investigation = draftScientificInvestigation({
    investigationId: "hsi-inv-m9-collab-fixture",
    question: "Fixture collaborative investigation (fixtures ≠ live evidence).",
    domain: "ssc_tfh_il21",
    createdAt: asOf,
    authScope: {
      principalId: owner.principalId,
      authenticated: true,
      roles: ["researcher"],
      dataClass: "synthetic_demo",
    },
  });

  let collab = draftCollaborativeInvestigation({
    collaborationId: "hsi-collab-fixture-demo",
    investigation,
    ownerPrincipalId: owner.principalId,
    ownerOrgId: "hsi-org-fixture-demo",
    createdAt: asOf,
    scientificObjectives: [
      {
        id: "obj-fixture",
        text: "Fixture objective for collaborative contract pack.",
        ownerPrincipalId: owner.principalId,
        hypothesisId: null,
      },
    ],
  });

  collab = inviteCollaborator(collab, owner, {
    inviteId: "hsi-invite-fixture-collab",
    invitedPrincipalId: collaborator.principalId,
    invitedOrgId: "hsi-org-fixture-partner",
    proposedRole: "contributor",
    at: "2026-11-09T14:30:00.000Z",
  });
  collab = acceptInvite(collab, collaborator, {
    inviteId: "hsi-invite-fixture-collab",
    at: "2026-11-09T15:00:00.000Z",
  });
  collab = registerVersionedArtifact(collab, owner, {
    artifact: {
      artifactId: "hsi-artifact-fixture-brief",
      kind: "shared_brief",
      version: 1,
      owningOrgId: "hsi-org-fixture-demo",
      dataClass: "synthetic_demo",
      label: "Fixture shared brief",
    },
    at: "2026-11-09T15:30:00.000Z",
  });
  collab = shareSelectedArtifact(collab, owner, {
    artifactId: "hsi-artifact-fixture-brief",
    granteePrincipalId: collaborator.principalId,
    grants: ["read", "comment"],
    at: "2026-11-09T16:00:00.000Z",
  });
  return collab;
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const collab = fixtureCollaboration();
  const pack = buildCollaborativeInvestigationPack({
    collaborations: [collab],
    asOf,
  });
  const honesty: CollaborationHonesty = pack.honesty;
  const status = {
    schema: COLLABORATIVE_INVESTIGATION_SCHEMA,
    method: COLLABORATIVE_INVESTIGATION_METHOD,
    version: COLLABORATIVE_INVESTIGATION_VERSION,
    asOf,
    collaborationCount: pack.collaborationCount,
    migration: "deferred",
    neon: "red-wave-only",
    dependsOnPr: 99,
    honesty,
    persistenceLines: projectCollaborativeInvestigationPersistenceLines(collab),
  };

  if (!checkOnly) {
    mkdirSync(outDir, {recursive: true});
    writeFileSync(join(outDir, "STATUS.json"), `${JSON.stringify(status, null, 2)}\n`);
    writeFileSync(
      join(outDir, "collaboration-pack.v1.json"),
      `${JSON.stringify(pack, null, 2)}\n`,
    );
  }

  if (honesty.sharingDoesNotGrantRestrictedDatasetAccess !== true) {
    throw Error("Sharing must not grant restricted dataset access");
  }
  if (honesty.fullContributionModel) {
    throw Error("Full contribution model must stay false (PR3)");
  }
  if (honesty.federatedQueryImplemented || honesty.discoveryNetworkUi) {
    throw Error("Federation / discovery UI must stay false in PR2");
  }
  if (honesty.neonMigrationInThisPr) {
    throw Error("Neon migration must stay deferred");
  }
  console.log(
    checkOnly
      ? `collaborative-investigation-contracts check ok (${pack.collaborationCount} collabs)`
      : `wrote ${outDir} (${pack.collaborationCount} collabs)`,
  );
}

main();
