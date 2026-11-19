# PR-E2E-08 — Onboarding profile store soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** `schemaApplied`, migration 023 lift, production writes, multi-device durable sync, or scientific approval.

Binding backlog row: [`docs/implementation/02-prioritised-backlog.md`](../implementation/02-prioritised-backlog.md) — **PR-E2E-08**.  
Typed catalog: [`src/operations/e2e08OnboardingProfileSoftLand.ts`](../../src/operations/e2e08OnboardingProfileSoftLand.ts).  
Pending worksheet: [`operations/staging/e2e-08-onboarding-profile.pending.json`](../../operations/staging/e2e-08-onboarding-profile.pending.json).  
Runbook: [`ONBOARDING_PROFILE_STORE_RUNBOOK.md`](./ONBOARDING_PROFILE_STORE_RUNBOOK.md).  
Implementation wiring: [#473](https://github.com/gnaneshwer23/hsi-core/pull/473).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Default path | Device-local `localStorage` |
| `schemaApplied` / `acceptedForScope` | Always `false` |
| Migration 023 | **Held** — never lifted here |
| Memory rehearsal store = durable sync | **Forbidden** |
| Production host enablement | **Forbidden** |

## What this soft-land adds

1. Typed inventory of seven onboarding-profile surfaces.  
2. Mode assessor (`check` / `fixture`) that never claims schema applied.  
3. Profile honesty assessor for ops / agent pick-next copy.  
4. Pending JSON worksheet binding `#473` without over-claiming.

## Reuse (do not rebuild)

- `src/db/onboardingProfileWriteGate.ts`  
- `src/server/onboardingProfileApi.ts`  
- Memory rehearsal store + researcher profile  
- Client sync helper + migration holds  
- Existing owner runbook  

## Owner next steps (not this PR)

1. Keep localStorage default until staging pins + flag + additive backend.  
2. Do not lift 023 for this path alone unless an owner packet says so.  
3. Tear down staging rehearsal after honesty-status checks.  
4. Never enable on a production host.

## Explicit non-goals

- Removing 023 from held migrations  
- Claiming multi-device durable sync from memory store  
- Production writes or community/digest features  
