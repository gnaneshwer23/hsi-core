# U19 — Interrogative delivery client envelopes (21 November 2026)

**Phase:** Production readiness · restricted-preview delivery / review path  
**Scope:** Prefer stable `code` (+ Retry-After) on delivery, brief, outcome, review-queue, and evidence-context clients.  
**Not claimed:** Write enablement, staging grants, scientific approval.

## Change

1. Extended `researchApiErrors` contexts/codes for delivery, brief, outcome, review queue, evidence context.  
2. Wired `investigationDeliveryClient`, `researchOutcomeClient`, `InvestigationDelivery`, `IndependentReviewQueue`, `InvestigationEvidenceGraph`.  

## Acceptance

- `bun test test/researchApiErrors.test.ts`  
- Fail-closed copy preserved in substance when codes are present or status honesty applies  
- No migration / write / owner-gate changes  

## Follow-ons

- Access-request submit Retry-After UI polish  
- Owner L0/L1 GO; AppSec for PROD-QA-003  
