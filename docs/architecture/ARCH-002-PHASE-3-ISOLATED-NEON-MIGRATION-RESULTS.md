# Phase 3 isolated Neon migration execution report — 2026-11-04

## Scope and approval
User explicitly authorised migrations 011 and 012 on disposable Neon branch hsi-disposable-branch only, after security validation. HSI project hsi-neon-project, database neondb. Production hsi-production-branch and staging hsi-staging-branch were not targeted.

## Preflight
- Confirmed disposable branch exists, is ready, non-default and non-production.
- Confirmed graph/dossier tables did not exist.
- Reviewed migrations 011 and 012. Identified missing graph RLS, missing dossier immutability and absent semantic-version constraints.
- Added db/migrations/013_hsi_lhkg_isolated_security_hardening.sql for these safeguards.

## Execution
- Executed equivalent SQL for migrations 011, 012 and security hardening 013 as a single Neon SQL transaction on disposable branch.
- Transaction returned success for all 20 SQL statements.
- No fixture records, user grants, permissive RLS policies, secrets, production migrations or deployments were added.
- SQL was executed directly through the Neon connector, not through the repository migration runner; migration ledger hsi_schema_migrations was not updated. Do not rerun migration runner blindly: reconcile ledger and schema first.

## Postflight verification
All three tables exist: hsi_lhkg_nodes, hsi_lhkg_relationships, hsi_lhkg_dossiers.
For each table, pg_class confirms relrowsecurity=true, relforcerowsecurity=true.
For each table, pg_policies count=0, noninternal trigger count=1, semver constraint count=1.
PUBLIC table privileges revoked. No permissive policies installed.

## Residual risks / next gates
- RLS without policies is fail-closed for ordinary roles, but table owners, superusers and BYPASSRLS roles require separate privilege review. Do not expose owner credentials to web handlers.
- No actual negative tests under a non-owner least-privilege role have been executed.
- Current graph/dossier readers connect separately and do not enforce a single atomic version-pinned snapshot.
- Current schema does not have FK or version-pinned endpoint references; physical evidence integrity and payload-column consistency remain unverified.
- No authorised researcher grant, live scientific evidence or API request was exercised.
- Neon Auth test branch allows unverified signup; signup is not equivalent to researcher authorisation.
- No deployment or production change occurred.

## Gate decision
Isolated schema creation and deny-by-default structural checks: PASS.
Operational researcher API, DB role/RLS negative tests, scientific evidence integrity and end-to-end UI: NOT YET VERIFIED.
