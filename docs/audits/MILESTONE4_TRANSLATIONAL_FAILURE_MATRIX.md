# Milestone 4 — Translational Failure Intelligence

**Brief:** HSI Milestone 4 — programme / preclinical / human translational / clinical evidence contracts and failure honesty  
**Status:** Phase 0 gap audit + PR1 (Translational Evidence Contracts & Data Integration) — **not** production readiness, **not** scientific validity, **not** M4 complete.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `4056f1c4fa3b9122fc90fe79a0402f60f9b1496b`  
**Tip commit:** `4056f1c Add M3 Phase 0 matrix and hypothesis registry contracts. (#91)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`BACKEND_INTEGRATION_MATRIX.md`](./BACKEND_INTEGRATION_MATRIX.md) — refined-brief vocabulary  
- [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md) — eng Phase 1–8  
- [`DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md`](./DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md) — adapter / Technology status  
- [`MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md`](./MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md) — M2 partial; deepen [#92](https://github.com/gnaneshwer23/hsi-core/pull/92) **open / not merged**  
- [`MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md`](./MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md) — M3 PR1 registry on `main` (#91); multi-hypothesis eval **not** started  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  

**Out of this audit / PR1:** full M4 Phases 2–8, separate translational dashboard, invented proprietary programmes, clinical failure inference from recruitment/termination, Gate C auto-approve, MoU, PHI/CDS, invented SSc live E2E success.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `connected` | Implemented and exercised in a current library/product path |
| `partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `fixture-only` | Works only with static fixtures / seeded packs |
| `blocked` | Cannot complete without human/config gate or unfinished prior milestone |
| `missing` | No meaningful implementation for this M4 requirement |
| `in-flight` | Open PR not yet on `main` — document honestly |

Honesty freeze: no Gate C auto-approve · no invented MoU · no live CDS/PHI · no patient treatment recommendations · fixtures ≠ live · CI ≠ scientific validity · registration ≠ efficacy · termination/recruitment ≠ clinical failure · absence of published evidence ≠ absence of activity · no invented proprietary programmes.

---

## Phase 0 — verify M1 / M2 / M3 status (honest)

| Milestone | On audited `main` | Status | Notes for M4 |
|-----------|-------------------|--------|--------------|
| **M1** retrieval / OT / UniProt / provenance | Europe PMC + OT + UniProt metadata + dynamic persistence | `partial` · live journey `blocked` (#5) · passages `blocked` (#2) | Sufficient substrate for translational identity hooks |
| **M2** contextual / contradiction | Structured comparison (#90) on `main`; deepen [#92](https://github.com/gnaneshwer23/hsi-core/pull/92) **in-flight** | `partial` / `in-flight` | M4 does **not** wait on #92; do not claim M2 complete |
| **M3** hypothesis / experiment | Registry contracts (#91) on `main`; multi-hypothesis eval **not** started | `partial` | M4 PR1 does not implement M3 Phase 2 eval |
| Human #2 / #4 / #5 | PARKED | `blocked` | Blocks live translational E2E success claims |

**Verdict:** Eng substrate is sufficient for M4 **Phase 0 audit + PR1 contracts**. Do **not** mark M1–M4 scientifically complete from CI green.

---

## Substrate inspection (existing modules)

| Area | Files | Working status | M4 relevance |
|------|-------|----------------|--------------|
| Open Targets associations | `openTargetsLookup.ts` | `partial` | Target / disease identity for programme anchors |
| ClinicalTrials.gov | `clinicalTrialsGovLookup.ts` · `translationalEvidenceAttach.ts` | `partial` | Registration / status / results planes; missing ≠ failure already asserted |
| Europe PMC bibliographic | `europePmcBibliographicLookup.ts` · dynamic retrieval | `partial` | Published outcome locators; metadata-only |
| UniProt metadata | `uniprotMetadataLookup.ts` | `partial` | Protein identity resolution |
| Ontology prefixes | `hsiOntologyRegistry.ts` | `partial` | HGNC / UniProt / GO / Reactome / NCT / PMID prefixes; **ChEMBL prefix missing**; live Reactome/ChEMBL fetch `missing` |
| Translational O-04 attach | `translationalEvidenceAttach.ts` | `partial` | Trial-centric; not full programme / preclinical / human-translational contract set |
| Research brief bind | `researchBriefIntegration.ts` | `partial` | Consumes O-04 section; no programme-layer contracts |
| Graph / agents / workbench | domain graph · bounded agent · O-01–06 | `partial` | No dedicated failure-intelligence UI; do not invent dashboard |
| Therapeutic models | P3 adapter proposals (AF3/ESM/…) | `fixture-only` / proposal | Out of PR1 depth |
| Provenance | dynamic persistence `018` | `partial` · staging `blocked` (#5) | Prefer contract projection over new migration |

---

## Milestone 4 capability matrix

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit | This document | — | `connected` (audit) | Keep updated as PRs land | this file |
| **1** Translational evidence contracts + thin identity | O-04 trial attach; OT/EPMC/CT.gov/UniProt lookups; ontology prefixes | `partial` → **PR1** | Programme / preclinical / human-translational / clinical envelopes; unknowns preserved; failure honesty; thin ID resolve; ChEMBL/Reactome **stub ids only** | `translationalEvidenceContracts.ts` (extend attach) |
| **2** Failure-mode taxonomy deepen | Missing-outcome kinds on O-04 | `partial` | Structured translational failure hypotheses without inventing cause | future |
| **3** Cross-source programme join | Intervention↔target token overlap | `partial` | Curated programme identity without proprietary invention | future |
| **4** Agent / brief bind | Brief translational summary | `partial` | Consume PR1 contracts in bounded brief | future thin |
| **5** Workbench surfacing | O-04 planes in outcome panel | `partial` | No separate dashboard | site / outcome |
| **6–8** Live eval / SSc | Fixtures + human queue | `fixture-only` · `blocked` | Checklist only — **no invented live success** | human-queue |

---

## PR1 deliverable (this increment)

**Translational Evidence Contracts & Data Integration**

- Programme / preclinical / human translational / clinical evidence contracts with **unknowns preserved**.  
- Do **not** infer clinical failure from recruitment/termination alone.  
- Do **not** invent proprietary programmes.  
- Thin identity resolution across OT / Europe PMC / CT.gov / UniProt where already present; ChEMBL / Reactome **identifier stubs only** (no live fetch bloat).  
- Absence of published evidence ≠ absence of activity.  
- Review gates intact; no patient-specific treatment recommendations; no Gate C / MoU / PHI inventing.  
- Neon red-wave; **no new migration** unless required (not required). Fixtures ≠ live.

**Out of PR1:** full Phases 2–8, multi-hypothesis M3 eval, separate dashboard.

---

## Human blockers (unchanged)

| Item | Status | Blocks |
|------|--------|--------|
| #2 Passage / abstract rights | PARKED | Passage-backed translational claims |
| #4 SME gold | PARKED | Scored failure-intelligence quality |
| #5 Live Ask→export journey | PARKED | Real-evidence M4 E2E success claim |

---

## Anti-patterns (binding)

- Do not rebuild platform / parallel translational KG / unnecessary new agents.  
- Do not invent proprietary pharma programmes or clinical failure from registry status alone.  
- Do not invent rights clearance, Gate C auto-approve, MoU, PHI/CDS, or production readiness.  
- Do not treat fixtures or CI green as scientific validity or M4 completion.  
- Do not merge autumn-snow / Akeno / DeliverX Neon into HSI substrate.  
- Do not claim absence of published evidence as absence of programme activity.
