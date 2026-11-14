# HSI Neon migrations (Phase 4)

**Canonical target only:** Neon project `human super intelligence` / `hsi-neon-project` / branch `hsi-production-branch` / host `ep-hsi-production…eu-west-2` / database `neondb`.

**Never** point migrations or Gate C local sync at ISI (`autumn-snow` / `ep-isi-product`), Akeno, or DeliverX. See [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md).

**RDS staging (planned, not cut over):** see [`NEON_TO_AWS_RDS_RUNBOOK.md`](./NEON_TO_AWS_RDS_RUNBOOK.md). Production / Vercel `DATABASE_URL` stays red-wave until founder approval; ISI Auth is not part of that pass.

## Held, not applied (2026-11-10)

`022_hsi_scientific_investigation_records.sql` and `023_hsi_researcher_workspace_community.sql` are in the repository and listed in `HELD_MIGRATION_IDS`. `bun run db:migrate` skips them. They have not been applied to staging or production.

Owner steps, HSI Neon project only:

1. Read the SQL and the rollback comments at the top of each file.
2. Remove those two ids from `HELD_MIGRATION_IDS` in `src/db/migrate.ts` after review.
3. Apply with `bun run db:migrate` using gitignored HSI credentials or `neonctl` OAuth. Do not pass a password on the command line and do not point the URL at another product.
4. Do not change Vercel environment variables or deploy settings as part of applying the SQL.

Rollback statements are in the SQL comments. Take a backup before dropping tables.

## Drafts 031 and 032: graph workspace storage (held, not applied)

`031_hsi_graph_workspace_storage.sql` and `032_hsi_graph_workspace_procedures.sql` are in `HELD_MIGRATION_IDS`, so `bun run db:migrate` skips them. **Neither has been applied to any Neon branch.** No runtime code imports the adapter that calls them.

- **031, tables:** pinned ontology releases and terms (immutable once recorded); owner-scoped, append-only, digest-chained saved investigations; owner-scoped, append-only curator recommendations (no approval column). Row-level security is forced, `PUBLIC` is revoked, there are **no policies and no runtime grants**. CHECKs are wrapped in `COALESCE(...,false)` because a CHECK passes on NULL (a double-encoded jsonb string or a missing key would otherwise slip through; found by the local integration run).
- **032, the only access path:** six `SECURITY DEFINER` procedures that validate the caller's session token against `neon_auth.session` inside the same transaction, derive the principal, require an active researcher grant, and scope every row to it. No session or owner GUC is trusted (the earlier GUC-policy draft was removed: a forged setting exposed another owner's row in the P0-C audit). The runtime role needs only EXECUTE on those procedures. The function owner must be a non-superuser: policies for it are created explicitly, because forced RLS applies to table owners too.
- **Verified against** a throwaway local PostgreSQL 14 only: `db/verify/031_*` and `db/verify/032_*` (all pass, rolled back), seven deliberate mutations of 032 (missing policies, dropped owner scoping on list, get and recommendations, dropped expiry, dropped backdating bound, forged identity flag) each caught, and `scripts/verify-graph-workspace-local.ts` end to end through the TypeScript adapter as the least-privilege role (16 checks, including refusing a record edited underneath the application). Neon runs a newer major version; rehearse on a disposable Neon child branch before any real apply.
- **Not verified:** a real Neon Auth schema (the checks use a stand-in with only the columns read), real roles and pooling, ontology import role and its write policy (reference data is written by a separate role that does not exist yet), concurrency under load.

Owner steps if you proceed, HSI Neon project only: read both files and the rollback comments; create the `hsi_graph_runtime` role through a reviewed process; create the separate ontology import role and policy; rehearse the two verify scripts on a disposable child branch; then remove the ids from `src/db/migrationHolds.ts` and apply. Wiring the adapter into a route is a separate, later change.

## What shipped

| Piece | Location |
|-------|----------|
| SQL stub | [`db/migrations/001_hsi_substrate.sql`](../db/migrations/001_hsi_substrate.sql) |
| Apply CLI | `bun run db:migrate` |
| Gate C local upsert | `bun run db:gate-c-local` (pending only; `auto_approve=false`) |
| Host guards | [`src/db/neonGuard.ts`](../src/db/neonGuard.ts) |

### Tables

- `hsi_schema_migrations` — ledger
- `hsi_claims` / `hsi_markers` / `hsi_edges` — Stage 1 substrate (grades + provenance columns on edges)
- `hsi_gate_c_reviews` — human-only review queue (`CHECK (auto_approve = false)`)
- `hsi_evidence_ledger_records` — N2 versioned evidence ledger (**016** applied on red-wave; Audit #6)
- `hsi_experiment_ledger_records` — N7 experiment ledger (**017** applied on red-wave; Audit #6)

This is an **HSI-owned** stub, not a copy of immunecity ISI tables. Neon R/W helpers for 016/017 remain residual; offline fixtures stay authoritative until helpers land.

## Credentials (never commit; never paste into chat)

Do **not** paste Neon passwords or full `DATABASE_URL`s into Cursor/chat. Prefer neonctl OAuth or a gitignored `.env.local`. HSI URL must target **`ep-hsi-production…` / `hsi-neon-project` only** — see [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md) § Credentials hygiene.

```bash
# Local (gitignored) — preferred for agents / CLI
cp .env.example .env.local
# Fill DATABASE_URL from Neon console or:
#   npx neonctl connection-string --project-id=hsi-neon-project \
#     --branch-id=hsi-production-branch --database-name=neondb --role-name=neondb_owner

bun run db:migrate
bun run db:gate-c-local
```

### Without writing `.env.local`

```bash
bun run db:migrate -- --from-neonctl
bun run db:gate-c-local -- --from-neonctl
```

Requires neonctl OAuth (`~/.config/neonctl/credentials.json`) or `NEON_API_KEY`.

### Vercel

Store **HSI red-wave only** secrets in the Vercel project env (Production / Preview as needed):

| Name | Value |
|------|--------|
| `DATABASE_URL` | pooled/unpooled URL for `ep-hsi-production…/neondb` |
| `NEON_PROJECT_ID` | `hsi-neon-project` |
| `NEON_BRANCH_ID` | `hsi-production-branch` |

Pull for local use (still gitignored):

```bash
# if linked to a Vercel project that holds HSI Neon secrets
vercel env pull .env.local
```

Do **not** put ISI / Akeno / DeliverX URLs in this project's Vercel env.

## Safety guards

`assertHsiNeonDatabaseUrl()` refuses URLs/hosts containing:

- `ep-isi-product`, `autumn-snow` (ISI)
- `ep-akeno-product`, `silent-violet` (Akeno)
- `spring-wind` (DeliverX)

and requires the canonical `ep-hsi-production` endpoint (pooled or direct),
the Neon `eu-west-2` domain and `neondb`. A project environment variable cannot
override a mismatched host. Credential masks omit query parameters and safely
handle passwords containing URL delimiters.

## Gate C honesty

| Surface | Behavior |
|---------|----------|
| `gate-c-checklist.*` exports | Curator markdown/JSON; status `pending` |
| `bun run db:gate-c-local` | Upserts matching rows into `hsi_gate_c_reviews` as **pending**; never `human_approved` |
| ISI product Neon approve | Human action in **autumn-snow** only — not from this workspace |

## Verify

```bash
bun test
bun run outputs
bun run db:migrate -- --from-neonctl   # or with .env.local
# Then, masked host only:
npx neonctl psql --project-id hsi-neon-project -c \
  "SELECT id FROM hsi_schema_migrations; SELECT count(*) FROM hsi_gate_c_reviews;"
```
