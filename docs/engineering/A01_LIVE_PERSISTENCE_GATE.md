# A-01 live investigation persistence — deployment gate

Status: **CODE WIRED, DATABASE GATE BLOCKED. NOT PRODUCTION READY.**

## Implemented
- API service factory now accepts an optional `liveEvidenceRuntimeDatabaseUrl` and an explicit `liveEvidenceWritesEnabled` flag (defaults to false).
- Verified Better Auth/Neon research identity is derived server-side, not from a browser-supplied owner.
- Runtime SQL uses a separate database credential, checks non-superuser / non-BYPASSRLS role and FORCE RLS, and binds the authenticated owner with transaction-local `set_config`.
- Migration 030 contains a draft owner-scoped RLS policy; **030 remains HELD** in the migration runner. It is not automatically applied.
- Source rights and provenance restrictions are checked before insertion.

## Blockers before a preview smoke test
1. Independent security review of migration 030, RLS policy and a dedicated least-privilege runtime role. The migration still revokes PUBLIC privileges and deliberately does **not** grant any role. Provision explicit grants separately after review.
2. Explicit non-production host pin (`HSI_NEON_STAGING_HOST_PIN`), HSI project guard and a preview-only runtime database URL. The adapter rejects the production host.
3. Review and approve applying 030 **only to an isolated preview branch**, inspect existing data and privileges, then create the dedicated runtime role with no ownership or BYPASSRLS.
4. Validate session-to-principal ownership, cross-user isolation, same-key retry, source immutability, rollback, restart persistence, revoked research access, and upstream retrieval failure against preview Neon.
5. Record CI and actual database test evidence before enabling the flag in any deployment.

Do not deploy with `liveEvidenceWritesEnabled: true` until all blockers pass. No clinical data, graph promotion, or production migration is authorized by this PR.
