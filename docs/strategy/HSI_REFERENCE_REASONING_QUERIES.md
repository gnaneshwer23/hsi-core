# HSI Reference Reasoning Queries (§6.6–6.17)

**Document status:** Definitive catalogue of twelve CDR capabilities  
**Aligns:** [`HSI_CROSS_DOMAIN_REASONING_ARCHITECTURE.md`](./HSI_CROSS_DOMAIN_REASONING_ARCHITECTURE.md) · [`HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md`](./HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md) Q1–Q10 · [`HSI_ORCHESTRATION_WORKFLOWS.md`](./HSI_ORCHESTRATION_WORKFLOWS.md) · Caps in [`HSI_AGENT_AND_CAPABILITY_CATALOGUE.md`](./HSI_AGENT_AND_CAPABILITY_CATALOGUE.md)

**Rule:** Spec only unless status says otherwise. **Proposed** = not implemented. **Partial** = reusable fragments exist (e.g. Ask/graph for disease–mechanism).

---

## Status summary

| Cap | Name | Status today | LHK-G | §5 workflow |
|-----|------|--------------|-------|-------------|
| 1 | Longitudinal clinical changes | **Proposed** (Aksh synthetic fragments **Partial**) | Q1 | A |
| 2 | Medication–laboratory relationships | **Proposed** (**Partial** med/lab tools in Aksh) | Q2 | A |
| 3 | Disease→immune mechanism | **Partial** (Ask + engine **Verified**; formal brief **Proposed**) | Q3 | **B / M1** |
| 4 | Immune-cell state ↔ treatment resistance | **Proposed** (cell/treatment edges **Partial**) | Q4 | B/E |
| 5 | Microbiome and disease | **Partial** (thin gut packs) | Q5 | C |
| 6 | Human evidence prioritisation | **Proposed** (grades/Gate C **Partial**/**Verified**) | Q3/Q6 | B |
| 7 | Mechanism→trial discovery | **Proposed** (educational/flag-off **Partial**) | Q8–Q9 | D |
| 8 | Patient–trial criteria assessment | **Proposed** / matcher **Missing** | L5 statuses | D |
| 9 | Missing information | **Proposed** (Ask refuse/gap honesty **Partial**) | Cross-cut | A–D |
| 10 | Scientific contradictions | **Proposed** (no first-class CONTRADICTS) | Q7 | E |
| 11 | Underexplored mechanisms | **Proposed** | Q10 | E |
| 12 | Hypothesis & experiment design | **Proposed** | Domain 6 | E |

---

## Capability 1 — Longitudinal clinical changes (§6.6)

**Question:** “What changed in this patient's health across their last five clinical encounters?”

| Dimension | Spec |
|-----------|------|
| **Required data** | Verified patient context; authorised encounters; conditions; symptoms; labs; medications; procedures; outcomes |
| **Graph entities / paths** | Patient→Encounter→Observation/Condition/Medication* (LHK-G Domain 1); **not** public ISI KG as SoT |
| **Tools** | Authz verify; clinical FHIR read; `temporalQuery`; med/lab compare |
| **Methods** | Select five eligible encounters; retrieve events; sort by event time; detect new conditions/med changes; compare labs; detect missing/conflicts; source-linked chronology |
| **Evidence** | **Cat 1** only for patient assertions |
| **Access** | Clinician + org + purpose; syntheticOnly until live policy |
| **Expected output** | Longitudinal change summary |
| **Failure** | Invented encounters; unavailable = negative finding; unsupported causality |
| **Acceptance** | Synthetic multi-provider gold; provenance coverage baseline; missing-data warnings |
| **LHK-G** | Q1 |
| **Status** | **Proposed** product · **Partial** Aksh synthetic |

---

## Capability 2 — Medication and laboratory relationships (§6.7)

**Question:** “Which medications were introduced before a relevant laboratory change?”

| Dimension | Spec |
|-----------|------|
| **Required data** | Medication events (prescribe/dispense/admin distinguished); labs; optional pharmacology refs |
| **Graph entities / paths** | MedicationEvent→time→Observation; drug concept→MoA (research side optional) |
| **Tools** | Med list/compare; lab trend; `temporalQuery`; optional drug lookup |
| **Methods** | Align temporally; list meds before change; note other influences; **report chronology ≠ causation** |
| **Evidence** | Cat 1 chronology; Cat 2 pharmacology if cited; never upgrade sequence to Cat 2 causality |
| **Access** | Clinical ACL |
| **Expected output** | Medication–laboratory chronology + sources |
| **Failure** | Causal overclaim; conflating prescribe/admin; unit errors |
| **Acceptance** | Gold charts with known order; causal-language violation = fail |
| **LHK-G** | Q2 |
| **Status** | **Proposed** · **Partial** fragments |

---

## Capability 3 — Disease-to-immune-mechanism exploration (§6.8) ★ M1 core

**Question:** “Which immune pathways are associated with this disease phenotype?”

| Dimension | Spec |
|-----------|------|
| **Required data** | Disease/phenotype concepts; ISI relationships; immune cells; cytokines/pathways; supporting studies |
| **Graph entities / paths** | Disease→Pathway/CELL/MOLECULE + EvidenceStatement (Q3); REL-* neighbourhood |
| **Tools** | `resolveEntity`; `traverseNeighbourhood`; `exploreMechanism`; `retrieveEvidence`; Ask `prepareAsk`; citation validate |
| **Methods** | Resolve concepts; traverse; retrieve studies; compare contexts; separate established vs proposed; highlight limits |
| **Evidence** | Cat 2–3 primary; Cat 5 only if labelled hyp; **no patient-active claim** without Cat 1 |
| **Access** | Research/public approved graph; curator for Gate C; **No PHI** |
| **Expected output** | Evidence-grounded immune mechanism map / M1 brief |
| **Failure** | Unresolved entity; empty neighbourhood lied about; fabricated PMIDs; patient causality |
| **Acceptance** | G-Ask/G-Mech; citation precision baseline; unsupported-claim rate; reproducible on graph pin |
| **LHK-G** | Q3 |
| **§5** | Workflow B / product **M1** |
| **Status** | **Partial** (Ask + engine **Verified**; formal brief **Proposed**) |

---

## Capability 4 — Immune-cell states and treatment resistance (§6.9)

**Question:** “What evidence links a specific immune-cell state to treatment resistance?”

| Dimension | Spec |
|-----------|------|
| **Required data** | Cell-state terms; treatment; disease context; studies; responder-group comparisons |
| **Graph entities / paths** | Cell→ASSOCIATED_WITH→Response (+ disease/treatment context) — Q4 |
| **Tools** | Cap 8/9 investigators (**Partial**/Proposed); `compareRelationships`; evidence retrieve |
| **Methods** | Resolve cell-state; retrieve links; compare groups; study design; conflicts; mechanistic vs associative |
| **Evidence** | Prefer Cat 3 until Cat 2 justified; preserve tissue/stage/exposure/method differences |
| **Access** | Research |
| **Expected output** | Treatment-resistance evidence dossier |
| **Failure** | Collapsing study contexts; causal overclaim |
| **Acceptance** | Curator sample; context fields required |
| **LHK-G** | Q4 |
| **Status** | **Proposed** (graph coverage **Partial**) |

