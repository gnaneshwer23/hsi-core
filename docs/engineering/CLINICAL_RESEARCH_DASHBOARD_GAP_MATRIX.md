# Clinical Research Dashboard — implementation gap matrix

**Date:** 19 November 2026 (Europe/London)  
**Scope:** Stage 4 Clinical Research Dashboard shell on the shared science engine.  
**Content contract:** [`../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md`](../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md)  
**Visual language:** Shared `enterprise-dashboard.css`.

**Hard boundary:** Not a clinical decision-making tool · no live CDS · no PHI in `hsi-core` · synthetic / approved research cohorts only (approved path remains owner-gated per ADR-0010).

**Disease scope:** HSI is **disease-agnostic**. Any condition-shaped synthetic demo is a **labelled demonstration scenario**, not the platform boundary.

## Must-contain → status

| Must contain | Status | Surface |
| --- | --- | --- |
| Approved research cohorts | **Demo slots disabled** + deep-link | `/enterprise/clinical` → `/research/cohort` |
| Disease phenotypes | **Demo sketches** | Passport honesty · workspace deep-link |
| Longitudinal laboratory observations | **Synthetic series labels** | Demo points only |
| Trial eligibility research | **Demo rows** + deep-link | `/research/prescreen` · science clinical-trials |
| Molecular-clinical associations | **Candidate · ≠ causation** | Workspace / KG / gaps deep-links |
| Ops enrollment charts | **Labelled demo bars** | No conversion / safety claims |

## Soft-land / wiring

| Route | Role |
| --- | --- |
| `/enterprise/clinical` | Clinical research shell (synthetic demo) |
| `/research/cohort` · `/research/prescreen` | Existing synthetic clinical plane |
| `/academic` · `/enterprise/biotech` | Cross-links |

Does **not** enable real patient data, PHI, live CDS, or EHR write-back. Soft-lands `#511`–`#512` stay owner-paused.

## Explicit non-goals

- Production writes or lifting migrations 022–033  
- PHI / identifiable patient uploads / live CDS / chart write-back  
- Invented enrollment conversion, safety rates, or eligibility decisions  
- Lab / community shells in this increment  
- Replacing the Stage 2 journey as the build centre  
