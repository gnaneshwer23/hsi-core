# U9 — API error-envelope wave 2 (21 November 2026)

**Phase:** Production readiness · public + restricted-preview research APIs  
**Scope:** Stable `code` fields on remaining public research handlers; Ask client Retry-After surfacing.  
**Not claimed:** On-call destinations, write enablement, spend telemetry.

## Change

| Surface | Codes / headers |
| --- | --- |
| Ask | `METHOD_NOT_ALLOWED`, `JSON_REQUIRED`, `PAYLOAD_TOO_LARGE`, `INVALID_JSON` (plus U5 codes) |
| Access request | Same gate codes on method / body / timeout paths |
| Literature search | `ORIGIN_NOT_ALLOWED`, `INVALID_SEARCH_TERM`, `INVALID_CURSOR`, `RATE_LIMITED`, `RETRIEVAL_UNAVAILABLE` |
| Radar | Gate + validation codes; `RATE_LIMITED` + `Retry-After: 600` |
| Related works / co-occurrence / methods-compare / target-evidence / biomedical-metadata | Same gate + `RATE_LIMITED` pattern |
| Ask browser client | Parses `Retry-After` into `limited.retryAfterSeconds`; AskCard shows minute hint |

## Acceptance

- Focused unit tests for Ask / askClient / literature / radar / access-request  
- Production writes remain disabled  
- No migration hold removal  

## Follow-ons

- Owner D-120 / D-122 alert destinations  
- Broader clients (radar / literature UI) can adopt Retry-After the same way as Ask  
