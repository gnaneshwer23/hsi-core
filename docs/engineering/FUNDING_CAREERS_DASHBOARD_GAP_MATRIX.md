# Funding & Careers Dashboard — implementation gap matrix

**Date:** 19 November 2026 (Europe/London)  
**Scope:** Stage 4 shell H — funding sketches, career pathways and collaborator discovery on the shared science engine.  
**Content contract:** [`../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md`](../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md)  
**Visual language:** Shared `enterprise-dashboard.css`.

**Hard rules:** Illustrative only · durable funding/org store **held** · no invented award rates or conversion % · permission-aware collaborators · no automatic IP bleed · not CDS · no PHI · seats ≠ scientific clearance.

## Must-contain → status

| Must contain | Status | Surface |
| --- | --- | --- |
| Funding sketches | **Illustrative** · store held | `/enterprise/funding` |
| Career pathways | **Proposed / not enabled** | Welcome · student shell |
| Collaborator discovery | **Permission-aware demos** | Community · biotech · lab |
| Candidate questions | **Unreviewed** + deep-link | Gaps · community |

## Soft-land / wiring

| Route | Role |
| --- | --- |
| `/enterprise/funding` | Funding & Careers shell (demo) |
| `/academic` · `/enterprise/*` | Existing A–G shells |

Does **not** enable live funder feeds, grant applications, billing, or durable funding writes.

## Explicit non-goals

- Live funder APIs or eligibility engines  
- Invented award / conversion / success percentages  
- Placement marketplace / HR workflows  
- Automatic IP bleed or confidential portfolio unlock  
- PHI / live CDS  
