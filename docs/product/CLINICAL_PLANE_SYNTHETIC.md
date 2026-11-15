# Synthetic clinical plane (Phase 2 slice)

**Status:** runnable on synthetic data only. Lives in `src/clinicalPlane/` so it can be lifted into a separate private repo without edits. It does not change `AGENTS.md`, the PHI/CDS boundary or any migration hold. Real data is refused in code (`real_data_not_enabled`) until the two-plane ADR is approved and a data source exists.

## What it demonstrates
Run `bun scripts/clinical-plane-demo.ts`.

1. A **phenotype definition** (public, flows down from the scientific plane; here linked by reference to a graph gap) is validated.
2. It is **evaluated inside the plane** against the repository's 200 synthetic profiles. Each criterion is met, not met or **unknown**; patients who might still qualify are reported as *indeterminate*, never silently excluded.
3. Only an **aggregate** leaves the evaluator. Matched ids stay inside.
4. The **release gate** is the only way up. It refuses: row-level or identifying keys/values (including inside object keys), PHI markers, non-synthetic data, a missing or rejected approval, the requester approving their own release, and unauthorised roles.
5. It applies **small-cell suppression (k = 10) with complementary suppression**, so suppressed cells cannot be recovered by subtraction from a disclosed total; if fewer than k are evaluated nothing is released.
6. Every outcome, including every refusal, is written to an **append-only hash-chained audit log** that detects edits, deletions and reordering.

## Pieces
| File | Role |
|---|---|
| `phenotype.ts` | Definition schema, validation, tri-state evaluation, aggregate |
| `releaseGate.ts` | Identifier scan, suppression, four-eyes approval, release |
| `auditChain.ts` | Append-only chain and verification |
| `syntheticSource.ts` | Loader for the synthetic shards; a real source would implement the same `PlanePatient` output inside the private plane |
| `definitions.ts` | Two illustrative, unvalidated definitions |

## Not done, deliberately
- No UI yet; no server endpoint; nothing persisted beyond a process.
- Approval roles are checked as strings; real identity, MFA and RBAC belong to the private plane's deployment.
- Identifier scan is pattern-based, not a de-identification engine. Real data needs a proper de-identification process and DPIA first.
- Not a medical device: aggregate research use only, no patient-level outputs, no clinical advice.
- Definitions are illustrative. A clinician must author and review any definition before it means anything.

## Generated cohort (added 15 November 2026)
`src/clinicalPlane/generator.ts` produces a deterministic synthetic cohort (default 5,000 profiles, seed 20261115, up to 20,000). The same spec gives the same cohort byte for byte, so it is generated in the browser and nothing is downloaded.

**Why.** The 200-profile validation dataset has 10 profiles per condition, so small-group protection hides most condition-level results, and its values are not condition-consistent (type 2 diabetes profiles average an HbA1c of about 5.6%; Alzheimer's profiles average about 46 years of age and are on levodopa and CGRP inhibitors).

**What it is.** Profiles shaped by condition (age, sex, BMI, HbA1c, hs-CRP, medications from the repository's vocabulary) with deliberate missing data (HbA1c 4%, hs-CRP 3%, BMI 2%, age 1%, sex 0.5%) so "not enough information" is exercised. Ids are `SYN-G-######` and the release gate treats them as identifiers.

**What it is not.** Epidemiology. Every parameter is an illustrative demonstration value, not calibrated to any real population or study. Nothing generated is evidence about any disease or person. The pages say so.

**Suppression change made with it.** Complementary suppression now hides the largest remaining cell rather than the smallest. With a few indeterminate profiles the old rule hid the headline matched count; the new rule keeps small informative counts visible while still guaranteeing the hidden values sum to at least k (property-tested).
