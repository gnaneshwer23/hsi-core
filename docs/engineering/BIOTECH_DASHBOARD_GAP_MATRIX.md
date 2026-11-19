# Biotech / Pharma Research Dashboard — implementation gap matrix

**Date:** 19 November 2026 (Europe/London)  
**Scope:** Stage 4 Biotech / Pharma Dashboard shell on the shared science engine.  
**Content contract:** [`../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md`](../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md)  
**Visual language:** Shared `enterprise-dashboard.css` (navy / burgundy / teal / off-white).

**Disease scope:** HSI is **disease-agnostic**. Any cytokine / pathway demo focus is a **labelled demonstration scenario**, not the platform boundary.

**Stakeholder scope:** Biotech/Pharma is the second of five Stage 4 audience shells. Clinical research ≠ CDS; no PHI. Company-confidential programmes never auto-share.

## Must-contain → status

| Must contain | Status | Surface |
| --- | --- | --- |
| Target intelligence | **Demo list** + deep-link | `/enterprise/biotech` → `/research/targets` · `/research/workspace` |
| Mechanism validation | **Honesty-labelled** fail-closed | Demo copy · passport via live investigation |
| Therapeutic landscape | **Schematic tree** | Domain-filter map · KG deep-link |
| Competitor programmes | **Illustrative only** | Explicit `illustrative_only` status; no invented pipelines |
| Biomarkers | **Candidate-labelled** | Demo rows; not clinical biomarkers |
| Translational gaps | **Demo list** + deep-link | `/research/gaps` · workspace |
| Research portfolio decisions | **Personal brief path** | Human-review required; org portfolio held |

## Soft-land / wiring

| Route | Role |
| --- | --- |
| `/enterprise/biotech` | Biotech / Pharma R&D shell (demo) |
| `/biotech` | Public marketing audience page (unchanged) |
| `/academic` | Cross-link to Academic shells |

Does **not** rewrite `/research/workspace` as the primary investigation path. Soft-lands `#511`–`#512` stay owner-paused. Does **not** ship the full eight-workspace hub from `#514`.

## Explicit non-goals

- Production writes or lifting migrations 022–033  
- PHI / identifiable patient uploads / live CDS  
- Invented pipeline stages, competitor success rates, approval status as truth  
- Auto-sharing company-confidential programmes  
- Clinical / lab / community shells in this increment  
- Replacing the Stage 2 journey as the build centre  
