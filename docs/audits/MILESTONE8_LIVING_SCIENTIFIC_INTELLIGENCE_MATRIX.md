# Milestone 8 — Living Scientific Intelligence & Continuous Discovery

**Brief:** HSI Milestone 8 — extend existing adapters, evidence ledger, graph governance, M6 investigation contracts, and M7 eval into **incremental / continuous monitoring** of scientific sources (no Kafka, no new graph DB, no separate event platform, no new agent framework unless scale is measured — it is not).  
**Status:** Phase 0 gap audit + PR1 (Incremental Evidence Monitoring) — **not** a living system complete, **not** continuous discovery validated as science, **not** production readiness.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `7777f6ddb42691e583dcfc49a2e508dd911ef10c`  
**Tip commit:** `7777f6d Add M7 Phase 0 matrix and scientific benchmark registry. (#97)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`MILESTONE7_SCIENTIFIC_EVALUATION_MATRIX.md`](./MILESTONE7_SCIENTIFIC_EVALUATION_MATRIX.md) — M7 Phase 0 + PR1 registry on `main` (#97); evaluators / dashboard open  
- [`MILESTONE6_INVESTIGATION_ORCHESTRATION_MATRIX.md`](./MILESTONE6_INVESTIGATION_ORCHESTRATION_MATRIX.md) — M6 Phase 0 + PR1 on `main` (#96); planner/router deepen open  
- [`MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md`](./MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md)  
- [`MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md`](./MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md)  
- [`MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md`](./MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md)  
- [`MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md`](./MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md)  
- [`BACKEND_INTEGRATION_MATRIX.md`](./BACKEND_INTEGRATION_MATRIX.md)  
- [`DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md`](./DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md)  
- [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md)  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  

**Out of PR1:** Full change-detection pipeline (PR2), notifications UI, claiming living system complete, Kafka / event bus, new graph DB, new agent framework, Gate C auto-approve, MoU, PHI/CDS, inventing continuous discoveries as validated science, auto-promoting unreviewed evidence into approved graph facts.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `operational` | Implemented and exercised on a current library/product path with honest gates |
| `partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `missing` | No meaningful implementation for this M8 requirement |
| `blocked` | Cannot complete without human/config gate or unfinished prior milestone |
| `fixture-only` | Works only with static fixtures / seeded packs |
| `unverified` | Shape or stub exists; scientific / live correctness not verified |
| `in-flight` | Open PR not yet on `main` — document honestly |

Honesty freeze: no Gate C auto-approve · no invented MoU · no live CDS/PHI · fixtures ≠ live evidence · CI ≠ scientific validity · **unreviewed evidence must NOT auto-become approved graph facts** · continuous monitoring ≠ validated discovery · Neon red-wave only · no Kafka / new graph DB / separate event platform / new agent framework at current scale.

---

## Phase 0 — M1–M7 dependency status (post-#97)

