# HSI landing page → backend matrix

**Website candidate:** approved five-PR public restructure (#291–#295); exact tested SHAs and CI evidence are recorded in the website handoff.
**Canonical public URL:** https://www.humansuperintelligence.tech/ — this change is not asserted deployed.
**Website mapping updated:** 2026-11-12. Backend/production observations retained below are historical 2026-11-09 observations, not fresh runtime or live-acceptance evidence.
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

## 1. Current website candidate inventory

| Bucket | Count | Evidence / limit |
|---|---:|---|
| Registered route destinations, including home and excluding catch-all | **75** | Actual distinct `App.tsx` paths; existing routes retained |
| Primary canonical public story | **10** | Home, Platform, Audit, Evidence Intelligence, Research, Briefs, Science, Applications, Trust, About |
| Pre-rendered public SEO pages | **22** | Ten canonical destinations plus retained secondary resources; build output |
| Noindex account/tool/secondary/redirect shells | **53** | Build output; no claim all are authenticated or private |
| Public source/model execution added | **0** | Synthetic local interactions only |
| New scientific/production activation authority | **0** | Website content and passing UI tests grant no authority |

Historic production observations in later sections are retained for traceability. Current runtime identity, write switches, providers and scientific acceptance cannot be inferred from them or from this website build.

---

## 2. Public marketing & access (matrix)

| Route | Audience | Content | Interactive | API / DB / auth | Backend availability | Error / loading | Acceptance tests |
|-------|----------|---------|-------------|-----------------|----------------------|-----------------|------------------|
| `/` | Public | Approved ten-section research narrative | Synthetic context comparison, six-step workflow, domains, layers and expandable brief | None for demonstrations | static / demonstration | Synthetic/source-free/not-reviewed labels | approved-website, editorial, axe and navigation suites |
| `/platform` | Public | Shared research foundation and three core roles | Selectable architecture layers and links | none | static / demonstration | Independent acceptance remains gated | approved-website + navigation + axe |
| `/technology` | Public | Architecture narrative | Links | none | static | n/a | nav audit |
| `/how-it-works` | Public | Workflow narrative | Links | none | static | n/a | CTA secondary destination |
| `/products` | Public | Product directory | Links | none | static | n/a | publicSiteHonesty |
| `/solutions` | Public | Audience panels | Local audience state | none | static | n/a | nav audit |
| `/research` | Public | One question through investigation and brief | Six-step workflow, candidate diagram and brief | none for public example | static / demonstration | SSc is a validation example; actual review not implied | approved-website + navigation + axe |
| `/evidence-safety` | Public | Evidence approach | Links | none | static | n/a | nav audit |
| `/pricing` | Public | Access framing | Links | none | static | grant not automatic | nav audit |
| `/contact` | Public | Access guidance | Browser-only draft and account links | **No access-request write or delivery** | static + honesty | Explicit local-draft status | contact e2e + capability PUB-RESEARCH-ACCESS |
| `/science` | Public | Biological scales and cross-domain questions | Selectable scales/domains; retained graph/body tools | none for public page | static / demonstration | Unequal maturity and candidate relationships explicit | approved-website + body/graph + axe |
| `/community` | Public | Discussion rehearsal | Local comments | none (local only) | static / disconnected from moderation | Flag notifies nobody | honesty in UI |
| `/status` | Public | Status surface | none | optional health | static / connected health | fail soft | production QA |
| `/for-isi` `/for-aksh` `/for-trials` | Public | Boundary pages | Links | none | static | Trials: no live matching | editorial |
| `/sign-in` `/sign-up` | Public→auth | Neon Auth | Forms | `/api/auth/*` | **connected** (provider) | 503/403 on misconfig | auth diagnostics |
| `/forgot-password` `/reset-password` | Public | Recovery | Forms | `/api/auth/*` | connected | provider errors | password-recovery e2e |
| `/explore` `/docs` `/roadmap` `/alignment` `/sources` | Public | Supporting content | Links | none / static JSON | static | n/a | load smoke |
| `/discovery-engine` `/discovery` `/gateway` `/systems` `/evidence` `/curator` `/akeno` `/aksh-agents` `/clinical-timeline` `/trials-criteria` | Public demos | Boundary / thin demos | Local or static | discovery JSON under `site/public/discovery/` | static | honesty banners required | science / products e2e |

**Historical public-control repairs (precede the approved website restructure):**

The former scenario-driven homepage component is no longer the canonical homepage. Its helper contracts remain for retained legacy components; the new homepage audit/brief has its own explicit illustrative controls. These historical bullets are not claims about the new homepage URL state.

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

## 5. Historical API dependency observations (9 November; not revalidated by website QA)

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

| New public surface | Actual behaviour | Backend/release boundary |
|---|---|---|
| Context-Conflict Audit | Deterministic synthetic six-dimension teaching comparison, explicit fictional assumptions and five display outcomes | No provider/model/source calls; no backend taxonomy mutation or scientific approval |
| Evidence Intelligence | Original fictional source/passages, missingness, context and permission explanation | No fabricated DOI/PMID, clearance or external-source authority |
| Research Briefs | Expandable source-free example and actual JSON/Markdown downloads | Every export retains not-reviewed/no-source/no-scientific-or-graph-approval status |
| Platform/Research/Science | Layered architecture, six-step workflow, candidate biology and links to retained tools | Describes intended workflow and current demonstrations; no live service acceptance is implied |
| Applications | Three research applications with explicit Demonstration/Restricted/Planned labels | No live patient integration, clinical decision support, trial matching or eligibility |
| Trust/About | Separate review/publication lifecycle, current boundaries, supplied scientific ownership and collaboration information | No invented expert appointments, partnerships, certification or legal policy approval |
| Header/footer/access | Ten canonical destinations, keyboard/mobile navigation, working notice anchors and existing account/contact routes | Contact remains browser-draft only; no request delivery, reviewer permissions or write activation |
