# HSI Evidence Category Specification (§6.3)

**Document status:** Binding evidence and reasoning categories for all HSI products  
**Aligns:** [`HSI_MASTER_VISION.md`](./HSI_MASTER_VISION.md) §2.7 · [`HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md`](./HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md) · [`HSI_CLAIM_PROVENANCE_SCHEMA.md`](./HSI_CLAIM_PROVENANCE_SCHEMA.md) · [`HSI_EVIDENCE_VERIFICATION_DESIGN.md`](./HSI_EVIDENCE_VERIFICATION_DESIGN.md) · hsi-core grades / Gate C

**Rule:** These five categories **must never be collapsed** in data architecture, intelligence engine, evidence graph, or UI.

**Status:** Conceptual binding **Verified** in strategy; shared `claimType` enum formalisation **Proposed** (Phase 1).

---

## Category summary

| # | Category | `claimType` (proposed) | Typical plane |
|---|----------|------------------------|---------------|
| 1 | Observed Patient Fact | `observed_patient_fact` | P2 |
| 2 | Established Scientific or Clinical Evidence | `established_evidence` | P0/P1 |
| 3 | Statistical Association | `statistical_association` | P0/P1 |
| 4 | Computational Inference | `computational_inference` | P0/P1/P3 draft |
| 5 | Unvalidated Hypothesis | `unvalidated_hypothesis` | P1 draft |

---

## Category 1 — Observed Patient Fact

Information directly documented in an authorised clinical record or patient-generated source.

**Examples:** lab result on a date · hospital encounter · prescribed medication · patient-reported symptom · measured glucose.

**Requirements:**

- Source identifier  
- Observation or event time  
- Recording time where relevant  
- Measurement method  
- Verification status  
- Data quality  
- Access restrictions  

**Rules:** Patient-reported observations **must** be distinguished from independently verified clinical measurements. Absence of a record ≠ negative finding.

**UI/data:** Timeline events with source chips; never merge into “science says” panels without category change. Icons/labels must say **Observed** / **Patient-reported**, not “Evidence”.

**Current map:** Aksh FHIR staging / synthetic spine **Partial**; HSI Clinical product **Missing**.

---

## Category 2 — Established Scientific or Clinical Evidence

Knowledge supported by appropriate scientific or clinical evidence.

**Examples:** well-characterised molecular pathway · documented drug MoA · guideline-supported clinical relationship · reproducible biological mechanism.

**Requirements:**

- Source references  
- Evidence context  
- Relevant population or experimental model  
- Review status  
- Important limitations  

**Rules:** Established evidence may still have boundaries of applicability. Public ISI cites require Gate C / curation path where applicable.

**UI/data:** Mechanism / edge cards with review_status; hsi-core grades and ISI `ESTABLISHED` / approved `claim_support` map here only after review mapping ADR.

**Current map:** hsi-core graded packs + Gate C **Verified** patterns; ISI evidence_status **Partial** bridge (**Proposed** ADR).

---

## Category 3 — Statistical Association

A relationship observed in data **without** sufficient evidence to establish causality.

**Examples:** biomarker ↔ disease severity · microbial taxon ↔ metabolic disease · cell-state signature ↔ treatment response.

**Requirements:**

- Study design  
- Population  
- Effect estimate where available  
- Statistical uncertainty  
- Confounders  
- Relevant limitations  

**Rules:** **Do not** convert an association into a causal explanation. Microbiome/population associations must not imply patient-active mechanism without Cat 1 measurements + Cat 2 support.

**UI/data:** Explicit **Associated** label; causal verbs forbidden in default copy. Confounder fold mandatory for GIM (LHK-G L3).

**Current map:** ISI relation signs + evidence_status **Partial**; formal association object **Proposed**.

---

## Category 4 — Computational Inference

A conclusion generated through a computational method.

**Examples:** network-based candidate mechanism · model-generated subgroup · predicted drug–target interaction · inferred biomarker relationship.

**Requirements:**

- Method  
- Model version  
- Input data  
- Validation status  
- Performance limitations  
- Uncertainty  

**Rules:** Computational inference ≠ experimental validation. Score thresholds without validated methods → qualitative uncertainty only.

**UI/data:** **Inferred** badge + method/version footer; cannot promote to Cat 2 without independent evidence + Gate C.

**Current map:** Adapter stubs / ranking ideas **Partial**/**Proposed**; production inference pipeline **Missing**.

---

## Category 5 — Unvalidated Hypothesis

A proposed explanation requiring further testing.

**Examples:** candidate immune pathway for treatment resistance · proposed microbiome-mediated inflammation · possible metabolic–immune interaction.

**Requirements:**

- Hypothesis statement  
- Biological rationale  
- Supporting evidence  
- Contradictory evidence  
- Assumptions  
- Proposed validation  
- Review status  

**Rules:** Always `review_status=unvalidated` until expert review. **Never** auto-approve into approved KG (`autoApprove=false`). Cap 15 / Workflow E only after M1.

**UI/data:** Distinct **Hypothesis** treatment; draft layer / research workspace — not Atlas “established” chrome.

**Current map:** Ask can draft narrative **Partial**; `registerHypothesis` + lifecycle objects **Proposed**.

---

## Representation rules (binding)

1. **Never collapse** categories in storage, APIs, or UI aggregation (“all evidence”).  
2. **Never upgrade** category silently (e.g. Cat 3 → Cat 2) without Gate C / clinical verification as appropriate.  
3. **Cross-domain answers** may mix categories in one brief — each claim must carry its own category.  
4. **Patient surfaces:** Cat 2–5 are education/research context only unless clinical product + authz say otherwise.  
5. **No fake confidence %** without validated method ([vision §2.9](./HSI_MASTER_VISION.md)).  
6. Map ISI `evidence_status` and hsi-core grades via explicit ADR — approximate bridge in LHK-G Deliverable 5 is **not** automatic sync.

### Approximate bridge (non-authoritative until ADR)

| Existing signal | Likely category |
|-----------------|-----------------|
| Clinical FHIR observation | 1 |
| Gate C approved + ESTABLISHED / high grade | 2 |
| EMERGING / EXPERIMENTAL / association edge | 3 |
| Model/network score without experiment | 4 |
| HYPOTHESIS / Cap 15 / draft hyp | 5 |

---

## Acceptance

- Spec used by claim schema, Ask honesty, M1 brief schema, and future X-* payloads.  
- Eval penalises category mislabel and causal overclaim ([§6 eval](./HSI_REASONING_EVALUATION_FRAMEWORK.md)).

**Stop.** Enum freeze is a Phase 1 decision — not silent rename of ISI fields.
