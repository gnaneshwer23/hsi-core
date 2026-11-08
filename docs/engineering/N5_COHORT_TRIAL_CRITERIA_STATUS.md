# N5 cohort / trial criteria research status

**Phase:** N5 — Deepen cohort and trial research  
**Plan:** [`docs/strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md`](../strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md)  
**Date:** 7 November 2026

This is an engineering status receipt. It is **not** live patient eligibility, enrolment clearance, scientific approval, Gate C, CDS or PHI.

## Prerequisite status

| Prerequisite | Status | Notes |
| --- | --- | --- |
| N2 assertion kinds + offline ledger | **Present (committed)** | Optional pin via ledger file hash |
| N2 scientific entailment | **BLOCKED** | Not required to start N5 engineering |
| N3 engineering harness | **Present (committed)** | Optional pin via benchmark-kit hash |
| N3 human label freeze | **BLOCKED** | N5 can proceed separately from mechanism brief |
| Existing Path B five states + registry adapters | **Reused** | `trialsCriteriaMvp.ts`, `cohortTrials.ts`, coverage snapshot honesty |

## Verdict

| Gate | Status | Notes |
| --- | --- | --- |
| Timestamped public-registry criteria snapshot | **CLEARED (engineering)** | Offline CT.gov-shaped fixtures; `liveRegistryQueried=false` |
| Live public-registry snapshot refresh (Audit #9) | **CLEARED (engineering) / sci BLOCKED** | CT.gov API v2 pins `NCT01030861` + `NCT02401880`; live path `liveRegistryQueried=true`; `confirmedEligible=false` always |
| Explicit criterion source spans | **CLEARED (engineering)** | Exact excerpt offsets into eligibility text |
| Structured rules only where supported | **CLEARED (engineering)** | Age bounds + narrow T1D/T2D aliases |
| Five Path B states preserved | **CLEARED (engineering)** | `satisfied` / `not_satisfied` / `unknown` / `ambiguous` / `requires_investigator_review` |
| Missing autoantibody / C-peptide / stage / med timing | **CLEARED (engineering)** | Remain `unknown` / `ambiguous` / review — never invented |
| Confirmed eligibility / enrolment | **Forced false** | Age match ≠ complete assessment; satisfied list ≠ eligible |
| Scientific acceptance / live registry verify | **BLOCKED** | No invented recruitment status or live intake |

## Delivered in this increment

- Types / parse / inspect / suite: `src/evidence/cohortTrialCriteriaResearch.ts`
- Runner: `bun run n5:research` · `bun run n5:check`
- Live refresh (Audit #9): `bun run n5:research:live` · `bun run n5:research:live:check`
- Offline fixtures + receipt: `research/domain-graph/n5/`
- Live fixtures + receipt: `fixtures/ctgov.live.*` · `registry-criteria.live.snapshot.v1.json` · `receipts/registry.live.receipt.json`
- Tests: `test/cohortTrialCriteriaResearch.test.ts` · `test/n5RegistryLiveRefresh.test.ts`
- Audit receipt: [`AUDIT_9_N5_LIVE_REGISTRY_REFRESH_2026-11-08.md`](./AUDIT_9_N5_LIVE_REGISTRY_REFRESH_2026-11-08.md)

Extends `src/knowledgeGraph/cohortTrials.ts` (public study import + topic/age overlap), `src/trialsCriteriaMvp.ts` (five states + forbidden eligibility phrases), and coverage registry honesty (`origin: operator_supplied_unverified`).

## Honesty constraints retained

- Public registries / engineering fixtures only — no live eligibility matcher
- T1D ≠ T2D; generic “Diabetes” stays unresolved
- AND/OR/negation preserved as logic tags; unstructured lines force investigator review
- Units and temporal phrases recorded when present; missing facts stay unresolved
- Offline path: `confirmedEligible`, `patientEligible`, `patientEligibilityAssessed`, `enrolmentEnabled`, `liveRegistryQueried` remain false
- Live path (Audit #9): `liveRegistryQueried=true` allowed; `liveStatusVerified=false`; eligibility / enrolment flags stay false
- No Gate C auto-approve, invented MoU, live CDS/PHI or immunecity Neon use

## Verify locally

```sh
bun run n5:research
bun run n5:check
bun run n5:research:live          # optional live CT.gov probe
bun run n5:research:live:check
bun --no-env-file test test/cohortTrialCriteriaResearch.test.ts test/n5RegistryLiveRefresh.test.ts
# Optional regression with prior phases:
bun run n1:check && bun run n2:check && bun run n3:check && bun run n4:check && bun run n5:check && bun run n5:research:live:check
```

## Residual (human / later engineering)

1. Scientific / operational acceptance of live registry slices remains human-gated (`liveStatusVerified` stays false until independently checked).
2. Add structured rules only where protocols explicitly support them (do not invent disease-stage or lab thresholds).
3. Keep validation cohorts synthetic; partner-owned cohort research remains a separately governed future phase.
4. Do not flip `confirmedEligible` without real investigator eligibility evidence (never invent).
