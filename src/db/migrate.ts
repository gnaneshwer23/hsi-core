/**
 * Apply HSI-owned SQL migrations to red-wave Neon only.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { SQL } from "bun";
import {
  assertHsiNeonDatabaseUrl,
  maskDatabaseUrl,
  type NeonUrlCheck,
} from "./neonGuard";
import { resolveDatabaseUrl, type ResolveDatabaseUrlOptions } from "./resolveDatabaseUrl";

export type MigrateResult = {
  ok: true;
  applied: string[];
  skipped: string[];
  host: string;
  databaseUrlMasked: string;
  source: "env" | "neonctl";
};

export type MigrateOptions = ResolveDatabaseUrlOptions & {
  migrationsDir?: string;
};

function listMigrationFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

/**
 * Renamed files that must not be applied again when the old ledger id is present.
 * 019 replaces the duplicate 012_isi_research_review prefix.
 */
export const MIGRATION_LEDGER_ALIASES: Record<string, readonly string[]> = {
  "019_hsi_isi_research_review": ["012_isi_research_review"],
};

/**
 * Committed migrations that must not run until an explicit security review.
 * 022 and 023 are committed but held. They are not applied to any database
 * by a normal migrate until the owner removes these ids after review.
 */
export const HELD_MIGRATION_IDS = [
  "022_hsi_scientific_investigation_records",
  "023_hsi_researcher_workspace_community",
  "024_hsi_scientific_contradiction_ledger",
  "025_hsi_contradiction_tenant_isolation",
  "026_hsi_contradiction_review_integrity",
  "027_hsi_contradiction_authenticated_procedures",
  "028_hsi_contradiction_restricted_api",
] as const;

export function migrationAlreadyRecorded(id: string, recorded: readonly string[]): boolean {
  if (recorded.includes(id)) return true;
  const aliases = MIGRATION_LEDGER_ALIASES[id] ?? [];
  return aliases.some((alias) => recorded.includes(alias));
}

export async function applyHsiMigrations(opts?: MigrateOptions): Promise<MigrateResult> {
  const cwd = resolve(opts?.cwd ?? process.cwd());
  const migrationsDir = resolve(opts?.migrationsDir ?? join(cwd, "db", "migrations"));
  const resolved = resolveDatabaseUrl(opts);
  const check: NeonUrlCheck = assertHsiNeonDatabaseUrl(resolved.databaseUrl, {
    neonProjectId: resolved.neonProjectId,
  });
  if (!check.ok) {
    throw new Error(`Refusing migrate: ${check.reason}`);
  }

  const sql = new SQL(resolved.databaseUrl, { tls: { rejectUnauthorized: true }, connectionTimeout: 10 });
  const applied: string[] = [];
  const skipped: string[] = [];

  try {
    // Ensure ledger exists even before first file (files also create it).
    await sql`
      CREATE TABLE IF NOT EXISTS hsi_schema_migrations (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now(),
        notes text
      )
    `;

    const files = listMigrationFiles(migrationsDir);
    if (files.length === 0) {
      throw new Error(`No .sql migrations in ${migrationsDir}`);
    }

    const recordedRows = await sql`SELECT id FROM hsi_schema_migrations`;
    const recorded = (Array.isArray(recordedRows) ? recordedRows : []).map((row) => String(row.id));

    for (const file of files) {
      const id = file.replace(/\.sql$/i, "");
      if ((HELD_MIGRATION_IDS as readonly string[]).includes(id)) {
        skipped.push(id);
        continue;
      }
      if (migrationAlreadyRecorded(id, recorded)) {
        skipped.push(id);
        continue;
      }

      // Migration 003 tightens constraints on existing review rows. Never apply
      // blindly: pre-existing unbackfilled records must be remediated manually.
      if (id === "003_hsi_scientific_review_guardrails") {
        const preflight = await sql`
          SELECT count(*)::int AS invalid_count
          FROM hsi_evidence_review_decisions
          WHERE length(trim(rationale)) < 30
             OR decision = 'revoke'
        `;
        if (Number(preflight[0]?.invalid_count ?? 0) > 0) {
          throw new Error("Migration 003 preflight blocked: legacy review rows require human-led reconciliation");
        }
        const legacy = await sql`SELECT count(*)::int AS row_count FROM hsi_evidence_review_decisions`;
        if (Number(legacy[0]?.row_count ?? 0) > 0) {
          throw new Error("Migration 003 preflight blocked: existing reviews lack verified evidence/COI backfill");
        }
      }
      const body = readFileSync(join(migrationsDir, file), "utf8");
      await sql.unsafe(body);
      await sql`
        INSERT INTO hsi_schema_migrations (id, notes)
        VALUES (${id}, ${"hsi-core Stage 1 substrate"})
        ON CONFLICT (id) DO NOTHING
      `;
      applied.push(id);
      recorded.push(id);
    }
  } finally {
    await sql.close();
  }

  return {
    ok: true,
    applied,
    skipped,
    host: check.host,
    databaseUrlMasked: maskDatabaseUrl(resolved.databaseUrl),
    source: resolved.source,
  };
}
