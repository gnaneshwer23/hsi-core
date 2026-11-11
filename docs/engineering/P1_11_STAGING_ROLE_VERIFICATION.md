# P1.11 — Staging Role Grants and Integration Blockers

## Actual Neon staging verification (2026-11-11)
Project `red-wave-06625195`, isolated branch `br-patient-wind-zaqag54x`.
Read-only privilege query verified `hsi_evidence_app`: NOLOGIN, NOBYPASSRLS, NOSUPERUSER; SELECT/INSERT/UPDATE on evidence snapshots; SELECT/INSERT but not UPDATE/DELETE on review events.

A restricted-role transaction attempt using `SET LOCAL ROLE hsi_evidence_app` failed with PostgreSQL SQLSTATE 42501 (`permission denied to set role`). No synthetic data was written. The Neon tool executes as `neondb_owner` and cannot impersonate the restricted role. This is not a failing tenant-isolation test: the test could not run.

## CI correction
P1.10 CI failed the migration ledger uniqueness check because two SQL filenames started with `20261111`. Renamed the proposed P1.9 migration to `20261112_p1_9_tenant_rls_staging_PROPOSED.sql`. The previously applied P1.4 schema and P1.9 policies remain unchanged.

## Remaining work (release NO-GO)
- Create an explicitly authorised server-side identity that can `SET ROLE hsi_evidence_app` or another reviewed secure role activation method. Never expose credentials to clients.
- Integrate a real Neon driver and existing signed-session verifier.
- Execute restricted-role synthetic staging E2E tests: no tenant, tenant A/B isolation, reviewer independence, idempotency, concurrency, rollback and append-only audit.
- Verify the branch CI and PR stack before merge. No production migration or live authenticated application flow was performed.
