# N8 specialised model adapter status

**Phase:** N8 — Evaluate specialised models and modalities  
**Plan:** [`docs/strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md`](../strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md)  
**Date:** 7 November 2026

This is an engineering status receipt. It is **not** demonstrated model usefulness, scientific approval, Gate C clearance or a licence to call paid providers.

## N7 coexistence

**N7** artifacts ship alongside this increment (`research/domain-graph/n7/`, `src/evidence/experimentLedger.ts`, `scripts/n7-experiment-ledger.ts`, `test/experimentLedger.test.ts`, `docs/engineering/N7_EXPERIMENT_LEDGER_STATUS.md`, `db/migrations/017_hsi_experiment_ledger.sql`, and the `n7:*` `package.json` scripts). N8 optionally pins the N7 ledger hash when present; it does not modify N7 sources or invent laboratory observations.

## Prerequisite status

| Prerequisite | Status | Notes |
| --- | --- | --- |
| N1–N6 on `origin/main` | **Present (committed)** | N4 optional model contract + N6 usefulness harness |
| N4 grounded brief optional adapter contract | **Present** | `enableModelAdapter` + `buildOptionalModelAdapterRequest` |
| N6 independent blinded usefulness | **BLOCKED** | No expert scores; N8 must not claim usefulness |
| Compatible live model licence / weights | **Not supplied** | Fixture / dry-run only |
| N8 engineering may proceed | **Yes** | Plan: engineering may precede N6 people-gate |

## Verdict

| Gate | Status | Notes |
| --- | --- | --- |
| One bounded adapter interface + versioned manifest | **CLEARED (engineering)** | `adapter-n8-bounded-research-1` |
| Opt-in, logged, activation disallowed by default | **CLEARED (engineering)** | `optIn` + `acknowledgeActivationDisallowed` required |
| Dry-run / fixture path (no paid APIs) | **CLEARED (engineering)** | `live_provider` refused |
| Baseline comparison vs N4 deterministic | **CLEARED (engineering)** | Agreement logged; usefulness delta forced `null` |
| Visible uncertainty + abstention preservation | **CLEARED (engineering)** | Fixture never upgrades abstain |
| `groundedClaimAccepted` stays false | **Forced** | Parse rejects flips |
| N6 usefulness / scientific acceptance | **BLOCKED** | Explicitly not claimed |
| Live weights / held-out multimodal eval | **BLOCKED** | Requires licence + N6 + suitable data |

## Delivered in this increment

- Types / fail-closed executor / honesty parsers: `src/evidence/specialisedModelAdapter.ts`
- N4 contract pins `OPTIONAL_MODEL_ADAPTER_ID` → N8: `src/evidence/groundedBrief.ts`
- Runner: `bun run n8:adapter` · `bun run n8:check`
- Offline fixtures + receipt: `research/domain-graph/n8/`
- Tests: `test/specialisedModelAdapter.test.ts`

Extends the N4 optional model path with a single research-safe dry-run adapter (text + optional public-structure multimodal fixture slot). Does not enable a commercial provider.

## Honesty constraints retained

- Activation default is **false**; live provider mode is refused
- Fixture proposals mirror N4 outcomes — never invent stronger support
- `groundedClaimAccepted`, `modelActivationAllowed`, `scientificApproval`, `graphPromotable` remain false
- `usefulnessDeltaVsBaseline` stays `null`; `n6UsefulnessClaimed` stays false
- No paid API calls in tests or the offline runner
- No Gate C auto-approve, invented MoU, live CDS/PHI or immunecity Neon use

## Verify locally

```sh
bun run n8:adapter
bun run n8:check
bun --no-env-file test test/specialisedModelAdapter.test.ts
# Optional regression with prior phases (N7 if present):
bun run n1:check && bun run n2:check && bun run n3:check && bun run n4:check && bun run n5:check && bun run n6:check && bun run n7:check && bun run n8:check
```

## Residual (human / later engineering)

1. Complete N6 blinded expert usefulness before claiming specialised-model benefit.
2. Select a bounded live model with a compatible licence and appropriate research data.
3. Add held-out multimodal / organoid evaluation under a separately approved protocol.
4. Keep paid / live providers behind explicit human activation — never default-on.
