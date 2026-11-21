# HSI 1.0 acceptance status (20 November 2026; reconciled 21 November 2026)

**Programme:** Integration First — [`HSI_1_0_INTEGRATION_FIRST_PLAN_2026-11-20.md`](./HSI_1_0_INTEGRATION_FIRST_PLAN_2026-11-20.md)  
**Honesty:** This matrix tracks **engineering surface readiness** vs **owner acceptance**. CI green ≠ scientific or production acceptance. Tick “verified” only with reviewed staging/pilot evidence.

**Post-merge reconcile (21 Nov 2026, main `321ae53f`):**

| Stack | Status |
| --- | --- |
| Public landings (#554, #580, #581–#584) | **Merged** |
| Demo Research Universe (#555, #562, #564–#567) | **Merged** |
| Continuous trail + honesty (#569–#576) + acceptance docs (#574–#575) | **Merged** |

Business pre-mortem (#579) is **internal strategy only** — not a technical release gate ([production readiness phase](../plans/HSI_PRODUCTION_READINESS_PHASE_2026-11-21.md)).

**Stack (historical merge order):**  
[#569](https://github.com/gnaneshwer23/hsi-core/pull/569) continuous trail → [#570](https://github.com/gnaneshwer23/hsi-core/pull/570) evidence reliability → [#572](https://github.com/gnaneshwer23/hsi-core/pull/572) comparability → [#573](https://github.com/gnaneshwer23/hsi-core/pull/573) provisional hyp → acceptance status docs.

---

## Checklist

| # | Criterion | Engineering surface | Owner gate | Verified |
| --- | --- | --- | --- | --- |
| 1 | One continuous investigation without disconnected manual steps | Trail open contracts + Playwright continuous journey (`WORKSPACE_CONTINUOUS_TRAIL.md`, #569); soft-land packet `HSI_10_CONTINUOUS_JOURNEY_EVIDENCE_SOFT_LAND.md` | Staging grant run still required for live production path | **No** |
| 2 | Every cited finding links to a verifiable permitted source | Source URL + DOI/PMID/absent + `sourceClearanceVerified: false` on claim inspect, View all sources, passport, and brief (`WORKSPACE_EVIDENCE_RELIABILITY_HONESTY.md`, #570) | Human #2 signed clearance / live passage rights | **No** |
| 3 | Comparisons distinguish conflict vs non-comparable contexts | `COMPARABILITY_HONESTY_LINE` + insufficient_comparability e2e (`WORKSPACE_COMPARABILITY_HONESTY.md`, #572) | SME gold adjudication (#4) | **No** |
| 4 | Hypotheses and experiment proposals labelled provisional | Provisional tagline + experiment labels + brief line (`WORKSPACE_PROVISIONAL_HYPOTHESIS_HONESTY.md`, #573) | None for labelling; scientific acceptance still SME | **No** (labels shipped; not scientifically verified) |
| 5 | Save and reopen in approved staging | Device-local library only today (`productionWritesEnabled: false`) | Human #5 write packet · held migrations 022–033 | **No** |
| 6 | Two-user isolation and permissions pass security review | Soft-land catalogs exist (NEXT-B) | Human #3 isolation signer · staging HTTP | **No** |
| 7 | Expert-adjudicated benchmark finds errors/uncertainty | Gold harness scaffolding exists | Human #4 SME gold vault | **No** |
| 8 | Researchers produce and assess a usable evidence-linked decision brief | `LiveBriefDecisionPanel` + passport/limitations always visible + usefulness panel (#569–#573 path) | Controlled researcher pilot (3–5) usefulness review — only after Human #8 / NEXT-F operational acceptance | **No** |

**Verified count:** 0 / 8 (planning honesty unchanged after 21 Nov reconcile).

---

## What agents shipped (do not over-claim)

| PR / wave | Role |
| --- | --- |
| #568 | File-level Integration First plan |
| #569–#576 | Continuous trail + reliability / comparability / provisional honesty |
| #574–#575 | Acceptance status matrix + owner-gates worksheet |
| #554–#584 | Public landings (merged) |
| #555–#567 | Demo Research Universe (merged) |
| Production readiness phase | Hardening plan + register reconcile + journey evidence soft-land — still **0 / 8** verified |

## Still deferred / owner

- Source clearance policy signature · staging persistence · isolation review · SME gold · Human #8 / NEXT-F operational acceptance · then pilot invite  
- No additional agent personalities, role dashboards, patient integrations, or new DB platforms for this milestone  
- Do not enable production writes or lift held migrations without explicit owner authorization  

## Recommended owner next actions

1. Run the public launch QA packet (`docs/qa/HSI_PUBLIC_LAUNCH_QA_PACKET_2026-11-21.md`).  
2. Fill continuous-journey + staging save evidence soft-lands (checklist #1 / #5) with real staging grant evidence.  
3. Work the U6 owner-packets scaffold ([`HSI_10_OWNER_PACKETS_U6_SOFT_LAND.md`](./HSI_10_OWNER_PACKETS_U6_SOFT_LAND.md)) for Human #2 / #3 / #5; then Human #4 SME gold and Human #8 / NEXT-F; **then** invite 3–5 researchers for checklist #8.  
