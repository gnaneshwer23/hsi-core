# U22 — Reviewer / governed client envelopes (21 November 2026)

**Phase:** Production readiness · independent review + governed graph clients  
**Scope:** Prefer stable `code` (+ Retry-After) on reviewer decision submit, gap evidence counts, and governed research / SSc graph queries.  
**Not claimed:** Write enablement, reviewer authority grants, AppSec GO, owner L0/L1.

## Change

1. Added `delivery_decide` context and `INVESTIGATION_MISMATCH` honesty mapping.  
2. Wired `ScientificReviewerDecision` (package load + decision POST), `useGapEvidence`, `GovernedResearchPanel`, `ScientificResearchWorkbench` governed graph query.  

## Acceptance

- `bun test test/researchApiErrors.test.ts`  
- Fail-closed decision / package honesty preserved  
- No migration / write / owner-gate changes  

## Follow-ons

- Owner L0/L1 GO; AppSec for PROD-QA-003  
- Remaining science-page static asset loaders stay honesty-first without inventing codes  
