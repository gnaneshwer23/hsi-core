# PR-E2E-07 — Brief passport columns soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** exportable brief acceptance, verification gate pass, invented biological context, or scientific approval.

Binding backlog row: [`docs/implementation/02-prioritised-backlog.md`](../implementation/02-prioritised-backlog.md) — **PR-E2E-07**.  
Typed catalog: [`src/operations/e2e07BriefPassportSoftLand.ts`](../../src/operations/e2e07BriefPassportSoftLand.ts).  
Pending worksheet: [`operations/staging/e2e-07-brief-passport.pending.json`](../../operations/staging/e2e-07-brief-passport.pending.json).  
Implementation wiring: [#471](https://github.com/gnaneshwer23/hsi-core/pull/471).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Passport columns + verification + limitations | Reused |
| `briefAccepted` / `verificationGatePassed` | Always `false` |
| Invented biological context | **Forbidden** |
| Locator (PMID/DOI) = proof of support | **Forbidden** |
| Soft-land / #471 green = brief acceptance | **Forbidden** |

## What this soft-land adds

1. Typed inventory of seven brief / passport surfaces.  
2. Mode assessor (`check` / `fixture`) that never claims brief acceptance.  
3. Brief honesty assessor for ops / agent pick-next copy.  
4. Pending JSON worksheet binding `#471` without over-claiming.

## Reuse (do not rebuild)

- `src/investigation/liveBriefPassport.ts`  
- Passport evidence table + live claim edge mapping  
- Live brief / brief v2 export  
- `site/src/lib/researchBrief.ts`  

## Owner next steps (not this PR)

1. Keep passport columns source-linked with visible verification + limitations.  
2. Do not treat harness green or locators as gate pass / proof.  
3. Accept the exportable brief exit only after staging journey evidence.

## Explicit non-goals

- Inventing missing biological context fields  
- Claiming verification gate pass from dual-provider harness green  
- Treating soft-land green as exportable brief acceptance  
