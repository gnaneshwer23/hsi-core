# HSI landing page → backend matrix

**Audited tip (branch base):** `864710a` + Phase 8 landing integration PR  
**Production:** https://www.humansuperintelligence.tech/  
**As of:** 2026-11-09  
**Governing vision:** [`../strategy/HSI_VISION.md`](../strategy/HSI_VISION.md) — public copy and CTAs must align with doctrine **and** this matrix (no invented live write-spine).  
**Neon:** HSI red-wave only (`hsi-neon-project` placeholder in-repo; real id in private env). Never ISI autumn-snow.  

**Rule:** Fail-closed APIs; public demos keep `live_backend:false` until staging-verified. No live CDS/PHI.

Companion maps: [`HSI_PAGE_AND_ROUTE_MAP.md`](./HSI_PAGE_AND_ROUTE_MAP.md), [`HSI_BACKEND_SERVICE_MAP.md`](./HSI_BACKEND_SERVICE_MAP.md), [`../capability-status.json`](../capability-status.json).

### Status vocabulary (this matrix)

| Label | Meaning |
|-------|---------|
| **connected** | Public or auth path reaches a real gateway with verified fail-closed or live read behaviour |
| **static** | Page/content is marketing, educational, or versioned JSON — no live research write |
| **disconnected** | Control or copy implies a backend action that is missing, mislabelled, or dead-ends |
| **restricted** | Correctly gated (401/403) without session/role |

---

## 1. Inventory counts

| Bucket | Count | Notes |
|--------|------:|-------|
| App `<Route>` destinations (excl. `*`) | **59** | From `site/src/App.tsx` |
| Logical 32-template map | 32 | See page route map |
| **connected** (production probe) | **3** | Auth provider reachable; `/api/research/health` 200 `writesEnabled=false`; public static assets |
| **static** public/marketing/science explorers | **~40** | Render without research write spine |
| **disconnected / honesty-repaired** | **~8** | Access request non-persist; bare decision-workbench; briefs headline; brief CTA labels (repaired this PR); programme/gaps missing |
| **restricted** research APIs | **all research mutations + most GETs** | Anon **401**; writes **403** when `writesEnabled=false` |
| Fully connected research-write spine | **0** | Staging writes not proven on production |

---

## 2. Public marketing & access (matrix)

| Route | Audience | Content | Interactive | API / DB / auth | Backend availability | Error / loading | Acceptance tests |
|-------|----------|---------|-------------|-----------------|----------------------|-----------------|------------------|
| `/` | Public | Product instrument + multi-scenario demo | Scenario tabs, panels, domain buttons | None for demo; `live_backend:false` | static / illustrative | Demo banner honesty | `homeResearchScenarios`, editorial e2e, brief deep-link |
| `/platform` | Public | Platform overview | Links | none | static | n/a | editorial + nav audit |
| `/technology` | Public | Architecture narrative | Links | none | static | n/a | nav audit |
| `/how-it-works` | Public | Workflow narrative | Links | none | static | n/a | CTA secondary destination |
| `/products` | Public | Product directory | Links | none | static | n/a | publicSiteHonesty |
| `/solutions` | Public | Audience panels | Local audience state | none | static | n/a | nav audit |
| `/research` | Public | Research overview | Links | none | static | honesty: SSc = validation case | nav audit |
| `/evidence-safety` | Public | Evidence approach | Links | none | static | n/a | nav audit |
| `/pricing` | Public | Access framing | Links | none | static | grant not automatic | nav audit |
| `/contact` | Public | Access guidance | Account links only | **No access-request write** | static + honesty | Explicit: page does not store a request | contact copy + capability PUB-RESEARCH-ACCESS |
| `/science` | Public | Science hub | Links | none | static | n/a | editorial |
| `/community` | Public | Discussion rehearsal | Local comments | none (local only) | static / disconnected from moderation | Flag notifies nobody | honesty in UI |
| `/status` | Public | Status surface | none | optional health | static / connected health | fail soft | production QA |
| `/for-isi` `/for-aksh` `/for-trials` | Public | Boundary pages | Links | none | static | Trials: no live matching | editorial |
| `/sign-in` `/sign-up` | Public→auth | Neon Auth | Forms | `/api/auth/*` | **connected** (provider) | 503/403 on misconfig | auth diagnostics |
| `/forgot-password` `/reset-password` | Public | Recovery | Forms | `/api/auth/*` | connected | provider errors | password-recovery e2e |
| `/explore` `/docs` `/roadmap` `/alignment` `/sources` | Public | Supporting content | Links | none / static JSON | static | n/a | load smoke |
| `/discovery-engine` `/discovery` `/gateway` `/systems` `/evidence` `/curator` `/akeno` `/aksh-agents` `/clinical-timeline` `/trials-criteria` | Public demos | Boundary / thin demos | Local or static | discovery JSON under `site/public/discovery/` | static | honesty banners required | science / products e2e |

**Static-only + disconnected controls (public):**

