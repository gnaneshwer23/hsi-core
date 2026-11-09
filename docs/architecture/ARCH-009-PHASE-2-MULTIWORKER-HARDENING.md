# ARCH-009 Phase 2 — Multi-Worker, Cancellation and Idempotency
Date: 2026-11-04
Status: Implemented, staging SQL smoke passed, latest CI pending.

## Delivered
- Versioned checkpoint CAS and authenticated recovery retained.
- Migration 010 adds immutable, checkpoint-fenced research artifacts.
- A database trigger locks the checkpoint row and refuses inserts when attempt/version/hash/state no longer match.
- The Neon artifact adapter uses a transaction and idempotency keys scoped to investigation, task, input hash and logical output ID. Different content under the same key is rejected.
- The orchestrator now propagates AbortSignal to executors on cancellation or timeout. Checkpoint wrapper refuses completion after cancellation.
- Unit tests cover idempotency, stale-worker fencing and conflicting output.

## Staging execution
- Migration 010 applied to HSI staging branch hsi-staging-branch, not production.
- SQL rollback test: initial artifact insert, duplicate key ignored, checkpoint completed, stale artifact rejected, test records rolled back.
- No patient-identifiable data used.

## Important boundaries
- AbortSignal is cooperative; arbitrary external side effects still require tool-specific cancellation/idempotency.
- Multi-process crash/restart and authenticated end-to-end recovery have NOT yet been demonstrated.
- No automatic replay of completed scientific tasks; no scientific claim approval or graph publication.
- No production database migration or deployment.

## Sign-off gates
- [x] Staging artifact fence trigger installed and rollback SQL test passed.
- [x] Tool-output idempotency design implemented.
- [x] AbortSignal propagated to executor interface.
- [ ] Latest full CI green.
- [ ] Two independent processes demonstrate exactly one checkpoint owner.
- [ ] Server crash/restart and stale-worker recovery E2E.
- [ ] External tool adapter cancellation and idempotency audit.
