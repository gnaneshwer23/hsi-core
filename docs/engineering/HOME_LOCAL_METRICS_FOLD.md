# Research Home — local journey metrics fold

**Date:** 19 November 2026  
**Surface:** `/research/home`  
**Doctrine:** Business vision execution audit — reduce Home fragmentation after §H device-local metrics shipped.

## User problem

Activation, usefulness, reopen, willingness, and alert preference cards stacked as five always-open regions and competed with the primary research composition.

## USP advanced

Keeps personal Stage 2–3 metrics available without turning Research Home into a metrics dashboard.

## Reused

- Existing `Fold` / `<details>` pattern (`#rh-more`, `#rh-setup`)
- Existing metric cards (alert · activation · first useful · repeat · WTP)
- Profile → workspace handoff stays **outside** the fold (primary continuity)

## Implemented (this increment)

- `#rh-metrics` fold titled **Local journey metrics**
- Honesty subtitle: browser-only · not conversion · not pilot claims
- Playwright opens the fold before region asserts

## Still mocked / partial / blocked

- No aggregate analytics dashboard
- No pilot conversion claims
- Server metrics absent

## Tests

- Playwright `site/e2e/research-home.spec.ts` (fold closed by default; cards visible when opened)
- Live investigation path expands `#rh-metrics` before milestone asserts

## Gates

No PHI · invents conversion false · invents pilot claims false · production writes off.

## Success outcome

Researchers see one collapsed metrics section on Home; opening it still shows each honesty-labelled local milestone without inventing conversion.
