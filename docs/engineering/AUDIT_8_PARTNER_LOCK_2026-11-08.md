# Audit #8 — Partner lock prep (empty MoU slots)

**Date:** 2026-11-08  
**Source:** `docs/engineering/PRODUCTION_READINESS_AUDIT_2026-11-08.md` next-build #8  
**HSI substrate Neon:** red-wave only  
**Honesty:** no invented MoU text · no invented named orgs · `legalBinding=false` · `lockedPilot=false` · `autoApprove=false` · **not CDS** · prior Apolo path revoked · no autumn-snow for HSI

## Pre-check: Auth A residual (user-confirmed, parallel)

User confirmed on **www** for `jadav.gnaneshwar@gmail.com` (2026-11-08):

| Claim | State |
|-------|--------|
| Research session eligible (Auth) | **User-confirmed working** |
| Researcher grant visible | **User-confirmed working** |
| Synthetic test fixture visible | **User-confirmed working** |
| Production `writesEnabled` | **Not claimed** (must stay false unless separately verified) |
| Gate C / cite auto-approve | **Not claimed** (forbidden) |
| Full Audit #5 two-account opsAcceptance | **Still residual** (independent reviewer + staging write journey) |

This Auth A stamp does **not** clear Audit #5 opsAcceptance or PRODUCTION_QA launch.

## Verdict

| Plane | State |
|-------|--------|
| Engineering partner-lock harness (fixture honesty, empty MoU slots, checklist) | **ENG CLEARED** |
| Real named partner / MoU / `legalBinding` / `lockedPilot` | **FOUNDER BLOCKED** (`mouSlotsFilled=0`) |
| Invented MoU / named org / Gate C auto-approve / CDS-PHI | **Forbidden** (unchanged) |

This receipt is **not** a signed MoU, production partner lock, or scientific acceptance.

## Delivered (engineering)

| Piece | Location |
|-------|----------|
| Prep types + fail-closed parse | `src/ops/partnerLockPrep.ts` |
| On-disk prep packet | `operations/partner/partner-lock-prep.v1.json` |
| Operator checklist | [`PARTNER_LOCK_CHECKLIST.md`](./PARTNER_LOCK_CHECKLIST.md) |
| Existing fixture / lock / shortlist (retained) | `src/hypotheticalPartnerFixture.ts` · `src/partnerLock.ts` · `docs/ISI_PILOT_PARTNER_SHORTLIST.md` |
| Harness | `bun run partner:lock-prep` · `bun run partner:lock-prep:check` |
| Tests | `test/partnerLockPrep.test.ts` |

## Measured counts (this tip)

| Metric | Value |
|--------|------:|
| Engineering checks CLEARED | 8 / 8 |
| Founder checks PENDING / NO-GO | 7 / 7 |
| MoU slots reserved | 6 |
| MoU slots filled | **0** |
| `lockedPilot` | **false** |
| `legalBinding` | **false** |
| `agreementKind` | `hypothetical_test_only` |
| `founderAcceptance` | **BLOCKED** |
| `inventedMouPermitted` | **false** |

## Founder must decide (residual)

1. Outreach via shortlist categories — no invented emails / PIs.
2. Obtain written confirm of disease + research question (or partner rewrite → re-lock).
3. Fill empty MoU slots only with real org / private artifact pointers.
4. Agree licensing + rubric thresholds with that partner.
5. Swap fixture: `USE_HYPOTHETICAL_PARTNER_FIXTURE=false` + fill `REAL_PARTNER_REPLACEMENT` + `legalBinding=true`.
6. Update shortlist; re-run `bun run outputs`.
7. Never re-lock Apolo without new written confirm; never invent MoU from chat.

## Explicit non-goals

- Inventing MoU body, org names, emails, or `legalBinding=true`
- Claiming `lockedPilot=true` under the hypothetical fixture
- Gate C / cite auto-approve
- Live CDS / PHI
- Production research writes enablement
- Pointing HSI at autumn-snow

## Next audit item (recommended)

Optional **#9** N5 live public-registry snapshot refresh with `confirmedEligible=false`. Parallel human tracks remain primary: ISI cite HITL (#3), N1 rights (#2), N3 SME labels (#4), Audit #5 two-account residual (independent reviewer + staging writes — Auth A session/grant/fixture path now user-confirmed on www). N6 usefulness stays **NO-GO until #4**. N7/N8 remain **NO-GO near-term**.

## Verify

```sh
bun run partner:lock-prep
bun run partner:lock-prep:check
bun --no-env-file test test/partnerLockPrep.test.ts
```
