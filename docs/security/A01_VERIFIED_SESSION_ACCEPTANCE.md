# A-01 preview authorization migration — HELD

**Not production-ready. Do not execute the SQL without explicit preview approval and independent DBA/security review.**

## Architecture
1. API verifies Better Auth session using Neon Auth and active researcher grant.
2. The live adapter accepts only the same verified in-memory actor object (WeakMap), consumes its session token once, and binds the token transaction-locally.
3. RLS calls a SECURITY DEFINER database function that independently revalidates the token against Neon Auth and current research access, returning the owner ID. The caller cannot substitute a different owner merely by changing an owner-ID GUC.
4. The dedicated hsi_live_runtime role is neither table owner nor function owner and must have NOINHERIT/NOBYPASSRLS, no CREATE on public, no access to neon_auth.session, no elevated role membership, and only SELECT/INSERT/UPDATE on the live table.
5. A stolen valid session token remains a credential compromise; the token-bearing custom setting must never be logged or exposed. Verify statement logging, monitoring and connection pooling behavior.

## Before preview execution
- Verify exact auth table names, schemas, grant types, token storage format and migration ordering on the isolated HSI Neon preview branch.
- Verify function owner, search_path, definer privileges, table grants, function EXECUTE privileges and absence of additional permissive RLS policies.
- Review migration SQL for SQL injection, privileged function abuse, token exposure, session revocation and role escalation.
- Run adversarial live DB tests for two researchers, forged owner GUC, invalid/expired/revoked token, stale access, cross-user list/get/create/revise, connection reuse, concurrent requests, rollback, idempotency and export.
- Keep liveEvidenceWritesEnabled=false until signed acceptance evidence exists. No production migrations.

The SQL in docs/security/a01_verified_session_policy_preview.sql is a **proposal**, not an executed migration.
