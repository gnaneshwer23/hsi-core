# P0.2.5 isolated staging security acceptance

## Not yet executed
No migrations applied, no database roles/grants changed, no credentials collected, and no authenticated E2E run. The proposed procedures in migration 027 are **unreviewed** and held.

## Architecture
The proposed database API validates the opaque Neon Auth session inside the same database transaction as tenant membership, researcher/reviewer authority and append-only writes. It does not rely on a caller-supplied principal, tenant GUC or role claim. All functions have EXECUTE revoked from PUBLIC; **no runtime role has been granted access**.

## Security review blockers
- A reviewed dedicated function-owner role must be able to read Neon Auth and the protected tables without accidentally granting broad bypass rights. FORCE RLS applies even to table owners; test the actual role behavior.
- Verify all session token handling avoids SQL logs, traces and query observability. Ensure direct table DML is denied.
- Confirm reviewer scope matches the disease of the stored contradiction, not a freely chosen caller scope. Current procedure accepts p_scope and must be fixed before activation.
- Enforce and test read isolation; these procedures expose no SELECT/read API.
- Validate provenance and synthetic status on server, not only the caller.
- Verify role revocation, duplicate/concurrent decisions, wrong tenant, self-review, forged session, rollback and immutable UPDATE/DELETE.
- Check the referenced hsi_research_access schema and table privileges in a disposable branch before deploying.

## E2E test matrix
Positive: verified researcher A submits to tenant A; independently verified reviewer B (authorized for same disease) reviews A; read visible only to authorized tenant A members.
Negative: tenant B read/write; A reviews own record; B with revoked membership; expired/forged session; reviewer without disease scope; duplicate and concurrent reviews; UPDATE/DELETE; direct table access; invalid evidence and wrong parent submitter.
Evidence: two real verified users, two isolated tenants, audit receipts, sanitized HTTP requests/responses, rollback and security reviewer sign-off.

## Activation
Migrations 024-027 remain held; no production changes. Never enable staging write flag before the matrix passes and owner approves staging migration.
