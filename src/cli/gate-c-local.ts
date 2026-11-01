#!/usr/bin/env bun
/**
 * Upsert pack seeds + Gate C checklist into HSI Neon (never auto-approve).
 * Usage:
 *   bun run db:gate-c-local
 *   bun run db:gate-c-local -- --from-neonctl
 *
 * Requires migrations applied first (`bun run db:migrate`).
 * Seeds all pack-derived claims/edges/markers (RA + SSc/gut/neuro), then
 * pending Gate C rows for mapped REL only.
 */
import { syncGateCChecklistToHsiNeon } from "../db/gateCLocal";

const fromNeonctl = process.argv.includes("--from-neonctl");

try {
  const result = await syncGateCChecklistToHsiNeon({ fromNeonctl });
  console.log(
    JSON.stringify(
      {
        ok: true,
        seedClaimsUpserted: result.seedClaimsUpserted,
        seedEdgesUpserted: result.seedEdgesUpserted,
        markersUpserted: result.markersUpserted,
        upserted: result.upserted,
        skippedUnmapped: result.skippedUnmapped,
        host: result.host,
        databaseUrl: result.databaseUrlMasked,
        source: result.source,
        autoApprove: result.autoApprove,
        note: "Pack seeds synced; Gate C rows stay pending until a human sets human_approved|human_rejected|deferred in HSI Neon. ISI autumn-snow approve remains separate. Intentional gap: Gate C review count tracks mapped REL only (~13), not full edge density.",
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
