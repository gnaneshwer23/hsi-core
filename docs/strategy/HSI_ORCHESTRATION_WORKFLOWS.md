# HSI Orchestration Workflows (§5.17)

**Document status:** Five reference intelligence workflows — target sequences with honesty on readiness  
**PRD companion:** [`HSI_INTELLIGENCE_ENGINE_SPEC.md`](./HSI_INTELLIGENCE_ENGINE_SPEC.md) (Document 03) — Spec §§6, 16 reference workflows; Document 02 WF-01–05.  
**Naming map:** §5 workflows A–E ≠ older product-roadmap labels.  
- **§5 Workflow B** (Immune Mechanism) = **product M1 Biomedical Discovery Brief** (earlier docs called this “Workflow A”).  
- **§5 Workflow A** (Longitudinal Patient) = clinical foundation (earlier “Workflow B”) — **Phase 4+**.  
**Status:** **Near-term** · **Later** · **Partial today**  
**CDR detail (§6):** twelve capability specs in [`HSI_REFERENCE_REASONING_QUERIES.md`](./HSI_REFERENCE_REASONING_QUERIES.md); pipeline stages in [`HSI_REASONING_PIPELINE.md`](./HSI_REASONING_PIPELINE.md).

For each workflow: tools, data contracts, authz, failure handling, verification, acceptance.

---

## Readiness summary

| Workflow | Question theme | Implementable now? | Depends on |
|----------|----------------|--------------------|------------|
| **A** Longitudinal Patient Context | What changed over the past year? | **Later** (synthetic rehearsal only) | Caps 1,5; P2 ACL; FHIR fixtures |
| **B** Immune Mechanism Investigation | Which immune pathways for this disease? | **Near-term (M1)** | Caps 8,12,7; ISI KG; Ask |
| **C** Gut–Immune–Metabolic | Metabolites ↔ inflammation ↔ IR | **Later** (thin seeds today) | Cap 10–11; reviewed gut packs |
| **D** Clinical Trial Screening | Relevant trials for this patient? | **Later** | Caps 16–20; five states; authz |
| **E** Research Hypothesis Generation | Underexplored resistance mechanisms? | **Later** after B | Caps 13–15; Gate C |

---

## Workflow A — Longitudinal Patient Context

**Question:** “What changed in this patient's health over the past year?”  
**Owner:** HSI Clinical + Aksh · **Plane:** P2  
**Status:** **Partial** fragments in Aksh synthetic spine; product journey **Missing**

### Sequence (§5.17)

1. Verify authorisation  
2. Retrieve available records  
3. Reconstruct chronology  
4. Analyse relevant changes  
5. Identify missing information  
6. Generate source-linked summary  
7. Apply safety checks  
8. Present clinician-facing results  

### Tools

`temporalQuery`, clinical FHIR read (scoped), medication list compare (A), lab trend (C), GUARDIAN/safety (as needed), SHIELD audit.

### Data contracts

- Input: `patientId`, `window`, `purpose`, `role`  
- Output: timeline events `{source, time, type, value, uncertainty}`, `missing[]`, `conflicts[]`, `claimType: observed`  
- Exchange: X-A1 PGHD enrichment **Proposed**

### Authz

Verified clinician identity + org + purpose; syntheticOnly until LIVE_ORGANISATIONS > 0 and safety case.

### Failure handling

Missing provider → explicit gap; conflict → both sides retained; never invent negative findings; tool timeout → partial verified subset.

### Verification

Source URI presence; no undocumented diagnosis; safety gate if med discrepancy high-risk.

### Acceptance

Synthetic multi-provider fixture: provenance on ≥95% events; missing-data warnings when source absent; clinician review agreement baseline established before targets.

---

## Workflow B — Immune Mechanism Investigation ★ M1

**Question:** “Which immune pathways are implicated in this disease?”  
**Owner:** ISI (+ hsi-core evidence) · **Plane:** P0/P1  
**Status:** **Partial today** — Ask + engine **Verified**; formal brief **Proposed** · **Near-term**

### Sequence

1. Resolve disease concept  
2. Traverse ISI graph  
3. Retrieve evidence  
4. Compare mechanisms  
5. Identify uncertainty  
6. Generate cited explanation  

### Tools

