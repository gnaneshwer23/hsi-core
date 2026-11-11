# P0.2.3 — Tenant-isolated contradiction persistence

**NO-GO.** SQL migrations 024 and 025 are both held. No Neon writes or public API routes.

## Proposed schema changes
- Membership records bind tenant, principal, and researcher/reviewer role. Memberships are default-deny with FORCE RLS.
- Review events have a composite foreign key to their contradiction record's **same tenant**, preventing cross-tenant review linkage.
- Contradiction and review records retain immutable write-once triggers from migration 024.

## Missing security work before activation
1. Resolve verified Neon Auth principal on the server, independently from request body.
2. Implement non-spoofable database identity binding; ordinary clients must not be able to set a principal or tenant via `set_config`/GUCs.
3. Create narrowly scoped RLS policies for SELECT and INSERT, with membership checks and reviewer authority checked in the **same transaction**.
4. Ensure review events' submitted_by equals parent record's submitter, not arbitrary caller input.
5. Verify unique review/idempotency policy, concurrent review races, append-only triggers and revocation semantics.
6. Run migration and E2E on isolated HSI staging only after approval, with two independently verified users across two tenants.
7. Capture negative tests for forged identity, cross-tenant SELECT/INSERT, unauthorized reviewer, self-review, UPDATE/DELETE, privilege bypass, and rollback.

This PR implements the relational schema boundary only. It does not claim a functional authenticated persistence service.
