# U10 — Client Retry-After surfacing (21 November 2026)

**Phase:** Production readiness · public research UI honesty  
**Depends on:** U5 / U9 stable `Retry-After` headers on research APIs  
**Not claimed:** Shared admission telemetry, on-call destinations, write enablement

## Change

1. Shared helpers in `site/src/lib/retryAfter.ts` (`parseRetryAfterSeconds`, `formatRetryAfterHint`, `rateLimitedMessage`).  
2. Ask / methods-compare / target-evidence clients carry optional `limited.retryAfterSeconds`.  
3. AskCard, MethodsSharing, TargetWorkflow show minute/second wait hints.  
4. Radar, gaps (co-occurrence), SSc literature, related-works, and biomedical-metadata fetch paths append Retry-After hints on HTTP 429.

## Acceptance

- `bun test test/retryAfter.test.ts test/askClient.test.ts test/methodsCompareClient.test.ts test/targetEvidenceClient.test.ts`  
- No production write enablement  
- No invented staging hosts or owner acceptance  

## Follow-ons

- Access-request form UI can adopt the same helper when delivery is configured  
- Related-works / biomedical panels can share the same rate-limit copy path  
