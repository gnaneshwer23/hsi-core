# HSI Clinical → Biology Workflow (§6.18 steps 1–5 + Exchange B)

**Document status:** Aspirational integrated journey segment — **not shipped**  
**Aligns:** [`HSI_CROSS_DOMAIN_REASONING_ARCHITECTURE.md`](./HSI_CROSS_DOMAIN_REASONING_ARCHITECTURE.md) · [`HSI_FOUR_PRODUCT_ECOSYSTEM.md`](./HSI_FOUR_PRODUCT_ECOSYSTEM.md) (Exchange B / **X-B1**) · [`HSI_ORCHESTRATION_WORKFLOWS.md`](./HSI_ORCHESTRATION_WORKFLOWS.md) Workflow A · LHK-G Q1–Q4  
**Milestone note:** First product milestone remains **Workflow B / M1** (research). This clinical→biology journey is **Proposed** / aspirational.

---

## Scenario (illustrative)

A clinician reviews a patient with diabetes and inflammatory disease. Available records show changes in glucose control, inflammatory markers, and medication history.

HSI **should eventually** reconstruct facts, analyse time, attach biological context, compare evidence, and separate patient facts from general disease associations — then hand off to ISI for deeper research (and later trials). **Do not claim this end-to-end works today.**

---

## Steps 1–5 (clinical → biology)

### Step 1 — Clinical facts

Reconstruct the documented timeline from authorised sources (encounters, conditions, labs, meds, symptoms, outcomes).

| Item | Detail |
|------|--------|
| Data | P2 clinical + optional Aksh PGHD enrichment (X-A1 **Proposed**) |
| Tools | Clinical FHIR read, `temporalQuery`, Caps 1/5 |
| Categories | **Cat 1** Observed Patient Fact only for patient assertions |
| Status | Aksh synthetic spine **Partial**; HSI Clinical product **Missing** |

### Step 2 — Temporal analysis

Identify when relevant measurements and medication changes occurred. Preserve event time vs recorded time vs corrections.

| Item | Detail |
|------|--------|
| Methods | Chronology sort; med change detection; lab trend windows |
| Safety | **Temporal sequence ≠ causation** |
| Status | **Partial** fragments · product **Proposed** |

### Step 3 — Biological context

Retrieve established knowledge about inflammatory and metabolic pathways relevant to **documented conditions/concepts** — not a claim that those pathways are active in this patient.

| Item | Detail |
|------|--------|
| Exchange | **X-B1 BiomedicalMechanismLookup** (Exchange B) |
| Payload | Disease/phenotype **concepts only** — **no patient identifiers** |
| Return | Mechanisms + cites + uncertainty + evidence categories 2–3 |
| Owner | ISI serves; HSI Clinical consumes |
| Status | Contract **Proposed** |

### Step 4 — Evidence comparison

Examine published human and experimental findings for returned mechanisms. Classify study design; separate Cat 2 vs Cat 3; retain contradictions.

| Item | Detail |
|------|--------|
| Tools | `retrieveEvidence`, `compareRelationships`, Cite Check on publish path |
| Status | Research side **Partial**; wired clinical UX **Missing** |

### Step 5 — Uncertainty assessment

Distinguish measured patient facts (Cat 1) from general disease associations (Cat 2–3) and any inferences/hypotheses (Cat 4–5). List missing information relevant to the clinical question.

| Item | Detail |
|------|--------|
| Output | Structured clinical investigation panel (§6.20) |
| Safety | Population biology ≠ patient-active mechanism |
| Status | **Proposed** |

---

## Exchange B / X-B1 (binding)

| Field | Value |
|-------|-------|
| Contract | **X-B1** BiomedicalMechanismLookup |
| Direction | HSI Clinical → ISI |
| PHI | **Forbidden** — abstracted concepts only |
| claimTypes | Required on response claims |
| Failure | Unresolved concept → clarify; empty neighbourhood → say so |

See [`HSI_FOUR_PRODUCT_ECOSYSTEM.md`](./HSI_FOUR_PRODUCT_ECOSYSTEM.md) § Exchange B. Downstream steps 6–10 (ISI deep dive, trials, eligibility, human decision, research continuity) are specified in sibling workflow docs and §6.18 — **aspirational**.

---

## Safety: population biology ≠ patient-active mechanism

| Allowed | Forbidden |
|---------|-------------|
| “Published evidence associates pathway P with phenotype X.” | “This patient’s labs prove pathway P is driving their disease.” |
| “Mechanism map for concept Diabetes mellitus (concept id).” | Sending MRN/NHS number into ISI tools |
| Clinician interprets Cat 1 + Cat 2 side-by-side | Auto clinical action from biology brief |
| Label Cat 3 associations as non-causal | Upgrade association → established without Gate C |

Aligns with [`HSI_AGENT_SAFETY_MODEL.md`](./HSI_AGENT_SAFETY_MODEL.md) High-tier rules and cdsPhiBoundary.

---

## Map to reference capabilities & LHK-G

| Step | CDR Cap | LHK-G |
|------|---------|-------|
| 1–2 | Cap 1 Longitudinal · Cap 2 Med–lab | Q1, Q2 |
| 3–4 | Cap 3 Disease–mechanism · Cap 6 Human evidence | Q3, Q4, Q6 |
| 5 | Cap 9 Missing info | Cross-cutting |

---

## Acceptance (future — baselines first)

- Synthetic multi-provider fixture: Cat 1 provenance ≥ threshold TBD after baseline.  
- X-B1 gold: zero PHI fields in request; claimTypes present on response.  
- Expert review: no causal patient attribution from population edges.

**Stop.** Not an M1 deliverable. M1 stays research Workflow B.
