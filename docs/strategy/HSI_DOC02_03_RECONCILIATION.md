# Document 02 / 03 / 04 — Reconciliation with Phase 0 audits

**Status:** Docs-only honesty ledger  
**Date:** 2026-11-02  
**Companions:** [`HSI_ARCHITECTURE_AND_DATA.md`](./HSI_ARCHITECTURE_AND_DATA.md) (Document 02) · [`HSI_INTELLIGENCE_ENGINE_SPEC.md`](./HSI_INTELLIGENCE_ENGINE_SPEC.md) (Document 03) · [`HSI_DESIGN_SYSTEM_AND_UX.md`](./HSI_DESIGN_SYSTEM_AND_UX.md) (Document 04)  
**Audit anchors:** [`HSI_FR_REQUIREMENTS_TRACEABILITY.md`](./HSI_FR_REQUIREMENTS_TRACEABILITY.md) · [`HSI_EXISTING_AGENT_AUDIT.md`](./HSI_EXISTING_AGENT_AUDIT.md) · [`HSI_EXISTING_SYSTEM_AUDIT.md`](./HSI_EXISTING_SYSTEM_AUDIT.md) · [`HSI_EXISTING_INTEGRATION_AUDIT.md`](./HSI_EXISTING_INTEGRATION_AUDIT.md) · [`HSI_EXISTING_UX_AUDIT.md`](./HSI_EXISTING_UX_AUDIT.md) · [`HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md`](./HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md)

**Rule:** Document 02 / 03 / 04 text is **Open / Proposed** product architecture and UX. Phase 0 audit classifications (**Verified / Partial / Mocked / Missing / …**) are **Observed**. Where they differ, keep both — do not silently upgrade audit status to match the PRD companion.

**Filename note:** Path remains `HSI_DOC02_03_RECONCILIATION.md` so existing links stay valid; title and content now cover Document 04.

---

## 1. Alignment (no conflict)

| Topic | Document 02/03/04 | Observed (audits) |
|-------|-------------------|-------------------|
| Docs-only / stop before coding | Explicit Cursor directives | Strategy pack already Phase 0 docs-only |
| Scientific MVP before clinical | Doc 02 Phases 1–2; Doc 03 Phase 2 vertical slice; Doc 04 Phase 4 ISI first | Matches Master PRD §12 / Workflow B / M1 |
| No autonomous diagnosis / prescribe / enrol | Hard rules throughout | Matches safety packs + `cdsPhiBoundary` |
| Neo4j / LangGraph / GraphRAG = candidates | Pending audit ADRs | Matches LHK-G / intelligence ADRs “Pending” |
| Epistemic classes 1–5 | Spec §10 / Doc 02 §6.4 / Doc 04 §12 labels | Matches §6 Cats 1–5 (same intent) |
| Trust-zone / plane isolation | Doc 02 Zones P/R/A/C/O | Matches P0–P3 planes in §5/§7 (naming differs; intent aligned) |
| Audit-first UX; preserve validated work | Doc 04 §§2, 23 | Matches §8 Phase 0 UX audit posture |
| No fake agents / fabricated clinical data in UI | Doc 04 non-negotiables | Matches ISI Methods honesty + Aksh synthetic labels |

---

## 2. Open / Proposed vs Observed conflicts (Documents 02 / 03)

Do **not** reclassify audits. Treat Spec language as target; treat audit as current evidence.

