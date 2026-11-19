# Stage 2 investigation completion checklist

**Date:** 19 November 2026  
**Surface:** `/research/workspace`  
**Doctrine:** Business vision execution audit — §H product metric *investigation completion* after Stage 3 alerts.

## User problem

Researchers (and the product) need a clear **local Stage 2 progress** signal without claiming the journey is scientifically complete or pilot-accepted.

## USP advanced

Closes the Stage 2 exit metric loop across USP A/B/C personal path (run → brief → save → usefulness).

## Reused

- Unified journey trail state
- Live brief / gaps / testable questions / browser library / usefulness store
- Fail-closed honesty pattern from prior journey PRs

## Implemented (this increment)

- `src/investigation/stage2CompletionChecklist.ts` — seven-item checklist + honesty
- `Stage2CompletionChecklistPanel` on the workspace
- Unit + Playwright asserts (`journeyCompleteClaimed: false` even when all done)

## Still mocked / partial / blocked

- Journey complete **never** claimed from this panel
- Not pilot acceptance; not scientific approval
- Steps 12–13 (share / live re-review) remain blocked
- Owner-gated NEXT-A/B / SME vault / staging grants still required for true Stage 2 exit

## Tests

- `bun test test/stage2CompletionChecklist.test.ts`
- Playwright `site/e2e/live-investigation.spec.ts` (checklist honesty)

## Gates

No PHI · journey complete claimed false · scientific approval false · production writes off · invents aggregate conversion false · pilot accepted false · local progress only.

## Success outcome

A researcher can see which Stage 2 items are done for the current `briefHash` and jump to unfinished ones — with explicit copy that full local progress still does **not** claim journey complete.
