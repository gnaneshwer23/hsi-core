---
title: "16. Developer Handover and Operations Runbook"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **Clone, install with Bun 1.3.14, run `bun run check`.** If that passes, your environment is right.
- **Never point local work at production data.** The Neon guard refuses unpinned projects and branches; keep it that way.
- **Model keys are optional locally.** Fixture mode covers most work.
- **Read `AGENTS.md` before your first PR.** It holds the rules that every change must respect.

# 2. Repository at a glance

| Path | What lives there |
| --- | --- |
| `src/` | Core library: evidence, investigation, knowledge graph, server handlers, database access, clinical-plane synthetic code (526 TypeScript files) |
| `site/` | Vite + React app, prerender scripts, Vercel functions in `site/api/`, Playwright tests in `site/e2e/` |
| `db/migrations/` | SQL migrations 001 to 033 (022 to 033 held) |
| `test/` | Bun unit and integration tests (395 files); `test/python` parser tests |
| `scripts/` | Build, check, evaluation and release scripts |
| `research/` | Evidence packages (RA anti-TNF, SSc Tfh/IL-21), domain-graph inputs, ontology, fixtures |
| `evaluation/` | Benchmark protocol and scaffolding |
| `operations/` | Capability register, pilot, staging and release records |
| `docs/` | Architecture, ADRs, strategy, product and engineering documents |
| `.github/workflows/` | CI: hygiene, research foundation, production probe |

# 3. Local setup

```bash
git clone git@github.com:gnaneshwer23/hsi-core.git
cd hsi-core
bun install                 # Bun 1.3.14
cp .env.example .env        # fill only what you need
bun run check               # copy, status, typecheck, lint, tests, benchmark artifacts
bun run site:dev            # http://localhost:5173
bun run demo                # offline synthetic investigation (no network)
bun run research:api        # local research API
```

Database work:

```bash
# create a personal Neon branch from staging, then:
export HSI_DATABASE_URL=...      # branch connection string
bun run db:migrate               # guarded by project and branch pins
```

# 4. Key commands

| Command | Purpose |
| --- | --- |
| `bun run check` | Everything CI runs for the core |
| `bun test ./test` | Unit and integration tests |
| `bun run site:build` | Production build of the site and prerendered pages |
| `bun run --cwd site test:e2e` | Playwright end-to-end and axe |
| `bun run status:write` | Regenerate `docs/STATUS.md` from the capability register |
| `bun run domain-graph:build` / `:check` | Build or verify the published graph snapshot |
| `bun run outputs` | Versioned output bundle and graph build |
| `bun run live:doctor` | Check live model configuration |
| `bun run gold:check`, `readiness:check`, `pilot:check` | Evaluation and readiness scaffolding checks |

# 5. Environment variables (main ones)

| Variable | Purpose | Where |
| --- | --- | --- |
| `HSI_DATABASE_URL` / `DATABASE_URL` | Postgres connection | Server only |
| `HSI_NEON_PROJECT_ID`, `HSI_NEON_BRANCH_ID`, `HSI_NEON_HOST_ALLOWLIST` | Neon guard pins | Server only |
| `HSI_STAGING_DATABASE_URL`, `HSI_STAGING_APP_URL` | Staging targets | CI and staging |
| `HSI_AUTH_BASE_URL`, `VITE_HSI_AUTH_BASE_URL` | Neon Auth endpoints | Server and client |
| `HSI_PUBLIC_ORIGIN` | Allowed origin for browser writes | Server |
| `HSI_RESEARCH_WRITES_ENABLED` | Enables research writes | Server; off in production today |
| `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `HSI_OPENAI_MODEL`, `HSI_OPENAI_MODEL_2` | Model providers | Server only |
| `HSI_LIVE_MODEL_STEP_ENABLED`, `HSI_LIVE_MODEL_DAILY_RUNS` | Model step switch and daily ceiling | Server |
| `HSI_SHARED_ADMISSION_URL`, `HSI_SHARED_ADMISSION_SERVICE_KEY`, `HSI_PILOT_REQUIRE_SHARED_LIMITER` | Shared rate limiter | Server |
| `HSI_OPENALEX_CONTACT` | Polite-pool contact | Server |
| `HSI_RESEARCH_MAINTENANCE`, `HSI_OPERATIONAL_LOGGING` | Maintenance mode, structured logs | Server |

Never put a secret in a `VITE_` variable: those are compiled into the browser bundle.

# 6. Runbooks

## Investigation runs stuck

1. Check the run's stage events (`GET /api/v1/runs/{id}` once built; today the live trace).
2. Check provider status and error logs for the failing stage.
3. If the lease expired and the worker is healthy, the job requeues automatically; if attempts are exhausted, it is in the dead-letter state.
4. Fix the cause, then requeue from the admin script. Never edit outputs by hand.

## Evidence provider outage

1. Confirm with the provider's status page and the error rate alert.
2. Runs record `search_failed` for that provider; nothing is reported as "no evidence".
3. If the outage exceeds 2 hours, set a site banner; do not switch providers silently.

## Model provider failure or disagreement spike

1. A disagreement spike after a model update means a regression until proved otherwise: roll back the model ID.
2. Provider down: verification abstains; runs complete as `completed_partial`.
3. Spend alert: use the kill switch (`HSI_LIVE_MODEL_STEP_ENABLED=false`), then investigate.

## Failed migration

1. Stop: do not retry blindly.
2. Compare the production schema with the preview branch where it passed.
3. Apply the written rollback, or restore to the pre-migration point on a branch and promote it.
4. Record the incident and the fix in the PR.

## Tenant isolation alert

1. Disable research writes (`HSI_RESEARCH_WRITES_ENABLED=false`).
2. Preserve logs and the audit chain.
3. Identify affected rows and principals; notify the owner immediately.
4. Under UK GDPR, a personal-data breach may need reporting to the ICO within 72 hours; the owner decides with advice.

## Restore from backup

1. Create a Neon branch at the target point in time.
2. Verify row counts and the latest audit hash on the branch.
3. Promote or copy data back as decided; record the recovery time.

## Bad deploy

1. Vercel instant rollback to the previous production deployment.
2. Roll back the worker to the same commit.
3. If a migration shipped with the deploy, follow "Failed migration".

# 7. Handover checklist

| Item | Status to confirm on day one |
| --- | --- |
| GitHub access and branch protection on `main` | |
| Vercel project access (production, preview) | |
| Neon project access (main, staging, branch creation) | |
| Neon Auth admin | |
| Model provider consoles and spend caps | |
| Error tracking and log drain (once OPS-01 lands) | |
| Domain and DNS for humansuperintelligence.tech | |
| Password manager entry for every credential; no credentials in chat or email | |
| Read: this pack, `AGENTS.md`, `docs/STATUS.md`, ADR-009, ADR-0010 | |
| Known risks reviewed: held migrations, public repo, no observability, per-instance limits | |

# 8. Ownership

| Area | Owner today | Backup |
| --- | --- | --- |
| Product and scientific release | Dr Gnaneshwer Jadav | – |
| Engineering | Engineer (to be named) | Founder |
| Expert review | Founder (interim) and two external reviewers (to be named) | – |
| Security review | To be contracted | – |
| Clinical safety | Not applicable until the clinical plane exists | – |
