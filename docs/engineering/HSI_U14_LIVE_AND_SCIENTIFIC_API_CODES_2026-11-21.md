# U14 — Live evidence + scientific site API codes (21 November 2026)

**Phase:** Production readiness · public + restricted-preview APIs  
**Scope:** Stable `code` fields on live evidence persistence API, legacy scientific site handlers, and trusted-proxy refusal.  
**Not claimed:** Live write enablement, PubMed/network reliability, scientific approval.

## Change

1. `src/liveEvidenceApi.ts` — every fail-closed JSON body includes SCREAMING `code` while preserving existing snake_case `error` tokens.  
2. `site/api/scientific-{abstract,pubmed,investigation-trace}.ts` — method / validation / retrieval failures gain `code`.  
3. `src/server/runInterrogativeApi.ts` — missing trusted HTTPS proxy → `TRUSTED_PROXY_REQUIRED`.

## Acceptance

- `bun test test/liveEvidenceApi.test.ts test/vercelApiHandlerShape.test.ts`  
- Snake_case live-evidence `error` strings unchanged  
- Writes remain fail-closed (`LIVE_PERSISTENCE_DISABLED` / `writesEnabled: false`)  

## Follow-ons

- Isolation probe catalog keeps its own probe-protocol error tokens (out of scope)  
- Owner staging gates before any live persistence enablement  
