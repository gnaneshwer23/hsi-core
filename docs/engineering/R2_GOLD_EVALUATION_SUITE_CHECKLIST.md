# R2 — Gold Evaluation Suite (eng deepen)

**Roadmap phase R2** from *HSI End-to-End Architecture and Roadmap*: 50 draft Qs → independent SME-labelled, adjudicated cases — exit: **frozen split + baseline metrics**.

**Verdict:** Engineering scaffold **CLEARED** · Scientific acceptance **BLOCKED** · Rights acceptance **BLOCKED**.

Honesty: draft bank ≠ gold · `smeGoldFilled=false` · `frozenHeldOut=false` · `independentlyLabelledCases=0` · null metrics ≠ scores · `scientificAcceptance=BLOCKED` · no Gate C auto-approve · no MoU invent · no live CDS/PHI · HSI Neon = red-wave only · **human #2/#4 explicitly parked**.

## Binding pointers

| Item | Value |
|------|--------|
| Draft bank (not gold) | `evaluation/research-readiness/questions.draft.json` (50 cases) |
| Gold Suite v1 scaffold | [`GOLD_EVALUATION_SUITE_V1.md`](./GOLD_EVALUATION_SUITE_V1.md) · `bun run gold:check` |
| R1 packets (unbound) | `research/domain-graph/r1/source-packets.v1.json` · `bun run r1:check` |
| R2 suite manifest | `evaluation/gold-evaluation-suite/r2/suite-manifest.v1.json` |
| Harness | `bun run r2:prepare` · `bun run r2:check` |
| Target exit | Frozen study-grouped split + baseline metrics (not claimed here) |

## A. What engineering already automated

- [x] Versioned R2 suite manifest (`hsi-r2-gold-evaluation-suite-1`)
- [x] Bound draft bank hash + Gold Eval Suite v1 suiteHash (labels remain 0)
- [x] Empty SME A / SME B worksheets (50 rows; `labelledCases=0`)
- [x] Empty adjudication worksheet (`adjudicatedCases=0`)
- [x] Study-grouped split slots reserved unfilled (`frozenHeldOut=false`)
- [x] Baseline metric placeholders with `scientificAcceptance=BLOCKED`
- [x] R1 packet gold bindings stay unbound (`r1PacketsBoundToGold=0`)
- [x] `bun run r2:prepare` / `r2:check` + unit tests

## B. Humans must supply (parked — not inventable by code)

### B1 — #4 SMEs (PARKED for this phase)

- [ ] Independent SME A labels on all 50 draft cases
- [ ] Independent SME B labels on the same cases
- [ ] Accountable adjudication of disagreements
- [ ] Keep `smeGoldFilled=false` / `independentlyLabelledCases=0` until real dual SME + adjudicator

### B2 — #2 rights + freeze (PARKED)

- [ ] Rights-cleared packet hashes before binding `sourcePacketHash`
- [ ] Study-grouped development / validation / held-out freeze
- [ ] Baseline metrics scored on frozen held-out inputs
- [ ] Do **not** claim `scientificAcceptance=CLEARED` from eng placeholders

### B3 — Explicit refusals

- [ ] Do **not** invent SME expert labels, adjudications, or scientificAccuracy scores
- [ ] Do **not** treat the 50-question draft bank as gold
- [ ] Do **not** freeze held-out splits without packets + adjudicated labels
- [ ] Do **not** Gate C auto-approve, invent MoU, or use autumn-snow for HSI

## C. Residual parked (user constraint)

| Residual | Status |
|----------|--------|
| #2 N1 rights | **PARKED** — packet binding blocked |
| #3 cite HITL | Parked |
| #4 SMEs | **PARKED** — worksheets empty |
| #5 staging | Parked |
| #8 MoU | Parked — never invent |

## Verify (offline)

```sh
bun run r2:prepare
bun run r2:check
bun run gold:check
bun run r1:check
bun --no-env-file test test/r2GoldEvaluationSuite.test.ts
```

Expected: `engineeringScaffold=CLEARED`, `scientificAcceptance=BLOCKED`, `smeGoldFilled=false`, `frozenHeldOut=false`, `independentlyLabelledCases=0`, `baselineMetricsScored=0`.
