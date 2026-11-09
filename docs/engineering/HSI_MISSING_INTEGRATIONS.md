# HSI missing integrations (prioritised)

**Audited tip:** `864710a`  
**Rule:** Critical connections before new pages. No production merge of write enablement without staging proof. No Gate C auto-approve / invented MoU / shared Neon / CDS-PHI.

---

## 1. Critical missing connections

| Priority | Gap | Impact | Evidence |
|----------|-----|--------|----------|
| P0 | Production/staging researcher test identity + documented staging write path | Cannot verify full spine | Release decision NO-GO |
| P0 | Investigation create → reopen → brief on staging | “Connected product” claim false | `writesEnabled` gate |
| P0 | Preserve single investigation id across dashboard, workbench, graph, brief, review | Journey fragments | Route map R04/R11/G02 |
| P1 | Programme entity + UI (parent of investigations) | IA step missing | No migration/route |
| P1 | Dedicated gaps workspace (or first-class panel keyed by investigation id) | R10 missing | Embedded only |
| P1 | Dedicated research-brief route keyed by investigation id | Users can’t bookmark brief | API-only |
| P2 | Credentialed Playwright E2E against staging | Regressions invisible | Auth E2E blocked |
| P2 | `databaseConnectionTested` / deeper health | Ops blind spot | health JSON |
| P3 | Live literature binding (when licensed) | Demo stays curated | homepage `live_backend=false` |
| P3 | Agent runtime as product surface | Must stay off public CTAs until verified | ARCH-009 |

---

## 2. Broken navigation / API list

1. **Anon → writable research:** correctly blocked; product copy must not imply otherwise.  
2. **Workbench “Query governed graph” without session:** 401 — UI should keep failing closed with clear copy (verify all call sites).  
3. **Programme navigation:** dead end — no target.  
4. **Gaps as standalone module:** no route; deep links land on home demo or science explorers.  
5. **Discovery / agents pages:** risk of looking “live” — keep honesty banners.

---

## 3. Database / migration gaps

| Need | Status |
|------|--------|
| Interrogative investigations | Present (007+) |
| Review delivery / brief | Present (015) |
| Graph context | Present (014) |
| Research access grants | Present (006) |
| **Programmes** | **Missing** |
| Public capability registry table | File-based `docs/capability-status.json` only |

---

## 4. Agent runtime integration status

| Claim | Status |
|-------|--------|
| Durable checkpoints schema | Migrated |
| Public live scientific agent product | **Not available** |
| Deterministic local analysis | Available in constrained modes |
| Gate C auto-approve | **Forbidden** |

---

## 5. Scientific review status

| Item | Status |
|------|--------|
| Reviewer authority tables | Present |
| Queue + decision APIs | Present; role-gated |
| Independent human review required | Binding |
| Production adjudicated SSc claims | **Not claimed** |

---

## 6. Recommended implementation sequence (PR boundaries)

Do **not** combine these into one mega-PR.

| PR | Title | Scope | Exit criteria |
|----|-------|-------|---------------|
| PR-A | Staging research write verification harness | Docs + scripts + secrets checklist for staging branch only | Staging health shows `writesEnabled=true`; prod remains false |
| PR-B | Investigation spine E2E (staging) | Playwright/API: create → get → graph-context → brief | Green on staging; no prod write flag |
| PR-C | Unified investigation URL scheme | Deep links `/research/investigations/:id` (or query) shared by dashboard/workbench/brief | Same id round-trips; 404 honesty |
| PR-D | Programme minimal model | Migration + API + thin UI parent | Investigation belongs to programme; no fake science |
| PR-E | Gaps + brief pages | R10/R11 routes bound to investigation id | Bookmarkable; export works on staging |
| PR-F | Credentialed CI against staging | Store test user via secret manager | Nightly/staging gate |
| PR-G | Public IA nav cleanup | Wire primary nav to 32-template journeys; demote orphan demos | No new capabilities implied |

**Explicit non-goals for these PRs:** enabling production writes; Gate C automation; PHI/CDS; immunecity Neon; DeliverX.

---

## 7. What not to build next

- More marketing pages before PR-B/C.  
- New graph visualisations without investigation id binding.  
- “AI discovered” CTAs.  
- Duplicate routes that shadow working components.

---

## 8. Success criterion (restated)

> HSI operates as one connected scientific research product, not a collection of independent pages.

**Current production stance:** connected **shell** + fail-closed APIs + illustrative demos = **LIMITED GO**.  
**Full connected scientific product:** **NO-GO** until staging spine (PR-A–C) passes human review.
