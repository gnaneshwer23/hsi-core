# Neon project map (no secrets)

**Binding rule:** HSI is a **separate technology** with its **own clean Neon project**. It does **not** share an evidence DB with immunecity / ISI, Akeno, DeliverX, or any other product.

Read-only orientation for agents with Neon CLI OAuth (`~/.config/neonctl/credentials.json` or `NEON_API_KEY`). **Do not** put passwords or full connection strings here. Host prefixes only.

Access check: `npx neonctl me` → `npx neonctl projects list`. No Neon MCP is required in this workspace.

## Credentials hygiene (binding)

**Never paste Neon passwords, API keys, or full connection strings into chat** (Cursor, Slack, email, tickets). Agents must not ask for them.

| Do | Don’t |
|----|--------|
| Use `neonctl` OAuth (`~/.config/neonctl/credentials.json`) or `NEON_API_KEY` in the local shell | Paste DB passwords into the chat |
| Put HSI `DATABASE_URL` only in **gitignored** `.env` / `.env.local` (or Vercel env for the HSI project) | Commit secrets or put them in docs |
| Confirm host is **`ep-restless-dew…` / project `red-wave-06625195`** before any HSI migrate / Gate C local write | Point HSI writes at ISI `autumn-snow` / Akeno / DeliverX |

Preferred migrate path without a local secrets file: `bun run db:migrate -- --from-neonctl`.

## Canonical HSI Neon (the only substrate DB for hsi-core)

| Field | Value |
|-------|--------|
| **Name** | `human super intelligence` |
| **Project ID** | `red-wave-06625195` |
| **Default branch** | `production` (`br-quiet-silence-zab1zvji`) |
| **Host prefix** | `ep-restless-dew-zas989pv…eu-west-2` |
| **Database** | `neondb` (PG18; HSI-owned Stage 1 stub via `db/migrations` — see [`HSI_NEON_MIGRATIONS.md`](./HSI_NEON_MIGRATIONS.md)) |
| **Role** | **HSI-canonical** — sole Neon for HSI substrate / migrations owned by this repo |

**Future staging (not live):** HSI-only Neon → AWS RDS PostgreSQL plan (dev-sized, no prod cutover, ISI Auth stays on Neon) — [`NEON_TO_AWS_RDS_RUNBOOK.md`](./NEON_TO_AWS_RDS_RUNBOOK.md). Keep `red-wave` as rollback until founder-approved cutover.

If `red-wave-06625195` is missing or polluted, create a **new** empty Neon named clearly for HSI (e.g. `hsi-core` / `human-systems-intelligence`) and update this table. Prefer documenting + a minimal HSI-owned schema stub in-repo over copying ISI schemas. Apply with `bun run db:migrate` (guards refuse ISI/Akeno/DeliverX hosts).

**Placeholder (local only — never commit passwords):**

```bash
# .env (gitignored) — HSI Neon only
DATABASE_URL=postgresql://USER:PASSWORD@ep-restless-dew-zas989pv.REGION.aws.neon.tech/neondb?sslmode=require
NEON_PROJECT_ID=red-wave-06625195
NEON_BRANCH_ID=br-quiet-silence-zab1zvji
```

See [`.env.example`](../.env.example).

## Never use for HSI substrate

| Neon project name | Project ID | Endpoint host prefix | Why forbidden for HSI |
|-------------------|------------|----------------------|------------------------|
| **immunecity** | `autumn-snow-67879321` | `ep-blue-salad-b5fk2n36…us-east-2` | **ISI product Neon only** — Gate C approve/writes, evidence/community/ask tables. **Never** HSI substrate. Do **not** run Gate C approve or HSI migrations against it. |
| **akeno health** | `silent-violet-81283547` | `ep-weathered-mountain-abmzoit7…eu-west-2` | **Out of scope** for HSI (deferred clinical / PHI-class). Ignore. |
| **deliverx** | `spring-wind-48457918` | (DeliverX) | **Ignore** entirely — not an HSI spoke. |

### Explicit isolation

- **No shared evidence DB** between HSI and immunecity for HSI tech.
- HSI publishes graded exports from this repo; ISI (immunecity) may **consume** those artifacts in **its own** Neon. That is not a shared database.
- Gate C **checklist** lives in hsi-core; Gate C **approve+supports** (if any) is a human action in the **ISI product Neon** (`autumn-snow` / `ep-blue-salad…`) — never an HSI write path into ISI Neon from this workspace.
- Akeno / DeliverX Neons: do not inspect for HSI work unless the user explicitly asks; never mutate for HSI.
- In-repo Akeno HITL consumer (`/akeno`, `akeno/.env.example` `AKENO_*`) does **not** connect to Akeno Neon — documentation prefix only.

## Other projects on the same Neon login (context only — not HSI)

| Name | Project ID | Notes |
|------|------------|--------|
| praja ledger | `square-cake-28248061` | unrelated |
| carebridgeindia | `orange-block-41773018` | unrelated |
| SIGNALFORGE | `mute-base-44162928` | unrelated |
| Aksh Health / Aksh Health Production | `floral-salad-21467299` / `tiny-river-29853628` | Aksh HITL consumers — not HSI substrate |
| SciFlowAI, Modi, modi-pharmacovigilance | various | unrelated |

## Agent rules

1. Prefer **read-only** inspection (`branches list`, `databases list`, schema `SELECT` via `neonctl psql`) unless the user asked to mutate **HSI Neon**.
2. **Never** print API keys, passwords, or full connection strings in docs or chat.
3. **Immunecity freeze lifted 2026-11-01** for **ISI HSI-consume wiring only** (user auth; see [`AGENTS.md`](../AGENTS.md)). Still no DeliverX edits. Still **no shared Neon**. HSI substrate stays `red-wave`; ISI product DB stays `autumn-snow` for the ISI app only.
4. **Never** point HSI `DATABASE_URL` / migrations / Gate C substrate writes at `autumn-snow`, `ep-blue-salad…`, Akeno, or DeliverX.
5. Gate C curation artifacts live in this repo (`docs/IMMUNECITY_GATE_C_COMMIT_MANUAL.md`, exports). Product Gate C approve (ISI) stays in immunecity’s Neon — separate DB, separate technology surface.
