# Milestone 5 — Precision Translational Intelligence

**Brief:** HSI Milestone 5 — disease phenotype / molecular-cellular / candidate subgroup / biomarker evidence contracts with dataset-discovery honesty  
**Status:** Phase 0 gap audit + PR1 (Precision Evidence Contracts and Source Integration) — **not** production readiness, **not** scientific validity, **not** M5 complete.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `868431cabf2120504c1a8ffbefb7bca036ddf5b4`  
**Tip commit:** `868431c Add M4 Phase 2 translational failure-mode investigation taxonomy. (#94)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md`](./MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md) — M2 partial; structured comparison + contradiction on `main` (#90 / #92)  
- [`MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md`](./MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md) — M3 PR1 registry on `main` (#91); multi-hypothesis eval **not** started  
- [`MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md`](./MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md) — M4 Phase 0–2 on `main` (#93 / #94); Phases 3–8 open; M4 **not** scientifically complete  
- [`BACKEND_INTEGRATION_MATRIX.md`](./BACKEND_INTEGRATION_MATRIX.md) — refined-brief vocabulary  
- [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md) — eng Phase 1–8  
- [`DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md`](./DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md) — HCA / CELLxGENE / GEO still `missing` / deferred  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  

**Out of PR1:** Phases 2–9, subgroup investigation engine, separate precision dashboard, live HCA/CELLxGENE/GEO fetch, Gate C auto-approve, MoU, PHI/CDS, invented biomarker performance or patient measurements.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `connected` | Implemented and exercised in a current library/product path |
| `partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `fixture-only` | Works only with static fixtures / seeded packs |
| `blocked` | Cannot complete without human/config gate or unfinished prior milestone |
| `missing` | No meaningful implementation for this M5 requirement |
| `unverified` | Shape or stub exists; scientific / live correctness not verified |
| `in-flight` | Open PR not yet on `main` — document honestly |

Honesty freeze: no Gate C auto-approve · no invented MoU · no live CDS/PHI · no patient-facing treatment recommendations / individualised medical advice · fixtures ≠ live · CI ≠ scientific validity · metadata retrieval ≠ analysed dataset · never invent patient measurements or biomarker performance · registration ≠ efficacy · candidate subgroup ≠ clinical strata proof.

---

## Phase 0 — verify M1–M4 status (honest, post-#94)

| Milestone | On audited `main` | Status | Notes for M5 |
|-----------|-------------------|--------|--------------|
| **M1** retrieval / OT / UniProt / provenance | Europe PMC + OT + UniProt metadata + dynamic persistence | `partial` · live journey `blocked` (#5) · passages `blocked` (#2) | Sufficient for phenotype / target / protein identity hooks |
| **M2** contextual / contradiction | Structured comparison (#90) + contradiction investigation (#92) | `partial` | Subgroup / biomarker contradiction deepen stays later; do not claim M2 complete |
| **M3** hypothesis / experiment | Registry contracts (#91); multi-hypothesis eval **not** started | `partial` | Precision contracts may reference hypothesis ids later; Phase 2+ M3 eval out of PR1 |
| **M4** translational / failure | Contracts (#93) + failure-mode taxonomy (#94) on `main`; Phases 3–8 open | `partial` | Human-biomarker unknown on M4 contracts; M5 adds precision shapes without inventing performance |
| Human #2 / #4 / #5 | PARKED | `blocked` | Blocks live precision E2E success and scored gold claims |

**Verdict:** Eng substrate is sufficient for M5 **PR1 precision evidence contracts**. Do **not** mark M1–M5 scientifically complete from CI green. M4 remains **partial** after #93/#94 (taxonomy + contracts only).

---

## Substrate inspection (existing modules)

| Area | Files | Working status | M5 relevance |
|------|-------|----------------|--------------|
| Open Targets associations | `openTargetsLookup.ts` | `partial` | Disease / target anchors for phenotype + molecular profile |
| ClinicalTrials.gov | `clinicalTrialsGovLookup.ts` · `translationalEvidenceAttach.ts` | `partial` | Registry locators; not subgroup proof |
| Europe PMC bibliographic | `europePmcBibliographicLookup.ts` · dynamic retrieval | `partial` | Literature locators for biomarker / phenotype citations |
| UniProt metadata | `uniprotMetadataLookup.ts` | `partial` | Protein identity for molecular profile |
| Translational contracts | `translationalEvidenceContracts.ts` | `partial` (#93) | `human_biomarker` unknown preserved — extend, don’t fork |
| Failure taxonomy | `translationalFailureTaxonomy.ts` | `partial` (#94) | `patient_heterogeneity` investigation label only |
| Hypothesis registry | `hypothesisRegistry.ts` | `partial` (#91) | Optional future link; not required for PR1 |
| Structured comparison | `structuredEvidenceComparison.ts` | `partial` | Later subgroup investigation (PR2+) |
| Research brief bind | `researchBriefIntegration.ts` | `partial` | Thin M5 pack bind in PR1 |
| HCA / CELLxGENE / GEO | — | `missing` / `not_connected` | Honest stubs only in PR1 — no live fetch |
| Graph / agents / workbench | domain graph · O-01–06 | `partial` | No separate precision dashboard |
| Provenance | dynamic persistence `018` | `partial` · staging `blocked` (#5) | Prefer contract projection over new migration |

---

## Milestone 5 capability matrix

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit | This document | — | `connected` (audit) | Keep updated as PRs land | this file |
| **1** Precision evidence contracts + thin source integration | M4 translational + OT/EPMC/CT.gov/UniProt | `partial` → **PR1 in-flight** | Phenotype / molecular-cellular / candidate subgroup / biomarker shapes; unknowns; discovery≠analysis; HCA/CELLxGENE/GEO not connected | `precisionEvidenceContracts.ts` |
| **2** Subgroup investigation | M2 comparison + M4 heterogeneity label | `missing` / `partial` hooks | Structured candidate-subgroup investigation without inventing strata | future PR2 |
| **3** Biomarker evidence deepen | Literature + OT target hooks | `missing` | Performance metrics only when curator-supplied + reviewed — never invented | future |
| **4** Omics dataset bind | D2D HCA/CELLxGENE/GEO | `missing` · stub in PR1 | Live metadata adapters still deferred | D2D |
| **5** Agent / brief deepen | Brief precision summary | `partial` (PR1 thin bind) | Deeper bounded-agent consume | future thin |
| **6** Workbench surfacing | O-04 / outcome panels | `partial` | No separate dashboard | site / outcome |
| **7–9** Live eval / SSc | Fixtures + human queue | `fixture-only` · `blocked` | Checklist only — **no invented live success** | human-queue |

---

## PR1 deliverable (this increment)

**Precision Evidence Contracts and Source Integration**

- Closed evidence layers: `disease_phenotype` · `molecular_cellular_profile` · `candidate_subgroup` · `biomarker_evidence`.  
- Unknowns preserved; never invent patient measurements or biomarker performance (sensitivity/specificity/AUC/PPV/NPV).  
- No patient-facing treatment recommendations / individualised medical advice.  
- Dataset lifecycle: `not_connected` | `metadata_discovered` | `metadata_retrieved` | `analysis_not_performed` — metadata retrieval ≠ analysed.  
- Thin wire from existing Europe PMC / Open Targets / UniProt / CT.gov / translational contract packs.  
- HCA / CELLxGENE / GEO: honest `not_connected` (optional thinnest identifier stub only).  
- Review gates intact; Neon red-wave; no Gate C / MoU / PHI inventing; fixtures ≠ live.  

**Out of PR1:** Phases 2–9, subgroup investigation engine, live omics adapters, separate dashboard.

---

## Human blockers (unchanged)

| Item | Status | Blocks for M5 |
|------|--------|---------------|
| #2 Passage / abstract rights | PARKED | Passage-backed biomarker / phenotype entailment |
| #4 SME gold | PARKED | Scored precision-intelligence usefulness |
| #5 Live Ask→export journey | PARKED | Real-evidence M5 E2E success claim |
| HCA / CELLxGENE / GEO adapters | DEFERRED (D2D) | Live single-cell / GEO dataset retrieval |

---

## Anti-patterns (binding)

- Do not rebuild platform / parallel precision KG / unnecessary new agents.  
- Do not invent patient measurements, biomarker performance, or clinical strata.  
- Do not treat metadata discovery as completed analysis.  
- Do not give patient-facing treatment recommendations or individualised medical advice.  
- Do not invent rights clearance, Gate C auto-approve, MoU, PHI/CDS, or production readiness.  
- Do not treat fixtures or CI green as scientific validity or M5 completion.  
- Do not merge autumn-snow / Akeno / DeliverX Neon into HSI substrate.  
- Do not claim HCA / CELLxGENE / GEO connected until a governed adapter exists.
