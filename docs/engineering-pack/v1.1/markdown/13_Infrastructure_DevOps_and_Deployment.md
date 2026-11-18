---
title: "13. Infrastructure, DevOps and Deployment"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **Hosting stays on Vercel (site and API functions) and Neon (Postgres and Auth).** Add one small always-on worker for jobs.
- **Four environments with separate credentials and databases:** local, preview (per PR, Neon branch), staging, production.
- **Observability is the first infrastructure gap to close.** Today there is no error tracking, tracing, log drain or alerting.
- **Every production change is reversible:** Vercel instant rollback for code, Neon point-in-time restore for data, both rehearsed.

# 2. Where we are

| Item | Status | Detail |
| --- | --- | --- |
| Vercel project | Built | `site/vercel.json`: security headers, rewrites, `maxDuration: 30` for `api/**/*.ts` |
| Neon project | Built | HSI project pinned (`HSI_NEON_PROJECT_ID`, branch pins, host allow-list in `src/db/neonGuard.ts`) |
| CI: repository hygiene | Built | `.github/workflows/p0-repository-hygiene.yml`: gitleaks full history; generated status matches register |
| CI: research foundation | Built | `.github/workflows/research-foundation.yml`: install, build, `bun audit`, `bun run check` (copy, status, typecheck, lint, tests, benchmark artifacts), Python parser tests, site typecheck and build, Playwright, Lighthouse lab |
| CI: production probe | Built | `.github/workflows/production-probe.yml`: every 30 minutes and after push to main |
| Staging | Partial | Staging URLs and branch pins exist; no accepted two-account staging evidence |
| Worker host | Not started | Same-host reference worker only |
| Observability | Partial (A1.3 soft-land) | Four alerts documented + staging dry-run worksheet; live Sentry/log drain/on-call delivery still pending (D-120/D-122) |
| Backups and restore | Partial | Neon PITR available by plan; no rehearsed restore |
| Runbooks | Partial | Scattered across `docs/`; see document 16 |

# 3. Environments

| Environment | Site | Database | Model keys | Who uses it |
| --- | --- | --- | --- | --- |
| Local | `bun run site:dev` | Local Postgres or a personal Neon branch | Optional, own keys | Engineer |
| Preview | Vercel preview per PR (noindex) | Neon branch per PR | None (fixture mode) | Review |
| Staging | Fixed staging URL | Neon staging branch | Staging keys with low caps | Owner, reviewers, isolation tests |
| Production | humansuperintelligence.tech | Neon main | Production keys with caps | Researchers |

# 4. Delivery pipeline

```text
PR opened
  -> lint, typecheck, unit tests (bun run check)
  -> build site and API
  -> migration check on a Neon preview branch
  -> tenant isolation suite (once DB-02 exists)
  -> Playwright end-to-end and axe
  -> Lighthouse lab and bundle budgets
  -> human review and merge
main
  -> Vercel production deploy
  -> production probe
  -> worker deploy (same commit SHA)
```

Rule: no deploy with failing required checks. Migrations are applied by a manual, logged step, never automatically on merge.

# 5. Observability

| Signal | Tool (recommended) | What to capture |
| --- | --- | --- |
| Errors | Sentry or equivalent | Front end and API errors with release tag; PII scrubbing on |
| Logs | Vercel log drain to a log store | Structured JSON events (`hsi-research-http-event-1` already defined); request ID; route group; status; duration |
| Run metrics | Postgres tables + dashboard | Runs started, completed, failed by stage; provider error rates; model calls and cost per run |
| Uptime | Existing production probe + an external uptime check | `/api/health` and the home page |
| Alerts | Email or Slack | Error spike, run failure rate > 20% over 1 hour, model spend > 80% of daily cap, probe failure |

Product analytics (privacy-preserving, no cross-site tracking): onboarding completion, first investigation, brief exports, weekly active researchers.

# 6. What to build next

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| OPS-01 | Error tracking and log drain | Errors visible with release tags; a test error appears within 1 minute |
| OPS-02 | Alerts | Four alerts in section 5 configured and tested by forcing each |
| OPS-03 | Worker host and deploy | Worker deploys from the same commit; health endpoint; restarts resume jobs (ARCH-11) |
| OPS-04 | Staging environment acceptance | Two real accounts in different scopes; isolation suite green on staging |
| OPS-05 | Restore drill | PITR restore to a branch; time recorded; documented |
| OPS-06 | Rollback drill | Vercel rollback of a deliberate bad deploy; time recorded |
| OPS-07 | Cost dashboard | Monthly spend by provider (Vercel, Neon, models) visible to the owner |
| OPS-08 | Pilot soak | 14 days on staging with scheduled runs; no unrecovered failures |

# 7. Future options

- Infrastructure as code for Vercel and Neon settings once there is more than one engineer.
- Move `vercel.json` to `vercel.ts` if the platform's typed config helps.
- A UK-region deployment for the clinical plane (separate project, separate accounts).

# 8. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-120 | Error tracking vendor | Sentry free or team tier; EU data region |
| D-121 | Worker host | See D-10 in document 02 |
| D-122 | On-call | Owner plus engineer, business hours during pilot; documented escalation |
