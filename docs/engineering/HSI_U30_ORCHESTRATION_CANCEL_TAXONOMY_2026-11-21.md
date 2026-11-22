# U30 — Orchestration cancel / termination taxonomy (21 November 2026)

**Phase:** Production readiness · ARCH-009 · Phase 1 scientific-engine hardening  
**Scope:** Classify why an orchestration stopped (`parent_signal`, `wall_clock_budget`, `task_timeout`, `policy_denied`, `unknown`) without claiming side effects were undone.  
**Not claimed:** Live agent approval, multi-process E2E, or scientific validation.

## Change

1. `src/hsiAgentOrchestrationCancel.ts` — cancel record schema + classifier.  
2. `HsiOrchestrationResult.termination` — populated on cancelled runs and classified failures.  
3. Honesty limitations include the classified reason.

## Honesty

| Claim | Soft-land |
|---|---|
| Structured cancel reasons | **Yes** (in-process) |
| Side effects undone | **No** (`externalSideEffectsUndone: false`) |
| Scientific approval | **No** |

## Acceptance

- `bun test test/hsiAgentOrchestrationCancel.test.ts test/hsiAgentOrchestrationBudget.test.ts test/hsiAgentOrchestrator.test.ts`  
