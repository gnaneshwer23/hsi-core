# U13 — Interrogative API stable error codes (21 November 2026)

**Phase:** Production readiness · restricted-preview research APIs  
**Scope:** Stable `code` fields on `handleInterrogativeApi` error envelopes; wire `scan:client-bundle` npm script.  
**Not claimed:** Write enablement, staging grants, scientific approval, AppSec GO for PROD-QA-003.

## Change

1. Every fail-closed JSON response from `src/server/interrogativeApi.ts` now includes a stable `code` alongside the public `error` string (auth, method, origin, validation, unavailable, denied).  
2. `workspaceError` already forwarded `InvestigationWorkspaceError.code`; the generic fallback is `WORKSPACE_DENIED`.  
3. `package.json` adds `scan:client-bundle` → `bun --no-env-file scripts/scan-client-bundle-secrets.ts` (U12 soft-land).

## Representative codes

| Situation | Code |
| --- | --- |
| Missing / unverified session | `AUTH_REQUIRED` |
| Wrong HTTP method | `METHOD_NOT_ALLOWED` |
| Cross-origin cookie write | `ORIGIN_NOT_ALLOWED` |
| Query / client overrides | `QUERY_OVERRIDES_REFUSED` / `CLIENT_OVERRIDES_REFUSED` |
| Body / content-type / JSON | `JSON_REQUIRED` / `INVALID_JSON` / `PAYLOAD_TOO_LARGE` / `REQUEST_TIMEOUT` |
| Live evidence off | `LIVE_EVIDENCE_DISABLED` |
| Record / graph / workspace denial | `RESEARCH_RECORD_DENIED` / `GRAPH_DENIED` / `WORKSPACE_DENIED` / `EVIDENCE_CONTEXT_DENIED` |

## Acceptance

- `bun test test/interrogativeApi.test.ts`  
- Public error strings unchanged; internals still redacted  
- No migration hold removal; writes remain fail-closed  

## Follow-ons

- Clients may branch on `code` the same way Ask / research handlers do after U9–U10  
- Owner AppSec still closes PROD-QA-003 after a real `site` build scan  
