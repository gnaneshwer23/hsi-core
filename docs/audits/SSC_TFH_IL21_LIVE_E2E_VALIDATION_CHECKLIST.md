# SSc Tfh / IL-21 live E2E validation checklist

**Purpose:** Record blockers for Step 9 of the Data-to-Discovery brief.  
**Rule:** Do **not** stamp live success, scientific validity, or production readiness from fixtures or CI.  
**Audited with:** [`DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md`](./DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md)  
**Neon:** red-wave only.

## Preconditions (human-gated)

| Gate | Residual | Status at audit | Cleared? |
|------|----------|-----------------|----------|
| Passage / abstract reuse rights | Human queue #2 | PARKED — `humanCleared=0` · `passageImported=0` | ☐ |
| SME dual labels + adjudication | Human queue #4 | PARKED — `smeSlotsFilled=0` | ☐ |
| Live authenticated Ask→export + staging two-account | Human queue #5 | PARKED — `opsAcceptance=BLOCKED` | ☐ |

## Journey probes (do not invent outcomes)

| Step | Probe | Expected honesty | Observed |
|------|-------|------------------|----------|
| 01 Landscape | Decision workbench `#inv-01` | Bound release / living-evidence metadata only | ☐ blocked / ☐ fixture / ☐ live |
| 02 Evidence | `#inv-02` | Support≠oppose consensus | ☐ blocked / ☐ fixture / ☐ live |
| 03 Gaps | `#inv-03` | Gap classes ≠ novelty; SME ranking parked | ☐ blocked / ☐ fixture / ☐ live |
| 04 Translational | `#inv-04` | Trials not_queried until versioned snapshot | ☐ blocked / ☐ fixture / ☐ live |
| 05 Action plan | `#inv-05` | Saved planner only — no invented protocols | ☐ blocked / ☐ fixture / ☐ live |
| 06 Package | `#inv-06` | Export hashes; live Ask→export parked on #5 | ☐ blocked / ☐ fixture / ☐ live |

## Explicit non-claims

- [ ] No claim that draft `ssc-tfh-il21-*` JSON equals live E2E success  
- [ ] No Gate C auto-approve  
- [ ] No patient eligibility or CDS/PHI  
- [ ] CI green ≠ scientific validity  

## Sign-off (humans only)

| Role | Name | Date | Notes |
|------|------|------|-------|
| Principal (rights) | | | |
| SME / adjudicator | | | |
| Ops (staging journey) | | | |

`liveSuccessClaimed` remains **false** until all three human gates above are truly cleared and a private ops receipt exists (no secrets in git).
