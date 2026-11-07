# N6 blinded expert usefulness status

**Phase:** N6 — Demonstrate expert usefulness  
**Plan:** [`docs/strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md`](../strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md)  
**Date:** 7 November 2026

This is an engineering status receipt. It is **not** a measured expert usefulness result, scientific approval, Gate C clearance or a claim that HSI beats baseline.

## N5 coexistence

Uncommitted **N5** artifacts (`research/domain-graph/n5/`, `src/evidence/cohortTrialCriteriaResearch.ts`, `scripts/n5-cohort-trial-criteria.ts`, `test/cohortTrialCriteriaResearch.test.ts`, `docs/engineering/N5_COHORT_TRIAL_CRITERIA_STATUS.md`, and the `n5:*` `package.json` scripts) were **left intact**. N6 pins the N5 criteria receipt hash when that file is present; it does not modify N5 sources or claim trial-criteria scientific acceptance.

## Prerequisite status

| Prerequisite | Status | Notes |
| --- | --- | --- |
| N1–N4 on `origin/main` @ `19ef067` | **Present (committed)** | Engineering harnesses + honesty gates |
| N3 human label freeze | **BLOCKED** | Empty SME labels; N6 measurement still waits |
| N4 grounded brief baseline | **Present (committed)** | Questions reused as N6 study items |
| N5 cohort/trial criteria | **Present (local uncommitted)** | Parallel track; optional pin only |
| Independent blinded reviewers | **Not supplied** | No invented reviewers or scores |
| N6 engineering may proceed | **Yes** | Plan: engineering can precede people |

## Verdict

| Gate | Status | Notes |
| --- | --- | --- |
| Frozen study protocol + rubric + major-error taxonomy | **CLEARED (engineering)** | `research/domain-graph/n6/protocol.v1.json` |
| Blinding scaffold (A/B/C; score rows omit `conditionId`) | **CLEARED (engineering)** | Unblinding key stays on protocol only |
| Baseline vs HSI vs conventional conditions | **CLEARED (engineering)** | Conventional arm is an empty human slot |
| Empty expert score packets | **CLEARED (engineering)** | 12 packets (4 questions × 3 conditions) |
| Replayable eval runner | **CLEARED (engineering)** | Usefulness deltas forced `null` while BLOCKED |
| Independent blinded reviewers | **BLOCKED** | Zero expert scores; none invented |
| Scientific acceptance / usefulness claim | **BLOCKED** | Requires real blinded study + agreed thresholds |

## Delivered in this increment

- Types / protocol / empty scores / run manifest / eval: `src/evidence/blindedExpertUsefulness.ts`
- Runner: `bun run n6:study` · `bun run n6:check` · `bun run n6:eval`
- Offline fixtures + receipt: `research/domain-graph/n6/`
- Tests: `test/blindedExpertUsefulness.test.ts`

Extends N3 empty-label / freeze-blocked eval and N4 pinned brief honesty: incomplete human assessment → explicit **BLOCKED**, never a silent usefulness win.

## Honesty constraints retained

- No invented expert scores, usefulness deltas or inter-rater agreement
- Automated usefulness scoring is forbidden by the analysis plan
- Proposed thresholds remain `proposed_unagreed` — not measured HSI performance
- Score rows omit `conditionId`; system identity stays concealed on artifacts
- `scientificAcceptance`, `usefulnessClaimed`, `scientificApproval` remain false / BLOCKED
- No Gate C auto-approve, invented MoU, live CDS/PHI or immunecity Neon use

## Verify locally

```sh
bun run n6:study
bun run n6:check
bun run n6:eval
bun --no-env-file test test/blindedExpertUsefulness.test.ts
# Optional regression with prior phases (N5 if present):
bun run n1:check && bun run n2:check && bun run n3:check && bun run n4:check && bun run n5:check && bun run n6:check
```

## Residual (human blinded study)

1. Recruit qualified **independent** blinded reviewers (not supplied by this tip).
2. Agree the scoring rubric thresholds and major-error adjudication process in advance.
3. Supply conventional-research artifacts for condition C without unblinding A/B.
4. Dual-review → record disagreement → adjudicate → freeze `scores` as `frozen_human_scores`.
5. Unblind under separate human control using `protocol.blindingKey`; report denominators and uncertainty.
6. Only then claim N6 scientific usefulness vs baseline — software tests alone do not suffice.
