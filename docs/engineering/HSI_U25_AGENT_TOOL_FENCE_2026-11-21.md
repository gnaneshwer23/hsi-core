# U25 — Agent tool fence + orphan RUNNING refuse (21 November 2026)

**Phase:** Production readiness · ARCH-009 agent backend  
**Scope:** Soft-land external tool cancel/idempotency contract; refuse silent continue of orphan RUNNING checkpoints in bounded execution.  
**Not claimed:** Live multi-process E2E, research_admin recovery credentials, provider credentials, scientific approval, or live agent workload approval.

## Change

1. `src/hsiAgentToolFence.ts` — `runHsiFencedToolInvocation` + memory idempotency ledger (late-commit refuse after abort).  
2. `boundedAgentExecution` — RUNNING stage fences continue only when `recoverStage.stageId` matches; otherwise fail closed.  
3. Unit tests for fence outcomes and orphan RUNNING refusal.

## Honesty

| Claim | Soft-land |
|---|---|
| AbortSignal stops remote tools | **No** — cooperative only; adapters must fence |
| Orphan RUNNING auto-resume | **Forbidden** without explicit recovery |
| Live agent CTAs / Neon writes | Still not approved |

## Acceptance

- `bun test test/hsiAgentToolFence.test.ts test/boundedAgentExecution.test.ts`  
- No migrations / landing / write enablement  

## Follow-ons

- Wire adapters in production hosts to `runHsiFencedToolInvocation`  
- Owner multi-process + research_admin recovery E2E  
