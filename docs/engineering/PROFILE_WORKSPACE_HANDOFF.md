# Profile → workspace handoff

**Date:** 19 November 2026  
**Surface:** `/welcome` → `/research/home` → `/research/workspace`  
**Doctrine:** Business vision execution audit — Next five PRs item **4**.

## User problem

After Welcome, researchers need a continuous path into the live investigation workspace using the interests and question they just set — without a durable server profile or production writes.

## USP advanced

**USP C** (personal continuity).

## Reused

- Welcome device-local profile (`saveProfile` / `hsi-research-profile-v1`)
- Research Home Ask + scenario matching
- Live workspace Ask strip + USP C connected panel
- Onboarding profile client fail-closed mode (023 held)

## Implemented (this increment)

- Pure handoff helper: `src/investigation/profileWorkspaceHandoff.ts`
- Research Home activation card after onboarded profile
- Welcome finish also offers **Finish and open live investigation** when ready
- Workspace Ask strip shows profile question/interests when `?from=profile` (or onboarded)
- Honesty: device-local only; durable server profile not claimed; no auto-run

## Still mocked / partial / blocked

- Durable server profile (023) held
- Live runs still curated-scenario only
- Org sharing / live alerts not enabled
- Production writes off

## Tests

- `bun test test/profileWorkspaceHandoff.test.ts`
- Playwright `site/e2e/welcome.spec.ts` (Welcome → Home → workspace handoff)

## Gates

No PHI · no 023 lift · no production writes · interests not invented · Run still explicit.

## Success outcome

A researcher can finish Welcome, see their question/interests on Research Home, open the live workspace with that continuity visible, and press Run only when they choose — with honest labels that the profile is device-local.
