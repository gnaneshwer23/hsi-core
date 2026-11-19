# Alert preference honesty (Stage 3)

**Date:** 19 November 2026  
**Surface:** `/research/home` (+ honesty strip on workspace USP C connected panel)  
**Doctrine:** Business vision execution audit — Stage 3 researcher experience after Stage 2 spine.

## User problem

Stage 3 needs **alerts** as a real preference surface without inventing live email/push delivery or open-rate metrics.

## USP advanced

**USP C** personal connected path — preference engagement only (not org dashboards).

## Reused

- Researcher profile `cadence` (`off` / `weekly` / `daily`)
- Research radar (refreshes on open; not email)
- Device-local storage pattern from usefulness / USP C library

## Implemented (this increment)

- `src/investigation/alertPreferenceHonesty.ts` — honesty, local engagement log, panel state
- `AlertPreferenceCard` on Research Home
- USP C connected panel shows shared live-delivery honesty flags
- Unit + Playwright asserts

## Still mocked / partial / blocked

- Live email / push delivery off
- No digest send pipeline
- No invented open rates or conversion
- Org sharing / circles still blocked
- Durable server profile (023) held

## Tests

- `bun test test/alertPreferenceHonesty.test.ts`
- Playwright `site/e2e/research-home.spec.ts` (alert preference card)

## Gates

No PHI · preference only · live delivery false · email claimed false · invents open rates false · production writes off.

## Success outcome

A researcher can set update cadence on Research Home, see honest labels that delivery is not live, and have preference changes counted locally — without mistaking that for email alerts or engagement analytics.
