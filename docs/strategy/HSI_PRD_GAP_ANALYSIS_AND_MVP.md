# HSI PRD Gap Analysis and Scientific MVP Recommendation

**Status:** Scientific MVP authorised (founder “lets start building” after Phase 0) — M1 thin path in ISI  
**PRD:** [`HSI_MASTER_PRD_v1.md`](./HSI_MASTER_PRD_v1.md)  
**FR matrix:** [`HSI_FR_REQUIREMENTS_TRACEABILITY.md`](./HSI_FR_REQUIREMENTS_TRACEABILITY.md)  
**Prior decisions:** [`HSI_GAP_ANALYSIS_AND_DECISIONS.md`](./HSI_GAP_ANALYSIS_AND_DECISIONS.md) (D1–D10) · LHK-G ADR-G1–G7  
**Stop (lifted for M1 only):** Clinical / Trials / FHIR-live / next-forge remain frozen. See §8 for M1 implementation status.

---

## 1. Current vs PRD goals G-01–G-07

| Goal | PRD intent | Current (audited) | Gap class |
|------|------------|-------------------|-----------|
| **G-01** Connect fragmented knowledge | Authorised workflows connect clinical, biological, research info | Research planes connect via packs→ISI; clinical/trial planes fragmented; no live hospital federation | **Major** for clinical; **Partial** for research |
| **G-02** Evidence-grounded intelligence | Material claims traceable to sources | Grades, Gate C, Cite Check, Ask grounding **strong Partial/Verified**; formal claimTypes in UI Incomplete | **Extend** |
| **G-03** Longitudinal understanding | Patients/clinicians investigate change over time | Aksh synthetic journeys; HSI Clinical **Missing** | **Major** (deferred) |
| **G-04** Accelerate scientific investigation | Mechanisms, compare evidence, contradictions, hypotheses | ISI Ask/KG/Atlas **closest real value**; formal brief + Workflow E Incomplete | **Extend** — **MVP home** |
| **G-05** Connect biology with clinical research | Mechanisms/targets ↔ trials | Melanoma/flag-off Partial; HSI Trials **Missing** | **Major** (Phase 5) |
| **G-06** Coherent product experiences | Role UX without exposing agents | ISI journeys strong; four-product public UX Missing; clinician/trial workspaces Missing | **Medium** public + researcher; **Major** clinical/trials |
| **G-07** Trustworthy foundation | Security, safety, verification, governance | Neon isolation + CDS/PHI **Verified** in hsi-core; clinical device/safety case deferred | **Aligned** research; **Deferred** clinical |

**Verdict:** Strongest near-term fit is **G-02 + G-04 + G-07 (research plane)**. G-01 clinical half, G-03, G-05 wait on partners and Phases 4–5.

---

## 2. Smallest coherent Scientific MVP

**Name:** HSI Scientific Intelligence MVP  
**Equals:** PRD §12 · §5 **Workflow B** (Immune Mechanism) · Cap 3 · product **M1 Biomedical Discovery Brief**

> Naming note: Gap Analysis D5 “Workflow A Biomedical Discovery” is the **same scientific milestone** under older journey naming. Authoritative orchestration name is **§5 Workflow B**.

### Include (from PRD §12)

| Item | Maps to | Current readiness |
|------|---------|-------------------|
| Professional HSI public website | FR-039–041 | Partial → must complete honesty copy |
| Four-product ecosystem explanation | FR-001, 040 | Spec yes; site Missing |
| ISI research workspace | FR-042 | Verified working (reuse) |
| Biomedical entity search | FR-007, 008 | Verified / Partial ontology |
| Existing KG exploration | FR-010 | Verified |
| Mechanism investigation | FR-012, 025 | Partial → brief required |
| Evidence retrieval | FR-018, 034 | Partial |
| Source inspection | FR-046, 030 | Partial |
| Contradiction & uncertainty presentation | FR-019, 027–028 | Partial (conditional depth) |
| Structured research brief | FR-012, 021, 022 | Proposed / Partial |
| Basic intelligence orchestration | FR-015–016 | Partial research router |
| Scientific evaluation framework | §5/§6 eval docs + goldens | Partial harness; M1 e2e Proposed |

### Conditional (PRD §12)

| Item | Include when | Else |
|------|--------------|------|
| Research-gap investigation | Evidence coverage supports meaningful gaps (FR-020) | Defer Workflow E |
| Hypothesis generation (unvalidated label) | Clear Cat 5 / hypothesis marking (FR-027) | Text-only without generative hypotheses |
| Mechanism-linked trial discovery | Official registry path verified (FR-014, 035; HSI-D09) | Exclude from M1 |

