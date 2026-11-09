# Milestone 7 — Scientific Validation, Benchmarking & Researcher Evaluation

**Brief:** HSI Milestone 7 — rigorous, reproducible, independently reviewable **evaluation infrastructure** for M1–M6 biomedical research intelligence (extend existing eval substrate; **no parallel eval platform**; **no public marketing claims** of scientific validation).  
**Status:** Phase 0 gap audit + PR1 (Scientific Benchmark Registry) — **not** scientific validation complete, **not** M1–M6 scientifically validated, **not** production readiness.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `7777f6ddb42691e583dcfc49a2e508dd911ef10c`  
**Tip commit:** `7777f6d Add M7 Phase 0 matrix and scientific benchmark registry. (#97)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`MILESTONE6_INVESTIGATION_ORCHESTRATION_MATRIX.md`](./MILESTONE6_INVESTIGATION_ORCHESTRATION_MATRIX.md) — M6 Phase 0 + PR1 on `main` (#96); planner/router/workspace deepen open  
- [`MILESTONE8_LIVING_SCIENTIFIC_INTELLIGENCE_MATRIX.md`](./MILESTONE8_LIVING_SCIENTIFIC_INTELLIGENCE_MATRIX.md) — M8 continuous monitoring (orthogonal; do not claim living system complete from M7)  
- [`MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md`](./MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md) — M5 Phase 0 + PR1 on `main` (#95)  
- [`MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md`](./MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md)  
- [`MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md`](./MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md)  
- [`MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md`](./MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md)  
- [`BACKEND_INTEGRATION_MATRIX.md`](./BACKEND_INTEGRATION_MATRIX.md)  
- [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md)  
- [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md) — deterministic ≠ live ≠ scientific  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  
- On-disk eval: `evaluation/independent-evaluation/` · alias `evaluation/scientific_benchmark_v1/` · R2 gold worksheets  

**Out of PR1:** Evidence/biological evaluators (PR2), hypothesis/experiment/translational evaluators (PR3), E2E harness (PR4), reviewer workflow deepen (PR5), researcher pilot (PR6), dashboard UI (PR7), fake expert scores, invented pass thresholds after seeing results, Gate C auto-approve, MoU, PHI/CDS.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `connected` | Implemented and exercised in a current library/product path |
| `partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `fixture-only` | Works only with static fixtures / seeded packs |
| `blocked` | Cannot complete without human/config gate or unfinished prior milestone |
| `missing` | No meaningful implementation for this M7 requirement |
| `unverified` | Shape or stub exists; scientific / live correctness not verified |
| `in-flight` | Open PR not yet on `main` — document honestly |

Honesty freeze: no Gate C auto-approve · no invented MoU · no live CDS/PHI · fixtures ≠ live evidence · CI ≠ scientific validity · **engineering ready ≠ scientifically validated** · LLM judge must not be sole authority for scientific correctness · SME slots stay empty until humans · live suite stays gated · Neon red-wave only · no public marketing claims of scientific validation from this milestone alone.

**Release-gate classifications (labels only — no invented numeric thresholds):**

| Classification | Meaning |
|----------------|---------|
| `engineering_ready` | Core services + operational tests meet defined eng acceptance |
| `scientific_evaluation_pending` | Eng functional; expert scientific assessment incomplete |
| `research_pilot_ready` | Bounded workflow passed agreed safety/provenance/reliability/quality thresholds (**not claimed**) |
| `expanded_research_evaluation_ready` | Evidence supports broader disease/researcher testing (**not claimed**) |
| `not_ready` | Critical scientific or operational failures unresolved |

Current programme classification for M7 PR1: **`scientific_evaluation_pending`** (eng registry scaffold) with overall science **`not_ready`** until #2/#4/#5 and real SME labelling.

---

## Phase 0 — verified M1–M6 capability matrix (post-#96)

