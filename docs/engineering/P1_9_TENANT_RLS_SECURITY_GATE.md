# P1.9 — Tenant-scoped Neon security gate

## Delivered
- Proposed staging-only SQL migration granting least-privilege table access to a separately provisioned `hsi_evidence_app` role, with tenant-scoped SELECT, INSERT and UPDATE policies on snapshots, and SELECT/INSERT policies on review events.
- Corrected P1.6 test syntax that broke P1.7/P1.8 stacked CI.

## Security warnings
**Migration not applied.** The app role must be created/provisioned separately, not own either table, and must not have BYPASSRLS. Confirm schema/table ownership, privileges, existing policies and actual SQL role before staging migration approval. The app role should have no direct public/browser database access. The transaction-local `hsi.organization_id` value can be set by anyone who can issue arbitrary SQL with that role, so it is only defence in depth, not a security boundary by itself. A trusted signed-session gateway must verify tenant membership and roles and constrain all queries. For stronger isolation use per-tenant database roles or a tightly restricted server-side security-definer boundary with reviewed privileges.

## Required acceptance tests before production
1. Verify signed session, expiry, issuer, audience, revocation and organisation membership.
2. Verify anonymous role cannot read/write; no tenant claim returns no rows and denies writes.
3. Synthetic tenant A submission succeeds; tenant B cannot read/update it.
4. Researcher cannot self-review; independent reviewer can record exactly one decision.
5. Duplicate idempotency key is safe; concurrent conflicting writes roll back.
6. Audit events cannot be modified/deleted by the app role; accepted review never auto-publishes graph claims.
7. CI typecheck, lint, tests and build green on stacked branch.

No real driver integration, authenticated HTTP route, live staging write or production migration is claimed.
