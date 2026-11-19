# NEXT-B — Staging isolation acceptance soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** live execution authorization, signed scope acceptance, invented accounts/signers, migration hold removal, or production activation.

Binding row: [`docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md`](../audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md) — **NEXT-B / P0**.  
Typed catalog: [`src/operations/nextBIsolationSoftLand.ts`](../../src/operations/nextBIsolationSoftLand.ts).  
Canonical pending: [`operations/staging/next-b-acceptance.pending.json`](../../operations/staging/next-b-acceptance.pending.json).  
Soft-land pending: [`operations/staging/next-b-isolation-soft-land.pending.json`](../../operations/staging/next-b-isolation-soft-land.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Isolation suite check/fixture | Reused; **never** acceptance |
| E2E-02 acceptance packet | Reused soft-land |
| `liveExecutionAuthorized` | Always `false` |
| `migrationHoldsChanged` | Always `false` |
| Depends on Track B | **B2** (independent DB reviewer) |
| Invented staging target / accounts / signer | **Forbidden** |
| `communityWrites` | **DEFERRED** |

## What this soft-land adds

1. Typed inventory of seven isolation-acceptance surfaces.  
2. Mode assessor (`check` / `fixture`) that never enables live acceptance or hold removal.  
3. Isolation honesty assessor for ops / agent pick-next copy.  
4. Soft-land pending JSON pointing at the canonical next-b worksheet.

## Reuse (do not rebuild)

- `src/db/stagingIsolationSuite.ts` + `staging:isolation:*` CLI  
- `src/db/stagingIsolationRunner.ts`  
- E2E-02 isolation acceptance packet soft-land  
- Track B owner-gates soft-land (B2)  
- Canonical `next-b-acceptance.pending.json`

## Owner next steps (not this PR)

1. Approve staging target + private least-privilege config.  
2. Name Track B2 DB reviewer before any hold change.  
3. Provision two researchers + independent reviewer/security signer privately.  
4. Run live isolation with protected per-scope evidence; keep holds unchanged in git.

## Explicit non-goals

- Inventing accounts, signers, or staging URLs in git  
- Treating check/fixture green as signed acceptance  
- Batch-removing migration holds 022–033  
- Enabling community writes or production activation  
