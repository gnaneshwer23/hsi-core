# HSI Landing Pages — Integration Report

**Date:** 20 November 2026 (Europe/London)  
**Branch:** `cursor/landing-pages-complete-2f71`  
**Scope:** Complete / enhance the public Vite/React site — do **not** replace architecture or invent readiness.  
**Governing vision:** [`../strategy/HSI_VISION.md`](../strategy/HSI_VISION.md), [`DESIGN.md`](../../DESIGN.md), [`PRODUCT.md`](../../PRODUCT.md)  
**Stage 2 inventory:** [`HSI_STAGE2_PUBLIC_LANDING_INVENTORY_2026-11-19.md`](./HSI_STAGE2_PUBLIC_LANDING_INVENTORY_2026-11-19.md)  
**Stage 2 QA:** [`HSI_STAGE2_INTEGRATED_QA_2026-11-19.md`](./HSI_STAGE2_INTEGRATED_QA_2026-11-19.md)

**Honesty:** This report does not claim production acceptance, paid demand, scientific validation scores, or clinical readiness. Agent will not merge or deploy without owner approval.

---

## 1. What already exists (do not duplicate)

| Layer | On `main` (as of this report) | Notes |
| --- | --- | --- |
| Design system / nav | Merged [#554](https://github.com/gnaneshwer23/hsi-core/pull/554) | Stage 2 chrome, audience menu, tokens |
| Homepage narrative | Merged [#577](https://github.com/gnaneshwer23/hsi-core/pull/577) | One-HSI platform story, live graph status strip |
| Platform workflow | Live `/how-it-works` | Eight-stage question → brief; maturity labels |
| Demo Research Universe PR1 | Merged [#555](https://github.com/gnaneshwer23/hsi-core/pull/555) | Registry + core investigation fixtures |
| Research app | `/research/*`, workspace, KG tools | Preserved; not public marketing |

### Stage 2 stack tip (soft-landed onto this branch)

Open PRs with **verify green** (local check 20 Nov 2026 afternoon UTC):

| PR | Title | Role |
| --- | --- | --- |
| [#556](https://github.com/gnaneshwer23/hsi-core/pull/556) | Homepage / Platform (PR2) | Largely absorbed by #577 on main; stack restacks still carry programme history |
| [#558](https://github.com/gnaneshwer23/hsi-core/pull/558) | Researchers + Research Groups | Marketing deepen; `/enterprise` indexed |
| [#559](https://github.com/gnaneshwer23/hsi-core/pull/559) | Biotech, Clinical, Laboratories | New `/clinical`, `/laboratories` landings |
| [#560](https://github.com/gnaneshwer23/hsi-core/pull/560) | Community, Validation, Access | `/research-community`; contact access shapes |
| [#561](https://github.com/gnaneshwer23/hsi-core/pull/561) | Integrated QA | Route/SEO/nav locks + mobile e2e + owner checklist |

This branch merges `origin/cursor/stage2-integrated-qa-2f71` onto `origin/main` so the coherent public IA is reviewable as one tip without rewriting those PRs.

---

## 2. Implemented public experience (this tip)

### Indexed marketing paths (13)

`/`, `/how-it-works`, `/knowledge-graph`, `/researchers`, `/enterprise`, `/biotech`, `/clinical`, `/laboratories`, `/research-community`, `/validation`, `/trust`, `/about`, `/contact`

### Journey coverage vs brief

| Brief requirement | Surface | Honesty |
| --- | --- | --- |
| Homepage positioning + product demonstration | `/` — brand hero, USPs, live digest-verified graph counts, worked conflict, domains | Candidate relationships; no invented metrics |
| Platform architecture + investigation workflow | `/how-it-works` | Labels: live / published / synthetic / local |
| Six scientific domains | Home domain links → graph department filters | Candidate-only graph |
| Audience-specific landings | Researchers, Groups, Biotech, Clinical, Labs, Community | Demo shells remain under `/enterprise/*` where labelled Demonstration |
| Community / collaboration | `/research-community` | No fake testimonials or network liquidity |
| Validation, provenance, trust | `/validation`, `/trust` | No benchmark scores or approvals invented |
| Research-preview onboarding / access | `/welcome`, `/contact`, `/sign-in` | Access request does not claim delivery without provider acceptance |

Research applications and specialist routes are unchanged.

---

## 3. Remaining gaps

| Gap | Status | Recommendation |
| --- | --- | --- |
| Demo Universe landing previews on homepage | Open stack [#562](https://github.com/gnaneshwer23/hsi-core/pull/562)→…→[#567](https://github.com/gnaneshwer23/hsi-core/pull/567) (verify green); conflicts with Stage 2 `Layout.tsx` if force-merged | Merge Stage 2 (or this soft-land) first; then rebase Demo tip and resolve Layout conflict |
| Owner visual review | Checklist in Stage 2 QA doc — human only | Required before merge/deploy |
| Clinical / collaboration production claims | Intentionally absent | Keep demonstration / synthetic labels |
| Backend-bound previews | Graph snapshot live; live investigation when configured; dual-model off by default | Do not claim agents / verification / CDS production-ready |

---

## 4. Recommended merge order (owner)

**Do not merge or deploy without approval.**

### Option A — Soft-land tip (this PR)

1. Owner visual review of Vercel preview for `cursor/landing-pages-complete-2f71`
2. Merge **this** PR to `main` when green
3. Close Stage 2 stack PRs [#556](https://github.com/gnaneshwer23/hsi-core/pull/556), [#558](https://github.com/gnaneshwer23/hsi-core/pull/558), [#559](https://github.com/gnaneshwer23/hsi-core/pull/559), [#560](https://github.com/gnaneshwer23/hsi-core/pull/560), [#561](https://github.com/gnaneshwer23/hsi-core/pull/561) as superseded (content already included)
4. Rebase Demo Universe stack onto updated `main`; resolve `Layout.tsx`; merge [#562]→[#567] bottom-up

### Option B — Keep Stage 2 stack atomic

1. Merge bottom-up: **#554 (done) → #556 → #558 → #559 → #560 → #561**
2. Close this soft-land PR as duplicate
3. Then Demo Universe as in Option A step 4

Option A is preferred when the owner wants one coherent tip vs `main` without six sequential merges.

---

## 5. Validation (this branch)

Local results before push (20 Nov 2026, Europe/London). CI on the PR remains the source of truth after push.

| Check | Command / suite | Result |
| --- | --- | --- |
| Stage 2 unit locks | `bun test test/stage2IntegratedQa.test.ts test/stage2LandingNav.test.ts` | Pass (8) |
| Honesty | `bun test test/publicSiteHonesty.test.ts` | Pass (8) |
| Site build + SEO + CSS budget | `cd site && bun run build` | Pass — **13** public pages; CSS 129639 / 130000 gz |
| Landing / audience e2e | `landing-pages`, `audience-public`, `stage2-integrated-qa` | Pass (15) locally |
| Broader a11y / SEO / chrome | CI `approved-website`, `seo`, `production-qa`, `verify` | Await PR CI after push |

---

## 6. Overlap note — Stage 2 vs Demo Research Universe

| Stack | Touch | Conflict risk |
| --- | --- | --- |
| Stage 2 | Public IA, audience pages, nav, SEO indexed set, Stage 2 CSS | Low vs main after #554/#577 |
| Demo Universe | Fixtures, role adapters, omics/cohorts, **homepage DemoLandingPreviewPanel** | **Layout.tsx** conflict with Stage 2 tip; rebase after Stage 2 lands |
| Homepage narrative (#577) | Already on main | Stage 2 PR2 largely empty vs main after sync |

---

## 7. Success criterion check

> A coherent, visually professional HSI website that accurately communicates our existing six-domain scientific intelligence platform and provides a clear journey into the research workspace.

| Criterion | Met on this tip? |
| --- | --- |
| Coherent public IA (Platform, Audiences, Validation, Resources, Access) | Yes |
| Six-domain messaging with graph links | Yes |
| Journey into research workspace (`/welcome`, `/research/home`, `/research/workspace`) | Yes |
| Honesty (candidate / synthetic / no CDS / no invented prices) | Yes — locked by Stage 2 QA |
| Owner merge / deploy | **Not done** — awaiting approval |
