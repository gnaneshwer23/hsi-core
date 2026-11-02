# HSI Existing UX Audit (§8.1)

**Document status:** Definitive Phase 0 UX audit for the Product Experience & UX pack (§8)  
**PRD companion:** [`HSI_DESIGN_SYSTEM_AND_UX.md`](./HSI_DESIGN_SYSTEM_AND_UX.md) (Document 04 Spec) is the canonical product UX companion; this file is Observed evidence. Honesty: [`HSI_DOC02_03_RECONCILIATION.md`](./HSI_DOC02_03_RECONCILIATION.md).  
**Audit date:** 2026-11-02  
**Method:** Local repos + reachable public sites. No product code changed.  
**Classification key:** **Verified** · **Partial** · **Mocked** · **Broken** · **Missing** · **Not assessed**

**Sources**

| Surface | Local | Public |
|---------|-------|--------|
| HSI Core site | `~/Projects/hsi-core/site/` | https://hsi-core.vercel.app |
| ISI (Immune Super Intelligence) | `~/Desktop/immune-city` | https://www.immune-super-intelligence.co.uk |
| Aksh Health | `~/Projects/aksh-health-redesign/packages/platform-uk` | https://www.akshhealth.com |

**Honesty rule:** Do not treat synthetic demos, Gate C mocks, or “in validation” agents as live clinical capabilities.

---

## 1. Summary verdict

| Product | UX maturity | Credibility | Main misalignment |
|---------|-------------|-------------|-------------------|
| **ISI** | Strong researcher IA | High (honest coverage labels) | Dual Discovery (Radar vs HSI); agent/theatre risk if over-labelled |
| **hsi-core site** | Improved research-intelligence narrative | High on Discovery/evidence honesty; mixed secondary pages | Still substrate/engineering gravity; not four-product ecosystem story |
| **Aksh** | Deep clinic/patient demos | High honesty on synthetic / shadow / HITL | Parallel dashboards ≠ one clinician journey; HSI Clinical / Trials Missing |
| **HSI Clinical** | — | — | **Missing** as product UX |
| **HSI Trials** | Flag-gated melanoma educational UI in ISI | Educational only | Dedicated trial-team workspace **Missing** |

---

## 2. HSI Core site (`site/` · hsi-core.vercel.app)

### 2.1 Routes / IA

| Route | Purpose | Classification |
|-------|---------|----------------|
| `/` | Research-intelligence homepage (evidence backbone for ISI) | **Verified** (live; narrative improved vs prior roadmap-first) |
| `/discovery` | Discovery Centre ASK→MAP→REVIEW on published packs | **Verified** (pack-backed) |
| `/evidence` | Evidence / grades explainer | **Verified** / **Partial** |
| `/for-isi` | ISI consumer framing | **Verified** |
| `/for-aksh` | Aksh as separate clinical consumer | **Partial** (copy boundary OK; not product handoff UX) |
| `/curator` | Gate C curator UX | **Verified** pattern / **Partial** product polish |
| `/systems` | Systems diagrams | **Partial** (architecture teaching) |
| `/roadmap` | P0–P3 build phases | **Verified** as secondary; **misaligned** if used as primary story |
| `/docs` | How to use / technical | **Partial** |
| `/alignment`, `/akeno`, `/aksh-agents` | Alignment / Akeno / agent directories | **Partial** / **Mocked** risk — engineering altitude in product chrome |

**Primary nav (live):** Discovery · Evidence · For ISI · Systems · Curator · CTA “How to use”.

**What primary nav is not:** Vision · four products · Available vs In development · collaboration — those belong on the **public HSI ecosystem** site ([`HSI_PUBLIC_WEBSITE_SPECIFICATION.md`](./HSI_PUBLIC_WEBSITE_SPECIFICATION.md)).

### 2.2 Visual / interaction

| Aspect | Finding | Class |
|--------|---------|-------|
| Visual system | Cobalt / navy / cream / glass (`DESIGN_NOTES.md`); Host Grotesk + mono | **Verified** local design |
| Hero narrative | “Evidence backbone for immune-science discovery” | **Verified** |
| Discovery data | Committed `/discovery/*.json` from `bun run outputs` | **Verified** |
| Gate C / grades UI | Mock components labelled illustrative on homepage | **Mocked** presentation of **Verified** Gate C rules |
| Responsive | Nav drawer present | **Partial** (not formally WCAG-audited here) |
| Accessibility | Basic ARIA on nav | **Not assessed** (full AA) |

### 2.3 Credibility

**Strengths:** Scope-locked RA / anti-TNF examples with PMIDs; Implemented / Planned / Future concept maturity bands; explicit “not CDS / no PHI”; competing frames kept visible.

