# ARCH-002 Step 1 — HSI-owned SSc evidence ingestion

**Implementation status:** metadata-only adapter and guarded HSI database CLI committed. **Not** verified against live Europe PMC, not run against HSI Neon, and not scientifically curated.

## Runbook

1. Review migration `db/migrations/002_hsi_evidence_ownership.sql` and confirm dedicated HSI database only.
2. With approved HSI database credentials, run `bun run db:migrate` after staging checks. This migration is not automatically deployed by the code commit.
3. Inspect metadata without database writes: `bun src/cli/ingest-ssc-sources.ts --dry-run`.
4. In authorised environment: `bun src/cli/ingest-ssc-sources.ts` or `bun src/cli/ingest-ssc-sources.ts --pmid=30760472`.
5. Run `bun test test/evidenceIngestion.test.ts` and full CI before merging to a protected deployment branch.

The importer uses Europe PMC's REST search endpoint with strict PMID matching, a 12-second timeout, a response size limit, content hashes, per-record error handling and parameterised SQL. Writes are guarded by the existing HSI Neon project validator. It persists **metadata only**: no full text, no patient data, no claim approval. Retraction state remains `unknown` unless explicitly flagged by the provider; an unflagged record is **not** proof of non-retraction.

## Remaining gates

- Verify provider responses and licensing on a real network.
- Confirm HSI Neon migration, schema and DB permissions in staging.
- Implement durable source revision history, ingestion job/audit table, backoff/rate limits and retraction/correction monitoring.
- Verify source passages and contextual scientific claims with a qualified reviewer.
- Implement authenticated Gate C review and release-aware retrieval.
- Demonstrate isolation from Aksh and ISI.
