# P0.2.12 — Authenticated security acceptance: live staging preflight

**Release: NO-GO. No production deployment or activation authorized.**

## Verified on 2026-11-11
Project `red-wave-06625195`, isolated staging branch `br-shiny-cherry-zagwwdi8`:
- `hsi_contradiction_function_owner`: NOLOGIN, NOBYPASSRLS, non-superuser.
- `hsi_contradiction_runtime`: NOLOGIN, NOBYPASSRLS, non-superuser.
- No dedicated `hsi_contradiction_*` LOGIN role.
- Four synthetic `hsi-p0210-*@example.com` identities; **zero verified users**.
- **Zero active Neon Auth sessions** for those identities.
- **Zero contradiction ledger records**.
- Adapter on main uses restricted create/review stored procedures, but authenticated E2E has not run.

## Critical path
1. **Real sign-in**: replace reserved `example.com` fixture identities with controlled test mailboxes or a verified Neon Auth testing mechanism; never fabricate sessions, mark emails verified manually or log tokens. Isolate all users to staging.
2. **Restricted connection**: create a LOGIN role with NOINHERIT/NOBYPASSRLS and only required membership in `hsi_contradiction_runtime`. Do not use Neon role creation defaults that grant `neon_superuser`, blanket read-only or read-write privileges. Deliver credentials through a secret manager, not GitHub.
3. **Least privilege preflight**: check `current_user`, role membership, superuser/BYPASSRLS flags, direct SELECT/INSERT/UPDATE/DELETE denial on records, review events, memberships and auth tables; confirm EXECUTE only on approved create/read/review functions.
4. **Authenticated two-tenant matrix**:
   - A researcher create in A; B researcher create in B; A/B own-tenant scoped read; independent same-tenant review.
   - A cannot create/read/review B and vice versa.
   - Researcher cannot self-review; reviewer cannot review without tenant membership or disease authority.
   - Unverified, expired, revoked, impersonated and banned sessions rejected.
   - Revoked researcher membership, reviewer authority and global research grant rejected.
   - Duplicate review, concurrent review, invalid evidence schema, tampered snapshot and unsupported disease scope rejected.
   - Check audit event immutability, source locator and no scientific conclusion promotion.
5. **HTTP path**: authenticated route tests and sanitized CI receipts. Require separate independent security and scientific sign-offs.

## Acceptance evidence template
For each case record: case ID, tested principal/tenant, setup fixture version, expected result, actual result, timestamp, CI/job URL and sanitized database evidence. Record every failure as a blocker; never label a case PASS without execution.

## Known remaining gap
Database snapshot integrity trigger validates top-level consistency, not independent canonical evidence authenticity. This must be addressed before scientific evidence promotion. Migration holds 024–029 remain in place.

**No sign-off is claimed by this document.**
