# HSI Neon migrations (Phase 4)

**Canonical target only:** Neon project `human super intelligence` / `red-wave-06625195` / branch `br-quiet-silence-zab1zvji` / host `ep-restless-dew…eu-west-2` / database `neondb`.

**Never** point migrations or Gate C local sync at ISI (`autumn-snow` / `ep-blue-salad`), Akeno, or DeliverX. See [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md).

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

This is an **HSI-owned** stub, not a copy of immunecity ISI tables.

## Credentials (never commit)

```bash
# Local (gitignored) — preferred for agents / CLI
cp .env.example .env.local
# Fill DATABASE_URL from Neon console or:
#   npx neonctl connection-string --project-id=red-wave-06625195 \
#     --branch-id=br-quiet-silence-zab1zvji --database-name=neondb --role-name=neondb_owner

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
| `DATABASE_URL` | pooled/unpooled URL for `ep-restless-dew…/neondb` |
| `NEON_PROJECT_ID` | `red-wave-06625195` |
| `NEON_BRANCH_ID` | `br-quiet-silence-zab1zvji` |

Pull for local use (still gitignored):

```bash
# if linked to a Vercel project that holds HSI Neon secrets
vercel env pull .env.local
```

Do **not** put ISI / Akeno / DeliverX URLs in this project's Vercel env.

## Safety guards

`assertHsiNeonDatabaseUrl()` refuses URLs/hosts containing:

- `ep-blue-salad`, `autumn-snow` (ISI)
- `ep-weathered-mountain`, `silent-violet` (Akeno)
- `spring-wind` (DeliverX)

and requires `ep-restless-dew` **or** explicit `NEON_PROJECT_ID=red-wave-06625195`.

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
npx neonctl psql --project-id red-wave-06625195 -c \
  "SELECT id FROM hsi_schema_migrations; SELECT count(*) FROM hsi_gate_c_reviews;"
```