**Engineering-roadmap vs product messaging**

| Issue | Severity | Notes |
|-------|----------|-------|
| `/roadmap` still frames P0–P3 climb as product altitude | Medium | Acceptable as **secondary**; homepage correctly demotes it |
| `/aksh-agents`, `/akeno`, `/systems` expose internal architecture | Medium | Visitors may read agents/plugins as shipped product |
| Nav leads with substrate tools (Curator, Systems) over ecosystem roles | Medium | Fits **substrate site**; fails **ecosystem public site** brief |
| “Human Systems Intelligence” naming vs vision “Health Super Intelligence” | Low–Medium | Brand hierarchy unresolved (D1) |

---

## 3. ISI — Immune Super Intelligence (immune-city · immune-super-intelligence.co.uk)

### 3.1 Routes / IA

**Primary:** `JOURNEY_NAV` — Explore · Research · Academy · Community · Ask Immune (**Verified**, reuse candidate).

| Area | Routes (representative) | Class |
|------|-------------------------|-------|
| Explore | `/explore`, `/atlas`, `/atlas/$id`, `/graph`, `/mechanism`, `/dynamics`, `/disease`, `/therapy`, `/learn`, `/overview` | **Verified** |
| Research | `/research`, `/discovery` (Radar), `/hsi/discovery`, `/evidence`, `/reasoning`, `/simulator`, `/patient`, `/pipeline` | **Verified** / **Partial** |
| Ask | `/ask` + corner FAB | **Verified** (graph-grounded; honesty: not fully evidence-grounded AI) |
| Academy | `/academy`, lessons via mechanism | **Partial** (foundation open; intermediate/advanced unfinished — labelled) |
| Community | `/community/*` | **Partial** |
| HSI consume | `/hsi-consume`, `/hsi/discovery` | **Verified** wiring path (consume contract) |
| Trust | `/methods`, `/disclaimer`, `/accessibility` | **Verified** (Methods honesty strong) |
| Auth / curation | `/_authenticated/*`, roles in `user_roles` | **Verified** pattern |
| Trial Intelligence | Melanoma pilot, flag-gated | **Partial** / educational — **not** Trials product |

### 3.2 Visual / interaction

| Aspect | Finding | Class |
|--------|---------|-------|
| Theme | `biotech.css` + `isi.css` semantic tokens (teal/navy/ivory) | **Verified** |
| Journey anatomy | PageHead → Toc → Sections → JourneyNext | **Verified** |
| Graph | D3 `GraphView` behind ClientOnly | **Verified** |
| Evidence folds | Closed-by-default Sources | **Verified** |
| Draft vs core | Draft extensions labelled | **Verified** |
| Ask grounding | `askGrounding.ts` + rate limits | **Verified** |

### 3.3 Credibility

**Strengths:** Live coverage numbers (e.g. reviewed claims fraction); unreviewed labelled; Methods page separates ID verification vs claim approval; omics/agents marked interface-only / not live; Trial Intelligence non-causal warnings.

**Gaps / risks**

| Issue | Class |
|-------|-------|
| Research Radar vs HSI Discovery dual loop — copy clarity still needed | **Partial** |
| Homepage pathway demos may show “Unreviewed” heavily — honest but can read incomplete | **Verified** honesty / UX tension |
| `/patient` teaching layer vs Aksh patient product naming | **Partial** (educational only — keep labelled) |
| Reproducible research **brief** artifact | **Partial** / **Missing** as first-class object |
| Cross-domain clinical→biology→trials UX | **Missing** |

---

## 4. Aksh Health (platform-uk · akshhealth.com)

### 4.1 Public marketing (akshhealth.com)

| Surface | Finding | Class |
|---------|---------|-------|
| Homepage | Diabetes clinic coordination; synthetic labelled; shadow mode; HITL | **Verified** |
| `/product` | Slot fill + glucose monitoring “available now”; synthesis “in validation” | **Verified** honesty |
| Agents narrative | Fourteen agents “in validation on synthetic”; clinician checkpoint | **Partial** (product exists; clinical live use **not** claimed) |
| Live orgs | Marketing / product copy aligns with `LIVE_ORGANISATIONS=0` posture | **Verified** (no live clinical claim) |

### 4.2 App routes / IA (local)

