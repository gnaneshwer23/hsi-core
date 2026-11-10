# HSI Homepage Backend Connections

**Status:** Audit skeleton (PR1). Labels: **CONNECTED** | **ILLUSTRATIVE** | **BLOCKED**.  
**Do not** expose PHI or claim live CDS. Writes remain fail-closed until staging-verified.

## Summary matrix

| Homepage concern | Status | Evidence |
|------------------|--------|----------|
| Public narrative / SEO | CONNECTED | Static React + `applySeo`; capability `PUB-HOME-NARRATIVE` |
| Explore the Platform CTA | CONNECTED | `/platform` public route |
| Request Research Access | CONNECTED | `/contact` + account create/sign-in flows; access intent browser draft |
| Domain explorer context | ILLUSTRATIVE | URL `?domain=` + curated `HOME_DOMAINS`; graph edges not invented |
| Biology graph deep links | CONNECTED (read tools) | `/science/graph`, `/research/knowledge-graph` — public tools; governed graph needs auth |
| Data→intelligence diagram | ILLUSTRATIVE | `dataToDiscoveryArchitecture` honesty statuses; not live pipeline telemetry |
| Research workspace preview | ILLUSTRATIVE | Homepage/demo fixtures; `live_backend=false` |
| Investigation / evidence APIs | BLOCKED (anonymous) | `/api/research/*` requires session; writesEnabled=false |
| Sign In (guest chrome) | BLOCKED / deferred | Auth provider may be reachable (`research_preview`) but not product-ready for guest Sign In promo |
| Collaboration enquiry | CONNECTED | `/contact` workflows; no invented MoU |
| CDS / PHI | BLOCKED (non-goal) | Bound by `docs/CDS_PHI_BOUNDARY.md` |

## Per-section audit template

For each section document: component · route · backend · API contract · auth · data source · error · loading · interaction · verification.

### 1 Hero

| Field | Value |
|-------|-------|
| Component | `Home` / upcoming `HomeHero` |
| Route | `/` |
| Backend | none |
| Auth | none |
| Data | static copy + optimised images |
| Status | CONNECTED (static) |
| Interaction | CTAs → `/platform`, `/contact` |
| Test | e2e editorial landing + CTA href asserts |

### 2 Biology network

| Field | Value |
|-------|--------|
| Component | `HOME_DOMAINS` / `HomeEcosystem` |
| Backend | none for public selection; optional future approved graph read |
| Data | curated domain registry + illustrative paths |
| Status | ILLUSTRATIVE relationships; CONNECTED navigation targets where `to` set |
| Must not | Fabricate edges or equal-weight “complete coverage” |

### 3 Information → intelligence

| Field | Value |
|-------|--------|
| Component | `DataToDiscoveryArchitecture` / registry |
| Status | ILLUSTRATIVE architecture story with honest node statuses |
| Live telemetry | BLOCKED |

### 4 Research workspace

| Field | Value |
|-------|--------|
| Public preview | ILLUSTRATIVE curated demo |
| Authenticated programme / investigation / evidence / graph / brief services | BLOCKED without grant; preserve existing API contracts — do not duplicate |

### 5–8 Domains, workflow, integrity, applications

| Field | Value |
|-------|--------|
| Status | Mostly ILLUSTRATIVE copy + CONNECTED deep links to existing public pages |
| Integrity claims | No certifications invented |

### 9 Ecosystem

| Field | Value |
|-------|--------|
| Data | `ECOSYSTEM_PRODUCTS` maturity chips |
| Status | CONNECTED to honesty registry; integrations labelled planned vs implemented |

### 10 Access / collaboration

| Field | Value |
|-------|--------|
| Contact / access | CONNECTED |
| Access intent draft | CONNECTED (browser_only persistence) |
| Admin grant | Human-gated — not auto |

## Capability registry pointers

- `docs/capability-status.json` — CTA policy `workspace_requires_approval`  
- `site/docs/CAPABILITY_DATA_SOURCE_MATRIX.md`  
- Research health: writes disabled publicly  

## Verification checklist (PR5)

- [ ] Every homepage CTA HTTP 200  
- [ ] No console errors on `/`  
- [ ] No unauthorised research payload in public HTML  
- [ ] Playwright honesty / illustrative assertions updated  
- [ ] Screenshots desktop + mobile  
