# N3 scientific benchmark status

**Phase:** N3 — Establish the scientific benchmark  
**Plan:** [`docs/strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md`](../strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md)  
**Date:** 7 November 2026

This is an engineering status receipt. It is **not** scientific approval, claim entailment, Gate C clearance or a measured expert benchmark.

## N1 / N2 prerequisite status

| Prerequisite | Status | Notes |
| --- | --- | --- |
| N1 offline queue + adapters + identity fail-closed | **Present (local uncommitted)** | [`N1_SOURCE_VERIFICATION_STATUS.md`](./N1_SOURCE_VERIFICATION_STATUS.md) |
| N1 live scientific acceptance | **BLOCKED** | Rights uncleared (DOI↔title identity for C-02/C-03 human-corrected 2026-11-08) |
| N2 assertion kinds + offline ledger fixture | **Present (local uncommitted)** | [`N2_EVIDENCE_LEDGER_STATUS.md`](./N2_EVIDENCE_LEDGER_STATUS.md) |
| N2 scientific entailment / Neon write path | **BLOCKED / residual** | Enough for N3 to link optional `ledgerRecordId` pointers |
| N3 engineering may proceed | **Yes** | Plan: engineering can precede people; scientific acceptance waits on reviewers |

N3 does **not** clobber N1/N2 artifacts. Identity-blocked candidates stay excluded from scored partitions (none currently after N1 DOI correction).

## Verdict

| Gate | Status | Notes |
| --- | --- | --- |
| Annotation guideline + empty label packet | **CLEARED (engineering)** | `research/domain-graph/n3/annotation-guideline-v1.md` |
| Calibration scaffold (~20–50) | **CLEARED (engineering)** | 24 unlabelled calibration items (12 N1 families × 2 tasks after DOI correction) |
| Study-family split manifest | **CLEARED (engineering)** | Fail-closed leakage checks; held-out empty |
| Replayable evaluation runner | **CLEARED (engineering)** | Incomplete labels → explicit `humanLabelFreeze: BLOCKED` |
| Human label freeze | **BLOCKED** | Zero expert labels; none invented |
| Scientific acceptance | **BLOCKED** | Requires real reviewers, adjudication and freeze |
| Pilot 100–200 labelled items | **Not started** | Plan only — [`N3_PILOT_SCALE_PLAN.md`](./N3_PILOT_SCALE_PLAN.md) |

## Delivered in this increment

- Types / validators / freeze gate / eval receipt: `src/evidence/scientificBenchmark.ts`
- Runner: `bun run n3:benchmark` · `bun run n3:check` · `bun run n3:eval`
- Kit + empty labels + split + offline receipt: `research/domain-graph/n3/`
- Guideline: `research/domain-graph/n3/annotation-guideline-v1.md`
- Pilot scale plan: `docs/engineering/N3_PILOT_SCALE_PLAN.md`
- Tests: `test/scientificBenchmark.test.ts`

Extends existing Phase E (`src/scientificEvaluation.ts`) and Phase 6 (`src/contextAnnotationBenchmark.ts`) honesty patterns (empty labels, partition separation, no fabricated SME authority).

## Honesty constraints retained

- No fabricated frozen scientific labels or agreement scores
- Incomplete labels produce an explicit **BLOCKED** result — never a silent pass
- Study families cannot leak across calibration / pilot / held-out
- N1 mismatches remain excluded; failed lookups ≠ benchmark evidence
- No Gate C auto-approve, invented MoU, live CDS/PHI or immunecity Neon use

## Verify locally

```sh
bun run n3:benchmark
bun run n3:check
bun run n3:eval
bun --no-env-file test test/scientificBenchmark.test.ts
```

## Residual (human)

1. Recruit qualified independent reviewers (not supplied by this tip).
2. Calibrate on the 20 scaffolds; record disagreement / insufficient context.
3. Clear N1 rights and DOI mismatches before minting scored pilot rows.
4. Grow to 100–200 pilot items with study-family freeze **before** labelling held-out.
5. Adjudicate → set label packet `frozen_human_labels` and split `freezeDate`.
6. Only then claim scientific benchmark readiness for N4/N6 measurement.
