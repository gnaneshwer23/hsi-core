# Audit #10 — N7/N8 real data / licensed models (near-term NO-GO scaffold)

**Date:** 2026-11-08  
**Source:** `docs/engineering/PRODUCTION_READINESS_AUDIT_2026-11-08.md` next-build #10  
**HSI substrate Neon:** red-wave only  
**Honesty:** no invented wet-lab · no invented partner data · no invented licences/weights · `realObservationClaimed=false` · `modelActivationAllowed=false` · `liveProviderCalled=false` · `autoApprove=false` · **not CDS** · no MoU · no autumn-snow for HSI · **do not claim N7/N8 science CLEARED**

## Pre-check: ranked dependency

Audit table #10: *N7/N8 real data or licensed models* — **NO-GO near-term**.  
Offline N7 ledger + N8 adapter remain eng CLEARED / sci BLOCKED. Soft eng scaffolding for empty real-data slots may proceed; live observations and licensed-model activation stay **NO-GO**.

## Verdict

| Plane | State |
|-------|--------|
| Engineering real-data prep (schema, empty slots, checklist, harness, STOP note) | **ENG CLEARED** |
| N7 real observation / wet-lab / authorised public data | **SCIENCE NO-GO** (`realDataSlotsFilled=0`, `realObservationClaimed=false`) |
| N8 licensed models / live providers / usefulness claim | **SCIENCE NO-GO** (`modelActivationAllowed=false`, waits #4/#7 N6) |
| Invented outcomes / licences / MoU / Gate C auto-approve / CDS-PHI | **Forbidden** (unchanged) |

This receipt is **not** wet-lab clearance, specialised-model usefulness, Gate C clearance, or production partner lock.

## Delivered (engineering)

| Piece | Location |
|-------|----------|
| Prep types + fail-closed parse | `src/evidence/n7n8RealDataPrep.ts` |
| On-disk prep packet | `research/domain-graph/n7n8/real-data-prep.v1.json` |
| Operator checklist | [`N7_N8_REAL_DATA_CHECKLIST.md`](./N7_N8_REAL_DATA_CHECKLIST.md) |
| Prior N7/N8 offline harnesses (retained) | `research/domain-graph/n7/` · `research/domain-graph/n8/` |
| Harness | `bun run n7n8:real-data-prep` · `bun run n7n8:real-data-prep:check` |
| Tests | `test/n7n8RealDataPrep.test.ts` |

## Measured counts (this tip)

| Metric | Value |
|--------|------:|
| Engineering checks CLEARED | 8 / 8 |
| Human checks PENDING / NO-GO / BLOCKED | 7 / 7 |
| Real-data / licence slots reserved | 8 |
| Real-data slots filled | **0** |
| `nearTermGoNoGo` | **NO_GO** |
| `realObservationClaimed` | **false** |
| `modelActivationAllowed` | **false** |
| `liveProviderCalled` | **false** |
| `scientificAcceptance` | **BLOCKED** |
| `inventedRealOutcomesPermitted` | **false** |
| `inventedLicensedModelsPermitted` | **false** |

## STOP — no further eng-safe ranked phases

Audit #10 exhausts the ranked next-build eng-safe track. **Further production-readiness progress is human residuals:**

1. **#2** — N1 per-source passage reuse rights (`humanCleared` / `licenceEvidenceUri`)
2. **#3** — ISI cite HITL: Claim support → Approve (0 supports / 0 publicCiteApproved)
3. **#4** — N3 SME calibration labels (0 labels / 0 SME slots)
4. **#5** — Staging two-account + research writes residual
5. **#8** — Founder MoU / `legalBinding` (0 MoU slots; never invent)

Do **not** invent N7 live observations, N8 licensed-model runs, partner data, or MoU to “unblock” this phase.

## Explicit non-goals

- Inventing wet-lab outcomes, partner datasets, licence ids, or weights access
- Claiming N7/N8 science CLEARED from eng harness
- Flipping `realObservationClaimed` or `modelActivationAllowed`
- Gate C / cite auto-approve
- Live CDS / PHI
- Invented MoU / `legalBinding=true`
- Pointing HSI at autumn-snow
- Vendoring multi-GB model weights into git

## Next (human only)

Parallel human tracks are primary. No additional ranked eng phase remains after this scaffold without inventing science or agreements.

## Verify

```sh
bun run n7n8:real-data-prep
bun run n7n8:real-data-prep:check
bun run n7:check
bun run n8:check
bun --no-env-file test test/n7n8RealDataPrep.test.ts test/experimentLedger.test.ts test/specialisedModelAdapter.test.ts
```
