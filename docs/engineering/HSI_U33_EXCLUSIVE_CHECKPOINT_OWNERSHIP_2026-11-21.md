# U33 — Exclusive checkpoint ownership race (21 November 2026)

**Phase:** Production readiness · ARCH-009 · Phase 1 scientific-engine hardening  
**Scope:** Soft-land the multi-worker checklist that concurrent claimers yield exactly one checkpoint owner, and that stale finish attempts conflict after the owner advances the fence.  
**Not claimed:** Live OS multi-process E2E, research_admin credentials, Neon writes, scientific approval, or Gate C.

## Change

1. `src/hsiAgentExclusiveCheckpointOwnership.ts` — `raceHsiExclusiveCheckpointOwnership` (concurrent `startHsiCheckpoint` race).  
2. `refuseHsiStaleWorkerCheckpointFinish` — owner completes, stale finish conflicts.  
3. Honesty envelope: `exclusiveOwnerCount: 1`, `implementedAsLiveMultiProcessE2E: false`.

## Honesty

| Claim | Soft-land |
|---|---|
| Exactly one in-process claimer owns the fence | **Yes** (CAS race) |
| Live two-OS-process E2E | **No** (`implementedAsLiveMultiProcessE2E: false`) |
| Scientific approval / Gate C | **No** |

## Acceptance

- `bun test test/hsiAgentExclusiveCheckpointOwnership.test.ts test/hsiAgentDurableCheckpoint.test.ts`  
