---
title: "09. Database and Data Model Specifications"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **This is the critical path.** Twelve migrations (022 to 033) are held. Until they are reworked, reviewed and applied, nothing a researcher does is saved on the server.
- **Do not apply the held migrations as they are.** First consolidate investigation storage (ADR-012), unify identity binding (ADR-013) and replace hard-coded scopes (ADR-014). Then apply one reviewed set.
- **Ownership is enforced in the database,** not only in the API: row-level security plus `SECURITY DEFINER` functions that verify the session.
- **Every change goes through a Neon preview branch** with the two-account isolation suite before it touches production.

# 2. Vision

A small, legible schema where each concept has one table, every write is attributable, review decisions are immutable, graph releases are reproducible, and no tenant can read another's work even if the API has a bug.

# 3. Where we are

| Item | Status | Detail |
| --- | --- | --- |
| Migrations | Partial | 34 files: `001` to `033` plus `20261111_p1_4_evidence_review_staging.sql` |
| Tables | Partial | 55 tables in the `hsi` namespace |
| Held migrations | Blocked | `022` to `033` listed in `src/db/migrationHolds.ts` |
| RLS | Partial | Policies in 012, 013, 019 to 025, 030 to 032 and the staging file |
| Migration runner and guard | Built | `src/db/migrate.ts`, `src/db/neonGuard.ts` (project and branch pins) |
| Graph workspace storage rehearsal | Partial | 031 to 033 rehearsed on a disposable Neon branch with synthetic sessions; not independently accepted |
| Production writes | Disabled | `HSI_RESEARCH_WRITES_ENABLED` off |

## Known structural problems

| Problem | Where | Fix |
| --- | --- | --- |
| Six tables model "investigation" | `hsi_research_investigation_runs` (004), `hsi_interrogative_investigations` (007), `hsi_investigation_graph_contexts` (014), `hsi_investigation_revision_links` (015), `hsi_scientific_investigation_records` (022), `hsi_live_investigations` (030) | ADR-012: one store |
| Two identity-binding models | 027 verifies session in `SECURITY DEFINER`; 030 trusts a server-set `hsi.live_owner_id` | ADR-013: use 027's model everywhere |
| Hard-coded review scopes | 027 rejects scopes outside `('ssc','ra')`; `HSI_REVIEWER_SCOPES` literal | ADR-014: scope registry table |
| Browser-only state | Hypothesis ledger, gap tracking, topics, onboarding funnel in `localStorage` | Tables below |

# 4. Target core schema

| Table | Key columns | Notes |
| --- | --- | --- |
| `hsi_principals` | `id`, `auth_user_id`, `email_verified`, `created_at` | Mirrors Neon Auth user; no profile PII beyond email |
| `hsi_scopes` | `id` (for example `gut-immune-metabolic`, `ra`, `t2d`), `name`, `active` | ADR-014 |
| `hsi_memberships` | `principal_id`, `scope_id`, `role` (`researcher`, `reviewer`, `adjudicator`, `admin`), `granted_by`, `revoked_at` | Reviewer authority lives here |
| `hsi_investigations` | `id`, `owner_id`, `scope_id`, `question`, `entities`, `graph_release_id`, `status`, `created_at` | Replaces six tables |
| `hsi_investigation_events` | `id`, `investigation_id`, `run_id`, `stage`, `status`, `payload_digest`, `at` | Append-only |
| `hsi_investigation_outputs` | `investigation_id`, `section` (01 to 06), `version`, `body_json`, `lineage_json` | Immutable versions |
| `hsi_jobs` | `id`, `kind`, `payload`, `status`, `attempts`, `lease_until`, `last_error` | ADR-011 |
| `hsi_evidence_sources`, `hsi_evidence_passages`, `hsi_evidence_ledger_records` | Existing (016) | Add `rights_decision`, `retraction_status`, `study_family_id` |
| `hsi_claims` | Existing | Candidate assertions with full context fields (doc 03) |
| `hsi_lhkg_nodes`, `hsi_lhkg_relationships` | Existing (011) | Source of truth for the graph |
| `hsi_graph_releases` | `id`, `parent_id`, `digest`, `changelog`, `released_by`, `released_at` | Immutable |
| `hsi_review_decisions` | `id`, `claim_id`, `reviewer_id`, `decision`, `rationale`, `context_json`, `at` | Immutable; no self-review constraint |
| `hsi_hypotheses` | `id`, `owner_id`, `investigation_id`, `text`, `content_hash`, `recorded_at`, `outcome`, `outcome_recorded_at` | Text immutable after recording |
| `hsi_gap_tracking` | `gap_id`, `owner_id`, `status`, `history_json` | Replaces browser storage |
| `hsi_topics` | `owner_id`, `node_id` | Followed entities |
| `hsi_access_requests` | `id`, `email`, `question`, `created_at`, `status` | PRD-08; rate-limited |
| `hsi_audit_events` | `id`, `actor_id`, `action`, `object`, `at`, `prev_hash`, `hash` | Hash-chained |

## Integrity rules

- Foreign keys everywhere; `ON DELETE RESTRICT` for evidence and reviews.
- Idempotency keys on every write endpoint, unique per principal.
- Review decisions, graph releases, hypotheses text and audit events are append-only (no `UPDATE`, enforced by triggers or revoked privileges).
- Soft delete only for user-owned drafts; never for evidence or reviews.
- Every timestamp `timestamptz`, UTC.

## Access model

- The runtime connects with a restricted role that cannot `ALTER`, `DROP` or read the benchmark label vault.
- All user-owned tables have RLS: `owner_id = hsi.current_principal()` where `current_principal()` verifies the session server-side inside a `SECURITY DEFINER` function.
- Reviewers read candidates in their scopes only; they cannot review their own claims.

# 5. What to build next

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| DB-01 | Write the consolidation migration (ADR-012, 013, 014) | One new migration plus backfill; held migrations superseded where they conflict; diagram updated |
| DB-02 | Two-account isolation suite (HSI-P4-02) | Wrong owner, wrong scope, forged setting, self-review, revoked session and concurrent replay all denied over HTTP and SQL |
| DB-03 | Independent security review | A named reviewer outside the company signs off the role model and RLS before production apply |
| DB-04 | Apply to production behind a flag | Writes enabled for the owner first, then pilot researchers |
| DB-05 | Move browser-only state to tables | Ledger, gaps, topics and saved investigations migrate from `localStorage` on first sign-in |
| DB-06 | Backup and restore drill | Point-in-time restore to a branch tested and timed; written result |
| DB-07 | Data dictionary | Generated from the schema; every table and column described |

# 6. Migration process

1. Create a Neon preview branch from production.
2. Apply the migration with `bun run db:migrate` against the branch (guards check project and branch pins).
3. Run the isolation suite and the API contract tests against the branch.
4. Review by a second person; record the review in the PR.
5. Apply to production in a maintenance window; keep the branch for 7 days for rollback comparison.
6. Every migration has a written rollback (a reverse migration or a restore point).

# 7. Future options

- Partition `hsi_investigation_events` by month once volume justifies it.
- Separate analytics replica for usage metrics.
- Tenant tables for organisations when team workspaces arrive.

# 8. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-80 | Who is the independent database reviewer | Contract a freelance Postgres security reviewer for a fixed scope (role model, RLS, functions) |
| D-81 | Keep or drop the community tables (023) | Drop from v1; the opt-in community is out of pilot scope |
