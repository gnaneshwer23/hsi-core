# RA research corpus, pending-real path, and verification harness

## Two corpora

| Corpus ID | Status | Purpose |
| --- | --- | --- |
| `ra-anti-tnf-evidence` | Rights-verified import (Crossref CC BY; unreviewed) | Real PMID passages after Phase 3 export. Not scientific approval. |
| `ra-anti-tnf-research` | `available_working_set` / `research_working_set` / `notForScientificClaim` | Synthetic `SYN-RA-SRC-*` / `RS-*` sources for authenticated start → passage review → save → reload → export. |

Licence URIs for PMIDs 18375541 / 24586782 come from receipted Crossref works records (not invented; not mapped from unversioned Europe PMC tokens). Workflow acceptance is **not** scientific validation or Gate C approval.

## HSI commands

```sh
bun run ra:verify-research-path
bun test ./test/raResearchEvidenceRelease.test.ts ./test/correctionProvenance.test.ts ./test/phase8to10Scaffold.test.ts
bun run ra:export-research-artifact -- isi aksh   # after committing research sources
bun scripts/sync-shared-technology.ts isi aksh # after committing shared modules
```

## Product DB activation (human-gated)

Do **not** apply from the HSI workspace against HSI red-wave credentials.

| Product | Migration | Apply (from product checkout with product `.env.local`) |
| --- | --- | --- |
| ISI (autumn-snow) | `drizzle/migrations/0029_hsi_investigations.sql` | `bun --env-file=.env.local scripts/apply-hsi-investigations-migration.ts --apply` |
| Aksh | `db/migrations/056_hsi_investigations.sql` | `bun --env-file=.env.local scripts/apply-hsi-investigations-migration.ts --apply` then `provision-hsi-research.ts` |

Prefer disposable local Postgres verification via each product's `setup-investigation-test-db.ts` when product Neon credentials are unavailable.

## What humans verify later

- Licence URI clearance and real JATS import for the pending RA pair.
- SME context annotation (empty worksheet today).
- Production Neon migration apply + research-role provisioning.
- Cross-user denial on live product auth (covered in disposable DB harnesses; not live IdP).
- Scientific adjudication; Gate C remains human-only.
