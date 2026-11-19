# Researcher usefulness feedback (device-local)

**Date:** 19 November 2026  
**Surface:** `/research/workspace` (after Research decision brief)  
**Doctrine:** Business vision execution audit — Stage 2 exit metric after unified journey spine.

## User problem

Stage 2 exit needs **researcher-rated usefulness** (and an optional willingness signal) without inventing pilot conversion, aggregate dashboards, or production writes.

## USP advanced

Supports measuring Stage 2 usefulness for USP A/B/C journeys already on the workspace — not a new USP shell.

## Reused

- Unified Stage 2 trail + decision brief panel
- Browser-local storage pattern from USP C live-run library
- Audit §H product metrics (usefulness · willingness) — local capture only

## Implemented (this increment)

- `src/investigation/researcherUsefulnessFeedback.ts` — honesty, upsert by `briefHash`, panel state
- `ResearcherUsefulnessPanel` after the brief on `/research/workspace`
- Ratings: useful / partially useful / not useful
- Optional willingness: yes / no / maybe (skippable)
- Unit + Playwright honesty asserts

## Still mocked / partial / blocked

- No server analytics, no aggregate conversion rates
- Not a pilot packet; `pilotConversionClaimed: false`
- Journey complete still not claimed
- Production writes off
- SME / scientific usefulness scores remain Stage 5 human track

## Tests

- `bun test test/researcherUsefulnessFeedback.test.ts`
- Playwright `site/e2e/live-investigation.spec.ts` (usefulness panel)

## Gates

No PHI · no invented aggregates · no checkout · production writes off · journey complete claimed false · pilot conversion claimed false.

## Success outcome

After a brief, a researcher can save a usefulness rating (and optional willingness signal) for that `briefHash` in the browser, reopen the same run later, and still see the prior local rating — without claiming scientific approval or pilot conversion.
