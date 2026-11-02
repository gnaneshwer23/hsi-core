# HSI Strategy Pack (2026-11-02)

Strategic product reset: audit, architecture, and roadmap. **No feature implementation in this pack.**

**Agent skills (on demand):** see [`../AGENT_SKILLS.md`](../AGENT_SKILLS.md) — when to load installed personal Cursor skills for HSI/ISI work (not always-applied).

**Product requirements authority:** [HSI_MASTER_PRD_v1.md](./HSI_MASTER_PRD_v1.md) (Master PRD V1.0 — **Proposed**, pending founder approval).  
**FR traceability + Scientific MVP:** [HSI_FR_REQUIREMENTS_TRACEABILITY.md](./HSI_FR_REQUIREMENTS_TRACEABILITY.md) · [HSI_PRD_GAP_ANALYSIS_AND_MVP.md](./HSI_PRD_GAP_ANALYSIS_AND_MVP.md).  
**PRD companions (canonical):** Document **02** Architecture & Data · Document **03** Intelligence Engine Spec · Document **04** Design System & UX. Detailed packs **§2–§8** remain elaboration + Phase 0 audits. Honesty: [HSI_DOC02_03_RECONCILIATION.md](./HSI_DOC02_03_RECONCILIATION.md) (Docs 02/03/04).

### Master PRD companions (Documents 02, 03 & 04)

| Doc | Purpose |
|-----|---------|
| [HSI_ARCHITECTURE_AND_DATA.md](./HSI_ARCHITECTURE_AND_DATA.md) | **Document 02** — Architecture and Data Design (Proposed / pending founder approval) |
| [HSI_INTELLIGENCE_ENGINE_SPEC.md](./HSI_INTELLIGENCE_ENGINE_SPEC.md) | **Document 03** — Intelligence Engine & Agent Spec (Proposed / pending founder approval) |
| [HSI_DESIGN_SYSTEM_AND_UX.md](./HSI_DESIGN_SYSTEM_AND_UX.md) | **Document 04** — Unified Design System and UX (Proposed / pending founder approval) |
| [HSI_DOC02_03_RECONCILIATION.md](./HSI_DOC02_03_RECONCILIATION.md) | Open/Proposed (companions 02/03/04) vs Observed (Phase 0 audits) — do not upgrade Missing |

**Authoritative vision:** [HSI_MASTER_VISION.md](./HSI_MASTER_VISION.md) (§2).  
**Authoritative product architecture:** Document 02 companion above + [HSI_FOUR_PRODUCT_ECOSYSTEM.md](./HSI_FOUR_PRODUCT_ECOSYSTEM.md) (§3 — ownership, APIs, journeys, anti-duplication).  
**Authoritative LHK-G:** [HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md](./HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md) (§4).  
**Authoritative Intelligence Engine:** Document 03 Spec above; **§5** pack below elaborates agents/orchestration with audit classifications.  
**Authoritative Cross-Domain Reasoning:** §6 pack below (evidence categories, pipeline, twelve capabilities).  
**Authoritative Data Sources & Interoperability:** §7 pack below (catalogue, FHIR/biomedical/trials/PGHD, maturity L0–L5).  
**Authoritative Product Experience & UX:** Document 04 companion above; **§8** pack below elaborates audit, IA, website, design system, role workspaces, trust UI, a11y, acceptance, roadmap.  
**Primary board deliverable:** [HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md](./HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md) (current vs vision; stop for founder approval).

