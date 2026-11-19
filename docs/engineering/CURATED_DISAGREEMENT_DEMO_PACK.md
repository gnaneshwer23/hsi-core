# Curated disagreement demonstration pack

**Date:** 19 November 2026  
**Surface:** `/research/workspace`  
**Doctrine:** Business vision execution audit — Next five PRs item **5**.

## User problem

Demo USP A (explain scientific disagreement) with a small, reviewable set of public cases without claiming scientific gold or SME adjudication.

## USP advanced

**USP A** (with sealed-graph context for **USP B** questions where relevant).

## Reused

- Sealed domain graph (`site/public/research/domain-graph/graph.v1.json`)
- `compareDomainEvidence` + Evidence Context Passport
- Homepage worked-conflict pair `DIAB-003` / `DIAB-015`
- Live workspace shell (no new dashboard)

## Implemented (this increment)

- Catalog of five edge-pair refs: `src/investigation/curatedDisagreementPack.ts`
- Runtime resolver `buildCuratedDisagreementPack(bundle)` with fail-closed honesty
- Workspace panel: curated cases → context differences → dual passports
- Unit tests against the sealed graph snapshot

## Still mocked / partial / blocked

- Not scientific acceptance / not gold vault
- Locators remain unverified bibliographic candidates where the graph says so
- Neon contradiction ledger held
- No Gate C / SME adjudication
- Production writes remain off

## Tests

- `bun test test/curatedDisagreementPack.test.ts`
- Playwright `site/e2e/live-investigation.spec.ts` (curated pack section)

## Gates

No PHI · no invented DOIs/passages · confirmed contradiction stays false · demonstration only.

## Success outcome

A researcher (or reviewer) can open `/research/workspace`, pick a curated case, and see why two sealed-graph candidates may differ — with dual Context Passports — without the product claiming the disagreement is proven or gold.
