# HSI Neon → AWS RDS PostgreSQL runbook (staging only)

**Status:** runbook / planning. **No production cutover.** Do not change live Vercel / CI `DATABASE_URL`. Do not destroy Neon `red-wave`. Do not provision paid RDS until founder says **go create RDS** (cost confirmation).

**Decision lock (2026-11-03):**

| Choice | Value |
|--------|--------|
| First product | **HSI** (this repo only) |
| Target | **Amazon RDS for PostgreSQL**, **dev-sized** |
| ISI Auth / immunecity Neon | **Stay on Neon** — not in this pass |
| Aksh / Akeno DBs | **Out of scope** |
| Rollback | Keep **HSI Neon `hsi-neon-project`** intact |

Related: [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md) · [`HSI_NEON_MIGRATIONS.md`](./HSI_NEON_MIGRATIONS.md) · [`CDS_PHI_BOUNDARY.md`](./CDS_PHI_BOUNDARY.md)

---

## 1. Scope

### In scope (HSI substrate only)

- Stage 1 HSI tables owned by this repo (`hsi_*` via `db/migrations`)
- Local / staging verification against a **new** RDS instance
- Code prep so `neonGuard` (and callers) can accept an allowlisted RDS endpoint **without** accepting ISI/Aksh/DeliverX Neons
- Docs + `.env.example` placeholders (no secrets)

### Out of scope (explicit)

| Item | Why |
|------|-----|
| ISI / immunecity Auth + product Neon (`autumn-snow` / `ep-isi-product`) | Stay on Neon; separate product |
| Aksh Health / Akeno clinical DBs | Separate planes; CDS/PHI boundary |
| Shared evidence DB between HSI and ISI | Forbidden — see AGENTS.md |
| Production cutover / swapping live `DATABASE_URL` | Requires **founder approval** after staging green |
| Destroying or decommissioning Neon `red-wave` | Rollback target |
| Inventing MoU, Gate C auto-approve, live CDS/PHI | Binding non-goals |
| Pointing HSI at ISI / Aksh / DeliverX Neons | Always refuse |

---

## 2. Target: RDS PostgreSQL (dev defaults)

