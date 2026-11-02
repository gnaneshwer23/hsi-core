# HSI Functional Requirements Traceability (HSI-FR-001–054)

**Status:** Proposed — pending founder approval  
**Source requirements:** [`HSI_MASTER_PRD_v1.md`](./HSI_MASTER_PRD_v1.md) §5  
**Grounding:** Strategy audits only — classifications must not invent **Verified**. Spot-check of code used only where audits already claim fact.  
**Companions:** [`HSI_PRD_GAP_ANALYSIS_AND_MVP.md`](./HSI_PRD_GAP_ANALYSIS_AND_MVP.md) · [`HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md`](./HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md) · [`HSI_EXISTING_SYSTEM_AUDIT.md`](./HSI_EXISTING_SYSTEM_AUDIT.md) · §5 [`HSI_EXISTING_AGENT_AUDIT.md`](./HSI_EXISTING_AGENT_AUDIT.md) · §7 [`HSI_EXISTING_INTEGRATION_AUDIT.md`](./HSI_EXISTING_INTEGRATION_AUDIT.md) · §8 [`HSI_EXISTING_UX_AUDIT.md`](./HSI_EXISTING_UX_AUDIT.md)

**Classification legend**

| Label | Meaning |
|-------|---------|
| **Verified working** | Observed in code/tests/config with honesty constraints met for the stated scope |
| **Implemented unverified** | Code present; production/runtime quality not assessed in audits |
| **Partial** | Real pieces exist; does not fully meet the FR as a product capability |
| **Mocked** | Scaffold, fixture, flag-off, or simulation marketed as incomplete |
| **Missing** | No meaningful implementation for the FR |
| **Broken** | Present but known failing / unsafe for stated use (none asserted without evidence) |
| **Not assessed** | Insufficient audit evidence |

**Scientific MVP focus:** FRs marked ★ are P0 for Scientific Intelligence MVP (Workflow B / Cap 3 / M1). Many remain **Partial**, not Verified.

**Stop:** Docs / planning only — no implementation from this matrix.

---

## Summary counts (all 54)

| Classification | Count |
|----------------|------:|
| Verified working | 6 |
| Implemented unverified | 0 |
| Partial | 37 |
| Mocked | 1 |
| Missing | 8 |
| Broken | 0 |
| Not assessed | 2 |
| **Total** | **54** |

Verified IDs: **004, 007, 009, 010, 042, 048**. Mocked: **045**. Not assessed: **051, 054**. Remainder = Partial or Missing as tabulated below.

---

## 5.1 Ecosystem and Identity

| ID | Statement | Priority | Classification | Evidence (paths/docs) | Gap / next step |
|----|-----------|----------|----------------|----------------------|-----------------|
| HSI-FR-001 ★ | Provide a coherent ecosystem connecting four products | P0 | Partial | Four-product spec [`HSI_FOUR_PRODUCT_ECOSYSTEM.md`](./HSI_FOUR_PRODUCT_ECOSYSTEM.md); Aksh + ISI exist; Clinical/Trials not first-class; no unified public ecosystem site ([`HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md`](./HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md) §1–2) | Ship honest four-product narrative + maturity labels on public site after D1; Clinical/Trials remain later |
| HSI-FR-002 ★ | Support role-specific navigation and workspaces | P0 | Partial | ISI `JOURNEY_NAV` / Shell ([`HSI_EXISTING_UX_AUDIT.md`](./HSI_EXISTING_UX_AUDIT.md)); Aksh patient UX; clinician/trial HSI workspaces **Missing** as products (§8 workspace specs Proposed) | MVP: harden researcher workspace; defer clinician/trial UX to Phase 4–5 |
| HSI-FR-003 ★ | Support appropriate authentication and authorisation | P0 | Partial | ISI Neon Auth + admin-gated curation; Aksh auth in platform-uk; no unified ecosystem IdP ([`HSI_EXISTING_SYSTEM_AUDIT.md`](./HSI_EXISTING_SYSTEM_AUDIT.md)) | Keep per-product auth for MVP; define shared session/cross-product policy later (FR-005/006) |
| HSI-FR-004 ★ | Enforce separation between clinical, research and public data domains | P0 | Verified working | `hsi-core/src/cdsPhiBoundary.ts`, `src/db/neonGuard.ts`; ISI Gate C host asserts; Neon red-wave ≠ autumn-snow ([`docs/NEON_PROJECT_MAP.md`](../NEON_PROJECT_MAP.md), honesty tests) | Preserve; never share PHI/research Neon; document planes in onboarding |
| HSI-FR-005 | Provide contextual cross-product navigation | P1 | Missing | §8 IA Proposed ([`HSI_PRODUCT_INFORMATION_ARCHITECTURE.md`](./HSI_PRODUCT_INFORMATION_ARCHITECTURE.md)); no live product switcher | Post-MVP; depends on D1 brand + product shells |
| HSI-FR-006 ★ | Preserve user context only when permitted | P0 | Partial | Role onboarding Proposed ([`HSI_ROLE_BASED_ONBOARDING.md`](./HSI_ROLE_BASED_ONBOARDING.md)); Ask fail-closed clinical-personal (`askGrounding`); no ecosystem context bus | MVP: keep Ask/ISI privacy defaults; formal cross-product context contract later |