| Area | Open / Proposed (Doc 02/03) | Observed (Phase 0) | Honesty note |
|------|----------------------------|--------------------|--------------|
| Unified intelligence orchestrator | One governed engine + state machine | Aksh CONDUCTOR **Verified** (simulation); ISI Ask **Partial**; hsi-core runtime orchestrator **Missing** | Dual-home reuse; do not invent hsi-core CONDUCTOR clone |
| Named scientific investigator fleet | Spec §§12 catalogue (Immune Cell, Mechanism, …) | ISI multi-agent swarm **Missing** (intentional); Ask + tools **Partial/Verified** | Catalogue = target Caps; not live agents |
| Clinical longitudinal timeline APIs | Doc 02 `/v1/clinical/patients/{id}/timeline`; WF-02 | HSI Clinical product **Missing**; FR-023 **Missing** | Partner evaluation only when approved |
| Live FHIR / SMART / HL7 | Doc 02 §§8, 14 evaluation design | BRIDGE staging **Verified**; live EHR **Mocked**; SMART FR-032 **Missing** | No production clinical connector claim |
| Aksh ↔ HSI observation exchange | Doc 02 Phase 4; Doc 03 Phase 4 | FR-036 **Missing**; Exchange A Proposed only | No PHI→ISI |
| Trial screening product | Screening evaluator + five states | Melanoma Trial Intelligence **Partial**/flag-off; ATLAS scaffold **Mocked**; HSI Trials product **Missing** | Never “eligible” / enrol |
| Cross-product navigation / four-product UX | Implied by federation UX | FR-005 / FR-040 **Missing** on public surfaces | §8 / Doc 04 Proposed only |
| GraphRAG / MedGraph-style platform | Evaluation candidate inside HSI | Not adopted; Neo4j migration **Pending audit** | Pattern ≠ product definition |
| Temporal bi-temporal / as-of queries | Doc 02 §22.2; Doc 03 §18 | FR-011 **Partial**; full bi-temporal **Missing** | Research/clinical timelines later |
| Multimodal / digital twin / federated learning | Doc 02 §22; Doc 03 §§19–20 | Research-only Proposed; PRISM imaging **Mocked**; causal-ai **Mocked** | Must stay research-only until gates |
| Required artefact filenames (Doc 02 §21, Doc 03 §30) | Lists many `HSI_*` deliverables | §5–§7 packs already cover most under different names | Map by topic; do not duplicate or claim Missing audits are “done” because a Spec section exists |
| Doc 03 §4 “existing implementation unverified” | Blanket before audit | Phase 0 audits **already produced** classifications | Spec status header is historical; repo audits remain authoritative for Observed |

---

## 3. Open / Proposed vs Observed conflicts (Document 04 — UX)

Do **not** upgrade [`HSI_EXISTING_UX_AUDIT.md`](./HSI_EXISTING_UX_AUDIT.md) classifications to match Spec. Doc 04 is target UX; §8 audit is Observed.

| Area | Open / Proposed (Doc 04) | Observed (Phase 0 UX audit) | Honesty note |
|------|--------------------------|----------------------------|--------------|
| Unified public HSI site IA | Nav: Platform \| Solutions \| Science & Evidence \| Collaborate \| About \| Sign in; routes `/platform`, `/solutions/*`, `/trust`, … | No single live ecosystem marketing site with that IA; hsi-core site = research-intelligence substrate; ISI/Aksh have own brands | Spec = Proposed public site; do not claim routes Verified |
| Four-product homepage + maturity cards | Homepage §§4.1–4.10 with actual maturity per product | hsi-core narrative improved but **not** full four-product ecosystem story; FR-040 **Missing** | Keep §8 public-site Spec as elaboration under Doc 04 |
| Candidate unified palette | `#10243A` / `#087F8C` / `#2563A6` / … | ISI teal–navy–ivory **Verified**; hsi-core cobalt/cream **Verified**; Aksh clinical role colours **Verified** | Palette = exploration until D1 brand decision; do not replace live tokens |
| Shared domain component library | EvidenceDrawer, ClinicalTimeline, EligibilityCriterion, ExecutionStatus, … | Pieces exist per product (ISI Sources folds, graph; Aksh timelines); unified library **Missing** | Spec components ≠ shipped DS |
| Cross-product workspace switcher | Multi-role switcher with re-authz | FR-005 / cross-product nav **Missing** | No silent clinical→research context |
| HSI Clinical workspace UX | Full clinician journey §§9 | HSI Clinical product UX **Missing** | Partner evaluation only when approved |
| HSI Trials workspace UX | Criteria / screening / review / recruitment §§11 | Dedicated trial-team workspace **Missing**; ISI melanoma Trial Intelligence **Partial** educational | Never “Patient eligible” / autonomous contact |
| ISI investigation shell | Left filters / centre graph / right entity / bottom real execution | ISI Ask + Atlas + graph **Verified**/Partial; exact Spec shell **Partial**; research brief artifact **Partial/Missing** | Reuse ISI; do not invent agent theatre |
| Role onboarding as Spec §§7 | Researcher / clinician / patient / trial flows | ISI auth + roles **Verified** pattern; clinician verification gate **Missing**; Spec flows Proposed | Never self-select clinician access |
| Public capability availability band | Verified / limited evaluation / in development / planned | Partial honesty on Aksh + ISI Methods; unified ecosystem capability matrix **Missing** | Base labels on audit, not Spec aspiration |
| WCAG 2.2 AA as delivered | Target §§15 | Formal AA audit **Not assessed** / Partial responsive | Target ≠ Observed |
| Doc 04 §2 “audit before design” / unverified claim | Implies audit still pending | Phase 0 UX audit **already produced** | Spec header historical; [`HSI_EXISTING_UX_AUDIT.md`](./HSI_EXISTING_UX_AUDIT.md) authoritative for Observed |
| Required UX artefact filenames (Doc 04 §22) | e.g. `HSI_PUBLIC_WEBSITE_PAGE_SPECS.md`, `HSI_AKSH_PATIENT_WORKSPACE_UX.md` | §8 pack covers same topics under slightly different names | Map by topic; filenames alone ≠ Verified product UX |

