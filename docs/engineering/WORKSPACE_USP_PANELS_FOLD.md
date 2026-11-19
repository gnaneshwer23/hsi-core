# Workspace — USP focus panels fold

**Date:** 19 November 2026  
**Surface:** `/research/workspace`  
**Doctrine:** Business vision execution audit — reduce workspace fragmentation after USP A/B/C panels shipped.

## User problem

Disagreement, curated demo, and cross-domain panels stacked under the Stage 2 spine and competed with save continuity.

## USP advanced

Keeps USP A/B depth available without pushing personal USP C save/reopen off the primary path.

## Reused

- Existing `ws-usp-focus` details pattern (trails fold)
- UspA / Curated / UspB panels
- UspC connected panel stays **outside** the fold (save/reopen continuity)

## Implemented (this increment)

- `#ws-usp-panels` fold: A disagreement · curated pack · B cross-domain
- Honesty subtitle: not journey complete · not scientific approval
- Playwright opens the fold before A/B/curated asserts

## Still mocked / partial / blocked

- Journey complete still false
- Scientific approval still false
- Org sharing still blocked
- Production writes off

## Tests

- Playwright `site/e2e/live-investigation.spec.ts`

## Gates

No PHI · journey complete claimed false · scientific approval false · production writes off.

## Success outcome

Researchers follow the unified trail and can save/reopen via USP C without scrolling past three always-open USP panels; A/B/curated remain one click away.
