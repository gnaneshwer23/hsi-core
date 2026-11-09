# ARCH-009 — Recovery Reconciliation and Independent-Worker E2E Assessment
Date: 2026-11-04
Disposition: PARTIAL E2E; runtime operational sign-off remains blocked.

## Isolation
Neon project hsi-neon-project. Disposable child branch hsi-disposable-branch, parent HSI staging hsi-staging-branch. No production changes. Test branch intentionally retained until explicit deletion approval.

## Executed against isolated branch
- First SQL connection claimed synthetic checkpoint e2e-disposable-20261104-a (1 inserted).
- Second claim with identical identity returned zero rows.
- Inserted one immutable synthetic artifact with matching attempt/version/input hash.
- Separate read joined the running checkpoint to the durable artifact (crash-window reconciliation evidence).
- Completed checkpoint with version=1 CAS, advancing to version=2.
- Stale version=1 UPDATE affected zero rows.
- Late artifact INSERT rejected by the database trigger with HSI stale execution fence.
- All test data remains only in disposable child branch.

## Source changes
- src/hsiAgentRecoveryReconciliation.ts: read-only interrupted checkpoint inspection; completed checkpoints never replayed; one matching artifact eligible for reconciliation; missing/multiple artifacts require manual recovery; changed fingerprint rejected.
- src/db/hsiNeonReconciliationReader.ts: guarded Neon read adapter.
- test/hsiAgentRecoveryReconciliation.test.ts: matching, missing, ambiguous, fingerprint cases.

## Not yet demonstrated
- Actual two independent agent worker processes, OS process termination and restart.
- Recovery decision via authenticated research_admin session.
- Transactional reconciliation completion via backend service (current source inspects; human/operator must initiate fenced CAS).
- Safe cancellation/idempotency of real external tools.
- Full scientific-review round and fingerprint version migration.
- Latest CI confirmation.

## Decision
Database concurrency and fencing: PASSED for tested SQL cases.
Read-only recovery inspection: IMPLEMENTED, CI pending.
Full live research runtime: NOT APPROVED.
Production: UNCHANGED.
