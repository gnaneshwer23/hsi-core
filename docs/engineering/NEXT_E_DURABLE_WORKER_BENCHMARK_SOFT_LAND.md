# NEXT-E — Durable worker / equal-budget benchmark soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** live locked benchmark acceptance, invented caps/model bindings, auto-promotion, or scientific approval.

Binding row: [`docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md`](../audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md) — **NEXT-E / P1**.  
Typed catalog: [`src/operations/nextEDurableWorkerBenchmarkSoftLand.ts`](../../src/operations/nextEDurableWorkerBenchmarkSoftLand.ts).  
Pending worksheet: [`operations/staging/next-e-durable-worker-benchmark.pending.json`](../../operations/staging/next-e-durable-worker-benchmark.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Checkpoint / worker / acceptance adapters | Reused |
| `liveBenchmarkAccepted` / `equalBudgetLocked` | Always `false` |
| Depends on | **NEXT-A** through **NEXT-D** |
| Invented caps / model bindings / accepted artifact | **Forbidden** |
| Auto-promotion into graph / release | **Forbidden** |
| Fixture green = locked equal-budget run | **Forbidden** |

## What this soft-land adds

1. Typed inventory of seven durable-worker / benchmark surfaces.  
2. Mode assessor (`check` / `fixture`) that never claims a locked run.  
3. Benchmark honesty assessor for ops / agent pick-next copy.  
4. Pending JSON worksheet with NOT_STARTED / UNASSIGNED refs.

## Reuse (do not rebuild)

- `src/hsiAgentDurableCheckpoint.ts` + checkpointed executor  
- Checkpoint recovery / Neon store adapters  
- `src/operations/immunoWorkerPlan.ts`  
- Immuno equal-budget acceptance gates  
- E2E-06 / NEXT-A provider composition soft-lands  

## Owner next steps (not this PR)

1. Accept NEXT-A through NEXT-D for the named scope/artifact.  
2. Authorize equal-budget caps and independent verifier model bindings.  
3. Resume from durable checkpoints; reconcile uncertain provider ops.  
4. Preserve all failures; publish redacted metrics/denominators/intervals for the exact artifact.  
5. Keep graph/release promotion as a separate human gate.

## Explicit non-goals

- Inventing caps, model bindings, or accepted artifacts in git  
- Treating fixture / soft-land green as locked equal-budget acceptance  
- Auto-promoting benchmark outcomes  
- Starting NEXT-F soak/pilot without this acceptance  
