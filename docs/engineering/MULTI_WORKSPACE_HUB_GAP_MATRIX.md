# Multi-workspace hub — implementation gap matrix

**Date:** 19 November 2026 (Europe/London)  
**Scope:** Stage 4 shell F — multi-workspace Research Intelligence hub on the shared science engine.  
**Content contract:** [`../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md`](../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md)  
**Visual language:** Shared `enterprise-dashboard.css` (+ `ws-*` hub tokens).

**Hard rules:** Demo-labelled · roles ≠ subscriptions · clinical cohorts disabled · no PHI · no confidential auto-unlock · professor cannot see private student notes · no production org writes.

## Must-contain → status

| Must contain | Status | Surface |
| --- | --- | --- |
| Workspace selector hub | **Demo** | `/workspaces` |
| Eight role concept views | **Demo packets** | `/workspaces/{researcher,professor,student,biotech,clinical,laboratory,community,enterprise}` |
| Deep-links to Stage 4 A–E shells | **Wired** | `stage4ShellPath` → `/enterprise/*` · `/academic` |
| Individual researcher shell | **Demo only** (no separate A–E shell) | `/workspaces/researcher` |
| Enterprise admin shell | **Demo only** · seats ≠ clearance | `/workspaces/enterprise` |
| Shared engine deep-links | **Wired** | `/research/workspace` · KG · dashboard |

## Soft-land / wiring

| Route | Role |
| --- | --- |
| `/workspaces` | Hub (shell F) |
| `/workspaces/*` | Eight-role concept dashboards |
| `/enterprise/*` · `/academic` | Soft-landed audience shells A–E |

Does **not** merge conflicting historical PR #514 wholesale; soft-lands the hub concept on `main` beside A–E.

## Explicit non-goals

- Production organisation / Circles durable stores  
- Subscription unlock of confidential science  
- Live clinical cohorts / PHI / CDS  
- Forked per-stakeholder science engines  
- Replacing the Stage 2 journey as the build centre  
