# HSI Agent and Capability Catalogue (§5.4, §5.6–5.9, §5.11)

**Document status:** Definitive capability catalogue for the Intelligence Engine (§5 elaboration)  
**PRD companion:** [`HSI_INTELLIGENCE_ENGINE_SPEC.md`](./HSI_INTELLIGENCE_ENGINE_SPEC.md) (Document 03) — Spec §§5, 12–15 target catalogues; retain audit status keys below.  
**Prefer:** Type **A** (deterministic) → **B** (graph/retrieval) → **C** (analytical) → **D** (LLM reasoning)  
**Status key:** **Verified** · **Partial** · **Mocked** · **Proposed** · **Missing**  
**Owner products:** Aksh · HSI Clinical (target) · ISI · HSI Trials (target) · Shared (hsi-core / foundation)

Illustrative agent contract (§5.11) appears in §4 below — **not** an implementation claim.

---

## 1. Type classification (§5.4)

| Type | When | Examples |
|------|------|----------|
| **A** Deterministic | Well-defined rules | FHIR validate, terminology lookup, age criterion, list diff |
| **B** Graph & retrieval | Structured knowledge fetch | Pathway traversal, trial registry fetch, cite lookup |
| **C** Analytical | Validated compute | Trends, network stats, cohort (governed) |
| **D** AI reasoning | Flexible synthesis/planning | Literature synthesis, contradiction narrative, hypothesis draft |

**Policy:** Do not spawn a Type D agent where A/B/C suffice. Named “investigators” start as **tool pipelines**.

---

## 2. Capabilities 1–20

### 2.1 Patient & clinical (§5.6) — prefer Aksh reuse

| # | Capability | Preferred type | Status | Owner | Existing map | Notes |
|---|------------|----------------|--------|-------|--------------|-------|
| 1 | Patient Context Intelligence | A/B | **Partial** | Aksh → HSI Clinical | CANVAS, CONDUCTOR context, BRIDGE staging | Synthetic 360; no multi-provider SoT |
| 2 | Symptom Intelligence | A | **Partial** | Aksh | CANVAS intake; PGHD modules | Not diagnosis |
| 3 | Medication Safety Intelligence | A (+ optional D draft) | **Verified** (sim) | Aksh | **GUARDIAN** + guardian-gateway + `medication_decision` | No auto Rx |
| 4 | Metabolic Monitoring Intelligence | A/C | **Partial** | Aksh | Diabetes Phases 0–6 / coaching; HORIZON factors | `syntheticOnly`; LIVE_ORG=0 |
| 5 | Longitudinal Health Intelligence | A/C | **Partial** / **Missing** as HSI Clinical | HSI Clinical (target) | Fragments in Aksh timeline proof | Workflow A (§5) later |
| 6 | Care Coordination Intelligence | A | **Verified** (sim) | Aksh | **PATHWAY**, Front Desk parallel | No autonomous patient messages |

### 2.2 Immune & biomedical (§5.7) — prefer ISI + LHK-G tools

| # | Capability | Preferred type | Status | Owner | Existing map | Notes |
|---|------------|----------------|--------|-------|--------------|-------|
| 7 | Immune Cell Investigator | B (+ D narrate) | **Partial** | ISI | `engine.ts` cell nodes; Ask | Named agent **Proposed** |
| 8 | Mechanism Investigator | B (+ D narrate) | **Partial** | ISI | Pathway traversal; Ask; hsi packs | **Near-term M1 core** |
| 9 | Biomarker Investigator | B | **Partial** | ISI | BIOMARKER nodes; LOINC maps thin in hsi-core | Clinical vs research biomarker honesty |
| 10 | Microbiome Investigator | B | **Partial** / thin | ISI + hsi packs | Gut depth packs thin | No individual causality |
| 11 | Systems Biology Investigator | B/C | **Proposed** | ISI | Cross-type edges partial | Cap after M1 |

### 2.3 Scientific research (§5.8)

| # | Capability | Preferred type | Status | Owner | Existing map | Notes |
|---|------------|----------------|--------|-------|--------------|-------|
| 12 | Research Evidence Investigator | B (+ D extract) | **Partial** | ISI + hsi-core | Ask retrieval; PubMed/Crossref Check; packs | Citation verify independent |
| 13 | Contradiction Investigator | B/C (+ D explain) | **Missing** / **Proposed** | ISI | No first-class CONTRADICTS model | Do not LLM-vote science |
| 14 | Research Gap Investigator | B/C | **Proposed** | ISI + hsi-core | Coverage analytics informal | L6 gap objects |
| 15 | Hypothesis Generation Investigator | D + schema | **Proposed** | ISI | Workbench educational fields | Always `unvalidated` |

