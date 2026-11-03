# RA demo corpus, pending-real path, and smoke harness

## Two corpora

| Corpus ID | Status | Purpose |
| --- | --- | --- |
| `ra-anti-tnf-evidence` | `awaiting_verified_source_import` | Real PMID candidates. Product start must return `evidence_not_ready`. |
| `ra-anti-tnf-demo` | `available_demo_only` / `demo_fixture` / `not_for_scientific_claim` | Synthetic `DEMO-PMID-*` (contract IDs `SYN-DEMO-PMID-*`) for authenticated start → passage review → save → reload → export. |

Never invent Creative Commons URIs for real PMIDs 18375541 / 24586782. Demo success is **not** scientific validation.

## HSI commands

```sh
bun run ra:smoke-demo
bun test ./test/raDemoEvidenceRelease.test.ts ./test/correctionProvenance.test.ts ./test/phase8to10Scaffold.test.ts
bun run ra:export-demo-artifact -- isi aksh   # after committing demo sources
bun scripts/sync-shared-technology.ts isi aksh # after committing shared modules
```

## Product DB activation (human-gated)

Do **not** apply from the HSI workspace against HSI red-wave credentials.

| Product | Migration | Apply (from product checkout with product `.env.local`) |
| --- | --- | --- |
| ISI (autumn-snow) | `drizzle/migrations/0029_hsi_investigations.sql` | `bun --env-file=.env.local scripts/apply-hsi-investigations-migration.ts --apply` |
| Aksh | `db/migrations/056_hsi_investigations.sql` | `bun --env-file=.env.local scripts/apply-hsi-investigations-migration.ts --apply` then `provision-hsi-research.ts` |

Prefer disposable local Postgres smoke via each product's `setup-investigation-test-db.ts` when product Neon credentials are unavailable.

## What humans verify later

- Licence URI clearance and real JATS import for the pending RA pair.
- SME context annotation (empty worksheet today).
- Production Neon migration apply + research-role provisioning.
- Cross-user denial on live product auth (covered in disposable DB harnesses; not live IdP).
- Scientific adjudication; Gate C remains human-only.
