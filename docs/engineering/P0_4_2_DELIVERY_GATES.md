# P0.4.2 delivery and security gate

## Code now present
- Authenticated pinned ISI graph staging: `src/adapters/isiAuthenticatedStaging.ts`.
- Scientific reviewer decision validation: `src/adapters/isiScientificReviewEvent.ts`.
- HSI-only persistence proposal: `db/migrations/019_hsi_isi_research_review.sql`.
- Independent reviewer persistence service: `src/db/isiScientificReviewStore.ts`.
- Tests: `test/isiScientificReviewEvent.test.ts`.

## Important: not yet a completed production workflow
- Migration 012 is **not applied**. Default-deny FORCE RLS has no service policy; writes must remain blocked until a least-privilege role and policies are designed, independently reviewed and tested.
- The intake service stages a verified artifact in memory. It does **not** yet persist a release, and no immutable publisher manifest has been pinned from a verified ISI commit.
- The review service is not exposed as an authenticated API endpoint. No browser can submit decisions through it yet.
- Review submission needs a trusted server-side source for `submittedBy`, not an arbitrary caller field, and must validate claim/ontology identifiers against the pinned release before enabling writes.
- Independent reviewer authority currently checks the SSc scope; future disease scopes require explicit grants.
- No database, E2E, deployment or production review persistence validation has been performed.

## Next mandatory acceptance gates
1. Obtain a trusted publisher manifest from an immutable ISI commit and pin the digest outside the requester-controlled payload.
2. Apply the migration to isolated HSI staging only after reviewing RLS, roles, privileges and immutable triggers.
3. Add a transactional authenticated release import with source provenance and idempotency.
4. Add reviewer-only API that derives identities from trusted session and submission records, not the browser.
5. Verify independent reviewer decisions and retrieval of append-only audit history using staging integration tests.
6. Connect authorised review queue to the P0.3 workbench, run end-to-end tests and verify deployed behaviour.

**Do not begin P1 until all six gates pass.**
