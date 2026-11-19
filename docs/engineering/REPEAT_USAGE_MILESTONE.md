# Repeat usage milestone (device-local)

**Date:** 19 November 2026  
**Surface:** `/research/home` + workspace reopen paths  
**Doctrine:** Business vision execution audit — §H product metric *repeat usage* / pilot “reopen once”.

## User problem

Audit and pilot success need a **first reopen** signal without inventing retention rates, DAU, or conversion funnels.

## USP advanced

USP C personal save/reopen continuity — local milestone only.

## Reused

- Browser live-run library reopen (`useLiveRun`)
- Research Home metric cards (first useful pattern)
- Fail-closed honesty from Stage 2 exit metrics

## Implemented (this increment)

- `src/investigation/repeatUsageMilestone.ts` — first-write-wins reopen record
- Wired into `useLiveRun` reopen / reopenFromLibrary
- `RepeatUsageMilestoneCard` on Research Home
- Unit + Playwright

## Still mocked / partial / blocked

- No retention / DAU dashboards
- Not pilot conversion
- Server analytics absent
- Org sharing still blocked

## Tests

- `bun test test/repeatUsageMilestone.test.ts`
- Playwright `site/e2e/research-home.spec.ts` + live reopen path

## Gates

No PHI · invents retention metrics false · invents aggregate conversion false · pilot conversion claimed false · journey complete claimed false · production writes off.

## Success outcome

After the first browser reopen of a saved investigation, Research Home shows that local milestone — without claiming retention or pilot success.
