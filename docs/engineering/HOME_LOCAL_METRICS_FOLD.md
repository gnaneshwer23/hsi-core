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

## Implemented

- `#rh-metrics` fold titled **Local journey metrics**
- Dynamic subtitle from `buildHomeLocalMetricsSummary`: `Local milestones N/4 done · alert preference set|unset · not conversion · not pilot claims`
- Counts reuse pilot-readiness local signals only — never conversion % or pilot ready
- Playwright opens the fold before region asserts; asserts `0/4` on empty device

## Still mocked / partial / blocked

- No aggregate analytics dashboard
- No pilot conversion claims
- Server metrics absent

## Tests

- Unit: `test/homeLocalMetricsSummary.test.ts`
- Playwright `site/e2e/research-home.spec.ts` (fold closed by default; subtitle counts; cards visible when opened)
- Live investigation path expands `#rh-metrics` before milestone asserts

## Gates

No PHI · invents conversion false · invents conversion rate false · invents pilot claims false · production writes off.

## Success outcome

Researchers see one collapsed metrics section on Home with honest local counts in the subtitle; opening it still shows each honesty-labelled local milestone without inventing conversion.
