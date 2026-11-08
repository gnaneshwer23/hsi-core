# Audit #5 — Staging two-account Auth + research writes

**Date:** 2026-11-08  
**Source:** `docs/engineering/PRODUCTION_READINESS_AUDIT_2026-11-08.md` next-build #5  
**HSI substrate Neon:** red-wave only (`br-rough-snow-zagxbvjp` / `ep-sweet-hill-zasb0lni` for writes)  
**Honesty:** no invented neon_auth principals · no production research grants without verified user id · `autoApprove=false` · **not CDS** · no MoU · no autumn-snow for HSI · Auth signup polish for founder Gmail **deferred**

## Verdict

| Plane | State |
|-------|--------|
| Engineering harness (write-gate honesty, checklist, roster slots, offline checks) | **ENG CLEARED** |
| Live staging Auth / two-account acceptance / research writes | **OPS residual** — Auth A www path **user-confirmed** (session eligible + researcher grant + synthetic fixture for founder Gmail); full two-account + staging write journey still open; harness still keeps `accountSlotsFilled=0` / `liveAuthVerified=false` in git |
| Production research writes | **Must stay disabled** (`writesEnabled=false` on `ep-restless-dew`) — **not claimed** by Auth A confirm |
| Invented principals / Gate C auto-approve / MoU / CDS-PHI | **Forbidden** (unchanged) |

This receipt is **not** PRODUCTION_QA launch clearance, production `writesEnabled`, Gate C, or scientific readiness. Auth A user confirm (2026-11-08) stamps session/grant/fixture only.

## Delivered (engineering)

| Piece | Location |
|-------|----------|
| Write-gate + prep types / fail-closed parse | `src/ops/stagingTwoAccountAuthPrep.ts` |
| Staging branch constants on neonGuard | `HSI_STAGING_BRANCH_ID`, `HSI_DISPOSABLE_BRANCH_ID` |
| On-disk prep packet | `operations/staging/two-account-auth-prep.v1.json` |
| Operator checklist | [`STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md`](./STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md) |
| Harness | `bun run staging:auth-prep` · `bun run staging:auth-prep:check` |
| Tests | `test/stagingTwoAccountAuthPrep.test.ts` (+ existing `test/vercelResearch.test.ts`) |

## Measured counts (this tip)

| Metric | Value |
|--------|------:|
| Engineering checks CLEARED | 7 / 7 |
| Ops checks PENDING | 6 / 6 |
| Account roster slots reserved | 3 (researcher / reviewer / grant operator) |
| Account slots filled | **0** |
| `liveAuthVerified` | **false** |
| `researchWritesLiveVerified` | **false** |
| `opsAcceptance` | **BLOCKED** |
| Production writes with staging flags | **false** (asserted) |

## Founder must flip (residual ops)

1. Align Vercel Preview `HSI_*` / `VITE_HSI_*` to red-wave staging (`br-rough-snow` / `ep-sweet-hill`); never autumn-snow.
2. Set `VITE_HSI_USE_AUTH_GATEWAY=true` and redeploy; confirm `/api/research/health` (`writesEnabled=false` first).
3. Create **two** distinct email-verified neon_auth accounts on staging Auth (no SQL verification bypass). Founder Gmail signup polish remains deferred.
4. Provision `hsi_research_access` only for verified immutable user ids (researcher ≠ independent reviewer).
5. Flip `HSI_RESEARCH_WRITES_ENABLED=true` + `HSI_NEON_BRANCH_ID=br-rough-snow-zagxbvjp` on Preview only.
6. Record live two-account journey + denial rehearsals privately (no tokens/PHI).
7. Keep production (`ep-restless-dew`) `writesEnabled=false`.

## Code can automate (already)

- Offline write-gate honesty samples (staging enable / production refuse / default false)
- autumn-snow refusal via neonGuard
- Health expected shape docs + unit tests
- Anonymous roster slots + prepHash seal/check
- Read-only `check-hsi-staging` when API key + staging URL present (does not create accounts)

## Explicit non-goals

- Inventing neon_auth users, passwords, or grants in git
- Enabling production research writes
- Claiming PRODUCTION_QA launch from eng harness
- Gate C / cite auto-approve
- Live CDS / PHI
- Pointing HSI migrations at autumn-snow

## Next audit item (recommended)

Audit **#8** partner-lock prep is **ENG CLEARED / FOUNDER BLOCKED** — see [`AUDIT_8_PARTNER_LOCK_2026-11-08.md`](./AUDIT_8_PARTNER_LOCK_2026-11-08.md). Parallel human tracks remain: ISI cite HITL residual (#3), N1 human rights (#2), N3 SME labels (#4), #5 two-account residual. Optional #9 N5 registry refresh. N6 usefulness stays **NO-GO until #4 human freeze**.
