# P0.2.5 — Database authorization enforcement and staging E2E

**Release status: NO-GO.** No Neon schema changes or migration execution.

This PR adds a **read-only** database authorization inspector and unit tests. Its `ready` output means only the inspected structural role/RLS checks passed; it is NOT the P0.2.1 activation gate and cannot prove correct row-level policies or trusted identity.

## Mandatory work before staging activation
1. Merge or reconcile outstanding PR #228 (authenticated service contract), if still required; PR #230 already has its own service implementation.
2. Security-review and implement trusted database principal binding; never trust a client-controlled tenant, principal, `SET ROLE`, or `set_config` value.
3. Add least-privilege grants and tenant-scoped RLS or audited security-definer procedures with fixed `search_path`, explicit transaction identity, and reviewer authority checks.
4. Run held migrations 024–026 only on an explicitly approved isolated staging branch. Do not alter production.
5. Test with two real independently verified Neon Auth identities in tenant A and a separate tenant B.
6. Prove cross-tenant SELECT/INSERT denial; unauthorized review denial; revoked membership denial; self-review, wrong submitter, duplicate/concurrent decision, UPDATE/DELETE denial; session forgery resistance.
7. Run authenticated HTTP E2E with DB receipts, confirm rollback, and submit all ten independent activation evidence artifacts for review.

## Current gaps
- Migrations 024–026 held.
- No tenant-aware RLS allow policies or trusted DB principal mechanism.
- No live authenticated HTTP E2E results.
- Scientific Ricard–Ly adjudication still pending.
