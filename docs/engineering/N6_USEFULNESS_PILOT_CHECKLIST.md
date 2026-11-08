# N6 blinded usefulness pilot checklist

**Phase:** production-readiness audit next-build **#7**  
**Programme:** gut–immune–T2D  
**Artifact:** `research/domain-graph/n6/pilot-prep.v1.json`  
**Honesty:** no invented usefulness scores · no invented reviewer identities · no Gate C auto-approve · no live CDS/PHI · no invented MoU · HSI Neon = red-wave only

This is an **operator checklist**. Engineering scaffold can be CLEARED while the usefulness pilot stays **NO-GO**.

## Hard dependency (science NO-GO)

N6 pilot scoring **must wait** for Audit **#4** N3 human label freeze (`humanLabelFreeze=CLEARED`). Soft eng scaffolding here does **not** clear usefulness.

## Engineering (already CLEARED when `bun run n6:check` passes)

| # | Check | Evidence |
| --- | --- | --- |
| 1 | Frozen protocol + rubric + major-error taxonomy | `protocol.v1.json` |
| 2 | Empty score packets `awaiting_blinded_reviewers` | `scores.awaiting_reviewers.json` — 12 rows, 0 scored |
| 3 | Blinding scaffold conceals system identity | Score rows omit `conditionId` |
| 4 | Anonymous blinded-reviewer roster slots reserved | pilot-prep `reviewerRosterSlots` (principal always null until filled) |
| 5 | Thresholds remain `proposed_unagreed` | Not measured HSI performance |
| 6 | N3 freeze prerequisite acknowledged BLOCKED | `n3HumanLabelFreezePrerequisite=BLOCKED` |
| 7 | Eval usefulness deltas forced null / unclaimed | `eval.offline.receipt.json` |
| 8 | This checklist published | `N6_USEFULNESS_PILOT_CHECKLIST.md` |

## Human (must stay PENDING / NO-GO until real people act)

| # | Check | Owner |
| --- | --- | --- |
| 9 | Complete N3 calibration freeze (Audit #4 residual) | Founder / SMEs |
| 10 | Pre-agree scoring thresholds + adjudication process | Programme lead + SMEs |
| 11 | Recruit independent blinded reviewers into empty roster slots | Founder / programme lead |
| 12 | Supply conventional-research arm artifacts without unblinding A/B | Study operator |
| 13 | Dual-review → adjudicate → freeze `frozen_human_scores` | Reviewers + adjudicator |
| 14 | Human-controlled unblinding; report denominators + uncertainty | Unblinding operator |
| 15 | Usefulness claim vs baseline | Only after 9–14 — never from eng alone |

**Do not** invent principals, organisations, scores, usefulness deltas, or MoU text to clear these rows.

## Companion eng (016/017 Neon helpers)

Fail-closed Neon R/W helpers for ledger tables exist behind `neonGuard` + `writesEnabled` + staging host only. Offline N2/N7 JSON fixtures remain authority. Production (`ep-restless-dew`) stays read-only for ledger helpers. Helpers do **not** clear N6 usefulness.

## Verify

```sh
bun run n6:pilot-prep
bun run n6:check
bun run n6:eval
bun --no-env-file test test/blindedExpertUsefulness.test.ts test/n6UsefulnessPilotPrep.test.ts test/ledgerNeonStores.test.ts
```

Expected: `engineeringScaffold=CLEARED`, `usefulnessPilotGoNoGo=NO_GO`, `n3HumanLabelFreezePrerequisite=BLOCKED`, `reviewerSlotsFilled=0`, `scoredRows=0`, `scientificAcceptance=BLOCKED`.
