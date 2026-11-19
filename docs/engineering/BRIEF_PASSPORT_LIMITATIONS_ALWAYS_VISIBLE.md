# Brief = passport columns + limitations always visible

**Date:** 19 November 2026  
**Surface:** `/research/workspace` decision brief panel  
**Doctrine:** Business vision execution audit — next PR #2 after USP A/B/C trails.

## User problem

Researchers need an evidence-linked draft brief where **passport columns and limitations stay visible** without hunting through collapsed markdown, and without claiming export acceptance.

## Implements

- `LiveBriefDecisionPanel` on the live workspace
- Always-visible limitations list (from Brief v2 + run gaps)
- Always-visible passport evidence table in the brief panel
- Honesty: `briefAccepted=false`, `verificationGatePassed=false`, locator ≠ proof
- Markdown remains an optional preview; exports stay draft-labelled

## Reused

- `exportLiveBriefV2` / `renderLiveBriefV2Markdown`
- `liveInvestigationPassportEdges` + `PassportEvidenceTable`
- E2E-07 soft-land honesty catalog (does not claim acceptance)

## Still blocked

- Owner export acceptance / staging journey exit
- Passage-linked dose/sample fields remain “Not stated” on live retrieval
- Production writes off

## Tests

- `bun test test/liveBriefPreview.test.ts`
- Playwright `site/e2e/live-investigation.spec.ts` (limitations + passport columns visible)

## Gates

No PHI · no Gate C auto-approve · no invented context · soft-land green ≠ brief acceptance.
