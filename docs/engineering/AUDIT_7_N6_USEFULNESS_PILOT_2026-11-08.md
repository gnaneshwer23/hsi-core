# Audit #7 — N6 blinded usefulness pilot prep

**Date:** 2026-11-08  
**Source:** `docs/engineering/PRODUCTION_READINESS_AUDIT_2026-11-08.md` next-build #7  
**HSI substrate Neon:** red-wave only  
**Honesty:** no invented usefulness scores · no invented reviewer identities · `autoApprove=false` · **not CDS** · no MoU · no autumn-snow for HSI · **do not claim N6 pilot CLEARED**

## Pre-check: ranked dependency

Audit table #7: *N6 blinded usefulness study after N3 freeze + agreed thresholds* — **NO-GO until #4**.  
Audit #4 freeze-prep remains eng CLEARED / science BLOCKED (`labelledCalibrationCount=0`, `smeSlotsFilled=0`). Soft eng scaffolding for N6 may proceed; usefulness pilot stays **NO-GO**.

## Verdict

| Plane | State |
|-------|--------|
| Engineering pilot-prep (schema, empty slots, checklist, harness, Neon ledger helpers) | **ENG CLEARED** |
| Usefulness pilot / scientific acceptance | **SCIENCE BLOCKED / NO-GO** (`scoredRows=0`, `reviewerSlotsFilled=0`, `n3HumanLabelFreezePrerequisite=BLOCKED`) |
| Invented scores / reviewer names / Gate C auto-approve / MoU / CDS-PHI | **Forbidden** (unchanged) |

This receipt is **not** N6 pilot CLEARED, scientific usefulness vs baseline, or Gate C clearance.

## Delivered (engineering)

| Piece | Location |
|-------|----------|
| Pilot-prep types + fail-closed parse | `src/evidence/n6UsefulnessPilotPrep.ts` |
| On-disk prep packet | `research/domain-graph/n6/pilot-prep.v1.json` |
| Operator checklist | [`N6_USEFULNESS_PILOT_CHECKLIST.md`](./N6_USEFULNESS_PILOT_CHECKLIST.md) |
| Prior N6 protocol / empty scores (retained) | `research/domain-graph/n6/` + `src/evidence/blindedExpertUsefulness.ts` |
| Harness | `bun run n6:pilot-prep` · `bun run n6:check` (validates prep) |
| Tests | `test/n6UsefulnessPilotPrep.test.ts` |
| Neon ledger R/W helpers (016/017 companion) | `src/db/evidenceLedgerStore.ts` · `src/db/experimentLedgerStore.ts` · `src/db/ledgerNeonWriteGate.ts` · `test/ledgerNeonStores.test.ts` |

## Measured counts (this tip)

| Metric | Value |
|--------|------:|
| Questions / conditions / packets | 4 / 3 / 12 |
| Scored rows | **0** |
| Reviewer roster slots reserved | 5 |
| Reviewer slots filled | **0** |
| Engineering pilot-prep checks CLEARED | 8 / 8 |
| Human checks PENDING or NO-GO | 7 / 7 |
| `n3HumanLabelFreezePrerequisite` | **BLOCKED** |
| `thresholdsStatus` | `proposed_unagreed` |
| `usefulnessPilotGoNoGo` | **NO_GO** |
| `scientificAcceptance` | **BLOCKED** |
| `usefulnessClaimed` | **false** |

## Neon ledger helpers (companion)

| Gate | Behaviour |
|------|-----------|
| Readable | Any HSI red-wave host after `neonGuard` |
| Writable | `writesEnabled=true` **and** staging host `ep-sweet-hill-zasb0lni` only |
| Production | `ep-restless-dew` read-only for helpers |
| Forbidden | autumn-snow / Akeno / DeliverX refused |
| Authority | Offline N2/N7 JSON fixtures remain authority; helpers do not invent rows or clear science |

## Residual human (required)

1. Complete Audit **#4** N3 SME labels + freeze before any N6 scoring.
2. Pre-agree rubric thresholds and major-error adjudication (leave `proposed_unagreed` until locked).
3. Recruit independent blinded reviewers into empty roster slots (do not invent).
4. Supply conventional-research arm artifacts without unblinding A/B.
5. Dual-review → adjudicate → freeze `frozen_human_scores`.
6. Human-controlled unblinding; report denominators + uncertainty.
7. Only then claim usefulness vs baseline — software tests alone do not suffice.

## Explicit non-goals

- Inventing expert scores, usefulness deltas, or inter-rater agreement
- Claiming N6 pilot CLEARED from eng harness
- Gate C / cite auto-approve
- Live CDS / PHI
- Invented MoU / partner lock
- Pointing HSI ledger helpers at autumn-snow
- Enabling production research writes for ledger inserts

## Next audit item (recommended)

Parallel human tracks remain primary: ISI cite HITL (#3), N1 rights (#2), **N3 SME labels (#4)** — hard unlock for N6 science. Auth A www session/grant/fixture user-confirmed; Audit #5 two-account residual open. Audit **#8** partner-lock prep is **ENG CLEARED / FOUNDER BLOCKED** — see [`AUDIT_8_PARTNER_LOCK_2026-11-08.md`](./AUDIT_8_PARTNER_LOCK_2026-11-08.md). Optional next eng-safe: #9 N5 registry refresh with `confirmedEligible=false`.

## Verify

```sh
bun run n6:pilot-prep
bun run n6:check
bun run n6:eval
bun --no-env-file test test/blindedExpertUsefulness.test.ts test/n6UsefulnessPilotPrep.test.ts test/ledgerNeonStores.test.ts
```
