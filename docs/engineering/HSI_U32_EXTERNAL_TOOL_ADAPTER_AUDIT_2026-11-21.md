# U32 — External tool adapter cancel/idempotency audit (21 November 2026)

**Phase:** Production readiness · ARCH-009 · Phase 1 scientific-engine hardening  
**Scope:** Soft-land the multi-worker checklist audit that every registered tool adapter declares stable idempotency, cancel checks, and late-commit refusal; record late side-effect refusals against U30 termination reasons.  
**Not claimed:** Live multi-process adapter E2E, provider credentials, scientific approval, Gate C, or PHI dispatch.

## Change

1. `src/hsiAgentExternalToolAdapterAudit.ts` — catalog of required adapter controls for all `HSI_TOOL_IDS`.  
2. `buildHsiLateSideEffectAuditRecord` — links U25 `late_commit_refused` / `cancelled` outcomes to optional U30 termination reasons without claiming side effects were undone.  
3. `patient.context.get` remains `scientificPlaneDispatchAllowed: false`.

## Honesty

| Claim | Soft-land |
|---|---|
| Required cancel/idempotency controls catalogued | **Yes** (in-process) |
| Late side effect committed after abort | **No** (`lateSideEffectCommitted: false`) |
| Live multi-process adapter E2E | **No** (`implementedAsLiveMultiProcessE2E: false`) |
| Scientific approval / Gate C / PHI | **No** |

## Acceptance

- `bun test test/hsiAgentExternalToolAdapterAudit.test.ts test/hsiAgentToolFence.test.ts`  
