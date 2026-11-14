# Deployment, testing and acceptance runbook

Requirements A01–A12. Local implementation only; no provider activation, migration, remote merge or deployment is authorised by this document.

## Review sequence

1. Inspect remote main and open PRs. Audit main `3b66fa69b117243fa4b0fd333f34b7cb962abbb9`; local homepage/context changes integrated without conflict. Keep open PR #327 live wiring separate. Record final tested SHA before release.
2. Run `bun run test` (not unscoped `bun test`, which attempts Playwright files with the wrong runner), `npm run typecheck`, site `npm run build`, `git diff --check`. Run targeted browser specs with the site's Playwright configuration, then CI-required browser/accessibility/performance/status/audit checks before proposing a merge.
3. Manually verify `/`: all six departments, real source inspection, zero-coverage states, retained selected context, search/condition narrowing, pinned export and workspace reopen. Verify `/research/knowledge-graph` department URL reload, right-side original source and three-hop refinement; mobile keyboard/filter/overflow behaviour. Browser specifications: [atlas-departments.spec.ts](../../site/e2e/atlas-departments.spec.ts), [homepage-discovery.spec.ts](../../site/e2e/homepage-discovery.spec.ts), [research-network.spec.ts](../../site/e2e/research-network.spec.ts). Tests using route fixtures do not prove authentication or persistence.
4. Record exact artifact SHA and all failed/skipped checks. A local build is not Vercel deployment evidence. [.github/workflows/research-foundation.yml](../../.github/workflows/research-foundation.yml) says site-deployment builds without deploying; actual Vercel deployment/health/API/snapshot checks are separate. The history hygiene workflow now triggers on every pull request and main push, without path filters. Its explicit limitation is coverage of fetched refs; a clean scan is not proof about unavailable/deleted history.

## Acceptance gates

| Gate | Required evidence before acceptance |
|---|---|
| Engineering | Root/site/API checks pass at exact SHA; all six entries and unchanged record identities; invalid facet/depth/query fail closed; pinned source/context export |
| Next-A source/provider | Approved independent source service/owner/terms, trusted clearance and revocation store, two approved deployments, real redacted receipts, network/deadline/overflow/retry/cancellation/budget fault tests |
| Next-B persistence/security | Approved isolated staging target/accounts/security signer, actual migration ledger and least-privilege pooled roles, separate schema-scope rehearse/rollback, cross-tenant denial/session revocation/concurrency/restore evidence |
| Scientific | Exactly 120 final HSI-BENCH-IMMUNO cases (50 core/30 disease/20 cross-domain/20 governance), separate development set, restricted locked answers/family splits, two independent expert assessments and adjudication; preregistered subgroup floors and hard provenance/safety gates. No invented reviewers or synthetic gold |
| Operations | Durable worker instead of long serverless request; persisted redacted execution IDs, shared quotas, idempotent recovery/dead-letter, actual alert delivery and named on-call/security owners. Proposed 14-day 99.5% authorised API success, p95 read <2s, job ack <1s, locked cost cap, RPO <=24h/RTO <=4h require measured approval/evidence |
| Release | Signed scientific/security/operations packet for exact tested artifact/config, independent human review, provider/write kill-switch and rollback. Production remains unchanged until explicit release approval |

## Verification ledger for this increment

- Pre-change baseline after current main integration: 2,090 pass, one optional live test skipped, zero failures.
- First targeted department/projection run: 24 pass, 1,461 assertions, zero failures. Includes synthetic fixtures for all six department annotations; production records were not extended to simulate coverage.
- Final type/build/unit/browser results must be appended after execution. No live provider, DB isolation, expert adjudication, external alert, restore or soak test is performed by this local increment.

## Blockers and practical next PRs

1. This scoped PR: six-department read navigation/search/continuity plus these reconciled documents. Depends only on existing snapshot/API. No new DB migration.
2. Reviewed ontology/source pack and candidate→governed mapping, with ambiguous identity and licence/retraction tests. Requires curator and source-policy approval; do not fabricate MONDO IDs.
3. Server-bound graph task context, investigator/verifier invocation, redacted persisted execution receipts and public/private separation. Depends on Next-A/B and independent review, coordinates with #327 instead of replacing it.
4. Cross-domain saved version/review/brief acceptance, each migration scope separately reviewed. Depends on actual identities/grants/least-privilege evidence, not public export.
5. Locked benchmark and operational pilot packet. Recruitment/authoring templates may proceed; invitations/case sharing require approved recipients/budget/private workspace. No real panel or gold is established by repository checklists.

Rollback of this UI slice: revert its code commit and rebuild at last accepted artifact; no database state to reverse. Production rollback, migration restore and provider kill-switch evidence must be rehearsed on the approved staging target independently.

### Final local verification (13 November 2026)

- Core regression suite: **2,096 pass, one optional live test skipped, zero failures**, 128,631 assertions. Tests include new department/identity/search/context contracts and newly integrated main backend tests; none is a live-provider accuracy claim.
- Root and test type checks, site TypeScript, API/site build and whitespace checks passed. New browser specifications also passed static TypeScript validation.
- Manual browser checks: Genomics empty coverage with Butyrate selection retained; Microbiome original DIAB-001 mouse context; draft link preserved department/edge/version into workspace; Genomics selection and original edge survived reload; three-hop navigation worked; phone keyboard activation worked without horizontal overflow.
- Automated browser attempt **blocked before tests ran**: preview server could not bind `127.0.0.1:4178` (`EPERM`). No automated browser, Axe or Lighthouse pass is claimed. CI browser/accessibility/performance checks remain required before merge.
- Preview artifacts: `outputs/collective-design/atlas-six-departments-home.jpg` and `atlas-six-departments-mobile.jpg` in the user's Codex workspace. Local preview remains port 4187. No remote push, PR creation, merge, Vercel deployment, production write or model call was performed for this slice.
- The complete root `bun run check` pipeline also passed (copy/status, type/lint, unit/benchmark-contract/data/readiness checks and library build). It regenerates dated discovery/domain artifacts; those generated changes were discarded to preserve the existing pinned candidate release. No new scientific snapshot is published by this slice. Fresh exact-SHA CI remains required.
