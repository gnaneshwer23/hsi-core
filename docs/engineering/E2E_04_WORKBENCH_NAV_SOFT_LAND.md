# PR-E2E-04 — Workbench nav reconnect soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** 1.0 Ask→evidence→graph→verify→brief journey acceptance, invented route counts, or scientific approval.

Binding backlog row: [`docs/implementation/02-prioritised-backlog.md`](../implementation/02-prioritised-backlog.md) — **PR-E2E-04**.  
Typed catalog: [`src/operations/e2e04WorkbenchNavSoftLand.ts`](../../src/operations/e2e04WorkbenchNavSoftLand.ts).  
Pending worksheet: [`operations/staging/e2e-04-workbench-nav.pending.json`](../../operations/staging/e2e-04-workbench-nav.pending.json).  
Implementation wiring: [#470](https://github.com/gnaneshwer23/hsi-core/pull/470).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Primary live path | `/research/workspace` |
| Legacy workbench URLs | Redirects / specialised tools — **do not rebuild** |
| `journeyAccepted` | Always `false` |
| Invented route-count marketing | **Forbidden** |
| Soft-land / #470 green = journey acceptance | **Forbidden** |

## What this soft-land adds

1. Typed inventory of seven nav reconnect surfaces.  
2. Mode assessor (`check` / `fixture`) that never claims journey acceptance.  
3. Nav honesty assessor for ops / agent pick-next copy.  
4. Pending JSON worksheet binding `#470` without over-claiming.

## Reuse (do not rebuild)

- `site/src/lib/workbenchPrimary.ts`  
- `site/src/lib/researchNavItems.ts`  
- `site/src/lib/siteRouteCatalog.ts`  
- Research home + authorised decision workbench  

## Owner next steps (not this PR)

1. Keep `/research/workspace` as the single primary live path.  
2. Confirm Ask→evidence→graph→verify→brief remains one-hop from research home/nav.  
3. Leave legacy workbench URLs as redirects or specialised tools.  
4. Record journey acceptance only after staging evidence for the full primary path.

## Explicit non-goals

- Rebuilding parallel workbench products  
- Inventing route-count claims from the catalog  
- Treating soft-land green as 1.0 journey acceptance  