| Workspace | Routes (representative) | Class |
|-----------|-------------------------|-------|
| Patient | `/dashboard/patient`, intake, companion flows | **Partial** |
| GP / clinician | `/dashboard/gp`, patients/`[id]`/* (360, timeline, CGM, meds, agents…) | **Partial** / deep demo |
| Nurse / pharmacist | `/dashboard/nurse`, `/dashboard/pharmacist` | **Partial** |
| Review / HITL | `/dashboard/gp/review-queue`, `/review/*`, cases | **Verified** pattern (HITL) |
| Onboarding | `/onboarding/role-select` → identity → org → … | **Verified** |
| Admin / ICS / hospital | Many `/dashboard/*` roles | **Partial** / **Mocked** breadth vs diabetes core |
| Researcher (Aksh) | `/dashboard/researcher` | **Partial** — not ISI |
| Demos | `/demo/slot-fill`, `/demo/glucose`, connected-diabetes | **Mocked**/illustrative (labelled) |

### 4.3 Visual / interaction / credibility

| Aspect | Finding | Class |
|--------|---------|-------|
| Brand | Clinical navy / green role colours; clinic worklists | **Verified** local |
| HITL microcopy | Accept / Edit / Reject; missing shown as missing | **Verified** strength |
| Synthetic banners | Consistent on public demos | **Verified** |
| Agent names in UI | Agent-ops / agent-intelligence surfaces | **Partial** — conflicts with §8 “no agent names in primary UI” target |
| Universal hospital timeline | Not present | **Missing** (HSI Clinical) |
| HSI evidence consume | Not in Aksh clinical UX | **Missing** |
| Fabricated measurements | Product rules reject guessing; demos synthetic | **Verified** posture |

---

## 5. Cross-product feature matrix (target UX vs today)

| Target capability | ISI | hsi-core site | Aksh | Class |
|-------------------|-----|---------------|------|-------|
| Public ecosystem story (4 products) | Partial (ISI-only brand) | Partial (substrate + ISI) | Aksh-only | **Missing** unified |
| Researcher Q→Brief | Strong Q→Graph; Brief Partial | Discovery Partial | N/A | **Partial** |
| Clinician Search→Timeline→Evidence | N/A | N/A | Timeline Partial; Evidence **Missing** | **Missing** Clinical product |
| Patient My Health→Monitoring | Educational `/patient` only | N/A | Partial companion | **Partial** (Aksh) |
| Trial criteria 5 states | Melanoma educational Partial | N/A | N/A | **Missing** Trials UX |
| Evidence categories 1–5 in UI | Partial (review statuses) | Grades Partial | Cat 1 Partial | **Partial** |
| Workspace switcher | Account menus only | None | Role dashboards | **Missing** |
| Fake confidence % | Avoided in Methods; KG has confidence fields — monitor | N/A | Avoid unexplained scores | **Partial** governance |

---

## 6. Top UX misalignments (priority)

1. **No single public HSI ecosystem site** matching vision — three brands, three stories.  
2. **hsi-core secondary pages / nav** still pull visitors into engineering systems and agent directories.  
3. **HSI Clinical and HSI Trials workspaces missing** — journeys documented, UX not shipped.  
4. **Aksh multi-dashboard sprawl** vs single clinician journey (Search→Identity→Timeline→…).  
5. **Agent-named surfaces** (Aksh agent-ops; hsi-core aksh-agents) vs “users must not need agent architecture.”  
6. **Dual Discovery** (ISI Radar vs HSI Discovery) without a unified research mental model.  
7. **ATLAS naming collision** (Aksh clinical agent vs ISI Atlas) — copy risk (gap D8).  
8. **Research brief** not yet a first-class reproducible artifact (Workflow A gap).

---

## 7. Reuse candidates (do not rebuild)

| Asset | Reuse as |
|-------|----------|
| ISI `JOURNEY_NAV` + PageHead/Toc/Section anatomy | Researcher workspace IA |
| ISI Ask + Ask grounding + Sources fold | Question entry + evidence inspect |
| ISI Atlas / Graph / Mechanism | Graph & mechanism panels |
| ISI Methods honesty patterns | Trust UI / coverage meters |
| hsi-core Discovery ASK→MAP→REVIEW + grades | Evidence substrate UX; pack inspection |
| hsi-core homepage research-intelligence framing | Tone for ecosystem site research sections |
| Aksh HITL Accept/Edit/Reject + missing-as-missing | Clinician & trial review microcopy |
| Aksh slot-fill / glucose worklists + patient share | Patient workspace foundations |
| Aksh role-select onboarding | Role-based routing pattern |

---

## 8. Acceptance for this audit

- [x] Three products audited from local + public where reachable  
- [x] Features classified with honesty key  
- [x] Engineering vs product messaging called out for hsi-core  
- [x] No live clinical capabilities claimed  
- [x] Feeds IA, website spec, workspace UX, and Phase 3–4 roadmap recommendations  

**Next:** [`HSI_PRODUCT_INFORMATION_ARCHITECTURE.md`](./HSI_PRODUCT_INFORMATION_ARCHITECTURE.md)
