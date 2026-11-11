# P1.10 — Staging integration acceptance gate

## Scope
Read-only inspection of the existing P1.4 Neon schema and the proposed P1.9 security posture. The inspector fails closed if evidence tables or constraints are missing, RLS/FORCE RLS is absent, the dedicated app role does not exist, has BYPASSRLS or superuser privileges, owns evidence tables, or expected tenant policies are absent.

This inspection is **not a security proof**: textual inspection of policy expressions cannot establish tenant isolation or role grants. Separate live negative tests are mandatory.

## Acceptance sequence
1. Review and approve the P1.9 staging-only migration. Verify the dedicated application role is non-owner, non-superuser and non-BYPASSRLS. Do not apply to production.
2. Apply approved SQL to the isolated staging branch; run the read-only inspector.
3. Configure a real server-only Neon driver pool and a trusted signed-session verifier; never expose app-role credentials to browsers.
4. With synthetic data and restricted app role, prove: no session -> denied; no tenant claim -> denied; tenant A cannot read/write tenant B; invalid idempotency key -> denied; same key retry -> idempotent; conflicting retry -> rejected; self-review -> denied; independent review -> one immutable event; failed review -> rollback.
5. Review logs, audit records, migration diffs and CI before merging.

## Current status
P1.4 schema deployed to isolated staging; P1.9 migration NOT applied; application role and policies NOT verified; live E2E tests NOT run. Scientific production release remains NO-GO.
