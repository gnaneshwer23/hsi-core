# Staging two-account Auth + research writes — operator checklist

**Audit Phase #5.** Engineering harness CLEARED; **ops acceptance BLOCKED** until a human completes this list on **red-wave** staging only.

Honesty: no invented `neon_auth` principals · no production research grants without verified user id · no autumn-snow · no Gate C auto-approve · no live CDS/PHI · Auth signup polish for founder Gmail **deferred**.

## Binding targets

| Item | Value |
|------|--------|
| Neon project | `red-wave-06625195` |
| Staging branch | `br-rough-snow-zagxbvjp` |
| Staging host prefix | `ep-sweet-hill-zasb0lni` |
| Production branch (writes must stay off) | `br-quiet-silence-zab1zvji` / `ep-restless-dew-zas989pv` |
| Forbidden | ISI `autumn-snow` / `ep-blue-salad`, Akeno, DeliverX |

Authoritative setup: [`docs/VERCEL_RESEARCH_SETUP.md`](../VERCEL_RESEARCH_SETUP.md). Acceptance depth: [`docs/PHASE_D_BRIEFS_AND_INDEPENDENT_REVIEW.md`](../PHASE_D_BRIEFS_AND_INDEPENDENT_REVIEW.md), [`docs/engineering/HSI_STAGING_SCIENTIFIC_REVIEW_ACCEPTANCE.md`](./HSI_STAGING_SCIENTIFIC_REVIEW_ACCEPTANCE.md), [`docs/PRODUCTION_QA_2026-11-06.md`](../PRODUCTION_QA_2026-11-06.md).

## A. What engineering already automated

- [x] Fail-closed write gate: `HSI_RESEARCH_WRITES_ENABLED=true` **and** `HSI_NEON_BRANCH_ID=br-rough-snow-zagxbvjp` **and** DB host prefix `ep-sweet-hill-zasb0lni`
- [x] Production host refuses writes even when staging flags are set
- [x] Default `writesEnabled=false`
- [x] Auth ↔ DB endpoint-prefix mismatch fails closed
- [x] `neonGuard` refuses autumn-snow / forbidden markers
- [x] Anonymous account roster slots + prep packet (`operations/staging/two-account-auth-prep.v1.json`)
- [x] `bun run staging:auth-prep` / `staging:auth-prep:check`

## B. Founder / ops must flip (not inventable by code)

### B1 — Preview environment alignment

- [ ] Vercel **Preview** (or stable staging alias) uses staging `HSI_DATABASE_URL` for `ep-sweet-hill-zasb0lni`
- [ ] `HSI_AUTH_BASE_URL` and `VITE_HSI_AUTH_BASE_URL` match that same staging Auth host (`…neonauth…/neondb/auth`)
- [ ] `HSI_PUBLIC_ORIGIN` equals the exact HTTPS origin of the test site
- [ ] `HSI_NEON_PROJECT_ID=red-wave-06625195`
- [ ] `VITE_HSI_USE_AUTH_GATEWAY=true` after nested auth routes deploy
- [ ] Redeploy; open `/api/research/health` → `configuration_validated`, `authUrlsMatch=true`, `endpointPrefixesMatch=true`, **`writesEnabled=false`**

### B2 — Two verified neon_auth principals

- [ ] Researcher account: sign-up → email verify → sign-in on staging Auth (no SQL `emailVerified` bypass)
- [ ] Independent reviewer account: **different** email + user id
- [ ] `/research/account` shows approval-required until grants exist (401/503 investigated via session-diagnostics, not guessed)
- [ ] Record immutable user ids privately; fill roster slots only with real ids (do not invent)
- [ ] Auth signup polish for **founder Gmail** remains deferred — use dedicated staging test mailboxes if needed

### B3 — Grants (staging only)

- [ ] Grant `hsi_research_access` researcher role for the verified researcher user id
- [ ] Grant independent reviewer authority for the verified reviewer user id (not the author)
- [ ] Do **not** grant production research access without a verified production Auth principal
- [ ] Refresh access; empty workspace is OK — do not invent evidence

### B4 — Staging write enablement

- [ ] Only after B1–B3: set `HSI_RESEARCH_WRITES_ENABLED=true` and `HSI_NEON_BRANCH_ID=br-rough-snow-zagxbvjp` on Preview
- [ ] Confirm health now reports `writesEnabled=true` on staging origin only
- [ ] Confirm production origin still `writesEnabled=false`

### B5 — Live two-account journey

- [ ] Researcher: create investigation → capture graph context → brief → submit
- [ ] Reviewer: queue visibility → independent decision (not self-review)
- [ ] Denials: anonymous, wrong-owner, revoked grant, self-review, writes disabled
- [ ] Revision path if `request_revision`
- [ ] Private ops receipt (no tokens, passwords, PHI) — then opsAcceptance can move off BLOCKED via human stamp only

## C. Explicit non-goals

- Inventing neon_auth users, passwords, or grants in git
- Enabling production research writes from this checklist
- Gate C auto-approve / MoU / live CDS-PHI
- Pointing HSI at autumn-snow
- Claiming PRODUCTION_QA launch clearance from eng harness alone

## Verify (offline)

```sh
bun run staging:auth-prep
bun run staging:auth-prep:check
bun --no-env-file test test/stagingTwoAccountAuthPrep.test.ts test/vercelResearch.test.ts
```
