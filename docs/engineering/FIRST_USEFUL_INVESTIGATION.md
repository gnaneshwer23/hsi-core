# First useful investigation (device-local)

**Date:** 19 November 2026  
**Surface:** `/research/home` + usefulness save on `/research/workspace`  
**Doctrine:** Business vision execution audit — §H product metric after steps 12–13 honesty.

## User problem

Audit metrics ask for **first useful investigation** without inventing conversion funnels or pilot success rates.

## USP advanced

Personal USP C continuity — first useful is a device milestone, not org analytics.

## Reused

- Researcher usefulness ratings (`useful` only)
- Research Home activation cards
- Fail-closed honesty from Stage 2 exit metrics

## Implemented (this increment)

- `src/investigation/firstUsefulInvestigation.ts` — first-write-wins store + milestone view
- Records only when usefulness rating is `useful`
- `FirstUsefulInvestigationCard` on Research Home
- Usefulness panel records the milestone on save
- Unit + Playwright

## Still mocked / partial / blocked

- No aggregate conversion dashboards
- Not pilot conversion
- Journey complete still false
- Server analytics absent

## Tests

- `bun test test/firstUsefulInvestigation.test.ts`
- Playwright `site/e2e/research-home.spec.ts` + live usefulness path

## Gates

No PHI · invents aggregate conversion false · invents activation funnel false · pilot conversion claimed false · journey complete claimed false · production writes off.

## Success outcome

After the first Useful rating on a brief, Research Home shows that local milestone — without claiming conversion, funnel rates, or scientific approval.