---

## 5.2 Living Health Knowledge Graph

| ID | Statement | Priority | Classification | Evidence (paths/docs) | Gap / next step |
|----|-----------|----------|----------------|----------------------|-----------------|
| HSI-FR-007 ★ | Represent relevant biomedical entities and relationships | P0 | Verified working | ISI `src/data/kg.json` (~260+70 nodes); engine neighbours/paths ([`HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md`](./HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md)); hsi-core packs L4 thin | Preserve ISI KG (D3 / ADR-G2); extend via Gate C — do not replace |
| HSI-FR-008 ★ | Support ontology-based entity resolution | P0 | Partial | 8 claim→LOINC links + validate; ad hoc xrefs; SNOMED licence open ([`HSI_TERMINOLOGY_MAPPING_SPECIFICATION.md`](./HSI_TERMINOLOGY_MAPPING_SPECIFICATION.md), ADR-G7) | Open-ID-first for M1; licence path before SNOMED embed |
| HSI-FR-009 ★ | Preserve evidence provenance and review status | P0 | Verified working | hsi-core grades/schema/Gate C; ISI `claim_support` / Gate C queue; publish→consume contract | Finish human cite Approve path where Partial; keep autoApprove=false |
| HSI-FR-010 ★ | Support typed graph relationships and traversal | P0 | Verified working | ISI `REL-*` + `engine.ts`; connectivity tests | Use as Cap 3/Workflow B tools; draft edges flagged |
| HSI-FR-011 ★ | Represent temporal context and uncertainty | P0 | Partial | Qualitative grades/uncertainty; some `temporal_phase`; full bi-temporal **Missing** (LHK-G audit) | MVP: qualitative uncertainty in briefs; defer clinical timelines |
| HSI-FR-012 ★ | Support disease-to-mechanism investigation | P0 | Partial | Ask + KG Cap 3 path **Partial**/Verified grounding; formal M1 brief **Proposed** ([`HSI_ORCHESTRATION_WORKFLOWS.md`](./HSI_ORCHESTRATION_WORKFLOWS.md) Workflow B) | Deliver structured brief + claimTypes for M1 after approval |
| HSI-FR-013 | Support microbiome–immune–metabolic relationships | P1 | Partial | Sparse / draft coverage in ISI; L3 expansion open (Gap unresolved Q) | Later domain expansion — not M1 blocker |
| HSI-FR-014 | Connect relevant mechanisms with trial information | P1 | Partial | ISI Trial Intelligence flag-off / melanoma Partial ([`HSI_EXISTING_AGENT_AUDIT.md`](./HSI_EXISTING_AGENT_AUDIT.md)); HSI Trials product **Missing** | Conditional MVP only if registry path verified (HSI-D09); else Phase 5 |

---

## 5.3 Intelligence Engine

