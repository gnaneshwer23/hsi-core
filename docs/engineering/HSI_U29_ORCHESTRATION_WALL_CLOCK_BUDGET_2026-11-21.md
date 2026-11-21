# U29 — Orchestration wall-clock budget (21 November 2026)

**Phase:** Production readiness · ARCH-009 · Phase 1 scientific-engine hardening  
**Scope:** Bound total multi-stage wall time separately from per-task `timeoutMs`.  
**Not claimed:** Live agent approval, multi-process E2E, or scientific validation.

## Change

1. `src/hsiAgentOrchestrationBudget.ts` — validate and combine parent + `AbortSignal.timeout` deadline.  
2. `runHsiAgentOrchestration({ maxOrchestrationMs })` — remaining tasks not started after budget; limitation recorded.  
3. Bounded execution defaults `maxOrchestrationMs` to `timeoutMsPerStage × stageCount`.

## Honesty

| Claim | Soft-land |
|---|---|
| Per-task timeouts remain | **Yes** |
| Wall-clock stops remote side effects | **No** — cooperative cancel only |
| Live agent workloads approved | **No** |

## Acceptance

- `bun test test/hsiAgentOrchestrationBudget.test.ts test/hsiAgentOrchestrator.test.ts test/boundedAgentExecution.test.ts`  
