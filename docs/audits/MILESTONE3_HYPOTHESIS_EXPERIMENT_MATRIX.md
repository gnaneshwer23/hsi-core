# Milestone 3 — Hypothesis Evaluation & Experiment Decision Intelligence

**Brief:** HSI Milestone 3 — hypothesis registry, evidence contracts, experiment decision intelligence  
**Status:** Phase 0 gap audit + PR1 (Hypothesis Registry & Evidence Contracts) — **not** production readiness, **not** scientific validity, **not** M3 complete.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `4145422278b3c052b8aafb8cf0def5ec419bff63`  
**Tip commit:** `4145422 Document Backend SI brief status against shipped Phases 1–7. (#89)`  
**HSI Neon:** red-wave only (`human super intelligence` / `hsi-neon-project` / `ep-hsi-production…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md`](./MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md) — M2 Phase 3 on `main` (#90); deepen [#92](https://github.com/gnaneshwer23/hsi-core/pull/92) may be in-flight — treat M2 remainder as partial  
- [`MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md`](./MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md) — M4 Phase 0–2 on `main` (#93 / #94); still partial  
- [`MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md`](./MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md) — M5 Phase 0 + PR1 (orthogonal; do not contradict)  
- [`BACKEND_INTEGRATION_MATRIX.md`](./BACKEND_INTEGRATION_MATRIX.md) · [`DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md`](./DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md)  
- [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md)  
- [`../engineering/N7_EXPERIMENT_LEDGER_STATUS.md`](../engineering/N7_EXPERIMENT_LEDGER_STATUS.md) · [`../engineering/N2_EVIDENCE_LEDGER_STATUS.md`](../engineering/N2_EVIDENCE_LEDGER_STATUS.md)  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `connected` | Implemented and exercised in a current library/product path |
| `partial` | Meaningful path exists; required contracts, live wiring, or honesty gates incomplete |
| `fixture-only` | Works only with static fixtures / seeded packs |
| `blocked` | Cannot complete without human/config gate or unfinished prior milestone |
| `missing` | No meaningful implementation for this M3 requirement |
| `in-flight` | Open PR not yet on `main` — document honestly; do not claim shipped |

Honesty freeze: no Gate C auto-approve · no invented MoU · no live CDS/PHI · no patient eligibility · fixtures ≠ live / wet-lab · CI ≠ scientific validity · review approval ≠ experimental validation · no LLM-as-probability / fabricated confidence.

---

## Phase 0 — substrate inspection (M1 + M2 + ledgers)

| Substrate | Files | Status | M3 relevance |
|-----------|-------|--------|--------------|
| Dynamic retrieval (EPMC / OT / UniProt) | `dynamicEvidenceRetrieval.ts` · lookups | `partial` | Evidence refs for hypothesis contracts |
| Provenance persistence | `dynamicEvidencePersistence.ts` · `018` | `partial` · staging `blocked` (#5) | Candidate source ids |
| Contextual candidates | `contextualCandidateRelationships.ts` | `partial` | Context axes for experiment planning later |
| Structured evidence comparison (M2) | `structuredEvidenceComparison.ts` | `in-flight` (#90) · absent on audited `main` | Contradiction → hypothesis falsifiers (blocked until merge) |
| Oppose / gap | `opposingEvidenceSearch.ts` · `gapVerification.ts` | `partial` | Competing hypotheses / gap kinds |
| Bounded agent | `boundedAgentExecution.ts` | `partial` | Hypothesis stage exists conceptually; registry not first-class |
| Evidence ledger (N2) | `evidenceLedger.ts` · `016` | `partial` / `fixture-only` programme | Assertion kinds include `hypothesis` / `prediction` — **extend, don’t fork** |
| Experiment ledger (N7) | `experimentLedger.ts` · `017` · Neon store | `partial` eng · real observation `blocked` | Prediction freeze → outcome; review_candidate ≠ graph |
| Investigation persistence | `004_hsi_research_investigations.sql` · `investigationService.ts` | `partial` · live `blocked` (#5) | Thin `investigationId` hooks |
| Graph / review / workbench | LHKG · scientific review · O-01–06 | `partial` | O-05 action plan later; Phase 8–9 checklist only |
| Neon migrations | `001`–`018` red-wave | `connected` (schema) | **No new migration for PR1** — registry is contract layer over existing ids |

**M2 remainder (blocks deeper M3 contradiction→hypothesis wiring):** pairwise comparison not on `main` until #90 merges; workbench O-02 bind and multi-evidence sets still open; live contradiction quality `#4`/`#5` PARKED.

**M1/M2 verdict for M3 PR1:** Sufficient to land a **Hypothesis Registry & Evidence Contracts** layer over N2/N7 without waiting for #90 merge. Do **not** claim M2 or M3 scientifically complete.

---

## Milestone 3 capability matrix

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit | This document | — | `connected` (audit) | Keep updated as PRs land | this file |
| **1** Hypothesis registry + evidence contracts | N2 `hypothesis` assertion kind; N7 prediction freeze | `partial` → **PR1** | Lifecycle states, review≠experiment, evidence/investigation/experiment links, no fabricated confidence | `hypothesisRegistry.ts` (new) |
| **2** Multi-hypothesis evaluation | Gap/oppose + agent stages | `partial` / `missing` as registry consumer | Rank/compare hypotheses without LLM probability | future |
| **3** Falsifier / decision contracts | N7 falsifier on prediction; interrogative falsification | `partial` | Structured accept/reject experiment decisions | future |
| **4** Experiment planning bind | N7 protocol bind | `partial` · wet-lab `blocked` | Decision intelligence without inventing outcomes | future |
| **5** Outcome honesty deepen | N7 outcome classes | `partial` eng · real data `blocked` | Authorised observations only | N7 residuals |
| **6** Agent hypothesis stage | `hypothesis_generator` contract role | `partial` (manifest only) | Registry-backed create; no silent approve | agent contracts |
| **7** Workbench hooks | O-05 research action plan | `partial` | Thin registry surfacing | site / outcome |
| **8–9** SSc / live validation | Fixtures + human queue | `fixture-only` · `blocked` | Checklist/blocker only — **no invented live success** | human-queue |

---

## PR1 deliverable (this increment)

**Hypothesis Registry & Evidence Contracts**

- Closed hypothesis lifecycle: `proposed` → `under_review` → `review_approved` | `review_rejected` → `queued_for_experiment` → `experiment_linked` → `superseded` | `withdrawn` (plus explicit refusal to treat review as experimental validation).  
- Evidence contracts: links to N2 ledger record ids, optional investigation id, optional N7 experiment record ids, optional dynamic candidate / comparison ids when present.  
- `reviewApprovalStatus` orthogonal to `experimentalValidationStatus`.  
- `confidence`: `not_assessed` only; `numericConfidence: null` — no LLM-as-probability.  
- Extends N2/N7 honesty; **no Neon migration** (ids are references; persistence can reuse offline JSON / future store).  

**Out of PR1:** multi-hypothesis ranking, experiment decision engine, workbench UI redesign, wet-lab outcomes, M2 #90 merge, Gate C/MoU/CDS.

---

## Human blockers (unchanged)

| Item | Status | Blocks for M3 |
|------|--------|---------------|
| #2 Rights | PARKED | Passage-grounded hypothesis entailment |
| #4 SME gold | PARKED | Scored hypothesis/experiment usefulness |
| #5 Live journey | PARKED | Real investigation→hypothesis→experiment E2E |
| M2 #90 merge | OPEN | Contradiction traces feeding falsifiers |
| N7 real observation | BLOCKED | Non-fixture experimental validation |

---

## Anti-patterns (binding)

- Do not rebuild platform / parallel KG / unnecessary agents.  
- Do not invent experiment outcomes, partner lab data, or confidence scores.  
- Do not collapse review approval into experimental validation.  
- Do not claim M2/M3 complete from CI green or fixtures.  
- Red-wave Neon only; no autumn-snow / Akeno / DeliverX.
