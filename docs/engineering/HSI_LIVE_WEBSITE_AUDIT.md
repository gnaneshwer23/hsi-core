# HSI live website audit — 2026-11-09

**Production origin:** https://www.humansuperintelligence.tech/  
**Repository tip audited:** `67f5492f73bd0f8a49b3f3edfc321dbf337bc496` (`main`, matches `origin/main`)  
**Vercel production deployment:** `dpl_2Nbu5TPB8q3xZf46s4Y6BgG3cVyK` (state `READY`, target `production`)  
**Auditor stance:** Verify live behaviour first. Do not invent credentials. Fixtures ≠ live science. Neon red-wave only.

Evidence folder: `docs/engineering/audit-evidence/live-2026-11-09/`

---

## Executive status (Phase 1–2)

| Area | Result |
|------|--------|
| Production deploy on tip | **Pass** — tip SHA matches live deploy meta |
| Custom domain / HTTPS / apex redirect | **Pass** — `www` verified; apex → www `308`; HTTP → HTTPS `308` |
| Research API health | **Pass** — `GET /api/research/health` → `configuration_validated`, `writesEnabled=false`, auth/DB prefixes `ep-hsi-production…` match |
| Auth provider diagnostics | **Pass** — `GET /api/auth/diagnostics` → `provider_reachable` |
| Fail-closed anonymous research | **Pass** — investigations / graph / session-diagnostics → `401` without provider session |
| Public HTML routes (58 sampled) | **Pass** — all HTTP `200` |
| Production runtime errors (24h) | **Pass** — no error/fatal runtime logs; no runtime-error records |
| Favicon / touch icon aliases | **Fail (P1)** — `/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png` → `404`; `/icon.svg` → `200` |
| Authenticated researcher journeys | **Blocked** — no production test credentials available; not invented |
| Destructive DB / write tests | **Not run on production** — writes intentionally disabled; staging required |

**First verified P0:** none confirmed on the public marketing + fail-closed research shell in this pass.  
**First verified P1:** `LIVE-001` missing conventional favicon / touch-icon assets.

---

## Phase 1 — Deployment verification

### 1.1 Git / deploy alignment

- Local `HEAD` == `origin/main` == production commit `67f5492…` (M20 synthetic demo acceptance merge `#144`).
- Production deployment inspector: Vercel project `hsi-core` / `prj_Wv1uct4a2dcmmx6rMWAGFsq4WoHz`.

### 1.2 Domains / TLS / redirects

| Check | Observed |
|-------|----------|
| `www.humansuperintelligence.tech` | Verified production domain; HTTPS `200` |
| `humansuperintelligence.tech` | Verified; redirect to `www` with `308` |
| HTTP → HTTPS | `308` |
| DNS A (www) | Resolves to Vercel edge addresses (`216.150.*`) |

### 1.3 Environment variables (names / presence only)

Values were **not** decrypted or printed.

