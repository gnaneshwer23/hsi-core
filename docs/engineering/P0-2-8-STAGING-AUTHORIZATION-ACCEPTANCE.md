# P0.2.8 — Restricted database authorization staging acceptance (interim)

**Decision: NO-GO. No persistence activation.**

## Isolated staging target
Neon project `red-wave-06625195`, branch `br-shiny-cherry-zagwwdi8` only. No production changes.

## Actual execution
- Migration 028: PASS, 21 SQL statements in one transaction.
- First attempts failed on PostgreSQL SET ROLE, schema CREATE, and function ownership/EXECUTE ordering; all corrected in the committed migration before successful execution.
- Dedicated roles `hsi_contradiction_function_owner` and `hsi_contradiction_runtime` exist with NOLOGIN and NOBYPASSRLS.
- `hsi_contradiction_create` and `hsi_contradiction_review` are owned by restricted function-owner role and executable by runtime role.
- `hsi_contradiction_session_principal` remains owned by `neondb_owner`, callable by function-owner but not runtime.
- FORCE RLS policies on ledger and membership tables are scoped to function-owner role. Runtime has no direct table DML grants.
- Temporary migration owner membership and schema CREATE privilege were revoked in the same transaction.

## Not yet demonstrated
- A real authenticated, independent researcher and reviewer pair; two-tenant positive and negative E2E.
- A dedicated LOGIN role or configured backend runtime using the NOLOGIN runtime group.
- Read-only tenant-scoped API; canonical snapshot and source-ID consistency checks; scope and grant revocation tests.
- HTTP route mounting, concurrency/idempotency, audit receipts and independent reviewer sign-off.
- No validated cross-domain evidence coverage.

## Release blockers
1. Validate `SET ROLE` negative access with a disposable restricted test connection; avoid testing via privileged owner alone.
2. Implement authenticated tenant-scoped reads, snapshot validation and source consistency checks.
3. Provision isolated verified test identities with no real user session tokens in logs.
4. Execute E2E, collect sanitized test receipts and independent security sign-off.

`028` is HELD in `src/db/migrate.ts`. Do not remove holds or enable production.
