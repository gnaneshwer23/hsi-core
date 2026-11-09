# ARCH-009 Phase 2 — Staging Integration Validation
Date: 2026-11-04
Environment: HSI Neon project hsi-neon-project, staging branch hsi-staging-branch (NOT production).

## Executed
1. Confirmed branch identity and checked schema before migration.
2. Applied migration 009 in a single staging transaction; created checkpoint and recovery audit tables and immutable decision trigger.
3. Verified new tables initially empty and immutable trigger installed.
4. Executed rollback-contained SQL integration checks on staging: first claim succeeds, duplicate claim returns no row, CAS completion succeeds, stale version cannot overwrite completed checkpoint.
5. Executed rollback-contained audit test: UPDATE of a recovery decision rejected by immutable trigger.
6. Confirmed rollback left no test rows.
7. Added scripts/hsi-agent-staging-smoke.ts for repeatable environment-guarded staging verification.
8. Added admin recovery of stale-running checkpoints only after a 5–1440 minute threshold, authenticated research_admin grant, bounded attempt count and append-only audit transaction.

## Status and limitations
- Schema-level and direct SQL smoke tests PASSED.
- Neon application adapter and checkpointed executor passed repository CI prior to this milestone; latest CI still requires checking.
- The environment-guarded Bun smoke script was committed but not executed from this chat against Neon credentials.
- No process-kill/restart test, live authenticated admin recovery test, two-process race, or actual agent persistence E2E has been run.
- Promise.race timeout alone does not terminate non-cooperative side effects. External-tool cancellation, lease/fencing at output sink, and idempotency remain outstanding.
- A stale-running recovery is an administrator intervention, not automatic replay. No PHI, graph publication or autonomous scientific approval.
- Production branch hsi-production-branch untouched.

## Next hardening gates
- Full CI success.
- Execute Bun smoke script with staging-only credentials in isolated CI.
- Two independent workers, crash/restart and idempotent artifact storage tests.
- Cooperative AbortSignal propagation and late-write protection in all tool adapters.
- Authenticated research_admin recovery E2E and audit verification.
- Reviewer revision/fingerprint versioning separately tracked.
