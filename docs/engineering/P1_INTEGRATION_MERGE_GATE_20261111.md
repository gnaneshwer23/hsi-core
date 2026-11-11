# Integration merge gate — P1.4 through P1.11

Audit date: 2026-11-11. Target: `main`; candidate: `integration/p1-4-p1-11-ci-hardening-20261111` (PR #211).

## Verified GitHub facts
- Latest predecessor P1.11 commit `ecd0783583f54e77361648efcb6b15cace4bfe7e` completed GitHub Actions successfully (run 42931309248).
- Consolidated candidate originally diverged from `main`: 80 commits ahead / 3 behind before the two migration archive commits.
- Main's newer changes include public site copy, navigation, SEO and Playwright E2E tests. Preserve these during reconciliation.
- CI run 42931889241 is associated with candidate head `ed1d5a387743b64462ea6e8d43e54e6a02703a26`; verify completion before any merge.
- P1.9 staging policies were already applied; archived their non-idempotent SQL from `db/migrations/` to `docs/engineering/sql/` to prevent accidental replay.

## Required before merge
1. Reconcile the 3 newer main commits without dropping either public-site changes or evidence-service changes.
2. Review diff and migration ledger; run root `bun run check` and site checks, confirm GitHub Actions required checks green on reconciled head.
3. Verify no real production credentials, staging-only role grants or unreviewed scientific claims are exposed.
4. Review and merge PR #211 only after GitHub reports it mergeable. Close or retarget superseded stacked drafts deliberately; do not merge each blindly.

## Separate beta gates (not required to merge guarded code)
- Real trusted session verifier and production-safe restricted database role/driver.
- Authenticated submit/review E2E, cross-tenant writes, reviewer independence, idempotency/concurrency and audit tests.
- Scientific approval is independent of application deployment.
