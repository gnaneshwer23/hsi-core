# N3 pilot scale plan (100–200 items)

**Phase:** N3 — Establish the scientific benchmark  
**Plan:** [`docs/strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md`](../strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md)  
**Date:** 7 November 2026

This is an **engineering + process plan**. It does not invent 200 labelled items or claim scientific acceptance.

## Targets (from plan)

| Stage | Size | Purpose | Gate |
| --- | --- | --- | --- |
| Calibration | ~20–50 | Annotator agreement, guideline clarifications | Scaffold CLEARED when unlabelled kit validates; labels remain BLOCKED |
| Pilot | 100–200 | First frozen scientific benchmark | Requires reviewers, rights-cleared passages, study-family freeze |
| Expansion | 500–1,000 | Later breadth | Only after pilot agreement and resources |

## Current scaffold (this tip)

| Metric | Value |
| --- | --- |
| Calibration items (unlabelled) | 24 (12 identity-cleared N1 families × 2 tasks; C-02/C-03 corrected 2026-11-08) |
| Excluded (N1 identity mismatch) | 0 |
| Pilot candidates minted | 0 |
| Held-out frozen | 0 |
| Human labels | 0 → `humanLabelFreeze: BLOCKED` |

## Path from 20 → ~150 pilot (honest)

1. **Keep calibration at 20–50.** Do not pad with fabricated rows. Clarifications go into the guideline changelog; frozen evaluation rows are not silently rewritten.
2. **Clear N1 residuals** that block item quality: passage rights (DOI↔title C-02/C-03 corrected 2026-11-08), and any further bibliographic candidates added after expansion rebuilds.
3. **Mint pilot_candidate rows** only from rights-eligible sources with study-family assignment **before** labelling. Prefer ~8–12 items per cleared family across the five N3 tasks / Phase E categories rather than inventing free-text papers.
4. **Split by study family**, not by item id: related preprint/paper/cohort amendments stay together. Development/calibration vs `held_out_frozen` must not share families.
5. **Independent A/B labels + adjudication** on the pilot set. Record disagreement and insufficient context. Incomplete labels keep evaluation `BLOCKED`.
6. **Freeze** `freezeDate`, label packet status `frozen_human_labels`, and empty-vs-complete checks in `assessLabelFreeze` before any N4/N6 performance claim.
7. **Stop at ~100–200** until reviewer agreement and resources justify expansion toward 500–1,000.

## What engineering will not do

- Invent expert labels or agreement percentages
- Claim scientific acceptance from software tests
- Auto-approve Gate C or promote labels into the domain graph
- Share Neon with immunecity or write PHI/CDS surfaces

## Verify scaffolding

```sh
bun run n3:benchmark
bun run n3:freeze-prep
bun run n3:check
bun --no-env-file test test/scientificBenchmark.test.ts test/n3CalibrationFreezePrep.test.ts
```

Operator freeze checklist (Audit #4): [`N3_CALIBRATION_FREEZE_CHECKLIST.md`](./N3_CALIBRATION_FREEZE_CHECKLIST.md).
