# HSI 1.0 acceptance status (20 November 2026)

**Programme:** Integration First — [PR #568](https://github.com/gnaneshwer23/hsi-core/pull/568) (`docs/engineering/HSI_1_0_INTEGRATION_FIRST_PLAN_2026-11-20.md` lands when that PR merges)  
**Honesty:** This matrix tracks **engineering surface readiness** vs **owner acceptance**. CI green ≠ scientific or production acceptance. Tick “verified” only with reviewed staging/pilot evidence.

**Stack (merge bottom-up):**  
[#569](https://github.com/gnaneshwer23/hsi-core/pull/569) continuous trail → [#570](https://github.com/gnaneshwer23/hsi-core/pull/570) evidence reliability → [#572](https://github.com/gnaneshwer23/hsi-core/pull/572) comparability → [#573](https://github.com/gnaneshwer23/hsi-core/pull/573) provisional hyp → **this status doc**.

---

## Checklist

| # | Criterion | Engineering surface | Owner gate | Verified |
| --- | --- | --- | --- | --- |
| 1 | One continuous investigation without disconnected manual steps | Trail open contracts + Playwright continuous journey (`WORKSPACE_CONTINUOUS_TRAIL.md`, #569) | Staging grant run still required for live production path | **No** |
| 2 | Every cited finding links to a verifiable permitted source | Source URL + DOI/PMID/absent + `sourceClearanceVerified: false` on claim inspect, View all sources, passport, and brief (`WORKSPACE_EVIDENCE_RELIABILITY_HONESTY.md`, #570) | Human #2 signed clearance / live passage rights | **No** |
| 3 | Comparisons distinguish conflict vs non-comparable contexts | `COMPARABILITY_HONESTY_LINE` + insufficient_comparability e2e (`WORKSPACE_COMPARABILITY_HONESTY.md`, #572) | SME gold adjudication (#4) | **No** |
| 4 | Hypotheses and experiment proposals labelled provisional | Provisional tagline + experiment labels + brief line (`WORKSPACE_PROVISIONAL_HYPOTHESIS_HONESTY.md`, #573) | None for labelling; scientific acceptance still SME | **No** (labels shipped; not scientifically verified) |
| 5 | Save and reopen in approved staging | Device-local library only today (`productionWritesEnabled: false`) | Human #5 write packet · held migrations 022–033 | **No** |
| 6 | Two-user isolation and permissions pass security review | Soft-land catalogs exist (NEXT-B) | Human #3 isolation signer · staging HTTP | **No** |
| 7 | Expert-adjudicated benchmark finds errors/uncertainty | Gold harness scaffolding exists | Human #4 SME gold vault | **No** |
| 8 | Researchers produce and assess a usable evidence-linked decision brief | `LiveBriefDecisionPanel` + passport/limitations always visible + usefulness panel (#569–#573 path) | Controlled researcher pilot (3–5) usefulness review — only after Human #8 / NEXT-F operational acceptance | **No** |

**Verified count:** 0 / 8 (planning honesty unchanged).

---

## What agents shipped (do not over-claim)

| PR | Role |
| --- | --- |
| #568 | File-level Integration First plan |
| #569 | Continuous Stage 2 trail UX + e2e |
| #570 | Evidence reliability honesty labels |
| #572 | Comparability class honesty |
| #573 | Provisional hyp/experiment honesty |
| This PR | Acceptance status matrix (docs only) |

## Still deferred / owner

- Reconcile website Stack A (#554–#561) and Demo Universe Stack B (#555–#567)  
- Source clearance policy signature · staging persistence · isolation review · SME gold · Human #8 / NEXT-F operational acceptance · then pilot invite  
- No additional agent personalities, role dashboards, patient integrations, or new DB platforms for this milestone  

## Recommended owner next actions

1. Review/merge Integration First stack (#569→#573) after CI green.  
2. Reconcile public website + Demo Universe stacks without forking a third homepage.  
3. Work the owner-gate worksheet ([`HSI_1_0_OWNER_GATES_WORKSHEET_2026-11-20.md`](./HSI_1_0_OWNER_GATES_WORKSHEET_2026-11-20.md)): close Human #2 / #3 / #4 / #5 with named evidence; close Human #8 / NEXT-F; **then** invite 3–5 researchers for checklist #8.  
