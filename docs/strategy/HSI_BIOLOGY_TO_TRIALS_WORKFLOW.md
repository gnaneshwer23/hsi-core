# HSI Biology → Trials Workflow (§6.12–6.13)

**Document status:** Target mechanism→target→trial→criteria journey  
**Aligns:** CDR Caps 7–8 · [`HSI_ORCHESTRATION_WORKFLOWS.md`](./HSI_ORCHESTRATION_WORKFLOWS.md) Workflow D · LHK-G Q8–Q9 · [`HSI_FOUR_PRODUCT_ECOSYSTEM.md`](./HSI_FOUR_PRODUCT_ECOSYSTEM.md) Trials / X-D*  
**Status:** Educational / melanoma flag-off **Partial**; product matcher **Missing**. **Aspirational** relative to M1.

---

## Purpose

Connect biological mechanisms to interventions and clinical studies, then (when authorised) evaluate **which trial criteria can be assessed** from available patient attributes — **never** declaring confirmed eligibility.

---

## Path A — Mechanism → trial discovery (Cap 7 / §6.12)

**Question:** “Which clinical trials investigate therapies targeting these mechanisms?”

### Sequence

1. Resolve biological mechanism  
2. Identify relevant molecular targets  
3. Identify therapeutic interventions  
4. Query trial registries  
5. Map interventions to studies  
6. Verify recruitment / status freshness  
7. Retrieve eligibility requirements (structured where possible)  
8. Explain mechanistic relationship (Cat 2–3 honesty)

### Required data / entities

Mechanism · protein/target · intervention/drug · trial · eligibility criterion stubs · registry provenance · evidence statements linking mechanism↔target↔intervention.

### Graph paths (LHK-G)

`Mechanism → Target ← TARGETS ← Intervention → Trial` (Q8–Q9 style); ISI TRIAL nodes as **seed only**.

### Tools

`exploreMechanism` · `traverseNeighbourhood` · `retrieveTrials` · Cap 17 criteria extract (**Proposed**) · Cap 20 freshness (**Proposed**)

### Evidence requirements

- Mechanistic link labelled Cat 2 or Cat 3 (not Cat 5 presented as established)  
- Registry source + retrieval date  
- Stale recruitment flagged  

### Access controls

Research/public registry metadata; no patient data required for Path A.

### Expected output

Mechanism-linked trial list with relevance rationale, status, and limitations.

### Failure conditions

Unresolved mechanism · empty registry hit · invented NCT IDs · treating mechanism-link as patient suitability.

### Safety

**A mechanism-linked study is not necessarily suitable for a particular patient.**

### Acceptance tests (future)

- Golden mechanism→NCT set with pin date  
- Fabricated registry ID rate = 0  
- Relevance rationale cites graph or literature sources  

### Status

**Partial** educational UI / flag-off pilots · full product **Proposed**/**Missing**.

---

## Path B — Patient–trial criteria assessment (Cap 8 / §6.13)

**Question:** “Which trial criteria can be assessed from the available patient record?”

### Sequence

1. Verify user permissions  
2. Retrieve structured trial criteria  
3. Retrieve **minimum necessary** patient attributes (P2)  
4. Evaluate each criterion  
5. Identify missing information  
6. Flag ambiguous criteria  
7. Preserve source evidence  
8. Generate reviewable screening results  

### Five criterion states (binding)

| State | Meaning |
|-------|---------|
| `satisfied` | Available evidence supports criterion |
| `not_satisfied` | Available evidence fails criterion |
| `unknown` | Required attribute missing / inaccessible |
| `ambiguous` | Criterion or evidence unclear |
| `requires_investigator_review` | Human must decide |

### Safety (non-negotiable)

**Never declare confirmed eligibility.** No sixth “eligible” product state. Investigator owns enrolment decision ([safety model](./HSI_AGENT_SAFETY_MODEL.md)).

### Tools / exchanges

Cap 18 matcher (**Missing**) · X-D1 / X-C1 sketches · Cap 20 freshness · clinical ACL.

### Evidence requirements

Each criterion row: state · patient attribute source (Cat 1) · criterion text provenance · evaluation method · timestamp.

### Access controls

Trial team / referring clinician; purpose-bound; patient educational surfaces use X-E1 only — no false hope eligibility UX.

### Expected output

Criterion-level eligibility **assessment** report (§6.20 trial screening output) + missing-info list (Cap 9).

### Failure conditions

Insufficient authz · unstructured criteria without extract confidence · stale trial · any emission of “confirmed eligible”.

### Acceptance tests (future)

- Gold set: **zero** confirmed-eligible labels  
- Unknown/ambiguous used when fixtures omit labs  
- Investigator agreement baseline before numeric targets  

### Status

**Missing** product · **Proposed** design · educational **Partial** only.

---

## Combined aspirational journey

Biology brief (ISI / M1 family) → Path A trial list → (authorised) Path B criterion states → human investigator decision.

**Do not** market as live HSI Trials capability. Sequencing: after M1 research foundation and Clinical attribute APIs.

---

## Map to LHK-G & §5

| Element | Map |
|---------|-----|
| Cap 7 | LHK-G Q9 · Caps 16–17,20 |
| Cap 8 | LHK-G L5 criterion statuses · Workflow D |
| Planes | P0 registries · P2 attributes · P3 screening decisions |

**Stop.** Docs only; no matcher implementation in this pack.
