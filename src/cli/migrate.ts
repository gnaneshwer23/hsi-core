#!/usr/bin/env bun
/**
 * Apply HSI SQL migrations to red-wave Neon only.
 * Usage:
 *   bun run db:migrate
 *   bun run db:migrate -- --from-neonctl
 */
import { applyHsiMigrations } from "../db/migrate";

const fromNeonctl = process.argv.includes("--from-neonctl");

try {
  const result = await applyHsiMigrations({ fromNeonctl });
  console.log(
    JSON.stringify(
      {
        ok: true,
        applied: result.applied,
        skipped: result.skipped,
        host: result.host,
        databaseUrl: result.databaseUrlMasked,
        source: result.source,
      },
      null,
      2,
    ),
  );
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(JSON.stringify({ ok: false, error: message }, null, 2));
  process.exit(1);
}
