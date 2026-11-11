# P0.2.11 — Restricted procedure adapter and authenticated E2E (interim)

**NO-GO**. This change replaces direct contradiction-table reads/writes in the application adapter with the restricted database create/review procedures. A separate `runtimeDatabaseUrl` is mandatory. The adapter verifies runtime-role membership and rejects BYPASSRLS/superuser connections. Staging activation remains blocked by the existing flags.

## Critical security prerequisites
- Provision a dedicated LOGIN principal without default Neon admin/read-only/read-write blanket privileges. Grant membership only in `hsi_contradiction_runtime`, and verify it has no direct ledger table DML. Store its password only in the deployment secret manager.
- Four isolated Neon Auth test accounts exist, but remain unverified; no genuine sessions or positive authenticated E2E are available. Use actual verified sign-in, never synthetic session inserts.
- Scientific snapshot fields are still supplied by the caller; migration 029 enforces field consistency but not approved-source authenticity. Production scientific promotion must remain blocked.
- No HTTP E2E, two-tenant denial matrix, concurrency tests or independent security sign-off has passed.
- Reviewer validation occurs in the restricted database function; app role checks are not relied on as the authoritative reviewer permission gate.
- The preflight app-side `authenticateHsiNeonSession` still requires a separate DB connection for preparing canonical snapshots; review and minimize its privilege in the next security iteration.

## Next execution
1. Review CI and adapter changes.
2. Provision restricted staging-only LOGIN through an approved secure secret workflow.
3. Complete verified test account sign-in and capture token-free receipts.
4. Run positive create/read/review and negative cross-tenant, forged/expired/revoked, self-review, duplicate, concurrency, RLS and provenance tests.
5. Independent security sign-off; retain migration holds and production NO-GO until all gates pass.
