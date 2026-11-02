# HSI Reasoning Evaluation Framework (§6.22)

**Document status:** Evaluation design for cross-domain reasoning  
**Aligns:** [`HSI_AGENT_EVALUATION_FRAMEWORK.md`](./HSI_AGENT_EVALUATION_FRAMEWORK.md) (§5.16) · [`HSI_REFERENCE_REASONING_QUERIES.md`](./HSI_REFERENCE_REASONING_QUERIES.md) · LHK-G Deliverable 10  
**Rule:** Establish **baselines before numerical targets**. Do not invent production-ready scores.

---

## Purpose

Evaluate CDR beyond answer fluency — clinical correctness, scientific correctness, cross-domain coherence, safety, and operational performance.

§6 eval **extends** §5 agent/workflow eval; it does not replace golden sets G-Ask / G-Mech / G-Cite / G-Clinical / G-Trial / G-Hyp.

---

## Metric axes (§6.22)

### Clinical correctness

| Metric | Notes | Status |
|--------|-------|--------|
| Accurate clinical facts | Vs synthetic / gold charts | Cap 1–2 **Proposed** |
| Correct chronology | Event-time ordering | **Proposed** |
| Appropriate medication interpretation | Prescribe vs dispense vs admin | **Proposed** |
| Missing-data awareness | Cap 9; absence ≠ negation | **Proposed** |

### Scientific correctness

| Metric | Notes | Status |
|--------|-------|--------|
| Valid biomedical relationships | Expert / curator sample | G-Mech **Proposed** formal |
| Accurate evidence classification | Cats 1–5 mislabel rate | **Proposed** |
| Correct citation support | Precision/recall vs gold | Cite path **Partial**/**Verified** |
| Appropriate causal language | Overclaim rate | Ask honesty **Partial** |

### Cross-domain coherence

| Metric | Notes | Status |
|--------|-------|--------|
| Correct entity mappings | Ambiguity handling | **Partial** xrefs |
| Valid relationship traversal | No invented edges | Engine **Verified** |
| Consistent terminology | Cross-product IDs | **Proposed** |
| Appropriate use of evidence | Category preserved in briefs | M1 **Proposed** |

### Safety

| Metric | Notes | Target posture |
|--------|-------|----------------|
| Unauthorised data exposure | PHI→research probes | =0 after baseline |
| Unsupported clinical decisions | Prohibited-act attempts | =0 |
| Uncertainty communication | Required fields present | Measure then floor |
| Appropriate human review | Gate routing correctness | Gate C **Verified** path |
| Confirmed eligibility emissions | Cap 8 | **=0 forever** |

### Operational performance

| Metric | Notes |
|--------|-------|
| Workflow completion | A–E and Caps 1–12 staged |
| Tool reliability | Schema + ACL deny accuracy |
| Query latency | p95 baselines |
| Reproducibility | Same pin → same claim set |
| Cost | Per-brief token/tool cost |

---

## Expert cases & goldens

| Set | CDR focus | Overlap |
|-----|-----------|---------|
| **G-Ask / G-Mech** | Cap 3 M1 | §5 Workflow B |
| **G-Cite** | Stage 7 verification | §5 L5 |
| **G-Clinical** | Caps 1–2, 9 | §5 Workflow A |
| **G-Trial** | Caps 7–8; five states | §5 Workflow D |
| **G-Hyp** | Cap 12 Cat 5 fields | §5 Workflow E |
| **G-Contra** (**Proposed**) | Cap 10 pairs | LHK-G Q7 |
| **G-Gap** (**Proposed**) | Cap 11 scope honesty | LHK-G Q10 |
| **G-XDomain** (**Proposed**) | X-B1 concept-only + category mix | Exchange B |

Use expert-reviewed evaluation cases and appropriate reference datasets (synthetic FHIR for clinical; pinned graph/packs for research).

---

## Baselines before targets

1. Freeze goldens versioned with graph/pack commit  
2. Run current Ask / engine / Cite Check / CONDUCTOR sim → record baseline  
3. Only then set release floors (pattern: Aksh `targetsConfirmedBy: null` until CSO)  
4. No MHRA/clinical validation claim from eval alone  

---

## Overlap with §5 evaluation

| §5 layer | §6 use |
|----------|--------|
| Tool | Entity resolve, traverse, evidence, trials tools |
| Agent/capability | Caps 1–12 honesty metrics |
| Workflow | A–E e2e; M1 first |
| Clinical | Caps 1–2, 8–9 safety |
| Research | Caps 3–6, 10–12 scientific |

Harness seeds: hsi-core tests **Verified**; ISI ask/graph/HSI **Verified**/**Partial**; Aksh eval **Partial**; Workflow B M1 e2e **Proposed**.

---

## Release posture (CDR)

- M1 research brief: ship as research aid when G-Ask/G-Mech baselines + citation floors met — **not CDS**.  
- Clinical CDR and trial screening: simulation/synthetic until safety case + LIVE_ORGANISATIONS policy.  
- Integrated clinical→biology→trials journey: evaluate only after product foundations exist — do not claim working.

**Stop.** No “90% accurate cross-domain reasoning” marketing without measured baselines and founder/CSO confirmation.
