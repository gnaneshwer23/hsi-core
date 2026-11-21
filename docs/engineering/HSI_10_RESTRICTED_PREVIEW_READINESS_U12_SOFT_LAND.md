# HSI 1.0 — U12 restricted-preview (L1) readiness soft-land (21 November 2026)

**Status:** Engineering soft-land. CI-safe catalog of L1 restricted-preview readiness vs owner staging-grant GO.  
**Not claimed:** Restricted preview acceptance, staging hosts, grants, production writes, or scientific approval.

Typed catalog: [`src/operations/hsi10RestrictedPreviewReadinessU12SoftLand.ts`](../../src/operations/hsi10RestrictedPreviewReadinessU12SoftLand.ts).  
Pending worksheet: [`operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json`](../../operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json).  
Depends on: [`HSI_10_CONTINUOUS_JOURNEY_EVIDENCE_SOFT_LAND.md`](./HSI_10_CONTINUOUS_JOURNEY_EVIDENCE_SOFT_LAND.md), [`HSI_10_PUBLIC_LAUNCH_READINESS_U11_SOFT_LAND.md`](./HSI_10_PUBLIC_LAUNCH_READINESS_U11_SOFT_LAND.md).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Local continuous journey e2e | Engineering ready |
| Ask / live-investigation honesty envelopes | Engineering ready |
| Device-local save | Engineering ready |
| Staging grant continuous run | **Owner-gated** |
| `restrictedPreviewClaimed` | Always `false` |
| Invented staging URL / grant | **Forbidden** |

## Surface map

| Surface | Owner? | Checklist |
| --- | --- | --- |
| Continuous journey local e2e | No | #1 |
| Ask / live honesty | No | #1 |
| Device-local save/reopen | No | #5 |
| Auth grant fail-closed | Partial | — |
| Production writes refused | No | #5 |
| Staging grant continuous run | Yes | #1 |
| Owner preview GO | Yes | — |

## Companion API honesty (same unit)

- `GET /api/health` method rejects use `METHOD_NOT_ALLOWED`.  
- Research POST while writes disabled returns `RESEARCH_WRITES_DISABLED`.  

## Owner next steps

1. Approve disposable HSI staging target privately.  
2. Provision a preview grant; capture continuous journey evidence.  
3. Keep production writes false; Human #5 before durable staging save.  
4. Record restricted-preview GO/NO-GO privately.

**Never invent** staging hosts, grants, or preview GO in this soft-land.
