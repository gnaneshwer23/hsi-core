# Accessibility audit

**Brief:** [`../strategy/HSI_PUBLIC_WEBSITE_IMPROVEMENT_BRIEF.md`](../strategy/HSI_PUBLIC_WEBSITE_IMPROVEMENT_BRIEF.md)  
**Harness:** `site/e2e/production-qa.spec.ts` (axe) + manual keyboard

| Route | Component | Current behaviour | Backend dependency | Live or illustrative | Evidence | Issue | Required change | Acceptance test | Owner |
|-------|-----------|-------------------|--------------------|----------------------|----------|-------|-----------------|-----------------|-------|
| `/` | Nav + hero | Skip link + focus styles present in editorial CSS | none | live | prior e2e | Re-verify after redesign | Preserve focus rings; reduced-motion | axe clean + keyboard reach CTAs | hsi-site |
| *(complete Phase 0)* | | | | | | | | | |
