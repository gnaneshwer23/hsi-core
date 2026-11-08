# N3 calibration freeze checklist (20–50)

**Phase:** production-readiness audit next-build **#4**  
**Programme:** gut–immune–T2D  
**Artifact:** `research/domain-graph/n3/freeze-prep.v1.json`  
**Honesty:** no invented SME identities · no fabricated labels · no Gate C auto-approve · no live CDS/PHI · HSI Neon = red-wave only

This is an **operator checklist**. Engineering scaffold can be CLEARED while science stays **BLOCKED**.

## Engineering (already CLEARED when `bun run n3:check` passes)

| # | Check | Evidence |
| --- | --- | --- |
| 1 | Calibration scaffold in 20–50 range | 24 unlabelled items in `benchmark-kit.v1.json` |
| 2 | Empty label packet `awaiting_sme` | `labels.awaiting_sme.json` — all `expectedOutcome: null` |
| 3 | Study-family split with no leakage | `study-family-split.v1.json` |
| 4 | Annotation guideline published | `annotation-guideline-v1.md` |
| 5 | Anonymous SME roster slots reserved | freeze-prep `smeRosterSlots` (principal always null until filled by humans) |
| 6 | Pilot scale plan documented | [`N3_PILOT_SCALE_PLAN.md`](./N3_PILOT_SCALE_PLAN.md) |

## Human (must stay PENDING until real SMEs act)

| # | Check | Owner |
| --- | --- | --- |
| 7 | Recruit Annotator A, Annotator B, Adjudicator into empty roster slots | Founder / programme lead |
| 8 | Complete calibration labels (20–50) with `annotatorId`, `labelledAt`, rationale | Recruited SMEs |
| 9 | Record disagreement; adjudicate unresolved rows | Adjudicator |
| 10 | Set packet status `frozen_human_labels` + `split.freezeDate` only after adjudication | Operator + adjudicator |

**Do not** invent principals, organisations, or `expectedOutcome` values to clear these rows.

## Recommended pilot path (after calibration freeze)

1. Keep calibration at 20–50; do not pad with fabricated rows.
2. Clear N1 passage rights (`licenceEvidenceUri`) before minting scored pilot passages.
3. Mint `pilot_candidate` rows only from rights-eligible sources with study-family assignment **before** labelling.
4. Freeze held-out families before measuring N4/N6 systems.
5. Stop at ~100–200 until reviewer agreement justifies expansion.

## Verify

```sh
bun run n3:freeze-prep
bun run n3:check
bun run n3:eval
bun --no-env-file test test/scientificBenchmark.test.ts test/n3CalibrationFreezePrep.test.ts
```

Expected: `engineeringScaffold=CLEARED`, `humanLabelFreeze=BLOCKED`, `smeSlotsFilled=0`, `scientificAcceptance=BLOCKED`.
