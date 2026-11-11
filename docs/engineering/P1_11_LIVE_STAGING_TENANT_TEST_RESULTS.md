# P1.11 — Live restricted-role staging test results (2026-11-11)

Neon project `red-wave-06625195`, **isolated staging branch** `br-patient-wind-zaqag54x`. Production untouched.

## Role activation
`GRANT hsi_evidence_app TO neondb_owner WITH SET TRUE, INHERIT FALSE` was applied on staging to permit an existing trusted database-owner connection to assume the restricted NOLOGIN role for testing. The app role remains NOLOGIN, non-superuser and NOBYPASSRLS. This is a **test arrangement only**, not the application authentication integration or a recommended production grant. Review/revoke this membership when a proper dedicated server role is configured.

A read-only transaction with `SET LOCAL ROLE hsi_evidence_app` succeeded, effective `current_user` was `hsi_evidence_app`, and evidence tables returned zero rows without tenant context.

## Synthetic tenant-isolation test
A single staging transaction used `SAVEPOINT synthetic_test`, assumed `hsi_evidence_app`, set transaction-local `hsi.organization_id=p111_test_org_a`, inserted one synthetic pending-review snapshot, switched tenant context to `p111_test_org_b` and observed **0** matching rows, switched back to A and observed **1** matching row. Then `ROLLBACK TO SAVEPOINT synthetic_test` removed the synthetic insertion; final query found **0** synthetic records.

**Passed:** restricted role activation, own-tenant visibility, cross-tenant read filtering, rollback cleanup.

**Not yet tested:** cross-tenant write rejection, immutable review event insert, self-review denial through authenticated application, idempotency concurrency, signed-session verifier, actual Neon driver integration, application HTTP endpoints. The owner role's ability to SET ROLE is for isolated staging test only. This does not establish scientific production readiness.