| Milestone | On audited `main` | Status | Continuous-monitoring readiness |
|-----------|-------------------|--------|---------------------------------|
| **M1** Biomedical evidence | Europe PMC + OT + UniProt metadata + dynamic persistence (`018`); living-evidence metadata expand; CT.gov lookup | `partial` · live journey `blocked` (#5) · passages `blocked` (#2) | **Operational hooks present** for incremental cursors / rate limits / duplicate keys on bibliographic + OT + UniProt + CT.gov; Reactome live fetch `missing` (stub ids only) |
| **M2** Contextual / contradiction | Structured comparison (#90) + contradiction investigation (#92) | `partial` | Change signals may later feed comparison; **not** auto-verdicts |
| **M3** Hypothesis / experiment | Registry contracts (#91); multi-hypothesis eval `missing` | `partial` | Subscriptions may reference hypothesis / investigation ids; eval stays M7 |
| **M4** Translational / failure | Contracts (#93) + failure taxonomy (#94) | `partial` | Trial / programme freshness can subscribe; registration ≠ efficacy |
| **M5** Precision translational | Precision contracts (#95); HCA/GEO `not_connected` | `partial` | Disease / gene / target / biomarker topic kinds ok; omics streams `missing` |
| **M6** Investigation orchestration | Capability registry + investigation contracts (#96); planner/router `missing` | `partial` | **Saved-investigation** topic kind binds to M6 contract ids; resume ≠ auto-approval |
| **M7** Scientific evaluation | Phase 0 + benchmark registry (#97); scored evaluators `missing` | `partial` · science `blocked` | Monitoring runs stay eng artefacts; do **not** claim scientific validation from scheduled checks |
| Human #2 / #4 / #5 | PARKED | `blocked` | Blocks live continuous E2E success and scored gold claims |

**Verdict:** Eng substrate is sufficient for M8 **PR1 Incremental Evidence Monitoring** (subscription contracts + cursors + bounded schedules + duplicate/freshness/availability honesty + fail-closed scheduled-check stub). Do **not** mark living scientific intelligence complete from CI green. M1–M7 remain **partial** (eng) / **not scientifically validated**.

**#97 merge:** Squash-merged to `main` at `7777f6ddb42691e583dcfc49a2e508dd911ef10c` (CI green: verify + site-deployment + Vercel). Unrelated opens (e.g. #71) skipped.

---

## Continuous monitoring readiness (substrate)

| Area | Files | Working status | M8 relevance |
|------|-------|----------------|--------------|
| Dynamic retrieval + EPMC cursors | `dynamicEvidenceRetrieval.ts` · `europePmcBibliographicLookup.ts` | `partial` · live `#5` | Reuse cursorMark / rate limits / budgets — do not full-DB scrape |
| Open Targets associations | `openTargetsLookup.ts` | `partial` | Disease / target subscription refreshes; score ≠ causation |
| ClinicalTrials.gov | `clinicalTrialsGovLookup.ts` · `n5RegistryLiveRefresh.ts` | `partial` | Trial topic refreshes; eligibility stay false |
| UniProt metadata | `uniprotMetadataLookup.ts` | `partial` | Gene / protein identity refresh; metadata-only |
| Living-evidence expand | `livingEvidenceExpansion.ts` | `partial` · fixture/live-gated | Pin-set metadata refresh — precursor, not continuous scheduler |
| Evidence ledger | `evidenceLedger.ts` · Neon N2 | `partial` | Review states remain; **no auto-approve from monitoring** |
| Graph governance | living health KG · ontology registry | `partial` | Candidates stay `graphPromotable: false` until human review |
| M6 investigation contracts | `investigationOrchestrationContracts.ts` | `partial` (#96) | Saved-investigation subscriptions project onto contract freshness |
| M7 benchmark registry | `scientificBenchmarkRegistry.ts` | `partial` (#97) | Orthogonal eval; monitoring ≠ scored validation |
| Reactome / GO live fetch | ontology prefixes + translational stubs | `missing` (live) | Pathway **topic** ids allowed; **no** Reactome live adapter in PR1 |
| Job / schedule runner | living-evidence / n5 scripts | `partial` (manual scripts) | Prefer contract + fail-closed stub over inventing Kafka |
| Change detection / versioning | — | `missing` | **PR2** |
| Notifications UI | — | `missing` | Later |

**Persistence decision (PR1):** Prefer **contract projection** (subscription + cursor + run receipt JSON) over a new Neon table / event bus. Existing dynamic persistence (`018`), living-evidence receipts, and investigation JSON remain authoritative. A backwards-compatible migration is deferred until a product write path needs first-class monitoring columns. Prefer Neon-backed durable processing / existing job patterns when wiring later — **not** a separate event platform.

---

## Milestone 8 capability matrix (phases)

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit + dependency matrix | This document | — | `operational` (audit) | Keep updated as PRs land | this file |
| **1** Incremental evidence monitoring | Dynamic retrieve · living expand · CT.gov · UniProt · M6 contracts | `partial` → **PR1 in-flight** (this branch) | Topic subscriptions · cursors · schedules · dedupe · freshness · availability · fail-closed stub | `src/evidence/incrementalEvidenceMonitoring.ts` · `scripts/incremental-evidence-monitoring.ts` · `test/incrementalEvidenceMonitoring.test.ts` |
| **2** Scientific change detection + versioning | Living expand candidates · ledger versions | `missing` | Diff / version envelopes without auto-graph promote | future PR2 |
| **3** Review-candidate queue deepen | N1 queue · ledger review states | `partial` | Route monitoring hits into human review only | future |
| **4** Investigation freshness bind | M6 freshness fields | `partial` | Deeper workspace surfacing | future |
| **5** Eval / regression of monitors | M7 registry | `missing` | Eng metrics only until SME gates | future |
| **6+** Notifications / ops UI | — | `missing` | No claim living complete | later |

---

## PR1 deliverable (this increment)

**Incremental Evidence Monitoring**

- Research-topic subscription contracts: disease / gene / pathway / target / trial / saved investigation.  
- Incremental retrieval cursors; bounded schedules; rate limits; retry honesty.  
- Duplicate detection hooks; freshness tracking; source availability reporting.  
- Bounded budgets — **no** full-DB scrape.  
- Thin wire to dynamic retrieval + M6 investigation orchestration contracts.  
- Scheduled check = contract + runner stub; fail-closed offline / gated live with honest status.  
- Reactome: topic ids via existing stub recognition only — **no** new live Reactome adapter.  
- Unreviewed monitoring hits stay non-promotable / non-approved.  
- Neon red-wave; auth/review/provenance intact; no Gate C / MoU / PHI; fixtures ≠ live; no invented continuous discoveries as validated science.

**Out of PR1:** PR2 change-detection pipeline, notifications UI, living-system-complete claims, Kafka / new graph DB / new agent framework.

---

## Human blockers (unchanged)

| Item | Status | Blocks for M8 |
|------|--------|---------------|
| #2 Passage / abstract rights | PARKED | Passage-level continuous ingest |
| #4 SME gold | PARKED | Scored scientific acceptance of monitor outputs |
| #5 Live Ask→export journey | PARKED | Timestamped live continuous E2E success |
| Scale measurement for event platform | Not measured | Kafka / separate bus remains **out of scope** |

---

## Anti-patterns (binding)

- Do not invent Kafka, a new graph DB, a separate event platform, or a new agent framework at unmeasured scale.  
- Do not auto-promote unreviewed monitoring hits into approved graph facts.  
- Do not claim continuous discoveries are scientifically validated from eng stubs or CI green.  
- Do not full-scrape provider databases; keep bounded budgets and cursors.  
- Do not add live Reactome/GO adapters under the guise of “pathway subscriptions” when only stubs exist.  
- Do not auto-approve Gate C, invent MoU, or wire PHI/CDS.  
- Do not merge autumn-snow / Akeno / DeliverX Neon into HSI substrate.
