# Testable next questions (journey step 9)

**Date:** 19 November 2026  
**Surface:** `/research/workspace`  
**Doctrine:** Business vision execution audit — Stage 2 journey step 9 after usefulness metric.

## User problem

After evidence, disagreement, cross-domain paths and gaps, researchers need **testable next questions** with prediction / experiment / falsifier — without invented experiments or action recommendations.

## USP advanced

Supports USP A/B closure toward a decision brief by making uncertainty **testable** (still demoted / unvalidated).

## Reused

- `deriveRunGaps` next-step text
- Live-run unvalidated hypotheses (prediction, experiment, falsifier, second-model challenge)
- Hypothesis Ledger handoff
- Unified Stage 2 trail honesty pattern

## Implemented (this increment)

- `src/investigation/testableNextQuestions.ts` — pack builder + honesty asserts
- `TestableNextQuestionsPanel` on the workspace (after gaps)
- Unit + Playwright honesty asserts

## Still mocked / partial / blocked

- Optional planner remains disabled
- Hypotheses only appear when the two-model check ran
- No scientific approval; items stay demoted
- No clinical / treatment advice
- SME ranking of gaps still owner/human track

## Tests

- `bun test test/testableNextQuestions.test.ts`
- Playwright `site/e2e/live-investigation.spec.ts` (testable panel)

## Gates

No PHI · invents experiments false · recommends action false · scientific approval false · clinical advice false · journey complete claimed false.

## Success outcome

A researcher can read demoted, run-derived next questions (gap next-steps + unvalidated hypotheses with falsifiers) before the brief, without mistaking them for approved experiments or recommendations.
