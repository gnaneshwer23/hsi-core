# ADR-012 backfill plan: six investigation shapes into one store

**Status:** Written 28 November 2026, with ADR-012/013/014 accepted. Not executed. Migration `034_hsi_investigation_store` creates the new store and changes none of the older tables.

## Order of work

1. **Review.** The independent database review (Track B2) reads migration 034, the role file and the isolation suite.
2. **Rehearse.** Make a disposable Neon child branch of the HSI project only (see `docs/NEON_PROJECT_MAP.md`). Run `db/roles/hsi_graph_roles.sql`, then apply 034 as `hsi_graph_function_owner`. Run `scripts/verify-investigation-store-local.ts` against a local copy. All checks must pass. Then delete the branch.
3. **Apply.** Remove `034_hsi_investigation_store` from `HELD_MIGRATION_IDS` in a reviewed PR, then run `db:migrate` against the staging pin first and production second.
4. **Backfill.** Run one table at a time. Each step is idempotent and keyed on the source row, and is logged as a `created` event whose payload records the source table and row key.
5. **Freeze.** After a table is backfilled and its row counts reconcile, revoke writes on it so it becomes read-only.
6. **Drop.** Remove the frozen tables one release later, once the backfill has been reconciled and the isolation tests pass.

## Mapping

| Source | Applied? | Maps to | Notes |
| --- | --- | --- | --- |
| `004 hsi_research_investigation_runs` | Applied | `hsi_investigations`, with one `stage` event per run | The owner comes from the run's verified principal. Runs without a principal are reported, not guessed. |
| `007 hsi_interrogative_investigations` | Applied | `hsi_investigations` + `hsi_investigation_outputs` sections 01–06 | Section versions keep their existing digests in `lineage.sourceDigest`. |
| `014 hsi_investigation_graph_contexts` | Applied | `selection` events | `graphVersion` is pinned from the context, never "latest". |
| `015 hsi_investigation_revision_links` | Applied | `lineage.previous` on the outputs | No new aggregate. |
| `022 hsi_scientific_investigation_records` | Held, never applied | None | Superseded by 034. Do not apply it. |
| `030 hsi_live_investigations` | Held, never applied | None | Superseded by 034. Its trusted `hsi.live_owner_id` model is rejected by ADR-013. |
| `031 hsi_graph_investigations` | Held | `hsi_investigations` + `output` 01 | Only if 031 was ever applied on a branch. |

## What the backfill never does

- It never sets scientific approval or `scientificClaimAllowed`. The database refuses both.
- It never shares an investigation into a scope. Sharing is an owner action after the move.
- It never copies rows that have no verified owner. Those are listed in a reconciliation report for a human to resolve.