| Milestone | Implemented functionality | Live integration | Existing tests | Scientific validation | Limitations | Blockers | Evaluation readiness |
|-----------|---------------------------|------------------|----------------|----------------------|-------------|----------|----------------------|
| **M1** Biomedical evidence | Europe PMC + OT + UniProt metadata + dynamic persistence (`018`); provenance hashes | Live journey `blocked` (#5); passages `blocked` (#2) | Lookup / dynamic retrieval / persistence unit tests | **Not validated** | Metadata ≠ claim support; fixtures ≠ live | #2 · #5 | Eng `partial` · science `blocked` · registry category slots 1–2 |
| **M2** Contextual / contradiction | Structured comparison (#90) + contradiction investigation (#92); opposing search; gap taxonomy | Live oppose path gated | Comparison / contradiction / gap tests | **Not validated** | Empty oppose ≠ consensus; eng labels ≠ SME rank | #4 · #5 | Eng `partial` · science `blocked` · categories 4–6, 12 |
| **M3** Hypothesis / experiment | Registry contracts (#91); multi-hypothesis eval **not** started | N/A for unscored registry | Hypothesis registry tests | **Not validated** | No LLM probabilities; review ≠ validation | #4 · multi-hyp missing | Eng `partial` · science `blocked` · categories 7–8 |
| **M4** Translational / failure | Contracts (#93) + failure-mode taxonomy (#94); Phases 3–8 open | Thin attach only | Translational / taxonomy tests | **Not validated** | Registration ≠ efficacy; labels ≠ causal conclusions | #4 · #5 | Eng `partial` · science `blocked` · category 9 |
| **M5** Precision translational | Phase 0 + precision contracts (#95); Phases 2–9 open | HCA/GEO `not_connected` | Precision contract tests | **Not validated** | No invented performance / patient measurements | #4 · omics connect | Eng `partial` · science `blocked` · category 10 |
| **M6** Investigation orchestration | Capability registry + investigation contracts (#96); planner/router **not** started | Checkpoint staging gated (#5) | Investigation orchestration tests | **Not validated** | Contract ≠ approved scientific plan; resume ≠ auto-approval | #5 · planner missing | Eng `partial` · science `blocked` · category 11 |
| Eval substrate (pre-M7) | Independent suites v1.1 · `scientific_benchmark_v1` alias · R2 empty worksheets · Phase E fixtures | Live suite `GATED_NOT_RUN` | `independentEvaluationSuites` · `scientificBenchmarkV1` tests | **Blocked** (`smeSlotsFilled=0`) | Three suites must not be conflated | #2 · #4 · #5 | Eng scaffold `CLEARED` · science `BLOCKED` |

**Verdict:** Eng substrate is sufficient for M7 **PR1 Scientific Benchmark Registry** (versioned case contracts + 12 category slots + development/held-out partition + release-gate classifications). Do **not** mark M1–M6 scientifically complete from CI green or from this matrix. M1–M6 remain **partial** (eng) / **not scientifically validated**.

**#96 merge:** Squash-merged to `main` at `4e4f9dbbeb4684808c1c66bb886245d3687b1ee2` (CI green: verify + site-deployment + Vercel). Unrelated opens (e.g. #71) skipped.

---

## Existing evaluation substrate (extend — do not fork)

| Area | Files | Working status | M7 relevance |
|------|-------|----------------|--------------|
| Independent suites | `independentEvaluationSuites.ts` · `evaluation/independent-evaluation/` | Eng `CLEARED` · science `BLOCKED` · live gated | Canonical suite — keep alias; no parallel platform |
| scientific_benchmark_v1 alias | `scientificBenchmarkV1.ts` · `evaluation/scientific_benchmark_v1/` | Alias only | **PR1 registry lands under this path** |
| R2 gold worksheets | `evaluation/gold-evaluation-suite/r2/` | Empty SME A/B + adjudication; `frozenHeldOut=false` | Held-out freeze still human-gated (#4) |
| Phase E fixtures | `evaluation/phase-e/` | Eng cases; empty SME labels | Do not invent scores |
| Research readiness bank | `evaluation/research-readiness/` | Draft questions | Draft ≠ gold |
| Scorecard dims (9 null) | Independent scientific suite | `value=null` | Rubric anchors may reference; scoring stays human |
| LLM-as-judge | — | Must **not** be sole scientific authority | PR2+ may assist eng checks only |

---

## Initial benchmark categories (12 M7 slots)

| # | Category id | Task type | SME / expert reference | Evaluation status |
|---|-------------|-----------|------------------------|-------------------|
| 1 | `literature_retrieval` | retrieval | empty / held-out sealed | `scaffold` |
| 2 | `source_grounded_evidence_extraction` | extraction | empty / held-out sealed | `scaffold` |
| 3 | `biological_entity_resolution` | entity_resolution | empty / held-out sealed | `scaffold` |
| 4 | `contextual_mechanism_investigation` | mechanism | empty / held-out sealed | `scaffold` |
| 5 | `contradiction_classification` | contradiction | empty / held-out sealed | `scaffold` |
| 6 | `counterevidence_retrieval` | opposing_retrieval | empty / held-out sealed | `scaffold` |
| 7 | `hypothesis_evaluation` | hypothesis | empty / held-out sealed | `scaffold` |
| 8 | `experiment_discrimination` | experiment | empty / held-out sealed | `scaffold` |
| 9 | `translational_failure_investigation` | translational_failure | empty / held-out sealed | `scaffold` |
| 10 | `biomarker_subgroup_interpretation` | precision | empty / held-out sealed | `scaffold` |
| 11 | `end_to_end_scientific_investigation` | e2e_investigation | empty / held-out sealed | `scaffold` |
| 12 | `abstention_uncertainty_handling` | abstention | empty / held-out sealed | `scaffold` |

Integrity: development cases are separate from held-out cases. Expert reference assessments stay **held-out sealed** (null / not injectable into prompts, retrieval indexes, or model tuning). Benchmark versions + source snapshots recorded on the registry inventory hash.

---

## Milestone 7 phase plan

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit + capability matrix | This document | — | `connected` (audit) | Keep updated as PRs land | this file |
| **1** Scientific Benchmark Registry | Alias + independent suites | `partial` → **PR1 in-flight** | Versioned cases + 12 slots + gates | `scientificBenchmarkRegistry.ts` |
| **2** Evidence + biological reasoning evaluators | Scorecard dims / failure modes | `missing` (scored) | PR2 evaluators without LLM-sole authority | future |
| **3** Hypothesis / experiment / translational evaluators | M3–M5 contracts | `missing` (scored) | Blinded rubrics | future |
| **4** E2E investigation harness | M6 contracts | `missing` | Operational metrics + honest blocked recording | future |
| **5** Independent scientific review deepen | Review validators / Gate C human | `partial` | Dual review + adjudication records | future |
| **6** Researcher evaluation programme | Workflow comparison scaffold | `scaffold` | Pilot cohort + measures | future |
| **7** Internal benchmark dashboard | — | `missing` | Internal only — no marketing claims | later PR |
| **8+** Failure taxonomy / release gates / regression | Human queue honesty | `partial` | Thresholds pre-registered with SMEs | future |

---

## PR1 deliverable (this increment)

**Scientific Benchmark Registry**

- Versioned registry contracts: case ID, domain, disease/context, question, task type, source refs, evidence cutoff, entities, experimental context, ambiguity, answerability, expert reference (held-out sealed), rubric, reviewer assignments, dataset/licence, version, evaluation status.  
- Initial category slots for all 12 M7 categories (structure OK; empty SME/reference OK).  
- Separate development vs held-out partitions; leakage prevention documented and asserted.  
- Wired to existing `evaluation/scientific_benchmark_v1/` alias of `evaluation/independent-evaluation/` — **not** a parallel platform.  
- Release-gate **classifications only** (`engineering_ready` / `scientific_evaluation_pending` / … / `not_ready`) — no invented pass thresholds after seeing results.  
- Neon red-wave; auth/review/provenance intact; no Gate C / MoU / PHI; fixtures ≠ live; LLM judge not sole authority.

**Out of PR1:** PR2 evaluators, dashboard UI, fake expert scores, frozen held-out gold claims, live E2E success claims.

---

## Human blockers (unchanged)

| Item | Status | Blocks for M7 |
|------|--------|---------------|
| #2 Passage / abstract rights | PARKED | Licensed packets; deeper entailment gold |
| #4 SME gold | PARKED | Scorecard scores; held-out freeze; usefulness |
| #5 Live Ask→export journey | PARKED | Timestamped live integration success |
| Numeric acceptance thresholds | Not pre-registered with SMEs | Must not invent after seeing results |

---

## Anti-patterns (binding)

- Do not invent a parallel evaluation platform beside independent-evaluation / scientific_benchmark_v1.  
- Do not claim M1–M6 scientifically validated from eng completion or CI green.  
- Do not invent SME scores, expert references, or pass thresholds after peeking at results.  
- Do not use an LLM judge as the sole authority for scientific correctness.  
- Do not leak held-out expert answers into prompts, indexes, or tuning.  
- Do not auto-approve Gate C, invent MoU, or wire PHI/CDS.  
- Do not put unvalidated performance claims on public marketing pages.  
- Do not merge autumn-snow / Akeno / DeliverX Neon into HSI substrate.
