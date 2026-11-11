# P1.12.5 staging acceptance evidence — 2026-11-11

## Scope
Read/write SQL tests ran only on HSI Neon project `<HSI_NEON_PROJECT_ID>`, staging branch `<HSI_STAGING_BRANCH_ID>`. Production was not accessed or modified.

## Observed database checks
- FORCE RLS enabled on evidence snapshots and review events.
- Five tenant RLS policies are present.
- `hsi_evidence_app` is NOLOGIN, NOSUPERUSER, NOBYPASSRLS.
- Staging-only `hsi_evidence_staging_login` is LOGIN, NOSUPERUSER, NOBYPASSRLS, password unset, member of `hsi_evidence_app`. It cannot authenticate independently until credentials are securely configured.
- With transaction-local `SET LOCAL ROLE hsi_evidence_app` and tenant setting, a synthetic organisation-A snapshot was visible to A and invisible to B.
- Organisation-B scoped INSERT into organisation A was rejected with SQLSTATE 42501.
- Organisation-B scoped UPDATE of A affected zero rows.
- Repeating the same synthetic INSERT with `ON CONFLICT DO NOTHING` returned no duplicate.
- Synthetic review event INSERT and pending-to-accepted snapshot status transition succeeded.
- `hsi_evidence_app` has neither UPDATE nor DELETE privileges on review events.
- A multi-statement transaction inserting a snapshot then attempting an invalid review decision was rejected with SQLSTATE 23514. Subsequent independent query confirmed **zero** snapshots and **zero** events from that failed transaction.
- All synthetic committed records from earlier tests were deleted using the staging owner after testing; final verification found zero remaining test records.

## Explicit limitations
- Tests used the database owner connection with `SET LOCAL ROLE`; they do **not** prove a separate login credential, direct application connection, or protection against a malicious caller that can set arbitrary tenant claims.
- No real Better Auth session, trusted organisation resolver, HTTP request, or service-layer reviewer independence was exercised.
- No simultaneous competing reviewer transactions were executed.
- No production migration or public API activation.

## Release blockers
1. Configure a dedicated staging-only secret for the restricted LOGIN role; never expose the password in commits, logs or client responses.
2. Verify `current_user`, role grants and FORCE RLS through a **direct connection** as that login.
3. Connect trusted organisation membership and verified provider session to the evidence service.
4. Run synthetic full API submit/review tests, independent reviewer checks, concurrent decision attempts, idempotency and cleanup through the actual restricted application role.
5. Review CI and security sign-off for the stacked PR chain #212–#216 before any merge or deployment.

This document records observed evidence only; P1.12.5 is not fully accepted.
