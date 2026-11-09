# Website capability audit

**Brief:** [`../strategy/HSI_PUBLIC_WEBSITE_IMPROVEMENT_BRIEF.md`](../strategy/HSI_PUBLIC_WEBSITE_IMPROVEMENT_BRIEF.md)  
**Registry:** [`../capability-status.json`](../capability-status.json)  
**As of:** 2026-11-09 — Phase 0 starter; fill every row before homepage redesign.

| Route | Component | Current behaviour | Backend dependency | Live or illustrative | Evidence | Issue | Required change | Acceptance test | Owner |
|-------|-----------|-------------------|--------------------|----------------------|----------|-------|-----------------|-----------------|-------|
| `/` | Home hero CTAs | Explore platform + Research access | none / auth | public | Live 200 | CTAs not yet derived from registry | Wire CTA policy from `capability-status.json` | Primary CTA matches `ctaPolicy` | hsi-site |
| `/research/dashboard` | ResearchDashboard | Shows unavailable without session | research API | fail-closed live | health + 401 | Must not look like open workspace | Keep unavailable state; no fake metrics | Anonymous → unavailable labelled | hsi-research |
| demo | SSC illustration | Contract exists; UI may not bind | none | illustrative | `demo_ssc_fibrosis_001.json` | Risk of looking live | Bind demo + persistent labels | Labels visible when `live_backend=false` | hsi-site |
