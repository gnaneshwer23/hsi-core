# Auth grant gate and session-expiry honesty

**Status:** Engineering honesty soft-land (gap-matrix P0 auth leftover).  
**Does not claim:** open signup→write, auto-grants, production research access, or live two-account acceptance.

Related: [`STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md`](./STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md), Neon Auth client [`site/src/lib/hsiAuthClient.ts`](../../site/src/lib/hsiAuthClient.ts).

## Separated layers (do not collapse)

| Layer | What it means | What it does **not** mean |
| --- | --- | --- |
| Neon Auth signup / email verify | Provider identity exists | Research grant, reviewer authority, writes |
| Active Auth session | Browser may call authenticated routes with cookies | Workspace membership or graph promotion |
| Administrator research grant | Backend membership for researcher (and separately reviewer) | Write enablement (`writesEnabled` stays fail-closed) |
| Staging write flags | Ops-only after isolation checklist | Production writes or Gate C |

UI must keep these distinct: **signed out ≠ grant denied ≠ session expired ≠ auth down**.

## Session expiry UX

- `parseAuthSession` fails **closed** when `expiresAt` is in the past.
- Client error code: `auth_session_expired` (message from `AUTH_ERROR_MESSAGES.AUTH_SESSION_EXPIRED`).
- Malformed provider payloads stay `auth_invalid_response`.
- Null session (signed out) remains `{data:null,error:null}` — not an error.
- Sign-in and Research account pages keep the form / “sign in again” path; they must not present expiry as “authentication service unavailable.”

## Grant-gate copy (product surfaces)

- `/sign-in`, `/sign-up`, `/research/account`, `/contact`: account ≠ grant; grant ≠ writes.
- Access-request / Contact enquiry notifies the operator only when delivery is configured; it never invents delivery success or provisions roles.

## Operator checklist (staging)

Reuse §B2–B3 of the two-account staging checklist:

1. Verify signup → email verify → sign-in on staging Auth.
2. Confirm `/research/account` shows **Research access requires approval** until a real grant exists.
3. Provision grants only with verified user ids (never invent principals).
4. Keep production writes off; do not treat a green Auth session as write enablement.

## Explicit non-goals

- Inventing Neon Auth principals or grants in SQL
- Enabling `HSI_RESEARCH_WRITES_ENABLED` from this soft-land
- Gate C auto-approve, MoU invention, shared Neon with immunecity, live CDS/PHI
- Claiming two-account isolation acceptance

## Verify (offline)

```bash
bun test test/hsiAuthClient.test.ts test/authGrantGateHonesty.test.ts
```
