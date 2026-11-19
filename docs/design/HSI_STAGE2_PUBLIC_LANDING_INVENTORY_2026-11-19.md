# HSI Stage 2 — Public landing inventory & PR plan

**Date:** 19 November 2026 (Europe/London)  
**Branch:** `cursor/public-landing-design-system-2f71`  
**Status:** Implementation inventory for Stage 2 (enhance existing Vite/React site — do not replace architecture)  
**Governing vision:** [`../strategy/HSI_VISION.md`](../strategy/HSI_VISION.md), [`../strategy/HSI_DEFINITIVE_PRODUCT_VISION.md`](../strategy/HSI_DEFINITIVE_PRODUCT_VISION.md)  
**Brand Stage 1:** [`HSI_PREMIUM_BRAND_IDENTITY_REDESIGN_2026-11-18.md`](./HSI_PREMIUM_BRAND_IDENTITY_REDESIGN_2026-11-18.md)  
**Execution audit:** [`../strategy/HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md`](../strategy/HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md)

---

## 1. Existing page inventory (production routes today)

| Stage 2 page | Main message (target) | Current route | Status |
| --- | --- | --- | --- |
| Homepage | Connect science, challenge evidence, advance discovery | `/` (`Home` / editorial + research-public layers) | Live — needs Stage 2 hero/sections upgrade (PR2) |
| Platform | Question → evidence-grounded decision | `/how-it-works` (`HowItWorks`); `/platform` **redirects** here | Live narrative — upgrade in PR2; keep redirect |
| Researchers | Personal scientific intelligence | `/researchers` (`ResearchersPublicPage`) | Live thin audience page — deepen in PR3 |
| Research Groups | Connected research for PIs/teams | `/enterprise` (+ professor/student shells) | Marketing page in PR3 (`cursor/stage2-researchers-groups-2f71`); shells remain demo |
| Biotech & Pharma | Mechanism / translational R&D | `/biotech` (+ `/enterprise/biotech` demo) | Marketing deepened in PR4 (`cursor/stage2-biotech-clinical-lab-2f71`) |
| Clinical Research | Evidence-grounded translational research | `/clinical` (+ `/enterprise/clinical` demo) | Marketing page in PR4; demo shell retained |
| Laboratories & Omics | Experimental data + biological evidence | `/laboratories` (+ `/enterprise/lab` demo) | Marketing page in PR4; demo shell retained |
| Community | Scientific discussion / collaboration | `/enterprise/community`; `/community` redirects to `/research/home` | Demo shell; keep `/community` redirect; marketing page in PR5 |
| Scientific Validation | Provenance, uncertainty, reliability | `/validation` (+ `/trust` governance) | Live methodology page — deepen in PR5 |
| Pricing & Access | Individual / group / organisational access | `/contact` (access draft); `/pricing` **redirects** to `/contact` | No priced tiers — planned labels only in PR5 |

**Also indexed public:** `/knowledge-graph`, `/trust`, `/about`, `/contact`.  
**Auth:** `/sign-in`, `/sign-up`, password recovery, `/research/account`.  
**Do not duplicate:** Stage 4 demo dashboards under `/enterprise/*` and `/workspaces/*` (open soft-lands / related PRs).

### Open PRs to avoid duplicating

| PR | Topic | Relation to Stage 2 |
| --- | --- | --- |
| #511 | E2E-09 premium public pages soft-land | Honesty catalog for researchers/biotech/validation — **reuse, do not fork** |
| #513 / #514 | Enterprise + multi-workspace demo shells | Stage 4 previews — link as labelled demos only |
| #371 | Editorial scientific website (draft) | Historical visual PR — do not revive parallel site |
| #512 | Passport soft-land | Research tooling, not public IA |

---

## 2. Reusable components (keep / extend)

| Component | Path | Role in Stage 2 |
| --- | --- | --- |
| `Nav` / `Footer` | `site/src/components/Nav.tsx`, `Footer.tsx` | PR1 — shared chrome + audience menu |
| `primaryNav` | `site/src/lib/primaryNav.ts` | Canonical public IA + honesty gates |
| `MarketingPage` family | `site/src/components/marketing/MarketingPage.tsx` | Hero / section / CTA / journey primitives |
| `ResearchPublic` | `site/src/components/public/ResearchPublic.tsx` | PublicAction, PublicHero, Maturity, workflow |
| Audience pages | `site/src/pages/AudiencePublicPages.tsx` | Researchers / Biotech / Validation bodies |
| `ctaPolicy` | `site/src/lib/ctaPolicy.ts` | Real destinations only |
| Tokens CSS | `research-public.css`, `premium-hsi.css`, `hsi-visual-tokens.css`, `enterprise-dashboard.css` | Overlapping palettes — Stage 2 layer unifies public chrome |
| Honesty tests | `test/publicSiteHonesty.test.ts` | Must stay green; update only when IA deliberately changes |
| SEO prerender | site build + public SEO scripts | Preserve; unique titles/descriptions per page in later PRs |

---

## 3. Design differences vs Stage 1 comps / tokens

| Axis | Stage 1 brand doc (`hsi-brand-tokens.v1.json`) | Live site today | Stage 2 brief (this programme) |
| --- | --- | --- | --- |
| Hero ground | Midnight `#0B1720` + signal mint `#58C6B6` | Ivory/navy research-public + layered premium pastel | Navy `#101D2A` / deep `#08121E`, burgundy `#963E56`, rose `#C45267`, teal `#427B79`, off-white `#F7F7F8` |
| Type | Instrument Serif + Geist preferred | Host Grotesk + Red Hat Display (e2e-locked) | Keep Host Grotesk / Red Hat; optional display serif only if perf-safe |
| Positioning | One platform (correct) | Honesty tests still assert four named products on home surface | **Doctrine:** one HSI scientific intelligence — no marketed portfolio; maturity chips stay for ownership honesty, not public portfolio promo |
| Nav IA | Home / How it works / KG / Trust / About + Sign up | Matches Stage 1 live nav | Platform, Audiences, Validation, Resources, Pricing & Access, Sign in, Get Access |
| Validation route | Doc still says no production `/validation` | **Route exists** | Treat `/validation` as canonical methodology page |

