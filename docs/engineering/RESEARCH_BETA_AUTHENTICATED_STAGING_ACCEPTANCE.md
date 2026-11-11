# HSI Research Beta — Authenticated Staging Acceptance Gate

**Status: BLOCKED — no live authenticated end-to-end test has been executed.**

## Verified code audit (main, 2026-11-11)
- `authenticateEvidenceRequest` verifies the provider session, email verification, provider token, matching research actor, and delegates tenant membership to a required `resolveOrganisation` callback.
- `handleGovernedEvidenceApi` is explicitly **unmounted**, disabled by default, and accepts injected authentication and service dependencies. It cannot currently serve browser requests by itself.
- `createRestrictedNeonEvidencePool` rejects the owner role, checks `current_user`, `rolsuper`, `rolbypassrls`, `rolcanlogin` and table ownership. It is not proof of a working restricted connection.
- `createNeonEvidenceDatabase` scopes tenant context inside BEGIN/COMMIT/ROLLBACK and calls `release` in `finally`.
- `persistIndependentReview` locks the pending snapshot row, checks independent reviewer permissions, inserts a review event, then updates snapshot status in one transaction.
- Prior staging SQL tests validated cross-tenant isolation, duplicate suppression and failed-transaction rollback, but were executed using the owner connection with `SET LOCAL ROLE`.

## Mandatory prerequisites before live execution
1. Staging-only restricted LOGIN credentials in the server secret store. The previously provisioned `hsi_evidence_staging_login` has **PASSWORD NULL** and cannot perform password authentication. Do not use the database owner, `SET ROLE`, production credentials, or secrets in commits.
2. A real, server-controlled organisation membership resolver and reviewer role source. Neither may accept tenant/role claims from browser JSON.
3. A staging-only, guarded API route that wires `authenticateEvidenceRequest`, `createAuthenticatedEvidenceService`, `createNeonEvidenceDatabase` and `createRestrictedNeonEvidencePool`. Explicit feature flag off by default.
4. Two verified staging identities with distinct subjects: researcher and independent reviewer in the same test organisation. Do not create or claim real identities without confirming the provider supports them.
5. Confirm the Bun SQL driver executes BEGIN, tenant setting, evidence queries and COMMIT on the same physical connection, including concurrent requests. Confirm connection close/release semantics.
6. Confirm role privilege inheritance and schema/table grants through **direct login** as the dedicated restricted role; prove RLS denies cross-tenant reads and writes.

## Synthetic acceptance scenarios (all required)
- Anonymous request rejected; expired/revoked session rejected; unverified email rejected.
- Researcher submit succeeds through HTTP, with evidence source IDs, provenance and digest; duplicate idempotency key returns the same pending record; conflicting key fails.
- Same subject self-review rejected; unrelated tenant reviewer rejected; unauthorised role rejected.
- Independent reviewer accepts, rejects, or requests revision on separate synthetic snapshots; append-only review event persisted.
- Two concurrent reviewers racing on the same snapshot produce exactly one decision; no duplicate or overwritten event.
- Failed event or update rolls back the entire transaction.
- Cross-tenant SELECT/INSERT/UPDATE and forged tenant fields denied.
- Researcher UI displays pending, final status, source provenance and review history with no manual SQL.
- Synthetic records are cleaned up only via staging-owner controlled cleanup; verify zero residue.

## Release evidence required
For every scenario record UTC timestamp, branch/SHA, staging branch ID, CI run, redacted HTTP status/response, relevant row counts, reviewer/tenant pseudonyms, pass/fail, and cleanup verification. No secrets, personal information, raw tokens, or patient data.

**NO-GO** until all mandatory scenarios pass and security/scientific governance reviewers sign off. Do not activate production routes or modify production Neon.
