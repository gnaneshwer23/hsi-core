# HSI Responsive & Accessibility Plan (§8.14)

**Document status:** Definitive a11y and responsive strategy  
**Target:** **WCAG 2.2 Level AA** for all public and authenticated product surfaces that ship post-approval  
**Current:** Partial patterns exist (ISI accessibility route, focus styles, Aksh HITL labels); full AA **Not assessed** ecosystem-wide in Phase 0 audit

---

## 1. WCAG 2.2 AA targets (binding for new UX work)

| Area | Requirement |
|------|-------------|
| Perceivable | Contrast ≥ 4.5:1 text (3:1 large); don’t rely on colour alone for Cat/state |
| Operable | Keyboard complete; visible focus; target size ≥ 24×24 CSS px (prefer 44×44 primary actions); no keyboard traps in drawers |
| Understandable | Consistent nav; clear labels; error identification; honesty banners not colour-only |
| Robust | Valid name/role/value; live regions for Ask/progress; status messages |
| Plus 2.2 | Focus appearance; dragging alternatives; accessible authentication where used |

**Clinical safety note:** Accessibility failures that hide **missing data** or **review status** are treated as product defects, not polish.

---

## 2. Responsive priorities by surface

### 2.1 Desktop (primary for Clinical, Trials, Graph)

| Priority | Spec |
|----------|------|
| Clinician | Multi-panel: identity + timeline + context |
| Researcher | Graph canvas + inspector drawer |
| Trial | Wide criteria table with sticky first columns |
| Public | Full homepage sections 1–11 |

### 2.2 Tablet

| Priority | Spec |
|----------|------|
| Collapse side nav to icons / sheet |
| Timeline full width; context as tabs |
| Graph: prefer Atlas list + neighbour view if canvas cramped |
| HITL Accept/Edit/Reject always visible |

### 2.3 Mobile (primary for Patient; secondary for others)

| Priority | Spec |
|----------|------|
| Patient | Measurement entry, share, pre-visit questions — thumb-zone CTAs |
| Ask | Single-column transcript; Sources as bottom sheet |
| Public | Hero + CTAs; defer dense status tables to `/status` |
| Clinical / Trials | Read + decide; defer dense chart editing if needed — **do not** claim full clinic ops on phone Day 1 |

---

## 3. Component a11y requirements

| Component | Requirement |
|-----------|-------------|
| Evidence drawer | `dialog` or complementary; Esc; return focus; labelled title |
| Status / Cat chips | Text label, not colour alone; `title`/sr-text for abbreviations |
| Graph | Non-canvas alternative (list/Atlas); keyboard select where feasible |
| Ask | Aria-live for answer arrival; rate-limit errors announced |
| HumanGateBar | Buttons named Accept / Edit / Reject; confirm destructive |
| Workspace switcher | Combobox or menu button with current workspace |
| Criteria table | Row headers; state text; sort controls labelled |

---

## 4. Motion & cognitive load

- Respect `prefers-reduced-motion`  
- No essential info only in animation  
- Avoid agent theatre (§8.4)  
- Progressive disclosure over simultaneous panels on small screens  

---

## 5. Testing cadence

| Gate | Method |
|------|--------|
| PR | lint + axe (or equivalent) on touched routes |
| Release | Keyboard-only pass on journey happy path |
| Milestone | Screen-reader spot check (VoiceOver/NVDA) on Ask, Timeline, Criteria, Patient share |
| Partner | Contrast audit on brand tokens after D1 |

---

## 6. Ownership

| Surface | A11y owner |
|---------|------------|
| ISI | ISI product |
| Aksh | Aksh product |
| hsi-core site | hsi-core site |
| Ecosystem public site | TBD with Phase 3 |
| Shared Evidence drawer | Spec here; implement per host product |

**Stop:** No claim of AA compliance until tested on the shipped surface.
