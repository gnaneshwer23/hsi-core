# Audit #4 — N3 SME calibration freeze prep (20–50)

**Date:** 2026-11-08  
**Source:** `docs/engineering/PRODUCTION_READINESS_AUDIT_2026-11-08.md` next-build #4  
**HSI substrate Neon:** red-wave only  
**Honesty:** no invented SME identities · no fabricated labels · `autoApprove=false` · **not CDS** · no MoU · no autumn-snow for HSI

## Pre-check: ranked #1 cite HITL (safe eng leftovers)

immunecity Audit #3 already CLEARED the eng path (seed → Check → Claim support → Approve UX + `--neon` remeasure docs + curator worksheet). Residual is **purely human** Neon Auth reviewer S-P-O on `/curation?hsi=cite`. No safe eng invent of `claim_support=supports` or Approve. **No further cite HITL eng work in this phase.**

## Verdict

| Plane | State |
|-------|--------|
| Engineering freeze-prep (schema, roster slots, checklist, harness wiring) | **ENG CLEARED** |
| Human label freeze / scientific acceptance | **SCIENCE BLOCKED** (`labelledCalibrationCount=0`, `smeSlotsFilled=0`) |
| Invented labels / SME names / Gate C auto-approve | **Forbidden** (unchanged) |

This receipt is **not** scientific acceptance, N3 freeze CLEARED, or N6 usefulness readiness.

## Delivered (engineering)

| Piece | Location |
|-------|----------|
| Freeze-prep types + fail-closed parse | `src/evidence/n3CalibrationFreezePrep.ts` |
| On-disk prep packet | `research/domain-graph/n3/freeze-prep.v1.json` |
| Operator checklist | [`N3_CALIBRATION_FREEZE_CHECKLIST.md`](./N3_CALIBRATION_FREEZE_CHECKLIST.md) |
| Pilot plan (unchanged authority) | [`N3_PILOT_SCALE_PLAN.md`](./N3_PILOT_SCALE_PLAN.md) |
| Harness | `bun run n3:freeze-prep` · `bun run n3:check` (validates prep) |
| Tests | `test/n3CalibrationFreezePrep.test.ts` |

## Measured counts (this tip)

| Metric | Value |
|--------|------:|
| Calibration items (unlabelled) | 24 |
| Labelled calibration rows | **0** |
| SME roster slots reserved | 4 (A / B / adjudicator / operator) |
| SME slots filled | **0** |
| Engineering freeze-prep checks CLEARED | 6 / 6 |
| Human freeze-prep checks PENDING | 4 / 4 |
| `humanLabelFreeze` | **BLOCKED** |
| `scientificAcceptance` | **BLOCKED** |

## Residual human (required)

1. Recruit real independent Annotator A, Annotator B, and Adjudicator — fill empty roster slots only with named humans (do not invent).
2. Label the 24 calibration items per `annotation-guideline-v1.md`; record disagreement / insufficient context.
3. Prefer `abstain` while N1 passage rights remain uncleared (`humanCleared=0`).
4. After calibration agreement: follow pilot plan for 100–200 with study-family freeze **before** held-out labelling.
5. Set `frozen_human_labels` + `freezeDate` only after adjudication; re-run `n3:check`.

## Explicit non-goals

- Inventing `expectedOutcome`, annotator principals, or agreement scores
- Claiming science freeze from software tests
- Gate C / cite auto-approve
- Live CDS / PHI
- Pointing HSI migrations at autumn-snow

## Next audit item (recommended)

Parallel human tracks: ISI cite HITL residual (ranked #1) and/or N1 human rights attestation (ranked #2). Audit #5 staging Auth eng harness is CLEARED / OPS BLOCKED — see [`AUDIT_5_STAGING_TWO_ACCOUNT_AUTH_2026-11-08.md`](./AUDIT_5_STAGING_TWO_ACCOUNT_AUTH_2026-11-08.md). N6 usefulness stays **NO-GO until #4 human freeze**.
