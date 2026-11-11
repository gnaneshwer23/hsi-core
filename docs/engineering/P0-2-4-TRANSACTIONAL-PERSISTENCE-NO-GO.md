# P0.2.4 — Transactional contradiction store (NOT ACTIVATED)

This PR adds authenticated transaction implementations, **not a live persistence capability**.

## Current status
- PR #228 must merge before this service can be integrated.
- Migrations 024 and 025 are still held. No schema applied or database modified.
- No authenticated HTTP route is mounted.
- Database RLS allow policies, role grants and trusted DB identity binding are not implemented.
- The two new unit tests assert only that unactivated writes fail; they are **not** E2E security evidence.
- Existing reviewer authority supports only SSc/RA. Generalized disease-scoped reviewer grants need design.

## Critical security requirements
The service checks Neon Auth and tenant membership but these application queries **do not replace DB-enforced tenant isolation**. Never enable `HSI_CONTRADICTION_STAGING_ACTIVATED` or pass the activation approval flag until:
1. The DB connection role has no BYPASSRLS or ownership bypass; FORCE RLS is verified.
2. SQL policies restrict both tenant membership and contradiction/review writes, with identity bound by trusted server mechanisms inaccessible to clients.
3. A DB constraint or trigger checks review submitter equals the parent record's submitter.
4. Distinct real researcher/reviewer accounts and two tenants prove cross-tenant SELECT/INSERT denied, self-review denied, immutable UPDATE/DELETE denied, reviewer revocation effective.
5. Review idempotency and concurrent decisions are resolved; transaction isolation and rollback tested.
6. Migration 024/025 staged with rollback and recorded approvals, without production credentials.
7. Actual authenticated HTTP E2E is run and attached as evidence to the activation gate.

**Do not merge and enable as if production ready.** Scientific findings remain unadjudicated.