---

## Capability 5 — Microbiome and disease (§6.10)

**Question:** “What is known about gut microbiome alterations in this condition?”

| Dimension | Spec |
|-----------|------|
| **Required data** | Disease concept; microbiome studies; taxa/functions/metabolites; host immune/metabolic links |
| **Graph entities / paths** | Taxon→Function→Metabolite→HostPathway (Q5 / Domain 3) |
| **Tools** | Caps 10–11; domain-filtered traverse; confounder checklist |
| **Methods** | Retrieve features; compare populations; confounders; contradictions; association vs mechanism |
| **Evidence** | Cat 3 default; Cat 2 only if mechanism reviewed; **no patient microbiome without Cat 1 measures** |
| **Access** | Research; no individual microbiome PHI |
| **Expected output** | Microbiome evidence profile |
| **Failure** | Patient-specific inference from population assoc; missing confounders |
| **Acceptance** | Confounder fields present; SME review |
| **LHK-G** | Q5 |
| **§5** | Workflow C |
| **Status** | **Partial** thin packs · product depth **Later** |

---

## Capability 6 — Human evidence prioritisation (§6.11)

**Question:** “Which relevant biological findings are supported by human clinical evidence?”

| Dimension | Spec |
|-----------|------|
| **Required data** | Candidate mechanisms; evidence statements; study designs; population characteristics |
| **Graph entities / paths** | Mechanism↔EvidenceStatement; biomarker↔mechanism (Q6) |
| **Tools** | `retrieveEvidence`; grade/status filters; Cap 12–13 |
| **Methods** | Classify designs; separate human vs non-human; limitations; replication; applicability — **do not** auto-rank every human study above every experiment |
| **Evidence** | Category + study-design fields mandatory |
| **Access** | Research |
| **Expected output** | Human-evidence comparison table |
| **Failure** | Blind hierarchy by species alone; missing limitations |
| **Acceptance** | Gold mechanism with mixed evidence labelled correctly |
| **LHK-G** | Q3, Q6 |
| **Status** | **Proposed** (grades/Gate C infrastructure **Partial**/**Verified**) |

---

## Capability 7 — Mechanism-to-trial discovery (§6.12)

**Question:** “Which clinical trials investigate therapies targeting these mechanisms?”

| Dimension | Spec |
|-----------|------|
| **Required data** | Mechanism; targets; interventions; registry trials; eligibility stubs; freshness |
| **Graph entities / paths** | Mechanism→Target←Intervention→Trial (Q8–Q9) |
| **Tools** | `exploreMechanism`; `retrieveTrials`; Cap 17/20 |
| **Methods** | Map mechanism→target→intervention→studies; verify status; explain link |
| **Evidence** | Mechanistic Cat 2–3; registry provenance |
| **Access** | Research/public registry metadata |
| **Expected output** | Mechanism-linked trial list |
| **Failure** | Invented NCT; implying patient suitability |
| **Acceptance** | Golden mechanism→NCT pin date; fabricated ID = 0 |
| **LHK-G** | Q8, Q9 |
| **Status** | **Proposed** · educational **Partial** |
| **Detail** | [`HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md`](./HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md) Path A |

---

## Capability 8 — Patient–trial criteria assessment (§6.13)

**Question:** “Which trial criteria can be assessed from the available patient record?”

| Dimension | Spec |
|-----------|------|
| **Required data** | Structured criteria; min-necessary patient attributes |
| **Graph entities / paths** | Trial→Criterion; patient attrs stay P2 (not copied into ISI KG) |
| **Tools** | Cap 18 matcher (**Missing**); clinical ACL; freshness |
| **Methods** | Per-criterion evaluate → five states; missing/ambiguous flags |
| **Evidence** | Cat 1 attrs + criterion provenance |
| **Access** | Trial team / referring clinician; High tier |
| **Expected output** | Criterion-level assessment — **never confirmed eligibility** |
| **Failure** | Any “confirmed eligible”; PHI over-fetch; stale trial unmarked |
| **Acceptance** | G-Trial: zero confirmed-eligible; unknown/ambiguous used correctly |
| **LHK-G** | Domain 5 statuses |
| **Status** | **Proposed** / **Missing** matcher |
| **Detail** | [`HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md`](./HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md) Path B |

---

## Capability 9 — Missing information (§6.14)

**Question:** “What important information is missing?”

| Dimension | Spec |
|-----------|------|
| **Required data** | Task definition; required attribute checklist; accessible sources |
| **Graph entities / paths** | Task-specific — clinical and/or trial criteria schemas |
| **Tools** | Checklist vs retrieve; Cap 9 cross-cut |
| **Methods** | Distinguish unavailable / not recorded / not applicable; explain why each matters; verification steps |
| **Evidence** | Meta about Cat 1 absence — not a negative Cat 1 fact |
| **Access** | Same as parent task |
| **Expected output** | Task-specific missing-information report |
| **Failure** | Treating missing biomarker as irrelevant when trial-critical; inventing negatives |
| **Acceptance** | Fixture with omitted labs → listed unknowns |
| **LHK-G** | Cross-cutting Q1–Q2/Q9 |
| **Status** | **Proposed** · Ask gap honesty **Partial** |

---

## Capability 10 — Scientific contradictions (§6.15)

**Question:** “Where does the scientific literature disagree?”

| Dimension | Spec |
|-----------|------|
| **Required data** | Claim; supporting + opposing/null studies; populations; methods |
| **Graph entities / paths** | Finding CONTRADICTS Finding (**Missing** first-class) |
| **Tools** | `compareRelationships`; contradiction index (**Proposed**) |
| **Methods** | Compare populations/methods/measurements/confounders; no majority vote |
| **Evidence** | Paired Cat 2–3 |
| **Access** | Research |
| **Expected output** | Evidence contradiction report |
| **Failure** | Silent merge; vote-based “truth” |
| **Acceptance** | Gold pairs; recall after baseline |
| **LHK-G** | Q7 |
| **Status** | **Proposed** |
| **Detail** | [`HSI_RESEARCH_DISCOVERY_WORKFLOW.md`](./HSI_RESEARCH_DISCOVERY_WORKFLOW.md) |

---

## Capability 11 — Underexplored mechanisms (§6.16)

**Question:** “Which biological mechanisms remain underexplored?”

| Dimension | Spec |
|-----------|------|
| **Required data** | Defined corpus; known mechanisms; evidence scope |
| **Graph entities / paths** | CandidateMechanism + evidence scope (Domain 6 / Q10) |
| **Tools** | Gap analytics (**Proposed**) |
| **Methods** | Limited validation; missing population/tissue; **document search limitations** |
| **Evidence** | Gap ≠ Cat 2 absence-of-world |
| **Access** | Research |
| **Expected output** | Prioritised research-gap register |
| **Failure** | “Not in KG” = “not in literature” |
| **Acceptance** | Search-scope note mandatory |
| **LHK-G** | Q10 |
| **Status** | **Proposed** |

---

## Capability 12 — Hypothesis and experiment design (§6.17)

**Question:** “What experiments could investigate a proposed biological relationship?”

| Dimension | Spec |
|-----------|------|
| **Required data** | Hypothesis; supporting + contradictory evidence; assumptions |
| **Graph entities / paths** | Hypothesis lifecycle objects (**Proposed**) |
| **Tools** | `registerHypothesis`; Caps 13–15 |
| **Methods** | Models; outcomes; controls; confounders; validation; falsification; limitations |
| **Evidence** | **Always Cat 5** until expert review; Gate C before promote |
| **Access** | Researcher; no auto-publish |
| **Expected output** | Structured experimental investigation proposal |
| **Failure** | Silent KG write; missing falsification; patient causal language |
| **Acceptance** | Required fields complete; cite fabrications = 0; human review before use |
| **LHK-G** | Domain 6 |
| **Status** | **Proposed** |

---

## Validation priority (after M1)

M1 validates **Cap 3** (Workflow B). Recommended **next** for validation:

1. **Cap 6** — Human evidence prioritisation (deepens M1 honesty)  
2. **Cap 10** — Contradictions (Workflow E foundation)  
3. **Cap 11** — Underexplored mechanisms / gaps (Workflow E + Q10)

Clinical Caps 1–2 and Trials Caps 7–8 wait on Clinical/Trials product foundations.

**Stop.** Demonstrate architecture for all twelve before implementation; founder approval required.
