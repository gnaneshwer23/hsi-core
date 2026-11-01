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

  const sql = new SQL(resolved.databaseUrl);
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
