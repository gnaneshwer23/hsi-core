# HSI Unified Design System (§8.3–8.4)

**Document status:** Definitive design-system strategy (tokens, components, avoid list)  
**PRD companion:** [`HSI_DESIGN_SYSTEM_AND_UX.md`](./HSI_DESIGN_SYSTEM_AND_UX.md) (Document 04 Spec §§5–6) is the canonical product UX companion; this file elaborates brand audit + tokens.  
**Rule:** Audit existing brands **first**; proposed unified palette is **exploration only** until founder brand decision (D1).

---

## 1. Brand audit (existing — preserve until ADR)

### 1.1 ISI (immune-city)

| Token family | Observation |
|--------------|-------------|
| Surfaces | Warm ivory / light oklch backgrounds (`biotech.css`) |
| Primary | Teal–cyan clinical science (`--primary` ~ oklch 0.4 0.085 190) |
| Hero | Dark navy band (`--hero-bg`, `--mkt-navy`) |
| Voice | Editorial scientific; honesty labels; closed Sources folds |
| Type | Distinct display + mono for scientific chrome (non-default stack) |

**Reuse:** Journey page anatomy, evidence folds, status chips, graph/Atlas chrome.

### 1.2 HSI Core site

| Token family | Observation |
|--------------|-------------|
| Accent | Cobalt `#3965fa` |
| Ink | Navy `#131930` / `#0b0f24` |
| Light bands | Cream `#f0ece9` / `#f7f3f0` |
| Status | Live green `#2fcb86` |
| Effects | Glass blur; arrow motif |
| Type | Host Grotesk + JetBrains Mono |

**Reuse:** Research-intelligence tone; Discovery MAP visual language; Gate C illustrative patterns (labelled).

### 1.3 Aksh Health

| Token family | Observation |
|--------------|-------------|
| Clinical navy | Role colour e.g. GP `#003D7A` |
| Care green | Nurse `#006B4F` |
| Voice | Clinic worklist clarity; synthetic banners; HITL verbs |
| Pattern | Dense operational UI (acceptable for clinic; not for public hero) |

**Reuse:** HITL decision chrome; missing-data presentation; worklist density patterns for Clinical/Trials ops.

### 1.4 Collision notes

- Do **not** force Aksh operational density onto ISI editorial pages.  
- Do **not** force cobalt glass onto Aksh clinical worklists without pilot.  
- Resolve **Atlas** naming (ISI graph vs Aksh ATLAS agent) in copy before shared components ship.

---

## 2. Proposed ecosystem palette (exploration only)

Use only after D1 / brand ADR. Until then, product-local tokens remain source of truth.

| Role | Proposed direction | Notes |
|------|--------------------|-------|
| Ecosystem ink | Deep navy (shared with ISI hero / HSI navy) | Trust, not purple AI cliché |
| Ecosystem accent | Choose **one**: ISI teal **or** HSI cobalt — not both competing | Exploration |
| Success / Available | Green aligned to existing live/status greens | |
| Warning / In development | Amber (Aksh validation marker energy) | |
| Danger / Reject / Not satisfied | Clinical red — restrained | |
| Surfaces | Light research (ISI) vs clinic white/grey (Aksh) vs marketing gradient (HSI) | Domain skins |
| Evidence Cat chips | Fixed five colours — never encode fake % | See trust UI |

**Avoid default AI clusters:** purple-on-white glow; cream+terracotta broadsheet pastiche; emoji-led UI; multi-layer neon shadows as primary identity.

---

## 3. Shared foundations

### 3.1 Typography

| Context | Guidance |
|---------|----------|
| Marketing / ISI editorial | Expressive, purposeful; keep existing ISI/HSI faces unless brand ADR |
| Clinic / Trials ops | Highly legible; tabular nums for labs/criteria |
| Code / IDs / PMIDs | Mono |

### 3.2 Spacing & density

| Skin | Density |
|------|---------|
| Public / ISI reading | Generous; one job per section |
| Graph exploration | Progressive disclosure; avoid node dumps |
| Clinic / Trials | Dense tables OK; preserve 44px touch targets on primary actions |

### 3.3 Motion

Intentional, 2–3 patterns max per surface: page enter, panel open, status change. **No** looping agent “thinking theatre” without real progress semantics ([researcher UX](./HSI_RESEARCHER_WORKSPACE_UX.md)).

### 3.4 Iconography

Task icons over robot/agent mascots. Prefer concept-type icons (cell, lab, study) already used in ISI/Aksh where present.

---

## 4. Component inventory

### 4.1 Cross-product primitives

