# Scientific investigation v1 — acceptance

Date: 2026-11-10. Baseline commit: `625033d` (main, merge of #176). This document does not claim production readiness, clinical validation, or a completed scientific review.

## Implementation truth

Recent pull requests #159–#176 are public-site and homepage work (knowledge graph explorer, hero, intestine marker, intelligence-flow cards). They do not add a new disease model or a live research write path.

`docs/STATUS.md` is generated from `operations/capability-register/capability-register.v1.json`. Levels below use that vocabulary. A row that is implemented and also synthetic or blocked is **partial**.

| Workflow | Classification | Where it lives | Notes |
| --- | --- | --- | --- |
| Research outcome projection | Deterministic | `src/researchOutcome.ts` | Compiles a saved evidence brief. No new literature search. |
| R3 Ask → export workbench | Fixture, live writes blocked | `src/researchConnectedWorkbench.ts` | `writesEnabledClaimed` is false. |
| Gut and neuro seed packs | Fixture, citations checked | `src/seed/gutScfaMucosal.ts`, `src/seed/neuroVagusCholinergic.ts` | PMIDs rechecked on PubMed 2026-11-10 for the investigation subset. |
| Interrogative API and Neon session | Genuinely connected when staging env is set; otherwise blocked | `src/server/vercelResearch.ts` | Writes require `HSI_RESEARCH_WRITES_ENABLED`, the staging branch pin, and the staging host pin. Default remains off. |
| Auth gateway | Blocked without deployment config | `src/server/neonAuthGateway.ts` | Missing `HSI_PUBLIC_ORIGIN`, `HSI_AUTH_BASE_URL`, or `HSI_DATABASE_URL` returns configuration required. |
| Gold / SME evaluation | Stubbed scores | `src/goldEvaluationSuite.ts` | No scientific scores. |
| New gut–immune investigation | Deterministic fixture | `src/scientificInvestigation.ts` | One record, six outputs, four tiers. Not a live retrieval. |
| Personal workspace and community | Fixture API, schema held | `src/researcherWorkspace.ts` | Example labels only. HTTP writes return 403. |
| Migrations 020 and 021 | SQL matches the docs that say they are released for apply | `db/migrations/020_hsi_lhkg_rls_policies.sql`, `db/migrations/021_hsi_hitl_questions_outbox.sql` | 020 is reader-only RLS and is not held. 021 creates the question outbox and rejects patient delivery. Applying them is still an operator action. This audit did not query Neon, so applied-or-not is **not** asserted. |
| Migrations 022 and 023 | Committed, held, not applied | `db/migrations/022_hsi_scientific_investigation_records.sql`, `db/migrations/023_hsi_researcher_workspace_community.sql` | See owner steps below. |

Locally testable: unit tests, the `/research/investigate` demo, example workspace pages, and fail-closed API responses. Blocked on external configuration: staging auth, research writes, Neon apply, source-rights clearance, expert scoring, HDR UK access, and clinical safety cases (DPIA, DCB0129, DCB0160). Those safety cases are not started in this repository.

## Capability acceptance

| Capability | Status | Evidence | Required next action |
| --- | --- | --- | --- |
| Question → evidence → relationships → comparison → contradictions → gaps → hypotheses → review → report → export | Implemented and tested, synthetic | `src/scientificInvestigation.ts`, `site/src/pages/ScientificInvestigation.tsx`, `test/scientificInvestigation.test.ts`, `site/e2e/scientific-investigation.spec.ts` | Independent scientific review before any claim is called verified |
| Four evidence tiers | Implemented and tested | Same record. Verified evidence count is 0 | Do not promote a PMID check into verified biology |
| Bidirectional provenance | Implemented and tested | `sourcesForClaim`, `claimsForSource` | Passage text still needs rights clearance |
| Save, reopen, export | Implemented and tested for a browser copy and an authorised in-memory workspace. Live Neon save is blocked | `InvestigationMemory`, JSON and Markdown export, print stylesheet | Apply migration 022 only after review, then connect a store. Do not enable production writes |
| Human review cannot self-approve | Implemented and tested | `recordIndependentReview` | A named reviewer, not “Example reviewer”, for any real comment |
| Personal dashboard | Implemented but blocked, synthetic | `site/src/pages/ResearcherHome.tsx` | Apply 023; keep notifications in-app |
| Community share, comment, report | Implemented but blocked, synthetic | `site/src/pages/ResearchCommunityFeed.tsx`, `src/server/researcherWorkspaceApi.ts` | Opt-in stays mandatory. Name a moderator before reports go anywhere |
| Evaluation harness | Implemented and tested as structure only. Scores are missing | `src/scientificAccuracyHarness.ts` | Expert review of `evaluation/scientific-investigation/reference-questions.json` |
| HDR UK catalogue | Implemented as metadata. Access not requested | `DATASET_CATALOGUE` in `src/scientificInvestigation.ts` | Access applications are the owner’s, outside this repo. Do not ingest rows |
| Homepage hero wording | Implemented in a separate change | `site/src/components/editorial/HomeHero.tsx` | Keep “first scientific investigation”, not a validation claim |
| Demo review labels, title, badge | Implemented in a separate change | `site/src/lib/reviewEventLabel.ts`, `site/src/lib/seo/siteSeo.ts` | None for this wording |

## Source-rights clearance (minimum set)

No passage text was copied. Bibliographic metadata was read from PubMed on **2026-11-10**. Titles and first authors match the seed citation labels.

| Source | What was used | Licence position | Clearance |
| --- | --- | --- | --- |
| PubMed records 24226770, 23828891, 24917457, 30918945, 19625695, 10839541 | PMID, DOI, title, first author | NLM record terms. Abstracts were not stored | Required before any abstract or quotation is kept |
| PMC3807819, PMC4263689, PMC6701512, PMC2728689 | Identifiers only | Open-access hosting is not a reuse clearance for this product | Required before full text is stored |
| Nature and Science full text for 24226770 and 10839541 | Not retrieved | Publisher licence | Required |
| Open Targets | Not queried by this investigation | Confirm the current Open Targets licence before any association table is stored | Not started |
| Reactome | Not queried | Confirm the current pathway licence before import | Not started |
| HDR UK Gateway datasets 700 (UK Biobank), 889 (Our Future Health Linked Health Records), 355 (Welsh Longitudinal GP / SAIL) | Name, custodian, access URL. Fetched 2026-11-10 | Governed access. Status: access not requested | Do not download participant data |

## Reference questions

`evaluation/scientific-investigation/reference-questions.json` is marked **DRAFT - awaiting expert review**. Reviewer name is null. Approved is false. The harness reports `not_yet_scored` for scientific accuracy, evidence support, contradiction detection, and gap usefulness. One question is the owner’s systemic sclerosis Tfh / IL-21 / B-cell example. It is a reference question, not a product boundary, and this change does not run it as a second disease product.

## Owner steps to apply Neon migrations

Do not run these until the SQL has been read. Do not change Vercel environment variables.

1. Confirm the database URL is the HSI Neon project (`hsi-neon-project` / `ep-hsi-production` or the pinned staging branch). `assertHsiNeonDatabaseUrl` refuses other products.
2. Remove `022_hsi_scientific_investigation_records` and `023_hsi_researcher_workspace_community` from `HELD_MIGRATION_IDS` in `src/db/migrate.ts`.
3. From a gitignored environment: `bun run db:migrate`. Prefer `neonctl` OAuth. Do not paste a password into chat or into the command line.
4. Rollback text is at the top of each SQL file. Take a backup before dropping tables.

Until that happens, research writes stay fail-closed and community posts are not stored.

## What remains blocked

- Auth gateway configuration on the deployment (`HSI_PUBLIC_ORIGIN`, `HSI_AUTH_BASE_URL`, `HSI_DATABASE_URL`, staging pins).
- Source-rights clearance for passages.
- Expert reviewers and any scientific score.
- HDR UK (and UK Biobank, Our Future Health, SAIL) access applications.
- DPIA, DCB0129, and DCB0160. Not started here. No live clinical decision support and no PHI.

## Tests

On 2026-11-10 the investigation branch unit suite was 1392 pass, 1 skip, 0 fail (`bun test ./test`). This follow-up adds harness, workspace, and migration-hold tests. Browser: `site/e2e/scientific-investigation.spec.ts` passed locally against the production build (desktop walk-through and a 390px width check).
