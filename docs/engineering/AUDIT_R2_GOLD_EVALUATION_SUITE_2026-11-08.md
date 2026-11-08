# Audit R2 — Gold Evaluation Suite (eng deepen)

**Date:** 2026-11-08  
**Source:** *HSI End-to-End Architecture and Roadmap* phase **R2** (Gold Evaluation Suite)  
**HSI substrate Neon:** red-wave only  
**Honesty:** draft bank ≠ gold · `smeGoldFilled=false` · `frozenHeldOut=false` · `independentlyLabelledCases=0` · no invented SME labels / adjudications / scientificAccuracy · `autoApprove=false` · **not CDS** · no MoU · no autumn-snow for HSI · **do not claim R2 science CLEARED**

## Pre-check: user constraint

Human queue residuals stay **parked** for this phase — especially **#4 SMEs** and **#2 N1 rights**, plus #3 cite HITL, #5 staging, #8 MoU. R2 delivers eng-safe deepen toward exit shape (versioned manifest · empty worksheets · unfilled splits · blocked metric placeholders) only.

## Verdict

| Plane | State |
|-------|--------|
| Engineering suite contract + worksheets + harness | **ENG CLEARED** |
| SME A/B labels + adjudication | **PENDING_HUMAN** (empty worksheets) |
| Rights-cleared packet binding | **BLOCKED** (`r1PacketsBoundToGold=0`) |
| Frozen held-out split + baseline scores | **NO_GO** (`frozenHeldOut=false`; null metrics) |
| Scientific acceptance | **BLOCKED** |
| Invented labels / MoU / Gate C / CDS-PHI | **Forbidden** (unchanged) |

This receipt is **not** SME gold, frozen-split authority, baseline scientific scores, Gate C clearance, or production partner lock.

## Delivered (engineering)

| Piece | Location |
|-------|----------|
| Manifest types + fail-closed parse | `src/evidence/r2GoldEvaluationSuite.ts` |
| On-disk suite manifest | `evaluation/gold-evaluation-suite/r2/suite-manifest.v1.json` |
| Empty SME A/B + adjudication worksheets | `evaluation/gold-evaluation-suite/r2/worksheets/` |
| Study-grouped split slots | `evaluation/gold-evaluation-suite/r2/splits/study-grouped.slots.json` |
| Baseline metric placeholders | `evaluation/gold-evaluation-suite/r2/metrics/baseline-placeholders.v1.json` |
| Status pin | `evaluation/gold-evaluation-suite/r2/STATUS.json` |
| Operator checklist | [`R2_GOLD_EVALUATION_SUITE_CHECKLIST.md`](./R2_GOLD_EVALUATION_SUITE_CHECKLIST.md) |
| Gold v1 + draft bank binding | `evaluation/gold-evaluation-suite/v1/` · `questions.draft.json` |
| Harness | `bun run r2:prepare` · `bun run r2:check` |
| Tests | `test/r2GoldEvaluationSuite.test.ts` |

## Measured counts (this tip)

| Metric | Value |
|--------|------:|
| Engineering checks CLEARED | 9 / 9 |
| Human checks PENDING / NO_GO / BLOCKED | 6 / 6 |
| Draft cases bound | **50** |
| SME A labelled | **0** |
| SME B labelled | **0** |
| Adjudicated cases | **0** |
| Independently labelled cases | **0** |
| Study IDs assigned | **0** |
| Baseline metrics scored | **0** |
| R1 packets bound to gold | **0** |
| `smeGoldFilled` | **false** |
| `frozenHeldOut` | **false** |
| `scientificAcceptance` | **BLOCKED** |
| `rightsAcceptance` | **BLOCKED** |

## Exit shape (§ R2) — scaffolding only

Documented steps through baseline metrics on frozen inputs. **Current step:** `draft_50_question_bank`. SME gold / held-out freeze remain **false**.

## Explicit non-goals

- Filling SME expert labels or adjudications
- Inventing scientificAccuracy / baseline scores
- Treating the 50-question draft bank as gold
- Freezing held-out splits without packets + labels
- Fixing human #2 N1 rights or #4 SME recruitment
- Gate C / cite auto-approve
- Live CDS / PHI
- Invented MoU / `legalBinding=true`
- Pointing HSI at autumn-snow

## Next

1. **Parked:** human #4 SME dual annotation + adjudication; #2 rights before packet binding.  
2. **Later:** freeze study-grouped held-out + score baselines on identical frozen inputs.  
3. Do **not** merge scientific acceptance from this eng deepen.

## Verify

```sh
bun run r2:prepare
bun run r2:check
bun run gold:check
bun run r1:check
bun --no-env-file test test/r2GoldEvaluationSuite.test.ts
```
