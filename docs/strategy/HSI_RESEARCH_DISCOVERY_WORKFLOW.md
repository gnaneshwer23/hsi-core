# HSI Research Discovery Workflow (§6.15–6.17)

**Document status:** Gaps, contradictions, hypotheses — research discovery loop  
**Aligns:** CDR Caps 10–12 · [`HSI_ORCHESTRATION_WORKFLOWS.md`](./HSI_ORCHESTRATION_WORKFLOWS.md) Workflow E · LHK-G Domain 6 / Q7 / Q10 · [`HSI_MASTER_VISION.md`](./HSI_MASTER_VISION.md) §2.14  
**Milestone:** Builds on **M1 / Workflow B**; Workflow E is **Later** after B. Gate C required before knowledge promotion.

---

## Mission

Move from mechanism briefs to systematic discovery: where literature disagrees, what remains underexplored, and what testable hypotheses (always Cat 5) deserve expert review — without inventing edges or resolving science by LLM vote.

---

## Alignment with M1 Biomedical Discovery Brief

| M1 (Workflow B) | Discovery extension (Workflow E / Caps 10–12) |
|-----------------|-----------------------------------------------|
| Disease → pathways → cites → uncertainty | Add contradiction register |
| Gaps called out informally | Prioritised research-gap register with search scope |
| No hyp promotion | Structured Cap 5 hypotheses + validation plans |
| Gate C if publish cites | Gate C **mandatory** before any hyp → approved knowledge |

M1 acceptance does **not** require Caps 10–12 complete. Discovery objects are **Proposed** after M1 baselines.

---

## Cap 10 — Scientific contradictions (§6.15)

**Question:** “Where does the scientific literature disagree?”

| Dimension | Spec |
|-----------|------|
| Required data | Claim under study; supporting + opposing/null studies; populations; methods |
| Graph | Finding `CONTRADICTS` Finding (**Missing** first-class; parallel edges **Partial**) |
| Tools | `compareRelationships`, `retrieveEvidence`, contradiction index (**Proposed**) |
| Methods | Compare populations, methodologies, measurements, confounders; summarise unresolved disagreement |
| Evidence | Cat 2–3 paired; never delete minority by vote |
| Authz | Research; no PHI |
| Output | Evidence contradiction report |
| Failure | Silent merge of opposing edges; majority-vote “truth” |
| Acceptance | Gold contradiction pairs; recall measured after baseline |
| LHK-G | Q7 |
| Status | **Proposed** (no first-class CONTRADICTS model today) |

---

## Cap 11 — Underexplored mechanisms (§6.16)

**Question:** “Which biological mechanisms remain underexplored?”

| Dimension | Spec |
|-----------|------|
| Required data | Defined corpus; known mechanisms; experimental + clinical evidence scope |
| Graph | CandidateMechanism + evidence scope (Domain 6) |
| Tools | Gap analytics (**Proposed**); neighbourhood coverage stats |
| Methods | Limited validation detection; missing population/tissue; document search limitations |
| Evidence | Gaps are Cat 4/meta or labelled absence — **not** Cat 2 |
| Authz | Research |
| Output | Prioritised research-gap register |
| Failure | “Not in KG” presented as “not in literature” |
| Acceptance | Search-scope note mandatory; SME usefulness baseline |
| LHK-G | Q10 |
| Status | **Proposed** |

---

## Cap 12 — Hypothesis and experiment design (§6.17)

**Question:** “What experiments could investigate a proposed biological relationship?”

| Dimension | Spec |
|-----------|------|
| Required data | Hypothesis statement; supporting + contradictory evidence; assumptions |
| Graph / objects | Hypothesis lifecycle Proposed→…→Superseded (**Proposed**) |
| Tools | `registerHypothesis` (**Proposed**); Caps 8,12–15 |
| Methods | Models, outcomes, controls, confounders, validation, falsification criteria |
| Evidence | **Always Cat 5** `unvalidated` until expert review |
| Authz | Researcher role; no auto-publish |
| Output | Structured experimental investigation proposal |
| Failure | Silent KG write; causal patient language; missing falsification |
| Acceptance | Required fields 100% on gold; fabricated-cite = 0; expert review before use |
| Status | **Proposed** |

---

## Discovery pipeline (condensed)

1. Define research scope (post-M1 corpus pin)  
2. Retrieve evidence + traverse mechanisms  
3. Identify contradictions (Cap 10)  
4. Identify gaps (Cap 11)  
5. Generate candidate hypotheses (Cap 12) — Cat 5  
6. Suggest validation approaches  
7. Flag all hypotheses unvalidated  
8. Expert-reviewable brief  
9. **Gate C** (Check → supports → Approve) only if promoting evidence into approved layer  

Matches Workflow E sequence and scientific discovery loop (§2.14).

---

## Gate C for promotion (binding)

| Action | Allowed? |
|--------|----------|
| Draft hyp in research workspace | Yes (Cat 5) |
| Show hyp in M1-adjacent brief with label | Yes if clearly unvalidated |
| Auto-approve into public KG / packs | **No** (`autoApprove=false` **Verified**) |
| LLM extract → approved edge | **Forbidden** without validation (LHK-G) |
| Human Approve after Check + support | Yes — curated path |

---

## Current vs target

| Element | Status |
|---------|--------|
| Ask informal uncertainty / refuse | **Partial**/**Verified** grounding |
| Formal contradiction objects | **Missing**/**Proposed** |
| Gap register with search scope | **Proposed** |
| Hypothesis lifecycle API | **Proposed** |
| Workflow E e2e | **Proposed** · Later after M1 |

**Stop.** Implement discovery only after M1 baselines and founder go-ahead.