### Exclude (PRD §12) — binding

- Live multi-hospital patient record access  
- Autonomous clinical decision-making  
- Patient-specific treatment recommendations  
- Autonomous recruitment  
- Unapproved clinical data processing  
- Unvalidated medical device functionality  
- Replacing ISI KG without D3/ADR-G2 evidence  
- Cloning Aksh CONDUCTOR into hsi-core  
- Inventing MoUs / live FHIR hospitals  

### Explicit non-goals for this MVP

HSI Clinical workspace, full HSI Trials product, live SMART-on-FHIR, PHI→ISI, production clinical claims (D10).

---

## 3. Acceptance criteria (§16) ↔ existing tests/assets

| # | Criterion | Existing assets / tests | Gap for M1 |
|---|-----------|-------------------------|------------|
| 1 | Researcher submits scientific question | ISI AskAtlas / `askGrounding` suites | Keep single gateway |
| 2 | Resolve biomedical entities | `engine.ts`, concepts, graph tests | Ontology depth Partial |
| 3 | Graph queries retrieve stored relationships | Connectivity / graph tests; `kg.json` | Verified path |
| 4 | Evidence from approved sources | Cite Check PubMed/Crossref; approved cites | Expand source set carefully |
| 5 | Material claims link to verifiable evidence | Gate C / `claim_support` / grades | Brief must require links |
| 6 | Unsupported claims rejected or identified | Ask refuse; Gate C honesty; `cdsPhiBoundary` | claimTypes in UI Incomplete |
| 7 | Contradictions not silently suppressed | Coexisting edges; no CONTRADICTS model | Surface Partial conflicts |
| 8 | User inspects underlying sources | Sources fold / citations | Evidence drawer Incomplete |
| 9 | Missing evidence & uncertainty communicated | Ask coverage; qualitative grades | Explicit brief fields |
| 10 | Structured research brief | **Proposed** (Workflow B artifact) | **Primary M1 build** after approval |
| 11 | Auditable execution record | Gate C decisions; SHIELD pattern; research record Proposed | Need research execution record |
| 12 | Access controls enforced | Neon Auth / admin curation; plane isolation | Verified patterns — keep |
| 13 | Errors do not fabricate results | Honesty asserts; fail-closed Ask | Maintain in brief path |
| 14 | Accessible usable interface | §8 a11y plan; ISI journeys | WCAG checklist on M1 UI |
| 15 | Scientific evaluation documented | §5/§6 eval frameworks; hsi-core 150 tests; ISI Ask/graph | M1 golden set + expert review |

Later clinical/trial acceptance requires separate gates (DCB/MHRA, identity, five criterion states).

---

## 4. Dependencies & risks (§14–15) with current mitigations

| Dependency / risk (PRD) | Current mitigation (strategy pack) | Residual |
|-------------------------|------------------------------------|----------|
| Repository architecture / duplication | Four-product ownership; hsi-core = evidence substrate (D6) | Orchestration home still open (HSI-D05 / D6) |
| KG maturity | Preserve ISI KG (D3 / ADR-G2); extend via Gate C | Living multi-layer graph still logical |
| Terminology / ontologies | Open IDs + 8 LOINC; ADR-G7 licence gate | SNOMED budget unresolved |
| Source APIs / registries | §7 catalogue; literature P0 for M1 | Registry licensing (HSI-D09) |
| AuthN/Z | Per-product auth; Neon isolation Verified | Ecosystem SSO Missing |
| Scientific hallucinations | Provenance + Gate C + claim categories Proposed | UI enforcement Incomplete |
| Unsafe clinical access | CDS/PHI refuse; no PHI on HSI Neon | Clinical product absent (good for MVP) |
| Duplicate agents | Aksh audit; reuse via API (D4); catalog ≠ runtime | Marketing vs `in_validation` honesty |
| Overengineering | Workflow-driven M1 (Workflow B only) | Temptation to build CDR/clinical early |
| Misleading product claims | Fixture partner honesty; capability labels Required | Four-product site not shipped |
| Regulatory uncertainty | D10 — no clinical claim until artifacts | HSI-D08 assessment outstanding |
| Scope creep | This PRD + FR P0 list + Phase gates | Founder must freeze M1 include/exclude |

---

## 5. Open decisions HSI-D01–D10 ↔ existing D1–D10 / ADR-G*

