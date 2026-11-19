# Blocked journey steps 12–13 honesty

**Date:** 19 November 2026  
**Surface:** `/research/workspace`  
**Doctrine:** Business vision execution audit — Stage 2 exit covers steps 1–11; 12–13 stay blocked.

## User problem

Researchers need an honest answer for **share with collaborator** and **versioned re-evaluation** without HSI inventing org sharing or live source-refresh re-review.

## USP advanced

Keeps USP C personal continuity (browser reopen) while refusing premature Stage 4 org / refresh claims.

## Reused

- USP C browser library / reopen path
- Stage 2 completion checklist boundary (1–11)
- Audit blockers: sharing authority, source re-review packet

## Implemented (this increment)

- `src/investigation/blockedJourneyStepsHonesty.ts`
- `BlockedJourneyStepsPanel` on the workspace
- Unit + Playwright honesty asserts

## Still mocked / partial / blocked

- Org sharing / collaborator links off
- Live source-refresh re-review unaccepted
- Prior approvals do not transfer
- Stage 4 research-group shells remain demos (#513/#514)

## Tests

- `bun test test/blockedJourneyStepsHonesty.test.ts`
- Playwright `site/e2e/live-investigation.spec.ts` (blocked steps panel)

## Gates

No PHI · org sharing false · collaborator links false · live refresh accepted false · prior approvals transfer false · invents sharing authority false · production writes off · journey complete claimed false.

## Success outcome

A researcher can read why steps 12–13 are blocked, what browser reopen offers instead, and which authorities are still required — without mistaking personal save/reopen for sharing or live re-evaluation.
