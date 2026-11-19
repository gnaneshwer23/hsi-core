# Unified scientific investigation journey trail

**Date:** 19 November 2026  
**Surface:** `/research/workspace`  
**Doctrine:** Business vision execution audit — Stage 2 spine after Next-5 productization.

## User problem

USP A/B/C pieces landed as separate trails. Researchers still need **one** progressive Ask → evidence → passport → disagreement → cross-domain → gaps → brief → save path.

## USP advanced

Stage 2 journey cohesion across **USP A**, **USP B**, and personal **USP C** save continuity.

## Reused

- USP A/B/C trail helpers and workspace panels
- Live run, comparison, cross-domain paths, gaps, brief preview, browser library
- Fail-closed honesty flags from the audit

## Implemented (this increment)

- Eight-step unified trail: `src/investigation/unifiedJourneyTrail.ts`
- Primary workspace nav above the USP focus trails
- USP A/B/C trails folded under “USP focus trails” so the spine stays primary
- Follow-on: USP A/B/curated **panels** folded under `#ws-usp-panels` (USP C save panel stays open) — see `WORKSPACE_USP_PANELS_FOLD.md`
- Follow-on: Gaps + testable questions under `#ws-gaps-testable` — see `WORKSPACE_GAPS_TESTABLE_FOLD.md`
- Follow-on: Stage 2 checklist + blocked 12–13 under `#ws-stage2-exit` — see `WORKSPACE_STAGE2_EXIT_FOLD.md`
- Unit + Playwright honesty asserts (`researcherJourneyCompleteClaimed: false`)

## Still mocked / partial / blocked

- Journey complete **not** claimed
- Production writes off; browser save only
- Scientific gold / SME adjudication absent
- Org sharing (step 12) out of scope
- NEXT-A/B live composition still owner-gated

## Tests

- `bun test test/unifiedJourneyTrail.test.ts`
- Playwright `site/e2e/live-investigation.spec.ts` (unified trail)

## Gates

No PHI · no production writes · no invented context · potential contradiction ≠ proven · journey complete claimed false.

## Success outcome

A researcher can follow one continuous Stage 2 trail on `/research/workspace` from Ask through browser save, with USP-specific trails available as secondary focus without fragmenting the page.
