# NEXT-A — Source/provider/receipt composition soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** live composition authorization, signed clearance, provider credentials, approved deployments, redacted live receipts, or scientific approval.

Binding row: [`docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md`](../audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md) — **NEXT-A / P0**.  
Typed catalog: [`src/operations/nextACompositionSoftLand.ts`](../../src/operations/nextACompositionSoftLand.ts).  
Pending worksheet: [`operations/staging/next-a-composition.pending.json`](../../operations/staging/next-a-composition.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Hardened adapters | Reused (receipts, clearance, pinned transport, staging ops) |
| E2E-03 / E2E-06 soft-lands | Reused catalogs |
| `liveCompositionAuthorized` | Always `false` |
| Depends on Track B | **B1** + **B5** |
| Invented receipts / credentials / deployments | **Forbidden** |
| Harness / fixture green = NEXT-A acceptance | **Forbidden** |

## What this soft-land adds

1. Typed inventory of seven composition surfaces.  
2. Mode assessor (`check` / `fixture`) that never authorizes live composition.  
3. Composition honesty assessor for ops / agent pick-next copy.  
4. Pending JSON worksheet with UNASSIGNED / NOT_STARTED refs.

## Reuse (do not rebuild)

- `src/researchV2/sourceClearanceReceipt.ts`  
- `src/researchV2/operationalSourceClearance.ts`  
- `src/researchV2/pinnedProviderTransport.ts`  
- `src/researchV2/stagingProviderOperations.ts`  
- E2E-03 clearance composition + E2E-06 dual-provider soft-lands  

## Owner next steps (not this PR)

1. Close Track B1 (sign or defer clearance policy).  
2. Close Track B5 (private caps + two approved staging deployments).  
3. Run fault tests on the actual chosen runtime; retain redacted receipts.  
4. Only then treat composition as accepted for a named staging scope.

## Explicit non-goals

- Inventing signed clearance, keys, deployments, or redacted receipts in git  
- Rebuilding adapters already hardened on `main`  
- Claiming scientific approval or pilot readiness from soft-land green  
- Skipping B1/B5 because fixture tests pass  
