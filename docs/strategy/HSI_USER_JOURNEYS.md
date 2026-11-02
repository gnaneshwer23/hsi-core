# HSI User Journeys

**PRD companion:** [`HSI_DESIGN_SYSTEM_AND_UX.md`](./HSI_DESIGN_SYSTEM_AND_UX.md) (Document 04 Spec) is the canonical product UX companion.  
**Definitive UX elaboration:** The §8 Product Experience & UX pack under `docs/strategy/` (start at [`HSI_EXISTING_UX_AUDIT.md`](./HSI_EXISTING_UX_AUDIT.md) / [`README.md`](./README.md) §8) supersedes this file for IA, workspace specs, trust UI, and UX roadmap.

**UX principle:** Role-specific navigation; progressive disclosure; evidence links. Users should not need to understand agent architecture.  
**Public site:** Explain ecosystem, available vs in-development — not internal engineering roadmaps as primary nav.

---

## 1. Public visitor (HSI website)

**Goal:** Understand what HSI is and who it is for.

1. Problem: fragmented healthcare & biomedical intelligence.  
2. Solution: four connected products + living knowledge (logical).  
3. Roles: patients (via Aksh), clinicians, researchers, trial teams, institutions.  
4. Available now vs in development (honesty).  
5. Collaboration / partner CTA.

**Current gap:** hsi-core site improved toward research-intelligence narrative; not yet full four-product ecosystem story. ISI has strong science brand; Aksh has patient/clinic brand — need hierarchy (D1).

---

## 2. Researcher — Workflow A (priority)

**Prioritise:** Scientific Question → Knowledge Graph → Mechanism → Evidence Comparison → Gaps → Research Brief.

| Step | Surface today | Target |
|------|---------------|--------|
| Ask question | ISI `/ask` | Same + structured intent |
| Explore concepts | Atlas `/atlas/$id` | Layer-aware labels |
| Evidence | Citations + Gate C consume | Graded L4 edges |
| Contradictions / gaps | Informal Ask | Explicit L6 objects |
| Brief | Manual / Ask summary | Reproducible brief artifact |

**Do not:** bury users in agent names or Climb milestones.

---

## 3. Clinician — Workflow B (future)

**Prioritise:** Patient Search → Verified Identity → Longitudinal Timeline → Clinical Context → Evidence → Trial Screening (optional).

| Step | Today | Target |
|------|-------|--------|
| Search / ID | Aksh clinical flows (validation) | HSI Clinical + partner IdP |
| Timeline | Partial spine | Multi-encounter reconstruction + provenance |
| Context summary | SYNTHESIS / NEXUS HITL | Same + missing-info warnings |
| Evidence link-out | Absent | De-id disease phenotype → ISI/hsi evidence |
| Trials | Absent / melanoma research UI | Screening packet → human |

**Must show:** source system, time, missing data, claim types.  
**Must not:** imply universal hospital access.

---

## 4. Patient — Aksh Health

**Prioritise:** My Health → Timeline → Symptoms → Medication → Monitoring → Care Team → Relevant Research (education-grade).

Delivered primarily by **Aksh**, not by cloning patient UX into hsi-core. Research links are educational / approved content only — never unvetted trial enrolment pressure.

---

## 5. Trial team — Workflow C

**Prioritise:** Study Criteria → Candidate Screening → Missing Evidence → Review → Recruitment Workflow.

| Output section | Required |
|----------------|----------|
| Criteria satisfied | List + evidence pointers |
| Not satisfied | Explicit |
| Needs clarification | Questions |
| Unavailable | Missing data |
| Investigator assessment | Human-only zone |

UI copy forbids “AI confirmed eligible.”

---

## 6. Curator / scientific reviewer

Gate C → Check → supports assessment → Approve/Reject → public citation.  
ISI roles: moderator / reviewer / admin.  
Cite path: identifiers verified; claim_support human.

---

## 7. Information architecture recommendation

| Audience | Primary entry |
|----------|---------------|
| Public | HSI ecosystem site (to redesign after D1) |
| Researcher | ISI (immune-super-intelligence) |
| Patient / clinic ops | Aksh Health |
| Trial ops | Future HSI Trials app |
| Engineers | docs/ — not public primary nav |

Secondary account menus hold Methods, Vision, SME tools (ISI pattern already).
