# U21 — Remaining preview client envelopes (21 November 2026)

**Phase:** Production readiness · restricted-preview + scientific retrieval clients  
**Scope:** Prefer stable `code` (+ Retry-After) on home save, workbench investigation load, review history, onboarding profile save, and scientific retrieval UIs.  
**Not claimed:** Write enablement, staging grants, AppSec GO, owner L0/L1.

## Change

1. Extended `researchApiErrors` with `investigation_load`, `review_history`, `scientific_retrieval` contexts and retrieval codes (`RETRIEVAL_UNAVAILABLE`, validation codes).  
2. Added sync `formatResearchApiError` for clients that already parsed JSON.  
3. Wired `useSaveInvestigation`, `AuthenticatedInterrogativeWorkbench`, `ResearchAccount` history, `onboardingProfileClient`, `useGaps`, `useRadar`, `ScienceLiterature`, `RelatedWorksPanel`, `BiomedicalMetadataPanel`.  

## Acceptance

- `bun test test/researchApiErrors.test.ts`  
- Home save still shows sign-in honesty when unauthenticated  
- Fail-closed copy preserved; no migration / write / owner-gate changes  

## Follow-ons

- Owner L0/L1 GO; AppSec for PROD-QA-003  
- Optional: curator / remaining science page envelopes  
