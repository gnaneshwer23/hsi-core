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

    for (const file of files) {
      const id = file.replace(/\.sql$/i, "");
      const existing = await sql`
        SELECT id FROM hsi_schema_migrations WHERE id = ${id} LIMIT 1
      `;
      if (Array.isArray(existing) && existing.length > 0) {
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
