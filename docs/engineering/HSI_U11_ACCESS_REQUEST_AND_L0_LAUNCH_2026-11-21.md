# U11 — Access-request client + L0 public launch readiness (21 November 2026)

**Phase:** Production readiness · public launch path  
**Not claimed:** Delivery configuration on production, public launch GO, scientific approval, writes.

## Change

1. `site/src/lib/accessRequestClient.ts` — typed status + submit outcomes including `rate_limited` with Retry-After.  
2. `AccessIntentPanel` uses the client (exhaustive outcome switch).  
3. L0 readiness soft-land (`hsi10PublicLaunchReadinessU11SoftLand`) — engineering vs owner GO catalog; premortem remains non-gate.

## Acceptance

- `bun test test/accessRequestClient.test.ts test/hsi10PublicLaunchReadinessU11SoftLand.test.ts`  
- Contact page never claims operator receipt without provider acceptance  
- `publicLaunchClaimed` stays false  

## Follow-ons

- Owner visual acceptance + GO/NO-GO  
- Restricted-preview owner packets (U6) once L0 GO exists  
