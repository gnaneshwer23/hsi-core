# Backend Scientific Intelligence Brief — Status

**Brief:** HSI — Backend Scientific Intelligence Enhancement (Phases 1–7 + 10 acceptance criteria)  
**Status:** Engineering delivery for this brief is **complete on `main`** · **not** production readiness · **not** scientific validity  
**Date:** 2026-11-09  
**Audited `main` SHA:** `13bfa91ea8be156ec9affc2220a5d6ca5466b1af`  
**Tip commit:** `13bfa91 Add Data-to-Discovery audit matrix and Technology connection map (#87)`  
**HSI Neon:** red-wave only (`human super intelligence` / `hsi-neon-project`) — never autumn-snow / Akeno / DeliverX  

**Explicit:** CI green ≠ scientific validity. Production readiness is **not** claimed. Live E2E and human queue #2 / #4 / #5 remain PARKED. Rights are **not** CLEARED.

**Source matrices (do not contradict):**

| Matrix | Role |
|--------|------|
| [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md) | Phase-1 eng baseline + PR 1–8 execution evidence |
| [`BACKEND_INTEGRATION_MATRIX.md`](./BACKEND_INTEGRATION_MATRIX.md) | Refined-brief gap audit (#83–#86 hardening) |
| [`DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md`](./DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md) | Adjacent Data-to-Discovery brief (not this brief) |
| [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md) | PR 8 limitations + suite separation |
| [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) | #2 / #4 / #5 PARKED |

**Out of scope for this status:** open UniProt adapter [#88](https://github.com/gnaneshwer23/hsi-core/pull/88) (Data-to-Discovery follow-on — leave alone); landing redesign #71; Gate C / MoU / CDS-PHI invention.

---

## Phase rollup (original brief Phases 1–7)

Original brief phases map to shipped eng PRs (delivery sequence also included a Phase-7 Evaluation close as PR **#79**). Status vocabulary: **done** (eng for this phase shipped on `main`) · **partial** (library/product bind exists; live journey or science incomplete) · **blocked** (human/ops gate) · **missing** (no wired path).

| Phase | Brief intent | Eng PR(s) | Code anchors | Status | Notes |
|-------|--------------|-----------|--------------|--------|-------|
| **1 — Audit and integration** | File-level matrix; preserve auth / provenance / review / privacy | [#72](https://github.com/gnaneshwer23/hsi-core/pull/72) | `docs/engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md` · `test/backendScientificIntelligencePhase1Acceptance.test.ts` | **done** | Baseline SHA then `4452e14`; gates encoded |
| **2 — Dynamic evidence retrieval** | Unpinned queries; fail taxonomy; metadata-only; persist permitted metadata | [#73](https://github.com/gnaneshwer23/hsi-core/pull/73) · [#74](https://github.com/gnaneshwer23/hsi-core/pull/74) · refine [#83](https://github.com/gnaneshwer23/hsi-core/pull/83)/[#84](https://github.com/gnaneshwer23/hsi-core/pull/84) | `dynamicEvidenceRetrieval.ts` · `europePmcBibliographicLookup.ts` · `openTargetsLookup.ts` · `dynamicEvidencePersistence.ts` · migration `018` | **done** (eng) · live persist **blocked** (#5) | Provider fail ≠ empty; cursorMark + OT score honesty on `main` |
| **3 — Context-aware biological graph** | Contextual candidates; draft≠approved; no auto-promote | [#75](https://github.com/gnaneshwer23/hsi-core/pull/75) · [#86](https://github.com/gnaneshwer23/hsi-core/pull/86) | `contextualCandidateRelationships.ts` · `releaseAwareRetrieval.ts` · `projectCandidateRelationshipRecord` | **done** (eng) · deeper oppose **blocked** (#2) | `graphPromotable: false`; relationship envelopes |
| **4 — Scientific agent execution** | Bounded plan→…→brief with durable traces | [#76](https://github.com/gnaneshwer23/hsi-core/pull/76) · [#85](https://github.com/gnaneshwer23/hsi-core/pull/85) | `boundedAgentExecution.ts` · orchestrator / checkpoints · `projectInvestigationExecutionRecord` | **done** (eng) · journey **blocked** (#5) | Cancel/retry/idempotency; untrusted retrieved text |
| **5 — Research-gap verification** | Gap taxonomy; coverage≠novelty; no silent verify | [#77](https://github.com/gnaneshwer23/hsi-core/pull/77) · [#70](https://github.com/gnaneshwer23/hsi-core/pull/70) · [#86](https://github.com/gnaneshwer23/hsi-core/pull/86) | `gapVerification.ts` · `opposingEvidenceSearch.ts` · `projectGapAssessmentRecord` | **done** (eng) · science **blocked** (#4) | `verification_status=not_verified` until SME |
| **6 — Translational intelligence** | CT.gov / OT planes; registration≠efficacy | [#78](https://github.com/gnaneshwer23/hsi-core/pull/78) | `translationalEvidenceAttach.ts` · `researchOutcome` trials · ResearchOutcomePanel §04 | **done** (eng) · optional live attach | No eligibility / efficacy inference |
| **7 — Evaluation** | Independent suites; SME usefulness; researcher-workflow compare | [#79](https://github.com/gnaneshwer23/hsi-core/pull/79) · [#85](https://github.com/gnaneshwer23/hsi-core/pull/85) | `independentEvaluationSuites.ts` · `evaluation/independent-evaluation/` · `evaluation/scientific_benchmark_v1/` alias · limitations report | **done** (eng scaffold) · scientific **blocked** (#4) · live **blocked** (#5) | `engineeringScaffold=CLEARED`; `scientificAcceptance=BLOCKED`; `smeSlotsFilled=0` |

**Follow-ons after this brief (not required to close Phases 1–7):** refined brief #83–#86 · Data-to-Discovery #87 · UniProt metadata adapter #88 (OPEN at audit — not part of this brief’s eng close).

---

## Acceptance criteria checklist (10)

Engineering vs science/ops are separated. “Met (eng)” means the code path and honesty contracts exist on audited `main`; it does **not** mean live scientific acceptance.

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| **AC1** | Researcher can submit a new scientific question without modifying pinned source identifiers | **Met (eng)** · live journey **blocked** (#5) | `dynamicEvidenceRetrieval.ts`; unpinned walkthrough questions in independent eval; PR [#73](https://github.com/gnaneshwer23/hsi-core/pull/73)/[#79](https://github.com/gnaneshwer23/hsi-core/pull/79) |
| **AC2** | Backend retrieves genuine source metadata and reports failures honestly | **Met (eng)** | Fail taxonomy in `europePmcBibliographicLookup` / `openTargetsLookup`; `provider_unavailable` ≠ empty; tests in `dynamicEvidenceRetrieval.test.ts`; PR [#73](https://github.com/gnaneshwer23/hsi-core/pull/73)/[#84](https://github.com/gnaneshwer23/hsi-core/pull/84) |
| **AC3** | Retrieved findings preserve provenance and biological context | **Met (eng)** · passages **blocked** (#2) | Persistence identity links + contextual axes; `dynamicEvidencePersistence.ts` · `contextualCandidateRelationships.ts`; PR [#74](https://github.com/gnaneshwer23/hsi-core/pull/74)/[#75](https://github.com/gnaneshwer23/hsi-core/pull/75)/[#86](https://github.com/gnaneshwer23/hsi-core/pull/86) |
| **AC4** | Research agents produce traceable intermediate results | **Met (eng)** | `boundedAgentExecution` durable stage artifacts + execution-record projection; PR [#76](https://github.com/gnaneshwer23/hsi-core/pull/76)/[#85](https://github.com/gnaneshwer23/hsi-core/pull/85) |
| **AC5** | Scientific review gates remain intact | **Met (eng)** · live decision path **blocked** (#5) | `validateScientificReview` · authenticated review store · no Gate C auto-approve; Phase-1 acceptance tests; PR [#72](https://github.com/gnaneshwer23/hsi-core/pull/72) |
| **AC6** | Evidence-grounded research brief with explicit limitations | **Met (eng)** · usefulness unscored (#4) | `researchBriefIntegration.ts` (`scientificValidityClaimed: false`); PR [#78](https://github.com/gnaneshwer23/hsi-core/pull/78) |
| **AC7** | Existing tests and research APIs remain functional | **Met (eng)** | Sequence PRs kept research API / outcome panel paths; `eval:independent:check` + repo `check` on merge receipts |
| **AC8** | No fixture represented as live scientific evidence | **Met (eng)** | Synthetic fixture banners; living-evidence offline labelled; honesty regressions; PR [#72](https://github.com/gnaneshwer23/hsi-core/pull/72)/[#79](https://github.com/gnaneshwer23/hsi-core/pull/79) |
| **AC9** | No unreviewed scientific claim silently approved | **Met (eng)** | `graphPromotable: false`; fail-closed `assessReleaseClaim`; gap `not_verified`; PR [#75](https://github.com/gnaneshwer23/hsi-core/pull/75)–[#77](https://github.com/gnaneshwer23/hsi-core/pull/77) |
| **AC10** | Production readiness not claimed without live E2E | **Met (honesty)** · readiness **blocked** | Limitations report + `STATUS.json`: `productionReadinessClaimed=false`; live suite `GATED_NOT_RUN`; human #5 PARKED |

---

## Human blockers (unchanged)

| Queue | Status | Blocks |
|-------|--------|--------|
| **#2** Passage / abstract reuse rights | PARKED · not CLEARED | Licensed passages; deeper semantic entailment |
| **#4** SME dual labels + adjudication | PARKED · `smeSlotsFilled=0` | Scientific scorecard / usefulness / gold freeze |
| **#5** Live authenticated Ask→…→Export | PARKED · `liveSuccessClaimed=false` | Timestamped live integration; opsAcceptance |

See [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) and [`../engineering/N1_ATTESTATION_HUMAN_CHECKLIST.md`](../engineering/N1_ATTESTATION_HUMAN_CHECKLIST.md).

---

## Eng completeness verdict

**For this exact Backend Scientific Intelligence Enhancement brief: eng is effectively complete on `main` pending human #2 / #4 / #5 and live E2E.**

- Phases 1–7 (plus delivery PR 8 evaluation close) shipped as **#72–#79**, with honesty hardenings **#83–#86**.
- No remaining small honesty/vertical-slice eng gap for *this* brief that is not already covered by open **#88** (out of scope) or human-gated.
- Do **not** restart Phase 1 audit, rebuild adapters, invent MoU / Gate C / PHI, or claim scientific validity from CI.

**Recommended next human actions (order):**

1. Attest rights via N1 checklist (#2).  
2. Review/merge UniProt metadata adapter [#88](https://github.com/gnaneshwer23/hsi-core/pull/88) if CI green (orthogonal to this brief).  
3. Run live authenticated E2E / gated `HSI_LIVE_INTEGRATION_EVAL` when staging Auth is ready (#5) — report honestly; never invent success.  
4. Recruit SME dual labels (#4) before any scientific-acceptance claim.

---

## Verify (read-only honesty)

```sh
bun --no-env-file test test/backendScientificIntelligencePhase1Acceptance.test.ts
bun run eval:independent:check
bun run human-queue:check
```

Expected: Phase-1 gates pass; `scientificAcceptance=BLOCKED`; `liveSuccessClaimed=false`; `productionReadinessClaimed=false`; human residual counters unchanged.
