# Research Participant contribution shell — implementation gap matrix

**Date:** 19 November 2026 (Europe/London)  
**Scope:** Stage 4 shell G — research participant contribution preview (separate governed path).  
**Content contract:** [`../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md`](../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md)  
**Visual language:** Shared `enterprise-dashboard.css`.

**Hard rules:** Not a scientific dashboard · not CDS · **no PHI** · synthetic / disabled only · no invented enrollment/conversion/safety metrics · real path blocked on ADR-0010 clinical-plane gates.

## Must-contain → status

| Must contain | Status | Surface |
| --- | --- | --- |
| Consent sketches | **Disabled demo** | `/enterprise/participant` |
| Contribution channels | **Disabled** · deep-link only | Cohort / methods / contact |
| Study update sketches | **Proposed / not enabled** | Explicit inventedEnrollmentPercent: false |
| Plane boundary copy | **Wired** | Clinical shell · workspace · ADR-0010 |

## Soft-land / wiring

| Route | Role |
| --- | --- |
| `/enterprise/participant` | Participant contribution preview (demo) |
| `/enterprise/clinical` | Clinical research shell (synthetic; not CDS) |
| `/workspaces` | Multi-workspace hub (F) |

Does **not** enable real consent capture, participant messaging, PHI storage or clinical-plane writes.

## Explicit non-goals

- Live consent / eSignature / identity verification  
- PHI, PGHD or EHR write-back in `hsi-core`  
- CDS / bedside eligibility / safety claims  
- Invented enrollment or conversion percentages  
- Treating this shell as a scientific investigation dashboard  
