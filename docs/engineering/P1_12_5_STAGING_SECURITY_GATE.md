# P1.12.5 — Staging evidence security validation

## Verified read-only inspection (2026-11-11)
Explicit non-production Neon project `red-wave-06625195`, branch `br-patient-wind-zaqag54x`: `hsi_evidence_app` has `rolcanlogin=false`, `rolbypassrls=false`; 5 evidence table RLS policies exist. This query was read-only and ran as `neondb_owner`. It **does not** demonstrate actual application-role isolation or end-to-end writes.

## Implemented
- Read-only, explicitly staging-pinned inspection utility: `scripts/inspect-evidence-staging-gate.ts`.
- Unit tests for staging pin, dedicated LOGIN, non-superuser, non-BYPASSRLS, FORCE RLS and policy presence.
- No SQL migrations, role changes, data inserts or production modifications.

## Blockers before live E2E
1. Independently approve/provision a dedicated non-owner, non-BYPASSRLS LOGIN role and scoped privileges in isolated staging. Existing `hsi_evidence_app` is NOLOGIN.
2. Resolve organisation membership from a trusted HSI server-side source and wire the P1.12.2 authentication adapter.
3. Validate real app-role cross-tenant SELECT, INSERT, UPDATE denial, reviewer independence, idempotency and concurrent decisions using synthetic records, with rollback and cleanup.
4. Review the existing evidence schema and policies for privilege completeness and ensure audit events are append-only.
5. Run full CI, then request security review. Do not enable public routes or deploy to production.

## CI checks
`bun run typecheck`
`bun test test/evidenceStagingGate.test.ts test/restrictedNeonEvidencePool.test.ts test/neonEvidenceDatabase.test.ts test/governedEvidenceApi.test.ts`

Do not report a passed live integration test until a real restricted-role transaction has executed successfully on the pinned staging branch.
