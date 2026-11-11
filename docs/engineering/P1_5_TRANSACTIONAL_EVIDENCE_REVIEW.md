# P1.5 — Transactional Evidence Ingestion & Durable Review Foundations

This PR introduces a server-only, injected transaction adapter for draft evidence submission and independent scientific review. It uses parameterized SQL, tenant-scoped queries, idempotency keys, row locking, event insertion and status updates in a single transaction.

## Trust and deployment requirements
- **Not a deployed API.** The adapter expects a trusted server gateway to authenticate users and bind organization/role claims. A TypeScript principal object is not proof of identity.
- **Not a connected Neon database.** The injected `EvidenceDatabase` must be implemented with a real driver and `BEGIN/COMMIT/ROLLBACK` semantics, a tenant-scoped database role and reviewed RLS policies.
- **No migrations executed.** P1.4 SQL remains a proposal. Its deny-default RLS will block normal writes until approved least-privilege policies and a server transaction adapter are implemented and tested.
- **No durable queue worker.** Review events are designed to be durable only once a real database is connected. Queue delivery, retries, poison messages, event immutability and replay protection require implementation.
- **No scientific approval.** Review status `accepted` is a workflow decision, not independent verified scientific validation or public graph publication.

## Security acceptance tests still required
Real Postgres tests for transaction rollback, duplicate keys and concurrent review, RLS tenant isolation, forged session claims, independent reviewer authorization, event immutability, audit provenance, source response hash validation and staging migration rehearsal.

**Release:** development GO; production NO-GO.
