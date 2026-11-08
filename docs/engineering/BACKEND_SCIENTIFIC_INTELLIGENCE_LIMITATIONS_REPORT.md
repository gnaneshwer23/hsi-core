# Backend Scientific Intelligence — Limitations Report (PR 8)

**Status:** Engineering scaffold complete for the planned PR 1–8 sequence · **not** production readiness · **not** scientific validity  
**Date:** 2026-11-08  
**Main tip at branch start:** `ba768eedda292bc40380f3fafa33f8d6d070c015` (PR #78 squash merge)  
**Matrix:** [`BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md`](./BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md)  
**Harness:** `bun run eval:independent:prepare` · `bun run eval:independent:check` · gated `bun run eval:independent:live`  
**HSI Neon:** red-wave only — never autumn-snow / Akeno / DeliverX

This report summarises what works today, what is fixture-only, what is blocked on the human queue, and remaining scientific limitations. **CI green is not scientific validation.**

---

## 1. Three evaluation suites (do not conflate)

| Suite | Purpose | Release evidence | Current status |
|-------|---------|------------------|----------------|
| **Deterministic regression** | Schema, permissions, state transitions, failure handling | Reproducible CI results | **ENGINEERING_CLEARED** — contracts runnable offline |
| **Live integration** | Real provider queries, persistence, brief generation | Timestamped runs + source records | **GATED_NOT_RUN** until `HSI_LIVE_INTEGRATION_EVAL=1` |
| **Scientific evaluation** | Context, claim support, contradictions, usefulness | Blinded expert review slots | **AWAITING_SME** — slots empty (`smeSlotsFilled=0`) |

Honesty freeze: deterministic pass ≠ live success ≠ scientific acceptance. Live suite must never fake success when gated off. SME gold slots must never be filled with invented ratings.

---

## 2. What works (engineering)

Connected or partial library paths from PRs 1–7, exercised by deterministic contracts:

- Bibliographic / Open Targets / CT.gov lookup libraries with typed failure taxonomy (`provider_unavailable` ≠ empty hits).
- Dynamic retrieval + candidate persistence + identity-link axes (record / study / independence).
- Contextual candidates + opposing-evidence search + gap taxonomy (coverage ≠ novelty).
- Bounded agent durable traces and research-brief / release-aware product bind.
- Translational O-04 attach (registration ≠ efficacy; missing results ≠ failure).
- Fail-closed `assessReleaseClaim` and authenticated scientific review validators (no Gate C auto-approve).
- R2 gold worksheets + N6 usefulness packets remain empty by contract.

Deterministic PR 8 additions:

- Explicit scorecard **fields** (null values) for citation correctness, citation→statement support, biological context, contradiction retrieval, gap-assessment precision, abstention quality, unsupported-claim, brief completeness, expert-rated usefulness.
- Orthogonal **failure-mode contracts**: real source identity · statement support · species/tissue/context match · overall conclusion justified.
- Unpinned representative walkthrough questions across autoimmune / inflammatory / translational / fibrosis / gut–immune–metabolic / contradiction / gap / abstention that do **not** embed living-evidence or SSC fixture PMIDs/NCTs/MONDO pins.
- Researcher-workflow comparison scaffold: same questions, comparable information access; **quality and time budgets recorded separately** (slots empty).
- Named path `evaluation/scientific_benchmark_v1/` is an **alias** of `evaluation/independent-evaluation/` — not a parallel evaluation platform. Science remains BLOCKED (`smeSlotsFilled=0`; `liveSuccessClaimed=false`).

---

## 3. What is fixture-only

| Area | Why fixture-only |
|------|------------------|
| Living-evidence expansion offline replay | Captured Europe PMC / OT / CT.gov bodies for pinned PMIDs/NCTs/diseases |
| Research workspace test fixture | Synthetic investigation labelled `synthetic-test-fixture` |
| R1 / R3 / R2 offline receipts | Eng deepen manifests; draft bank ≠ gold |
| Phase E scientific-evaluation engineering fixtures | Categories exist; SME labels remain empty |
| N6 blinded usefulness packets | Empty score rows; usefulness deltas forced null |
| PR 8 scientific scorecard values | Placeholders only (`value=null`, `labelledDenominator=0`) |

Fixtures must stay banner-labelled and must not be presented as live scientific evidence.

---

## 4. Blocked on human queue

| Queue | Residual | Blocks |
|-------|----------|--------|
| **#2** | Passage / abstract reuse rights | Licensed full-text import; deeper semantic entailment; R1 packet gold binding |
| **#4** | SME dual labels + adjudication (+ R2 / N3 / N6) | Scientific scorecard scores; usefulness ratings; frozen held-out gold |
| **#5** | Live authenticated Ask→Retrieve→…→Export journey | Timestamped live integration success; opsAcceptance |
| **#8** | Founder MoU | `legalBinding` / partner lock — never invent |

See [`HUMAN_QUEUE_RESIDUALS.md`](./HUMAN_QUEUE_RESIDUALS.md).

---

## 5. Remaining scientific limitations

1. **No measured scientific performance.** Citation correctness, support, context accuracy, contradiction retrieval, gap precision, abstention quality, and usefulness remain unscored until independent SMEs.
2. **Metadata ≠ claim support.** Bibliographic / association metadata does not establish that a citation supports a statement.
3. **Open Targets Europe PMC–derived literature ≠ independent corroboration** of the same finding without separate study identity.
4. **Registration ≠ efficacy; missing registry results ≠ therapy failure.**
5. **Incomplete literature coverage ≠ verified novelty.**
6. **Provider unavailable must never be reported as “no evidence found.”**
7. **Draft / candidate graph relationships stay `graphPromotable=false`** until authenticated review + fail-closed release assessment.
8. **No live CDS/PHI, no patient eligibility inference, no Gate C auto-approve, no invented MoU.**
9. **Production readiness is not claimed** without live E2E verification on red-wave with human-cleared rights and SME review.
10. **Researcher-workflow time/quality comparison is scaffold only** — no recorded budgets or quality scores yet.

---

## 6. Live walkthrough hooks (gated)

Env: `HSI_LIVE_INTEGRATION_EVAL=1` (or `true`). CI must not set this flag.

| Hook | Stage | Default without gate |
|------|-------|----------------------|
| `provider_query` | Real provider queries for unpinned questions | `skipped_gate` |
| `persist_metadata` | Candidate-store persistence (write-gated, red-wave) | `skipped_gate` |
| `research_brief` | Source-linked brief generation | `skipped_gate` |

When the gate is open without supplied timestamped outcomes, stages report `failed_honest` — never silent success. `liveSuccessClaimed` stays `false` in the sealed scaffold.

---

## 7. Planned sequence closure

PRs **1–8** of the Backend Scientific Intelligence enhancement are the **planned engineering delivery sequence**. Next progress is **human-gated** (live walkthrough with #5, SME review with #4, rights with #2) — not more architecture layers.

---

## Verify

```sh
bun run eval:independent:prepare
bun run eval:independent:check
bun --no-env-file test test/independentEvaluationSuites.test.ts
# Optional live (manual only — reports honestly; does not invent success):
# HSI_LIVE_INTEGRATION_EVAL=1 bun run eval:independent:live
```

Expected: `engineeringScaffold=CLEARED`, `scientificAcceptance=BLOCKED`, `liveJourneyAcceptance=BLOCKED`, `smeSlotsFilled=0`, `liveSuccessClaimed=false`, `productionReadinessClaimed=false`.