| Doc | Purpose |
|-----|---------|
| [HSI_MASTER_PRD_v1.md](./HSI_MASTER_PRD_v1.md) | **Master PRD V1.0** — product requirements authority (Proposed) |
| [HSI_ARCHITECTURE_AND_DATA.md](./HSI_ARCHITECTURE_AND_DATA.md) | **Document 02** — Architecture & Data (PRD companion) |
| [HSI_INTELLIGENCE_ENGINE_SPEC.md](./HSI_INTELLIGENCE_ENGINE_SPEC.md) | **Document 03** — Intelligence Engine Spec (PRD companion) |
| [HSI_DESIGN_SYSTEM_AND_UX.md](./HSI_DESIGN_SYSTEM_AND_UX.md) | **Document 04** — Design System & UX (PRD companion) |
| [HSI_DOC02_03_RECONCILIATION.md](./HSI_DOC02_03_RECONCILIATION.md) | Companion (02/03/04) vs Phase 0 audit honesty |
| [HSI_FR_REQUIREMENTS_TRACEABILITY.md](./HSI_FR_REQUIREMENTS_TRACEABILITY.md) | HSI-FR-001–054 classifications + evidence |
| [HSI_PRD_GAP_ANALYSIS_AND_MVP.md](./HSI_PRD_GAP_ANALYSIS_AND_MVP.md) | Goals G-01–G-07, Scientific MVP, §16 acceptance, HSI-D01–D10 |
| [HSI_MASTER_VISION.md](./HSI_MASTER_VISION.md) | **Definitive** HSI vision (§2) |
| [HSI_FOUR_PRODUCT_ECOSYSTEM.md](./HSI_FOUR_PRODUCT_ECOSYSTEM.md) | **Definitive** four-product architecture (§3) + D1–D10 deliverables |
| [HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md](./HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md) | **Definitive** LHK-G (§4) — ISI audit, six domains, Q1–Q10, ADRs |
| [HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md](./HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md) | Integrated current-state intelligence + first milestone |
| [HSI_EXECUTIVE_SUMMARY.md](./HSI_EXECUTIVE_SUMMARY.md) | Concise findings + founder decisions |
| [HSI_COMPETITOR_ANALYSIS_2026-11.md](./HSI_COMPETITOR_ANALYSIS_2026-11.md) | Competitive landscape (Owkin/BenchSci/Function/Tempus); ISI-first entry |
| [HSI_EXISTING_SYSTEM_AUDIT.md](./HSI_EXISTING_SYSTEM_AUDIT.md) | Evidence-based audit of hsi-core, ISI, Aksh |
| [HSI_TARGET_ARCHITECTURE.md](./HSI_TARGET_ARCHITECTURE.md) | Logical architecture and data planes |
| [HSI_KNOWLEDGE_GRAPH_MASTER_PLAN.md](./HSI_KNOWLEDGE_GRAPH_MASTER_PLAN.md) | Layers, ontologies, provenance |
| [HSI_AGENT_ORCHESTRATION_STRATEGY.md](./HSI_AGENT_ORCHESTRATION_STRATEGY.md) | Index/summary — see **§5 pack** for definitive intelligence engine |
| [HSI_DATA_INTEGRATION_STRATEGY.md](./HSI_DATA_INTEGRATION_STRATEGY.md) | Short index — **§7 pack is definitive** |
| [HSI_USER_JOURNEYS.md](./HSI_USER_JOURNEYS.md) | Role experiences and product Workflow A/B/C — **§8 pack is definitive UX** |
| [HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md](./HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md) | Privacy, safety, regulatory posture |
| [HSI_PRODUCT_ROADMAP.md](./HSI_PRODUCT_ROADMAP.md) | Product phases 0–6 |
| [HSI_GAP_ANALYSIS_AND_DECISIONS.md](./HSI_GAP_ANALYSIS_AND_DECISIONS.md) | Gaps + D1–D10 approvals |

---

## §5 — HSI Intelligence Engine (definitive elaboration)

**PRD companion (canonical Document 03):** [HSI_INTELLIGENCE_ENGINE_SPEC.md](./HSI_INTELLIGENCE_ENGINE_SPEC.md). §5 files below remain detailed elaboration + audit classifications — do not treat Spec targets as Verified.

| Doc | Purpose |
|-----|---------|
| [HSI_EXISTING_AGENT_AUDIT.md](./HSI_EXISTING_AGENT_AUDIT.md) | Aksh + ISI + hsi-core agent inventory (reuse vs propose) |
| [HSI_INTELLIGENCE_ENGINE_ARCHITECTURE.md](./HSI_INTELLIGENCE_ENGINE_ARCHITECTURE.md) | Layers 1–5, planes P0–P3, orchestrator, HITL |
| [HSI_AGENT_AND_CAPABILITY_CATALOGUE.md](./HSI_AGENT_AND_CAPABILITY_CATALOGUE.md) | Caps 1–20 Type A–D; status; owners; §5.11 contract example |
| [HSI_ORCHESTRATION_WORKFLOWS.md](./HSI_ORCHESTRATION_WORKFLOWS.md) | Reference workflows A–E (M1 = Workflow B) |
| [HSI_TOOL_AND_API_CONTRACTS.md](./HSI_TOOL_AND_API_CONTRACTS.md) | Typed tools + X-* sketches; no raw DB |
| [HSI_AGENT_SAFETY_MODEL.md](./HSI_AGENT_SAFETY_MODEL.md) | Risk tiers, gates, memory categories, restrictions |
| [HSI_EVIDENCE_VERIFICATION_DESIGN.md](./HSI_EVIDENCE_VERIFICATION_DESIGN.md) | Independent verification; Gate C; second LLM ≠ verify |
| [GATE_C_CURATOR_PATH.md](./GATE_C_CURATOR_PATH.md) | Pointer → ISI operator Check→supports→Approve path (immunecity) |
| [HSI_AGENT_EVALUATION_FRAMEWORK.md](./HSI_AGENT_EVALUATION_FRAMEWORK.md) | Tool/agent/workflow/clinical/research metrics + goldens |
| [HSI_INTELLIGENCE_OBSERVABILITY.md](./HSI_INTELLIGENCE_OBSERVABILITY.md) | Execution records; PHI logging rules; retention |
| [HSI_INTELLIGENCE_IMPLEMENTATION_ROADMAP.md](./HSI_INTELLIGENCE_IMPLEMENTATION_ROADMAP.md) | Phases 0–7; smallest foundation; stop for approval |

