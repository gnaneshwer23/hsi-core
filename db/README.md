# HSI Neon migrations (red-wave only)

Minimal Stage 1 substrate schema for the **HSI-canonical** Neon project. Not an immunecity / ISI schema copy.

| Field | Value |
|-------|--------|
| Project | `human super intelligence` / `hsi-neon-project` |
| Branch | `production` / `hsi-production-branch` |
| Host prefix | `ep-hsi-production…eu-west-2` |
| Database | `neondb` |

See [`docs/NEON_PROJECT_MAP.md`](../docs/NEON_PROJECT_MAP.md) and [`docs/HSI_NEON_MIGRATIONS.md`](../docs/HSI_NEON_MIGRATIONS.md).

## Apply

```bash
# Prefer .env.local (gitignored) with HSI DATABASE_URL only
cp .env.example .env.local   # then fill USER/PASSWORD from Neon console / neonctl

bun run db:migrate
# optional: upsert Gate C checklist rows as pending (never auto-approve)
bun run db:gate-c-local
```

Or fetch URL via neonctl (does not write secrets to disk):

```bash
bun run db:migrate -- --from-neonctl
bun run db:gate-c-local -- --from-neonctl
```

The migrate / gate-c scripts **refuse** known ISI / Akeno / DeliverX hostnames and require an HSI host (`ep-hsi-production`) or `NEON_PROJECT_ID=hsi-neon-project`.

## Objects

| Table | Purpose |
|-------|---------|
| `hsi_schema_migrations` | Applied migration ids |
| `hsi_claims` | Assertion layer |
| `hsi_markers` | LOINC-friendly markers (no PHI) |
| `hsi_edges` | Graded edges + provenance stub |
| `hsi_gate_c_reviews` | Human-only Gate C queue (`auto_approve` forced false) |
