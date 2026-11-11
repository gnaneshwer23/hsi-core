# HSI Research Beta — Staging integration execution (2026-11-11)

## Verified actions
- Created restricted LOGIN role `hsi_evidence_beta_app` on Neon project `<HSI_NEON_PROJECT_ID>`, staging branch `<HSI_STAGING_BRANCH_ID>` only.
- Role is NOSUPERUSER, NOBYPASSRLS, and LOGIN.
- Revoked the broad schema-wide SELECT grants and future default table SELECT grants created by Neon read_only provisioning.
- Granted membership in the existing scoped `hsi_evidence_app` role with INHERIT TRUE and SET FALSE.
- **Direct authenticated SQL connection** as `hsi_evidence_beta_app` verified SELECT/INSERT on evidence snapshots, INSERT on review events, no DELETE on review events, and no SELECT on unrelated `hsi_claims`.
- Configured encrypted, server-side Vercel preview variable `HSI_EVIDENCE_STAGING_DATABASE_URL` on project `hsi-core`, scoped only to Git branch `feat/research-beta-staging-e2e-20261111`. Secret value is not committed here.
- Production Neon branch and production Vercel environment were not modified.

## Still not executed
- Application handler remains unmounted/disabled; no verified live researcher/reviewer sessions or server-side membership resolver are connected.
- No HTTP synthetic submission/review requests or UI workflow have run.
- No proof of Bun SQL transaction affinity or concurrent review under real application connections.
- No staging preview deployment or production release is asserted.

## Mandatory next implementation
1. Wire the real provider-authenticated research session and trusted server-side organisation membership resolver.
2. Bind the server-only evidence service and Neon pool to the preview-scoped variable; never fall back to `DATABASE_URL` or the owner connection.
3. Add an explicit staging-only route/feature flag with origin, authorization, request-size, and rate controls.
4. Execute two distinct real test sessions (researcher/reviewer) and synthetic submission, review, idempotency, cross-tenant, rollback and concurrent-review scenarios.
5. Verify researcher-visible provenance and status in the UI, cleanup, and security sign-off.

**Release decision: NO-GO.** This record documents configuration and direct DB connectivity, not end-to-end acceptance.
