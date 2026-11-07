# N4 grounded brief status

**Phase:** N4 — Ground the research answer  
**Plan:** [`docs/strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md`](../strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md)  
**Date:** 7 November 2026

This is an engineering status receipt. It is **not** scientific approval, claim entailment, Gate C clearance or a measured expert usefulness result.

## Prerequisite status

| Prerequisite | Status | Notes |
| --- | --- | --- |
| N1 offline queue + adapters + identity fail-closed | **Present (local uncommitted)** | [`N1_SOURCE_VERIFICATION_STATUS.md`](./N1_SOURCE_VERIFICATION_STATUS.md) |
| N1 live scientific acceptance | **BLOCKED** | Rights uncleared; DOI↔title mismatches retained |
| N2 assertion kinds + offline ledger fixture | **Present (local uncommitted)** | [`N2_EVIDENCE_LEDGER_STATUS.md`](./N2_EVIDENCE_LEDGER_STATUS.md) |
| N2 scientific entailment | **BLOCKED** | Metadata-only findings cannot ground answers |
| N3 engineering harness + empty labels | **Present (local uncommitted)** | [`N3_SCIENTIFIC_BENCHMARK_STATUS.md`](./N3_SCIENTIFIC_BENCHMARK_STATUS.md) |
| N3 human label freeze / pilot | **BLOCKED** | Zero expert labels; scientific measurement deferred |
| N4 engineering may proceed | **Yes** | Plan: deterministic baseline can ship with honest BLOCKED flags |

N4 does **not** clobber N1–N3 artifacts. It pins N1 receipt / N2 ledger / N3 kit hashes into each brief run.

## Verdict

| Gate | Status | Notes |
| --- | --- | --- |
| Deterministic lexical + ledger retrieval | **CLEARED (engineering)** | Extends Phase E eligibility + workbench honesty |
| Abstain on metadata-only / identity / wrong context / injection | **CLEARED (engineering)** | Inspectable `supportAssessment` + `abstainReason` |
| Pin question, corpus, N1/N2/N3, method, configuration | **CLEARED (engineering)** | `pins.*` on every brief |
| `groundedClaimAccepted = false` | **Forced** | Cannot parse a brief that flips this true |
| Optional model adapter | **Non-default contract only** | `enableModelAdapter` required; `modelActivationAllowed` stays false |
| Scientific acceptance / N6 usefulness | **BLOCKED** | Requires N2 entailment + N3 pilot labels + experts |

## Delivered in this increment

- Types / retrieval / brief builder / optional adapter contract: `src/evidence/groundedBrief.ts`
- Runner: `bun run n4:brief` · `bun run n4:check`
- Offline corpus + investigations + receipt: `research/domain-graph/n4/`
- Tests: `test/groundedBrief.test.ts`

Extends existing patterns in `src/scientificEvaluation.ts` (deterministic assistance / abstain), `src/researchWorkbench.ts` (insufficient_evidence), and N1–N3 offline fixtures under `research/domain-graph/`.

## Honesty constraints retained

- Metadata-only N1 matches → `metadata_only_insufficient` → **abstain** (never invented entailment)
- Identity mismatches → `identity_blocked`
- Instruction-like questions → empty hits + abstain
- Engineering passage fixture is labelled `fixtureKind: engineering` — not live paper text
- `groundedClaimAccepted`, `scientificApproval`, `graphPromotable`, `claimEntailmentAssessed`, `modelActivationAllowed` remain false
- No Gate C auto-approve, invented MoU, live CDS/PHI or immunecity Neon use

## Verify locally

```sh
bun run n4:brief
bun run n4:check
bun --no-env-file test test/groundedBrief.test.ts
# Optional regression with prior phases:
bun run n1:check && bun run n2:check && bun run n3:check && bun run n4:check
```

## Residual (human / later engineering)

1. Clear N1 rights and DOI mismatches before treating any candidate as passage-eligible.
2. Complete N2 entailment / context review so ledger rows can carry real permitted passages.
3. Freeze N3 human labels (calibration → pilot) before claiming scientific performance vs baseline.
4. Optional: measure a non-default model adapter against the same pinned investigations — still abstain-first.
5. N6 blinded expert utility remains a separate phase after this engineering baseline.