- Homepage scenario/domain state was local-only → **repaired** with `?scenario=` / `?panel=` via `site/src/lib/researchContext.ts` (still illustrative; does not enable backends).
- “Open research brief” → `#product-demo` without opening brief panel → **repaired** (`panel=brief`).
- “Open brief workflow” labelled brief but linked `/how-it-works` → **repaired** to policy label “See How It Works”.
- `/contact` primary CTA → **no DB insert** for access requests (grants table exists; public path does not write) — honesty note shipped; persistence remains **BLOCKED** without inventing a form API.

---

## 3. Science explorers (educational)

| Route | Audience | Content | Interactive | Backend | Availability | Notes |
|-------|----------|---------|-------------|---------|--------------|-------|
| `/science/graph` | Public | Educational topic map | Graph UI | browser modules / static | static **connected to curated data** | Not governed SSC API |
| `/science/paths` `/science/body` `/science/disease` `/science/zoom` `/science/connections` | Public | Explorers | Local | static | static | |
| `/science/literature` `/science/study-comparison` `/science/review-preparation` `/science/contradictions` `/science/clinical-trials` `/science/research-agents` | Public | Research-preview UIs | Local / static | mostly none | static / LIMITED | Do not claim live literature binding |

---

## 4. Authenticated research workspace

| Route | Audience | Content | Interactive | API / DB | Availability | Error / loading | Acceptance |
|-------|----------|---------|-------------|----------|--------------|-----------------|------------|
| `/research/account` | Researcher | Grant / history | Session | `GET /api/research/account` | restricted → LIMITED when granted | 401 → sign-in | account client |
| `/research/dashboard` | Researcher | Investigations + fixtures | Workspace | investigations list/create | LIMITED / writes **off** on prod | 401 anon; create 403 writes off | dashboard e2e |
| `/research/decision-workbench` | Researcher | Interrogative sections | Needs `?investigation=` | interrogative APIs | restricted | Without id: fail-closed message; nav no longer deep-links bare | workbench |
| `/research/mechanism-workflow` | Researcher | Ask→export probe | Probes APIs | research gateway | LIMITED | fail-closed | mechanism e2e |
| `/research/scientific-workbench` | Researcher | Saved list / governed query | Session | graph/ssc etc. | restricted | 401 anon | |
| `/research/knowledge-graph` | Researcher+public shell | Claim/domain graph | Versioned JSON | static versions; governed discovery auth | static + restricted discovery | | claim-graph e2e |
| `/research/evidence-readiness` `/research/coverage` `/research/capabilities` `/research/validation` | Mixed | Catalogues / labs | Static JSON | synthetic validation | static | honesty: not clinical | validation e2e |
| `/research/governance` `/research/scientific-review` | Reviewer | Queue / decision | Role APIs | review APIs | **restricted** | 403 without authority; no Gate C auto-approve | |
| Programme route | — | — | — | — | **missing** | — | R03 |
| Gaps workspace | — | Embedded only | — | — | **missing** dedicated | — | R10 |

---

## 5. API dependency summary

| Surface | Auth | Prod behaviour |
|---------|------|----------------|
| `GET /api/research/health` | none | 200; `writesEnabled=false` |
| `GET/POST /api/research/investigations` | session | 401 anon; POST 403 writes off |
| `/api/research/interrogative/*` | session + id | 401/403 fail-closed |
| `/api/research/graph/ssc` `/discovery/ssc` | session | 401 anon |
| `/api/auth/*` | provider | reachable; signup ≠ grant |

Write gate: `HSI_RESEARCH_WRITES_ENABLED` + staging branch id + staging host — production intentionally fails.

---

## 6. Acceptance test index (existing)

| Suite | Covers |
|-------|--------|
| `test/homeResearchScenarios.test.ts` | Multi-scenario honesty |
| `test/researchContext.test.ts` | Context contracts |
| `test/publicSiteHonesty.test.ts` | Nav / product chips |
| `site/e2e/public-navigation-audit.spec.ts` | href ↔ Route |
| `site/e2e/editorial-landing.spec.ts` | Home demo + brief deep link |
| `site/e2e/production-qa.spec.ts` | Production smoke (when pointed at prod) |

---

## 7. Do not

- Mark research-write routes **connected** on production while `writesEnabled=false`.
- Add unrestricted DB/graph query endpoints for the public site.
- Claim `/contact` persists access requests without a verified write path.
- Hardcode disease lists as product boundaries (SSc remains a validation case).

## Approved public narrative restructure — 12 November 2026

Ten canonical public destinations: `/`, `/platform`, `/context-conflict-audit`, `/evidence-intelligence`, `/research`, `/research-briefs`, `/science`, `/applications`, `/trust`, `/about`. Existing routes remain available as secondary resources; authenticated tool routes and API contracts are preserved. `/contact` still saves a browser-only draft, not a delivered/persisted access request. New public content cannot grant source rights, provider activation, reviewer authority, scientific validation or graph publication. Implementation sequence and component audit: `docs/website/HSI_WEBSITE_RESTRUCTURE.md`.