---

## §6 — HSI Cross-Domain Reasoning (definitive)

| Doc | Purpose |
|-----|---------|
| [HSI_CROSS_DOMAIN_REASONING_ARCHITECTURE.md](./HSI_CROSS_DOMAIN_REASONING_ARCHITECTURE.md) | Mission, CDR meaning, mermaid §6.4, LHK-G + §5 layer maps, source selection |
| [HSI_REASONING_PIPELINE.md](./HSI_REASONING_PIPELINE.md) | Stages 1–10; tools, authz, failure, verification; orchestrator map |
| [HSI_EVIDENCE_CATEGORY_SPECIFICATION.md](./HSI_EVIDENCE_CATEGORY_SPECIFICATION.md) | Binding Cats 1–5; UI/data rules; never collapse |
| [HSI_CLAIM_PROVENANCE_SCHEMA.md](./HSI_CLAIM_PROVENANCE_SCHEMA.md) | Claim fields §6.19; YAML; versioning; Gate C / grades link |
| [HSI_REFERENCE_REASONING_QUERIES.md](./HSI_REFERENCE_REASONING_QUERIES.md) | Twelve capabilities §6.6–6.17; LHK-G Q map; Partial vs Proposed |
| [HSI_CLINICAL_TO_BIOLOGY_WORKFLOW.md](./HSI_CLINICAL_TO_BIOLOGY_WORKFLOW.md) | §6.18 steps 1–5 + Exchange B / X-B1; population ≠ patient mechanism |
| [HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md](./HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md) | Mechanism→trial→criteria; five states; never confirmed eligibility |
| [HSI_RESEARCH_DISCOVERY_WORKFLOW.md](./HSI_RESEARCH_DISCOVERY_WORKFLOW.md) | Gaps, contradictions, hypotheses; M1 → Workflow E; Gate C |
| [HSI_REASONING_SAFETY_CONTROLS.md](./HSI_REASONING_SAFETY_CONTROLS.md) | Failure modes §6.21; plane isolation; causal/temporal rules; HITL |
| [HSI_REASONING_EVALUATION_FRAMEWORK.md](./HSI_REASONING_EVALUATION_FRAMEWORK.md) | §6.22 metrics; baselines; overlap with §5 eval |

---

## §7 — HSI Data Sources & Interoperability (definitive)

| Doc | Purpose |
|-----|---------|
| [HSI_EXISTING_INTEGRATION_AUDIT.md](./HSI_EXISTING_INTEGRATION_AUDIT.md) | What exists in hsi-core / ISI / Aksh (maturity L0–L5) |
| [HSI_DATA_SOURCE_CATALOGUE.md](./HSI_DATA_SOURCE_CATALOGUE.md) | Source evaluation matrix §7.23; priorities; licensing |
| [HSI_INTEROPERABILITY_ARCHITECTURE.md](./HSI_INTEROPERABILITY_ARCHITECTURE.md) | Six stages §7.2; mermaid §7.3; planes P0–P3 |
| [HSI_CLINICAL_FHIR_STRATEGY.md](./HSI_CLINICAL_FHIR_STRATEGY.md) | FHIR R4 / UK Core / SMART / HL7v2 — Proposed; synthetic first |
| [HSI_BIOMEDICAL_DATA_STRATEGY.md](./HSI_BIOMEDICAL_DATA_STRATEGY.md) | Literature + structured sources §7.11–7.12; M1 priority |
| [HSI_TRIAL_REGISTRY_STRATEGY.md](./HSI_TRIAL_REGISTRY_STRATEGY.md) | CTG / ICTRP; melanoma Partial vs full product |
| [HSI_PATIENT_GENERATED_DATA_STRATEGY.md](./HSI_PATIENT_GENERATED_DATA_STRATEGY.md) | Aksh PGHD owner; Exchange A; no PHI to ISI |
| [HSI_TERMINOLOGY_MAPPING_SPECIFICATION.md](./HSI_TERMINOLOGY_MAPPING_SPECIFICATION.md) | SNOMED/LOINC/MONDO/…; xrefs; 8 LOINC links; licence gates |
| [HSI_DATA_PROVENANCE_AND_QUALITY.md](./HSI_DATA_PROVENANCE_AND_QUALITY.md) | Provenance; quality §7.18; freshness §7.19; conflicts §7.20 |
| [HSI_DATA_SECURITY_AND_GOVERNANCE.md](./HSI_DATA_SECURITY_AND_GOVERNANCE.md) | UK GDPR/DPA; planes; agreements; points to clinical safety |
| [HSI_INTEGRATION_TESTING_STRATEGY.md](./HSI_INTEGRATION_TESTING_STRATEGY.md) | Contract tests; maturity gates L0→L5; honesty asserts |
| [HSI_INTEGRATION_ROADMAP.md](./HSI_INTEGRATION_ROADMAP.md) | Phases 0–7 §7.24; Phase 0 = this pack |

