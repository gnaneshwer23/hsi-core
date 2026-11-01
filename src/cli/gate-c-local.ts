#!/usr/bin/env bun
/**
 * Upsert Gate C checklist into HSI Neon as human-pending rows (never auto-approve).
 * Usage:
 *   bun run db:gate-c-local
 *   bun run db:gate-c-local -- --from-neonctl
 *
 * Requires migrations applied first (`bun run db:migrate`).
 */
import { syncGateCChecklistToHsiNeon } from "../db/gateCLocal";

const fromNeonctl = process.argv.includes("--from-neonctl");

try {
  const result = await syncGateCChecklistToHsiNeon({ fromNeonctl });
  console.log(
    JSON.stringify(
      {
        ok: true,
        upserted: result.upserted,
        skippedUnmapped: result.skippedUnmapped,
        host: result.host,
        databaseUrl: result.databaseUrlMasked,
        source: result.source,
        autoApprove: result.autoApprove,
        note: "Rows stay pending until a human sets human_approved|human_rejected|deferred in HSI Neon. ISI autumn-snow approve remains separate.",
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
