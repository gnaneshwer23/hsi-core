# Audit #9 — N5 live public-registry snapshot refresh

**Date:** 2026-11-08  
**Source:** `docs/engineering/PRODUCTION_READINESS_AUDIT_2026-11-08.md` next-build #9  
**HSI substrate Neon:** red-wave only  
**Honesty:** `confirmedEligible=false` · `patientEligible=false` · `enrolmentEnabled=false` · `liveStatusVerified=false` · `scientificAcceptance=BLOCKED` · no MoU · no Gate C auto-approve · **not CDS/PHI** · no autumn-snow for HSI

## Verdict

| Plane | State |
|-------|--------|
| Engineering live-refresh harness (CT.gov lookup, pinned NCTs, fixture capture, check) | **ENG CLEARED** |
| Scientific acceptance / recruitment truth / enrolment | **SCIENCE BLOCKED** |
| Confirmed patient eligibility | **Forced false** (no invented eligibility) |
| Invented MoU / Gate C auto-approve / CDS-PHI / autumn-snow HSI | **Forbidden** (unchanged) |

This receipt is **not** confirmed eligibility, live intake clearance, or scientific acceptance of any registry slice.

## Delivered (engineering)

| Piece | Location |
|-------|----------|
| CT.gov API v2 lookup | `src/evidence/clinicalTrialsGovLookup.ts` |
| Live refresh types + honesty parse | `src/evidence/n5RegistryLiveRefresh.ts` |
| Harness | `bun run n5:research:live` · `bun run n5:research:live:check` |
| Captured public fixtures | `research/domain-graph/n5/fixtures/ctgov.live.*.json` |
| Live snapshot + receipt | `registry-criteria.live.snapshot.v1.json` · `receipts/registry.live.receipt.json` |
| Status | `LIVE_REFRESH_STATUS.json` (+ `STATUS.json` liveRefresh sidecar) |
| Tests | `test/n5RegistryLiveRefresh.test.ts` |
| Offline engineering path | unchanged — `n5:research` / `n5:check` still pin NCT99990xxx fixtures |

## Pinned public NCT set

| NCT | Role in programme research |
|-----|----------------------------|
| `NCT01030861` | TN10 / teplizumab T1D-prevention public record (already product-referenced) |
| `NCT02401880` | Public T2D pharmacology record with eligibility text |

Pins are public-registry research anchors only — not recruitment claims.

## Measured honesty (this tip)

| Metric | Value |
|--------|------:|
| Live provider probed | **yes** (ClinicalTrials.gov API v2) |
| Pinned NCTs retrieved | **2 / 2** |
| `liveRegistryQueried` (live path) | **true** |
| `liveStatusVerified` | **false** |
| `confirmedEligible` | **false** |
| `patientEligible` | **false** |
| `enrolmentEnabled` | **false** |
| `scientificAcceptance` | **BLOCKED** |
| `inventedEligibilityPermitted` | **false** |
| Durable check mode | `offline_live_fixture_replay` (CI-reproducible) |

## Explicit non-goals

- Setting `confirmedEligible=true` or inventing enrolment suitability
- Claiming `liveStatusVerified=true` from a single API pull
- Gate C / cite auto-approve
- Live CDS / PHI / patient records
- Replacing offline engineering fixtures as the sole `n5:check` authority
- Pointing HSI at autumn-snow
- Invented MoU / partner lock

## Residual

1. Human/scientific acceptance of any real registry slice remains BLOCKED.
2. Parallel human tracks stay primary: ISI cite HITL (#3), N1 rights (#2), N3 SME labels (#4), Audit #5 two-account residual, founder MoU (#8).
3. N6 usefulness stays **NO-GO until #4**.
4. N7/N8 remain **NO-GO near-term** (audit #10).

## Verify

```sh
bun run n5:research:live          # optional live probe + fixture refresh
bun run n5:research:live:check    # CI-safe fixture replay
bun run n5:check                  # offline engineering fixtures
bun --no-env-file test test/n5RegistryLiveRefresh.test.ts test/cohortTrialCriteriaResearch.test.ts
```
