# U5 — API reliability hardening (21 November 2026)

**Phase:** Production readiness · restricted-preview path  
**Scope:** Evidenced error-envelope / rate-limit consistency on Ask + live investigation.  
**Not claimed:** On-call delivery, Sentry provisioning, spend telemetry, write enablement.

## Evidence before change

| Finding | Surface |
| --- | --- |
| Ask hourly 429 returned `RATE_LIMITED` but **no** `Retry-After` | `askHandler.ts` |
| Live investigation 429 / validation errors used `{error}` without stable `code` | `liveInvestigationCore.ts` |
| Production health / auth probe | `writesEnabled:false`, provider reachable (21 Nov) |

## Change

1. `gatewayJson` accepts optional extra headers (Retry-After).  
2. Ask rate limit → `Retry-After: 3600` with `code: RATE_LIMITED`.  
3. Live investigation validation + rate limit + run failure → stable `code` fields; rate limit keeps `Retry-After: 600`.  
4. Live investigation handler early gates (`METHOD_NOT_ALLOWED`, `ORIGIN_NOT_ALLOWED`, `JSON_REQUIRED`) match the same envelope.

## Acceptance

- `bun test test/askHandler.test.ts test/liveInvestigation.test.ts`  
- Production writes remain disabled  
- Ops alert catalog still soft-land / destinations null  

## Follow-ons (not this PR)

- Owner D-120 error tracker + D-122 on-call destinations (`opsAlertCatalog.ts`)  
- Shared admission already via `researchRequestControls` — keep process limiter as safety net  
- Broader literature/radar handlers can adopt the same `code` pattern later  
