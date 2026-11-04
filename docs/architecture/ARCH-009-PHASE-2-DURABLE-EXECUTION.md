# ARCH-009 Phase 2 — Durable Execution and Adapter Milestone
Date: 2026-11-04
Status: Implemented in source; latest CI pending; persistence integration NOT deployed.

## Implementation
- src/hsiAgentOrchestrator.ts: bounded dependency-aware execution and role-based permission checks.
- src/hsiAgentDurableCheckpoint.ts: atomic compare-and-swap checkpoint store interface, versioned checkpoint hash, explicit operator recovery with maximum three attempts, no replay of completed/running tasks.
- src/hsiArch003AgentAdapters.ts: adapters for the existing deterministic SSc question planner and falsification analysis. Output persistence is injected by the caller and must be trusted.
- Tests: hsiAgentOrchestrator, hsiAgentDurableCheckpoint and hsiArch003AgentAdapters.
- Denied tool attempts are preserved in run traces without being counted as authorised tool executions.

## Limits and open gates
1. No actual durable database adapter, deployment or database migration exists. In-memory tests prove the interface semantics only, not restart survival.
2. The orchestrator is not yet wired to checkpoint storage; execution results are in-process. Do not call it resumable until this is integrated and tested across process restarts.
3. Timeout via Promise.race does not stop an executor's side effects. Before external tools, add cooperative AbortSignal, isolation, lease/fencing tokens and idempotency keys. A timed-out tool must not commit a late result.
4. Recovery is operator-authorised by a nonempty identifier at the contract level; authentication, authorisation and append-only approval auditing must be enforced by a trusted backend.
5. Fingerprint versioning and multi-round scientific review remain separate migration/design dependencies. Never overwrite historical decisions.
6. Agent adapters are deterministic. No claim of autonomous multi-agent research or real scientific validation.
7. Phase 2 production or staging deployment requires explicit permission and completed integration/safety tests.

## Next acceptance gates
- CI passes full test/build/validation.
- Trusted Neon staging checkpoint adapter with atomic transaction and schema migration.
- Server-verified operator grants and immutable recovery decision log.
- Abort-aware executors with idempotent output sink and fencing.
- Restart/recovery tests against staging.
- No PHI exposure or autonomous scientific approval.