**Resolution for PR1:** Introduce `stage2-landing` token layer aligned with enterprise navy/burgundy already in `enterprise-dashboard.css`, without deleting Stage 1 token JSON (tests pin midnight/mint). Homepage visual rewrite stays PR2.

---

## 4. Proposed route mapping (no conflicting URLs)

| Nav label | Destination | Notes |
| --- | --- | --- |
| Platform | `/how-it-works` | Keep `/platform` → redirect |
| Audiences ▾ Researchers | `/researchers` | |
| Audiences ▾ Research Groups | `/enterprise` | Demo-labelled until PR3 marketing page |
| Audiences ▾ Biotech & Pharma | `/biotech` | |
| Audiences ▾ Clinical Research | `/clinical` | Demo remains at `/enterprise/clinical` |
| Audiences ▾ Laboratories | `/laboratories` | Demo remains at `/enterprise/lab` |
| Audiences ▾ Research Community | `/enterprise/community` | Do **not** revive `/community` as marketing (redirects to research home) |
| Scientific Validation | `/validation` | |
| Resources | `/knowledge-graph` | Trust remains linked from footer / page body |
| Pricing & Access | `/contact` | Keep `/pricing` → `/contact`; **never** put retired path strings in `primaryNav.ts` |
| Sign in | `/sign-in` | Existing auth |
| Get Access | `/contact` | Replaces header “Sign up” CTA; `/sign-up` remains reachable |

**Honesty constraint:** `primaryNav.ts` must not contain path strings `/platform`, `/science`, `/solutions`, `/pricing`, `/technology`, `/evidence-safety`, `/modules`, etc. Audience menu export is named `AUDIENCE_NAV_LINKS` (UI label “Audiences” / “Solutions” is render-only).

---

## 5. First six PR scopes

| PR | Scope | Out of scope |
| --- | --- | --- |
| **1** | Shared Stage 2 tokens CSS, landing primitives, Nav (audience menu), Footer, `primaryNav`, honesty/brand-doc sync | Homepage/platform rewrite; new audience pages |
| **2** | Homepage + Platform (`/how-it-works`) Stage 2 story, USPs, workflow preview — branch `cursor/stage2-homepage-platform-2f71` | Billing; fake metrics |
| **3** | Researchers + Research Groups marketing pages + truthful previews — branch `cursor/stage2-researchers-groups-2f71` | Org writes; supervisor auto-access to private student work |
| **4** | Biotech, Clinical Research, Laboratories landings + governance copy — branch `cursor/stage2-biotech-clinical-lab-2f71` | PHI, CDS, live instruments/datasets claims |
| **5** | Community, Validation deepen, Pricing & Access (Planned tiers), CTAs | Invented prices/subscriptions; fake testimonials |
| **6** | Integrated QA: a11y, SEO, responsive, copy audit, owner visual review | Deploy/merge without approval |

---

## 6. Conflicts with canonical product doctrine

1. **One platform, not a portfolio** — Vision (13 Nov 2026) forbids marketing four products; `publicSiteHonesty` still requires Aksh / Clinical / ISI / Trials strings on the home surface. Stage 2 pages must lead with HSI + USPs; four-product names stay ownership/maturity honesty, not hero portfolio.
2. **No invented validation** — Validation page may only cite real artefacts; no benchmark scores or independent approvals.
3. **No PHI / live CDS** — Clinical marketing must stay literature/translational + future governed integration language.
4. **Contact honesty** — Access forms must not claim email sent / pilot booked without backend confirmation.
5. **Held migrations** — Do not apply production research-write migrations for marketing CTAs.
6. **Stale IA docs** — `HSI_PUBLIC_SITE_IA_AND_PAGE_SYSTEM.md` marked superseded; brand redesign table still partially stale (`/validation` live). Stage 2 inventory is the working map for this programme.

---

## 7. Exact files for PR 1

| File | Change |
| --- | --- |
| `docs/design/HSI_STAGE2_PUBLIC_LANDING_INVENTORY_2026-11-19.md` | This inventory |
| `docs/design/hsi-stage2-landing-tokens.v1.json` | Stage 2 palette + type notes |
| `docs/design/HSI_PREMIUM_BRAND_IDENTITY_REDESIGN_2026-11-18.md` | Live nav / validation route truth |
| `site/src/styles/stage2-landing.css` | Shared Stage 2 public chrome tokens |
| `site/src/main.tsx` | Import Stage 2 CSS |
| `site/src/lib/primaryNav.ts` | Stage 2 labels + `AUDIENCE_NAV_LINKS` + Get Access CTA |
| `site/src/components/Nav.tsx` | Audience dropdown + mobile audience list |
| `site/src/components/Footer.tsx` | Audience + validation links |
| `site/src/components/landing/LandingPrimitives.tsx` | Shared maturity / hero / section / CTA primitives |
| `test/publicSiteHonesty.test.ts` | CTA + nav expectations |
| `test/hsiBrandTokens.test.ts` | Validation route truth |
| `test/stage2LandingNav.test.ts` | Audience menu + token presence |

**Do not merge or deploy without owner approval.**