Match Neon’s documented engine where practical. Canonical HSI Neon is **PostgreSQL 18** on `eu-west-2` ([`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md)).

| Setting | Recommended default (staging) | Notes |
|---------|-------------------------------|--------|
| Engine | **PostgreSQL 18.x** (or newest 18.minor available in the account/region) | If 18 is unavailable in-region, use **17** and re-test migrations; do not invent a downgrade without noting it |
| Region | Prefer **`eu-west-2`** (London) | Same region family as HSI Neon host |
| Instance class | **`db.t4g.micro`** (or `db.t3.micro` if Graviton unavailable) | Dev-sized; stop/start when idle to cut cost |
| Multi-AZ | **No** (single-AZ) | Staging only |
| Storage | **gp3**, **20 GiB**, autoscaling optional (cap ~50 GiB) | Substrate stub is tiny |
| Public access | **No** by default | Prefer VPN / bastion / SSM; if local laptop must connect, temporary SG rule from your IP only — remove after session |
| Security group | Inbound **5432** only from: developer IP(s) and/or app VPC CIDR | Never `0.0.0.0/0` for long-lived access |
| DB name | Prefer **`hsidb`** (or keep **`neondb`** for path-compat during first staging) | Guard must allow chosen name — see §5 |
| Master user | e.g. `hsi_admin` (placeholder) | Store password in Secrets Manager / local `.env.local` only |
| Parameter group / SSL | Require SSL (`sslmode=require` or verify-full) | Align with current guard TLS rules |
| Backup retention | **1–7 days** staging | Cheap safety net; not a prod DR plan |
| Deletion protection | **Off** for throwaway staging, **On** once a durable staging env is kept | Still never delete Neon |

**Cost stance:** creating RDS incurs AWS charges. This runbook does **not** authorize `aws rds create-db-instance`. Await explicit **go create RDS**.

---

## 3. Preflight checklist

Complete before any AWS create or dump/restore.

- [ ] Confirm worktree is **hsi-core** and Neon target for rollback is still **`hsi-neon-project` / `ep-hsi-production…`** only
- [ ] Confirm **no** intent to migrate ISI Auth or Aksh in this pass
- [ ] Estimate dump size from red-wave (expect **small** — one migration stub + sparse Gate C pending rows):

  ```bash
  # Masked host only in logs; never paste passwords into chat
  bun run db:migrate -- --from-neonctl   # no-op if already applied; proves connectivity
  npx neonctl psql --project-id hsi-neon-project -c \
    "SELECT pg_size_pretty(pg_database_size(current_database()));
     SELECT id FROM hsi_schema_migrations ORDER BY id;
     SELECT count(*) AS gate_c_rows FROM hsi_gate_c_reviews;"
  ```

- [ ] Migration inventory: today **1** file — `db/migrations/001_hsi_substrate.sql` (ledger id `001_hsi_substrate`)
- [ ] Prefer **replay migrations** on empty RDS over dump/restore unless red-wave has data you must keep
- [ ] Note **neonGuard** currently **rejects** any non–`ep-hsi-production…neon.tech` host — RDS staging **requires** a code change before `bun run db:migrate` can target RDS (see §5)
- [ ] AWS account + IAM ready; `aws` CLI optional (not present on some founder machines — console UI is fine)
- [ ] Decide VPC / subnet / SG; document CIDRs in a private note (not this repo)
- [ ] Plan `.env.local` **staging** key name (e.g. keep `DATABASE_URL` pointed at red-wave; use a clearly named staging override only after guard lands — see §4)

---

## 4. Step-by-step (staging)

**Stop conditions:** any step that would write production env vars, drop Neon, or touch ISI/Aksh DBs → abort.

### 4.1 Create RDS (manual / console or CLI) — **await “go create RDS”**

1. Create DB subnet group (private subnets preferred).
2. Create security group (§2).
3. Create RDS PostgreSQL instance with §2 defaults.
4. Wait until **available**; note endpoint hostname only (e.g. `hsi-staging.XXXX.eu-west-2.rds.amazonaws.com`) — **do not commit** it if it embeds account-specific secrets; documenting the *pattern* `*.rds.amazonaws.com` in code allowlists is fine.

### 4.2 Create database and app role

Connect as master (SSL), then:

```sql
-- Example names only — adjust; never commit real passwords
CREATE DATABASE hsidb;
CREATE ROLE hsi_app WITH LOGIN PASSWORD 'REPLACE_IN_SECRETS_MANAGER';
GRANT CONNECT ON DATABASE hsidb TO hsi_app;
-- After connecting to hsidb:
GRANT USAGE, CREATE ON SCHEMA public TO hsi_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO hsi_app;
```

If keeping pathname compatibility with today’s guard before the rename lands, you may `CREATE DATABASE neondb` instead — still HSI-only; never reuse ISI DB names/hosts.

### 4.3 Schema: prefer migration replay

**Preferred (empty RDS):**

1. Land §5 code changes (allowlist RDS endpoint + DB name).
2. Put **staging-only** URL in **gitignored** `.env.local` (see §4.4) — do **not** change Vercel production.
3. Run:

   ```bash
   bun run db:migrate
   ```

4. Confirm ledger:

   ```sql
   SELECT id, applied_at FROM hsi_schema_migrations ORDER BY id;
   ```

**Alternate (preserve red-wave row data):** `pg_dump` from Neon → `pg_restore` / `psql` into RDS. Use neonctl or a local dump file that stays **outside git**. Do not paste dump contents into chat.

### 4.4 Local `.env.local` for staging URL only

- Copy from [`.env.example`](../.env.example); never commit `.env.local`.
- Until production cutover is approved, **production / Vercel `DATABASE_URL` stays red-wave**.
- Recommended pattern after guard supports RDS:

  ```bash
  # gitignored .env.local — STAGING EXPERIMENT ONLY
  # Comment out or leave Neon URL above when testing RDS; do not push either secret.
  # DATABASE_URL=postgresql://hsi_app:PASSWORD@hsi-staging.XXXX.eu-west-2.rds.amazonaws.com:5432/hsidb?sslmode=require
  # HSI_DB_BACKEND=rds_staging
  ```

- Keep a one-line local note of the red-wave URL (or use `--from-neonctl`) so rollback is instant.

### 4.5 Verify

```bash
bun test
bun run db:migrate          # expect skip or apply against staging URL only
# Optional: bun run db:gate-c-local  # still pending-only; never auto-approve
bun run validate            # if usually part of check
```

Manual SQL checks (staging): tables `hsi_claims`, `hsi_markers`, `hsi_edges`, `hsi_gate_c_reviews`, `hsi_schema_migrations` exist; `auto_approve` check still forces `false`.

---

## 5. Code changes required (later implementation phase)

**Do not treat this section as already shipped.** Inventory of current access + files to touch:

### Current HSI DB access inventory

| Concern | Path | Role today |
|---------|------|------------|
| Host / project allowlist | [`src/db/neonGuard.ts`](../src/db/neonGuard.ts) | **Only** `ep-hsi-production…eu-west-2.aws.neon.tech` (+ pooler); DB path **`/neondb`**; forbids ISI/Akeno/DeliverX markers |
| URL resolve | [`src/db/resolveDatabaseUrl.ts`](../src/db/resolveDatabaseUrl.ts) | Env `DATABASE_URL` or `--from-neonctl` for red-wave |
| Migrate apply | [`src/db/migrate.ts`](../src/db/migrate.ts) + [`src/cli/migrate.ts`](../src/cli/migrate.ts) | Calls `assertHsiNeonDatabaseUrl` |
| Gate C local | [`src/db/gateCLocal.ts`](../src/db/gateCLocal.ts) + `src/cli/gate-c-local.ts` | Same guard; pending-only |
| SQL stub | [`db/migrations/001_hsi_substrate.sql`](../db/migrations/001_hsi_substrate.sql) | Single migration |
| Package scripts | [`package.json`](../package.json) `db:migrate`, `db:gate-c-local` | |
| Tests | [`test/neonGuard.test.ts`](../test/neonGuard.test.ts), `test/resolveDatabaseEnv.test.ts` | |
| Env template | [`.env.example`](../.env.example) | Neon placeholders only (RDS comment added as prep) |
| Docs | This file; [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md); [`HSI_NEON_MIGRATIONS.md`](./HSI_NEON_MIGRATIONS.md) | |

### Implementation checklist (await separate “go” after RDS exists or in parallel with create)

1. **Generalize guard** (keep Neon-only name or rename carefully):
   - Keep refusing `FORBIDDEN_NEON_MARKERS` (ISI / Akeno / DeliverX) **unconditionally**.
   - Add `isHsiRdsHost(host)` for allowlisted pattern, e.g. `*.eu-west-2.rds.amazonaws.com` **plus** an explicit env allowlist (`HSI_RDS_HOST=…`) so random RDS accounts cannot be targeted.
   - Allow DB name `neondb` **or** `hsidb` (constant / env).
   - Keep TLS: reject `sslmode=disable|allow|prefer`.
2. **Call sites:** `migrate.ts`, `gateCLocal.ts`, any export of `assertHsiNeonDatabaseUrl` from [`src/index.ts`](../src/index.ts) — update docs/comments “Neon or allowlisted HSI RDS staging”.
3. **Tests:** extend `test/neonGuard.test.ts` for RDS allow / forbid cases; never use real credentials.
4. **Docs:** mark staging verified; still **no** prod cutover language as “done”.
5. **Do not** remove red-wave support or `--from-neonctl` in this phase.

---

## 6. Rollback to red-wave

At any time before prod cutover:

1. Restore `.env.local` / shell env to HSI Neon URL (`ep-hsi-production…` / `hsi-neon-project`) **or** use `bun run db:migrate -- --from-neonctl`.
2. Leave RDS instance stopped or untouched; optional later delete **only** the staging RDS (never Neon).
3. Confirm guards still accept red-wave; re-run `bun test`.
4. Vercel / production env must still point at red-wave until §7.

Neon `red-wave` remains the **source of truth** until an explicit production cutover.

---

## 7. STOP — before production cutover (founder approval)

**Hard stop.** Do **not** proceed without written founder approval.

Forbidden without that approval:

- Changing Vercel / CI / production `DATABASE_URL` to RDS
- Deleting or suspending Neon `red-wave`
- Migrating ISI Auth or Aksh databases
- Opening RDS `0.0.0.0/0`
- Declaring Gate C / MoU / CDS-PHI “done” as part of this move

**Next human gates (in order):**

1. **go create RDS** — approve cost + create staging instance  
2. Implement §5 guard allowlist + tests  
3. Staging verify green  
4. Separate **go prod cutover** (not this document’s default)

---

## Appendix A — AWS CLI dry checks (optional)

If `aws` is installed and credentials work, **read-only** checks are OK:

```bash
aws sts get-caller-identity
aws rds describe-db-engine-versions --engine postgres \
  --query 'DBEngineVersions[?starts_with(EngineVersion, `18`)].EngineVersion' --output text
aws ec2 describe-regions --query 'Regions[].RegionName' --output text
```

Do **not** run `create-db-instance` / `delete-db-instance` without the **go create RDS** gate.

*(On 2026-11-03 founder machine check: `aws` CLI was not installed — console-only create is fine.)*

## Appendix B — What this does not change

- ISI product Auth and evidence remain on Neon `autumn-snow`
- HSI publish artifacts / Discovery JSON consume path unchanged
- `notCds` / no PHI / no Gate C auto-approve unchanged
