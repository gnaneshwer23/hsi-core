# NEXT-C — Durable audit / saved journey soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** live saved/exported journey acceptance, legacy brief transfer, invented audit hashes, graph promotion, or scientific approval.

Binding row: [`docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md`](../audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md) — **NEXT-C / P1**.  
Typed catalog: [`src/operations/nextCDurableAuditSoftLand.ts`](../../src/operations/nextCDurableAuditSoftLand.ts).  
Pending worksheet: [`operations/staging/next-c-durable-audit.pending.json`](../../operations/staging/next-c-durable-audit.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Delivery / attachments / review / archive adapters | Reused |
| `liveJourneyAccepted` | Always `false` |
| Depends on | **NEXT-A** + **NEXT-B** |
| Legacy brief → later audit approval | **Forbidden** |
| Graph promotion from review alone | **Forbidden** |
| Invented domain packs / audit hashes | **Forbidden** |

## What this soft-land adds

1. Typed inventory of seven durable-audit / journey surfaces.  
2. Mode assessor (`check` / `fixture`) that never claims a live journey.  
3. Audit honesty assessor for ops / agent pick-next copy.  
4. Pending JSON worksheet with NOT_STARTED / UNASSIGNED refs.

## Reuse (do not rebuild)

- `src/server/investigationDeliveryService.ts`  
- `src/server/boundOutcomeAttachments.ts`  
- `src/db/authenticatedScientificReviewStore.ts`  
- `src/interrogativeScientificReview.ts`  
- Context audit archive + re-review outcome guard  
- NEXT-A / NEXT-B soft-lands  

## Owner next steps (not this PR)

1. Accept NEXT-A and NEXT-B for a named staging scope.  
2. Bind explicit primary-domain packs/roles (SSc + RA/SLE comparison).  
3. Run one immutable investigation version through independent review to reopen/export.  
4. Keep graph publication as a separate human gate.

## Explicit non-goals

- Inventing audit hashes, domain packs, or live journey acceptance in git  
- Transferring legacy brief approval to a later audit  
- Promoting reviewed investigations into the curated graph from soft-land green  
- Skipping NEXT-A/B because fixture delivery tests pass  
