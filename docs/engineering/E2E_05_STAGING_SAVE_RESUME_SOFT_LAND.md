# PR-E2E-05 — Staging investigation save/resume soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** production writes, migration hold removal, signed persistence acceptance, live owned-list evidence, or scientific approval.

Binding backlog row: [`docs/implementation/02-prioritised-backlog.md`](../implementation/02-prioritised-backlog.md) — **PR-E2E-05**.  
Typed catalog: [`src/operations/e2e05StagingSaveResume.ts`](../../src/operations/e2e05StagingSaveResume.ts).  
Graph workspace flag runbook: [`GRAPH_WORKSPACE_FLAG_RUNBOOK.md`](./GRAPH_WORKSPACE_FLAG_RUNBOOK.md).  
Pending worksheet: [`operations/staging/e2e-05-staging-save-resume.pending.json`](../../operations/staging/e2e-05-staging-save-resume.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Default save path | Device-local `localStorage` |
| Server graph-workspace store | Owner-gated staging flags only |
| Production `writesEnabled` | Always `false` here |
| Migrations 031–033 | Holds **unchanged** in git |
| `acceptedForScope` | Always `false` |
| Fixture / unit samples | Not live owned-list evidence |

## What this soft-land adds

1. Typed inventory of five persistence paths (device-local default → production writes refuse).  
2. Mode assessor (`check` / `fixture`) that never enables production writes or claims acceptance.  
3. Owner precondition list aligned with the graph-workspace flag runbook.  
4. Pending JSON worksheet with blocked ops acceptance.

## Reuse (do not rebuild)

- `src/db/graphWorkspaceWriteGate.ts`  
- `src/server/graphWorkspaceApi.ts` (gated Neon adapter entry)  
- `src/knowledgeGraph/investigationStore.ts`  
- Dashboard access-state honesty (`site/src/lib/dashboardAccessState.ts`)

## Owner next steps (not this PR)

1. Apply 031–033 on disposable/staging HSI Neon out-of-band.  
2. Enable staging writes pins + `HSI_GRAPH_WORKSPACE_STORE_ENABLED=true`.  
3. Save → list → resume as a granted researcher; prove cross-tenant denial.  
4. Unset flags; keep production writes disabled.

## Explicit non-goals

- Removing ids from `HELD_MIGRATION_IDS`  
- Setting production `HSI_RESEARCH_WRITES_ENABLED`  
- Inventing staging URLs or signer names  
- Claiming scientific approval or pilot readiness  
