# HSI 1.0 — U11 public launch (L0) readiness soft-land (21 November 2026)

**Status:** Engineering soft-land. CI-safe catalog of L0 public-launch readiness vs owner GO/NO-GO.  
**Not claimed:** Public launch, visual acceptance, scientific approval, or production writes.

Typed catalog: [`src/operations/hsi10PublicLaunchReadinessU11SoftLand.ts`](../../src/operations/hsi10PublicLaunchReadinessU11SoftLand.ts).  
Pending worksheet: [`operations/staging/hsi-10-public-launch-readiness-u11.pending.json`](../../operations/staging/hsi-10-public-launch-readiness-u11.pending.json).  
QA packet: [`docs/qa/HSI_PUBLIC_LAUNCH_QA_PACKET_2026-11-21.md`](../qa/HSI_PUBLIC_LAUNCH_QA_PACKET_2026-11-21.md).

## Honesty

| Claim | Soft-land |
| --- | --- |
| QA packet + evidence folder | Engineering ready |
| Demo Universe synthetic / write-false | Engineering ready |
| Premortem as release gate | **False** (strategy only) |
| `publicLaunchClaimed` | Always `false` |
| Owner visual acceptance / GO | **Recorded GO** (U36 / 21 Nov 2026) for L0 public site + Demo Universe only |
| Invented owner GO | **Forbidden** (U36 records explicit owner message; not invented) |

## Surface map

| Surface | Owner? | Notes |
| --- | --- | --- |
| Public QA packet | Yes (sign-off) | Dated evidence exists |
| Demo Universe synthetic | No | Public-ready as demonstration |
| Landing honesty labels | No | E2e-asserted |
| Production probe writes false | No | Fail-closed |
| Premortem non-gate | No | Explicit exclusion |
| Owner visual acceptance | Yes | **GO recorded** (U36, 21 Nov 2026) |
| Owner public launch GO | Yes | **GO recorded** (U36, 21 Nov 2026) — research writes still false |

## Companion client work (same unit)

Access-request contact flow uses `site/src/lib/accessRequestClient.ts` so rate-limit (`Retry-After`), PHI refusal, and delivery-not-configured outcomes stay honest without claiming operator receipt.

## Owner next steps

1. ~~Sign visual acceptance / record public launch GO~~ — **done via U36 owner approval** (L0 only).  
2. Keep scientific approval and production research writes false for L0.  
3. Real PHI / clinical activity remain ADR-0010-gated (not part of L0).  

**Never invent** operator receipt or research-write enablement in this soft-land.
