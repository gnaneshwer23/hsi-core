# P0.2.7 staging authorization and E2E hardening — interim acceptance

**Decision: NO-GO.** This is a security remediation checkpoint, not a staging acceptance certificate.

## Observed, read-only
Neon project `red-wave-06625195`; isolated branch `br-shiny-cherry-zagwwdi8`. Database `neondb` queried using `neondb_owner`. `hsi_reviewer_authority` and `neon_auth.session` exist; `hsi_contradiction_records` does not. Therefore ledger migrations are not yet applied on this branch.

## Remediation in this PR
- Database review function derives disease from BOTH stored canonical edges and rejects mismatch, unknown scope, missing reported status and missing source locator.
- Matching TypeScript validation and negative unit tests; do not interpret tests as live DB E2E.

## Remaining blockers before schema execution or activation
- Validate migration 024–027 SQL against disposable staging, including PostgreSQL FORCE RLS and function-owner privileges.
- Restrict function EXECUTE to a least-privilege runtime role; no direct DML on protected tables; never use user-controlled GUC identity.
- Verify create procedure's submitted snapshot is consistent with supplied edge IDs and source evidence, and does not accept forged metadata.
- Implement tenant-safe SELECT/read procedure and database grants with real two-tenant isolation tests.
- Use independent verified researcher/reviewer accounts, test revoked/expired/forged sessions, self-review, scope mismatch, concurrency, immutable rows, and rollback.
- Mount and exercise actual HTTP routes, capture sanitized request/response receipts.
- Independently review SSc evidence. Other domains remain preview/development, not verified.
- Reconcile PR #232 authorization audit.

No migration holds removed. No credentials created. No production database writes. No persistence activation.
