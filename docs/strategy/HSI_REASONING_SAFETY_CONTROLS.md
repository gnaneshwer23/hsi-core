# HSI Reasoning Safety Controls (§6.21)

**Document status:** Binding failure-mode and language controls for CDR  
**Aligns:** [`HSI_AGENT_SAFETY_MODEL.md`](./HSI_AGENT_SAFETY_MODEL.md) · [`HSI_EVIDENCE_VERIFICATION_DESIGN.md`](./HSI_EVIDENCE_VERIFICATION_DESIGN.md) · [`HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md`](./HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md) · `cdsPhiBoundary`  
**Status:** Clinical gates **Verified** in simulation; research Gate C **Verified** patterns; full CDR enforcement **Proposed**.

---

## Design principle

The engine must **fail safely** when evidence is insufficient. Prefer refusal, gaps, and uncertainty over fluent invention.

---

## Failure modes catalogue (§6.21)

| Failure mode | Control | Plane / gate | Status |
|--------------|---------|--------------|--------|
| Incorrect patient matching | Identity verification before clinical retrieve; no cross-patient merge | P2 / Clinical | **Partial** synthetic |
| Missing clinical data | Explicit gap; absence ≠ negation | Cap 9 | **Proposed** product |
| Conflicting medication records | Retain both; discrepancy flag; no silent winner | P2 | **Partial** Aksh |
| Incorrect unit interpretation | Unit canonicalisation + QC flags | L4 clinical | **Partial** |
| Ontology mapping errors | Ambiguity flag; multi-candidate; no silent merge | `resolveEntity` | **Partial** |
| Unsupported graph relationships | Only tool-returned edges; draft flagged | P0/P1 | **Verified** engine pattern |
| Citation hallucination | Cite Check + validateAnswerCitations; drop unresolved | L5 | **Verified**/**Partial** |
| Outdated research evidence | Retrieval timestamps; trial freshness Cap 20 | P0 | **Proposed** freshness |
| Misinterpreted statistical associations | Force Cat 3 label; ban causal verbs | Categories | **Proposed** enum |
| False causal conclusions | Causal language rules (below); Stage 7 verify | L5 | **Partial** Ask honesty |
| Incorrect trial criteria extraction | Schema extract + ambiguous state | Cap 17 | **Missing** |
| Unverified trial recruitment status | Freshness check; stale flag | Cap 20 | **Proposed** |
| Excessive confidence in model predictions | Cat 4 + method/version; no fake % | Cap 4 | **Proposed** |
| Data leakage across permission boundaries | Plane isolation; neonGuard; X-B1 concepts-only | P0–P3 | **Verified** guards |

---

## Plane isolation

| Rule | Enforcement |
|------|-------------|
| P2 PHI ↛ P0/P1 research Neon / packs | neonGuard · Gate C host assert · cdsPhiBoundary **Verified** |
| Clinical→ISI only via X-B1 concepts | Exchange B **Proposed** |
| Research tools never receive MRN/NHS | ACL deny **Proposed** shared IAM; product-local **Partial** |
| Trials screening attributes min-necessary | Workflow D |
| Agent memory: clinical context stays P2 | [Safety model memory categories](./HSI_AGENT_SAFETY_MODEL.md) |

---

## Causal language rules

| Allowed | Forbidden |
|---------|-----------|
| “Associated with” (Cat 3) | “Causes” / “explains this patient” from Cat 3–5 |
| “Established mechanism in literature” (Cat 2 + review) | “Active in this patient” without Cat 1 + clinical judgement |
| “Computationally predicted” (Cat 4) | Presenting scores as validated biology |
| “Hypothesis (unvalidated)” (Cat 5) | Auto-promote hyp to established |
| “May be relevant for investigation” | Autonomous Rx / dose / diagnosis finalise |

Stage 7 verification must reject unjustified causal language before user-facing “supported” copy.

---

## Temporal ≠ causal

Medication introduced before a lab change → **chronology** (Cap 2), not causation.  
Event order in timelines → sequence facts (Cat 1), not mechanism proof.  
“Preceded” is allowed; “caused” requires appropriate evidence category and human clinical context.

---

## HITL gates (CDR-relevant)

| Output class | Gate | Tier |
|--------------|------|------|
| Research brief publish / cite promote | Gate C Check → supports → Approve | Medium |
| Hypothesis use in experiments | Expert scientific review | Medium |
| Clinical recommendations / meds | GUARDIAN / HITL / PROHIBITED_FOR_ALL | High |
| Trial enrolment decision | Investigator review only | High |
| Live org clinical | LIVE_ORGANISATIONS / safety case | High (currently 0) |

**Do not** automatically initiate clinical actions from unreviewed reasoning (pipeline Stage 10).

---

## Safe degradation checklist

1. Detect and record failed operation  
2. Preserve completed **verified** results  
3. Never fabricate missing info or citations  
4. Communicate limitations  
5. Retry only if idempotent and safe  
6. Escalate by risk tier  

---

## Acceptance

- Eval hazard set includes causal overclaim, PHI leak probes, confirmed-eligible emission (=0).  
- M1 research path: fabricated-cite rate = 0 on harness; Gate C auto-approve attempts = 0.

**Stop.** No weakening of Guardian / SHIELD / Gate C for feature speed.
