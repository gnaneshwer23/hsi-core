# P1.12.3 — Restricted Neon evidence pool

## Implementation
`src/evidence/restrictedNeonEvidencePool.ts` supplies a Bun SQL-backed `PostgresPool` compatible with `createNeonEvidenceDatabase`. It validates the canonical HSI Neon URL, requires the URL username to equal the configured dedicated role, rejects owner credentials, and checks live PostgreSQL `current_user`, LOGIN, SUPERUSER, BYPASSRLS and ownership of the evidence tables before issuing application SQL. TLS certificate validation is required.

This is **not wired to a public API**, and does not create a database user or enable writes. The staging role `hsi_evidence_app` is currently NOLOGIN, so this implementation intentionally fails closed until a distinct non-owner LOGIN credential is provisioned, its permissions independently reviewed, and the staging-only owner-role workaround retired. No production credential should be reused.

## Verification and release gates
1. CI: run `bun run typecheck`, `bun test test/restrictedNeonEvidencePool.test.ts test/neonEvidenceDatabase.test.ts`, and the repository's standard checks.
2. Staging-only: provision a dedicated least-privilege LOGIN role, never grant BYPASSRLS, table ownership or direct review UPDATE/DELETE.
3. Independently verify the role's membership, RLS FORCE policies and privilege matrix. Confirm the runtime connects as that role.
4. Synthetic staging E2E: cross-tenant SELECT/INSERT/UPDATE denial, append-only review, rollback, concurrent decisions and idempotency.
5. Wire into authenticated service only after trusted tenant membership resolution and a secure server-only write route exist.

No production Neon SQL, migration, Vercel environment or deployment change in this PR.