---

## §8 — HSI Product Experience & UX (definitive elaboration)

**PRD companion (canonical Document 04):** [HSI_DESIGN_SYSTEM_AND_UX.md](./HSI_DESIGN_SYSTEM_AND_UX.md). §8 files below remain detailed elaboration + Phase 0 UX audit — do not treat Spec targets as Verified.

| Doc | Purpose |
|-----|---------|
| [HSI_EXISTING_UX_AUDIT.md](./HSI_EXISTING_UX_AUDIT.md) | Routes/IA/visual/interaction/credibility — ISI, hsi-core site, Aksh |
| [HSI_PRODUCT_INFORMATION_ARCHITECTURE.md](./HSI_PRODUCT_INFORMATION_ARCHITECTURE.md) | One ecosystem, four experiences; nav; switcher; anti-patterns |
| [HSI_PUBLIC_WEBSITE_SPECIFICATION.md](./HSI_PUBLIC_WEBSITE_SPECIFICATION.md) | Homepage §§8.6 (1–11); pages §8.7; honest CTAs |
| [HSI_UNIFIED_DESIGN_SYSTEM.md](./HSI_UNIFIED_DESIGN_SYSTEM.md) | Brand audit; tokens; components; avoid list §8.4 |
| [HSI_CLINICIAN_WORKSPACE_UX.md](./HSI_CLINICIAN_WORKSPACE_UX.md) | Search→Identity→Timeline→Context→Evidence→Trials |
| [HSI_RESEARCHER_WORKSPACE_UX.md](./HSI_RESEARCHER_WORKSPACE_UX.md) | Question→Graph→Mechanism→Compare→Gaps→Brief; ISI reuse |
| [HSI_PATIENT_WORKSPACE_UX.md](./HSI_PATIENT_WORKSPACE_UX.md) | Aksh journey; educational vs advice; no fabricated measurements |
| [HSI_TRIAL_TEAM_WORKSPACE_UX.md](./HSI_TRIAL_TEAM_WORKSPACE_UX.md) | Five criterion states; never “Patient eligible” |
| [HSI_ROLE_BASED_ONBOARDING.md](./HSI_ROLE_BASED_ONBOARDING.md) | Post-auth routing by role |
| [HSI_EVIDENCE_AND_TRUST_UI.md](./HSI_EVIDENCE_AND_TRUST_UI.md) | Evidence drawer; Cats 1–5; ban fake confidence % |
| [HSI_RESPONSIVE_ACCESSIBILITY_PLAN.md](./HSI_RESPONSIVE_ACCESSIBILITY_PLAN.md) | WCAG 2.2 AA; desktop/tablet/mobile priorities |
| [HSI_UX_TESTING_AND_ACCEPTANCE.md](./HSI_UX_TESTING_AND_ACCEPTANCE.md) | §8.37 clinician/researcher/patient/trial/visitor tests |
| [HSI_UX_IMPLEMENTATION_ROADMAP.md](./HSI_UX_IMPLEMENTATION_ROADMAP.md) | Phases 0–9; recommend Phase 3 site + Phase 4 researcher first |

**Stop:** No website/app implementation without founder approval.

**Start here:** [Master PRD V1.0](./HSI_MASTER_PRD_v1.md) → [Document 02 Architecture](./HSI_ARCHITECTURE_AND_DATA.md) / [Document 03 Intelligence Spec](./HSI_INTELLIGENCE_ENGINE_SPEC.md) / [Document 04 Design System & UX](./HSI_DESIGN_SYSTEM_AND_UX.md) → [reconciliation](./HSI_DOC02_03_RECONCILIATION.md) → [FR traceability](./HSI_FR_REQUIREMENTS_TRACEABILITY.md) / [PRD gap + MVP](./HSI_PRD_GAP_ANALYSIS_AND_MVP.md) → Executive Summary → Gap Analysis decisions (D1–D10) → §5 Intelligence Engine (if agents/orchestration) → §6 Cross-Domain Reasoning (if investigation workflows / claimTypes) → §7 Data Sources (if integrations / FHIR / registries / PGHD) → §8 Product Experience (if IA / website / role UX).
