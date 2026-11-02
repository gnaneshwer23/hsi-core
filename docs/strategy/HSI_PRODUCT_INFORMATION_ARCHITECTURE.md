# HSI Product Information Architecture (§8.2)

**Document status:** Definitive IA for one ecosystem, four experiences  
**Aligns:** [`HSI_MASTER_VISION.md`](./HSI_MASTER_VISION.md) §2.13 · [`HSI_FOUR_PRODUCT_ECOSYSTEM.md`](./HSI_FOUR_PRODUCT_ECOSYSTEM.md) §3.11 · [`HSI_USER_JOURNEYS.md`](./HSI_USER_JOURNEYS.md) · audit [`HSI_EXISTING_UX_AUDIT.md`](./HSI_EXISTING_UX_AUDIT.md)

**Rule:** Role-specific navigation; progressive disclosure; evidence links. Users must not need agent architecture to succeed.

---

## 1. One ecosystem, four experiences

```text
                    ┌─────────────────────────────────────┐
                    │     Public HSI (ecosystem site)     │
                    │  Vision · Products · Status · CTA   │
                    └──────────────┬──────────────────────┘
           ┌───────────┬───────────┼───────────┬───────────┐
           ▼           ▼           ▼           ▼           ▼
       Patient     Clinician   Researcher    Trial      Admin /
        Aksh      HSI Clinical     ISI     HSI Trials   Partner
```

| Experience | Primary product | Maturity (2026-11-02) |
|------------|-----------------|------------------------|
| Public HSI | Ecosystem marketing site | **In development** (spec here; not yet unified live) |
| Patient | Aksh Health | **Available** (scoped diabetes workflows; synthetic/live honesty) |
| Clinician | HSI Clinical | **Planned** (Aksh clinic UX is precursor, not Clinical product) |
| Researcher | ISI | **Available** (research intelligence; not CDS) |
| Trial team | HSI Trials | **Planned** (ISI melanoma educational = Partial precursor) |

Shared intelligence (orchestration, LHK-G, evidence, terminology, governance) is **infrastructure**, not a fifth primary nav destination for end users.

---

## 2. Public HSI navigation

### Primary (visitor)

| Item | Purpose |
|------|---------|
| Home | Hero + Connect→Biology→Evidence→Opportunities→Decisions |
| Products | Four experiences + Shared Core (logical) |
| For you | Role chooser → role landing |
| What’s available | Available / In development / Planned |
| Collaborate | Institutions, research partners, clinics |
| Trust | Safety, privacy, evidence honesty (or footer-primary) |

### Secondary / footer only

Methods detail · Roadmap / engineering altitude · Technical docs · Repository · Careers · Legal

### Explicitly **NOT** in public primary nav

- Climb / P0–P3 milestones as product story  
- Agent directories / capability catalogues  
- Neon / schema / migration docs  
- Curator Gate C operator queues (link from Trusted partner / curator paths only)  
- Internal ADRs, eval harnesses, plugin RFCs  

**Today’s hsi-core.vercel.app** remains valid as **substrate / research-intelligence** site until the ecosystem site exists; do not confuse the two (see website spec).

---

## 3. Role workspaces (binding — §3.11)

| Workspace | Primary product | Primary nav |
|-----------|-----------------|-------------|
| Public HSI | Ecosystem site | Vision, four products, available vs in-dev, collaboration |
| Patient | Aksh | My Health, Timeline, Measurements, Medications, Symptoms, Care, Insights |
| Clinician | HSI Clinical | Search, Overview, Timeline, Labs, Meds, Evidence, Trial Screening |
| Researcher | ISI | Questions, Graph, Mechanisms, Evidence, Compare, Gaps, Briefs |
| Trial | HSI Trials | Studies, Criteria, Screening, Review, Recruitment, Evidence |

### Researcher IA — preserve ISI pattern

Map target researcher nav onto existing `JOURNEY_NAV` where possible:

| Target | ISI reuse |
|--------|-----------|
| Questions | Ask Immune `/ask` |
| Graph | Explore → Atlas / Graph |
| Mechanisms | `/mechanism` |
| Evidence | `/evidence`, Methods, HSI Discovery |
| Compare / Gaps | Reasoning + Research Radar (+ future explicit Compare) |
| Briefs | Future first-class Brief; today Ask summary / workbench export **Partial** |

Academy / Community stay ISI science destinations — not Clinical or Trials chrome.

### Clinician IA — do not clone Aksh agent sprawl

Prefer **one patient journey** chrome. Role dashboards (GP/nurse/pharmacist) may filter tasks, but primary structure is Search→…→Evidence, not twelve parallel “intelligence” pages.

### Patient IA — Aksh owns

Do not rebuild patient chrome in hsi-core or ISI. ISI `/patient` remains **educational teaching**, labelled as such.

---

## 4. Workspace switcher

**Purpose:** Authorised users with multiple roles move without losing identity context or inventing a mega-app.

| Principle | Rule |
|-----------|------|
| Explicit | Switcher names product/workspace, not agent |
| ACL-first | Only show workspaces the account may enter |
| Context handoff | Pass investigation ID / patient ID / study ID via governed deep links |
| Plane isolation | Never drag PHI into ISI workspace URL state |
| Honesty | Disabled tiles for Planned products show “In development” — not empty shells that look live |

**Placement:** Account menu (ISI pattern) + optional top-bar switcher after auth.

**Minimum states**

1. Signed out → Public  
2. Patient → Aksh Patient  
3. Clinic staff → Aksh clinic dashboards (until HSI Clinical ships) → later Clinical  
4. Researcher → ISI  
5. Trial coordinator → Trials (when available)  
6. Admin / curator → secondary tools  

---

## 5. Contextual handoffs (not app hopping)

| From → To | Handoff object | UX |
|-----------|----------------|----|
| Clinical → ISI | De-identified phenotype / disease concepts | “Explore related biology” opens ISI with concept IDs |
| Clinical → Trials | Screening packet | Criteria table prefilled; five states |
| ISI → Trials | Mechanism / disease → candidate studies | Educational vs screening mode labelled |
| Aksh → Clinical | PGHD summary (authorised) | Exchange A; clinician review |
| Any → Evidence | Claim / edge ID | Evidence drawer ([`HSI_EVIDENCE_AND_TRUST_UI.md`](./HSI_EVIDENCE_AND_TRUST_UI.md)) |

---

## 6. Global object model (user-facing)

Users think in: **Person** · **Question** · **Concept** · **Claim** · **Evidence** · **Gap** · **Brief** · **Study** · **Criterion** · **Decision**.

They do not think in: AgentId · Cap number · Plane P0–P3 · Neon project · Climb phase (except collaborator docs).

---

## 7. Availability labels (site-wide)

| Label | Meaning |
|-------|---------|
| **Available** | Real users can perform the task with stated limits |
| **In development** | Built partially; not marketed as complete |
| **Planned** | Vision-aligned; no product claim of readiness |
| **Synthetic / Demo** | Illustrative data only |
| **In validation** | HITL/agent path on synthetic; not real-care release |

---

## 8. Anti-patterns

- One universal dashboard for all roles  
- Primary nav = engineering roadmap  
- “Open Agents” as a top-level destination  
- Merging ISI Atlas and Aksh ATLAS without rename  
- Deep-linking PHI into research URLs  

**Stop:** IA documented. Implementation awaits founder approval ([`HSI_UX_IMPLEMENTATION_ROADMAP.md`](./HSI_UX_IMPLEMENTATION_ROADMAP.md)).
