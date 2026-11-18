# ADR-013: One identity binding (session verified in the database)

**Status:** Proposed — needs owner sign-off before RLS/procedure rework.
**Date:** 17 November 2026
**Source:** Engineering pack v1.1 § Database access model; build plan A3.1 (identity / isolation).
**Related:** ADR-012 (investigation store), ADR-014 (scopes), migrations 027 vs 030, Neon Auth gateway.

## Context
Two identity-binding models exist in the held/partial schema:

- **027 model:** `SECURITY DEFINER` functions verify the session and resolve the principal inside Postgres.
- **030 model:** trusts a server-set session variable such as `hsi.live_owner_id`.

Forged or stale session settings can cross tenants if the API alone is trusted. Isolation must hold even when the API has a bug.

## Decision
**One identity binding everywhere:**

1. Verify the authenticated session inside `SECURITY DEFINER` functions (027 pattern).
2. Resolve `hsi.current_principal()` (or equivalent) from that verified session — never from an app-supplied owner id alone.
3. Enforce ownership with RLS: user-owned rows require `owner_id = current_principal()`.
4. Reject forged settings, revoked sessions and cross-owner reads in the two-account isolation suite before any second researcher gets write access.

Do not apply held migrations that trust app-set owner variables until they are rewritten to this model.

## Consequences
- Cross-tenant isolation becomes testable in SQL, not only in TypeScript.
- API ownership checks remain; they are defence in depth, not the sole control.
- Graph workspace / clinical-plane paths stay on their own Neon pins; this ADR does not authorise PHI or shared Neon with other products.
- **Promotion constraint:** identity verification never implies scientific approval. A verified principal may draft; only scoped reviewers may decide; graph publication is a separate release step.

## Alternatives rejected
The 030 model that trusts a server-set `hsi.live_owner_id` as sufficient tenant proof.

## Revisit trigger
Neon Auth session verification semantics change, or an independent security review requires a different principal resolution path (record the replacement ADR; do not reintroduce app-trusted owner settings).
