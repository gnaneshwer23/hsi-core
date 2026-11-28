# ADR-012: One investigation store

**Status:** Accepted — owner sign-off 28 November 2026. Implemented by held migration `034_hsi_investigation_store`; production apply waits for the independent database review (Track B2) and the two-account isolation suite on a disposable database (`scripts/verify-investigation-store-local.ts`, run in CI).
**Date:** 17 November 2026
**Source:** Engineering pack v1.1 § Database; build plan A3.1.
**Related:** ADR-011 (jobs), ADR-013 (identity), ADR-014 (scopes), `src/db/migrationHolds.ts`.

## Context
Six tables model “investigation” differently:

| Migration | Table |
| --- | --- |
| 004 | `hsi_research_investigation_runs` |
| 007 | `hsi_interrogative_investigations` |
| 014 | `hsi_investigation_graph_contexts` |
| 015 | `hsi_investigation_revision_links` |
| 022 (held) | `hsi_scientific_investigation_records` |
| 030 (held) | `hsi_live_investigations` |

Held migrations cannot be safely applied until this is fixed. Mapping between six shapes forever is not an acceptable long-term plan.

## Decision
Consolidate to **one investigation store**:

1. `hsi_investigations` — owner, scope, question, entities, graph release pin, status.
2. `hsi_investigation_events` — append-only stage/event log (payload digests, run id).
3. `hsi_investigation_outputs` — immutable section versions (01–06) with lineage JSON.

One consolidation migration plus a written backfill plan supersedes conflicting held shapes. Old tables become read-only, then drop after one release once backfill and isolation tests pass on a Neon preview branch.

## Consequences
- Researcher work can finally persist server-side without inventing a seventh investigation shape.
- Browser-only ledgers/gaps/topics remain out of scope for this ADR; they move later (DB-05).
- **Promotion constraint:** consolidation never auto-promotes graph edges or sets `scientificClaimAllowed`. Review and graph release stay separate append-only records.
- Production apply stays blocked until independent DB review (Track B2) and the two-account isolation suite (A3.2 / DB-02) are green on a disposable branch.

## Alternatives rejected
Keep all six tables and maintain adapters between them.

## Revisit trigger
A product requirement that cannot be expressed as investigation + events + outputs without a new first-class aggregate (document that aggregate as a new ADR; do not fork a parallel investigation table).
