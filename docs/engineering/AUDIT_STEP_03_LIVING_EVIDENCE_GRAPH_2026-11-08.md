# Audit — Execution step 03 Living evidence and graph expansion

**Date:** 2026-11-08  
**Branch:** `eng/step-03-living-evidence-graph`  
**HSI substrate Neon:** red-wave only  
**Honesty:** `humanCleared=false` · `passageImported=false` · `graphPromotable=false` · `scientificAcceptance=BLOCKED` · no MoU · no Gate C auto-approve · **not CDS/PHI** · trials remain `not_queried` (step 05)

## Verdict

| Plane | State |
|-------|--------|
| Engineering metadata expansion harness (Europe PMC / Open Targets / CT.gov identity) | **ENG CLEARED** |
| Passage import / rights clearance | **BLOCKED** (human queue #2 PARKED) |
| Graph relationship promotion | **BLOCKED** (candidates only; needs human review) |
| Scientific acceptance | **BLOCKED** |
| Invented clearances / MoU / Gate C / CDS-PHI / autumn-snow | **Forbidden** (unchanged) |

## Delivered

| Piece | Location |
|-------|----------|
| Europe PMC PMID lookup | `src/evidence/europePmcBibliographicLookup.ts` |
| Open Targets disease→target adapter | `src/evidence/openTargetsLookup.ts` |
| Living evidence expansion + entity resolution | `src/evidence/livingEvidenceExpansion.ts` |
| Outcome bind + stage honesty | `src/researchOutcome.ts` · outcome panel §01 |
| Captured fixtures | `research/domain-graph/living-evidence/fixtures/` |
| Snapshot + receipt | `expansion.v1.json` · `receipts/expansion.receipt.json` |
| Harness | `bun run living-evidence:expand` · `:check` · `:live` |
| Tests | `test/livingEvidenceExpansion.test.ts` |

## Pinned public set

| Kind | Pins |
|------|------|
| PMID | `18375541`, `24586782`, `30760472` |
| Open Targets disease | `MONDO_0008383` (RA), `MONDO_0005100` (SSc) |
| NCT (identity only) | `NCT01030861` |

## Measured honesty (offline replay)

| Metric | Value |
|--------|------:|
| Bibliographic retrieved | **3 / 3** |
| Open Targets diseases retrieved | **2 / 2** |
| Registry entities resolved | **1 / 1** |
| Graph relationship candidates | **10** (all `graphPromotable=false`) |
| `humanCleared` / `passageImported` | **0 / 0** |
| `scientificAcceptance` | **BLOCKED** |
| Investigation `trials.status` | **`not_queried`** (step 05) |

## Explicit non-goals

- Inventing `licenceEvidenceUri` or passage import
- Promoting Open Targets associations into approved graph edges
- Attaching versioned trials to investigation O-04 (step 05)
- Verified scientific gap ranking (step 04)
- Gate C / MoU / CDS-PHI / autumn-snow

## Next milestone

**Execution step 04 — Agent intelligence and gap verification** (traceable gap recommendations tested against expert-labelled cases — still blocked on human #4 SME gold).

## Verify

```sh
bun run living-evidence:expand
bun run living-evidence:check
bun --no-env-file test test/livingEvidenceExpansion.test.ts test/researchOutcome.test.ts
```
