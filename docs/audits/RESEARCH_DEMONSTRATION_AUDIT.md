# Research demonstration audit

**Brief:** [`../strategy/HSI_PUBLIC_WEBSITE_IMPROVEMENT_BRIEF.md`](../strategy/HSI_PUBLIC_WEBSITE_IMPROVEMENT_BRIEF.md)  
**Contract:** [`../research-demonstrations/demo_ssc_fibrosis_001.json`](../research-demonstrations/demo_ssc_fibrosis_001.json)

| Route | Component | Current behaviour | Backend dependency | Live or illustrative | Evidence | Issue | Required change | Acceptance test | Owner |
|-------|-----------|-------------------|--------------------|----------------------|----------|-------|-----------------|-----------------|-------|
| TBD homepage / how-it-works | demo panel | Contract file present; UI binding TBD | none | illustrative (`live_backend=false`) | demo JSON | Must not appear live | Bind JSON + persistent labels | Labels visible; mode≠live | hsi-site |
| `/research/mechanism-workflow` | R3 workbench | Real API paths when authed; public shell | research API | live APIs when session | R3 docs | Public visit ≠ live science | Keep honesty copy | No hard-coded demo as live | hsi-research |
