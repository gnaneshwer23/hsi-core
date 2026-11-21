# U17 — Restricted-preview client envelopes (21 November 2026)

**Phase:** Production readiness · restricted-preview UX honesty  
**Scope:** Shared research API error helper that prefers stable `code` + Retry-After; wire into workspace list/create, saved investigations, and live-run start.  
**Not claimed:** Write enablement, staging grants, scientific approval.

## Change

1. `site/src/lib/researchApiErrors.ts` — parse envelope, map known codes, append Retry-After wait hints on 429.  
2. `InvestigationWorkspace` / `SavedResearchInvestigations` / `useLiveRun` — replace status-only branching with the shared helper.  

## Acceptance

- `bun test test/researchApiErrors.test.ts`  
- Fail-closed write messaging preserved in substance  
- No migration / write / owner-gate changes  

## Follow-ons

- Optional: auth client Retry-After; graph-workspace client codes  
- Owner L0/L1 GO remains open  
