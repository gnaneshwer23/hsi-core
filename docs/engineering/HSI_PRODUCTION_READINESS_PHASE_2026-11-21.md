# HSI production readiness phase (21 November 2026)

**Plan artifact:** [`docs/plans/HSI_PRODUCTION_READINESS_PHASE_2026-11-21.md`](../plans/HSI_PRODUCTION_READINESS_PHASE_2026-11-21.md)  
**Baseline main:** `321ae53f`  
**Companion audit:** post-merge acceptance audit (21 Nov 2026)

## Stance

HSI is **partially production-ready**: public site + synthetic Demo Universe are closest to launch; the live scientific platform is **not** ready for unrestricted researcher use.

Launch in stages:

1. **Public launch** — landings, honesty labels, Demo Universe  
2. **Restricted research preview** — authenticated continuous investigation, fail-closed writes  
3. **General availability** — clearance, isolation, durable persistence, SME evaluation, then pilot

## Release-gate policy

- **In:** HSI 1.0 acceptance matrix, owner-gates worksheet, CI + production probe, security/isolation evidence  
- **Out:** Internal business pre-mortem — useful for strategy, **not** a technical release blocker

## Next execution order

1. U1 — Register / STATUS / acceptance-doc reconcile  
2. U2 — Public launch QA packet  
3. U3 — Open PR hygiene (#371/#511/#513/#514; reconcile #512/#578/#579)  
4. U4 — Restricted-preview journey evidence soft-land  
5. U5+ — Reliability hardening and owner packets as authorised  

Do **not** enable held migrations, production research writes, or unapproved deploys from this phase alone.


## Execution progress (this branch)

| Unit | Status |
| --- | --- |
| U1 Register / STATUS / acceptance reconcile | Done on this PR |
| U2 Public launch QA packet + evidence | Done on this PR |
| U3 Open PR hygiene note | Done (owner still closes PRs) |
| U4 Continuous journey evidence soft-land | Done (owner fills staging refs) |
| U5 API reliability (Ask / live investigation envelopes) | Done — see `HSI_U5_API_RELIABILITY_HARDENING_2026-11-21.md` |
| U6 Owner packets Human #2/#3/#5 scaffold | Done — see `HSI_10_OWNER_PACKETS_U6_SOFT_LAND.md` (owner still fills refs) |
| U7–U8 | Owner-gated / follow-on PRs |

Verified acceptance remains **0 / 8**.
