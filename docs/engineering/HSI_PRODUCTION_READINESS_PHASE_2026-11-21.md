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
| U7 Scientific reliability / Human #4 scaffold | Done — see `HSI_10_SCIENTIFIC_RELIABILITY_U7_SOFT_LAND.md` (no gold invented) |
| U8 Pilot readiness / Human #8 scaffold | Done — see `HSI_10_PILOT_READINESS_U8_SOFT_LAND.md` (invites still blocked) |
| U9 API envelope wave 2 + Ask Retry-After UI | Done — see `HSI_U9_API_ENVELOPE_WAVE2_2026-11-21.md` |
| U10 Client Retry-After across research UIs | Done — see `HSI_U10_CLIENT_RETRY_AFTER_2026-11-21.md` |
| U11 Access-request client + L0 launch readiness | Done — see `HSI_U11_ACCESS_REQUEST_AND_L0_LAUNCH_2026-11-21.md` (owner GO still open) |
| U12 L1 restricted-preview readiness + write/health codes + PROD-QA-003 scan | Done — see `HSI_U12_RESTRICTED_PREVIEW_AND_WRITES_CODES_2026-11-21.md` (owner staging grant still open) |
| U13 Interrogative API stable codes + `scan:client-bundle` script | Done — see `HSI_U13_INTERROGATIVE_API_CODES_2026-11-21.md` |
| U14 Live evidence + scientific site API codes | Done — see `HSI_U14_LIVE_AND_SCIENTIFIC_API_CODES_2026-11-21.md` |
| U15 Gateway envelope wave 3 (onboarding / graph / router / snapshot) | Done — see `HSI_U15_GATEWAY_ENVELOPE_WAVE3_2026-11-21.md` |
| U16 Client-bundle secret scan in CI (PROD-QA-003) | Done — see `HSI_U16_CLIENT_BUNDLE_SCAN_CI_2026-11-21.md` (AppSec still open) |

Verified acceptance remains **0 / 8**. Phase engineering units U1–U16 soft-landed; owner evidence still required.
