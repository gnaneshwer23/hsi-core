# HSI Gap Analysis and Decisions

**Companion:** [`HSI_EXECUTIVE_SUMMARY.md`](./HSI_EXECUTIVE_SUMMARY.md)

---

## 1. Current vs target (summary)

| Capability | Current | Target | Gap class |
|------------|---------|--------|-----------|
| Evidence grades / Gate C | Strong (hsi-core) | Same + broader L4 | Extend |
| Immune KG | Strong (ISI 260/395) | L2/L4 seed of living graph | Extend, preserve |
| Research Ask / Discovery | Strong product UX | Workflow A briefs | Harden |
| Cite / claim_support | Check verified; supports human | Full Approve path | Partial |
| Partner lock | Fixture `lockedPilot=false` | Real MoU | External |
| Living multi-layer graph | Logical absent | Layers 1–6 | Major |
| HSI Clinical longitudinal | Absent | Workflow B | Major |
| HSI Trials product | Melanoma partial | Workflow C + states | Major |
| Aksh agent platform | Live in_validation | Reuse via gateway | Integration |
| Cross-domain claim labelling | Informal | Enforced enum | Medium |
| Public ecosystem site | Partial research narrative | Four-product honesty | Medium |
| Clinical safety case | Policy refuse CDS in hsi-core | DCB/MHRA when clinical | Deferred |
| FHIR federation | Staging only | Authorised test → partners | Major |
| Ontology service | Ad hoc | Licensed terminology | Medium |

---

## 2. Architectural decisions (proposed)

| ID | Decision | Recommendation | Status |
|----|----------|----------------|--------|
| A1 | Physical vs logical graph | Logical multi-store; defer graph DB | Proposed |
| A2 | hsi-core role | Evidence substrate (+ optional shared schemas); not clinical runtime | Proposed |
| A3 | Neon isolation | Keep red-wave ≠ autumn-snow ≠ Aksh PHI | **Accepted** (existing) |
| A4 | Agent homes | Clinical→Aksh; Research→ISI/hsi tools; Trials→new service | Proposed |
| A5 | Claim types | Mandatory on cross-domain answers | Proposed |
| A6 | ISI KG | Preserve; extend with metadata/imports | Proposed |

---

## 3. Decisions requiring founder approval

### D1 — Brand hierarchy
**Options:** (a) Health Super Intelligence umbrella + ISI + Aksh sub-brands; (b) keep Human Systems Intelligence for hsi-core only; (c) Immune-first public brand.  
**Impact:** Website, legal, domain strategy.  
**Blocker for:** Public relaunch copy.

### D2 — Stage 1 sequencing
**Options:** (a) Research-intelligence first (Phases 1–2) — **recommended**; (b) Parallel accelerate HSI Clinical; (c) Trials-first.  
**Impact:** Engineering allocation 6–12 months.  
**Note:** Current codebases already favour (a).

### D3 — ISI knowledge graph
**Options:** (a) Preserve as seed — **recommended**; (b) Freeze and rebuild greenfield; (c) Migrate immediately to new DB.  
**Recommendation:** (a) + Phase 1 inventory.

### D4 — Aksh integration model
**Options:** (a) API gateway / contracts — **recommended**; (b) Monorepo merge; (c) Reimplement agents in hsi-core.  
**Reject:** (c).

### D5 — First end-to-end workflow to productise
**Options:** A Biomedical Discovery — **recommended**; B Clinical; C Trials.  
**Depends on:** D2.

### D6 — Expand hsi-core beyond substrate?
**Options:** (a) Stay evidence-only; (b) Become shared orchestration hub; (c) Become public marketing monorepo.  
**Recommendation:** (a) near-term; revisit (b) after Phase 2.

### D7 — “Discovery” naming
Resolve collision: hsi-core Discovery SPA vs ISI Discovery vs scientific Discovery journey.

### D8 — “Atlas” naming
Aksh ATLAS (clinical research agent, not live) vs ISI Atlas (graph explorer). Rename one in UX copy.

### D9 — Research partner
Continue fixture honesty until real MoU; no marketing “operator MoU.”

### D10 — Clinical claims timeline
Confirm no MHRA/DCB clinical product claim until Phase 6 artifacts exist.

---

## 4. Unresolved questions (explicit uncertainty)

1. Which NHS / hospital partners are realistic for FHIR pilots (if any) in 12–24 months?  
2. SNOMED CT licence path and budget?  
3. Will Aksh ATLAS become the Trials bridge or will HSI Trials be separate UX?  
4. Is microbiome a near-term scientific priority or later L3 expansion?  
5. Single corporate entity vs multi-product legal entities for data controllership?  
6. International (non-UK) data residency requirements for early partners?

---

## 5. What is wrong / misaligned (actionable)

1. Treating hsi-core roadmap altitude as the product. → Fix with D1 + journeys.  
2. Implying clinical/hospital capabilities from research substrate. → Keep CDS/PHI boundary; Phase 3 gated.  
3. Agent marketing without runtime. → Catalog ≠ product.  
4. Partner MoU language without contracts. → Already corrected to fixture; maintain.  
5. One-graph rhetoric without layer/store design. → This strategy set.

---

## 6. Implementation freeze until approval

Per master directive: **no feature implementation** from this task.  
After founder marks D1–D6 (minimum), proceed with Phase 1 schema work and Phase 2 Workflow A only unless D5 overrides.

---

## 7. Suggested approval checklist

- [ ] D1 brand  
- [ ] D2 sequence  
- [ ] D3 preserve ISI KG  
- [ ] D4 Aksh API reuse  
- [ ] D5 Workflow A first  
- [ ] D6 hsi-core stays substrate (near-term)  
- [ ] Acknowledge D9–D10 honesty constraints  

---

## 8. PRD open decisions (HSI-D01–D10) ↔ D1–D10

Master PRD V1.0 ([`HSI_MASTER_PRD_v1.md`](./HSI_MASTER_PRD_v1.md) §17) introduces **HSI-D01–D10**. Full mapping and MVP stance: [`HSI_PRD_GAP_ANALYSIS_AND_MVP.md`](./HSI_PRD_GAP_ANALYSIS_AND_MVP.md) §5. Short crosswalk:

| PRD | Existing | Topic |
|-----|----------|-------|
| HSI-D01 | D3 · ADR-G2 | Retain ISI graph components |
| HSI-D02 | D4 · agent audit | Aksh agent reuse (simulation / not clinical production Verified) |
| HSI-D03 | §7 catalogue | First biomedical sources |
| HSI-D04 | §5/§6 goldens | Scientific evaluation dataset |
| HSI-D05 | D6 · §5 architecture | Orchestration approach |
| HSI-D06 | D1 · D7/D8 · §8 | Brand / design system |
| HSI-D07 | D2 · D5 · D10 | First clinical partner workflows (after Scientific MVP) |
| HSI-D08 | D10 · clinical safety | Medical device assessment |
| HSI-D09 | Trials / §7 | Trial registry integrations |
| HSI-D10 | Founder / Eng | Infrastructure budget |

**Note:** D5 “Workflow A Biomedical Discovery” = PRD Scientific MVP = §5 **Workflow B** / Cap 3 / M1 under current orchestration naming. 
