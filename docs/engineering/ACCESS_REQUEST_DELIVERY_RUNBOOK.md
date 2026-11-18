# PR-E2E-01c — Access-request delivery configuration + staging dry-run

**Status:** Engineering runbook. Delivery paths are **documented**; staging dry-run worksheet is ready.  
**Not claimed:** live Resend project, webhook destination, operator inbox receipt, or production enquiry success.

Binding backlog: Phase 0 alternative **PR-E2E-01c** (access-request delivery docs + staging dry-run; no fake success).  
Plan row: [`docs/plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md`](../plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md) — A1.5 / UX-02.  
Handler: [`src/server/accessRequestHandler.ts`](../../src/server/accessRequestHandler.ts).  
API: `GET`/`POST` [`site/api/access-requests.ts`](../../site/api/access-requests.ts) → `/api/access-requests`.  
Public UI: [`site/src/pages/ContactPublic.tsx`](../../site/src/pages/ContactPublic.tsx).  
Staging worksheet: [`operations/staging/access-request-dry-run.pending.json`](../../operations/staging/access-request-dry-run.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Delivery configured | Only when env validates (HTTPS webhook **or** Resend + owner `to`). Unset = browser draft only. |
| `delivered: true` in API | Means the **notification provider accepted** the payload — not that a human opened an inbox. |
| Operator receipt | **Not confirmed** by GET status or POST success note. |
| Research grant / writes | **Never** implied. Grants stay administrator-provisioned; writes stay fail-closed. |
| Fake success | Forbidden — never claim delivery without provider acceptance. Honeypot returns HTTP 202 without calling a provider (UI shows a neutral “nothing claimed delivered” note, not a provider success). Misconfiguration returns 503. |
| Secrets in git | Forbidden. No webhook URL, token, or Resend key in tracked files. |
| Rate limit / dedup | **Best-effort, process-local** Maps on the serverless instance. They are not shared across instances/restarts and are not an atomic reservation before provider calls. Do not treat them as a hard global abuse guarantee. |
| Client IP key | Prefers `x-vercel-forwarded-for` / `x-real-ip`, then leftmost `x-forwarded-for`. Caller-spoofed `X-Forwarded-For` remains a residual risk if ingress does not overwrite the header. |

## Configuration (staging or local only)

Unset every variable → `GET /api/access-requests` reports `deliveryConfigured: false`. The Contact page must keep draft-only copy.

### Option A — HTTPS webhook

```bash
# Staging / local .env.local only — never commit
HSI_PUBLIC_ORIGIN=https://your-staging-origin.example
HSI_ACCESS_REQUEST_WEBHOOK_URL=https://hooks.example/access
# Optional bearer inspected by the bridge:
# HSI_ACCESS_REQUEST_WEBHOOK_TOKEN=
```

Requirements enforced in code:

- URL must be `https:` with a hostname
- No embedded username/password in the URL
- Non-2xx webhook response → `DELIVERY_FAILED` (502); nothing claimed delivered

### Option B — Resend email to the owner

```bash
HSI_PUBLIC_ORIGIN=https://your-staging-origin.example
HSI_ACCESS_REQUEST_TO=owner@example.com
RESEND_API_KEY=re_…          # or HSI_ACCESS_REQUEST_RESEND_API_KEY=
# Optional verified From (defaults to Resend onboarding mailbox):
# HSI_ACCESS_REQUEST_FROM=HSI Access <noreply@your-verified-domain>
```

Requirements enforced in code:

- `to` must look like an email
- At least one Resend API key present
- Non-2xx Resend response → `DELIVERY_FAILED` (502)

Placeholders live in [`.env.example`](../../.env.example) (commented). Prefer webhook when you do not want email provider keys on the research host.

## Behaviour guards (already shipped)

| Guard | Behaviour |
| --- | --- |
| Origin | When `HSI_PUBLIC_ORIGIN` is set, foreign `Origin` → 403 |
| Honeypot | Non-empty `company_website` → HTTP 202 before delivery-config check (does not reveal whether delivery is configured); no provider call |
| PHI refuse | Patient-shaped blobs → 400 `PHI_REFUSED` |
| Rate limit | ≈5 POSTs / key / hour → 429 on **this instance only** (see honesty table) |
| Dedup | Same fingerprint within 1 hour returns prior acceptance note without re-sending on **this instance only** |
| Body size | Bodies over **4000 bytes** → 413 |

Offline proof: `bun test test/accessRequestHandler.test.ts`.

## Staging dry-run checklist

Complete privately. Leave git worksheet fields null / false until true. Do **not** invent delivery success in UI copy or STATUS.

### D0 — Preconditions

- [ ] Staging origin set as `HSI_PUBLIC_ORIGIN` (matches browser origin)
- [ ] Choose Option A or B; secrets only in the staging host / `.env.local`
- [ ] Confirm Contact page shows draft-only messaging when delivery is unset
- [ ] No PHI / clinical identifiers in any test question

### D1 — Status honesty (unset)

- [ ] With delivery env **unset**: `GET /api/access-requests` → `deliveryConfigured: false`
- [ ] POST without honeypot returns `ACCESS_REQUEST_NOT_CONFIGURED` (503); UI offers draft, never “sent”
- [ ] POST with non-empty `company_website` still returns 202 (does not leak 503)

### D2 — Configure staging channel

- [ ] Set Option A or B on staging only
- [ ] Redeploy / restart so the serverless function sees env
- [ ] `GET /api/access-requests` → `deliveryConfigured: true`
- [ ] Note still says operator receipt is **not** confirmed

### D3 — Force a non-PHI enquiry

- [ ] Submit a research-only question from `/contact` (or curl with matching Origin)
- [ ] Expect `providerAccepted: true` only if the provider returns 2xx
- [ ] Confirm webhook inbox / Resend dashboard privately (do not paste secrets into git)
- [ ] Confirm UI does not claim administrator grant or write enablement

### D4 — Failure paths

To observe `DELIVERY_FAILED` (502), keep the channel **still configured** (valid HTTPS webhook URL or Resend env that passes `accessRequestDeliveryConfigured`) but make the **provider call** fail — e.g. point the webhook at an HTTPS URL that returns 500, or use a Resend key the provider rejects. Use a **fresh** question/email fingerprint (do not reuse D3’s enquiry within the hour, or you will get the cached acceptance note without a provider call).

- [ ] With a still-configured but failing provider + fresh fingerprint → POST `DELIVERY_FAILED` (502)
- [ ] Confirm UI / API do **not** set success copy
- [ ] Note: clearing the URL entirely (invalid/empty) yields `ACCESS_REQUEST_NOT_CONFIGURED` (503), not 502 — that is expected
- [ ] Restore the channel; leave production unset until owner accepts

### D5 — Close-out

- [ ] Fill private receipt (no secrets); update `access-request-dry-run.pending.json` only with real timestamps/refs
- [ ] Keep `operatorReceiptClaimed: false` and `productionDeliveryClaimed: false` until true
- [ ] Keep `grantsOrWritesImplied: false` always for this worksheet

## Explicit non-goals

- Inventing Resend / webhook success on production
- Committing delivery secrets or live destination URLs
- Auto-provisioning researcher grants or enabling Neon writes from an enquiry
- Gate C auto-approve, MoU invention, shared Neon with immunecity, live CDS/PHI
- Treating honeypot 202 as a real provider delivery
- Claiming global shared rate-limit / atomic dedup across serverless instances (out of scope for this soft-land)

## Verify (offline)

```bash
bun test test/accessRequestHandler.test.ts test/accessRequestDeliveryRunbook.test.ts
```