### 2.4 Clinical trials (§5.9)

| # | Capability | Preferred type | Status | Owner | Existing map | Notes |
|---|------------|----------------|--------|-------|--------------|-------|
| 16 | Trial Discovery | B | **Partial** | HSI Trials | ISI TrialIntelligence flag-off; Aksh ATLAS scaffold | Registry APIs target |
| 17 | Eligibility Criteria Extraction | A/D+schema | **Mocked** / **Proposed** | HSI Trials | ATLAS synthetic eval | Ambiguity flags required |
| 18 | Patient–Trial Matching | A | **Missing** product | HSI Trials | Five states in vision; melanoma UI ≠ matcher | Never “confirmed eligible” |
| 19 | Trial Mechanism Investigator | B | **Proposed** | Trials + ISI | X-C1 MechanismToTrials | After Cap 8 |
| 20 | Trial Status & Evidence Verification | A/B | **Proposed** | HSI Trials | Freshness metadata missing | Timestamped registry |

### 2.5 Shared verification (§5.10) — services, not agents

| Service | Type | Status | Map |
|---------|------|--------|-----|
| Evidence verification | A/B | **Partial** | Gate C claim_support human |
| Citation verification | A | **Verified** Check | Cite Check script |
| Uncertainty assessment | A + labels | **Partial** | Grades / Ask honesty |
| Clinical safety checks | A | **Verified** (sim) | GUARDIAN, SHIELD, gates |
| Access control | A | **Partial** | Neon Auth ISI; Aksh matrix; no shared IAM |
| Output validation | A | **Partial** | Contracts / Zod-ish schemas |
| Human review | Process | **Verified** patterns | HITL queue; Gate C |
| Audit logging | A | **Verified** (Aksh SHIELD); **Partial** research | |

---

## 3. Reuse vs proposed split

| Reuse (do not rebuild) | Propose new (after eval) |
|------------------------|--------------------------|
| CONDUCTOR + peers in Aksh | Formal Caps 7–15 pipelines behind Ask |
| Ask grounding + engine | Contradiction / gap / hypothesis schemas |
| Gate C + Cite Check + cdsPhiBoundary | Trials criterion state machine (Cap 18) |
| hsi-core grades + X-G1 consume | Shared L1 intent + L2 research orchestrator |
| SHIELD / human-gates patterns | Cross-product X-B1 / X-D1 tool faces |

**Avoid:** Type D swarm; CONDUCTOR clone in hsi-core; Navigator invention; marketing agents without tools.

---

## 4. Standard agent contract example (§5.11)

Illustrative only — not claimed as implemented:

```yaml
agent:
  id: "mechanism-investigator"
  version: "proposed-v1"
  domain: "biomedical-research"

  purpose:
    "Investigate evidence-supported biological mechanisms."

  inputs:
    - research_question
    - disease_concepts
    - biological_context
    - evidence_filters

  permitted_tools:
    - biomedical_entity_resolution
    - knowledge_graph_query
    - scientific_evidence_retrieval

  outputs:
    - mechanism_entities
    - evidence_statements
    - supporting_sources
    - contradictory_sources
    - uncertainties
    - review_status

  restrictions:
    - no_unrestricted_patient_data_access
    - no_unverified_causal_claims
    - no_fabricated_citations
    - no_direct_graph_publication_without_review

  evaluation:
    - entity_mapping_accuracy
    - evidence_grounding
    - citation_accuracy
    - scientific_expert_assessment
```

Final contracts must match validated schemas after Phase 1 tool contracts.

---

## 5. Near-term capability slice (M1)

**Product M1 = Biomedical Discovery Brief = §5 Workflow B (Immune Mechanism).**

Minimum capability set:

1. Cap 8 Mechanism Investigator (Type B pipeline)  
2. Cap 12 Evidence Investigator (retrieval + cite check)  
3. Cap 7 (partial) cell/pathway neighbours as needed  
4. L5 citation/uncertainty + optional Gate C for publish  

Clinical Caps 1–6 and Trials Caps 16–20: **Phase 4+** relative to intelligence roadmap (see implementation roadmap).
