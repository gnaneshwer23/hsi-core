# U15 — Gateway envelope wave 3 (21 November 2026)

**Phase:** Production readiness · public + restricted-preview gateways  
**Scope:** Stable `code` fields on remaining gateway fallthroughs: research router, onboarding profile validation, graph workspace validation, public graph snapshot, auth diagnostics method gate.  
**Not claimed:** Store enablement, migration lifts, owner acceptance.

## Change

| Surface | Codes |
| --- | --- |
| `vercelResearch` router | `NOT_FOUND`, `METHOD_NOT_ALLOWED` on remaining fallthroughs |
| `neonAuthGateway` diagnostics | `METHOD_NOT_ALLOWED` on non-GET |
| `onboardingProfileApi` | `METHOD_NOT_ALLOWED`, `JSON_REQUIRED`, `PAYLOAD_TOO_LARGE`, `REQUEST_TIMEOUT`, `INVALID_JSON` |
| `graphWorkspaceApi` | Validation / denial codes (`RECORD_REQUIRED`, `REVISION_REQUIRED`, `GRAPH_WORKSPACE_DENIED`, …) |
| `publicGraphSnapshotService` | `METHOD_NOT_ALLOWED`, `INVALID_GRAPH_REQUEST`, `INVALID_GRAPH_VERSION`, `REQUEST_CANCELLED`, `GRAPH_SNAPSHOT_UNAVAILABLE` |

## Acceptance

- Focused unit tests above  
- Existing `error` strings preserved  
- Holds / writes / `acceptedForScope` unchanged  

## Follow-ons

- Isolation probe catalog remains probe-protocol (out of scope)  
- Optional CI wiring for `scan:client-bundle` after `site:build`  
