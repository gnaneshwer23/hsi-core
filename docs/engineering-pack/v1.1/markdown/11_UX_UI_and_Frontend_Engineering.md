---
title: "11. UX/UI and Frontend Engineering"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **Two surfaces, one codebase:** a prerendered public site that sells the idea honestly, and a signed-in workbench that does the work. Keep React 19, Vite and React Router.
- **The public site leads with the one claim nobody else can make:** see why the evidence conflicts. Show one real worked conflict, not a table of agent states.
- **Consolidate the visual system.** About 60 stylesheets and three visual systems become one token set (`hsi-visual-tokens.css`, `hsi-design-tokens.json`).
- **Accessibility is a gate, not a goal:** WCAG 2.2 AA, axe in CI, 44 px targets, reduced-motion support, readable at 320 px.

# 2. Vision

A scientist decides in the first screen that HSI is serious: real data, honest labels, a clear next action. Inside, the workbench feels like a careful instrument: calm, dense where it needs to be, every claim one click from its evidence.

# 3. Where we are

| Item | Status | Detail |
| --- | --- | --- |
| Public site | Built | Simplified to six pages around the vision on 15 November; live published graph as the hero; prerendered with per-page SEO |
| Workbench | Built (UI) | Researcher home, onboarding, graph canvas with multi-select, evidence panels, gap register, ledger, brief export |
| Routes | Debt | About 100 routes in `site/src/App.tsx`, many redirects or legacy demonstrations |
| Styles | Debt | About 60 CSS files under `site/src/styles` |
| Accessibility | Built (process) | axe checks in Playwright; target-size fixes landed |
| Browser tests | Built | 65 Playwright spec files |
| Performance | Built (process) | Bundle budgets (`site/bundle-budget.json`), Lighthouse lab run in CI |
| Contact page | Weak | Saves a browser draft only; does not submit (PRD-08) |
| Usability testing | Not started | Test plan drafted; no sessions run |

# 4. Information architecture

## Public site (target: six to eight pages)

| Page | Job |
| --- | --- |
| Home | The claim, the live graph, one worked conflict, what exists and what does not, request access |
| Knowledge graph | Explore the published graph; evidence walk |
| How it works | Question to brief, with honest status per step |
| Benchmark (new) | Protocol, current results, failures |
| Compare (new) | What HSI does differently, and what competitors do better |
| Trust | Evidence, review and data boundaries |
| About and contact | Founder, mission, working access request |

Conflict pages (new, indexable): one page per reviewed conflict, for example "IL-6 in RA: human versus mouse evidence". These are how researchers find HSI through search.

## Workbench navigation

Home · Ask · Graph · Investigations · Gaps · Hypotheses · Review (reviewers only) · Account. Labs (synthetic clinical demos) sits under Account or a separate menu.

# 5. Design rules

- Evidence-first cards: claim, then context chips (species, tissue, population, design), then source and review state.
- Reviewed versus candidate: solid versus outlined edges and badges, consistent in graph, panels and exports.
- Status language is plain and specific: "Search failed (Europe PMC timeout)", not "Something went wrong".
- Never show a blended confidence score or a progress animation that implies activity that is not happening.
- Empty, loading, partial and error states designed for every panel.

# 6. What to build next

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| UX-01 | Homepage worked conflict | One real conflict with real citations, split by context, on the landing page; any agent status table lives only on `/status` |
| UX-02 | Working access request (PRD-08, API-06) | Form submits; confirmation and error states; no claim of delivery before it happens |
| UX-03 | `/benchmark` and `/compare` pages | Content from document 06 and 01; benchmark page reads published results JSON |
| UX-04 | Token consolidation | One token file; stylesheets reduced by at least half; visual regression baselines updated |
| UX-05 | Route clean-up (WB-07) | Each route mapped to loop, reviewer tool, Labs or redirect; route count halved |
| UX-06 | Reviewed versus candidate styling (WB-04) | Visual test across graph, panels and brief |
| UX-07 | Async run UI (WB-02) | Reload-safe progress; completion notice |
| UX-08 | Usability sessions | 5 researcher sessions on landing → onboarding → first investigation; issues logged and prioritised |
| UX-09 | Mobile pass | Core read flows usable at 390 px; graph falls back to a list view |

# 7. Future options

- Conflict pages generated from each graph release.
- An embeddable evidence card for papers and grant applications.
- Dark-mode parity across the workbench.

# 8. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-100 | Hero headline | "See why the evidence conflicts." |
| D-101 | Show agent names publicly | Only on How it works and documentation; not in the workbench |
| D-102 | Visual direction | Keep the current dark graph hero and Host Grotesk; finish consolidation before any new visual exploration |
