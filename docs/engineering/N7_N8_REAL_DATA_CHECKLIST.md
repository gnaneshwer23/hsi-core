# N7/N8 real data / licensed models — checklist (empty slots)

**Audit Phase #10.** Engineering harness CLEARED; **scientific acceptance NO-GO near-term**. Never invent wet-lab observations, partner datasets, MoU, licensed weights, or live provider calls from chat.

Honesty: offline N7 fixtures ≠ laboratory results · offline N8 dry-run ≠ specialised-model usefulness · `realObservationClaimed=false` · `modelActivationAllowed=false` · `liveProviderCalled=false` · no Gate C auto-approve · no live CDS/PHI · HSI Neon = red-wave only.

## Binding pointers

| Item | Value |
|------|--------|
| N7 offline ledger | [`N7_EXPERIMENT_LEDGER_STATUS.md`](./N7_EXPERIMENT_LEDGER_STATUS.md) · `bun run n7:check` |
| N8 offline adapter | [`N8_SPECIALISED_MODEL_ADAPTER_STATUS.md`](./N8_SPECIALISED_MODEL_ADAPTER_STATUS.md) · `bun run n8:check` |
| Prep packet | `research/domain-graph/n7n8/real-data-prep.v1.json` |
| Partner MoU residual | Audit #8 — [`PARTNER_LOCK_CHECKLIST.md`](./PARTNER_LOCK_CHECKLIST.md) |
| N6 usefulness residual | Audit #7 — waits on #4 N3 SME freeze |

## A. What engineering already automated

- [x] N7 prediction→outcome ledger with fixture-only outcomes
- [x] N7 `realObservationClaimed=false` / `realObservationAcceptance=BLOCKED`
- [x] N8 bounded dry-run adapter; `live_provider` refused
- [x] N8 `modelActivationAllowed=false` / `activationDefault=false`
- [x] Empty real-data / licence slots reserved (all null / false)
- [x] Explicit near-term `NO_GO` + STOP note for human residuals
- [x] `bun run n7n8:real-data-prep` / `n7n8:real-data-prep:check`

## B. Humans must supply (not inventable by code)

### B1 — N7 authorised data (near-term NO-GO)

- [ ] Authorised public experimental dataset accession / URI **or** partner lab agreement
- [ ] Fill `N7-DATA-PUBLIC` / `N7-DATA-PARTNER` only with real pointers (ties to #8 MoU if partner path)
- [ ] Human-approve prospective protocol (`N7-PROTOCOL`) — fixture ledger does not imply approval
- [ ] Attest non-fixture observation only after authorised dataBasis (`N7-ATTEST`)

### B2 — N8 licensed models (near-term NO-GO)

- [ ] Compatible model licence artifact (`N8-LICENCE`) — keep body private; no invented commercial rights
- [ ] Licensed weights / provider access pointer out of git (`N8-WEIGHTS`)
- [ ] Complete #4 N3 SME freeze + #7 N6 usefulness before claiming model benefit
- [ ] Held-out multimodal / organoid eval protocol (`N8-EVAL`)
- [ ] Founder/human activation attest (`N8-ACTIVATE`) — never default-on paid providers

### B3 — Explicit refusals

- [ ] Do **not** invent wet-lab rows, partner orgs, MoU text, or licence ids from chat
- [ ] Do **not** set `realObservationClaimed=true` or `modelActivationAllowed=true` in eng scaffolds
- [ ] Do **not** claim Gate C clearance, CDS readiness, or specialised-model usefulness from this checklist

## C. STOP — further eng progress

Audit #10 is the **last ranked eng-safe** production-readiness scaffold. Remaining work is human:

| Residual | Audit |
|----------|--------|
| N1 passage reuse rights | #2 |
| ISI cite HITL (supports → Approve) | #3 |
| N3 SME calibration labels | #4 |
| Staging two-account + research writes | #5 |
| Founder MoU / `legalBinding` | #8 |

## Verify (offline)

```sh
bun run n7n8:real-data-prep
bun run n7n8:real-data-prep:check
bun run n7:check
bun run n8:check
bun --no-env-file test test/n7n8RealDataPrep.test.ts
```

Expected: `engineeringScaffold=CLEARED`, `scientificAcceptance=BLOCKED`, `nearTermGoNoGo=NO_GO`, `realDataSlotsFilled=0`.
