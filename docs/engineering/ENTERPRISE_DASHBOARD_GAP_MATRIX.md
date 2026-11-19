# HSI Enterprise dashboards — implementation gap matrix

**Date:** 19 November 2026 (Europe/London)  
**Scope:** Professor + Student research-intelligence dashboards (PR sequence).  
**References:** Written brief (navy / burgundy / teal / off-white). Supplied professor/student infographic image files were **not present** in this agent workspace; PR1 follows the written palette and reuses HSI tokens.

**Disease scope:** HSI is **disease-agnostic**. Any autoimmune / SSc / CD40 demo copy in PR1 shells is a **labelled demonstration scenario**, not the platform boundary. Doctrine: [`../strategy/HSI_END_TO_END_VISION_AND_TECHNOLOGY_ARCHITECTURE.md`](../strategy/HSI_END_TO_END_VISION_AND_TECHNOLOGY_ARCHITECTURE.md).

**Stakeholder scope:** Eight connected demo views on one engine via `/workspaces` (researcher, professor, student, biotech, clinical, laboratory, community, enterprise admin). Clinical cohorts stay disabled. Patient participation remains a future separate governed path. Roles ≠ subscriptions — see architecture doc §7.

## Gap matrix

| Capability | Status | Notes |
| --- | --- | --- |
| Individual research dashboard (`/research/dashboard`) | **Implemented** | Honesty via `classifyDashboardAccess`; not a professor/student shell |
| Investigation workspace / KG / Context Passport | **Implemented** (UI) | Reuse; durable writes still fail-closed / held migrations |
| Auth + research grants | **Partial** | Neon Auth + `hsi_research_access`; no professor/student RBAC |
| Onboarding researcher profile | **Partial** | Device-local default; server path fail-closed; **023 held** |
| Org / department / research-group models | **Simulated** | `researchOrganisationTenantSecurity.ts` contracts + memory store; no applied Neon schema |
| Project assignment / Research Circles | **Absent** (product) | Community feed demos only; 023 held |
| Opportunity radar / related works | **Partial** | Existing radar + `/api/research/related-works`; no enterprise feed |
| Patient cohorts | **Simulated + PHI boundary** | Synthetic clinical plane only — **no PHI** |
| Professor / Student premium shells | **Absent → PR1** | This increment |
| Durable enterprise persistence / production writes | **Blocked** | Held migrations 022–033; owner gates |

## Soft-land PRs (do not conflict if additive)

Open honesty soft-lands `#508`–`#512` are catalog/docs/tests. PR1 adds `/enterprise/*` routes only; does not rewrite primary investigation path or lift holds.

## PR1 deliverables

| Route | Role |
| --- | --- |
| `/enterprise` | Role picker / honesty landing |
| `/enterprise/professor` | Professor group-intelligence shell (demo-labelled) |
| `/enterprise/student` | Student personal workspace shell (demo-labelled) |

## Explicit non-goals (this PR)

- Enabling production writes or lifting migrations 022–033  
- PHI / identifiable patient uploads  
- Invented papers, confidence %, scientific discoveries  
- Auto-merging this PR (human review required)  
- Replacing `/research/workspace` as the primary investigation path  