| ID | Statement | Priority | Classification | Evidence (paths/docs) | Gap / next step |
|----|-----------|----------|----------------|----------------------|-----------------|
| HSI-FR-015 ★ | Orchestrate specialised intelligence capabilities | P0 | Partial | Aksh CONDUCTOR **Verified** (simulation); ISI = single Ask gateway (not swarm); hsi-core runtime orchestrator **Missing** ([`HSI_EXISTING_AGENT_AUDIT.md`](./HSI_EXISTING_AGENT_AUDIT.md)) | M1: research tool router on ISI/hsi tools — do not clone CONDUCTOR into hsi-core |
| HSI-FR-016 ★ | Use controlled tools and defined agent contracts | P0 | Partial | Aksh agent contracts/tests; ISI `askGrounding`; §5 [`HSI_TOOL_AND_API_CONTRACTS.md`](./HSI_TOOL_AND_API_CONTRACTS.md) Proposed | Freeze Workflow B tool schemas in Phase 1 |
| HSI-FR-017 ★ | Reuse validated Aksh capabilities where appropriate | P0 | Partial | 14 agents `in_validation` / `LIVE_ORGANISATIONS=0`; catalog in hsi-core; clinical production **not** Verified | Reuse via API gateway (D4); GUARDIAN/HITL/SHIELD patterns for later Caps — not M1 research path |
| HSI-FR-018 ★ | Support scientific evidence retrieval and comparison | P0 | Partial | ISI PubMed/Crossref server-side Check; approved cites; Ask retrieval; hsi-core exports/X-G1 | Harden comparison UX + contradiction presentation for M1 |
| HSI-FR-019 | Identify contradictory findings and uncertainty | P1 | Partial | Edges may coexist; no first-class CONTRADICTS; §6 Workflow E Proposed | Conditional M1: surface conflicts when present; full workflow later |
| HSI-FR-020 | Support research-gap and hypothesis workflows | P1 | Partial | Discovery Intel Partial; Workflow E **Proposed** / Later ([`HSI_RESEARCH_DISCOVERY_WORKFLOW.md`](./HSI_RESEARCH_DISCOVERY_WORKFLOW.md)) | Conditional inclusion per PRD §12 |
| HSI-FR-021 ★ | Validate material claims against evidence | P0 | Partial | Gate C + Cite Check **Verified** honesty; supports/Approve Partial; formal claim schema UI **Missing** ([`HSI_CLAIM_PROVENANCE_SCHEMA.md`](./HSI_CLAIM_PROVENANCE_SCHEMA.md) Proposed) | Map grades→claimTypes in brief; no fake confidence % |
| HSI-FR-022 ★ | Support human review and execution auditability | P0 | Partial | Gate C human-only; Aksh HITL + SHIELD (simulation); research execution record **Proposed** ([`HSI_INTELLIGENCE_OBSERVABILITY.md`](./HSI_INTELLIGENCE_OBSERVABILITY.md)) | M1 acceptance requires auditable research execution record |

---

## 5.4 Cross-Domain Reasoning

| ID | Statement | Priority | Classification | Evidence (paths/docs) | Gap / next step |
|----|-----------|----------|----------------|----------------------|-----------------|
| HSI-FR-023 | Reconstruct longitudinal clinical context | P1 | Missing | HSI Clinical absent; Aksh parallel journeys ≠ longitudinal spine ([`HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md`](./HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md)) | Phase 4+; synthetic Workflow A (§5 naming) first |
| HSI-FR-024 | Analyse medication and laboratory chronology | P1 | Partial | Aksh diabetes synthetic chronology Partial; no multi-provider clinical product | Clinical phase; not Scientific MVP |
| HSI-FR-025 ★ | Connect disease phenotypes with biological mechanisms | P0 | Partial | ISI disease↔mechanism edges + Ask Cap 3; clinical phenotype plane **Missing** | M1 stays research phenotypes/concepts — not patient-specific |
| HSI-FR-026 ★ | Distinguish clinical facts from general scientific knowledge | P0 | Partial | `cdsPhiBoundary` / Ask refuse personal clinical; Cats 1–5 binding in §6 **Proposed**; UI enforcement Incomplete | Enforce category labels on M1 brief outputs |
| HSI-FR-027 ★ | Distinguish associations, inferences and hypotheses | P0 | Partial | Grades + draft flags; formal enum/claimTypes not system property ([Current-State §2](./HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md)) | Implement claim category display for M1; ADR-G6 no fake % |
| HSI-FR-028 ★ | Identify missing information | P0 | Partial | Ask refuse / coverage gaps Partial; clinical missing-data warnings Proposed | M1: explicit “missing evidence” in brief; clinical missing-data later |
| HSI-FR-029 | Support mechanism-to-trial investigation | P1 | Partial | Melanoma / flag-off Partial; full product Missing ([`HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md`](./HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md)) | Conditional MVP / Phase 5; never “eligible” |
| HSI-FR-030 ★ | Provide claim-level provenance | P0 | Partial | Pack provenance + Gate C + source_refs; structured claim schema Proposed not UI-complete | Wire provenance drawer fields on brief claims |

