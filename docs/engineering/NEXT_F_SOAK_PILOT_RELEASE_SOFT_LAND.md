# NEXT-F — Soak / on-call / signed pilot soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** 14-day soak acceptance, invented on-call/destinations, signed invite-only pilot, or scientific approval.

Binding row: [`docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md`](../audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md) — **NEXT-F / P1**.  
Typed catalog: [`src/operations/nextFSoakPilotReleaseSoftLand.ts`](../../src/operations/nextFSoakPilotReleaseSoftLand.ts).  
Pending worksheet: [`operations/staging/next-f-soak-pilot-release.pending.json`](../../operations/staging/next-f-soak-pilot-release.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Alert / kill-switch / pilot-ops catalogs | Reused |
| `soakAccepted` / `pilotReleaseSigned` | Always `false` |
| Depends on | **NEXT-E** + all P0/P1 acceptance |
| Invented on-call / alert destinations / 14-day evidence | **Forbidden** |
| Auto graph promotion from pilot | **Forbidden** |
| Fixture green = signed pilot | **Forbidden** |

## What this soft-land adds

1. Typed inventory of seven soak / pilot-release surfaces.  
2. Mode assessor (`check` / `fixture`) that never claims soak or signed pilot.  
3. Pilot honesty assessor for ops / agent pick-next copy.  
4. Pending JSON worksheet with UNASSIGNED / NOT_STARTED refs.

## Reuse (do not rebuild)

- A1.3 ops alert catalog  
- A1.2 / SEC-02 kill-switch catalog  
- Pilot operations store/service (mocks ≠ on-call)  
- Track B owner-gates / NEXT-B isolation restore notes  

## Owner next steps (not this PR)

1. Accept NEXT-E and remaining P0/P1 for the exact artifact.  
2. Name security/ops owners; wire real keys and alert destination.  
3. Approve load/cap/cohort policy; run RPO/RTO and kill-switch drills.  
4. Retain 14-day soak evidence; sign invite-only pilot only for that artifact.  
5. Keep each material brief and graph promotion as a separate human decision.

## Explicit non-goals

- Inventing on-call identities, destinations, or soak history in git  
- Treating pilot SQLite alert mocks as product on-call  
- Claiming soft-land green as signed pilot release  
- Starting NEXT-G domain increment without this acceptance  
