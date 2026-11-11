# A-01 security remediation and acceptance gate

**Status: HELD.** This change adds a read-only preflight inspector and unit tests. It neither applies SQL nor enables live writes.

## Why this cannot be enabled by merging code alone
The verified-session migration in `docs/security/a01_verified_session_policy_preview.sql` requires independent DBA/security review and exact validation of Neon Auth schemas, function owner, role grants, RLS policy semantics, session expiry/revocation and connection-pooling behavior. A-01 does not authorize access to patient records or unreviewed publication to the trusted scientific graph.

## Mandatory sequence
1. Independent DBA/security reviewer inspects proposed SECURITY DEFINER function, fixed search_path, function owner privileges, token-bearing GUC risks, EXECUTE grants, existing permissive policies, default PUBLIC privileges and runtime role memberships.
2. On isolated preview branch only, confirm actual auth and research-access schemas, verify grant and session revocation behavior, record a signed reviewer decision.
3. Only after approval, provision dedicated least-privilege runtime role and apply the reviewed migration through an explicitly authorized preview-only operation.
4. Run read-only `inspectA01Preview` against preview DB and capture results. This inspector is **necessary but not sufficient**: it does not verify all role memberships, grants, policy correctness, authentication semantics or token safety.
5. Execute real integration tests using two independent verified researcher sessions: cross-owner list/get/insert/update/export; forged owner GUC; client-injected session token; expired/revoked session; removed research grant; concurrent and pooled connections; rollback and repeat operations. Confirm no unauthorized rows returned or changed.
6. Obtain signed security acceptance and evidence artifacts before considering any feature flag change. Production needs its own explicit approval and migration process.

## Required invariants
- `liveEvidenceWritesEnabled=false` until every gate passes.
- No patient-data access is granted by A-01.
- Candidate/researcher-proposed evidence is never published as approved graph knowledge.
- Do not treat a passing CI suite or a read-only preflight as independent security sign-off.
