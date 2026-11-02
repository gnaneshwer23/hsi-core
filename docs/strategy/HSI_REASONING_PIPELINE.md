# HSI Cross-Domain Reasoning Pipeline (§6.5)

**Document status:** Definitive CDR pipeline stages  
**Aligns:** [`HSI_CROSS_DOMAIN_REASONING_ARCHITECTURE.md`](./HSI_CROSS_DOMAIN_REASONING_ARCHITECTURE.md) · [`HSI_ORCHESTRATION_WORKFLOWS.md`](./HSI_ORCHESTRATION_WORKFLOWS.md) · [`HSI_INTELLIGENCE_ENGINE_ARCHITECTURE.md`](./HSI_INTELLIGENCE_ENGINE_ARCHITECTURE.md) · [`HSI_TOOL_AND_API_CONTRACTS.md`](./HSI_TOOL_AND_API_CONTRACTS.md) · [`HSI_EVIDENCE_VERIFICATION_DESIGN.md`](./HSI_EVIDENCE_VERIFICATION_DESIGN.md)

**Status:** Pipeline as **Proposed** end-to-end; fragments **Partial**/**Verified** under product homes (Ask/engine; Aksh CONDUCTOR sim).

---

## Orchestrator mapping

| Pipeline stage | §5 layer | Primary home (research) | Primary home (clinical) |
|----------------|----------|-------------------------|-------------------------|
| 1 Understand | L1 | ISI `askGrounding` / intent | Aksh case_run context |
| 2 Decompose | L2 | ISI research router (**Proposed**) | Aksh CONDUCTOR (**Verified** sim) |
| 3 Retrieve | L3/L4 | Caps 7–15 + tools | Caps 1–6 + FHIR |
| 4 Resolve entities | L4 | `resolveEntity`, xrefs | Clinical terminology |
| 5 Evidence context | L2 state | Ephemeral research workspace | Clinical context pack (P2) |
| 6 Analyse | L3/L4 | Graph / evidence / stats | Temporal / med / lab |
| 7 Verify claims | L5 | Cite Check, claim_support | GUARDIAN / SHIELD patterns |
| 8 Uncertainty | L5 | claimType + honesty | Missing/conflict labels |
| 9 Structured explanation | L2 assemble | Brief / Ask answer | Clinician summary |
| 10 Human review | HITL / Gate C | Curator / SME | Prescriber / clinician gates |

Agents call **typed tools only** — never raw DB (LHK-G Deliverable 8).

---

## Stage 1 — Understand the question

**Determine:** user intent · role · clinical or scientific context · relevant entities · required evidence · data-access permissions · risk level · expected output.

| Aspect | Detail |
|--------|--------|
| Tools | Intent classifiers / `prepareAsk` (**Partial**); clinical purpose binding (**Partial**) |
| Authz | Role + purpose + plane; fail-closed on insufficient permission |
| Failure | Ambiguous intent → clarify or refuse; clinical-personal on research surface → refuse |
| Verification | Risk tier assigned before tool fan-out ([safety model](./HSI_AGENT_SAFETY_MODEL.md)) |

---

## Stage 2 — Decompose the question

Break into smaller answerable sub-questions. Example: *“Could inflammatory mechanisms explain changes in this patient's metabolic measurements?”* → documented metabolic changes · inflammatory measurements · meds/conditions · established inflammation–metabolism mechanisms · human evidence · missing patient-specific info · alternative explanations.

**Do not** assume answering each sub-question proves causality.

| Aspect | Detail |
|--------|--------|
| Tools | Planner / CONDUCTOR peer plan (**Verified** sim clinical); research decompose **Proposed** |
| Authz | Sub-plans inherit parent ACL; no PHI sub-plan on research plane |
| Failure | Over-broad decompose → cap depth; refuse high-tier without gate |
| Verification | Plan logged in execution record ([observability](./HSI_INTELLIGENCE_OBSERVABILITY.md)) |

---

## Stage 3 — Retrieve authorised information

Use clinical APIs · Aksh services · KG queries · scientific evidence retrieval · trial registries. **Preserve source metadata.**

| Aspect | Detail |
|--------|--------|
| Tools | FHIR/clinical read · `traverseNeighbourhood` · `retrieveEvidence` · `retrieveTrials` · pack consume |
| Authz | Min-necessary; X-B1 concepts-only for Clinical→ISI |
| Failure | Timeout → partial verified subset; missing provider → explicit gap |
| Verification | Source URI / retrieval time on retained facts |

---

## Stage 4 — Resolve entities

Map clinical disease terms → biomedical concepts · LOINC → measurement concepts · meds → drug IDs · genes → canonical IDs · cells → Cell Ontology. **Flag ambiguous mappings.**

| Aspect | Detail |
|--------|--------|
| Tools | `resolveEntity`, ISI `xrefs` (**Partial** — external IDs sparse on kg nodes) |
| Authz | Scope-limited vocabularies |
| Failure | Ambiguity → multi-candidate + human/clarify; never silent wrong merge |
| Verification | Mapping confidence qualitative; audit retained |

---

## Stage 5 — Build evidence-linked reasoning context

Temporary representation: entities · relationships · sources · time · evidence categories · uncertainty · contradictions. Question-specific; permission-scoped.

| Aspect | Detail |
|--------|--------|
| Tools | Workflow state memory (ephemeral) — not clinical SoT |
| Authz | Context never exported across planes except allowed claim scopes |
| Failure | Oversized context → truncate with disclosed limits |
| Verification | Every edge/claim carries category + review_status |

---

## Stage 6 — Execute appropriate analysis

Prefer deterministic / statistical / graph methods; AI only when advantage is clear (§2.11).

Examples: time-series · medication chronology · multi-hop traversal · evidence comparison · study-design evaluation · trial criterion evaluation (five states).

| Aspect | Detail |
|--------|--------|
| Tools | Caps per [catalogue](./HSI_AGENT_AND_CAPABILITY_CATALOGUE.md); Workflow B tools for M1 |
| Authz | Analysis method cannot escalate ACL |
| Failure | Method unavailable → degrade to retrieval-only labelled output |
| Verification | Method + version recorded for computational inferences (Cat 4) |

---

## Stage 7 — Verify claims

Check: sources exist · claims supported · clinical facts accurate · evidence categories correct · causal language justified · limitations present.

| Aspect | Detail |
|--------|--------|
| Tools | Citation Verification · Evidence Verification · output schema validate |
| Authz | Verifier independent of generator ([§5.10](./HSI_EVIDENCE_VERIFICATION_DESIGN.md)) |
| Failure | Unresolvable cite → drop or label unavailable — **never invent PMID** |
| Verification | Check ≠ supports ≠ Approve ≠ CDS |

---

## Stage 8 — Assess uncertainty

Identify missing information · conflicting records · limited evidence · study heterogeneity · computational uncertainty · unvalidated hypotheses.

| Aspect | Detail |
|--------|--------|
| Tools | Uncertainty labelling; contradiction index (**Proposed**) |
| Authz | Uncertainty disclosure not optional on Medium/High |
| Failure | Cannot quantify → qualitative labels only (no fake %) |
| Verification | Categories 1–5 preserved in UI/data |

---

## Stage 9 — Generate structured explanation

Present: direct answer · relevant facts · scientific context · supporting evidence · uncertainty · missing information · next investigation. Prefer structured surfaces (§6.20), not only chat.

| Output class | Shape | Status |
|--------------|-------|--------|
| Clinical investigation | Timeline, changes, sources, gaps, safety notices | **Proposed** product |
| Scientific investigation | Mechanism map, evidence statements, gaps, hyps | **Partial** Ask; M1 brief **Proposed** |
| Trial screening | Trials, criteria states, missing info, investigator review | **Missing** / educational **Partial** |

---

## Stage 10 — Apply human review

Route consequential outputs to qualified users. **Do not** automatically initiate clinical actions from unreviewed reasoning.

| Risk | Gate | Status |
|------|------|--------|
| Medium research promote | Gate C Check → supports → Approve | **Verified** path |
| High clinical | HITL / GUARDIAN / prohibited acts | **Verified** sim |
| High eligibility | Investigator review only | Matcher **Missing**; confirmed eligibility **forbidden** |
| Hypothesis use | Expert review before experiment/use | Cap 15 **Proposed** |

---

## Map to §5 reference workflows

| Workflow | Pipeline emphasis | Milestone |
|----------|-------------------|-----------|
| **B** Immune Mechanism ★ M1 | Stages 1–9 research; Gate C if publish | **Near-term** |
| **A** Longitudinal Patient | 1–10 clinical spine | **Later** |
| **C** Gut–Immune–Metabolic | 3–8 with confounder honesty | **Later** after M1 |
| **D** Trial Screening | 3–10 with five states | **Later** |
| **E** Hypothesis Generation | 2–10; all Cat 5; Gate C before promote | **Later** after B |

---

## Acceptance for this doc

- Stages 1–10 named with tools, authz, failure, verification.  
- Dual-home orchestrator mapping explicit.  
- M1 = Workflow B research path — not full clinical CDR.

**Stop.** No pipeline code until founder approval.