| PRD ID | Question | Maps to | Recommended stance (Proposed) |
|--------|----------|---------|-------------------------------|
| **HSI-D01** | Which ISI graph components to retain? | **D3**, **ADR-G2** | Preserve `kg.json` / REL-* / Ask as seed; extend, don’t replace |
| **HSI-D02** | Which Aksh agents operational/reusable? | **D4**, agent audit | Reuse CONDUCTOR spine agents as **simulation/in_validation**; GUARDIAN/HITL/SHIELD patterns; not clinical production Verified; no clone into hsi-core |
| **HSI-D03** | First biomedical sources | §7 catalogue / biomedical strategy | Literature + existing packs/KG first; Open Targets etc. sequenced after M1 |
| **HSI-D04** | Initial scientific evaluation dataset | §5/§6 goldens | Cap 3 / Workflow B goldens on immune mechanisms (ISI graph neighbourhoods) |
| **HSI-D05** | Orchestration approach | **D6**, §5 architecture | Near-term: ISI research tool router + hsi evidence tools; Aksh remains clinical orchestrator; defer shared hub |
| **HSI-D06** | Shared design system / branding | **D1**, **D7/D8** naming, §8 design system | Founder brand hierarchy first; then design tokens; resolve Discovery/Atlas collisions in UX copy |
| **HSI-D07** | First clinical partner workflows | **D2**, **D5**, **D10** | After Scientific MVP; synthetic FHIR before live partners |
| **HSI-D08** | Medical device assessment scope | **D10**, clinical safety docs | Assess before any clinical intelligence product claim |
| **HSI-D09** | Trial registry integrations | Trials strategy / FR-035 | Feasibility before conditional M1 trial link; else Phase 5 |
| **HSI-D10** | Infrastructure / ops budget | Founder / Eng | Size hosting + terminology licences to research-first Phases 1–2 |

Also acknowledge existing **D9** (partner MoU honesty) and **ADR-G1/G3–G6** (no premature graph DB; no PHI in biomedical graph; grades authority; typed tools; no fake confidence %).

---

## 6. Recommendation to founder

1. **Approve** Master PRD V1.0 as product authority (Proposed → Accepted).  
2. **Approve** Scientific Intelligence MVP = Workflow B / Cap 3 / M1 with §12 include/conditional/exclude as above.  
3. **Confirm** D2/D5 research-first sequencing (aligns with this MVP).  
4. **Resolve** D1 brand + HSI-D06 before public ecosystem site build.  
5. **Do not authorise** Clinical/Trials/FHIR-live implementation in the same gate.

---

## 7. Explicit freeze

**No feature implementation, app/site changes, DB migrations, deploys, or git commit/push from this PRD pack until founder approval.**

Phase 0 (existing audits + this PRD/FR/gap set) is the stop condition for planning.

---

## 8. M1 implementation status (post founder “lets start building”)

**As of 2026-11-02 — Scientific Intelligence MVP (Workflow B / M1) started in ISI**

| Deliverable | Status | Where |
|-------------|--------|-------|
| Structured investigation brief from Ask grounding | **Partial → implemented (m1-1)** | `immune-city` `src/lib/research/investigationBrief.ts` |
| Ask UI action (no second chatbot) | **Implemented** | `AskAtlas` → “Generate investigation brief” |
| Sections: question, entities, mechanisms, evidence, contradictions/gaps, limitations, claim categories | **Implemented** | Same module + `InvestigationBriefView` |
| Observed N/A; Established / Association / Inference / Hypothesis (unvalidated) | **Implemented** | Claim statements on brief |
| Fail-closed invented PMIDs / clinical phrasing / no-match | **Implemented** + unit tests | `src/test/m1-investigation-brief.test.ts` |
| Honesty: Available research capability; no clinical claims | **Implemented** | Capability status + brief disclaimer |
| Cap 6 / Cap 10 / Cap 11 depth | **Implemented (ISI thin path)** | `humanEvidencePrioritisation` / `contradictionReport` / `researchGapRegister` on M1 `m1-2` brief |
| Formal expert golden-set eval (PRD §16 #15) | **Partial (automated v0)** | ISI `m1GoldenEval` G-Ask/G-Mech baselines; `expertReviewStatus=awaiting_sme` |
| Auditable research execution record (PRD §16 #11) | **Partial** | Ask trace + brief export; dedicated execution store still Proposed |
| Four-product public site / brand (PRD §12 include) | **Out of this thin M1** | Deferred with HSI-D06 |

**How to try:** open ISI `/ask`, ask a mechanism question (e.g. PD-1 / melanoma), then **Generate investigation brief**.
