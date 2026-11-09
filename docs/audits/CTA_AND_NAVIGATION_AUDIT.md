# CTA and navigation audit

**Brief:** [`../strategy/HSI_PUBLIC_WEBSITE_IMPROVEMENT_BRIEF.md`](../strategy/HSI_PUBLIC_WEBSITE_IMPROVEMENT_BRIEF.md)  
**Policy source:** `docs/capability-status.json` → `ctaPolicy`

| Route | Component | Current behaviour | Backend dependency | Live or illustrative | Evidence | Issue | Required change | Acceptance test | Owner |
|-------|-----------|-------------------|--------------------|----------------------|----------|-------|-----------------|-----------------|-------|
| `/` | Home primary CTA | Explore the platform | none | live | Home.tsx | Primary may over-promise vs locked workspace | Derive from ctaPolicy (access-first while workspace locked) | Primary → working destination | hsi-site |
| global | PRIMARY_NAV_CTA | Request access → /contact | auth | live | primaryNav.ts | Align with homepage | Single policy module | Nav CTA === registry policy | hsi-site |
| `/research/dashboard` | Open workspace | Links present while unavailable | research API | fail-closed | live snapshot | CTA must not imply access | Disable or route to access check | No empty destination | hsi-site |
