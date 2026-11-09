# Milestone 2 — Contextual Biological Reasoning & Contradiction Intelligence

**Brief:** HSI Milestone 2 — structured evidence comparison, biological context, contradiction intelligence  
**Status:** Phase 0 + Phase 3 structured comparison on `main` (#90) + **Phases 4–6 deepen in-flight** (contradiction investigation) — **not** production readiness, **not** scientific validity, **not** M2 complete.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `4056f1c4fa3b9122fc90fe79a0402f60f9b1496b`  
**Tip commit:** `4056f1c Add M3 Phase 0 matrix and hypothesis registry contracts. (#91)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`BACKEND_INTEGRATION_MATRIX.md`](./BACKEND_INTEGRATION_MATRIX.md) — refined-brief status vocabulary  
- [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md) — eng Phase 1–8 execution evidence  
- [`DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md`](./DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md) — Data-to-Discovery adapter / Technology status  
- [`MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md`](./MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md) · [`MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md`](./MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md)  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md) — no live CDS/PHI  

**Out of this audit PR:** full M2 Phases 1–8, Reactome/GO adapters, Gate C auto-approve, MoU invention, invented SSc live E2E success.

---

## Status vocabulary (this matrix)

| Status | Meaning |
|--------|---------|
| `connected` | Implemented and exercised in a current library/product path |
| `partial` | Meaningful path exists; required context depth, live wiring, or honesty gates incomplete |
| `fixture-only` | Works only with static fixtures, seeded packs, or hardcoded IDs |
| `blocked` | Cannot complete without human/config gate (#2/#4/#5 or equivalent) |
| `missing` | No meaningful implementation for this M2 requirement |

Maps from Backend SI / Data-to-Discovery: `connected` ↔ `integrated` / `connected`; `partial` ↔ `partially_connected` / `partially implemented`; `fixture-only` ↔ `fixture_only`; `blocked` / `missing` unchanged.

Honesty freeze: no Gate C auto-approve · no invented MoU / `legalBinding` · no live CDS/PHI · no patient eligibility · fixtures ≠ live evidence · CI green ≠ scientific validity · Open Targets score ≠ causation · association ≠ contradiction proof.

---

## Phase 0 — Milestone 1 readiness (verify before M2 build)

| M1 dependency | Files | Working status | Notes for M2 |
|---------------|-------|----------------|--------------|
| Dynamic Europe PMC retrieval | `src/evidence/europePmcBibliographicLookup.ts` · `dynamicEvidenceRetrieval.ts` | `partial` | Metadata-only; cursorMark shipped (#83); live network-dependent; passage import `blocked` (#2) |
| Open Targets associations | `src/evidence/openTargetsLookup.ts` | `partial` | Score honesty non-causal (#84); not mechanism proof |
| UniProt metadata adapter | `src/evidence/uniprotMetadataLookup.ts` | `partial` | Metadata-only (#88); fixtures ≠ live |
| Provenance persistence / dedup | `src/evidence/dynamicEvidencePersistence.ts` · migration `018` | `partial` | Draft candidates; staging writes `blocked` (#5) |
| Ontology / identity registry | `src/hsiOntologyRegistry.ts` · living health KG | `partial` | Prefixes connected; Reactome/GO/ChEMBL **live fetch** still missing (D2D) |
| Contextual candidate relationships | `src/evidence/contextualCandidateRelationships.ts` | `partial` | Biological context axes + polarity; draft-only; no auto-promote |
| Opposing-evidence search | `src/evidence/opposingEvidenceSearch.ts` | `partial` | Bounded metadata oppose pass; title-signal polarity; incomplete ≠ consensus |
| Gap verification taxonomy | `src/evidence/gapVerification.ts` | `partial` | Includes `contradictory_findings`; coverage ≠ novelty; expert before verified |
| Bounded agent vertical | `src/evidence/boundedAgentExecution.ts` | `partial` | Stages wire retrieve → oppose → gap → brief; live journey `blocked` (#5) |
| Claim / scientific review gates | `src/scientificReview.ts` · grades axes | `connected` (validators) · journey `blocked` (#5) | Axes stay orthogonal |
| Site contradiction helpers | `site/src/features/science/contradictionEngine.ts` | `partial` | Graph edge conflict candidates; not full M2 comparison service |
| Disease-pair comparison (SSc/RA) | `src/sscRaEvidenceComparison.ts` | `partial` / `fixture-only` | Disease-scoped graph compare; not general structured outcomes |
| Research workbench 01–06 | `src/researchOutcome.ts` · site decision-workbench | `partial` | O-02 “Evidence comparison” UI exists; structured outcomes not yet first-class |
| Independent / scientific eval | `independentEvaluationSuites.ts` · `scientificBenchmarkV1.ts` | `partial` eng · science `blocked` (#4) | Empty SME slots |
| CDS/PHI boundary | `src/cdsPhiBoundary.ts` | `connected` | Refuse live PHI |

**M1 verdict for M2 start:** Eng substrate for retrieval, context packs, oppose/gap, and bounded agents is **sufficient to extend**. Live scientific E2E and scored contradiction quality remain **human-blocked** (#2 rights, #4 SME, #5 journey). Do **not** mark Milestone 1 or 2 scientifically complete from CI green alone.

---

## Milestone 2 capability matrix

| Phase | Capability | Existing implementation | Status | Missing for M2 | Primary files |
|-------|------------|-------------------------|--------|----------------|---------------|
| **1** Biological context model | `CandidateBiologicalContext` on contextual candidates; brief context projection | `partial` | Deeper assay/study-design fill; curator-declared context still sparse | `contextualCandidateRelationships.ts` |
| **2** Contradiction / oppose intelligence | Oppose search + gap `contradictory_findings` + site `contradictionEngine` | `partial` | Live passage adjudication (#2/#4) | `opposingEvidenceSearch.ts` · `gapVerification.ts` · `contradictionEngine.ts` |
| **3** Structured evidence comparison | Pairwise outcome taxonomy (#90 on `main`) | `partial` | Workbench multi-evidence sets; live E2E | `structuredEvidenceComparison.ts` |
| **4** Context-aware retrieval ranking + contradiction flow | Dynamic retrieve + **this deepen:** candidate×oppose compare → investigation categories | `partial` | Context-weighted ranking beyond entity clarify | `dynamicEvidenceRetrieval.ts` · `opposingEvidenceSearch.ts` · `structuredEvidenceComparison.ts` |
| **5** Agent contradiction stage deepen | Bounded agent oppose/gap consume structured comparison | `partial` → deepen PR | Full multi-hypothesis eval is M3 | `boundedAgentExecution.ts` |
| **6** Provenance of comparison decisions | Gap assessment + oppose limitations persist investigation category lines | `partial` → deepen PR | Dedicated Neon table not required | gap projectors · oppose receipt |
| **7** Workbench UI (O-02) | Outcome panel + thin contradictionInvestigation option on research outcome | `partial` | Richer O-02 UI bind | `researchOutcome.ts` |
| **8** SSc Tfh / IL-21 eval | Fixtures + workbench probes | `fixture-only` · live `blocked` | Human #2/#4/#5; checklist only — no invented success | human-queue · SSc checklists |

---

## Highest-leverage first eng slice (landed #90)

**Structured evidence comparison service (Phase 3 core)** — on `main`.

## Next eng slice (this deepen PR)

**Wire structured comparison → opposing evidence / gap assessment (Phases 4–6 focused)**

1. Potential contradiction flow retrieves comparable records, compares context, records **investigation categories** (not predetermined conclusions).  
2. Counterevidence / uncertainty: explanations **not** verified by LLM rationale alone; explicit `insufficient_evidence`.  
3. Persist via existing oppose receipt limitations + gap assessment `contradictions` / investigation category lines — no new Neon migration.  
4. Bounded agent oppose/gap stages + thin `researchOutcome` O-02 option bind.  
5. Review state intact; no auto-approve graph edges.

**Out of this PR:** full M3 multi-hypothesis eval, Phase 7 UI redesign, Phase 8 invented live SSc success, Reactome/GO adapters, Neon migrations.

---

## Human blockers (unchanged)

| Item | Status | Blocks |
|------|--------|--------|
| #2 Passage / abstract rights | PARKED / awaiting principal | Passage-level semantic contradiction |
| #4 SME gold + adjudication | PARKED | Scored contradiction / comparison quality |
| #5 Live Ask→export journey | PARKED | Real-evidence M2 E2E success claim |

---

## Anti-patterns (binding)

- Do not rebuild platform / parallel KG / unnecessary new agents.  
- Do not invent rights clearance, Gate C auto-approve, MoU, PHI/CDS, or production readiness.  
- Do not treat fixtures or CI green as scientific validity or M2 completion.  
- Do not merge autumn-snow / Akeno / DeliverX Neon into HSI substrate.  
- Do not upgrade Open Targets association scores into causal or contradiction proof.
