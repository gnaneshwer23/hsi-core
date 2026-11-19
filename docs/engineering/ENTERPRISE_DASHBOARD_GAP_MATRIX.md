# Academic Research Dashboard — implementation gap matrix

**Date:** 19 November 2026 (Europe/London)  
**Scope:** Stage 4 Academic Research Dashboard — professor + student shells on the shared science engine.  
**Content contract:** [`../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md`](../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md)  
**Visual language:** Navy / burgundy / teal / off-white (scoped `enterprise-dashboard.css`).

**Disease scope:** HSI is **disease-agnostic**. Any autoimmune / SSc / CD40 demo copy in these shells is a **labelled demonstration scenario**, not the platform boundary.

**Stakeholder scope:** Academic is the first of five Stage 4 audience shells (Academic, Biotech/Pharma, Clinical research, Lab/Omics, Community). Others remain proposed. Clinical research ≠ CDS; no PHI.

## Must-contain → status

| Must contain | Status | Surface |
| --- | --- | --- |
| Researcher profiles | **Partial** — device-local onboarding; server **023 held** | Student shell + `/welcome` / `/research/home` |
| Group intelligence trees | **Demo** | Professor tree + domain filter |
| Cross-domain discoveries | **Demo radar** + deep-link to live USP B / KG | Professor opportunities → `/research/workspace` |
| Evidence gaps | **Demo list** + deep-link | `/research/gaps` · workspace gaps fold |
| Publications | **Demo feed only** — no invented impact metrics | Student publication workspace panel |
| Funding and supervision | **Demo-labelled** until durable org store | Student supervisor string · professor funding placeholder |

## Soft-land / wiring

| Route | Role |
| --- | --- |
| `/academic` · `/enterprise` | Academic role picker / honesty landing |
| `/enterprise/professor` | Professor group-intelligence shell (demo) |
| `/enterprise/student` | Student personal workspace shell (demo) |

Does **not** rewrite `/research/workspace` as the primary investigation path. Soft-lands `#511`–`#512` stay owner-paused.

## Explicit non-goals

- Production writes or lifting migrations 022–033  
- PHI / identifiable patient uploads / live CDS  
- Invented papers, confidence %, conversion, funding totals as truth  
- Biotech / clinical / lab / community shells in this increment  
- Replacing the Stage 2 journey as the build centre  
