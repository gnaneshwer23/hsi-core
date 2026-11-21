# U35 — Owner-authorized research agent runtime (21 November 2026)

**Phase:** Production readiness · ARCH-009 · first research-agent host after owner approval  
**Owner approval:** Explicit founder approval to build research agents (21 November 2026, Europe/London).  
**Scope:** Canonical owner-approval envelope + checkpointed SSc planner → contradiction runtime wiring orchestrator to durable checkpoint store.  
**Not claimed:** Gate C auto-approve, MoU, PHI/clinical plane, held Neon migrations, live multi-process staging E2E, general production deploy, or scientific validation.

## Change

1. `src/hsiResearchAgentAuthorization.ts` — owner approval envelope with fail-closed honesty flags.  
2. `src/hsiResearchAgentRuntime.ts` — `runHsiAuthorizedResearchAgentRuntime` (ARCH-003 adapters + `checkpointHsiExecutor` + orchestration).  
3. ARCH-009 operational sign-off updated: engineering research-agent runtime **owner-approved to build**; production deploy and live multi-process E2E still open.

## Honesty

| Claim | Soft-land |
|---|---|
| Owner authorized engineering research-agent runtime | **Yes** (2026-11-21) |
| Orchestrator wired to checkpoints for this path | **Yes** (in-process / injected store) |
| Scientific approval / Gate C / PHI | **No** |
| Live multi-process staging E2E | **No** |
| General production deploy | **No** |

## Acceptance

- `bun test test/hsiResearchAgentRuntime.test.ts test/hsiArch003AgentAdapters.test.ts test/hsiAgentOrchestrator.test.ts`  
