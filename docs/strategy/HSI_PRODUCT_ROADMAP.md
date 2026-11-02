# HSI Product Roadmap

**Style:** Dependency-based phases — no unsupported production-readiness dates.  
**Default sequence after founder approval:** Phase 0 (done) → Phase 1 → Phase 2 (Workflow A) → then B/C per D5.

---

## Phase 0 — Vision and Repository Recovery

| | |
|--|--|
| **Objective** | Audit repos; define vision, architecture, gaps; founder decisions |
| **User value** | Stops misaligned builds; honesty for partners |
| **Dependencies** | None |
| **Reusable** | All three repos as-is |
| **Implementation** | `docs/strategy/*` only — **no feature code** |
| **Data** | None new |
| **Risks** | Vision/name conflict unresolved (D1/D2) |
| **Validation** | Founder review of exec summary + decisions |
| **Acceptance** | Ten strategy docs + exec summary published |
| **Deliverables** | This directory |

---

## Phase 1 — Shared Graph Foundation

| | |
|--|--|
| **Objective** | Logical Layers 1–6 taxonomy; map ISI KG + hsi-core packs; provenance/claimType norms |
| **User value** | Researchers see coherent evidence model; engineers share schema |
| **Dependencies** | Phase 0; D3 preserve ISI KG |
| **Reusable** | `kg.json`, hsi-core packs/exports, Gate C |
| **Implementation** | Schema docs + optional metadata fields; exporter alignment; automated no-PHI checks |
| **Data** | Existing packs/KG only |
| **Risks** | Over-engineering graph DB too early |
| **Validation** | Schema review by scientific lead; CI honesty tests |
| **Acceptance** | Layer map published; ISI inventory; ADR retain kg.json; red-wave isolation tests green |
| **Deliverables** | Shared schema package draft; KG inventory; ADR |

---

## Phase 2 — Scientific Discovery Intelligence (Workflow A)

| | |
|--|--|
| **Objective** | Reproducible research brief: question → graph → evidence → gaps |
| **User value** | Researchers get grounded briefs with claim labels |
| **Dependencies** | Phase 1; ISI Ask/Atlas; Gate C |
| **Reusable** | Ask grounding, KG, hsi consume, cite Check |
| **Implementation** | Brief artifact format; contradiction/gap tooling; finish human cite for Gate C rows; no PHI |
| **Data** | Public + governed evidence only |
| **Risks** | LLM overclaim; naming collision Discovery vs Ask |
| **Validation** | Golden-question eval set; curator spot checks |
| **Acceptance** | N golden questions produce briefs with provenance + claimTypes; cite path progresses without inventing supports |
| **Deliverables** | Workflow A MVP on ISI + hsi-core |

---

## Phase 3 — Clinical Longitudinal Intelligence (Workflow B)

| | |
|--|--|
| **Objective** | Multi-provider **synthetic/authorised** timeline + missing-data warnings |
| **User value** | Clinicians see coherent context with provenance (test env) |
| **Dependencies** | D2/D5; Aksh BRIDGE lessons; IAM/DPIA |
| **Reusable** | Aksh spine/HITL; FHIR staging patterns |
| **Implementation** | HSI Clinical service + synthetic FHIR fixtures; **no** fake live hospitals |
| **Data** | Synthetic or properly authorised only |
| **Risks** | Scope creep into real EHR; safety case lag |
| **Validation** | Clinical SME review of timeline correctness on fixtures |
| **Acceptance** | Demo on synthetic multi-provider patient; provenance + missing-info; zero PHI in research DBs |
| **Deliverables** | Workflow B test harness + UX skeleton |

---

## Phase 4 — Clinical Trials Intelligence (Workflow C)

| | |
|--|--|
| **Objective** | Explainable trial retrieval + criterion state machine |
| **User value** | Trial teams get reviewable screening packets |
| **Dependencies** | Phase 1–2 disease context; registry access |
| **Reusable** | ISI TrialIntelligence fragments |
| **Implementation** | Registry cache; eligibility evaluator; UI states; human final |
| **Data** | Public registries + structured test profiles |
| **Risks** | Overstating match; stale recruitment status |
| **Validation** | Gold criteria charts; forbid “confirmed eligible” copy |
| **Acceptance** | Screening report with five criterion states; provenance timestamps |
| **Deliverables** | HSI Trials MVP (narrow indication) |

---

## Phase 5 — Aksh–HSI Integration

| | |
|--|--|
| **Objective** | Secure APIs: validated Aksh outputs ↔ HSI research/clinical link-outs |
| **User value** | Patient intelligence feeds ecosystem without duplication |
| **Dependencies** | D4; Phase 2; clinical governance for any P2 data |
| **Reusable** | CONDUCTOR, HITL, SHIELD, agent directory |
| **Implementation** | Gateway, scopes, de-id rules; **no** agent rewrite in hsi-core |
| **Data** | Scoped clinical summaries only as approved |
| **Risks** | PHI leakage; dual Atlas naming confusion |
| **Validation** | Penetration + DPIA; contract tests |
| **Acceptance** | Documented OpenAPI; red-team no PHI in research logs |
| **Deliverables** | Integration Gateway v0 |

---

## Phase 6 — Clinical and Research Evaluation

| | |
|--|--|
| **Objective** | Supervised evals with scientific/clinical partners |
| **User value** | Credible evidence of utility and safety |
| **Dependencies** | Real partner lock (not fixture); Phases 2–5 as scoped |
| **Reusable** | Gate C, HITL metrics |
| **Implementation** | Protocols, hazard logs, eval harnesses |
| **Data** | Partner-governed |
| **Risks** | Premature regulatory claims |
| **Validation** | External SME; safety board |
| **Acceptance** | Written eval report; updated honesty labels; no MHRA claim unless classified/cleared |
| **Deliverables** | Evaluation pack + governance updates |

---

## Explicit deferrals

- Universal hospital record access marketing.  
- Replacing ISI KG.  
- Duplicating Aksh agents in hsi-core.  
- Graph DB rip-and-replace.  
- DeliverX / swift-deliveries (out of scope).
