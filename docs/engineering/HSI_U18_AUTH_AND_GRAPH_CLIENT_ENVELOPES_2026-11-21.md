# U18 — Auth Retry-After + graph / researcher workspace envelopes (21 November 2026)

**Phase:** Production readiness · restricted-preview clients  
**Scope:** Auth client rate-limit wait hints; graph-workspace client uses shared research error helper; researcher workspace 404 gains `code`.  
**Not claimed:** Auth provider rate-limit configuration, graph-workspace store enablement, scientific approval.

## Change

1. `hsiAuthClient` — 429 / `RATE_LIMITED` uses `rateLimitedMessage` and returns `RATE_LIMITED`.  
2. `graphWorkspaceClient` — list/save/load server failures use `researchApiErrorMessage`.  
3. `researcherWorkspaceApi` — unknown paths return `{code:"NOT_FOUND",error:"Not found"}`.  
4. Extra research code honesty mappings for graph-workspace / schema-not-applied.

## Acceptance

- `bun test test/hsiAuthClient.test.ts test/researcherWorkspace.test.ts test/researchApiErrors.test.ts`  
- No write / migration / owner-gate changes  

## Follow-ons

- Owner L0/L1 GO; AppSec for PROD-QA-003  
