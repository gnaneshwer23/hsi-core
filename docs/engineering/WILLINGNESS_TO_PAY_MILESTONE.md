# Willingness-to-pay milestone (device-local)

**Date:** 19 November 2026  
**Surface:** `/research/home` + usefulness panel on `/research/workspace`  
**Doctrine:** Business vision execution audit — §H product metric / pilot “state willingness to pay (Y/N/maybe)”.

## User problem

Pilot success needs a **stated willingness** signal without inventing conversion rates, checkout, or revenue.

## USP advanced

Personal researcher experience — local commercial signal only.

## Reused

- Researcher usefulness panel (optional willingness buttons)
- Research Home metric cards (first useful / repeat usage pattern)
- Fail-closed honesty from Stage 2 exit metrics

## Implemented (this increment)

- `src/investigation/willingnessToPayMilestone.ts` — first-write-wins stated answer
- Records only when usefulness save includes yes / no / maybe
- `WillingnessToPayMilestoneCard` on Research Home
- Unit + Playwright

## Still mocked / partial / blocked

- No checkout / billing
- Not pilot conversion
- Not aggregate WTP rates
- Server analytics absent

## Tests

- `bun test test/willingnessToPayMilestone.test.ts`
- Playwright `site/e2e/research-home.spec.ts` + live usefulness path

## Gates

No PHI · invents aggregate conversion false · invents revenue false · checkout enabled false · pilot conversion claimed false · journey complete claimed false · production writes off.

## Success outcome

After the first Yes / No / Maybe willingness answer on a brief, Research Home shows that local milestone — without claiming conversion, revenue, or scientific approval.