---

## 5.5 Data and Interoperability

| ID | Statement | Priority | Classification | Evidence (paths/docs) | Gap / next step |
|----|-----------|----------|----------------|----------------------|-----------------|
| HSI-FR-031 | Support appropriate FHIR R4-aligned clinical models | P1 | Partial | Aksh BRIDGE staging **Verified** staging / **Mocked** live EHR; §7 FHIR strategy Proposed | Synthetic packs first; no live hospitals in MVP |
| HSI-FR-032 | Evaluate SMART-on-FHIR integration | P1 | Missing | Strategy Proposed only ([`HSI_CLINICAL_FHIR_STRATEGY.md`](./HSI_CLINICAL_FHIR_STRATEGY.md)) | Evaluation doc after clinical partner decision (HSI-D07) |
| HSI-FR-033 | Evaluate HL7 v2, laboratory and medication integration | P1 | Missing | Catalogue / strategy only | Later clinical phases |
| HSI-FR-034 ★ | Support approved biomedical source ingestion | P0 | Partial | PubMed/Crossref Check; hsi-core packs/publish; Open Targets/HCA/etc. Proposed ([`HSI_BIOMEDICAL_DATA_STRATEGY.md`](./HSI_BIOMEDICAL_DATA_STRATEGY.md)) | Prioritise literature + KG for M1 (HSI-D03) |
| HSI-FR-035 | Support official clinical trial registry retrieval | P1 | Partial | CTG fragments / melanoma Partial; ICTRP Proposed ([`HSI_TRIAL_REGISTRY_STRATEGY.md`](./HSI_TRIAL_REGISTRY_STRATEGY.md)) | HSI-D09 before conditional MVP inclusion |
| HSI-FR-036 | Support governed Aksh observation exchange | P1 | Missing | Export stubs / no HSI consume from Aksh today ([Current-State architecture](./HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md)); Exchange A Proposed | Phase 3; never PHI→ISI |
| HSI-FR-037 ★ | Preserve source lineage and data quality metadata | P0 | Partial | Grades, source_refs, Gate C metadata; §7 quality/freshness specs Proposed | Extend brief + pack metadata for M1 acceptance |
| HSI-FR-038 ★ | Track integration maturity and freshness | P0 | Partial | Docs L0–L5 maturity ([`HSI_EXISTING_INTEGRATION_AUDIT.md`](./HSI_EXISTING_INTEGRATION_AUDIT.md)); runtime freshness stamps Incomplete | Publish maturity labels on sources used in M1; automate later |

---

## 5.6 Product Experience

| ID | Statement | Priority | Classification | Evidence (paths/docs) | Gap / next step |
|----|-----------|----------|----------------|----------------------|-----------------|
| HSI-FR-039 ★ | Provide a professional public HSI website | P0 | Partial | hsi-core site research narrative Partial; ISI marketing site; unified Health Super Intelligence ecosystem site **Missing** ([`HSI_PUBLIC_WEBSITE_SPECIFICATION.md`](./HSI_PUBLIC_WEBSITE_SPECIFICATION.md) Proposed) | §8 Phase 3 site after D1 — MVP include |
| HSI-FR-040 ★ | Explain the four-product ecosystem clearly | P0 | Missing | Spec complete; public surfaces do not yet present four-product honesty | Website copy after brand decision (D1 / HSI-D06) |
| HSI-FR-041 ★ | Show verified capability availability honestly | P0 | Partial | Partner lock fixture honesty restored; capability badges Incomplete ([`HSI_EVIDENCE_AND_TRUST_UI.md`](./HSI_EVIDENCE_AND_TRUST_UI.md)) | Mandatory for MVP website + workspace |
| HSI-FR-042 ★ | Provide an interactive scientific research workspace | P0 | Verified working | ISI Atlas / Ask / journeys / GraphView — primary research surface ([`HSI_RESEARCHER_WORKSPACE_UX.md`](./HSI_RESEARCHER_WORKSPACE_UX.md) reuse) | Harden toward Question→…→Brief M1 journey |
| HSI-FR-043 | Provide a longitudinal clinician workspace | P1 | Missing | §8 clinician UX Proposed only | Phase 4 |
| HSI-FR-044 | Provide a coherent Aksh patient experience | P1 | Partial | Aksh Health exists (marketing + synthetic clinical proof) | Phase 3 integration; stay in Aksh ownership |
| HSI-FR-045 | Provide an explainable trial screening workspace | P1 | Mocked | Flag-off / scaffold ATLAS (Aksh) + ISI Trial Intelligence Partial | Phase 5; five criterion states |
| HSI-FR-046 ★ | Provide source inspection and evidence drawers | P0 | Partial | ISI Sources fold / citations; dedicated Evidence drawer per §8 Proposed | Complete drawer + Cats 1–5 for M1 |

