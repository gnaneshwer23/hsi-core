# USP A — Explain scientific disagreement (live workspace trail)

**Date:** 19 November 2026  
**Surface:** `/research/workspace`  
**Doctrine:** Business vision execution audit — journey over dashboards.

## User problem

Researchers need to see **why findings may differ** (context, methods, verification), not a blended consensus score.

## USP advanced

**USP A** — Explain scientific disagreement.

## Reused

- `structuredComparison` / `liveRunComparison` / `liveBriefComparison`
- `EvidenceContextPassportView` + `liveClaimToPassportEdge`
- Existing live investigation run + brief exporters
- Run stage rail (`stageRail`)

## Implemented (this increment)

- Five-step USP A trail: Ask → Evidence → Passport → Why differ → Brief
- Ask strip on the workspace (link to Research Home Ask + reopen)
- First-class **Why findings may differ** panel with pairwise outcomes + dual Context Passports
- Decision brief panel promoted out of a nested accordion; auto-opens when pairs exist
- Pure helpers + honesty asserts: `src/investigation/uspADisagreementTrail.ts`

## Still mocked / partial / blocked

- Live passage-linked passport fields remain abstract-only on live retrieval
- Neon contradiction ledger held (022–030 family)
- No scientific gold / SME adjudication
- Production writes remain off; browser save only
- Org sharing (journey step 12) not in scope

## Tests

- `bun test test/uspADisagreementTrail.test.ts`
- Playwright `site/e2e/live-investigation.spec.ts` (comparison + dual passport)

## Gates

No PHI · no Gate C auto-approve · no invented context · potential contradiction ≠ proven · association ≠ causation.

## Success outcome

A researcher can run (or reopen) a live investigation and complete Ask → evidence → passport → structured why-differ (with dual passports) → brief on one page without leaving `/research/workspace`.
