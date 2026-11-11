# P1.6 — Neon Staging Integration Verification

## Environment discovered
Neon project `human super intelligence` (`red-wave-06625195`) exists in AWS eu-west-2. Vercel creates separate preview database branches, including `preview/feat/p1-5-transactional-evidence-review-20261111` (`br-patient-wind-zaqag54x`). The production database branch is `br-quiet-silence-zab1zvji`; do not run P1.4 migrations on production.

## Implemented
A **read-only** schema inspector checks whether P1.4 snapshot/review tables exist and have row-level security, FORCE RLS and expected uniqueness/primary-key constraints. Unit tests check absent tables and disabled RLS. This inspector neither connects automatically nor runs migrations.

## Staging acceptance sequence
1. Choose an isolated non-production Neon branch and review its inherited data before any write.
2. Review P1.4 SQL and correct service role policies and RLS for the intended deployment.
3. Obtain explicit approval before applying schema migrations to the selected staging branch.
4. Implement a real Postgres transaction adapter, with tenant authorization bound to the database transaction.
5. Run read-only schema inspection and then opt-in rollback, idempotency, concurrency, forged-reviewer and cross-tenant tests using synthetic data.
6. Confirm event immutability and durable review queue processing, plus gateway authentication and source snapshot verification.
7. Document trace IDs, CI and security sign-off; never equate a reviewer status with scientific validation.

**Current decision:** schema inspector committed; no Neon migrations applied; no real database integration test executed; production release NO-GO.
