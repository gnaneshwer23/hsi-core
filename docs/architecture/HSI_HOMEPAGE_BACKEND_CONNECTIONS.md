# HSI Homepage Backend Connections

**Status:** Audit after premium redesign (PR1–PR5).  
**Labels:** **CONNECTED** | **ILLUSTRATIVE** | **BLOCKED**

## Summary matrix

| Homepage concern | Status | Evidence |
|------------------|--------|----------|
| Public narrative / SEO | CONNECTED | Static React + `applySeo`; capability `PUB-HOME-NARRATIVE` |
| Explore the Platform CTA | CONNECTED | `/platform` |
| Request Research Access | CONNECTED | `/contact` + account flows; access intent browser draft |
| Hero imagery | CONNECTED (static) | `/images/homepage/*` webp+jpeg |
| Domain explorer context | ILLUSTRATIVE | URL `?domain=` + curated `HOME_DOMAINS` |
| Biology graph deep links | CONNECTED (read tools) | `/science/graph`, `/research/knowledge-graph` |
| Data→intelligence diagram | ILLUSTRATIVE | Honest stage statuses; no live pipeline telemetry |
| Research workspace preview | ILLUSTRATIVE | `HomeProductDemo` curated scenarios |
| Investigation / evidence APIs | BLOCKED (anonymous) | `/api/research/*` requires session; writesEnabled=false |
| Sign In (guest chrome) | BLOCKED / deferred | Auth `research_preview` — not product-ready guest Sign In |
| Collaboration enquiry | CONNECTED | `/contact` |
| CDS / PHI | BLOCKED (non-goal) | `docs/CDS_PHI_BOUNDARY.md` |

## Per-section

1. **Hero** — CONNECTED static + CTAs.  
2. **Biology network** — ILLUSTRATIVE relationships; CONNECTED destinations where `to` set.  
3. **Intelligence flow** — ILLUSTRATIVE architecture story.  
4. **Workspace** — ILLUSTRATIVE public preview; authenticated programme/investigation/evidence/graph/brief services remain BLOCKED without grant.  
5. **Discipline cards** — CONNECTED deep links; coverage honesty on destinations.  
6. **Workflow** — ILLUSTRATIVE steps; links to real modules.  
7. **Integrity** — CONNECTED copy only; no cert claims.  
8. **Applications** — ILLUSTRATIVE journeys with `live_backend=false`.  
9. **Ecosystem** — CONNECTED to `ECOSYSTEM_PRODUCTS` maturity.  
10. **Access** — CONNECTED `/contact` / `/how-it-works`.

## Capability registry pointers

- `docs/capability-status.json` — CTA policy `workspace_requires_approval`  
- `site/docs/CAPABILITY_DATA_SOURCE_MATRIX.md`  
- Research health: writes disabled publicly  

## Verification (PR5)

- [x] CTA destinations are real public routes  
- [x] No PHI / CDS claims on homepage  
- [x] copy:check / honesty tests updated for composed hero  
- [ ] Playwright full suite on Vercel preview (run in CI)  
- [ ] Desktop + mobile screenshots attached to PR5  