| Component | Purpose |
|-----------|---------|
| `StatusChip` | Available / In development / Planned / Synthetic / In validation |
| `ClaimCategoryBadge` | Cats 1–5 — never collapsed |
| `ReviewStatusBadge` | Draft / Unreviewed / Source-linked / Supported / Conflicting / … |
| `SourceChip` | PMID/DOI/system + retrieval time |
| `MissingInfoCallout` | Absence ≠ negation |
| `EvidenceDrawer` | Why / support / conflict / missing / review |
| `HumanGateBar` | Accept · Edit · Reject (Aksh pattern) |
| `WorkspaceSwitcher` | Product/role switch |
| `HonestyBanner` | Research-only / not CDS / synthetic |
| `ProgressSteps` | Real pipeline stages only |

### 4.2 Domain-specific

| Domain | Components |
|--------|------------|
| ISI / Researcher | Concept card, Edge card, Graph filter, Ask transcript, Brief document, Gap card |
| Clinical | Patient identity header, Timeline event, Lab trend, Med list, Context summary |
| Patient (Aksh) | Measurement entry, Share toggle, Care-team message, Educational insight card |
| Trials | Criteria table (5 states), Screening report, Investigator decision panel |
| Public | Product card, Role tile, Five-verb strip, Status matrix |

### 4.3 Do not share blindly

Agent picker · raw Cap IDs · Neon project badges · Climb waypoint widgets · unexplained risk gauges.

---

## §8.4 Avoid list (binding)

From ROLE 9 + HSI safety/UX principles:

1. **Overcrowded dashboards** that bury the next clinical/research action.  
2. **Decorative AI animations** without functional purpose.  
3. **Excessive technical jargon** in primary chrome (planes, Caps, Climb).  
4. **Internal engineering pages** in primary navigation.  
5. **Unnecessary agent-selection screens.**  
6. **Agent names in primary UI** (SYNTHESIS, NEXUS, etc. → task labels).  
7. **Unexplained risk scores** or **fake confidence percentages**.  
8. **Visually impressive but non-functional graphs.**  
9. **“Patient eligible” / “AI confirmed”** trial copy.  
10. **Universal single dashboard** for all roles.  
11. **Purple glow / generic AI SaaS** aesthetic as default brand.  
12. **Fabricated measurements** or filled gaps presented as facts.  
13. **Auto-play agent theatre** that simulates work not happening.  
14. **Collapsing evidence categories** into one “AI says” card.

---

## 5. Accessibility baseline

Design system must support WCAG 2.2 AA ([`HSI_RESPONSIVE_ACCESSIBILITY_PLAN.md`](./HSI_RESPONSIVE_ACCESSIBILITY_PLAN.md)): contrast, focus, names, targets, reduced motion.

---

## 6. Adoption plan

| Phase | Action |
|-------|--------|
| 0 | This document + brand audit |
| 1 | Token mapping table across three codebases (no forced merge) |
| 2 | Shared Evidence/Trust primitives as design specs |
| 3 | Public site implements ecosystem skin |
| 4+ | Workspace skins adopt shared badges/drawers without rewriting product CSS wholesale |

**Stop:** No redesign implementation without founder approval.

---

## 7. Refined governing rules (2026-11-09)

**Governing principle:** HSI has one recognisable premium biomedical identity, and its visual presentation accurately reflects the functionality and scientific governance of the actual platform.

**Do not let the visual system create the impression of scientific capability that the backend does not yet provide.**

### 7.1 Hero hierarchy (product-led)

1. Research question → 2. Mechanism map → 3. Evidence → 4. Contradictions → 5. Research gaps → 6. Research brief.  
Eight-domain ecosystem is a **supporting** visual layer, not the hero alone.

### 7.2 Brand vs evidence colour

| Role | Rule |
|------|------|
| Brand burgundy (`#BD1C1D` / `#5E0808`) | Emphasis, selection, primary action |
| Evidence status | Separate semantic system (supported / context-limited / contested / not curated / synthetic / AI draft) — never encode “bad” with brand red alone |
| Scientific cyan (`#106C92` family) | Instrument chrome, graph nodes, CTAs |

Machine-readable contract: `site/src/styles/hsi-design-tokens.json` (mirrored in `hsi-visual-tokens.css`).

### 7.3 Truthfulness contract

Every UI that implies capability must declare one of: live backend integration · cached demonstration · curated example · synthetic data · illustrative workflow · future capability.  
No component may imply live clinical data, autonomous discovery, or validated science unless backend + governance support it. Derive public status from `docs/capability-status.json`.

### 7.4 Eight-domain interaction

Hover → highlight connected domains + short description.  
Select → contextual panel + available capability + real route.  
Unavailable → “In development” / “Not currently available” — never imply live functionality.

### 7.5 Homepage acceptance (additive)

1. Every public capability shows truthful status from the verified registry.  
2. Research demonstration labelled live / cached / curated / synthetic / illustrative.  
3. Every CTA leads to a real destination.  
4. Keyboard reaches every interactive control; focus visible; reduced-motion respected.  
5. Preview verified before production; production verified after release.  
6. Final reports distinguish marketing QA, engineering QA, scientific validation, and production readiness.