- Live behaviour of `/api/research/health` proves production has a coherent `HSI_PUBLIC_ORIGIN`, auth base URL, and `HSI_DATABASE_URL` targeting **red-wave** host prefix `ep-hsi-production` (not ISI autumn-snow).
- `writesEnabled=false` confirms production write gate remains closed (expected; Gate C / live writes parked).
- Vercel MCP also lists Neon-integration preview-branch keys (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL`) on preview git branches. Those are **not** substitutes for HSI substrate keys; treat as hygiene to keep isolated from HSI red-wave contracts (see Suspected).

Evidence: `audit-evidence/live-2026-11-09/research-health.json`, `auth-diagnostics.json`.

### 1.4 Runtime logs

- `get_runtime_logs` production `error`/`fatal` last 24h: **none**.
- `get_runtime_errors`: **none** in selected window.

### 1.5 API smoke (anonymous)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/research/health` | 200 | `configuration_validated` |
| `GET /api/auth/diagnostics` | 200 | `provider_reachable`, credentials not tested |
| `GET /api/auth/get-session` | 200 | body `null` (anonymous) |
| `GET /api/research/session-diagnostics` | 401 | `BACKEND_PROVIDER_SESSION_REQUIRED` |
| `GET /api/research/investigations` | 401 | fail-closed |
| `GET /api/research/graph/ssc` | 401 | fail-closed |
| `GET /api/health` | 404 | **Not a product route** — correct health is `/api/research/health` |

---

## Phase 2 — Browser / route audit (public)

Tooling: Cursor IDE browser + HTTP status sweep. Playwright multi-viewport suite against production not yet committed in this pass (tracked below). Desktop + mobile (390×844) homepage snapshots taken.

### 2.1 Public route HTTP status (all 200)

`/`, `/platform`, `/research`, `/products`, `/science`, `/how-it-works`, `/sign-in`, `/sign-up`, `/contact`, `/evidence-safety`, `/research/dashboard`, `/research/decision-workbench`, `/research/mechanism-workflow`, `/research/knowledge-graph`, `/science/graph`, `/science/literature`, `/roadmap`, `/docs`, `/status`, `/sources`, `/explore`, `/technology`, `/solutions`, `/pricing`, `/gateway`, `/discovery`, `/curator`, `/akeno`, `/for-isi`, `/for-aksh`, `/for-trials`, `/alignment`, `/clinical-timeline`, `/trials-criteria`, `/systems`, `/evidence`, `/science/body`, `/science/connections`, `/science/zoom`, `/science/disease`, `/science/paths`, `/science/contradictions`, `/science/clinical-trials`, `/science/research-agents`, `/science/study-comparison`, `/science/review-preparation`, `/research/scientific-workbench`, `/research/scientific-review`, `/research/governance`, `/research/account`, `/research/validation`, `/research/coverage`, `/research/evidence-readiness`, `/research/capabilities`, `/forgot-password`, `/community`, `/aksh-agents`, `/discovery-engine`.

**Count:** 58 routes sampled → **58 functional HTTP 200** (shell HTML). Broken public HTML routes in this sample: **0**.

### 2.2 Interactive / UX notes (public)

| Route | Observation |
|-------|-------------|
| `/` | Hero, nav, CTAs, tabs render; mobile shows hamburger + Request access; no broken images in DOM sample |
| `/sign-in` | Auth enabled (`authBaseUrl` present). Brief “Checking session…” then form enables. Anonymous `get-session` → `null` |
| `/research/dashboard` | Public shell loads; “Research workspace unavailable” + synthetic fixtures secondary — **expected** without verified session |
| `/contact` | Hard navigation OK. Soft-nav race from Sign in → Request access previously suspected; **not reproduced as hard failure** this pass |

### 2.3 Assets

| Asset | Status |
|-------|--------|
| `/icon.svg` | 200 (linked from HTML) |
| `/favicon.ico` | **404** |
| `/favicon.svg` | **404** |
| `/apple-touch-icon.png` | **404** |
| `/logo.svg` | 404 (not linked from homepage HTML) |
| `/robots.txt`, `/sitemap.xml` | 200 |

Homepage SEO: `robots=index, follow, max-image-preview:large`, canonical present, prerendered. Dashboard shell correctly `noindex`.

---

## Phase 3 — Research workspace (authenticated)

**Status: BLOCKED — unavailable tests**

No production test accounts were provided. Credentials were **not** invented. Demo synthetic personas from M20 are fixture/demo-only and must not be treated as live production operators.

Blocked workflows (all): sign-up/sign-in success path with real session cookie, session persistence, programme create/persist, biomedical evidence search against live connectors, agent execution, KG exploration with authorised data, mechanism / contradiction / hypothesis / experiment / review / export, sign-out return.

Anonymous fail-closed behaviour on research APIs is verified (see Phase 1.5).

---

## Phase 4–5 — Backend / scientific functionality

| Item | Status |
|------|--------|
| Neon red-wave alignment | **Verified via health prefixes** (`ep-hsi-production`) |
| Production research writes | **Parked** (`writesEnabled=false`) — intentional |
| Live SSc Tfh–IL-21–B-cell end-to-end with persistence | **Not run** — requires authorised staging/session + human review gates |
| Scientific acceptance claims | **None** — engineering probes only |

---

## Issue register

### Verified defects

#### LIVE-001 — Missing conventional favicon / touch-icon aliases

| Field | Value |
|-------|-------|
| **Severity** | **P1** |
| **Affected URL** | https://www.humansuperintelligence.tech/favicon.ico (also `/favicon.svg`, `/apple-touch-icon.png`) |
| **Reproduction** | 1. Open production site. 2. `GET /favicon.ico` (browser default request). 3. Observe HTTP 404 while `/icon.svg` returns 200. |
| **Evidence** | `audit-evidence/live-2026-11-09/favicon-ico.headers`; live HTML only declares `<link rel="icon" href="/icon.svg">` |
| **Root cause** | `site/public` ships `icon.svg` only; no `favicon.ico` / `favicon.svg` / apple-touch asset and no rewrite alias |
| **Source file** | `site/index.html`; `site/public/icon.svg`; SEO/build head injection |
| **Backend dependency** | None (static asset) |
| **Proposed correction** | Smallest safe: add `favicon.svg` copy of brand mark; add `apple-touch-icon` PNG or SVG-compatible link; rewrite or serve `/favicon.ico` → brand mark; extend `index.html` / SEO head links; add e2e/assert HTTP 200 for aliases |
| **Acceptance test** | Production/preview: `/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png` (or documented SVG apple-touch) return 200; homepage head lists them; Playwright/asset smoke green |
| **Resolution status** | **Fix PR open** — https://github.com/gnaneshwer23/hsi-core/pull/145 (static aliases + SEO head links + e2e asset asserts); pending preview/production verify after merge |

### Suspected (not confirmed)

| ID | Severity | Note |
|----|----------|------|
| LIVE-S01 | P2 | Soft client navigation Sign-in → `/contact` briefly flashed wrong view under automation earlier; hard nav OK — needs deterministic Playwright repro |
| LIVE-S02 | P2 | Neon integration preview-branch `DATABASE_URL` / `NEON_AUTH_*` keys coexist with HSI_* on preview; confirm they never target ISI autumn-snow and never override production HSI red-wave |

### Unavailable / blocked tests

| ID | Severity | Note |
|----|----------|------|
| LIVE-B01 | — | Authenticated researcher E2E (Phase 3) — no credentials |
| LIVE-B02 | — | Production write/persistence tests — writes disabled by design; use staging |
| LIVE-B03 | — | Full Playwright matrix (desktop/tablet/mobile × every route × a11y axe) — queued after LIVE-001 fix branch |
| LIVE-B04 | — | Live SSc scientific provenance acceptance — requires human review / Gate C policy; eng probes only |

### Intentional non-defects

- Anonymous dashboard “Research workspace unavailable” with synthetic secondary fixtures.
- `writesEnabled=false` on production.
- Research API `401` without provider session.
- Tool/account shells `noindex`.

---

## Severity summary (this pass)

| Severity | Verified open | Suspected | Blocked tests |
|----------|---------------|-----------|---------------|
| P0 | **0** | 0 | — |
| P1 | **1** (`LIVE-001`) | 0 | — |
| P2 | 0 | 2 | — |

---

## Next remediation order (Phase 7+)

1. Fix `LIVE-001` on branch `eng/live-website-audit-favicon` (smallest static/SEO change + regression).
2. Expand Playwright production smoke for asset aliases + public routes (no credential inventing).
3. When staging researcher credentials exist: Phase 3–5 register updates; never auto-promote scientific GO.
4. After fixes verified on preview: `docs/engineering/HSI_WEBSITE_REPAIR_REPORT.md` + GO / LIMITED GO / NO-GO.

**Current recommendation for live ops:** **LIMITED GO — public marketing shell + fail-closed APIs.** Authenticated research and scientific acceptance remain **NO-GO** until credentials + staging write path + human gates clear.
