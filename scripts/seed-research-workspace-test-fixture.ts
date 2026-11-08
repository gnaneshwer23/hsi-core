#!/usr/bin/env bun
/**
 * Seed / remove a clearly marked SYNTHETIC research workspace fixture on HSI Neon.
 *
 * Usage:
 *   bun scripts/seed-research-workspace-test-fixture.ts --from-neonctl
 *   bun scripts/seed-research-workspace-test-fixture.ts --from-neonctl --branch staging
 *   bun scripts/seed-research-workspace-test-fixture.ts --from-neonctl --rollback
 *
 * Does NOT enable production writes, grant scientific reviewer, invent MoU,
 * flip Gate C auto-approve, or set legalBinding. Does NOT set
 * HSI_SSC_RESEARCH_RELEASE_ID on Vercel (live deployments must not bind this
 * test release for create-path).
 */
import {spawnSync} from "node:child_process";
import {SQL} from "bun";
import {
  assertHsiNeonDatabaseUrl,
  HSI_NEON_BRANCH_ID,
  HSI_NEON_DATABASE,
  HSI_NEON_PROJECT_ID,
  HSI_STAGING_BRANCH_ID,
  maskDatabaseUrl,
} from "../src/db/neonGuard";
import {resolveDatabaseUrl} from "../src/db/resolveDatabaseUrl";
import {
  buildResearchWorkspaceTestInvestigation,
  RESEARCH_WORKSPACE_TEST_FIXTURE,
} from "../src/researchWorkspaceTestFixture";

const fromNeonctl = process.argv.includes("--from-neonctl");
const rollback = process.argv.includes("--rollback");
const branchArg = process.argv.includes("--branch")
  ? process.argv[process.argv.indexOf("--branch") + 1]
  : "production";
const principalArg = process.argv.includes("--principal")
  ? process.argv[process.argv.indexOf("--principal") + 1]
  : RESEARCH_WORKSPACE_TEST_FIXTURE.defaultPrincipalId;

function fetchBranchUrl(branchId: string): string {
  const result = spawnSync(
    "npx",
    [
      "--yes",
      "neonctl",
      "connection-string",
      `--project-id=${HSI_NEON_PROJECT_ID}`,
      `--branch-id=${branchId}`,
      `--database-name=${HSI_NEON_DATABASE}`,
      "--role-name=neondb_owner",
    ],
    {encoding: "utf8", env: process.env},
  );
  if (result.status !== 0) {
    throw new Error("neonctl connection-string failed for branch " + branchId);
  }
  const url = (result.stdout || "").trim().split("\n").filter(Boolean).at(-1);
  if (!url?.startsWith("postgres")) throw new Error("neonctl did not return a postgres URL");
  return url;
}

function resolveUrl(): {databaseUrl: string; source: string; branchId: string} {
  if (branchArg === "staging") {
    if (!fromNeonctl) throw new Error("Staging seed requires --from-neonctl");
    return {
      databaseUrl: fetchBranchUrl(HSI_STAGING_BRANCH_ID),
      source: "neonctl-staging",
      branchId: HSI_STAGING_BRANCH_ID,
    };
  }
  if (branchArg !== "production") {
    throw new Error("Supported --branch values: production | staging");
  }
  if (fromNeonctl) {
    return {
      databaseUrl: fetchBranchUrl(HSI_NEON_BRANCH_ID),
      source: "neonctl-production",
      branchId: HSI_NEON_BRANCH_ID,
    };
  }
  const resolved = resolveDatabaseUrl({fromNeonctl: false});
  return {databaseUrl: resolved.databaseUrl, source: resolved.source, branchId: HSI_NEON_BRANCH_ID};
}

