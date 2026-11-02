# HSI UX Implementation Roadmap (§8.15)

**Document status:** Definitive UX delivery phases 0–9  
**Rule:** **No implementation without founder approval.** This pack is strategy only.  
**Depends on:** Audit [`HSI_EXISTING_UX_AUDIT.md`](./HSI_EXISTING_UX_AUDIT.md) · IA · website · design system · workspace specs

---

## Recommendation after audit (binding advice)

| Priority | Phase | Why |
|----------|-------|-----|
| **First UX build** | **Phase 3 — Public ecosystem site** | Fixes largest narrative misalignment (three brands, engineering gravity); CTAs can route to real Available surfaces (ISI, Aksh) without claiming Clinical/Trials |
| **Second** | **Phase 4 — Researcher workspace** | Strongest existing product; Workflow A brief + Discovery clarity compounds research credibility |
| Later | Phases 5–7 | Patient polish → Clinician → Trials as foundations/contracts land |
| Cross-cut | Phases 1–2, 8–9 | Tokens/trust primitives early; handoffs & AA hardening continuous |

Do **not** start with agent theatre, Climb marketing, or empty Clinical/Trials shells.

---

## Phases 0–9

### Phase 0 — UX strategy pack (this deliverable)

| Item | Status |
|------|--------|
| Existing UX audit | Done (docs) |
| IA + website + DS + workspaces + trust + a11y + tests | Done (docs) |
| Implementation | **Stopped for approval** |

**Acceptance:** Founder acknowledges §8 pack; D1 brand hierarchy still open.

### Phase 1 — Design foundations

- Token mapping across ISI / hsi-core / Aksh (no forced merge)  
- Shared StatusChip / Cat badge / honesty banner specs in code **only after approval**  
- Resolve Atlas naming copy (D8)  

### Phase 2 — Evidence & trust UI primitives

- Evidence drawer behaviour in ISI (highest leverage)  
- Ban unexplained % in primary surfaces  
- Align Gate C / Methods language  

### Phase 3 — Public HSI ecosystem site **(recommended first build)**

- Implement [`HSI_PUBLIC_WEBSITE_SPECIFICATION.md`](./HSI_PUBLIC_WEBSITE_SPECIFICATION.md) §§8.6–8.7  
- CTAs → real Available products  
- Keep hsi-core.vercel.app as substrate site; demote engineering nav  
- `/status` living matrix  

**Acceptance:** Visitor test §8.37.5 passes.

### Phase 4 — Researcher workspace **(recommended second)**

- Preserve `JOURNEY_NAV` / Ask / Atlas  
- Clarify Radar vs HSI Discovery  
- First-class Brief artifact (Workflow A)  
- Real progress UI; kill agent theatre  
- Evidence drawer adoption  

**Acceptance:** Researcher §8.37.2 passes (Brief may be Partial only if logged).

### Phase 5 — Patient workspace (Aksh)

- Progressive onboarding polish  
- Educational vs advice audit  
- Fabrication guards on charts  
- Research links education-grade only  

**Acceptance:** Patient §8.37.3 passes.

### Phase 6 — Clinician workspace (HSI Clinical)

- Requires Clinical foundations / FHIR / identity — not UI-only  
- Collapse Aksh sprawl into Search→…→Evidence journey  
- Remove agent names from primary chrome  
- Synthetic Workflow B rehearsal first  

**Acceptance:** Clinician §8.37.1 on synthetic; no live-care claim.

### Phase 7 — Trial team workspace

- Five-state criteria table  
- Investigator review workflow  
- Freshness + no eligibility confirmation  
- Distinct from ISI melanoma educational flag  

**Acceptance:** Trial §8.37.4 passes.

### Phase 8 — Cross-product handoffs & switcher

- Workspace switcher ACL  
- Clinical→ISI concept handoff  
- Clinical→Trials packet  
- Plane isolation tests  

### Phase 9 — Accessibility & UX evaluation hardening

- WCAG 2.2 AA evidence per surface  
- Baseline usability metrics (Vision §2.16) — set targets from baselines, don’t invent  
- Continuous honesty regression on copy  

---

## Explicit non-goals for early phases

- Redesigning ISI science content wholesale  
- Replacing Aksh HITL with new agent UX  
- Marketing live hospital interoperability  
- Implementing omics runtimes for demos  

---

## Approval gate

```text
§8 docs complete
      │
      ▼
Founder approval (scope: Phase 3 and/or 4)
      │
      ▼
Implementation tickets (separate from strategy pack)
      │
      ▼
§8.37 tests + honesty checklist
```

**Stop:** Awaiting founder approval before any website, app, or deploy work.
