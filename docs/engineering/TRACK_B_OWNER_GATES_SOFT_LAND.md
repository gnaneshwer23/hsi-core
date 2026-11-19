# Track B — Owner / human-gated soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** signed policy, named DB reviewer, SME recruitment, approved floors, spend caps, pilot readiness, or MoU.

Binding plan row: [`docs/plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md`](../plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md) — **Track B**.  
Typed catalog: [`src/operations/trackBOwnerGates.ts`](../../src/operations/trackBOwnerGates.ts).  
Pending worksheet: [`operations/staging/track-b-owner-gates.pending.json`](../../operations/staging/track-b-owner-gates.pending.json).

## Honesty

| Gate | Soft-land |
| --- | --- |
| **B1** source clearance | DRAFT stays DRAFT; no invented signer |
| **B2** DB reviewer | UNASSIGNED; migration holds unchanged |
| **B3** SME reviewers | UNASSIGNED; dual review / gold stay empty |
| **B4** benchmark floors | NOT_APPROVED; no invented scores |
| **B5** spend caps / deployments | UNASSIGNED; no numeric caps in git |
| Pilot readiness | Always **false** |

## What this soft-land adds

1. Typed inventory of five owner gates with reuse pointers into existing soft-lands.  
2. Mode assessor (`check` / `fixture`) that never invents authorities or claims pilot readiness.  
3. Track B honesty assessor for ops / agent pick-next copy.  
4. Pending JSON worksheet with UNASSIGNED / NOT_APPROVED refs.

## Reuse (do not rebuild)

- E2E-02 / E2E-03 isolation + clearance soft-lands  
- A1.2 SEC-02 kill-switch / spend-cap soft-land  
- E2E-06 dual-provider + E2E-10 SME gold soft-lands  
- D-01 edge-review queue (C2) awaiting B3 humans

## Owner next steps (not this PR)

1. Sign or defer source clearance (B1).  
2. Name independent DB reviewer (B2).  
3. Recruit immunology / metabolism / gut microbiome reviewers (B3).  
4. Approve benchmark floors privately (B4).  
5. Set provider spend caps and deployments privately (B5).

## Explicit non-goals

- Inventing signers, reviewer identities, numeric caps, or MoUs in git  
- Gate C auto-approve or production write enablement  
- Treating soft-land green as pilot readiness  
- Removing migration holds without B2  