---

## 4. Naming crosswalk (Spec deliverables ↔ existing packs)

| Spec-requested artefact (examples) | Closest existing strategy doc |
|------------------------------------|-------------------------------|
| `HSI_CURRENT_STATE_ARCHITECTURE_AUDIT.md` | [`HSI_EXISTING_SYSTEM_AUDIT.md`](./HSI_EXISTING_SYSTEM_AUDIT.md) · [`HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md`](./HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md) |
| `HSI_EXISTING_AGENT_AND_SERVICE_AUDIT.md` | [`HSI_EXISTING_AGENT_AUDIT.md`](./HSI_EXISTING_AGENT_AUDIT.md) |
| `HSI_INTELLIGENCE_ENGINE_ARCHITECTURE.md` | Same name in §5 + this Document 03 Spec |
| `HSI_GRAPH_RAG_AND_ORCHESTRATION_ADRS.md` | LHK-G ADRs + §5 orchestration docs (ADR log still Open) |
| `HSI_SOURCE_CONNECTOR_CATALOGUE.md` | [`HSI_DATA_SOURCE_CATALOGUE.md`](./HSI_DATA_SOURCE_CATALOGUE.md) · [`HSI_EXISTING_INTEGRATION_AUDIT.md`](./HSI_EXISTING_INTEGRATION_AUDIT.md) |
| `HSI_EXISTING_UX_AUDIT.md` | Same name in §8 |
| `HSI_INFORMATION_ARCHITECTURE.md` | [`HSI_PRODUCT_INFORMATION_ARCHITECTURE.md`](./HSI_PRODUCT_INFORMATION_ARCHITECTURE.md) |
| `HSI_PUBLIC_WEBSITE_PAGE_SPECS.md` | [`HSI_PUBLIC_WEBSITE_SPECIFICATION.md`](./HSI_PUBLIC_WEBSITE_SPECIFICATION.md) |
| `HSI_DESIGN_TOKENS_AND_COMPONENTS.md` | [`HSI_UNIFIED_DESIGN_SYSTEM.md`](./HSI_UNIFIED_DESIGN_SYSTEM.md) |
| `HSI_AKSH_PATIENT_WORKSPACE_UX.md` | [`HSI_PATIENT_WORKSPACE_UX.md`](./HSI_PATIENT_WORKSPACE_UX.md) |
| `HSI_TRIALS_WORKSPACE_UX.md` | [`HSI_TRIAL_TEAM_WORKSPACE_UX.md`](./HSI_TRIAL_TEAM_WORKSPACE_UX.md) |
| `HSI_EVIDENCE_AND_TRUST_INTERACTIONS.md` | [`HSI_EVIDENCE_AND_TRUST_UI.md`](./HSI_EVIDENCE_AND_TRUST_UI.md) |
| `HSI_RESPONSIVE_ACCESSIBILITY_QA.md` | [`HSI_RESPONSIVE_ACCESSIBILITY_PLAN.md`](./HSI_RESPONSIVE_ACCESSIBILITY_PLAN.md) |
| `HSI_UX_ANALYTICS_AND_EVALUATION.md` / `HSI_UX_IMPLEMENTATION_PLAN.md` | [`HSI_UX_TESTING_AND_ACCEPTANCE.md`](./HSI_UX_TESTING_AND_ACCEPTANCE.md) · [`HSI_UX_IMPLEMENTATION_ROADMAP.md`](./HSI_UX_IMPLEMENTATION_ROADMAP.md) |
| `HSI_REQUIREMENT_TO_SCREEN_TRACEABILITY.csv` | **Not yet written** — Open; FR matrix is [`HSI_FR_REQUIREMENTS_TRACEABILITY.md`](./HSI_FR_REQUIREMENTS_TRACEABILITY.md) |
| Future §22 companion outputs (Doc 02) | **Not yet written** — remain Open planning items |

---

## 5. Founder decision reminder

Approving Documents 02 / 03 / 04 as **product companions** does **not** approve implementation, schema change, deployment, website/app redesign, or re-labelling Partial/Missing capabilities as Verified.
