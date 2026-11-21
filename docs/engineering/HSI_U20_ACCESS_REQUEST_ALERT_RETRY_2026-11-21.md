# U20 — Access-request alert + Retry-After polish (21 November 2026)

**Phase:** Production readiness · public access funnel  
**Scope:** Rate-limit / refusal feedback uses `role="alert"`; Retry-After wait hints stay visible when the client provides seconds.  
**Not claimed:** Delivery configuration, grant provisioning, operator inbox receipt.

## Change

- `AccessIntentPanel` announces refusals and rate limits as alerts.  
- When `retryAfterSeconds` is present and the error text lacks a wait hint, append `formatRetryAfterHint`.  

## Acceptance

- Existing access-request e2e still green  
- Client still does not claim grants or inbox receipt  

## Follow-ons

- Owner enables delivery + AppSec for PROD-QA-003  
