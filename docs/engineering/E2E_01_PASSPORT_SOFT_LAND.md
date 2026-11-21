# PR-E2E-01 — Context Passport soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** invented context values, scientific approval, production writes, or live journey acceptance.

Binding backlog row: [`docs/implementation/02-prioritised-backlog.md`](../implementation/02-prioritised-backlog.md) — **PR-E2E-01**.  
Typed catalog: [`src/operations/e2e01PassportSoftLand.ts`](../../src/operations/e2e01PassportSoftLand.ts).  
Pending worksheet: [`operations/staging/e2e-01-passport.pending.json`](../../operations/staging/e2e-01-passport.pending.json).  
Implementation wiring: [#469](https://github.com/gnaneshwer23/hsi-core/pull/469).  
A2.1 passport UI: [#449](https://github.com/gnaneshwer23/hsi-core/pull/449).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Missing fields | Stay **Not stated / Not extracted** |
| Invented tissue / dose / species | **Forbidden** |
| Scientific approval | **Forbidden** |
| Production writes | **Forbidden** |
| Soft-land green = journey acceptance | **Forbidden** |

## What this soft-land adds

1. Typed inventory of seven passport surfaces on the default investigation path.  
2. Mode assessor (`check` / `fixture`) that never permits invented context.  
3. Passport honesty assessor for ops / agent pick-next copy.  
4. Pending JSON worksheet binding `#469` / `#449` without over-claiming.

## Reuse (do not rebuild)

- `evidenceContextPassport` builder  
- `EvidenceContextPassportView`  
- Investigation workspace + graph experience mounts  
- Live brief passport helpers  

## Owner next steps (not this PR)

1. Keep passport visible on the primary investigation path with missing fields explicit.  
2. Do not invent context or enable production writes from catalog green.  
3. Brief column / gate acceptance remains PR-E2E-07 and owner gates.  
4. Journey acceptance stays blocked until staging evidence exists.

## Explicit non-goals

- New DB / microservice / homepage redesign  
- Inventing experimental context values  
- Claiming scientific approval or journey acceptance  
