# Activation milestone (device-local)

**Date:** 19 November 2026  
**Surface:** `/research/home` + live investigation start on `/research/workspace`  
**Doctrine:** Business vision execution audit — §H product metric *activation*.

## User problem

Audit metrics need a **first live investigation** signal without inventing activation funnels or conversion rates.

## USP advanced

Personal researcher activation into the Stage 2 journey — local milestone only.

## Reused

- `useLiveRun` successful start
- Research Home metric cards (first useful / repeat usage pattern)
- Fail-closed honesty from Stage 2 exit metrics

## Implemented (this increment)

- `src/investigation/activationMilestone.ts` — first-write-wins live-run record
- Wired into `useLiveRun` after a successful live investigation response
- `ActivationMilestoneCard` on Research Home
- Unit + Playwright

## Still mocked / partial / blocked

- No activation funnel dashboards
- Not aggregate conversion
- Not pilot conversion
- Server analytics absent

## Tests

- `bun test test/activationMilestone.test.ts`
- Playwright `site/e2e/research-home.spec.ts` + live investigation path

## Gates

No PHI · invents activation funnel false · invents aggregate conversion false · pilot conversion claimed false · journey complete claimed false · production writes off.

## Success outcome

After the first successful live investigation on a device, Research Home shows that local activation milestone — without claiming funnels, conversion, or scientific approval.
