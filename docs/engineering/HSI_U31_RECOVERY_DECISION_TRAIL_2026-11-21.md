# U31 — Recovery decision trail + bounded termination surface (21 November 2026)

**Phase:** Production readiness · ARCH-009 · Phase 1 scientific-engine hardening  
**Scope:** Explicit recovery decision contract (reason codes vs prior termination) and surface orchestration `termination` on bounded execution results.  
**Not claimed:** research_admin live E2E, Gate C auto-approve, MoU, or scientific approval.

## Change

1. `src/hsiAgentRecoveryDecision.ts` — recovery reason codes + compatibility with U30 termination.  
2. `BoundedAgentExecutionResult.termination` / `recoveryDecision` trail fields.  
3. Optional `recoverStage.reasonCode` validated before checkpoint recovery.

## Honesty

| Claim | Soft-land |
|---|---|
| Structured recovery decisions | **Yes** (in-process) |
| Live research_admin recovery E2E | **No** (`implementedAsLiveAdminE2E: false`) |
| Scientific approval / Gate C | **No** |

## Acceptance

- `bun test test/hsiAgentRecoveryDecision.test.ts test/boundedAgentExecution.test.ts`  
