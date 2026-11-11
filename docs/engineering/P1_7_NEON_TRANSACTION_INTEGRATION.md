# P1.7 — Live Neon Transaction Integration Foundations

## Delivered
- Driver-compatible Postgres transaction bridge using a pooled connection, BEGIN, transaction-local organization context, COMMIT/ROLLBACK and guaranteed release.
- Tests for commit, rollback, tenant scoping and invalid organization identifiers.
- Repair of P1.6 CI TypeScript syntax errors caused by literal escaped newlines.

## Verified Neon staging state
Neon project `red-wave-06625195`, branch `br-patient-wind-zaqag54x`: P1.4 tables exist with RLS and FORCE RLS. No permissive policies have been configured. This is **deny-default** for ordinary roles.

## Still required before a real authenticated end-to-end test
- Configure a non-owner, non-BYPASSRLS application role with explicit grants and reviewed tenant-specific policies. A transaction-local organization claim is **not authentication**; it must come from an independently verified trusted gateway.
- Wire a real Neon Postgres driver/pool into the server runtime; no production credentials in Git.
- Run synthetic submissions, duplicate/idempotent retries, review decisions, cross-tenant denial, concurrency and rollback against staging.
- Confirm event immutability and durable review queue. Review acceptance does not equal scientific validation.
- Do not apply migrations or modify production without explicit approval.

**Status:** bridge implemented; live Neon driver and end-to-end tests not yet executed; scientific release NO-GO.
