# U24 — Agent checkpoint resume + reconciliation apply (21 November 2026)

**Phase:** Production readiness · ARCH-009 agent backend  
**Scope:** Close the documented gap that checkpointed executors could only claim a *fresh* fence — recovered RUNNING attempts and committed-artifact reconciliation had no apply/continue path.  
**Not claimed:** Live multi-process E2E, research_admin recovery credentials, Neon write enablement, scientific approval, or NEXT-E locked equal-budget acceptance.

## Change

1. `continueHsiCheckpointedExecution` — resume an explicitly recovered RUNNING checkpoint without `startHsiCheckpoint`.  
2. `applyHsiCommittedArtifactReconciliation` — CAS-complete from a single fenced artifact with **no executor replay**.  
3. Unit tests for resume and apply paths.

## Honesty

| Claim | Soft-land |
|---|---|
| Restart-safe resume after human recovery | Engineering path exists in-process |
| Crash-window artifact reconciliation apply | Engineering path exists; staging multi-process E2E still owner-gated |
| Live agent workloads / public CTAs | Still **not** approved (ARCH-009 Phase 2 sign-off) |

## Acceptance

- `bun test test/hsiCheckpointedExecutor.test.ts test/hsiAgentRecoveryReconciliation.test.ts`  
- No migration / write / landing changes  

## Follow-ons

- Disposable Neon multi-process E2E (owner)  
- Authenticated research_admin recovery E2E  
- NEXT-E equal-budget still blocked on NEXT-A–D  