async function main(): Promise<void> {
  const resolved = resolveUrl();
  const guard = assertHsiNeonDatabaseUrl(resolved.databaseUrl, {neonProjectId: HSI_NEON_PROJECT_ID});
  if (!guard.ok) throw new Error("Refusing seed: " + guard.reason);

  const principalId = String(principalArg || "").trim();
  if (!principalId) throw new Error("--principal required");

  const sql = new SQL(resolved.databaseUrl, {tls: {rejectUnauthorized: true}, connectionTimeout: 15});
  try {
    if (rollback) {
      await sql.begin(async (tx) => {
        await tx`DELETE FROM hsi_interrogative_investigations WHERE id=${RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId}`;
        await tx`DELETE FROM hsi_evidence_graph_releases WHERE id=${RESEARCH_WORKSPACE_TEST_FIXTURE.releaseId}`;
      });
      console.log(
        JSON.stringify(
          {
            ok: true,
            action: "rollback",
            host: guard.host,
            branchId: resolved.branchId,
            databaseUrl: maskDatabaseUrl(resolved.databaseUrl),
            removedReleaseId: RESEARCH_WORKSPACE_TEST_FIXTURE.releaseId,
            removedInvestigationId: RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId,
          },
          null,
          2,
        ),
      );
      return;
    }

    const access = await sql`
      SELECT principal_id, access_role, revoked_at
      FROM hsi_research_access
      WHERE principal_id=${principalId}
      LIMIT 1
    `;
    if (!access.length || access[0]?.revoked_at) {
      throw new Error("Active researcher grant required for principal before seeding");
    }
    if (!["researcher", "research_admin"].includes(String(access[0]?.access_role))) {
      throw new Error("Principal lacks researcher access_role");
    }

    const {investigation, contentHash, manifestHash} = buildResearchWorkspaceTestInvestigation({
      principalId,
    });

    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO hsi_evidence_graph_releases (
          id, release_version, manifest_hash, state, created_by, created_at, published_at
        ) VALUES (
          ${RESEARCH_WORKSPACE_TEST_FIXTURE.releaseId},
          ${RESEARCH_WORKSPACE_TEST_FIXTURE.releaseVersion},
          ${manifestHash},
          'published',
          ${RESEARCH_WORKSPACE_TEST_FIXTURE.createdBy},
          ${RESEARCH_WORKSPACE_TEST_FIXTURE.createdAt}::timestamptz,
          ${RESEARCH_WORKSPACE_TEST_FIXTURE.createdAt}::timestamptz
        )
        ON CONFLICT (id) DO NOTHING
      `;

      const existing = await tx`
        SELECT content_hash, actor_principal
        FROM hsi_interrogative_investigations
        WHERE id=${investigation.id}
        LIMIT 1
      `;
      if (existing.length) {
        if (
          String(existing[0]?.content_hash) !== contentHash ||
          String(existing[0]?.actor_principal) !== principalId
        ) {
          throw new Error("Existing fixture investigation conflicts with expected synthetic payload");
        }
        return;
      }

      await tx`
        INSERT INTO hsi_interrogative_investigations (
          id, schema_version, actor_principal, release_id, release_manifest_hash,
          data_class, state, payload, content_hash, created_at
        ) VALUES (
          ${investigation.id},
          ${investigation.schemaVersion},
          ${principalId},
          ${investigation.release.id},
          ${investigation.release.manifestHash},
          ${investigation.dataClass},
          ${investigation.state},
          ${investigation},
          ${contentHash},
          ${investigation.createdAt}::timestamptz
        )
      `;
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          action: "seed",
          honesty: RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner,
          host: guard.host,
          branchId: resolved.branchId,
          source: resolved.source,
          databaseUrl: maskDatabaseUrl(resolved.databaseUrl),
          principalId,
          releaseId: RESEARCH_WORKSPACE_TEST_FIXTURE.releaseId,
          investigationId: RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId,
          scientificAcceptance: false,
          gateCAutoApprove: false,
          legalBinding: false,
          productionWritesEnabled: false,
          note:
            "Do not set HSI_SSC_RESEARCH_RELEASE_ID to this test release on www. Refresh /research/account to see the draft.",
        },
        null,
        2,
      ),
    );
  } finally {
    await sql.close();
  }
}

try {
  await main();
} catch (err) {
  console.error(JSON.stringify({ok: false, error: err instanceof Error ? err.message : String(err)}, null, 2));
  process.exit(1);
}
