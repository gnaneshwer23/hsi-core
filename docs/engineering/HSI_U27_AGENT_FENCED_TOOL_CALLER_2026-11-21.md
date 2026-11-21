# U27 — Fenced tool caller host wiring (21 November 2026)

**Phase:** Production readiness · ARCH-009 agent backend · Phase 1 of end-to-end vision  
**Scope:** Host helper that combines `assertTool` authorization with `runHsiFencedToolInvocation`, and wire it into bounded evidence retrieval + mechanism analysis stages.  
**Not claimed:** Live agent workload approval, third-party tool credentials, scientific approval, or multi-process E2E.

## Change

1. `src/hsiAgentFencedToolCaller.ts` — stable `investigation:task:tool:attempt-N` idempotency keys + `createHsiFencedToolCaller`.  
2. `src/evidence/boundedAgentExecution.ts` — stages receive `invokeFencedTool`; literature.search and graph.query/evidence.get run through the fence.  
3. Late commits after abort still refuse; authorization failures never reach adapters.

## Honesty

| Claim | Soft-land |
|---|---|
| External adapters fully hardened | **Partial** — retrieval + mechanism stages wired; other stages still authorize-only |
| Live agent / research_admin E2E | Still open |
| Scientific approval | **No** |

## Acceptance

- `bun test test/hsiAgentFencedToolCaller.test.ts test/boundedAgentExecution.test.ts`  
- No migrations / landing / write enablement  

## Follow-ons

- Wire remaining bounded stages through `invokeFencedTool`  
- Owner-gated multi-process cancellation E2E  
