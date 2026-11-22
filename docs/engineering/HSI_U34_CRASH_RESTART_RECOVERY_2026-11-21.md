# U34 — Crash/restart recovery soft-land (21 November 2026)

**Phase:** Production readiness · ARCH-009 · Phase 1 scientific-engine hardening  
**Scope:** Soft-land in-process crash/restart recovery paths for an orphan RUNNING fence: same-attempt resume, committed-artifact reconciliation, or abandon-then-retry — each gated by a U31 recovery decision.  
**Not claimed (U34 alone):** Live OS multi-process E2E, research_admin credentials, Neon writes, scientific approval, or Gate C.  
**Follow-on:** **U38** fixture proves OS multi-process abandon-then-retry; Neon live / research_admin HTTP remain owner-gated.

## Change

1. `src/hsiAgentCrashRestartRecovery.ts` — crash simulation + three recovery paths.  
2. Honesty envelope: `implementedAsLiveMultiProcessE2E: false`.  
3. Continue after orphan resume uses existing `continueHsiCheckpointedExecution`.

## Paths

| Path | Behaviour |
|---|---|
| `resume_orphan_same_attempt` | Human `resume_orphan_running`; same attempt/version |
| `reconcile_committed_artifact` | Inspect + apply fenced artifact; no executor replay |
| `abandon_then_retry` | Mark failed → `recoverHsiCheckpoint` attempt+1 |

## Honesty

| Claim | Soft-land |
|---|---|
| In-process crash → recovery contracts | **Yes** |
| Live OS crash/restart E2E | **No** |
| Scientific approval / Gate C | **No** |

## Acceptance

- `bun test test/hsiAgentCrashRestartRecovery.test.ts test/hsiCheckpointedExecutor.test.ts test/hsiAgentRecoveryReconciliation.test.ts`  
