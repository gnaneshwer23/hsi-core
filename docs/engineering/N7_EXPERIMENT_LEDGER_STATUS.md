# N7 experiment ledger status

**Phase:** N7 — Record experimental outcomes  
**Plan:** [`docs/strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md`](../strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md)  
**Date:** 7 November 2026

This is an engineering status receipt. It is **not** a laboratory result, scientific approval, Gate C clearance or authorised public-data observation.

## Prerequisite status

| Prerequisite | Status | Notes |
| --- | --- | --- |
| N1–N6 on `origin/main` | **Present (committed)** | Pins N3 kit / N6 protocol hashes when files exist |
| N2 prediction vs observation kinds | **Present (committed)** | `EXP-N7-001` links `N2-R-002` without collapsing kinds |
| Independent lab / public-data agreement | **Not supplied** | Real observation acceptance stays **BLOCKED** |
| N7 engineering may proceed | **Yes** | Plan: schemas before people/data |

## Verdict

| Gate | Status | Notes |
| --- | --- | --- |
| Prediction content-hash freeze before outcome | **CLEARED (engineering)** | `freezeExperimentPrediction` → immutable `predictionContentHash` |
| Fail-closed if outcome precedes freeze | **CLEARED (engineering)** | Unit + builder coverage |
| Distinct outcome classes | **CLEARED (engineering)** | `supported` / `negative_null` / `inconclusive` / `inactive_assay` / `technical_failure` |
| Protocol + raw artifact + processing + QC fields | **CLEARED (engineering)** | Missing dose/tissue/timing declared explicitly |
| Review candidate cannot publish graph / edit frozen eval | **CLEARED (engineering)** | `graphPromotable=false`, `mayEditFrozenEvaluationData=false` |
| Real laboratory / authorised observations | **BLOCKED** | Fixtures only; no invented wet-lab results |
| SQL persistence on red-wave | **Applied (Audit #6)** | `017_hsi_experiment_ledger` in `hsi_schema_migrations` on red-wave; table + indexes live; Neon R/W helpers still residual |

## Delivered in this increment

- Types + validators + lifecycle transitions: `src/evidence/experimentLedger.ts`
- Offline fixture ledger + status: `research/domain-graph/n7/`
- Builder/check: `bun run n7:ledger` / `bun run n7:check`
- Migration stub: `db/migrations/017_hsi_experiment_ledger.sql`
- Tests: `test/experimentLedger.test.ts`

Extends N2 prediction freeze / observation split into a cohesive experiment ledger with immutable prediction→result lineage.

## Honesty constraints retained

- `EXP-N7-001` stays **frozen + protocol-bound with no outcome** (awaits authorised observation)
- Fixture outcomes declare `dataBasis=fixture_engineering` and `fixtureHonesty=true`
- Failed QC / `technical_failure` / `inactive_assay` set `biologyNotRefuted` (do not refute biology)
- `negative_null` forces `noEffectNotEstablished=true`
- Review candidates cannot become approved graph knowledge or mutate pinned N3/N6 eval hashes
- `scientificApproval`, `graphPromotable`, `realObservationClaimed` remain false
- No Gate C auto-approve, invented MoU, live CDS/PHI or immunecity Neon use

## Verify locally

```sh
bun run n7:ledger
bun run n7:check
bun --no-env-file test test/experimentLedger.test.ts
# Optional regression with prior phases:
bun run n1:check && bun run n2:check && bun run n3:check && bun run n4:check && bun run n5:check && bun run n6:check && bun run n7:check
# Optional (red-wave only; not required for this offline slice):
# bun run db:migrate
```

## Residual toward full N7

1. Obtain authorised public experimental data **or** a partner laboratory / data agreement before any non-fixture `dataBasis`.
2. Wire Neon read/write helpers for `hsi_experiment_ledger_records` behind the red-wave guard (`017` applied — Audit #6; helpers ENG CLEARED Audit #7).
3. Human review workflow that keeps candidates out of approved graph publish and out of frozen N3/N6 evaluation corpora.
4. Prospective wet-lab execution remains a separately approved protocol — not implied by this harness.

## Audit #10 real-data prep (2026-11-08)

Engineering empty-slot scaffold: [`AUDIT_10_N7_N8_REAL_DATA_2026-11-08.md`](./AUDIT_10_N7_N8_REAL_DATA_2026-11-08.md) · `bun run n7n8:real-data-prep`.  
`nearTermGoNoGo=NO_GO`; `realDataSlotsFilled=0`; never invent wet-lab or partner data.
