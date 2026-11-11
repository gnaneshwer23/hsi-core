# P0.2.7 — Isolated Neon staging migration execution receipt

**Decision: NO-GO — schema validation passed, authenticated E2E not completed.**

## Target
Neon project `red-wave-06625195`, isolated branch `br-shiny-cherry-zagwwdi8`, database `neondb`. Never executed against production.

## Executed and verified
- 024_hsi_scientific_contradiction_ledger: PASS (10 SQL statements, one transaction).
- 025_hsi_contradiction_tenant_isolation: PASS (6 SQL statements, one transaction).
- 026_hsi_contradiction_review_integrity: PASS (4 SQL statements, one transaction).
- 027_hsi_contradiction_authenticated_procedures: PASS (6 SQL statements, one transaction).
- SQL script splitter initially failed on a semicolon in a migration comment; retried with comment-aware splitting. Successful executions above.
- All three protected tables report `relrowsecurity=true`, `relforcerowsecurity=true`; ACL only `neondb_owner`.
- Database procedures `hsi_contradiction_create`, `hsi_contradiction_review`, `hsi_contradiction_session_principal` report `SECURITY DEFINER=true`, EXECUTE only for `neondb_owner`.
- Fake session token `invalid-fake-token-12345` calling `hsi_contradiction_create`: DENIED with `Invalid authenticated session`.

## Critical limitations
- Database migrations executed manually on the isolated branch only, **without updating production migration ledger or removing HELD_MIGRATION_IDS**.
- No dedicated least-privilege runtime role, no EXECUTE grant to runtime, no verified test researcher/reviewer sessions. The functions are not yet usable for authenticated application E2E.
- FORCE RLS with no allow policies likely blocks function-owner reads/writes; must implement a reviewed narrowly privileged role/policy design before any real persistence.
- No read procedure, real two-tenant tests, HTTP E2E, concurrent reviewer tests, revocation tests, or audit receipts.
- Caller-supplied create snapshot and source identifiers still require DB-side validation. Neither this receipt nor migration compilation proves scientific validity.
- Staging branch is cloned from production; use synthetic test data and avoid exposing tokens.
- No production changes; persistence activation remains disabled.

## Next gate
Implement a non-forgeable trusted database API with scoped RLS/owner semantics, grant only to a dedicated runtime role, and execute authenticated two-tenant positive/negative tests. Require independent security and scientific sign-off before activation.
