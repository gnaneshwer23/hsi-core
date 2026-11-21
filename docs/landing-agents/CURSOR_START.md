# Cursor kickoff — HSI public website agents

Paste into Cursor Agent mode (or ask the orchestrator by its agent name):

> Operate the HSI public-website agent team defined in `.cursor/agents/`, following `AGENTS.md`, `PRODUCT.md`, `DESIGN.md` and `docs/landing-agents/README.md`. Start by auditing the current working tree, routes, assets and tests; reconcile the live production site with the current commit. Invoke specialist roles in order: positioning, scientific copy, UX, experience architecture, frontend engineering, independent QA. Produce an evidence-backed backlog and implement the first highest-impact **public-site-only** improvement in one small PR. Preserve the six HSI scientific domains and the existing graph/verification/workbench foundations. No backend, database, model/runtime, credentials, PHI, science governance or production deployment changes. Never invent capabilities or statuses. Run fresh build, public Playwright tests, axe and visual viewport checks. Stop at owner approval for final landing visuals and merging.

## First task acceptance criteria
1. Capture current desktop and mobile public screenshots at matching revision.
2. Write audit findings with source paths, reproducible issues and evidence.
3. Identify 3 highest-value presentation/journey improvements, with a single one selected for PR1.
4. PR1 changes only public files, adds/regresses tests, respects the established design canon.
5. Record test commands and actual pass/fail, screenshot comparisons, and explicit owner sign-off needed.
6. If the build or browser is unavailable, document the blocker; do not call checks passed.

## Local verification baseline
```sh
cd site
bun run build
bun run test:e2e -- e2e/landing-pages.spec.ts e2e/stage2-integrated-qa.spec.ts e2e/seo.spec.ts e2e/approved-website.spec.ts e2e/demo-universe-landing.spec.ts
```
Inspect `site/package.json` before assuming any additional scripts. Test browser interactions including graph unavailable/fallback states, demo synthetic labels, responsive navigation and access CTAs.

## Required output on every agent handoff
Finding / source file or captured evidence / recommended change / why it improves research comprehension / affected route / risks / acceptance criterion / owner required.
