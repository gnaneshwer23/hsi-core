# HSI Agent Orchestration Strategy

**§5 primary:** The definitive Intelligence Engine pack is indexed in [`README.md`](./README.md) (§5) — start with [`HSI_EXISTING_AGENT_AUDIT.md`](./HSI_EXISTING_AGENT_AUDIT.md) and [`HSI_INTELLIGENCE_ENGINE_ARCHITECTURE.md`](./HSI_INTELLIGENCE_ENGINE_ARCHITECTURE.md); this file remains a short index/summary.

**Rule:** Audit before invent. Prefer deterministic tools. Do not spawn unrelated chatbots.

---

## 1. Existing agents — Aksh Health (preserve)

Source: `aksh-health-redesign/packages/platform-uk/lib/agents.ts`, `AGENT_FUNCTIONALITY_AUDIT.md`.

| Agent | Responsibility | Orchestration | Recommendation |
|-------|----------------|---------------|----------------|
| CONDUCTOR | Supervisor / clinical spine | Central | **Keep** — clinical orchestration home |
| CANVAS | Intake | CONDUCTOR | Keep; validate |
| SYNTHESIS | Documentation | CONDUCTOR + HITL | Keep |
| BRIDGE | FHIR / Medplum staging | Data layer | Keep; expand only with partners |
| NEXUS | Clinical intelligence | CONDUCTOR | Keep; scope carefully vs CDS |
| GUARDIAN | Medication safety | CONDUCTOR + HITL | Keep |
| HORIZON | Risk (ex-ORACLE) | CONDUCTOR | Keep; no autonomous act |
| PATHWAY | Care coordination | Intervention | Keep |
| COMPASS | Population | Decision/intervention | Keep |
| SHIELD | Audit / regulatory | Always on path | Keep |
| PRISM | Imaging | Phase 2 `live:false` | Plan — do not fake live |
| ATLAS (Aksh) | Clinical research | Phase 2 `live:false` | Future bridge to ISI/HSI — **name collision with ISI Atlas** (D8) |

**Status honesty:** Register marks agents `in_validation` / `simulation`. Clinical release: **`LIVE_ORGANISATIONS = 0`**. Product must not claim cleared clinical AI. PRISM/ATLAS are scaffolds only.

**HSI policy:** Reuse **governance** (HITL, honesty contracts, PHI refuse) via Integration Gateway (Phase 5). **Do not** reimplement CONDUCTOR, diabetes clinical modules, or Medplum/EMIS paths inside hsi-core.

---

## 2. Existing research intelligence — ISI / hsi-core

| Capability | Form | Class |
|------------|------|-------|
| Ask Immune / AskAtlas | Single conversational gateway + grounding | Partial agent |
| Gate C human reviewer | Human + tooling | Verified |
| Cite Check | Deterministic script | Verified |
| hsi-core “agent catalog” | Documentation/stubs | Placeholder — not runtime |

**Do not** advertise these as the full investigator swarm until contracts + evals exist.

---

## 3. Proposed research agents (capabilities, not mandatory LLM processes)

Each capability needs: inputs, tools, evidence requirements, outputs, eval metrics, human gate.

| Capability | Tools preferred | Human gate |
|------------|-----------------|------------|
| Immune Cell Investigator | ISI KG traversal, Cell Ontology maps | Optional for browse; Gate C for new edges |
| Mechanism Investigator | Pathway DBs, Reactome, KG | Gate C for novel claims |
| Biomarker Investigator | LOINC maps (research), literature | Gate C |
| Microbiome Investigator | L3 graph + literature; **no individual causality** | Gate C |
| Systems Biology Investigator | Cross-layer queries | Gate C |
| Research Evidence Agent | PubMed/Europe PMC, Open Targets | Source verification |
| Contradiction Investigator | Parallel edges, study-design compare | Reviewer |
| Research Gap Investigator | Coverage analytics on KG | Draft L6 nodes |
| Hypothesis Generation | Propose only + validation plan | Always labelled hypothesis |

**Implementation preference:** Start as **named tool pipelines** behind Ask / Discovery briefs (Workflow A). Promote to discrete agents only when metrics justify.

---

## 4. Clinical trial capabilities

| Capability | Deterministic vs LLM | Output states |
|------------|----------------------|---------------|
| Trial discovery | Registry API + filters | Candidate list + provenance |
| Eligibility extraction | LLM draft + schema validate | Structured criteria |
| Patient–trial matching | Rules engine on structured fields | satisfied / not / clarification / unavailable / investigator |
| Mechanism analysis | L4/L5 graph | Linked evidence |
| Recruitment status | Registry refresh | Timestamped |
| Evidence evaluation | Literature tools | Graded |

**Never** emit “eligible” as clinical confirmation.

---

## 5. Shared safety & verification (independent)

- Evidence validation (source URI + retrieval date).  
- Access control (plane + role).  
- Clinical safety checks (Aksh SHIELD / future HSI Clinical).  
- Scientific uncertainty assessment (grades).  
- Human review (Gate C / HITL).  
- Audit logging (immutable event stream).

These may be **services**, not LLM agents.

---

## 6. Coordination model

```
Research mode:  Question → Research Router → tool pipelines → claim-labelled brief → Gate C if publish
Clinical mode:  Case → Aksh CONDUCTOR → HITL → SHIELD → (optional) research link-out de-identified
Trials mode:    Profile + disease → Trial tools → screening report → human investigator
```

Cross-mode calls pass **only** allowed claim types and scopes.

---

## 7. Evaluation

| Mode | Metrics |
|------|---------|
| Research | Citation precision, grade honesty, contradiction recall, brief reproducibility |
| Clinical | HITL accept/reject rates, safety incident rate, hallucination audits |
| Trials | Criterion-state accuracy vs gold charts; zero false “confirmed eligible” |

No production clinical claim without supervised evaluation (Phase 6).

---

## 8. Near-term build order (agents)

1. Harden Workflow A tool pipeline (reuse Ask + KG + hsi-core exports).  
2. Formalise claimType enum in shared schema.  
3. Structured L6 gap objects (deterministic coverage).  
4. Trial criterion state machine (Workflow C) — rules first.  
5. Aksh gateway — read validated summaries only.  
6. Named “investigator” UX labels only after pipelines meet eval bars.
