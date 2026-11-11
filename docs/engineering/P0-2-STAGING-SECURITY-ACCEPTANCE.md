# P0.2 persistence activation — staging security acceptance

**NO-GO.** Migrations 024, 025 and 026 remain held. Do not set `HSI_CONTRADICTION_STAGING_ACTIVATED`.

## Implemented in this change
- Same-parent reviewer/submitter identity validation in PostgreSQL.
- Rejection of self-review in PostgreSQL.
- Unique decision per contradiction, preventing simultaneous conflicting final decisions.
- No public grants, no permissive RLS policy, no production database changes.

## Required before activation
1. Implement a non-spoofable database principal binding: authenticated server session resolved in a DB-controlled function or equivalent reviewed mechanism. Client-controlled `SET`/GUC values are unacceptable.
2. Enforce least-privilege PostgreSQL role with no BYPASSRLS, no table ownership, no direct unauthorized writes.
3. Add tenant-scoped RLS read/write policies or narrow audited SECURITY DEFINER functions. Confirm every grant and search_path; review any function owner bypass.
4. Confirm verified tenant memberships, reviewer authority, and revocations are checked atomically during writes. Existing service application checks are not a DB security boundary.
5. Create **two verified identities and two isolated tenants** on a dedicated HSI staging branch. Test positive researcher submission and independent reviewer decision.
6. Negative E2E: cross-tenant read/write, forged session, revoked membership, unauthorized reviewer, self-review, duplicate decision, concurrent decisions, UPDATE/DELETE, wrong parent submitter, DB role privilege escalation.
7. Test staging migration/rollback and HTTP endpoints with receipts, CI, owner approval. Only then remove held migration IDs and activate on staging.

## Known limits
- Existing reviewer authority has SSc/RA scope constraints.
- This change is not an operational RLS policy or E2E test.
- The existing transactional service has a default-off flag but is not a substitute for database authorization.
- Ricard–Ly source extraction and independent scientific adjudication remain incomplete.