---

## 5.7 Safety and Governance

| ID | Statement | Priority | Classification | Evidence (paths/docs) | Gap / next step |
|----|-----------|----------|----------------|----------------------|-----------------|
| HSI-FR-047 ★ | Enforce lawful and purpose-bound processing | P0 | Partial | UK GDPR posture docs; research-first processing; clinical lawful bases for live PHI **Not** production-ready ([`HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md`](./HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md)) | MVP: research/public planes only; no unapproved clinical processing |
| HSI-FR-048 ★ | Protect identifiable patient information | P0 | Verified working | hsi-core CDS/PHI refuse + Neon isolation tests; ISI no PHI default; Aksh syntheticOnly | Keep binding; Exchange A later |
| HSI-FR-049 | Prevent unsafe patient identity matching | P0 | Missing | HSI Clinical identity workflows absent; Aksh synthetic IDs only | Block clinical MVP until identity design + HITL |
| HSI-FR-050 | Apply clinical safety controls where required | P0 | Partial | Aksh HITL/SHIELD/GUARDIAN (simulation); DCB0129/0160 deferred (D10) | No clinical product claim until Phase 6 artifacts |
| HSI-FR-051 | Assess applicable medical device obligations | P0 | Not assessed | Assessment required (HSI-D08); docs note MHRA path — no completed classification filed in audits | Regulatory review before clinical features |
| HSI-FR-052 ★ | Enforce agent tool permissions | P0 | Partial | Aksh Guardian Gateway **Verified** (policy); ISI Ask locks; hsi-core no agent runtime; unrestricted research orchestrator **Missing** | M1: typed tools only (ADR-G5); no raw DB |
| HSI-FR-053 ★ | Maintain appropriate audit records | P0 | Partial | Gate C decisions; SHIELD (simulation); research execution record Proposed | M1 acceptance item 11 |
| HSI-FR-054 | Support incident response and capability shutdown | P0 | Not assessed | Feature flags / Trial Intelligence off exist as patterns; formal IR runbooks not audited | Document kill-switches before clinical/trials launch |

---

## P0 gaps that block Scientific MVP (Workflow B / Cap 3 / M1)

Highest-impact Partial/Missing items for the **research** MVP (not Clinical/Trials):

1. **Formal M1 research brief + claim categories** — FR-012, FR-021, FR-026–028, FR-030 (Ask/KG Partial; claim schema/UI Missing).  
2. **Research orchestration / execution audit** — FR-015, FR-016, FR-022, FR-053 (tool router + auditable record).  
3. **Honest public ecosystem site** — FR-039–041 (four-product explanation + capability labels).  
4. **Evidence drawer / contradiction presentation** — FR-018, FR-019 (conditional), FR-046.  
5. **Ontology resolution depth** — FR-008 (open IDs OK for M1; SNOMED gated).

## Later Clinical / Trials (do not treat as Scientific MVP blockers)

| Cluster | FRs | Status |
|---------|-----|--------|
| HSI Clinical longitudinal | 023, 024, 031–033, 043, 049–051 | Missing / Partial staging |
| Trials product | 014, 029, 035, 045 | Partial flag-off / Mocked |
| Aksh↔HSI exchange | 017 (clinical reuse), 036, 044 | Partial simulation / Missing exchange |
| Cross-product UX | 005, 006 (ecosystem) | Missing / Partial |

**Explicit:** No implementation until founder approval of this PRD and Scientific MVP scope.