`resolveEntity`, `traverseNeighbourhood`, `exploreMechanism`, `retrieveEvidence`, `compareRelationships`, Ask `prepareAsk` / citation validate; optional literature fetch; Cite Check for publish path.

### Data contracts

- Input: `research_question`, `disease_concepts[]`, `evidence_filters`  
- Output: `mechanism_entities[]`, `evidence_statements[]` with `claimType`, `supporting_sources[]`, `uncertainties[]`, `review_status`  
- Consume: X-G1 graded packs where approved  

### Authz

Researcher / public browse for approved graph; curator for Gate C promotion. **No PHI.**

### Failure handling

Unresolved entity → clarify; empty neighbourhood → say so; failed lit fetch → no fabricated PMIDs; degrade to graph-only brief.

### Verification

Every cite resolvable or labelled unavailable; grades/claimTypes preserved; no causal overclaim.

### Acceptance (M1)

Golden set of disease→mechanism briefs: citation precision baseline; unsupported-claim rate measured; expert review sample; reproducible given same graph version.

---

## Workflow C — Gut–Immune–Metabolic Investigation

**Question:** “What evidence links gut microbial metabolites to inflammation and insulin resistance?”  
**Owner:** ISI · **Plane:** P0/P1  
**Status:** **Partial** thin packs · **Later** after M1

### Sequence

1. Resolve microbial and host concepts  
2. Retrieve relevant graph relationships  
3. Identify supporting studies  
4. Compare evidence  
5. Assess methodological limitations  
6. Identify contradictions  
7. Produce evidence network  

### Tools

Caps 10–11 pipelines; `traverseNeighbourhood` with domain filters; Cap 12–13; microbiome confounder checklist (A).

### Data contracts

Output network labelled **association** vs **mechanism** vs **hypothesis**; explicit “no patient causality”.

### Authz

Research only; no individual microbiome PHI.

### Failure / verification / acceptance

Same honesty as B; additional acceptance: confounder and study-design fields present; contradiction register non-empty when opposing edges exist.

---

## Workflow D — Clinical Trial Screening

**Question:** “Which trials may be relevant to this patient's condition?”  
**Owner:** HSI Trials + Clinical · **Plane:** P2 attributes + P3 decisions + P0 registries  
**Status:** Flag-off ISI UI **Partial**; matcher **Missing** · **Later**

### Sequence

1. Verify permissions  
2. Retrieve required clinical attributes  
3. Search official trial sources  
4. Extract eligibility criteria  
5. Evaluate available criteria  
6. Identify missing information  
7. Verify trial status  
8. Produce reviewable screening report  

### Tools

`retrieveTrials`, Cap 17 extract (schema), Cap 18 matcher (A), Cap 20 freshness, X-D1, X-C1; never emit confirmed eligible.

### Criterion states

`satisfied` | `not_satisfied` | `unknown` | `ambiguous` | `requires_investigator_review`

### Authz

Min-necessary patient attributes; trial team / referring clinician; patient-facing surfaces use X-E1 educational only.

### Failure / verification / acceptance

Stale registry → flag; ambiguous criterion → ambiguous state; zero false “confirmed eligible” on gold set; investigator agreement baseline.

---

## Workflow E — Research Hypothesis Generation

**Question:** “What underexplored mechanisms could explain treatment resistance?”  
**Owner:** ISI · **Plane:** P0/P1  
**Status:** **Proposed** · **Later** after Workflow B

### Sequence

1. Define research scope  
2. Retrieve relevant evidence  
3. Traverse mechanism graph  
4. Identify contradictions  
5. Identify evidence gaps  
6. Generate candidate hypotheses  
7. Suggest validation approaches  
8. Flag all hypotheses as unvalidated  
9. Produce expert-reviewable research brief  

### Tools

Caps 8,12–15; `registerHypothesis` (proposed); Gate C before any knowledge promotion.

### Required hypothesis fields

Statement, rationale, supporting/contradictory evidence, assumptions, validation plan, limitations, `review_status=unvalidated`.

### Authz / failure / verification / acceptance

No silent promotion; Type D only after tool pack; expert usefulness score baseline; fabricated-cite rate = 0 on eval harness.

---

## Cross-workflow notes

- Clinical↔research calls pass **allowed claim types and scopes only**.  
- Workflow B is the **smallest coherent** orchestration proof for the research home.  
- Do not claim A–E as shipped products.
