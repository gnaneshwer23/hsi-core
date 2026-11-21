# U28 — Remaining bounded-stage tool fences (21 November 2026)

**Phase:** Production readiness · ARCH-009 · Phase 1 scientific-engine hardening  
**Scope:** Route opposing-evidence, gap-assessment, hypothesis-comparison, and research-brief stages through `invokeFencedTool` / `unwrapHsiFencedToolSuccess`.  
**Not claimed:** Live agent approval, multi-process E2E, or scientific validation.

## Change

1. `unwrapHsiFencedToolSuccess` helper on the fenced tool caller.  
2. All bounded stages that authorize tools now invoke through the fence (retrieval → brief).  
3. Cooperative abort still refuses late commits.

## Honesty

| Claim | Soft-land |
|---|---|
| Every bounded tool path fenced | **Yes** (in-process bounded execution) |
| Live external provider adapters hardened | Still host/E2E open |
| Scientific approval | **No** |

## Acceptance

- `bun test test/hsiAgentFencedToolCaller.test.ts test/boundedAgentExecution.test.ts`  
