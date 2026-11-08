# N3 annotation guideline — gut–immune–T2D scientific benchmark

**Version:** `hsi-n3-gut-immune-t2d-guideline-1`  
**Programme:** gut microbial metabolites → immune signalling → insulin resistance (T2D), with a separate T1D comparison track  
**Status:** Engineering scaffold ready for SME kickoff — **no expert labels in-repo**

This guideline extends Phase E scientific-evaluation and Phase 6 RA context-annotation patterns. It does **not** grant Gate C approval, invent MoU language, or replace RA/SSc kits.

## What is being labelled

Each item asks a reviewer to judge a **research-assistance outcome** for a scoped question bound to an N1 source candidate (and optional N2 ledger pointer):

| Outcome | Meaning |
| --- | --- |
| `source_summary` | Rights-cleared, context-matched supporting evidence exists and should be surfaced. |
| `conflicting_sources` | Eligible supporting and opposing observations both exist. |
| `abstain` | Missing passage/rights, wrong species/disease context, identity failure, or insufficient context — do not invent support. |

Metadata-only N1 receipts are **not** sufficient for `source_summary`. Prefer `abstain` when exact text and rights are uncleared.

## Required context axes

Record whether each axis is present, missing or insufficient:

- Species / model (mouse ≠ human participant ≠ cell line ≠ mixed)
- Tissue or sample
- Population / cohort
- Assay
- Dose and unit
- Timepoint
- Intervention
- Outcome
- Disease track (T2D gut–immune vs T1D comparison vs cross-cutting)

Human donor material in a mouse model must not be labelled as human participant evidence.

## Study-family rule

Related preprints, publications, protocol amendments and repeated cohorts stay in the **same** study family and therefore the **same** partition. Do not treat them as independent studies for held-out scoring. Identity-mismatched DOI↔title candidates stay in `excluded_identity_blocked` until a human corrects expansion identity (N1-C-02 / N1-C-03 were human-corrected 2026-11-08).

## Calibration vs freeze

1. **Calibration (≈20–50 items):** Annotators practise agreement on scaffolds. Labels from calibration may inform guideline clarifications. They are **not** a frozen scientific benchmark score.
2. **Pilot (100–200 items):** After calibration agreement, mint additional rights-eligible items; freeze study-family splits **before** measuring systems.
3. **Held-out freeze:** Only after independent A/B labelling + adjudication. Incomplete labels → evaluation receipt `humanLabelFreeze: BLOCKED`.

## Forbidden

- Fabricating expected outcomes, annotator ids or agreement scores
- Copying model/baseline outputs into label packets and calling them SME labels
- Promoting calibration items into `held_out_frozen` without a new freeze receipt
- Using held-out labels to tune a model and then reporting the same set as independent evaluation
- Gate C auto-approve, CDS/PHI, or graph publication from annotation outcomes

## Roles

| Role | Duty |
| --- | --- |
| Annotator A / B | Label independently from the packet and guideline |
| Adjudicator | Resolve disagreements; retain both originals |
| Operator | Scaffold empty packets; never invent labels |

## Next human steps

1. Fill anonymous roster slots in `freeze-prep.v1.json` with real recruited reviewers (see [`N3_CALIBRATION_FREEZE_CHECKLIST.md`](../../../docs/engineering/N3_CALIBRATION_FREEZE_CHECKLIST.md)).
2. Calibrate on the 24 unlabelled calibration items in `benchmark-kit.v1.json`.
3. Record disagreement and insufficient-context cases explicitly.
4. Agree pilot item set and freeze `held_out_frozen` before N4/N6 measurement claims.
