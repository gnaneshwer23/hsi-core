# P0.2.1 — Scientific contradiction persistence activation (HOLD)

**State: NO-GO.** Migration 024 remains in `HELD_MIGRATION_IDS`. This change does not run SQL, modify Neon, grant roles, or expose routes.

## Required security design review
- Establish trusted researcher and reviewer identities using server-verified authentication, not request-body user IDs or client-set PostgreSQL session variables.
- Bind tenant and principal to each DB transaction through a reviewed, non-spoofable role/connection design; prove ordinary roles cannot override claims.
- Add tenant-scoped SELECT and INSERT policies to contradiction records and review events. The review-event tenant must match its parent record; enforce using a composite FK or trusted DB-side lookup.
- Require reviewer authority and independent reviewer identity in the database transaction. A different string is not sufficient evidence of independence.
- Preserve immutable snapshots and append-only review history. Define and test deletion/privileged bypass behaviour.
- Run migration 024 and a separate security policy migration only on an isolated HSI staging branch after owner approval.
- Test legitimate create/read/review, cross-tenant SELECT/INSERT, self-review, forged session identity, unauthorized updates/deletes, role privilege inventory and rollback.
- Exercise the real authenticated HTTP route with distinct researcher/reviewer accounts. Collect reproducible CI and DB receipts.

## Release gate
`evaluateContradictionActivationGate` requires ten independently evidenced checks. It is an internal checklist validator, **not** proof that any check passed. The gate must be wired into the actual deployment/activation workflow before being treated as enforcement.

## Scientific scope
Do not label Ricard–Ly as an adjudicated contradiction; Ly's parent gate and denominator remain unverified. No disease-specific database schema.
