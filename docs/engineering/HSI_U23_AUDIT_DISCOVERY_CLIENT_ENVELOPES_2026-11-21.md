# U23 — Context-audit and discovery client envelopes (21 November 2026)

**Phase:** Production readiness · audit review + scientific discovery clients  
**Scope:** Prefer stable `code` (+ Retry-After) on context-audit load/submit, SSc governed discovery, and scientific abstract / investigation-trace retrieval.  
**Not claimed:** Write enablement, audit grants, AppSec GO, owner L0/L1.

## Change

1. Added `context_audit` context; mapped audit / abstract / graph discovery codes.  
2. Widened `readResearchOutcomeResponse` to accept any research error context (audit no longer inherits outcome_load copy).  
3. Wired `ContextAuditReviewPanel`, `SscGovernedDiscovery`, `ScientificDiscoveryExperience`.  

## Acceptance

- `bun test test/researchApiErrors.test.ts`  
- Claim-graph discovery 403 honesty still shows permission denial  
- No migration / write / owner-gate changes  

## Follow-ons

- Owner L0/L1 GO; AppSec for PROD-QA-003  
